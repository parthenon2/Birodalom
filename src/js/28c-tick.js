/* =======================================================================
   28/C. RÖGZÍTETT IDŐLÉPÉS ÉS PARANCSNAPLÓ

   A determinizmus második fele. Hiába magvas a véletlen, ha a két gép
   MÁS IDŐLÉPÉSSEL számol: az egyiken 60 kép/mp, a másikon 45, és a
   lépések hossza eltér — a világok azonnal szétcsúsznak.

   Ezért a szimuláció FIX ütemben fut: másodpercenként húsz lépés, mindig
   pontosan 0,05 másodperccel. A rajzolás ettől független, mehet gyorsabban
   vagy lassabban.

   A PARANCSNAPLÓ minden játékosi beavatkozást feljegyez a lépés sorszámával:

       { l: 340, p: 'move', a: [1502, 880, [12,13]] }

   Ebből a napló + a mag együtt PONTOSAN visszaadja a játszmát. Ez a
   visszajátszás alapja — és ugyanez megy majd át a hálózaton is, mert
   néhány száz bájt elég egy egész csatához.
   ===================================================================== */

const SIM_LEPES=0.05;              // másodpercenként húsz szimulációs lépés
const SIM_MAX_UTOL=6;              // egy képkockán legfeljebb ennyit pótolunk

/* --- Parancsnapló --- */
function logInit(){
  G.naplo=[];
  G.lepes=0;
  G.naploFut=false;                 // igaz, amíg visszajátszás megy
  G.naploIdx=0;
}
/* Igaz értéket ad, ha a parancsot ELHALASZTOTTA a hálózatra. Ilyenkor a
   hívónak AZONNAL vissza kell térnie, végrehajtás nélkül: a művelet majd
   a beütemezett lépésben fut le, mindkét gépen egyszerre.

   Enélkül a parancs kétszer hatott volna a saját gépünkön — egyszer most,
   egyszer hat lépéssel később —, a társnál pedig csak egyszer. Az első
   kiadott parancs szétcsúsztatta volna a két világot. */
function logAdd(parancs, ...adat){
  // visszajátszás és a hálózati parancsok végrehajtása közben nem naplózunk
  if(!G.naplo||G.naploFut||G.parancsFut) return false;
  if(typeof netParancs==='function'&&netParancs(parancs,adat)) return true;
  /* A parancs a KÖVETKEZŐ lépésben fejti ki a hatását, mert a játékos két
     lépés KÖZÖTT adja ki. Visszajátszáskor is így kell futnia — enélkül
     egy lépéssel korábban hatna, és a világok szétcsúsznának. */
  G.naplo.push({l:(G.lepes||0)+1, p:parancs, a:adat});
  return false;
}
/* Visszajátszáskor a soron lévő lépés parancsait végrehajtjuk. */
function logApply(){
  if(!G.naploFut||!G.naploBe) return;
  while(G.naploIdx<G.naploBe.length && G.naploBe[G.naploIdx].l<=G.lepes){
    const cs=G.naploBe[G.naploIdx++];
    const fn=PARANCS_TABLA[cs.p];
    if(fn) try{ fn.apply(null,cs.a); }catch(e){}
  }
}
/* A visszajátszható parancsok. Csak azok, amik a VILÁGOT változtatják. */
/* A PARANCS_TABLA és a parancsRegiszter az 01-util.js-be került, mert a
   modulok BÁRMELYIKE regisztrálhat parancsot — például az
   ideológiaválasztás a 26-os fájlban. Itt, a 68. modulban `const`-tal
   deklarálva a korábbi hívások „Cannot access before initialization”
   hibába futottak, és ettől az EGÉSZ szkript elszállt: fehér képernyő,
   semmi nem működött. */

/* --- A rögzített ütemű szimuláció --- */
function simStep(dt){
  /* A NAPLÓ ELŐBB fut, mint az idő léptetése.

     A játékos két lépés KÖZÖTT ad parancsot, tehát a régi játékidőben.
     Ha visszajátszáskor az idő már továbblépett volna, a parancs más
     időbélyeget kapna (például a lökésmentesség hossza), és a világok
     szétcsúsznának. Egy lépésnyi eltérés is elég hozzá. */
  G.lepes=(G.lepes||0)+1;
  logApply();                                    // visszajátszás
  if(typeof netTarsParancsok==='function') netTarsParancsok();
  if(typeof netLepesKuld==='function') netLepesKuld();
  G.t+=dt;
  G.flowBudget=FLOW_BUDGET;
  for(const u of G.units) if(!u.dead) updateUnit(u,dt);
  for(const u of G.units) if(!u.dead){ separate(u); blockByBuildings(u);
    u.x=clamp(u.x,10,WORLD.w-10); u.y=clamp(u.y,10,WORLD.h-10); }
  for(const b of G.builds) if(!b.dead) updateBuild(b,dt);
  for(const p of G.projs) if(!p.dead) updateProj(p,dt);
  updateAI(dt); regrow(dt); updateFog(dt); tickWarm();
  safeTick('kiesés', typeof kiesesFigyel==='function'?kiesesFigyel:null, dt);
  safeTick('események', eventTick, dt);
  safeTick('piac', typeof marketTick==='function'?marketTick:null, dt);
  safeTick('időjárás', typeof weatherTick==='function'?weatherTick:null, dt);
  safeTick('tengeri idő', typeof seaTick==='function'?seaTick:null, dt);
  safeTick('vitorlajavítás', typeof sailTick==='function'?sailTick:null, dt);
  safeTick('hírnév', typeof hirnevTick==='function'?hirnevTick:null, dt);
  safeTick('ellátás', typeof supplyTick==='function'?supplyTick:null, dt);
  safeTick('kereskedelem', typeof tradeRouteTick==='function'?tradeRouteTick:null, dt);
  safeTick('hős aurája', typeof heroAura==='function'?heroAura:null, dt);
  safeTick('csatakiáltás', typeof kialtasTick==='function'?kialtasTick:null, dt);
  safeTick('diplomácia', typeof diplTick==='function'?diplTick:null, dt);
  safeTick('bot diplomáciája', typeof diplBotLep==='function'?diplBotLep:null, dt);
  safeTick('városostrom', typeof ostromTick==='function'?ostromTick:null, dt);
  safeTick('partraszállás', typeof partraSzallasTick==='function'?partraSzallasTick:null, dt);
  // takarítás
  G.units=G.units.filter(u=>!u.dead);
  G.builds=G.builds.filter(b=>!b.dead);
  if(G.builds.length!==G.navLen){G.navLen=G.builds.length;G.navVer++;}
  G.projs=G.projs.filter(p=>!p.dead);
  G.nodes=G.nodes.filter(n=>!n.dead);
  G.sel=G.sel.filter(u=>!u.dead);
  if(G.selBuild&&G.selBuild.dead) G.selBuild=null;
  checkEnd();
  if(typeof netEllenor==='function') netEllenor();
}

/* --- VISSZAJÁTSZÁS --- */
function replayMent(){
  return {
    v:1, mag:G.simMag, nemzet:G.campNation, kuldetes:G.missionIdx,
    kaloz:!!G.pirate, terep:G.mapType, nehez:G.diff,
    lepes:G.lepes, naplo:G.naplo||[], ell:simChecksum()
  };
}
function replayIndit(r){
  if(!r||r.v!==1) return false;
  G.simMag=r.mag>>>0;
  G.pirate=!!r.kaloz;
  G.diff=r.nehez;
  newGame(r.nemzet, r.kuldetes);
  G.naploBe=r.naplo||[];
  G.naploIdx=0;
  G.naploFut=true;
  G.replayCel=r;
  toast(T('uzVisszajatszas')+': '+(G.naploBe.length)+' '+T('uzParancsDb'));
  return true;
}

/* --- A visszajátszható parancsok bejegyzése ---

   Minden itt felsorolt parancs bekerül a naplóba, és visszajátszáskor
   ugyanígy fut le. A kijelölést AZONOSÍTÓKKAL írjuk le, mert a mutató
   objektumok visszajátszáskor már más példányok. */
function selIdk(){ return G.sel.filter(u=>!u.dead).map(u=>u.id); }
/* --- JOGOSULTSÁG ---
   A parancsok a hálózaton érkeznek, tehát bárki bármit küldhet: a
   protokoll nem tudja, mi „szabályos”. Ezért a végrehajtás oldalán kell
   ellenőrizni, hogy a feladó a SAJÁT birodalmához nyúl-e.

   Enélkül egy módosított kliens beírhatta volna a TE egységeid
   azonosítóit a saját parancsába, és elsétáltathatta volna a seregedet —
   a te gépeden is, hiszen a parancs mindenhol lefut.

   A `G.enId` a parancs futása alatt a feladóra van állítva, tehát az
   ENID épp azt jelenti: „ki adta ki ezt a parancsot”. */
function selVissza(idk){
  G.sel=[];
  if(!idk) return;
  const map={};
  for(const u of G.units) if(!u.dead) map[u.id]=u;
  for(const id of idk){
    const u=map[id];
    if(u&&u.owner===ENID) G.sel.push(u);   // csak a saját egységeit vezérelheti
  }
}
parancsRegiszter('sel', (idk)=>{ selVissza(idk); });
parancsRegiszter('selB',(id)=>{
  G.selBuild=null;
  /* Csak a saját épületét jelölheti ki — különben a másik játékos
     kaszárnyájába állíthatna sorba egységeket. */
  for(const b of G.builds) if(!b.dead&&b.id===id&&b.owner===ENID) G.selBuild=b;
});
parancsRegiszter('cmd', (idk,x,y)=>{ selVissza(idk); command(x,y); });
parancsRegiszter('build',(x,y,tipus,keep,idk)=>{
  /* AZ ÉPÜLETTÍPUS és a HELY is a hálózatról jön. Ismeretlen típusnál a
     `BUILDS[tipus].cost` olvasása kivételt dob; nem-szám koordinátánál
     az épület a semmibe kerülne. Mindkettőt itt szűrjük ki, mert a
     lépészár try/catch-e elnyeli a kivételt — és az elnyelt kivétel
     elrejti a valódi hibákat is. */
  if(typeof tipus!=='string'||!BUILDS[tipus]) return;
  if(typeof x!=='number'||typeof y!=='number'||!isFinite(x)||!isFinite(y)) return;

  /* A G.place a HELYI felület állapota: „mit tartok épp a kezemben”.
     A parancs ideiglenesen átállítja, hogy a placeBuilding tudja, mit
     rakjon le — de utána VISSZA kell adni, különben a társad építkezése
     után nálad is ott ragadna az építési árnyék, és a következő
     kattintásod véletlenül épületet tenne le. */
  const elozo=G.place;
  G.place=tipus;
  /* Az építőket azonosító alapján keressük meg — a helyi kijelölés nem
     használható, az minden gépen más. */
  let epitok=null;
  if(idk&&idk.length){
    const map={};
    for(const u of G.units) if(!u.dead) map[u.id]=u;
    epitok=idk.map(id=>map[id]).filter(Boolean);
  }
  placeBuilding(x,y,keep,epitok||[]);
  G.place=elozo;
});
parancsRegiszter('train',(id,role,db)=>{
  /* A SZEREPNÉV a hálózatról jön: ha ismeretlen, a kiképzés a
     `UNITS[role].cost` olvasásán elszállna. A hívást ugyan try/catch
     veszi körül, tehát nem akaszt meg senkit — de az elnyelt kivétel
     elrejti a valódi hibákat is, ezért itt szűrjük ki.

     A darabszám is ellenőrzött: nem lehet negatív, nem lehet szöveg, és
     egy paranccsal legfeljebb annyit kérhet, amennyi a sorba fér. A
     `trainOne` amúgy is elfogy a készlettel, de a nyilvánvalót olcsóbb
     itt megfogni. */
  if(typeof role!=='string'||!UNITS[role]) return;
  const darab=(typeof db==='number'&&isFinite(db))?Math.max(1,Math.min(50,Math.floor(db))):1;
  G.selBuild=null;
  for(const b of G.builds) if(!b.dead&&b.id===id&&b.owner===ENID) G.selBuild=b;
  if(!G.selBuild) return;                  // idegen épületbe nem képezhet
  /* Csak azt képezheti, amit az épület tud. */
  if(typeof trainsOf==='function'){
    const lista=trainsOf(G.selBuild);
    if(lista&&lista.indexOf(role)<0) return;
  }
  train(role,darab);
});
parancsRegiszter('stance',(idk,all)=>{ selVissza(idk); if(typeof setStance==='function') setStance(all); });
parancsRegiszter('form',  (idk,f)=>{ selVissza(idk); if(typeof setFormation==='function') setFormation(f); });
parancsRegiszter('toltet',(k)=>{ if(typeof toltetValaszt==='function') toltetValaszt(k); });
parancsRegiszter('varosEpit',(kulcs,tipus)=>{ if(typeof portEpit==='function') portEpit(kulcs,tipus); });
parancsRegiszter('varosFoglal',(kulcs)=>{ if(typeof varosFoglalVegrehajt==='function') varosFoglalVegrehajt(kulcs); });
parancsRegiszter('varosFoszt', (kulcs)=>{ if(typeof varosKifosztVegrehajt==='function') varosKifosztVegrehajt(kulcs); });
parancsRegiszter('upg',   (k)=>{ if(typeof buyUpgrade==='function') buyUpgrade(k); });
parancsRegiszter('age',   ()=>{ if(typeof advanceAge==='function') advanceAge(); });
/* A kijelölés HELYI marad: nem megy át a hálózaton, különben a két játékos
   folyton egymás kijelölését írná felül. A parancsok ezért viszik magukkal
   az egységek azonosítóit (lásd 'cmd'). */
