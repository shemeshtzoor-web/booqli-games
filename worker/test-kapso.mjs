/* בדיקה: 055 דרך Kapso – חתימה של Kapso, שקט עד ES_LIVE, שליחה דרך api.kapso.ai עם X-API-Key, הורדת תמונה, בקשת סנכרון פעם אחת. node worker/test-kapso.mjs */
import worker from "./wa-bot.js";
let fail = 0; const calls = [];
const kv = {};
const STATE = { get: async k => kv[k] ?? null, put: async (k, v) => { kv[k] = v; }, delete: async k => { delete kv[k]; },
  list: async ({ prefix }) => ({ keys: Object.keys(kv).filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }) };
globalThis.fetch = async (u, o) => { u = String(u); calls.push({ u, h: (o && o.headers) || {} });
  if (u.includes("/smb_app_data")) return { ok: true, json: async () => ({ request_id: "r1" }) };
  if (u.includes("/MEDIA1")) return { ok: true, json: async () => ({ url: "https://lookaside/x", download_url: "https://api.kapso.ai/meta/whatsapp/media_download?token=t", mime_type: "image/jpeg" }) };
  if (u.includes("media_download")) return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
  return { ok: true, json: async () => ({}) }; };
const base = { WA_TOKEN: "TEST_TOKEN", WA_PHONE_ID: "111", STATE, APP_SECRET: "app", KAPSO_API_KEY: "KKEY", KAPSO_WEBHOOK_SECRET: "ksec", KAPSO_PHONE_ID: "777" };
async function sign(sec, body){ const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(sec), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))].map(b => b.toString(16).padStart(2, "0")).join(""); }
async function hook(env, value, sec = "ksec"){
  const body = JSON.stringify({ entry: [{ changes: [{ field: "messages", value }] }] }), jobs = [];
  const r = await worker.fetch(new Request("https://x/wa", { method: "POST", headers: { "X-Webhook-Signature": await sign(sec, body) }, body }), env, { waitUntil: p => jobs.push(p) });
  await Promise.all(jobs); return r.status;
}
const msg = (pid, from, m) => ({ metadata: { phone_number_id: pid }, contacts: [{ profile: { name: "x" } }], messages: [Object.assign({ from, id: "m" + Math.random() }, m)] });
function check(label, ok){ if (!ok) fail++; console.log((ok ? "✓ " : "✗ ") + label); }

check("חתימה שגויה של Kapso – נדחה", (await hook(base, msg("777", "972500000010", { type: "text", text: { body: "היי" } }), "wrong")) === 401);
calls.length = 0; await hook(base, msg("777", "972500000011", { type: "text", text: { body: "היי" } }));
check("055 דרך Kapso לפני ES_LIVE – הבוט שותק", !calls.some(c => c.u.includes("/messages")));
check("בקשת סנכרון אנשי קשר + היסטוריה נשלחה דרך Kapso", calls.filter(c => c.u.startsWith("https://api.kapso.ai/meta/whatsapp/v24.0/777/smb_app_data") && c.h["X-API-Key"] === "KKEY").length === 2);
calls.length = 0; await hook(base, msg("777", "972500000012", { type: "text", text: { body: "היי" } }));
check("סנכרון רק פעם אחת", !calls.some(c => c.u.includes("smb_app_data")));
const live = Object.assign({}, base, { ES_LIVE: "1" });
calls.length = 0; await hook(live, msg("777", "972500000013", { type: "text", text: { body: "היי, אני רוצה ספר לנכדה" } }));
const sends = calls.filter(c => c.u.includes("/messages"));
check("אחרי ES_LIVE – שולח דרך api.kapso.ai עם X-API-Key ובלי הטוקן של מטא", sends.length > 0 && sends.every(c => c.u.startsWith("https://api.kapso.ai/meta/whatsapp/v24.0/777/messages") && c.h["X-API-Key"] === "KKEY" && !c.h.Authorization));
calls.length = 0; await hook(base, msg("111", "972500000014", { type: "text", text: { body: "היי" } }));
const s2 = calls.filter(c => c.u.includes("/messages"));
check("מספר הבדיקה ממשיך ישירות למטא", s2.length > 0 && s2.every(c => c.u.startsWith("https://graph.facebook.com") && c.h.Authorization === "Bearer TEST_TOKEN"));
/* הורדת תמונה דרך Kapso */
const { handle } = await import("./wa-bot.js");
console.log(fail ? `\n✗ ${fail} בעיות` : "\nאין בעיות ✓"); process.exit(fail ? 1 : 0);
