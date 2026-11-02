/* ספרי BOOQLI לקריאה ישירה באתר (עמוד הגנים + עמוד ההזמנה).
   כל ספר: id, name, d (תיאור קצר), occ (לאיזה אירוע – בשביל מחולל ההקדשות), img (כריכה), v = גרסאות [תווית, תיקייה, מספר עמודים].
   העמודים: order/books/<תיקייה>/01.webp, 02.webp ... (הומרו מה-PDF של שמש, 2.11.2026).
   ספר חדש = שורה חדשה כאן + תיקייה עם העמודים. כריכה: מהאתר הראשי, או עמוד 02 של הספר. */
window.BQ_BOOKS = [
  { id:"birthday", name:"ילד/ת יום הולדת", d:"היום המיוחד של ילד/ת יום ההולדת, מהבוקר ועד השינה.", occ:"birthday", gan:true,
    img:"https://static.wixstatic.com/media/a56db3_4d9c35abdbff4706bb722205187e5621~mv2.png/v1/fill/w_375,h_375,al_c,q_85,enc_avif,quality_auto/b.png",
    v:[["גרסת בת","birthday-g",22],["גרסת בן","birthday-b",22]] },
  { id:"hugs", name:"חיבוקים", d:"המעשים הטובים וכל החיבוקים האוהבים. פופולרי לסוף שנה.", occ:"year", gan:true,
    img:"https://static.wixstatic.com/media/a56db3_6adc566e4dd145d3b58a28f4a66417d0~mv2.png/v1/fill/w_375,h_375,al_c,q_85,enc_avif,quality_auto/h.png",
    v:[["גרסת בת","hugs-g",20],["גרסת בן","hugs-b",20]] },
  { id:"superhero", name:"גיבור/ת על!", d:"גיבור/ה שבוחר/ת במעשים טובים. פופולרי לסוף שנה.", occ:"year", gan:true,
    img:"https://static.wixstatic.com/media/a56db3_34666a03226746a1a2b043ec2f1d582e~mv2.png/v1/fill/w_375,h_375,al_c,q_85,enc_avif,quality_auto/s.png",
    v:[["גרסת בת","superhero-g",21],["גרסת בן","superhero-b",21]] },
  { id:"first", name:"הספר הראשון שלי", d:"לקטנטנים בגילאי 6 חודשים עד שנתיים, עם מילים קלות ופשוטות.", occ:"general", gan:true,
    img:"https://static.wixstatic.com/media/a56db3_8cd8bb318ff74385b4052169c6a9748f~mv2.png/v1/fill/w_375,h_375,al_c,q_85,enc_avif,quality_auto/f.png",
    v:[["גרסת בת","first-g",20],["גרסת בן","first-b",20]] },
  { id:"class1", name:"עולה לכיתה א'", d:"השאלות והחששות לקראת העלייה לכיתה א׳.", occ:"class1", gan:true,
    img:"https://static.wixstatic.com/media/a56db3_018fa7b1be3245749f46e6e6e189cb89~mv2.png/v1/fill/w_375,h_375,al_c,q_85,enc_avif,quality_auto/c.png",
    v:[["גרסת בת","class1-g",22],["גרסת בן","class1-b",22]] },
  { id:"kinder", name:"הולך/ת לגן", d:"היום הראשון בגן, עם חיות נחמדות שנותנות טיפים בדרך.", occ:"year", gan:true,
    img:"https://static.wixstatic.com/media/a56db3_8d2d0533a17c486ab443479022b30a9b~mv2.png/v1/fill/w_375,h_375,al_c,q_85,enc_avif,quality_auto/k.png",
    v:[["גרסת בת","kinder-g",20]] },
  { id:"savanna", name:"בסוואנה", d:"הרפתקה בסוואנה באפריקה – פוגשים את החיות ושומרים על הטבע.", occ:"general",
    img:"savanna-g/02.webp", v:[["גרסת בת","savanna-g",20],["גרסת בן","savanna-b",20]] },
  { id:"druki", name:"דרוקי הדרקון", d:"טיול ביער: את מי נפגוש הפעם? מפגש עם דרקון קטן ואמיץ.", occ:"general",
    img:"druki-g/02.webp", v:[["גרסת בת","druki-g",22],["גרסת בן","druki-b",22]] },
  { id:"night", name:"פית הלילה והחד־קרן", d:"הרפתקת לילה קסומה עם פיות וחד־קרן – ספר לפני השינה.", occ:"general",
    img:"night-g/02.webp", v:[["גרסת בת","night-g",20]] },
  { id:"summer", name:"הסיפור המופלא", d:"חופשת קיץ, ים ודולפינים – מתנה לסוף השנה.", occ:"year",
    img:"summer-g/02.webp", v:[["גרסת בת","summer-g",26]] }
];
