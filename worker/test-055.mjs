/* בדיקה: חיבור 055 – הבוט לא עונה ב-055 עד ES_LIVE="1", לא עונה לאנשי קשר מוכרים (היסטוריה / #ידני), ועונה מהמספר הנכון. node worker/test-055.mjs */
import worker from "./wa-bot.js";
let fail = 0; const sent = [];
const kv = {};
const STATE = { get: async k => kv[k] ?? null, put: async (k, v) => { kv[k] = v; }, delete: async k => { delete kv[k]; },
  list: async ({ prefix }) => ({ keys: Object.keys(kv).filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }) };
globalThis.fetch = async (u, o) => { u = String(u); if (u.includes("/messages") && o && o.body) { const b = JSON.parse(o.body); if (b.to) sent.push({ phone: u.split("/").slice(-2)[0], auth: o.headers.Authorization, to: b.to }); } return { ok: true, json: async () => ({}) }; };
const base = { WA_TOKEN: "TEST_TOKEN", WA_PHONE_ID: "111", STATE };
kv["es:conn"] = JSON.stringify({ phone: "555", waba: "9", token: "REAL_TOKEN" });
async function hook(env, field, value){
  const jobs = []; const req = new Request("https://x/wa", { method: "POST", body: JSON.stringify({ entry: [{ changes: [{ field, value }] }] }) });
  await worker.fetch(req, env, { waitUntil: p => jobs.push(p) }); await Promise.all(jobs);
}
const msg = (pid, from, text) => ({ metadata: { phone_number_id: pid }, contacts: [{ profile: { name: "x" } }], messages: [{ from, id: "m" + Math.random(), type: "text", text: { body: text } }] });
function check(label, ok){ if (!ok) fail++; console.log((ok ? "✓ " : "✗ ") + label); }

sent.length = 0; await hook(base, "messages", msg("111", "972500000001", "היי"));
check("מספר הבדיקה – הבוט עונה ממספר הבדיקה", sent.length > 0 && sent.every(s => s.phone === "111" && s.auth === "Bearer TEST_TOKEN"));
sent.length = 0; await hook(base, "messages", msg("555", "972500000002", "היי"));
check("055 לפני ES_LIVE – הבוט שותק", sent.length === 0);
const live = Object.assign({}, base, { ES_LIVE: "1" });
sent.length = 0; await hook(live, "messages", msg("555", "972500000003", "היי"));
check("055 אחרי ES_LIVE – עונה מ-055 עם המפתח של 055", sent.length > 0 && sent.every(s => s.phone === "555" && s.auth === "Bearer REAL_TOKEN"));
await hook(live, "history", { metadata: { phone_number_id: "555" }, history: [{ threads: [{ id: "972500000004" }] }] });
await hook(live, "smb_app_state_sync", { metadata: { phone_number_id: "555" }, state_sync: [{ type: "contact", action: "add", contact: { phone_number: "+972 50-000-0005" } }] });
sent.length = 0; await hook(live, "messages", msg("555", "972500000004", "מה נשמע?"));
await hook(live, "messages", msg("555", "972500000005", "היי"));
check("אנשי קשר מההיסטוריה ומאנשי הקשר – הבוט לא עונה", sent.length === 0);
await hook(live, "smb_message_echoes", { metadata: { phone_number_id: "555" }, message_echoes: [{ to: "972500000004", text: { body: "#בוט" } }] });
sent.length = 0; await hook(live, "messages", msg("555", "972500000004", "אני רוצה להזמין ספר"));
check("#בוט לאיש קשר מוכר – הבוט כן עונה", sent.length > 0);
await hook(live, "smb_message_echoes", { metadata: { phone_number_id: "555" }, message_echoes: [{ to: "972500000003", text: { body: "#ידני" } }] });
sent.length = 0; await hook(live, "messages", msg("555", "972500000003", "עוד שאלה"));
check("#ידני – הבוט לא עונה יותר", sent.length === 0);
sent.length = 0; await hook(live, "messages", msg("111", "972500000004", "היי"));
check("מספר הבדיקה ממשיך לעבוד גם עם 055", sent.length > 0 && sent.every(s => s.phone === "111"));
console.log(fail ? `\n✗ ${fail} בעיות` : "\nאין בעיות ✓"); process.exit(fail ? 1 : 0);
