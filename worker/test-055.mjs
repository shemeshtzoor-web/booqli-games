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
/* אבטחה: /es מחבר רק חשבון של העסק של BOOQLI (653487867852808); /orders סגור בלי ORDERS_KEY */
async function es(owner){
  const calls = [];
  globalThis.fetch = async (u, o) => { u = String(u); calls.push(u);
    if (u.includes("oauth/access_token")) return { ok: true, json: async () => ({ access_token: "NEW" }) };
    if (u.includes("owner_business_info")) return { ok: true, json: async () => ({ owner_business_info: { id: owner } }) };
    return { ok: true, json: async () => ({ success: true }) }; };
  const req = new Request("https://x/es", { method: "POST", headers: { Origin: "https://www.booqli.ai", "Content-Type": "application/json" },
    body: JSON.stringify({ code: "c", waba_id: "77", phone_number_id: "88", business_id: owner }) });
  const r = await worker.fetch(req, Object.assign({}, base, { ES_APP_SECRET: "s" }), { waitUntil: () => {} });
  return { st: r.status, j: await r.json(), calls };
}
const before = kv["es:conn"];
let r = await es("123456");
check("/es – חשבון של עסק זר נדחה ולא דורס את החיבור", r.st === 403 && kv["es:conn"] === before && !r.calls.some(u => u.includes("subscribed_apps")));
r = await es("653487867852808");
check("/es – החשבון של BOOQLI מתחבר", r.j.ok === true && JSON.parse(kv["es:conn"]).phone === "88");
let o = await worker.fetch(new Request("https://x/orders?k=TEST"), Object.assign({}, base, { VERIFY_TOKEN: "TEST" }), { waitUntil: () => {} });
check("/orders עם VERIFY_TOKEN – סגור", o.status !== 200 || !(await o.text()).includes("order"));

console.log(fail ? `\n✗ ${fail} בעיות` : "\nאין בעיות ✓"); process.exit(fail ? 1 : 0);
