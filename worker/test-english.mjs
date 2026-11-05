/* בדיקה: מי שכותב באנגלית – שמש עונה בעצמה, אפשר להמשיך בעברית. מריצים: node worker/test-english.mjs */
import { handle } from "./wa-bot.js";
let fail = 0;
globalThis.fetch = async () => ({ ok: true, json: async () => ({ ok: true }) });
const env = { WA_TOKEN: "t", WA_PHONE_ID: "p", STATE: { put: async () => {}, get: async () => null, delete: async () => {} } };
const say = m => m.type === "text" ? m.text.body : m.type === "interactive" ? m.interactive.body.text + " {" + ((m.interactive.action.buttons || []).map(b => b.reply.title).join(" | ") || "רשימה") + "}" : m.type;
async function step(mem, from, ev, label, expect){
  const log = []; await handle(env, from, "Test", ev, { mem, log });
  for (const m of log) if (m.type === "interactive" && m.interactive.type === "button") for (const b of m.interactive.action.buttons) if (b.reply.title.length > 20) { fail++; console.log("✗ כפתור ארוך: " + b.reply.title); }
  const out = log.map(say).join(" ⏎ "), ok = expect(out);
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} ${label}: ${out.replace(/\n/g, " / ").slice(0, 170) || "(שקט)"}`);
}
const EN = o => /Shemesh will reply/.test(o), HE_WELCOME = o => /סבאבוקלי/.test(o);
let mem = {};
await step(mem, "41", { text: "Hello, I'd like to order a book" }, "פותח באנגלית", o => EN(o) && !HE_WELCOME(o));
await step(mem, "41", { text: "How much does it cost?" }, "עוד שאלה באנגלית", o => /Got it/.test(o));
await step(mem, "41", { id: "en:he" }, "להמשיך בעברית", o => HE_WELCOME(o));
await step(mem, "41", { id: "s:go" }, "ממשיך בבוט", o => o.length > 0 && !EN(o));
mem = {};
await step(mem, "42", { text: "Hi" }, "\"Hi\" ראשון", o => EN(o));
mem = {};
await step(mem, "43", { text: "שלום" }, "שלום בעברית", o => HE_WELCOME(o) && !EN(o));
await step(mem, "43", { id: "s:go" }, "ספר", o => o.length > 0);
await step(mem, "43", { text: "ok" }, "ok באמצע", o => !EN(o));
await step(mem, "43", { text: "thanks!" }, "thanks באמצע", o => !EN(o));
await step(mem, "43", { text: "Can someone help me in English please?" }, "משפט באנגלית באמצע", o => EN(o));
await step(mem, "43", { id: "en:he" }, "חוזר לעברית", o => /ממשיכים/.test(o));
await step(mem, "43", { text: "STOP" }, "STOP", o => /לא נשלח לך יותר/.test(o));
console.log(fail ? `\n✗ ${fail} בעיות` : "\nאין בעיות ✓"); process.exit(fail ? 1 : 0);
