/* =====================================================================
   מסלול הקריאה – דפי הדפסה (3.11.2026)
   ?sheet=<סוג>&lvl=<שלב>  · כל טעינה = דף חדש (מילים, אותיות וציורים אחרים)
   ?sheet=book&lvl=N = חוברת של 10 דפים מעורבבים · ?sheet=cert&lvl=N = תעודה
   ======================================================================= */
window.READ_SHEETS = (function(){
"use strict";
const R = window.READ;
let A; // READ_APP – נטען אחרי app.js
const rd = (t, c) => '<span class="rd ' + (c || "") + '">' + t + '</span>';
const cv = t => '<span class="cv">' + t + '</span>';
const emo = e => '<span class="emo">' + e + '</span>';
const clusters = w => R.clusters(w);
const plain = s => R.plain(s);
const NAME = () => (A && A.S().name) || "";
const COL = n => R.COLORS.find(c => c.t === n);
const dotted = (t, cur, big) => '<svg class="dl" viewBox="0 0 60 60" aria-hidden="true"><line x1="2" y1="' + (cur ? 40 : 46) + '" x2="58" y2="' + (cur ? 40 : 46) + '" stroke="#CDE7DC" stroke-width="1"/><text x="30" y="' + (cur ? 40 : 45) + '" text-anchor="middle" font-family="' + (cur ? "GveretLevin" : "BQRead") + '" font-weight="' + (cur ? 400 : 700) + '" font-size="' + (cur ? 50 : (big ? 44 : 46)) + '" fill="none" stroke="#8a7a86" stroke-width="1.1" stroke-dasharray="2.4 2.2">' + t + '</text></svg>';
const instr = t => '<p class="ins">' + t + '</p>';

/* ---------- הדפים ---------- */
const S = {
  trace(L){ let set = L.set.split(""); if (set.length < 6) set = set.concat(A.pick(A.lettersUpTo(Math.max(1, L.n - 1)).filter(x => !set.includes(x)), 6 - set.length));
    set = set.slice(0, 7);
    return {t: "כּוֹתְבִים אוֹתִיּוֹת", i: "עוֹבְרִים בְּעִפָּרוֹן עַל הַנְּקֻדּוֹת, וּבַסּוֹף כּוֹתְבִים לְבַד 🖍️",
      b: '<div class="trace">' + set.map(l => '<div class="tr"><span class="mod">' + emo(R.LETTERS[l] ? R.LETTERS[l].e : "") + rd(l, "m") + '</span>' + [1,2,3,4,5].map(() => dotted(l)).join("") + '<span class="empty"></span></div>').join("") + '</div>'}; },
  cursive(L){ const set = L.set.split("").slice(0, 7);
    return {t: "כְּתַב יָד", i: "כָּךְ כּוֹתְבִים אֶת הָאוֹת בִּכְתַב יָד. עוֹבְרִים עַל הַנְּקֻדּוֹת וּמַמְשִׁיכִים לְבַד ✍️",
      b: '<div class="trace">' + set.map(l => '<div class="tr"><span class="mod">' + rd(l, "m sm") + ' ← ' + cv(l) + '</span>' + [1,2,3,4].map(() => dotted(l, true)).join("") + '<span class="empty"></span></div>').join("") + '</div>'}; },
  find(L){ const set = L.set.split(""), rev = A.lettersUpTo(L.n), ts = A.pick(set, Math.min(3, set.length));
    return {t: "מַקִּיפִים אֶת הָאוֹת", i: "בְּכָל שׁוּרָה: מַקִּיפִים בְּעִגּוּל כָּל אוֹת שֶׁדּוֹמָה לָאוֹת בַּמִּסְגֶּרֶת 🔍",
      b: ts.map(t => { const sim = (R.SIMILAR.find(p => p[0].length === 1 && p.includes(t)) || []).find(x => x !== t);
        const cells = A.shuffle(Array(8).fill(t).concat(sim ? Array(5).fill(sim) : [], A.pick(rev.filter(x => x !== t), sim ? 11 : 16)));
        return '<div class="find"><span class="box">' + rd(t) + '</span><div class="fg">' + cells.slice(0, 24).map(x => rd(x)).join("") + '</div></div>'; }).join("")}; },
  match(L){ const ls = A.pick(A.uniqBy(L.set.split("").concat(A.pick(A.lettersUpTo(L.n), 6)), x => x), 6), ps = A.shuffle(ls);
    return {t: "אוֹת וּתְמוּנָה", i: "מוֹתְחִים קַו מִכָּל אוֹת לַתְּמוּנָה שֶׁמַּתְחִילָה בָּהּ 🔗", b: cols(ls.map(l => rd(l, "m")), ps.map(l => emo(R.LETTERS[l].e)))}; },
  finals(){ const ws = A.pick(R.END_WORDS, 6);
    return {t: "אוֹתִיּוֹת סוֹפִיּוֹת", i: "כּוֹתְבִים אֶת הָאוֹת הַסּוֹפִית, וּמַשְׁלִימִים אֶת סוֹף הַמִּלָּה 🔚",
      b: '<div class="fin">' + "כמנפצ".split("").map(l => '<span>' + rd(l, "m") + ' ← <i class="wbox"></i></span>').join("") + '</div>' +
        '<div class="ends">' + ws.map(w => '<div>' + emo(w.e) + rd(clusters(w.t).slice(0, -1).join("") + '<i class="wbox s"></i>', "w") + '</div>').join("") + '</div>'}; },
  diff(){ return {t: "מָה שׁוֹנֶה?", i: "בְּכָל שׁוּרָה יֵשׁ אוֹת אַחַת שׁוֹנָה. מַקִּיפִים אוֹתָהּ ⭕",
      b: '<div class="drows">' + Array.from({length: 9}, () => { const p = A.one(R.SIMILAR); const [t, o] = Math.random() < .5 ? p : [p[1], p[0]]; const at = A.rnd(8);
        return '<div>' + Array.from({length: 8}, (_, k) => rd(k === at ? o : t)).join("") + '</div>'; }).join("") + '</div>'}; },
  smatch(L){ const ss = A.pick(A.uniqBy(A.sylPool(L), s => A.skey(s)), 6), ps = A.shuffle(ss);
    return {t: "הֲבָרָה וּתְמוּנָה", i: "מוֹתְחִים קַו מִכָּל הֲבָרָה לַתְּמוּנָה שֶׁמַּתְחִילָה בָּהּ 🔗", b: cols(ss.map(s => rd(s.t, "m")), ps.map(s => emo(s.e)))}; },
  circle(L){ const pool = A.sylPool(L), v = L.v[L.v.length - 1], bases = A.uniqBy(pool.map(s => A.baseOf(s.t)), b => b).filter(b => b[0] !== "ו");
    let cells, ins;
    if (L.v.length === 1) { const t = A.one(pool); cells = A.shuffle(Array(12).fill(t.t).concat(Array.from({length: 36}, () => A.one(pool.filter(s => A.phon(s.t) !== A.phon(t.t))).t)));
      ins = "מַקִּיפִים כָּל " + rd(t.t, "inl") + " ⭕"; }
    else { const tg = Array.from({length: 14}, () => A.compose(A.one(bases), v)), ot = Array.from({length: 34}, () => A.compose(A.one(bases), A.one(L.v.filter(x => x !== v))));
      cells = A.shuffle(tg.concat(ot)); ins = "מַקִּיפִים כָּל הֲבָרָה עִם " + R.VOWELS[v].name + " " + rd(R.VOWELS[v].sign, "inl") + " ⭕"; }
    return {t: "מַקִּיפִים לְפִי הַנִּקּוּד", i: ins, b: '<div class="cgrid">' + cells.slice(0, 48).map(x => rd(x)).join("") + '</div>'}; },
  first(L){ const items = A.pick(A.uniqBy(A.sylPool(L), s => s.e), 8);
    return {t: "בְּאֵיזוֹ הֲבָרָה מַתְחִילָה?", i: "מַקִּיפִים אֶת הַהֲבָרָה שֶׁבָּהּ מַתְחִילָה הַתְּמוּנָה ⭕",
      b: '<div class="opts3">' + items.map(t => { const base = A.baseOf(t.t); let ds = L.v.filter(v => v !== t.v && !(base[0] === "ו" && (v === "o" || v === "u"))).map(v => A.compose(base, v));
        ds = A.pick(ds, 2); if (ds.length < 2) ds = ds.concat(A.pick(A.sylPool(L).filter(s => A.phon(s.t) !== A.phon(t.t)), 2 - ds.length).map(s => s.t));
        return '<div>' + emo(t.e) + '<span class="ch">' + A.shuffle([t.t].concat(ds)).map(x => rd(x)).join("") + '</span></div>'; }).join("") + '</div>'}; },
  wmatch(L, pl){ const ws = A.pick(A.uniqBy((pl ? R.WORDS : A.wordNew(L).concat(A.pick(A.wordPool(L), 2))), w => w.e), 6), ps = A.shuffle(ws);
    return {t: pl ? "מִלִּים בְּלִי נִקּוּד" : "מִלָּה וּתְמוּנָה", i: "מוֹתְחִים קַו מִכָּל מִלָּה לַתְּמוּנָה שֶׁלָּהּ 🔗", b: cols(ws.map(w => rd(pl ? A.pw(w) : w.t, "w")), ps.map(w => emo(w.e)))}; },
  build(L, pl){ const ws = A.pick((pl ? R.WORDS.filter(w => A.pw(w).length <= 6) : A.wordNew(L)), 6);
    return {t: pl ? "כּוֹתְבִים בְּלִי נִקּוּד" : "כּוֹתְבִים מִלָּה", i: "כּוֹתְבִים אֶת הַמִּלָּה בַּמִּשְׁבָּצוֹת. הָאוֹתִיּוֹת מְחַכּוֹת לְמַטָּה – אֲבָל לֹא לְפִי הַסֵּדֶר 🧱",
      b: '<div class="builds">' + ws.map(w => { const t = pl ? A.pw(w).split("") : clusters(w.t);
        return '<div>' + emo(w.e) + '<span class="bx">' + t.map(() => '<i class="wbox"></i>').join("") + '</span><span class="bank">' + A.shuffle(t).map(x => rd(x)).join(" ") + '</span></div>'; }).join("") + '</div>'}; },
  missing(L){ const ws = A.pick(A.wordPool(L).filter(w => clusters(w.t).length >= 2), 8);
    return {t: "מָה חָסֵר?", i: "מַקִּיפִים אֶת מָה שֶׁחָסֵר בַּמִּלָּה ⭕",
      b: '<div class="opts3">' + ws.map(w => { const cs = clusters(w.t), idx = cs.map((c, i) => i).filter(i => !/^[וי]/.test(cs[i]) && /[ְ-ֻ]/.test(cs[i]));
        const k = idx.length ? A.one(idx) : 0, right = cs[k];
        const others = A.pick(A.uniqBy(R.WORDS.flatMap(x => clusters(x.t)).filter(c => c !== right && !/^[וי]/.test(c) && /[ְ-ֻ]/.test(c)), c => c), 2);
        return '<div>' + emo(w.e) + rd(cs.map((c, i) => i === k ? "_" : c).join(""), "w") + '<span class="ch">' + A.shuffle([right].concat(others)).map(x => rd(x)).join("") + '</span></div>'; }).join("") + '</div>'}; },
  smatch2(L, pl){ const ss = A.pick(R.SENT, 5), ps = A.shuffle(ss);
    return {t: pl ? "מִשְׁפָּטִים בְּלִי נִקּוּד" : "מִשְׁפָּט וּתְמוּנָה", i: "מוֹתְחִים קַו מִכָּל מִשְׁפָּט לַתְּמוּנָה שֶׁלּוֹ 🔗", b: cols(ss.map(s => rd(pl ? plain(s.t) : s.t, "s")), ps.map(s => emo(s.e)), true)}; },
  tf(L, pl){ const rows = Array.from({length: 8}, () => { const t = A.one(R.SENT), yes = Math.random() < .5; return {t, e: yes ? t.e : A.one(R.SENT.filter(s => s !== t)).e}; });
    return {t: pl ? "נָכוֹן אוֹ לֹא? (בְּלִי נִקּוּד)" : "נָכוֹן אוֹ לֹא?", i: "קוֹרְאִים, מִסְתַּכְּלִים וּמַקִּיפִים: ✔ נָכוֹן אוֹ ✘ לֹא נָכוֹן",
      b: '<div class="tfs">' + rows.map(r => '<div>' + rd(pl ? plain(r.t.t) : r.t.t, "s") + emo(r.e) + '<span class="yn">✔ &nbsp; ✘</span></div>').join("") + '</div>'}; },
  order(){ const ss = A.pick(R.SENT.filter(s => s.t.split(" ").length >= 3), 5);
    return {t: "מְסַדְּרִים מִשְׁפָּט", i: "הַמִּלִּים הִתְבַּלְבְּלוּ! כּוֹתְבִים אֶת הַמִּשְׁפָּט לְפִי הַסֵּדֶר 🚂",
      b: '<div class="orders">' + ss.map(s => { let w = s.t.split(" "), sh; do { sh = A.shuffle(w); } while (sh.join(" ") === s.t && w.length > 1);
        return '<div><span class="emo">' + s.e + '</span><span class="wds">' + sh.map(x => '<i>' + rd(x) + '</i>').join("") + '</span><span class="line"></span></div>'; }).join("") + '</div>'}; },
  draw(){ const ds = A.pick(R.DRAW, 4);
    return {t: "קוֹרְאִים וּמְצַיְּרִים", i: "קוֹרְאִים מָה כָּתוּב וּמְצַיְּרִים בַּמִּסְגֶּרֶת 🖍️", b: '<div class="draws">' + ds.map(d => '<div><p>' + rd(d, "s") + '</p><span></span></div>').join("") + '</div>'}; },
  story(L, pl){ const st = A.one(R.STORIES), f = pl ? plain : (x => x);
    return {t: f(st.title) + " " + st.ic, i: "קוֹרְאִים אֶת הַסִּפּוּר וְעוֹנִים עַל הַשְּׁאֵלוֹת – מַקִּיפִים אֶת הַתְּשׁוּבָה הַנְּכוֹנָה 📚",
      b: '<article class="story">' + st.lines.map(l => '<p>' + rd(f(l)) + '</p>').join("") + '</article>' +
        '<ol class="qs">' + st.q.map(q => '<li><p>' + rd(f(q[0])) + '</p><span class="ch">' + A.shuffle(q.slice(1)).map(x => rd(f(x))).join("") + '</span></li>').join("") + '</ol>' +
        '<div class="draws one"><div><p>' + rd(pl ? "ציירו משהו מהסיפור:" : "צַיְּרוּ מַשֶּׁהוּ מֵהַסִּפּוּר:", "s") + '</p><span></span></div></div>'}; },
  spell(){ const it = A.pick(R.SPELL, 10);
    return {t: "אֵיךְ כּוֹתְבִים נָכוֹן?", i: "מַקִּיפִים אֶת הַמִּלָּה שֶׁכְּתוּבָה נָכוֹן ⭕",
      b: '<div class="opts3 two">' + it.map(s => '<div>' + emo(s[2]) + '<span class="ch">' + A.shuffle([s[0], s[1]]).map(x => rd(x)).join("") + '</span></div>').join("") + '</div>'}; },
  color(L){ return colorSheet(L); },
  cert(L){ const nm = NAME(), st = A.S(), done = st.done[L.n] === 1;
    return {cert: true, b: '<div class="cert"><div class="cin"><img src="../../img/family/alef.webp" alt="" width="120" height="124"><p class="c1">תְּעוּדַת הִצְטַיְּנוּת</p>' +
      '<p class="c2">' + (nm ? "לְ" + esc(nm) : 'לְ<span class="cline"></span>') + '</p><p class="c3">עַל הַצְלָחָה בְּ<b>שָׁלָב ' + L.n + '</b> בְּמַסְלוּל הַקְּרִיאָה:</p><p class="c4">' + L.t + '</p>' +
      '<div class="c5">' + (done ? R.STICKERS[L.n - 1] : "⭐") + '</div><p class="c3">כָּל הַכָּבוֹד! מַמְשִׁיכִים לִקְרֹא 📖</p><p class="c6">' + new Date().toLocaleDateString("he-IL") + ' · אֲלֶפְבּוּקְלִי וְ-booqli Games</p></div></div>'}; }
};
S.pmatch = L => S.wmatch(L, true); S.ptf = L => S.tf(L, true); S.pstory = L => S.story(L, true); S.pbuild = L => S.build(L, true);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* שתי עמודות למתיחת קו */
function cols(a, b, wide){
  return '<div class="cols' + (wide ? " wide" : "") + '"><div>' + a.map(x => '<span>' + x + '<i class="pt"></i></span>').join("") + '</div><div>' + b.map(x => '<span><i class="pt"></i>' + x + '</span>').join("") + '</div></div>';
}

/* ---------- צביעה לפי קוד ---------- */
function colorSheet(L){
  const pic = A.one(R.PICS), k = L.kind, codes = pic.cols.length;
  let items, bgPool, legend, mode;
  if (k === "letters") { const set = A.shuffle(L.set.split("")).concat(A.shuffle(A.lettersUpTo(L.n))); items = A.uniqBy(set, x => x).slice(0, codes); bgPool = A.lettersUpTo(Math.max(L.n, 2)).filter(x => !items.includes(x)); mode = "sym"; }
  else if (k === "similar") { const p = A.pick(R.SIMILAR.filter(x => x[0].length === 1), 2).flat(); items = A.uniqBy(p.concat(R.FINALS), x => x).slice(0, codes); bgPool = R.ABC.concat(R.FINALS).filter(x => !items.includes(x)); mode = "sym"; }
  else if (k === "niqqud") { const bases = A.uniqBy(A.sylPool(L).map(s => A.baseOf(s.t)), b => b).filter(b => b[0] !== "ו"), b = A.one(bases);
    const vs = L.v.length >= codes ? A.pick(L.v, codes) : L.v.slice();
    items = vs.map(v => A.compose(b, v)); while (items.length < codes) { const x = A.compose(A.one(bases), A.one(L.v)); if (!items.includes(x)) items.push(x); }
    bgPool = []; for (let i = 0; i < 40; i++) { const x = A.compose(A.one(bases), A.one(L.v)); if (!items.includes(x)) bgPool.push(x); } mode = "sym"; }
  else { items = pic.cols.map((c, i) => String(i + 1)); bgPool = []; mode = "num"; }
  const pl = k === "plain" || k === "spell";
  const grid = pic.g.map(r => r.padEnd(12, ".").slice(0, 12).split("").map(ch => { const i = "1234".indexOf(ch);
    if (i < 0) return '<i class="bg">' + (bgPool.length ? rd(A.one(bgPool)) : "") + '</i>'; return '<i>' + rd(items[i]) + '</i>'; }).join("")).join("");
  legend = pic.cols.map((c, i) => { const C = COL(c);
    return mode === "num" ? '<span><b>' + rd(i + 1) + '</b> = ' + rd(pl ? C.p : C.t, "s") + '</span>'
      : '<span>' + rd(items[i], "m") + ' = <i class="sw" style="background:' + C.c + '"></i>' + rd(C.t, "s") + '</span>'; }).join("");
  return {t: "צוֹבְעִים לְפִי " + (mode === "num" ? "מִסְפָּרִים" : k === "niqqud" ? "נִקּוּד" : "אוֹתִיּוֹת"),
    i: mode === "num" ? "קוֹרְאִים אֵיזֶה צֶבַע כָּתוּב לְיַד כָּל מִסְפָּר – וְצוֹבְעִים 🎨 מָה מִתְגַּלֶּה?" : "צוֹבְעִים כָּל מִשְׁבֶּצֶת לְפִי הַמַּפְתֵּחַ. מִשְׁבָּצוֹת אֲחֵרוֹת – לֹא צוֹבְעִים 🎨",
    b: '<div class="legend">' + legend + (mode === "sym" ? '<span class="muted">' + rd("כָּל הַשְּׁאָר – לֹא צוֹבְעִים", "s") + '</span>' : "") + '</div><div class="pix ' + mode + '">' + grid + '</div>'};
}

/* ---------- בניית העמוד ---------- */
function page(sh, L){
  const head = sh.cert ? "" : '<header class="sh-h"><div><b>' + sh.t + '</b><small>מסלול הקריאה · שלב ' + L.n + ' – ' + L.p + '</small></div><div class="nm">שֵׁם: ' + (NAME() ? '<u>' + esc(NAME()) + '</u>' : '<span class="cline"></span>') + '</div></header>' + instr(sh.i);
  return '<section class="pg' + (sh.cert ? " certpg" : "") + '">' + head + '<div class="sb">' + sh.b + '</div>' + (typeof sitePrintFooter === "function" ? sitePrintFooter("school-reading", "", "../../img/logo.png") : "") + '</section>';
}
function render(type, L){
  A = window.READ_APP;
  document.body.classList.add("sheet-mode");
  const types = L.sheets.filter(s => s !== "cert");
  let list;
  if (type === "book") list = Array.from({length: 10}, (_, i) => types[i % types.length]);
  else list = [S[type] ? type : types[0]];
  const box = document.getElementById("print");
  box.hidden = false;
  const names = window.READ_SHEET_NAMES || {};
  box.innerHTML = '<div class="pbar"><a class="btn alt sm" href="?lvl=' + L.n + '">← לשלב ' + L.n + '</a><button type="button" class="btn sm" id="pPrint">🖨️ הדפסה</button><button type="button" class="btn alt sm" id="pNew">🔄 דף חדש</button>' +
    '<select id="pSel" aria-label="דף אחר">' + L.sheets.concat(["book"]).map(s => '<option value="' + s + '"' + (s === type ? " selected" : "") + '>' + (s === "book" ? "📚 חוברת 10 דפים" : names[s] || s) + '</option>').join("") + '</select></div>' +
    '<p class="pnote">כל לחיצה על "דף חדש" מביאה מילים, אותיות וציורים אחרים. מדפיסים בגודל A4. מותר לשתף בחינם, עם הקרדיט של BOOQLI.</p>' +
    '<div class="pages" id="pages">' + list.map(t => page(S[t](L), L)).join("") + '</div>';
  document.getElementById("pPrint").onclick = () => { try { siteEvent("read-print", type + "-" + L.n); } catch (e) {} window.print(); };
  document.getElementById("pNew").onclick = () => render(type, L);
  document.getElementById("pSel").onchange = e => { const v = e.target.value; const u = "?sheet=" + v + "&lvl=" + L.n; if (typeof siteSetUrl === "function") siteSetUrl((window.siteVirtual || location.pathname).split("?")[0] + u, false); else try { history.replaceState(null, "", u); } catch (x) {} render(v, L); };
  fit();
  try { siteEvent("read-sheet", type + "-" + L.n); } catch (e) {}
}
function fit(){
  const pages = document.getElementById("pages"); if (!pages) return;
  const w = pages.clientWidth || window.innerWidth, pw = 210 * 3.7795;
  const z = Math.min(1, (w - 4) / pw);
  pages.style.setProperty("--z", z.toFixed(3));
}
window.addEventListener("resize", fit);
window.addEventListener("beforeprint", () => { const p = document.getElementById("pages"); if (p) p.style.setProperty("--z", "1"); });
window.addEventListener("afterprint", fit);
return {render, S};
})();
