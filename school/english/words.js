/* מאמן ההכתבה באנגלית – מילון קטן למילים של כיתות ג'–ד' (6.11.2026)
   כל שורה: מילה|פירוש בעברית|אימוג'י. כשההורה מקליד מילה שיש כאן – הפירוש והאימוג'י נכנסים לבד.
   מילה שאין כאן – ההורה כותב פירוש בעצמו ("pencil - עיפרון"). אפשר להוסיף שורות בחופשיות. */
window.ENG_DICT = (function(){
const RAW = `
a|אחד, אחת|☝️
about|על (נושא)|💬
after|אחרי|⏭️
afternoon|אחר הצהריים|🌤️
again|שוב|🔁
age|גיל|🎂
air|אוויר|💨
airplane|מטוס|✈️
all|כולם, הכל|🙌
also|גם|➕
always|תמיד|♾️
am|אני (נמצא/ת)|🙋
an|אחד, אחת|☝️
and|ו־|➕
angry|כועס|😠
animal|בעל חיים|🐾
answer|תשובה, לענות|✅
ant|נמלה|🐜
any|כלשהו|❔
apple|תפוח|🍎
april|אפריל|🌸
are|הם, אתם (נמצאים)|👥
arm|זרוע|💪
art|אמנות|🎨
ask|לשאול|❓
at|ב־, ליד|📍
august|אוגוסט|☀️
aunt|דודה|👩
baby|תינוק|👶
back|גב, אחורה|🔙
bad|רע|👎
bag|תיק|🎒
ball|כדור|⚽
banana|בננה|🍌
bath|אמבטיה|🛁
bathroom|חדר אמבטיה|🚿
be|להיות|🙂
beach|חוף ים|🏖️
bear|דוב|🐻
beautiful|יפה|🌺
because|כי, בגלל ש|💡
bed|מיטה|🛏️
bedroom|חדר שינה|🛏️
bee|דבורה|🐝
before|לפני|⏮️
big|גדול|🐘
bike|אופניים|🚲
bird|ציפור|🐦
birthday|יום הולדת|🎂
black|שחור|⚫
blue|כחול|🔵
board|לוח|🧑‍🏫
boat|סירה|⛵
body|גוף|🧍
book|ספר|📖
bottle|בקבוק|🍼
box|קופסה|📦
boy|ילד, בן|👦
bread|לחם|🍞
breakfast|ארוחת בוקר|🥣
brother|אח|👦
brown|חום|🟤
bus|אוטובוס|🚌
but|אבל|🔀
butter|חמאה|🧈
butterfly|פרפר|🦋
buy|לקנות|🛒
by|ליד, על ידי|👉
cake|עוגה|🍰
can|יכול|💪
candy|ממתק|🍬
cap|כובע מצחייה|🧢
car|מכונית|🚗
carrot|גזר|🥕
cat|חתול|🐱
chair|כיסא|🪑
cheese|גבינה|🧀
chicken|תרנגולת, עוף|🐔
child|ילד|🧒
children|ילדים|👧
chocolate|שוקולד|🍫
city|עיר|🏙️
class|כיתה|🏫
classroom|כיתה (חדר)|🏫
clean|נקי, לנקות|🧽
clock|שעון|🕒
close|לסגור|🚪
clothes|בגדים|👕
cloud|ענן|☁️
cloudy|מעונן|🌥️
coat|מעיל|🧥
cold|קר|🥶
color|צבע|🎨
colour|צבע|🎨
come|לבוא|👋
computer|מחשב|💻
cook|לבשל|👩‍🍳
cookie|עוגייה|🍪
count|לספור|🔢
cow|פרה|🐄
cry|לבכות|😢
cup|כוס, ספל|☕
dad|אבא|👨
dance|לרקוד|💃
day|יום|📅
december|דצמבר|❄️
desk|שולחן כתיבה|🗄️
dinner|ארוחת ערב|🍽️
do|לעשות|✔️
doctor|רופא|🩺
does|עושה|✔️
dog|כלב|🐶
doll|בובה|🪆
door|דלת|🚪
down|למטה|⬇️
draw|לצייר|✏️
dress|שמלה|👗
drink|לשתות|🥤
duck|ברווז|🦆
ear|אוזן|👂
easy|קל|👌
eat|לאכול|🍽️
egg|ביצה|🥚
eight|שמונה|8️⃣
elephant|פיל|🐘
eleven|אחת עשרה|🔢
english|אנגלית|🇬🇧
eraser|מחק|🧽
evening|ערב|🌆
every|כל|🔁
eye|עין|👁️
face|פנים|🙂
family|משפחה|👨‍👩‍👧
fast|מהר|⚡
fat|שמן|🐷
father|אבא|👨
february|פברואר|🌧️
feet|כפות רגליים|🦶
fine|בסדר|👌
finger|אצבע|☝️
fish|דג|🐟
five|חמש|5️⃣
flag|דגל|🚩
floor|רצפה|⬛
flower|פרח|🌸
fly|לעוף, זבוב|🪰
food|אוכל|🍲
foot|כף רגל|🦶
for|בשביל|🎁
fork|מזלג|🍴
four|ארבע|4️⃣
fox|שועל|🦊
friday|יום שישי|📅
friend|חבר|🤝
frog|צפרדע|🐸
from|מ־|➡️
fruit|פרי|🍇
fun|כיף|🎉
funny|מצחיק|😂
game|משחק|🎲
garden|גינה|🌷
get|לקבל|🤲
giraffe|ג'ירפה|🦒
girl|ילדה, בת|👧
give|לתת|🎁
glass|כוס זכוכית|🥛
go|ללכת|🚶
good|טוב|👍
goodbye|להתראות|👋
grandfather|סבא|👴
grandmother|סבתא|👵
grandma|סבתא|👵
grandpa|סבא|👴
grapes|ענבים|🍇
grass|דשא|🌱
gray|אפור|🩶
grey|אפור|🩶
great|נהדר|🌟
green|ירוק|🟢
hair|שיער|💇
hand|יד|✋
happy|שמח|😊
hat|כובע|🎩
have|יש לי|🤲
he|הוא|👦
head|ראש|🙂
hello|שלום|👋
help|לעזור, עזרה|🆘
her|שלה, אותה|👧
here|כאן|📍
hi|היי|👋
his|שלו|👦
home|בית|🏠
homework|שיעורי בית|📝
horse|סוס|🐴
hot|חם|🥵
house|בית|🏠
how|איך|❓
hungry|רעב|😋
i|אני|🙋
ice|קרח|🧊
icecream|גלידה|🍦
in|ב־, בתוך|📥
is|הוא/היא (נמצא)|🟰
it|זה|👉
its|שלו (של חפץ)|👉
january|ינואר|❄️
juice|מיץ|🧃
july|יולי|☀️
jump|לקפוץ|🦘
june|יוני|🌞
key|מפתח|🔑
kid|ילד|🧒
king|מלך|🤴
kitchen|מטבח|🍳
kite|עפיפון|🪁
knife|סכין|🔪
know|לדעת|🧠
lamp|מנורה|💡
leg|רגל|🦵
lemon|לימון|🍋
lesson|שיעור|📚
letter|אות, מכתב|✉️
like|לאהוב, כמו|❤️
lion|אריה|🦁
listen|להקשיב|👂
little|קטן|🤏
live|לגור, לחיות|🏡
long|ארוך|📏
look|להסתכל|👀
love|אהבה, לאהוב|❤️
lunch|ארוחת צהריים|🥪
make|להכין|🛠️
man|איש|👨
many|הרבה|🔢
march|מרץ|🌼
may|מאי|🌷
me|אותי|🙋
milk|חלב|🥛
monday|יום שני|📅
monkey|קוף|🐒
month|חודש|🗓️
moon|ירח|🌙
morning|בוקר|🌅
mother|אמא|👩
mouse|עכבר|🐭
mouth|פה|👄
mom|אמא|👩
mum|אמא|👩
music|מוזיקה|🎵
my|שלי|🙋
name|שם|🏷️
new|חדש|🆕
nice|נחמד|😊
night|לילה|🌃
nine|תשע|9️⃣
no|לא|🚫
nose|אף|👃
not|לא|🚫
notebook|מחברת|📓
november|נובמבר|🍂
now|עכשיו|⏰
number|מספר|🔢
october|אוקטובר|🍁
of|של|🔗
old|זקן, ישן|👴
on|על|🔛
one|אחת|1️⃣
open|לפתוח, פתוח|📂
orange|כתום, תפוז|🍊
our|שלנו|👥
out|בחוץ, החוצה|🚪
paint|לצבוע|🖌️
pants|מכנסיים|👖
paper|נייר|📄
park|פארק|🏞️
party|מסיבה|🥳
pen|עט|🖊️
pencil|עיפרון|✏️
people|אנשים|👥
pet|חיית מחמד|🐕
picture|תמונה|🖼️
pig|חזיר|🐷
pink|ורוד|🩷
pizza|פיצה|🍕
plate|צלחת|🍽️
play|לשחק|⚽
please|בבקשה|🙏
pool|בריכה|🏊
potato|תפוח אדמה|🥔
pretty|יפה|🌸
purple|סגול|🟣
put|לשים|📥
queen|מלכה|👸
question|שאלה|❓
rabbit|ארנב|🐰
rain|גשם|🌧️
rainy|גשום|☔
read|לקרוא|📖
red|אדום|🔴
rice|אורז|🍚
ride|לרכוב|🚴
right|נכון, ימין|✅
ring|טבעת|💍
room|חדר|🚪
ruler|סרגל|📏
run|לרוץ|🏃
sad|עצוב|😢
salad|סלט|🥗
sandwich|כריך|🥪
saturday|שבת|📅
say|להגיד|🗣️
school|בית ספר|🏫
sea|ים|🌊
september|ספטמבר|🍎
seven|שבע|7️⃣
she|היא|👧
sheep|כבשה|🐑
shirt|חולצה|👕
shoe|נעל|👟
shoes|נעליים|👟
shop|חנות|🏪
short|קצר, נמוך|📏
sing|לשיר|🎤
sister|אחות|👧
sit|לשבת|🪑
six|שש|6️⃣
skirt|חצאית|👗
sky|שמיים|🌌
sleep|לישון|😴
slow|לאט|🐢
small|קטן|🐭
smile|חיוך|😃
snake|נחש|🐍
snow|שלג|❄️
sock|גרב|🧦
socks|גרביים|🧦
sofa|ספה|🛋️
song|שיר|🎶
sorry|סליחה|🙇
soup|מרק|🍲
spoon|כף|🥄
sport|ספורט|🏅
spring|אביב|🌷
star|כוכב|⭐
stand|לעמוד|🧍
stop|לעצור|🛑
store|חנות|🏪
story|סיפור|📚
strong|חזק|💪
student|תלמיד|🧑‍🎓
summer|קיץ|☀️
sun|שמש|☀️
sunday|יום ראשון|📅
sunny|שמשי|🌞
sweet|מתוק|🍭
swim|לשחות|🏊
table|שולחן|🪑
tail|זנב|🐒
talk|לדבר|💬
tall|גבוה|🦒
teacher|מורה|🧑‍🏫
teeth|שיניים|🦷
telephone|טלפון|☎️
ten|עשר|🔟
thank|להודות|🙏
thanks|תודה|🙏
that|ההוא, זה|👉
the|ה־ (הידיעה)|👉
their|שלהם|👥
them|אותם|👥
there|שם|👉
they|הם|👥
thin|רזה, דק|📏
thirsty|צמא|🥤
this|זה|👇
three|שלוש|3️⃣
thursday|יום חמישי|📅
tiger|נמר|🐯
time|זמן|⏰
tired|עייף|🥱
to|אל, ל־|➡️
today|היום|📅
toe|בוהן|🦶
tomato|עגבנייה|🍅
tomorrow|מחר|📆
too|גם, מדי|➕
tooth|שן|🦷
toy|צעצוע|🧸
train|רכבת|🚆
tree|עץ|🌳
truck|משאית|🚚
tuesday|יום שלישי|📅
twelve|שתים עשרה|🕛
two|שתיים|2️⃣
umbrella|מטרייה|☂️
uncle|דוד|👨
under|מתחת|⬇️
up|למעלה|⬆️
us|אותנו|👥
very|מאוד|💯
walk|ללכת, הליכה|🚶
want|לרצות|🙏
warm|חמים|🔥
was|היה|⏪
wash|לשטוף|🧼
watch|לצפות, שעון יד|⌚
water|מים|💧
we|אנחנו|👥
wednesday|יום רביעי|📅
week|שבוע|🗓️
weekend|סוף שבוע|🎈
well|טוב, היטב|👍
were|היו|⏪
what|מה|❓
when|מתי|⏰
where|איפה|📍
white|לבן|⚪
who|מי|🙋
why|למה|🤔
window|חלון|🪟
windy|סוער (רוח)|🌬️
winter|חורף|❄️
with|עם|🤝
woman|אישה|👩
word|מילה|🔤
work|עבודה, לעבוד|💼
write|לכתוב|✍️
year|שנה|🗓️
yellow|צהוב|🟡
yes|כן|✅
you|אתה, את, אתם|🫵
young|צעיר|🧒
your|שלך|🫵
zebra|זברה|🦓
zero|אפס|0️⃣
zoo|גן חיות|🦁
`;
const D = {};
RAW.trim().split("\n").forEach(l => { const [w, he, e] = l.split("|"); if (w) D[w.trim().toLowerCase()] = {he: (he || "").trim(), e: (e || "").trim()}; });
D["ice cream"] = D.icecream;
return D;
})();
