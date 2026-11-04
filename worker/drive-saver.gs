/* BOOQLI – שומר את ההזמנות מהבוט בדרייב של שמש (Google Apps Script), 4.11.2026
   מדביקים את כל הקובץ הזה ב-script.google.com (פרויקט חדש), ואז:
   1. ⚙️ הגדרות הפרויקט ← מאפייני סקריפט ← מוסיפים: SECRET = אותה מילה סודית שמודבקת ב-Cloudflare (DRIVE_KEY).
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
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || q.key !== secret) return out_({ ok: false, error: "key" });
    if (q.action === "photo") return out_(savePhoto_(q));
    if (q.action === "order") return out_(saveOrder_(q));
    if (q.action === "alert") return out_(alert_(q));
    if (q.action === "ping") return out_({ ok: true, folder: root_().getUrl() });
    return out_({ ok: false, error: "action" });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}

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
  try {
    var folder = orderFolder_(q.order, q.title), base_ = q.topic ? sub_(folder, String(q.topic).slice(0, 60)) : folder;   /* גן עם 2 נושאים: <גן>/<נושא>/בנים|בנות */
    var dir = sub_(base_, q.sub === "בנות" ? "בנות" : "בנים");
    var base = clean_(q.name), ext = /png/.test(q.mime) ? ".png" : ".jpg", name = base + ext, n = 1;
    while (dir.getFilesByName(name).hasNext()) { n++; name = base + " (" + n + ")" + ext; }   /* עוד תמונה של אותו ילד: "יוסי 1 (2).jpg" */
    var blob = Utilities.newBlob(Utilities.base64Decode(q.b64), q.mime || "image/jpeg", name);
    var file = dir.createFile(blob);
    return { ok: true, file: file.getUrl(), folder: folder.getUrl(), name: name };
  } finally { lock.releaseLock(); }
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

  var me = Session.getEffectiveUser().getEmail();
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
  var me = Session.getEffectiveUser().getEmail(), phone = String(q.phone || "").replace(/\D/g, "");
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
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "BOOQLI – החיבור לדרייב עובד ✓", "התיקייה הראשית: " + r.getUrl());
  Logger.log(r.getUrl());
}
