/* booqli Games – "המנוע" של האפליקציה בטלפון (Service Worker)
   - דפים, קוד ונתונים: תמיד מהאינטרנט קודם (כדי שכל עדכון באתר יופיע מיד באפליקציה).
     אם אין אינטרנט – הגרסה האחרונה ששמורה בטלפון, ואם אין – דף "אין חיבור".
   - תמונות וגופנים: מהטלפון מיד (מהיר), ומתעדכנים ברקע.
   - עמוד האזעקות ("מה אתה עושה כאן, פחד?") נשמר בטלפון כבר בהתקנה (CALM), ודפים שמורים נפתחים מהטלפון
     אם הרשת איטית יותר מ-3 שניות (רשת עמוסה באזעקה) – ומתעדכנים ברקע.
   מעלים את VERSION רק כשמשנים את הקובץ הזה עצמו. */
var VERSION = "booqli-v4";
var CALM = ["/topics/safety/"];
var CORE = [
  "/",
  "/offline.html",
  "/common.js",
  "/catalog.js",
  "/site.css",
  "/manifest.webmanifest",
  "/img/app/icon-192.png",
  "/img/logo.png",
  "/img/logo-dark.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return c.addAll(CORE).then(function () { return Promise.all(CALM.map(function (u) { return c.add(u).catch(function () {}); })); });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isAsset(url) {
  return /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|mp3|wav|ogg)$/i.test(url.pathname) ||
    url.hostname === "fonts.gstatic.com";
}

function put(req, res) {
  if (!res || (res.status !== 200 && res.type !== "opaque")) return;
  var copy = res.clone();
  caches.open(VERSION).then(function (c) { c.put(req, copy); }).catch(function () {});
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  var url = new URL(req.url);
  var same = url.origin === self.location.origin;
  var font = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!same && !font) return; // מדידה, וואטסאפ, האתר הראשי – לא נוגעים

  if (isAsset(url) || font) {
    // תמונות וגופנים: מהר מהטלפון, ומתעדכנים ברקע
    e.respondWith(
      caches.match(req).then(function (hit) {
        var net = fetch(req).then(function (res) { put(req, res); return res; }).catch(function () { return hit; });
        return hit || net;
      })
    );
    return;
  }

  // דפים, קוד ונתונים: קודם מהאינטרנט
  // קוד ונתונים (js/json/css) – תמיד בודקים מול השרת, כדי שעדכון באתר יגיע מיד גם אם הדפדפן שמר עותק
  var fresh = req.mode === "navigate" ? fetch(req) : fetch(req, { cache: "no-cache" });
  var netFirst = fresh.then(function (res) { put(req, res); return res; });
  // דף שכבר שמור בטלפון: אם הרשת לא עונה תוך 3 שניות – פותחים את השמור (והרשת ממשיכה לעדכן ברקע)
  if (req.mode === "navigate") {
    e.respondWith(new Promise(function (resolve) {
      var done = false, finish = function (r) { if (!done && r) { done = true; resolve(r); } };
      var t = setTimeout(function () { caches.match(req, { ignoreSearch: true }).then(finish); }, 3000);
      netFirst.then(function (res) { clearTimeout(t); finish(res); }).catch(function () {
        clearTimeout(t);
        caches.match(req).then(function (hit) { return hit || caches.match(req, { ignoreSearch: true }); })
          .then(function (hit) { return hit || caches.match("/offline.html"); }).then(function (r) { finish(r || Response.error()); });
      });
    }));
    return;
  }
  e.respondWith(
    netFirst.catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        return caches.match(req, { ignoreSearch: true }).then(function (hit2) {
          if (hit2) return hit2;
          if (req.mode === "navigate") return caches.match("/offline.html");
          return Response.error();
        });
      });
    })
  );
});
