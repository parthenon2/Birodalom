/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   9/F. KÉMKEDÉS

   A felderítő álruhát ölthet: az ellenség színeit viseli, és nem lövik.
   Így be lehet sétálni az idegen földre, látni, mit épít — és fel lehet
   gyújtani a raktárát.

   A leleplezés két úton jöhet:
     - túl közel mégy (60 pixeren belül bárki felismer)
     - te magad támadsz vagy gyújtogatsz

   A gyújtogatás lassú tüzet rak az épületre, ami tizenkét másodpercig ég.
   Az ára: az álca leesik, és a felderítő nem harcol.
   ===================================================================== */

const SPY_FELISMER=60;         // ennyire közel bárki felismeri
const FIRE_IDO=12;             // ennyi ideig ég egy felgyújtott épület
const FIRE_DMG=0.028;          // az épület maximális életerejének ennyi töredéke másodpercenként

function canSpy(u){ return !!(u&&!u.dead&&u.isSpy&&!u.air); }

function toggleDisguise(){
  const l=G.sel.filter(canSpy);
  if(!l.length){ toast(T('uzAlcaFelderito')); SFX.play('deny'); return; }
  const be=!l[0].disguise;
  for(const u of l){
    u.disguise=be;
    u.disguiseAt=G.t;
  }
  toast(be? l.length+' '+T('uzAlcaFel')
          : T('uzAlcaLe'));
  SFX.play(be?'select':'click');
  syncUI();
}
/* Lelepleződés: ha ellenséges egység vagy torony közelébe ér. */
function spyTick(u,dt){
  if(!u.disguise) return;
  for(const t of G.units){
    if(t.dead||t.owner===u.owner) continue;
    if(dist(u.x,u.y,t.x,t.y)<SPY_FELISMER){ unmask(u,T('uzKemLelepleztek')); return; }
  }
  for(const b of G.builds){
    if(b.dead||b.owner===u.owner||!b.done) continue;
    if(!BUILDS[b.type].dmg) continue;                 // csak az őrtorony figyel
    if(dist(u.x,u.y,b.x,b.y)<SPY_FELISMER+40){ unmask(u,T('uzToronyLeleplezte')); return; }
  }
}
function unmask(u,uzenet){
  if(!u.disguise) return;
  u.disguise=false;
  u.unmaskAt=G.t;
  if(u.owner===helyiFel()){ toast(uzenet); SFX.play('deny',0.9); }
  syncUI();
}

/* --- Gyújtogatás --- */
function arsonCommand(cel){
  const l=G.sel.filter(canSpy);
  if(!l.length) return false;
  if(!cel||cel.kind!=='build'||cel.owner===ENID||cel.dead) return false;
  for(const u of l){ u.order={type:'arson',target:cel}; u.target=null; }
  toast(T('uzGyujtogatas')+': '+BUILDS[cel.type].names[cel.age]+' — '+T('uzAlcaLeesik'));
  SFX.play('select',0.9);
  return true;
}
function setFire(b,from){
  if(!b||b.dead) return;
  b.fire={t:0, hossz:FIRE_IDO, dmg:b.maxHp*FIRE_DMG};
  if(from&&from.owner===helyiFel()){
    toast(T('uzLangraKapott')+': '+BUILDS[b.type].names[b.age]+'!');
    SFX.at('boom',b.x,b.y,0.8);
  }
  G.fx.push({x:b.x,y:b.y,t:0,life:0.7,type:'boom',r:18});
}
/* A tűz terjedése és kialvása — az épületfrissítés hívja. */
function fireTick(b,dt){
  if(!b.fire) return;
  b.fire.t+=dt;
  b.hp-=b.fire.dmg*dt;
  b.hitAt=G.t;                                   // a helyőrség nem javítja, amíg ég
  if(!REDUCED&&Math.random()<dt*6)
    G.fx.push({x:b.x+rnd(-b.w*0.4,b.w*0.4), y:b.y+rnd(-b.h*0.4,b.h*0.2),
               t:0, life:0.9, type:'fust'});
  if(b.hp<=0){ b.hp=0; damage(b,1,{owner:1}); b.fire=null; return; }
  if(b.fire.t>=b.fire.hossz) b.fire=null;
}
