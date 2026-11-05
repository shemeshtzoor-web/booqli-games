/* בדיקה: "הסר" / "התחל" / "מחק" – לפי מדיניות הפרטיות (סעיף וואטסאפ). מריצים: node worker/test-optout.mjs */
import { handle } from "./wa-bot.js";
const drive = []; let fail = 0;
globalThis.fetch = async (u, o) => {
  u = String(u);
  if (u.includes("graph.facebook.com") && !(o && o.method)) return { ok: true, json: async () => ({ url: "https://media/x", mime_type: "image/jpeg" }) };
  if (u.startsWith("https://media/")) return { ok: true, arrayBuffer: async () => new ArrayBuffer(10) };
  if (u === "DRIVE") { const b = JSON.parse(o.body); drive.push(b); return { ok: true, json: async () => ({ ok: true, file: "https://drive.google.com/file/d/FILE" + drive.length + "xxxxxxxxxxxxxxxxxxxx/view" }) }; }
  return { ok: true, json: async () => ({}) };
};
const env = { DRIVE_URL: "DRIVE", DRIVE_KEY: "k", WA_TOKEN: "t", WA_PHONE_ID: "p", STATE: { put: async () => {}, get: async () => null, delete: async () => {} } };
const say = m => m.type === "text" ? m.text.body : m.type === "interactive" ? m.interactive.body.text + " {" + (m.interactive.action.buttons || []).map(b => b.reply.title).join(" | ") + "}" : m.type;
async function step(mem, from, ev, label, expect){
  const log = []; await handle(env, from, "בודקת", ev, { mem, log });
  const out = log.map(say).join(" ⏎ ");
  const ok = expect(out, log);
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} ${label}: ${out.replace(/\n/g, " / ").slice(0, 160) || "(שקט)"}`);
}

/* 1. הסר באמצע הזמנה ← שקט ← התחל ← ממשיכים מאותה שאלה */
let mem = {};
await step(mem, "31", { text: "היי" }, "פתיחה", o => o.length > 0);
await step(mem, "31", { id: "s:go" }, "רוצה ספר", o => o.length > 0);
await step(mem, "31", { text: "הסר" }, "הסר", o => /לא נשלח לך יותר/.test(o));
await step(mem, "31", { text: "מה קורה?" }, "כותבת אחרי הסרה", o => o === "");
await step(mem, "31", { id: "f:g:g" }, "לוחצת על כפתור ישן אחרי הסרה", o => o === "");
await step(mem, "31", { text: "STOP" }, "STOP באנגלית", o => /לא נשלח לך יותר/.test(o));
await step(mem, "31", { text: "התחל" }, "התחל", o => o.length > 0 && !/לא נשלח/.test(o));

/* 2. "מחק" ← שואל ← לא, טעות ← כלום לא נמחק */
mem = {};
await step(mem, "32", { text: "היי" }, "פתיחה", o => o.length > 0);
await step(mem, "32", { text: "תמחקו את כל הפרטים שלי" }, "מבקשת מחיקה", o => /למחוק את כל הפרטים/.test(o) && /כן, למחוק/.test(o));
await step(mem, "32", { id: "erase:no" }, "לא, טעות", o => /לא מחקנו כלום/.test(o));
await step(mem, "32", { id: "erase:yes" }, "כפתור ישן 'כן' אחרי שביטלה", o => o === "");
console.log(mem["st:32"] ? "✓ ההזמנה נשארה" : (fail++, "✗ ההזמנה נמחקה למרות 'לא'"));

/* 3. הזמנה פרטית מלאה ← "מחק" ← כן ← הכל נמחק + פעולת erase לדרייב */
mem = {}; drive.length = 0;
for (const ev of [{ text: "היי" }, { id: "s:go" }, { id: "f:g:g" }, { id: "b:birthday" }, { text: "נועה" }, { id: "d:ok" }, { image: { media: "a", sha: "1" } }, { id: "p:done" }])
  await handle(env, "33", "רינה", ev, { mem, log: [] });
const oid = JSON.parse(mem["st:33"]).oid;
await step(mem, "33", { text: "מחק" }, "מחק", o => /כן, למחוק/.test(o));
await step(mem, "33", { id: "erase:yes" }, "כן, למחוק", o => /מחקנו את כל מה שקיבלנו/.test(o));
const left = Object.keys(mem).filter(k => k.includes("33") || k.includes(oid));
console.log(left.length ? (fail++, "✗ נשאר בזיכרון: " + left.join(", ")) : "✓ שום דבר לא נשאר בזיכרון הבוט");
const er = drive.find(d => d.action === "erase");
console.log(er && er.orders.includes(oid) && er.phone === "33" ? "✓ נשלחה מחיקה לדרייב: " + er.orders.join(",") : (fail++, "✗ לא נשלחה מחיקה לדרייב"));

/* 4. לא מתבלבלים: "מחק את התמונה של דני" / "די" / "להסיר את הכריכה" – לא הסרה ולא מחיקה */
mem = {};
await step(mem, "34", { text: "היי" }, "פתיחה", o => o.length > 0);
for (const t of ["מחק את התמונה של דני", "די", "אפשר להסיר את השם מהכריכה?", "stop it please"])
  await step(mem, "34", { text: t }, `"${t}"`, o => !/לא נשלח לך יותר|למחוק את כל הפרטים/.test(o));
console.log(mem["stop:34"] ? (fail++, "✗ סומן כהסרה בטעות") : "✓ לא סומן כהסרה");

console.log(fail ? `\n✗ ${fail} בעיות` : "\nאין בעיות ✓");
process.exit(fail ? 1 : 0);
