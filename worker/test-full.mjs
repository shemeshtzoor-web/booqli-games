/* בדיקה מלאה: סבתא, הורה ל-2, גננת עם נושא אחד, גננת עם 2 נושאים – עם "דרייב" מדומה */
import { handle } from "./wa-bot.js";
const drive = [], issues = [];
globalThis.fetch = async (u, o) => {
  u = String(u);
  if (u.includes("graph.facebook.com") && !(o && o.method)) return { ok: true, json: async () => ({ url: "https://media/x", mime_type: "image/jpeg" }) };
  if (u.startsWith("https://media/")) return { ok: true, arrayBuffer: async () => new ArrayBuffer(10) };
  if (u === "DRIVE") { const b = JSON.parse(o.body); drive.push(b); return { ok: true, json: async () => ({ ok: true, file: "https://drive.google.com/file/d/FILE" + drive.length + "xxxxxxxxxxxxxxxxxxxx/view", folder: "F", doc: "D" }) }; }
  return { ok: true, json: async () => ({}) };
};
const env = { DRIVE_URL: "DRIVE", DRIVE_KEY: "k", WA_TOKEN: "t", WA_PHONE_ID: "p", STATE: { put: async () => {}, get: async () => null, delete: async () => {} } };
const fmt = m => { const q = m.context ? "↩︎ " : ""; if (m.type === "video") return "  🎬 " + m.video.caption; if (m.type === "document") return "  📄 " + m.document.filename;
  if (m.type === "text") return "  " + q + "💬 " + m.text.body.replace(/\n/g, " / ").slice(0, 230);
  if (m.type === "image") return "  🖼 " + m.image.caption;
  const i = m.interactive, b = i.type === "button" ? " {" + i.action.buttons.map(x => x.reply.title).join(" | ") + "}" : " {רשימה: " + i.action.sections[0].rows.map(r => r.title).join(" | ") + "}";
  return "  " + q + (i.type === "button" ? "🔘 " : "📋 ") + i.body.text.replace(/\n/g, " / ").slice(0, 230) + b; };
function check(who, label, log){
  if (!log.length) issues.push(`${who} · ${label}: הבוט שתק`);
  for (const m of log) {
    if (m.type === "interactive") {
      const i = m.interactive;
      if (i.body.text.length > 1024) issues.push(`${who} · ${label}: הודעה ארוכה מדי`);
      if (i.type === "button") for (const x of i.action.buttons) if (x.reply.title.length > 20) issues.push(`${who} · ${label}: כפתור ארוך "${x.reply.title}"`);
      if (i.type === "list") { const r = i.action.sections[0].rows; if (r.length > 10) issues.push(`${who} · ${label}: יותר מ-10 שורות`); for (const x of r) if (x.title.length > 24) issues.push(`${who} · ${label}: שורה ארוכה "${x.title}"`); }
    }
    const body = ["document", "video"].includes(m.type) ? "" : JSON.stringify(m);
    if (/https?:\/\//.test(body) && !/booqli\.ai\/he\/(terms|privacy)/.test(body)) issues.push(`${who} · ${label}: קישור החוצה`);
  }
  const last = log[log.length - 1];
  if (last && last.type !== "interactive" && !(last.type === "text" && /[?👇]|כותבים|כתבו|שולחים|תודה רבה|קיבלנו את ההזמנה|הבא\/ה/.test(last.text.body))) issues.push(`${who} · ${label}: ההודעה האחרונה לא שאלה: ${(last.text || {}).body || last.type}`);
}
async function run(who, from, profile, steps, show = true){
  const mem = {}; drive.length = 0;
  console.log("\n████ " + who);
  for (const [ev, label] of steps) {
    const log = []; await handle(env, from, profile, ev, { mem, log });
    if (show) { console.log("▶ " + label); log.forEach(m => console.log(fmt(m))); }
    check(who, label, log);
  }
  const st = JSON.parse(mem["st:" + from]);
  console.log("📁 דרייב:", drive.filter(d => d.action !== "ping").map(d => d.action === "photo" ? `תמונה: ${d.topic ? d.topic + "/" : ""}${d.sub}/${d.name}.jpg` : d.action === "ded" ? `הקדשה: ${d.topic ? d.topic + "/" : ""}${d.sub}` : d.action === "note" ? "📄 " + d.name + ": " + d.text.replace(/\n/g, " | ") : d.action).join("\n          "));
  return { st, mem };
}

/* 1. סבתא – נכדה, בלי טעויות + מתחרטת בהקדשה + שואלת איזו תמונה */
await run("סבתא רינה", "11", "רינה", [
  [{ text: "היי" }, "שלום"], [{ id: "s:go" }, "רוצה ספר"], [{ id: "f:g:g" }, "לנכדה"], [{ id: "b:birthday" }, "יום הולדת"],
  [{ text: "נועה כהן" }, "שם + משפחה"], [{ id: "nm:first" }, "רק נועה"], [{ id: "d:own" }, "אכתוב בעצמי"], [{ text: "אני מעדיפה את הרעיון שלך" }, "מתחרטת"], [{ id: "d:ok" }, "מאשרת"], [{ text: "מחיר" }, "כותבת מחיר באמצע"], [{ id: "qa:go" }, "ממשיכים"],
  [{ text: "איזה תמונה לשלוח?" }, "שואלת איזו תמונה"], [{ id: "qa:go" }, "ממשיכים"],
  [{ image: { media: "a", sha: "1" } }, "תמונה 1"], [{ image: { media: "b", sha: "2" } }, "תמונה 2"], [{ id: "p:done" }, "סיימתי"],
  [{ text: "מה ההבדל בין הכריכות?" }, "שואלת על כריכות"], [{ id: "qa:go" }, "ממשיכים"], [{ id: "cv:hard" }, "קשה"],
  [{ id: "w:yes" }, "השם שלי"], [{ id: "m:no" }, "זהו"], [{ id: "sh:ship" }, "משלוח"], [{ text: "הרצל 5, חיפה" }, "כתובת"], [{ id: "ph:yes" }, "הטלפון הזה"], [{ text: "רינה כהן@" }, "אימייל לא תקין"], [{ text: "rina.cohen@gmail.com" }, "אימייל"],
  [{ id: "pay:bit" }, "ביט"], [{ id: "c:yes" }, "מאשרת"], [{ text: "תודה!" }, "תודה אחרי ההזמנה"]]);

/* 2. אבא – 2 ילדים, בן ובת, לוחץ על כפתורים ישנים, מבקש בן אדם וממשיך */
await run("אבא דני", "22", "דני", [
  [{ text: "שלום, אפשר פרטים?" }, "פתיחה"], [{ id: "s:go" }, "ספר"], [{ id: "f:p:b" }, "לבן"], [{ id: "b:superhero" }, "גיבור על"],
  [{ text: "איתי" }, "שם"], [{ id: "d:next" }, "הקדשה אחרת"], [{ id: "d:ok" }, "מאשר"],
  [{ text: "אפשר לדבר עם שמש?" }, "מבקש בן אדם"], [{ text: "בעצם נמשיך" }, "כותב בזמן המתנה"], [{ id: "resume" }, "חוזר להזמנה"],
  [{ image: { media: "c", sha: "3" } }, "תמונה"], [{ id: "p:done" }, "סיימתי"], [{ id: "cv:soft" }, "רכה"],
  [{ id: "w:other" }, "שם אחר"], [{ text: "דני לוי" }, "השם שלי"], [{ id: "cv:hard" }, "כפתור ישן – מחליף לקשה"], [{ id: "m:yes" }, "עוד ספר"], [{ id: "f:p:g" }, "לבת"], [{ id: "b:hugs" }, "חיבוקים"],
  [{ text: "מיה" }, "שם"], [{ id: "d:ok" }, "הקדשה"], [{ image: { media: "d", sha: "4" }, caption: "מיה" }, "תמונה"], [{ id: "p:done" }, "סיימתי"], [{ id: "cv:hard" }, "קשה"],
  [{ id: "m:no" }, "זהו"], [{ id: "sh:pickup" }, "איסוף"], [{ text: "רוטשילד 10 תל אביב" }, "כתובת"], [{ id: "ph:other" }, "מספר אחר"], [{ text: "052-1234567" }, "טלפון"], [{ id: "em:none" }, "אין אימייל"],
  [{ id: "pay:bank" }, "העברה"], [{ id: "sh:ship" }, "כפתור ישן – בעצם משלוח"], [{ text: "רוטשילד 10 תל אביב" }, "כתובת שוב"], [{ id: "ph:yes" }, "טלפון"], [{ text: "dani@walla.co.il" }, "אימייל"], [{ id: "pay:bank" }, "העברה"], [{ id: "c:yes" }, "מאשר"]]);

/* 3. גננת – פיילוט: נושא אחד, כל תמונה עם כיתוב שם + בן/בת, בכל סדר */
await run("גננת מירב (פיילוט)", "33", "מירב", [
  [{ text: "אני גננת" }, "פתיחה"], [{ id: "s:gan" }, "גן"], [{ text: "גן רימון, חיפה" }, "שם הגן"], [{ text: "מירב" }, "שמי"], [{ text: "24" }, "ילדים"],
  [{ id: "gb:hugs" }, "חיבוקים"], [{ text: "מחיר" }, "כותבת מחיר"], [{ id: "qa:go" }, "ממשיכים"],
  [{ id: "gw:me" }, "אני שולחת"],
  [{ text: "איזו תמונה לשלוח?" }, "שואלת איזו תמונה"], [{ id: "qa:go" }, "ממשיכים"],
  [{ image: { media: "g1", sha: "g1" }, caption: "נועה בת", mid: "w1" }, "נועה בת"],
  [{ image: { media: "b1", sha: "b1" }, caption: "דני בן", mid: "w2" }, "דני בן"],
  [{ image: { media: "g2", sha: "g2" }, caption: "תמר", mid: "w3" }, "תמר בלי בן/בת"], [{ id: "gx:g" }, "בת"],
  [{ image: { media: "g3", sha: "g3" }, mid: "w4" }, "בלי כיתוב"], [{ text: "שירה בת" }, "של מי"],
  [{ image: { media: "g1", sha: "g1" }, caption: "נועה בת", mid: "w5" }, "אותה תמונה שוב"],
  [{ image: { media: "g5", sha: "g5" }, caption: "נועה בת", mid: "w6" }, "נועה שוב (תמונה אחרת)"], [{ id: "gr:new" }, "ילדה אחרת"],
  [{ image: { media: "m1", sha: "m1" }, caption: "מרים בן", mid: "w7" }, "מרים – בטעות בן"], [{ text: "מרים לבנות" }, "תיקון"],
  [{ id: "g:pause" }, "נמשיך מחר"], [{ text: "להמשיך" }, "ממשיכה"],
  [{ text: "עידו בן" }, "שם לפני תמונה"], [{ image: { media: "b2", sha: "b2" }, mid: "w8" }, "תמונה"],
  [{ image: { media: "b3", sha: "b3" }, caption: "עידו בן", mid: "w9" }, "עידו שוב"], [{ id: "gr:rep" }, "להחליף"],
  [{ id: "g:fin" }, "סיימתי"], [{ id: "g:ok" }, "הכל נכון"], [{ text: "מה ההבדל?" }, "שואלת על כריכות"], [{ id: "qa:go" }, "ממשיכים"], [{ id: "c:staple" }, "סיכות"], [{ id: "gd:next" }, "הקדשה אחרת"], [{ id: "gd:ok" }, "מאשרת הקדשה"], [{ id: "sh:ship" }, "משלוח"], [{ text: "הגפן 3 חיפה" }, "כתובת"], [{ id: "ph:yes" }, "טלפון"], [{ id: "pay:bank" }, "העברה"], [{ id: "gc:yes" }, "מאשרת"]]);

/* 5. מקרים קשים: הודעות סתם, "מחדש" באמצע, כפתור להתחלה */
await run("מקרים קשים", "55", "", [
  [{ text: "?" }, "סימן שאלה"], [{ text: "בלה בלה" }, "סתם"], [{ id: "s:go" }, "ספר"], [{ id: "restart" }, "להתחלה"], [{ id: "restart:no" }, "לא, ממשיכים"],
  [{ id: "f:g:b" }, "לנכד"], [{ text: "חחחח" }, "סתם בבחירת ספר"], [{ id: "b:druki" }, "דרוקי"], [{ text: "123" }, "שם לא תקין"], [{ text: "אורי" }, "שם"],
  [{ text: "מחדש" }, "מחדש"], [{ id: "s:gan" }, "גן"], [{ text: "כן" }, "שם גן לא תקין"]]);

console.log("\n\n════ בעיות ════\n" + (issues.length ? issues.join("\n") : "אין ✓"));
