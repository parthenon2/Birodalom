/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   7/C. ELLÁTÁS ÉS KERESKEDELMI ÚTVONAL

   ELLÁTÁS
     A sereg eszik. Minden katona másodpercenként egy keveset fogyaszt a
     készletből; a munkás keveset, a hős és a hajó többet. Ha kifogy az
     élelem, a katonák lassan gyengülni kezdenek — nem halnak meg éhen, de
     harcképtelenné válnak.

     Ettől a nagy sereg döntés lesz, nem automatizmus: a majorság végre
     stratégiai célpont, és az ellenség földjének felégetése is fegyver.

   KERESKEDELMI ÚTVONAL
     Ha áll a kikötőd, időnként kereskedőhajó indul belőle egy semleges
     kikötő felé, és arannyal tér vissza. Az ellenség elsüllyesztheti —
     tehát a jövedelem sebezhető, és őrizni kell.
   ===================================================================== */

/* --- Ellátás --- */
const UPKEEP={
  worker:0.010, melee:0.036, ranged:0.032, spear:0.032, priest:0.026,
  medic:0.024, siege:0.055, hero:0.090,
  fisher:0.018, warship:0.055, transport:0.040,
  scout:0.026, fighter:0.060, bomber:0.075
};
const STARVE_RATE=0.006;        // éhezéskor ennyi életerő fogy másodpercenként

function upkeepOf(owner){
  let n=0;
  for(const u of G.units){
    if(u.dead||u.owner!==owner) continue;
    n+=UPKEEP[u.role]||0.03;
    if(u.cargo) for(const c of u.cargo) if(c.owner===owner) n+=UPKEEP[c.role]||0.03;
  }
  return n;
}
/* A majorságok és a halászok bevétele — ebből látszik, jó úton jársz-e. */
function foodIncome(owner){
  let n=0;
  for(const b of G.builds){
    if(b.dead||!b.done||b.owner!==owner) continue;
    const d=BUILDS[b.type];
    if(d.food) n+=val(d.food,b.age)*PACE.farm*doctMul(owner,'food')*upgMul(owner,'yield');
  }
  return n;
}
function supplyTick(dt){
  /* A hurok a MENÜBEN is fut, amikor még nincs bot: ilyenkor G.ai null.
     Enélkül az ellenőrzés nélkül az egész játékhurok elhalt, és a képernyő
     feketén maradt — miközben a felület látszólag rendben működött. */
  if(!G.on) return;
  for(const owner of [0,1]){
    const store=(typeof resOf==='function')?resOf(owner):(owner?(G.ai&&G.ai.res):G.res);
    if(!store) continue;
    const kell=upkeepOf(owner)*dt;
    if(store.food>=kell){
      store.food-=kell;
      if(!owner) G.starving=false;
      continue;
    }
    // nincs elég: ami van, elfogy, a többiek éheznek
    store.food=0;
    if(!owner){
      if(!G.starving){
        G.starving=true;
        toast(T('uzEhezes'));
        SFX.play('deny',0.9);
      }
    }
    for(const u of G.units){
      if(u.dead||u.owner!==owner||u.role==='worker') continue;
      u.hp-=u.maxHp*STARVE_RATE*dt;
      if(u.hp<1) u.hp=1;                  // az éhezés nem öl, csak harcképtelenné tesz
      u.starved=G.t;
    }
  }
}

/* --- Kereskedelmi útvonal --- */
const TRADE_EVERY=75;           // ennyi másodpercenként indul hajó
const TRADE_GOLD=[110,150,200,260];

function tradeRouteTick(dt){
  if(!G.on) return;
  G.tradeT=(G.tradeT===undefined?TRADE_EVERY:G.tradeT)-dt;
  if(G.tradeT>0) return;
  G.tradeT=TRADE_EVERY;
  /* MINDEN fél kikötője indíthat kereskedőhajót, nem csak a helyi
     játékosé — utóbbi gépenként mást jelentene, és szétcsúszást okozna. */
  const kik=G.builds.filter(b=>!b.dead&&b.done&&b.type==='harbor');
  if(!kik.length) return;
  if(G.units.some(u=>!u.dead&&u.trader)) return;    // egyszerre egy úton
  const h=kik[rndInt(0,kik.length-1)];
  // a semleges kikötő: a térkép túlsó felén, vízen
  let cel=null;
  for(let i=0;i<500&&!cel;i++){
    const x=rnd(60,WORLD.w-60), y=rnd(60,WORLD.h-60);
    if(isWater(x,y)&&dist(x,y,h.x,h.y)>900) cel={x,y};
  }
  if(!cel) return;
  // a kikötő melletti vízre tesszük
  let px=h.x, py=h.y+50;
  for(let r=40;r<=140;r+=20){
    let megvan=false;
    for(let i=0;i<12;i++){
      const a=i*TAU/12;
      const x=h.x+Math.cos(a)*r, y=h.y+Math.sin(a)*r;
      if(isWater(x,y)){ px=x; py=y; megvan=true; break; }
    }
    if(megvan) break;
  }
  /* A hajó ANNAK a félnek a tulajdona, akinek a kikötőjéből indult —
     korábban mindig a 0. fél kapta, tehát több félnél a másik kikötőjéből
     induló hajó is a házigazdának hozta volna az aranyat. */
  const t=makeUnit('fisher',h.owner,px,py,G.age);
  t.trader=true;
  t.homeX=h.x; t.homeY=h.y;
  t.gold=val(TRADE_GOLD,G.age);
  t.maxHp=Math.round(t.maxHp*1.5); t.hp=t.maxHp;
  t.phase='oda';
  t.order={type:'move',x:cel.x,y:cel.y};
  G.units.push(t);
  if(h.owner===(typeof helyiFel==='function'?helyiFel():0))
    toast(T('uzKereskedoIndult')+' — '+t.gold+' '+T('uzArannyalTer'));
}
/* A kereskedőhajó útja: oda, majd vissza. Ha hazaér, fizet. */
function traderTick(u,dt){
  if(!u.trader) return false;
  const o=u.order;
  if(u.phase==='oda'){
    if(!o||dist(u.x,u.y,o.x,o.y)<70){
      u.phase='vissza';
      u.order={type:'move',x:u.homeX,y:u.homeY};
      if(u.owner===(typeof helyiFel==='function'?helyiFel():0)) toast(T('uzKereskedoVissza'));
    }
    return false;
  }
  if(u.phase==='vissza'&&dist(u.x,u.y,u.homeX,u.homeY)<90){
    G.res.gold+=u.gold;
    G.earned.gold=(G.earned.gold||0)+u.gold;
    toast(T('uzKereskedoBeert')+': +'+u.gold+' arany.');
    SFX.at('ready',u.x,u.y,0.9);
    u.dead=true;
    return true;
  }
  return false;
}
