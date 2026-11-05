/* =========================================================
   איורים מקוריים לסיפור המכבים – booqli Games
   כל איור הוא SVG בגודל 400x300, מצויר בקוד (בלי תמונות מהאינטרנט).
   ========================================================= */
(function(){
const OUT = "#3a2433";
const SK = ["#F2C9A0", "#E3AD7F", "#C98E62", "#F6D3B3"];

/* ---------- דמות ----------
   x,y = נקודת הרגליים, s = גודל
   robe/belt = צבע הגלימה והחגורה, hair/beard = צבע שיער וזקן (או null)
   hat: null | "priest" | "crown" | "helmet" | "kippah" | "scarf"
   face: "happy" | "sad" | "stern" | "wow"
   arms: "down" | "up" | "hold" | "point" | "wave"
   prop: null | "broom" | "hammer" | "jug" | "banner" | "bucket" | "spear" | "scroll" | "stone" | "candle" */
function person(o){
  const s = o.s || 1, sk = o.skin || SK[0], robe = o.robe || "#6FB3E8", belt = o.belt || "#F2B630";
  const st = `stroke="${OUT}" stroke-width="${2.2/s}" stroke-linejoin="round" stroke-linecap="round"`;
  let g = `<g transform="translate(${o.x} ${o.y}) scale(${s})">`;
  // רגליים
  g += `<rect x="-11" y="-14" width="8" height="14" rx="3" fill="${sk}" ${st}/><rect x="3" y="-14" width="8" height="14" rx="3" fill="${sk}" ${st}/>`;
  g += `<path d="M-14 0 h12 v3 h-12z M2 0 h12 v3 h-12z" fill="#8a5a17" ${st}/>`;
  // ידיים (מאחורי הגוף כשמורמות)
  const arm = (side, kind) => {
    const sx = side * 15;
    const ends = {down:[side*20,-34], up:[side*24,-92], hold:[side*22,-50], point:[side*36,-66], wave:[side*28,-86]};
    const [ex, ey] = ends[kind] || ends.down;
    return `<path d="M${sx} -68 Q${sx + side*8} ${(ey - 68)/2} ${ex} ${ey}" fill="none" stroke="${OUT}" stroke-width="${11/s > 11 ? 11 : 11}" stroke-linecap="round"/>` +
           `<path d="M${sx} -68 Q${sx + side*8} ${(ey - 68)/2} ${ex} ${ey}" fill="none" stroke="${robe}" stroke-width="7" stroke-linecap="round"/>` +
           `<circle cx="${ex}" cy="${ey}" r="5" fill="${sk}" ${st}/>`;
  };
  const armL = o.armL || o.arms || "down", armR = o.armR || o.arms || "down";
  // גלימה
  g += `<path d="M-15 -72 Q0 -80 15 -72 L22 -12 Q0 -6 -22 -12 Z" fill="${robe}" ${st}/>`;
  g += `<path d="M-18 -40 Q0 -36 18 -40 L19 -34 Q0 -30 -19 -34Z" fill="${belt}" ${st}/>`;
  if (o.vest) g += `<path d="M-6 -76 L0 -40 L6 -76" fill="none" stroke="${o.vest}" stroke-width="4"/>`;
  g += arm(-1, armL) + arm(1, armR);
  // ראש
  g += `<rect x="-5" y="-82" width="10" height="8" fill="${sk}" ${st}/>`;
  g += `<circle cx="0" cy="-96" r="17" fill="${sk}" ${st}/>`;
  if (o.hair) g += `<path d="M-17 -98 Q-16 -116 0 -115 Q16 -116 17 -98 Q10 -106 0 -105 Q-10 -106 -17 -98Z" fill="${o.hair}" ${st}/>`;
  if (o.beard) g += `<path d="M-15 -94 Q-14 -72 0 -66 Q14 -72 15 -94 Q8 -84 0 -86 Q-8 -84 -15 -94Z" fill="${o.beard}" ${st}/>`;
  // פנים
  const f = o.face || "happy";
  const ey = f === "wow" ? 3.2 : 2.6;
  g += `<circle cx="-6" cy="-98" r="${ey}" fill="${OUT}"/><circle cx="6" cy="-98" r="${ey}" fill="${OUT}"/>`;
  if (!o.beard) g += `<circle cx="-10" cy="-91" r="3" fill="#FF8FB8" opacity=".55"/><circle cx="10" cy="-91" r="3" fill="#FF8FB8" opacity=".55"/>`;
  if (f === "stern") g += `<path d="M-10 -104 L-3 -102 M10 -104 L3 -102" stroke="${OUT}" stroke-width="2"/>`;
  const mouthY = o.beard ? -88 : -88;
  const m = {happy:`M-6 ${mouthY} Q0 ${mouthY+6} 6 ${mouthY}`, sad:`M-6 ${mouthY+4} Q0 ${mouthY-2} 6 ${mouthY+4}`, stern:`M-5 ${mouthY+2} L5 ${mouthY+2}`, wow:`M-3 ${mouthY+1} a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0`}[f];
  g += `<path d="${m}" fill="${f === "wow" ? OUT : "none"}" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>`;
  // כיסוי ראש
  const hats = {
    priest: `<path d="M-17 -104 Q-18 -126 0 -128 Q18 -126 17 -104 Z" fill="#fff" ${st}/><path d="M-17 -108 Q0 -114 17 -108 L17 -103 Q0 -109 -17 -103Z" fill="#F2B630" ${st}/>`,
    crown: `<path d="M-16 -108 L-16 -128 L-8 -118 L0 -132 L8 -118 L16 -128 L16 -108 Z" fill="#F2B630" ${st}/><circle cx="0" cy="-118" r="3" fill="#E5484D"/>`,
    helmet: `<path d="M-18 -98 Q-18 -122 0 -122 Q18 -122 18 -98 L12 -98 L12 -106 L-12 -106 L-12 -98Z" fill="#B7C0CC" ${st}/><path d="M-4 -122 Q0 -142 22 -136 Q8 -128 4 -122Z" fill="#E5484D" ${st}/>`,
    kippah: `<path d="M-9 -111 Q0 -118 9 -111Z" fill="${o.kippah || "#6FB3E8"}" ${st}/>`,
    scarf: `<path d="M-19 -94 Q-20 -120 0 -120 Q20 -120 19 -94 L15 -80 L15 -98 Q0 -110 -15 -98 L-15 -80Z" fill="${o.scarfColor || "#FF8A5C"}" ${st}/>`
  };
  if (o.hat) g += hats[o.hat];
  // חפצים ביד ימין (או בשתי ידיים)
  const R = ({down:[20,-34], up:[24,-92], hold:[22,-50], point:[36,-66], wave:[28,-86]})[armR];
  const props = {
    broom: `<line x1="${R[0]}" y1="${R[1]-30}" x2="${R[0]+6}" y2="${R[1]+34}" stroke="#8a5a17" stroke-width="4"/><path d="M${R[0]-4} ${R[1]+30} L${R[0]+18} ${R[1]+30} L${R[0]+22} ${R[1]+52} L${R[0]-8} ${R[1]+52}Z" fill="#F2C94C" ${st}/>`,
    hammer: `<line x1="${R[0]}" y1="${R[1]+14}" x2="${R[0]}" y2="${R[1]-26}" stroke="#8a5a17" stroke-width="5" stroke-linecap="round"/><rect x="${R[0]-14}" y="${R[1]-38}" width="28" height="14" rx="3" fill="#9AA5B1" ${st}/>`,
    jug: `<g transform="translate(${R[0]} ${R[1]-14})"><circle r="26" fill="#FFE680" opacity=".55"/><path d="M-9 -6 Q-15 6 -12 14 Q-6 22 0 22 Q6 22 12 14 Q15 6 9 -6Z" fill="#C9A15A" ${st}/><rect x="-5" y="-14" width="10" height="9" fill="#C9A15A" ${st}/><rect x="-7" y="-18" width="14" height="5" rx="2" fill="#A97A33" ${st}/><circle cx="0" cy="-16" r="3.5" fill="#E5484D" ${st}/></g>`,
    banner: `<line x1="${R[0]}" y1="${R[1]+20}" x2="${R[0]}" y2="${R[1]-60}" stroke="#8a5a17" stroke-width="4" stroke-linecap="round"/><path d="M${R[0]} ${R[1]-60} L${R[0]+44} ${R[1]-52} L${R[0]} ${R[1]-34}Z" fill="#6FB3E8" ${st}/>`,
    bucket: `<path d="M${R[0]-10} ${R[1]+2} L${R[0]+10} ${R[1]+2} L${R[0]+8} ${R[1]+22} L${R[0]-8} ${R[1]+22}Z" fill="#9AA5B1" ${st}/><path d="M${R[0]-10} ${R[1]+2} Q${R[0]} ${R[1]-12} ${R[0]+10} ${R[1]+2}" fill="none" stroke="${OUT}" stroke-width="2"/><path d="M${R[0]-8} ${R[1]+5} h16" stroke="#6FB3E8" stroke-width="3"/>`,
    spear: `<line x1="${R[0]}" y1="${R[1]+30}" x2="${R[0]}" y2="${R[1]-70}" stroke="#8a5a17" stroke-width="4"/><path d="M${R[0]-5} ${R[1]-68} L${R[0]} ${R[1]-84} L${R[0]+5} ${R[1]-68}Z" fill="#B7C0CC" ${st}/>`,
    scroll: `<g transform="translate(${R[0]+4} ${R[1]-8})"><rect x="-14" y="-10" width="28" height="22" fill="#FFF6D6" ${st}/><rect x="-17" y="-13" width="5" height="28" rx="2" fill="#C9A15A" ${st}/><rect x="12" y="-13" width="5" height="28" rx="2" fill="#C9A15A" ${st}/><path d="M-8 -3 h16 M-8 3 h12" stroke="${OUT}" stroke-width="1.5"/></g>`,
    stone: `<rect x="${R[0]-14}" y="${R[1]-10}" width="28" height="18" rx="3" fill="#E6D9C2" ${st}/>`,
    candle: `<g transform="translate(${R[0]} ${R[1]-10})"><rect x="-3" y="-8" width="6" height="16" fill="#fff" ${st}/><path d="M0 -24 q6 8 3 13 q-3 3 -6 0 q-3 -5 3 -13z" fill="#FFB020" ${st}/></g>`
  };
  if (o.prop) g += props[o.prop];
  return g + "</g>";
}

/* ---------- רקעים ופריטים ---------- */
const sky = (id, top, bottom) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="300" fill="url(#${id})"/>`;
const sun = (x, y, r = 22) => `<circle cx="${x}" cy="${y}" r="${r + 10}" fill="#FFE680" opacity=".4"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFD23F" stroke="${OUT}" stroke-width="2"/>`;
const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".95"><ellipse cx="0" cy="0" rx="22" ry="12"/><ellipse cx="16" cy="-6" rx="16" ry="12"/><ellipse cx="-16" cy="-3" rx="14" ry="10"/></g>`;
const hills = (c1 = "#9BCB8C", c2 = "#7FB070") => `<path d="M0 220 Q70 170 150 205 Q230 160 320 200 Q370 180 400 195 V300 H0Z" fill="${c1}"/><path d="M0 250 Q100 215 200 245 Q300 220 400 240 V300 H0Z" fill="${c2}"/>`;
const ground = (c = "#E9D8B4") => `<rect y="250" width="400" height="50" fill="${c}"/>`;
const stars = n => Array.from({length: n}, (_, i) => `<circle cx="${(i * 73) % 400}" cy="${(i * 41) % 150 + 8}" r="${i % 3 ? 1.4 : 2.2}" fill="#fff"/>`).join("");
const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-20" width="8" height="22" fill="#8a5a17" stroke="${OUT}" stroke-width="2"/><ellipse cx="0" cy="-36" rx="20" ry="22" fill="#6FAA5E" stroke="${OUT}" stroke-width="2"/><circle cx="-7" cy="-40" r="3" fill="#4E8A4C"/><circle cx="6" cy="-30" r="3" fill="#4E8A4C"/></g>`;
const house = (x, y, s = 1, c = "#F3E3C3") => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-26" y="-40" width="52" height="40" fill="${c}" stroke="${OUT}" stroke-width="2"/><rect x="-28" y="-46" width="56" height="7" fill="#D9C29A" stroke="${OUT}" stroke-width="2"/><rect x="-8" y="-24" width="14" height="24" rx="6" fill="#8a5a17" stroke="${OUT}" stroke-width="2"/><rect x="12" y="-32" width="9" height="9" fill="#6FB3E8" stroke="${OUT}" stroke-width="2"/></g>`;
/* מנורת המקדש – שבעה קנים */
function menorah7(x, y, s = 1, lit = true){
  let g = `<g transform="translate(${x} ${y}) scale(${s})" stroke="${OUT}" stroke-width="2" stroke-linejoin="round">`;
  g += `<path d="M-14 0 L14 0 L8 -8 L-8 -8Z" fill="#E0A82E"/><rect x="-3" y="-60" width="6" height="52" fill="#E0A82E"/>`;
  [12, 24, 36].forEach(r => g += `<path d="M${-r} -60 Q${-r} ${-60 + r * 1.1} 0 ${-60 + r * 1.1} Q${r} ${-60 + r * 1.1} ${r} -60" fill="none" stroke="${OUT}" stroke-width="7"/><path d="M${-r} -60 Q${-r} ${-60 + r * 1.1} 0 ${-60 + r * 1.1} Q${r} ${-60 + r * 1.1} ${r} -60" fill="none" stroke="#E0A82E" stroke-width="3.5"/>`);
  [-36, -24, -12, 0, 12, 24, 36].forEach(cx => {
    g += `<rect x="${cx - 4}" y="-66" width="8" height="6" rx="1" fill="#E0A82E"/>`;
    if (lit) g += `<path d="M${cx} -82 q6 8 3 13 q-3 3 -6 0 q-3 -5 3 -13z" fill="#FFB020"/><circle cx="${cx}" cy="-74" r="10" fill="#FFE680" opacity=".35" stroke="none"/>`;
  });
  return g + "</g>";
}
/* בית המקדש */
const temple = (x, y, s = 1, dirty = false) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${OUT}" stroke-width="2" stroke-linejoin="round">
  <rect x="-110" y="-30" width="220" height="30" fill="#EADBB8"/>
  <rect x="-60" y="-120" width="120" height="90" fill="#F6ECD3"/>
  <rect x="-66" y="-128" width="132" height="10" fill="#E2C98F"/>
  ${[-56,-44,-32,-20,-8,4,16,28,40,52].map(cx => `<rect x="${cx}" y="-136" width="7" height="8" fill="#E2C98F"/>`).join("")}
  <rect x="-24" y="-96" width="48" height="66" rx="22" fill="${dirty ? "#B8A98B" : "#FFF3C4"}"/>
  <path d="M-110 -30 L-90 -50 L-60 -50 L-60 -30 M110 -30 L90 -50 L60 -50 L60 -30" fill="#EADBB8"/>
  ${[-90,-70,70,90].map(cx => `<rect x="${cx - 4}" y="-28" width="8" height="28" fill="#F6ECD3"/>`).join("")}
</g>`;
/* מקדש יווני / ארמון */
const palace = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${OUT}" stroke-width="2" stroke-linejoin="round">
  <path d="M-120 -150 L0 -195 L120 -150Z" fill="#F4F1EA"/><rect x="-120" y="-150" width="240" height="12" fill="#E8E2D4"/>
  ${[-104,-68,-32,4,40,76].map(cx => `<rect x="${cx}" y="-138" width="22" height="128" fill="#FBF8F2"/><path d="M${cx + 6} -134 v120 M${cx + 12} -134 v120 M${cx + 17} -134 v120" stroke="#DCD4C2" stroke-width="1.5"/>`).join("")}
  <rect x="-130" y="-12" width="260" height="12" fill="#E8E2D4"/>
</g>`;
const statue = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${OUT}" stroke-width="2"><rect x="-14" y="-10" width="28" height="10" fill="#CFC8BA"/><path d="M-10 -10 L-8 -50 L8 -50 L10 -10Z" fill="#E3DED3"/><circle cx="0" cy="-60" r="11" fill="#E3DED3"/></g>`;
const altarStones = (x, y) => `<g transform="translate(${x} ${y})" stroke="${OUT}" stroke-width="2">${[[0,0],[30,0],[60,0],[15,-18],[45,-18],[30,-36]].map(([a,b]) => `<rect x="${a}" y="${b - 18}" width="30" height="18" rx="2" fill="#EADBB8"/>`).join("")}</g>`;
function elephant(x, y, s = 1){
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round">
    ${[-40,-22,18,36].map(lx => `<rect x="${lx}" y="-36" width="16" height="36" rx="5" fill="#9AA5B1"/>`).join("")}
    <ellipse cx="0" cy="-54" rx="58" ry="36" fill="#AEB8C4"/>
    <path d="M-44 -78 L44 -78 L40 -40 L-40 -40Z" fill="#E5484D"/><path d="M-44 -78 L44 -78" stroke="#F2B630" stroke-width="5"/>
    <circle cx="62" cy="-66" r="26" fill="#AEB8C4"/>
    <path d="M78 -56 Q96 -36 88 -6 Q84 2 80 -4 Q86 -32 72 -48Z" fill="#AEB8C4"/>
    <path d="M50 -84 Q30 -96 36 -60 Q44 -50 54 -56Z" fill="#9AA5B1"/>
    <path d="M76 -50 Q90 -46 92 -36" fill="none" stroke="#FFF6E8" stroke-width="5"/>
    <circle cx="70" cy="-72" r="3" fill="${OUT}"/>
  </g>`;
}
const hanukkiahSmall = (x, y, s, n) => {
  const xs = [-42,-30,-18,-6,6,18,30,42];
  let g = `<g transform="translate(${x} ${y}) scale(${s})" stroke="${OUT}" stroke-width="2"><rect x="-16" y="-6" width="32" height="6" rx="3" fill="#E0A82E"/><rect x="-3" y="-30" width="6" height="26" fill="#E0A82E"/><rect x="-48" y="-34" width="96" height="6" rx="3" fill="#E0A82E"/><rect x="-3" y="-50" width="6" height="18" fill="#E0A82E"/>`;
  const cols = ["#FA57C4","#6FB3E8","#8CC5B9","#F5C518","#B488E8","#FF8A5C","#6FB3E8","#FA57C4"];
  [...xs].reverse().slice(0, n).forEach((cx, i) => g += `<rect x="${cx - 3}" y="-48" width="6" height="14" fill="${cols[i]}"/><path d="M${cx} -62 q5 7 2.5 11 q-2.5 2.5 -5 0 q-2.5 -4 2.5 -11z" fill="#FFB020"/>`);
  g += `<rect x="-3" y="-64" width="6" height="14" fill="#fff"/><path d="M0 -78 q5 7 2.5 11 q-2.5 2.5 -5 0 q-2.5 -4 2.5 -11z" fill="#FFB020"/>`;
  return g + "</g>";
};
const wrap = body => `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img">${body}</svg>`;

/* ---------- 11 הסצנות ---------- */
const SCENES = [
  // 1. בית המקדש והמנורה
  () => wrap(sky("g1", "#9FD3F5", "#E8F6FF") + sun(340, 50) + cloud(80, 50) + cloud(230, 35, .8) + hills("#BFE0A8", "#A7D08F") +
    temple(200, 262, 1) + menorah7(200, 248, .55) + tree(40, 262, .9) + tree(365, 262, .9) + ground("#E9D8B4").replace('y="250"', 'y="262"') +
    person({x:105, y:290, s:.45, robe:"#6FB3E8", hair:"#5A3A22", hat:"kippah", arms:"wave"}) + person({x:300, y:290, s:.45, robe:"#FF8A5C", skin:SK[1], hair:"#213330", hat:"scarf", face:"happy"})),
  // 2. המלך אנטיוכוס
  () => wrap(sky("g2", "#C7B8F0", "#F3EEFF") + palace(200, 250, 1) + `<rect y="250" width="400" height="50" fill="#D8CDB8"/><path d="M110 250 L290 250 L270 300 L130 300Z" fill="#C5309A" opacity=".85"/>` +
    person({x:200, y:268, s:1.1, robe:"#8E5BD9", belt:"#F2B630", hair:"#213330", beard:"#213330", hat:"crown", face:"stern", armR:"point", vest:"#F2B630"}) +
    person({x:92, y:275, s:.7, robe:"#B7C0CC", belt:"#8a5a17", hat:"helmet", face:"stern", prop:"spear", armR:"hold"}) +
    person({x:310, y:275, s:.7, robe:"#B7C0CC", belt:"#8a5a17", hat:"helmet", face:"stern", prop:"spear", armR:"hold", skin:SK[1]})),
  // 3. הגזרות – בית מקדש מלוכלך ויהודים עצובים
  () => wrap(sky("g3", "#B9C3D1", "#E4E8EE") + cloud(90, 45) + cloud(300, 60, 1.1) + hills("#B9C9A8", "#A6B994") + temple(200, 250, .95, true) +
    statue(200, 248, .9) + `<path d="M120 255 l14 -6 l6 10z M262 256 l12 -8 l8 9z" fill="#8a7a5c" stroke="${OUT}" stroke-width="2"/>` + ground("#D8CBB0") +
    person({x:80, y:292, s:.75, robe:"#6FB3E8", hair:"#5A3A22", hat:"kippah", face:"sad"}) +
    person({x:320, y:292, s:.75, robe:"#8CC5B9", hat:"scarf", scarfColor:"#B488E8", face:"sad", skin:SK[1]}) +
    person({x:355, y:292, s:.5, robe:"#FFD23F", hair:"#213330", face:"sad"})),
  // 4. מודיעין – מתתיהו וחמשת בניו
  () => wrap(sky("g4", "#FFD9A8", "#FFF4E0") + sun(330, 70, 26) + hills("#C8DDA0", "#B0CE88") + house(60, 240, .9) + house(345, 238, .8, "#F6E7CB") + tree(110, 245) + ground("#EBD9B0") +
    person({x:200, y:282, s:1.05, robe:"#fff", belt:"#6FB3E8", beard:"#F4F4F4", hair:"#F4F4F4", hat:"priest", face:"happy", armR:"up"}) +
    [[110,"#6FB3E8","#5A3A22"],[145,"#FF8A5C","#213330"],[255,"#8CC5B9","#5A3A22"],[290,"#B488E8","#213330"],[325,"#FA57C4","#8a5a17"]]
      .map(([x, c, h], i) => person({x, y:290, s:.66, robe:c, hair:h, beard:i % 2 ? h : null, hat:"kippah", kippah:"#fff", skin:SK[i % 3], arms: i === 2 ? "wave" : "down"})).join("")),
  // 5. יוצאים להרים – יהודה מוביל
  () => wrap(sky("g5", "#A8DCF0", "#EAF8FF") + cloud(300, 40) + `<path d="M0 200 L70 110 L130 170 L200 90 L280 175 L340 120 L400 170 V300 H0Z" fill="#B7A68A" stroke="${OUT}" stroke-width="2"/><path d="M180 112 L200 90 L220 112 Q200 104 180 112Z" fill="#fff"/>` +
    `<path d="M0 240 Q200 200 400 230 V300 H0Z" fill="#C9D9A0"/>` + tree(40, 252, .8) +
    person({x:300, y:270, s:.95, robe:"#6FB3E8", belt:"#F2B630", hair:"#5A3A22", beard:"#5A3A22", face:"happy", prop:"banner", armR:"hold"}) +
    [[230,.7,"#FF8A5C"],[180,.66,"#8CC5B9"],[135,.62,"#B488E8"],[95,.58,"#FFD23F"],[60,.54,"#FA57C4"]]
      .map(([x, s, c], i) => person({x, y:280 - i * 4, s, robe:c, hair:["#213330","#5A3A22","#8a5a17"][i % 3], hat: i % 2 ? "scarf" : "kippah", scarfColor:"#F2B630", skin:SK[i % 4]})).join("")),
  // 6. למה "מכבי"? יהודה והפטיש
  () => wrap(sky("g6", "#FDE6F6", "#FFF7FB") + `<circle cx="200" cy="150" r="120" fill="#fff" opacity=".7"/>` +
    person({x:200, y:282, s:1.4, robe:"#6FB3E8", belt:"#F2B630", hair:"#5A3A22", beard:"#5A3A22", face:"happy", prop:"hammer", armR:"up", armL:"hold"}) +
    `<g font-family="Fredoka,Arial" font-weight="700" text-anchor="middle"><rect x="20" y="40" width="110" height="44" rx="22" fill="#C5309A"/><text x="75" y="70" font-size="22" fill="#fff">מַקֶּבֶת</text>
     <rect x="262" y="40" width="118" height="44" rx="22" fill="#2F6F63"/><text x="321" y="70" font-size="22" fill="#fff">מכבי</text></g>` +
    `<path d="M135 62 Q200 30 258 62" fill="none" stroke="${OUT}" stroke-width="2.5" stroke-dasharray="5 6"/>`),
  // 7. פילים וצבא גדול מול מכבים אמיצים
  () => wrap(sky("g7", "#FFE0B8", "#FFF5E6") + sun(60, 60, 20) + `<path d="M0 230 Q120 200 250 220 Q330 230 400 210 V300 H0Z" fill="#E7C98E"/>` +
    `<path d="M230 150 L400 120 V300 H190Z" fill="#C9D9A0" stroke="${OUT}" stroke-width="2"/>` +
    elephant(95, 262, .95) + person({x:85, y:186, s:.5, robe:"#B7C0CC", hat:"helmet", face:"stern"}) +
    [20, 165].map(x => person({x, y:282, s:.6, robe:"#B7C0CC", belt:"#8a5a17", hat:"helmet", face:"stern", prop:"spear", armR:"hold"})).join("") +
    person({x:300, y:200, s:.75, robe:"#6FB3E8", belt:"#F2B630", hair:"#5A3A22", beard:"#5A3A22", face:"happy", prop:"banner", armR:"hold"}) +
    person({x:350, y:196, s:.62, robe:"#FF8A5C", hair:"#213330", face:"happy", armR:"wave"}) + person({x:255, y:216, s:.6, robe:"#8CC5B9", hair:"#8a5a17", face:"happy"})),
  // 8. מנקים ובונים יחד
  () => wrap(sky("g8", "#BFE6FF", "#F0FAFF") + cloud(80, 40) + temple(200, 225, .75) + `<rect y="225" width="400" height="75" fill="#EADBB8"/>` +
    altarStones(150, 262) +
    person({x:70, y:290, s:.72, robe:"#FF8A5C", hat:"scarf", scarfColor:"#FFD23F", face:"happy", prop:"broom", armR:"hold", skin:SK[1]}) +
    person({x:250, y:290, s:.72, robe:"#6FB3E8", hair:"#5A3A22", beard:"#5A3A22", hat:"kippah", face:"happy", prop:"stone", armR:"up"}) +
    person({x:330, y:292, s:.65, robe:"#B488E8", hair:"#213330", face:"happy", prop:"bucket", armR:"down"}) +
    person({x:120, y:294, s:.5, robe:"#FFD23F", hair:"#8a5a17", face:"wow", armR:"wave"}) +
    `<g fill="#6FB3E8" opacity=".7"><circle cx="345" cy="268" r="4"/><circle cx="355" cy="276" r="3"/></g>`),
  // 9. מוצאים פך שמן קטן
  () => wrap(sky("g9", "#3B3170", "#7A5BA8") + stars(18) + `<rect y="230" width="400" height="70" fill="#5E4A82"/><rect x="40" y="70" width="320" height="170" rx="10" fill="#4A3B78" stroke="${OUT}" stroke-width="2"/>` +
    `<circle cx="200" cy="150" r="110" fill="#FFE680" opacity=".18"/>` +
    person({x:200, y:282, s:1.2, robe:"#fff", belt:"#6FB3E8", beard:"#F4F4F4", hair:"#F4F4F4", hat:"priest", face:"wow", prop:"jug", armR:"up"}) +
    person({x:80, y:290, s:.7, robe:"#8CC5B9", hair:"#5A3A22", hat:"kippah", face:"wow", skin:SK[1]}) +
    person({x:325, y:290, s:.7, robe:"#FF8A5C", hair:"#213330", face:"wow", armR:"wave"})),
  // 10. הנס – המנורה דולקת שמונה ימים
  () => wrap(sky("g10", "#2E3F7A", "#5468B0") + stars(24) + `<circle cx="200" cy="150" r="130" fill="#FFE680" opacity=".14"/>` + menorah7(200, 230, 1.9) +
    `<rect y="240" width="400" height="60" fill="#3A4C8A"/>` +
    `<g font-family="Fredoka,Arial" font-weight="700" text-anchor="middle">${Array.from({length: 8}, (_, i) => `<circle cx="${60 + i * 40}" cy="270" r="15" fill="${i < 8 ? "#FFD23F" : "#fff"}" stroke="${OUT}" stroke-width="2"/><text x="${60 + i * 40}" y="277" font-size="18" fill="${OUT}">${8 - i}</text>`).join("")}</g>`),
  // 11. היום – משפחה מדליקה חנוכייה בחלון
  () => wrap(`<rect width="400" height="300" fill="#FFF1E3"/><rect x="230" y="40" width="150" height="150" rx="10" fill="#24325F" stroke="${OUT}" stroke-width="3"/>` +
    `<path d="M305 40 V190 M230 115 H380" stroke="#FFF1E3" stroke-width="6"/>` + `<g>${stars(0)}</g><circle cx="350" cy="70" r="12" fill="#FFF3C4"/><circle cx="255" cy="65" r="2" fill="#fff"/><circle cx="280" cy="150" r="2" fill="#fff"/>` +
    `<rect x="215" y="188" width="180" height="14" rx="4" fill="#C9A15A" stroke="${OUT}" stroke-width="2"/>` + hanukkiahSmall(305, 188, 1.1, 8) +
    `<rect y="250" width="400" height="50" fill="#F3D9C0"/><rect x="20" y="200" width="150" height="56" rx="8" fill="#E8A65A" stroke="${OUT}" stroke-width="2"/>` +
    `<g transform="translate(55 196) scale(.35)">${ART_SUF()}</g><g transform="translate(95 196) scale(.35)">${ART_SUF()}</g>` +
    person({x:150, y:292, s:.95, robe:"#6FB3E8", hair:"#5A3A22", beard:"#5A3A22", hat:"kippah", face:"happy", prop:"candle", armR:"point"}) +
    person({x:90, y:294, s:.6, robe:"#FA57C4", hair:"#213330", face:"wow", armR:"wave", skin:SK[1]}) +
    person({x:40, y:294, s:.85, robe:"#8CC5B9", hat:"scarf", scarfColor:"#FF8A5C", face:"happy"}) +
    `<g transform="translate(205 268) scale(.32)"><rect x="44" y="4" width="12" height="24" rx="5" fill="#2F6F63" stroke="${OUT}" stroke-width="4"/><path d="M20 28 H80 V58 L50 96 L20 58Z" fill="#FA57C4" stroke="${OUT}" stroke-width="4"/><text x="50" y="68" text-anchor="middle" font-family="Fredoka,Arial" font-weight="700" font-size="34" fill="#fff">נ</text></g>`)
];
function ART_SUF(){
  return `<ellipse cx="50" cy="60" rx="40" ry="27" fill="#E59B4C" stroke="${OUT}" stroke-width="3"/><path d="M16 52 Q22 30 50 30 Q78 30 84 52 Q74 46 64 50 Q56 44 48 50 Q38 44 30 50 Q22 46 16 52Z" fill="#FFF6E8" stroke="${OUT}" stroke-width="3"/><ellipse cx="50" cy="40" rx="10" ry="6" fill="#D6336C" stroke="${OUT}" stroke-width="3"/>`;
}
window.storyArt = i => SCENES[i] ? SCENES[i]() : "";
})();
