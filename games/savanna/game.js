/* ===== הגדרות (נקראות מתוך העמוד) ===== */
const CONFIG_DEFAULT={"coupon": "", "couponText": "", "link": "https://games.booqli.ai/savta/?book=savanna&utm_source=booqli_games&utm_medium=book_game&utm_campaign=savanna", "homeLink": "https://games.booqli.ai/", "whatsapp": "055-5549331", "gameLink": "https://claude.ai/artifact/XSvHEmwNkDcydb1Kbqk9Sb", "returnLink": ""};
let CONFIG=Object.assign({},CONFIG_DEFAULT);
try{CONFIG=Object.assign(CONFIG,JSON.parse(document.getElementById("booqli-config").textContent))}catch(e){}
const PAGE_TEMPLATE="<title>הסוואנה של BOOQLI</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Secular+One&family=Assistant:wght@400;600;700&display=swap\">\n<link rel=\"stylesheet\" href=\"game.css\">\n<script id=\"booqli-config\" type=\"application/json\">__CONFIG__</script>\n<div class=\"wrap\">\n  <header class=\"brand\">\n    <a id=\"homeLink\" class=\"logo\" href=\"https://games.booqli.ai/\" target=\"_blank\" rel=\"noopener\"><img src=\"img/logo.png\" alt=\"BOOQLI\" width=\"150\" height=\"61\"></a>\n    <a id=\"ganLink\" class=\"gan\" href=\"https://wa.me/972555549331\" target=\"_blank\" rel=\"noopener\"><b>🏫 ספר אישי לכל ילד בגן</b><span>מחירים סיטונאיים לגנים ←</span></a>\n    <a id=\"waLink\" class=\"wa\" href=\"https://wa.me/972555549331\" target=\"_blank\" rel=\"noopener\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z\"/></svg><span><span class=\"lbl\">וואטסאפ </span><b id=\"waNum\" dir=\"ltr\">055-5549331</b></span></a>\n  </header>\n  <main id=\"app\"></main>\n  <footer>הסיפור \"בסוואנה\" · כתיבה: שמש צור · עריכה לשונית: גילת עירון-בהר · © 2026 BOOQLI · וואטסאפ <span dir=\"ltr\">055-5549331</span></footer>\n</div>\n<script src=\"game.js\"></script>\n";
document.getElementById("homeLink").href=CONFIG.homeLink;
function waIntl(n){let d=String(n||"").replace(/\D/g,"");if(d.startsWith("0"))d="972"+d.slice(1);return d}
function waHref(){return "https://wa.me/"+waIntl(CONFIG.whatsapp)+"?text="+encodeURIComponent("היי BOOQLI, הגעתי מהמשחק בסוואנה 🦓")}
document.getElementById("waLink").href=waHref();
const ganHref=()=>"https://games.booqli.ai/kindergartens/?utm_source=booqli_games&utm_medium=book_game&utm_campaign=savanna#start";
{const gl=document.getElementById("ganLink");if(gl)gl.href=ganHref()}
document.getElementById("waNum").textContent=CONFIG.whatsapp;


/* ===== מצב ===== */
const S = {name:"", g:"f", page:0, auto:false};
try{const s=JSON.parse(localStorage.getItem("booqli-savanna")||"{}");if(s.name)S.name=s.name;if(s.g)S.g=s.g}catch(e){}
function save(){try{localStorage.setItem("booqli-savanna",JSON.stringify({name:S.name,g:S.g}))}catch(e){}}
const g=(f,m)=>S.g==="f"?f:m;
const N=()=>S.name||g("הַגִּבּוֹרָה","הַגִּבּוֹר");
const app=document.getElementById("app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const ANIMALS={
  zebra:{he:"זֶבְּרָה",img:"img/zebra.jpg"},
  giraffe:{he:"גִּ'ירָפָה",img:"img/giraffe.jpg"},
  monkey:{he:"קוֹף",img:"img/monkey.jpg"},
  hippo:{he:"הִיפּוֹפּוֹטָם",img:"img/hippo.jpg"},
  lion:{he:"אַרְיֵה",img:"img/lion.jpg"},
  elephant:{he:"פִּיל",img:"img/babyelephant.jpg"}
};

/* ===== הסיפור ===== */
function story(){
  const n=esc(N());
  return [
    {cover:true,lines:[]},
    {img:"img/bg.jpg",plain:true,stanzas:[
      ["זֶהוּ סִפּוּר הַרְפַּתְקָה שֶׁנִּכְתַּב תַּחַת עֵץ,","בַּסָּוָאנָה שֶׁבְּאַפְרִיקָה, בְּיוֹם קַיִץ לוֹהֵט."],
      ["הַסָּוָאנָה הִיא מְקוֹמָן הַטִּבְעִי שֶׁל הַחַיּוֹת,","שָׁם יֵשׁ לִשְׁמֹר שֶׁיִּהְיוּ מוּגָנוֹת,",
       `כְּשֶׁ${n} ${g("הִצְטָרְפָה","הִצְטָרֵף")} אֲלֵיהֶן לַמֶּרְחָב הַפִּרְאִי,`,`${g("הִיא גִּלְּתָה","הוּא גִּלָּה")} סוֹדוֹת וְתַגְלִיּוֹת מְעַנְיְנוֹת.`]]},
    {img:"img/zebra.jpg",stanzas:[
      [`בַּיּוֹם הָרִאשׁוֹן ${n} ${g("רָאֲתָה","רָאָה")} לַהֲקַת זֶבְּרוֹת,`,`שֶׁהִזְמִינוּ ${g("אוֹתָהּ","אוֹתוֹ")} לְהִצְטָרֵף לַמַּסְלוּל.`,
       `${g("הִיא צִיְּרָה עַל עַצְמָהּ","הוּא צִיֵּר עַל עַצְמוֹ")} פַּסִּים וְצוּרוֹת`,`${g("וְהִצְטָרְפָה","וְהִצְטָרֵף")} בְּשִׂמְחָה לַטִּיּוּל.`],
      [`בְּמַהֲלַךְ הַטִּיּוּל ${g("לָמְדָה","לָמַד")} ${n} בְּהִתְפַּעֲלוּת`,"שֶׁלַּזֶּבְּרוֹת יֵשׁ זִכָּרוֹן מְצֻיָּן","שֶׁמְּסַיֵּעַ לָהֶן לִמְצֹא בְּקַלּוּת","מַאֲגָרֵי מַיִם וּלְאַתֵּר אֶת מְזוֹנָן."]]},
    {img:"img/giraffe.jpg",stanzas:[
      [`אֶת הַגִּ'ירָפָה ${g("פָּגְשָׁה","פָּגַשׁ")} בַּיּוֹם הַשֵּׁנִי.`,"הִיא הִתְכּוֹפְפָה עִם צַוָּארָהּ הָאָרֹךְ",`לִלְחֹשׁ וּלְתָאֵר ${g("בְּאָזְנֶיהָ","בְּאָזְנוֹ")}`,"אֵיךְ תִּבְעַט בְּמִי שֶׁיְּנַסֶּה אוֹתָהּ לִטְרֹף."]]},
    {img:"img/monkey.jpg",stanzas:[
      [`בַּיּוֹם הַשְּׁלִישִׁי הִתְיַשֵּׁב ${g("לְיָדָהּ","לְיָדוֹ")}`,"קוֹף קָטָן עִם פַּרְוָה נְעִימָה וְחוּמָה,",`חָטַף ${g("לָהּ","לוֹ")} אֶת הַכּוֹבַע, שִׂחֵק וְצִחְקֵק,`,"כְּמוֹ לֵצָן שֶׁעָלָה לְהוֹפָעָה עַל בָּמָה."]]},
    {img:"img/hippo.jpg",stanzas:[
      [`בַּיּוֹם הָרְבִיעִי הָיְתָה לְ${n} עוֹד הַרְפַּתְקָה`,`${g("כְּשֶׁנִּתְקְלָה","כְּשֶׁנִּתְקַל")} בְּלַהֲקַת הִיפּוֹפּוֹטָמִים חֲבִיבָה.`,"בַּאֲגַם רָדוּד צָפוּ לָהֶם בַּהֲנָאָה",`עַד שֶׁהִבְחִינוּ ${g("בָּהּ צוֹפָה","בּוֹ צוֹפֶה")} בָּם בְּשַׁלְוָה.`],
      ["אוֹ אָז, הֵחֵלּוּ לִצְחֹק וְלִצְווֹחַ","וּלְהִתְגַּלְגֵּל מִצַּד אֶל צַד.",`${n} ${g("מָחֲאָה","מָחָא")} לָהֶם כַּפַּיִם בְּכָל הַכֹּחַ`,"עַד שֶׁהִתְעַיְּפוּ אֶחָד־אֶחָד."]]},
    {img:"img/lion.jpg",stanzas:[
      [`בְּיוֹם חֲמִישִׁי ${g("שָׁמְעָה","שָׁמַע")} ${n} נְהָמוֹת.`,`דֶּרֶךְ הַמִּשְׁקֶפֶת ${g("צָפְתָה","צָפָה")} בַּאֲרָיוֹת,`,"בְּגוּרִים וּבִלְבִיאוֹת","מִתְגַּלְגְּלִים, מְשַׂחֲקִים, מְפִיקִים קוֹלוֹת."]]},
    {img:"img/lion.jpg",pos:"right",stanzas:[
      ["כְּשֶׁהִגִּיעָה הַשָּׁעָה לֶאֱכֹל","הַלְּבִיאוֹת הִנִּיחוּ אֶת הַצַּיִד לִפְנֵי הַגּוּרִים.","הֵם אֵלֶּה שֶׁאָכְלוּ קֹדֶם כֹּל,","וְרַק בַּסּוֹף הִתְכַּבְּדוּ גַּם הַהוֹרִים."],
      ["שִׁתּוּף פְּעֻלָּה וַהֲגָנָה הֲדָדִית","הֵם חֵלֶק הֶכְרֵחִי מֵהַחַיִּים בִּלְהָקוֹת.","הַלְּבִיאוֹת מְחַנְּכוֹת אֶת הַגּוּרִים","לְחֻקֵּי הַלַּהֲקָה וְלָעֶקְרוֹנוֹת."]]},
    {img:"img/elephant.jpg",stanzas:[
      ["הִגִּיעַ יוֹם שִׁשִּׁי, טוֹמֵן בְּחֻבּוֹ הַפְתָּעוֹת.",`עִם שִׁיר בַּלֵּב ${n} ${g("צָעֲדָה","צָעַד")},`,`${g("עָלְתָה, טִפְּסָה וְחִכְּתָה","עָלָה, טִפֵּס וְחִכָּה")} לַבָּאוֹת:`,"<em>הַיּוֹם אֶפְגֹּשׁ – מְעַנְיֵן אֶת מִי.</em>"],
      ["וְהִנֵּה הַפְתָּעָה מַדְלִיקָה –","הַפִּילָה נִילָה עִם גּוּרָהּ.","נִילָה הִיא חֲבֵרָה וָתִיקָה,","נִפְגַּשְׁנוּ גַּם בַּשָּׁנָה שֶׁעָבְרָה."]]},
    {img:"img/babyelephant.jpg",stanzas:[
      ["נִילָה הוֹשִׁיטָה אֶת הַחֵדֶק",`וְ${n} ${g("חִבְּקָה","חִבֵּק")} אוֹתָהּ בְּחֹם.`,"טִיְּלוּ בְּיַחַד, חָלְקוּ סִפּוּרִים,","וְאָכְלוּ פֵּרוֹת עַד סוֹף הַיּוֹם."],
      ["עִם רֶדֶת הַחֲשֵׁכָה","נִילָה לִוְּתָה",`וְ${n} ${g("נִפְרְדָה","נִפְרַד")} בְּהַבְטָחָה`,"לַחֲזֹר שׁוּב בַּשָּׁנָה הַבָּאָה."]]},
    {end:true,stanzas:[["כָּאן, חֲבֵרַי וְחַבְרוֹתַי, תַּם הַסִּפּוּר.","תָּמִיד תּוּכְלוּ לָשׁוּב וְלִקְרֹא","כְּשֶׁלִּבְּכֶם יַחְפֹּץ לָבוֹא לְבִקּוּר."]]}
  ];
}

/* ===== הקראה ===== */
const TTS={voice:null,ok:"speechSynthesis" in window};
function pickVoice(){if(!TTS.ok)return;const v=speechSynthesis.getVoices();TTS.voice=v.find(x=>/^he|^iw/i.test(x.lang))||null}
if(TTS.ok){pickVoice();speechSynthesis.onvoiceschanged=()=>{pickVoice();const n=document.getElementById("ttsnote");if(n)n.hidden=!!TTS.voice}}
let talkId=0;
function stopTalk(){talkId++;clearTimeout(TTS.t);if(TTS.ok)speechSynthesis.cancel()}
const clean0=t=>t.replace(/<[^>]+>/g,"").replace(/[־]/g," ");
const clean=t=>numsToWords(clean0(t).replace(/[🦓🦒🦁🐘🎁✨]/gu,""));
/* מקריא שורה-שורה, עם הפסקה קצרה בין שורות וארוכה בין בתים */
function speakSeq(stanzas,onDone){
  stopTalk();
  if(!TTS.ok){if(onDone)onDone();return}
  const id=talkId,items=[];
  stanzas.forEach(st=>st.forEach((l,i)=>items.push({l,gap:i===st.length-1?1300:550})));
  let k=0;
  const next=()=>{
    if(id!==talkId)return;
    if(k>=items.length){if(onDone)onDone();return}
    const it=items[k++],u=new SpeechSynthesisUtterance(clean(it.l));
    u.lang="he-IL";if(TTS.voice)u.voice=TTS.voice;u.rate=.78;
    let fired=false;const after=()=>{if(fired||id!==talkId)return;fired=true;TTS.t=setTimeout(next,it.gap)};
    u.onend=after;u.onerror=after;speechSynthesis.speak(u);
  };
  next();
}
function say(text,onend){speakSeq([[text]],onend)}

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
const sfxParty=()=>tone([[523,.12],[523,.12],[523,.12],[659,.25],[587,.12],[659,.12],[784,.5]]);

/* ===== מסכים ===== */
/* מספרים נקראים כמילים בעברית (חלק מהמכשירים מקריאים ספרות באנגלית) */
const NUM_F=["אפס","אחת","שתיים","שלוש","ארבע","חמש","שש","שבע","שמונה","תשע","עשר","אחת עשרה","שתים עשרה","שלוש עשרה","ארבע עשרה","חמש עשרה","שש עשרה","שבע עשרה","שמונה עשרה","תשע עשרה","עשרים"];
const NUM_M=["אפס","אחד","שניים","שלושה","ארבעה","חמישה","שישה","שבעה","שמונה","תשעה","עשרה","אחד עשר","שנים עשר","שלושה עשר","ארבעה עשר","חמישה עשר","שישה עשר","שבעה עשר","שמונה עשר","תשעה עשר","עשרים"];
const MASC=/^(ו?ה?)(יום|ימים|קילומטר|קילומטרים|מטר|מטרים|זוג|זוגות|קלף|קלפים|ילד|ילדים|גור|גורים|פיל|פילים|קוף|קופים|אריה|אריות|היפופוטם|היפופוטמים|כוכב|כוכבים)$/;
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

/* ===== שמירת המשחק – כדי שיהיה קל לחזור אליו ===== */
const gameURL=()=>CONFIG.gameLink||location.href.split("#")[0];
const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent),inApp=/FBAN|FBAV|Instagram|FB_IAB/i.test(navigator.userAgent);
function waShare(text){return "https://wa.me/?text="+encodeURIComponent(text)}
function saveText(){return `🦓 המשחק של ${N()} – "${N()} בסוואנה" מ-BOOQLI\nלשחק שוב, בחינם ובלי הגבלה:\n${gameURL()}`}
function savedPhone(){try{return localStorage.getItem("booqli-savanna-phone")||""}catch(e){return ""}}
function intlPhone(v){let d=String(v||"").replace(/\D/g,"");if(d.startsWith("972"))d=d.slice(3);if(d.startsWith("0"))d=d.slice(1);return /^5\d{8}$/.test(d)?"972"+d:null}
const returnURL=()=>CONFIG.returnLink||gameURL();
function saveText2(){return `🦓 המשחק של ${N()} – "${N()} בסוואנה" מ-BOOQLI\nלשחק שוב, בחינם ומתי שרוצים:\n${returnURL()}`}
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
      try{localStorage.setItem("booqli-savanna-phone",inp.value.trim())}catch(_){}
      msg.className="sv-msg ok";msg.textContent="✓ הוואטסאפ נפתח – נשאר רק ללחוץ \"שליחה\"";sfxPair()};
    const c=box.querySelector(".sv-copy"),h=box.querySelector(".sv-home"),how=box.querySelector(".sv-how"),ln=box.querySelector(".sv-link");
    if(c)c.onclick=()=>{const done=()=>{c.textContent="✓ הועתק";setTimeout(()=>{if(c.isConnected)c.textContent="🔗 העתקת הקישור"},2500)};
      const sel=()=>{ln.hidden=false;const r=document.createRange();r.selectNodeContents(ln);const x=getSelection();x.removeAllRanges();x.addRange(r);c.textContent="מסומן – העתיקו"};
      try{navigator.clipboard.writeText(returnURL()).then(done,sel)}catch(e){sel()}};
    if(h)h.onclick=()=>{how.hidden=!how.hidden;h.setAttribute("aria-expanded",String(!how.hidden))};
  });
  fitVerses();
}

let OFFER_SAVE=true;
function noSaveOffer(...a){OFFER_SAVE=false;try{return offerHTML(...a)}finally{OFFER_SAVE=true}}

function offerHTML(){
  const n=esc(N());
  return `${OFFER_SAVE?saveHTML():""}<section class="offer" aria-label="ספר מודפס אישי">
    <p class="offer-kick">ההפתעה מ-BOOQLI 🎁</p>
    <h2 class="offer-h">ספר אמיתי ש${n} ${g("היא הגיבורה","הוא הגיבור")} שלו<br><mark>מודפס</mark> באיכות גבוהה</h2>
    <div class="demo" aria-label="לדוגמה: מתמונה אחת לספר מודפס">
      <figure class="demo-ph"><img src="img/demo-photo.jpg" alt="תמונה של ילד"><figcaption>שולחים תמונה אחת</figcaption></figure>
      <div class="demo-arrow" aria-hidden="true"><span class="sp">✨</span><span class="ar">←</span></div>
      <figure class="demo-bk"><div class="shine"><img src="img/demo-book.png" alt="ספר מודפס עם הילד על הכריכה"></div><figcaption>מקבלים ספר מודפס!</figcaption></figure>
    </div>
    <p class="demo-note">לדוגמה: יהודה בסוואנה</p>
    <ul class="offer-list">
      <li><b>השם של ${n}</b> לאורך כל העלילה – לא רק על הכריכה</li>
      <li><b>איורים אישיים:</b> ${n} ${g("מצוירת","מצויר")} בכל איור, מהעמוד הראשון ועד האחרון</li>
      <li><b>ספר מודפס באיכות גבוהה</b> – מתנה אמיתית ששומרים לשנים</li>
      <li>שולחים תמונה אחת – ואנחנו עושים את כל השאר</li>
      <li>סיפור מחורז ומנוקד, עם הזברות, הג'ירפה ונילה הפילה</li>
      <li>נשלח עד הבית תוך 7–14 ימי עסקים</li>
    </ul>
    <a class="btn offer-cta" href="${esc(CONFIG.link)}" target="_blank" rel="noopener">להזמנת הספר של ${n} ←</a>
    <a class="btn sv-wa" href="${esc((intlPhone(savedPhone())?"https://wa.me/"+intlPhone(savedPhone())+"?text=":"https://wa.me/?text=")+encodeURIComponent(`📚 ספר אישי "${N()} בסוואנה"
להזמנת הספר: ${CONFIG.link}\n\n🦓 לשחק שוב במשחק: ${returnURL()}`))}" target="_blank" rel="noopener">📲 עסוקים עכשיו? שלחו לעצמכם את הקישור בוואטסאפ</a>
    <a class="wa-line" href="${esc(waHref())}" target="_blank" rel="noopener">שאלות? כתבו לנו בוואטסאפ <b dir="ltr">${esc(CONFIG.whatsapp)}</b></a>
    <a class="ganbox" href="${esc(ganHref())}" target="_blank" rel="noopener"><span class="gi" aria-hidden="true">🏫</span><span><b>גננות וועדי הורים:</b> ספר אישי לכל ילד בגן, במחירים סיטונאיים מעולים. <u>להזמנה לכל הגן ←</u></span></a>
  </section>`;
}
function bindOffer(){bindSave();
  const b=document.getElementById("copy");if(!b)return;
  b.onclick=()=>{const t=CONFIG.coupon;
    const done=()=>{b.textContent="הועתק";setTimeout(()=>b.textContent="העתקה",1800)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(document.getElementById("cc"));const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent="מסומן – העתיקו"};
    try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}};
}

function splash(){
  stopTalk();document.body.classList.add("splash");
  app.innerHTML=`<section class="page splashpage"><div class="page-inner">
    <p class="kicker">BOOQLI מזמינה אתכם לסוואנה</p>
    <h1 class="title-story big" id="ttl"></h1>
    <p class="lede">סיפור, חידון ומשחק זיכרון על חיות אפריקה – והגיבור של הסיפור הוא הילד שלכם.</p>
    <div class="namebox">
      <label for="nm">איך קוראים לגיבור או לגיבורה?</label>
      <input id="nm" maxlength="14" autocomplete="off" placeholder="כתבו כאן שם" value="${esc(S.name)}">
      <div class="seg" role="group" aria-label="בן או בת">
        <button type="button" id="gf" aria-pressed="${S.g==="f"}">בת</button>
        <button type="button" id="gm" aria-pressed="${S.g==="m"}">בן</button>
      </div>
      <div class="photobox" id="photobox"></div>
      <button class="btn cta go" id="start">יוצאים להרפתקה!</button>
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
  const upd=()=>{S.name=nm.value.trim();save();ttl.textContent=(S.name||"___")+" בַּסָּוָאנָה";document.getElementById("need").hidden=true};
  nm.oninput=upd;upd();
  const setG=x=>{S.g=x;save();document.getElementById("gf").setAttribute("aria-pressed",x==="f");document.getElementById("gm").setAttribute("aria-pressed",x==="m")};
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
    const sx=(img.naturalWidth-side)/2, sy=Math.max(0,Math.min(img.naturalHeight-side,img.naturalHeight*0.38-side/2));
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

function home(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:16px">
  <section class="hello">
    ${S.photo?`<img class="kidthumb hi" src="${S.photo}" alt="">`:""}
    <h1>${g("ברוכה הבאה","ברוך הבא")} לסוואנה, ${esc(N())}!</h1>
    <p>מה עושים קודם?</p>
  </section>
  ${saveHTML()}
  <nav class="menu" aria-label="מה עושים">
    <button class="card" data-go="read"><img src="img/zebra.jpg" alt=""><span><b>קוראים את הספר</b><i>עם הקראה בקול</i></span></button>
    <button class="card" data-go="quiz"><img src="img/giraffe.jpg" alt=""><span><b>חידון החיות</b><i>מי זוכר מה קרה?</i></span></button>
    <button class="card" data-go="memory"><img src="img/hippo.jpg" alt=""><span><b>משחק זיכרון</b><i>מוצאים זוגות</i></span></button>
    <button class="card" data-go="parents"><img src="img/babyelephant.jpg" alt=""><span><b>להורים</b><i>מה הילד לומד מהספר</i></span></button>
  </nav>
  <div class="row"><button class="btn ghost" id="rename">החלפת שם</button></div>
  <div id="ownerslot"></div>
  ${noSaveOffer("ספר שבו הילד שלכם הוא הגיבור")}
  </div>`;
  app.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
  document.getElementById("rename").onclick=()=>go("");
  bindOffer();addOwnerBar();
}

function read(){
  const P=story();S.page=Math.min(S.page,P.length-1);
  const p=P[S.page];
  let top;
  if(p.cover) top="";
  else if(p.end||p.plain) top="";
  else top=`<div class="picwrap" style="--src:url('${p.img}')"><img class="pic" src="${p.img}" alt="">${kidBadge()}</div>`;
  let body;
  if(p.cover) body=`${kidBadge("big")}<h2 class="title-story big">${esc(N())} בַּסָּוָאנָה</h2><p class="verse">סִפּוּר הַרְפַּתְקָאוֹת בְּשִׁשָּׁה יָמִים</p>`;
  else body=p.stanzas.map(st=>`<p class="verse">${st.join("<br>")}</p>`).join("");
  if(p.end) body+=`<p class="note">כתיבה: שמש צור · עריכה לשונית: גילת עירון-בהר</p>`;
  const tall=(p.plain||p.end||p.cover)?' style="min-height:380px"':"";
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
    ${p.end?offerHTML(`שיהיה לכם בבית – עם התמונה של ${esc(N())}`):""}
  </div>`;
  const goPage=d=>{S.auto=false;stopTalk();S.page+=d;read();window.scrollTo({top:0,behavior:"smooth"})};
  document.getElementById("bk").onclick=()=>{S.auto=false;go("menu")};
  document.getElementById("nx").onclick=()=>goPage(1);
  document.getElementById("pv").onclick=()=>goPage(-1);
  document.getElementById("rd").onclick=()=>{if(S.auto){S.auto=false;read()}speakSeq(pageLines(story()[S.page]))};
  document.getElementById("au").onclick=()=>{S.auto=!S.auto;stopTalk();read();if(S.auto)autoPlay()};
  bindOffer();fitVerses();
}

function pageLines(p){return p.cover?[[`${N()} בסוואנה`]]:p.stanzas}
/* הקראת כל הספר: עמוד, הפסקה של שתי שניות, ועמוד הבא */
function autoPlay(){
  const P=story();
  speakSeq(pageLines(P[S.page]),()=>{
    if(!S.auto)return;
    if(S.page<P.length-1){
      TTS.t=setTimeout(()=>{if(!S.auto)return;S.page++;read();window.scrollTo({top:0,behavior:"smooth"});autoPlay()},2200);
    }else{S.auto=false;read()}
  });
}

/* ===== חידון ===== */
function quizData(){
  const n=esc(N());
  return [
    {q:"לְמִי יֵשׁ זִכָּרוֹן מְצֻיָּן שֶׁעוֹזֵר לִמְצֹא מַיִם?",a:"zebra",o:["zebra","hippo","monkey","lion"],
     fact:"לכל זברה יש דוגמת פסים משלה – אין שתי זברות עם אותם פסים, בדיוק כמו טביעת אצבע."},
    {q:"מִי הִתְכּוֹפְפָה עִם צַוָּאר אָרֹךְ וְלָחֲשָׁה סוֹד?",a:"giraffe",o:["elephant","giraffe","zebra","monkey"],
     fact:"הג'ירפה היא החיה הגבוהה ביותר בעולם, והלשון שלה ארוכה כמעט חצי מטר."},
    {q:`מִי חָטַף אֶת הַכּוֹבַע שֶׁל ${n}?`,a:"monkey",o:["lion","monkey","hippo","giraffe"],
     fact:"קופים חיים בלהקות ומדברים זה עם זה בקולות, בתנועות ובפרצופים מצחיקים."},
    {q:"מִי צָפוּ בָּאֲגַם וְהִתְגַּלְגְּלוּ מִצְּחוֹק?",a:"hippo",o:["hippo","elephant","zebra","lion"],
     fact:"היפופוטמים כמעט לא שוחים – הם הולכים וקופצים על קרקעית האגם, ויכולים לעצור נשימה כמה דקות."},
    {q:"בִּלְהַקַת הָאֲרָיוֹת – מִי אוֹכְלִים רִאשׁוֹנִים?",a:"t1",o:["t1","t2"],txt:{t1:"הַגּוּרִים",t2:"הַהוֹרִים"},
     fact:"בסיפור הלביאות דואגות שהגורים יאכלו ראשונים. ושאגה של אריה נשמעת עד 8 קילומטרים!"},
    {q:"אֵיךְ קוֹרְאִים לַפִּילָה, הַחֲבֵרָה הַוָּתִיקָה?",a:"t1",o:["t1","t2","t3","t4"],txt:{t1:"נִילָה",t2:"לִילָה",t3:"מִילָה",t4:"גִּילָה"},
     fact:"החדק של הפיל עובד כמו אף, כמו יד וכמו צינור מים – יש בו עשרות אלפי שרירים."},
    {q:"עִם מָה צָפוּ בָּאֲרָיוֹת מֵרָחוֹק?",a:"t1",o:["t1","t2","t3","t4"],txt:{t1:"מִשְׁקֶפֶת",t2:"כּוֹבַע",t3:"מִכְחוֹל",t4:"תִּיק"},
     fact:"נכון! בחיות בר מסתכלים מרחוק – כך שומרים גם עליהן וגם עלינו."},
    {q:"אֵיפֹה גָּרוֹת כָּל הַחַיּוֹת בַּסִּפּוּר?",a:"t1",o:["t1","t2","t3","t4"],txt:{t1:"בַּסָּוָאנָה",t2:"בַּיָּם",t3:"בַּקֹּטֶב",t4:"בָּעִיר"},
     fact:"הסוואנה היא שטח עצום של עשב ועצים בודדים, בעיקר באפריקה. זה הבית הטבעי של החיות – וצריך לשמור עליו."}
  ];
}
let QZ={i:0,score:0,order:null};
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function quiz(){
  const D=quizData();
  if(QZ.i>=D.length){return quizEnd(D.length)}
  const d=D[QZ.i],opts=shuffle(d.o);
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <div class="progress">${D.map((_,k)=>`<i class="${k<QZ.i?"done":k===QZ.i?"now":""}"></i>`).join("")}</div>
    <section class="panel">
      <div class="row" style="justify-content:space-between;flex-wrap:nowrap"><h2 class="q">${d.q}</h2><button class="btn ghost" id="sp" aria-label="להקריא את השאלה">🔊</button></div>
      <div class="opts">${opts.map(k=>d.txt?`<button class="opt textonly" data-k="${k}"><span>${d.txt[k]}</span></button>`:`<button class="opt" data-k="${k}"><img src="${ANIMALS[k].img}" alt=""><span>${ANIMALS[k].he}</span></button>`).join("")}</div>
      <div id="fb"></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  document.getElementById("sp").onclick=()=>say(d.q);
  let tries=0;
  app.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    if(b.disabled)return;
    const fb=document.getElementById("fb");
    if(b.dataset.k===d.a){
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
      ${S.photo?`<img class="kidthumb hi" src="${S.photo}" alt="">`:""}
      <h2>${g("סיירת","סייר")} ${g("סוואנה אמיתית","סוואנה אמיתי")}!</h2>
      <p style="font-size:20px">${esc(N())} ${g("ענתה","ענה")} נכון בניסיון הראשון על <b>${s}</b> מתוך ${total} שאלות.</p>
      <div class="row"><button class="btn" id="again">עוד פעם</button><button class="btn ghost" id="mem">למשחק הזיכרון</button></div>
    </section>
    ${offerHTML("ועכשיו – הספר עם התמונה האמיתית")}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1500);
  document.getElementById("again").onclick=()=>{QZ={i:0,score:0};quiz()};
  document.getElementById("mem").onclick=()=>go("memory");
  bindOffer();
}

/* ===== זיכרון ===== */
let MEM=null;
function memory(){
  stopTalk();
  const keys=Object.keys(ANIMALS);
  MEM={cards:shuffle([...keys,...keys]).map((k,i)=>({k,i,st:""})),open:[],moves:0,found:0,lock:false};
  drawMem();
}
function drawMem(){
  const done=MEM.found===6;
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">מוצאים את זוגות החיות מהסיפור</h2>
      <div class="stats"><span>זוגות: ${MEM.found} / 6</span><span>תורות: ${MEM.moves}</span></div>
      <div class="grid">${MEM.cards.map(c=>`<button class="mc ${c.st}" data-i="${c.i}" aria-label="${c.st?ANIMALS[c.k].he:"קלף הפוך"}"><div class="in"><div class="b"></div><div class="f"><img src="${ANIMALS[c.k].img}" alt=""><span>${ANIMALS[c.k].he}</span></div></div></button>`).join("")}</div>
    </section>
    ${done?`<section class="panel celebrate"><h2>מצאת את כל החיות!</h2><p>${esc(N())} ${g("סיימה","סיים")} ב-${MEM.moves} תורות.</p><div class="row"><button class="btn" id="again">משחק חדש</button><button class="btn ghost" id="qz">לחידון</button></div></section>${offerHTML("ועכשיו – הספר עם התמונה האמיתית")}`:""}
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  if(done){document.getElementById("again").onclick=memory;document.getElementById("qz").onclick=()=>go("quiz");bindOffer();sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}! מצאת את כל החיות`),1500);return}
  app.querySelectorAll(".mc").forEach(el=>el.onclick=()=>flip(+el.dataset.i,el));
}
function flip(i,el){
  const c=MEM.cards[i];if(MEM.lock||c.st)return;
  c.st="up";el.classList.add("up");MEM.open.push(c);sfxFlip();
  if(MEM.open.length<2)return;
  MEM.moves++;MEM.lock=true;
  const [a,b]=MEM.open;
  if(a.k===b.k){setTimeout(()=>{a.st=b.st="ok";MEM.found++;MEM.open=[];MEM.lock=false;sfxPair();if(MEM.found<6)TTS.t=setTimeout(()=>say(ANIMALS[a.k].he),500);drawMem()},450)}
  else setTimeout(()=>{sfxMiss();a.st=b.st="";MEM.open=[];MEM.lock=false;drawMem()},950);
}

/* ===== להורים ===== */
function parents(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel"><h2 class="q">למה כדאי לקרוא את "בסוואנה" עם הילד</h2>
      <p>סיפור מחורז ומנוקד של שישה ימי הרפתקה. בכל יום פוגשים חיה אחרת ולומדים עליה משהו אמיתי.</p></section>
    <div class="why">
      <article><h3>הכרת חיות הסוואנה</h3><ul>
        <li>זברות, ג'ירפה, קוף, היפופוטמים, אריות ופילים – וכל אחת עם עובדה מעולם הטבע.</li>
        <li>הזיכרון של הזברות, הלהקה של האריות, החדק של הפיל.</li></ul></article>
      <article><h3>ערכים</h3><ul>
        <li><b>שמירה על הטבע:</b> הסוואנה היא הבית של החיות, ויש לשמור שיהיו מוגנות.</li>
        <li><b>שיתוף פעולה ודאגה:</b> הלביאות נותנות לגורים לאכול ראשונים ומלמדות אותם את חוקי הלהקה.</li>
        <li><b>חברות ונאמנות:</b> נילה הפילה היא חברה ותיקה, ונפרדים בהבטחה להיפגש שוב.</li></ul></article>
      <article><h3>שפה וקריאה</h3><ul>
        <li>חרוזים וניקוד מלא שמתאימים לקריאה בקול ולקוראים מתחילים.</li>
        <li>מילים חדשות: מִשְׁקֶפֶת, לַהֲקָה, מַאֲגָרֵי מַיִם, חֵדֶק, לְבִיאָה.</li>
        <li>הסיפור בנוי לפי ימי השבוע – מיום ראשון עד שישי. דרך טבעית לתרגל את סדר הימים.</li></ul></article>
      <article><h3>כשהילד הוא הגיבור</h3><ul>
        <li>ילד שרואה את עצמו בתוך הסיפור מתחבר אליו, מבקש לקרוא אותו שוב ומרגיש גאווה וביטחון.</li></ul></article>
      <article><h3>שאלות לשיחה אחרי הקריאה</h3><ul>
        <li>איזו חיה הכי אהבת, ולמה?</li>
        <li>מה היית עושה אם קוף היה חוטף לך את הכובע?</li>
        <li>למה הגורים אוכלים לפני ההורים? מי דואג לך בבית?</li>
        <li>אם היית חוזר לסוואנה – את מי היית רוצה לפגוש?</li></ul></article>
    </div>
    ${offerHTML("ספר שבו הילד שלכם הוא הגיבור")}
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
      <label>קישור לכפתור "ליצירת הספר באתר"<input id="s_link" value="${esc(CONFIG.link)}" placeholder="https://"></label>
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
const ROUTES={menu:home,read,quiz:()=>{QZ={i:0,score:0};quiz()},memory,parents};
function go(r){if(location.hash.slice(1)!==r){location.hash=r}else route()}
function route(){
  const r=location.hash.slice(1);
  stopTalk();document.body.classList.remove("splash");
  if(r&&ROUTES[r]&&S.name){ROUTES[r]()} else splash();
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
route();
