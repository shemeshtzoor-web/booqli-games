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
var SITE_DIR = location.pathname.replace(/[^/]*$/, ""), siteVirtual = null, siteTimer = null;
function siteTrack(name, kind){
  if (!SITE.analyticsToken) return;
  try {
    // הכתובת האמיתית נשמרת פעם אחת, כך שגם כמה לחיצות מהירות נספרות כל אחת בנפרד
    var back = siteVirtual || (location.pathname + location.search + location.hash);
    siteVirtual = back;
    var path = kind ? SITE_DIR + "event/" + kind + "/" + encodeURIComponent(name) : SITE_DIR + "like/" + encodeURIComponent(name);
    history.pushState(null, "", path);
    clearTimeout(siteTimer);
    siteTimer = setTimeout(function(){ history.replaceState(null, "", back); siteVirtual = null; }, 400);
  } catch (e) {}
}
/* ספירת פעולות (בלי לדעת מי): הצטרפות לוואטסאפ, מתנה להורים, הזמנת ספר, הצעת מחיר לגן, הדפסה.
   מופיעות בלוח של Cloudflare כעמודים שהכתובת שלהם מכילה event/<סוג>/<מקום> */
function siteEvent(kind, name){ siteTrack(name || "page", kind); }
document.addEventListener("click", function(e){
  var el = e.target.closest && e.target.closest("a,button");
  if (!el) return;
  var where = (location.pathname.match(/(topics|games)\/([^/]+)/) || [,"","home"])[2] || "home";
  var href = el.getAttribute("href") || "";
  if (el.classList.contains("js-wa") || href.indexOf("chat.whatsapp.com") > -1) siteEvent("join-whatsapp", (el.closest(".bq-join") ? "popup-" : "") + where);
  else if (el.classList.contains("js-gift")) siteEvent("gift-parents", where);
  else if (el.id === "ganLink" || el.id === "ganBtn" || href.indexOf("%D7%92%D7%9F%20%F0%9F%8F%AB") > -1) siteEvent("gan-quote", where);
  else if (href.indexOf("booqli.ai") > -1) siteEvent("to-booqli", where);
  else if (el.classList.contains("js-report")) siteEvent("report-error", where);
}, true);

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

/* ======================== חלון "הצטרפו לקבוצת העדכונים" ========================
   כלל קבוע (מ-31.10.2026): בכניסה לאתר נפתח חלון שמשכנע להצטרף לקבוצת העדכונים השקטה בוואטסאפ.
   לא חוסם את האתר. "אולי אחר כך" = יופיע שוב אחרי againDays ימים. "הצטרפתי" / לחיצה על ההצטרפות = לא יופיע יותר.
   לא מופיע בדפי הדפסה (?sheet=). בדיקה: להוסיף לכתובת ?join=1 כדי לראות אותו תמיד. */
window.SITE.joinPopup = { delayMs: 1500, againDays: 3 };
function siteJoinPopup(){
  var qs = location.search || "";
  if (/[?&]sheet=/.test(qs) || document.querySelector(".bq-join")) return;
  var force = /[?&]join=1/.test(qs), st = null;
  try { st = JSON.parse(localStorage.getItem("booqli_join") || "{}") || {}; } catch (e) { st = null; }
  var save = function(o){ try { localStorage.setItem("booqli_join", JSON.stringify(o)); } catch (e) {} };
  if (!force) {
    // בלי זיכרון בדפדפן (גלישה פרטית חסומה) – מציגים רק בדף הבית, כדי לא להציק בכל עמוד
    if (st === null && /\/(topics|games)\//.test(location.pathname)) return;
    if (st && (st.joined || (st.later && Date.now() - st.later < SITE.joinPopup.againDays * 864e5))) return;
  }
  var css = document.createElement("style");
  css.textContent =
    ".bq-join{position:fixed;inset:0;z-index:200;background:rgba(43,21,38,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Assistant,Arial,sans-serif;direction:rtl;animation:bqjFade .25s}" +
    ".bq-join .c{position:relative;background:#fff;color:#2B1526;border-radius:28px;max-width:440px;width:100%;max-height:calc(100vh - 32px);overflow:auto;padding:26px 22px 18px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:bqjUp .35s cubic-bezier(.2,.9,.3,1.2)}" +
    ".bq-join .c::before{content:'';position:absolute;inset:0 0 auto 0;height:9px;border-radius:28px 28px 0 0;background:linear-gradient(90deg,#1FA855,#6F988B,#FF56C2)}" +
    ".bq-join .x{position:absolute;top:14px;left:14px;width:36px;height:36px;border-radius:50%;border:0;background:#F2F2F2;color:#6b5a66;font-size:18px;font-weight:800;cursor:pointer;line-height:1}" +
    ".bq-join .ic{width:72px;height:72px;margin:0 auto 6px;border-radius:50%;background:#E6F7EC;display:grid;place-items:center;font-size:38px}" +
    ".bq-join h2{font-family:Fredoka,Assistant,sans-serif;font-size:25px;line-height:1.2;margin:0 0 6px;color:#2B1526;text-wrap:balance}" +
    ".bq-join h2 b{color:#1FA855}" +
    ".bq-join .lead{margin:0 0 12px;font-size:16.5px;color:#6b5a66}" +
    ".bq-join ul{list-style:none;margin:0 0 16px;padding:0;display:grid;gap:8px;text-align:right}" +
    ".bq-join li{display:flex;gap:10px;align-items:flex-start;background:#F4FAF7;border-radius:14px;padding:8px 12px;font-size:15.5px;line-height:1.35}" +
    ".bq-join li .e{font-size:20px;line-height:1.2;flex-shrink:0}.bq-join li b{color:#4E8576}" +
    ".bq-join .go{display:flex;align-items:center;justify-content:center;gap:8px;background:#1FA855;color:#fff;text-decoration:none;font-weight:800;font-size:18px;border-radius:999px;padding:14px 18px;box-shadow:0 4px 0 #13773A;animation:bqjPulse 2.2s ease-in-out 1s infinite}" +
    ".bq-join .go:active{transform:translateY(2px);box-shadow:0 2px 0 #13773A}" +
    ".bq-join .low{display:flex;justify-content:center;gap:6px 16px;flex-wrap:wrap;margin-top:12px}" +
    ".bq-join .low button{background:none;border:0;color:#6b5a66;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer;text-decoration:underline;padding:6px 4px}" +
    ".bq-join .note{margin:10px 0 0;font-size:12.5px;color:#8a7a86}" +
    "@keyframes bqjFade{from{opacity:0}}@keyframes bqjUp{from{transform:translateY(40px);opacity:0}}" +
    "@keyframes bqjPulse{50%{transform:scale(1.03)}}" +
    "@media (max-width:520px){.bq-join{align-items:flex-end;padding:0}.bq-join .c{border-radius:26px 26px 0 0;max-height:92vh;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}.bq-join .c::before{border-radius:26px 26px 0 0}.bq-join h2{font-size:22px}}" +
    "@media (prefers-reduced-motion:reduce){.bq-join,.bq-join .c,.bq-join .go{animation:none}}" +
    "@media print{.bq-join{display:none!important}}";
  var show = function(){
    if (document.querySelector(".bq-join")) return;
    document.head.appendChild(css);
    var box = document.createElement("div");
    box.className = "bq-join"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "bqjT");
    box.innerHTML = '<div class="c">' +
      '<button class="x" type="button" aria-label="סגירה">✕</button>' +
      '<div class="ic" aria-hidden="true">🔔</div>' +
      '<h2 id="bqjT">רוצים לדעת <b>ראשונים</b> כשעולה משחק חדש?</h2>' +
      '<p class="lead">הצטרפו לקבוצת העדכונים השקטה של <bdi style="white-space:nowrap">booqli Games</bdi> בוואטסאפ.</p>' +
      '<ul>' +
        '<li><span class="e">🆕</span><span><b>ראשונים לדעת</b> כשנפתח נושא חדש: חורף, ט"ו בשבט, פורים ועוד הרבה בדרך.</span></li>' +
        '<li><span class="e">⏳</span><span><b>לא מפספסים.</b> התכנים נפתחים לפי עונות השנה, ונסגרים כשהעונה נגמרת.</span></li>' +
        '<li><span class="e">🤫</span><span><b>קבוצה שקטה.</b> רק אנחנו שולחים, רק כשיש משהו חדש. בלי הודעות מאחרים ובלי הצפות.</span></li>' +
        '<li><span class="e">🆓</span><span><b>בחינם.</b> ואפשר לצאת מהקבוצה בכל רגע.</span></li>' +
      '</ul>' +
      '<a class="go js-wa" target="_blank" rel="noopener" href="' + SITE.whatsappGroup + '">💬 אני רוצה להצטרף לקבוצה</a>' +
      '<div class="low"><button type="button" class="later">אולי אחר כך</button><button type="button" class="done">כבר הצטרפתי ✓</button></div>' +
      '<p class="note">כל התכנים באתר מוענקים בחינם, בחסות BOOQLI ❤️</p>' +
      '</div>';
    var prev = document.activeElement;
    var close = function(how){
      if (how === "joined") save({ joined: Date.now() }); else save({ later: Date.now() });
      box.remove(); document.removeEventListener("keydown", onKey, true);
      if (prev && prev.focus) try { prev.focus({ preventScroll: true }); } catch (e) {}
    };
    var onKey = function(e){
      if (e.key === "Escape") { e.stopPropagation(); close("later"); }
      if (e.key === "Tab") { // שומרים את הפוקוס בתוך החלון
        var f = box.querySelectorAll("a,button"), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    box.querySelector(".go").addEventListener("click", function(){ setTimeout(function(){ close("joined"); }, 300); });
    box.querySelector(".done").onclick = function(){ close("joined"); };
    box.querySelector(".later").onclick = function(){ close("later"); };
    box.querySelector(".x").onclick = function(){ close("later"); };
    box.addEventListener("click", function(e){ if (e.target === box) close("later"); });
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(box);
    try { box.querySelector(".go").focus({ preventScroll: true }); } catch (e) {}
    siteEvent("join-popup", (location.pathname.match(/(topics|games)\/([^/]+)/) || [,"","home"])[2] || "home");
  };
  setTimeout(show, force ? 300 : SITE.joinPopup.delayMs);
}
(function(){
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", siteJoinPopup); else siteJoinPopup();
})();

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
  hanukkah: "2026-12-12T23:59:00+02:00",  // סוף חנוכה: היום השמיני, שבת 12.12.2026
  autumn:   "2026-12-20T23:59:00+02:00"   // סוף הסתיו: יום לפני תחילת החורף (21.12.2026). בשנה הבאה – לעדכן את התאריך
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
      '<p>התכנים באתר נפתחים לפי עונות השנה, ויחזרו בעונה שלהם בשנה הבאה.</p>' +
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

/* ======================== חיבור לאתר הראשי של BOOQLI ========================
   כלל קבוע: בכל עמוד יש פס עליון עם קישורים לאתר הראשי (בעברית), ולחיצה על כל לוגו
   של BOOQLI מובילה לעמוד הבית של האתר הראשי. הכל נפתח בחלון חדש, כדי שאתר המשחקים יישאר פתוח.
   הכתובות נבדקו באתר החי (31.10.2026). משנים כתובת – רק כאן. */
window.SITE.main = {
  home: "https://www.booqli.ai/he",
  links: [
    { icon: "👦", label: "ספרים לבנים", short: "לבנים",   href: "https://www.booqli.ai/he/choose-book/boys-hebrew" },
    { icon: "👧", label: "ספרים לבנות", short: "לבנות",   href: "https://www.booqli.ai/he/choose-book/girls-hebrew" },
    { icon: "🖼️", label: "גלריה",       short: "גלריה",   href: "https://www.booqli.ai/he/gallery" },
    { icon: "📝", label: "מאמרים",      short: "מאמרים",  href: "https://www.booqli.ai/he/articles" },
    { icon: "🏫", label: "גני ילדים",   short: "גנים",    href: "https://www.booqli.ai/he/kindergartens" }
  ]
};
function siteIsLogo(img){
  if (!img || img.tagName !== "IMG") return false;
  var src = img.getAttribute("src") || "";
  return img.classList.contains("logo") || img.alt === "BOOQLI" || /(^|\/)logo(-dark)?\.png$/.test(src);
}
function siteLogoLinks(){
  document.querySelectorAll("img").forEach(function(img){
    if (!siteIsLogo(img)) return;
    var a = img.closest("a");
    if (!a) {
      a = document.createElement("a");
      img.parentNode.insertBefore(a, img); a.appendChild(img);
      a.className = "bq-logo-link";
      // הלוגו בתחתית מוצג במרכז – הקישור שומר על אותו מיקום
      var cs = getComputedStyle(img);
      if (cs.display === "block") a.style.display = "block";
    }
    a.href = SITE.main.home; a.target = "_blank"; a.rel = "noopener";
    a.setAttribute("aria-label", "BOOQLI – לאתר הראשי (נפתח בחלון חדש)");
  });
}
/* לוגו שנוצר אחר כך (למשל בתוך חלונית) – גם לחיצה עליו מובילה לאתר הראשי */
document.addEventListener("click", function(e){
  var img = e.target;
  if (!siteIsLogo(img) || img.closest("a") || img.closest(".s-foot")) return;
  window.open(SITE.main.home, "_blank", "noopener");
});
function siteMainNav(){
  if (document.querySelector(".bq-nav")) return;
  var css = document.createElement("style");
  css.textContent =
    ".bq-nav{position:relative;z-index:40;background:linear-gradient(90deg,#FFE3F4,#FFF3FA 45%,#E1F0EA);border-bottom:2px solid #FFC8EA;font-family:Assistant,Arial,sans-serif;direction:rtl}" +
    ".bq-nav .in{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:10px;padding:6px max(16px,env(safe-area-inset-right,0px)) 6px max(16px,env(safe-area-inset-left,0px))}" +
    ".bq-nav .home{display:inline-flex;align-items:center;gap:6px;color:#C13671;font-weight:800;font-size:14.5px;text-decoration:none;white-space:nowrap;flex-shrink:0}" +
    ".bq-nav .home b{font-family:Fredoka,Assistant,sans-serif;letter-spacing:.5px}" +
    ".bq-nav ul{list-style:none;margin:0 auto 0 0;padding:0;display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}" +
    ".bq-nav li a{display:inline-flex;align-items:center;gap:5px;background:#fff;color:#C13671;border:2px solid #FF56C2;border-radius:999px;padding:4px 12px;font-weight:800;font-size:14px;line-height:1.3;text-decoration:none;white-space:nowrap;transition:background .15s,color .15s}" +
    ".bq-nav li a:hover,.bq-nav li a:focus-visible{background:#E0399F;border-color:#E0399F;color:#fff;outline:none}" +
    ".bq-nav li a:focus-visible,.bq-nav .home:focus-visible{box-shadow:0 0 0 3px #4E8576}" +
    ".bq-nav .s{display:none}" +
    "@media (min-width:700px){.bq-nav{position:sticky;top:0;box-shadow:0 2px 10px rgba(193,54,113,.10)}html{scroll-padding-top:56px}}" +
    "@media (max-width:860px){.bq-nav .home .t{display:none}}" +
    /* טלפון: חמישה כפתורים בשורה אחת, אייקון מעל מילה – נוח לאצבע */
    "@media (max-width:600px){.bq-nav .in{padding:5px max(8px,env(safe-area-inset-right,0px)) 6px max(8px,env(safe-area-inset-left,0px));flex-direction:column;align-items:stretch;gap:4px}" +
    ".bq-nav .home{justify-content:center;font-size:13px}.bq-nav .home .t{display:inline}" +
    ".bq-nav ul{margin:0;display:grid;grid-template-columns:repeat(5,1fr);gap:4px}" +
    ".bq-nav li a{display:flex;flex-direction:column;gap:0;justify-content:center;width:100%;min-height:44px;padding:3px 2px;border-radius:12px;font-size:12.5px;border-width:1.5px}" +
    ".bq-nav li a .i{font-size:17px;line-height:1.1}.bq-nav .f{display:none}.bq-nav .s{display:inline}}" +
    "@media (max-width:420px){.bq-nav .home .t{display:none}}" +
    "@media print{.bq-nav{display:none!important}}";
  document.head.appendChild(css);
  var nav = document.createElement("nav");
  nav.className = "bq-nav"; nav.setAttribute("aria-label", "האתר הראשי של BOOQLI");
  var items = SITE.main.links.map(function(l){
    return '<li><a href="' + l.href + '" target="_blank" rel="noopener" title="' + l.label + ' – באתר BOOQLI (נפתח בחלון חדש)">' +
      '<span class="i" aria-hidden="true">' + l.icon + '</span><span class="f">' + l.label + '</span><span class="s">' + l.short + '</span></a></li>';
  }).join("");
  nav.innerHTML = '<div class="in"><a class="home" href="' + SITE.main.home + '" target="_blank" rel="noopener" title="לאתר הראשי של BOOQLI (נפתח בחלון חדש)">' +
    '📚 <span>לאתר <b>BOOQLI</b></span><span class="t">· ספרים אישיים שהילד הוא הגיבור ↖</span></a><ul>' + items + '</ul></div>';
  document.body.insertBefore(nav, document.body.firstChild);
}
(function siteConnectMain(){
  function run(){ siteMainNav(); siteLogoLinks(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
