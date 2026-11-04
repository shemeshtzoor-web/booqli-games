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
for it in ITEMS:
    p = os.path.join(M, it["file"]); assert os.path.exists(p), p
    it["bytes"] = os.path.getsize(p)
ids = [i["id"] for i in ITEMS]; assert len(ids) == len(set(ids))
json.dump({"version": time.strftime("%Y-%m-%d %H:%M"), "groups": GROUPS, "items": ITEMS}, open(os.path.join(M, "media.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("ok", len(ITEMS), "items", round(sum(i["bytes"] for i in ITEMS) / 1e6, 1), "MB")
