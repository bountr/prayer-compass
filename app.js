"use strict";
const BASE=[
{id:"subhanallah",arabic:"سُبْحَانَ اللّٰهِ",tr:"Sübhanallah",en:"Subhanallah",meaningTr:"Allah her türlü eksiklikten münezzehtir.",meaningEn:"Glory be to Allah.",target:33},
{id:"alhamdulillah",arabic:"الْحَمْدُ لِلّٰهِ",tr:"Elhamdülillah",en:"Alhamdulillah",meaningTr:"Hamd Allah'a mahsustur.",meaningEn:"All praise belongs to Allah.",target:33},
{id:"allahuakbar",arabic:"اللّٰهُ أَكْبَرُ",tr:"Allahu Ekber",en:"Allahu Akbar",meaningTr:"Allah en büyüktür.",meaningEn:"Allah is the Greatest.",target:34},
{id:"tawhid",arabic:"لَا إِلٰهَ إِلَّا اللّٰهُ",tr:"Lâ ilâhe illallah",en:"La ilaha illallah",meaningTr:"Allah'tan başka ilah yoktur.",meaningEn:"There is no deity worthy of worship except Allah.",target:100},
{id:"istighfar",arabic:"أَسْتَغْفِرُ اللّٰهَ",tr:"Estağfirullah",en:"Astaghfirullah",meaningTr:"Allah'tan bağışlanma dilerim.",meaningEn:"I seek Allah's forgiveness.",target:100},
{id:"salawat",arabic:"اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ",tr:"Allahümme salli alâ Muhammed",en:"Allahumma salli ala Muhammad",meaningTr:"Allah'ım, Muhammed'e salât eyle.",meaningEn:"O Allah, bless Muhammad.",target:100},
{id:"tasbih_hamd",arabic:"سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ",tr:"Sübhanallahi ve bihamdihî",en:"Subhanallahi wa bihamdihi",meaningTr:"Allah'ı hamdiyle tesbih ederim.",meaningEn:"Glory and praise be to Allah.",target:100},
{id:"hawla",arabic:"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",tr:"Lâ havle ve lâ kuvvete illâ billâh",en:"La hawla wa la quwwata illa billah",meaningTr:"Güç ve kuvvet ancak Allah'ın yardımıyladır.",meaningEn:"There is no might or power except through Allah.",target:100},
{id:"hasbunallah",arabic:"حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ",tr:"Hasbünallahu ve ni'mel vekîl",en:"Hasbunallahu wa ni'mal wakeel",meaningTr:"Allah bize yeter, O ne güzel vekildir.",meaningEn:"Allah is sufficient for us and the best disposer of affairs.",target:100}
];
const $=id=>document.getElementById(id);
const KEY="zikirmatik-standalone-v1";
function getState(){try{const v=JSON.parse(localStorage.getItem(KEY)||"{}");return {daily:v.daily||{},targets:v.targets||{},custom:v.custom||[],selected:v.selected||"subhanallah",theme:v.theme||"system",language:v.language||"tr",haptics:v.haptics!==false};}catch{return {daily:{},targets:{},custom:[],selected:"subhanallah",theme:"system",language:"tr",haptics:true};}}
let s=getState();let tab="counter";
const all=()=>BASE.concat(s.custom), selected=()=>all().find(x=>x.id===s.selected)||BASE[0];
const language=()=>s.language==="en"?"en":"tr";
function msg(tr,en){return language()==="tr"?tr:en;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{alert(msg("Depolama dolu veya kapalı.","Storage is full or disabled."));}}
function dayKey(date=new Date()){const y=date.getFullYear(),m=("0"+(date.getMonth()+1)).slice(-2),d=("0"+date.getDate()).slice(-2);return y+"-"+m+"-"+d;}
function todayCounts(){const date=dayKey();if(!s.daily[date])s.daily[date]={};return s.daily[date];}
const countOf=(id,date=dayKey())=>Number((s.daily[date]||{})[id]||0);
const targetOf=id=>s.targets[id]||((all().find(x=>x.id===id)||{}).target)||33;
const number=n=>new Intl.NumberFormat(language()==="tr"?"tr-TR":"en-US").format(n);
function vibrate(strong){if(s.haptics&&navigator.vibrate)navigator.vibrate(strong?[35,35,65]:12);}
function safeText(id,text){$(id).textContent=text;}
function renderTabs(){for(const b of document.querySelectorAll(".tabbar button"))b.classList.toggle("active",b.dataset.tab===tab);for(const name of ["counter","list","history","settings"])$(name+"Page").classList.toggle("hidden",name!==tab);}
function renderCounter(){
const item=selected(),count=countOf(item.id),target=targetOf(item.id),today=Object.values(s.daily[dayKey()]||{}).reduce((n,v)=>n+(Number(v)||0),0);
$("zikirSelect").replaceChildren();for(const z of all()){const o=document.createElement("option");o.value=z.id;o.textContent=z[language()]||z.tr||z.en||z.id;$("zikirSelect").appendChild(o);} $("zikirSelect").value=item.id;
safeText("dateLabel",new Date().toLocaleDateString(language()==="tr"?"tr-TR":"en-US",{weekday:"long",day:"numeric",month:"long"}).toUpperCase());
safeText("arabic",item.arabic||"");safeText("reading",item[language()]||item.tr||item.en||"");safeText("meaning",language()==="tr"?(item.meaningTr||""):(item.meaningEn||item.meaningTr||""));
safeText("count",number(count));safeText("targetLabel","/ "+number(target));safeText("targets",msg("◎ Hedef: ","◎ Target: ")+number(target));safeText("todayTotal",number(today));
safeText("source",item.source||"");
$("undo").disabled=count===0;$("undo").style.opacity=count===0?".45":"1";
$("countButton").style.borderColor=count>=target?"var(--gold)":"var(--border)";
}
function renderList(){const root=$("zikirList");root.replaceChildren();for(const z of all()){const b=document.createElement("button");b.className="list-item";const a=document.createElement("strong");a.textContent=z[language()]||z.tr||z.en||"";const sm=document.createElement("small");sm.textContent=(z.arabic||"")+"  ·  "+number(countOf(z.id))+" / "+number(targetOf(z.id));b.append(a,sm);b.addEventListener("click",()=>{s.selected=z.id;save();tab="counter";render();});root.appendChild(b);if(z.id.startsWith("custom-")){const del=document.createElement("button");del.className="pill";del.style.marginBottom="10px";del.textContent=msg("Bu zikri sil","Remove this dhikr");del.onclick=()=>{if(confirm(msg("Özel zikir silinsin mi?","Remove custom dhikr?"))){s.custom=s.custom.filter(x=>x.id!==z.id);if(s.selected===z.id)s.selected=BASE[0].id;save();render();}};root.appendChild(del);}}}
function last30(){const dates=[];const start=new Date();start.setHours(12,0,0,0);for(let i=0;i<30;i++){const d=new Date(start);d.setDate(start.getDate()-i);dates.push(dayKey(d));}return dates;}
function renderHistory(){const dates=last30(),root=$("historyRows");root.replaceChildren();let total=0;for(const date of dates){const dayTotal=Object.values(s.daily[date]||{}).reduce((a,n)=>a+(Number(n)||0),0);total+=dayTotal;const line=document.createElement("div");line.className="stat";const left=document.createElement("span");left.textContent=new Date(date+"T12:00:00").toLocaleDateString(language()==="tr"?"tr-TR":"en-US",{day:"numeric",month:"long",year:"numeric"});const val=document.createElement("b");val.textContent=number(dayTotal);line.append(left,val);root.appendChild(line);}safeText("historyTotal",number(total));}
function applyTheme(){const light=s.theme==="light"||(s.theme==="system"&&window.matchMedia("(prefers-color-scheme: light)").matches);document.body.classList.toggle("light",light);document.documentElement.style.colorScheme=light?"light":"dark";}
function renderSettings(){$("theme").value=s.theme;$("language").value=language();$("haptics").checked=s.haptics;applyTheme();}
function translate(){const pairs={
appTitle:["Zikirmatik","Dhikr Counter"],subtitle:["Her dokunuşta bir zikir","One dhikr with every tap"],counterCaption:["BU SAYAÇ","THIS COUNTER"],tapHint:["Saymak için daireye dokunun","Tap the circle to count"],undo:["↶ Geri al","↶ Undo"],reset:["↻ Sıfırla","↻ Reset"],todayLabel:["BUGÜN","TODAY"],totalText:["Toplam zikir","Total dhikr"],customTargetLabel:["Özel hedef","Custom target"],saveTarget:["Kaydet","Save"],zikirHeading:["Zikirler","Dhikr"],newZikirHeading:["Kendi zikrini ekle","Add your own dhikr"],readingLabel:["Okunuş","Reading"],meaningLabel:["Anlam","Meaning"],targetInputLabel:["Hedef","Target"],addCustom:["+ Ekle","+ Add"],historyHeading:["Son 30 gün","Last 30 days"],total30Label:["Son 30 günlük toplam","Total over 30 days"],historyNotice:["Veriler yalnızca bu cihazda saklanır.","Data is stored only on this device."],settingsHeading:["Ayarlar","Settings"],appearanceLabel:["Görünüm","Appearance"],languageLabel:["Dil","Language"],hapticLabel:["Dokunsal geri bildirim","Haptic feedback"],privacyHeading:["Gizlilik","Privacy"],privacyText:["Zikir seçimleriniz ve sayımlarınız bu cihazda saklanır, bir sunucuya gönderilmez.","Your selections and counts stay on this device and are never uploaded."],wipe:["Tüm yerel verileri sil","Delete all local data"],tabCounter:["Sayaç","Counter"],tabList:["Zikirler","Dhikr"],tabHistory:["Geçmiş","History"],tabSettings:["Ayarlar","Settings"]};
for(const [id,values] of Object.entries(pairs))safeText(id,values[language()==="tr"?0:1]);document.documentElement.lang=language();
}
function render(){translate();renderTabs();renderCounter();if(tab==="list")renderList();if(tab==="history")renderHistory();if(tab==="settings")renderSettings();}
$("countButton").onclick=()=>{const z=selected(),row=todayCounts();row[z.id]=countOf(z.id)+1;save();vibrate(row[z.id]===targetOf(z.id));renderCounter();};
$("undo").onclick=()=>{const z=selected(),row=todayCounts();row[z.id]=Math.max(0,countOf(z.id)-1);save();renderCounter();};
$("reset").onclick=()=>{if(confirm(msg("Bu zikrin bugünkü sayımı sıfırlansın mı?","Reset today's count for this dhikr?"))){todayCounts()[s.selected]=0;save();renderCounter();}};
$("zikirSelect").onchange=e=>{s.selected=e.target.value;save();renderCounter();};
$("targets").onclick=()=>{$("targetPanel").classList.toggle("hidden");renderPresets();};
function renderPresets(){const target=targetOf(s.selected);$("presetButtons").replaceChildren();for(const n of [33,34,100]){const btn=document.createElement("button");btn.className="pill"+(target===n?" selected":"");btn.textContent=number(n);btn.onclick=()=>{s.targets[s.selected]=n;save();$("targetPanel").classList.add("hidden");renderCounter();};$("presetButtons").appendChild(btn);}}
$("saveTarget").onclick=()=>{const n=Number($("customTarget").value);if(!Number.isSafeInteger(n)||n<1||n>1e9){alert(msg("1 ile 1.000.000.000 arasında bir tam sayı girin.","Enter a whole number between 1 and 1,000,000,000."));return;}s.targets[s.selected]=n;save();$("customTarget").value="";$("targetPanel").classList.add("hidden");renderCounter();};
$("addCustom").onclick=()=>{const arabic=$("customArabic").value.trim(),reading=$("customReading").value.trim(),meaning=$("customMeaning").value.trim(),target=Number($("customNewTarget").value)||33;if(!arabic&&!reading){alert(msg("Arapça metin veya okunuş girin.","Enter Arabic text or a reading."));return;}if(!Number.isSafeInteger(target)||target<1||target>1e9)return;const z={id:"custom-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),arabic,tr:reading,en:reading,meaningTr:meaning,meaningEn:meaning,target};s.custom.push(z);save();for(const id of ["customArabic","customReading","customMeaning"])$(id).value="";$("customNewTarget").value="33";renderList();};
document.querySelectorAll(".tabbar button").forEach(btn=>btn.onclick=()=>{tab=btn.dataset.tab;render();window.scrollTo({top:0,behavior:"instant"});});
$("theme").onchange=e=>{s.theme=e.target.value;save();applyTheme();};
$("language").onchange=e=>{s.language=e.target.value;save();render();};
$("haptics").onchange=e=>{s.haptics=e.target.checked;save();};
$("wipe").onclick=()=>{if(confirm(msg("Tüm zikir sayımları ve özel zikirler kalıcı olarak silinsin mi?","Permanently delete all dhikr counts and custom items?"))){localStorage.removeItem(KEY);s=getState();tab="counter";render();}};
window.matchMedia("(prefers-color-scheme: light)").addEventListener?.("change",applyTheme);
document.addEventListener("gesturestart",e=>{if(e.cancelable)e.preventDefault();},{passive:false});
let lastTouch=0;document.addEventListener("touchend",e=>{if(e.target.closest("button,.count-circle")){const now=Date.now();if(now-lastTouch<300&&e.cancelable)e.preventDefault();lastTouch=now;}},{passive:false});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)render();});
window.addEventListener("focus",render);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();