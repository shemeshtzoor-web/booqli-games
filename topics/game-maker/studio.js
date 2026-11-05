/* =====================================================================
   הסטודיו של סבאבוקלי – ממציאים משחק עם כל הגן (3.11.2026)
   שלבים (מ-3.11.2026, לפי שמש): intro → topic → ideas (כל ילד אומר מילה או משפט) → build → play → finish.
   סבאבוקלי בונה לבד את המשחק מכל מה שהילדים אמרו (GM, סוג x).
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
  var STEPS = [["topic", "בוחרים נושא"], ["ideas", "כל ילד אומר"], ["build", "סבאבוקלי בונה"], ["play", "משחקים"], ["finish", "שולחים"]];

  /* ---------- מצב ---------- */
  var S = fresh(), PLAY = null, TIMERS = [];
  function fresh(){ return { step: "intro", topic: null, ideas: [], k: "x", n: "", g: "", code: "" }; }
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
      (o.noGuard ? Promise.resolve(true) : guard(v, o.extra)).then(function(ok){ if (ok) o.onSubmit(v, inp); else inp.focus(); });
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
    // (3.11.2026) אחרי מעבר שלב העמוד נהיה קצר יותר, והמסך נשאר למטה (על "ספר אישי"). חוזרים לראש הסטודיו.
    var top = $("studio").getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.35) $("studio").scrollIntoView({ block: "start", behavior: step === "topic" ? "smooth" : "auto" });
    if (step !== "intro") siteEvent("gm-step", step);
  }

  /* ---------- השלבים ---------- */
  var VIEWS = {
    intro: function(){
      var d = load(), cont = d && d.step !== "intro" && d.step !== "finish" && (d.ideas || []).length;
      talk("שלום גן! אני סבאבוקלי, וכבר מאה שנה אני ממציא משחקים. היום כל ילד יגיד מילה, ואני אבנה מזה משחק של כל הגן! מוכנים?");
      BODY.innerHTML = '<div class="gm-center"><div class="gm-row" style="justify-content:center"><button type="button" class="gm-btn big" id="iGo">🎉 מוכנים! מתחילים</button>' +
        (cont ? '<button type="button" class="gm-btn sec" id="iCont">↩️ להמשיך מאיפה שעצרנו</button>' : "") + '</div>' +
        '<p style="color:#566B67;font-size:.8em">איך זה עובד: בוחרים נושא, כל ילד בתורו אומר מילה או משפט, הגננת מקלידה – וסבאבוקלי בונה מזה משחק. טיפ: "⛶ מסך מלא" מתאים להקרנה.</p></div>';
      $("iGo").onclick = function(){ var g = S.g; S = fresh(); S.g = g; GM.pickVoice(); GM.sound.pop(); siteEvent("gm-start", "new"); go("topic"); };
      if (cont) $("iCont").onclick = function(){ S = d; if (S.k !== "x") { S.k = "x"; S.step = "ideas"; } siteEvent("gm-start", "continue"); go(S.step === "build" || S.step === "play" ? "build" : S.step); };
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
        $("tOwn").appendChild(inputRow({ label: "הנושא שלנו (למשל: חנוכה, גוף האדם, האות ב׳, החרקים)", ph: "על מה המשחק?", max: 30, btn: "✔️ זה הנושא", noGuard: true,
          onSubmit: function(v){ setTopic({ e: GM.guessEmoji(v, "📚"), n: v, i: -1 }, "איזה נושא מעולה! " + v + "!"); } }));
      };
      tiles.appendChild(own);
    },

    ideas: function(){
      var tp = S.topic;
      talk(S.ideas.length ? "ממשיכים! מי הבא בתור?" : "כל ילד אומר מילה או משפט על " + tp.n + ". מי מתחיל?");
      BODY.innerHTML = '<div class="gm-kids" id="iKids" aria-live="polite"></div><div class="gm-ideas" id="iList"></div><div id="iIn"></div><div id="iEmo"></div>' +
        '<div class="gm-row"><button type="button" class="gm-btn sec" id="iHelp">💡 אין רעיון? סבאבוקלי עוזר</button><button type="button" class="gm-btn big" id="iDone">✅ כולם אמרו – סבאבוקלי בונה משחק!</button></div>' +
        '<p style="color:#566B67;font-size:.75em;margin:0">כל ילד בתורו. אפשר מילה אחת ("גלים") או משפט ("הגלים קופצים"). לוחצים על רעיון כדי להחליף ציור או למחוק.</p>';
      $("iIn").appendChild(inputRow({ label: "", ph: "מה הילד אומר? למשל: " + (tp.i > -1 ? TOPICS[tp.i].s[0] : "מילה או משפט"), max: 60,
        onSubmit: function(v, inp){ addIdea(v); inp.value = ""; inp.focus(); } }));
      $("iHelp").onclick = function(){
        var pool = (tp.i > -1 ? TOPICS[tp.i].s : []).filter(function(x){ return !S.ideas.some(function(y){ return y.x === x; }); });
        if (!pool.length) { talk("נגמרו לי הרעיונות... אתם יותר חכמים ממני! מה עוד?"); return; }
        addIdea(pick(pool), "אני אעזור! ");
      };
      $("iDone").onclick = sortIdeas;
      drawIdeas();
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
      talk("המשחק מוכן! כל מה שאמרתם על " + S.topic.n + " נמצא בפנים. עכשיו אני מגריל איזה משחק נשחק!", true);
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
      if (!S.n) S.n = "המשחק שלנו על " + S.topic.n;
      talk("שיחקתם נהדר! עכשיו הגננת כותבת את שם הגן, ושולחים את המשחק להורים. ככה ממשיכים לשחק בבית!", true);
      BODY.innerHTML = '<div class="gm-finish">' +
        '<div><label for="fName">שם המשחק</label><div class="gm-in"><input id="fName" maxlength="50" type="text"></div></div>' +
        '<div><label for="fGan">שם הגן</label><div class="gm-in"><input id="fGan" maxlength="30" type="text" placeholder="למשל: גן רימון"></div>' +
        '<p class="hint">🔒 רק שם הגן – בלי עיר, בלי רחוב ובלי שמות של ילדים. זה הפרט היחיד שמופיע במשחק.</p></div>' +
        '<div class="gm-acts">' +
          '<div class="gm-act"><h4>📲 לשלוח להורים</h4><p>הודעה מוכנה לקבוצת ההורים עם קישור למשחק. ההורים פותחים ומשחקים עם הילדים בבית.</p><button type="button" class="gm-btn wa" id="aWa">💬 לשלוח בוואטסאפ</button><button type="button" class="gm-btn sec" id="aCopy">🔗 להעתיק קישור</button><div class="gm-copied" id="aCopied" aria-live="polite"></div></div>' +
          '<div class="gm-act"><h4>🎰 לוטו של הגן</h4><p>כרטיסי לוטו להדפסה מהרעיונות של הילדים – כל כרטיס שונה, 4 בדף. סבאבוקלי מכריז על המסך, והילדים מסמנים.</p><button type="button" class="gm-btn" id="aLotto">🖨️ כרטיסי לוטו</button></div>' +
          '<div class="gm-act"><h4>🖨️ סיכום להדפסה</h4><p>דף A4: כל מה שהילדים אמרו על הנושא, וקוד לסריקה כדי לשחק בבית. מתאים לתיק או ללוח ההורים.</p><button type="button" class="gm-btn" id="aPrint">🖨️ להדפיס</button></div>' +
          '<div class="gm-act"><h4>⭐ לפרסם באפליקציה</h4><p>המשחק יופיע בפינת "משחקים שגנים המציאו". בקשה נשלחת ל-BOOQLI, ונפרסם רק אחרי שנעבור עליו.</p>' +
            '<label class="gm-ok"><input type="checkbox" id="aOk"><span>אני מאשרת שאין במשחק שמות של ילדים, תמונות או פרטים אישיים, ומרשה ל-BOOQLI לפרסם אותו באתר ובאפליקציה. אין לגן זכויות על המשחק, ואפשר לבקש להוריד אותו בכל רגע.</span></label>' +
            '<button type="button" class="gm-btn" id="aPub" disabled>⭐ לבקש פרסום</button></div>' +
        '</div>' +
        '<div class="gm-row"><button type="button" class="gm-btn sec" id="aAgain">🔁 לשחק שוב</button><button type="button" class="gm-btn sec" id="aEdit">✏️ להוסיף או לתקן רעיונות</button><button type="button" class="gm-btn sec" id="aNew">🆕 משחק חדש</button></div>' +
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
      $("aLotto").onclick = function(){ var g = remember(); if (g) GMA.printLotto(g); };
      $("aOk").onchange = function(){ $("aPub").disabled = !this.checked; };
      $("aPub").onclick = function(){ ready().then(function(ok){ if (!ok) return; var g = remember(); siteEvent("gm-publish", S.k);
        var t = "היי BOOQLI 🎮 אנחנו גן " + g.g + ", המצאנו משחק עם הילדים ונשמח שתפרסמו אותו באפליקציה:\n" + g.n + " (" + g.it.length + " רעיונות על " + g.tp + ")\n" + gameUrl("publish") +
          "\n\nאני מאשרת שאין במשחק שמות של ילדים, תמונות או פרטים אישיים, ומרשה ל-BOOQLI לפרסם אותו באתר ובאפליקציה. אין לגן זכויות על המשחק, ואפשר לבקש להוריד אותו בכל רגע.";
        window.open("https://wa.me/" + SITE.phone + "?text=" + encodeURIComponent(t), "_blank", "noopener"); }); };
      $("aAgain").onclick = function(){ go("play"); };
      $("aEdit").onclick = function(){ go("ideas"); };
      $("aNew").onclick = function(){ var g = S.g; S = fresh(); S.g = g; save(); go("topic"); };
      remember();
    }
  };

  /* ---------- נושא ---------- */
  function setTopic(t, line){
    S.topic = t; S.ideas = []; S.k = "x"; save();
    GM.sound.ding(); siteEvent("gm-topic", t.i > -1 ? t.n : "own");
    BODY.querySelectorAll(".gm-tile").forEach(function(x){ x.disabled = true; });
    talk(line, true).then(function(){ if (S.step === "topic") go("ideas"); });
  }

  /* ---------- רעיונות ---------- */
  var MIN_IDEAS = 3, MAX_IDEAS = 40;
  var NEXT = ["מי הבא?", "מי ממשיך?", "ועכשיו – הילד הבא!", "עוד מישהו?", "מי עוד רוצה?"];
  function addIdea(v, pre){
    if (S.ideas.length >= MAX_IDEAS) { talk("וואו, " + MAX_IDEAS + " רעיונות! כל הגן אמר. עכשיו אני בונה משחק!"); return; }
    if (S.ideas.some(function(y){ return y.x === v; })) { talk("את " + v + " כבר אמרו! אולי משהו אחר?"); return; }
    S.ideas.push({ x: v, e: GM.guessEmoji(v, S.topic.e) }); save();
    GM.sound.pop(); drawIdeas(true);
    var n = S.ideas.length;
    talk((pre || pick(IDEA_REACT) + " ") + v + "! " + (n === MIN_IDEAS ? "כבר אפשר לבנות משחק – אבל עוד ילדים רוצים להגיד!" : pick(NEXT)), true);
  }
  function drawIdeas(newOne){
    var list = $("iList"); if (!list) return;
    var n = S.ideas.length;
    $("iKids").innerHTML = '<span class="gm-kn">🧒 ' + (n ? n + " ילדים כבר אמרו" : "עוד אף ילד לא אמר") + '</span><span class="gm-kdots" aria-hidden="true">' + new Array(n + 1).join("<i></i>") + '<i class="nx">' + (n + 1) + '</i></span>' +
      '<span class="gm-turn">🎤 תור ילד מספר ' + (n + 1) + '</span>';
    $("iDone").disabled = n < MIN_IDEAS;
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
    talk("וואו! " + S.ideas.length + " ילדים אמרו רעיונות. אני אוסף את כולם... ובונה משחק!", true);
    list.querySelectorAll(".gm-idea").forEach(function(b){
      b.style.transform = "translate(" + (Math.random() * 160 - 80) + "px," + (Math.random() * 80 - 40) + "px) rotate(" + (Math.random() * 50 - 25) + "deg) scale(.8)";
    });
    later(function(){ GM.sound.tada(); go("build"); }, 1600);
  }

  /* ---------- המשחק, הקישור והשליחה ---------- */
  function today(){ var d = typeof siteNow === "function" ? siteNow() : new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function makeGame(){
    var g = GM.sanitize({ v: 1, k: "x", n: S.n || "המשחק שלנו על " + S.topic.n, tp: S.topic.n, te: S.topic.e, g: S.g, d: today(), it: S.ideas });
    if (g) { S.code = GM.encode(g); save(); }
    return g;
  }
  function gameUrl(medium){ return SITE_URL + "g/?utm_source=" + (medium === "parents" ? "whatsapp" : "link") + "&utm_medium=" + (medium === "parents" ? "gan_parents" : medium) + "&utm_campaign=game-maker#" + S.code; }
  function parentsText(g){
    return "הורים יקרים 💕\nהיום בגן " + g.g + " המצאנו יחד משחק על " + g.tp + "! " + g.te + "\nכל ילד אמר מילה או משפט (" + g.it.length + " רעיונות!), וסבאבוקלי בנה מזה משחק של כל הגן.\n" +
      "שחקו איתם בבית ובקשו מהם לספר מה הם אמרו ולמה 😊\n▶️ " + gameUrl("parents") + "\n\nבחסות BOOQLI 📚 ספרי ילדים בהתאמה אישית";
  }
  function remember(){
    var g = makeGame(); if (!g || !S.code) return g;
    try {
      var list = JSON.parse(localStorage.getItem("booqli_gm_list") || "[]") || [];
      var key = S.topic.n + "|x|" + g.d;
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
  function voiceUi(){ var b = $("voiceBtn"); b.classList.toggle("off", !GM.voice()); b.setAttribute("aria-pressed", GM.voice()); b.title = "צלילים"; }
  $("voiceBtn").onclick = function(){ GM.setVoice(!GM.voice()); voiceUi(); };
  $("fullBtn").onclick = function(){
    var st = $("studio");
    if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    var fn = st.requestFullscreen || st.webkitRequestFullscreen; if (fn) fn.call(st); siteEvent("gm-full", S.step);
  };
  var ORDER = ["intro", "topic", "ideas", "build", "play", "finish"];
  $("backBtn").onclick = function(){
    var i = ORDER.indexOf(S.step); if (i < 1) return;
    var to = ORDER[i - 1]; if (to === "build") to = "ideas";
    go(to);
  };
  $("startBtn").onclick = function(){ $("studio").scrollIntoView({ behavior: "smooth", block: "start" }); var b = $("iGo"); if (b) b.click(); };
  voiceUi();

  // קישורים קבועים
  var ORDER_URL = "https://games.booqli.ai/savta/?utm_source=booqli_games&utm_medium=book_box&utm_campaign=game-maker";
  var GAN_URL = "https://wa.me/" + SITE.phone + "?text=" + encodeURIComponent("היי BOOQLI, אני מגן ילדים ורוצה הצעת מחיר לספר אישי לכל ילד בגן 🏫");
  $("orderLink").href = ORDER_URL; $("ganBtn").href = GAN_URL; $("ganLink").href = GAN_URL;
  siteJoinLinks(); siteDevBar(); siteBackBar("../../");

  renderSteps(); VIEWS.intro(); drawMine();
  // לבדיקות אוטומטיות בלבד
  window.__gm = { S: function(){ return S; }, go: go, set: function(x){ S = x; save(); } };
})();
