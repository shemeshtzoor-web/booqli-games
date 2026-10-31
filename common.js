/* =========================================================
   booqli Games – הגדרות משותפות לכל האתר
   כאן משנים: קישור לקבוצת הוואטסאפ, מספר לדיווח טעויות, קוד מדידה.
   ========================================================= */
window.SITE = {
  // קבוצת הוואטסאפ לעדכונים
  whatsappGroup: "https://chat.whatsapp.com/I00ZXog0R88HDDMolWYKbx",
  // מספר הוואטסאפ של BOOQLI (לדיווח טעויות). בפורמט בינלאומי, בלי + ובלי 0 בהתחלה
  phone: "972555549331",
  // קוד המדידה מ-Cloudflare Web Analytics. להדביק כאן בין המירכאות כשיתקבל
  analyticsToken: "cd51ae95df984ed1b317d05f080dc9a3"
};

/* ======================== מדידת כניסות ======================== */
(function loadAnalytics(){
  if (!SITE.analyticsToken) return;
  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: SITE.analyticsToken, spa: true }));
  document.head.appendChild(s);
})();

/* רישום פעולה (למשל לייק) כביקור בכתובת וירטואלית, כדי שיופיע בלוח המדידה.
   הכתובת מתחלפת לרגע וחוזרת מיד, הדף עצמו לא נטען מחדש. */
function siteTrack(name){
  if (!SITE.analyticsToken) return;
  try {
    var back = location.pathname + location.search + location.hash;
    var dir = location.pathname.replace(/[^/]*$/, "");
    history.pushState(null, "", dir + "like/" + encodeURIComponent(name));
    setTimeout(function(){ history.replaceState(null, "", back); }, 400);
  } catch (e) {}
}

/* ======================== פס "האתר בפיתוח" ======================== */
function siteReportLink(){
  var t = "היי BOOQLI, מצאתי טעות באתר booqli Games 🛠️\nבעמוד: " + document.title + "\n" + location.href.split("#")[0] + "\n\nמה הטעות: ";
  return "https://wa.me/" + SITE.phone + "?text=" + encodeURIComponent(t);
}
function siteDevBar(){
  var css = document.createElement("style");
  css.textContent =
    ".devbar{background:#FFF6D6;color:#6b4e00;text-align:center;font-size:13.5px;font-weight:700;padding:5px 16px;border-bottom:1px solid #F3E2A6}" +
    ".devbar a{color:#C13671;font-weight:800;white-space:nowrap}" +
    ".like-btn{background:#fff;color:#C13671;border:2px solid #FF56C2;border-radius:999px;padding:9px 16px;font:inherit;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px}" +
    ".like-btn.on{background:#FF56C2;color:#fff}" +
    ".like-btn .h{display:inline-block}.like-btn.beat .h{animation:likebeat .5s}" +
    "@keyframes likebeat{40%{transform:scale(1.5)}}" +
    ".report-link{display:inline-block;margin-top:10px;font-size:14px;font-weight:700;color:#4E8576}";
  document.head.appendChild(css);
  var bar = document.createElement("div");
  bar.className = "devbar";
  bar.innerHTML = '🛠️ האתר בפיתוח, ייתכנו שגיאות. מצאתם טעות? <a class="js-report" target="_blank" rel="noopener">רשמו לנו ונתקן מייד ←</a>';
  var after = document.querySelector(".sponsor") || document.querySelector("header");
  if (after) after.insertAdjacentElement("afterend", bar);
  document.querySelectorAll(".js-report").forEach(function(a){ a.href = siteReportLink(); });
}

/* ======================== כפתור לייק ======================== */
function siteLikeButton(id, label){
  var key = "booqli_like_" + id, on = false;
  try { on = localStorage.getItem(key) === "1"; } catch (e) {}
  var b = document.createElement("button");
  b.type = "button"; b.className = "like-btn" + (on ? " on" : "");
  var paint = function(){ b.innerHTML = '<span class="h">' + (on ? "❤️" : "🤍") + "</span>" + (on ? "תודה שאהבתם!" : (label || "אהבתי")); b.setAttribute("aria-pressed", on); };
  paint();
  b.onclick = function(){
    if (on) return;
    on = true; try { localStorage.setItem(key, "1"); } catch (e) {}
    paint(); b.classList.add("on", "beat");
    siteTrack(id);
  };
  return b;
}

/* ======================== הצטרפות לקבוצה ======================== */
function siteJoinLinks(){
  document.querySelectorAll(".js-wa").forEach(function(a){ a.href = SITE.whatsappGroup; });
}

/* ======================== קוד QR לדפי הדפסה ========================
   כלל קבוע: בכל דף שמדפיסים יש קוד לסריקה להורים, שמוביל להזמנת ספר אישי.
   topic = שם הנושא באנגלית (למעקב: מאיזה דף הגיעו) */
function siteOrderLink(topic, medium){
  return "https://www.booqli.ai/he/create-a-book?utm_source=booqli_games&utm_medium=" + (medium || "print_qr") + "&utm_campaign=" + (topic || "site");
}
function siteQR(url){
  if (typeof qrcode !== "function") return "";
  var q = qrcode(0, "M"); q.addData(url); q.make();
  var n = q.getModuleCount(), d = "";
  for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + c + " " + r + "h1v1h-1z";
  return '<svg viewBox="-2 -2 ' + (n + 4) + " " + (n + 4) + '" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path d="' + d + '" fill="#2B1526"/></svg>';
}
/* תחתית קבועה לדף הדפסה: לוגו, פנייה להורים וקוד לסריקה.
   בדפים לבנים משתמשים ב-logo-dark.png (האותיות כהות, בלי רקע ירוק) */
function sitePrintFooter(topic, couponLine, logoSrc){
  return '<div class="s-foot" style="display:flex;align-items:center;gap:4mm;border-top:2px solid #CDE7DC;padding-top:3mm;margin-top:4mm;font-size:10pt;direction:rtl">' +
    '<div style="width:22mm;height:22mm;flex-shrink:0">' + siteQR(siteOrderLink(topic)) + '</div>' +
    '<div style="flex:1;line-height:1.35"><b style="font-size:12.5pt;color:#C13671">להורים: ספר אמיתי שהילד שלכם הוא הגיבור שלו! 📖</b><br>' +
    'השם של הילד לאורך כל העלילה ואיורים אישיים בכל עמוד. סרקו את הקוד והכירו' + (couponLine ? '<br>' + couponLine : '') +
    '<br><span style="color:#4E8576">booqli Games · כל התכנים מוענקים בחינם, בחסות BOOQLI</span></div>' +
    '<img src="' + String(logoSrc).replace(/logo\.png$/, "logo-dark.png") + '" alt="BOOQLI" style="height:11mm;width:auto;display:block;flex-shrink:0"></div>';
}

/* ======================== כפתור חזרה לתפריט הראשי ========================
   כלל קבוע: בכל עמוד נושא יש פס עם כפתור חזרה לדף הבית */
function siteBackBar(homeHref){
  var css = document.createElement("style");
  css.textContent = ".backbar{max-width:1100px;margin:12px auto 0;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}" +
    ".backbar a{display:inline-flex;align-items:center;gap:6px;background:#fff;color:#4E8576;border:2px solid #4E8576;border-radius:999px;padding:8px 16px;font-weight:800;text-decoration:none;font-size:15px}" +
    ".backbar a:hover{background:#4E8576;color:#fff}";
  document.head.appendChild(css);
  var bar = document.createElement("div"); bar.className = "backbar";
  bar.innerHTML = '<a href="' + homeHref + '">→ 🏠 חזרה לתפריט הראשי</a>';
  var after = document.querySelector(".devbar") || document.querySelector(".sponsor") || document.querySelector("header");
  if (after) after.insertAdjacentElement("afterend", bar);
}

/* ======================== זכויות יוצרים ========================
   כלל קבוע: מופיע אוטומטית בתחתית כל עמוד שטוען את common.js */
(function siteCopyright(){
  function add(){
    if (document.querySelector(".site-copy")) return;
    var p = document.createElement("p");
    p.className = "site-copy";
    p.style.cssText = "margin:10px auto 0;padding:0 16px 14px;max-width:900px;text-align:center;font-size:12.5px;line-height:1.5;opacity:.85";
    p.textContent = "© " + Math.max(2026, new Date().getFullYear()) + " BOOQLI. כל הזכויות שמורות. מותר ומומלץ לשתף את האתר ואת דפי ההדפסה עם גננות, הורים וחברים, בחינם וכמו שהם (עם הקרדיט של BOOQLI). אסור להשתמש בתכנים לשימוש מסחרי: למכור אותם, לגבות עליהם כסף, לשלב אותם במוצר או בשירות בתשלום, או לפרסם אותם בשם אחר, ללא אישור בכתב מ-BOOQLI.";
    var f = document.querySelector("footer");
    (f || document.body).appendChild(p);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();

/* ======================== פתיחה וסגירה של נושאים ========================
   כלל קבוע: נושא עונתי נסגר בתאריך ובשעה שכתובים כאן (שעון ישראל).
   אחרי הסגירה העמוד ננעל, וכרטיס הנושא בדף הבית מציג "נסגר".
   בדיקה: להוסיף לכתובת ?date=2026-12-03T17:30 כדי לראות איך זה ייראה אחרי הסגירה. */
window.SITE.closes = {
  hanukkah: "2026-12-12T23:59:00+02:00"   // סוף חנוכה: היום השמיני, שבת 12.12.2026
};
function siteNow(){
  var q = new URLSearchParams(location.search).get("date");
  if (q) { var d = new Date(q.indexOf("T") > 0 ? q : q + "T00:00:00"); if (!isNaN(d)) return d; }
  return new Date();
}
function siteIsClosed(id){ var c = SITE.closes[id]; return !!c && siteNow() >= new Date(c); }
var SITE_DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
function siteCloseText(id){
  var c = new Date(SITE.closes[id]);
  var p = new Intl.DateTimeFormat("en-GB", {timeZone:"Asia/Jerusalem", weekday:"short", day:"numeric", month:"numeric", hour:"2-digit", minute:"2-digit", hour12:false}).formatToParts(c);
  var g = function(t){ for (var i = 0; i < p.length; i++) if (p[i].type === t) return p[i].value; return ""; };
  var wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday"));
  return "יום " + SITE_DAYS[wd] + " " + parseInt(g("day"),10) + "." + parseInt(g("month"),10) + " בשעה " + g("hour") + ":" + g("minute");
}
function siteLeft(id){
  var ms = Math.max(0, new Date(SITE.closes[id]) - siteNow());
  var D = Math.floor(ms / 864e5); ms -= D * 864e5;
  var H = Math.floor(ms / 36e5); ms -= H * 36e5;
  var M = Math.floor(ms / 6e4);
  return {D:D, H:H, M:M};
}
function siteAskLink(what){
  return "https://wa.me/" + SITE.phone + "?text=" + encodeURIComponent("היי BOOQLI, אשמח שתפתחו באתר booqli Games תוכן על: " + (what || ""));
}
/* בעמוד נושא: פס ספירה לאחור עד הסגירה, ואחרי הסגירה – נעילת העמוד */
function siteCloseBar(id, name, homeHref){
  if (!SITE.closes[id]) return;
  var css = document.createElement("style");
  css.textContent =
    ".closebar{max-width:1100px;margin:12px auto 0;padding:0 16px}" +
    ".closebar .in{background:#fff;border:3px solid #FFE3F4;border-radius:20px;padding:12px 16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 16px;text-align:center;box-shadow:0 4px 14px rgba(78,133,118,.12)}" +
    ".closebar b{color:#C13671}.closebar .t{display:flex;gap:6px;direction:rtl}" +
    ".closebar .t span{background:#E1F0EA;border-radius:10px;padding:4px 9px;font-weight:800;color:#4E8576;font-size:15px}" +
    ".closed-box{max-width:640px;margin:30px max(16px,calc((100% - 640px) / 2));background:#fff;border-radius:26px;padding:28px 22px;text-align:center;box-shadow:0 10px 30px rgba(78,133,118,.18)}" +
    ".closed-box h2{color:#C13671;font-size:28px;margin:8px 0}.closed-box p{color:#6b5a66;font-size:17px}" +
    ".closed-box a{display:inline-block;margin:6px;border-radius:999px;padding:11px 18px;font-weight:800;text-decoration:none}" +
    ".closed-box .g{background:#1FA855;color:#fff}.closed-box .h{background:#E0399F;color:#fff}.closed-box .w{border:2px solid #4E8576;color:#4E8576}";
  document.head.appendChild(css);
  var main = document.querySelector("main");
  if (siteIsClosed(id)) {
    if (main) main.hidden = true;
    var box = document.createElement("div"); box.className = "closed-box";
    box.innerHTML = '<div style="font-size:64px">🔒</div><h2>התכנים של ' + name + ' נסגרו לשנה הזו</h2>' +
      '<p>התכנים באתר נפתחים לפי עונות השנה. ' + name + ' תיפתח שוב לקראת החג בשנה הבאה.</p>' +
      '<a class="h" href="' + homeHref + '">🏠 לתכנים הפתוחים עכשיו</a>' +
      '<a class="g js-join" target="_blank" rel="noopener">💬 עדכונים בוואטסאפ</a>' +
      '<a class="w" target="_blank" rel="noopener" href="' + siteAskLink(name) + '">רוצים שנפתח לכם? כתבו לנו</a>';
    (main ? main.parentNode : document.body).insertBefore(box, main ? main.nextSibling : null);
    var j = box.querySelector(".js-join"); j.href = SITE.whatsappGroup;
    return;
  }
  var bar = document.createElement("div"); bar.className = "closebar";
  bar.innerHTML = '<div class="in"><div>⏳ התכנים של ' + name + ' זמינים עד <b>' + siteCloseText(id) + '</b></div><div class="t" aria-live="polite"></div></div>';
  var after = document.querySelector(".backbar") || document.querySelector(".devbar") || document.querySelector(".sponsor") || document.querySelector("header");
  if (after) after.insertAdjacentElement("afterend", bar);
  var t = bar.querySelector(".t");
  var tick = function(){
    if (siteIsClosed(id)) { location.reload(); return; }
    var l = siteLeft(id);
    t.innerHTML = "<span>" + l.D + " ימים</span><span>" + l.H + " שעות</span><span>" + l.M + " דקות</span>";
  };
  tick(); setInterval(tick, 30000);
}
