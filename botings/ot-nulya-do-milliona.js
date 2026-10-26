<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>С нуля до миллионера</title>
<style>
:root{--bg:#e4e8ec;--card:#f7f9fa;--tx:#1c2127;--mut:#5d6873;--line:#c9d0d6;--ok:#1b8a4b;--bad:#c2362b;--warn:#c98a10;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#101418;--card:#1a2026;--tx:#e9eef2;--mut:#93a0ab;--line:#2c353d;--ok:#3ecf7a;--bad:#ff6b5e;--warn:#e8b23c}}
:root[data-theme="dark"]{--bg:#101418;--card:#1a2026;--tx:#e9eef2;--mut:#93a0ab;--line:#2c353d;--ok:#3ecf7a;--bad:#ff6b5e;--warn:#e8b23c}
html,body{margin:0}
body{background:var(--bg);color:var(--tx);font:16px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px}
main{max-width:640px;margin:0 auto}
.day{color:var(--mut);font-weight:600}
.money{font-size:clamp(40px,13vw,68px);font-weight:800;color:var(--ok);font-variant-numeric:tabular-nums;line-height:1.05;margin:2px 0 10px}
.goal{height:10px;background:var(--line);border-radius:5px;overflow:hidden}
#prog{height:100%;width:0;background:var(--ok);transition:width .3s}
.gl{font-size:13px;color:var(--mut);margin:4px 0 16px}
.stats{display:grid;gap:8px;background:var(--card);padding:12px;border-radius:8px}
.st label{display:flex;justify-content:space-between;font-size:14px;color:var(--mut)}
.bar{height:8px;background:var(--line);border-radius:4px;overflow:hidden;margin-top:3px}
.fill{height:100%;width:0;transition:width .25s}
#hp{background:var(--bad)}#food{background:var(--warn)}#en{background:var(--ok)}
#log{margin:14px 0;padding:10px 12px;border-left:4px solid var(--warn);background:var(--card);border-radius:4px;min-height:40px}
#log p{margin:0 0 4px;font-size:15px}
#log p:first-child{font-weight:700}
#log p:not(:first-child){color:var(--mut);font-size:13px}
h2{font-size:18px;margin:20px 0 8px}
.grid{display:grid;gap:8px}
button.b{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;background:var(--card);color:var(--tx);border:2px solid var(--line);border-radius:8px;padding:11px 14px;font:inherit;cursor:pointer}
button.b span{font-weight:700}
button.b small{color:var(--mut);font-size:13px}
button.b:not(:disabled):hover{border-color:var(--ok)}
button.b:disabled{opacity:.5;cursor:default}
button.b.own{opacity:1;border-color:var(--ok)}
button.b.own small{color:var(--ok)}
button:focus-visible{outline:3px solid var(--warn);outline-offset:2px}
#reset{margin:24px 0 8px;background:none;border:0;color:var(--mut);text-decoration:underline;font:inherit;cursor:pointer}
</style>
</head>
<body>
<main>
<div class="day">День <b id="day">1</b></div>
<div class="money" id="money">0 ₽</div>
<div class="goal"><div id="prog"></div></div>
<div class="gl">Цель: 1 000 000 ₽</div>
<div class="stats">
<div class="st"><label>Здоровье <span id="hpv"></span></label><div class="bar"><div id="hp" class="fill"></div></div></div>
<div class="st"><label>Сытость <span id="foodv"></span></label><div class="bar"><div id="food" class="fill"></div></div></div>
<div class="st"><label>Энергия <span id="env"></span></label><div class="bar"><div id="en" class="fill"></div></div></div>
</div>
<div id="log"></div>
<h2>Что делаем</h2>
<div class="grid" id="acts"></div>
<h2>Улучшения</h2>
<div class="grid" id="shop"></div>
<button id="reset">Начать заново</button>
</main>
<script>
const GOAL=1e6,$=id=>document.getElementById(id);
const fmt=n=>Math.round(n).toLocaleString("ru-RU")+" ₽";
const rnd=(a,b)=>Math.round(a+Math.random()*(b-a));
const UP=[
{id:"docs",n:"Восстановить документы",p:200,d:"открывает разгрузку вагонов"},
{id:"cart",n:"Тележка",p:500,d:"бутылки приносят вдвое больше"},
{id:"hostel",n:"Койка в ночлежке",p:700,d:"ночью не холодно, воруют реже"},
{id:"phone",n:"Телефон",p:1500,r:"docs",d:"открывает работу курьером"},
{id:"room",n:"Своя комната",p:10000,r:"hostel",d:"сон лечит, ничего не воруют"},
{id:"laptop",n:"Ноутбук",p:12000,r:"phone",d:"открывает фриланс"},
{id:"kiosk",n:"Ларёк",p:40000,r:"phone",d:"+6 000 ₽ каждый день",inc:6000},
{id:"courses",n:"Курсы",p:60000,r:"laptop",d:"открывают крупные проекты"},
{id:"flat",n:"Квартира",p:150000,r:"room",d:"энергии на день больше (130)"},
{id:"cafe",n:"Кафе",p:150000,r:"kiosk",d:"+25 000 ₽ каждый день",inc:25000},
{id:"corp",n:"Своя компания",p:400000,r:"cafe",d:"+80 000 ₽ каждый день",inc:80000}
];
const JOBS=[
{id:"bottles",n:"Собирать бутылки",e:25,f:8,a:[60,100]},
{id:"unload",n:"Разгружать вагоны",e:35,f:10,a:[300,450],need:"docs"},
{id:"courier",n:"Работать курьером",e:30,f:10,a:[900,1200],need:"phone"},
{id:"free",n:"Фриланс за ноутбуком",e:30,f:8,a:[4000,5500],need:"laptop"},
{id:"proj",n:"Вести крупный проект",e:40,f:10,a:[25000,35000],need:"courses"}
];
let S=load();
function fresh(){return{money:0,hp:100,food:60,en:100,day:1,own:{},fed:false,over:false,won:false,log:["Вы остались ни с чем. Нужно выжить и подняться."]}}
function load(){try{const s=localStorage.getItem("mill1");if(s)return JSON.parse(s)}catch(e){}return fresh()}
function save(){try{localStorage.setItem("mill1",JSON.stringify(S))}catch(e){}}
const maxEn=()=>S.own.flat?130:100;
function say(t){S.log.unshift(t);S.log=S.log.slice(0,5)}
function check(){if(S.money>=GOAL&&!S.won&&!S.over){S.won=true;say("Миллион собран! Вы выбрались из нищеты.")}}

function work(j){
  if(S.over||S.won||S.en<j.e)return;
  S.en-=j.e;S.food=Math.max(0,S.food-j.f);
  const g=rnd(j.a[0],j.a[1])*(j.id==="bottles"&&S.own.cart?2:1);
  S.money+=g;say(j.n+": +"+fmt(g));check();draw();
}
function eat(k){
  if(S.over||S.won)return;
  if(k===0){if(S.fed||S.en<10)return;S.fed=true;S.en-=10;S.food=Math.min(100,S.food+30);say("Поели в столовой бесплатно.")}
  if(k===1){if(S.money<60)return;S.money-=60;S.food=Math.min(100,S.food+30);say("Съели дошик (−60 ₽).")}
  if(k===2){if(S.money<400)return;S.money-=400;S.food=Math.min(100,S.food+60);S.hp=Math.min(100,S.hp+10);say("Нормальный обед (−400 ₽).")}
  draw();
}
function sleep(){
  if(S.over||S.won)return;
  const m=[];
  S.food=Math.max(0,S.food-25);
  if(S.food===0){S.hp-=25;m.push("Голод подкосил здоровье (−25)")}
  if(S.own.room)S.hp=Math.min(100,S.hp+10);
  else if(!S.own.hostel){S.hp-=8;m.push("Ночь на улице, холодно (−8 здоровья)")}
  const risk=S.own.room?0:S.own.hostel?.08:.25;
  if(S.money>=50&&Math.random()<risk){const l=Math.round(S.money*(.1+Math.random()*.15));S.money-=l;m.push("Ночью украли "+fmt(l))}
  let inc=0;UP.forEach(u=>{if(u.inc&&S.own[u.id])inc+=u.inc});
  if(inc){S.money+=inc;m.push("Доход бизнеса: +"+fmt(inc))}
  const r=Math.random();
  if(r<.12){const g=Math.max(50,Math.round(S.money*.02));S.money+=g;m.push("Нашли кошелёк: +"+fmt(g))}
  else if(r<.2){S.hp-=12;m.push("Подхватили простуду (−12 здоровья)")}
  S.en=maxEn();S.day++;S.fed=false;
  if(S.hp<=0){S.over=true;S.hp=0;say("Здоровье закончилось. Вы не выжили.")}
  else say("День "+S.day+". "+(m.join(". ")||"Ночь прошла спокойно."));
  check();draw();
}
function buy(u){
  if(S.own[u.id]||S.money<u.p||(u.r&&!S.own[u.r])||S.over||S.won)return;
  S.money-=u.p;S.own[u.id]=1;say("Куплено: "+u.n);
  if(u.id==="flat")S.en+=30;
  draw();
}
function reset(){S=fresh();draw()}

function btn(t,s,fn,dis){const b=document.createElement("button");b.className="b";b.disabled=!!dis;b.innerHTML="<span>"+t+"</span><small>"+s+"</small>";b.onclick=fn;return b}
function bar(id,v,max){$(id).style.width=Math.max(0,Math.min(100,v/max*100))+"%";$(id+"v").textContent=Math.round(v)+" / "+max}
function draw(){
  $("day").textContent=S.day;$("money").textContent=fmt(S.money);
  $("prog").style.width=Math.min(100,S.money/GOAL*100)+"%";
  bar("hp",S.hp,100);bar("food",S.food,100);bar("en",S.en,maxEn());
  $("log").innerHTML=S.log.map(l=>"<p>"+l+"</p>").join("");
  const a=$("acts"),end=S.over||S.won;a.innerHTML="";
  if(end)a.appendChild(btn(S.won?"Вы миллионер! Сыграть ещё":"Вы не выжили. Начать заново","нажмите, чтобы начать с нуля",reset));
  else{
    JOBS.filter(j=>!j.need||S.own[j.need]).forEach(j=>{
      const k=j.id==="bottles"&&S.own.cart?2:1;
      a.appendChild(btn(j.n,"−"+j.e+" энергии, +"+fmt(j.a[0]*k)+" … "+fmt(j.a[1]*k),()=>work(j),S.en<j.e));
    });
    a.appendChild(btn("Поесть в столовой","бесплатно, раз в день, +30 сытости",()=>eat(0),S.fed||S.en<10));
    a.appendChild(btn("Купить дошик","60 ₽, +30 сытости",()=>eat(1),S.money<60));
    a.appendChild(btn("Нормальный обед","400 ₽, +60 сытости, +10 здоровья",()=>eat(2),S.money<400));
    a.appendChild(btn("Лечь спать","закончить день",sleep));
  }
  const sh=$("shop");sh.innerHTML="";
  UP.forEach(u=>{
    const own=S.own[u.id],lock=u.r&&!S.own[u.r];
    const b=btn(u.n,own?"куплено — "+u.d:lock?"сначала: "+UP.find(x=>x.id===u.r).n:fmt(u.p)+" — "+u.d,()=>buy(u),own||lock||S.money<u.p||end);
    if(own)b.classList.add("own");
    sh.appendChild(b);
  });
  save();
}
let armed=false;
$("reset").onclick=()=>{
  if(!armed){armed=true;$("reset").textContent="Нажмите ещё раз, чтобы сбросить";setTimeout(()=>{armed=false;$("reset").textContent="Начать заново"},3000)}
  else{armed=false;$("reset").textContent="Начать заново";reset()}
};
draw();
</script>
</body>
</html>
