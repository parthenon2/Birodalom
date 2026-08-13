/* =======================================================================
   4. VÁSZON ÉS MÉRETEZÉS
   ===================================================================== */

/* Mennyivel lehet KIMENNI a pálya széléről?

   A kamera eddig pontosan a pálya határáig ment, tehát a legszélső
   épület a képernyő legszélére került — félig a felület alá. Egy kis
   ráhagyással minden szegmens kényelmesen megnézhető.

   A ráhagyás a NÉZET méretéhez igazodik, nem rögzített pixelszám: így
   nagy felbontáson és kicsiben is ugyanúgy érződik. */
const CAM_RAHAGYAS = 0.18;              // a látótér 18%-a

const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
// A nézetmód dönti el, hogy asztali vagy érintéses elrendezést kap a
// felület. Automatikusan a képernyő szélességéből következtetünk, de a
// beállításokban felül lehet bírálni — így nagy telefonon is kérhető a
// kompakt elrendezés, és tableten az asztali.
function applyUiMode(){
  const phone=(G.uiMode==='phone') ||
              (G.uiMode!=='desktop' && (G.isTouch||innerWidth<820));
  if(document.body&&document.body.classList)
    document.body.classList.toggle('touch',phone);
  if(document.documentElement&&document.documentElement.style)
    document.documentElement.style.setProperty('--hud', phone?'0.86':'1');
  return phone;
}
function resize(){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  // Rögzített képméret esetén a játéktér ekkora lesz, és belefér az
  // ablakba: ha kisebb az ablak, arányosan kicsinyítve, középre igazítva.
  let vw=innerWidth, vh=innerHeight, bal=0, fent=0;
  const r=(typeof resItem==='function')?resItem(G.viewSize||'auto'):null;
  if(r&&r[2]){
    vw=r[2]; vh=r[3];
    const k=Math.min(innerWidth/vw, innerHeight/vh, 1);
    const sz=Math.round(vw*k), ma=Math.round(vh*k);
    bal=Math.round((innerWidth-sz)/2); fent=Math.round((innerHeight-ma)/2);
    cv.style.width=sz+'px'; cv.style.height=ma+'px';
    cv.style.left=bal+'px'; cv.style.top=fent+'px'; cv.style.right='auto'; cv.style.bottom='auto';
    if(document.body&&document.body.style) document.body.style.background='#07060a';
  }else{
    cv.style.width=innerWidth+'px'; cv.style.height=innerHeight+'px';
    cv.style.left='0'; cv.style.top='0'; cv.style.right='0'; cv.style.bottom='0';
  }
  cv.width=Math.floor(vw*dpr); cv.height=Math.floor(vh*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  G.view.w=vw; G.view.h=vh;
  const phone=applyUiMode();
  // A nagyítás igazodjon a képernyőhöz: kis kijelzőn többet mutatunk, hogy
  // ne kelljen folyton görgetni.
  if(!G.zoomUser){
    const want=phone?(innerWidth<520?0.62:0.78):(innerWidth>1500?1:0.9);
    if(Math.abs(G.zoom-want)>0.02){ G.zoom=want; }
  }
  updateView();
  if(G.on) layoutHud();
}
addEventListener('resize',resize);
addEventListener('orientationchange',()=>setTimeout(resize,120));
if(window.visualViewport) visualViewport.addEventListener('resize',resize);
resize();
function updateView(){                       // a látható terület világkoordinátában
  G.vw=G.view.w/G.zoom; G.vh=G.view.h/G.zoom;
  clampCam();
}
// A kamerát mindig a saját főhadiszállásra állítjuk. Külön függvény, mert
// az induláskor több pillanatban is szükség van rá: a képernyő mérete a
// mobilböngészőkben csak az első képkockák után áll be véglegesen.
function centerOnBase(){
  /* Kalózvilágban a térkép a játék: induláskor kicsinyítünk, hogy a
     szigetvilág nagy része egyszerre látszódjon. */
  if(G.pirate&&!G.zoomUser){
    G.zoom=1.0;              // közelről indulunk, ahogy a képernyőn jó
    updateView();
  }
  /* A HELYI játékos bázisa — nem a 0-s félé. Hálózati játszmában te
     lehetsz a 2. vagy a 4. fél is; a régi, 0-ra kötött keresés ilyenkor
     nem talált semmit, és a kamera a térkép sarkában maradt: üres füvet
     láttál, miközben a jobbágyaid odébb dolgoztak. */
  const en=(typeof helyiFel==='function')?helyiFel():0;
  let b=null;
  for(const x of G.builds) if(!x.dead&&x.owner===en&&x.type==='hq'){b=x;break;}
  if(!b) for(const x of G.builds) if(!x.dead&&x.owner===en){b=x;break;}
  if(!b) for(const u of G.units) if(!u.dead&&u.owner===en){b=u;break;}
  const bx=b?b.x:380, by=b?b.y:WORLD.h-380;
  G.cam.x=bx-G.vw/2; G.cam.y=by-G.vh/2;
  clampCam();
}
// Ha a látótér nagyobb, mint a pálya (erős kicsinyítésnél vagy nagyon
// magas képernyőn), a kamerát nem a nullára szorítjuk — akkor ugyanis a
// pálya a bal felső sarokba csúszna, körülötte üres területtel. Helyette
// középre igazítjuk a világot.
function clampCam(){
  const rx = G.vw * CAM_RAHAGYAS, ry = G.vh * CAM_RAHAGYAS;
  G.cam.x=(G.vw>=WORLD.w) ? (WORLD.w-G.vw)/2 : clamp(G.cam.x,-rx,WORLD.w-G.vw+rx);
  G.cam.y=(G.vh>=WORLD.h) ? (WORLD.h-G.vh)/2 : clamp(G.cam.y,-ry,WORLD.h-G.vh+ry);
}
