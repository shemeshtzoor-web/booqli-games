/* מאמן ההכתבה באנגלית (school/english/) – 6.11.2026
   כמו מאמן ההכתבה בעברית (school/dictation/), אבל המילים באנגלית וההוראות בעברית.
   ההורה או המורה מקלידים את מילות השבוע (אפשר עם פירוש: "cat - חתול"), או מקבלים אותן בקישור ?w=...
   לכל מילה: פירוש בעברית + אימוג'י – לבד מהמילון (words.js), או מה שההורה כתב.
   הכל נשמר רק בדפדפן: booqli_english (מילים, כיתה, כוכבים) + IndexedDB booqli_english (הקלטות ההורה).
   קול: הקלטה של ההורה ← קול ממוחשב באנגלית ← "מבוגר מקריא". */
(function(){
"use strict";
const $ = id => document.getElementById(id);
const app = $("dApp");
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ev = (k, n) => { try { siteEvent(k, String(n)); } catch (e) {} };
const DICT = window.ENG_DICT || {};

/* ---------- אנגלית ---------- */
const low = w => String(w).toLowerCase();
const plain = w => low(w).replace(/[^a-z' -]/g, "").replace(/\s+/g, " ").trim();
const tight = w => plain(w).replace(/[ '-]/g, "");
const isL = c => /[A-Za-z]/.test(c);
const KEEP_CAP = /^(i|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|english)$/;
/* טלפונים מוסיפים אות גדולה בהתחלה ("Cat") – מחזירים לאותיות קטנות, חוץ מ-I, ימים, חודשים ושמות */
function normWord(w){
  w = String(w).replace(/[‘’`´]/g, "'").replace(/[^A-Za-z' -]/g, "").replace(/\s+/g, " ").trim();
  if (w.length > 1 && /^[A-Z][a-z' -]+$/.test(w) && DICT[low(w)] && !KEEP_CAP.test(low(w))) w = low(w);
  if (low(w) === "i") w = "I";
  return w.slice(0, 24);
}
const EMOJI = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:[‍️⃣]|\p{Emoji_Modifier}|\p{Extended_Pictographic}|\p{Regional_Indicator})*/u;
const EMOJI_G = new RegExp(EMOJI.source, "gu");
/* "cat - חתול 🐱" → {w:"cat", he:"חתול", e:"🐱"} */
function parseLine(x){
  x = String(x).replace(/^\s*\d+\s*[.)\-:]\s*/, "").trim();
  const m = x.match(/^[A-Za-z‘’'`´][A-Za-z‘’'`´ ]*(?:-[A-Za-z]+)*/);
  if (!m) return null;
  const w = normWord(m[0]); if (!tight(w)) return null;
  let rest = x.slice(m[0].length);
  const em = (rest.match(EMOJI) || [""])[0];
  const he = rest.replace(EMOJI_G, "").replace(/[A-Za-z]/g, "").replace(/^[\s\-–—=:|~]+/, "").replace(/[,،;~|]/g, "/").replace(/\s+/g, " ").trim().slice(0, 30);
  const d = DICT[plain(w)] || {};
  return {w, he: he || d.he || "", e: em || d.e || ""};
}
function parseWords(t){
  const seen = new Set(), out = [];
  String(t).split(/[\n,;|]+/).forEach(x => { const o = parseLine(x); if (o && !seen.has(plain(o.w))) { seen.add(plain(o.w)); out.push(o); } });
  return out.slice(0, MAXW);
}
const lineOf = o => o.w + (o.he ? " - " + o.he : "") + (o.e ? " " + o.e : "");

/* ---------- ההתקדמות ---------- */
const KEY = "booqli_english", MAXW = 30;
const EXAMPLE = ["cat", "dog", "apple", "red", "book", "happy", "school", "family"].map(w => ({w, he: (DICT[w] || {}).he || "", e: (DICT[w] || {}).e || ""}));
const blank = () => ({v:1, cls:"", words:EXAMPLE.slice(), example:true, m:{}, stars:0});
let S = (() => { try { const o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o && o.v === 1 && Array.isArray(o.words)) { const x = Object.assign(blank(), o); if (x.example) x.words = EXAMPLE.slice(); x.words = x.words.filter(o => o && o.w); return x; } } catch (e) {} return blank(); })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const clsName = c => { c = String(c || "").replace(/[<>"]/g, "").trim().slice(0, 24); return !c ? "" : /^כית/.test(c) ? c : "כיתה " + c; };
const W = o => o.w;
const meanHTML = (o, cls) => (o.he || o.e) ? '<span class="mean' + (cls ? " " + cls : "") + '">' + (o.e ? '<span class="emo">' + esc(o.e) + '</span> ' : '') + esc(o.he) + '</span>' : "";
const en = s => '<span class="en" dir="ltr" lang="en">' + esc(s) + '</span>';

/* ---------- טעויות כתיב נפוצות באנגלית (בשביל "מי כתובה נכון?" ואותיות מבלבלות) ---------- */
const CONF = {b:["d","p"],d:["b"],p:["q","b"],q:["p"],m:["n"],n:["m"],c:["k","s"],k:["c"],s:["c","z"],z:["s"],e:["a","i"],a:["e","u"],i:["e","y"],o:["u","a"],u:["o","a"],
  v:["f","w"],f:["v"],w:["v"],g:["j"],j:["g"],y:["i"],t:["d"],h:["n"],l:["i"],r:["w"]};
const TEAMS = [["ee","ea"],["ea","ee"],["oo","u"],["ai","ay"],["ay","ai"],["ou","ow"],["ow","ou"],["ck","k"],["ph","f"],["wh","w"],["sh","ch"],["ch","sh"],["th","f"],["ir","er"],["er","ir"],["ur","er"],["ie","ei"],["igh","i"],["ight","ite"],["ey","y"],["y","ie"],["qu","kw"],["x","ks"],["c","k"],["k","c"]];
const capLike = (src, w) => /^[A-Z]/.test(src) ? w.charAt(0).toUpperCase() + w.slice(1) : w;
function wrongVariants(word){
  const base = low(word), right = tight(word), out = new Set();
  const add = v => { if (v && tight(v) !== right && /[a-z]/.test(v)) out.add(capLike(word, v)); };
  TEAMS.forEach(([a, b]) => { const i = base.indexOf(a, 1); if (i > 0) add(base.slice(0, i) + b + base.slice(i + a.length)); });
  const dbl = base.match(/([a-z])\1/); if (dbl) add(base.replace(dbl[0], dbl[1]));
  else { const i = [...base].findIndex((c, k) => k > 0 && k < base.length - 1 && /[bdfglmnprst]/.test(c)); if (i > 0) add(base.slice(0, i + 1) + base[i] + base.slice(i + 1)); }
  if (/[^aeiou]e$/.test(base) && base.length > 3) add(base.slice(0, -1));
  else if (/[^aeiouy]$/.test(base) && base.length > 2 && base.length < 6) add(base + "e");
  [...base].forEach((c, i) => { (CONF[c] || []).forEach(a => { if (i === 0 && base.length > 3) return; add(base.slice(0, i) + a + base.slice(i + 1)); }); });
  if (base.length > 3) { const i = 1 + rnd(base.length - 2); if (base[i] !== base[i + 1] && base[i + 1] && base[i + 1] !== " ") add(base.slice(0, i) + base[i + 1] + base[i] + base.slice(i + 2)); }
  const vow = [...base].findIndex((c, i) => i > 0 && /[aeiou]/.test(c)); if (vow > 0 && base.length > 3) add(base.slice(0, vow) + base.slice(vow + 1));
  /* מעדיפים טעויות "מעניינות" (צירופים, כפולות, e) על פני החלפת אות סתמית */
  const list = [...out];
  const pref = list.filter(v => { const t = low(v); return TEAMS.some(([a, b]) => base.includes(a) && t.includes(b)) || /([a-z])\1/.test(t) !== /([a-z])\1/.test(base) || t.endsWith("e") !== base.endsWith("e"); });
  const pick = shuffle(pref).slice(0, 1); shuffle(list).forEach(v => { if (pick.length < 2 && !pick.includes(v)) pick.push(v); });
  return pick;
}
const decoysFor = need => { const d = []; need.forEach(c => (CONF[low(c)] || []).forEach(a => { if (a.length === 1) { a = /[A-Z]/.test(c) ? a.toUpperCase() : a; if (!need.includes(a) && !d.includes(a)) d.push(a); } })); return d; };

/* ---------- צלילים וחגיגה ---------- */
let AC = null;
const ac = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) {} return AC; };
const tone = (f, dur = .3, type = "triangle", vol = .2, at = 0) => { const c = ac(); if (!c) return; const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05); };
const SND = {
  pop: () => tone(520 + rnd(300), .12, "sine", .22),
  soft: () => tone(300, .18, "sine", .1),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, "triangle", .2, i * .13))
};
const confetti = () => { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("div"); c.className = "conf"; const cols = ["#FA57C4","#FFC93C","#46C46E","#3AA7F0","#9B5DE5"];
  for (let i = 0; i < 46; i++) { const p = document.createElement("i"); p.style.left = rnd(100) + "%"; p.style.background = cols[i % 5]; p.style.animationDelay = (rnd(70) / 100) + "s"; c.appendChild(p); }
  document.body.appendChild(c); setTimeout(() => c.remove(), 2800); };
const shake = b => { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); };
const PRAISE = () => shuffle(["כל הכבוד!", "Great job!", "מדהים!", "Well done!", "אלופים!", "Super!", "בול!", "Excellent!"])[0];
const modal = (html, on) => {
  const m = document.createElement("div"); m.className = "rmod"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
  m.innerHTML = '<div class="in">' + html + '</div>'; document.body.appendChild(m);
  m.addEventListener("click", e => { const a = e.target.closest("[data-a]"); if (e.target === m) { m.remove(); return; } if (!a) return; const k = a.dataset.a; if (k === "x") { m.remove(); return; } if (on && on[k]) { if (on[k](m, a) !== false) m.remove(); } });
  try { (m.querySelector("input") || m.querySelector("button")).focus(); } catch (e) {}
  return m;
};
const adult = (why, ok) => {
  const a = 3 + rnd(7), b = 4 + rnd(6);
  const m = modal('<div class="emo" style="font-size:56px" aria-hidden="true">👩‍👧</div><h2>רגע, זה למבוגר</h2><p>' + why + '</p><label class="lab" for="adQ">כמה זה ' + a + ' × ' + b + '?</label><br>' +
    '<input id="adQ" inputmode="numeric" autocomplete="off"><div class="msg" aria-live="polite"></div>' +
    '<div class="row"><button type="button" class="btn" data-a="go">אישור</button><button type="button" class="btn alt" data-a="x">ביטול</button></div>',
    {go: mm => { if (+mm.querySelector("input").value === a * b) { ok(); return true; } mm.querySelector(".msg").textContent = "לא בדיוק – נסו שוב"; return false; }});
  m.querySelector("input").addEventListener("keydown", e => { if (e.key === "Enter") m.querySelector("[data-a=go]").click(); });
};

/* ---------- ההקלטות של ההורה (IndexedDB, רק במכשיר) ---------- */
const DB = (() => {
  let p = null;
  const open = () => p || (p = new Promise((res, rej) => { try { const r = indexedDB.open("booqli_english", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("rec"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
  const tx = (mode, fn) => open().then(db => new Promise((res, rej) => { const t = db.transaction("rec", mode), st = t.objectStore("rec"); const r = fn(st); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); }));
  return {get: k => tx("readonly", st => st.get(k)), put: (k, v) => tx("readwrite", st => st.put(v, k)), del: k => tx("readwrite", st => st.delete(k)),
    keys: () => tx("readonly", st => st.getAllKeys())};
})();
const REC = new Map(); /* מילה (אותיות קטנות) → כתובת לניגון */
function loadRecs(){
  return DB.keys().then(keys => Promise.all((keys || []).map(k => DB.get(k).then(b => { if (b) { if (REC.has(k)) URL.revokeObjectURL(REC.get(k)); REC.set(k, URL.createObjectURL(b)); } })))).catch(() => {});
}
const canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder && window.indexedDB);

/* ---------- קול באנגלית ---------- */
let enVoice = null, voiceKnown = false;
const hasTTS = "speechSynthesis" in window;
function loadVoices(){ if (!hasTTS) return; try { const vs = speechSynthesis.getVoices(); if (vs.length) { voiceKnown = true;
  const ens = vs.filter(v => /^en/i.test(v.lang));
  enVoice = ens.find(v => /en[-_]US/i.test(v.lang) && v.localService) || ens.find(v => /en[-_](US|GB)/i.test(v.lang)) || ens[0] || null; } } catch (e) {} }
if (hasTTS) { loadVoices(); try { speechSynthesis.addEventListener("voiceschanged", loadVoices); } catch (e) {} }
const ttsOK = () => hasTTS && (!voiceKnown || !!enVoice);
const hasSound = w => REC.has(plain(w)) || ttsOK();
let player = null;
function say(text, rate){ try { const u = new SpeechSynthesisUtterance(text); u.lang = enVoice ? enVoice.lang : "en-US"; if (enVoice) u.voice = enVoice; u.rate = rate || .8; speechSynthesis.speak(u); return true; } catch (e) { return false; } }
function speak(w){
  ac();
  const url = REC.get(plain(w));
  stopSound();
  if (url) { player = new Audio(url); player.play().catch(() => {}); return true; }
  if (!ttsOK()) return false;
  return say(w);
}
/* איות: c… a… t */
function spell(w){ stopSound(); if (!ttsOK()) return false; [...w].filter(isL).forEach(c => say(low(c) === "a" ? "ay" : c.toUpperCase(), .7)); return true; }
const stopSound = () => { try { if (hasTTS) speechSynthesis.cancel(); } catch (e) {} if (player) { try { player.pause(); } catch (e) {} } };

/* ---------- רמה של כל מילה ---------- */
const getM = w => S.m[plain(w)] || {b:0, p:0, w:0};
const setBest = (w, k, n) => { const m = Object.assign({b:0, p:0, w:0}, getM(w)); m[k] = Math.max(m[k] || 0, n); S.m[plain(w)] = m; };
const total = w => { const m = getM(w); return (m.b || 0) + (m.p || 0) + (m.w || 0); };
const stage = w => { const t = total(w); return t >= 7 ? "🌸" : t >= 4 ? "🌿" : t >= 1 ? "🌱" : "⚪"; };
const pickRound = n => shuffle(S.words).sort((a, b) => total(a.w) - total(b.w)).slice(0, n).sort(() => Math.random() - .5);

/* ---------- ניתוב ---------- */
const here = () => (window.siteVirtual || (location.pathname + location.search));
const P = () => new URLSearchParams((here().split("#")[0].split("?")[1]) || "");
const base = () => here().split("?")[0];
const go = (qs, push = true) => {
  const u = base() + (qs || "");
  if (typeof siteSetUrl === "function") siteSetUrl(u, push); else try { history[push ? "pushState" : "replaceState"](null, "", u); } catch (e) {}
  route(); window.scrollTo({top: Math.max(0, app.offsetTop - 70), behavior: "smooth"});
};
window.addEventListener("popstate", () => route());
const GAMES = {
  build: {ic:"🧩", t:"בונים מילה", s:"שומעים ומסדרים את האותיות באנגלית", c:"g1"},
  pick:  {ic:"🔍", t:"מי כתובה נכון?", s:"מוצאים את הכתיב הנכון", c:"g2"},
  balloon: {ic:"🎈", t:"מפוצצים בלונים", s:"מפוצצים את האותיות לפי הסדר", c:"g5"},
  write: {ic:"👀", t:"מסתכלים, מסתירים, כותבים", s:"זוכרים את המילה וכותבים מהזיכרון", c:"g3"},
  test:  {ic:"📝", t:"הכתבה אמיתית", s:"כמו בכיתה: שומעים, כותבים באנגלית, ובסוף מקבלים ציון", c:"g4 wide"}
};
let incoming = null, incomingCls = "", justLoaded = 0;
let G1 = null;

function route(){
  try { route0(); }
  catch (e) {
    try { ev("eng-error", String(e && e.message || e).slice(0, 60) + " | " + navigator.userAgent.replace(/[^\w.]+/g, "_").slice(0, 80)); } catch (x) {}
    app.hidden = false;
    app.innerHTML = '<section class="card" style="text-align:center"><div class="emo" style="font-size:56px">🛠️</div><h2 style="color:#C5309A">משהו לא נטען כמו שצריך</h2><p>נסו לרענן את העמוד. אם זה חוזר – ספרו לנו בוואטסאפ, ונתקן.</p><div class="row"><button type="button" class="btn" onclick="location.reload()">🔄 רענון</button></div></section>';
  }
}
function route0(){
  stopSound(); stopMic();
  const p = P();
  document.body.classList.remove("in-game", "sheet-mode");
  $("print").hidden = true; app.hidden = false;
  if (p.get("sheet")) return sheet();
  if (p.get("p")) return parents();
  const g = p.get("g");
  if (g && GAMES[g] && S.words.length) return start(g);
  home();
}

/* ================================ דף הבית ================================ */
function home(){
  G1 = null;
  const hi = S.cls ? "שלום ילדי " + esc(clsName(S.cls)) + "!" : "Hello! שלום ילדים!";
  let h = '<section class="card d-hero"><img src="../../img/family/alef.webp" alt="" width="104" height="107"><div>' +
    '<small>כיתה ג\' · אנגלית · אֲלֶפְבּוּקְלִי</small><h1>הכתבה באנגלית</h1>' +
    '<div class="bubble">' + hi + ' ' + (S.words.length ? "בואו נלמד לכתוב את מילות השבוע באנגלית ✏️" : "עוד אין מילים. מבוגר יכול להוסיף אותן באזור ההורים.") + '</div>' +
    '<div class="row start"><span class="starpill" title="כוכבים שנאספו">⭐ ' + S.stars + '</span></div></div></section>';
  if (incoming) h += '<section class="newlist" aria-live="polite"><h2>📬 קיבלתם את מילות ההכתבה באנגלית' + (incomingCls ? ' של ' + esc(clsName(incomingCls)) : '') + ' (' + incoming.length + ' מילים)</h2><div class="ws" dir="ltr">' + incoming.map(o => esc(o.w)).join(" · ") + '</div>' +
    '<div class="row start"><button type="button" class="btn purple" id="inYes">לשמור ולהתחיל</button><button type="button" class="btn alt sm" id="inNo">לא עכשיו</button></div>' +
    (S.example ? "" : '<p class="note">הרשימה החדשה תחליף את המילים שיש עכשיו. הכוכבים נשמרים.</p>') + '</section>';
  else if (justLoaded) h += '<div class="exnote okn">✔️ נטענו ' + justLoaded + ' מילות ההכתבה באנגלית' + (S.cls ? ' של ' + esc(clsName(S.cls)) : '') + '. אפשר להתחיל לשחק!</div>';
  else if (S.example) h += '<div class="exnote">✋ זו <b>רשימה לדוגמה</b>. הורים או המורה: מכניסים את המילים של השבוע ב"אזור ההורים והמורה" למטה.</div>';
  h += '<section class="card words"><h2>המילים של השבוע <small>' + S.words.length + ' מילים · 🌱 מתחילים · 🌿 משתפרים · 🌸 יודעים</small></h2>' +
    '<div class="garden">' + S.words.map((o, i) => '<button type="button" class="chip" data-i="' + i + '" aria-label="לשמוע: ' + esc(o.w) + '"><span class="lv">' + stage(o.w) + '</span>' + en(o.w) + meanHTML(o) + '</button>').join("") + '</div>' +
    '<p class="note" style="margin-top:8px">' + (hasSound(S.words[0] ? S.words[0].w : "") ? "לוחצים על מילה כדי לשמוע איך אומרים אותה באנגלית." : "") + '</p></section>';
  h += '<div class="games">' + Object.keys(GAMES).map(k => { const g = GAMES[k];
    return '<button type="button" class="game ' + g.c + '" data-g="' + k + '"' + (S.words.length ? "" : " disabled") + '><span class="emo">' + g.ic + '</span><b>' + g.t + '</b><small>' + g.s + '</small></button>'; }).join("") + '</div>';
  h += '<div class="adultrow bq-teach"><button type="button" class="btn purple" id="toP">👩‍🏫 אזור ההורים והמורה: המילים של השבוע</button><a class="btn alt" href="?sheet=1" id="toSheet">🖨️ דפי הכתבה להדפסה</a></div>';
  app.innerHTML = h;
  app.querySelectorAll(".chip").forEach(b => b.onclick = () => { const w = S.words[+b.dataset.i].w; if (!speak(w)) peek(w, 1600); });
  app.querySelectorAll("[data-g]").forEach(b => b.onclick = () => { ac(); go("?g=" + b.dataset.g); });
  $("toP").onclick = () => { if (typeof siteKidLock === "function" && siteKidLock()) adult("אזור ההורים והמורה: כאן משנים את המילים.", () => go("?p=1")); else go("?p=1"); };
  $("toSheet").onclick = e => { e.preventDefault(); go("?sheet=1"); };
  if (incoming) {
    $("inYes").onclick = () => { S.words = incoming; S.example = false; if (incomingCls) S.cls = incomingCls; save(); ev("eng-received", incoming.length); incoming = null; home(); };
    $("inNo").onclick = () => { incoming = null; home(); };
  }
}

/* ================================ אזור ההורים ================================ */
let micStream = null, recorder = null;
function stopMic(){ try { if (recorder && recorder.state !== "inactive") recorder.stop(); } catch (e) {} recorder = null; if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; } }
/* בקישור: מילה~פירוש~אימוג'י, מופרדות ב-| (פירוש/אימוג'י רק אם שונים מהמילון) */
const packList = ws => ws.map(o => { const d = DICT[plain(o.w)] || {}, he = o.he === (d.he || "") ? "" : o.he, e = o.e === (d.e || "") ? "" : o.e;
  return o.w + (he || e ? "~" + he + (e ? "~" + e : "") : ""); }).join("|");
const unpackList = s => parseWords(String(s).split("|").map(x => { const [w, he, e] = x.split("~"); return (w || "") + (he ? " - " + he : "") + (e ? " " + e : ""); }).join("\n"));
const listLink = ws => "https://games.booqli.ai/school/english/?w=" + encodeURIComponent(packList(ws)) + (S.cls ? "&c=" + encodeURIComponent(S.cls).replace(/'/g, "%27") : "");
function parents(){
  const ws = S.example ? [] : S.words;
  app.innerHTML = '<section class="card pz">' +
    '<div class="pbar2"><button type="button" class="x" id="pBack" aria-label="חזרה">→</button><h2>👩‍🏫 אזור ההורים והמורה</h2></div>' +
    '<div class="field"><label for="pCls">הכיתה</label><input type="text" id="pCls" maxlength="24" autocomplete="off" placeholder="למשל: ג\'2" value="' + esc(S.cls) + '"><span class="note">יופיע במשחק ("שלום ילדי כיתה ג\'2!") ובהודעה להורים. לא כותבים את שם הילד.</span></div>' +
    '<div class="field"><label for="pWords">מילות ההכתבה באנגלית של השבוע</label>' +
    '<textarea id="pWords" dir="ltr" lang="en" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="מילה אחת בכל שורה, למשל:&#10;cat&#10;yellow&#10;pencil - עיפרון">' + esc(ws.map(lineOf).join("\n")) + '</textarea>' +
    '<div class="tip">💡 <b>הפירוש בעברית והאימוג\'י נכנסים לבד</b> למילים מוכרות. רוצים פירוש אחר, או שהמילה לא מוכרת? כותבים אחרי מקף: <span dir="ltr">pencil - עיפרון ✏️</span>. אפשר גם להדביק רשימה מוואטסאפ, או ללחוץ על המיקרופון במקלדת (באנגלית) ולהקריא.</div></div>' +
    '<div class="row start"><button type="button" class="btn green" id="pSave">💾 שמירה</button></div><div class="status" id="pStatus" aria-live="polite"></div>' +
    '<div id="mBox" hidden><h3>🔎 בודקים את הפירושים</h3><div class="nqs"></div></div>' +
    '<h3>🎙️ מקליטים את המילים בקול שלכם (לא חובה)</h3>' +
    '<p class="note">' + (ttsOK() ? "הטלפון מקריא את המילים באנגלית בקול ממוחשב. רוצים שהילד ישמע אתכם, או שהמורה מבטאת אחרת? לוחצים 🎙️, אומרים את המילה, והיא נשמרת לבד אחרי 3 שניות." : "בטלפון הזה אין קול באנגלית. אפשר להקליט כל מילה: לוחצים 🎙️, אומרים את המילה, והיא נשמרת לבד אחרי 3 שניות. מילה בלי הקלטה – תוצג למבוגר כדי שיקריא אותה.") + '</p>' +
    '<div class="recs" id="recs"></div>' +
    '<h3>📲 שליחה להורים בכיתה</h3>' +
    '<p class="note">שולחים קישור שהמילים (והפירושים) כבר בתוכו. מי שפותח אותו – הרשימה נטענת אצלו, בלי להקליד.</p>' +
    '<div class="row start"><a class="btn wa" id="pWa" target="_blank" rel="noopener">💬 שליחה בוואטסאפ</a><button type="button" class="btn alt sm" id="pCopy">🔗 העתקת הקישור</button></div>' +
    '<h3>🔄 מתחילים מחדש</h3><div class="row start"><button type="button" class="btn alt sm" id="pReset">איפוס הכוכבים</button></div>' +
    '</section>';
  $("pBack").onclick = () => go("");
  const st = $("pStatus");
  $("pSave").onclick = () => {
    S.cls = $("pCls").value.replace(/[<>"]/g, "").trim().slice(0, 24);
    const list = parseWords($("pWords").value);
    if (list.length) { S.words = list; S.example = false; ev("eng-list", list.length); $("pWords").value = list.map(lineOf).join("\n"); }
    save(); paintRecs(); paintShare(); paintMeans();
    const miss = list.filter(o => !o.he).length;
    st.textContent = list.length ? "✔️ נשמר: " + list.length + " מילים." + (miss ? " ל-" + miss + " מילים אין פירוש – אפשר להוסיף אחרי מקף ולשמור שוב (לא חובה)." : " מוכנות למשחק.") : "הכיתה נשמרה. כדי לשמור מילים, כתבו לפחות מילה אחת באנגלית.";
  };
  function paintMeans(){
    const box = $("mBox"), list = S.example ? [] : S.words;
    if (!list.length) { box.hidden = true; return; } box.hidden = false;
    box.querySelector(".nqs").innerHTML = list.map(o => '<div class="nq' + (o.he ? "" : " miss") + '">' + en(o.w) + (o.he || o.e ? meanHTML(o) : '<small>❔ בלי פירוש</small>') + '</div>').join("");
  }
  function paintShare(){
    const list = S.example ? [] : S.words, wa = $("pWa"), cp = $("pCopy");
    if (!list.length) { wa.removeAttribute("href"); wa.onclick = e => { e.preventDefault(); st.textContent = "קודם שומרים מילים, ואז שולחים."; }; cp.onclick = wa.onclick; return; }
    const link = listLink(list);
    const msg = "שלום הורים" + (S.cls ? " של " + clsName(S.cls) : "") + " 😊\nאלה מילות ההכתבה באנגלית של השבוע:\n" + list.map(o => o.w).join(", ") + "\n\nבקישור יש משחקים לתרגול (בונים מילה, מפוצצים בלונים, מוצאים את הכתיב הנכון וכותבים מהזיכרון), עם פירוש בעברית והקראה באנגלית. הרשימה כבר נטענת לבד:\n" +
      link + "&utm_source=whatsapp&utm_medium=class_parents&utm_campaign=school-english\n\nבחינם, בחסות BOOQLI 💛";
    wa.href = "https://wa.me/?text=" + encodeURIComponent(msg);
    wa.onclick = () => ev("eng-share", "whatsapp");
    cp.onclick = () => { const done = () => { cp.textContent = "✔️ הקישור הועתק"; ev("eng-share", "copy"); };
      const show = () => modal('<h2>הקישור</h2><p style="word-break:break-all;direction:ltr">' + esc(link) + '</p><button class="btn" data-a="x">סגירה</button>');
      try { navigator.clipboard.writeText(link).then(done, show); } catch (e) { show(); } };
  }
  function paintRecs(){
    const box = $("recs");
    if (!canRecord) { box.innerHTML = '<p class="note">הדפדפן הזה לא מאפשר הקלטה. אפשר לנסות בכרום או בספארי מעודכן.</p>'; return; }
    const list = S.example ? [] : S.words;
    if (!list.length) { box.innerHTML = '<p class="note">קודם שומרים את המילים, ואז מקליטים.</p>'; return; }
    box.innerHTML = list.map((o, i) => { const has = REC.has(plain(o.w));
      return '<div class="rec" data-i="' + i + '">' + en(o.w) + (has ? '<span class="ok">✔️ מוקלט</span>' : '') +
        '<button type="button" class="r" aria-label="הקלטה: ' + esc(o.w) + '">🎙️</button><button type="button" class="pl" aria-label="השמעה"' + (has || ttsOK() ? "" : " disabled") + '>▶️</button>' +
        (has ? '<button type="button" class="dl" aria-label="מחיקת ההקלטה">🗑️</button>' : '') + '</div>'; }).join("");
    box.querySelectorAll(".rec").forEach(row => { const w = list[+row.dataset.i].w;
      row.querySelector(".r").onclick = e => record(w, e.currentTarget);
      row.querySelector(".pl").onclick = () => speak(w);
      const d = row.querySelector(".dl"); if (d) d.onclick = () => DB.del(plain(w)).then(() => { URL.revokeObjectURL(REC.get(plain(w))); REC.delete(plain(w)); paintRecs(); });
    });
  }
  function record(w, btn){
    if (recorder && recorder.state === "recording") { recorder.stop(); return; }
    const begin = () => {
      let chunks = []; try { recorder = new MediaRecorder(micStream); } catch (e) { st.textContent = "ההקלטה לא הצליחה בדפדפן הזה."; return; }
      recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = () => { btn.classList.remove("on"); btn.textContent = "🎙️"; clearTimeout(record.t);
        const blob = new Blob(chunks, {type: (recorder && recorder.mimeType) || "audio/webm"}); recorder = null;
        if (blob.size < 600) { st.textContent = "לא נשמע כלום. נסו שוב קרוב יותר לטלפון."; return; }
        DB.put(plain(w), blob).then(() => { if (REC.has(plain(w))) URL.revokeObjectURL(REC.get(plain(w))); REC.set(plain(w), URL.createObjectURL(blob)); ev("eng-rec", "word"); paintRecs(); speak(w); })
          .catch(() => { st.textContent = "לא הצלחתי לשמור את ההקלטה (אולי גלישה פרטית?)."; }); };
      recorder.start(); btn.classList.add("on"); btn.textContent = "⏹️"; st.textContent = "🔴 מקליטים: אמרו \"" + w + "\"";
      record.t = setTimeout(() => { try { if (recorder && recorder.state === "recording") recorder.stop(); } catch (e) {} }, 3000);
    };
    if (micStream) return begin();
    navigator.mediaDevices.getUserMedia({audio: true}).then(s => { micStream = s; begin(); })
      .catch(() => { st.textContent = "צריך לאשר לדפדפן להשתמש במיקרופון (בהגדרות האתר)."; });
  }
  $("pReset").onclick = () => adult("האיפוס מוחק את הכוכבים וההתקדמות של כל המילים במכשיר הזה. המילים וההקלטות נשארות.", () => { S.stars = 0; S.m = {}; save(); st.textContent = "✔️ הכוכבים אופסו."; });
  paintRecs(); paintShare(); paintMeans();
}

/* ================================ המשחקים ================================ */
function peek(w, ms){ $("peekword").textContent = w; $("peekbox").hidden = false; clearTimeout(peek.t); peek.t = setTimeout(() => { $("peekbox").hidden = true; }, ms || 1600); }
$("peekbox").onclick = () => { $("peekbox").hidden = true; };

function start(type){
  document.body.classList.add("in-game");
  G1 = {type, list: type === "test" ? shuffle(S.words) : pickRound(Math.min(6, S.words.length)), i: 0, earned: 0, peeks: 0, miss: 0, res: []};
  ev("eng-game", type);
  next();
}
function frame(bubble, exam){
  app.innerHTML = '<section class="card' + (exam ? ' paper exam' : '') + '">' +
    '<div class="pbar2"><button type="button" class="x" id="quit" aria-label="יציאה">✕</button><div class="dots">' +
    G1.list.map((_, i) => '<i class="' + (i < G1.i ? "on" : i === G1.i ? "now" : "") + '"></i>').join("") +
    '</div><span class="starpill">⭐ <span id="rs">' + G1.earned + '</span></span></div>' +
    (exam ? '<div class="examh"><span class="num">' + (G1.i + 1) + '.</span><div><b>Dictation · הכתבה' + (S.cls ? ' · ' + esc(clsName(S.cls)) : '') + '</b><small id="bub">' + bubble + '</small></div></div>'
      : '<div class="say"><img src="../../img/family/alef.webp" alt="" width="56" height="58"><div class="bubble" id="bub">' + bubble + '</div></div>') +
    '<div id="stage"></div></section>';
  $("quit").onclick = () => go("");
  return $("stage");
}
const bub = t => { $("bub").textContent = t; };
function next(){
  if (!G1) return;
  if (G1.i >= G1.list.length) return finish();
  G1.peeks = 0; G1.miss = 0;
  const o = G1.list[G1.i];
  ({build, pick, balloon, write, test})[G1.type](o);
  setTimeout(() => speak(o.w), 350);
}
function award(w, k, n){ G1.earned += n; S.stars += n; setBest(w, k, n); save(); const r = $("rs"); if (r) r.textContent = G1.earned; }
function nextBtn(){ const b = document.createElement("button"); b.type = "button"; b.className = "btn green wide"; b.style.marginTop = "12px";
  b.textContent = G1.i + 1 >= G1.list.length ? "סיום 🎉" : "למילה הבאה ←"; b.onclick = () => { G1.i++; next(); }; return b; }
/* כפתור השמע + פירוש בעברית + איות/הצצה */
function listen(o, opt){
  const w = o.w, d = document.createElement("div"); d.className = "listen";
  const mean = meanHTML(o, "big");
  if (hasSound(w)) {
    d.innerHTML = '<button type="button" class="speak pulse" aria-label="לשמוע את המילה">🔊</button>' + mean +
      (opt && opt.noPeek ? "" : '<div class="hints">' + (ttsOK() ? '<button type="button" class="peek sp">🔡 לשמוע באותיות (עולה כוכב)</button>' : '') + '<button type="button" class="peek pk">👀 הצצה (עולה כוכב)</button></div>');
    d.querySelector(".speak").onclick = () => speak(w);
    const p = d.querySelector(".pk"); if (p) p.onclick = () => { G1.peeks++; peek(w); };
    const s = d.querySelector(".sp"); if (s) s.onclick = () => { G1.peeks++; spell(w); };
  } else {
    d.innerHTML = mean + '<div class="adultread">🗣️ מבוגר מקריא את המילה באנגלית. <button type="button" class="peek">למבוגר: הצגת המילה</button></div>';
    d.querySelector(".peek").onclick = () => peek(w, 2200);
  }
  return d;
}
const stars = n => "⭐".repeat(n);
function slotsFor(w){
  const slots = document.createElement("div"); slots.className = "slots en"; slots.dir = "ltr"; const sl = [];
  [...w].forEach(c => { const s = document.createElement("div"); if (!isL(c)) { s.className = "slot gap"; s.textContent = c === " " ? "" : c; } else { s.className = "slot"; sl.push(s); } slots.appendChild(s); });
  return {slots, sl};
}

/* --- 🧩 בונים מילה --- */
function build(o){
  const w = o.w, st = frame("מקשיבים למילה ומסדרים את האותיות. באנגלית מתחילים משמאל! ⬅️");
  st.appendChild(listen(o));
  const need = [...w].filter(isL), {slots, sl} = slotsFor(w);
  st.appendChild(slots);
  const pool = need.concat(shuffle(decoysFor(need)).slice(0, need.length > 5 ? 3 : 2));
  const tiles = document.createElement("div"); tiles.className = "tiles"; tiles.dir = "ltr"; st.appendChild(tiles);
  let pos = 0; const mark = () => sl.forEach((s, i) => s.classList.toggle("next", i === pos)); mark();
  shuffle(pool).forEach(c => { const t = document.createElement("button"); t.type = "button"; t.className = "tile en"; t.textContent = c;
    t.onclick = () => {
      if (pos >= need.length) return;
      if (c === need[pos]) { sl[pos].textContent = c; t.classList.add("used"); pos++; mark(); SND.pop(); if (pos === need.length) done(); }
      else { G1.miss++; SND.soft(); t.classList.add("bad"); shake(t); setTimeout(() => t.classList.remove("bad"), 500); }
    }; tiles.appendChild(t); });
  function done(){ const n = Math.max(1, 3 - G1.miss - G1.peeks); award(w, "b", n); SND.win(); confetti(); speak(w);
    bub(PRAISE() + " " + stars(n)); tiles.remove(); st.appendChild(nextBtn()); }
}

/* --- 🔍 מי כתובה נכון? --- */
function pick(o){
  const w = o.w, st = frame("מקשיבים למילה. איזו מהן כתובה נכון באנגלית?");
  st.appendChild(listen(o));
  const box = document.createElement("div"); box.className = "choices"; st.appendChild(box);
  let tries = 0, over = false;
  shuffle([w].concat(wrongVariants(w))).forEach(v => { const b = document.createElement("button"); b.type = "button"; b.className = "choice"; b.innerHTML = en(v);
    b.onclick = () => {
      if (over || b.classList.contains("off")) return;
      if (v === w) { over = true; b.classList.add("good"); const n = Math.max(1, (tries ? 1 : 3) - G1.peeks); award(w, "p", n); SND.win(); confetti(); speak(w); bub(PRAISE() + " " + stars(n)); st.appendChild(nextBtn()); }
      else { tries++; SND.soft(); b.classList.add("off"); shake(b); bub("כמעט! מקשיבים שוב ומנסים עוד פעם"); }
    }; box.appendChild(b); });
}

/* --- 🎈 מפוצצים בלונים --- */
function balloon(o){
  const w = o.w, st = frame("מקשיבים למילה ומפוצצים את הבלונים לפי הסדר של האותיות. מתחילים משמאל! ⬅️");
  st.appendChild(listen(o));
  const need = [...w].filter(isL), {slots, sl} = slotsFor(w);
  const sky = document.createElement("div"); sky.className = "sky"; sky.setAttribute("aria-label", "בלונים עם אותיות");
  st.append(slots, sky);
  const decoys = decoysFor(need); if (!decoys.length) decoys.push("x", "q", "z");
  let pos = 0, alive = true, last = 0, lastSpawn = -9999, items = [];
  const slow = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mark = () => sl.forEach((s, i) => s.classList.toggle("next", i === pos)); mark();
  function spawn(text){
    const b = document.createElement("button"); b.type = "button"; b.className = "bal en c" + rnd(5); b.textContent = text; b.setAttribute("aria-label", "בלון: " + text);
    const Wd = sky.clientWidth || 300; b.style.left = (6 + rnd(Math.max(1, Wd - 88))) + "px";
    const it = {el: b, y: (sky.clientHeight || 340) + 4, v: (slow ? .35 : .6) + Math.random() * .45, text, dead: false};
    b.style.transform = "translateY(" + it.y + "px)"; b.onclick = () => hit(it); sky.appendChild(b); items.push(it);
  }
  function hit(it){
    if (it.dead || pos >= need.length) return;
    if (it.text === need[pos]) { it.dead = true; it.el.classList.add("popped"); setTimeout(() => it.el.remove(), 300); sl[pos].textContent = it.text; pos++; mark(); SND.pop(); if (pos === need.length) done(); }
    else if (!it.el.classList.contains("bad")) { G1.miss++; SND.soft(); it.el.classList.add("bad"); }
  }
  function tick(t){
    if (!alive || !sky.isConnected) { alive = false; return; }
    const dt = last ? Math.min(50, t - last) : 16; last = t;
    items.forEach(it => { if (it.dead) return; it.y -= it.v * dt * .12; it.el.style.transform = "translateY(" + it.y + "px)"; if (it.y < -100) { it.dead = true; it.el.remove(); } });
    items = items.filter(i => !i.dead);
    const hasNeed = items.some(i => i.text === need[pos] && !i.el.classList.contains("bad"));
    if (items.length < 5 && t - lastSpawn > (hasNeed ? 750 : 250)) { lastSpawn = t; spawn(!hasNeed || Math.random() < .35 ? need[pos] : Math.random() < .65 ? decoys[rnd(decoys.length)] : need[rnd(need.length)]); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  function done(){
    alive = false; items.forEach(i => { i.el.classList.add("popped"); setTimeout(() => i.el.remove(), 300); });
    const n = Math.max(1, 3 - G1.miss - G1.peeks); award(w, "b", n); SND.win(); confetti(); speak(w);
    bub(PRAISE() + " " + stars(n)); setTimeout(() => { sky.remove(); }, 320); st.appendChild(nextBtn());
  }
}

/* --- לוח כתיבה (שורות של מחברת אנגלית, שוליים משמאל) --- */
function makePad(){
  const wrap = document.createElement("div"); wrap.className = "pad";
  const cv = document.createElement("canvas"), hint = document.createElement("div"); hint.className = "padhint"; hint.textContent = "כותבים כאן באצבע, משמאל לימין ✍️";
  wrap.append(cv, hint);
  const strokes = []; let cur = null; const ctx = cv.getContext("2d");
  const ink = (c, lw) => { c.strokeStyle = "#213330"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; c.setLineDash([]); };
  const line = (c, s) => { if (!s.length) return; c.beginPath(); c.moveTo(s[0][0], s[0][1]); if (s.length === 1) c.lineTo(s[0][0] + .1, s[0][1]); for (let i = 1; i < s.length; i++) c.lineTo(s[i][0], s[i][1]); c.stroke(); };
  function draw(){ const r = cv.getBoundingClientRect(), w = r.width, h = r.height; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 2; ctx.strokeStyle = "#D6E4F5"; ctx.setLineDash([]); [h * .22, h * .78].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); });
    ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(0, h * .5); ctx.lineTo(w, h * .5); ctx.stroke();
    ctx.setLineDash([]); ctx.strokeStyle = "#7BA7E8"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, h * .78); ctx.lineTo(w, h * .78); ctx.stroke();
    ctx.strokeStyle = "#F08A9C"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(24, h); ctx.stroke();
    ink(ctx, 6); strokes.forEach(s => line(ctx, s)); hint.hidden = strokes.length > 0; }
  function size(){ const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); ctx.setTransform(d, 0, 0, d, 0, 0); draw(); }
  const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointerdown", e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} cur = [pt(e)]; strokes.push(cur); draw(); });
  cv.addEventListener("pointermove", e => { if (!cur) return; e.preventDefault(); cur.push(pt(e)); draw(); });
  const end = () => { cur = null; }; cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  try { new ResizeObserver(size).observe(cv); } catch (e) { setTimeout(size, 50); }
  function image(){ let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; strokes.forEach(s => s.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
    const pad = 18, w = Math.max(60, x1 - x0 + pad * 2), h = Math.max(50, y1 - y0 + pad * 2), sc = Math.min(1.5, 480 / w);
    const c = document.createElement("canvas"); c.width = w * sc; c.height = h * sc; const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.setTransform(sc, 0, 0, sc, (pad - x0) * sc, (pad - y0) * sc); ink(x, 6); strokes.forEach(s => line(x, s)); return c.toDataURL("image/png"); }
  return {el: wrap, clear(){ strokes.length = 0; draw(); }, undo(){ strokes.pop(); draw(); }, empty: () => !strokes.length, image};
}
let inputMode = "hand";
function modes(onChange){
  const m = document.createElement("div"); m.className = "modes";
  [["hand", "✍️ כתב יד"], ["kb", "⌨️ מקלדת"]].forEach(([k, l]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = l; b.setAttribute("aria-pressed", inputMode === k);
    b.onclick = () => { inputMode = k; m.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); onChange(); }; m.appendChild(b); });
  return m;
}
function kbInput(id){ const i = document.createElement("input"); i.type = "text"; i.id = id; i.className = "kb en"; i.setAttribute("lang", "en"); i.setAttribute("dir", "ltr");
  i.autocomplete = "off"; i.setAttribute("autocorrect", "off"); i.setAttribute("autocapitalize", "off"); i.spellcheck = false; i.setAttribute("aria-label", "כותבים את המילה באנגלית"); return i; }
const sameWord = (a, b) => tight(a) === tight(b);
function diffHTML(typed, right){ const a = [...tight(typed)], b = [...tight(right)]; return a.map((c, i) => c === b[i] ? esc(c) : '<span class="wrong">' + esc(c) + '</span>').join("") + (a.length < b.length ? '<span class="wrong">_</span>' : "") || "—"; }
const compareBox = o => '<div class="big en right" dir="ltr">' + esc(o.w) + '</div>' + meanHTML(o);
function tools(pad){ const r = document.createElement("div"); r.className = "row";
  r.innerHTML = '<button type="button" class="btn alt sm">↶ ביטול קו</button><button type="button" class="btn alt sm">🧽 מחיקה</button>';
  r.children[0].onclick = () => pad.undo(); r.children[1].onclick = () => pad.clear(); return r; }
const hebOnly = /[א-ת]/;

/* --- 👀 מסתכלים, מסתירים, כותבים --- */
function write(o){
  const w = o.w, st = frame("מסתכלים טוב על המילה וזוכרים אותה. מוכנים? מסתירים וכותבים מהזיכרון!");
  st.appendChild(listen(o, {noPeek: true}));
  const model = document.createElement("div"); model.className = "model";
  model.innerHTML = '<div class="en mrd" dir="ltr">' + esc(w) + '</div><button type="button" class="btn purple wide" id="hideW">🙈 זכרתי! מסתירים וכותבים</button>';
  const ms = modes(paint), area = document.createElement("div"); ms.hidden = true; area.hidden = true;
  st.append(model, ms, area);
  $("hideW").onclick = () => {
    model.classList.add("off"); model.innerHTML = '<div class="hid">🙈 המילה מוסתרת</div><button type="button" class="peek">👀 הצצה (עולה כוכב)</button>';
    model.querySelector(".peek").onclick = () => { G1.peeks++; peek(w); };
    ms.hidden = false; area.hidden = false; bub("עכשיו כותבים באנגלית מהזיכרון ✍️"); paint();
  };
  let tries = 0, won = false;
  function win(out){ if (won) return; won = true;
    const n = Math.max(1, (tries === 0 ? 3 : tries === 1 ? 2 : 1) - G1.peeks); award(w, "w", n); SND.win(); confetti(); speak(w); bub(PRAISE() + " " + stars(n));
    out.innerHTML = '<div class="verdict ok"><div class="big en right" dir="ltr">' + esc(w) + ' ✓</div></div>'; out.appendChild(nextBtn()); }
  function paint(){
    if (won) return; area.innerHTML = "";
    const out = document.createElement("div");
    if (inputMode === "kb") {
      const inp = kbInput("kbW"), chk = document.createElement("button"); chk.type = "button"; chk.className = "btn purple wide"; chk.style.marginTop = "10px"; chk.textContent = "בדיקה ✓";
      chk.onclick = () => { const v = inp.value;
        if (hebOnly.test(v) && !/[a-z]/i.test(v)) { out.innerHTML = '<div class="verdict no">⌨️ המקלדת בעברית. מחליפים לאנגלית (🌐 במקלדת) וכותבים שוב.</div>'; return; }
        if (!tight(v)) return;
        if (sameWord(v, w)) { chk.remove(); inp.disabled = true; win(out); }
        else { tries++; SND.soft(); out.innerHTML = '<div class="verdict no"><div class="big en" dir="ltr">' + diffHTML(v, w) + '</div><div>כמעט! מה שבאדום צריך תיקון. מנסים שוב</div></div>'; inp.focus(); } };
      inp.addEventListener("keydown", e => { if (e.key === "Enter") chk.click(); });
      area.append(inp, chk, out); setTimeout(() => inp.focus(), 60);
    } else {
      const pad = makePad(), fin = document.createElement("button"); fin.type = "button"; fin.className = "btn purple wide"; fin.style.marginTop = "10px"; fin.textContent = "סיימתי ✓";
      fin.onclick = () => {
        if (pad.empty()) { bub("קודם כותבים, ואחר כך לוחצים \"סיימתי\" 🙂"); return; }
        out.innerHTML = '<div class="verdict cmp"><div>👨‍👩‍👧 אבא ואמא: בדקו אם המילה כתובה נכון, ולחצו ✓ או "עוד פעם":</div>' + compareBox(o) +
          '<div class="row"><button type="button" class="btn green sm" id="sY">✓ כתבתי נכון</button><button type="button" class="btn alt sm" id="sN">טעיתי, עוד פעם</button></div></div>';
        fin.disabled = true;
        $("sY").onclick = () => { fin.remove(); win(out); };
        $("sN").onclick = () => { tries++; SND.soft(); pad.clear(); out.innerHTML = ""; fin.disabled = false; bub("מסתכלים טוב על המילה, וכותבים שוב ✍️"); peek(w, 1800); };
      };
      area.append(pad.el, tools(pad), fin, out);
    }
  }
}

/* --- 📝 הכתבה אמיתית --- */
function test(o){
  const w = o.w, st = frame("מילה " + (G1.i + 1) + " מתוך " + G1.list.length + " · מקשיבים וכותבים באנגלית, בלי הצצות. הציון בסוף!", true);
  st.appendChild(listen(o, {noPeek: true}));
  const area = document.createElement("div"); st.append(modes(paint), area);
  const label = () => G1.i + 1 >= G1.list.length ? "סיימתי את ההכתבה 🎉" : "המילה הבאה ←";
  function paint(){
    area.innerHTML = "";
    const go2 = document.createElement("button"); go2.type = "button"; go2.className = "btn green wide"; go2.style.marginTop = "10px"; go2.textContent = label();
    if (inputMode === "kb") {
      const inp = kbInput("kbT"); inp.addEventListener("keydown", e => { if (e.key === "Enter") go2.click(); });
      go2.onclick = () => { const v = inp.value;
        if (hebOnly.test(v) && !/[a-z]/i.test(v)) { bub("⌨️ המקלדת בעברית. מחליפים לאנגלית וכותבים שוב"); return; }
        if (!tight(v)) { bub("קודם כותבים את המילה 🙂"); return; } G1.res.push({o, typed: v, ok: sameWord(v, w)}); G1.i++; next(); };
      area.append(inp, go2); setTimeout(() => inp.focus(), 60);
    } else {
      const pad = makePad();
      go2.onclick = () => { if (pad.empty()) { bub("קודם כותבים את המילה 🙂"); return; } G1.res.push({o, img: pad.image(), ok: null}); G1.i++; next(); };
      area.append(pad.el, tools(pad), go2);
    }
  }
  paint();
}

/* --- סוף סיבוב --- */
function finish(){
  const t = G1.type;
  if (t !== "test") {
    const nxt = {build: "🔍 מי כתובה נכון?", pick: "🎈 מפוצצים בלונים", balloon: "👀 מסתכלים, מסתירים, כותבים"}[t];
    app.innerHTML = '<section class="card end"><div class="emo">🏆</div><h2 style="font-size:30px;color:#C5309A">' + PRAISE() + '</h2>' +
      '<p class="note">אספתם בסיבוב הזה</p><div class="bigscore">⭐ ' + G1.earned + '</div>' +
      '<div class="row"><button type="button" class="btn green" id="again">עוד סיבוב</button><button type="button" class="btn alt" id="home">לכל המשחקים</button></div>' +
      '<p class="note" style="margin-top:12px">' + (nxt ? "הבא בתור: " + nxt : "מוכנים? 📝 הכתבה אמיתית") + '</p></section>';
    $("again").onclick = () => start(t); $("home").onclick = () => go("");
    SND.win(); confetti(); return;
  }
  const R = G1.res, game = G1;
  app.innerHTML = '<section class="card"><h2 style="font-size:28px;color:#C5309A;text-align:center">תוצאות ההכתבה</h2><div id="score" style="text-align:center;margin:8px 0"></div>' + (R.some(r => r.img) ? '<div class="parentcheck">👨‍👩‍👧 <b>אבא ואמא:</b> בדקו אם המילים שנכתבו ביד כתובות נכון, וסמנו <b>✓</b> ליד מילה נכונה או <b>✗</b> ליד מילה עם טעות.</div>' : '') + '<div id="rows"></div>' +
    '<div class="row"><button type="button" class="btn green" id="again">עוד הכתבה</button><button type="button" class="btn alt" id="home">לכל המשחקים</button></div></section>';
  $("again").onclick = () => start("test"); $("home").onclick = () => go("");
  const rows = $("rows");
  R.forEach(it => {
    const d = document.createElement("div"); d.className = "res";
    d.innerHTML = (it.img ? '<img alt="מה שנכתב" src="' + it.img + '">' : '<div class="typed en" dir="ltr">' + esc(it.typed) + '</div>') +
      '<div class="w">' + en(it.o.w) + '<small></small></div><div class="mark">' + (it.img ? "" : it.ok ? "✅" : "❌") + '</div>';
    rows.appendChild(d);
    if (it.img) {
      d.querySelector("small").textContent = "אבא ואמא: נכון? סמנו ✓";
      const m = d.querySelector(".mark"), box = document.createElement("div"); box.className = "self";
      box.innerHTML = '<button type="button" class="y" aria-label="נכון" aria-pressed="false">✓</button><button type="button" class="n" aria-label="לא נכון" aria-pressed="false">✗</button>';
      const set = v => { if (game.done) return; it.ok = v; box.children[0].setAttribute("aria-pressed", v); box.children[1].setAttribute("aria-pressed", !v); paintScore(); };
      box.children[0].onclick = () => set(true); box.children[1].onclick = () => set(false); m.appendChild(box);
    } else d.querySelector("small").innerHTML = it.ok ? esc((it.o.e ? it.o.e + " " : "") + it.o.he) : 'נכתב: <span class="wrong" dir="ltr">' + esc(it.typed) + '</span>';
  });
  function paintScore(){
    const good = R.filter(r => r.ok).length, left = R.filter(r => r.ok === null).length;
    $("score").innerHTML = '<div class="bigscore">' + good + '/' + R.length + '</div><p class="note">' +
      (left ? "אבא ואמא: סמנו ✓ או ✗ ליד כל מילה שנכתבה ביד (נשארו " + left + ")" : good === R.length ? "Perfect! מוכנים להכתבה 🌟" : "כל הכבוד על התרגול! את המילים שלא הצליחו כדאי לתרגל עוד.") + '</p>';
    if (!left && !game.done) { game.done = true; let earned = 0; R.forEach(r => { if (r.ok) { setBest(r.o.w, "w", 3); earned += 2; } }); S.stars += earned; save();
      ev("eng-test", good + "of" + R.length);
      $("score").insertAdjacentHTML("beforeend", '<span class="starpill">⭐ +' + earned + '</span>'); SND.win(); confetti(); }
  }
  paintScore();
}

/* ================================ דפים להדפסה ================================ */
function sheet(){
  document.body.classList.add("sheet-mode"); app.hidden = true;
  const box = $("print"); box.hidden = false;
  const ws = S.words.slice(0, MAXW), nm = '<span class="cline"></span>', cl = S.cls ? esc(clsName(S.cls)) + ' · ' : '';
  const head = (t, tEn, s) => '<header class="sh-h"><div><b>' + t + ' <span class="en" dir="ltr">' + tEn + '</span></b><small>הכתבה באנגלית · ' + cl + s + '</small></div><div class="nm">שֵׁם: ' + nm + '</div></header>';
  const foot = () => typeof sitePrintFooter === "function" ? sitePrintFooter("school-english", "", "../../img/logo.png") : "";
  const mean = o => '<span class="mn">' + (o.e ? '<span class="emo">' + esc(o.e) + '</span> ' : '') + esc(o.he) + '</span>';
  const pages = [];
  for (let i = 0; i < ws.length; i += 11) {
    pages.push('<section class="pg">' + head("מתרגלים לכתוב", "Practice", "מילות ההכתבה של השבוע") +
      '<p class="instr">קוראים את המילה ואת הפירוש, ומעתיקים אותה פעמיים בשורה – משמאל לימין.</p><div class="sb copyrows">' +
      ws.slice(i, i + 11).map(o => '<div>' + mean(o) + '<span class="en wd" dir="ltr">' + esc(o.w) + '</span><span class="ln"></span></div>').join("") + '</div>' + foot() + '</section>');
  }
  const n = Math.max(ws.length, 10), mix = shuffle(ws);
  pages.push('<section class="pg">' + head("הכתבה", "Dictation", "מבוגר מקריא באנגלית, ילד כותב") +
    '<p class="instr">המבוגר מקריא כל מילה באנגלית (בסדר מעורבב), והילד כותב בשורה. בסוף בודקים יחד ומתקנים.</p><div class="sb"><div class="dictrows" dir="ltr">' +
    Array.from({length: n}, (_, i) => '<div>' + (i + 1) + '.</div>').join("") + '</div>' +
    '<div class="answers"><b>למבוגר – סדר ההקראה:</b> <span dir="ltr">' + mix.map((o, i) => (i + 1) + '. ' + en(o.w)).join(" · ") + '</span></div></div>' + foot() + '</section>');
  const tr = shuffle(ws.filter(o => o.he)).slice(0, 15);
  if (tr.length >= 3) pages.push('<section class="pg">' + head("כותבים באנגלית", "Write in English", "מהעברית לאנגלית") +
    '<p class="instr">מה המילה באנגלית? כותבים אותה בשורה, משמאל לימין.</p><div class="sb trrows">' +
    tr.map((o, i) => '<div><span class="tn">' + (i + 1) + '.</span>' + mean(o) + '<span class="ln"></span></div>').join("") +
    '<div class="answers"><b>תשובות למבוגר:</b> <span dir="ltr">' + tr.map((o, i) => (i + 1) + '. ' + en(o.w)).join(" · ") + '</span></div></div>' + foot() + '</section>');
  box.innerHTML = '<div class="pbar"><button type="button" class="btn alt sm" id="pBack">← חזרה למשחקים</button><button type="button" class="btn sm" id="pPrint">🖨️ הדפסה</button><button type="button" class="btn alt sm" id="pNew">🔄 סדר חדש</button></div>' +
    '<p class="pnote">' + (S.example ? "⚠️ אלה מילים לדוגמה. מכניסים את מילות השבוע באזור ההורים, ואז מדפיסים. " : "") + 'מדפיסים בגודל A4. מותר לשתף בחינם, עם הקרדיט של BOOQLI.</p>' +
    '<div class="pages" id="pages">' + pages.join("") + '</div>';
  $("pBack").onclick = () => go("");
  $("pPrint").onclick = () => { ev("eng-print", ws.length); window.print(); };
  $("pNew").onclick = sheet;
  fit(); ev("eng-sheet", "open");
}
function fit(){ const p = $("pages"); if (!p) return; const w = p.clientWidth || window.innerWidth; p.style.setProperty("--z", Math.min(1, (w - 4) / (210 * 3.7795)).toFixed(3)); }
window.addEventListener("resize", fit);
window.addEventListener("beforeprint", () => { const p = $("pages"); if (p) p.style.setProperty("--z", "1"); });
window.addEventListener("afterprint", fit);

/* ================================ התחלה ================================ */
(function boot(){
  const p = P(), w = p.get("w");
  if (w) {
    const list = unpackList(w);
    const c = (p.get("c") || "").replace(/[<>"]/g, "").trim().slice(0, 24);
    const same = list.map(lineOf).join("\n") === S.words.map(lineOf).join("\n");
    if (list.length && S.example) { S.words = list; S.example = false; if (c) S.cls = c; save(); justLoaded = list.length; ev("eng-received", "auto" + list.length); }
    else if (list.length && !same) { incoming = list; incomingCls = c; }
    else if (c && !S.cls) { S.cls = c; save(); }
    p.delete("w"); p.delete("c"); ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(k => p.delete(k));
    const qs = p.toString();
    setTimeout(() => { try { if (typeof siteSetUrl === "function") siteSetUrl(base() + (qs ? "?" + qs : ""), false); } catch (e) {} }, 1600);
  }
  route();
  if (window.indexedDB) loadRecs().then(() => { if (!G1 && !P().get("sheet") && !P().get("p")) home(); });
})();
window.ENG_APP = {S: () => S, cur: () => G1 && G1.list[G1.i], plain, wrongVariants, parseWords, unpackList, packList, listLink};
})();
