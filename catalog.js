/* =====================================================================
   booqli Games – הקטלוג: כל התכנים באתר, עם תגיות קבועות
   =====================================================================
   מכאן נבנים לבד: דף הבית, 4 הדלתות (גננות, הורים, ילדים, כיתות), הספרייה, החיפוש והמועדפים.
   תוכן חדש = שורה חדשה כאן. אין צורך לבנות כרטיסים או באנרים ביד.

   השדות:
   id     = שם התיקייה ב-topics/ (באנגלית)        name = השם באתר        ic / bg = אייקון וצבע רקע
   ready  = true כשיש תוכן                         event = תאריך האירוע (לנושאי לוח השנה, נפתח 30 יום לפני)
   opens  = תאריך פתיחה קבוע (אחרת: SITE.opens ב-common.js, או 30 יום לפני event)
   ages   = [מגיל, עד גיל]
   aud    = קהל: t גננות · p הורים · k ילדים · s כיתות א'–ג'   (למשל "tpk")
   subj   = תחומים (מהרשימה CAT.SUBJECTS)          type = סוגים: plan game print story video craft offline msg guide
   min    = משך המערך בדקות                          sped = מתאים גם לחינוך מיוחד · deaf = התאמות לכבדי שמיעה
   host   = הדמות מארחת: booqli garb hesh alef lev ona shomer
   group  = routine (שגרת הגן) / habits (הרגלים)    zone = suppliers (אזור הספקים)
   season = נושא של לוח השנה                       tags = מילות מפתח לחיפוש (8–20)
   book / img / href = משחק של ספר BOOQLI
*/
window.CATALOG = [
  {"id":"opening","name":"פתיחת שנה","ic":"🎒","bg":"#FFE3F4","event":"2027-09-01","ready":false,"ages":[3,6],"aud":"tp","subj":["רגשות וחברה"],"type":[],"host":"ona","tags":["גן חדש","הסתגלות","היכרות","חברים","כללי הגן","פרידה מההורים","ספטמבר"],"season":true},
  {"id":"tishrei","name":"חגי תשרי","ic":"🍎","bg":"#FFE9D6","event":"2027-10-02","ready":false,"ages":[3,6],"aud":"tpk","subj":["חגים ומורשת"],"type":[],"host":"ona","tags":["ראש השנה","יום כיפור","סוכות","שמחת תורה","תפוח בדבש","רימון","שופר","סוכה","ארבעת המינים","חגים"],"season":true},
  {"id":"autumn","name":"סתיו","ic":"🍂","bg":"#FCE6CF","event":"2027-09-23","opens":"2026-10-31","ready":true,"ages":[3,6],"aud":"tpk","subj":["מדע וטבע","אמנות ויצירה"],"type":["game","print","craft"],"sped":true,"host":"ona","tags":["סתיו","עונות","עלי שלכת","עלים","רוח","יורה","גשם","ענן","מטרייה","מגפיים","נחליאלי","חצב","ציפורים נודדות","מזג אוויר","טבע","משחקים","חידון","הקראה","ציור","דף צביעה"],"season":true},
  {"id":"hanukkah","name":"חנוכה","ic":"🕎","bg":"#DCEBFF","event":"2026-12-04","opens":"2026-10-30","ready":true,"ages":[3,6],"aud":"tpk","subj":["חגים ומורשת","חשבון"],"type":["plan","game","print","story","craft"],"min":45,"host":"ona","tags":["חנוכה","חנוכייה","נרות","סביבון","סופגנייה","לביבה","פך שמן","מכבים","נס","אור","חגים","משחקים","פאזל","זיכרון","דפי עבודה","צביעה","יצירה","סיפור","מערך לגננת","הדפסה"],"season":true},
  {"id":"winter","name":"חורף","ic":"🌧️","bg":"#E3ECF6","event":"2026-12-21","ready":true,"ages":[3,6],"aud":"tpk","subj":["מדע וטבע"],"type":["game","print","offline","guide"],"sped":true,"host":"ona","tags":["חורף","עונות","גשם","מטרייה","ענן","שלולית","מגפיים","ברק ורעם","קשת בענן","שלג","חרמון","עגורים","כלנית","מעגל המים","מה לובשים בחורף","מזג אוויר","חידון","דף צביעה","משחקים","בלי מסך"],"season":true},
  {"id":"tubishvat","name":"ט\"ו בשבט","ic":"🌳","bg":"#DDF1DF","event":"2027-01-23","ready":false,"ages":[3,6],"aud":"tpk","subj":["חגים ומורשת","מדע וטבע"],"type":[],"host":"ona","tags":["ט\"ו בשבט","עצים","נטיעה","פירות יבשים","שבעת המינים","טבע","ראש השנה לאילנות","חגים"],"season":true},
  {"id":"family","name":"יום המשפחה","ic":"👨‍👩‍👧","bg":"#FFE3F4","event":"2027-02-07","ready":false,"ages":[3,6],"aud":"tp","subj":["רגשות וחברה"],"type":[],"host":"lev","tags":["משפחה","אמא","אבא","אחים","סבא וסבתא","בית","אהבה","רגשות"],"season":true},
  {"id":"purim","name":"פורים","ic":"🎭","bg":"#F1E3FF","event":"2027-03-23","ready":true,"ages":[3,6],"aud":"tpk","subj":["חגים ומורשת","שפה ואוריינות"],"type":["plan","game","story","print","craft","offline","msg"],"min":45,"sped":true,"host":"ona","tags":["פורים","מגילת אסתר","סיפור המגילה","אסתר המלכה","מרדכי","המן","אחשוורוש","תחפושות","משלוח מנות","רעשן","אוזני המן","כרטיס ברכה לפורים","משחק זיכרון","מיצי החתולה","עקבות","מערך לגננת","דף צביעה","מסכה לגזירה","מבוך","חגים"],"season":true},
  {"id":"spring","name":"אביב","ic":"🌸","bg":"#FFE3F4","event":"2027-03-20","ready":false,"ages":[3,6],"aud":"tpk","subj":["מדע וטבע"],"type":[],"host":"ona","tags":["עונות","פרחים","פריחה","פרפרים","טבע","ציפורים"],"season":true},
  {"id":"pesach","name":"פסח","ic":"🍷","bg":"#F6E4D8","event":"2027-04-21","ready":false,"ages":[3,6],"aud":"tpk","subj":["חגים ומורשת"],"type":[],"host":"ona","tags":["פסח","ליל הסדר","מצה","יציאת מצרים","משה","קערת הסדר","אפיקומן","ניקיון","חגים"],"season":true},
  {"id":"lagbaomer","name":"ל\"ג בעומר","ic":"🔥","bg":"#FFE6D6","event":"2027-05-25","ready":false,"ages":[3,6],"aud":"tpk","subj":["חגים ומורשת"],"type":[],"host":"ona","tags":["ל\"ג בעומר","מדורה","קשת וחץ","תפוחי אדמה","חגים"],"season":true},
  {"id":"atzmaut","name":"יום העצמאות","ic":"🇮🇱","bg":"#DCEBFF","event":"2027-05-12","ready":false,"ages":[3,6],"aud":"tpk","subj":["חגים ומורשת"],"type":[],"host":"ona","tags":["יום העצמאות","ישראל","דגל","מדינה","יום הולדת למדינה","חגים"],"season":true},
  {"id":"shavuot","name":"שבועות","ic":"🌾","bg":"#FFF3CF","event":"2027-06-11","ready":false,"ages":[3,6],"aud":"tpk","subj":["חגים ומורשת"],"type":[],"host":"ona","tags":["שבועות","ביכורים","חקלאות","מוצרי חלב","גבינה","שבעת המינים","חגים"],"season":true},
  {"id":"summer","name":"קיץ","ic":"☀️","bg":"#FFF1C9","event":"2027-06-21","ready":false,"ages":[3,6],"aud":"tpk","subj":["מדע וטבע"],"type":[],"host":"ona","tags":["עונות","קיץ","ים","שמש","מים","חופש גדול","סוף שנה"],"season":true},
  {"id":"last-minute","name":"הגעתי לא מוכנה! 10 פעילויות","ic":"🆘","bg":"#FFE3F4","ready":true,"ages":[3,6],"aud":"t","group":"routine","subj":["תנועה ומוזיקה","רגשות וחברה"],"type":["plan","print"],"min":30,"noPrep":true,"noGift":true,"host":"booqli","tags":["הרגע האחרון","לא מוכנה","בלי הכנה","בלי ציוד","ממלאת מקום","מחליפה","החלפה","סייעת","משחקי מעגל","משחקים לגן","היכרות","שמות","תנועה","קשב","רגשות","ספירה","סיפור","דף להדפסה"]},
  {"id":"morning-circle","name":"מפגש בוקר: 30 רעיונות","ic":"☀️","bg":"#FFF3CF","ready":true,"ages":[3,6],"aud":"tp","group":"routine","subj":["שפה ואוריינות","רגשות וחברה"],"type":["plan","print","msg"],"sped":true,"noGift":true,"host":"booqli","tags":["מפגש בוקר","מעגל בוקר","שגרת בוקר","פתיחת יום","רעיונות למפגש","מחזוריות","סדר יום","רגשות","תנועה","שפה","חרוזים","חשבון","דמיון","מחמאות","טוב לב","חוברת להדפסה","הדפסה","מערך לגננת"]},
  {"id":"birthday-party","name":"יום הולדת בגן","ic":"🎂","bg":"#FFE3F4","ready":true,"ages":[3,6],"aud":"tp","group":"routine","subj":["רגשות וחברה","חשבון"],"type":["plan","game","print","craft"],"min":45,"host":"booqli","tags":["יום הולדת","ימי הולדת בגן","מסיבת יום הולדת","מערך יום הולדת","שעת יום הולדת","כתר","זר","כיסא המלוכה","הרמות","עוגה","נרות","משאלה","ברכות","חוברת ברכות","כרטיס ברכה","תמונה","מדבקות","מתנה להורים","ספירה","חשבון","משחקים","דף להדפסה","מערך לגננת"]},
  {"id":"stories","name":"סיפורים וקריאה","ic":"📖","bg":"#FFE3F4","ready":false,"ages":[3,6],"aud":"tpk","subj":["שפה ואוריינות"],"type":[],"sped":true,"host":"alef","tags":["סיפור","הקראה","ספרים","האזנה","BOOQLI","עידוד קריאה","אותיות","קריאה","אלף-בית","צלילים","חרוזים","מילים","אוריינות","מוכנות לכיתה א"]},
  {"id":"feelings","name":"עולם הרגשות","ic":"😊","bg":"linear-gradient(135deg,#FF4D5E,#FF9A2E,#FFD23F,#46C46E,#3AA7F0,#5B6CF0,#B05BE8)","rainbow":true,"ready":true,"ages":[3,8],"aud":"tpks","subj":["רגשות וחברה"],"type":["game","print","craft"],"sped":true,"host":"lev","tags":["רגשות","עולם הרגשות","שמחה","עצב","כעס","פחד","הפתעה","בושה","קנאה","פרצופים","משחק פרצופים","בונים פרצוף","מראת רגשות","צנצנת רגשות","מפלצת רגשות","מד רגשות","הבעות פנים","אמפתיה","וויסות רגשי","כישורים חברתיים","דף להדפסה","כיתה א","כיתה ב"]},
  {"id":"colors","name":"עולם הצבעים","ic":"🎨","bg":"#FFF6CF","ready":true,"ages":[2,6],"aud":"tpk","subj":["אמנות ויצירה","מדע וטבע"],"type":["plan","game","print","craft","offline"],"min":45,"sped":true,"deaf":true,"host":"garb","tags":["צבעים","עולם הצבעים","צבעי יסוד","ערבוב צבעים","אדום","צהוב","כחול","טורקיז","בורדו","צבעים לא שגרתיים","קליי","פלסטלינה","יצירה","מערך לגננת","מערך 45 דקות","משחקים","דפי עבודה","כבדי שמיעה","כתוביות","מפלצת"]},
  {"id":"math","name":"חשבון לגיל הרך","ic":"🔢","bg":"#DCEBFF","ready":true,"ages":[1,8],"aud":"tpks","subj":["חשבון"],"type":["game","print","offline"],"sped":true,"host":"hesh","tags":["חשבון","מתמטיקה","מספרים","ספירה","כמויות","אחד והרבה","גדול וקטן","צורות","סדרות","יותר ופחות","חיבור","חיסור","השלמה ל-10","לוח הכפל","שעון","דף עבודה","דפי עבודה","משחקים","פעוטות","מוכנות לכיתה א"]},
  {"id":"safety","name":"אזעקות ומרחב מוגן","ic":"🛡️","bg":"#E3ECF6","ready":false,"ages":[3,6],"aud":"tp","subj":["מוגנות"],"type":[],"sped":true,"host":"shomer","tags":["מוגנות","ביטחון","אזעקה","מרחב מוגן","ממ\"ד","מקלט","פיקוד העורף","חוסן","הרגעה","רגשות"]},
  {"id":"calendar","name":"לוח חופשות תשפ\"ז","ic":"📅","bg":"#FFF3CF","ready":true,"ages":[3,6],"aud":"tp","group":"routine","subj":[],"type":["guide","msg","print"],"noGift":true,"host":"booqli","tags":["לוח חופשות","חופשות","חופשת חנוכה","חופשת פסח","פורים","שבועות","החופש הגדול","חגים","משרד החינוך","תשפ\"ז","תאריכים","מתי חוזרים לגן","להדפסה","וואטסאפ","הודעה להורים","תרגול בחופש"]},
  {"id":"earthquake","name":"רעידת אדמה: מה עושים?","ic":"🌍","bg":"#F6E4D8","ready":true,"ages":[3,6],"aud":"tpk","subj":["מוגנות"],"type":["plan","game","video","story","print"],"min":20,"sped":true,"host":"shomer","tags":["רעידת אדמה","רעידות אדמה","מוגנות","בטיחות","פיקוד העורף","שטח פתוח","מקום פתוח","מרחב מוגן","ממ\"ד","תרגיל","חוסן","הרגעה","מה עושים","סרטון","צבי הצב","משחק הצב","סיפור חברתי","דפים להדפסה","מערך לגננת","בלי להפחיד"]},
  {"id":"lost","name":"הלכתי לאיבוד: מה עושים?","ic":"🧭","bg":"#DCEBFF","ready":false,"ages":[3,6],"aud":"tpk","subj":["מוגנות"],"type":[],"sped":true,"host":"shomer","tags":["הלכתי לאיבוד","ילד אבוד","לאיבוד","מוגנות","בטיחות","מספר טלפון","לבקש עזרה","קניון","חוף ים","טיול","עומדים במקום","זרים","מה עושים"]},
  {"id":"first-grade","name":"הכנה לכיתה א׳","ic":"🎒","bg":"#FFE3F4","ready":false,"ages":[5,7],"aud":"ps","subj":["שפה ואוריינות","חשבון"],"type":[],"host":"alef","tags":["כיתה א","הכנה לכיתה א","מוכנות לכיתה א","בית ספר","חובה","אותיות","חשבון","קשב","עצמאות","ילקוט","מעבר לבית הספר","רגשות"]},
  {"id":"healthy-eating","name":"אוכל בריא: פירות וירקות","ic":"🥕","bg":"#FFEBD2","ready":false,"ages":[3,6],"aud":"tpk","subj":["גוף ובריאות"],"type":[],"sped":true,"host":"booqli","tags":["אכילה בריאה","תזונה","פירות","ירקות","בריאות","ארוחה","צבעים","טבע","הכרת פירות וירקות"]},
  {"id":"movement","name":"תנועה ויוגה","ic":"🤸","bg":"#DDF1DF","ready":false,"ages":[3,6],"aud":"tpk","subj":["תנועה ומוזיקה","גוף ובריאות"],"type":[],"sped":true,"host":"booqli","tags":["תנועה","ספורט","פעילות גופנית","ריצה","משחקי חצר","בריאות","יוגה","נשימה","הרגעה","גמישות","ריכוז","מיינדפולנס","יוגה לגן"]},
  {"id":"sleep","name":"שינה","ic":"😴","bg":"#E3ECF6","ready":false,"ages":[3,6],"aud":"tp","group":"habits","subj":["גוף ובריאות"],"type":[],"sped":true,"host":"lev","tags":["שינה","לילה","מיטה","הרגלים","בריאות","שגרה"]},
  {"id":"honor-parents","name":"כיבוד הורים","ic":"💐","bg":"#FFE3F4","ready":false,"ages":[3,6],"aud":"tp","group":"habits","subj":["רגשות וחברה"],"type":[],"host":"lev","tags":["כיבוד הורים","משפחה","ערכים","נימוס","תודה","עזרה"]},
  {"id":"tidy","name":"סדר וארגון","ic":"🧺","bg":"#FFF1C9","ready":false,"ages":[3,6],"aud":"tp","group":"habits","subj":["גוף ובריאות"],"type":[],"sped":true,"host":"booqli","tags":["סדר","ארגון","ניקיון","אחריות","עצמאות","הרגלים"]},
  {"id":"hygiene","name":"צחצוח שיניים ומקלחת","ic":"🪥","bg":"#DCEBFF","ready":false,"ages":[3,6],"aud":"tpk","group":"habits","subj":["גוף ובריאות"],"type":[],"sped":true,"host":"booqli","tags":["היגיינה","צחצוח שיניים","מקלחת","שטיפת ידיים","בריאות","הרגלים"]},
  {"id":"morning-prayer","name":"תפילת בוקר","ic":"🌅","bg":"#FFF3CF","ready":false,"ages":[3,6],"aud":"t","group":"routine","subj":["חגים ומורשת"],"type":[],"host":"booqli","tags":["תפילת בוקר","מודה אני","תפילה","בוקר","מסורת","ערכים"]},
  {"id":"body","name":"גוף האדם","ic":"🧒","bg":"#E1F0EA","ready":false,"ages":[3,6],"aud":"tpk","subj":["גוף ובריאות","מדע וטבע"],"type":[],"sped":true,"host":"booqli","tags":["גוף האדם","איברי הגוף","חושים","בריאות","אני וגופי"]},
  {"id":"english","name":"אנגלית לקטנטנים","ic":"🔤","bg":"#DCEBFF","ready":false,"ages":[3,6],"aud":"tpk","subj":["אנגלית"],"type":[],"host":"alef","tags":["אנגלית","צבעים","מספרים","מילים","שפה"]},
  {"id":"suppliers","name":"מתנות וספקיות לפי עונות","href":"gifts/","ic":"🎁","bg":"#FFE3F4","ready":true,"ages":[3,6],"aud":"t","zone":"suppliers","subj":[],"type":[],"host":"","tags":["ספקים","ספקיות","מתנות לגן","מתנה לחנוכה","מתנה לראש השנה","מתנה לפורים","משלוחי מנות","מתנה ליום הולדת","מתנה לסוף שנה","יום המשפחה","יום העצמאות","ט\"ו בשבט","מתנה לגננת","ועד הורים","גננות"]},
  {"id":"school-reading","name":"קריאה וכתיבה","ic":"✏️","bg":"#F1E3FF","ready":false,"ages":[6,9],"aud":"ps","subj":["שפה ואוריינות"],"type":[],"host":"alef","tags":["קריאה","כתיבה","כיתה א","כיתה ב","כיתה ג","אותיות","מילים"]},
  {"id":"school-comprehension","name":"הבנת הנקרא","ic":"📚","bg":"#E1F0EA","ready":false,"ages":[6,9],"aud":"ps","subj":["שפה ואוריינות"],"type":[],"host":"alef","tags":["הבנת הנקרא","קריאה","כיתה ב","כיתה ג","סיפורים"]},
  {"id":"school-science","name":"מדע וטבע לכיתות","ic":"🔬","bg":"#DDF1DF","ready":false,"ages":[6,9],"aud":"ps","subj":["מדע וטבע"],"type":[],"host":"ona","tags":["מדע","טבע","ניסויים","כיתה א","כיתה ב","כיתה ג"]},
  {"id":"school-english","name":"אנגלית לכיתות","ic":"🇬🇧","bg":"#DCEBFF","ready":false,"ages":[6,9],"aud":"ps","subj":["אנגלית"],"type":[],"host":"alef","tags":["אנגלית","כיתה ג","מילים","שפה"]},
  {"id":"superhero","name":"גיבור/ת על","book":true,"p":"משחק טוב לב מהיר, אותיות וקריאה, מיון והבדלים","img":"games/superhero/img/m-book.png","href":"games/superhero/","ready":true,"ages":[3,6],"aud":"pk","subj":[],"type":["game","story"],"host":"booqli","noGift":true,"tags":["BOOQLI","ספר אישי","גיבור על","טוב לב","אמפתיה","אותיות","קריאה","מיון","מצא את ההבדלים"]},
  {"id":"birthday","name":"ילד/ת יום הולדת","book":true,"p":"משחקי חשבון ליום ההולדת, עוגת נרות וזיכרון","img":"games/birthday/img/m-book.png","href":"games/birthday/","ready":true,"ages":[3,6],"aud":"pk","subj":[],"type":["game","story"],"host":"booqli","noGift":true,"tags":["BOOQLI","ספר אישי","יום הולדת","חשבון","ספירה","עוגה","נרות","זיכרון"]},
  {"id":"bye-bye-diaper","name":"ביי ביי חיתול!","book":true,"p":"הסיפור, משחק סימני הגוף ולוח מדבקות להדפסה","img":"games/bye-bye-diaper/img/m-book.png","href":"games/bye-bye-diaper/","ready":true,"ages":[3,6],"aud":"pk","subj":[],"type":["game","story"],"sped":true,"host":"booqli","noGift":true,"tags":["BOOQLI","ספר אישי","גמילה מחיתול","סיר","עצמאות","לוח מדבקות","הדפסה"]},
  {"id":"savanna","name":"בסוואנה","book":true,"p":"מכירים את חיות הסוואנה בסיפור ובמשחקים","img":"games/savanna/img/demo-book.png","href":"games/savanna/","ready":true,"ages":[3,6],"aud":"pk","subj":[],"type":["game","story"],"host":"booqli","noGift":true,"tags":["BOOQLI","ספר אישי","סוואנה","חיות","בעלי חיים","טבע","אפריקה"]}
];

window.REVIEWS = [
  {"text":"די, אני בהלם! איזה כיף. רק אל תפסיקי בבקשה, אני כל כך צריכה את זה. זה מושלם. וואו, גאונות.","name":"מיכל, גננת מנתניה"},
  {"text":"תודה רבה, אני מעריכה מאוד. קניתי גם את הספרים שלכם ואני מאוד מרוצה. כל הכבוד על המיזם!","name":"שושי, גננת מבאר שבע"},
  {"text":"בדיוק התחלתי לחשוב על חנוכה, וזה הגיע בזמן. תודה רבה!","name":"דלית, גננת מתל אביב"},
  {"text":"האתר פשוט טירוף! אני שומרת אותו ושולחת גם להורים. תודה שזה מאובטח, בלי הרשמה והכל בחינם.","name":"נוגה, גננת מתל אביב"},
  {"text":"גם הספרים של בוקלי מקסימים. מחכה להמשך!","name":"תרצה, גננת מירושלים"}
];

/* =====================================================================
   KIDS_GAMES – כל משחק בנפרד, עם גיל אמיתי (מ-1.11.2026). אזור הילדים (kids/) מסנן לפי גיל הילד מכאן.
   topic = ה-id של הנושא ב-CATALOG (המשחק מוצג רק כשהנושא פתוח) · ages = [מגיל, עד גיל] של המשחק עצמו
   kind: game משחק · story סיפור · draw ציור · learn לומדים · craft יצירה · href = מהשורש של האתר
   משחק חדש בנושא = שורה חדשה כאן (גם אם הנושא כבר מופיע).
   ===================================================================== */
window.KIDS_GAMES = [
  {id:"autumn-tree",   topic:"autumn",   ic:"🍂", name:"העץ והרוח",            kind:"game",  ages:[2,6], href:"topics/autumn/#tree"},
  {id:"autumn-draw",   topic:"autumn",   ic:"🖌️", name:"מציירים סתיו באצבע",   kind:"draw",  ages:[2,6], href:"topics/autumn/#draw"},
  {id:"autumn-quiz",   topic:"autumn",   ic:"❓", name:"חידון הסתיו",           kind:"game",  ages:[3,6], href:"topics/autumn/#quiz"},
  {id:"autumn-bird",   topic:"autumn",   ic:"🐦", name:"הנחליאלי",              kind:"learn", ages:[4,6], href:"topics/autumn/#bird"},
  {id:"han-coloring",  topic:"hanukkah", ic:"🎨", name:"צביעה של חנוכה",        kind:"draw",  ages:[2,6], href:"topics/hanukkah/#coloring"},
  {id:"han-memory",    topic:"hanukkah", ic:"🃏", name:"זיכרון חנוכה",          kind:"game",  ages:[3,6], href:"topics/hanukkah/#memory"},
  {id:"han-lighting",  topic:"hanukkah", ic:"🕯️", name:"מדליקים את החנוכייה",   kind:"game",  ages:[3,6], href:"topics/hanukkah/#lighting"},
  {id:"han-sorting",   topic:"hanukkah", ic:"🧺", name:"של חנוכה או לא?",       kind:"game",  ages:[3,6], href:"topics/hanukkah/#sorting"},
  {id:"han-puzzle",    topic:"hanukkah", ic:"🧩", name:"פאזל לילה של חנוכה",    kind:"game",  ages:[3,6], href:"topics/hanukkah/#puzzle"},
  {id:"han-story",     topic:"hanukkah", ic:"📖", name:"סיפור המכבים",          kind:"story", ages:[3,6], href:"topics/hanukkah/#story"},
  {id:"han-quiz",      topic:"hanukkah", ic:"❓", name:"חידון חנוכה",           kind:"game",  ages:[4,6], href:"topics/hanukkah/#quiz"},
  {id:"win-dress",     topic:"winter",   ic:"🧥", name:"מלבישים את צבי לחורף",  kind:"game",  ages:[2,6], href:"topics/winter/#g-dress"},
  {id:"win-garden",    topic:"winter",   ic:"🌺", name:"מגדלים כלניות בגשם",    kind:"game",  ages:[3,6], href:"topics/winter/#g-garden"},
  {id:"win-quiz",      topic:"winter",   ic:"❓", name:"חידון חורף",            kind:"game",  ages:[4,6], href:"topics/winter/#g-quiz"},
  {id:"win-cycle",     topic:"winter",   ic:"💧", name:"לאן נעלמת השלולית?",    kind:"learn", ages:[4,6], href:"topics/winter/#cycle"},
  {id:"pur-memory",    topic:"purim",    ic:"🐱", name:"משחק הזיכרון של מיצי",  kind:"game",  ages:[3,6], href:"topics/purim/#g-memory"},
  {id:"pur-tracks",    topic:"purim",    ic:"🐾", name:"הולכים אחרי העקבות",    kind:"game",  ages:[3,6], href:"topics/purim/#g-tracks"},
  {id:"pur-basket",    topic:"purim",    ic:"🧺", name:"משלוח מנות לעכבר",      kind:"game",  ages:[3,6], href:"topics/purim/#g-basket"},
  {id:"pur-mitzi",     topic:"purim",    ic:"📖", name:"מיצי הבלשית",           kind:"story", ages:[3,6], href:"topics/purim/#mitzi"},
  {id:"pur-card",      topic:"purim",    ic:"💌", name:"כרטיס ברכה לפורים",     kind:"craft", ages:[3,6], href:"topics/purim/#card"},
  {id:"pur-missing",   topic:"purim",    ic:"🐭", name:"מה העכבר לקח?",         kind:"game",  ages:[4,6], href:"topics/purim/#g-missing"},
  {id:"pur-megillah",  topic:"purim",    ic:"📜", name:"סיפור מגילת אסתר",      kind:"story", ages:[4,6], href:"topics/purim/#megillah"},
  {id:"bday-chair",    topic:"birthday-party", ic:"🪑", name:"מרימים את הכיסא",  kind:"game",  ages:[3,6], href:"topics/birthday-party/#games"},
  {id:"bday-candles",  topic:"birthday-party", ic:"🎂", name:"נרות על העוגה",    kind:"game",  ages:[3,6], href:"topics/birthday-party/#games"},
  {id:"bday-bring",    topic:"birthday-party", ic:"🎁", name:"מה מביאים למסיבה?", kind:"game", ages:[3,6], href:"topics/birthday-party/#games"},
  {id:"bday-quiz",     topic:"birthday-party", ic:"❓", name:"מי זוכר את הסיפור?", kind:"game", ages:[4,6], href:"topics/birthday-party/#games"},
  {id:"feel-build",    topic:"feelings", ic:"🙂", name:"בונים פרצוף",           kind:"game",  ages:[2,8], href:"topics/feelings/#build"},
  {id:"feel-faces",    topic:"feelings", ic:"😊", name:"משחק פרצופים",          kind:"game",  ages:[3,8], href:"topics/feelings/#game"},
  {id:"feel-mirror",   topic:"feelings", ic:"🪞", name:"מראת רגשות",            kind:"game",  ages:[3,8], href:"topics/feelings/#mirror"},
  {id:"feel-whatif",   topic:"feelings", ic:"🤔", name:"מה היית מרגיש אם...?",  kind:"game",  ages:[4,8], href:"topics/feelings/#whatif"},
  {id:"col-monster",   topic:"colors",   ic:"🧦", name:"גרבולי – המפלצת שאוכלת גרביים", kind:"game", ages:[2,6], href:"topics/colors/#g-monster"},
  {id:"col-lab",       topic:"colors",   ic:"🧪", name:"מעבדת הצבעים",          kind:"game",  ages:[3,6], href:"topics/colors/#lab"},
  {id:"math-balloons", topic:"math", ic:"🎈", name:"מפוצצים בלונים",   kind:"game", ages:[1,2], href:"topics/math/?age=1"},
  {id:"math-hand",     topic:"math", ic:"✋", name:"היד סופרת",         kind:"game", ages:[1,2], href:"topics/math/?age=1"},
  {id:"math-many",     topic:"math", ic:"🍎", name:"אחד או הרבה?",      kind:"game", ages:[2,3], href:"topics/math/?age=2"},
  {id:"math-bigsmall", topic:"math", ic:"🐘", name:"גדול או קטן?",      kind:"game", ages:[2,3], href:"topics/math/?age=2"},
  {id:"math-count3",   topic:"math", ic:"🍎", name:"כמה יש? (עד 3)",    kind:"game", ages:[3,4], href:"topics/math/?age=3"},
  {id:"math-shapes",   topic:"math", ic:"🔷", name:"איפה הצורה?",       kind:"game", ages:[3,4], href:"topics/math/?age=3"},
  {id:"math-count5",   topic:"math", ic:"⭐", name:"כמה יש? (עד 5)",    kind:"game", ages:[4,5], href:"topics/math/?age=4"},
  {id:"math-pattern",  topic:"math", ic:"🔴", name:"מה בא אחר כך?",     kind:"game", ages:[4,5], href:"topics/math/?age=4"},
  {id:"math-more",     topic:"math", ic:"⚖️", name:"איפה יותר?",        kind:"game", ages:[5,6], href:"topics/math/?age=5"},
  {id:"math-missing",  topic:"math", ic:"❓", name:"איזה מספר חסר?",    kind:"game", ages:[5,6], href:"topics/math/?age=5"},
  {id:"math-add10",    topic:"math", ic:"➕", name:"כמה ביחד?",         kind:"game", ages:[6,7], href:"topics/math/?age=6"},
  {id:"math-ten",      topic:"math", ic:"🔟", name:"כמה חסר עד 10?",    kind:"game", ages:[6,7], href:"topics/math/?age=6"},
  {id:"math-addsub",   topic:"math", ic:"🧮", name:"חיבור וחיסור עד 20", kind:"game", ages:[7,8], href:"topics/math/?age=7"},
  {id:"math-skip",     topic:"math", ic:"🐸", name:"קופצים במספרים",    kind:"game", ages:[7,8], href:"topics/math/?age=7"},
  {id:"math-mult",     topic:"math", ic:"✖️", name:"לוח הכפל",          kind:"game", ages:[8,8], href:"topics/math/?age=8"},
  {id:"math-clock",    topic:"math", ic:"🕒", name:"מה השעה?",          kind:"game", ages:[8,8], href:"topics/math/?age=8"},
  {id:"eq-turtle",     topic:"earthquake", ic:"🐢", name:"משחק הצב",          kind:"game",  ages:[2,6], href:"topics/earthquake/#g-turtle"},
  {id:"eq-video",      topic:"earthquake", ic:"🎬", name:"צבי הצב: כשהאדמה רועדת", kind:"story", ages:[3,6], href:"topics/earthquake/#video"},
  {id:"eq-what",       topic:"earthquake", ic:"🤔", name:"מה עושים?",         kind:"game",  ages:[3,6], href:"topics/earthquake/#g-what"},
  {id:"eq-park",       topic:"earthquake", ic:"🌳", name:"איפה בטוח בחוץ?",   kind:"game",  ages:[3,6], href:"topics/earthquake/#g-park"},
  {id:"book-diaper",   topic:"bye-bye-diaper", ic:"🚽", name:"ביי ביי חיתול!",  kind:"game", ages:[2,4], href:"games/bye-bye-diaper/"},
  {id:"book-superhero",topic:"superhero",      ic:"🦸", name:"גיבור/ת על",      kind:"game", ages:[3,6], href:"games/superhero/"},
  {id:"book-birthday", topic:"birthday",       ic:"🎉", name:"ילד/ת יום הולדת", kind:"game", ages:[3,6], href:"games/birthday/"},
  {id:"book-savanna",  topic:"savanna",        ic:"🦒", name:"בסוואנה",         kind:"game", ages:[3,6], href:"games/savanna/"}
];

/* =====================================================================
   המנוע: מצב כל תוכן, כרטיס אחיד, מיון וסינון, מועדפים ו"ספרו לי"
   כל הדפים (דף הבית, הדלתות, הספרייה, המועדפים) נבנים מכאן.
   ===================================================================== */
(function(){
var C = window.CAT = {};
C.root = (function(){ try { var s = document.currentScript; return s && s.src ? s.src.replace(/catalog\.js(\?.*)?$/, "") : "/"; } catch (e) { return "/"; } })();

/* משפחת הבוקלים – השמות עם ניקוד, כדי שגם ההקראה תבטא נכון */
C.HOSTS = {
  booqli: {name:"בּוּקְלִי",       plain:"בוקלי",      role:"המדריכה של האתר",        img:"img/family/booqli.webp"},
  garb:   {name:"גַּרְבּוּקְלִי",   plain:"גרבוקלי",    role:"צבעים",                   img:"img/family/garb.webp"},
  hesh:   {name:"חֶשְׁבּוּקְלִי",   plain:"חשבוקלי",    role:"חשבון ומספרים",            img:"img/family/hesh.webp"},
  alef:   {name:"אֲלֶפְבּוּקְלִי",  plain:"אלפבוקלי",   role:"אותיות, קריאה וסיפורים",    img:"img/family/alef.webp"},
  lev:    {name:"לֵבְבּוּקְלִי",    plain:"לבבוקלי",    role:"רגשות",                   img:"img/family/lev.webp"},
  ona:    {name:"עוֹנְבּוּקְלִי",   plain:"עונבוקלי",   role:"עונות וחגים",              img:"img/family/ona.webp"},
  shomer: {name:"שׁוֹמֶרְבּוּקְלִי", plain:"שומרבוקלי",  role:"מוגנות ובטיחות",           img:"img/family/shomer.webp"}
};
C.HOST_ORDER = ["garb","hesh","lev","ona","shomer","alef","booqli"];
C.AUD = {
  t: {name:"לגננות",        ic:"👩‍🏫", path:"teachers/", c:"#C13671", b:"#FFE3F4"},
  p: {name:"להורים",        ic:"👨‍👩‍👧", path:"parents/",  c:"#2F6FC4", b:"#DCEBFF"},
  k: {name:"לילדים",        ic:"🧒", path:"kids/",     c:"#9A5800", b:"#FFF1C9"},
  s: {name:"כיתות א'–ג'",   ic:"🎒", path:"school/",   c:"#6B2FA3", b:"#F1E3FF"}
};
C.SUBJECTS = ["שפה ואוריינות","חשבון","מדע וטבע","רגשות וחברה","גוף ובריאות","מוגנות","אמנות ויצירה","תנועה ומוזיקה","חגים ומורשת","אנגלית"];
C.TYPES = {plan:"מערך", game:"משחקים", print:"דפים להדפסה", story:"סיפור", video:"סרטון", craft:"יצירה", offline:"בלי מסך", msg:"הודעה להורים", guide:"מדריך"};
C.AGES = [{k:"1-3", t:"1–3"}, {k:"3-4", t:"3–4"}, {k:"4-5", t:"4–5"}, {k:"5-6", t:"5–6"}, {k:"6-9", t:"6–9"}];
var OPEN_DAYS_BEFORE = 30;

/* ---------- תאריכים ---------- */
var d = function(s){ return new Date(s.length > 10 ? s + ":00+02:00" : s + "T00:00:00+02:00"); };
var iso = function(x){ return x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0"); };
C.fmt = function(s){ var x = d(s); return x.getDate() + "." + (x.getMonth()+1) + "." + x.getFullYear() + (s.length > 10 ? " בשעה " + s.slice(11, 16) : ""); };
C.fmtShort = function(s){ var x = d(s); return x.getDate() + "." + (x.getMonth()+1) + (s.length > 10 ? " · " + s.slice(11, 16) : ""); };
C.today = function(){ return typeof siteNow === "function" ? siteNow() : new Date(); };
C.opens = function(t){
  if (window.SITE && SITE.opens && SITE.opens[t.id]) return SITE.opens[t.id];
  if (t.opens) return t.opens;
  if (t.event) { var x = d(t.event); x.setDate(x.getDate() - OPEN_DAYS_BEFORE); return iso(x); }
  return "";
};
C.href = function(t){ return C.root + (t.href || "topics/" + t.id + "/"); };
C.owner = function(){ return typeof siteOwner === "function" && siteOwner(); };

/* open · locked (נפתח בתאריך) · soon (בהכנה) · closed (נסגר לעונה) */
C.stateReal = function(t){
  if (window.SITE && SITE.closes && SITE.closes[t.id] && typeof siteIsClosedRaw === "function" && siteIsClosedRaw(t.id)) return "closed";
  var o = C.opens(t);
  if (o && t.ready && d(o) > C.today()) return "locked";
  if (o && !t.ready && t.season && d(o) > C.today()) return "soon";
  return t.ready ? "open" : "soon";
};
C.state = function(t){
  var s = C.stateReal(t);
  return s !== "open" && C.owner() && (t.ready || (window.SITE && SITE.locked && SITE.locked[t.id])) ? "open" : s;
};

/* ---------- זיכרון בדפדפן: מועדפים ו"ספרו לי" ---------- */
var get = function(k){ try { return JSON.parse(localStorage.getItem(k) || "[]") || []; } catch (e) { return []; } };
var put = function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
C.favs = function(){ return get("booqli_favs"); };
C.isFav = function(id){ return C.favs().indexOf(id) > -1; };
C.toggleFav = function(id){
  var f = C.favs(), i = f.indexOf(id);
  if (i > -1) f.splice(i, 1); else f.unshift(id);
  put("booqli_favs", f);
  if (typeof siteEvent === "function") siteEvent(i > -1 ? "unfav" : "fav", id);
  return i < 0;
};
C.notifies = function(){ return get("booqli_notify"); };
C.isNotify = function(id){ return C.notifies().some(function(n){ return n.id === id; }); };
C.toggleNotify = function(id){
  var n = C.notifies(), i = -1;
  n.forEach(function(x, k){ if (x.id === id) i = k; });
  if (i > -1) n.splice(i, 1); else n.push({id: id, at: Date.now()});
  put("booqli_notify", n);
  if (typeof siteEvent === "function") siteEvent(i > -1 ? "unnotify" : "notify", id);
  return i < 0;
};
/* נושאים שביקשו "ספרו לי" ונפתחו בינתיים */
C.readyNotifies = function(){
  return C.notifies().map(function(n){ return C.byId(n.id); }).filter(function(t){ return t && C.stateReal(t) === "open"; });
};
C.byId = function(id){ for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i]; return null; };

/* ---------- סידור ---------- */
var RANK = {open:0, locked:1, soon:2, closed:3};
var dateKey = function(t){ var o = C.opens(t); return o ? d(o).getTime() : 0; };
C.sorters = {
  year: function(a, b){ return CATALOG.indexOf(a) - CATALOG.indexOf(b); },
  date: function(a, b){ return (dateKey(a) || 9e15) - (dateKey(b) || 9e15) || CATALOG.indexOf(a) - CATALOG.indexOf(b); },
  open: function(a, b){ return RANK[C.state(a)] - RANK[C.state(b)] || dateKey(b) - dateKey(a); },
  soon: function(a, b){ var r = function(t){ var s = C.state(t); return s === "locked" ? 0 : s === "soon" ? 1 : s === "open" ? 2 : 3; };
    return r(a) - r(b) || (dateKey(a) || 9e15) - (dateKey(b) || 9e15); },
  abc: function(a, b){ return a.name.localeCompare(b.name, "he"); }
};
C.SORTS = [{k:"year", t:"לפי לוח השנה"}, {k:"date", t:"לפי תאריך פתיחה"}, {k:"open", t:"פתוח עכשיו קודם"}, {k:"soon", t:"נפתח בקרוב קודם"}, {k:"abc", t:"לפי א\"ב"}];

/* ---------- חיפוש ---------- */
C.norm = function(x){ return String(x||"").toLowerCase().replace(/[֑-ׇ]/g,"").replace(/["'״׳`]/g,"").replace(/[.,:;!?()\-–־/]/g," ")
  .replace(/ך/g,"כ").replace(/ם/g,"מ").replace(/ן/g,"נ").replace(/ף/g,"פ").replace(/ץ/g,"צ").replace(/\s+/g," ").trim(); };
var PREFIX = "והבלמשכ";
C.hay = function(t){
  if (!t._hay) t._hay = " " + C.norm([t.name, t.p, (t.tags||[]).join(" "), (t.subj||[]).join(" "), (t.type||[]).map(function(k){ return C.TYPES[k]; }).join(" "),
    t.sped ? "חינוך מיוחד חנמ התאמות" : "", t.deaf ? "כבדי שמיעה כתוביות" : "", t.host && C.HOSTS[t.host] ? C.HOSTS[t.host].plain : ""].join(" ")) + " ";
  return t._hay;
};
C.match = function(t, q){
  var words = C.norm(q).split(" ").filter(Boolean), hay = C.hay(t);
  return words.every(function(w){
    if (hay.indexOf(w) > -1) return true;
    for (var i = 1; i <= 2 && w.length - i >= 3 && PREFIX.indexOf(w[i-1]) > -1; i++) if (hay.indexOf(w.slice(i)) > -1) return true;
    return false;
  });
};
C.ageHit = function(t, k){ var a = k.split("-").map(Number); return !(t.ages[1] < a[0] || t.ages[0] > a[1]); };

/* ---------- כרטיס אחיד ---------- */
var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); };
C.statusText = function(t, s){
  if (s === "open") return C.owner() && C.stateReal(t) !== "open" ? "👑 פתוח לך" : "פתוח";
  if (s === "locked") return "נפתח ב-" + C.fmtShort(C.opens(t));
  if (s === "closed") return "נסגר · ייפתח בשנה הבאה";
  var o = t.season && C.opens(t);
  return o && d(o) > C.today() ? "בהכנה · לקראת " + C.fmtShort(C.opens(t)) : "בהכנה";
};
C.card = function(t, opt){
  opt = opt || {};
  var s = C.state(t), wrap = document.createElement("div");
  wrap.className = "c-tile st-" + s + (t.rainbow ? " rainbow" : "");
  var icon = t.book ? '<img src="' + C.root + t.img + '" alt="" loading="lazy">' : t.ic;
  var meta = [];
  if (t.min) meta.push('<span class="m">⏱ ' + t.min + '′</span>');
  if (t.sped) meta.push('<span class="m sp" title="מתאים גם לחינוך מיוחד">💜</span>');
  if (t.deaf) meta.push('<span class="m" title="כתוביות לכבדי שמיעה">🦻</span>');
  var host = opt.host && t.host && C.HOSTS[t.host] ? '<span class="host">' + C.HOSTS[t.host].name + '</span>' : "";
  wrap.innerHTML = '<a class="c-card" href="' + C.href(t) + '">' +
      '<span class="c-ic" style="background:' + (t.bg || "#FFE3F4") + '">' + icon + '</span>' +
      '<span class="c-name">' + esc(t.name) + '</span>' + host +
      '<span class="c-sub"><span dir="ltr">' + t.ages[0] + "–" + t.ages[1] + '</span> ' + (t.book ? "· ספר BOOQLI" : "") + meta.join("") + '</span>' +
      '<span class="c-st">' + C.statusText(t, s) + '</span></a>';
  var a = wrap.firstChild;
  a.setAttribute("aria-label", t.name + ", " + C.statusText(t, s));
  if (s !== "open") a.addEventListener("click", function(e){ e.preventDefault(); C.info(t, s); });
  else if (opt.kids) a.href = C.href(t) + (t.book ? "" : (window.KIDS_GAMES || []).some(function(g){ return g.topic === t.id; }) ? "?play=1" : "#play");
  var act = document.createElement("div"); act.className = "c-act";
  if (s === "open") {
    var f = document.createElement("button"); f.type = "button"; f.className = "c-fav";
    var paint = function(){ var on = C.isFav(t.id); f.setAttribute("aria-pressed", on); f.innerHTML = on ? "❤️ <span>נשמר</span>" : "🤍 <span>לשמור</span>"; f.setAttribute("aria-label", (on ? "הסרה מהמועדפים: " : "שמירה למועדפים: ") + t.name); };
    paint(); f.onclick = function(){ C.toggleFav(t.id); paint(); if (opt.onChange) opt.onChange(); };
    act.appendChild(f);
    if (opt.gift && !t.noGift) {
      var g = document.createElement("button"); g.type = "button"; g.className = "c-gift"; g.textContent = "🎁 להורים";
      g.setAttribute("aria-label", "מתנה להורים: " + t.name); g.onclick = function(){ C.sendGift(t); }; act.appendChild(g);
    }
  } else if (s !== "closed") {
    var n = document.createElement("button"); n.type = "button"; n.className = "c-bell";
    var paintN = function(){ var on = C.isNotify(t.id); n.setAttribute("aria-pressed", on); n.innerHTML = on ? "🔔 <span>נספר לך</span>" : "🔔 <span>ספרו לי</span>"; n.setAttribute("aria-label", (on ? "ביטול הבקשה: " : "ספרו לי כשנפתח: ") + t.name); };
    paintN(); n.onclick = function(){ var on = C.toggleNotify(t.id); paintN(); if (on) C.toast("🔔 שמרנו. כשזה ייפתח, נציג לך את זה כאן באתר ונודיע בקבוצת העדכונים."); if (opt.onChange) opt.onChange(); };
    act.appendChild(n);
  }
  wrap.appendChild(act);
  return wrap;
};
C.grid = function(list, opt){
  var g = document.createElement("div"); g.className = "c-grid";
  list.forEach(function(t){ g.appendChild(C.card(t, opt)); });
  return g;
};

/* ---------- הודעה להורים (מתנה דיגיטלית) ---------- */
C.wa = function(text){ var u = "https://wa.me/?text=" + encodeURIComponent(text); var w = window.open(u, "_blank", "noopener"); if (!w) location.href = u; };
C.siteUrl = function(){ return location.origin + C.root.replace(location.origin, ""); };
C.sendGift = function(t){
  C.wa("🎁 מתנה מהגן: " + t.name + " – לשחק וללמוד בבית!\n\nהכנו לכם משחקים, דפים להדפסה וחידון בנושא " + t.name + ", כדי להמשיך בבית את מה שלמדנו בגן.\nבחינם · אתר בטוח להורים ולילדים.\n\n👈 " + C.siteUrl() + "topics/" + t.id + "/?utm_source=whatsapp&utm_medium=gan_gift&utm_campaign=" + t.id + "\n\nהתכנים מוענקים בחינם, בחסות BOOQLI ❤️");
  if (typeof siteEvent === "function") siteEvent("gift-parents", t.id);
};

/* ---------- חלון מידע לנושא שלא פתוח ---------- */
C.info = function(t, s){
  var old = document.querySelector(".c-modal"); if (old) old.remove();
  var m = document.createElement("div"); m.className = "c-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "cmT");
  var txt = s === "closed" ? "התכנים של " + t.name + " נסגרו לשנה הזו. הם ייפתחו שוב בעונה שלהם בשנה הבאה."
    : s === "locked" ? t.name + " ייפתח ב-" + C.fmt(C.opens(t)) + ". רוצה שנזכיר לך? לוחצים על \"ספרו לי\", ובקבוצת העדכונים בוואטסאפ מודיעים ברגע שזה נפתח."
    : "אנחנו מכינים את " + t.name + " ממש עכשיו. לוחצים על \"ספרו לי\", וכך אנחנו גם יודעים כמה מחכים לנושא הזה.";
  m.innerHTML = '<div class="in"><div class="big">' + (t.book ? "📚" : t.ic) + '</div><h3 id="cmT">' + esc(t.name) + '</h3><p>' + txt + '</p>' +
    '<div class="row">' + (s !== "closed" ? '<button type="button" class="b-bell"></button>' : '') +
    '<a class="b-wa" target="_blank" rel="noopener">💬 קבוצת העדכונים</a></div>' +
    '<p class="wa-note">' + C.waNote + '</p>' +
    '<button type="button" class="close">סגירה</button></div>';
  document.body.appendChild(m);
  m.querySelector(".b-wa").href = window.SITE ? SITE.whatsappGroup : "#";
  var bb = m.querySelector(".b-bell");
  if (bb) { var p = function(){ bb.textContent = C.isNotify(t.id) ? "🔔 נספר לך ✓" : "🔔 ספרו לי כשזה מוכן"; }; p(); bb.onclick = function(){ C.toggleNotify(t.id); p(); document.querySelectorAll(".c-tile").length && C.refresh && C.refresh(); }; }
  var close = function(){ m.remove(); document.removeEventListener("keydown", k); };
  var k = function(e){ if (e.key === "Escape") close(); };
  m.querySelector(".close").onclick = close; m.onclick = function(e){ if (e.target === m) close(); };
  document.addEventListener("keydown", k); m.querySelector(".close").focus();
};
C.waNote = "בהצטרפות לקבוצה שאר החברות יכולות לראות את המספר שלך. BOOQLI לא מעבירה ולא מפרסמת אותו.";
C.toast = function(t){ var x = document.createElement("div"); x.className = "c-toast"; x.setAttribute("role", "status"); x.textContent = t; document.body.appendChild(x); setTimeout(function(){ x.remove(); }, 4200); };

/* ---------- אזור עם קבוצות: כל תוכן מופיע פעם אחת בעמוד ---------- */
C.sections = function(host, list, sections, opt){
  var used = {};
  host.innerHTML = "";
  sections.forEach(function(sec){
    var items = list.filter(function(t){ return !used[t.id] && sec.filter(t); });
    if (sec.sort) items.sort(C.sorters[sec.sort]);
    if (!items.length && !sec.always) return;
    items.forEach(function(t){ used[t.id] = 1; });
    var el = document.createElement(sec.collapsed ? "details" : "section");
    el.className = "c-sec" + (sec.collapsed ? " c-more" : "");
    if (sec.id) el.id = sec.id;
    var head = '<h2>' + sec.title + (sec.collapsed ? ' <small>(' + items.length + ')</small>' : '') + '</h2>' + (sec.sub ? '<p>' + sec.sub + '</p>' : '');
    el.innerHTML = sec.collapsed ? '<summary>' + head + '</summary>' : '<div class="c-sec-h">' + head + '</div>';
    if (sec.before) el.appendChild(sec.before());
    if (items.length) el.appendChild(C.grid(items, Object.assign({}, opt, sec.opt || {})));
    host.appendChild(el);
  });
};

/* ---------- עיצוב משותף לכרטיסים ---------- */
var css = document.createElement("style");
css.textContent =
".c-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:14px}" +
"@media (max-width:520px){.c-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}" +
".c-tile{display:flex;flex-direction:column;background:#fff;border-radius:22px;box-shadow:0 4px 0 #d9e9e1,0 8px 20px rgba(78,133,118,.08);overflow:hidden;min-width:0}" +
".c-card{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 10px 10px;text-align:center;text-decoration:none;color:#2B1526}" +
".c-card:focus-visible{outline:3px solid #FF56C2;outline-offset:-3px;border-radius:22px}" +
".c-ic{width:68px;height:68px;border-radius:20px;display:grid;place-items:center;font-size:36px;overflow:hidden}" +
".c-ic img{width:100%;height:100%;object-fit:cover}" +
".c-name{font-family:Fredoka,Assistant,sans-serif;font-weight:700;font-size:18px;line-height:1.15;text-wrap:balance}" +
".c-tile .host{font-size:12.5px;font-weight:800;color:#9A5800}" +
".c-sub{font-size:13px;color:#6b5a66;font-weight:700;display:flex;gap:4px;align-items:center;flex-wrap:wrap;justify-content:center}" +
".c-sub .m{background:#F4FAF7;border-radius:999px;padding:0 7px}" +
".c-st{margin-top:auto;border-radius:999px;padding:3px 12px;font-weight:800;font-size:13.5px;background:#E1F0EA;color:#2F5F53}" +
".st-open .c-st{background:#DDF3E5;color:#1E7F45}.st-locked .c-st{background:#F1E3FF;color:#6B2FA3}.st-soon .c-st{background:#FFF1C9;color:#8A5A00}.st-closed .c-st{background:#F2EEF1;color:#6b5a66}" +
".st-soon .c-ic,.st-closed .c-ic{filter:grayscale(.35);opacity:.85}" +
".c-tile.rainbow{background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,#FF4D5E,#FF9A2E,#FFD23F,#46C46E,#3AA7F0,#B05BE8) border-box;border:3px solid transparent}" +
".c-act{display:flex;border-top:1px solid #EEF4F1}" +
".c-act button{flex:1;min-height:40px;background:none;border:0;font:inherit;font-weight:800;font-size:13.5px;color:#4E8576;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px}" +
".c-act button+button{border-inline-start:1px solid #EEF4F1}" +
".c-act button:hover{background:#F4FAF7}.c-act .c-fav[aria-pressed=true]{color:#C13671}.c-act .c-bell[aria-pressed=true]{color:#6B2FA3;background:#F8F2FF}" +
".c-act button:focus-visible{outline:3px solid #FF56C2;outline-offset:-3px}" +
".c-sec{margin-top:30px}.c-sec-h h2,.c-more summary h2{font-family:Fredoka,Assistant,sans-serif;font-size:clamp(22px,3.4vw,28px);color:#4E8576;margin:0}" +
".c-sec-h p,.c-more summary p{margin:4px 0 12px;color:#6b5a66}" +
".c-more{background:#F7FBF9;border-radius:22px;padding:12px 16px}.c-more summary{cursor:pointer;list-style:none}.c-more summary::-webkit-details-marker{display:none}" +
".c-more summary h2{font-size:20px}.c-more summary h2::before{content:'▸ ';color:#FF56C2}.c-more[open] summary h2::before{content:'▾ '}.c-more small{color:#6b5a66;font-size:15px}.c-more .c-grid{margin-top:10px}" +
".c-modal{position:fixed;inset:0;z-index:180;background:rgba(43,21,38,.5);display:grid;place-items:center;padding:16px;direction:rtl;font-family:Assistant,Arial,sans-serif}" +
".c-modal .in{background:#fff;border-radius:26px;max-width:420px;width:100%;padding:22px 20px;text-align:center;color:#2B1526}" +
".c-modal .big{font-size:56px;line-height:1.1}.c-modal h3{font-family:Fredoka,Assistant,sans-serif;font-size:26px;color:#C13671;margin:6px 0}" +
".c-modal .row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}" +
".c-modal .b-bell{background:#6B2FA3;color:#fff;border:0;border-radius:999px;padding:11px 18px;font:inherit;font-weight:800;cursor:pointer}" +
".c-modal .b-wa{background:#1FA855;color:#fff;border-radius:999px;padding:11px 18px;font-weight:800;text-decoration:none}" +
".c-modal .wa-note{font-size:12.5px;color:#6b5a66;margin:10px 0 0}" +
".c-modal .close{margin-top:12px;background:none;border:0;color:#6b5a66;text-decoration:underline;font:inherit;font-weight:700;cursor:pointer;padding:8px}" +
".c-toast{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:220;background:#2B1526;color:#fff;border-radius:14px;padding:10px 16px;max-width:calc(100% - 32px);font-weight:700;text-align:center;font-family:Assistant,Arial,sans-serif}" +
"@media print{.c-modal,.c-toast{display:none!important}}";
document.head.appendChild(css);
})();
