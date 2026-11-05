/* BOOQLI – שומר את ההזמנות מהבוט בדרייב של שמש (Google Apps Script), 4.11.2026
   מדביקים את כל הקובץ הזה ב-script.google.com (פרויקט חדש), ואז:
   1. ⚙️ הגדרות הפרויקט ← מאפייני סקריפט ← מוסיפים: SECRET = אותה מילה סודית שמודבקת ב-Cloudflare (DRIVE_KEY),
      ו-NOTIFY = המייל שאליו נשלחות ההתראות על הזמנות.
   2. פריסה ← פריסה חדשה ← סוג: אפליקציית אינטרנט ← הפעלה בתור: אני ← גישה: כל אחד ← פריסה ← מאשרים את ההרשאות.
   3. את הכתובת שמתקבלת (מסתיימת ב-/exec) מדביקים ב-Cloudflare בשם DRIVE_URL.
   מה נשמר:  BOOQLI הזמנות / "סב-1234 · רחל כהן · 04.11" / בנים|בנות / "דנה.jpg", "דנה (2).jpg" ...
              גן עם 2 נושאים: BOOQLI הזמנות / "גן-1234 · גן רימון · 04.11" / <נושא> / בנים|בנות / ...
              + "סיכום ההזמנה" (מסמך גוגל) באותה תיקייה, ומייל לבעלת החשבון עם קישור לתיקייה.
   אין כאן שום מידע פרטי: המייל נשלח לחשבון שבו הקוד רץ, והמילה הסודית שמורה במאפייני הסקריפט. */

var ROOT = "BOOQLI הזמנות";

function doPost(e) {
  try {
    var q = JSON.parse(e.postData.contents);
    if (String(q.action || "").indexOf("web") === 0) return out_(web_(q));   /* העלאה מהאתר – בלי המילה הסודית, עם בדיקות משלה (למטה) */
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || q.key !== secret) return out_({ ok: false, error: "key" });
    if (q.action === "photo") return out_(savePhoto_(q));
    if (q.action === "order") return out_(saveOrder_(q));
    if (q.action === "alert") return out_(alert_(q));
    if (q.action === "ded") return out_(saveDed_(q));
    if (q.action === "note") return out_(saveNote_(q));
    if (q.action === "trash") return out_(trash_(q));
    if (q.action === "erase") return out_(erase_(q));
    if (q.action === "ping") return out_({ ok: true, folder: root_().getUrl() });
    return out_({ ok: false, error: "action" });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

/* לאן נשלחים המיילים: מאפיין הסקריפט NOTIFY (המייל הרגיל של שמש), ואם אין – החשבון שבו הקוד רץ.
   (5.11.2026: הקוד עובר לחשבון נפרד booqliphotos – רק תמונות הזמנות, בלי שום דבר אחר – והמיילים ממשיכים להגיע לשמש) */
function notify_() { return PropertiesService.getScriptProperties().getProperty("NOTIFY") || Session.getEffectiveUser().getEmail(); }

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function root_() {
  var it = DriveApp.getRootFolder().getFoldersByName(ROOT);
  return it.hasNext() ? it.next() : DriveApp.getRootFolder().createFolder(ROOT);
}

/* תיקיית ההזמנה: מחפשים לפי מספר ההזמנה בתחילת השם; אם אין – יוצרים */
function orderFolder_(order, title) {
  var root = root_(), it = root.searchFolders("title contains '" + order.replace(/'/g, "") + "'");
  while (it.hasNext()) { var f = it.next(); if (f.getName().indexOf(order) === 0) { if (title && f.getName() !== title) f.setName(title); return f; } }
  return root.createFolder(title || order);
}

function sub_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function clean_(s) { return String(s || "").replace(/[\\\/:*?"<>|#%]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) || "ילד"; }

/* תמונה אחת: {order, title, topic?, sub: "בנים"|"בנות", name, mime, b64} */
function savePhoto_(q) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);   /* כמה תמונות באותו רגע – בלי שמות כפולים */
  try { return savePhotoIn_(q); } finally { lock.releaseLock(); }
}
function savePhotoIn_(q) {
  {
    var folder = orderFolder_(q.order, q.title), base_ = q.topic ? sub_(folder, String(q.topic).slice(0, 60)) : folder;   /* גן עם 2 נושאים: <גן>/<נושא>/בנים|בנות */
    var dir = sub_(base_, q.sub === "בנות" ? "בנות" : "בנים");
    var base = clean_(q.name), ext = /png/.test(q.mime) ? ".png" : ".jpg", name = base + ext, n = 1;
    while (dir.getFilesByName(name).hasNext()) { n++; name = base + " (" + n + ")" + ext; }   /* עוד תמונה של אותו ילד: "יוסי 1 (2).jpg" */
    var blob = Utilities.newBlob(Utilities.base64Decode(q.b64), q.mime || "image/jpeg", name);
    var file = dir.createFile(blob);
    return { ok: true, file: file.getUrl(), folder: folder.getUrl(), name: name };
  }
}

/* ===== העלאה ישר מהאתר games.booqli.ai (5.11.2026) =====
   למה כאן ולא דרך Cloudflare: סינונים (רימון / נטפרי / גלישה בטוחה בסלולר) חוסמים את workers.dev, אבל לא את גוגל.
   הדף שולח POST (text/plain, בלי preflight) עם JSON:
     webstart {kind:"private"|"gan"|"parent", who, gan, book, code, kid, consent:true} → {ok, oid, tok, code?}
     webphoto {tok, sub:"בנים"|"בנות", name, topic, mime, b64}                       → {ok, n}
     webdone  {tok, summary}                                                         → {ok, photos}
     webgan   {code}                                                                 → {ok, name, book}
   הגנות: אישור תקנון חובה, מפתח אקראי לכל הזמנה (14 יום), עד 50/300/5 תמונות (פרטי/גן/הורה), עד ~6MB לתמונה,
   עד 300 הזמנות חדשות ביום לכל האתר. האישורים של ההורים נשמרים ונכנסים לסיכום של הגן. */
var WEB_MAX = { private: 50, gan: 300, parent: 5 };
function web_(q) {
  var P = PropertiesService.getScriptProperties(), lock = LockService.getScriptLock();
  var get = function (k) { var v = P.getProperty(k); try { return v ? JSON.parse(v) : null; } catch (e) { return null; } };
  var cut = function (s, n) { return String(s || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n); };
  var day = Utilities.formatDate(new Date(), "Asia/Jerusalem", "dd.MM");
  if (q.action === "webgan") { var L = get("web_code_" + String(q.code || "").replace(/\D/g, "")); return L ? { ok: true, name: L.name, book: L.book } : { ok: false, error: "code" }; }
  if (q.action === "webstart") {
    if (q.consent !== true) return { ok: false, error: "consent" };
    lock.waitLock(20000);
    try {
      webClean_(P);
      var dk = "web_day_" + Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyyMMdd"), dn = +(P.getProperty(dk) || 0);
      if (dn >= 300) return { ok: false, error: "limit" };
      P.setProperty(dk, String(dn + 1));
      var kind = ["private", "gan", "parent"].indexOf(q.kind) >= 0 ? q.kind : "private", rec;
      if (kind === "parent") {
        var C = get("web_code_" + String(q.code || "").replace(/\D/g, ""));
        if (!C) return { ok: false, error: "code" };
        rec = { kind: kind, oid: C.oid, title: C.oid + " · " + C.name + " · " + C.day };
        var pk = "web_pc_" + C.oid, pc = get(pk) || [];
        pc.push({ who: cut(q.who, 40), kid: cut(q.kid, 30), at: Utilities.formatDate(new Date(), "Asia/Jerusalem", "dd.MM.yyyy HH:mm") });
        P.setProperty(pk, JSON.stringify(pc.slice(-60)));
      } else {
        var oid = (kind === "gan" ? "גן-" : "סב-") + (1000 + Math.floor(Math.random() * 9000)), who = cut(kind === "gan" ? q.gan : q.who, 50) || "אתר";
        rec = { kind: kind, oid: oid, title: oid + " · " + who + " · " + day };
        if (kind === "gan") {
          var c = ""; for (var i = 0; i < 30 && !c; i++) { var t = String(1000 + Math.floor(Math.random() * 9000)); if (!P.getProperty("web_code_" + t)) c = t; }
          rec.code = c; P.setProperty("web_code_" + c, JSON.stringify({ oid: oid, name: who, book: cut(q.book, 40), day: day, at: Date.now() }));
        }
      }
      rec.n = 0; rec.max = WEB_MAX[kind]; rec.at = Date.now();
      var tok = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "").slice(0, 16);
      P.setProperty("web_t_" + tok, JSON.stringify(rec));
      return { ok: true, oid: rec.oid, tok: tok, code: rec.code || "" };
    } finally { lock.releaseLock(); }
  }
  var tk = "web_t_" + String(q.tok || "").replace(/[^a-f0-9]/g, "");
  if (q.action === "webphoto") {
    if (!/^image\/(jpeg|png)$/.test(q.mime || "")) return { ok: false, error: "type" };
    var len = String(q.b64 || "").length; if (len < 2000 || len > 8500000) return { ok: false, error: "size" };
    lock.waitLock(28000);
    try {
      var R = get(tk); if (!R || Date.now() - R.at > 14 * 864e5) return { ok: false, error: "tok" };
      if (R.n >= R.max) return { ok: false, error: "max" };
      var f = savePhotoIn_({ order: R.oid, title: R.title, topic: cut(q.topic, 40), sub: q.sub === "בנות" ? "בנות" : "בנים", name: cut(q.name, 40) || "ילד", mime: q.mime, b64: q.b64 });
      R.n++; P.setProperty(tk, JSON.stringify(R));
      return { ok: true, n: R.n };
    } finally { lock.releaseLock(); }
  }
  if (q.action === "webdone") {
    var D = get(tk); if (!D) return { ok: false, error: "tok" };
    var pcs = D.kind === "gan" ? (get("web_pc_" + D.oid) || []) : [];
    var extra = pcs.length ? "\n\n👪 הורים שהעלו בעצמם ואישרו תקנון ופרטיות (" + pcs.length + "):\n" + pcs.map(function (x) { return "• " + (x.who || "הורה") + (x.kid ? " – " + x.kid : "") + " · " + x.at; }).join("\n") : "";
    var sum = String(q.summary || "").slice(0, 8000) + extra + "\n\n🌐 נשלח מהאתר games.booqli.ai · " + (D.kind === "gan" ? "גן" : D.kind === "parent" ? "הורה" : "פרטי") + (D.code ? " · קוד להורים: " + D.code : "");
    var r = saveOrder_({ order: D.oid, title: "🌐 " + D.title, summary: sum, expected: D.n });
    if (D.kind !== "gan") P.deleteProperty(tk);
    return { ok: true, photos: r.photos };
  }
  return { ok: false, error: "action" };
}
/* ניקוי: מפתחות של יותר מ-14 יום, קודי גן של יותר מ-90 יום, ספירות יומיות ישנות */
function webClean_(P) {
  var now = Date.now(), all = P.getProperties(), today = "web_day_" + Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyyMMdd");
  Object.keys(all).forEach(function (k) {
    try {
      if (k.indexOf("web_t_") === 0 && now - JSON.parse(all[k]).at > 14 * 864e5) P.deleteProperty(k);
      else if (k.indexOf("web_code_") === 0 && now - (JSON.parse(all[k]).at || 0) > 90 * 864e5) P.deleteProperty(k);
      else if (k.indexOf("web_day_") === 0 && k !== today) P.deleteProperty(k);
    } catch (e) {}
  });
}

/* הקדשה לגן: {order, title, topic?, sub, text} – מסמך "הקדשה" בתוך התיקייה של הספר + בנים|בנות (מחליף אם כבר קיים) */
function saveDed_(q) {
  var folder = orderFolder_(q.order, q.title), base_ = q.topic ? sub_(folder, String(q.topic).slice(0, 60)) : folder;
  var dir = sub_(base_, q.sub === "בנות" ? "בנות" : "בנים"), name = "הקדשה – " + (q.sub === "בנות" ? "בנות" : "בנים");
  var old = dir.getFilesByName(name); while (old.hasNext()) old.next().setTrashed(true);
  var doc = DocumentApp.create(name), body = doc.getBody();
  body.setAttributes(rtl_());
  String(q.text || "").split("\n").forEach(function (line) { body.appendParagraph(line).setLeftToRight(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT); });
  doc.saveAndClose();
  DriveApp.getFileById(doc.getId()).moveTo(dir);
  return { ok: true };
}

/* מסמך בתיקיית ההזמנה (למשל "פרטי המזמין"): {order, title, name, text} – מחליף אם כבר קיים */
function saveNote_(q) {
  var folder = orderFolder_(q.order, q.title), name = clean_(q.name || "פרטים");
  var old = folder.getFilesByName(name); while (old.hasNext()) old.next().setTrashed(true);
  var doc = DocumentApp.create(name), body = doc.getBody();
  body.setAttributes(rtl_());
  String(q.text || "").split("\n").forEach(function (line) { body.appendParagraph(line).setLeftToRight(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT); });
  doc.saveAndClose();
  DriveApp.getFileById(doc.getId()).moveTo(folder);
  return { ok: true };
}

/* תמונה שהוחלפה (גן – תמונה אחת לכל ילד): {file} – לאשפה (לא מחיקה – אפשר לשחזר). רק קבצים בתוך "BOOQLI הזמנות" */
function trash_(q) {
  var id = (String(q.file || "").match(/[-\w]{25,}/) || [])[0];
  if (!id) return { ok: false, error: "file" };
  var file = DriveApp.getFileById(id), rootId = root_().getId(), level = [file.getParents()];
  for (var d = 0; d < 5; d++) {
    var next = [];
    for (var i = 0; i < level.length; i++) while (level[i].hasNext()) {
      var f = level[i].next();
      if (f.getId() === rootId) { file.setTrashed(true); return { ok: true }; }
      next.push(f.getParents());
    }
    level = next;
  }
  return { ok: false, error: "outside" };
}

/* לקוח ביקש מחיקה בוואטסאפ: {phone, who, orders:[...], gans:[...], files:[...], kids, sums}
   תיקיות ההזמנות הפרטיות + התמונות שהמספר שלח לגן + ההודעות שלו בחלון השאלות – לאשפה (אפשר לשחזר 30 יום),
   ומייל לשמש עם פרטי ההזמנה, כדי שתמחק גם באתר / במערכת ההדפסה. רק בתוך "BOOQLI הזמנות". */
function erase_(q) {
  var root = root_(), folders = [], photos = 0, notes = 0, phone = String(q.phone || "").replace(/\D/g, "");
  (q.orders || []).forEach(function (o) {
    o = String(o || "").replace(/'/g, ""); if (!o) return;
    var it = root.searchFolders("title contains '" + o + "'");
    while (it.hasNext()) { var f = it.next(); if (f.getName().indexOf(o) === 0) { folders.push(f.getName()); f.setTrashed(true); } }
  });
  (q.files || []).forEach(function (u) { try { if (trash_({ file: u }).ok) photos++; } catch (e) {} });
  if (phone) {
    var qa = root.getFoldersByName("שאלות-לקוחות");
    while (qa.hasNext()) { var fs = qa.next().searchFiles("fullText contains '" + phone + "'"); while (fs.hasNext()) { fs.next().setTrashed(true); notes++; } }
  }
  var me = notify_(), gans = (q.gans || []).join(", ");
  MailApp.sendEmail({
    to: me,
    subject: "🗑️ בקשת מחיקה בוואטסאפ: " + (q.who || phone),
    htmlBody: "<div dir='rtl' style='font-family:Arial,sans-serif;font-size:15px'>"
      + "<p><b>" + esc_(q.who || "") + " · 📞 <a href='https://wa.me/" + phone + "'>" + phone + "</a> ביקש/ה למחוק את המידע שלו/ה.</b></p>"
      + "<p>✅ הבוט כבר מחק את מה שהוא זוכר, והעביר לאשפה בדרייב (אפשר לשחזר 30 יום):</p><ul>"
      + "<li>תיקיות הזמנה: " + (folders.length ? esc_(folders.join(" · ")) : "אין") + "</li>"
      + (gans ? "<li>גן " + esc_(gans) + ": " + photos + " תמונות שהמספר הזה שלח (תמונות של הורים אחרים נשארו)</li>" : "")
      + "<li>הודעות בחלון השאלות: " + notes + "</li></ul>"
      + "<p><b>מה נשאר לך:</b> אם כבר הכנת ספר – למחוק גם באתר, במערכת ההדפסה ובמסד הנתונים, תוך 30 יום (כך כתוב במדיניות הפרטיות).</p>"
      + (q.sums ? "<p>פרטי ההזמנה, כדי שתמצאי אותה:</p><pre style='white-space:pre-wrap;font-family:Arial,sans-serif'>" + esc_(String(q.sums).replace(/\*/g, "")) + "</pre>" : "")
      + "</div>"
  });
  return { ok: true, folders: folders.length, photos: photos, notes: notes };
}

/* סוף ההזמנה: {order, title, summary, expected} – מסמך סיכום + מייל */
function saveOrder_(q) {
  var folder = orderFolder_(q.order, q.title);
  var count = countPhotos_(folder);
  var doc = DocumentApp.create("סיכום ההזמנה – " + q.order);
  var body = doc.getBody();
  body.setAttributes(rtl_());
  body.appendParagraph(q.title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  String(q.summary || "").split("\n").forEach(function (line) { body.appendParagraph(line.replace(/\*/g, "")); });
  body.appendParagraph("");
  body.appendParagraph("📷 בתיקייה: " + count + " תמונות" + (q.expected && q.expected !== count ? " (הבוט קיבל " + q.expected + " – כדאי לבדוק)" : ""));
  body.getParagraphs().forEach(function (p) { p.setLeftToRight(false).setAlignment(DocumentApp.HorizontalAlignment.RIGHT); });
  doc.saveAndClose();
  var f = DriveApp.getFileById(doc.getId()); f.moveTo(folder);

  var me = notify_();
  var warn = q.expected && q.expected !== count ? "<p style='color:#c2410c'>⚠️ הבוט קיבל " + q.expected + " תמונות, ובתיקייה יש " + count + ".</p>" : "";
  MailApp.sendEmail({
    to: me,
    subject: "הזמנה חדשה בוואטסאפ: " + q.title,
    htmlBody: "<div dir='rtl' style='font-family:Arial,sans-serif;font-size:15px'>"
      + "<p><b>" + esc_(q.title) + "</b></p>"
      + "<p><a href='" + folder.getUrl() + "'>📁 לתיקיית ההזמנה</a> · <a href='" + f.getUrl() + "'>📄 לסיכום</a></p>"
      + "<p>📷 " + count + " תמונות בתיקייה</p>" + warn
      + "<pre style='white-space:pre-wrap;font-family:Arial,sans-serif'>" + esc_(String(q.summary || "").replace(/\*/g, "")) + "</pre></div>"
  });
  return { ok: true, folder: folder.getUrl(), doc: f.getUrl(), photos: count };
}

/* לקוחה צריכה את שמש: {phone, who, why, q, order, step} – מייל קצר עם קישור לשיחה */
function alert_(q) {
  var me = notify_(), phone = String(q.phone || "").replace(/\D/g, "");
  MailApp.sendEmail({
    to: me,
    subject: "🙋 צריכים אותך בוואטסאפ: " + (q.who || phone) + " – " + (q.why || ""),
    htmlBody: "<div dir='rtl' style='font-family:Arial,sans-serif;font-size:15px'>"
      + "<p><b>" + esc_(q.why || "") + "</b></p>"
      + (q.q ? "<p>השאלה: «" + esc_(q.q) + "»</p>" : "")
      + "<p>👤 " + esc_(q.who || "") + " · 📞 <a href='https://wa.me/" + phone + "'>" + phone + "</a>" + (q.order ? " · הזמנה " + esc_(q.order) : "") + "</p>"
      + "<p>הבוט שותק בשיחה הזאת עד שתכתבי \"נמשיך בהזמנה\" (או שהלקוחה תלחץ ▶️ להמשיך).</p></div>"
  });
  return { ok: true };
}

function countPhotos_(folder) {                                  /* כל התמונות בתיקיות שמתחת (גם נושא/בנים) */
  var n = 0, subs = folder.getFolders();
  while (subs.hasNext()) { var f = subs.next(), fs = f.getFiles(); while (fs.hasNext()) { if (/^image\//.test(fs.next().getMimeType())) n++; } n += countPhotos_(f); }
  return n;
}
function rtl_() { var a = {}; a[DocumentApp.Attribute.FONT_FAMILY] = "Arial"; a[DocumentApp.Attribute.FONT_SIZE] = 12; return a; }
function esc_(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

/* לבדיקה מתוך העורך: בוחרים את הפונקציה testSetup ולוחצים "הפעלה" – נוצרת התיקייה הראשית ונשלח מייל ניסיון */
function testSetup() {
  var r = root_();
  MailApp.sendEmail(notify_(), "BOOQLI – החיבור לדרייב עובד ✓", "התיקייה הראשית: " + r.getUrl());
  Logger.log(r.getUrl());
}
