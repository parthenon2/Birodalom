/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   28/B. TÉRKÉPI ESEMÉNYEK

   Nagyjából percenként megtörténhet valami, ami felborítja a megszokott
   menetet. Mind meglévő rendszerekre épül, nem újakra:

     Kereskedőhajó  — fegyvertelen, kinccsel megrakott hajó vág át a vízen.
                      Ha elsüllyeszted, a rakomány a tiéd.
     Roncs a parton — aranyat rejtő roncs sodródik partra; küldj oda munkást.
     Zsoldosok      — vándorló katonák ajánlkoznak aranyért. Elfogadod?
     Pestis         — a bázis körül járvány üti fel a fejét, és apasztja a
                      seregedet, amíg le nem cseng.

   Minden eseményt üzenet vezet be, és a minitérképen jelölés mutatja a
   helyét, hogy ne kelljen keresgélni.
   ===================================================================== */

const EVENT_MIN=55, EVENT_MAX=95;      // ennyi másodpercenként sorsolunk
const EVENT_CHANCE=0.55;               // ekkora eséllyel történik is valami

function eventReset(){
  G.eventT=EVENT_MIN+srnd()*(EVENT_MAX-EVENT_MIN);
}

/* --- 1. Kereskedőhajó --- */
function evMerchant(){
  // a térkép egyik szélétől a másikig, vízen
  let start=null, cel=null;
  for(let i=0;i<400&&!start;i++){
    const x=srange(60,WORLD.w-60), y=srange(60,WORLD.h-60);
    if(isWater(x,y)) start={x,y};
  }
  if(!start) return false;
  for(let i=0;i<400&&!cel;i++){
    const x=srange(60,WORLD.w-60), y=srange(60,WORLD.h-60);
    if(isWater(x,y)&&dist(x,y,start.x,start.y)>700) cel={x,y};
  }
  if(!cel) return false;
  const h=makeUnit('fisher',1,start.x,start.y,G.age);
  h.treasure=180+Math.round(srnd()*220);
  h.merchant=true;
  h.maxHp=Math.round(h.maxHp*1.6); h.hp=h.maxHp;
  h.order={type:'move',x:cel.x,y:cel.y};
  G.units.push(h);
  toast(T('uzKereskedoTunt')+' '+h.treasure+' '+T('nyArany').toLowerCase()+'.');
  SFX.play('ready',0.7);
  return true;
}

/* --- 2. Partra vetett roncs --- */
function evWreck(){
  let hely=null;
  for(let i=0;i<500&&!hely;i++){
    const x=srange(80,WORLD.w-80), y=srange(80,WORLD.h-80);
    if(!onLand(x,y)) continue;
    // partközeli legyen: a közelben legyen víz
    let viz=false;
    for(let a=0;a<8&&!viz;a++){
      const ang=a*TAU/8;
      if(isWater(x+dcos(ang)*70,y+dsin(ang)*70)) viz=true;
    }
    if(viz&&fogAt(x,y)!==undefined) hely={x,y};
  }
  if(!hely) return false;
  const n=makeNode('gold',hely.x,hely.y);
  n.amount=260+Math.round(srnd()*260);
  n.wreck=true;
  G.nodes.push(n);
  toast(T('uzRoncs'));
  SFX.play('ready',0.7);
  return true;
}

/* --- 3. Zsoldosok --- */
function evMercs(){
  const db=2+Math.floor(srnd()*3);
  const ar=Math.round((90+srnd()*80)*db/2);
  const szerep=['melee','ranged','spear'][Math.floor(srnd()*3)];
  G.offer={type:'mercs', db, ar, szerep, t:G.t, lejar:28};
  toast(db+' zsoldos ajánlkozik '+ar+' aranyért. Elfogadod?');
  SFX.play('select',0.9);
  return true;
}
function acceptOffer(){
  const o=G.offer;
  if(!o) return;
  if(o.type==='mercs'){
    if((G.res.gold||0)<o.ar){ toast(T('uzNincsAranyad2')); SFX.play('deny'); return; }
    G.res.gold-=o.ar;
    const hq=G.builds.filter(b=>!b.dead&&b.owner===ENID&&b.type==='hq')[0];   /* zsoldos: a VÁSÁRLÓ bázisa (parancsból fut, ENID = a vevő) */
    const bx=hq?hq.x:WORLD.w/2, by=hq?hq.y:WORLD.h/2;
    for(let i=0;i<o.db;i++){
      const p=freeSpot(bx,by+110,40+i*12,10);
      const u=makeUnit(o.szerep,0,p?p.x:bx,p?p.y:by+110,G.age);
      u.kills=2;                          // tapasztalt zsoldosok, egy ölésre a rangtól
      G.units.push(u);
    }
    toast(o.db+' zsoldos állt a szolgálatodba.');
    SFX.play('ready');
  }
  G.offer=null; syncUI();
}
function declineOffer(){
  if(!G.offer) return;
  G.offer=null; SFX.play('click'); syncUI();
}

/* Melyik felet éri az esemény? A HELYI játékos nem jó válasz: minden
   gépen mást jelentene, és a világok szétcsúsznának. Ezért a szimulációs
   magból sorsolunk — az minden gépen ugyanazt adja. */
function esemenyFel(){
  const elok=(G.oldalak||[]).filter(o=>!o.kiesett);
  if(!elok.length) return 0;
  return elok[srangeInt(0,elok.length-1)].i;
}
/* --- 4. Pestis --- */
function evPlague(){
  const fel=esemenyFel();
  const hq=G.builds.filter(b=>!b.dead&&b.owner===fel&&b.type==='hq')[0];
  if(!hq) return false;
  G.plague={x:hq.x, y:hq.y, r:300, t:0, hossz:22, fel:fel};
  if(fel===(typeof helyiFel==='function'?helyiFel():0)) toast(T('uzPestis'));
  SFX.play('deny',0.9);
  return true;
}

/* --- A sorsolás --- */
function eventTick(dt){
  if(!G.on||G.over) return;
  // futó pestis
  if(G.plague){
    G.plague.t+=dt;
    const r2=G.plague.r*G.plague.r;
    for(const u of G.units){
      if(u.dead||u.owner!==ENID) continue;
      const dx=u.x-G.plague.x, dy=u.y-G.plague.y;
      if(dx*dx+dy*dy>r2) continue;
      u.hp-=u.maxHp*0.014*dt;             // lassú sorvasztás, nem öl azonnal
      if(u.hp<1) u.hp=1;                  // a pestis nem öl meg senkit egyedül
      u.plagued=G.t;
    }
    if(G.plague.t>=G.plague.hossz){ G.plague=null; toast(T('uzJarvanyVege')); }
  }
  // lejáró ajánlat
  if(G.offer&&G.t-G.offer.t>G.offer.lejar){ G.offer=null; syncUI(); }

  if(G.eventT===undefined) eventReset();
  G.eventT-=dt;
  if(G.eventT>0) return;
  eventReset();
  if(srnd()>EVENT_CHANCE) return;
  // súlyozott sorsolás: a hajó és a roncs gyakoribb, a pestis ritka
  const lista=[[evMerchant,3],[evWreck,3],[evMercs,3],[evPlague,1]];
  let ossz=0; for(const [,w] of lista) ossz+=w;
  let r=srnd()*ossz;
  for(const [fn,w] of lista){ r-=w; if(r<=0){ fn(); return; } }
}

/* A kereskedőhajó zsákmánya, ha elsüllyed */
function merchantLoot(u,from){
  if(!u||!u.merchant||!u.treasure) return;
  if(from&&from.owner===helyiFel()){
    G.res.gold+=u.treasure;
    G.earned.gold=(G.earned.gold||0)+u.treasure;
    toast(T('uzZsakmany')+': '+u.treasure+' '+T('uzArany'));
    SFX.at('ready',u.x,u.y,1);
    G.fx.push({x:u.x,y:u.y,t:0,life:0.8,type:'boom',r:24});
  }
  u.treasure=0;
}
