/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   21/C. BILLENTYŰZETES IRÁNYÍTÁS

   Egérrel játszható játék helyett billentyűzettel is végigvihető: a "C"
   bekapcsol egy világkurzort, amit a nyilakkal mozgatunk. A szóköz kijelöl,
   az Enter parancsot ad — vagyis pontosan azt, amit a bal és a jobb gomb.
   A Tab a jellemző csoportok között lépked, a pont a következő tétlen
   munkásra ugrik.
   ===================================================================== */
function kbToggle(){
  G.kb.on=!G.kb.on;
  if(G.kb.on){
    G.kb.x=G.cam.x+G.vw/2; G.kb.y=G.cam.y+G.vh/2;
    announce(T('uzBillKurzorBe'));
  }else announce(T('uzKurzorKi'));
  toast(G.kb.on?T('uzBillKurzorBe'):T('uzBillKurzorKi'));
  SFX.play('click');
}
function kbMove(dt){
  if(!G.kb.on) return;
  const k=G.keys, sp=(k['shift']?620:300)*dt;
  let dx=0,dy=0;
  if(k['arrowleft'])dx-=1; if(k['arrowright'])dx+=1;
  if(k['arrowup'])dy-=1; if(k['arrowdown'])dy+=1;
  if(!dx&&!dy) return;
  const n=Math.hypot(dx,dy)||1;
  G.kb.x=clamp(G.kb.x+dx/n*sp,0,WORLD.w); G.kb.y=clamp(G.kb.y+dy/n*sp,0,WORLD.h);
  // a kamera kövesse a kurzort, ha a szélére ér
  const m=110;
  if(G.kb.x-G.cam.x<m) G.cam.x=G.kb.x-m;
  if(G.kb.x-G.cam.x>G.vw-m) G.cam.x=G.kb.x-G.vw+m;
  if(G.kb.y-G.cam.y<m) G.cam.y=G.kb.y-m;
  if(G.kb.y-G.cam.y>G.vh-m) G.cam.y=G.kb.y-G.vh+m;
  clampCam();
  G.mouse.wx=G.kb.x; G.mouse.wy=G.kb.y;      // az építési szellemkép is ide kerül
}
function drawKbCursor(){
  if(!G.kb.on) return;
  const x=G.kb.x-G.cam.x, y=G.kb.y-G.cam.y, t=(Math.sin(G.t*5)+1)*0.5;
  ctx.strokeStyle='rgba(255,245,200,'+(0.55+t*0.4)+')'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(x,y,13,0,TAU); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x-20,y); ctx.lineTo(x-6,y); ctx.moveTo(x+6,y); ctx.lineTo(x+20,y);
  ctx.moveTo(x,y-20); ctx.lineTo(x,y-6); ctx.moveTo(x,y+6); ctx.lineTo(x,y+20);
  ctx.stroke();
}
// Tab: sorra veszi a jellemző kijelöléseket
const KB_GROUPS=['army','workers','idle','buildings'];
function kbCycle(){
  G.kb.grp=(G.kb.grp+1)%KB_GROUPS.length;
  const g=KB_GROUPS[G.kb.grp];
  if(g==='army') selectArmy();
  else if(g==='workers') selectWorkers();
  else if(g==='idle'){
    const idle=G.units.filter(u=>!u.dead&&u.owner===ENID&&u.role==='worker'&&!u.order);
    G.sel=idle; G.selBuild=null;
    announce(idle.length?idle.length+' '+T('uzTetlenKijelolve'):T('uzTetlenNincs'));
    toast(idle.length?idle.length+' '+T('uzTetlenKijelolve'):T('uzTetlenNincs'));
    SFX.play(idle.length?'select':'deny'); syncUI();
  }else{
    const bs=G.builds.filter(b=>!b.dead&&b.owner===ENID&&BUILDS[b.type].trains);
    if(!bs.length){SFX.play('deny');return;}
    G.kb.bi=(G.kb.bi+1)%bs.length;
    const b=bs[G.kb.bi];
    G.selBuild=b; G.sel=[];
    G.cam.x=b.x-G.vw/2; G.cam.y=b.y-G.vh/2; clampCam();
    announce(BUILDS[b.type].names[b.age]+' kijelölve');
    SFX.play('select'); syncUI();
  }
}
// Pont billentyű: ugrás a következő tétlen munkásra
function kbNextIdle(){
  const idle=G.units.filter(u=>!u.dead&&u.owner===ENID&&u.role==='worker'&&!u.order);
  if(!idle.length){ toast(T('uzTetlenNincs')); announce(T('uzTetlenNincs')); SFX.play('deny'); return; }
  G.kb.wi=(G.kb.wi+1)%idle.length;
  const u=idle[G.kb.wi];
  G.sel=[u]; G.selBuild=null;
  G.cam.x=u.x-G.vw/2; G.cam.y=u.y-G.vh/2; clampCam();
  if(G.kb.on){G.kb.x=u.x;G.kb.y=u.y;}
  announce(idle.length+' '+T('uzTetlenKijelolve'));
  SFX.play('select'); syncUI();
}
// Képernyőolvasónak szánt üzenetek
function announce(msg){
  const el=$('live'); if(el) el.textContent=msg;
}

/* ---------- Vezérlőcsoportok ---------- */
function assignGroup(n){
  if(!G.sel.length){ toast(T('uzJeloljKi')); SFX.play('deny'); return; }
  G.groups[n]=G.sel.slice();
  toast(n+'. '+T('uzCsoportLetre')+': '+G.sel.length+' '+T('uzEgyseg'));
  announce(n+'. '+T('uzCsoportLetre')+', '+G.sel.length+' '+T('uzEgyseg'));
  SFX.play('click');
}
function recallGroup(n){
  const g=(G.groups[n]||[]).filter(u=>!u.dead);
  G.groups[n]=g;
  if(!g.length){ toast(n+'. '+T('uzCsoportUres')); SFX.play('deny'); return; }
  G.sel=g.slice(); G.selBuild=null;
  // ugyanaz a csoport másodszor egy másodpercen belül: a kamera odaugrik
  if(G.lastGrp.n===n&&G.t-G.lastGrp.t<1){
    let cx=0,cy=0; for(const u of g){cx+=u.x;cy+=u.y;}
    G.cam.x=cx/g.length-G.vw/2; G.cam.y=cy/g.length-G.vh/2; clampCam();
  }
  G.lastGrp={n,t:G.t};
  announce(n+'. '+T('uzCsoportKijelolve')+', '+g.length+' '+T('uzEgyseg'));
  SFX.play('select'); syncUI();
}

/* ---------- Gyorsgombok (érintésre és egérre egyaránt) ---------- */
function centerOnHQ(){
  const hq=G.builds.find(b=>b.owner===ENID&&b.type==='hq'&&!b.dead)||G.builds.find(b=>b.owner===ENID&&!b.dead);
  if(hq){G.cam.x=hq.x-G.vw/2;G.cam.y=hq.y-G.vh/2;clampCam();SFX.play('click');}
}
function selectArmy(){
  G.sel=G.units.filter(u=>!u.dead&&u.owner===ENID&&u.role!=='worker');
  G.selBuild=null;
  if(G.sel.length){SFX.play('select');toast(G.sel.length+' '+T('uzKatonaKijelolve'));}
  else {SFX.play('deny');toast(T('uzNincsKatona'));}
  syncUI();
}
function selectWorkers(){
  G.sel=G.units.filter(u=>!u.dead&&u.owner===ENID&&u.role==='worker');
  G.selBuild=null;
  if(G.sel.length){SFX.play('select');toast(G.sel.length+' '+T('uzMunkasKijelolve'));}
  else SFX.play('deny');
  syncUI();
}
function stopAll(){
  for(const u of G.sel){u.order=null;u.target=null;}
  G.place=null; SFX.play('click'); syncUI();
}
$('btnBase').onclick=centerOnHQ;
$('btnArmy').onclick=selectArmy;
$('btnWork').onclick=selectWorkers;
$('btnStop').onclick=stopAll;
if($('btnRevive')) $('btnRevive').onclick=()=>reviveHero();
/* A frissítésfigyelő bezárása. Az ablakon kívülre kattintva is záródik —
   az X mellett ez a megszokott. */
if($('patchX')) $('patchX').onclick=()=>{ if(typeof patchZar==='function') patchZar(); };
if($('patchBox')) $('patchBox').onclick=(e)=>{
  if(e.target&&e.target.id==='patchBox'&&typeof patchZar==='function') patchZar();
};
/* A hős aktív képessége. Billentyűvel is elérhető: csata közben a
   gombig elvinni az egeret drága másodperceket jelentene. */
if($('btnKialtas')) $('btnKialtas').onclick=()=>{ if(typeof kialtas==='function') kialtas(); };
if($('offerYes')) $('offerYes').onclick=()=>acceptOffer();
if($('offerNo'))  $('offerNo').onclick =()=>declineOffer();
if($('tutorSkip')) $('tutorSkip').onclick=()=>tutorEnd();
if($('btnSpy')) $('btnSpy').onclick=()=>toggleDisguise();
if($('ptZar')) $('ptZar').onclick=()=>{
  PT_ZART=!PT_ZART; ptSig=''; SFX.init(); SFX.play('click');
  if(typeof pontTablaFrissit==='function') pontTablaFrissit();
};
if($('varosFoglal')) $('varosFoglal').onclick=()=>{
  if(G.varosDontes){ SFX.init(); varosFoglal(G.varosDontes); }
};
if($('varosFoszt')) $('varosFoszt').onclick=()=>{
  if(G.varosDontes){ SFX.init(); varosKifoszt(G.varosDontes); }
};
if($('phSave')) $('phSave').onclick=()=>photoSave();
if($('phExit')) $('phExit').onclick=()=>photoMode(false);
if($('fmLine'))   $('fmLine').onclick  =()=>setFormation('line');
if($('fmWedge'))  $('fmWedge').onclick =()=>setFormation('wedge');
if($('fmSquare')) $('fmSquare').onclick=()=>setFormation('square');
if($('stAggro')) $('stAggro').onclick=()=>setStance('aggro');
if($('stHold'))  $('stHold').onclick =()=>setStance('hold');
if($('stFlee'))  $('stFlee').onclick =()=>setStance('flee');
// S: azonnali megállás — az üldözést is megszakítja
// Küldetés előtti eligazítás: a szöveg a választott nemzet uralkodójára szabva
function showBriefing(i){
  const m=CAMPAIGN[i], n=NATIONS[G.nation];
  $('briefNum').textContent=(i+1)+'. '+T('uzKuldetes')+' — '+allamForma(G.campNation||G.nation,m.age)+', '+korszakNev(m.age);
  $('briefName').textContent=kuldNev(m.name);
  $('briefText').textContent=kuldBrief(m.brief)+' '+uralkodoNev(G.campNation||G.nation,m.age)+' '+T('uzRadBizza');
  $('briefObj').textContent=objectiveText();
  $('brief').style.display='flex';
  togglePause(true);
}
$('briefGo').onclick=()=>{ $('brief').style.display='none'; openDoctrine(G.age); };

/* ---------- Ideológiaválasztás ---------- */
function openDoctrine(age){
  // A legkorábbi még el nem döntött korszakot kínáljuk fel; ha egy küldetés
  // a 19. században indul, akkor sorban mind a három korábbi irányt kiválasztod.
  let a=-1;
  for(let i=0;i<=Math.min(age,doctSet(ENID).length-1);i++) if(!G.doct[i]){ a=i; break; }
  if(a<0){ togglePause(false); cv.focus&&cv.focus({preventScroll:true}); return; }
  age=a;
  $('doctEra').textContent=korszakNev(age)+' — '+korszakAlcim(age);
  const list=$('doctList'); list.innerHTML='';
  doctSet(ENID)[age].forEach(d=>{
    const b=document.createElement('button');
    b.className='doc';
    b.innerHTML='<div class="dn">'+doktNev(d.key,d.name)+'</div>'
              +'<div class="dd">'+doktLeiras(d.key,d.desc)+'</div>';
    b.onclick=()=>chooseDoctrine(age,d.key);
    list.appendChild(b);
  });
  $('doct').style.display='flex';
  /* Hálózati játszmában NEM állítjuk meg az időt: a szünet csak a saját
     gépeden állítaná meg a szimulációt, ezzel viszont elakadna a
     lépészár, és a TÁRSAID is megállnának, amíg te választgatsz. */
  if(!(G.net&&G.net.allapot==='jatek')) togglePause(true);
  announce(T('uzValasszIdeologiat')+': '+doctSet(ENID)[age].map(d=>doktNev(d.key,d.name)).join(', '));
}
/* Az ideológiaválasztás a SZIMULÁCIÓT módosítja: egységek erejét,
   költségeket, seregkeretet. Ezért hálózati játszmában át KELL mennie a
   társakhoz, különben a világok azonnal szétcsúsznak — nálad más lenne a
   lovasság ereje, mint nála.

   A `netParancs` a szokásos úton ütemezi: minden gépen ugyanannál a
   lépésnél fut le. Ha nincs hálózat, azonnal végrehajtódik. */
function chooseDoctrine(age,key){
  if(typeof netParancs==='function' && netParancs('doct',[ENID,age,key])) {
    /* A képernyőt már most lezárjuk, hogy ne kelljen a hat lépésre várni
       — a hatás úgyis a parancs lefutásakor áll be. */
    $('doct').style.display='none';
    resize(); centerOnBase();
    return;
  }
  doctAlkalmaz(ENID,age,key);
  doctUtan(age,key);
}
/* A tényleges hatás. Ez fut le a hálózati parancsból is, MINDEN gépen. */
function doctAlkalmaz(fel,age,key){
  /* A FELADÓ birodalmára hat, akárkit is írt a parancsba. A `fel`
     paraméter csak visszafelé kompatibilitásból marad itt: egy módosított
     kliens különben a TE ideológiádat írhatta volna át. */
  fel=ENID;
  const o=(typeof oldal==='function')?oldal(fel):null;
  if(o){ o.doct[age]=key; } else { G.doct[age]=key; }
  for(const u of G.units) if(!u.dead&&u.owner===fel) recomputeUnit(u);
  if(typeof syncUI==='function'){ G.btnSig=''; syncUI(); }
}
if(typeof parancsRegiszter==='function') parancsRegiszter('doct', doctAlkalmaz);

/* A helyi visszajelzés: üzenet, hang, a képernyő bezárása. Csak annál a
   játékosnál fut le, aki választott. */
function doctUtan(age,key){
  const d=doctSet(ENID)[age].filter(x=>x.key===key)[0];
  if(d) toast(T('uzIdeologia')+': '+doktNev(d.key,d.name)+' — '+doktLeiras(d.key,d.desc));
  SFX.play('ready'); G.btnSig=''; syncUI();
  $('doct').style.display='none';
  resize(); centerOnBase();
  openDoctrine(G.age);                       // ha maradt korábbi döntés, az jön most
}
/* ---------- Lenyíló főmenü ---------- */
function menuOpen(v){
  // A változatszám a szünet menüben is látszik — egy képernyőképről
  // azonnal megmondható, melyik build fut.
  const mv=$('miVer');
  if(mv&&typeof GAME_VERSION!=='undefined') mv.textContent='Birodalom v'+GAME_VERSION;
  if(typeof menuBgStart==='function') menuBgStart();   // a háttér mozgása újraindul
  const d=$('dropMenu');
  const show=(v===undefined)?!d.classList.contains('on'):v;
  d.classList.toggle('on',show);
  $('btnMenu').setAttribute('aria-expanded',show?'true':'false');
  if(show){ $('cbState').textContent=G.cb?T('be'):T('ki'); $('sfxState').textContent=SFX.on?T('be'):T('ki');
            const ms=$('musState'); if(ms) ms.textContent=MUSIC.status;
            $('miExit').textContent=T('foMenube'); exitArmed=false; }
}
let exitArmed=false;
function exitToMenu(){
  if(!exitArmed){
    exitArmed=true;
    $('miExit').textContent=T('kilepesBiztos');
    SFX.play('deny');
    return;
  }
  exitArmed=false; menuOpen(false);
  /* A hálózati kapcsolat is lezárul: enélkül a társ a semmire várna,
     és a szoba nyitva maradna a szerveren. */
  if(typeof netZar==='function') netZar();
  G.on=false; G.over=false; G.paused=false;
  $('pauseTag').style.display='none';
  $('over').style.display='none';
  $('brief').style.display='none';
  $('menu').style.display='flex'; if(typeof langBoxShow==='function') langBoxShow(true);
  menuPage('main');
  SFX.play('click');
}
$('rulerBox').onclick=()=>{ const e=$('bio'); if(e.style.display==='block') hideBio(); else showBio(); };
$('bioClose').onclick=(e)=>{ e.stopPropagation(); hideBio(); };
$('btnMenu').onclick=()=>{ SFX.init(); menuOpen(); SFX.play('click'); };
$('miQSave').onclick=()=>{ quickSave(); menuOpen(false); };
$('miQLoad').onclick=()=>{ quickLoad(); menuOpen(false); };
$('miSave').onclick=()=>{ quickSave(); menuOpen(false); };
$('miExport').onclick=()=>{ saveToFile(); menuOpen(false); };
$('miLoad').onclick=()=>{ $('loadFile').click(); menuOpen(false); };
$('miPause').onclick=()=>{ togglePause(); menuOpen(false); };
$('miKeys').onclick=()=>{ toggleHelp(true); menuOpen(false); };
$('miCB').onclick=()=>{ toggleColorblind(); $('cbState').textContent=G.cb?T('be'):T('ki'); };
$('cmdClose').onclick=(e)=>{ e.stopPropagation(); closeTop(); };
$('miMus').onclick=()=>{ SFX.init(); MUSIC.toggle(); };
$('miSfx').onclick=()=>{ SFX.init(); SFX.on=!SFX.on; $('sfxState').textContent=SFX.on?T('be'):T('ki');
                         if(SFX.on) SFX.play('click'); };
$('miExit').onclick=exitToMenu;
// A vásznon kattintva a menü becsukódik
cv.addEventListener('pointerdown',()=>{ menuOpen(false); hideBio(); });
$('loadFile').onchange=e=>{ if(e.target.files&&e.target.files[0]) loadFromFile(e.target.files[0]); e.target.value=''; };

$('keysClose').onclick=()=>toggleHelp(false);
function togglePause(force){
  /* Hálózati játszmában nincs szünet. A te megállásod az egész
     társaságot megállítaná, mert a lépészár rád várna — és a többiek nem
     tudnák, mi történt. */
  if(G.net&&G.net.allapot==='jatek'){
    if(force!==true) toast(T('netNincsSzunet'));
    return;
  }
  G.paused=(force===undefined)?!G.paused:force;
  $('pauseTag').style.display=G.paused?'block':'none';
  if(G.paused) announce(T('szunet')); else announce(T('mFolytatas'));
  SFX.play('click');
}
function toggleHelp(force){
  const el=$('keys');
  const show=(force===undefined)?el.style.display!=='flex':force;
  el.style.display=show?'flex':'none';
  if(show) announce(T('uzBillLista'));
  SFX.play('click');
}

