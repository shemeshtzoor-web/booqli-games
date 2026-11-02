/* =========================================================
   איורים מקוריים לפסח – booqli Games
   מצה החתול (חתול אמיתי, מצויר לפי התמונות שלו), קרטונים, מצות, האפיקומן,
   קערת הסדר, שולחן הסדר, ודמויות סיפור יציאת מצרים.
   הכל מצויר בקוד (SVG), בלי תמונות מהאינטרנט.
   PS.color = false → קווים בלבד (לדפי צביעה)
   ========================================================= */
(function(){
const PS = window.PS = {color: true};
const O = "#3a2433";               // קו מתאר
const F = c => PS.color ? c : "#fff";
const L = c => PS.color ? c : O;   // צבע קו פנימי (פסים) – בדף צביעה שחור
const S = (w = 3) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const svg = PS.svg = (inner, vb = "0 0 400 300", extra = "") => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ${extra}>${inner}</svg>`;
const T = (x, y, s, g, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${g}</g>`;

/* ---------- מצה החתול ----------
   פרווה בז'־חומה עם פסים כהים (כמו מצה אפויה), M על המצח, עיניים ירוקות,
   אף ורוד, סנטר וחזה לבנים, זנב עם טבעות וקצה שחור. */
const FUR = "#C9A27A", STR = "#4A3626", EYE = "#A9C96A", NOSE = "#E8968A", EARIN = "#F4B3B8";
function catHead(o = {}){
  const f = o.face || "happy";
  let g = "";
  // אוזניים
  g += `<path d="M-23 -101 L-27 -134 L-4 -116Z" fill="${F(FUR)}" ${S(3)}/><path d="M23 -101 L27 -134 L4 -116Z" fill="${F(FUR)}" ${S(3)}/>`;
  g += `<path d="M-20 -106 L-23 -126 L-9 -115Z M20 -106 L23 -126 L9 -115Z" fill="${F(EARIN)}" stroke="none"/>`;
  // ראש
  g += `<ellipse cx="0" cy="-96" rx="27" ry="23" fill="${F(FUR)}" ${S(3)}/>`;
  // M על המצח + פסים בלחיים
  g += `<path d="M-9 -116 L-6 -105 M0 -119 V-107 M9 -116 L6 -105 M-27 -95 h9 M-26 -87 h8 M27 -95 h-9 M26 -87 h-8" fill="none" stroke="${L(STR)}" stroke-width="2.8" stroke-linecap="round"/>`;
  // לוע לבן
  g += `<ellipse cx="0" cy="-83" rx="13" ry="8.5" fill="#fff" stroke="none"/>`;
  // עיניים
  if (f === "sleepy") g += `<path d="M-16 -97 Q-10 -92 -4 -97 M4 -97 Q10 -92 16 -97" fill="none" ${S(2.6)}/>`;
  else {
    const big = f === "wow";
    g += `<ellipse cx="-10" cy="-97" rx="6.4" ry="6.8" fill="${F(EYE)}" ${S(2)}/><ellipse cx="10" cy="-97" rx="6.4" ry="6.8" fill="${F(EYE)}" ${S(2)}/>`;
    g += big ? `<circle cx="-10" cy="-97" r="3.6" fill="${O}"/><circle cx="10" cy="-97" r="3.6" fill="${O}"/>`
             : `<ellipse cx="-10" cy="-97" rx="1.9" ry="5" fill="${O}"/><ellipse cx="10" cy="-97" rx="1.9" ry="5" fill="${O}"/>`;
    g += `<circle cx="-8" cy="-99.5" r="1.6" fill="#fff"/><circle cx="12" cy="-99.5" r="1.6" fill="#fff"/>`;
    if (f === "think") g += `<path d="M-16 -106 L-5 -104 M16 -106 L5 -104" ${S(2.2)}/>`;
  }
  // אף ופה
  g += `<path d="M-4.5 -89 H4.5 L0 -84.5Z" fill="${F(NOSE)}" ${S(1.6)}/>`;
  if (!o.afi){
    if (f === "wow") g += `<ellipse cx="0" cy="-79" rx="3" ry="3.4" fill="${O}"/>`;
    else g += `<path d="M0 -84.5 v2 M0 -82.5 q-4 4 -7.5 1 M0 -82.5 q4 4 7.5 1" fill="none" ${S(1.8)}/>`;
  }
  // שפם
  g += `<path d="M-12 -84 L-36 -89 M-12 -81 L-36 -78 M12 -84 L36 -89 M12 -81 L36 -78" stroke="${PS.color ? "#7A6A5A" : O}" stroke-width="1.3" stroke-linecap="round"/>`;
  if (PS.color && f === "happy") g += `<circle cx="-17" cy="-88" r="3.4" fill="#FF8FB8" opacity=".45"/><circle cx="17" cy="-88" r="3.4" fill="#FF8FB8" opacity=".45"/>`;
  if (o.afi) g += PS.afi(0, -78, .42, -8);
  return g;
}
function tail(p, w = 1){
  return `<path d="${p}" fill="none" stroke="${O}" stroke-width="${15 * w}" stroke-linecap="round"/><path d="${p}" fill="none" stroke="${F(FUR)}" stroke-width="${9.5 * w}" stroke-linecap="round"/>` +
    `<path d="${p}" fill="none" stroke="${L(STR)}" stroke-width="${9.5 * w}" stroke-dasharray="4 9"/>`;
}
PS.tail = tail;
// x,y = הרגליים · s = גודל · o.pose: sit | sleep | peek | jump · o.face: happy | wow | think | sleepy · o.afi = אפיקומן בפה
PS.cat = function(x, y, s = 1, o = {}){
  const pose = o.pose || "sit";
  let g = "";
  if (pose === "peek"){
    // רק ראש וכפות – מציץ מתוך קרטון (שפת הקרטון בגובה 0)
    g += `<g transform="translate(0 70)">${catHead(o)}</g>`;
    g += `<ellipse cx="-15" cy="-2" rx="10" ry="6" fill="${F("#E8D2B4")}" ${S(2.6)}/><ellipse cx="15" cy="-2" rx="10" ry="6" fill="${F("#E8D2B4")}" ${S(2.6)}/>`;
    g += `<path d="M-19 -2 v4 M-14 -1 v4 M14 -1 v4 M19 -2 v4" ${S(1.4)}/>`;
    return T(x, y, s, g, o.flip);
  }
  if (pose === "sleep"){
    g += tail("M44 -14 Q60 -2 30 4 Q-10 8 -40 2", .9);
    g += `<ellipse cx="6" cy="-26" rx="50" ry="27" fill="${F(FUR)}" ${S(3)}/>`;
    g += `<path d="M-14 -50 q6 10 2 22 M2 -53 q6 12 2 26 M18 -52 q6 12 2 25 M34 -46 q5 10 1 20" fill="none" stroke="${L(STR)}" stroke-width="3.2" stroke-linecap="round"/>`;
    g += `<g transform="translate(-36 54) scale(.82)">${catHead(Object.assign({}, o, {face: "sleepy"}))}</g>`;
    if (PS.color) g += `<text x="12" y="-64" font-size="18" font-family="Fredoka,Arial" font-weight="700" fill="#6F988B">z z z</text>`;
    return T(x, y, s, g, o.flip);
  }
  // זנב
  g += pose === "jump" ? tail("M26 -40 Q66 -50 82 -24") : tail("M24 -10 Q62 -8 60 -42 Q58 -66 74 -74");
  g += pose === "jump" ? `<circle cx="82" cy="-24" r="5" fill="${F(STR)}" ${S(1.6)}/>` : `<circle cx="74" cy="-74" r="5" fill="${F(STR)}" ${S(1.6)}/>`;
  // גוף
  g += `<path d="M-30 -4 Q-40 -58 -16 -78 Q0 -84 16 -78 Q40 -58 30 -4Z" fill="${F(FUR)}" ${S(3)}/>`;
  g += `<path d="M-33 -22 q9 -2 12 4 M-35 -38 q10 -3 13 4 M-31 -54 q9 -3 11 3 M33 -22 q-9 -2 -12 4 M35 -38 q-10 -3 -13 4 M31 -54 q-9 -3 -11 3" fill="none" stroke="${L(STR)}" stroke-width="3.2" stroke-linecap="round"/>`;
  g += `<path d="M-11 -72 Q0 -62 11 -72 Q14 -42 0 -26 Q-14 -42 -11 -72Z" fill="#fff" stroke="none"/>`;
  // רגליים קדמיות
  const leg = lx => pose === "jump"
    ? `<path d="M${lx} -46 L${lx * 2.2} -20" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M${lx} -46 L${lx * 2.2} -20" stroke="${F(FUR)}" stroke-width="9" stroke-linecap="round"/>`
    : `<path d="M${lx} -40 V-6" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M${lx} -40 V-6" stroke="${F(FUR)}" stroke-width="9" stroke-linecap="round"/><path d="M${lx - 4} -28 h8 M${lx - 4} -18 h8" stroke="${L(STR)}" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="${lx}" cy="-4" rx="9" ry="5" fill="${F("#E8D2B4")}" ${S(2.4)}/>`;
  g += leg(-13) + leg(13);
  g += catHead(o);
  return T(x, y, s, g, o.flip);
};

/* ---------- קרטון ---------- x,y = התחתית באמצע · open = פתוח · label = כיתוב (למשל "מַצּוֹת") */
const BOX = "#D9A866", BOX2 = "#BF8B4A";
PS.boxBack = (open = false) => open
  ? `<path d="M-48 -96 L-40 -128 H64 L72 -96Z" fill="${F("#E6BE84")}" ${S(3)}/><path d="M-60 -80 L-48 -96 H72 L60 -80Z" fill="${F("#7A5226")}" ${S(3)}/>`
  : "";
PS.boxFront = (open = false, label = "") => {
  let g = `<path d="M60 -80 L72 -96 V-16 L60 0Z" fill="${F(BOX2)}" ${S(3)}/>`;
  g += `<rect x="-60" y="-80" width="120" height="80" fill="${F(BOX)}" ${S(3)}/>`;
  if (open) g += `<path d="M-60 -80 L-82 -64 L-74 -50 L-60 -62Z M60 -80 L80 -66 L74 -52 L60 -62Z" fill="${F("#E6BE84")}" ${S(2.6)}/>`;
  else g += `<path d="M-60 -80 L-48 -96 H72 L60 -80Z" fill="${F("#E6BE84")}" ${S(3)}/><path d="M0 -80 L12 -96" ${S(2)}/><path d="M-6 -80 L6 -96 H18 L6 -80Z" fill="${F("#F2DDB0")}" ${S(1.6)}/>`;
  if (label) g += `<rect x="-38" y="-58" width="76" height="30" rx="6" fill="${F("#FFF7E8")}" ${S(2)}/><text x="0" y="-36" text-anchor="middle" font-size="19" font-family="Fredoka,Assistant,Arial" font-weight="700" fill="${PS.color ? "#4C6FE0" : O}">${label}</text>`;
  else g += `<path d="M-40 -30 h18 M-40 -22 h12" stroke="${PS.color ? "#9C6E36" : O}" stroke-width="3" stroke-linecap="round"/>`;
  return g;
};
PS.box = (x, y, s = 1, o = {}) => T(x, y, s, PS.boxBack(o.open) + (o.inner || "") + PS.boxFront(o.open, o.label || ""));
// מצה מציץ מקרטון (עם או בלי אפיקומן)
PS.catInBox = (x, y, s = 1, o = {}) => T(x, y, s, PS.boxBack(true) + `<g transform="translate(6 -76)">${PS.cat(0, 0, .9, Object.assign({pose: "peek"}, o))}</g>` + PS.boxFront(true, o.label || ""));

/* ---------- מצה, אפיקומן ---------- */
PS.matza = (x, y, s = 1, rot = -6) => {
  let g = `<rect x="-30" y="-30" width="60" height="60" rx="7" fill="${F("#EAC98E")}" ${S(3)}/>`;
  for (let r = 0; r < 4; r++) g += `<path d="M-22 ${-18 + r * 12} H22" stroke="${PS.color ? "#B9894A" : O}" stroke-width="2.4" stroke-dasharray="1.5 5" stroke-linecap="round"/>`;
  if (PS.color) g += `<circle cx="-12" cy="-8" r="3.4" fill="#A86F35" opacity=".55"/><circle cx="14" cy="10" r="4" fill="#A86F35" opacity=".45"/><circle cx="6" cy="-20" r="2.6" fill="#A86F35" opacity=".5"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${g}</g>`;
};
PS.afi = (x, y, s = 1, rot = 0) => {
  let g = `<path d="M-26 -10 L14 -26 L22 4 L-18 18Z" fill="${F("#EAC98E")}" ${S(2.6)}/><path d="M-14 -6 L10 -16 M-10 4 L14 -6" stroke="${PS.color ? "#B9894A" : O}" stroke-width="2.2" stroke-dasharray="1.5 4.5" stroke-linecap="round"/>`;
  g += `<path d="M-34 -2 Q-36 -30 -8 -30 Q24 -32 36 -14 Q38 14 6 22 Q-30 30 -34 -2Z" fill="${F("#FFFFFF")}" ${S(3)}/>`;
  g += `<path d="M-24 -18 Q4 -8 30 -20 M-28 4 Q2 14 30 4" fill="none" stroke="${PS.color ? "#4C8FE0" : O}" stroke-width="3" stroke-linecap="round"/>`;
  g += `<path d="M14 -26 L22 -38 L28 -28Z" fill="${F("#EAC98E")}" ${S(2)}/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${g}</g>`;
};

/* ---------- קערת הסדר ומה שעליה ---------- */
const IT = {};
IT.zroa = () => `<path d="M-22 -2 Q-24 -16 -6 -16 Q10 -16 8 0 Q6 14 -10 12 Q-24 12 -22 -2Z" fill="${F("#B5652F")}" ${S(2.6)}/><path d="M6 -4 L22 -10" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M6 -4 L22 -10" stroke="${F("#FFF7E8")}" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="-14" r="5" fill="${F("#FFF7E8")}" ${S(2)}/><circle cx="26" cy="-6" r="5" fill="${F("#FFF7E8")}" ${S(2)}/>` + (PS.color ? `<path d="M-14 -8 q6 -3 10 2" fill="none" stroke="#8A4A1E" stroke-width="2"/>` : "");
IT.beitza = () => `<ellipse cx="0" cy="0" rx="15" ry="19" fill="${F("#E9D2AE")}" ${S(2.8)}/>` + (PS.color ? `<circle cx="-5" cy="-6" r="2.4" fill="#B98A55" opacity=".7"/><circle cx="5" cy="5" r="3" fill="#B98A55" opacity=".6"/><ellipse cx="-6" cy="-9" rx="3" ry="5" fill="#fff" opacity=".6"/>` : "");
IT.maror = () => [[-14, 4, -30], [0, -2, 0], [14, 4, 30]].map(([a, b, r]) => `<g transform="translate(${a} ${b}) rotate(${r})"><path d="M0 16 Q-14 -2 0 -22 Q14 -2 0 16Z" fill="${F("#6CC04A")}" ${S(2.4)}/><path d="M0 14 V-16" stroke="${PS.color ? "#3E8A2A" : O}" stroke-width="1.8"/></g>`).join("");
IT.charoset = () => `<path d="M-22 0 Q-22 16 0 16 Q22 16 22 0Z" fill="${F("#FFFFFF")}" ${S(2.6)}/><path d="M-18 0 Q-14 -16 0 -14 Q14 -16 18 0Z" fill="${F("#8A5326")}" ${S(2.4)}/>` + (PS.color ? `<circle cx="-6" cy="-6" r="2" fill="#C98A4E"/><circle cx="6" cy="-8" r="2" fill="#C98A4E"/><circle cx="1" cy="-3" r="2" fill="#5E3416"/>` : "") + `<path d="M-22 0 H22" ${S(2.6)}/>`;
IT.karpas = () => `<path d="M-14 18 Q-2 2 4 -10" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M-14 18 Q-2 2 4 -10" fill="none" stroke="${F("#8FD06A")}" stroke-width="4" stroke-linecap="round"/>` + [[4, -14], [-6, -16], [14, -8], [10, -22]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="7" fill="${F("#46A83A")}" ${S(2)}/>`).join("");
IT.chazeret = () => `<path d="M-6 -8 Q-16 6 -6 20 Q0 26 6 20 Q16 6 6 -8Z" fill="${F("#F3E7CF")}" ${S(2.6)}/><path d="M-6 4 h8 M-4 12 h7" stroke="${PS.color ? "#C8B48C" : O}" stroke-width="1.6"/><path d="M0 -8 Q-10 -20 -14 -26 M0 -8 Q2 -22 4 -28 M0 -8 Q10 -18 16 -22" fill="none" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M0 -8 Q-10 -20 -14 -26 M0 -8 Q2 -22 4 -28 M0 -8 Q10 -18 16 -22" fill="none" stroke="${F("#6CC04A")}" stroke-width="3" stroke-linecap="round"/>`;
PS.item = (k, x, y, s = 1) => T(x, y, s, IT[k]());
// המקומות על הקערה (לפי הסידור המקובל: זרוע למעלה מימין, ביצה למעלה משמאל, מרור באמצע, חרוסת וכרפס מתחתם, חזרת למטה)
PS.PLATE_POS = {zroa: [52, -58], beitza: [-52, -58], maror: [0, -10], charoset: [62, 30], karpas: [-62, 30], chazeret: [0, 62]};
PS.plate = (x, y, s = 1, o = {}) => {
  // o.show = רשימת פריטים שמונחים · o.ghost = לצייר צללית אפורה לפריטים שחסרים · o.names = שמות
  const show = o.show || Object.keys(PS.PLATE_POS);
  let g = `<circle r="122" fill="${F("#7CC4F2")}" ${S(3)}/><circle r="108" fill="${F("#FFFFFF")}" ${S(2.6)}/>`;
  if (PS.color) g += `<circle r="115" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3 7"/>`;
  Object.entries(PS.PLATE_POS).forEach(([k, [a, b]]) => {
    g += `<circle cx="${a}" cy="${b}" r="29" fill="${F("#F4FAF7")}" stroke="${PS.color ? "#CDE7DC" : O}" stroke-width="2"/>`;
    if (show.includes(k)) g += T(a, b, .95, IT[k]());
    else if (o.ghost) g += `<g opacity=".22" filter="url(#psGray)">${T(a, b, .95, IT[k]())}</g>`;
    if (o.names) g += `<text x="${a}" y="${b + 42}" text-anchor="middle" font-size="13" font-family="Assistant,Arial" font-weight="800" fill="${PS.color ? "#4E8576" : O}">${PS.NAMES[k]}</text>`;
  });
  const defs = o.ghost ? `<defs><filter id="psGray"><feColorMatrix type="saturate" values="0"/></filter></defs>` : "";
  return defs + T(x, y, s, g);
};
PS.NAMES = {zroa: "זרוע", beitza: "ביצה", maror: "מרור", charoset: "חרוסת", karpas: "כרפס", chazeret: "חזרת"};

/* ---------- עוד חפצים לשולחן ---------- */
PS.cup = (x, y, s = 1, full = true) => T(x, y, s, `<path d="M-16 -46 H16 Q16 -18 0 -16 Q-16 -18 -16 -46Z" fill="${F("#FFFFFF")}" ${S(2.6)}/>` + (full ? `<path d="M-14.5 -38 H14.5 Q13 -19 0 -18 Q-13 -19 -14.5 -38Z" fill="${F("#9B2C55")}" stroke="none"/>` : "") + `<path d="M0 -16 V-4 M-12 0 H12" ${S(3)}/>` + (PS.color ? `<path d="M-10 -42 q-2 8 2 14" fill="none" stroke="#fff" stroke-width="2.4" opacity=".7"/>` : ""));
PS.glass = (x, y, s = 1) => T(x, y, s, `<path d="M-13 -40 L13 -40 L10 0 H-10Z" fill="${F("#E6F4FF")}" ${S(2.6)}/><path d="M-12 -28 H12" stroke="${PS.color ? "#7CC4F2" : O}" stroke-width="2"/>`);
PS.bread = (x, y, s = 1) => T(x, y, s, `<path d="M-34 0 Q-38 -30 -10 -32 Q0 -40 12 -32 Q38 -30 34 0Z" fill="${F("#D99A4E")}" ${S(3)}/><path d="M-20 -16 q6 -6 12 0 M-2 -18 q6 -6 12 0 M14 -14 q5 -5 10 0" fill="none" stroke="${PS.color ? "#A8692A" : O}" stroke-width="2.4" stroke-linecap="round"/>`);
PS.dish = (x, y, s = 1) => T(x, y, s, `<ellipse cx="0" cy="0" rx="40" ry="13" fill="${F("#FFFFFF")}" ${S(2.8)}/><ellipse cx="0" cy="-1" rx="26" ry="7" fill="none" stroke="${PS.color ? "#CDE7DC" : O}" stroke-width="2"/>`);
PS.platePersp = (x, y, s = 1) => T(x, y, s, `<ellipse cx="0" cy="0" rx="48" ry="16" fill="${F("#7CC4F2")}" ${S(2.8)}/><ellipse cx="0" cy="-1" rx="40" ry="12" fill="${F("#FFFFFF")}" ${S(2)}/>` + T(-22, -10, .42, IT.zroa()) + T(0, -14, .42, IT.beitza()) + T(22, -10, .42, IT.karpas()) + T(-10, -2, .4, IT.maror()) + T(14, -2, .4, IT.charoset()));
PS.book = (x, y, s = 1, title = "הגדה") => T(x, y, s, `<path d="M-30 0 L-28 -36 Q-14 -40 0 -34 Q14 -40 28 -36 L30 0 Q14 -6 0 0 Q-14 -6 -30 0Z" fill="${F("#FFFFFF")}" ${S(2.6)}/><path d="M0 -34 V0" ${S(2)}/><path d="M-30 0 L-32 4 Q-14 -2 0 4 Q14 -2 32 4 L30 0" fill="${F("#C13671")}" ${S(2.2)}/><text x="-14" y="-16" text-anchor="middle" font-size="9" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#C13671" : O}">${title}</text><path d="M6 -24 h16 M6 -16 h14 M6 -8 h16" stroke="${PS.color ? "#B8A9B3" : O}" stroke-width="1.6"/>`);
PS.pillow = (x, y, s = 1) => T(x, y, s, `<path d="M-30 -6 Q-34 -24 -26 -28 Q0 -22 26 -28 Q34 -24 30 -6 Q34 8 26 10 Q0 6 -26 10 Q-34 8 -30 -6Z" fill="${F("#FF9FCF")}" ${S(2.6)}/>` + (PS.color ? `<circle cx="0" cy="-8" r="3" fill="#E0399F"/>` : ""));
PS.chair = (x, y, s = 1, pillow = false) => T(x, y, s, `<rect x="-24" y="-118" width="10" height="118" rx="3" fill="${F("#A86F35")}" ${S(2.6)}/><rect x="-28" y="-50" width="56" height="10" rx="3" fill="${F("#C98E62")}" ${S(2.6)}/><rect x="18" y="-40" width="8" height="40" rx="3" fill="${F("#A86F35")}" ${S(2.4)}/><path d="M-14 -110 H-4 M-14 -92 H-4" ${S(2)}/>` + (pillow ? PS.pillow(4, -56, .8) + PS.pillow(-10, -80, .55) : ""));
PS.yarn = (x, y, s = 1) => T(x, y, s, `<circle r="20" fill="${F("#FF56C2")}" ${S(2.8)}/><path d="M-16 -8 Q0 -20 16 -6 M-18 4 Q0 -8 18 8 M-10 16 Q2 4 14 16" fill="none" stroke="${PS.color ? "#C13671" : O}" stroke-width="2"/><path d="M18 10 Q34 20 26 30" fill="none" ${S(2.4)}/>`);
PS.sock = (x, y, s = 1) => T(x, y, s, `<path d="M-8 -26 H12 V2 Q14 14 2 16 H-18 Q-28 14 -24 4 Q-20 -4 -8 -4Z" fill="${F("#3AA7F0")}" ${S(2.8)}/><path d="M-8 -20 H12 M-8 -14 H12" stroke="${PS.color ? "#FFFFFF" : O}" stroke-width="3"/>`);
PS.fish = (x, y, s = 1) => T(x, y, s, `<path d="M-24 0 Q-6 -18 14 0 Q-6 18 -24 0Z" fill="${F("#FF9A2E")}" ${S(2.8)}/><path d="M14 0 L28 -12 V12Z" fill="${F("#FF9A2E")}" ${S(2.6)}/><circle cx="-14" cy="-3" r="2.4" fill="${O}"/>`);
PS.ball = (x, y, s = 1) => T(x, y, s, `<circle r="18" fill="${F("#FFD23F")}" ${S(2.8)}/><path d="M-18 0 H18 M0 -18 Q10 0 0 18" fill="none" stroke="${PS.color ? "#E09A00" : O}" stroke-width="2.4"/>`);
PS.heart = (x, y, s = 1, c = "#FF56C2") => T(x, y, s, `<path d="M0 10 Q-22 -6 -12 -16 Q-4 -22 0 -12 Q4 -22 12 -16 Q22 -6 0 10Z" fill="${F(c)}" ${S(2)}/>`);
PS.confetti = (n, w, h, seed = 3) => { if (!PS.color) return ""; let r = seed, out = ""; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280; const cols = ["#FF56C2", "#FFD23F", "#3AA7F0", "#46C46E", "#FF9A2E", "#9B5DE5"]; for (let i = 0; i < n; i++){ const x = rnd() * w, y = rnd() * h, c = cols[i % cols.length]; out += i % 2 ? `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(3 + rnd() * 4).toFixed(1)}" fill="${c}"/>` : `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="10" height="5" rx="2" fill="${c}" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; } return out; };
PS.frog = (x, y, s = 1) => T(x, y, s, `<ellipse cx="0" cy="-12" rx="20" ry="13" fill="${F("#58C44A")}" ${S(2.6)}/><circle cx="-9" cy="-24" r="7" fill="${F("#58C44A")}" ${S(2.4)}/><circle cx="9" cy="-24" r="7" fill="${F("#58C44A")}" ${S(2.4)}/><circle cx="-9" cy="-25" r="3" fill="${O}"/><circle cx="9" cy="-25" r="3" fill="${O}"/><path d="M-8 -10 Q0 -4 8 -10" fill="none" ${S(2)}/><path d="M-20 -4 Q-28 0 -22 2 M20 -4 Q28 0 22 2" fill="none" ${S(2.4)}/>`);
PS.sheep = (x, y, s = 1, flip) => T(x, y, s, `<path d="M-14 -6 V4 M10 -6 V4" ${S(4)}/>` + [[-16, -18], [-4, -24], [8, -22], [16, -14], [0, -12], [-12, -10], [10, -10]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="9" fill="${F("#FFFFFF")}" ${S(2.2)}/>`).join("") + `<ellipse cx="24" cy="-22" rx="7" ry="9" fill="${F("#5A4A44")}" ${S(2.2)}/><circle cx="26" cy="-24" r="1.6" fill="#fff"/>`, flip);

const SKIN = ["#F2C9A0", "#E3AD7F", "#C98E62"];
function person(o){
  const s = o.s || 1, sk = F(o.skin || SKIN[0]), robe = F(o.robe || "#6FB3E8"), trim = F(o.trim || "#F2B630");
  let g = "";
  // שיער ארוך מאחור
  if (o.long) g += `<path d="M-18 -98 Q-24 -60 -16 -48 H16 Q24 -60 18 -98Z" fill="${F(o.hair || "#3B2416")}" ${S(2.4)}/>`;
  // ידיים (מאחורי הגוף)
  const arm = (side) => {
    const k = side < 0 ? (o.armL || o.arms || "down") : (o.arms || "down");
    const sx = side * 16;
    let p;
    if (k === "up") p = `M${sx} -66 Q${sx + side * 16} -84 ${sx + side * 12} -104`;
    else if (k === "point" && side > 0) p = `M${sx} -66 Q${sx + 22} -70 ${sx + 38} -74`;
    else if (k === "hold") p = `M${sx} -66 Q${sx + side * 10} -50 ${sx - side * 6} -44`;
    else if (k === "wave" && side > 0) p = `M${sx} -66 Q${sx + 22} -76 ${sx + 20} -98`;
    else if (k === "pray") p = `M${sx} -66 Q${sx + side * 6} -54 ${side * 3} -60`;
    else p = `M${sx} -66 Q${sx + side * 8} -48 ${sx + side * 6} -34`;
    const end = p.trim().split(" ").slice(-2).map(Number);
    return `<path d="${p}" fill="none" stroke="${O}" stroke-width="13" stroke-linecap="round"/><path d="${p}" fill="none" stroke="${robe}" stroke-width="8.5" stroke-linecap="round"/><circle cx="${end[0]}" cy="${end[1]}" r="5" fill="${sk}" ${S(2)}/>`;
  };
  g += arm(-1);
  // רגליים
  g += `<path d="M-12 -4 h10 v4 h-12z M2 -4 h10 v4 h-10z" fill="${F("#6A4222")}" ${S(2)}/>`;
  // גלימה
  g += `<path d="M-17 -72 Q0 -78 17 -72 L27 -4 Q0 2 -27 -4Z" fill="${robe}" ${S(3)}/>`;
  g += `<path d="M-2 -74 V-2" stroke="${trim}" stroke-width="5"/><path d="M-22 -36 Q0 -32 22 -36" fill="none" stroke="${trim}" stroke-width="4"/>${PS.color ? "" : `<path d="M-2 -74 V-2 M-22 -36 Q0 -32 22 -36" fill="none" stroke="${O}" stroke-width="1.5"/>`}`;
  if (o.cape) g += `<path d="M-17 -72 L-30 -6 L-22 -4 Z M17 -72 L30 -6 L22 -4Z" fill="${F(o.cape)}" ${S(2.4)}/>`;
  g += arm(1);
  // צוואר וראש
  g += `<circle cx="0" cy="-90" r="17" fill="${sk}" ${S(3)}/>`;
  // שיער
  const hair = F(o.hair || "#3B2416");
  if (o.long) g += `<path d="M-17 -92 Q-16 -110 0 -110 Q16 -110 17 -92 Q8 -102 0 -100 Q-8 -102 -17 -92Z" fill="${hair}" ${S(2.4)}/>`;
  else if (o.hair !== "none") g += `<path d="M-16 -96 Q-12 -110 0 -109 Q12 -110 16 -96 Q8 -104 0 -103 Q-8 -104 -16 -96Z" fill="${hair}" ${S(2.4)}/>`;
  // זקן
  if (o.beard) g += `<path d="M-15 -88 Q-16 -64 0 -60 Q16 -64 15 -88 Q8 -78 0 -79 Q-8 -78 -15 -88Z" fill="${F(o.beard)}" ${S(2.4)}/>`;
  if (o.mustache) g += `<path d="M0 -84 Q-10 -88 -18 -80 Q-10 -84 0 -81 Q10 -84 18 -80 Q10 -88 0 -84Z" fill="${F(o.mustache)}" ${S(1.8)}/>`;
  // פנים
  const f = o.face || "happy";
  if (f === "angry") g += `<path d="M-11 -99 L-3 -95 M11 -99 L3 -95" ${S(2.6)}/>`;
  if (f === "worried" || f === "sad") g += `<path d="M-11 -96 L-4 -99 M11 -96 L4 -99" ${S(2.2)}/>`;
  if (f === "sleepy") g += `<path d="M-10 -92 Q-6 -90 -2 -92 M2 -92 Q6 -90 10 -92" fill="none" ${S(2.2)}/>`;
  else g += `<circle cx="-6" cy="-92" r="${f === "wow" ? 3.2 : 2.6}" fill="${O}"/><circle cx="6" cy="-92" r="${f === "wow" ? 3.2 : 2.6}" fill="${O}"/>`;
  if (!o.beard){
    if (f === "happy") g += `<path d="M-6 -83 Q0 -78 6 -83" fill="none" ${S(2.2)}/>`;
    else if (f === "wow") g += `<ellipse cx="0" cy="-81" rx="3" ry="3.6" fill="${O}"/>`;
    else g += `<path d="M-6 -80 Q0 -84 6 -80" fill="none" ${S(2.2)}/>`;
    if (PS.color && f === "happy") g += `<circle cx="-11" cy="-85" r="3.2" fill="#FF8FB8" opacity=".6"/><circle cx="11" cy="-85" r="3.2" fill="#FF8FB8" opacity=".6"/>`;
  } else if (f === "wow") g += `<ellipse cx="0" cy="-78" rx="3" ry="3.4" fill="${O}"/>`;
  // כובעים
  if (o.hat === "crown") g += `<path d="M-15 -104 L-17 -122 L-8 -112 L0 -126 L8 -112 L17 -122 L15 -104Z" fill="${F("#FFD23F")}" ${S(2.4)}/><circle cx="0" cy="-126" r="2.6" fill="${F("#FF4D5E")}" ${S(1.4)}/>`;
  if (o.hat === "tiara") g += `<path d="M-13 -106 L-10 -116 L-4 -110 L0 -120 L4 -110 L10 -116 L13 -106Z" fill="${F("#FFD23F")}" ${S(2.2)}/><circle cx="0" cy="-120" r="2.6" fill="${F("#3AA7F0")}" ${S(1.4)}/>`;
  if (o.hat === "turban") g += `<path d="M-18 -98 Q-20 -118 0 -120 Q20 -118 18 -98 Q0 -104 -18 -98Z" fill="${F(o.turban || "#FFFFFF")}" ${S(2.6)}/><path d="M-16 -108 Q0 -100 16 -110" fill="none" ${S(1.8)}/>`;
  if (o.hat === "haman") g += `<path d="M-26 -100 L0 -132 L26 -100 Q0 -108 -26 -100Z" fill="${F("#3E2A57")}" ${S(2.6)}/><path d="M-26 -100 L-30 -96 M26 -100 L30 -96" ${S(2.6)}/><circle cx="0" cy="-132" r="3" fill="${F("#F2B630")}" ${S(1.4)}/>`;
  // אביזרים
  if (o.prop === "scepter") g += `<path d="M22 -50 L58 -86" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M22 -50 L58 -86" stroke="${F("#FFD23F")}" stroke-width="3.6" stroke-linecap="round"/><circle cx="60" cy="-88" r="7" fill="${F("#FFD23F")}" ${S(2.4)}/>`;
  // תוספות לפסח: כתר פרעה, מטה, תוף, לבנים, צרור
  const W = (d, c, w = 7) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${F(c)}" stroke-width="${w * .5}" stroke-linecap="round"/>`;
  if (o.hat === "pharaoh") g += `<path d="M-20 -96 Q-22 -120 0 -121 Q22 -120 20 -96 L28 -62 H17 L14 -90 Q0 -97 -14 -90 L-17 -62 H-28Z" fill="${F("#FFD23F")}" ${S(2.6)}/><path d="M-24 -78 H-15 M-22 -70 H-16 M24 -78 H15 M22 -70 H16 M-12 -112 Q0 -116 12 -112" fill="none" stroke="${PS.color ? "#3AA7F0" : O}" stroke-width="3.4"/>`;
  if (o.prop === "staff") g += W("M26 -124 V2 M26 -124 Q38 -132 30 -142", "#8A5326");
  if (o.prop === "staffUp") g += W("M28 -160 V-50 M28 -160 Q40 -168 32 -178", "#8A5326");
  if (o.prop === "tof") g += `<circle cx="30" cy="-116" r="15" fill="${F("#FFD23F")}" ${S(2.6)}/><circle cx="30" cy="-116" r="10" fill="${F("#FFF7E8")}" ${S(1.6)}/>` + [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${(30 + Math.cos(i) * 15).toFixed(1)}" cy="${(-116 + Math.sin(i) * 15).toFixed(1)}" r="2.2" fill="${F("#C13671")}"/>`).join("");
  if (o.prop === "brick") g += `<rect x="-14" y="-56" width="28" height="13" rx="2" fill="${F("#C9733E")}" ${S(2.2)}/>`;
  if (o.prop === "brickUp") g += `<rect x="-30" y="-124" width="60" height="15" rx="2" fill="${F("#C9733E")}" ${S(2.4)}/><path d="M-10 -124 V-109 M10 -124 V-109" ${S(1.6)}/>`;
  if (o.prop === "bundle") g += `<circle cx="-26" cy="-70" r="15" fill="${F("#E6BE84")}" ${S(2.6)}/><path d="M-26 -84 l-6 -8 M-26 -84 l6 -8" ${S(2.2)}/>`;
  if (o.prop === "matzaUp") g += PS.matza(0, -126, .55, 4);
  const flip = o.flip ? " scale(-1 1)" : "";
  return `<g transform="translate(${o.x} ${o.y}) scale(${s})${flip}">${g}</g>`;
}
PS.person = person;

/* ---------- רקעים ---------- */
const room = (wall = "#FFF1DE") => `<rect width="400" height="300" fill="${F(wall)}"/><rect y="226" width="400" height="74" fill="${F("#E9C99A")}"/><path d="M0 226 H400" ${S(3)}/>` + (PS.color ? [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 56} 226 L${i * 56 - 30} 300" stroke="#D6B07A" stroke-width="2"/>`).join("") : "");
const table = (x1 = 40, x2 = 360, y = 180) => `<path d="M${x1} ${y} H${x2} V${y + 18} H${x1}Z" fill="${F("#FFFFFF")}" ${S(3)}/><path d="M${x1} ${y + 18} Q${x1 + 10} ${y + 30} ${x1 + 20} ${y + 18} M${x2} ${y + 18} Q${x2 - 10} ${y + 30} ${x2 - 20} ${y + 18}" fill="${F("#FFFFFF")}" ${S(2.4)}/>` + (PS.color ? `<path d="M${x1 + 4} ${y + 9} H${x2 - 4}" stroke="#7CC4F2" stroke-width="3" stroke-dasharray="10 6"/>` : "") + `<path d="M${x1 + 26} ${y + 18} V226 M${x2 - 26} ${y + 18} V226" ${S(6)}/>`;
const shelf = (x, y, w = 110) => `<rect x="${x}" y="${y}" width="${w}" height="10" rx="3" fill="${F("#D9A866")}" ${S(2.6)}/><path d="M${x + 8} ${y + 10} V226 M${x + w - 8} ${y + 10} V226" ${S(5)}/>`;
const desert = () => `<rect width="400" height="300" fill="${F("#FFE9B8")}"/>` + (PS.color ? `<circle cx="340" cy="56" r="28" fill="#FFD23F"/>` : `<circle cx="340" cy="56" r="28" fill="#fff" ${S(2.4)}/>`) + `<path d="M0 230 Q100 214 200 226 Q300 238 400 222 V300 H0Z" fill="${F("#F2CF8E")}" ${S(3)}/>`;
const pyramids = () => `<path d="M30 230 L110 120 L190 230Z" fill="${F("#E8B866")}" ${S(3)}/><path d="M110 120 L130 230" ${S(2)}/><path d="M150 230 L210 150 L270 230Z" fill="${F("#DDAA58")}" ${S(3)}/><path d="M210 150 L224 230" ${S(2)}/>`;
const river = (y = 236) => `<path d="M0 ${y} Q100 ${y - 12} 200 ${y} Q300 ${y + 12} 400 ${y} V300 H0Z" fill="${F("#7CC4F2")}" ${S(3)}/>` + (PS.color ? `<path d="M30 ${y + 24} q10 -6 20 0 M150 ${y + 36} q10 -6 20 0 M290 ${y + 22} q10 -6 20 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>` : "");
const reeds = (x, n = 5) => Array.from({length: n}, (_, i) => `<path d="M${x + i * 9} 250 Q${x + i * 9 - 4} 200 ${x + i * 9 + 2} 168" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M${x + i * 9} 250 Q${x + i * 9 - 4} 200 ${x + i * 9 + 2} 168" fill="none" stroke="${F("#6CC04A")}" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="${x + i * 9 + 2}" cy="${166 + (i % 2) * 8}" rx="3.4" ry="9" fill="${F("#8A5326")}" ${S(1.6)}/>`).join("");
const teva = (x, y, s = 1, baby = true) => T(x, y, s, `<path d="M-40 -16 Q-42 6 0 8 Q42 6 40 -16Z" fill="${F("#D99A4E")}" ${S(3)}/><path d="M-36 -10 H36 M-38 -2 H38" stroke="${PS.color ? "#A8692A" : O}" stroke-width="2"/>` + (baby ? `<path d="M-22 -16 Q-20 -30 2 -30 Q22 -30 24 -16Z" fill="${F("#FFFFFF")}" ${S(2.4)}/><circle cx="-14" cy="-24" r="10" fill="${F(SKIN[1])}" ${S(2.4)}/><path d="M-18 -24 q2 2 4 0 M-12 -24 q2 2 4 0" fill="none" ${S(1.6)}/>` : ""));
const bush = (x, y) => `<path d="M${x - 34} ${y} Q${x - 40} ${y - 30} ${x - 16} ${y - 36} Q${x - 10} ${y - 56} ${x + 10} ${y - 44} Q${x + 34} ${y - 50} ${x + 34} ${y - 22} Q${x + 44} ${y - 4} ${x + 30} ${y}Z" fill="${F("#6CC04A")}" ${S(3)}/>` +
  `<path d="M${x - 20} ${y - 30} Q${x - 26} ${y - 58} ${x - 10} ${y - 70} Q${x - 8} ${y - 54} ${x} ${y - 52} Q${x + 2} ${y - 80} ${x + 16} ${y - 90} Q${x + 14} ${y - 66} ${x + 24} ${y - 58} Q${x + 30} ${y - 70} ${x + 28} ${y - 82} Q${x + 44} ${y - 56} ${x + 26} ${y - 30}Z" fill="${F("#FF9A2E")}" ${S(2.6)}/>` +
  (PS.color ? `<path d="M${x - 6} ${y - 38} Q${x - 8} ${y - 54} ${x + 4} ${y - 62} Q${x + 6} ${y - 50} ${x + 12} ${y - 46} Q${x + 18} ${y - 54} ${x + 18} ${y - 62} Q${x + 26} ${y - 48} ${x + 16} ${y - 36}Z" fill="#FFD23F"/>` : "");
const throne = x => `<rect x="${x - 34}" y="110" width="68" height="110" rx="10" fill="${F("#FFD23F")}" ${S(3)}/><rect x="${x - 40}" y="176" width="80" height="16" rx="5" fill="${F("#3AA7F0")}" ${S(2.6)}/>`;
const seaWall = (x, w, dir) => `<path d="M${x} 300 V${110} Q${x + dir * w * .5} ${80} ${x + dir * w} ${100} V300Z" fill="${F("#3AA7F0")}" ${S(3)}/>` + (PS.color ? `<path d="M${x + dir * 8} 140 q${dir * 10} -8 ${dir * 20} 0 M${x + dir * 12} 190 q${dir * 10} -8 ${dir * 20} 0 M${x + dir * 6} 240 q${dir * 10} -8 ${dir * 20} 0" fill="none" stroke="#DCEBFF" stroke-width="3" stroke-linecap="round"/>` : "");
const bricks = (x, y) => [0, 1, 2].map(r => [0, 1, 2 - r].slice(0, 3 - r).map(c => `<rect x="${x + c * 24 + r * 12}" y="${y - r * 13}" width="22" height="12" rx="2" fill="${F("#C9733E")}" ${S(2)}/>`).join("")).join("");
// דמויות קבועות
const PHARAOH = o => person(Object.assign({robe: "#FFFFFF", trim: "#FFD23F", cape: "#3AA7F0", hair: "none", hat: "pharaoh", face: "angry", skin: SKIN[2]}, o));
const MOSHE = o => person(Object.assign({robe: "#C98E62", trim: "#FFFFFF", beard: "#7A4A26", hair: "#7A4A26", prop: "staff", skin: SKIN[1]}, o));
const AHARON = o => person(Object.assign({robe: "#6F988B", trim: "#FFD23F", beard: "#B8B0A8", hair: "none", hat: "turban", skin: SKIN[0]}, o));
const PRINCESS = o => person(Object.assign({robe: "#FF9FCF", trim: "#FFD23F", long: true, hair: "#1E1430", hat: "tiara", skin: SKIN[2]}, o));
const FOLK = (i, o) => person(Object.assign({robe: ["#FF9A2E", "#46C46E", "#FF56C2", "#3AA7F0", "#9B5DE5"][i % 5], trim: "#FFFFFF", hair: ["#3B2416", "#7A4A26", "#1E1430"][i % 3], skin: SKIN[i % 3], long: i % 2 === 1}, o));

/* ---------- 11 עמודי סיפור יציאת מצרים ---------- */
const EXODUS = [
  () => desert() + pyramids() + FOLK(0, {x: 290, y: 250, s: 1, face: "happy"}) + FOLK(1, {x: 340, y: 254, s: .9, face: "happy", arms: "wave"}) + PS.sheep(240, 258, .9),
  () => desert() + pyramids() + bricks(250, 236) + FOLK(2, {x: 220, y: 256, s: 1, face: "sad", arms: "hold", prop: "brick"}) + FOLK(3, {x: 330, y: 256, s: 1, face: "sad", arms: "up", prop: "brickUp"}) + PHARAOH({x: 70, y: 256, s: .9, arms: "point", flip: false}),
  () => `<rect width="400" height="300" fill="${F("#DFF3FF")}"/>` + river(220) + reeds(40, 6) + reeds(300, 5) + teva(200, 252, 1.15) + person({x: 352, y: 216, s: .8, robe: "#9B5DE5", trim: "#FFFFFF", long: true, hair: "#3B2416", skin: SKIN[1], face: "worried", arms: "pray", flip: true}),
  () => `<rect width="400" height="300" fill="${F("#DFF3FF")}"/>` + river(220) + reeds(330, 5) + teva(180, 256, 1.1) + PRINCESS({x: 250, y: 236, s: 1.1, arms: "hold", face: "wow"}) + person({x: 90, y: 230, s: .85, robe: "#FFFFFF", trim: "#FF9FCF", long: true, hair: "#3B2416", skin: SKIN[2], face: "happy"}),
  () => desert() + bush(110, 230) + MOSHE({x: 260, y: 250, s: 1.15, face: "wow", arms: "point", flip: true}) + PS.sheep(340, 262, .85) + PS.sheep(300, 270, .7, true),
  () => `<rect width="400" height="300" fill="${F("#FFE9C4")}"/><rect y="220" width="400" height="80" fill="${F("#F2D7A8")}"/><path d="M0 220 H400" ${S(3)}/>` + throne(90) + PHARAOH({x: 90, y: 214, s: 1.05, arms: "down", face: "angry"}) + MOSHE({x: 250, y: 252, s: 1.1, arms: "point", flip: true, face: "happy"}) + AHARON({x: 330, y: 252, s: 1, flip: true, face: "happy"}) + `<path d="M160 60 h150 a14 14 0 0 1 14 14 v36 a14 14 0 0 1 -14 14 h-40 l-14 18 v-18 h-96 a14 14 0 0 1 -14 -14 v-36 a14 14 0 0 1 14 -14z" fill="#fff" ${S(2.6)}/><text x="236" y="100" text-anchor="middle" font-size="24" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#C13671" : O}">שַׁלַּח אֶת עַמִּי!</text>`,
  () => room("#E6F7E2") + `<rect x="250" y="150" width="110" height="60" rx="10" fill="${F("#FFFFFF")}" ${S(3)}/><rect x="250" y="140" width="110" height="20" rx="8" fill="${F("#FF9FCF")}" ${S(2.6)}/>` + [[60, 260, 1.2], [140, 286, 1], [200, 250, 1.1], [300, 140, .9], [330, 205, .8], [280, 280, 1.2], [360, 270, .9], [100, 180, .8], [190, 120, .7]].map(([a, b, c]) => PS.frog(a, b, c)).join("") + `<text x="70" y="70" font-size="38" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#3E8A2A" : O}">קְוָא! קְוָא!</text>`,
  () => desert() + pyramids() + FOLK(0, {x: 250, y: 256, s: .95, arms: "hold", prop: "bundle", face: "happy", flip: true}) + FOLK(2, {x: 310, y: 258, s: 1, arms: "up", prop: "matzaUp", face: "happy", flip: true}) + FOLK(4, {x: 368, y: 254, s: .8, arms: "hold", prop: "bundle", face: "happy", flip: true}) + PS.sheep(200, 266, .8, true),
  () => `<rect width="400" height="300" fill="${F("#DFF3FF")}"/><path d="M0 300 V230 H400 V300Z" fill="${F("#F2CF8E")}" ${S(3)}/>` + seaWall(0, 130, 1) + seaWall(400, 130, -1) + MOSHE({x: 200, y: 262, s: 1.1, arms: "up", prop: "staffUp", face: "happy"}) + FOLK(1, {x: 160, y: 276, s: .8, face: "wow"}) + FOLK(3, {x: 245, y: 278, s: .8, face: "happy", flip: true}),
  () => `<rect width="400" height="300" fill="${F("#FFE3F4")}"/>` + PS.confetti(34, 400, 160, 6) + `<path d="M0 236 Q200 222 400 236 V300 H0Z" fill="${F("#F2CF8E")}" ${S(3)}/>` + person({x: 200, y: 252, s: 1.2, robe: "#9B5DE5", trim: "#FFD23F", long: true, hair: "#3B2416", skin: SKIN[1], face: "happy", arms: "up", prop: "tof"}) + FOLK(2, {x: 100, y: 256, s: .95, arms: "up", face: "happy"}) + FOLK(4, {x: 300, y: 256, s: .95, arms: "wave", face: "happy", flip: true}),
  () => room("#FFF6D6") + table(30, 370, 176) + PS.platePersp(200, 172, 1.2) + PS.matza(110, 162, .65, -4) + PS.cup(290, 176, 1) + PS.book(340, 176, .9) + PS.cat(60, 236, .75, {face: "happy"}) + `<text x="200" y="70" text-anchor="middle" font-size="34" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#C13671" : O}">חַג פֶּסַח שָׂמֵחַ!</text>`
];
PS.exodus = i => svg(EXODUS[i](), "0 0 400 300", 'preserveAspectRatio="xMidYMid slice"');
PS.exodusCount = EXODUS.length;

/* ---------- 9 עמודים מצוירים לסיפור של מצה (העמוד ה-10 הוא התמונה האמיתית) ---------- */
const STAR = (x, y) => `<path d="M${x} ${y - 14} L${x + 4} ${y - 4} L${x + 14} ${y - 4} L${x + 6} ${y + 3} L${x + 9} ${y + 14} L${x} ${y + 7} L${x - 9} ${y + 14} L${x - 6} ${y + 3} L${x - 14} ${y - 4} L${x - 4} ${y - 4}Z" fill="${F("#FFD23F")}" ${S(2)}/>`;
const MATZA = [
  () => room("#FFF6D6") + PS.catInBox(200, 250, 1.25, {label: "מַצּוֹת", face: "wow"}) + STAR(80, 90) + STAR(320, 80) + `<rect x="120" y="22" width="160" height="40" rx="20" fill="${F("#FF56C2")}" ${S(2.4)}/><text x="200" y="50" text-anchor="middle" font-size="22" font-family="Fredoka,Arial" font-weight="700" fill="#fff">סיפור אמיתי!</text>`,
  () => room() + table(40, 360, 186) + PS.matza(120, 160, 1.1, -8) + PS.matza(175, 168, .8, 10) + PS.cat(280, 182, .9, {face: "happy"}) + `<text x="200" y="80" text-anchor="middle" font-size="28" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#A8692A" : O}">אותם צבעים!</text>`,
  () => room("#EAF6EF") + shelf(220, 150, 140) + PS.cat(290, 152, .95, {face: "happy"}) + shelf(40, 190, 110) + PS.box(95, 190, .5, {}) + PS.ball(60, 212, .7),
  () => room("#FFF6D6") + table(30, 370, 176) + PS.platePersp(220, 172, 1.1) + PS.cup(310, 176, .9) + PS.afi(110, 160, 1.1, -6) + PS.matza(160, 166, .55, 8) + `<text x="200" y="74" text-anchor="middle" font-size="26" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#4C8FE0" : O}">זֶה הָאֲפִיקוֹמָן!</text>`,
  () => room("#FFF6D6") + table(30, 370, 186) + PS.platePersp(280, 182, 1) + PS.cat(160, 166, 1, {pose: "jump", afi: true, face: "happy"}) + `<text x="320" y="80" text-anchor="middle" font-size="34" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#C13671" : O}">מִיָאוּ!</text>` + `<path d="M60 120 q-14 -10 -26 0 M70 140 q-16 -8 -30 4" fill="none" ${S(2.4)}/>`,
  () => room() + table(20, 220, 186) + `<path d="M300 20 Q290 120 310 226 H380 V20Z" fill="${F("#9B5DE5")}" ${S(3)}/>` + shelf(250, 120, 120).replace("V226", "V150") + PS.pillow(300, 112, .9) + `<text x="120" y="120" text-anchor="middle" font-size="56" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#C13671" : O}">?</text><text x="345" y="80" text-anchor="middle" font-size="40" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#C13671" : O}">?</text><text x="200" y="270" text-anchor="middle" font-size="40" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#C13671" : O}">?</text>`,
  () => room("#F4EEE6") + PS.box(90, 250, .95, {}) + PS.box(210, 250, .95, {label: "מַצּוֹת"}) + PS.box(330, 250, .95, {}) + `<text x="200" y="80" text-anchor="middle" font-size="30" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#4E8576" : O}">רִשְׁרוּשׁ... רִשְׁרוּשׁ...</text>`,
  () => room("#F4EEE6") + PS.box(80, 250, .8, {}) + PS.catInBox(210, 256, 1.2, {label: "מַצּוֹת", afi: true}) + PS.box(340, 250, .8, {}) + STAR(110, 90) + STAR(300, 70),
  () => `<rect width="400" height="300" fill="${F("#FFE3F4")}"/>` + PS.confetti(40, 400, 300, 9) + PS.pillow(200, 250, 2.2) + PS.cat(200, 236, 1.05, {face: "happy"}) + PS.heart(90, 110, 1.2) + PS.heart(320, 100, 1, "#C13671") + `<text x="200" y="60" text-anchor="middle" font-size="32" font-family="Fredoka,Arial" font-weight="700" fill="${PS.color ? "#C13671" : O}">חַג פֶּסַח שָׂמֵחַ!</text>`
];
PS.matzaStory = i => svg(MATZA[i](), "0 0 400 300", 'preserveAspectRatio="xMidYMid slice"');
PS.matzaCount = MATZA.length;

/* ---------- "מה נשתנה?" – שולחן רגיל מול שולחן הסדר ---------- */
PS.diffTable = seder => {
  let g = `<rect width="400" height="260" fill="${F(seder ? "#FFF6D6" : "#F4EEE6")}"/><rect y="214" width="400" height="46" fill="${F("#E9C99A")}"/><path d="M0 214 H400" ${S(3)}/>`;
  g += `<path d="M20 170 H340 V188 H20Z" fill="${F("#FFFFFF")}" ${S(3)}/><path d="M46 188 V214 M314 188 V214" ${S(6)}/>`;
  if (PS.color) g += `<path d="M24 179 H336" stroke="${seder ? "#C13671" : "#7CC4F2"}" stroke-width="3" stroke-dasharray="10 6"/>`;
  g += PS.chair(370, 214, .85, seder);
  g += seder ? PS.matza(110, 150, .62, -4) + PS.matza(116, 144, .62, 6) : PS.bread(110, 166, .95);
  g += seder ? PS.plate(200, 140, .3, {}) : PS.dish(200, 164, 1);
  g += seder ? PS.cup(285, 170, 1) : PS.glass(285, 170, 1);
  if (seder) g += PS.book(56, 168, .85);
  return svg(g, "0 0 400 260");
};
PS.DIFFS = [
  {k: "bread", x: 112, y: 150, r: 36, n: "מצה במקום לחם", say: "בכל הלילות אוכלים לחם, והלילה – מצה!"},
  {k: "plate", x: 200, y: 148, r: 40, n: "קערת הסדר", say: "על השולחן יש קערת סדר, עם ששה דברים מיוחדים."},
  {k: "cup", x: 285, y: 148, r: 30, n: "כוס יין", say: "בליל הסדר שותים ארבע כוסות של יין, או מיץ ענבים."},
  {k: "pillow", x: 372, y: 160, r: 34, n: "כרית להסבה", say: "בליל הסדר מסבים – נשענים על כרית, כמו אנשים חופשיים."},
  {k: "book", x: 56, y: 152, r: 30, n: "ההגדה", say: "בליל הסדר קוראים בהגדה את סיפור יציאת מצרים."}
];

/* ---------- רקע לפתיח ---------- */
PS.hero = () => svg(`<rect width="260" height="240" rx="30" fill="${F("#FFF6D6")}"/>${PS.confetti(20, 260, 120, 5)}<rect y="196" width="260" height="44" fill="${F("#E1F0EA")}"/><path d="M0 196 H260" ${S(3)}/>` + PS.catInBox(130, 214, 1.15, {label: "מַצּוֹת", afi: true}) + PS.matza(40, 70, .6, -10) + PS.matza(220, 60, .5, 12), "0 0 260 240");
})();
