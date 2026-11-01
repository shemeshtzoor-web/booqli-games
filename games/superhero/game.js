/* ===== הגדרות (נקראות מתוך העמוד) ===== */
const CONFIG_DEFAULT={"coupon":"HERO","couponText":"קוד הנחה לספר האישי \"גיבור/ת על\"","link":"https://www.booqli.ai/he/create-a-book?utm_source=superhero_game&utm_medium=game&utm_campaign=superhero_book","homeLink":"https://www.booqli.ai/he?utm_source=superhero_game&utm_medium=game&utm_campaign=superhero_book","whatsapp":"055-5549331","gameLink":"https://claude.ai/artifact/GvVbMYSDW24XsuUbxGxnYm","returnLink":"https://www.booqli.ai/he/articles/superhero-kindness-game?utm_source=whatsapp&utm_medium=returning_player&utm_campaign=superhero_book"};
let CONFIG=Object.assign({},CONFIG_DEFAULT);
try{CONFIG=Object.assign(CONFIG,JSON.parse(document.getElementById("booqli-config").textContent))}catch(e){}
const PAGE_TEMPLATE="<title>גיבור/ת על של BOOQLI</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Fredoka:wght@500;600;700&family=Assistant:wght@400;600;700&display=swap\">\n<link rel=\"stylesheet\" href=\"game.css\">\n<script id=\"booqli-config\" type=\"application/json\">__CONFIG__</script>\n<div class=\"wrap\">\n  <header class=\"brand\">\n    <a id=\"homeLink\" class=\"logo\" href=\"https://www.booqli.ai/he\" target=\"_blank\" rel=\"noopener\"><img src=\"img/logo.png\" alt=\"BOOQLI\" width=\"128\" height=\"54\"></a>\n    <a id=\"ganLink\" class=\"gan\" href=\"https://wa.me/972555549331\" target=\"_blank\" rel=\"noopener\"><b>🏫 ספר אישי לכל ילד בגן</b><span>מחירים סיטונאיים לגנים ←</span></a>\n    <a id=\"waLink\" class=\"wa\" href=\"https://wa.me/972555549331\" target=\"_blank\" rel=\"noopener\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z\"/></svg><span><span class=\"lbl\">וואטסאפ </span><b id=\"waNum\" dir=\"ltr\">055-5549331</b></span></a>\n  </header>\n  <main id=\"app\"></main>\n  <footer>הסיפור \"גיבור/ת על\" · כתיבה: שמש צור · © 2026 BOOQLI · וואטסאפ <span dir=\"ltr\">055-5549331</span></footer>\n</div>\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js\"></script>\n<script src=\"game.js\"></script>\n";
document.getElementById("homeLink").href=CONFIG.homeLink;
function waIntl(n){let d=String(n||"").replace(/\D/g,"");if(d.startsWith("0"))d="972"+d.slice(1);return d}
function waHref(){return "https://wa.me/"+waIntl(CONFIG.whatsapp)+"?text="+encodeURIComponent("היי BOOQLI, הגעתי מהמשחק של גיבור/ת על 🦸")}
document.getElementById("waLink").href=waHref();
const ganHref=()=>"https://wa.me/"+waIntl(CONFIG.whatsapp)+"?text="+encodeURIComponent("היי BOOQLI, אני מגן ילדים ורוצה הצעת מחיר לספר אישי לכל ילד בגן 🏫");
{const gl=document.getElementById("ganLink");if(gl)gl.href=ganHref()}
document.getElementById("waNum").textContent=CONFIG.whatsapp;

/* ===== מצב ===== */
const KEY="booqli-hero";
const S={name:"",g:"f",page:0,auto:false,photo:null,lvl:"s"};
try{const s=JSON.parse(localStorage.getItem(KEY)||"{}");if(s.name)S.name=s.name;if(s.g)S.g=s.g;if(s.lvl)S.lvl=s.lvl}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify({name:S.name,g:S.g,lvl:S.lvl}))}catch(e){}}
const g=(f,m)=>S.g==="f"?f:m;
const N=()=>S.name||g("הַגִּבּוֹרָה","הַגִּבּוֹר");
const app=document.getElementById("app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const IMG=k=>`img/${S.g==="f"?"g":"b"}${k}.jpg`;
const HERO=()=>g("גִּבּוֹרַת עַל","גִּבּוֹר עַל");
const BOOK=()=>g("גיבורת על","גיבור על");
function paintG(){document.body.classList.toggle("g-m",S.g==="m");document.body.classList.toggle("g-f",S.g==="f")}
paintG();

/* ===== הסיפור (לפי הספר "גיבור/ת על") ===== */
function story(){
  const n=`<em>${esc(N())}</em>`;
  const F=S.g==="f";
  const P=(img,f,m)=>({img,stanzas:[F?f:m]});
  return [
    {cover:true},
    P(IMG("03"),[
      `${n} חָלְמָה בַּלֵּילוֹת וּבַיָּמִים,`,
      "לִהְיוֹת גִּבּוֹרָה מֵהַסְּרָטִים הַמְּפֻרְסָמִים.",
      "רָצְתָה גְּלִימָה אֲדֻמָּה מַבְרִיקָה,",
      "וְשֶׁפַע שֶׁל כֹּחוֹת קְסוּמִים."],[
      `${n} חָלַם בַּלֵּילוֹת וּבַיָּמִים,`,
      "לִהְיוֹת גִּבּוֹר מֵהַסְּרָטִים הַמְּפֻרְסָמִים.",
      "רָצָה גְּלִימָה אֲדֻמָּה מַבְרִיקָה,",
      "כּוֹחוֹת חֲזָקִים וּזְרוֹעוֹת עִם שְׁרִירִים.",
      "עָמַד מוּל הַמַּרְאָה, נִפֵּחַ אֶת הֶחָזֶה,",
      "בָּטוּחַ שֶׁתֵּכֶף הוּא יִרְאֶה אֶת זֶה קוֹרֶה."]),
    P(IMG("05"),[
      `${n} נִסְּתָה לְהַמְרִיא לַשָּׁמַיִם,`,
      "הִיא אֲפִלּוּ חִבְּרָה לְעַצְמָהּ כְּנָפַיִם,",
      "אַךְ הָרַגְלַיִם נִשְׁאֲרוּ עַל הָרִצְפָּה הַקָּרָה,",
      "שׁוּם תְּעוּפָה וְשׁוּם הַמְרָאָה."],[
      `${n} נִסָּה לְהַמְרִיא לַשָּׁמַיִם,`,
      "הוּא אֲפִלּוּ חִבֵּר לְעַצְמוֹ כְּנָפַיִם,",
      "אַךְ הָרַגְלַיִם נִשְׁאֲרוּ עַל הָרִצְפָּה הַקָּרָה,",
      "שׁוּם תְּעוּפָה וְשׁוּם הַמְרָאָה."]),
    P(IMG("07"),[
      "אַחַר כָּךְ נִסְּתָה לְטַפֵּס עַל קִירוֹת לִגְבָהִים,",
      "כְּמוֹ עַכָּבִישׁ שֶׁטּוֹוֶה קוּרִים.",
      "חִפְּשָׂה אֶת הַקּוּרִים שֶׁיֵּצְאוּ מֵהַיָּד,",
      "וְרָצְתָה לְהִדָּבֵק לַתִּקְרָה מִיָּד.",
      "אַךְ נָפְלָה עַל הַכָּרִית מְאֻכְזֶבֶת,",
      "לֹא קוּרִים וְלֹא עַכָּבִישִׁים."],[
      "אַחַר־כָּךְ נִסָּה לְטַפֵּס עַל קִירוֹת לַגְּבָהִים,",
      "כְּמוֹ עַכָּבִישׁ שֶׁטּוֹוֶה קוּרִים.",
      "חִפֵּשׂ אֶת הַקּוּרִים שֶׁיָּצְאוּ מֵהַיָּד,",
      "וְרָצָה לְהִדָּבֵק לַתִּקְרָה מִיָּד,",
      "אַךְ נָפַל עַל הַכָּרִית מְאֻכְזָב,",
      "לֹא קוּרִים וְלֹא עַכְּבִישִׁים."]),
    P(IMG("09"),[
      "אָז לָבְשָׁה מַסֵּכָה שְׁחוֹרָה וּגְדוֹלָה,",
      "כְּמוֹ אַבִּירַת הַלַּיְלָה בְּתוֹךְ הָאֲפֵלָה.",
      "הֵכִינָה חֲגוֹרָה עִם פָּנָס וַאֲזִקִּים,",
      "וְהִתְכּוֹנְנָה לִתְפֹּס אֶת הָ\"רָעִים\".",
      "אַךְ, עָבַר זְמַן מָה וּמְאוּמָה לֹא קָרָה,",
      "לֹא \"טוֹבִים\" וְלֹא \"רָעִים\" אֵין טַעַם לַמַּסֵּכָה."],[
      "אָז עָטָה מַסֵּכָה שְׁחוֹרָה וּגְדוֹלָה,",
      "כְּמוֹ אַבִּיר הַלַּיְלָה בְּתוֹךְ הָאֲפֵלָה.",
      "הֵכִין חֲגוֹרָה עִם פָּנָס וַאֲזִקִּים,",
      "וְהִתְכּוֹנֵן לִתְפֹּס אֶת הָ\"רָעִים\".",
      "אַךְ עָבַר זְמַן־מָה וּמְאוּמָה לֹא קָרָה,",
      "לֹא \"טוֹבִים\" וְלֹא \"רָעִים\" – אֵין טַעַם לַמַּסֵּכָה."]),
    P(IMG("11"),[
      `יָשְׁבָה לָהּ ${n} עַל הַסַּפְסָל בַּגִּנָּה,`,
      "עֲצוּבָה וּמְאֻכְזֶבֶת, לְלֹא תִּקְוָה.",
      "\"אֵין לִי כֹּחוֹת, אֵין לִי קוּרִים בַּיָּדַיִם,",
      "אֲנִי סְתָם יַלְדָּה רְגִילָה עִם אוֹפַנַּיִם.",
      "לֹא חֲזָקָה, לֹא מְהִירָה, לְלֹא שׁוּם כֹּחַ,",
      "מֵהַחֲלוֹם צָרִיךְ לִשְׁכֹּחַ\"."],[
      `יָשַׁב לוֹ ${n} עַל הַסַּפְסָל בַּגִּנָּה,`,
      "עָצוּב וּמְאֻכְזָב, לְלֹא תִּקְוָה.",
      "\"אֵין לִי כּוֹחוֹת, אֵין לִי קוּרִים בַּיָּדַיִם,",
      "אֲנִי סְתָם יֶלֶד רָגִיל עִם אוֹפַנַּיִם.",
      "לֹא חָזָק, לֹא מָהִיר, לְלֹא שׁוּם כּוֹחַ,",
      "מֵהַחֲלוֹם צָרִיךְ לִשְׁכֹּחַ\"."]),
    P(IMG("13"),[
      "לְפֶתַע שָׁמְעָה קוֹל צְוָחָה,",
      "יֶלֶד קָטָן שֶׁנָּפַל עַל הַמִּדְרָכָה.",
      "מֵהָאוֹפַנַּיִם נָפַל, וּבְבִרְכּוֹ נֶחְבַּל.",
      `${n} רָצָה אֶל הַיֶּלֶד`,
      "וְהֵרִימָה אוֹתוֹ מֵהַקַּרְקַע בִּמְהֵרָה."],[
      "לְפֶתַע שָׁמַע קוֹל צְוָחָה,",
      "יֶלֶד קָטָן נָפַל עַל הַמִּדְרָכָה.",
      "מֵהָאוֹפַנַּיִם נָפַל, וּבְבִרְכּוֹ נֶחְבַּל.",
      `${n} רָץ אֶל הַיֶּלֶד`,
      "וְהֵרִים אוֹתוֹ מֵהַקַּרְקַע בִּמְהֵרָה."]),
    P(IMG("15"),[
      `${n} לֹא חָשְׁבָה עַל גְּלִימָה אוֹ כֹּחוֹת,`,
      "הִיא רָצָה אֶל הַיֶּלֶד בְּלִי לְחַכּוֹת.",
      "הֵרִימָה אֶת הָאוֹפַנַּיִם מֵהַצַּד,",
      "וְהוֹשִׁיטָה לוֹ בַּעֲדִינוּת אֶת הַיָּד.",
      "הִיא חִיְּכָה וְהִרְגִּיעָה, חִבְּקָה בְּרֹךְ,",
      "עַד שֶׁעַל פְּנֵי הַיֶּלֶד הוֹפִיעַ חִיּוּךְ."],[
      `${n} לֹא חָשַׁב עַל גְּלִימָה אוֹ כֹּחוֹת,`,
      "הוּא רָץ אֶל הַיֶּלֶד בְּלִי לְחַכּוֹת.",
      "הֵרִים אֶת הָאוֹפַנַּיִם מֵהַצַּד,",
      "וְהוֹשִׁיט לוֹ בַּעֲדִינוּת אֶת הַיָּד.",
      "הוּא חִיֵּךְ וְהִרְגִּיעַ, חִבֵּק בְּרַכּוּת,",
      "עַד שֶׁעַל פְּנֵי הַיֶּלֶד הוֹפִיעַ חִיּוּךְ."]),
    P(IMG("17"),[
      "הָאִמָּא שֶׁל הַיֶּלֶד הִגִּיעָה מַהֵר,",
      "\"תּוֹדָה לָךְ חֲמוּדָה, אַתְּ מַמָּשׁ חֲבֵרָה!\"",
      "\"הִצַּלְתְּ אֶת הַמַּצָּב, הִרְגַּעְתְּ אוֹתוֹ,",
      "עָשִׂית מַעֲשֶׂה טוֹב, וְשִׂמַּחְתְּ אֶת לִבּוֹ\".",
      "הִיא קָרְאָה לָהּ \"גִּבּוֹרָה\" וְהוֹדְתָה שׁוּב וָשׁוּב,",
      `וְ${n} הִרְגִּישָׁה שֶׁעָשְׂתָה מַעֲשֶׂה חָשׁוּב.`],[
      "אִמָּא שֶׁל הַיֶּלֶד הִגִּיעָה מַהֵר,",
      "\"תּוֹדָה לְךָ חָמוּד, אַתָּה מַמָּשׁ חָבֵר!\"",
      "\"הִצַּלְתָּ אֶת הַמַּצָּב, הִרְגַּעְתָּ אוֹתוֹ,",
      "עָשִׂיתָ מַעֲשֶׂה טוֹב, וְשִׂמַּחְתָּ אֶת לִבּוֹ\".",
      "הִיא קָרְאָה לוֹ \"גִּבּוֹר\" וְהוֹדְתָה שׁוּב וָשׁוּב,",
      `וְ${n} הִרְגִּישׁ שֶׁעָשָׂה מַעֲשֶׂה חָשׁוּב.`]),
    P(IMG("19"),[
      `אָז ${n} הֵבִינָה דָּבָר נֶהְדָּר,`,
      "שֶׁלֹּא צָרִיךְ שׁוּם אֲבִיזָר מְיֻחָד.",
      "לֹא צָרִיךְ לָעוּף אוֹ לְטַפֵּס עַל קִירוֹת,",
      "כְּדֵי לַעֲשׂוֹת מַעֲשִׂים טוֹבִים וּלְשַׁנּוֹת עוֹלָמוֹת.",
      "הַכֹּחַ הַכִּי חָזָק בָּעוֹלָם,",
      "הוּא לֵב טוֹב שֶׁפָּתוּחַ תָּמִיד לְכֻלָּם."],[
      `אָז ${n} הֵבִין דָּבָר נֶהְדָּר:`,
      "לֹא צָרִיךְ שׁוּם אֲבִיזָר מְיֻחָד.",
      "לֹא צָרִיךְ לָעוּף אוֹ לְטַפֵּס עַל קִירוֹת",
      "כְּדֵי לַעֲשׂוֹת מַעֲשִׂים טוֹבִים וּלְשַׁנּוֹת עוֹלָמוֹת.",
      "הַכּוֹחַ הֲכִי חָזָק בָּעוֹלָם",
      "הוּא לֵב טוֹב שֶׁפָּתוּחַ תָּמִיד לְכֻלָּם."]),
    P(F?"img/f-book.png":IMG("21"),[
      "לִהְיוֹת גִּבּוֹרָה זֶה לִפְתֹּחַ עֵינַיִם,",
      "לַעֲזֹר לְמִי שֶׁזָּקוּק בִּשְׁתֵּי יָדַיִם.",
      "עִם גְּלִימָה אוֹ בְּלִי גְּלִימָה,",
      "הִיא תָּמִיד גִּבּוֹרָה.",
      "כִּי לָתֵת וְלַעֲזֹר זֶה הַסּוֹד הַמֻּשְׁלָם,",
      "זֶהוּ הַקֶּסֶם הַכִּי חָזָק בָּעוֹלָם."],[
      "לִהְיוֹת גִּבּוֹר זֶה לִפְקֹחַ עֵינַיִם,",
      "לַעֲזֹר לְמִי שֶׁזָּקוּק בִּשְׁתֵּי יָדַיִם.",
      "עִם גְּלִימָה אוֹ בְּלִי גְּלִימָה,",
      `${n} גִּבּוֹר מָלֵא עָצְמָה!`,
      "כִּי לָתֵת וְלַעֲזֹר זֶה הַסּוֹד הַמֻּשְׁלָם,",
      "זֶהוּ הַקֶּסֶם הֲכִי חָזָק בָּעוֹלָם."]),
    {end:true,stanzas:[["💛 הַסּוֹף 💛",`${n} ${HERO()}`,"עִם לֵב טוֹב שֶׁפָּתוּחַ לְכֻלָּם"]]}
  ];
}

/* ===== הקראה ===== */
const TTS={voice:null,ok:"speechSynthesis" in window,live:[]};
function pickVoice(){if(!TTS.ok)return;const v=speechSynthesis.getVoices();TTS.voice=v.find(x=>/^he|^iw/i.test(x.lang))||null}
function onVoices(){pickVoice();const n=document.getElementById("ttsnote");if(n)n.hidden=!!TTS.voice}
if(TTS.ok){pickVoice();try{if(speechSynthesis.addEventListener)speechSynthesis.addEventListener("voiceschanged",onVoices);else speechSynthesis.onvoiceschanged=onVoices}catch(e){}}
/* הודעה ברורה כשההקראה לא עובדת במכשיר או בדפדפן */
function ttsHelp(){
  if(TTS.warned)return;TTS.warned=true;
  let t=document.getElementById("ttsToast");
  if(!t){t=document.createElement("div");t.id="ttsToast";t.className="tts-toast";t.setAttribute("role","status");document.body.appendChild(t)}
  t.innerHTML=`<b>🔇 ההקראה לא מצליחה לפעול כאן</b>
    <ul><li>בודקים שהטלפון לא על מצב שקט ושהווליום פתוח</li>
    <li>פותחים את המשחק בכרום או בספארי – לא מתוך אפליקציה (פייסבוק, אינסטגרם, Claude)</li>
    <li>באנדרואיד: הגדרות ← נגישות ← המרת טקסט לדיבור ← מוודאים שיש קול בעברית</li></ul>
    <p>בינתיים אפשר לקרוא יחד בקול 💛</p><button type="button" class="btn ghost small" id="ttsX">הבנתי</button>`;
  t.hidden=false;document.getElementById("ttsX").onclick=()=>{t.hidden=true};
}
let talkId=0;
function stopTalk(){talkId++;clearTimeout(TTS.t);clearTimeout(TTS.wd);
  if(TTS.ok){try{if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();return true}}catch(e){}}
  return false}
/* מספרים נקראים כמילים בעברית (חלק מהמכשירים מקריאים ספרות באנגלית) */
const NUM_F=["אפס","אחת","שתיים","שלוש","ארבע","חמש","שש","שבע","שמונה","תשע","עשר","אחת עשרה","שתים עשרה","שלוש עשרה","ארבע עשרה","חמש עשרה","שש עשרה","שבע עשרה","שמונה עשרה","תשע עשרה","עשרים"];
const NUM_M=["אפס","אחד","שניים","שלושה","ארבעה","חמישה","שישה","שבעה","שמונה","תשעה","עשרה","אחד עשר","שנים עשר","שלושה עשר","ארבעה עשר","חמישה עשר","שישה עשר","שבעה עשר","שמונה עשר","תשעה עשר","עשרים"];
const MASC=/^(ו?ה?)(לב|לבבות|כוכב|כוכבים|ילד|ילדים|חבר|חברים|הבדל|הבדלים|קלף|קלפים|מעשה|מעשים|כרטיס|כרטיסים|ניסיון|ניסיונות|רמז|רמזים|יום|ימים|תור|תורות)$/;
const noNiq=w=>w.replace(/[֑-ׇ]/g,"");
function hebNum(n,masc,beforeNoun){
  if(n>20)return String(n);
  if(beforeNoun&&n===2)return masc?"שני":"שתי";
  return (masc?NUM_M:NUM_F)[n];
}
function numsToWords(t){
  t=t.replace(/(\d+)\s*([=+])\s*/g,(m,a,op)=>a+(op==="="?" שווה ":" ועוד "));
  return t.replace(/(\d+)(\s+)([֐-׿"־]+)?/g,(m,d,sp,w)=>{
    const n=+d;
    if(!w)return hebNum(n,false,false)+sp;
    const masc=MASC.test(noNiq(w).replace(/["־]/g,""));
    const isNoun=masc||/(ות|ים)$/.test(noNiq(w))&&!/^(ו?)(ועוד|שווה)$/.test(noNiq(w));
    if(n===1&&isNoun)return w+" "+(masc?"אחד":"אחת");
    return hebNum(n,masc,isNoun)+sp+w;
  }).replace(/(\d+)/g,(m,d)=>hebNum(+d,false,false));
}
const clean=t=>numsToWords(t.replace(/<[^>]+>/g,"").replace(/[־]/g," ").replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,"")).replace(/\s+/g," ").trim();
function speakSeq(stanzas,onDone,byUser){
  const wasTalking=stopTalk();
  if(!TTS.ok){if(byUser)ttsHelp();if(onDone)onDone();return}
  if(!TTS.voice)pickVoice();
  const id=talkId,items=[];
  stanzas.forEach(st=>st.forEach((l,i)=>items.push({l,gap:i===st.length-1?1300:550})));
  let k=0;
  const next=()=>{
    if(id!==talkId)return;
    if(k>=items.length){if(onDone)onDone();return}
    const it=items[k++],txt=clean(it.l);
    if(!txt){next();return}
    const u=new SpeechSynthesisUtterance(txt);
    window.__spoken&&window.__spoken.push(txt);
    u.lang="he-IL";if(TTS.voice)u.voice=TTS.voice;u.rate=.8;
    TTS.live.push(u);if(TTS.live.length>6)TTS.live.shift();
    let fired=false,began=false;const t0=Date.now();
    const after=()=>{if(fired||id!==talkId)return;fired=true;clearTimeout(TTS.wd);TTS.t=setTimeout(next,it.gap)};
    u.onstart=()=>{began=true;clearTimeout(TTS.wd)};
    u.onend=()=>{if(Date.now()-t0>250)began=true;after()};
    u.onerror=e=>{const er=e&&e.error;if(er&&er!=="interrupted"&&er!=="canceled"&&byUser)ttsHelp();after()};
    try{speechSynthesis.resume();speechSynthesis.speak(u)}catch(e){if(byUser)ttsHelp();return}
    clearTimeout(TTS.wd);TTS.wd=setTimeout(()=>{if(id===talkId&&!began&&!fired&&byUser)ttsHelp()},3000);
  };
  if(wasTalking)TTS.t=setTimeout(next,150);else next();
}
function say(text,onend,byUser){speakSeq([[text]],onend,byUser)}

/* ===== צלילים ===== */
const SFX={ctx:null};
function tone(seq){
  try{
    SFX.ctx=SFX.ctx||new (window.AudioContext||window.webkitAudioContext)();
    const c=SFX.ctx;if(c.state==="suspended")c.resume();
    let t=c.currentTime+.03;
    seq.forEach(([f,d,type,f2])=>{
      const o=c.createOscillator(),v=c.createGain();
      o.type=type||"triangle";o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
      v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.32,t+.02);v.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.connect(v).connect(c.destination);o.start(t);o.stop(t+d+.05);t+=d*.8;
    });
  }catch(e){}
}
const sfxWin=()=>tone([[523,.13],[659,.13],[784,.13],[1047,.4]]);
const sfxFail=()=>tone([[392,.2],[262,.5,"triangle",170]]);
const sfxPair=()=>tone([[659,.1],[988,.28]]);
const sfxMiss=()=>tone([[300,.18,"sine",240]]);
const sfxWhoosh=()=>tone([[300,.25,"sine",1200]]);
/* פנפרה של גיבורים */
const sfxParty=()=>tone([[392,.15],[392,.1],[523,.18],[659,.3],[523,.15],[784,.6]]);

/* ===== שמירת המשחק – כדי שיהיה קל לחזור אליו ===== */
const gameURL=()=>CONFIG.gameLink||location.href.split("#")[0];
const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent),inApp=/FBAN|FBAV|Instagram|FB_IAB/i.test(navigator.userAgent);
function savedPhone(){try{return localStorage.getItem(KEY+"-phone")||""}catch(e){return ""}}
function intlPhone(v){let d=String(v||"").replace(/\D/g,"");if(d.startsWith("972"))d=d.slice(3);if(d.startsWith("0"))d=d.slice(1);return /^5\d{8}$/.test(d)?"972"+d:null}
const returnURL=()=>CONFIG.returnLink||gameURL();
function saveText2(){return `🦸 המשחק של ${N()} – "${BOOK()}" מ-BOOQLI\nלשחק שוב, בחינם ומתי שרוצים:\n${returnURL()}`}
function saveHTML(){
  const ph=savedPhone();
  return `<section class="savebox" aria-label="שמירת המשחק">
    <div class="savehead"><span class="ic" aria-hidden="true">💾</span><span><b>שמירת המשחק בטלפון</b><i>שולחים לעצמכם את המשחק בוואטסאפ – והוא תמיד אצלכם. חינם ובלי הגבלה.</i></span></div>
    <label class="savelab" for="svph">לאיזה מספר וואטסאפ לשלוח?</label>
    <div class="saverow">
      <input id="svph" class="svph" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="050-1234567" value="${esc(ph)}" maxlength="16">
      <a class="btn sv-send" href="#" target="_blank" rel="noopener">שמירה ←</a>
    </div>
    <p class="sv-msg" aria-live="polite"></p>
    <p class="sv-note">📲 הוואטסאפ שלכם נפתח עם הודעה מוכנה, ונשאר רק ללחוץ "שליחה".</p>
    <div class="savebtns">
      <button type="button" class="btn ghost small sv-copy">🔗 העתקת הקישור</button>
      <button type="button" class="btn ghost small sv-home" aria-expanded="false">📌 אייקון במסך הבית</button>
    </div>
    <p class="sv-link" hidden><span dir="ltr">${esc(returnURL())}</span></p>
    <div class="sv-how" hidden>${inApp?`<p><b>פתחתם מפייסבוק או מאינסטגרם?</b> קודם לוחצים על <b>⋯</b> למעלה ובוחרים <b>"פתיחה בדפדפן"</b>, ואז:</p>`:""}
      ${isIOS?`<p>באייפון (ספארי): לוחצים על כפתור השיתוף <b>⬆️</b> בתחתית המסך ← <b>"הוספה למסך הבית"</b>.</p>`:`<p>באנדרואיד (כרום): לוחצים על <b>⋮</b> למעלה ← <b>"הוספה למסך הבית"</b>.</p><p>באייפון: כפתור השיתוף ⬆️ ← "הוספה למסך הבית".</p>`}
      <p>כך יופיע אייקון של המשחק בטלפון, כמו אפליקציה.</p></div>
  </section>`;
}
function bindSave(root){
  (root||app).querySelectorAll(".savebox").forEach(box=>{
    const inp=box.querySelector(".svph"),send=box.querySelector(".sv-send"),msg=box.querySelector(".sv-msg");
    const upd=()=>{const n=intlPhone(inp.value);send.href=n?"https://wa.me/"+n+"?text="+encodeURIComponent(saveText2()):"#";send.classList.toggle("off",!n)};
    inp.oninput=()=>{upd();msg.textContent="";msg.className="sv-msg"};upd();
    inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();send.click()}};
    send.onclick=e=>{const n=intlPhone(inp.value);
      if(!n){e.preventDefault();msg.className="sv-msg err";msg.textContent=inp.value.trim()?"המספר לא נראה תקין. כתבו מספר נייד, למשל 050-1234567":"כתבו מספר וואטסאפ, ואז לחצו שמירה";inp.focus();return}
      try{localStorage.setItem(KEY+"-phone",inp.value.trim())}catch(_){}
      msg.className="sv-msg ok";msg.textContent="✓ הוואטסאפ נפתח – נשאר רק ללחוץ \"שליחה\"";sfxPair()};
    const c=box.querySelector(".sv-copy"),h=box.querySelector(".sv-home"),how=box.querySelector(".sv-how"),ln=box.querySelector(".sv-link");
    if(c)c.onclick=()=>{const done=()=>{c.textContent="✓ הועתק";setTimeout(()=>{if(c.isConnected)c.textContent="🔗 העתקת הקישור"},2500)};
      const sel=()=>{ln.hidden=false;const r=document.createRange();r.selectNodeContents(ln);const x=getSelection();x.removeAllRanges();x.addRange(r);c.textContent="מסומן – העתיקו"};
      try{navigator.clipboard.writeText(returnURL()).then(done,sel)}catch(e){sel()}};
    if(h)h.onclick=()=>{how.hidden=!how.hidden;h.setAttribute("aria-expanded",String(!how.hidden))};
  });
}

/* ===== הצעה לספר המודפס ===== */
function offerHTML(noSave){
  const n=esc(N());
  return `${noSave?"":saveHTML()}<section class="offer" aria-label="ספר מודפס אישי">
    <p class="offer-kick">ההפתעה מ-BOOQLI 🎁</p>
    <h2 class="offer-h">ספר אמיתי ש${n} ${g("היא הגיבורה","הוא הגיבור")} שלו<br><mark>מודפס</mark> באיכות גבוהה</h2>
    <div class="demo" aria-label="לדוגמה: מתמונה אחת לספר מודפס">
      <figure class="demo-ph"><img src="img/${S.g}-face.jpg" alt="${g("תמונה של ילדה","תמונה של ילד")}"><figcaption>שולחים תמונה אחת</figcaption></figure>
      <div class="demo-arrow" aria-hidden="true"><span class="sp">✨</span><span class="ar">←</span></div>
      <figure class="demo-bk"><div class="shine"><img src="img/${S.g}-book.png" alt="ספר מודפס עם ${g("הילדה","הילד")} על הכריכה"></div><figcaption>מקבלים ספר מודפס!</figcaption></figure>
    </div>
    <p class="demo-note">לדוגמה: ${g("הספר של דריה","הספר של דוד")}</p>
    <ul class="offer-list">
      <li><b>השם של ${n}</b> לאורך כל העלילה – לא רק על הכריכה</li>
      <li><b>איורים אישיים:</b> ${n} ${g("מצוירת","מצויר")} בכל איור, מהעמוד הראשון ועד האחרון – בגלימה ובחליפת זהב</li>
      <li><b>ספר מודפס באיכות גבוהה</b> – מתנה אמיתית ששומרים לשנים</li>
      <li>שולחים תמונה אחת – ואנחנו עושים את כל השאר</li>
      <li>הקדשה אישית מהמשפחה בעמוד הראשון</li>
      <li>סיפור מחורז ומנוקד על אומץ ולב טוב – גרסה לבנים וגרסה לבנות</li>
    </ul>
    <div class="lockbox">
      <span class="lock" aria-hidden="true">🎟️</span>
      <p><b>רוצים קופון הנחה לספר המודפס ש${n} ${g("היא הגיבורה","הוא הגיבור")} שלו?</b><br>שחקו ונצחו באחד המשחקים – והקופון יקפוץ לכם על המסך!</p>
      <button type="button" class="btn small playwin" data-go="speed">לשחק ולזכות בקופון</button>
    </div>
    <a class="btn offer-cta" href="${esc(CONFIG.link)}" target="_blank" rel="noopener">להזמנת הספר של ${n} ←</a>
    <a class="wa-line" href="${esc(waHref())}" target="_blank" rel="noopener">שאלות? כתבו לנו בוואטסאפ <b dir="ltr">${esc(CONFIG.whatsapp)}</b></a>
    <a class="ganbox" href="${esc(ganHref())}" target="_blank" rel="noopener"><span class="gi" aria-hidden="true">🏫</span><span><b>גננות וועדי הורים:</b> ספר אישי לכל ילד בגן, במחירים סיטונאיים מעולים. <u>לקבלת הצעת מחיר ←</u></span></a>
  </section>`;
}
function bindOffer(){app.querySelectorAll(".playwin").forEach(b=>b.onclick=()=>go(b.dataset.go));bindSave()}

/* ===== חלון קופץ עם הקופון – מופיע רק בניצחון ===== */
let POP=null;
function couponPopup(title){
  closePopup();
  const n=esc(N());
  const ph=intlPhone(savedPhone());
  POP=document.createElement("div");POP.className="pop";
  POP.innerHTML=`<div class="pop-card" role="dialog" aria-modal="true" aria-labelledby="popT">
    <button type="button" class="pop-x" id="popX" aria-label="סגירה">✕</button>
    <div class="confetti" aria-hidden="true">${["🎉","⭐","💛","✨","🦸","🎁","🎉","⭐","❤️","✨"].map((c,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%5)*.12}s">${c}</i>`).join("")}</div>
    <img class="kidthumb hi" src="${kidPic()}" alt="">
    <p class="pop-kick">${esc(title)}</p>
    <h2 id="popT">ניצחת, ${n}! הנה הקופון שלך 🎁</h2>
    <p>קופון הנחה לספר המודפס "${BOOK()}" ש${n} ${g("היא הגיבורה","הוא הגיבור")} שלו – עם השם ${g("שלה","שלו")} לאורך כל העלילה, איורים אישיים בכל עמוד, מודפס באיכות גבוהה</p>
    <div class="coupon big"><code id="pcc">${esc(CONFIG.coupon)}</code><button type="button" id="pcopy">העתקה</button></div>
    <small>${esc(CONFIG.couponText)}</small>
    <a class="btn offer-cta" href="${esc(CONFIG.link)}" target="_blank" rel="noopener">להזמנת הספר עם הקופון ←</a>
    <a class="btn sv-wa" href="${esc((ph?"https://wa.me/"+ph+"?text=":"https://wa.me/?text=")+encodeURIComponent(`🎁 הקופון שלי לספר "${BOOK()}": ${CONFIG.coupon}\nלהזמנת הספר: ${CONFIG.link}\n\n🦸 לשחק שוב במשחק: ${returnURL()}`))}" target="_blank" rel="noopener">📲 עסוקים עכשיו? שלחו לעצמכם את הקופון בוואטסאפ</a>
    <a class="wa-line" href="${esc(waHref())}" target="_blank" rel="noopener">שאלות? וואטסאפ <b dir="ltr">${esc(CONFIG.whatsapp)}</b></a>
    <button type="button" class="btn ghost" id="popK">להמשיך לשחק</button>
  </div>`;
  document.body.appendChild(POP);document.body.classList.add("popopen");
  const b=document.getElementById("pcopy");
  b.onclick=()=>{const done=()=>{b.textContent="הועתק ✓";setTimeout(()=>{if(b.isConnected)b.textContent="העתקה"},1800)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(document.getElementById("pcc"));const x=getSelection();x.removeAllRanges();x.addRange(r);b.textContent="מסומן – העתיקו"};
    try{navigator.clipboard.writeText(CONFIG.coupon).then(done,sel)}catch(e){sel()}};
  document.getElementById("popX").onclick=document.getElementById("popK").onclick=closePopup;
  POP.onclick=e=>{if(e.target===POP)closePopup()};
  document.getElementById("pcopy").focus({preventScroll:true});
}
function closePopup(){if(POP){POP.remove();POP=null;document.body.classList.remove("popopen")}}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePopup()});
function winLater(title){setTimeout(()=>{if(document.body.contains(app))couponPopup(title)},1100)}
const tryAgain=t=>`<p class="needwin">🎟️ ${t}</p>`;
function videoHTML(){return `<div class="vid"><video controls playsinline preload="metadata" poster="img/video-poster.jpg"><source src="video/demo.mp4" type="video/mp4"></video></div>`}

/* ===== פתיחה ===== */
function splash(){
  stopTalk();document.body.classList.add("splash");
  app.innerHTML=`<section class="page splashpage"><div class="page-inner">
    <p class="kicker">BOOQLI מזמינה אתכם להיות גיבורים</p>
    <h1 class="title-story big" id="ttl"></h1>
    <p class="lede">סיפור עם הקראה, משימות גיבורים עם שעון, אותיות, "מה באמת עוזר?", מצאו את ההבדלים, חידון ותעודה להדפסה – והגיבור של הסיפור הוא הילד שלכם.</p>
    <div class="namebox">
      <label for="nm">איך קוראים ${g("לגיבורה","לגיבור")} שלנו?</label>
      <input id="nm" maxlength="14" autocomplete="off" placeholder="כתבו כאן שם" value="${esc(S.name)}">
      <div class="seg" role="group" aria-label="בן או בת">
        <button type="button" id="gf" aria-pressed="${S.g==="f"}">בת</button>
        <button type="button" id="gm" aria-pressed="${S.g==="m"}">בן</button>
      </div>
      <div class="photobox" id="photobox"></div>
      <button class="btn cta go" id="start">🦸 יוצאים לדרך!</button>
      <p class="note" id="need" hidden>כתבו קודם את השם</p>
    </div>
    <p class="note">חינם · אתר בטוח להורים ולילדים · תמונה רק אם רוצים</p>
    <div class="safebox" aria-label="משחק בטוח לילדים">
      <b>🔒 משחק בטוח לילדים</b>
      <ul>
        <li>חלק מ-booqli Games, בחסות BOOQLI</li>
        <li>השימוש בכפוף למדיניות הפרטיות של האתר</li>
      </ul>
    </div>
  </div></section>`;
  const nm=document.getElementById("nm"),ttl=document.getElementById("ttl");
  const upd=()=>{S.name=nm.value.trim();save();ttl.textContent=(S.name||"___")+" "+HERO();
    document.querySelector('label[for="nm"]').textContent=`איך קוראים ${g("לגיבורה","לגיבור")} שלנו?`;document.getElementById("need").hidden=true};
  nm.oninput=upd;upd();
  const setG=x=>{S.g=x;save();paintG();upd();document.getElementById("gf").setAttribute("aria-pressed",x==="f");document.getElementById("gm").setAttribute("aria-pressed",x==="m")};
  document.getElementById("gf").onclick=()=>setG("f");document.getElementById("gm").onclick=()=>setG("m");
  const start=()=>{if(!S.name){document.getElementById("need").hidden=false;nm.focus();return}sfxWin();go("menu")};
  document.getElementById("start").onclick=start;
  nm.onkeydown=e=>{if(e.key==="Enter")start()};
  drawPhotoBox();
}

/* ===== תמונת הילד (רשות) – נשארת רק בזיכרון של הדפדפן ===== */
function drawPhotoBox(){
  const box=document.getElementById("photobox");if(!box)return;
  box.innerHTML=S.photo
    ?`<div class="photorow"><img class="kidthumb" src="${S.photo}" alt="התמונה שנבחרה"><div class="photoacts"><b>התמונה נוספה לסיפור</b><div class="row" style="justify-content:flex-start;gap:8px"><label class="btn ghost small" for="ph">החלפה</label><button type="button" class="btn ghost small" id="phdel">הסרה</button></div></div></div>
       <input type="file" id="ph" accept="image/*" hidden>
       <p class="privacy">🔒 אתר בטוח להורים ולילדים.</p>`
    :`<details class="photoopt"><summary>רוצים שגם הפנים של הילד יופיעו בסיפור? <span>(לא חובה)</span></summary>
       <div class="photoin"><label class="btn ghost" for="ph">בחירת תמונה</label>
       <input type="file" id="ph" accept="image/*" hidden>
       <p class="privacy">💡 מומלץ תמונה של הפנים מקרוב.</p>
       <p class="note" id="pherr" hidden></p></div></details>`;
  const inp=document.getElementById("ph");
  inp.onchange=()=>{const f=inp.files&&inp.files[0];if(f)loadPhoto(f)};
  const del=document.getElementById("phdel");if(del)del.onclick=()=>{S.photo=null;drawPhotoBox()};
}
function cropPhoto(file,done,fail){
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{
    const side=Math.min(img.naturalWidth,img.naturalHeight);
    const sx=(img.naturalWidth-side)/2,sy=Math.max(0,Math.min(img.naturalHeight-side,img.naturalHeight*0.38-side/2));
    const c=document.createElement("canvas");c.width=c.height=360;
    c.getContext("2d").drawImage(img,sx,sy,side,side,0,0,360,360);
    URL.revokeObjectURL(url);
    try{S.photo=c.toDataURL("image/jpeg",.85)}catch(e){S.photo=null}
    done();
  };
  img.onerror=()=>{URL.revokeObjectURL(url);fail()};
  img.src=url;
}
function loadPhoto(file){
  const err=m=>{drawPhotoBox();const d=document.querySelector(".photoopt");if(d)d.open=true;const e=document.getElementById("pherr");if(e){e.hidden=false;e.textContent=m}};
  if(!/^image\//.test(file.type||"image/")){err("זה לא נראה כמו קובץ תמונה. נסו תמונה אחרת.");return}
  cropPhoto(file,drawPhotoBox,()=>err("לא הצלחנו לפתוח את התמונה. נסו תמונה אחרת (JPG או PNG)."));
}
function kidBadge(cls){return S.photo?`<figure class="kidbadge ${cls||""}"><img src="${S.photo}" alt="${esc(N())}"><figcaption>${esc(N())}</figcaption></figure>`:""}
const kidPic=()=>S.photo||`img/${S.g}-face.jpg`;

/* ===== תפריט ===== */
function home(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:16px">
  <section class="hello">
    ${S.photo?`<img class="kidthumb hi" src="${S.photo}" alt="">`:""}
    <h1>שלום ${esc(N())}! 🦸 ${g("מוכנה","מוכן")} למשימה?</h1>
    <p>מה עושים קודם? <span class="winhint">כל ניצחון במשחק = קופון לספר 🎟️</span></p>
  </section>
  ${saveHTML()}
  <nav class="menu" aria-label="מה עושים">
    <button class="card" data-go="read"><img src="${IMG("03")}" alt=""><span><b>קוראים את הספר</b><i>עם הקראה בקול</i></span></button>
    <button class="card" data-go="speed"><img src="${IMG("15")}" alt=""><span><b>משימות גיבורים</b><i>משחק מהירות עם שעון</i></span></button>
    <button class="card" data-go="letters"><img src="${IMG("09")}" alt=""><span><b>אותיות הגיבורים</b><i>מכירים אותיות וקוראים מילים</i></span></button>
    <button class="card" data-go="sort"><img src="${IMG("13")}" alt=""><span><b>מה באמת עוזר?</b><i>מעבירים כל כרטיס לצד הנכון</i></span></button>
    <button class="card" data-go="spot"><img src="${IMG("11")}" alt=""><span><b>מצאו את ההבדלים</b><i>עיניים של גיבורים</i></span></button>
    <button class="card" data-go="quiz"><img src="${IMG("05")}" alt=""><span><b>חידון הסיפור</b><i>מי זוכר מה קרה?</i></span></button>
    <button class="card" data-go="sheet"><img src="${IMG("19")}" alt=""><span><b>${g("תעודת גיבורה","תעודת גיבור")}</b><i>דף להדפסה עם השם</i></span></button>
    <button class="card" data-go="parents"><img src="${IMG("17")}" alt=""><span><b>טיפים להורים</b><i>לב טוב, רגשות ואותיות</i></span></button>
  </nav>
  <div class="row"><button class="btn ghost" id="rename">החלפת שם</button></div>
  <div id="ownerslot"></div>
  ${offerHTML(true)}
  <section class="panel"><h2 class="q">סרטון: מתמונה אחת לספר מודפס</h2>${videoHTML()}</section>
  </div>`;
  app.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
  document.getElementById("rename").onclick=()=>go("");
  bindOffer();addOwnerBar();
}

/* ===== קורא ===== */
function read(){
  const P=story();S.page=Math.min(S.page,P.length-1);
  const p=P[S.page];
  let top="";
  if(!p.cover&&!p.end) top=`<div class="picwrap" style="--src:url('${p.img}')"><img class="pic" src="${p.img}" alt="">${kidBadge()}</div>`;
  let body;
  if(p.cover) body=`${kidBadge("big")}<img src="img/${S.g}-book.png" alt="" style="width:min(70%,300px);margin:0 auto"><h2 class="title-story big">${esc(N())} ${HERO()}</h2><p class="verse">סִפּוּר מְחֹרָז עַל אֹמֶץ וְלֵב טוֹב</p>`;
  else body=p.stanzas.map(st=>`<p class="verse">${st.join("<br>")}</p>`).join("");
  if(p.end) body+=`<p class="note">כתיבה: שמש צור · BOOQLI</p>`;
  const tall=(p.end||p.cover)?' style="min-height:380px"':"";
  app.innerHTML=`<div class="reader">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <article class="spread">${top}<div class="txt"${tall}>${body}</div></article>
    <div class="pager">
      <button class="btn ghost" id="nx" ${S.page>=P.length-1?"disabled":""}>הבא</button>
      <span class="count">${S.page+1} / ${P.length}</span>
      <button class="btn ghost" id="pv" ${S.page===0?"disabled":""}>הקודם</button>
    </div>
    <div class="voice">
      <button class="btn" id="rd">הקראת העמוד</button>
      <button class="btn ghost" id="au" aria-pressed="${S.auto}">${S.auto?"עצירת הקראה":"הקראת כל הספר"}</button>
    </div>
    <p class="note" id="ttsnote" ${TTS.voice?"hidden":""}>אם לא שומעים הקראה – במכשיר הזה אין קול בעברית. אפשר לקרוא יחד בקול 💛</p>
    ${p.end?offerHTML():""}
  </div>`;
  const goPage=d=>{S.auto=false;stopTalk();S.page+=d;read();window.scrollTo({top:0,behavior:"smooth"})};
  document.getElementById("bk").onclick=()=>{S.auto=false;go("menu")};
  document.getElementById("nx").onclick=()=>goPage(1);
  document.getElementById("pv").onclick=()=>goPage(-1);
  document.getElementById("rd").onclick=()=>{if(S.auto){S.auto=false;read()}speakSeq(pageLines(story()[S.page]),null,true)};
  document.getElementById("au").onclick=()=>{S.auto=!S.auto;stopTalk();read();if(S.auto)autoPlay(true)};
  bindOffer();fitVerses();
}
/* שורות החרוז נשארות שלמות: אם שורה ארוכה מהמסך – מקטינים את הגופן עד שהיא נכנסת */
function fitVerses(){
  document.querySelectorAll(".verse").forEach(v=>{
    v.style.fontSize="";
    let fs=parseFloat(getComputedStyle(v).fontSize),guard=0;
    while(v.scrollWidth>v.clientWidth+1&&fs>11&&guard++<40){fs-=.5;v.style.fontSize=fs+"px"}
  });
}
let fitT=null;window.addEventListener("resize",()=>{clearTimeout(fitT);fitT=setTimeout(fitVerses,120)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitVerses);
function pageLines(p){return p.cover?[[`${N()} ${HERO()}`]]:p.stanzas}
function autoPlay(byUser){
  const P=story();
  speakSeq(pageLines(P[S.page]),()=>{
    if(!S.auto)return;
    if(S.page<P.length-1){TTS.t=setTimeout(()=>{if(!S.auto)return;S.page++;read();window.scrollTo({top:0,behavior:"smooth"});autoPlay()},2200)}
    else{S.auto=false;read()}
  },byUser);
}

/* ===== כלים ===== */
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rep=(e,k,cls)=>Array.from({length:k},()=>`<span class="it ${cls||""}">${e}</span>`).join("");
function numOpts(ans,lo,hi){
  const s=new Set([ans]);
  for(const x of shuffle([ans-1,ans+1,ans+2,ans-2])){if(s.size>=4)break;if(x>=lo&&x<=hi)s.add(x)}
  let guard=0;while(s.size<4&&guard++<50){s.add(rnd(lo,hi+2))}
  return shuffle([...s]).map(x=>({k:String(x),ic:String(x),n:true}));
}
function levelPicker(){return `<div class="lvl" role="group" aria-label="רמה">${Object.entries(LV).map(([k,v])=>`<button type="button" data-l="${k}" aria-pressed="${S.lvl===k}"><b>${v.lab}</b><i>${v.sub}</i></button>`).join("")}</div>`}
function bindLevel(redraw){app.querySelectorAll(".lvl button").forEach(b=>b.onclick=()=>{S.lvl=b.dataset.l;save();redraw()})}

/* ===== אותיות ומילים ===== */
const LETTER_NAME={"א":"אָלֶף","ב":"בֵּית","ג":"גִּימֶל","ד":"דָּלֶת","ה":"הֵא","ו":"וָו","ז":"זַיִן","ח":"חֵית","ט":"טֵית","י":"יוֹד","כ":"כַּף","ל":"לָמֶד","מ":"מֵם","נ":"נוּן","ס":"סָמֶךְ","ע":"עַיִן","פ":"פֵּא","צ":"צָדִי","ק":"קוֹף","ר":"רֵישׁ","ש":"שִׁין","ת":"תָּו"};
const FINAL={"ך":"כ","ם":"מ","ן":"נ","ף":"פ","ץ":"צ"};
/* אותיות שנשמעות דומה – לא מופיעות יחד באותה שאלה */
const SOUND_GROUPS=[["א","ע","ה"],["ב","ו"],["כ","ק","ח"],["ת","ט"],["ס","ש"]];
/* אותיות שנראות דומה – לא מופיעות יחד במשחק "אות זהה" לקטנים */
const LOOK_GROUPS=[["ב","כ","פ"],["ד","ר"],["ה","ח","ת"],["ו","ז","י"],["ג","נ"],["מ","ס","ט"],["ע","צ"]];
const WORDS=[
  ["א","אַרְיֵה","🦁"],["א","אוֹפַנַּיִם","🚲"],["א","אֲנָנָס","🍍"],
  ["ב","בַּיִת","🏠"],["ב","בָּלוֹן","🎈"],["ב","בָּנָנָה","🍌"],
  ["ג","גְּלִידָה","🍦"],["ג","גֶּזֶר","🥕"],["ג","גִּיטָרָה","🎸"],
  ["ד","דָּג","🐟"],["ד","דֻּבִּי","🧸"],["ד","דְּבוֹרָה","🐝"],
  ["ה","הַר","⛰️"],["ה","הֶלִיקוֹפְּטֶר","🚁"],
  ["ז","זֶבְּרָה","🦓"],
  ["ח","חָתוּל","🐱"],["ח","חָלָב","🥛"],
  ["ט","טִיל","🚀"],["ט","טֶלֶפוֹן","📱"],
  ["י","יָרֵחַ","🌙"],["י","יָד","✋"],
  ["כ","כֶּלֶב","🐶"],["כ","כּוֹכָב","⭐"],["כ","כַּדּוּר","⚽"],
  ["ל","לֵב","❤️"],["ל","לִימוֹן","🍋"],
  ["מ","מְכוֹנִית","🚗"],["מ","מַטְרִיָּה","☂️"],["מ","מַפְתֵּחַ","🔑"],
  ["נ","נָחָשׁ","🐍"],["נ","נֵר","🕯️"],
  ["ס","סוּס","🐴"],["ס","סֵפֶר","📖"],
  ["ע","עֵץ","🌳"],["ע","עוּגָה","🎂"],["ע","עַכָּבִישׁ","🕷️"],
  ["פ","פִּיל","🐘"],["פ","פֶּרַח","🌸"],
  ["צ","צָב","🐢"],["צ","צִפּוֹר","🐦"],
  ["ק","קוֹף","🐒"],["ק","קֶשֶׁת","🌈"],
  ["ר","רַכֶּבֶת","🚂"],["ר","רוֹבּוֹט","🤖"],
  ["ש","שֶׁמֶשׁ","☀️"],["ש","שָׁעוֹן","⏰"],
  ["ת","תַּפּוּחַ","🍎"],["ת","תּוּת","🍓"]
];
/* מילים קצרות לקריאה ראשונה (גן חובה) */
const READ_WORDS=[["דָּג","🐟"],["סוּס","🐴"],["לֵב","❤️"],["עֵץ","🌳"],["יָד","✋"],["צָב","🐢"],["תּוּת","🍓"],["נֵר","🕯️"],["פִּיל","🐘"],["קוֹף","🐒"],["בַּיִת","🏠"],["כֶּלֶב","🐶"],["שֶׁמֶשׁ","☀️"],["יָרֵחַ","🌙"],["טִיל","🚀"],["הַר","⛰️"]];
const ALL_L=Object.keys(LETTER_NAME);
const groupOf=(G,l)=>G.find(x=>x.includes(l))||[l];
function letterOpts(ans,G,n){
  const bad=new Set(groupOf(G,ans));
  const out=[ans];
  for(const l of shuffle(ALL_L)){if(out.length>=n)break;if(bad.has(l))continue;const gr=groupOf(G,l);if(out.some(o=>gr.includes(o)))continue;out.push(l)}
  return shuffle(out).map(l=>({k:l,ic:l,l:true}));
}
function firstLetter(w){const c=noNiq(w).replace(/[^\u05D0-\u05EA]/g,"")[0];return c?(FINAL[c]||c):null}
const markFirst=w=>{const m=w.match(/^([\u05D0-\u05EA][\u0591-\u05C7]*)(.*)$/);return m?`<u>${m[1]}</u>${m[2]}`:w};

/* ===== משחק "משימות גיבורים" – מהירות עם שעון ===== */
const LV={
  s:{lab:"קטנים",sub:"גיל 3–4 · 10 שניות",max:5,ms:10000,opts:3,cats:["feel","help","cnt","same","more"]},
  b:{lab:"גדולים",sub:"גיל 5–6 · 8 שניות",max:10,ms:8000,opts:4,cats:["feel","help","cnt","first","more"]}
};
const FACES={sad:["😢","עָצוּב"],happy:["😀","שָׂמֵחַ"],angry:["😠","כּוֹעֵס"],scared:["😨","מְפַחֵד"],tired:["😴","עָיֵף"],wow:["😲","מֻפְתָּע"]};
const FEEL=[
  ["🧒🚲💥","יֶלֶד נָפַל מֵהָאוֹפַנַּיִם","sad"],["🎁🧒","קִבֵּל מַתָּנָה שֶׁרָצָה","happy"],
  ["🧸✋","חָטְפוּ לוֹ אֶת הַדֻּבִּי","angry"],["⛈️⚡","רַעַם חָזָק בַּלַּיְלָה","scared"],
  ["🌙🛏️","אַחֲרֵי יוֹם אָרֹךְ וּמְעַיֵּף","tired"],["🎉🎈","הַפְתָּעָה! כֻּלָּם צוֹעֲקִים: \"מַזָּל טוֹב!\"","wow"],
  ["🍦⬇️","הַגְּלִידָה נָפְלָה עַל הָרִצְפָּה","sad"],["🐶❤️","הַכֶּלֶב מְלַקֵּק לוֹ אֶת הָאַף","happy"],
  ["🧱💥","הָרְסוּ לוֹ אֶת הַמִּגְדָּל","angry"],["🐝👃","דְּבוֹרָה מְזַמְזֶמֶת לְיַד הָאַף","scared"],
  ["🦸🏆","נִצַּח בְּמֵרוֹץ הַגִּבּוֹרִים","happy"],["🐰🎩","אַרְנָב יָצָא מֵהַכּוֹבַע!","wow"]
];
const HELP=[
  ["🧒🚲💥","יֶלֶד נָפַל מֵהָאוֹפַנַּיִם. מָה עוֹשִׂים?",["🤝","עוֹזְרִים לוֹ לָקוּם"]],
  ["😢","חֲבֵרָה בּוֹכָה. מָה עוֹשִׂים?",["🤗","מְחַבְּקִים אוֹתָהּ"]],
  ["🧸🧩🚗","הַצַּעֲצוּעִים נָפְלוּ לְחָבֵר. מָה עוֹשִׂים?",["🙌","עוֹזְרִים לֶאֱסֹף"]],
  ["🧒🌳","יֶלֶד חָדָשׁ עוֹמֵד לְבַד בֶּחָצֵר. מָה עוֹשִׂים?",["⚽","מַזְמִינִים אוֹתוֹ לְשַׂחֵק"]],
  ["👵🛍️🛍️","סָבְתָא סוֹחֶבֶת סַלִּים כְּבֵדִים. מָה עוֹשִׂים?",["💪","עוֹזְרִים לָהּ לָשֵׂאת"]],
  ["🥵☀️","לַחֲבֵר חַם וְהוּא צָמֵא. מָה עוֹשִׂים?",["💧","נוֹתְנִים לוֹ מַיִם"]],
  ["🦵🩸","חָבֵר נִפְצַע בַּבֶּרֶךְ. מָה עוֹשִׂים?",["📢","קוֹרְאִים לִמְבֻגָּר"]],
  ["🥛💦","נִשְׁפְּכוּ מַיִם עַל הַשֻּׁלְחָן. מָה עוֹשִׂים?",["🧽","מְנַגְּבִים יַחַד"]]
];
const HELP_NO=[["🏃","בּוֹרְחִים"],["😂","צוֹחֲקִים"],["🙈","לֹא מִסְתַּכְּלִים"],["📺","מַמְשִׁיכִים לִרְאוֹת טֵלֶוִיזְיָה"],["😤","כּוֹעֲסִים עָלָיו"]];
const MQ={
  feel(L){const [vis,cap,ans]=pick(FEEL);const keys=shuffle(Object.keys(FACES).filter(k=>k!==ans)).slice(0,L.opts-1);
    return{ask:"אֵיךְ הוּא מַרְגִּישׁ?",vis:`<div class="scene">${vis}</div><p class="cap">${cap}</p>`,ans,
      opts:shuffle([ans,...keys]).map(k=>({k,ic:FACES[k][0],lab:FACES[k][1]})),teach:`${FACES[ans][0]} ${FACES[ans][1]} – כשמבינים איך החבר מרגיש, יודעים איך לעזור`,say:cap+". אֵיךְ הוּא מַרְגִּישׁ?"}},
  help(L){const [vis,cap,good]=pick(HELP);const no=shuffle(HELP_NO).slice(0,L.opts-1);
    return{ask:"מָה עוֹשֶׂה גִּבּוֹר?",vis:`<div class="scene">${vis}</div><p class="cap">${cap}</p>`,ans:"y",
      opts:shuffle([{k:"y",ic:good[0],lab:good[1]},...no.map((o,i)=>({k:"n"+i,ic:o[0],lab:o[1]}))]),teach:`${good[0]} ${good[1]} – ככה עושים גיבורים אמיתיים`,say:cap}},
  cnt(L){const n=rnd(2,L.max);const row=k=>`<div style="display:flex;justify-content:center;width:100%">${rep("❤️",k)}</div>`;
    let h="";for(let i=0;i<n;i+=5)h+=row(Math.min(5,n-i));
    return{ask:"כַּמָּה לְבָבוֹת?",vis:h,ans:String(n),opts:numOpts(n,1,L.max).slice(0,L.opts).concat([]).sort(()=>0),fix:true,n,teach:`נוגעים בכל לב פעם אחת: ${n} לבבות`}},
  same(L){const ans=pick(ALL_L);return{ask:"אֵיזוֹ אוֹת זֵהָה?",vis:`<span class="bigletter">${ans}</span>`,ans,opts:letterOpts(ans,LOOK_GROUPS,L.opts),teach:`זו האות ${ans} – ${LETTER_NAME[ans]}`}},
  first(L){const w=pick(WORDS);return{ask:"בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה?",vis:`<div class="wordpic"><span class="e">${w[2]}</span><span class="w">${w[1]}</span></div>`,ans:w[0],
    opts:letterOpts(w[0],SOUND_GROUPS,L.opts),teach:`${w[1]} מתחילה באות ${w[0]} – ${LETTER_NAME[w[0]]}`,say:w[1]+". בְּאֵיזוֹ אוֹת הִיא מַתְחִילָה?"}},
  more(L){let a=rnd(1,L.max),b=rnd(1,L.max);while(b===a)b=rnd(1,L.max);
    const ans=a>b?"a":"b";
    return{ask:"אֵיפֹה יוֹתֵר כּוֹכָבִים?",vis:`<div class="plate a"><div class="its">${rep("⭐",a)}</div></div><div class="plate b"><div class="its">${rep("⭐",b)}</div></div>`,ans,
      opts:shuffle([{k:"a",ic:"🔵",lab:"בַּכָּחֹל"},{k:"b",ic:"🔴",lab:"בָּאָדֹם"}]),teach:`בכחול ${a}, באדום ${b}`}}
};
/* מספרי התשובות צריכים לכלול את התשובה הנכונה גם כשיש רק 3 אפשרויות */
function fixNumOpts(Q,L){if(!Q.fix)return Q;let o=numOpts(Q.n,1,L.max);const right=o.find(x=>x.k===Q.ans);o=shuffle([right,...o.filter(x=>x!==right).slice(0,L.opts-1)]);Q.opts=o;return Q}
let BS=null;
const bestKey=()=>KEY+"-best-"+S.lvl;
function getBest(){try{return +localStorage.getItem(bestKey())||null}catch(e){return null}}
function mqDeck(L){
  const out=[];let pool=[];
  while(out.length<10){if(!pool.length)pool=shuffle(L.cats);
    let i=pool.findIndex(c=>c!==out[out.length-1]);if(i<0){pool=shuffle(L.cats);continue}
    out.push(pool.splice(i,1)[0])}
  return out;
}
function speed(){
  stopTalk();
  const best=getBest();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">משימות גיבורים ⏱️</h2>
      <p>מזהים איך חבר מרגיש, בוחרים מה עושה גיבור אמיתי, סופרים לבבות ומוצאים אותיות.<br>לוחצים <b>הכי מהר שאפשר</b> על התשובה הנכונה – השעון רץ!</p>
      <p style="margin-top:8px;font-weight:700">בוחרים רמה:</p>
      ${levelPicker()}
      ${best?`<p class="note" style="margin-top:8px">השיא ברמה הזו: ${(best/1000).toFixed(1)} שניות בממוצע</p>`:""}
      <div class="row" style="margin-top:10px"><button class="btn cta go" id="bsgo">מוכנים? מתחילים!</button></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  bindLevel(speed);
  document.getElementById("bsgo").onclick=()=>{sfxWin();const L=LV[S.lvl];BS={L,deck:mqDeck(L),i:0,ok:0,res:[],times:[],timer:null,next:null,tick:null};bsRound()};
}
function bsRound(){
  clearTimeout(BS.timer);clearTimeout(BS.next);clearInterval(BS.tick);
  if(BS.i>=BS.deck.length)return bsEnd();
  const L=BS.L,Q=fixNumOpts(MQ[BS.deck[BS.i]](L),L);BS.Q=Q;const myR=BS.i,MS=L.ms,secs=Math.round(MS/1000);
  app.innerHTML=`<div class="wrap" style="gap:10px">
    <div class="row" style="justify-content:space-between"><button class="btn ghost small" id="bk">→ לתפריט</button><span class="count">משימה ${BS.i+1} / ${BS.deck.length}</span></div>
    <div class="stars" aria-label="כוכבים">${BS.deck.map((_,j)=>`<span class="${BS.res[j]?"":"off"}">⭐</span>`).join("")}</div>
    <section class="bs-stage">
      <div class="bs-top">
        <img class="bs-kid" src="${kidPic()}" alt="${esc(N())}">
        <div class="bs-bubble" id="bub" style="font-size:clamp(17px,4.8vw,24px)">${Q.ask}</div>
        <div class="clock" id="clock" role="timer" aria-live="off"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="track"/><circle cx="22" cy="22" r="19" class="arc" id="arc"/></svg><b id="sec">${secs}</b></div>
      </div>
      <div class="mq-vis">${Q.vis}</div>
      <div id="res" class="bs-res" hidden></div>
    </section>
    <div class="bs-opts">${Q.opts.map(o=>`<button class="bs-opt" data-k="${esc(o.k)}"><span class="ic ${o.n?"n":o.l?"l":"e"}" aria-hidden="${o.n||o.l?"false":"true"}">${o.ic}</span>${o.lab?`<small>${o.lab}</small>`:""}</button>`).join("")}</div>
  </div>`;
  document.getElementById("bk").onclick=()=>{clearTimeout(BS.timer);clearTimeout(BS.next);clearInterval(BS.tick);go("menu")};
  const arc=document.getElementById("arc"),sec=document.getElementById("sec"),clock=document.getElementById("clock");
  const C=2*Math.PI*19;arc.style.strokeDasharray=C;
  const t0=performance.now();
  let over=false,lastS=secs;
  BS.tick=setInterval(()=>{
    const left=Math.max(0,MS-(performance.now()-t0));
    arc.style.strokeDashoffset=C*(1-left/MS);
    const sl=Math.ceil(left/1000);
    if(sl!==lastS){lastS=sl;sec.textContent=sl;if(sl<=3&&sl>0){clock.classList.add("hurry");tone([[1200,.06,"square"]])}}
  },50);
  say(Q.say||Q.ask);
  const finish=(k,btn)=>{
    if(over||BS.i!==myR)return;over=true;
    clearTimeout(BS.timer);clearInterval(BS.tick);
    const took=performance.now()-t0,ok=k===Q.ans;
    app.querySelectorAll(".bs-opt").forEach(b=>{b.disabled=true;if(b.dataset.k===Q.ans)b.classList.add("right")});
    if(btn&&!ok)btn.classList.add("wrong");
    let html;
    if(ok){
      BS.res[BS.i]=true;BS.ok++;BS.times.push(took);
      const sp=took<2500?"⚡ בזק!":took<5000?"מהיר!":"הספקת!";
      html=`<span class="big">${(took/1000).toFixed(1)}</span><span><b>${sp}</b><br>${Q.teach}</span>`;sfxWin();
    }else{
      html=`<span class="big">${btn?"🙃":"⏰"}</span><span><b>${btn?"כמעט!":"נגמר הזמן!"}</b><br>${Q.teach}</span>`;sfxMiss();
    }
    const res=document.getElementById("res");res.innerHTML=html;res.className="bs-res "+(ok?"ok":"no");res.hidden=false;
    clock.classList.remove("hurry");clock.classList.add("stop");
    document.querySelectorAll(".stars span")[BS.i].className=ok?"":"off";
    stopTalk();
    BS.next=setTimeout(()=>{if(BS.i!==myR||location.hash.slice(1)!=="speed")return;BS.i++;bsRound()},ok?1900:3200);
  };
  BS.timer=setTimeout(()=>finish(null,null),MS);
  app.querySelectorAll(".bs-opt").forEach(b=>b.onclick=()=>finish(b.dataset.k,b));
}
function bsEnd(){
  const n=BS.ok,t=BS.deck.length,need=Math.ceil(t*.6);
  const avg=BS.times.length?BS.times.reduce((x,y)=>x+y,0)/BS.times.length:null;
  const fast=BS.times.length?Math.min(...BS.times):null;
  let rec=false;const best=getBest();
  if(avg&&n>=need&&(!best||avg<best)){rec=true;try{localStorage.setItem(bestKey(),String(Math.round(avg)))}catch(e){}}
  const nb=getBest();
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${n>=Math.ceil(t*.9)?g("גיבורת על אמיתית!","גיבור על אמיתי!"):n>=need?"כל הכבוד!":"התחלה טובה!"}</h2>
      <div class="stars">${BS.deck.map((_,j)=>`<span class="${BS.res[j]?"":"off"}">⭐</span>`).join("")}</div>
      <div class="scoreline">
        <div><b>${n}/${t}</b><span>משימות</span></div>
        ${avg?`<div><b>${(avg/1000).toFixed(1)}</b><span>שניות בממוצע</span></div><div><b>${(fast/1000).toFixed(1)}</b><span>הכי מהיר</span></div>`:""}
      </div>
      ${rec?`<p class="record">🏆 שיא חדש!</p>`:nb?`<p class="note">השיא: ${(nb/1000).toFixed(1)} שניות בממוצע. אפשר לשבור אותו?</p>`:""}
      ${n>=need?"":tryAgain(`כדי לזכות בקופון צריך לפחות ${need} כוכבים. עוד ניסיון?`)}
      <div class="row"><button class="btn" id="again">עוד פעם – יותר מהר!</button><button class="btn ghost" id="nx">לאותיות הגיבורים</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1600);
  if(n>=need)winLater("ניצחון במשימות הגיבורים ⏱️");
  document.getElementById("again").onclick=speed;
  document.getElementById("nx").onclick=()=>go("letters");
  bindOffer();
}

/* ===== אותיות הגיבורים – מכירים אותיות וקוראים מילים ראשונות ===== */
let LT=null;
function nameLetter(){const c=S.name.replace(/[^\u05D0-\u05EA]/g,"")[0];return c?(FINAL[c]||c):null}
function ltDeck(){
  const lv=S.lvl,out=[];const nl=nameLetter();
  if(lv==="s"){
    const ls=shuffle(ALL_L);
    for(let i=0;i<9;i++)out.push({t:"same",l:ls[i]});
    if(nl)out.splice(rnd(2,6),0,{t:"name",l:nl});else out.push({t:"same",l:ls[9]});
  }else{
    const ws=shuffle(WORDS),rw=shuffle(READ_WORDS);
    for(let i=0;i<5;i++)out.push({t:"first",w:ws[i]});
    for(let i=0;i<4;i++)out.push({t:"read",w:rw[i]});
    const d=shuffle(out);out.length=0;out.push(...d);
    if(nl)out.splice(rnd(2,6),0,{t:"name",l:nl});else out.push({t:"first",w:ws[6]});
  }
  return out.slice(0,10);
}
function letters(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">אותיות הגיבורים 🔤</h2>
      <p>כל תשובה נכונה ממלאת את <b>מד הכוח</b> של ${esc(N())}! אין שעון – חושבים בנחת.</p>
      <ul style="margin:0;padding-inline-start:20px"><li><b>קטנים:</b> מוצאים אות זהה, ומוצאים את האות הראשונה של השם</li><li><b>גדולים (גן חובה):</b> באיזו אות מתחילה המילה, וקוראים מילים קצרות</li></ul>
      ${levelPicker().replace(/גיל 3–4 · 10 שניות/,"גיל 3–4 · אות זהה").replace(/גיל 5–6 · 8 שניות/,"גיל 5–6 · קריאה")}
      <div class="row" style="margin-top:10px"><button class="btn cta go" id="ltgo">מתחילים!</button></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  bindLevel(letters);
  document.getElementById("ltgo").onclick=()=>{sfxWin();LT={deck:ltDeck(),i:0,first:0,tries:0};ltRound()};
}
function ltQ(it){
  const n=esc(N());
  if(it.t==="same")return{ask:"מִצְאוּ אֶת אוֹתָהּ אוֹת",vis:`<span class="bigletter">${it.l}</span>`,ans:it.l,opts:letterOpts(it.l,LOOK_GROUPS,3),fact:`נכון! זו האות ${it.l} – ${LETTER_NAME[it.l]}`,sayOk:`נָכוֹן! זוֹ הָאוֹת ${LETTER_NAME[it.l]}`};
  if(it.t==="name")return{ask:`בְּאֵיזוֹ אוֹת מַתְחִיל הַשֵּׁם ${n}?`,vis:`<span class="readword">${markFirst(n)}</span>`,ans:it.l,opts:letterOpts(it.l,S.lvl==="s"?LOOK_GROUPS:SOUND_GROUPS,S.lvl==="s"?3:4),fact:`השם ${n} מתחיל באות ${it.l} – ${LETTER_NAME[it.l]}. זו האות של ${g("הגיבורה","הגיבור")}!`,sayOk:`נָכוֹן! הַשֵּׁם ${N()} מַתְחִיל בָּאוֹת ${LETTER_NAME[it.l]}`};
  if(it.t==="first"){const [l,w,e]=it.w;return{ask:"בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה?",vis:`<div class="wordpic"><span class="e">${e}</span><span class="w">${w}</span></div>`,ans:l,opts:letterOpts(l,SOUND_GROUPS,4),fact:`${w} מתחילה באות ${l} – ${LETTER_NAME[l]}`,sayQ:`${w}. בְּאֵיזוֹ אוֹת הִיא מַתְחִילָה?`,sayOk:`נָכוֹן! ${w} מַתְחִילָה בְּ${LETTER_NAME[l]}`}}
  const [w,e]=it.w;const others=shuffle(READ_WORDS.filter(x=>x[0]!==w)).slice(0,3);
  return{ask:"מָה כָּתוּב כָּאן?",vis:`<span class="readword">${w}</span>`,ans:w,opts:shuffle([[w,e],...others]).map(x=>({k:x[0],ic:x[1]})),fact:`נכון! כתוב ${w} ${e}`,sayOk:`נָכוֹן! כָּתוּב ${w}`,read:true};
}
function ltRound(){
  if(LT.i>=LT.deck.length)return ltEnd();
  const it=LT.deck[LT.i];const Q=ltQ(it);LT.Q=Q;LT.tries=0;
  const pct=Math.round(LT.first/LT.deck.length*100);
  app.innerHTML=`<div class="wrap" style="gap:12px">
    <div class="row" style="justify-content:space-between"><button class="btn ghost small" id="bk">→ לתפריט</button><span class="count">${LT.i+1} / ${LT.deck.length}</span></div>
    <div class="power" aria-label="מד הכוח"><b>⚡ כוח</b><div class="bar"><i style="width:${pct}%"></i></div><b>${LT.first}</b></div>
    <section class="bs-stage">
      <div class="bs-top">
        <img class="bs-kid" src="${kidPic()}" alt="${esc(N())}">
        <div class="bs-bubble" style="font-size:clamp(17px,4.8vw,24px)">${Q.ask}</div>
        <button class="btn ghost small" id="sp" style="grid-area:clock;justify-self:end" aria-label="להקריא את השאלה">🔊</button>
      </div>
      <div class="mq-vis">${Q.vis}</div>
    </section>
    <div class="bs-opts">${Q.opts.map(o=>`<button class="bs-opt" data-k="${esc(o.k)}"><span class="ic ${o.l?"l":"e"}">${o.ic}</span></button>`).join("")}</div>
    <div id="fb"></div>
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  const sq=Q.sayQ||Q.ask.replace(/<[^>]+>/g,"");
  document.getElementById("sp").onclick=()=>say(sq,null,true);
  say(sq);
  app.querySelectorAll(".bs-opt").forEach(b=>b.onclick=()=>{
    if(b.disabled)return;
    const fb=document.getElementById("fb");
    if(b.dataset.k===Q.ans){
      if(LT.tries===0)LT.first++;
      b.classList.add("right");app.querySelectorAll(".bs-opt").forEach(x=>x.disabled=true);
      document.querySelector(".power .bar i").style.width=Math.round(LT.first/LT.deck.length*100)+"%";
      document.querySelector(".power b:last-child").textContent=LT.first;
      fb.innerHTML=`<div class="fact"><b>${LT.tries===0?"⚡ כוח!":"יפה!"}</b> ${Q.fact}</div><div class="row" style="margin-top:12px"><button class="btn" id="nq">${LT.i<LT.deck.length-1?"הלאה":"לתוצאה"}</button></div>`;
      sfxWin();stopTalk();TTS.t=setTimeout(()=>say(Q.sayOk),500);
      document.getElementById("nq").onclick=()=>{LT.i++;stopTalk();ltRound()};
    }else{
      LT.tries++;b.classList.add("wrong");b.disabled=true;sfxFail();
      fb.innerHTML=`<div class="fact no">כמעט! ${Q.read?"קוראים לאט, אות אחרי אות, ונסו שוב.":"מסתכלים טוב ונסו שוב."}</div>`;
    }
  });
}
function ltEnd(){
  const s=LT.first,t=LT.deck.length,need=7;
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${s>=need?g("גיבורת האותיות!","גיבור האותיות!"):"מתאמנים ומתחזקים!"}</h2>
      <div class="power" style="width:100%"><b>⚡</b><div class="bar"><i style="width:${Math.round(s/t*100)}%"></i></div><b>${s}/${t}</b></div>
      <p style="font-size:20px">${esc(N())} ${g("ענתה","ענה")} נכון בניסיון הראשון על <b>${s}</b> מתוך ${t}.</p>
      ${s>=need?"":tryAgain(`כדי לזכות בקופון צריך ${need} תשובות נכונות בניסיון הראשון. עוד פעם?`)}
      <div class="row"><button class="btn" id="again">עוד סיבוב</button><button class="btn ghost" id="nx">למה באמת עוזר?</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1600);
  if(s>=need)winLater("ניצחון באותיות הגיבורים 🔤");
  document.getElementById("again").onclick=letters;
  document.getElementById("nx").onclick=()=>go("sort");
  bindOffer();
}

/* ===== מה באמת עוזר? – מעבירים כל כרטיס לצד הנכון ===== */
const SORT_SETS={
  kind:{title:"מַעֲשֶׂה טוֹב אוֹ לֹא כְּדַאי?",a:["💛","מַעֲשֶׂה טוֹב"],b:["🙅","לֹא כְּדַאי"],
    A:[["🤝","מוֹשִׁיטִים יָד לְחָבֵר שֶׁנָּפַל"],["🤗","מְחַבְּקִים חֲבֵרָה עֲצוּבָה"],["🧸","מְשַׁתְּפִים בַּצַּעֲצוּעִים"],["🙌","עוֹזְרִים לְסַדֵּר אֶת הַגַּן"],["⚽","מַזְמִינִים יֶלֶד חָדָשׁ לְשַׂחֵק"],["🌷","מַשְׁקִים אֶת הָעָצִיץ"],["🙏","אוֹמְרִים תּוֹדָה"],["🍪","מְחַלְּקִים עוּגִיָּה לְחָבֵר"]],
    B:[["😝","צוֹחֲקִים עַל מִי שֶׁנָּפַל"],["✋","חוֹטְפִים צַעֲצוּעַ"],["🧱","הוֹרְסִים מִגְדָּל שֶׁל חָבֵר"],["🗑️","זוֹרְקִים אַשְׁפָּה עַל הָרִצְפָּה"],["🙉","לֹא מַקְשִׁיבִים לְחָבֵר"],["😤","דּוֹחֲפִים בַּתּוֹר"]]},
  need:{title:"מָה צָרִיךְ כְּדֵי לַעֲזֹר לַיֶּלֶד שֶׁנָּפַל?",a:["💛","עוֹזֵר בֶּאֱמֶת"],b:["🦸","לֹא צָרִיךְ"],
    A:[["🤝","יָד מוּשֶׁטֶת"],["🤗","חִבּוּק"],["😊","חִיּוּךְ"],["💬","מִלָּה טוֹבָה"],["👂","אֹזֶן קַשֶּׁבֶת"],["💧","כּוֹס מַיִם"]],
    B:[["🧣","גְּלִימָה מַבְרִיקָה"],["🎭","מַסֵּכָה שְׁחוֹרָה"],["🪽","כְּנָפַיִם"],["🕸️","קוּרֵי עַכָּבִישׁ"],["💪","שְׁרִירִים עֲנָקִיִּים"],["🔦","פָּנָס בַּחֲגוֹרָה"]]}
};
function letterSet(){
  const pairs=[["ב","מ"],["ש","ל"],["כ","ר"],["ת","ס"],["פ","ד"],["ג","ע"]];
  const [x,y]=pick(pairs);
  const W=l=>shuffle(WORDS.filter(w=>w[0]===l)).slice(0,3).map(w=>[w[2],w[1]]);
  return{title:`בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה?`,a:[x,`מַתְחִיל בְּ${LETTER_NAME[x]}`],b:[y,`מַתְחִיל בְּ${LETTER_NAME[y]}`],A:W(x),B:W(y),letters:true};
}
let SG=null;
function sortGame(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">מה באמת עוזר? 💛</h2>
      <p>${esc(N())} ${g("גילתה","גילה")} שלא צריך גלימה כדי להיות ${g("גיבורה","גיבור")}. עכשיו תורכם: <b>גוררים</b> כל כרטיס לצד הנכון – או <b>לוחצים</b> על הצד.</p>
      ${levelPicker().replace(/גיל 3–4 · 10 שניות/,"גיל 3–4 · 2 סבבים").replace(/גיל 5–6 · 8 שניות/,"גיל 5–6 · 3 סבבים, עם אותיות")}
      <div class="row" style="margin-top:10px"><button class="btn cta go" id="sggo">מתחילים!</button></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  bindLevel(sortGame);
  document.getElementById("sggo").onclick=()=>{
    sfxWin();
    const mk=set=>{const A=shuffle(set.A).slice(0,set.letters?3:4),B=shuffle(set.B).slice(0,set.letters?3:4);
      return Object.assign({},set,{cards:shuffle([...A.map(c=>({e:c[0],t:c[1],side:"a"})),...B.map(c=>({e:c[0],t:c[1],side:"b"}))])})};
    const rounds=[mk(SORT_SETS.kind),mk(SORT_SETS.need)];if(S.lvl==="b")rounds.push(mk(letterSet()));
    SG={rounds,r:0,i:0,ok:0,total:rounds.reduce((x,r)=>x+r.cards.length,0),cnt:{a:0,b:0},busy:false};sgDraw();
  };
}
function sgDraw(){
  const R=SG.rounds[SG.r];
  if(SG.i>=R.cards.length){SG.r++;SG.i=0;SG.cnt={a:0,b:0};if(SG.r>=SG.rounds.length)return sgEnd();return sgDraw()}
  const c=R.cards[SG.i],done=SG.rounds.slice(0,SG.r).reduce((x,r)=>x+r.cards.length,0)+SG.i;
  const zi=z=>R.letters?`<span class="z-ic" style="font-family:'Frank Ruhl Libre',serif;font-weight:700">${z[0]}</span>`:`<span class="z-ic">${z[0]}</span>`;
  app.innerHTML=`<div class="wrap" style="gap:10px">
    <div class="row" style="justify-content:space-between"><button class="btn ghost small" id="bk">→ לתפריט</button><span class="count">סבב ${SG.r+1} / ${SG.rounds.length} · כרטיס ${done+1} / ${SG.total}</span></div>
    <h2 class="q" style="text-align:center">${R.title}</h2>
    <div class="sg-zones">
      <button class="zone a" data-z="a">${zi(R.a)}<span>${R.a[1]}</span><span class="z-n">${SG.cnt.a?"✓ "+SG.cnt.a:"&nbsp;"}</span></button>
      <button class="zone b" data-z="b">${zi(R.b)}<span>${R.b[1]}</span><span class="z-n">${SG.cnt.b?"✓ "+SG.cnt.b:"&nbsp;"}</span></button>
    </div>
    <div class="sg-stage"><div class="scard" id="card" role="button" aria-label="${esc(noNiq(c.t))}"><span class="e">${c.e}</span><span class="t">${c.t}</span></div></div>
    <p class="sg-hint" id="hint">גוררים את הכרטיס לצד הנכון – או לוחצים על הצד ⬆️</p>
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  say(c.t);
  const card=document.getElementById("card"),zones=[...app.querySelectorAll(".zone")];
  zones.forEach(z=>z.onclick=()=>sgJudge(z.dataset.z));
  let sx=0,sy=0,drag=false,pid=null;
  const over=(x,y)=>zones.find(z=>{const r=z.getBoundingClientRect();return x>=r.left-10&&x<=r.right+10&&y>=r.top-10&&y<=r.bottom+30});
  card.addEventListener("pointerdown",e=>{if(SG.busy)return;pid=e.pointerId;sx=e.clientX;sy=e.clientY;drag=true;card.classList.add("drag");card.classList.remove("back");try{card.setPointerCapture(pid)}catch(_){}});
  card.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==pid)return;card.style.transform=`translate(${e.clientX-sx}px,${e.clientY-sy}px) rotate(${(e.clientX-sx)/18}deg)`;
    const z=over(e.clientX,e.clientY);zones.forEach(q=>q.classList.toggle("hot",q===z))});
  const up=e=>{if(!drag||e.pointerId!==pid)return;drag=false;card.classList.remove("drag");zones.forEach(q=>q.classList.remove("hot"));
    const moved=Math.hypot(e.clientX-sx,e.clientY-sy),z=moved>12?over(e.clientX,e.clientY):null;
    if(z)sgJudge(z.dataset.z);else{card.classList.add("back");card.style.transform="";if(moved<=12)document.getElementById("hint").textContent="לוחצים על הצד הנכון למעלה, או גוררים לשם את הכרטיס 👆"}};
  card.addEventListener("pointerup",up);card.addEventListener("pointercancel",up);
}
function sgJudge(z){
  if(SG.busy)return;SG.busy=true;
  const R=SG.rounds[SG.r],c=R.cards[SG.i],ok=z===c.side;
  const zone=app.querySelector(`.zone[data-z="${c.side}"]`),picked=app.querySelector(`.zone[data-z="${z}"]`),card=document.getElementById("card");
  const fly=()=>{const zr=zone.getBoundingClientRect(),cr=card.getBoundingClientRect();
    card.classList.remove("back");card.classList.add("fly");card.style.transform=`translate(${zr.left+zr.width/2-(cr.left+cr.width/2)}px,${zr.top+zr.height/2-(cr.top+cr.height/2)}px) scale(.3)`};
  if(ok){SG.ok++;SG.cnt[c.side]++;zone.classList.add("good");sfxPair();fly();
    setTimeout(()=>{SG.i++;SG.busy=false;sgDraw()},650)}
  else{picked.classList.add("bad");sfxFail();
    const h=document.getElementById("hint");h.innerHTML=`<b>כמעט!</b> "${c.t}" – זה <b>${R[c.side][1]}</b>`;
    stopTalk();TTS.t=setTimeout(()=>say(`זֶה ${R[c.side][1]}`),300);
    SG.cnt[c.side]++;
    setTimeout(()=>{zone.classList.add("good");fly()},1300);
    setTimeout(()=>{SG.i++;SG.busy=false;sgDraw()},2100)}
}
function sgEnd(){
  const s=SG.ok,t=SG.total,need=t-2;
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${s>=need?g("יש לך לב של גיבורה!","יש לך לב של גיבור!"):"כמעט שם!"}</h2>
      <p style="font-size:20px">${esc(N())} ${g("העבירה","העביר")} נכון <b>${s}</b> מתוך ${t} כרטיסים.</p>
      <p class="note">הכוח הכי חזק בעולם הוא לב טוב – לא גלימה ולא שרירים 💛</p>
      ${s>=need?"":tryAgain(`כדי לזכות בקופון צריך לפחות ${need} כרטיסים נכונים. עוד פעם?`)}
      <div class="row"><button class="btn" id="again">עוד פעם</button><button class="btn ghost" id="nx">למצאו את ההבדלים</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1600);
  if(s>=need)winLater("ניצחון ב\"מה באמת עוזר?\" 💛");
  document.getElementById("again").onclick=sortGame;
  document.getElementById("nx").onclick=()=>go("spot");
  bindOffer();
}

/* ===== מצאו את ההבדלים – שתי תמונות מצוירות ===== */
const starPath=(x,y,r)=>{let p="";for(let i=0;i<10;i++){const a=Math.PI/5*i-Math.PI/2,rr=i%2?r*.45:r;p+=(i?"L":"M")+(x+rr*Math.cos(a)).toFixed(1)+" "+(y+rr*Math.sin(a)).toFixed(1)}return p+"Z"};
const heartPath=(x,y,s)=>`M${x} ${y+s*.9}C${x-s*1.4} ${y} ${x-s*.8} ${y-s*.9} ${x} ${y-s*.3}C${x+s*.8} ${y-s*.9} ${x+s*1.4} ${y} ${x} ${y+s*.9}Z`;
const SCENES={
  park:{name:"בגינה",diffs:{
    sun:[320,58,30],cloud:[95,48,32],bld:[352,128,26],bird:[175,72,22],apple:[48,100,34],lamp:[130,92,22],
    bench:[245,192,34],heart:[212,168,18],cape:[288,186,22],basket:[383,192,20],flower:[150,232,24]},
    draw(v,p){return `
      <defs><linearGradient id="sk${p}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3A3"/><stop offset="1" stop-color="#F6B25C"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#sk${p})"/>
      <circle cx="320" cy="58" r="${v("sun")?16:26}" fill="#FFD54A" stroke="#F2A93B" stroke-width="3"/>
      ${v("cloud")?"":`<g fill="#fff" opacity=".95"><ellipse cx="95" cy="50" rx="34" ry="14"/><circle cx="82" cy="42" r="13"/><circle cx="104" cy="38" r="16"/></g>`}
      <g fill="#C98B5E" opacity=".75"><rect x="232" y="110" width="26" height="80"/><rect x="262" y="90" width="22" height="100"/><rect x="290" y="120" width="28" height="70"/>
        <rect x="340" y="${v("bld")?150:100}" width="26" height="${v("bld")?40:90}"/><rect x="370" y="125" width="24" height="65"/></g>
      ${v("bird")?"":`<path d="M162 72q7-9 13 0q6-9 13 0" fill="none" stroke="#5A3B2A" stroke-width="3" stroke-linecap="round"/>`}
      <rect x="40" y="120" width="16" height="75" fill="#7A4A2A"/>
      <circle cx="48" cy="100" r="44" fill="#7C9A3A"/><circle cx="22" cy="118" r="22" fill="#6F8F3A"/><circle cx="74" cy="118" r="22" fill="#6F8F3A"/>
      ${v("apple")?"":`<g fill="#C62828"><circle cx="34" cy="92" r="6"/><circle cx="58" cy="82" r="6"/><circle cx="62" cy="110" r="6"/><circle cx="38" cy="116" r="6"/></g>`}
      <rect x="127" y="96" width="6" height="100" fill="#3A2A22"/><rect x="119" y="82" width="22" height="18" rx="4" fill="#3A2A22"/>
      <rect x="123" y="86" width="14" height="11" rx="2" fill="${v("lamp")?"#6E6E6E":"#FFF3B0"}"/>${v("lamp")?"":`<circle cx="130" cy="92" r="18" fill="#FFF3B0" opacity=".35"/>`}
      <rect y="194" width="400" height="66" fill="#D9B26F"/><path d="M0 240Q200 205 400 240V260H0Z" fill="#C9A060"/>
      <g fill="${v("bench")?"#3E6FA8":"#7A4A2A"}"><rect x="195" y="160" width="100" height="9" rx="3"/><rect x="195" y="172" width="100" height="9" rx="3"/><rect x="190" y="186" width="110" height="10" rx="3"/></g>
      <g fill="#2B2B2B"><rect x="200" y="196" width="6" height="22"/><rect x="284" y="196" width="6" height="22"/></g>
      ${v("heart")?`<path d="${starPath(212,170,13)}" fill="#E0A93B" stroke="#8A5A10" stroke-width="2"/>`:`<path d="${heartPath(212,168,13)}" fill="#C62828" stroke="#7A0F12" stroke-width="2"/>`}
      <path d="M270 184h30l-6 22h-20z" fill="${v("cape")?"#2E7D4F":"#B0202A"}"/>
      <g fill="none" stroke="#2B2B2B" stroke-width="3"><circle cx="332" cy="222" r="17"/><circle cx="384" cy="222" r="17"/><path d="M332 222l20-22h22l10 22M352 200l-4-8h-8M374 200l4-10h8"/></g>
      ${v("basket")?"":`<rect x="374" y="184" width="22" height="15" rx="3" fill="#B07A3E" stroke="#6B4520" stroke-width="2"/>`}
      <g fill="${v("flower")?"#F2C230":"#E77FA3"}"><circle cx="140" cy="232" r="7"/><circle cx="154" cy="226" r="7"/><circle cx="164" cy="238" r="7"/></g>
      <g fill="#FFF3B0"><circle cx="140" cy="232" r="2.5"/><circle cx="154" cy="226" r="2.5"/><circle cx="164" cy="238" r="2.5"/></g>`}},
  room:{name:"בחדר",diffs:{
    moon:[78,58,26],star:[160,40,18],pic:[326,52,24],mirror:[205,72,26],shade:[140,128,20],book:[78,112,16],
    bow:[52,170,16],mask:[282,148,20],blanket:[350,184,30],wings:[110,238,24],rug:[232,240,28]},
    draw(v,p){return `
      <rect width="400" height="200" fill="#31507A"/><rect y="196" width="400" height="64" fill="#B98A5A"/>
      <g fill="#F6D58A">${[[30,30],[250,24],[372,30],[300,100],[176,110]].map(([x,y])=>`<path d="${starPath(x,y,8)}"/>`).join("")}${v("star")?"":`<path d="${starPath(160,40,10)}"/>`}</g>
      <rect x="40" y="22" width="76" height="70" rx="6" fill="#1B2D4A" stroke="#E0A93B" stroke-width="5"/>
      ${v("moon")?`<circle cx="78" cy="58" r="17" fill="#FFF3B0"/>`:`<path d="M84 40a18 18 0 1 0 0 36a14 14 0 1 1 0-36z" fill="#FFF3B0"/>`}
      <rect x="300" y="28" width="52" height="48" rx="4" fill="#FFF9EE" stroke="#E0A93B" stroke-width="5"/>
      ${v("pic")?`<path d="${starPath(326,52,14)}" fill="#E0A93B"/>`:`<path d="${heartPath(326,52,13)}" fill="#C62828"/>`}
      <path d="M175 186V70a30 30 0 0 1 60 0V186Z" fill="#9FC3E3" stroke="${v("mirror")?"#A9A9A9":"#E0A93B"}" stroke-width="8"/>
      <path d="M190 160l30-60" stroke="#fff" stroke-width="4" opacity=".6"/>
      <rect x="30" y="118" width="96" height="6" fill="#7A4A2A"/>
      <g><rect x="40" y="96" width="10" height="22" fill="#B0202A"/><rect x="52" y="100" width="10" height="18" fill="#3E6FA8"/><rect x="66" y="94" width="12" height="24" fill="${v("book")?"#F2C230":"#3E8E5A"}"/><rect x="82" y="98" width="10" height="20" fill="#E77FA3"/></g>
      <rect x="126" y="150" width="28" height="46" fill="#7A4A2A"/><rect x="138" y="132" width="4" height="18" fill="#3A2A22"/>
      <path d="M126 134l6-18h16l6 18z" fill="${v("shade")?"#E77FA3":"#F2C230"}"/>
      <g fill="#9A6A3A"><circle cx="52" cy="190" r="18"/><circle cx="52" cy="164" r="13"/><circle cx="42" cy="153" r="5"/><circle cx="62" cy="153" r="5"/></g>
      <path d="M44 174l8 4 8-4-2 8-6-2-6 2z" fill="${v("bow")?"#3E6FA8":"#B0202A"}"/>
      <rect x="250" y="122" width="12" height="80" fill="#7A4A2A"/><rect x="250" y="160" width="140" height="36" rx="6" fill="#EFE3CF"/>
      <ellipse cx="282" cy="156" rx="24" ry="10" fill="#fff"/>
      <rect x="300" y="162" width="92" height="36" rx="6" fill="${v("blanket")?"#3E8E5A":"#B0202A"}"/>
      ${v("mask")?"":`<path d="M266 146q16-6 32 0q-2 8-9 7q-7-4-14 0q-7 1-9-7z" fill="#1A1A1A"/>`}
      ${v("wings")?"":`<g fill="#F3E2B8" stroke="#C9A060" stroke-width="2"><path d="M110 236l-30-14 8 18z"/><path d="M110 236l30-14-8 18z"/></g>`}
      <ellipse cx="232" cy="240" rx="56" ry="13" fill="${v("rug")?"#6A4FA3":"#B0202A"}" opacity=".85"/>`}}
};
let SD=null;
function spot(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">מצאו את ההבדלים 🔎</h2>
      <p>לגיבורים יש עיניים פקוחות – בדיוק כמו בסיפור! יש שתי תמונות כמעט זהות: נוגעים בכל מקום שבו משהו שונה.</p>
      ${levelPicker().replace(/גיל 3–4 · 10 שניות/,"גיל 3–4 · 4 הבדלים").replace(/גיל 5–6 · 8 שניות/,"גיל 5–6 · 6 הבדלים")}
      <div class="row" style="margin-top:10px"><button class="btn cta go" id="sdgo">מתחילים!</button></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  bindLevel(spot);
  document.getElementById("sdgo").onclick=()=>{sfxWin();
    const k=S.lvl==="s"?4:6;
    SD={scenes:["park","room"].map(id=>({id,set:shuffle(Object.keys(SCENES[id].diffs)).slice(0,k)})),s:0,found:new Set(),hints:0,miss:0,hint:null};sdDraw()};
}
function sdSVG(sc,p){
  const S2=SCENES[sc.id],act=new Set(sc.set),v=id=>p==="b"&&act.has(id);
  const marks=[...SD.found].map(id=>{const [x,y,r]=S2.diffs[id];return `<circle class="sd-found" cx="${x}" cy="${y}" r="${r}"/>`}).join("");
  const h=SD.hint&&!SD.found.has(SD.hint)?(()=>{const [x,y,r]=S2.diffs[SD.hint];return `<circle class="sd-hint" cx="${x}" cy="${y}" r="${r+6}"/>`})():"";
  return `<svg viewBox="0 0 400 260" data-p="${p}" role="img" aria-label="תמונה ${p==="a"?"ראשונה":"שנייה"}">${S2.draw(v,p)}<g class="mk">${marks}${h}</g></svg>`;
}
function sdDraw(){
  const sc=SD.scenes[SD.s],k=sc.set.length;
  app.innerHTML=`<div class="wrap" style="gap:10px">
    <div class="row" style="justify-content:space-between"><button class="btn ghost small" id="bk">→ לתפריט</button><span class="count">תמונה ${SD.s+1} / ${SD.scenes.length} · ${SCENES[sc.id].name}</span></div>
    <div class="dots" aria-label="הבדלים שנמצאו">${sc.set.map((_,i)=>`<i class="${i<SD.found.size?"on":""}"></i>`).join("")}</div>
    <p class="goal">מצאו <span class="n">${k}</span> הבדלים</p>
    <div class="sd-wrap"><div class="sd-panel"><span class="tag">1</span>${sdSVG(sc,"a")}</div><div class="sd-panel"><span class="tag">2</span>${sdSVG(sc,"b")}</div></div>
    <div class="row"><button class="btn ghost small" id="hint">💡 רמז (${SD.hints})</button></div>
    <div id="fb"></div>
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  document.getElementById("hint").onclick=()=>{const left=sc.set.filter(id=>!SD.found.has(id));if(!left.length)return;SD.hint=left[0];SD.hints++;sfxWhoosh();sdDraw()};
  app.querySelectorAll(".sd-panel svg").forEach(svg=>svg.addEventListener("click",e=>{
    const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=svg.getScreenCTM();if(!m)return;const q=pt.matrixTransform(m.inverse());
    sdTap(q.x,q.y,svg);
  }));
  if(SD.found.size===0&&SD.s===0)say(`מִצְאוּ ${k} הֶבְדֵּלִים בֵּין הַתְּמוּנוֹת`);
}
function sdTap(x,y,svg){
  const sc=SD.scenes[SD.s],D=SCENES[sc.id].diffs;
  let best=null,bd=1e9;
  sc.set.forEach(id=>{if(SD.found.has(id))return;const [dx,dy,r]=D[id];const d=Math.hypot(x-dx,y-dy);if(d<r+10&&d<bd){bd=d;best=id}});
  if(best){SD.found.add(best);if(SD.hint===best)SD.hint=null;sfxPair();
    if(SD.found.size>=sc.set.length){sdDraw();sfxWin();
      document.getElementById("fb").innerHTML=`<div class="fact"><b>מצאת את כל ההבדלים! 🎉</b> עיניים של ${g("גיבורה","גיבור")}.</div><div class="row" style="margin-top:12px"><button class="btn" id="nsc">${SD.s<SD.scenes.length-1?"לתמונה הבאה":"לתוצאה"}</button></div>`;
      stopTalk();TTS.t=setTimeout(()=>say("מָצָאתָ אֶת כָּל הַהֶבְדֵּלִים!".replace("מָצָאתָ",g("מָצָאת","מָצָאתָ"))),400);
      document.getElementById("nsc").onclick=()=>{SD.s++;SD.found=new Set();SD.hint=null;if(SD.s>=SD.scenes.length)sdEnd();else sdDraw()};
      return}
    sdDraw();
  }else{SD.miss++;sfxMiss();
    const t=document.createElementNS("http://www.w3.org/2000/svg","text");t.setAttribute("x",x-9);t.setAttribute("y",y+10);t.setAttribute("class","sd-x");t.textContent="✕";
    svg.querySelector(".mk").appendChild(t);setTimeout(()=>t.remove(),900)}
}
function sdEnd(){
  const h=SD.hints,need=2;
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${g("עיני נשר של גיבורה!","עיני נשר של גיבור!")}</h2>
      <p style="font-size:20px">${esc(N())} ${g("מצאה","מצא")} את כל ההבדלים בשתי התמונות${h?`, עם ${h} רמזים`:" – בלי אף רמז"}!</p>
      ${h<=need?"":tryAgain(`כדי לזכות בקופון צריך למצוא הכול עם ${need} רמזים לכל היותר. עוד פעם?`)}
      <div class="row"><button class="btn" id="again">משחק חדש</button><button class="btn ghost" id="nx">לחידון</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1600);
  if(h<=need)winLater("ניצחון במצאו את ההבדלים 🔎");
  document.getElementById("again").onclick=spot;
  document.getElementById("nx").onclick=()=>go("quiz");
  bindOffer();
}

/* ===== חידון ===== */
function quizData(){
  const n=esc(N());
  return [
    {q:`מָה ${g("רָצְתָה","רָצָה")} ${n} בְּהַתְחָלָה?`,o:["גְּלִימָה אֲדֻמָּה מַבְרִיקָה","כּוֹבַע קַסָּמִים","אוֹפַנַּיִם חֲדָשִׁים","כֶּלֶב קָטָן"],
     fact:"גלימה אדומה ומבריקה – כמו בסרטים!"},
    {q:`מָה ${g("חִבְּרָה","חִבֵּר")} לְעַצְמ${g("ָהּ","וֹ")} כְּדֵי לְהַמְרִיא?`,o:["כְּנָפַיִם","בָּלוֹנִים","מִטְרִיָּה","חֶבֶל"],
     fact:"כנפיים – אבל הרגליים נשארו על הרצפה."},
    {q:`כְּמוֹ מִי ${g("נִסְּתָה","נִסָּה")} לְטַפֵּס עַל קִירוֹת?`,o:["כְּמוֹ עַכָּבִישׁ","כְּמוֹ חָתוּל","כְּמוֹ קוֹף","כְּמוֹ צִפּוֹר"],
     fact:"כמו עכביש שטווה קורים."},
    {q:"מָה הָיָה בַּחֲגוֹרָה?",o:["פָּנָס וַאֲזִקִּים","כַּדּוּר וּמַשְׁרוֹקִית","עוּגִיּוֹת","מַפְתְּחוֹת"],
     fact:"פנס ואזיקים – כדי לתפוס את ה\"רעים\". אבל מאומה לא קרה."},
    {q:`אֵיפֹה ${g("יָשְׁבָה","יָשַׁב")} ${n} ${g("עֲצוּבָה","עָצוּב")}?`,o:["עַל הַסַּפְסָל בַּגִּנָּה","בַּמִּטָּה","עַל הַגַּג","בָּאוֹטוֹ"],
     fact:`על הספסל בגינה, ליד האופניים.`},
    {q:"מָה קָרָה לַיֶּלֶד הַקָּטָן?",o:["נָפַל מֵהָאוֹפַנַּיִם","אִבֵּד כַּדּוּר","הָלַךְ לִישֹׁן","אָכַל גְּלִידָה"],
     fact:"הוא נפל מהאופניים ונחבל בברך."},
    {q:`מָה ${g("עָשְׂתָה","עָשָׂה")} ${n} כְּדֵי לַעֲזֹר?`,o:["הוֹשִׁיט יָד, חִיֵּךְ וְחִבֵּק","טָס לְעֶזְרָה","זָרַק קוּרֵי עַכָּבִישׁ","הָלַךְ הַבַּיְתָה"],
     fact:"יד מושטת, חיוך וחיבוק – בלי שום כוח מיוחד."},
    {q:"מָה הַכֹּחַ הֲכִי חָזָק בָּעוֹלָם?",o:["לֵב טוֹב","לָעוּף","שְׁרִירִים גְּדוֹלִים","מַסֵּכָה שְׁחוֹרָה"],
     fact:"לב טוב שפתוח תמיד לכולם 💛"}
  ];
}
let QZ={i:0,score:0};
function quiz(){
  const D=quizData();
  if(QZ.i>=D.length)return quizEnd(D.length);
  const d=D[QZ.i],opts=shuffle(d.o.map((t,i)=>({t,i})));
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <div class="progress">${D.map((_,k)=>`<i class="${k<QZ.i?"done":k===QZ.i?"now":""}"></i>`).join("")}</div>
    <section class="panel">
      <div class="row" style="justify-content:space-between;flex-wrap:nowrap"><h2 class="q">${d.q}</h2><button class="btn ghost" id="sp" aria-label="להקריא את השאלה">🔊</button></div>
      <div class="opts">${opts.map(o=>`<button class="opt textonly" data-i="${o.i}"><span>${o.t}</span></button>`).join("")}</div>
      <div id="fb"></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  document.getElementById("sp").onclick=()=>speakSeq([[d.q,...d.o]],null,true);
  let tries=0;
  app.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    if(b.disabled)return;
    const fb=document.getElementById("fb");
    if(b.dataset.i==="0"){
      if(tries===0)QZ.score++;
      b.classList.add("right");app.querySelectorAll(".opt").forEach(x=>x.disabled=true);
      fb.innerHTML=`<div class="fact"><b>כל הכבוד!</b> ${d.fact}</div><div class="row" style="margin-top:12px"><button class="btn" id="nq">${QZ.i<D.length-1?"לשאלה הבאה":"לתוצאה"}</button></div>`;
      sfxWin();stopTalk();TTS.t=setTimeout(()=>say("כל הכבוד! "+d.fact),900);
      document.getElementById("nq").onclick=()=>{QZ.i++;stopTalk();quiz()};
    }else{tries++;b.classList.add("wrong");b.disabled=true;fb.innerHTML=`<div class="fact no">כמעט! נסו שוב.</div>`;sfxFail();stopTalk();TTS.t=setTimeout(()=>say("כמעט! נסו שוב"),800)}
  });
}
function quizEnd(total){
  const s=QZ.score,need=5;
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${g("יודעת הכול!","יודע הכול!")}</h2>
      <p style="font-size:20px">${esc(N())} ${g("ענתה","ענה")} נכון בניסיון הראשון על <b>${s}</b> מתוך ${total} שאלות.</p>
      ${s>=need?"":tryAgain(`כדי לזכות בקופון צריך ${need} תשובות נכונות בניסיון הראשון. עוד פעם?`)}
      <div class="row"><button class="btn" id="again">עוד פעם</button><button class="btn ghost" id="nx">${g("לתעודת הגיבורה","לתעודת הגיבור")}</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1600);
  if(s>=need)winLater("ניצחון בחידון הסיפור 📖");
  document.getElementById("again").onclick=()=>{QZ={i:0,score:0};quiz()};
  document.getElementById("nx").onclick=()=>go("sheet");
  bindOffer();
}

/* ===== תעודת גיבור/ת על להדפסה (PDF בחינם) ===== */
function sheet(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel printbox" id="printbox">
      <div class="printrow">
        <img id="pvimg" class="pv" alt="תצוגה של הדף להדפסה">
        <div class="printtxt">
          <h2 class="q">🖨️ התעודה של ${esc(N())} – חינם</h2>
          <p>דף A4 עם השם ${S.photo?"והתמונה ":""}של ${esc(N())}: <b>לוח מעשים טובים</b> לשבוע – צובעים לב על כל מעשה טוב, ו<b>תרגול כתיבה</b> של השם באותיות גדולות. מתאים לתלות על המקרר.</p>
          ${S.photo?"":`<p class="note">רוצים את התמונה של ${esc(N())} בראש הדף? <label for="ph2" class="linkish">הוסיפו תמונה</label><input type="file" id="ph2" accept="image/*" hidden></p>`}
          <button class="btn cta" id="dl">הורדת הדף (PDF)</button>
          <p class="note" id="dlmsg" aria-live="polite"></p>
        </div>
      </div>
    </section>
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  bindPrint();
}
function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
function rrect(x,c,y,w,h,r){x.beginPath();x.moveTo(c+r,y);x.arcTo(c+w,y,c+w,y+h,r);x.arcTo(c+w,y+h,c,y+h,r);x.arcTo(c,y+h,c,y,r);x.arcTo(c,y,c+w,y,r);x.closePath()}
function heartOutline(x,cx,cy,s){x.beginPath();x.moveTo(cx,cy+s*.9);x.bezierCurveTo(cx-s*1.4,cy,cx-s*.8,cy-s*.9,cx,cy-s*.3);x.bezierCurveTo(cx+s*.8,cy-s*.9,cx+s*1.4,cy,cx,cy+s*.9);x.closePath();x.stroke()}
async function drawSheet(name,gender){
  const W=1240,H=1754,cv=document.createElement("canvas");cv.width=W;cv.height=H;
  const x=cv.getContext("2d"),G=(f,m)=>gender==="f"?f:m;
  try{await Promise.all(["700 70px Fredoka","600 40px Fredoka","700 30px Assistant","400 30px Assistant","700 120px 'Frank Ruhl Libre'"].map(f=>document.fonts.load(f)))}catch(e){}
  const HEAD='"Fredoka","Varela Round","Arial Hebrew",Arial,sans-serif',UI='"Assistant","Arial Hebrew",Arial,sans-serif',STORY='"Frank Ruhl Libre","David Libre","Times New Roman",serif';
  const [bg,kid,logo]=await Promise.all([loadImg("img/bg.jpg"),loadImg(S.photo||`img/${gender}-face.jpg`),loadImg("img/logo.png")]);
  const INK="#3A2418",SOFT="#6E5546",RED="#A3161E",GOLD="#E0A93B",LINE="#D9C39A";
  x.fillStyle="#fff";x.fillRect(0,0,W,H);
  if(bg){x.save();rrect(x,40,40,W-80,340,36);x.clip();x.drawImage(bg,0,bg.height*.3,bg.width,bg.height*.36,40,40,W-80,340);x.fillStyle="rgba(255,255,255,.45)";x.fillRect(40,40,W-80,340);x.restore()}
  x.strokeStyle=GOLD;x.lineWidth=5;rrect(x,40,40,W-80,340,36);x.stroke();
  if(kid){x.save();x.beginPath();x.arc(210,210,125,0,Math.PI*2);x.clip();x.drawImage(kid,0,0,kid.width,kid.height,85,85,250,250);x.restore();
    x.lineWidth=10;x.strokeStyle="#fff";x.beginPath();x.arc(210,210,128,0,Math.PI*2);x.stroke();x.lineWidth=6;x.strokeStyle=RED;x.beginPath();x.arc(210,210,136,0,Math.PI*2);x.stroke()}
  x.direction="rtl";x.textAlign="right";
  x.font=`600 34px ${HEAD}`;x.fillStyle=RED;x.fillText("✦ תעודה רשמית ✦",W-90,118);
  x.fillStyle=INK;x.font=`700 64px ${HEAD}`;
  x.fillText(name?`${name} – ${G("גיבורת על","גיבור על")}`:G("גיבורת על","גיבור על"),W-90,205,W-480);
  x.font=`400 34px ${UI}`;x.fillStyle=SOFT;
  x.fillText(G("של לב טוב: עוזרת, מחבקת ופותחת עיניים","של לב טוב: עוזר, מחבק ופותח עיניים"),W-90,268,W-480);
  x.fillText("תאריך: ______________",W-90,328);
  let y=455;
  x.fillStyle=INK;x.font=`600 42px ${HEAD}`;x.fillText("1. לוח המעשים הטובים שלי – צובעים לב על כל מעשה טוב",W-90,y,W-180);
  const days=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
  const cw=(W-180)/7;
  days.forEach((d,i)=>{const cx=W-90-cw*i-cw/2,top=y+40;
    x.strokeStyle=LINE;x.lineWidth=3;rrect(x,cx-cw/2+6,top,cw-12,330,20);x.stroke();
    x.fillStyle=SOFT;x.font=`700 30px ${UI}`;x.textAlign="center";x.fillText(d,cx,top+46);
    x.strokeStyle=RED;x.lineWidth=4;heartOutline(x,cx,top+120,34);heartOutline(x,cx,top+215,34);
    x.strokeStyle=LINE;x.lineWidth=2;x.beginPath();x.moveTo(cx-cw/2+22,top+300);x.lineTo(cx+cw/2-22,top+300);x.stroke();
  });
  x.textAlign="right";
  x.font=`400 28px ${UI}`;x.fillStyle=SOFT;x.fillText("רעיונות: עזרתי לסדר · חיבקתי חבר · שיתפתי · אמרתי תודה · הזמנתי חבר לשחק",W-90,y+410,W-180);
  y=960;
  x.fillStyle=INK;x.font=`600 42px ${HEAD}`;x.fillText("2. כותבים את השם שלי – עוברים על הקווים",W-90,y,W-180);
  const nm=name||"_____";let fs=150;x.font=`700 ${fs}px ${STORY}`;while(x.measureText(nm).width>W-260&&fs>60){fs-=6;x.font=`700 ${fs}px ${STORY}`}
  x.textAlign="center";
  [y+190,y+390].forEach(yy=>{x.strokeStyle=LINE;x.lineWidth=2;x.beginPath();x.moveTo(110,yy+10);x.lineTo(W-110,yy+10);x.stroke();
    x.setLineDash([10,9]);x.lineWidth=4;x.strokeStyle="#B9A27A";x.strokeText(nm,W/2,yy);x.setLineDash([])});
  x.strokeStyle=LINE;x.lineWidth=2;x.beginPath();x.moveTo(110,y+530);x.lineTo(W-110,y+530);x.stroke();
  x.font=`400 26px ${UI}`;x.fillStyle=SOFT;x.fillText("ובשורה הזו – כותבים לבד!",W/2,y+570);
  x.textAlign="right";
  const fy=H-170;x.fillStyle="#2B1526";rrect(x,40,fy,W-80,130,30);x.fill();
  if(logo){const lh=86,lw=logo.width*lh/logo.height;x.drawImage(logo,W-80-lw,fy+22,lw,lh)}
  x.fillStyle="#fff";x.font=`700 30px ${UI}`;x.textAlign="left";x.direction="rtl";
  x.fillText(`ספר אישי "${G("גיבורת על","גיבור על")}" – שחקו במשחק וזכו בקופון`,80,fy+56);
  x.font=`400 28px ${UI}`;x.fillStyle="#FBD9E8";
  x.direction="ltr";x.textAlign="left";x.fillText("booqli.ai",80,fy+100);const bw=x.measureText("booqli.ai").width;
  x.direction="rtl";x.textAlign="left";x.fillText(`וואטסאפ ${CONFIG.whatsapp}  ·`,80+bw+14,fy+100);
  return cv;
}
function showSaveImage(cv){
  const box=document.getElementById("printbox");if(!box)return;
  let w=document.getElementById("saveimg");
  if(!w){w=document.createElement("div");w.id="saveimg";w.className="saveimg";box.appendChild(w)}
  w.innerHTML=`<p><b>הדף מוכן!</b> בטלפון: לחיצה ארוכה על התמונה ← "שמירת תמונה", ואז מדפיסים מהגלריה. במחשב: קליק ימני ← "שמירת תמונה בשם".</p><img src="${cv.toDataURL("image/png")}" alt="התעודה להדפסה">`;
  w.scrollIntoView({behavior:"smooth",block:"start"});
}
let DL=null;
function bindPrint(){
  const b=document.getElementById("dl"),msg=document.getElementById("dlmsg"),pv=document.getElementById("pvimg");
  if(!b)return;
  drawSheet(S.name,S.g).then(cv=>{if(pv&&pv.isConnected)pv.src=cv.toDataURL("image/jpeg",.7)});
  const ph2=document.getElementById("ph2");
  if(ph2)ph2.onchange=()=>{const f=ph2.files&&ph2.files[0];if(!f)return;
    cropPhoto(f,()=>{sheet();setTimeout(()=>{const pb=document.getElementById("printbox");if(pb)pb.scrollIntoView({block:"center"})},100)},()=>{msg.textContent="לא הצלחנו לפתוח את התמונה. נסו JPG או PNG."})};
  const fname=`תעודת גיבור - ${S.name||"BOOQLI"}.pdf`;
  b.onclick=async()=>{
    msg.textContent="מכינים את הקובץ…";b.disabled=true;
    try{
      const cv=await drawSheet(S.name,S.g);
      if(!window.jspdf){showSaveImage(cv);msg.textContent="";b.disabled=false;return}
      const doc=new window.jspdf.jsPDF({unit:"mm",format:"a4"});
      doc.addImage(cv.toDataURL("image/jpeg",.92),"JPEG",0,0,210,297);
      const blob=doc.output("blob");
      DL=DL||(window.claude&&window.claude.use?await window.claude.use("downloads"):null);
      if(!DL&&!window.claude){
        const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=fname;
        document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
        msg.textContent="הקובץ ירד. הדפסה נעימה! 🖨️";b.disabled=false;return}
      if(!DL){showSaveImage(cv);msg.textContent="";b.disabled=false;return}
      const r=await DL.save({filename:fname,data:blob});
      msg.textContent=r.status==="saved"?"הקובץ ירד. הדפסה נעימה! 🖨️":"הקובץ נשלח.";
    }catch(e){
      const c=e&&e.code;
      msg.textContent=c==="declined"?"ההורדה בוטלה. אפשר ללחוץ שוב מתי שרוצים."
        :c==="rate_limited"?"רגע, חלון ההורדה כבר פתוח. נסו שוב בעוד כמה שניות."
        :"";
      if(!(c==="declined"||c==="rate_limited")){try{showSaveImage(await drawSheet(S.name,S.g))}catch(_){msg.textContent="אפשר לבקש את הדף בוואטסאפ "+CONFIG.whatsapp}}
    }
    b.disabled=false;
  };
}

/* ===== טיפים להורים ===== */
function parents(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel"><h2 class="q">טיפים להורים: גיבורים של לב טוב</h2>
      <p>ילדים בגן אוהבים גיבורי על. הסיפור לוקח את האהבה הזו ומכוון אותה לכוח האמיתי: לשים לב לאחרים ולעזור. הנה איך להמשיך את זה בבית – וגם לתרגל אותיות בדרך.</p></section>
    <div class="why">
      <article><h3>למה זה חשוב</h3><ul>
        <li>כבר פעוטות בני שנה וחצי עוזרים מעצמם למבוגר שמתקשה – למשל מרימים חפץ שנפל – בלי שביקשו מהם ובלי פרס (Warneken ו-Tomasello, 2006). הנטייה לעזור כבר שם, ואפשר לטפח אותה.</li>
        <li>במחקר עם ילדים בני 3–6, כשהזמינו אותם "להיות עוזרים" (ולא רק "לעזור"), הם עזרו יותר (Bryan ועמיתים, 2014). מילים שמחברות עזרה לזהות של הילד עובדות.</li>
        <li>ילדים בני 4 ו-6 שדמיינו את עצמם כגיבור אהוב התמידו יותר במשימה משעממת (White ועמיתים, 2017). משחק גיבורים הוא כלי, לא רק תחפושת.</li></ul></article>
      <article><h3>לב טוב: מה עושים בבית</h3><ul>
        <li><b>שמים שם לרגש:</b> "נראה לי שהוא עצוב כי הגלידה נפלה". ילד שמזהה רגש יודע איך לעזור.</li>
        <li><b>מדברים על זהות:</b> "את עוזרת אמיתית" / "אתה חבר טוב" – במקום רק "תודה שעזרת".</li>
        <li><b>תפקידים קטנים:</b> להשקות עציץ, להביא חיתול לאח, לסדר את השולחן.</li>
        <li><b>לוח מעשים טובים:</b> בתעודה להדפסה יש לוח לשבוע – צובעים לב על כל מעשה טוב.</li></ul></article>
      <article><h3>משחק גיבורים – בלי מכות</h3><ul>
        <li>משחק דמיון של גיבורים הוא חלק רגיל מהגיל. אפשר להצטרף ולשאול: "את מי הגיבור מציל היום?"</li>
        <li>אם המשחק נהיה מכות – עוצרים בעדינות ומכוונים למשימת עזרה: "בוא נציל את הדובי שנתקע".</li>
        <li>כמו בסיפור: הגלימה כיפית, אבל הכוח האמיתי הוא הלב.</li></ul></article>
      <article><h3>אותיות בגן חובה</h3><ul>
        <li>דוח מקיף של ה-National Early Literacy Panel (2008) מצא שהיכרות עם אותיות ומודעות לצלילים בגיל הגן קשורות לקריאה מאוחרת יותר.</li>
        <li><b>מתחילים מהשם:</b> האות הראשונה בשם היא האות הכי אהובה. במשחק יש שאלה עם השם של הילד, ובתעודה – תרגול כתיבה של השם.</li>
        <li><b>צליל ראשון:</b> "דּ-דּ-דּג – באיזו אות מתחילה?". משחק קצר באוטו או בתור.</li>
        <li>בלי לחץ: חמש דקות של משחק עדיפות על שעה של "שיעורים".</li></ul></article>
      <article><h3>מה מתאים לאיזה גיל</h3><ul>
        <li><b>3–4:</b> לזהות רגשות בסיסיים (שמח, עצוב, כועס, מפחד), עזרה פשוטה, למצוא אות זהה.</li>
        <li><b>5–6:</b> להבין למה חבר מרגיש כך, להציע פתרון, צליל ראשון במילה וקריאה של מילים קצרות.</li>
        <li>כל ילד בקצב שלו. במשחק יש שתי רמות – בחרו את זו שכיפית לילד.</li></ul></article>
      <article><h3>מתי להתייעץ</h3><ul>
        <li>אם הילד כמעט לא מגיב לרגשות של אחרים, מתקשה מאוד בקשר עם ילדים, או שהשפה שלו מדאיגה אתכם – שווה לשוחח עם הגננת ועם רופא או רופאת הילדים.</li>
        <li>אם לקראת כיתה א' קשה מאוד לזהות צלילים ואותיות, אפשר להתייעץ עם קלינאית תקשורת.</li></ul></article>
      <article><h3>שאלות לשיחה אחרי הקריאה</h3><ul>
        <li>מה ${g("ניסתה","ניסה")} ${esc(N())} לעשות כדי להיות ${g("גיבורה","גיבור")}? מה הצליח?</li>
        <li>איך הרגיש הילד שנפל? ואיך הוא הרגיש אחרי החיבוק?</li>
        <li>מתי ${g("את עזרת","אתה עזרת")} למישהו? ומתי מישהו עזר לך?</li>
        <li>איזה מעשה טוב נעשה מחר?</li></ul></article>
    </div>
    <section class="panel parents-safe"><h3 class="q" style="font-size:18px">🔒 משחק בטוח לילדים</h3><ul style="margin:0;padding-inline-start:18px;font-size:15px;line-height:1.6">
      <li>חלק מ-booqli Games, בחסות BOOQLI</li>
      <li>השימוש בכפוף למדיניות הפרטיות של האתר</li></ul></section>
    <section class="panel"><h3 class="q" style="font-size:18px">מקורות</h3><ul class="srcs" style="margin:0;padding-inline-start:18px;font-size:14px;line-height:1.6">
      <li><a href="https://www.mpg.de/532681/pressRelease20060302" target="_blank" rel="noopener">Warneken &amp; Tomasello (2006). Altruistic helping in human infants and young chimpanzees. Science (Max Planck)</a></li>
      <li><a href="https://www.srcd.org/news/want-young-child-help-or-be-helper-choice-words-matters" target="_blank" rel="noopener">Bryan, Master &amp; Walton (2014). "Helping" versus "being a helper". Child Development (SRCD)</a></li>
      <li><a href="https://experts.umn.edu/en/publications/the-batman-effect-improving-perseverance-in-young-children/" target="_blank" rel="noopener">White et al. (2017). Improving perseverance in young children. Child Development</a></li>
      <li><a href="https://info.fldoe.org/docushare/dsweb/Get/Rendition-13116/index.htm" target="_blank" rel="noopener">National Early Literacy Panel (2008). Developing Early Literacy – findings</a></li>
    </ul><p class="note" style="margin-top:8px">המידע כללי ואינו מחליף ייעוץ מקצועי.</p></section>
    ${offerHTML()}
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  bindOffer();
}

/* ===== עריכת קופון וקישורים – רק לבעלת המשחק ===== */
const SKELETON_HEAD='<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.4 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>';
function buildPage(c){return SKELETON_HEAD+PAGE_TEMPLATE.replace("__CONFIG__",JSON.stringify(c).replace(/</g,"\\u003c"))+"</body></html>"}
let OWNER=null;
async function isOwner(){
  if(OWNER!==null)return OWNER;
  try{const u=window.claude&&window.claude.use?await window.claude.use("user"):null;OWNER=u?!!(await u.isOwner()):false}catch(e){OWNER=false}
  return OWNER;
}
async function addOwnerBar(){
  if(!(await isOwner()))return;
  const host=document.getElementById("ownerslot");if(!host)return;
  host.innerHTML='<div class="ownerbar"><button class="btn ghost" id="openSettings">עריכת קופון וקישורים</button></div><p class="note">הכפתור הזה מופיע רק לך. הורים לא רואים אותו.</p>';
  document.getElementById("openSettings").onclick=settings;
}
function settings(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="settings">
      <h2>עריכת קופון וקישורים</h2>
      <p class="hint">השינויים נשמרים במשחק עצמו, וכל מי שיפתח את הקישור יראה אותם.</p>
      <label>קוד הקופון<input id="s_coupon" value="${esc(CONFIG.coupon)}" maxlength="30"></label>
      <label>מה הקופון נותן<span class="hint">השורה הקטנה שמתחת לקוד</span><input id="s_text" class="rtl" value="${esc(CONFIG.couponText)}" maxlength="80"></label>
      <label>קישור לכפתור "להזמנת הספר"<input id="s_link" value="${esc(CONFIG.link)}" placeholder="https://"></label>
      <label>מספר וואטסאפ<input id="s_wa" value="${esc(CONFIG.whatsapp)}" placeholder="055-5549331" inputmode="tel"></label>
      <label>קישור למשחק<input id="s_game" value="${esc(CONFIG.gameLink||"")}" placeholder="https://"></label>
      <label>קישור לשחקן חוזר (נשלח בוואטסאפ)<input id="s_ret" value="${esc(CONFIG.returnLink||"")}" placeholder="https://"></label>
      <label>קישור ללוגו BOOQLI<input id="s_home" value="${esc(CONFIG.homeLink)}" placeholder="https://"></label>
      <div class="row"><button class="btn" id="s_save">שמירה</button><button class="btn ghost" id="s_cancel">ביטול</button></div>
      <p class="status" id="s_status" aria-live="polite"></p>
    </section></div>`;
  const st=document.getElementById("s_status");
  document.getElementById("bk").onclick=document.getElementById("s_cancel").onclick=()=>go("menu");
  document.getElementById("s_save").onclick=async()=>{
    const v=id=>document.getElementById(id).value.trim();
    const c={coupon:v("s_coupon"),couponText:v("s_text"),link:v("s_link"),homeLink:v("s_home"),whatsapp:v("s_wa"),gameLink:v("s_game"),returnLink:v("s_ret")};
    const bad=[["link","קישור הכפתור"],["homeLink","קישור הלוגו"]].find(([k])=>!/^https:\/\/[^\s"'<>]+$/.test(c[k]));
    st.className="status";
    if(bad){st.className="status err";st.textContent=`${bad[1]} צריך להתחיל ב-https:// ובלי רווחים.`;return}
    if(waIntl(c.whatsapp).length<11){st.className="status err";st.textContent="מספר הוואטסאפ לא נראה תקין.";return}
    if(!c.coupon){st.className="status err";st.textContent="כתבי קוד קופון.";return}
    const btn=document.getElementById("s_save");btn.disabled=true;st.textContent="שומרת…";
    try{
      const a=await window.claude.use("artifact");
      if(!a)throw{code:"not_granted"};
      await a.publish(buildPage(c));
      st.textContent="נשמר. המשחק נטען מחדש עם הפרטים החדשים.";
    }catch(e){
      btn.disabled=false;st.className="status err";
      const code=e&&e.code;
      st.textContent=code==="conflict"?"בדיוק נשמרה גרסה אחרת. העמוד נטען מחדש – נסי שוב אחרי הטעינה."
        :(code==="not_writer"||code==="not_granted"||code==="capability_disabled")?"בתצוגה הזו אין אפשרות לשמור. פתחי את המשחק מתוך החשבון שלך ב-claude.ai."
        :code==="rate_limited"?"נשמר יותר מדי פעמים ברצף. חכי דקה ונסי שוב."
        :"השמירה לא הצליחה. נסי שוב בעוד רגע.";
    }
  };
}

/* ===== ניווט ===== */
const ROUTES={menu:home,read,speed,letters,sort:sortGame,spot,quiz:()=>{QZ={i:0,score:0};quiz()},sheet,parents};
function go(r){if(location.hash.slice(1)!==r){location.hash=r}else route()}
function route(){
  const r=location.hash.slice(1);
  closePopup();stopTalk();if(BS){clearTimeout(BS.timer);clearTimeout(BS.next);clearInterval(BS.tick)}document.body.classList.remove("splash");
  if(r&&ROUTES[r]&&S.name){ROUTES[r]()}else splash();
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
route();
