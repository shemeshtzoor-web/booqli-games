# -*- coding: utf-8 -*-
"""הקבצים של מרכז הפרסום (3.11.2026) – כל תמונה וסרטון לפרסום, שהתוסף מוריד לבד.
⚠️ הכל כאן ציבורי (המאגר ציבורי, הקבצים בכתובת games.booqli.ai/marketing/media/...).
   רק חומרי פרסום שממילא מתפרסמים. אף פעם לא: צילומים אמיתיים של ילדים בלי אישור, תמונות של לקוחות, ספרים של הזמנות, מידע פרטי.
הוספה: שמים את הקובץ ב-marketing/media/<קבוצה>/, מוסיפים שורה ל-ITEMS, ומריצים:  python3 marketing/build_media.py
(בונה את marketing/media/media.json עם הגודל של כל קובץ. התוסף מוריד רק מה שחדש או שהשתנה.)
topic = ה-id של הנושא במרכז הפרסום (build_kit.py) – כך הקבצים מסודרים בתוסף לפי הנושאים של האתר.
slot = "<נושא>:video" או "<נושא>:image" – אם המשבצת של הנושא בתוסף ריקה, הקובץ נכנס גם אליה."""
import json, os, time
HERE = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(HERE, "media")
GROUPS = [
  {"id":"birthday","name":"🎂 ספר יום הולדת – לפרטיים ולגנים (חדש)","note":"2 סרטונים 4:5 (6.11.2026, עודכן: הכל גדול, כתובית רצה 'ספרים זה אחריות · קונים רק מאתרים מוכרים · BOOQLI – מעל שנתיים של מוניטין', בגנים 'החל מ-50 ₪' כל הזמן, בפרטיים 6 ספרים נוספים), מוזיקה מקורית של מסיבת יום הולדת: ספר שהילד הוא הגיבור → כמה קל להזמין (הקלטה אמיתית של האתר) → מה מקבלים → במתנה (booqli Games לפרטיים / קיט חגיגי לגן) → משלמים רק אם אוהבים. מחליפים את הסרטונים הישנים של יום הולדת."},
  {"id":"game-maker","name":"🎙️ ממציאים משחק עם כל הגן","note":"סרטון 20 שנ' עם מוזיקה מקורית: בוחרים נושא → כל ילד אומר מילה → סבאבוקלי מגריל משחק → המרוץ. 4:5 לפייסבוק/וואטסאפ, 9:16 לסטורי."},
  {"id":"savta","name":"💛 סבים – ספר אישי לנכדים","note":"9 סרטונים 4:5 עם מוזיקה מקורית. כל סרטון מוביל לעמוד הסבים עם הספר שלו כבר בטופס (?book=), ונמדד בנפרד (utm_content).","link":"https://games.booqli.ai/savta/"},
  {"id":"dictation","name":"✏️ מאמן ההכתבה – כיתות א'–ג'","note":"סרטון 22 שנ' עם מוזיקה מקורית: מילים להכתבה? ← ההורה מקליד והניקוד נוסף לבד ← 5 משחקים ← שולחים לכל הכיתה בקישור אחד ← בחינם, בטוח לילדים, עובד גם בלי אינטרנט. 4:5 לפיד ולוואטסאפ, 9:16 לסטורי."},
  {"id":"road-safety","name":"🚦 זהירות בדרכים","note":"סרטון 29 שנ' עם מוזיקה מקורית: הסיפור, משחק הרמזור, סדר החצייה, בטוח או מסוכן, קסדה, המערכים והדפים. 4:5 לפייסבוק/וואטסאפ, 9:16 לסטורי, ותמונה 1:1.","link":"https://games.booqli.ai/topics/road-safety/"},
]
BOOKS = [("first","הספר הראשון שלי","הנכדים","הם הגיבורים"),("birthday","ילד/ת יום הולדת","הנכדה","היא הגיבורה"),("kinder","הולך/ת לגן","הנכדים","הם הגיבורים"),
         ("druki","דרוקי הדרקון","הנכד","הוא הגיבור"),("hugs","חיבוקים","הנכדים","הם הגיבורים"),("superhero","גיבור/ת על","הנכד","הוא הגיבור"),
         ("night","אני והחד־קרן","הנכדה","היא הגיבורה"),("savanna","בסוואנה","הנכדה","היא הגיבורה"),("class1","עולה לכיתה א'","הנכדה","היא הגיבורה")]
VALUE = {"first":"מילים קלות ופשוטות לקטנטנים (6 חודשים עד שנתיים) – הספר הראשון שבו הם פוגשים את עצמם.",
  "birthday":"כל היום המיוחד, מהבוקר ועד השינה – מתנת יום הולדת שנשארת לתמיד.",
  "kinder":"היום הראשון בגן, עם חיות נחמדות שנותנות טיפים בדרך – מרגיע ומחזק לפני הגן.",
  "druki":"טיול ביער ומפגש עם דרקון קטן ואמיץ – הרפתקה שנותנת אומץ.",
  "hugs":"המעשים הטובים וכל החיבוקים האוהבים – ספר על אהבה ונתינה.",
  "superhero":"גיבור/ה שבוחר/ת במעשים טובים – כי כוח־על אמיתי הוא לב טוב.",
  "night":"הרפתקה קסומה עם חד־קרן בלילה – ספר רגוע לפני השינה.",
  "savanna":"הרפתקה בסוואנה באפריקה – פוגשים את החיות ולומדים לשמור על הטבע.",
  "class1":"השאלות והחששות לפני העלייה לכיתה א' – בונה ביטחון לקראת ההתחלה הגדולה."}
def savta_lines(bid, name, noun, hero):
    """הטקסט למודעה (בלי קישור – הקישור בכפתור). כל ספר עם הערך המוסף שלו."""
    return ["סבתא, סבא 💛 הנכדים תמיד זוכרים מי אהב אותם.", "",
            f"📖 \"{name}\" – ספר אישי ש{noun} {hero} שלו, מתמונה אחת.", VALUE[bid], "",
            "✍️ כתוב בידי שמש צור, הסופרת הראשית של BOOQLI – ערוך, מנוקד ובחרוזים",
            "📚 כריכה קשה איכותית, עד הבית",
            "📲 בלי אתר ובלי טכנולוגיה – שולחים תמונה בוואטסאפ, רואים את כל הספר לפני ומשלמים רק אם אוהבים",
            "🎁 ובמתנה: אפליקציית משחקים חינמית ובטוחה לילדים – עובדת גם בלי אינטרנט"]
def savta_text(bid, name, noun, hero):
    link = f"https://games.booqli.ai/savta/?book={bid}&utm_source=facebook&utm_medium=paid&utm_campaign=savta&utm_content={bid}"
    return "\n".join(savta_lines(bid, name, noun, hero)) + f"\n\n👈 {link}"
ITEMS = [{"id":"savta-"+b, "group":"savta", "topic":"savta", "title":n, "kind":"video", "ratio":"4:5", "file":f"savta/booqli-savta-{b}-4x5.mp4",
          "thumb":f"savta/booqli-savta-{b}-4x5.jpg", "date":"2026-11-03", "text":savta_text(b, n, no, he)} for b, n, no, he in BOOKS]
GM_TEXT = ("ערב טוב גננות 🌙 יש לכם משהו מקורי למחר? 🤩\n🎙️ ממציאים משחק עם כל הגן: כל ילד אומר מילה, וסבאבוקלי בונה מזה משחק אמיתי – 🏃 מרוץ · 🧺 תופסים · 🐍 נחש · 🎰 לוטו.\n"
           "📲 ובסוף שולחים להורים, והילדים ממשיכים לשחק בבית!\nבחינם · אתר בטוח להורים ולילדים · בחסות BOOQLI 💕\n👈 https://games.booqli.ai/topics/game-maker/?utm_source=facebook_group&utm_medium=post&utm_campaign=game-maker")
ITEMS += [{"id":"game-maker-4x5","group":"game-maker","topic":"game-maker","title":"ממציאים משחק – 4:5","kind":"video","ratio":"4:5","file":"game-maker/booqli-game-maker-4x5.mp4","thumb":"game-maker/booqli-game-maker-4x5.jpg","date":"2026-11-03","text":GM_TEXT,"slot":"game-maker:video"},
          {"id":"game-maker-9x16","group":"game-maker","topic":"game-maker","title":"ממציאים משחק – 9:16 (סטורי)","kind":"video","ratio":"9:16","file":"game-maker/booqli-game-maker-9x16.mp4","thumb":"game-maker/booqli-game-maker-9x16.jpg","date":"2026-11-03","text":GM_TEXT}]

RS_TEXT = ("🚦 זהירות בדרכים – לגן ולכיתות א'–ג'!\nשׁוֹמֶרְבּוּקְלִי וכל משפחת BOOQLI יוצאים לגן השעשועים, ובדרך לומדים לחצות יד ביד, לחגור, לחבוש קסדה ולהיראות בחושך.\n"
           "📖 סיפור מאויר עם הקראה · 🎮 5 משחקים · 👩‍🏫 מערך לגננת · 🎒 שיעור למורה · 🖨️ 4 דפים להדפסה\nבחינם · אתר בטוח להורים ולילדים · בחסות BOOQLI 💕\n👈 https://games.booqli.ai/topics/road-safety/?utm_source=facebook_group&utm_medium=post&utm_campaign=road-safety")
ITEMS += [{"id":"road-safety-4x5","group":"road-safety","topic":"road-safety","title":"זהירות בדרכים – 4:5","kind":"video","ratio":"4:5","file":"road-safety/booqli-road-safety-4x5.mp4","thumb":"road-safety/booqli-road-safety-4x5.jpg","date":"2026-11-04","text":RS_TEXT,"slot":"road-safety:video"},
          {"id":"road-safety-9x16","group":"road-safety","topic":"road-safety","title":"זהירות בדרכים – 9:16 (סטורי)","kind":"video","ratio":"9:16","file":"road-safety/booqli-road-safety-9x16.mp4","thumb":"road-safety/booqli-road-safety-9x16.jpg","date":"2026-11-04","text":RS_TEXT},
          {"id":"road-safety-1x1","group":"road-safety","topic":"road-safety","title":"זהירות בדרכים – תמונה 1:1","kind":"image","ratio":"1:1","file":"road-safety/booqli-road-safety-1x1.jpg","thumb":"road-safety/booqli-road-safety-1x1.jpg","date":"2026-11-04","text":RS_TEXT,"slot":"road-safety:image"}]
DICT_TEXT = ("✏️ חדש! מאמן ההכתבה – לכל ילדי כיתות א'–ג'\n"
             "המורה נתנה מילים להכתבה? מקלידים אותן פעם אחת (הניקוד נוסף לבד), והילדים מתרגלים ב-5 משחקים: בונים מילה, מי כתובה נכון, מפוצצים בלונים, כותבים מהזיכרון והכתבה אמיתית 🎈\n"
             "📲 שולחים קישור אחד לכל הורי הכיתה – והמילים נטענות אצל כולם.\n\n"
             "✅ בחינם – הכל. תמיד.\n🛡️ בטוח לילדים\n📴 עובד גם בלי אינטרנט (באפליקציה)\n\n"
             "👈 https://games.booqli.ai/school/dictation/?utm_source=whatsapp&utm_medium=share&utm_campaign=school-dictation\n\n"
             "🙏 מכירים הורים או מורות של כיתות א'–ג'? שלחו להם את ההודעה הזו 💕\n"
             "🙏 עזרו לנו לגדול – הזמינו חברים לקבוצה 💕\nhttps://chat.whatsapp.com/I00ZXog0R88HDDMolWYKbx")
ITEMS += [{"id":"dictation-4x5","group":"dictation","topic":"school-dictation","title":"מאמן ההכתבה – 4:5","kind":"video","ratio":"4:5","file":"dictation/booqli-dictation-4x5.mp4","thumb":"dictation/booqli-dictation-4x5.jpg","date":"2026-11-04","text":DICT_TEXT},
          {"id":"dictation-9x16","group":"dictation","topic":"school-dictation","title":"מאמן ההכתבה – 9:16 (סטורי)","kind":"video","ratio":"9:16","file":"dictation/booqli-dictation-9x16.mp4","thumb":"dictation/booqli-dictation-9x16.jpg","date":"2026-11-04","text":DICT_TEXT}]

# ===== גנים – ספר לכל ילד: קבצים + הודעות לשליחה ידנית (לפי שמש, 5.11.2026) =====
GROUPS.append({"id":"kinder-send","name":"📚 גנים – לשליחה ידנית","note":"לפי הסדר: 1 הודעה ראשונה + סרטון הקיט · 2 איך זה עובד + סרטון ההסבר · 3 תמונות + סרטון תמונה טובה · 4 כריכות + סרטון הכריכות. מורידים את הסרטון, מעתיקים את הטקסט ושולחים בוואטסאפ."})
K1 = """היי! 🎉 כאן שמש מ-BOOQLI 💗

*בבוקלי כל ילד וילדה בגן הופכים לגיבורים של ספר יום הולדת אישי ומרגש!*
זה לא עוד ספר מהמדף – זו חגיגה שלמה שמתחילה בספר 📖✨

*מה יש בכל ספר?*
✨ השם של הילד/ה על הכריכה ולאורך כל העלילה
🎨 איורים בדמות הילד/ה – לפי התמונה, על הכריכה ובכל עמוד
💌 הקדשה אישית מטעם הגן או הוועד, מודפסת בעמוד השער
👌 אין צורך לערוך כלום – מעלים תמונה אחת ומקבלים ספר מושלם!

🎁 *ובמתנה לגננת – קיט חגיגת יום הולדת מוכן!*
👑 כתר עם השם של הילד/ה להדפסה
💌 כרטיס ברכה עם התמונה שלו/ה
🎈 מערך חגיגה שלב אחר שלב: הכתרה, מצעד החברים, כיסא המלך/המלכה
🖍️ דפי צביעה ודף ברכה מכל חבר
כל יום הולדת בגן הופך לחגיגה – בלי להכין כלום מראש!

📲 *ועוד מתנה: האפליקציה booqli Games* – משחקים, דפי עבודה ומערכים לפי לוח השנה, לגננת ולהורים, באייקון אחד בטלפון 🎮

💰 *המחירים להזמנה של 20–49 ספרים:*
💗 כריכה קשה פרימיום – 77 ₪ לספר
💛 כריכה רכה פיג'מה (כמו ספריית פיג'מה) – 60 ₪ לספר
💜 חוברת כרומו סיכות – 50 ₪ לספר
🎬 סרטון קצר על שלושת סוגי הכריכות: https://youtu.be/sGODE7ehbMY

המחירים לגנים כבר כוללים הנחה משמעותית לפי הכמות וסוג הכריכה, ונקבעו מתוך התחשבות בתקציבים של הגנים – ולכן הם סופיים.

📦 *איך הספרים מגיעים?*
🚗 איסוף עצמי מבית הדפוס (ליד עפולה) – בלי עלות, כשבוע מאישור ההדפסה (מומלץ!)
🚚 משלוח צ'יטה עד הבית – 40 ₪, עד 14 ימי עסקים מאישור ההדפסה

🎁 *רוצה לראות קודם?*
שלחי לי עכשיו תמונה של ילד/ה שאת מכירה + השם, ואכין לך דוגמה ראשונית – בלי עלות ובלי התחייבות 💗

למידע נוסף: https://www.booqli.ai/he/kindergartens"""
K2 = """🗺️ *איך זה עובד – פשוט מאוד:*

1️⃣ בוחרים ספר אחד לכל הגן
2️⃣ שולחים לי כאן בוואטסאפ *תמונה אחת לכל ילד/ה + השם הפרטי*
3️⃣ בוחרים הקדשה לכל הגן (את ההתאמה לבנים ולבנות אנחנו עושים)
4️⃣ תוך יום עסקים אחד – מקבלים כאן את כל הסקיצות לאישור 👀
5️⃣ אוהבים? משלמים בקישור ששולחים לכם. לא אוהבים? נפרדים כידידים ❤️
6️⃣ אישור הדפסה ← הדפסה ← איסוף או משלוח 📦

✂️ אין צורך לערוך שום דבר – רק תמונות, שמות והקדשה.
🔒 חשוב: לפני שליחת התמונות צריך אישור מההורים – יש לי נוסח מוכן, רק תגידי 💗

בסרטון המצורף אני מסבירה הכל בדקה 🎬"""
K3 = """📸 *איך שולחים את התמונות:*

👤 תמונה אחת לכל ילד/ה
✍️ כל תמונה נשלחת *עם כיתוב*: השם הפרטי + בן או בת. למשל: *נועה בת* · *דני בן*
📲 אפשר לשלוח כמה תמונות ביחד ובאיזה סדר שרוצים – כל אחת עם הכיתוב שלה
👯 שני ילדים עם אותו שם? כותבים "יוסי 1 בן", "יוסי 2 בן"

⚠️ *חשוב:* שולחים תמונת פנים ברורה – האחריות לתמונה טובה היא שלכם. לא בטוחים? צפו בסרטון המצורף 👆

📸 *תמונה טובה = איור טוב:*
🔵 ילד/ה אחד/ת בלבד – בלי אנשים או חיות, גם לא ברקע
🔴 מבט ישיר למצלמה – לא הצידה ולא מלמעלה
🟠 פנים גלויות – בלי כובע, משקפי שמש, סרטים, כתרים או פלסטרים
🟢 בנים עם כיפה – שהכיפה תופיע בתמונה
🟣 בנות – התסרוקת באיור תהיה כמו בתמונה
⚪ אם מצלמים במיוחד – רקע לבן וחולצה לבנה
😀 והכי חשוב – חיוך!"""
K4 = """📕 *שלושת סוגי הכריכות* (בסרטון המצורף רואים את ההבדל):

💗 *כריכה קשה פרימיום* – 21×21 ס״מ, בסגנון אלבום, דפים כרומו 170 ג׳
💰 77 ₪ לספר

💛 *כריכה רכה פיג'מה* – כמו ספריית פיג'מה, 20×20 ס״מ, כרוך בהדבקה, כריכה כרומו 300 ג׳, דפים כרומו 170 ג׳
💰 60 ₪ לספר

💜 *חוברת כרומו סיכות* – 20×20 ס״מ, בסגנון מגזין, כריכה ודפים כרומו 170 ג׳ (מ-20 ספרים)
💰 50 ₪ לספר

(המחירים להזמנה של 20–49 ספרים)"""
ITEMS += [
  {"id":"kinder-1-first","group":"kinder-send","topic":"kinder-book","title":"1. הודעה ראשונה + סרטון הקיט","kind":"video","ratio":"4:5","file":"kinder-book/booqli-gan-birthday-kit-4x5.mp4","thumb":"kinder-book/booqli-gan-birthday-kit-4x5.jpg","date":"2026-11-05","text":K1},
  {"id":"kinder-2-how","group":"kinder-send","topic":"kinder-book","title":"2. איך זה עובד + סרטון הסבר","kind":"video","ratio":"3:4","file":"../../kindergartens/video/guide-wa.mp4","thumb":"../../kindergartens/video/guide.jpg","date":"2026-11-05","text":K2},
  {"id":"kinder-3-photos","group":"kinder-send","topic":"kinder-book","title":"3. תמונות + סרטון תמונה טובה","kind":"video","ratio":"16:9","file":"../../kindergartens/video/photo.mp4","thumb":"../../kindergartens/video/photo.jpg","date":"2026-11-05","text":K3},
  {"id":"kinder-4-covers","group":"kinder-send","topic":"kinder-book","title":"4. כריכות + סרטון הכריכות","kind":"video","ratio":"16:9","file":"../../kindergartens/video/covers.mp4","thumb":"../../kindergartens/video/covers.jpg","date":"2026-11-05","text":K4},
]
# ---- 6.11.2026: שני סרטוני יום ההולדת החדשים (במקום הישנים: savta-birthday והקיט לגנים שהוביל ל-booqli.ai) ----
BD_PRIVATE = """🎂 ספר יום הולדת שהילד/ה הוא/היא הגיבור/ה!

השם והפנים של הילד/ה בכל עמוד – ספר מודפס בכריכה קשה, עם ההקדשה שלכם.
📷 מזמינים בשתי דקות: בוחרים ספר, שם ותמונה אחת – ושולחים.
🎁 ובמתנה: booqli Games – מלא משחקים חינוכיים לילדים, בחינם.
📚 ועוד ספרים לבחירה: גיבור/ת על, חיבוקים, הספר הראשון שלי, הולך/ת לגן, עולה לכיתה א', דרוקי הדרקון.

⭐ ספרים זה אחריות – קונים רק מאתרים מוכרים. BOOQLI – מעל שנתיים של מוניטין.

✍️ ספרים מאת הסופרת שמש צור – ערוכים, מנוקדים ובחריזה.
✋ אתם לא עורכים ולא בודקים: מעלים תמונה – ומקבלים ספר.
💛 הנחות משמעותיות החל מהספר השני.
💚 משלמים רק אם אוהבים: קודם רואים את הסקיצה, ורק אם אוהבים – משלמים.

👈 https://games.booqli.ai/savta/?book=birthday&utm_source=facebook&utm_medium=paid&utm_campaign=birthday_private#order"""
BD_GAN = """🎂 ספר אישי לכל ילד בגן – כל ילד הגיבור של הספר שלו!

📷 מעלים את כל התמונות בבת אחת, שם לכל ילד, נושא אחד לכל הגן – ושולחים. 5 דקות.
🎁 ובמתנה לגן: קיט חגיגי ליום ההולדת – מערך 45 דק' שמכתיר את החוגג, משחקים להקרנה, כתר עם השם, כרטיס ברכה עם תמונה והודעה מוכנה להורים.

✍️ ספרים מאת הסופרת שמש צור – ערוכים, מנוקדים ובחריזה.
✋ אתם לא עורכים ולא בודקים: מעלים תמונה – ומקבלים ספר.
💰 החל מ-50 ₪ לספר · ככל שיותר ילדים – זול יותר.
💚 משלמים רק אם אוהבים: רואים את כל הספרים לפני שמשלמים.

⭐ ספרים זה אחריות – קונים רק מאתרים מוכרים. BOOQLI – מעל שנתיים של מוניטין.

👈 https://games.booqli.ai/kindergartens/?utm_source=facebook&utm_medium=paid&utm_campaign=birthday_gan"""
ITEMS = [x for x in ITEMS if x["id"] not in ("savta-birthday",)]
for x in ITEMS:
    if x["id"] == "kinder-1-first":
        x["file"] = "birthday/booqli-gan-birthday-4x5.mp4"; x["thumb"] = "birthday/booqli-gan-birthday-4x5.jpg"; x["date"] = "2026-11-06"
ITEMS = [
  {"id":"birthday-private-4x5","group":"birthday","topic":"savta","title":"לפרטיים – ספר יום הולדת","kind":"video","ratio":"4:5","file":"birthday/booqli-private-birthday-4x5.mp4","thumb":"birthday/booqli-private-birthday-4x5.jpg","date":"2026-11-06","text":BD_PRIVATE},
  {"id":"birthday-gan-4x5","group":"birthday","topic":"kinder-book","title":"לגנים – ספר לכל ילד + קיט חגיגי","kind":"video","ratio":"4:5","file":"birthday/booqli-gan-birthday-4x5.mp4","thumb":"birthday/booqli-gan-birthday-4x5.jpg","date":"2026-11-06","text":BD_GAN},
  {"id":"birthday-private-1x1","group":"birthday","topic":"savta","title":"לפרטיים – תמונה ריבועית למודעה","kind":"image","ratio":"1:1","file":"birthday/booqli-private-birthday-1x1.jpg","thumb":"birthday/booqli-private-birthday-1x1.jpg","date":"2026-11-06","text":BD_PRIVATE},
  {"id":"birthday-gan-1x1","group":"birthday","topic":"kinder-book","title":"לגנים – תמונה ריבועית למודעה","kind":"image","ratio":"1:1","file":"birthday/booqli-gan-birthday-1x1.jpg","thumb":"birthday/booqli-gan-birthday-1x1.jpg","date":"2026-11-06","text":BD_GAN},
] + ITEMS
for it in ITEMS:
    p = os.path.join(M, it["file"]); assert os.path.exists(p), p
    it["bytes"] = os.path.getsize(p)
ids = [i["id"] for i in ITEMS]; assert len(ids) == len(set(ids))
json.dump({"version": time.strftime("%Y-%m-%d %H:%M"), "groups": GROUPS, "items": ITEMS}, open(os.path.join(M, "media.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("ok", len(ITEMS), "items", round(sum(i["bytes"] for i in ITEMS) / 1e6, 1), "MB")

