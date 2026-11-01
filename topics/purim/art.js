/* =========================================================
   איורים מקוריים לפורים – booqli Games
   מיצי החתולה הבלשית, העכבר השובב, משלוח מנות, ודמויות מגילת אסתר.
   הכל מצויר בקוד (SVG), בלי תמונות מהאינטרנט.
   PA.color = false → קווים בלבד (לדפי צביעה)
   ========================================================= */
(function(){
const PA = window.PA = {color: true};
const O = "#3a2433";               // קו מתאר
const F = c => PA.color ? c : "#fff";
const S = (w = 3) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const svg = PA.svg = (inner, vb = "0 0 400 300", extra = "") => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ${extra}>${inner}</svg>`;

/* ---------- מיצי החתולה הבלשית ----------
   x,y = נקודת הרגליים · s = גודל · o.hat כובע בלשים · o.glass זכוכית מגדלת
   o.face: happy | wow | sad | think · o.white = חתולה לבנה */
PA.cat = function(x, y, s = 1, o = {}){
  const fur = o.white ? "#FFFFFF" : "#2C2433", line = o.white ? O : "#120C16";
  const st = `stroke="${PA.color ? line : O}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"`;
  const face = o.face || "happy";
  let g = "";
  // זנב
  g += `<path d="M26 -20 Q70 -18 66 -60 Q63 -86 80 -92" fill="none" stroke="${PA.color ? line : O}" stroke-width="15" stroke-linecap="round"/>`;
  g += `<path d="M26 -20 Q70 -18 66 -60 Q63 -86 80 -92" fill="none" stroke="${F(fur)}" stroke-width="9" stroke-linecap="round"/>`;
  // גוף
  g += `<path d="M-30 -4 Q-40 -60 -18 -78 Q0 -86 18 -78 Q40 -60 30 -4Z" fill="${F(fur)}" ${st}/>`;
  g += `<ellipse cx="0" cy="-34" rx="15" ry="22" fill="${F(o.white ? "#F4EEF7" : "#4A3F55")}" stroke="none"/>`;
  // רגליים
  g += `<ellipse cx="-15" cy="-4" rx="12" ry="7" fill="${F(fur)}" ${st}/><ellipse cx="15" cy="-4" rx="12" ry="7" fill="${F(fur)}" ${st}/>`;
  // ידיים
  g += `<path d="M-24 -62 Q-38 -44 -26 -30" fill="none" stroke="${PA.color ? line : O}" stroke-width="13" stroke-linecap="round"/><path d="M-24 -62 Q-38 -44 -26 -30" fill="none" stroke="${F(fur)}" stroke-width="7" stroke-linecap="round"/>`;
  if (o.glass){
    g += `<path d="M24 -62 Q44 -64 50 -82" fill="none" stroke="${PA.color ? line : O}" stroke-width="13" stroke-linecap="round"/><path d="M24 -62 Q44 -64 50 -82" fill="none" stroke="${F(fur)}" stroke-width="7" stroke-linecap="round"/>`;
    g += `<path d="M52 -84 L62 -100" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M52 -84 L62 -100" stroke="${F("#B07A45")}" stroke-width="4" stroke-linecap="round"/>`;
    g += `<circle cx="72" cy="-118" r="20" fill="${PA.color ? "rgba(190,230,255,.55)" : "#fff"}" stroke="${O}" stroke-width="5"/><circle cx="72" cy="-118" r="20" fill="none" stroke="${F("#F2B630")}" stroke-width="2.5"/>${PA.color ? `<path d="M62 -126 Q66 -132 74 -132" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` : ""}`;
  } else {
    g += `<path d="M24 -62 Q38 -44 26 -30" fill="none" stroke="${PA.color ? line : O}" stroke-width="13" stroke-linecap="round"/><path d="M24 -62 Q38 -44 26 -30" fill="none" stroke="${F(fur)}" stroke-width="7" stroke-linecap="round"/>`;
  }
  // ראש ואוזניים
  g += `<path d="M-30 -112 L-34 -150 L-8 -132Z M30 -112 L34 -150 L8 -132Z" fill="${F(fur)}" ${st}/>`;
  g += PA.color ? `<path d="M-27 -120 L-29 -141 L-14 -130Z M27 -120 L29 -141 L14 -130Z" fill="#FF9EC9"/>` : "";
  g += `<ellipse cx="0" cy="-108" rx="36" ry="31" fill="${F(fur)}" ${st}/>`;
  // עיניים
  const eye = ex => {
    if (face === "sad") return `<path d="M${ex-8} -114 Q${ex} -108 ${ex+8} -114" fill="none" stroke="${PA.color ? "#C9F27A" : O}" stroke-width="3.5" stroke-linecap="round"/>`;
    const r = face === "wow" ? 10 : 9;
    return `<ellipse cx="${ex}" cy="-112" rx="${r}" ry="${r + 2}" fill="${F("#C9F27A")}" stroke="${O}" stroke-width="2"/><ellipse cx="${ex + (face === "think" ? 3 : 0)}" cy="-111" rx="${face === "wow" ? 3 : 4}" ry="${face === "wow" ? 6 : 8}" fill="${O}"/><circle cx="${ex - 3}" cy="-116" r="2.6" fill="#fff"/>`;
  };
  g += eye(-14) + eye(14);
  // אף, שפם, פה
  g += `<path d="M-5 -100 L5 -100 L0 -94Z" fill="${F("#FF8FB8")}" stroke="${O}" stroke-width="1.5"/>`;
  const wh = PA.color ? (o.white ? "#B9AFC2" : "#D9D2E0") : O;
  g += `<path d="M-12 -96 L-40 -100 M-12 -92 L-40 -88 M12 -96 L40 -100 M12 -92 L40 -88" stroke="${wh}" stroke-width="1.8" stroke-linecap="round"/>`;
  const mc = PA.color ? (o.white ? O : "#F6E9F2") : O;
  if (face === "wow") g += `<ellipse cx="0" cy="-86" rx="5" ry="6" fill="${F("#FF6F9C")}" stroke="${mc}" stroke-width="2"/>`;
  else if (face === "sad") g += `<path d="M-7 -84 Q0 -90 7 -84" fill="none" stroke="${mc}" stroke-width="2.4" stroke-linecap="round"/>`;
  else g += `<path d="M-8 -90 Q-4 -85 0 -90 Q4 -85 8 -90" fill="none" stroke="${mc}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (PA.color && face !== "sad") g += `<circle cx="-24" cy="-98" r="5" fill="#FF7FB5" opacity=".55"/><circle cx="24" cy="-98" r="5" fill="#FF7FB5" opacity=".55"/>`;
  // כובע בלשים
  if (o.hat){
    g += `<path d="M-40 -126 Q-50 -122 -46 -116 L-26 -122Z M40 -126 Q50 -122 46 -116 L26 -122Z" fill="${F("#8C5A2E")}" ${S(2.6)}/>`;
    g += `<path d="M-30 -124 Q-30 -158 0 -160 Q30 -158 30 -124 Q0 -116 -30 -124Z" fill="${F("#B07A45")}" ${S(3)}/>`;
    g += PA.color ? `<path d="M-22 -150 L22 -128 M-28 -136 L10 -156 M-10 -158 L28 -138 M-28 -130 L-6 -158" stroke="#8C5A2E" stroke-width="2" opacity=".7"/>` : "";
    g += `<path d="M-6 -160 Q0 -170 6 -160" fill="none" ${S(3)}/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
};

/* ---------- העכבר השובב ---------- o.cheese = מחזיק גבינה · o.face: happy | sorry | wow */
PA.mouse = function(x, y, s = 1, o = {}){
  const face = o.face || "happy";
  let g = "";
  g += `<path d="M18 -10 Q44 -6 46 -26 Q48 -44 64 -40" fill="none" stroke="${F("#FF9EC9")}" stroke-width="4" stroke-linecap="round"/>${PA.color ? "" : `<path d="M18 -10 Q44 -6 46 -26 Q48 -44 64 -40" fill="none" stroke="${O}" stroke-width="1.5"/>`}`;
  g += `<path d="M-22 -4 Q-28 -40 0 -48 Q28 -40 22 -4Z" fill="${F("#B3ADC0")}" ${S(3)}/>`;
  g += `<ellipse cx="-10" cy="-3" rx="9" ry="5" fill="${F("#FFB3D1")}" ${S(2.4)}/><ellipse cx="10" cy="-3" rx="9" ry="5" fill="${F("#FFB3D1")}" ${S(2.4)}/>`;
  g += `<circle cx="-24" cy="-80" r="15" fill="${F("#B3ADC0")}" ${S(3)}/><circle cx="24" cy="-80" r="15" fill="${F("#B3ADC0")}" ${S(3)}/>`;
  g += PA.color ? `<circle cx="-24" cy="-80" r="9" fill="#FFB3D1"/><circle cx="24" cy="-80" r="9" fill="#FFB3D1"/>` : `<circle cx="-24" cy="-80" r="8" fill="none" stroke="${O}" stroke-width="2"/><circle cx="24" cy="-80" r="8" fill="none" stroke="${O}" stroke-width="2"/>`;
  g += `<ellipse cx="0" cy="-62" rx="23" ry="20" fill="${F("#B3ADC0")}" ${S(3)}/>`;
  if (face === "sorry") g += `<path d="M-13 -68 Q-8 -64 -3 -68 M3 -68 Q8 -64 13 -68" fill="none" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>`;
  else g += `<circle cx="-8" cy="-66" r="${face === "wow" ? 4.5 : 3.8}" fill="${O}"/><circle cx="8" cy="-66" r="${face === "wow" ? 4.5 : 3.8}" fill="${O}"/><circle cx="-9.5" cy="-67.5" r="1.3" fill="#fff"/><circle cx="6.5" cy="-67.5" r="1.3" fill="#fff"/>`;
  g += `<circle cx="0" cy="-54" r="4" fill="${F("#FF6F9C")}" ${S(1.6)}/>`;
  g += `<path d="M-5 -54 L-24 -58 M-5 -51 L-24 -48 M5 -54 L24 -58 M5 -51 L24 -48" stroke="${O}" stroke-width="1.3" stroke-linecap="round"/>`;
  g += face === "sorry" ? `<path d="M-5 -45 Q0 -48 5 -45" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>` : `<path d="M-5 -47 Q0 -42 5 -47" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>`;
  if (PA.color) g += `<circle cx="-15" cy="-56" r="3.5" fill="#FF7FB5" opacity=".6"/><circle cx="15" cy="-56" r="3.5" fill="#FF7FB5" opacity=".6"/>`;
  if (o.cheese) g += PA.cheese(0, -26, .55);
  else g += `<path d="M-16 -36 Q-24 -24 -12 -18 M16 -36 Q24 -24 12 -18" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
};

/* ---------- חפצים ---------- (כולם במרכז x,y) */
PA.cheese = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 14 L-30 -6 L26 -24 L30 -6 L30 14Z" fill="${F("#FFD23F")}" ${S(3)}/><path d="M-30 -6 L30 -6" ${S(2.4)}/><circle cx="-14" cy="4" r="4.5" fill="${F("#F2B630")}" ${S(1.8)}/><circle cx="10" cy="7" r="3.5" fill="${F("#F2B630")}" ${S(1.8)}/><circle cx="18" cy="-1" r="2.5" fill="${F("#F2B630")}" ${S(1.6)}/><circle cx="2" cy="-12" r="3" fill="${F("#F2B630")}" ${S(1.6)}/></g>`;
PA.hamantash = (x, y, s = 1, fill = "#7A3E8E") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -30 Q8 -30 30 12 Q34 20 26 22 L-26 22 Q-34 20 -30 12 Q-8 -30 0 -30Z" fill="${F("#F2B66B")}" ${S(3)}/><path d="M0 -12 L14 12 L-14 12Z" fill="${F(fill)}" ${S(2.2)}/></g>`;
PA.candy = (x, y, s = 1, c = "#FF56C2") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 L-30 -12 L-30 12Z M14 0 L30 -12 L30 12Z" fill="${F(c)}" ${S(2.6)}/><circle r="15" fill="${F(c)}" ${S(3)}/>${PA.color ? `<path d="M-8 -8 Q0 -2 8 -8 M-9 2 Q0 8 9 2" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` : ""}</g>`;
PA.apple = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -14 Q-28 -28 -26 2 Q-24 26 0 22 Q24 26 26 2 Q28 -28 0 -14Z" fill="${F("#FF4D5E")}" ${S(3)}/><path d="M0 -14 Q2 -24 6 -28" fill="none" ${S(3)}/><path d="M6 -24 Q18 -32 22 -20 Q10 -16 6 -24Z" fill="${F("#46C46E")}" ${S(2.2)}/></g>`;
PA.choco = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-26" y="-18" width="52" height="36" rx="4" fill="${F("#8B4A2B")}" ${S(3)}/><path d="M-26 -6 H26 M-26 6 H26 M-9 -18 V18 M9 -18 V18" stroke="${PA.color ? "#6A341C" : O}" stroke-width="2"/><path d="M-26 6 L-26 18 L26 18 L26 2Z" fill="${F("#E0399F")}" ${S(2.4)}/></g>`;
PA.juice = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -22 H14 V24 H-14Z" fill="${F("#FF9A2E")}" ${S(3)}/><path d="M-14 -22 L-8 -32 H8 L14 -22" fill="${F("#FFE1B8")}" ${S(2.6)}/><path d="M4 -32 L10 -44" ${S(3)}/><circle cy="2" r="7" fill="${F("#FFD23F")}" ${S(2)}/></g>`;
PA.raashan = (x, y, s = 1, rot = -20) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-4 0 V40" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M-4 0 V40" stroke="${F("#B07A45")}" stroke-width="5" stroke-linecap="round"/><rect x="-6" y="-30" width="34" height="26" rx="5" fill="${F("#3AA7F0")}" ${S(3)}/><path d="M-6 -22 H28 M-6 -12 H28" stroke="${PA.color ? "#FFD23F" : O}" stroke-width="3"/><path d="M-12 -34 L-6 -30 M-14 -20 L-8 -18" ${S(2.4)}/>${PA.color ? `<path d="M32 -38 l6 -6 M36 -26 l9 -2 M34 -14 l7 4" stroke="#FF56C2" stroke-width="3" stroke-linecap="round"/>` : ""}</g>`;
PA.mask = (x, y, s = 1, c = "#FF56C2") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-44 -12 Q-44 -26 -26 -24 Q-10 -22 0 -14 Q10 -22 26 -24 Q44 -26 44 -12 Q44 14 22 16 Q8 16 0 4 Q-8 16 -22 16 Q-44 14 -44 -12Z" fill="${F(c)}" ${S(3)}/><ellipse cx="-20" cy="-4" rx="10" ry="7" fill="#fff" ${S(2.4)}/><ellipse cx="20" cy="-4" rx="10" ry="7" fill="#fff" ${S(2.4)}/>${PA.color ? `<circle cx="-36" cy="-18" r="3" fill="#FFD23F"/><circle cx="36" cy="-18" r="3" fill="#FFD23F"/><circle cx="0" cy="-8" r="3" fill="#FFD23F"/>` : ""}<path d="M44 -10 Q60 -4 52 16" fill="none" ${S(3)}/></g>`;
PA.crown = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-34 18 L-38 -18 L-18 0 L0 -26 L18 0 L38 -18 L34 18Z" fill="${F("#FFD23F")}" ${S(3)}/><circle cx="0" cy="-26" r="5" fill="${F("#FF56C2")}" ${S(2)}/><circle cx="-38" cy="-18" r="4" fill="${F("#3AA7F0")}" ${S(2)}/><circle cx="38" cy="-18" r="4" fill="${F("#3AA7F0")}" ${S(2)}/><path d="M-34 10 H34" ${S(2.4)}/><circle cx="0" cy="4" r="4" fill="${F("#46C46E")}" ${S(1.8)}/></g>`;
PA.scroll = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-26" y="-22" width="52" height="44" fill="${F("#FFF4D6")}" ${S(3)}/><rect x="-36" y="-28" width="12" height="56" rx="6" fill="${F("#B07A45")}" ${S(3)}/><rect x="24" y="-28" width="12" height="56" rx="6" fill="${F("#B07A45")}" ${S(3)}/><path d="M-16 -10 H16 M-16 0 H16 M-16 10 H10" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/></g>`;
/* משלוח מנות: סלסלה עם סרט. items = רשימת חפצים מעל הסלסלה */
PA.basket = function(x, y, s = 1, items = ["hamantash", "candy", "apple", "cheese"]){
  const pos = [[-26, -30], [0, -40], [26, -30], [-12, -18], [14, -18]];
  const draw = {hamantash: (a, b) => PA.hamantash(a, b, .55), candy: (a, b) => PA.candy(a, b, .6), apple: (a, b) => PA.apple(a, b, .6), cheese: (a, b) => PA.cheese(a, b, .55), choco: (a, b) => PA.choco(a, b, .55), juice: (a, b) => PA.juice(a, b, .6)};
  let g = items.map((it, i) => draw[it] ? draw[it](...pos[i % pos.length]) : "").join("");
  g += `<path d="M-46 -14 Q-46 -50 0 -54 Q46 -50 46 -14" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="M-46 -14 Q-46 -50 0 -54 Q46 -50 46 -14" fill="none" stroke="${F("#D49A5B")}" stroke-width="4" stroke-linecap="round"/>`;
  g += `<path d="M-50 -14 H50 L40 30 H-40Z" fill="${F("#D49A5B")}" ${S(3)}/>`;
  g += PA.color ? `<path d="M-46 0 H46 M-43 14 H43 M-30 -14 L-24 30 M-10 -14 L-8 30 M10 -14 L8 30 M30 -14 L24 30" stroke="#A86F36" stroke-width="2"/>` : `<path d="M-46 0 H46 M-43 14 H43" stroke="${O}" stroke-width="1.6"/>`;
  g += `<path d="M-8 -8 Q-24 -22 -26 -4 Q-24 6 -8 -2Z M8 -8 Q24 -22 26 -4 Q24 6 8 -2Z" fill="${F("#FF56C2")}" ${S(2.4)}/><circle cy="-5" r="6" fill="${F("#E0399F")}" ${S(2.4)}/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
};
/* עקבות: kind = mouse | cat | bird | dog */
PA.prints = function(x, y, s = 1, kind = "mouse", rot = 0){
  const c = F(kind === "cat" ? "#2C2433" : kind === "dog" ? "#8C5A2E" : kind === "bird" ? "#F2B630" : "#8A8399");
  let g = "";
  if (kind === "mouse") g = `<ellipse cx="-8" cy="6" rx="5" ry="7" fill="${c}"/><circle cx="-14" cy="-4" r="2.4" fill="${c}"/><circle cx="-8" cy="-7" r="2.4" fill="${c}"/><circle cx="-2" cy="-4" r="2.4" fill="${c}"/><ellipse cx="9" cy="-6" rx="5" ry="7" fill="${c}"/><circle cx="3" cy="-16" r="2.4" fill="${c}"/><circle cx="9" cy="-19" r="2.4" fill="${c}"/><circle cx="15" cy="-16" r="2.4" fill="${c}"/>`;
  else if (kind === "cat") g = `<ellipse cx="0" cy="6" rx="11" ry="9" fill="${c}"/><ellipse cx="-12" cy="-8" rx="4.5" ry="5.5" fill="${c}"/><ellipse cx="-4" cy="-14" rx="4.5" ry="5.5" fill="${c}"/><ellipse cx="5" cy="-14" rx="4.5" ry="5.5" fill="${c}"/><ellipse cx="13" cy="-8" rx="4.5" ry="5.5" fill="${c}"/>`;
  else if (kind === "dog") g = `<ellipse cx="0" cy="8" rx="13" ry="10" fill="${c}"/><ellipse cx="-14" cy="-6" rx="5.5" ry="7" fill="${c}"/><ellipse cx="-5" cy="-15" rx="5.5" ry="7" fill="${c}"/><ellipse cx="6" cy="-15" rx="5.5" ry="7" fill="${c}"/><ellipse cx="15" cy="-6" rx="5.5" ry="7" fill="${c}"/><path d="M-14 -16 l-2 -5 M-5 -25 l0 -5 M6 -25 l0 -5 M15 -16 l2 -5" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`;
  else g = `<path d="M0 14 V-4 M0 -4 L-12 -18 M0 -4 L0 -20 M0 -4 L12 -18" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  if (!PA.color) g = g.replace(/fill="#fff"/g, `fill="#fff" stroke="${O}" stroke-width="1.5"`).replace(/stroke="#fff"/g, `stroke="${O}"`);
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${g}</g>`;
};
/* ליצן לכרטיס הברכה */
PA.clown = function(x, y, s = 1){
  let g = "";
  g += `<path d="M-70 70 Q-60 30 0 30 Q60 30 70 70 L70 110 H-70Z" fill="${F("#3AA7F0")}" ${S(3)}/>`;
  g += PA.color ? `<circle cx="-30" cy="70" r="7" fill="#FFD23F"/><circle cx="30" cy="85" r="7" fill="#FF56C2"/><circle cx="0" cy="100" r="7" fill="#46C46E"/>` : "";
  g += [-60, -30, 0, 30, 60].map((a, i) => `<path d="M${a - 18} 30 Q${a} ${i % 2 ? 58 : 52} ${a + 18} 30" fill="${F(["#FF56C2", "#FFD23F", "#46C46E", "#FF9A2E", "#9B5DE5"][i])}" ${S(2.6)}/>`).join("");
  g += `<path d="M-50 -30 Q-80 -50 -74 -10 Q-92 -10 -80 14 Q-66 22 -52 4Z M50 -30 Q80 -50 74 -10 Q92 -10 80 14 Q66 22 52 4Z" fill="${F("#FF6A3D")}" ${S(3)}/>`;
  g += `<circle cx="0" cy="-10" r="52" fill="${F("#FFF1E4")}" ${S(3.4)}/>`;
  g += `<path d="M-28 -36 L-14 -22 M-14 -36 L-28 -22" ${S(0)} fill="none"/>`;
  g += `<path d="M-30 -24 Q-20 -40 -10 -24" fill="${F("#9EDBFF")}" ${S(2.4)}/><path d="M10 -24 Q20 -40 30 -24" fill="${F("#9EDBFF")}" ${S(2.4)}/>`;
  g += `<circle cx="-20" cy="-22" r="4.5" fill="${O}"/><circle cx="20" cy="-22" r="4.5" fill="${O}"/>`;
  g += `<path d="M-34 6 Q0 44 34 6 Q0 22 -34 6Z" fill="${F("#FF4D5E")}" ${S(3)}/><path d="M-20 12 Q0 22 20 12" fill="none" stroke="${PA.color ? "#fff" : O}" stroke-width="2.4"/>`;
  g += `<circle cx="0" cy="-6" r="13" fill="${F("#FF2E4D")}" ${S(3)}/>${PA.color ? `<circle cx="-4" cy="-10" r="3.5" fill="#fff" opacity=".8"/>` : ""}`;
  g += PA.color ? `<circle cx="-36" cy="0" r="7" fill="#FF8FB8" opacity=".6"/><circle cx="36" cy="0" r="7" fill="#FF8FB8" opacity=".6"/>` : "";
  g += `<path d="M-34 -52 L0 -130 L34 -52Z" fill="${F("#FFD23F")}" ${S(3.4)}/>`;
  g += PA.color ? `<circle cx="-6" cy="-80" r="6" fill="#FF56C2"/><circle cx="10" cy="-100" r="5" fill="#3AA7F0"/><circle cx="8" cy="-68" r="5" fill="#46C46E"/>` : `<path d="M-20 -80 H20 M-12 -104 H12" stroke="${O}" stroke-width="2"/>`;
  g += `<circle cx="0" cy="-136" r="11" fill="${F("#FF56C2")}" ${S(3)}/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
};
PA.confetti = (n, w, h, seed = 3) => { let r = seed, out = ""; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280; const cols = ["#FF56C2", "#FFD23F", "#3AA7F0", "#46C46E", "#FF9A2E", "#9B5DE5"]; for (let i = 0; i < n; i++){ const x = rnd() * w, y = rnd() * h, c = cols[i % cols.length], k = i % 3; out += k === 0 ? `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(3 + rnd() * 4).toFixed(1)}" fill="${c}"/>` : k === 1 ? `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="10" height="5" rx="2" fill="${c}" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>` : `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q6 -6 12 0 t12 0" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`; } return PA.color ? out : ""; };

/* =========================================================
   דמויות מגילת אסתר
   o: x,y (רגליים), s, robe, trim, skin, hair, beard,
   hat: crown | tiara | turban | haman | null
   face: happy | sad | angry | wow | worried
   arms: down | up | point | hold | wave | pray
   prop: scepter | scroll | null · long = שיער ארוך
   ========================================================= */
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
  g += `<path d="M-2 -74 V-2" stroke="${trim}" stroke-width="5"/><path d="M-22 -36 Q0 -32 22 -36" fill="none" stroke="${trim}" stroke-width="4"/>${PA.color ? "" : `<path d="M-2 -74 V-2 M-22 -36 Q0 -32 22 -36" fill="none" stroke="${O}" stroke-width="1.5"/>`}`;
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
    if (PA.color && f === "happy") g += `<circle cx="-11" cy="-85" r="3.2" fill="#FF8FB8" opacity=".6"/><circle cx="11" cy="-85" r="3.2" fill="#FF8FB8" opacity=".6"/>`;
  } else if (f === "wow") g += `<ellipse cx="0" cy="-78" rx="3" ry="3.4" fill="${O}"/>`;
  // כובעים
  if (o.hat === "crown") g += `<path d="M-15 -104 L-17 -122 L-8 -112 L0 -126 L8 -112 L17 -122 L15 -104Z" fill="${F("#FFD23F")}" ${S(2.4)}/><circle cx="0" cy="-126" r="2.6" fill="${F("#FF4D5E")}" ${S(1.4)}/>`;
  if (o.hat === "tiara") g += `<path d="M-13 -106 L-10 -116 L-4 -110 L0 -120 L4 -110 L10 -116 L13 -106Z" fill="${F("#FFD23F")}" ${S(2.2)}/><circle cx="0" cy="-120" r="2.6" fill="${F("#3AA7F0")}" ${S(1.4)}/>`;
  if (o.hat === "turban") g += `<path d="M-18 -98 Q-20 -118 0 -120 Q20 -118 18 -98 Q0 -104 -18 -98Z" fill="${F(o.turban || "#FFFFFF")}" ${S(2.6)}/><path d="M-16 -108 Q0 -100 16 -110" fill="none" ${S(1.8)}/>`;
  if (o.hat === "haman") g += `<path d="M-26 -100 L0 -132 L26 -100 Q0 -108 -26 -100Z" fill="${F("#3E2A57")}" ${S(2.6)}/><path d="M-26 -100 L-30 -96 M26 -100 L30 -96" ${S(2.6)}/><circle cx="0" cy="-132" r="3" fill="${F("#F2B630")}" ${S(1.4)}/>`;
  // אביזרים
  if (o.prop === "scepter") g += `<path d="M22 -50 L58 -86" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M22 -50 L58 -86" stroke="${F("#FFD23F")}" stroke-width="3.6" stroke-linecap="round"/><circle cx="60" cy="-88" r="7" fill="${F("#FFD23F")}" ${S(2.4)}/>`;
  if (o.prop === "scroll") g += PA.scroll(16, -46, .42);
  const flip = o.flip ? " scale(-1 1)" : "";
  return `<g transform="translate(${o.x} ${o.y}) scale(${s})${flip}">${g}</g>`;
}
PA.person = person;
// הדמויות הקבועות
const KING = o => person(Object.assign({robe: "#D94A6A", trim: "#FFD23F", cape: "#9B2C55", beard: "#7A4A26", hair: "#7A4A26", hat: "crown"}, o));
const ESTHER = o => person(Object.assign({robe: "#4C8FE0", trim: "#FFD23F", long: true, hair: "#2E1A12", hat: "tiara", skin: SKIN[1]}, o));
const ESTHER0 = o => person(Object.assign({robe: "#8FC9A8", trim: "#FFFFFF", long: true, hair: "#2E1A12", skin: SKIN[1]}, o));
const MORDI = o => person(Object.assign({robe: "#6F988B", trim: "#FFFFFF", beard: "#F4F1EA", hair: "none", hat: "turban", skin: SKIN[0]}, o));
const HAMAN = o => person(Object.assign({robe: "#5B3E8A", trim: "#1E1430", mustache: "#1E1430", hair: "#1E1430", hat: "haman", face: "angry", skin: SKIN[2]}, o));
const GUARD = o => person(Object.assign({robe: "#8C6A3C", trim: "#5A3F1E", hair: "#3B2416", beard: "#3B2416", skin: SKIN[1]}, o));
const FOLK = (i, o) => person(Object.assign({robe: ["#FF9A2E", "#46C46E", "#FF56C2", "#3AA7F0", "#9B5DE5"][i % 5], trim: "#FFFFFF", hair: ["#3B2416", "#7A4A26", "#1E1430"][i % 3], skin: SKIN[i % 3], long: i % 2 === 1}, o));

/* ---------- רקעים ---------- */
const BG = {};
BG.palace = (night = false) => {
  const sky = night ? "#2D3A6B" : "#FFE9C4";
  let g = `<rect width="400" height="300" fill="${F(sky)}"/>`;
  g += `<rect y="220" width="400" height="80" fill="${F(night ? "#5A4A7A" : "#F2D7A8")}"/><path d="M0 220 H400" ${S(3)}/>`;
  // וילונות תכלת ולבן
  g += [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 50} 0 H${i * 50 + 50} V26 Q${i * 50 + 25} 44 ${i * 50} 26Z" fill="${F(i % 2 ? "#FFFFFF" : "#7CC4F2")}" ${S(2.2)}/>`).join("");
  // עמודים
  g += [36, 364].map(x => `<rect x="${x - 14}" y="40" width="28" height="180" fill="${F("#FFF7E8")}" ${S(3)}/><rect x="${x - 20}" y="40" width="40" height="12" fill="${F("#F2B630")}" ${S(2.4)}/><rect x="${x - 20}" y="208" width="40" height="12" fill="${F("#F2B630")}" ${S(2.4)}/>`).join("");
  return g;
};
BG.throne = (x, y) => `<path d="M${x - 34} ${y} V${y - 120} Q${x} ${y - 150} ${x + 34} ${y - 120} V${y}Z" fill="${F("#FFD23F")}" ${S(3)}/><path d="M${x - 24} ${y - 10} V${y - 112} Q${x} ${y - 134} ${x + 24} ${y - 112} V${y - 10}Z" fill="${F("#C13671")}" ${S(2.4)}/><rect x="${x - 40}" y="${y - 44}" width="80" height="16" rx="5" fill="${F("#F2B630")}" ${S(2.6)}/>`;
BG.street = () => `<rect width="400" height="300" fill="${F("#CFEFFF")}"/><circle cx="340" cy="54" r="26" fill="${F("#FFD23F")}" ${S(2.4)}/><path d="M0 120 H90 V60 L110 40 L130 60 V120 H170 V80 H230 V120 H280 V70 Q300 46 320 70 V120 H400 V220 H0Z" fill="${F("#F6E3C1")}" ${S(3)}/>${[30, 190, 350].map(x => `<rect x="${x}" y="140" width="22" height="30" rx="10" fill="${F("#7CC4F2")}" ${S(2.4)}/>`).join("")}<rect y="220" width="400" height="80" fill="${F("#E8D2A6")}"/><path d="M0 220 H400" ${S(3)}/>`;
BG.gate = () => `${BG.street()}<path d="M120 220 V90 Q200 40 280 90 V220 H246 V110 Q200 80 154 110 V220Z" fill="${F("#F2B630")}" ${S(3)}/>`;
BG.table = (y = 222) => `<rect x="70" y="${y - 50}" width="260" height="20" rx="6" fill="${F("#FFF7E8")}" ${S(3)}/><path d="M80 ${y - 30} V${y} M320 ${y - 30} V${y}" ${S(5)}/>` + PA.hamantash(120, y - 62, .5) + PA.apple(160, y - 62, .55) + `<path d="M190 ${y - 50} V${y - 80} H214 V${y - 50}" fill="${F("#F2B630")}" ${S(2.4)}/>` + PA.candy(250, y - 60, .5, "#9B5DE5") + PA.hamantash(286, y - 62, .5, "#C13671");

/* ---------- 13 עמודי מגילת אסתר ---------- */
const SCENES = [
  // 0 · אחשוורוש בארמון בשושן
  () => BG.palace() + BG.throne(200, 222) + KING({x: 200, y: 214, s: 1.15, arms: "wave", prop: "scepter"}) + BG.table(260).replace(/^/, "") ,
  // 1 · מרדכי ואסתר
  () => BG.street() + MORDI({x: 160, y: 250, s: 1.25, arms: "hold"}) + ESTHER0({x: 250, y: 254, s: 1.15, arms: "wave"}) + `<path d="M200 120 q8 -10 16 0 q8 -10 16 0 q0 12 -16 22 q-16 -10 -16 -22Z" fill="${F("#FF56C2")}" ${S(2.4)}/>`,
  // 2 · אסתר נהיית מלכה
  () => BG.palace() + KING({x: 140, y: 236, s: 1.15, arms: "point"}) + ESTHER({x: 260, y: 236, s: 1.2, arms: "up"}) + PA.confetti(30, 400, 200, 5),
  // 3 · בגתן ותרש לוחשים, מרדכי שומע
  () => BG.gate() + GUARD({x: 230, y: 250, s: 1.05, arms: "hold", face: "angry"}) + GUARD({x: 290, y: 250, s: 1.05, flip: true, arms: "point", face: "angry", robe: "#6A7A3C"}) + MORDI({x: 90, y: 250, s: 1.15, face: "wow", arms: "hold"}) + `<path d="M120 120 Q140 96 160 110" fill="none" stroke="${O}" stroke-width="3" stroke-dasharray="4 6"/><text x="252" y="120" font-size="34" font-family="Fredoka,Arial" fill="${O}">? ? ?</text>`,
  // 4 · כולם משתחווים להמן, רק מרדכי עומד
  () => BG.gate() + HAMAN({x: 200, y: 250, s: 1.2, arms: "point"}) + [0, 1].map(i => `<g transform="translate(${70 + i * 60} 250) rotate(-35)">${FOLK(i, {x: 0, y: 0, s: .9, arms: "down"})}</g>`).join("") + MORDI({x: 330, y: 250, s: 1.15, face: "happy", arms: "down"}),
  // 5 · המן מפיל פור
  () => BG.palace() + HAMAN({x: 140, y: 236, s: 1.2, arms: "up"}) + `<path d="M220 222 Q210 170 240 160 H300 Q330 170 320 222Z" fill="${F("#C98E62")}" ${S(3)}/><text x="270" y="206" text-anchor="middle" font-size="30" font-weight="700" font-family="Fredoka,Arial" fill="${O}">פּוּר</text>` + [[200, 120], [250, 100], [300, 126]].map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="22" rx="4" fill="${F("#FFF7E8")}" ${S(2.4)}/><circle cx="${x + 11}" cy="${y + 11}" r="3" fill="${O}"/>`).join(""),
  // 6 · מרדכי מבקש, אסתר מחליטה לצום ולהתפלל
  () => BG.palace() + MORDI({x: 120, y: 236, s: 1.15, face: "sad", arms: "pray", robe: "#9C8F7A"}) + ESTHER({x: 270, y: 236, s: 1.2, face: "worried", arms: "pray"}) + `<path d="M300 90 a10 10 0 1 0 0.1 0 M320 70 a14 14 0 1 0 0.1 0 M346 44 a20 20 0 1 0 0.1 0" fill="${F("#fff")}" ${S(2.2)}/>`,
  // 7 · המלך מושיט את שרביט הזהב
  () => BG.palace() + BG.throne(120, 222) + KING({x: 120, y: 214, s: 1.15, arms: "point", prop: "scepter", face: "happy"}) + ESTHER({x: 280, y: 236, s: 1.2, flip: true, arms: "hold", face: "happy"}),
  // 8 · המלך לא נרדם, מקריאים לו מהספר
  () => BG.palace(true) + `<circle cx="330" cy="60" r="22" fill="${F("#FFF4C2")}" ${S(2.4)}/><circle cx="342" cy="52" r="18" fill="${F("#2D3A6B")}"/>` + `<rect x="70" y="150" width="56" height="36" rx="10" fill="${F("#FFF7E8")}" ${S(3)}/>` + `<g transform="translate(232 182) rotate(-90)">${KING({x: 0, y: 0, s: .9, face: "wow", arms: "down"})}</g>` + `<rect x="60" y="176" width="200" height="38" rx="10" fill="${F("#C13671")}" ${S(3)}/><path d="M80 214 V232 M240 214 V232" ${S(5)}/>` + person({x: 300, y: 240, s: 1.1, flip: true, robe: "#46C46E", hair: "#3B2416", prop: "scroll", arms: "hold", face: "happy"}),
  // 9 · מרדכי על סוס המלך, המן מוביל
  () => BG.street() + `<g transform="translate(240 236)"><path d="M-70 -10 Q-80 -70 -30 -70 H40 Q70 -100 90 -96 L100 -70 Q84 -66 70 -50 Q66 -20 60 -10" fill="${F("#FFFFFF")}" ${S(3)}/><path d="M-60 -14 V20 M-36 -12 V20 M30 -12 V20 M54 -14 V20" ${S(7)}/><path d="M-70 -50 Q-96 -46 -94 -16" fill="none" ${S(5)}/><path d="M80 -96 Q70 -110 60 -90" fill="${F("#FFFFFF")}" ${S(2.4)}/><circle cx="88" cy="-82" r="3" fill="${O}"/><path d="M-30 -70 Q0 -60 30 -70 L26 -50 Q0 -42 -26 -50Z" fill="${F("#D94A6A")}" ${S(2.4)}/></g>` + MORDI({x: 236, y: 176, s: 1, face: "happy", arms: "wave", robe: "#D94A6A", trim: "#FFD23F", turban: "#FFD23F"}) + HAMAN({x: 70, y: 256, s: 1.05, face: "sad", arms: "up"}),
  // 10 · במשתה: אסתר מצביעה על המן
  () => BG.palace() + BG.table(250) + KING({x: 200, y: 200, s: 1.05, face: "wow", arms: "up"}) + ESTHER({x: 320, y: 238, s: 1.1, flip: true, arms: "point", face: "angry"}) + HAMAN({x: 80, y: 238, s: 1.05, face: "wow", arms: "up"}),
  // 11 · מרדכי בבגדי מלכות, היהודים שמחים
  () => BG.street() + PA.confetti(40, 400, 160, 8) + MORDI({x: 200, y: 250, s: 1.25, robe: "#4C8FE0", trim: "#FFFFFF", cape: "#3B6FB8", turban: "#FFD23F", arms: "up"}) + [0, 1, 2, 3].map(i => FOLK(i + 1, {x: [50, 110, 290, 350][i], y: 256, s: .85, arms: i % 2 ? "up" : "wave", flip: i > 1})).join(""),
  // 12 · חוגגים פורים: מגילה, רעשן, משלוח מנות, תחפושות
  () => `<rect width="400" height="300" fill="${F("#FFE3F4")}"/>` + PA.confetti(50, 400, 300, 11) + `<rect y="230" width="400" height="70" fill="${F("#E1F0EA")}"/><path d="M0 230 H400" ${S(3)}/>` + PA.cat(90, 240, .75, {hat: 1, glass: 0}) + FOLK(2, {x: 190, y: 248, s: 1.05, arms: "up", hat: "crown"}) + PA.raashan(170, 140, .9, -10) + PA.basket(290, 220, .9) + PA.scroll(320, 90, .9) + PA.mask(80, 70, .8)
];
PA.megillah = i => svg(SCENES[i](), "0 0 400 300", 'preserveAspectRatio="xMidYMid slice"');
PA.megillahCount = SCENES.length;

/* ---------- 8 עמודי "מיצי הבלשית ומשלוח המנות שנעלם" ---------- */
const room = (warm = "#FFF1DE") => `<rect width="400" height="300" fill="${F(warm)}"/><rect y="226" width="400" height="74" fill="${F("#E9C99A")}"/><path d="M0 226 H400" ${S(3)}/>` + (PA.color ? [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 56} 226 L${i * 56 - 30} 300" stroke="#D6B07A" stroke-width="2"/>`).join("") : "");
const door = x => `<rect x="${x}" y="70" width="80" height="156" rx="6" fill="${F("#C98E62")}" ${S(3)}/><circle cx="${x + 66}" cy="150" r="5" fill="${F("#FFD23F")}" ${S(2)}/>`;
const hole = (x, y = 226) => `<path d="M${x - 26} ${y} V${y - 26} Q${x} ${y - 52} ${x + 26} ${y - 26} V${y}Z" fill="${F("#2B1A12")}" ${S(3)}/>`;
const trail = (pts, kind = "mouse") => pts.map(([x, y, r]) => PA.prints(x, y, .7, kind, r || 0)).join("");
const MITZI = [
  () => room() + door(300) + `<rect x="40" y="170" width="120" height="14" rx="5" fill="${F("#B07A45")}" ${S(3)}/><path d="M50 184 V226 M150 184 V226" ${S(5)}/>` + PA.basket(100, 148, .9, ["hamantash", "candy", "cheese", "apple"]) + PA.cat(230, 232, 1.05, {hat: 1, glass: 1}),
  () => room() + door(300) + `<rect x="40" y="170" width="120" height="14" rx="5" fill="${F("#B07A45")}" ${S(3)}/><path d="M50 184 V226 M150 184 V226" ${S(5)}/><text x="100" y="150" text-anchor="middle" font-size="44" font-family="Fredoka,Arial" fill="${O}">?</text>` + PA.cat(230, 232, 1.05, {hat: 1, face: "wow"}) + `<text x="300" y="56" font-size="26" font-family="Fredoka,Arial" font-weight="700" fill="${F("#C13671")}">מיאו?!</text>`,
  () => room() + trail([[60, 270, 10], [110, 262, -6], [160, 272, 12], [210, 262, -4]]) + PA.cat(300, 232, 1.05, {hat: 1, glass: 1, face: "think"}),
  () => room("#EAF6EF") + `<path d="M330 226 V170 H370 V226Z" fill="${F("#E07A4A")}" ${S(3)}/><path d="M350 170 Q330 120 350 100 Q370 120 350 170 M350 160 Q310 140 320 120 M350 160 Q390 140 380 120" fill="${F("#46C46E")}" ${S(2.4)}/>` + trail([[40, 274, 80], [80, 262, 70], [120, 276, 90], [160, 262, 80], [200, 276, 86], [240, 262, 76]]) + PA.cat(300, 236, .95, {hat: 1, glass: 1, face: "happy"}),
  () => room() + hole(120) + PA.mouse(120, 222, .6, {cheese: 1, face: "wow"}) + `<text x="60" y="140" font-size="22" font-family="Fredoka,Arial" font-weight="700" fill="${O}">קְרַנְץ'!</text>` + PA.basket(180, 214, .55, ["hamantash", "candy", "apple"]) + PA.cat(310, 236, 1, {hat: 1, glass: 1, face: "wow"}),
  () => room() + PA.mouse(140, 236, 1.2, {face: "sorry"}) + PA.cheese(196, 214, .6) + PA.cat(300, 236, 1, {hat: 1, face: "think"}) + `<path d="M60 80 h120 a14 14 0 0 1 14 14 v40 a14 14 0 0 1 -14 14 h-80 l-20 18 v-18 h-20 a14 14 0 0 1 -14 -14 v-40 a14 14 0 0 1 14 -14z" fill="#fff" ${S(2.6)}/><text x="120" y="126" text-anchor="middle" font-size="22" font-family="Fredoka,Arial" font-weight="700" fill="${O}">סְלִיחָה!</text>`,
  () => room("#FFF6D6") + `<rect x="30" y="150" width="160" height="76" fill="${F("#FFFFFF")}" ${S(3)}/><rect x="30" y="140" width="160" height="14" fill="${F("#7CC4F2")}" ${S(3)}/>` + PA.cheese(70, 124, .7) + PA.cheese(130, 120, .8) + PA.cat(270, 236, 1, {hat: 1, face: "happy"}) + PA.basket(350, 214, .6, ["cheese", "cheese", "cheese"]),
  () => room("#FFE3F4") + PA.confetti(40, 400, 200, 4) + PA.mouse(120, 238, 1.05, {face: "happy", cheese: 1}) + PA.basket(200, 214, .7, ["cheese", "cheese", "cheese"]) + PA.cat(300, 238, 1.05, {hat: 1, face: "happy"}) + `<text x="200" y="70" text-anchor="middle" font-size="36" font-family="Fredoka,Arial" font-weight="700" fill="${F("#C13671")}">פורים שמח!</text>`
];
PA.mitzi = i => svg(MITZI[i](), "0 0 400 300", 'preserveAspectRatio="xMidYMid slice"');
PA.mitziCount = MITZI.length;
})();
