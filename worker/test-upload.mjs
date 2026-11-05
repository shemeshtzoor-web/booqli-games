/* בדיקה: העלאת תמונות מהאתר (/up) – רק מ-games.booqli.ai, אישור חובה, מפתח לכל הזמנה, הגבלות, שמירה בדרייב כמו הבוט. node worker/test-upload.mjs */
import worker from "./wa-bot.js";
let fail = 0; const drive = [];
const kv = {};
const STATE = { get: async k => kv[k] ?? null, put: async (k, v) => { kv[k] = v; }, delete: async k => { delete kv[k]; }, list: async () => ({ keys: [], list_complete: true }) };
globalThis.fetch = async (u, o) => { u = String(u); if (u === "DRIVE") { const b = JSON.parse(o.body); drive.push(b); return { ok: true, json: async () => ({ ok: true, file: "f", photos: drive.filter(x => x.action === "photo").length }) }; } return { ok: true, json: async () => ({}) }; };
const env = { STATE, DRIVE_URL: "DRIVE", DRIVE_KEY: "k", WA_TOKEN: "t", WA_PHONE_ID: "1" };
const G = "https://games.booqli.ai";
const call = async (path, { method = "POST", body, tok, type = "application/json", origin = G } = {}) => {
  const h = { Origin: origin, "Content-Type": type }; if (tok) h["X-Tok"] = tok;
  const r = await worker.fetch(new Request("https://x" + path, { method, headers: h, body: method === "GET" ? undefined : (type === "application/json" ? JSON.stringify(body || {}) : body) }), env, { waitUntil: () => {} });
  let j = {}; try { j = await r.json(); } catch (e) {} return { st: r.status, j };
};
function check(label, ok){ if (!ok) fail++; console.log((ok ? "✓ " : "✗ ") + label); }
const JPG = new Uint8Array(5000).fill(7);

check("אתר אחר – נחסם", (await call("/up/start", { origin: "https://evil.com", body: { consent: true } })).st === 403);
check("בלי אישור תקנון – נחסם", (await call("/up/start", { body: { kind: "private", who: "רינה" } })).st === 400);
let r = await call("/up/start", { body: { kind: "private", who: "סבתא רינה", consent: true } });
check("הזמנה פרטית נפתחה (סב-XXXX + מפתח)", r.j.ok && /^סב-\d{4}$/.test(r.j.oid) && r.j.tok.length === 48);
const tok = r.j.tok, oid = r.j.oid;
check("תמונה בלי מפתח – נחסם", (await call("/up/photo?sub=בנות&name=נועה", { type: "image/jpeg", body: JPG })).st === 403);
check("קובץ שאינו תמונה – נחסם", (await call("/up/photo?sub=בנות&name=נועה", { tok, type: "text/plain", body: "hi" })).st === 415);
r = await call("/up/photo?sub=בנות&name=נועה", { tok, type: "image/jpeg", body: JPG });
const ph = drive.find(x => x.action === "photo");
check("תמונה נשמרה בדרייב: הזמנה / בנות / נועה", r.j.ok && ph.order === oid && ph.sub === "בנות" && ph.name === "נועה" && ph.title.startsWith(oid + " · סבתא רינה"));
r = await call("/up/done", { tok, body: { summary: "📖 חיבוקים – נועה" } });
const od = drive.find(x => x.action === "order");
check("סיכום + מייל לשמש", r.j.ok && od.order === oid && od.summary.includes("נועה") && od.summary.includes("games.booqli.ai") && od.expected === 1);
check("אחרי הסיום המפתח לא עובד", (await call("/up/photo?sub=בנות&name=נועה", { tok, type: "image/jpeg", body: JPG })).st === 403);

/* גן + הורים */
r = await call("/up/start", { body: { kind: "gan", gan: "גן רימון", who: "מיכל", book: "birthday", consent: true } });
check("גן נפתח עם קוד להורים", r.j.ok && /^גן-\d{4}$/.test(r.j.oid) && /^\d{4}$/.test(r.j.code));
const gtok = r.j.tok, goid = r.j.oid, code = r.j.code;
r = await call("/up/gan?code=" + code, { method: "GET" });
check("הורה רואה את שם הגן לפי הקוד", r.j.ok && r.j.name === "גן רימון");
check("קוד שגוי – לא נמצא", (await call("/up/start", { body: { kind: "parent", code: "0000", consent: true } })).st === 404);
r = await call("/up/start", { body: { kind: "parent", code, who: "אבא של יואב", kid: "יואב", consent: true } });
check("הורה מתחבר לאותה הזמנה של הגן", r.j.ok && r.j.oid === goid);
const ptok = r.j.tok;
for (let i = 0; i < 5; i++) await call("/up/photo?sub=בנים&name=יואב", { tok: ptok, type: "image/jpeg", body: JPG });
check("הורה מוגבל ל-5 תמונות", (await call("/up/photo?sub=בנים&name=יואב", { tok: ptok, type: "image/jpeg", body: JPG })).st === 429);
await call("/up/photo?sub=בנות&name=שירה", { tok: gtok, type: "image/jpeg", body: JPG });
r = await call("/up/done", { tok: gtok, body: { summary: "גן רימון" } });
const gd = drive.filter(x => x.action === "order").pop();
check("סיכום הגן כולל את אישורי ההורים", r.j.ok && gd.summary.includes("אבא של יואב") && gd.summary.includes("קוד להורים: " + code));

/* הגבלה לכל IP */
let lim = 0; for (let i = 0; i < 40; i++) if ((await call("/up/start", { body: { kind: "private", who: "x", consent: true } })).st === 429) lim++;
check("הגבלה: עד 30 הזמנות ביום מאותה כתובת", lim > 0);
console.log(fail ? `\n✗ ${fail} בעיות` : "\nאין בעיות ✓"); process.exit(fail ? 1 : 0);
