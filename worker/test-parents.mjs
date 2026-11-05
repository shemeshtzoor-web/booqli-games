import { handle } from "./wa-bot.js";
const drive = [];
globalThis.fetch = async (u, o) => { u = String(u);
  if (u.includes("graph.facebook.com") && !(o && o.method)) return { ok: true, json: async () => ({ url: "https://media/x", mime_type: "image/jpeg" }) };
  if (u.startsWith("https://media/")) return { ok: true, arrayBuffer: async () => new ArrayBuffer(10) };
  if (u === "DRIVE") { const b = JSON.parse(o.body); drive.push(b); return { ok: true, json: async () => ({ ok: true, file: "https://drive.google.com/file/d/F" + drive.length + "xxxxxxxxxxxxxxxxxxxxxxxx/view" }) }; }
  return { ok: true, json: async () => ({}) }; };
const env = { DRIVE_URL: "DRIVE", DRIVE_KEY: "k", WA_TOKEN: "t", WA_PHONE_ID: "p", STATE: { put: async () => {}, get: async () => null, delete: async () => {} } };
const mem = {};
const fmt = m => (m.context ? "↩︎ " : "") + (m.type === "text" ? m.text.body : m.type === "video" ? "🎬 " + m.video.caption : (m.interactive?.body.text || "") + " {" + ((m.interactive?.action.buttons) || []).map(b => b.reply.title).join(" | ") + "}");
const r = async (who, ev, l) => { const log = []; await handle(env, who, who === "T" ? "מירב" : "", ev, { mem, log }); console.log(`>> [${who}] ${l}\n` + log.map(m => "   " + fmt(m).replace(/\n/g, " / ").slice(0, 230)).join("\n")); return log; };
const T = "T";
for (const [e, l] of [[{ text: "גן" }, "hi"], [{ id: "s:gan" }, "gan"], [{ text: "גן רימון" }, "name"], [{ text: "מירב" }, "me"], [{ text: "20" }, "kids"], [{ id: "gb:hugs" }, "book"], [{ id: "gd:ok" }, "ded"]]) await r(T, e, l);
const lg = await r(T, { id: "gw:par" }, "parents send");
const code = (JSON.stringify(lg).match(/%D7%A7%D7%95%D7%93%20(\d+)/) || [])[1]; console.log("CODE", code);
// parent A
await r("A", { text: "ספר לגן – קוד " + code }, "A link"); await r("A", { text: "שלום" }, "A text before consent"); await r("A", { id: "pc:yes" }, "A consent");
await r("A", { image: { media: "a1", sha: "a1" }, caption: "נועה בת", mid: "wa1" }, "A photo"); await r("A", { text: "תודה רבה!" }, "A thanks");
// parent B: no gender, then dup name
await r("B", { text: "ספר לגן – קוד " + code }, "B link"); await r("B", { id: "pc:yes" }, "B consent"); await r("B", { image: { media: "b1", sha: "b1" }, caption: "דני", mid: "wb1" }, "B no gender"); await r("B", { id: "gx:b" }, "B boy");
await r("C", { text: "ספר לגן – קוד " + code }, "C link"); await r("C", { id: "pc:yes" }, "C consent"); await r("C", { image: { media: "c1", sha: "c1" }, caption: "נועה בת", mid: "wc1" }, "C dup Noa"); await r("C", { id: "gr:new" }, "C other girl");
// teacher completes one + status
await r(T, { text: "מצב" }, "T status"); await r(T, { image: { media: "t1", sha: "t1" }, caption: "יואב בן", mid: "wt1" }, "T sends photo"); await r(T, { id: "g:remind" }, "T remind");
// same phone as teacher acting as parent (testing)
await r(T, { text: "ספר לגן – קוד " + code }, "T as parent link"); await r(T, { id: "pc:yes" }, "T as parent consent"); await r(T, { image: { media: "t2", sha: "t2" }, caption: "שירה בת", mid: "wt2" }, "T as parent photo"); await r(T, { text: "מצב" }, "T back to teacher");
await r(T, { id: "g:fin" }, "T fin"); await r(T, { id: "g:ok" }, "T ok");
console.log("gp:", Object.keys(mem).filter(k => k.startsWith("gp:")).map(k => { const v = JSON.parse(mem[k]); return v.sub + "/" + v.name + "/" + v.by + (v.parent ? "/P" : ""); }));
console.log("drive photos:", drive.filter(d => d.action === "photo").map(d => d.title + " | " + d.sub + "/" + d.name));
