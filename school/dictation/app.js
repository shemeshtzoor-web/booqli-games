/* מאמן ההכתבה (school/dictation/) – 4.11.2026
   ההורה מכניס את מילות ההכתבה של השבוע (או מקבל אותן בקישור ?w=...), והילד מתרגל ב-4 משחקים.
   הכל נשמר רק בדפדפן: booqli_dictation (מילים, שם, בן/בת, כוכבים) + IndexedDB booqli_dictation (ההקלטות של ההורה).
   קול: הקלטה של ההורה ← קול ממוחשב בעברית ← "מבוגר מקריא" (מציג את המילה למבוגר).
   כתב יד לא נבדק אוטומטית: הילד כותב, ואז משווים יחד למילה הנכונה. מקלדת = בדיקה מלאה. */
(function(){
"use strict";
const $ = id => document.getElementById(id);
const app = $("dApp");
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ev = (k, n) => { try { siteEvent(k, String(n)); } catch (e) {} };

/* ---------- ההתקדמות ---------- */
const KEY = "booqli_dictation", MAXW = 30;
const EXAMPLE = ["שמש", "כיתה", "חבר", "תפוח", "עכבר", "מחברת", "צבע", "טלפון"];
const blank = () => ({v:1, cls:"", font:"cv", words:EXAMPLE.slice(), example:true, m:{}, stars:0});
let S = (() => { try { const o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o && o.v === 1) return Object.assign(blank(), o); } catch (e) {} return blank(); })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
/* (4.11.2026, לפי שמש) פונים תמיד ברבים – לכל ילדי הכיתה. G נשאר כדי שיהיה קל לחזור לבן/בת */
const G = (m, f, n) => n;
/* שם הכיתה: "ב'2" → "כיתה ב'2" */
const clsName = c => { c = String(c || "").replace(/[<>"]/g, "").trim().slice(0, 24); return !c ? "" : /^כית/.test(c) ? c : "כיתה " + c; };

/* ---------- עברית ---------- */
const NIQ = /[֑-ׇ]/g;
const plain = w => String(w).replace(NIQ, "").replace(/[^א-ת ]/g, "").replace(/\s+/g, " ").trim();
const tight = w => plain(w).replace(/ /g, "");
const isL = c => /[א-ת]/.test(c);
const FIN = {"כ":"ך","מ":"ם","נ":"ן","פ":"ף","צ":"ץ"};
const FINALS = new Set(Object.values(FIN));
const CONF = {"א":["ע","ה"],"ע":["א"],"ה":["א"],"ט":["ת"],"ת":["ט"],"כ":["ח","ק"],"ח":["כ"],"ק":["כ"],"ס":["ש"],"ש":["ס"],
  "ב":["ו"],"ו":["ב"],"מ":["נ"],"ם":["מ"],"נ":["מ"],"ן":["נ"],"צ":["ס"],"ץ":["צ"],"פ":["ב"],"ף":["פ"],"ך":["כ"],"ד":["ר"],"ר":["ד"],"ג":["ק"],"ז":["ס"],"ל":["ר"],"י":["ו"]};
/* שתי דרכי כתיב שגויות: אות דומה, ו/י חסרה או מיותרת, סופית לא נכונה */
function wrongVariants(word){
  const w = plain(word), ch = [...w], out = new Set();
  const atEnd = i => i === ch.length - 1 || ch[i + 1] === " ";
  ch.forEach((c, i) => {
    (CONF[c] || []).forEach(a => {
      if (FINALS.has(a) && !atEnd(i)) return;
      if (FIN[a] && atEnd(i) && !FINALS.has(c)) return;
      const n = ch.slice(); n[i] = a; out.add(n.join(""));
    });
    if ((c === "ו" || c === "י") && ch.length > 2) { const n = ch.slice(); n.splice(i, 1); out.add(n.join("")); }
  });
  if (ch.length > 1 && !atEnd(0)) ["ו", "י"].forEach(x => { const n = ch.slice(); n.splice(1, 0, x); out.add(n.join("")); });
  out.delete(w);
  const list = shuffle([...out]).filter(v => v.trim());
  if (list.length < 2 && ch.length > 2) { const n = ch.slice(); [n[0], n[1]] = [n[1], n[0]]; if (n.join("") !== w) list.push(n.join("")); }
  return list.slice(0, 2);
}
function parseWords(t){
  const seen = new Set(), out = [];
  String(t).split(/[\n,،;]+/).forEach(x => {
    x = x.replace(/^\s*\d+\s*[.)\-:]?\s*/, "").replace(/[^֐-׿ ]/g, "").replace(/\s+/g, " ").trim();
    const k = plain(x); if (k && !seen.has(k)) { seen.add(k); out.push(x); }
  });
  return out.slice(0, MAXW);
}

/* ---------- צלילים וחגיגה ---------- */
let AC = null;
const ac = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) {} return AC; };
const tone = (f, dur = .3, type = "triangle", vol = .2, at = 0) => { const c = ac(); if (!c) return; const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05); };
const SND = {
  ok: () => { tone(660, .15, "sine", .2); tone(990, .25, "sine", .2, .12); },
  pop: () => tone(520 + rnd(300), .12, "sine", .22),
  soft: () => tone(300, .18, "sine", .1),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, "triangle", .2, i * .13))
};
const confetti = () => { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("div"); c.className = "conf"; const cols = ["#FF56C2","#FFC93C","#46C46E","#3AA7F0","#9B5DE5"];
  for (let i = 0; i < 46; i++) { const p = document.createElement("i"); p.style.left = rnd(100) + "%"; p.style.background = cols[i % 5]; p.style.animationDelay = (rnd(70) / 100) + "s"; c.appendChild(p); }
  document.body.appendChild(c); setTimeout(() => c.remove(), 2800); };
const shake = b => { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); };
const PRAISE = () => shuffle(["כל הכבוד!", "מדהים!", G("אלוף!", "אלופה!", "אלופים!"), "בול!", "יופי של כתיבה!", G("איזה מוכשר!", "איזו מוכשרת!", "וואו!")])[0];
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
  const open = () => p || (p = new Promise((res, rej) => { try { const r = indexedDB.open("booqli_dictation", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("rec"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
  const tx = (mode, fn) => open().then(db => new Promise((res, rej) => { const t = db.transaction("rec", mode), st = t.objectStore("rec"); const r = fn(st); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); }));
  return {get: k => tx("readonly", st => st.get(k)), put: (k, v) => tx("readwrite", st => st.put(v, k)), del: k => tx("readwrite", st => st.delete(k)),
    keys: () => tx("readonly", st => st.getAllKeys())};
})();
const REC = new Map(); /* מילה (בלי ניקוד) → כתובת לניגון */
function loadRecs(){
  return DB.keys().then(keys => Promise.all((keys || []).map(k => DB.get(k).then(b => { if (b) { if (REC.has(k)) URL.revokeObjectURL(REC.get(k)); REC.set(k, URL.createObjectURL(b)); } })))).catch(() => {});
}
const canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder && window.indexedDB);

/* ---------- קול ---------- */
let heVoice = null, voiceKnown = false;
const hasTTS = "speechSynthesis" in window;
function loadVoices(){ if (!hasTTS) return; try { const vs = speechSynthesis.getVoices(); if (vs.length) { voiceKnown = true; heVoice = vs.find(v => /^(he|iw)/i.test(v.lang)) || null; } } catch (e) {} }
if (hasTTS) { loadVoices(); try { speechSynthesis.addEventListener("voiceschanged", loadVoices); } catch (e) {} }
const ttsOK = () => hasTTS && (!voiceKnown || !!heVoice);
const hasSound = w => REC.has(plain(w)) || ttsOK();
let player = null;
function speak(w){
  ac();
  const url = REC.get(plain(w));
  try { if (hasTTS) speechSynthesis.cancel(); } catch (e) {}
  if (player) { try { player.pause(); } catch (e) {} }
  if (url) { player = new Audio(url); player.play().catch(() => {}); return true; }
  if (!ttsOK()) return false;
  try { const u = new SpeechSynthesisUtterance(w); u.lang = "he-IL"; if (heVoice) u.voice = heVoice; u.rate = .78; speechSynthesis.speak(u); return true; } catch (e) { return false; }
}
const stopSound = () => { try { if (hasTTS) speechSynthesis.cancel(); } catch (e) {} if (player) { try { player.pause(); } catch (e) {} } };

/* ---------- רמה של כל מילה ---------- */
const getM = w => S.m[plain(w)] || {b:0, p:0, w:0};
const setBest = (w, k, n) => { const m = Object.assign({b:0, p:0, w:0}, getM(w)); m[k] = Math.max(m[k] || 0, n); S.m[plain(w)] = m; };
const total = w => { const m = getM(w); return (m.b || 0) + (m.p || 0) + (m.w || 0); };
const stage = w => { const t = total(w); return t >= 7 ? "🌸" : t >= 4 ? "🌿" : t >= 1 ? "🌱" : "⚪"; };
const pickRound = n => shuffle(S.words).sort((a, b) => total(a) - total(b)).slice(0, n).sort(() => Math.random() - .5);

/* ---------- ניתוב (כמו במסלול הקריאה: המדידה מחליפה את הכתובת לרגע) ---------- */
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
  build: {ic:"🧩", t:"בונים מילה", s:"שומעים ומסדרים את האותיות", c:"g1"},
  pick:  {ic:"🔍", t:"מי כתובה נכון?", s:"מוצאים את הכתיב הנכון", c:"g2"},
  write: {ic:"✏️", t:"כותבים במחברת", s:"כותבים ביד או במקלדת", c:"g3"},
  test:  {ic:"📝", t:"הכתבה אמיתית", s:"כל המילים, כמו בכיתה", c:"g4"}
};
let incoming = null, incomingCls = ""; /* רשימה (וכיתה) שהגיעו בקישור */
let G1 = null;       /* המשחק הנוכחי */

const applyFont = () => document.body.classList.toggle("cvmode", S.font !== "rd");
function route(){
  applyFont();
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
  const hi = S.cls ? "שלום ילדי " + esc(clsName(S.cls)) + "!" : "שלום ילדים!";
  let h = '<section class="card d-hero"><img src="../../img/family/alef.webp" alt="" width="104" height="107"><div>' +
    '<small>כיתות א\'–ג\' · אֲלֶפְבּוּקְלִי</small><h1>מאמן ההכתבה</h1>' +
    '<div class="bubble">' + hi + ' ' + (S.words.length ? G("בוא נלמד", "בואי נלמד", "בואו נלמד") + " את מילות ההכתבה של השבוע ✏️" : "עוד אין מילים. מבוגר יכול להוסיף אותן באזור ההורים.") + '</div>' +
    '<div class="row start"><span class="starpill" title="כוכבים שנאספו">⭐ ' + S.stars + '</span></div></div></section>';
  if (incoming) h += '<section class="newlist" aria-live="polite"><h2>📬 קיבלתם את מילות ההכתבה' + (incomingCls ? ' של ' + esc(clsName(incomingCls)) : '') + ' (' + incoming.length + ' מילים)</h2><div class="ws">' + incoming.map(esc).join(" · ") + '</div>' +
    '<div class="row start"><button type="button" class="btn purple" id="inYes">לשמור ולהתחיל</button><button type="button" class="btn alt sm" id="inNo">לא עכשיו</button></div>' +
    (S.example ? "" : '<p class="note">הרשימה החדשה תחליף את המילים שיש עכשיו. הכוכבים נשמרים.</p>') + '</section>';
  else if (S.example) h += '<div class="exnote">✋ זו <b>רשימה לדוגמה</b>. הורים: מכניסים את המילים של השבוע ב"אזור ההורים" למטה.</div>';
  h += '<section class="card words"><h2>המילים של השבוע <small>' + S.words.length + ' מילים · 🌱 מתחילים · 🌿 משתפרים · 🌸 יודעים</small></h2>' +
    '<div class="garden">' + S.words.map((w, i) => '<button type="button" class="chip" data-i="' + i + '" aria-label="לשמוע: ' + esc(w) + '"><span class="rd wd">' + esc(w) + '</span><span class="lv">' + stage(w) + '</span></button>').join("") + '</div>' +
    '<div class="fontsw"><span>איך כותבים את המילים?</span><div class="modes" role="group" aria-label="סוג הכתב"><button type="button" data-f="cv" aria-pressed="' + (S.font !== "rd") + '">✍️ כתב יד</button><button type="button" data-f="rd" aria-pressed="' + (S.font === "rd") + '">🔤 דפוס</button></div></div>' +
    '<p class="note" style="margin-top:8px">' + (hasSound(S.words[0] || "") ? "לוחצים על מילה כדי לשמוע אותה." : "") + '</p></section>';
  h += '<div class="games">' + Object.keys(GAMES).map(k => { const g = GAMES[k];
    return '<button type="button" class="game ' + g.c + '" data-g="' + k + '"' + (S.words.length ? "" : " disabled") + '><span class="emo">' + g.ic + '</span><b>' + g.t + '</b><small>' + g.s + '</small></button>'; }).join("") + '</div>';
  h += '<div class="adultrow bq-teach"><button type="button" class="btn purple" id="toP">👩‍👧 אזור ההורים: המילים של השבוע</button><a class="btn alt" href="?sheet=1" id="toSheet">🖨️ דף הכתבה להדפסה</a></div>';
  app.innerHTML = h;
  app.querySelectorAll(".chip").forEach(b => b.onclick = () => { if (!speak(S.words[+b.dataset.i])) peek(S.words[+b.dataset.i], 1600); });
  app.querySelectorAll("[data-g]").forEach(b => b.onclick = () => { ac(); go("?g=" + b.dataset.g); });
  app.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { S.font = b.dataset.f; save(); applyFont(); app.querySelectorAll("[data-f]").forEach(x => x.setAttribute("aria-pressed", x === b)); ev("dict-font", S.font); });
  $("toP").onclick = () => { if (typeof siteKidLock === "function" && siteKidLock()) adult("אזור ההורים: כאן משנים את המילים.", () => go("?p=1")); else go("?p=1"); };
  $("toSheet").onclick = e => { e.preventDefault(); go("?sheet=1"); };
  if (incoming) {
    $("inYes").onclick = () => { S.words = incoming; S.example = false; if (incomingCls) S.cls = incomingCls; save(); ev("dict-received", incoming.length); incoming = null; home(); };
    $("inNo").onclick = () => { incoming = null; home(); };
  }
}

/* ================================ אזור ההורים ================================ */
let micStream = null, recorder = null;
function stopMic(){ try { if (recorder && recorder.state !== "inactive") recorder.stop(); } catch (e) {} recorder = null; if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; } }
const listLink = ws => "https://games.booqli.ai/school/dictation/?w=" + encodeURIComponent(ws.join(",")) + (S.cls ? "&c=" + encodeURIComponent(S.cls).replace(/'/g, "%27") : "");
function parents(){
  const ws = S.example ? [] : S.words;
  app.innerHTML = '<section class="card pz">' +
    '<div class="pbar2"><button type="button" class="x" id="pBack" aria-label="חזרה">→</button><h2>👩‍👧 אזור ההורים</h2></div>' +
    '<div class="field"><label for="pCls">הכיתה</label><input type="text" id="pCls" maxlength="24" autocomplete="off" placeholder="למשל: ב\'2" value="' + esc(S.cls) + '"><span class="note">יופיע במשחק ("שלום ילדי כיתה ב\'2!") ובהודעה להורים. לא כותבים את שם הילד.</span></div>' +
    '<div class="field"><label for="pWords">מילות ההכתבה של השבוע</label>' +
    '<textarea id="pWords" placeholder="מילה אחת בכל שורה, למשל:&#10;שמש&#10;כיתה&#10;תפוח">' + esc(ws.join("\n")) + '</textarea>' +
    '<div class="tip">🎤 <b>רוצים להקריא במקום להקליד?</b> לוחצים בתוך התיבה, ואז על המיקרופון במקלדת של הטלפון. אומרים מילה, לוחצים "אנטר", ואז את המילה הבאה. אפשר גם להדביק רשימה מוואטסאפ.</div></div>' +
    '<div class="row start"><button type="button" class="btn green" id="pSave">💾 שמירה</button></div><div class="status" id="pStatus" aria-live="polite"></div>' +
    '<h3>🎙️ מקליטים את המילים בקול שלכם (מומלץ)</h3>' +
    '<p class="note">הילד ישמע אתכם בזמן המשחק. לוחצים 🎙️, אומרים את המילה, והיא נשמרת לבד אחרי 3 שניות. מילה בלי הקלטה – ' + (ttsOK() ? "הטלפון מקריא אותה בקול ממוחשב (לפעמים הוא טועה בהגייה)." : "תוצג למבוגר כדי שיקריא אותה.") + '</p>' +
    '<div class="recs" id="recs"></div>' +
    '<h3>📲 שליחה להורים בכיתה</h3>' +
    '<p class="note">שולחים קישור שהמילים כבר בתוכו. מי שפותח אותו – הרשימה נטענת אצלו, בלי להקליד.</p>' +
    '<div class="row start"><a class="btn wa" id="pWa" target="_blank" rel="noopener">💬 שליחה בוואטסאפ</a><button type="button" class="btn alt sm" id="pCopy">🔗 העתקת הקישור</button></div>' +
    '<h3>🔄 מתחילים מחדש</h3><div class="row start"><button type="button" class="btn alt sm" id="pReset">איפוס הכוכבים</button></div>' +
    '</section>';
  $("pBack").onclick = () => go("");
  const st = $("pStatus");
  $("pSave").onclick = () => {
    S.cls = $("pCls").value.replace(/[<>"]/g, "").trim().slice(0, 24);
    const list = parseWords($("pWords").value);
    if (list.length) { S.words = list; S.example = false; ev("dict-list", list.length); }
    save(); paintRecs(); paintShare();
    st.textContent = list.length ? "✔️ נשמר: " + list.length + " מילים מוכנות למשחק." + (canRecord ? " עכשיו אפשר להקליט אותן למטה." : "") : "הכיתה נשמרה. כדי לשמור מילים, כתבו לפחות מילה אחת.";
  };
  function paintShare(){
    const list = S.example ? [] : S.words, wa = $("pWa"), cp = $("pCopy");
    if (!list.length) { wa.removeAttribute("href"); wa.onclick = e => { e.preventDefault(); st.textContent = "קודם שומרים מילים, ואז שולחים."; }; cp.onclick = wa.onclick; return; }
    const link = listLink(list);
    const msg = "שלום הורים" + (S.cls ? " של " + clsName(S.cls) : "") + " 😊\nאלה מילות ההכתבה של השבוע:\n" + list.join(", ") + "\n\nבקישור יש משחקים לתרגול (בונים מילה, מוצאים את הכתיב הנכון וכותבים במחברת), והרשימה כבר נטענת לבד:\n" +
      link + "&utm_source=whatsapp&utm_medium=class_parents&utm_campaign=school-dictation\n\nבחינם, בחסות BOOQLI 💛";
    wa.href = "https://wa.me/?text=" + encodeURIComponent(msg);
    wa.onclick = () => ev("dict-share", "whatsapp");
    cp.onclick = () => { const done = () => { cp.textContent = "✔️ הקישור הועתק"; ev("dict-share", "copy"); };
      try { navigator.clipboard.writeText(link).then(done, () => modal('<h2>הקישור</h2><p style="word-break:break-all;direction:ltr">' + esc(link) + '</p><button class="btn" data-a="x">סגירה</button>')); } catch (e) { modal('<h2>הקישור</h2><p style="word-break:break-all;direction:ltr">' + esc(link) + '</p><button class="btn" data-a="x">סגירה</button>'); } };
  }
  function paintRecs(){
    const box = $("recs");
    if (!canRecord) { box.innerHTML = '<p class="note">הדפדפן הזה לא מאפשר הקלטה. אפשר לנסות בכרום או בספארי מעודכן.</p>'; return; }
    const list = S.example ? [] : S.words;
    if (!list.length) { box.innerHTML = '<p class="note">קודם שומרים את המילים, ואז מקליטים.</p>'; return; }
    box.innerHTML = list.map((w, i) => { const has = REC.has(plain(w));
      return '<div class="rec" data-i="' + i + '"><span class="rd">' + esc(w) + '</span>' + (has ? '<span class="ok">✔️ מוקלט</span>' : '') +
        '<button type="button" class="r" aria-label="הקלטה: ' + esc(w) + '">🎙️</button><button type="button" class="pl" aria-label="השמעה"' + (has ? "" : " disabled") + '>▶️</button>' +
        (has ? '<button type="button" class="dl" aria-label="מחיקת ההקלטה">🗑️</button>' : '') + '</div>'; }).join("");
    box.querySelectorAll(".rec").forEach(row => { const w = list[+row.dataset.i];
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
        DB.put(plain(w), blob).then(() => { if (REC.has(plain(w))) URL.revokeObjectURL(REC.get(plain(w))); REC.set(plain(w), URL.createObjectURL(blob)); ev("dict-rec", "word"); paintRecs(); speak(w); })
          .catch(() => { st.textContent = "לא הצלחתי לשמור את ההקלטה (אולי גלישה פרטית?)."; }); };
      recorder.start(); btn.classList.add("on"); btn.textContent = "⏹️"; st.textContent = "🔴 מקליטים: אמרו \"" + w + "\"";
      record.t = setTimeout(() => { try { if (recorder && recorder.state === "recording") recorder.stop(); } catch (e) {} }, 3000);
    };
    if (micStream) return begin();
    navigator.mediaDevices.getUserMedia({audio: true}).then(s => { micStream = s; begin(); })
      .catch(() => { st.textContent = "צריך לאשר לדפדפן להשתמש במיקרופון (בהגדרות האתר)."; });
  }
  $("pReset").onclick = () => adult("האיפוס מוחק את הכוכבים וההתקדמות של כל המילים במכשיר הזה. המילים וההקלטות נשארות.", () => { S.stars = 0; S.m = {}; save(); st.textContent = "✔️ הכוכבים אופסו."; });
  paintRecs(); paintShare();
}

/* ================================ המשחקים ================================ */
function peek(w, ms){ $("peekword").textContent = w; $("peekbox").hidden = false; clearTimeout(peek.t); peek.t = setTimeout(() => { $("peekbox").hidden = true; }, ms || 1600); }
$("peekbox").onclick = () => { $("peekbox").hidden = true; };

function start(type){
  document.body.classList.add("in-game");
  G1 = {type, list: type === "test" ? shuffle(S.words) : pickRound(Math.min(6, S.words.length)), i: 0, earned: 0, peeks: 0, miss: 0, res: []};
  ev("dict-game", type);
  next();
}
function frame(bubble){
  app.innerHTML = '<section class="card">' +
    '<div class="pbar2"><button type="button" class="x" id="quit" aria-label="יציאה">✕</button><div class="dots">' +
    G1.list.map((_, i) => '<i class="' + (i < G1.i ? "on" : i === G1.i ? "now" : "") + '"></i>').join("") +
    '</div><span class="starpill">⭐ <span id="rs">' + G1.earned + '</span></span></div>' +
    '<div class="say"><img src="../../img/family/alef.webp" alt="" width="56" height="58"><div class="bubble" id="bub">' + bubble + '</div></div>' +
    '<div id="stage"></div></section>';
  $("quit").onclick = () => go("");
  return $("stage");
}
const bub = t => { $("bub").textContent = t; };
function next(){
  if (!G1) return;
  if (G1.i >= G1.list.length) return finish();
  G1.peeks = 0; G1.miss = 0;
  const w = G1.list[G1.i];
  ({build, pick, write, test})[G1.type](w);
  setTimeout(() => speak(w), 350);
}
function award(w, k, n){ G1.earned += n; S.stars += n; setBest(w, k, n); save(); const r = $("rs"); if (r) r.textContent = G1.earned; }
function nextBtn(){ const b = document.createElement("button"); b.type = "button"; b.className = "btn green wide"; b.style.marginTop = "12px";
  b.textContent = G1.i + 1 >= G1.list.length ? "סיום 🎉" : "למילה הבאה ←"; b.onclick = () => { G1.i++; next(); }; return b; }
function listen(w, opt){
  const d = document.createElement("div"); d.className = "listen";
  if (hasSound(w)) {
    d.innerHTML = '<button type="button" class="speak pulse" aria-label="לשמוע את המילה">🔊</button>' + (opt && opt.noPeek ? "" : '<button type="button" class="peek">👀 הצצה (עולה כוכב)</button>');
    d.querySelector(".speak").onclick = () => speak(w);
    const p = d.querySelector(".peek"); if (p) p.onclick = () => { G1.peeks++; peek(w); };
  } else {
    d.innerHTML = '<div class="adultread">🗣️ מבוגר מקריא את המילה. <button type="button" class="peek">למבוגר: הצגת המילה</button></div>';
    d.querySelector(".peek").onclick = () => peek(w, 2200);
  }
  return d;
}
const stars = n => "⭐".repeat(n);

/* --- 🧩 בונים מילה --- */
function build(w){
  const st = frame(G("תקשיב למילה וסדר את האותיות. מתחילים מימין!", "תקשיבי למילה וסדרי את האותיות. מתחילים מימין!", "מקשיבים למילה ומסדרים את האותיות. מתחילים מימין!"));
  st.appendChild(listen(w));
  const chars = [...plain(w)], need = chars.filter(isL);
  const slots = document.createElement("div"); slots.className = "slots rd wd"; const sl = [];
  chars.forEach(c => { const s = document.createElement("div"); if (c === " ") s.className = "slot gap"; else { s.className = "slot"; sl.push(s); } slots.appendChild(s); });
  st.appendChild(slots);
  const extra = []; need.forEach(c => (CONF[c] || []).forEach(a => { if (!need.includes(a)) extra.push(a); }));
  const pool = need.concat(shuffle([...new Set(extra)]).slice(0, need.length > 5 ? 3 : 2));
  const tiles = document.createElement("div"); tiles.className = "tiles"; st.appendChild(tiles);
  let pos = 0; const mark = () => sl.forEach((s, i) => s.classList.toggle("next", i === pos)); mark();
  shuffle(pool).forEach(c => { const t = document.createElement("button"); t.type = "button"; t.className = "tile rd wd"; t.textContent = c;
    t.onclick = () => {
      if (pos >= need.length) return;
      if (c === need[pos]) { sl[pos].textContent = c; t.classList.add("used"); pos++; mark(); SND.pop(); if (pos === need.length) done(); }
      else { G1.miss++; SND.soft(); t.classList.add("bad"); shake(t); setTimeout(() => t.classList.remove("bad"), 500); }
    }; tiles.appendChild(t); });
  function done(){ const n = Math.max(1, 3 - G1.miss - G1.peeks); award(w, "b", n); SND.win(); confetti(); speak(w);
    bub(PRAISE() + " " + stars(n)); tiles.remove(); st.appendChild(nextBtn()); }
}

/* --- 🔍 מי כתובה נכון? --- */
function pick(w){
  const st = frame(G("תקשיב למילה. איזו מהן כתובה נכון?", "תקשיבי למילה. איזו מהן כתובה נכון?", "מקשיבים למילה. איזו מהן כתובה נכון?"));
  st.appendChild(listen(w));
  const right = plain(w), box = document.createElement("div"); box.className = "choices"; st.appendChild(box);
  let tries = 0, over = false;
  shuffle([right].concat(wrongVariants(w))).forEach(o => { const b = document.createElement("button"); b.type = "button"; b.className = "choice"; b.innerHTML = '<span class="rd wd">' + esc(o) + '</span>';
    b.onclick = () => {
      if (over || b.classList.contains("off")) return;
      if (o === right) { over = true; b.classList.add("good"); const n = Math.max(1, (tries ? 1 : 3) - G1.peeks); award(w, "p", n); SND.win(); confetti(); bub(PRAISE() + " " + stars(n)); st.appendChild(nextBtn()); }
      else { tries++; SND.soft(); b.classList.add("off"); shake(b); bub(G("כמעט! תקשיב שוב ונסה עוד פעם", "כמעט! תקשיבי שוב ונסי עוד פעם", "כמעט! מקשיבים שוב ומנסים עוד פעם")); }
    }; box.appendChild(b); });
}

/* --- לוח כתיבה --- */
function makePad(){
  const wrap = document.createElement("div"); wrap.className = "pad";
  const cv = document.createElement("canvas"), hint = document.createElement("div"); hint.className = "padhint"; hint.textContent = G("כתוב כאן באצבע ✍️", "כתבי כאן באצבע ✍️", "כותבים כאן באצבע ✍️");
  wrap.append(cv, hint);
  const strokes = []; let cur = null; const ctx = cv.getContext("2d");
  const ink = (c, lw) => { c.strokeStyle = "#2B1526"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; };
  const line = (c, s) => { if (!s.length) return; c.beginPath(); c.moveTo(s[0][0], s[0][1]); if (s.length === 1) c.lineTo(s[0][0] + .1, s[0][1]); for (let i = 1; i < s.length; i++) c.lineTo(s[i][0], s[i][1]); c.stroke(); };
  function draw(){ const r = cv.getBoundingClientRect(), w = r.width, h = r.height; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#D6E4F5"; ctx.lineWidth = 2; [h * .3, h * .72].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); });
    ctx.strokeStyle = "#F08A9C"; ctx.beginPath(); ctx.moveTo(w - 24, 0); ctx.lineTo(w - 24, h); ctx.stroke();
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
function kbInput(id){ const i = document.createElement("input"); i.type = "text"; i.id = id; i.className = "kb"; i.setAttribute("lang", "he"); i.setAttribute("dir", "rtl");
  i.autocomplete = "off"; i.setAttribute("autocorrect", "off"); i.setAttribute("autocapitalize", "off"); i.spellcheck = false; i.setAttribute("aria-label", "כותבים את המילה"); return i; }
const sameWord = (a, b) => tight(a) === tight(b);
function diffHTML(typed, right){ const a = [...tight(typed)], b = [...tight(right)]; return a.map((c, i) => c === b[i] ? esc(c) : '<span class="wrong">' + esc(c) + '</span>').join("") + (a.length < b.length ? '<span class="wrong">_</span>' : "") || "—"; }
const compareBox = w => '<div class="big rd right">' + esc(plain(w)) + '</div><div class="cvw cv" aria-label="בכתב יד">' + esc(plain(w)) + '</div>';
function tools(pad){ const r = document.createElement("div"); r.className = "row";
  r.innerHTML = '<button type="button" class="btn alt sm">↶ ביטול קו</button><button type="button" class="btn alt sm">🧽 מחיקה</button>';
  r.children[0].onclick = () => pad.undo(); r.children[1].onclick = () => pad.clear(); return r; }

/* --- ✏️ כותבים במחברת --- */
function write(w){
  const st = frame(G("תקשיב וכתוב את המילה. אחר כך לוחצים \"סיימתי\".", "תקשיבי וכתבי את המילה. אחר כך לוחצים \"סיימתי\".", "מקשיבים וכותבים את המילה. אחר כך לוחצים \"סיימתי\"."));
  st.appendChild(listen(w));
  const area = document.createElement("div"); st.append(modes(paint), area);
  let tries = 0, won = false;
  function win(out, fb){ if (won) return; won = true;
    const n = Math.max(1, (tries === 0 ? 3 : tries === 1 ? 2 : 1) - G1.peeks); award(w, "w", n); SND.win(); confetti(); bub(PRAISE() + " " + stars(n));
    out.innerHTML = '<div class="verdict ok"><div class="big rd wd right">' + esc(plain(w)) + ' ✓</div>' + (fb ? '<div>' + fb + '</div>' : "") + '</div>'; out.appendChild(nextBtn()); }
  function paint(){
    if (won) return; area.innerHTML = "";
    const out = document.createElement("div");
    if (inputMode === "kb") {
      const inp = kbInput("kbW"), chk = document.createElement("button"); chk.type = "button"; chk.className = "btn purple wide"; chk.style.marginTop = "10px"; chk.textContent = "בדיקה ✓";
      chk.onclick = () => { const v = inp.value; if (!plain(v)) return;
        if (sameWord(v, w)) { chk.remove(); inp.disabled = true; win(out); }
        else { tries++; SND.soft(); out.innerHTML = '<div class="verdict no"><div class="big rd wd">' + diffHTML(v, w) + '</div><div>' + G("כמעט! מה שבאדום צריך תיקון. נסה שוב", "כמעט! מה שבאדום צריך תיקון. נסי שוב", "כמעט! מה שבאדום צריך תיקון. מנסים שוב") + '</div></div>'; inp.focus(); } };
      inp.addEventListener("keydown", e => { if (e.key === "Enter") chk.click(); });
      area.append(inp, chk, out); setTimeout(() => inp.focus(), 60);
    } else {
      const pad = makePad(), fin = document.createElement("button"); fin.type = "button"; fin.className = "btn purple wide"; fin.style.marginTop = "10px"; fin.textContent = "סיימתי ✓";
      fin.onclick = () => {
        if (pad.empty()) { bub("קודם כותבים, ואחר כך לוחצים \"סיימתי\" 🙂"); return; }
        out.innerHTML = '<div class="verdict cmp"><div>' + "👨‍👩‍👧 אבא ואמא: בדקו אם המילה כתובה נכון, ולחצו ✓ או \"עוד פעם\":" + '</div>' + compareBox(w) +
          '<div class="row"><button type="button" class="btn green sm" id="sY">✓ כתבתי נכון</button><button type="button" class="btn alt sm" id="sN">טעיתי, עוד פעם</button></div></div>';
        fin.disabled = true;
        $("sY").onclick = () => { fin.remove(); win(out); };
        $("sN").onclick = () => { tries++; SND.soft(); pad.clear(); out.innerHTML = ""; fin.disabled = false; bub("מסתכלים טוב על המילה, וכותבים שוב ✍️"); peek(plain(w), 1800); };
      };
      area.append(pad.el, tools(pad), fin, out);
    }
  }
  paint();
}

/* --- 📝 הכתבה אמיתית --- */
function test(w){
  const st = frame("מילה " + (G1.i + 1) + " מתוך " + G1.list.length + ". " + G("תקשיב, כתוב, ואז \"הבאה\".", "תקשיבי, כתבי, ואז \"הבאה\".", "מקשיבים, כותבים, ואז \"הבאה\"."));
  st.appendChild(listen(w, {noPeek: true}));
  const area = document.createElement("div"); st.append(modes(paint), area);
  const label = () => G1.i + 1 >= G1.list.length ? "סיימתי את ההכתבה 🎉" : "המילה הבאה ←";
  function paint(){
    area.innerHTML = "";
    const go2 = document.createElement("button"); go2.type = "button"; go2.className = "btn green wide"; go2.style.marginTop = "10px"; go2.textContent = label();
    if (inputMode === "kb") {
      const inp = kbInput("kbT"); inp.addEventListener("keydown", e => { if (e.key === "Enter") go2.click(); });
      go2.onclick = () => { if (!plain(inp.value)) { bub("קודם כותבים את המילה 🙂"); return; } G1.res.push({w, typed: inp.value, ok: sameWord(inp.value, w)}); G1.i++; next(); };
      area.append(inp, go2); setTimeout(() => inp.focus(), 60);
    } else {
      const pad = makePad();
      go2.onclick = () => { if (pad.empty()) { bub("קודם כותבים את המילה 🙂"); return; } G1.res.push({w, img: pad.image(), ok: null}); G1.i++; next(); };
      area.append(pad.el, tools(pad), go2);
    }
  }
  paint();
}

/* --- סוף סיבוב --- */
function finish(){
  const t = G1.type;
  if (t !== "test") {
    app.innerHTML = '<section class="card end"><div class="emo">🏆</div><h2 style="font-size:30px;color:#C13671">' + PRAISE() + '</h2>' +
      '<p class="note">' + G("אספת", "אספת", "אספתם") + ' בסיבוב הזה</p><div class="bigscore">⭐ ' + G1.earned + '</div>' +
      '<div class="row"><button type="button" class="btn green" id="again">עוד סיבוב</button><button type="button" class="btn alt" id="home">לכל המשחקים</button></div>' +
      (t === "build" ? '<p class="note" style="margin-top:12px">הבא בתור: 🔍 מי כתובה נכון?</p>' : t === "pick" ? '<p class="note" style="margin-top:12px">הבא בתור: ✏️ כותבים במחברת</p>' : '<p class="note" style="margin-top:12px">מוכנים? 📝 הכתבה אמיתית</p>') + '</section>';
    $("again").onclick = () => start(t); $("home").onclick = () => go("");
    SND.win(); confetti(); return;
  }
  const R = G1.res, game = G1;
  app.innerHTML = '<section class="card"><h2 style="font-size:28px;color:#C13671;text-align:center">תוצאות ההכתבה</h2><div id="score" style="text-align:center;margin:8px 0"></div>' + (R.some(r => r.img) ? '<div class="parentcheck">👨‍👩‍👧 <b>אבא ואמא:</b> בדקו אם המילים שנכתבו ביד כתובות נכון, וסמנו <b>✓</b> ליד מילה נכונה או <b>✗</b> ליד מילה עם טעות.</div>' : '') + '<div id="rows"></div>' +
    '<div class="row"><button type="button" class="btn green" id="again">עוד הכתבה</button><button type="button" class="btn alt" id="home">לכל המשחקים</button></div></section>';
  $("again").onclick = () => start("test"); $("home").onclick = () => go("");
  const rows = $("rows");
  R.forEach(it => {
    const d = document.createElement("div"); d.className = "res";
    d.innerHTML = (it.img ? '<img alt="מה שנכתב" src="' + it.img + '">' : '<div class="typed rd">' + esc(it.typed) + '</div>') +
      '<div class="w"><span class="rd wd">' + esc(plain(it.w)) + '</span><small></small></div><div class="mark">' + (it.img ? "" : it.ok ? "✅" : "❌") + '</div>';
    rows.appendChild(d); it.row = d;
    if (it.img) {
      d.querySelector("small").textContent = "אבא ואמא: נכון? סמנו ✓";
      const m = d.querySelector(".mark"), box = document.createElement("div"); box.className = "self";
      box.innerHTML = '<button type="button" class="y" aria-label="נכון" aria-pressed="false">✓</button><button type="button" class="n" aria-label="לא נכון" aria-pressed="false">✗</button>';
      const set = v => { if (game.done) return; it.ok = v; box.children[0].setAttribute("aria-pressed", v); box.children[1].setAttribute("aria-pressed", !v); paintScore(); };
      box.children[0].onclick = () => set(true); box.children[1].onclick = () => set(false); m.appendChild(box);
    } else if (!it.ok) d.querySelector("small").innerHTML = 'נכתב: <span class="wrong" style="color:#C13671">' + esc(it.typed) + '</span>';
  });
  function paintScore(){
    const good = R.filter(r => r.ok).length, left = R.filter(r => r.ok === null).length;
    $("score").innerHTML = '<div class="bigscore">' + good + '/' + R.length + '</div><p class="note">' +
      (left ? "אבא ואמא: סמנו ✓ או ✗ ליד כל מילה שנכתבה ביד (נשארו " + left + ")" : good === R.length ? G("מושלם! אתה מוכן להכתבה 🌟", "מושלם! את מוכנה להכתבה 🌟", "מושלם! מוכנים להכתבה 🌟") : "כל הכבוד על התרגול! את המילים שלא הצליחו כדאי לתרגל עוד.") + '</p>';
    if (!left && !game.done) { game.done = true; let earned = 0; R.forEach(r => { if (r.ok) { setBest(r.w, "w", 3); earned += 2; } }); S.stars += earned; save();
      ev("dict-test", good + "of" + R.length);
      $("score").insertAdjacentHTML("beforeend", '<span class="starpill">⭐ +' + earned + '</span>'); SND.win(); confetti(); }
  }
  paintScore();
}

/* ================================ דף להדפסה ================================ */
function sheet(){
  document.body.classList.add("sheet-mode"); app.hidden = true;
  const box = $("print"); box.hidden = false;
  const ws = S.words.slice(0, MAXW), nm = '<span class="cline"></span>', cl = S.cls ? esc(clsName(S.cls)) + ' · ' : '';
  const head = (t, s) => '<header class="sh-h"><div><b>' + t + '</b><small>מאמן ההכתבה · ' + cl + s + '</small></div><div class="nm">שֵׁם: ' + nm + '</div></header>';
  const foot = () => typeof sitePrintFooter === "function" ? sitePrintFooter("school-dictation", "", "../../img/logo.png") : "";
  const pages = [];
  for (let i = 0; i < ws.length; i += 11) {
    pages.push('<section class="pg">' + head("מתרגלים לכתוב", "מילות ההכתבה של השבוע") +
      '<p class="instr">קוראים את המילה, מסתכלים איך היא נראית בכתב יד, וכותבים אותה פעמיים בשורה.</p><div class="sb copyrows">' +
      ws.slice(i, i + 11).map(w => '<div><span class="rd">' + esc(plain(w)) + '</span><span class="cv">' + esc(plain(w)) + '</span><span class="ln"></span></div>').join("") + '</div>' + foot() + '</section>');
  }
  const n = Math.max(ws.length, 10);
  pages.push('<section class="pg">' + head("הכתבה", "מבוגר מקריא, ילד כותב") +
    '<p class="instr">המבוגר מקריא כל מילה (בסדר מעורבב), והילד כותב בשורה. בסוף בודקים יחד ומתקנים.</p><div class="sb"><div class="dictrows">' +
    Array.from({length: n}, (_, i) => '<div>' + (i + 1) + '.</div>').join("") + '</div>' +
    '<div class="answers"><b>למבוגר – סדר ההקראה:</b> ' + shuffle(ws).map((w, i) => (i + 1) + '. <span class="rd">' + esc(plain(w)) + '</span>').join(" · ") + '</div></div>' + foot() + '</section>');
  box.innerHTML = '<div class="pbar"><button type="button" class="btn alt sm" id="pBack">← חזרה למשחקים</button><button type="button" class="btn sm" id="pPrint">🖨️ הדפסה</button><button type="button" class="btn alt sm" id="pNew">🔄 סדר הקראה חדש</button></div>' +
    '<p class="pnote">' + (S.example ? "⚠️ אלה מילים לדוגמה. מכניסים את מילות השבוע באזור ההורים, ואז מדפיסים. " : "") + 'מדפיסים בגודל A4. מותר לשתף בחינם, עם הקרדיט של BOOQLI.</p>' +
    '<div class="pages" id="pages">' + pages.join("") + '</div>';
  $("pBack").onclick = () => go("");
  $("pPrint").onclick = () => { ev("dict-print", ws.length); window.print(); };
  $("pNew").onclick = sheet;
  fit(); ev("dict-sheet", "open");
}
function fit(){ const p = $("pages"); if (!p) return; const w = p.clientWidth || window.innerWidth; p.style.setProperty("--z", Math.min(1, (w - 4) / (210 * 3.7795)).toFixed(3)); }
window.addEventListener("resize", fit);
window.addEventListener("beforeprint", () => { const p = $("pages"); if (p) p.style.setProperty("--z", "1"); });
window.addEventListener("afterprint", fit);

/* ================================ התחלה ================================ */
(function boot(){
  const p = P(), w = p.get("w");
  if (w) {
    const list = parseWords(w.replace(/,/g, "\n"));
    const c = (p.get("c") || "").replace(/[<>"]/g, "").trim().slice(0, 24);
    if (list.length && (list.map(plain).join(",") !== S.words.map(plain).join(",") || S.example)) { incoming = list; incomingCls = c; }
    else if (c && !S.cls) { S.cls = c; save(); }
    p.delete("w"); p.delete("c"); ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(k => p.delete(k));
    const qs = p.toString();
    setTimeout(() => { try { if (typeof siteSetUrl === "function") siteSetUrl(base() + (qs ? "?" + qs : ""), false); } catch (e) {} }, 1600);
  }
  route();
  if (window.indexedDB) loadRecs().then(() => { if (!G1 && !P().get("sheet") && !P().get("p")) home(); });
})();
window.DICT_APP = {S: () => S, cur: () => G1 && G1.list[G1.i], plain, wrongVariants, parseWords};
})();
