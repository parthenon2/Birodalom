/* =======================================================================
   13/E. STRATÉGIAI TÉRKÉPRÉTEG

   A kalózpálya háromszor akkora, mint a többi. Erősen kicsinyítve a
   részletes terep rajzolása használhatatlanná vált: cellánként festettük
   a füvet, a vizet, a habot és a partot, ami tízezres nagyságrendű
   műveletet jelentett képkockánként — 0,09-es nagyításon 2,2 másodperc.

   Ezért a pálya egyszer, játszma elején elkészül EGY KÉPKÉNT a ködrács
   felbontásában (319×225 képpont), és onnantól csak azt nagyítjuk ki.
   Így a kizoomolt nézet ugyanannyiba kerül, mint egy kép kirajzolása.
   ===================================================================== */

const STRAT_ZOOM=0.34;          // ez alatt a stratégiai képet használjuk
let stratCv=null, stratVer=-1;

function stratBuild(){
  if(typeof document==='undefined') return null;
  const c=document.createElement('canvas');
  c.width=FW; c.height=FH;
  const g=c.getContext('2d');
  const im=g.createImageData(FW,FH);
  const d=im.data;
  const M=(typeof curMap==='function')?curMap():null;
  // a szárazföld színe a tájtípusból, a víz a mélységből
  const fold=[74,116,52], part=[196,178,132];
  const sekely=[62,148,164], mely=[12,46,74];
  for(let i=0;i<FW*FH;i++){
    const o=i*4;
    let r,gg,b;
    if(G.water&&G.water[i]){
      const m=(typeof waterDepth!=='undefined'&&waterDepth)?(waterDepth[i]||6):6;
      const t=Math.min(1,Math.max(0,(m-1)/5));
      r=sekely[0]+(mely[0]-sekely[0])*t;
      gg=sekely[1]+(mely[1]-sekely[1])*t;
      b=sekely[2]+(mely[2]-sekely[2])*t;
    }else{
      // partközeli szárazföld homokos
      let vizKozel=false;
      const cy=(i/FW)|0, cx=i-cy*FW;
      for(let yy=-1;yy<=1&&!vizKozel;yy++) for(let xx=-1;xx<=1;xx++){
        const nx=cx+xx, ny=cy+yy;
        if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
        if(G.water&&G.water[ny*FW+nx]){ vizKozel=true; break; }
      }
      const alap=vizKozel?part:fold;
      const zaj=((i*2654435761)%17)/17*10-5;      // apró szórás, hogy ne legyen lapos
      r=alap[0]+zaj; gg=alap[1]+zaj; b=alap[2]+zaj;
      if(G.rock&&G.rock[i]){ r=118; gg=116; b=112; }
    }
    d[o]=r; d[o+1]=gg; d[o+2]=b; d[o+3]=255;
  }
  g.putImageData(im,0,0);
  return c;
}
/* Használjuk-e most a stratégiai képet? */
function stratMode(){
  return !!G.pirate && G.zoom < STRAT_ZOOM;
}
/* A kép kirajzolása a világ koordinátarendszerében. */
function drawStratMap(){
  if(stratVer!==G.navVer||!stratCv||stratCv.width!==FW||stratCv.height!==FH){
    stratCv=stratBuild();
    stratVer=G.navVer;
  }
  if(!stratCv) return;
  /* CSAK a látható részt másoljuk. Korábban a teljes pályát kirajzoltuk
     minden képkockán — a képernyőn kívüli rész is munkát jelentett, és
     a nagyítás növelésével egyre többet. */
  const W=FW*FOG_CELL, H=FH*FOG_CELL;
  const x0=clamp(G.cam.x,0,W), y0=clamp(G.cam.y,0,H);
  const x1=clamp(G.cam.x+G.vw,0,W), y1=clamp(G.cam.y+G.vh,0,H);
  if(x1<=x0+0.5||y1<=y0+0.5) return;
  const el=ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(stratCv,
    x0/W*FW, y0/H*FH, (x1-x0)/W*FW, (y1-y0)/H*FH,
    x0, y0, x1-x0, y1-y0);
  ctx.imageSmoothingEnabled=el;
}
