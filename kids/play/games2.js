/* =====================================================================
   חדר המשחקים – 7 משחקים נוספים (מ-1.11.2026): הנחש הרעב, באולינג, תופסים בסל, מי הציץ מהגומה?, פאזל הזזה, מאזניים, חיפוש מילים
   מקוריים: מכניקות כלליות ידועות בעיצוב שלנו בלבד (בלי שמות, דמויות או מראה של מוצרים מוגנים – למשל לא טטריס).
   כל משחק עם משהו שלומדים, הוראה בקול, טעות = "כמעט! נסו שוב", ניצחון בסוף. משתמש ב-api מ-index.html.
   לבדיקות אוטומטיות כל משחק חושף את המצב שלו ב-window.__kg (לא משפיע על המשחק).
   ===================================================================== */
(function(){
var KG = window.KG;
var css = function(t){ var s = document.createElement("style"); s.textContent = t; document.head.appendChild(s); };
var modes = function(stage, title, list, cb){
  stage.innerHTML = '<div class="kg-q">' + title + '</div><div class="kg-row" style="flex-direction:column">' +
    list.map(function(m, i){ return '<button type="button" class="kg-btn' + (i ? " alt" : "") + '" data-i="' + i + '" style="min-width:240px">' + m + '</button>'; }).join("") + '</div>';
  stage.querySelectorAll("[data-i]").forEach(function(b){ b.onclick = function(){ cb(+b.dataset.i); }; });
};
var alive = function(node){ return document.body.contains(node); };
var pad = function(){ return '<div class="mz-pad" style="margin:10px auto 0"><span></span><button type="button" data-d="u" aria-label="למעלה">⬆️</button><span></span><button type="button" data-d="l" aria-label="שמאלה">⬅️</button><button type="button" data-d="d" aria-label="למטה">⬇️</button><button type="button" data-d="r" aria-label="ימינה">➡️</button></div>'; };
var swipe = function(node, cb){ var sx = 0, sy = 0;
  node.addEventListener("pointerdown", function(e){ sx = e.clientX; sy = e.clientY; });
  node.addEventListener("pointerup", function(e){ var dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return; cb(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "d" : "u")); }); };
var keys = function(node, cb){ document.onkeydown = function(e){ if (!alive(node)) { document.onkeydown = null; return; } var k = {ArrowUp:"u", ArrowDown:"d", ArrowLeft:"l", ArrowRight:"r"}[e.key]; if (k) { e.preventDefault(); cb(k); } }; };
var FRUITS = ["🍎","🍌","🍇","🍓","🍐","🍊","🍉","🍒"], OTHER = [["🚗","כלי רכב"],["👟","נעל"],["⚽","כדור"],["🧸","דובי"],["🔑","מפתח"],["✏️","עיפרון"],["🧦","גרב"],["🎈","בלון"]];
css(
  ".kg-canvas{display:block;margin:0 auto;max-width:100%;border-radius:20px;touch-action:none;background:#F4FAF7}" +
  ".kg-hud{display:flex;justify-content:center;gap:14px;align-items:center;font-family:Fredoka,Assistant,sans-serif;font-size:20px;margin-bottom:8px;flex-wrap:wrap}" +
  ".kg-hud b{color:#E0399F}" +
  ".holes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:420px;margin:0 auto}" +
  ".hole{position:relative;aspect-ratio:1;border:0;border-radius:50%;background:radial-gradient(ellipse at 50% 70%,#7A5233 0 46%,#A97C50 47% 60%,#CDE7DC 61%);cursor:pointer;overflow:hidden;padding:0}" +
  ".hole .bn{position:absolute;left:50%;bottom:-100%;transform:translateX(-50%);transition:bottom .22s;display:flex;flex-direction:column;align-items:center;line-height:1;pointer-events:none}" +
  ".hole.up .bn{bottom:14%}.hole .bn i{font-style:normal;font-size:clamp(34px,10vw,52px)}" +
  ".hole .bn b{background:#fff;border:3px solid #FF56C2;border-radius:12px;font-family:Fredoka,Assistant,sans-serif;font-size:clamp(18px,5vw,26px);min-width:1.7em;padding:0 4px;margin-top:-4px;color:#2B1526}" +
  ".slide{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:330px;margin:10px auto;direction:ltr}" +
  ".slide button{aspect-ratio:1;border:0;border-radius:18px;font-family:Fredoka,Assistant,sans-serif;font-size:clamp(34px,10vw,48px);font-weight:700;color:#fff;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,.18)}" +
  ".slide button.e{background:transparent;box-shadow:none;cursor:default}" +
  ".bal{position:relative;max-width:420px;height:230px;margin:6px auto 0}" +
  ".bal .post{position:absolute;left:50%;bottom:0;width:16px;height:150px;margin-left:-8px;background:#6F988B;border-radius:8px}" +
  ".bal .base{position:absolute;left:50%;bottom:0;width:120px;height:16px;margin-left:-60px;background:#4E8576;border-radius:8px}" +
  ".bal .beam{position:absolute;left:6%;right:6%;top:64px;height:12px;background:#4E8576;border-radius:6px;transition:transform .5s;transform-origin:50% 50%}" +
  ".bal .pan{position:absolute;top:6px;width:38%;min-height:58px;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;align-items:flex-end;transform:translateY(-100%)}" +
  ".bal .pan.l{left:0}.bal .pan.r{right:0}" +
  ".wt{display:inline-grid;place-items:center;min-width:44px;height:44px;padding:0 6px;border-radius:12px;background:#FFC93C;font-family:Fredoka,Assistant,sans-serif;font-weight:700;font-size:22px;color:#2B1526;box-shadow:0 3px 0 #D9A400}" +
  ".wt.big{background:#FF56C2;color:#fff;box-shadow:0 3px 0 #A3216F;min-width:58px;height:58px;font-size:28px}" +
  ".ws{display:grid;gap:5px;max-width:400px;margin:10px auto;direction:rtl}" +
  ".ws button{aspect-ratio:1;border:0;border-radius:12px;background:#F4FAF7;font-family:Fredoka,Assistant,sans-serif;font-size:clamp(20px,6vw,28px);font-weight:700;color:#2B1526;cursor:pointer;padding:0}" +
  ".ws button.sel{background:#FFE3F4;outline:3px solid #FF56C2}.ws button.found{background:#C8F0D4}" +
  ".ws-list{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}" +
  ".ws-list span{background:#fff;border:2px solid #E1F0EA;border-radius:999px;padding:4px 12px;font-weight:800;font-size:17px}" +
  ".ws-list span.f{background:#C8F0D4;border-color:#46C46E;text-decoration:line-through}"
);

/* ===== 14. הנחש הרעב ===== */
KG.push({id:"snake", name:"הנחש הרעב", ic:"🐍", bg:"#DDF5E5", ages:[5,8], kind:"game",
  learn:"תכנון כיוונים, ובמצב מספרים – סדר המספרים מ-1 עד 10",
  intro:"הנחש הרעב. מכוונים את הנחש עם החצים או בהחלקה, ואוכלים! במצב מספרים אוכלים לפי הסדר: אחת, שתיים, שלוש...",
  run: function(stage, api){
    modes(stage, "מה הנחש אוכל?", ["🍎 פירות – אוכלים 10 (גילאי 5–6)", "🔢 מספרים לפי הסדר 1–10 (גילאי 7–8)"], function(m){
      var N = 12, C = 28, snake = [[5, 6], [4, 6], [3, 6]], dir = "r", next = "r", eaten = 0, items = [], timer = null, nums = m === 1;
      stage.innerHTML = '<div class="kg-hud"><span id="snT"></span></div><canvas class="kg-canvas" id="snC" width="' + N * C + '" height="' + N * C + '" aria-label="לוח הנחש"></canvas>' + pad();
      var cv = stage.querySelector("#snC"), g = cv.getContext("2d"), hud = stage.querySelector("#snT");
      var free = function(){ var c; do { c = [api.rnd(N), api.rnd(N)]; } while (snake.some(function(s){ return s[0] === c[0] && s[1] === c[1]; }) || items.some(function(it){ return it.x === c[0] && it.y === c[1]; })); return c; };
      var spawn = function(){
        items = [];
        if (!nums) { var c = free(); items.push({x: c[0], y: c[1], e: FRUITS[api.rnd(FRUITS.length)]}); }
        else { var want = eaten + 1, opts = [want]; while (opts.length < Math.min(3, 10 - eaten + 2)) { var o = 1 + api.rnd(10); if (opts.indexOf(o) < 0 && o !== want) opts.push(o); }
          opts.slice(0, 3).forEach(function(n){ var c = free(); items.push({x: c[0], y: c[1], n: n}); }); }
        paint();
      };
      var paint = function(){
        hud.innerHTML = nums ? 'עכשיו אוכלים: <b>' + (eaten + 1) + '</b> · הצלחתם: ' + eaten + ' / 10' : 'אכלתם: <b>' + eaten + '</b> / 10';
        g.fillStyle = "#F4FAF7"; g.fillRect(0, 0, N * C, N * C);
        g.fillStyle = "#E7F3ED"; for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) if ((i + j) % 2) g.fillRect(i * C, j * C, C, C);
        g.textAlign = "center"; g.textBaseline = "middle";
        items.forEach(function(it){
          if (it.e) { g.font = (C - 4) + "px 'Noto Color Emoji',sans-serif"; g.fillText(it.e, it.x * C + C / 2, it.y * C + C / 2 + 2); }
          else { g.fillStyle = "#fff"; g.beginPath(); g.arc(it.x * C + C / 2, it.y * C + C / 2, C / 2 - 1, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = "#FF56C2"; g.stroke();
            g.fillStyle = "#2B1526"; g.font = "700 " + (C - 10) + "px Fredoka,Assistant,sans-serif"; g.fillText(it.n, it.x * C + C / 2, it.y * C + C / 2 + 1); }
        });
        snake.forEach(function(s, k){ g.fillStyle = k ? (k % 2 ? "#46C46E" : "#3DB65A") : "#2E9A55"; g.beginPath(); g.roundRect ? g.roundRect(s[0] * C + 1, s[1] * C + 1, C - 2, C - 2, 8) : g.rect(s[0] * C + 1, s[1] * C + 1, C - 2, C - 2); g.fill(); });
        var h = snake[0]; g.fillStyle = "#fff"; g.beginPath(); g.arc(h[0] * C + C * .35, h[1] * C + C * .38, 4, 0, 7); g.arc(h[0] * C + C * .65, h[1] * C + C * .38, 4, 0, 7); g.fill();
        g.fillStyle = "#2B1526"; g.beginPath(); g.arc(h[0] * C + C * .35, h[1] * C + C * .38, 2, 0, 7); g.arc(h[0] * C + C * .65, h[1] * C + C * .38, 2, 0, 7); g.fill();
      };
      var turn = function(d){ var opp = {u:"d", d:"u", l:"r", r:"l"}; if (opp[d] !== dir) next = d; };
      var step = function(){
        if (!alive(cv)) { clearInterval(timer); return; }
        dir = next; var h = snake[0], D = {u:[0,-1], d:[0,1], l:[-1,0], r:[1,0]}[dir];
        var nh = [(h[0] + D[0] + N) % N, (h[1] + D[1] + N) % N];   // הקירות "מעבירים" לצד השני – בלי לפסול
        var hitSelf = snake.findIndex(function(s){ return s[0] === nh[0] && s[1] === nh[1]; });
        if (hitSelf > 0) { snake = snake.slice(0, Math.max(3, hitSelf)); api.SND.soft(); }   // נוגעים בזנב – הוא רק מתקצר
        snake.unshift(nh);
        var it = items.find(function(t){ return t.x === nh[0] && t.y === nh[1]; }), grow = false;
        if (it) {
          if (!nums || it.n === eaten + 1) { eaten++; grow = true; api.SND.ok(); if (nums) api.say(String(eaten));
            if (eaten >= 10) { clearInterval(timer); paint(); return setTimeout(function(){ api.win(nums ? "אכלתם את כל המספרים מ-1 עד 10 לפי הסדר!" : "הנחש אכל 10 פירות!", "🐍"); }, 300); }
            spawn(); }
          else { items = items.filter(function(t){ return t !== it; }); var c = free(); items.push({x: c[0], y: c[1], n: it.n}); api.almost(stage, "עכשיו מחפשים " + (eaten + 1)); }
        }
        if (!grow) snake.pop();
        window.__kg = {snake: snake, items: items, want: eaten + 1, nums: nums, N: N};
        paint();
      };
      stage.querySelectorAll(".mz-pad button").forEach(function(b){ b.onclick = function(){ turn(b.dataset.d); }; });
      swipe(cv, turn); keys(cv, turn);
      spawn(); timer = setInterval(step, 260);
      api.say(nums ? "אוֹכְלִים לְפִי הַסֵּדֶר. קֹדֶם אַחַת!" : "אוֹכְלִים פֵּרוֹת!");
    });
    api.say(this.intro);
  }});

/* ===== 15. באולינג ===== */
KG.push({id:"bowling", name:"באולינג", ic:"🎳", bg:"#E3E6FF", ages:[4,8], kind:"game",
  learn:"ספירה: אחרי כל זריקה סופרים כמה פינים נפלו, ותזמון",
  intro:"באולינג! החץ זז ימינה ושמאלה. לוחצים על זרקו כשהוא מכוון לפינים. אחר כך סופרים כמה נפלו.",
  run: function(stage, api){
    var W = 320, H = 470, R = 12, BR = 15, rolls = 0, ROLLS = 5, total = 0, ang = 0, angDir = 1, busy = false, raf = null;
    stage.innerHTML = '<div class="kg-hud"><span>זריקה <b id="bwN">1</b> / ' + ROLLS + '</span><span>נפלו בסך הכל: <b id="bwS">0</b></span></div><canvas class="kg-canvas" id="bwC" width="' + W + '" height="' + H + '" aria-label="מסלול באולינג"></canvas><div class="kg-row" style="margin-top:10px"><button type="button" class="kg-btn" id="bwGo" style="font-size:22px;padding:13px 34px">🎳 זרקו!</button></div><div id="bwQ"></div>';
    var cv = stage.querySelector("#bwC"), g = cv.getContext("2d"), go = stage.querySelector("#bwGo"), q = stage.querySelector("#bwQ");
    var pins, ball;
    var setPins = function(){ pins = []; var rows = [[160],[146,174],[132,160,188],[118,146,174,202]]; rows.forEach(function(r, i){ r.forEach(function(x){ pins.push({x: x, y: 70 + (3 - i) * 26, up: true}); }); }); };
    var draw = function(){
      g.fillStyle = "#F7E7C8"; g.fillRect(0, 0, W, H);
      g.fillStyle = "#EED9B0"; for (var i = 1; i < 10; i++) g.fillRect(i * 32 - 1, 0, 2, H);
      g.fillStyle = "#CDE7DC"; g.fillRect(0, 0, 22, H); g.fillRect(W - 22, 0, 22, H);
      pins.forEach(function(p){ if (!p.up) return; g.fillStyle = "#fff"; g.beginPath(); g.ellipse(p.x, p.y, R * .8, R, 0, 0, 7); g.fill(); g.strokeStyle = "#CFC6D6"; g.lineWidth = 2; g.stroke(); g.fillStyle = "#E5484D"; g.fillRect(p.x - R * .7, p.y - 3, R * 1.4, 4); });
      if (!busy) { g.save(); g.translate(W / 2, H - 50); g.rotate(ang); g.strokeStyle = "#E0399F"; g.lineWidth = 6; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -150); g.stroke();
        g.setLineDash([]); g.fillStyle = "#E0399F"; g.beginPath(); g.moveTo(-12, -150); g.lineTo(12, -150); g.lineTo(0, -172); g.fill(); g.restore(); }
      g.fillStyle = "#5B6CF0"; g.beginPath(); g.arc(ball.x, ball.y, BR, 0, 7); g.fill(); g.fillStyle = "#3D4BC2"; [[-4,-5],[4,-5],[0,3]].forEach(function(o){ g.beginPath(); g.arc(ball.x + o[0], ball.y + o[1], 2.5, 0, 7); g.fill(); });
    };
    var aim = function(){ if (!alive(cv)) return; if (!busy) { ang += angDir * .018; if (Math.abs(ang) > .32) angDir *= -1; } draw(); raf = requestAnimationFrame(aim); };
    var newRoll = function(){ setPins(); ball = {x: W / 2, y: H - 50}; busy = false; go.disabled = false; stage.querySelector("#bwN").textContent = rolls + 1; q.innerHTML = ""; };
    var ask = function(n){
      var opts = api.shuffle([n].concat(api.pick([0,1,2,3,4,5,6,7,8,9,10].filter(function(x){ return x !== n; }), 2)));
      q.innerHTML = '<div class="kg-q" style="margin-top:12px">כמה פינים נפלו? <button type="button" class="kg-say" aria-label="לשמוע שוב">🔊</button></div><div class="kg-opts" style="--n:3">' + opts.map(function(o){ return '<button type="button" class="kg-opt txt" data-n="' + o + '">' + o + '</button>'; }).join("") + '</div>';
      q.querySelector(".kg-say").onclick = function(){ api.say("כַּמָּה פִּינִים נָפְלוּ?"); }; api.say("כַּמָּה פִּינִים נָפְלוּ? סוֹפְרִים!");
      q.querySelectorAll(".kg-opt").forEach(function(b){ b.onclick = function(){
        if (+b.dataset.n !== n) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); return api.almost(stage, "סופרים את הפינים שנפלו"); }
        b.classList.add("ok"); api.SND.ok(); total += n; rolls++; stage.querySelector("#bwS").textContent = total;
        api.say(n === 10 ? "סְטְרַייק! כֻּלָּם נָפְלוּ!" : "נָכוֹן! " + n);
        setTimeout(function(){ if (rolls >= ROLLS) return api.win("הפלתם " + total + " פינים בחמש זריקות – וספרתם כל פעם!", "🎳"); newRoll(); }, 1300);
      }; });
    };
    go.onclick = function(){
      if (busy) return; busy = true; go.disabled = true; var a = ang, dx = Math.sin(a) * 7, dy = -Math.cos(a) * 7;
      var hit = [];
      var fly = function(){
        if (!alive(cv)) return;
        ball.x += dx; ball.y += dy;
        if (ball.x < 22 + BR || ball.x > W - 22 - BR) { dx = 0; ball.x = Math.max(22 + BR, Math.min(W - 22 - BR, ball.x)); }   // תעלה בצד
        pins.forEach(function(p){ if (p.up && Math.hypot(p.x - ball.x, p.y - ball.y) < R + BR) { p.up = false; hit.push(p); api.tone(220 + api.rnd(120), .08, "square", .12); } });
        if (ball.y > 20) return requestAnimationFrame(fly);
        // פין שנפל מפיל לפעמים את השכנים מאחוריו
        var chain = hit.slice(); while (chain.length) { var p = chain.shift(); pins.forEach(function(o){ if (o.up && o.y < p.y + 4 && Math.hypot(o.x - p.x, o.y - p.y) < 34 && Math.random() < .55) { o.up = false; chain.push(o); } }); }
        var n = pins.filter(function(p){ return !p.up; }).length;
        window.__kg = {fallen: n};
        setTimeout(function(){ ask(n); }, 450);
      };
      fly();
    };
    newRoll(); aim(); api.say(this.intro);
  }});

/* ===== 16. תופסים בסל ===== */
KG.push({id:"catch", name:"תופסים בסל", ic:"🧺", bg:"#FFF1C9", ages:[3,7], kind:"game",
  learn:"מיון: מה זה פרי ומה לא, ותיאום עין־יד",
  intro:"תופסים בסל! דברים נופלים מלמעלה. מזיזים את הסל – ותופסים רק פירות!",
  run: function(stage, api){
    var W = 340, H = 440, bx = W / 2, BW = 86, got = 0, NEED = 10, items = [], last = 0, t0 = 0, run = true;
    stage.innerHTML = '<div class="kg-hud"><span>פירות בסל: <b id="ctN">0</b> / ' + NEED + '</span></div><canvas class="kg-canvas" id="ctC" width="' + W + '" height="' + H + '" aria-label="תופסים בסל"></canvas><div class="kg-row" style="margin-top:10px"><button type="button" class="kg-btn alt" id="ctL" style="font-size:26px">⬅️</button><button type="button" class="kg-btn alt" id="ctR" style="font-size:26px">➡️</button></div>';
    var cv = stage.querySelector("#ctC"), g = cv.getContext("2d");
    var toX = function(e){ var r = cv.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
    var drag = false;
    cv.addEventListener("pointerdown", function(e){ drag = true; bx = toX(e); }); cv.addEventListener("pointermove", function(e){ if (drag) bx = toX(e); });
    window.addEventListener("pointerup", function(){ drag = false; });
    var hold = function(id, d){ var b = stage.querySelector(id), iv = null; var go = function(){ bx += d; }; b.addEventListener("pointerdown", function(){ go(); iv = setInterval(go, 40); }); ["pointerup","pointerleave"].forEach(function(ev){ b.addEventListener(ev, function(){ clearInterval(iv); }); }); b.onclick = go; };
    hold("#ctL", -18); hold("#ctR", 18);
    keys(cv, function(k){ if (k === "l") bx -= 22; if (k === "r") bx += 22; });
    var loop = function(ts){
      if (!alive(cv) || !run) return;
      if (!t0) t0 = ts; var dt = Math.min(40, ts - (last || ts)); last = ts;
      bx = Math.max(BW / 2, Math.min(W - BW / 2, bx));
      if (!items.length || (items[items.length - 1].y > 130 && items.length < 3)) {
        var fruit = Math.random() < .6, o = OTHER[api.rnd(OTHER.length)];
        items.push({x: 30 + api.rnd(W - 60), y: -30, v: .09 + Math.min(.07, got * .006), f: fruit, e: fruit ? FRUITS[api.rnd(FRUITS.length)] : o[0], n: fruit ? "" : o[1]});
      }
      g.fillStyle = "#E3F4FF"; g.fillRect(0, 0, W, H); g.fillStyle = "#CDE7DC"; g.fillRect(0, H - 26, W, 26);
      g.textAlign = "center"; g.textBaseline = "middle"; g.font = "40px 'Noto Color Emoji',sans-serif";
      items.forEach(function(it){ it.y += it.v * dt; g.fillText(it.e, it.x, it.y); });
      g.font = "64px 'Noto Color Emoji',sans-serif"; g.fillText("🧺", bx, H - 50);
      items = items.filter(function(it){
        if (it.y > H - 80 && it.y < H - 30 && Math.abs(it.x - bx) < BW / 2) {
          if (it.f) { got++; api.SND.pop(); stage.querySelector("#ctN").textContent = got;
            if (got >= NEED) { run = false; setTimeout(function(){ api.win("תפסתם 10 פירות!", "🧺"); }, 200); } }
          else { api.SND.soft(); api.toast(stage, "אופס! " + it.n + " זה לא פרי 🙂", 1200); }
          return false; }
        return it.y < H + 30;
      });
      window.__kg = {items: items, bx: bx, W: W, setX: function(x){ bx = x; }};
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop); api.say(this.intro);
  }});

/* ===== 17. מי הציץ מהגומה? ===== */
KG.push({id:"holes", name:"מי הציץ מהגומה?", ic:"🐰", bg:"#FFE3F4", ages:[3,6], kind:"game",
  learn:"זיהוי צורות או ספרות 1–10, הקשבה ותגובה מהירה",
  intro:"מי הציץ מהגומה? ארנבים מציצים עם שלט. מקשיבים מה מחפשים, ונוגעים בארנב הנכון!",
  run: function(stage, api){
    var SH = [["⚪","עיגול","עִגּוּל"],["🟥","ריבוע","רִבּוּעַ"],["🔺","משולש","מְשֻׁלָּשׁ"],["⭐","כוכב","כּוֹכָב"],["💗","לב","לֵב"]];
    modes(stage, "מה מחפשים?", ["🔷 צורות (גילאי 3–4)", "🔢 מספרים 1–10 (גילאי 5–6)"], function(m){
      var pool = m ? Array.from({length: 10}, function(_, i){ return [String(i + 1), String(i + 1), String(i + 1)]; }) : SH;
      var hits = 0, NEED = 8, target = null, timers = [], live = true;
      stage.innerHTML = '<div class="kg-q"><span id="hoQ"></span><button type="button" class="kg-say" aria-label="לשמוע שוב">🔊</button></div><div class="kg-dots" id="hoD"></div><div class="holes">' + Array.from({length: 6}, function(_, i){ return '<button type="button" class="hole" data-i="' + i + '" aria-label="גומה ' + (i + 1) + '"><span class="bn"><i>🐰</i><b></b></span></button>'; }).join("") + '</div>';
      var holes = stage.querySelectorAll(".hole");
      var newTarget = function(){ target = pool[api.rnd(pool.length)]; stage.querySelector("#hoQ").textContent = "נוגעים בארנב עם " + (m ? "המספר " : "") + target[1];
        stage.querySelector("#hoD").innerHTML = Array.from({length: NEED}, function(_, k){ return '<i class="' + (k < hits ? "on" : "") + '"></i>'; }).join("");
        api.say("נוֹגְעִים בָּאַרְנָב עִם " + (m ? "הַמִּסְפָּר " : "הַ") + target[2]); };
      stage.querySelector(".kg-say").onclick = function(){ api.say("נוֹגְעִים בָּאַרְנָב עִם " + (m ? "הַמִּסְפָּר " : "הַ") + target[2]); };
      var pop = function(){
        if (!live || !alive(stage) || !holes[0].isConnected) return;
        var free = Array.prototype.filter.call(holes, function(h){ return !h.classList.contains("up"); }); if (!free.length) return;
        var h = free[api.rnd(free.length)], val = Math.random() < .45 ? target : pool[api.rnd(pool.length)];
        h.dataset.v = val[0]; h.querySelector("b").textContent = val[0]; h.classList.add("up");
        timers.push(setTimeout(function(){ h.classList.remove("up"); }, m ? 1900 : 2300));
      };
      holes.forEach(function(h){ h.onclick = function(){
        if (!h.classList.contains("up")) return;
        if (h.dataset.v === target[0]) { h.classList.remove("up"); hits++; api.SND.ok();
          if (hits >= NEED) { live = false; timers.forEach(clearTimeout); return setTimeout(function(){ api.win("מצאתם " + NEED + " ארנבים!", "🐰"); }, 300); }
          newTarget(); }
        else { var v = pool.find(function(p){ return p[0] === h.dataset.v; }); api.almost(stage, "זה " + (v ? v[1] : "")); }
      }; });
      newTarget(); pop(); setTimeout(pop, 500);
      var iv = setInterval(function(){ if (!live || !holes[0].isConnected) return clearInterval(iv); pop(); }, m ? 800 : 1000);
      window.__kg = {target: function(){ return target[0]; }};
    });
    api.say(this.intro);
  }});

/* ===== 18. פאזל הזזה ===== */
KG.push({id:"slide", name:"פאזל הזזה", ic:"🔢", bg:"#DCEBFF", ages:[6,8], kind:"game",
  learn:"סדר המספרים 1–8, תכנון כמה צעדים קדימה וסבלנות",
  intro:"פאזל הזזה. נוגעים במספר שליד המקום הריק, והוא זז. מסדרים מאחת עד שמונה!",
  run: function(stage, api){
    var COL = ["#E5484D","#FF8A1F","#E0A800","#46C46E","#3AA7F0","#5B6CF0","#9B5DE5","#E0399F"];
    modes(stage, "כמה קשה?", ["🙂 קל (גילאי 6)", "🧠 קשה יותר (גילאי 7–8)"], function(m){
      var b = [1,2,3,4,5,6,7,8,0], moves = 0, last = -1;
      var nb = function(i){ var r = (i / 3) | 0, c = i % 3, o = []; if (r) o.push(i - 3); if (r < 2) o.push(i + 3); if (c) o.push(i - 1); if (c < 2) o.push(i + 1); return o; };
      for (var k = 0; k < (m ? 70 : 18); k++) { var e = b.indexOf(0), opts = nb(e).filter(function(x){ return x !== last; }), j = opts[api.rnd(opts.length)]; b[e] = b[j]; b[j] = 0; last = e; }
      if (b.join() === "1,2,3,4,5,6,7,8,0") { var e2 = b.indexOf(0), j2 = nb(e2)[0]; b[e2] = b[j2]; b[j2] = 0; }
      stage.innerHTML = '<div class="kg-hud"><span>צעדים: <b id="slN">0</b></span></div><div class="slide" id="slB"></div><p style="text-align:center;color:#6b5a66">המטרה: 1 2 3 / 4 5 6 / 7 8 ו<b>מקום ריק</b> בסוף</p>';
      var B = stage.querySelector("#slB");
      var paint = function(){ B.innerHTML = b.map(function(v, i){ return v ? '<button type="button" data-i="' + i + '" style="background:' + COL[v - 1] + '" aria-label="' + v + '">' + v + '</button>' : '<button type="button" class="e" data-i="' + i + '" aria-label="ריק" tabindex="-1"></button>'; }).join(""); window.__kg = {board: b.slice()}; };
      B.addEventListener("click", function(ev){
        var t = ev.target.closest("button"); if (!t) return; var i = +t.dataset.i, e = b.indexOf(0);
        if (!b[i]) return; if (nb(e).indexOf(i) < 0) { api.SND.soft(); return; }
        b[e] = b[i]; b[i] = 0; moves++; stage.querySelector("#slN").textContent = moves; api.tone(400 + b[e] * 40, .08, "sine", .15); paint();
        if (b.join() === "1,2,3,4,5,6,7,8,0") setTimeout(function(){ api.win("סידרתם מ-1 עד 8 ב-" + moves + " צעדים!", "🔢"); }, 300);
      });
      paint();
    });
    api.say(this.intro);
  }});

/* ===== 19. מאזניים ===== */
KG.push({id:"balance", name:"מאזניים", ic:"⚖️", bg:"#E1F0EA", ages:[5,8], kind:"game",
  learn:"חיבור ושוויון: כמה צריך כדי שיהיה שווה משני הצדדים",
  intro:"מאזניים. בצד אחד יש משקולת עם מספר. שמים משקולות בצד השני, עד שהמאזניים ישרים – שווה!",
  run: function(stage, api){
    var ROUNDS = 6, round = 0, WTS = [1, 2, 3, 5];
    var next = function(){
      if (round >= ROUNDS) return api.win("איזנתם את המאזניים 6 פעמים – אתם אלופי חיבור!", "⚖️");
      var target = 3 + api.rnd(10), put = [];
      stage.innerHTML = '<div class="kg-dots">' + Array.from({length: ROUNDS}, function(_, k){ return '<i class="' + (k < round ? "on" : "") + '"></i>'; }).join("") + '</div>' +
        '<div class="kg-q">שמים משקולות עד שיהיה שווה ל-' + target + ' <button type="button" class="kg-say" aria-label="לשמוע שוב">🔊</button></div>' +
        '<div class="bal"><div class="base"></div><div class="post"></div><div class="beam" id="bm"><div class="pan r" id="pR"></div><div class="pan l" id="pL"></div></div></div>' +
        '<div class="kg-hud" style="margin-top:8px"><span>בצד שלכם: <b id="bS">0</b></span></div>' +
        '<div class="kg-row">' + WTS.map(function(w){ return '<button type="button" class="kg-btn alt" data-w="' + w + '" style="font-size:22px;min-width:64px">+' + w + '</button>'; }).join("") + '<button type="button" class="kg-btn alt" id="bU" aria-label="להוריד את האחרונה">↩️</button></div>';
      var beam = stage.querySelector("#bm"), pR = stage.querySelector("#pR"), pL = stage.querySelector("#pL");
      pR.innerHTML = '<span class="wt big">' + target + '</span>';
      var say = function(){ api.say("שָׂמִים מִשְׁקוֹלוֹת עַד שֶׁיִּהְיֶה שָׁוֶה לְ" + target); };
      stage.querySelector(".kg-say").onclick = say; say();
      var paint = function(){
        var sum = put.reduce(function(a, b){ return a + b; }, 0), diff = target - sum;
        pL.innerHTML = put.map(function(w){ return '<span class="wt">' + w + '</span>'; }).join("");
        stage.querySelector("#bS").textContent = sum;
        beam.style.transform = "rotate(" + Math.max(-14, Math.min(14, -diff * 2.2)) + "deg)";   // הצד הכבד יורד
        window.__kg = {target: target, sum: sum, WTS: WTS};
        if (sum === target) { api.SND.ok(); api.say("שָׁוֶה! " + target); round++; stage.querySelectorAll("[data-w],#bU").forEach(function(b){ b.disabled = true; }); setTimeout(next, 1500); }
        else if (sum > target) api.toast(stage, "כבד מדי! מורידים משקולת ↩️", 1300);
      };
      stage.querySelectorAll("[data-w]").forEach(function(b){ b.onclick = function(){ put.push(+b.dataset.w); api.tone(300 + put.length * 30, .1, "sine", .2); paint(); }; });
      stage.querySelector("#bU").onclick = function(){ put.pop(); paint(); };
      paint();
    };
    next();
  }});

/* ===== 20. חיפוש מילים ===== */
var WS_WORDS = [["🐟","דג","דָּג"],["🐎","סוס","סוּס"],["🐘","פיל","פִּיל"],["🐢","צב","צָב"],["🐒","קוף","קוֹף"],["🐕","כלב","כֶּלֶב"],["🐈","חתול","חָתוּל"],["🦁","אריה","אַרְיֵה"],["⛰️","הר","הַר"],["☀️","שמש","שֶׁמֶשׁ"],["🍎","תפוח","תַּפּוּחַ"],["🍋","לימון","לִימוֹן"],["🌹","ורד","וֶרֶד"],["🚂","רכבת","רַכֶּבֶת"],["🦓","זברה","זֶבְּרָה"],["🐫","גמל","גָּמָל"],["🍌","בננה","בָּנָנָה"],["👦","ילד","יֶלֶד"]];
KG.push({id:"words", name:"חיפוש מילים", ic:"🔎", bg:"#FFF1C9", ages:[6,8], kind:"game",
  learn:"קריאה: מזהים מילים בין אותיות, מימין לשמאל ומלמעלה למטה",
  intro:"חיפוש מילים. המילים מסתתרות בטבלה – מימין לשמאל, או מלמעלה למטה. נוגעים באות הראשונה, ואז באות האחרונה של המילה.",
  run: function(stage, api){
    var N = 6, boards = 2, bi = 0, LET = "אבגדהוזחטיכלמנסעפצקרשת";
    var board = function(){
      if (bi >= boards) return api.win("מצאתם את כל המילים!", "🔎");
      var grid = Array(N * N).fill(""), placed = [], pool = api.shuffle(WS_WORDS.filter(function(w){ return w[1].length <= N; }));
      for (var p = 0; p < pool.length && placed.length < 4; p++) {
        var w = pool[p], L = w[1].length, ok = false;
        for (var t = 0; t < 60 && !ok; t++) {
          var vert = Math.random() < .45, r = api.rnd(vert ? N - L + 1 : N), c = api.rnd(vert ? N : N - L + 1), cells = [];
          for (var k = 0; k < L; k++) cells.push(vert ? (r + k) * N + c : r * N + c + k);   // אופקי: c קטן = ימין (הטבלה מימין לשמאל)
          if (cells.every(function(ci, k){ return !grid[ci] || grid[ci] === w[1][k]; })) { cells.forEach(function(ci, k){ grid[ci] = w[1][k]; }); placed.push({w: w, cells: cells, found: false}); ok = true; }
        }
      }
      grid = grid.map(function(x){ return x || LET[api.rnd(LET.length)]; });
      stage.innerHTML = '<div class="kg-dots">' + Array.from({length: boards}, function(_, k){ return '<i class="' + (k < bi ? "on" : "") + '"></i>'; }).join("") + '</div>' +
        '<div class="ws-list" id="wsL">' + placed.map(function(p, i){ return '<span data-i="' + i + '">' + p.w[0] + ' ' + p.w[1] + '</span>'; }).join("") + '</div>' +
        '<div class="ws" id="wsG" style="grid-template-columns:repeat(' + N + ',1fr)">' + grid.map(function(ch, i){ return '<button type="button" data-i="' + i + '">' + ch + '</button>'; }).join("") + '</div>' +
        '<p style="text-align:center;color:#6b5a66">👆 נוגעים באות הראשונה ואז באחרונה</p>';
      var G = stage.querySelector("#wsG"), btn = G.children, first = -1;
      window.__kg = {placed: placed};
      stage.querySelectorAll("#wsL span").forEach(function(s){ s.onclick = function(){ api.say(placed[+s.dataset.i].w[2]); }; });
      G.addEventListener("click", function(ev){
        var t = ev.target.closest("button"); if (!t) return; var i = +t.dataset.i;
        if (first < 0) { first = i; t.classList.add("sel"); api.tone(500, .06, "sine", .12); return; }
        var a = first, p = placed.find(function(p){ return !p.found && ((p.cells[0] === a && p.cells[p.cells.length - 1] === i) || (p.cells[0] === i && p.cells[p.cells.length - 1] === a)); });
        btn[a].classList.remove("sel"); first = -1;
        if (!p) { api.almost(stage, "נוגעים באות הראשונה ובאחרונה של מילה"); return; }
        p.found = true; p.cells.forEach(function(ci){ btn[ci].classList.add("found"); }); stage.querySelector('#wsL span[data-i="' + placed.indexOf(p) + '"]').classList.add("f");
        api.SND.ok(); api.say("מְצָאתֶם! " + p.w[2]);
        if (placed.every(function(p){ return p.found; })) { bi++; setTimeout(board, 1500); }
      });
    };
    board(); api.say(this.intro);
  }});
})();
