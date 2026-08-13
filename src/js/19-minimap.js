/* =======================================================================
   17. MINITÉRKÉP
   ===================================================================== */
const mini=document.getElementById('mini'), mctx=mini.getContext('2d');
function drawMini(){
  const sx=mini.width/WORLD.w, sy=mini.height/WORLD.h;
  mctx.fillStyle=AGES[G.age].style.ground; mctx.fillRect(0,0,mini.width,mini.height);
  mctx.fillStyle='rgba(30,60,25,.75)';
  for(const n of G.nodes){ if(n.dead||fogAt(n.x,n.y)===0) continue;
    mctx.fillStyle=n.type==='wood'?'rgba(30,70,28,.8)':(n.type==='stone'?'rgba(150,150,155,.8)':'rgba(212,175,55,.9)');
    mctx.fillRect(n.x*sx-1,n.y*sy-1,2,2); }
  for(const b of G.builds){ if(b.dead||(!enyemVagySzovetseges(b.owner)&&fogAt(b.x,b.y,helyiFel())===0)) continue;
    mctx.fillStyle=ownerColor(b.owner);
    mctx.fillRect(b.x*sx-3,b.y*sy-3,6,6); }
  for(const u of G.units){ if(u.dead||(!enyemVagySzovetseges(u.owner)&&fogAt(u.x,u.y,helyiFel())!==2)) continue;
    /* Több félnél mindenki a saját csapatszínét viseli a kistérképen is. */
    mctx.fillStyle=(oldalDb()>2)?ownerAccent(u.owner)
                  :(u.owner?ENEMY.color:NATIONS[G.nation].accent);
    mctx.fillRect(u.x*sx-1.2,u.y*sy-1.2,2.4,2.4); }
  if(fogCv){ mctx.imageSmoothingEnabled=true; mctx.globalAlpha=0.82;
    mctx.drawImage(fogCv,0,0,mini.width,mini.height); mctx.globalAlpha=1; }
  mctx.strokeStyle='rgba(255,255,255,.85)'; mctx.lineWidth=1;
  mctx.strokeRect(G.cam.x*sx,G.cam.y*sy,G.vw*sx,G.vh*sy);
}
// A minitérképet a CSS kisebbre méretezi telefonon, ezért a megjelenített
// méretből számolunk, nem a vászon belső felbontásából — különben a
// koppintás máshová vinné a kamerát, mint ahová mutattál.
function miniJump(clientX,clientY){
  const r=mini.getBoundingClientRect();
  if(!r.width||!r.height) return;
  G.cam.x=clamp((clientX-r.left)/r.width,0,1)*WORLD.w-G.vw/2;
  G.cam.y=clamp((clientY-r.top)/r.height,0,1)*WORLD.h-G.vh/2;
  clampCam();
}
let miniDrag=false;
mini.addEventListener('mousedown',e=>{ miniDrag=true; miniJump(e.clientX,e.clientY); });
mini.addEventListener('mousemove',e=>{ if(miniDrag) miniJump(e.clientX,e.clientY); });
addEventListener('mouseup',()=>{ miniDrag=false; });
// Érintésre eddig egyáltalán nem reagált
mini.addEventListener('touchstart',e=>{
  e.preventDefault(); e.stopPropagation();
  miniJump(e.touches[0].clientX,e.touches[0].clientY);
},{passive:false});
mini.addEventListener('touchmove',e=>{
  e.preventDefault(); e.stopPropagation();
  miniJump(e.touches[0].clientX,e.touches[0].clientY);
},{passive:false});
