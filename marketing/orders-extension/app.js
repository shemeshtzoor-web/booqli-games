/* בוקלי – הזמנות גנים (תוסף פרטי לשמש)
   כל הנתונים (גנים, נוסחים, פרטי תשלום, קופונים) נשמרים רק ב-chrome.storage.local במחשב הזה.
   אין כאן שום פנייה לאינטרנט. קוד זה נמצא במאגר ציבורי – לכן אין בו פרטי בנק, טלפונים פרטיים או קודי קופון. */

const store = {
  async get(k, d) {
    if (window.chrome && chrome.storage && chrome.storage.local) { const o = await chrome.storage.local.get(k); return o[k] === undefined ? d : o[k]; }
    try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
  },
  async set(k, v) {
    if (window.chrome && chrome.storage && chrome.storage.local) return chrome.storage.local.set({ [k]: v });
    localStorage.setItem(k, JSON.stringify(v));
  }
};

/* מחירון (זהה ל-kindergartens/ ול-order/) */
const TIERS = [[1,132,149],[2,106,123],[3,94,111],[4,88,105],[6,80,97],[8,66,83],[20,60,77],[50,59,76],[100,57,74]];
const COVER = { staple: "חוברת כרומו סיכות", soft: "כריכה רכה פיג'מה", hard: "כריכה קשה פרימיום" };
function priceFor(cover, n) {
  if (cover === "staple") return n >= 20 ? 50 : 0;
  let t = TIERS[0]; TIERS.forEach(r => { if (n >= r[0]) t = r; });
  return cover === "soft" ? t[1] : t[2];
}
const ils = n => Math.round(n).toLocaleString("he-IL") + " ₪";

const STAGES = [
  "פנייה חדשה", "הצעת מחיר ודוגמה נשלחו", "בחירת ספר ומסלול",
  "🛒 מזמינים לבד באתר", "📁 דרייב: תקנון ותיקייה", "📁 דרייב: הקדשות ותשלום",
  "✏️ בעריכה", "✅ מחכה לאישור הדפסה", "🖨️ בהדפסה", "📦 נשלח / נאסף", "סגור"
];

const SET_FIELDS = [
  ["coupon5", "קוד קופון 5% הנחה (הזמנה עצמאית באתר)", "input"],
  ["ganim", "קוד קופון לספרים נוספים במהלך השנה (GANIM…)", "input"],
  ["bank", "העברה בנקאית (כל הפרטים, כמו שיופיעו בהודעה)", "textarea"],
  ["bit", "Bit / PayBox (כמו שיופיע בהודעה)", "textarea"],
  ["form", "קישור לטופס התקנון", "input", "https://forms.gle/UinyXV37w2yMYvJd7"],
  ["vCovers", "סרטון שלושת סוגי הכריכות", "input", "https://youtu.be/sGODE7ehbMY"],
  ["vPhoto", "סרטון איך לבחור תמונה", "input", "https://youtu.be/Fk42FO0TDmg"],
  ["base", "כתובת אתר המשחקים", "input", "https://games.booqli.ai"]
];

const TPL_DEFAULT = [
  { id: "offer", name: "1 · הצעת מחיר + דוגמה בחינם", stage: 1, text:
`היי {איש_קשר} 👋
בבוקלי תוכלו לרכוש מתנה לכל ילד בגן – ספר אישי ומרגש! 📚

כל ספר בבוקלי מותאם אישית לילד/ה:
✓ שם הילד/ה על הכריכה ובמהלך העלילה
✓ איורי AI בהתאמה מדויקת לתמונה של הילד/ה – על הכריכה ובמהלך העלילה
✓ הקדשה אישית מודפסת בעמוד השער מטעם הוועד/הגן

לפניכם 3 אפשרויות הדפסה מעולות להזמנה של 20–49 ספרים:
1. כריכה קשה פרימיום – 77 ₪ לספר
2. כריכה רכה פיג'מה (כמו ספריית פיג'מה) – 60 ₪ לספר
3. חוברת כרומו סיכות – 50 ₪ לספר
🎥 סרטון המחשה של שלושת סוגי הכריכות: {סרטון_כריכות}

אין צורך לערוך שום דבר! מעלים תמונה אחת ומקבלים ספר מושלם!

המחירים לגנים נקבעו לאחר מחשבה והתחשבות בצרכים ובתקציבים של הגנים, והם כוללים הנחה משמעותית בהתאם לכמות ההזמנה ולפורמט ההדפסה. לכן המחירים סופיים ואינם פתוחים למשא ומתן.

🚚 משלוח:
1. מומלץ לאסוף עצמאית מבית הדפוס (ליד עפולה) – כשבוע לאחר אישור ההדפסה.
2. משלוח צ'יטה עד הבית ב-40 ₪ – עד 14 ימי עסקים מאישור ההדפסה.

🎁 שלחו לי עכשיו תמונה של ילד/ה שאתם מכירים + שם, ואכין לכם דוגמה ראשונית ללא עלות וללא התחייבות.
למידע נוסף ומחשבון לגן: {עמוד_גנים}` },
  { id: "route", name: "2 · אחרי הדוגמה: העמוד האישי (ספר + מסלול)", stage: 2, text:
`איזה כיף שבחרתם בבוקלי! ❤️📚
ריכזתי לכם את כל שלבי ההזמנה בעמוד אחד מסודר, במיוחד בשביל {גן}:
👉 {קישור}

שם תוכלו:
📖 לקרוא את כל הספרים ולבחור נושא
🛒 לבחור מסלול:
1️⃣ הזמנה עצמאית באתר – 5% הנחה (אצלכם: {אחרי_הנחה} במקום {סה"כ})
2️⃣ הזמנה מרוכזת בדרייב – אנחנו עושים הכל בשבילכם (מעל 20 ספרים, עד שני נושאים)
📸 לראות איך בוחרים תמונה טובה
✍️ לחתום על התקנון, לשלוח הקדשות ולאשר הדפסה – הכל במקום אחד

אז באיזה מסלול תרצו לבחור? ❤️` },
  { id: "folder", name: "3 · קישור לתיקייה בדרייב", stage: 4, text:
`התיקייה של {גן} מוכנה! 📁
{דרייב}

תזכורת קצרה:
📂 תיקיית בנים ותיקיית בנות – כל תמונה לתיקייה המתאימה
🏷️ שם הקובץ = השם הפרטי של הילד בלבד (אותו שם? יוסי 1, יוסי 2)
🖼️ PNG / JPG בלבד
⚠️ אחרי סגירת התיקייה לא ניתן להחליף תמונות או להוסיף ספרים – כל שינוי ייחשב הזמנה חדשה.

הקישור לתיקייה נשמר גם בעמוד האישי שלכם, עם כל ההנחיות, ההקדשות והתשלום: {קישור}
כשמסיימים להעלות – כתבו לי ❤️` },
  { id: "pay", name: "4 · פרטי תשלום (דרייב)", stage: 5, text:
`💳 פרטי התשלום להזמנה של {גן}:
{ספרים} ספרים · {כריכה} · {סה"כ}
{משלוח}
💰 לתשלום: {לתשלום}

התשלום מתבצע מראש, לפני תחילת עריכת הספרים.

🏦 העברה בנקאית:
{בנק}

📱 Bit / PayBox:
{ביט}

💳 אשראי – בתיאום מראש.

אחרי התשלום שלחו לי אישור (או לחצו "שילמנו" בעמוד שלכם), ונתחיל לעבוד! ❤️` },
  { id: "ready-drive", name: "5 · הספרים מוכנים – דרייב", stage: 7, text:
`איזה כיף! 🩷 הספרים של {גן} מוכנים לצפייה בתיקייה שלכם!
{דרייב}

הגענו לשלב האחרון! אחרי כל העבודה, ההשקעה ותשומת הלב שהקדשנו לכל ספר ולכל איור, אנחנו כבר ממש מתרגשים להעביר אותם להדפסה.
כדי לא לעכב את הייצור, אנא החזירו לנו אישור הדפסה בתוך יום עסקים אחד.

לפני האישור, בדקו בקצרה:
• שכל הילדים נמצאים
• שהשמות תואמים לילדים ולתמונות הנכונות
• שהשמות עצמם מופיעים בצורה תקינה
• שההקדשה היא ההקדשה שביקשתם

אין צורך לבדוק את הסיפור או את האיורים.

תזכורת חשובה: שלב הבדיקה נועד לוודא שהפרטים האישיים נכונים. אין אפשרות לקבל בקשות להחלפת תמונות או לשינויים באיורים על בסיס העדפה אישית. כמובן, אם קיימת תקלה טכנית או טעות מצידנו – נטפל בה מיד.

✅ לאישור בלחיצה: {קישור_אישור}
מחכים כבר לראות את הספרים שלכם מודפסים!` },
  { id: "ready-site", name: "5 · הספרים מוכנים – אתר", stage: 7, text:
`איזה כיף! 🩷 הספרים של {גן} מוכנים לצפייה ולהורדה באתר:
https://www.booqli.ai/he/my-books

הגענו לשלב האחרון! אחרי כל העבודה, ההשקעה ותשומת הלב שהקדשנו לכל ספר ולכל איור, אנחנו כבר ממש מתרגשים להעביר אותם להדפסה.
כדי לא לעכב את הייצור, אנא החזירו לנו אישור הדפסה בתוך יום עסקים אחד.

לפני האישור, בדקו בקצרה:
🩷 שהשמות תואמים לילדים ולתמונות הנכונות
🩷 שהשמות עצמם מופיעים בצורה תקינה

אין צורך לבדוק את הסיפור או את האיורים.

תזכורת חשובה: שלב הבדיקה נועד לוודא שהפרטים האישיים נכונים. אין אפשרות לקבל בקשות להחלפת תמונות או לשינויים באיורים על בסיס העדפה אישית. כמובן, אם קיימת תקלה טכנית או טעות מצידנו – נטפל בה מיד.

✅ לאישור בלחיצה: {קישור_אישור}
מחכים כבר לראות את הספרים שלכם מודפסים!` },
  { id: "remind", name: "תזכורת: מחכים לאישור הדפסה", stage: 0, text:
`היי {איש_קשר} 🙂 רק מזכירה – הספרים של {גן} מחכים לאישור הדפסה.
כדי שלא יתעכבו בתור להדפסה, אפשר לאשר בלחיצה כאן: {קישור_אישור}
תודה! ❤️` },
  { id: "thanks", name: "אחרי המסירה: תודה + גן מביא גן", stage: 10, text:
`תודה שבחרתם ב-בוקלי להכין את המתנה לכל ילדי {גן}! 💛
מקווה שהילדים מתרגשים 📚

🌱 גן מביא גן: כל גן שיגיע דרככם ויסגור הזמנה יזכה אתכם ב-50 ₪ הנחה או זיכוי מיידי – גם אם יסגור אפילו בעוד שנה.
יש לכם גן בראש? שלחו להם: {עמוד_גנים}

🎁 צריכים ספרים נוספים במהלך השנה? אפשר להזמין באתר במחיר האתר לפי הכמות, עם הקוד {גנים50} – 50 ₪ הנחה לכל הזמנה, בתוקף לשנה.

📲 מתנה לגננת ולהורים – האפליקציה של booqli Games: משחקים, דפי עבודה ומערכים לפי לוח השנה של הגן, בחינם. מתקינים בלחיצה:
https://games.booqli.ai/app/?utm_source=whatsapp&utm_medium=orders_thanks

💬 הודעה מוכנה להעביר להורים:
"הורים יקרים 💛 מצאנו אתר בטוח להורים ולילדים עם משחקים ופעילויות לגיל הרך, בחינם 📚 https://games.booqli.ai/?utm_source=whatsapp&utm_medium=gan_parents"` }
];

let GANS = [], TPL = [], SET = {}, cur = null;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function toast(t) { const el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => el.hidden = true, 2200); }
function phone(p) { let d = String(p || "").replace(/\D/g, ""); if (d.startsWith("0")) d = "972" + d.slice(1); return d; }
function today() { return new Date().toLocaleDateString("he-IL"); }

async function load() {
  GANS = await store.get("gans", []);
  TPL = await store.get("tpl", null) || JSON.parse(JSON.stringify(TPL_DEFAULT));
  TPL_DEFAULT.forEach(d => { if (!TPL.find(t => t.id === d.id)) TPL.push(JSON.parse(JSON.stringify(d))); });
  /* 1.0.3: הקישור לתיקייה נשמר בעמוד האישי */
  const fol = TPL.find(t => t.id === "folder");
  if (fol) fol.text = fol.text.replace("כל ההנחיות, ההקדשות והתשלום – בעמוד שלכם: {קישור}", "הקישור לתיקייה נשמר גם בעמוד האישי שלכם, עם כל ההנחיות, ההקדשות והתשלום: {קישור}");
  /* 1.0.2: אפליקציה + הודעה להורים בהודעת התודה */
  const thx = TPL.find(t => t.id === "thanks");
  if (thx && !thx.text.includes("games.booqli.ai/app")) thx.text += TPL_DEFAULT.find(t => t.id === "thanks").text.split("בתוקף לשנה.")[1] || "";
  /* 1.0.1: משלוח בהודעת התשלום */
  const pay = TPL.find(t => t.id === "pay");
  if (pay && !pay.text.includes("{לתשלום}")) pay.text = pay.text.replace('{ספרים} ספרים · {כריכה} · סה"כ {סה"כ}', '{ספרים} ספרים · {כריכה} · {סה"כ}\n{משלוח}\n💰 לתשלום: {לתשלום}');
  SET = await store.get("set", {});
  SET_FIELDS.forEach(f => { if (SET[f[0]] === undefined && f[3]) SET[f[0]] = f[3]; });
}
const saveGans = () => store.set("gans", GANS);

/* ---------- חישובים וקישורים לגן ---------- */
function calc(g) {
  const n = (+g.kids || 0) * (+g.per || 1), p = priceFor(g.cover, n), t = p * n, sh = g.ship === "pickup" ? 0 : 40;
  return { n, p, t, d5: t * 0.05, a5: t * 0.95, sh, all: t + sh };
}
function personalLink(g, stage) {
  const d = { g: g.name, c: g.contact || "", n: +g.kids || 0, p: +g.per || 1, v: g.cover, k: SET.coupon5 || "", r: g.route || "", sh: g.ship === "pickup" ? "pickup" : "home" };
  if (g.drive) d.f = g.drive;
  if (stage) d.s = stage;
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(d))));
  return (SET.base || "https://games.booqli.ai").replace(/\/$/, "") + "/order/#d=" + encodeURIComponent(b64);
}
function fill(text, g) {
  const c = calc(g);
  const map = {
    "גן": g.name, "איש_קשר": g.contact || "", "ילדים": g.kids, "ספרים": c.n, "כריכה": COVER[g.cover] || "",
    "מחיר_לספר": c.p ? c.p + " ₪" : "", 'סה"כ': c.t ? ils(c.t) : "", "משלוח": g.ship === "pickup" ? "🚗 איסוף עצמי מבית הדפוס – ללא עלות" : "🚚 משלוח עד הבית – 40 ₪", "לתשלום": c.t ? ils(c.all) : "", "הנחה5": c.t ? ils(c.d5) : "", "אחרי_הנחה": c.t ? ils(c.a5) : "",
    "נושאים": g.topics || "", "קישור": personalLink(g), "קישור_אישור": personalLink(g, "approve"), "דרייב": g.drive || "",
    "קופון5": SET.coupon5 || "", "גנים50": SET.ganim || "", "בנק": SET.bank || "", "ביט": SET.bit || "",
    "סרטון_כריכות": SET.vCovers || "", "סרטון_תמונה": SET.vPhoto || "",
    "עמוד_גנים": (SET.base || "https://games.booqli.ai").replace(/\/$/, "") + "/kindergartens/?utm_source=whatsapp&utm_medium=orders"
  };
  const missing = [];
  const out = text.replace(/\{([^{}]+)\}/g, (m, k) => { if (!(k in map)) return m; if (map[k] === "" || map[k] === undefined) missing.push(k); return map[k]; });
  return { out, missing };
}
const PH = ["גן","איש_קשר","ילדים","ספרים","כריכה","מחיר_לספר",'סה"כ',"משלוח","לתשלום","הנחה5","אחרי_הנחה","נושאים","קישור","קישור_אישור","דרייב","קופון5","גנים50","בנק","ביט","סרטון_כריכות","סרטון_תמונה","עמוד_גנים"];

/* ---------- רשימת הגנים ---------- */
function renderList() {
  const q = $("q").value.trim(), fs = $("fStage").value, showClosed = $("fClosed").checked;
  const rows = GANS.filter(g => (showClosed || g.stage !== STAGES.length - 1) && (fs === "" || g.stage === +fs) &&
    (!q || [g.name, g.contact, g.phone, g.notes, g.topics].join(" ").includes(q)))
    .sort((a, b) => (b.updated || 0) - (a.updated || 0));
  $("list").innerHTML = rows.length ? rows.map(g => {
    const c = calc(g), late = g.stage === 7 && g.readyAt && (Date.now() - g.readyAt) > 864e5;
    return `<div class="item${cur === g.id ? " on" : ""}" data-id="${g.id}"><b>${esc(g.name)}</b>${g.contact ? " · " + esc(g.contact) : ""}
      <div class="meta">${c.n} ספרים · ${esc(COVER[g.cover] || "")}${c.t ? " · " + ils(c.t) : ""}${g.route ? " · " + (g.route === "drive" ? "📁 דרייב" : "🛒 אתר") : ""}</div>
      <span class="st">${esc(STAGES[g.stage] || "")}</span>${late ? ' <span class="late">⏰ עבר יום בלי אישור</span>' : ""}</div>`;
  }).join("") : '<p class="empty" style="margin-top:20px">אין גנים להצגה.</p>';
}
$("list").addEventListener("click", e => { const it = e.target.closest(".item"); if (!it) return; cur = it.dataset.id; renderList(); renderDetail(); });
["q", "fStage", "fClosed"].forEach(id => $(id).addEventListener("input", renderList));
$("fStage").innerHTML += STAGES.map((s, i) => `<option value="${i}">${s}</option>`).join("");

$("addGan").addEventListener("click", () => {
  const g = { id: "g" + Date.now(), name: "גן חדש", contact: "", phone: "", kids: 25, per: 1, cover: "staple", route: "", topics: "", drive: "", stage: 0, notes: "", sent: {}, log: [], created: Date.now(), updated: Date.now() };
  GANS.push(g); cur = g.id; saveGans(); renderList(); renderDetail();
  setTimeout(() => { const i = document.querySelector('[data-f="name"]'); if (i) { i.focus(); i.select(); } }, 50);
});

/* ---------- כרטיס גן ---------- */
function renderDetail() {
  const g = GANS.find(x => x.id === cur);
  if (!g) { $("detail").innerHTML = '<p class="empty">בחרי גן מהרשימה, או "➕ גן חדש".</p>'; return; }
  const f = (k, lab, type, cls, opts) => `<div class="f ${cls || ""}"><label>${lab}</label>${
    type === "select" ? `<select data-f="${k}">${opts.map(o => `<option value="${o[0]}"${String(g[k]) === String(o[0]) ? " selected" : ""}>${o[1]}</option>`).join("")}</select>`
    : type === "textarea" ? `<textarea data-f="${k}">${esc(g[k])}</textarea>` : `<input data-f="${k}" type="${type}" value="${esc(g[k])}">`}</div>`;
  $("detail").innerHTML = `
    <h2 id="dName"></h2>
    <div class="grid">
      ${f("name", "שם הגן", "text", "w2")}${f("contact", "איש/אשת קשר", "text")}${f("phone", "טלפון (וואטסאפ)", "tel")}
      ${f("kids", "כמה ילדים", "number")}${f("per", "ספרים לילד", "select", "", [[1, "1"], [2, "2"], [3, "3"]])}
      ${f("cover", "כריכה", "select", "", Object.keys(COVER).map(k => [k, COVER[k]]))}${f("route", "מסלול", "select", "", [["", "עוד לא נבחר"], ["site", "🛒 לבד באתר"], ["drive", "📁 דרייב"]])}${f("ship", "משלוח", "select", "", [["home", "🚚 עד הבית – 40 ₪"], ["pickup", "🚗 איסוף עצמי"]])}
      ${f("topics", "נושא/ים", "text", "w2")}${f("drive", "קישור לתיקיית הדרייב", "url", "w2")}
      ${f("stage", "שלב", "select", "w2", STAGES.map((s, i) => [i, s]))}${f("notes", "הערות", "textarea", "w2")}
    </div>
    <div id="dyn"></div>
    <p style="margin-top:16px"><button class="danger" data-a="del">מחיקת הגן</button></p>`;
  renderDyn();
}
/* החלק שמתעדכן בזמן הקלדה (בלי לגעת בשדות – כדי לא לאבד את הפוקוס) */
function renderDyn() {
  const g = GANS.find(x => x.id === cur); if (!g || !$("dyn")) return;
  const c = calc(g);
  $("dName").textContent = g.name;
  const st = document.querySelector('[data-f="stage"]'); if (st && +st.value !== g.stage) st.value = g.stage;
  const msgs = TPL.map(t => {
    const r = fill(t.text, g), sent = g.sent && g.sent[t.id];
    return `<div class="msg${sent ? " sent" : ""}" data-t="${t.id}"><div class="hd"><b>${esc(t.name)}</b>${sent ? `<small>✔️ נשלח ${esc(sent)}</small>` : ""}</div>
      <textarea>${esc(r.out)}</textarea>${r.missing.length ? `<div class="miss">⚠️ חסר: ${r.missing.map(esc).join(", ")}</div>` : ""}
      <div class="acts"><button class="wa" data-a="send">💬 שליחה בוואטסאפ</button><button class="ghost" data-a="copy">📋 העתקה</button></div></div>`;
  }).join("");
  $("dyn").innerHTML = `
    <div class="calc"><div>${c.n} ספרים</div><div>${c.p ? c.p + " ₪ לספר" : "סיכות רק מ-20 ספרים"}</div><div>סה"כ <b>${c.t ? ils(c.t) : "—"}</b></div><div>דרייב + ${c.sh ? "משלוח 40 ₪" : "איסוף"}: <b>${c.t ? ils(c.all) : "—"}</b></div><div>באתר עם 5%: <b>${c.t ? ils(c.a5) : "—"}</b> (−${c.t ? ils(c.d5) : "—"})</div></div>
    <div class="link">🔗 <code>${esc(personalLink(g))}</code><button class="ghost" data-a="copyLink">העתקה</button><a class="ghost" href="${esc(personalLink(g))}" target="_blank">פתיחה</a></div>
    ${SET.coupon5 ? "" : '<p class="miss">⚠️ עוד לא הוגדר קוד קופון 5% (⚙️ פרטים פרטיים) – בעמוד של הגן יופיע "שמש שולחת את הקוד בוואטסאפ".</p>'}
    <h3>✉️ הודעות מוכנות</h3>
    <div class="msgs">${msgs}</div>
    <h3>📝 מה נשלח</h3>
    <ul class="log">${(g.log || []).slice().reverse().map(l => `<li>${esc(l)}</li>`).join("") || "<li>עוד לא נשלחו הודעות</li>"}</ul>`;
}
$("detail").addEventListener("input", e => {
  const el = e.target.closest("[data-f]"); if (!el) return;
  const g = GANS.find(x => x.id === cur); if (!g) return;
  const k = el.dataset.f; g[k] = ["kids", "per", "stage"].includes(k) ? +el.value : el.value; g.updated = Date.now();
  if (k === "stage" && g.stage === 7 && !g.readyAt) g.readyAt = Date.now();
  saveGans(); renderList(); renderDyn();
});
$("detail").addEventListener("click", async e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const g = GANS.find(x => x.id === cur); if (!g) return;
  const a = b.dataset.a;
  if (a === "copyLink") { await navigator.clipboard.writeText(personalLink(g)); toast("הקישור הועתק ✔️"); return; }
  if (a === "del") { if (confirm("למחוק את " + g.name + "? אי אפשר לבטל.")) { GANS = GANS.filter(x => x.id !== g.id); cur = null; saveGans(); renderList(); renderDetail(); } return; }
  const box = b.closest(".msg"), t = TPL.find(x => x.id === box.dataset.t), text = box.querySelector("textarea").value;
  if (a === "copy") { try { await navigator.clipboard.writeText(text); } catch (err) {} toast("ההודעה הועתקה ✔️"); }
  if (a === "send") {
    const p = phone(g.phone);
    if (!p) { toast("חסר טלפון לגן"); return; }
    window.open("https://wa.me/" + p + "?text=" + encodeURIComponent(text), "_blank");
  }
  g.sent = g.sent || {}; g.sent[t.id] = today(); g.log = g.log || []; g.log.push(today() + " · " + t.name + (a === "copy" ? " (הועתק)" : ""));
  if (t.stage && g.stage < t.stage) { g.stage = t.stage; if (t.stage === 7 && !g.readyAt) g.readyAt = Date.now(); }
  g.updated = Date.now(); saveGans(); renderList(); renderDyn();
});

/* ---------- נוסחים ---------- */
function renderTpl() {
  $("phList").innerHTML = PH.map(p => `<span class="ph">{${p}}</span>`).join(" ");
  $("tplList").innerHTML = TPL.map(t => `<div class="tpl" data-t="${t.id}"><b>${esc(t.name)}</b><textarea>${esc(t.text)}</textarea></div>`).join("");
}
$("tplList").addEventListener("input", e => { const box = e.target.closest(".tpl"); const t = TPL.find(x => x.id === box.dataset.t); t.text = e.target.value; store.set("tpl", TPL); });
$("tplReset").addEventListener("click", () => { if (!confirm("להחזיר את כל הנוסחים למקור? השינויים שלך יימחקו.")) return; TPL = JSON.parse(JSON.stringify(TPL_DEFAULT)); store.set("tpl", TPL); renderTpl(); toast("הוחזר למקור"); });

/* ---------- פרטים פרטיים ---------- */
function renderSet() {
  $("setForm").innerHTML = SET_FIELDS.map(f => `<div class="f${f[2] === "textarea" ? " w2" : ""}"><label>${f[1]}</label>${f[2] === "textarea"
    ? `<textarea data-s="${f[0]}">${esc(SET[f[0]] || "")}</textarea>` : `<input data-s="${f[0]}" value="${esc(SET[f[0]] || "")}">`}</div>`).join("");
}
$("setSave").addEventListener("click", async () => {
  document.querySelectorAll("[data-s]").forEach(el => SET[el.dataset.s] = el.value.trim());
  await store.set("set", SET); $("setOk").hidden = false; setTimeout(() => $("setOk").hidden = true, 2000);
});

/* ---------- גיבוי ---------- */
$("bakOut").addEventListener("click", async () => {
  const blob = new Blob([JSON.stringify({ v: 1, at: new Date().toISOString(), gans: GANS, tpl: TPL, set: SET }, null, 1)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "booqli-ganim-backup-" + new Date().toISOString().slice(0, 10) + ".json"; a.click();
  await store.set("bakAt", Date.now()); showBak();
});
$("bakIn").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!Array.isArray(d.gans)) throw 0;
    if (!confirm("לשחזר מהגיבוי? זה יחליף את מה שיש עכשיו (" + GANS.length + " גנים) ב-" + d.gans.length + " גנים מהקובץ.")) return;
    GANS = d.gans; TPL = d.tpl || TPL; SET = d.set || SET;
    await store.set("gans", GANS); await store.set("tpl", TPL); await store.set("set", SET);
    cur = null; renderAll(); toast("שוחזר ✔️");
  } catch (err) { toast("הקובץ לא תקין"); }
  e.target.value = "";
});
async function showBak() { const t = await store.get("bakAt", 0); $("bakLast").textContent = t ? "גיבוי אחרון: " + new Date(t).toLocaleDateString("he-IL") : "עוד לא נעשה גיבוי."; }

/* ---------- לשוניות ---------- */
$("tabs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  document.querySelectorAll("#tabs button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll("main>section").forEach(s => s.hidden = s.id !== "t-" + b.dataset.t);
  if (b.dataset.t === "gans") renderDetail();
});
function renderAll() { renderList(); renderDetail(); renderTpl(); renderSet(); showBak(); }
load().then(renderAll);
