import { handle } from "./wa-bot.js";
const short = m => m.type === "text" ? "T:" + m.text.body.replace(/\n/g, " ").slice(0, 45) : m.type === "document" ? "PDF" : m.type === "image" ? "IMG" : (m.interactive.type === "button" ? "B:" : "L:") + m.interactive.body.text.replace(/\n/g, " ").slice(0, 45);
const QSTEP_TEXT = /\?|👇|כותבים|כתבו|שולחים|מעבירים|📷|📍|📞/;
const PERTURB = [[{ text: "בלה בלה" }, "random text"], [{ text: "כן" }, "כן"], [{ text: "לא" }, "לא"], [{ text: "😀" }, "emoji"], [{ image: { media: "z" }, caption: "" }, "image"], [{ id: "d:ok" }, "stale button d:ok"], [{ id: "zzz" }, "unknown button"], [{ text: "מה המחיר?" }, "price question"]];
const problems = []; let checks = 0;
async function walk(title, path){
  let mem = {};
  for (let i = 0; i < path.length; i++) {
    const before = JSON.parse(mem["st:1"] || "null"), stp = before ? before.step : "(new)";
    for (const [ev, l] of PERTURB) {
      const m2 = JSON.parse(JSON.stringify(mem)), log = [];
      await handle({}, "1", "x", ev, { mem: m2, log }); checks++;
      const after = JSON.parse(m2["st:1"] || "null");
      if (!log.length) { if (!(after && after.human)) problems.push(`${title} @${stp} + ${l}: SILENT`); continue; }
      const last = log.at(-1);
      if (last.type === "document" || last.type === "image") problems.push(`${title} @${stp} + ${l}: last msg is ${last.type}`);
      if (last.type === "text" && !QSTEP_TEXT.test(last.text.body)) problems.push(`${title} @${stp} + ${l}: last text not a question: ${short(last)}`);
      if (after && after.human && !(before && before.human) && !/\?/.test(ev.text || "")) problems.push(`${title} @${stp} + ${l}: escalated to Shemesh`);
      if (after && before && after.step !== before.step && !["stale button d:ok", "כן", "לא"].includes(l) && !(l === "image" && /pics/.test(stp))) problems.push(`${title} @${stp} + ${l}: step moved ${before.step}→${after.step}`);
      if (after && before && after.step !== before.step && ["כן","לא","stale button d:ok"].includes(l)) problems.push(`INFO ${title} @${stp} + ${l}: ${before.step}→${after.step}`);
    }
    const log = []; await handle({}, "1", "x", path[i], { mem, log });
    const st = JSON.parse(mem["st:1"] || "null");
    if (!log.length) problems.push(`${title} PATH @${stp} ${JSON.stringify(path[i])}: SILENT`);
    else { const last = log.at(-1); if (last.type === "document" || last.type === "image") problems.push(`${title} PATH @${stp}: ends with ${last.type}`); }
  }
  const st = JSON.parse(mem["st:1"]); console.log(`${title}: final step=${st.step}, books=${st.list.length || (st.g.books||[]).length}`);
}
const IMG = { image: { media: "a" } };
await walk("סבתא-נכדה", [{ text: "שלום" }, { id: "s:go" }, { id: "f:g:g" }, { id: "b:hugs" }, { text: "נועה" }, { id: "d:ok" }, { id: "cv:hard" }, IMG, { id: "p:done" }, { id: "w:yes" }, { id: "m:no" }, { id: "sh:pickup" }, { id: "pay:bit" }, { id: "c:yes" }]);
await walk("הורה-2 ילדים", [{ text: "היי" }, { id: "s:go" }, { id: "f:p:b" }, { id: "b:druki" }, { text: "יואב" }, { id: "d:next" }, { id: "d:ok" }, { id: "cv:soft" }, IMG, { id: "p:done" }, { id: "w:other" }, { text: "דנה לוי" }, { id: "m:yes" }, { id: "f:p:g" }, { id: "b:summer" }, { text: "מיה" }, { id: "d:own" }, { text: "למיה באהבה" }, { id: "cv:hard" }, IMG, { id: "p:done" }, { id: "m:no" }, { id: "sh:ship" }, { text: "הרצל 5 עפולה" }, { id: "ph:yes" }, { id: "pay:bank" }, { id: "c:yes" }]);
await walk("גן-נושא אחד", [{ text: "גן" }, { id: "s:gan" }, { text: "גן רימון חיפה" }, { text: "מירב" }, { text: "25" }, { id: "gb:hugs" }, { id: "g:one" }, { id: "c:soft" }, { id: "gd:ok" }, { image: { media: "b1" }, caption: "יואב" }, { id: "g:rdone" }, { image: { media: "g1" }, caption: "דנה" }, { id: "g:rdone" }, { id: "g:ok" }, { id: "sh:ship" }, { text: "הרצל 5" }, { id: "ph:yes" }, { id: "pay:card" }, { id: "gc:yes" }]);
await walk("גן-2 נושאים", [{ text: "שלום" }, { id: "s:gan" }, { text: "גן חצב" }, { text: "רות" }, { text: "30 ילדים" }, { id: "gb:hugs" }, { id: "g:more" }, { id: "gb:kinder" }, { id: "c:staple" }, { id: "gd:own" }, { text: "הקדשה לגן" }, { id: "gd:done" }, { image: { media: "b1" }, caption: "איתי" }, { id: "g:rdone" }, { image: { media: "g1" }, caption: "נועה" }, { id: "g:rdone" }, { image: { media: "b2" }, caption: "רון" }, { id: "g:rdone" }, { image: { media: "g2" }, caption: "שירה" }, { id: "g:rdone" }, { id: "g:ok" }, { id: "sh:pickup" }, { id: "pay:bit" }, { id: "gc:yes" }]);
console.log("checks:", checks, "\nproblems:", problems.filter(p => !p.startsWith("INFO")).length);
problems.forEach(p => console.log(" - " + p));
