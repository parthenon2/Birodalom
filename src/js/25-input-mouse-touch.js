/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* A vászon megjelenített mérete eltérhet a játéktér méretétől: rögzített
   képméretnél (például 1920x1080 egy kisebb ablakban) kicsinyítve látszik,
   és középre igazítva, fekete kerettel. Az egér- és ujjkoordinátákat ezért
   át kell számolni, különben a kurzor elcsúszik a valódi helyétől. */
function vaszonPont(clientX,clientY){
  const r=cv.getBoundingClientRect();
  const sx=(r.width ?G.view.w/r.width :1);
  const sy=(r.height?G.view.h/r.height:1);
  return {x:(clientX-r.left)*sx, y:(clientY-r.top)*sy, r};
}
/* =======================================================================
   21. BEMENET
   ===================================================================== */
function toWorld(sx,sy){return {x:sx/G.zoom+G.cam.x,y:sy/G.zoom+G.cam.y};}
cv.addEventListener('mousedown',e=>{
  SFX.init();
  if(!G.on||G.over) return;
  const p=vaszonPont(e.clientX,e.clientY), r=p.r, mx=p.x, my=p.y;
  const w=toWorld(mx,my);
  if(e.button===0){
    /* Kalózvilágban a városnév a fogódzó: rákattintva sugárirányban
       kinyílnak a cselekvések. Máshova kattintva bezárul. */
    if(G.pirate&&typeof portHit==='function'&&!G.place){
      const v=portHit(w.x,w.y);
      if(v){ portOpen(v); return; }
      if(G.port) portClose();
    }
    if(G.place==='wall'){                    // falat húzva sorban rakhatsz
      G.wallDrag={x0:w.x,y0:w.y,x1:w.x,y1:w.y,shift:e.shiftKey};
      return;
    }
    if(G.place){ placeBuilding(snap(w.x,G.place),snap(w.y,G.place),e.shiftKey); return; }
    G.mouse.down=true; G.mouse.sx=mx; G.mouse.sy=my; G.mouse.dragging=false;
  }else if(e.button===2){
    if(G.place){G.place=null;syncUI();return;}
    command(w.x,w.y);
  }
});
cv.addEventListener('mousemove',e=>{
  // Valódi egérmozgás: van elmozdulás. Az iOS a koppintásra egyetlen,
  // elmozdulás nélküli eseményt küld — az nem számít.
  if(!G.isTouch&&(e.movementX||e.movementY)) G.mouseSeen=true;
  const p=vaszonPont(e.clientX,e.clientY);
  G.mouse.x=p.x; G.mouse.y=p.y;
  const w=toWorld(G.mouse.x,G.mouse.y); G.mouse.wx=w.x; G.mouse.wy=w.y;
  if(G.wallDrag){ G.wallDrag.x1=w.x; G.wallDrag.y1=w.y; }

  /* KARD-MUTATÓ ellenséges célpont fölött. Csak kalózvilágban van
     értelme: ellenséges város közelében VAGY ellenséges hajó fölött.
     A sugarat zoom-arányosan számítjuk: kis nagyításnál a város kis
     területen látszik, de a névtábla mérete alapján mégis könnyen
     célozható kell legyen — ~60 képernyő-pixel sugarú zónában. */
  if(G.pirate&&cv&&cv.classList){
    let tamad=false;
    const en=(typeof helyiFel==='function')?helyiFel():0;
    const z=G.zoom||1;
    const varosR=Math.max(90, 60/z);   // legalább 90 vh-px, de min. 60 képernyő-px
    const hajoR=Math.max(40, 36/z);
    // Ellenséges város (null = gazdátlan = nem a sajátunk → célpontnak számít)
    if(!tamad&&typeof KIKOTOK!=='undefined'){
      for(const v of KIKOTOK){
        const gazda=portOwner(v.kulcs);
        if(gazda===en) continue;        // csak a sajátot hagyjuk ki
        const pp=portPos(v.kulcs);
        if(Math.hypot(w.x-pp.x,w.y-pp.y)<varosR){ tamad=true; break; }
      }
    }
    // Ellenséges hajó
    if(!tamad&&G.units){
      for(const u of G.units){
        if(u.dead||!u.naval||u.owner===en) continue;
        if(Math.hypot(w.x-u.x,w.y-u.y)<Math.max(u.r*1.8, hajoR)){ tamad=true; break; }
      }
    }
    cv.classList.toggle('tamad',tamad);
  }else if(cv&&cv.classList&&cv.classList.contains('tamad')){
    cv.classList.remove('tamad');
  }
  if(G.mouse.down&&(Math.abs(G.mouse.x-G.mouse.sx)>5||Math.abs(G.mouse.y-G.mouse.sy)>5)) G.mouse.dragging=true;
});
addEventListener('mouseup',e=>{
  if(G.wallDrag){                            // a falsor lerakása
    const d=G.wallDrag; G.wallDrag=null;
    placeWallLine(d.x0,d.y0,d.x1,d.y1);
    if(!d.shift){ G.place=null; syncUI(); }
    return;
  }
  if(!G.mouse.down) return;
  G.mouse.down=false;
  const p=vaszonPont(e.clientX,e.clientY), r=p.r, mx=p.x, my=p.y;
  if(G.mouse.dragging) boxSelect(G.mouse.sx,G.mouse.sy,mx,my,e.shiftKey);
  else { const w=toWorld(mx,my); selectAt(w.x,w.y,e.shiftKey); }
  G.mouse.dragging=false;
});
cv.addEventListener('contextmenu',e=>e.preventDefault());

addEventListener('keydown',e=>{
  G.keys[e.key.toLowerCase()]=true;
  /* F11: teljes képernyő. A menüben is működik, ezért áll a G.on vizsgálat
     ELŐTT. Az asztali burok maga is elkapja, böngészőben viszont ez az
     egyetlen út — így mindkét helyen ugyanaz a billentyű. */
  if(e.key==='F11'&&typeof teljesKepernyoAllit==='function'){
    teljesKepernyoAllit(!teljesKepernyoAllapot());
    e.preventDefault(); return;
  }
  if(!G.on) return;
  const k=e.key.toLowerCase();
  /* A gyorsbillentyűk a KIOSZTÁSBÓL jönnek (26c-billentyuk.js), nem
     beégetve. A `bill` segéd megnézi, hogy a leütött billentyű az adott
     akcióhoz van-e rendelve. Ha a modul hiányoznék, az alapértékre
     esünk vissza — a játék így sem áll meg. */
  const bill=(akcio,alap)=>(typeof billE==='function')?billE(k,akcio):(k===alap);

  // Álruha fel/le a kijelölt felderítőkön
  if(bill('alca','á')&&!e.ctrlKey&&!e.metaKey&&G.sel.some(u=>typeof canSpy==='function'&&canSpy(u))){
    toggleDisguise(); e.preventDefault(); return;
  }
  // Fotómód be/ki — a felület eltűnik, a kép menthető
  if(bill('fotomod','f')&&!e.ctrlKey&&!e.metaKey&&!G.place){ photoMode(); e.preventDefault(); return; }
  if(k==='escape'&&G.port&&typeof portClose==='function'){ portClose(); return; }
  if(k==='escape'&&G.photo){ photoMode(false); return; }
  if(k==='escape'){G.place=null;G.sel=[];G.selBuild=null;syncUI();}
  // Azonnali megállás. Az üldözést is megszakítja — a katona ott marad,
  // ahol van, és nem fut tovább az ellenség után.
  if(bill('megall','s')&&!e.ctrlKey&&!e.metaKey&&G.sel.length){ stopAll(); e.preventDefault(); }
  // Harci állás és alakzat
  if(G.sel.some(u=>!u.dead&&u.role!=='worker')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.shiftKey){
    if(bill('alVonal','7')){ setFormation('line'); e.preventDefault(); }
    else if(bill('alEk','8')){ setFormation('wedge'); e.preventDefault(); }
    else if(bill('alNegyszog','9')){ setFormation('square'); e.preventDefault(); }
    else if(bill('allTamado','1')){ setStance('aggro'); e.preventDefault(); }
    else if(bill('allTartsd','2')){ setStance('hold'); e.preventDefault(); }
    else if(bill('allVissza','3')){ setStance('flee'); e.preventDefault(); }
  }
  /* Építés. A táblázatból derül ki, melyik billentyű melyik épület — így
     a nyolc sor egyetlen hurokba fér, és a kiosztás átírható. */
  if(typeof BILL_EPULET==='object'&&typeof billE==='function'){
    for(const akcio in BILL_EPULET) if(billE(k,akcio)) startPlacing(BILL_EPULET[akcio]);
  }else{
    if(k==='h')startPlacing('hq'); if(k==='k')startPlacing('barracks');
    if(k==='f')startPlacing('farm'); if(k==='t')startPlacing('tower');
    if(k==='v')startPlacing('wall'); if(k==='u')startPlacing('academy');
    if(k==='m')startPlacing('temple'); if(k==='y')startPlacing('harbor');
  }
  // A Ctrl+1..8 a böngészők fenntartott lapváltó gyorsbillentyűje, amit az oldal
  // nem tud elfogni — ezért a csoportok Shift (létrehozás) és Alt (előhívás)
  // kombinációra kerültek. A számot a fizikai billentyűből olvassuk ki, hogy
  // a Shift ne '!'-et adjon vissza.
  const digit=(e.code&&/^Digit[1-9]$/.test(e.code))?+e.code.slice(5)
             :((k>='1'&&k<='9')?+k:0);
  if(digit&&e.altKey){ recallGroup(digit); e.preventDefault(); }
  else if(digit&&e.shiftKey&&!e.ctrlKey&&!e.metaKey){ assignGroup(digit); e.preventDefault(); }
  else if(digit<=ROLES.length&&digit>=1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
    train(ROLES[digit-1],1);
  }
  if(bill('korszak','e'))advanceAge();
  if(bill('billKurzor','c')&&!e.ctrlKey&&!e.metaKey){ kbToggle(); e.preventDefault(); }
  if(k==='tab'){ kbCycle(); e.preventDefault(); }
  if(bill('tetlen','.')){ kbNextIdle(); e.preventDefault(); }
  if(k==='f1'||k==='?'){ toggleHelp(); e.preventDefault(); }
  if(k==='f5'){ quickSave(); e.preventDefault(); }
  if(k==='f9'){ quickLoad(); e.preventDefault(); }
  if(bill('szunet','p')){ togglePause(); }
  if(bill('zene','n')){ SFX.init(); const on=MUSIC.toggle(); toast(T('zene')+': '+(on?T('be'):T('ki'))); }
  if(bill('rombol','delete')||k==='backspace'){ demolish(); e.preventDefault(); }
  if(G.kb.on){
    if(k==='enter'){ command(G.kb.x,G.kb.y); e.preventDefault(); }
    if(k===' '){
      if(G.place) placeBuilding(snap(G.kb.x,G.place),snap(G.kb.y,G.place),e.shiftKey);
      else selectAt(G.kb.x,G.kb.y,e.shiftKey);
      e.preventDefault();
    }
    if(k.indexOf('arrow')===0) e.preventDefault();
  }
  if(k===' '){ // ugrás a főhadiszállásra
    const hq=G.builds.find(b=>b.owner===ENID&&b.type==='hq'&&!b.dead);
    if(hq){G.cam.x=hq.x-G.vw/2;G.cam.y=hq.y-G.vh/2;clampCam();}
    if(G.kb.on&&hq){G.kb.x=hq.x;G.kb.y=hq.y;}
    e.preventDefault();
  }
  if(k==='a'&&e.ctrlKey){ // minden katona kijelölése
    G.sel=G.units.filter(u=>!u.dead&&u.owner===ENID&&u.role!=='worker'); G.selBuild=null; syncUI(); e.preventDefault();
  }
});
addEventListener('keyup',e=>{G.keys[e.key.toLowerCase()]=false;});
$('ageBtn').onclick=()=>{SFX.play('click');advanceAge();};

/* ---------- Nagyítás egérgörgővel ---------- */
/* A görgetés kétféle eszközről érkezhet, és mást kíván:

     egérgörgő  -> nagyítás (nagy, ugrásszerű lépések, oldalirány nincs)
     trackpad   -> a kép mozgatása (finom, képpont alapú, oldalirány is van)
     csippentés -> nagyítás (a rendszer ctrl-lal jelöli)

   Eddig minden görgetés nagyított, ezért trackpaddel nem lehetett a
   térképen mozogni. A felismerés automatikus, de a beállításokban
   felülbírálható. */
let gorgSor=[];                                  // az utóbbi görgetések ideje
function gorgetesModja(e){
  if(G.scrollMode==='zoom') return 'zoom';
  if(G.scrollMode==='pan')  return 'pan';
  if(e.ctrlKey||e.metaKey) return 'zoom';        // csippentés a trackpaden
  if(e.deltaMode!==0) return 'zoom';             // soronkénti lépés: egérgörgő

  // Az egérgörgő egész értékű, nagy kattanásokat küld, ritkásan. A trackpad
  // sűrű sorozatot, gyakran tört értékkel és oldalirányú összetevővel.
  const most=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  gorgSor.push(most);
  while(gorgSor.length&&most-gorgSor[0]>220) gorgSor.shift();
  const sorozat=gorgSor.length>=4;               // sűrű sorozat: ujj a lapon

  if(Math.abs(e.deltaX)>0.01) return 'pan';      // oldalirány: biztosan trackpad
  if(e.deltaY%1!==0) return 'pan';               // tört érték: biztosan trackpad
  if(sorozat) return 'pan';                      // folyamatos húzás
  if(Math.abs(e.deltaY)<40) return 'pan';        // finom, apró lépés
  return 'zoom';
}
cv.addEventListener('wheel',e=>{
  if(!G.on) return;
  e.preventDefault();
  if(gorgetesModja(e)==='pan'){
    G.cam.x+=e.deltaX/G.zoom;
    G.cam.y+=e.deltaY/G.zoom;
    clampCam();
    return;
  }
  const p=vaszonPont(e.clientX,e.clientY), r=p.r, mx=p.x, my=p.y;
  const wx=mx/G.zoom+G.cam.x, wy=my/G.zoom+G.cam.y;
  const lep=(e.ctrlKey||e.metaKey)?(1-e.deltaY*0.01):(e.deltaY<0?1.12:0.89);
  // Kalózmódban a térkép a lényeg: sokkal messzebbre lehet kizoomolni
  const zMin=G.pirate?0.09:0.45;
  G.zoom=clamp(G.zoom*lep,zMin,2); G.zoomUser=true;
  updateView();
  G.cam.x=wx-mx/G.zoom; G.cam.y=wy-my/G.zoom;
  clampCam();
},{passive:false});

/* =======================================================================
   21/B. ÉRINTÉSVEZÉRLÉS

   Telefonon nincs jobb gomb, ezért a koppintás jelentése a helyzettől függ:
   saját egységre koppintva kijelöl, üres területre vagy ellenségre koppintva
   a kijelölt seregnek ad parancsot. Egy ujjal húzva a térkép mozog, hosszan
   nyomva kijelölő keret nyílik, két ujjal pedig nagyítani lehet.
   ===================================================================== */
/* Az érintésjelzőt korábban csak a vászonra koppintás kapcsolta be. Ha a
   játékos gombbal kezdett, a jelző hamis maradt — az iOS pedig hamis
   egéreseményeket küld a koppintásokra, amitől a képernyőszéli görgetés
   elindult, és a kamera magától húzott. Most az egész oldalon figyelünk,
   és az érintőképernyőt eleve felismerjük. */
try{
  if((navigator.maxTouchPoints||0)>0 ||
     (matchMedia&&matchMedia('(pointer:coarse)').matches)) G.isTouch=true;
}catch(e){}
addEventListener('touchstart',()=>{ G.isTouch=true; },{capture:true,passive:true});

let touchState=null;
function touchWorld(t){
  const p=vaszonPont(t.clientX,t.clientY);
  return toWorld(p.x,p.y);
}
function haptic(ms){ if(navigator.vibrate) try{navigator.vibrate(ms);}catch(e){} }
function markTouch(){
  if(G.isTouch) return;
  G.isTouch=true;
  document.body.classList.add('touch');
  if(G.zoom===1){ G.zoom=innerWidth<700?0.78:0.9; updateView(); }
}
cv.addEventListener('touchstart',e=>{
  if(G.place==='wall'&&e.touches.length===1&&G.on&&!G.over){
    const w=touchWorld(e.touches[0]);
    G.wallDrag={x0:w.x,y0:w.y,x1:w.x,y1:w.y,shift:false};
    e.preventDefault(); return;
  }
  SFX.init(); markTouch();
  if(!G.on||G.over) return;
  e.preventDefault();
  const t=e.touches;
  if(t.length===1){
    const p0=vaszonPont(t[0].clientX,t[0].clientY), x=p0.x, y=p0.y;
    touchState={mode:'tap',x0:x,y0:y,cx:G.cam.x,cy:G.cam.y,moved:false,
      timer:setTimeout(()=>{                       // hosszú nyomás: kijelölő keret
        if(touchState&&!touchState.moved){
          touchState.mode='box';
          G.mouse.sx=touchState.x0; G.mouse.sy=touchState.y0;
          G.mouse.x=touchState.x0; G.mouse.y=touchState.y0;
          G.mouse.dragging=true; haptic(18);
        }},330)};
    G.mouse.x=x; G.mouse.y=y;
    const w=toWorld(x,y); G.mouse.wx=w.x; G.mouse.wy=w.y;
  }else if(t.length===2){
    if(touchState&&touchState.timer) clearTimeout(touchState.timer);
    G.mouse.dragging=false;
    const kp=vaszonPont((t[0].clientX+t[1].clientX)/2,(t[0].clientY+t[1].clientY)/2);
    const mx=kp.x, my=kp.y;
    touchState={mode:'pinch',d0:Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY),
      z0:G.zoom,mx:mx,my:my,wx:mx/G.zoom+G.cam.x,wy:my/G.zoom+G.cam.y};
  }
},{passive:false});

cv.addEventListener('touchmove',e=>{
  if(G.wallDrag&&e.touches.length===1){
    const w=touchWorld(e.touches[0]);
    G.wallDrag.x1=w.x; G.wallDrag.y1=w.y;
    e.preventDefault(); return;
  }
  if(!touchState) return;
  e.preventDefault();
  const t=e.touches;
  if(touchState.mode==='pinch'&&t.length>=2){
    const d=Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
    G.zoom=clamp(touchState.z0*(d/Math.max(1,touchState.d0)),G.pirate?0.09:0.45,2); G.zoomUser=true;
    updateView();
    G.cam.x=touchState.wx-touchState.mx/G.zoom;
    G.cam.y=touchState.wy-touchState.my/G.zoom;
    clampCam();
    // az építési szellemkép a csípés közepét kövesse
    G.mouse.x=touchState.mx; G.mouse.y=touchState.my;
    const wm=toWorld(touchState.mx,touchState.my); G.mouse.wx=wm.x; G.mouse.wy=wm.y;
    return;
  }
  const pp=vaszonPont(t[0].clientX,t[0].clientY), x=pp.x, y=pp.y;
  G.mouse.x=x; G.mouse.y=y;
  const w=toWorld(x,y); G.mouse.wx=w.x; G.mouse.wy=w.y;
  const dx=x-touchState.x0, dy=y-touchState.y0;
  if(Math.abs(dx)>9||Math.abs(dy)>9){
    touchState.moved=true;
    if(touchState.timer){clearTimeout(touchState.timer);touchState.timer=null;}
  }
  if(touchState.mode==='box') return;             // a keret a mozgó ujjat követi
  if(touchState.moved){
    touchState.mode='pan';
    G.cam.x=touchState.cx-dx/G.zoom; G.cam.y=touchState.cy-dy/G.zoom; clampCam();
  }
},{passive:false});

function endTouch(){
  if(!touchState) return;
  if(touchState.timer) clearTimeout(touchState.timer);
  const st=touchState; touchState=null;
  if(st.mode==='box'){
    G.mouse.dragging=false;
    boxSelect(st.x0,st.y0,G.mouse.x,G.mouse.y,false);
    return;
  }
  if(st.mode!=='tap') return;                     // húzás vagy csípés: nincs parancs
  const w=toWorld(st.x0,st.y0);
  /* Kalózvilágban a városra koppintva nyílik a menü — ezen keresztül lehet
     építeni és toborozni. Eddig csak egérrel volt bekötve, ezért telefonon
     egyáltalán nem lehetett építkezni. */
  if(G.pirate&&typeof portHit==='function'&&!G.place){
    const v=portHit(w.x,w.y);
    if(v){ portOpen(v); return; }
    if(G.port) portClose();
  }
  if(G.place){ placeBuilding(snap(w.x,G.place),snap(w.y,G.place),false); return; }
  const ent=entAt(w.x,w.y);
  // Ha munkás van kijelölve és félkész vagy sérült saját épületre koppintasz,
  // az nem új kijelölés, hanem munkára küldés.
  const needsWork=ent&&ent.kind==='build'&&ent.owner===ENID&&(!ent.done||ent.hp<ent.maxHp-1);
  const haveCrew=G.sel.some(u=>!u.dead&&u.role==='worker');
  if(needsWork&&haveCrew) command(w.x,w.y);
  else if(ent&&ent.owner===ENID) selectAt(w.x,w.y,false);       // sajátra koppintva kijelöl
  else if(G.sel.length||G.selBuild) command(w.x,w.y);        // egyébként parancs
  else selectAt(w.x,w.y,false);
}
cv.addEventListener('touchend',e=>{
  e.preventDefault();
  if(G.wallDrag){
    const d=G.wallDrag; G.wallDrag=null;
    placeWallLine(d.x0,d.y0,d.x1,d.y1);
    G.place=null; syncUI();
    return;
  }
  endTouch();
},{passive:false});
cv.addEventListener('touchcancel',()=>{G.mouse.dragging=false;touchState=null;});
