/* ===== מסלול מהיר להזמנה של גן – ראש עמוד הגנים (5.11.2026, לפי שמש) =====
   "כמו סבא וסבתא – מהיר מאוד": 1 מעלים תמונות (חלון בנים + חלון בנות, גרירה, שם פרטי לכל תמונה) ← 2 נושא אחד לכל הגן
   ← 3 "בטוחים?" ← 4 הקדשה ← 5 פרטים (שם, משפחה, טלפון, מייל, כתובת, כריכה, דיוור כן/לא, תקנון) ← שולחים.
   השליחה: התמונות נשמרות ישר בדרייב של שמש (worker/wa-bot.js /up) – גן-XXXX · <גן> · <תאריך> / בנים|בנות / <שם>.jpg
   + מסמך סיכום עם כל הפרטים + מייל לשמש. בלי הפרטים המלאים – לא שולחים.
   תלוי ב: common.js (SITE), order/books/books.js (BQ_BOOKS, bqCover), order/books/reader.js (bqRead), order/books/deds.js (BQ_DEDS). */
(() => {
const API = (window.SITE && SITE.driveUpload) || "https://booqli-wa.shemeshtzoor.workers.dev/up/";
const PHONE = (window.SITE && SITE.phone) || "972555549331";
const BOOKS = (window.BQ_BOOKS || []).filter(b => b.gan);
const DEDS = window.BQ_DEDS || {};
const TIERS = [[1,132,149],[2,106,123],[3,94,111],[4,88,105],[6,80,97],[8,66,83],[20,60,77],[50,59,76],[100,57,74]];
const COVERS = [["staple", "כריכה רכה – סיכות"], ["soft", "כריכה רכה (פיג'מה)"], ["hard", "כריכה קשה פרימיום"]];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
const ev = (k, n) => { try { siteEvent(k, n); } catch (e) {} };
const ils = n => Math.round(n).toLocaleString("he-IL") + " ₪";
const SRC = (() => { try { const q = new URLSearchParams(location.search); return q.get("utm_source") ? [q.get("utm_source"), q.get("utm_medium"), q.get("utm_campaign")].filter(Boolean).join("-") : ""; } catch (e) { return ""; } })();
function price(cover, n){
  if (cover === "staple") return n >= 20 ? 50 : 0;
  let t = TIERS[0]; TIERS.forEach(r => { if (n >= r[0]) t = r; }); return cover === "soft" ? t[1] : t[2];
}
/* שם פרטי בלבד: אותיות בעברית/אנגלית, רווח, מקף וגרש. בלי מספרים וסימנים */
const cleanName = v => v.replace(/[^א-תa-zA-Z \-'׳]/g, "").replace(/\s{2,}/g, " ").slice(0, 20);
const G = { pics: [], topic: "", ded: "", dedI: 0, cover: "", d: {}, mkWa: false, mkMail: false };
let STEP = "pics";
const box = $("gStart");
if (!box) return;

function shrink(file){ return new Promise(res => { const img = new Image(), u = URL.createObjectURL(file);
  img.onload = () => { const k = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(b => { URL.revokeObjectURL(u); res(b); }, "image/jpeg", .88); };
  img.onerror = () => { URL.revokeObjectURL(u); res(null); }; img.src = u; }); }
async function addFiles(sub, files){
  const fs = [...files].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|heic|webp)$/i.test(f.name));
  for (const f of fs) { const b = await shrink(f); if (!b) continue;
    const nm = /[֐-׿]/.test(f.name) ? cleanName(f.name.replace(/\.[^.]+$/, "").replace(/\d+/g, "")).trim() : "";
    G.pics.push({ sub, blob: b, url: URL.createObjectURL(b), name: nm, id: Math.random().toString(36).slice(2) }); }
  ev("gan_fast_pick", sub + "-" + fs.length); draw();
}
const kids = () => G.pics.length, boys = () => G.pics.filter(p => p.sub === "בנים").length, girls = () => kids() - boys();
const book = id => BOOKS.find(b => b.id === id);
function dedIdeas(){
  const b = book(G.topic), occ = (b && b.occ) || "general", sig = G.d.gan || "צוות הגן", set = DEDS[occ] || DEDS.general || {};
  return Object.values(set).map(v => (v.b || "").replace(/\{sig\}/g, sig)).filter(Boolean);
}

/* ---- ציור ---- */
function win(sub){
  const L = G.pics.map((p, i) => [p, i]).filter(([p]) => p.sub === sub), boy = sub === "בנים";
  return `<div class="gw ${boy ? "boy" : "girl"}" data-drop="${sub}">
    <div class="gwh"><b>${boy ? "👦 בנים" : "👧 בנות"}</b><span>${L.length}</span></div>
    <label class="gpick">➕ ${boy ? "תמונות של בנים" : "תמונות של בנות"}<input type="file" accept="image/*" multiple hidden data-pick="${sub}"></label>
    <p class="gdrop">או גוררים לכאן תמונות 📥</p>
    <div class="gl">${L.map(([p, i]) => `<div class="gp" draggable="true" data-id="${p.id}"><img src="${p.url}" alt="">
      <input data-name="${i}" value="${esc(p.name)}" placeholder="שם פרטי" maxlength="20" autocomplete="off" aria-label="שם ה${boy ? "ילד" : "ילדה"}">
      <div class="ga"><button type="button" data-mv="${i}" title="${boy ? "להעביר לבנות" : "להעביר לבנים"}">⇄ ${boy ? "לבנות" : "לבנים"}</button><button type="button" data-rm="${i}" title="למחוק" aria-label="למחוק">✕</button></div></div>`).join("")}</div>
  </div>`;
}
function doneLine(t, go){ return `<div class="gdone">✓ ${t}<button type="button" class="ged" data-go="${go}">לתקן</button></div>`; }
function draw(scroll){
  const h = [], b = book(G.topic);
  if (STEP !== "pics" && kids()) h.push(doneLine(`<b>${kids()} תמונות</b> · 👦 ${boys()} · 👧 ${girls()}`, "pics"));
  if (G.topic && !["pics", "topic", "check"].includes(STEP)) h.push(doneLine(`הנושא: <b>${esc(b.name)}</b>`, "topic"));
  if (G.ded && STEP === "details") h.push(doneLine("ההקדשה מוכנה", "ded"));
  h.push(stepHTML());
  box.innerHTML = h.join("");
  if (scroll) box.scrollIntoView({ behavior: "smooth", block: "start" });
}
function stepHTML(){
  const b = book(G.topic);
  if (STEP === "pics") return `<div class="gs"><h3><span class="gn">1</span>מעלים תמונות של הילדים</h3>
    <p class="gwarn">⚠️ <b>שימו לב לא להתבלבל:</b> תמונות של בנים – לחלון הבנים, ושל בנות – לחלון הבנות. טעיתם? לוחצים ⇄ ומעבירים.</p>
    <div class="gws">${win("בנים")}${win("בנות")}</div>
    <p class="gtip">✏️ ליד כל תמונה כותבים את <b>השם הפרטי</b> של הילד/ה – רק השם, כמו שיודפס בספר. · 📸 תמונה טובה: מבט ישר, פנים גלויות, ילד/ה אחד/ת, רקע בהיר. <a href="#photos">עוד טיפים ↓</a></p>
    <p class="gerr" id="gErr"></p>
    <button type="button" class="btn btn-main gnext" data-next="pics">הבא: בוחרים נושא ←</button></div>`;
  if (STEP === "topic") return `<div class="gs"><h3><span class="gn">2</span>בוחרים נושא אחד לכל הגן</h3>
    <div class="gbooks">${BOOKS.map(x => `<div class="gb ${x.id === G.topic ? "on" : ""}"><button type="button" class="gbi" data-topic="${x.id}"><img src="${window.bqCover ? bqCover(x) : ""}" alt="" loading="lazy"><b>${esc(x.name)}</b><small>${esc(x.d)}</small></button>
      <button type="button" class="gread" data-read="${x.id}">📖 לקרוא</button></div>`).join("")}</div></div>`;
  if (STEP === "check") return `<div class="gs gcheck"><h3><span class="gn">3</span>בטוחים בנושא?</h3>
    <img src="${window.bqCover ? bqCover(b) : ""}" alt=""><p class="gbig">📖 <b>${esc(b.name)}</b></p><p>${esc(b.d)}</p>
    <div class="gtwo"><button type="button" class="btn btn-main" data-next="check">✅ כן, זה הנושא</button><button type="button" class="btn btn-soft" data-go="topic">↩️ להחליף</button></div>
    <button type="button" class="gread" data-read="${b.id}">📖 לקרוא את הספר לפני</button></div>`;
  if (STEP === "ded") { const L = dedIdeas(); if (!G.ded) G.ded = L[0] || "";
    return `<div class="gs"><h3><span class="gn">4</span>הקדשה מטעם הגן 💌</h3>
    <p class="gh">מודפסת בעמוד השער של כל ספר. כתבנו לכם הצעה – אפשר לאשר, לשנות או לבחור אחרת.<br><b>בלי שמות</b> – השם של כל ילד כבר בספר. כותבים פעם אחת, ואת ההתאמה לבנים ולבנות אנחנו עושים.</p>
    <textarea id="gDed" maxlength="600">${esc(G.ded)}</textarea>
    <button type="button" class="galt" data-ded="next">✨ הקדשה אחרת</button><p class="gerr" id="gErr"></p>
    <button type="button" class="btn btn-main gnext" data-next="ded">הבא: הפרטים שלכם ←</button></div>`; }
  if (STEP === "details") { const n = kids(), d = G.d;
    const f = (id, lab, type, ac, ph) => `<label class="gf"><span>${lab}</span><input id="${id}" type="${type}" value="${esc(d[id] || "")}" autocomplete="${ac}" ${type === "tel" ? 'inputmode="tel"' : ""} placeholder="${ph || ""}"></label>`;
    return `<div class="gs"><h3><span class="gn">5</span>הפרטים שלכם ושולחים</h3>
    <div class="gform">${f("gan", "שם הגן", "text", "organization", "למשל: גן רימון")}${f("first", "שם פרטי", "text", "given-name")}${f("last", "שם משפחה", "text", "family-name")}${f("phone", "טלפון", "tel", "tel", "05X-XXXXXXX")}${f("email", "מייל", "email", "email")}${f("street", "כתובת למשלוח: רחוב ומספר", "text", "street-address")}${f("city", "עיר", "text", "address-level2")}</div>
    <p class="glab">כריכה</p><div class="gcov">${COVERS.map(([k, t]) => { const p = price(k, n); return `<label class="${G.cover === k ? "on" : ""}"><input type="radio" name="gCov" value="${k}" ${G.cover === k ? "checked" : ""}> ${t}<b>${p ? ils(p) + " לספר" : "מ-20 ספרים"}</b></label>`; }).join("")}</div>
    ${G.cover && price(G.cover, n) ? `<p class="gtot">💰 ${n} ספרים × ${ils(price(G.cover, n))} = <b>${ils(n * price(G.cover, n))}</b> <small>+ משלוח 40 ₪ (או איסוף עצמי)</small></p>` : ""}
    <label class="gchk"><input type="checkbox" id="mkWa" ${G.mkWa ? "checked" : ""}> <span>מאשר/ת לקבל עדכונים ומבצעים מ-BOOQLI בוואטסאפ (לא חובה)</span></label>
    <label class="gchk"><input type="checkbox" id="mkMail" ${G.mkMail ? "checked" : ""}> <span>מאשר/ת לקבל עדכונים ומבצעים מ-BOOQLI במייל (לא חובה)</span></label>
    <label class="gchk"><input type="checkbox" id="gOk"> <span>קראתי את <a href="https://www.booqli.ai/he/terms-of-service" target="_blank" rel="noopener">התקנון</a> ואת <a href="https://www.booqli.ai/he/privacy-policy" target="_blank" rel="noopener">מדיניות הפרטיות</a>, וקיבלנו אישור מההורים לשלוח את התמונות ליצירת הספר.</span></label>
    <p class="gerr" id="gErr"></p>
    <button type="button" class="btn btn-wa gsend" id="gSend">✅ שולחים את ההזמנה</button>
    <p class="gh" style="text-align:center">משלמים רק אחרי שרואים את הסקיצות ואוהבים 💛</p></div>`; }
  return "";
}
const err = t => { const e = $("gErr"); if (e) e.textContent = t; };
function readDetails(){ ["gan", "first", "last", "phone", "email", "street", "city"].forEach(k => { const e = $(k); if (e) G.d[k] = e.value.trim(); });
  const c = box.querySelector("input[name=gCov]:checked"); if (c) G.cover = c.value;
  const w = $("mkWa"), m = $("mkMail"); if (w) G.mkWa = w.checked; if (m) G.mkMail = m.checked; }

/* ---- אירועים ---- */
box.addEventListener("change", e => {
  const p = e.target.dataset.pick; if (p && e.target.files.length) { addFiles(p, e.target.files); e.target.value = ""; return; }
  if (e.target.name === "gCov") { readDetails(); draw(); }
});
box.addEventListener("input", e => {
  const i = e.target.dataset.name; if (i !== undefined) { const v = cleanName(e.target.value); if (v !== e.target.value) e.target.value = v; G.pics[+i].name = v; }
  if (e.target.id === "gDed") G.ded = e.target.value;
});
box.addEventListener("click", e => {
  const t = e.target.closest("button,[data-go]"); if (!t) return;
  if (t.dataset.go) { readDetails(); STEP = t.dataset.go; draw(true); return; }
  if (t.dataset.rm !== undefined) { const x = G.pics.splice(+t.dataset.rm, 1)[0]; if (x) URL.revokeObjectURL(x.url); draw(); return; }
  if (t.dataset.mv !== undefined) { const x = G.pics[+t.dataset.mv]; x.sub = x.sub === "בנים" ? "בנות" : "בנים"; draw(); return; }
  if (t.dataset.read) { if (window.bqRead) bqRead(t.dataset.read, 0); return; }
  if (t.dataset.topic) { G.topic = t.dataset.topic; G.ded = ""; G.dedI = 0; STEP = "check"; ev("gan_fast_step", "topic-" + G.topic); draw(true); return; }
  if (t.dataset.ded) { const L = dedIdeas(); G.dedI = (G.dedI + 1) % Math.max(1, L.length); G.ded = L[G.dedI] || ""; $("gDed").value = G.ded; return; }
  if (t.dataset.next === "pics") {
    if (!kids()) return err("📷 מעלים לפחות תמונה אחת");
    const miss = G.pics.findIndex(p => !p.name.trim()); if (miss >= 0) { err("✏️ חסר שם פרטי ליד אחת התמונות"); const inp = box.querySelector(`[data-name="${miss}"]`); if (inp) { inp.focus(); inp.classList.add("bad"); } return; }
    STEP = G.topic ? "ded" : "topic"; ev("gan_fast_step", "pics-" + kids()); draw(true); return; }
  if (t.dataset.next === "check") { STEP = "ded"; ev("gan_fast_step", "check"); draw(true); return; }
  if (t.dataset.next === "ded") { const v = ($("gDed").value || "").trim(); if (!v) return err("✍️ כותבים הקדשה, או לוחצים על ✨ הקדשה אחרת"); G.ded = v; STEP = "details"; ev("gan_fast_step", "ded"); draw(true); return; }
  if (t.id === "gSend") send();
});
/* גרירה (במחשב): קבצים מהמחשב לחלון, או תמונה מחלון לחלון */
box.addEventListener("dragstart", e => { const p = e.target.closest(".gp"); if (p) { e.dataTransfer.setData("text/bq-id", p.dataset.id); e.dataTransfer.effectAllowed = "move"; } });
box.addEventListener("dragover", e => { const w = e.target.closest("[data-drop]"); if (w) { e.preventDefault(); w.classList.add("over"); } });
box.addEventListener("dragleave", e => { const w = e.target.closest("[data-drop]"); if (w && !w.contains(e.relatedTarget)) w.classList.remove("over"); });
box.addEventListener("drop", e => { const w = e.target.closest("[data-drop]"); if (!w) return; e.preventDefault(); w.classList.remove("over");
  const id = e.dataTransfer.getData("text/bq-id");
  if (id) { const x = G.pics.find(p => p.id === id); if (x && x.sub !== w.dataset.drop) { x.sub = w.dataset.drop; draw(); } return; }
  if (e.dataTransfer.files && e.dataTransfer.files.length) addFiles(w.dataset.drop, e.dataTransfer.files); });

/* ---- שליחה: חלון קופץ מיד, מעלים 3 תמונות במקביל, סיכום עם כל הפרטים ---- */
function modal(html){ let m = $("gModal"); if (!m) { m = document.createElement("div"); m.id = "gModal"; m.className = "gmodal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); document.body.appendChild(m); }
  m.innerHTML = `<div class="gcard">${html}</div>`; m.hidden = false; document.body.style.overflow = "hidden"; }
function closeModal(){ const m = $("gModal"); if (m) m.hidden = true; document.body.style.overflow = ""; }
const NEXT = `<ol class="gnextl"><li>🎨 <b>מכינים את הסקיצות</b> – בין כמה דקות ליום עסקים אחד – ושולחים לכם בוואטסאפ קישור לתיקייה לצפייה</li><li>😍 <b>אהבתם?</b> ממשיכים לתשלום ולהדפסה</li><li>🤝 <b>לא אהבתם?</b> נפרדים כידידים – בלי לשלם כלום</li></ol>`;
async function send(){
  readDetails(); const d = G.d;
  const need = [["gan", "שם הגן"], ["first", "שם פרטי"], ["last", "שם משפחה"], ["phone", "טלפון"], ["email", "מייל"], ["street", "כתובת"], ["city", "עיר"]].find(([k]) => !d[k]);
  if (need) { err("✏️ חסר: " + need[1]); const e = $(need[0]); if (e) e.focus(); return; }
  { const dg = d.phone.replace(/\D/g, ""); if (dg.length < 9 || dg.length > 12) { err("📞 בודקים את מספר הטלפון"); $("phone").focus(); return; } }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) { err("✉️ בודקים את כתובת המייל"); $("email").focus(); return; }
  if (!G.cover) return err("📕 בוחרים כריכה");
  if (!$("gOk").checked) return err("☑️ מסמנים שקראתם את התקנון ומדיניות הפרטיות");
  const btn = $("gSend"); if (btn.dataset.busy) return; btn.dataset.busy = "1"; err("");
  modal(`<div class="gbig2">💛</div><h3>ברגעים אלו אנחנו מקבלים את ההזמנה של ${esc(d.gan)}</h3>${NEXT}
    <div class="gprog"><span id="gBar"></span></div><p class="gst" id="gSt">⏳ שולחים…</p><p class="gfine">לא סוגרים את העמוד עד שמופיע ✅</p>`);
  ev("gan_fast_send", String(kids()));
  try {
    const J = (path, body, tok) => fetch(API + path, { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, tok ? { "X-Tok": tok } : {}), body: JSON.stringify(body) }).then(r => r.json());
    let s; try { s = await J("start", { kind: "gan", gan: d.gan, who: d.first + " " + d.last, book: G.topic, consent: true }); } catch (x) { throw new Error("start: " + (x && x.message || x)); } if (!s.ok) throw new Error("start: " + (s.error || "?"));
    let done = 0, bad = 0; const q = G.pics.slice();
    const one = async p => { let ok = false;
      for (let t = 0; t < 2 && !ok; t++) { try { ok = (await fetch(API + "photo?sub=" + encodeURIComponent(p.sub) + "&name=" + encodeURIComponent(p.name.trim()), { method: "POST", headers: { "Content-Type": "image/jpeg", "X-Tok": s.tok }, body: p.blob })).ok; } catch (e) {} }
      if (!ok) bad++; done++; const st = $("gSt"), bar = $("gBar"); if (st) st.textContent = `⏳ שומרים את התמונות… ${done} מתוך ${q.length}`; if (bar) bar.style.width = Math.round(100 * done / q.length) + "%"; };
    const workers = Array.from({ length: Math.min(3, q.length) }, async () => { while (q.length) await one(q.shift()); });
    await Promise.all(workers);
    if (bad) throw new Error("photos-" + bad);
    const b = book(G.topic), n = kids(), p = price(G.cover, n);
    const summary = [`🏫 ${d.gan}`, `👤 ${d.first} ${d.last} · 📞 ${d.phone} · ✉️ ${d.email}`, `🏠 ${d.street}, ${d.city}`, "",
      `📖 הנושא: ${b.name}`, `👧👦 ${n} ילדים (👦 ${boys()} · 👧 ${girls()})`, `📕 ${COVERS.find(c => c[0] === G.cover)[1]}${p ? ` · ${n} × ${p} ₪ = ${n * p} ₪ (+ משלוח 40 ₪ או איסוף עצמי)` : ""}`, "",
      "💌 ההקדשה:", G.ded, "", "📷 השמות:", ...G.pics.map(x => (x.sub === "בנות" ? "👧 " : "👦 ") + x.name.trim()), "",
      `📣 דיוור בוואטסאפ: ${G.mkWa ? "מאשר/ת ✔️" : "לא"} · במייל: ${G.mkMail ? "מאשר/ת ✔️" : "לא"}`,
      `✓ אישור (${new Date().toLocaleString("he-IL")}): קראתי את התקנון ואת מדיניות הפרטיות, וקיבלנו אישור מההורים לשלוח את התמונות ליצירת הספר.`,
      SRC ? "מקור: " + SRC : ""].join("\n");
    const r = await J("done", { summary }, s.tok); if (!r.ok) throw new Error("done");
    ev("gan_fast_done", String(n));
    const t = `שלום BOOQLI 💛 שלחנו עכשיו באתר את הזמנה ${s.oid} · ${d.gan} (${n} ילדים, ${b.name})`;
    modal(`<div class="gbig2">✅</div><h3>קיבלנו את ההזמנה של ${esc(d.gan)}!</h3><p class="gbig">מספר ההזמנה: <b>${esc(s.oid)}</b></p>${NEXT}
      <a class="btn btn-wa gsend" id="gWa" href="https://wa.me/${PHONE}?text=${encodeURIComponent(t)}">💬 לעדכן אותנו בוואטסאפ</a><button type="button" class="galt" id="gClose">סגירה</button>`);
    $("gWa").onclick = () => ev("gan_fast_wa", ""); $("gClose").onclick = closeModal;
    box.innerHTML = `<div class="gs"><h3>✅ ההזמנה ${esc(s.oid)} אצלנו</h3><p class="gh">שמש תעבור על התמונות, תכין את הסקיצות ותחזור אליכם בוואטסאפ. אפשר לסגור את העמוד.</p></div>`;
  } catch (e) {
    ev("gan_fast_fail", String(e && e.message || e)); delete btn.dataset.busy;
    const code = String(e && e.message || e).slice(0, 60);
    modal(`<div class="gbig2">😕</div><h3>משהו לא נשלח</h3><p>בודקים את האינטרנט ולוחצים שוב על "שולחים". אם זה חוזר – כתבו לנו בוואטסאפ ונעזור מיד.</p><p class="gfine" dir="ltr">(${esc(code)})</p>
      <a class="btn btn-wa gsend" href="https://wa.me/${PHONE}?text=${encodeURIComponent("היי BOOQLI, ניסיתי לשלוח הזמנה לגן באתר וזה לא עבר 🙏")}">💬 וואטסאפ</a><button type="button" class="galt" id="gClose">חזרה</button>`);
    $("gClose").onclick = closeModal;
  }
}
draw();
})();
