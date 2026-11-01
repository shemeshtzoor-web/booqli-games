/* =====================================================================
   חדר המשחקים – 13 משחקים מקוריים לילדים (מ-1.11.2026)
   כל משחק: id, name, ic, bg, ages [מגיל, עד גיל], learn (מה לומדים), intro (הוראה מוקראת), run(stage, api)
   api (מ-index.html): say, tone, SND, rnd, shuffle, pick, toast, almost(stage, extra), win(msg, ic), quiz(stage, spec)
   כללים: טעות = "כמעט! נסו שוב" בלי אדום · כל הוראה בקול · בלי דמויות, שירים או תמונות של אחרים.
   משחק חדש כאן = גם שורה ב-KIDS_GAMES ב-catalog.js (topic:"play").
   ===================================================================== */
(function(){
var el = function(html){ var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; };
var css = function(txt){ var s = document.createElement("style"); s.textContent = txt; document.head.appendChild(s); };
/* ---------- תווים (דו מז'ור) ---------- */
var NOTES = [
  {n:"דו", s:"דּוֹ", f:261.63, c:"#E5484D"}, {n:"רה", s:"רֶה", f:293.66, c:"#FF8A1F"}, {n:"מי", s:"מִי", f:329.63, c:"#FFC93C"},
  {n:"פה", s:"פָה", f:349.23, c:"#46C46E"}, {n:"סול", s:"סוֹל", f:392.00, c:"#3AA7F0"}, {n:"לה", s:"לָה", f:440.00, c:"#5B6CF0"},
  {n:"סי", s:"סִי", f:493.88, c:"#9B5DE5"}, {n:"דו", s:"דּוֹ", f:523.25, c:"#E0399F"}
];
css(
  ".xo-board{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:330px;margin:12px auto;direction:ltr}" +
  ".xo-board button{aspect-ratio:1;font:inherit;font-size:clamp(48px,14vw,72px);border:0;border-radius:20px;background:#F4FAF7;cursor:pointer;box-shadow:0 4px 0 #d9e9e1;line-height:1;color:#2B1526}" +
  ".xo-board button.w{background:#FFE3F4}" +
  ".xo-msg{text-align:center;font-family:Fredoka,Assistant,sans-serif;font-size:22px;min-height:32px;margin:6px 0}" +
  ".c4{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;max-width:470px;margin:10px auto;background:#4E8576;padding:8px;border-radius:20px;direction:ltr}" +
  ".c4 button{aspect-ratio:1;border:0;border-radius:50%;background:#fff;cursor:pointer;padding:0;transition:background .15s}" +
  ".c4 button.p1{background:#FF56C2}.c4 button.p2{background:#FFC93C}.c4 button.w{box-shadow:0 0 0 4px #fff inset,0 0 0 7px #2B1526 inset}" +
  ".xyl{display:flex;gap:6px;justify-content:center;align-items:flex-end;margin:10px auto;max-width:620px;direction:ltr}" +
  ".xyl button{flex:1;border:0;border-radius:14px;color:#fff;font:inherit;font-family:Fredoka,Assistant,sans-serif;font-weight:700;font-size:clamp(14px,3.6vw,20px);cursor:pointer;padding:8px 0;box-shadow:0 5px 0 rgba(0,0,0,.18);transition:transform .08s;text-shadow:0 1px 2px rgba(0,0,0,.3)}" +
  ".xyl button:active,.xyl button.hit{transform:translateY(4px);box-shadow:0 1px 0 rgba(0,0,0,.18)}" +
  ".xyl button.next{outline:5px solid #2B1526;outline-offset:3px;animation:kgPop .8s infinite}" +
  ".simon{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:340px;margin:12px auto}" +
  ".simon button{aspect-ratio:1;border:0;border-radius:28px;cursor:pointer;opacity:.55;transition:opacity .1s,transform .1s;font-size:44px}" +
  ".simon button.lit{opacity:1;transform:scale(1.05)}" +
  ".bub-area{position:relative;height:min(62vh,420px);background:linear-gradient(#E3F4FF,#F4FAF7);border-radius:22px;overflow:hidden;touch-action:manipulation}" +
  ".bub{position:absolute;bottom:-90px;width:78px;height:78px;border-radius:50%;border:0;cursor:pointer;box-shadow:inset -8px -10px 0 rgba(0,0,0,.08),inset 10px 10px 0 rgba(255,255,255,.45);animation:bubUp linear forwards}" +
  ".bub.wob{animation:bubUp linear forwards,kgShake .4s}" +
  "@keyframes bubUp{to{transform:translateY(calc(-1 * (min(62vh,420px) + 120px)))}}" +
  ".bub-goal{display:flex;justify-content:center;align-items:center;gap:8px;font-family:Fredoka,Assistant,sans-serif;font-size:22px;margin-bottom:8px}" +
  ".bub-goal i{display:inline-block;width:30px;height:30px;border-radius:50%;vertical-align:middle}" +
  ".sz-area{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:14px;min-height:170px;padding:10px;background:#F4FAF7;border-radius:22px}" +
  ".sz-area button{border:0;background:none;cursor:pointer;line-height:1;padding:4px;border-radius:14px}" +
  ".sz-line{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:10px;min-height:120px;margin-top:12px;border-bottom:4px dashed #CDE7DC;direction:ltr}" +
  ".mz-wrap{display:flex;flex-direction:column;align-items:center;gap:10px}" +
  ".mz{display:grid;direction:ltr;background:#fff;border:4px solid #4E8576;border-radius:10px;touch-action:none;width:min(92vw,420px)}" +
  ".mz div{aspect-ratio:1;display:grid;place-items:center;font-size:var(--fs,26px);line-height:1;box-sizing:border-box}" +
  ".mz-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,64px);gap:6px;direction:ltr}" +
  ".mz-pad button{font-size:30px;border:0;border-radius:18px;background:#FFF1C9;cursor:pointer;box-shadow:0 3px 0 #F3DFA6}" +
  ".sp{position:relative;width:100%;aspect-ratio:1;max-width:150px;container-type:inline-size}" +
  ".sp span{position:absolute;line-height:1}" +
  ".lt-word{text-align:center;font-family:Fredoka,Assistant,sans-serif;font-size:30px;letter-spacing:2px;margin:-6px 0 10px}" +
  ".lt-word b{color:#E0399F}"
);
/* מסגרת קטנה למשחקים עם בחירת מצב */
var modes = function(stage, title, list, cb){
  stage.innerHTML = '<div class="kg-q">' + title + '</div><div class="kg-row" style="flex-direction:column">' +
    list.map(function(m, i){ return '<button type="button" class="kg-btn' + (i ? " alt" : "") + '" data-i="' + i + '" style="min-width:240px">' + m + '</button>'; }).join("") + '</div>';
  stage.querySelectorAll("[data-i]").forEach(function(b){ b.onclick = function(){ cb(+b.dataset.i); }; });
};

var KG = window.KG = [];

/* ===== 1. איקס עיגול ===== */
KG.push({id:"xo", name:"איקס עיגול", ic:"❌", bg:"#FFE3F4", ages:[4,8], kind:"game",
  learn:"חשיבה קדימה, תכנון ומשחק בתורות",
  intro:"איקס עיגול. אתם האיקס, ובּוּקְלִי הוא העיגול. מי שמסדר שלוש בשורה – מנצח!",
  run: function(stage, api){
    var L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    var winner = function(b){ for (var i = 0; i < L.length; i++){ var l = L[i]; if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return l; } return null; };
    var mm = function(b, me){ var w = winner(b); if (w) return b[w[0]] === "O" ? 10 : -10; if (b.every(Boolean)) return 0;
      var best = me ? -99 : 99; for (var i = 0; i < 9; i++) if (!b[i]) { b[i] = me ? "O" : "X"; var s = mm(b, !me); b[i] = null; best = me ? Math.max(best, s) : Math.min(best, s); } return best; };
    var aiMove = function(b, smart){
      var free = []; for (var i = 0; i < 9; i++) if (!b[i]) free.push(i);
      if (!smart && Math.random() < .55) return free[api.rnd(free.length)];
      if (smart && Math.random() < .15) return free[api.rnd(free.length)];
      var best = -99, pickI = free[0]; api.shuffle(free).forEach(function(i){ b[i] = "O"; var s = mm(b, false); b[i] = null; if (s > best) { best = s; pickI = i; } });
      return pickI;
    };
    var start = function(mode){
      var b = Array(9).fill(null), turn = "X", over = false, two = mode === 2;
      stage.innerHTML = '<div class="xo-msg" id="xoM"></div><div class="xo-board">' + b.map(function(_, i){ return '<button type="button" data-i="' + i + '" aria-label="משבצת ' + (i + 1) + '"></button>'; }).join("") + '</div><div class="kg-row"><button type="button" class="kg-btn alt" id="xoN">🔁 משחק חדש</button></div>';
      var cells = stage.querySelectorAll(".xo-board button"), msg = stage.querySelector("#xoM");
      var show = function(t){ msg.textContent = t; };
      show(two ? "התור של ❌" : "התור שלכם ❌");
      var end = function(l){
        over = true;
        if (l) { l.forEach(function(i){ cells[i].classList.add("w"); }); var w = b[l[0]];
          if (two) { setTimeout(function(){ api.win((w === "X" ? "❌" : "⭕") + " ניצח! שלוש בשורה.", w === "X" ? "❌" : "⭕"); }, 600); }
          else if (w === "X") setTimeout(function(){ api.win("ניצחתם את בּוּקְלִי באיקס עיגול!", "❌"); }, 600);
          else { show("בּוּקְלִי ניצח הפעם 🙂 עוד סיבוב?"); api.say("בּוּקְלִי נִצֵּחַ הַפַּעַם. עוֹד סִבּוּב?"); }
        } else { show("תיקו! אף אחד לא ניצח. עוד סיבוב?"); api.say("תֵּיקוֹ! עוֹד סִבּוּב?"); }
      };
      var put = function(i, p){ b[i] = p; cells[i].textContent = p === "X" ? "❌" : "⭕"; cells[i].setAttribute("aria-label", "משבצת " + (i + 1) + ": " + (p === "X" ? "איקס" : "עיגול")); api.SND.pop(); };
      cells.forEach(function(c){ c.onclick = function(){
        var i = +c.dataset.i; if (over || b[i] || (!two && turn !== "X")) return;
        put(i, turn); var l = winner(b); if (l || b.every(Boolean)) return end(l);
        if (two) { turn = turn === "X" ? "O" : "X"; show("התור של " + (turn === "X" ? "❌" : "⭕")); return; }
        turn = "O"; show("בּוּקְלִי חושב... 🤔");
        setTimeout(function(){ var j = aiMove(b, mode === 1); put(j, "O"); var l2 = winner(b); if (l2 || b.every(Boolean)) return end(l2); turn = "X"; show("התור שלכם ❌"); }, 650);
      }; });
      stage.querySelector("#xoN").onclick = function(){ start(mode); };
    };
    modes(stage, "איך משחקים?", ["🙂 נגד בּוּקְלִי – קל", "🧠 נגד בּוּקְלִי – חכם", "👫 שני שחקנים"], start);
    api.say(this.intro);
  }});

/* ===== 2. ארבע בשורה ===== */
KG.push({id:"four", name:"ארבע בשורה", ic:"🔴", bg:"#FFF1C9", ages:[5,8], kind:"game",
  learn:"תכנון, זיהוי דפוסים (שורה, טור, אלכסון) וספירה עד 4",
  intro:"ארבע בשורה. לוחצים על טור, והעיגול נופל למטה. מי שמסדר ארבעה בשורה, בטור או באלכסון – מנצח!",
  run: function(stage, api){
    var W = 7, H = 6;
    var lines = function(g, r, c, p){ var D = [[0,1],[1,0],[1,1],[1,-1]];
      for (var d = 0; d < 4; d++){ var cells = [[r, c]];
        for (var s = -1; s <= 1; s += 2){ var rr = r + D[d][0] * s, cc = c + D[d][1] * s;
          while (rr >= 0 && rr < H && cc >= 0 && cc < W && g[rr][cc] === p){ cells.push([rr, cc]); rr += D[d][0] * s; cc += D[d][1] * s; } }
        if (cells.length >= 4) return cells; } return null; };
    var drop = function(g, c){ for (var r = H - 1; r >= 0; r--) if (!g[r][c]) return r; return -1; };
    var ai = function(g, smart){
      var cols = [3,2,4,1,5,0,6].filter(function(c){ return drop(g, c) > -1; });
      var tryP = function(p){ for (var i = 0; i < cols.length; i++){ var c = cols[i], r = drop(g, c); g[r][c] = p; var w = lines(g, r, c, p); g[r][c] = 0; if (w) return c; } return -1; };
      var c = tryP(2); if (c > -1) return c;
      c = tryP(1); if (c > -1 && (smart || Math.random() < .6)) return c;
      var safe = cols.filter(function(c){ var r = drop(g, c); if (r <= 0) return true; g[r][c] = 2; g[r - 1][c] = 1; var bad = lines(g, r - 1, c, 1); g[r - 1][c] = 0; g[r][c] = 0; return !bad; });
      var pool = (smart && safe.length ? safe : cols);
      return smart ? pool[Math.min(pool.length - 1, api.rnd(2))] : pool[api.rnd(pool.length)];
    };
    var start = function(mode){
      var g = Array.from({length: H}, function(){ return Array(W).fill(0); }), turn = 1, over = false, two = mode === 2;
      stage.innerHTML = '<div class="xo-msg" id="cM"></div><div class="c4" role="grid">' + Array.from({length: H * W}, function(_, k){ return '<button type="button" data-c="' + (k % W) + '" aria-label="טור ' + (k % W + 1) + '"></button>'; }).join("") + '</div><div class="kg-row"><button type="button" class="kg-btn alt" id="cN">🔁 משחק חדש</button></div>';
      var cells = stage.querySelectorAll(".c4 button"), msg = stage.querySelector("#cM");
      var name = function(p){ return p === 1 ? "🩷 ורוד" : "💛 צהוב"; };
      msg.textContent = two ? "התור של " + name(1) : "אתם 🩷 ורוד. לוחצים על טור!";
      var place = function(c, p){ var r = drop(g, c); if (r < 0) return null; g[r][c] = p; cells[r * W + c].classList.add(p === 1 ? "p1" : "p2"); api.tone(p === 1 ? 440 : 330, .15, "sine", .2); return r; };
      var after = function(r, c, p){
        var w = lines(g, r, c, p);
        if (w) { over = true; w.forEach(function(x){ cells[x[0] * W + x[1]].classList.add("w"); });
          if (two || p === 1) setTimeout(function(){ api.win(two ? name(p) + " ניצח! ארבעה בשורה." : "סידרתם ארבעה בשורה וניצחתם!", "🏆"); }, 700);
          else { msg.textContent = "בּוּקְלִי ניצח הפעם 🙂 עוד סיבוב?"; api.say("בּוּקְלִי נִצֵּחַ הַפַּעַם. עוֹד סִבּוּב?"); }
          return true; }
        if (g[0].every(Boolean)) { over = true; msg.textContent = "הלוח מלא – תיקו! עוד סיבוב?"; api.say("תֵּיקוֹ!"); return true; }
        return false;
      };
      cells.forEach(function(b){ b.onclick = function(){
        if (over || (!two && turn !== 1)) return; var c = +b.dataset.c, r = place(c, turn); if (r === null) return;
        if (after(r, c, turn)) return;
        if (two) { turn = turn === 1 ? 2 : 1; msg.textContent = "התור של " + name(turn); return; }
        turn = 2; msg.textContent = "בּוּקְלִי חושב... 🤔";
        setTimeout(function(){ var cc = ai(g, mode === 1), rr = place(cc, 2); if (after(rr, cc, 2)) return; turn = 1; msg.textContent = "התור שלכם 🩷"; }, 600);
      }; });
      stage.querySelector("#cN").onclick = function(){ start(mode); };
    };
    modes(stage, "איך משחקים?", ["🙂 נגד בּוּקְלִי – קל", "🧠 נגד בּוּקְלִי – חכם", "👫 שני שחקנים"], start);
    api.say(this.intro);
  }});

/* ===== 3. מה התו? ===== */
KG.push({id:"notes", name:"מה התו?", ic:"🎵", bg:"#E3E6FF", ages:[4,8], kind:"game",
  learn:"שמיעה מוזיקלית: גבוה ונמוך, ושמות התווים דו–רה–מי",
  intro:"מה התו? מקשיבים לצליל, ובוחרים את התו הנכון. אפשר ללחוץ על הקסילופון הקטן למטה כדי להקשיב לכל תו.",
  run: function(stage, api){
    var self = this;
    var levels = [
      {t:"⬆️⬇️ גבוה או נמוך? (גילאי 4–5)", k:"hl"},
      {t:"🎵 שלושה תווים: דו, מי, סול (גילאי 5–6)", k:[0,2,4]},
      {t:"🎶 כל שבעת התווים (גילאי 7–8)", k:[0,1,2,3,4,5,6]}
    ];
    modes(stage, "בוחרים רמה:", levels.map(function(l){ return l.t; }), function(li){
      var lv = levels[li];
      if (lv.k === "hl") return api.quiz(stage, {rounds: 8, winMsg: "יש לכם אוזן מוזיקלית!", winIc: "🎵", make: function(){
        var a = api.rnd(8), b; do { b = api.rnd(8); } while (Math.abs(a - b) < 2); var up = b > a;
        return { q: "הצליל השני גבוה או נמוך?", speak: "הַצְּלִיל הַשֵּׁנִי – גָּבוֹהַּ אוֹ נָמוּךְ?", soundMs: 1300,
          sound: function(){ api.tone(NOTES[a].f, .5, "triangle", .3); api.tone(NOTES[b].f, .5, "triangle", .3, .65); },
          n: 2, opts: [{html: "⬆️<div style='font-size:20px'>גבוה</div>", cls: "txt", ok: up, name: "גבוה"}, {html: "⬇️<div style='font-size:20px'>נמוך</div>", cls: "txt", ok: !up, name: "נמוך"}],
          okSay: up ? "נָכוֹן! הוּא עָלָה לְמַעְלָה." : "נָכוֹן! הוּא יָרַד לְמַטָּה." }; }});
      var set = lv.k;
      api.quiz(stage, {rounds: 8, winMsg: "זיהיתם את כל התווים!", winIc: "🎶", make: function(){
        var t = set[api.rnd(set.length)];
        return { q: "איזה תו שמעתם?", speak: "אֵיזֶה תָּו שְׁמַעְתֶּם?", soundMs: 700,
          sound: function(){ api.tone(NOTES[t].f, .7, "triangle", .32); },
          n: Math.min(set.length, 4),
          opts: set.map(function(k){ return {html: NOTES[k].n, cls: "txt", ok: k === t, name: NOTES[k].n}; }).map(function(o, i){ o.html = '<span style="color:' + NOTES[set[i]].c + '">' + o.html + '</span>'; return o; }),
          okSay: "נָכוֹן! זֶה " + NOTES[t].s,
          extra: '<div class="xyl" style="max-width:' + (set.length * 70) + 'px">' + set.map(function(k){ return '<button type="button" data-n="' + k + '" style="background:' + NOTES[k].c + ';height:' + (90 - k * 6) + 'px" aria-label="להקשיב ל' + NOTES[k].n + '">' + NOTES[k].n + '</button>'; }).join("") + '</div><p style="text-align:center;color:#6b5a66;margin:-4px 0 10px;font-size:14px">👆 לוחצים כדי להקשיב · ואז בוחרים למטה</p>',
          after: function(st){ st.querySelectorAll(".xyl button").forEach(function(b){ b.onclick = function(){ api.tone(NOTES[+b.dataset.n].f, .6, "triangle", .3); }; }); } }; }});
    });
    api.say(self.intro);
  }});

/* ===== 4. חזרו אחריי ===== */
KG.push({id:"repeat", name:"חזרו אחריי", ic:"🟢", bg:"#DDF5E5", ages:[3,8], kind:"game",
  learn:"זיכרון עבודה, קשב ורצף של צבעים וצלילים",
  intro:"חזרו אחריי. מקשיבים ומסתכלים: הכפתורים נדלקים לפי הסדר. אחר כך לוחצים באותו סדר בדיוק!",
  run: function(stage, api){
    var P = [{c:"#E5484D", n:"אָדֹם", f:329.63, e:"🍓"}, {c:"#3AA7F0", n:"כָּחֹל", f:392, e:"🐳"}, {c:"#FFC93C", n:"צָהֹב", f:440, e:"⭐"}, {c:"#46C46E", n:"יָרֹק", f:523.25, e:"🐸"}];
    modes(stage, "כמה ארוך?", ["🙂 קצר – 4 צעדים (גילאי 3–5)", "🧠 ארוך – 7 צעדים (גילאי 6–8)"], function(m){
      var goal = m ? 7 : 4, seq = [], pos = 0, busy = true;
      stage.innerHTML = '<div class="xo-msg" id="sM"></div><div class="simon">' + P.map(function(p, i){ return '<button type="button" data-i="' + i + '" style="background:' + p.c + '" aria-label="' + p.n + '">' + p.e + '</button>'; }).join("") + '</div><div class="kg-dots" id="sD"></div>';
      var pads = stage.querySelectorAll(".simon button"), msg = stage.querySelector("#sM"), dots = stage.querySelector("#sD");
      var lit = function(i, ms){ pads[i].classList.add("lit"); api.tone(P[i].f, ms / 1000, "sine", .3); setTimeout(function(){ pads[i].classList.remove("lit"); }, ms); };
      var paint = function(){ dots.innerHTML = Array.from({length: goal}, function(_, k){ return '<i class="' + (k < seq.length ? "on" : "") + '"></i>'; }).join(""); };
      var play = function(){ busy = true; msg.textContent = "👀 מסתכלים ומקשיבים..."; pos = 0; var sp = m ? 520 : 700;
        seq.forEach(function(i, k){ setTimeout(function(){ lit(i, sp - 150); }, 600 + k * sp); });
        setTimeout(function(){ busy = false; msg.textContent = "👆 עכשיו אתם!"; }, 600 + seq.length * sp); };
      var grow = function(){ seq.push(api.rnd(4)); paint(); play(); };
      pads.forEach(function(b){ b.onclick = function(){
        if (busy) return; var i = +b.dataset.i; lit(i, 260);
        if (i !== seq[pos]) { busy = true; api.almost(stage, "נראה שוב"); setTimeout(play, 1600); return; }
        pos++;
        if (pos === seq.length) { busy = true;
          if (seq.length >= goal) return setTimeout(function(){ api.win("זכרתם רצף של " + goal + " צבעים!", "🧠"); }, 500);
          msg.textContent = "יופי! עוד אחד..."; api.SND.ok(); setTimeout(grow, 1000); }
      }; });
      grow();
    });
    api.say(this.intro);
  }});

/* ===== 5. קסילופון ===== */
KG.push({id:"xylo", name:"קסילופון", ic:"🎹", bg:"#FFE9D6", ages:[2,6], kind:"game",
  learn:"שמות התווים, סולם עולה ויורד, וקשר בין צבע לצליל",
  intro:"קסילופון. לוחצים על המקלות הצבעוניים ומנגנים! רוצים אתגר? בוחרים מנגינה, ולוחצים על המקל שמהבהב.",
  run: function(stage, api){
    var TUNES = [{t:"⬆️ סולם עולה", s:[0,1,2,3,4,5,6,7]}, {t:"⬇️ סולם יורד", s:[7,6,5,4,3,2,1,0]}, {t:"🐸 קפיצות", s:[0,2,4,7,4,2,0]}, {t:"🌊 גלים", s:[0,1,2,1,2,3,4,3,4,5]}];
    stage.innerHTML = '<div class="xo-msg" id="yM">🎵 מנגנים חופשי – או בוחרים מנגינה:</div><div class="xyl">' + NOTES.map(function(n, i){ return '<button type="button" data-i="' + i + '" style="background:' + n.c + ';height:' + (190 - i * 13) + 'px" aria-label="' + n.n + '">' + n.n + '</button>'; }).join("") + '</div><div class="kg-row" id="yT">' + TUNES.map(function(t, i){ return '<button type="button" class="kg-btn alt" data-t="' + i + '">' + t.t + '</button>'; }).join("") + '</div>';
    var bars = stage.querySelectorAll(".xyl button"), msg = stage.querySelector("#yM"), tune = null, pos = 0;
    var mark = function(){ bars.forEach(function(b){ b.classList.remove("next"); }); if (tune) bars[tune.s[pos]].classList.add("next"); };
    bars.forEach(function(b){ b.onclick = function(){
      var i = +b.dataset.i; api.tone(NOTES[i].f, .6, "triangle", .32); b.classList.add("hit"); setTimeout(function(){ b.classList.remove("hit"); }, 120);
      if (!tune) return;
      if (i !== tune.s[pos]) { api.toast(stage, "מחפשים את המקל שמהבהב ✨"); return; }
      pos++; if (pos >= tune.s.length) { var t = tune; tune = null; mark(); setTimeout(function(){ api.win("ניגנתם את המנגינה " + t.t.replace(/^\S+\s/, "") + "!", "🎹"); }, 500); return; }
      mark();
    }; });
    stage.querySelector("#yT").addEventListener("click", function(e){ var b = e.target.closest("[data-t]"); if (!b) return; tune = TUNES[+b.dataset.t]; pos = 0; mark(); msg.textContent = "👆 לוחצים על המקל שמהבהב: " + tune.t; api.say("לוֹחֲצִים עַל הַמַּקֵּל שֶׁמְּהַבְהֵב"); });
    api.say(this.intro);
  }});

/* ===== 6. בועות צבעים ===== */
KG.push({id:"bubbles", name:"מפוצצים בועות צבעים", ic:"🫧", bg:"#E3F4FF", ages:[2,4], kind:"game",
  learn:"שמות הצבעים וזיהוי צבע, ותיאום עין־יד",
  intro:"מפוצצים בועות! מקשיבים לאיזה צבע מחפשים, ונוגעים רק בבועות בצבע הזה.",
  run: function(stage, api){
    var C = [{c:"#E5484D", n:"אֲדֻמָּה", t:"אדומה"}, {c:"#FFC93C", n:"צְהֻבָּה", t:"צהובה"}, {c:"#46C46E", n:"יְרֻקָּה", t:"ירוקה"}, {c:"#3AA7F0", n:"כְּחֻלָּה", t:"כחולה"}];
    var order = api.shuffle([0,1,2,3]), round = 0, got = 0, NEED = 3, timer = null, alive = true;
    stage.innerHTML = '<div class="bub-goal" id="bG"></div><div class="kg-dots" id="bD"></div><div class="bub-area" id="bA"></div>';
    var area = stage.querySelector("#bA"), goal = stage.querySelector("#bG"), dots = stage.querySelector("#bD");
    var target = function(){ return C[order[round]]; };
    var paint = function(){ var t = target(); goal.innerHTML = 'מחפשים בועה <i style="background:' + t.c + '"></i> <b>' + t.t + '</b> <button type="button" class="kg-say" aria-label="לשמוע שוב">🔊</button>';
      goal.querySelector(".kg-say").onclick = function(){ api.say("פּוֹצְצוּ בּוּעָה " + t.n); };
      dots.innerHTML = Array.from({length: NEED}, function(_, k){ return '<i class="' + (k < got ? "on" : "") + '"></i>'; }).join(""); };
    var spawn = function(){
      if (!alive || !document.body.contains(area)) { clearInterval(timer); return; }
      var isT = Math.random() < .45, ci = isT ? order[round] : api.rnd(4), b = document.createElement("button");
      b.type = "button"; b.className = "bub"; b.style.background = C[ci].c; b.style.left = (5 + api.rnd(78)) + "%"; b.style.animationDuration = (5 + api.rnd(30) / 10) + "s";
      b.setAttribute("aria-label", "בועה " + C[ci].t); b.dataset.c = ci;
      b.addEventListener("animationend", function(e){ if (e.animationName === "bubUp") b.remove(); });
      b.onclick = function(){
        if (+b.dataset.c === order[round]) { api.SND.pop(); b.remove(); got++; paint();
          if (got >= NEED) { round++; got = 0;
            if (round >= 4) { alive = false; clearInterval(timer); area.innerHTML = ""; return api.win("פוצצתם בועות בכל הצבעים!", "🫧"); }
            api.SND.ok(); paint(); api.say("יוֹפִי! עַכְשָׁיו – בּוּעָה " + target().n); } }
        else { b.classList.remove("wob"); void b.offsetWidth; b.classList.add("wob"); api.SND.soft(); api.say("זוֹ בּוּעָה " + C[+b.dataset.c].n + ". מְחַפְּשִׂים " + target().n); }
      };
      area.appendChild(b);
    };
    paint(); api.say(this.intro + " " + "פּוֹצְצוּ בּוּעָה " + target().n);
    for (var k = 0; k < 4; k++) setTimeout(spawn, k * 350);
    timer = setInterval(spawn, 900);
  }});

/* ===== 7. איפה החיה? ===== */
var ANIMALS = [
  {e:"🐄", n:"פָּרָה", t:"פרה", s:"מוּ"}, {e:"🐕", n:"כֶּלֶב", t:"כלב", s:"הַב הַב"}, {e:"🐈", n:"חָתוּל", t:"חתול", s:"מְיָאוּ"}, {e:"🐓", n:"תַּרְנְגוֹל", t:"תרנגול", s:"קוּקוּרִיקוּ"},
  {e:"🦆", n:"בַּרְוָז", t:"ברווז", s:"גָּה גָּה"}, {e:"🐑", n:"כֶּבֶשׂ", t:"כבש", s:"מֶה"}, {e:"🐘", n:"פִּיל", t:"פיל"}, {e:"🦁", n:"אַרְיֵה", t:"אריה"},
  {e:"🐒", n:"קוֹף", t:"קוף"}, {e:"🦒", n:"גִּ'ירָפָה", t:"ג'ירפה"}, {e:"🐟", n:"דָּג", t:"דג"}, {e:"🐢", n:"צָב", t:"צב"},
  {e:"🐇", n:"אַרְנָב", t:"ארנב"}, {e:"🐝", n:"דְּבוֹרָה", t:"דבורה", s:"בְּזְזְז"}, {e:"🦋", n:"פַּרְפַּר", t:"פרפר"}, {e:"🐸", n:"צְפַרְדֵּעַ", t:"צפרדע", s:"קְוָוה קְוָוה"}
];
KG.push({id:"animals", name:"איפה החיה?", ic:"🐄", bg:"#DDF1DF", ages:[2,4], kind:"game",
  learn:"שמות של חיות והקולות שלהן, הקשבה להוראה",
  intro:"איפה החיה? מקשיבים לשם של החיה, ונוגעים בה.",
  run: function(stage, api){
    api.quiz(stage, {rounds: 8, winMsg: "מצאתם את כל החיות!", winIc: "🐾", make: function(i){
      var opts = api.pick(ANIMALS, i < 3 ? 2 : 3), a = opts[api.rnd(opts.length)];
      return { q: "איפה ה" + a.t + "?", speak: "אֵיפֹה הַ" + a.n + "?",
        opts: opts.map(function(o){ return {html: o.e, ok: o === a, name: o.t}; }),
        okSay: "נָכוֹן! זֶה " + a.n + (a.s ? ". הַ" + a.n + " עוֹשֶׂה " + a.s : ""),
        hint: function(o){ return "זה " + o.name; } }; }});
  }});

/* ===== 8. של מי הצל? ===== */
var SHAPES = ["🐘","🦒","🐢","🐇","🦋","🐟","🍎","🍌","🚗","✈️","🏠","⭐","🐓","🦆","🐈","🎈","☂️","🐌","🌳","🚲","🐳","🦕","🍐","🔑"];
KG.push({id:"shadows", name:"של מי הצל?", ic:"👤", bg:"#EDE7F3", ages:[2,5], kind:"game",
  learn:"הבחנה חזותית: צורות וקווי מתאר",
  intro:"של מי הצל? מסתכלים על הצל השחור, ומוצאים למי הוא שייך.",
  run: function(stage, api){
    api.quiz(stage, {rounds: 8, winMsg: "מצאתם את כל הצללים!", winIc: "👤", make: function(i){
      var opts = api.pick(SHAPES, i < 3 ? 2 : 3), a = opts[api.rnd(opts.length)];
      return { q: "של מי הצל הזה?", speak: "שֶׁל מִי הַצֵּל הַזֶּה?",
        extra: '<div style="text-align:center;font-size:clamp(90px,24vw,130px);line-height:1.1;margin:-6px 0 12px"><span class="kg-shadow" aria-label="צל">' + a + '</span></div>',
        opts: opts.map(function(o){ return {html: o, ok: o === a}; }), okSay: "נָכוֹן!" }; }});
  }});

/* ===== 9. מקטן לגדול ===== */
KG.push({id:"sizes", name:"מקטן לגדול", ic:"🪆", bg:"#FFE9D6", ages:[3,5], kind:"game",
  learn:"השוואה וסידור לפי גודל, המילים קטן–בינוני–גדול",
  intro:"מקטן לגדול. נוגעים קודם בהכי קטן, ואז בגדול ממנו, עד הכי גדול!",
  run: function(stage, api){
    var E = ["🐻","🍎","⭐","🐟","🎈","🌼","🐢","🚗"], counts = [3,3,4,4,5], round = 0;
    var next = function(){
      if (round >= counts.length) return api.win("סידרתם הכל מהקטן לגדול!", "🪆");
      // הגדלים מותאמים לרוחב המסך, כך שכל השורה המסודרת נכנסת גם בטלפון צר
      var n = counts[round], e = E[api.rnd(E.length)], room = Math.max(260, stage.clientWidth - 30), top = Math.min(114, Math.floor((room - 18 * n) / (.78 * n))), low = Math.max(22, Math.round(top * .35)),
        sizes = Array.from({length: n}, function(_, k){ return low + Math.round(k * (top - low) / (n - 1)); }), need = 0;
      stage.innerHTML = '<div class="kg-dots">' + counts.map(function(_, k){ return '<i class="' + (k < round ? "on" : "") + '"></i>'; }).join("") + '</div><div class="kg-q">נוגעים מהקטן לגדול <button type="button" class="kg-say" aria-label="לשמוע שוב">🔊</button></div><div class="sz-area" id="zA"></div><div class="sz-line" id="zL" aria-label="השורה המסודרת"></div>';
      stage.querySelector(".kg-say").onclick = function(){ api.say("נוֹגְעִים קֹדֶם בַּהֲכִי קָטָן"); };
      var A = stage.querySelector("#zA"), Ln = stage.querySelector("#zL");
      api.shuffle(sizes.map(function(s, k){ return k; })).forEach(function(k){
        var b = document.createElement("button"); b.type = "button"; b.style.fontSize = sizes[k] + "px"; b.textContent = e; b.setAttribute("aria-label", "גודל " + (k + 1)); b.dataset.k = k;
        b.onclick = function(){ if (+b.dataset.k !== need) return api.almost(stage, need === 0 ? "מחפשים את הכי קטן" : "מחפשים את הבא בגודל");
          api.tone(330 + need * 80, .2, "sine", .25); Ln.appendChild(b); b.onclick = null; need++;
          if (need === n) { api.SND.ok(); api.say("יוֹפִי! מִקָּטָן לְגָדוֹל"); round++; setTimeout(next, 1400); } };
        A.appendChild(b); });
      if (round === 0) api.say("נוֹגְעִים קֹדֶם בַּהֲכִי קָטָן");
    };
    next();
  }});

/* ===== 10. המבוך ===== */
KG.push({id:"maze", name:"המבוך של הצב", ic:"🐢", bg:"#DDF5E5", ages:[4,8], kind:"game",
  learn:"תכנון דרך, כיוונים (ימינה, שמאלה, למעלה, למטה) והתמדה",
  intro:"המבוך של הצב. עוזרים לצב להגיע הביתה! לוחצים על החצים, או מחליקים באצבע על המבוך.",
  run: function(stage, api){
    var sizes = [5, 7, 9], lv = 0;
    var build = function(n){
      var walls = Array.from({length: n * n}, function(){ return {t:1, r:1, b:1, l:1}; }), seen = Array(n * n).fill(false), st = [0]; seen[0] = true;
      while (st.length){ var c = st[st.length - 1], x = c % n, y = (c / n) | 0, nb = [];
        if (y > 0 && !seen[c - n]) nb.push([c - n, "t", "b"]); if (x < n - 1 && !seen[c + 1]) nb.push([c + 1, "r", "l"]);
        if (y < n - 1 && !seen[c + n]) nb.push([c + n, "b", "t"]); if (x > 0 && !seen[c - 1]) nb.push([c - 1, "l", "r"]);
        if (!nb.length) { st.pop(); continue; } var p = nb[api.rnd(nb.length)]; walls[c][p[1]] = 0; walls[p[0]][p[2]] = 0; seen[p[0]] = true; st.push(p[0]); }
      return walls;
    };
    var level = function(){
      if (lv >= sizes.length) return api.win("הצב הגיע הביתה בכל שלושת המבוכים!", "🏠");
      var n = sizes[lv], W = build(n), pos = 0, goal = n * n - 1;
      stage.innerHTML = '<div class="kg-dots">' + sizes.map(function(_, k){ return '<i class="' + (k < lv ? "on" : "") + '"></i>'; }).join("") + '</div><div class="mz-wrap"><div class="mz" id="mz" style="grid-template-columns:repeat(' + n + ',1fr);--fs:' + Math.round(160 / n) + 'px" aria-label="מבוך"></div>' +
        '<div class="mz-pad"><span></span><button type="button" data-d="t" aria-label="למעלה">⬆️</button><span></span><button type="button" data-d="l" aria-label="שמאלה">⬅️</button><button type="button" data-d="b" aria-label="למטה">⬇️</button><button type="button" data-d="r" aria-label="ימינה">➡️</button></div></div>';
      var M = stage.querySelector("#mz"), B = "3px solid #4E8576";
      M.innerHTML = W.map(function(w, i){ return '<div style="border-top:' + (w.t ? B : "0") + ';border-right:' + (w.r ? B : "0") + ';border-bottom:' + (w.b ? B : "0") + ';border-left:' + (w.l ? B : "0") + '">' + (i === goal ? "🏠" : "") + '</div>'; }).join("");
      var cells = M.children, turtle = document.createElement("span"); turtle.textContent = "🐢"; cells[0].appendChild(turtle);
      var SAY = {t:"לְמַעְלָה", b:"לְמַטָּה", r:"יָמִינָה", l:"שְׂמֹאלָה"};
      var move = function(d){
        if (W[pos][d]) { api.SND.soft(); return; }
        pos += d === "t" ? -n : d === "b" ? n : d === "r" ? 1 : -1; cells[pos].appendChild(turtle); api.tone(500, .07, "sine", .15);
        if (pos === goal) { api.SND.ok(); lv++; api.say("הַצָּב הִגִּיעַ הַבַּיְתָה!"); setTimeout(level, 1300); }
      };
      stage.querySelectorAll(".mz-pad button").forEach(function(b){ b.onclick = function(){ api.say(SAY[b.dataset.d]); move(b.dataset.d); }; });
      var sx = 0, sy = 0;
      M.addEventListener("pointerdown", function(e){ sx = e.clientX; sy = e.clientY; });
      M.addEventListener("pointerup", function(e){ var dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "b" : "t")); });
      document.onkeydown = function(e){ if (!document.body.contains(M)) { document.onkeydown = null; return; } var k = {ArrowUp:"t", ArrowDown:"b", ArrowLeft:"l", ArrowRight:"r"}[e.key]; if (k) { e.preventDefault(); move(k); } };
    };
    level(); api.say(this.intro);
  }});

/* ===== 11. מי לא שייך? ===== */
var CATS = [
  {n:"פירות", one:"פְּרִי", s:"פֵּרוֹת", e:["🍎","🍌","🍇","🍓","🍐","🍊","🍉","🍒"]},
  {n:"כלי רכב", one:"כְּלִי רֶכֶב", s:"כְּלֵי רֶכֶב", e:["🚗","🚌","🚲","✈️","🚂","🚀","🚁","⛵"]},
  {n:"חיות", one:"חַיָּה", s:"חַיּוֹת", e:["🐶","🐱","🐮","🐷","🐵","🦁","🐰","🐘"]},
  {n:"בגדים", one:"בֶּגֶד", s:"בְּגָדִים", e:["👕","👖","👗","🧦","🧢","🧤","👟","🧥"]},
  {n:"ירקות", one:"יָרָק", s:"יְרָקוֹת", e:["🥕","🥒","🌽","🥦","🥔","🧅","🫑","🍆"]},
  {n:"כלי נגינה", one:"כְּלִי נְגִינָה", s:"כְּלֵי נְגִינָה", e:["🎸","🥁","🎹","🎺","🎻","🎷"]}
];
KG.push({id:"odd", name:"מי לא שייך?", ic:"🧺", bg:"#FFF1C9", ages:[4,6], kind:"game",
  learn:"מיון לקבוצות: פירות, ירקות, חיות, בגדים, כלי רכב וכלי נגינה",
  intro:"מי לא שייך? שלושה דברים הם מאותה קבוצה, ואחד לא. מוצאים את מי שלא שייך!",
  run: function(stage, api){
    api.quiz(stage, {rounds: 8, winMsg: "אתם אלופי מיון!", winIc: "🧺", make: function(){
      var a, b; do { var two = api.pick(CATS, 2); a = two[0]; b = two[1]; } while ((a.n === "פירות" && b.n === "ירקות") || (a.n === "ירקות" && b.n === "פירות"));
      var odd = api.pick(b.e, 1)[0], same = api.pick(a.e, 3), all = api.shuffle(same.concat([odd]));
      return { q: "מי לא שייך?", speak: "מִי לֹא שַׁיָּךְ?", n: 4,
        opts: all.map(function(o){ return {html: o, ok: o === odd}; }),
        okSay: "נָכוֹן! הַשְּׁאָר הֵם " + a.s + ", וְזֶה " + b.one + ".",
        hint: function(){ return "שלושה הם " + a.n; } }; }});
  }});

/* ===== 12. באיזו אות מתחילה? ===== */
var LETTER = {"א":"אָלֶף","ב":"בֵּית","ג":"גִּימֶל","ד":"דָּלֶת","ה":"הֵא","ו":"וָו","ז":"זַיִן","ח":"חֵית","ט":"טֵית","י":"יוּד","כ":"כָּף","ל":"לָמֶד","מ":"מֵם","נ":"נוּן","ס":"סָמֶךְ","ע":"עַיִן","פ":"פֵּא","צ":"צָדִי","ק":"קוּף","ר":"רֵישׁ","ש":"שִׁין","ת":"תָּו"};
var WORDS = [
  ["🦁","אריה","אַרְיֵה"],["🍌","בננה","בָּנָנָה"],["🐫","גמל","גָּמָל"],["🐟","דג","דָּג"],["⛰️","הר","הַר"],["🌹","ורד","וֶרֶד"],["🦓","זברה","זֶבְּרָה"],
  ["🐈","חתול","חָתוּל"],["🦚","טווס","טַוָּס"],["👦","ילד","יֶלֶד"],["🐕","כלב","כֶּלֶב"],["🍋","לימון","לִימוֹן"],["☂️","מטרייה","מִטְרִיָּה"],["🐅","נמר","נָמֵר"],
  ["🐎","סוס","סוּס"],["🐭","עכבר","עַכְבָּר"],["🐘","פיל","פִּיל"],["🐢","צב","צָב"],["🐒","קוף","קוֹף"],["🚂","רכבת","רַכֶּבֶת"],["☀️","שמש","שֶׁמֶשׁ"],["🍎","תפוח","תַּפּוּחַ"]
];
KG.push({id:"letters", name:"באיזו אות מתחילה?", ic:"🔤", bg:"#FFE3F4", ages:[5,7], kind:"game",
  learn:"מודעות פונולוגית: הצליל הראשון במילה והאותיות א'–ת'",
  intro:"באיזו אות מתחילה? מקשיבים למילה, ובוחרים את האות שהיא מתחילה בה.",
  run: function(stage, api){
    var order = api.shuffle(WORDS);
    api.quiz(stage, {rounds: 8, winMsg: "זיהיתם את האות הראשונה בכל המילים!", winIc: "🔤", make: function(i){
      var w = order[i], L = w[1][0], others = api.pick(Object.keys(LETTER).filter(function(x){ return x !== L; }), 2), opts = api.shuffle([L].concat(others));
      return { q: "באיזו אות מתחילה המילה?", speak: "בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה " + w[2] + "?",
        extra: '<div style="text-align:center;font-size:clamp(70px,18vw,100px);line-height:1.1">' + w[0] + '</div><div class="lt-word"><b>?</b>' + w[1].slice(1) + '</div>',
        opts: opts.map(function(o){ return {html: o, cls: "txt", ok: o === L, name: "האות " + o}; }),
        okSay: "נָכוֹן! " + w[2] + " מַתְחִילָה בָּאוֹת " + LETTER[L],
        after: function(st){ st.querySelectorAll(".kg-opt").forEach(function(b){ var o = opts[+b.dataset.k]; b.addEventListener("click", function(){ if (o === L) st.querySelector(".lt-word").innerHTML = "<b>" + L + "</b>" + w[1].slice(1); }); }); },
        hint: function(o){ return "זו האות " + o.html; } }; }});
  }});

/* ===== 13. איפה הכדור? ===== */
KG.push({id:"where", name:"איפה הכדור?", ic:"⚽", bg:"#DCEBFF", ages:[3,5], kind:"game",
  learn:"מושגי מקום: מעל, מתחת, ליד ובין",
  intro:"איפה הכדור? מקשיבים, ובוחרים את התמונה הנכונה: הכדור מעל הקופסה, מתחת, ליד, או בין שתי קופסאות.",
  run: function(stage, api){
    var BOX = "📦", POS = {
      above: {t:"מעל הקופסה", s:"מֵעַל הַקֻּפְסָה", h: function(o){ return '<span style="font-size:46cqw;bottom:0;left:50%;transform:translateX(-50%)">' + BOX + '</span><span style="font-size:30cqw;top:0;left:50%;transform:translateX(-50%)">' + o + '</span>'; }},
      below: {t:"מתחת לקופסה", s:"מִתַּחַת לַקֻּפְסָה", h: function(o){ return '<span style="font-size:46cqw;top:0;left:50%;transform:translateX(-50%)">' + BOX + '</span><span style="font-size:30cqw;bottom:0;left:50%;transform:translateX(-50%)">' + o + '</span>'; }},
      beside:{t:"ליד הקופסה", s:"לְיַד הַקֻּפְסָה", h: function(o){ return '<span style="font-size:46cqw;top:50%;left:0;transform:translateY(-50%)">' + BOX + '</span><span style="font-size:30cqw;top:58%;right:2%;transform:translateY(-50%)">' + o + '</span>'; }},
      between:{t:"בין שתי הקופסאות", s:"בֵּין שְׁתֵּי הַקֻּפְסָאוֹת", h: function(o){ return '<span style="font-size:32cqw;top:50%;left:0;transform:translateY(-50%)">' + BOX + '</span><span style="font-size:24cqw;top:56%;left:50%;transform:translate(-50%,-50%)">' + o + '</span><span style="font-size:32cqw;top:50%;right:0;transform:translateY(-50%)">' + BOX + '</span>'; }}
    }, keys = Object.keys(POS), OBJ = [["⚽","הכדור","הַכַּדּוּר"], ["🐈","החתול","הֶחָתוּל"], ["🧸","הדובי","הַדֻּבּוֹן"]];
    api.quiz(stage, {rounds: 8, winMsg: "אתם יודעים בדיוק איפה כל דבר!", winIc: "📦", make: function(i){
      var opts = api.pick(keys, 3), a = opts[api.rnd(3)], ob = OBJ[i % 3];
      return { q: "איפה " + ob[1] + " " + POS[a].t + "?", speak: "בְּאֵיזוֹ תְּמוּנָה " + ob[2] + " " + POS[a].s + "?",
        opts: opts.map(function(k){ return {html: '<div class="sp" aria-hidden="true">' + POS[k].h(ob[0]) + '</div>', ok: k === a, name: POS[k].t}; }),
        okSay: "נָכוֹן! " + ob[2] + " " + POS[a].s,
        hint: function(o){ return "כאן " + ob[1] + " " + o.name; } }; }});
  }});
})();
