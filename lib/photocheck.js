/* בדיקת תמונה לפני שליחה (שמש, 7.11.2026: "רק פרצוף אחד בתמונה, שאין בעלי חיים").
   הכל רץ בתוך הטלפון של הלקוח – התמונה לא יוצאת לשום מקום. חינמי ואצלנו באתר: lib/human/
   (Human 3.3.6, MIT – גלאי פנים BlazeFace ~0.6MB + גלאי חפצים CenterNet ~4.2MB, 80 סוגים כולל אנשים ובעלי חיים).
   זו אזהרה ולא חסימה: הכלי יכול לטעות, והלקוח תמיד יכול "להשאיר בכל זאת". אם משהו נכשל – פשוט לא מזהירים.
   שימוש: bqPhotoCheck(blob) → Promise<[{code, msg}]> (ריק = הכל טוב) · bqPhotoCheck.warm() – להתחיל לטעון מראש
   · bqPhotoCheck.last – מה נמצא בבדיקה האחרונה (לבדיקות). */
(function(){
  const BASE = (document.currentScript && document.currentScript.src || location.href).replace(/[^/]*$/, "") + "human/";
  const ANIMALS = {bird: "🐦", cat: "🐱", dog: "🐶", horse: "🐴", sheep: "🐑", cow: "🐮", elephant: "🐘", bear: "🐻", zebra: "🦓", giraffe: "🦒"};
  let ready = null;
  const script = src => new Promise((ok, no) => { if (window.Human) return ok(); const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  function load(){
    if (!ready) ready = (async () => {
      await script(BASE + "human.js");
      const H = window.Human && (window.Human.Human || window.Human.default || window.Human);
      const h = new H({
        modelBasePath: BASE, backend: "webgl", debug: false, cacheSensitivity: 0, warmup: "none",
        filter: {enabled: false}, gesture: {enabled: false}, body: {enabled: false}, hand: {enabled: false}, segmentation: {enabled: false},
        face: {enabled: true, detector: {modelPath: "blazeface.json", rotation: false, maxDetected: 6, minConfidence: 0.45, return: false},
          mesh: {enabled: false}, iris: {enabled: false}, description: {enabled: false}, emotion: {enabled: false}, antispoof: {enabled: false}, liveness: {enabled: false}, attention: {enabled: false}},
        object: {enabled: true, modelPath: "centernet.json", minConfidence: 0.3, maxDetected: 12}
      });
      await h.load(); return h;
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
  function quality(c, b){
    const x = Math.max(0, Math.floor(b[0])), y = Math.max(0, Math.floor(b[1])), w = Math.min(c.width - x, Math.floor(b[2])), h = Math.min(c.height - y, Math.floor(b[3]));
    if (w < 8 || h < 8) return {light: 128, sharp: 999, size: w};
    const d = c.getContext("2d").getImageData(x, y, w, h).data, g = new Float32Array(w * h);
    let sum = 0; for (let i = 0; i < w * h; i++) { const v = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; g[i] = v; sum += v; }
    let n = 0, m = 0, m2 = 0;
    for (let yy = 1; yy < h - 1; yy++) for (let xx = 1; xx < w - 1; xx++) { const i = yy * w + xx, L = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w]; n++; m += L; m2 += L * L; }
    m /= n; return {light: sum / (w * h), sharp: m2 / n - m * m, size: w};
  }
  const animals0 = objs => objs.some(o => ANIMALS[o.label] && o.score >= 0.3);
  /* תור: בודקים תמונה אחת בכל פעם (חוסך זיכרון בטלפון) */
  let queue = Promise.resolve();
  async function check(blob){
    const t0 = performance.now(), h = await load(), c = await toCanvas(blob);
    const r = await h.detect(c);
    const sc = f => f.boxScore || f.score || 0, faces = (r.face || []).filter(f => sc(f) >= 0.45).sort((a, b) => sc(b) - sc(a)), objs = r.object || [];
    const people = objs.filter(o => o.label === "person" && o.score >= 0.5).length;
    const animals = [...new Set(objs.filter(o => ANIMALS[o.label] && o.score >= 0.4).map(o => o.label))];
    const out = [];
    if (!faces.length) out.push({code: "noface", short: "לא רואים פנים", msg: "😕 לא מצאנו פנים בתמונה. עדיף תמונה שבה רואים טוב את הפנים, מקדימה."});
    else if (people > 1 || (faces.length > 1 && faces[1] && (faces[1].boxScore || faces[1].score || 0) >= 0.5)) out.push(people > 1 || !animals0(objs)
      ? {code: "many", short: "יותר מאדם אחד", msg: "👥 נראה שיש בתמונה יותר מאדם אחד. עדיף תמונה שבה רק הילד/ה."}
      : {code: "many", short: "עוד פנים בתמונה", msg: "👀 נראה שיש בתמונה עוד פנים (אולי של בעל חיים). עדיף תמונה שבה רק הילד/ה."});
    if (animals.length) out.push({code: "animal", short: "בעל חיים בתמונה", msg: `${animals.map(a => ANIMALS[a]).join("")} נראה שיש בתמונה גם בעל חיים. עדיף תמונה שבה רק הילד/ה.`});
    let q = null, pose = null;
    if (faces.length && !out.some(o => o.code === "many")) {
      const b = faces[0].box; q = quality(c, b);
      /* (שמש, 7.11.2026) מבט ישר למצלמה – לא הצידה, לא למטה, לא למעלה. לפי 6 נקודות של BlazeFace:
         yaw = כמה האף זז מאמצע העיניים (ביחס למרחק בין העיניים), ear = יחס המרחק אף–אוזן בשני הצדדים (1 = ישר, 0 = פרופיל),
         pitch = איפה האף בין העיניים לפה. כויל על 90+ תמונות: ישר למצלמה – |yaw|≤0.17, ear≥0.45; ראש מסובב – ear<0.3 או |yaw|>0.25.
         למטה/למעלה פחות מדויק – רק קצוות. מבט של העיניים בלבד (ראש ישר) – לא מזוהה. */
      const a = faces[0].annotations, P = k => a && a[k] && a[k][0];
      if (sc(faces[0]) >= 0.6 && P("leftEye") && P("rightEye") && P("nose") && P("mouth")) {
        const le = P("leftEye"), re = P("rightEye"), n = P("nose"), m = P("mouth"), mx = (le[0] + re[0]) / 2, my = (le[1] + re[1]) / 2, ed = Math.hypot(le[0] - re[0], le[1] - re[1]) || 1;
        const yaw = (n[0] - mx) / ed, pitch = (n[1] - my) / ((m[1] - my) || 1);
        let ear = 1; if (P("leftEar") && P("rightEar")) { const x1 = Math.abs(n[0] - P("leftEar")[0]), x2 = Math.abs(n[0] - P("rightEar")[0]); ear = Math.min(x1, x2) / (Math.max(x1, x2) || 1); }
        pose = {yaw: +yaw.toFixed(2), pitch: +pitch.toFixed(2), ear: +ear.toFixed(2)};
        if (ear < 0.3 || Math.abs(yaw) > 0.25) out.push({code: "side", short: "לא מסתכל/ת למצלמה", msg: "👀 נראה שהילד/ה מסתכל/ת הצידה. עדיף תמונה שבה הילד/ה מסתכל/ת ישר למצלמה – לא הצידה, לא למטה ולא למעלה."});
        else if (pitch < 0.25 || pitch > 0.8) out.push({code: "updown", short: "לא מסתכל/ת למצלמה", msg: "👀 נראה שהילד/ה מסתכל/ת למטה או למעלה. עדיף תמונה שבה הילד/ה מסתכל/ת ישר למצלמה."});
      }
      if (b[2] / c.width < 0.11 && b[3] / c.height < 0.11) out.push({code: "small", short: "הפנים קטנות מדי", msg: "🔍 הפנים קטנות בתמונה (צולם מרחוק). עדיף תמונה מקרוב יותר."});
      if (q.light < 55) out.push({code: "dark", short: "חשוך מדי", msg: "🌙 התמונה חשוכה. עדיף תמונה באור טוב."});
      else if (q.sharp < 18 && q.size >= 60) out.push({code: "blur", short: "מטושטש", msg: "💧 התמונה נראית מטושטשת. עדיף תמונה חדה."});
    }
    window.bqPhotoCheck.last = {ms: Math.round(performance.now() - t0), faces: faces.map(f => +(f.boxScore || f.score || 0).toFixed(2)), people, animals,
      objs: objs.map(o => o.label + ":" + o.score.toFixed(2)), q: q && {light: Math.round(q.light), sharp: Math.round(q.sharp)}, pose};
    return out;
  }
  window.bqPhotoCheck = blob => (queue = queue.then(() => check(blob)).catch(e => { window.bqPhotoCheck.err = String(e && e.message || e); return []; }));
  window.bqPhotoCheck.warm = () => { load().catch(() => {}); };
})();
