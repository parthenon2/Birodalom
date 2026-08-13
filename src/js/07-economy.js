/* =======================================================================
   7. KERESŐK ÉS KÖLTSÉGEK
   ===================================================================== */
function canPay(cost,res){for(const k in cost) if((res||G.res)[k]<cost[k]) return false; return true;}
function pay(cost,res){for(const k in cost)(res||G.res)[k]-=cost[k];}
/* =======================================================================
   NEMZETI BÓNUSZOK
   Minden nemzet egyetlen, jól érezhető előnyt kap, ami a történelmi
   karakteréhez illik. A bónusz a botra is vonatkozik a saját nemzete
   szerint, így a hét nemzet egymás ellen is másképp játszik.
   ===================================================================== */
const BONUS={
  ns:{title:'A Testvériség kódexe',
      text:'A hajók 20%-kal olcsóbbak, a legénység 15%-kal gyorsabban áll ki.',
      unitCost:(role,c)=>{ if(role==='fisher'||role==='warship'||role==='transport') scaleCost(c,0.8); },
      trainTime:0.85},
  bb:{title:'Rettegett hírnév',
      text:'A hajók 20%-kal nagyobbat ütnek, és a legénység 12%-kal szívósabb.',
      unit:u=>{ if(u.naval) u.dmg*=1.2; u.maxHp=Math.round(u.maxHp*1.12); u.hp=u.maxHp; }},
  sb:{title:'Úriember a fedélzeten',
      text:'25%-kal több arany, de a hajók 10%-kal drágábbak.',
      gather:t=>t==='gold'?1.25:1,
      unitCost:(role,c)=>{ if(role==='warship') scaleCost(c,1.1); }},
  nat:{title:'A sziget népe',
      text:'A harcosok 20%-kal gyorsabbak és 15%-kal olcsóbbak, de nem ismerik a fémet.',
      unit:u=>{ u.speed*=1.2; },
      unitCost:(role,c)=>scaleCost(c,0.85)},
  es:{title:'Tengerentúli hódítás',
      text:'A hajók 25%-kal olcsóbbak és 20%-kal szívósabbak, a kikötő 20%-kal olcsóbb.',
      unitCost:(role,c)=>{ if(role==='fisher'||role==='warship') scaleCost(c,0.75); },
      buildCost:(t,c)=>{ if(t==='harbor') scaleCost(c,0.8); },
      unit:u=>{ if(u.naval){ u.maxHp=Math.round(u.maxHp*1.2); u.hp=u.maxHp; } }},
  hu:{title:'Könnyűlovas hagyomány',
      text:'A közelharci egységek 16%-kal gyorsabbak és 15%-kal olcsóbbak.',
      unit:u=>{ if(u.role==='melee') u.speed*=1.16; },
      unitCost:(role,c)=>{ if(role==='melee') scaleCost(c,0.85); }},
  at:{title:'Erődépítő iskola',
      text:'Az épületek 22%-kal szívósabbak, a tornyok 12%-kal messzebbre lőnek.',
      build:b=>{ b.maxHp=Math.round(b.maxHp*1.22); b.hp=Math.round(b.hp*1.22); b.rangeMul=1.12; }},
  pl:{title:'Szárnyas huszárok',
      text:'A közelharci egységek 20%-kal nagyobbat ütnek.',
      unit:u=>{ if(u.role==='melee') u.dmg*=1.2; }},
  de:{title:'Hadiipari fegyelem',
      text:'Az épületek 16%-kal olcsóbbak és 25%-kal gyorsabban készülnek el.',
      buildCost:(t,c)=>scaleCost(c,0.84),
      build:b=>{ b.buildTime=b.buildTime*0.75; }},
  fr:{title:'Felvilágosult udvar',
      text:'A távolsági egységek 12%-kal messzebbre lőnek, a korszakváltás 20%-kal olcsóbb.',
      unit:u=>{ if(u.role==='ranged'||u.role==='spear') u.range*=1.12; },
      ageCost:c=>scaleCost(c,0.8)},
  gb:{title:'Íjász- és tüzérhagyomány',
      text:'A távolsági egységek 20%-kal nagyobbat sebeznek.',
      unit:u=>{ if(u.role==='ranged') u.dmg*=1.2; }},
  ru:{title:'Kimeríthetetlen tartalék',
      text:'Minden egység 16%-kal szívósabb, a munkások 14%-kal gyorsabban gyűjtenek.',
      unit:u=>{ u.maxHp=Math.round(u.maxHp*1.16); u.hp=u.maxHp; if(u.role==='worker') u.gatherMul=1.14; }},
  /* --- KÉSZÜLŐ NEMZETEK ---
     Minden nemzet EGYETLEN, jól érezhető előnyt kap — ugyanaz az elv,
     mint a többinél. A történelmi karakterükhöz illik, nem a
     legerősebbhez. */
  se:{title:'Karolinus fegyelem',
      text:'A gyalogság 15%-kal szívósabb, és 12%-kal gyorsabban áll ki.',
      unit:u=>{ if(!u.naval&&!u.air){ u.maxHp=Math.round(u.maxHp*1.15); u.hp=u.maxHp; } },
      trainTime:0.88},
  ot:{title:'A Fényes Porta',
      text:'A janicsárok olcsóbbak: minden szárazföldi egység 12%-kal kevesebbe kerül.',
      unitCost:(role,c)=>{ if(role!=='warship'&&role!=='galleon') scaleCost(c,0.88); }},
  jp:{title:'A kard útja',
      text:'A közelharci egységek 20%-kal nagyobbat ütnek.',
      unit:u=>{ if(u.role==='melee'||u.role==='cav') u.dmg=Math.round(u.dmg*1.2); }},
  cn:{title:'A Középső Birodalom',
      text:'25%-kal több élelem, és az épületek 15%-kal szívósabbak.',
      gather:t=>t==='food'?1.25:1,
      build:b=>{ b.maxHp=Math.round(b.maxHp*1.15); b.hp=Math.round(b.hp*1.15); }},
  in:{title:'A fűszerek földje',
      text:'30%-kal több arany, de a kőfejtés 10%-kal lassabb.',
      gather:t=>t==='gold'?1.3:(t==='stone'?0.9:1)},
  ml:{title:'A só és az arany útja',
      text:'A piac 35%-kal jobb áron vált, és 20%-kal több arany.',
      gather:t=>t==='gold'?1.2:1,
      market:1.35}
};
/* =======================================================================
   FEJLESZTÉSEK
   Korszakon belül is lehet erősödni: három ág, egyenként három szinttel.
   A bot ugyanezeket vásárolja a saját nyersanyagából, tehát a késői játék
   nem áll meg ott, hogy mindenki elérte a 20. századot.
   ===================================================================== */
/* A fejlesztések két házban laknak:

     KOVÁCSMŰHELY — ami a katonát erősíti: fegyver, páncél, ellátmány.
     AKADÉMIA     — ami a birodalmat: termelés, építés, kiképzés, és a
                    huszadik században az atomprogram.

   A `hol` mező mondja meg, melyik épületben kutatható. */
const UPGRADES={
  weapon:{name:'Fegyverkovács', short:'Fegyver', desc:'+12% sebzés minden egységnek',
          hol:'smith', max:3, cost:{gold:120,wood:70}},
  armor: {name:'Páncélműhely',  short:'Páncél',  desc:'+2 páncél minden egységnek',
          hol:'smith', max:3, cost:{gold:110,stone:100}},
  supply:{name:'Ellátmány',     short:'Ellátás', desc:'+12% életerő minden egységnek',
          hol:'smith', max:3, cost:{food:200,gold:70}},

  // Akadémia: a birodalom működését gyorsítják. Korszakonként egy fokozat,
  // mindegyik 5%-ot ad — négy korszak alatt összesen 20%-ot.
  yield: {name:'Gazdálkodás',   short:'Termelés',desc:'+5% minden nyersanyag kitermelése fokozatonként',
          hol:'academy', max:4, perAge:true, cost:{gold:90,wood:120}},
  labor: {name:'Építőipar',     short:'Építés',  desc:'5%-kal gyorsabb építkezés fokozatonként',
          hol:'academy', max:4, perAge:true, cost:{wood:150,stone:90}},
  drill: {name:'Kiképzőtábor',  short:'Kiképzés',desc:'5%-kal gyorsabb kiképzés fokozatonként',
          hol:'academy', max:4, perAge:true, cost:{gold:110,food:140}},
  cargo: {name:'Hajóács',       short:'Férőhely',desc:'+5 férőhely a csapatszállítókon fokozatonként (10-ről 25-ig)',
          hol:'academy', max:3, cost:{wood:180,gold:120}},

  /* Az akadémia további kutatásai. Mind a birodalom működését javítja,
     nem közvetlenül a katonát — az a kovácsműhely dolga. */
  medicine:{name:'Gyógyszerkészlet', short:'Gyógyítás',
          desc:'A kórház és a tábori sebész 20%-kal gyorsabban gyógyít fokozatonként',
          hol:'academy', max:3, cost:{gold:140,food:180}},
  optics:{name:'Messzelátó',    short:'Látótáv',
          desc:'+12% látótáv minden egységnek és épületnek fokozatonként',
          hol:'academy', max:2, cost:{gold:160,stone:90}},
  storage:{name:'Raktározás',   short:'Teherbírás',
          desc:'A munkások 20%-kal többet cipelnek egy fordulóval fokozatonként',
          hol:'academy', max:3, cost:{wood:160,stone:110}},
  masonry:{name:'Kőművesség',   short:'Falak',
          desc:'Az épületek 12%-kal szívósabbak fokozatonként',
          hol:'academy', max:3, cost:{stone:200,gold:80}},
  ledger: {name:'Számvitel',    short:'Kincstár',
          desc:'Minden egység és épület 4%-kal olcsóbb fokozatonként',
          hol:'academy', max:3, cost:{gold:200,wood:100}},
  atom:  {name:'Atomprogram',   short:'Atom',    desc:'A bombázó atomcsapást mérhet: 2x2 majorságnyi területen minden megsemmisül',
          hol:'academy', max:1, minAge:3, cost:{gold:900,stone:400,coal:350}}
};
const UPG_KEYS=['weapon','armor','supply','yield','labor','drill','cargo',
  'medicine','optics','storage','masonry','ledger','atom'];
// Hány fő fér a csapatszállítóra? Alap tíz, fokozatonként öt, legfeljebb 25.
function cargoCap(owner){
  return Math.min(25, 10 + 5*((upgOf(owner).cargo)||0));
}
// Az akadémiai fokozatok korszakhoz kötöttek: a 15. században egy, a
// 17.-ben kettő, és így tovább. Egyszerre nem lehet mind a négyet megvenni.
function upgCap(key,owner){
  const d=UPGRADES[key];
  if(!d) return 0;
  if(!d.perAge) return d.max;
  return Math.min(d.max, ((typeof korOf==='function')?korOf(owner):(owner?G.ai.age:G.age))+1);
}
/* A fél FEJLESZTÉSEI. A régi alak minden nem-nulla tulajdonost „a gép”-nek
   vett: `owner ? G.ai.upg : G.upg`. Két félnél ez helyes volt, több
   emberrel viszont a 2. játékos az ELSŐ BOT fejlesztéseit kapta volna. */
function upgOf(owner){
  const o=(typeof oldal==='function')?oldal(owner):null;
  if(o&&o.upg) return o.upg;
  return (owner?(G.ai&&G.ai.upg):G.upg)||{};
}
function upgAvailable(key,owner){
  const u=UPGRADES[key], age=(typeof korOf==='function')?korOf(owner):(owner?G.ai.age:G.age);
  if(u.minAge!==undefined&&age<u.minAge) return false;
  // A korszakonkénti fokozatokból csak annyi vehető meg, ahány korszakot elértél
  if(u.perAge&&(upgOf(owner)[key]||0)>=upgCap(key,owner)) return false;
  return true;
}
function upgCost(key,owner){
  const lv=upgOf(owner)[key]||0, age=(typeof korOf==='function')?korOf(owner):(owner?G.ai.age:G.age);
  return scaleCost(costOf(UPGRADES[key].cost,age), 1+lv*0.9);
}
function applyUpg(u){
  const g=upgOf(u.owner);
  if(g.weapon) u.dmg*=1+0.12*g.weapon;
  if(g.armor)  u.armor+=2*g.armor;
  if(g.supply){ const r=u.maxHp?u.hp/u.maxHp:1;
    u.maxHp=Math.round(u.maxHp*(1+0.12*g.supply)); u.hp=u.maxHp*r; }
}
// Egy egység összes módosítójának újraszámolása alapértékekből
function recomputeUnit(u){
  const d=UNITS[u.role], age=u.age, ratio=u.maxHp?u.hp/u.maxHp:1;
  u.maxHp=d.hp[age]; u.dmg=val(d.dmg,age); u.range=val(d.range,age);
  u.speed=val(d.speed,age)*PACE.speed; u.atk=val(d.atk,age); u.r=val(d.r,age);
  u.armor=val(d.armor,age)||0; u.gatherMul=1;
  const bn=bonusOf(u.owner); if(bn.unit) bn.unit(u);
  applyDoct(u);
  applyUpg(u);
  u.hp=u.maxHp*ratio;
}
/* =======================================================================
   ÉPÜLET-PARANCSOK: befejezetlen építkezés folytatása és lerombolás
   ===================================================================== */
let demoArmed=null;
// A kijelölt munkások — vagy ha nincs kijelölve, a három legközelebbi —
// odaindulnak az épülethez befejezni vagy megjavítani.
function sendBuilders(){
  const b=G.selBuild;
  if(!b||b.dead||b.owner!==0||pausedBlock()) return;
  let crew=G.sel.filter(u=>!u.dead&&u.role==='worker');
  if(!crew.length)
    crew=G.units.filter(u=>!u.dead&&u.owner===0&&u.role==='worker')
      .sort((x,y)=>dist(x.x,x.y,b.x,b.y)-dist(y.x,y.y,b.x,b.y)).slice(0,3);
  if(!crew.length){ toast(T('uzNincsMunkas')); SFX.play('deny'); return; }
  for(const u of crew){ u.order={type:'repair',target:b}; u.target=null; }
  toast(crew.length+' munkás elindult: '+BUILDS[b.type].names[b.age]
        +(b.done?' javítása':' befejezése'));
  SFX.play('place',0.7);
}
// Meglévő falszakaszból kaput nyitunk: a sereged átjár rajta, az
// ellenség viszont nem — neki továbbra is fal.
function makeGate(){
  const b=G.selBuild;
  if(!b||b.dead||b.owner!==0||b.type!=='wall'||pausedBlock()) return;
  const c=buildCost('gate',b.age,ENID);
  if(!canPay(c)){ toast(T('uzNincsAnyagKettospont')+' '+costText(c)); SFX.play('deny'); return; }
  pay(c);
  const ratio=b.hp/b.maxHp;
  b.type='gate';
  const bn=bonusOf(0);
  b.maxHp=BUILDS.gate.hp[b.age];
  if(bn.build) bn.build(b);
  b.hp=b.maxHp*ratio;
  b.buildTime=BUILDS.gate.time*PACE.build;
  G.navVer++;
  SFX.at('place',b.x,b.y,1);
  toast(T('uzKapuNyilt'));
  G.btnSig=''; syncUI();
}
function demolish(){
  const b=G.selBuild;
  if(!b||b.dead||b.owner!==0||pausedBlock()) return;
  if(demoArmed!==b){                       // kétlépcsős, hogy ne menjen véletlenül
    demoArmed=b; G.btnSig=''; syncUI();
    toast(T('uzBiztosRombol'));
    SFX.play('deny'); return;
  }
  demoArmed=null;
  const c=buildCost(b.type,b.age,ENID), back={};
  const rate=0.5*(b.done?1:Math.max(0.35,b.prog));   // félkész épületért kevesebb jár
  for(const k in c){ const v=Math.floor(c[k]*rate); if(v>0){ back[k]=v; G.res[k]+=v; } }
  b.dead=true; G.selBuild=null; G.navVer++;
  G.fx.push({x:b.x,y:b.y,t:0,life:.55,type:'boom',r:Math.max(b.w,b.h)*0.45});
  SFX.at('destroy',b.x,b.y,0.75);
  toast(BUILDS[b.type].names[b.age]+' lerombolva'
        +(Object.keys(back).length?' — vissza: '+costText(back):''));
  G.btnSig=''; syncUI();
}
function buyUpgrade(key){
  if(typeof logAdd==='function'&&logAdd('upg', key)) return;
  if((upgOf(0)[key]||0)>=upgCap(key,0)){
    toast(T('uzKovKorszakban')); SFX.play('deny'); return;
  }
  if(pausedBlock()) return;
  const g=G.upg, d=UPGRADES[key];
  if((g[key]||0)>=d.max){ toast(d.name+': már a legmagasabb szinten.'); SFX.play('deny'); return; }
  if(!G.builds.some(b=>b.owner===0&&!b.dead&&b.done&&b.type==='academy')){
    toast(T('uzAkademiaKell')); SFX.play('deny'); return; }
  const c=upgCost(key,0);
  if(!canPay(c)){ toast(T('uzNincsAnyagKettospont')+' '+costText(c)); SFX.play('deny'); return; }
  pay(c); g[key]=(g[key]||0)+1;
  for(const u of G.units) if(!u.dead&&u.owner===0) recomputeUnit(u);
  toast(d.name+' '+g[key]+'. szint — '+d.desc);
  SFX.play('ready'); G.btnSig=''; syncUI();
}
/* =======================================================================
   IDEOLÓGIÁK
   Minden korszakba lépéskor egy doktrínát választasz háromból. A választás
   végleges és halmozódik: a 20. századra négy döntés formálja a birodalmat.
   A hatások ugyanazokon a pontokon kapcsolódnak be, mint a nemzeti bónuszok.
   ===================================================================== */
/* -----------------------------------------------------------------------
   IDEOLÓGIÁK NEMZETENKÉNT

   Minden ország saját irányokat kap, az adott korszak uralkodójához
   kötve: Mátyásnál a fekete sereg zsoldrendszere, Sobieskinél a szárnyas
   huszárok, Bismarcknál a vas és vér, Nagy Péternél a nyugati reform.
   Korszakonként három közül választasz, és a döntések halmozódnak.
   ----------------------------------------------------------------------- */
function dc(key,name,desc,eff){ return Object.assign({key,name,desc},eff||{}); }
const hpUp=m=>({unit:u=>{ u.maxHp=Math.round(u.maxHp*m); u.hp=u.maxHp; }});
const roleHp=(role,m)=>({unit:u=>{ if(u.role===role){ u.maxHp=Math.round(u.maxHp*m); u.hp=u.maxHp; } }});
const roleCheap=(role,m)=>({unitCost:(r,c)=>{ if(r===role) scaleCost(c,m); }});
const rolesCheap=(roles,m)=>({unitCost:(r,c)=>{ if(roles.indexOf(r)>=0) scaleCost(c,m); }});
const bldHp=(types,m)=>({build:b=>{ if(!types||types.indexOf(b.type)>=0){
  b.maxHp=Math.round(b.maxHp*m); b.hp=Math.round(b.hp*m); } }});

const NAT_DOCT={
 /* ---------------- KALÓZFRAKCIÓK ---------------- */
 ns:[[ dc('kodex','A kódex','A zsákmány igazságos: 25%-kal több arany.', {gather:t=>t==='gold'?1.25:1}),
       dc('szavazas','Kapitányválasztás','A legénység 20%-kal gyorsabban áll ki.', {trainTime:0.8}),
       dc('menedek','Szabad kikötő','Az épületek 25%-kal szívósabbak.', bldHp(null,1.25)) ]],
 bb:[[ dc('rettegett','Rettegett hírnév','A hajók 18%-kal nagyobbat ütnek.',
        {unit:u=>{ if(u.naval) u.dmg*=1.18; }}),
       dc('kanoc','Égő kanóc','Minden egység 15%-kal szívósabb.', hpUp(1.15)),
       dc('blokad','Blokád','25%-kal több arany.', {gather:t=>t==='gold'?1.25:1}) ]],
 sb:[[ dc('zsold','Fizetett legénység','A hajók 20%-kal olcsóbbak.',
        {unitCost:(r,c)=>{ if(r==='fisher'||r==='warship'||r==='transport') scaleCost(c,0.8); }}),
       dc('uriember','Úriember','A majorságok 30%-kal több élelmet adnak.', {food:1.3}),
       dc('konyvtar','Hajónapló','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}) ]],

 /* ---------------- SZIGETLAKÓK (rejtett) ---------------- */
 nat:[
  [ dc('vadaszat','Vadászat','A harcosok 14%-kal erősebbek.', {unit:u=>{ u.dmg*=1.14; }}),
    dc('halaszat','Halászat','A majorságok 25%-kal több élelmet adnak.', {food:1.25}),
    dc('torzsi','Törzsi szövetség','A seregkeret 20-szal nagyobb.', {pop:20}) ],
  [ dc('vadaszat2','Vadászat','A harcosok 14%-kal erősebbek.', {unit:u=>{ u.dmg*=1.14; }}),
    dc('halaszat2','Halászat','A majorságok 25%-kal több élelmet adnak.', {food:1.25}),
    dc('torzsi2','Törzsi szövetség','A seregkeret 20-szal nagyobb.', {pop:20}) ],
  [ dc('vadaszat3','Vadászat','A harcosok 14%-kal erősebbek.', {unit:u=>{ u.dmg*=1.14; }}),
    dc('halaszat3','Halászat','A majorságok 25%-kal több élelmet adnak.', {food:1.25}),
    dc('torzsi3','Törzsi szövetség','A seregkeret 20-szal nagyobb.', {pop:20}) ],
  [ dc('vadaszat4','Vadászat','A harcosok 14%-kal erősebbek.', {unit:u=>{ u.dmg*=1.14; }}),
    dc('halaszat4','Halászat','A majorságok 25%-kal több élelmet adnak.', {food:1.25}),
    dc('torzsi4','Törzsi szövetség','A seregkeret 20-szal nagyobb.', {pop:20}) ] ],

 /* ---------------- SPANYOLORSZÁG ---------------- */
 es:[
  [ dc('reconquista','Reconquista','A félsziget visszahódítása: a közelharci egységek 16%-kal erősebbek.',
       {unit:u=>{ if(u.role==='melee') u.dmg*=1.16; }}),
    dc('karavella','Karavella','Új hajótípus: a hajók 25%-kal olcsóbbak és 20%-kal gyorsabbak.',
       {unitCost:(r,c)=>{ if(r==='fisher'||r==='warship') scaleCost(c,0.75); },
        unit:u=>{ if(u.naval) u.speed*=1.2; }}),
    dc('katolikuskiralyok','A Katolikus Királyok','Két korona egy kézben: a seregkeret 25-tel nagyobb.', {pop:25}) ],
  [ dc('conquistador','Conquistadorok','A hódítók keveset kérnek: minden egység 18%-kal olcsóbb.',
       {unitCost:(r,c)=>scaleCost(c,0.82)}),
    dc('ezustflotta','Ezüstflotta','Az Újvilág kincse: 30%-kal több arany.', {gather:t=>t==='gold'?1.3:1}),
    dc('tercio','Tercio','A spanyol négyszög: a pikások és lövészek 22%-kal szívósabbak.',
       {unit:u=>{ if(u.role==='spear'||u.role==='ranged'){ u.maxHp=Math.round(u.maxHp*1.22); u.hp=u.maxHp; } }}) ],
  [ dc('bourbonreform','Bourbon-reformok','Az építkezés 25%-kal gyorsabb.', {buildTime:0.75}),
    dc('gyarmatiigaz','Gyarmati igazgatás','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}),
    dc('tengeriskola','Tengerészeti iskola','A hadihajók 25%-kal erősebbek.',
       {unit:u=>{ if(u.role==='warship') u.dmg*=1.25; }}) ],
  [ dc('semlegesseg','Semlegesség','Az épületek 30%-kal szívósabbak.', bldHp(null,1.3)),
    dc('iparositas_es','Iparosítás','Minden egység 16%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.84)}),
    dc('nyitas','Nyitás','A majorságok 30%-kal több élelmet adnak.', {food:1.3}) ] ],

 /* ---------------- MAGYARORSZÁG ---------------- */
 hu:[
  [ dc('feketesereg','Fekete sereg','Mátyás zsoldosai: a katonák 15%-kal olcsóbbak, a kiképzés 10%-kal gyorsabb.',
       Object.assign(rolesCheap(['melee','ranged','spear'],0.85),{trainTime:0.9})),
    dc('corvina','Corvina könyvtár','A tudás a hatalom: minden épület 12%-kal olcsóbb, a korszakváltás 10%-kal.',
       {buildCost:(t,c)=>scaleCost(c,0.88), ageCost:0.9}),
    dc('vegvar','Végvárrendszer','A tornyok és falak 30%-kal szívósabbak.', bldHp(['tower','wall','gate'],1.3)) ],
  [ dc('kuruc','Kuruc portya','Rákóczi lovasai 12%-kal gyorsabban járnak.', {unit:u=>{ u.speed*=1.12; }}),
    dc('talpas','Talpas gyalogság','A pikások és lövészek 18%-kal olcsóbbak.', rolesCheap(['spear','ranged'],0.82)),
    dc('erdely','Erdélyi kincstár','25%-kal több arany érkezik a bányákból.', {gather:t=>t==='gold'?1.25:1}) ],
  [ dc('nemzetor','Nemzetőrség','Kossuth toborzása: a seregkeret 25-tel nagyobb.', {pop:25}),
    dc('jobbagy','Jobbágyfelszabadítás','A szabad parasztok 15%-kal gyorsabban gyűjtenek.', {gather:()=>1.15}),
    dc('honved','Honvédsereg','Minden egység 12%-kal szívósabb.', hpUp(1.12)) ],
  [ dc('folyamor','Folyamőrség','A hadihajók 30%-kal szívósabbak.', roleHp('warship',1.3)),
    dc('iparos','Iparosítás','Az építkezés 25%-kal gyorsabb.', {buildTime:0.75}),
    dc('revizio','Revíziós hadsereg','Minden egység 12%-kal nagyobbat üt.', {unit:u=>{ u.dmg*=1.12; }}) ] ],

 /* ---------------- AUSZTRIA ---------------- */
 at:[
  [ dc('hazassag','Házassági politika','Amit más háborúval, azt te frigyekkel: a korszakváltás 18%-kal olcsóbb.', {ageCost:0.82}),
    dc('birgyules','Birodalmi gyűlés','Minden épület 15%-kal olcsóbb.', {buildCost:(t,c)=>scaleCost(c,0.85)}),
    dc('landsknecht','Landsknecht zsold','A gyalogság 15%-kal olcsóbb és gyorsabban áll ki.',
       Object.assign(rolesCheap(['spear','ranged'],0.85),{trainTime:0.88})) ],
  [ dc('barokk','Barokk udvar','A majorságok 28%-kal több élelmet adnak.', {food:1.28}),
    dc('liga','Törökellenes liga','A közelharci egységek 18%-kal szívósabbak.', roleHp('melee',1.18)),
    dc('haditanacs','Császári haditanács','A kiképzés 22%-kal gyorsabb.', {trainTime:0.78}) ],
  [ dc('kiegyezes','Kiegyezés','A kettős monarchia kerete: a seregkeret 22-vel nagyobb.', {pop:22}),
    dc('burokracia','Bürokrácia','Minden egység és épület 12%-kal olcsóbb.',
       {unitCost:(r,c)=>scaleCost(c,0.88), buildCost:(t,c)=>scaleCost(c,0.88)}),
    dc('vasut','Vasúthálózat','18%-kal gyorsabb gyűjtés.', {gather:()=>1.18}) ],
  [ dc('bekepolitika','Békepolitika','Az épületek 28%-kal szívósabbak.', bldHp(null,1.28)),
    dc('hadiipar','Hadiipar','Minden egység 15%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.85)}),
    dc('offenziva','Utolsó offenzíva','Minden egység 14%-kal nagyobbat üt.', {unit:u=>{ u.dmg*=1.14; }}) ] ],

 /* ---------------- LENGYELORSZÁG ---------------- */
 pl:[
  [ dc('jagello','Jagelló unió','Két nép egy korona alatt: a seregkeret 25-tel nagyobb.', {pop:25}),
    dc('porosz','Porosz hódoltság','25%-kal több fa és kő érkezik.', {gather:t=>(t==='wood'||t==='stone')?1.25:1}),
    dc('nemesi','Nemesi felkelés','A lovasság 18%-kal olcsóbb.', roleCheap('melee',0.82)) ],
  [ dc('huszar','Szárnyas huszárok','Sobieski rohamlovassága: a lovasok 15%-kal szívósabbak és 12%-kal erősebbek.',
       {unit:u=>{ if(u.role==='melee'){ u.maxHp=Math.round(u.maxHp*1.15); u.hp=u.maxHp; u.dmg*=1.12; } }}),
    dc('kahlenberg','Kahlenbergi roham','Minden egység 14%-kal gyorsabb.', {unit:u=>{ u.speed*=1.14; }}),
    dc('kincstar','Királyi kincstár','25%-kal több arany.', {gather:t=>t==='gold'?1.25:1}) ],
  [ dc('kaszas','Kaszás parasztok','A pikások 25%-kal olcsóbbak és gyorsabban állnak ki.',
       Object.assign(roleCheap('spear',0.75),{trainTime:0.9})),
    dc('mernok','Erődítő mérnök','Kościuszko sáncai: a tornyok és falak 32%-kal szívósabbak.',
       bldHp(['tower','wall','gate'],1.32)),
    dc('felkeles','Felkelés','A kiképzés 25%-kal gyorsabb.', {trainTime:0.75}) ],
  [ dc('legiok','Légiók','Minden egység 14%-kal szívósabb.', hpUp(1.14)),
    dc('varso','Varsói csata','Az épületek 25%-kal szívósabbak, a tornyok messzebbre lőnek.',
       {build:b=>{ b.maxHp=Math.round(b.maxHp*1.25); b.hp=Math.round(b.hp*1.25);
                   b.rangeMul=(b.rangeMul||1)*1.15; }}),
    dc('szanacio','Szanáció','Az építkezés 25%-kal gyorsabb.', {buildTime:0.75}) ] ],

 /* ---------------- NÉMETORSZÁG ---------------- */
 de:[
  [ dc('landsknechtde','Landsknecht ezredek','A gyalogság 16%-kal olcsóbb.', rolesCheap(['spear','ranged'],0.84)),
    dc('birreform','Birodalmi reform','Minden épület 15%-kal olcsóbb.', {buildCost:(t,c)=>scaleCost(c,0.85)}),
    dc('lovagi','Lovagi hagyomány','A lovasság 18%-kal szívósabb.', roleHp('melee',1.18)) ],
  [ dc('allando','Állandó hadsereg','A Nagy Választófejedelem újítása: a kiképzés 25%-kal gyorsabb.', {trainTime:0.75}),
    dc('hugenotta','Hugenotta betelepítés','18%-kal gyorsabb gyűjtés.', {gather:()=>1.18}),
    dc('fegyelem','Porosz fegyelem','Minden egység 15%-kal szívósabb.', hpUp(1.15)) ],
  [ dc('vasesver','Vas és vér','Bismarck útja: minden egység 15%-kal nagyobbat üt.', {unit:u=>{ u.dmg*=1.15; }}),
    dc('vamunio','Vámunió','Minden egység és épület 13%-kal olcsóbb.',
       {unitCost:(r,c)=>scaleCost(c,0.87), buildCost:(t,c)=>scaleCost(c,0.87)}),
    dc('tarsbizt','Társadalombiztosítás','A seregkeret 25-tel nagyobb.', {pop:25}) ],
  [ dc('tannenberg','Tannenberg','Az épületek 28%-kal szívósabbak.', bldHp(null,1.28)),
    dc('hadigazd','Hadigazdaság','Minden egység 16%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.84)}),
    dc('vezerkar','Vezérkar','A kiképzés 28%-kal gyorsabb.', {trainTime:0.72}) ] ],

 /* ---------------- FRANCIAORSZÁG ---------------- */
 fr:[
  [ dc('kirposta','Királyi posta','XI. Lajos hírvivői: az építkezés 22%-kal gyorsabb.', {buildTime:0.78}),
    dc('zsoldszerz','Zsoldos szerződések','Minden egység 15%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.85)}),
    dc('kozpontos','Központosítás','A korszakváltás 18%-kal olcsóbb.', {ageCost:0.82}) ],
  [ dc('versailles','Versailles','Az udvar ellátása: 30%-kal több élelem.', {food:1.3}),
    dc('vauban','Vauban erődjei','Minden épület 30%-kal szívósabb.', bldHp(null,1.3)),
    dc('napkiraly','A Napkirály hadserege','A seregkeret 25-tel nagyobb.', {pop:25}) ],
  [ dc('grande','Grande Armée','Napóleon serege 15%-kal nagyobbat üt.', {unit:u=>{ u.dmg*=1.15; }}),
    dc('tuzerseg','Tüzérség','A lövészek 20%-kal erősebbek, a tornyok messzebbre lőnek.',
       {unit:u=>{ if(u.role==='ranged') u.dmg*=1.2; },
        build:b=>{ b.rangeMul=(b.rangeMul||1)*1.18; }}),
    dc('codenap','Code Napoléon','Minden egység és épület 13%-kal olcsóbb.',
       {unitCost:(r,c)=>scaleCost(c,0.87), buildCost:(t,c)=>scaleCost(c,0.87)}) ],
  [ dc('szabadfr','Szabad Franciaország','Minden egység 15%-kal szívósabb.', hpUp(1.15)),
    dc('pancelos','Páncélos doktrína','A harckocsik 22%-kal erősebbek és szívósabbak.',
       {unit:u=>{ if(u.role==='melee'&&u.age===3){ u.dmg*=1.22; u.maxHp=Math.round(u.maxHp*1.22); u.hp=u.maxHp; } }}),
    dc('otodik','Ötödik Köztársaság','Az építkezés 26%-kal gyorsabb.', {buildTime:0.74}) ] ],

 /* ---------------- NAGY-BRITANNIA ---------------- */
 gb:[
  [ dc('csillagkamara','Csillagkamara','A rend ára: minden épület 15%-kal olcsóbb.', {buildCost:(t,c)=>scaleCost(c,0.85)}),
    dc('kereskszerz','Kereskedelmi szerződés','28%-kal több arany.', {gather:t=>t==='gold'?1.28:1}),
    dc('ijasz','Íjászhagyomány','A lövészek 20%-kal erősebbek és 12%-kal olcsóbbak.',
       Object.assign(roleCheap('ranged',0.88),{unit:u=>{ if(u.role==='ranged') u.dmg*=1.2; }})) ],
  [ dc('ujmintaju','Új mintájú hadsereg','Cromwell fegyelme: a kiképzés 22%-kal gyorsabb, az egységek 12%-kal szívósabbak.',
       Object.assign(hpUp(1.12),{trainTime:0.78})),
    dc('puritan','Puritán fegyelem','Minden egység 16%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.84)}),
    dc('hajozasi','Hajózási törvények','A hajók 30%-kal szívósabbak.',
       {unit:u=>{ if(u.naval){ u.maxHp=Math.round(u.maxHp*1.3); u.hp=u.maxHp; } }}) ],
  [ dc('ipariforr','Ipari forradalom','Az építkezés 28%-kal gyorsabb.', {buildTime:0.72}),
    dc('gyarmat','Gyarmatbirodalom','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}),
    dc('haditenger','Királyi Haditengerészet','A hadihajók 25%-kal erősebbek.',
       {unit:u=>{ if(u.role==='warship') u.dmg*=1.25; }}) ],
  [ dc('legicsata','Angliai csata','A repülőgépek 25%-kal szívósabbak.',
       {unit:u=>{ if(u.air){ u.maxHp=Math.round(u.maxHp*1.25); u.hp=u.maxHp; } }}),
    dc('hadigazdgb','Hadigazdaság','Minden egység 16%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.84)}),
    dc('kitartas','Kitartás','Az épületek 30%-kal szívósabbak.', bldHp(null,1.3)) ] ],

 /* ---------------- OROSZORSZÁG ---------------- */
 ru:[
  [ dc('moszkva','Moszkva egyesítése','A seregkeret 25-tel nagyobb.', {pop:25}),
    dc('kreml','A Kreml falai','Minden épület 30%-kal szívósabb.', bldHp(null,1.3)),
    dc('tatarjarom','A tatár iga vége','Minden egység 15%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.85)}) ],
  [ dc('nyugatireform','Nyugati reform','Nagy Péter iskolája: az építkezés 25%-kal gyorsabb.', {buildTime:0.75}),
    dc('flotta','Flottaépítés','A hajók 20%-kal olcsóbbak és 20%-kal szívósabbak.',
       {unitCost:(r,c)=>{ if(r==='fisher'||r==='warship') scaleCost(c,0.8); },
        unit:u=>{ if(u.naval){ u.maxHp=Math.round(u.maxHp*1.2); u.hp=u.maxHp; } }}),
    dc('szentpetervar','Szentpétervár','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}) ],
  [ dc('felperzselt','Felperzselt föld','Minden egység 18%-kal szívósabb.', hpUp(1.18)),
    dc('kozak','Kozák portyázók','Minden egység 15%-kal gyorsabb.', {unit:u=>{ u.speed*=1.15; }}),
    dc('szentszov','Szent Szövetség','A majorságok 28%-kal több élelmet adnak.', {food:1.28}) ],
  [ dc('nagyhatalom','Ipari nagyhatalom','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}),
    dc('emberfoleny','Emberfölény','A seregkeret 30-cal nagyobb, a katonák 12%-kal olcsóbbak.',
       {pop:30, unitCost:(r,c)=>scaleCost(c,0.88)}),
    dc('erodvonal','Erődvonal','A tornyok és falak 35%-kal szívósabbak.', bldHp(['tower','wall','gate'],1.35)) ] ],

 /* ---------------- KÉSZÜLŐ NEMZETEK ----------------
    Korszakonként három-három út, a nemzet történelmi karakteréhez
    igazítva. A szerkezet ugyanaz, mint a többinél: minden korszakban
    egyet választasz, és az végigkíséri a játszmát. */
 se:[[ dc('indelningsverk','Beosztásos hadsereg','A gyalogság 12%-kal gyorsabban áll ki.', {trainTime:0.88}),
       dc('bergslagen','Vasvidék','20%-kal több kő.', {gather:t=>t==='stone'?1.2:1}),
       dc('halland','Erődvonal','Az épületek 20%-kal szívósabbak.', bldHp(null,1.2)) ]],
 ot:[[ dc('devsirme','Devsirme','A katonák 15%-kal olcsóbbak.', {unitCost:(r,c)=>scaleCost(c,0.85)}),
       dc('timar','Timár-birtok','20%-kal több élelem.', {gather:t=>t==='food'?1.2:1}),
       dc('nagyagyu','Nagy ágyúk','Az ostromgépek 25%-kal nagyobbat ütnek.',
          {unit:u=>{ if(u.siege) u.dmg=Math.round(u.dmg*1.25); }}) ]],
 jp:[[ dc('busido','Busidó','A közelharc 18%-kal erősebb.',
          {unit:u=>{ if(u.role==='melee'||u.role==='cav') u.dmg=Math.round(u.dmg*1.18); }}),
       dc('sakoku','Zárt ország','Az épületek 25%-kal szívósabbak.', bldHp(null,1.25)),
       dc('kaido','Országút','Minden egység 10%-kal gyorsabb.',
          {unit:u=>{ u.speed=Math.round(u.speed*1.1); }}) ]],
 cn:[[ dc('vizsga','Hivatalnoki vizsga','25%-kal több élelem.', {gather:t=>t==='food'?1.25:1}),
       dc('nagyfal','A Nagy Fal','A védőművek 40%-kal szívósabbak.', bldHp('tower',1.4)),
       dc('selyemut','Selyemút','25%-kal több arany.', {gather:t=>t==='gold'?1.25:1}) ]],
 in:[[ dc('fuszer','Fűszerkereskedelem','30%-kal több arany.', {gather:t=>t==='gold'?1.3:1}),
       dc('elefant','Harci elefántok','A közelharci egységek 20%-kal szívósabbak.',
          {unit:u=>{ if(u.role==='melee'){ u.maxHp=Math.round(u.maxHp*1.2); u.hp=u.maxHp; } }}),
       dc('kezmuves','Kézműves céhek','Az épületek 15%-kal olcsóbbak.',
          {buildCost:(t,c)=>scaleCost(c,0.85)}) ]],
 ml:[[ dc('sokereskedelem','Sókereskedelem','20%-kal több arany.', {gather:t=>t==='gold'?1.2:1}),
       dc('timbuktu','Timbuktu tudósai','A fejlesztések 20%-kal olcsóbbak.',
          {upgCost:(k,c)=>scaleCost(c,0.8)}),
       dc('lovasijasz','Lovas íjászok','A lovasság 15%-kal gyorsabb.',
          {unit:u=>{ if(u.role==='cav') u.speed=Math.round(u.speed*1.15); }}) ]]
};
// Melyik nemzet ideológiái tartoznak a játékoshoz, illetve a bothoz
function doctSet(owner){ return NAT_DOCT[nationOf(owner)]||NAT_DOCT.hu; }
const DOCTRINES=NAT_DOCT.hu;                    // visszafelé kompatibilitás

/* A fél IDEOLÓGIÁI. Ugyanaz a hiba volt benne, mint a fejlesztéseknél:
   minden nem-nulla fél az első bot döntéseit örökölte. */
function doctList(owner){
  const o=(typeof oldal==='function')?oldal(owner):null;
  const src=(o&&o.doct)||(owner?(G.ai&&G.ai.doct):G.doct), out=[];
  for(let a=0;a<DOCTRINES.length;a++){
    const k=src&&src[a]; if(!k) continue;
    const d=doctSet(owner)[a].filter(x=>x.key===k)[0];
    if(d) out.push(d);
  }
  return out;
}
/* Az akadémiai fejlesztések hatása: fokozatonként 5%. */
function upgMul(owner,key){ return 1+((upgOf(owner)[key]||0)*0.05); }
// Ugyanez tetszőleges lépésközzel — a különböző kutatások mást adnak
function upgMul2(owner,key,lepes){ return 1+((upgOf(owner)[key]||0)*(lepes||0.05)); }
function doctMul(owner,field,arg){
  let m=1;
  for(const d of doctList(owner)){
    if(typeof d[field]==='function') m*=d[field](arg);
    else if(typeof d[field]==='number') m*=d[field];
  }
  return m;
}
function applyDoct(u){ for(const d of doctList(u.owner)) if(d.unit) d.unit(u); }
function houseCount(owner){
  let n=0;
  for(const b of G.builds)
    if(!b.dead&&b.owner===owner&&b.type==='house'&&b.done) n++;
  return n;
}
function popCap(){
  let p=90;
  for(const d of doctList(0)) if(d.pop) p+=d.pop;
  p+=houseCount(0)*BUILDS.house.pop;           // minden kész lakóház öt fő
  return p;
}
function scaleCost(c,m){ for(const k in c) c[k]=Math.max(5,Math.round(c[k]*m/5)*5); return c; }
function nationOf(owner){
  /* Több fél esetén mindenkinek saját nemzete van. A tábla hiányában
     (menü, betöltés) a régi kétfeles válasz marad. */
  const o=(typeof oldal==='function')?oldal(owner):null;
  if(o&&o.nemzet) return o.nemzet;
  return owner?(G.ai?G.ai.nation:'de'):G.nation;
}
function bonusOf(owner){ return BONUS[nationOf(owner)]||{}; }

function costOf(base,age){ // a költségek korszakonként 22%-kal nőnek
  const o={},m=1+age*0.22;
  for(const k in base) o[k]=Math.round(base[k]*m/5)*5;
  return o;
}
// Nemzetfüggő költségek
function buildCost(type,age,owner){
  const c=costOf(BUILDS[type].cost,age), b=bonusOf(owner);
  if(b.buildCost) b.buildCost(type,c);
  for(const d of doctList(owner)) if(d.buildCost) d.buildCost(type,c);
  scaleCost(c, 1/upgMul2(owner,'ledger',0.04));    // Számvitel: olcsóbb építkezés
  return c;
}
function unitCost(role,age,owner){
  const c=costOf(UNITS[role].cost,age), b=bonusOf(owner);
  if(b.unitCost) b.unitCost(role,c);
  for(const d of doctList(owner)) if(d.unitCost) d.unitCost(role,c);
  scaleCost(c, 1/upgMul2(owner,'ledger',0.04));    // Számvitel: olcsóbb kiképzés
  return c;
}
function ageCost(age,owner){
  const c=Object.assign({},AGES[age].cost), b=bonusOf(owner);
  if(b.ageCost) b.ageCost(c);
  // Az ideológia szorzóként és függvényként is megadhatja a kedvezményt
  for(const d of doctList(owner)){
    if(typeof d.ageCost==='function') d.ageCost(c);
    else if(typeof d.ageCost==='number') scaleCost(c,d.ageCost);
  }
  return c;
}
// Egy küldetés felülírhatja, mit lehet az adott épületben kiképezni
function trainsOf(b){
  if(b.type==='hq'&&G.mission&&G.mission.hqTrains) return G.mission.hqTrains;
  /* Kalózvilágban a HAJÓKAT a város állítja ki, nem a kikötő: a
     főhadiszállás sólyája elég hozzá. Így kikötő és kaszárnya nélkül is
     lehet flottát építeni — a kalózok is a parton ácsolták a hajóikat. */
  if(G.pirate&&b.type==='hq')
    return ['transport','warship','galleon'];
  return BUILDS[b.type].trains;
}
/* A nyersanyag neve.

   KALÓZVILÁGBAN a kő helyett RUM jár: a szigeteken nem kőbányákból, hanem
   a cukornádból élnek, és a legénységet rummal fizetik. A játékmenet
   ugyanaz — csak a neve, a színe és az ikonja más. */
/* Mennyit termelnek az ÉPÜLETEK egy nyersanyagból másodpercenként?
   Ez az, ami a nyersanyagsávban a szám alatt megjelenik: a majorság, az
   aranybánya, a cukornád-ültetvény és a favágótelep hozama. A munkások
   fordulónkénti behordása ebbe nem számít bele, mert az szakaszos. */
function resIncome(res,owner){
  owner=owner||0;
  let n=0;
  for(const b of G.builds){
    if(b.dead||!b.done||b.owner!==owner) continue;
    const d=BUILDS[b.type];
    if(!d) continue;
    if(res==='food'&&d.food)
      n+=val(d.food,b.age)*PACE.farm*doctMul(owner,'food')*upgMul(owner,'yield');
    if(d.termel&&d.termel[res])
      n+=d.termel[res]*PACE.farm*upgMul(owner,'yield');
  }
  return n;
}
function resName(k){
  if(k==='stone'&&G.pirate){
    const r=T('rum');                        // a sávban végig nagybetűs
    return (LANG==='zh')?r:(r.charAt(0)+r.slice(1).toLowerCase());
  }
  const t={wood:'fa',stone:'ko',gold:'arany',food:'elelem',coal:'szen'}[k];
  if(t&&typeof T==='function'){
    const sz=T(t);
    if(sz&&sz!==t) return sz.charAt(0)+sz.slice(1).toLowerCase();
  }
  return RES_NAMES[k];
}
function costText(c){return Object.keys(c).map(k=>c[k]+' '+resName(k)).join(' · ');}
/* A létszámba a hajók fedélzetén utazók is beleszámítanak. Enélkül be
   lehetne pakolni egy csapatszállítót, új katonákat képezni a felszabadult
   keretre, majd kirakodni — így a seregkeret megkerülhető lenne. */
function popOf(owner){
  let n=0;
  for(const u of G.units){
    if(u.dead||u.owner!==owner) continue;
    n++;
    if(u.cargo&&u.cargo.length)
      for(const c of u.cargo) if(c.owner===owner) n++;
  }
  return n;
}

function nearestNode(x,y,type){
  let best=null,bd=1e9;
  for(const n of G.nodes){ if(n.dead||n.type!==type) continue;
    const d=dist(x,y,n.x,n.y); if(d<bd){bd=d;best=n;} }
  return best;
}
function nearestDrop(u){
  let best=null,bd=1e9;
  const want=u.naval?'navalDrop':'drop';        // a hajó a kikötőbe hordja a fogást
  for(const b of G.builds){ if(b.dead||b.owner!==u.owner||!b.done||!BUILDS[b.type][want]) continue;
    const d=dist(u.x,u.y,b.x,b.y); if(d<bd){bd=d;best=b;} }
  return best;
}
// A "from" a támadó: ha megadják, csak olyan célt adunk vissza, amit el is
// tud érni — a lándzsás nem üldöz repülőt, a bombázó nem vadászik gépre.
/* ÉJSZAKAI REJTŐZÉS.

   Sötétben egy vitorlás sziluettje elvész a tengeren: az ellenség csak
   közelebbről veszi észre. Ettől lesz értelme az éjszakai rajtaütésnek —
   besurransz a városhoz, mielőtt a tornyok tüzet nyitnának. Viharban még
   kevesebbet látni. */
function navalStealth(cel){
  if(!cel||!cel.naval) return 1;
  const ej=(typeof nightFactor==='function')?nightFactor():0;
  let f=1-0.45*ej;
  if(typeof seaSightMul==='function') f*=seaSightMul();
  return Math.max(0.35,f);
}
function nearestEnemy(x,y,owner,rad,from){
  /* SZÖVETSÉGES nem célpont. Korábban minden idegen tulajdonos ellenség
     volt (`u.owner===owner` kizárása) — két fél között ez helyes, de
     csapatban ez azt jelentette volna, hogy a szövetségesedre lő az
     őrtornyod. Az `ellenseg()` a csapatszámot nézi. */
  const ellenfel=(o)=>(typeof ellenseg==='function')?ellenseg(owner,o):(o!==owner);
  let best=null,bd=rad*rad;
  for(const u of G.units){ if(u.dead||!ellenfel(u.owner)||!seen(owner,u)) continue;
    // Az álruhás kémet nem lövik — amíg le nem leplezik
    if(u.disguise&&dist(u.x,u.y,x,y)>SPY_FELISMER) continue;
    // Éjjel és viharban a hajót csak közelebbről veszik észre
    if(u.naval&&dist(u.x,u.y,x,y)>rad*navalStealth(u)) continue;
    if(from&&!canEngage(from,u)) continue;
    // a hittérítő elsődleges célpont: közelebbinek számít, mint amilyen valójában
    const d=((u.x-x)**2+(u.y-y)**2)*(u.role==='priest'?0.3:1);
    if(d<bd){bd=d;best=u;} }
  if(best) return best;
  if(from&&from.air&&!from.bomb) return null;      // vadász nem üt épületet
  bd=rad*rad;
  for(const b of G.builds){ if(b.dead||!ellenfel(b.owner)||!seen(owner,b)) continue;
    const d=(b.x-x)**2+(b.y-y)**2; if(d<bd){bd=d;best=b;} }
  return best;
}
function entAt(wx,wy){ // mi van az egérkurzor alatt? (a ködben rejtőzőt nem adjuk vissza)
  for(const u of G.units)
    if(!u.dead && dist(wx,wy,u.x,u.y)<u.r+7 && (u.owner===0||seen(0,u))) return u;
  for(const b of G.builds){ if(b.dead) continue;
    if(!enyemVagySzovetseges(b.owner)&&!seen(helyiFel(),b)) continue;
    const r=buildRect(b); if(wx>r.x&&wx<r.x+r.w&&wy>r.y&&wy<r.y+r.h) return b; }
  for(const n of G.nodes)
    if(!n.dead && dist(wx,wy,n.x,n.y)<n.r+7 && fogAt(n.x,n.y)>0) return n;
  return null;
}
function hitRadius(e){return e.kind==='build'?Math.max(e.w,e.h)*0.45:e.r;}
