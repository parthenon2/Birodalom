/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   20. PARANCSOK — építés, kiképzés, kijelölés
   ===================================================================== */
// Szünetben a világ áll — akkor sorba állni, építeni, kutatni sem lehet.
function pausedBlock(){
  if(!G.paused) return false;
  toast(T('uzSzunet'));
  SFX.play('deny');
  return true;
}
function startPlacing(type){
  /* A kalózvilág épületei (cukornád) csak ott építhetők. Ez a KÖZÖS
     kapu: a gomb és a gyorsbillentyű is ide fut be, tehát elég egyszer
     megfogni. */
  if(BUILDS[type]&&BUILDS[type].kalozCsak&&!G.pirate) return;
  if(pausedBlock()) return;
  if(G.mission&&G.mission.ban&&G.mission.ban.indexOf(type)>=0){
    toast(BUILDS[type].names[G.age]+' ebben a küldetésben nem építhető.');
    SFX.play('deny'); return;
  }
  // Kalózmódban nincs jobbágy: a kolóniát a partra tett legénység emeli
  if(!G.pirate&&!G.sel.some(u=>!u.dead&&u.role==='worker')){
    toast(T('uzCsakMunkas'));
    SFX.play('deny'); return;
  }
  const c=buildCost(type,G.age,ENID);
  if(!canPay(c)){toast(T('uzNincsAnyagKettospont')+': '+costText(c));SFX.play('deny');return;}
  G.place=(G.place===type)?null:type;
  SFX.play('click'); syncUI();
}
// Falsor húzása: a kezdőponttól a mostani pontig egyenes vonalban
// kiszámoljuk a szakaszok helyét. A hosszabbik tengelyt választjuk, hogy
// mindig egyenes fal legyen, ne cikcakk.
function wallLine(x0,y0,x1,y1){
  const step=BUILDS.wall.w, out=[];
  const sx=snap(x0,'wall'), sy=snap(y0,'wall');
  const ex=snap(x1,'wall'), ey=snap(y1,'wall');
  const dx=ex-sx, dy=ey-sy;
  const n=Math.min(40,Math.round(Math.max(Math.abs(dx),Math.abs(dy))/step));
  if(Math.abs(dx)>=Math.abs(dy)){
    const s=Math.sign(dx)||1;
    for(let i=0;i<=n;i++) out.push({x:sx+i*step*s,y:sy});
  }else{
    const s=Math.sign(dy)||1;
    for(let i=0;i<=n;i++) out.push({x:sx,y:sy+i*step*s});
  }
  return out;
}
// A húzás végén az egész sort lerakjuk, ameddig futja a nyersanyag
function placeWallLine(x0,y0,x1,y1){
  if(pausedBlock()) return;
  const list=wallLine(x0,y0,x1,y1);
  let built=0, stopped='';
  for(const p of list){
    const c=buildCost('wall',G.age,ENID);
    if(!canPay(c)){ stopped='Elfogyott a nyersanyag — '+built+' szakasz épül.'; break; }
    if(!freeSpot(p.x,p.y,BUILDS.wall.w,BUILDS.wall.h,padFor('wall'))) continue;
    if(!inBuildRange(p.x,p.y,ENID,'wall').ok) continue;
    pay(c);
    const nb=makeBuild('wall',ENID,p.x,p.y,G.age,false);
    G.builds.push(nb); built++;
  }
  if(built){
    G.navVer++;
    SFX.at('place',x1,y1,1);
    /* A falszakaszokat az alapokhoz legközelebbi szabad munkások húzzák
       fel — nem a kijelöltek. A kijelölés a képernyő állapota, gépenként
       más; a szimulációnak mindenhol ugyanazt kell látnia. */
    const utolso=G.builds[G.builds.length-1];
    const crew=epitokValaszt(ENID, utolso, 2);
    for(const u of crew){ u.order={type:'repair',target:G.builds[G.builds.length-1]}; u.target=null; }
    toast(built+' falszakasz kijelölve'+(crew.length?' — '+crew.length+' munkás indul':' — küldj oda munkást!'));
  }else toast(T('uzNemFer'));
  if(stopped) toast(stopped);
  syncUI();
}
// Atomcsapás kijelölése: a kiválasztott bombázó odarepül és ledobja
function armAtom(){
  if(pausedBlock()) return;
  if(!(G.upg.atom>0)){ toast(T('uzAtomKutatas')); SFX.play('deny'); return; }
  const bombers=G.sel.filter(u=>!u.dead&&u.bomb&&u.owner===ENID);
  if(!bombers.length){ toast(T('uzJelöljBombazot')); SFX.play('deny'); return; }
  if(G.atomUsed){ toast(T('uzToltetElfogyott')); SFX.play('deny'); return; }
  G.atomAim=bombers[0];
  toast(T('uzValasszCelpont'));
  syncUI();
}
function fireAtom(wx,wy){
  const b=G.atomAim; G.atomAim=null;
  if(!b||b.dead) return;
  b.atomLoad=true;
  b.order={type:'atom',x:wx,y:wy};
  b.target=null;
  G.atomUsed=true;
  toast(T('uzBombazoUton'));
  syncUI();
}
// A bezáró gomb mindig a legfelső "nyitott" dolgot zárja: előbb az
// atomcélzást, aztán az építési módot, végül a kijelölést. Így egy
// gombbal vissza lehet lépni bármelyik állapotból — érintésen ez az
// egyetlen kiút, mert ott nincs Esc.
function closeTop(){
  if(G.atomAim){ G.atomAim=null; toast(T('uzAtomMegszakitva')); }
  else if(G.place||G.wallDrag){ G.place=null; G.wallDrag=null; toast(T('uzEpitesMegszakitva')); }
  else if(G.sel.length||G.selBuild){ G.sel=[]; G.selBuild=null; }
  else return false;
  SFX.play('click');
  G.btnSig=''; syncUI();
  return true;
}
/* --- KIK ÉPÍTIK FEL? ---
   A VILÁGBÓL választjuk ki őket, nem a kijelölésből: az alapokhoz
   legközelebb álló, épp nem építkező munkások indulnak oda.

   Miért? Mert a kijelölés a KÉPERNYŐ állapota, és minden gépen más.
   Amíg innen jöttek az építők, a parancs végrehajtásakor nálad két
   munkás indult el, a társadnál egy sem — az egységek helyzete azonnal
   eltért, és a világok szétcsúsztak. A hiba csak akkor jött elő, ha
   valaki tényleg épített, ezért kerülte el a korábbi próbákat.

   Egyenlő távolságnál az AZONOSÍTÓ dönt, hogy a sorrend minden gépen
   ugyanaz legyen. */
function epitokValaszt(fel, alap, db){
  if(!alap) return [];
  const jeloltek=G.units.filter(u=>!u.dead&&u.role==='worker'&&u.owner===fel
    &&!(u.order&&u.order.type==='repair'));
  jeloltek.sort((a,b)=>{
    const da=(a.x-alap.x)**2+(a.y-alap.y)**2, db2=(b.x-alap.x)**2+(b.y-alap.y)**2;
    return (da-db2)||(a.id-b.id);
  });
  return jeloltek.slice(0, db||2);
}
function placeBuilding(gx,gy,keep,epitok){
  /* A KIJELÖLT MUNKÁSOK azonosítóit is elküldjük. Enélkül a parancs a
     fogadó gép HELYI kijelöléséből válogatta volna a építőket — az pedig
     minden gépen más. A munkások máshol kaptak parancsot, és a világok
     azonnal szétváltak.

     Ez a hiba csak akkor jött elő, ha valaki tényleg épített: a
     mozgásparancsok már eddig is vitték az azonosítókat, ezért a
     korábbi próbák nem fogták meg. */
  if(typeof logAdd==='function'&&G.place
     &&logAdd('build', gx, gy, G.place, !!keep, selIdk())){
    if(!keep) G.place=null;                    // az építési árnyék eltűnik
    syncUI(); return;
  }
  if(pausedBlock()) return;
  const type=G.place, d=BUILDS[type], c=buildCost(type,G.age,ENID);
  if(d.minAge!==undefined&&G.age<d.minAge){
    toast(d.names[d.minAge]+' csak a '+AGES[d.minAge].name+'ban építhető.');
    SFX.play('deny'); G.place=null; syncUI(); return;
  }
  if(d.maxCount!==undefined){
    // Épülőfélben lévőket is számoljuk, különben tízen felül is elkezdődne
    let n=0;
    for(const b of G.builds) if(!b.dead&&b.owner===ENID&&b.type===type) n++;
    if(n>=d.maxCount){
      toast(T('uzLegfeljebb')+' '+d.maxCount+' '+d.names[G.age].toLowerCase()+' '+T('uzLehetEgyszerre'));
      SFX.play('deny'); return;
    }
  }
  if(!canPay(c)){toast(T('uzNincsAnyagKettospont')+'.');SFX.play('deny');G.place=null;syncUI();return;}
  if(!freeSpot(gx,gy,d.w,d.h,padFor(type))){toast(T('uzFoglalt'));SFX.play('deny');return;}
  const rng=inBuildRange(gx,gy,ENID,type);
  if(!rng.ok){toast(rng.why);SFX.play('deny');return;}
  if(d.shore&&!isShore(gx,gy)){
    toast(T('uzKikotoPart')); SFX.play('deny'); return;
  }
  pay(c); SFX.at('place',gx,gy,1);
  const nb=makeBuild(type,ENID,gx,gy,G.age,false);
  G.builds.push(nb); G.navVer++;
  /* Az építők a VILÁGBÓL jönnek (lásd epitokValaszt), nem a
     kijelölésből. Ha a parancs mégis hozott azonosítókat, azok az
     erősebbek — de a döntés már nem múlik a képernyő állapotán. */
  const crew=(epitok&&epitok.length)
    ? epitok.filter(u=>u&&!u.dead&&u.role==='worker'&&u.owner===ENID)
    : epitokValaszt(ENID, nb, 2);
  for(const u of crew){ u.order={type:'repair',target:nb}; u.target=null; }
  if(G.pirate) toast(T('uzPartraSzall')+': '+d.names[G.age]);
  else if(crew.length) toast(crew.length+' munkás nekilát: '+d.names[G.age]);
  else toast(T('uzAlapokKijelolve'));
  if(!keep) G.place=null;
  syncUI();
}
function train(role,count){
  if(typeof logAdd==='function'&&G.selBuild&&logAdd('train', G.selBuild.id, role, count)) return;
  if(pausedBlock()) return;
  count=Math.max(1,count||1);
  let made=0, stop='';
  for(let i=0;i<count;i++){
    const r=trainOne(role);
    if(r===true) made++; else { stop=r; break; }
  }
  if(made){
    SFX.play('click');
    if(count>1) toast(made+'× '+UNITS[role].names[G.age]+' a kiképzési sorban.');
  }
  if(stop){ toast(stop); SFX.play('deny'); }
  syncUI();
}
// Egyetlen egység sorba állítása. true = sikerült, egyébként a hiba oka.
function trainOne(role){
  const d=UNITS[role], c=unitCost(role,G.age,ENID);
  const queued=G.builds.reduce((n,b)=>n+(b.owner===ENID&&!b.dead?b.queue.length:0),0);
  // Hősből egyszerre csak egy vezetheti a sereget
  if(role==='hero'){
    if(typeof heroAlive==='function'&&heroAlive(ENID)) return T('uzEgyHos');
    const sorban=G.builds.some(b=>b.owner===ENID&&!b.dead&&b.queue.some(q=>q.role==='hero'));
    if(sorban) return T('uzHosUton');
  }
  if(popOf(0)+queued>=popCap()) return T('uzKeret');
  if(!canPay(c)) return 'Nincs elég nyersanyag: '+costText(c);
  // Ha a kijelölt épület tudja képezni, ott képezzük; különben a legrövidebb sorú alkalmasnál.
  let b=null;
  if(G.selBuild&&G.selBuild.owner===ENID&&G.selBuild.done&&(trainsOf(G.selBuild)||[]).includes(role)) b=G.selBuild;
  if(!b){
    const cand=G.builds.filter(x=>x.owner===ENID&&!x.dead&&x.done&&(trainsOf(x)||[]).includes(role));
    cand.sort((p,q)=>p.queue.length-q.queue.length);
    b=cand[0];
  }
  if(!b) return role==='worker'?T('uzEpitsHq'):T('uzEpitsKaszarnya');
  if(d.minAge!==undefined&&G.age<d.minAge){
    toast(d.names[d.minAge]+' csak a '+AGES[d.minAge].name+'ban képezhető.'); SFX.play('deny'); return;
  }
  // Kalózvilágban kétszer gyorsabb a kiképzés is
  const kalozGyors=G.pirate?0.5:1;
  pay(c); b.queue.push({role,t:d.time*PACE.train*doctMul(0,'trainTime')/upgMul(0,'drill')*kalozGyors});
  return true;
}
function selectAt(wx,wy,add){
  const e=entAt(wx,wy);
  if(!add){G.sel=[];G.selBuild=null;}
  if(e&&e.kind==='unit'&&e.owner===ENID){ if(!G.sel.includes(e)) G.sel.push(e); }
  else if(e&&e.kind==='build'&&e.owner===ENID){ G.selBuild=e; G.sel=[]; demoArmed=null; }
  if(G.sel.length||G.selBuild) SFX.play('select',0.9);
  syncUI();
}
function boxSelect(x1,y1,x2,y2,add){
  const z=G.zoom;
  const a={x:Math.min(x1,x2)/z+G.cam.x,y:Math.min(y1,y2)/z+G.cam.y,
           X:Math.max(x1,x2)/z+G.cam.x,Y:Math.max(y1,y2)/z+G.cam.y};
  if(!add){G.sel=[];G.selBuild=null;}
  for(const u of G.units){
    if(u.dead||u.owner!==ENID) continue;
    if(u.x>a.x&&u.x<a.X&&u.y>a.y&&u.y<a.Y&&!G.sel.includes(u)) G.sel.push(u);
  }
  // Ha katona is van a kijelölésben, a munkásokat elhagyjuk (kényelmi szabály)
  if(G.sel.some(u=>u.role!=='worker')) G.sel=G.sel.filter(u=>u.role!=='worker');
  if(G.sel.length) SFX.play('select',0.9);
  syncUI();
}
/* A HAJÓK BIZTONSÁGOS TÁVOLSÁGA az idegen városoktól.

   Ha a kijelölésben van hajó, és a cél egy ellenséges kikötő közelébe
   esik, a célpontot kifelé toljuk a sortűz gyűrűjére. Így a flotta
   magától a helyes távolságban áll meg, és nem sétál bele a parti
   ütegek tüzébe.

   KIVÉTEL: ha a város már nyitva áll (nincs torony, elfogyott a
   lakosság), a hajó mehet a partig — ott már a kirakodás a feladat. */
function hajoCelIgazit(wx, wy){
  if(!G.pirate || typeof KIKOTOK === 'undefined') return null;
  if(!G.sel.some(u => !u.dead && u.naval)) return null;

  for(const v of KIKOTOK){
    const gazda = portOwner(v.kulcs);
    if(gazda === ENID) continue;                    // a sajátunkhoz mehetünk
    if(typeof varosNyitva === 'function' && varosNyitva(v.kulcs)) continue;

    const p = portPos(v.kulcs);
    const d = dist(wx, wy, p.x, p.y);
    const gyuru = (typeof OSTROM_TAV !== 'undefined' ? OSTROM_TAV : 300) - 20;
    if(d >= gyuru) continue;                        // már elég messze van

    /* Kifelé toljuk a célt a gyűrűre. Ha pontosan a városra kattintott,
       nincs irány — ilyenkor a flotta MAI helyzete adja meg, melyik
       oldalról érkezzen. */
    let dx = wx - p.x, dy = wy - p.y, h = Math.hypot(dx, dy);
    if(h < 1){
      const h0 = G.sel.filter(u => !u.dead && u.naval)[0];
      dx = (h0 ? h0.x : wx + 1) - p.x;
      dy = (h0 ? h0.y : wy) - p.y;
      h = Math.hypot(dx, dy) || 1;
    }
    return { x: p.x + dx / h * gyuru, y: p.y + dy / h * gyuru, varos: v.kulcs };
  }
  return null;
}

function command(wx,wy){
  if(typeof logAdd==='function'&&logAdd('cmd', selIdk(), wx, wy)) return;
  /* Csapatszállítás.
     - Saját csapatszállítóra kattintva a kijelölt szárazföldiek beszállnak.
     - Kijelölt, megrakott szállítóval a partra kattintva kirakodik. */
  {
    const cel=entAt(wx,wy);
    // Álruhás kémmel ellenséges épületre kattintva gyújtogatás
    if(typeof arsonCommand==='function'&&cel&&cel.kind==='build'&&cel.owner!==ENID
       &&G.sel.some(u=>typeof canSpy==='function'&&canSpy(u)&&u.disguise)){
      if(arsonCommand(cel)) return;
    }
    // Kalózmódban a megtört ellenséges hajóra kattintva elfoglalást parancsolsz
    if(typeof pirateMode==='function'&&pirateMode()&&cel&&cel.naval&&cel.owner!==ENID&&!cel.dead){
      const hajoim=G.sel.filter(u=>u.naval&&!u.dead);
      if(hajoim.length){
        for(const h of hajoim){ h.order={type:'attack',target:cel}; h.target=cel; }
        toast(cel.hp<=cel.maxHp*BOARD_HP
          ? T('uzAtszallas')
          : T('uzTorjMeg'));
        SFX.play('clang',0.9);
        return;
      }
    }
    if(cel&&(cel.transport||cel.sTower)&&cel.owner===ENID&&!cel.dead&&G.sel.length
       &&G.sel.some(u=>!u.naval&&!u.air&&!u.transport&&!u.sTower)){
      if(boardCommand(cel,G.sel)){ G.fx.push({x:cel.x,y:cel.y,t:0,life:.35,type:'hit'}); return; }
    }
    const szallitok=G.sel.filter(u=>(u.transport||u.sTower)&&!u.dead&&u.cargo&&u.cargo.length);
    /* A LEGÉNYSÉG is partra szállhat: a hadihajó és a gálya matrózaiból
       kiteszünk néhányat. Enélkül a városfoglaláshoz kötelező volt a
       szlúp — aki hadihajóval ment oda, annak semmi nem történt. */
    const legenyseg=G.sel.filter(u=>u.naval&&!u.transport&&!u.sTower&&!u.dead
      &&(u.crew||0)>20);
    if(!szallitok.length&&legenyseg.length&&onLand(wx,wy)
       &&typeof legenysegPartra==='function'){
      let ossz=0;
      for(const h of legenyseg) ossz+=legenysegPartra(h,wx,wy);
      if(ossz){
        G.fx.push({x:wx,y:wy,t:0,life:.35,type:'hit'});
        SFX.play('move',0.8);
        return;
      }
    }
    if(szallitok.length&&onLand(wx,wy)){
      for(const h of szallitok){ h.target=null; h.order={type:'unload',x:wx,y:wy}; }
      toast(T('uzKirakodas'));
      G.fx.push({x:wx,y:wy,t:0,life:.35,type:'hit'});
      SFX.play('move',0.8);
      return;
    }
  }
  /* A flotta megáll a sortűz gyűrűjén — lásd `hajoCelIgazit`. Ez a
     mozgásparancs ELŐTT fut, tehát minden későbbi számítás a helyes
     célponttal dolgozik. */
  {
    const igazitott = hajoCelIgazit(wx, wy);
    if(igazitott){
      wx = igazitott.x; wy = igazitott.y;
      if(ENID === ((typeof helyiFel === 'function') ? helyiFel() : 0))
        toast(T('uzSortuzTav'));
    }
  }
  if(G.atomAim){ fireAtom(wx,wy); return; }        // atomcsapás célzása
  if(pausedBlock()) return;
  // Épület kijelölve: gyülekezőpont állítása
  if(G.selBuild&&!G.sel.length){
    if(BUILDS[G.selBuild.type].trains){
      const t=entAt(wx,wy);
      G.selBuild.rally={x:wx,y:wy,
        node:(t&&t.kind==='node')?t:null,
        foe:(t&&t.kind!=='node'&&ellenseg(G.enId||0,t.owner))?t:null};
      toast(G.selBuild.rally.node?T('uzGyulekezoMunkas')
           :(G.selBuild.rally.foe?T('uzGyulekezoKatona')
           :T('uzGyulekezo')));
      SFX.play('click');
    }
    return;
  }
  if(!G.sel.length) return;
  const tgt=entAt(wx,wy);
  // Csatarend: a pikások és a lovagok az első sorba, a lövészek mögéjük,
  // a munkások leghátra. A vonal mindig a menetirányra merőleges.
  // A csatarend sorai. Ami nincs felsorolva — pap, halász, hadihajó,
  // repülőgép —, az a középső sorba kerül. Enélkül a sorszám NaN lett, a
  // parancs célpontja is NaN, és az egység a semmibe tűnt.
  const RANK={spear:0,melee:0,ranged:1,worker:2};
  const rankOf=u=>{ const r=RANK[u.role]; return (r===undefined)?1:r; };
  const list=G.sel.slice().sort((a,b)=>rankOf(a)-rankOf(b));
  let cx=0,cy=0; for(const u of list){cx+=u.x;cy+=u.y;}
  cx/=list.length; cy/=list.length;
  const ang=datan2(wy-cy,wx-cx);
  const fx=dcos(ang), fy=dsin(ang), px=-fy, py=fx;
  // Az oszlopok száma a csapat MÉRETÉHEZ igazodik. Fixen négy oszloppal
  // egyetlen egység is 39 pixerrel oldalra került a megjelölt ponttól.
  const cols=Math.max(1,Math.min(6,Math.round(Math.sqrt(list.length*1.7))));
  const idx=[0,0,0];
  /* A csatarend hátsó sorai eddig FIXEN hátrébb kerültek a megjelölt
     ponttól: egy jobbágy 81 pixerrel a koppintás mögött állt meg, egy
     lövész 40-nel. Egyetlen egységnél ez úgy nézett ki, mintha nem oda
     menne, ahová kattintasz.
     Most a sorokat a megjelölt pont KÖRÉ rendezzük: kiszámoljuk az átlagos
     hátratolást, és azt levonjuk. Egy egység így pontosan a kattintás
     helyére megy, a csapat pedig szimmetrikusan áll fel köré. */
  const n=list.length;
  /* Az átlagot UGYANAZZAL a képlettel számoljuk, amivel az egységeket
     elhelyezzük — különben az alakzat elcsúszna a koppintástól. */
  function helyKiszamit(r,k,alak){
    let row,col;
    if(alak==='wedge'){
      const sor=Math.floor((Math.sqrt(8*k+1)-1)/2);
      row=sor; col=(k-sor*(sor+1)/2)-sor/2;
    }else if(alak==='square'){
      const oldal=Math.max(1,Math.round(Math.sqrt(n)));
      row=Math.floor(k/oldal); col=(k%oldal)-(oldal-1)/2;
    }else{
      const szeles=Math.max(1,Math.ceil(n/2));
      row=Math.floor(k/szeles); col=(k%szeles)-(szeles-1)/2;
    }
    const melyseg=(alak==='wedge')?24:(alak==='square'?23:30);
    const szelesseg=(alak==='wedge')?26:(alak==='square'?23:30);
    const rangSor=(alak==='wedge')?(r===1?0:r*0.7):r*1.5;
    return {back:(rangSor+row)*melyseg, side:col*szelesseg};
  }
  let backSum=0, sideSum=0;
  {
    const p=[0,0,0,0];
    const alak=G.formation||'line';
    for(const u of list){
      const r=rankOf(u), k=p[r]++;
      const h=helyKiszamit(r,k,alak);
      backSum+=h.back; sideSum+=h.side;
    }
  }
  const backAvg=backSum/list.length, sideAvg=sideSum/list.length;
  list.forEach(u=>{
    u.target=null;
    if(u.role==='priest'&&convertible(tgt)&&tgt.owner!==ENID){
      u.order={type:'convert',target:tgt}; u.chan=0;
    }else if(tgt&&tgt.kind==='build'&&tgt.owner===ENID&&u.role==='worker'
       &&(tgt.hp<tgt.maxHp-1||!tgt.done)){              // saját sérült épület: javítás
      u.order={type:'repair',target:tgt};
    }else if(tgt&&tgt.kind!=='node'&&ellenseg(G.enId||0,tgt.owner)){    // ellenség: támadás
      u.order={type:'attack',target:tgt}; u.target=tgt;
    }else if(tgt&&tgt.kind==='node'&&tgt.type==='fish'&&u.role==='fisher'){
      u.order={type:'gather',res:'fish',target:tgt};   // halászat
    }else if(tgt&&tgt.kind==='node'&&tgt.type!=='fish'&&u.role==='worker'){
      u.order={type:'gather',res:tgt.type,target:tgt};
    }else{                                               // csatarendbe fejlődés
      /* Csatarendbe fejlődés a választott alakzat szerint.
         VONAL    — széles, sekély tűzvonal: mindenki egy-két sorban
         ÉK       — hegyes ék, elöl a közelharcosok: áttöri a vonalat
         NÉGYSZÖG — tömör kocka, kívül a pikásokkal: lovasság ellen véd */
      const r=rankOf(u), k=idx[r]++;
      const h=helyKiszamit(r,k,G.formation||'line');
      const off=h.back-backAvg, side=h.side-sideAvg;   // a pont köré, nem mögé
      /* Menetparancs. Korábban ez rohamparancs volt: a katona útközben
         célpontot fogott, és üldözni kezdte — így nem lehetett sem
         visszahívni, sem irányt váltani vele.
         Most a kijelölt helyre megy. Ha harcolni akarsz vele, kattints
         jobb gombbal magára az ellenségre. */
      u.target=null;
      u.order={type:'move',x:wx+px*side-fx*off, y:wy+py*side-fy*off};
    }
  });
  G.fx.push({x:wx,y:wy,t:0,life:.35,type:'hit'});
  if(tgt&&tgt.kind==='build'&&tgt.owner===ENID&&(tgt.hp<tgt.maxHp-1||!tgt.done)
     &&G.sel.some(u=>u.role==='worker')){
    SFX.play('place',0.7);
    toast(tgt.done?T('uzJavitjak')+': '+BUILDS[tgt.type].names[tgt.age]
                  :T('uzSegitenek'));
  }else SFX.play(tgt&&tgt.kind!=='node'&&tgt.owner!==ENID?'clang':'move',0.8);
}
