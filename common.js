/* =========================================================
   booqli Games – הגדרות משותפות לכל האתר
   כאן משנים: קישור לקבוצת הוואטסאפ, מספר לדיווח טעויות, קוד מדידה.
   ========================================================= */
window.SITE = {
  // קבוצת הוואטסאפ לעדכונים
  whatsappGroup: "https://chat.whatsapp.com/I00ZXog0R88HDDMolWYKbx",
  // מספר הוואטסאפ של BOOQLI (לדיווח טעויות). בפורמט בינלאומי, בלי + ובלי 0 בהתחלה
  phone: "972555549331",
  /* שרת התמונות של עמוד הסבים (worker/photo-upload.js). ריק = בלי שרת: התמונות נשלחות בחלון השיתוף של הטלפון */
  photoUpload: "https://booqli-photos.shemeshtzoor.workers.dev/",
  driveUpload: "https://booqli-wa.shemeshtzoor.workers.dev/up/",   /* (ישן – חסום בסינונים, לא בשימוש) */
  /* שמירת תמונות ישר בדרייב של שמש – הקוד בגוגל (worker/drive-saver.gs, פעולות web*). גוגל לא חסום בסינונים, workers.dev כן (5.11.2026) */
  driveScript: "https://script.google.com/macros/s/AKfycbx67vfPc5N6ry77InqUckoz25HsJf2pnWr_4F7ErpDAIwd2idMkNQYbMSaSAgTSzPLVAQ/exec",
  // קוד המדידה מ-Cloudflare Web Analytics. להדביק כאן בין המירכאות כשיתקבל
  analyticsToken: "cd51ae95df984ed1b317d05f080dc9a3",
  // מצב בעלת האתר (שמש): רק "טביעת אצבע" של הקוד, הקוד עצמו לא נכתב כאן. ראו "מצב בעלת האתר" למטה
  ownerHash: "66cbc49d397a041a14b33b3cdd4b2f62f574765543510d613bcec7d9b170840c"
};
/* העלאת תמונות לדרייב של שמש (עמודי הסבים, הגנים וההורים). text/plain = בלי preflight, גוגל מחזיר JSON */
window.bqUp = (function () {
  var post = function (o) { return fetch(SITE.driveScript, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(o) }).then(function (r) { return r.json(); }); };
  var b64 = function (blob) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(",")[1]); }; r.onerror = rej; r.readAsDataURL(blob); }); };
  return {
    start: function (o) { return post(Object.assign({ action: "webstart" }, o)); },
    photo: function (tok, blob, sub, name, topic) { return b64(blob).then(function (d) { return post({ action: "webphoto", tok: tok, sub: sub, name: name, topic: topic || "", mime: blob.type === "image/png" ? "image/png" : "image/jpeg", b64: d }); }); },
    done: function (tok, summary, cust) { return post({ action: "webdone", tok: tok, summary: summary, cust: cust || null }); },
    gan: function (code) { return post({ action: "webgan", code: code }); }
  };
})();
/* טיוטה של הזמנה בטלפון (שמש, 5.11.2026: "אם התחלתי הזמנה – שזה יישמר"). IndexedDB – גם התמונות. רק במכשיר ובדפדפן הזה, 30 יום. */
window.bqDraft = (function () {
  var db = null;
  function open() { if (!db) db = new Promise(function (res, rej) { var r = indexedDB.open("booqli-drafts", 1); r.onupgradeneeded = function () { r.result.createObjectStore("d"); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); return db; }
  function tx(mode, fn) { return open().then(function (d) { return new Promise(function (res, rej) { var t = d.transaction("d", mode), q = fn(t.objectStore("d")); t.oncomplete = function () { res(q && q.result); }; t.onerror = t.onabort = function () { rej(t.error); }; }); }); }
  var timers = {};
  return {
    save: function (k, v) { clearTimeout(timers[k]); timers[k] = setTimeout(function () { tx("readwrite", function (s) { return s.put({ v: v, at: Date.now() }, k); }).catch(function () {}); }, 500); },
    load: function (k) { try { return tx("readonly", function (s) { return s.get(k); }).then(function (r) { return r && Date.now() - r.at < 30 * 864e5 ? r.v : null; }).catch(function () { return null; }); } catch (e) { return Promise.resolve(null); } },
    clear: function (k) { clearTimeout(timers[k]); return tx("readwrite", function (s) { return s.delete(k); }).catch(function () {}); }
  };
})();
/* סיכום הזמנה להורדה כ-PDF: מעתיקים את הסיכום לאזור הדפסה ופותחים את חלון ההדפסה ("שמירה כ-PDF") */
window.bqPrint = function (el) {
  var box = document.getElementById("bqPrint");
  if (!box) { box = document.createElement("div"); box.id = "bqPrint"; document.body.appendChild(box);
    var st = document.createElement("style"); st.textContent = "#bqPrint{display:none}@media print{body>*:not(#bqPrint){display:none!important}#bqPrint{display:block;direction:rtl;font-family:Assistant,Arial,sans-serif;color:#222}#bqPrint .noprint{display:none!important}#bqPrint img{max-width:120px}}"; document.head.appendChild(st); }
  box.innerHTML = el.outerHTML; setTimeout(function () { window.print(); }, 50);
};


/* ======================== מצב בעלת האתר (מ-1.11.2026) ========================
   במכשיר של שמש הכל פתוח: בלי מספר סודי, לפני תאריך הפתיחה, אחרי הסגירה, ועמודים בהכנה.
   הפעלה: פותחים פעם אחת בכל מכשיר/דפדפן את הקישור הסודי games.booqli.ai/?owner=<הקוד> (נשמר בדפדפן).
   כיבוי זמני ("לראות כמו גננת"): הכפתור 👑 בפינה. ניתוק המכשיר: ?owner=off.
   במצב בעלת האתר הכניסות לא נספרות במדידה. זו נעילה פשוטה בדפדפן (לא כספת). */
function siteOwnerDevice(){ try { return localStorage.getItem("booqli_owner") === SITE.ownerHash; } catch (e) { return false; } }
function siteOwner(){ try { return siteOwnerDevice() && localStorage.getItem("booqli_owner_off") !== "1"; } catch (e) { return false; } }

/* ======================== מדידת כניסות ======================== */
(function loadAnalytics(){
  if (!SITE.analyticsToken || siteOwnerDevice()) return;
  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: SITE.analyticsToken, spa: true }));
  document.head.appendChild(s);
})();

/* ======================== מצב ילדים נעול (מ-1.11.2026) ========================
   הורה מפעיל (בעמוד האפליקציה app/ או באזור הילדים) ובוחר קוד של 4 ספרות. מאז, במכשיר הזה:
   רק אזור הילדים (kids/, kids/play/), משחקי הנושאים במצב ילדים (topics/<id>/?play=1) ומשחקי ספרי BOOQLI (games/).
   כל קישור אחר, וואטסאפ, אתר BOOQLI, שיתוף וחלונות קופצים – חסומים. יציאה: כפתור 🔒 בפינה + הקוד של ההורה
   (שכחתם? תרגיל כפל להורים). נשמר רק בדפדפן: booqli_kidlock = {on, h (טביעת הקוד), t}.
   מה שהאתר לא יכול לחסום (כפתור הבית של הטלפון) – בהסבר בעמוד app/: "גישה מודרכת" באייפון, "הצמדת אפליקציה" באנדרואיד. */
var SITE_KL_KEY = "booqli_kidlock";
function siteKidLock(){ try { var o = JSON.parse(localStorage.getItem(SITE_KL_KEY) || "null"); return o && o.on ? o : null; } catch (e) { return null; } }
function siteKidAllowed(href){
  var u; try { u = new URL(href, location.href); } catch (e) { return false; }
  if (u.origin !== location.origin) return false;
  var p = u.pathname;
  if (/^\/kids(\/|$)/.test(p) || /^\/games\/[^/]+(\/|\/index\.html)?$/.test(p) || /^\/school\/(reading|dictation)(\/|\/index\.html)?$/.test(p) && !/[?&](sheet|p)=/.test(u.search) || p === "/offline.html") return true;
  if (/^\/topics\/[^/]+(\/|\/index\.html)?$/.test(p)) return /[?&]play=1(&|$)/.test(u.search);
  return false;
}
function siteKidHash(pin){
  var txt = "booqli-kid:" + String(pin || "").replace(/\D/g, "");
  if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)).then(function(b){ return Array.prototype.map.call(new Uint8Array(b), function(x){ return ("0" + x.toString(16)).slice(-2); }).join(""); });
  var h = 0; for (var i = 0; i < txt.length; i++) h = (h * 31 + txt.charCodeAt(i)) | 0; return Promise.resolve("s" + h);
}
(function siteKidGuard(){
  if (!siteKidLock()) return;
  document.documentElement.classList.add("bq-kidlock");
  var fix = function(){
    if (siteKidAllowed(location.href)) return false;
    window.__bqKlGo = true; // כבר בדרך לעמוד אחר – שום בדיקה אחרת לא מפנה שוב
    var u = new URL(location.href);
    if (/^\/topics\/[^/]+(\/|\/index\.html)?$/.test(u.pathname)) { u.searchParams.set("play", "1"); location.replace(u.toString()); }
    else location.replace("/kids/");
    return true;
  };
  if (fix()) return;
  window.addEventListener("pageshow", function(e){ if (e.persisted) fix(); });
  var css = document.createElement("style");
  css.textContent = "html.bq-kidlock .bq-nav,html.bq-kidlock .bq-doors,html.bq-kidlock .crumbs,html.bq-kidlock header .gan,html.bq-kidlock header .btn-wa,html.bq-kidlock .sponsor," +
    "html.bq-kidlock .bq-teach,html.bq-kidlock .bookbox,html.bq-kidlock .share,html.bq-kidlock .kg-win .book,html.bq-kidlock footer,html.bq-kidlock .foot,html.bq-kidlock .site-legal,html.bq-kidlock .site-copy," +
    "html.bq-kidlock .devbar,html.bq-kidlock .backbar,html.bq-kidlock .js-gift,html.bq-kidlock .btn-gift,html.bq-kidlock .js-wa,html.bq-kidlock .bq-owner,html.bq-kidlock .bq-appbar,html.bq-kidlock .bq-join," +
    "html.bq-kidlock a[target=_blank],html.bq-kidlock .room-lock,html.bq-kidlock .like-btn,html.bq-kidlock .fav,html.bq-kidlock .c-act,html.bq-kidlock #ganLink,html.bq-kidlock #waLink{display:none!important}" +
    ".bq-klbtn{position:fixed;left:max(12px,env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:190;border:0;border-radius:999px;background:#2B1526;color:#fff;font:800 14px Assistant,Arial,sans-serif;padding:9px 14px;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer;opacity:.85}" +
    ".bq-kltoast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(64px + env(safe-area-inset-bottom,0px));z-index:195;background:#2B1526;color:#fff;font:800 15px Assistant,Arial,sans-serif;border-radius:999px;padding:9px 18px;direction:rtl;pointer-events:none}" +
    "@media print{.bq-klbtn,.bq-kltoast{display:none}}";
  document.head.appendChild(css);
  var toast = function(){ var t = document.querySelector(".bq-kltoast"); if (t) t.remove(); t = document.createElement("div"); t.className = "bq-kltoast"; t.textContent = "🔒 מצב ילדים – רק משחקים"; document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 1800); };
  // קישורים: רק בתוך אזור הילדים
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href") || "";
    if (h.charAt(0) === "#" || /^javascript:/i.test(h)) return;
    if (!siteKidAllowed(a.href) || a.target === "_blank") { e.preventDefault(); e.stopImmediatePropagation(); toast(); }
  }, true);
  // וואטסאפ, שיתוף וחלונות חדשים מתוך המשחקים
  window.open = function(){ toast(); return null; };
  try { if (navigator.share) navigator.share = function(){ toast(); return Promise.reject(new Error("kidlock")); }; } catch (e) {}
  // כפתור "חזרה" של הטלפון בעמוד הבית של הילדים – נשארים בפנים
  if (/^\/kids\/?(index\.html)?$/.test(location.pathname)) {
    try { history.pushState({bqkl: 1}, "", location.href); } catch (e) {}
    window.addEventListener("popstate", function(){ try { history.pushState({bqkl: 1}, "", location.href); } catch (e) {} });
  }
  var add = function(){
    var b = document.createElement("button"); b.type = "button"; b.className = "bq-klbtn"; b.textContent = "🔒 הורים";
    b.setAttribute("aria-label", "יציאה ממצב ילדים – להורים בלבד");
    b.onclick = siteKidLockExit; document.body.appendChild(b);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();
/* חלון משותף להפעלה וליציאה */
function siteKidModal(html){
  var css = document.getElementById("bqKlCss");
  if (!css) { css = document.createElement("style"); css.id = "bqKlCss";
    css.textContent = ".bq-klm{position:fixed;inset:0;z-index:220;background:rgba(43,21,38,.6);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:Assistant,Arial,sans-serif}" +
      ".bq-klm .c{background:#fff;color:#2B1526;border-radius:26px;max-width:420px;width:100%;max-height:calc(100vh - 32px);overflow:auto;padding:22px 20px 18px;text-align:center;position:relative}" +
      ".bq-klm .c::before{content:'';position:absolute;inset:0 0 auto 0;height:9px;border-radius:26px 26px 0 0;background:linear-gradient(90deg,#FF56C2,#FFC93C,#6F988B)}" +
      ".bq-klm .ic{font-size:46px;line-height:1.1}.bq-klm h2{font-family:Fredoka,Assistant,sans-serif;font-size:24px;margin:4px 0 6px;color:#C13671}" +
      ".bq-klm p{margin:4px 0 10px;color:#6b5a66;font-size:15.5px;line-height:1.45}.bq-klm ul{text-align:right;margin:0 0 12px;padding:0 18px 0 0;font-size:15px;line-height:1.5}" +
      ".bq-klm label{display:block;font-weight:800;margin:8px 0 4px}" +
      ".bq-klm input{width:170px;font:700 28px Fredoka,Assistant,sans-serif;letter-spacing:8px;text-align:center;border:3px solid #CDE7DC;border-radius:16px;padding:6px;direction:ltr}" +
      ".bq-klm input:focus{outline:none;border-color:#FF56C2}" +
      ".bq-klm .go{display:block;width:100%;margin-top:14px;border:0;border-radius:999px;background:#E0399F;color:#fff;font:800 18px Assistant,Arial,sans-serif;padding:13px;cursor:pointer;box-shadow:0 3px 0 #A3216F}" +
      ".bq-klm .no{margin-top:10px;border:0;background:none;color:#4E8576;font:800 15px Assistant,Arial,sans-serif;cursor:pointer;text-decoration:underline}" +
      ".bq-klm .msg{min-height:22px;font-weight:800;color:#C13671;margin-top:8px}";
    document.head.appendChild(css); }
  var m = document.createElement("div"); m.className = "bq-klm"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
  m.innerHTML = '<div class="c">' + html + '</div>'; document.body.appendChild(m);
  m.addEventListener("click", function(e){ if (e.target === m || e.target.closest(".no[data-close]")) m.remove(); });
  var f = m.querySelector("input"); if (f) try { f.focus(); } catch (e) {}
  return m;
}
function siteKidLockStart(){
  if (siteKidLock()) { location.href = "/kids/"; return; }
  var m = siteKidModal('<div class="ic" aria-hidden="true">🔒</div><h2>מצב ילדים</h2>' +
    '<p>מעבירים את הטלפון לילד בראש שקט:</p><ul><li>רק <b>אזור הילדים</b> – כל המשחקים, בכל הגילאים.</li><li>בלי וואטסאפ, בלי קישורים החוצה ובלי חלונות קופצים.</li><li>כדי לצאת צריך את <b>הקוד של ההורה</b>.</li></ul>' +
    '<form novalidate><label for="klP1">בוחרים קוד של 4 ספרות (להורים)</label><input id="klP1" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" type="password">' +
    '<label for="klP2">ושוב, לאישור</label><input id="klP2" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" type="password">' +
    '<div class="msg" aria-live="polite"></div><button type="submit" class="go">🔒 להפעיל מצב ילדים</button></form>' +
    '<button type="button" class="no" data-close>ביטול</button>');
  m.querySelector("form").onsubmit = function(e){
    e.preventDefault();
    var a = m.querySelector("#klP1").value.replace(/\D/g, ""), b = m.querySelector("#klP2").value.replace(/\D/g, ""), msg = m.querySelector(".msg");
    if (a.length !== 4) { msg.textContent = "צריך קוד של 4 ספרות"; return; }
    if (a !== b) { msg.textContent = "הקודים לא זהים. נסו שוב"; return; }
    siteKidHash(a).then(function(h){
      try { localStorage.setItem(SITE_KL_KEY, JSON.stringify({on: 1, h: h, t: Date.now()})); } catch (e2) { msg.textContent = "הדפדפן לא מאפשר לשמור. נסו בדפדפן רגיל"; return; }
      siteEvent("kidlock", "on"); setTimeout(function(){ location.href = "/kids/"; }, 450);
    });
  };
}
function siteKidLockExit(){
  var kl = siteKidLock(); if (!kl) return;
  var a = 12 + Math.floor(Math.random() * 8), b = 3 + Math.floor(Math.random() * 7);
  var m = siteKidModal('<div class="ic" aria-hidden="true">👨‍👩‍👧</div><h2>להורים בלבד</h2><p>כדי לצאת ממצב ילדים, מקלידים את הקוד שבחרתם.</p>' +
    '<form novalidate class="f1"><input id="klIn" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" type="password" aria-label="הקוד של ההורה"><div class="msg" aria-live="polite"></div><button type="submit" class="go">🔓 יציאה ממצב ילדים</button></form>' +
    '<button type="button" class="no" id="klForgot">שכחתי את הקוד</button><br><button type="button" class="no" data-close>חזרה למשחקים</button>');
  var off = function(){ try { localStorage.removeItem(SITE_KL_KEY); } catch (e) {} siteEvent("kidlock", "off"); location.href = "/"; };
  m.querySelector(".f1").onsubmit = function(e){
    e.preventDefault(); var v = m.querySelector("#klIn").value, msg = m.querySelector(".msg");
    siteKidHash(v).then(function(h){ if (h === kl.h) off(); else { msg.textContent = "הקוד לא נכון"; m.querySelector("#klIn").value = ""; } });
  };
  m.querySelector("#klForgot").onclick = function(){
    m.querySelector(".c").innerHTML = '<div class="ic" aria-hidden="true">🧮</div><h2>שאלה להורים</h2><p>כמה זה ' + a + ' × ' + b + '?</p>' +
      '<form novalidate class="f2"><input id="klM" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="התשובה"><div class="msg" aria-live="polite"></div><button type="submit" class="go">🔓 יציאה ממצב ילדים</button></form>' +
      '<button type="button" class="no" data-close>חזרה למשחקים</button>';
    m.querySelector(".f2").onsubmit = function(e){ e.preventDefault(); if (+m.querySelector("#klM").value === a * b) off(); else { m.querySelector(".msg").textContent = "לא נכון. נסו שוב"; m.querySelector("#klM").value = ""; } };
    try { m.querySelector("#klM").focus(); } catch (e) {}
  };
}

/* רישום פעולה (למשל לייק) כביקור בכתובת וירטואלית, כדי שיופיע בלוח המדידה.
   הכתובת מתחלפת לרגע וחוזרת מיד, הדף עצמו לא נטען מחדש. */
var SITE_DIR = location.pathname.replace(/[^/]*$/, ""), siteVirtual = null, siteTimer = null;
function siteTrack(name, kind){
  if (!SITE.analyticsToken || siteOwnerDevice()) return;
  try {
    // הכתובת האמיתית נשמרת פעם אחת, כך שגם כמה לחיצות מהירות נספרות כל אחת בנפרד
    var back = siteVirtual || (location.pathname + location.search + location.hash);
    siteVirtual = back;
    var path = kind ? SITE_DIR + "event/" + kind + "/" + encodeURIComponent(name) : SITE_DIR + "like/" + encodeURIComponent(name);
    // (2.11.2026) בזמן שהכתובת מתחלפת לרגע, תמונות וקישורים יחסיים ("../../games/...") היו נטענים מכתובת שגויה (404).
    // לכן בדיוק לחלון הזה מקבעים <base> לכתובת האמיתית, ומסירים אותו כשהכתובת חוזרת.
    var base = document.getElementById("siteBaseFix");
    if (!base && !document.querySelector("base")) { base = document.createElement("base"); base.id = "siteBaseFix"; base.href = location.origin + back.split("#")[0]; document.head.insertBefore(base, document.head.firstChild); }
    history.pushState(null, "", path);
    clearTimeout(siteTimer);
    siteTimer = setTimeout(function(){ history.replaceState(siteVirtualState, "", siteVirtual || back); siteVirtual = null; siteVirtualState = null; var bf = document.getElementById("siteBaseFix"); if (bf) bf.remove(); }, 400);
  } catch (e) {}
}
/* ספירת פעולות (בלי לדעת מי): הצטרפות לוואטסאפ, מתנה להורים, הזמנת ספר, הצעת מחיר לגן, הדפסה.
   מופיעות בלוח של Cloudflare כעמודים שהכתובת שלהם מכילה event/<סוג>/<מקום> */
function siteEvent(kind, name){ siteTrack(name || "page", kind); }
/* (3.11.2026) מאיפה הגיעו: Cloudflare לא שומר את מה שאחרי "?" בכתובת, ולכן קישור עם utm_source לא נספר.
   כשנכנסים מקישור מסומן – רושמים פעולה event/from/<מקור>-<סוג>-<קמפיין>, פעם אחת בכל ביקור. */
(function siteFrom(){
  try {
    var q = new URLSearchParams(location.search), src = q.get("utm_source");
    if (!src) return;
    var key = [src, q.get("utm_medium") || "", q.get("utm_campaign") || ""].concat(q.get("utm_content") ? [q.get("utm_content")] : []).join("-").replace(/[^\w\u0590-\u05FF-]+/g, "_").slice(0, 80);
    if (sessionStorage.getItem("booqli_from_" + key)) return;
    sessionStorage.setItem("booqli_from_" + key, "1");
    setTimeout(function(){ siteEvent("from", key); }, 1200);
  } catch (e) {}
})();
/* (2.11.2026) שינוי כתובת מתוך עמוד (למשל אזור הילדים) בלי להתנגש במדידה: אם הכתובת כרגע וירטואלית – מעדכנים את מה שיחזור */
var siteVirtualState = null;
function siteSetUrl(url, push, state){
  if (siteVirtual) { siteVirtual = String(url).replace(location.origin, ""); siteVirtualState = state || null; var bf = document.getElementById("siteBaseFix"); if (bf) bf.href = location.origin + siteVirtual.split("#")[0]; return; }
  try { history[push ? "pushState" : "replaceState"](state || null, "", url); } catch (e) {}
}
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

/* ======================== נושאים שנפתחים במספר סודי ========================
   כלל קבוע (מ-31.10.2026): חלק מהנושאים נפתחים רק עם מספר סודי, שכתוב בתיאור קבוצת העדכונים בוואטסאפ.
   מספר אחד פותח את כל הנושאים הנעולים, ונשמר בדפדפן (לא צריך להקליד שוב).
   כאן לא כתוב המספר עצמו, רק "טביעת אצבע" שלו (SHA-256 של "booqli:" + המספר).
   החלפת מספר: מחשבים טביעה חדשה ומחליפים את codeHash. מי שהקליד את הישן יתבקש להקליד את החדש.
   בדיקה בלי מספר: ?unlock=<המספר> בכתובת. */
// lockAllTopics: true = כל עמודי הנושאים (topics/) נעולים, גם נושאים חדשים, חוץ ממה שב-openTopics.
// משחקי ספרי BOOQLI (games/) תמיד פתוחים. השמות משמשים רק לכותרת במסך הנעילה.
window.SITE.lockAllTopics = true;
window.SITE.openTopics = ["calendar", "safety"];  // לוח החופשות + "מה אתה עושה כאן, פחד?" (אזעקות) – פתוחים תמיד לכולם (בקשת שמש 1.11.2026)
window.SITE.locked = { hanukkah: "חנוכה", "birthday-party": "יום הולדת בגן", autumn: "הסתיו", feelings: "עולם הרגשות", "morning-circle": "מפגש בוקר", "last-minute": "הגעתי לא מוכנה", calendar: "לוח החופשות", suppliers: "ספקי המתנות לגן", math: "חשבון לגיל הרך", earthquake: "רעידת אדמה", safety: "מה אתה עושה כאן, פחד?", winter: "החורף", colors: "עולם הצבעים", purim: "פורים", pesach: "פסח", "game-maker": "ממציאים משחק עם כל הגן", "road-safety": "זהירות בדרכים" };
function siteIsLocked(id){ return !!id && SITE.openTopics.indexOf(id) < 0 && (SITE.lockAllTopics || !!SITE.locked[id]); }
window.SITE.codeHash = "b4a218f2f6c3362ac15eed44acc0d7527da1151678f7bc15d0500b9f9b54d2c7";
function siteUnlocked(){ if (siteOwner()) return true; try { return localStorage.getItem("booqli_code") === SITE.codeHash; } catch (e) { return !!window.__booqliOpen; } }
function siteCheckCode(code){
  var txt = "booqli:" + String(code || "").replace(/\D/g, "");
  if (!window.crypto || !crypto.subtle || !window.TextEncoder) return Promise.resolve(false);
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)).then(function(b){
    var h = Array.prototype.map.call(new Uint8Array(b), function(x){ return ("0" + x.toString(16)).slice(-2); }).join("");
    if (h !== SITE.codeHash) return false;
    window.__booqliOpen = true;
    try { localStorage.setItem("booqli_code", h); localStorage.setItem("booqli_join", JSON.stringify({ joined: Date.now() })); } catch (e) {}
    return true;
  });
}
/* ======================== פתיחה הדרגתית (מ-31.10.2026) ========================
   כל נושא שכתוב כאן נעול עד התאריך (שעון ישראל, מחצות). אחרי התאריך – נפתח לבד (ועדיין צריך את המספר הסודי).
   דף הבית קורא את אותה רשימה ומציג "נפתח ב-...". להזיז פתיחה = לשנות תאריך כאן. בדיקה: ?date=2026-11-04 */
window.SITE.opens = {
  "morning-circle": "2026-11-04",  // רביעי
  feelings:         "2026-11-08",  // ראשון
  math:             "2026-11-15",  // ראשון
  earthquake:       "2026-11-18",  // רביעי
  winter:           "2026-11-25",  // רביעי (בלי התאריך הזה היה נפתח בשבת 21.11)
  colors:           "2026-11-01T08:30",  // ראשון 1.11 בשעה 08:30 (בקשת שמש)
  purim:            "2027-02-21",        // ראשון, כחודש לפני פורים (23.3.2027). שמש יכולה לבקש תאריך אחר
  pesach:           "2027-03-25"         // חמישי, יום אחרי שפורים נסגר. ליל הסדר 21.4.2027
};
// תאריך בלבד ("2026-11-29") = נפתח בחצות. תאריך + שעה ("2026-11-01T12:00") = נפתח בשעה הזאת (שעון ישראל).
function siteOpenDate(id){ var o = SITE.opens[id]; return o ? new Date(o.length > 10 ? o + ":00+02:00" : o + "T00:00:00+02:00") : null; }
function siteIsSoon(id){ return !siteOwner() && siteIsSoonRaw(id); }
function siteIsSoonRaw(id){ var d = siteOpenDate(id); return !!d && siteNow() < d; }
function siteSoonGate(id, main){
  var d = siteOpenDate(id), nm = SITE.locked[id] || "התוכן הזה";
  var wd = SITE_DAYS[new Date(SITE.opens[id].slice(0, 10) + "T12:00:00+02:00").getUTCDay()], hm = SITE.opens[id].length > 10 ? " בשעה " + SITE.opens[id].slice(11, 16) : "";
  main.hidden = true;
  var css = document.createElement("style");
  css.textContent = ".soon-gate{max-width:560px;margin:24px max(16px,calc((100% - 560px) / 2)) 10px;background:#fff;border-radius:28px;padding:24px 20px 20px;text-align:center;box-shadow:0 10px 30px rgba(78,133,118,.18);position:relative;overflow:hidden;font-family:Assistant,Arial,sans-serif;color:#2B1526}" +
    ".soon-gate::before{content:'';position:absolute;inset:0 0 auto 0;height:9px;background:linear-gradient(90deg,#FF56C2,#3AA7F0,#6F988B)}" +
    ".soon-gate .lk{font-size:58px;line-height:1.1}.soon-gate h2{font-family:Fredoka,Assistant,sans-serif;color:#C13671;font-size:27px;line-height:1.2;margin:6px 0}" +
    ".soon-gate p{color:#6b5a66;font-size:17px;margin:6px 0}.soon-gate .cd{display:flex;justify-content:center;gap:10px;margin:14px 0}" +
    ".soon-gate .cd div{background:#E1F0EA;border-radius:16px;min-width:72px;padding:8px}.soon-gate .cd b{display:block;font-family:Fredoka,sans-serif;font-size:30px;color:#4E8576}" +
    ".soon-gate a.wa{display:inline-block;margin-top:8px;background:#1FA855;color:#fff;text-decoration:none;font-weight:800;border-radius:999px;padding:11px 20px;box-shadow:0 3px 0 #13773A}" +
    ".soon-gate a.home{display:inline-block;margin-top:12px;color:#C13671;font-weight:800}";
  document.head.appendChild(css);
  var box = document.createElement("section"); box.className = "soon-gate";
  var dm = SITE.opens[id].slice(0, 10).split("-");
  box.innerHTML = '<div class="lk" aria-hidden="true">🎁</div><h2>' + nm + ' נפתח ביום ' + wd + ', ' + (+dm[2]) + '.' + (+dm[1]) + hm + '</h2>' +
    '<p>אנחנו פותחים תוכן חדש כל כמה ימים. חברי קבוצת העדכונים בוואטסאפ מקבלים הודעה ברגע שזה נפתח.</p>' +
    '<div class="cd" aria-live="polite"></div>' +
    '<a class="wa js-wa" target="_blank" rel="noopener" href="' + SITE.whatsappGroup + '">💬 להצטרפות לקבוצת העדכונים</a><br>' +
    '<a class="home" href="../../">לתכנים שכבר פתוחים ←</a>';
  main.parentNode.insertBefore(box, main);
  var tick = function(){ var ms = Math.max(0, d - siteNow()), D = Math.floor(ms / 864e5); ms -= D * 864e5; var H = Math.floor(ms / 36e5); ms -= H * 36e5; var M = Math.floor(ms / 6e4);
    box.querySelector(".cd").innerHTML = "<div><b>" + D + "</b>ימים</div><div><b>" + H + "</b>שעות</div><div><b>" + M + "</b>דקות</div>"; };
  tick(); setInterval(tick, 30000);
  siteEvent("soon-gate", id);
}
/* ======================== מצב משחקים לילדים – בלי מספר סודי (מ-1.11.2026) ========================
   מאזור הילדים (kids/) כל משחק נפתח עם ?play=1. בעמוד הנושא מוצגים אז רק המשחקים שב-KIDS_GAMES (catalog.js),
   בלי מספר סודי. המערכים, דפי ההדפסה והחומרים לגננת מוסתרים ונשארים במספר הסודי.
   עמוד נושא עם משחקים טוען גם את catalog.js (אחרי common.js). המשחקים פתוחים גם לפני תאריך הפתיחה; סגירת עונה עדיין חלה. */
// נקבע פעם אחת בטעינה: siteEvent מחליף את הכתובת לרגע (מדידה), ואז location.search ריק
var SITE_PLAY = /[?&]play=1(&|$)/.test(location.search) && /\/topics\//.test(location.pathname);
function sitePlayMode(){ return SITE_PLAY; }
function siteKidsGames(id){ return (window.KIDS_GAMES || []).filter(function(g){ return g.topic === id; }); }
var SITE_PLAY_KEEP = { "birthday-party": ["games"], math: ["pick", "agePick", "ageArea"], safety: ["now"] };
function sitePlay(id){
  var main = document.querySelector("main"); if (!main) return;
  var keep = siteKidsGames(id).map(function(g){ return (g.href.match(/#(.+)$/) || [])[1]; }).filter(Boolean).concat(SITE_PLAY_KEEP[id] || []);
  document.documentElement.classList.add("bq-play");
  var css = document.createElement("style");
  css.textContent = "html.bq-play [data-bq-hide]{display:none!important}html.bq-play #ageArea>:not([id^='g-']){display:none!important}" +
    ".bq-playbar{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;background:#FFF1C9;border:2px solid #FFD98A;border-radius:20px;padding:10px 14px;margin:14px 0;font-family:Assistant,Arial,sans-serif;font-weight:800;color:#7A4600}" +
    ".bq-playbar a{background:#fff;color:#9A5800;border:2px solid #FFC93C;border-radius:999px;padding:7px 14px;text-decoration:none;white-space:nowrap}" +
    ".bq-teach{margin:22px 0 6px;background:#fff;border-radius:22px;padding:16px;text-align:center;box-shadow:0 4px 0 #d9e9e1;font-family:Assistant,Arial,sans-serif}" +
    ".bq-teach b{color:#C13671}.bq-teach a{display:inline-block;margin-top:8px;color:#4E8576;font-weight:800}" +
    "@media print{.bq-playbar,.bq-teach{display:none}}";
  document.head.appendChild(css);
  Array.prototype.forEach.call(main.children, function(c){
    var ok = c.matches(".hero,.bookbox,.share") || keep.indexOf(c.id) > -1 || (id === "hanukkah" && c.id === "actsGrid") ||
      (c.previousElementSibling && c.previousElementSibling.id === "games" && id === "birthday-party");
    if (!ok) c.setAttribute("data-bq-hide", "");
  });
  // חנוכה: כרטיסי פעילויות – רק המשחקים
  var grid = document.getElementById("actsGrid");
  if (grid) Array.prototype.forEach.call(grid.querySelectorAll("[data-id]"), function(b){ if (keep.indexOf(b.getAttribute("data-id")) < 0) b.setAttribute("data-bq-hide", ""); });
  // כפתורים שמובילים לחלק מוסתר (למשל "למערך") – לא מציגים במצב ילדים
  Array.prototype.forEach.call(main.querySelectorAll('a[href^="#"]'), function(a){
    var tg = document.getElementById(a.getAttribute("href").slice(1));
    if (tg && tg.closest("[data-bq-hide]")) a.setAttribute("data-bq-hide", "");
  });
  var age = ""; try { age = localStorage.getItem("booqli_kid_age") || ""; } catch (e) {}
  var root = SITE_DIR.replace(/topics\/[^/]+\/$/, "");
  var bar = document.createElement("div"); bar.className = "bq-playbar";
  bar.innerHTML = '<span>🎮 משחקים לילדים · בחינם</span><a href="' + root + 'kids/' + (age ? "?age=" + age : "") + '">← לכל המשחקים' + (age ? " לגיל " + age.replace("-", "–") : "") + '</a>';
  var hero = main.querySelector(".hero"); if (hero) hero.insertAdjacentElement("afterend", bar); else main.insertBefore(bar, main.firstChild);
  var t = document.createElement("div"); t.className = "bq-teach";
  t.innerHTML = SITE.openTopics.indexOf(id) > -1 ? '👩‍🏫 <b>להורים ולגננות:</b> בעמוד המלא יש גם דפים להדפסה והסבר למבוגרים.<br><a href="' + SITE_DIR + '">לעמוד המלא ←</a>' :
    '👩‍🏫 <b>גננות?</b> המערך המלא, דפי ההדפסה והחומרים לגן נמצאים בעמוד המלא, ונפתחים במספר הסודי מקבוצת העדכונים.<br><a href="' + SITE_DIR + '">לעמוד המלא לגננות ←</a>';
  var book = main.querySelector(".bookbox"); main.insertBefore(t, book || null);
  siteEvent("play", id);
}
function siteCodeGate(){
  if (window.__bqKlGo) return;
  var m = location.pathname.match(/\/topics\/([^/]+)/), id = m && m[1];
  // משחקי ילדים: פתוחים מיד, גם לפני תאריך הפתיחה של הנושא (בקשת שמש 1.11.2026). סגירת עונה עדיין חלה.
  if (id && siteKidLock() && (!siteKidsGames(id).length || document.querySelector(".closed-box"))) { location.replace("/kids/"); return; }
  if (sitePlayMode() && siteKidsGames(id).length && !document.querySelector(".closed-box")) { sitePlay(id); return; }
  if (siteIsSoon(id)) { var mm = document.querySelector("main"); if (mm && !document.querySelector(".soon-gate")) siteSoonGate(id, mm); return; }
  if (!siteIsLocked(id) || siteUnlocked() || document.querySelector(".closed-box")) return;
  var nm = SITE.locked[id] || "התוכן הזה";
  var main = document.querySelector("main"); if (!main) return;
  var un = new URLSearchParams(location.search).get("unlock");
  main.hidden = true;
  var css = document.createElement("style");
  css.textContent =
    ".code-gate{max-width:560px;margin:24px max(16px,calc((100% - 560px) / 2)) 10px;background:#fff;border-radius:28px;padding:24px 20px 20px;text-align:center;box-shadow:0 10px 30px rgba(78,133,118,.18);position:relative;overflow:hidden;font-family:Assistant,Arial,sans-serif}" +
    ".code-gate::before{content:'';position:absolute;inset:0 0 auto 0;height:9px;background:linear-gradient(90deg,#1FA855,#6F988B,#FF56C2)}" +
    ".code-gate .lk{font-size:58px;line-height:1.1}" +
    ".code-gate h2{font-family:Fredoka,Assistant,sans-serif;color:#C13671;font-size:27px;line-height:1.2;margin:6px 0}" +
    ".code-gate .sub{color:#6b5a66;font-size:17px;margin:0 0 14px}" +
    ".code-gate ol{list-style:none;margin:0 0 16px;padding:0;display:grid;gap:10px;text-align:right}" +
    ".code-gate li{display:flex;gap:12px;align-items:flex-start;background:#F4FAF7;border-radius:16px;padding:10px 12px;font-size:16px;line-height:1.4}" +
    ".code-gate li .n{flex-shrink:0;width:30px;height:30px;border-radius:50%;background:#1FA855;color:#fff;font-weight:800;display:grid;place-items:center}" +
    ".code-gate li a{display:inline-block;margin-top:6px;background:#1FA855;color:#fff;text-decoration:none;font-weight:800;border-radius:999px;padding:9px 16px;box-shadow:0 3px 0 #13773A}" +
    ".code-gate form{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}" +
    ".code-gate input{width:170px;font:inherit;font-family:Fredoka,Assistant,sans-serif;font-size:28px;letter-spacing:6px;text-align:center;border:3px solid #CDE7DC;border-radius:16px;padding:6px 10px;direction:ltr}" +
    ".code-gate input:focus{outline:none;border-color:#FF56C2}" +
    ".code-gate button{font:inherit;font-weight:800;font-size:18px;background:#E0399F;color:#fff;border:0;border-radius:999px;padding:10px 22px;cursor:pointer;box-shadow:0 3px 0 #A3216F}" +
    ".code-gate .msg{min-height:24px;margin-top:8px;font-weight:800}" +
    ".code-gate .msg.bad{color:#E5484D}.code-gate .msg.ok{color:#1FA855}" +
    ".code-gate.shake form{animation:cgShake .4s}" +
    "@keyframes cgShake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}" +
    ".code-gate .help{font-size:14px;color:#6b5a66;margin:12px 0 0}" +
    "@media (prefers-reduced-motion:reduce){.code-gate.shake form{animation:none}}";
  document.head.appendChild(css);
  var box = document.createElement("section");
  box.className = "code-gate"; box.setAttribute("aria-labelledby", "cgT");
  box.innerHTML = '<div class="lk" aria-hidden="true">🔑</div>' +
    '<h2 id="cgT">' + nm + ' פתוח לחברי קבוצת העדכונים</h2>' +
    '<p class="sub">זה בחינם ולוקח חצי דקה. מספר סודי אחד פותח את <b>כל הנושאים באתר</b>, עכשיו ובהמשך.</p>' +
    '<ol>' +
      '<li><span class="n">1</span><span>מצטרפים לקבוצת העדכונים השקטה בוואטסאפ.<br><a class="js-wa" target="_blank" rel="noopener" href="' + SITE.whatsappGroup + '">💬 להצטרפות לקבוצה</a></span></li>' +
      '<li><span class="n">2</span><span>בקבוצה לוחצים על <b>שם הקבוצה</b> למעלה. המספר הסודי כתוב ב<b>תיאור הקבוצה</b>.</span></li>' +
      '<li><span class="n">3</span><span>חוזרים לכאן ומקלידים את המספר:</span></li>' +
    '</ol>' +
    '<form novalidate><label for="cgIn" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">המספר הסודי</label>' +
      '<input id="cgIn" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="8" placeholder="••••">' +
      '<button type="submit">🔓 לפתוח</button></form>' +
    '<div class="msg" aria-live="polite"></div>' +
    '<p class="help">כבר בקבוצה? פשוט פותחים אותה ובודקים בתיאור. את המספר מקלידים פעם אחת, והוא נשמר בדפדפן.</p>' +
    '<p class="help">בהצטרפות לקבוצה שאר החברות יכולות לראות את המספר שלך. BOOQLI לא מעבירה ולא מפרסמת אותו.</p>';
  main.parentNode.insertBefore(box, main);
  var form = box.querySelector("form"), inp = box.querySelector("input"), msg = box.querySelector(".msg");
  var tryCode = function(v){
    return siteCheckCode(v).then(function(ok){
      if (ok) {
        msg.className = "msg ok"; msg.textContent = "🎉 נפתח! תהנו";
        siteEvent("code-ok", id);
        setTimeout(function(){ box.remove(); main.hidden = false; window.scrollTo(0, 0); }, 700);
      } else if (v) {
        msg.className = "msg bad"; msg.textContent = "המספר לא נכון. בדקו שוב בתיאור הקבוצה 🙂";
        box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
        siteEvent("code-bad", id);
      }
      return ok;
    });
  };
  form.addEventListener("submit", function(e){ e.preventDefault(); tryCode(inp.value.trim()); });
  if (un) tryCode(un);
  siteEvent("code-gate", id);
}
(function(){
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", siteCodeGate); else setTimeout(siteCodeGate, 0);
})();

/* ======================== חלון "הצטרפו לקבוצת העדכונים" ========================
   כלל קבוע (מ-31.10.2026): בכניסה לאתר נפתח חלון שמשכנע להצטרף לקבוצת העדכונים השקטה בוואטסאפ.
   לא חוסם את האתר. "אולי אחר כך" = יופיע שוב אחרי againDays ימים. "הצטרפתי" / לחיצה על ההצטרפות = לא יופיע יותר.
   לא מופיע בדפי הדפסה (?sheet=). בדיקה: להוסיף לכתובת ?join=1 כדי לראות אותו תמיד. */
window.SITE.joinPopup = { delayMs: 1500, againDays: 3 };
/* עמודים רגועים (אזעקות): בלי חלונות קופצים – מי שנכנס באזעקה צריך את התוכן מיד */
function siteCalmPage(){ return /\/(topics\/safety|course|kindergartens|order|savta|g)\//.test(location.pathname); }
function siteJoinPopup(){
  if (siteKidLock() || siteCalmPage()) return;
  var qs = location.search || "";
  if (/[?&]sheet=/.test(qs) || document.querySelector(".bq-join") || /\/(offline\.html|app\/)/.test(location.pathname)) return;
  var force = /[?&]join=1/.test(qs), st = null;
  var kids = /\/(kids|school\/(reading|dictation))\//.test(location.pathname) || sitePlayMode(), kidsOk = false;
  try { kidsOk = localStorage.getItem("booqli_kids_ok") === "1"; } catch (e) { kidsOk = true; }
  try { st = JSON.parse(localStorage.getItem("booqli_join") || "{}") || {}; } catch (e) { st = null; }
  var save = function(o){ try { localStorage.setItem("booqli_join", JSON.stringify(o)); } catch (e) {} };
  if (kids && !force) { if (kidsOk) return; }
  else if (!force) {
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
    if (document.querySelector(".bq-join") || document.querySelector(".code-gate") || (!kids && siteUnlocked())) return;
    document.head.appendChild(css);
    if (kids) return siteKidsPopup(css, st, save);
    var box = document.createElement("div");
    box.className = "bq-join"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "bqjT");
    box.innerHTML = '<div class="c">' +
      '<button class="x" type="button" aria-label="סגירה">✕</button>' +
      '<div class="ic" aria-hidden="true">🔔</div>' +
      '<h2 id="bqjT">רוצים לדעת <b>ראשונים</b> כשעולה משחק חדש?</h2>' +
      '<p class="lead">הצטרפו לקבוצת העדכונים השקטה של <bdi style="white-space:nowrap">booqli Games</bdi> בוואטסאפ.</p>' +
      '<ul>' +
        '<li><span class="e">🔑</span><span><b>המספר הסודי</b> שפותח את כל הנושאים באתר כתוב בתיאור הקבוצה.</span></li>' +
        '<li><span class="e">🆕</span><span><b>ראשונים לדעת</b> כשנפתח נושא חדש: חורף, ט"ו בשבט, פורים ועוד הרבה בדרך.</span></li>' +
        '<li><span class="e">⏳</span><span><b>לא מפספסים.</b> התכנים נפתחים לפי עונות השנה, ונסגרים כשהעונה נגמרת.</span></li>' +
        '<li><span class="e">🤫</span><span><b>קבוצה שקטה.</b> רק אנחנו שולחים, רק כשיש משהו חדש. בלי הודעות מאחרים ובלי הצפות.</span></li>' +
        '<li><span class="e">🆓</span><span><b>בחינם.</b> ואפשר לצאת מהקבוצה בכל רגע.</span></li>' +
      '</ul>' +
      '<a class="go js-wa" target="_blank" rel="noopener" href="' + SITE.whatsappGroup + '">💬 אני רוצה להצטרף לקבוצה</a>' +
      '<div class="low"><button type="button" class="later">אולי אחר כך</button><button type="button" class="done">כבר הצטרפתי ✓</button></div>' +
      '<p class="note">כל התכנים באתר מוענקים בחינם, בחסות BOOQLI ❤️<br>בהצטרפות לקבוצה שאר החברות יכולות לראות את המספר שלך. BOOQLI לא מעבירה ולא מפרסמת אותו.</p>' +
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
  setTimeout(show, force ? 300 : (kids ? 600 : SITE.joinPopup.delayMs));
}
/* חלון לאזור הילדים ולמצב משחקים: השימוש באחריות ההורים + המלצה להצטרף לקבוצת העדכונים. פעם אחת בכל מכשיר (booqli_kids_ok). */
function siteKidsPopup(css, st, save){
  var joined = !!(st && st.joined);
  var box = document.createElement("div");
  box.className = "bq-join bq-kids"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "bqkT");
  box.innerHTML = '<div class="c">' +
    '<div class="ic" aria-hidden="true">👨‍👩‍👧</div>' +
    '<h2 id="bqkT">משחקים לילדים – <b>בחינם</b></h2>' +
    '<p class="lead">המשחקים מתאימים לגיל הרך. <b>השימוש של ילדים באתר הוא באחריות ההורים</b> – כדאי לשבת ליד הילד, לשחק יחד ולשים לב לזמן המסך.</p>' +
    (joined ? '' :
    '<ul>' +
      '<li><span class="e">🆕</span><span><b>ממליצים להצטרף לקבוצת העדכונים</b> – ראשונים לדעת כשעולה משחק חדש לגיל של הילד.</span></li>' +
      '<li><span class="e">🤫</span><span><b>קבוצה שקטה.</b> רק אנחנו שולחים, רק כשיש משהו חדש.</span></li>' +
      '<li><span class="e">🆓</span><span><b>בחינם.</b> ואפשר לצאת מהקבוצה בכל רגע.</span></li>' +
    '</ul>' +
    '<a class="go js-wa" target="_blank" rel="noopener" href="' + SITE.whatsappGroup + '">💬 להצטרפות לקבוצת העדכונים</a>') +
    '<div class="low"><button type="button" class="ok"' + (joined ? ' style="background:#E0399F;color:#fff;font-size:18px;padding:12px 22px;border-radius:999px"' : '') + '>הבנתי, בואו נשחק ▶</button></div>' +
    (joined ? '' : '<p class="note">בהצטרפות לקבוצה שאר החברות יכולות לראות את המספר שלך. BOOQLI לא מעבירה ולא מפרסמת אותו.</p>') +
    '</div>';
  var prev = document.activeElement;
  var close = function(){
    try { localStorage.setItem("booqli_kids_ok", "1"); } catch (e) {}
    box.remove(); document.removeEventListener("keydown", onKey, true);
    if (prev && prev.focus) try { prev.focus({ preventScroll: true }); } catch (e) {}
  };
  var onKey = function(e){
    if (e.key === "Escape") { e.stopPropagation(); close(); }
    if (e.key === "Tab") { var f = box.querySelectorAll("a,button"), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  };
  var go = box.querySelector(".go");
  if (go) go.addEventListener("click", function(){ save({ joined: Date.now() }); setTimeout(close, 300); });
  box.querySelector(".ok").onclick = close;
  document.addEventListener("keydown", onKey, true);
  document.body.appendChild(box);
  try { (go || box.querySelector(".ok")).focus({ preventScroll: true }); } catch (e) {}
  siteEvent("kids-popup", sitePlayMode() ? (SITE_DIR.match(/topics\/([^/]+)/) || [,""])[1] : "kids");
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
  siteFavButton(bar);
}

/* ======================== מועדפים (מ-1.11.2026) ========================
   "לשמור לעתיד": נשמר בדפדפן (booqli_favs), אותו זיכרון כמו בכרטיסים (catalog.js). העמוד: /my/ */
function siteFavs(){ try { return JSON.parse(localStorage.getItem("booqli_favs") || "[]") || []; } catch (e) { return []; } }
function siteFavButton(bar){
  var m = location.pathname.match(/\/(topics|games)\/([^/]+)/), id = m && m[2];
  if (!id || !bar) return;
  var css = document.createElement("style");
  css.textContent = ".backbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.backbar .fav{display:inline-flex;align-items:center;gap:6px;background:#fff;color:#C13671;border:2px solid #FF56C2;border-radius:999px;padding:8px 16px;font:inherit;font-weight:800;font-size:15px;cursor:pointer}" +
    ".backbar .fav[aria-pressed=true]{background:#FFE3F4}.backbar .mine{color:#4E8576;font-weight:800;font-size:14px}";
  document.head.appendChild(css);
  var b = document.createElement("button"); b.type = "button"; b.className = "fav";
  var paint = function(){ var on = siteFavs().indexOf(id) > -1; b.setAttribute("aria-pressed", on); b.textContent = on ? "❤️ שמור במועדפים" : "🤍 לשמור לעתיד"; };
  b.onclick = function(){
    var f = siteFavs(), i = f.indexOf(id);
    if (i > -1) f.splice(i, 1); else f.unshift(id);
    try { localStorage.setItem("booqli_favs", JSON.stringify(f)); } catch (e) {}
    siteEvent(i > -1 ? "unfav" : "fav", id); paint();
  };
  paint(); bar.appendChild(b);
  var a = document.createElement("a"); a.className = "mine"; a.href = "/my/"; a.textContent = "המועדפים שלי ←"; bar.appendChild(a);
}

/* ======================== תפריט הדלתות (מ-1.11.2026) ========================
   כלל קבוע: בכל עמוד, מתחת לפס של האתר הראשי – 4 דלתות לפי קהל ועוד קישורים. משנים כאן בלבד. */
window.SITE.doors = [
  { ic: "👩‍🏫", t: "לגננות", href: "/teachers/" },
  { ic: "👨‍👩‍👧", t: "להורים", href: "/parents/" },
  { ic: "🧒", t: "לילדים", href: "/kids/" },
  { ic: "🎒", t: "כיתות א'–ג'", s: "כיתות", href: "/school/" }
];
/* התפריט המלא (☰ תפריט, 2.11.2026): כל הנושאים המרכזיים בקבוצות. נושא עם id מקבל לבד "נפתח ב-..." / "נסגר" לפי SITE.opens / SITE.closes. */
window.SITE.menu = [
  { h: "🧭 ראשי", items: [
    { ic: "🏠", t: "דף הבית", href: "/" },
    { ic: "🗺️", t: "מפת האתר – כל מה שיש", href: "/map/", hot: true },
    { ic: "🔍", t: "חיפוש בכל התכנים", href: "/library/" },
    { ic: "❤️", t: "המועדפים שלי", href: "/my/" } ] },
  { h: "📅 חגים ועונות", items: [
    { ic: "🍂", t: "סתיו", href: "/topics/autumn/", id: "autumn" },
    { ic: "🕎", t: "חנוכה", href: "/topics/hanukkah/", id: "hanukkah" },
    { ic: "🌧️", t: "חורף", href: "/topics/winter/", id: "winter" },
    { ic: "🎭", t: "פורים", href: "/topics/purim/", id: "purim" },
    { ic: "🍷", t: "פסח", href: "/topics/pesach/", id: "pesach" },
    { ic: "🗓️", t: "לוח חופשות תשפ\"ז", href: "/topics/calendar/", id: "calendar" } ] },
  { h: "🧩 פינות קבועות", items: [
    { ic: "🎨", t: "עולם הצבעים", href: "/topics/colors/", id: "colors" },
    { ic: "🔢", t: "חשבון לגיל הרך", href: "/topics/math/", id: "math" },
    { ic: "😊", t: "עולם הרגשות", href: "/topics/feelings/", id: "feelings" },
    { ic: "☀️", t: "מפגש בוקר: 30 רעיונות", href: "/topics/morning-circle/", id: "morning-circle" },
    { ic: "🎂", t: "יום הולדת בגן", href: "/topics/birthday-party/", id: "birthday-party" },
    { ic: "🆘", t: "הגעתי לא מוכנה!", href: "/topics/last-minute/", id: "last-minute" },
    { ic: "🎙️", t: "ממציאים משחק עם כל הגן", href: "/topics/game-maker/", id: "game-maker", hot: true } ] },
  { h: "🛡️ מוגנות ובטיחות", items: [
    { ic: "🚨", t: "אזעקות ומרחב מוגן", href: "/topics/safety/", id: "safety" },
    { ic: "🌍", t: "רעידת אדמה", href: "/topics/earthquake/", id: "earthquake" },
    { ic: "🚦", t: "זהירות בדרכים", href: "/topics/road-safety/", id: "road-safety", hot: true } ] },
  { h: "🧒 לילדים", items: [
    { ic: "🎮", t: "כל המשחקים לפי נושא וגיל", href: "/kids/" },
    { ic: "🎲", t: "חדר המשחקים", href: "/kids/play/" },
    { ic: "🪄", t: "מנפישים את הציור", href: "/kids/animate/" },
    { ic: "📚", t: "משחקי ספרי BOOQLI", href: "/kids/?g=books" } ] },
  { h: "🎒 כיתות א'–ג'", items: [
    { ic: "📖", t: "מסלול הקריאה: מהאותיות ועד קריאה מלאה", href: "/school/reading/", hot: true },
    { ic: "✏️", t: "מאמן ההכתבה: מילות השבוע", href: "/school/dictation/", hot: true },
    { ic: "🎒", t: "כל התכנים לכיתות", href: "/school/" } ] },
  { h: "🎁 מ-BOOQLI", items: [
    { ic: "🏫", t: "ספר אישי לכל ילד בגן", href: "/kindergartens/" },
    { ic: "💛", t: "ספר אישי לנכדים (לסבים)", href: "/savta/" },
    { ic: "🎁", t: "מתנות וספקיות לגן", href: "/gifts/" },
    { ic: "📖", t: "הספר שלכם בכריכה קשה", href: "/book-maker/" },
    { ic: "✍️", t: "קורס: כותבים ספר ילדים", href: "/course/" },
    { ic: "📲", t: "האפליקציה", href: "/app/" } ] }
];
window.SITE.more = SITE.menu.reduce(function(a, g){ return a.concat(g.items); }, []);
function siteDoorsNav(){
  if (document.querySelector(".bq-doors") || /[?&]sheet=/.test(location.search) || /\/offline\.html$/.test(location.pathname)) return;
  var path = location.pathname;
  var css = document.createElement("style");
  css.textContent =
    ".bq-doors{background:#fff;border-bottom:1px solid #E1F0EA;font-family:Assistant,Arial,sans-serif;direction:rtl;position:relative;z-index:39}" +
    ".bq-doors .in{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:6px;padding:6px max(16px,env(safe-area-inset-right,0px)) 6px max(16px,env(safe-area-inset-left,0px))}" +
    ".bq-doors a.d,.bq-doors .mb{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 14px;font-weight:800;font-size:15px;text-decoration:none;color:#2B1526;border:2px solid transparent;background:#F4FAF7;white-space:nowrap;cursor:pointer;font-family:inherit}" +
    ".bq-doors a.d:hover,.bq-doors .mb:hover{border-color:#CDE7DC}" +
    ".bq-doors a.d[aria-current=page]{background:#4E8576;color:#fff}" +
    ".bq-doors .mb{margin-inline-start:auto;background:#fff;border-color:#CDE7DC}" +
    ".bq-doors .menu{position:absolute;top:100%;left:50%;transform:translateX(-50%);width:min(1068px,calc(100% - 32px));max-height:min(78vh,640px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:22px;box-shadow:0 16px 40px rgba(43,21,38,.22);padding:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;z-index:60}" +
    ".bq-doors .menu[hidden]{display:none}" +
    ".bq-doors .mg{background:#F7FBF9;border-radius:16px;padding:8px}" +
    ".bq-doors .mg h4{margin:2px 6px 4px;font-family:Fredoka,Assistant,sans-serif;font-size:16px;color:#4E8576}" +
    ".bq-doors .menu a{display:flex;gap:8px;align-items:center;padding:8px 10px;border-radius:12px;text-decoration:none;color:#2B1526;font-weight:700;font-size:15.5px}" +
    ".bq-doors .menu a:hover,.bq-doors .menu a[aria-current=page]{background:#fff;box-shadow:0 2px 0 #CDE7DC}" +
    ".bq-doors .menu a.hot{background:linear-gradient(90deg,#FFE3F4,#E1F0EA);color:#C13671;font-weight:800}" +
    ".bq-doors .menu a .when{margin-inline-start:auto;font-size:12px;font-weight:800;color:#6B2FA3;background:#F1E3FF;border-radius:999px;padding:1px 8px;white-space:nowrap}" +
    ".bq-doors .menu a .when.cl{color:#6b5a66;background:#F2EEF1}" +
    ".bq-doors .s{display:none}" +
    "@media (max-width:600px){.bq-doors .in{padding:6px max(8px,env(safe-area-inset-right,0px)) 6px max(8px,env(safe-area-inset-left,0px));gap:4px}" +
    ".bq-doors a.d,.bq-doors .mb{flex:1;flex-direction:column;gap:0;padding:4px 2px;border-radius:12px;font-size:12.5px;min-height:46px;justify-content:center}" +
    ".bq-doors .i{font-size:18px;line-height:1.1}.bq-doors .f{display:none}.bq-doors .s{display:inline}.bq-doors .mb{flex:0 0 auto;padding:4px 10px}" +
    ".bq-doors .menu{width:calc(100% - 16px);grid-template-columns:minmax(0,1fr);gap:8px;padding:10px}}" +
    "@media print{.bq-doors{display:none!important}}";
  document.head.appendChild(css);
  var nav = document.createElement("nav");
  nav.className = "bq-doors"; nav.setAttribute("aria-label", "אזורי האתר");
  var cur = function(h){ return h !== "/" && path.indexOf(h) === 0 ? ' aria-current="page"' : (h === "/" && (path === "/" || /\/index\.html$/.test(path) && path.split("/").length < 3) ? ' aria-current="page"' : ""); };
  nav.innerHTML = '<div class="in">' + SITE.doors.map(function(x){
      return '<a class="d" href="' + x.href + '"' + cur(x.href) + '><span class="i" aria-hidden="true">' + x.ic + '</span><span class="f">' + x.t + '</span><span class="s">' + (x.s || x.t) + '</span></a>';
    }).join("") +
    '<button type="button" class="mb" aria-expanded="false" aria-controls="bqMore"><span class="i" aria-hidden="true">☰</span><span>תפריט</span></button></div>' +
    '<div class="menu" id="bqMore" hidden>' + SITE.menu.map(function(g){
      return '<div class="mg"><h4>' + g.h + '</h4>' + g.items.map(function(x){
        var w = "";
        try { if (x.id && siteIsClosed(x.id)) w = '<span class="when cl">נסגר</span>'; else if (x.id && siteIsSoon(x.id)) { var d = siteOpenDate(x.id); w = '<span class="when">נפתח ' + d.getDate() + "." + (d.getMonth() + 1) + '</span>'; } } catch (e) {}
        return '<a href="' + x.href + '"' + cur(x.href) + (x.hot ? ' class="hot"' : '') + '><span aria-hidden="true">' + x.ic + '</span>' + x.t + w + '</a>';
      }).join("") + '</div>'; }).join("") + '</div>';
  var top = document.querySelector(".bq-nav");
  if (top) top.insertAdjacentElement("afterend", nav); else document.body.insertBefore(nav, document.body.firstChild);
  var mb = nav.querySelector(".mb"), menu = nav.querySelector(".menu");
  var close = function(){ menu.hidden = true; mb.setAttribute("aria-expanded", "false"); };
  mb.onclick = function(e){ e.stopPropagation(); menu.hidden = !menu.hidden; mb.setAttribute("aria-expanded", String(!menu.hidden)); };
  document.addEventListener("click", function(e){ if (!nav.contains(e.target)) close(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") close(); });
  nav.addEventListener("click", function(e){ var a = e.target.closest("a"); if (a) siteEvent("nav", (a.getAttribute("href") || "").replace(/\//g, "") || "home"); });
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
    /* תחתית קבועה (מ-1.11.2026): מסמכים, יצירת קשר ושייכות לאתר הראשי */
    if (/[?&]sheet=/.test(location.search) || document.querySelector(".site-legal")) return;
    var l = document.createElement("p");
    l.className = "site-legal";
    l.style.cssText = "margin:0 auto;padding:0 16px 18px;max-width:900px;text-align:center;font-size:13.5px;line-height:1.9";
    var lk = "color:inherit;font-weight:800;text-decoration:underline;display:inline-block;margin:0 5px;white-space:nowrap";
    l.innerHTML = '<a style="' + lk + '" href="/map/">🗺️ מפת האתר</a> · <a style="' + lk + '" href="/privacy/">מדיניות פרטיות</a> · <a style="' + lk + '" href="/terms/">תקנון</a> · <a style="' + lk + '" href="/accessibility/">הצהרת נגישות</a> · ' +
      '<a style="' + lk + '" href="https://wa.me/' + SITE.phone + '" target="_blank" rel="noopener">יצירת קשר</a><br>' +
      '<span>games.booqli.ai מופעל על ידי BOOQLI (עוסק מורשה 558577037) והוא חלק מ-<a style="color:inherit;font-weight:800" href="https://www.booqli.ai/he" target="_blank" rel="noopener">booqli.ai</a> · בחינם · מתאים לגיל הרך · השימוש של ילדים באחריות מבוגר</span>';
    (f || document.body).appendChild(l);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();

/* ======================== פתיחה וסגירה של נושאים ========================
   כלל קבוע: נושא עונתי נסגר בתאריך ובשעה שכתובים כאן (שעון ישראל).
   אחרי הסגירה העמוד ננעל, וכרטיס הנושא בדף הבית מציג "נסגר".
   בדיקה: להוסיף לכתובת ?date=2026-12-03T17:30 כדי לראות איך זה ייראה אחרי הסגירה. */
window.SITE.closes = {
  hanukkah: "2026-12-12T23:59:00+02:00",  // סוף חנוכה: היום השמיני, שבת 12.12.2026
  winter:   "2027-03-19T23:59:00+02:00",  // סוף החורף: יום לפני האביב (20.3.2027). בשנה הבאה – לעדכן
  purim:    "2027-03-24T23:59:00+02:00",  // סוף פורים: שושן פורים, רביעי 24.3.2027. בשנה הבאה – לעדכן
  pesach:   "2027-04-28T23:59:00+03:00",  // סוף חופשת פסח בגנים (חוזרים 29.4.2027). שעון קיץ = +03:00. בשנה הבאה – לעדכן
  autumn:   "2026-12-20T23:59:00+02:00"   // סוף הסתיו: יום לפני תחילת החורף (21.12.2026). בשנה הבאה – לעדכן את התאריך
};
function siteNow(){
  var q = new URLSearchParams(location.search).get("date");
  if (q) { var d = new Date(q.indexOf("T") > 0 ? q : q + "T00:00:00"); if (!isNaN(d)) return d; }
  return new Date();
}
function siteIsClosed(id){ return !siteOwner() && siteIsClosedRaw(id); }
function siteIsClosedRaw(id){ var c = SITE.closes[id]; return !!c && siteNow() >= new Date(c); }
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
  if (siteOwner() && siteIsClosedRaw(id)) {
    var ob = document.createElement("div"); ob.className = "closebar";
    ob.innerHTML = '<div class="in"><div>👑 <b>' + name + ' נסגר לגננות</b> ב' + siteCloseText(id) + '. פתוח רק לך.</div></div>';
    var af = document.querySelector(".backbar") || document.querySelector(".devbar") || document.querySelector(".sponsor") || document.querySelector("header");
    if (af) af.insertAdjacentElement("afterend", ob);
    return;
  }
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
    { icon: "🏫", label: "גני ילדים",   short: "גנים",    href: "https://games.booqli.ai/kindergartens/" }
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
    "@media (min-width:761px){.bq-nav{position:sticky;top:0;box-shadow:0 2px 10px rgba(193,54,113,.10)}html{scroll-padding-top:56px}}" +
    "@media (min-width:761px){.bq-nav .home .t{display:none}}@media (min-width:761px) and (max-width:960px){.bq-nav .f{display:none}.bq-nav .s{display:inline}}" +
    /* טלפון: חמישה כפתורים בשורה אחת, אייקון מעל מילה – נוח לאצבע */
    "@media (max-width:760px){.bq-nav .in{padding:5px max(8px,env(safe-area-inset-right,0px)) 6px max(8px,env(safe-area-inset-left,0px));flex-direction:column;align-items:stretch;gap:4px}" +
    ".bq-nav .home{justify-content:center;font-size:13px}.bq-nav .home .t{display:inline}" +
    ".bq-nav ul{margin:0;display:grid;grid-template-columns:repeat(5,1fr);gap:4px}" +
    ".bq-nav li a{display:flex;flex-direction:column;gap:0;justify-content:center;width:100%;min-height:44px;padding:3px 2px;border-radius:12px;font-size:12.5px;border-width:1.5px}" +
    ".bq-nav li a .i{font-size:17px;line-height:1.1}.bq-nav .f{display:none}.bq-nav .s{display:inline}}" +
    "@media (max-width:420px){.bq-nav .home .t{display:none}}" +
    ".bq-nav li.sh a{background:#1FA855;border-color:#1FA855;color:#fff}.bq-nav li.sh a:hover,.bq-nav li.sh a:focus-visible{background:#168a45;border-color:#168a45}" +
    "@media (max-width:760px){.bq-nav ul.w6{grid-template-columns:repeat(6,1fr)}}" +
    "@media print{.bq-nav{display:none!important}}";
  document.head.appendChild(css);
  var nav = document.createElement("nav");
  nav.className = "bq-nav"; nav.setAttribute("aria-label", "האתר הראשי של BOOQLI");
  var items = SITE.main.links.map(function(l){
    return '<li><a href="' + l.href + '" target="_blank" rel="noopener" title="' + l.label + ' – באתר BOOQLI (נפתח בחלון חדש)">' +
      '<span class="i" aria-hidden="true">' + l.icon + '</span><span class="f">' + l.label + '</span><span class="s">' + l.short + '</span></a></li>';
  }).join("");
  var share = siteShareOk();
  if (share) items += '<li class="sh"><a href="#" target="_blank" rel="noopener" title="שתפו את העמוד: וואטסאפ או העתקת קישור">' +
    '<span class="i" aria-hidden="true">📤</span><span class="f">שתפו עם חברים</span><span class="s">שתפו</span></a></li>';
  nav.innerHTML = '<div class="in"><a class="home" href="' + SITE.main.home + '" target="_blank" rel="noopener" title="לאתר הראשי של BOOQLI (נפתח בחלון חדש)">' +
    '📚 <span>לאתר <b>BOOQLI</b></span><span class="t">· ספרים אישיים שהילד הוא הגיבור ↖</span></a><ul' + (share ? ' class="w6"' : '') + '>' + items + '</ul></div>';
  var sh = nav.querySelector(".sh a");
  if (sh) {
    sh.href = siteShareHref();
    sh.addEventListener("click", function(e){ e.preventDefault(); siteShareMenu(); siteEvent("click", "share_open"); });
  }
  document.body.insertBefore(nav, document.body.firstChild);
}
(function siteConnectMain(){
  function run(){ siteMainNav(); siteDoorsNav(); siteLogoLinks(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();

/* אייקון הלשונית (favicon) – החד־קרן של BOOQLI, לכל העמודים. הקבצים בשורש האתר וב-img/ */
(function siteFavicon(){
  try {
    var cs = document.currentScript, root = cs && cs.src ? cs.src.replace(/common\.js(\?.*)?$/, "") : "/";
    document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]').forEach(function(l){ l.remove(); });
    [["icon", "image/png", "32x32", "img/favicon-32.png"], ["icon", "image/png", "192x192", "img/favicon-192.png"], ["apple-touch-icon", "", "180x180", "img/apple-touch-icon.png"]].forEach(function(a){
      var l = document.createElement("link"); l.rel = a[0]; if (a[1]) l.type = a[1]; l.sizes = a[2]; l.href = root + a[3];
      document.head.appendChild(l);
    });
  } catch (e) {}
})();

/* ======================== אפליקציה לטלפון (מ-31.10.2026) ========================
   האתר מותקן כאפליקציה ישירות מהדפדפן, בלי חנות (PWA): manifest.webmanifest + sw.js בשורש.
   כאן: חיבור הקבצים, כפתור התקנה, ופס קטן "התקינו את האפליקציה" בדף הבית בטלפון.
   עמוד ההסבר: app/ . מדידה: event/app/<פעולה> */
window.SITE.app = { page: "/app/", barDelayMs: 6000 };
window.siteInstallPrompt = null;
function siteIsStandalone(){
  try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (e) { return false; }
}
/* ios = אייפון/אייפד · android · desktop */
function sitePlatform(){
  var ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}
function siteCanInstall(){ return !!window.siteInstallPrompt; }
/* פותח את חלון ההתקנה של הדפדפן (אנדרואיד / כרום / אדג'). מחזיר true אם אישרו */
function siteInstall(where){
  var p = window.siteInstallPrompt;
  siteEvent("app", "install-click-" + (where || "page"));
  if (!p) { location.href = SITE.app.page; return Promise.resolve(false); }
  p.prompt();
  return p.userChoice.then(function(c){
    window.siteInstallPrompt = null;
    if (c && c.outcome === "accepted") { siteEvent("app", "accepted-" + (where || "page")); return true; }
    return false;
  }).catch(function(){ return false; });
}
(function siteApp(){
  try {
    var head = document.head;
    if (!document.querySelector('link[rel="manifest"]')) {
      var m = document.createElement("link"); m.rel = "manifest"; m.href = "/manifest.webmanifest"; head.appendChild(m);
    }
    [["theme-color", "#E1F0EA"], ["mobile-web-app-capable", "yes"], ["apple-mobile-web-app-capable", "yes"],
     ["apple-mobile-web-app-title", "booqli Games"], ["apple-mobile-web-app-status-bar-style", "default"]].forEach(function(a){
      if (document.querySelector('meta[name="' + a[0] + '"]')) return;
      var t = document.createElement("meta"); t.name = a[0]; t.content = a[1]; head.appendChild(t);
    });
  } catch (e) {}
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function(){ navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function(){}); });
  }
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault(); window.siteInstallPrompt = e;
    document.dispatchEvent(new Event("site-can-install"));
  });
  window.addEventListener("appinstalled", function(){
    window.siteInstallPrompt = null;
    try { localStorage.setItem("booqli_app", JSON.stringify({ installed: Date.now() })); } catch (e) {}
    siteEvent("app", "installed");
    document.dispatchEvent(new Event("site-installed"));
    var b = document.querySelector(".bq-appbar"); if (b) b.remove();
    siteKidsPack();
  });
  if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", function(e){
    var d = e.data; if (!d || d.type !== "kids-pack") return;
    try { if (d.state === "ready") localStorage.setItem("booqli_offline", String(Date.now())); } catch (er) {}
    if (d.state === "ready" && d.total) siteEvent("app", "offline-ready");
    document.dispatchEvent(new CustomEvent("site-offline", { detail: d }));
  });
  if (siteIsStandalone() || /[?&]offline=1/.test(location.search)) {
    window.addEventListener("load", function(){ try { if (sessionStorage.getItem("booqli_pack")) return; sessionStorage.setItem("booqli_pack", "1"); } catch (e) {} siteKidsPack(); });
  }
  if (siteIsStandalone()) {
    try { if (!sessionStorage.getItem("booqli_app_open")) { sessionStorage.setItem("booqli_app_open", "1"); setTimeout(function(){ siteEvent("app", "open"); }, 800); } } catch (e) {}
    document.documentElement.classList.add("in-app");
  }
})();
/* משחקי הילדים בלי אינטרנט (מ-2.11.2026): באפליקציה המותקנת מורידים ברקע את כל משחקי הילדים (sw.js + offline-pack.json).
   פעם אחת בכל פתיחה של האפליקציה (מעדכן רק מה שהשתנה). בדיקה בדפדפן: ?offline=1.
   siteOfflineReady() = כבר נשמרו בטלפון. העמודים מקשיבים לאירוע "site-offline" (detail: state/done/total). */
function siteKidsPack(){
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.ready.then(function(r){ if (r.active) r.active.postMessage({ type: "kids-pack" }); }).catch(function(){});
}
function siteOfflineReady(){ try { return !!localStorage.getItem("booqli_offline"); } catch (e) { return false; } }
/* שורת מצב קטנה: <p data-offline-note hidden></p> בעמוד – מתמלאת לבד (באפליקציה, או כשהמשחקים כבר שמורים) */
(function(){
  function paint(d){
    var els = document.querySelectorAll("[data-offline-note]"); if (!els.length) return;
    var txt = "";
    if (d && d.state === "loading" && d.total) txt = "⬇️ שומרים את משחקי הילדים בטלפון… " + Math.round(100 * d.done / d.total) + "%";
    else if ((d && d.state === "ready") || siteOfflineReady()) txt = "✈️ כל משחקי הילדים שמורים בטלפון – אפשר לשחק גם בלי אינטרנט";
    else if (siteIsStandalone()) txt = "⬇️ שומרים את משחקי הילדים בטלפון…";
    els.forEach(function(el){ el.textContent = txt; el.hidden = !txt; });
  }
  document.addEventListener("site-offline", function(e){ paint(e.detail); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ paint(); }); else paint();
})();
/* חלון קטן "התקינו את האפליקציה" (מ-1.11.2026, בקשת שמש): בכל ביקור, עד שמתקינים.
   פעם אחת בכל ביקור (לא בכל עמוד). לא באזור הילדים, לא בדפי הדפסה, לא בתוך האפליקציה, לא במכשיר של שמש.
   במחשב – רק כשהדפדפן מאפשר התקנה. לא קופץ יחד עם חלון הוואטסאפ או המספר הסודי. בדיקה: ?appbar=1 */
function siteAppBar(){
  if (siteKidLock() || siteCalmPage()) return;
  var force = /[?&]appbar=1/.test(location.search);
  if (siteIsStandalone() || (siteOwnerDevice() && !force) || /[?&]sheet=/.test(location.search) || /^\/(kids|app)\/|\/offline\.html$/.test(location.pathname)) return;
  var st = {};
  try { st = JSON.parse(localStorage.getItem("booqli_app") || "{}") || {}; } catch (e) {}
  if (!force && st.installed) return;
  var seen = false; try { seen = sessionStorage.getItem("booqli_app_visit") === "1"; } catch (e) {}
  if (!force && seen) return;
  var save = function(o){ try { localStorage.setItem("booqli_app", JSON.stringify(o)); } catch (e) {} };
  var tries = 0;
  var show = function(){
    if (!force && sitePlatform() === "desktop" && !siteCanInstall()) { if (++tries < 6) setTimeout(show, 3000); return; }
    // לא מתנגשים עם חלון ההצטרפות, המספר הסודי או חלון מידע
    if (document.querySelector(".bq-join,.code-gate,.bq-appbar,.c-modal,.soon-gate")) { if (++tries < 40) setTimeout(show, 4000); return; }
    try { sessionStorage.setItem("booqli_app_visit", "1"); } catch (e) {}
    var css = document.createElement("style");
    css.textContent =
      ".bq-appbar{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:150;max-width:520px;margin:0 auto;display:flex;align-items:center;gap:10px;background:#fff;color:#2B1526;border-radius:20px;padding:10px 10px 10px 12px;box-shadow:0 10px 30px rgba(43,21,38,.25);border:2px solid #E1F0EA;font-family:Assistant,Arial,sans-serif;direction:rtl;animation:bqaUp .4s cubic-bezier(.2,.9,.3,1.2)}" +
      ".bq-appbar img{width:46px;height:46px;border-radius:12px;flex-shrink:0}" +
      ".bq-appbar .t{flex:1;min-width:0;font-size:14px;line-height:1.3}.bq-appbar .t b{display:block;font-family:Fredoka,Assistant,sans-serif;font-size:16.5px;color:#C13671}" +
      ".bq-appbar .go{background:#E0399F;color:#fff;border:0;border-radius:999px;padding:10px 14px;font:inherit;font-weight:800;font-size:15px;cursor:pointer;white-space:nowrap;text-decoration:none;flex-shrink:0}" +
      ".bq-appbar .x{background:#F2F2F2;border:0;border-radius:50%;width:30px;height:30px;color:#6b5a66;font-weight:800;cursor:pointer;flex-shrink:0;line-height:1}" +
      "@keyframes bqaUp{from{transform:translateY(120%);opacity:0}}" +
      "@media (prefers-reduced-motion:reduce){.bq-appbar{animation:none}}@media print{.bq-appbar{display:none!important}}";
    document.head.appendChild(css);
    var bar = document.createElement("div");
    bar.className = "bq-appbar"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "התקנת האפליקציה");
    bar.innerHTML = '<button class="x" type="button" aria-label="סגירה">✕</button>' +
      '<img src="/img/app/icon-192.png" alt="" width="46" height="46">' +
      '<span class="t"><b>booqli Games כאפליקציה 📲</b>' + (sitePlatform() === "ios" ? "בשתי לחיצות: שיתוף ← הוספה למסך הבית. בחינם." : "אייקון על המסך, נפתח בלחיצה אחת. בחינם.") + '</span>' +
      '<a class="go" href="' + SITE.app.page + '">להתקנה</a>';
    bar.querySelector(".x").onclick = function(){ save({ later: Date.now() }); bar.remove(); siteEvent("app", "bar-close"); };
    bar.querySelector(".go").addEventListener("click", function(e){
      if (siteCanInstall()) { e.preventDefault(); siteInstall("bar").then(function(ok){ if (ok) bar.remove(); }); }
    });
    document.body.appendChild(bar);
    siteEvent("app", "bar-show");
  };
  setTimeout(show, force ? 300 : SITE.app.barDelayMs);
}
(function(){
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", siteAppBar); else siteAppBar();
})();

/* ======================== מצב בעלת האתר: הפעלה וכפתור 👑 ======================== */
(function siteOwnerMode(){
  var qs = new URLSearchParams(location.search), k = qs.get("owner");
  var clean = function(){ qs.delete("owner"); var q = qs.toString(); try { history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash); } catch (e) {} };
  if (k === "off") {
    try { localStorage.removeItem("booqli_owner"); localStorage.removeItem("booqli_owner_off"); } catch (e) {}
    clean(); location.reload(); return;
  }
  if (k && window.crypto && crypto.subtle && window.TextEncoder) {
    crypto.subtle.digest("SHA-256", new TextEncoder().encode("booqli-owner:" + k)).then(function(b){
      var h = Array.prototype.map.call(new Uint8Array(b), function(x){ return ("0" + x.toString(16)).slice(-2); }).join("");
      clean();
      if (h !== SITE.ownerHash) return;
      try { localStorage.setItem("booqli_owner", h); localStorage.removeItem("booqli_owner_off"); localStorage.setItem("booqli_join", JSON.stringify({ joined: Date.now() })); } catch (e) {}
      try { sessionStorage.setItem("booqli_owner_hi", "1"); } catch (e) {}
      location.reload();
    });
    return;
  }
  if (!siteOwnerDevice() || /[?&]sheet=/.test(location.search)) return;
  var add = function(){
    var on = siteOwner();
    var css = document.createElement("style");
    css.textContent = ".bq-owner{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:160;display:flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:8px 14px;font:800 14px Assistant,Arial,sans-serif;cursor:pointer;direction:rtl;box-shadow:0 6px 18px rgba(43,21,38,.25)}" +
      ".bq-owner.on{background:#FFB020;color:#2B1526}.bq-owner.off{background:#fff;color:#6b5a66;border:2px dashed #FFB020}" +
      ".bq-owner-hi{position:fixed;left:50%;top:20px;transform:translateX(-50%);z-index:210;background:#2B1526;color:#fff;border-radius:16px;padding:12px 18px;font:700 16px Assistant,Arial,sans-serif;text-align:center;max-width:calc(100% - 32px);box-shadow:0 10px 30px rgba(0,0,0,.3)}" +
      "@media print{.bq-owner,.bq-owner-hi{display:none!important}}";
    document.head.appendChild(css);
    var b = document.createElement("button"); b.type = "button"; b.className = "bq-owner " + (on ? "on" : "off");
    b.textContent = on ? "👑 מצב בעלת האתר" : "👀 רואה כמו גננת · לחזור 👑";
    b.title = on ? "לחיצה: לראות את האתר כמו גננת רגילה" : "לחיצה: לחזור למצב בעלת האתר (הכל פתוח)";
    b.setAttribute("aria-label", b.title);
    b.onclick = function(){ try { if (on) localStorage.setItem("booqli_owner_off", "1"); else localStorage.removeItem("booqli_owner_off"); } catch (e) {} location.reload(); };
    document.body.appendChild(b);
    var bar = document.querySelector(".bq-appbar"); if (bar) bar.remove();
    var hi = false; try { hi = sessionStorage.getItem("booqli_owner_hi") === "1"; sessionStorage.removeItem("booqli_owner_hi"); } catch (e) {}
    if (hi) { var t = document.createElement("div"); t.className = "bq-owner-hi"; t.setAttribute("role", "status"); t.textContent = "👑 שלום שמש! המכשיר הזה זוכר אותך – כל התכנים פתוחים לך."; document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 4500); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();

/* ======================== בלי "קפיצות" בטעינה (מ-1.11.2026) ========================
   הסרגלים העליונים (BOOQLI, הדלתות) והפסים שמתחת לכותרת (חזרה, "זמין עד", בפיתוח) נוספים בקוד.
   קודם הם נוספו אחרי שהעמוד כבר הוצג, וכל התוכן "קפץ" למטה (CLS גרוע בלוח המדידה).
   עכשיו כל עמוד מסתיר את עצמו לרגע (קטע קטן ב-<head>), וכאן מציגים אותו מיד כשהכל במקום.
   גיבוי: אם הקובץ הזה לא נטען – העמוד מוצג לבד אחרי 1.5 שניות. עמוד חדש: להעתיק את הקטע מה-<head> של עמוד קיים. */
(function siteReveal(){
  function show(){ document.documentElement.classList.add("bq-ready"); }
  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", show); else show();
})();

/* ======================== "שתפו" בפס העליון (מ-2.11.2026, בקשת שמש) ========================
   כפתור ירוק קבוע בפס הוורוד־מנטה שבראש כל עמוד (siteMainNav). פותח חלונית: וואטסאפ / העתקת ההודעה + הקישור / שיתוף לאפליקציה אחרת,
   עם הודעה מוכנה + קישור לעמוד הזה (utm_source=whatsapp&utm_medium=share). מדידה: share_wa.
   לא באזור הילדים ובמצב ילדים. הודעה מיוחדת לעמוד: <meta name="bq-share" content="..."> */
function siteShareOk(){ return !siteKidLock() && !sitePlayMode() && !/^\/(kids|order)\//.test(location.pathname); }
function siteShareText(src){
  var meta = document.querySelector('meta[name="bq-share"]');
  var name = (document.title || "").split(/ [·|] /)[0].trim();
  var url = location.origin + location.pathname + "?utm_source=" + (src || "whatsapp") + "&utm_medium=share";
  var text = meta ? meta.content :
    "מצאתי אתר מקסים לגיל הרך 💜 משחקים, דפי עבודה ופעילויות לגננות ולהורים, בחינם, ואתר בטוח להורים ולילדים" + (name && !/^booqli Games/i.test(name) ? ":\n" + name : "");
  return text + "\n" + url;
}
function siteShareHref(){ return "https://wa.me/?text=" + encodeURIComponent(siteShareText("whatsapp")); }
/* חלונית "שתפו" (מ-2.11.2026, בקשת שמש): וואטסאפ · העתקת ההודעה + הקישור (לפייסבוק, למייל, לכל מקום) · שיתוף לאפליקציה אחרת (בטלפון) */
function siteShareMenu(){
  var old = document.querySelector(".bq-sharebox"); if (old) { old.remove(); return; }
  if (!document.getElementById("bqShareCss")) {
    var css = document.createElement("style"); css.id = "bqShareCss";
    css.textContent =
      ".bq-sharebox{position:fixed;inset:0;z-index:300;background:rgba(43,21,38,.45);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:Assistant,Arial,sans-serif}" +
      ".bq-sharebox .c{background:#fff;border-radius:24px;padding:20px 18px 16px;width:100%;max-width:380px;box-shadow:0 14px 40px rgba(0,0,0,.3);text-align:center;color:#2B1526}" +
      ".bq-sharebox h3{margin:0 0 4px;font:700 21px Fredoka,Assistant,sans-serif;color:#C13671}" +
      ".bq-sharebox p{margin:0 0 12px;color:#6b5a66;font-size:15px}" +
      ".bq-sharebox .o{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:0;border-radius:999px;padding:13px 16px;margin:8px 0 0;font:800 17px Assistant,Arial,sans-serif;cursor:pointer;text-decoration:none;box-sizing:border-box}" +
      ".bq-sharebox .wa{background:#1FA855;color:#fff}.bq-sharebox .cp{background:#E1F0EA;color:#2F6B5C}.bq-sharebox .ot{background:#FCE4F1;color:#C13671}" +
      ".bq-sharebox .cp.ok{background:#2F6B5C;color:#fff}" +
      ".bq-sharebox .x{margin-top:10px;background:none;border:0;color:#6b5a66;font:700 15px Assistant,sans-serif;cursor:pointer;text-decoration:underline}" +
      ".bq-sharebox pre{white-space:pre-wrap;text-align:right;background:#F7F4F6;border-radius:14px;padding:10px 12px;margin:0;font:14px/1.45 Assistant,Arial,sans-serif;color:#2B1526;max-height:120px;overflow:auto;word-break:break-word}";
    document.head.appendChild(css);
  }
  var copyText = siteShareText("copy");
  var box = document.createElement("div"); box.className = "bq-sharebox";
  box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "שיתוף העמוד");
  box.innerHTML = '<div class="c"><h3>📤 שתפו עם חברים</h3><p>ההודעה שתישלח:</p><pre></pre>' +
    '<a class="o wa" href="' + siteShareHref() + '" target="_blank" rel="noopener">💬 שליחה בוואטסאפ</a>' +
    '<button class="o cp" type="button">📋 העתקת ההודעה והקישור</button>' +
    (navigator.share ? '<button class="o ot" type="button">📲 שיתוף באפליקציה אחרת</button>' : "") +
    '<button class="x" type="button">סגירה</button></div>';
  box.querySelector("pre").textContent = copyText;
  var close = function(){ box.remove(); document.removeEventListener("keydown", esc); };
  var esc = function(e){ if (e.key === "Escape") close(); };
  document.addEventListener("keydown", esc);
  box.addEventListener("click", function(e){ if (e.target === box) close(); });
  box.querySelector(".x").onclick = close;
  box.querySelector(".wa").addEventListener("click", function(){ siteEvent("click", "share_wa"); setTimeout(close, 300); });
  var cp = box.querySelector(".cp");
  cp.onclick = function(){
    var done = function(){ cp.classList.add("ok"); cp.textContent = "✅ הועתק! אפשר להדביק בפייסבוק, במייל או בכל מקום"; siteEvent("click", "share_copy"); };
    var fallback = function(){ var t = document.createElement("textarea"); t.value = copyText; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); done(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(copyText).then(done, fallback); else fallback();
  };
  var ot = box.querySelector(".ot");
  if (ot) ot.onclick = function(){
    var t = siteShareText("share"), i = t.lastIndexOf("\n");
    navigator.share({ text: t.slice(0, i), url: t.slice(i + 1) }).then(function(){ siteEvent("click", "share_native"); close(); }).catch(function(){});
  };
  document.body.appendChild(box);
  box.querySelector(".wa").focus();
}

/* ======================== כרטיסיות רצות (קרוסלה, 2.11.2026) ========================
   siteCarousel(box, {every: 5000, label: "תגובות"}) – כל ילד ישיר של box הופך לכרטיס. מוצג כרטיס אחד בכל פעם,
   רץ לבד מימין לשמאל, עם חיצים, כפתור עצירה, נקודות והחלקה באצבע. עוצר כשהעכבר/האצבע על הכרטיס,
   כשהוא לא על המסך, ובמכשירים שביקשו "פחות תנועה". */
function siteCarousel(box, opt){
  if (!box || box.dataset.car) return; opt = opt || {};
  var slides = Array.prototype.slice.call(box.children); if (slides.length < 2) return;
  box.dataset.car = "1";
  if (!document.getElementById("siteCarCss")) {
    var css = document.createElement("style"); css.id = "siteCarCss";
    css.textContent = ".s-car{position:relative;direction:rtl}.s-car .vp{overflow:hidden;border-radius:22px;touch-action:pan-y}" +
      ".s-car .tr{display:flex;direction:ltr;transition:transform .55s cubic-bezier(.4,.1,.2,1);align-items:stretch}" +
      ".s-car .sl{flex:0 0 100%;min-width:0;direction:rtl;display:flex;justify-content:center;align-items:center}.s-car .sl>*{margin:0;width:100%}" +
      ".s-car .ctl{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px;flex-wrap:wrap}" +
      ".s-car .ctl button{border:0;cursor:pointer;font:inherit;font-weight:800;border-radius:999px;background:#fff;color:#4E8576;box-shadow:0 2px 0 #CDE7DC;min-width:44px;height:44px;font-size:20px;padding:0 12px}" +
      ".s-car .ctl button:focus-visible{outline:3px solid #FF56C2;outline-offset:2px}" +
      ".s-car .dots{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:60%}.s-car .dots button{min-width:0;width:10px;height:10px;padding:0;box-shadow:none;background:#CDE7DC}" +
      ".s-car .dots button[aria-current=true]{background:#FF56C2;width:22px}.s-car .num{font-size:14px;font-weight:800;color:#6b5a66;min-width:44px;text-align:center}" +
      "@media (prefers-reduced-motion:reduce){.s-car .tr{transition:none}}@media print{.s-car .ctl{display:none}.s-car .tr{transform:none!important;flex-direction:column}}";
    document.head.appendChild(css);
  }
  var wrap = document.createElement("div"); wrap.className = "s-car"; wrap.setAttribute("role", "region"); wrap.setAttribute("aria-roledescription", "קרוסלה"); wrap.setAttribute("aria-label", opt.label || "כרטיסיות");
  var vp = document.createElement("div"); vp.className = "vp"; vp.setAttribute("aria-live", "off");
  var tr = document.createElement("div"); tr.className = "tr";
  slides.forEach(function(s, i){ var d = document.createElement("div"); d.className = "sl"; d.setAttribute("role", "group"); d.setAttribute("aria-label", (i + 1) + " מתוך " + slides.length); d.appendChild(s); tr.appendChild(d); });
  vp.appendChild(tr); wrap.appendChild(vp);
  var many = slides.length > 12;
  var ctl = document.createElement("div"); ctl.className = "ctl";
  ctl.innerHTML = '<button type="button" class="nx" aria-label="הקודם">→</button><button type="button" class="pp" aria-label="עצירה">⏸</button>' +
    (many ? '<span class="num"></span>' : '<span class="dots">' + slides.map(function(_, i){ return '<button type="button" aria-label="כרטיס ' + (i + 1) + '"></button>'; }).join("") + '</span>') +
    '<button type="button" class="pv" aria-label="הבא">←</button>';
  wrap.appendChild(ctl);
  box.innerHTML = ""; box.appendChild(wrap);
  var i = 0, n = slides.length, user = false, hover = false, seen = true, tm = null;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm) user = true;
  var pp = ctl.querySelector(".pp");
  var go = function(k){
    i = (k + n) % n; tr.style.transform = "translateX(" + (-100 * i) + "%)";
    tr.querySelectorAll(".sl").forEach(function(s, j){ s.setAttribute("aria-hidden", j === i ? "false" : "true"); s.querySelectorAll("a,button,video").forEach(function(x){ if (j === i) x.removeAttribute("tabindex"); else x.setAttribute("tabindex", "-1"); }); });
    var ds = ctl.querySelectorAll(".dots button"); ds.forEach(function(d, j){ d.setAttribute("aria-current", j === i ? "true" : "false"); });
    var nm = ctl.querySelector(".num"); if (nm) nm.textContent = (i + 1) + " / " + n;
  };
  var paint = function(){ pp.textContent = user ? "▶" : "⏸"; pp.setAttribute("aria-label", user ? "להפעיל שוב" : "עצירה"); };
  var tick = function(){ clearInterval(tm); tm = setInterval(function(){ if (!user && !hover && seen && !document.hidden) go(i + 1); }, opt.every || 5000); };
  ctl.querySelector(".pv").onclick = function(){ go(i + 1); tick(); };
  ctl.querySelector(".nx").onclick = function(){ go(i - 1); tick(); };
  pp.onclick = function(){ user = !user; paint(); if (!user) go(i + 1); tick(); };
  ctl.querySelectorAll(".dots button").forEach(function(d, j){ d.onclick = function(){ go(j); tick(); }; });
  vp.addEventListener("mouseenter", function(){ hover = true; }); vp.addEventListener("mouseleave", function(){ hover = false; });
  wrap.addEventListener("focusin", function(){ hover = true; }); wrap.addEventListener("focusout", function(){ hover = false; });
  /* החלקה באצבע: שמאלה = הבא (כמו כיוון הריצה) */
  var x0 = null, y0 = 0;
  vp.addEventListener("touchstart", function(e){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; hover = true; }, {passive: true});
  vp.addEventListener("touchend", function(e){ hover = false; if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(dx < 0 ? i + 1 : i - 1); tick(); } }, {passive: true});
  vp.addEventListener("keydown", function(e){ if (e.key === "ArrowLeft") { go(i + 1); tick(); } else if (e.key === "ArrowRight") { go(i - 1); tick(); } });
  /* וידאו שמתנגן – עוצרים את הריצה */
  wrap.querySelectorAll("video").forEach(function(v){ v.addEventListener("play", function(){ user = true; paint(); }); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function(es){ seen = es[0].isIntersecting; }, {threshold: .4}).observe(vp);
  go(0); paint(); tick();
  return {go: go};
}
