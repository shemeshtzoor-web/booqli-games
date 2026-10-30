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
