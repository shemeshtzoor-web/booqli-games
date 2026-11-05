/* BOOQLI – בוט ההזמנות בוואטסאפ (Cloudflare Worker), 4.11.2026 – סַבָּאבּוּקְלִי
   המסלול = עמוד "המסלול של סבאבוקלי בוואטסאפ" (ארטיפקט של שמש). שני מסלולים, הכל בתוך השיחה:
   • ספר לילד או לנכד: למי הספר (סבים/הורים) ← בן/בת כבר בשאלה הראשונה ← ספר (נשלח ספר לדוגמה PDF) ← שם ← הקדשה (✅/✨/✍️) ← תמונות ← שם המזמין
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
const MAX = 10, PICS = 5, SHIP = 40, GANBOOKS = 1;   /* פיילוט (5.11): נושא אחד לגן. שני נושאים – שמש ידנית */
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
const BOOKS_INTRO = "📚 *הספרים שלנו כתובים, ערוכים ומנוקדים.*\nההתאמה האישית היא ב:\n✨ שם הילד/ה בתוך הסיפור\n🎨 איורים אישיים בדמות הילד/ה\n💌 הקדשה אישית מטעמכם – מודפסת בעמוד השער\n\n📖 *ספר לדוגמה:*\n"
  + "אחרי שבוחרים ספר נשלח לכם לכאן ספר לדוגמה – הספר המלא, כקובץ PDF 🙂";
/* הגרסאות של כל ספר לקריאה (PDF ב-order/books/pdf/), כמו books.js */
const PAGES = { birthday: { g: 22, b: 22 }, hugs: { g: 20, b: 20 }, superhero: { g: 21, b: 21 }, first: { g: 20, b: 20 }, class1: { g: 22, b: 22 },
  kinder: { g: 20, b: 20 }, savanna: { g: 20, b: 20 }, druki: { g: 22, b: 22 }, night: { g: 20 }, summer: { g: 26 } };
const RESTART_BTN = ["restart", "↩️ להתחלה"], RESTART_NOTE = "↩️ להתחלה מחדש – כותבים: מחדש";
const TEXT_Q = ["name", "dedown", "pics", "who", "whoown", "addr", "phoneown", "email", "g-name", "g-teacher", "g-kids", "g-dedown", "g-pics"];
/* כפתור/שורה "להתחלה" בכל שאלה (חוץ מהפתיחה). אין מקום לכפתור (3 כפתורים / 10 שורות) – שורה קטנה בתחתית */
function withRestart(m, stp){
  return m;   /* לפי שמש (5.11): בלי כפתור/שורת "להתחלה" בכל הודעה – מבלבל. "מחדש" עדיין עובד, ובלבול חוזר מקבל הצעה */
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
async function mediaId(env, db, key, link, filename, mime){
  mime = mime || "application/pdf";
  try {
    const k = "media:" + env.WA_PHONE_ID + ":" + key, have = await db.get(k); if (have) return have;
    const pdf = await fetch(link); if (!pdf.ok) return "";
    const fd = new FormData();
    fd.append("messaging_product", "whatsapp"); fd.append("type", mime);
    fd.append("file", new Blob([await pdf.arrayBuffer()], { type: mime }), filename);
    const r = await fetch(`${GRAPH}/${env.WA_PHONE_ID}/media`, { method: "POST", headers: { "Authorization": "Bearer " + env.WA_TOKEN }, body: fd });
    const j = await r.json();
    if (!j.id) { console.log("media upload failed", JSON.stringify(j)); return ""; }
    await db.put(k, j.id, 20 * 86400); return j.id;
  } catch (e) { console.log("media failed", String(e)); return ""; }
}
/* סרטון בתוך השיחה (מועלה פעם אחת), ומחכים רגע כדי שההודעה הבאה תגיע אחריו */
async function sendVideo(S, key, env, db, log){
  const V = VIDS[key]; if (!V) return;
  const link = V.url ? SITE + V.url : `${SITE}/kindergartens/video/${V.file}`;
  if (!log) await typing(env);
  const mid = log ? "" : await mediaId(env, db, "vid-" + key, link, V.file, "video/mp4");
  await S({ type: "video", video: Object.assign(mid ? { id: mid } : { link }, { caption: V.cap }) });
  if (!log) await new Promise(r => setTimeout(r, mid ? 3000 : 8000));
}
async function readBook(S, bid, v, env, db, log){
  if (!(PAGES[bid] || {})[v]) return;
  const name = `${bname(bid, v)} – ${v === "g" ? "גרסת בת" : "גרסת בן"}`, link = `${SITE}/order/books/pdf/${bid}-${v}.pdf`;
  const filename = name.replace(/\//g, "-").replace(/[\\:*?"<>|]/g, "") + ".pdf";
  if (!log) await typing(env);
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
/* סרטונים – נשלחים כקובץ וידאו בתוך השיחה, אף פעם לא קישור החוצה (לפי שמש). הקבצים מעמוד הגנים */
const VIDS = {
  covers: { file: "covers.mp4", cap: "📕 ההבדל בין הכריכות – סרטון קצר" },
  photo: { file: "photo.mp4", cap: "📸 איך בוחרים תמונה טובה – סרטון קצר" },
  guide: { file: "guide-wa.mp4", cap: "🎬 סרטון הסבר של שמש" },
  kit: { url: "/marketing/media/kinder-book/booqli-gan-birthday-kit-4x5.mp4", file: "booqli-gan-birthday-kit-4x5.mp4", cap: "🎉 ספר יום הולדת אישי + קיט חגיגה מוכן לגן במתנה" }
};
/* הנחיות לתמונה (מהמדריך של שמש) */
const PHOTO_TIPS = "⚠️ *חשוב:* שולחים תמונת פנים ברורה – האחריות לתמונה טובה היא שלכם. לא בטוחים? צפו בסרטון 👆\n\n📸 *תמונה טובה = איור טוב:*\n🔵 ילד/ה אחד/ת בלבד – בלי אנשים או חיות, גם לא ברקע\n🔴 מבט ישיר למצלמה – לא הצידה ולא מלמעלה\n🟠 פנים גלויות – בלי כובע, משקפי שמש, סרטים, כתרים או פלסטרים\n🟢 בנים עם כיפה – שהכיפה תופיע בתמונה\n🟣 בנות – התסרוקת באיור תהיה כמו בתמונה\n⚪ אם מצלמים במיוחד – רקע לבן וחולצה לבנה\n😀 והכי חשוב – חיוך!";
/* "כל מה שחשוב לדעת" (מהמדריך של שמש) */
const KNOW = "📋 *כל מה שחשוב לדעת*\n\n✂️ *אין צורך לערוך שום דבר* – שולחים תמונה, שם והקדשה, ומקבלים ספר מושלם.\n\n🤖 *בינה מלאכותית:* בינה מלאכותית אינה מצלמה – גם כשהדמיון גבוה מאוד (עד 99%), ייתכנו הבדלים קלים במראה או בפרופורציות. *כל ספר עובר בדיקה אנושית*, איור אחר איור, לפני ההדפסה.\n\n🔍 *לפני ההדפסה* נשלח לכם את הספר לאישור – בודקים שהשמות נכונים ושאין שגיאות בהקדשה. האישור נועד לבדיקת הפרטים, לא לסבבי תיקונים בדמות.\n\n📦 *מידות:* כריכה רכה 20×20 ס״מ · כריכה קשה 21×21 ס״מ. הספרים מגיעים בלי אריזה אישית – הכי יפה לארוז בצלופן ובסרט 🎀\n\n⏱️ *אספקה:* משלוח צ'יטה עד 14 ימי עסקים מאישור ההדפסה · איסוף עצמי מבית הדפוס (ליד עפולה) בתיאום, כשבוע מאישור ההדפסה.";
/* עמוד הגנים – תשובות מוכנות עם קישור, וחוזרים לאותה שאלה */
const PAGE = SITE + "/kindergartens/";
const FAQ = {
  photo: ["📸 איך בוחרים תמונה טובה (סרטון)", "video:photo", "📸 תמונה טובה"],
  cover: ["📕 ההבדל בין הכריכות (סרטון)", "video:covers", "📕 ההבדל בין הכריכות"],
  know: ["📋 כל מה שחשוב לדעת", "", "📋 כל מה שחשוב לדעת"],
  guide: ["🎬 סרטון הסבר של שמש", "video:guide", "🎬 סרטון הסבר"],
  price: ["💰 מחירים", "", "💰 מחירים"],

};
const PAYS = { bank: "🏦 העברה בנקאית", bit: "📱 ביט", paybox: "📱 פייבוקס", card: "💳 אשראי (בתיאום)" };
/* תשובות מוכנות – רק מתוך ההודעות והמדריך של שמש. מה שלא כאן – עובר לשמש */
const QA = {
  staple: { re: /חוברת|סיכות|כריכת כרומו|כריכה כרומו|כריכות כרומו|כרומו סיכות/, a: () => `💜 *חוברת כרומו סיכות:* הכריכה הזו מתאימה רק להזמנות של ${STAPLE.from} ספרים ומעלה (למשל לגן). בהזמנה קטנה יותר בוחרים כריכה קשה או רכה.` },
  author: { re: /מי כתב|מי כותב|מי הסופר|מי המחבר|מי כתבה|כתבה את|כתב את|מי אייר|מי איירה|מי מאייר/, a: () => "✍️ *את כל הספרים כתבה שמש צור* – בחרוזים, ערוכים ומנוקדים.\n🎨 האיורים נוצרים בדמות הילד/ה, לפי התמונה ששולחים." },
  pay: { re: /תשלום|לשלם|משלמים|ביט|פייבוקס|העברה בנקאית|אשראי/, a: () => "💳 *תשלום:* קודם מקבלים סקיצה של הספר, ומשלמים רק אם אוהבים ❤️ – בהעברה בנקאית, ביט, פייבוקס, או אשראי בתיאום. בסוף ההזמנה בוחרים את הדרך הנוחה, ושמש שולחת קישור לתשלום." },
  time: { re: /כמה זמן|מתי (זה )?(מגיע|מוכן|יהיה)|זמן אספקה|זמני אספקה|עריכה|תוך כמה/, a: st => "⏱️ *זמנים:* סקיצות – תוך יום עסקים אחד מההזמנה (אם הבקשה תקינה). אחרי שמאשרים הדפסה – משלוח צ'יטה עד 14 ימי עסקים, או איסוף עצמי מבית הדפוס (ליד עפולה) בתיאום, כשבוע מאישור ההדפסה." },
  ship: { re: /משלוח|איסוף|לאסוף|עפולה|צ'יטה|שליח/, a: () => "📦 *משלוח או איסוף:* 🚚 משלוח צ'יטה עד הבית – 40 ₪, עד 14 ימי עסקים מאישור ההדפסה. 🚗 איסוף עצמי מבית הדפוס (ליד עפולה) – בלי עלות, בתיאום, כשבוע מאישור ההדפסה. בוחרים בסוף ההזמנה." },
  ded: { re: /הקדש/, a: st => st.mode === "gan" ? "💌 *הקדשה:* הקדשה אחת לכל ילדי הגן – או אחת לכל ספר (עד 2), עד 350 תווים, *בלי שם הילד* (השם כבר בספר). את ההתאמה לבנים ולבנות אנחנו עושים. אפשר לבחור הקדשה מוכנה או לכתוב לבד." : "💌 *הקדשה:* מציעים לכם הקדשה מוכנה (אפשר לבקש אחרת), או כותבים לבד – עד 300 תווים בערך." },
  names: { re: /אותו שם|שם זהה|שני ילדים עם|שמות זהים/, a: () => "👯 *שני ילדים עם אותו שם:* כותבים בכיתוב של התמונה \"יוסי 1\", \"יוסי 2\" – וכך לא מתבלבלים." },
  ai: { re: /בינה מלאכותית|\bAI\b|דומה|דמיון|איור/, a: () => "🤖 *האיורים:* בינה מלאכותית אינה מצלמה – גם כשהדמיון גבוה מאוד (עד 99%), ייתכנו הבדלים קלים במראה או בפרופורציות. *כל ספר עובר בדיקה אנושית*, איור אחר איור, לפני ההדפסה." },
  check: { re: /אישור הדפסה|סקיצ|לבדוק|תיקון|תיקונים|לשנות/, a: () => "🔍 *לפני ההדפסה* נשלח לכם את הספר לאישור – בודקים שכל הילדים נמצאים, שהשמות נכונים ושאין שגיאות בהקדשה. האישור נועד לבדיקת הפרטים, לא לסבבי תיקונים בדמות. טעות שלנו – מתוקנת מיד." },
  size: { re: /מידות|גודל|אריזה|לארוז|מידה/, a: () => "📦 *מידות:* כריכה רכה 20×20 ס״מ · כריכה קשה 21×21 ס״מ. הספרים מגיעים בלי אריזה אישית – הכי יפה לארוז בצלופן שקוף ובסרט 🎀" },
  edit: { re: /לערוך|עריכה של|צריך לעשות/, a: () => "✂️ *אין צורך לערוך שום דבר!* שולחים תמונה, שם והקדשה – ומקבלים ספר מושלם." },
  extra: { re: /ספרים נוספים|עוד ספרים במהלך|קופון|GANIM50|הנחה/i, a: st => st.mode === "gan" ? "🎁 *ספרים נוספים במהלך השנה:* כל גן מקבל קופון *GANIM50* – 50 ₪ הנחה לכל הזמנה, בתוקף לשנה. ו🌱 *גן מביא גן:* כל גן שיגיע דרככם ויסגור הזמנה – 50 ₪ הנחה או זיכוי." : "💰 ככל שמזמינים יותר ספרים – המחיר של כל ספר יורד. כתבו \"כמה זה עולה\" ותקבלו את המחירים." }
};
const qaOf = t => { for (const k of Object.keys(QA)) if (QA[k].re.test(t)) return k; return ""; };
const QA_BTNS = [["qa:go", "▶️ ממשיכים"], ["human", "🙋 לא עזר – לשמש"]];
const looksQuestion = t => /\?|^(מה|איך|כמה|למה|מתי|האם|אפשר|יש|איפה|מי|באיזה|באיזו|למי|רציתי לשאול|רציתי לדעת|אני רוצה לדעת|אפשר לדעת|יש לכם|תוכלו|לא הבנתי|שאלה)[\s,]/.test(t);
/* שלבים שבהם כל טקסט הוא שאלה (אין שם תשובה בכתב) */
const BTN_STEPS = ["hi", "for", "book", "ver", "cover", "picsmore", "more", "ship", "phone", "pay", "consent", "g-book", "g-book2", "g-cover", "g-check", "g-consent"];
/* מייל לשמש: לקוחה צריכה אותך (דרך הקוד בגוגל) */
/* חלון השאלות של שמש (ב-Claude): כל הודעה שמגיעה אליה – ואחרי החיבור ל-055 גם כל תשובה שלה – נשמרת כמסמך קטן
   בתיקייה "שאלות-לקוחות" בדרייב (פעולת note). הדף קורא משם, מציע תשובה בסגנון שלה, ושמש מעתיקה. */
async function logQA(env, st, from, kind, why, msg){
  if (!msg) return;
  const d = new Date(Date.now() + 2 * 3600e3), pad = n => String(n).padStart(2, "0"), who = (st && (st.who || st.profile)) || "";
  const stamp = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  const books = st ? (st.mode === "gan" ? (st.g.books || []).map(b => book(b).name).join(" + ") : (st.list || []).concat(st.cur && st.cur.book ? [st.cur] : []).map(c => bname(c.book, c.ver)).join(" + ")) : "";
  await drivePost(env, { action: "note", order: "שאלות-לקוחות", title: "שאלות-לקוחות", name: `${kind === "a" ? "תשובה" : "שאלה"} ${stamp} · ${who || from}`,
    text: `BOOQLI-QA\nסוג: ${kind === "a" ? "תשובה של שמש" : "הודעה מלקוח"}\nזמן: ${stamp}\nלקוח: ${who}\nטלפון: ${from}\nסוג הזמנה: ${st && st.mode === "gan" ? "גן" : "פרטי"}\nהזמנה: ${(st && st.oid) || ""}\nשלב: ${(st && st.step) || ""}\nספרים: ${books}\nסיבה: ${why || ""}\nהודעה: ${String(msg).slice(0, 1500)}` });
}
async function alertOwner(env, st, from, why, q){
  await drivePost(env, { action: "alert", order: st.oid || "", who: st.who || st.profile || "", phone: from, why, q: q || "", step: st.step || "" });
}
const faqMsg = k => `${FAQ[k][0]} – לוחצים על הקישור, ובסוף חוזרים לכאן:\n${FAQ[k][1]}`;
function faqOf(t, step){
  if (QA.staple.re.test(t)) return "";                          /* שאלה על כרומו סיכות – תשובה מ-QA */
  if (/הבדל|מה ההבדל|איזו עדיפה|איזו כדאי|מה עדיף/.test(t) && ["cover", "g-cover"].includes(step)) return "cover";
  if (/^(שאלות|שאלה|\?|❓)$/.test(t)) return "menu";
  if (/תמונה טובה|(איזו|איזה|אילו|איזה סוג|מה ה?סוג) ?תמונ|תמונה (מתאימה|לשלוח|לבחור)|לבחור תמונה|בוחרים תמונה|איך לצלם|איך מצלמים|תמונת פנים/.test(t)) return "photo";
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
function ganDed(st, sub){                                     /* בלי sub – ברבים (מה שהגננת רואה); "בנים"/"בנות" – לכל ספר, בזכר/נקבה */
  const g = st.g.name || "הגן", f = (pl, m, w) => sub === "בנים" ? m : sub === "בנות" ? w : pl;
  return [
    `${f("ילדים יקרים", "ילד יקר", "ילדה יקרה")},\nהשנה בגן ${f("הייתם גיבורים אמיתיים", "היית גיבור אמיתי", "היית גיבורה אמיתית")} – ${f("למדתם, שיחקתם, צחקתם וגדלתם יחד", "למדת, שיחקת, צחקת וגדלת יחד איתנו", "למדת, שיחקת, צחקת וגדלת יחד איתנו")}. שהספר הזה יזכיר ${f("לכם", "לך", "לך")} תמיד כמה ${f("אתם מיוחדים", "אתה מיוחד", "את מיוחדת")}, כמה ${f("אתם אהובים", "אתה אהוב", "את אהובה")}, וכמה כיף היה לנו ${f("איתכם", "איתך", "איתך")}. ${f("המשיכו", "המשך", "המשיכי")} לחלום בגדול, לשאול שאלות ולשמור על הלב הטוב ${f("שלכם", "שלך", "שלך")}.\nבאהבה, צוות ${g} ❤️`,
    `${f(`לילדי ${g} האהובים`, `לילד האהוב שלנו מ${g}`, `לילדה האהובה שלנו מ${g}`)},\nכל יום ${f("איתכם", "איתך", "איתך")} הוא הרפתקה – מלא צחוק, סקרנות וחיבוקים. הספר הזה הוא מזכרת קטנה מהשנה המיוחדת שלנו יחד. ${f("תזכרו שאתם יכולים", "תזכור שאתה יכול", "תזכרי שאת יכולה")} להגשים כל חלום, ושתמיד יש מי שמאמין ${f("בכם", "בך", "בך")}.\nאוהבים, הגננות ❤️`,
    `${f("לילדים המתוקים שלנו", "לילד המתוק שלנו", "לילדה המתוקה שלנו")},\nשתמיד ${f("תאמינו בעצמכם, תהיו חברים טובים ותשמחו", "תאמין בעצמך, תהיה חבר טוב ותשמח", "תאמיני בעצמך, תהיי חברה טובה ותשמחי")} בכל דבר קטן. היה לנו לכבוד ללוות ${f("אתכם", "אותך", "אותך")} השנה ולראות ${f("אתכם גדלים", "אותך גדל", "אותך גדלה")}. בכל פעם ${f("שתפתחו", "שתפתח", "שתפתחי")} את הספר – ${f("תזכרו", "תזכור", "תזכרי")} כמה אנחנו גאים ${f("בכם", "בך", "בך")}.\nצוות ${g} ❤️`
  ];
}
/* ההקדשה לקבוצה (ספר + בנים/בנות): מוכנה – בזכר/נקבה; שהגננת כתבה – כפי שנכתבה, עם הערה לשמש */
function ganDedFor(st, b, sub){
  const D = (st.g.deds || {})[b] || (st.g.deds || {}).all;
  if (!D) return st.g.ded || "";
  if (typeof D === "object" && D.i != null) return ganDed(st, sub)[D.i];
  const t = typeof D === "object" ? D.own : D;
  return t + `\n\n———\n✍️ הנוסח של הגננת, כפי שנכתב – להתאים ל${sub === "בנות" ? "בנות (נקבה)" : "בנים (זכר)"}.`;
}
const CONSENT_LINKS = "לקריאה (נפתח בדפדפן):\n📄 התקנון: https://www.booqli.ai/he/terms-of-service\n🔒 מדיניות הפרטיות: https://www.booqli.ai/he/privacy-policy\n\n";
const CONSENT = CONSENT_LINKS + "בלחיצה על הכפתור למטה אני מאשר/ת:\n☑️ קראתי את התקנון ואת מדיניות הפרטיות.\n☑️ אני ההורה, או שקיבלתי אישור מההורים, לשלוח ל-BOOQLI את התמונות של הילדים – כל תמונה ששלחתי או שאשלח כאן, עכשיו או בהמשך (גם לספר נוסף, או במקום תמונה שלא מתאימה) – כדי ליצור מהן איורים לספר.";
const CONSENT_GAN = CONSENT_LINKS + "בלחיצה על הכפתור למטה אני מאשרת:\n☑️ קראתי את התקנון ואת מדיניות הפרטיות.\n☑️ קיבלנו אישור מההורים של כל הילדים לשלוח ל-BOOQLI את התמונות של הילדים – כל תמונה ששלחתי או שאשלח כאן, עכשיו או בהמשך (גם לספר נוסף, או במקום תמונה שלא מתאימה) – כדי ליצור מהן איורים לספר.";
const HUMAN_TXT = /בן אדם|בנאדם|נציג|אדם אמיתי|אדם אנושי|לדבר עם (שמש|מישהו|מישהי|בעלת|נציג)|לדבר עם בן|שמש (תחזור|תתקשר)|תתקשרו אליי|תחזרו אליי/;
const RESUME_TXT = /^(להמשיך|ממשיכים|נמשיך|המשך)( בהזמנה)?[.!]?$/;               /* הלקוח */
const OWNER_RESUME = /להמשיך בהזמנה|נמשיך בהזמנה|ממשיכים בהזמנה|#בוט/;          /* שמש, מהאפליקציה */
const RESUME_BTN = [["resume", "▶️ להמשיך בהזמנה"]];
const SHIP_TXT = "איך הספרים יגיעו אליכם? 📦\n\n🚚 *משלוח צ'יטה עד הבית* – 40 ₪, עד 14 ימי עסקים מאישור ההדפסה\n🚗 *איסוף עצמי* מבית הדפוס (ליד עפולה) – בלי עלות, בתיאום, כשבוע מאישור ההדפסה";
const fmtPhone = n => String(n || "").replace(/^972/, "0").replace(/^(\d{3})(\d{3})(\d+)$/, "$1-$2-$3");
const shipLine = st => st.ship && st.ship.method === "pickup" ? "🚗 איסוף עצמי מבית הדפוס (ליד עפולה), בתיאום" : st.ship && st.ship.method === "ship" ? `🚚 משלוח צ'יטה עד הבית – ${ils(SHIP)}\n📍 ${st.ship.addr}\n📞 ${st.ship.phone}` : "";
const shipCost = st => st.ship && st.ship.method === "pickup" ? 0 : SHIP;
async function resume(env, to, st, log, db, who){                           /* חוזרים בדיוק לשאלה שעצרו בה */
  st.human = 0; st.owner = 0;
  if (st.step === "done") return;
  await wa(env, to, text(who === "owner" ? "ממשיכים בהזמנה מאיפה שעצרנו 👇" : "מעולה, ממשיכים מאיפה שעצרנו 👇"), log);
  await ask(env, to, st, log, db);
}
/* איך זה עובד – נשלח פעם אחת, אחרי שבוחרים פרטי/גן (לפי שמש, 4.11) */
const PRICES_TXT = () => `💰 *המחירים* (לספר, לפי כמה ספרים בהזמנה):\n📕 ספר אחד – קשה ${ils(priceOf(1, "hard"))} · רכה ${ils(priceOf(1, "soft"))}\n📚 2 ספרים – קשה ${ils(priceOf(2, "hard"))} · רכה ${ils(priceOf(2, "soft"))} לספר\n📚 3 ספרים – קשה ${ils(priceOf(3, "hard"))} · רכה ${ils(priceOf(3, "soft"))} לספר\n🚚 משלוח עד הבית ${ils(SHIP)} · 🚗 איסוף עצמי – חינם`;
const GAN_PRICES = n => `💰 *המחיר לספר* (ל-${n} ילדים):\n💗 קשה פרימיום – ${ils(ganP("hard", n))}\n💛 רכה פיג'מה – ${ils(ganP("soft", n))}\n💜 חוברת כרומו סיכות – ${n >= STAPLE.from ? ils(ganP("staple", n)) : "רק מ-" + STAPLE.from + " ספרים"}\n🚚 משלוח ${ils(SHIP)} · 🚗 איסוף עצמי – חינם\n(את סוג הכריכה בוחרים בסוף, אחרי התמונות)`;
/* הודעה להעביר לקבוצת ההורים – עם קישור שפותח צ'אט עם בוקלי וקוד הגן כבר כתוב */
const BIZ = env => env.WA_NUMBER || "15551771654";            /* מספר הבדיקה; אחרי החיבור ל-055 – WA_NUMBER ב-Cloudflare */
function parentsMsg(env, st, remind){
  const G = st.g, link = `https://wa.me/${BIZ(env)}?text=${encodeURIComponent("ספר לגן – קוד " + G.code)}`;
  return remind
    ? `תזכורת 💗 עוד לא קיבלנו תמונות של כל הילדים לספר האישי של ${G.name}.\nמי שעוד לא שלח – לוחצים כאן, לוקח דקה:\n👈 ${link}\n\nתודה! ${st.who || ""}`
    : `הורים יקרים 💗\nכל ילד וילדה ב${G.name} יקבלו ספר אישי "${book(G.books[0]).name}" – עם השם, איורים בדמות הילד/ה והקדשה מהגן! 📖✨\n\nצריך רק תמונה אחת של הילד/ה. לוחצים על הקישור ושולחים בוואטסאפ (לוקח דקה):\n👈 ${link}\n\nתודה! ${st.who || ""}`;
}
/* גן – ההודעה המלהיבה של שמש (5.11), נשלחת אחרי שהגננת כתבה כמה ילדים, עם המחירים לכמות שלה */
function GAN_PITCH(n){
  const q = n || 20;
  const line = (k, e, nm) => ganP(k, q) ? `${e} ${nm} – ${ils(ganP(k, q))} לספר` : `${e} ${nm} – רק מ-${STAPLE.from} ספרים`;
  return `🎉 *בבוקלי כל ילד וילדה בגן הופכים לגיבורים של ספר יום הולדת אישי ומרגש!*\nזה לא עוד ספר מהמדף – זו חגיגה שלמה שמתחילה בספר 📖✨\n\n` +
    `*מה יש בכל ספר?*\n✨ השם של הילד/ה על הכריכה ולאורך כל העלילה\n🎨 איורים בדמות הילד/ה – לפי התמונה, על הכריכה ובכל עמוד\n💌 הקדשה אישית מטעם הגן או הוועד, מודפסת בעמוד השער\n👌 אין צורך לערוך כלום – מעלים תמונה אחת ומקבלים ספר מושלם!\n\n` +
    `🎁 *ובמתנה לגננת – קיט חגיגת יום הולדת מוכן!*\n👑 כתר עם השם של הילד/ה להדפסה\n💌 כרטיס ברכה עם התמונה שלו/ה\n🎈 מערך חגיגה שלב אחר שלב: הכתרה, מצעד החברים, כיסא המלך/המלכה\n🖍️ דפי צביעה ודף ברכה מכל חבר\nכל יום הולדת בגן הופך לחגיגה – בלי להכין כלום מראש!\n\n` +
    `📲 *ועוד מתנה: האפליקציה booqli Games* – משחקים, דפי עבודה ומערכים לפי לוח השנה, לגננת ולהורים, באייקון אחד בטלפון 🎮\n\n` +
    `💰 *המחירים ${n ? "ל-" + n + " ספרים" : "להזמנה של 20–49 ספרים"}:*\n${line("hard", "💗", "כריכה קשה פרימיום")}\n${line("soft", "💛", "כריכה רכה פיג'מה (כמו ספריית פיג'מה)")}\n${line("staple", "💜", "חוברת כרומו סיכות")}\n` +
    `המחירים לגנים כבר כוללים הנחה משמעותית לפי הכמות וסוג הכריכה, ונקבעו מתוך התחשבות בתקציבים של הגנים – ולכן הם סופיים.\n\n` +
    `📦 *איך הספרים מגיעים?*\n🚗 איסוף עצמי מבית הדפוס (ליד עפולה) – בלי עלות, כשבוע מאישור ההדפסה (מומלץ!)\n🚚 משלוח צ'יטה – ${ils(SHIP)}, עד 14 ימי עסקים מאישור ההדפסה\n\n` +
    `🎁 *רוצים לראות קודם?* כותבים כאן *דוגמה*, ושמש תכין לכם דוגמה ראשונית – בלי עלות ובלי התחייבות 💗\n(את סוג הכריכה בוחרים בסוף, אחרי התמונות)`;
}
/* מחשבון מחירים בוואטסאפ: "מחיר 35" → מחיר לספר וסה"כ לכל כריכה. בלי מספר – הטבלה + איך לבקש מספר */
function priceCalc(gan, n){
  const tip = `\n\n🧮 רוצים מחיר לכמות אחרת? כותבים "מחיר" ומספר, למשל: *מחיר ${gan ? 35 : 4}*`;
  const ship = `🚚 + משלוח ${ils(SHIP)}, או איסוף עצמי – חינם`;
  if (!gan) {
    if (!n) return PRICES_TXT() + tip;
    return `💰 *מחיר ל-${n} ${n === 1 ? "ספר" : "ספרים"}:*\n💗 קשה – ${ils(priceOf(n, "hard"))} לספר · סה"כ ${ils(priceOf(n, "hard") * n)}\n💛 רכה – ${ils(priceOf(n, "soft"))} לספר · סה"כ ${ils(priceOf(n, "soft") * n)}\n${ship}${n >= STAPLE.from ? `\n💜 מ-${STAPLE.from} ספרים יש גם חוברת סיכות – ${ils(ganP("staple", n))} לספר` : ""}` + tip;
  }
  if (!n) return `💰 *מחירים לגנים* (להזמנות של 20–49 ספרים, לספר):\n💜 חוברת כרומו סיכות – ${ils(ganP("staple", 20))}\n💛 רכה פיג'מה – ${ils(ganP("soft", 20))}\n💗 קשה פרימיום – ${ils(ganP("hard", 20))}\n${ship}\nבכמות אחרת המחיר משתנה – ככל שמזמינים יותר, המחיר לספר יורד.` + tip;
  const line = (k, e, nm) => ganP(k, n) ? `${e} ${nm} – ${ils(ganP(k, n))} לספר · סה"כ ${ils(ganP(k, n) * n)}` : `${e} ${nm} – רק מ-${STAPLE.from} ספרים`;
  return `💰 *מחיר ל-${n} ספרים:*\n${line("staple", "💜", "חוברת כרומו סיכות")}\n${line("soft", "💛", "רכה פיג'מה")}\n${line("hard", "💗", "קשה פרימיום")}\n${ship}` + tip;
}
const PROCESS = gan => `🗺️ *איך זה עובד:*\n1️⃣ בוחרים ספר ושולחים כאן ${gan ? "תמונות של הילדים" : "תמונה"}\n2️⃣ בן אדם אמיתי עובר על כל בקשה\n3️⃣ תוך יום עסקים אחד – נשלח לכם סקיצה ${gan ? "של הספרים" : "לכל ספר"}\n4️⃣ אוהבים? משלמים בקישור שנשלח לכם. לא אוהבים? נפרדים כידידים ❤️\n\n_אנחנו שומרים לעצמנו את הזכות לא להכין סקיצות לבקשה שאינה תקינה._`;
const THANKS = st => `תודה רבה! 🎉 קיבלנו את הבקשה ${st.mode === "gan" ? "לספרים של הגן" : "לספרים שלכם"}.\nנעבור על הבקשה, ותוך יום עסקים אחד – אם הבקשה תקינה – תקבלו כאן את ${st.mode === "gan" ? "כל הסקיצות" : "הסקיצות"} לאישור.\nאוהבים? משלמים בקישור ששמש תשלח לכם${st.pay && PAYS[st.pay] ? " (" + PAYS[st.pay].replace(/^\S+ /, "") + ")" : ""}. לא אוהבים? נפרדים כידידים ❤️`;
const HI = "שלום ❤️ כאן סבאבוקלי מבוקלי!\nאני אעזור לכם להזמין ספר אישי שבו הילד/ה, הנכד/ה – או כל ילדי הגן – הם הגיבורים – כתוב ע\"י שמש צור, מנוקד ובחרוזים, מודפס באיכות גבוהה ומגיע עד הבית.\n\n👀 אדם אמיתי משגיח על כל התהליך.\n🙋 רוצים לדבר עם בן אדם? תמיד אפשר לחזור להודעה הזאת וללחוץ על הכפתור למטה – או פשוט לכתוב \"בן אדם\".\n❓ יש שאלה? כתבו \"שאלות\" בכל שלב.";

/* ===== שליחה לוואטסאפ ===== */
const HUMAN = { type: "reply", reply: { id: "human", title: "🙋 לדבר עם בן אדם" } };
/* "מקליד…" בוואטסאפ (וגם ✓✓ כחול): מיד כשהודעה מגיעה, ושוב לפני עבודה איטית (סרטון, PDF, תמונה לדרייב). נמשך עד 25 שנ' או עד התשובה */
async function typing(env){
  if (!env.MID || !env.WA_TOKEN) return;
  try { await fetch(`${GRAPH}/${env.WA_PHONE_ID}/messages`, { method: "POST", headers: { "Authorization": "Bearer " + env.WA_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: env.MID, typing_indicator: { type: "text" } }) }); } catch (e) {}
}
async function wa(env, to, msg, log){
  const body = Object.assign({ messaging_product: "whatsapp", to }, msg);
  if (log) { log.push(body); return; }                       /* בבדיקות – רק רושמים */
  const r = await fetch(`${GRAPH}/${env.WA_PHONE_ID}/messages`, { method: "POST", headers: { "Authorization": "Bearer " + env.WA_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) console.log("wa send failed", r.status, await r.text());
}
const text = t => ({ type: "text", text: { body: t } });
const buttons = (t, bs) => ({ type: "interactive", interactive: { type: "button", body: { text: t.slice(0, 1024) }, action: { buttons: bs.slice(0, 3).map(b => b.type ? b : { type: "reply", reply: { id: b[0], title: b[1] } }) } } });
const list = (t, btn, rows, title) => ({ type: "interactive", interactive: { type: "list", body: { text: t }, action: { button: btn, sections: [{ title: title || "ספרים", rows }] } } });
const quote = (m, mid) => mid ? Object.assign(m, { context: { message_id: mid } }) : m;   /* תשובה שמצטטת הודעה (למשל תמונה) */
const image = (link, caption) => ({ type: "image", image: { link, caption } });
async function sendLong(S, t){ for (let i = 0; i < t.length; i += 3900) await S(text(t.slice(i, i + 3900))); }

/* ===== אחסון =====
   מצב השיחות: מסד D1 (env.DB) – תמיד הגרסה העדכנית. KV מחזיר לפעמים עותק ישן עד דקה, ואז הבוט "שכח" שלב והתחיל מההתחלה.
   בלי DB – KV (כמו קודם). גיבויי תמונות (קבצים) נשארים ב-KV. בבדיקות – זיכרון. */
let tableReady = false;
function store(env, mem){
  if (mem) return {
    get: async k => mem[k] ?? null, put: async (k, v) => { mem[k] = v; }, del: async k => { delete mem[k]; },
    list: async p => Object.keys(mem).filter(k => k.startsWith(p)).sort()
  };
  if (env.DB) {
    const ready = async () => { if (!tableReady) { await env.DB.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, exp INTEGER)").run(); tableReady = true; } };
    const now = () => Math.floor(Date.now() / 1000);
    return {
      get: async k => { await ready(); const r = await env.DB.prepare("SELECT v FROM kv WHERE k = ? AND (exp IS NULL OR exp > ?)").bind(k, now()).first(); return r ? r.v : null; },
      put: async (k, v, ttl) => { await ready(); await env.DB.prepare("INSERT INTO kv (k, v, exp) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, exp = excluded.exp").bind(k, String(v), now() + (ttl || 30 * 86400)).run(); },
      del: async k => { await ready(); await env.DB.prepare("DELETE FROM kv WHERE k = ?").bind(k).run(); },
      list: async p => { await ready(); const r = await env.DB.prepare("SELECT k FROM kv WHERE k >= ? AND k < ? AND (exp IS NULL OR exp > ?) ORDER BY k").bind(p, p + "\uffff", now()).all(); return r.results.map(x => x.k); }
    };
  }
  return {
    get: k => env.STATE.get(k), put: (k, v, ttl) => env.STATE.put(k, v, { expirationTtl: ttl || 30 * 86400 }), del: k => env.STATE.delete(k),
    list: async p => { const out = []; let cursor; do { const r = await env.STATE.list({ prefix: p, cursor }); r.keys.forEach(x => out.push(x.name)); cursor = r.list_complete ? null : r.cursor; } while (cursor); return out.sort(); }
  };
}

/* ===== המסלול ===== */
const fresh = () => ({ book: "", ver: "", name: "", ded: "", dedI: 0, cover: "", pics: [] });
const newId = p => p + "-" + String(1000 + Math.floor(Math.random() * 9000));
/* שם הספר לפי מין: "הולך/ת לגן" ← "הולכת לגן" (בת) / "הולך לגן" (בן). בלי מין – כמו שהוא */
const FIN = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
const gname = (name, v) => !v ? name : name.replace(/(\S+)\/(\S+)/g, (m, a, b) => v === "g" ? a.replace(/[ךםןףץ]$/, x => FIN[x]) + b : a);
const bname = (id, v) => gname(book(id).name, v);
/* רשימת הספרים; כשיודעים בן/בת – רק ספרים שיש להם הגרסה הזאת, ובשמות לפי המין */
const bookRows = (page, prefix, v) => {
  const all = BOOKS.filter(b => !(v && PAGES[b.id] && !PAGES[b.id][v]));
  const part = page ? all.slice(9) : all.slice(0, 9);
  const rows = part.map(b => ({ id: prefix + b.id, title: gname(b.name, v).slice(0, 24) }));
  if (all.length > 9) rows.push(page ? { id: "page:0", title: "⬅️ לספרים הקודמים" } : { id: "page:1", title: "➡️ עוד ספרים" });
  return rows;
};
async function ganPics(db, st){                               /* תמונות הגן – כל תמונה במפתח משלה (כמה תמונות באותו רגע) */
  const keys = await db.list("gp:" + st.oid + ":"), out = { b: [], g: [], nameless: 0, by: {}, recs: [], pend: [], all: 0 };
  for (const k of keys) {
    const v = JSON.parse(await db.get(k) || "{}"), girl = v.sub === "בנות", key = (v.book || "") + "|" + v.sub;
    if (!v.sub) continue;
    v.k = k; out.recs.push(v); out.all++;
    (girl ? out.g : out.b).push(v.name); (out.by[key] = out.by[key] || { names: [], nameless: 0 }).names.push(v.name);
    if (v.name === "ללא שם") { out.nameless++; out.by[key].nameless++; }
  }
  for (const k of await db.list("gq:" + st.oid + ":")) { const v = JSON.parse(await db.get(k) || "null"); if (v) { v.k = k; out.pend.push(v); } }   /* תמונות שעוד לא יודעים של מי */
  out.pend.sort((x, y) => (x.ts || 0) - (y.ts || 0));
  return out;
}
/* כל התמונות של הילד הנוכחי (כל תמונה במפתח משלה – כמה תמונות באותו רגע לא דורסות זו את זו) */
async function kidPics(db, st, have){
  const out = [...(have || [])], seen = new Set(out.map(p => p.media));
  for (const k of await db.list("pp:" + st.oid + ":" + st.list.length + ":")) { const p = JSON.parse(await db.get(k) || "{}"); if (p.media && !seen.has(p.media)) { seen.add(p.media); out.push(p); } }
  return out.slice(0, 10);
}
/* סבבי התמונות בגן: לכל נושא – בנים ואז בנות (נושא אחד = 2 סבבים, שני נושאים = 4) */
const rounds = G => G.books.flatMap(b => [[b, "בנים"], [b, "בנות"]]);
const roundName = (G, r) => { const [b, sub] = rounds(G)[r]; return (G.books.length > 1 ? `"${book(b).name}" – ` : "") + sub; };
const grpName = (G, key) => { const [b, sub] = String(key).split("|"); return (G.books.length > 1 ? `"${book(b).name}" – ` : "") + sub; };
const kidName = t => String(t || "").split("\n")[0].replace(/[.,!׳"'״:]+$/g, "").replace(/\s+/g, " ").trim();
const badKid = n => !n || n.length > 25 || n.split(" ").length > 3 || /\d/.test(n.replace(/ ?\d+$/, "")) || junk(n);
/* שם שנשמע של בת בקבוצת הבנים (או להפך) – שואלים לפני ששומרים. רק סימנים חזקים, ותמיד אפשר לאשר "כן" */
const FEM = new Set("מרים תמר אביטל לין נעמי מאי רות אסתר יעל מיכל הדס רחל לאה אביגיל ענבל קרן גלית שירן שני ורד אילת כנרת יסמין מור דבורה שושנה ליבי אורין חן־לי".split(" "));
const MASC = new Set("דוד יוסף יוסי משה אברהם יצחק יעקב יונתן יהונתן איתי עידו יואב אורי רועי עומר תומר אלון גיא אסף בן מיכאל ניר רון אדם איתן נדב עידן אלעד אמיר ארי בועז הראל חיים יאיר ינאי מתן עוז שגיא אביתר אלי נהוראי ראם רפאל שמעון שמואל ישראל אהרון נתנאל אריה שלמה יהודה".split(" "));
const MASC_H = new Set("משה יונה אריה שלמה יהודה ישעיה זכריה נחמיה עובדיה טוביה אליה נוה".split(" "));
function sexHint(n){
  const w = String(n || "").split(" ")[0];
  if (FEM.has(w) || /ית$/.test(w) || (/ה$/.test(w) && !MASC_H.has(w))) return "בנות";
  if (MASC.has(w)) return "בנים";
  return "";
}
/* כיתוב של תמונה בגן: "נועה בת" / "דני בן" / "יוסי 2 בן" → {name, sub} */
function parseKid(t){
  let x = String(t || "").split("\n")[0].replace(/[.,!׳"'״:()\-–]+/g, " ").replace(/\s+/g, " ").trim(), sub = "";
  const m = x.match(/(?:^|\s)(בנות|בנים|בת|בן|ילדה|ילד|👧|👦)(?=\s|$)/u);
  if (m) { sub = /בנות|בת|ילדה|👧/u.test(m[1]) ? "בנות" : "בנים"; x = (x.slice(0, m.index) + " " + x.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim(); }
  return { name: x && !badKid(x) ? x : "", sub };
}
const realNames = a => [...new Set(a.filter(x => x !== "ללא שם"))];
const names = a => [...new Set(a)].join(", ");
const cnt = (n, one, many) => n === 1 ? one : n + " " + many;

async function ask(env, to, st, log, db){
  const c = st.cur || {}, n = (st.list || []).length, G = st.g;
  const S = m => wa(env, to, withRestart(m, st.step), log);
  switch (st.step) {
    case "hi": return S(buttons(HI, [["s:go", "❤️ ספר לילד או לנכד"], ["s:gan", "🏫 הזמנה לגן"], HUMAN]));
    case "for": return S(list(`${n ? "ולמי הספר הבא? ❤️" : "למי הספר? ❤️"}\nלוחצים על "בוחרים" ובוחרים.`, "בוחרים", [
      { id: "f:g:b", title: "👦 לנכד שלי" }, { id: "f:g:g", title: "👧 לנכדה שלי" }, { id: "f:p:b", title: "👦 לבן שלי" }, { id: "f:p:g", title: "👧 לבת שלי" }], "למי הספר"));
    case "book": if (!st.intro) { st.intro = 1; await S(text(BOOKS_INTRO)); }
      return S(list(`${c.ver ? `איזה ספר ל${kidW(st, c)}?` : n ? "איזה ספר לילד/ה הבא/ה?" : "איזה ספר תרצו?"}\nלוחצים על "בוחרים ספר" ובוחרים מהרשימה.`, "בוחרים ספר", bookRows(st.page || 0, "b:", c.ver), st.page ? "עוד ספרים" : "הספרים"));
    case "ver": {
      const b = book(c.book);
      if (b.img && !PAGES[b.id] && !st.reread) await S(image(b.img, b.name));   /* לספר בלי דוגמה – תמונת כריכה */
      st.reread = 0;
      return S(buttons(`"${b.name}" – בשביל בן או בת?${PAGES[b.id] ? "\n(מיד אחר כך נשלח לכם ספר לדוגמה 📖)" : ""}`, [["v:b", "👦 בן"], ["v:g", "👧 בת"]]));
    }
    case "name": return S(text(`✍️ מה השם הפרטי של ה${kidW(st, c)}?\nכותבים אותו כאן למטה, בהודעה רגילה 👇\n\nזה השם שבו ${c.ver === "g" ? `ה${kidW(st, c)} תיקרא` : `ה${kidW(st, c)} ייקרא`} לאורך כל הסיפור.`));
    case "ded": {
      const L = dedIdeas(c.ver === "g", st), idea = L[(c.dedI || 0) % L.length];
      return S(buttons(`הקדשה מכם ל${c.name} ❤️\n\n${idea}`, [["d:ok", "✅ מאשרים"], ["d:next", "✨ הקדשה אחרת"], ["d:own", "✍️ אכתוב בעצמי"]]));
    }
    case "dedown": return S(text("כתבו כאן את ההקדשה שלכם ❤️ (עד 300 תווים בערך)"));
    case "cover": {
      const covs = st.list.map(x => x.cover), m = covs.length + 1;
      const pr = k => orderTotal(covs.concat(k)) - orderTotal(covs);           /* כמה הספר הזה מוסיף */
      return S(buttons(`איזו כריכה ל"${bname(c.book, c.ver)}"?\n\n${COVERS.hard} – ${COVER_INFO.hard}\n\n${COVERS.soft} – ${COVER_INFO.soft}\n\n${m === 1 ? "המחיר לספר אחד" : "המחיר לספר הזה (כשיש " + m + " ספרים בהזמנה)"}: קשה ${ils(priceOf(m, "hard"))} · רכה ${ils(priceOf(m, "soft"))}`,
        [["cv:hard", `💗 קשה – ${ils(priceOf(m, "hard"))}`], ["cv:soft", `💛 רכה – ${ils(priceOf(m, "soft"))}`], ["q:cover", "❓ מה ההבדל?"]]));
    }
    case "pics": if (!st.vidPhoto) { st.vidPhoto = 1; await sendVideo(S, "photo", env, db, log); }
      return S(text(`עכשיו שולחים כאן תמונה של ${c.name} 📷\nאפשר כמה תמונות (עד ${PICS}) – ואנחנו נבחר את הטובה ביותר.\n\n${PHOTO_TIPS}`));
    case "picsmore": return S(buttons(`קיבלנו ${c.pics.length <= 1 ? "את התמונה" : c.pics.length + " תמונות"} של ${c.name} ✓\nאפשר לשלוח עוד, או להמשיך.`, [["p:done", "✅ סיימתי תמונות"]]));
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
    case "addr":
      if (st.mode === "gan") return S(text("לאיזו כתובת לשלוח? 📍\nכותבים עיר, רחוב ומספר (ואם צריך – קומה ודירה)."));
      if (!st.detIntro) { st.detIntro = 1; await S(text("כמעט סיימנו 🙂\nאנחנו מאוד מקווים שתאהבו את הסקיצות ❤️ ולכן כבר עכשיו צריך את הפרטים שלכם להזמנה: *כתובת מלאה, טלפון ואימייל*.")); }
      return S(text("📍 מה הכתובת המלאה?\nכותבים עיר, רחוב ומספר (ואם צריך – קומה ודירה)."));
    case "phone": return S(buttons(st.mode === "gan" ? `📞 לאיזה טלפון השליח יתקשר? ${fmtPhone(st.from)}?` : `📞 מספר הטלפון שלך: ${fmtPhone(st.from)}?`, [["ph:yes", "✅ כן, המספר הזה"], ["ph:other", "✍️ מספר אחר"]]));
    case "phoneown": return S(text("כתבו את מספר הטלפון 📞"));
    case "email": return S(buttons("📧 מה כתובת האימייל שלך?\nכותבים אותה כאן למטה 👇", [["em:none", "🚫 אין לי אימייל"]]));
    case "pay": return S(list(`💳 קודם מקבלים סקיצה, ומשלמים רק אם אוהבים ❤️\n\nבאיזו דרך נוח לך לשלם? שמש תשלח לך קישור לתשלום.`, "בוחרים דרך תשלום", Object.keys(PAYS).map(k => ({ id: "pay:" + k, title: PAYS[k] })), "תשלום"));

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
      const lines = ks.map(k => `${COVERS[k]} – ${COVER_INFO[k]}\n💰 ${ils(ganP(k, G.kids))} לספר`).join("\n\n");
      if (!st.vidCovers) { st.vidCovers = 1; await sendVideo(S, "covers", env, db, log); }
      return S(buttons(`איזו כריכה לספרים של הגן?\n\n${lines}${G.kids < STAPLE.from ? "\n\n(חוברת כרומו סיכות – רק מ-" + STAPLE.from + " ספרים)" : ""}`,
        ks.map(k => ["c:" + k, { hard: "💗 קשה פרימיום", soft: "💛 רכה פיג'מה", staple: "💜 כרומו סיכות" }[k]])));
    }
    case "g-dedmode": return S(buttons(`💌 *הקדשה מהגן*\nאפשר הקדשה אחת לכל הגן, או הקדשה נפרדת לכל ספר (${G.books.map(b => book(b).name).join(" / ")}).\nאת ההתאמה לבנים ולבנות אנחנו עושים 🙂`, [["gdm:one", "💌 אחת לכל הגן"], ["gdm:each", "📚 אחת לכל ספר"]]));
    case "g-ded": {
      const L = ganDed(st), idea = L[(G.dedI || 0) % L.length], per = G.dedFor && G.dedFor !== "all";
      return S(buttons(`${per ? `הקדשה לספר "${book(G.dedFor).name}" ❤️` : "הקדשה מהגן לכל הילדים ❤️"}\n(בלי שמות – השם של כל ילד כבר בספר. את ההתאמה לבנים ולבנות אנחנו עושים)\n\n${idea}`, [["gd:ok", "✅ מאשרים"], ["gd:next", "✨ הקדשה אחרת"], ["gd:own", "✍️ אכתוב בעצמי"]]));
    }
    case "g-dedown": return S(text(`כתבו כאן את ההקדשה${G.dedFor && G.dedFor !== "all" ? ` לספר "${book(G.dedFor).name}"` : " של הגן"} ❤️ (עד 350 תווים בערך)\nכותבים פעם אחת – ואת ההתאמה לבנים ולבנות אנחנו עושים.`));
    case "g-who": return S(buttons(`מי שולח את התמונות? 📷\n\n📷 *הגננת או הוועד* – שולחים כאן את כל התמונות.\n👨‍👩‍👧 *כל הורה בעצמו* – נכין לך הודעה עם קישור להעביר לקבוצת ההורים. כל הורה מאשר ושולח תמונה של הילד שלו.\n\nאפשר גם לשלב: חלק מההורים שולחים, ואת השאר משלימים כאן.`,
      [["gw:me", "📷 גננת / ועד"], ["gw:par", "👪 כל הורה בעצמו"]]));
    case "p-consent": return S(buttons(`שלום 💗 כאן BOOQLI.\nמכינים ספר אישי לכל ילדי *${G.name}* – "${book(G.books[0]).name}" 📖✨\n\nלפני ששולחים תמונה:\n${CONSENT_LINKS}בלחיצה על הכפתור אני מאשר/ת:\n☑️ קראתי את התקנון ואת מדיניות הפרטיות.\n☑️ אני ההורה של הילד/ה, ומאשר/ת לשלוח ל-BOOQLI את התמונה כדי ליצור ממנה איורים לספר האישי (גם באמצעות בינה מלאכותית – AI).`,
      [["pc:yes", "☑️ קראתי ומאשר/ת"]]));
    case "g-pics": case "g-picsmore": if (st.mode === "parent") {      /* הורה */
      const P = await ganPics(db, st);
      if (P.pend.filter(x => x.by === st.from).length) return askPendF(S, st, P.pend.filter(x => x.by === st.from)[0], 1);
      if (st.pdone) return S(text(`תודה רבה! 💗 התמונה התקבלה, והספר בדרך.\nיש עוד ילד/ה ב${G.name} (למשל תאומים)? שולחים עוד תמונה עם כיתוב שם + בן/בת.`));
      if (!st.vidPhoto) { st.vidPhoto = 1; await sendVideo(S, "photo", env, db, log); }
      return S(text(`📸 שלחו כאן *תמונה אחת* של הילד/ה, *עם כיתוב*: השם הפרטי + בן או בת.\nלמשל: *נועה בת* · *דני בן*\n(בטלפון: בוחרים תמונה ← כותבים בשורה "הוספת כיתוב" ← שולחים)\n\n${PHOTO_TIPS}`));
    } else {
      if (!G.par && !st.vidPhoto) { st.vidPhoto = 1; await sendVideo(S, "photo", env, db, log); }
      if (!G.par && !G.picIntro) { G.picIntro = 1; await S(text(`עכשיו התמונות 📷 *תמונה אחת לכל ילד/ה.*\n\nשולחים כל תמונה *עם כיתוב*: השם הפרטי + בן או בת.\nלמשל: *נועה בת* · *דני בן*\n\nאפשר לשלוח כמה תמונות ביחד ובאיזה סדר שרוצים – כל אחת עם הכיתוב שלה.\n(בטלפון: בוחרים תמונה ← כותבים בשורה "הוספת כיתוב" ← שולחים)\n\n${PHOTO_TIPS}\n\n👯 שני ילדים עם אותו שם? כותבים "יוסי 1 בן", "יוסי 2 בן".`)); }
      const P = await ganPics(db, st), mine = P.pend.filter(x => !x.by || x.by === st.from);
      if (mine.length) return askPendF(S, st, mine[0], mine.length);
      const nb = realNames(P.b).length, ng = realNames(P.g).length;
      if (G.par) return S(buttons(`👨‍👩‍👧 *ההורים שולחים* · קיבלנו עד עכשיו: 👧 ${cnt(ng, "בת אחת", "בנות")} · 👦 ${cnt(nb, "בן אחד", "בנים")}${G.kids ? ` (מתוך ${G.kids})` : ""}${P.all ? "\n👧 " + (realNames(P.g).join(", ") || "—") + "\n👦 " + (realNames(P.b).join(", ") || "—") : ""}\n\nאפשר גם לשלוח כאן בעצמך תמונות של מי שחסר (שם + בן/בת).\nלמצב מעודכן – כותבים *מצב* · להודעה להורים שוב – כותבים *קישור*`.slice(0, 1020),
        [["g:fin", "✅ סיימנו"], ["g:remind", "📩 תזכורת להורים"], ["g:pause", "⏸️ נמשיך מחר"]]));
      return S(buttons(`*עד עכשיו:* 👧 ${cnt(ng, "בת אחת", "בנות")} · 👦 ${cnt(nb, "בן אחד", "בנים")}${G.kids ? ` (מתוך ${G.kids})` : ""}\n\n${st.gname ? `עכשיו שולחים את התמונה של *${st.gname}* 📷` : "ממשיכים לשלוח תמונות – כל אחת עם שם + בן/בת 👇"}`,
        P.all ? [["g:fin", "✅ סיימתי תמונות"], ["g:pause", "⏸️ נמשיך מחר"]] : [["g:pause", "⏸️ נמשיך מחר"], ["g:drive", "📁 אעדיף דרייב"]]));
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
  const lines = st.list.map((c, i) => `❤️ *ספר ${i + 1}: ${bname(c.book, c.ver)}* (${kidW(st, c)})\n📕 ${COVERS[c.cover || "hard"]}\n👤 שם: *${c.name}*\n✍️ הקדשה: ${c.ded}\n📷 ${c.pics.length} ${c.pics.length === 1 ? "תמונה" : "תמונות"}${links && c.pics.some(p => p.link) ? ":\n" + c.pics.filter(p => p.link).map(p => p.link).join("\n") : ""}`);
  return `📋 *סיכום הזמנה ${st.oid}*\n👤 המזמין/ה: ${st.who} (${isP(st) ? "הורה" : "סבא/סבתא"})\n\n${lines.join("\n\n")}\n\n💰 ${priceLine(covs)}\n${st.ship && st.ship.method === "pickup" ? "🚗 איסוף עצמי מבית הדפוס (ליד עפולה), בתיאום" : "🚚 משלוח צ'יטה עד הבית – " + ils(SHIP)}\n*סה"כ ${ils(t + shipCost(st))}*${st.pay ? "\n💳 תשלום: " + PAYS[st.pay] : ""}${st.ship ? `\n\n*הפרטים שלכם:*\n👤 ${st.who}\n📍 ${st.ship.addr || "—"}\n📞 ${st.ship.phone || "—"}\n📧 ${st.ship.email || "—"}` : ""}\n\n✓ אישור ההורים לתמונות – התקבל`;
}
async function ganSummary(st, db, owner){
  const G = st.g, P = await ganPics(db, st), p = ganP(G.cover, G.kids);
  const nb = realNames(P.b), ng = realNames(P.g);
  const lines = rounds(G).map(([b, sub], i) => `${sub === "בנים" ? "👦" : "👧"} ${roundName(G, i)}: ${realNames((P.by[b + "|" + sub] || { names: [] }).names).join(", ") || "—"}`).join("\n") + (owner && P.recs.some(r => r.rep) ? `\n🔄 הוחלפה תמונה: ${P.recs.filter(r => r.rep).map(r => r.name).join(", ")} (בדרייב – החדשה היא האחרונה)` : "");
  const byPar = P.recs.filter(r => r.parent).length;
  return `📋 *סיכום הזמנה ${st.oid}*\n🏫 ${G.name} · הגננת/הוועד: ${st.who}${byPar ? `\n👨‍👩‍👧 ${byPar} תמונות נשלחו ע"י ההורים (כל הורה אישר את התקנון ואת השימוש בתמונה)` : ""}\n📚 ${G.books.map(id => book(id).name).join(" + ")}\n📕 ${COVERS[G.cover]}\n👧👦 ${G.kids} ספרים · ${cnt(nb.length, "בן אחד", "בנים")}, ${cnt(ng.length, "בת אחת", "בנות")}\n\n${lines}${P.nameless ? `\n⚠️ ${cnt(P.nameless, "תמונה אחת", "תמונות")} בלי שם` : ""}\n\n✍️ הקדשה: ${G.ded}${shipLine(st) ? "\n\n" + shipLine(st) : ""}${st.pay ? "\n💳 תשלום: " + PAYS[st.pay] : ""}${owner ? `\n\n💰 לפי המחירון: ${G.kids} × ${p} ₪ = ${ils(G.kids * p)}${shipCost(st) ? " + משלוח " + ils(SHIP) : ""} = ${ils(G.kids * p + shipCost(st))}` : ""}\n\n✓ אישור ההורים לתמונות – התקבל`;
}

/* תשובה בכתב לשאלה עם כפתורים: "בת", "קשה", "ביט", "חיבוקים", "כן"... ← הכפתור המתאים */
const YES = ["c:yes", "gc:yes", "d:ok", "gd:ok", "g:ok", "w:yes", "ph:yes", "m:yes", "gd:done"], DONE = ["p:done", "g:rdone", "gd:done", "m:no", "g:one"];
/* תשובה שלא יכולה להיות שם / הקדשה / כתובת: בלי אותיות, או רק "כן", "לא", "אוקי"... */
const junk = t => !/[א-תa-z]/i.test(t || "") || /^(כן|לא|אוקי|ok|בסדר|תודה|זהו|סיימתי|מה|למה|איך|נכון|יופי|מעולה)[.!?]*$/i.test(String(t).trim());
const NO = ["m:no", "w:other", "ph:other", "d:next", "gd:next", "g:one", "p:done"];
const norm = t => String(t || "").replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim();
async function matchBtn(env, from, st, txt, db){
  if (st.step === "hi") return /גן|גננת|גננות/.test(txt) ? "s:gan" : /ספר|נכד|ילד|הזמנ|להזמין|בן|בת|נכדה|סבתא|סבא/.test(txt) ? "s:go" : "";
  const log = [];
  await ask(env, from, JSON.parse(JSON.stringify(st)), log, db);                  /* מה השאלה הנוכחית מציעה */
  const opts = [];
  for (const m of log) { const i = m.interactive; if (!i) continue;
    if (i.type === "button") i.action.buttons.forEach(b => opts.push([b.reply.id, b.reply.title]));
    else i.action.sections.forEach(sec => sec.rows.forEach(r => opts.push([r.id, r.title]))); }
  const ids = opts.map(o => o[0]).filter(x => x !== "restart" && x !== "human" && !x.startsWith("page:"));
  const t = norm(txt), w = t.split(" ");
  if (/^(כן|כמובן|בטח|מאשר|מאשרת|מאשרים|אישור|נכון|אוקי|ok|יופי|מעולה)$/i.test(t)) { const y = ids.filter(x => YES.includes(x)); if (y.length === 1) return y[0]; }
  if (t === "לא") { const n = ids.filter(x => NO.includes(x)); if (n.length === 1) return n[0]; }
  if (/^(זהו|סיימתי|סיימנו|זה הכל|זה הכול|די|מספיק)$/.test(t)) { const d = ids.filter(x => DONE.includes(x)); if (d.length === 1) return d[0]; }
  const exact = opts.filter(([id, ti]) => ids.includes(id) && norm(ti) === t); if (exact.length === 1) return exact[0][0];
  const part = opts.filter(([id, ti]) => ids.includes(id) && t.length >= 2 && (norm(ti).split(" ").some(x => w.includes(x) && x.length >= 2)));
  return part.length === 1 ? part[0][0] : "";
}
/* כמה תמונות ברצף: כל תמונה נשמרת לבד, ועונים רק אחרי האחרונה (מחכים רגע לראות אם מגיעה עוד) */
async function lastInBurst(db, from, log){
  if (log) return true;
  const me = Date.now() + ":" + Math.random().toString(36).slice(2, 8);
  await db.put("burst:" + from, me, 120);
  await new Promise(r => setTimeout(r, 3500));
  return (await db.get("burst:" + from)) === me;
}
/* גן – תמונה שעוד לא יודעים של מי (או שלשם הזה כבר יש תמונה): שואלים, עם ציטוט של התמונה */
function askPendF(S, st, pr, n){
  st.gask = pr.k;
  if (pr.dup && pr.dupOther) return S(quote(buttons(`כבר קיבלנו תמונה של *${pr.name}* (${pr.sub === "בנות" ? "בת" : "בן"}) מהורה אחר 🙂\nזה ילד/ה אחר/ת עם אותו שם?`,
    [["gr:new", "👯 כן, ילד/ה אחר/ת"], ["gr:no", "❌ לא, לא לשמור"]]), pr.mid));
  if (pr.dup) return S(quote(buttons(`ל*${pr.name}* (${pr.sub === "בנות" ? "בת" : "בן"}) כבר יש תמונה.\nבגנים – תמונה אחת לכל ילד/ה. מה עושים עם התמונה הזו?`,
    [["gr:rep", "🔄 להחליף"], ["gr:new", "👯 ילד/ה אחר/ת"], ["gr:no", "❌ לא לשמור"]]), pr.mid));
  if (pr.name && !pr.sub) return S(quote(buttons(`*${pr.name}* – בן או בת?`, [["gx:b", "👦 בן"], ["gx:g", "👧 בת"]]), pr.mid));
  return S(quote(text(`של מי התמונה הזו? 📷\nכותבים שם + בן/בת, למשל: *נועה בת*${n > 1 ? `\n(יש עוד ${n - 1} ${n - 1 === 1 ? "תמונה" : "תמונות"} בלי שם – נשאל על כל אחת)` : ""}`), pr.mid));
}

async function step(env, from, st, ev, log, db){
  const stepBefore = st.step;
  const S = m => wa(env, from, m, log);
  const RB = (bid, v) => readBook(S, bid, v, env, db, log);
  const sample = async () => {                                     /* ספר לדוגמה אוטומטי, בגרסה שבחרו (אם יש) */
    const P = PAGES[st.cur.book] || {}, vv = P[st.cur.ver] ? st.cur.ver : Object.keys(P)[0];
    if (vv) await RB(st.cur.book, vv);
  };
  const c = st.cur, G = st.g;
  /* גן – הקדשה: אחת לכל הגן, או אחת לכל ספר (ההתאמה לבנים/בנות – אצל שמש) */
  const toDed = () => { G.deds = {}; G.dedFor = "all"; G.dedI = 0; st.step = G.books.length > 1 ? "g-dedmode" : "g-ded"; };
  const dedDone = (t, i) => {
    G.deds = G.deds || {}; G.deds[G.dedFor || "all"] = i != null ? { i, t } : { own: t, t };
    const bi = G.books.indexOf(G.dedFor);
    if (G.dedFor && G.dedFor !== "all" && bi >= 0 && bi + 1 < G.books.length) { G.dedFor = G.books[bi + 1]; G.dedI = 0; st.step = "g-ded"; return; }
    G.ded = G.deds.all ? G.deds.all.t : G.books.map(b => `📚 ${book(b).name}:\n${(G.deds[b] || {}).t || ""}`).join("\n\n");
    G.grp = ""; st.step = "g-who";
  };
  const askPend = (pr, n) => askPendF(S, st, pr, n);
  /* גן – משייכים תמונות שממתינות: שם בכיתוב / שם שנכתב קודם / תשובה לשאלה. כפילות (אותה תמונה בדיוק) – מזהים לפי חתימת הקובץ */
  const ganFlush = async () => {                                  /* פיילוט: כל תמונה עם כיתוב "שם + בן/בת", בכל סדר */
    const P = await ganPics(db, st), shas = new Map(P.recs.filter(r => r.sha).map(r => [r.sha, r.name])), b = G.books[0];
    st.gask = "";
    for (const pr of P.pend) {
      if (pr.by && pr.by !== from) continue;                         /* כל שולח (גננת / כל הורה) מטפל רק בתמונות שלו */
      if (pr.sha && shas.has(pr.sha)) { await db.del(pr.k); await S(quote(text(`את התמונה הזו כבר קיבלתי (${shas.get(pr.sha)}) ✓`), pr.mid)); continue; }
      const c = parseKid(pr.cap);
      if (!pr.name && c.name) pr.name = c.name;
      if (!pr.sub && c.sub) pr.sub = c.sub;
      if (!pr.name && st.gname) { pr.name = st.gname; if (!pr.sub && st.gsex) pr.sub = st.gsex; st.gname = ""; st.gsex = ""; }
      if (!pr.name || !pr.sub) { await db.put(pr.k, JSON.stringify(pr), 90 * 86400); return askPend(pr, P.pend.length - P.pend.indexOf(pr)); }
      const sub = pr.sub, old = P.recs.filter(r => r.sub === sub && r.name === pr.name);
      if (old.length && !pr.rep) { pr.dup = 1; pr.dupOther = st.mode === "parent" && old.some(o => o.by !== from) ? 1 : 0; await db.put(pr.k, JSON.stringify(pr), 90 * 86400); return askPend(pr, 1); }
      for (const o of old) { if (o.drive) await drivePost(env, { action: "trash", file: o.drive }); await db.del(o.k); }   /* הוחלפה – הישנה לאשפה בדרייב */
      const p = await savePic(env, st, sub, pr.name, { media: pr.media }, from, db, "");
      await db.put("gp:" + st.oid + ":" + Date.now() + Math.random().toString(36).slice(2, 6), JSON.stringify({ book: b, topic: "", sub, name: pr.name, drive: p.drive || "", pending: p.pending || "", mime: p.mime || "", sha: pr.sha || "", media: pr.media, rep: old.length ? 1 : 0, by: from, parent: st.mode === "parent" ? 1 : 0, cons: st.consentAt || "" }), 90 * 86400);
      await db.del(pr.k);
      if (pr.sha) shas.set(pr.sha, pr.name);
      await S(quote(text(`📷 ${pr.name} · ${sub === "בנות" ? "בת 👧" : "בן 👦"} ✓${old.length ? " (הוחלפה)" : ""}`), pr.mid));
      if (st.mode === "parent") st.pdone = (st.pdone || 0) + 1;   /* שם ליד התמונה – לבדיקה */
    }
    return ask(env, from, st, log, db);
  };
  let id = ev.id || "";
  const txt = (ev.text || "").trim();
  const picsStep = async () => {                                /* תמונות בגן – הגננת/הוועד וגם הורה (אותו קוד) */
      st.step = "g-pics";
      if (ev.image) {                                                  /* קודם "בהמתנה" – ורק כשיודעים של מי ובן/בת, מעלים לדרייב */
        await db.put("gq:" + st.oid + ":" + Date.now() + Math.random().toString(36).slice(2, 6), JSON.stringify({ media: ev.image.media, sha: ev.image.sha || "", cap: ev.caption || "", mid: ev.mid || "", ts: Date.now(), by: from }), 90 * 86400);
        if (!(await lastInBurst(db, from, log))) return;             /* הרבה תמונות ברצף – עונים אחרי האחרונה */
        return ganFlush();
      }
      if (/^gx:[bg]$/.test(id) && st.gask) {                          /* בן או בת לתמונה שממתינה */
        const pr = JSON.parse(await db.get(st.gask) || "null"); if (!pr) { st.gask = ""; return ask(env, from, st, log, db); }
        pr.sub = id === "gx:g" ? "בנות" : "בנים"; await db.put(st.gask, JSON.stringify(pr), 90 * 86400);
        return ganFlush();
      }
      if (id === "g:fin") { const P = await ganPics(db, st); if (P.pend.some(x => !x.by || x.by === from)) { await S(text("רגע 🙂 יש עוד תמונה שלא יודעים של מי:")); return ask(env, from, st, log, db); } if (!P.all) { await S(text("עוד לא קיבלנו תמונות 🙂")); return ask(env, from, st, log, db); } st.step = "g-check"; return ask(env, from, st, log, db); }
      if (/^gr:(rep|new|no)$/.test(id) && st.gask) {                    /* לשם הזה כבר יש תמונה */
        const pr = JSON.parse(await db.get(st.gask) || "null"); if (!pr) { st.gask = ""; return ask(env, from, st, log, db); }
        if (id === "gr:no") { await db.del(st.gask); st.gask = ""; await S(text("אין בעיה – לא שמרנו את התמונה הזו 👍")); return ganFlush(); }
        if (id === "gr:rep" && pr.dupOther) return ask(env, from, st, log, db);   /* הורה לא מחליף תמונה של הורה אחר */
        pr.dup = 0;
        if (id === "gr:new") { const P = await ganPics(db, st), have = new Set(P.recs.filter(r => r.sub === pr.sub).map(r => r.name)); let n = 2; while (have.has(pr.name + " " + n)) n++; pr.name = pr.name + " " + n; }
        else pr.rep = 1;
        await db.put(st.gask, JSON.stringify(pr), 90 * 86400);
        return ganFlush();
      }
      if (id === "g:remind" || (G.par && /^(קישור|הקישור|ההודעה להורים)$/.test(txt))) { await S(text("📩 מעבירים לקבוצת ההורים 👇")); await S(text(parentsMsg(env, st, id === "g:remind"))); return ask(env, from, st, log, db); }
      if (/^(מצב|סטטוס|מה המצב)[?!.]*$/.test(txt)) return ask(env, from, st, log, db);
      if (id === "g:pause") { await S(text("אין בעיה ❤️ שמרנו הכל.\nכשתרצו להמשיך – פשוט שולחים עוד תמונות, או כותבים \"להמשיך\".")); return; }
      if (id === "g:drive") { st.human = Date.now(); await S(buttons("אין בעיה ❤️ שמש תשלח לך כאן קישור לתיקייה בדרייב בהקדם (א׳–ה׳ 8:00–18:00).\n\nכשתרצו לחזור להזמנה כאן – לוחצים 👇", RESUME_BTN)); return; }
      if (txt && !id && !/^להמשיך$/.test(txt)) {
        const c = parseKid(txt);
        if (st.gask) {                                                  /* תשובה ל"של מי התמונה?" */
          const pr = JSON.parse(await db.get(st.gask) || "null");
          if (pr && (c.name || c.sub)) { if (c.name) pr.name = c.name; if (c.sub) pr.sub = c.sub; await db.put(st.gask, JSON.stringify(pr), 90 * 86400); return ganFlush(); }
          await S(text("כותבים שם + בן/בת 🙂 למשל: *נועה בת*")); return ask(env, from, st, log, db);
        }
        const mv = txt.match(/^(?:להעביר (?:את )?)?(.+?)\s+(?:ל|זו |זה |היא |הוא )?(בנות|בנים|בת|בן)[.!]?$/);
        if (mv && !badKid(kidName(mv[1]))) {                            /* "מרים לבנות" – תמונה שכבר נשמרה בבן/בת הלא נכון */
          const who = kidName(mv[1]), to = /בנות|בת/.test(mv[2]) ? "בנות" : "בנים";
          const P = await ganPics(db, st), rec = P.recs.find(r => r.name === who && r.sub !== to && (st.mode !== "parent" || r.by === from));
          if (rec && !P.recs.some(r => r.name === who && r.sub === to)) {
            const p = await savePic(env, st, to, who, { media: rec.media }, from, db, "");
            if (rec.drive) await drivePost(env, { action: "trash", file: rec.drive });
            await db.del(rec.k);
            await db.put("gp:" + st.oid + ":" + Date.now() + Math.random().toString(36).slice(2, 6), JSON.stringify(Object.assign({}, rec, { k: undefined, sub: to, drive: p.drive || "", pending: p.pending || "" })), 90 * 86400);
            await S(text(`✓ העברתי את ${who} ל*${to}*`));
            return ask(env, from, st, log, db);
          }
        }
        if (!c.name) { await S(text("כותבים שם + בן/בת 🙂 למשל: *נועה בת*\n(או שולחים תמונה עם הכיתוב הזה)")); return ask(env, from, st, log, db); }
        st.gname = c.name; st.gsex = c.sub;                             /* שם לפני התמונה – גם בסדר */
      }
      return ask(env, from, st, log, db);
        return ask(env, from, st, log, db);
  };
  if (st.mode === "parent") {                                      /* הורה: אישור ← תמונה עם כיתוב. כל שאר הדברים – לשמש */
    if (st.step === "p-consent") { if (id === "pc:yes") { st.consentAt = new Date().toISOString(); st.step = "g-pics"; } return ask(env, from, st, log, db); }
    const c = txt ? parseKid(txt) : {};
    if (ev.image || /^(gx:|gr:)/.test(id) || (txt && (st.gask || (c.name && c.sub) || /^להעביר /.test(txt)))) return picsStep();
    if (txt || id) {
      if (txt) await logQA(env, st, from, "q", "הורה – " + G.name, txt);
      return S(text(`תודה 💗 ${txt ? "העברתי לשמש, והיא תענה לך כאן בהקדם." : ""}\nלשליחת תמונה: שולחים תמונה עם כיתוב *שם + בן/בת*.`));
    }
    return;
  }

  if (!st.oid) { st.oid = newId("סב"); st.day = dayStr(); }
  if (!st.from) st.from = from;
  if (!id && st.mode === "gan" && /^(דוגמה|דוגמא|דוגמה בחינם|רוצה דוגמה|רוצה דוגמא)[.!]?$/.test(txt)) {   /* גננת מבקשת דוגמה ראשונית בחינם */
    st.human = Date.now();
    await S(buttons("מעולה! 🎉 שלחי כאן תמונה של ילד/ה שאת מכירה + השם, ושמש תכין לך דוגמה ראשונית – בלי עלות ובלי התחייבות 💗\n\nאפשר בינתיים להמשיך בהזמנה 👇", RESUME_BTN));
    await alertOwner(env, st, from, "גננת מבקשת דוגמה בחינם", txt);
    await logQA(env, st, from, "q", "גננת מבקשת דוגמה בחינם", txt);
    return;
  }
  if (id === "human" || (!id && HUMAN_TXT.test(txt))) {
    st.human = Date.now();
    await S(buttons("בשמחה ❤️ שמש תענה לך כאן בהקדם (א׳–ה׳ 8:00–18:00).\n\nכשתרצו לחזור להזמנה – לוחצים כאן, וממשיכים בדיוק מאיפה שעצרנו 👇", RESUME_BTN));
    await alertOwner(env, st, from, st.lastQ ? "לא עזר – מבקשת את שמש" : "מבקשת לדבר עם שמש", st.lastQ || txt);
    await logQA(env, st, from, "q", st.lastQ ? "לא עזר – מבקשת את שמש" : "מבקשת לדבר עם שמש", st.lastQ || txt);
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
  /* מתחרטים בהקדשה: "דווקא ההקדשה שלכם" – חוזרים להקדשה המוכנה */
  if (txt && !id && DED_BACK.test(txt) && txt.length <= 60 && (["dedown", "cover"].includes(st.step) || (st.step === "g-dedown" && !G.dedOwn))) {
    st.step = st.mode === "gan" ? "g-ded" : "ded";
    await S(text("אין בעיה ❤️ חוזרים להקדשה שהצענו:"));
    return ask(env, from, st, log, db);
  }
  /* מספר לבד, בשלב שלא מצפה למספר ("100") – לא מתעלמים: שואלים למה הכוונה ומכוונים לתשובה שהבוט יודע */
  if (!id && /^\d{1,4}$/.test(txt) && !["g-kids", "phone", "phoneown"].includes(st.step)) {
    const n = +txt;
    return S(buttons(`כתבת "${txt}" 🙂 למה הכוונה?`, [["calc:" + n, `💰 מחיר ל-${n} ספרים`.slice(0, 20)], ["qa:go", "▶️ להמשיך בהזמנה"], ["human", "🙋 לדבר עם שמש"]]));
  }
  if (id.startsWith("calc:")) { const n = +id.slice(5); st.lastQ = "מחיר ל-" + n; await sendLong(S, priceCalc(st.mode === "gan" || n >= STAPLE.from, n > 0 && n < 1000 ? n : 0)); return S(buttons("עזר? 🙂", QA_BTNS)); }
  /* כתבו תשובה במקום ללחוץ על כפתור */
  const SHORT_OK = ["ded", "g-ded", "who"];                                  /* שם אפשר גם לכתוב טקסט חופשי – רק תשובה קצרה נחשבת לכפתור */
  if (!id && txt && (BTN_STEPS.includes(st.step) || (SHORT_OK.includes(st.step) && txt.length <= 12)) && !looksQuestion(txt)) id = await matchBtn(env, from, st, txt, db);
  if (!id && st.step === "phone" && txt.replace(/\D/g, "").length >= 9) { st.ship.phone = txt.slice(0, 30); st.step = st.mode === "gan" ? "pay" : "email"; return ask(env, from, st, log, db); }
  /* שאלות: "שאלות" = תפריט; שאלה חופשית בכל שלב = תשובה רק מתוך מה שיש בבוט, ואם אין – לשמש */
  const isQ = looksQuestion(txt) || (!id && txt.split(/\s+/).length <= 3 && !["g-pics", "g-picsmore", "name"].includes(st.step) && (/^(מחיר|מחירים|כמה עולה|עלות|משלוח|תשלום|כמה זמן)[?.!]*$/.test(txt) || (st.step !== "dedown" && st.step !== "g-dedown" && !!(faqOf(txt, st.step) && faqOf(txt, st.step) !== "menu"))));
  const free = !["dedown", "g-dedown", "addr", "email"].includes(st.step) || (isQ && !!(qaOf(txt) || faqOf(txt)));
  const asking = !id && txt && free && (isQ || BTN_STEPS.includes(st.step));
  const fq = id.startsWith("q:") ? id.slice(2) : (asking || (!id && txt && free && faqOf(txt) === "menu") ? faqOf(txt, st.step) : "");
  if (fq === "menu") { await S(list("❓ במה אפשר לעזור?\nבוחרים נושא – או פשוט כותבים את השאלה.", "בוחרים שאלה", Object.keys(FAQ).filter(k => k !== "price" || st.mode === "gan").map(k => ({ id: "q:" + k, title: FAQ[k][2], description: FAQ[k][0].replace(/^\S+ /, "").slice(0, 72) })), "שאלות")); return; }
  let answer = "";
  if (fq === "know") answer = KNOW;
  else if (fq === "price") { const n = parseInt((txt.match(/\d{1,3}/) || [])[0], 10); answer = priceCalc(st.mode === "gan" || n >= STAPLE.from, n > 0 && n < 1000 ? n : (st.mode === "gan" ? G.kids : 0)); }
  else if (fq && FAQ[fq] && FAQ[fq][1].startsWith("video:")) { st.lastQ = txt || fq; await sendVideo(S, FAQ[fq][1].slice(6), env, db, log); return S(buttons("עזר? 🙂", QA_BTNS)); }
  else if (fq && FAQ[fq]) answer = faqMsg(fq);
  else if (asking) { const k = qaOf(txt); if (k) answer = QA[k].a(st); }
  if (answer) { st.lastQ = txt || fq; await sendLong(S, answer); return S(buttons("עזר? 🙂", QA_BTNS)); }
  if (asking && !isQ) {                                           /* לא שאלה ולא כפתור – מסבירים ושואלים שוב; בפעם השנייה – מציעים דרכים */
    st.miss = (st.miss || 0) + 1;
    if (st.miss >= 2) { st.miss = 0; return S(buttons("לא הצלחתי להבין 🙂 מה נעשה?", [["qa:go", "▶️ להמשיך"], ["restart", "↩️ להתחיל מחדש"], ["human", "🙋 לדבר עם שמש"]])); }
    await S(text("לא בטוח שהבנתי 🙂 בוחרים באחת האפשרויות למטה 👇\n(ואם יש שאלה – פשוט כותבים אותה)"));
    return ask(env, from, st, log, db);
  }
  if (asking) {                                                  /* לא יודע – לא מנחש: עובר לשמש, ובינתיים ממשיכים */
    await S(text("שאלה טובה 🙂 אני רוצה שתקבלי תשובה מדויקת – העברתי אותה לשמש, והיא תענה לך כאן בהקדם (א׳–ה׳ 8:00–18:00).\nבינתיים ממשיכים בהזמנה 👇"));
    await alertOwner(env, st, from, "שאלה שהבוט לא יודע לענות עליה", txt);
    await logQA(env, st, from, "q", "שאלה שהבוט לא יודע לענות עליה", txt);
    return ask(env, from, st, log, db);
  }
  /* מתחרטים: לחצו על כפתור משלב קודם – חוזרים לשלב ההוא וממשיכים משם */
  const back = btnStep(id);
  if (back && back !== st.step && canBack(st.step, back)) {
    st.step = back;
    if (back === "ded" && c.ded) c.ded = "";
    if (!/^(d|gd):next$/.test(id)) await S(text("אין בעיה ❤️ עדכנו."));
  }
  if (id.startsWith("page:")) { st.page = +id.slice(5); if (st.step === "ver") st.step = "book"; return ask(env, from, st, log, db); }
  switch (st.step) {
    case "hi":
      if (id === "s:go") { await S(text(PROCESS(false) + "\n\n" + priceCalc(false, 0))); st.step = "for"; }
      else if (id === "s:gan") {                                    /* פתיחה מלהיבה לגנים: סרטון הקיט + ההודעה של שמש + איך זה עובד */
        st.mode = "gan"; st.oid = newId("גן"); st.intro = 1;
        await sendVideo(S, "kit", env, db, log);
        await sendLong(S, GAN_PITCH(0) + "\n\n🧮 רוצים מחיר לכמות אחרת? כותבים \"מחיר\" ומספר, למשל: *מחיר 35*");
        await S(text(PROCESS(true)));
        st.step = "g-name";
      }
      break;
    case "for": {
      const m = id.match(/^f:(g|p)(?::(b|g))?$/);
      if (m) {
        if (!st.list.length) { st.role = m[1]; if (st.role === "p") st.oid = st.oid.replace(/^סב-/, "הו-"); }
        c.ver = m[2] || ""; st.page = 0; st.step = "book";
      }
      break;
    }
    case "book": if (id.startsWith("b:") && book(id.slice(2))) {
        c.book = id.slice(2); c.ded = "";
        if (c.ver) { st.step = "name"; await sample(); } else st.step = "ver";   /* כבר יודעים בן/בת – לא שואלים שוב */
      }
      break;
    case "ver":
      if (id.startsWith("b:") && book(id.slice(2))) { c.book = id.slice(2); break; }        /* בחרו ספר אחר מהרשימה */
      if (id === "r:read" && PAGES[c.book]) return readAsk(S, c.book, RB);
      if (id === "v:b" || id === "v:g") {
        c.ver = id.slice(2); c.ded = ""; st.step = "name";
        await sample();
      }
      break;
    case "name": if (id.startsWith("b:") && book(id.slice(2))) { c.book = id.slice(2); if (c.ver) await sample(); else st.step = "ver"; break; }   /* לחצו על ספר אחר מהרשימה */
      if (id === "nm:first" && st.nameTry) { c.name = st.nameTry.split(" ")[0]; st.nameTry = ""; st.step = "ded"; break; }
      if (id === "nm:all" && st.nameTry) { c.name = st.nameTry; st.nameTry = ""; st.step = "ded"; break; }
      if (id === "nm:again") { st.nameTry = ""; break; }
      if (txt && !id) {                                                      /* בודקים שזה שם פרטי בלבד */
        const nm = txt.replace(/[.,!׳"'״]+$/g, "").replace(/\s+/g, " ").trim(), w = nm.split(" ");
        if (/\d/.test(nm) || nm.length > 25 || w.length > 3 || junk(nm)) {
          return S(text("נראה לי שזה לא שם 🙂\nכותבים רק את *השם הפרטי*, למשל: נועה"));
        }
        if (w.length > 1) {
          st.nameTry = nm;
          const cut = t => t.length > 19 ? t.slice(0, 18) + "…" : t;
          return S(buttons(`כתבתם "${nm}".\nבספר מופיע רק *השם הפרטי* – בלי שם משפחה.\n(שם פרטי כפול, כמו "שי לי"? בוחרים את השם המלא)\n\nאיך לכתוב את השם בספר?`,
            [["nm:first", cut("✅ " + w[0])], ["nm:all", cut("✅ " + nm)], ["nm:again", "✍️ לכתוב שוב"]]));
        }
        c.name = nm; st.step = "ded";
      }
      break;
    case "ded":
      if (id === "d:ok") { const L = dedIdeas(c.ver === "g", st); c.ded = L[(c.dedI || 0) % L.length]; st.step = c.pics.length ? "picsmore" : "pics"; }
      else if (id === "d:next") { const L = dedIdeas(c.ver === "g", st); c.dedI = ((c.dedI || 0) + 1) % L.length; }
      else if (id === "d:own") st.step = "dedown";
      else if (txt && !id) {
        if (txt.length < 15 || junk(txt)) { await S(text("רוצים לכתוב הקדשה משלכם? לוחצים *✍️ אכתוב בעצמי* 🙂\nאו בוחרים באחת האפשרויות 👇")); }
        else { c.ded = txt.slice(0, 450); st.step = c.pics.length ? "picsmore" : "pics"; }
      }
      break;
    case "dedown": if (txt) { if (txt.length < 5 || junk(txt)) await S(text("כתבו כאן את ההקדשה המלאה 🙂")); else { c.ded = txt.slice(0, 450); await S(text("הקדשה יפה ❤️")); st.step = c.pics.length ? "picsmore" : "pics"; } } break;
    case "cover": if (id === "cv:hard" || id === "cv:soft") { c.cover = id.slice(3); st.step = st.who ? "more" : "who"; } break;   /* הכריכה – בסוף, אחרי התמונות */
    case "pics": case "picsmore":
      if (ev.image) {
        const p = await savePic(env, st, c.ver === "g" ? "בנות" : "בנים", c.name, ev.image, from, db);
        c.pics.push(p);
        await db.put("pp:" + st.oid + ":" + st.list.length + ":" + Date.now() + Math.random().toString(36).slice(2, 6), JSON.stringify(p), 90 * 86400);
        st.step = "picsmore";
        if (!(await lastInBurst(db, from, log))) return;             /* עוד תמונה בדרך – היא תענה */
        c.pics = await kidPics(db, st, c.pics);
      }
      else if (id === "p:done") { c.pics = await kidPics(db, st, c.pics); if (c.pics.length) st.step = c.cover ? (st.who ? "more" : "who") : "cover"; }
      break;
    case "who": if (id === "w:yes") { st.who = st.profile; st.step = "more"; } else if (id === "w:other") st.step = "whoown"; else if (txt && !id) { if (junk(txt)) await S(text("כתבו את השם שלך 🙂")); else { st.who = txt.slice(0, 40); st.step = "more"; } } break;
    case "whoown": if (txt) { if (junk(txt)) await S(text("כתבו את השם שלך 🙂")); else { st.who = txt.slice(0, 40); st.step = "more"; } } break;
    case "more":
      if (id === "m:yes") { st.list.push(c); st.cur = fresh(); st.page = 0; st.step = "for"; }
      else if (id === "m:no") { st.list.push(c); st.cur = fresh(); st.step = "ship"; }
      break;
    case "ship":
      if (id === "sh:pickup") { st.ship = Object.assign(st.ship || {}, { method: "pickup" }); st.step = st.mode === "gan" ? "pay" : "addr"; }   /* פרטי: תמיד כתובת, טלפון ואימייל */
      else if (id === "sh:ship") { st.ship = Object.assign(st.ship || {}, { method: "ship" }); st.step = "addr"; }
      break;
    case "addr": if (txt && !id) { if (txt.length < 6 || junk(txt)) await S(text("כתבו כתובת מלאה: עיר, רחוב ומספר 📍")); else { st.ship.addr = txt.slice(0, 200); st.step = "phone"; } } break;
    case "phone":
      if (id === "ph:yes") { st.ship.phone = fmtPhone(st.from); st.step = st.mode === "gan" ? "pay" : "email"; }
      else if (id === "ph:other") st.step = "phoneown";
      break;
    case "phoneown": if (txt && /\d{7,}/.test(txt.replace(/\D/g, ""))) { st.ship.phone = txt.slice(0, 30); st.step = st.mode === "gan" ? "pay" : "email"; } else if (txt) { await S(text("כתבו מספר טלפון, למשל 050-1234567 📞")); return; } break;
    case "email":
      if (id === "em:none") { st.ship.email = ""; st.step = "pay"; }
      else if (txt && !id) { const m = txt.replace(/\s+/g, "").match(/[^\s@]+@[^\s@]+\.[a-z]{2,}/i); if (m) { st.ship.email = m[0].toLowerCase().slice(0, 80); st.step = "pay"; } else { await S(text("כתבו כתובת אימייל, למשל name@gmail.com 📧")); return; } }
      break;
    case "pay": if (id.startsWith("pay:") && PAYS[id.slice(4)]) { st.pay = id.slice(4); st.step = st.mode === "gan" ? "g-consent" : "consent"; } break;
    case "consent":
      if (id === "c:yes") return finish(env, from, st, log, db, summary(st, false), summary(st, false), THANKS(st) + "\n\n📚 רוצים להזמין ספר נוסף? כותבים: מחדש", CONSENT);
      break;

    /* ---- גן ---- */
    case "g-name": if (txt && !id) { if (junk(txt)) await S(text("כתבו את שם הגן 🙂 (למשל: גן רימון, חיפה)")); else { G.name = txt.slice(0, 50); st.step = "g-teacher"; } } break;
    case "g-teacher": if (txt && !id) { if (junk(txt)) await S(text("כתבו את השם שלך 🙂")); else { st.who = txt.slice(0, 40); st.step = "g-kids"; } } break;
    case "g-kids": { const k = parseInt(txt.replace(/[^\d]/g, ""), 10); if (k > 0 && k < 1000) { G.kids = k; st.page = 0; st.step = "g-book"; await S(text(priceCalc(true, k).split("\n\n🧮")[0] + "\n(את סוג הכריכה בוחרים בסוף, אחרי התמונות)")); st.intro = 1; } else if (txt) { await S(text("כתבו רק מספר, למשל 25 🙂")); return; } break; }
    case "g-book": if (id.startsWith("gb:") && book(id.slice(3))) { const nb = id.slice(3); if (!G.books.includes(nb)) { G.books.push(nb); for (const v of ["b", "g"]) if ((PAGES[nb] || {})[v]) await RB(nb, v); } if (G.books.length >= GANBOOKS) toDed(); else st.step = "g-book2"; } break;
    case "g-book2":
      if (id === "g:one") toDed();
      else if (id === "g:more") { st.page = 0; st.step = "g-book"; }
      else if (id === "g:read") { for (const b of G.books.filter(b => PAGES[b])) await readAsk(S, b, RB); return; }
      break;
    case "g-cover": if (/^c:(staple|soft|hard)$/.test(id) && ganP(id.slice(2), G.kids)) { G.cover = id.slice(2); st.step = "ship"; } break;   /* הכריכה – בסוף, אחרי התמונות */
    case "g-dedmode":
      if (id === "gdm:one") { G.deds = {}; G.dedFor = "all"; G.dedI = 0; st.step = "g-ded"; }
      else if (id === "gdm:each") { G.deds = {}; G.dedFor = G.books[0]; G.dedI = 0; st.step = "g-ded"; }
      break;
    case "g-ded":
      if (id === "gd:ok") { const L = ganDed(st), i = (G.dedI || 0) % L.length; dedDone(L[i], i); }
      else if (id === "gd:next") { const L = ganDed(st); G.dedI = ((G.dedI || 0) + 1) % L.length; }
      else if (id === "gd:own") { G.dedOwn = 0; G.ded = ""; st.step = "g-dedown"; }
      else if (txt && !id) {
        if (txt.length < 15 || junk(txt)) await S(text("רוצים לכתוב הקדשה משלכם? לוחצים *✍️ אכתוב בעצמי* 🙂\nאו בוחרים באחת האפשרויות 👇"));
        else dedDone(txt.slice(0, 800));
      }
      break;
    case "g-dedown": if (txt && (txt.length < 5 || junk(txt))) { await S(text("כתבו כאן את ההקדשה המלאה 🙂")); break; }
      if (txt) { await S(text("הקדשה יפה ❤️")); dedDone(txt.slice(0, 600)); }
      else if (id === "gd:done" && G.ded) st.step = "g-pics";             /* כפתור ישן */
      break;
    case "g-who":                                                     /* מי שולח את התמונות – הגננת/הוועד, או כל הורה בעצמו */
      if (id === "gw:me") { G.par = 0; st.step = "g-pics"; }
      else if (id === "gw:par") {
        G.par = 1;
        if (!G.code) { let c = ""; for (let t = 0; t < 6 && !c; t++) { const n = String(1000 + Math.floor(Math.random() * 9000)); if (!(await db.get("code:" + n))) c = n; } G.code = c;
          await db.put("code:" + c, JSON.stringify({ oid: st.oid, name: G.name, book: G.books[0], teacher: from, day: st.day || dayStr() }), 90 * 86400); }
        await S(text("📩 הנה הודעה מוכנה – מעבירים אותה לקבוצת ההורים (לחיצה ארוכה על ההודעה ← העברה) 👇"));
        await S(text(parentsMsg(env, st)));
        st.step = "g-pics";
      }
      break;
    case "g-pics": case "g-picsmore": return picsStep();
    case "g-check":
      if (id === "g:ok") st.step = G.cover ? "ship" : "g-cover";
      else if (id === "g:morepics") { G.grp = ""; st.step = "g-pics"; }
      break;
    case "g-consent":
      if (id === "gc:yes") return finish(env, from, st, log, db, await ganSummary(st, db), await ganSummary(st, db, true), ganNext(env, st), CONSENT_GAN);
      break;
  }
  if (st.step !== stepBefore) st.miss = 0;                      /* התקדמו – מאפסים את ספירת הבלבול */
  return ask(env, from, st, log, db);
}

/* גן – מה קורה עכשיו. פרטי התשלום שמש שולחת בעצמה (לפי הדרך שנבחרה) */
function ganNext(env, st){
  return THANKS(st) + "\n\n*אחרי שמאשרים את הסקיצות:*\n💳 תשלום – בקישור ששמש תשלח\n🔍 *אישור הדפסה* – נשלח לך כאן את כל הספרים לבדיקה: שכל הילדים נמצאים, שהשמות נכונים ושההקדשה נכונה. *אין צורך לבדוק את הסיפור או את האיורים.*\n📦 *הדפסה ואספקה* – לפי מה שבחרתם (משלוח או איסוף).\n\n🌱 *גן מביא גן:* כל גן שיגיע דרככם ויסגור הזמנה – 50 ₪ הנחה או זיכוי, גם אם זה יקרה בעוד שנה.\n🎁 *צריכים ספרים נוספים במהלך השנה?* קופון *GANIM50* – 50 ₪ הנחה לכל הזמנה, בתוקף לשנה.\n\nתודה שבחרתם בבוקלי למתנה לכל ילדי הגן! ❤️";
}

/* חזרה לשלב קודם: לאיזה שלב שייך כל כפתור, ובאיזה קטעים מותר לחזור (בלי לשבור תמונות או ספרים שכבר נשמרו) */
const DED_BACK = /(רעיון|הצעה|הצעת|שהצעתם|הקדשה (ה)?מוכנה|ההקדשה (שלכם|שלך|הקודמת|שהצעת|הראשונה)|התחרטתי|מעדיפ.*(שלכם|שלך))/;
function btnStep(id){
  if (/^d:(ok|next|own)$/.test(id)) return "ded";
  if (/^cv:(hard|soft)$/.test(id)) return "cover";
  if (/^v:[bg]$/.test(id)) return "ver";
  if (/^w:(yes|other)$/.test(id)) return "who";
  if (/^sh:(pickup|ship)$/.test(id)) return "ship";
  if (/^ph:(yes|other)$/.test(id)) return "phone";
  if (id === "em:none") return "email";
  if (/^pay:/.test(id)) return "pay";
  if (/^gd:(ok|next|own)$/.test(id)) return "g-ded";
  if (/^gdm:(one|each)$/.test(id)) return "g-dedmode";
  if (/^c:(staple|soft|hard)$/.test(id)) return "g-cover";
  if (/^g:(one|more)$/.test(id)) return "g-book2";
  return "";
}
const SEGS = [["ver", "name", "ded", "dedown", "pics", "picsmore", "cover", "who", "whoown", "more"],
  ["g-cover", "ship", "addr", "phone", "phoneown", "email", "pay", "consent", "g-consent"],
  ["g-book2", "g-dedmode", "g-ded", "g-dedown"]];
function canBack(cur, to){ return SEGS.some(s => s.includes(cur) && s.includes(to) && s.indexOf(to) < s.indexOf(cur)); }

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
const title = (st, from) => `${st.oid} · ${(st.mode === "gan" || st.mode === "parent" ? st.g.name : "") || st.who || st.profile || from || ""} · ${st.day || dayStr()}`;
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
  await typing(env);
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
  if (st.mode !== "gan" && st.ship)                                          /* פרטי: מסמך "פרטי המזמין" בתיקיית ההזמנה */
    await drivePost(env, { action: "note", order: st.oid, title: title(st, from), name: "פרטי המזמין", text: `הזמנה: ${st.oid}\nשם המזמין: ${st.who || ""}\nטלפון: ${st.ship.phone || ""}\nאימייל: ${st.ship.email || ""}\nכתובת: ${st.ship.addr || ""}\nוואטסאפ: +${from}\nמשלוח: ${st.ship.method === "pickup" ? "איסוף עצמי" : "משלוח צ'יטה עד הבית"}\nתשלום: ${st.pay && PAYS[st.pay] ? PAYS[st.pay].replace(/^\S+ /, "") : ""}\nספרים: ${st.list.map(c => `${bname(c.book, c.ver)} – ${c.name}`).join(" · ")}` });
  if (st.mode === "gan") for (const [b, sub] of rounds(st.g))                /* בכל תיקייה (ספר / בנים|בנות) – ההקדשה בלשון הנכונה */
    await drivePost(env, { action: "ded", order: st.oid, title: title(st, from), topic: st.g.books.length > 1 ? book(b).name : "", sub, text: ganDedFor(st, b, sub) });
  const d = await drivePost(env, { action: "order", order: st.oid, title: title(st, from), summary: full, expected });
  return d ? { folder: d.folder, doc: d.doc, photos: d.photos } : null;
}

/* הודעה אחת שנכנסה. ev = {id, text, image, caption}. opts: {mem, log} בבדיקות */
export async function handle(env, from, profile, ev, opts){
  opts = opts || {};
  const db = store(env, opts.mem), log = opts.log;
  /* ===== הורה שהגיע מהקישור של הגן ("ספר לגן – קוד 1234") ===== */
  const pk = "pst:" + from;
  let pst = JSON.parse(await db.get(pk) || "null");
  const cm = (ev.text || "").match(/קוד\s*(\d{4,6})/);
  if (cm) {
    const L = JSON.parse(await db.get("code:" + cm[1]) || "null");
    if (L) {
      const tst = JSON.parse(await db.get("st:" + L.teacher) || "null");
      if (tst && tst.oid === L.oid && tst.step === "done") { await wa(env, from, text(`שלום 💗 ההזמנה של ${L.name} כבר נסגרה, ואי אפשר להוסיף אליה תמונות.\nמשהו חסר? כדאי לפנות לגננת או לוועד 🙂`), log); return; }
      pst = { mode: "parent", oid: L.oid, day: L.day, g: { name: L.name, books: [L.book], kids: 0 }, teacher: L.teacher, step: "p-consent", from, pdone: 0, who: "", profile: profile || "" };
      await ask(env, from, pst, log, db); await db.put(pk, JSON.stringify(pst), 90 * 86400); return;
    }
  }
  if (pst && !/^(מחדש|להתחיל מחדש)[.!]?$/.test((ev.text || "").trim())) {
    const traw = await db.get("st:" + from), tst = traw ? JSON.parse(traw) : null;
    const teacherBusy = tst && tst.step && tst.step !== "done" && tst.mode === "gan";      /* אותו טלפון גם גננת (בדיקות) */
    if (!teacherBusy || pst.step === "p-consent" || pst.gask || ev.image || /^(pc:|gx:|gr:)/.test(ev.id || "")) {
      await step(env, from, pst, ev, log, db); pst.ts = Date.now(); await db.put(pk, JSON.stringify(pst), 90 * 86400); return;
    }
  } else if (pst) await db.del(pk);
  const k = "st:" + from, raw = await db.get(k);
  let st = raw ? JSON.parse(raw) : null;
  if (ev.id === "restart:yes" || /^(מחדש|להתחיל מחדש|התחלה מחדש|מתחילים מחדש)[.!]?$/.test((ev.text || "").trim())) { st = null; if (ev.id) ev = { text: "מחדש" }; }   /* מתחילים הזמנה חדשה מההתחלה */
  if (st && st.human && !st.owner && ev.id && ev.id !== "human") st.human = 0;   /* כששמש כותבת בעצמה – הבוט חוזר רק כשהיא כותבת #בוט */  /* לחצו על כפתור של הבוט – רוצים את הבוט, ממשיכים בלי לחכות */
  if (st && st.human) {                                            /* מצב "בן אדם" */
    if (!log && !ev.id && !RESUME_TXT.test((ev.text || "").trim())) await logQA(env, st, from, "q", st.owner ? "בשיחה עם שמש" : "מחכה לשמש", ev.text || (ev.image ? "(תמונה)" : ""));
    if (!st.owner && (ev.id === "resume" || RESUME_TXT.test((ev.text || "").trim()) || Date.now() - st.human > 48 * 3600e3)) await resume(env, from, st, log, db);
    else if (!st.owner) {                                          /* שמש עוד לא כתבה – לא שותקים: מעבירים לה ומציעים להמשיך */
      await wa(env, from, buttons("📩 קיבלתי, והעברתי גם את זה לשמש – היא תענה לך כאן בהקדם (א׳–ה׳ 8:00–18:00).\nבינתיים אפשר להמשיך בהזמנה 👇", RESUME_BTN), log);
      if (Date.now() - (st.alertAt || 0) > 10 * 60e3) { st.alertAt = Date.now(); await alertOwner(env, st, from, "כתבה שוב בזמן שמחכה לך", ev.text || (ev.image ? "(תמונה)" : "")); }
    }
  } else if (!st || st.step === "done") {
    if (/הזמנה (סב|גן)-\d/.test(ev.text || "")) return;              /* הזמנה מלאה מהאתר – שמש מטפלת */
    /* מספר עסקי – עונים לכל הודעה */
    if (st && !ev.id && Date.now() - (st.ts || 0) < 12 * 3600e3) {   /* אחרי הזמנה: "תודה", "מתי הספר יגיע?" – לא פותחים הזמנה חדשה (רק "מחדש") */
      if (!log) await logQA(env, st, from, "q", "כתבה אחרי שההזמנה נשלחה", ev.text || (ev.image ? "(תמונה)" : ""));
      if (!st.doneAck) {                                             /* עונים פעם אחת, ומשם שמש ממשיכה איתה */
        st.doneAck = 1;
        await wa(env, from, buttons(`תודה ❤️ הבקשה ${st.oid || ""} התקבלה, ושמש תחזור אלייך כאן בהקדם.`, [["restart:yes", "📚 הזמנה נוספת"]]), log);
        st.ts = Date.now(); await db.put(k, JSON.stringify(st), 30 * 86400);
      } else if (!st.owner && Date.now() - (st.alertAt || 0) > 30 * 60e3) {   /* עוד שאלה אחרי ההזמנה – מחכה לשמש, והיא מקבלת התראה */
        st.alertAt = Date.now(); await alertOwner(env, st, from, "כתבה אחרי שההזמנה נשלחה", ev.text || (ev.image ? "(תמונה)" : ""));
        await db.put(k, JSON.stringify(st), 30 * 86400);
      }
      return;
    }
    st = { from, step: "hi", page: 0, list: [], cur: fresh(), who: "", profile: profile || "", human: 0, oid: newId("סב"), day: dayStr(), role: "g", mode: "private", g: { name: "", kids: 0, books: [], cover: "", ded: "", dedI: 0 } };
    if (ev.id === "human" || HUMAN_TXT.test(ev.text || "")) await step(env, from, st, { id: "human" }, log, db);
    else if (ev.id === "s:go" || ev.id === "s:gan") await step(env, from, st, ev, log, db);
    else await ask(env, from, st, log, db);
  } else {
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
            else { st.human = Date.now(); st.owner = Date.now(); await db.put(k, JSON.stringify(st)); await logQA(env, st, m.to, "a", "", t); }   /* שמש כותבת – הבוט שותק; התשובה נשמרת לחלון */
          }
          const name = (v.contacts && v.contacts[0] && v.contacts[0].profile && v.contacts[0].profile.name) || "";
          for (const m of v.messages || []) {
            const ev = {};
            if (m.type === "text") ev.text = m.text.body;
            else if (m.type === "interactive") ev.id = (m.interactive.button_reply || m.interactive.list_reply || {}).id;
            else if (m.type === "button") ev.text = m.button.text;
            else if (m.type === "image") { ev.image = { media: m.image.id, sha: m.image.sha256 || "" }; ev.caption = m.image.caption || ""; ev.mid = m.id || ""; }
            else continue;
            console.log("in", m.type, ev.id || (ev.image ? "image" : "text"));   /* לבדיקת תקלות – בלי תוכן ההודעה */
            const envM = Object.assign({}, env, { MID: m.id || "" });     /* מזהה ההודעה – ל"מקליד…" */
            await typing(envM);
            await handle(envM, m.from, name, ev);
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
      const db = store(env); for (const k of ks.slice(-50)) out.push(JSON.parse(await db.get(k)));
      return Response.json(out);
    }
    return new Response("BOOQLI", { status: 404 });
  }
};
