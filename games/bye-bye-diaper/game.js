/* ===== הגדרות (נקראות מתוך העמוד) ===== */
const CONFIG_DEFAULT={"coupon": "", "couponText": "", "link": "https://games.booqli.ai/savta/?utm_source=booqli_games&utm_medium=book_game&utm_campaign=bye_bye_diaper", "homeLink": "https://games.booqli.ai/", "whatsapp": "055-5549331", "gameLink": "https://claude.ai/artifact/6M7X92rFxXigBGmiSNQYbo", "returnLink": ""};
let CONFIG=Object.assign({},CONFIG_DEFAULT);
try{CONFIG=Object.assign(CONFIG,JSON.parse(document.getElementById("booqli-config").textContent))}catch(e){}
const PAGE_TEMPLATE="<title>ביי ביי חיתול של BOOQLI</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Fredoka:wght@500;600;700&family=Assistant:wght@400;600;700&display=swap\">\n<link rel=\"stylesheet\" href=\"game.css\">\n<script id=\"booqli-config\" type=\"application/json\">__CONFIG__</script>\n<div class=\"wrap\">\n  <header class=\"brand\">\n    <a id=\"homeLink\" class=\"logo\" href=\"https://games.booqli.ai/\" target=\"_blank\" rel=\"noopener\"><img src=\"img/logo.png\" alt=\"BOOQLI\" width=\"150\" height=\"61\"></a>\n    <a id=\"ganLink\" class=\"gan\" href=\"https://wa.me/972555549331\" target=\"_blank\" rel=\"noopener\"><b>🏫 ספר אישי לכל ילד בגן</b><span>מחירים סיטונאיים לגנים ←</span></a>\n    <a id=\"waLink\" class=\"wa\" href=\"https://wa.me/972555549331\" target=\"_blank\" rel=\"noopener\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z\"/></svg><span><span class=\"lbl\">וואטסאפ </span><b id=\"waNum\" dir=\"ltr\">055-5549331</b></span></a>\n  </header>\n  <main id=\"app\"></main>\n  <footer>הסיפור \"ביי ביי חיתול!\" · כתיבה: שמש צור · עריכה לשונית: גילת עירון-בהר · © 2026 BOOQLI · וואטסאפ <span dir=\"ltr\">055-5549331</span></footer>\n</div>\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js\"></script>\n<script src=\"game.js\"></script>\n";
document.getElementById("homeLink").href=CONFIG.homeLink;
function waIntl(n){let d=String(n||"").replace(/\D/g,"");if(d.startsWith("0"))d="972"+d.slice(1);return d}
function waHref(){return "https://wa.me/"+waIntl(CONFIG.whatsapp)+"?text="+encodeURIComponent("היי BOOQLI, הגעתי מהמשחק ביי ביי חיתול 🐥")}
document.getElementById("waLink").href=waHref();
const ganHref=()=>"https://games.booqli.ai/kindergartens/?utm_source=booqli_games&utm_medium=book_game&utm_campaign=bye_bye_diaper#start";
{const gl=document.getElementById("ganLink");if(gl)gl.href=ganHref()}
document.getElementById("waNum").textContent=CONFIG.whatsapp;

/* ===== מצב ===== */
const S={name:"",g:"f",page:0,auto:false,photo:null};
try{const s=JSON.parse(localStorage.getItem("booqli-diaper")||"{}");if(s.name)S.name=s.name;if(s.g)S.g=s.g}catch(e){}
function save(){try{localStorage.setItem("booqli-diaper",JSON.stringify({name:S.name,g:S.g}))}catch(e){}}
const g=(f,m)=>S.g==="f"?f:m;
const N=()=>S.name||g("הַגִּבּוֹרָה","הַגִּבּוֹר");
const app=document.getElementById("app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const IMG=k=>`img/${S.g}-${k}.jpg`;

/* ===== הסיפור (לפי הספר "ביי ביי חיתול!") ===== */
function story(){
  const n=esc(N());
  return [
    {cover:true},
    {img:IMG("balloons"),stanzas:[[
      g(`${n} הִיא יַלְדָּה מְתוּקָה וּנְבוֹנָה –`,`${n} הוּא יֶלֶד נָבוֹן וּמָתוֹק –`),
      g("הִנֵּה גָּדְלָה לָהּ בְּעוֹד שָׁנָה,","הוּא כְּבָר יֶלֶד גָּדוֹל, זֶה לֹא צְחוֹק,"),
      "וְזֶה הַזְּמַן לְהִפָּרֵד גַּם מֵהַחִתּוּלִים",
      "וּלְהִתְפַּנּוֹת בַּשֵּׁרוּתִים, כְּמוֹ הַגְּדוֹלִים."]]},
    {img:IMG("kitten"),stanzas:[[
      `"${n} ${g("אֲהוּבָה","אָהוּב")}", אוֹמֶרֶת אִמָּא,`,
      `"הִגִּיעַ הַזְּמַן לָלֶכֶת קָדִימָה.`,
      g("אַתְּ בֶּאֱמֶת כְּבָר יַלְדָּה גְּדוֹלָה,","אַתָּה בֶּאֱמֶת כְּבָר יֶלֶד גָּדוֹל,"),
      g(`בְּלִי חִתּוּל אַתְּ לְגַמְרֵי יְכוֹלָה".`,`בְּלִי חִתּוּל אַתָּה לְגַמְרֵי יָכוֹל".`)]]},
    {img:IMG("branch"),stanzas:[[
      `${n} מְאוֹד ${g("רָצְתָה, אֲבָל חָשְׁשָׁה","רוֹצֶה, אֲבָל חוֹשֵׁשׁ")}`,
      g("שֶׁלֹּא תַּצְלִיחַ לְהִשָּׁאֵר יְבֵשָׁה.","שֶׁלֹּא יַצְלִיחַ לְהִשָּׁאֵר יָבֵשׁ."),
      `"וְאִם, אִמָּא, יֵרָטְבוּ לִי הַתַּחְתּוֹנִים`,
      `עוֹד לִפְנֵי שֶׁאַסְפִּיק לְהַגִּיעַ לַשֵּׁרוּתִים?"`]]},
    {img:"img/underpants.jpg",stanzas:[[
      "עוֹנָה אִמָּא עִם חִיּוּךְ עַל הַשְּׂפָתַיִם:",
      `"גַּם אִם יֵרָטְבוּ יוֹם אוֹ יוֹמַיִם,`,
      `${g("אַל תִּדְאֲגִי","אַל תִּדְאַג")}, נַחְלִיף בַּאֲחֵרִים.`,
      "קָנִיתִי הַרְבֵּה זוּגוֹת, אוּלַי עֶשְׂרִים."]]},
    {img:IMG("potty"),stanzas:[[
      `${g("בּוֹאִי","בּוֹא")}, ${n}, נוֹרִיד אֶת הַחִתּוּל,`,
      `וְאִם ${g("תַּרְגִּישִׁי","תַּרְגִּישׁ")} צֹרֶךְ בָּהוּל,`,
      `${g("תָּרוּצִי מִיָּד וְתִתְיַשְּׁבִי","תָּרוּץ מִיָּד וְתִתְיַשֵּׁב")} עַל הָאַסְלָה`,
      g(`אוֹ עַל הַסִּיר – שֶׁלָּךְ הִיא הַבְּחִירָה".`,`אוֹ עַל הַסִּיר – הַבְּחִירָה הִיא שֶׁלְּךָ".`)]]},
    {img:IMG("walk"),stanzas:[[
      "וְהִנֵּה הִגִּיעָה שַׁבָּת, הוֹלְכִים לְטִיּוּל,",
      `וְ${n}, ${g("כְּמוֹ גְּדוֹלָה","כְּמוֹ גָּדוֹל")} – בְּלִי הַחִתּוּל.`,
      "וּפִתְאוֹם, הַרְגָּשָׁה חֲמִימָה... מָה קָרָה?",
      `"אוֹי", ${g("אוֹמֶרֶת","אוֹמֵר")} ${n}, "נִרְטַבְתִּי נוֹרָא!"`]]},
    {img:IMG("sad"),stanzas:[[
      `${g("נֶעֶצְבָה","נֶעֱצַב")} ${n} ${g("וּבְעֵינָהּ","וּבְעֵינוֹ")} דִּמְעָה חַמָּה.`,
      `אַבָּא חִבֵּק ${g("אוֹתָהּ","אוֹתוֹ")} וְאִמָּא נִחֲמָה:`,
      g(`"לֹא נוֹרָא, ${n}, תַּאֲמִינִי בְּעַצְמֵךְ!`,`"לֹא נוֹרָא, ${n}, בְּעַצְמְךָ תַּאֲמִין!`),
      g(`כְּשֶׁתַּרְגִּישִׁי צֹרֶךְ תִּקְרְאִי לָנוּ וְלַשֵּׁרוּתִים נֵלֵךְ".`,`כְּשֶׁתַּרְגִּישׁ צֹרֶךְ תִּקְרָא לָנוּ וְנֵלֵךְ לַשֵּׁרוּתִים".`)]]},
    {img:IMG("sleep"),stanzas:[[
      "בַּלַּיְלָה הָרִאשׁוֹן – הַמִּטָּה נִרְטְבָה,",
      "בַּלַּיְלָה הַשֵּׁנִי – הַמִּטָּה נִרְטְבָה,",
      `אַךְ בַּלַּיְלָה הַשְּׁלִישִׁי כְּבָר הָיְתָה ${g("לָהּ","לוֹ")} תְּחוּשָׁה,`,
      `וְאָז לְאַבָּא ${g("קָרְאָה","קָרָא")}, בְּלִי טִפָּה שֶׁל בּוּשָׁה.`]]},
    {img:"img/bed.jpg",stanzas:[[
      `אַבָּא בָּא, לָקַח אֶת ${n} לַשֵּׁרוּתִים,`,
      `וּמֵאָז ${g("הִיא מְבִינָה",n+" מֵבִין")} מָה עוֹשִׂים.`,
      "מֵעַכְשָׁו בְּוַדָּאוּת לֹא יִהְיוּ הִסּוּסִים:",
      "בָּרֶגַע שֶׁמַּרְגִּישִׁים צֹרֶךְ, לַשֵּׁרוּתִים רָצִים!"]]},
    {img:IMG("dry"),stanzas:[[
      `הַבֹּקֶר ${g("הִתְעוֹרְרָה","הִתְעוֹרֵר")} ${n} בְּמִטָּה יְבֵשָׁה,`,
      `${g("רָאֲתָה","רָאָה")} אֶת הַחִתּוּל עַל הַשִּׁדָּה,`,
      `${g("וְנִפְרְדָה","וְנִפְרַד")} בְּחִיּוּךְ: "בַּי בַּי חִתּוּל,`,
      `אוּלַי תֵּצֵא לְטִיּוּל?"`]]},
    {end:true,stanzas:[["בַּי בַּי חִתּוּל!","וּמִי שֶׁמַּרְגִּישׁ צֹרֶךְ –","יוֹדֵעַ בְּדִיּוּק לְאָן רָצִים."]]}
  ];
}

/* ===== הקראה ===== */
const TTS={voice:null,ok:("speechSynthesis" in window)&&("SpeechSynthesisUtterance" in window),live:[],warned:false};
function pickVoice(){if(!TTS.ok)return;try{const v=speechSynthesis.getVoices()||[];TTS.voice=v.find(x=>/^(he|iw)/i.test(x.lang||""))||null}catch(e){TTS.voice=null}}
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
  /* מבטלים רק אם באמת מקריאים – ביטול מיותר גורם לכרום "לבלוע" את המשפט הבא */
  if(TTS.ok){try{if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();return true}}catch(e){}}
  return false}
/* מספרים נקראים כמילים בעברית (חלק מהמכשירים מקריאים ספרות באנגלית) */
const NUM_F=["אפס","אחת","שתיים","שלוש","ארבע","חמש","שש","שבע","שמונה","תשע","עשר","אחת עשרה","שתים עשרה","שלוש עשרה","ארבע עשרה","חמש עשרה","שש עשרה","שבע עשרה","שמונה עשרה","תשע עשרה","עשרים"];
const NUM_M=["אפס","אחד","שניים","שלושה","ארבעה","חמישה","שישה","שבעה","שמונה","תשעה","עשרה","אחד עשר","שנים עשר","שלושה עשר","ארבעה עשר","חמישה עשר","שישה עשר","שבעה עשר","שמונה עשר","תשעה עשר","עשרים"];
const MASC=/^(ו?ה?)(נר|נרות|בלון|בלונים|חבר|חברים|זוג|זוגות|קלף|קלפים|ילד|ילדים|קאפקייקס|כוכב|כוכבים|צעצוע|צעצועים|תחתון|תחתונים|יום|ימים|לילה|לילות|ניסיון|ניסיונות|תור|תורות)$/;
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
const clean=t=>numsToWords(t.replace(/<[^>]+>/g,"").replace(/[־]/g," ").replace(/[\p{Extended_Pictographic}\uFE0F]/gu,""));
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
    const it=items[k++],u=new SpeechSynthesisUtterance(clean(it.l));
    u.lang="he-IL";if(TTS.voice)u.voice=TTS.voice;u.rate=.8;
    /* שומרים הפניה למשפט – אחרת כרום לפעמים "שוכח" אותו באמצע וההקראה נעצרת */
    TTS.live.push(u);if(TTS.live.length>6)TTS.live.shift();
    let fired=false,began=false;const t0=Date.now();
    const after=()=>{if(fired||id!==talkId)return;fired=true;clearTimeout(TTS.wd);TTS.t=setTimeout(next,it.gap)};
    u.onstart=()=>{began=true;clearTimeout(TTS.wd)};
    u.onend=()=>{if(Date.now()-t0>250)began=true;after()};
    u.onerror=e=>{const er=e&&e.error;if(er&&er!=="interrupted"&&er!=="canceled"&&byUser)ttsHelp();after()};
    try{speechSynthesis.resume();speechSynthesis.speak(u)}catch(e){if(byUser)ttsHelp();return}
    /* אם תוך 3 שניות לא התחילה הקראה – כנראה שהמכשיר חוסם, ומסבירים מה לעשות */
    clearTimeout(TTS.wd);TTS.wd=setTimeout(()=>{if(id===talkId&&!began&&!fired&&byUser)ttsHelp()},3000);
  };
  /* אחרי ביטול של הקראה קודמת – הפסקה קצרה, כי כרום מפיל משפט שנשלח מיד אחרי ביטול */
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
const sfxFlip=()=>tone([[900,.05,"sine"]]);
const sfxFlush=()=>tone([[700,.5,"sine",120]]);
const sfxParty=()=>tone([[523,.12],[523,.12],[523,.12],[659,.25],[587,.12],[659,.12],[784,.5]]);

/* ===== שמירת המשחק – כדי שיהיה קל לחזור אליו ===== */
const gameURL=()=>CONFIG.gameLink||location.href.split("#")[0];
const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent),inApp=/FBAN|FBAV|Instagram|FB_IAB/i.test(navigator.userAgent);
function waShare(text){return "https://wa.me/?text="+encodeURIComponent(text)}
function saveText(){return `🐥 המשחק של ${N()} – "ביי ביי חיתול!" מ-BOOQLI\nלשחק שוב, בחינם ובלי הגבלה:\n${gameURL()}`}
function savedPhone(){try{return localStorage.getItem("booqli-diaper-phone")||""}catch(e){return ""}}
function intlPhone(v){let d=String(v||"").replace(/\D/g,"");if(d.startsWith("972"))d=d.slice(3);if(d.startsWith("0"))d=d.slice(1);return /^5\d{8}$/.test(d)?"972"+d:null}
const returnURL=()=>CONFIG.returnLink||gameURL();
function saveText2(){return `🐥 המשחק של ${N()} – "ביי ביי חיתול!" מ-BOOQLI\nלשחק שוב, בחינם ומתי שרוצים:\n${returnURL()}`}
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
      try{localStorage.setItem("booqli-diaper-phone",inp.value.trim())}catch(_){}
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
    <p class="demo-note">לדוגמה: ${g("יעלי","עומר")} נפרד${g("ת","")} מהחיתול</p>
    <ul class="offer-list">
      <li><b>השם של ${n}</b> לאורך כל העלילה – לא רק על הכריכה</li>
      <li><b>איורים אישיים:</b> ${n} ${g("מצוירת","מצויר")} בכל איור, מהעמוד הראשון ועד האחרון</li>
      <li><b>ספר מודפס באיכות גבוהה</b> – מתנה אמיתית ששומרים לשנים</li>
      <li>שולחים תמונה אחת – ואנחנו עושים את כל השאר</li>
      <li>הקדשה אישית מהמשפחה בעמוד הראשון</li>
      <li>בוחרים מתוך ספרי BOOQLI: יום הולדת, הולך/ת לגן, גיבור/ת על ועוד</li>
    </ul>
    <a class="btn offer-cta" href="${esc(CONFIG.link)}" target="_blank" rel="noopener">לבחירת ספר ל${n} ←</a>
    <a class="wa-line" href="${esc(waHref())}" target="_blank" rel="noopener">שאלות? כתבו לנו בוואטסאפ <b dir="ltr">${esc(CONFIG.whatsapp)}</b></a>
    <a class="ganbox" href="${esc(ganHref())}" target="_blank" rel="noopener"><span class="gi" aria-hidden="true">🏫</span><span><b>גננות וועדי הורים:</b> ספר אישי לכל ילד בגן, במחירים סיטונאיים מעולים. <u>להזמנה לכל הגן ←</u></span></a>
  </section>`;
}
function bindOffer(){
  app.querySelectorAll(".playwin").forEach(b=>b.onclick=()=>go(b.dataset.go));bindSave();
  const b=document.getElementById("copy");if(!b)return;
  b.onclick=()=>{const t=CONFIG.coupon;
    const done=()=>{b.textContent="הועתק";setTimeout(()=>b.textContent="העתקה",1800)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(document.getElementById("cc"));const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent="מסומן – העתיקו"};
    try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}};
}

/* ===== חלון קופץ עם הקופון – מופיע בכל ניצחון ===== */
let POP=null;
function couponPopup(title){
  closePopup();
  const n=esc(N());
  POP=document.createElement("div");POP.className="pop";
  POP.innerHTML=`<div class="pop-card" role="dialog" aria-modal="true" aria-labelledby="popT">
    <button type="button" class="pop-x" id="popX" aria-label="סגירה">✕</button>
    <div class="confetti" aria-hidden="true">${["🎉","⭐","🎈","✨","🐥","🌈","🎉","⭐","🎈","✨"].map((c,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%5)*.12}s">${c}</i>`).join("")}</div>
    <img class="kidthumb hi" src="${kidPic()}" alt="">
    <p class="pop-kick">${esc(title)}</p>
    <h2 id="popT">${g("ניצחת","ניצחת")}, ${n}! כל הכבוד! 🏆</h2>
    <p>🎁 יש גם ספרים מודפסים ש${n} ${g("היא הגיבורה","הוא הגיבור")} שלהם – עם השם ${g("שלה","שלו")} לאורך כל העלילה, איורים אישיים בכל עמוד, מודפס באיכות גבוהה</p>
    <a class="btn offer-cta" href="${esc(CONFIG.link)}" target="_blank" rel="noopener">לבחירת ספר ל${n} ←</a>
    <a class="btn sv-wa" href="${esc((intlPhone(savedPhone())?"https://wa.me/"+intlPhone(savedPhone())+"?text=":"https://wa.me/?text=")+encodeURIComponent(`📚 ספר אישי מ-BOOQLI
להזמנת הספר: ${CONFIG.link}\n\n🐥 לשחק שוב במשחק: ${returnURL()}`))}" target="_blank" rel="noopener">📲 עסוקים עכשיו? שלחו לעצמכם את הקישור בוואטסאפ</a>
    <a class="wa-line" href="${esc(waHref())}" target="_blank" rel="noopener">שאלות? וואטסאפ <b dir="ltr">${esc(CONFIG.whatsapp)}</b></a>
    <button type="button" class="btn ghost" id="popK">להמשיך לשחק</button>
  </div>`;
  document.body.appendChild(POP);document.body.classList.add("popopen");
  const b=document.getElementById("pcopy")||{};
  b.onclick=()=>{const done=()=>{b.textContent="הועתק ✓";setTimeout(()=>{if(b.isConnected)b.textContent="העתקה"},1800)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(document.getElementById("pcc"));const x=getSelection();x.removeAllRanges();x.addRange(r);b.textContent="מסומן – העתיקו"};
    try{navigator.clipboard.writeText(CONFIG.coupon).then(done,sel)}catch(e){sel()}};
  document.getElementById("popX").onclick=document.getElementById("popK").onclick=closePopup;
  POP.onclick=e=>{if(e.target===POP)closePopup()};
  (document.getElementById("pcopy")||document.getElementById("popK")).focus({preventScroll:true});
}
function closePopup(){if(POP){POP.remove();POP=null;document.body.classList.remove("popopen")}}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePopup()});
function winLater(title){setTimeout(()=>{if(document.body.contains(app))couponPopup(title)},1100)}
const tryAgain=t=>`<p class="needwin">🏆 ${t}</p>`;
function videoHTML(){return `<div class="vid"><video controls playsinline preload="metadata" poster="img/video-poster.jpg"><source src="video/demo.mp4" type="video/mp4"></video></div>`}

/* ===== פתיחה ===== */
function splash(){
  stopTalk();document.body.classList.add("splash");
  app.innerHTML=`<section class="page splashpage"><div class="page-inner">
    <p class="kicker">BOOQLI מזמינה אתכם להיפרד מהחיתול</p>
    <h1 class="title-story big" id="ttl"></h1>
    <p class="lede">סיפור עם הקראה, חידון, משחקים וטבלת מדבקות – והגיבור של הסיפור הוא הילד שלכם.</p>
    <div class="namebox">
      <label for="nm">איך קוראים לגיבור או לגיבורה?</label>
      <input id="nm" maxlength="14" autocomplete="off" placeholder="כתבו כאן שם" value="${esc(S.name)}">
      <div class="seg" role="group" aria-label="בן או בת">
        <button type="button" id="gf" aria-pressed="${S.g==="f"}">בת</button>
        <button type="button" id="gm" aria-pressed="${S.g==="m"}">בן</button>
      </div>
      <div class="photobox" id="photobox"></div>
      <button class="btn cta go" id="start">יאללה, מתחילים!</button>
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
  const upd=()=>{S.name=nm.value.trim();save();ttl.textContent=(S.name||"___")+" אוֹמֵר בַּי בַּי לַחִתּוּל";if(S.g==="f")ttl.textContent=(S.name||"___")+" אוֹמֶרֶת בַּי בַּי לַחִתּוּל";document.getElementById("need").hidden=true};
  nm.oninput=upd;upd();
  const setG=x=>{S.g=x;save();upd();document.getElementById("gf").setAttribute("aria-pressed",x==="f");document.getElementById("gm").setAttribute("aria-pressed",x==="m")};
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
function loadPhoto(file){
  const err=m=>{drawPhotoBox();const d=document.querySelector(".photoopt");if(d)d.open=true;const e=document.getElementById("pherr");if(e){e.hidden=false;e.textContent=m}};
  if(!/^image\//.test(file.type||"image/")){err("זה לא נראה כמו קובץ תמונה. נסו תמונה אחרת.");return}
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{
    const side=Math.min(img.naturalWidth,img.naturalHeight);
    const sx=(img.naturalWidth-side)/2,sy=Math.max(0,Math.min(img.naturalHeight-side,img.naturalHeight*0.38-side/2));
    const c=document.createElement("canvas");c.width=c.height=360;
    c.getContext("2d").drawImage(img,sx,sy,side,side,0,0,360,360);
    URL.revokeObjectURL(url);
    try{S.photo=c.toDataURL("image/jpeg",.85)}catch(e){S.photo=null}
    drawPhotoBox();
  };
  img.onerror=()=>{URL.revokeObjectURL(url);err("לא הצלחנו לפתוח את התמונה. נסו תמונה אחרת (JPG או PNG).")};
  img.src=url;
}
function kidBadge(cls){return S.photo?`<figure class="kidbadge ${cls||""}"><img src="${S.photo}" alt="${esc(N())}"><figcaption>${esc(N())}</figcaption></figure>`:""}
const kidPic=()=>S.photo||`img/${S.g}-face.jpg`;

/* ===== תפריט ===== */
function home(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:16px">
  <section class="hello">
    ${S.photo?`<img class="kidthumb hi" src="${S.photo}" alt="">`:""}
    <h1>${g("שלום","שלום")} ${esc(N())}! ${g("מוכנה","מוכן")} להיפרד מהחיתול?</h1>
    <p>מה עושים קודם?</p>
  </section>
  ${saveHTML()}
  <nav class="menu" aria-label="מה עושים">
    <button class="card" data-go="read"><img src="${IMG("kitten")}" alt=""><span><b>קוראים את הספר</b><i>עם הקראה בקול</i></span></button>
    <button class="card" data-go="signals"><img src="${IMG("potty")}" alt=""><span><b>מה הגוף אומר?</b><i>משחק מהירות עם שעון</i></span></button>
    <button class="card" data-go="memory"><img src="img/underpants.jpg" alt=""><span><b>זיכרון תחתונים</b><i>מוצאים זוגות</i></span></button>
    <button class="card" data-go="quiz"><img src="${IMG("walk")}" alt=""><span><b>חידון הסיפור</b><i>מי זוכר מה קרה?</i></span></button>
    <button class="card" data-go="stickers"><img src="${IMG("dry")}" alt=""><span><b>טבלת מדבקות</b><i>+ גרסה להדפסה בחינם</i></span></button>
    <button class="card" data-go="parents"><img src="img/bed.jpg" alt=""><span><b>טיפים להורים</b><i>איך נפרדים בנחת</i></span></button>
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
  if(p.cover) body=`${kidBadge("big")}<img src="img/${S.g}-book.png" alt="" style="width:min(70%,300px);margin:0 auto"><h2 class="title-story big">בַּי בַּי חִתּוּל!</h2><p class="verse">אוּלַי תֵּצֵא לְטִיּוּל?</p>`;
  else body=p.stanzas.map(st=>`<p class="verse">${st.join("<br>")}</p>`).join("");
  if(p.end) body+=`<p class="note">כתיבה: שמש צור · עריכה לשונית: גילת עירון-בהר</p>`;
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
  document.getElementById("au").onclick=()=>{S.auto=!S.auto;stopTalk();read();if(S.auto)autoPlay()};
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
function pageLines(p){return p.cover?[["בַּי בַּי חִתּוּל!",`${N()}, אוּלַי תֵּצֵא לְטִיּוּל?`]]:p.stanzas}
function autoPlay(){
  const P=story();
  speakSeq(pageLines(P[S.page]),()=>{
    if(!S.auto)return;
    if(S.page<P.length-1){TTS.t=setTimeout(()=>{if(!S.auto)return;S.page++;read();window.scrollTo({top:0,behavior:"smooth"});autoPlay()},2200)}
    else{S.auto=false;read()}
  },true);
}

/* ===== משחק "מה הגוף אומר?" – משחק מהירות עם טיימר ===== */
const CAT={
  bath:{ic:"🚽",lab:"לַשֵּׁרוּתִים",asks:[["אֲנִי צְרִיכָה לַשֵּׁרוּתִים!","אֲנִי צָרִיךְ לַשֵּׁרוּתִים!"],["מַרְגִּישָׁה צֹרֶךְ!","מַרְגִּישׁ צֹרֶךְ!"],["אֲנִי צְרִיכָה לְהִתְפַּנּוֹת!","אֲנִי צָרִיךְ לְהִתְפַּנּוֹת!"],["אוֹי, זֶה דָּחוּף!"]],teach:"כשמרגישים צורך – רצים לשירותים"},
  hungry:{ic:"🍎",lab:"לֶאֱכֹל",asks:[["אֲנִי רְעֵבָה!","אֲנִי רָעֵב!"]],teach:"כשרעבים – אוכלים"},
  thirsty:{ic:"💧",lab:"לִשְׁתּוֹת",asks:[["אֲנִי צְמֵאָה!","אֲנִי צָמֵא!"]],teach:"כשצמאים – שותים"},
  tired:{ic:"🛏️",lab:"לִישֹׁן",asks:[["אֲנִי עֲיֵפָה!","אֲנִי עָיֵף!"]],teach:"כשעייפים – הולכים לישון"},
  cold:{ic:"🧥",lab:"לִלְבֹּשׁ מְעִיל",asks:[["קַר לִי!"]],teach:"כשקר – לובשים מעיל"},
  dirty:{ic:"🧼",lab:"לִשְׁטֹף יָדַיִם",asks:[["הַיָּדַיִם מְלֻכְלָכוֹת!"]],teach:"כשהידיים מלוכלכות – שוטפים אותן"},
  bored:{ic:"🧸",lab:"לְשַׂחֵק",asks:[["מְשַׁעֲמֵם לִי!"]],teach:"כשמשעמם – משחקים"}
};
const ROUND_MS=5000;
let BS=null;
let BEST=null;try{BEST=+localStorage.getItem("booqli-diaper-best")||null}catch(e){}
function bsDeck(){
  /* 10 סיבובים: 4 של שירותים (כל פעם במשפט אחר) ו-6 אחרים, בלי שתי שאלות שירותים ברצף */
  const bath=shuffle(CAT.bath.asks).map(a=>({k:"bath",a}));
  const other=shuffle(["hungry","thirsty","tired","cold","dirty","bored"]).map(k=>({k,a:CAT[k].asks[0]}));
  const out=[];let o=0,t=0;
  const pattern=shuffle([0,1,2,3,4,5,6,7,8,9]).slice(0,4).sort((x,y)=>x-y);
  /* מפזרים את שאלות השירותים כך שלא יהיו צמודות */
  const slots=[1,3,6,8];
  for(let i=0;i<10;i++)out.push(slots.includes(i)?bath[t++]:other[o++]);
  return out;
}
function signals(){
  stopTalk();
  BS={deck:bsDeck(),i:0,dry:0,res:[],times:[],timer:null,next:null,tick:null};
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">מה הגוף אומר? ⏱️</h2>
      <p>${esc(N())} ${g("אומרת","אומר")} מה ${g("היא מרגישה","הוא מרגיש")}, והשעון מתחיל לרוץ!<br>לוחצים <b>הכי מהר שאפשר</b> על התשובה הנכונה. יש 5 שניות לכל שאלה.</p>
      ${BEST?`<p class="note">השיא שלך: ${(BEST/1000).toFixed(1)} שניות בממוצע</p>`:""}
      <div class="row"><button class="btn cta go" id="bsgo">מוכנים? מתחילים!</button></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  document.getElementById("bsgo").onclick=()=>{sfxWin();bsRound()};
}
function bsRound(){
  clearTimeout(BS.timer);clearTimeout(BS.next);clearInterval(BS.tick);
  if(BS.i>=BS.deck.length)return bsEnd();
  const R=BS.deck[BS.i],c=CAT[R.k],ask=S.g==="f"?R.a[0]:(R.a[1]||R.a[0]);
  const opts=shuffle([R.k,...shuffle(Object.keys(CAT).filter(x=>x!==R.k)).slice(0,3)]);
  const myR=BS.i;
  app.innerHTML=`<div class="wrap" style="gap:10px">
    <div class="row" style="justify-content:space-between"><button class="btn ghost small" id="bk">→ לתפריט</button><span class="count">שאלה ${BS.i+1} / ${BS.deck.length}</span></div>
    <div class="stars" aria-label="כוכבים">${BS.deck.map((_,j)=>`<span class="${BS.res[j]?"":"off"}">⭐</span>`).join("")}</div>
    <section class="bs-stage">
      <div class="bs-top">
        <img class="bs-kid" src="${kidPic()}" alt="${esc(N())}">
        <div class="bs-bubble" id="bub">${ask}</div>
        <div class="clock" id="clock" role="timer" aria-live="off"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="track"/><circle cx="22" cy="22" r="19" class="arc" id="arc"/></svg><b id="sec">5</b></div>
      </div>
      <div id="res" class="bs-res" hidden></div>
    </section>
    <div class="bs-opts">${opts.map(k=>`<button class="bs-opt" data-k="${k}"><span class="ic" aria-hidden="true">${CAT[k].ic}</span>${CAT[k].lab}</button>`).join("")}</div>
  </div>`;
  document.getElementById("bk").onclick=()=>{clearTimeout(BS.timer);clearTimeout(BS.next);clearInterval(BS.tick);go("menu")};
  const arc=document.getElementById("arc"),sec=document.getElementById("sec"),clock=document.getElementById("clock");
  const C=2*Math.PI*19;arc.style.strokeDasharray=C;
  const t0=performance.now();
  let over=false,lastS=5;
  BS.tick=setInterval(()=>{
    const left=Math.max(0,ROUND_MS-(performance.now()-t0));
    arc.style.strokeDashoffset=C*(1-left/ROUND_MS);
    const sl=Math.ceil(left/1000);
    if(sl!==lastS){lastS=sl;sec.textContent=sl;if(sl<=2&&sl>0){clock.classList.add("hurry");tone([[1200,.06,"square"]])}}
  },50);
  say(ask);
  const finish=(k,btn)=>{
    if(over||BS.i!==myR)return;over=true;
    clearTimeout(BS.timer);clearInterval(BS.tick);
    const took=performance.now()-t0,ok=k===R.k;
    app.querySelectorAll(".bs-opt").forEach(b=>{b.disabled=true;if(b.dataset.k===R.k)b.classList.add("right")});
    if(btn&&!ok)btn.classList.add("wrong");
    let html;
    if(ok){
      BS.res[BS.i]=true;BS.dry++;BS.times.push(took);
      const sp=took<1500?"⚡ בזק!":took<3000?"מהיר!":"הספקת!";
      html=`<span class="big">${(took/1000).toFixed(1)}</span><span><b>${sp}</b><br>${R.k==="bath"?g("יבשה! הגעת בזמן","יבש! הגעת בזמן"):"נכון!"}</span>`;
      R.k==="bath"?sfxFlush():sfxWin();
    }else{
      html=`<span class="big">${btn?"🙃":"⏰"}</span><span><b>${btn?"אופס!":"נגמר הזמן!"}</b><br>${c.teach}${R.k==="bath"?". לא נורא, מנסים שוב!":""}</span>`;
      sfxMiss();
    }
    const res=document.getElementById("res");res.innerHTML=html;res.className="bs-res "+(ok?"ok":"no");res.hidden=false;
    clock.classList.remove("hurry");clock.classList.add("stop");
    document.querySelectorAll(".stars span")[BS.i].className=ok?"":"off";
    stopTalk();
    BS.next=setTimeout(()=>{if(BS.i!==myR||location.hash.slice(1)!=="signals")return;BS.i++;bsRound()},ok?1400:2400);
  };
  BS.timer=setTimeout(()=>finish(null,null),ROUND_MS);
  app.querySelectorAll(".bs-opt").forEach(b=>b.onclick=()=>finish(b.dataset.k,b));
}
function bsEnd(){
  const n=BS.dry,t=BS.deck.length;
  const avg=BS.times.length?BS.times.reduce((x,y)=>x+y,0)/BS.times.length:null;
  const fast=BS.times.length?Math.min(...BS.times):null;
  let rec=false;
  if(avg&&n>=5&&(!BEST||avg<BEST)){BEST=avg;rec=true;try{localStorage.setItem("booqli-diaper-best",String(Math.round(avg)))}catch(e){}}
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${n>=9?g("אלופת המהירות!","אלוף המהירות!"):n>=6?"כל הכבוד!":"התחלה טובה!"}</h2>
      <div class="stars">${BS.deck.map((_,j)=>`<span class="${BS.res[j]?"":"off"}">⭐</span>`).join("")}</div>
      <div class="scoreline">
        <div><b>${n}/${t}</b><span>תשובות נכונות</span></div>
        ${avg?`<div><b>${(avg/1000).toFixed(1)}</b><span>שניות בממוצע</span></div><div><b>${(fast/1000).toFixed(1)}</b><span>הכי מהיר</span></div>`:""}
      </div>
      ${rec?`<p class="record">🏆 שיא חדש!</p>`:BEST?`<p class="note">השיא: ${(BEST/1000).toFixed(1)} שניות בממוצע. אפשר לשבור אותו?</p>`:""}
      ${n>=5?"":tryAgain("כדי לנצח צריך לפחות 5 כוכבים. עוד ניסיון?")}
      <div class="row"><button class="btn" id="again">עוד פעם – יותר מהר!</button><button class="btn ghost" id="st">לטבלת המדבקות</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1400);
  if(n>=5)winLater("ניצחון במשחק המהירות ⏱️");
  document.getElementById("again").onclick=signals;
  document.getElementById("st").onclick=()=>go("stickers");
  bindOffer();
}

/* ===== חידון ===== */
function quizData(){
  const n=esc(N());
  return [
    {q:"מִמָּה הִגִּיעַ הַזְּמַן לְהִפָּרֵד?",o:["הַחִתּוּל","הַכּוֹבַע","הַנַּעֲלַיִם","הַבֻּבָּה"],
     fact:"נכון! נפרדים מהחיתול ועוברים לתחתונים של גדולים."},
    {q:"כַּמָּה זוּגוֹת תַּחְתּוֹנִים קָנְתָה אִמָּא?",o:["אוּלַי עֶשְׂרִים","רַק אֶחָד","שְׁנַיִם","אַף לֹא אֶחָד"],
     fact:"הרבה תחתונים – כי בהתחלה לפעמים נרטבים, וזה בסדר גמור."},
    {q:"עַל מָה אֶפְשָׁר לָשֶׁבֶת כְּשֶׁצָּרִיךְ?",o:["עַל הָאַסְלָה אוֹ עַל הַסִּיר","עַל הַנַּדְנֵדָה","עַל הַשֻּׁלְחָן","עַל הַכַּדּוּר"],
     fact:`הבחירה היא של ${n} – אסלה או סיר, מה שנוח יותר.`},
    {q:"לְאָן הָלְכוּ בְּשַׁבָּת?",o:["לְטִיּוּל","לַיָּם","לַקִּרְקָס","לַסַּבְתָּא"],
     fact:"בטיול קרה משהו... ומשם לומדים מה עושים בפעם הבאה."},
    {q:"מָה אָמְרוּ אַבָּא וְאִמָּא אַחֲרֵי שֶׁנִּרְטַבְנוּ?",o:["לֹא נוֹרָא, תַּאֲמִינוּ בְּעַצְמְכֶם!","הוֹלְכִים הַבַּיְתָה","בּוֹאוּ נִקְנֶה גְּלִידָה","שָׁכַחְנוּ מַיִם"],
     fact:"חיבוק, ניחום ונסיון חדש. ככה לומדים."},
    {q:"מָה עוֹשִׂים כְּשֶׁמַּרְגִּישִׁים צֹרֶךְ?",o:["קוֹרְאִים לְאַבָּא אוֹ לְאִמָּא וְהוֹלְכִים לַשֵּׁרוּתִים","מְחַכִּים","מַמְשִׁיכִים לְשַׂחֵק","הוֹלְכִים לִישֹׁן"],
     fact:"בדיוק! ברגע שמרגישים צורך – לשירותים רצים!"},
    {q:"בְּאֵיזֶה לַיְלָה כְּבָר הָיְתָה תְּחוּשָׁה?",o:["בַּלַּיְלָה הַשְּׁלִישִׁי","בַּלַּיְלָה הָרִאשׁוֹן","בַּלַּיְלָה הַשֵּׁנִי","אַף פַּעַם"],
     fact:"בלילה הראשון והשני המיטה נרטבה, ובשלישי כבר הייתה תחושה. לאט לאט מצליחים."},
    {q:"אֵיפֹה הָיָה הַחִתּוּל בַּבֹּקֶר?",o:["עַל הַשִּׁדָּה","בַּמִּטָּה","עַל הָרֹאשׁ","בַּגַּן"],
     fact:`בַּי בַּי חִתּוּל! ${n} ${g("נפרדה","נפרד")} ממנו בחיוך.`}
  ];
}
let QZ={i:0,score:0};
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
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
  document.getElementById("sp").onclick=()=>say(d.q,null,true);
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
  const s=QZ.score;
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${g("יודעת הכול!","יודע הכול!")}</h2>
      <p style="font-size:20px">${esc(N())} ${g("ענתה","ענה")} נכון בניסיון הראשון על <b>${s}</b> מתוך ${total} שאלות.</p>
      ${s>=4?"":tryAgain("כדי לנצח צריך 4 תשובות נכונות בניסיון הראשון. עוד פעם?")}
      <div class="row"><button class="btn" id="again">עוד פעם</button><button class="btn ghost" id="mem">לזיכרון התחתונים</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1500);
  if(s>=4)winLater("ניצחון בחידון הסיפור 📖");
  document.getElementById("again").onclick=()=>{QZ={i:0,score:0};quiz()};
  document.getElementById("mem").onclick=()=>go("memory");
  bindOffer();
}

/* ===== זיכרון תחתונים ===== */
const PANTS={rocket:"טִיל",cars:"מְכוֹנִיּוֹת",dino:"דִּינוֹזָאוּר",teddy:"דֻּבִּי",unicorn:"חַד־קֶרֶן",digger:"מַחְפֵּר",bunny:"אַרְנָב",sun:"שֶׁמֶשׁ"};
let MEM=null;
function memory(){
  stopTalk();
  const keys=shuffle(Object.keys(PANTS)).slice(0,6);
  MEM={cards:shuffle([...keys,...keys]).map((k,i)=>({k,i,st:""})),open:[],moves:0,found:0,lock:false};
  drawMem();
}
function drawMem(){
  const done=MEM.found===6;
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">אמא קנתה הרבה תחתונים – מצאו את הזוגות!</h2>
      <div class="stats"><span>זוגות: ${MEM.found} / 6</span><span>תורות: ${MEM.moves}</span></div>
      <div class="grid">${MEM.cards.map(c=>`<button class="mc ${c.st}" data-i="${c.i}" aria-label="${c.st?PANTS[c.k]:"קלף הפוך"}"><div class="in"><div class="b"></div><div class="f"><img src="img/u-${c.k}.jpg" alt=""><span>${PANTS[c.k]}</span></div></div></button>`).join("")}</div>
    </section>
    ${done?`<section class="panel celebrate"><h2>כל התחתונים מסודרים!</h2><p>${esc(N())} ${g("סיימה","סיים")} ב-${MEM.moves} תורות.</p><div class="row"><button class="btn" id="again">משחק חדש</button><button class="btn ghost" id="qz">לחידון</button></div></section>${offerHTML()}`:""}
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  if(done){document.getElementById("again").onclick=memory;document.getElementById("qz").onclick=()=>go("quiz");bindOffer();sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}! מצאת את כל הזוגות`),1500);winLater("ניצחון בזיכרון התחתונים 🧩");return}
  app.querySelectorAll(".mc").forEach(el=>el.onclick=()=>flip(+el.dataset.i,el));
}
function flip(i,el){
  const c=MEM.cards[i];if(MEM.lock||c.st)return;
  c.st="up";el.classList.add("up");MEM.open.push(c);sfxFlip();
  if(MEM.open.length<2)return;
  MEM.moves++;MEM.lock=true;
  const [a,b]=MEM.open;
  if(a.k===b.k){setTimeout(()=>{a.st=b.st="ok";MEM.found++;MEM.open=[];MEM.lock=false;sfxPair();if(MEM.found<6)TTS.t=setTimeout(()=>say(PANTS[a.k]),500);drawMem()},450)}
  else setTimeout(()=>{sfxMiss();a.st=b.st="";MEM.open=[];MEM.lock=false;drawMem()},950);
}

/* ===== טבלת מדבקות (נשמרת רק במכשיר הזה) ===== */
const DAYS=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const STK=["⭐","🐥","🌈","🦋","🧸","🎈"];
let ST={pick:"⭐",grid:Array(7).fill(0).map(()=>Array(4).fill(""))};
try{const s=JSON.parse(localStorage.getItem("booqli-diaper-stickers")||"null");if(s&&s.grid)ST.grid=s.grid}catch(e){}
function saveST(){try{localStorage.setItem("booqli-diaper-stickers",JSON.stringify({grid:ST.grid}))}catch(e){}}
function stickers(){
  stopTalk();
  const total=ST.grid.flat().filter(Boolean).length;
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">טבלת המדבקות של ${esc(N())}</h2>
      <p>בכל פעם ש${esc(N())} ${g("מצליחה","מצליח")} בשירותים – ${g("בוחרת","בוחר")} מדבקה ומדביקים ביום של היום. עד 4 מדבקות ביום.</p>
      <div class="picker" role="group" aria-label="בחירת מדבקה">${STK.map(s=>`<button type="button" data-s="${s}" aria-pressed="${ST.pick===s}">${s}</button>`).join("")}</div>
      <div class="chart">${DAYS.map((d,di)=>`<div class="day"><b>${d}</b>${ST.grid[di].map((v,si)=>`<button type="button" class="slot ${v?"on":""}" data-d="${di}" data-s="${si}" aria-label="${d} מדבקה ${si+1}">${v}</button>`).join("")}</div>`).join("")}</div>
      <div class="stats"><span>מדבקות השבוע: ${total} / 28</span><button class="btn ghost small" id="clr">שבוע חדש</button></div>
      <p class="note" id="clrq" hidden>למחוק את כל המדבקות? <button class="btn small" id="clryes">כן, שבוע חדש</button></p>
      <p class="note">לוחצים שוב על מדבקה כדי להוריד אותה. הטבלה נשמרת רק במכשיר הזה.</p>
    </section>
    <section class="panel printbox" id="printbox">
      <div class="printrow">
        <img id="pvimg" class="pv" alt="תצוגה של הטבלה להדפסה">
        <div class="printtxt">
          <h2 class="q">🖨️ טבלה להדפסה – חינם</h2>
          <p>דף A4 עם השם ${S.photo?"והתמונה ":""}של ${esc(N())}, 7 ימים ו-5 מקומות למדבקות בכל יום. מדפיסים, תולים על המקרר או ליד השירותים ומדביקים מדבקות אמיתיות.</p>
          ${S.photo?"":`<p class="note">רוצים את התמונה של ${esc(N())} בראש הטבלה? <label for="ph2" class="linkish">הוסיפו תמונה</label><input type="file" id="ph2" accept="image/*" hidden></p>`}
          <button class="btn cta" id="dl">הורדת הטבלה (PDF)</button>
          <p class="note" id="dlmsg" aria-live="polite"></p>
        </div>
      </div>
    </section>
    ${total>=10?`<section class="panel celebrate"><h2>${total} הצלחות! 🎉</h2><p>${esc(N())} ${g("גדולה","גדול")} ממש. מגיע חיבוק ענק!</p></section>`:""}
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  app.querySelectorAll(".picker button").forEach(b=>b.onclick=()=>{ST.pick=b.dataset.s;stickers()});
  app.querySelectorAll(".slot").forEach(b=>b.onclick=()=>{
    const d=+b.dataset.d,s=+b.dataset.s;
    if(ST.grid[d][s]){ST.grid[d][s]="";sfxMiss()}else{ST.grid[d][s]=ST.pick;sfxPair();
      const c=ST.grid.flat().filter(Boolean).length;if(c===10||c===20||c===28)sfxParty()}
    saveST();stickers();
  });
  document.getElementById("clr").onclick=()=>{document.getElementById("clrq").hidden=false};
  bindPrint();
  document.getElementById("clryes").onclick=()=>{ST.grid=Array(7).fill(0).map(()=>Array(4).fill(""));saveST();stickers()};
}


/* ===== טבלת מדבקות להדפסה (PDF בחינם) ===== */
function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
function rrect(x,c,y,w,h,r){x.beginPath();x.moveTo(c+r,y);x.arcTo(c+w,y,c+w,y+h,r);x.arcTo(c+w,y+h,c,y+h,r);x.arcTo(c,y+h,c,y,r);x.arcTo(c,y,c+w,y,r);x.closePath()}
async function drawChart(name,gender){
  const W=1240,H=1754,cv=document.createElement("canvas");cv.width=W;cv.height=H;
  const x=cv.getContext("2d"),G=(f,m)=>gender==="f"?f:m;
  try{await Promise.all(["700 70px Fredoka","600 40px Fredoka","700 30px Assistant","400 30px Assistant"].map(f=>document.fonts.load(f)))}catch(e){}
  const HEAD='"Fredoka","Varela Round","Arial Hebrew",Arial,sans-serif',UI='"Assistant","Arial Hebrew",Arial,sans-serif';
  const [bg,kid,logo,u1,u2,u3]=await Promise.all([loadImg("img/bg.jpg"),loadImg(S.photo||`img/${gender}-dry.jpg`),loadImg("img/logo.png"),loadImg("img/u-rocket.jpg"),loadImg("img/u-unicorn.jpg"),loadImg("img/u-sun.jpg")]);
  x.fillStyle="#fff";x.fillRect(0,0,W,H);
  /* header band */
  if(bg){x.save();rrect(x,40,40,W-80,330,36);x.clip();x.drawImage(bg,0,bg.height*.18,bg.width,bg.height*.3,40,40,W-80,330);x.fillStyle="rgba(255,251,234,.55)";x.fillRect(40,40,W-80,330);x.restore()}
  x.strokeStyle="#EBD9A6";x.lineWidth=4;rrect(x,40,40,W-80,330,36);x.stroke();
  if(kid){x.save();x.beginPath();x.arc(205,205,125,0,Math.PI*2);x.clip();(S.photo?x.drawImage(kid,0,0,kid.width,kid.height,80,80,250,250):x.drawImage(kid,kid.width*.2,0,kid.width*.6,kid.width*.6,80,80,250,250));x.restore();
    x.lineWidth=10;x.strokeStyle="#fff";x.beginPath();x.arc(205,205,128,0,Math.PI*2);x.stroke();x.lineWidth=5;x.strokeStyle="#C33B79";x.beginPath();x.arc(205,205,135,0,Math.PI*2);x.stroke()}
  x.direction="rtl";x.textAlign="right";x.fillStyle="#3B2B33";
  x.font=`600 34px ${HEAD}`;x.fillStyle="#C33B79";x.fillText("בַּי בַּי חִתּוּל!",W-90,118);
  x.fillStyle="#3B2B33";x.font=`700 66px ${HEAD}`;
  const t=name?`טבלת המדבקות של ${name}`:"טבלת המדבקות של";
  x.fillText(t,W-90,200,W-470);
  if(!name){x.strokeStyle="#3B2B33";x.lineWidth=3;x.beginPath();x.moveTo(400,212);x.moveTo(380,212);x.lineTo(W-90-x.measureText(t).width-20,212);x.stroke()}
  x.font=`400 34px ${UI}`;x.fillStyle="#6F5A63";
  x.fillText(name?`בכל פעם ש${name} ${G("מצליחה","מצליח")} בשירותים – מדביקים מדבקה!`:"בכל פעם שמצליחים בשירותים – מדביקים מדבקה!",W-90,272,W-470);
  x.fillText("שבוע: ____________",W-90,330);
  /* grid */
  const days=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"],cols=5;
  const top=420,rowH=142,left=80,right=W-80,labW=200;
  const cw=(right-left-labW)/cols;
  days.forEach((d,i)=>{
    const y=top+i*rowH;
    x.fillStyle=i%2?"#FFFFFF":"#FFFBEA";rrect(x,left,y,right-left,rowH-14,22);x.fill();
    x.strokeStyle="#EBD9A6";x.lineWidth=3;rrect(x,left,y,right-left,rowH-14,22);x.stroke();
    x.fillStyle="#4E8A4C";x.font=`600 44px ${HEAD}`;x.textAlign="center";x.fillText(d,right-labW/2,y+(rowH-14)/2+15);
    for(let c=0;c<cols;c++){
      const cx=right-labW-cw*c-cw/2,cy=y+(rowH-14)/2;
      x.setLineDash([10,9]);x.strokeStyle="#E0A9C5";x.lineWidth=4;x.beginPath();x.arc(cx,cy,50,0,Math.PI*2);x.stroke();x.setLineDash([]);
    }
  });
  x.textAlign="right";
  /* prize */
  const py=top+7*rowH+24;
  x.fillStyle="#3B2B33";x.font=`600 40px ${HEAD}`;x.fillText("🎁 הפרס שלי בסוף השבוע:",W-90,py+30);
  x.strokeStyle="#3B2B33";x.lineWidth=3;x.beginPath();x.moveTo(90,py+40);x.lineTo(W-90-x.measureText("🎁 הפרס שלי בסוף השבוע:").width-20,py+40);x.stroke();
  [u1,u2,u3].forEach((u,i)=>{if(u){x.save();x.globalAlpha=.95;x.drawImage(u,90+i*100,py+60,88,88);x.restore()}});
  x.font=`400 28px ${UI}`;x.fillStyle="#6F5A63";x.fillText("טיפ: מדבקה על כל ניסיון – גם כשלא יצא כלום. העיקר לנסות!",W-90,py+120,W-480);
  /* footer */
  const fy=H-170;x.fillStyle="#2B1526";rrect(x,40,fy,W-80,130,30);x.fill();
  if(logo){const lh=86,lw=logo.width*lh/logo.height;x.drawImage(logo,W-80-lw,fy+22,lw,lh)}
  x.fillStyle="#fff";x.font=`700 30px ${UI}`;x.textAlign="left";x.direction="rtl";
  x.fillText(`ספרים אישיים מ-BOOQLI – הילד הוא הגיבור`,80,fy+56);
  x.font=`400 28px ${UI}`;x.fillStyle="#FBD9E8";
  x.direction="ltr";x.textAlign="left";x.fillText("games.booqli.ai",80,fy+100);const bw=x.measureText("games.booqli.ai").width;
  x.direction="rtl";x.textAlign="left";x.fillText(`וואטסאפ ${CONFIG.whatsapp}  ·`,80+bw+14,fy+100);
  return cv;
}

/* כשאין אפשרות להוריד קובץ: מציגים את הטבלה כתמונה לשמירה בלחיצה ארוכה */
function showSaveImage(cv){
  const box=document.getElementById("printbox");if(!box)return;
  let w=document.getElementById("saveimg");
  if(!w){w=document.createElement("div");w.id="saveimg";w.className="saveimg";box.appendChild(w)}
  w.innerHTML=`<p><b>הטבלה מוכנה!</b> בטלפון: לחיצה ארוכה על התמונה ← "שמירת תמונה", ואז מדפיסים מהגלריה. במחשב: קליק ימני ← "שמירת תמונה בשם".</p><img src="${cv.toDataURL("image/png")}" alt="טבלת המדבקות להדפסה">`;
  w.scrollIntoView({behavior:"smooth",block:"start"});
}
let DL=null;
async function bindPrint(){
  const b=document.getElementById("dl"),msg=document.getElementById("dlmsg"),pv=document.getElementById("pvimg");
  if(!b)return;
  drawChart(S.name,S.g).then(cv=>{if(pv&&pv.isConnected)pv.src=cv.toDataURL("image/jpeg",.7)});
  const ph2=document.getElementById("ph2");
  if(ph2)ph2.onchange=()=>{const f=ph2.files&&ph2.files[0];if(!f)return;
    const url=URL.createObjectURL(f),img=new Image();
    img.onload=()=>{const side=Math.min(img.naturalWidth,img.naturalHeight),sx=(img.naturalWidth-side)/2,sy=Math.max(0,Math.min(img.naturalHeight-side,img.naturalHeight*.38-side/2));
      const c=document.createElement("canvas");c.width=c.height=360;c.getContext("2d").drawImage(img,sx,sy,side,side,0,0,360,360);URL.revokeObjectURL(url);
      try{S.photo=c.toDataURL("image/jpeg",.85)}catch(e){}stickers();setTimeout(()=>{const pb=document.getElementById("printbox");if(pb)pb.scrollIntoView({block:"center"})},100)};
    img.onerror=()=>{URL.revokeObjectURL(url);msg.textContent="לא הצלחנו לפתוח את התמונה. נסו JPG או PNG."};img.src=url};
  b.onclick=async()=>{
    msg.textContent="מכינים את הקובץ…";b.disabled=true;
    try{
      const cv=await drawChart(S.name,S.g);
      if(!window.jspdf){showSaveImage(cv);msg.textContent="";b.disabled=false;return}
      const doc=new window.jspdf.jsPDF({unit:"mm",format:"a4"});
      doc.addImage(cv.toDataURL("image/jpeg",.92),"JPEG",0,0,210,297);
      const blob=doc.output("blob");
      DL=DL||(window.claude&&window.claude.use?await window.claude.use("downloads"):null);
      if(!DL&&!window.claude){ /* באתר רגיל (לא ב-claude.ai): הורדה רגילה של קובץ PDF */
        const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`טבלת מדבקות - ${S.name||"ביי ביי חיתול"}.pdf`;
        document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
        msg.textContent="הקובץ ירד. הדפסה נעימה! 🖨️";b.disabled=false;return}
      if(!DL){showSaveImage(cv);msg.textContent="";b.disabled=false;return}
      const r=await DL.save({filename:`טבלת מדבקות - ${S.name||"ביי ביי חיתול"}.pdf`,data:blob});
      msg.textContent=r.status==="saved"?"הקובץ ירד. הדפסה נעימה! 🖨️":"הקובץ נשלח.";
    }catch(e){
      const c=e&&e.code;
      msg.textContent=c==="declined"?"ההורדה בוטלה. אפשר ללחוץ שוב מתי שרוצים."
        :c==="rate_limited"?"רגע, חלון ההורדה כבר פתוח. נסו שוב בעוד כמה שניות."
        :c==="nolib"?"לא הצלחנו לטעון את יוצר ה-PDF. בדקו את החיבור לאינטרנט ונסו שוב."
        :"";
      if(!(c==="declined"||c==="rate_limited"||c==="nolib")){try{showSaveImage(await drawChart(S.name,S.g))}catch(_){msg.textContent="אפשר לבקש את הטבלה בוואטסאפ "+CONFIG.whatsapp}}
    }
    b.disabled=false;
  };
}

/* ===== טיפים להורים ===== */
function parents(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel"><h2 class="q">טיפים להורים: נפרדים מהחיתול בנחת</h2>
      <p>"ביי ביי חיתול!" מלווה את הילד בדיוק בשלבים שקורים באמת: רצון וחשש, תאונה בטיול, לילות רטובים – ובסוף הצלחה. הנה כמה דברים שעוזרים בדרך.</p></section>
    <div class="why">
      <article><h3>איך יודעים שהילד מוכן</h3><ul>
        <li>נשאר יבש שעתיים ויותר, או מתעורר יבש משנת צהריים.</li>
        <li>מראה עניין בשירותים, רוצה לחקות את הגדולים.</li>
        <li>אומר כשהחיתול רטוב או מלוכלך, או מתחבא כשהוא עושה.</li>
        <li>יכול להוריד ולהעלות מכנסיים לבד, ולהבין בקשה פשוטה.</li>
        <li>רוב הילדים מוכנים בין גיל שנתיים לשלוש, אבל כל ילד בקצב שלו.</li></ul></article>
      <article><h3>מתי להתחיל</h3><ul>
        <li>בתקופה רגועה – לא בדיוק כשנולד אח, עוברים דירה או מתחילים גן חדש.</li>
        <li>קיץ וימים חמים נוחים יותר: פחות שכבות בגדים.</li>
        <li>תאמו עם הגן או המטפלת, כדי שכולם יעבדו באותה שיטה.</li></ul></article>
      <article><h3>בימים הראשונים</h3><ul>
        <li>קוראים את הספר יחד כמה ימים לפני ההתחלה, ושוב בכל ערב.</li>
        <li>הילד בוחר תחתונים (כמו בספר – "אולי עשרים") וגם סיר או מקטין לאסלה.</li>
        <li>הושבה קבועה של 2–5 דקות: אחרי שקמים, אחרי ארוחות, לפני יציאה מהבית ולפני מקלחת.</li>
        <li>בגדים שקל להוריד. בלי סרבלים וכפתורים.</li>
        <li>שואלים מדי פעם "צריך לשירותים?" – אבל בלי להציק כל חמש דקות.</li></ul></article>
      <article><h3>כשיש "תאונה"</h3><ul>
        <li>כמו אבא ואמא בספר: חיבוק, "לא נורא", מחליפים ומנסים שוב.</li>
        <li>בלי כעס, בלי עונש ובלי בושה. בושה רק מאטה את התהליך.</li>
        <li>משתפים את הילד בהחלפה ("בוא נשים את התחתונים בכביסה") – בלי דרמה.</li>
        <li>בטיולים: בגדים להחלפה, שקית, ועצירה בשירותים לפני שיוצאים.</li></ul></article>
      <article><h3>הלילה – שלב נפרד</h3><ul>
        <li>יובש בלילה מגיע בדרך כלל אחרי היובש ביום, לפעמים חודשים ואפילו שנים אחר כך.</li>
        <li>מגן מזרן אטים, הליכה לשירותים לפני השינה, ושתייה טובה במהלך היום ופחות בשעה שלפני השינה.</li>
        <li>אפשר להשאיר אור לילה בדרך לשירותים, ולהזכיר לילד שמותר לקרוא לכם (כמו בספר).</li>
        <li>הרטבה בלילה עד גיל 5 נחשבת שכיחה ותקינה.</li></ul></article>
      <article><h3>חיזוקים</h3><ul>
        <li>משבחים את הניסיון ולא רק את התוצאה: "איזה יופי שהלכת לשבת!"</li>
        <li>טבלת מדבקות – יש אחת במשחק, וגם גרסה להדפסה בחינם עם שם הילד. מדבקה על כל הצלחה.</li>
        <li>ריקוד ניצחון קטן או מחיאות כפיים כשמורידים את המים.</li></ul></article>
      <article><h3>מתי להתייעץ עם רופא הילדים</h3><ul>
        <li>כאב או צריבה במתן שתן, או צורך תכוף מאוד.</li>
        <li>עצירות (יציאות קשות או כואבות) – זו סיבה נפוצה לקושי בגמילה.</li>
        <li>ילד שהיה גמול וחזר להירטב ביום לאורך זמן.</li>
        <li>הרטבה תכופה בלילה אחרי גיל 5 וחצי–6, או כל דבר שמדאיג אתכם.</li></ul></article>
      <article><h3>שאלות לשיחה אחרי הקריאה</h3><ul>
        <li>ממה ${esc(N())} בספר ${g("פחדה","פחד")}? גם לך יש פחד כזה?</li>
        <li>מה קרה בטיול, ומה אבא ואמא אמרו?</li>
        <li>אילו תחתונים היית רוצה? (עם טיל? שמש? חד־קרן?)</li>
        <li>מה עושים כשמרגישים צורך באמצע משחק?</li></ul></article>
    </div>
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
const ROUTES={menu:home,read,signals,quiz:()=>{QZ={i:0,score:0};quiz()},memory,stickers,parents};
function go(r){if(location.hash.slice(1)!==r){location.hash=r}else route()}
function route(){
  const r=location.hash.slice(1);
  closePopup();stopTalk();if(BS){clearTimeout(BS.timer);clearTimeout(BS.next);clearInterval(BS.tick)}document.body.classList.remove("splash");
  if(r&&ROUTES[r]&&S.name){ROUTES[r]()}else splash();
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
route();
