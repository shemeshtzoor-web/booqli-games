/* בדיקת תמונה לפני שליחה (שמש, 7.11.2026: "רק פרצוף אחד בתמונה, שאין בעלי חיים").
   הכל רץ בתוך הטלפון של הלקוח – התמונה לא יוצאת לשום מקום. חינמי: MediaPipe של גוגל (Apache-2.0).
   הקוד וה-wasm אצלנו ב-lib/mediapipe/ (גרסה 0.10.21). המודלים (פנים ~0.2MB, חפצים ~4.4MB) נטענים מ-storage.googleapis.com
   (גוגל, רשמי) – במעבר לשרת אחר אפשר להעתיק אותם ל-lib/mediapipe/ ולשנות את MODELS למטה.
   זו אזהרה ולא חסימה: הכלי יכול לטעות, והלקוח תמיד יכול "להשאיר בכל זאת". אם משהו נכשל – פשוט לא מזהירים.
   שימוש: bqPhotoCheck(blob) → Promise<[{code, msg}]> (מערך ריק = הכל טוב). bqPhotoCheck.warm() – להתחיל לטעון מראש. */
(function(){
  const BASE = (document.currentScript && document.currentScript.src || location.href).replace(/[^/]*$/, "") + "mediapipe/";
  const MODELS = {
    face: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
    obj: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite"
  };
  const ANIMALS = {bird: "🐦", cat: "🐱", dog: "🐶", horse: "🐴", sheep: "🐑", cow: "🐮", elephant: "🐘", bear: "🐻", zebra: "🦓", giraffe: "🦒"};
  let ready = null;
  function load(){
    if (!ready) ready = (async () => {
      const V = await import(BASE + "vision_bundle.mjs");
      const fs = await V.FilesetResolver.forVisionTasks(BASE.replace(/\/$/, ""));
      const opt = (m) => ({baseOptions: {modelAssetPath: m, delegate: "CPU"}, runningMode: "IMAGE"});
      const [face, obj] = await Promise.all([
        V.FaceDetector.createFromOptions(fs, Object.assign(opt(MODELS.face), {minDetectionConfidence: 0.5})),
        V.ObjectDetector.createFromOptions(fs, Object.assign(opt(MODELS.obj), {scoreThreshold: 0.35, maxResults: 12}))
      ]);
      return {face, obj};
    })().catch(e => { ready = null; throw e; });
    return ready;
  }
  /* תמונה קטנה (עד 640) לבדיקה – מהיר, ומספיק לזיהוי */
  async function toCanvas(blob){
    const bmp = await (window.createImageBitmap ? createImageBitmap(blob) : new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = URL.createObjectURL(blob); }));
    const w0 = bmp.width || bmp.naturalWidth, h0 = bmp.height || bmp.naturalHeight, k = Math.min(1, 640 / Math.max(w0, h0));
    const c = document.createElement("canvas"); c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); if (bmp.close) bmp.close();
    return c;
  }
  /* בהירות + חדות (שונות של לפלסיאן) באזור הפנים */
  function quality(c, box){
    const x = Math.max(0, Math.floor(box ? box.originX : 0)), y = Math.max(0, Math.floor(box ? box.originY : 0));
    const w = Math.min(c.width - x, Math.floor(box ? box.width : c.width)), h = Math.min(c.height - y, Math.floor(box ? box.height : c.height));
    if (w < 8 || h < 8) return {light: 128, sharp: 999};
    const d = c.getContext("2d").getImageData(x, y, w, h).data, g = new Float32Array(w * h);
    let sum = 0; for (let i = 0; i < w * h; i++) { const v = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; g[i] = v; sum += v; }
    let n = 0, m = 0, m2 = 0;
    for (let yy = 1; yy < h - 1; yy++) for (let xx = 1; xx < w - 1; xx++) { const i = yy * w + xx, L = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w]; n++; m += L; m2 += L * L; }
    m /= n; return {light: sum / (w * h), sharp: m2 / n - m * m, size: w};
  }
  async function check(blob){
    const t0 = performance.now();
    const {face, obj} = await load();
    const c = await toCanvas(blob);
    const faces = face.detect(c).detections || [], objs = obj.detect(c).detections || [];
    const cat = d => d.categories && d.categories[0] || {};
    const people = objs.filter(d => cat(d).categoryName === "person" && cat(d).score >= 0.5).length;
    const animals = [...new Set(objs.filter(d => ANIMALS[cat(d).categoryName] && cat(d).score >= 0.4).map(d => cat(d).categoryName))];
    const out = [];
    if (!faces.length) out.push({code: "noface", msg: "😕 לא מצאנו פנים בתמונה. עדיף תמונה שבה רואים טוב את הפנים, מקדימה."});
    else if (faces.length > 1 || people > 1) out.push({code: "many", msg: "👥 נראה שיש בתמונה יותר מאדם אחד. עדיף תמונה שבה רק הילד/ה."});
    if (animals.length) out.push({code: "animal", msg: `${animals.map(a => ANIMALS[a]).join("")} נראה שיש בתמונה גם בעל חיים. עדיף תמונה שבה רק הילד/ה.`});
    if (faces.length === 1) {
      const b = faces[0].boundingBox, rel = b.width / c.width;
      if (rel < 0.11) out.push({code: "small", msg: "🔍 הפנים קטנות בתמונה (צולם מרחוק). עדיף תמונה מקרוב יותר."});
      const q = quality(c, b);
      if (q.light < 55) out.push({code: "dark", msg: "🌙 התמונה חשוכה. עדיף תמונה באור טוב."});
      else if (q.sharp < 18 && q.size >= 60) out.push({code: "blur", msg: "💧 התמונה נראית מטושטשת. עדיף תמונה חדה."});
    }
    window.bqPhotoCheck.last = {ms: Math.round(performance.now() - t0), faces: faces.length, people, animals, objs: objs.map(d => cat(d).categoryName + ":" + (cat(d).score || 0).toFixed(2))};
    return out;
  }
  window.bqPhotoCheck = blob => check(blob).catch(e => { window.bqPhotoCheck.err = String(e && e.message || e); return []; });
  window.bqPhotoCheck.warm = () => { load().catch(() => {}); };
})();
