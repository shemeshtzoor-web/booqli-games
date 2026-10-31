/* booqli Games – עורך "הספר שלכם בכריכה קשה"
   הכל קורה בדפדפן. הספר נשמר ב-IndexedDB במחשב של המשתמשת, ואפשר להוריד/לפתוח קובץ גיבוי (.booqli).
   מידות (מ"מ): עמוד פנימי 206×206 (200 + 3 בליד מכל צד), כריכה 466×250 (426×210 + 20 בליד מכל צד).
   כריכה (מבט מבחוץ, פרוסה): קדמית משמאל · שדרה + שטח מת באמצע · אחורית מימין. בשדרה אסור טקסט.
   24 עמודים. תצוגה בכפולות: כפולה 1 = [פנים הכריכה | עמוד 1], ואז 2–3 ... 22–23, ובסוף [24 | פנים הכריכה האחורית].
   כל פריט שייך לעמוד אחד, בקואורדינטות של העמוד (0–206). */
(function(){
"use strict";

// ---------- קבועים ----------
var PG = 206, BL = 3, TRIM = 200, SAFE = 10;              // עמוד פנימי
var CW = 466, CH = 250, CBL = 20;                          // כריכה
var SPINE0 = 220, SPINE1 = 246;                            // שדרה + שטח מת (אסור טקסט)
var NPAGES = 24, NSPREADS = NPAGES / 2 + 1;                // 13 כפולות
var PT = 0.3528;                                           // מ"מ לנקודה
var DPI = 300, MIN_DPI = 150;
var DB_NAME = "booqli-book", STORE_KV = "kv", STORE_AS = "assets";

var FONTS = [
  ["Varela Round","עגול ונעים"],["Assistant","נקי וקריא"],["Rubik","מודרני"],["Heebo","פשוט"],
  ["Fredoka","שובב (BOOQLI)"],["Secular One","כותרת עבה"],["Suez One","כותרת חגיגית"],
  ["Frank Ruhl Libre","ספרותי"],["David Libre","קלאסי"],["Noto Sans Hebrew","ברור (מתאים לניקוד)"],
  ["Amatic SC","כתב יד"],["Karantina","צר ועליז"],["Bellefair","עדין"],
  ["Pacifico","English script"],["Patrick Hand","English hand"]
];
var COLORS = ["#33263D","#000000","#FFFFFF","#C13671","#E0399F","#FF56C2","#F22A91","#7A5CFF","#2E7DD7","#073763","#4E8576","#1FA855","#F5A623","#FFDD55","#E53935","#8D6E63","#FFE3F4","#E1F0EA","#FFF7D6","#E3F0FF","#F1E6FF"];
var BG_COLORS = ["#FFFFFF","#FFF7FB","#FFE3F4","#E1F0EA","#FFF7D6","#E3F0FF","#F1E6FF","#FFEDE0","#FFD1EC","#C9E8DA","#FFE9A8","#BFD9FF","#D9C6FF","#FF56C2","#6F988B","#33263D"];

// ---------- מצב ----------
var P = null;            // הפרויקט
var assets = {};         // id -> {blob,url,w,h}
var view = 0;            // 0 = כריכה, 1..13 = כפולות
var sel = null;          // {pg, id}
var activePg = 1;
var hist = [], fut = [], lastSnap = "";
var zoom = 1, ppm = 2;   // פיקסלים (CSS) למ"מ
var editingId = null, panMode = false;
var dirty = false, lastBackup = Date.now(), editsSinceBackup = 0;
var imgCache = {};
var replaceTarget = null; // {pg,id} של מסגרת להחלפת תמונה
var stkGroup = null;

// כתובת קבועה: המדידה (siteEvent) משנה לרגע את כתובת הדף, אז כל קישור יחסי נבנה מכאן
var BASE = location.href.split(/[?#]/)[0].replace(/[^/]*$/, "");
function abs(u){ return /^(blob:|data:|https?:)/.test(u) ? u : BASE + u; }
var $ = function(id){ return document.getElementById(id); };
var meas = document.createElement("canvas").getContext("2d");

function uid(){ return Math.random().toString(36).slice(2, 10); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function ev(kind, name){ try { siteEvent(kind, name); } catch (e) {} }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

// ---------- מבנה הכפולות ----------
function spreadPages(s){ return { right: 2 * (s - 1), left: 2 * (s - 1) + 1 }; } // 0 ו-25 = פנים הכריכה
function pageOn(n){ return n >= 1 && n <= NPAGES; }
function viewW(){ return view === 0 ? CW : PG * 2 - BL * 2; }   // 406
function viewH(){ return view === 0 ? CH : PG; }
function pageObj(pg){ return pg === "c" ? P.cover : P.pages[pg]; }
function pageW(pg){ return pg === "c" ? CW : PG; }
function pageH(pg){ return pg === "c" ? CH : PG; }
// היסט התצוגה של עמוד בתוך הכפולה (מ"מ): עמוד שמאל מוצג 0..203, עמוד ימין מוצג 203..406 (מקומי 3..206)
function pgOffset(pg){
  if (pg === "c") return 0;
  var sp = spreadPages(view);
  return pg === sp.left ? 0 : PG - BL * 2;  // 200
}
function viewPages(){
  if (view === 0) return ["c"];
  var sp = spreadPages(view), r = [];
  if (pageOn(sp.left)) r.push(sp.left);
  if (pageOn(sp.right)) r.push(sp.right);
  return r;
}
function viewOf(pg){ return pg === "c" ? 0 : Math.floor(pg / 2) + 1; }
function pgLabel(pg){ return pg === "c" ? "הכריכה" : "עמוד " + pg; }

// ---------- פרויקט חדש ----------
function emptyPages(){ var o = {}; for (var i = 1; i <= NPAGES; i++) o[i] = { bg: "#FFFFFF", items: [] }; return o; }
function brandItem(){ return { type: "brand", x: 316, y: 196, w: 60, h: 20, rot: 0, locked: true }; }
function withIds(items){ return items.map(function(it){ it = clone(it); it.id = uid(); return it; }); }
function newSample(){
  var S = window.BOOK_SAMPLE, p = { v: 1, title: "הספר שלי", cover: { bg: "#FFE3F4", items: withIds(S.cover) }, pages: emptyPages() };
  for (var k in S.pages) p.pages[k].items = withIds(S.pages[k]);
  return p;
}
function newBlank(){
  var p = { v: 1, title: "הספר שלי", cover: { bg: "#FFE3F4", items: [] }, pages: emptyPages() };
  p.cover.items = withIds([
    { type: "text", x: 35, y: 90, w: 170, h: 30, size: 40, text: "שם הספר", font: "Secular One", color: "#C13671", align: "center", rot: 0, hint: "text" },
    { type: "img", x: 45, y: 135, w: 150, h: 75, src: "", rot: 0, clip: "round", hint: "photo" },
    { type: "text", x: 266, y: 90, w: 160, h: 20, size: 16, text: "הספר נוצר באהבה\nעל ידי: ___", font: "Varela Round", bold: true, color: "#C13671", align: "center", rot: 0, hint: "text" },
    brandItem()
  ]);
  p.pages[1].items = withIds([{ type: "text", x: 23, y: 80, w: 160, h: 20, size: 20, text: "הַסֵּפֶר הַזֶּה שַׁיָּךְ לְ...", font: "Varela Round", color: "#33263D", align: "center", rot: 0, hint: "text" }]);
  return p;
}
function ensureBrand(){
  if (!P.cover.items.some(function(i){ return i.type === "brand"; })) { var b = brandItem(); b.id = uid(); P.cover.items.push(b); }
}

// ---------- אחסון (IndexedDB) ----------
var dbP = null;
function db(){
  if (dbP) return dbP;
  dbP = new Promise(function(res, rej){
    var r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = function(){ r.result.createObjectStore(STORE_KV); r.result.createObjectStore(STORE_AS); };
    r.onsuccess = function(){ res(r.result); };
    r.onerror = function(){ rej(r.error); };
  });
  return dbP;
}
function idb(store, mode, fn){
  return db().then(function(d){ return new Promise(function(res, rej){
    var t = d.transaction(store, mode), s = t.objectStore(store), out = fn(s);
    t.oncomplete = function(){ res(out instanceof IDBRequest ? out.result : out); };
    t.onerror = function(){ rej(t.error); };
  }); });
}
function kvGet(k){ return idb(STORE_KV, "readonly", function(s){ return s.get(k); }); }
function kvSet(k, v){ return idb(STORE_KV, "readwrite", function(s){ s.put(v, k); }); }
function asPut(id, rec){ return idb(STORE_AS, "readwrite", function(s){ s.put(rec, id); }); }
function asAll(){
  return db().then(function(d){ return new Promise(function(res){
    var out = {}, t = d.transaction(STORE_AS, "readonly"), c = t.objectStore(STORE_AS).openCursor();
    c.onsuccess = function(){ var cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } };
    t.oncomplete = function(){ res(out); };
    t.onerror = function(){ res(out); };
  }); });
}
function asClear(){ return idb(STORE_AS, "readwrite", function(s){ s.clear(); }); }

var saveT = null;
function scheduleSave(){
  dirty = true; editsSinceBackup++;
  $("status").textContent = "שומר…";
  clearTimeout(saveT);
  saveT = setTimeout(saveNow, 600);
}
function saveNow(){
  if (!P) return Promise.resolve();
  P.updated = Date.now();
  return kvSet("project", P).then(function(){ dirty = false; $("status").textContent = "✓ נשמר במחשב"; })
    .catch(function(){ $("status").textContent = "⚠️ לא נשמר – שמרו גיבוי"; });
}
function loadAssetsFromDB(){
  return asAll().then(function(all){
    Object.keys(assets).forEach(function(k){ URL.revokeObjectURL(assets[k].url); });
    assets = {};
    for (var id in all) assets[id] = { blob: all[id].blob, w: all[id].w, h: all[id].h, url: URL.createObjectURL(all[id].blob) };
  });
}

// ---------- היסטוריה (ביטול/חזרה) ----------
function snap(){ return JSON.stringify({ title: P.title, cover: P.cover, pages: P.pages }); }
function commit(){
  var s = snap();
  if (s === lastSnap) return;
  hist.push(lastSnap); if (hist.length > 60) hist.shift();
  fut = []; lastSnap = s;
  scheduleSave(); updUndo(); thumbSoon();
}
function restore(s){
  var o = JSON.parse(s); P.title = o.title; P.cover = o.cover; P.pages = o.pages; lastSnap = s;
  if (sel && !findItem(sel.pg, sel.id)) sel = null;
  $("title").value = P.title;
  scheduleSave(); updUndo(); refreshAll();
}
function undo(){ if (!hist.length) return; fut.push(lastSnap); restore(hist.pop()); }
function redo(){ if (!fut.length) return; hist.push(lastSnap); restore(fut.pop()); }
function updUndo(){ $("undo").disabled = !hist.length; $("redo").disabled = !fut.length; }

// ---------- תמונות ----------
function srcUrl(src){
  if (!src) return null;
  if (src.indexOf("a:") === 0) { var a = assets[src.slice(2)]; return a ? a.url : null; }
  if (src.indexOf("stk:") === 0) return abs("stickers/" + src.slice(4) + ".svg");
  return abs(src);
}
function getImg(src){
  var url = srcUrl(src);
  if (!url) return null;
  var c = imgCache[url];
  if (!c) {
    c = imgCache[url] = { img: new Image(), ok: false };
    c.p = new Promise(function(res){
      c.img.onload = function(){ c.ok = true; res(); requestDraw(); allThumbsSoon(); };
      c.img.onerror = function(){ res(); };
    });
    c.img.src = url;
  }
  return c;
}
function imgSize(src){
  if (src && src.indexOf("a:") === 0) { var a = assets[src.slice(2)]; if (a) return { w: a.w, h: a.h }; }
  var c = getImg(src); return c && c.ok ? { w: c.img.naturalWidth, h: c.img.naturalHeight } : null;
}
function waitImages(items){
  return Promise.all(items.map(function(it){
    var src = it.type === "brand" ? "../img/logo-dark.png" : it.src;
    var c = getImg(src); return c ? c.p : null;
  }));
}

// ---------- טקסט ----------
function isRTL(t){ var m = /[֐-׿؀-ۿ]|[A-Za-z]/.exec(t || ""); return !m || /[֐-ۿ]/.test(m[0]); }
function fontStr(it, k){ return (it.bold ? "700 " : "400 ") + (it.size * PT * k) + 'px "' + it.font + '", "Noto Sans Hebrew", Assistant, sans-serif'; }
function layoutText(it){
  var K = 10;  // מודדים בגודל פי 10 לדיוק
  meas.font = fontStr(it, K);
  var maxW = it.w * K, lines = [];
  String(it.text || "").split("\n").forEach(function(par){
    var words = par.split(" "), line = "";
    words.forEach(function(w){
      var test = line ? line + " " + w : w;
      if (meas.measureText(test).width <= maxW || !line) {
        if (!line && meas.measureText(w).width > maxW) {   // מילה ארוכה מדי – שוברים באותיות
          var part = "";
          Array.from(w).forEach(function(ch){
            if (meas.measureText(part + ch).width > maxW && part) { lines.push(part); part = ch; } else part += ch;
          });
          line = part;
        } else line = test;
      } else { lines.push(line); line = w; }
    });
    lines.push(line);
  });
  var lh = it.size * PT * (it.lh || 1.3);
  it.h = Math.max(lh, lines.length * lh) + it.size * PT * 0.15;
  var maxw = 0; lines.forEach(function(l){ maxw = Math.max(maxw, meas.measureText(l).width / K); });
  return { lines: lines, lh: lh, maxw: maxw };
}

// ---------- ציור ----------
function drawItem(ctx, it, opt){
  ctx.save();
  ctx.translate(it.x + it.w / 2, it.y + it.h / 2);
  if (it.rot) ctx.rotate(it.rot * Math.PI / 180);
  var w = it.w, h = it.h, x0 = -w / 2, y0 = -h / 2;
  if (it.type === "text") {
    if (opt.skip === it.id) { ctx.restore(); return; }
    var L = layoutText(it); h = it.h; y0 = -h / 2;
    var K = 10;
    ctx.scale(1 / K, 1 / K);
    ctx.font = fontStr(it, K);
    ctx.direction = isRTL(it.text) ? "rtl" : "ltr";
    ctx.textAlign = it.align || "center";
    ctx.textBaseline = "middle";
    var ax = it.align === "right" ? w / 2 : it.align === "left" ? -w / 2 : 0;
    L.lines.forEach(function(line, i){
      var y = (y0 + L.lh * (i + 0.5) + it.size * PT * 0.08) * K;
      if (it.stroke) {
        ctx.lineJoin = "round"; ctx.strokeStyle = it.strokeColor || "#FFFFFF"; ctx.lineWidth = it.size * PT * 0.22 * K;
        ctx.strokeText(line, ax * K, y);
      }
      ctx.fillStyle = it.color || "#33263D";
      ctx.fillText(line, ax * K, y);
    });
  } else if (it.type === "shape") {
    ctx.globalAlpha = it.opacity == null ? 1 : it.opacity;
    ctx.fillStyle = it.fill || "#FFE3F4";
    shapePath(ctx, it.shape, x0, y0, w, h); ctx.fill();
  } else if (it.type === "img") {
    var c = getImg(it.src);
    shapePath(ctx, it.clip || "rect", x0, y0, w, h);
    if (c && c.ok) {
      ctx.clip();
      var iw = c.img.naturalWidth, ih = c.img.naturalHeight;
      if (it.fit === "stretch") ctx.drawImage(c.img, x0, y0, w, h);
      else {
        var s = Math.max(w / iw, h / ih) * (it.zoom || 1), dw = iw * s, dh = ih * s;
        var px = x0 + (w - dw) / 2 + (it.ox || 0) * (dw - w) / 2;
        var py = y0 + (h - dh) / 2 + (it.oy || 0) * (dh - h) / 2;
        ctx.drawImage(c.img, px, py, dw, dh);
      }
    } else if (!opt.print) {
      ctx.fillStyle = "rgba(255,227,244,.85)"; ctx.fill();
      ctx.setLineDash([3, 2]); ctx.strokeStyle = "#E0399F"; ctx.lineWidth = 0.6; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#C13671"; ctx.font = "700 " + Math.min(w, h) * 0.22 + "px Assistant";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("📷", 0, -Math.min(w, h) * 0.08);
    }
  } else if (it.type === "sticker") {
    var cs = getImg(it.src); if (cs && cs.ok) ctx.drawImage(cs.img, x0, y0, w, h);
  } else if (it.type === "brand") {
    var cb = getImg("../img/logo-dark.png");
    if (cb && cb.ok) {
      var r = cb.img.naturalWidth / cb.img.naturalHeight, bw = Math.min(w, h * r), bh = bw / r;
      ctx.drawImage(cb.img, -bw / 2, -bh / 2, bw, bh);
    }
  }
  ctx.restore();
}
function shapePath(ctx, shape, x, y, w, h){
  ctx.beginPath();
  if (shape === "circle") ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  else if (shape === "round") { var r = Math.min(w, h) * 0.18; if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  else ctx.rect(x, y, w, h);
}
function drawPage(ctx, pg, opt){
  var p = pageObj(pg);
  ctx.fillStyle = p.bg || "#FFFFFF"; ctx.fillRect(0, 0, pageW(pg), pageH(pg));
  p.items.forEach(function(it){ drawItem(ctx, it, opt); });
}
function drawDisabled(ctx, x, w, h, label){
  ctx.fillStyle = "#E9E1E6"; ctx.fillRect(x, 0, w, h);
  ctx.fillStyle = "#9A8A96"; ctx.font = "700 9px Assistant"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.direction = "rtl"; ctx.fillText(label, x + w / 2, h / 2 - 6);
  ctx.font = "400 6.5px Assistant"; ctx.fillText("(לא מודפס)", x + w / 2, h / 2 + 6);
}
// ציור כפולה/כריכה בקואורדינטות תצוגה. opt.guides = קווי עזר
function drawView(ctx, v, opt){
  var save = view; view = v;
  if (v === 0) {
    drawPage(ctx, "c", opt);
    if (opt.guides) coverGuides(ctx);
  } else {
    var sp = spreadPages(v), half = PG - BL;   // 203
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, half, PG); ctx.clip();
    if (pageOn(sp.left)) drawPage(ctx, sp.left, opt); else drawDisabled(ctx, 0, half, PG, "פנים הכריכה האחורית");
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(half, 0, half, PG); ctx.clip(); ctx.translate(PG - BL * 2, 0);
    if (pageOn(sp.right)) drawPage(ctx, sp.right, opt); else { ctx.restore(); ctx.save(); drawDisabled(ctx, half, half, PG, "פנים הכריכה"); }
    ctx.restore();
    if (opt.guides) spreadGuides(ctx, sp);
  }
  view = save;
}
function bleedShade(ctx, x, y, w, h, b){
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillRect(x, y, w, b); ctx.fillRect(x, y + h - b, w, b); ctx.fillRect(x, y + b, b, h - 2 * b); ctx.fillRect(x + w - b, y + b, b, h - 2 * b);
}
function spreadGuides(ctx, sp){
  var W = PG * 2 - BL * 2, lw = 1 / ppm;
  // אזור בליד (ייחתך) – רק בקצוות החיצוניים
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillRect(0, 0, W, BL); ctx.fillRect(0, PG - BL, W, BL); ctx.fillRect(0, BL, BL, PG - 2 * BL); ctx.fillRect(W - BL, BL, BL, PG - 2 * BL);
  ctx.lineWidth = lw * 1.2; ctx.strokeStyle = "#E53935"; ctx.strokeRect(BL, BL, W - 2 * BL, PG - 2 * BL);
  // קו השדרה
  ctx.setLineDash([4 / ppm * 2, 3 / ppm * 2]); ctx.strokeStyle = "#8a7a90";
  ctx.beginPath(); ctx.moveTo(PG - BL, 0); ctx.lineTo(PG - BL, PG); ctx.stroke();
  // אזור בטוח לטקסט
  ctx.strokeStyle = "#FF56C2"; ctx.lineWidth = lw;
  if (pageOn(sp.left)) ctx.strokeRect(BL + SAFE, BL + SAFE, TRIM - 2 * SAFE, TRIM - 2 * SAFE);
  if (pageOn(sp.right)) ctx.strokeRect(PG - BL + SAFE, BL + SAFE, TRIM - 2 * SAFE, TRIM - 2 * SAFE);
  ctx.setLineDash([]);
}
function coverGuides(ctx){
  var lw = 1 / ppm;
  bleedShade(ctx, 0, 0, CW, CH, CBL);
  ctx.lineWidth = lw * 1.2; ctx.strokeStyle = "#E53935"; ctx.strokeRect(CBL, CBL, CW - 2 * CBL, CH - 2 * CBL);
  // שדרה + שטח מת
  ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(SPINE0, CBL, SPINE1 - SPINE0, CH - 2 * CBL);
  ctx.save(); ctx.beginPath(); ctx.rect(SPINE0, CBL, SPINE1 - SPINE0, CH - 2 * CBL); ctx.clip();
  ctx.strokeStyle = "rgba(229,57,53,.35)"; ctx.lineWidth = lw;
  for (var y = -30; y < CH + 30; y += 6) { ctx.beginPath(); ctx.moveTo(SPINE0, y); ctx.lineTo(SPINE1, y + 26); ctx.stroke(); }
  ctx.restore();
  ctx.setLineDash([4 / ppm * 2, 3 / ppm * 2]); ctx.strokeStyle = "#FF56C2"; ctx.lineWidth = lw;
  ctx.strokeRect(CBL + SAFE, CBL + SAFE, SPINE0 - CBL - 2 * SAFE, CH - 2 * CBL - 2 * SAFE);
  ctx.strokeRect(SPINE1 + SAFE, CBL + SAFE, CW - CBL - SPINE1 - 2 * SAFE, CH - 2 * CBL - 2 * SAFE);
  ctx.setLineDash([]);
  ctx.save(); ctx.translate((SPINE0 + SPINE1) / 2, CH / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgba(193,54,113,.75)"; ctx.font = "700 5px Assistant"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "rtl";
  ctx.fillText("שדרה – בלי טקסט", 0, 0); ctx.restore();
}

var drawReq = false;
function requestDraw(){ if (drawReq) return; drawReq = true; requestAnimationFrame(function(){ drawReq = false; draw(); }); }
function draw(){
  if (!P) return;
  var cv = $("cv"), dpr = window.devicePixelRatio || 1, W = viewW(), H = viewH();
  cv.width = Math.round(W * ppm * dpr); cv.height = Math.round(H * ppm * dpr);
  cv.style.width = W * ppm + "px"; cv.style.height = H * ppm + "px";
  var ctx = cv.getContext("2d");
  ctx.setTransform(ppm * dpr, 0, 0, ppm * dpr, 0, 0);
  drawView(ctx, view, { guides: true, skip: editingId });
  drawOverlay();
}

// ---------- גודל התצוגה ----------
function fit(){
  var st = $("stage"), aw = st.clientWidth - 30, ah = st.clientHeight - 70;
  ppm = Math.max(0.5, Math.min(aw / viewW(), ah / viewH())) * zoom;
  $("zVal").textContent = Math.round(zoom * 100) + "%";
  st.style.overflow = zoom > 1 ? "auto" : "hidden";
  st.style.justifyContent = zoom > 1 ? "flex-start" : "center";
  requestDraw();
}

// ---------- איתור פריטים ----------
function findItem(pg, id){ var p = pageObj(pg); if (!p) return null; for (var i = 0; i < p.items.length; i++) if (p.items[i].id === id) return p.items[i]; return null; }
function selItem(){ return sel ? findItem(sel.pg, sel.id) : null; }
function toLocal(it, mx, my){ // נקודה (מקומית לעמוד) -> צירי הפריט
  var cx = it.x + it.w / 2, cy = it.y + it.h / 2, a = -(it.rot || 0) * Math.PI / 180;
  var dx = mx - cx, dy = my - cy;
  return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) };
}
function pageAt(dx){ // נקודת תצוגה -> עמוד
  if (view === 0) return "c";
  var sp = spreadPages(view);
  return dx < PG - BL ? (pageOn(sp.left) ? sp.left : null) : (pageOn(sp.right) ? sp.right : null);
}
function hit(dx, dy){
  var pgs = viewPages();
  // עמוד שמתחת לעכבר קודם
  var under = pageAt(dx);
  pgs.sort(function(a, b){ return (b === under) - (a === under); });
  for (var k = 0; k < pgs.length; k++) {
    var pg = pgs[k], off = pgOffset(pg), items = pageObj(pg).items;
    if (pg !== under) continue;
    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i], l = toLocal(it, dx - off, dy);
      if (Math.abs(l.x) <= it.w / 2 && Math.abs(l.y) <= it.h / 2) return { pg: pg, it: it };
    }
  }
  return null;
}

// ---------- שכבת הבחירה ----------
function drawOverlay(){
  var ov = $("overlay"); ov.innerHTML = "";
  ov.style.width = viewW() * ppm + "px"; ov.style.height = viewH() * ppm + "px";
  // תוויות "החליפו / שנו" על פריטי הדוגמה + כפתור במסגרות ריקות
  viewPages().forEach(function(pg){
    var off = pgOffset(pg);
    pageObj(pg).items.forEach(function(it){
      if (it.id === editingId) return;
      var cx = (off + it.x + it.w / 2) * ppm, cy = (it.y + it.h / 2) * ppm;
      if (pg !== "c" && view !== 0) { var dxm = off + it.x + it.w / 2; if (pageAt(dxm) !== pg) return; }
      if (it.type === "img" && !it.src) {
        var b = document.createElement("button"); b.className = "ph-add"; b.textContent = "📷 העלאת תמונה";
        b.style.left = cx + "px"; b.style.top = (cy + Math.min(it.w, it.h) * 0.12 * ppm) + "px"; b.style.transform = "translate(-50%,-50%)";
        b.onclick = function(e){ e.stopPropagation(); pickPhoto({ pg: pg, id: it.id }); };
        ov.appendChild(b);
      } else if (it.hint) {
        var h = document.createElement("div"); h.className = "hint";
        h.textContent = it.hint === "text" ? "✏️ לחצו פעמיים לשינוי הטקסט" : "🔄 לחצו פעמיים להחלפת התמונה";
        h.style.left = cx + "px"; h.style.top = (it.hint === "text" ? Math.max(10, it.y * ppm - 13) : cy) + "px"; h.style.transform = "translate(-50%,-50%)";
        ov.appendChild(h);
      }
    });
  });
  var it = selItem();
  if (!it || viewOf(sel.pg) !== view || it.id === editingId) return;
  var off = pgOffset(sel.pg), s = document.createElement("div");
  s.className = "sel" + (badPlacement(sel.pg, it) ? " bad" : "");
  s.style.left = (off + it.x) * ppm + "px"; s.style.top = it.y * ppm + "px";
  s.style.width = it.w * ppm + "px"; s.style.height = it.h * ppm + "px";
  s.style.transform = "rotate(" + (it.rot || 0) + "deg)";
  var hs = it.type === "text" ? ["nw", "ne", "sw", "se", "e", "w"] : ["nw", "ne", "sw", "se"];
  if (!it.locked) {
    hs.forEach(function(k){ var d = document.createElement("div"); d.className = "h " + k; d.dataset.h = k; s.appendChild(d); });
    var st = document.createElement("div"); st.className = "stem"; s.appendChild(st);
    var r = document.createElement("div"); r.className = "h rot"; r.dataset.h = "rot"; r.title = "סיבוב"; s.appendChild(r);
  }
  ov.appendChild(s);
}

// ---------- כללי מיקום (טקסט קרוב לקצה / בשדרה) ----------
function itemBox(it){ // מלבן חוסם אחרי סיבוב
  var a = (it.rot || 0) * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
  var bw = it.w * c + it.h * s, bh = it.w * s + it.h * c, cx = it.x + it.w / 2, cy = it.y + it.h / 2;
  return { x0: cx - bw / 2, x1: cx + bw / 2, y0: cy - bh / 2, y1: cy + bh / 2 };
}
function badPlacement(pg, it){
  if (it.type !== "text" && it.type !== "sticker") return false;
  var b = itemBox(it);
  if (it.type === "text") {
    var L = layoutText(it); b = itemBox(it);
    if (!it.rot && String(it.text).trim()) {   // בודקים לפי האותיות עצמן, לא לפי רוחב התיבה
      var mw = Math.min(it.w, L.maxw);
      if (it.align === "right") { b.x1 = it.x + it.w; b.x0 = b.x1 - mw; }
      else if (it.align === "left") { b.x0 = it.x; b.x1 = it.x + mw; }
      else { b.x0 = it.x + it.w / 2 - mw / 2; b.x1 = it.x + it.w / 2 + mw / 2; }
    }
  }
  if (pg === "c") {
    var m = CBL + SAFE;
    if (b.x0 < m || b.x1 > CW - m || b.y0 < m || b.y1 > CH - m) return it.type === "text" ? "edge" : false;
    if (it.type === "text" && b.x1 > SPINE0 - SAFE * 0 && b.x0 < SPINE1) return "spine";
    if (it.type === "text" && ((b.x1 > SPINE0 - SAFE && b.x0 < SPINE0) || (b.x0 < SPINE1 + SAFE && b.x1 > SPINE1))) return "edge";
    return false;
  }
  var mm = BL + SAFE;
  if (it.type === "text" && (b.x0 < mm || b.x1 > PG - mm || b.y0 < mm || b.y1 > PG - mm)) return "edge";
  return false;
}

// ---------- גרירה, שינוי גודל, סיבוב ----------
var drag = null;
function evPos(e){ var r = $("cv").getBoundingClientRect(); return { x: (e.clientX - r.left) / ppm, y: (e.clientY - r.top) / ppm }; }
function onDown(e){
  if (editingId) { finishEdit(); }
  if (e.button !== 0) return;
  var p = evPos(e), hnd = e.target.dataset && e.target.dataset.h, it = selItem();
  if (hnd && it) {
    e.preventDefault();
    var off = pgOffset(sel.pg);
    drag = { mode: hnd, it: it, start: p, o: clone(it), cx: off + it.x + it.w / 2, cy: it.y + it.h / 2 };
    capture(e); return;
  }
  var h = hit(p.x, p.y);
  var pgUnder = pageAt(p.x); if (pgUnder != null) activePg = pgUnder;
  if (!h) { sel = null; panMode = false; renderProps(); requestDraw(); return; }
  if (h.it.locked) { toast("הלוגו של BOOQLI קבוע בגב הכריכה 💗"); sel = null; renderProps(); requestDraw(); return; }
  if (!sel || sel.id !== h.it.id) panMode = false;
  sel = { pg: h.pg, id: h.it.id };
  renderProps();
  e.preventDefault();
  drag = { mode: panMode && h.it.type === "img" ? "pan" : "move", it: h.it, start: p, o: clone(h.it), moved: false };
  capture(e); requestDraw();
}
function capture(e){ window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp, { once: true }); }
function onMove(e){
  if (!drag) return;
  var p = evPos(e), it = drag.it, o = drag.o, dx = p.x - drag.start.x, dy = p.y - drag.start.y;
  guides = [];
  if (drag.mode === "move") {
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 0.8) return;
    drag.moved = true;
    var nx = o.x + dx, ny = o.y + dy, sn = snapPos(sel.pg, it, nx, ny);
    it.x = sn.x; it.y = sn.y;
  } else if (drag.mode === "pan") {
    var c = getImg(it.src);
    if (c && c.ok) {
      var s = Math.max(it.w / c.img.naturalWidth, it.h / c.img.naturalHeight) * (it.zoom || 1);
      var ex = c.img.naturalWidth * s - it.w, ey = c.img.naturalHeight * s - it.h;
      it.ox = ex > 0.1 ? Math.max(-1, Math.min(1, (o.ox || 0) + dx * 2 / ex)) : 0;
      it.oy = ey > 0.1 ? Math.max(-1, Math.min(1, (o.oy || 0) + dy * 2 / ey)) : 0;
    }
  } else if (drag.mode === "rot") {
    var ang = Math.atan2(p.y - drag.cy, p.x - drag.cx) * 180 / Math.PI + 90;
    ang = ((ang % 360) + 360) % 360;
    [0, 90, 180, 270, 360].forEach(function(t){ if (Math.abs(ang - t) < 4) ang = t % 360; });
    it.rot = Math.round(ang);
  } else resize(drag, p);
  requestDraw(); drawGuides();
}
function resize(d, p){
  var it = d.it, o = d.o, k = d.mode;
  var sx = /e$/.test(k) ? 1 : /w$/.test(k) ? -1 : 0, sy = /^s/.test(k) ? 1 : /^n/.test(k) ? -1 : 0;
  var a = -(o.rot || 0) * Math.PI / 180, ddx = p.x - d.start.x, ddy = p.y - d.start.y;
  var lx = ddx * Math.cos(a) - ddy * Math.sin(a), ly = ddx * Math.sin(a) + ddy * Math.cos(a);
  var nw = Math.max(5, o.w + sx * lx), nh = Math.max(5, o.h + sy * ly);
  if (it.type === "text") {
    if (sy !== 0) { var f = nw / o.w; it.size = Math.max(6, Math.round(o.size * f * 10) / 10); }
    it.w = nw; layoutText(it); nh = it.h;
  } else if (it.type === "sticker" || it.type === "brand" || (sx !== 0 && sy !== 0 && e_shift)) {
    var f2 = Math.max(nw / o.w, nh / o.h); nw = o.w * f2; nh = o.h * f2; it.w = nw; it.h = nh;
  } else { it.w = nw; it.h = nh; }
  var dwl = (sx === 0 ? 0 : sx * (nw - o.w) / 2), dhl = it.type === "text" ? (nh - o.h) / 2 : (sy === 0 ? 0 : sy * (nh - o.h) / 2);
  var b = (o.rot || 0) * Math.PI / 180;
  var cx = o.x + o.w / 2 + dwl * Math.cos(b) - dhl * Math.sin(b), cy = o.y + o.h / 2 + dwl * Math.sin(b) + dhl * Math.cos(b);
  it.x = cx - nw / 2; it.y = cy - nh / 2;
}
var e_shift = false;
window.addEventListener("keydown", function(e){ e_shift = e.shiftKey; });
window.addEventListener("keyup", function(e){ e_shift = e.shiftKey; });
function onUp(){
  window.removeEventListener("pointermove", onMove);
  if (!drag) return;
  var it = drag.it, moved = drag.mode !== "move" || drag.moved;
  drag = null; guides = []; drawGuides();
  if (!moved) return;
  // מעבר לעמוד השני בכפולה כשהמרכז עבר את השדרה
  if (view !== 0 && sel) {
    var off = pgOffset(sel.pg), cx = off + it.x + it.w / 2, target = pageAt(cx);
    if (target != null && target !== sel.pg) {
      var from = pageObj(sel.pg).items, i = from.indexOf(it);
      from.splice(i, 1); it.x += off - pgOffset(target); pageObj(target).items.push(it);
      sel.pg = target; activePg = target;
    }
  }
  commit(); renderProps(); requestDraw();
}

// הצמדה לאמצע העמוד ולקווים
var guides = [];
function snapPos(pg, it, nx, ny){
  var off = pgOffset(pg), T = 1.6, lines = [];
  var ofPage = function(p){
    var o = pgOffset(p), w = pageW(p), h = pageH(p), b = p === "c" ? CBL : BL;
    if (p === "c") {
      [CBL + SAFE, (CBL + SPINE0) / 2, SPINE0 - SAFE, SPINE1 + SAFE, (SPINE1 + CW - CBL) / 2, CW - CBL - SAFE].forEach(function(x){ lines.push({ v: x }); });
    } else [b + SAFE, w / 2, w - b - SAFE].forEach(function(x){ lines.push({ v: o + x }); });
    [b + SAFE, h / 2, h - b - SAFE].forEach(function(y){ lines.push({ hz: y }); });
  };
  viewPages().forEach(ofPage);
  var bx = off + nx, w = it.w, h = it.h, outX = nx, outY = ny, gx = null, gy = null;
  [[0, 0], [w / 2, 1], [w, 2]].forEach(function(c){
    lines.forEach(function(l){ if (l.v != null && gx == null && Math.abs(bx + c[0] - l.v) < T) { outX = l.v - c[0] - off; gx = l.v; } });
  });
  [[0], [h / 2], [h]].forEach(function(c){
    lines.forEach(function(l){ if (l.hz != null && gy == null && Math.abs(ny + c[0] - l.hz) < T) { outY = l.hz - c[0]; gy = l.hz; } });
  });
  if (gx != null) guides.push({ x: gx }); if (gy != null) guides.push({ y: gy });
  return { x: outX, y: outY };
}
function drawGuides(){
  document.querySelectorAll(".guide").forEach(function(g){ g.remove(); });
  var ov = $("overlay");
  guides.forEach(function(g){
    var d = document.createElement("div"); d.className = "guide";
    if (g.x != null) { d.style.left = g.x * ppm + "px"; d.style.top = 0; d.style.width = "1px"; d.style.height = "100%"; }
    else { d.style.top = g.y * ppm + "px"; d.style.left = 0; d.style.height = "1px"; d.style.width = "100%"; }
    ov.appendChild(d);
  });
}

// ---------- עריכת טקסט במקום ----------
function startEdit(pg, it){
  if (it.type !== "text") return;
  editingId = it.id; sel = { pg: pg, id: it.id };
  var ta = document.createElement("textarea"); ta.id = "textEdit";
  var off = pgOffset(pg);
  ta.value = it.text; ta.dir = isRTL(it.text) ? "rtl" : "ltr";
  var place = function(){
    layoutText(it);
    ta.style.left = (off + it.x) * ppm + "px"; ta.style.top = it.y * ppm + "px";
    ta.style.width = it.w * ppm + "px"; ta.style.height = Math.max(it.h * ppm, 24) + "px";
    ta.style.font = fontStr(it, ppm); ta.style.lineHeight = (it.lh || 1.3) * it.size * PT * ppm + "px";
    ta.style.textAlign = it.align || "center"; ta.style.color = it.color === "#FFFFFF" ? "#33263D" : it.color;
  };
  place();
  ta.addEventListener("input", function(){ it.text = ta.value; ta.dir = isRTL(ta.value) ? "rtl" : "ltr"; delete it.hint; place(); });
  ta.addEventListener("keydown", function(e){ if (e.key === "Escape") { e.preventDefault(); finishEdit(); } e.stopPropagation(); });
  ta.addEventListener("blur", function(){ setTimeout(finishEdit, 0); });
  ta.addEventListener("pointerdown", function(e){ e.stopPropagation(); });
  $("wrap").appendChild(ta);
  ta.focus(); ta.select();
  requestDraw();
}
function finishEdit(){
  var ta = $("textEdit"); if (!editingId) return;
  editingId = null; if (ta) ta.remove();
  commit(); renderProps(); requestDraw();
}

// ---------- הוספת פריטים ----------
function targetPage(){
  var pgs = viewPages();
  if (pgs.indexOf(activePg) >= 0) return activePg;
  if (view === 0) return "c";
  var sp = spreadPages(view); return pageOn(sp.right) ? sp.right : sp.left;
}
function centerOf(pg){
  if (pg !== "c") return { x: PG / 2, y: PG / 2 };
  // בכריכה: באמצע הצד שבו העכבר היה לאחרונה (ברירת מחדל: כריכה קדמית)
  return { x: lastCoverSide === "back" ? (SPINE1 + CW - CBL) / 2 : (CBL + SPINE0) / 2, y: CH / 2 };
}
var lastCoverSide = "front";
function addItem(it){
  var pg = targetPage(), c = centerOf(pg);
  it.id = uid(); it.rot = 0;
  if (it.type === "text") layoutText(it);
  it.x = c.x - it.w / 2; it.y = c.y - it.h / 2;
  pageObj(pg).items.push(it);
  sel = { pg: pg, id: it.id }; panMode = false;
  commit(); renderProps(); requestDraw();
  return it;
}
function addText(isTitle){
  var it = addItem({ type: "text", w: isTitle ? 150 : 120, h: 20, size: isTitle ? 32 : 18, text: isTitle ? "כותרת" : "כתבו כאן את הטקסט שלכם",
    font: isTitle ? "Secular One" : "Varela Round", bold: false, color: isTitle ? "#C13671" : "#33263D", align: "center" });
  startEdit(sel.pg, it);
}
function pickPhoto(target){ replaceTarget = target || null; $("filePhoto").value = ""; $("filePhoto").click(); }
function onPhoto(file){
  if (!file) return;
  if (!/^image\//.test(file.type)) { toast("אפשר להעלות רק תמונות (JPG / PNG)"); return; }
  toast("מכינים את התמונה…");
  readImage(file).then(function(r){
    var id = uid();
    assets[id] = { blob: r.blob, w: r.w, h: r.h, url: URL.createObjectURL(r.blob) };
    return asPut(id, { blob: r.blob, w: r.w, h: r.h }).then(function(){ return { id: id, r: r }; });
  }).then(function(o){
    var src = "a:" + o.id, t = replaceTarget || (sel && selItem() && selItem().type === "img" ? sel : null);
    var it = t ? findItem(t.pg, t.id) : null;
    if (it) {
      it.src = src; it.ox = 0; it.oy = 0; it.zoom = 1; delete it.hint; delete it.fit;
      sel = { pg: t.pg, id: it.id };
      commit(); renderProps(); requestDraw();
    } else {
      var pg = targetPage(), maxW = pg === "c" ? 150 : 140, ratio = o.r.w / o.r.h;
      var w = ratio >= 1 ? maxW : maxW * ratio, h = w / ratio;
      addItem({ type: "img", w: w, h: h, src: src });
    }
    replaceTarget = null; hideToast();
  }).catch(function(){ toast("לא הצלחנו לפתוח את התמונה. נסו קובץ אחר."); });
}
function readImage(file){
  return new Promise(function(res, rej){
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function(){
      var MAX = 3600, w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1, MAX / Math.max(w, h));
      var c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
      var cx = c.getContext("2d"), png = /png|gif|webp/.test(file.type);
      if (!png) { cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height); }
      cx.drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(function(b){ b ? res({ blob: b, w: c.width, h: c.height }) : rej(); }, png ? "image/png" : "image/jpeg", 0.9);
    };
    im.onerror = function(){ URL.revokeObjectURL(url); rej(); };
    im.src = url;
  });
}
function addFrame(){ addItem({ type: "img", w: 120, h: 90, src: "", clip: "round", hint: "photo" }); }
function addSticker(code){ addItem({ type: "sticker", w: 30, h: 30, src: "stk:" + code }); }
function addShape(kind){
  if (kind === "band") {
    var pg = targetPage();
    var it = addItem({ type: "shape", shape: "rect", w: pageW(pg), h: 40, fill: "#FFFFFF", opacity: 0.8 });
    it.x = 0; commit(); requestDraw(); return;
  }
  addItem({ type: "shape", shape: kind, w: 60, h: 60, fill: "#FFE3F4", opacity: 1 });
}

// ---------- פעולות על הפריט הנבחר ----------
function delSel(){
  var it = selItem(); if (!it || it.locked) return;
  var arr = pageObj(sel.pg).items; arr.splice(arr.indexOf(it), 1);
  sel = null; commit(); renderProps(); requestDraw();
}
function dupSel(){
  var it = selItem(); if (!it || it.locked) return;
  var c = clone(it); c.id = uid(); c.x += 8; c.y += 8;
  var arr = pageObj(sel.pg).items; arr.splice(arr.indexOf(it) + 1, 0, c);
  sel = { pg: sel.pg, id: c.id }; commit(); renderProps(); requestDraw();
}
function layer(dir){
  var it = selItem(); if (!it) return;
  var arr = pageObj(sel.pg).items, i = arr.indexOf(it), j = dir === "top" ? arr.length - 1 : dir === "bottom" ? 0 : i + dir;
  if (j < 0 || j >= arr.length || j === i) return;
  arr.splice(i, 1); arr.splice(j, 0, it); commit(); requestDraw();
}
function fillPage(){
  var it = selItem(); if (!it) return;
  if (sel.pg === "c") { it.x = 0; it.y = 0; it.w = CW; it.h = CH; }
  else { it.x = 0; it.y = 0; it.w = PG; it.h = PG; }
  it.rot = 0; commit(); renderProps(); requestDraw();
}
function setProp(k, v, now){
  var it = selItem(); if (!it) return;
  it[k] = v;
  if (k === "text" || k === "src") delete it.hint;
  if (it.type === "text") {
    var cy = it.y + it.h / 2; layoutText(it); it.y = cy - it.h / 2;
  }
  requestDraw();
  clearTimeout(setProp.t); setProp.t = setTimeout(commit, now ? 0 : 350);
}

// ---------- לוח המאפיינים ----------
function swatchRow(list, cur, fn){
  var d = document.createElement("div"); d.className = "swatches";
  list.forEach(function(c){
    var b = document.createElement("button"); b.style.background = c; b.title = c;
    if (cur && cur.toLowerCase() === c.toLowerCase()) b.className = "on";
    b.onclick = function(){ fn(c); }; d.appendChild(b);
  });
  return d;
}
function row(label, el){ var r = document.createElement("div"); r.className = "prop-row"; if (label) { var l = document.createElement("label"); l.textContent = label; r.appendChild(l); } r.appendChild(el); return r; }
function btn(txt, fn, cls){ var b = document.createElement("button"); b.className = "tbtn " + (cls || ""); b.textContent = txt; b.onclick = fn; return b; }
function renderProps(){
  var box = $("props"); box.innerHTML = "";
  var it = selItem();
  if (!it || viewOf(sel.pg) !== view) {
    var pgs = viewPages(), names = view === 0 ? "הכריכה" : pgs.slice().sort(function(a, b){ return a - b; }).map(function(p){ return "עמוד " + p; }).join(" ו");
    box.innerHTML = '<h3>📄 ' + names + '</h3><div class="empty-props">' +
      '<b>איך עובדים?</b><ul class="help-list">' +
      '<li>לוחצים על תמונה או טקסט כדי לבחור</li>' +
      '<li>גוררים כדי להזיז, מושכים בעיגולים כדי להגדיל</li>' +
      '<li>לחיצה כפולה על טקסט – כותבים</li>' +
      '<li>לחיצה כפולה על תמונה – מחליפים</li>' +
      '<li>הקו הוורוד המקווקו = אזור בטוח לטקסט</li>' +
      '<li>האזור הלבהיר בקצוות ייחתך בהדפסה</li></ul>' +
      (view === 0 ? '<p>👈 <b>משמאל הכריכה הקדמית</b>, מימין הכריכה האחורית. בשדרה באמצע אסור לכתוב.</p>' : '') +
      '</div>';
    return;
  }
  var t = { text: "✏️ טקסט", img: "📷 תמונה", sticker: "⭐ מדבקה", shape: "🔷 צורה", brand: "BOOQLI" }[it.type];
  var h = document.createElement("h3"); h.textContent = t + " · " + pgLabel(sel.pg); box.appendChild(h);
  var bad = badPlacement(sel.pg, it);
  if (bad) { var w = document.createElement("div"); w.className = "lowres"; w.textContent = bad === "spine" ? "⚠️ אסור טקסט על השדרה. הזיזו לכריכה הקדמית או האחורית." : "⚠️ הטקסט קרוב מדי לקצה ועלול להיחתך. הזיזו אותו פנימה, אל תוך הקו הוורוד."; box.appendChild(w); }

  if (it.type === "text") {
    box.appendChild(btn("✏️ לכתוב / לשנות טקסט", function(){ startEdit(sel.pg, it); }, "wide"));
    var fs = document.createElement("select");
    FONTS.forEach(function(f){ var o = document.createElement("option"); o.value = f[0]; o.textContent = f[0] + " – " + f[1]; o.style.fontFamily = '"' + f[0] + '"'; if (f[0] === it.font) o.selected = true; fs.appendChild(o); });
    fs.style.fontFamily = '"' + it.font + '"';
    fs.onchange = function(){ document.fonts.load('400 20px "' + fs.value + '"', it.text).then(function(){ setProp("font", fs.value, true); renderProps(); }); };
    box.appendChild(row("גופן", fs));
    var sz = document.createElement("input"); sz.type = "range"; sz.min = 8; sz.max = 90; sz.value = it.size;
    var szn = document.createElement("input"); szn.type = "number"; szn.min = 6; szn.max = 150; szn.value = it.size; szn.style.maxWidth = "62px";
    sz.oninput = function(){ szn.value = sz.value; setProp("size", +sz.value); };
    szn.onchange = function(){ var v = Math.max(6, Math.min(150, +szn.value || 18)); sz.value = v; setProp("size", v); };
    var r = row("גודל", sz); r.appendChild(szn); box.appendChild(r);
    var al = document.createElement("div"); al.className = "seg";
    [["right", "ימין"], ["center", "מרכז"], ["left", "שמאל"]].forEach(function(a){ var b = document.createElement("button"); b.textContent = a[1]; if ((it.align || "center") === a[0]) b.className = "on"; b.onclick = function(){ setProp("align", a[0], true); renderProps(); }; al.appendChild(b); });
    box.appendChild(row("יישור", al));
    var st = document.createElement("div"); st.className = "seg";
    var bb = document.createElement("button"); bb.innerHTML = "<b>מודגש</b>"; if (it.bold) bb.className = "on"; bb.onclick = function(){ setProp("bold", !it.bold, true); renderProps(); };
    var ob = document.createElement("button"); ob.textContent = "קו מסביב"; if (it.stroke) ob.className = "on"; ob.title = "קו לבן סביב האותיות – קריא יותר על תמונות"; ob.onclick = function(){ setProp("stroke", !it.stroke, true); renderProps(); };
    st.appendChild(bb); st.appendChild(ob); box.appendChild(row("סגנון", st));
    var lh = document.createElement("input"); lh.type = "range"; lh.min = 0.9; lh.max = 2.2; lh.step = 0.05; lh.value = it.lh || 1.3;
    lh.oninput = function(){ setProp("lh", +lh.value); };
    box.appendChild(row("רווח שורות", lh));
    var col = document.createElement("input"); col.type = "color"; col.value = it.color || "#33263D"; col.oninput = function(){ setProp("color", col.value); };
    box.appendChild(row("צבע", col));
    box.appendChild(swatchRow(COLORS, it.color, function(c){ setProp("color", c, true); renderProps(); }));
    if (it.stroke) { var sc = document.createElement("input"); sc.type = "color"; sc.value = it.strokeColor || "#FFFFFF"; sc.oninput = function(){ setProp("strokeColor", sc.value); }; box.appendChild(row("צבע הקו", sc)); }
  } else if (it.type === "img") {
    box.appendChild(btn(it.src ? "🔄 החלפת תמונה" : "📷 העלאת תמונה", function(){ pickPhoto({ pg: sel.pg, id: it.id }); }, "wide"));
    if (it.src && it.fit !== "stretch") {
      var zr = document.createElement("input"); zr.type = "range"; zr.min = 1; zr.max = 3; zr.step = 0.02; zr.value = it.zoom || 1;
      zr.oninput = function(){ setProp("zoom", +zr.value); };
      box.appendChild(row("זום", zr));
      box.appendChild(btn(panMode ? "✅ סיימתי להזיז" : "✋ להזיז את התמונה בתוך המסגרת", function(){ panMode = !panMode; renderProps(); }, "wide"));
      if (panMode) { var pm = document.createElement("div"); pm.className = "empty-props"; pm.textContent = "גררו את התמונה כדי לבחור איזה חלק ממנה רואים."; box.appendChild(pm); }
    }
    var cl = document.createElement("div"); cl.className = "seg";
    [["rect", "ריבוע"], ["round", "מעוגל"], ["circle", "עיגול"]].forEach(function(a){ var b = document.createElement("button"); b.textContent = a[1]; if ((it.clip || "rect") === a[0]) b.className = "on"; b.onclick = function(){ setProp("clip", a[0], true); renderProps(); }; cl.appendChild(b); });
    box.appendChild(row("צורה", cl));
    var lr = lowRes(it, sel.pg);
    if (lr) { var lw = document.createElement("div"); lw.className = "lowres"; lw.textContent = "⚠️ התמונה קטנה לגודל הזה ועלולה לצאת מטושטשת בהדפסה. כדאי להקטין אותה או להעלות תמונה באיכות גבוהה יותר."; box.appendChild(lw); }
  } else if (it.type === "shape") {
    var fc = document.createElement("input"); fc.type = "color"; fc.value = it.fill || "#FFE3F4"; fc.oninput = function(){ setProp("fill", fc.value); };
    box.appendChild(row("צבע", fc));
    box.appendChild(swatchRow(COLORS.concat(BG_COLORS.slice(4, 12)), it.fill, function(c){ setProp("fill", c, true); renderProps(); }));
    var op = document.createElement("input"); op.type = "range"; op.min = 0.1; op.max = 1; op.step = 0.05; op.value = it.opacity == null ? 1 : it.opacity;
    op.oninput = function(){ setProp("opacity", +op.value); };
    box.appendChild(row("שקיפות", op));
  }
  var g = document.createElement("div"); g.className = "pbtns";
  if (it.type === "img" || it.type === "shape") g.appendChild(btn("🧲 מילוי כל " + (sel.pg === "c" ? "הכריכה" : "העמוד"), fillPage, "wide"));
  g.appendChild(btn("⬆️ קדימה", function(){ layer(1); }));
  g.appendChild(btn("⬇️ אחורה", function(){ layer(-1); }));
  g.appendChild(btn("⏫ הכי למעלה", function(){ layer("top"); }));
  g.appendChild(btn("⏬ לרקע", function(){ layer("bottom"); }));
  if (it.rot) g.appendChild(btn("↕️ ליישר (בלי סיבוב)", function(){ setProp("rot", 0, true); renderProps(); }, "wide"));
  g.appendChild(btn("📑 שכפול", dupSel));
  g.appendChild(btn("🗑️ מחיקה", delSel, "del"));
  box.appendChild(g);
}
function lowRes(it, pg){
  if (it.type !== "img" || !it.src || it.src.indexOf("sample/") === 0) return false;
  var s = imgSize(it.src); if (!s) return false;
  var k = it.fit === "stretch" ? it.w / s.w : Math.max(it.w / s.w, it.h / s.h) * (it.zoom || 1); // מ"מ לפיקסל
  return 25.4 / k < MIN_DPI;
}

// ---------- רקע ----------
var bgTarget = "both";
function renderBg(){
  var t = $("bgTargets"); t.innerHTML = "";
  var sp = view ? spreadPages(view) : null;
  var opts = view === 0 ? [["both", "כל הכריכה"]] : [["right", "ימין"], ["left", "שמאל"], ["both", "שניהם"]];
  if (sp && !pageOn(sp.left)) opts = [["right", "עמוד " + sp.right]];
  if (sp && !pageOn(sp.right)) opts = [["left", "עמוד " + sp.left]];
  if (!opts.some(function(o){ return o[0] === bgTarget; })) bgTarget = opts[opts.length - 1][0];
  var seg = document.createElement("div"); seg.className = "seg";
  opts.forEach(function(o){ var b = document.createElement("button"); b.textContent = o[1]; if (o[0] === bgTarget) b.className = "on"; b.onclick = function(){ bgTarget = o[0]; renderBg(); }; seg.appendChild(b); });
  t.appendChild(seg);
  var curPg = view === 0 ? "c" : (bgTarget === "left" ? sp.left : sp.right);
  var sw = $("bgSw"); sw.replaceWith(Object.assign(swatchRow(BG_COLORS, pageObj(pageOn(curPg) || curPg === "c" ? curPg : sp.left).bg, function(c){
    var pgs = view === 0 ? ["c"] : bgTarget === "both" ? viewPages() : [bgTarget === "left" ? sp.left : sp.right];
    pgs.forEach(function(p){ if (p === "c" || pageOn(p)) pageObj(p).bg = c; });
    commit(); requestDraw(); renderBg();
    if (pgs.some(function(p){ return pageObj(p).items.some(function(i){ return i.type === "img" && i.w >= pageW(p) - 1; }); })) toast("💡 יש תמונה שמכסה את כל העמוד, לכן הרקע מוסתר מאחוריה");
  }), { id: "bgSw" }));
}

// ---------- תוויות, מקרא, תמונות ממוזערות ----------
function renderLabels(){
  var l = $("labels"); l.style.direction = "ltr";
  if (view === 0) l.innerHTML = "<span>⬅️ כריכה קדמית</span><span>שדרה</span><span>כריכה אחורית ➡️</span>";
  else {
    var sp = spreadPages(view);
    l.innerHTML = "<span>" + (pageOn(sp.left) ? "עמוד " + sp.left : "פנים הכריכה האחורית") + "</span><span>" + (pageOn(sp.right) ? "עמוד " + sp.right : "פנים הכריכה") + "</span>";
  }
  $("legend").innerHTML = '<i style="border-top:2px solid #E53935"></i>קו החיתוך · <i style="border-top:2px dashed #FF56C2"></i>אזור בטוח לטקסט (1 ס"מ)<br>האזור הבהיר בקצוות ייחתך – תמונות רקע כן צריכות להגיע עד אליו';
  $("prevSp").disabled = view === 0; $("nextSp").disabled = view === NSPREADS;
}
var thumbT = null;
function thumbSoon(){ clearTimeout(thumbT); thumbT = setTimeout(function(){ renderThumb(view); }, 400); }
var allThumbT = null;
function allThumbsSoon(){ clearTimeout(allThumbT); allThumbT = setTimeout(function(){ for (var i = 0; i <= NSPREADS; i++) renderThumb(i); }, 300); }
function buildThumbs(){
  var box = $("thumbs"); box.innerHTML = "";
  for (var v = 0; v <= NSPREADS; v++) (function(v){
    var b = document.createElement("button"); b.className = "th" + (v === view ? " on" : ""); b.dataset.v = v;
    var c = document.createElement("canvas"); b.appendChild(c);
    var sp = v ? spreadPages(v) : null;
    var lab = v === 0 ? "כריכה" : !pageOn(sp.right) ? "עמ' " + sp.left : !pageOn(sp.left) ? "עמ' " + sp.right : "עמ' " + sp.right + "–" + sp.left;
    b.appendChild(document.createTextNode(lab));
    b.onclick = function(){ go(v); };
    box.appendChild(b);
  })(v);
  for (var i = 0; i <= NSPREADS; i++) renderThumb(i);
}
function renderThumb(v){
  var b = document.querySelector('.th[data-v="' + v + '"]'); if (!b) return;
  var c = b.querySelector("canvas"), save = view; view = v;
  var W = viewW(), H = viewH(), k = 112 / W, dpr = window.devicePixelRatio || 1;
  c.width = Math.round(W * k * dpr); c.height = Math.round(H * k * dpr); c.style.width = W * k + "px"; c.style.height = H * k + "px";
  var ctx = c.getContext("2d"); ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
  drawView(ctx, v, { guides: false });
  view = save;
}
function go(v){
  if (editingId) finishEdit();
  view = Math.max(0, Math.min(NSPREADS, v)); sel = null; panMode = false;
  activePg = targetPageDefault();
  document.querySelectorAll(".th").forEach(function(t){ t.classList.toggle("on", +t.dataset.v === view); });
  var cur = document.querySelector(".th.on"); if (cur) cur.scrollIntoView({ inline: "center", block: "nearest" });
  refreshAll();
}
function targetPageDefault(){ if (view === 0) return "c"; var sp = spreadPages(view); return pageOn(sp.right) ? sp.right : sp.left; }
function refreshAll(){ renderLabels(); renderProps(); renderBg(); fit(); }

// ---------- מדבקות ----------
function renderStickers(){
  var S = window.BOOK_STICKERS, groups = Object.keys(S);
  if (!stkGroup) stkGroup = groups[0];
  $("stkTabs").innerHTML = groups.map(function(g){ return '<button data-g="' + esc(g) + '" class="' + (g === stkGroup ? "on" : "") + '">' + esc(g) + "</button>"; }).join("");
  $("stk").innerHTML = S[stkGroup].map(function(c){ return '<button data-c="' + c + '" title="הוספת מדבקה"><img src="' + abs("stickers/" + c + ".svg") + '" alt="" loading="lazy"></button>'; }).join("");
}

// ---------- חלונות והודעות ----------
function modal(html, opts){
  var root = $("modalRoot");
  root.innerHTML = '<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true">' + html + "</div></div>";
  var bg = root.firstChild;
  if (!(opts && opts.sticky)) bg.addEventListener("click", function(e){ if (e.target === bg) closeModal(); });
  return bg.firstChild;
}
function closeModal(){ $("modalRoot").innerHTML = ""; }
var toastT = null;
function toast(msg, act){
  hideToast();
  var t = document.createElement("div"); t.className = "toast"; t.id = "toast";
  t.innerHTML = "<span>" + msg + "</span>";
  if (act) { var b = document.createElement("button"); b.textContent = act[0]; b.onclick = function(){ hideToast(); act[1](); }; t.appendChild(b); }
  var x = document.createElement("button"); x.textContent = "✕"; x.style.background = "transparent"; x.onclick = hideToast; t.appendChild(x);
  document.body.appendChild(t);
  toastT = setTimeout(hideToast, act ? 12000 : 4000);
}
function hideToast(){ clearTimeout(toastT); var t = $("toast"); if (t) t.remove(); }

var SAVE_HELP =
  '<h2>📌 לפני שמתחילים: איך הספר שלכם נשמר</h2>' +
  '<p>כל שינוי נשמר אוטומטית בדפדפן, <b>במחשב הזה</b>. אפשר לסגור ולחזור מתי שרוצים, מאותו מחשב ואותו דפדפן.</p>' +
  '<div class="warn"><b>שימו לב, הספר יימחק אם:</b><ul>' +
  '<li>מנקים את היסטוריית הגלישה בדפדפן</li><li>עובדים בחלון גלישה בסתר</li>' +
  '<li>עוברים למחשב אחר או לדפדפן אחר (שם הספר פשוט לא יופיע)</li></ul></div>' +
  '<div class="box"><b>💾 כדי לא לאבד את העבודה:</b> לחצו מדי פעם על "שמירת גיבוי" (למעלה). יורד למחשב קובץ אחד עם כל הספר. כדי להמשיך, גם ממחשב אחר, לוחצים "פתיחת גיבוי" ובוחרים את הקובץ.</div>' +
  '<p>🔒 התמונות והטקסטים נשארים רק אצלכם. אנחנו לא רואים ולא שומרים כלום, עד שתשלחו לנו את הקבצים להדפסה.</p>';
function showSaveHelp(after){
  var m = modal(SAVE_HELP + '<label style="display:flex;gap:8px;align-items:center;font-size:15px;margin-top:6px"><input type="checkbox" id="noMore"> לא להציג שוב במחשב הזה</label><div class="row"><button class="big-btn" id="okHelp">הבנתי, בואו נתחיל ←</button></div>', { sticky: true });
  m.querySelector("#okHelp").onclick = function(){
    if (m.querySelector("#noMore").checked) try { localStorage.setItem("booqli_book_help", "1"); } catch (e) {}
    closeModal(); if (after) after();
  };
}
function showHelp(){
  var m = modal('<h2>❓ עזרה</h2><ul>' +
    '<li><b>בחירה:</b> לוחצים על תמונה, טקסט או מדבקה.</li>' +
    '<li><b>הזזה:</b> גוררים. <b>הגדלה:</b> מושכים בעיגולים הלבנים בפינות. <b>סיבוב:</b> העיגול הסגול למעלה.</li>' +
    '<li><b>טקסט:</b> לחיצה כפולה כדי לכתוב. גופן, גודל וצבע – בצד שמאל.</li>' +
    '<li><b>תמונה:</b> לחיצה כפולה כדי להחליף. "זום" ו"להזיז בתוך המסגרת" בצד שמאל.</li>' +
    '<li><b>מעבר בין עמודים:</b> בפס למטה, או בחיצים.</li>' +
    '<li><b>קיצורים:</b> Delete מחיקה · Ctrl+Z ביטול · Ctrl+D שכפול · חיצים להזזה עדינה.</li>' +
    '<li><b>קווים בעמוד:</b> האדום = איפה שהדף ייחתך. הוורוד המקווקו = אזור בטוח לטקסט. תמונות רקע כן צריכות להגיע עד הקצה.</li>' +
    '<li><b>כריכה:</b> משמאל הכריכה הקדמית, מימין האחורית. על השדרה באמצע אסור לכתוב.</li></ul>' +
    '<div class="box">💬 צריכים עזרה? <a target="_blank" rel="noopener" href="' + waLink("היי BOOQLI, אני מעצבת ספר באתר ויש לי שאלה:") + '">כתבו לנו בוואטסאפ</a></div>' +
    '<div class="row"><button class="big-btn alt" id="sh">📌 איך הספר נשמר?</button><button class="big-btn" id="cl">סגירה</button></div>');
  m.querySelector("#cl").onclick = closeModal;
  m.querySelector("#sh").onclick = function(){ showSaveHelp(); };
}
function waLink(t){ return "https://wa.me/" + ((window.SITE && SITE.phone) || "972555549331") + "?text=" + encodeURIComponent(t); }

// ---------- גיבוי ----------
function blobToData(b){ return new Promise(function(res){ var r = new FileReader(); r.onload = function(){ res(r.result); }; r.readAsDataURL(b); }); }
function usedAssets(){
  var ids = {};
  var scan = function(items){ items.forEach(function(i){ if (i.src && i.src.indexOf("a:") === 0) ids[i.src.slice(2)] = 1; }); };
  scan(P.cover.items); for (var k in P.pages) scan(P.pages[k].items);
  return Object.keys(ids);
}
function safeName(){ return (P.title || "הספר שלי").replace(/[\\/:*?"<>|]+/g, "").trim() || "הספר שלי"; }
function download(blob, name){
  var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 60000);
}
function saveBackup(){
  if (editingId) finishEdit();
  toast("מכינים קובץ גיבוי…");
  var ids = usedAssets(), out = { app: "booqli-book", v: 1, saved: new Date().toISOString(), project: P, assets: {} };
  Promise.all(ids.map(function(id){ var a = assets[id]; return a ? blobToData(a.blob).then(function(d){ out.assets[id] = { data: d, w: a.w, h: a.h }; }) : null; }))
    .then(function(){
      download(new Blob([JSON.stringify(out)], { type: "application/json" }), safeName() + ".booqli");
      lastBackup = Date.now(); editsSinceBackup = 0;
      toast("💾 הקובץ ירד למחשב (בתיקיית ההורדות). שמרו אותו במקום בטוח.");
      ev("book", "backup");
    });
}
function openBackup(file){
  if (!file) return;
  var r = new FileReader();
  r.onload = function(){
    var o; try { o = JSON.parse(r.result); } catch (e) { o = null; }
    if (!o || o.app !== "booqli-book" || !o.project) { toast("זה לא קובץ גיבוי של ספר BOOQLI 🙁"); return; }
    var go2 = function(){
      asClear().then(function(){
        return Promise.all(Object.keys(o.assets || {}).map(function(id){
          return fetch(o.assets[id].data).then(function(x){ return x.blob(); }).then(function(b){ return asPut(id, { blob: b, w: o.assets[id].w, h: o.assets[id].h }); });
        }));
      }).then(loadAssetsFromDB).then(function(){
        P = o.project; ensureBrand(); lastBackup = Date.now(); editsSinceBackup = 0;
        return saveNow();
      }).then(function(){ openEditor(false); toast("📂 הספר נפתח מהגיבוי"); ev("book", "open-backup"); });
    };
    if (P && $("ed").classList.contains("hidden") === false) confirmBox("לפתוח את הגיבוי במקום הספר שפתוח עכשיו?", "הספר הנוכחי יוחלף. אם לא שמרתם ממנו גיבוי – כדאי לשמור קודם.", go2);
    else go2();
  };
  r.readAsText(file);
}
function confirmBox(title, text, yes){
  var m = modal("<h2>" + title + "</h2><p>" + text + '</p><div class="row"><button class="big-btn" id="y">כן, להמשיך</button><button class="big-btn alt" id="n">ביטול</button></div>');
  m.querySelector("#y").onclick = function(){ closeModal(); yes(); };
  m.querySelector("#n").onclick = closeModal;
}

// ---------- בדיקה לפני הדפסה ----------
function checkBook(){
  var errs = [], warns = [];
  var all = [["c", P.cover]].concat(Object.keys(P.pages).map(function(k){ return [+k, P.pages[k]]; }));
  all.forEach(function(e){
    var pg = e[0], name = pgLabel(pg);
    e[1].items.forEach(function(it){
      if (it.type === "img" && !it.src) warns.push(name + ": יש מסגרת תמונה ריקה (לא תודפס).");
      if (it.type === "text" && /שם ארוך מאוד|___|כתבו כאן|כאן כותבים/.test(it.text)) errs.push(name + ": עוד לא החלפתם את הטקסט לדוגמה (\"" + it.text.split("\n")[0].slice(0, 30) + "…\").");
      else if (it.hint === "text") warns.push(name + ": טקסט לדוגמה שעוד לא שיניתם.");
      var bad = badPlacement(pg, it);
      if (bad === "spine") errs.push(name + ": יש טקסט על השדרה – אסור.");
      else if (bad === "edge") errs.push(name + ": טקסט קרוב מדי לקצה ועלול להיחתך.");
      if (lowRes(it, pg)) warns.push(name + ": תמונה באיכות נמוכה לגודל שלה – עלולה לצאת מטושטשת.");
    });
  });
  var emptyPgs = Object.keys(P.pages).filter(function(k){ var p = P.pages[k]; return !p.items.length && (p.bg || "#FFFFFF").toUpperCase() === "#FFFFFF"; });
  if (emptyPgs.length) warns.push("עמודים ריקים לגמרי: " + emptyPgs.join(", ") + " (יודפסו לבנים).");
  return { errs: uniq(errs), warns: uniq(warns) };
}
function uniq(a){ return a.filter(function(x, i){ return a.indexOf(x) === i; }); }
function list(a){ return "<ul>" + a.slice(0, 12).map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + (a.length > 12 ? "<li>ועוד " + (a.length - 12) + "…</li>" : "") + "</ul>"; }
function onDone(){
  if (editingId) finishEdit();
  saveNow();
  var c = checkBook(), html = "<h2>✅ בדיקה אחרונה לפני הדפסה</h2>";
  if (!c.errs.length && !c.warns.length) html += '<div class="ok">🎉 הכל נראה מעולה! אפשר ליצור את קבצי ההדפסה.</div>';
  if (c.errs.length) html += '<div class="warn"><b>❗ כדאי לתקן לפני ששולחים:</b>' + list(c.errs) + "</div>";
  if (c.warns.length) html += '<div class="box"><b>💡 לתשומת לבכם (אפשר להמשיך):</b>' + list(c.warns) + "</div>";
  html += "<p>ייווצרו <b>שני קבצי PDF</b> להדפסה: קובץ כריכה וקובץ 24 עמודים. זה לוקח כחצי דקה.</p>" +
    '<div class="row"><button class="big-btn" id="mk">📄 ליצור את קבצי ההדפסה</button><button class="big-btn alt" id="bk">חזרה לתיקונים</button></div>';
  var m = modal(html);
  m.querySelector("#bk").onclick = closeModal;
  m.querySelector("#mk").onclick = makePrint;
}

// ---------- קבצי הדפסה ----------
function pxFor(mm){ return Math.round(mm / 25.4 * DPI); }
function renderToJpeg(pg){
  var w = pageW(pg), h = pageH(pg), c = document.createElement("canvas");
  c.width = pxFor(w); c.height = pxFor(h);
  var ctx = c.getContext("2d"); ctx.setTransform(c.width / w, 0, 0, c.height / h, 0, 0);
  drawPage(ctx, pg, { print: true });
  var d = c.toDataURL("image/jpeg", 0.92); c.width = c.height = 1;
  return d;
}
function loadFontsFor(items){
  return Promise.all(items.filter(function(i){ return i.type === "text"; }).map(function(i){
    return document.fonts.load((i.bold ? "700 " : "400 ") + '40px "' + i.font + '"', i.text || "א").catch(function(){});
  }));
}
var printFiles = null;
function makePrint(){
  var m = modal('<h2>📄 יוצרים את קבצי ההדפסה…</h2><p id="pgTxt">מכינים…</p><div class="bar"><i id="pgBar"></i></div><p style="font-size:14px;color:#6b5a72">אל תסגרו את החלון. זה לוקח כחצי דקה.</p>', { sticky: true });
  var all = [P.cover].concat(Object.keys(P.pages).map(function(k){ return P.pages[k]; })), items = [];
  all.forEach(function(p){ items = items.concat(p.items); });
  var J = window.jspdf && window.jspdf.jsPDF;
  if (!J) { m.innerHTML = "<h2>אופס</h2><p>לא הצלחנו לטעון את כלי ההדפסה. בדקו את החיבור לאינטרנט ונסו שוב.</p>"; return; }
  var step = function(i, n, txt){ $("pgBar").style.width = Math.round(i / n * 100) + "%"; $("pgTxt").textContent = txt; };
  var tick = function(){ return new Promise(function(r){ setTimeout(r, 20); }); };
  Promise.all([loadFontsFor(items), waitImages(items)]).then(function(){
    step(0, 26, "הכריכה…");
    return tick();
  }).then(function(){
    var cov = new J({ orientation: "landscape", unit: "mm", format: [CW, CH], compress: true });
    cov.addImage(renderToJpeg("c"), "JPEG", 0, 0, CW, CH);
    var cover = cov.output("blob");
    var doc = new J({ orientation: "portrait", unit: "mm", format: [PG, PG], compress: true });
    var i = 1;
    return new Promise(function(res){
      (function next(){
        if (i > NPAGES) { res({ cover: cover, pages: doc.output("blob") }); return; }
        step(i + 1, 26, "עמוד " + i + " מתוך " + NPAGES + "…");
        setTimeout(function(){
          if (i > 1) doc.addPage([PG, PG], "portrait");
          doc.addImage(renderToJpeg(i), "JPEG", 0, 0, PG, PG);
          i++; next();
        }, 10);
      })();
    });
  }).then(function(f){
    step(26, 26, "מוכן!");
    printFiles = { cover: new File([f.cover], safeName() + " - כריכה.pdf", { type: "application/pdf" }), pages: new File([f.pages], safeName() + " - עמודים.pdf", { type: "application/pdf" }) };
    ev("book", "export");
    showSend();
  }).catch(function(err){
    m.innerHTML = '<h2>אופס, משהו השתבש</h2><p>לא הצלחנו ליצור את הקבצים. נסו שוב, ואם זה חוזר – כתבו לנו בוואטסאפ.</p><div class="row"><button class="big-btn" onclick="document.getElementById(\'modalRoot\').innerHTML=\'\'">סגירה</button></div>';
    try { console.error(err); } catch (e) {}
  });
}
function showSend(){
  var msg = "היי BOOQLI 👋\nעיצבתי ספר באתר booqli Games ואשמח להצעת מחיר להדפסה בכריכה קשה.\n📖 שם הספר: " + (P.title || "") + "\n📄 24 עמודים, 20×20 ס\"מ\nמצרפ/ת 2 קבצים: כריכה ועמודים.";
  var canShare = false;
  try { canShare = !!(navigator.canShare && navigator.canShare({ files: [printFiles.cover, printFiles.pages] })); } catch (e) {}
  var mb = function(f){ return (f.size / 1048576).toFixed(1) + " MB"; };
  var m = modal('<h2>🎉 הקבצים מוכנים!</h2>' +
    '<p>נשאר לשלוח לנו אותם בוואטסאפ, ונחזור אליכם עם הצעת מחיר.</p>' +
    '<div class="box"><b>שלב 1 – הורדת שני הקבצים:</b><div class="row" style="margin-top:8px">' +
    '<button class="big-btn green" id="dlC">⬇️ קובץ הכריכה (' + mb(printFiles.cover) + ')</button>' +
    '<button class="big-btn green" id="dlP">⬇️ קובץ העמודים (' + mb(printFiles.pages) + ')</button></div></div>' +
    '<div class="box"><b>שלב 2 – שליחה בוואטסאפ:</b><div class="row" style="margin-top:8px">' +
    '<a class="big-btn" id="wa" target="_blank" rel="noopener" style="text-decoration:none;background:#1FA855;box-shadow:0 3px 0 #13773A">💬 פתיחת וואטסאפ ל-BOOQLI</a>' +
    (canShare ? '<button class="big-btn alt" id="shr">📤 שיתוף ישיר של הקבצים</button>' : "") + "</div>" +
    '<p style="margin:10px 0 0">בשיחה שתיפתח: לוחצים על 📎 ← <b>מסמך</b> ← בוחרים את שני הקבצים מתיקיית ההורדות. חשוב לשלוח כ<b>מסמך</b> ולא כתמונה, כדי לשמור על איכות ההדפסה.</p></div>' +
    '<p style="font-size:14.5px;color:#6b5a72">💾 טיפ: שמרו גם קובץ גיבוי של הספר, למקרה שתרצו לתקן משהו אחר כך.</p>' +
    '<div class="row"><button class="big-btn alt" id="bk2">💾 שמירת גיבוי</button><button class="big-btn alt" id="cl2">חזרה לספר</button></div>');
  m.querySelector("#dlC").onclick = function(){ download(printFiles.cover, printFiles.cover.name); this.textContent = "✓ הכריכה ירדה"; };
  m.querySelector("#dlP").onclick = function(){ download(printFiles.pages, printFiles.pages.name); this.textContent = "✓ העמודים ירדו"; };
  var wa = m.querySelector("#wa"); wa.href = waLink(msg); wa.onclick = function(){ ev("book", "whatsapp"); };
  if (canShare) m.querySelector("#shr").onclick = function(){ navigator.share({ files: [printFiles.cover, printFiles.pages], text: msg }).then(function(){ ev("book", "share"); }).catch(function(){}); };
  m.querySelector("#bk2").onclick = saveBackup;
  m.querySelector("#cl2").onclick = closeModal;
}

// ---------- פתיחה / סגירה של העורך ----------
var built = false;
function openEditor(fresh){
  hist = []; fut = []; lastSnap = snap(); updUndo();
  view = 0; sel = null; activePg = "c";
  $("title").value = P.title || "";
  $("intro").classList.add("hidden"); $("ed").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  if (!built) { built = true; renderStickers(); }
  // מחשבים גובה לכל הטקסטים אחרי שהגופנים נטענו
  var items = [].concat(P.cover.items); for (var k in P.pages) items = items.concat(P.pages[k].items);
  loadFontsFor(items).then(function(){ items.forEach(function(i){ if (i.type === "text") layoutText(i); }); buildThumbs(); refreshAll(); });
  buildThumbs(); refreshAll();
  var skipHelp = false; try { skipHelp = localStorage.getItem("booqli_book_help") === "1"; } catch (e) {}
  if (!skipHelp) showSaveHelp();
}
function exitEditor(){
  if (editingId) finishEdit();
  saveNow().then(function(){
    $("ed").classList.add("hidden"); $("intro").classList.remove("hidden");
    document.body.style.overflow = ""; closeModal(); checkResume();
  });
}
function start(kind){
  var go3 = function(){
    asClear().then(function(){
      Object.keys(assets).forEach(function(k){ URL.revokeObjectURL(assets[k].url); }); assets = {};
      P = kind === "sample" ? newSample() : newBlank(); lastBackup = Date.now(); editsSinceBackup = 0;
      return saveNow();
    }).then(function(){ ev("book", "start-" + kind); openEditor(true); });
  };
  kvGet("project").then(function(old){
    if (old) confirmBox("להתחיל ספר חדש?", "כבר יש ספר שמור במחשב הזה (\"" + esc(old.title || "") + "\"). ספר חדש יחליף אותו. אם אתם רוצים לשמור אותו – פתחו אותו קודם ולחצו \"שמירת גיבוי\".", go3);
    else go3();
  }).catch(go3);
}
function checkResume(){
  kvGet("project").then(function(p){
    if (!p) { $("resumeBox").classList.add("hidden"); return; }
    $("resumeName").textContent = "\"" + (p.title || "הספר שלי") + "\"";
    $("resumeWhen").textContent = p.updated ? "(עודכן " + new Date(p.updated).toLocaleDateString("he-IL") + ")" : "";
    $("resumeBox").classList.remove("hidden");
  }).catch(function(){
    $("resumeBox").classList.add("hidden");
  });
}
function resume(){
  kvGet("project").then(function(p){
    if (!p) return;
    P = p; ensureBrand();
    return loadAssetsFromDB().then(function(){ openEditor(false); });
  });
}

// ---------- חיבור הכפתורים ----------
function init(){
  // טלפון: קישור לשלוח לעצמי
  var self = $("sendSelf"); if (self) self.href = "https://wa.me/?text=" + encodeURIComponent("📖 לעצב ספר בכריכה קשה במחשב: https://games.booqli.ai/book-maker/");
  $("btnSample").onclick = function(){ start("sample"); };
  $("btnBlank").onclick = function(){ start("blank"); };
  $("btnOpen").onclick = $("btnOpen2").onclick = function(){ $("fileBackup").value = ""; $("fileBackup").click(); };
  $("fileBackup").onchange = function(){ openBackup(this.files[0]); };
  $("filePhoto").onchange = function(){ onPhoto(this.files[0]); };
  $("btnResume").onclick = resume;
  $("btnBackup").onclick = saveBackup;
  $("btnHelp").onclick = showHelp;
  $("btnExit").onclick = exitEditor;
  $("btnDone").onclick = onDone;
  $("undo").onclick = undo; $("redo").onclick = redo;
  $("title").oninput = function(){ P.title = this.value; clearTimeout(this.t); this.t = setTimeout(commit, 500); };
  $("addTitle").onclick = function(){ addText(true); };
  $("addText").onclick = function(){ addText(false); };
  $("addPhoto").onclick = function(){ pickPhoto(null); };
  $("addFrame").onclick = addFrame;
  document.querySelectorAll("[data-shape]").forEach(function(b){ b.onclick = function(){ addShape(b.dataset.shape); }; });
  $("stkTabs").onclick = function(e){ var g = e.target.dataset.g; if (g) { stkGroup = g; renderStickers(); } };
  $("stk").onclick = function(e){ var b = e.target.closest("button"); if (b) addSticker(b.dataset.c); };
  $("prevSp").onclick = function(){ go(view - 1); };
  $("nextSp").onclick = function(){ go(view + 1); };
  $("zIn").onclick = function(){ zoom = Math.min(2.5, zoom + 0.25); fit(); };
  $("zOut").onclick = function(){ zoom = Math.max(0.5, zoom - 0.25); fit(); };
  var wrap = $("wrap");
  wrap.addEventListener("pointerdown", onDown);
  wrap.addEventListener("pointermove", function(e){ if (view === 0 && !drag) { var p = evPos(e); lastCoverSide = p.x > (SPINE0 + SPINE1) / 2 ? "back" : "front"; } });
  wrap.addEventListener("dblclick", function(e){
    var p = evPos(e), h = hit(p.x, p.y); if (!h || h.it.locked) return;
    if (h.it.type === "text") startEdit(h.pg, h.it);
    else if (h.it.type === "img") pickPhoto({ pg: h.pg, id: h.it.id });
  });
  window.addEventListener("resize", function(){ if (P && !$("ed").classList.contains("hidden")) fit(); });
  document.addEventListener("keydown", function(e){
    if ($("ed").classList.contains("hidden") || $("modalRoot").innerHTML) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    var k = e.key, ctrl = e.ctrlKey || e.metaKey, it = selItem();
    if (ctrl && (k === "z" || k === "Z" || k === "ז")) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (ctrl && (k === "y" || k === "ט")) { e.preventDefault(); redo(); return; }
    if (ctrl && (k === "d" || k === "ג")) { e.preventDefault(); dupSel(); return; }
    if (k === "Escape") { sel = null; panMode = false; renderProps(); requestDraw(); return; }
    if (!it || it.locked) {
      if (k === "PageDown") go(view + 1); if (k === "PageUp") go(view - 1);
      return;
    }
    if (k === "Delete" || k === "Backspace") { e.preventDefault(); delSel(); return; }
    if (k === "Enter" && it.type === "text") { e.preventDefault(); startEdit(sel.pg, it); return; }
    var st = e.shiftKey ? 5 : 1, mv = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[k];
    if (mv) { e.preventDefault(); it.x += mv[0]; it.y += mv[1]; requestDraw(); clearTimeout(init.t); init.t = setTimeout(commit, 400); }
  });
  window.addEventListener("beforeunload", function(){ if (dirty) saveNow(); });
  // תזכורת גיבוי
  setInterval(function(){
    if (!P || $("ed").classList.contains("hidden")) return;
    if (editsSinceBackup > 15 && Date.now() - lastBackup > 20 * 60000) { lastBackup = Date.now() - 10 * 60000; toast("💾 עבדתם הרבה – כדאי לשמור גיבוי", ["שמירת גיבוי", saveBackup]); }
  }, 60000);
  if (!window.indexedDB) toast("הדפדפן הזה לא שומר את הספר. השתמשו בכרום או אדג', ושמרו גיבוי.");
  checkResume();
  ev("book", "page");
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
// לבדיקות
window.__book = { get P(){ return P; }, go: go, check: checkBook, layoutText: layoutText };
})();
