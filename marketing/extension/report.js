/* בוקלי – מרכז הפרסום · 📊 מדידה (גרסה 1.4, 3.11.2026)
   מושך את נתוני Cloudflare Web Analytics של games.booqli.ai ישירות מהמחשב של שמש.
   המפתח (טוקן "קריאה בלבד") נשמר רק ב-chrome.storage של התוסף – לא ב-localStorage (ולכן גם לא בקובץ הגיבוי), לא באתר ולא במאגר.
   הפעולות באתר נרשמות ככתובות וירטואליות: /<תיקייה>/event/<סוג>/<שם> (ראו siteTrack ב-common.js). */
(function () {
  "use strict";
  const API = "https://api.cloudflare.com/client/v4";
  const HOST = "games.booqli.ai";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtN = n => Number(n || 0).toLocaleString("he-IL");
  const store = {
    get: () => new Promise(r => { try { chrome.storage.local.get("cf", o => r((o && o.cf) || {})); } catch (e) { r(JSON.parse(localStorage.getItem("cf_dev") || "{}")); } }),
    set: v => new Promise(r => { try { chrome.storage.local.set({ cf: v }, r); } catch (e) { localStorage.setItem("cf_dev", JSON.stringify(v)); r(); } })
  };

  /* ---------- שמות בעברית ---------- */
  const KINDS = {
    "app": ["📲", "אפליקציה"], "join-whatsapp": ["💬", "הצטרפות לקבוצת הוואטסאפ"], "join-popup": ["💬", "חלון ההצטרפות"],
    "gift-parents": ["🎁", "מתנה להורים (גננות ששלחו)"], "print": ["🖨️", "הדפסות"], "kid-game": ["🎮", "משחקי ילדים שנפתחו"],
    "kid-group": ["🧒", "מלבנים באזור הילדים"], "kid-search": ["🔎", "מה ילדים חיפשו"], "kid-age": ["🎂", "גיל שנבחר באזור הילדים"],
    "kid-voice": ["🎤", "חיפוש בקול"], "search": ["🔍", "חיפושים באתר"], "map-search": ["🗺️", "חיפושים במפת האתר"],
    "map": ["🗺️", "לחיצות במפת האתר"], "map-who": ["🗺️", "\"אני:\" במפת האתר"], "click": ["👆", "לחיצות (בעיקר עמוד הגנים)"],
    "gan-quote": ["🏫", "בקשות מחיר לגן בוואטסאפ"], "gan-fold": ["🏫", "מלבנים שנפתחו בעמוד הגנים"], "to-booqli": ["🌐", "מעבר לאתר הראשי"],
    "course": ["✍️", "הקורס"], "course-reg": ["✍️", "הרשמה לקורס"], "share": ["📤", "שיתופים"], "win": ["🏆", "ניצחונות במשחקים"],
    "game": ["🎮", "משחקים בעמודי הנושא"], "play": ["🎮", "משחק במצב ילדים"], "kidplay": ["🎲", "חדר המשחקים"], "kidplay-win": ["🏆", "ניצחונות בחדר המשחקים"],
    "animate": ["🪄", "מנפישים"], "book": ["📖", "עורך הספר"], "code-ok": ["🔑", "מספר סודי נכון"], "code-bad": ["🔑", "מספר סודי שגוי"],
    "code-gate": ["🔑", "מסך המספר הסודי"], "soon-gate": ["⏳", "מסך \"נפתח בקרוב\""], "supplier-join": ["🎁", "ספקיות שרוצות להצטרף"],
    "gift-share": ["🎁", "שיתוף מתנות לגן"], "gift-occasion": ["🎁", "מועדי מתנות שנפתחו"], "kidlock": ["🔒", "מצב ילדים נעול"],
    "nav": ["🧭", "לחיצות בתפריט"], "home-more": ["🏠", "\"להציג עוד\" בדף הבית"], "promo": ["📣", "באנרים"], "photo": ["📷", "תמונות"],
    "save": ["💾", "שמירה"], "filter": ["🔍", "סינון בספרייה"], "sort": ["↕️", "מיון"], "report-error": ["🛠️", "דיווחי טעות"],
    "vacation-parents": ["📅", "לוח חופשות להורים"], "calendar-image": ["📅", "תמונת לוח החופשות"], "kids-popup": ["🧒", "חלון הילדים"],
    "fear-pdf": ["🛡️", "פחד: הורדת PDF"], "fear-card-png": ["🛡️", "פחד: הורדת כרטיס"], "fear-save-offline": ["🛡️", "פחד: שמירה בלי אינטרנט"],
    "from": ["🚪", "נכנסו מקישור מסומן (מאיפה)"], "fear-breathe-done": ["🛡️", "פחד: סיימו נשימה"], "fear-book-end": ["🛡️", "פחד: קראו את כל הספר"], "like": ["❤️", "לייקים"]
  };
  const FROM_NAME = n => { const m = n.match(/^facebook_group-comment-t(?:_(.+))?$/); if (m) return "💬 תגובות בפייסבוק (games.booqli.ai/t)" + (m[1] ? " · " + m[1] : "");
    const [src, med, camp] = n.split("-"); const S = { whatsapp: "💬 וואטסאפ", facebook_group: "📘 קבוצת פייסבוק", facebook: "📘 פייסבוק", instagram: "📷 אינסטגרם", games: "🌐 האתר", booqli_games: "🌐 האתר" };
    return (S[src] || src) + (med ? " · " + med : "") + (camp ? " · " + camp : ""); };
  const APP_NAMES = { "installed": "✅ התקינו את האפליקציה", "open": "פתחו את האפליקציה מהמסך הראשי", "offline-ready": "הורידו את משחקי הילדים לבלי אינטרנט", "bar-show": "ראו את חלון ההתקנה", "bar-close": "סגרו את חלון ההתקנה", "send-self": "שלחו לעצמם קישור להתקנה", "share": "שיתפו את האפליקציה" };
  const SECTIONS = { "": "🏠 דף הבית", "kids": "🧒 אזור הילדים", "kids/play": "🎲 חדר המשחקים", "kids/animate": "🪄 מנפישים", "teachers": "👩‍🏫 לגננות", "parents": "👨‍👩‍👧 להורים", "school": "🎒 כיתות", "library": "🔍 כל התכנים", "map": "🗺️ מפת האתר", "my": "❤️ מועדפים", "gifts": "🎁 מתנות וספקיות", "kindergartens": "🏫 עמוד הגנים", "order": "🛒 הזמנה של גן", "book-maker": "📖 הספר שלכם", "course": "✍️ הקורס", "app": "📲 האפליקציה", "privacy": "פרטיות", "terms": "תקנון", "accessibility": "נגישות" };
  const pageName = p => {
    const k = p.replace(/^\/|\/?(index\.html)?$/g, "");
    if (SECTIONS[k] != null) return SECTIONS[k];
    let m = k.match(/^topics\/([^/]+)/) || k.match(/^games\/([^/]+)/);
    if (m && window.KIT_TOPIC_NAME) { const n = window.KIT_TOPIC_NAME(m[1]); if (n) return n; }
    return m ? (k.startsWith("games/") ? "📚 " : "📄 ") + m[1] : "/" + k;
  };

  /* ---------- טווח תאריכים ---------- */
  const PERIODS = [["7", "7 ימים אחרונים"], ["30", "30 ימים אחרונים"], ["this", "החודש הזה"], ["last", "החודש הקודם"]];
  let period = new Date().getDate() <= 5 ? "last" : "30";
  function range(p) {
    const now = new Date(), day = 864e5;
    let a, b = now;
    if (p === "7") a = new Date(now - 7 * day);
    else if (p === "30") a = new Date(now - 30 * day);
    else if (p === "this") a = new Date(now.getFullYear(), now.getMonth(), 1);
    else { a = new Date(now.getFullYear(), now.getMonth() - 1, 1); b = new Date(now.getFullYear(), now.getMonth(), 1); }
    const len = b - a;
    return { a, b, pa: new Date(a - len), pb: a };
  }
  const iso = d => d.toISOString().replace(/\.\d+Z$/, "Z");
  const dmy = d => d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();

  /* ---------- Cloudflare ---------- */
  /* יום שכבר עבר לא משתנה – זוכרים אותו (בזיכרון של הלשונית בלבד) */
  const CACHE = new Map();
  async function gqlDay(cfg, query, variables, end) {
    const k = cfg.account + "|" + query.length + "|" + JSON.stringify(variables.f);
    if (CACHE.has(k)) return CACHE.get(k);
    const d = await gql(cfg, query, variables);
    if (end < new Date(Date.now() - 2 * 36e5)) CACHE.set(k, d);
    return d;
  }
  async function gql(cfg, query, variables) {
    const r = await fetch(API + "/graphql", { method: "POST", headers: { "Authorization": "Bearer " + cfg.token, "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }) });
    let j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok || !j) throw new Error("Cloudflare החזיר שגיאה " + r.status);
    if (j.errors && j.errors.length) throw new Error(j.errors.map(e => e.message).join(" · "));
    return j.data;
  }
  async function findAccount(token) {
    const r = await fetch(API + "/accounts?per_page=50", { headers: { "Authorization": "Bearer " + token } });
    const j = await r.json().catch(() => null);
    if (!j || !j.success) throw new Error((j && j.errors && j.errors[0] && j.errors[0].message) || "המפתח לא עובד");
    return j.result || [];
  }
  const DIM = (name, dims, order, limit) => `${name}: rumPageloadEventsAdaptiveGroups(filter: $f, limit: ${limit || 1000}, orderBy: [${order || "count_DESC"}]) { count sum { visits } dimensions { requestHost ${dims} } }`;
  const Q = `query($acc: string, $f: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject, $pf: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject) {
    viewer { accounts(filter: { accountTag: $acc }) {
      ${DIM("paths", "requestPath", "count_DESC", 5000)}
      ${DIM("days", "date", "date_ASC", 1000)}
      ${DIM("refs", "refererHost", "count_DESC", 200)}
      ${DIM("countries", "countryName", "count_DESC", 100)}
      ${DIM("devices", "deviceType", "count_DESC", 20)}
      ${DIM("os", "userAgentOS", "count_DESC", 30)}
      prev: rumPageloadEventsAdaptiveGroups(filter: $pf, limit: 100) { count sum { visits } dimensions { requestHost } }
    } } }`;

  let DATA = null, ERR = "", LOADING = false, SETUP = false;
  /* (3.11.2026) ב-Cloudflare, טווח ארוך = נתונים מדוגמים (מספרים עגולים ומשוערים). לכן שואלים יום אחד בכל פעם (ספירה מדויקת) ומחברים כאן. */
  const dayChunks = (a, b) => { const out = []; let x = new Date(a); while (x < b) { const n = new Date(x.getFullYear(), x.getMonth(), x.getDate() + 1); out.push([x, n < b ? n : b]); x = n; } return out; };
  const QP = `query($acc: string, $f: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject) { viewer { accounts(filter: { accountTag: $acc }) {
      t: rumPageloadEventsAdaptiveGroups(filter: $f, limit: 100) { count sum { visits } dimensions { requestHost } } } } }`;
  async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } })); return out; }
  const mergeInto = (bag, arr) => (arr || []).forEach(x => { const k = JSON.stringify(x.dimensions); const o = bag[k] || (bag[k] = { count: 0, sum: { visits: 0 }, dimensions: x.dimensions }); o.count += x.count; o.sum.visits += (x.sum && x.sum.visits) || 0; });
  let PROG = "", LOADID = 0;
  async function load() {
    const my = ++LOADID;
    const cfg = await store.get();
    if (!cfg.token || !cfg.account) { SETUP = true; return; }
    LOADING = true; ERR = ""; PROG = ""; window.BQ_RENDER && window.BQ_RENDER();
    try {
      const R = range(period);
      const mine = arr => (arr || []).filter(x => !x.dimensions.requestHost || x.dimensions.requestHost === HOST);
      const ch = dayChunks(R.a, R.b), bags = { paths: {}, days: {}, refs: {}, countries: {}, devices: {}, os: {} };
      let done = 0;
      await pool(ch, 4, async ([a, b]) => {
        if (my !== LOADID) return;
        const f = { AND: [{ datetime_geq: iso(a) }, { datetime_lt: iso(b) }] };
        const d = await gqlDay(cfg, Q, { acc: cfg.account, f, pf: f }, b);
        const acc = d && d.viewer && d.viewer.accounts && d.viewer.accounts[0];
        if (!acc) throw new Error("לא נמצא החשבון. בדקי את מספר החשבון בהגדרות.");
        Object.keys(bags).forEach(k => mergeInto(bags[k], mine(acc[k])));
        done++; PROG = done + " / " + ch.length; const el = document.getElementById("stProg"); if (el) el.textContent = PROG;
      });
      /* התקופה הקודמת – רק סך הצפיות, גם יום-יום */
      const pch = dayChunks(R.pa, R.pb), pv = {};
      await pool(pch, 4, async ([a, b]) => { const d = await gqlDay(cfg, QP, { acc: cfg.account, f: { AND: [{ datetime_geq: iso(a) }, { datetime_lt: iso(b) }] } }, b); const acc = d && d.viewer && d.viewer.accounts && d.viewer.accounts[0]; mergeInto(pv, mine(acc && acc.t)); });
      const arr = o => Object.values(o).sort((x, y) => y.count - x.count);
      /* היום הראשון שיש בו נתונים – כדי לכתוב "נמדד מ-..." */
      const dl = Object.values(bags.days).map(x => x.dimensions.date).sort();
      if (my !== LOADID) return; /* בינתיים בחרו טווח אחר */
      DATA = { R, paths: arr(bags.paths), days: arr(bags.days), refs: arr(bags.refs), countries: arr(bags.countries), devices: arr(bags.devices), os: arr(bags.os), prev: arr(pv), first: dl[0] || null, at: new Date() };
    } catch (e) { if (my !== LOADID) return; ERR = String(e.message || e); DATA = null; }
    if (my !== LOADID) return;
    LOADING = false; window.BQ_RENDER && window.BQ_RENDER();
  }

  /* ---------- חישובים ---------- */
  function crunch(D) {
    const real = [], ev = {};
    let views = 0, visits = 0;
    D.paths.forEach(x => {
      const p = x.dimensions.requestPath || "/", m = p.match(/\/event\/([^/]+)\/(.*)$/), lk = p.match(/\/like\/(.*)$/);
      if (m || lk) {
        const kind = m ? m[1] : "like"; let name = m ? m[2] : lk[1]; try { name = decodeURIComponent(name); } catch (e) {}
        (ev[kind] = ev[kind] || { total: 0, names: {} }).total += x.count;
        ev[kind].names[name] = (ev[kind].names[name] || 0) + x.count;
      } else { real.push(x); views += x.count; visits += (x.sum && x.sum.visits) || 0; }
    });
    /* עמודים: מאחדים /x ו-/x/index.html */
    const pages = {};
    real.forEach(x => { const n = pageName(x.dimensions.requestPath || "/"); pages[n] = (pages[n] || 0) + x.count; });
    const prevViews = D.prev.reduce((s, x) => s + x.count, 0);
    const n = (k, name) => ev[k] ? (name == null ? ev[k].total : (ev[k].names[name] || 0)) : 0;
    const sumWhere = (k, re) => ev[k] ? Object.keys(ev[k].names).filter(x => re.test(x)).reduce((s, x) => s + ev[k].names[x], 0) : 0;
    return {
      views, visits, prevViews, ev, pages,
      kpi: [
        ["👀", "ביקורים", visits], ["📄", "צפיות בעמודים", views],
        ["📲", "התקנות אפליקציה", n("app", "installed") + sumWhere("app", /^accepted-/)], ["📱", "פתיחות מהאפליקציה", n("app", "open")],
        ["💬", "הצטרפו לוואטסאפ", n("join-whatsapp")], ["🎁", "מתנות להורים", n("gift-parents")],
        ["🖨️", "הדפסות", n("print") + n("fear-pdf")], ["🏫", "פניות גנים", n("gan-quote") + sumWhere("click", /^gan_(start|calc_wa|wa_|hero_start)/)],
        ["🎮", "משחקי ילדים נפתחו", n("kid-game") + n("kidplay")], ["🌐", "עברו לאתר הראשי", n("to-booqli")]
      ]
    };
  }

  /* ---------- תצוגה ---------- */
  const bars = (rows, max) => rows.map(([label, v, sub]) => `<div class="st-bar"><span class="l">${label}</span><span class="b"><i style="width:${max ? Math.max(2, v / max * 100) : 0}%"></i></span><b>${fmtN(v)}</b>${sub ? `<small>${sub}</small>` : ""}</div>`).join("");
  const top = (obj, k) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, k || 15);
  const DEV = { desktop: "💻 מחשב", mobile: "📱 טלפון", tablet: "📲 טאבלט" };
  const REF = h => !h ? "ישירות / אפליקציה / וואטסאפ בטלפון" : /whatsapp|wa\.me/.test(h) ? "💬 " + h : /facebook|fb\.|instagram/.test(h) ? "📘 " + h : /google/.test(h) ? "🔎 " + h : /booqli/.test(h) ? "🌐 " + h : h;

  function summaryText(C, D) {
    const ch = C.prevViews ? Math.round((C.views - C.prevViews) / C.prevViews * 100) : null;
    return `📊 booqli Games · ${dmy(D.R.a)}–${dmy(new Date(D.R.b - 1))}\n` + C.kpi.map(k => `${k[0]} ${k[1]}: ${fmtN(k[2])}`).join("\n") +
      (ch != null ? `\n\nלעומת התקופה הקודמת: ${ch >= 0 ? "+" : ""}${ch}% בצפיות` : "") +
      `\n\nהעמודים המובילים:\n` + top(C.pages, 5).map(([p, v], i) => `${i + 1}. ${p} – ${fmtN(v)}`).join("\n");
  }

  async function html() {
    const cfg = await store.get();
    if (!cfg.token || !cfg.account || SETUP) return setupHtml(cfg);
    if (!DATA && !LOADING && !ERR) { load(); return `<h1>📊 מדידה</h1><div class="card">⏳ מושכים את הנתונים מ-Cloudflare…</div>`; }
    let h = `<h1>📊 מדידה – מה קורה באתר</h1><div class="row" style="margin:8px 0">` +
      PERIODS.map(([k, t]) => `<button class="btn sm ${k === period ? "" : "o"}" data-st="p:${k}">${t}</button>`).join("") +
      `<button class="btn sm s" data-st="reload">🔄 רענון</button><button class="btn sm o" data-st="setup" style="margin-inline-start:auto">⚙️ חיבור ל-Cloudflare</button></div>`;
    if (LOADING) return h + `<div class="card">⏳ סופרים יום אחרי יום, כדי שהמספרים יהיו מדויקים… <b id="stProg">${PROG}</b></div>`;
    if (ERR) return h + `<div class="card flag">😕 ${esc(ERR)}<br><span class="small">אם המפתח בוטל או פג – ⚙️ חיבור ל-Cloudflare ושמירה מחדש. אם זה ממשיך, צלמי את ההודעה ושלחי ל-Claude.</span></div>`;
    const D = DATA, C = crunch(D);
    const ch = C.prevViews ? Math.round((C.views - C.prevViews) / C.prevViews * 100) : null;
    window.__bqStatsText = summaryText(C, D);
    h += `<p class="mute small">${dmy(D.R.a)} – ${dmy(new Date(D.R.b - 1))} · ${ch != null ? `<b style="color:${ch >= 0 ? "#17733b" : "#C13671"}">${ch >= 0 ? "▲" : "▼"} ${Math.abs(ch)}% צפיות לעומת התקופה הקודמת</b> · ` : ""}לא כולל את המכשירים שלך · ${D.first && new Date(D.first + "T00:00:00") > D.R.a ? `<b>נמדד רק מ-${new Date(D.first + "T12:00:00").getDate()}.${new Date(D.first + "T12:00:00").getMonth() + 1}</b> · ` : ""}ספירה מדויקת, יום אחרי יום · <button class="btn sm wa" data-st="copy">📋 להעתיק סיכום</button></p>`;
    h += `<div class="st-kpi">` + C.kpi.map(k => `<div><span>${k[0]}</span><b>${fmtN(k[2])}</b><small>${k[1]}</small></div>`).join("") + `</div>`;
    /* לפי יום */
    const days = D.days.slice().sort((a, b) => a.dimensions.date < b.dimensions.date ? -1 : 1), dmax = Math.max(1, ...days.map(x => x.count));
    h += `<div class="card"><h3>📈 צפיות לפי יום</h3><div class="st-days">` + days.map(x => { const dd = new Date(x.dimensions.date + "T12:00:00"); return `<div title="${x.dimensions.date}: ${x.count}"><i style="height:${Math.max(3, x.count / dmax * 100)}%"></i><small>${dd.getDate()}.${dd.getMonth() + 1}</small></div>`; }).join("") + `</div></div>`;
    /* עמודים, מקורות */
    const tp = top(C.pages, 15), rf = D.refs.map(x => [REF(x.dimensions.refererHost), x.count]).reduce((o, [k, v]) => (o[k] = (o[k] || 0) + v, o), {});
    h += `<div class="st-two"><div class="card"><h3>📄 העמודים הכי נצפים</h3>${bars(tp, tp[0] ? tp[0][1] : 0)}</div>` +
      `<div class="card"><h3>🚪 מאיפה הגיעו</h3>${bars(top(rf, 12), Math.max(0, ...Object.values(rf)))}<p class="small mute">"ישירות" = הקלידו את הכתובת, פתחו מהאפליקציה, או לחצו על קישור בוואטסאפ בטלפון (וואטסאפ בטלפון לא מוסר מאיפה).</p></div></div>`;
    /* מכשירים, מערכות, מדינות */
    const dv = D.devices.map(x => [DEV[x.dimensions.deviceType] || x.dimensions.deviceType, x.count]), os = D.os.map(x => [x.dimensions.userAgentOS || "?", x.count]), co = D.countries.slice(0, 8).map(x => [x.dimensions.countryName || "?", x.count]);
    const mx = a => Math.max(0, ...a.map(x => x[1]));
    h += `<div class="st-three"><div class="card"><h3>📱 מכשיר</h3>${bars(dv, mx(dv))}</div><div class="card"><h3>⚙️ מערכת</h3>${bars(os.slice(0, 6), mx(os))}</div><div class="card"><h3>🌍 מדינה</h3>${bars(co, mx(co))}</div></div>`;
    /* כל הפעולות */
    const kinds = Object.entries(C.ev).sort((a, b) => b[1].total - a[1].total);
    h += `<h2>👆 כל הפעולות באתר (${kinds.length} סוגים)</h2><p class="mute small">לוחצים על שורה כדי לראות את הפירוט.</p>`;
    h += kinds.map(([k, o]) => {
      const [ic, nm] = KINDS[k] || ["•", k];
      const names = top(o.names, 40).map(([n, v]) => [esc(k === "app" ? (APP_NAMES[n] || n) : k === "from" ? FROM_NAME(n) : n), v]);
      return `<details class="card st-ev"${k === "kid-search" || k === "app" || k === "from" ? " open" : ""}><summary><span>${ic}</span><b>${esc(nm)}</b><span class="pill">${fmtN(o.total)}</span></summary>${bars(names, names[0] ? names[0][1] : 0)}</details>`;
    }).join("") || `<div class="card">עוד אין פעולות בתקופה הזו.</div>`;
    h += `<p class="small mute">עודכן ${D.at.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })} · הנתונים מ-Cloudflare Web Analytics. בלי שמות, בלי עוגיות – רק ספירה.</p>`;
    return h;
  }

  function setupHtml(cfg) {
    return `<h1>📊 חיבור המדידה ל-Cloudflare</h1>
    <div class="card hero"><b>פעם אחת בלבד, 3 דקות.</b> המפתח נשמר רק בתוסף במחשב הזה. הוא <b>קריאה בלבד</b>: אפשר רק לראות מספרים, אי אפשר לשנות שום דבר.</div>
    <div class="card guide"><h3>איך יוצרים מפתח</h3><ol>
      <li>נכנסים ל-<a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener">dash.cloudflare.com/profile/api-tokens</a></li>
      <li>לוחצים <b>Create Token</b>, ובתחתית: <b>Create Custom Token → Get started</b></li>
      <li>Token name: <code>booqli stats</code></li>
      <li>Permissions: בוחרים <b>Account</b> → <b>Account Analytics</b> → <b>Read</b>. (רק השורה הזו. לא להוסיף שום הרשאה אחרת.)</li>
      <li>Account Resources: <b>Include</b> → החשבון שלך</li>
      <li><b>Continue to summary</b> → <b>Create Token</b> → מעתיקים את המפתח (מופיע רק פעם אחת)</li>
    </ol></div>
    <div class="card"><label class="inp">המפתח<input id="cfTok" type="password" placeholder="מדביקים כאן" value="${esc(cfg.token || "")}" autocomplete="off"></label>
    <label class="inp">מספר החשבון (לא חובה – התוסף ימצא לבד)<input id="cfAcc" placeholder="32 תווים, מופיע בכתובת של Cloudflare אחרי dash.cloudflare.com/" value="${esc(cfg.account || "")}" autocomplete="off"></label>
    <div class="row"><button class="btn" data-st="save">💾 שמירה וחיבור</button>${cfg.token ? `<button class="btn o" data-st="cancel">ביטול</button><button class="btn o" data-st="forget" style="margin-inline-start:auto">🗑️ למחוק את המפתח מהתוסף</button>` : ""}</div>
    <p class="small mute" id="cfMsg"></p></div>`;
  }

  async function onClick(b) {
    const a = b.dataset.st;
    if (a.startsWith("p:")) { period = a.slice(2); DATA = null; return load(); }
    if (a === "reload") { DATA = null; CACHE.clear(); return load(); }
    if (a === "setup") { SETUP = true; return window.BQ_RENDER(); }
    if (a === "cancel") { SETUP = false; return window.BQ_RENDER(); }
    if (a === "copy") { try { await navigator.clipboard.writeText(window.__bqStatsText || ""); window.BQ_TOAST && window.BQ_TOAST("הסיכום הועתק ✔️"); } catch (e) {} return; }
    if (a === "forget") { if (confirm("למחוק את המפתח מהתוסף?")) { await store.set({}); DATA = null; SETUP = true; window.BQ_RENDER(); } return; }
    if (a === "save") {
      const raw = document.getElementById("cfTok").value;
      /* אם הודבק טקסט ארוך (למשל פקודת הבדיקה curl של Cloudflare) – שולפים רק את המפתח */
      const bm = raw.match(/Bearer\s+([A-Za-z0-9_-]{20,})/), runs = (raw.match(/[A-Za-z0-9_-]{30,}/g) || []).sort((a, b) => Math.abs(a.length - 40) - Math.abs(b.length - 40));
      const token = bm ? bm[1] : (runs[0] || raw.replace(/[^A-Za-z0-9_-]/g, "")); let account = document.getElementById("cfAcc").value.trim();
      const msg = document.getElementById("cfMsg");
      if (!token) { msg.textContent = "צריך להדביק מפתח 🙂"; return; }
      msg.textContent = "⏳ בודקים את המפתח…";
      try {
        if (!account) {
          const L = await findAccount(token);
          if (L.length === 1) account = L[0].id;
          else if (!L.length) throw new Error("המפתח עובד, אבל לא מצאתי חשבון. הדביקי את מספר החשבון.");
          else throw new Error("יש כמה חשבונות: " + L.map(x => x.name).join(", ") + ". הדביקי את מספר החשבון הנכון.");
        }
        await store.set({ token, account }); SETUP = false; DATA = null; ERR = "";
        await load();
      } catch (e) { const t = String(e.message || e); msg.textContent = "😕 " + (/Invalid request headers|Invalid API Token|Authentication error|6003|10000/i.test(t) ? "המפתח לא תקין. מעתיקים רק את המפתח עצמו (שורה אחת, כ-40 אותיות ומספרים) עם כפתור Copy, לא את תיבת ה-curl. (" + t + ")" : t); }
    }
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-st]"); if (b) { e.stopPropagation(); onClick(b); } }, true);

  window.BQ_STATS = { html };
})();
