/* =====================================================================
   הסטודיו של סבאבוקלי – ממציאים משחק עם כל הגן (3.11.2026)
   שלבים: intro → topic → ideas → type → fill → build → play → finish
   הטיוטה נשמרת בדפדפן (booqli_gm_draft), והמשחקים שהגן המציא – ב-booqli_gm_list.
   ===================================================================== */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var esc = GM.esc, pick = GM.pick, T = GM.TYPES;
  var BODY = $("body"), BUBBLE = $("bubble"), SABA_IMG = $("saba"), WAIT = $("waitTip");
  var SITE_URL = "https://games.booqli.ai/";

  /* ---------- נושאים מוכנים ---------- */
  var TOPICS = [
    { e: "🍂", n: "סתיו", say: "סתיו! העלים עפים לי על המשקפיים!", s: ["עלי שלכת", "גשם ראשון", "נחליאלי", "מגפיים", "מטרייה", "רוח", "ציפורים נודדות", "חצב"] },
    { e: "🌧️", n: "חורף", say: "חורף! איפה שמתי את המטרייה שלי?", s: ["גשם", "שלולית", "ענן", "ברק", "מעיל", "כפפות", "קשת בענן", "שלג"] },
    { e: "🕎", n: "חנוכה", say: "חנוכה! אני כבר מריח סופגניות!", s: ["חנוכייה", "סופגנייה", "סביבון", "נרות", "לביבות", "פך שמן", "המכבים", "דמי חנוכה"] },
    { e: "🐾", n: "חיות", say: "חיות! אני הכי אוהב חדי קרן. וגם פילים!", s: ["אריה", "פיל", "ג'ירפה", "קוף", "דג", "פרפר", "כלב", "צב"] },
    { e: "🎨", n: "צבעים", say: "צבעים! ראיתם? העניבה שלי ורודה!", s: ["אדום", "צהוב", "כחול", "ירוק", "כתום", "סגול", "ורוד", "חום"] },
    { e: "🍎", n: "פירות וירקות", say: "פירות וירקות! ממממ, עכשיו אני רעב!", s: ["תפוח", "בננה", "ענבים", "גזר", "מלפפון", "תות", "עגבנייה", "אבטיח"] },
    { e: "👨‍👩‍👧", n: "המשפחה שלי", say: "משפחה! גם לי יש נכדים. הרבה נכדים!", s: ["אמא", "אבא", "סבא", "סבתא", "אח", "אחות", "תינוק", "בית"] },
    { e: "👩‍🚒", n: "מקצועות", say: "מקצועות! אני ממציא משחקים, זה המקצוע שלי!", s: ["כבאית", "רופאה", "שוטר", "טבח", "גננת", "חקלאי", "טייס", "דוור"] },
    { e: "🚗", n: "תחבורה", say: "תחבורה! טוּט טוּט, כולם לעלות!", s: ["מכונית", "אוטובוס", "רכבת", "מטוס", "אופניים", "ספינה", "מסוק", "טרקטור"] },
    { e: "🌊", n: "הים", say: "ים! אוי, שכחתי את בגד הים בבית!", s: ["דג", "צדף", "כוכב ים", "תמנון", "לווייתן", "סרטן", "גלים", "חול"] },
    { e: "🚀", n: "החלל", say: "חלל! שלוש, שתיים, אחת... המראה!", s: ["שמש", "ירח", "כוכבים", "טיל", "אסטרונאוט", "כדור הארץ", "חייזר", "מאדים"] },
    { e: "🙌", n: "הגוף שלנו", say: "הגוף שלנו! מי יודע איפה האף שלי?", s: ["עיניים", "אוזניים", "אף", "פה", "ידיים", "רגליים", "לב", "שיניים"] }
  ];
  var IDEA_REACT = ["וואו!", "רעיון של אלופים!", "את זה לא ידעתי!", "איזה גן חכם!", "עוד! עוד!", "מעולה!", "יופי של רעיון!", "אני רושם!", "בּוּם! רעיון!"];
  var WAIT_TIPS = [
    "בזמן שהגננת כותבת: כולם מתופפים על הברכיים 🥁",
    "מי עושה את הפרצוף הכי מצחיק? 🤪",
    "לוחשים כולם ביחד: אַבְּרָה... קַדַבְּרָה! 🪄",
    "מחפשים בגן משהו בצבע ורוד! 🩷",
    "עושים קול של החיה שאתם הכי אוהבים 🐮",
    "נוגעים באף... ועכשיו באוזניים! 👃👂",
    "מוחאים כפיים שלוש פעמים: אחת, שתיים, שלוש 👏",
    "עושים גלים עם הידיים, כמו ים 🌊",
    "מושכים שפם כמו של סבאבוקלי 👴",
    "כולם מסתכלים על החבר שלידם ומחייכים 😊"
  ];
  var SILLY = ["פיצה עם שוקולד", "הגרביים של סבא", "פיל ורוד", "גלידה בטעם מלפפון", "מכונית שעושה מיאו", "דג על אופניים", "סבאבוקלי בפיג'מה", "בננה עם משקפיים", "ענן בטעם תות", "תרנגולת עם כובע", "חתול שנובח", "מקרר שמנגן בגיטרה", "נעל עם כנפיים", "עוגה של חול", "מטרייה מגבינה"];
  var BUILD_ACTS = [
    { t: "כולם לעמוד! קופצים חמש פעמים, כמו צפרדע 🐸", n: 5 },
    { t: "מוחאים כפיים חמש פעמים 👏", n: 5 },
    { t: "מסובבים את הידיים כמו טחנת רוח 🌀", n: 5 },
    { t: "נושמים כמו בלון: מנפחים... ומשחררים 🎈", n: 3 },
    { t: "רוקעים ברגליים כמו פיל 🐘", n: 5 }
  ];
  var BUILD_LINES = ["מדביק את השאלות בדבק 🧴", "מצחצח את הכפתורים ✨", "מאכיל את המחשב בגזר 🥕", "סופר את הרעיונות שלכם... וואו, הרבה! 🔢", "מוסיף קצת קסם 🪄", "מכין קונפטי לסוף 🎉"];
  var NUMS = ["אחת", "שתיים", "שלוש", "ארבע", "חמש"];
  var STEPS = [["topic", "נושא"], ["ideas", "רעיונות"], ["type", "משחק"], ["fill", "ממלאים"], ["build", "בונים"], ["play", "משחקים"], ["finish", "שולחים"]];

  /* ---------- מצב ---------- */
  var S = fresh(), PLAY = null, TIMERS = [];
  function fresh(){ return { step: "intro", topic: null, ideas: [], k: "", sel: [], items: [], fi: 0, ff: 0, n: "", g: "", code: "" }; }
  function save(){ try { localStorage.setItem("booqli_gm_draft", JSON.stringify(S)); } catch (e) {} }
  function load(){ try { var d = JSON.parse(localStorage.getItem("booqli_gm_draft") || "null"); return d && d.step ? d : null; } catch (e) { return null; } }
  try { var gn = localStorage.getItem("booqli_gm_gan"); if (gn) S.g = gn; } catch (e) {}
  function later(fn, ms){ var t = setTimeout(fn, ms); TIMERS.push(t); return t; }
  function clearTimers(){ TIMERS.forEach(clearTimeout); TIMERS = []; stopWait(); }

  /* ---------- סבאבוקלי מדבר ---------- */
  var talkId = 0;
  function talk(text, joy){
    var id = ++talkId;
    BUBBLE.textContent = text;
    SABA_IMG.classList.remove("joy"); if (joy) { void SABA_IMG.offsetWidth; SABA_IMG.classList.add("joy"); }
    SABA_IMG.classList.add("talk");
    return GM.say(text).then(function(){ if (id === talkId) SABA_IMG.classList.remove("talk"); });
  }

  /* ---------- "בזמן שהגננת מקלידה" – משימה קטנה לילדים ---------- */
  var waitT = null, waitSpoke = false, waitI = Math.floor(Math.random() * WAIT_TIPS.length);
  function typingStarted(){
    if (waitT || !WAIT.hidden) return;
    waitT = setTimeout(function(){
      waitT = null; var tip = WAIT_TIPS[waitI++ % WAIT_TIPS.length];
      WAIT.textContent = "⏳ " + tip; WAIT.hidden = false;
      if (!waitSpoke) { waitSpoke = true; GM.say(tip); }
      waitT = setTimeout(function(){ waitT = null; WAIT.hidden = true; typingStarted(); }, 9000);
    }, 4500);
  }
  function stopWait(){ clearTimeout(waitT); waitT = null; WAIT.hidden = true; waitSpoke = false; }

  /* ---------- שורת הקלדה לגננת ---------- */
  function inputRow(o){
    var box = document.createElement("div");
    box.innerHTML = (o.label ? '<div class="gm-label">' + esc(o.label) + '</div>' : "") +
      '<div class="gm-in"><input type="text" maxlength="' + (o.max || 60) + '" enterkeyhint="done" autocomplete="off" aria-label="' + esc(o.label || o.ph || "") + '" placeholder="' + esc(o.ph || "") + '"><button type="button" class="gm-btn">' + (o.btn || "✔️ להוסיף") + '</button></div>' +
      (o.chips && o.chips.length ? '<div class="gm-chips"></div>' : "");
    var inp = box.querySelector("input"), btn = box.querySelector(".gm-btn");
    inp.value = o.value || "";
    if (o.chips) { var ch = box.querySelector(".gm-chips"); o.chips.forEach(function(c){ var b = document.createElement("button"); b.type = "button"; b.textContent = c.t; if (c.fun) b.className = "fun"; b.onclick = function(){ c.fn(inp); inp.focus(); typingStarted(); }; ch.appendChild(b); }); }
    var go = function(){
      var v = GM.clean(inp.value, o.max || 60);
      if (!v) { inp.focus(); return; }
      stopWait();
      guard(v, o.extra).then(function(ok){ if (ok) o.onSubmit(v, inp); else inp.focus(); });
    };
    btn.onclick = go;
    inp.addEventListener("keydown", function(e){ if (e.key === "Enter") { e.preventDefault(); go(); } });
    inp.addEventListener("input", typingStarted);
    setTimeout(function(){ try { inp.focus({ preventScroll: true }); } catch (e) {} }, 60);
    return box;
  }
  // עצירה עדינה: שם של ילד, או סוד שבורח (התשובה בתוך הרמז)
  function guard(text, extra){
    return new Promise(function(done){
      var nm = GM.kidName(text), msg = "";
      if (nm) msg = "רגע! \"" + nm + "\" נשמע כמו שם של ילד. במשחק לא כותבים שמות של ילדים 🙂";
      else if (extra) msg = extra(text) || "";
      if (!msg) return done(true);
      var w = document.createElement("div"); w.className = "gm-warn"; w.setAttribute("role", "alert");
      w.innerHTML = '<div>' + esc(msg) + '</div><div class="gm-row"><button type="button" class="gm-btn sec" data-a="fix">✏️ לתקן</button><button type="button" class="gm-btn sec" data-a="ok">' + (nm ? "זה לא שם, להמשיך" : "להשאיר ככה") + '</button></div>';
      var old = BODY.querySelector(".gm-warn"); if (old) old.remove();
      BODY.appendChild(w); w.scrollIntoView({ block: "nearest" });
      GM.sound.soft(); GM.say(nm ? "רגע! במשחק לא כותבים שמות של ילדים." : msg);
      w.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ w.remove(); done(b.getAttribute("data-a") === "ok"); }; });
    });
  }

  /* ---------- סרגל השלבים ---------- */
  function renderSteps(){
    var at = STEPS.map(function(s){ return s[0]; }).indexOf(S.step);
    $("steps").innerHTML = STEPS.map(function(s, i){ return '<li class="' + (i === at ? "on" : i < at ? "done" : "") + '">' + (i < at ? "✔ " : "") + s[1] + '</li>'; }).join("");
    $("backBtn").hidden = S.step === "intro";
  }
  function go(step){
    clearTimers(); if (PLAY) { PLAY.stop(); PLAY = null; }
    S.step = step; save(); renderSteps(); BODY.innerHTML = "";
    VIEWS[step]();
    if (step !== "intro") siteEvent("gm-step", step);
  }

  /* ---------- השלבים ---------- */
  var VIEWS = {
    intro: function(){
      var d = load(), cont = d && d.step !== "intro" && d.step !== "finish" && (d.ideas || []).length;
      talk("שלום גן! אני סבאבוקלי, וכבר מאה שנה אני ממציא משחקים. היום אתם תמציאו איתי משחק חדש! מוכנים?");
      BODY.innerHTML = '<div class="gm-center"><div class="gm-row" style="justify-content:center"><button type="button" class="gm-btn big" id="iGo">🎉 מוכנים! מתחילים</button>' +
        (cont ? '<button type="button" class="gm-btn sec" id="iCont">↩️ להמשיך מאיפה שעצרנו</button>' : "") + '</div>' +
        '<p style="color:#6b5a66;font-size:.8em">טיפ: כפתור "⛶ מסך מלא" למעלה מתאים להקרנה. הגננת מקלידה, הילדים עונים בקול.</p></div>';
      $("iGo").onclick = function(){ var g = S.g; S = fresh(); S.g = g; GM.pickVoice(); GM.sound.pop(); siteEvent("gm-start", "new"); go("topic"); };
      if (cont) $("iCont").onclick = function(){ S = d; siteEvent("gm-start", "continue"); go(S.step === "build" || S.step === "play" ? "build" : S.step); };
    },

    topic: function(){
      talk("על מה נמציא משחק היום? בוחרים נושא! אפשר גם להצביע: מי רוצה חיות? מי רוצה חלל?");
      BODY.innerHTML = '<div class="gm-tiles" id="tTiles"></div><div id="tOwn"></div>';
      var tiles = $("tTiles");
      TOPICS.forEach(function(t, i){
        var b = document.createElement("button"); b.type = "button"; b.className = "gm-tile";
        b.innerHTML = "<b aria-hidden=\"true\">" + t.e + "</b>" + esc(t.n);
        b.onclick = function(){ setTopic({ e: t.e, n: t.n, i: i }, t.say); };
        tiles.appendChild(b);
      });
      var own = document.createElement("button"); own.type = "button"; own.className = "gm-tile"; own.style.borderColor = "#FFD84D";
      own.innerHTML = '<b aria-hidden="true">📚</b>מה שלמדנו<small>נושא משלנו</small>';
      own.onclick = function(){
        $("tOwn").innerHTML = ""; talk("איזה יופי! על מה למדנו? הגננת תכתוב את הנושא.");
        $("tOwn").appendChild(inputRow({ label: "הנושא שלנו (למשל: חנוכה, גוף האדם, האות ב׳, החרקים)", ph: "על מה המשחק?", max: 30, btn: "✔️ זה הנושא",
          onSubmit: function(v){ setTopic({ e: GM.guessEmoji(v, "📚"), n: v, i: -1 }, "איזה נושא מעולה! " + v + "!"); } }));
      };
      tiles.appendChild(own);
    },

    ideas: function(){
      var tp = S.topic;
      talk("מה אתם יודעים על " + tp.n + "? כל רעיון מתקבל! מי מרים יד?");
      BODY.innerHTML = '<div class="gm-count" id="iCount"></div><div class="gm-meter"><i id="iMeter"></i></div><div class="gm-ideas" id="iList"></div><div id="iIn"></div><div id="iEmo"></div>' +
        '<div class="gm-row"><button type="button" class="gm-btn sec" id="iHelp">💡 סבאבוקלי נותן רעיון</button><button type="button" class="gm-btn" id="iDone">🧹 סבאבוקלי עושה סדר ←</button></div>' +
        '<p style="color:#6b5a66;font-size:.75em;margin:0">לוחצים על רעיון כדי להחליף לו ציור או למחוק אותו.</p>';
      $("iIn").appendChild(inputRow({ label: "הרעיון של הילד (מילה או שתיים)", ph: "למשל: " + (tp.i > -1 ? TOPICS[tp.i].s[0] : "רעיון"), max: 30,
        onSubmit: function(v, inp){ addIdea(v); inp.value = ""; inp.focus(); } }));
      $("iHelp").onclick = function(){
        var pool = (tp.i > -1 ? TOPICS[tp.i].s : []).filter(function(x){ return !S.ideas.some(function(y){ return y.x === x; }); });
        if (!pool.length) { talk("נגמרו לי הרעיונות... אתם יותר חכמים ממני! מה עוד?"); return; }
        addIdea(pick(pool), "יש לי רעיון! ");
      };
      $("iDone").onclick = sortIdeas;
      drawIdeas();
    },

    type: function(){
      talk("מסודר! עכשיו – איזה משחק נעשה? חידון, משחק זיכרון, או מי אני?");
      BODY.innerHTML = '<div class="gm-tiles types" id="kTiles"></div><div id="kPick"></div>';
      ["q", "m", "w"].forEach(function(k){
        var b = document.createElement("button"); b.type = "button"; b.className = "gm-tile" + (S.k === k ? " pick" : "");
        b.innerHTML = '<b aria-hidden="true">' + T[k].ic + '</b>' + esc(T[k].name) + '<small>' + esc(T[k].sub) + '</small>';
        b.onclick = function(){
          S.k = k; S.items = []; S.fi = 0; S.ff = 0;
          BODY.querySelectorAll("#kTiles .gm-tile").forEach(function(x){ x.classList.toggle("pick", x === b); });
          GM.sound.ding(); siteEvent("gm-type", k);
          var max = k === "m" ? 8 : 6;
          S.sel = S.ideas.map(function(_, i){ return i; }).slice(0, max); save();
          talk({ q: "חידון! אני אוהב חידונים!", m: "משחק זיכרון! אני זוכר הכל... רגע, איפה המשקפיים שלי?", w: "מי אני? אני אוהב סודות!" }[k] + " בוחרים עד " + max + " רעיונות למשחק.", true);
          drawPick();
        };
        $("kTiles").appendChild(b);
      });
      if (S.k) drawPick();
    },

    fill: function(){
      if (S.k === "m") return fillMemory();
      if (!S.items.length) {
        S.items = S.sel.map(function(i){ var x = S.ideas[i]; return S.k === "q" ? { q: "", a: x.x, w: [], e: x.e, src: x.x } : { x: x.x, e: x.e, c: [] }; });
        S.fi = 0; S.ff = 0; save();
      }
      drawFill();
    },

    build: function(){
      var act = pick(BUILD_ACTS), total = 9000, t0 = Date.now();
      BODY.innerHTML = '<div class="gm-build"><div class="act">' + esc(act.t) + '</div><div class="num" id="bNum"></div><div class="gm-bar2"><i id="bBar"></i></div><div class="line" id="bLine"></div>' +
        '<button type="button" class="gm-btn sec" id="bSkip">⏭ לדלג</button></div>';
      talk("רגע, אני בונה את המשחק! בינתיים: " + act.t).then(function(){
        var c = 0;
        var count = function(){
          if (S.step !== "build") return;
          if (c >= act.n) return;
          var el = $("bNum"); if (!el) return;
          el.textContent = c + 1; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); GM.sound.pop(); GM.say(NUMS[c]);
          c++; later(count, 1300);
        };
        count();
      });
      var li = 0;
      var tick = function(){
        var p = Math.min(1, (Date.now() - t0) / total); var bar = $("bBar"); if (!bar) return;
        bar.style.width = Math.round(p * 100) + "%";
        var l = Math.floor(p * BUILD_LINES.length); if (l !== li || !$("bLine").textContent) { li = l; $("bLine").textContent = "סבאבוקלי " + BUILD_LINES[Math.min(l, BUILD_LINES.length - 1)]; }
        if (p >= 1) return done();
        later(tick, 250);
      };
      var finished = false;
      var done = function(){ if (finished) return; finished = true; GM.sound.tada(); go("play"); };
      $("bSkip").onclick = done;
      tick();
      makeGame();
    },

    play: function(){
      var game = makeGame();
      talk("המשחק מוכן! " + T[S.k].name + " על " + S.topic.n + ". בואו נשחק!", true);
      var wrap = document.createElement("div"); BODY.appendChild(wrap);
      later(function(){
        PLAY = GM.play(wrap, game, { onWin: function(x){
          siteEvent("gm-win", S.k);
          x.innerHTML = '<button type="button" class="gm-btn big">📲 לשמור ולשלוח להורים</button><button type="button" class="gm-btn sec">🔁 לשחק שוב</button>';
          x.children[0].onclick = function(){ go("finish"); };
          x.children[1].onclick = function(){ go("play"); };
        } });
      }, 1500);
      var bar = document.createElement("div"); bar.className = "gm-row"; bar.style.justifyContent = "center";
      bar.innerHTML = '<button type="button" class="gm-btn sec">🏁 סיימנו לשחק ← לשמור ולשלוח</button>';
      bar.firstChild.onclick = function(){ go("finish"); };
      BODY.appendChild(bar);
    },

    finish: function(){
      var game = makeGame();
      if (!S.n) S.n = T[S.k].name + " על " + S.topic.n;
      talk("שיחקתם נהדר! עכשיו הגננת כותבת את שם הגן, ושולחים את המשחק להורים. ככה ממשיכים לשחק בבית!", true);
      BODY.innerHTML = '<div class="gm-finish">' +
        '<div><label for="fName">שם המשחק</label><div class="gm-in"><input id="fName" maxlength="50" type="text"></div></div>' +
        '<div><label for="fGan">שם הגן</label><div class="gm-in"><input id="fGan" maxlength="30" type="text" placeholder="למשל: גן רימון"></div>' +
        '<p class="hint">🔒 רק שם הגן – בלי עיר, בלי רחוב ובלי שמות של ילדים. זה הפרט היחיד שמופיע במשחק.</p></div>' +
        '<div class="gm-acts">' +
          '<div class="gm-act"><h4>📲 לשלוח להורים</h4><p>הודעה מוכנה לקבוצת ההורים עם קישור למשחק. ההורים פותחים ומשחקים עם הילדים בבית.</p><button type="button" class="gm-btn wa" id="aWa">💬 לשלוח בוואטסאפ</button><button type="button" class="gm-btn sec" id="aCopy">🔗 להעתיק קישור</button><div class="gm-copied" id="aCopied" aria-live="polite"></div></div>' +
          '<div class="gm-act"><h4>🖨️ סיכום להדפסה</h4><p>דף A4: הרעיונות של הילדים, השאלות והתשובות, וקוד לסריקה כדי לשחק בבית. מתאים לתיק או ללוח ההורים.</p><button type="button" class="gm-btn" id="aPrint">🖨️ להדפיס</button></div>' +
          '<div class="gm-act"><h4>⭐ לפרסם באפליקציה</h4><p>המשחק יופיע בפינת "משחקים שגנים המציאו". בקשה נשלחת ל-BOOQLI, ונפרסם רק אחרי שנעבור עליו.</p>' +
            '<label class="gm-ok"><input type="checkbox" id="aOk"><span>אני מאשרת שאין במשחק שמות של ילדים, תמונות או פרטים אישיים, ומרשה ל-BOOQLI לפרסם אותו באתר ובאפליקציה. אין לגן זכויות על המשחק, ואפשר לבקש להוריד אותו בכל רגע.</span></label>' +
            '<button type="button" class="gm-btn" id="aPub" disabled>⭐ לבקש פרסום</button></div>' +
        '</div>' +
        '<div class="gm-row"><button type="button" class="gm-btn sec" id="aAgain">🔁 לשחק שוב</button><button type="button" class="gm-btn sec" id="aEdit">✏️ לתקן את המשחק</button><button type="button" class="gm-btn sec" id="aNew">🆕 משחק חדש</button></div>' +
        '</div>';
      $("fName").value = S.n; $("fGan").value = S.g || "";
      $("fName").oninput = function(){ S.n = GM.clean(this.value, 50); save(); };
      $("fGan").oninput = function(){ S.g = GM.clean(this.value, 30); save(); try { localStorage.setItem("booqli_gm_gan", S.g); } catch (e) {} };
      var needGan = function(){
        if (S.g) return Promise.resolve(true);
        $("fGan").focus(); talk("רגע, מה שם הגן? כותבים אותו כאן."); return Promise.resolve(false);
      };
      var ready = function(){ return needGan().then(function(ok){ return ok ? guard(S.g + " " + S.n) : false; }); };
      $("aWa").onclick = function(){ ready().then(function(ok){ if (!ok) return; var g = remember(); siteEvent("gm-parents", S.k); window.open("https://wa.me/?text=" + encodeURIComponent(parentsText(g)), "_blank", "noopener"); }); };
      $("aCopy").onclick = function(){ ready().then(function(ok){ if (!ok) return; remember(); var url = gameUrl("copy"); siteEvent("gm-copy", S.k);
        var show = function(){ $("aCopied").textContent = "✔️ הקישור הועתק"; };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(show, function(){ prompt("הקישור למשחק:", url); }); else prompt("הקישור למשחק:", url); }); };
      $("aPrint").onclick = function(){ remember(); siteEvent("gm-print", S.k); printSummary(); };
      $("aOk").onchange = function(){ $("aPub").disabled = !this.checked; };
      $("aPub").onclick = function(){ ready().then(function(ok){ if (!ok) return; var g = remember(); siteEvent("gm-publish", S.k);
        var t = "היי BOOQLI 🎮 אנחנו גן " + g.g + ", המצאנו משחק עם הילדים ונשמח שתפרסמו אותו באפליקציה:\n" + g.n + " (" + T[g.k].name + " על " + g.tp + ")\n" + gameUrl("publish") +
          "\n\nאני מאשרת שאין במשחק שמות של ילדים, תמונות או פרטים אישיים, ומרשה ל-BOOQLI לפרסם אותו באתר ובאפליקציה. אין לגן זכויות על המשחק, ואפשר לבקש להוריד אותו בכל רגע.";
        window.open("https://wa.me/" + SITE.phone + "?text=" + encodeURIComponent(t), "_blank", "noopener"); }); };
      $("aAgain").onclick = function(){ go("play"); };
      $("aEdit").onclick = function(){ S.fi = 0; S.ff = 0; go(S.k === "m" ? "type" : "fill"); };
      $("aNew").onclick = function(){ var g = S.g; S = fresh(); S.g = g; save(); go("topic"); };
      remember();
    }
  };

  /* ---------- נושא ---------- */
  function setTopic(t, line){
    S.topic = t; S.ideas = []; S.k = ""; S.items = []; save();
    GM.sound.ding(); siteEvent("gm-topic", t.i > -1 ? t.n : "own");
    BODY.querySelectorAll(".gm-tile").forEach(function(x){ x.disabled = true; });
    talk(line, true).then(function(){ if (S.step === "topic") go("ideas"); });
  }

  /* ---------- רעיונות ---------- */
  var MIN_IDEAS = 4;
  function addIdea(v, pre){
    if (S.ideas.length >= 12) { talk("וואו, 12 רעיונות! זה המון. עכשיו עושים סדר!"); return; }
    if (S.ideas.some(function(y){ return y.x === v; })) { talk("את " + v + " כבר יש לנו! עוד משהו?"); return; }
    S.ideas.push({ x: v, e: GM.guessEmoji(v, S.topic.e) }); save();
    GM.sound.pop(); drawIdeas(true);
    var n = S.ideas.length;
    talk((pre || pick(IDEA_REACT) + " ") + v + "!" + (n === MIN_IDEAS ? " יש לנו מספיק רעיונות! אפשר עוד, או ללחוץ: עושים סדר." : ""), true);
  }
  function drawIdeas(newOne){
    var list = $("iList"); if (!list) return;
    var n = S.ideas.length;
    $("iCount").textContent = n < MIN_IDEAS ? "💡 " + n + " רעיונות · עוד " + (MIN_IDEAS - n) + " ויש לנו מספיק!" : "💡 " + n + " רעיונות · אפשר עוד (עד 12)";
    $("iMeter").style.width = Math.min(100, n / MIN_IDEAS * 100) + "%";
    $("iDone").disabled = n < 3;
    list.innerHTML = "";
    S.ideas.forEach(function(x, i){
      var b = document.createElement("button"); b.type = "button"; b.className = "gm-idea";
      if (!newOne || i < n - 1) b.style.animation = "none";
      b.innerHTML = '<b aria-hidden="true">' + esc(x.e) + '</b>' + esc(x.x);
      b.onclick = function(){ emojiPicker($("iEmo"), x, function(){ drawIdeas(); }, function(){ S.ideas.splice(i, 1); save(); drawIdeas(); }); };
      list.appendChild(b);
    });
  }
  function emojiPicker(host, item, onPick, onDel){
    host.innerHTML = '<div class="gm-label">ציור ל"' + esc(item.x) + '":</div><div class="gm-emo"></div>' + (onDel ? '<button type="button" class="gm-btn sec" style="font-size:.75em">🗑️ למחוק את הרעיון</button>' : "");
    var box = host.querySelector(".gm-emo");
    var list = [GM.guessEmoji(item.x, S.topic.e)].concat(GM.PICK_EMOJI).filter(function(e, i, a){ return a.indexOf(e) === i; });
    list.forEach(function(e){ var b = document.createElement("button"); b.type = "button"; b.textContent = e; b.setAttribute("aria-label", "ציור " + e);
      b.onclick = function(){ item.e = e; save(); host.innerHTML = ""; GM.sound.pop(); onPick(); }; box.appendChild(b); });
    if (onDel) host.querySelector(".gm-btn").onclick = function(){ host.innerHTML = ""; onDel(); };
    host.scrollIntoView({ block: "nearest" });
  }
  function sortIdeas(){
    var list = $("iList"); stopWait();
    $("iDone").disabled = true; $("iHelp").disabled = true;
    talk("רגע... אני עושה סדר ברעיונות שלכם.");
    list.querySelectorAll(".gm-idea").forEach(function(b){
      b.style.transform = "translate(" + (Math.random() * 160 - 80) + "px," + (Math.random() * 80 - 40) + "px) rotate(" + (Math.random() * 50 - 25) + "deg)";
    });
    later(function(){
      S.ideas.sort(function(a, b){ return a.x.localeCompare(b.x, "he"); }); save();
      drawIdeas(); GM.sound.tada();
      later(function(){ go("type"); }, 1200);
    }, 1300);
  }

  /* ---------- בחירת רעיונות למשחק ---------- */
  function drawPick(){
    var host = $("kPick"); if (!host) return;
    var max = S.k === "m" ? 8 : 6, min = S.k === "m" ? 3 : 2;
    host.innerHTML = '<div class="gm-label">אילו רעיונות נכנסים למשחק? (' + min + ' עד ' + max + ')</div><div class="gm-ideas" id="kIdeas"></div><div class="gm-row"><button type="button" class="gm-btn big" id="kGo">יאללה, ממשיכים! ←</button><span class="gm-count" id="kN"></span></div>';
    var box = $("kIdeas");
    var upd = function(){ $("kN").textContent = S.sel.length + " נבחרו"; $("kGo").disabled = S.sel.length < min; };
    S.ideas.forEach(function(x, i){
      var b = document.createElement("button"); b.type = "button"; b.style.animation = "none";
      var draw = function(){ var on = S.sel.indexOf(i) > -1; b.className = "gm-idea " + (on ? "on" : "off"); b.setAttribute("aria-pressed", on); b.innerHTML = '<b aria-hidden="true">' + (on ? "✔️" : esc(x.e)) + '</b>' + esc(x.x); };
      b.onclick = function(){
        var at = S.sel.indexOf(i);
        if (at > -1) S.sel.splice(at, 1); else if (S.sel.length < max) S.sel.push(i); else { talk("אפשר עד " + max + ". מורידים אחד קודם."); return; }
        S.sel.sort(function(a, z){ return a - z; }); save(); draw(); upd(); GM.sound.pop();
      };
      draw(); box.appendChild(b);
    });
    upd();
    $("kGo").onclick = function(){ S.items = []; go("fill"); };
  }

  /* ---------- מילוי: זיכרון ---------- */
  function fillMemory(){
    S.items = S.sel.map(function(i){ return S.ideas[i]; }); save();
    talk("לכל קלף יש ציור. רוצים להחליף ציור? לוחצים עליו. ואז – בונים!");
    BODY.innerHTML = '<div class="gm-ideas" id="mList"></div><div id="mEmo"></div><div class="gm-row"><button type="button" class="gm-btn big" id="mGo">🔨 לבנות את המשחק!</button></div>';
    var draw = function(){
      var l = $("mList"); l.innerHTML = "";
      S.items.forEach(function(x){ var b = document.createElement("button"); b.type = "button"; b.className = "gm-idea"; b.style.animation = "none";
        b.innerHTML = '<b aria-hidden="true">' + esc(x.e) + '</b>' + esc(x.x);
        b.onclick = function(){ emojiPicker($("mEmo"), x, draw); }; l.appendChild(b); });
    };
    draw();
    $("mGo").onclick = function(){ go("build"); };
  }

  /* ---------- מילוי: חידון ומי אני ---------- */
  function complete(it){ return S.k === "q" ? !!(it.q && it.a && it.w.length) : it.c.length > 0; }
  function drawFill(){
    var it = S.items[S.fi];
    if (!it) { S.fi = 0; it = S.items[0]; }
    var nDone = S.items.filter(complete).length, isQ = S.k === "q", name = isQ ? it.src || it.a : it.x;
    BODY.innerHTML = '<div class="gm-fill"><div class="gm-fill-h"><b aria-hidden="true">' + esc(it.e) + '</b><h3>' + esc(name) + '</h3><span>' + (isQ ? "שאלה " : "חידה ") + (S.fi + 1) + " מתוך " + S.items.length + '</span></div>' +
      '<ul class="gm-done" id="fDone"></ul><div id="fIn"></div></div>' +
      '<div class="gm-row"><button type="button" class="gm-btn sec" id="fPrev"' + (S.fi ? "" : " hidden") + '>→ הקודמת</button><button type="button" class="gm-btn sec" id="fSkip">⏭ לדלג</button>' +
      '<button type="button" class="gm-btn" id="fBuild"' + (nDone >= 2 ? "" : " disabled") + '>🔨 לבנות את המשחק (' + nDone + ' מוכנות)</button></div>';
    var done = $("fDone"), host = $("fIn");
    var row = function(lbl, val, field){ var li = document.createElement("li"); li.innerHTML = '<small>' + esc(lbl) + '</small> ' + esc(val) + ' <button type="button">✏️ לשנות</button>'; li.querySelector("button").onclick = function(){ S.ff = field; save(); drawFill(); }; done.appendChild(li); };
    var next = function(){ S.ff++; save(); drawFill(); };
    var nextItem = function(){
      if (S.fi < S.items.length - 1) { S.fi++; S.ff = 0; save(); drawFill(); }
      else { save(); talk("כל השאלות מוכנות! בונים את המשחק!", true).then(function(){ if (S.step === "fill") go("build"); }); }
    };
    $("fPrev").onclick = function(){ S.fi--; S.ff = 0; save(); drawFill(); };
    $("fSkip").onclick = nextItem;
    $("fBuild").onclick = function(){ go("build"); };

    if (isQ) {
      if (it.q && S.ff > 0) row("שאלה:", it.q, 0);
      if (S.ff > 1) row("✔️ נכון:", it.a, 1);
      it.w.forEach(function(w, j){ if (S.ff > 2 + j) row("🤪 לא נכון:", w, 2 + j); });
      if (S.ff === 0) {
        talk("שאלה על " + name + "! מה נשאל? מי רוצה להמציא שאלה?");
        host.appendChild(inputRow({ label: "השאלה (התשובה הנכונה תהיה: " + it.a + ")", ph: "למשל: מה אוכלים ב...?", max: 110, value: it.q, btn: "✔️ זו השאלה",
          chips: ["מה ", "איפה ", "מי ", "כמה ", "למה ", "איזה צבע "].map(function(s){ return { t: s + "...", fn: function(inp){ inp.value = s; } }; }),
          extra: function(v){ return it.a.length > 1 && v.indexOf(it.a) > -1 ? "אופס! התשובה \"" + it.a + "\" כתובה בתוך השאלה 🙈 אולי לשאול אחרת?" : ""; },
          onSubmit: function(v){ it.q = v; GM.sound.ding(); talk(pick(["שאלה מעולה!", "איזו שאלה!", "וואו, שאלה חכמה!"])); next(); } }));
      } else if (S.ff === 1) {
        talk("ומה התשובה הנכונה?");
        host.appendChild(inputRow({ label: "התשובה הנכונה", ph: it.a, max: 45, value: it.a, btn: "✔️ זו התשובה",
          onSubmit: function(v){ it.a = v; GM.sound.ding(); next(); } }));
      } else if (S.ff === 2 || S.ff === 3) {
        var j = S.ff - 2;
        talk(j ? "ועוד תשובה מבלבלת אחת!" : "עכשיו החלק המצחיק: תשובה לא נכונה! מי ממציא תשובה מצחיקה?");
        host.appendChild(inputRow({ label: j ? "עוד תשובה לא נכונה (אפשר לדלג)" : "תשובה לא נכונה – מצחיקה או מבלבלת", ph: "למשל: " + pick(SILLY), max: 45, value: it.w[j] || "",
          chips: [{ t: "🤪 סבאבוקלי ממציא", fun: true, fn: function(inp){ inp.value = pick(SILLY); } }].concat(j ? [{ t: "⏭ אין עוד, לשאלה הבאה", fn: function(){ nextItem(); } }] : []),
          extra: function(v){ return v === it.a ? "זו בדיוק התשובה הנכונה 😄 צריך תשובה לא נכונה!" : ""; },
          onSubmit: function(v){ it.w[j] = v; it.w = it.w.filter(Boolean); GM.sound.laugh(); talk(pick(["חה חה חה!", "הצחקתם אותי!", "אוי, זה מצחיק!"]), true); if (j) nextItem(); else next(); } }));
      } else nextItem();
    } else {
      it.c.forEach(function(c, j){ if (j < S.ff) row("💡 רמז " + (j + 1) + ":", c, j); });
      if (S.ff < 3) {
        var k = S.ff;
        talk(k === 0 ? "חידה! איך נרמוז על " + name + " בלי להגיד את השם? מי נותן רמז?" : k === 1 ? "רמז נוסף! מה עוד אפשר להגיד?" : "ועוד רמז אחד, הכי קל!");
        host.appendChild(inputRow({ label: "רמז " + (k + 1) + (k ? " (אפשר לדלג)" : "") + " – בלי להגיד את השם!", ph: ["אני בצבע...", "אני גר ב...", "אני אוהב..."][k], max: 85, value: it.c[k] || "",
          chips: ["אני בצבע ", "אני גר ב", "אני אוהב ", "יש לי ", "אפשר למצוא אותי ב", "אני עושה "].map(function(s){ return { t: s + "...", fn: function(inp){ inp.value = s; } }; })
            .concat(k ? [{ t: "⏭ מספיק רמזים", fn: function(){ nextItem(); } }] : []),
          extra: function(v){ return v.indexOf(it.x) > -1 ? "אופס! הסוד בורח – \"" + it.x + "\" כתוב ברמז 🙈" : ""; },
          onSubmit: function(v){ it.c[k] = v; it.c = it.c.filter(Boolean); GM.sound.ding(); talk(pick(["רמז מעולה!", "הממ, מעניין!", "אוי, זה רמז טוב!"])); if (k === 2) nextItem(); else next(); } }));
      } else nextItem();
    }
  }

  /* ---------- המשחק, הקישור והשליחה ---------- */
  function today(){ var d = typeof siteNow === "function" ? siteNow() : new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function makeGame(){
    var it = S.k === "q" ? S.items.filter(complete).map(function(x){ return { q: x.q, a: x.a, w: x.w.slice(0, 2), e: x.e }; })
      : S.k === "w" ? S.items.filter(complete).map(function(x){ return { x: x.x, e: x.e, c: x.c.slice(0, 3) }; })
      : S.items.map(function(x){ return { x: x.x, e: x.e }; });
    var g = GM.sanitize({ v: 1, k: S.k, n: S.n || T[S.k].name + " על " + S.topic.n, tp: S.topic.n, te: S.topic.e, g: S.g, d: today(), id: S.ideas, it: it });
    if (g) { S.code = GM.encode(g); save(); }
    return g;
  }
  function gameUrl(medium){ return SITE_URL + "g/?utm_source=" + (medium === "parents" ? "whatsapp" : "link") + "&utm_medium=" + (medium === "parents" ? "gan_parents" : medium) + "&utm_campaign=game-maker#" + S.code; }
  function parentsText(g){
    var what = g.k === "q" ? g.it.length + " שאלות ותשובות" : g.k === "w" ? g.it.length + " חידות עם רמזים" : "את הקלפים של משחק הזיכרון";
    return "הורים יקרים 💕\nהיום בגן " + g.g + " המצאנו יחד משחק: " + g.n + "! " + g.te + "\nהילדים חשבו בעצמם על הרעיונות ועל " + what + ".\n" +
      "שחקו איתם בבית ותנו להם להיות המורים ולהסביר לכם מה למדנו 😊\n▶️ " + gameUrl("parents") + "\n\nבחסות BOOQLI 📚 ספרי ילדים בהתאמה אישית";
  }
  function remember(){
    var g = makeGame(); if (!g || !S.code) return g;
    try {
      var list = JSON.parse(localStorage.getItem("booqli_gm_list") || "[]") || [];
      var key = S.topic.n + "|" + S.k + "|" + g.d;
      list = list.filter(function(x){ return x.key !== key; });
      list.unshift({ key: key, c: S.code, n: g.n, g: g.g, k: g.k, te: g.te, d: g.d });
      localStorage.setItem("booqli_gm_list", JSON.stringify(list.slice(0, 30)));
    } catch (e) {}
    drawMine();
    return g;
  }
  function printSummary(code){
    var g = code ? GM.decode(code) : makeGame(); if (!g) return;
    var url = SITE_URL + "g/?utm_source=print&utm_medium=gan_summary&utm_campaign=game-maker#" + (code || S.code);
    $("printArea").innerHTML = GM.summary(g, url, "../../img/logo.png");
    setTimeout(function(){ window.print(); }, 300);
  }

  /* ---------- המשחקים שהמצאנו ---------- */
  function drawMine(){
    var list = []; try { list = JSON.parse(localStorage.getItem("booqli_gm_list") || "[]") || []; } catch (e) {}
    $("mineBox").hidden = !list.length;
    var box = $("mine"); box.innerHTML = "";
    list.forEach(function(x, i){
      var r = document.createElement("div"); r.className = "row";
      r.innerHTML = '<b>' + esc((x.te || "") + " " + x.n) + '</b><span>' + esc(x.d ? x.d.split("-").reverse().join(".") : "") + '</span>' +
        '<button type="button">▶️ לשחק</button><button type="button" class="wa">📲 להורים</button><button type="button">🖨️</button><button type="button" aria-label="למחוק">🗑️</button>';
      var b = r.querySelectorAll("button");
      b[0].onclick = function(){ window.open("../../g/#" + x.c, "_blank", "noopener"); siteEvent("gm-mine", "play"); };
      b[1].onclick = function(){ var g = GM.decode(x.c); if (!g) return; S.code = x.c; siteEvent("gm-parents", "mine"); window.open("https://wa.me/?text=" + encodeURIComponent(parentsText(g)), "_blank", "noopener"); };
      b[2].onclick = function(){ siteEvent("gm-print", "mine"); printSummary(x.c); };
      b[3].onclick = function(){ if (!confirm("למחוק את המשחק \"" + x.n + "\" מהמחשב הזה?")) return; list.splice(i, 1); try { localStorage.setItem("booqli_gm_list", JSON.stringify(list)); } catch (e) {} drawMine(); };
      box.appendChild(r);
    });
  }

  /* ---------- כלים ---------- */
  function voiceUi(){ var b = $("voiceBtn"); b.classList.toggle("off", !GM.voice()); b.setAttribute("aria-pressed", GM.voice()); b.title = "הקול של סבאבוקלי" + (GM.voiceName() ? ": " + GM.voiceName() : ""); }
  $("voiceBtn").onclick = function(){ GM.setVoice(!GM.voice()); voiceUi(); };
  $("fullBtn").onclick = function(){
    var st = $("studio");
    if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    var fn = st.requestFullscreen || st.webkitRequestFullscreen; if (fn) fn.call(st); siteEvent("gm-full", S.step);
  };
  var ORDER = ["intro", "topic", "ideas", "type", "fill", "build", "play", "finish"];
  $("backBtn").onclick = function(){
    var i = ORDER.indexOf(S.step); if (i < 1) return;
    var to = ORDER[i - 1]; if (to === "build") to = "fill"; if (to === "play" && S.step === "finish") to = "play";
    if (S.step === "fill" && S.fi > 0) { S.fi--; S.ff = 0; save(); drawFill(); return; }
    go(to);
  };
  $("startBtn").onclick = function(){ $("studio").scrollIntoView({ behavior: "smooth", block: "start" }); var b = $("iGo"); if (b) b.click(); };
  voiceUi();

  // קישורים קבועים
  var ORDER_URL = "https://www.booqli.ai/he/create-a-book?utm_source=booqli_games&utm_medium=book_box&utm_campaign=game-maker";
  var GAN_URL = "https://wa.me/" + SITE.phone + "?text=" + encodeURIComponent("היי BOOQLI, אני מגן ילדים ורוצה הצעת מחיר לספר אישי לכל ילד בגן 🏫");
  $("orderLink").href = ORDER_URL; $("ganBtn").href = GAN_URL; $("ganLink").href = GAN_URL;
  siteJoinLinks(); siteDevBar(); siteBackBar("../../");

  renderSteps(); VIEWS.intro(); drawMine();
  // לבדיקות אוטומטיות בלבד
  window.__gm = { S: function(){ return S; }, go: go, set: function(x){ S = x; save(); } };
})();
