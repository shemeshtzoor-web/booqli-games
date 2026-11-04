/* BOOQLI – בוט ההזמנות לסבים בוואטסאפ (Cloudflare Worker), 4.11.2026
   כל ההזמנה בתוך השיחה, בלי קישורים: ספר ← נכד/נכדה ← שם ← הקדשה ← תמונות ← שם המזמין ← עוד ספר? ← אישור ← סיכום.
   כפתור "🙋 לדבר עם בן אדם" רק בהודעה הראשונה (אפשר לחזור אליו תמיד), וגם כתיבת "בן אדם"/"נציג" – והבוט שותק בשיחה הזאת. גם כששמש כותבת בעצמה מהאפליקציה (coexistence) – הבוט שותק.
   שמש מחזירה את הבוט בשיחה ע"י הודעה "#בוט". הבוט עונה רק למי שכתב/ה משהו על סבים/נכד/ספר (TRIGGER) או לחץ/ה על כפתור שלו,
   כדי לא להפריע לשיחות אחרות (גנים, הורים).
   סודות (Cloudflare → Worker → Settings → Variables, כ-Secret – שמש מדביקה בעצמה, לא בצ'אט ולא במאגר):
     WA_TOKEN       – מפתח גישה קבוע (System User) של מטא
     WA_PHONE_ID    – Phone number ID של המספר
     VERIFY_TOKEN   – מילה סודית לחיבור ה-webhook (ממציאים)
     APP_SECRET     – App secret של האפליקציה במטא (לבדיקת חתימה)
   חיבורים: KV בשם STATE (אפשר אותו namespace של התמונות).
   כתובות: GET/POST /wa  ← webhook של מטא.  GET /p/<id>.jpg ← תמונות שהתקבלו (כמו בשרת התמונות).  GET /orders?k=VERIFY_TOKEN ← רשימת הזמנות. */

const GRAPH = "https://graph.facebook.com/v23.0";
const SITE = "https://games.booqli.ai";
const TRIGGER = /נכד|סבתא|סבא|סבים|ספר אישי|להזמין|הזמנה|booqli|בוקלי/i;
const MAX = 10, PICS = 5, SHIP = 40;
const TIERS = [[1, 132, 149], [2, 106, 123], [3, 94, 111], [4, 88, 105], [6, 80, 97], [8, 66, 83]];
/* 18 הספרים; img = כריכה JPG באתר (רק לספרים עם תצוגה מקדימה) */
const BOOKS = [
  ["birthday", "ילד/ת יום הולדת", 1], ["hugs", "חיבוקים", 1], ["superhero", "גיבור/ת על", 1], ["first", "הספר הראשון שלי", 1],
  ["class1", "עולה לכיתה א'", 1], ["kinder", "הולך/ת לגן", 1], ["savanna", "בסוואנה", 1], ["druki", "דרוקי הדרקון", 1],
  ["night", "אני והחד־קרן", 1], ["summer", "לשחות עם דולפינים", 1],
  ["sleep", "רציתי לישון, אבל...", 0], ["lucy", "איפה לוסי?", 0], ["dream", "רגע לפני החלום", 0], ["space", "המסע לחלל", 0],
  ["pacifier", "ביי ביי מוצץ", 0], ["diaper", "ביי ביי חיתול", 0], ["vikings", "הוויקינגים", 0], ["sibling", "אח/ות גדול/ה", 0]
].map(([id, name, img]) => ({ id, name, img: img ? `${SITE}/order/books/covers-jpg/${id}.jpg` : "" }));
const book = id => BOOKS.find(b => b.id === id);
const priceOf = n => { let t = TIERS[0]; TIERS.forEach(r => { if (n >= r[0]) t = r; }); return t[2]; };
const ils = n => n + " ₪";
const priceLine = n => { const p = priceOf(n), t = n * p, s = n * priceOf(1) - t; return `${n === 1 ? "ספר אחד" : n + " ספרים"}: ${n === 1 ? ils(p) : n + " × " + ils(p) + " = " + ils(t)}${s > 0 ? ` (חוסכים ${ils(s)})` : ""}`; };

function dedIdeas(g){
  const f = (m, w) => g ? w : m;
  return [
    `${f("לנכד האהוב", "לנכדה האהובה")} שלנו,\nהספר הזה נכתב בשבילך, כי ${f("אתה הגיבור", "את הגיבורה")} של הלב שלנו. ${f("שתמיד תגדל", "שתמיד תגדלי")} עם חיוך גדול, סקרנות ואומץ, ${f("ותדע שאתה יכול", "ותדעי שאת יכולה")} להגשים כל חלום שרק ${f("תרצה", "תרצי")}. בכל פעם ${f("שתפתח", "שתפתחי")} את הספר – ${f("תזכור", "תזכרי")} כמה אנחנו גאים בך ואוהבים אותך, היום, מחר ובכל יום. שהספר הזה ילווה אותך בחום ובאהבה.\nבאהבה גדולה, סבא וסבתא ❤️`,
    `${f("לנכד היקר", "לנכדה היקרה")} שלנו,\nמהיום שנולדת העולם שלנו נעשה צבעוני ושמח יותר. אנחנו מאחלים לך לב טוב, חברים אמיתיים והמון הרפתקאות מופלאות. ${f("זכור", "זכרי")} תמיד ${f("שאתה מיוחד, שאתה אהוב", "שאת מיוחדת, שאת אהובה")}, ושסבא וסבתא תמיד כאן בשבילך – לחבק, להקשיב, לצחוק ולשמוח איתך בכל רגע. העולם מחכה לך – ${f("צא", "צאי")} לגלות אותו.\nאוהבים אותך עד השמיים, סבא וסבתא ❤️`,
    `${f("לנכד המתוק", "לנכדה המתוקה")} שלנו,\nהספר הזה הוא מתנה קטנה עם אהבה ענקית. ${f("שתמיד תאמין", "שתמיד תאמיני")} בעצמך, ${f("תצחק", "תצחקי")} הרבה, ${f("תשאל", "תשאלי")} שאלות ${f("ותגלה", "ותגלי")} כל יום משהו חדש ומרגש. ${f("כשתקרא", "כשתקראי")} בו – ${f("תדע", "תדעי")} שבכל עמוד מחכה לך חיבוק חם מאיתנו. אנחנו כל כך גאים בך, ונמשיך לאהוב אותך תמיד, בכל גיל ובכל מקום. ${f("תהיה שמח ובריא", "תהיי שמחה ובריאה")}!\nסבא וסבתא ❤️`
  ];
}
const CONSENT = "אני מאשר/ת:\n1. קיבלתי אישור מההורים לשלוח ל-BOOQLI את התמונות של הילדים – כל תמונה ששלחתי או שאשלח כאן, עכשיו או בהמשך (גם לספר נוסף, או במקום תמונה שלא מתאימה) – כדי ליצור מהן איורים לספר.\n2. קראתי את התקנון ואת מדיניות הפרטיות של BOOQLI:\nתקנון: https://www.booqli.ai/he/terms-of-service\nמדיניות פרטיות: https://www.booqli.ai/he/privacy-policy";
const HUMAN_TXT = /בן אדם|בנאדם|נציג|אדם אמיתי|אדם אנושי/;

/* ===== שליחה לוואטסאפ ===== */
const HUMAN = { type: "reply", reply: { id: "human", title: "🙋 לדבר עם בן אדם" } };
async function wa(env, to, msg, log){
  const body = Object.assign({ messaging_product: "whatsapp", to }, msg);
  if (log) { log.push(body); return; }                       /* בבדיקות – רק רושמים */
  const r = await fetch(`${GRAPH}/${env.WA_PHONE_ID}/messages`, { method: "POST", headers: { "Authorization": "Bearer " + env.WA_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) console.log("wa send failed", r.status, await r.text());
}
const text = t => ({ type: "text", text: { body: t } });
const buttons = (t, bs) => ({ type: "interactive", interactive: { type: "button", body: { text: t }, action: { buttons: bs.slice(0, 3).map(b => b.type ? b : { type: "reply", reply: { id: b[0], title: b[1] } }) } } });
const list = (t, btn, rows, title) => ({ type: "interactive", interactive: { type: "list", body: { text: t }, action: { button: btn, sections: [{ title: title || "ספרים", rows }] } } });
const image = (link, caption) => ({ type: "image", image: { link, caption } });

/* ===== המסלול ===== */
const fresh = () => ({ book: "", ver: "", name: "", ded: "", dedI: 0, pics: [] });
const kid = c => c.ver === "g" ? "הנכדה" : "הנכד";

async function ask(env, to, st, log){
  const c = st.cur, n = st.list.length;
  const S = (m) => wa(env, to, m, log);
  switch (st.step) {
    case "hi": return S(buttons("שלום ❤️ כאן סבאבוקלי מ-BOOQLI!\nאני אעזור לכם להזמין ספר אישי שבו הילד או הילדה הם הגיבורים – כתוב ע\"י שמש צור, מנוקד ובחרוזים, בכריכה קשה עד הבית.\n\n👀 אדם אמיתי משגיח על כל התהליך.\n🙋 רוצים לדבר עם בן אדם? תמיד אפשר לחזור להודעה הזאת וללחוץ על הכפתור למטה – או פשוט לכתוב \"בן אדם\".", [["s:go", "❤️ מתחילים הזמנה"], HUMAN]));
    case "book": {
      const page = st.page || 0, part = page ? BOOKS.slice(9) : BOOKS.slice(0, 9);
      const rows = part.map(b => ({ id: "b:" + b.id, title: b.name.slice(0, 24) }));
      rows.push(page ? { id: "page:0", title: "⬅️ לספרים הקודמים" } : { id: "page:1", title: "➡️ עוד ספרים" });
      return S(list(`${n ? "איזה ספר לנכד הבא?" : "איזה ספר תרצו?"}\nלוחצים על "בוחרים ספר" ובוחרים מהרשימה.`, "בוחרים ספר", rows, page ? "עוד ספרים" : "הספרים"));
    }
    case "ver": {
      const b = book(c.book);
      if (b.img) await S(image(b.img, b.name));
      return S(buttons(`"${b.name}" – בשביל נכד או נכדה?`, [["v:b", "👦 נכד"], ["v:g", "👧 נכדה"]]));
    }
    case "name": return S(text(`איך קוראים ל${kid(c) === "הנכדה" ? "נכדה" : "נכד"}? ✍️\n(השם הזה יופיע בספר – פשוט כותבים אותו כאן)`));
    case "ded": {
      if (!c.ded) c.ded = dedIdeas(c.ver === "g")[0];
      return S(buttons(`הקדשה מכם ל${c.name} ❤️\n\n${c.ded}`, [["d:ok", "✅ מאשרים"], ["d:next", "✨ הקדשה אחרת"], ["d:own", "✍️ אכתוב בעצמי"]]));
    }
    case "dedown": return S(text("כתבו כאן את ההקדשה שלכם ❤️ (עד 300 תווים בערך)"));
    case "pics": return S(text(`עכשיו שולחים כאן תמונה של ${c.name} 📷\nאפשר כמה תמונות (עד ${PICS}) – ואנחנו נבחר את הטובה ביותר.\nתמונה ברורה, הפנים למצלמה.`));
    case "picsmore": return S(buttons(`קיבלנו ${c.pics.length === 1 ? "תמונה אחת" : c.pics.length + " תמונות"} ✓\nאפשר לשלוח עוד, או להמשיך.`, [["p:done", "✅ סיימתי תמונות"]]));
    case "who": return S(st.profile
      ? buttons(`לרשום את ההזמנה על השם "${st.profile}"?`, [["w:yes", "✅ כן"], ["w:other", "✍️ שם אחר"]])
      : text("ואיך קוראים לך? 🙂"));
    case "whoown": return S(text("איך לרשום את השם שלך? 🙂"));
    case "more": {
      const m = n + 1;
      let t = `כל הכבוד! 🎉 רוצים ספר גם לנכד נוסף?\n\n❤️ עכשיו – ${priceLine(m)}`;
      if (m < MAX && priceOf(m + 1) < priceOf(m)) t += `\n➕ עם עוד ספר – ${priceLine(m + 1)}`;
      t += `\n🚚 + משלוח עד הבית ${ils(SHIP)}\n\nככל שמוסיפים ספרים – המחיר של כל ספר יורד.`;
      return S(buttons(t, m < MAX ? [["m:yes", "➕ כן, עוד ספר"], ["m:no", "✅ לא, זהו"]] : [["m:no", "✅ זהו"]]));
    }
    case "consent": return S(buttons("לפני שנתחיל להכין ❤️\n\n" + CONSENT, [["c:yes", "✅ קראתי ומאשר/ת"]]));
  }
}

function summary(st, id, links){
  const n = st.list.length, t = n * priceOf(n);
  const lines = st.list.map((c, i) => `❤️ *ספר ${i + 1}: ${book(c.book).name}* (${c.ver === "g" ? "נכדה" : "נכד"})\n👤 שם: *${c.name}*\n✍️ הקדשה: ${c.ded}\n📷 ${c.pics.length} ${c.pics.length === 1 ? "תמונה" : "תמונות"}${links && c.pics.some(p => p.link) ? ":\n" + c.pics.filter(p => p.link).map(p => p.link).join("\n") : ""}`);
  return `📋 *סיכום הזמנה ${id}*\n👤 המזמין/ה: ${st.who}\n\n${lines.join("\n\n")}\n\n💰 ${priceLine(n)}\n🚚 משלוח עד הבית ${ils(SHIP)}\n*סה"כ ${ils(t + SHIP)}*\n\n✓ אישור ההורים לתמונות – התקבל`;
}

async function step(env, from, st, ev, log){
  const S = m => wa(env, from, m, log);
  const c = st.cur;
  const id = ev.id || "", txt = (ev.text || "").trim();
  if (id === "human" || (!id && HUMAN_TXT.test(txt))) { st.human = Date.now(); await S(text("בשמחה ❤️ שמש תענה לך כאן בהקדם (א׳–ה׳ 8:00–18:00).\nכשתרצו להמשיך בהזמנה – פשוט כתבו \"להמשיך\".")); return; }
  if (id.startsWith("page:")) { st.page = +id.slice(5); if (st.step === "ver") st.step = "book"; return ask(env, from, st, log); }
  switch (st.step) {
    case "hi": if (id === "s:go") st.step = "book"; break;
    case "ver": if (id.startsWith("b:") && book(id.slice(2))) { c.book = id.slice(2); break; }  /* בחרו ספר אחר מהרשימה */
      if (id === "v:b" || id === "v:g") { c.ver = id.slice(2); c.ded = ""; st.step = "name"; } break;
    case "book": if (id.startsWith("b:") && book(id.slice(2))) { c.book = id.slice(2); c.ded = ""; st.step = "ver"; } break;
    case "name": if (txt && !id) { c.name = txt.slice(0, 30); st.step = "ded"; } break;
    case "ded":
      if (id === "d:ok") st.step = "pics";
      else if (id === "d:next") { const L = dedIdeas(c.ver === "g"); c.dedI = (c.dedI + 1) % L.length; c.ded = L[c.dedI]; }
      else if (id === "d:own") st.step = "dedown";
      else if (txt) { c.ded = txt.slice(0, 450); st.step = "pics"; }   /* כתבו הקדשה ישר במקום ללחוץ */
      break;
    case "dedown": if (txt) { c.ded = txt.slice(0, 450); await S(text("הקדשה יפה ❤️")); st.step = "pics"; } break;
    case "pics": case "picsmore":
      if (ev.image) { if (c.pics.length < PICS) c.pics.push(ev.image); st.step = "picsmore";
        if (st.burst) return;                 /* כמה תמונות ברצף – עונים פעם אחת */
        st.burst = 1; }
      else if (id === "p:done" && c.pics.length) st.step = st.who ? "more" : "who";
      break;
    case "who": if (id === "w:yes") { st.who = st.profile; st.step = "more"; } else if (id === "w:other") st.step = "whoown"; else if (txt && !id) { st.who = txt.slice(0, 40); st.step = "more"; } break;
    case "whoown": if (txt) { st.who = txt.slice(0, 40); st.step = "more"; } break;
    case "more":
      if (id === "m:yes") { st.list.push(c); st.cur = fresh(); st.page = 0; st.step = "book"; }
      else if (id === "m:no") { st.list.push(c); st.cur = fresh(); st.step = "consent"; }
      break;
    case "consent":
      if (id === "c:yes") {
        const oid = "סב-" + String(1000 + Math.floor(Math.random() * 9000));
        st.done = oid; st.step = "done";
        const sum = summary(st, oid, false);
        for (let i = 0; i < sum.length; i += 3900) await S(text(sum.slice(i, i + 3900)));   /* הודעה בוואטסאפ – עד 4096 תווים */
        await S(text("תודה רבה! 🎉 קיבלנו את ההזמנה.\nשמש תכין את הספר הדיגיטלי ותשלח לך אותו כאן לתצוגה – ומשלמים רק אם אוהבים ❤️"));
        if (env.STATE && !log) await env.STATE.put("order:" + Date.now() + ":" + from, JSON.stringify({ from, id: oid, who: st.who, at: new Date().toISOString(), text: summary(st, oid, true), list: st.list.map(c => ({ book: c.book, ver: c.ver, name: c.name, ded: c.ded, pics: c.pics })) }), { expirationTtl: 90 * 86400 });
        return;
      }
      break;
  }
  return ask(env, from, st, log);
}

/* תמונה שהתקבלה: מורידים ממטא ושומרים ב-KV (90 יום), כדי שיהיה קישור קבוע לסיכום */
async function keepPic(env, mediaId, origin){
  try {
    const m = await (await fetch(`${GRAPH}/${mediaId}`, { headers: { "Authorization": "Bearer " + env.WA_TOKEN } })).json();
    const r = await fetch(m.url, { headers: { "Authorization": "Bearer " + env.WA_TOKEN } }); if (!r.ok) return { media: mediaId };
    const a = new Uint8Array(18); crypto.getRandomValues(a); const key = [...a].map(b => b.toString(16).padStart(2, "0")).join("") + ".jpg";
    await env.STATE.put(key, await r.arrayBuffer(), { expirationTtl: 90 * 86400, metadata: { type: m.mime_type || "image/jpeg" } });
    return { media: mediaId, link: origin + "/p/" + key };
  } catch (e) { return { media: mediaId }; }
}

/* הודעה אחת שנכנסה. ev = {id, text, image}. מחזיר את מה שנשלח (בבדיקות) */
export async function handle(env, from, profile, ev, opts){
  opts = opts || {};
  const k = "st:" + from, raw = opts.mem ? opts.mem[k] : await env.STATE.get(k);
  let st = raw ? JSON.parse(raw) : null;
  const log = opts.log;
  if (st && st.human) {                                            /* מצב "בן אדם": הבוט שותק */
    if (/^להמשיך$/.test((ev.text || "").trim()) || Date.now() - st.human > 48 * 3600e3) { st.human = 0; st.burst = 0; await ask(env, from, st, log); }
  } else if (!st || st.step === "done") {
    if (/הזמנה סב-\d/.test(ev.text || "")) return;                 /* הזמנה מלאה מהאתר – שמש מטפלת, הבוט לא מתערב */
    if (!(ev.id || TRIGGER.test(ev.text || ""))) return;           /* לא שיחה על ספר לנכד – לא מתערבים */
    st = { step: "hi", page: 0, list: [], cur: fresh(), who: "", profile: profile || "", human: 0 };
    if (ev.id === "s:go") st.step = "book";
    if (ev.id === "human" || HUMAN_TXT.test(ev.text || "")) await step(env, from, st, { id: "human" }, log);
    else await ask(env, from, st, log);
  } else {
    if (!ev.image) st.burst = 0;
    await step(env, from, st, ev, log);
  }
  st.ts = Date.now();
  const out = JSON.stringify(st);
  if (opts.mem) opts.mem[k] = out; else await env.STATE.put(k, out, { expirationTtl: 30 * 86400 });
}

async function verify(req, env, body){
  if (!env.APP_SECRET) return true;
  const sig = (req.headers.get("X-Hub-Signature-256") || "").replace("sha256=", "");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.APP_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))].map(b => b.toString(16).padStart(2, "0")).join("");
  return mac === sig;
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === "/wa" && req.method === "GET") {
      return url.searchParams.get("hub.verify_token") === env.VERIFY_TOKEN ? new Response(url.searchParams.get("hub.challenge")) : new Response("no", { status: 403 });
    }
    if (url.pathname === "/wa" && req.method === "POST") {
      const body = await req.text();
      if (!(await verify(req, env, body))) return new Response("bad sig", { status: 401 });
      const j = JSON.parse(body);
      ctx.waitUntil((async () => {
        for (const e of j.entry || []) for (const ch of e.changes || []) {
          const v = ch.value || {};
          /* שמש כתבה בעצמה מהאפליקציה – הבוט שותק בשיחה הזאת (או חוזר, אם כתבה #בוט) */
          if (ch.field === "smb_message_echoes") for (const m of v.message_echoes || []) {
            const k = "st:" + m.to, raw = await env.STATE.get(k); const st = raw ? JSON.parse(raw) : { step: "done", list: [], cur: fresh() };
            const t = (m.text && m.text.body) || "";
            if (/#בוט/.test(t)) { st.human = 0; st.burst = 0; await env.STATE.put(k, JSON.stringify(st), { expirationTtl: 30 * 86400 }); if (st.step !== "done") await ask(env, m.to, st); }
            else { st.human = Date.now(); await env.STATE.put(k, JSON.stringify(st), { expirationTtl: 30 * 86400 }); }
          }
          const name = (v.contacts && v.contacts[0] && v.contacts[0].profile && v.contacts[0].profile.name) || "";
          for (const m of v.messages || []) {
            const ev = {};
            if (m.type === "text") ev.text = m.text.body;
            else if (m.type === "interactive") ev.id = (m.interactive.button_reply || m.interactive.list_reply || {}).id;
            else if (m.type === "button") ev.text = m.button.text;
            else if (m.type === "image") ev.image = await keepPic(env, m.image.id, url.origin);
            else continue;
            await handle(env, m.from, name, ev);
          }
        }
      })());
      return new Response("ok");
    }
    const p = url.pathname.match(/^\/p\/([a-f0-9]{36}\.jpg)$/);
    if (p && req.method === "GET") {
      const { value, metadata } = await env.STATE.getWithMetadata(p[1], { type: "arrayBuffer" });
      return value ? new Response(value, { headers: { "Content-Type": (metadata && metadata.type) || "image/jpeg", "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" } }) : new Response("not found", { status: 404 });
    }
    if (url.pathname === "/orders" && env.VERIFY_TOKEN && url.searchParams.get("k") === env.VERIFY_TOKEN) {
      const ks = await env.STATE.list({ prefix: "order:" }), out = [];
      for (const k of ks.keys.slice(-50)) out.push(JSON.parse(await env.STATE.get(k.name)));
      return Response.json(out);
    }
    return new Response("BOOQLI", { status: 404 });
  }
};
