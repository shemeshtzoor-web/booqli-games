/* ספרי BOOQLI לקריאה ישירה באתר (עמוד הגנים + עמוד ההזמנה).
   כל ספר: id, name, d (תיאור קצר), occ (לאיזה אירוע – בשביל מחולל ההקדשות), img (כריכה), v = גרסאות [תווית, תיקייה, מספר עמודים].
   העמודים: order/books/<תיקייה>/01.webp, 02.webp ... (הומרו מה-PDF של שמש, 2.11.2026).
   ספר חדש = שורה חדשה כאן + תיקייה עם העמודים. כריכה: covers/<id>.webp (שתי הכריכות, בן ובת, בתמונה אחת – נוצרו מהכריכות של שמש, 3.11.2026). */
window.BQ_BOOKS = [
  { id:"birthday", name:"ילד/ת יום הולדת", d:"היום המיוחד של ילד/ת יום ההולדת, מהבוקר ועד השינה.", occ:"birthday", gan:true,
    img:"covers/birthday.webp",
    v:[["גרסת בת","birthday-g",22],["גרסת בן","birthday-b",22]] },
  { id:"hugs", name:"חיבוקים", d:"המעשים הטובים וכל החיבוקים האוהבים. פופולרי לסוף שנה.", occ:"year", gan:true,
    img:"covers/hugs.webp",
    v:[["גרסת בת","hugs-g",20],["גרסת בן","hugs-b",20]] },
  { id:"superhero", name:"גיבור/ת על!", d:"גיבור/ה שבוחר/ת במעשים טובים. פופולרי לסוף שנה.", occ:"year", gan:true,
    img:"covers/superhero.webp",
    v:[["גרסת בת","superhero-g",21],["גרסת בן","superhero-b",21]] },
  { id:"first", name:"הספר הראשון שלי", d:"לקטנטנים בגילאי 6 חודשים עד שנתיים, עם מילים קלות ופשוטות.", occ:"general", gan:true,
    img:"covers/first.webp",
    v:[["גרסת בת","first-g",20],["גרסת בן","first-b",20]] },
  { id:"class1", name:"עולה לכיתה א'", d:"השאלות והחששות לקראת העלייה לכיתה א׳.", occ:"class1", gan:true,
    img:"covers/class1.webp",
    v:[["גרסת בת","class1-g",22],["גרסת בן","class1-b",22]] },
  { id:"kinder", name:"הולך/ת לגן", d:"היום הראשון בגן, עם חיות נחמדות שנותנות טיפים בדרך.", occ:"year", gan:true,
    img:"covers/kinder.webp",
    v:[["גרסת בת","kinder-g",20],["גרסת בן","kinder-b",20]] },
  { id:"savanna", name:"בסוואנה", d:"הרפתקה בסוואנה באפריקה – פוגשים את החיות ושומרים על הטבע.", occ:"general",
    img:"covers/savanna.webp", v:[["גרסת בת","savanna-g",20],["גרסת בן","savanna-b",20]] },
  { id:"druki", name:"דרוקי הדרקון", d:"טיול ביער: את מי נפגוש הפעם? מפגש עם דרקון קטן ואמיץ.", occ:"general",
    img:"covers/druki.webp", v:[["גרסת בת","druki-g",22],["גרסת בן","druki-b",22]] },
  { id:"night", name:"אני והחד־קרן", d:"הרפתקה קסומה עם חד־קרן בלילה – ספר לפני השינה.", occ:"general",
    img:"covers/night.webp", v:[["גרסת בת","night-g",20]] },
  { id:"summer", name:"לשחות עם דולפינים", d:"חופשת קיץ וגלים – שוחים עם דולפינים. מתנה לסוף השנה.", occ:"year",
    img:"covers/summer.webp", v:[["גרסת בת","summer-g",26]] }
];
