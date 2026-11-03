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
  function paint() { if (window.BQ_VIEW && window.BQ_VIEW() === "media" && window.BQ_RENDER) window.BQ_RENDER(); }

  const URLS = [];
  async function html() {
    URLS.splice(0).forEach(u => URL.revokeObjectURL(u));
    let h = `<h1>🎬 הקבצים שלי</h1><p class="mute">כל תמונה וסרטון ש-Claude מכין לפרסום יורדים לכאן לבד, בכל פתיחה של התוסף. הם נשמרים במחשב הזה (גם אם יימחקו מהאתר).</p>
      <div class="row" style="margin:8px 0"><button class="btn sm s" data-md="sync">🔄 לבדוק אם יש חדשים</button>
      ${STATE.busy ? `<span class="pill w">⏳ מורידים ${STATE.done} / ${STATE.total}…</span>` : ""}${STATE.err ? `<span class="pill p">😕 ${esc(STATE.err)}</span>` : ""}</div>`;
    if (!MAN) return h + `<div class="card">⏳ בודקים מה יש באתר…</div>`;
    const ks = new Set(await keys());
    for (const g of MAN.groups || []) {
      const items = (MAN.items || []).filter(i => i.group === g.id && !ks.has("autodel:" + i.id));
      if (!items.length) continue;
      h += `<details class="card" open><summary style="cursor:pointer"><b style="font-size:18px">${esc(g.name)}</b> <span class="pill">${items.length}</span></summary>
        ${g.note ? `<p class="small mute" style="margin:6px 0">${esc(g.note)}</p>` : ""}<div class="md-grid">`;
      for (const it of items) {
        const rec = await get("auto:" + it.id);
        let pv;
        if (rec) { const u = URL.createObjectURL(rec.blob); URLS.push(u); pv = it.kind === "video" ? `<video src="${u}" controls playsinline preload="metadata" poster="${BASE + (it.thumb || "")}"></video>` : `<img src="${u}" alt="">`; }
        else pv = `<img src="${BASE + (it.thumb || it.file)}" alt="" style="opacity:.6"><span class="md-wait">⏳ יורד…</span>`;
        const dl = rec ? `<a class="btn sm" href="${URLS[URLS.length - 1]}" download="${esc(rec.name)}">⬇️ הורדה</a>` : `<a class="btn sm o" href="${BASE + it.file}" target="_blank" rel="noopener">⬇️ מהאתר</a>`;
        h += `<div class="md-card"><div class="md-pv">${pv}</div><b>${esc(it.title)}</b><span class="small mute">${esc(it.kind === "video" ? "🎬 סרטון" : "🖼️ תמונה")} ${esc(it.ratio || "")} · ${mb(it.bytes)} · ${esc(it.date || "")}</span>
          <div class="row">${dl}${it.text ? window.BQ_CBTN(it.text, "📋 הטקסט") : ""}<button class="btn sm o" data-md="del:${esc(it.id)}" title="למחוק מהתוסף">🗑️</button></div></div>`;
      }
      h += `</div></details>`;
    }
    const gone = [...ks].filter(k => k.startsWith("auto:") && !(MAN.items || []).some(i => "auto:" + i.id === k));
    if (gone.length) h += `<p class="small mute">📦 ${gone.length} קבצים ישנים שכבר לא באתר – עדיין שמורים כאן.</p>`;
    return h;
  }
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-md]"); if (!b) return; e.stopPropagation();
    const a = b.dataset.md;
    if (a === "sync") return sync(true);
    if (a.startsWith("del:")) { const id = a.slice(4); if (!confirm("למחוק את הקובץ מהתוסף? (הוא לא יירד שוב)")) return; await del("auto:" + id); await put("autodel:" + id, { at: Date.now() }); paint(); }
  }, true);
  window.BQ_MEDIA = { html, sync };
  setTimeout(() => sync(false), 1500);
})();
