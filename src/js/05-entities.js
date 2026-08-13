/* =======================================================================
   5. ENTITÁSOK LÉTREHOZÁSA
   ===================================================================== */
/* -----------------------------------------------------------------------
   ELESETTEK ÉS RONCSOK

   Az egységek nem tűnnek el egyik képkockáról a másikra: a katona eldől,
   alatta vértócsa marad, a repülő pedig füstölve lezuhan és kigyullad.
   Mindkettő puszta látvány — a játékmenetet nem érinti, és idővel elhalványul.
   ----------------------------------------------------------------------- */
function dropCorpse(u){
  if(REDUCED) return;
  G.corpses=G.corpses||[];
  while(G.corpses.length>=90) G.corpses.shift();  // pontosan ennyit tartunk
  G.corpses.push({
    x:u.x, y:u.y, role:u.role, age:u.age, owner:u.owner, face:u.face,
    dol:0, t:0, life:34,                         // eldőlés és elhalványulás
    r:u.r||10, seed:(Math.random()*1000)|0
  });
}
function crashPlane(u){
  if(REDUCED) return;
  G.wrecks=G.wrecks||[];
  const a=u.face+(Math.random()-0.5)*0.6;
  G.wrecks.push({
    x:u.x, y:u.y, role:u.role, age:u.age, owner:u.owner, face:u.face,
    vx:dcos(a)*46, vy:dsin(a)*46,        // előre sodródik zuhanás közben
    z:AIR_ALT, vz:0, forg:(Math.random()-0.5)*3.4,
    t:0, becsapodott:false, life:26
  });
}
function makeUnit(role,owner,x,y,age){
  const d=UNITS[role], hp=d.hp[age];
  const u={kind:'unit',id:++G.nextId,role,owner,x,y,age,hp,maxHp:hp,
    speed:val(d.speed,age)*PACE.speed, dmg:val(d.dmg,age), range:val(d.range,age),
    atk:val(d.atk,age), r:val(d.r,age), armor:val(d.armor,age)||0, gatherMul:1, naval:!!d.naval,
    transport:!!d.transport, cargo:d.transport?[]:undefined, siege:!!d.siege, hero:!!d.hero, ram:!!d.ram, sTower:!!d.tower, isSpy:!!d.spy, galleon:!!d.galleon,
    /* Hajók legénysége és ágyúi. A legénység dönti el az átszállást, az
       ágyúszám a sortűz erejét és a lövés látványát. */
    crewMax:d.crew||0, crew:d.crew||0,
    guns:d.guns?(d.guns[0]+Math.round(srnd()*(d.guns[1]-d.guns[0]))):0,
    cargo:(d.transport||d.tower)?[]:undefined,
    kills:0, vet:0, stance:'aggro',
    air:!!d.air, sight:d.sight||0, bomb:!!d.bomb, antiAir:!!d.antiAir, alt:0,
    cd:srange(0,.5), face:owner?Math.PI:0, dead:false,
    order:null,        // {type:'move'|'attack'|'amove'|'gather', x,y,target}
    target:null, carry:0, carryType:null, walk:rnd(0,TAU)};
  const bn=bonusOf(owner); if(bn.unit) bn.unit(u);       // nemzeti bónusz
  applyDoct(u);                                          // választott ideológiák
  applyUpg(u);                                           // megvásárolt fejlesztések
  return u;
}
function makeBuild(type,owner,x,y,age,done){
  const d=BUILDS[type];
  const maxHp=Math.round(d.hp[age]*((typeof upgMul2==='function')?upgMul2(owner,'masonry',0.12):1));
  const b={kind:'build',id:++G.nextId,type,owner,x,y,age,w:d.w,h:d.h,maxHp,
    hp: done?maxHp:Math.round(maxHp*.25), done:!!done, prog:done?1:0,
    buildTime:d.time*PACE.build, rangeMul:1,
    queue:[], cd:0, rally:null, dead:false, flag:rnd(0,TAU)};
  const bn=bonusOf(owner); if(bn.build) bn.build(b);
  /* A növényzet ne lógjon bele az épületbe: a talppont körüli díszeket
     kitakarítjuk. A magasságot a BH tábla adja — az épület onnan tudja,
     meddig ér fel. */
  if(typeof decoTakarit==='function'){
    const mag=(typeof bhOf==='function')?bhOf(b.type,b.age):40;
    decoTakarit(b.x, b.y, b.w, b.h, mag+20);
  }
  for(const d of doctList(owner)) if(d.build) d.build(b);
  b.buildTime*=doctMul(owner,'buildTime')/upgMul(owner,'labor');
  // Kalózvilágban kétszer gyorsabb az építkezés: ott a város épít, nem jobbágy
  if(typeof G!=='undefined'&&G.pirate) b.buildTime*=0.5;
  // Kalózmódban a játékos épületei jobbágy nélkül, maguktól épülnek fel
  if(typeof G!=='undefined'&&G.pirate&&owner===0) b.remote=true;
  return b;
}
function makeNode(type,x,y){
  const amt=type==='wood'?260:(type==='stone'?340:(type==='fish'?520:(type==='coal'?480:420)));
  return {kind:'node',id:++G.nextId,type,x,y,r:type==='wood'?13:(type==='fish'?15:16),amount:amt,max:amt,dead:false,seed:rnd(0,TAU)};
}
