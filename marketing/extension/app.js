/* בוקלי – מרכז הפרסום. הנתונים: data.js (מוטמע) + עדכון אוטומטי מ-games.booqli.ai/marketing/kit.json */
(function () {
  "use strict";
  const UPDATE_URL = "https://games.booqli.ai/marketing/kit.json";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem("bq_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("bq_" + k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---------- נתונים ----------
  let KIT = window.KIT_BUNDLED;
  const cached = LS.get("kit_cache", null);
  if (cached && cached.version > KIT.version) KIT = cached;
  let view = LS.get("view", "today"), selTopic = LS.get("topic", "colors"), selDay = null;

  function topic(id) { return KIT.topics.find(t => t.id === id); }
  function groupName(kind, key) { const o = LS.get("groups", {}); return (o[kind] && o[kind][key]) || KIT.groups[kind][key] || key; }
  function articleUrl(t) { const o = LS.get("articles", {}); return o[t.id] || (t.article && t.article.url) || ""; }
  function todayISO() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  function nice(iso) { const d = new Date(iso + "T12:00:00"); return "יום " + DAYS[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1); }

  // ---------- קישורים עם סימון (UTM) ----------
  const CH = {
    wa: ["whatsapp", "group"], share: ["whatsapp", "share"], fb: ["facebook_group", "post"], fbp: ["facebook_group", "post_parents"],
    dm: ["facebook_group", "comment"], ad: ["facebook", "paid"], ig: ["instagram", "post"]
  };
  function link(t, ch) {
    if (!t.path && t.id === "join") return KIT.group;
    let base = /^https?:/.test(t.path) ? t.path : KIT.site + t.path;
    if (ch === "ad") { const a = articleUrl(t); if (a) base = a; }
    const [src, med] = CH[ch];
    return base + (base.includes("?") ? "&" : "?") + "utm_source=" + src + "&utm_medium=" + med + "&utm_campaign=" + t.id;
  }
  function fill(text, t, ch) { return String(text || "").split("{LINK}").join(link(t, ch)).split("{GROUP}").join(KIT.group); }
  function noLink(text) {
    const lines = String(text).split("\n").filter(l => !/\{LINK\}|\{GROUP\}|מספר סודי מקבוצת/.test(l));
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n\nרוצות את הקישור? כתבו \"אני\" בתגובות ואשלח לכן בפרטי 👇";
  }
  function dmText(t) {
    return "היי 🌸 הנה " + t.name + " שביקשת:\n{LINK}\n" +
      (t.locked ? "כדי לפתוח צריך את המספר הסודי – הוא כתוב בתיאור קבוצת העדכונים השקטה שלנו:\n{GROUP}\n" : "") +
      "שמחה לעזור! 💕 שמש, BOOQLI\n\n🙏 *עזרו לנו לגדול – הזמינו חברים לקבוצה* 💕" + (t.locked ? "" : "\n{GROUP}");
  }
  // כל סוגי הטקסטים של נושא: [מפתח, כותרת, ערוץ, טקסט]
  function texts(t) {
    const L = [];
    if (t.fb) L.push(["fb", "📘 פוסט לקבוצות פייסבוק – " + (t.aud.includes("הורים") && !t.aud.includes("גננות") ? "להורים" : "לגננות"), "fb", t.fb]);
    if (t.fbp) L.push(["fbp", "📘 פוסט לקבוצות פייסבוק – להורים / ועדים", "fbp", t.fbp]);
    if (t.wa) L.push(["wa", "💬 וואטסאפ – קבוצת העדכונים שלך", "wa", t.wa]);
    if (t.share) L.push(["share", "💬 וואטסאפ – לקבוצות אחרות (נשמע כמו המלצה של חברה)", "share", t.share]);
    if (t.id !== "join") L.push(["dm", "✉️ הודעה פרטית למי שכתבה \"אני\"", "dm", dmText(t)]);
    return L;
  }

  // ---------- כלים ----------
  function toast(m) { const e = $("#toast"); e.textContent = m; e.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("show"), 1700); }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    toast(msg || "הועתק ✔️");
  }
  const COPY = {}; let copyN = 0;
  function cbtn(text, label, cls) { const k = "c" + (++copyN); COPY[k] = text; return `<button class="btn sm ${cls || ""}" data-copy="${k}">${label || "📋 העתקה"}</button>`; }
  function doneMap() { return LS.get("done", {}); }
  function isDone(key) { return !!doneMap()[key]; }
  function setDone(key, v) { const m = doneMap(); if (v) m[key] = 1; else delete m[key]; LS.set("done", m); }

  // ---------- תמונות וסרטונים (IndexedDB) ----------
  let dbp = null;
  function db() {
    if (!dbp) dbp = new Promise((res, rej) => { const r = indexedDB.open("booqli-kit", 1); r.onupgradeneeded = () => r.result.createObjectStore("media"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    return dbp;
  }
  async function mget(k) { const d = await db(); return new Promise(res => { const r = d.transaction("media").objectStore("media").get(k); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }); }
  async function mput(k, v) { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction("media", "readwrite"); tx.objectStore("media").put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
  async function mdel(k) { const d = await db(); return new Promise(res => { const tx = d.transaction("media", "readwrite"); tx.objectStore("media").delete(k); tx.oncomplete = res; }); }
  async function mkeys() { const d = await db(); return new Promise(res => { const r = d.transaction("media").objectStore("media").getAllKeys(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); }); }

  function measure(file, kind) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      if (kind === "image") { const im = new Image(); im.onload = () => { res([im.naturalWidth, im.naturalHeight]); URL.revokeObjectURL(url); }; im.onerror = () => rej(); im.src = url; }
      else { const v = document.createElement("video"); v.preload = "metadata"; v.onloadedmetadata = () => { res([v.videoWidth, v.videoHeight]); URL.revokeObjectURL(url); }; v.onerror = () => rej(); v.src = url; }
    });
  }
  async function saveMedia(tid, kind, file) {
    if (kind === "image" && !file.type.startsWith("image/")) return toast("זה לא קובץ תמונה");
    if (kind === "video" && !file.type.startsWith("video/")) return toast("זה לא קובץ סרטון");
    let wh; try { wh = await measure(file, kind); } catch (e) { return alert("לא הצלחתי לקרוא את הקובץ. נסי קובץ MP4 (סרטון) או JPG/PNG (תמונה)."); }
    const r = wh[0] / wh[1], want = kind === "image" ? 1 : 0.8;
    if (!wh[1] || Math.abs(r - want) > 0.02) {
      return alert((kind === "image" ? "צריך תמונה מרובעת 1:1" : "צריך סרטון 4:5") + " – והקובץ הזה " + wh[0] + "×" + wh[1] + ".\n" +
        (kind === "image" ? "לדוגמה 1080×1080." : "לדוגמה 1080×1350.") + "\nהקובץ לא נשמר.");
    }
    await mput(tid + ":" + kind, { blob: file, name: file.name, type: file.type, w: wh[0], h: wh[1], saved: Date.now() });
    toast("נשמר ✔️ " + wh[0] + "×" + wh[1]);
    render();
  }
  async function mediaBlock(t, compact) {
    const out = [];
    for (const kind of ["video", "image"]) {
      const m = await mget(t.id + ":" + kind), lab = kind === "video" ? "🎬 סרטון 4:5" : "🖼️ תמונה 1:1";
      let pv = `<div class="empty">אין עדיין ${kind === "video" ? "סרטון" : "תמונה"}</div>`, btns = "";
      if (m) {
        const u = URL.createObjectURL(m.blob);
        pv = kind === "video" ? `<video src="${u}" controls muted playsinline></video>` : `<img src="${u}" alt="">`;
        btns = `<a class="btn sm s" href="${u}" download="${esc(t.id + "-" + (kind === "video" ? "4x5" : "1x1") + "-" + m.name)}">⬇️ הורדה</a>` +
          (kind === "image" ? ` <button class="btn sm s" data-copyimg="${t.id}">📋 העתקת התמונה</button>` : "") +
          ` <button class="btn sm o" data-delmedia="${t.id}:${kind}">🗑️</button>`;
      }
      out.push(`<div class="slot"><b>${lab}</b>${m ? ` <span class="small mute">${m.w}×${m.h}</span>` : ""}
        <div class="pv ${kind === "video" ? "v" : "i"}" style="${compact ? "max-width:160px" : ""}">${pv}</div>
        <div class="row" style="justify-content:center">${btns}
        <label class="btn sm">${m ? "🔄 להחליף" : "➕ להעלות"}<input type="file" hidden accept="${kind === "video" ? "video/*" : "image/*"}" data-upload="${t.id}:${kind}"></label></div></div>`);
    }
    return `<div class="media">${out.join("")}</div>`;
  }
  async function copyImage(tid) {
    const m = await mget(tid + ":image"); if (!m) return;
    try {
      const bmp = await createImageBitmap(m.blob), c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height;
      c.getContext("2d").drawImage(bmp, 0, 0);
      const png = await new Promise(r => c.toBlob(r, "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      toast("התמונה הועתקה – אפשר להדביק בוואטסאפ ווב / פייסבוק ✔️");
    } catch (e) { toast("לא הצלחתי להעתיק – השתמשי בהורדה"); }
  }

  // ---------- משימות של יום ----------
  function dayTasks(p) {
    const t = topic(p.topic), L = [];
    if (!t) return L;
    if (p.article && t.article && t.article.status === "חסר") L.push({ k: "art", kind: "art", what: "📝 מאמר ל-booqli.ai: \"" + t.article.title + "\"", sub: "רצוי לפני הפרסום (המודעות והפוסטים יכולים להוביל אליו). אם כבר עלה – הדביקי את הכתובת בלשונית נושאים." });
    p.wa.forEach(g => { const ch = g === "WA1" ? "wa" : "share", txt = g === "WA1" ? t.wa : (t.share || t.wa); if (txt) L.push({ k: "wa-" + g, kind: "wa", what: "💬 וואטסאפ: " + groupName("wa", g), text: fill(txt, t, ch) }); });
    p.fb.forEach(n => {
      const useP = p.fbKind === "fbp" && t.fbp, txt = useP ? t.fbp : t.fb, ch = useP ? "fbp" : "fb";
      if (txt) L.push({ k: "fb-" + n, kind: "fb", what: "📘 פייסבוק: " + groupName("fb", String(n)), text: fill(txt, t, ch), nolink: t.id === "join" ? "" : noLink(txt), alt: p.fbKind === "both" && t.fbp ? fill(t.fbp, t, "fbp") : "" });
    });
    let firstFb = null; L.forEach(x => { if (x.kind === "fb") { if (firstFb === null) firstFb = x.text; else if (x.text === firstFb) x.same = true; } });
    if (p.ask) L.push({ k: "ask", kind: "ask", what: "🙏 " + p.ask });
    if (p.camp) L.push({ k: "camp", kind: "camp", what: "📣 קמפיינים: " + p.camp });
    return L;
  }
  function taskHTML(p, x) {
    const key = p.date + ":" + x.k, d = isDone(key);
    let extra = "";
    if (x.text) extra += (x.same ? `<div class="small mute">אותו פוסט כמו למעלה ↑</div>` : `<div class="txt">${esc(x.text)}</div>`) + `<div class="row">${cbtn(x.text, "📋 העתקה", x.kind === "wa" ? "wa" : "")}${x.nolink ? cbtn(x.nolink, "📋 בלי קישור (+ 'כתבו אני')", "o") : ""}${x.alt ? cbtn(x.alt, "📋 גרסת הורים", "o") : ""}</div>`;
    if (x.sub) extra += `<div class="small mute">${esc(x.sub)}</div>`;
    return `<div class="task ${d ? "done" : ""}"><input type="checkbox" data-done="${esc(key)}" ${d ? "checked" : ""} aria-label="בוצע"><div class="body"><div class="what">${esc(x.what)}</div>${extra}</div></div>`;
  }
  function progress(p) { const L = dayTasks(p); if (!L.length) return [0, 0]; return [L.filter(x => isDone(p.date + ":" + x.k)).length, L.length]; }

  async function renderDay(p, isToday) {
    const t = topic(p.topic);
    if (!t) return `<div class="card hero"><h1>${nice(p.date)}</h1><p>${esc(p.note || "אין פרסום היום")}</p></div>`;
    const [dn, tot] = progress(p);
    let h = `<div class="card hero"><div class="row"><span style="font-size:40px">${t.ic}</span><div style="flex:1"><div class="mute small">${isToday ? "היום · " : ""}${nice(p.date)}</div><h1>${esc(t.name)}</h1>
      <div class="row"><span class="pill">${esc(t.aud)}</span>${t.locked ? '<span class="pill w">🔑 נעול במספר סודי</span>' : '<span class="pill g">פתוח לכולם</span>'}<span class="small mute">${dn}/${tot} בוצעו</span></div></div>
      <button class="btn o sm" data-gotopic="${t.id}">כל הטקסטים של הנושא ←</button></div>
      ${p.note ? `<p style="margin:8px 0 0">💡 ${esc(p.note)}</p>` : ""}</div>`;
    h += `<div class="card"><h3>מה עושים</h3>${dayTasks(p).map(x => taskHTML(p, x)).join("")}</div>`;
    h += `<div class="card"><h3>הכותרות של הנושא</h3>${(t.headlines || []).map(x => `<div class="hl"><span>${esc(x)}</span>${cbtn(x, "📋")}</div>`).join("")}</div>`;
    h += `<div class="card"><h3>התמונה והסרטון של הנושא</h3>${await mediaBlock(t, true)}</div>`;
    return h;
  }

  // ---------- המסכים ----------
  async function vToday() {
    const today = todayISO();
    let p = KIT.plan.find(x => x.date === today), label = "";
    if (!p) { p = KIT.plan.find(x => x.date > today); label = p ? "אין משימה להיום. הבא בתור:" : ""; }
    if (!p) return `<div class="card hero"><h1>התוכנית הסתיימה 🎉</h1><p>בקשי מ-Claude: "תעדכן את התוכנית של מרכז הפרסום לחודש הבא" – והתוסף יתעדכן לבד.</p></div>`;
    let h = label ? `<p class="mute">${label}</p>` : "";
    h += await renderDay(p, p.date === today);
    const nxt = KIT.plan.find(x => x.date > p.date && x.topic);
    if (nxt) { const t = topic(nxt.topic); h += `<div class="card"><span class="mute">מחר / הבא:</span> <b>${nice(nxt.date)} · ${t.ic} ${esc(t.name)}</b> ${nxt.article && t.article.status === "חסר" ? '<span class="pill p">📝 צריך מאמר</span>' : ""} <button class="btn sm o" data-day="${nxt.date}">לפתוח</button></div>`; }
    return h;
  }
  async function vDayDetail() { const p = KIT.plan.find(x => x.date === selDay); return `<button class="btn o sm" data-v="month">→ חזרה ללוח</button>` + await renderDay(p, p.date === todayISO()); }
  function vMonth() {
    const today = todayISO();
    const rows = KIT.plan.map(p => {
      const t = topic(p.topic), [dn, tot] = progress(p);
      const ch = t ? [p.wa.map(g => groupName("wa", g)).join(", "), p.fb.length ? "פייסבוק: " + p.fb.join(", ") : ""].filter(Boolean).join(" · ") : "";
      const flags = (t && p.article && t.article.status === "חסר" ? '<span class="pill p">📝 מאמר</span> ' : "") + (p.camp ? '<span class="pill">📣</span> ' : "") + (p.ask ? '<span class="pill w">🙏 בקשה</span>' : "") + (t && t.opens === p.date ? ' <span class="pill g">🎁 נפתח</span>' : "");
      return `<tr class="${p.date === today ? "today" : p.date < today ? "past" : ""} ${t ? "click" : ""}" ${t ? `data-day="${p.date}"` : ""}>
        <td><b>${nice(p.date)}</b></td><td>${t ? t.ic + " " + esc(t.name) : `<span class="mute">${esc(p.note)}</span>`}</td><td class="small">${esc(ch)}</td><td>${flags}</td>
        <td>${tot ? `<div class="prog" title="${dn}/${tot}"><i style="width:${Math.round(100 * dn / tot)}%"></i></div>` : ""}</td></tr>`;
    }).join("");
    const arts = KIT.plan.filter(p => p.article && topic(p.topic) && topic(p.topic).article.status === "חסר").map(p => `<li><b>${nice(p.date)}</b> – ${esc(topic(p.topic).article.title)}</li>`).join("");
    return `<h1>לוח החודש</h1><p class="mute">לוחצים על יום כדי לראות את הטקסטים ולסמן מה בוצע. פייסבוק = מספרי הקבוצות (השמות בהגדרות).</p>
      <div style="overflow-x:auto"><table><thead><tr><th>יום</th><th>נושא</th><th>איפה</th><th>שימו לב</th><th>בוצע</th></tr></thead><tbody>${rows}</tbody></table></div>
      <h2>📝 מאמרים שצריך להוסיף ל-booqli.ai (לפי תאריך)</h2><div class="card"><ul>${arts}</ul><p class="small mute">רק לדעת – לא נכתבו. מאמר בעמוד ההוא מאפשר לפייסבוק למדוד צפיות, ומביא תנועה מגוגל לאורך זמן.</p></div>`;
  }
  async function vTopics() {
    const t = topic(selTopic) || KIT.topics[0];
    const chips = KIT.topics.map(x => `<button class="chip ${x.id === t.id ? "on" : ""}" data-topic="${x.id}">${x.ic} ${esc(x.name)}<small>${esc(x.aud)}</small></button>`).join("");
    const art = t.article || {};
    let h = `<h1>נושאים וטקסטים</h1><p class="mute">בוחרים נושא ומקבלים הכל להעתקה. הקישורים כבר מסומנים לפי הערוץ, כדי שבמדידה תדעי מאיפה הגיעו.</p><div class="grid">${chips}</div>
      <div class="card hero" style="margin-top:14px"><div class="row"><span style="font-size:40px">${t.ic}</span><div style="flex:1"><h1>${esc(t.name)}</h1>
      <div class="row"><span class="pill">${esc(t.aud)}</span>${t.locked ? '<span class="pill w">🔑 נעול במספר סודי</span>' : '<span class="pill g">פתוח לכולם</span>'}<span class="small mute">פתיחה: ${esc(/^\d{4}/.test(t.opens) ? nice(t.opens) : t.opens)}</span></div></div></div>
      <p style="margin:8px 0 0"><b>🎯 קהל יעד:</b> ${esc(t.target)}</p></div>`;
    h += `<div class="card"><h3>📝 מאמר ב-booqli.ai</h3>${art.status === "חסר" ? `<div class="flag art">חסר מאמר: "${esc(art.title)}" – להוסיף ביום שמפרסמים את הנושא.</div>` : `<span class="pill g">${esc(art.status)}</span> ${esc(art.title)}`}
      ${t.id !== "join" ? `<label class="inp small">כתובת המאמר (אם יש – המודעה הממומנת תוביל אליו)<input data-art="${t.id}" value="${esc(articleUrl(t))}" placeholder="https://www.booqli.ai/he/articles/..."></label>` : ""}</div>`;
    if (window.BQ_MEDIA) h += await window.BQ_MEDIA.topicBlock(t.id);
    h += `<div class="card"><h3>🖼️ התמונה והסרטון של הנושא</h3><p class="small mute">רק סרטון 4:5 (למשל 1080×1350) ורק תמונה 1:1 (למשל 1080×1080). קובץ במידה אחרת לא יישמר. נשמר במחשב הזה, בתוך התוסף.</p>${await mediaBlock(t)}</div>`;
    h += `<div class="card"><h3>✨ כותרות</h3>${(t.headlines || []).map(x => `<div class="hl"><span>${esc(x)}</span>${cbtn(x, "📋")}</div>`).join("")}</div>`;
    h += `<div class="card"><h3>📋 טקסטים להעתקה</h3>` + texts(t).map(([k, title, ch, txt]) => {
      const f = fill(txt, t, ch);
      return `<div class="sec"><div class="row" style="justify-content:space-between"><b>${esc(title)}</b><div class="row">${cbtn(f, "📋 העתקה", ch === "wa" || ch === "share" ? "wa" : "")}${(k === "fb" || k === "fbp") ? cbtn(noLink(txt), "📋 בלי קישור", "o") : ""}</div></div><div class="txt">${esc(f)}</div></div>`;
    }).join("") + `<div class="sec"><div class="row" style="justify-content:space-between"><b>#️⃣ האשטגים (רק לפוסטים רגילים, לא למודעות)</b>${cbtn(t.tags || "", "📋")}</div><div class="txt">${esc(t.tags || "")}</div></div></div>`;
    if (t.adHead) h += `<div class="card"><h3>📣 מודעה ממומנת</h3>
      <div class="sec"><div class="row" style="justify-content:space-between"><b>טקסט ראשי</b>${cbtn(t.ad)}</div><div class="txt">${esc(t.ad)}</div></div>
      <div class="hl"><span><b>כותרת:</b> ${esc(t.adHead)}</span>${cbtn(t.adHead, "📋")}</div>
      <div class="hl"><span><b>תיאור:</b> ${esc(t.adDesc)}</span>${cbtn(t.adDesc, "📋")}</div>
      <div class="hl"><span class="small" style="direction:ltr;overflow-wrap:anywhere"><b>קישור:</b> ${esc(link(t, "ad"))}</span>${cbtn(link(t, "ad"), "📋")}</div>
      <p class="small mute">קהל: נשים בלבד (להגדיר כהגבלה, Advantage+ audience כבוי) · ישראל · 22+ · עברית · מטרה: Traffic ← Landing page views.</p></div>`;
    else if (t.ad) h += `<div class="card"><h3>📣 מודעה ממומנת</h3><p>${esc(t.ad)}</p></div>`;
    h += `<div class="card"><h3>🔗 קישורים לפי ערוץ</h3>` + [["wa", "וואטסאפ – קבוצת העדכונים"], ["share", "וואטסאפ – קבוצות אחרות"], ["fb", "פייסבוק – קבוצות"], ["ig", "אינסטגרם (לביו / סטורי)"], ["ad", "מודעה ממומנת"]].map(([c, n]) => `<div class="hl"><span class="small"><b>${n}:</b> <span style="direction:ltr;display:inline-block;overflow-wrap:anywhere">${esc(link(t, c))}</span></span>${cbtn(link(t, c), "📋")}</div>`).join("") + `</div>`;
    return h;
  }
  function vCamps() {
    const st = LS.get("camps", {});
    const card = c => { const t = topic(c.topic) || { ic: "📣", id: "" }, s = st[c.n] || c.status;
      return `<div class="card"${/^רץ/.test(s) ? ' style="border:2px solid #17733b"' : ""}><div class="row"><span class="pill ${/^רץ/.test(s) ? "g" : "w"}">${c.n}</span><h3 style="margin:0;flex:1">${t.ic} ${esc(c.name)}</h3><span class="pill">${esc(c.aud)}</span><span class="small mute">${esc(c.kind)}</span></div>
      <p class="small" style="margin:6px 0">${esc(c.note)}</p>
      ${c.copy ? `<details style="margin:6px 0"><summary><b>⚙️ כל ההגדרות והטקסטים – להעתקה</b></summary>${c.copy.map(x => `<div style="margin:8px 0"><div class="row"><b style="flex:1">${esc(x.h)}</b>${cbtn(x.t)}</div><div class="txt" style="max-height:none;white-space:pre-wrap${/^https?:/.test(x.t) ? ";direction:ltr;text-align:left;font-size:13px" : ""}">${esc(x.t)}</div></div>`).join("")}</details>` : ""}
      ${c.link ? `<div class="txt" style="max-height:none;direction:ltr;text-align:left;font-size:13px">${esc(c.link)}</div><div class="row">${cbtn(c.link, "📋 להעתיק את הקישור למודעה")}${c.measure ? `<span class="small mute">בדוח: 🚪 ${esc(c.measure)}</span>` : ""}</div>` : ""}
      <div class="row" style="margin-top:6px"><label class="small">מצב: <select data-camp="${c.n}">${[c.status, "מוכן להעלאה", "רץ", "רץ – לבדוק!", "מושהה", "בהמתנה", "הסתיים", s].filter((v, i, a) => v && a.indexOf(v) === i).map(o => `<option ${o === s ? "selected" : ""}>${o}</option>`).join("")}</select></label>
      ${t.id ? `<button class="btn sm o" data-gotopic="${t.id}">הטקסטים והתמונה של המודעה ←</button>` : ""}</div></div>`; };
    const all = KIT.campaigns, run = all.filter(c => /^רץ/.test(st[c.n] || c.status)), ready = all.filter(c => /^מוכן/.test(st[c.n] || c.status)), rest = all.filter(c => !/^(רץ|מוכן)/.test(st[c.n] || c.status));
    return `<h1>📣 הקמפיינים בממומן</h1><p class="mute"><b>${run.length} רצים עכשיו.</b> מודדים לפי מה שהם מביאים בסוף (פנייה, הרשמה), לא לפי מחיר לכניסה. את הכניסות מכל מודעה רואים ב"📊 מדידה" ← 🚪.</p>
${ready.length ? `<h2>🚀 מוכנים להעלאה</h2>${ready.map(card).join("")}` : ""}
      <h2>🟢 רץ עכשיו</h2>${run.map(card).join("") || '<div class="card">אין קמפיין פעיל.</div>'}
      <details class="card"><summary><b>💤 מושהים ורעיונות לעתיד (${rest.length})</b></summary>${rest.map(card).join("")}</details>`;
  }
  function vGuide() {
    return `<div class="guide">` + (KIT.guide || []).map(s => `<div class="card"><h2 style="margin-top:0">${esc(s.h)}</h2>${s.p ? `<p>${esc(s.p)}</p>` : ""}${s.items ? `<ul>${s.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}</div>`).join("") + `</div>`;
  }
  function vSettings() {
    const g = KIT.groups;
    const inp = (kind, key) => `<label class="inp small">${esc(g[kind][key])}<input data-group="${kind}:${key}" value="${esc(groupName(kind, key))}"></label>`;
    return `<h1>הגדרות</h1>
      <div class="card"><h3>שמות הקבוצות</h3><p class="small mute">כתבי את השמות האמיתיים – הם יופיעו בתוכנית היומית.</p>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${Object.keys(g.wa).map(k => inp("wa", k)).join("")}</div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${Object.keys(g.fb).map(k => inp("fb", k)).join("")}</div></div>
      <div class="card"><h3>עדכונים</h3><p>גרסת התוכן: <b>${esc(KIT.version)}</b>. התוסף בודק לבד אם יש גרסה חדשה בכל פתיחה.</p>
      <p class="small mute">כדי לעדכן: בקשי מ-Claude בשיחה על האתר "תעדכן את מרכז הפרסום" (נושא חדש, תוכנית לחודש הבא, טקסטים). הוא מעדכן קובץ אחד באתר, והתוסף מושך אותו לבד. הסימונים, שמות הקבוצות, התמונות והסרטונים שלך נשארים.</p>
      <button class="btn s" id="checkUpd">🔄 לבדוק עדכון עכשיו</button></div>
      <div class="card"><h3>גיבוי</h3><p class="small mute">שומר את הסימונים, שמות הקבוצות, כתובות המאמרים ומצב הקמפיינים (בלי התמונות והסרטונים).</p>
      <button class="btn s" id="exp">⬇️ שמירת גיבוי</button> <label class="btn o">⬆️ פתיחת גיבוי<input type="file" hidden accept=".json" id="imp"></label></div>`;
  }


  // ---------- מה פתוח באתר (קורא את האתר החי; גיבוי: צילום מצב ב-kit.json) ----------
  let SITEDATA = null, SITESRC = "", siteFilter = "all";
  function parseSite(cat, com) {
    const items = [];
    cat.split("\n").forEach(l => { const m = l.match(/^\s*(\{"id".*\})\s*,?\s*$/); if (m) { try { items.push(JSON.parse(m[1])); } catch (e) {} } });
    const kids = {}, kg = cat.slice(cat.indexOf("window.KIDS_GAMES"));
    (kg.match(/topic:\s*"([\w-]+)"/g) || []).forEach(x => { const t = x.match(/"([\w-]+)"/)[1]; kids[t] = (kids[t] || 0) + 1; });
    const block = n => { const m = com.match(new RegExp("window\\.SITE\\." + n + "\\s*=\\s*\\{([\\s\\S]*?)\\};")), o = {}; if (m) { const re = /"?([\w-]+)"?\s*:\s*"([^"]+)"/g; let r; while ((r = re.exec(m[1]))) o[r[1]] = r[2]; } return o; };
    const ot = com.match(/SITE\.openTopics\s*=\s*\[([^\]]*)\]/);
    return { items, kids, opens: block("opens"), closes: block("closes"), openTopics: ot ? (ot[1].match(/"([\w-]+)"/g) || []).map(x => x.replace(/"/g, "")) : [] };
  }
  async function loadSite(force) {
    if (SITEDATA && !force) return;
    try {
      const [a, b] = await Promise.all(["catalog.js", "common.js"].map(f => fetch(KIT.site + f + "?t=" + Date.now(), { cache: "no-store" }).then(r => { if (!r.ok) throw 0; return r.text(); })));
      const d = parseSite(a, b); if (!d.items.length) throw 0;
      SITEDATA = d; SITESRC = "live";
    } catch (e) { SITEDATA = KIT.siteSnapshot || { items: [] }; SITESRC = "snap"; }
  }
  const pd = s => !s ? null : new Date(s.length > 10 ? (s.length === 16 ? s + ":00+02:00" : s) : s + "T00:00:00+02:00");
  const fmt = s => { const x = pd(s); if (!x) return ""; return x.getDate() + "." + (x.getMonth() + 1) + "." + String(x.getFullYear()).slice(2) + (s.length > 10 && !/23:59/.test(s) ? " " + s.slice(11, 16) : ""); };
  function siteRows() {
    const D = SITEDATA, now = new Date();
    return D.items.map(t => {
      let opens = (D.opens || {})[t.id] || t.opens || "";
      if (!opens && t.event) { const x = pd(t.event); x.setDate(x.getDate() - 30); opens = x.toISOString().slice(0, 10); }
      const closes = (D.closes || {})[t.id] || "";
      let st = t.ready ? "open" : "soon";
      if (closes && pd(closes) < now) st = "closed";
      else if (opens && t.ready && pd(opens) > now) st = "locked";
      const code = !t.href && (D.openTopics || []).indexOf(t.id) < 0;
      const days = closes && st === "open" ? Math.ceil((pd(closes) - now) / 864e5) : null;
      return { t, st, opens, closes, code, kids: (D.kids || {})[t.id] || 0, days };
    });
  }
  async function vSite() {
    await loadSite();
    const rows = siteRows(), order = { open: 0, locked: 1, soon: 2, closed: 3 };
    rows.sort((a, b) => order[a.st] - order[b.st] || (a.opens || "9").localeCompare(b.opens || "9"));
    const cnt = s => rows.filter(r => r.st === s).length;
    const LBL = { open: '<span class="pill g">✅ פתוח</span>', locked: '<span class="pill w">⏳ נפתח בקרוב</span>', soon: '<span class="pill">🛠️ בהכנה (אין תוכן)</span>', closed: '<span class="pill p">🔒 נסגר לעונה</span>' };
    const fl = [["all", "הכל (" + rows.length + ")"], ["open", "✅ פתוח (" + cnt("open") + ")"], ["locked", "⏳ נפתח בקרוב (" + cnt("locked") + ")"], ["soon", "🛠️ בהכנה (" + cnt("soon") + ")"], ["closed", "🔒 נסגר (" + cnt("closed") + ")"]];
    const body = rows.filter(r => siteFilter === "all" || r.st === siteFilter).map(r => {
      const u = KIT.site + (r.t.href || "topics/" + r.t.id + "/");
      return `<tr><td><b>${esc(r.t.ic || "")} ${esc(r.t.name)}</b></td><td>${LBL[r.st]}</td>
        <td>${r.st === "soon" ? '<span class="mute">—</span>' : esc(fmt(r.opens)) || '<span class="mute">כבר פתוח</span>'}</td>
        <td>${r.st === "soon" ? '<span class="mute">—</span>' : r.closes ? esc(fmt(r.closes)) + (r.days != null && r.days <= 14 ? ` <span class="pill p">עוד ${r.days} ימים</span>` : "") : '<span class="mute">כל השנה</span>'}</td>
        <td>${r.st === "soon" ? "" : r.code ? "🔑 כן" : "פתוח לכולם"}</td>
        <td>${r.kids ? "🎮 " + r.kids : ""}</td>
        <td>${r.st === "soon" ? "" : `<a href="${esc(u)}" target="_blank" class="btn sm o">לפתוח</a>`}</td></tr>`;
    }).join("");
    return `<h1>מה פתוח באתר</h1>
      <p class="mute">${SITESRC === "live" ? "✔️ נקרא עכשיו מהאתר החי – תמיד מעודכן." : "⚠️ אין חיבור לאתר כרגע – מוצג צילום מצב מגרסה " + esc(KIT.version) + "."} <button class="btn sm s" id="siteRefresh">🔄 רענון</button></p>
      <div class="chan">${fl.map(([k, n]) => `<button class="btn sm ${siteFilter === k ? "" : "o"}" data-sitef="${k}">${n}</button>`).join("")}</div>
      <div style="overflow-x:auto"><table><thead><tr><th>נושא</th><th>מצב</th><th>נפתח</th><th>נסגר</th><th>מספר סודי</th><th>משחקי ילדים</th><th></th></tr></thead><tbody>${body}</tbody></table></div>
      <p class="small mute">🔑 = לגננות העמוד המלא נפתח במספר הסודי. 🎮 = משחקי הילדים של הנושא פתוחים לכולם באזור הילדים, גם לפני הפתיחה (עד שהעונה נסגרת). "נפתח בקרוב" לפי התאריכים שנקבעו באתר.</p>`;
  }

  // ---------- רעיונות ----------
  const ICATS = ["נושא לאתר", "משחק", "שיווק", "ספר BOOQLI", "אתר", "אחר"], ISTAT = ["רעיון", "בתכנון", "מחכה לי", "נעשה"];
  let ideaFilter = "all", ideaEdit = null;
  function ideas() {
    let L = LS.get("ideas", null);
    const seeded = LS.get("ideas_seeded", []);
    if (!L) L = [];
    (KIT.ideasSeed || []).forEach(x => { if (seeded.indexOf(x.id) < 0) { L.push(Object.assign({ date: todayISO() }, x)); seeded.push(x.id); } });
    LS.set("ideas_seeded", seeded); LS.set("ideas", L);
    return L;
  }
  function vIdeas() {
    const L = ideas(), ed = ideaEdit ? L.find(x => x.id === ideaEdit) : null;
    const opt = (arr, v) => arr.map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("");
    const shown = L.filter(x => ideaFilter === "all" ? x.status !== "נעשה" : ideaFilter === "done" ? x.status === "נעשה" : x.cat === ideaFilter);
    const allTxt = "רעיונות ל-BOOQLI (" + todayISO() + "):\n" + L.filter(x => x.status !== "נעשה").map((x, i) => (i + 1) + ". [" + x.cat + " · " + x.status + "] " + x.title + (x.notes ? " – " + x.notes : "")).join("\n");
    return `<h1>💡 רעיונות לעתיד</h1><p class="mute">כל רעיון שעולה לך – לכאן, ולא לראש. כשבא לך לבנות, מעתיקים רעיון ומדביקים בשיחה עם Claude.</p>
      <div class="card" id="ideaForm"><h3>${ed ? "✏️ עריכת רעיון" : "➕ רעיון חדש"}</h3>
        <label class="inp">מה הרעיון?<input id="iTitle" value="${esc(ed ? ed.title : "")}" placeholder="למשל: נושא שבועות עם משחק עוגת גבינה"></label>
        <div class="row"><label class="inp" style="flex:1">סוג<select id="iCat">${opt(ICATS, ed ? ed.cat : "נושא לאתר")}</select></label>
        <label class="inp" style="flex:1">מצב<select id="iStat">${opt(ISTAT, ed ? ed.status : "רעיון")}</select></label></div>
        <label class="inp">פרטים (לא חובה)<textarea id="iNotes" rows="3" style="width:100%;padding:8px 10px;border:1.5px solid var(--line);border-radius:10px">${esc(ed ? ed.notes || "" : "")}</textarea></label>
        <button class="btn" id="iSave">${ed ? "💾 שמירה" : "➕ להוסיף"}</button> ${ed ? '<button class="btn o" id="iCancel">ביטול</button>' : ""}</div>
      <div class="chan"><button class="btn sm ${ideaFilter === "all" ? "" : "o"}" data-ideaf="all">פתוחים (${L.filter(x => x.status !== "נעשה").length})</button>${ICATS.map(c => `<button class="btn sm ${ideaFilter === c ? "" : "o"}" data-ideaf="${esc(c)}">${esc(c)} (${L.filter(x => x.cat === c).length})</button>`).join("")}<button class="btn sm ${ideaFilter === "done" ? "" : "o"}" data-ideaf="done">✔️ נעשו (${L.filter(x => x.status === "נעשה").length})</button> ${cbtn(allTxt, "📋 להעתיק את כל הרעיונות", "s")}</div>
      ${shown.length ? shown.slice().reverse().map(x => `<div class="card"><div class="row"><h3 style="margin:0;flex:1">${esc(x.title)}</h3><span class="pill">${esc(x.cat)}</span>
        <select data-istat="${x.id}">${opt(ISTAT, x.status)}</select></div>
        ${x.notes ? `<p style="margin:6px 0;white-space:pre-wrap">${esc(x.notes)}</p>` : ""}
        <div class="row"><span class="small mute">${esc(x.date ? nice(x.date) : "")}</span>${cbtn(x.title + (x.notes ? "\n" + x.notes : ""), "📋 להעתיק", "o")}<button class="btn sm o" data-iedit="${x.id}">✏️</button><button class="btn sm o" data-idel="${x.id}">🗑️</button></div></div>`).join("") : '<div class="card mute">אין כאן רעיונות עדיין.</div>'}`;
  }


  // ---------- הודעות קבועות (פרטי! נשמר רק בתוסף במחשב, לא באתר) ----------
  const MCATS = ["מתעניינות", "לקוחות", "גנים וועדים", "ספקיות", "אחר"];
  let msgFilter = "all", msgEdit = null, msgQ = "";
  function msgs() { return LS.get("msgs", []); }
  function vMsgs() {
    const L = msgs(), ed = msgEdit ? L.find(x => x.id === msgEdit) : null;
    const opt = (arr, v) => arr.map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("");
    const q = msgQ.trim();
    const shown = L.filter(x => (msgFilter === "all" || x.cat === msgFilter) && (!q || (x.title + " " + x.text).includes(q))).sort((a, b) => (a.order || 99) - (b.order || 99));
    return `<h1>✉️ ההודעות הקבועות שלי</h1>
      <p class="mute">ההודעות שאת שולחת שוב ושוב: מחירים, אפשרויות העלאת תמונות, כתובת לאיסוף, אישור לפני הדפסה... 🔒 נשמרות רק כאן, בתוסף במחשב שלך – לא באתר ולא בשום מקום ציבורי.</p>
      <div class="row" style="margin:8px 0"><input id="mQ" value="${esc(msgQ)}" placeholder="🔎 חיפוש הודעה..." style="flex:1;min-width:180px;padding:8px 12px;border:1.5px solid var(--line);border-radius:10px">
        <label class="btn o sm">⬆️ ייבוא קובץ הודעות<input type="file" hidden accept=".json" id="mImp"></label></div>
      <div class="chan"><button class="btn sm ${msgFilter === "all" ? "" : "o"}" data-msgf="all">הכל (${L.length})</button>${MCATS.map(c => `<button class="btn sm ${msgFilter === c ? "" : "o"}" data-msgf="${esc(c)}">${esc(c)} (${L.filter(x => x.cat === c).length})</button>`).join("")}</div>
      ${shown.length ? shown.map(x => `<div class="card"><div class="row"><h3 style="margin:0;flex:1">${x.order ? `<span class="pill">${x.order}</span> ` : ""}${esc(x.title)}</h3><span class="pill">${esc(x.cat)}</span></div>
        <div class="txt">${esc(x.text)}</div>
        <div class="row">${cbtn(x.text, "📋 העתקה", "wa")}<a class="btn sm s" target="_blank" href="https://wa.me/?text=${encodeURIComponent(x.text)}">💬 פתיחה בוואטסאפ</a><button class="btn sm o" data-medit="${x.id}">✏️ עריכה</button><button class="btn sm o" data-mdel="${x.id}">🗑️</button></div></div>`).join("")
        : `<div class="card mute">${L.length ? "לא נמצאו הודעות." : "אין עדיין הודעות. הוסיפי למטה, או ייבאי קובץ הודעות."}</div>`}
      <div class="card" id="msgForm"><h3>${ed ? "✏️ עריכת הודעה" : "➕ הודעה חדשה"}</h3>
        <div class="row"><label class="inp" style="flex:3">שם ההודעה<input id="mTitle" value="${esc(ed ? ed.title : "")}" placeholder="למשל: הודעה 1 – מחירים"></label>
        <label class="inp" style="flex:1">סוג<select id="mCat">${opt(MCATS, ed ? ed.cat : "מתעניינות")}</select></label>
        <label class="inp" style="width:90px">מספר<input id="mOrder" type="number" min="1" value="${esc(ed ? ed.order || "" : "")}" placeholder="סדר"></label></div>
        <label class="inp">הטקסט<textarea id="mText" rows="7" style="width:100%;padding:8px 10px;border:1.5px solid var(--line);border-radius:10px">${esc(ed ? ed.text : "")}</textarea></label>
        <button class="btn" id="mSave">${ed ? "💾 שמירה" : "➕ להוסיף"}</button> ${ed ? '<button class="btn o" id="mCancel">ביטול</button>' : ""}</div>`;
  }


  // ---------- 📱 הדף שלי: פוסט ביום לפייסבוק + אינסטגרם ----------
  function igText(t, txt) {
    const lines = String(txt || "").split("\n").filter(l => !/\{LINK\}|\{GROUP\}|מספר סודי מקבוצת|https?:\/\//.test(l));
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n\n🔗 הקישור בביו" + (t.tags ? "\n\n" + t.tags : "");
  }
  function pageLink(t) { return link(t, "fb").replace("utm_source=facebook_group&utm_medium=post", "utm_source=facebook&utm_medium=page"); }
  async function vPage() {
    const P = KIT.page || [], today = todayISO();
    if (!P.length) return `<div class="card">אין עדיין תוכנית לדף.</div>`;
    const done = P.filter(x => isDone("page:" + x.date)).length;
    let h = `<h1>📱 הדף שלי – פוסט כל יום</h1>
      <p class="mute">פוסט אחד ביום בדף BOOQLI. ב-Meta Business Suite מעלים פעם אחת ומסמנים גם פייסבוק וגם אינסטגרם. אפשר לתזמן עד כחודש קדימה. סמני ✔️ כל פוסט שתזמנת.</p>
      <div class="flag">איך מתזמנים: business.facebook.com ← <b>Planner / מתכנן</b> ← <b>יצירת פוסט</b> ← מסמנים את הדף ואת האינסטגרם ← מעלים את הקובץ ← מדביקים טקסט (יש כפתור נפרד לאינסטגרם, בלי קישור) ← <b>תזמון</b> לתאריך ולשעה שכאן. ${done}/${P.length} תוזמנו.</div>
      <div class="flag art">🎬 = סרטון 4:5 · 🖼️ = תמונה 1:1 · 📸 = עוד אין קובץ: צלמי מסך של העמוד בטלפון (או בחרי סרטון אחר).</div>`;
    for (const x of P) {
      const t = topic(x.topic); if (!t) continue;
      const key = "page:" + x.date, d = isDone(key);
      const m = x.m === "shot" ? null : await mget(t.id + ":" + x.m);
      const ic = x.m === "video" ? "🎬" : x.m === "image" ? "🖼️" : "📸";
      let media;
      if (m) { const u = URL.createObjectURL(m.blob); media = `<a class="btn sm s" href="${u}" download="${esc(x.date + "-" + t.id + (x.m === "video" ? "-4x5" : "-1x1") + "-" + m.name)}">⬇️ ${ic} הורדת הקובץ</a>`; }
      else if (x.m === "shot") media = `<span class="pill w">📸 צילום מסך של העמוד</span> <a class="btn sm o" target="_blank" href="${esc(KIT.site + (t.path || ""))}">לפתוח את העמוד</a>`;
      else media = `<span class="pill p">${ic} חסר בתוסף</span> <button class="btn sm o" data-gotopic="${t.id}">להעלות</button>`;
      const fbTxt = fill(t.fbp || t.fb, t, "fb").split(link(t, "fb")).join(pageLink(t)).split(link(t, "fbp")).join(pageLink(t));
      h += `<div class="card" style="${x.date === today ? "border-color:var(--pinkd)" : ""}"><div class="task ${d ? "done" : ""}" style="border:0;padding:0"><input type="checkbox" data-done="${key}" ${d ? "checked" : ""} aria-label="תוזמן">
        <div class="body"><div class="row"><b class="what">${nice(x.date)} · ${x.t}</b><span>${t.ic} ${esc(t.name)}</span>${x.n ? `<span class="small mute">${esc(x.n)}</span>` : ""}</div>
        <div class="row" style="margin:6px 0">${media}${cbtn(fbTxt, "📘 טקסט לפייסבוק")}${cbtn(igText(t, t.fbp || t.fb), "📷 טקסט לאינסטגרם", "o")}${cbtn((t.headlines || [""])[0], "✨ כותרת", "o")}</div></div></div></div>`;
    }
    return h;
  }

  // ---------- 🗂️ מה עשינו: מפת השיחות (פרטי – מיובא מקובץ, נשמר רק כאן) ----------
  let chatQ = "";
  async function vChats() {
    const L = LS.get("chats", []);
    let h = `<h1>🗂️ מה עשינו – מפת השיחות</h1>
      <p class="mute">כל שיחה: מה עשינו בה, אילו קבצים יצאו ממנה, וכפתור שפותח אותה. הקבצים עצמם נמצאים בתוך השיחה – פותחים, לוחצים Ctrl+F ומקלידים את שם הקובץ. 🔒 נשמר רק בתוסף במחשב שלך.</p>
      <div class="row"><input id="cQ" value="${esc(chatQ)}" placeholder="🔎 חיפוש: נושא, קובץ, מילה..." style="flex:1;min-width:180px;padding:8px 12px;border:1.5px solid var(--line);border-radius:10px">
      <label class="btn sm ${L.length ? "o" : ""}">⬆️ ${L.length ? "לעדכן מקובץ" : "לטעון את קובץ השיחות"}<input type="file" hidden accept=".json" id="cImp"></label></div>`;
    if (!L.length) return h + `<div class="card">עוד לא נטען קובץ. טעני את הקובץ <b>booqli-chats.json</b> שקיבלת מ-Claude.</div>`;
    const q = chatQ.trim();
    const shown = L.filter(c => !q || JSON.stringify(c).includes(q));
    for (const c of shown) {
      const t = topic(c.topic);
      const files = (c.files || []).map((f, i) => { const k = "file:" + c.id + ":" + i, d = isDone(k);
        return `<label class="row small" style="gap:6px"><input type="checkbox" data-done="${k}" ${d ? "checked" : ""}><span style="${d ? "text-decoration:line-through;color:var(--mute)" : ""}">${esc(f)}</span></label>`; }).join("");
      h += `<div class="card"><div class="row"><span class="small mute">${esc(c.date)}</span><h3 style="margin:0;flex:1">${esc(c.title)}</h3>${t ? `<button class="btn sm o" data-gotopic="${t.id}">${t.ic} ${esc(t.name)}</button>` : ""}<a class="btn sm" target="_blank" href="${esc(c.url)}">לפתוח את השיחה ↗</a></div>
        <p style="margin:6px 0">${esc(c.did)}</p>${files ? `<div class="sec"><b class="small">📎 קבצים (סמני ✔️ כשהורדת ושמרת):</b>${files}</div>` : ""}</div>`;
    }
    return h;
  }

  async function render() {
    copyN = 0; for (const k in COPY) delete COPY[k];
    document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.v === (view === "day" ? "month" : view)));
    const m = $("#main");
    const html = view === "today" ? await vToday() : view === "day" ? await vDayDetail() : view === "month" ? vMonth() : view === "topics" ? await vTopics() : view === "site" ? await vSite() : view === "stats" ? await window.BQ_STATS.html() : view === "media" ? await window.BQ_MEDIA.html() : view === "ideas" ? vIdeas() : view === "page" ? await vPage() : view === "chats" ? await vChats() : view === "msgs" ? vMsgs() : view === "camps" ? vCamps() : view === "guide" ? vGuide() : vSettings();
    m.innerHTML = html;
    $("#sub").textContent = "booqli Games · " + nice(todayISO());
  }

  // ---------- אירועים ----------
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copy],[data-v],[data-topic],[data-gotopic],[data-day],[data-copyimg],[data-delmedia],#checkUpd,#exp,[data-sitef],#siteRefresh,[data-ideaf],[data-iedit],[data-idel],#iSave,#iCancel,[data-msgf],[data-medit],[data-mdel],#mSave,#mCancel");
    if (!b) return;
    if (b.dataset.sitef) { siteFilter = b.dataset.sitef; return render(); }
    if (b.id === "siteRefresh") { SITEDATA = null; return render().then(() => toast("רוענן ✔️")); }
    if (b.dataset.msgf) { msgFilter = b.dataset.msgf; return render(); }
    if (b.dataset.medit) { msgEdit = b.dataset.medit; return render().then(() => $("#msgForm").scrollIntoView({ behavior: "smooth" })); }
    if (b.id === "mCancel") { msgEdit = null; return render(); }
    if (b.dataset.mdel) { if (confirm("למחוק את ההודעה?")) { LS.set("msgs", msgs().filter(x => x.id !== b.dataset.mdel)); render(); } return; }
    if (b.id === "mSave") {
      const title = $("#mTitle").value.trim(), text = $("#mText").value.trim(); if (!title || !text) { toast("צריך שם וטקסט 🙂"); return; }
      const L = msgs(), o = { title, text, cat: $("#mCat").value, order: parseInt($("#mOrder").value, 10) || null };
      if (msgEdit) Object.assign(L.find(x => x.id === msgEdit), o); else L.push(Object.assign({ id: "m" + Date.now() }, o));
      LS.set("msgs", L); msgEdit = null; toast("נשמר ✔️"); return render();
    }
    if (b.dataset.ideaf) { ideaFilter = b.dataset.ideaf; return render(); }
    if (b.dataset.iedit) { ideaEdit = b.dataset.iedit; return render().then(() => $("#ideaForm").scrollIntoView({ behavior: "smooth" })); }
    if (b.id === "iCancel") { ideaEdit = null; return render(); }
    if (b.dataset.idel) { if (confirm("למחוק את הרעיון?")) { LS.set("ideas", ideas().filter(x => x.id !== b.dataset.idel)); render(); } return; }
    if (b.id === "iSave") {
      const title = $("#iTitle").value.trim(); if (!title) { toast("כתבי מה הרעיון 🙂"); return; }
      const L = ideas(), o = { title, cat: $("#iCat").value, status: $("#iStat").value, notes: $("#iNotes").value.trim() };
      if (ideaEdit) Object.assign(L.find(x => x.id === ideaEdit), o); else L.push(Object.assign({ id: "i" + Date.now(), date: todayISO() }, o));
      LS.set("ideas", L); ideaEdit = null; toast("נשמר ✔️"); return render();
    }
    if (b.dataset.copy) return copy(COPY[b.dataset.copy]);
    if (b.dataset.copyimg) return copyImage(b.dataset.copyimg);
    if (b.dataset.delmedia) { if (confirm("למחוק את הקובץ?")) mdel(b.dataset.delmedia).then(render); return; }
    if (b.dataset.v) { view = b.dataset.v; LS.set("view", view); }
    if (b.dataset.topic) selTopic = b.dataset.topic;
    if (b.dataset.gotopic) { selTopic = b.dataset.gotopic; view = "topics"; LS.set("view", view); }
    if (b.dataset.day) { selDay = b.dataset.day; view = "day"; }
    LS.set("topic", selTopic);
    if (b.id === "checkUpd") return update(true);
    if (b.id === "exp") {
      const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("bq_") && k !== "bq_kit_cache") o[k] = localStorage.getItem(k); }
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(o)], { type: "application/json" })); a.download = "booqli-marketing-backup-" + todayISO() + ".json"; a.click(); return;
    }
    render(); window.scrollTo(0, 0);
  });
  document.addEventListener("change", e => {
    const el = e.target;
    if (el.dataset.done) { setDone(el.dataset.done, el.checked); el.closest(".task").classList.toggle("done", el.checked); return; }
    if (el.dataset.upload) { const [tid, kind] = el.dataset.upload.split(":"); if (el.files[0]) saveMedia(tid, kind, el.files[0]); return; }
    if (el.dataset.group) { const [k, key] = el.dataset.group.split(":"), o = LS.get("groups", {}); (o[k] = o[k] || {})[key] = el.value.trim(); LS.set("groups", o); toast("נשמר ✔️"); return; }
    if (el.dataset.art) { const o = LS.get("articles", {}); o[el.dataset.art] = el.value.trim(); LS.set("articles", o); toast("נשמר ✔️"); return; }
    if (el.dataset.istat) { const L = ideas(), x = L.find(i => i.id === el.dataset.istat); x.status = el.value; LS.set("ideas", L); toast("נשמר ✔️"); return render(); }
    if (el.dataset.camp) { const o = LS.get("camps", {}); o[el.dataset.camp] = el.value; LS.set("camps", o); toast("נשמר ✔️"); render(); return; }
    if (el.id === "cImp" && el.files[0]) {
      el.files[0].text().then(t => { const d = JSON.parse(t), arr = Array.isArray(d) ? d : d.chats || []; if (!arr.length) throw 0; LS.set("chats", arr); toast("נטענו " + arr.length + " שיחות ✔️"); render(); }).catch(() => alert("הקובץ לא תקין"));
      return;
    }
    if (el.id === "mImp" && el.files[0]) {
      el.files[0].text().then(t => {
        const d = JSON.parse(t), arr = Array.isArray(d) ? d : d.messages || []; const L = msgs(); let n = 0;
        arr.forEach(x => { if (!x.title || !x.text) return; const ex = L.find(y => y.title === x.title); if (ex) Object.assign(ex, x, { id: ex.id }); else { L.push({ id: "m" + Date.now() + n, title: x.title, text: x.text, cat: MCATS.includes(x.cat) ? x.cat : "אחר", order: x.order || null }); } n++; });
        LS.set("msgs", L); toast("יובאו " + n + " הודעות ✔️"); render();
      }).catch(() => alert("הקובץ לא תקין"));
      return;
    }
    if (el.id === "imp" && el.files[0]) {
      el.files[0].text().then(s => { const o = JSON.parse(s); Object.keys(o).forEach(k => k.startsWith("bq_") && localStorage.setItem(k, o[k])); toast("הגיבוי נטען ✔️"); render(); }).catch(() => alert("הקובץ לא תקין"));
    }
  });

  document.addEventListener("input", e => { if (e.target.id === "cQ") { chatQ = e.target.value; const pos = e.target.selectionStart; render().then(() => { const i = $("#cQ"); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }); } });
  document.addEventListener("input", e => { if (e.target.id === "mQ") { msgQ = e.target.value; const pos = e.target.selectionStart; render().then(() => { const i = $("#mQ"); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }); } });
  async function update(manual) {
    try {
      const r = await fetch(UPDATE_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw 0;
      const n = await r.json();
      if (n && n.version && n.topics && n.plan && n.version > KIT.version) { KIT = n; LS.set("kit_cache", n); toast("התוכן עודכן לגרסה " + n.version + " ✨"); render(); }
      else if (manual) toast("יש לך את הגרסה האחרונה ✔️");
    } catch (e) { if (manual) toast("אין חיבור לעדכון כרגע – עובד עם מה שיש"); }
  }
  window.BQ_VIEW = () => view; window.BQ_TOPICS = () => KIT.topics; window.BQ_CBTN = (t, l) => cbtn(t, l);
  window.BQ_RENDER = render; window.BQ_TOAST = t => toast(t); window.KIT_TOPIC_NAME = id => { const t = topic(id); return t ? t.ic + " " + t.name : ""; };
  if (view === "day") view = "month";
  render();
  update(false);
  // ניקוי קבצים של נושאים שכבר לא קיימים – לא מוחקים כלום אוטומטית, רק סופרים
  mkeys().then(k => { window.__bqMediaCount = k.length; });
})();
