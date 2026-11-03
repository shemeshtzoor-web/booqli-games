# -*- coding: utf-8 -*-
"""הקבצים של מרכז הפרסום (3.11.2026) – כל תמונה וסרטון לפרסום, שהתוסף מוריד לבד.
⚠️ הכל כאן ציבורי (המאגר ציבורי, הקבצים בכתובת games.booqli.ai/marketing/media/...).
   רק חומרי פרסום שממילא מתפרסמים. אף פעם לא: צילומים אמיתיים של ילדים בלי אישור, תמונות של לקוחות, ספרים של הזמנות, מידע פרטי.
הוספה: שמים את הקובץ ב-marketing/media/<קבוצה>/, מוסיפים שורה ל-ITEMS, ומריצים:  python3 marketing/build_media.py
(בונה את marketing/media/media.json עם הגודל של כל קובץ. התוסף מוריד רק מה שחדש או שהשתנה.)
slot = "<נושא>:video" או "<נושא>:image" – אם המשבצת של הנושא בתוסף ריקה, הקובץ נכנס גם אליה."""
import json, os, time
HERE = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(HERE, "media")
GROUPS = [
  {"id":"savta","name":"💛 סבים – ספר אישי לנכדים","note":"9 סרטונים 4:5 עם מוזיקה מקורית. כל סרטון מוביל לעמוד הסבים עם הספר שלו כבר בטופס (?book=), ונמדד בנפרד (utm_content).","link":"https://games.booqli.ai/savta/"},
]
BOOKS = [("first","הספר הראשון שלי","הנכדים","הם הגיבורים"),("birthday","ילד/ת יום הולדת","הנכדה","היא הגיבורה"),("kinder","הולך/ת לגן","הנכדים","הם הגיבורים"),
         ("druki","דרוקי הדרקון","הנכד","הוא הגיבור"),("hugs","חיבוקים","הנכדים","הם הגיבורים"),("superhero","גיבור/ת על","הנכד","הוא הגיבור"),
         ("night","אני והחד־קרן","הנכדה","היא הגיבורה"),("savanna","בסוואנה","הנכדה","היא הגיבורה"),("class1","עולה לכיתה א'","הנכדה","היא הגיבורה")]
def savta_text(bid, name, noun, hero):
    link = f"https://games.booqli.ai/savta/?book={bid}&utm_source=facebook&utm_medium=paid&utm_campaign=savta&utm_content={bid}"
    return (f"סבתא, סבא 💛 הנכדים תמיד זוכרים מי אהב אותם.\n\nהספר \"{name}\" – ש{noun} {hero} שלו, מתמונה אחת.\n"
            f"📲 בלי אתר ובלי טכנולוגיה – שולחים תמונה בוואטסאפ\n📖 רואים את כל הספר לפני – משלמים רק אם אוהבים\n"
            f"🎁 ובמתנה: אפליקציה בטוחה לילדים, עם המון משחקים בחינם\n\n👈 {link}")
ITEMS = [{"id":"savta-"+b, "group":"savta", "title":n, "kind":"video", "ratio":"4:5", "file":f"savta/booqli-savta-{b}-4x5.mp4",
          "thumb":f"savta/booqli-savta-{b}-4x5.jpg", "date":"2026-11-03", "text":savta_text(b, n, no, he)} for b, n, no, he in BOOKS]
for it in ITEMS:
    p = os.path.join(M, it["file"]); assert os.path.exists(p), p
    it["bytes"] = os.path.getsize(p)
ids = [i["id"] for i in ITEMS]; assert len(ids) == len(set(ids))
json.dump({"version": time.strftime("%Y-%m-%d %H:%M"), "groups": GROUPS, "items": ITEMS}, open(os.path.join(M, "media.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("ok", len(ITEMS), "items", round(sum(i["bytes"] for i in ITEMS) / 1e6, 1), "MB")
