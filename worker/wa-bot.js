/* BOOQLI – בוט ההזמנות בוואטסאפ (Cloudflare Worker), 4.11.2026 – סַבָּאבּוּקְלִי
   המסלול = עמוד "המסלול של סבאבוקלי בוואטסאפ" (ארטיפקט של שמש). שני מסלולים, הכל בתוך השיחה:
   • ספר לילד או לנכד: למי הספר (סבים/הורים) ← ספר ← בן/בת (+📖 לקרוא) ← שם ← הקדשה (✅/✨/✍️) ← תמונות ← שם המזמין
                        ← עוד ספר? (מחיר, חיסכון, משלוח) ← אישור תקנון+הורים ← סיכום.
   • הזמנה לגן: שם הגן ← שם הגננת ← כמה ילדים ← ספר (עד 2 נושאים, +קריאה) ← כריכה ← מחיר ← הקדשת הגן
                        ← תמונות בנים (שם הילד בכיתוב) ← תמונות בנות ← בדיקת הרשימה ← אישור ← סיכום.
   "🙋 לדבר עם בן אדם" בהודעה הראשונה (אפשר לחזור אליה), או כתיבת "בן אדם"/"נציג" – הבוט שותק; "להמשיך" מחזיר.
   שמש כותבת בעצמה מהאפליקציה (coexistence) – הבוט שותק. חוזרים להזמנה מאותו מקום: הלקוח לוחץ "▶️ להמשיך בהזמנה" (או כותב "להמשיך"),
   או ששמש כותבת בהודעה שלה "להמשיך בהזמנה"/"נמשיך בהזמנה" (או "#בוט") – והבוט מיד ממשיך מהשאלה שעצרו בה. הבוט מתחיל רק בהודעה על ספר/נכד/גן/הזמנה (TRIGGER)
   או בלחיצה על כפתור שלו. הזמנה מלאה מהאתר ("הזמנה סב-") – לא נוגע.
   סודות (Cloudflare → Worker → Settings → Variables, כ-Secret – שמש מדביקה בעצמה, לא בצ'אט ולא במאגר):
     WA_TOKEN, WA_PHONE_ID, VERIFY_TOKEN, APP_SECRET – מטא;  DRIVE_URL, DRIVE_KEY – הקוד בגוגל (worker/drive-saver.gs);
   פרטי תשלום לא נמצאים בבוט: הבוט רק שואל איך נוח לשלם, ושמש שולחת את הפרטים בעצמה.
   שאלה חופשית בכל שלב: הבוט עונה רק מתוך התשובות שכאן (QA) + "▶️ ממשיכים" / "🙋 לא עזר – לשמש"; לא יודע – עובר לשמש + מייל אליה.
   דרייב: כל תמונה נשמרת מיד ב"BOOQLI הזמנות / <מספר> · <שם> · <תאריך> / בנים|בנות / <שם הילד>.jpg";
   בסוף – מסמך "סיכום ההזמנה" + מייל לשמש. הדרייב לא זמין? התמונה נשמרת ב-KV ומנסים שוב בסוף ההזמנה.
   KV בשם STATE. כתובות: GET/POST /wa (webhook), GET /p/<id>.jpg (גיבוי תמונות), GET /orders?k=VERIFY_TOKEN. */

const GRAPH = "https://graph.facebook.com/v23.0";
const SITE = "https://games.booqli.ai";
const TRIGGER = /נכד|סבתא|סבא|סבים|ספר אישי|להזמין|הזמנה|booqli|בוקלי|גן|גננת|ספר/i;
const MAX = 10, PICS = 5, SHIP = 40, GANBOOKS = 2;
/* מחירון (כמו עמוד הגנים): [מכמות, רכה בהדבקה, קשה]; סיכות – 50 ₪ מ-20 ספרים */
const TIERS = [[1, 132, 149], [2, 106, 123], [3, 94, 111], [4, 88, 105], [6, 80, 97], [8, 66, 83], [20, 60, 77], [50, 59, 76], [100, 57, 74]];
const STAPLE = { p: 50, from: 20 };
const BOOKS = [
  ["birthday", "ילד/ת יום הולדת", 1], ["hugs", "חיבוקים", 1], ["superhero", "גיבור/ת על", 1], ["first", "הספר הראשון שלי", 1],
  ["class1", "עולה לכיתה א'", 1], ["kinder", "הולך/ת לגן", 1], ["savanna", "בסוואנה", 1], ["druki", "דרוקי הדרקון", 1],
  ["night", "אני והחד־קרן", 1], ["summer", "לשחות עם דולפינים", 1],
  ["sleep", "רציתי לישון, אבל...", 0], ["lucy", "איפה לוסי?", 0], ["dream", "רגע לפני החלום", 0], ["space", "המסע לחלל", 0],
  ["pacifier", "ביי ביי מוצץ", 0], ["diaper", "ביי ביי חיתול", 0], ["vikings", "הוויקינגים", 0], ["sibling", "אח/ות גדול/ה", 0]
].map(([id, name, img]) => ({ id, name, img: img ? `${SITE}/order/books/covers-jpg/${id}.jpg` : "" }));
const book = id => BOOKS.find(b => b.id === id);
const readLink = id => `${SITE}/kindergartens/?read=${id}`;
/* לפני "איזה ספר?" (פעם אחת בשיחה): מה מיוחד בספרים + קישורי קריאה (לפי שמש) */
const BOOKS_INTRO = "📚 *הספרים שלנו כתובים, ערוכים ומנוקדים.*\nההתאמה האישית היא ב:\n✨ שם הילד/ה בתוך הסיפור\n🎨 איורים אישיים בדמות הילד/ה\n💌 הקדשה אישית מטעמכם – מודפסת בעמוד השער\n\n📖 *אפשר לקרוא את הספרים לפני שבוחרים:*\n"
  + "אחרי שבוחרים ספר נשלח לכם לכאן ספר לדוגמה – הספר המלא, כקובץ PDF 🙂";
/* הגרסאות של כל ספר לקריאה (PDF ב-order/books/pdf/), כמו books.js */
const PAGES = { birthday: { g: 22, b: 22 }, hugs: { g: 20, b: 20 }, superhero: { g: 21, b: 21 }, first: { g: 20, b: 20 }, class1: { g: 22, b: 22 },
  kinder: { g: 20, b: 20 }, savanna: { g: 20, b: 20 }, druki: { g: 22, b: 22 }, night: { g: 20 }, summer: { g: 26 } };
const RESTART_BTN = ["restart", "↩️ להתחלה"], RESTART_NOTE = "↩️ להתחלה מחדש – כותבים: מחדש";
const TEXT_Q = ["name", "dedown", "pics", "who", "whoown", "addr", "phoneown", "g-name", "g-teacher", "g-kids", "g-dedown", "g-pics"];
/* כפתור/שורה "להתחלה" בכל שאלה (חוץ מהפתיחה). אין מקום לכפתור (3 כפתורים / 10 שורות) – שורה קטנה בתחתית */
function withRestart(m, stp){
  if (stp === "hi") return m;
  const i = m.interactive;
  if (!i) { if (m.type === "text" && TEXT_Q.includes(stp)) m.text.body += "\n\n" + RESTART_NOTE; return m; }
  if (i.type === "button" && i.action.buttons.length < 3) i.action.buttons.push({ type: "reply", reply: { id: RESTART_BTN[0], title: RESTART_BTN[1] } });
  else if (i.type === "list" && i.action.sections[0].rows.length < 10) i.action.sections[0].rows.push({ id: RESTART_BTN[0], title: "↩️ מתחילים מחדש", description: "מוחקים את הבחירות וחוזרים להתחלה" });
  else i.footer = { text: RESTART_NOTE };
  return m;
}
/* קריאת ספר בתוך וואטסאפ: אם יש בן ובת – שואלים איזו גרסה; אחר כך שולחים את הספר כקובץ PDF (order/books/pdf/<ספר>-<b|g>.pdf) */
async function readAsk(S, bid, RB){
  const v = Object.keys(PAGES[bid] || {});
  if (v.length > 1) return S(buttons(`📖 ספר לדוגמה – איזו גרסה של "${book(bid).name}"?`, [["rd:" + bid + ":b", "👦 גרסת בן"], ["rd:" + bid + ":g", "👧 גרסת בת"]]));
  if (v.length) return RB(bid, v[0]);
}
/* ה-PDF מועלה פעם אחת לוואטסאפ (מזהה נשמר 20 יום) – כך הוא נשלח מהר, ואחריו מחכים רגע כדי שהשאלה הבאה תגיע אחריו ולא לפניו */
async function mediaId(env, db, key, link, filename){
  try {
    const k = "media:" + env.WA_PHONE_ID + ":" + key, have = await db.get(k); if (have) return have;
    const pdf = await fetch(link); if (!pdf.ok) return "";
    const fd = new FormData();
    fd.append("messaging_product", "whatsapp"); fd.append("type", "application/pdf");
    fd.append("file", new Blob([await pdf.arrayBuffer()], { type: "application/pdf" }), filename);
    const r = await fetch(`${GRAPH}/${env.WA_PHONE_ID}/media`, { method: "POST", headers: { "Authorization": "Bearer " + env.WA_TOKEN }, body: fd });
    const j = await r.json();
    if (!j.id) { console.log("media upload failed", JSON.stringify(j)); return ""; }
    await db.put(k, j.id, 20 * 86400); return j.id;
  } catch (e) { console.log("media failed", String(e)); return ""; }
}
async function readBook(S, bid, v, env, db, log){
  if (!(PAGES[bid] || {})[v]) return;
  const name = `${book(bid).name} – ${v === "g" ? "גרסת בת" : "גרסת בן"}`, link = `${SITE}/order/books/pdf/${bid}-${v}.pdf`;
  const filename = name.replace(/\//g, "-").replace(/[\\:*?"<>|]/g, "") + ".pdf";
  const mid = log ? "" : await mediaId(env, db, bid + "-" + v, link, filename);
  await S({ type: "document", document: Object.assign(mid ? { id: mid } : { link }, { filename, caption: `📖 ספר לדוגמה: "${name}"\nלוחצים על הקובץ כדי לקרוא – ובינתיים ממשיכים כאן 👇` }) });
  if (!log) await new Promise(r => setTimeout(r, mid ? 3000 : 7000));
}
const ils = n => n.toLocaleString("en-US") + " ₪";
const tier = n => { let t = TIERS[0]; TIERS.forEach(r => { if (n >= r[0]) t = r; }); return t; };
const priceOf = (n, cov) => tier(n)[cov === "soft" ? 1 : 2];                 /* פרטי: קשה (ברירת מחדל) או רכה */
/* מחיר הזמנה פרטית: כל ספר לפי הכריכה שלו, במדרגה של כמות הספרים הכוללת */
const orderTotal = covs => covs.reduce((t, c) => t + priceOf(covs.length, c), 0);
const orderSave = covs => covs.reduce((t, c) => t + priceOf(1, c), 0) - orderTotal(covs);
const priceLine = covs => { const n = covs.length, t = orderTotal(covs), s = orderSave(covs); return `${n === 1 ? "ספר אחד" : n + " ספרים"}: ${ils(t)}${s > 0 ? ` (חוסכים ${ils(s)})` : ""}`; };
const COVERS = { staple: "💜 חוברת כרומו סיכות", soft: "💛 כריכה רכה פיג'מה", hard: "💗 כריכה קשה פרימיום" };
const COVER_INFO = { hard: "21×21 ס״מ, בסגנון אלבום, דפים כרומו 170 ג׳", soft: "כמו ספריית פיג'מה – 20×20 ס״מ, כרוך בהדבקה, כריכה כרומו 300 ג׳, דפים כרומו 170 ג׳", staple: "20×20 ס״מ, בסגנון מגזין, כרוך בסיכות, כריכה ודפים כרומו 170 ג׳ מבריק" };
const VIDEO_COVERS = "https://youtu.be/sGODE7ehbMY", VIDEO_PHOTO = "https://youtu.be/Fk42FO0TDmg";
/* הנחיות לתמונה (מהמדריך של שמש) */
const PHOTO_TIPS = "📸 *תמונה טובה = איור טוב:*\n🔵 ילד/ה אחד/ת בלבד – בלי אנשים או חיות, גם לא ברקע\n🔴 מבט ישיר למצלמה – לא הצידה ולא מלמעלה\n🟠 פנים גלויות – בלי כובע, משקפי שמש, סרטים, כתרים או פלסטרים\n🟢 בנים עם כיפה – שהכיפה תופיע בתמונה\n🟣 בנות – התסרוקת באיור תהיה כמו בתמונה\n⚪ אם מצלמים במיוחד – רקע לבן וחולצה לבנה\n😀 והכי חשוב – חיוך!";
/* "כל מה שחשוב לדעת" (מהמדריך של שמש) */
const KNOW = "📋 *כל מה שחשוב לדעת*\n\n✂️ *אין צורך לערוך שום דבר* – שולחים תמונה, שם והקדשה, ומקבלים ספר מושלם.\n\n🤖 *בינה מלאכותית:* בינה מלאכותית אינה מצלמה – גם כשהדמיון גבוה מאוד (עד 99%), ייתכנו הבדלים קלים במראה או בפרופורציות. *כל ספר עובר בדיקה אנושית*, איור אחר איור, לפני ההדפסה.\n\n🔍 *לפני ההדפסה* נשלח לכם את הספר לאישור – בודקים שהשמות נכונים ושאין שגיאות בהקדשה. האישור נועד לבדיקת הפרטים, לא לסבבי תיקונים בדמות.\n\n📦 *מידות:* כריכה רכה 20×20 ס״מ · כריכה קשה 21×21 ס״מ. הספרים מגיעים בלי אריזה אישית – הכי יפה לארוז בצלופן ובסרט 🎀\n\n⏱️ *אספקה:* משלוח צ'יטה עד 14 ימי עסקים מאישור ההדפסה · איסוף עצמי מבית הדפוס (ליד עפולה) בתיאום, כשבוע מאישור ההדפסה.";
/* עמוד הגנים – תשובות מוכנות עם קישור, וחוזרים לאותה שאלה */
const PAGE = SITE + "/kindergartens/";
const FAQ = {
  photo: ["📸 איך בוחרים תמונה טובה (סרטון)", VIDEO_PHOTO, "📸 תמונה טובה"],
  cover: ["📕 ההבדל בין הכריכות (סרטון)", VIDEO_COVERS, "📕 ההבדל בין הכריכות"],
  know: ["📋 כל מה שחשוב לדעת", "", "📋 כל מה שחשוב לדעת"],
  guide: ["🎬 סרטון הסבר קצר של שמש", PAGE + "#guide", "🎬 סרטון הסבר"],
  price: ["💰 מחירים", "", "💰 מחירים"],
  faq: ["❓ עוד שאלות ותשובות", PAGE + "#faq", "❓ עוד שאלות"]
};
const PAYS = { bank: "🏦 העברה בנקאית", bit: "📱 ביט", paybox: "📱 פייבוקס", card: "💳 אשראי (בתיאום)" };
/* תשובות מוכנות – רק מתוך ההודעות והמדריך של שמש. מה שלא כאן – עובר לשמש */
const QA = {
  pay: { re: /תשלום|לשלם|משלמים|ביט|פייבוקס|העברה בנקאית|אשראי/, a: st => st.mode === "gan" ? "💳 *תשלום:* התשלום מתבצע מראש, לפני תחילת עריכת הספרים – בהעברה בנקאית, ביט, פייבוקס, או אשראי בתיאום. בסוף ההזמנה בוחרים את הדרך הנוחה, ושמש שולחת את הפרטים." : "💳 *תשלום:* קודם רואים את כל הספר הדיגיטלי, ומשלמים רק אם אוהבים ❤️ – בהעברה בנקאית, ביט, פייבוקס, או אשראי בתיאום. בסוף ההזמנה בוחרים את הדרך הנוחה, ושמש שולחת את הפרטים." },
  time: { re: /כמה זמן|מתי (זה )?(מגיע|מוכן|יהיה)|זמן אספקה|זמני אספקה|עריכה|תוך כמה/, a: st => "⏱️ *זמנים:* " + (st.mode === "gan" ? "עריכה עד 3 ימי עסקים מהתשלום. " : "") + "אחרי שמאשרים הדפסה – משלוח צ'יטה עד 14 ימי עסקים, או איסוף עצמי מבית הדפוס (ליד עפולה) בתיאום, כשבוע מאישור ההדפסה." },
  ship: { re: /משלוח|איסוף|לאסוף|עפולה|צ'יטה|שליח/, a: () => "📦 *משלוח או איסוף:* 🚚 משלוח צ'יטה עד הבית – 40 ₪, עד 14 ימי עסקים מאישור ההדפסה. 🚗 איסוף עצמי מבית הדפוס (ליד עפולה) – בלי עלות, בתיאום, כשבוע מאישור ההדפסה. בוחרים בסוף ההזמנה." },
  ded: { re: /הקדש/, a: st => st.mode === "gan" ? "💌 *הקדשה:* הקדשה אחת לכל ילדי הגן, עד 350 תווים, *בלי שם הילד* (השם כבר בספר). אפשר אחת לבנים ואחת לבנות. אפשר לבחור הקדשה מוכנה או לכתוב לבד." : "💌 *הקדשה:* מציעים לכם הקדשה מוכנה (אפשר לבקש אחרת), או כותבים לבד – עד 300 תווים בערך." },
  names: { re: /אותו שם|שם זהה|שני ילדים עם|שמות זהים/, a: () => "👯 *שני ילדים עם אותו שם:* כותבים בכיתוב של התמונה \"יוסי 1\", \"יוסי 2\" – וכך לא מתבלבלים." },
  ai: { re: /בינה מלאכותית|\bAI\b|דומה|דמיון|איור/, a: () => "🤖 *האיורים:* בינה מלאכותית אינה מצלמה – גם כשהדמיון גבוה מאוד (עד 99%), ייתכנו הבדלים קלים במראה או בפרופורציות. *כל ספר עובר בדיקה אנושית*, איור אחר איור, לפני ההדפסה." },
  check: { re: /אישור הדפסה|סקיצ|לבדוק|תיקון|תיקונים|לשנות/, a: () => "🔍 *לפני ההדפסה* נשלח לכם את הספר לאישור – בודקים שכל הילדים נמצאים, שהשמות נכונים ושאין שגיאות בהקדשה. האישור נועד לבדיקת הפרטים, לא לסבבי תיקונים בדמות. טעות שלנו – מתוקנת מיד." },
  size: { re: /מידות|גודל|אריזה|לארוז|מידה/, a: () => "📦 *מידות:* כריכה רכה 20×20 ס״מ · כריכה קשה 21×21 ס״מ. הספרים מגיעים בלי אריזה אישית – הכי יפה לארוז בצלופן שקוף ובסרט 🎀" },
  edit: { re: /לערוך|עריכה של|צריך לעשות/, a: () => "✂️ *אין צורך לערוך שום דבר!* שולחים תמונה, שם והקדשה – ומקבלים ספר מושלם." },
  extra: { re: /ספרים נוספים|עוד ספרים במהלך|קופון|GANIM50|הנחה/i, a: st => st.mode === "gan" ? "🎁 *ספרים נוספים במהלך השנה:* כל גן מקבל קופון *GANIM50* – 50 ₪ הנחה לכל הזמנה, בתוקף לשנה. ו🌱 *גן מביא גן:* כל גן שיגיע דרככם ויסגור הזמנה – 50 ₪ הנחה או זיכוי." : "💰 ככל שמזמינים יותר ספרים – המחיר של כל ספר יורד. כתבו \"כמה זה עולה\" ותקבלו את המחירים." }
};
const qaOf = t => { for (const k of Object.keys(QA)) if (QA[k].re.test(t)) return k; return ""; };
const QA_BTNS = [["qa:go", "▶️ ממשיכים"], ["human", "🙋 לא עזר – לשמש"]];
const looksQuestion = t => /\?|^(מה|איך|כמה|למה|מתי|האם|אפשר|יש|איפה|מי|באיזה|באיזו|למי|רציתי לשאול|שאלה)[\s,]/.test(t);
/* שלבים שבהם כל טקסט הוא שאלה (אין שם תשובה בכתב) */
const BTN_STEPS = ["hi", "for", "book", "ver", "cover", "picsmore", "more", "ship", "phone", "pay", "consent", "g-book", "g-book2", "g-cover", "g-check", "g-consent"];
/* מייל לשמש: לקוחה צריכה אותך (דרך הקוד בגוגל) */
async function alertOwner(env, st, from, why, q){
  await drivePost(env, { action: "alert", order: st.oid || "", who: st.who || st.profile || "", phone: from, why, q: q || "", step: st.step || "" });
}
const faqMsg = k => `${FAQ[k][0]} – לוחצים על הקישור, ובסוף חוזרים לכאן:\n${FAQ[k][1]}`;
function faqOf(t){
  if (/^(שאלות|שאלה|\?|❓)$/.test(t)) return "menu";
  if (/תמונה טובה|איזו תמונה|איך לצלם|איך מצלמים|תמונה מתאימה/.test(t)) return "photo";
  if (/כריכ/.test(t) && /הבדל|מה|איזו|איזה|\?/.test(t)) return "cover";
  if (/מה (צריך|חשוב) לדעת|בינה מלאכותית|\bAI\b|מידות|גודל הספר|אריזה|זמן אספקה|זמני אספקה|כמה זמן|מתי (זה )?מגיע|איסוף|משלוח/.test(t)) return "know";
  if (/סרטון/.test(t)) return "guide";
  if (/מחיר|כמה (זה )?עולה|עלות/.test(t)) return "price";
  return "";
}
const ganP = (c, n) => c === "staple" ? (n >= STAPLE.from ? STAPLE.p : 0) : c === "soft" ? tier(n)[1] : tier(n)[2];

/* ===== מילים לפי מי מזמין ===== */
const isP = st => st.role === "p";
const kidW = (st, c) => isP(st) ? (c.ver === "g" ? "ילדה" : "ילד") : (c.ver === "g" ? "נכדה" : "נכד");
const sign = st => isP(st) ? "אמא ואבא" : "סבא וסבתא";

function dedIdeas(g, st){
  const f = (m, w) => g ? w : m, P = isP(st), S = sign(st);
  const to = P ? f(["לבן האהוב", "לבן היקר", "לבן המתוק"], ["לבת האהובה", "לבת היקרה", "לבת המתוקה"]) : f(["לנכד האהוב", "לנכד היקר", "לנכד המתוק"], ["לנכדה האהובה", "לנכדה היקרה", "לנכדה המתוקה"]);
  return [
    `${to[0]} שלנו,\nהספר הזה נכתב בשבילך, כי ${f("אתה הגיבור", "את הגיבורה")} של הלב שלנו. ${f("שתמיד תגדל", "שתמיד תגדלי")} עם חיוך גדול, סקרנות ואומץ, ${f("ותדע שאתה יכול", "ותדעי שאת יכולה")} להגשים כל חלום שרק ${f("תרצה", "תרצי")}. בכל פעם ${f("שתפתח", "שתפתחי")} את הספר – ${f("תזכור", "תזכרי")} כמה אנחנו גאים בך ואוהבים אותך, היום, מחר ובכל יום. שהספר הזה ילווה אותך בחום ובאהבה.\nבאהבה גדולה, ${S} ❤️`,
    `${to[1]} שלנו,\nמהיום שנולדת העולם שלנו נעשה צבעוני ושמח יותר. אנחנו מאחלים לך לב טוב, חברים אמיתיים והמון הרפתקאות מופלאות. ${f("זכור", "זכרי")} תמיד ${f("שאתה מיוחד, שאתה אהוב", "שאת מיוחדת, שאת אהובה")}, ושאנחנו תמיד כאן בשבילך – לחבק, להקשיב, לצחוק ולשמוח איתך בכל רגע. העולם מחכה לך – ${f("צא", "צאי")} לגלות אותו.\nאוהבים אותך עד השמיים, ${S} ❤️`,
    `${to[2]} שלנו,\nהספר הזה הוא מתנה קטנה עם אהבה ענקית. ${f("שתמיד תאמין", "שתמיד תאמיני")} בעצמך, ${f("תצחק", "תצחקי")} הרבה, ${f("תשאל", "תשאלי")} שאלות ${f("ותגלה", "ותגלי")} כל יום משהו חדש ומרגש. ${f("כשתקרא", "כשתקראי")} בו – ${f("תדע", "תדעי")} שבכל עמוד מחכה לך חיבוק חם מאיתנו. אנחנו כל כך גאים בך, ונמשיך לאהוב אותך תמיד, בכל גיל ובכל מקום. ${f("תהיה שמח ובריא", "תהיי שמחה ובריאה")}!\n${S} ❤️`
  ];
}
function ganDed(st){
  const g = st.g.name || "הגן";
  return [
    `ילדים יקרים,\nהשנה בגן הייתם גיבורים אמיתיים – למדתם, שיחקתם, צחקתם וגדלתם יחד. שהספר הזה יזכיר לכם תמיד כמה אתם מיוחדים, כמה אתם אהובים, וכמה כיף היה לנו איתכם. המשיכו לחלום בגדול, לשאול שאלות ולשמור על הלב הטוב שלכם.\nבאהבה, צוות ${g} ❤️`,
    `לילדי ${g} האהובים,\nכל יום איתכם הוא הרפתקה – מלא צחוק, סקרנות וחיבוקים. הספר הזה הוא מזכרת קטנה מהשנה המיוחדת שלנו יחד. תזכרו שאתם יכולים להגשים כל חלום, ושתמיד יש מי שמאמין בכם.\nאוהבים, הגננות ❤️`,
    `לילדים המתוקים שלנו,\nשתמיד תאמינו בעצמכם, תהיו חברים טובים ותשמחו בכל דבר קטן. היה לנו לכבוד ללוות אתכם השנה ולראות אתכם גדלים. בכל פעם שתפתחו את הספר – תזכרו כמה אנחנו גאים בכם.\nצוות ${g} ❤️`
  ];
}
const CONSENT_LINKS = "לקריאה (נפתח בדפדפן):\n📄 התקנון: https://www.booqli.ai/he/terms-of-service\n🔒 מדיניות הפרטיות: https://www.booqli.ai/he/privacy-policy\n\n";
const CONSENT = CONSENT_LINKS + "בלחיצה על הכפתור למטה אני מאשר/ת:\n☑️ קראתי את התקנון ואת מדיניות הפרטיות.\n☑️ אני ההורה, או שקיבלתי אישור מההורים, לשלוח ל-BOOQLI את התמונות של הילדים – כל תמונה ששלחתי או שאשלח כאן, עכשיו או בהמשך (גם לספר נוסף, או במקום תמונה שלא מתאימה) – כדי ליצור מהן איורים לספר.";
const CONSENT_GAN = CONSENT_LINKS + "בלחיצה על הכפתור למטה אני מאשרת:\n☑️ קראתי את התקנון ואת מדיניות הפרטיות.\n☑️ קיבלנו אישור מההורים של כל הילדים לשלוח ל-BOOQLI את התמונות של הילדים – כל תמונה ששלחתי או שאשלח כאן, עכשיו או בהמשך (גם לספר נוסף, או במקום תמונה שלא מתאימה) – כדי ליצור מהן איורים לספר.";
const HUMAN_TXT = /בן אדם|בנאדם|נציג|אדם אמיתי|אדם אנושי/;
const RESUME_TXT = /^(להמשיך|ממשיכים|נמשיך|המשך)( בהזמנה)?[.!]?$/;               /* הלקוח */
const OWNER_RESUME = /להמשיך בהזמנה|נמשיך בהזמנה|ממשיכים בהזמנה|#בוט/;          /* שמש, מהאפליקציה */
const RESUME_BTN = [["resume", "▶️ להמשיך בהזמנה"]];
const SHIP_TXT = "איך הספרים יגיעו אליכם? 📦\n\n🚚 *משלוח צ'יטה עד הבית* – 40 ₪, עד 14 ימי עסקים מאישור ההדפסה\n🚗 *איסוף עצמי* מבית הדפוס (ליד עפולה) – בלי עלות, בתיאום, כשבוע מאישור ההדפסה";
const fmtPhone = n => String(n || "").replace(/^972/, "0").replace(/^(\d{3})(\d{3})(\d+)$/, "$1-$2-$3");
const shipLine = st => st.ship && st.ship.method === "pickup" ? "🚗 איסוף עצמי מבית הדפוס (ליד עפולה), בתיאום" : st.ship && st.ship.method === "ship" ? `🚚 משלוח צ'יטה עד הבית – ${ils(SHIP)}\n📍 ${st.ship.addr}\n📞 ${st.ship.phone}` : "";
const shipCost = st => st.ship && st.ship.method === "pickup" ? 0 : SHIP;
async function resume(env, to, st, log, db, who){                           /* חוזרים בדיוק לשאלה שעצרו בה */
  st.human = 0; st.burst = 0;
  if (st.step === "done") return;
  await wa(env, to, text(who === "owner" ? "ממשיכים בהזמנה מאיפה שעצרנו 👇" : "מעולה, ממשיכים מאיפה שעצרנו 👇"), log);
  await ask(env, to, st, log, db);
}
const HI = "שלום ❤️ כאן סבאבוקלי מבוקלי!\nאני אעזור לכם להזמין ספר אישי שבו הילד/ה, הנכד/ה – או כל ילדי הגן – הם הגיבורים – כתוב ע\"י שמש צור, מנוקד ובחרוזים, מודפס באיכות גבוהה ומגיע עד הבית.\n\n👀 אדם אמיתי משגיח על כל התהליך.\n🙋 רוצים לדבר עם בן אדם? תמיד אפשר לחזור להודעה הזאת וללחוץ על הכפתור למטה – או פשוט לכתוב \"בן אדם\".\n❓ יש שאלה? כתבו \"שאלות\" בכל שלב.";

/* ===== שליחה לוואטסאפ ===== */
const HUMAN = { type: "reply", reply: { id: "human", title: "🙋 לדבר עם בן אדם" } };
async function wa(env, to, msg, log){
  const body = Object.assign({ messaging_product: "whatsapp", to }, msg);
  if (log) { log.push(body); return; }                       /* בבדיקות – רק רושמים */
  const r = await fetch(`${GRAPH}/${env.WA_PHONE_ID}/messages`, { method: "POST", headers: { "Authorization": "Bearer " + env.WA_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) console.log("wa send failed", r.status, await r.text());
}
const text = t => ({ type: "text", text: { body: t } });
const buttons = (t, bs) => ({ type: "interactive", interactive: { type: "button", body: { text: t.slice(0, 1024) }, action: { buttons: bs.slice(0, 3).map(b => b.type ? b : { type: "reply", reply: { id: b[0], title: b[1] } }) } } });
const list = (t, btn, rows, title) => ({ type: "interactive", interactive: { type: "list", body: { text: t }, action: { button: btn, sections: [{ title: title || "ספרים", rows }] } } });
const image = (link, caption) => ({ type: "image", image: { link, caption } });
async function sendLong(S, t){ for (let i = 0; i < t.length; i += 3900) await S(text(t.slice(i, i + 3900))); }

/* ===== אחסון: KV אמיתי, או זיכרון בבדיקות ===== */
function store(env, mem){
  if (mem) return {
    get: async k => mem[k] ?? null, put: async (k, v) => { mem[k] = v; }, del: async k => { delete mem[k]; },
    list: async p => Object.keys(mem).filter(k => k.startsWith(p)).sort()
  };
  return {
    get: k => env.STATE.get(k), put: (k, v, ttl) => env.STATE.put(k, v, { expirationTtl: ttl || 30 * 86400 }), del: k => env.STATE.delete(k),
    list: async p => { const out = []; let cursor; do { const r = await env.STATE.list({ prefix: p, cursor }); r.keys.forEach(x => out.push(x.name)); cursor = r.list_complete ? null : r.cursor; } while (cursor); return out.sort(); }
  };
}

/* ===== המסלול ===== */
const fresh = () => ({ book: "", ver: "", name: "", ded: "", dedI: 0, cover: "", pics: [] });
const newId = p => p + "-" + String(1000 + Math.floor(Math.random() * 9000));
const bookRows = (page, prefix) => {
  const part = page ? BOOKS.slice(9) : BOOKS.slice(0, 9);
  const rows = part.map(b => ({ id: prefix + b.id, title: b.name.slice(0, 24) }));
  rows.push(page ? { id: "page:0", title: "⬅️ לספרים הקודמים" } : { id: "page:1", title: "➡️ עוד ספרים" });
  return rows;
};
async function ganPics(db, st){                               /* תמונות הגן – כל תמונה במפתח משלה (כמה תמונות באותו רגע) */
  const keys = await db.list("gp:" + st.oid + ":"), out = { b: [], g: [], nameless: 0, by: {} };
  for (const k of keys) {
    const v = JSON.parse(await db.get(k) || "{}"), girl = v.sub === "בנות", key = (v.book || "") + "|" + v.sub;
    (girl ? out.g : out.b).push(v.name); (out.by[key] = out.by[key] || { names: [], nameless: 0 }).names.push(v.name);
    if (v.name === "ללא שם") { out.nameless++; out.by[key].nameless++; }
  }
  return out;
}
/* סבבי התמונות בגן: לכל נושא – בנים ואז בנות (נושא אחד = 2 סבבים, שני נושאים = 4) */
const rounds = G => G.books.flatMap(b => [[b, "בנים"], [b, "בנות"]]);
const roundName = (G, r) => { const [b, sub] = rounds(G)[r]; return (G.books.length > 1 ? `"${book(b).name}" – ` : "") + sub; };
const realNames = a => [...new Set(a.filter(x => x !== "ללא שם"))];
const names = a => [...new Set(a)].join(", ");
const cnt = (n, one, many) => n === 1 ? one : n + " " + many;

async function ask(env, to, st, log, db){
  const c = st.cur, n = st.list.length, G = st.g;
  const S = m => wa(env, to, withRestart(m, st.step), log);
  switch (st.step) {
    case "hi": return S(buttons(HI, [["s:go", "❤️ ספר לילד או לנכד"], ["s:gan", "🏫 הזמנה לגן"], HUMAN]));
    case "for": return S(buttons("למי הספר? ❤️", [["f:g", "👵 לנכד/ה שלי"], ["f:p", "👩 לילד/ה שלי"]]));
    case "book": if (!st.intro) { st.intro = 1; await S(text(BOOKS_INTRO)); }
      return S(list(`${n ? "איזה ספר לילד/ה הבא/ה?" : "איזה ספר תרצו?"}\nלוחצים על "בוחרים ספר" ובוחרים מהרשימה.`, "בוחרים ספר", bookRows(st.page || 0, "b:"), st.page ? "עוד ספרים" : "הספרים"));
    case "ver": {
      const b = book(c.book);
      if (b.img && !PAGES[b.id] && !st.reread) await S(image(b.img, b.name));   /* לספר בלי דוגמה – תמונת כריכה */
      st.reread = 0;
      return S(buttons(`"${b.name}" – בשביל בן או בת?${PAGES[b.id] ? "\n(מיד אחר כך נשלח לכם ספר לדוגמה 📖)" : ""}`, [["v:b", "👦 בן"], ["v:g", "👧 בת"]]));
    }
    case "name": return S(text(`✍️ מה השם הפרטי של ה${kidW(st, c)}?\nכותבים אותו כאן למטה, בהודעה רגילה 👇\n\nזה השם שבו ${c.ver === "g" ? `ה${kidW(st, c)} תיקרא` : `ה${kidW(st, c)} ייקרא`} לאורך כל הסיפור.`));
    case "ded": {
      if (!c.ded) c.ded = dedIdeas(c.ver === "g", st)[0];
      return S(buttons(`הקדשה מכם ל${c.name} ❤️\n\n${c.ded}`, [["d:ok", "✅ מאשרים"], ["d:next", "✨ הקדשה אחרת"], ["d:own", "✍️ אכתוב בעצמי"]]));
    }
    case "dedown": return S(text("כתבו כאן את ההקדשה שלכם ❤️ (עד 300 תווים בערך)"));
    case "cover": {
      const covs = st.list.map(x => x.cover), m = covs.length + 1;
      const pr = k => orderTotal(covs.concat(k)) - orderTotal(covs);           /* כמה הספר הזה מוסיף */
      return S(buttons(`איזו כריכה ל"${book(c.book).name}"?\n\n${COVERS.hard} – ${COVER_INFO.hard}\n${COVERS.soft} – ${COVER_INFO.soft}\n\n🎬 סרטון של הכריכות: ${VIDEO_COVERS}\n\n${m === 1 ? "המחיר לספר אחד" : "המחיר לספר הזה (כשיש " + m + " ספרים בהזמנה)"}: קשה ${ils(priceOf(m, "hard"))} · רכה ${ils(priceOf(m, "soft"))}`,
        [["cv:hard", `💗 קשה – ${ils(priceOf(m, "hard"))}`], ["cv:soft", `💛 רכה – ${ils(priceOf(m, "soft"))}`], ["q:cover", "❓ מה ההבדל?"]]));
    }
    case "pics": return S(text(`עכשיו שולחים כאן תמונה של ${c.name} 📷\nאפשר כמה תמונות (עד ${PICS}) – ואנחנו נבחר את הטובה ביותר.\n\n${PHOTO_TIPS}\n\n🎬 סרטון קצר – איך בוחרים תמונה טובה: ${VIDEO_PHOTO}`));
    case "picsmore": return S(buttons(`קיבלנו ${c.pics.length === 1 ? "תמונה אחת" : c.pics.length + " תמונות"} ✓\nאפשר לשלוח עוד, או להמשיך.`, [["p:done", "✅ סיימתי תמונות"]]));
    case "who": return S(st.profile
      ? buttons(`לרשום את ההזמנה על השם "${st.profile}"?`, [["w:yes", "✅ כן"], ["w:other", "✍️ שם אחר"]])
      : text("ואיך קוראים לך? 🙂"));
    case "whoown": return S(text("איך לרשום את השם שלך? 🙂"));
    case "more": {
      const covs = st.list.map(x => x.cover).concat(c.cover || "hard"), m = covs.length;
      let t = `כל הכבוד! 🎉 רוצים ספר גם לילד/ה נוסף/ת? (אח, אחות, בן דוד, חברה…)\n\n❤️ עכשיו – ${priceLine(covs)}`;
      if (m < MAX && priceOf(m + 1, "hard") < priceOf(m, "hard")) t += `\n➕ עם עוד ספר – ${priceLine(covs.concat(c.cover || "hard"))}`;
      t += `\n🚚 + משלוח עד הבית ${ils(SHIP)} (או איסוף עצמי בלי עלות)\n\nככל שמוסיפים ספרים – המחיר של כל ספר יורד.`;
      return S(buttons(t, m < MAX ? [["m:yes", "➕ כן, עוד ספר"], ["m:no", "✅ לא, זהו"]] : [["m:no", "✅ זהו"]]));
    }
    case "consent": return S(buttons("לפני שנתחיל להכין ❤️\n\n" + CONSENT, [["c:yes", "☑️ קראתי ומאשר/ת"]]));
    case "ship": return S(buttons(SHIP_TXT, [["sh:ship", "🚚 משלוח – 40 ₪"], ["sh:pickup", "🚗 איסוף עצמי"]]));
    case "addr": return S(text("לאיזו כתובת לשלוח? 📍\nכותבים עיר, רחוב ומספר (ואם צריך – קומה ודירה)."));
    case "phone": return S(buttons(`📞 לאיזה טלפון השליח יתקשר? ${fmtPhone(st.from)}?`, [["ph:yes", "✅ כן, למספר הזה"], ["ph:other", "✍️ מספר אחר"]]));
    case "phoneown": return S(text("כתבו את מספר הטלפון לשליח 📞"));
    case "pay": return S(list(`${st.mode === "gan" ? "💳 התשלום מתבצע מראש, לפני תחילת עריכת הספרים." : "💳 קודם רואים את כל הספר, ומשלמים רק אם אוהבים ❤️"}\n\nבאיזו דרך נוח לך לשלם? שמש תשלח לך את הפרטים.`, "בוחרים דרך תשלום", Object.keys(PAYS).map(k => ({ id: "pay:" + k, title: PAYS[k] })), "תשלום"));

    /* ---- גן ---- */
    case "g-name": return S(text("איזה כיף! 🏫 איך קוראים לגן? (ובאיזו עיר)"));
    case "g-teacher": return S(text("ואיך קוראים לך? 🙂"));
    case "g-kids": return S(text("כמה ילדים בגן? (כותבים מספר)"));
    case "g-book": if (!st.intro) { st.intro = 1; await S(text(BOOKS_INTRO)); }
      return S(list(`${G.books.length ? "איזה נושא נוסף?" : "איזה ספר לגן? 📚"}\nלוחצים על "בוחרים ספר" ובוחרים מהרשימה.`, "בוחרים ספר", bookRows(st.page || 0, "gb:"), st.page ? "עוד ספרים" : "הספרים"));
    case "g-book2": {
      const bs = [["g:one", "✅ נושא אחד מספיק"], ["g:more", "➕ עוד נושא"]];
      
      return S(buttons(`בחרתם: ${G.books.map(id => book(id).name).join(" + ")} ✓\nרוצים נושא נוסף לחלק מהילדים? (עד ${GANBOOKS} נושאים)`, bs));
    }
    case "g-cover": {
      const ks = ["hard", "soft"].concat(G.kids >= STAPLE.from ? ["staple"] : []);
      const lines = ks.map(k => `${COVERS[k]} – ${COVER_INFO[k]}`).join("\n");
      return S(buttons(`איזו כריכה לספרים של הגן?\n\n${lines}${G.kids < STAPLE.from ? "\n(חוברת כרומו סיכות – מ-20 ספרים)" : ""}\n\n🎬 סרטון של שלוש הכריכות: ${VIDEO_COVERS}`,
        ks.map(k => ["c:" + k, { hard: "💗 קשה פרימיום", soft: "💛 רכה פיג'מה", staple: "💜 כרומו סיכות" }[k]])));
    }
    case "g-ded": {
      if (!G.ded) G.ded = ganDed(st)[0];
      return S(buttons(`הקדשה מהגן לכל הילדים ❤️\n(בלי שמות – השם של כל ילד כבר בספר)\n\n${G.ded}`, [["gd:ok", "✅ מאשרים"], ["gd:next", "✨ הקדשה אחרת"], ["gd:own", "✍️ אכתוב בעצמי"]]));
    }
    case "g-dedown": return S(text("כתבו כאן את ההקדשה של הגן ❤️ (עד 350 תווים בערך)\nרוצים אחת לבנים ואחת לבנות? כתבו את שתיהן, אחת אחרי השנייה."));
    case "g-pics": {
      const R = rounds(G), [b, sub] = R[G.r || 0], two = G.books.length > 1, boys = sub === "בנים";
      const tip = G.r ? "" : `\n\n${PHOTO_TIPS}\n\n👯 שני ילדים עם אותו שם? כותבים בכיתוב "יוסי 1", "יוסי 2".\n🎬 סרטון קצר – איך בוחרים תמונה טובה: ${VIDEO_PHOTO}`;
      const order = two && !G.r ? `נעבור לפי הסדר:\n${R.map((x, i) => `${i + 1}. ${book(x[0]).name} – ${x[1]}`).join("\n")}\n\n` : "";
      return S(text(`${G.r ? "" : "עכשיו התמונות 📷\n"}${order}${two ? `*${book(b).name}* – ` : ""}${boys ? "*הבנים*: מעבירים לכאן תמונה של כל ילד" : "*הבנות*: מעבירים לכאן תמונה של כל ילדה"}${two ? ` שמקבל${boys ? "" : "ת"} את הספר הזה` : ""}, ובכיתוב של התמונה – *${boys ? "השם שלו" : "השם שלה"}*.${G.r ? "" : "\nאפשר כמה תמונות לאותו ילד – נבחר את הטובה."}${tip}`));
    }
    case "g-picsmore": {
      const P = await ganPics(db, st), [b, sub] = rounds(G)[G.r || 0], cur = P.by[b + "|" + sub] || { names: [], nameless: 0 }, nl = cur.nameless;
      const warn = nl ? `\n⚠️ ${nl === 1 ? "תמונה אחת הגיעה" : nl + " תמונות הגיעו"} בלי שם – שלחו ${nl === 1 ? "אותה" : "אותן"} שוב, עם השם בכיתוב 🙏` : "";
      const bs = [["g:rdone", sub === "בנים" ? "✅ סיימנו בנים" : "✅ סיימנו בנות"], ["g:pause", "⏸️ נמשיך מחר"]];
      if (!G.r) bs.push(["g:drive", "📁 אעדיף דרייב"]);
      return S(buttons(`${roundName(G, G.r || 0)}: קיבלנו ${cnt(cur.names.length, "תמונה אחת", "תמונות")} – ${names(cur.names.filter(x => x !== "ללא שם")) || "—"} ✓${warn}\nממשיכים לשלוח, או:`, bs));
    }
    case "g-check": {
      const P = await ganPics(db, st), nb = new Set(realNames(P.b)), ng = new Set(realNames(P.g)), miss = G.kids - nb.size - ng.size;
      const lines = rounds(G).map(([b, sub], i) => { const nm = realNames((P.by[b + "|" + sub] || { names: [] }).names); return `${sub === "בנים" ? "👦" : "👧"} ${roundName(G, i)} (${nm.length}): ${nm.join(", ") || "—"}`; }).join("\n");
      return S(buttons(`בודקים יחד 👀\n\n${lines}\n\n${miss > 0 ? `⚠️ חסרות עוד ${miss} תמונות לפי מספר הילדים (${G.kids})` : "✓ יש תמונה לכל הילדים"}${P.nameless ? `\n⚠️ ${cnt(P.nameless, "תמונה אחת", "תמונות")} בלי שם` : ""}`,
        [["g:ok", "✅ הכל נכון"], ["g:morepics", "📷 עוד תמונות"], ["human", "✏️ לתקן משהו"]]));
    }
    case "g-consent": return S(buttons("לפני שנתחיל להכין ❤️\n\n" + CONSENT_GAN, [["gc:yes", "☑️ קראתי ומאשרת"]]));
  }
}

function summary(st, links){
  const covs = st.list.map(c => c.cover), n = covs.length, t = orderTotal(covs);
  const lines = st.list.map((c, i) => `❤️ *ספר ${i + 1}: ${book(c.book).name}* (${kidW(st, c)})\n📕 ${COVERS[c.cover || "hard"]}\n👤 שם: *${c.name}*\n✍️ הקדשה: ${c.ded}\n📷 ${c.pics.length} ${c.pics.length === 1 ? "תמונה" : "תמונות"}${links && c.pics.some(p => p.link) ? ":\n" + c.pics.filter(p => p.link).map(p => p.link).join("\n") : ""}`);
  return `📋 *סיכום הזמנה ${st.oid}*\n👤 המזמין/ה: ${st.who} (${isP(st) ? "הורה" : "סבא/סבתא"})\n\n${lines.join("\n\n")}\n\n💰 ${priceLine(covs)}\n${shipLine(st) || "🚚 משלוח עד הבית " + ils(SHIP)}\n*סה"כ ${ils(t + shipCost(st))}*${st.pay ? "\n💳 תשלום: " + PAYS[st.pay] : ""}\n\n✓ אישור ההורים לתמונות – התקבל`;
}
async function ganSummary(st, db, owner){
  const G = st.g, P = await ganPics(db, st), p = ganP(G.cover, G.kids);
  const nb = realNames(P.b), ng = realNames(P.g);
  const lines = rounds(G).map(([b, sub], i) => `${sub === "בנים" ? "👦" : "👧"} ${roundName(G, i)}: ${realNames((P.by[b + "|" + sub] || { names: [] }).names).join(", ") || "—"}`).join("\n");
  return `📋 *סיכום הזמנה ${st.oid}*\n🏫 ${G.name} · הגננת: ${st.who}\n📚 ${G.books.map(id => book(id).name).join(" + ")}\n📕 ${COVERS[G.cover]}\n👧👦 ${G.kids} ספרים · ${cnt(nb.length, "בן אחד", "בנים")}, ${cnt(ng.length, "בת אחת", "בנות")}\n\n${lines}${P.nameless ? `\n⚠️ ${cnt(P.nameless, "תמונה אחת", "תמונות")} בלי שם` : ""}\n\n✍️ הקדשה: ${G.ded}${shipLine(st) ? "\n\n" + shipLine(st) : ""}${st.pay ? "\n💳 תשלום: " + PAYS[st.pay] : ""}${owner ? `\n\n💰 לפי המחירון: ${G.kids} × ${p} ₪ = ${ils(G.kids * p)}${shipCost(st) ? " + משלוח " + ils(SHIP) : ""} = ${ils(G.kids * p + shipCost(st))}` : ""}\n\n✓ אישור ההורים לתמונות – התקבל`;
}

async function step(env, from, st, ev, log, db){
  const S = m => wa(env, from, m, log);
  const RB = (bid, v) => readBook(S, bid, v, env, db, log);
  const c = st.cur, G = st.g;
  const id = ev.id || "", txt = (ev.text || "").trim();
  if (!st.oid) { st.oid = newId("סב"); st.day = dayStr(); }
  if (!st.from) st.from = from;
  if (id === "human" || (!id && HUMAN_TXT.test(txt))) {
    st.human = Date.now();
    await S(buttons("בשמחה ❤️ שמש תענה לך כאן בהקדם (א׳–ה׳ 8:00–18:00).\n\nכשתרצו לחזור להזמנה – לוחצים כאן, וממשיכים בדיוק מאיפה שעצרנו 👇", RESUME_BTN));
    await alertOwner(env, st, from, st.lastQ ? "לא עזר – מבקשת את שמש" : "מבקשת לדבר עם שמש", st.lastQ || txt);
    return;
  }
  if (id === "qa:go") { st.lastQ = ""; return ask(env, from, st, log, db); }
  if (id === "restart") return S(buttons("להתחיל מההתחלה? ↩️\nכל הבחירות עד עכשיו יימחקו.", [["restart:yes", "✅ כן, מההתחלה"], ["restart:no", "▶️ לא, ממשיכים"]]));
  if (id === "restart:no") return ask(env, from, st, log, db);
  if (id === "rd:go") { if (st.step === "ver") st.reread = 1; return ask(env, from, st, log, db); }
  if (id === "rd:other") {                                                   /* אחרי ספר לדוגמה – חוזרים לרשימת הספרים */
    st.page = 0;
    if (st.mode === "gan" && ["g-book", "g-book2"].includes(st.step)) { G.books = []; st.step = "g-book"; }
    else if (["book", "ver"].includes(st.step)) { c.book = ""; st.step = "book"; }
    return ask(env, from, st, log, db);
  }
  if (id.startsWith("rd:")) { const [, bid, v] = id.split(":"); return RB(bid, v); }
  /* שאלות: "שאלות" = תפריט; שאלה חופשית בכל שלב = תשובה רק מתוך מה שיש בבוט, ואם אין – לשמש */
  const free = !["dedown", "g-dedown", "addr"].includes(st.step);
  const asking = !id && txt && free && (looksQuestion(txt) || BTN_STEPS.includes(st.step));
  const fq = id.startsWith("q:") ? id.slice(2) : (asking || (!id && txt && free && faqOf(txt) === "menu") ? faqOf(txt) : "");
  if (fq === "menu") { await S(list("❓ במה אפשר לעזור?\nבוחרים נושא – או פשוט כותבים את השאלה.", "בוחרים שאלה", Object.keys(FAQ).filter(k => k !== "price" || st.mode === "gan").map(k => ({ id: "q:" + k, title: FAQ[k][2], description: FAQ[k][0].replace(/^\S+ /, "").slice(0, 72) })), "שאלות")); return; }
  let answer = "";
  if (fq === "know") answer = KNOW;
  else if (fq === "price" && st.mode === "gan") { const n = G.kids || 25; answer = `💰 מחיר לספר${G.kids ? ` (ל-${n} ספרים)` : ""}:\n${COVERS.hard} – ${ils(ganP("hard", n))}\n${COVERS.soft} – ${ils(ganP("soft", n))}\n${COVERS.staple} – ${n >= STAPLE.from ? ils(STAPLE.p) : "מ-20 ספרים"}\n\n🚚 משלוח צ'יטה ${ils(SHIP)}, או איסוף עצמי בלי עלות.\nהמחירים לגנים כוללים הנחה משמעותית לפי הכמות.`; }
  else if (fq === "price") answer = `💰 המחיר יורד ככל שמזמינים יותר ספרים:\nספר אחד – קשה ${ils(priceOf(1, "hard"))} · רכה ${ils(priceOf(1, "soft"))}\n2 ספרים – קשה ${ils(priceOf(2, "hard"))} · רכה ${ils(priceOf(2, "soft"))} לספר\n3 ספרים – קשה ${ils(priceOf(3, "hard"))} · רכה ${ils(priceOf(3, "soft"))} לספר\n🚚 + משלוח עד הבית ${ils(SHIP)}, או איסוף עצמי בלי עלות`;
  else if (fq && FAQ[fq]) answer = faqMsg(fq);
  else if (asking) { const k = qaOf(txt); if (k) answer = QA[k].a(st); }
  if (answer) { st.lastQ = txt || fq; await sendLong(S, answer); return S(buttons("עזר? 🙂", QA_BTNS)); }
  if (asking) {                                                  /* לא יודע – לא מנחש: עובר לשמש */
    st.human = Date.now();
    await S(buttons("שאלה טובה 🙂 אני רוצה שתקבלי תשובה מדויקת – העברתי אותה לשמש, והיא תענה לך כאן בהקדם (א׳–ה׳ 8:00–18:00).\n\nבינתיים אפשר להמשיך בהזמנה 👇", RESUME_BTN));
    await alertOwner(env, st, from, "שאלה שהבוט לא יודע לענות עליה", txt);
    return;
  }
  if (id.startsWith("page:")) { st.page = +id.slice(5); if (st.step === "ver") st.step = "book"; return ask(env, from, st, log, db); }
  switch (st.step) {
    case "hi":
      if (id === "s:go") st.step = "for";
      else if (id === "s:gan") { st.mode = "gan"; st.oid = newId("גן"); st.step = "g-name"; }
      break;
    case "for": if (id === "f:g" || id === "f:p") { st.role = id.slice(2); if (st.role === "p") st.oid = st.oid.replace(/^סב-/, "הו-"); st.page = 0; st.step = "book"; } break;
    case "book": if (id.startsWith("b:") && book(id.slice(2))) { c.book = id.slice(2); c.ded = ""; st.step = "ver"; } break;
    case "ver":
      if (id.startsWith("b:") && book(id.slice(2))) { c.book = id.slice(2); break; }        /* בחרו ספר אחר מהרשימה */
      if (id === "r:read" && PAGES[c.book]) return readAsk(S, c.book, RB);
      if (id === "v:b" || id === "v:g") {
        c.ver = id.slice(2); c.ded = ""; st.step = "name";
        const P = PAGES[c.book] || {}, vv = P[c.ver] ? c.ver : Object.keys(P)[0];   /* ספר לדוגמה אוטומטי, בגרסה שבחרו (אם יש) */
        if (vv) await RB(c.book, vv);
      }
      break;
    case "name": if (id.startsWith("b:") && book(id.slice(2))) { c.book = id.slice(2); c.ver = ""; st.step = "ver"; break; }   /* לחצו על ספר אחר מהרשימה */
      if (txt && !id) { c.name = txt.slice(0, 30); st.step = "ded"; } break;
    case "ded":
      if (id === "d:ok") st.step = "cover";
      else if (id === "d:next") { const L = dedIdeas(c.ver === "g", st); c.dedI = (c.dedI + 1) % L.length; c.ded = L[c.dedI]; }
      else if (id === "d:own") st.step = "dedown";
      else if (txt && !id) { c.ded = txt.slice(0, 450); st.step = "cover"; }
      break;
    case "dedown": if (txt) { c.ded = txt.slice(0, 450); await S(text("הקדשה יפה ❤️")); st.step = "cover"; } break;
    case "cover": if (id === "cv:hard" || id === "cv:soft") { c.cover = id.slice(3); st.step = "pics"; } break;
    case "pics": case "picsmore":
      if (ev.image) { if (c.pics.length < PICS) c.pics.push(await savePic(env, st, c.ver === "g" ? "בנות" : "בנים", c.name, ev.image, from, db)); st.step = "picsmore";
        if (st.burst) return; st.burst = 1; }
      else if (id === "p:done" && c.pics.length) st.step = st.who ? "more" : "who";
      break;
    case "who": if (id === "w:yes") { st.who = st.profile; st.step = "more"; } else if (id === "w:other") st.step = "whoown"; else if (txt && !id) { st.who = txt.slice(0, 40); st.step = "more"; } break;
    case "whoown": if (txt) { st.who = txt.slice(0, 40); st.step = "more"; } break;
    case "more":
      if (id === "m:yes") { st.list.push(c); st.cur = fresh(); st.page = 0; st.step = "book"; }
      else if (id === "m:no") { st.list.push(c); st.cur = fresh(); st.step = "ship"; }
      break;
    case "ship":
      if (id === "sh:pickup") { st.ship = { method: "pickup" }; st.step = "pay"; }
      else if (id === "sh:ship") { st.ship = { method: "ship" }; st.step = "addr"; }
      break;
    case "addr": if (txt && !id) { st.ship.addr = txt.slice(0, 200); st.step = "phone"; } break;
    case "phone":
      if (id === "ph:yes") { st.ship.phone = fmtPhone(st.from); st.step = "pay"; }
      else if (id === "ph:other") st.step = "phoneown";
      break;
    case "phoneown": if (txt && /\d{7,}/.test(txt.replace(/\D/g, ""))) { st.ship.phone = txt.slice(0, 30); st.step = "pay"; } else if (txt) { await S(text("כתבו מספר טלפון, למשל 050-1234567 📞")); return; } break;
    case "pay": if (id.startsWith("pay:") && PAYS[id.slice(4)]) { st.pay = id.slice(4); st.step = st.mode === "gan" ? "g-consent" : "consent"; } break;
    case "consent":
      if (id === "c:yes") return finish(env, from, st, log, db, summary(st, false), summary(st, false), "תודה רבה! 🎉 קיבלנו את ההזמנה.\nשמש תכין את הספר הדיגיטלי ותשלח לך אותו כאן לתצוגה – ומשלמים רק אם אוהבים ❤️ (את פרטי התשלום שמש תשלח אחרי שתאשרי)", CONSENT);
      break;

    /* ---- גן ---- */
    case "g-name": if (txt && !id) { G.name = txt.slice(0, 50); st.step = "g-teacher"; } break;
    case "g-teacher": if (txt && !id) { st.who = txt.slice(0, 40); st.step = "g-kids"; } break;
    case "g-kids": { const k = parseInt(txt.replace(/[^\d]/g, ""), 10); if (k > 0 && k < 1000) { G.kids = k; st.page = 0; st.step = "g-book"; } else if (txt) { await S(text("כתבו רק מספר, למשל 25 🙂")); return; } break; }
    case "g-book": if (id.startsWith("gb:") && book(id.slice(3))) { const nb = id.slice(3); if (!G.books.includes(nb)) { G.books.push(nb); for (const v of ["b", "g"]) if ((PAGES[nb] || {})[v]) await RB(nb, v); } st.step = G.books.length >= GANBOOKS ? "g-cover" : "g-book2"; } break;
    case "g-book2":
      if (id === "g:one") st.step = "g-cover";
      else if (id === "g:more") { st.page = 0; st.step = "g-book"; }
      else if (id === "g:read") { for (const b of G.books.filter(b => PAGES[b])) await readAsk(S, b, RB); return; }
      break;
    case "g-cover": if (/^c:(staple|soft|hard)$/.test(id) && ganP(id.slice(2), G.kids)) { G.cover = id.slice(2); st.step = "g-ded"; } break;
    case "g-ded":
      if (id === "gd:ok") { G.r = 0; st.step = "g-pics"; }
      else if (id === "gd:next") { const L = ganDed(st); G.dedI = ((G.dedI || 0) + 1) % L.length; G.ded = L[G.dedI]; }
      else if (id === "gd:own") st.step = "g-dedown";
      else if (txt && !id) { G.ded = txt.slice(0, 800); G.r = 0; st.step = "g-pics"; }
      break;
    case "g-dedown": if (txt) { G.ded = (G.dedOwn ? G.ded + "\n\n" : "") + txt.slice(0, 450); G.dedOwn = 1; await S(buttons("הקדשה יפה ❤️ רוצים להוסיף עוד הקדשה (למשל לבנות)?", [["gd:done", "✅ זהו, ממשיכים"]])); return; }
      if (id === "gd:done") { G.r = 0; st.step = "g-pics"; }
      break;
    case "g-pics": case "g-picsmore": {
      const [rb, rsub] = rounds(G)[G.r || 0], boys = rsub === "בנים";
      if (ev.image) {
        const nm = (ev.caption || "").trim().split("\n")[0].slice(0, 30) || "ללא שם";
        const topic = G.books.length > 1 ? book(rb).name : "";
        const p = await savePic(env, st, rsub, nm, ev.image, from, db, topic);
        await db.put("gp:" + st.oid + ":" + Date.now() + Math.random().toString(36).slice(2, 6), JSON.stringify({ book: rb, topic, sub: rsub, name: nm, drive: p.drive || "", pending: p.pending || "", mime: p.mime || "" }), 90 * 86400);
        st.step = "g-picsmore";
        if (st.burst) return; st.burst = 1;                        /* הרבה תמונות ברצף – עונים פעם אחת */
      }
      else if (id === "g:rdone") { if ((G.r || 0) + 1 < rounds(G).length) { G.r = (G.r || 0) + 1; st.step = "g-pics"; } else st.step = "g-check"; }
      else if (id === "g:pause") { await S(text("אין בעיה ❤️ שמרנו הכל.\nכשתרצו להמשיך – פשוט שולחים עוד תמונות, או כותבים \"להמשיך\".")); return; }
      else if (id === "g:drive") { st.human = Date.now(); await S(buttons("אין בעיה ❤️ שמש תשלח לך כאן קישור לתיקייה בדרייב בהקדם (א׳–ה׳ 8:00–18:00).\n\nכשתרצו לחזור להזמנה כאן – לוחצים 👇", RESUME_BTN)); return; }
      else if (txt && /^להמשיך$/.test(txt)) { /* חוזרים לאותה שאלה */ }
      else if (txt) { await S(text("כדי לשייך שם לתמונה – שולחים את התמונה עם השם בכיתוב שלה 📷")); }
      break;
    }
    case "g-check":
      if (id === "g:ok") st.step = "ship";
      else if (id === "g:morepics") { G.r = 0; st.step = "g-pics"; }
      break;
    case "g-consent":
      if (id === "gc:yes") return finish(env, from, st, log, db, await ganSummary(st, db), await ganSummary(st, db, true), ganNext(env, st), CONSENT_GAN);
      break;
  }
  return ask(env, from, st, log, db);
}

/* גן – מה קורה עכשיו. פרטי התשלום שמש שולחת בעצמה (לפי הדרך שנבחרה) */
function ganNext(env, st){
  return "תודה רבה! 🎉 קיבלנו את ההזמנה.\n\n*מה קורה עכשיו:*\n1️⃣ *תשלום* – מראש, לפני תחילת עריכת הספרים. שמש תשלח לך כאן את הפרטים" + (st && st.pay ? " ל" + PAYS[st.pay].replace(/^\S+ /, "") : "") + "." +
    "\n2️⃣ *עריכה* – עד 3 ימי עסקים מהתשלום.\n3️⃣ *אישור הדפסה* – נשלח לך כאן את כל הספרים לבדיקה: שכל הילדים נמצאים, שהשמות נכונים ושההקדשה נכונה. *אין צורך לבדוק את הסיפור או את האיורים.*\n4️⃣ *הדפסה ואספקה* – לפי מה שבחרתם (משלוח או איסוף).\n\n🌱 *גן מביא גן:* כל גן שיגיע דרככם ויסגור הזמנה – 50 ₪ הנחה או זיכוי, גם אם זה יקרה בעוד שנה.\n🎁 *צריכים ספרים נוספים במהלך השנה?* קופון *GANIM50* – 50 ₪ הנחה לכל הזמנה, בתוקף לשנה.\n\nתודה שבחרתם בבוקלי למתנה לכל ילדי הגן! ❤️";
}

/* סוף הזמנה: סיכום ללקוח (בלי קישורים), תודה, דרייב (מסמך + מייל לשמש), שמירה ב-KV */
async function finish(env, from, st, log, db, sum, ownerSum, thanks, consentText){
  const S = m => wa(env, from, m, log);
  st.done = st.oid; st.step = "done"; const consentAt = new Date().toISOString();
  await sendLong(S, sum);
  await sendLong(S, thanks);
  const drive = await driveOrder(env, st, from, consentAt, ownerSum, consentText, db);
  await db.put("order:" + Date.now() + ":" + from, JSON.stringify({ from, id: st.oid, mode: st.mode || "private", role: st.role || "", who: st.who, ship: st.ship || null, pay: st.pay || "", at: consentAt, consentAt, consentText, drive, text: ownerSum,
    list: st.list.map(c => ({ book: c.book, ver: c.ver, cover: c.cover, name: c.name, ded: c.ded, pics: c.pics })), gan: st.mode === "gan" ? st.g : null }), 90 * 86400);
}

/* ===== דרייב ===== */
function dayStr(){ const d = new Date(Date.now() + 2 * 3600e3); return String(d.getUTCDate()).padStart(2, "0") + "." + String(d.getUTCMonth() + 1).padStart(2, "0"); }
const title = (st, from) => `${st.oid} · ${(st.mode === "gan" ? st.g.name : "") || st.who || st.profile || from || ""} · ${st.day || dayStr()}`;
function b64(buf){ const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
async function drivePost(env, body){
  if (!env.DRIVE_URL || !env.DRIVE_KEY) return null;
  try {
    const r = await fetch(env.DRIVE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.assign({ key: env.DRIVE_KEY }, body)), redirect: "follow" });
    const j = await r.json(); return j && j.ok ? j : null;
  } catch (e) { console.log("drive failed", String(e)); return null; }
}
/* תמונה: מורידים ממטא ושומרים בדרייב בשם הילד. הדרייב לא זמין – גיבוי ב-KV (90 יום), ומנסים שוב בסוף ההזמנה */
async function savePic(env, st, sub, name, img, from, db, topic){
  if (!env.WA_TOKEN) return img;                                    /* בבדיקות בלי מטא */
  try {
    const m = await (await fetch(`${GRAPH}/${img.media}`, { headers: { "Authorization": "Bearer " + env.WA_TOKEN } })).json();
    const r = await fetch(m.url, { headers: { "Authorization": "Bearer " + env.WA_TOKEN } }); if (!r.ok) return { media: img.media };
    const buf = await r.arrayBuffer(), mime = m.mime_type || "image/jpeg";
    const d = await drivePost(env, { action: "photo", order: st.oid, title: title(st, from), topic: topic || "", sub, name, mime, b64: b64(buf) });
    if (d) return { media: img.media, drive: d.file };
    const a = new Uint8Array(18); crypto.getRandomValues(a); const key = [...a].map(b => b.toString(16).padStart(2, "0")).join("") + ".jpg";
    await env.STATE.put(key, buf, { expirationTtl: 90 * 86400, metadata: { type: mime } });
    return { media: img.media, link: (env.SELF_URL || "") + "/p/" + key, pending: key, mime, sub, name, topic: topic || "" };
  } catch (e) { return { media: img.media }; }
}
async function driveOrder(env, st, from, consentAt, sum, consentText, db){
  if (!env.DRIVE_URL) return null;
  const retry = async p => {                                        /* תמונה שלא נכנסה לדרייב – עוד ניסיון, ואז מוחקים מה-KV */
    const buf = await env.STATE.get(p.pending, { type: "arrayBuffer" }); if (!buf) return false;
    const d = await drivePost(env, { action: "photo", order: st.oid, title: title(st, from), topic: p.topic || "", sub: p.sub, name: p.name, mime: p.mime, b64: b64(buf) });
    if (d) { p.drive = d.file; await env.STATE.delete(p.pending); delete p.pending; delete p.link; return true; }
    return false;
  };
  let expected = 0, left = [];
  for (const c of st.list) for (const p of c.pics) { expected++; if (p.pending && !(await retry(p))) left.push(c.name + ": " + p.link); }
  if (st.mode === "gan") for (const k of await db.list("gp:" + st.oid + ":")) {
    const v = JSON.parse(await db.get(k) || "{}"); expected++;
    if (v.pending) { if (await retry(v)) await db.put(k, JSON.stringify(v), 90 * 86400); else left.push(v.name + ": " + (env.SELF_URL || "") + "/p/" + v.pending); }
  }
  const full = sum.replace("✓ אישור ההורים לתמונות – התקבל", "") +
    `📞 טלפון: +${from}\n🕐 אושר: ${new Date(consentAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}\n\nהנוסח שאושר:\n${consentText}` +
    (left.length ? "\n\n⚠️ תמונות שלא נכנסו לדרייב – בשרת הקטן (90 יום):\n" + left.join("\n") : "");
  const d = await drivePost(env, { action: "order", order: st.oid, title: title(st, from), summary: full, expected });
  return d ? { folder: d.folder, doc: d.doc, photos: d.photos } : null;
}

/* הודעה אחת שנכנסה. ev = {id, text, image, caption}. opts: {mem, log} בבדיקות */
export async function handle(env, from, profile, ev, opts){
  opts = opts || {};
  const db = store(env, opts.mem), log = opts.log;
  const k = "st:" + from, raw = await db.get(k);
  let st = raw ? JSON.parse(raw) : null;
  if (ev.id === "restart:yes" || /^(מחדש|להתחיל מחדש|התחלה מחדש|מתחילים מחדש)[.!]?$/.test((ev.text || "").trim())) { st = null; if (ev.id) ev = { text: "מחדש" }; }   /* מתחילים הזמנה חדשה מההתחלה */
  if (st && st.human) {                                            /* מצב "בן אדם": הבוט שותק */
    if (ev.id === "resume" || RESUME_TXT.test((ev.text || "").trim()) || Date.now() - st.human > 48 * 3600e3) await resume(env, from, st, log, db);
  } else if (!st || st.step === "done") {
    if (/הזמנה (סב|גן)-\d/.test(ev.text || "")) return;              /* הזמנה מלאה מהאתר – שמש מטפלת */
    /* מספר עסקי – עונים לכל הודעה. רק אחרי הזמנה שהסתיימה ב-12 השעות האחרונות ("תודה!") לא פותחים מחדש, אלא אם מדברים על ספר/הזמנה */
    if (st && !ev.id && !TRIGGER.test(ev.text || "") && Date.now() - (st.ts || 0) < 12 * 3600e3) return;
    st = { from, step: "hi", page: 0, list: [], cur: fresh(), who: "", profile: profile || "", human: 0, oid: newId("סב"), day: dayStr(), role: "g", mode: "private", g: { name: "", kids: 0, books: [], cover: "", ded: "", dedI: 0 } };
    if (ev.id === "human" || HUMAN_TXT.test(ev.text || "")) await step(env, from, st, { id: "human" }, log, db);
    else if (ev.id === "s:go" || ev.id === "s:gan") await step(env, from, st, ev, log, db);
    else await ask(env, from, st, log, db);
  } else {
    if (!ev.image) st.burst = 0;
    if (ev.id === "resume" || RESUME_TXT.test((ev.text || "").trim())) await resume(env, from, st, log, db);
    else await step(env, from, st, ev, log, db);
  }
  st.ts = Date.now();
  await db.put(k, JSON.stringify(st), 30 * 86400);
}

async function verify(req, env, body){
  if (!env.APP_SECRET) return true;
  const sig = (req.headers.get("X-Hub-Signature-256") || "").replace("sha256=", "");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.APP_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))].map(b => b.toString(16).padStart(2, "0")).join("");
  return mac === sig;
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === "/wa" && req.method === "GET") {
      return url.searchParams.get("hub.verify_token") === env.VERIFY_TOKEN ? new Response(url.searchParams.get("hub.challenge")) : new Response("no", { status: 403 });
    }
    if (url.pathname === "/wa" && req.method === "POST") {
      const body = await req.text();
      if (!(await verify(req, env, body))) return new Response("bad sig", { status: 401 });
      const j = JSON.parse(body);
      env.SELF_URL = url.origin;
      ctx.waitUntil((async () => {
        const db = store(env);
        for (const e of j.entry || []) for (const ch of e.changes || []) {
          const v = ch.value || {};
          /* שמש כתבה בעצמה מהאפליקציה – הבוט שותק בשיחה הזאת (או חוזר, אם כתבה #בוט) */
          if (ch.field === "smb_message_echoes") for (const m of v.message_echoes || []) {
            const k = "st:" + m.to, raw = await db.get(k); const st = raw ? JSON.parse(raw) : { step: "done", list: [], cur: fresh(), g: {} };
            const t = (m.text && m.text.body) || "";
            if (OWNER_RESUME.test(t)) { await resume(env, m.to, st, null, db, "owner"); await db.put(k, JSON.stringify(st)); }
            else { st.human = Date.now(); await db.put(k, JSON.stringify(st)); }
          }
          const name = (v.contacts && v.contacts[0] && v.contacts[0].profile && v.contacts[0].profile.name) || "";
          for (const m of v.messages || []) {
            const ev = {};
            if (m.type === "text") ev.text = m.text.body;
            else if (m.type === "interactive") ev.id = (m.interactive.button_reply || m.interactive.list_reply || {}).id;
            else if (m.type === "button") ev.text = m.button.text;
            else if (m.type === "image") { ev.image = { media: m.image.id }; ev.caption = m.image.caption || ""; }
            else continue;
            await handle(env, m.from, name, ev);
          }
        }
      })());
      return new Response("ok");
    }
    const p = url.pathname.match(/^\/p\/([a-f0-9]{36}\.jpg)$/);
    if (p && req.method === "GET") {
      const { value, metadata } = await env.STATE.getWithMetadata(p[1], { type: "arrayBuffer" });
      return value ? new Response(value, { headers: { "Content-Type": (metadata && metadata.type) || "image/jpeg", "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" } }) : new Response("not found", { status: 404 });
    }
    if (url.pathname === "/orders" && env.VERIFY_TOKEN && url.searchParams.get("k") === env.VERIFY_TOKEN) {
      const ks = await store(env).list("order:"), out = [];
      for (const k of ks.slice(-50)) out.push(JSON.parse(await env.STATE.get(k)));
      return Response.json(out);
    }
    return new Response("BOOQLI", { status: 404 });
  }
};
