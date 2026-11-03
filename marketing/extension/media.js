/* בוקלי – מרכז הפרסום · 🎬 הקבצים שלי (גרסה 1.5, 3.11.2026)
   התוסף מוריד לבד כל תמונה וסרטון ש-Claude מכין לפרסום, מתוך games.booqli.ai/marketing/media/media.json,
   ושומר אותם אצל שמש (IndexedDB "booqli-kit", מפתח auto:<id>). קובץ שנמחק באתר – נשאר בתוסף.
   קובץ ששמש מחקה מהתוסף – לא יורד שוב (autodel:<id>). slot ריק של נושא מתמלא לבד. */
(function () {
  "use strict";
  const BASE = "https://games.booqli.ai/marketing/media/";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open("booqli-kit", 1); r.onupgradeneeded = () => r.result.createObjectStore("media"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const get = async k => { const d = await db(); return new Promise(res => { const r = d.transaction("media").objectStore("media").get(k); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }); };
  const put = async (k, v) => { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction("media", "readwrite"); tx.objectStore("media").put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); };
  const del = async k => { const d = await db(); return new Promise(res => { const tx = d.transaction("media", "readwrite"); tx.objectStore("media").delete(k); tx.oncomplete = res; }); };
  const keys = async () => { const d = await db(); return new Promise(res => { const r = d.transaction("media").objectStore("media").getAllKeys(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); }); };

  let MAN = null, STATE = { busy: false, done: 0, total: 0, err: "", fresh: [] };
  try { MAN = JSON.parse(localStorage.getItem("media_manifest") || "null"); } catch (e) {}
  const mb = n => (n / 1e6).toFixed(1) + "MB";

  async function sync(manual) {
    if (STATE.busy) return;
    STATE.busy = true; STATE.err = ""; STATE.fresh = [];
    try {
      const r = await fetch(BASE + "media.json?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw new Error("אין חיבור לאתר");
      MAN = await r.json(); try { localStorage.setItem("media_manifest", JSON.stringify(MAN)); } catch (e) {}
      const have = new Set(await keys());
      const need = [];
      for (const it of MAN.items || []) {
        if (have.has("autodel:" + it.id)) continue;
        const cur = have.has("auto:" + it.id) ? await get("auto:" + it.id) : null;
        if (!cur || cur.bytes !== it.bytes || cur.file !== it.file) need.push(it);
      }
      STATE.total = need.length; STATE.done = 0; paint();
      for (const it of need) {
        const res = await fetch(BASE + it.file, { cache: "no-store" });
        if (!res.ok) throw new Error("לא הצלחתי להוריד את " + it.title);
        const blob = await res.blob();
        const rec = { blob, name: it.file.split("/").pop(), type: blob.type || (it.kind === "video" ? "video/mp4" : "image/jpeg"), bytes: it.bytes, file: it.file, saved: Date.now() };
        await put("auto:" + it.id, rec);
        if (it.slot && !(await get(it.slot))) { const wh = it.ratio === "1:1" ? [1080, 1080] : [1080, 1350]; await put(it.slot, Object.assign({}, rec, { w: wh[0], h: wh[1] })); }
        STATE.done++; STATE.fresh.push(it.title); paint();
      }
      if (need.length && window.BQ_TOAST) window.BQ_TOAST("📥 " + need.length + " קבצים חדשים ירדו לתוסף");
      else if (manual && window.BQ_TOAST) window.BQ_TOAST("הכל מעודכן ✔️");
    } catch (e) { STATE.err = String(e.message || e); }
    STATE.busy = false; paint();
  }
  function paint() { const v = window.BQ_VIEW && window.BQ_VIEW(); if ((v === "media" || v === "topics") && window.BQ_RENDER) window.BQ_RENDER(); }

  const URLS = [];
  let FILTER = "";
  /* כרטיס של קובץ אחד */
  async function card(it) {
    const rec = await get("auto:" + it.id);
    let pv;
    if (rec) { const u = URL.createObjectURL(rec.blob); URLS.push(u); pv = it.kind === "video" ? `<video src="${u}" controls playsinline preload="metadata" poster="${BASE + (it.thumb || "")}"></video>` : `<img src="${u}" alt="">`; }
    else pv = `<img src="${BASE + (it.thumb || it.file)}" alt="" style="opacity:.6"><span class="md-wait">⏳ יורד…</span>`;
    const dl = rec ? `<a class="btn sm" href="${URLS[URLS.length - 1]}" download="${esc(rec.name)}">⬇️ הורדה</a>` : `<a class="btn sm o" href="${BASE + it.file}" target="_blank" rel="noopener">⬇️ מהאתר</a>`;
    return `<div class="md-card"><div class="md-pv">${pv}</div><b>${esc(it.title)}</b><span class="small mute">${esc(it.kind === "video" ? "🎬 סרטון" : "🖼️ תמונה")} ${esc(it.ratio || "")} · ${mb(it.bytes)} · ${esc(it.date || "")}</span>
      <div class="row">${dl}${it.text ? window.BQ_CBTN(it.text, "📋 הטקסט") : ""}<button class="btn sm o" data-md="del:${esc(it.id)}" title="למחוק מהתוסף">🗑️</button></div></div>`;
  }
  /* מסודר לפי הנושאים של האתר (הסדר של מרכז הפרסום); קובץ בלי נושא – לפי הקבוצה שלו */
  function byTopic(items) {
    const T = (window.BQ_TOPICS && window.BQ_TOPICS()) || [], out = [];
    T.forEach(t => { const x = items.filter(i => i.topic === t.id); if (x.length) out.push({ id: t.id, name: (t.ic && !String(t.name).startsWith(t.ic) ? t.ic + " " : "") + t.name, items: x }); });
    const rest = items.filter(i => !i.topic || !T.some(t => t.id === i.topic));
    (MAN.groups || []).forEach(g => { const x = rest.filter(i => i.group === g.id); if (x.length) out.push({ id: "g:" + g.id, name: g.name, items: x }); });
    const left = rest.filter(i => !(MAN.groups || []).some(g => g.id === i.group));
    if (left.length) out.push({ id: "other", name: "📁 אחר", items: left });
    return out;
  }
  async function html() {
    URLS.splice(0).forEach(u => URL.revokeObjectURL(u));
    let h = `<h1>🎬 הקבצים שלי</h1><p class="mute">כל תמונה וסרטון ש-Claude מכין לפרסום יורדים לכאן לבד, בכל פתיחה של התוסף, מסודרים לפי הנושאים באתר. הם נשמרים במחשב הזה (גם אם יימחקו מהאתר).</p>
      <div class="row" style="margin:8px 0"><button class="btn sm s" data-md="sync">🔄 לבדוק אם יש חדשים</button>
      ${STATE.busy ? `<span class="pill w">⏳ מורידים ${STATE.done} / ${STATE.total}…</span>` : ""}${STATE.err ? `<span class="pill p">😕 ${esc(STATE.err)}</span>` : ""}</div>`;
    if (!MAN) return h + `<div class="card">⏳ בודקים מה יש באתר…</div>`;
    const ks = new Set(await keys());
    const items = (MAN.items || []).filter(i => !ks.has("autodel:" + i.id));
    const groups = byTopic(items);
    if (FILTER && !groups.some(g => g.id === FILTER)) FILTER = "";
    h += `<div class="chan">` + [`<button class="chip ${FILTER ? "" : "on"}" data-md="f:">🌈 הכל <small>${items.length} קבצים</small></button>`].concat(groups.map(g => `<button class="chip ${FILTER === g.id ? "on" : ""}" data-md="f:${esc(g.id)}">${esc(g.name)} <small>${g.items.length}</small></button>`)).join("") + `</div>`;
    for (const g of groups.filter(g => !FILTER || g.id === FILTER)) {
      h += `<div class="card"><h2 style="margin:0 0 4px">${esc(g.name)} <span class="pill">${g.items.length}</span></h2>`;
      const grp = (MAN.groups || []).find(x => x.id === g.items[0].group);
      if (grp && grp.note) h += `<p class="small mute" style="margin:2px 0 6px">${esc(grp.note)}</p>`;
      if (!g.id.includes(":") && g.id !== "other") h += `<button class="btn sm o" data-gotopic="${esc(g.id)}">הטקסטים של הנושא ←</button>`;
      h += `<div class="md-grid">`; for (const it of g.items) h += await card(it); h += `</div></div>`;
    }
    if (!items.length) h += `<div class="card">עוד אין קבצים. כשClaude יכין סרטון או תמונה – הם יופיעו כאן לבד.</div>`;
    const gone = [...ks].filter(k => k.startsWith("auto:") && !(MAN.items || []).some(i => "auto:" + i.id === k));
    if (gone.length) h += `<p class="small mute">📦 ${gone.length} קבצים ישנים שכבר לא באתר – עדיין שמורים כאן.</p>`;
    return h;
  }
  /* בתוך "נושאים וטקסטים": הקבצים שירדו לנושא הזה */
  async function topicBlock(tid) {
    if (!MAN) return "";
    const ks = new Set(await keys());
    const items = (MAN.items || []).filter(i => i.topic === tid && !ks.has("autodel:" + i.id));
    if (!items.length) return "";
    let h = `<div class="card"><h3>🎬 קבצים מוכנים לנושא הזה (${items.length})</h3><div class="md-grid">`;
    for (const it of items) h += await card(it);
    return h + `</div></div>`;
  }
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-md]"); if (!b) return; e.stopPropagation();
    const a = b.dataset.md;
    if (a === "sync") return sync(true);
    if (a.startsWith("f:")) { FILTER = a.slice(2); return paint(); }
    if (a.startsWith("del:")) { const id = a.slice(4); if (!confirm("למחוק את הקובץ מהתוסף? (הוא לא יירד שוב)")) return; await del("auto:" + id); await put("autodel:" + id, { at: Date.now() }); paint(); }
  }, true);
  window.BQ_MEDIA = { html, sync, topicBlock };
  setTimeout(() => sync(false), 1500);
})();
