/* =====================================================================
   ממציאים משחק עם הגן – המנוע המשותף (3.11.2026)
   משמש גם את עמוד היצירה (topics/game-maker/) וגם את עמוד המשחק להורים (g/).
   המשחק כולו נשמר בתוך הקישור (אחרי #), דחוס עם lz-string (lib/). אין שרת ואין מאגר.
   סוגי משחקים: q = חידון · m = זיכרון · w = מי אני?
   מבנה: {v:1, k, n:שם המשחק, tp:נושא, te:אימוג'י הנושא, g:שם הגן, d:תאריך, id:[{x,e}] הרעיונות, it:[...]}
     חידון: it = [{q:שאלה, a:תשובה נכונה, w:[תשובות לא נכונות], e}]
     זיכרון: it = [{x:מילה, e}]
     מי אני: it = [{x:התשובה, e, c:[רמזים]}]
   ===================================================================== */
window.GM = (function(){
  "use strict";
  var SABA = { name: "סַבָּאבּוּקְלִי", plain: "סבאבוקלי", spoken: "סַבָּא בּוּקְלִי" };
  var TYPES = {
    q: { ic: "❓", name: "חידון", sub: "סבאבוקלי שואל, וכל הגן עונה" },
    m: { ic: "🃏", name: "משחק זיכרון", sub: "הופכים קלפים ומוצאים זוגות" },
    w: { ic: "🕵️", name: "מי אני?", sub: "רמזים, ומנחשים מי זה" }
  };

  /* ---------- עזרים ---------- */
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
  function reduced(){ return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- הקול של סבאבוקלי ---------- */
  var voiceOn = true;
  try { voiceOn = localStorage.getItem("booqli_gm_voice") !== "0"; } catch (e) {}
  function setVoice(on){ voiceOn = !!on; try { localStorage.setItem("booqli_gm_voice", on ? "1" : "0"); } catch (e) {} if (!on) stop(); }
  function stop(){ try { speechSynthesis.cancel(); } catch (e) {} }
  // מחזיר Promise שנגמר כשסבאבוקלי סיים לדבר (או אחרי זמן סביר, אם אין קול במכשיר)
  /* (3.11.2026, שמש) סבאבוקלי מדבר בקול של גבר. אם יש במכשיר כמה קולות גבר בעברית – נבחר אחד באקראי
     בכל משחק חדש (ונשאר אותו קול לאורך המשחק). אם אין במכשיר קול גבר בעברית (למשל אייפון/מק – רק "כרמית"),
     מורידים את גובה הקול כדי שיישמע עמוק יותר. */
  var MALE = /asaf|avri|ariel|david|male|\bm\d|גבר/i, FEMALE = /female|carmit|hila|hedva|zohar|woman|\bf\d|אישה/i;
  var VOICE = null, VOICE_MALE = false;
  function heVoices(){ try { return speechSynthesis.getVoices().filter(function(v){ return /^(he|iw)/i.test(v.lang); }); } catch (e) { return []; } }
  function pickVoice(){
    var all = heVoices(); if (!all.length) { VOICE = null; return null; }
    var men = all.filter(function(v){ return MALE.test(v.name) && !FEMALE.test(v.name); });
    VOICE_MALE = men.length > 0;
    VOICE = VOICE_MALE ? men[Math.floor(Math.random() * men.length)] : all[0];
    return VOICE;
  }
  function voiceName(){ if (!VOICE) pickVoice(); return VOICE ? VOICE.name + (VOICE_MALE ? "" : " (מונמך)") : ""; }
  function say(text){
    return new Promise(function(done){
      var t = String(text || "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").replace(/סבאבוקלי/g, SABA.spoken).trim();
      var fallback = setTimeout(done, Math.min(9000, 900 + t.length * 75));
      if (!voiceOn || !t || !window.speechSynthesis) return;
      try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(t);
        if (!VOICE) pickVoice();
        u.lang = "he-IL";
        if (VOICE) u.voice = VOICE;
        u.pitch = VOICE_MALE ? 0.9 : 0.5;   // בלי קול גבר – קול עמוק יותר
        u.rate = VOICE_MALE ? 0.95 : 0.88;
        u.onend = function(){ clearTimeout(fallback); setTimeout(done, 150); };
        speechSynthesis.speak(u);
      } catch (e) {}
    });
  }
  if (window.speechSynthesis) try { speechSynthesis.getVoices(); speechSynthesis.addEventListener("voiceschanged", function(){ if (!VOICE) pickVoice(); }); } catch (e) {}

  /* ---------- צלילים קטנים (נבנים בדפדפן, בלי קבצים) ---------- */
  var AC = null;
  function tone(freqs, dur, type, vol){
    if (!voiceOn) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var t0 = AC.currentTime;
      freqs.forEach(function(f, i){
        var o = AC.createOscillator(), g = AC.createGain();
        o.type = type || "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + i * dur); g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + i * dur + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
        o.connect(g); g.connect(AC.destination); o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.05);
      });
    } catch (e) {}
  }
  var sound = {
    pop: function(){ tone([520, 880], 0.07, "triangle", 0.2); },
    ding: function(){ tone([660, 990], 0.12, "sine", 0.2); },
    soft: function(){ tone([330, 280], 0.12, "sine", 0.12); },
    laugh: function(){ tone([620, 520, 620, 520], 0.08, "square", 0.06); },
    tada: function(){ tone([523, 659, 784, 1046], 0.13, "triangle", 0.2); }
  };

  /* ---------- קונפטי ---------- */
  function confetti(host){
    if (reduced() || !host) return;
    var box = document.createElement("div"); box.className = "gm-confetti"; box.setAttribute("aria-hidden", "true");
    var cols = ["#FF56C2", "#3AA7F0", "#FFD84D", "#6F988B", "#B05BE8", "#FF9A2E"];
    for (var i = 0; i < 70; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%"; p.style.background = pick(cols);
      p.style.animationDelay = (Math.random() * 0.6) + "s"; p.style.animationDuration = (1.6 + Math.random() * 1.4) + "s";
      p.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      box.appendChild(p);
    }
    host.appendChild(box); setTimeout(function(){ box.remove(); }, 3600);
  }

  /* ---------- אימוג'י לפי מילה_ (ניחוש ראשון, הגננת יכולה להחליף) ---------- */
  var EMO = {
    "עלה": "🍂", "עלים": "🍂", "שלכת": "🍂", "גשם": "🌧️", "טיפה": "💧", "טיפות": "💧", "שלולית": "💧", "ענן": "☁️", "עננים": "☁️", "ברק": "⚡", "רעם": "⚡", "קשת": "🌈", "שלג": "❄️", "רוח": "🌬️", "מטרייה": "☂️", "מטריה": "☂️", "מגפיים": "👢", "מעיל": "🧥", "כפפות": "🧤", "צעיף": "🧣", "כובע": "🧢", "נחליאלי": "🐦", "ציפור": "🐦", "ציפורים": "🐦", "חצב": "🌱", "פטריה": "🍄", "פטרייה": "🍄", "בלוט": "🌰", "קר": "🥶", "חם": "🥵",
    "חנוכייה": "🕎", "חנוכיה": "🕎", "נר": "🕯️", "נרות": "🕯️", "סופגנייה": "🍩", "סופגניה": "🍩", "סופגניות": "🍩", "סביבון": "🌀", "לביבה": "🥔", "לביבות": "🥔", "שמן": "🫒", "פך": "🫙", "מכבים": "🛡️", "דמי": "🎁", "מתנה": "🎁", "מתנות": "🎁",
    "אריה": "🦁", "פיל": "🐘", "ג'ירפה": "🦒", "גירפה": "🦒", "קוף": "🐒", "דג": "🐟", "דגים": "🐟", "פרפר": "🦋", "כלב": "🐶", "חתול": "🐱", "סוס": "🐴", "פרה": "🐮", "תרנגולת": "🐔", "ביצה": "🥚", "צב": "🐢", "ארנב": "🐰", "נמר": "🐯", "דוב": "🐻", "צפרדע": "🐸", "נחש": "🐍", "תנין": "🐊", "דבורה": "🐝", "נמלה": "🐜", "חילזון": "🐌", "ינשוף": "🦉", "ברווז": "🦆", "כבשה": "🐑", "עכבר": "🐭", "חזיר": "🐷", "זברה": "🦓", "קנגורו": "🦘", "פינגווין": "🐧", "לווייתן": "🐋", "לוויתן": "🐋", "דולפין": "🐬", "תמנון": "🐙", "סרטן": "🦀", "צדף": "🐚", "כריש": "🦈", "חד": "🦄", "דינוזאור": "🦖",
    "אדום": "🔴", "צהוב": "🟡", "כחול": "🔵", "ירוק": "🟢", "כתום": "🟠", "סגול": "🟣", "ורוד": "🩷", "לבן": "⚪", "שחור": "⚫", "חום": "🟤", "צבע": "🎨", "צבעים": "🎨", "מכחול": "🖌️",
    "תפוח": "🍎", "בננה": "🍌", "ענבים": "🍇", "גזר": "🥕", "מלפפון": "🥒", "עגבנייה": "🍅", "עגבניה": "🍅", "לחם": "🍞", "חלב": "🥛", "תות": "🍓", "תפוז": "🍊", "אבטיח": "🍉", "לימון": "🍋", "אגס": "🍐", "גבינה": "🧀", "פיצה": "🍕", "גלידה": "🍦", "עוגה": "🎂", "עוגייה": "🍪", "עוגיה": "🍪", "ממתק": "🍬", "שוקולד": "🍫", "מים": "💧", "תירס": "🌽", "פלפל": "🫑", "אננס": "🍍", "רימון": "🍎", "דבש": "🍯", "פסטה": "🍝", "מרק": "🍲",
    "אמא": "👩", "אבא": "👨", "סבא": "👴", "סבתא": "👵", "אח": "👦", "אחות": "👧", "תינוק": "👶", "תינוקת": "👶", "משפחה": "👨‍👩‍👧", "בית": "🏠", "חיבוק": "🤗", "אהבה": "❤️", "לב": "❤️",
    "כבאי": "👩‍🚒", "כבאית": "🚒", "רופא": "👩‍⚕️", "רופאה": "👩‍⚕️", "שוטר": "👮", "שוטרת": "👮", "טבח": "👨‍🍳", "טבחית": "👨‍🍳", "גננת": "👩‍🏫", "מורה": "👩‍🏫", "צייר": "🎨", "ציירת": "🎨", "דוור": "📮", "טייס": "👨‍✈️", "חקלאי": "👨‍🌾", "וטרינר": "🐾", "זמרת": "🎤", "זמר": "🎤", "נגר": "🔨", "אסטרונאוט": "👨‍🚀",
    "מכונית": "🚗", "אוטו": "🚗", "אוטובוס": "🚌", "רכבת": "🚂", "מטוס": "✈️", "אופניים": "🚲", "ספינה": "🚢", "סירה": "⛵", "מסוק": "🚁", "טרקטור": "🚜", "משאית": "🚚", "אופנוע": "🏍️", "רמזור": "🚦", "גלגל": "🛞", "גלגלים": "🛞",
    "ים": "🌊", "גל": "🌊", "גלים": "🌊", "חול": "🏖️", "חוף": "🏖️", "כוכב": "⭐", "כוכבים": "⭐", "שמש": "☀️", "ירח": "🌙", "טיל": "🚀", "חללית": "🚀", "חייזר": "👽", "כדור": "⚽", "עולם": "🌍", "מאדים": "🔴", "שביט": "☄️",
    "עיניים": "👀", "עין": "👁️", "אוזניים": "👂", "אוזן": "👂", "אף": "👃", "פה": "👄", "ידיים": "🙌", "יד": "✋", "רגליים": "🦵", "רגל": "🦶", "שיניים": "🦷", "שן": "🦷", "שיער": "💇", "בטן": "🫃", "מוח": "🧠",
    "פרח": "🌸", "פרחים": "🌸", "עץ": "🌳", "עצים": "🌳", "דשא": "🌿", "הר": "⛰️", "נהר": "🏞️", "אש": "🔥", "מדורה": "🔥", "ספר": "📖", "ספרים": "📖", "שיר": "🎵", "מוזיקה": "🎵", "תוף": "🥁", "בלון": "🎈", "בלונים": "🎈", "כתר": "👑", "מסכה": "🎭", "דגל": "🇮🇱", "שעון": "⏰", "מפתח": "🔑", "קסם": "🪄"
  };
  function guessEmoji(text, fallback){
    var w = String(text || "").replace(/[^֐-׿'\s]/g, " ").split(/\s+/).filter(Boolean);
    for (var i = 0; i < w.length; i++) {
      var x = w[i], y = x.replace(/^[והלבמש](?=[\u0590-\u05FF]{2,})/, ""), z = y.replace(/^[והלבמש](?=[\u0590-\u05FF]{2,})/, "");
      if (EMO[x]) return EMO[x]; if (EMO[y]) return EMO[y]; if (EMO[z]) return EMO[z];
    }
    return fallback || "✨";
  }
  var PICK_EMOJI = ["✨","⭐","❤️","🌈","☀️","🌙","🌧️","❄️","🍂","🌸","🌳","🍎","🍌","🍓","🍩","🍕","🎂","🕎","🕯️","🎁","🎈","🎨","🎵","📖","🏠","🚗","🚌","🚂","✈️","🚀","🐶","🐱","🦁","🐘","🐟","🦋","🐸","🐢","🐦","🦄","👩","👨","👶","👴","👵","👀","👂","🦷","🙌","⚽","🪄"];

  /* ---------- שמות של ילדים: אסור במשחק (בודקים ומזהירים בעדינות) ----------
     רק שמות שאינם גם מילה רגילה (בלי טל, גל, אור, שחר, ים, תמר, אביב, סתיו, צבי, יעל וכו'), כדי שלא נפריע סתם. */
  var KID_NAMES = ("נועה מאיה אביגיל אלה מיכל רוני עלמה הילה ליה ליאל אגם_ אורי יונתן איתי איתמר נועם עידו אריאל דניאל יהונתן אליה " +
    "יואב יהלי עומרי אליאור אלמוג הלל ליאור מיקה אמה אנה ליבי הדס רותם_ יובל עמית אדם מתן נדב דוד משה אברהם יוסף שרה רחל רבקה לאה " +
    "דנה ענבר ליאן ליהי יהל אופיר אוריין אריה_ בארי גאיה גפן_ הראל זוהר_ חנה טליה יעלי יערה כנרת_ לירון לינוי מאור_ מיכאל מעיין_ נגה_ " +
    "נוגה סהר_ עדי עידן ענבל פלג_ קורל רוי רועי שילה שלמה_ תהל תאיר תום תומר אלון_ אסף בן_ אביתר אביה אלאור אלעד אמיר אריאלה בתיה גלעד " +
    "דבורה_ הודיה הדר_ זיו_ חיים_ טוהר_ יאיר יאנה ינאי יעקב ישי לוטם_ לירי מאיר מורן מילה נבו נויה נטעלי סול עדיאל עמרי פזית צליל_ קרן_ רז_ " +
    "רוני רונה רעות_ שגיא שי_ שקד_ תמרה אוהד אורן_ ארבל אלמה אלין אליאנה גילי דור_ הגר יוני ליאם לביא_ מיה מיקי נעמה ניצן סתו_ עלמא").split(/\s+/)
    .filter(function(n){ return n && n.slice(-1) !== "_"; });
  function kidName(text){
    var w = String(text || "").replace(/[^֐-׿\s]/g, " ").split(/\s+/);
    for (var i = 0; i < w.length; i++) {
      var x = w[i].replace(/^[וה](?=[֐-׿]{3,})/, "");
      if (KID_NAMES.indexOf(w[i]) > -1) return w[i];
      if (KID_NAMES.indexOf(x) > -1) return x;
    }
    return "";
  }

  /* ---------- הקישור: המשחק כולו בתוך הקישור ---------- */
  function clean(s, max){ return String(s == null ? "" : s).replace(/[\u0000-\u001F<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max || 80); }
  function encode(game){ return "1" + LZString.compressToEncodedURIComponent(JSON.stringify(game)); }
  function decode(code){
    try {
      code = String(code || "").replace(/^#/, "");
      if (code.charAt(0) !== "1") return null;
      var g = JSON.parse(LZString.decompressFromEncodedURIComponent(code.slice(1)) || "null");
      return sanitize(g);
    } catch (e) { return null; }
  }
  // כל מה שמגיע מקישור – מנקים ומגבילים (גם אם מישהו ערך אותו ביד)
  function sanitize(g){
    if (!g || typeof g !== "object" || !TYPES[g.k] || !Array.isArray(g.it)) return null;
    var out = { v: 1, k: g.k, n: clean(g.n, 60), tp: clean(g.tp, 40), te: clean(g.te, 8), g: clean(g.g, 40), d: clean(g.d, 10), id: [], it: [] };
    (Array.isArray(g.id) ? g.id : []).slice(0, 20).forEach(function(x){ if (x && x.x) out.id.push({ x: clean(x.x, 40), e: clean(x.e, 8) }); });
    g.it.slice(0, 10).forEach(function(x){
      if (!x) return;
      if (g.k === "q" && x.q && x.a) out.it.push({ q: clean(x.q, 120), a: clean(x.a, 50), w: (Array.isArray(x.w) ? x.w : []).slice(0, 2).map(function(w){ return clean(w, 50); }).filter(Boolean), e: clean(x.e, 8) });
      if (g.k === "m" && x.x) out.it.push({ x: clean(x.x, 30), e: clean(x.e, 8) });
      if (g.k === "w" && x.x) out.it.push({ x: clean(x.x, 40), e: clean(x.e, 8), c: (Array.isArray(x.c) ? x.c : []).slice(0, 4).map(function(c){ return clean(c, 90); }).filter(Boolean) });
    });
    if (g.k === "q") out.it = out.it.filter(function(x){ return x.w.length; });
    if (g.k === "w") out.it = out.it.filter(function(x){ return x.c.length; });
    var min = g.k === "m" ? 2 : 1;
    return out.it.length >= min ? out : null;
  }

  /* ---------- המשחק עצמו ---------- */
  var PRAISE = ["כל הכבוד!", "נכון מאוד!", "מצוין!", "יופי!", "בדיוק!", "אלופים!"];
  function play(root, game, opt){
    opt = opt || {};
    var stopped = false;
    root.innerHTML = ""; root.className = "gm-play gm-k-" + game.k;
    var head = document.createElement("div"); head.className = "gm-phead";
    head.innerHTML = '<span class="gm-pt">' + esc(TYPES[game.k].ic + " " + (game.n || TYPES[game.k].name)) + '</span>' +
      (game.g ? '<span class="gm-pg">🏫 המשחק של גן ' + esc(game.g) + '</span>' : "") + '<span class="gm-pp" aria-live="polite"></span>';
    var area = document.createElement("div"); area.className = "gm-area";
    root.appendChild(head); root.appendChild(area);
    var prog = head.querySelector(".gm-pp");
    function win(){
      if (stopped) return;
      sound.tada(); confetti(root);
      var w = document.createElement("div"); w.className = "gm-win";
      w.innerHTML = '<div class="gm-win-e" aria-hidden="true">🏆</div><h3>כל הכבוד' + (game.g ? ", גן " + esc(game.g) : "") + '!</h3><p>סיימתם את המשחק שהמצאתם בעצמכם!</p><div class="gm-win-x"></div>';
      area.innerHTML = ""; area.appendChild(w);
      say("כל הכבוד! סיימתם את המשחק שהמצאתם בעצמכם!");
      if (opt.onWin) opt.onWin(w.querySelector(".gm-win-x"));
    }
    var api = { stop: function(){ stopped = true; stop(); } };

    if (game.k === "q") {
      var qs = shuffle(game.it), qi = 0;
      var showQ = function(){
        if (stopped) return;
        if (qi >= qs.length) return win();
        var it = qs[qi], opts = shuffle([it.a].concat(it.w));
        prog.textContent = "שאלה " + (qi + 1) + " מתוך " + qs.length;
        area.innerHTML = '<div class="gm-q"><div class="gm-q-e" aria-hidden="true">' + esc(game.te || "❓") + '</div><h3 class="gm-q-t">' + esc(it.q) + '</h3>' +
          '<button type="button" class="gm-say" aria-label="להקריא שוב">🔊 להקריא</button>' +
          '<div class="gm-opts">' + opts.map(function(o, i){ return '<button type="button" class="gm-opt" data-i="' + i + '"><span class="gm-ol">' + "אבג"[i] + '</span>' + esc(o) + '</button>'; }).join("") + '</div>' +
          '<div class="gm-fb" aria-live="polite"></div></div>';
        var read = function(){ say(it.q + ". " + opts.map(function(o, i){ return "אבג"[i] + ": " + o; }).join(". ")); };
        area.querySelector(".gm-say").onclick = read; read();
        var done = false, fb = area.querySelector(".gm-fb");
        area.querySelectorAll(".gm-opt").forEach(function(b){
          b.onclick = function(){
            if (done) return;
            var o = opts[+b.getAttribute("data-i")];
            if (o === it.a) {
              done = true; b.classList.add("ok"); sound.ding(); var p = pick(PRAISE); fb.textContent = "🎉 " + p + " " + it.a; say(p + " " + it.a);
              setTimeout(function(){ qi++; showQ(); }, 2200);
            } else {
              b.classList.add("no"); b.disabled = true; sound.soft(); fb.textContent = "כמעט! נסו שוב 🙂"; say("כמעט! נסו שוב");
            }
          };
        });
      };
      showQ();
    }

    if (game.k === "m") {
      var cards = shuffle(game.it.concat(game.it).map(function(x, i){ return { x: x.x, e: x.e, id: x.x + "|" + x.e }; }));
      var n = game.it.length, found = 0, open = [], lock = false;
      var cols = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 4, 7: 5, 8: 4 }[n] || 4;
      prog.textContent = "זוגות: 0 מתוך " + n;
      area.innerHTML = '<p class="gm-m-help">הופכים שני קלפים. אותו ציור? מצאתם זוג!</p><div class="gm-grid" style="--cols:' + cols + '">' +
        cards.map(function(c, i){ return '<button type="button" class="gm-card" data-i="' + i + '" aria-label="קלף ' + (i + 1) + '"><span class="gm-back" aria-hidden="true">✨</span><span class="gm-front"><b>' + esc(c.e || "✨") + '</b><small>' + esc(c.x) + '</small></span></button>'; }).join("") + '</div>';
      say("משחק זיכרון! הופכים שני קלפים ומוצאים זוגות.");
      area.querySelectorAll(".gm-card").forEach(function(b){
        b.onclick = function(){
          if (lock || b.classList.contains("up") || stopped) return;
          var c = cards[+b.getAttribute("data-i")];
          b.classList.add("up"); b.setAttribute("aria-label", c.x); sound.pop(); say(c.x); open.push(b);
          if (open.length < 2) return;
          lock = true;
          var a = cards[+open[0].getAttribute("data-i")], z = cards[+open[1].getAttribute("data-i")];
          if (a.id === z.id) {
            found++; prog.textContent = "זוגות: " + found + " מתוך " + n;
            setTimeout(function(){ open.forEach(function(x){ x.classList.add("got"); }); open = []; lock = false; sound.ding(); if (found === n) setTimeout(win, 700); else say(pick(PRAISE) + " מצאתם זוג!"); }, 500);
          } else {
            setTimeout(function(){ open.forEach(function(x){ x.classList.remove("up"); x.setAttribute("aria-label", "קלף"); }); open = []; lock = false; }, 1300);
          }
        };
      });
    }

    if (game.k === "w") {
      var ws = shuffle(game.it), wi = 0, all = game.it;
      var showW = function(){
        if (stopped) return;
        if (wi >= ws.length) return win();
        var it = ws[wi], shown = 1;
        var others = shuffle(all.filter(function(x){ return x.x !== it.x; })).slice(0, 2);
        var opts = shuffle([it].concat(others));
        prog.textContent = "חידה " + (wi + 1) + " מתוך " + ws.length;
        area.innerHTML = '<div class="gm-w"><div class="gm-w-q" aria-hidden="true">🕵️</div><h3>מִי אֲנִי?</h3><ol class="gm-clues"></ol>' +
          '<div class="gm-w-btns"><button type="button" class="gm-more">💡 רמז נוסף</button><button type="button" class="gm-say">🔊 להקריא</button></div>' +
          '<p class="gm-w-ask">מי זה? ננחש ביחד, ואז לוחצים:</p>' +
          '<div class="gm-opts gm-wopts">' + opts.map(function(o, i){ return '<button type="button" class="gm-opt" data-i="' + i + '"><b aria-hidden="true">' + esc(o.e || "✨") + '</b>' + esc(o.x) + '</button>'; }).join("") + '</div>' +
          '<div class="gm-fb" aria-live="polite"></div></div>';
        var ol = area.querySelector(".gm-clues"), more = area.querySelector(".gm-more");
        var render = function(){ ol.innerHTML = it.c.slice(0, shown).map(function(c){ return "<li>" + esc(c) + "</li>"; }).join(""); more.hidden = shown >= it.c.length; };
        var readAll = function(){ say("מי אני? " + it.c.slice(0, shown).join(". ")); };
        render(); readAll();
        more.onclick = function(){ shown++; render(); sound.pop(); say(it.c[shown - 1]); };
        area.querySelector(".gm-say").onclick = readAll;
        var done = false, fb = area.querySelector(".gm-fb");
        area.querySelectorAll(".gm-wopts .gm-opt").forEach(function(b){
          b.onclick = function(){
            if (done) return;
            var o = opts[+b.getAttribute("data-i")];
            if (o.x === it.x) {
              done = true; b.classList.add("ok"); sound.ding(); shown = it.c.length; render();
              fb.innerHTML = '<span class="gm-big" aria-hidden="true">' + esc(it.e || "✨") + '</span> ' + esc(pick(PRAISE) + " אני " + it.x + "!");
              say(pick(PRAISE) + " אני " + it.x);
              setTimeout(function(){ wi++; showW(); }, 2600);
            } else { b.classList.add("no"); b.disabled = true; sound.soft(); fb.textContent = "כמעט! נסו שוב 🙂"; say("כמעט! נסו שוב"); }
          };
        });
      };
      showW();
    }
    return api;
  }

  /* ---------- סיכום להדפסה ---------- */
  function summary(game, url, logo){
    var t = TYPES[game.k], body = "";
    if (game.k === "q") body = '<ol class="s-list">' + game.it.map(function(x){ return '<li><b>' + esc(x.e) + " " + esc(x.q) + '</b><br>✔️ ' + esc(x.a) + (x.w.length ? ' <span class="s-w">· תשובות מבלבלות: ' + esc(x.w.join(" / ")) + '</span>' : "") + '</li>'; }).join("") + '</ol>';
    if (game.k === "m") body = '<div class="s-cards">' + game.it.map(function(x){ return '<span><b>' + esc(x.e) + '</b>' + esc(x.x) + '</span>'; }).join("") + '</div>';
    if (game.k === "w") body = '<ol class="s-list">' + game.it.map(function(x){ return '<li><b>' + esc(x.e) + " " + esc(x.x) + '</b><br>' + x.c.map(esc).join(" · ") + '</li>'; }).join("") + '</ol>';
    var ideas = game.id && game.id.length ? '<h3>💡 הרעיונות שלנו על ' + esc(game.tp) + '</h3><div class="s-ideas">' + game.id.map(function(x){ return '<span>' + esc(x.e) + " " + esc(x.x) + '</span>'; }).join("") + '</div>' : "";
    var d = game.d ? game.d.split("-").reverse().join(".") : "";
    return '<div class="s-page">' +
      '<div class="s-top"><img src="' + esc(String(logo || "").replace(/logo\.png$/, "logo-dark.png")) + '" alt="BOOQLI" style="height:12mm;width:auto"><span>🏫 גן ' + esc(game.g || "___") + (d ? " · " + d : "") + '</span></div>' +
      '<h1>' + esc(t.ic) + " " + esc(game.n || t.name) + '</h1>' +
      '<p class="s-sub">המשחק שהמצאנו יחד בגן: ' + esc(t.name) + ' על ' + esc(game.te) + " " + esc(game.tp) + '. הילדים חשבו על הרעיונות, ' + (game.k === "q" ? "על השאלות ועל התשובות" : game.k === "w" ? "ועל הרמזים" : "ובחרו את הציורים") + '.</p>' +
      ideas + '<h3>' + esc(t.ic) + ' ' + (game.k === "q" ? "השאלות שלנו" : game.k === "w" ? "החידות שלנו" : "הקלפים שלנו") + '</h3>' + body +
      (url ? '<div class="s-home"><div class="s-qr">' + (typeof siteQR === "function" ? siteQR(url) : "") + '</div><div><b>📲 ממשיכים לשחק בבית!</b><br>סורקים את הקוד בטלפון, והמשחק שהמצאנו נפתח. תנו לילדים להיות המורים ולהסביר לכם מה למדנו 😊</div></div>' : "") +
      (typeof sitePrintFooter === "function" ? sitePrintFooter("game-maker", "", logo || "../../img/logo.png") : "") + '</div>';
  }

  return { SABA: SABA, TYPES: TYPES, esc: esc, shuffle: shuffle, pick: pick, say: say, stop: stop, pickVoice: pickVoice, voiceName: voiceName, setVoice: setVoice, voice: function(){ return voiceOn; },
    sound: sound, confetti: confetti, guessEmoji: guessEmoji, PICK_EMOJI: PICK_EMOJI, kidName: kidName, clean: clean,
    encode: encode, decode: decode, sanitize: sanitize, play: play, summary: summary };
})();
