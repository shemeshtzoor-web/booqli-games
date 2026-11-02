/* booqli Games – "המנוע" של האפליקציה בטלפון (Service Worker)
   - דפים, קוד ונתונים: תמיד מהאינטרנט קודם (כדי שכל עדכון באתר יופיע מיד באפליקציה).
     אם אין אינטרנט – הגרסה האחרונה ששמורה בטלפון, ואם אין – דף "אין חיבור".
   - תמונות וגופנים: מהטלפון מיד (מהיר), ומתעדכנים ברקע.
   - עמוד האזעקות ("מה אתה עושה כאן, פחד?") נשמר בטלפון כבר בהתקנה (CALM), ודפים שמורים נפתחים מהטלפון
     אם הרשת איטית יותר מ-3 שניות (רשת עמוסה באזעקה) – ומתעדכנים ברקע.
   - משחקי הילדים בלי אינטרנט (מ-2.11.2026, בקשת שמש): כשהאפליקציה מותקנת, common.js שולח "kids-pack"
     וכאן מורידים ברקע את כל מה שב-/offline-pack.json (כל משחקי הילדים, ~16MB, בלי סרטונים ו-PDF) למטמון KIDS.
     המטמון הזה לא נמחק כשמעלים VERSION. כל פתיחה של האפליקציה בודקת אם הרשימה השתנתה ומעדכנת רק את מה שצריך.
     משחק חדש לילדים = להריץ app/tools/make-offline-pack.js (מעדכן את offline-pack.json).
   מעלים את VERSION רק כשמשנים את הקובץ הזה עצמו. */
var VERSION = "booqli-v5";
var KIDS = "booqli-kids";
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
      return Promise.all(keys.filter(function (k) { return k !== VERSION && k !== KIDS; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isAsset(url) {
  return /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|mp3|wav|ogg)$/i.test(url.pathname) ||
    url.hostname === "fonts.gstatic.com";
}

function put(req, res) {
  if (!res || (res.status !== 200 && res.type !== "opaque")) return;
  var copy = res.clone(), copy2 = res.clone();
  caches.open(VERSION).then(function (c) { c.put(req, copy); }).catch(function () {});
  // אם הקובץ שמור גם בחבילת המשחקים – מעדכנים גם שם, כדי שבלי אינטרנט תיפתח הגרסה החדשה
  caches.open(KIDS).then(function (c) { return c.match(req).then(function (h) { if (h) return c.put(req, copy2); }); }).catch(function () {});
}

/* ===== חבילת משחקי הילדים לשימוש בלי אינטרנט ===== */
var packRun = null;
function tell(msg) {
  self.clients.matchAll({ includeUncontrolled: true }).then(function (cs) { cs.forEach(function (c) { c.postMessage(msg); }); });
}
function kidsPack() {
  if (packRun) return packRun;
  packRun = (async function () {
    var pack = await (await fetch("/offline-pack.json", { cache: "no-store" })).json();
    var c = await caches.open(KIDS);
    var mark = await c.match("/__pack");
    var had = mark ? await mark.text() : "";
    var keys = await c.keys(), have = new Set(keys.map(function (k) { return new URL(k.url).pathname + new URL(k.url).search; }));
    var fresh = had !== pack.version;
    var todo = pack.files.filter(function (f) { return fresh || !have.has(f); });
    var total = todo.length, done = 0, failed = 0;
    tell({ type: "kids-pack", state: total ? "loading" : "ready", done: 0, total: total });
    var q = todo.slice();
    async function worker() {
      while (q.length) {
        var f = q.shift();
        try { var r = await fetch(f, { cache: "no-cache" }); if (r.ok) await c.put(f, r); else failed++; } catch (e) { failed++; }
        done++; if (done % 10 === 0) tell({ type: "kids-pack", state: "loading", done: done, total: total });
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);
    // גופנים: הקובץ של גוגל + קובצי הגופן שבתוכו
    for (var i = 0; i < (pack.fonts || []).length; i++) {
      try {
        var cr = await fetch(pack.fonts[i], { mode: "cors" }); if (!cr.ok) continue;
        var css = await cr.clone().text(); await c.put(pack.fonts[i], cr);
        var urls = css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"]+/g) || [];
        for (var j = 0; j < urls.length; j++) { if (!(await c.match(urls[j]))) { try { var fr = await fetch(urls[j], { mode: "cors" }); if (fr.ok) await c.put(urls[j], fr); } catch (e) {} } }
      } catch (e) {}
    }
    // מה שכבר לא ברשימה – נמחק
    var want = new Set(pack.files);
    keys.forEach(function (k) { var u = new URL(k.url); if (u.origin === self.location.origin && u.pathname !== "/__pack" && !want.has(u.pathname + u.search)) c.delete(k); });
    if (!failed) await c.put("/__pack", new Response(pack.version));
    tell({ type: "kids-pack", state: failed ? "partial" : "ready", done: done, total: total, failed: failed });
  })().catch(function () { tell({ type: "kids-pack", state: "error" }); }).finally(function () { packRun = null; });
  return packRun;
}
self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "kids-pack") e.waitUntil(kidsPack());
});

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
