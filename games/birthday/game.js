/* ===== הגדרות (נקראות מתוך העמוד) ===== */
const CONFIG_DEFAULT={"coupon": "", "couponText": "", "link": "https://games.booqli.ai/savta/?book=birthday&utm_source=booqli_games&utm_medium=book_game&utm_campaign=birthday", "homeLink": "https://games.booqli.ai/", "whatsapp": "055-5549331", "gameLink": "https://claude.ai/artifact/7aFCqomPJGbP6BhYhsTuVK", "returnLink": ""};
let CONFIG=Object.assign({},CONFIG_DEFAULT);
try{CONFIG=Object.assign(CONFIG,JSON.parse(document.getElementById("booqli-config").textContent))}catch(e){}
const PAGE_TEMPLATE="<title>ילד/ת יום הולדת של BOOQLI</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Fredoka:wght@500;600;700&family=Assistant:wght@400;600;700&display=swap\">\n<link rel=\"stylesheet\" href=\"game.css\">\n<script id=\"booqli-config\" type=\"application/json\">__CONFIG__</script>\n<div class=\"wrap\">\n  <header class=\"brand\">\n    <a id=\"homeLink\" class=\"logo\" href=\"https://games.booqli.ai/\" target=\"_blank\" rel=\"noopener\"><img src=\"img/logo.png\" alt=\"BOOQLI\" width=\"128\" height=\"54\"></a>\n    <a id=\"ganLink\" class=\"gan\" href=\"https://wa.me/972555549331\" target=\"_blank\" rel=\"noopener\"><b>🏫 ספר אישי לכל ילד בגן</b><span>מחירים סיטונאיים לגנים ←</span></a>\n    <a id=\"waLink\" class=\"wa\" href=\"https://wa.me/972555549331\" target=\"_blank\" rel=\"noopener\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z\"/></svg><span><span class=\"lbl\">וואטסאפ </span><b id=\"waNum\" dir=\"ltr\">055-5549331</b></span></a>\n  </header>\n  <main id=\"app\"></main>\n  <footer>הסיפור \"ילד/ת יום הולדת\" · כתיבה: שמש צור · עריכה לשונית: גילת עירון-בהר · © 2026 BOOQLI · וואטסאפ <span dir=\"ltr\">055-5549331</span></footer>\n</div>\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js\"></script>\n<script src=\"game.js\"></script>\n";
document.getElementById("homeLink").href=CONFIG.homeLink;
function waIntl(n){let d=String(n||"").replace(/\D/g,"");if(d.startsWith("0"))d="972"+d.slice(1);return d}
function waHref(){return "https://wa.me/"+waIntl(CONFIG.whatsapp)+"?text="+encodeURIComponent("היי BOOQLI, הגעתי מהמשחק של יום ההולדת 🎂")}
document.getElementById("waLink").href=waHref();
const ganHref=()=>"https://games.booqli.ai/kindergartens/?utm_source=booqli_games&utm_medium=book_game&utm_campaign=birthday#start";
{const gl=document.getElementById("ganLink");if(gl)gl.href=ganHref()}
document.getElementById("waNum").textContent=CONFIG.whatsapp;

/* ===== מצב ===== */
const KEY="booqli-bday";
const S={name:"",g:"f",age:0,page:0,auto:false,photo:null,lvl:"s"};
try{const s=JSON.parse(localStorage.getItem(KEY)||"{}");if(s.name)S.name=s.name;if(s.g)S.g=s.g;if(s.age)S.age=+s.age||0;if(s.lvl)S.lvl=s.lvl}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify({name:S.name,g:S.g,age:S.age,lvl:S.lvl}))}catch(e){}}
const g=(f,m)=>S.g==="f"?f:m;
const N=()=>S.name||g("הַגִּבּוֹרָה","הַגִּבּוֹר");
const app=document.getElementById("app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const IMG=k=>`img/${S.g==="f"?"g":"b"}${k}.jpg`;
const KID=()=>g("יַלְדַּת","יֶלֶד");
function paintG(){document.body.classList.toggle("g-m",S.g==="m");document.body.classList.toggle("g-f",S.g==="f")}
paintG();

/* ===== הסיפור (לפי הספר "ילד/ת יום הולדת") ===== */
function story(){
  const n=esc(N()),k=KID();
  return [
    {cover:true},
    {img:IMG("03"),stanzas:[[
      "הַבֹּקֶר הִתְעוֹרַרְתִּי עִם חִיּוּךְ עֲנָק:",
      `אֲנִי ${g("מִתְרַגֶּשֶׁת","מִתְרַגֵּשׁ")} כָּל־כָּךְ,`,
      "כִּי יֵשׁ לִי סִבָּה מְיֻחֶדֶת –",
      `הַיּוֹם אֲנִי, <em>${n}</em> - ${k} יוֹם הֻלֶּדֶת!`]]},
    {img:IMG("05"),stanzas:[[
      "נָעַלְתִּי אֶת הַנַּעֲלַיִם הַחֲדָשׁוֹת,",
      "זֵר פְּרָחִים הֵנַחְתִּי עַל הָרֹאשׁ,",
      `לָבַשְׁתִּי אֶת ${g("הַשִּׂמְלָה","הַחֻלְצָה")} הַלְּבָנָה –`,
      "כַּמָּה נִפְלָא לִגְדֹּל בְּשָׁנָה!"]]},
    {img:IMG("07"),stanzas:[[
      `לַגַּן מִהַרְתִּי, ${g("מִתְרַגֶּשֶׁת","מִתְרַגֵּשׁ")} עַד הַגַּג,`,
      "כִּי הַיּוֹם בִּשְׁבִילִי הוּא יוֹם שֶׁל חַג!",
      "הַיְּלָדִים וְהַיְּלָדוֹת כְּבָר חִכּוּ לִי בַּדֶּלֶת –",
      `כֵּיף לִהְיוֹת ${k} יוֹם הֻלֶּדֶת!`]]},
    {img:IMG("09"),stanzas:[[
      "הַגַּן הָיָה כֻּלּוֹ צִבְעוֹנִי וַחֲגִיגִי,",
      "עַל הַקִּירוֹת נִתְלוּ בָּלוֹנִים לִכְבוֹדִי,",
      "וְאִמָּא הִגִּיעָה עִם הַפְתָּעוֹת טְעִימוֹת:",
      "חֲבִיתוֹת רֵיחָנִיּוֹת וְלַחְמָנִיּוֹת טְרִיּוֹת."]]},
    {img:IMG("11"),stanzas:[[
      "חֲבֵרַי לַגַּן צִיְּרוּ לִי בְּרָכוֹת צִבְעוֹנִיּוֹת",
      "בִּצְבָעִים זוֹרְחִים עִם מַדְבֵּקוֹת,",
      "וְהַגַּנֶּנֶת כָּרְכָה אֶת כֻּלָּן לְחוֹבֶרֶת –",
      `כַּמּוּבָן, לִכְבוֹד <em>${n}</em> - ${k} יוֹם הַהֻלֶּדֶת!`]]},
    {img:IMG("13"),stanzas:[[
      "הִגִּיעַ הָרֶגַע, הִגִּיעָה הַשָּׁעָה,",
      "שֶׁאֵשֵׁב עַל כִּסֵּא הַמְּלוּכָה,",
      "וְשֶׁיָּרִימוּ אוֹתִי כִּמְעַט עַד הַתִּקְרָה –",
      "וְעוֹד אֶחָד לַשָּׁנָה הַבָּאָה."]]},
    {img:IMG("15"),stanzas:[[
      "וְעַכְשָׁו הִגִּיעַ הַתּוֹר שֶׁל הָעוּגָה.",
      "עָצַמְתִּי אֶת הָעֵינַיִם בִּשְׁתִיקָה,",
      "כִּבִּיתִי הַנֵּרוֹת וְהִבַּעְתִּי מִשְׁאָלָה:",
      `"הַלְוַאי וּלְכָל הַיְּלָדִים תִּהְיֶה כָּזֹאת חֲגִיגָה".`]]},
    {img:IMG("17"),stanzas:[[
      "קִבַּלְתִּי הַיּוֹם מַתָּנָה מְיֻחֶדֶת –",
      `סֵפֶר יְפֵהפֶה בְּשֵׁם "${k} יוֹם הֻלֶּדֶת".`,
      "אֶשְׁמֹר עָלָיו מִכָּל מִשְׁמָר וְאוּלַי",
      "אַרְאֶה אוֹתוֹ יוֹם אֶחָד לִנְכָדַי."]]},
    {img:IMG("19"),stanzas:[[
      "הַמְּסִבָּה בַּגַּן הִסְתַּיְּמָה,",
      "אֲבָל הַחֲגִיגָה נִמְשְׁכָה:",
      "נָסַעְנוּ לַחֲנוּת הַצַּעֲצוּעִים הַגְּדוֹלָה",
      "וּבָחַרְתִּי לְמַתָּנָה – הַפְתָּעָה בְּקֻפְסָה."]]},
    {img:IMG("21"),stanzas:[[
      "בְּסוֹף הַיּוֹם, כְּשֶׁהַשֶּׁמֶשׁ שָׁקְעָה,",
      "הִתְקַלַּחְתִּי, צִחְצַחְתִּי שִׁנַּיִם,",
      `${g("מְאֻשֶּׁרֶת וּשְׁלֵוָה","מְאֻשָּׁר וְשָׁלֵו")} עָצַמְתִּי עֵינַיִם,`,
      `${g("מְחַכָּה","מְחַכֶּה")} בְּקֹצֶר רוּחַ לְשָׁנָה הַבָּאָה.`]]},
    {end:true,stanzas:[["מַזָּל טוֹב! 🎂",`<em>${n}</em> - ${k} יוֹם הֻלֶּדֶת`,"עַד מֵאָה וְעֶשְׂרִים!"]]}
  ];
}

/* ===== הקראה ===== */
const TTS={voice:null,ok:"speechSynthesis" in window};
function pickVoice(){if(!TTS.ok)return;const v=speechSynthesis.getVoices();TTS.voice=v.find(x=>/^he|^iw/i.test(x.lang))||null}
if(TTS.ok){pickVoice();speechSynthesis.onvoiceschanged=()=>{pickVoice();const n=document.getElementById("ttsnote");if(n)n.hidden=!!TTS.voice}}
let talkId=0;
function stopTalk(){talkId++;clearTimeout(TTS.t);if(TTS.ok)speechSynthesis.cancel()}
/* מספרים נקראים כמילים בעברית (חלק מהמכשירים מקריאים ספרות באנגלית) */
const NUM_F=["אפס","אחת","שתיים","שלוש","ארבע","חמש","שש","שבע","שמונה","תשע","עשר","אחת עשרה","שתים עשרה","שלוש עשרה","ארבע עשרה","חמש עשרה","שש עשרה","שבע עשרה","שמונה עשרה","תשע עשרה","עשרים"];
const NUM_M=["אפס","אחד","שניים","שלושה","ארבעה","חמישה","שישה","שבעה","שמונה","תשעה","עשרה","אחד עשר","שנים עשר","שלושה עשר","ארבעה עשר","חמישה עשר","שישה עשר","שבעה עשר","שמונה עשר","תשעה עשר","עשרים"];
const MASC=/^(ו?ה?)(נר|נרות|בלון|בלונים|חבר|חברים|זוג|זוגות|קלף|קלפים|ילד|ילדים|קאפקייקס|כוכב|כוכבים|צעצוע|צעצועים)$/;
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
const clean=t=>numsToWords(t.replace(/<[^>]+>/g,"").replace(/[־]/g," ").replace(/[🎂🎈🎁⭐✨🕯️🌬️]/gu,""));
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
    u.lang="he-IL";if(TTS.voice)u.voice=TTS.voice;u.rate=.8;
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
const sfxBlow=()=>tone([[900,.45,"sine",200]]);
const sfxPlace=()=>tone([[740,.07,"sine"],[990,.09,"sine"]]);
/* "יום הולדת שמח" – מנגינה עממית */
const sfxParty=()=>tone([[392,.18],[392,.12],[440,.3],[392,.3],[523,.3],[494,.55]]);

/* ===== שמירת המשחק – כדי שיהיה קל לחזור אליו ===== */
const gameURL=()=>CONFIG.gameLink||location.href.split("#")[0];
const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent),inApp=/FBAN|FBAV|Instagram|FB_IAB/i.test(navigator.userAgent);
function waShare(text){return "https://wa.me/?text="+encodeURIComponent(text)}
function saveText(){return `🎂 המשחק של ${N()} – "${g("ילדת","ילד")} יום הולדת" מ-BOOQLI\nלשחק שוב, בחינם ובלי הגבלה:\n${gameURL()}`}
function savedPhone(){try{return localStorage.getItem(KEY+"-phone")||""}catch(e){return ""}}
function intlPhone(v){let d=String(v||"").replace(/\D/g,"");if(d.startsWith("972"))d=d.slice(3);if(d.startsWith("0"))d=d.slice(1);return /^5\d{8}$/.test(d)?"972"+d:null}
const returnURL=()=>CONFIG.returnLink||gameURL();
function saveText2(){return `🎂 המשחק של ${N()} – "${g("ילדת","ילד")} יום הולדת" מ-BOOQLI\nלשחק שוב, בחינם ומתי שרוצים:\n${returnURL()}`}
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
    <p class="demo-note">לדוגמה: ${g("ליה","בן")} ${g("חוגגת","חוגג")} יום הולדת בגן</p>
    <ul class="offer-list">
      <li><b>השם של ${n}</b> לאורך כל העלילה – לא רק על הכריכה</li>
      <li><b>איורים אישיים:</b> ${n} ${g("מצוירת","מצויר")} בכל איור, מהעמוד הראשון ועד האחרון</li>
      <li><b>ספר מודפס באיכות גבוהה</b> – מתנה אמיתית ששומרים לשנים</li>
      <li>שולחים תמונה אחת – ואנחנו עושים את כל השאר</li>
      <li>הקדשה אישית מהמשפחה בעמוד הראשון</li>
      <li>סיפור מחורז ומנוקד על יום הולדת בגן – גרסה לבנים וגרסה לבנות</li>
    </ul>
    <a class="btn offer-cta" href="${esc(CONFIG.link)}" target="_blank" rel="noopener">להזמנת הספר של ${n} ←</a>
    <a class="wa-line" href="${esc(waHref())}" target="_blank" rel="noopener">שאלות? כתבו לנו בוואטסאפ <b dir="ltr">${esc(CONFIG.whatsapp)}</b></a>
    <a class="ganbox" href="${esc(ganHref())}" target="_blank" rel="noopener"><span class="gi" aria-hidden="true">🏫</span><span><b>גננות וועדי הורים:</b> ספר אישי לכל ילד בגן, במחירים סיטונאיים מעולים. <u>להזמנה לכל הגן ←</u></span></a>
  </section>`;
}
function bindOffer(){app.querySelectorAll(".playwin").forEach(b=>b.onclick=()=>go(b.dataset.go));bindSave()}

/* ===== חלון קופץ עם הקופון – מופיע רק בניצחון ===== */
let POP=null;
function couponPopup(title){
  closePopup();
  const n=esc(N());
  POP=document.createElement("div");POP.className="pop";
  POP.innerHTML=`<div class="pop-card" role="dialog" aria-modal="true" aria-labelledby="popT">
    <button type="button" class="pop-x" id="popX" aria-label="סגירה">✕</button>
    <div class="confetti" aria-hidden="true">${["🎉","⭐","🎈","✨","🎂","🎁","🎉","⭐","🎈","✨"].map((c,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%5)*.12}s">${c}</i>`).join("")}</div>
    <img class="kidthumb hi" src="${kidPic()}" alt="">
    <p class="pop-kick">${esc(title)}</p>
    <h2 id="popT">ניצחת, ${n}! כל הכבוד! 🏆</h2>
    <p>🎁 יש גם ספר מודפס "${g("ילדת","ילד")} יום הולדת" ש${n} ${g("היא הגיבורה","הוא הגיבור")} שלו – עם השם ${g("שלה","שלו")} לאורך כל העלילה, איורים אישיים בכל עמוד, מודפס באיכות גבוהה</p>
    <a class="btn offer-cta" href="${esc(CONFIG.link)}" target="_blank" rel="noopener">להזמנת הספר של ${n} ←</a>
    <a class="btn sv-wa" href="${esc((intlPhone(savedPhone())?"https://wa.me/"+intlPhone(savedPhone())+"?text=":"https://wa.me/?text=")+encodeURIComponent(`📚 ספר אישי "${g("ילדת","ילד")} יום הולדת"
להזמנת הספר: ${CONFIG.link}\n\n🎂 לשחק שוב במשחק: ${returnURL()}`))}" target="_blank" rel="noopener">📲 עסוקים עכשיו? שלחו לעצמכם את הקישור בוואטסאפ</a>
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
    <p class="kicker">BOOQLI מזמינה אתכם לחגוג יום הולדת</p>
    <h1 class="title-story big" id="ttl"></h1>
    <p class="lede">סיפור עם הקראה, משחקי חשבון של יום הולדת, זיכרון, חידון ודף פעילות להדפסה – והגיבור של הסיפור הוא הילד שלכם.</p>
    <div class="namebox">
      <label for="nm">איך קוראים ל${g("ילדת","ילד")} יום ההולדת?</label>
      <input id="nm" maxlength="14" autocomplete="off" placeholder="כתבו כאן שם" value="${esc(S.name)}">
      <div class="seg" role="group" aria-label="בן או בת">
        <button type="button" id="gf" aria-pressed="${S.g==="f"}">בת</button>
        <button type="button" id="gm" aria-pressed="${S.g==="m"}">בן</button>
      </div>
      <div class="agepick"><label for="ag" id="agl"></label>
        <select id="ag"><option value="0">לא חובה</option>${[2,3,4,5,6,7,8].map(a=>`<option value="${a}" ${S.age===a?"selected":""}>${a}</option>`).join("")}</select></div>
      <div class="photobox" id="photobox"></div>
      <button class="btn cta go" id="start">יאללה, חוגגים!</button>
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
  const nm=document.getElementById("nm"),ttl=document.getElementById("ttl"),ag=document.getElementById("ag");
  const upd=()=>{S.name=nm.value.trim();save();ttl.textContent=(S.name||"___")+" "+KID()+" יוֹם הֻלֶּדֶת";
    document.getElementById("agl").textContent=g("בת כמה היא חוגגת?","בן כמה הוא חוגג?");document.getElementById("need").hidden=true};
  nm.oninput=upd;upd();
  ag.onchange=()=>{S.age=+ag.value||0;save()};
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
    <h1>מזל טוב ${esc(N())}! 🎂 ${g("מוכנה","מוכן")} לחגוג?</h1>
    <p>מה עושים קודם?</p>
  </section>
  ${saveHTML()}
  <nav class="menu" aria-label="מה עושים">
    <button class="card" data-go="read"><img src="${IMG("03")}" alt=""><span><b>קוראים את הספר</b><i>עם הקראה בקול</i></span></button>
    <button class="card" data-go="math"><img src="${IMG("09")}" alt=""><span><b>חשבון של יום הולדת</b><i>משחק מהירות עם שעון</i></span></button>
    <button class="card" data-go="cake"><img src="${IMG("15")}" alt=""><span><b>עוגת הנרות</b><i>סופרים ושמים נרות</i></span></button>
    <button class="card" data-go="memory"><img src="${IMG("19")}" alt=""><span><b>זיכרון המסיבה</b><i>מוצאים זוגות</i></span></button>
    <button class="card" data-go="quiz"><img src="${IMG("11")}" alt=""><span><b>חידון הסיפור</b><i>מי זוכר מה קרה?</i></span></button>
    <button class="card" data-go="sheet"><img src="${IMG("17")}" alt=""><span><b>דף יום הולדת</b><i>פעילות חשבון להדפסה</i></span></button>
    <button class="card" data-go="parents"><img src="${IMG("13")}" alt=""><span><b>טיפים להורים</b><i>חשבון בגובה העיניים</i></span></button>
  </nav>
  <div class="row"><button class="btn ghost" id="rename">החלפת שם או גיל</button></div>
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
  if(p.cover) body=`${kidBadge("big")}<img src="img/${S.g}-book.png" alt="" style="width:min(70%,300px);margin:0 auto"><h2 class="title-story big">${esc(N())} ${KID()} יוֹם הֻלֶּדֶת</h2><p class="verse">סִפּוּר מְחֹרָז עַל יוֹם הֻלֶּדֶת בַּגַּן</p>`;
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
  document.getElementById("rd").onclick=()=>{if(S.auto){S.auto=false;read()}speakSeq(pageLines(story()[S.page]))};
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
function pageLines(p){return p.cover?[[`${N()} ${KID()} יוֹם הֻלֶּדֶת`]]:p.stanzas}
function autoPlay(){
  const P=story();
  speakSeq(pageLines(P[S.page]),()=>{
    if(!S.auto)return;
    if(S.page<P.length-1){TTS.t=setTimeout(()=>{if(!S.auto)return;S.page++;read();window.scrollTo({top:0,behavior:"smooth"});autoPlay()},2200)}
    else{S.auto=false;read()}
  });
}

/* ===== כלים ===== */
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const rep=(e,k,cls)=>Array.from({length:k},()=>`<span class="it ${cls||""}">${e}</span>`).join("");
function rows5(e,n,per){per=per||5;let h="";for(let i=0;i<n;i+=per)h+=`<div style="display:flex;justify-content:center">${rep(e,Math.min(per,n-i))}</div>`;return h}
function numOpts(ans,lo,hi){
  const s=new Set([ans]);
  const near=shuffle([ans-1,ans+1,ans+2,ans-2]);
  for(const x of near){if(s.size>=4)break;if(x>=lo&&x<=hi)s.add(x)}
  let guard=0;while(s.size<4&&guard++<50){const x=rnd(lo,hi+2);s.add(x)}
  return shuffle([...s]).map(x=>({k:String(x),ic:String(x),n:true}));
}

/* ===== משחק "חשבון של יום הולדת" – מהירות עם שעון ===== */
const LV={
  s:{lab:"קטנים",sub:"גיל 3–4 · עד 5 · 10 שניות",max:5,ms:10000,cats:["cnt","bal","plus","add","more","pat","miss"]},
  b:{lab:"גדולים",sub:"גיל 5–6 · עד 10 · 8 שניות",max:10,ms:8000,cats:["cnt","bal","plus","add","sub","more","pat","miss","share"]}
};
const MQ={
  cnt(L){const n=rnd(2,L.max);return{ask:"כַּמָּה נֵרוֹת עַל הָעוּגָה?",vis:`<div style="display:flex;flex-direction:column;align-items:center">${rows5("🕯️",n)}<span class="it" style="font-size:54px">🎂</span></div>`,ans:String(n),opts:numOpts(n,1,L.max),teach:`נוגעים בכל נר פעם אחת: ${n} נרות`}},
  bal(L){const n=rnd(2,L.max),d=L.max>5?rnd(1,3):rnd(0,2);const items=shuffle([...Array(n).fill("🎈"),...Array(d).fill("🎁")]);
    return{ask:"כַּמָּה בָּלוֹנִים יֵשׁ כָּאן?",vis:items.map(e=>`<span class="it">${e}</span>`).join(""),ans:String(n),opts:numOpts(n,1,L.max),teach:`סופרים רק בלונים: ${n} בלונים`}},
  plus(L){let a=(S.age&&S.age<L.max)?S.age:rnd(2,L.max-1);if(Math.random()<.4)a=rnd(2,L.max-1);
    return{ask:"וְעוֹד אֶחָד לַשָּׁנָה הַבָּאָה! כַּמָּה הֲרָמוֹת?",vis:`<p style="width:100%;text-align:center;font-weight:700">${esc(N())} ${g("בַּת","בֶּן")} ${a} – מרימים על הכיסא:</p>${rep("⭐",a)}<span class="op">+</span>${rep("⭐",1,"new")}`,ans:String(a+1),opts:numOpts(a+1,1,L.max),teach:`${a} ועוד אחד = ${a+1} הרמות`}},
  add(L){const a=rnd(1,L.max-1),b=rnd(1,L.max-a);
    return{ask:"כַּמָּה מַתָּנוֹת יֵשׁ בְּיַחַד?",vis:`<div style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%"><div class="grp">${rows5("🎁",a,3)}</div><span class="op">+</span><div class="grp">${rows5("🎁",b,3)}</div></div>`,ans:String(a+b),opts:numOpts(a+b,1,L.max),teach:`${a} ועוד ${b} = ${a+b} מתנות`}},
  sub(L){const t=rnd(4,L.max),k=rnd(1,Math.min(3,t-1));
    return{ask:`${k} ${k===1?"בָּלוֹן עָף":"בָּלוֹנִים עָפוּ"}! כַּמָּה נִשְׁאֲרוּ?`,vis:rep("🎈",t-k)+rep("🎈",k,"gone"),ans:String(t-k),opts:numOpts(t-k,0,L.max),teach:`היו ${t}, עפו ${k}, נשארו ${t-k}`}},
  more(L){let a=rnd(1,L.max),b=rnd(1,L.max);const eqOk=L.max>5&&Math.random()<.2;if(eqOk)b=a;else while(b===a)b=rnd(1,L.max);
    const ans=a>b?"a":a<b?"b":"eq";
    const opts=[{k:"a",ic:"🔵",lab:"הַכְּחֻלָּה"},{k:"b",ic:"🩷",lab:"הַוְּרֻדָּה"}];if(L.max>5)opts.push({k:"eq",ic:"⚖️",lab:"שָׁוֶה"});
    return{ask:"בְּאֵיזוֹ צַלַּחַת יֵשׁ יוֹתֵר?",vis:`<div class="plate a"><div class="its">${rep("🧁",a)}</div></div><div class="plate b"><div class="its">${rep("🧁",b)}</div></div>`,ans,opts:shuffle(opts),teach:ans==="eq"?`בשתיהן ${a} – שווה!`:`בכחולה ${a}, בוורודה ${b}`}},
  pat(L){const pool=shuffle(["🎈","🎁","🧁","⭐","🍓","🎂"]);const kind=L.max>5?rnd(0,2):rnd(0,1);
    const base=kind===0?[pool[0],pool[1]]:kind===1?[pool[0],pool[0],pool[1]]:[pool[0],pool[1],pool[2]];
    const len=kind===0?5:kind===1?5:5;const seq=Array.from({length:len},(_,i)=>base[i%base.length]);const ans=base[len%base.length];
    const opts=shuffle([...new Set([ans,...base,pool[3],pool[4],pool[5]])]).slice(0,4);if(!opts.includes(ans))opts[0]=ans;
    return{ask:"מָה בָּא אַחַר כָּךְ?",vis:`<div class="seq" style="direction:rtl">${seq.map(e=>`<span class="it">${e}</span>`).join("")}<span class="num hole">?</span></div>`,ans,opts:shuffle(opts).map(e=>({k:e,ic:e})),teach:`החוקיות חוזרת: ${base.join(" ")}`}},
  miss(L){const st=rnd(1,L.max-4),hole=rnd(1,3),seq=[0,1,2,3,4].map(i=>st+i);
    return{ask:"אֵיזֶה מִסְפָּר חָסֵר?",vis:`<div class="seq">${seq.map((x,i)=>i===hole?`<span class="num hole">?</span>`:`<span class="num">${x}</span>`).join("")}</div>`,ans:String(seq[hole]),opts:numOpts(seq[hole],1,L.max),teach:`${seq[hole-1]}, ${seq[hole]}, ${seq[hole+1]} – סופרים לפי הסדר`}},
  share(L){const f=rnd(2,3),e=rnd(1,f===2?4:3),t=f*e;
    return{ask:`${f} חֲבֵרִים מְחַלְּקִים שָׁוֶה בְּשָׁוֶה. כַּמָּה לְכָל אֶחָד?`,vis:`${rep("🍰",t)}<p style="width:100%;text-align:center">${rep("🧒",f)}</p>`,ans:String(e),opts:numOpts(e,1,5),teach:`${t} פרוסות ל-${f} חברים = ${e} לכל אחד`}}
};
let BS=null;
const bestKey=()=>KEY+"-best-"+S.lvl;
function getBest(){try{return +localStorage.getItem(bestKey())||null}catch(e){return null}}
function mqDeck(L){
  /* 10 סיבובים, אף פעם לא אותו סוג שאלה פעמיים ברצף */
  const out=[];let pool=[];
  while(out.length<10){if(!pool.length)pool=shuffle(L.cats);
    let i=pool.findIndex(c=>c!==out[out.length-1]);if(i<0){pool=shuffle(L.cats);continue}
    out.push(pool.splice(i,1)[0])}
  return out;
}
function math(){
  stopTalk();
  const best=getBest();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">חשבון של יום הולדת ⏱️</h2>
      <p>סופרים נרות, מחברים מתנות, משווים צלחות וממשיכים חוקיות.<br>לוחצים <b>הכי מהר שאפשר</b> על התשובה הנכונה – השעון רץ!</p>
      <p style="margin-top:8px;font-weight:700">בוחרים רמה:</p>
      <div class="lvl" role="group" aria-label="רמה">${Object.entries(LV).map(([k,v])=>`<button type="button" data-l="${k}" aria-pressed="${S.lvl===k}"><b>${v.lab}</b><i>${v.sub}</i></button>`).join("")}</div>
      ${best?`<p class="note" style="margin-top:8px">השיא ברמה הזו: ${(best/1000).toFixed(1)} שניות בממוצע</p>`:""}
      <div class="row" style="margin-top:10px"><button class="btn cta go" id="bsgo">מוכנים? מתחילים!</button></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  app.querySelectorAll(".lvl button").forEach(b=>b.onclick=()=>{S.lvl=b.dataset.l;save();math()});
  document.getElementById("bsgo").onclick=()=>{sfxWin();const L=LV[S.lvl];BS={L,deck:mqDeck(L),i:0,ok:0,res:[],times:[],timer:null,next:null,tick:null};bsRound()};
}
function bsRound(){
  clearTimeout(BS.timer);clearTimeout(BS.next);clearInterval(BS.tick);
  if(BS.i>=BS.deck.length)return bsEnd();
  const L=BS.L,Q=MQ[BS.deck[BS.i]](L);const myR=BS.i,MS=L.ms,secs=Math.round(MS/1000);
  app.innerHTML=`<div class="wrap" style="gap:10px">
    <div class="row" style="justify-content:space-between"><button class="btn ghost small" id="bk">→ לתפריט</button><span class="count">שאלה ${BS.i+1} / ${BS.deck.length}</span></div>
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
    <div class="bs-opts">${Q.opts.map(o=>`<button class="bs-opt" data-k="${esc(o.k)}"><span class="ic ${o.n?"n":"e"}" aria-hidden="${o.n?"false":"true"}">${o.ic}</span>${o.lab||""}</button>`).join("")}</div>
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
  say(Q.ask);
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
    BS.next=setTimeout(()=>{if(BS.i!==myR||location.hash.slice(1)!=="math")return;BS.i++;bsRound()},ok?1700:3000);
  };
  BS.timer=setTimeout(()=>finish(null,null),MS);
  app.querySelectorAll(".bs-opt").forEach(b=>b.onclick=()=>finish(b.dataset.k,b));
}
function bsEnd(){
  const n=BS.ok,t=BS.deck.length;
  const avg=BS.times.length?BS.times.reduce((x,y)=>x+y,0)/BS.times.length:null;
  const fast=BS.times.length?Math.min(...BS.times):null;
  let rec=false;const best=getBest();
  if(avg&&n>=5&&(!best||avg<best)){rec=true;try{localStorage.setItem(bestKey(),String(Math.round(avg)))}catch(e){}}
  const nb=getBest();
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${n>=Math.ceil(t*.9)?g("אלופת החשבון!","אלוף החשבון!"):n>=Math.ceil(t*.6)?"כל הכבוד!":"התחלה טובה!"}</h2>
      <div class="stars">${BS.deck.map((_,j)=>`<span class="${BS.res[j]?"":"off"}">⭐</span>`).join("")}</div>
      <div class="scoreline">
        <div><b>${n}/${t}</b><span>תשובות נכונות</span></div>
        ${avg?`<div><b>${(avg/1000).toFixed(1)}</b><span>שניות בממוצע</span></div><div><b>${(fast/1000).toFixed(1)}</b><span>הכי מהיר</span></div>`:""}
      </div>
      ${rec?`<p class="record">🏆 שיא חדש!</p>`:nb?`<p class="note">השיא: ${(nb/1000).toFixed(1)} שניות בממוצע. אפשר לשבור אותו?</p>`:""}
      ${n>=5?"":tryAgain("כדי לנצח צריך לפחות 5 כוכבים. עוד ניסיון?")}
      <div class="row"><button class="btn" id="again">עוד פעם – יותר מהר!</button><button class="btn ghost" id="ck">לעוגת הנרות</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1600);
  if(n>=5)winLater("ניצחון בחשבון של יום הולדת ⏱️");
  document.getElementById("again").onclick=math;
  document.getElementById("ck").onclick=()=>go("cake");
  bindOffer();
}

/* ===== עוגת הנרות – ספירה של אחד-לאחד ===== */
const SLOTS=[[120,150],[165,146],[210,144],[255,146],[300,150],[105,186],[150,190],[200,192],[250,190],[295,186]];
let CK=null;
function cakeTargets(){
  const a=(S.age>=2&&S.age<=9)?S.age:rnd(3,5);
  const t=[{n:a,ask:`${esc(N())} ${g("בַּת","בֶּן")} ${a}! שִׂימוּ ${a} נֵרוֹת עַל הָעוּגָה`,plus:false}];
  const pool=shuffle([2,3,4,5,6,7,8].filter(x=>x!==a));
  t.push({n:pool[0],ask:`שִׂימוּ ${pool[0]} נֵרוֹת`});
  t.push({n:Math.min(9,a)+1,ask:`${Math.min(9,a)} נֵרוֹת – וְעוֹד אֶחָד לַשָּׁנָה הַבָּאָה!`});
  t.push({n:pool[1],ask:`שִׂימוּ ${pool[1]} נֵרוֹת`});
  const b=rnd(2,6);t.push({n:b+1,ask:`${b} נֵרוֹת – וְעוֹד אֶחָד לַשָּׁנָה הַבָּאָה!`});
  t.push({n:pool[2],ask:`שִׂימוּ ${pool[2]} נֵרוֹת`});
  return t;
}
function cake(){stopTalk();CK={T:cakeTargets(),i:0,first:0,tries:0,on:new Array(10).fill(false),done:false};drawCake()}
function cakeSVG(){
  const cols=["#E77FA3","#5BA7D9","#E9B949","#2F8C9A","#B48AD8"];
  const back=SLOTS.map(([x,y],i)=>({x,y,i})).sort((a,b)=>a.y-b.y);
  const candle=({x,y,i})=>CK.on[i]
    ?`<g class="cslot" data-i="${i}"><rect x="${x-20}" y="${y-80}" width="40" height="92" fill="transparent"/><rect x="${x-7}" y="${y-52}" width="14" height="54" rx="4" fill="${cols[i%5]}"/><path d="M${x-7} ${y-40}l14 -8M${x-7} ${y-24}l14 -8M${x-7} ${y-8}l14 -8" stroke="#fff" stroke-width="3" opacity=".75"/><line x1="${x}" y1="${y-52}" x2="${x}" y2="${y-58}" stroke="#333" stroke-width="2"/><path class="flame" d="M${x} ${y-84}c7 10 9 15 7 20a7 7 0 0 1-14 0c-2-5 0-10 7-20z" fill="#FFB52E"/><path class="flame" d="M${x} ${y-74}c3 5 4 8 3 10a3 3 0 0 1-6 0c-1-2 0-5 3-10z" fill="#FFF3B0"/></g>`
    :`<g class="cslot" data-i="${i}"><rect x="${x-20}" y="${y-50}" width="40" height="62" fill="transparent"/><ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="none" stroke="#C33B79" stroke-width="2" stroke-dasharray="4 3" opacity=".7"/></g>`;
  return `<svg viewBox="0 0 400 320" role="img" aria-label="עוגה עם ${CK.on.filter(Boolean).length} נרות">
    <ellipse cx="200" cy="292" rx="185" ry="22" fill="#fff" stroke="#E4D6EA" stroke-width="3"/>
    <path d="M60 170v100a140 30 0 0 0 280 0V170" fill="#FFF7F0" stroke="#E4D6EA" stroke-width="3"/>
    <path d="M60 210a140 30 0 0 0 280 0" fill="none" stroke="#F7B9D4" stroke-width="10"/>
    ${[90,130,170,210,250,290,320].map((x,i)=>`<circle cx="${x}" cy="${250+(i%2)*14}" r="6" fill="${cols[i%5]}"/>`).join("")}
    <ellipse cx="200" cy="170" rx="140" ry="34" fill="#FFFDF9" stroke="#E4D6EA" stroke-width="3"/>
    <path d="M62 174q14 22 28 4q14 22 28 4q14 22 28 4q14 22 28 4q14 22 28 4q14 22 28 4q14 22 28 4q14 22 28 4q14 22 28 4q14 22 28 4" fill="none" stroke="#F7B9D4" stroke-width="6" stroke-linecap="round"/>
    ${back.map(candle).join("")}
  </svg>`;
}
function drawCake(){
  if(CK.i>=CK.T.length)return cakeEnd();
  const T=CK.T[CK.i],cnt=CK.on.filter(Boolean).length;
  app.innerHTML=`<div class="wrap" style="gap:12px">
    <div class="row" style="justify-content:space-between"><button class="btn ghost small" id="bk">→ לתפריט</button><span class="count">עוגה ${CK.i+1} / ${CK.T.length}</span></div>
    <section class="panel" style="gap:10px">
      <p class="goal" id="goal">${T.ask.replace(/(\d+)/g,'<span class="n">$1</span>')}</p>
      <p class="note" style="text-align:center">נוגעים בעוגה כדי לשים נר, ונוגעים בנר כדי להוריד אותו</p>
      <div class="cakebox" id="cb">${cakeSVG()}</div>
      <div class="cakectl">
        <button class="btn ghost small" id="minus" aria-label="להוריד נר">➖</button>
        <span class="cakecount" id="cc" aria-live="polite">${cnt}</span>
        <button class="btn ghost small" id="plus" aria-label="להוסיף נר">➕</button>
      </div>
      <div class="row"><button class="btn cta" id="ready">מוכן! נושפים 🌬️</button></div>
      <div id="cfb"></div>
    </section></div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  const re=()=>{document.getElementById("cb").innerHTML=cakeSVG();document.getElementById("cc").textContent=CK.on.filter(Boolean).length;bindSlots()};
  const bindSlots=()=>app.querySelectorAll(".cslot").forEach(el=>el.onclick=()=>{if(CK.done)return;const i=+el.dataset.i;CK.on[i]=!CK.on[i];CK.on[i]?sfxPlace():sfxMiss();re();
    const c=CK.on.filter(Boolean).length;if(CK.on[i])say(String(c))});
  bindSlots();
  document.getElementById("plus").onclick=()=>{const i=CK.on.indexOf(false);if(i<0||CK.done)return;CK.on[i]=true;sfxPlace();re();say(String(CK.on.filter(Boolean).length))};
  document.getElementById("minus").onclick=()=>{const i=CK.on.lastIndexOf(true);if(i<0||CK.done)return;CK.on[i]=false;sfxMiss();re()};
  document.getElementById("ready").onclick=()=>{
    if(CK.done)return;
    const c=CK.on.filter(Boolean).length,fb=document.getElementById("cfb");
    if(c===T.n){
      CK.done=true;if(CK.tries===0)CK.first++;
      document.getElementById("cb").classList.add("out");sfxBlow();
      fb.innerHTML=`<div class="fact"><b>פוּוּוּ! 🎉</b> בדיוק ${T.n} נרות. ${g("עצמי","עצום")} עיניים ו${g("תבקשי","תבקש")} משאלה!</div><div class="row" style="margin-top:12px"><button class="btn" id="nc">${CK.i<CK.T.length-1?"לעוגה הבאה":"לתוצאה"}</button></div>`;
      stopTalk();TTS.t=setTimeout(()=>say(`בדיוק ${T.n} נרות! כל הכבוד`),700);
      document.getElementById("nc").onclick=()=>{CK.i++;CK.tries=0;CK.done=false;CK.on=new Array(10).fill(false);stopTalk();drawCake()};
    }else{
      CK.tries++;sfxFail();
      const d=T.n-c;
      fb.innerHTML=`<div class="fact no">יש על העוגה <b>${c}</b> נרות, וצריך <b>${T.n}</b>. ${d>0?`חסרים עוד ${d} 🕯️`:`יש ${-d} יותר מדי – מורידים`}. סופרים יחד ונסו שוב!</div>`;
      stopTalk();TTS.t=setTimeout(()=>say(d===1?"חסר עוד נר אחד":d===-1?"יש נר אחד יותר מדי":d>0?`חסרים עוד ${d} נרות`:`יש ${-d} נרות יותר מדי`),500);
    }
  };
  say(T.ask.replace(/<[^>]+>/g,""));
}
function cakeEnd(){
  const s=CK.first,t=CK.T.length;
  app.innerHTML=`<div class="wrap" style="gap:16px">
    <section class="panel celebrate">
      <img class="kidthumb hi" src="${kidPic()}" alt="">
      <h2>${g("אלופת הנרות!","אלוף הנרות!")}</h2>
      <p style="font-size:20px">${esc(N())} ${g("שמה","שם")} בדיוק את מספר הנרות בניסיון הראשון ב-<b>${s}</b> מתוך ${t} עוגות.</p>
      ${s>=3?"":tryAgain("כדי לנצח צריך 3 עוגות נכונות בניסיון הראשון. עוד פעם?")}
      <div class="row"><button class="btn" id="again">עוד עוגות</button><button class="btn ghost" id="mm">לזיכרון המסיבה</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`מזל טוב ${N()}`),1600);
  if(s>=3)winLater("ניצחון בעוגת הנרות 🎂");
  document.getElementById("again").onclick=cake;
  document.getElementById("mm").onclick=()=>go("memory");
  bindOffer();
}

/* ===== חידון ===== */
function quizData(){
  const n=esc(N());
  return [
    {q:"מָה הוּנַח עַל הָרֹאשׁ בַּבֹּקֶר?",o:["זֵר פְּרָחִים","כּוֹבַע","כֶּתֶר זָהָב","סֶרֶט כָּחֹל"],
     fact:"זר פרחים – כמו שמתאים לחוגגים ביום ההולדת בגן."},
    {q:"מִי חִכּוּ בַּדֶּלֶת שֶׁל הַגַּן?",o:["הַיְּלָדִים וְהַיְּלָדוֹת","סָבָא וְסָבְתָא","הַכֶּלֶב","אַף אֶחָד"],
     fact:"כל החברים חיכו – כיף להיות חוגגים!"},
    {q:"אֵילוּ הַפְתָּעוֹת הֵבִיאָה אִמָּא?",o:["חֲבִיתוֹת וְלַחְמָנִיּוֹת","פִּיצָה","גְּלִידָה","אֲבַטִּיחַ"],
     fact:"חביתות ריחניות ולחמניות טריות – לכל הגן."},
    {q:"מָה עָשְׂתָה הַגַּנֶּנֶת עִם הַבְּרָכוֹת?",o:["כָּרְכָה אוֹתָן לְחוֹבֶרֶת","תָּלְתָה עַל עֵץ","שָׁלְחָה בַּדֹּאַר","שָׂמָה בַּמְּקָרֵר"],
     fact:"חוברת של ברכות מכל החברים – מזכרת ששומרים."},
    {q:"עַל מָה יָשְׁבוּ כְּשֶׁהֵרִימוּ?",o:["עַל כִּסֵּא הַמְּלוּכָה","עַל נַדְנֵדָה","עַל כַּדּוּר","עַל הַשָּׁטִיחַ"],
     fact:`${n} ${g("ישבה","ישב")} על כיסא המלוכה, והרימו כמעט עד התקרה!`},
    {q:"כַּמָּה פְּעָמִים מְרִימִים יֶלֶד בֶּן 4 – עִם אַחַת לַשָּׁנָה הַבָּאָה?",o:["5","4","3","10"],
     fact:"4 הרמות לגיל ועוד אחת לשנה הבאה: 4 ועוד 1 = 5."},
    {q:"מָה הָיְתָה הַמִּשְׁאָלָה?",o:["שֶׁלְּכָל הַיְּלָדִים תִּהְיֶה חֲגִיגָה כָּזֹאת","הַרְבֵּה מַמְתַּקִּים","אוֹפַנַּיִם חֲדָשִׁים","לֹא לָלֶכֶת לִישֹׁן"],
     fact:"משאלה עם לב גדול – לחשוב גם על ילדים אחרים."},
    {q:"לְאָן נָסְעוּ אַחֲרֵי הַמְּסִבָּה בַּגַּן?",o:["לַחֲנוּת הַצַּעֲצוּעִים","לַיָּם","לַקִּרְקָס","לַגַּן הַחַיּוֹת"],
     fact:"בחנות הצעצועים הגדולה בחרו הפתעה בקופסה."}
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
  document.getElementById("sp").onclick=()=>say(d.q);
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
      <div class="row"><button class="btn" id="again">עוד פעם</button><button class="btn ghost" id="mem">לזיכרון המסיבה</button></div>
    </section>
    ${offerHTML()}
  </div>`;
  sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}`),1600);
  if(s>=4)winLater("ניצחון בחידון הסיפור 📖");
  document.getElementById("again").onclick=()=>{QZ={i:0,score:0};quiz()};
  document.getElementById("mem").onclick=()=>go("memory");
  bindOffer();
}

/* ===== זיכרון המסיבה – חפצים מתוך איורי הספר ===== */
const PARTY={cake:"עוּגָה",teddy:"דֻּבִּי",moon:"יָרֵחַ",book:"סֵפֶר",cars:"מְכוֹנִיּוֹת",cupcake:"קַאפְּקֵייקְס",balloons:"בָּלוֹנִים",berries:"תּוּתִים",board:"לוּחַ גִּיר",macaron:"מָקָרוֹנִים"};
let MEM=null;
function memory(){
  stopTalk();
  const keys=shuffle(Object.keys(PARTY)).slice(0,6);
  MEM={cards:shuffle([...keys,...keys]).map((k,i)=>({k,i,st:""})),open:[],moves:0,found:0,lock:false};
  drawMem();
}
function drawMem(){
  const done=MEM.found===6;
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel">
      <h2 class="q">מה היה במסיבה? מצאו את הזוגות!</h2>
      <div class="stats"><span>זוגות: ${MEM.found} / 6</span><span>תורות: ${MEM.moves}</span></div>
      <div class="grid">${MEM.cards.map(c=>`<button class="mc ${c.st}" data-i="${c.i}" aria-label="${c.st?PARTY[c.k]:"קלף הפוך"}"><div class="in"><div class="b"></div><div class="f"><img src="img/m-${c.k}.jpg" alt=""><span>${PARTY[c.k]}</span></div></div></button>`).join("")}</div>
    </section>
    ${done?`<section class="panel celebrate"><h2>כל הזוגות נמצאו! 🎈</h2><p>${esc(N())} ${g("סיימה","סיים")} ב-${MEM.moves} תורות.</p><p class="note">חשבון קטן: 6 זוגות = 12 קלפים, כי 6 ועוד 6 = 12</p><div class="row"><button class="btn" id="again">משחק חדש</button><button class="btn ghost" id="qz">לחידון</button></div></section>${offerHTML()}`:""}
  </div>`;
  document.getElementById("bk").onclick=()=>go("menu");
  if(done){document.getElementById("again").onclick=memory;document.getElementById("qz").onclick=()=>go("quiz");bindOffer();sfxParty();TTS.t=setTimeout(()=>say(`כל הכבוד ${N()}! מצאת את כל הזוגות`),1600);winLater("ניצחון בזיכרון המסיבה 🧩");return}
  app.querySelectorAll(".mc").forEach(el=>el.onclick=()=>flip(+el.dataset.i,el));
}
function flip(i,el){
  const c=MEM.cards[i];if(MEM.lock||c.st)return;
  c.st="up";el.classList.add("up");MEM.open.push(c);sfxFlip();
  if(MEM.open.length<2)return;
  MEM.moves++;MEM.lock=true;
  const [a,b]=MEM.open;
  if(a.k===b.k){setTimeout(()=>{a.st=b.st="ok";MEM.found++;MEM.open=[];MEM.lock=false;sfxPair();if(MEM.found<6)TTS.t=setTimeout(()=>say(PARTY[a.k]),500);drawMem()},450)}
  else setTimeout(()=>{sfxMiss();a.st=b.st="";MEM.open=[];MEM.lock=false;drawMem()},950);
}

/* ===== דף יום הולדת להדפסה (PDF בחינם) ===== */
function sheet(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel printbox" id="printbox">
      <div class="printrow">
        <img id="pvimg" class="pv" alt="תצוגה של הדף להדפסה">
        <div class="printtxt">
          <h2 class="q">🖨️ דף יום ההולדת של ${esc(N())} – חינם</h2>
          <p>דף A4 עם השם ${S.photo?"והתמונה ":""}של ${esc(N())}: צובעים נר לכל שנה ועוד אחד לשנה הבאה, סופרים בלונים, ממלאים את הגובה והמשאלה. מזכרת מתוקה לשמור – ותרגול חשבון אמיתי.</p>
          ${S.photo?"":`<p class="note">רוצים את התמונה של ${esc(N())} בראש הדף? <label for="ph2" class="linkish">הוסיפו תמונה</label><input type="file" id="ph2" accept="image/*" hidden></p>`}
          ${S.age?"":`<p class="note">טיפ: אם תבחרו גיל במסך הפתיחה, הוא יופיע בדף.</p>`}
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
function balloonOutline(x,cx,cy,r){
  x.beginPath();x.ellipse(cx,cy,r*.82,r,0,0,Math.PI*2);x.stroke();
  x.beginPath();x.moveTo(cx-6,cy+r+8);x.lineTo(cx,cy+r);x.lineTo(cx+6,cy+r+8);x.closePath();x.stroke();
  x.beginPath();x.moveTo(cx,cy+r+8);x.bezierCurveTo(cx-10,cy+r+20,cx+10,cy+r+30,cx,cy+r+42);x.stroke();
}
async function drawSheet(name,gender,age){
  const W=1240,H=1754,cv=document.createElement("canvas");cv.width=W;cv.height=H;
  const x=cv.getContext("2d"),G=(f,m)=>gender==="f"?f:m;
  try{await Promise.all(["700 70px Fredoka","600 40px Fredoka","700 30px Assistant","400 30px Assistant"].map(f=>document.fonts.load(f)))}catch(e){}
  const HEAD='"Fredoka","Varela Round","Arial Hebrew",Arial,sans-serif',UI='"Assistant","Arial Hebrew",Arial,sans-serif';
  const pre=gender==="f"?"g":"b";
  const [bg,kid,logo]=await Promise.all([loadImg(`img/bg_${pre}.jpg`),loadImg(S.photo||`img/${gender}-face.jpg`),loadImg("img/logo.png")]);
  const INK="#33273A",SOFT="#6A5C70",MAG="#C33B79",LINE="#B9A6C4";
  x.fillStyle="#fff";x.fillRect(0,0,W,H);
  /* header */
  if(bg){x.save();rrect(x,40,40,W-80,330,36);x.clip();x.drawImage(bg,0,bg.height*.35,bg.width,bg.height*.3,40,40,W-80,330);x.fillStyle="rgba(255,255,255,.5)";x.fillRect(40,40,W-80,330);x.restore()}
  x.strokeStyle="#E4D6EA";x.lineWidth=4;rrect(x,40,40,W-80,330,36);x.stroke();
  if(kid){x.save();x.beginPath();x.arc(205,205,125,0,Math.PI*2);x.clip();x.drawImage(kid,0,0,kid.width,kid.height,80,80,250,250);x.restore();
    x.lineWidth=10;x.strokeStyle="#fff";x.beginPath();x.arc(205,205,128,0,Math.PI*2);x.stroke();x.lineWidth=5;x.strokeStyle=MAG;x.beginPath();x.arc(205,205,135,0,Math.PI*2);x.stroke()}
  x.direction="rtl";x.textAlign="right";
  x.font=`600 34px ${HEAD}`;x.fillStyle=MAG;x.fillText(`${G("ילדת","ילד")} יום הולדת 🎂`,W-90,118);
  x.fillStyle=INK;x.font=`700 64px ${HEAD}`;
  const t=name?`יום ההולדת של ${name}`:"יום ההולדת של";
  x.fillText(t,W-90,200,W-470);
  x.font=`400 36px ${UI}`;x.fillStyle=SOFT;
  x.fillText(age?`היום אני ${G("בת","בן")} ${age}!`:`היום אני ${G("בת","בן")} ____ !`,W-90,268,W-470);
  x.fillText("תאריך: ______________",W-90,328);
  /* activity 1: candles */
  let y=430;
  x.fillStyle=INK;x.font=`600 42px ${HEAD}`;x.fillText("1. צבעו נר לכל שנה – ועוד אחד לשנה הבאה!",W-90,y);
  x.font=`400 30px ${UI}`;x.fillStyle=SOFT;x.fillText(age?`${age} שנים ועוד 1 = כמה נרות צבעתם? ____`:"כמה שנים? ____  ועוד 1 = ____ נרות",W-90,y+48);
  const cx=W/2,cy=y+285;
  x.lineWidth=4;x.strokeStyle=LINE;
  x.beginPath();x.ellipse(cx,cy+150,380,40,0,0,Math.PI*2);x.stroke();
  x.beginPath();x.moveTo(cx-320,cy);x.lineTo(cx-320,cy+130);x.ellipse(cx,cy+130,320,44,0,Math.PI,0,true);x.lineTo(cx+320,cy);x.stroke();
  x.beginPath();x.ellipse(cx,cy,320,60,0,0,Math.PI*2);x.stroke();
  for(let i=0;i<10;i++){
    const X=cx-288+i*64,Y=cy+(i%2?16:-10);
    x.strokeStyle=LINE;x.lineWidth=4;rrect(x,X-14,Y-110,28,110,8);x.fillStyle="#fff";x.fill();x.stroke();
    x.beginPath();x.moveTo(X,Y-110);x.lineTo(X,Y-122);x.stroke();
    x.beginPath();x.moveTo(X,Y-170);x.bezierCurveTo(X+18,Y-148,X+16,Y-126,X,Y-124);x.bezierCurveTo(X-16,Y-126,X-18,Y-148,X,Y-170);x.stroke();
  }
  /* activity 2: balloons */
  y=980;
  x.fillStyle=INK;x.font=`600 42px ${HEAD}`;x.fillText("2. כמה בלונים בכל קבוצה? כתבו בריבוע",W-90,y);
  const groups=[3,6,age&&age<=7&&![3,6].includes(age)?age:4];
  groups.forEach((n,gi)=>{
    const bx=W-90-gi*360,top=y+40;
    x.strokeStyle="#E4D6EA";x.lineWidth=3;rrect(x,bx-340,top,340,250,24);x.stroke();
    for(let k=0;k<n;k++){const col=k%4,row=Math.floor(k/4);x.strokeStyle=LINE;x.lineWidth=3;balloonOutline(x,bx-300+col*62,top+60+row*90,24)}
    x.strokeStyle=MAG;x.lineWidth=4;rrect(x,bx-80,top+170,60,60,10);x.stroke();
  });
  /* activity 3 */
  y=1370;
  x.fillStyle=INK;x.font=`600 40px ${HEAD}`;
  x.fillText("3. הגובה שלי היום: ______ ס\"מ",W-90,y);
  x.fillText("המשאלה שלי: ___________________________",W-90,y+70,W-180);
  x.fillText(`הכי ${G("אהבתי","אהבתי")} ביום ההולדת: ___________________`,W-90,y+140,W-180);
  /* footer */
  const fy=H-170;x.fillStyle="#2B1526";rrect(x,40,fy,W-80,130,30);x.fill();
  if(logo){const lh=86,lw=logo.width*lh/logo.height;x.drawImage(logo,W-80-lw,fy+22,lw,lh)}
  x.fillStyle="#fff";x.font=`700 30px ${UI}`;x.textAlign="left";x.direction="rtl";
  x.fillText(`ספר אישי "${G("ילדת","ילד")} יום הולדת" – הילד הוא הגיבור`,80,fy+56);
  x.font=`400 28px ${UI}`;x.fillStyle="#FBD9E8";
  x.direction="ltr";x.textAlign="left";x.fillText("games.booqli.ai",80,fy+100);const bw=x.measureText("games.booqli.ai").width;
  x.direction="rtl";x.textAlign="left";x.fillText(`וואטסאפ ${CONFIG.whatsapp}  ·`,80+bw+14,fy+100);
  return cv;
}
function showSaveImage(cv){
  const box=document.getElementById("printbox");if(!box)return;
  let w=document.getElementById("saveimg");
  if(!w){w=document.createElement("div");w.id="saveimg";w.className="saveimg";box.appendChild(w)}
  w.innerHTML=`<p><b>הדף מוכן!</b> בטלפון: לחיצה ארוכה על התמונה ← "שמירת תמונה", ואז מדפיסים מהגלריה. במחשב: קליק ימני ← "שמירת תמונה בשם".</p><img src="${cv.toDataURL("image/png")}" alt="דף יום ההולדת להדפסה">`;
  w.scrollIntoView({behavior:"smooth",block:"start"});
}
let DL=null;
function bindPrint(){
  const b=document.getElementById("dl"),msg=document.getElementById("dlmsg"),pv=document.getElementById("pvimg");
  if(!b)return;
  drawSheet(S.name,S.g,S.age).then(cv=>{if(pv&&pv.isConnected)pv.src=cv.toDataURL("image/jpeg",.7)});
  const ph2=document.getElementById("ph2");
  if(ph2)ph2.onchange=()=>{const f=ph2.files&&ph2.files[0];if(!f)return;
    cropPhoto(f,()=>{sheet();setTimeout(()=>{const pb=document.getElementById("printbox");if(pb)pb.scrollIntoView({block:"center"})},100)},()=>{msg.textContent="לא הצלחנו לפתוח את התמונה. נסו JPG או PNG."})};
  const fname=`דף יום הולדת - ${S.name||"BOOQLI"}.pdf`;
  b.onclick=async()=>{
    msg.textContent="מכינים את הקובץ…";b.disabled=true;
    try{
      const cv=await drawSheet(S.name,S.g,S.age);
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
      if(!(c==="declined"||c==="rate_limited")){try{showSaveImage(await drawSheet(S.name,S.g,S.age))}catch(_){msg.textContent="אפשר לבקש את הדף בוואטסאפ "+CONFIG.whatsapp}}
    }
    b.disabled=false;
  };
}

/* ===== טיפים להורים ===== */
function parents(){
  stopTalk();
  app.innerHTML=`<div class="wrap" style="gap:14px">
    <button class="btn ghost back" id="bk">→ לתפריט</button>
    <section class="panel"><h2 class="q">טיפים להורים: יום הולדת מלא מספרים</h2>
      <p>ביום הולדת יש מספרים אמיתיים בכל פינה: הגיל, הנרות, האורחים, הפרוסות, ההרמות על הכיסא. זו הזדמנות מצוינת לתרגל חשבון בלי שהילד ירגיש ש"לומדים".</p></section>
    <div class="why">
      <article><h3>למה זה חשוב</h3><ul>
        <li>מחקר מאוניברסיטת שיקגו מצא שככל שהורים מדברים יותר על מספרים עם פעוטות, הילדים מבינים טוב יותר מה המספרים אומרים בגיל 4 (Levine ועמיתים, 2010).</li>
        <li>ניתוח גדול של כמה מחקרי אורך מצא שמיומנויות מספר בכניסה לבית הספר מנבאות היטב הישגים מאוחרים יותר (Duncan ועמיתים, 2007).</li>
        <li>לא צריך שיעורים: ספירה, השוואה וחלוקה בתוך החגיגה עושות את העבודה.</li></ul></article>
      <article><h3>סופרים נכון: אחד-אחד</h3><ul>
        <li>נוגעים בכל נר פעם אחת בלבד, ואומרים מספר אחד לכל נגיעה.</li>
        <li>אחרי הספירה שואלים "אז כמה נרות יש?" – המספר האחרון הוא התשובה. זה הצעד החשוב.</li>
        <li>אפשר להזיז כל נר שספרנו הצידה, כדי לא לספור פעמיים.</li></ul></article>
      <article><h3>רעיונות לחשבון ביום עצמו</h3><ul>
        <li><b>נרות:</b> שמים יחד נר לכל שנה – ועוד אחד לשנה הבאה (חיבור של 1).</li>
        <li><b>שולחן:</b> צלחת אחת לכל אורח. חסרות? כמה עוד צריך?</li>
        <li><b>עוגה:</b> מחלקים פרוסות שווה בשווה – הבסיס לחילוק.</li>
        <li><b>בלונים:</b> כמה כחולים וכמה ורודים? איפה יותר?</li>
        <li><b>ספירה לאחור:</b> מדבקה על לוח שנה בכל יום עד יום ההולדת.</li></ul></article>
      <article><h3>משחקי לוח עם מספרים</h3><ul>
        <li>משחק לוח פשוט עם משבצות ממוספרות 1–10 בשורה, שבו מזיזים כלי וקוראים את המספר בקול, שיפר הבנת מספרים אצל ילדי גן (Siegler ו-Ramani, 2008).</li>
        <li>רעיון למסיבה: "הדרך לעוגה" – 10 משבצות על הרצפה, זורקים קובייה וקופצים.</li></ul></article>
      <article><h3>מה מתאים לאיזה גיל</h3><ul>
        <li><b>3–4:</b> ספירה עד 5, "איפה יותר?", חוקיות פשוטה (בלון-מתנה-בלון-מתנה).</li>
        <li><b>5–6:</b> ספירה עד 10 ויותר, "ועוד אחד", "כמה נשארו", חלוקה שווה בין חברים.</li>
        <li>בכל גיל: כל ילד בקצב שלו. במשחק יש שתי רמות – בחרו את זו שכיפית לילד.</li></ul></article>
      <article><h3>בלי לחץ</h3><ul>
        <li>זה משחק, לא מבחן. אם נמאס – עוצרים וחוזרים מחר.</li>
        <li>משבחים את הדרך: "איך ספרת?", "ראיתי שהזזת כל נר".</li>
        <li>טעות היא הזדמנות לספור שוב יחד.</li></ul></article>
      <article><h3>מתי להתייעץ</h3><ul>
        <li>אם לקראת גיל 5–6 קשה מאוד לילד לספור כמה חפצים או להבין "יותר" ו"פחות", שווה לשוחח עם הגננת.</li>
        <li>כל דבר בהתפתחות שמדאיג אתכם – אפשר לשאול את רופא או רופאת הילדים.</li></ul></article>
      <article><h3>שאלות לשיחה אחרי הקריאה</h3><ul>
        <li>מה הייתה המשאלה בספר? ומה ${g("את היית מבקשת","אתה היית מבקש")}?</li>
        <li>כמה פעמים הרימו על הכיסא? ובן כמה תהיה בשנה הבאה?</li>
        <li>מה ${g("היית בוחרת","היית בוחר")} בחנות הצעצועים?</li>
        <li>איך אפשר לשמח ילד אחר ביום ההולדת שלו?</li></ul></article>
    </div>
    <section class="panel"><h3 class="q" style="font-size:18px">מקורות</h3><ul class="srcs" style="margin:0;padding-inline-start:18px;font-size:14px;line-height:1.6">
      <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3177161" target="_blank" rel="noopener">Levine et al. (2010). What counts in the development of young children's number knowledge?</a></li>
      <li><a href="https://sites.uci.edu/gduncan/files/2021/03/School-readiness-pdf.pdf" target="_blank" rel="noopener">Duncan et al. (2007). School readiness and later achievement</a></li>
      <li><a href="https://doi.org/10.1111/j.1467-7687.2008.00714.x" target="_blank" rel="noopener">Siegler &amp; Ramani (2008). Playing linear numerical board games promotes low-income children's numerical development</a></li>
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
const ROUTES={menu:home,read,math,cake,quiz:()=>{QZ={i:0,score:0};quiz()},memory,sheet,parents};
function go(r){if(location.hash.slice(1)!==r){location.hash=r}else route()}
function route(){
  const r=location.hash.slice(1);
  closePopup();stopTalk();if(BS){clearTimeout(BS.timer);clearTimeout(BS.next);clearInterval(BS.tick)}document.body.classList.remove("splash");
  if(r&&ROUTES[r]&&S.name){ROUTES[r]()}else splash();
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
route();
