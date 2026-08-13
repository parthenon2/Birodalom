/* =======================================================================
   9/D. A TEREP HATÁSA

   A tájtípusok eddig csak látványban különböztek. Mostantól számítanak is:

     ERDŐ    — fák között +2 páncél. A fedezék véd a nyilaktól és a
               golyóktól, ezért az erdőn átvezető támadás olcsóbb.
     HEGY    — sziklás magaslaton +15% lőtáv. Aki elfoglalja a dombot,
               messzebbre lát és messzebbre lő.
     PART    — a sekély vízparti homokban 20%-kal lassabb a menet.
               Partraszálláskor a védőnek van előnye.

   A hatásokat félmásodpercenként számoljuk újra, nem képkockánként —
   a terep úgysem változik gyorsabban.
   ===================================================================== */

const TERR_ERDO_R=88;        // ennyire kell egy fához, hogy fedezéket adjon
const TERR_FRISS=0.5;        // ennyi másodpercenként számoljuk újra

function terrainAt(u){
  const ki={armor:0, range:1, speed:1, nev:null};
  // hegy: sziklacellán vagy közvetlenül mellette
  if(typeof isRock==='function'){
    const c=FOG_CELL;
    const cx=Math.floor(u.x/c), cy=Math.floor(u.y/c);
    let szikla=false;
    for(let dy=-1;dy<=1&&!szikla;dy++) for(let dx=-1;dx<=1;dx++){
      const nx=cx+dx, ny=cy+dy;
      if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
      if(G.rock&&G.rock[ny*FW+nx]){ szikla=true; break; }
    }
    if(szikla){ ki.range=1.15; ki.nev='magaslat'; }
  }
  // erdő: van-e fa a közelben
  let fa=0;
  for(const n of G.nodes){
    if(n.dead||n.type!=='wood') continue;
    const dx=n.x-u.x, dy=n.y-u.y;
    if(dx*dx+dy*dy<TERR_ERDO_R*TERR_ERDO_R){ fa++; if(fa>=2) break; }
  }
  if(fa>=2){ ki.armor=2; ki.nev=ki.nev?'erdős magaslat':'erdő'; }
  // part: víz a közvetlen szomszédban
  if(typeof isWater==='function'&&!u.naval&&!u.air){
    let viz=false;
    for(let i=0;i<4&&!viz;i++){
      const a=i*TAU/4;
      if(isWater(u.x+dcos(a)*26,u.y+dsin(a)*26)) viz=true;
    }
    if(viz){ ki.speed=0.8; ki.nev=ki.nev||'part'; }
  }
  return ki;
}

/* Az egység terephatásainak frissítése. Az alapértékeket a `base*` mezők
   őrzik, hogy a hatás ne halmozódjon fel újraszámoláskor. */
function terrainTick(u,dt){
  if(u.air||u.kind!=='unit') return;
  u.terrT=(u.terrT||0)-dt;
  if(u.terrT>0) return;
  u.terrT=TERR_FRISS;
  if(u.baseArmor===undefined){ u.baseArmor=u.armor; u.baseRange=u.range; u.baseSpeed=u.speed; }
  const t=terrainAt(u);
  // A terep és az alakzat hatása egyszerre érvényesül
  const fA=(typeof formMul==='function')?formMul(u,'armor'):0;
  const fR=(typeof formMul==='function')?formMul(u,'range'):1;
  const fS=(typeof formMul==='function')?formMul(u,'speed'):1;
  u.armor=u.baseArmor+t.armor+fA;
  u.range=u.baseRange*t.range*fR;
  /* A HAJÓK a tengeri időt érzik, nem a szárazföldit: szélcsendben feleannyi
     sebességgel járnak, viharban is lassabban. */
  const idoSzorzo=u.naval
    ? ((typeof seaSpeedMul==='function')?seaSpeedMul():1)
      * ((typeof sailMul==='function')?sailMul(u):1)   // a széttépett vitorla lassít
    : ((typeof weatherSpeed==='function')?weatherSpeed():1);
  u.speed=u.baseSpeed*t.speed*fS*idoSzorzo;
  u.terrain=t.nev;
}
