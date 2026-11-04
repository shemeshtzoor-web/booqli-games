/* =====================================================================
   זהירות בדרכים – איורים מקוריים (SVG) + משפחת BOOQLI
   כל הציורים מקוריים. הדמויות: img/family/*.webp + saba.svg
   RS.COLOR = false → קווים בלבד (לדפי צביעה)
   ===================================================================== */
(function(){
const RS = window.RS = {COLOR: true, base: "../../"};
const INK = RS.INK = "#3B2416";
const F = c => RS.COLOR ? c : "#fff";
const svg = RS.svg = (inner, vb, extra = "") => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ${extra}>${inner}</svg>`;

/* ---------- הדמויות ---------- */
// name: booqli garb hesh alef lev ona shomer saba · x,y = מרכז הרגליים · h = גובה
RS.ch = (name, x, y, h, o = {}) => {
  const w = h * (name === "saba" ? 1 : 319 / 330), file = RS.base + "img/family/" + name + (name === "saba" ? ".svg" : ".webp");
  const tr = o.flip ? ` transform="translate(${(2 * x).toFixed(1)} 0) scale(-1 1)"` : "";
  let g = `<image href="${file}" x="${(x - w / 2).toFixed(1)}" y="${(y - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
  if (o.helmet) g += RS.helmetOn(x, y, h);
  if (o.vest) g += RS.vestOn(x, y, h);
  return `<g${tr}>${g}</g>`;
};
// קסדה על הראש (עם חור לקרן 😊)
RS.helmetOn = (x, y, h, c = "#FF56C2") => {
  const s = h / 330, cx = x, cy = y - 290 * s;
  return `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M-112 26 Q-110 -58 -16 -64 L-12 -40 L12 -40 L16 -64 Q110 -58 112 26 Q0 6 -112 26Z" fill="${F(c)}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M-80 -14 Q-50 -44 -20 -48 M80 -14 Q50 -44 20 -48" fill="none" stroke="${F("#fff")}" stroke-width="9" stroke-linecap="round" opacity=".8"/><path d="M-96 22 Q-104 64 -82 86 M96 22 Q104 64 82 86" fill="none" stroke="${INK}" stroke-width="6"/></g>`;
};
// אפוד זוהר
RS.vestOn = (x, y, h) => {
  const s = h / 330;
  return `<g transform="translate(${x} ${y - 95 * s}) scale(${s})"><path d="M-70 -36 Q0 -10 70 -36 L76 22 Q0 44 -76 22Z" fill="${F("#D7F542")}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M-72 -6 Q0 16 72 -6" fill="none" stroke="${F("#C9CED6")}" stroke-width="10"/><path d="M-72 -6 Q0 16 72 -6" fill="none" stroke="${RS.COLOR ? "#fff" : INK}" stroke-width="${RS.COLOR ? 4 : 1.5}"/></g>`;
};

/* ---------- רחוב ---------- */
RS.sky = (W, H, night) => `<rect width="${W}" height="${H}" fill="${RS.COLOR ? (night ? "#2D3561" : "#DFF3FF") : "#fff"}"/>`;
RS.cloud = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-60 20 Q-78 20 -78 2 Q-78 -18 -56 -18 Q-52 -44 -24 -44 Q-2 -62 22 -42 Q52 -48 58 -18 Q80 -16 80 4 Q80 20 60 20Z" fill="${F("#fff")}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
RS.sun = (x, y, r = 26) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${F("#FFD23F")}" stroke="${INK}" stroke-width="3.5"/>${[0,1,2,3,4,5,6,7].map(i => { const a = i * Math.PI / 4; return `<path d="M${(x + (r + 8) * Math.cos(a)).toFixed(1)} ${(y + (r + 8) * Math.sin(a)).toFixed(1)} L${(x + (r + 18) * Math.cos(a)).toFixed(1)} ${(y + (r + 18) * Math.sin(a)).toFixed(1)}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`; }).join("")}</g>`;
RS.moon = (x, y) => `<path d="M${x} ${y - 26} A26 26 0 1 0 ${x + 22} ${y + 14} A20 20 0 1 1 ${x} ${y - 26}Z" fill="${F("#FFE89A")}" stroke="${INK}" stroke-width="3"/>`;
RS.tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="-60" width="18" height="60" fill="${F("#A9744F")}" stroke="${INK}" stroke-width="3.5"/><circle cx="0" cy="-92" r="44" fill="${F("#6CC77F")}" stroke="${INK}" stroke-width="4"/><circle cx="-26" cy="-70" r="24" fill="${F("#58B56C")}" stroke="${INK}" stroke-width="3.5"/><circle cx="26" cy="-72" r="24" fill="${F("#58B56C")}" stroke="${INK}" stroke-width="3.5"/></g>`;
RS.house = (x, y, s = 1, c = "#FFB86B") => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-50" y="-80" width="100" height="80" fill="${F(c)}" stroke="${INK}" stroke-width="4"/><path d="M-62 -78 L0 -128 L62 -78Z" fill="${F("#E5484D")}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="-14" y="-40" width="28" height="40" fill="${F("#8C6239")}" stroke="${INK}" stroke-width="3.5"/><rect x="-40" y="-64" width="20" height="20" fill="${F("#BDE6FF")}" stroke="${INK}" stroke-width="3"/><rect x="20" y="-64" width="20" height="20" fill="${F("#BDE6FF")}" stroke="${INK}" stroke-width="3"/></g>`;
// כביש אופקי עם מדרכות. y0 = שפת המדרכה העליונה. zebra = מיקום מעבר החצייה (x) או null
RS.road = (W, y0, zebra = null, o = {}) => {
  const sw = o.walk || 46, rd = o.road || 120;
  let g = `<rect x="0" y="${y0}" width="${W}" height="${sw}" fill="${F("#E8DCC8")}" stroke="${INK}" stroke-width="3"/>`;
  for (let x = 0; x < W; x += 60) g += `<path d="M${x} ${y0} V${y0 + sw}" stroke="${RS.COLOR ? "#CDBFA8" : INK}" stroke-width="2"/>`;
  g += `<rect x="0" y="${y0 + sw}" width="${W}" height="${rd}" fill="${F("#5C6370")}" stroke="${INK}" stroke-width="3"/>`;
  for (let x = 20; x < W; x += 80) if (zebra == null || Math.abs(x + 20 - zebra) > 70) g += `<rect x="${x}" y="${y0 + sw + rd / 2 - 4}" width="40" height="8" fill="${F("#FFE066")}" stroke="${RS.COLOR ? "none" : INK}" stroke-width="1.5"/>`;
  if (zebra != null) for (let k = 0; k < 6; k++) g += `<rect x="${zebra - 50}" y="${y0 + sw + 6 + k * (rd - 12) / 6}" width="100" height="${(rd - 12) / 12}" fill="${F("#fff")}" stroke="${RS.COLOR ? "none" : INK}" stroke-width="1.5"/>`;
  if (!o.noBottom) g += `<rect x="0" y="${y0 + sw + rd}" width="${W}" height="${sw}" fill="${F("#E8DCC8")}" stroke="${INK}" stroke-width="3"/>`;
  return g;
};
// רמזור להולכי רגל. state: red / green / off
RS.pedLight = (x, y, state = "red", s = 1) => {
  const on = (k, c) => RS.COLOR ? (state === k ? c : "#3A3F48") : "#fff";
  const man = (cy, walk, col) => walk
    ? `<g fill="${col}"><circle cx="2" cy="${cy - 18}" r="6"/><path d="M-2 ${cy - 10} L8 ${cy - 10} L10 ${cy + 4} L18 ${cy + 16} L12 ${cy + 19} L4 ${cy + 8} L-4 ${cy + 20} L-11 ${cy + 16} L-3 ${cy + 2} L-12 ${cy - 2} L-10 ${cy - 8}Z"/></g>`
    : `<g fill="${col}"><circle cx="0" cy="${cy - 18}" r="6"/><rect x="-7" y="${cy - 10}" width="14" height="18" rx="3"/><rect x="-6" y="${cy + 6}" width="5" height="14"/><rect x="1" y="${cy + 6}" width="5" height="14"/></g>`;
  const red = state === "red" || !RS.COLOR, green = state === "green" || !RS.COLOR;
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-130" width="10" height="130" fill="${F("#7A8290")}" stroke="${INK}" stroke-width="3"/>
    <rect x="-30" y="-250" width="60" height="124" rx="12" fill="${F("#2B2F36")}" stroke="${INK}" stroke-width="4"/>
    <rect x="-22" y="-242" width="44" height="52" rx="8" fill="${on("red", "#FF4D5E")}" stroke="${INK}" stroke-width="3"/>${man(-214, false, RS.COLOR ? (state === "red" ? "#fff" : "#55505A") : (red ? INK : INK))}
    <rect x="-22" y="-184" width="44" height="52" rx="8" fill="${on("green", "#2BD46A")}" stroke="${INK}" stroke-width="3"/>${man(-156, true, RS.COLOR ? (state === "green" ? "#fff" : "#55505A") : (green ? INK : INK))}
    ${RS.COLOR && state !== "off" ? `<circle cx="0" cy="${state === "red" ? -216 : -158}" r="34" fill="${state === "red" ? "#FF4D5E" : "#2BD46A"}" opacity=".18"/>` : ""}</g>`;
};
// רמזור לרכבים (3 אורות)
RS.carLight = (x, y, state = "red", s = 1) => {
  const c = (k, col) => RS.COLOR ? (state === k ? col : "#3A3F48") : "#fff";
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-110" width="10" height="110" fill="${F("#7A8290")}" stroke="${INK}" stroke-width="3"/><rect x="-24" y="-226" width="48" height="120" rx="12" fill="${F("#2B2F36")}" stroke="${INK}" stroke-width="4"/><circle cx="0" cy="-200" r="15" fill="${c("red", "#FF4D5E")}" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="-166" r="15" fill="${c("yellow", "#FFD23F")}" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="-132" r="15" fill="${c("green", "#2BD46A")}" stroke="${INK}" stroke-width="3"/></g>`;
};
// מכונית מהצד. dir = 1 נוסעת ימינה, -1 שמאלה
RS.car = (x, y, col = "#3AA7F0", s = 1, dir = 1, extra = "") => `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})" ${extra}>
  <path d="M-92 -18 Q-94 -46 -70 -48 L-44 -50 L-22 -84 Q-16 -92 -4 -92 L44 -92 Q56 -92 64 -82 L88 -50 Q100 -48 100 -30 L100 -16 Q100 -6 90 -6 L-84 -6 Q-92 -6 -92 -18Z" fill="${F(col)}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M-16 -54 L0 -82 L24 -82 L24 -54Z M32 -54 L32 -82 L52 -82 L74 -54Z" fill="${F("#CFEFFF")}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="-52" cy="-6" r="20" fill="${F("#2B2F36")}" stroke="${INK}" stroke-width="4"/><circle cx="-52" cy="-6" r="8" fill="${F("#C9CED6")}" stroke="${INK}" stroke-width="3"/>
  <circle cx="62" cy="-6" r="20" fill="${F("#2B2F36")}" stroke="${INK}" stroke-width="4"/><circle cx="62" cy="-6" r="8" fill="${F("#C9CED6")}" stroke="${INK}" stroke-width="3"/>
  <rect x="88" y="-40" width="12" height="9" rx="3" fill="${F("#FFE066")}" stroke="${INK}" stroke-width="2.5"/></g>`;
RS.ball = (x, y, r = 16) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${F("#FF56C2")}" stroke="${INK}" stroke-width="3.5"/><path d="M${x - r} ${y} Q${x} ${y - r * .6} ${x + r} ${y} M${x} ${y - r} Q${x + r * .5} ${y} ${x} ${y + r}" fill="none" stroke="${RS.COLOR ? "#fff" : INK}" stroke-width="3"/></g>`;
RS.bike = (x, y, s = 1, col = "#FF56C2") => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="-48" cy="-30" r="30" fill="${F("#fff")}"/><circle cx="48" cy="-30" r="30" fill="${F("#fff")}"/><circle cx="-48" cy="-30" r="5" fill="${INK}"/><circle cx="48" cy="-30" r="5" fill="${INK}"/>
  <path d="M-48 -30 L-10 -30 L20 -74 L-22 -74 Z M-10 -30 L-22 -74 M20 -74 L48 -30 M14 -88 L20 -74 M8 -90 H26" stroke="${F(col)}" stroke-width="7"/>
  <path d="M-48 -30 L-10 -30 L20 -74 L-22 -74 Z M-10 -30 L-22 -74 M20 -74 L48 -30" stroke="${INK}" stroke-width="2" opacity="${RS.COLOR ? 0 : 1}"/>
  <path d="M-32 -82 H-12" stroke-width="8"/></g>`;
RS.scooter = (x, y, s = 1, col = "#3AA7F0") => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="-60" y="-26" width="100" height="12" rx="6" fill="${F(col)}"/><path d="M36 -20 L52 -110 M38 -112 H66" fill="none" stroke-width="7"/><path d="M36 -20 L52 -110" fill="none" stroke="${F(col)}" stroke-width="3"/>
  <circle cx="-50" cy="-10" r="13" fill="${F("#2B2F36")}"/><circle cx="46" cy="-10" r="13" fill="${F("#2B2F36")}"/></g>`;
RS.helmet = (x, y, s = 1, c = "#FF56C2") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 10 Q-60 -54 0 -56 Q60 -54 60 10 Q0 -4 -60 10Z" fill="${F(c)}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M-36 -26 Q-20 -44 0 -46 M36 -26 Q20 -44 0 -46" fill="none" stroke="${RS.COLOR ? "#fff" : INK}" stroke-width="${RS.COLOR ? 7 : 2}" stroke-linecap="round" opacity=".85"/><path d="M-50 8 Q-56 38 -36 50 Q0 60 36 50 Q56 38 50 8" fill="none" stroke="${INK}" stroke-width="4"/><rect x="-10" y="44" width="20" height="10" rx="3" fill="${F("#2B2F36")}" stroke="${INK}" stroke-width="3"/></g>`;
RS.seat = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"><path d="M-40 0 V-100 Q-40 -126 -14 -126 H14 Q40 -126 40 -100 V0Z" fill="${F("#9B5DE5")}"/><path d="M-52 -40 Q-52 -60 -40 -62 V0 H-52Z M52 -40 Q52 -60 40 -62 V0 H52Z" fill="${F("#7C3FD0")}"/><path d="M-22 -96 L0 -40 L22 -96" fill="none" stroke="${F("#FFD23F")}" stroke-width="8"/><rect x="-10" y="-46" width="20" height="14" rx="3" fill="${F("#C9CED6")}"/></g>`;
RS.sign = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-96" width="8" height="96" fill="${F("#7A8290")}" stroke="${INK}" stroke-width="3"/><path d="M-36 -164 L36 -164 L36 -92 L-36 -92Z" fill="${F("#2F6FD6")}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-26 -102 L26 -102 L0 -154Z" fill="${F("#fff")}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><g transform="translate(0 -122) scale(.7)" fill="${INK}"><circle cx="2" cy="-18" r="6"/><path d="M-2 -10 L8 -10 L10 4 L18 16 L12 19 L4 8 L-4 20 L-11 16 L-3 2 L-12 -2 L-10 -8Z"/></g><path d="M-22 -100 h44" stroke="${INK}" stroke-width="3"/></g>`;
RS.slide = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M-40 0 V-110 M-10 0 V-110" fill="none"/><path d="M-40 -20 H-10 M-40 -50 H-10 M-40 -80 H-10" fill="none"/><rect x="-46" y="-118" width="42" height="12" rx="4" fill="${F("#FFD23F")}"/><path d="M-4 -112 Q30 -100 50 -40 Q60 -10 90 -4 L90 6 Q50 10 38 -34 Q24 -86 -4 -98Z" fill="${F("#FF9A2E")}"/></g>`;
RS.grass = (W, y, H) => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${F("#BFE6A8")}" stroke="${INK}" stroke-width="3"/>`;

/* ---------- עמודי הסיפור (640×480) ---------- */
const W = 640, H = 480;
RS.page = {
  // 1. יוצאים מהבית
  1: () => RS.sky(W, H) + RS.sun(560, 70) + RS.cloud(160, 70, .8) + RS.house(140, 330, 1.6) + RS.tree(560, 330, 1) + RS.grass(W, 330, H)
     + RS.ch("booqli", 300, 440, 150) + RS.ch("shomer", 430, 440, 160) + RS.ch("saba", 540, 440, 150),
  // 2. הולכים על המדרכה, רחוק מהכביש
  2: () => RS.sky(W, H) + RS.cloud(120, 60, .7) + RS.house(110, 200, 1) + RS.tree(320, 200, .9) + RS.house(520, 200, 1, "#9ED6FF") + RS.road(W, 200, null, {walk: 120, road: 160, noBottom: 1})
     + RS.car(150, 440, "#3AA7F0", 1, 1) + RS.ch("saba", 470, 312, 120) + RS.ch("garb", 380, 312, 100) + RS.ch("hesh", 300, 312, 100) + RS.ch("shomer", 210, 312, 110)
     + `<path d="M80 326 H600" stroke="${RS.COLOR ? "#FF56C2" : INK}" stroke-width="4" stroke-dasharray="10 10"/>`,
  // 3. יד ביד
  3: () => RS.sky(W, H) + RS.tree(90, 300, 1.1) + RS.tree(560, 300, 1) + RS.grass(W, 300, H)
     + RS.ch("saba", 250, 440, 230) + RS.ch("lev", 400, 440, 160)
     + `<path d="M312 360 Q336 344 352 356" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><g transform="translate(332 300)">${heart()}</g>`,
  // 4. עוצרים לפני הכביש
  4: () => RS.sky(W, H) + RS.cloud(500, 60, .7) + RS.tree(80, 170, .8) + RS.road(W, 170, 320, {walk: 70, road: 170})
     + RS.ch("shomer", 250, 240, 120) + RS.ch("alef", 330, 240, 95) + RS.ch("saba", 410, 240, 120)
     + `<g transform="translate(330 70)">${stopHand()}</g>` + RS.car(560, 360, "#FF9A2E", .9, -1),
  // 5. הרמזור – אדום עומדים, ירוק חוצים
  5: () => RS.sky(W, H) + RS.road(W, 300, 320, {walk: 60, road: 120, noBottom: 1}) + RS.pedLight(150, 300, "red", 1) + RS.pedLight(500, 300, "green", 1)
     + RS.ch("garb", 320, 300, 170) + `<text direction="rtl" x="150" y="40" text-anchor="middle" font-family="Fredoka,Assistant,sans-serif" font-size="30" font-weight="700" fill="${RS.COLOR ? "#E5484D" : INK}">עומדים</text><text direction="rtl" x="500" y="40" text-anchor="middle" font-family="Fredoka,Assistant,sans-serif" font-size="30" font-weight="700" fill="${RS.COLOR ? "#1F9E55" : INK}">חוצים יחד</text>`,
  // 6. מסתכלים לשני הצדדים
  6: () => RS.sky(W, H) + RS.road(W, 170, 320, {walk: 70, road: 170}) + RS.pedLight(612, 240, "green", .5)
     + RS.ch("hesh", 300, 240, 110) + RS.ch("saba", 370, 240, 120) + `<g font-size="44">${eyes(210, 120, -1)}${eyes(460, 120, 1)}</g>`
     + RS.car(90, 330, "#46C46E", .9, 1) + RS.car(560, 410, "#E5484D", .9, -1),
  // 7. ברכב: מושב בטיחות וחגורה
  7: () => RS.sky(W, H) + carInside(),
  // 8. אופניים וקורקינט עם קסדה
  8: () => RS.sky(W, H) + RS.sun(80, 70, 24) + RS.tree(560, 300, 1) + RS.grass(W, 300, H) + `<path d="M0 380 Q320 350 640 390 V430 Q320 400 0 420Z" fill="${F("#E8DCC8")}" stroke="${INK}" stroke-width="3"/>`
     + RS.bike(200, 430, 1.1) + RS.ch("alef", 196, 360, 130, {helmet: 1}) + RS.scooter(430, 440, 1, "#3AA7F0") + RS.ch("ona", 410, 425, 120, {helmet: 1}),
  // 9. בחושך – אפוד זוהר
  9: () => RS.sky(W, H, true) + RS.moon(540, 80) + stars() + RS.road(W, 300, null, {walk: 60, road: 120, noBottom: 1})
     + RS.ch("ona", 230, 300, 150, {vest: 1}) + RS.ch("shomer", 380, 300, 160, {vest: 1}) + RS.car(560, 410, "#FFD23F", .8, -1) + lightBeam(),
  // 10. הכדור התגלגל – קוראים למבוגר
  10: () => RS.sky(W, H) + RS.slide(520, 300, 1) + RS.tree(90, 300, 1) + RS.grass(W, 300, H - 110) + `<path d="M0 300 H640" stroke="${INK}" stroke-width="3"/>` + `<rect x="0" y="370" width="${W}" height="110" fill="${F("#5C6370")}" stroke="${INK}" stroke-width="3"/>`
     + `<rect x="0" y="352" width="${W}" height="18" fill="${F("#E8DCC8")}" stroke="${INK}" stroke-width="3"/>` + RS.ball(330, 420, 18)
     + RS.ch("booqli", 260, 340, 120) + RS.ch("saba", 400, 340, 130) + `<g transform="translate(262 196)">${bubble("סבא!")}</g>`,
  // 11. הגענו בשלום
  11: () => RS.sky(W, H) + RS.sun(560, 70) + RS.slide(520, 330, 1) + RS.tree(90, 330, 1.1) + RS.grass(W, 330, H)
     + ["garb", "hesh", "alef", "lev", "ona"].map((n, i) => RS.ch(n, 140 + i * 72, 450, 100)).join("") + RS.ch("shomer", 290, 360, 110) + RS.ch("booqli", 400, 360, 110) + confetti()
};
function heart(){ return `<path d="M0 12 C-30 -10 -18 -34 0 -20 C18 -34 30 -10 0 12Z" fill="${F("#FF56C2")}" stroke="${INK}" stroke-width="3"/>`; }
function stopHand(){ return `<circle r="44" fill="${F("#FF4D5E")}" stroke="${INK}" stroke-width="4"/><text direction="rtl" y="16" text-anchor="middle" font-size="46">✋</text>`; }
function eyes(x, y, dir){ return `<g transform="translate(${x} ${y})"><circle r="38" fill="${F("#fff")}" stroke="${INK}" stroke-width="3"/><text direction="rtl" y="14" text-anchor="middle" font-size="40">👀</text><path d="M${dir * 46} 0 l${dir * 22} 0 m${-dir * 10} -10 l${dir * 10} 10 l${-dir * 10} 10" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>`; }
function stars(){ return RS.COLOR ? [[60,50],[150,110],[260,40],[380,90],[440,30],[600,160],[90,180]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#FFF6B0"/>`).join("") : ""; }
function lightBeam(){ return RS.COLOR ? `<path d="M470 384 L250 330 L250 450 Z" fill="#FFF6B0" opacity=".25"/>` : ""; }
function bubble(t){ return `<path d="M-60 -30 H60 Q74 -30 74 -16 V14 Q74 28 60 28 H10 L-6 46 L-4 28 H-60 Q-74 28 -74 14 V-16 Q-74 -30 -60 -30Z" fill="${F("#fff")}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><text direction="rtl" y="10" text-anchor="middle" font-family="Fredoka,Assistant,sans-serif" font-size="28" font-weight="700" fill="${INK}">${t}</text>`; }
function confetti(){ return RS.COLOR ? Array.from({length: 26}, (_, i) => `<rect x="${(i * 97) % 620 + 10}" y="${(i * 53) % 220 + 10}" width="10" height="16" rx="2" fill="${["#FF56C2","#3AA7F0","#FFD23F","#46C46E","#9B5DE5"][i % 5]}" transform="rotate(${(i * 37) % 90} ${(i * 97) % 620 + 15} ${(i * 53) % 220 + 18})"/>`).join("") : ""; }
function carInside(){
  // מכונית גדולה בחתך, ובפנים מושב בטיחות עם חֶשְׁבּוּקְלִי וחגורה
  let g = `<rect y="400" width="${W}" height="80" fill="${F("#5C6370")}" stroke="${INK}" stroke-width="3"/>`;
  g += `<path d="M40 380 Q40 300 110 290 L200 280 L270 170 Q284 150 310 150 L470 150 Q500 150 516 172 L580 280 Q620 288 620 340 L620 380 Q620 400 600 400 L60 400 Q40 400 40 380Z" fill="${F("#3AA7F0")}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  g += `<path d="M230 280 L290 180 L380 180 L380 280Z M400 280 L400 180 L480 180 L550 280Z" fill="${F("#E9F8FF")}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  g += RS.seat(470, 372, .95) + RS.ch("hesh", 470, 340, 110);
  g += `<path d="M446 292 L494 332" stroke="${F("#2B2F36")}" stroke-width="8" stroke-linecap="round"/><path d="M446 292 L494 332" stroke="${RS.COLOR ? "#FFD23F" : INK}" stroke-width="2.5" stroke-linecap="round"/>`;
  g += RS.ch("saba", 320, 282, 104) + `<path d="M298 256 L338 280" stroke="${F("#2B2F36")}" stroke-width="7" stroke-linecap="round"/><circle cx="268" cy="250" r="20" fill="none" stroke="${INK}" stroke-width="6"/>`;
  g += `<circle cx="130" cy="400" r="40" fill="${F("#2B2F36")}" stroke="${INK}" stroke-width="5"/><circle cx="130" cy="400" r="15" fill="${F("#C9CED6")}" stroke="${INK}" stroke-width="3"/><circle cx="520" cy="400" r="40" fill="${F("#2B2F36")}" stroke="${INK}" stroke-width="5"/><circle cx="520" cy="400" r="15" fill="${F("#C9CED6")}" stroke="${INK}" stroke-width="3"/>`;
  g += `<g transform="translate(150 90)">${bubble("נחגרנו!")}</g>`;
  return g;
}

/* ---------- הפתיח ---------- */
RS.hero = () => svg(RS.sky(320, 300) + RS.cloud(70, 50, .5) + RS.road(320, 200, 160, {walk: 30, road: 70, noBottom: 1}) + RS.pedLight(268, 200, "green", .62)
  + RS.ch("shomer", 150, 214, 170) + `<g class="bob">${RS.ch("garb", 60, 210, 90)}</g>`, "0 0 320 300");

RS.W = W; RS.H = H;
})();
