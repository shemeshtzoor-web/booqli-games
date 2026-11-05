/* =====================================================================
   מנפישים את הציור שלי – המנוע (2.11.2026)
   הכל רץ בדפדפן, בלי שירות חיצוני:
   1. ניקוי הדף: מיישרים את התאורה של הצילום, מוצאים את הקווים והצבעים,
      ממלאים את מה שבתוך הקו הסגור, ומשאירים רק את הדמות.
   2. מראה מגניב: מדבקה / קומיקס / קסם / כמו שצייר (מסגרת, צבעים חזקים, צל).
   3. הנפשה: רשת גמישה (WebGL) – כל תנועה מכופפת ומזיזה את הציור. 12 תנועות, 6 רקעים.
   4. דיבור: זיהוי דיבור של הדפדפן (he-IL) + כתיבה + כפתורים. מילות מפתח → תנועות ורקע.
   5. סרטון: MediaRecorder מהקנבס + מוזיקה מקורית מ-Web Audio. mp4 כשאפשר.
   ===================================================================== */
(function(){
"use strict";
const $ = id => document.getElementById(id);
const W = 720, H = 900;            /* הבמה והסרטון: 4:5 */
const ACT_DUR = 3.6, INTRO = 1.3, OUTRO = 2.2;
const mk = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const TAU = Math.PI * 2;
const ev = (k, n) => { try { siteEvent(k, n); } catch(e) {} };
const kidLock = () => { try { return !!siteKidLock(); } catch(e) { return false; } };

/* ---------- קול ---------- */
let voice = null;
const loadVoice = () => { try { voice = speechSynthesis.getVoices().find(v => /^(he|iw)/i.test(v.lang)) || null; } catch(e) {} };
try { loadVoice(); speechSynthesis.onvoiceschanged = loadVoice; } catch(e) {}
const say = t => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "he-IL"; u.rate = .9; if (voice) u.voice = voice; speechSynthesis.speak(u); } catch(e) {} };
const SAY = {
  hi: "מְצַיְּרִים צִיּוּר, מְצַלְּמִים אוֹתוֹ, וְהַצִּיּוּר מִתְעוֹרֵר לַחַיִּים! אַחַר כָּךְ אוֹמְרִים לוֹ מָה לַעֲשׂוֹת, וְעוֹשִׂים סֶרֶט.",
  s1: "מָה מְנַפִּישִׁים? מְצַלְּמִים צִיּוּר עַל דַּף, בּוֹחֲרִים תְּמוּנָה, אוֹ מְצַיְּרִים כָּאן בַּמָּסָךְ.",
  pad: "מְצַיְּרִים דְּמוּת אַחַת גְּדוֹלָה, עִם קַו מִסָּבִיב. כְּשֶׁגּוֹמְרִים, לוֹחֲצִים סִיַּמְתִּי.",
  crop: "גּוֹרְרִים אֶת הַמִּסְגֶּרֶת הַוְּרֻדָּה מִסָּבִיב לַצִּיּוּר, וְלוֹחֲצִים זֶה הַצִּיּוּר.",
  main: "הַצִּיּוּר הִתְעוֹרֵר! בּוֹחֲרִים אֵיךְ הוּא נִרְאֶה: מַדְבֵּקָה, קוֹמִיקְס אוֹ קֶסֶם.",
  what: "לוֹחֲצִים עַל הַמִּיקְרוֹפוֹן וְאוֹמְרִים מָה הוּא יַעֲשֶׂה. לְמָשָׁל: שֶׁיִּקְפֹּץ, שֶׁיִּרְקֹד, שֶׁיָּעוּף בֶּחָלָל. אוֹ לוֹחֲצִים עַל הַתְּמוּנוֹת.",
  res: "הַסֶּרֶט מוּכָן! אֶפְשָׁר לִשְׁמֹר אוֹתוֹ בַּטֶּלֶפוֹן אוֹ לִשְׁלֹחַ בְּוָואטְסְאַפּ."
};

/* =====================================================================
   1. ניקוי הדף והוצאת הדמות
   ===================================================================== */
/* מרחק (chamfer 3-4) מהפיקסלים שבתוך המסכה. מחזיר מרחק בפיקסלים בקירוב */
function distField(inside, w, h){
  const INF = 1e9, d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = inside[i] ? 0 : INF;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; let v = d[i]; if (!v) continue;
    if (x > 0) v = Math.min(v, d[i - 1] + 3);
    if (y > 0) { v = Math.min(v, d[i - w] + 3); if (x > 0) v = Math.min(v, d[i - w - 1] + 4); if (x < w - 1) v = Math.min(v, d[i - w + 1] + 4); }
    d[i] = v;
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x; let v = d[i]; if (!v) continue;
    if (x < w - 1) v = Math.min(v, d[i + 1] + 3);
    if (y < h - 1) { v = Math.min(v, d[i + w] + 3); if (x < w - 1) v = Math.min(v, d[i + w + 1] + 4); if (x > 0) v = Math.min(v, d[i + w - 1] + 4); }
    d[i] = v;
  }
  for (let i = 0; i < w * h; i++) d[i] /= 3;
  return d;
}

/* img + crop {x,y,w,h} → {w,h,rgb:Uint8ClampedArray(RGBA), mask:Uint8Array, box} */
function extract(img, crop, level, maxSide){
  maxSide = maxSide || 640;
  const sc = Math.min(1, maxSide / Math.max(crop.w, crop.h));
  const w = Math.max(16, Math.round(crop.w * sc)), h = Math.max(16, Math.round(crop.h * sc));
  const cv = mk(w, h), c = cv.getContext("2d", {willReadFrequently: true});
  c.fillStyle = "#fff"; c.fillRect(0, 0, w, h);
  c.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
  const d = c.getImageData(0, 0, w, h).data;
  const N = w * h;
  const lum = new Uint8Array(N);
  for (let i = 0, j = 0; i < N; i++, j += 4) lum[i] = (d[j] * 77 + d[j + 1] * 150 + d[j + 2] * 29) >> 8;

  /* תאורת הדף: לכל בלוק – הצבע של הפיקסלים הבהירים (85%), ואז המקסימום של השכנים */
  const B = Math.max(10, Math.round(Math.max(w, h) / 12));
  const bw = Math.ceil(w / B), bh = Math.ceil(h / B);
  const bc = new Float32Array(bw * bh * 4); /* r g b lum */
  const hist = new Uint32Array(256);
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
    hist.fill(0); let n = 0;
    const x0 = bx * B, y0 = by * B, x1 = Math.min(w, x0 + B), y1 = Math.min(h, y0 + B);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { hist[lum[y * w + x]]++; n++; }
    let acc = 0, thr = 255; const want = n * .15;
    for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= want) { thr = v; break; } }
    let r = 0, g = 0, b = 0, m = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = y * w + x; if (lum[i] >= thr) { const j = i * 4; r += d[j]; g += d[j + 1]; b += d[j + 2]; m++; } }
    const k = (by * bw + bx) * 4; bc[k] = r / m; bc[k + 1] = g / m; bc[k + 2] = b / m; bc[k + 3] = thr;
  }
  /* תאורת הדף: משטח חלק (ריבועי) שמותאם רק לבלוקים של דף – כך צל של טלפון והדרגת אור נעלמים */
  const nb = bw * bh, wt = new Float32Array(nb).fill(1);
  const feat = (bx, by) => { const x = (bx + .5) / bw - .5, y = (by + .5) / bh - .5; return [1, x, y, x * x, y * y, x * y]; };
  const solve = (A, v) => { const n = v.length; A = A.map((r, i) => r.concat([v[i]]));
    for (let i = 0; i < n; i++) { let m = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k; [A[i], A[m]] = [A[m], A[i]];
      const pv = A[i][i] || 1e-9; for (let k = i; k <= n; k++) A[i][k] /= pv;
      for (let r = 0; r < n; r++) if (r !== i) { const f = A[r][i]; for (let k = i; k <= n; k++) A[r][k] -= f * A[i][k]; } }
    return A.map(r => r[n]); };
  const fit = ch => { const M = Array.from({length: 6}, () => new Array(6).fill(0)), v = new Array(6).fill(0);
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) { const k = by * bw + bx, w0 = wt[k]; if (!w0) continue; const f = feat(bx, by), val = bc[k * 4 + ch];
      for (let i = 0; i < 6; i++) { v[i] += w0 * f[i] * val; for (let j = 0; j < 6; j++) M[i][j] += w0 * f[i] * f[j]; } }
    for (let i = 0; i < 6; i++) M[i][i] += 1e-3; return solve(M, v); };
  const evalF = (c, x, y) => c[0] + c[1] * x + c[2] * y + c[3] * x * x + c[4] * y * y + c[5] * x * y;
  /* מתחילים מהבלוקים הבהירים, ובכל סיבוב זורקים בלוקים שכהים מהמשטח (ציור צבוע) */
  { const ls = []; for (let k = 0; k < nb; k++) ls.push(bc[k * 4 + 3]); ls.sort((x, y) => x - y); const q = ls[Math.floor(nb * .35)];
    for (let k = 0; k < nb; k++) wt[k] = bc[k * 4 + 3] >= q ? 1 : 0; }
  let cL = fit(3);
  for (let it = 0; it < 4; it++) {
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) { const k = by * bw + bx, f = feat(bx, by), e = evalF(cL, f[1], f[2]);
      wt[k] = bc[k * 4 + 3] >= e * .9 ? 1 : 0; }
    cL = fit(3);
  }
  const cR = fit(0), cG = fit(1), cB = fit(2);
  const bg = new Float32Array(nb * 3);
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) { const k = by * bw + bx, f = feat(bx, by), o = k * 3;
    bg[o] = Math.max(40, evalF(cR, f[1], f[2])); bg[o + 1] = Math.max(40, evalF(cG, f[1], f[2])); bg[o + 2] = Math.max(40, evalF(cB, f[1], f[2])); }
  /* צבע מנורמל לכל פיקסל (אינטרפולציה בין מרכזי הבלוקים) */
  const nrm = new Uint8ClampedArray(N * 4);
  const ink = new Uint8Array(N);
  const T = [30, 46, 68][level == null ? 1 : level];
  for (let y = 0; y < h; y++) {
    const fy = clamp((y + .5) / B - .5, 0, bh - 1), y0 = Math.floor(fy), y1 = Math.min(bh - 1, y0 + 1), ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const fx = clamp((x + .5) / B - .5, 0, bw - 1), x0 = Math.floor(fx), x1 = Math.min(bw - 1, x0 + 1), tx = fx - x0;
      const i = y * w + x, j = i * 4;
      let mn = 255, mx = 0;
      for (let ch = 0; ch < 3; ch++) {
        const a = bg[(y0 * bw + x0) * 3 + ch], b = bg[(y0 * bw + x1) * 3 + ch], cc = bg[(y1 * bw + x0) * 3 + ch], dd = bg[(y1 * bw + x1) * 3 + ch];
        const bv = (a * (1 - tx) + b * tx) * (1 - ty) + (cc * (1 - tx) + dd * tx) * ty;
        const v = clamp(d[j + ch] * 255 / bv, 0, 255);
        nrm[j + ch] = v; if (v < mn) mn = v; if (v > mx) mx = v;
      }
      nrm[j + 3] = 255;
      const s = Math.max(255 - mn, (mx - mn) * 1.25);
      ink[i] = s > T ? 1 : 0;
    }
  }
  /* שולחן / קצה דף: כתם "דיו" שנוגע הרבה בשולי התמונה – זה לא הציור. מוחקים אותו */
  {
    const lab0 = new Int32Array(N), st0 = new Int32Array(N); let L0 = 0; const perim = 2 * (w + h);
    for (let s0 = 0; s0 < N; s0++) {
      if (!ink[s0] || lab0[s0]) continue;
      L0++; let sp0 = 0, touch = 0; const list = []; st0[sp0++] = s0; lab0[s0] = L0;
      while (sp0) { const i = st0[--sp0], x = i % w, y = (i / w) | 0; list.push(i);
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touch++;
        if (x > 0 && ink[i - 1] && !lab0[i - 1]) { lab0[i - 1] = L0; st0[sp0++] = i - 1; }
        if (x < w - 1 && ink[i + 1] && !lab0[i + 1]) { lab0[i + 1] = L0; st0[sp0++] = i + 1; }
        if (y > 0 && ink[i - w] && !lab0[i - w]) { lab0[i - w] = L0; st0[sp0++] = i - w; }
        if (y < h - 1 && ink[i + w] && !lab0[i + w]) { lab0[i + w] = L0; st0[sp0++] = i + w; } }
      if (touch > perim * .12) for (const i of list) ink[i] = 0;
    }
  }
  /* שוליים לבנים מסביב (למסגרת ולצל) */
  const pad = Math.round(Math.max(w, h) * .09) + 8;
  const PW = w + pad * 2, PH = h + pad * 2, PN = PW * PH;
  const pink = new Uint8Array(PN);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) pink[(y + pad) * PW + x + pad] = ink[y * w + x];
  /* סוגרים פתחים קטנים בקו: מרחיבים את הקווים */
  const gap = Math.max(2, Math.round(Math.max(w, h) / 150));
  const dIn = distField(pink, PW, PH);
  const wall = new Uint8Array(PN); for (let i = 0; i < PN; i++) wall[i] = dIn[i] <= gap ? 1 : 0;
  /* מילוי מהקצוות: מה שלא הגענו אליו = הדמות (כולל מה שבתוך קו סגור) */
  const out = new Uint8Array(PN), st = new Int32Array(PN); let sp = 0;
  const push = i => { if (!out[i] && !wall[i]) { out[i] = 1; st[sp++] = i; } };
  for (let x = 0; x < PW; x++) { push(x); push((PH - 1) * PW + x); }
  for (let y = 0; y < PH; y++) { push(y * PW); push(y * PW + PW - 1); }
  while (sp) { const i = st[--sp], x = i % PW; if (x > 0) push(i - 1); if (x < PW - 1) push(i + 1); if (i >= PW) push(i - PW); if (i < PN - PW) push(i + PW); }
  let fig = new Uint8Array(PN); for (let i = 0; i < PN; i++) fig[i] = out[i] ? 0 : 1;
  /* מכווצים בחזרה את ההרחבה (רק מבחוץ) כדי שהדמות לא תהיה שמנה */
  const dOut = distField(out, PW, PH);
  for (let i = 0; i < PN; i++) if (fig[i] && dOut[i] <= gap * .7) fig[i] = 0;
  /* רכיבים: משאירים את הגדולים, זורקים לכלוך קטן */
  const lab = new Int32Array(PN); const sizes = [0]; let L = 0;
  for (let s = 0; s < PN; s++) {
    if (!fig[s] || lab[s]) continue;
    L++; let n = 0; sp = 0; st[sp++] = s; lab[s] = L;
    while (sp) { const i = st[--sp]; n++; const x = i % PW;
      const nb = [x > 0 ? i - 1 : -1, x < PW - 1 ? i + 1 : -1, i - PW, i + PW];
      for (const k of nb) if (k >= 0 && k < PN && fig[k] && !lab[k]) { lab[k] = L; st[sp++] = k; } }
    sizes.push(n);
  }
  const big = Math.max(0, ...sizes);
  const keep = sizes.map(n => n >= Math.max(N * .0015, big * .035));
  let x0 = PW, y0 = PH, x1 = -1, y1 = -1, area = 0;
  for (let i = 0; i < PN; i++) {
    if (fig[i] && keep[lab[i]]) { const x = i % PW, y = (i / PW) | 0; area++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    else fig[i] = 0;
  }
  /* הצבעים: מה שבתוך הדמות – מנורמל, רווי יותר, קווים כהים יותר */
  const rgb = new Uint8ClampedArray(PN * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const j = (y * w + x) * 4, k = ((y + pad) * PW + x + pad) * 4;
    rgb[k] = nrm[j]; rgb[k + 1] = nrm[j + 1]; rgb[k + 2] = nrm[j + 2]; rgb[k + 3] = 255;
  }
  /* מה שמחוץ לדמות, וגם דף ריק בתוך קו סגור (בין יד לגוף) – לבן נקי */
  for (let i = 0; i < PN; i++) if (!fig[i] || !pink[i]) { rgb[i * 4] = rgb[i * 4 + 1] = rgb[i * 4 + 2] = 255; }
  return {w: PW, h: PH, rgb, fig, area, box: x1 < 0 ? null : {x0, y0, x1, y1}, pad, inkCount: ink.reduce((a, b) => a + b, 0), N};
}

/* חיתוך אוטומטי ראשוני: קודם מוצאים את הדף (אזור בהיר גדול), ואז את הציור בתוכו */
function findPaper(img){
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, k = Math.min(1, 300 / Math.max(iw, ih));
  const w = Math.max(8, Math.round(iw * k)), h = Math.max(8, Math.round(ih * k)), N = w * h;
  const c = mk(w, h).getContext("2d", {willReadFrequently: true}); c.drawImage(img, 0, 0, w, h);
  const d = c.getImageData(0, 0, w, h).data, lum = new Uint8Array(N), hist = new Float64Array(256);
  for (let i = 0, j = 0; i < N; i++, j += 4) { lum[i] = (d[j] * 77 + d[j + 1] * 150 + d[j + 2] * 29) >> 8; hist[lum[i]]++; }
  /* Otsu */
  let sum = 0; for (let v = 0; v < 256; v++) sum += v * hist[v];
  let sB = 0, wB = 0, best = 0, thr = 160;
  for (let v = 0; v < 256; v++) { wB += hist[v]; if (!wB) continue; const wF = N - wB; if (!wF) break; sB += v * hist[v]; const mB = sB / wB, mF = (sum - sB) / wF, bt = wB * wF * (mB - mF) * (mB - mF); if (bt > best) { best = bt; thr = v; } }
  const br = new Uint8Array(N);
  for (let i = 0, j = 0; i < N; i++, j += 4) { const mx = Math.max(d[j], d[j + 1], d[j + 2]), mn = Math.min(d[j], d[j + 1], d[j + 2]); br[i] = lum[i] > thr && mx - mn < 70 ? 1 : 0; }
  /* סוגרים חורים קטנים (קווי הציור) לפני שמחפשים את הכתם הגדול */
  const lab = new Int32Array(N), st = new Int32Array(N); let bestA = 0, bb = null, L = 0;
  for (let s0 = 0; s0 < N; s0++) {
    if (!br[s0] || lab[s0]) continue; L++; let sp = 0, a = 0, x0 = w, y0 = h, x1 = 0, y1 = 0; st[sp++] = s0; lab[s0] = L;
    while (sp) { const i = st[--sp], x = i % w, y = (i / w) | 0; a++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x > 0 && br[i - 1] && !lab[i - 1]) { lab[i - 1] = L; st[sp++] = i - 1; } if (x < w - 1 && br[i + 1] && !lab[i + 1]) { lab[i + 1] = L; st[sp++] = i + 1; }
      if (y > 0 && br[i - w] && !lab[i - w]) { lab[i - w] = L; st[sp++] = i - w; } if (y < h - 1 && br[i + w] && !lab[i + w]) { lab[i + w] = L; st[sp++] = i + w; } }
    if (a > bestA) { bestA = a; bb = {x0, y0, x1, y1}; }
  }
  if (!bb || bestA < N * .12) return null;
  const bw = bb.x1 - bb.x0 + 1, bh = bb.y1 - bb.y0 + 1;
  if (bw > w * .97 && bh > h * .97) return null;      /* הדף ממלא את כל התמונה */
  const ins = .035;
  return {x: (bb.x0 + bw * ins) / k, y: (bb.y0 + bh * ins) / k, w: bw * (1 - 2 * ins) / k, h: bh * (1 - 2 * ins) / k};
}
function autoCrop(img){
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const full = {x: 0, y: 0, w: iw, h: ih};
  try {
    const paper = findPaper(img) || full;
    const r = extract(img, paper, 1, 260);
    if (!r.box) return paper;
    const iw2 = r.w - r.pad * 2, ih2 = r.h - r.pad * 2, sx = paper.w / iw2, sy = paper.h / ih2;
    let x = paper.x + (r.box.x0 - r.pad) * sx, y = paper.y + (r.box.y0 - r.pad) * sy, X = paper.x + (r.box.x1 - r.pad + 1) * sx, Y = paper.y + (r.box.y1 - r.pad + 1) * sy;
    const m = Math.max(iw, ih) * .04; x -= m; y -= m; X += m; Y += m;
    x = clamp(x, paper.x, paper.x + paper.w); y = clamp(y, paper.y, paper.y + paper.h); X = clamp(X, paper.x, paper.x + paper.w); Y = clamp(Y, paper.y, paper.y + paper.h);
    if (X - x < iw * .08 || Y - y < ih * .08) return paper;
    return {x, y, w: X - x, h: Y - y};
  } catch(e) { return full; }
}

/* =====================================================================
   2. המראה המגניב: מדבקה / קומיקס / קסם / כמו שצייר
   ===================================================================== */
function buildSticker(ex, look){
  const {w, h, rgb, fig, box} = ex;
  const bw = box.x1 - box.x0 + 1, bh = box.y1 - box.y0 + 1;
  const border = look === "orig" ? 0 : Math.round(Math.max(bw, bh) * (look === "comic" ? .028 : .032)) + 3;
  const dist = distField(fig, w, h);
  const M = border + 14;                 /* מקום למסגרת ולצל */
  const cx0 = Math.max(0, box.x0 - M), cy0 = Math.max(0, box.y0 - M);
  const cx1 = Math.min(w - 1, box.x1 + M), cy1 = Math.min(h - 1, box.y1 + M);
  const SW = cx1 - cx0 + 1, SH = cy1 - cy0 + 1;
  /* הדמות עצמה (שוליים רכים) */
  const chC = mk(SW, SH), chX = chC.getContext("2d"), chI = chX.createImageData(SW, SH), cd = chI.data;
  const sat = look === "comic" ? 1.55 : look === "orig" ? 1.05 : 1.35, gam = look === "orig" ? 1.05 : 1.3;
  /* מרחק פנימי להחלקת הקצה */
  const inv = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) inv[i] = fig[i] ? 0 : 1;
  const dInside = distField(inv, w, h);
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
    const i = (y + cy0) * w + x + cx0, k = (y * SW + x) * 4;
    if (!fig[i]) continue;
    let r = rgb[i * 4], g = rgb[i * 4 + 1], b = rgb[i * 4 + 2];
    const gr = (r + g + b) / 3;
    r = gr + (r - gr) * sat; g = gr + (g - gr) * sat; b = gr + (b - gr) * sat;
    r = 255 * Math.pow(clamp(r, 0, 255) / 255, gam); g = 255 * Math.pow(clamp(g, 0, 255) / 255, gam); b = 255 * Math.pow(clamp(b, 0, 255) / 255, gam);
    if (look === "magic") { /* זוהר עדין: לבן נהיה שמנת־ורדרד */ if (r > 235 && g > 235 && b > 235) { r = 255; g = 246; b = 251; } }
    cd[k] = r; cd[k + 1] = g; cd[k + 2] = b; cd[k + 3] = 255 * clamp(dInside[i] + .5, 0, 1);
  }
  chX.putImageData(chI, 0, 0);
  /* צללית למסגרת */
  const silC = mk(SW, SH), sx = silC.getContext("2d"), si = sx.createImageData(SW, SH), sd = si.data;
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
    const i = (y + cy0) * w + x + cx0, k = (y * SW + x) * 4;
    const a = clamp(border + .5 - dist[i], 0, 1);
    sd[k] = sd[k + 1] = sd[k + 2] = 255; sd[k + 3] = a * 255;
  }
  sx.putImageData(si, 0, 0);
  const out = mk(SW, SH), o = out.getContext("2d");
  if (look !== "orig") {
    /* צל */
    o.save(); o.shadowColor = "rgba(43,21,38,.35)"; o.shadowBlur = 12; o.shadowOffsetY = 6; o.drawImage(silC, 0, 0); o.restore();
    const col = mk(SW, SH), cx = col.getContext("2d");
    if (look === "comic") cx.fillStyle = "#213330";
    else if (look === "magic") { const gg = cx.createLinearGradient(0, 0, SW, SH); ["#FA57C4", "#FFC93C", "#46C46E", "#3AA7F0", "#9B5DE5"].forEach((c, n) => gg.addColorStop(n / 4, c)); cx.fillStyle = gg; }
    else cx.fillStyle = "#fff";
    cx.fillRect(0, 0, SW, SH); cx.globalCompositeOperation = "destination-in"; cx.drawImage(silC, 0, 0);
    if (look === "magic") { o.save(); o.shadowColor = "#FA57C4"; o.shadowBlur = 22; o.drawImage(col, 0, 0); o.restore(); }
    o.drawImage(col, 0, 0);
    if (look === "comic") { /* קו לבן דק בין הדמות לקו השחור */
      const wc = mk(SW, SH), wx = wc.getContext("2d"), wi = wx.createImageData(SW, SH), wd = wi.data, inner = Math.max(2, border * .35);
      for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const i = (y + cy0) * w + x + cx0, k = (y * SW + x) * 4; wd[k] = wd[k + 1] = wd[k + 2] = 255; wd[k + 3] = 255 * clamp(inner + .5 - dist[i], 0, 1); }
      wx.putImageData(wi, 0, 0); o.drawImage(wc, 0, 0);
    }
  } else {
    o.save(); o.shadowColor = "rgba(43,21,38,.22)"; o.shadowBlur = 10; o.shadowOffsetY = 5; o.drawImage(chC, 0, 0); o.restore();
  }
  o.drawImage(chC, 0, 0);
  /* הקטנה לגודל טקסטורה סביר */
  const MAXT = 720, k = Math.min(1, MAXT / Math.max(SW, SH));
  if (k < 1) { const s2 = mk(Math.round(SW * k), Math.round(SH * k)); s2.getContext("2d").drawImage(out, 0, 0, s2.width, s2.height); return s2; }
  return out;
}

/* =====================================================================
   3. רקעים (מצוירים בקוד, מקוריים)
   ===================================================================== */
const SCENES = {
  garden: {ic: "🌳", name: "בגינה", ground: .84},
  sea:    {ic: "🌊", name: "בים", ground: .86},
  space:  {ic: "🚀", name: "בחלל", ground: .82},
  forest: {ic: "🌲", name: "ביער", ground: .85},
  stage:  {ic: "🎤", name: "על הבמה", ground: .86},
  night:  {ic: "🌙", name: "בלילה", ground: .85}
};
const SCENE_ORDER = ["garden", "sea", "space", "forest", "stage", "night"];
const rr = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647);
const STARS = (() => { const r = rr(7); return Array.from({length: 70}, () => [r() * W, r() * H * .75, .6 + r() * 1.8, r() * TAU]); })();
function blob(c, x, y, rx, ry){ c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); }
function cloud(c, x, y, s){ c.fillStyle = "rgba(255,255,255,.95)"; blob(c, x, y, 46 * s, 26 * s); blob(c, x + 38 * s, y + 6 * s, 36 * s, 22 * s); blob(c, x - 38 * s, y + 8 * s, 32 * s, 20 * s); blob(c, x + 6 * s, y - 16 * s, 30 * s, 24 * s); }
function drawScene(c, name, t){
  const g = SCENES[name].ground * H;
  let gr;
  if (name === "garden" || name === "forest") {
    gr = c.createLinearGradient(0, 0, 0, g); gr.addColorStop(0, name === "forest" ? "#BFE6F2" : "#9ED8FF"); gr.addColorStop(1, "#E8F7FF");
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    if (name === "garden") { /* שמש */
      c.save(); c.translate(600, 120); c.rotate(t * .3); c.fillStyle = "#FFD23F";
      for (let k = 0; k < 12; k++) { c.rotate(TAU / 12); c.fillRect(56, -6, 26, 12); }
      c.restore(); c.fillStyle = "#FFC93C"; blob(c, 600, 120, 50, 50);
      cloud(c, ((t * 22) % (W + 300)) - 150, 150, 1); cloud(c, ((t * 14 + 420) % (W + 300)) - 150, 250, .75);
      c.fillStyle = "#7CCB6B"; blob(c, 140, g + 30, 300, 120); c.fillStyle = "#8ED67A"; blob(c, 600, g + 40, 320, 130);
    } else {
      cloud(c, ((t * 16) % (W + 300)) - 150, 110, .8);
      for (let k = 0; k < 7; k++) { const x = 40 + k * 110 + (k % 2) * 30, ht = 260 + (k * 53) % 120, sway = Math.sin(t * 1.2 + k) * 4;
        c.fillStyle = "#8A5A3C"; c.fillRect(x - 10, g - ht * .45, 20, ht * .45 + 10);
        c.fillStyle = k % 2 ? "#3F9B5B" : "#4FB06A";
        for (let l = 0; l < 3; l++) { c.beginPath(); c.moveTo(x + sway * (l + 1) / 2, g - ht + l * 60); c.lineTo(x - 70 + l * 8, g - ht * .4 + l * 18 - 40); c.lineTo(x + 70 - l * 8, g - ht * .4 + l * 18 - 40); c.closePath(); c.fill(); }
      }
      /* עלים נופלים */
      c.fillStyle = "#FF9A2E"; for (let k = 0; k < 6; k++) { const ph = (t * .25 + k / 6) % 1; c.save(); c.translate((k * 137 + Math.sin(t + k) * 40) % W, ph * g); c.rotate(t * 2 + k); blob(c, 0, 0, 9, 5); c.restore(); }
    }
    c.fillStyle = name === "forest" ? "#5BA35A" : "#6CC067"; c.fillRect(0, g, W, H - g);
    c.fillStyle = name === "forest" ? "#4E9450" : "#5DB258"; for (let x = 0; x < W; x += 24) { c.beginPath(); c.moveTo(x, g + 2); c.lineTo(x + 8, g - 14 - Math.sin(t * 2 + x) * 3); c.lineTo(x + 16, g + 2); c.fill(); }
    if (name === "garden") { const F = ["#FA57C4", "#FFC93C", "#FFFFFF", "#9B5DE5"]; for (let k = 0; k < 9; k++) { const x = 30 + k * 82, y = g + 40 + (k % 3) * 34; c.fillStyle = F[k % 4]; for (let p = 0; p < 5; p++) blob(c, x + Math.cos(p * TAU / 5) * 9, y + Math.sin(p * TAU / 5) * 9, 7, 7); c.fillStyle = "#FFD23F"; blob(c, x, y, 6, 6); } }
  } else if (name === "sea") {
    gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#5FD3F3"); gr.addColorStop(1, "#1C6FB8"); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(255,255,255,.12)"; for (let k = 0; k < 5; k++) { const x = 80 + k * 150 + Math.sin(t * .6 + k) * 30; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 50, 0); c.lineTo(x - 60, H); c.lineTo(x - 130, H); c.fill(); }
    c.fillStyle = "#F3D9A4"; c.beginPath(); c.moveTo(0, g); for (let x = 0; x <= W; x += 40) c.lineTo(x, g + Math.sin(x * .02) * 10); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    c.strokeStyle = "#2FA36B"; c.lineWidth = 12; c.lineCap = "round";
    for (let k = 0; k < 6; k++) { const x = 40 + k * 130; c.beginPath(); c.moveTo(x, g + 6); for (let s = 1; s <= 6; s++) c.lineTo(x + Math.sin(t * 1.5 + s * .7 + k) * 12 * s / 3, g + 6 - s * 34); c.stroke(); }
    c.fillStyle = "#FF8FA3"; blob(c, 600, g + 20, 26, 16); c.fillStyle = "#FFC93C"; blob(c, 120, g + 30, 18, 12);
    c.strokeStyle = "rgba(255,255,255,.75)"; c.lineWidth = 3;
    for (let k = 0; k < 14; k++) { const ph = (t * .2 + k / 14) % 1, x = (k * 97) % W + Math.sin(t * 2 + k) * 8, y = H - ph * H; c.beginPath(); c.arc(x, y, 4 + (k % 4) * 3, 0, TAU); c.stroke(); }
  } else if (name === "space") {
    gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#15103A"); gr.addColorStop(1, "#3B2A7A"); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    for (const [x, y, r, p] of STARS) { c.globalAlpha = .45 + .55 * Math.abs(Math.sin(t * 1.6 + p)); c.fillStyle = "#fff"; blob(c, x, y, r, r); }
    c.globalAlpha = 1;
    c.fillStyle = "#FF9AD5"; blob(c, 590, 150, 58, 58); c.strokeStyle = "#FFD23F"; c.lineWidth = 9; c.beginPath(); c.ellipse(590, 150, 100, 24, -.3, 0, TAU); c.stroke();
    c.fillStyle = "#7FD1FF"; blob(c, 110, 260, 26, 26);
    /* כוכב שביט */
    const ph = (t * .35) % 1; c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 3; c.beginPath(); c.moveTo(W * (1.1 - ph * 1.4), 60 + ph * 220); c.lineTo(W * (1.1 - ph * 1.4) + 70, 60 + ph * 220 - 30); c.stroke();
    c.fillStyle = "#8C7BC9"; blob(c, W / 2, g + 260, W * .9, 300);
    c.fillStyle = "#7565B4"; blob(c, 160, g + 40, 40, 12); blob(c, 520, g + 70, 56, 16); blob(c, 340, g + 120, 30, 10);
  } else if (name === "stage") {
    c.fillStyle = "#3A1440"; c.fillRect(0, 0, W, H);
    for (let k = 0; k < 3; k++) { const a = Math.sin(t * 1.3 + k * 2) * .35, x = 120 + k * 240;
      c.save(); c.translate(x, -20); c.rotate(a); const lg = c.createLinearGradient(0, 0, 0, g); const col = ["255,86,194", "255,201,60", "58,167,240"][k];
      lg.addColorStop(0, "rgba(" + col + ",.55)"); lg.addColorStop(1, "rgba(" + col + ",.05)"); c.fillStyle = lg; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(150, g + 40); c.lineTo(-150, g + 40); c.fill(); c.restore(); }
    c.fillStyle = "#C5309A"; for (const side of [0, 1]) { c.beginPath(); const x0 = side ? W : 0, dir = side ? -1 : 1; c.moveTo(x0, 0); c.lineTo(x0 + dir * 120, 0); c.quadraticCurveTo(x0 + dir * 60, H * .5, x0 + dir * 90, g); c.lineTo(x0, g); c.fill(); }
    c.fillStyle = "#E33BAE"; c.fillRect(0, 0, W, 46); for (let x = 0; x < W; x += 60) blob(c, x + 30, 46, 30, 18);
    c.fillStyle = "#8A4B2C"; c.fillRect(0, g, W, H - g); c.fillStyle = "#A35D38"; for (let x = 0; x < W; x += 90) c.fillRect(x, g, 4, H - g);
    const N = ["♪", "♫", "★"]; c.font = "700 34px Fredoka, Assistant, sans-serif"; for (let k = 0; k < 6; k++) { const ph = (t * .3 + k / 6) % 1; c.fillStyle = "rgba(255,255,255," + (1 - ph) * .8 + ")"; c.fillText(N[k % 3], 60 + k * 115, g - ph * 420); }
  } else { /* night */
    gr = c.createLinearGradient(0, 0, 0, g); gr.addColorStop(0, "#1B2B5A"); gr.addColorStop(1, "#4A5FA0"); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    for (const [x, y, r, p] of STARS) { if (y > g * .8) continue; c.globalAlpha = .35 + .65 * Math.abs(Math.sin(t + p)); c.fillStyle = "#FFF6C9"; blob(c, x, y, r * .8, r * .8); }
    c.globalAlpha = 1; c.fillStyle = "#FFF1B0"; blob(c, 570, 140, 56, 56); c.fillStyle = "#1F3065"; blob(c, 594, 124, 50, 50);
    c.fillStyle = "#2D4A6E"; blob(c, 160, g + 40, 330, 120); blob(c, 600, g + 50, 300, 120);
    c.fillStyle = "#2F5A4E"; c.fillRect(0, g, W, H - g);
    c.fillStyle = "#FFE680"; for (let k = 0; k < 5; k++) { c.globalAlpha = .5 + .5 * Math.sin(t * 3 + k * 2); blob(c, 80 + k * 140 + Math.sin(t + k) * 20, g - 60 - (k % 3) * 40 + Math.cos(t * 1.3 + k) * 15, 5, 5); } c.globalAlpha = 1;
  }
}

/* =====================================================================
   4. התנועות. pose(t) → {x,y (פיקסלים), rot, sx, sy, center (סיבוב סביב המרכז), warp(u,v)}
      u,v בתוך הציור (0..1, v=0 למעלה). warp מחזיר תזוזה ביחידות של גובה הדמות.
   ===================================================================== */
const armW = (u, v) => sstep(.24, .42, Math.abs(u - .5)) * sstep(.12, .3, v) * (1 - sstep(.55, .75, v));
const legW = v => sstep(.66, .95, v);
const ACTS = {
  jump:  {ic: "🦘", name: "קופץ", cap: "קְפִיצוֹת!", say: "קְפִיצוֹת!"},
  walk:  {ic: "🚶", name: "הולך", cap: "הוֹלְכִים לְטַיֵּל!", say: "הוֹלְכִים לְטַיֵּל"},
  dance: {ic: "💃", name: "רוקד", cap: "רִקּוּדִים!", say: "רִקּוּדִים!", scene: "stage"},
  wave:  {ic: "👋", name: "אומר שלום", cap: "שָׁלוֹם!", say: "שָׁלוֹם שָׁלוֹם!"},
  fly:   {ic: "🕊️", name: "עף", cap: "טָסִים!", say: "טָסִים בַּשָּׁמַיִם!"},
  swim:  {ic: "🐠", name: "שוחה", cap: "שׂוֹחִים!", say: "שׂוֹחִים בַּיָּם!", scene: "sea"},
  spin:  {ic: "🌀", name: "מסתובב", cap: "סִיבוּבִים!", say: "סִיבוּבִים!"},
  sleep: {ic: "😴", name: "ישן", cap: "לַיְלָה טוֹב…", say: "לַיְלָה טוֹב", scene: "night"},
  grow:  {ic: "🎈", name: "מתנפח", cap: "מִתְנַפְּחִים!", say: "גָּדֵל גָּדֵל, וְקָטָן!"},
  laugh: {ic: "😂", name: "צוחק", cap: "חַחַחַ!", say: "חַחַחַחַ!"},
  roll:  {ic: "⚽", name: "מתגלגל", cap: "מִתְגַּלְגְּלִים!", say: "מִתְגַּלְגְּלִים!"},
  sing:  {ic: "🎤", name: "שר", cap: "שָׁרִים!", say: "לָה לָה לָה!", scene: "stage"}
};
const ACT_ORDER = ["jump", "walk", "dance", "wave", "fly", "swim", "spin", "sleep", "grow", "laugh", "roll", "sing"];
function pose(act, t, fast){
  const P = {x: 0, y: 0, rot: 0, sx: 1, sy: 1, center: false, warp: null, lift: 0};
  const sp = fast ? 1.8 : 1;
  switch (act) {
    case "jump": { const ph = (t * 1.05) % 1;
      if (ph < .22) { const q = Math.sin(Math.PI * ph / .22); P.sy = 1 - .16 * q; P.sx = 1 + .1 * q; }
      else if (ph < .82) { const q = (ph - .22) / .6, air = Math.sin(Math.PI * q); P.y = -.55 * air; P.sy = 1 + .1 * Math.sin(Math.PI * Math.min(1, q * 2)); P.sx = 1 - .05 * air; P.lift = air;
        P.warp = (u, v) => [0, -.08 * air * armW(u, v) + .04 * air * legW(v)]; }
      else { const q = Math.sin(Math.PI * (ph - .82) / .18); P.sy = 1 - .12 * q; P.sx = 1 + .08 * q; }
      break; }
    case "walk": { const w = TAU * 1.7 * sp, s = Math.sin(w * t);
      const T = 3.6 / (fast ? 2 : 1); P.x = Math.sin(TAU * t / T) * .3; const vel = Math.cos(TAU * t / T); P.sx = clamp(vel * 4, -1, 1); if (Math.abs(P.sx) < .15) P.sx = .15 * Math.sign(P.sx || 1);
      P.y = -.035 * Math.abs(s); P.rot = .05 * s + (fast ? .1 * Math.sign(vel) : 0);
      P.warp = (u, v) => { const l = legW(v), side = u < .5 ? 1 : -1; return [.07 * s * side * l, -.05 * Math.max(0, s * side) * l + .02 * Math.sin(w * t * 2) * armW(u, v)]; };
      break; }
    case "dance": { const b = TAU * 1.6;
      P.rot = .14 * Math.sin(b * t); P.y = -.05 * Math.abs(Math.sin(b * t)); P.sy = 1 + .04 * Math.sin(b * 2 * t);
      P.warp = (u, v) => [.09 * Math.sin(b * t + v * 2.2) * (1 - v), -.11 * Math.sin(b * 2 * t + (u < .5 ? 0 : Math.PI)) * armW(u, v) + .03 * Math.sin(b * 2 * t + (u < .5 ? 0 : Math.PI)) * legW(v)];
      break; }
    case "wave": { const a = -.7 - .45 * Math.sin(TAU * 2.2 * t);
      P.rot = -.05 + .03 * Math.sin(TAU * 1.1 * t); P.y = -.015 * Math.abs(Math.sin(TAU * 1.1 * t));
      P.warp = (u, v) => { const wgt = sstep(.6, .82, u) * sstep(.08, .3, v) * (1 - sstep(.58, .78, v)); if (!wgt) return [0, 0];
        const pu = .6, pv = .42, dx = (u - pu), dy = (v - pv), ang = a * wgt, c = Math.cos(ang), s = Math.sin(ang);
        return [(dx * c - dy * s - dx) * .9, (dx * s + dy * c - dy) * .9]; };
      break; }
    case "fly": { const f = TAU * 3.2;
      P.y = -.42 - .07 * Math.sin(TAU * .8 * t); P.x = Math.sin(TAU * t / 3.6) * .22; P.rot = .1 * Math.cos(TAU * t / 3.6) + .05 * Math.sin(f * t / 2); P.lift = 1;
      P.warp = (u, v) => [0, -.13 * Math.sin(f * t) * sstep(.22, .45, Math.abs(u - .5)) * (1 - sstep(.7, .95, v))];
      break; }
    case "swim": { P.x = Math.sin(TAU * t / 3.6) * .25; P.sx = clamp(Math.cos(TAU * t / 3.6) * 4, -1, 1); if (Math.abs(P.sx) < .15) P.sx = .15 * Math.sign(P.sx || 1);
      P.y = -.35 - .06 * Math.sin(TAU * .9 * t); P.rot = -.18; P.lift = 1;
      P.warp = (u, v) => [.03 * Math.sin(TAU * (t * 1.4 - v)), .05 * Math.sin(TAU * (t * 1.6 - u * 1.2))];
      break; }
    case "spin": { const c = Math.cos(TAU * .7 * t); P.sx = Math.abs(c) < .06 ? .06 * Math.sign(c || 1) : c; P.y = -.12 * Math.abs(Math.sin(TAU * .7 * t)); P.lift = .3; break; }
    case "sleep": { P.rot = -.32; P.sy = 1 + .04 * Math.sin(TAU * .45 * t); P.sx = 1 - .02 * Math.sin(TAU * .45 * t); P.y = .02;
      P.warp = (u, v) => [0, .015 * Math.sin(TAU * .45 * t) * (1 - v)]; break; }
    case "grow": { const g = .5 - .5 * Math.cos(TAU * t / 1.8); P.sx = P.sy = .85 + .45 * g;
      P.warp = (u, v) => [.025 * Math.sin(TAU * 4 * t) * (1 - v) * g, 0]; break; }
    case "laugh": { P.x = .012 * Math.sin(TAU * 9 * t); P.sy = 1 - .06 * Math.abs(Math.sin(TAU * 4.5 * t)); P.sx = 1 + .03 * Math.abs(Math.sin(TAU * 4.5 * t)); P.rot = .06 * Math.sin(TAU * 1.2 * t);
      P.warp = (u, v) => [.02 * Math.sin(TAU * 9 * t + v * 3) * (1 - v), 0]; break; }
    case "roll": { P.x = Math.sin(TAU * t / 3.6) * .3; P.center = true; P.rot = P.x * 4.2; P.y = -.02; break; }
    case "sing": { const b = TAU * 1.2; P.rot = .07 * Math.sin(b * t); P.sy = 1 + .05 * Math.max(0, Math.sin(b * 2 * t));
      P.warp = (u, v) => [.05 * Math.sin(b * t + 1) * (1 - v) * (1 - v), -.06 * Math.sin(b * 2 * t) * armW(u, v)]; break; }
  }
  return P;
}
const lerpPose = (a, b, k) => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, rot: a.rot + (b.rot - a.rot) * k, sx: a.sx + (b.sx - a.sx) * k, sy: a.sy + (b.sy - a.sy) * k, center: b.center, lift: a.lift + (b.lift - a.lift) * k,
  warp: (u, v) => { const p = a.warp ? a.warp(u, v) : [0, 0], q = b.warp ? b.warp(u, v) : [0, 0]; return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]; }});

/* =====================================================================
   5. ציור הדמות: רשת WebGL (ואם אין – תמונה רגילה)
   ===================================================================== */
const GX = 18, GY = 22;
function makeGL(){
  const cv = mk(W, H);
  let gl = null;
  try { gl = cv.getContext("webgl", {premultipliedAlpha: true, alpha: true, preserveDrawingBuffer: true, antialias: true}); } catch(e) {}
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p;attribute vec2 uv;uniform vec2 res;varying vec2 v;void main(){v=uv;gl_Position=vec4(p.x/res.x*2.0-1.0,1.0-p.y/res.y*2.0,0.0,1.0);}"));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, "precision mediump float;uniform sampler2D tex;varying vec2 v;void main(){gl_FragColor=texture2D(tex,v);}"));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  const nv = (GX + 1) * (GY + 1);
  const uvs = new Float32Array(nv * 2); for (let j = 0; j <= GY; j++) for (let i = 0; i <= GX; i++) { const k = (j * (GX + 1) + i) * 2; uvs[k] = i / GX; uvs[k + 1] = j / GY; }
  const idx = new Uint16Array(GX * GY * 6); let n = 0;
  for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const a = j * (GX + 1) + i, b = a + 1, c = a + GX + 1, d = c + 1; idx.set([a, b, c, b, d, c], n); n += 6; }
  const pb = gl.createBuffer(), ub = gl.createBuffer(), ib = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
  const aUV = gl.getAttribLocation(pr, "uv"); gl.enableVertexAttribArray(aUV); gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(pr, "p"); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(gl.getUniformLocation(pr, "res"), W, H);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.viewport(0, 0, W, H);
  const pos = new Float32Array(nv * 2);
  return {
    canvas: cv,
    setTex(img){ gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); },
    draw(fn){ for (let j = 0; j <= GY; j++) for (let i = 0; i <= GX; i++) { const k = (j * (GX + 1) + i) * 2, p = fn(i / GX, j / GY); pos[k] = p[0]; pos[k + 1] = p[1]; }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0); }
  };
}

/* =====================================================================
   6. המצב
   ===================================================================== */
const S = {
  img: null, crop: null, src: "", level: 1, look: "sticker", ex: null, sticker: null,
  seq: ["jump"], scene: "garden", sceneSet: false, fast: false, add: false, music: true,
  t0: performance.now(), recording: false, raf: 0, gl: null, logo: null, vidURL: "", vidBlob: null, vidExt: "mp4"
};
const stage = $("stage"), sctx = stage.getContext("2d");
const GAN = /[?&]gan=1/.test(location.search);   /* מצב גננת: מתנה להורים */
const charName = () => ((GAN ? $("gWhat") : $("nmChar")).value || "").trim();
const kidName = () => ((GAN ? $("gKid") : $("nmKid")).value || "").trim();
const ganLine = () => GAN ? [($("gDate").value || "").trim(), ($("gGan").value || "").trim()].filter(Boolean).join(" · ") : "";
(() => { const im = new Image(); im.src = "../../img/logo.png"; im.onload = () => S.logo = im; })();

/* מגדירים את הדמות על הבמה */
let CH = null; /* {cw, ch} גודל הדמות על הבמה */
function placeChar(){
  const sw = S.sticker.width, sh = S.sticker.height;
  const k = Math.min(W * .6 / sw, H * .46 / sh);
  CH = {cw: sw * k, ch: sh * k};
  if (S.gl) S.gl.setTex(S.sticker);
}
const particles = [];
function spawn(e, x, y, o){ particles.push(Object.assign({e, x, y, vx: 0, vy: -60, life: 1.6, age: 0, size: 40, rot: 0, vr: 0}, o || {})); }

function drawChar(c, P, feetX, feetY, scale){
  const {cw, ch} = CH; const s = scale || 1;
  const cs = Math.cos(P.rot), sn = Math.sin(P.rot);
  const X = feetX + P.x * W, Y = feetY + P.y * ch * s;
  /* צל על הרצפה */
  c.save(); c.globalAlpha = .22 * (1 - .6 * clamp(P.lift, 0, 1)); c.fillStyle = "#213330";
  c.beginPath(); c.ellipse(X, feetY + 6, cw * .32 * s * (1 - .35 * clamp(P.lift, 0, 1)), 12 * s, 0, 0, TAU); c.fill(); c.restore();
  const map = (u, v) => {
    let lx = (u - .5) * cw * s, ly = (v - 1) * ch * s;
    if (P.warp) { const d = P.warp(u, v); lx += d[0] * ch * s; ly += d[1] * ch * s; }
    lx *= P.sx; ly *= P.sy;
    if (P.center) ly += ch * s * .5 * P.sy;
    let rx = lx * cs - ly * sn, ry = lx * sn + ly * cs;
    if (P.center) ry -= ch * s * .5 * P.sy;
    return [X + rx, Y + ry];
  };
  if (S.gl) { S.gl.draw(map); c.drawImage(S.gl.canvas, 0, 0); }
  else { /* בלי WebGL: תמונה שלמה עם סיבוב וכיווץ */
    c.save(); c.translate(X, Y); if (P.center) c.translate(0, -ch * s / 2); c.rotate(P.rot); if (P.center) c.translate(0, ch * s / 2); c.scale(P.sx, P.sy);
    c.drawImage(S.sticker, -cw * s / 2, -ch * s, cw * s, ch * s); c.restore();
  }
  return {X, Y, top: Y - ch * s * P.sy};
}

function sceneFor(seq){ if (S.sceneSet) return S.scene; const a = ACTS[seq[0]]; return a && a.scene ? a.scene : "garden"; }
function caption(c, txt, y, size, bg){
  c.save(); c.font = "700 " + size + "px Fredoka, Assistant, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.direction = "rtl";
  const w = c.measureText(txt).width + size * 1.2, h = size * 1.55;
  c.fillStyle = bg || "rgba(255,255,255,.95)"; c.beginPath(); c.roundRect ? c.roundRect(W / 2 - w / 2, y - h / 2, w, h, h / 2) : c.rect(W / 2 - w / 2, y - h / 2, w, h); c.fill();
  c.fillStyle = "#C5309A"; c.fillText(txt, W / 2, y + 2); c.restore();
}
let lastFx = {};
function fx(act, t, top, X, dt){
  const k = act + Math.floor(t * 4);
  if (lastFx.k === k) return; lastFx.k = k;
  const r = Math.random;
  if (act === "sleep" && Math.floor(t * 4) % 3 === 0) spawn("Z", X + 60, top + 30, {vx: 30, vy: -45, size: 30 + r() * 20, text: true, life: 2.2});
  else if (act === "laugh" && Math.floor(t * 4) % 2 === 0) spawn(r() < .5 ? "חחח" : "😂", X + (r() - .5) * 220, top + 20, {vx: (r() - .5) * 60, vy: -70, size: 36, text: true});
  else if (act === "sing" || act === "dance") { if (Math.floor(t * 4) % 2 === 0) spawn(r() < .5 ? "♪" : "♫", X + (r() - .5) * 200, top + 10, {vx: (r() - .5) * 40, vy: -80, size: 44, text: true, color: ["#FA57C4", "#FFC93C", "#3AA7F0"][Math.floor(r() * 3)]}); }
  else if (act === "fly") spawn("✨", X - 120 + r() * 240, top + 120 + r() * 60, {vx: 0, vy: 30, size: 26, life: 1});
  else if (act === "spin" || act === "grow") spawn("⭐", X + (r() - .5) * 300, top + r() * 200, {vx: (r() - .5) * 80, vy: -40, size: 26, life: 1.2});
  else if (act === "wave" && Math.floor(t * 4) % 4 === 0) spawn("💗", X + 110, top + 20, {vx: 20, vy: -60, size: 34});
  else if (act === "swim") spawn("○", X + (r() - .5) * 120, top + 40, {vx: 0, vy: -70, size: 26, text: true, color: "rgba(255,255,255,.85)"});
  else if (act === "jump" && Math.floor(t * 4.2) % 4 === 0) spawn("💫", X + (r() - .5) * 160, top, {vx: (r() - .5) * 80, vy: -50, size: 28, life: 1});
  void dt;
}
function drawParticles(c, dt){
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.age += dt; if (p.age > p.life) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    c.save(); c.globalAlpha = clamp(1 - p.age / p.life, 0, 1) * clamp(p.age * 5, 0, 1);
    c.font = (p.text ? "700 " : "") + p.size + "px Fredoka, Assistant, 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji', sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = p.color || (p.text ? "#fff" : "#000"); if (p.text && !p.color) { c.strokeStyle = "#9B5DE5"; c.lineWidth = 5; c.strokeText(p.e, p.x, p.y); }
    c.fillText(p.e, p.x, p.y); c.restore();
  }
}

/* פריים אחד. mode: live (לולאה) / video (פתיח, תנועות, סיום) */
function frame(c, T, dt, mode){
  const seq = S.seq.length ? S.seq : ["jump"];
  const sceneName = sceneFor(seq);
  const G = SCENES[sceneName].ground * H;
  let actT = T, phase = "act", outK = 0;
  if (mode === "video") {
    if (T < INTRO) phase = "intro";
    else if (T >= INTRO + seq.length * ACT_DUR) { phase = "outro"; outK = (T - INTRO - seq.length * ACT_DUR) / OUTRO; }
    actT = T - INTRO;
  }
  drawScene(c, sceneName, T);
  let idx = Math.floor(Math.max(0, actT) / ACT_DUR) % seq.length; if (phase === "outro") idx = seq.length - 1;
  const act = seq[idx], lt = phase === "outro" ? ACT_DUR : Math.max(0, actT) - Math.floor(Math.max(0, actT) / ACT_DUR) * ACT_DUR;
  let P = pose(act, lt, S.fast && act === "walk");
  const blendIn = clamp(lt / .35, 0, 1);
  const neutral = {x: 0, y: 0, rot: 0, sx: 1, sy: 1, lift: 0, warp: null};
  if (phase === "act" && blendIn < 1) P = lerpPose(neutral, P, sstep(0, 1, blendIn));
  let scale = 1;
  /* הפריים הראשון = תמונה מלאה (הציור כבר שם, בגודל מלא) – זו התמונה הממוזערת בוואטסאפ. בלי "צמיחה מאפס" */
  if (phase === "intro") { const k = T / INTRO; scale = 1 + .1 * Math.sin(Math.PI * sstep(.15, .85, k)); P = Object.assign({}, neutral, {sy: 1 + .05 * Math.sin(k * TAU)}); }
  if (phase === "outro") { const bob = Math.sin(outK * TAU * 1.5); P = Object.assign({}, neutral, {y: -.06 * Math.abs(bob)}); scale = 1 - .3 * sstep(0, .35, outK); }
  const feetY = phase === "outro" ? G - H * .12 * sstep(0, .35, outK) : G;
  const pos = drawChar(c, P, W / 2, feetY, scale);
  if (phase === "act") fx(act, lt, pos.top, pos.X, dt);
  if (phase === "intro" && T < dt * 1.5 + .02) { for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; spawn(i % 2 ? "✨" : "⭐", W / 2, G - CH.ch / 2, {vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, size: 30, life: 1.1}); } }
  drawParticles(c, dt);
  /* כיתוב */
  const nm = charName();
  if (phase === "intro") caption(c, (nm ? nm + ": " : "") + "הַצִּיּוּר מִתְעוֹרֵר! ✨", 70, nm.length > 8 ? 34 : 40);
  else if (phase === "act") caption(c, (nm ? nm + " · " : "") + ACTS[act].cap, 70, 38);
  if (phase === "outro") {
    c.save(); c.globalAlpha = sstep(0, .3, outK);
    const gg = c.createLinearGradient(0, 0, 0, 260); gg.addColorStop(0, "rgba(255,227,244,.97)"); gg.addColorStop(1, "rgba(255,227,244,0)"); c.fillStyle = gg; c.fillRect(0, 0, W, 300);
    c.font = "700 46px Fredoka, Assistant, sans-serif"; c.textAlign = "center"; c.direction = "rtl"; c.fillStyle = "#C5309A";
    c.fillText(nm ? nm + " ✨" : "הַצִּיּוּר שֶׁלִּי ✨", W / 2, 84);
    const kn = kidName(); if (kn) { c.font = "700 30px Assistant, sans-serif"; c.fillStyle = "#6F3A60"; c.fillText("צִיֵּר/ה: " + kn, W / 2, 134); }
    const gl = ganLine(); if (gl) { c.font = "700 26px Assistant, sans-serif"; c.fillStyle = "#6F3A60"; c.fillText(gl, W / 2, kn ? 174 : 134); }
    c.restore();
  }
  if (mode === "video") footer(c, phase === "outro" ? sstep(0, .3, outK) : 0);
}
/* פס תחתון קטן בסרטון: מאיפה זה */
function footer(c, big){
  const h = 54 + 30 * big;
  c.save(); c.fillStyle = "rgba(78,133,118,.92)"; c.fillRect(0, H - h, W, h);
  c.textAlign = "center"; c.direction = "rtl"; c.fillStyle = "#fff";
  c.font = "700 " + (22 + 6 * big) + "px Assistant, sans-serif";
  c.fillText("🎁 נוצר בחינם באתר games.booqli.ai", W / 2, H - h + 34 + 4 * big);
  if (big > .05) { c.globalAlpha = big; c.font = "600 20px Assistant, sans-serif"; c.fillText("משחקים ופעילויות לגיל הרך · בחסות BOOQLI", W / 2, H - 18); }
  c.restore();
  if (S.logo && big > .05) { c.save(); c.globalAlpha = big; const lw = 150, lh = lw * S.logo.height / S.logo.width; c.fillStyle = "#2F6F63"; c.beginPath(); c.roundRect ? c.roundRect(W / 2 - lw / 2 - 14, H - h - lh - 26, lw + 28, lh + 16, 22) : c.rect(W / 2 - lw / 2 - 14, H - h - lh - 26, lw + 28, lh + 16); c.fill(); c.drawImage(S.logo, W / 2 - lw / 2, H - h - lh - 18, lw, lh); c.restore(); }
}

/* לולאת הבמה */
let lastNow = 0;
function loop(now){
  S.raf = requestAnimationFrame(loop);
  if (S.recording || !S.sticker) return;
  const dt = Math.min(.05, (now - (lastNow || now)) / 1000); lastNow = now;
  const T = (now - S.t0) / 1000;
  frame(sctx, T, dt, "live");
}

/* =====================================================================
   7. מוזיקה מקורית (Web Audio) – גם לרמקול וגם לסרטון
   ===================================================================== */
let AC = null, MASTER = null, REC_DEST = null;
const ac = () => { try { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = .55; MASTER.connect(AC.destination); } if (AC.state === "suspended") AC.resume(); } catch(e) {} return AC; };
function note(f, at, dur, type, vol){ const c = AC; if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = type || "triangle"; o.frequency.value = f;
  g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol || .2, at + .015); g.gain.exponentialRampToValueAtTime(.001, at + dur); o.connect(g).connect(MASTER); o.start(at); o.stop(at + dur + .05); }
function hat(at, vol){ const c = AC; if (!c) return; const len = Math.floor(c.sampleRate * .05), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = c.createBufferSource(); s.buffer = b; const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 6000; const g = c.createGain(); g.gain.value = vol || .12; s.connect(hp).connect(g).connect(MASTER); s.start(at); }
/* מנגינה מקורית בפנטטוני דו מז'ור */
const SCL = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
const MEL = [2, 4, 5, 4, 2, 3, 1, -1, 2, 4, 5, 5, 4, 3, 2, -1, 4, 3, 2, 1, 2, 3, 4, -1, 5, 4, 2, 3, 1, 0, 0, -1];
const BASS = [130.81, 110, 87.31, 98];
let mus = null;
function musicStart(){
  if (!ac() || mus) return; const bpm = 120, e = 60 / bpm / 2; let step = 0, next = AC.currentTime + .08;
  const tick = () => { while (next < AC.currentTime + .15) { const m = MEL[step % MEL.length];
      if (m >= 0) note(SCL[m], next, e * 1.6, "triangle", .11);
      if (step % 4 === 0) note(BASS[Math.floor(step / 8) % 4], next, e * 3.4, "sine", .2);
      if (step % 2 === 1) hat(next, .05);
      step++; next += e; } };
  tick(); mus = setInterval(tick, 30);
}
function musicStop(){ if (mus) { clearInterval(mus); mus = null; } }
function sfx(act){ if (!ac()) return; const t = AC.currentTime;
  const m = {jump: () => { const o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(880, t + .25); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(g).connect(MASTER); o.start(t); o.stop(t + .35); },
    wave: () => { note(784, t, .2, "sine", .18); note(1047, t + .14, .3, "sine", .18); },
    spin: () => [0, 1, 2, 3, 4].forEach(i => note(523 * Math.pow(1.122, i * 2), t + i * .06, .15, "sine", .12)),
    laugh: () => [0, 1, 2].forEach(i => note(600 - i * 40, t + i * .14, .1, "square", .06)),
    sleep: () => note(196, t, .9, "sine", .12) };
  (m[act] || (() => note(880, t, .2, "sine", .14)))(); }

/* =====================================================================
   8. מסכים
   ===================================================================== */
function step(n){ document.querySelectorAll("#steps span").forEach(s => { const k = +s.dataset.s; s.className = k < n ? "done" : k === n ? "on" : ""; }); }
function show(id){ ["s1", "sPad", "sCrop", "sMain", "sRes"].forEach(k => $(k).hidden = k !== id); try { window.scrollTo({top: $(id).offsetTop - 70, behavior: "smooth"}); } catch(e) {} }
function busy(msg){ const b = document.createElement("div"); b.className = "busy"; b.innerHTML = '<div class="in"><span class="wand" aria-hidden="true">🪄</span>' + msg + '</div>'; document.body.appendChild(b); return () => b.remove(); }
const wait = ms => new Promise(r => setTimeout(r, ms));

function loadFile(file){
  if (!file) return;
  const url = URL.createObjectURL(file), im = new Image();
  im.onload = () => { S.img = im; S.src = "photo"; ev("animate", "photo"); openCrop(); };
  im.onerror = () => alert("לא הצלחנו לפתוח את התמונה. נסו תמונה אחרת 🙂");
  im.src = url;
}
$("fCam").onchange = e => { loadFile(e.target.files[0]); e.target.value = ""; };
$("fGal").onchange = e => { loadFile(e.target.files[0]); e.target.value = ""; };

/* ---------- חיתוך ---------- */
let cropView = null;
function openCrop(){
  show("sCrop"); step(1); say(SAY.crop);
  S.crop = autoCrop(S.img);
  const cv = $("cropC"), iw = S.img.naturalWidth, ih = S.img.naturalHeight;
  const maxW = Math.min(cv.parentElement.clientWidth || 600, 640), maxH = Math.max(300, window.innerHeight * .6);
  const k = Math.min(maxW / iw, maxH / ih, 1);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.width = Math.round(iw * k) + "px"; cv.style.height = Math.round(ih * k) + "px";
  cv.width = Math.round(iw * k * dpr); cv.height = Math.round(ih * k * dpr);
  cropView = {k: k * dpr, dpr};
  drawCrop();
}
function drawCrop(){
  const cv = $("cropC"), c = cv.getContext("2d"), {k, dpr} = cropView, r = S.crop;
  c.drawImage(S.img, 0, 0, cv.width, cv.height);
  c.fillStyle = "rgba(43,21,38,.45)";
  c.fillRect(0, 0, cv.width, r.y * k); c.fillRect(0, (r.y + r.h) * k, cv.width, cv.height - (r.y + r.h) * k);
  c.fillRect(0, r.y * k, r.x * k, r.h * k); c.fillRect((r.x + r.w) * k, r.y * k, cv.width - (r.x + r.w) * k, r.h * k);
  c.strokeStyle = "#FA57C4"; c.lineWidth = 4 * dpr; c.setLineDash([12 * dpr, 8 * dpr]); c.strokeRect(r.x * k, r.y * k, r.w * k, r.h * k); c.setLineDash([]);
  c.fillStyle = "#FA57C4"; c.strokeStyle = "#fff"; c.lineWidth = 3 * dpr;
  for (const [x, y] of [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]]) { c.beginPath(); c.arc(x * k, y * k, 13 * dpr, 0, TAU); c.fill(); c.stroke(); }
}
(() => {
  const cv = $("cropC"); let drag = null;
  const pt = e => { const b = cv.getBoundingClientRect(), k = cropView.k / cropView.dpr; return [(e.clientX - b.left) / k, (e.clientY - b.top) / k]; };
  cv.addEventListener("pointerdown", e => {
    if (!cropView) return; const [x, y] = pt(e), r = S.crop, tol = 34 / (cropView.k / cropView.dpr);
    const near = (a, b) => Math.abs(a - b) < tol;
    const hx = near(x, r.x) ? "l" : near(x, r.x + r.w) ? "r" : "", hy = near(y, r.y) ? "t" : near(y, r.y + r.h) ? "b" : "";
    if (hx && hy) drag = {m: hx + hy, x, y, r: Object.assign({}, r)};
    else if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) drag = {m: "move", x, y, r: Object.assign({}, r)};
    else drag = {m: "new", x, y, r: {x, y, w: 1, h: 1}};
    cv.setPointerCapture(e.pointerId); e.preventDefault();
  });
  cv.addEventListener("pointermove", e => {
    if (!drag) return; const [x, y] = pt(e), iw = S.img.naturalWidth, ih = S.img.naturalHeight, o = drag.r, dx = x - drag.x, dy = y - drag.y, mn = Math.max(iw, ih) * .06;
    let r = Object.assign({}, o);
    if (drag.m === "move") { r.x = clamp(o.x + dx, 0, iw - o.w); r.y = clamp(o.y + dy, 0, ih - o.h); }
    else if (drag.m === "new") { r = {x: Math.min(drag.x, x), y: Math.min(drag.y, y), w: Math.abs(dx), h: Math.abs(dy)}; }
    else {
      if (drag.m[0] === "l") { r.x = clamp(o.x + dx, 0, o.x + o.w - mn); r.w = o.x + o.w - r.x; } else { r.w = clamp(o.w + dx, mn, iw - o.x); }
      if (drag.m[1] === "t") { r.y = clamp(o.y + dy, 0, o.y + o.h - mn); r.h = o.y + o.h - r.y; } else { r.h = clamp(o.h + dy, mn, ih - o.y); }
    }
    r.x = clamp(r.x, 0, iw); r.y = clamp(r.y, 0, ih); r.w = clamp(r.w, 1, iw - r.x); r.h = clamp(r.h, 1, ih - r.y);
    S.crop = r; drawCrop();
  });
  const up = () => { if (drag && drag.m === "new" && (S.crop.w < 20 || S.crop.h < 20)) S.crop = drag.r.w > 1 ? drag.r : autoCrop(S.img); drag = null; drawCrop(); };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
})();
$("cropAll").onclick = () => { S.crop = {x: 0, y: 0, w: S.img.naturalWidth, h: S.img.naturalHeight}; drawCrop(); };
$("cropOk").onclick = () => process();

/* ---------- עיבוד ---------- */
async function process(){
  const done = busy("הַצִּיּוּר מִתְעוֹרֵר…");
  await wait(60);
  try {
    let ex = extract(S.img, S.crop, S.level);
    if (!ex.box || ex.area < ex.N * .004) { /* לא נמצא כלום – ננסה ניקוי עדין */ ex = extract(S.img, S.crop, 0); }
    if (!ex.box) { done(); alert("לא מצאנו ציור בתמונה 🙈 נסו לצלם מקרוב, באור טוב, ציור עם קו חזק."); return; }
    S.ex = ex; S.sticker = buildSticker(ex, S.look);
    if (!S.gl) S.gl = makeGL();
    placeChar();
  } catch(e) { done(); alert("משהו השתבש. נסו תמונה אחרת 🙂"); return; }
  done();
  document.querySelectorAll("#clean [data-lv]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.lv === S.level));
  $("clean").hidden = S.src === "pad";
  if ($("sMain").hidden) { show("sMain"); S.t0 = performance.now(); S.seq = ["jump"]; S.sceneSet = false; renderControls(); say(SAY.main); }
  step(2); ev("animate", "ready-" + S.src);
}
function restyle(){ if (!S.ex) return; S.sticker = buildSticker(S.ex, S.look); placeChar(); }
$("looks").addEventListener("click", e => { const b = e.target.closest("[data-look]"); if (!b) return; S.look = b.dataset.look; document.querySelectorAll("#looks [data-look]").forEach(x => x.setAttribute("aria-pressed", x === b)); restyle(); ev("animate", "look-" + S.look); });
$("clean").addEventListener("click", e => { const b = e.target.closest("[data-lv]"); if (!b || !S.img) return; S.level = +b.dataset.lv; process(); });

/* ---------- ציור לדוגמה (מקורי, נוצר בקוד: מפלצת קטנה וחמודה בטושים) ---------- */
function sampleDrawing(){
  const w = 700, h = 820, c = mk(w, h), x = c.getContext("2d"), r = rr(11);
  const gg = x.createLinearGradient(0, 0, w, h); gg.addColorStop(0, "#F6F1E6"); gg.addColorStop(1, "#E4DCCB"); x.fillStyle = gg; x.fillRect(0, 0, w, h);
  x.lineCap = x.lineJoin = "round";
  const wob = (pts, col, lw, close) => { for (let pass = 0; pass < 2; pass++) { x.strokeStyle = col; x.lineWidth = lw * (pass ? .6 : 1); x.globalAlpha = pass ? .7 : 1; x.beginPath();
      pts.forEach(([px, py], i) => { const jx = px + (r() - .5) * 5, jy = py + (r() - .5) * 5; i ? x.lineTo(jx, jy) : x.moveTo(jx, jy); }); if (close) x.closePath(); x.stroke(); } x.globalAlpha = 1; };
  const ell = (cx, cy, rx, ry, n) => Array.from({length: n || 40}, (_, i) => { const a = i / (n || 40) * TAU; return [cx + Math.cos(a) * rx * (1 + (r() - .5) * .05), cy + Math.sin(a) * ry * (1 + (r() - .5) * .05)]; });
  /* צבע בקווקוו בתוך הגוף */
  x.save(); x.beginPath(); x.ellipse(350, 420, 190, 215, 0, 0, TAU); x.clip(); x.strokeStyle = "#B57BE8"; x.lineWidth = 16; x.globalAlpha = .85;
  for (let k = -500; k < 900; k += 22) { x.beginPath(); x.moveTo(k + r() * 6, 180); x.lineTo(k - 300 + r() * 6, 680); x.stroke(); } x.restore(); x.globalAlpha = 1;
  /* רגליים, ידיים, קרניים */
  wob([[270, 610], [262, 700], [220, 712], [300, 712], [300, 620]], "#3A2A5C", 9);
  wob([[430, 610], [440, 700], [400, 712], [480, 712], [460, 620]], "#3A2A5C", 9);
  wob([[170, 400], [90, 330], [70, 290], [95, 300], [110, 270], [118, 312], [180, 360]], "#3A2A5C", 9);
  wob([[530, 400], [610, 330], [630, 290], [605, 300], [590, 270], [582, 312], [520, 360]], "#3A2A5C", 9);
  wob([[290, 220], [260, 130]], "#3A2A5C", 9); wob([[410, 220], [440, 130]], "#3A2A5C", 9);
  x.fillStyle = "#FFC93C"; x.beginPath(); x.arc(258, 122, 22, 0, TAU); x.arc(442, 122, 22, 0, TAU); x.fill();
  wob(ell(258, 122, 22, 22, 20), "#3A2A5C", 7, true); wob(ell(442, 122, 22, 22, 20), "#3A2A5C", 7, true);
  wob(ell(350, 420, 190, 215, 54), "#3A2A5C", 11, true);
  /* פנים */
  x.fillStyle = "#fff"; x.beginPath(); x.ellipse(300, 370, 48, 54, 0, 0, TAU); x.ellipse(405, 370, 48, 54, 0, 0, TAU); x.fill();
  wob(ell(300, 370, 48, 54, 26), "#3A2A5C", 7, true); wob(ell(405, 370, 48, 54, 26), "#3A2A5C", 7, true);
  x.fillStyle = "#213330"; x.beginPath(); x.arc(312, 382, 18, 0, TAU); x.arc(392, 382, 18, 0, TAU); x.fill();
  x.fillStyle = "#FF6FA5"; x.globalAlpha = .7; x.beginPath(); x.ellipse(250, 470, 26, 16, 0, 0, TAU); x.ellipse(452, 470, 26, 16, 0, 0, TAU); x.fill(); x.globalAlpha = 1;
  x.fillStyle = "#E33BAE"; x.beginPath(); x.moveTo(290, 480); x.quadraticCurveTo(352, 570, 414, 480); x.closePath(); x.fill();
  wob([[290, 480], [320, 520], [352, 532], [384, 520], [414, 480], [290, 480]], "#3A2A5C", 8);
  /* צל של טלפון */
  const sh = x.createRadialGradient(560, 160, 10, 560, 160, 420); sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(60,40,20,.10)"); x.fillStyle = sh; x.fillRect(0, 0, w, h);
  return c;
}
$("bSample").onclick = () => { const c = sampleDrawing(); S.img = c; c.naturalWidth = c.width; c.naturalHeight = c.height; S.crop = {x: 0, y: 0, w: c.width, h: c.height}; S.src = "sample"; ev("animate", "sample"); if (!$("nmChar").value) $("nmChar").value = "פִּיצִי"; process(); };

/* ---------- לוח ציור ---------- */
const PAL = ["#213330", "#E33BAE", "#FF8A1F", "#FFC93C", "#46C46E", "#3AA7F0", "#9B5DE5", "#8A5A3C"];
const pad = {c: $("padC"), x: $("padC").getContext("2d"), col: PAL[0], size: 14, er: false, hist: [], drawing: false, last: null, dirty: false};
function padReset(){ pad.x.fillStyle = "#fff"; pad.x.fillRect(0, 0, 800, 800); pad.hist = []; pad.dirty = false; }
padReset();
$("pal").innerHTML = PAL.map((c, i) => '<button type="button" style="background:' + c + '" data-c="' + c + '" aria-label="צבע ' + (i + 1) + '" aria-pressed="' + (i === 0) + '"></button>').join("") + '<button type="button" data-c="er" aria-label="מחק" aria-pressed="false">🧽</button>';
$("pal").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; pad.er = b.dataset.c === "er"; if (!pad.er) pad.col = b.dataset.c; $("pal").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); });
$("padSize").onclick = () => { const S3 = [[14, "🖊️ קו עבה"], [26, "🖍️ קו עבה מאוד"], [7, "✏️ קו דק"]]; const i = (S3.findIndex(s => s[0] === pad.size) + 1) % 3; pad.size = S3[i][0]; $("padSize").textContent = S3[i][1]; };
$("padUndo").onclick = () => { const h = pad.hist.pop(); if (h) pad.x.putImageData(h, 0, 0); };
$("padClear").onclick = padReset;
(() => {
  const c = pad.c, pt = e => { const b = c.getBoundingClientRect(); return [(e.clientX - b.left) * 800 / b.width, (e.clientY - b.top) * 800 / b.height]; };
  c.addEventListener("pointerdown", e => { pad.hist.push(pad.x.getImageData(0, 0, 800, 800)); if (pad.hist.length > 15) pad.hist.shift(); pad.drawing = true; pad.last = pt(e); c.setPointerCapture(e.pointerId); dot(pad.last, pad.last); e.preventDefault(); });
  const dot = (a, b) => { const x = pad.x; x.strokeStyle = pad.er ? "#fff" : pad.col; x.lineWidth = pad.er ? 40 : pad.size; x.lineCap = x.lineJoin = "round"; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0] + .01, b[1]); x.stroke(); pad.dirty = true; };
  c.addEventListener("pointermove", e => { if (!pad.drawing) return; const p = pt(e); dot(pad.last, p); pad.last = p; });
  const up = () => pad.drawing = false; c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up);
})();
$("bPad").onclick = () => { show("sPad"); step(1); say(SAY.pad); };
$("padDone").onclick = () => { if (!pad.dirty) { say("קֹדֶם מְצַיְּרִים 🙂"); return; } const c = mk(800, 800); c.getContext("2d").drawImage(pad.c, 0, 0); c.naturalWidth = 800; c.naturalHeight = 800; S.img = c; S.crop = {x: 0, y: 0, w: 800, h: 800}; S.src = "pad"; S.level = 1; ev("animate", "pad"); process(); };
document.querySelectorAll("[data-back]").forEach(b => b.onclick = () => { show("s1"); step(1); });

/* ---------- תנועות, רקעים, תוכנית ---------- */
function renderControls(){
  $("acts").innerHTML = ACT_ORDER.map(k => '<button type="button" data-a="' + k + '" aria-pressed="' + (S.seq.indexOf(k) > -1) + '"><span class="e" aria-hidden="true">' + ACTS[k].ic + '</span>' + ACTS[k].name + '</button>').join("");
  const cur = sceneFor(S.seq);
  $("scenes").innerHTML = SCENE_ORDER.map(k => '<button type="button" class="chip" data-sc="' + k + '" aria-pressed="' + (k === cur) + '">' + SCENES[k].ic + ' ' + SCENES[k].name + '</button>').join("");
  $("plan").innerHTML = '<span>🎬 בסרטון:</span>' + S.seq.map((k, i) => (i ? '<span aria-hidden="true">←</span>' : "") + '<span class="st">' + ACTS[k].ic + ' ' + ACTS[k].name + '</span>').join("") + '<span>' + SCENES[cur].ic + ' ' + SCENES[cur].name + '</span>';
}
$("acts").addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (!b) return; ac(); const k = b.dataset.a;
  if (S.add && S.seq.length < 3 && S.seq[S.seq.length - 1] !== k) S.seq.push(k); else if (!S.add) S.seq = [k];
  S.fast = false; S.t0 = performance.now(); particles.length = 0; renderControls(); step(3); say(ACTS[k].say); sfx(k); ev("animate", "act-" + k); });
$("scenes").addEventListener("click", e => { const b = e.target.closest("[data-sc]"); if (!b) return; S.scene = b.dataset.sc; S.sceneSet = true; renderControls(); ev("animate", "scene-" + S.scene); });
$("addMode").onclick = () => { S.add = !S.add; $("addMode").setAttribute("aria-pressed", S.add); };
$("music").onclick = () => { S.music = !S.music; $("music").setAttribute("aria-pressed", S.music); if (S.music) musicStart(); else musicStop(); };

/* ---------- מילים → תנועות ---------- */
/* מילים מדויקות (אחרי הורדת אותיות שימוש ו/ש/ה/ל/ב/כ/מ מתחילת המילה) */
const WORDS = {
  jump: ["קופץ", "קופצת", "קופצים", "יקפוץ", "תקפוץ", "לקפוץ", "קפיצה", "קפיצות", "קפוץ", "יקפץ", "תקפץ", "קנגורו", "קפץ", "קפצה"],
  run: ["רץ", "רצה", "רצים", "ירוץ", "תרוץ", "לרוץ", "ריצה", "מהר", "רוץ"],
  walk: ["הולך", "הולכת", "הולכים", "ללכת", "ילך", "תלך", "הליכה", "צועד", "צועדת", "יצעד", "לטייל", "מטייל", "מטיילת", "יטייל", "תטייל", "טיול", "לך"],
  dance: ["רוקד", "רוקדת", "רוקדים", "לרקוד", "ירקוד", "תרקוד", "ריקוד", "ריקודים", "רקד", "רקדה", "דיסקו", "מסיבה", "ירקד", "תרקד", "רקוד"],
  wave: ["שלום", "ביי", "היי", "נפנוף", "מנפנף", "מנופף", "מנופפת", "ינופף", "תנופף", "לנופף", "לנפנף", "ינפנף", "תנפנף", "נופף"],
  fly: ["עף", "עפה", "עפים", "לעוף", "יעוף", "תעוף", "טס", "טסה", "לטוס", "יטוס", "תטוס", "מעופף", "כנפיים", "ציפור", "מטוס", "שמיים", "שמים", "בשמיים", "עוף"],
  swim: ["שוחה", "שוחים", "שחה", "לשחות", "ישחה", "תשחה", "שחייה", "שחיה", "צולל", "צוללת", "לצלול", "יצלול", "דג", "דגים"],
  spin: ["מסתובב", "מסתובבת", "להסתובב", "יסתובב", "תסתובב", "סיבוב", "סיבובים", "סביבון", "סחרחורת", "מתסובב"],
  sleep: ["ישן", "ישנה", "לישון", "יישן", "תישן", "שינה", "נרדם", "נרדמת", "יירדם", "עייף", "עייפה", "חולם", "נוחר", "לנמנם", "מנמנם"],
  grow: ["גדל", "גדלה", "יגדל", "תגדל", "לגדול", "ענק", "מתנפח", "מתנפחת", "יתנפח", "תתנפח", "להתנפח", "בלון", "מתכווץ", "גדול"],
  laugh: ["צוחק", "צוחקת", "לצחוק", "יצחק", "תצחק", "צחוק", "מצחיק", "חחח", "חחחח", "דגדוג", "מתפקע"],
  roll: ["מתגלגל", "מתגלגלת", "להתגלגל", "יתגלגל", "תתגלגל", "גלגול", "גלגולים", "כדור", "מתהפך"],
  sing: ["שר", "שרה", "שרים", "לשיר", "ישיר", "תשיר", "שיר", "שירים", "שירה", "מנגן", "מוזיקה", "זמר", "זמרת", "לזמר"]
};
const SCENE_W = {sea: ["ים", "מים", "בריכה", "אוקיינוס", "דגים"], space: ["חלל", "כוכב", "כוכבים", "ירח", "רקטה", "אסטרונאוט", "חללית"], forest: ["יער", "עצים", "עץ", "גונגל", "ג'ונגל", "טבע"],
  stage: ["במה", "הופעה", "מסיבה", "דיסקו"], night: ["לילה", "חושך", "חשוך"], garden: ["גינה", "גן", "דשא", "פרחים", "שמש", "פארק", "חוץ"]};
const PREF = "ושהלבכמ";
const forms = w => { const f = [w]; if (w.length > 2 && PREF.indexOf(w[0]) > -1) { f.push(w.slice(1)); if (w.length > 3 && PREF.indexOf(w[1]) > -1) f.push(w.slice(2)); } return f; };
function parse(text){
  const clean = String(text || "").replace(/[֑-ׇ]/g, "").replace(/[.,!?;:"״׳]/g, " ").replace(/\s+/g, " ").trim();
  const words = clean.split(" ");
  const acts = []; let fast = false, scene = null;
  if (/לילה טוב/.test(clean)) acts.push("sleep");
  words.forEach(w => {
    const fs = forms(w);
    for (const k in WORDS) if (fs.some(f => WORDS[k].indexOf(f) > -1)) {
      let a = k; if (k === "run") { a = "walk"; fast = true; }
      if (acts.indexOf(a) < 0 && acts.length < 3) acts.push(a);
      break;
    }
    if (!scene) for (const k in SCENE_W) if (fs.some(f => SCENE_W[k].indexOf(f) > -1)) { scene = k; break; }
  });
  if (!acts.length && scene === "space") acts.push("fly");
  if (!acts.length && scene === "sea") acts.push("swim");
  return {acts, scene, fast};
}
function apply(text, how){
  const r = parse(text);
  $("heard").textContent = text ? "שמעתי: \"" + text + "\"" : "";
  if (!r.acts.length && !r.scene) { say("לֹא הֵבַנְתִּי. נְנַסֶּה שׁוּב? אֶפְשָׁר גַּם לִלְחֹץ עַל הַתְּמוּנוֹת"); $("heard").textContent += " · לא הבנתי 🙈 נסו שוב, או לחצו על התמונות למטה"; ev("animate", "voice-miss"); return; }
  if (r.acts.length) { S.seq = r.acts; S.fast = r.fast; }
  if (r.scene) { S.scene = r.scene; S.sceneSet = true; }
  S.t0 = performance.now(); particles.length = 0; renderControls(); step(3);
  const nm = charName();
  say((nm ? nm + ": " : "") + S.seq.map(k => ACTS[k].say).join(" וְאָז ") + (r.scene ? " " + SCENES[sceneFor(S.seq)].name : ""));
  sfx(S.seq[0]); ev("animate", how + "-ok");
}
$("typeF").addEventListener("submit", e => { e.preventDefault(); ac(); apply($("typeI").value, "type"); });
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
$("mic").onclick = () => {
  ac();
  if (!SR) { $("heard").textContent = "במכשיר הזה אין זיהוי דיבור 🙈 כתבו במילים, או לחצו על התמונות"; say("לוֹחֲצִים עַל הַתְּמוּנוֹת"); ev("animate", "voice-none"); return; }
  if (rec) { try { rec.stop(); } catch(e) {} return; }
  try {
    musicStop();
    rec = new SR(); rec.lang = "he-IL"; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = false;
    let best = "";
    rec.onresult = e => { let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript + " "; best = s.trim(); $("heard").textContent = "🎧 " + best;
      /* אם החלופה הראשונה לא הבינה – מנסים את האחרות */
      const last = e.results[e.results.length - 1]; if (last.isFinal) { for (let a = 0; a < last.length; a++) { if (parse(last[a].transcript).acts.length) { best = last[a].transcript; break; } } } };
    rec.onerror = e => { $("heard").textContent = e.error === "not-allowed" || e.error === "service-not-allowed" ? "צריך לאשר מיקרופון 🎤 – או לכתוב / ללחוץ על התמונות" : "לא שמעתי 🙉 נסו שוב קרוב לטלפון"; };
    rec.onend = () => { $("mic").classList.remove("on"); $("micTxt").textContent = "לוחצים ואומרים מה הוא יעשה"; rec = null; if (best) apply(best, "voice"); if (S.music) musicStart(); };
    rec.start(); $("mic").classList.add("on"); $("micTxt").textContent = "מקשיב… מדברים עכשיו 👂"; ev("animate", "voice");
  } catch(e) { rec = null; $("heard").textContent = "המיקרופון לא נפתח 🙈 כתבו או לחצו על התמונות"; }
};

/* =====================================================================
   9. סרטון
   ===================================================================== */
function pickMime(){
  if (!window.MediaRecorder) return null;
  const L = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  for (const m of L) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch(e) {} }
  return "";
}
async function makeVideo(){
  if (S.recording || !S.sticker) return;
  const mime = pickMime();
  if (mime === null || !stage.captureStream) { alert("הדפדפן הזה לא יודע לעשות סרטון 🙈 נסו בכרום או בספארי מעודכן. בינתיים אפשר לשמור את הציור המגניב."); ev("animate", "video-unsupported"); return; }
  ac(); musicStop();
  try { await document.fonts.load("700 40px Fredoka"); await document.fonts.load("700 30px Assistant"); } catch(e) {}
  S.recording = true; particles.length = 0;
  $("makeVid").disabled = true; $("recTag").hidden = false;
  const vs = stage.captureStream(30);
  let stream = vs;
  try { if (!REC_DEST) { REC_DEST = AC.createMediaStreamDestination(); MASTER.connect(REC_DEST); } stream = new MediaStream([...vs.getVideoTracks(), ...REC_DEST.stream.getAudioTracks()]); } catch(e) {}
  const chunks = [];
  let mr;
  try { mr = new MediaRecorder(stream, mime ? {mimeType: mime, videoBitsPerSecond: 4000000} : {videoBitsPerSecond: 4000000}); }
  catch(e) { try { mr = new MediaRecorder(stream); } catch(e2) { S.recording = false; $("makeVid").disabled = false; $("recTag").hidden = true; alert("לא הצלחנו להתחיל סרטון 🙈"); return; } }
  mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  const total = INTRO + S.seq.length * ACT_DUR + OUTRO;
  const stopped = new Promise(r => mr.onstop = r);
  if (S.music) musicStart();
  mr.start(250);
  const start = performance.now(); let last = start, fxTimes = {};
  await new Promise(resolve => {
    const tick = now => {
      const T = (now - start) / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
      if (T >= total) { frame(sctx, total - .001, dt, "video"); resolve(); return; }
      frame(sctx, T, dt, "video");
      const ai = Math.floor((T - INTRO) / ACT_DUR); if (T > INTRO && ai < S.seq.length && !fxTimes[ai]) { fxTimes[ai] = 1; sfx(S.seq[ai]); }
      $("recTxt").textContent = "מצלמים… " + Math.ceil(total - T);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await wait(300);
  mr.stop(); await stopped;
  if (!S.music) musicStop(); else { musicStop(); }
  S.recording = false; $("makeVid").disabled = false; $("recTag").hidden = true; S.t0 = performance.now();
  const type = (mr.mimeType || mime || "video/webm").split(";")[0];
  const blob = new Blob(chunks, {type});
  if (!blob.size) { alert("הסרטון יצא ריק 🙈 נסו שוב"); return; }
  if (S.vidURL) URL.revokeObjectURL(S.vidURL);
  S.vidBlob = blob; S.vidExt = /mp4/.test(type) ? "mp4" : "webm"; S.vidURL = URL.createObjectURL(blob);
  const v = $("vid"); v.src = S.vidURL;
  const fname = "booqli-" + (charName() || "animated").replace(/[^\w֐-׿-]+/g, "-") + "." + S.vidExt;
  $("dlVid").href = S.vidURL; $("dlVid").download = fname; S.vidName = fname;
  setupShare();
  show("sRes"); step(4); say(SAY.res); ev("animate", "video-" + S.vidExt + "-" + S.seq.join("+"));
  try { v.play().catch(() => {}); } catch(e) {}
  if (S.music) musicStart();
}
$("makeVid").onclick = makeVideo;
function canShareFile(file){ try { return !kidLock() && navigator.canShare && navigator.canShare({files: [file]}); } catch(e) { return false; } }
function setupShare(){
  const f = new File([S.vidBlob], S.vidName, {type: S.vidBlob.type});
  const ok = canShareFile(f);
  $("shareVid").hidden = !ok;
  $("shareNote").innerHTML = kidLock() ? "🔒 במצב ילדים אפשר להוריד את הסרטון. שליחה בוואטסאפ – אצל ההורים (יוצאים ממצב ילדים)."
    : ok ? "בחלון שנפתח בוחרים <b>וואטסאפ</b> ושולחים לסבא וסבתא, או <b>\"שמירת סרטון\"</b> כדי שיישמר בגלריה."
    : "לוחצים \"להוריד\", ואז בוואטסאפ מצרפים את הסרטון מהקבצים (📎)." + (S.vidExt === "webm" ? " בדפדפן הזה הסרטון יוצא בפורמט webm – לסרטון שנשלח הכי חלק בוואטסאפ, פתחו את האתר בכרום מעודכן או בספארי באייפון." : "");
}
$("shareVid").onclick = async () => {
  if (!S.vidBlob) return;
  const f = new File([S.vidBlob], S.vidName, {type: S.vidBlob.type});
  try { await navigator.share({files: [f], text: GAN ? $("gMsg").value : "תראו מה הציור שלי עושה! 🪄 נוצר בחינם ב-games.booqli.ai/kids/animate"}); ev("animate", GAN ? "gan-share-video" : "share-video"); } catch(e) {}
};
$("dlVid").addEventListener("click", () => ev("animate", "download-video"));
$("again").onclick = () => { show("sMain"); step(3); };
$("newPic").onclick = $("newPic2").onclick = () => { show("s1"); step(1); };
$("bookL").href = typeof siteOrderLink === "function" ? siteOrderLink("kids-animate", "video") : "https://games.booqli.ai/savta/";

/* ---------- הציור המגניב / כרטיס לזיכרון (1080×1350) ---------- */
async function poster(){
  try { await document.fonts.load("700 40px Fredoka"); } catch(e) {}
  const c = mk(1080, 1350), x = c.getContext("2d");
  x.save(); x.scale(1080 / W, 1350 / H); drawScene(x, sceneFor(S.seq), 2); x.restore();
  const s = S.sticker, k = Math.min(1080 * .78 / s.width, 1350 * (GAN ? .56 : .62) / s.height), w = s.width * k, h = s.height * k;
  x.drawImage(s, 540 - w / 2, 1350 * .83 - h, w, h);
  x.font = "700 64px Fredoka, Assistant, sans-serif"; x.textAlign = "center"; x.direction = "rtl";
  const t = (charName() || "הַצִּיּוּר שֶׁלִּי") + " ✨", tw = Math.min(1040, x.measureText(t).width + 80);
  x.fillStyle = "rgba(255,255,255,.95)"; x.beginPath(); x.roundRect ? x.roundRect(540 - tw / 2, 50, tw, 104, 52) : x.rect(540 - tw / 2, 50, tw, 104); x.fill();
  x.fillStyle = "#C5309A"; x.fillText(t, 540, 126, 1000);
  const lines = []; if (kidName()) lines.push("צִיֵּר/ה: " + kidName()); if (ganLine()) lines.push(ganLine());
  x.font = "700 42px Assistant, sans-serif"; x.lineWidth = 9; x.strokeStyle = "rgba(43,21,38,.6)"; x.fillStyle = "#fff";
  lines.forEach((l, i) => { x.strokeText(l, 540, 214 + i * 56, 1000); x.fillText(l, 540, 214 + i * 56, 1000); });
  x.fillStyle = "rgba(78,133,118,.94)"; x.fillRect(0, 1350 - 84, 1080, 84); x.fillStyle = "#fff"; x.font = "700 34px Assistant, sans-serif"; x.fillText("🎁 נוצר בחינם באתר games.booqli.ai", 540, 1350 - 30);
  return c;
}
const safeName = (ext) => "booqli-" + ((kidName() ? kidName() + "-" : "") + (charName() || "drawing")).replace(/[^\w֐-׿-]+/g, "-") + "." + ext;
async function giveFile(blob, name, text){
  const f = new File([blob], name, {type: blob.type});
  if (canShareFile(f)) { try { await navigator.share(text ? {files: [f], text} : {files: [f]}); return true; } catch(e) { if (e && e.name === "AbortError") return true; } }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  return false;
}
$("savePic").onclick = async () => {
  if (!S.sticker) return;
  const c = await poster(); ev("animate", "save-pic");
  c.toBlob(b => giveFile(b, safeName("png")), "image/png");
};

/* ---------- GIF מונפש (מקודד בדפדפן, 320×400, 10 תמונות בשנייה, התנועה הראשונה) ---------- */
function gifEncode(frames, w, h, delay){
  /* פלטה קבועה 6×7×6 + דיתור מסודר */
  const pal = new Uint8Array(768); let n = 0;
  for (let r = 0; r < 6; r++) for (let g = 0; g < 7; g++) for (let b = 0; b < 6; b++) { pal[n * 3] = r * 51; pal[n * 3 + 1] = Math.round(g * 42.5); pal[n * 3 + 2] = b * 51; n++; }
  const BY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const out = []; const B = v => out.push(v & 255); const W16 = v => { B(v); B(v >> 8); };
  "GIF89a".split("").forEach(ch => B(ch.charCodeAt(0)));
  W16(w); W16(h); B(0xF7); B(0); B(0); for (let i = 0; i < 768; i++) B(pal[i]);
  [0x21, 0xFF, 0x0B].forEach(B); "NETSCAPE2.0".split("").forEach(ch => B(ch.charCodeAt(0))); [3, 1, 0, 0, 0].forEach(B);
  const idx = new Uint8Array(w * h);
  for (const d of frames) {
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
      const t = BY[(y & 3) * 4 + (x & 3)] / 16 - .5, j = i * 4;
      const r = clamp(Math.round(d[j] / 51 + t), 0, 5), g = clamp(Math.round(d[j + 1] / 42.5 + t), 0, 6), b = clamp(Math.round(d[j + 2] / 51 + t), 0, 5);
      idx[i] = r * 42 + g * 6 + b;
    }
    [0x21, 0xF9, 4, 0].forEach(B); W16(delay); B(0); B(0);
    B(0x2C); W16(0); W16(0); W16(w); W16(h); B(0);
    const minSize = 8; B(minSize);
    /* LZW */
    const clear = 1 << minSize, eoi = clear + 1; let size = minSize + 1, next = eoi + 1, table = new Map();
    let acc = 0, bits = 0; const blk = [];
    const emit = code => { acc |= code << bits; bits += size; while (bits >= 8) { blk.push(acc & 255); acc >>>= 8; bits -= 8; } };
    emit(clear); let pre = idx[0];
    for (let i = 1; i < idx.length; i++) {
      const k = idx[i], key = pre * 256 + k, v = table.get(key);
      if (v !== undefined) { pre = v; continue; }
      emit(pre);
      if (next === 4096) { emit(clear); next = eoi + 1; size = minSize + 1; table = new Map(); }
      else { if (next >= (1 << size)) size++; table.set(key, next++); }
      pre = k;
    }
    emit(pre); emit(eoi); if (bits > 0) blk.push(acc & 255);
    for (let i = 0; i < blk.length; i += 255) { const len = Math.min(255, blk.length - i); B(len); for (let j = 0; j < len; j++) out.push(blk[i + j]); }
    B(0);
  }
  B(0x3B);
  return new Uint8Array(out);
}
async function makeGif(){
  if (!S.sticker || S.recording) return null;
  try { await document.fonts.load("700 40px Fredoka"); } catch(e) {}
  S.recording = true; particles.length = 0;
  const big = mk(W, H), bx = big.getContext("2d"), GW = 320, GH = 400, sm = mk(GW, GH), sx = sm.getContext("2d", {willReadFrequently: true});
  const frames = [], fps = 10, n = Math.round(ACT_DUR * fps), keep = S.seq;
  S.seq = [keep[0]];
  for (let i = 0; i < n; i++) {
    frame(bx, i / fps, 1 / fps, "live"); footer(bx, 0);
    sx.drawImage(big, 0, 0, GW, GH); frames.push(sx.getImageData(0, 0, GW, GH).data);
    if (i % 6 === 5) await wait(0);
  }
  S.seq = keep; S.recording = false; S.t0 = performance.now(); particles.length = 0;
  return new Blob([gifEncode(frames, GW, GH, 10)], {type: "image/gif"});
}

/* ---------- מצב גננת: מתנה להורים ---------- */
let gBlob = null, gName = "", msgDirty = false;
const today = () => { const d = new Date(); return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear(); };
const ganMsg = () => { const kid = kidName() || "הילד/ה", what = charName() || "ציור", gan = ($("gGan").value || "").trim();
  return "הורים יקרים 💕\nהיום " + kid + " צייר/ה " + what + " – והציור קם לחיים! 🪄\nמתנה קטנה " + (gan ? "מ" + gan : "מהגן") + " (" + ($("gDate").value || today()) + ").\n✨ נוצר בחינם ב-games.booqli.ai"; };
function ganInit(){
  if (!GAN) return;
  document.body.classList.add("gan-mode"); $("ganBox").hidden = false;
  document.querySelector(".an-hero h1").textContent = "מַנְפִּישִׁים אֶת הַצִּיּוּרִים שֶׁל הַיְּלָדִים";
  document.querySelector(".an-hero p").textContent = "מצלמים את הציור של כל ילד – והוא קופץ, רוקד ועף 🪄 ושולחים להורים מתנה: כרטיס עם השם, התאריך ומה צייר, GIF מונפש או סרטון.";
  $("gDate").value = today();
  try { $("gGan").value = localStorage.getItem("booqli_gan_name") || ""; } catch(e) {}
  const upd = () => { if (!msgDirty) $("gMsg").value = ganMsg(); };
  ["gKid", "gWhat", "gDate", "gGan"].forEach(id => $(id).addEventListener("input", upd));
  $("gGan").addEventListener("change", () => { try { localStorage.setItem("booqli_gan_name", $("gGan").value.trim()); } catch(e) {} });
  $("gMsg").addEventListener("input", () => msgDirty = true);
  upd();
  const showOut = (blob, name, url) => { gBlob = blob; gName = name; $("gOut").hidden = false; $("gImg").src = url; $("gDl").href = url; $("gDl").download = name;
    $("gShare").hidden = !canShareFile(new File([blob], name, {type: blob.type})); try { $("gOut").scrollIntoView({behavior: "smooth", block: "center"}); } catch(e) {} };
  $("gCard").onclick = async () => { if (!S.sticker) return; const c = await poster(); c.toBlob(b => showOut(b, safeName("png"), URL.createObjectURL(b)), "image/png"); ev("animate", "gan-card"); };
  $("gGif").onclick = async () => { const done = busy("מכינים GIF…"); await wait(50); let b = null; try { b = await makeGif(); } catch(e) {} done();
    if (!b) { alert("לא הצלחנו להכין GIF 🙈"); return; } showOut(b, safeName("gif"), URL.createObjectURL(b)); ev("animate", "gan-gif"); };
  $("gVid").onclick = () => { ev("animate", "gan-video"); makeVideo(); };
  $("gShare").onclick = async () => { if (gBlob) { await giveFile(gBlob, gName, $("gMsg").value); ev("animate", "gan-share"); } };
  $("gMsgBtn").onclick = () => { window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent($("gMsg").value), "_blank", "noopener"); ev("animate", "gan-msg"); };
  $("gCopy").onclick = async () => { try { await navigator.clipboard.writeText($("gMsg").value); $("gCopy").textContent = "✔️ הועתק"; setTimeout(() => $("gCopy").textContent = "📋 להעתיק", 1500); } catch(e) {} };
  $("gNext").onclick = () => { $("gKid").value = ""; $("gWhat").value = ""; msgDirty = false; upd(); $("gOut").hidden = true; gBlob = null; show("s1"); step(1); ev("animate", "gan-next"); };
  ev("animate", "gan-open");
}
ganInit();

/* ---------- הקראות ---------- */
document.querySelectorAll("[data-say]").forEach(b => b.onclick = () => say(SAY[b.dataset.say]));
$("sayHi").onclick = () => say(SAY.hi);
["nmChar", "nmKid"].forEach(id => $(id).addEventListener("change", () => ev("animate", "named")));
document.addEventListener("pointerdown", () => { if (S.music && S.sticker && !mus && !S.recording && !rec) musicStart(); }, {once: false, passive: true});
document.addEventListener("visibilitychange", () => { if (document.hidden) musicStop(); });

/* בדיקות: ?demo=1 טוען את הציור לדוגמה */
if (/[?&]demo=1/.test(location.search)) setTimeout(() => $("bSample").click(), 300);
window.BQA = {S, parse, extract, buildSticker, frame, makeVideo, ACTS, SCENES};
requestAnimationFrame(loop);
ev("animate", "open");
try { siteJoinLinks(); } catch(e) {}
})();
