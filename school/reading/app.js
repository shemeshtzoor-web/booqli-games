/* =====================================================================
   מסלול הקריאה של אֲלֶפְבּוּקְלִי – המנוע (3.11.2026)
   =====================================================================
   מצבים בכתובת: (כלום) = המפה · ?lvl=N = שלב · ?lvl=N&g=<משחק> · ?lvl=N&g=test = אתגר השלב
                 ?place=1 = בודקים מאיפה מתחילים · ?choose=1 = בוחרים שלב · ?sheet=<דף>&lvl=N = הדפסה (sheets.js)
   ההתקדמות נשמרת בדפדפן: booqli_read = {max (השלב הכי גבוה שפתוח), cur, done{n:1 עבר / "p" מיקום / "s" דילוג},
   stars{n}, gw{"n:g"}, wins, story{}, name, g (b/g)}.  כפתור אחד מאפס הכל.
   ⚠️ אין כאן הקראה בקול – בכוונה (הקול הממוחשב לא מדייק בניקוד). ההוראות קצרות, גדולות ועם ניקוד.
*/
(function(){
"use strict";
const R = window.READ, $ = id => document.getElementById(id);
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const one = a => a[rnd(a.length)];
const uniqBy = (a, f) => { const s = new Set(); return a.filter(x => { const k = f(x); if (s.has(k)) return false; s.add(k); return true; }); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NIQ = /[֑-ׇ]/g;
const strip = s => s.replace(NIQ, "");
const plain = s => strip(s).replace(/[א-ת]+/g, w => R.FULL[w] || w);
const clusters = w => w.match(/[א-ת][֑-ׇ]*/g) || [];
const pw = w => w.p || plain(w.t);
R.plain = plain; R.strip = strip; R.clusters = clusters;

/* ---------- צלילים (רק צלצולים, בלי דיבור) ---------- */
let AC = null;
const ac = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) {} return AC; };
const tone = (f, dur = .3, type = "triangle", vol = .2, at = 0) => { const c = ac(); if (!c) return; const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05); };
const SND = {
  ok: () => { tone(660, .15, "sine", .2); tone(990, .25, "sine", .2, .12); },
  pop: () => tone(520 + rnd(300), .12, "sine", .22),
  soft: () => tone(300, .18, "sine", .1),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, "triangle", .2, i * .13)),
  big: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, .32, "triangle", .2, i * .12))
};

/* ---------- ההתקדמות ---------- */
const KEY = "booqli_read", GOAL = 3, PASS = 8, NMAX = R.LEVELS.length;
const blank = () => ({v:1, name:"", g:"", max:1, cur:1, done:{}, stars:{}, gw:{}, wins:0, story:{}, since:Date.now()});
let S = (() => { try { const o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o && o.v === 1) return Object.assign(blank(), o); } catch (e) {} return blank(); })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const LV = n => R.LEVELS[n - 1];
const W = n => R.WORLDS[LV(n).w - 1];
const G = (m, f, n) => S.g === "b" ? m : S.g === "g" ? f : n;
const passed = n => S.done[n] === 1;
const isOpen = n => n <= S.max;
const stickers = () => R.LEVELS.filter(l => passed(l.n)).length;
const fresh = () => S.max === 1 && !S.wins && !Object.keys(S.done).length;
const openUpTo = (n, how) => { for (let k = 1; k < n; k++) if (!S.done[k]) S.done[k] = how; S.max = Math.max(S.max, n); S.cur = n; save(); };

/* ---------- עזרים לתצוגה ---------- */
const emo = e => '<span class="emo">' + e + '</span>';
const rd = (t, c) => '<span class="rd ' + (c || "") + '">' + t + '</span>';
const cv = t => '<span class="cv">' + t + '</span>';
const dots = (n, i) => '<div class="dots">' + Array.from({length: n}, (_, k) => '<i class="' + (k < i ? "on" : "") + '"></i>').join("") + '</div>';
const shake = b => { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); };
const toast = (box, msg, ms = 1500) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; box.appendChild(t); setTimeout(() => t.remove(), ms); };
const almost = box => { SND.soft(); toast(box, "כִּמְעַט! נַסּוּ שׁוּב 🙂"); };
const confetti = () => { const c = document.createElement("div"); c.className = "conf"; const cols = ["#FF56C2","#FFC93C","#46C46E","#3AA7F0","#9B5DE5"];
  for (let i = 0; i < 46; i++) { const p = document.createElement("i"); p.style.left = rnd(100) + "%"; p.style.background = cols[i % 5]; p.style.animationDelay = (rnd(70) / 100) + "s"; c.appendChild(p); }
  document.body.appendChild(c); setTimeout(() => c.remove(), 2800); };
const modal = (html, on) => {
  const m = document.createElement("div"); m.className = "rmod"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
  m.innerHTML = '<div class="in">' + html + '</div>'; document.body.appendChild(m);
  m.addEventListener("click", e => { const a = e.target.closest("[data-a]"); if (e.target === m) { m.remove(); return; } if (!a) return; const k = a.dataset.a; if (k === "x") { m.remove(); return; } if (on && on[k]) { if (on[k](m, a) !== false) m.remove(); } });
  try { (m.querySelector("input") || m.querySelector("button")).focus(); } catch (e) {}
  return m;
};
/* שאלה למבוגר (לפני דילוג, בחירת שלב ואיפוס) */
const adult = (why, ok) => {
  const a = 3 + rnd(7), b = 4 + rnd(6);
  const m = modal('<div class="big" aria-hidden="true">👩‍👧</div><h2>רגע, זה למבוגר</h2><p>' + why + '</p><label class="lab" for="adQ">כמה זה ' + a + ' × ' + b + '?</label>' +
    '<input id="adQ" class="pin" inputmode="numeric" autocomplete="off"><div class="msg" aria-live="polite"></div>' +
    '<div class="row"><button type="button" class="btn" data-a="go">אישור</button><button type="button" class="btn alt" data-a="x">ביטול</button></div>',
    {go: mm => { const v = +mm.querySelector("input").value; if (v === a * b) { ok(); return true; } mm.querySelector(".msg").textContent = "לא בדיוק – נסו שוב"; return false; }});
  m.querySelector("input").addEventListener("keydown", e => { if (e.key === "Enter") m.querySelector("[data-a=go]").click(); });
};

/* ---------- צלילי ההברות: אילו הברות "נשמעות אותו דבר" (כדי שלא יהיו שתי תשובות נכונות) ---------- */
const DAG = "ּ", SIN = "ׂ";
const PH = {"א":"'","ע":"'","ג":"g","ד":"d","ה":"h","ז":"z","ח":"x","ק":"k","ט":"t","ת":"t","י":"y","ל":"l","מ":"m","ם":"m","נ":"n","ן":"n","ס":"s","צ":"c","ץ":"c","ר":"r","ו":"v"};
const phon = s => { const b = s[0], m = s.slice(1);
  if (b === "ב") return m.includes(DAG) ? "b" : "v";
  if (b === "כ" || b === "ך") return m.includes(DAG) ? "k" : "x";
  if (b === "פ" || b === "ף") return m.includes(DAG) ? "p" : "f";
  if (b === "ש") return m.includes(SIN) ? "s" : "sh";
  return PH[b] || b; };
const skey = it => phon(it.t) + it.v;
const LPH = l => ({"א":"'","ע":"'","כ":"k","ק":"k","ט":"t","ת":"t"}[l] || l);
const VM = {a:"ַ", i:"ִ", e:"ֶ", s:"ְ"};
const baseOf = t => clusters(t)[0].replace(/[ְ-ׇֻ]/g, "");
const compose = (base, v) => v === "o" ? base + "וֹ" : v === "u" ? base + "וּ" : base + VM[v];

/* ---------- מאגרים ---------- */
const lettersUpTo = n => R.LEVELS.filter(l => l.kind === "letters" && l.n <= n).map(l => l.set).join("").split("");
const sylPool = L => R.SYL.filter(s => L.v.includes(s.v));
const newest = L => L.v[L.v.length - 1];
const wordPool = L => R.WORDS.filter(w => w.lv <= (L.lv || 14));
const wordNew = L => R.WORDS.filter(w => w.lv === L.lv);
const PARTNER = l => { const p = R.SIMILAR.filter(x => x[0].length === 1 && x[1].length === 1 && x.includes(l)); return p.length ? one(p).find(x => x !== l) : ""; };

/* ---------- מחוללי שאלות: {q, qc, opts:[{h, ok, c, name}], n} ---------- */
const Q = {
  letterPic(L){ const set = L.set.split(""), rev = lettersUpTo(Math.max(L.n, 1)), t = Math.random() < .7 ? one(set) : one(rev);
    const ds = pick(rev.filter(x => x !== t && LPH(x) !== LPH(t)), 2);
    return {q: rd(t, "huge"), qc: "tx", opts: shuffle([t].concat(ds)).map(x => ({h: emo(R.LETTERS[x].e), ok: x === t, name: R.LETTERS[x].w}))}; },
  letterRev(L){ const set = L.set.split(""), rev = lettersUpTo(L.n), t = Math.random() < .7 ? one(set) : one(rev);
    const sim = PARTNER(t), pool = rev.filter(x => x !== t && LPH(x) !== LPH(t));
    let ds = sim && pool.includes(sim) ? [sim].concat(pick(pool.filter(x => x !== sim), 1)) : pick(pool, 2);
    return {q: emo(R.LETTERS[t].e), opts: shuffle([t].concat(ds)).map(x => ({h: rd(x), c: "txt", ok: x === t}))}; },
  cur(L){ const set = (L.kind === "similar" ? R.FINALS : lettersUpTo(L.n)), t = Math.random() < .7 ? one(L.set.split("")) : one(set);
    const ds = pick(set.filter(x => x !== t), 2), rev = Math.random() < .5;
    return rev ? {q: '<span class="cvq">' + cv(t) + '</span>', qc: "tx", opts: shuffle([t].concat(ds)).map(x => ({h: rd(x), c: "txt", ok: x === t}))}
               : {q: rd(t, "huge"), qc: "tx", opts: shuffle([t].concat(ds)).map(x => ({h: cv(x), c: "txt", ok: x === t}))}; },
  fin(){ const f = one(R.FINALS), reg = R.LETTERS[f].fin;
    if (Math.random() < .5) return {q: rd(reg, "huge"), qc: "tx", lab: "אֵיזוֹ הָאוֹת הַסּוֹפִית שֶׁלָּהּ?", opts: shuffle([f].concat(pick(R.FINALS.filter(x => x !== f), 2))).map(x => ({h: rd(x), c: "txt", ok: x === f}))};
    return {q: rd(f, "huge"), qc: "tx", lab: "מִי הָאוֹת הָרְגִילָה?", opts: shuffle([reg].concat(pick("כמנפצ".split("").filter(x => x !== reg), 2))).map(x => ({h: rd(x), c: "txt", ok: x === reg}))}; },
  end(){ const w = one(R.END_WORDS), cs = clusters(w.t);
    const shown = cs.slice(0, -1).join("") + '<span class="blank">?</span>';
    return {q: emo(w.e) + rd(shown, "word"), qc: "pair", opts: shuffle([w.f].concat(pick(R.FINALS.filter(x => x !== w.f), 2))).map(x => ({h: rd(x), c: "txt", ok: x === w.f}))}; },
  syl(L){ const pool = sylPool(L), nv = newest(L), t = one(Math.random() < .6 ? pool.filter(s => s.v === nv) : pool);
    const ds = pick(uniqBy(pool.filter(s => skey(s) !== skey(t) && s.e !== t.e && phon(s.t) + s.v !== phon(t.t) + t.v), s => s.e), L.v.length > 3 ? 3 : 2);
    return {q: rd(t.t, "huge"), qc: "tx", opts: shuffle([t].concat(ds)).map(s => ({h: emo(s.e), ok: s === t, name: s.w}))}; },
  srev(L){ const pool = sylPool(L), nv = newest(L), t = one(Math.random() < .6 ? pool.filter(s => s.v === nv) : pool);
    const base = baseOf(t.t), n = L.v.length > 3 ? 3 : 2;
    let ds = L.v.filter(v => v !== t.v && !(base[0] === "ו" && (v === "o" || v === "u"))).map(v => compose(base, v));
    ds = pick(ds, n);
    if (ds.length < n) ds = ds.concat(pick(uniqBy(pool.filter(s => phon(s.t) !== phon(t.t)), s => s.t).map(s => s.t), n - ds.length));
    return {q: emo(t.e), opts: shuffle([t.t].concat(ds)).map(x => ({h: rd(x), c: "txt", ok: x === t.t}))}; },
  word(L, src){ const pool = wordPool(L), nw = src || wordNew(L), t = one(Math.random() < .7 ? nw : pool);
    const ds = pick(pool.filter(w => w.e !== t.e), L.lv >= 13 ? 3 : 2);
    return {q: rd(t.t, "big"), qc: "tx", opts: shuffle([t].concat(ds)).map(w => ({h: emo(w.e), ok: w === t}))}; },
  wrev(L){ const pool = wordPool(L), t = one(Math.random() < .7 ? wordNew(L) : pool), f = clusters(t.t)[0][0];
    const near = pool.filter(w => w !== t && (clusters(w.t)[0][0] === f || clusters(w.t).length === clusters(t.t).length));
    let ds = pick(near, 2); if (ds.length < 2) ds = ds.concat(pick(pool.filter(w => w !== t && !ds.includes(w)), 2 - ds.length));
    return {q: emo(t.e), opts: shuffle([t].concat(ds)).map(w => ({h: rd(w.t), c: "txt wtxt", ok: w === t}))}; },
  miss(L){ const pool = wordPool(L).filter(w => clusters(w.t).length >= 2), t = one(Math.random() < .7 ? wordNew(L).filter(w => clusters(w.t).length >= 2) : pool);
    const cs = clusters(t.t), idx = cs.map((c, i) => i).filter(i => !/^[וי]/.test(cs[i]) && /[ְ-ֻ]/.test(cs[i]) && cs[i].replace(/[ּׁׂ]/g, "").length > 1);
    const k = idx.length ? one(idx) : 0, right = cs[k], b = baseOf(right);
    const all = uniqBy(R.WORDS.flatMap(w => clusters(w.t)).filter(c => c !== right && !/^[וי]/.test(c) && strip(c) !== "" && phon(c) + strip(c) !== phon(right) + strip(right)), c => c);
    const sameL = all.filter(c => baseOf(c) === b), other = all.filter(c => c[0] !== right[0]);
    const ds = (sameL.length ? [one(sameL)] : []).concat(pick(other, 2)).slice(0, 2);
    const shown = cs.map((c, i) => i === k ? '<span class="blank">?</span>' : c).join("");
    return {q: emo(t.e) + rd(shown, "word"), qc: "pair", opts: shuffle([right].concat(ds)).map(x => ({h: rd(x), c: "txt", ok: x === right}))}; },
  sent(L, pl){ const t = one(R.SENT), ds = pick(R.SENT.filter(s => s !== t), 2);
    return {q: rd(pl ? plain(t.t) : t.t, "sent"), qc: "tx", opts: shuffle([t].concat(ds)).map(s => ({h: emo(s.e), c: "wide", ok: s === t}))}; },
  tf(L, pl){ const t = one(R.SENT), yes = Math.random() < .5, e = yes ? t.e : one(R.SENT.filter(s => s !== t)).e;
    return {q: rd(pl ? plain(t.t) : t.t, "sent") + emo(e), qc: "tfq", opts: [{h: "✔️ נָכוֹן", c: "txt tfb", ok: yes}, {h: "✖️ לֹא נָכוֹן", c: "txt tfb", ok: !yes}]}; },
  pword(L){ const pool = R.WORDS, t = one(pool), ds = pick(pool.filter(w => w.e !== t.e), 3);
    return {q: rd(pw(t), "big"), qc: "tx", opts: shuffle([t].concat(ds)).map(w => ({h: emo(w.e), ok: w === t}))}; },
  spell(){ const s = one(R.SPELL);
    return {q: emo(s[2]), opts: shuffle([s[0], s[1]]).map(x => ({h: rd(x), c: "txt wtxt", ok: x === s[0]}))}; },
  story(st, k, pl){ const q = st.q[k], f = pl ? plain : (x => x);
    return {q: '<details class="stbox"><summary>📖 ' + f(st.title) + '</summary>' + st.lines.map(l => '<p>' + f(l) + '</p>').join("") + '</details>' + rd(f(q[0]), "sent"), qc: "tx",
      opts: shuffle(q.slice(1).map((x, i) => ({h: rd(f(x)), c: "txt wtxt", ok: i === 0})))}; }
};
const LAB = {letterPic:"אֵיזוֹ תְּמוּנָה מַתְחִילָה בָּאוֹת?", letterRev:"בְּאֵיזוֹ אוֹת מַתְחִילָה הַתְּמוּנָה?", cur:"מָה אוֹתָהּ הָאוֹת?",
  end:"אֵיךְ נִגְמֶרֶת הַמִּלָּה?", syl:"אֵיזוֹ תְּמוּנָה מַתְחִילָה כָּךְ?", srev:"אֵיךְ מַתְחִילָה הַמִּלָּה?", word:"מָה כָּתוּב?",
  wrev:"אֵיזוֹ מִלָּה מַתְאִימָה?", miss:"מָה חָסֵר בַּמִּלָּה?", sent:"אֵיזוֹ תְּמוּנָה מַתְאִימָה לַמִּשְׁפָּט?", tf:"הַתְּמוּנָה מַתְאִימָה לַמִּשְׁפָּט?",
  pword:"מָה כָּתוּב?", spell:"אֵיךְ כּוֹתְבִים נָכוֹן?", story:""};

/* ---------- מנוע החידון ---------- */
function quiz(stage, spec){
  let i = 0, score = 0;
  const next = () => {
    if (i >= spec.rounds) return spec.done(score);
    const r = spec.make(i), lab = r.lab != null ? r.lab : (spec.lab || "");
    let first = true, over = false;
    stage.innerHTML = dots(spec.rounds, i) + (lab ? '<p class="lab-q">' + lab + '</p>' : "") + '<div class="q ' + (r.qc || "") + '">' + r.q + '</div>' +
      '<div class="opts" style="--n:' + (r.n || r.opts.length) + '">' + r.opts.map((o, k) => '<button type="button" class="opt ' + (o.c || "") + '" data-k="' + k + '"' + (window.__bqTest && o.ok ? ' data-ok="1"' : "") + (o.name ? ' aria-label="' + esc(o.name) + '"' : "") + '>' + o.h + '</button>').join("") + '</div>';
    stage.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      if (over) return; const o = r.opts[+b.dataset.k];
      if (spec.onAnswer) spec.onAnswer(!!o.ok);
      if (o.ok) { over = true; if (first) score++; b.classList.add("ok"); SND.ok(); i++; setTimeout(next, 750); }
      else if (spec.test) { over = true; b.classList.add("no"); stage.querySelectorAll(".opt").forEach(x => { if (r.opts[+x.dataset.k].ok) x.classList.add("ok"); }); SND.soft(); i++; setTimeout(next, 1500); }
      else { first = false; shake(b); almost(stage); }
    });
  };
  next();
}
const quizGame = (maker, rounds = 6) => (stage, L, done) => quiz(stage, {rounds, lab: LAB[maker], make: () => Q[maker](L), done});

/* ---------- בלונים ---------- */
function gPop(stage, L, done){
  const ROUNDS = 3; let round = 0;
  const make = () => {
    if (L.kind === "letters" || L.kind === "similar") {
      let t, others;
      if (L.kind === "letters") { t = one(L.set.split("")); const p = PARTNER(t); others = pick(lettersUpTo(L.n).filter(x => x !== t), 7).concat(p ? [p, p] : []); }
      else { const pr = one(R.SIMILAR); t = one(pr); const o = pr.find(x => x !== t); others = [o, o, o, o].concat(pick(R.ABC.filter(x => x !== t && x !== o), 4)); }
      return {lab: "פּוֹצְצוּ כָּל בַּלּוֹן עִם " + rd(t, "inl"), items: shuffle([t, t, t, t].map(x => ({h: rd(x), ok: true})).concat(others.slice(0, 8).map(x => ({h: rd(x), ok: x === t}))))};
    }
    if (L.kind === "niqqud") {
      const pool = sylPool(L);
      if (L.v.length === 1) { const t = one(pool); const oth = pick(pool.filter(s => phon(s.t) !== phon(t.t)), 8);
        return {lab: "פּוֹצְצוּ כָּל בַּלּוֹן עִם " + rd(t.t, "inl"), items: shuffle([t, t, t, t].map(s => ({h: rd(s.t), ok: true})).concat(oth.map(s => ({h: rd(s.t), ok: false}))))}; }
      const v = round === 0 ? newest(L) : one(L.v), bases = uniqBy(pool.map(s => baseOf(s.t)), b => b).filter(b => b[0] !== "ו");
      const tg = pick(bases, 4).map(b => compose(b, v)), ot = [];
      while (ot.length < 8) { const v2 = one(L.v.filter(x => x !== v)); ot.push(compose(one(bases), v2)); }
      return {lab: "פּוֹצְצוּ כָּל הֲבָרָה עִם " + R.VOWELS[v].name + " " + rd(R.VOWELS[v].sign, "inl"), items: shuffle(tg.map(x => ({h: rd(x), ok: true})).concat(ot.map(x => ({h: rd(x), ok: false}))))};
    }
    const pool = wordPool(L), cats = Object.keys(R.CATS).filter(c => pool.filter(w => w.c === c).length >= 3), c = one(cats.length ? cats : ["ח"]);
    const tg = pick(R.WORDS.filter(w => w.c === c && w.lv <= Math.max(L.lv, 13)), 4), ot = pick(pool.filter(w => w.c !== c), 8);
    return {lab: "פּוֹצְצוּ אֶת כָּל הַמִּלִּים שֶׁל " + R.CATS[c].t + " " + R.CATS[c].e, items: shuffle(tg.map(w => ({h: rd(w.t), ok: true})).concat(ot.map(w => ({h: rd(w.t), ok: false})))), words: true};
  };
  const play = () => {
    if (round >= ROUNDS) return done();
    const m = make(); let left = m.items.filter(x => x.ok).length;
    stage.innerHTML = dots(ROUNDS, round) + '<p class="lab-q">' + m.lab + '</p><div class="balloons' + (m.words ? " words" : "") + '">' +
      m.items.map((x, k) => '<button type="button" class="bal c' + (k % 6) + '" data-k="' + k + '" style="--d:' + (rnd(25) / 10) + 's">' + x.h + '</button>').join("") + '</div>';
    stage.querySelectorAll(".bal").forEach(b => b.onclick = () => {
      if (b.classList.contains("gone")) return; const x = m.items[+b.dataset.k];
      if (x.ok) { b.classList.add("gone"); SND.pop(); if (!--left) { round++; SND.ok(); setTimeout(play, 700); } } else { shake(b); almost(stage); }
    });
  };
  play();
}

/* ---------- זיכרון ---------- */
function gMem(stage, pairs, done){
  const cards = shuffle(pairs.flatMap((p, i) => [{k: i, h: p.a}, {k: i, h: p.b}]));
  let open = [], found = 0, lock = false;
  stage.innerHTML = '<p class="lab-q">מְחַפְּשִׂים זוּגוֹת 🃏</p><div class="mem">' + cards.map((c, i) => '<button type="button" class="card" data-i="' + i + '" aria-label="קלף"><span class="back">⭐</span><span class="face">' + c.h + '</span></button>').join("") + '</div>';
  stage.querySelectorAll(".card").forEach(b => b.onclick = () => {
    if (lock || b.classList.contains("up")) return;
    b.classList.add("up"); open.push(b); SND.pop();
    if (open.length < 2) return;
    const [x, y] = open, cx = cards[+x.dataset.i], cy = cards[+y.dataset.i];
    if (cx.k === cy.k) { x.classList.add("got"); y.classList.add("got"); open = []; SND.ok(); if (++found === pairs.length) setTimeout(done, 700); }
    else { lock = true; setTimeout(() => { x.classList.remove("up"); y.classList.remove("up"); open = []; lock = false; }, 1100); }
  });
}
const memPairs = L => {
  if (L.kind === "letters") return pick(uniqBy(L.set.split("").concat(pick(lettersUpTo(L.n), 6)), x => x), 6).map(l => ({a: rd(l), b: emo(R.LETTERS[l].e)}));
  if (L.kind === "niqqud") return pick(uniqBy(sylPool(L), s => skey(s)), 6).map(s => ({a: rd(s.t), b: emo(s.e)}));
  if (L.kind === "plain") return pick(R.WORDS.filter(w => clusters(w.t).length <= 5), 6).map(w => ({a: rd(w.t), b: rd(pw(w))}));
  return pick(uniqBy(wordNew(L).concat(pick(wordPool(L), 3)), w => w.e), 6).map(w => ({a: rd(w.t), b: emo(w.e)}));
};

/* ---------- מה שונה? ---------- */
function gDiff(stage, L, done){
  const ROUNDS = 6; let i = 0;
  const next = () => {
    if (i >= ROUNDS) return done();
    let t, o;
    if (L.kind === "similar") { const p = one(R.SIMILAR); t = p[0]; o = p[1]; if (Math.random() < .5) [t, o] = [o, t]; }
    else { t = one(L.set.split("")); o = PARTNER(t) || one(lettersUpTo(L.n).filter(x => x !== t)); }
    const n = i < 2 ? 9 : 16, at = rnd(n);
    stage.innerHTML = dots(ROUNDS, i) + '<p class="lab-q">מִצְאוּ אֶת הָאוֹת הַשּׁוֹנָה 🔍</p><div class="dgrid" style="--c:' + (n === 9 ? 3 : 4) + '">' +
      Array.from({length: n}, (_, k) => '<button type="button" class="opt txt" data-k="' + k + '">' + rd(k === at ? o : t) + '</button>').join("") + '</div>';
    stage.querySelectorAll(".dgrid .opt").forEach(b => b.onclick = () => {
      if (+b.dataset.k === at) { b.classList.add("ok"); SND.ok(); i++; setTimeout(next, 700); } else { shake(b); almost(stage); }
    });
  };
  next();
}

/* ---------- בונים מילה / מסדרים משפט ---------- */
function gBuild(stage, items, done, opt = {}){
  const ROUNDS = Math.min(opt.rounds || 5, items.length); let i = 0; const list = pick(items, ROUNDS);
  const next = () => {
    if (i >= ROUNDS) return done();
    const it = list[i], tiles = it.tiles, used = new Set(tiles.map(x => x[0])), extra = (opt.extra || []).filter(x => !used.has(x[0]));
    const bag = shuffle(tiles.map((t, k) => ({t, k})).concat(pick(extra, opt.nExtra || 0).map(t => ({t, k: -1}))));
    let pos = 0;
    stage.innerHTML = dots(ROUNDS, i) + '<p class="lab-q">' + (opt.lab || "בּוֹנִים אֶת הַמִּלָּה 🧱") + '</p><div class="q">' + emo(it.e) + '</div>' +
      '<div class="slots' + (opt.words ? " wd" : "") + '">' + tiles.map(() => '<span class="slot"></span>').join("") + '</div>' +
      '<div class="tiles' + (opt.words ? " wd" : "") + '">' + bag.map((b, k) => '<button type="button" class="tile" data-k="' + k + '">' + rd(b.t) + '</button>').join("") + '</div>';
    const slots = stage.querySelectorAll(".slot");
    stage.querySelectorAll(".tile").forEach(b => b.onclick = () => {
      if (b.disabled) return; const x = bag[+b.dataset.k];
      if (x.t === tiles[pos]) { slots[pos].innerHTML = rd(x.t); slots[pos].classList.add("full"); b.disabled = true; b.classList.add("used"); SND.pop(); pos++;
        if (pos === tiles.length) { SND.ok(); stage.querySelector(".slots").classList.add("done"); i++; setTimeout(next, 1100); } }
      else { shake(b); almost(stage); }
    });
  };
  next();
}
const buildWords = (L, pl) => (pl ? R.WORDS.filter(w => pw(w).length <= 6) : wordNew(L)).map(w => ({e: w.e, tiles: pl ? pw(w).split("") : clusters(w.t)}));
const extraTiles = (L, pl) => pl ? "אבגדהוזחטיכלמנסעפצקרשת".split("") : uniqBy(wordPool(L).flatMap(w => clusters(w.t)), c => c);

/* ---------- כותבים באצבע (דפוס / כתב) ---------- */
function gTrace(stage, L, done){
  const set = shuffle(L.set.split("")).slice(0, 4); let i = 0, mode = "print";
  const next = async () => {
    if (i >= set.length) return done();
    const t = set[i];
    stage.innerHTML = dots(set.length, i) + '<p class="lab-q">עוֹבְרִים בָּאֶצְבַּע עַל הַקַּוִּים ✍️</p>' +
      '<div class="row mode" role="group" aria-label="סוג הכתב"><button type="button" class="btn sm' + (mode === "print" ? "" : " alt") + '" data-m="print">דְּפוּס</button><button type="button" class="btn sm' + (mode === "cur" ? "" : " alt") + '" data-m="cur">כְּתָב</button></div>' +
      '<div class="pad"><canvas class="guide"></canvas><canvas class="ink"></canvas></div>' +
      '<div class="row"><button type="button" class="btn" data-a="chk">✔️ סִיַּמְתִּי</button><button type="button" class="btn alt" data-a="clr">🧽 מוֹחֲקִים</button></div>';
    const pad = stage.querySelector(".pad"), g = stage.querySelector(".guide"), ink = stage.querySelector(".ink");
    const size = Math.min(320, pad.clientWidth || 300), dpr = Math.min(2, window.devicePixelRatio || 1);
    [g, ink].forEach(c => { c.width = size * dpr; c.height = size * dpr; c.style.width = c.style.height = size + "px"; });
    pad.style.height = size + "px";
    const font = (mode === "cur" ? "400 " + Math.round(size * .78 * dpr) + "px GveretLevin" : "700 " + Math.round(size * .74 * dpr) + "px BQRead");
    try { await document.fonts.load(font, t); } catch (e) {}
    const drawGlyph = (ctx, how) => { ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "rtl";
      const y = size * dpr * (mode === "cur" ? .5 : .54);
      if (how === "fill") ctx.fillText(t, size * dpr / 2, y); else ctx.strokeText(t, size * dpr / 2, y); };
    const gc = g.getContext("2d"); gc.fillStyle = "#F6E9F1"; drawGlyph(gc, "fill"); gc.setLineDash([7 * dpr, 7 * dpr]); gc.lineWidth = 3 * dpr; gc.strokeStyle = "#E0399F"; drawGlyph(gc, "stroke");
    const ic = ink.getContext("2d"); ic.lineCap = ic.lineJoin = "round"; ic.lineWidth = size * dpr * .075; ic.strokeStyle = "rgba(78,133,118,.85)";
    let down = false, last = null, drawn = 0;
    const P = e => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr]; };
    ink.onpointerdown = e => { down = true; last = P(e); try { ink.setPointerCapture(e.pointerId); } catch (x) {} ic.beginPath(); ic.arc(last[0], last[1], ic.lineWidth / 2, 0, 7); ic.fillStyle = ic.strokeStyle; ic.fill(); e.preventDefault(); };
    ink.onpointermove = e => { if (!down) return; const p = P(e); ic.beginPath(); ic.moveTo(last[0], last[1]); ic.lineTo(p[0], p[1]); ic.stroke(); last = p; drawn++; e.preventDefault(); };
    ink.onpointerup = ink.onpointercancel = () => { down = false; };
    stage.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m; next(); });
    stage.querySelector("[data-a=clr]").onclick = () => ic.clearRect(0, 0, ink.width, ink.height);
    stage.querySelector("[data-a=chk]").onclick = () => {
      const W = ink.width, H = ink.height, mk = document.createElement("canvas"); mk.width = W; mk.height = H;
      const mc = mk.getContext("2d"); mc.fillStyle = "#000"; drawGlyph(mc, "fill");
      const fat = document.createElement("canvas"); fat.width = W; fat.height = H; const fc = fat.getContext("2d");
      fc.fillStyle = fc.strokeStyle = "#000"; fc.lineWidth = size * dpr * .16; fc.lineJoin = "round"; drawGlyph(fc, "fill"); drawGlyph(fc, "stroke");
      const a = mc.getImageData(0, 0, W, H).data, f = fc.getImageData(0, 0, W, H).data, u = ic.getImageData(0, 0, W, H).data;
      let glyph = 0, cov = 0, ink2 = 0, out = 0;
      for (let k = 3; k < a.length; k += 16) { const inG = a[k] > 100, inU = u[k] > 60; if (inG) { glyph++; if (inU) cov++; } if (inU) { ink2++; if (f[k] < 60) out++; } }
      const c = glyph ? cov / glyph : 0, o = ink2 ? out / ink2 : 1;
      if (drawn > 3 && c >= .5 && o <= .4) { SND.ok(); toast(stage, "יָפֶה מְאֹד! ⭐"); i++; setTimeout(next, 900); }
      else { almost(stage); setTimeout(() => ic.clearRect(0, 0, ink.width, ink.height), 500); }
    };
  };
  next();
}

/* ---------- סיפורונים ---------- */
function gStory(stage, L, done, pl){
  const f = pl ? plain : (x => x), pre = pl ? "p:" : "";
  const list = () => {
    stage.innerHTML = '<p class="lab-q">בּוֹחֲרִים סִפּוּר 📚</p><div class="stories">' + R.STORIES.map((s, k) => '<button type="button" class="stc" data-k="' + k + '"><span class="emo">' + s.ic + '</span>' + rd(f(s.title)) + (S.story[pre + s.id] ? '<i class="ok">✔️</i>' : "") + '</button>').join("") + '</div>';
    stage.querySelectorAll(".stc").forEach(b => b.onclick = () => read(R.STORIES[+b.dataset.k]));
  };
  const read = st => {
    stage.innerHTML = '<article class="story"><h3>' + rd(f(st.title)) + ' <span aria-hidden="true">' + st.ic + '</span></h3>' + st.lines.map(l => '<p>' + rd(f(l)) + '</p>').join("") + '</article>' +
      '<div class="row"><button type="button" class="btn" data-a="q">קָרָאתִי! לַשְּׁאֵלוֹת ←</button></div>';
    stage.querySelector("[data-a=q]").onclick = () => quiz(stage, {rounds: st.q.length, make: k => Q.story(st, k, pl), done: () => { S.story[pre + st.id] = 1; save(); done(); }});
  };
  list();
}

/* ---------- רשימת המשחקים ---------- */
const GAMES = {
  pic:   {ic:"🖼️", t:"אוֹת וּתְמוּנָה", d:"רוֹאִים אוֹת – בּוֹחֲרִים תְּמוּנָה", run: quizGame("letterPic")},
  rev:   {ic:"🔎", t:"תְּמוּנָה וְאוֹת", d:"בְּאֵיזוֹ אוֹת זֶה מַתְחִיל?", run: (s, L, d) => (L.kind === "niqqud" ? quizGame("srev") : quizGame("letterRev"))(s, L, d)},
  pop:   {ic:"🎈", t:"בַּלּוֹנִים", d:"פּוֹצְצִים רַק אֶת הַנְּכוֹנִים", run: gPop},
  mem:   {ic:"🃏", t:"זִכָּרוֹן", d:"מְחַפְּשִׂים זוּגוֹת", run: (s, L, d) => gMem(s, memPairs(L), d)},
  diff:  {ic:"🔍", t:"מָה שׁוֹנֶה?", d:"אוֹתִיּוֹת שֶׁדּוֹמוֹת מְאֹד", run: gDiff},
  trace: {ic:"✍️", t:"כּוֹתְבִים בָּאֶצְבַּע", d:"דְּפוּס וּכְתָב", run: gTrace},
  cur:   {ic:"🖋️", t:"דְּפוּס וּכְתָב", d:"אוֹתָהּ אוֹת – שְׁנֵי כְּתָבִים", run: quizGame("cur")},
  fin:   {ic:"🔚", t:"אוֹתִיּוֹת סוֹפִיּוֹת", d:"מ וְ-ם, נ וְ-ן…", run: quizGame("fin")},
  end:   {ic:"🧩", t:"אֵיךְ נִגְמֶרֶת הַמִּלָּה?", d:"מַשְׁלִימִים אוֹת סוֹפִית", run: quizGame("end")},
  syl:   {ic:"🎵", t:"הֲבָרָה וּתְמוּנָה", d:"קוֹרְאִים הֲבָרָה – בּוֹחֲרִים תְּמוּנָה", run: quizGame("syl")},
  word:  {ic:"📖", t:"מִלָּה וּתְמוּנָה", d:"קוֹרְאִים מִלָּה – בּוֹחֲרִים תְּמוּנָה", run: quizGame("word")},
  wrev:  {ic:"🖼️", t:"תְּמוּנָה וּמִלָּה", d:"אֵיזוֹ מִלָּה מַתְאִימָה?", run: quizGame("wrev")},
  build: {ic:"🧱", t:"בּוֹנִים מִלָּה", d:"כְּתִיב: הֲבָרָה אַחֲרֵי הֲבָרָה", run: (s, L, d) => gBuild(s, buildWords(L), d, {extra: extraTiles(L), nExtra: L.lv >= 14 ? 2 : L.lv >= 13 ? 1 : 0})},
  miss:  {ic:"❓", t:"מָה חָסֵר?", d:"מַשְׁלִימִים אֶת הַמִּלָּה", run: quizGame("miss")},
  sent:  {ic:"📝", t:"מִשְׁפָּט וּתְמוּנָה", d:"קוֹרְאִים מִשְׁפָּט שָׁלֵם", run: quizGame("sent")},
  tf:    {ic:"✔️", t:"נָכוֹן אוֹ לֹא?", d:"הַתְּמוּנָה מַתְאִימָה?", run: quizGame("tf", 8)},
  order: {ic:"🚂", t:"רַכֶּבֶת מִלִּים", d:"מְסַדְּרִים מִשְׁפָּט", run: (s, L, d) => gBuild(s, R.SENT.filter(x => x.t.split(" ").length >= 3).map(x => ({e: x.e, tiles: x.t.split(" ")})), d, {words: true, rounds: 4, lab: "מְסַדְּרִים אֶת הַמִּשְׁפָּט 🚂"})},
  story: {ic:"📚", t:"סִפּוּרוֹנִים", d:"קוֹרְאִים וְעוֹנִים", run: (s, L, d) => gStory(s, L, d, false)},
  pword: {ic:"🔎", t:"מִלִּים בְּלִי נִקּוּד", d:"קוֹרְאִים כְּמוֹ הַגְּדוֹלִים", run: quizGame("pword", 8)},
  psent: {ic:"📝", t:"מִשְׁפָּטִים בְּלִי נִקּוּד", d:"מִשְׁפָּט וּתְמוּנָה", run: (s, L, d) => quiz(s, {rounds: 6, lab: LAB.sent, make: () => (Math.random() < .5 ? Q.sent(L, true) : Q.tf(L, true)), done: d})},
  pmem:  {ic:"🃏", t:"זִכָּרוֹן: עִם וּבְלִי", d:"מִלָּה עִם נִקּוּד וּבְלִי נִקּוּד", run: (s, L, d) => gMem(s, memPairs(L), d)},
  pstory:{ic:"📚", t:"סִפּוּרִים בְּלִי נִקּוּד", d:"קוֹרְאִים וְעוֹנִים", run: (s, L, d) => gStory(s, L, d, true)},
  spell: {ic:"✏️", t:"אֵיךְ כּוֹתְבִים?", d:"ת אוֹ ט? כ אוֹ ק?", run: quizGame("spell", 8)},
  pbuild:{ic:"🧱", t:"בּוֹנִים מִלָּה בְּלִי נִקּוּד", d:"כְּתִיב מָלֵא", run: (s, L, d) => gBuild(s, buildWords(L, true), d, {extra: extraTiles(L, true), nExtra: 2, lab: "בּוֹנִים אֶת הַמִּלָּה – בְּלִי נִקּוּד 🧱"})}
};
GAMES.rev.t2 = {niqqud: "תְּמוּנָה וַהֲבָרָה"};
GAMES.rev.d2 = {niqqud: "אֵיךְ מַתְחִילָה הַמִּלָּה?"};
const gName = (g, L) => (GAMES[g].t2 && GAMES[g].t2[L.kind]) || GAMES[g].t;
const gDesc = (g, L) => (GAMES[g].d2 && GAMES[g].d2[L.kind]) || GAMES[g].d;

/* ---------- אתגר השלב: 10 שאלות, עוברים ב-8 ---------- */
const TEST = {
  letters: L => Array.from({length: 10}, (_, i) => () => i % 2 ? Q.letterRev(L) : Q.letterPic(L)),
  similar: L => Array.from({length: 10}, (_, i) => () => i % 2 ? Q.end(L) : Q.fin(L)),
  niqqud:  L => Array.from({length: 10}, (_, i) => () => i % 2 ? Q.srev(L) : Q.syl(L)),
  words:   L => Array.from({length: 10}, (_, i) => () => [Q.word, Q.wrev, L.lv >= 13 ? Q.miss : Q.word][i % 3](L)),
  sent:    L => Array.from({length: 10}, (_, i) => () => i % 2 ? Q.tf(L) : Q.sent(L)),
  story:   L => { const st = pick(R.STORIES, 2); return [0, 1, 2].map(k => () => Q.story(st[0], k)).concat([0, 1, 2].map(k => () => Q.story(st[1], k)), Array.from({length: 4}, () => () => Q.sent(L))); },
  plain:   L => Array.from({length: 10}, (_, i) => () => [Q.pword, l => Q.sent(l, true), l => Q.tf(l, true)][i % 3](L)),
  spell:   L => Array.from({length: 10}, (_, i) => () => i % 3 === 2 ? Q.pword(L) : Q.spell(L))
};
const testLab = {letters: k => k % 2 ? LAB.letterRev : LAB.letterPic, similar: k => k % 2 ? LAB.end : "", niqqud: k => k % 2 ? LAB.srev : LAB.syl,
  words: (k, L) => [LAB.word, LAB.wrev, L.lv >= 13 ? LAB.miss : LAB.word][k % 3], sent: k => k % 2 ? LAB.tf : LAB.sent, story: k => k < 6 ? "" : LAB.sent,
  plain: k => [LAB.pword, LAB.sent, LAB.tf][k % 3], spell: k => k % 3 === 2 ? LAB.pword : LAB.spell};

/* ---------- בודקים מאיפה מתחילים ---------- */
const PLACE = [
  {to: 1,  need: 2, n: 3, lab: LAB.letterPic, make: () => Q.letterPic(LV(4))},
  {to: 5,  need: 2, n: 2, lab: "", make: () => Q.fin()},
  {to: 6,  need: 2, n: 3, lab: LAB.syl, make: () => Q.syl(LV(10))},
  {to: 12, need: 2, n: 3, lab: LAB.word, make: () => Q.word(LV(13), wordPool(LV(13)))},
  {to: 15, need: 2, n: 2, lab: LAB.sent, make: () => Q.sent(LV(15))},
  {to: 17, need: 2, n: 2, lab: LAB.pword, make: () => Q.pword(LV(17))}
];

/* =================================== העמוד =================================== */
const app = $("readApp");
/* הכתובת האמיתית: המדידה (siteEvent) מחליפה את הכתובת לרגע, לכן קוראים דרך siteVirtual ומשנים דרך siteSetUrl */
const here = () => (window.siteVirtual || (location.pathname + location.search));
const P = () => new URLSearchParams((here().split("#")[0].split("?")[1]) || "");
const go = (qs, push = true) => {
  if (push) { const u = here().split("?")[0].replace(/[^/]*$/, "") + (qs && qs !== "./" ? qs : "");
    if (typeof siteSetUrl === "function") siteSetUrl(u, true); else try { history.pushState(null, "", u); } catch (e) {} }
  route(); window.scrollTo({top: Math.max(0, app.offsetTop - 70), behavior: "smooth"}); };
app.addEventListener("click", e => { const a = e.target.closest("a[data-go]"); if (!a || e.metaKey || e.ctrlKey) return; e.preventDefault(); ac(); go(a.getAttribute("href")); });
window.addEventListener("popstate", () => route());

const hello = () => S.name ? esc(S.name) : G("חָבֵר", "חֲבֵרָה", "חֲבֵרִים");
function hub(){
  document.body.classList.remove("in-game");
  const cur = Math.min(S.cur || S.max, NMAX), L = LV(cur);
  const status = fresh() ? '<p class="bubble">שָׁלוֹם! אֲנִי אֲלֶפְבּוּקְלִי 🦄 יַחַד נִלְמַד לִקְרֹא – מֵהָאוֹת הָרִאשׁוֹנָה וְעַד סִפּוּרִים שְׁלֵמִים. מֵאֵיפֹה מַתְחִילִים?</p>'
    : '<p class="bubble">שָׁלוֹם ' + hello() + '! 👋 עַכְשָׁו בְּשָׁלָב ' + cur + ': ' + L.t + '</p>';
  const start = fresh() ? '<div class="starts"><a class="bigbtn" data-go href="?place=1"><span>🧭</span><b>בּוֹדְקִים מֵאֵיפֹה מַתְחִילִים</b><small>כַּמָּה שְׁאֵלוֹת קְצָרוֹת</small></a>' +
      '<a class="bigbtn alt" data-go href="?lvl=1"><span>1️⃣</span><b>מַתְחִילִים מֵהַהַתְחָלָה</b><small>אוֹתִיּוֹת א–ז</small></a>' +
      '<a class="bigbtn alt2" data-go href="?choose=1"><span>🎯</span><b>בּוֹחֲרִים שָׁלָב</b><small>הַמְּבוּגָּר בּוֹחֵר</small></a></div>'
    : '<div class="starts"><a class="bigbtn" data-go href="?lvl=' + cur + '"><span>▶️</span><b>מַמְשִׁיכִים</b><small>שָׁלָב ' + cur + ' · ' + L.t + '</small></a></div>';
  const map = R.WORLDS.map(w => '<section class="world" style="--wc:' + w.c + ';--wb:' + w.b + '"><h2><span aria-hidden="true">' + w.ic + '</span> ' + w.t + '</h2><ol class="path">' +
    R.LEVELS.filter(l => l.w === w.n).map(l => {
      const st = passed(l.n) ? "done" : S.done[l.n] ? "skip" : !isOpen(l.n) ? "lock" : l.n === cur ? "cur" : "open";
      const mark = st === "done" ? R.STICKERS[l.n - 1] : st === "lock" ? "🔒" : st === "skip" ? "✓" : l.n;
      return '<li class="st ' + st + '"><a data-go href="?lvl=' + l.n + '" aria-label="שלב ' + l.n + ': ' + esc(l.p) + (st === "lock" ? " (נעול)" : "") + '"><span class="dot">' + mark + '</span><span class="nm">' + l.t + '</span>' +
        (st === "cur" ? '<em>אַתֶּם כָּאן</em>' : "") + ((S.stars[l.n] || 0) && st !== "done" ? '<small>' + "⭐".repeat(Math.min(GOAL, S.stars[l.n])) + '</small>' : "") + '</a></li>';
    }).join("") + '</ol></section>').join("");
  const album = '<section class="album"><h2>🏅 אֹסֶף הַמַּדְבֵּקוֹת שֶׁלִּי <small>' + stickers() + ' / ' + NMAX + '</small></h2><div class="stk">' +
    R.LEVELS.map(l => '<span class="' + (passed(l.n) ? "got" : "") + '" title="שלב ' + l.n + '">' + (passed(l.n) ? R.STICKERS[l.n - 1] : "?") + '</span>').join("") + '</div>' +
    '<p class="note">כָּל אֶתְגָּר שֶׁעוֹבְרִים = מַדְבֵּקָה חֲדָשָׁה!</p></section>';
  app.innerHTML = '<section class="r-hero"><img src="../../img/family/alef.webp" alt="" width="120" height="124"><div><small>מַסְלוּל הַקְּרִיאָה</small><h1>לוֹמְדִים לִקְרֹא עִם אֲלֶפְבּוּקְלִי</h1>' + status +
    '<div class="stats"><span>⭐ <b>' + S.wins + '</b> נִצְחוֹנוֹת</span><span>🏅 <b>' + stickers() + '</b> מַדְבֵּקוֹת</span><span>🚩 שָׁלָב <b>' + cur + '</b> מִתּוֹךְ ' + NMAX + '</span></div></div></section>' +
    start + map + album +
    '<div class="row tools-row"><button type="button" class="btn alt sm" id="rName">👤 ' + (S.name ? "אֲנִי " + esc(S.name) : "אֵיךְ קוֹרְאִים לִי?") + '</button>' +
    (fresh() ? "" : '<a class="btn alt sm" data-go href="?place=1">🧭 בְּדִיקָה מֵחָדָשׁ</a><a class="btn alt sm" data-go href="?choose=1">🎯 בְּחִירַת שָׁלָב</a>') +
    '<button type="button" class="btn alt sm danger" id="rReset">🗑️ מַתְחִילִים מֵהַהַתְחָלָה</button></div>';
  $("rName").onclick = profile;
  $("rReset").onclick = () => adult("האיפוס מוחק את השלבים, הכוכבים, הניצחונות והמדבקות במכשיר הזה, ומתחילים מחדש.", () => { S = blank(); save(); siteEvent("read-reset", "all"); go("./"); });
}

function profile(){
  const m = modal('<div class="big" aria-hidden="true">🦄</div><h2>אֵיךְ קוֹרְאִים לְךָ?</h2><input id="pfN" class="pin name" maxlength="16" autocomplete="off" value="' + esc(S.name) + '" aria-label="השם">' +
    '<div class="row" role="group" aria-label="בן או בת"><button type="button" class="btn ' + (S.g === "b" ? "" : "alt") + '" data-a="b">👦 בֵּן</button><button type="button" class="btn ' + (S.g === "g" ? "" : "alt") + '" data-a="g">👧 בַּת</button></div>' +
    '<p class="note">השם מופיע בתעודות ובברכות.</p><div class="row"><button type="button" class="btn" data-a="ok">שׁוֹמְרִים ✔️</button></div>',
    {b: mm => { S.g = "b"; mm.querySelectorAll("[data-a=b],[data-a=g]").forEach(x => x.classList.toggle("alt", x.dataset.a !== "b")); return false; },
     g: mm => { S.g = "g"; mm.querySelectorAll("[data-a=b],[data-a=g]").forEach(x => x.classList.toggle("alt", x.dataset.a !== "g")); return false; },
     ok: mm => { S.name = mm.querySelector("input").value.trim().slice(0, 16); save(); route(); }});
}

function lockedLevel(L){
  app.innerHTML = backTop() + '<section class="lockbox"><div class="big" aria-hidden="true">🔒</div><h1>שָׁלָב ' + L.n + ': ' + L.t + '</h1>' +
    '<p>הַשָּׁלָב הַזֶּה נִפְתָּח אַחֲרֵי שֶׁעוֹבְרִים אֶת הָאֶתְגָּר שֶׁל שָׁלָב ' + (L.n - 1) + '.</p>' +
    '<div class="row"><a class="btn" data-go href="?lvl=' + S.max + '">▶️ לַשָּׁלָב שֶׁלִּי (' + S.max + ')</a><button type="button" class="btn alt" id="lkOpen">👩‍👧 מבוגר: לפתוח את השלב</button></div>' +
    '<p class="note">הורה או מורה ששלחו לכם קישור לשלב הזה? אפשר לפתוח אותו – השלבים שלפניו יסומנו כ"דילגנו".</p></section>';
  $("lkOpen").onclick = () => adult("פותחים את שלב " + L.n + ". מומלץ קודם לעבור את האתגרים של השלבים הקודמים.", () => { openUpTo(L.n, "s"); siteEvent("read-unlock", "lvl" + L.n); route(); });
}
const backTop = (to, txt) => '<div class="r-top"><a class="back" data-go href="' + (to || "./") + '">' + (txt || "← לַמַּפָּה") + '</a></div>';

function learnBoard(L){
  if (L.kind === "letters") return '<div class="learn">' + L.set.split("").map(l => { const x = R.LETTERS[l]; return '<button type="button" class="lt" data-l="' + l + '">' + rd(l, "lt-l") + cv(l) + emo(x.e) + '<small>' + x.w + '</small></button>'; }).join("") + '</div>';
  if (L.kind === "similar") return '<div class="learn">' + R.FINALS.map(f => { const x = R.LETTERS[f]; return '<button type="button" class="lt" data-l="' + f + '">' + rd(x.fin + " ← " + f, "lt-l sm") + cv(f) + emo(x.e) + '<small>' + x.w + '</small></button>'; }).join("") + '</div>' +
    '<div class="pairs">' + R.DOTS.map(d => '<p>' + rd(d.sa) + ' · ' + rd(d.sb) + '</p>').join("") + '<p>' + R.SIMILAR.filter(p => p[0].length === 1).map(p => rd(p[0] + " / " + p[1])).join(" · ") + '</p></div>';
  if (L.kind === "niqqud") { const v = newest(L), V = R.VOWELS[v];
    return '<div class="vowel"><span class="sign">' + rd(V.sign, "huge") + '</span><b>' + V.name + '</b></div><div class="learn">' + R.SYL.filter(s => s.v === v).map(s => '<button type="button" class="lt" data-s="' + esc(s.t) + '">' + rd(s.t, "lt-l") + emo(s.e) + '<small>' + s.w + '</small></button>').join("") + '</div>'; }
  if (L.kind === "words") return '<div class="learn">' + wordNew(L).map(w => '<button type="button" class="lt w" data-w="' + esc(w.t) + '">' + emo(w.e) + rd(w.t) + '</button>').join("") + '</div>';
  if (L.kind === "sent") return '<div class="learn sl">' + pick(R.SENT, 6).map(s => '<p>' + emo(s.e) + rd(s.t) + '</p>').join("") + '</div>';
  if (L.kind === "story") return '<div class="learn sl">' + R.STORIES.map(s => '<p>' + emo(s.ic) + rd(s.title) + (S.story[s.id] ? " ✔️" : "") + '</p>').join("") + '</div>';
  if (L.kind === "plain") return '<div class="learn sl">' + pick(R.WORDS.filter(w => w.p), 6).map(w => '<p>' + emo(w.e) + rd(w.t) + ' ← ' + rd(w.p) + '</p>').join("") + '</div>';
  return '<div class="learn sl"><p>' + rd("ת / ט") + ' · ' + rd("כּ / ק") + ' · ' + rd("א / ע") + ' · ' + rd("ח / כ") + ' · ' + rd("ס / שׂ") + ' · ' + rd("ו / ב") + '</p><p class="note">אותיות שנשמעות אותו דבר – צריך לזכור איך כותבים כל מילה.</p></div>';
}

function level(n){
  const L = LV(n); if (!L) return go("./", false);
  if (!isOpen(n)) return lockedLevel(L);
  document.body.classList.remove("in-game");
  if (S.cur !== n) { S.cur = n; save(); }
  const w = W(n), st = S.stars[n] || 0, ready = st >= GOAL || passed(n);
  const ch = passed(n) ? '<a class="chal done" data-go href="?lvl=' + n + '&g=test"><span>' + R.STICKERS[n - 1] + '</span><b>עֲבַרְתֶּם אֶת הָאֶתְגָּר!</b><small>אֶפְשָׁר לְנַסּוֹת שׁוּב בִּשְׁבִיל הַכֵּיף</small></a>'
    : ready ? '<a class="chal on" data-go href="?lvl=' + n + '&g=test"><span>🏁</span><b>אֶתְגַּר הַשָּׁלָב פָּתוּחַ!</b><small>10 שְׁאֵלוֹת · עוֹבְרִים בְּ-8 · וּמְקַבְּלִים מַדְבֵּקָה</small></a>'
    : '<div class="chal off"><span>🔒</span><b>אֶתְגַּר הַשָּׁלָב</b><small>עוֹד ' + (GOAL - st) + ' ' + (GOAL - st === 1 ? "נִצָּחוֹן" : "נִצְחוֹנוֹת") + ' בַּמִּשְׂחָקִים – וְהָאֶתְגָּר נִפְתָּח</small></div>';
  const nav = '<div class="lvnav">' + (n > 1 ? '<a data-go href="?lvl=' + (n - 1) + '">→ שָׁלָב ' + (n - 1) + '</a>' : "<span></span>") + (n < NMAX ? (isOpen(n + 1) ? '<a data-go href="?lvl=' + (n + 1) + '">שָׁלָב ' + (n + 1) + ' ←</a>' : '<span class="muted">🔒 שָׁלָב ' + (n + 1) + '</span>') : "<span></span>") + '</div>';
  app.innerHTML = backTop() + '<section class="lvhead" style="--wc:' + w.c + ';--wb:' + w.b + '"><small>' + w.ic + ' ' + w.t + ' · שָׁלָב ' + n + ' מִתּוֹךְ ' + NMAX + '</small><h1>' + L.t + '</h1>' +
    '<div class="stars" aria-label="' + st + ' כוכבים">' + Array.from({length: GOAL}, (_, k) => '<i class="' + (k < st || passed(n) ? "on" : "") + '">⭐</i>').join("") + '</div>' + learnBoard(L) + '</section>' +
    '<h2 class="r-h2">🎮 מִשְׂחָקִים</h2><div class="games">' + L.games.map(g => { const c = S.gw[n + ":" + g] || 0;
      return '<a class="gcard" data-go href="?lvl=' + n + '&g=' + g + '"><span class="ic">' + GAMES[g].ic + '</span><b>' + gName(g, L) + '</b><small>' + gDesc(g, L) + '</small>' + (c ? '<em>⭐ ' + c + '</em>' : "") + '</a>'; }).join("") + '</div>' +
    ch + nav + adultBox(L);
  app.querySelectorAll(".lt").forEach(b => b.onclick = () => zoom(b));
  bindAdult(L);
}
function zoom(b){
  let h = "";
  if (b.dataset.l) { const l = b.dataset.l, x = R.LETTERS[l]; h = '<div class="zoomL">' + rd(l, "giant") + '<span class="cvq">' + cv(l) + '</span></div><p class="zn">' + x.n + '</p><div class="big">' + x.e + '</div><p class="zw">' + rd(x.w) + '</p>'; }
  else if (b.dataset.s) { const s = R.SYL.find(z => z.t === b.dataset.s); h = rd(s.t, "giant") + '<div class="big">' + s.e + '</div><p class="zw">' + rd(s.w) + '</p>'; }
  else if (b.dataset.w) { const w = R.WORDS.find(z => z.t === b.dataset.w); h = '<div class="big">' + w.e + '</div><p class="zw">' + rd(w.t, "big") + '</p>'; }
  modal(h + '<div class="row"><button type="button" class="btn" data-a="x">סְגִירָה</button></div>');
}

/* ---------- אזור המבוגר בתוך שלב ---------- */
const TIP = {
  letters: "שבו ליד הילד ואמרו יחד את שם האות ואת המילה שבתמונה (כאן אין הקראה בקול – אתם הקול). שאלו: \"מה עוד מתחיל ב...?\". 10 דקות ביום עדיפות על שעה פעם בשבוע.",
  similar: "הראו בגוף: ד עם \"פינה\", ר עגולה. האות הסופית באה רק בסוף מילה. דגש = נקודה בבטן של האות שמשנה את הצליל (בּ/ב).",
  niqqud: "העיקר הוא הצליל, לא השם של סימן הניקוד. אמרו את האות ואז את הצליל: \"בּ ו-אָ – בָּ\". אחרי כל משחק בקשו מהילד לקרוא 3 הברות בקול.",
  words: "קוראים הברה-הברה (\"כֶּ-לֶב\") ואז מחברים מהר. \"בונים מילה\" מתרגל כתיב – הילד בונה את המילה מההברות לפי הסדר.",
  sent: "בקשו מהילד לקרוא את המשפט בקול לפני שהוא בוחר תמונה. אם נתקע במילה – שתי ההברות הראשונות, ואז הוא ממשיך.",
  story: "אחרי הקריאה שאלו: מה קרה בהתחלה? ובסוף? מה היית עושה אתה/את? אפשר גם לקרוא כל אחד שורה.",
  plain: "מעבר לקריאה בלי ניקוד הוא הדרגתי. מותר להציץ במילה המנוקדת (משחק הזיכרון). כתיב מלא: מיטה, עיפרון, כיסא.",
  spell: "אותיות שנשמעות אותו דבר (ת/ט, כ/ק, א/ע) פשוט זוכרים. כתבו יחד את המילים הקשות על פתקים ותלו על המקרר."
};
const SHEET = {trace:"✍️ כתיבה בדפוס", find:"🔍 מקיפים את האות", match:"🔗 אות ותמונה", color:"🎨 צובעים לפי קוד", cursive:"🖋️ כתב יד", cert:"🏅 תעודה",
  finals:"🔚 אותיות סופיות", diff:"🔍 מה שונה", smatch:"🔗 הברה ותמונה", circle:"⭕ מקיפים לפי ניקוד", first:"🎵 באיזו הברה מתחילה?",
  wmatch:"🔗 מילה ותמונה", build:"🧱 כותבים מילה", missing:"❓ מה חסר", smatch2:"🔗 משפט ותמונה", tf:"✔️ נכון או לא", order:"🚂 מסדרים משפט",
  draw:"🖍️ קוראים ומציירים", story:"📚 סיפור ושאלות", pmatch:"🔗 מילים בלי ניקוד", ptf:"✔️ משפטים בלי ניקוד", pstory:"📚 סיפור בלי ניקוד",
  spell:"✏️ כתיב נכון", pbuild:"🧱 כותבים בלי ניקוד"};
window.READ_SHEET_NAMES = SHEET;
const lvlLink = n => "https://games.booqli.ai/school/reading/?lvl=" + n;
function adultBox(L){
  const n = L.n;
  return '<details class="adultbox bq-teach"><summary>👩‍👧 לַמְּבוּגָּרִים: דַּפֵּי עֲבוֹדָה, טִיפִּים וְדִלּוּג</summary>' +
    '<p><b>מה לומדים בשלב:</b> ' + L.learn + ' <span class="muted">(בדרך כלל: ' + L.cls + ')</span></p>' +
    '<p><b>💡 טיפ:</b> ' + TIP[L.kind] + '</p>' +
    '<h3>🖨️ דפים להדפסה – בכל לחיצה דף חדש</h3><div class="sheets">' + L.sheets.map(s => '<a class="sh" target="_blank" rel="noopener" href="?sheet=' + s + '&lvl=' + n + '">' + SHEET[s] + '</a>').join("") +
    '<a class="sh book" target="_blank" rel="noopener" href="?sheet=book&lvl=' + n + '">📚 חוברת: 10 דפים מעורבבים</a></div>' +
    '<h3>📲 לשלוח את השלב</h3><div class="row start"><a class="btn wa" id="adWa" target="_blank" rel="noopener">💬 להורים בוואטסאפ (מורה / גננת)</a><button type="button" class="btn alt" id="adCopy">🔗 העתקת קישור לשלב</button></div>' +
    '<h3>⏭️ דילוג</h3><p>הילד כבר יודע את החומר? אפשר לפתוח את השלב הבא בלי האתגר. עדיף לנסות קודם את האתגר – הוא קצר, ומקבלים עליו מדבקה.</p>' +
    '<div class="row start">' + (n < NMAX ? '<button type="button" class="btn alt" id="adSkip">⏭️ לפתוח את שלב ' + (n + 1) + '</button>' : "") + '<a class="btn alt" href="#for-parents">📖 המדריך להורים ולמורות</a></div></details>';
}
function bindAdult(L){
  const msg = "שלום הורים 😊\nהשבוע מתרגלים קריאה – " + L.p + " (שלב " + L.n + " במסלול הקריאה של BOOQLI).\nבקישור יש משחקים קצרים, אתגר ומדבקות, ודפי עבודה להדפסה. 10 דקות ביום מספיקות!\n" + lvlLink(L.n) + "&utm_source=whatsapp&utm_medium=gan_parents&utm_campaign=school-reading\n\nכל התכנים בחינם, בחסות BOOQLI 💛";
  const wa = $("adWa"); if (wa) { wa.href = "https://wa.me/?text=" + encodeURIComponent(msg); wa.onclick = () => siteEvent("read-share", "lvl" + L.n); }
  const cp = $("adCopy"); if (cp) cp.onclick = () => { try { navigator.clipboard.writeText(lvlLink(L.n)); cp.textContent = "✔️ הועתק"; } catch (e) { prompt("הקישור:", lvlLink(L.n)); } };
  const sk = $("adSkip"); if (sk) sk.onclick = () => adult("פותחים את שלב " + (L.n + 1) + " בלי האתגר.", () => { if (!S.done[L.n]) S.done[L.n] = "s"; openUpTo(L.n + 1, "s"); siteEvent("read-skip", "lvl" + L.n); go("?lvl=" + (L.n + 1)); });
}

/* ---------- משחק ---------- */
function game(n, g){
  const L = LV(n); if (!L || !isOpen(n)) return level(n);
  if (g === "test") return test(L);
  if (!GAMES[g] || !L.games.includes(g)) return level(n);
  document.body.classList.add("in-game");
  app.innerHTML = backTop("?lvl=" + n, "← לְשָׁלָב " + n) + '<section class="gview"><h1><span aria-hidden="true">' + GAMES[g].ic + '</span> ' + gName(g, L) + '</h1><div class="stage" id="stage" aria-live="polite"></div></section>';
  siteEvent("read-game", n + "-" + g);
  GAMES[g].run($("stage"), L, () => winGame(L, g));
}
function winGame(L, g){
  const n = L.n; S.stars[n] = (S.stars[n] || 0) + 1; S.wins++; S.gw[n + ":" + g] = (S.gw[n + ":" + g] || 0) + 1; save();
  siteEvent("read-win", n + "-" + g); SND.win(); confetti();
  const st = S.stars[n], ready = st >= GOAL && !passed(n);
  const line = passed(n) ? "אֶת הַשָּׁלָב הַזֶּה כְּבָר עֲבַרְתֶּם ✔️" : ready ? "🏁 אֶתְגַּר הַשָּׁלָב פָּתוּחַ! מוּכָנִים?" : "עוֹד " + (GOAL - st) + " " + (GOAL - st === 1 ? "נִצָּחוֹן" : "נִצְחוֹנוֹת") + " וְהָאֶתְגָּר נִפְתָּח";
  modal('<div class="big" aria-hidden="true">⭐</div><h2>כָּל הַכָּבוֹד' + (S.name ? ", " + esc(S.name) : "") + '!</h2><p>עוֹד כּוֹכָב! סַךְ הַכֹּל ⭐ ' + S.wins + '</p><p class="hl">' + line + '</p>' +
    '<div class="row">' + (ready ? '<button type="button" class="btn" data-a="test">🏁 לָאֶתְגָּר</button>' : "") + '<button type="button" class="btn ' + (ready ? "alt" : "") + '" data-a="again">🔁 עוֹד פַּעַם</button><button type="button" class="btn alt" data-a="back">🎮 מִשְׂחָק אַחֵר</button></div>' +
    '<a class="bookad bq-teach" target="_blank" rel="noopener" href="' + (typeof siteOrderLink === "function" ? siteOrderLink("school-reading", "win") : "https://games.booqli.ai/savta/") + '">📖 ספר אמיתי שהילד הוא הגיבור שלו – מ-BOOQLI ←</a>',
    {test: () => go("?lvl=" + n + "&g=test"), again: () => game(n, g), back: () => go("?lvl=" + n)});
}
function test(L){
  const n = L.n; document.body.classList.add("in-game");
  app.innerHTML = backTop("?lvl=" + n, "← לְשָׁלָב " + n) + '<section class="gview test"><h1>🏁 אֶתְגַּר שָׁלָב ' + n + '</h1><div class="stage" id="stage" aria-live="polite"></div></section>';
  const st = $("stage");
  st.innerHTML = '<div class="intro"><div class="big" aria-hidden="true">🏁</div><p class="lab-q">10 שְׁאֵלוֹת. 8 נְכוֹנוֹת – וְעוֹבְרִים לַשָּׁלָב הַבָּא!</p><p>בְּלִי לְמַהֵר. חוֹשְׁבִים וּבוֹחֲרִים.</p><div class="row"><button type="button" class="btn" id="tGo">מַתְחִילִים ▶️</button></div></div>';
  $("tGo").onclick = () => { ac(); siteEvent("read-test", "lvl" + n);
    const list = TEST[L.kind](L);
    quiz(st, {rounds: 10, test: true, make: i => { const r = list[i](); if (r.lab == null) r.lab = testLab[L.kind](i, L); return r; }, done: score => result(L, score)}); };
}
function result(L, score){
  const n = L.n;
  if (score >= PASS) {
    const first = !passed(n); S.done[n] = 1; if (n < NMAX) S.max = Math.max(S.max, n + 1); S.cur = Math.min(n + 1, NMAX); save();
    siteEvent("read-pass", "lvl" + n); SND.big(); confetti(); setTimeout(confetti, 900);
    const last = n === NMAX;
    modal('<div class="sticker" aria-hidden="true">' + R.STICKERS[n - 1] + '</div><h2>' + G("עָבַרְתָּ", "עָבַרְתְּ", "עֲבַרְתֶּם") + ' אֶת שָׁלָב ' + n + '!</h2><p>' + score + ' מִתּוֹךְ 10 · ' + (first ? "מַדְבֵּקָה חֲדָשָׁה בָּאֹסֶף 🏅" : "שׁוּב הִצְלַחְתֶּם 💪") + '</p>' +
      (last ? '<p class="hl">🏆 סִיַּמְתֶּם אֶת כָּל מַסְלוּל הַקְּרִיאָה! קוֹרְאִים אֲלוּפִים!</p>' : '<p class="hl">נִפְתַּח שָׁלָב ' + (n + 1) + ': ' + LV(n + 1).t + '</p>') +
      '<div class="row">' + (last ? "" : '<button type="button" class="btn" data-a="next">▶️ לַשָּׁלָב הַבָּא</button>') + '<a class="btn alt" target="_blank" rel="noopener" href="?sheet=cert&lvl=' + n + '">🏅 תְּעוּדָה לְהַדְפָּסָה</a><button type="button" class="btn alt" data-a="map">🗺️ לַמַּפָּה</button></div>',
      {next: () => go("?lvl=" + (n + 1)), map: () => go("./")});
  } else {
    siteEvent("read-fail", "lvl" + n + "-" + score);
    modal('<div class="big" aria-hidden="true">💪</div><h2>כִּמְעַט!</h2><p>' + score + ' מִתּוֹךְ 10. צָרִיךְ 8 כְּדֵי לַעֲבֹר.</p><p class="hl">עוֹד קְצָת אִמּוּן בַּמִּשְׂחָקִים – וְנַנַּסֶּה שׁוּב!</p>' +
      '<div class="row"><button type="button" class="btn" data-a="lv">🎮 לְהִתְאַמֵּן</button><button type="button" class="btn alt" data-a="again">🔁 שׁוּב לָאֶתְגָּר</button></div>',
      {lv: () => go("?lvl=" + n), again: () => test(L)});
  }
}

/* ---------- בודקים מאיפה מתחילים ---------- */
function place(){
  document.body.classList.add("in-game");
  app.innerHTML = backTop() + '<section class="gview"><h1>🧭 בּוֹדְקִים מֵאֵיפֹה מַתְחִילִים</h1><div class="stage" id="stage" aria-live="polite"></div></section>';
  const st = $("stage");
  st.innerHTML = '<div class="intro"><img src="../../img/family/alef.webp" alt="" width="96" height="99"><p class="lab-q">שׁוֹאֲלִים כַּמָּה שְׁאֵלוֹת קְצָרוֹת. אֵין פֹּה טָעֻיּוֹת – רַק בּוֹדְקִים מָה כְּבָר יוֹדְעִים 🙂</p>' +
    '<p class="note bq-teach">למבוגר: שבו ליד הילד ואל תעזרו בתשובות. כשהשאלות נהיות קשות מדי – הבדיקה נעצרת לבד, וזה בדיוק המקום להתחיל בו.</p><div class="row"><button type="button" class="btn" id="pGo">מַתְחִילִים ▶️</button></div></div>';
  $("pGo").onclick = () => { ac(); siteEvent("read-place", "start");
    let k = 0, total = PLACE.reduce((a, s) => a + s.n, 0), asked = 0;
    const stage = () => {
      if (k >= PLACE.length) return placed(NMAX);
      const sp = PLACE[k]; let right = 0;
      quiz(st, {rounds: sp.n, test: true, make: () => { asked++; const r = sp.make(); r.lab = sp.lab || r.lab || ""; return r; }, onAnswer: ok => { if (ok) right++; },
        done: () => { if (right >= sp.need) { k++; stage(); } else placed(sp.to); }});
    };
    stage();
  };
}
function placed(n){
  siteEvent("read-place", "lvl" + n);
  for (let k = 1; k < n; k++) if (!S.done[k]) S.done[k] = "p";
  S.max = Math.max(S.max, n); S.cur = n; save(); SND.win(); confetti();
  const L = LV(n);
  modal('<img src="../../img/family/alef.webp" alt="" width="90" height="93"><h2>מָצָאנוּ! 🎉</h2><p>מַתְחִילִים בְּשָׁלָב ' + n + ':</p><p class="hl">' + L.t + '</p>' +
    '<p class="note">' + L.learn + '</p><div class="row"><button type="button" class="btn" data-a="go">▶️ יוֹצְאִים לַדֶּרֶךְ</button></div>', {go: () => go("?lvl=" + n)});
}
function choose(){
  document.body.classList.remove("in-game");
  app.innerHTML = backTop() + '<section class="gview"><h1>🎯 בוחרים שלב (למבוגר)</h1><p>מה הילד כבר יודע? בחרו את השלב הראשון שעוד קשה לו. השלבים שלפניו יסומנו כ"דילגנו", ואפשר תמיד לחזור אליהם.</p>' +
    R.WORLDS.map(w => '<h2 class="r-h2" style="color:' + w.c + '">' + w.ic + ' ' + w.p + '</h2><div class="chlist">' + R.LEVELS.filter(l => l.w === w.n).map(l =>
      '<button type="button" class="chi" data-n="' + l.n + '"><b>' + l.n + '. ' + l.p + '</b><small>' + l.learn + '</small><em>' + l.cls + '</em></button>').join("") + '</div>').join("") + '</section>';
  app.querySelectorAll(".chi").forEach(b => b.onclick = () => { const n = +b.dataset.n; adult("מתחילים משלב " + n + ".", () => { openUpTo(n, "s"); siteEvent("read-choose", "lvl" + n); go("?lvl=" + n); }); });
}

function route(){
  const p = P();
  if (p.get("sheet")) return;
  try { speechSynthesis.cancel(); } catch (e) {}
  document.querySelectorAll(".rmod").forEach(m => m.remove());
  const n = +p.get("lvl") || 0, g = p.get("g");
  if (p.get("place")) return place();
  if (p.get("choose")) return choose();
  if (n && g) return game(n, g);
  if (n) return level(n);
  hub();
}

window.READ_APP = {S: () => S, LV, lettersUpTo, sylPool, wordPool, wordNew, compose, baseOf, phon, skey, pw, one, pick, shuffle, rnd, uniqBy, esc, GAMES};
if (P().get("sheet") && window.READ_SHEETS) READ_SHEETS.render(P().get("sheet"), LV(+P().get("lvl") || 1));
else route();
})();
