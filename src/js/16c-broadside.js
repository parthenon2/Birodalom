/* =======================================================================
   16/C. SORTŰZ

   A hajóágyú nem egyetlen villanás: a célpont felőli oldalon egyszerre
   dörren el a fedélzeti sor. Amennyi ágyúja van a hajónak, annyi torkolat
   villan — a szlúp nyolca alig füstöl, a gálya negyvenöt ágyúja
   elsötétíti maga körül a vizet.

   Három réteg egymáson:
     TORKOLATTŰZ — rövid, éles villanás az ágyúnyílásnál
     FÜST        — sűrű, lassan táguló és sodródó gomoly
     PARÁZS      — apró, lehulló szikrák a vízre
   ===================================================================== */

function broadside(hajo,cel){
  if(!hajo||!cel) return;
  /* A torkolattűz (`agyu`) mindig megjelenik — olcsó, és a sortűz
     látványa nélkül a játékos nem tudja, hogy a hajója lőtt-e.
     A füst (`agyufust`) takarékos módban kimarad: az a drágább rész. */
  const fustOk=!G.lowFx;
  const db=Math.max(2,Math.min(24,Math.round((hajo.guns||8)/2)));  // fél oldal dörren
  const szog=Math.atan2(cel.y-hajo.y, cel.x-hajo.x);
  // a hajó hossztengelye merőleges a lövés irányára: az ágyúk e mentén állnak
  const hossz=Math.atan2(cel.y-hajo.y, cel.x-hajo.x)+Math.PI/2;
  const L=(hajo.galleon?24:(hajo.role==='warship'?19:16));
  const ki=hajo.r*0.75;
  for(let i=0;i<db;i++){
    const t=(db===1)?0:(i/(db-1)-0.5)*2;              // -1..1 a hajó mentén
    const bx=hajo.x+Math.cos(hossz)*t*L+Math.cos(szog)*ki;
    const by=hajo.y+Math.sin(hossz)*t*L+Math.sin(szog)*ki;
    const kesés=Math.abs(t)*0.05+Math.random()*0.04;  // középről kifelé gördül a dörej
    G.fx.push({x:bx,y:by,t:-kesés,life:0.34,type:'agyu',szog,ero:hajo.galleon?1.25:1});
    if(fustOk) G.fx.push({x:bx+Math.cos(szog)*6,y:by+Math.sin(szog)*6,
               t:-kesés,life:1.5+Math.random()*0.7,type:'agyufust',
               vx:Math.cos(szog)*16+rnd(-5,5), vy:Math.sin(szog)*16+rnd(-5,5),
               r:hajo.galleon?9:7});
  }
  G.shake=Math.min(1,(G.shake||0)+(hajo.galleon?0.30:0.14));
  SFX.at('boom',hajo.x,hajo.y,hajo.galleon?0.9:0.6);
}

/* A sortűz effektusainak rajzolása. Az fx-rendszer hívja. */
function drawBroadsideFx(f,x,y,k){
  if(f.type==='agyu'){
    // torkolattűz: fényes mag, körülötte sárga korona
    const e=(1-k)*(f.ero||1);
    ctx.fillStyle='rgba(255,246,214,'+(0.95*e)+')';
    ctx.beginPath(); ctx.arc(x,y,3.4+k*5,0,TAU); ctx.fill();
    ctx.fillStyle='rgba(255,186,74,'+(0.7*e)+')';
    ctx.save(); ctx.translate(x,y); ctx.rotate(f.szog||0);
    ctx.beginPath();
    ctx.moveTo(0,-3.4-k*3); ctx.lineTo(13+k*16,0); ctx.lineTo(0,3.4+k*3);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    return true;
  }
  if(f.type==='agyufust'){
    // sűrű lőporfüst: tágul, sodródik, világosból szürkébe fordul
    const r=(f.r||7)*(0.6+k*2.6);
    const a=0.55*(1-k)*(1-k);
    const sz=Math.round(230-70*k);
    ctx.fillStyle='rgba('+sz+','+sz+','+(sz-8)+','+a+')';
    ctx.beginPath();
    ctx.arc(x+(f.vx||0)*k*0.9, y+(f.vy||0)*k*0.9 - k*5, r, 0, TAU);
    ctx.fill();
    return true;
  }
  return false;
}
