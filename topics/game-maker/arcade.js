/* =====================================================================
   המשחקים האמיתיים של "ממציאים משחק עם כל הגן" (3.11.2026, לפי שמש)
   מכל מה שהילדים אמרו, סבאבוקלי מגריל משחק "כמו באפליקציה":
     🏃 המרוץ של סבאבוקלי – קופצים מעל מכשולים ואוספים את הרעיונות של הילדים
     🧺 תופסים בסל – תופסים רק את מה שאמרנו על הנושא (לא את הגרב המסריחה)
     🐍 הנחש הרעב – הנחש אוכל את הרעיונות
     🎰 לוטו של הגן – סבאבוקלי מכריז, וכל ילד מסמן בכרטיס מודפס
   כל רעיון שנאסף קופץ על המסך בגדול עם המשפט של הילד (בלי קול – לפי שמש).
   GMA.hub(area, game, ctx) · ctx = {say, sound, win, prog, stopped(), esc, shuffle}
   ===================================================================== */
window.GMA = (function(){
  "use strict";
  var EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
  var GAMES = {
    quiz:  { ic: "❓", name: "החידון של סבאבוקלי", how: "שאלות על מה שאמרתם: סופרים, מסדרים את המשפט שסבאבוקלי בילגן, ועוד!" },
    run:   { ic: "🏃", name: "המרוץ של סבאבוקלי", how: "לוחצים כדי לקפוץ מעל המכשולים, ואוספים את הרעיונות שלכם!" },
    catch: { ic: "🧺", name: "תופסים בסל", how: "מזיזים את הסל ותופסים רק את מה שאמרנו. לא את הגרב המסריחה!" },
    snake: { ic: "🐍", name: "הנחש הרעב", how: "מכוונים את הנחש עם החצים, והוא אוכל את הרעיונות שלכם!" },
    lotto: { ic: "🎰", name: "לוטו של הגן", how: "סבאבוקלי מגריל רעיון, וכל ילד מחפש אותו בכרטיס שלו!" }
  };
  var ORDER = ["quiz", "run", "catch", "snake", "lotto"];
  var JUNK = [["🧦", "גרב מסריחה"], ["🪣", "דלי"], ["🧻", "נייר טואלט"], ["🥾", "נעל ישנה"], ["🧽", "ספוג"], ["🪥", "מברשת שיניים"], ["🧹", "מטאטא"], ["🩴", "כפכף"]];
  var ROCKS = ["🪨", "🌵", "🧦", "🪣", "🥾", "🧱"];
  var SABA_IMG = null;
  function sabaImg(){
    if (SABA_IMG) return SABA_IMG;
    SABA_IMG = new Image();
    var s = document.querySelector('script[src*="arcade.js"]');
    try { SABA_IMG.src = new URL("../../img/family/saba.svg", s.src).href; } catch (e) { SABA_IMG.src = "/img/family/saba.svg"; }
    return SABA_IMG;
  }
  function short(t, n){ t = String(t); return t.length > n ? t.slice(0, n - 1) + "…" : t; }
  function rnd(n){ return Math.floor(Math.random() * n); }

  /* ---------- מסגרת: קנבס שמתאים את עצמו למסך (גם להקרנה) ---------- */
  function canvas(area, W, H, label){
    var wrap = document.createElement("div"); wrap.className = "gma-wrap";
    wrap.innerHTML = '<div class="gma-pop" aria-live="polite"></div><canvas class="gma-cv" width="' + W + '" height="' + H + '" aria-label="' + label + '" tabindex="0"></canvas>';
    area.appendChild(wrap);
    var cv = wrap.querySelector("canvas");
    cv.style.aspectRatio = W + " / " + H;
    cv.style.maxWidth = "min(100%, calc(68vh * " + (W / H).toFixed(3) + "))";
    var g = cv.getContext("2d");
    g.textAlign = "center"; g.textBaseline = "middle";
    return { cv: cv, g: g, pop: wrap.querySelector(".gma-pop"), wrap: wrap };
  }
  function popText(el, idea){
    el.innerHTML = '<b aria-hidden="true">' + idea.e + '</b> ' + String(idea.x).replace(/[&<>"]/g, "");
    el.classList.remove("on"); void el.offsetWidth; el.classList.add("on");
  }
  function emoji(g, e, x, y, size){ g.font = size + "px " + EMOJI_FONT; g.fillText(e, x, y); }
  function label(g, t, x, y){
    g.save(); g.direction = "rtl"; g.font = "700 15px Assistant,Arial,sans-serif";
    var w = g.measureText(t).width + 14;
    g.fillStyle = "rgba(255,255,255,.92)"; g.strokeStyle = "#FFC2E6"; g.lineWidth = 2;
    g.beginPath(); if (g.roundRect) g.roundRect(x - w / 2, y - 11, w, 22, 11); else g.rect(x - w / 2, y - 11, w, 22); g.fill(); g.stroke();
    g.fillStyle = "#2B1526"; g.fillText(t, x, y + 1); g.restore();
  }
  // מקשים רק כשהמשחק על המסך (ובלי לגלול את העמוד עם רווח/חצים)
  function keys(cv, fn){
    var h = function(e){
      if (!cv.isConnected) { window.removeEventListener("keydown", h); return; }
      var t = e.target && e.target.tagName; if (t === "INPUT" || t === "TEXTAREA") return;
      var k = { ArrowUp: "u", ArrowDown: "d", ArrowLeft: "l", ArrowRight: "r", " ": "j", Enter: "j" }[e.key];
      if (k) { e.preventDefault(); fn(k); }
    };
    window.addEventListener("keydown", h);
  }

  /* ---------- 🏃 המרוץ ---------- */
  function runGame(area, game, ctx){
    var W = 800, H = 380, GROUND = 318, X = 150;
    var c = canvas(area, W, H, "המרוץ של סבאבוקלי"), g = c.g, cv = c.cv;
    var btn = document.createElement("div"); btn.className = "gma-ctrl";
    btn.innerHTML = '<button type="button" class="gm-btn big gma-jump">⬆️ קופצים!</button>'; c.wrap.appendChild(btn);
    var ideas = ctx.shuffle(game.it), need = Math.min(ideas.length, 10), got = 0, ii = 0;
    var y = GROUND, vy = 0, speed = 0.3, things = [], dist = 0, nextAt = 260, hurt = 0, slow = 0, last = 0, done = false, flag = null, t = 0;
    var clouds = [[120, 60], [430, 40], [680, 80]];
    var img = sabaImg();
    var jump = function(){ if (y >= GROUND - 1 && !done) { vy = -0.98; ctx.sound.pop(); } };
    cv.addEventListener("pointerdown", function(e){ e.preventDefault(); jump(); });
    btn.querySelector("button").onclick = jump;
    keys(cv, function(k){ if (k === "j" || k === "u") jump(); });
    var hud = function(){ ctx.prog.textContent = "🏃 אספתם " + got + " מתוך " + need; };
    var spawn = function(){
      var wantIdea = ii < ideas.length && (things.filter(function(o){ return o.idea; }).length < 2) && Math.random() < 0.6;
      if (wantIdea && got + things.filter(function(o){ return o.idea; }).length < need) {
        var high = Math.random() < 0.5;
        things.push({ x: W + 40, y: high ? GROUND - 150 : GROUND - 34, idea: ideas[ii++ % ideas.length] });
      } else things.push({ x: W + 40, y: GROUND - 22, rock: ROCKS[rnd(ROCKS.length)] });
      nextAt = dist + 260 + rnd(220);
    };
    var draw = function(){
      var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#BFE6FF"); sky.addColorStop(1, "#FFF6DD");
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      g.fillStyle = "#fff"; clouds.forEach(function(k){ g.beginPath(); g.arc(k[0], k[1], 22, 0, 7); g.arc(k[0] + 24, k[1] + 6, 18, 0, 7); g.arc(k[0] - 24, k[1] + 6, 16, 0, 7); g.fill(); });
      g.fillStyle = "#BFE3C9"; g.beginPath(); g.moveTo(0, GROUND); for (var i = 0; i <= W; i += 40) g.lineTo(i, GROUND - 30 - 18 * Math.sin((i + dist * 0.3) / 90)); g.lineTo(W, GROUND); g.fill();
      g.fillStyle = "#6F988B"; g.fillRect(0, GROUND, W, H - GROUND);
      g.fillStyle = "#4E8576"; for (var j = -((dist) % 60); j < W; j += 60) g.fillRect(j, GROUND + 18, 30, 6);
      if (flag) { emoji(g, "🏁", flag, GROUND - 40, 64); }
      things.forEach(function(o){
        if (o.rock) emoji(g, o.rock, o.x, o.y, 44);
        else { g.fillStyle = "#fff"; g.strokeStyle = "#FF56C2"; g.lineWidth = 4; g.beginPath(); g.arc(o.x, o.y, 30, 0, 7); g.fill(); g.stroke(); emoji(g, o.idea.e, o.x, o.y + 2, 36); label(g, short(o.idea.x, 16), o.x, o.y + 46); }
      });
      var bob = y >= GROUND - 1 ? Math.abs(Math.sin(t / 90)) * 6 : 0;
      g.save(); if (hurt > 0 && Math.floor(hurt / 120) % 2) g.globalAlpha = 0.35;
      if (img.complete && img.naturalWidth) g.drawImage(img, X - 42, y - 92 - bob, 84, 84); else emoji(g, "🦄", X, y - 45 - bob, 70);
      g.restore();
    };
    var loop = function(ts){
      if (ctx.stopped() || !cv.isConnected) return;
      var dt = Math.min(40, ts - (last || ts)); last = ts; t += dt;
      var sp = speed * (slow > 0 ? 0.45 : 1);
      dist += sp * dt; if (hurt > 0) hurt -= dt; if (slow > 0) slow -= dt;
      vy += 0.0034 * dt; y = Math.min(GROUND, y + vy * dt); if (y >= GROUND) vy = 0;
      clouds.forEach(function(k){ k[0] -= sp * dt * 0.2; if (k[0] < -60) k[0] = W + 60; });
      if (!done && dist >= nextAt) spawn();
      things.forEach(function(o){ o.x -= sp * dt; });
      things = things.filter(function(o){
        if (o.x < -60) return false;
        var near = Math.abs(o.x - X) < (o.idea ? 50 : 34);
        if (o.idea && near && Math.abs((y - 46) - o.y) < 62) {
          got++; ctx.sound.ding(); popText(c.pop, o.idea); ctx.say(o.idea.x); hud();
          if (got >= need && !done) { done = true; flag = W + 30; }
          return false;
        }
        if (o.rock && near && y > GROUND - 40 && hurt <= 0) { hurt = 1300; slow = 900; ctx.sound.soft(); c.pop.textContent = "אופס! קופצים מעל 🙂"; c.pop.classList.add("on"); }
        return true;
      });
      if (flag !== null) { flag -= sp * dt; if (flag < X + 30) { draw(); return setTimeout(ctx.win, 300); } }
      speed = Math.min(0.42, 0.3 + got * 0.012);
      draw(); requestAnimationFrame(loop);
    };
    hud(); draw(); requestAnimationFrame(loop);
    window.__gma = { kind: "run", st: function(){ return { got: got, need: need, things: things, y: y }; }, jump: jump };
  }

  /* ---------- 🧺 תופסים בסל ---------- */
  function catchGame(area, game, ctx){
    var W = 760, H = 440, BW = 120;
    var c = canvas(area, W, H, "תופסים בסל"), g = c.g, cv = c.cv;
    var ctl = document.createElement("div"); ctl.className = "gma-ctrl";
    ctl.innerHTML = '<button type="button" class="gm-btn sec big" data-d="1" aria-label="ימינה">➡️</button><button type="button" class="gm-btn sec big" data-d="-1" aria-label="שמאלה">⬅️</button>'; c.wrap.appendChild(ctl);
    var ideas = ctx.shuffle(game.it), need = Math.min(ideas.length + 2, 10), got = 0, ii = 0, bx = W / 2, items = [], last = 0, run = true, drag = false;
    var toX = function(e){ var r = cv.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
    cv.addEventListener("pointerdown", function(e){ drag = true; bx = toX(e); });
    cv.addEventListener("pointermove", function(e){ if (drag) bx = toX(e); });
    window.addEventListener("pointerup", function(){ drag = false; });
    ctl.querySelectorAll("button").forEach(function(b){
      var d = +b.getAttribute("data-d"), iv = null, mv = function(){ bx += d * 26; };   // ➡️ = ימינה (+), ⬅️ = שמאלה (-)
      b.addEventListener("pointerdown", function(){ mv(); iv = setInterval(mv, 45); });
      ["pointerup", "pointerleave"].forEach(function(ev){ b.addEventListener(ev, function(){ clearInterval(iv); }); });
    });
    keys(cv, function(k){ if (k === "l") bx -= 34; if (k === "r") bx += 34; });
    var hud = function(){ ctx.prog.textContent = "🧺 תפסתם " + got + " מתוך " + need; };
    var draw = function(){
      var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#E3F4FF"); sky.addColorStop(1, "#FFF6DD");
      g.fillStyle = sky; g.fillRect(0, 0, W, H); g.fillStyle = "#CDE7DC"; g.fillRect(0, H - 30, W, 30);
      items.forEach(function(o){
        if (o.idea) { g.fillStyle = "#fff"; g.strokeStyle = "#FF56C2"; g.lineWidth = 3; g.beginPath(); g.arc(o.x, o.y, 28, 0, 7); g.fill(); g.stroke(); emoji(g, o.idea.e, o.x, o.y + 2, 34); label(g, short(o.idea.x, 14), o.x, o.y + 42); }
        else { emoji(g, o.j[0], o.x, o.y, 44); }
      });
      emoji(g, "🧺", bx, H - 62, 78);
    };
    var loop = function(ts){
      if (ctx.stopped() || !cv.isConnected || !run) return;
      var dt = Math.min(40, ts - (last || ts)); last = ts;
      bx = Math.max(BW / 2, Math.min(W - BW / 2, bx));
      if (!items.length || (items[items.length - 1].y > 150 && items.length < 3)) {
        var isIdea = Math.random() < 0.62;
        items.push({ x: 50 + rnd(W - 100), y: -40, v: 0.085 + Math.min(0.06, got * 0.005), idea: isIdea ? ideas[ii++ % ideas.length] : null, j: isIdea ? null : JUNK[rnd(JUNK.length)] });
      }
      items.forEach(function(o){ o.y += o.v * dt; });
      items = items.filter(function(o){
        if (o.y > H - 100 && o.y < H - 40 && Math.abs(o.x - bx) < BW / 2 + 10) {
          if (o.idea) { got++; ctx.sound.ding(); popText(c.pop, o.idea); ctx.say(o.idea.x); hud();
            if (got >= need) { run = false; draw(); setTimeout(ctx.win, 500); } }
          else { ctx.sound.laugh(); c.pop.textContent = "אִיכְס! " + o.j[1] + " – זה לא שלנו 😄"; c.pop.classList.remove("on"); void c.pop.offsetWidth; c.pop.classList.add("on"); ctx.say("איכס! " + o.j[1]); }
          return false;
        }
        return o.y < H + 40;
      });
      draw(); if (run) requestAnimationFrame(loop);
    };
    hud(); draw(); requestAnimationFrame(loop);
    window.__gma = { kind: "catch", st: function(){ return { got: got, need: need, items: items, bx: bx }; }, setX: function(x){ bx = x; } };
  }

  /* ---------- 🐍 הנחש הרעב ---------- */
  function snakeGame(area, game, ctx){
    var N = 12, C = 40, W = N * C;
    var c = canvas(area, W, W, "הנחש הרעב"), g = c.g, cv = c.cv;
    var pad = document.createElement("div"); pad.className = "gma-pad";
    pad.innerHTML = '<button type="button" data-d="u" aria-label="למעלה">⬆️</button><div><button type="button" data-d="r" aria-label="ימינה">➡️</button><button type="button" data-d="d" aria-label="למטה">⬇️</button><button type="button" data-d="l" aria-label="שמאלה">⬅️</button></div>';
    c.wrap.appendChild(pad);
    var ideas = ctx.shuffle(game.it), need = Math.min(ideas.length, 8), got = 0, ii = 0;
    var snake = [[4, 6], [3, 6], [2, 6]], dir = "r", next = "r", food = null, timer = null;
    var free = function(){ var p; do { p = [rnd(N), rnd(N)]; } while (snake.some(function(s){ return s[0] === p[0] && s[1] === p[1]; })); return p; };
    var spawn = function(){ var p = free(); food = { x: p[0], y: p[1], idea: ideas[ii++ % ideas.length] }; };
    var turn = function(d){ var opp = { u: "d", d: "u", l: "r", r: "l" }; if (opp[d] !== dir) next = d; };
    pad.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ turn(b.getAttribute("data-d")); }; });
    keys(cv, turn);
    var sx = 0, sy = 0;
    cv.addEventListener("pointerdown", function(e){ sx = e.clientX; sy = e.clientY; });
    cv.addEventListener("pointerup", function(e){ var dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "d" : "u")); });
    var hud = function(){ ctx.prog.textContent = "🐍 הנחש אכל " + got + " מתוך " + need; };
    var draw = function(){
      g.fillStyle = "#F4FAF7"; g.fillRect(0, 0, W, W);
      g.fillStyle = "#E7F3ED"; for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) if ((i + j) % 2) g.fillRect(i * C, j * C, C, C);
      if (food) { g.fillStyle = "#fff"; g.strokeStyle = "#FF56C2"; g.lineWidth = 3; g.beginPath(); g.arc(food.x * C + C / 2, food.y * C + C / 2, C / 2 - 1, 0, 7); g.fill(); g.stroke(); emoji(g, food.idea.e, food.x * C + C / 2, food.y * C + C / 2 + 2, C - 12); }
      snake.forEach(function(s, k){ g.fillStyle = k ? (k % 2 ? "#FF8AD6" : "#FF56C2") : "#E0399F"; g.beginPath(); if (g.roundRect) g.roundRect(s[0] * C + 2, s[1] * C + 2, C - 4, C - 4, 10); else g.rect(s[0] * C + 2, s[1] * C + 2, C - 4, C - 4); g.fill(); });
      var h = snake[0]; g.fillStyle = "#fff"; g.beginPath(); g.arc(h[0] * C + C * .33, h[1] * C + C * .38, 5, 0, 7); g.arc(h[0] * C + C * .67, h[1] * C + C * .38, 5, 0, 7); g.fill();
      g.fillStyle = "#2B1526"; g.beginPath(); g.arc(h[0] * C + C * .33, h[1] * C + C * .38, 2.5, 0, 7); g.arc(h[0] * C + C * .67, h[1] * C + C * .38, 2.5, 0, 7); g.fill();
    };
    var step = function(){
      if (ctx.stopped() || !cv.isConnected) { clearInterval(timer); return; }
      dir = next; var h = snake[0], D = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[dir];
      var nh = [(h[0] + D[0] + N) % N, (h[1] + D[1] + N) % N];   // הקירות מעבירים לצד השני – בלי לפסול
      var hit = snake.findIndex(function(s){ return s[0] === nh[0] && s[1] === nh[1]; });
      if (hit > 0) { snake = snake.slice(0, Math.max(3, hit)); ctx.sound.soft(); }   // נוגעים בזנב – הוא רק מתקצר
      snake.unshift(nh);
      if (food && nh[0] === food.x && nh[1] === food.y) {
        got++; ctx.sound.ding(); popText(c.pop, food.idea); ctx.say(food.idea.x); hud();
        if (got >= need) { clearInterval(timer); food = null; draw(); return setTimeout(ctx.win, 400); }
        spawn();
      } else snake.pop();
      draw();
    };
    hud(); spawn(); draw(); timer = setInterval(step, 300);
    window.__gma = { kind: "snake", st: function(){ return { got: got, need: need, food: food, head: snake[0], dir: dir }; }, turn: turn };
  }

  /* ---------- ❓ החידון של סבאבוקלי – תמיד מהמילים של הילדים ----------
     סוגי שאלות: סופרים · חשבון (ועוד) · איפה יותר? · מסדרים משפט שסבאבוקלי בילגן · איזו מילה חסרה? ·
     מה אמרנו? · מה לא שייך? · ושאלות ידע על הנושא (רק לנושאים המוכנים – FACTS). */
  var FACTS = {
    "סתיו": [["מה קורה לעלים בסתיו?", "נושרים מהעצים", ["נהיים כחולים", "שרים שירים"]], ["איזו ציפור מגיעה אלינו בסתיו?", "נחליאלי", ["פינגווין", "תרנגולת"]], ["מה יורד מהשמיים בסתיו?", "גשם ראשון", ["שוקולד", "חול"]]],
    "חורף": [["מה לובשים כשקר?", "מעיל", ["בגד ים", "כפכפים"]], ["מה רואים בשמיים כשיש גשם ושמש יחד?", "קשת", ["ירח", "כוכב ים"]], ["מה יורד מהענן?", "גשם", ["חלב", "עוגה"]]],
    "חנוכה": [["כמה נרות מדליקים בלילה האחרון של חנוכה (בלי השמש)?", "8", ["3", "20"]], ["מה אוכלים בחנוכה?", "סופגניות", ["מצות", "פיצה עם שוקולד"]], ["מה מסובבים בחנוכה?", "סביבון", ["מטרייה", "גרב"]]],
    "חיות": [["מי נובח?", "כלב", ["חתול", "פרה"]], ["למי יש חדק?", "פיל", ["קוף", "דג"]], ["למי יש צוואר ארוך?", "ג'ירפה", ["צב", "ארנב"]]],
    "צבעים": [["מה יוצא מצהוב וכחול?", "ירוק", ["אדום", "שחור"]], ["באיזה צבע הבננה?", "צהוב", ["כחול", "סגול"]], ["באיזה צבע השמיים ביום בהיר?", "כחול", ["חום", "ורוד"]]],
    "פירות וירקות": [["מה גדל על עץ?", "תפוח", ["גזר", "תפוח אדמה"]], ["איזה ירק כתום?", "גזר", ["מלפפון", "חסה"]], ["מה עושים לפרי לפני שאוכלים?", "שוטפים", ["צובעים", "זורקים"]]],
    "המשפחה שלי": [["מי זה אבא של אמא?", "סבא", ["אח", "תינוק"]], ["מי עוד לא יודע לדבר?", "תינוק", ["סבתא", "אבא"]], ["איפה גרה המשפחה?", "בבית", ["בענן", "בים"]]],
    "מקצועות": [["מי מכבה שריפות?", "כבאי", ["טבח", "דוור"]], ["מי מטפלת בחולים?", "רופאה", ["טייסת", "נגרית"]], ["מי מטיס מטוס?", "טייס", ["חקלאי", "שוטר"]]],
    "תחבורה": [["מה נוסע על פסים?", "רכבת", ["אופניים", "סירה"]], ["מה טס בשמיים?", "מטוס", ["אוטובוס", "טרקטור"]], ["באיזה צבע ברמזור עוצרים?", "אדום", ["ירוק", "כחול"]]],
    "הים": [["איפה גר הדג?", "במים", ["על עץ", "במדבר"]], ["כמה זרועות יש לתמנון?", "8", ["2", "4"]], ["מה בונים מחול על החוף?", "ארמון חול", ["איש שלג", "סופגנייה"]]],
    "החלל": [["מה מאיר לנו ביום?", "השמש", ["הירח", "פנס"]], ["מה רואים בשמיים בלילה?", "ירח וכוכבים", ["קשת", "עננים ורודים"]], ["במה טסים לחלל?", "חללית", ["אופניים", "סירה"]]],
    "הגוף שלנו": [["במה רואים?", "עיניים", ["אוזניים", "אף"]], ["במה שומעים?", "אוזניים", ["ברכיים", "שיניים"]], ["כמה אצבעות יש ביד אחת?", "5", ["3", "10"]]]
  };
  var SILLY_Q = ["פיל ורוד עם משקפיים", "גלידה בטעם מלפפון", "מכונית שעושה מיאו", "דג על אופניים", "סבאבוקלי בפיג'מה", "בננה שרוקדת", "ענן בטעם תות", "חתול שנובח", "מקרר שמנגן בגיטרה", "נעל עם כנפיים"];
  var NUMW = ["", "אחד", "שניים", "שלושה", "ארבעה", "חמישה", "שישה", "שבעה", "שמונה", "תשעה", "עשרה"];
  function quizGame(area, game, ctx){
    var heb = function(w){ return w.replace(/[^֐-׿\w]/g, ""); };
    var words = function(t){ return t.split(/\s+/).filter(function(w){ return heb(w).length >= 1; }); };
    var it = game.it, multi = it.filter(function(x){ var w = words(x.x); return w.length >= 2 && w.length <= 6; });
    var esc = ctx.esc, R = [], pickI = function(){ return it[rnd(it.length)]; };
    // סופרים
    R.push(function(){ var x = pickI(), n = 2 + rnd(5); return { e: "🔢", title: "כמה " + x.e + " יש כאן?", sub: '<div class="gma-count">' + new Array(n + 1).join("<i>" + x.e + "</i>") + '</div>', opts: [String(n), String(n + 1 > 7 ? n - 2 : n + 1), String(n - 1)], ok: String(n), okSay: n + " – " + NUMW[n] + "!" }; });
    // חשבון: ועוד
    R.push(function(){ var x = pickI(), a = 1 + rnd(4), b = 1 + rnd(3), c = a + b; return { e: "➕", title: "כמה יש ביחד?", sub: '<div class="gma-count">' + new Array(a + 1).join("<i>" + x.e + "</i>") + '<span class="gma-op">+</span>' + new Array(b + 1).join("<i>" + x.e + "</i>") + '</div><p class="gma-math">' + a + " + " + b + " = ?</p>", opts: [String(c), String(c + 1), String(c - 1 || c + 2)], ok: String(c), okSay: a + " ועוד " + b + " זה " + c + "!" }; });
    // איפה יותר?
    R.push(function(){ var x = pickI(), y = it.length > 1 ? it.filter(function(z){ return z !== x && z.e !== x.e; })[0] || x : x, a = 2 + rnd(4), b = a + 1 + rnd(2); if (rnd(2)) { var t = a; a = b; b = t; }
      var A = "שורה " + (a > b ? "ראשונה" : "שנייה");
      return { e: "⚖️", title: "באיזו שורה יש יותר?", sub: '<div class="gma-count gma-rows"><div><b>1</b>' + new Array(a + 1).join("<i>" + x.e + "</i>") + '</div><div><b>2</b>' + new Array(b + 1).join("<i>" + y.e + "</i>") + '</div></div>', opts: ["שורה ראשונה", "שורה שנייה", "אותו דבר"], ok: A }; });
    // מסדרים משפט שסבאבוקלי בילגן (עד 2)
    ctx.shuffle(multi).slice(0, 2).forEach(function(x){ R.push(function(){ return { order: x }; }); });
    // איזו מילה חסרה?
    if (multi.length) R.push(function(){ var x = multi[rnd(multi.length)], w = words(x.x), k = w.map(function(_, i){ return i; }).sort(function(a, b){ return heb(w[b]).length - heb(w[a]).length; })[0], right = w[k], others = [];
      it.forEach(function(y){ if (y !== x) words(y.x).forEach(function(z){ if (z !== right && w.indexOf(z) < 0 && others.indexOf(z) < 0 && heb(z).length > 1) others.push(z); }); });
      others = ctx.shuffle(others).concat(["בננה", "גרביים", "מקרר"]).slice(0, 2);
      return { e: x.e, title: "איזו מילה חסרה?", sub: '<p class="gm-sent">' + w.map(function(z, i){ return i === k ? '<span class="gm-blank">?</span>' : esc(z); }).join(" ") + '</p>', opts: [right].concat(others), ok: right, okSay: x.x }; });
    // מה אמרנו?
    R.push(function(){ var x = pickI(); return { e: game.te || "💡", title: "מה אמרנו על " + game.tp + "?", opts: [x.x].concat(ctx.shuffle(SILLY_Q).slice(0, 2)), ok: x.x }; });
    // מה לא שייך?
    if (it.length >= 2) R.push(function(){ var two = ctx.shuffle(it).slice(0, 2), j = JUNK[rnd(JUNK.length)]; return { e: "🧐", title: "מה לא שייך ל" + (game.tp.charAt(0) === "ה" ? game.tp.slice(1) : game.tp) + "?", opts: [two[0].e + " " + two[0].x, two[1].e + " " + two[1].x, j[0] + " " + j[1]], ok: j[0] + " " + j[1], okSay: j[1] + " לא שייך! 😄" }; });
    // שאלות ידע על הנושא
    ctx.shuffle(FACTS[game.tp] || []).slice(0, 2).forEach(function(f){ R.push(function(){ return { e: game.te || "💡", title: f[0], opts: [f[1]].concat(f[2]), ok: f[1] }; }); });
    var rounds = ctx.shuffle(R).slice(0, 8), ri = 0, box = document.createElement("div"); area.appendChild(box);
    var hud = function(){ ctx.prog.textContent = "❓ שאלה " + Math.min(ri + 1, rounds.length) + " מתוך " + rounds.length; };
    var PRAISE = ["כל הכבוד!", "נכון מאוד!", "מצוין!", "יופי!", "אלופים!"];
    var next = function(){
      if (ctx.stopped()) return;
      if (ri >= rounds.length) return ctx.win();
      hud(); var q = rounds[ri++]();
      window.__gmaQ = q;
      if (q.order) return orderRound(q.order);
      var opts = ctx.shuffle(q.opts);
      box.innerHTML = '<div class="gm-q"><div class="gm-q-e" aria-hidden="true">' + esc(q.e) + '</div><h3 class="gm-q-t">' + esc(q.title) + '</h3>' + (q.sub || "") +
        '<div class="gm-opts">' + opts.map(function(o, i){ return '<button type="button" class="gm-opt" data-i="' + i + '"><span class="gm-ol">' + "אבג"[i] + '</span>' + esc(o) + '</button>'; }).join("") + '</div><div class="gm-fb" aria-live="polite"></div></div>';
      var fin = false, fb = box.querySelector(".gm-fb");
      box.querySelectorAll(".gm-opt").forEach(function(b){ b.onclick = function(){
        if (fin) return; var v = opts[+b.getAttribute("data-i")];
        if (v === q.ok) { fin = true; b.classList.add("ok"); ctx.sound.ding(); fb.textContent = "🎉 " + PRAISE[rnd(PRAISE.length)] + " " + (q.okSay || ""); setTimeout(next, 2100); }
        else { b.classList.add("no"); b.disabled = true; ctx.sound.soft(); fb.textContent = "כמעט! נסו שוב 🙂"; }
      }; });
    };
    // סבאבוקלי בילגן את המשפט – לוחצים על המילים לפי הסדר
    var orderRound = function(x){
      var w = words(x.x), mix = ctx.shuffle(w.map(function(z, i){ return { z: z, i: i }; }));
      var tries = 0; while (mix.every(function(m, k){ return m.i === k; }) && tries++ < 10) mix = ctx.shuffle(mix);
      var at = 0;
      box.innerHTML = '<div class="gm-q"><div class="gm-q-e" aria-hidden="true">🌀</div><h3 class="gm-q-t">אוי! סבאבוקלי בילגן את המשפט</h3><p class="gma-tip" style="font-size:.85em">לוחצים על המילים לפי הסדר הנכון</p>' +
        '<div class="gma-line">' + w.map(function(){ return '<span class="gma-slot"></span>'; }).join("") + '<b aria-hidden="true">' + esc(x.e) + '</b></div>' +
        '<div class="gma-tiles">' + mix.map(function(m, k){ return '<button type="button" class="gma-tile" data-k="' + k + '">' + esc(m.z) + '</button>'; }).join("") + '</div><div class="gm-fb" aria-live="polite"></div></div>';
      var slots = box.querySelectorAll(".gma-slot"), fb = box.querySelector(".gm-fb");
      box.querySelectorAll(".gma-tile").forEach(function(b){ b.onclick = function(){
        var m = mix[+b.getAttribute("data-k")];
        if (m.z === w[at]) { slots[at].textContent = m.z; slots[at].classList.add("on"); b.disabled = true; b.classList.add("used"); ctx.sound.pop(); at++;
          if (at === w.length) { ctx.sound.ding(); fb.textContent = "🎉 סידרתם! " + x.x; setTimeout(next, 2300); } }
        else { b.classList.remove("no"); void b.offsetWidth; b.classList.add("no"); ctx.sound.soft(); fb.textContent = "כמעט! איזו מילה באה עכשיו? 🙂"; }
      }; });
    };
    window.__gma = { kind: "quiz", st: function(){ return { ri: ri, n: rounds.length }; } };
    next();
  }

  /* ---------- 🎰 לוטו של הגן ---------- */
  function lottoGame(area, game, ctx){
    var ideas = ctx.shuffle(game.it), drawn = [];
    var box = document.createElement("div"); box.className = "gma-lotto";
    box.innerHTML = '<div class="gma-ball" aria-live="polite"><span class="gma-q">🎰</span><small>לוחצים "להגריל" – וסבאבוקלי מכריז רעיון</small></div>' +
      '<div class="gm-row" style="justify-content:center"><button type="button" class="gm-btn big" data-a="draw">🎲 להגריל</button><button type="button" class="gm-btn sec" data-a="bingo">🏆 לוטו! מישהו מילא כרטיס</button><button type="button" class="gm-btn sec" data-a="print">🖨️ כרטיסים להדפסה</button></div>' +
      '<p class="gma-tip">איך משחקים: מדפיסים כרטיסים, כל ילד מקבל כרטיס ומדבקות או עפרון. סבאבוקלי מגריל רעיון – מי שיש לו בכרטיס מסמן. מי שמילא את כל הכרטיס צועק "לוטו!"</p>' +
      '<div class="gm-label">כבר הוגרלו:</div><div class="gm-ideas gma-drawn"></div>';
    area.appendChild(box);
    var ball = box.querySelector(".gma-ball"), list = box.querySelector(".gma-drawn");
    var hud = function(){ ctx.prog.textContent = "🎰 הוגרלו " + drawn.length + " מתוך " + ideas.length; };
    box.querySelector('[data-a="draw"]').onclick = function(){
      if (drawn.length >= ideas.length) { ctx.say("הוגרלו כל הרעיונות! מי מילא את הכרטיס?"); return; }
      var b = this; b.disabled = true;
      var spin = 0, iv = setInterval(function(){ ball.innerHTML = '<span class="gma-q">' + ideas[rnd(ideas.length)].e + '</span>'; ctx.sound.pop(); if (++spin > 8) { clearInterval(iv); show(); } }, 110);
      var show = function(){
        var it = ideas[drawn.length]; drawn.push(it);
        ball.innerHTML = '<span class="gma-q">' + it.e + '</span><b>' + ctx.esc(it.x) + '</b>';
        ball.classList.remove("on"); void ball.offsetWidth; ball.classList.add("on");
        var chip = document.createElement("span"); chip.className = "gm-idea"; chip.style.animation = "none"; chip.innerHTML = '<b aria-hidden="true">' + it.e + '</b>' + ctx.esc(it.x); list.insertBefore(chip, list.firstChild);
        ctx.say("מי מוצא בכרטיס: " + it.x + "?"); hud(); b.disabled = false;
      };
    };
    box.querySelector('[data-a="bingo"]').onclick = function(){ ctx.win(); };
    box.querySelector('[data-a="print"]').onclick = function(){ printLotto(game); };
    hud(); ctx.say(GAMES.lotto.how);
  }
  // כרטיסי לוטו: 4 בעמוד A4, כל כרטיס שונה.
  function lottoCards(game, count){
    // כדי שלא כולם ימלאו יחד: בכרטיס פחות משבצות ממספר הרעיונות (13+ רעיונות = 9 בכרטיס, 6–12 = 4, פחות = אחד פחות)
    var it = game.it, per = it.length >= 13 ? 9 : it.length >= 6 ? 4 : Math.max(2, it.length - 1), cols = per === 9 ? 3 : 2, cards = [], seen = {};
    for (var i = 0; i < count; i++) {
      var pick, key, tries = 0;
      do { pick = shuffleArr(it).slice(0, per); key = pick.map(function(x){ return x.x; }).sort().join("|"); } while (seen[key] && ++tries < 30);
      seen[key] = 1; cards.push(pick);
    }
    var esc = function(s){ return String(s).replace(/[&<>"]/g, function(ch){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); };
    var html = '<div class="s-lotto">';
    cards.forEach(function(cd, n){
      html += '<div class="s-lcard"><div class="s-lh">🎰 לוטו של ' + esc(game.g ? "גן " + game.g : "הגן") + ' · ' + esc(game.te) + " " + esc(game.tp) + '<span>כרטיס ' + (n + 1) + '</span></div>' +
        '<div class="s-lg" style="grid-template-columns:repeat(' + cols + ',1fr)">' + cd.map(function(x){ return '<div><b>' + esc(x.e) + '</b><small>' + esc(short(x.x, 26)) + '</small></div>'; }).join("") + '</div>' +
        '<div class="s-lf">booqli Games · בחסות BOOQLI</div></div>';
      if (n % 4 === 3 && n < cards.length - 1) html += '</div><div class="s-lotto s-break">';
    });
    return html + '</div>';
  }
  function shuffleArr(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function printLotto(game){
    var n = parseInt(prompt("כמה כרטיסים להדפיס? (כרטיס לכל ילד, 4 בכל דף)", "24"), 10);
    if (!n || n < 1) return;
    n = Math.min(40, n);
    var pa = document.getElementById("printArea");
    if (!pa) { pa = document.createElement("div"); pa.id = "printArea"; document.body.appendChild(pa); }
    pa.innerHTML = lottoCards(game, n);
    if (typeof siteEvent === "function") siteEvent("gm-lotto-print", String(n));
    setTimeout(function(){ window.print(); }, 300);
  }

  /* ---------- הכניסה: סבאבוקלי מגריל משחק ---------- */
  function hub(area, game, ctx, pickId){
    var RUN = { quiz: quizGame, run: runGame, "catch": catchGame, snake: snakeGame, lotto: lottoGame };
    var bar = document.createElement("div"); bar.className = "gma-bar";
    bar.innerHTML = '<span>🎮 משחק אחר:</span>' + ORDER.map(function(k){ return '<button type="button" data-g="' + k + '">' + GAMES[k].ic + " " + GAMES[k].name + '</button>'; }).join("");
    var stage = document.createElement("div");
    area.innerHTML = ""; area.appendChild(stage); area.appendChild(bar);
    var start = function(id){
      if (typeof siteEvent === "function") siteEvent("gm-arcade", id);
      bar.querySelectorAll("button").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-g") === id); });
      stage.innerHTML = '<div class="gma-title"><b>' + GAMES[id].ic + " " + GAMES[id].name + '</b><span>' + GAMES[id].how + '</span></div>';
      if (id !== "lotto") ctx.say(GAMES[id].name + "! " + GAMES[id].how);
      RUN[id](stage, game, ctx);
    };
    bar.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ start(b.getAttribute("data-g")); }; });
    if (pickId && RUN[pickId]) return start(pickId);
    // הגרלה: גלגל קטן שמסתובב בין המשחקים ונעצר על אחד
    var wheel = document.createElement("div"); wheel.className = "gma-wheel";
    wheel.innerHTML = '<div class="gma-wl">🎡 סבאבוקלי מגריל משחק...</div><div class="gma-wi"></div>';
    stage.appendChild(wheel);
    var three = ["quiz", "run", "catch", "snake"], target = three[rnd(4)], k = 0, steps = 10 + rnd(3);
    ctx.say("סבאבוקלי מגריל משחק!");
    var tick = function(){
      if (ctx.stopped() || !wheel.isConnected) return;
      var id = k >= steps ? target : three[k % 4];
      wheel.querySelector(".gma-wi").innerHTML = '<b>' + GAMES[id].ic + '</b>' + GAMES[id].name;
      ctx.sound.pop();
      if (k++ >= steps) { ctx.sound.tada(); return setTimeout(function(){ start(target); }, 900); }
      setTimeout(tick, 90 + k * 18);
    };
    tick();
  }

  return { hub: hub, GAMES: GAMES, ORDER: ORDER, lottoCards: lottoCards, printLotto: printLotto };
})();
