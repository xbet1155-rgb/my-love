var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pad(n){return String(n).padStart(2,"0")}
function fmt(ms){var t=Math.floor(ms/1e3),d=Math.floor(t/86400);return(d?d+" يوم ":"")+pad(Math.floor(t%86400/3600))+":"+pad(Math.floor(t%3600/60))+":"+pad(t%60)}
function toLocal(ms){return new Date(ms-new Date(ms).getTimezoneOffset()*6e4).toISOString().slice(0,16)}
var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
var CFG=window.CFG,ready=/^https?:/.test(CFG.url||""),sb=ready?supabase.createClient(CFG.url,CFG.key):null;

function fx(){
  for(var i=0;i<9;i++){var s=document.createElement("span");s.textContent="❤";s.style.cssText="left:"+Math.random()*100+"%;top:"+Math.random()*100+"%;font-size:"+(80+Math.random()*160)+"px;animation-delay:"+(-Math.random()*12)+"s;animation-duration:"+(10+Math.random()*10)+"s";$("bgl").appendChild(s)}
  if(reduce)return;var last=0;
  function sp(x,y,t,z,b){var e=document.createElement("i");e.className="sp";e.textContent=t;e.style.cssText="left:"+x+"px;top:"+y+"px;font-size:"+z+"px;--dx:"+((Math.random()-.5)*(b?140:30))+"px;--dy:"+(b?-30-Math.random()*90:-40)+"px";$("fx").appendChild(e);setTimeout(function(){e.remove()},900)}
  addEventListener("pointermove",function(e){var n=Date.now();if(n-last<90)return;last=n;sp(e.clientX,e.clientY,["✨","💗","❤️"][Math.floor(Math.random()*3)],14)});
  addEventListener("click",function(e){for(var i=0;i<7;i++)sp(e.clientX,e.clientY,"❤️",16,1)})}

/* تحميل كل المحتوى من Supabase */
async function load(){
  var r=await Promise.all([sb.from("settings").select("*"),sb.from("items").select("*").order("pos"),sb.from("locked").select("*").order("at"),sb.from("locked_text").select("*")]);
  for(var k=0;k<3;k++)if(r[k].error)throw r[k].error;
  var S={},T={};r[0].data.forEach(function(x){S[x.key]=x.value});(r[3].data||[]).forEach(function(x){T[x.id]=x.body});
  var D={name1:S.name1||"أنا",name2:S.name2||"إنتِ",start:S.start||"2024-02-14T20:00",intro:S.intro||"",secret:S.secret||"",words:[],photos:[],videos:[],songs:[],msgs:[],
    locked:r[2].data.map(function(x){return{id:x.id,title:x.title,at:new Date(x.at).getTime(),text:T[x.id]}})};
  try{D.words=JSON.parse(S.words||"[]")}catch(e){}
  var M={photo:"photos",video:"videos",song:"songs",msg:"msgs"};
  r[1].data.forEach(function(x){var a=D[M[x.kind]];if(a)a.push({id:x.id,url:x.url,path:x.body,cap:x.title,title:x.title,artist:x.extra,text:x.body})});
  return D}
var tt;function toast(t){var e=$("toast");if(!e){e=document.createElement("div");e.id="toast";e.className="toast";document.body.appendChild(e)}e.textContent=t;e.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){e.classList.remove("on")},1800)}
function needSetup(){$("app").innerHTML='<div class="center"><div class="box"><div class="em">🛠</div><h2>الإعداد ناقص</h2><p class="lead">افتح ملف config.js وحط رابط مشروع Supabase والمفتاح، وراجع ملف اقرأني.</p></div></div>'}
