/* בונה את /offline-pack.json – רשימת כל מה שצריך כדי ששחק הילדים יעבדו בלי אינטרנט באפליקציה.
   מריצים אחרי כל שינוי במשחקי הילדים (משחק חדש, נושא חדש עם משחקים, תמונות):
     python3 -m http.server 8765 &   (מתוך תיקיית האתר)
     node app/tools/make-offline-pack.js
   מה נכנס: כל עמוד שמופיע ב-KIDS_GAMES (catalog.js) + אזור הילדים, כל הקבצים בתיקייה של כל עמוד
   (חוץ מסרטונים ו-PDF), וכל מה שהעמוד טוען בפועל (תמונות משותפות, גופנים). */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "../.."), BASE = "http://localhost:8765";
const SKIP = /\.(mp4|mov|webm|pdf|zip|md|txt|py|sh)$/i;
const cat = fs.readFileSync(path.join(ROOT, "catalog.js"), "utf8");
const kidsBlock = cat.slice(cat.indexOf("window.KIDS_GAMES"), cat.indexOf("];", cat.indexOf("window.KIDS_GAMES")));
const pages = new Set(["/", "/kids/", "/kids/play/", "/kids/animate/"]);
for (const m of kidsBlock.matchAll(/href:"([^"#?]+)/g)) pages.add("/" + m[1]);
const files = new Set(), fonts = new Set();
function walk(dir){
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (!SKIP.test(f.name) && f.name !== "desktop.ini") files.add("/" + path.relative(ROOT, p).split(path.sep).join("/"));
  }
}
(async () => {
  for (const pg of pages) if (pg !== "/") walk(path.join(ROOT, pg));
  const b = await chromium.launch();
  for (const pg of pages) {
    const p = await b.newPage({ viewport: { width: 390, height: 800 } });
    p.on("request", r => {
      const u = new URL(r.url());
      if (u.origin === BASE) { if (!/\/(sw\.js|offline-pack\.json)$/.test(u.pathname) && !SKIP.test(u.pathname)) files.add(u.pathname); }
      else if (u.hostname === "fonts.googleapis.com") fonts.add(r.url());
    });
    await p.goto(BASE + pg, { waitUntil: "networkidle" }).catch(() => {});
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } }).catch(() => {});
    await p.waitForTimeout(500); await p.close();
  }
  await b.close();
  // תיקייה = העמוד עצמו (index.html נשמר גם בשם התיקייה)
  for (const f of [...files]) if (/\/index\.html$/.test(f)) { files.delete(f); files.add(f.replace(/index\.html$/, "")); }
  const list = [...files].filter(f => fs.existsSync(path.join(ROOT, f.endsWith("/") ? f + "index.html" : f))).sort();
  let bytes = 0; const h = crypto.createHash("sha1");
  for (const f of list) { const buf = fs.readFileSync(path.join(ROOT, f.endsWith("/") ? f + "index.html" : f)); bytes += buf.length; h.update(f).update(buf); }
  const out = { version: h.digest("hex").slice(0, 12), bytes, fonts: [...fonts].sort(), files: list };
  fs.writeFileSync(path.join(ROOT, "offline-pack.json"), JSON.stringify(out, null, 1));
  console.log(list.length, "files,", (bytes / 1048576).toFixed(1), "MB,", fonts.size, "font css, pages:", pages.size);
})();
