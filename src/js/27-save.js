/* =======================================================================
   21/D. MENTÉS ÉS BETÖLTÉS

   A teljes játékállás JSON-be írható. Az egységek egymásra mutató
   hivatkozásait (célpont, gyűjtött lelőhely) azonosítóra fordítjuk, és
   betöltéskor kötjük vissza — különben a mentés körkörös hivatkozás lenne.
   A ködtérképet base64-ben tároljuk, mert nyolcezer szám túl terjengős.
   ===================================================================== */
function b64enc(arr){
  let out='';
  for(let i=0;i<arr.length;i+=4096)
    out+=String.fromCharCode.apply(null,arr.subarray(i,i+4096));
  return btoa(out);
}
function b64dec(str,len){
  const bin=atob(str), a=new Uint8Array(len);
  for(let i=0;i<Math.min(len,bin.length);i++) a[i]=bin.charCodeAt(i);
  return a;
}
function saveState(){
  /* Hálózati játszmában a mentés félrevezető: a társ világa nem áll meg,
     és egy régi állásból folytatva a két gép azonnal szétcsúszna. */
  if(typeof netAktiv==='function'&&netAktiv()){
    toast(T('uzNetNemMenthet'));
    return null;
  }
  const uid=e=>(e&&!e.dead)?e.id:0;
  return {
    v:1, saved:new Date().toISOString(), t:G.t,
    gv:(typeof GAME_VERSION!=='undefined')?GAME_VERSION:'?',   // a JÁTÉK verziója (a v a formátumé)
    missionIdx:G.missionIdx, campNation:G.campNation, pirate:!!G.pirate, prices:G.prices, dayNight:!!G.dayNight, weatherOn:!!G.weatherOn, campDone:Object.keys(CAMP_DONE),
    nation:G.nation, age:G.age, res:G.res, cb:G.cb, zoom:G.zoom,
    cam:{x:G.cam.x,y:G.cam.y}, nextId:G.nextId, revealed:G.revealed, upg:G.upg, doct:G.doct, earned:G.earned, kills:G.kills, simMag:G.simMag, rng:G.rng, rngHivas:G.rngHivas, toltet:G.toltet, hirnev:G.hirnev, kegyelem:G.kegyelem, varos:G.varos, diff:G.diff, mapType:G.mapType, mentve:Date.now(), decoSeed:G.decoSeed, atomUsed:G.atomUsed, scorch:G.scorch,
    /* A G.ai az első bot bejegyzése — ha egyetlen bot sincs (csupa ember),
       null. A mentés így nem szállhat el rajta. */
    oldalak:(G.oldalak||[]).map(o=>({i:o.i,tipus:o.tipus,nemzet:o.nemzet,csapat:o.csapat,
      age:o.age,res:o.res,upg:o.upg,doct:o.doct,kiesett:!!o.kiesett})),
    ai:G.ai?{age:G.ai.age,res:G.ai.res,wave:G.ai.wave,waveT:G.ai.waveT,buildT:G.ai.buildT,
        trainT:G.ai.trainT,ageT:G.ai.ageT,scoutT:G.ai.scoutT,nation:G.ai.nation,
        rate:G.ai.rate,upg:G.ai.upg,upgT:G.ai.upgT,seen:G.ai.seen,defT:G.ai.defT}:null,
    units:G.units.filter(u=>!u.dead).map(u=>({
      id:u.id,role:u.role,owner:u.owner,x:u.x,y:u.y,age:u.age,hp:u.hp,face:u.face,
      carry:u.carry,carryType:u.carryType,cd:u.cd,
      kills:u.kills,vet:u.vet,stance:u.stance,
      crew:u.crew,crewMax:u.crewMax,guns:u.guns,sailDmg:u.sailDmg,
      // A fedélzeten utazók nincsenek a pályán, ezért a hajóval együtt mentjük őket
      cargo:(u.cargo&&u.cargo.length)?u.cargo.map(c=>({
        role:c.role,owner:c.owner,age:c.age,hp:c.hp,carry:c.carry,carryType:c.carryType
      })):undefined,
      order:u.order?{type:u.order.type,x:u.order.x,y:u.order.y,res:u.order.res,tid:uid(u.order.target)}:null,
      tid:uid(u.target)})),
    builds:G.builds.filter(b=>!b.dead).map(b=>({
      id:b.id,type:b.type,owner:b.owner,x:b.x,y:b.y,age:b.age,hp:b.hp,
      done:b.done,prog:b.prog,started:!!b.started,cd:b.cd,remote:!!b.remote,
      // A gyülekezőpont célját CSAK azonosítóval mentjük: a teljes objektum
      // körkörös hivatkozást vinne a mentésbe, és betöltéskor a valódi helyett
      // egy különálló másolatot adna vissza.
      rally:b.rally?{x:b.rally.x,y:b.rally.y,
        nid:(b.rally.node&&!b.rally.node.dead)?b.rally.node.id:0,
        fid:(b.rally.foe&&!b.rally.foe.dead)?b.rally.foe.id:0}:null,
      queue:b.queue.map(q=>({role:q.role,t:q.t}))})),
    nodes:G.nodes.filter(n=>!n.dead).map(n=>({id:n.id,type:n.type,x:n.x,y:n.y,amount:n.amount})),
    groups:Object.keys(G.groups).reduce((o,k)=>{
      o[k]=(G.groups[k]||[]).filter(u=>!u.dead).map(u=>u.id); return o; },{}),
    fog:b64enc(G.fog), fogE:b64enc(G.fogE), water:b64enc(G.water), rock:b64enc(G.rock)
  };
}
/* --- A MENTÉS ÁTVIZSGÁLÁSA ---
   A mentés fájlból jön, tehát bármi lehet benne: sérült letöltés, félbe
   maradt írás, vagy szándékosan elrontott fájl. A régi ellenőrzés csak a
   változatszámot és egy épület meglétét nézte — a többit elhitte.

   Ami ezen átcsúszhatott:
     · ismeretlen nemzet   → NATIONS[G.nation] undefined, és onnantól
                             minden rajzolás és költségszámítás elszáll
     · tartományon kívüli korszak → AGES[G.age] undefined
     · NaN koordináta      → az egység a semmibe kerül, az útkeresés
                             végtelen ciklusba fut
     · irdatlan lista      → a böngésző megeszi a memóriát

   Nem javítunk, csak KISZŰRÜNK: ami értelmetlen, az kimarad. Így egy
   félig sérült mentésből is menthető a játszma nagy része. */
const MENTES_MAX_EGYSEG = 5000;      // ennél több sosem keletkezik szabályosan
const MENTES_MAX_EPULET = 2000;

function mentesEllenoriz(d){
  if(!d || typeof d !== 'object') return null;
  const sz = (x, alap) => (typeof x === 'number' && isFinite(x)) ? x : alap;

  if(typeof NATIONS === 'object' && !NATIONS[d.nation]) return null;
  const korMax = (typeof AGES === 'object' && AGES.length) ? AGES.length - 1 : 3;
  d.age = Math.max(0, Math.min(korMax, sz(d.age, 0)));
  d.t   = Math.max(0, sz(d.t, 0));

  const helyes = (e) => e && typeof e === 'object'
    && isFinite(e.x) && isFinite(e.y)
    && typeof e.owner === 'number' && e.owner >= 0 && e.owner < 32;

  if(Array.isArray(d.units))
    d.units = d.units.filter(helyes).slice(0, MENTES_MAX_EGYSEG);
  if(Array.isArray(d.builds))
    d.builds = d.builds.filter(helyes).slice(0, MENTES_MAX_EPULET);
  if(Array.isArray(d.nodes))
    d.nodes = d.nodes.filter(n => n && isFinite(n.x) && isFinite(n.y)).slice(0, 20000);
  return d;
}

function loadState(d){
  if(!d||d.v!==1) { toast(T('uzRosszFajl')); SFX.play('deny'); return false; }
  d = mentesEllenoriz(d);
  if(!d){ toast(T('uzSerultMentes')); SFX.play('deny'); return false; }
  /* Egy hiányos vagy régi mentés nem hagyhat üres világot magunk után:
     előbb megnézzük, van-e benne egyáltalán játékos-épület. Ha nincs,
     hozzá sem nyúlunk a futó játékhoz. */
  if(!Array.isArray(d.builds)||!d.builds.some(b=>b.owner===0)){
    toast(T('uzSerultMentes'));
    SFX.play('deny');
    return false;
  }
  try{
    G.nation=d.nation; G.age=d.age; G.cb=!!d.cb;
    G.on=true; G.over=false; G.t=d.t||0;
    G.res=Object.assign({wood:0,stone:0,gold:0,food:0},d.res);
    // Teljes alapértelmezett botállapot, hogy a régebbi mentések se hiányos
    // objektumot adjanak vissza — enélkül a bot emlékezete undefined maradna.
    G.ai=Object.assign({
      age:0, res:{wood:900,stone:700,gold:600,food:900}, wave:0, waveT:140, rate:1,
      buildT:20, trainT:3, ageT:210, scoutT:20, defT:0, upgT:60, attacking:false,
      nation:'de', upg:{weapon:0,armor:0,supply:0}, seen:{melee:0,ranged:0,spear:0,cav:0}, doct:{}
    },d.ai);
    G.ai.upg=Object.assign({weapon:0,armor:0,supply:0},G.ai.upg);
    G.ai.seen=Object.assign({melee:0,ranged:0,spear:0},G.ai.seen);
    G.upg=Object.assign({weapon:0,armor:0,supply:0},d.upg);
    G.doct=Object.assign({},d.doct);
    G.earned=Object.assign({wood:0,stone:0,gold:0,food:0},d.earned);
    G.kills=d.kills||0;
  G.simMag=d.simMag||0; if(d.rng!==undefined){ G.rng=d.rng; G.rngHivas=d.rngHivas||0; }
  G.toltet=d.toltet||'golyo'; G.hirnev=d.hirnev||0; G.kegyelem=d.kegyelem||0;
  if(d.varos) G.varos=d.varos;
    G.diff=(d.diff===undefined)?1:d.diff;
    G.mapType=d.mapType||'mezo';
    G.decoSeed=d.decoSeed||1;
    G.atomUsed=!!d.atomUsed; G.scorch=d.scorch||[]; G.atomAim=null;
    G.zoom=d.zoom||1; G.nextId=d.nextId||0; G.revealed=!!d.revealed;
    G.missionIdx=(d.missionIdx===undefined)?-1:d.missionIdx;
    // A hadjáratot előbb a mentés nemzetére állítjuk, és csak utána
    // oldjuk fel a küldetést — különben a másik nemzet küldetése töltődne be.
    G.pirate=!!d.pirate;
    G.prices=d.prices||{wood:1,stone:1,food:1,coal:1};
    if(d.dayNight!==undefined) G.dayNight=!!d.dayNight;
    if(d.weatherOn!==undefined) G.weatherOn=!!d.weatherOn;
    G.campNation=d.campNation||d.nation||'hu';
    setCampaign(G.campNation);
    G.mission=(G.missionIdx>=0&&G.missionIdx<CAMPAIGN.length)?CAMPAIGN[G.missionIdx]:null;
    if(!G.mission) G.missionIdx=-1;
    if(Array.isArray(d.campDone)) for(const k of d.campDone){
      // régi mentés: számokat tárolt, az a magyar hadjárat volt
      CAMP_DONE[(typeof k==='number')?campKey('hu',k):k]=true;
    }
    G.units=[]; G.builds=[]; G.nodes=[]; G.projs=[]; G.fx=[];
    G.sel=[]; G.selBuild=null; G.place=null; G.warmQ=[]; G.btnSig='';
    G.groups={};                          // a régi csoportok szellemobjektumokra mutatnának
    initFog();
    G.fog=b64dec(d.fog,FW*FH); G.fogE=b64dec(d.fogE,FW*FH);
    G.water=d.water?b64dec(d.water,FW*FH):new Uint8Array(FW*FH);
    G.rock=d.rock?b64dec(d.rock,FW*FH):new Uint8Array(FW*FH);
    paintWater(); paintRock(); genDeco();
    const byId={};
    for(const n of d.nodes){
      const o=makeNode(n.type,n.x,n.y); o.id=n.id; o.amount=n.amount;
      G.nodes.push(o); byId[n.id]=o;
    }
    for(const b of d.builds){
      const o=makeBuild(b.type,b.owner,b.x,b.y,b.age,b.done);
      o.id=b.id; o.hp=b.hp; o.prog=b.prog; o.started=!!b.started; o.cd=b.cd; o.rally=null;
      o.remote=!!b.remote;
      o.queue=b.queue.map(q=>({role:q.role,t:q.t}));
      G.builds.push(o); byId[b.id]=o;
    }
    for(const u of d.units){
      const o=makeUnit(u.role,u.owner,u.x,u.y,u.age);
      o.id=u.id; o.hp=u.hp; o.face=u.face; o.carry=u.carry;
      o.carryType=u.carryType; o.cd=u.cd;
      // Veteránság: a rangot újra alkalmazzuk, hogy a bónusz is meglegyen
      o.kills=u.kills||0; o.stance=u.stance||'aggro';
      if(u.crewMax){ o.crewMax=u.crewMax; o.crew=(u.crew!==undefined)?u.crew:u.crewMax; o.guns=u.guns||0; }
      o.vet=0; if(typeof vetPromote==='function') vetPromote(o);
      o.hp=u.hp;
      // A fedélzeten utazók: nem kerülnek a pályára, csak a hajó rakományába
      if(u.cargo&&u.cargo.length){
        o.cargo=u.cargo.map(c=>{
          const k=makeUnit(c.role,c.owner,o.x,o.y,c.age);
          k.hp=c.hp; k.carry=c.carry; k.carryType=c.carryType;
          k.dead=true; k.aboard=true;
          return k;
        });
      }
      G.units.push(o); byId[u.id]=o;
    }
    // a hivatkozások visszakötése azonosítóról objektumra
    d.builds.forEach((sb,i)=>{
      if(!sb.rally) return;
      G.builds[i].rally={x:sb.rally.x,y:sb.rally.y,
        node:sb.rally.nid?(byId[sb.rally.nid]||null):null,
        foe: sb.rally.fid?(byId[sb.rally.fid]||null):null};
    });
    d.units.forEach((su,i)=>{
      const o=G.units[i];
      if(su.order){
        o.order={type:su.order.type,x:su.order.x,y:su.order.y,res:su.order.res};
        if(su.order.tid) o.order.target=byId[su.order.tid]||null;
      }
      if(su.tid) o.target=byId[su.tid]||null;
    });
    if(d.groups) for(const k in d.groups)
      G.groups[k]=d.groups[k].map(id=>byId[id]).filter(Boolean);
    G.cam.x=d.cam.x; G.cam.y=d.cam.y;
    G.navVer++; G.navLen=-1; G.fogT=0;
    for(const k in SPRITES) delete SPRITES[k];
    for(const k in USPR) delete USPR[k];
    warmSprites(G.age,0); warmSprites(G.ai.age,1);
    // A mentett kameraállás más képernyőmérethez készült, ezért betöltés
    // után mindig a saját városra nézünk — ott folytatod, ahol abbahagytad.
    updateView(); resize(); centerOnBase();
    applyAgeStyle(); drawPortrait(); syncUI(); drawMini();
    $('menu').style.display='none'; if(typeof langBoxShow==='function') langBoxShow(false); $('over').style.display='none';
    return true;
  }catch(err){
    /* Ha a betöltés FÉLÚTON hasal el, a világ félig a régi, félig az új
       adatokból áll — abban játszani értelmetlen, és a hibák onnantól
       megjósolhatatlanok. Ilyenkor inkább visszaadjuk a menüt, semmint
       hogy egy törött játszmát hagyjunk a képernyőn. */
    console.error('betöltés:', err);
    G.on=false; G.over=false;
    toast(T('uzBetoltesNemSikerult'));
    SFX.play('deny');
    if(typeof menuOpen==='function') menuOpen(true);
    return false;
  }
}
/* A gyors mentés az alkalmazás saját tárolójába kerül. Telefonon ez a
   lényeg: nem kell fájlkezelőt nyitogatni, és a játék bezárása után is
   megmarad. Ha a tároló nem érhető el, a munkamenetre marad. */
const SLOT='birodalom_save';
function storeSave(obj){
  try{ tarolIr(SLOT, JSON.stringify(obj)); return true; }
  catch(e){ return false; }
}
function storedSave(){
  try{ const raw=tarolOlvas(SLOT); return raw?JSON.parse(raw):null; }
  catch(e){ return null; }
}
/* Mit tudunk a játékban tárolt mentésről? A menü ebből írja ki, mikor és
   milyen állásnál tartottál — így látszik, hogy tényleg a játék őrzi, nem
   egy fájl valahol a telefonon. */
function storedSaveInfo(){
  const d=G.quick||storedSave();
  if(!d) return null;
  try{
    return {
      nemzet:(NATIONS[d.nation]||{}).name||'?',
      korszak:(AGES[d.age]||{}).name||'?',
      perc:Math.floor((d.t||0)/60),
      mp:Math.floor((d.t||0)%60),
      mentve:d.mentve||0
    };
  }catch(e){ return null; }
}
function quickSave(){
  if(!G.on) return;
  try{ G.quick=saveState(); }
  catch(err){ toast(T('uzMentesNemSikerult')); SFX.play('deny'); return; }
  const kept=storeSave(G.quick);
  toast(kept?T('uzMentve'):T('uzGyorsMentve'));
  SFX.play('ready');
}
function quickLoad(){
  const q=G.quick||storedSave();
  if(!q){ toast(T('uzNincsMentes')); SFX.play('deny'); return; }
  if(loadState(q)){ toast(T('uzVisszatoltve')); SFX.play('ready'); }
}
// Kilépéskor és háttérbe váltáskor magától ment — telefonon ez természetes
function autoSave(){
  if(!G.on||G.over) return;
  try{ storeSave(saveState()); }catch(e){}
}
if(typeof addEventListener==='function'){
  addEventListener('pagehide',autoSave);
  addEventListener('visibilitychange',()=>{ if(document.hidden) autoSave(); });
}
function saveToFile(){
  if(!G.on) return;
  let json='';
  try{ G.quick=saveState(); json=JSON.stringify(G.quick); }
  catch(err){ toast(T('uzMentesNemSikerult')); SFX.play('deny'); return; }
  const blob=new Blob([json],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='birodalom-'+NATIONS[G.nation].name.toLowerCase()+'-'+Math.floor(G.t)+'mp.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast(T('uzFajlbaMentve')); SFX.play('ready');
}
function loadFromFile(file){
  const fr=new FileReader();
  fr.onload=()=>{
    let d=null;
    try{ d=JSON.parse(fr.result); }catch(e){ toast(T('uzSerultFajl')); SFX.play('deny'); return; }
    if(loadState(d)) toast(T('uzBetoltve')+': '+NATIONS[G.nation].name+', '+AGES[G.age].name+'.');
  };
  fr.readAsText(file);
}
