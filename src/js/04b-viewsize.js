/* =======================================================================
   4/B. KÉPMÉRET

   Alapból a játék kitölti az ablakot. Itt rögzített felbontás is
   választható — asztali alkalmazásban ilyenkor maga az ablak veszi fel a
   méretet, böngészőben pedig a játéktér áll be arra, körülötte sötét
   kerettel (mint moziban a fekete sávok).
   ===================================================================== */
const RES_LIST=[
  ['auto','Ablakhoz igazítva',0,0],
  ['800x600','800 × 600',800,600],
  ['1024x768','1024 × 768',1024,768],
  ['1280x720','1280 × 720  (HD)',1280,720],
  ['1366x768','1366 × 768',1366,768],
  ['1440x900','1440 × 900',1440,900],
  ['1600x900','1600 × 900',1600,900],
  ['1680x1050','1680 × 1050',1680,1050],
  ['1920x1080','1920 × 1080  (Full HD)',1920,1080],
  ['2048x1152','2048 × 1152',2048,1152],
  ['2560x1440','2560 × 1440  (QHD)',2560,1440],
  ['3840x2160','3840 × 2160  (4K)',3840,2160]
];
function resItem(kulcs){
  for(const r of RES_LIST) if(r[0]===kulcs) return r;
  return RES_LIST[0];
}
// Asztali alkalmazásban az ablakot is átméretezzük
function kerAblakMeret(w,h){
  try{
    if(window.birodalom&&window.birodalom.ablakMeret) window.birodalom.ablakMeret(w,h);
  }catch(e){}
}
function setViewSize(kulcs){
  G.viewSize=kulcs;
  const r=resItem(kulcs);
  if(r[2]) kerAblakMeret(r[2],r[3]);
  if(typeof resize==='function') resize();
  if(typeof G.on!=='undefined'&&G.on&&typeof centerOnBase==='function') centerOnBase();
}
function initResSelect(){
  const el=(typeof $==='function')?$('selRes'):null;
  if(!el||!el.appendChild) return;
  el.innerHTML='';
  for(const r of RES_LIST){
    const o=document.createElement('option');
    o.value=r[0]; o.textContent=r[1];
    if(r[0]===G.viewSize) o.selected=true;
    el.appendChild(o);
  }
  el.onchange=()=>{ setViewSize(el.value); SFX.init(); SFX.play('click'); };
}

/* -----------------------------------------------------------------------
   TELJES KÉPERNYŐ

   Kétféle burokban futhat a játék:

   • asztali alkalmazásban (Electron) — ott az ABLAK megy teljes képernyőre,
     tehát eltűnik a címsor és a tálca is, az egész kijelző a játéké;
   • böngészőben — ott a szabványos Fullscreen API-t használjuk.

   A kettőt ugyanaz a kapcsoló vezérli. Ha egyik sincs (pl. beágyazott
   nézetben), a sor rejtve marad, hogy ne kínáljunk működésképtelen gombot.
   ----------------------------------------------------------------------- */
function asztaliBurok(){
  return !!(window.birodalom&&window.birodalom.teljesKepernyo);
}
function bongeszoTeljesLehet(){
  const e=document.documentElement;
  return !!(e&&(e.requestFullscreen||e.webkitRequestFullscreen));
}
function teljesKepernyoAllapot(){
  if(asztaliBurok()) return !!G.fullScreen;
  return !!(document.fullscreenElement||document.webkitFullscreenElement);
}
function teljesKepernyoAllit(be){
  if(asztaliBurok()){
    /* Az igazi állapotot a burok mondja meg vissza, lásd lentebb a
       figyelőt — itt csak kérünk. */
    window.birodalom.teljesKepernyo(!!be);
    return;
  }
  const e=document.documentElement;
  try{
    if(be){ (e.requestFullscreen||e.webkitRequestFullscreen).call(e); }
    else  { (document.exitFullscreen||document.webkitExitFullscreen).call(document); }
  }catch(err){}
}
/* A gombok állapotát egy helyen frissítjük: így az F11, az Esc és a
   beállítások kapcsolója sosem mutat mást. */
function teljesKepernyoJelol(be){
  G.fullScreen=!!be;
  const box=(typeof $==='function')?$('segFull'):null;
  if(box&&box.querySelectorAll){
    for(const b of box.querySelectorAll('button'))
      b.classList.toggle('on', (b.dataset.v==='1')===!!be);
  }
}
function initFullScreen(){
  const sor=(typeof $==='function')?$('rowFull'):null;
  if(!sor) return;
  if(!asztaliBurok()&&!bongeszoTeljesLehet()){ sor.style.display='none'; return; }
  sor.style.display='';
  if(asztaliBurok()&&window.birodalom.teljesKepernyoFigyel)
    window.birodalom.teljesKepernyoFigyel(teljesKepernyoJelol);
  else
    document.addEventListener('fullscreenchange',()=>teljesKepernyoJelol(teljesKepernyoAllapot()));
  teljesKepernyoJelol(teljesKepernyoAllapot());
}
