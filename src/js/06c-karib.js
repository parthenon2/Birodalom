/* =======================================================================
   6/C. A KARIB-TENGER

   A kalózvilág térképe nem sorsolt, hanem rögzített: Florida csücske,
   Kuba hosszú szigete, a Bahama-szigetek füzére, Jamaica, Hispaniola,
   Tortuga és a Kajmán-szigetek — nagyjából a valódi elrendezés szerint.

   A partokat sokszögekből rajzoljuk a ködráccsal azonos felbontásban.
   Minden érték a pálya arányában (0..1) van megadva, így a világ méretének
   változása nem borítja fel a térképet.
   ===================================================================== */

/* Szárazföldi alakzatok. Minden bejegyzés vagy sokszög (pontok listája),
   vagy ellipszis {e:[x,y,rx,ry,forgás]}. A koordináták 0..1 arányok. */
const KARIB_FOLD=[
  // --- Florida csücske: felül, kissé balra ---
  {p:[[0.24,-0.05],[0.40,-0.05],[0.42,0.05],[0.40,0.12],[0.35,0.17],[0.31,0.15],[0.28,0.08],[0.24,0.03]]},
  // --- Kuba: hosszú, enyhén ívelt sziget a térkép közepén ---
  {p:[[0.10,0.44],[0.20,0.41],[0.30,0.42],[0.40,0.45],[0.50,0.49],[0.58,0.53],[0.66,0.58],[0.70,0.63],
      [0.68,0.67],[0.60,0.64],[0.50,0.60],[0.40,0.56],[0.30,0.53],[0.20,0.50],[0.11,0.50]]},
  // --- Isla de la Juventud: kis sziget Kuba alatt, nyugaton ---
  {e:[0.245,0.575,0.045,0.028,0]},
  // --- Bahama-szigetek: hosszú, keskeny szigetek füzére északkeleten ---
  {e:[0.575,0.07,0.018,0.075,0.2]},
  {e:[0.615,0.135,0.014,0.055,0.35]},
  {e:[0.566,0.205,0.052,0.072,0.12]},         // New Providence — Nassau kikötője
  {e:[0.635,0.235,0.013,0.062,0.25]},
  {e:[0.700,0.30,0.016,0.050,0.30]},
  {e:[0.745,0.375,0.014,0.045,0.20]},
  {e:[0.800,0.42,0.017,0.038,0.45]},
  {e:[0.845,0.30,0.013,0.035,0.10]},
  // --- Kajmán-szigetek: apró pont délnyugaton ---
  {e:[0.335,0.745,0.028,0.016,0.1]},
  // --- Jamaica ---
  {e:[0.545,0.855,0.082,0.050,0.06]},         // Jamaica — Port Royal
  // --- Hispaniola: nagy sziget jobbra lent ---
  {p:[[0.78,0.80],[0.88,0.78],[0.97,0.80],[1.02,0.86],[1.00,0.94],[0.90,0.96],[0.80,0.93],[0.76,0.86]]},
  // --- Tortuga: apró sziget Hispaniola fölött ---
  {e:[0.885,0.695,0.030,0.016,0]},
  // --- Yucatán / a szárazföld pereme balra ---
  {p:[[-0.05,0.40],[0.05,0.42],[0.07,0.52],[0.05,0.62],[-0.05,0.66]]},
  {p:[[-0.05,0.86],[0.06,0.88],[0.08,0.96],[-0.05,1.05]]}
];

/* Nevezetes helyek: innen indulnak a felek. A kalóz Nassauban, a spanyol
   Havannában, az angol Port Royalban (Jamaica). */
/* Nevezetes kikötők. A 18—19. századi Karib-tenger tele volt kikötővárossal,
   ezért jóval több van, mint négy. A pontok a szigetek PARTJÁHOZ közel esnek —
   a karibPont() ráadásul a legközelebbi partszakaszra igazítja őket, hogy egy
   város se kerüljön a sziget közepére. */
const KARIB_HELY={
  nassau:    [0.566,0.235],   // New Providence
  havanna:   [0.150,0.437],   // Kuba észak-nyugat
  santiago:  [0.545,0.585],   // Kuba dél-kelet
  trinidad:  [0.330,0.520],   // Kuba dél
  matanzas:  [0.250,0.430],   // Kuba észak
  portroyal: [0.545,0.878],   // Jamaica
  tortuga:   [0.885,0.712],   // Tortuga
  santodomingo:[0.930,0.905], // Hispaniola dél
  gonaives:  [0.795,0.812],   // Hispaniola nyugat
  eleuthera: [0.640,0.150],   // Bahamák
  exuma:     [0.700,0.318],   // Bahamák dél
  crooked:   [0.800,0.432],   // Bahamák dél-kelet
  caymanbrac:[0.335,0.760],   // Kajmán
  campeche:  [0.030,0.520]    // Yucatán partja
};

/* A pont ráigazítása a legközelebbi partra: olyan szárazföldi cellát
   keresünk, aminek a szomszédjában víz van. Enélkül a városok a szigetek
   belsejébe kerültek volna, és a kikötő értelmét vesztette. */
let KARIB_SNAP=null;
function karibShoreSnap(){
  KARIB_SNAP={};
  for(const k in KARIB_HELY){
    const p=KARIB_HELY[k];
    const cx0=Math.round(p[0]*FW), cy0=Math.round(p[1]*FH);
    let jo=null, bd=1e9;
    for(let r=0;r<=26&&!jo;r++){
      for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue;
        const cx=cx0+dx, cy=cy0+dy;
        if(cx<1||cy<1||cx>=FW-1||cy>=FH-1) continue;
        const i=cy*FW+cx;
        if(G.water[i]) continue;                 // szárazföld kell
        let partE=false;
        for(let k2=0;k2<8&&!partE;k2++){
          const nx=cx+[1,-1,0,0,1,1,-1,-1][k2], ny=cy+[0,0,1,-1,1,-1,1,-1][k2];
          if(G.water[ny*FW+nx]) partE=true;
        }
        if(!partE) continue;
        const d=dx*dx+dy*dy;
        if(d<bd){ bd=d; jo={x:(cx+0.5)*FOG_CELL, y:(cy+0.5)*FOG_CELL}; }
      }
      if(jo) break;
    }
    KARIB_SNAP[k]=jo||{x:p[0]*WORLD.w, y:p[1]*WORLD.h};
  }
}

function karibPont(kulcs){
  if(KARIB_SNAP&&KARIB_SNAP[kulcs]) return KARIB_SNAP[kulcs];
  const p=KARIB_HELY[kulcs]||KARIB_HELY.nassau;
  return {x:p[0]*WORLD.w, y:p[1]*WORLD.h};
}

// Van-e a (px,py) arányos pont a sokszögön belül?
function pontSokszogben(px,py,pts){
  let benn=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const xi=pts[i][0], yi=pts[i][1], xj=pts[j][0], yj=pts[j][1];
    if(((yi>py)!==(yj>py)) && (px < (xj-xi)*(py-yi)/((yj-yi)||1e-9)+xi)) benn=!benn;
  }
  return benn;
}

/* A Karib-tenger felépítése: mindent vízzel öntünk el, majd kivágjuk
   belőle a szárazföldet. */
function genKarib(){
  const W=G.water=new Uint8Array(FW*FH);
  W.fill(1);
  for(let cy=0;cy<FH;cy++){
    const py=(cy+0.5)/FH;
    for(let cx=0;cx<FW;cx++){
      const px=(cx+0.5)/FW;
      let szaraz=false;
      for(const f of KARIB_FOLD){
        if(f.p){ if(pontSokszogben(px,py,f.p)){ szaraz=true; break; } }
        else{
          const [ex,ey,rx,ry,fo]=f.e;
          const dx=px-ex, dy=py-ey;
          const c=dcos(-fo), s=dsin(-fo);
          const ux=(dx*c-dy*s)/rx, uy=(dx*s+dy*c)/ry;
          if(ux*ux+uy*uy<=1){ szaraz=true; break; }
        }
      }
      if(szaraz) W[cy*FW+cx]=0;
    }
  }
  // A partvonal legyen kissé szaggatott, hogy ne látszódjon a mértani forma
  const R=seedRand('karibpart');
  {
    const masol=W.slice();
    for(let cy=1;cy<FH-1;cy++) for(let cx=1;cx<FW-1;cx++){
      const i=cy*FW+cx;
      let szomszedSzaraz=0;
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++)
        if(!masol[(cy+dy)*FW+(cx+dx)]) szomszedSzaraz++;
      if(szomszedSzaraz>0&&szomszedSzaraz<9&&R()<0.28) W[i]=masol[i]?0:1;
    }
  }

  /* HAJÓZHATÓSÁG.

     A szaggatott partvonal egycellás nyúlványokat és szorosokat hagy maga
     után, amiken egy hajó nem fér át — mérve a vízsávok 44%-a volt 128
     pixelnél keskenyebb, a legszűkebb 32 pixel. Egy gálya sugara 16, tehát
     beszorul.

     Ezért két menetben elhordjuk azt a szárazföldet, ami körül már túlnyomó
     részt víz van: eltűnnek a tüskék, és a szorosok kiszélesednek. A
     szigetek alakja megmarad, csak a szélük simul. */
  for(let menet=0;menet<3;menet++){
    const masol=W.slice();
    for(let cy=1;cy<FH-1;cy++) for(let cx=1;cx<FW-1;cx++){
      const i=cy*FW+cx;
      if(masol[i]) continue;                     // ez már víz
      let viz=0;
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy) continue;
        if(masol[(cy+dy)*FW+(cx+dx)]) viz++;
      }
      if(viz>=5) W[i]=1;                         // nyúlvány vagy szűkület: víz lesz
    }
  }
  /* Külön menet a SZOROSOKRA: ha egy szárazföldi cellának a két szemközti
     oldalán is víz van, akkor az egy egycellás gát két öböl között — azt
     áttörjük, mert egy hajó sosem férne át rajta. */
  {
    const masol=W.slice();
    for(let cy=1;cy<FH-1;cy++) for(let cx=1;cx<FW-1;cx++){
      const i=cy*FW+cx;
      if(masol[i]) continue;
      const bal=masol[cy*FW+cx-1], jobb=masol[cy*FW+cx+1];
      const fent=masol[(cy-1)*FW+cx], lent=masol[(cy+1)*FW+cx];
      if((bal&&jobb)||(fent&&lent)) W[i]=1;
    }
  }
  // a városokat a kész partvonalhoz igazítjuk
  karibShoreSnap();
}
