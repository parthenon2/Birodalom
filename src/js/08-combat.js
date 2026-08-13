/* =======================================================================
   8. HARC — ellenfogás, páncél, sebzésszámítás

   Kő-papír-olló háromszög: a pikás felfogja a lovasrohamot, a lovasság
   szétszórja a lövészeket, a lövészek pedig a lassú pikásokat aprítják.
   A páncél fix levonás, ezért a sok apró találat (puska, géppuska) alig
   karcolja a harckocsit — arra a páncéltörő való.
   ===================================================================== */
const COUNTER={
  siege:{worker:0.6,melee:0.5,ranged:0.6,spear:0.5,priest:0.6,medic:0.6,siege:1,cav:0.55},
  ram:{worker:0.15,melee:0.12,ranged:0.15,spear:0.12,priest:0.15,medic:0.15,siege:0.2,cav:0.12},
  // A védelmi épületek nehézfegyvert hordoznak, ezért a páncél kevésbé fogja ki:
  tower: {melee:1.25, ranged:1.30, spear:1.25, worker:1.2, priest:1.5, cav:1.35},
  /* A pika MINDEN lovas ellen jó — a könnyű ellen még jobban, mert azon
     nincs páncél, ami felfogná a szúrást. */
  spear: {melee:1.85, ranged:0.70, spear:1, worker:1.1, priest:1.6, cav:2.20},
  melee: {ranged:1.70, spear:0.60, melee:1, worker:1.5, priest:1.7, cav:1.15},
  ranged:{spear:1.50, melee:0.75, ranged:1, worker:1.2, priest:1.6, cav:0.80},
  /* A könnyűlovas a lövészre és a munkásra való. Pikára rárohanni
     öngyilkosság, a páncélos nehézlovas ellen pedig nincs mit tennie. */
  cav:   {ranged:1.90, worker:1.80, priest:1.8, spear:0.45, melee:0.75, cav:1},
  worker:{worker:1, melee:1, ranged:1, spear:1, priest:1, cav:1},
  priest:{worker:1, melee:1, ranged:1, spear:1, priest:1, cav:1},
  warship:{worker:1.2, melee:1.1, ranged:1.2, spear:1.2, priest:1.4, fisher:1.6, warship:1, cav:1.2},
  fisher:{}
};
/* Az egységek egymáshoz mért erőssége. Nyelvfüggő, ezért függvény: a
   szótárból olvassuk, hogy nyelvváltáskor a buboréksúgó is forduljon. */
const COUNTER_KEY={priest:'ctPriest',melee:'ctMelee',ranged:'ctRanged',
                   spear:'ctSpear',worker:'ctWorker',cav:'ctCav'};
function counterText(role){
  const k=COUNTER_KEY[role];
  return k?T(k):'';
}
const BUILD_ARMOR=4;
function vsBuilding(a){                 // ki mennyit ér az épületek ellen
  if(a.kind==='build') return 1;
  if(a.ram) return 5;                                // faltörő kos: erre való
  if(a.siege) return 3;                              // ostromgép: falbontásra való
  if(a.role==='melee')  return a.age===3?1.7:1;      // harckocsi: ostromfegyver
  if(a.role==='spear')  return a.age===3?1.1:0.5;
  if(a.role==='warship')return 1.2;                  // hajóágyú a partot lövi
  if(a.role==='ranged') return 0.45;                 // nyíl és golyó nem bont falat
  return 0.5;
}
function effDamage(a,t){
  // A hős aurája: nagyobb ütés a támadónak, több páncél a védőnek
  let d=a.dmg*(1+(a.auraDmg||0))*((typeof formMul==='function')?formMul(a,'dmg'):1);
  /* A hős csatakiáltása: nyolc másodpercig nagyobbat üt, aki hallotta. */
  if(typeof kialtasSebzes==='function') d*=kialtasSebzes(a);
  if(t.kind==='build') d=d*vsBuilding(a)-BUILD_ARMOR;
  else{
    const tab=a.kind==='build'?COUNTER.tower:(COUNTER[a.role]||COUNTER.ranged);
    d=d*((tab[t.role])||1)-((t.armor||0)+(t.auraArmor||0));
    /* Sűrű erdőben nehezebb eltalálni valakit: a fák felfogják a
       lövedékek egy részét, és a közelharcban sem lehet rendesen
       kitörni. Nem páncél, hanem takarás — ezért szorzó, nem levonás. */
    if(typeof terepVedelem==='function') d*=terepVedelem(t.x,t.y);
  }
  return Math.max(1,d);
}
function damage(e,dmg,from,toltet){
  if(e.dead) return;
  /* TÖLTET. Hajó ellen a lövedék fajtája dönti el, mi sérül: a golyó a
     testet, a láncos a vitorlázatot, a kartács a legénységet. */
  let legenySzorzo=1;
  if(toltet&&e.naval&&typeof toltetAdat==='function'){
    const t=toltetAdat(toltet);
    dmg*=t.test;
    legenySzorzo=t.legeny;
    if(t.vitorla){
      e.sailDmg=Math.min(1,(e.sailDmg||0)+t.vitorla*0.09);
      if(!REDUCED) G.fx.push({x:e.x+rnd(-8,8),y:e.y-10,t:0,life:.5,type:'hit'});
    }
  }
  /* Hajón a találat nem csak a testet bontja: embert is öl. Az elesett
     legénység az átszálláskor hiányzik majd — egy szétlőtt hajót könnyebb
     elfoglalni, mint egy épet. */
  if(e.crewMax&&e.crew>0&&e.maxHp>0){
    const arany=Math.min(1,dmg/e.maxHp);
    e.crew=Math.max(0, e.crew - e.crewMax*arany*0.80*legenySzorzo);
  }
  e.hp-=dmg;
  e.hitAt=G.t;
  if(e.hp<=0){
    e.dead=true;
    if(typeof helyHang==='function') helyHang(e.kind==='build'?'destroy':'die', e.x, e.y, 0.85);
    /* A föld emlékszik. Az elesett katona után elhagyott fegyver marad,
       a leomlott épület után égett folt — méretarányosan. */
    if(typeof nyomHozzaad==='function'){
      if(e.kind==='build') nyomHozzaad(NYOM_EGES, e.x, e.y, 1.6+Math.max(e.w||40,e.h||40)/70);
      else if(Math.random()<0.4) nyomHozzaad(NYOM_FEGYVER, e.x, e.y, 1);
    }
    G.fx.push({x:e.x,y:e.y,t:0,life:.5,type:'boom',r:hitRadius(e)});
    SFX.at(e.kind==='build'?'destroy':'die',e.x,e.y,e.kind==='build'?1:0.8);
    if(e.kind==='unit'){
      if(e.air) crashPlane(e);                 // a gép lezuhan és kigyullad
      else if(e.naval&&typeof sinkShip==='function') sinkShip(e);  // a hajó elsüllyed
      else dropCorpse(e);                      // a katona elesik, vértócsa marad
      if(typeof playDeath==='function') playDeath(e.x,e.y);
    }
    if(e.owner===1&&e.kind==='unit') G.kills=(G.kills||0)+1;
    /* HÍRNÉV: minden ellenséges veszteség öregbíti a nevedet — és növeli
       az esélyt, hogy a király hajóhadat küld rád. */
    if(typeof hirnevAd==='function'&&e.owner===1&&from&&from.owner===0)
      hirnevAd(e.kind==='unit'?(e.naval?6:1.2):2);
    if(typeof creditKill==='function') creditKill(from,e);   // veteránság
    if(typeof merchantLoot==='function') merchantLoot(e,from); // kereskedőhajó zsákmánya
    if(e.kind==='build'){ G.navVer++;                      // az épület eltűnt: új útvonalak nyílnak
      if(e.owner===0) toast('Elveszett: '+BUILDS[e.type].names[e.age]); }
  }else if(e.kind==='unit'&&((typeof ellenseg==='function')?ellenseg(from.owner,e.owner):(e.owner!==from.owner))
           &&!e.order&&!e.target){
    e.target=from; // visszavág, ha megtámadják
  }
}
// A puskapor kora: a lőfegyverek szenet égetnek. Ha nincs, néma marad a
// fegyver — a közelharci egységeket ez nem érinti.
let coalWarn=-99;
function coalNeed(a){
  const age=a.age;
  if(age<COAL_AGE) return 0;
  if(a.kind==='build') return BUILDS[a.type].dmg?COAL_COST.tower:0;
  if(a.siege) return COAL_COST.ranged*2.2;          // az ostromgép sok puskaport nyel
  if(a.role==='ranged')  return COAL_COST.ranged;
  // A hajóágyú puskaporral lő, nem szénnel. Korábban a szénhiány néma
  // flottát eredményezett — a tengeri csata megállt a semmi közepén.
  if(a.role==='warship') return 0;
  if(a.role==='melee'&&age===3) return COAL_COST.melee;    // harckocsi
  if(a.role==='spear'&&age===3) return COAL_COST.melee*0.6; // páncéltörő
  return 0;
}
function hasCoal(a){
  const need=coalNeed(a);
  if(!need) return true;
  /* A fél SAJÁT raktára. A régi alak minden nem-nulla tulajdonost „a gép”-nek
     vett, ezért több félnél a 2. játékos nyersanyaga az ELSŐ BOT
     készletébe folyt volna. */
  const store=(typeof resOf==='function')?resOf(a.owner):(a.owner?G.ai.res:G.res);
  if((store.coal||0)<need){
    if(!a.owner&&G.t-coalWarn>12){
      coalWarn=G.t;
      toast(T('uzNincsSzen'));
    }
    return false;
  }
  store.coal-=need;
  return true;
}
// A levegőbe csak a vadász, a 20. századi lövész és a korszerű torony lő.
// A bombázó és a felderítő nem harcol repülővel.
function canEngage(a,t){
  if(!t||t.dead) return false;
  if(t.air){
    if(a.kind==='build') return a.age===3;
    if(a.antiAir) return true;
    return a.age===3&&a.role==='ranged';
  }
  if(a.air) return !!a.bomb;              // csak a bombázó üt földi célt
  return true;
}
/* -----------------------------------------------------------------------
   ATOMCSAPÁS

   Az akadémián kikutatott atomprogram után a bombázó egyszeri csapást
   mérhet: kijelölöd a célpontot, a gép odarepül, és a becsapódás 2x2
   majorságnyi területen mindent megsemmisít — épületet, katonát,
   lelőhelyet egyaránt, függetlenül attól, kié.
   ----------------------------------------------------------------------- */
const ATOM_R=Math.round(Math.max(BUILDS.farm.w,BUILDS.farm.h)*2*0.5+18);
function atomStrike(x,y,owner){
  if(owner===0&&typeof achGet==='function') achGet('atomic');
  SFX.at('boom',x,y,1.6);
  G.shake=Math.max(G.shake||0,1.6);
  G.fx.push({x,y,t:0,life:3.2,type:'atom'});
  for(const u of G.units){
    if(u.dead||u.air) continue;
    if(dist(u.x,u.y,x,y)<ATOM_R) damage(u,99999,null);
  }
  for(const b of G.builds){
    if(b.dead) continue;
    if(dist(b.x,b.y,x,y)<ATOM_R+16) damage(b,99999,null);
  }
  for(const n of G.nodes){
    if(n.dead) continue;
    if(dist(n.x,n.y,x,y)<ATOM_R) { n.dead=true; }
  }
  G.scorch=G.scorch||[];
  G.scorch.push({x,y,r:ATOM_R});
  G.navVer++;
  toast(owner===0?'Atomcsapás! A terület kihalt.':'Atomcsapás érte a birodalmat!');
}
// A becsapódás nem pontszerű: a bomba a környezetét is megtépázza.
const BOMB_R=46;
function bombHit(x,y,dmg,src){
  SFX.at('boom',x,y,1.1);
  G.shake=Math.max(G.shake||0,0.5);
  G.fx.push({x,y,t:0,life:0.7,type:'bomb'});
  const owner=src?src.owner:0;
  for(const u of G.units){
    if(u.dead||u.air||u.owner===owner) continue;
    const d=dist(u.x,u.y,x,y);
    if(d<BOMB_R) damage(u,dmg*(1-d/BOMB_R*0.55),src);
  }
  for(const b of G.builds){
    if(b.dead||b.owner===owner) continue;
    const d=dist(b.x,b.y,x,y);
    if(d<BOMB_R+18) damage(b,dmg*0.8,src);
  }
}
function attack(a,target){
  const p=a.kind==='build'?BUILDS[a.type]:UNITS[a.role];
  const spd=val(p.proj,a.age);
  SFX.at(weaponSound(a.kind==='build'?(a.age===3?'spear':'ranged'):a.role,a.age),
         a.x,a.y,a.kind==='build'?0.9:0.75);
  const dmg=effDamage(a,target);
  if(a.bomb){
    // A bombázó nem lő: kioldja a bombát, az pedig zuhan. A becsapódás
    // helye a célpont MOSTANI helye — mozgó cél elől ki lehet térni.
    SFX.at('place',a.x,a.y,0.5);
    G.projs.push({bomb:true, x:a.x, y:a.y-AIR_ALT, tx:target.x, ty:target.y,
      z:AIR_ALT, dmg, owner:a.owner, src:a, style:'bomb',
      fall:0, fallT:0.85, dead:false});
    return;
  }
  /* --- A HARC HANGJA ---
     A hangkönyvtárban régóta megvolt az `arrow`, a `clang` és a `die`,
     de senki nem szólította meg őket: a csata néma volt. A hangerőt a
     KÉPERNYŐTŐL VALÓ TÁVOLSÁG szabja meg — ami a látótéren kívül esik,
     az halkabb, a nagyon távoli meg sem szólal. Enélkül egy nagy
     térképen mindenki csatája egyszerre dörögne a füledben.

     A hangkönyvtárnak külön szünetideje van hangonként (SFX_CD), tehát
     egy tömegjelenet sem lesz recsegés: a fölösleges hívások eldobódnak. */
  if(typeof harcHang==='function') harcHang(a,target,spd);

  if(spd){ // lövedék
    /* Hajóágyú: nem egy lövés, hanem SORTŰZ. Az ágyúk a célpont felőli
       oldalon sorakoznak, mindegyik villan és füstöl — annyi, amennyi a
       hajón van. Ettől látszik, mekkora hajóval van dolgod. */
    if(a.guns&&!REDUCED&&typeof broadside==='function') broadside(a,target);
    // a hajóágyú töltete a lövedékkel utazik: a becsapódáskor dönti el a hatást
    const tolt=(a.guns&&typeof toltetOf==='function')?toltetOf(a.owner):null;
    G.projs.push({x:a.x,y:a.y-(a.kind==='build'?10:6),target,dmg,spd,owner:a.owner,src:a,toltet:tolt,
      style:a.age===0?'arrow':(a.age<3?'ball':'tracer'),dead:false});
  }else{
    damage(target,dmg,a);
    G.fx.push({x:target.x,y:target.y,t:0,life:.18,type:'hit'});
  }
}
