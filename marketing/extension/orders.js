/* בוקלי – מרכז הפרסום · 📦 הזמנות (גרסה 1.8.0, 7.11.2026, שמש: "לראות את כל ההזמנות בתוסף")
   קורא את תיקיות ההזמנה בדרייב של חשבון ההזמנות דרך הסקריפט (worker/drive-saver.gs, פעולה "panel") – קריאה בלבד.
   הקוד הסודי (PANEL_KEY) והכתובת נשמרים רק ב-chrome.storage של התוסף – לא בגיבוי, לא באתר ולא במאגר.
   מצב ידני לכל הזמנה (ספר מוכן / נשלח ללקוח / שילם / בוטל) – נשמר רק אצל שמש (localStorage "bq_ostat"). */
(function () {
  "use strict";
  const DEF_URL = "https://script.google.com/macros/s/AKfycbx67vfPc5N6ry77InqUckoz25HsJf2pnWr_4F7ErpDAIwd2idMkNQYbMSaSAgTSzPLVAQ/exec";
  const LESSONS = "https://docs.google.com/document/u/3/d/1Ly7MrrB9V70YFkoP3Q_Vr_mb2oy_bbsoRbj-thX-eiU/edit";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get: () => new Promise(r => { try { chrome.storage.local.get("orders", o => r((o && o.orders) || {})); } catch (e) { r(JSON.parse(localStorage.getItem("orders_dev") || "{}")); } }),
    set: v => new Promise(r => { try { chrome.storage.local.set({ orders: v }, r); } catch (e) { localStorage.setItem("orders_dev", JSON.stringify(v)); r(); } })
  };
  const LS = {
    get(k, d) { try { const v = localStorage.getItem("bq_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("bq_" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const KIND = { private: ["👵", "פרטי"], gan: ["🏫", "גן"], book: ["📖", "עיצוב אישי"] };
  const MAN = [["", "—"], ["ready", "📗 ספר מוכן"], ["sent", "📤 נשלח ללקוח"], ["paid", "💳 שילם"], ["print", "🖨️ בהדפסה"], ["done", "✅ סגור"], ["cancel", "✖️ בוטל"]];
  let DATA = null, ERR = "", LOADING = false, SETUP = false, F = LS.get("ofilter", "all"), Q = "", OPEN = null, DET = {};

  async function call(body) {
    const s = await store.get();
    const r = await fetch(s.url || DEF_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ action: "panel", key: s.key }, body)) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "error");
    return j;
  }
  async function load() {
    const s = await store.get(); if (!s.key) { SETUP = true; return; }
    LOADING = true; ERR = ""; window.BQ_RENDER && window.BQ_RENDER();
    try { DATA = await call({ op: "list", days: 120 }); }
    catch (e) { ERR = e.message === "key" ? "הקוד לא נכון (או שהסקריפט עוד לא עודכן)" : e.message === "action" ? "הסקריפט בדרייב עוד לא מכיר את הלשונית הזאת – צריך לפרוס גרסה חדשה" : "לא הצלחתי להתחבר: " + e.message; }
    LOADING = false; window.BQ_RENDER && window.BQ_RENDER();
  }
  function status(o) {
    const m = LS.get("ostat", {})[o.id] || "";
    if (m) return MAN.find(x => x[0] === m) ? { k: m, t: MAN.find(x => x[0] === m)[1], c: m === "cancel" ? "" : "g" } : { k: "", t: "", c: "" };
    if (o.check) return { k: "check", t: "⛔ לבדיקה", c: "w" };
    if (o.booqli) return { k: "booqli", t: "🔄 ב-booqli.ai · " + o.booqli, c: "" };
    if (o.kind === "private") return { k: "new", t: "🆕 חדשה – מחכה להעלאה", c: "p" };
    return { k: "new", t: "🆕 חדשה", c: "p" };
  }
  function askText(o, d) {
    return "הזמנה של BOOQLI – " + o.name + "\nלקוח: " + o.cust + "\nתיקייה בדרייב: " + o.url +
      (d && d.summary ? "\n\nסיכום ההזמנה:\n" + d.summary.slice(0, 2500) : "") + "\n\nמה אני רוצה: ";
  }
  async function html() {
    const s = await store.get();
    if (SETUP || !s.key) return `<div class="card"><h2 style="margin-top:0">📦 הזמנות – חיבור</h2>
      <p>כאן רואים את כל ההזמנות מהדרייב (פרטיים, גנים, ספר בעיצוב אישי) – קריאה בלבד.</p>
      <p class="small mute">את הקוד הסודי Claude מכניס כאן בשבילך (הוא שמור רק בתוסף במחשב הזה – לא בגיבוי, לא באתר).</p>
      <label class="small">קוד סודי<br><input type="password" id="oKey" style="width:100%;max-width:420px" value=""></label><br>
      <label class="small">כתובת הסקריפט (לא חובה)<br><input type="text" id="oUrl" style="width:100%;max-width:620px" value="${esc(s.url || "")}" placeholder="${esc(DEF_URL)}"></label>
      <div class="row" style="margin-top:10px"><button class="btn" data-or="save">שמירה וחיבור</button>${s.key ? '<button class="btn o" data-or="cancel">ביטול</button>' : ""}</div></div>`;
    if (!DATA && !LOADING && !ERR) load();
    let h = `<div class="row" style="flex-wrap:wrap;gap:6px;align-items:center"><h2 style="margin:0;flex:1">📦 הזמנות</h2>
      <button class="btn sm o" data-or="refresh">🔄 רענון</button>
      <a class="btn sm o" href="${LESSONS}" target="_blank">📒 לקחים להזמנות</a>
      <a class="btn sm o" href="https://drive.google.com/drive/u/3/folders/1037vXC9nsbujCeqHj4cxdwqiPs9xjd_i" target="_blank">📁 התיקייה בדרייב</a>
      <button class="btn sm o" data-or="setup">⚙️</button></div>`;
    if (LOADING && !DATA) return h + `<div class="card">טוען את ההזמנות מהדרייב…</div>`;
    if (ERR) return h + `<div class="card"><b>⚠️ ${esc(ERR)}</b></div>`;
    if (!DATA) return h;
    const all = DATA.orders || [];
    const cnt = k => all.filter(o => k === "all" ? true : k === "new" || k === "check" || k === "booqli" ? status(o).k === k : o.kind === k).length;
    const FL = [["all", "הכל"], ["new", "🆕 חדשות"], ["check", "⛔ לבדיקה"], ["booqli", "🔄 ב-booqli.ai"], ["private", "👵 פרטיים"], ["gan", "🏫 גנים"], ["book", "📖 עיצוב אישי"]];
    h += `<div class="row" style="flex-wrap:wrap;gap:6px;margin:10px 0">${FL.map(([k, t]) => `<button class="chip${F === k ? " on" : ""}" data-or="f:${k}">${t} <small style="display:inline">(${cnt(k)})</small></button>`).join("")}
      <input type="search" id="oQ" placeholder="🔎 שם, טלפון, מספר…" value="${esc(Q)}" style="flex:1;min-width:160px"></div>
      <p class="small mute">עודכן ${esc(DATA.at)} · 120 הימים האחרונים · ${all.length} הזמנות</p>`;
    const q = Q.trim().toLowerCase();
    const L = all.filter(o => (F === "all" || (["new", "check", "booqli"].includes(F) ? status(o).k === F : o.kind === F)) && (!q || (o.name + " " + o.cust + " " + o.books.join(" ")).toLowerCase().includes(q)));
    if (!L.length) h += `<div class="card mute">אין הזמנות כאן.</div>`;
    const man = LS.get("ostat", {});
    for (const o of L) {
      const st = status(o), d = DET[o.id], k = KIND[o.kind] || ["📦", o.kind];
      h += `<div class="card"><div class="row" style="flex-wrap:wrap;gap:8px;align-items:center">
        <span class="pill">${k[0]} ${k[1]}</span><b style="flex:1;min-width:200px">${esc(o.name.replace(/^🌐\s*/, ""))}</b><span class="pill ${st.c}">${esc(st.t)}</span></div>
        <div class="small mute" style="margin:4px 0">👤 ${esc(o.cust)} · נוצרה ${esc(o.created)}</div>
        ${o.books.length ? `<div class="small">📚 ${o.books.map(esc).join(" · ")}</div>` : ""}
        <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px">
          <a class="btn sm" href="${esc(o.url)}" target="_blank">📁 לפתוח בדרייב</a>
          <button class="btn sm o" data-or="open:${o.id}">${OPEN === o.id ? "▲ לסגור" : "📝 הסיכום והתמונות"}</button>
          <button class="btn sm o" data-or="ask:${o.id}">💬 לשאול את Claude</button>
          ${o.booqli ? `<a class="btn sm o" href="https://www.booqli.ai/" target="_blank">🌐 booqli.ai · ${esc(o.booqli)}</a>` : ""}
          <label class="small">מצב: <select data-ostat="${o.id}">${MAN.map(([v, t]) => `<option value="${v}"${(man[o.id] || "") === v ? " selected" : ""}>${t}</option>`).join("")}</select></label>
        </div>
        ${OPEN === o.id ? (d === undefined ? `<p class="small mute">טוען…</p>` : d === null ? `<p class="small">⚠️ לא הצלחתי לקרוא את ההזמנה</p>` :
          `<div class="sec" style="margin-top:8px">${d.pics.length ? `<div class="small"><b>📷 תמונות (${d.pics.length}):</b> ${d.pics.map(p => `<a href="${esc(p.url)}" target="_blank">${esc((p.path ? p.path + " / " : "") + p.name)}</a>`).join(" · ")}</div>` : ""}
           <pre style="white-space:pre-wrap;font-family:inherit;background:var(--bg);border-radius:10px;padding:10px;max-height:420px;overflow:auto">${esc(d.summary || "(אין מסמך סיכום)")}</pre></div>`) : ""}
      </div>`;
    }
    return h;
  }
  async function onClick(b) {
    const a = b.dataset.or;
    if (a === "setup") { SETUP = true; return window.BQ_RENDER(); }
    if (a === "cancel") { SETUP = false; return window.BQ_RENDER(); }
    if (a === "save") {
      const key = (document.getElementById("oKey").value || "").trim(), url = (document.getElementById("oUrl").value || "").trim();
      const s = await store.get(); if (!key && !s.key) { window.BQ_TOAST("צריך קוד 🙂"); return; }
      await store.set({ key: key || s.key, url: /^https:\/\/script\.google(usercontent)?\.com\//.test(url) ? url : "" });
      SETUP = false; DATA = null; ERR = ""; return load();
    }
    if (a === "refresh") { DATA = null; ERR = ""; return load(); }
    if (a.startsWith("f:")) { F = a.slice(2); LS.set("ofilter", F); return window.BQ_RENDER(); }
    if (a.startsWith("open:")) {
      const id = a.slice(5); if (OPEN === id) { OPEN = null; return window.BQ_RENDER(); }
      OPEN = id; if (DET[id] === undefined) { window.BQ_RENDER(); try { DET[id] = await call({ op: "order", id }); } catch (e) { DET[id] = null; } }
      return window.BQ_RENDER();
    }
    if (a.startsWith("ask:")) {
      const id = a.slice(4), o = ((DATA && DATA.orders) || []).find(x => x.id === id); if (!o) return;
      let d = DET[id]; if (d === undefined) { try { d = DET[id] = await call({ op: "order", id }); } catch (e) { d = null; } }
      const t = askText(o, d);
      try { await navigator.clipboard.writeText(t); } catch (e) {}
      window.open("https://claude.ai/new?q=" + encodeURIComponent(t.slice(0, 3500)), "_blank");
      window.BQ_TOAST("נפתחה שיחה חדשה עם Claude (הפרטים גם הועתקו – אפשר להדביק) ✔️");
    }
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-or]"); if (b) { e.stopPropagation(); e.preventDefault(); onClick(b); } }, true);
  document.addEventListener("change", e => {
    const id = e.target.dataset && e.target.dataset.ostat; if (!id) return;
    e.stopPropagation(); const o = LS.get("ostat", {}); if (e.target.value) o[id] = e.target.value; else delete o[id]; LS.set("ostat", o); window.BQ_TOAST("נשמר ✔️"); window.BQ_RENDER();
  }, true);
  document.addEventListener("input", e => { if (e.target.id === "oQ") { Q = e.target.value; const pos = e.target.selectionStart; window.BQ_RENDER().then(() => { const i = document.getElementById("oQ"); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }); } }, true);
  window.BQ_ORDERS = { html };
})();
