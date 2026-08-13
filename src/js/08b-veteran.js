/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   8/B. VETERÁNSÁG ÉS HARCI ÁLLÁS

   VETERÁNSÁG
     Minden egység gyűjti az öléseit. Három ölés után veterán, hat után
     elit. Fokozatonként +10% sebzés és +10% életerő. Egy megélt csapat
     többet ér, mint egy friss — érdemes vigyázni rájuk.

   HARCI ÁLLÁS
     Három viselkedés, egységenként:
       Támadó       — magától célt fog és üldözi (pórázon)
       Tartsd       — nem mozdul, csak arra lő, ami hatótávba ér
       Visszavonul  — ha az életereje 40% alá esik, elhátrál a harcból
   ===================================================================== */

const VET_KILLS=[0,3,6];                      // ennyi ölés kell a fokozathoz
const VET_NEV=['újonc','veterán','elit'];
const VET_BONUS=0.10;                         // fokozatonként ennyivel jobb

function vetRank(u){
  const k=u.kills||0;
  if(k>=VET_KILLS[2]) return 2;
  if(k>=VET_KILLS[1]) return 1;
  return 0;
}
/* Előléptetés. A sebzést és az életerőt is emeljük; a meglévő sebesülés
   arányát megtartjuk, hogy az előléptetés ne gyógyítson teljesen. */
function vetPromote(u){
  const uj=vetRank(u);
  if(uj===(u.vet||0)) return false;
  const arany=u.hp/u.maxHp;
  const regi=1+(u.vet||0)*VET_BONUS, most=1+uj*VET_BONUS;
  u.vet=uj;
  u.dmg=u.dmg/regi*most;
  u.maxHp=Math.round(u.maxHp/regi*most);
  u.hp=Math.min(u.maxHp, Math.max(1, Math.round(u.maxHp*arany)+Math.round(u.maxHp*0.08)));
  u.vetAt=G.t;                                // a rajzolás ebből villan
  if(u.owner===ENID){
    SFX.at('ready',u.x,u.y,0.6);
    toast(UNITS[u.role].names[u.age]+' '+T('uzEloleptetve')+': '+VET_NEV[uj]+'.');
  }
  return true;
}
// Egy ölés jóváírása annak, aki elejtette
function creditKill(oles,aldozat){
  if(!oles||oles.kind!=='unit'||oles.dead) return;
  if(!aldozat||aldozat.kind!=='unit') return;
  if(oles.owner===aldozat.owner) return;
  oles.kills=(oles.kills||0)+1;
  vetPromote(oles);
}

/* --- Alakzatok ---
   Nem csak a felállás más: mindegyik ad valamit, és elvesz valamit.
     VONAL    — széles tűzvonal: a lövészek 10%-kal messzebbre lőnek
     ÉK       — roham: 12%-kal gyorsabb és 12%-kal nagyobbat üt
     NÉGYSZÖG — tömör védelem: +2 páncél, de 15%-kal lassabb menet */
const /* A FORM_NEV a betöltéskor egyszer épül fel, ezért nyelvváltáskor
   frissíteni kell — a `vonal` kulcs korábban magyarul égett bele. */
FORM_NEV={line:T('vonal'), wedge:T('ek'), square:T('negyszog')};
const FORM_LEIRAS={
  line:T('alVonalAl'),
  wedge:T('alEkAl'),
  square:T('alNegyszogAl')
};
function setFormation(f){
  if(typeof logAdd==='function'&&logAdd('form', selIdk(), f)) return;
  /* Az alakzat FÉLENKÉNT külön él. Régen egyetlen G.formation volt — az a
     helyi játékosé —, és a bónusz csak az ő egységeire hatott. Több
     emberrel ez szétcsúszást okozott: nálad a te alakzatod számított,
     nála az övé, tehát ugyanaz a katona más erővel harcolt a két gépen. */
  {
    const o=(typeof oldal==='function')?oldal(ENID):null;
    if(o) o.formation=f;
  }
  G.formation=f;
  toast(T('uzAlakzat')+': '+FORM_NEV[f]+' — '+FORM_LEIRAS[f]);
  SFX.play('click'); syncUI();
}
// Az alakzat szorzói. A terep és a hős aurája ezekre rakódik rá.
function formMul(u,mit){
  /* Az EGYSÉG TULAJDONOSÁNAK alakzata számít, nem a helyi játékosé. */
  const o=(typeof oldal==='function')?oldal(u.owner):null;
  const f=(o&&o.formation)||((u.owner===(G.enIdHelyi||0))?(G.formation||'line'):'line');
  if(!o&&u.owner!==(G.enIdHelyi||0)) return 1;  // régi mentés: marad a régi szabály
  if(u.naval||u.air||u.role==='worker') return 1;
  if(mit==='range')  return (f==='line'&&u.role==='ranged')?1.10:1;
  if(mit==='dmg')    return (f==='wedge')?1.12:1;
  if(mit==='speed')  return (f==='wedge')?1.12:((f==='square')?0.85:1);
  if(mit==='armor')  return (f==='square')?2:0;
  return 1;
}

/* --- Harci állás --- */
const STANCE_NEV={aggro:T('uzTamado'), hold:'Tartsd a vonalat', flee:T('uzVisszavonulas')};
function setStance(s){
  if(typeof logAdd==='function'&&logAdd('stance', selIdk(), s)) return;
  let n=0;
  for(const u of G.sel){
    if(u.dead||u.role==='worker') continue;
    u.stance=s;
    if(s==='hold'){ u.order=null; }           // a helyén marad
    n++;
  }
  if(n){ toast(n+' egység: '+STANCE_NEV[s]); SFX.play('click'); syncUI(); }
}
// Meneküljön-e? Csak a Visszavonulás állásban, és csak megsérülve.
function shouldFlee(u){
  return u.stance==='flee' && u.hp < u.maxHp*0.4;
}
// A menekülés iránya: el a legközelebbi ellenségtől, a bázis felé
function fleeMove(u,dt){
  const e=nearestEnemy(u.x,u.y,u.owner,320,u);
  let tx,ty;
  if(e){ tx=u.x+(u.x-e.x), ty=u.y+(u.y-e.y); }
  else {
    const b=G.builds.filter(b=>!b.dead&&b.owner===u.owner&&b.type==='hq')[0];
    if(!b) return false;
    tx=b.x; ty=b.y;
  }
  navMove(u,clamp(tx,40,WORLD.w-40),clamp(ty,40,WORLD.h-40),dt);
  return true;
}
