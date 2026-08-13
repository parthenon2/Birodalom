/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   9/E. HŐSÖK ÉS MORÁL

   HŐS
     Nemzetenként egyetlen példány, mindig a korszak uralkodójának nevében:
     Hunyadi Mátyás, Sobieski, Fekete Szakáll. Erős harcos, de az igazi
     súlya az AURÁJA: a körülötte harcolók nagyobbat ütnek, több páncélt
     viselnek, és nem futamodnak meg.

     Ha elesik, a kórházban visszahívható — a hőst nem lehet végleg
     elveszíteni, csak drágán pótolni.

   MORÁL
     Egy csapat nem harcol az utolsó emberig. Ha a közelben kétszeres
     túlerő van, és az egység már megsérült, megfutamodik: hat másodpercre
     kivonja magát a harcból, majd összeszedi magát.

     A hős aurája és a saját bázis közelsége megtartja őket.
   ===================================================================== */

const MORALE_R=230;          // ekkora körben nézzük az erőviszonyt
const MORALE_ARANY=2.0;      // ennyiszeres túlerőnél inog meg a sor
const MORALE_HP=0.5;         // és csak ha az életereje ez alá esett
const MORALE_IDO=6;          // ennyi ideig fut
const MORALE_FRISS=1.0;      // ennyi másodpercenként vizsgáljuk

// A nemzet hősének neve a korszak uralkodója
function heroName(owner,age){
  const nk=nationOf(owner), n=NATIONS[nk];
  if(!n||!n.rulers) return 'Hős';
  return uralkodoNev(nation,Math.min(3,age||0));
}
// Él-e már hős ezen az oldalon?
function heroAlive(owner){
  for(const u of G.units) if(!u.dead&&u.hero&&u.owner===owner) return u;
  return null;
}

/* A hős aurája. Nem az alapértékeket írja át, hanem külön mezőkbe gyűjti,
   így nem ütközik a terep hatásával, és nem halmozódik fel. */
function heroAura(dt){
  // minden képkockán nullázzuk, majd a hősök újratöltik
  for(const u of G.units){ u.auraDmg=0; u.auraArmor=0; u.auraHero=false; }
  for(const h of G.units){
    if(h.dead||!h.hero) continue;
    const d=UNITS.hero, R=d.auraR||170, R2=R*R;
    for(const u of G.units){
      if(u.dead||u.owner!==h.owner) continue;
      const dx=u.x-h.x, dy=u.y-h.y;
      if(dx*dx+dy*dy>R2) continue;
      u.auraDmg=Math.max(u.auraDmg||0, d.auraDmg||0.15);
      u.auraArmor=Math.max(u.auraArmor||0, d.auraArmor||1);
      u.auraHero=true;                       // a hős mellől nem futnak el
    }
  }
}

/* A hős visszahívása a kórházban. Csak akkor, ha nincs élő hősöd. */
function reviveHero(){
  if(heroAlive(ENID)){ toast(T('uzHosEl')); SFX.play('deny'); return; }
  const k=G.builds.filter(b=>!b.dead&&b.owner===ENID&&b.type==='hospital'&&b.done)[0];
  if(!k){ toast(T('uzKorhazKell')); SFX.play('deny'); return; }
  const c=unitCost('hero',G.age,ENID);
  scaleCost(c,0.6);                          // a visszahívás olcsóbb az elsőnél
  if(!canPay(c)){ toast(T('uzVisszahivashoz')+': '+costText(c)); SFX.play('deny'); return; }
  pay(c);
  const p=freeSpot(k.x,k.y+70,44,12)||{x:k.x,y:k.y+70};
  const h=makeUnit('hero',0,p.x,p.y,G.age);
  h.hp=h.maxHp*0.7;
  G.units.push(h);
  toast(heroName(0,G.age)+' '+T('uzHosVisszatert'));
  SFX.at('ready',h.x,h.y,1);
  G.fx.push({x:h.x,y:h.y,t:0,life:0.9,type:'boom',r:26});
  syncUI();
}

/* --- MORÁL --- */
function moraleTick(u,dt){
  if(u.dead||u.kind!=='unit') return;
  if(u.role==='worker'||u.hero||u.naval||u.air||u.siege) return;
  // a megfutamodás lejárta
  if(u.rout&&G.t>u.rout){ u.rout=0; u.stanceBefore=undefined; }
  u.moraleT=(u.moraleT||0)-dt;
  if(u.moraleT>0) return;
  u.moraleT=MORALE_FRISS;
  if(u.rout) return;
  if(u.hp>=u.maxHp*MORALE_HP) return;        // ép egység nem inog meg
  if(u.auraHero) return;                     // a hős mellől nem futnak el
  // a saját bázis közelében kitartanak
  for(const b of G.builds){
    if(b.dead||b.owner!==u.owner||b.type!=='hq') continue;
    if(dist(u.x,u.y,b.x,b.y)<300) return;
  }
  let sajat=0, ellen=0;
  const R2=MORALE_R*MORALE_R;
  for(const t of G.units){
    if(t.dead||t.role==='worker') continue;
    const dx=t.x-u.x, dy=t.y-u.y;
    if(dx*dx+dy*dy>R2) continue;
    if(t.owner===u.owner) sajat++; else ellen++;
  }
  if(sajat<1) sajat=1;
  if(ellen>=sajat*MORALE_ARANY){
    u.rout=G.t+MORALE_IDO;
    u.target=null; u.order=null;
    if(u.owner===helyiFel()&&Math.random()<0.35)
      toast(UNITS[u.role].names[u.age]+' megfutamodott!');
  }
}
// Menekül-e most? (a Visszavonulás állás mellett a morál is számít)
function isRouting(u){ return !!(u.rout&&G.t<u.rout); }


/* =======================================================================
   A HŐS AKTÍV KÉPESSÉGE — CSATAKIÁLTÁS

   Az aura eddig passzív volt: a hős jelenléte magától adott bátorságot.
   Ez rendben van, de nem KÉRDEZ semmit a játékostól — nincs benne döntés.

   A csatakiáltás igen: nyolc másodpercre megnöveli a közeli saját
   egységek sebzését és sebességét, és felold minden futást. Utána másfél
   perc várakozás. Egy csatában egyszer, legfeljebb kétszer sülhet el —
   tehát számít, MIKOR nyomod meg.

   Miért ez, és nem roham vagy gyógyítás? Mert ez az, ami minden
   korszakban értelmes: a vezér kiált, a sor megindul. A gyógyítás a
   felcseré, a roham a lovasságé — azoknak megvan a maguk egysége.

   HÁLÓZATON parancsként fut, mint minden más, ami a szimulációt érinti.
   ===================================================================== */
const KIALTAS_HATOTAV = 240;      // ekkora körben hat
const KIALTAS_HOSSZ   = 8;        // ennyi másodpercig tart
const KIALTAS_VARAKOZAS = 90;     // és ennyi ideig nem ismételhető
const KIALTAS_SEBZES  = 0.35;     // +35% sebzés
const KIALTAS_SEBESSEG = 0.25;    // +25% sebesség

/* A hős keresése egy félhez. */
function hosOf(owner){
  for(const u of G.units) if(!u.dead && u.owner === owner && u.role === 'hero') return u;
  return null;
}
/* Mennyi ideig kell még várni? A felület ebből rajzolja a visszaszámlálót. */
function kialtasVaro(owner){
  const h = hosOf(owner);
  if(!h) return -1;                          // nincs hős
  return Math.max(0, (h.kialtasT || 0));
}
function kialtasKesz(owner){
  const h = hosOf(owner);
  return !!h && (h.kialtasT || 0) <= 0;
}

/* A JÁTÉKOS oldala: parancsba teszi, ha hálózaton vagyunk. */
function kialtas(){
  if(typeof logAdd === 'function' && logAdd('kialtas')) return;
  kialtasVegrehajt(ENID);
}
/* A TÉNYLEGES hatás. Ez fut le minden gépen, ugyanannál a lépésnél. */
function kialtasVegrehajt(fel){
  const h = hosOf(fel);
  if(!h || (h.kialtasT || 0) > 0) return;
  h.kialtasT = KIALTAS_VARAKOZAS;
  h.kialtasEl = KIALTAS_HOSSZ;               // eddig tart a hatás

  /* A hatás a kiáltás PILLANATÁBAN közel állókra érvényes — aki később
     fut oda, az lemaradt róla. Így a helyezkedés is számít. */
  const R2 = KIALTAS_HATOTAV * KIALTAS_HATOTAV;
  let db = 0;
  for(const u of G.units){
    if(u.dead || u.owner !== fel || u.role === 'worker') continue;
    const dx = u.x - h.x, dy = u.y - h.y;
    if(dx * dx + dy * dy > R2) continue;
    u.kialtasEl = KIALTAS_HOSSZ;
    u.rout = 0;                              // aki futott, megáll
    db++;
  }
  if(fel === (typeof helyiFel === 'function' ? helyiFel() : 0)){
    toast(T('uzKialtas') + (db ? (' — ' + db + ' ' + T('uzKialtasDb')) : ''));
    if(typeof helyHang === 'function') helyHang('alert', h.x, h.y, 0.9);
  }
  if(typeof G.fx !== 'undefined')
    G.fx.push({ x: h.x, y: h.y, t: 0, life: 0.9, type: 'boom', r: 30 });
}
if(typeof parancsRegiszter === 'function') parancsRegiszter('kialtas', kialtasVegrehajt);

/* Az idő múlása. A hősé és az érintett egységeké külön jár le. */
function kialtasTick(dt){
  for(const u of G.units){
    if(u.dead) continue;
    if(u.kialtasT > 0) u.kialtasT = Math.max(0, u.kialtasT - dt);
    if(u.kialtasEl > 0) u.kialtasEl = Math.max(0, u.kialtasEl - dt);
  }
}
/* A szorzók, amiket a harc és a mozgás kérdez. */
function kialtasSebzes(u){ return (u && u.kialtasEl > 0) ? 1 + KIALTAS_SEBZES : 1; }
function kialtasSebesseg(u){ return (u && u.kialtasEl > 0) ? 1 + KIALTAS_SEBESSEG : 1; }
