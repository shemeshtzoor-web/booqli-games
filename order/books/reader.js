/* קורא ספרים באתר – פותח ספר בתוך העמוד, עמוד אחרי עמוד (בלי לצאת לאתר הראשי).
   שימוש: <script src=".../order/books/books.js"></script><script src=".../order/books/reader.js"></script>
   ואז bqRead("birthday", 0) – ספר + מספר הגרסה (0 = הראשונה). bqCover(book) = כתובת הכריכה.
   חצים / החלקה / מקלדת, מסך מלא בטלפון, Esc לסגירה. */
(function(){
  var me = document.currentScript, BASE = me ? me.src.replace(/reader\.js(\?.*)?$/, "") : "";
  window.bqCover = function(b){ return /^https?:/.test(b.img) ? b.img : BASE + b.img; };
  var css = document.createElement("style");
  css.textContent =
    ".bqr{position:fixed;inset:0;z-index:400;background:rgba(30,18,28,.92);display:flex;flex-direction:column;direction:rtl;font-family:Assistant,Arial,sans-serif;color:#fff;padding:calc(8px + env(safe-area-inset-top,0px)) max(8px,env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px))}" +
    ".bqr[hidden]{display:none}" +
    ".bqr .top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:2px 4px 8px}" +
    ".bqr h2{font:700 19px Fredoka,Assistant,sans-serif;margin:0;flex:1;min-width:0}" +
    ".bqr .vb{border:1.5px solid rgba(255,255,255,.5);background:none;color:#fff;border-radius:999px;padding:4px 12px;font:800 14px Assistant,sans-serif;cursor:pointer}" +
    ".bqr .vb.on{background:#fff;color:#C13671;border-color:#fff}" +
    ".bqr .x{border:0;background:#fff;color:#2B1526;width:40px;height:40px;border-radius:50%;font:800 20px Arial,sans-serif;cursor:pointer;flex-shrink:0}" +
    ".bqr .stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:8px;position:relative}" +
    ".bqr img{max-width:100%;max-height:100%;width:auto;height:auto;border-radius:6px;box-shadow:0 10px 40px rgba(0,0,0,.4);background:#fff;user-select:none;-webkit-user-drag:none}" +
    ".bqr .nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:#C13671;font:800 26px Arial,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}" +
    ".bqr .nav:disabled{opacity:.3;cursor:default}" +
    ".bqr .next{left:6px}.bqr .prev{right:6px}" +
    ".bqr .bot{display:flex;align-items:center;justify-content:center;gap:12px;padding-top:8px;font-weight:800}" +
    ".bqr .bot small{font-weight:600;opacity:.8}" +
    "@media (max-width:600px){.bqr .nav{width:42px;height:42px;font-size:22px}.bqr h2{font-size:17px}}";
  document.head.appendChild(css);
  var box, B, V = 0, P = 1, lastFocus = null;
  function el(){
    if (box) return box;
    box = document.createElement("div"); box.className = "bqr"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "קריאת ספר");
    box.innerHTML = '<div class="top"><h2></h2><span class="vs"></span><button class="x" type="button" aria-label="סגירה">✕</button></div>' +
      '<div class="stage"><button class="nav prev" type="button" aria-label="העמוד הקודם">›</button><img alt=""><button class="nav next" type="button" aria-label="העמוד הבא">‹</button></div>' +
      '<div class="bot"><span class="pg"></span><small>החליקו או לחצו על החצים</small></div>';
    document.body.appendChild(box);
    box.querySelector(".x").onclick = close;
    box.querySelector(".next").onclick = function(){ go(1); };
    box.querySelector(".prev").onclick = function(){ go(-1); };
    box.addEventListener("click", function(e){ if (e.target === box) close(); });
    var sx = null;
    box.addEventListener("touchstart", function(e){ sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function(e){ if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1); sx = null; });
    document.addEventListener("keydown", function(e){
      if (box.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") go(1); else if (e.key === "ArrowRight") go(-1);
    });
    return box;
  }
  function src(p){ return BASE + B.v[V][1] + "/" + (p < 10 ? "0" : "") + p + ".webp"; }
  function show(){
    var n = B.v[V][2];
    box.querySelector("img").src = src(P);
    box.querySelector("img").alt = B.name + " – עמוד " + P;
    box.querySelector(".pg").textContent = "עמוד " + P + " מתוך " + n;
    box.querySelector(".prev").disabled = P <= 1; box.querySelector(".next").disabled = P >= n;
    if (P < n) { var im = new Image(); im.src = src(P + 1); }
  }
  function go(d){ var n = B.v[V][2]; P = Math.max(1, Math.min(n, P + d)); show(); }
  function close(){ box.hidden = true; document.documentElement.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  window.bqRead = function(id, ver){
    B = (window.BQ_BOOKS || []).find(function(b){ return b.id === id; }); if (!B) return;
    el(); V = Math.min(ver || 0, B.v.length - 1); P = 1; lastFocus = document.activeElement;
    box.querySelector("h2").textContent = "📖 " + B.name;
    var vs = box.querySelector(".vs");
    vs.innerHTML = B.v.length > 1 ? B.v.map(function(v, i){ return '<button class="vb' + (i === V ? " on" : "") + '" type="button" data-v="' + i + '">' + v[0] + "</button>"; }).join(" ") : "";
    vs.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ V = +b.dataset.v; P = 1; vs.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x === b); }); show(); }; });
    box.hidden = false; document.documentElement.style.overflow = "hidden"; show(); box.querySelector(".x").focus();
    if (window.siteEvent) siteEvent("click", "read_" + id + "_" + B.v[V][1]);
  };
})();
