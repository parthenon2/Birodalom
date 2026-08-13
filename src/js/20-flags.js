/* -----------------------------------------------------------------------
   KORHŰ ZÁSZLÓKÉPEK

   A zászlók valódi képként érkeznek: az összeállításkor kerülnek ide
   adat-URI-ként a zaszlok/ mappából. A lobogtatás változatlan marad —
   az függőleges csíkokban dolgozik, és mindegy neki, hogy rajzolt vagy
   fényképezett zászlót kap. Amelyikhez nincs kép, ott marad a rajzolt.
   ----------------------------------------------------------------------- */
const FLAG_IMG={};
const FIMG={};
function flagImage(nation,age){
  const key=nation+'-'+age, src=FLAG_IMG[key];
  if(!src||typeof Image!=='function') return null;
  let im=FIMG[key];
  if(!im){
    im=new Image();
    im.onload=()=>{                                // megjött: a gyorsítótár frissül
      for(const k in FLAGCACHE) if(k.indexOf(nation+age)===0) delete FLAGCACHE[k];
    };
    im.src=src;
    FIMG[key]=im;
  }
  return (im.complete&&im.naturalWidth)?im:null;
}

/* =======================================================================
   17/B. KORHŰ ZÁSZLÓK

   Minden nemzet minden korszakhoz saját lobogót kap, mert a mai
   nemzeti zászlók többsége csak a 19. században született meg.
   Angliának például a 15. században Szent György keresztje járt, a
   Union Jack pedig csak 1801 után nyerte el mai formáját.
   ===================================================================== */
function fFill(g,w,h,c){g.fillStyle=c;g.fillRect(0,0,w,h);}
function fBands(g,w,h,cols,vert){                     // vízszintes/függőleges sávok
  const n=cols.length;
  for(let i=0;i<n;i++){
    g.fillStyle=cols[i];
    if(vert) g.fillRect(Math.floor(w*i/n),0,Math.ceil(w/n)+1,h);
    else     g.fillRect(0,Math.floor(h*i/n),w,Math.ceil(h/n)+1);
  }
}
function fCross(g,w,h,col,t){                          // egyenlő szárú (görög) kereszt
  g.fillStyle=col;
  g.fillRect(0,h/2-t/2,w,t);
  g.fillRect(w*0.42-t/2,0,t,h);
}
function fSaltire(g,w,h,col,t){                        // átlós (András-) kereszt
  g.save(); g.beginPath(); g.rect(0,0,w,h); g.clip();
  g.strokeStyle=col; g.lineWidth=t; g.lineCap='butt';
  g.beginPath(); g.moveTo(0,0); g.lineTo(w,h); g.moveTo(w,0); g.lineTo(0,h); g.stroke();
  g.restore();
}
function fEagle(g,w,h,col,dbl){                        // heraldikai (kétfejű) sas
  const cx=w/2, cy=h*0.50, s=h*0.26;
  g.fillStyle=col;
  for(const d of [-1,1]){                              // kitárt szárnyak, tollazattal
    g.beginPath();
    g.moveTo(cx+d*s*0.28,cy-s*0.30);
    g.quadraticCurveTo(cx+d*s*1.20,cy-s*1.75,cx+d*s*1.90,cy-s*1.05);
    g.lineTo(cx+d*s*1.50,cy-s*0.80);
    g.lineTo(cx+d*s*1.72,cy-s*0.42);
    g.lineTo(cx+d*s*1.30,cy-s*0.30);
    g.lineTo(cx+d*s*1.46,cy+s*0.10);
    g.lineTo(cx+d*s*0.95,cy+s*0.10);
    g.quadraticCurveTo(cx+d*s*0.55,cy+s*0.10,cx+d*s*0.28,cy-s*0.30);
    g.closePath(); g.fill();
  }
  g.beginPath(); g.ellipse(cx,cy-s*0.05,s*0.34,s*0.66,0,0,TAU); g.fill();   // test
  g.beginPath();                                                            // farok
  g.moveTo(cx-s*0.32,cy+s*0.35); g.lineTo(cx+s*0.32,cy+s*0.35);
  g.lineTo(cx+s*0.52,cy+s*1.35); g.lineTo(cx+s*0.18,cy+s*1.15);
  g.lineTo(cx,cy+s*1.4); g.lineTo(cx-s*0.18,cy+s*1.15); g.lineTo(cx-s*0.52,cy+s*1.35);
  g.closePath(); g.fill();
  const head=(hx,dir)=>{                                                    // fej és csőr
    g.beginPath(); g.arc(hx,cy-s*0.80,s*0.30,0,TAU); g.fill();
    g.beginPath();
    g.moveTo(hx+dir*s*0.22,cy-s*0.92); g.lineTo(hx+dir*s*0.78,cy-s*0.76);
    g.lineTo(hx+dir*s*0.22,cy-s*0.60); g.closePath(); g.fill();
  };
  if(dbl){ head(cx-s*0.44,-1); head(cx+s*0.44,1);
    g.beginPath(); g.ellipse(cx,cy-s*0.62,s*0.34,s*0.26,0,0,TAU); g.fill(); }
  else head(cx,1);
}
function fFleur(g,cx,cy,s,col){                        // liliom
  g.fillStyle=col;
  g.beginPath(); g.moveTo(cx,cy-s);
  g.quadraticCurveTo(cx+s*0.42,cy-s*0.1,cx,cy+s*0.4);
  g.quadraticCurveTo(cx-s*0.42,cy-s*0.1,cx,cy-s); g.fill();
  g.beginPath(); g.ellipse(cx-s*0.66,cy-s*0.02,s*0.28,s*0.52,0.6,0,TAU); g.fill();
  g.beginPath(); g.ellipse(cx+s*0.66,cy-s*0.02,s*0.28,s*0.52,-0.6,0,TAU); g.fill();
  g.fillRect(cx-s*0.72,cy+s*0.34,s*1.44,s*0.2);
}

const FLAGS={
  /* A kalózlobogók beépített képként érkeznek; ezek a rajzolt változatok
     csak tartalékként szolgálnak, ha a kép nem tölt be. */
  ns:[
    (g,w,h)=>{ fFill(g,w,h,'#141414');                 // koponya és keresztcsont
      g.fillStyle='#EFEFEF';
      g.beginPath(); g.arc(w*0.5,h*0.4,h*0.2,0,TAU); g.fill();
      g.fillRect(w*0.36,h*0.62,w*0.28,h*0.08);
      g.fillRect(w*0.36,h*0.74,w*0.28,h*0.08); },
    (g,w,h)=>{ fFill(g,w,h,'#141414'); g.fillStyle='#EFEFEF';
      g.beginPath(); g.arc(w*0.5,h*0.42,h*0.2,0,TAU); g.fill();
      g.fillRect(w*0.36,h*0.66,w*0.28,h*0.1); },
    (g,w,h)=>{ fFill(g,w,h,'#141414'); g.fillStyle='#EFEFEF';
      g.beginPath(); g.arc(w*0.5,h*0.42,h*0.2,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#141414'); g.fillStyle='#EFEFEF';
      g.beginPath(); g.arc(w*0.5,h*0.42,h*0.2,0,TAU); g.fill(); }
  ],
  bb:[
    (g,w,h)=>{ fFill(g,w,h,'#111');                    // szarvas csontváz és szív
      g.fillStyle='#EFEFEF';
      g.fillRect(w*0.46,h*0.2,w*0.08,h*0.5);
      g.beginPath(); g.arc(w*0.5,h*0.2,h*0.1,0,TAU); g.fill();
      g.fillStyle='#C0392B';
      g.beginPath(); g.arc(w*0.72,h*0.62,h*0.1,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#111'); g.fillStyle='#EFEFEF';
      g.fillRect(w*0.46,h*0.2,w*0.08,h*0.5);
      g.beginPath(); g.arc(w*0.5,h*0.2,h*0.1,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#111'); g.fillStyle='#EFEFEF';
      g.fillRect(w*0.46,h*0.2,w*0.08,h*0.5); },
    (g,w,h)=>{ fFill(g,w,h,'#111'); g.fillStyle='#EFEFEF';
      g.fillRect(w*0.46,h*0.2,w*0.08,h*0.5); }
  ],
  sb:[
    (g,w,h)=>{ fFill(g,w,h,'#131313');                 // koponya, csont, szív, tőr
      g.fillStyle='#EFEFEF';
      g.beginPath(); g.arc(w*0.5,h*0.26,h*0.13,0,TAU); g.fill();
      g.fillRect(w*0.32,h*0.48,w*0.36,h*0.07);
      g.fillRect(w*0.6,h*0.66,w*0.05,h*0.24);
      g.fillStyle='#C0392B';
      g.beginPath(); g.arc(w*0.38,h*0.76,h*0.11,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#131313'); g.fillStyle='#EFEFEF';
      g.beginPath(); g.arc(w*0.5,h*0.3,h*0.14,0,TAU); g.fill();
      g.fillRect(w*0.32,h*0.55,w*0.36,h*0.08); },
    (g,w,h)=>{ fFill(g,w,h,'#131313'); g.fillStyle='#EFEFEF';
      g.beginPath(); g.arc(w*0.5,h*0.35,h*0.16,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#131313'); g.fillStyle='#EFEFEF';
      g.beginPath(); g.arc(w*0.5,h*0.35,h*0.16,0,TAU); g.fill(); }
  ],
  nat:[
    (g,w,h)=>{ fFill(g,w,h,'#5C8A3A');                 // pálmalevél és nap
      g.fillStyle='#C97A3C';
      g.beginPath(); g.arc(w*0.5,h*0.45,h*0.22,0,TAU); g.fill();
      g.strokeStyle='#EFE0B8'; g.lineWidth=Math.max(2,h*0.05);
      for(let i=0;i<6;i++){ const a=i*TAU/6;
        g.beginPath(); g.moveTo(w*0.5,h*0.45);
        g.lineTo(w*0.5+Math.cos(a)*h*0.4, h*0.45+Math.sin(a)*h*0.4); g.stroke(); } },
    (g,w,h)=>{ fFill(g,w,h,'#5C8A3A'); g.fillStyle='#C97A3C';
      g.beginPath(); g.arc(w*0.5,h*0.45,h*0.24,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#5C8A3A'); g.fillStyle='#C97A3C';
      g.beginPath(); g.arc(w*0.5,h*0.45,h*0.24,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#5C8A3A'); g.fillStyle='#C97A3C';
      g.beginPath(); g.arc(w*0.5,h*0.45,h*0.24,0,TAU); g.fill(); }
  ],
  es:[
    /* 1492: Kasztília és Aragónia lobogója.

       KORÁBBAN négyelt címerpajzs volt, világos krémszínű alapon: négy
       apró mezőre esett szét, és a nemzetválasztóban teljesen elütött a
       többitől. A többi nemzet első zászlaja EGY erős, összefüggő minta
       — a spanyol volt az egyetlen kivétel.

       Most a saját színeit viszi, de a többiek nyelvén: telített vörös
       mező, benne egyetlen nagy kasztíliai vár. A négyeltség jelzésként
       marad meg — egy sárga sáv formájában —, nem szerkezetként. */
    (g,w,h)=>{ fFill(g,w,h,'#AA151B');
      g.fillStyle='#F1BF00';                                   // aragóniai sáv
      g.fillRect(0,h*0.72,w,h*0.28);
      g.fillStyle='#F1BF00';                                   // kasztíliai vár
      g.fillRect(w*0.3,h*0.3,w*0.4,h*0.26);
      g.fillRect(w*0.3,h*0.16,w*0.09,h*0.16);                  // három torony
      g.fillRect(w*0.455,h*0.12,w*0.09,h*0.2);
      g.fillRect(w*0.61,h*0.16,w*0.09,h*0.16);
      g.fillStyle='#AA151B';                                   // kapunyílás
      g.fillRect(w*0.47,h*0.42,w*0.06,h*0.14); },
    // 16. sz.: a burgundi kereszt (Szent András-kereszt) fehér mezőben
    (g,w,h)=>{ fFill(g,w,h,'#F2EEE2');
      g.strokeStyle='#AA151B'; g.lineWidth=Math.max(3,h*0.13);
      g.beginPath(); g.moveTo(w*0.14,h*0.14); g.lineTo(w*0.86,h*0.86);
      g.moveTo(w*0.86,h*0.14); g.lineTo(w*0.14,h*0.86); g.stroke(); },
    // 1785-től: a máig ismert vörös-sárga-vörös
    (g,w,h)=>{ fFill(g,w,h,'#F1BF00');
      g.fillStyle='#AA151B';
      g.fillRect(0,0,w,h*0.25); g.fillRect(0,h*0.75,w,h*0.25);
      g.fillStyle='#AA151B'; g.globalAlpha=0.85;               // címer helye
      g.fillRect(w*0.28,h*0.36,w*0.1,h*0.28); g.globalAlpha=1; },
    (g,w,h)=>{ fFill(g,w,h,'#F1BF00');
      g.fillStyle='#AA151B';
      g.fillRect(0,0,w,h*0.25); g.fillRect(0,h*0.75,w,h*0.25);
      g.fillStyle='#8a1f26';
      g.fillRect(w*0.3,h*0.34,w*0.12,h*0.32); }
  ],
  hu:[
    (g,w,h)=>{ const c=['#C8102E','#EFEFEF']; for(let i=0;i<8;i++){g.fillStyle=c[i%2];g.fillRect(0,Math.floor(h*i/8),w,Math.ceil(h/8)+1);} }, // Árpád-sávok
    (g,w,h)=>{ fFill(g,w,h,'#B41229');                                                     // kettős kereszt hármas halmon
      g.fillStyle='#F2F2F2';
      g.fillRect(w*0.46,h*0.16,w*0.08,h*0.62);
      g.fillRect(w*0.33,h*0.3,w*0.34,h*0.08);
      g.fillRect(w*0.26,h*0.5,w*0.48,h*0.08);
      g.fillStyle='#1E7A3C';
      g.beginPath(); g.ellipse(w*0.5,h*1.02,w*0.34,h*0.26,0,Math.PI,TAU); g.fill(); },
    (g,w,h)=>fBands(g,w,h,['#C8102E','#FFFFFF','#1E7A3C']),
    (g,w,h)=>fBands(g,w,h,['#C8102E','#FFFFFF','#1E7A3C'])],
  at:[
    (g,w,h)=>{ fFill(g,w,h,'#E3B531'); fEagle(g,w,h,'#1A1A1A',true); },                    // császári sas
    (g,w,h)=>{ fFill(g,w,h,'#E3B531'); fEagle(g,w,h,'#1A1A1A',true);
      g.fillStyle='#B8121B'; g.fillRect(w*0.44,h*0.44,w*0.12,h*0.2);
      g.fillStyle='#FFF'; g.fillRect(w*0.44,h*0.5,w*0.12,h*0.07); },
    (g,w,h)=>fBands(g,w,h,['#B8121B','#FFFFFF','#B8121B']),
    (g,w,h)=>fBands(g,w,h,['#B8121B','#FFFFFF','#B8121B'])],
  pl:[
    (g,w,h)=>{ fFill(g,w,h,'#C7203A'); fEagle(g,w,h,'#F4F4F4',false); },                   // fehér sas
    (g,w,h)=>{ fFill(g,w,h,'#C7203A'); fEagle(g,w,h,'#F4F4F4',false);
      g.fillStyle='#E8C043'; g.fillRect(w*0.42,h*0.1,w*0.16,h*0.07); },
    (g,w,h)=>fBands(g,w,h,['#FFFFFF','#DC143C']),
    (g,w,h)=>fBands(g,w,h,['#FFFFFF','#DC143C'])],
  de:[
    (g,w,h)=>{ fFill(g,w,h,'#E3B531'); fEagle(g,w,h,'#1A1A1A',true); },                    // Német-római Birodalom
    (g,w,h)=>{ fFill(g,w,h,'#F2F2F2'); fEagle(g,w,h,'#1A1A1A',false); },                   // Poroszország
    (g,w,h)=>fBands(g,w,h,['#111111','#FFFFFF','#C8102E']),                                // Német Birodalom
    (g,w,h)=>fBands(g,w,h,['#111111','#C8102E','#E0B400'])],                               // köztársaság
  fr:[
    (g,w,h)=>{ fFill(g,w,h,'#22397F'); fFleur(g,w*0.3,h*0.32,h*0.16,'#E8C043');            // királyi liliomok
      fFleur(g,w*0.7,h*0.32,h*0.16,'#E8C043'); fFleur(g,w*0.5,h*0.72,h*0.16,'#E8C043'); },
    (g,w,h)=>{ fFill(g,w,h,'#22397F'); fFleur(g,w*0.3,h*0.32,h*0.16,'#E8C043');
      fFleur(g,w*0.7,h*0.32,h*0.16,'#E8C043'); fFleur(g,w*0.5,h*0.72,h*0.16,'#E8C043'); },
    (g,w,h)=>fBands(g,w,h,['#2B4C9B','#FFFFFF','#C8102E'],true),
    (g,w,h)=>fBands(g,w,h,['#2B4C9B','#FFFFFF','#C8102E'],true)],
  gb:[
    (g,w,h)=>{ fFill(g,w,h,'#F4F4F4'); fCross(g,w,h,'#C8102E',h*0.2); },                   // Szent György keresztje
    (g,w,h)=>{ fFill(g,w,h,'#0A2B5C'); fSaltire(g,w,h,'#F4F4F4',h*0.26);                   // 1606-os királyi lobogó
      fCross(g,w,h,'#F4F4F4',h*0.32); fCross(g,w,h,'#C8102E',h*0.18); },
    (g,w,h)=>{ fFill(g,w,h,'#0A2B5C'); fSaltire(g,w,h,'#F4F4F4',h*0.3);                    // teljes Union Jack
      fSaltire(g,w,h,'#C8102E',h*0.13);
      fCross(g,w,h,'#F4F4F4',h*0.34); fCross(g,w,h,'#C8102E',h*0.2); },
    (g,w,h)=>{ fFill(g,w,h,'#0A2B5C'); fSaltire(g,w,h,'#F4F4F4',h*0.3);
      fSaltire(g,w,h,'#C8102E',h*0.13);
      fCross(g,w,h,'#F4F4F4',h*0.34); fCross(g,w,h,'#C8102E',h*0.2); }],
  ru:[
    (g,w,h)=>{ fFill(g,w,h,'#8F1D1D');                                                     // moszkvai hadilobogó
      g.fillStyle='#E3C043';
      g.fillRect(w*0.46,h*0.14,w*0.08,h*0.72);
      g.fillRect(w*0.32,h*0.3,w*0.36,h*0.08);
      g.save(); g.translate(w*0.5,h*0.68); g.rotate(-0.32);
      g.fillRect(-w*0.15,-h*0.04,w*0.3,h*0.08); g.restore(); },
    (g,w,h)=>fBands(g,w,h,['#FFFFFF','#2F5FA8','#D62828']),
    (g,w,h)=>fBands(g,w,h,['#FFFFFF','#2F5FA8','#D62828']),
    (g,w,h)=>fBands(g,w,h,['#FFFFFF','#2F5FA8','#D62828'])],

  /* --- KÉSZÜLŐ NEMZETEK ---
     Egyszerű, jól megkülönböztethető lobogók. Négy korszakra egy-egy
     rajzoló kell; ahol a zászló nem változott érdemben, ugyanaz szerepel
     négyszer. A `flagSignature` a négy korszak együttesét nézi, tehát a
     kontraszt így is mérhető marad. */
  se:[
    (g,w,h)=>{ fFill(g,w,h,'#2B5DA8');                       // svéd kereszt
      g.fillStyle='#F5C518';
      g.fillRect(0,h*0.42,w,h*0.16);
      g.fillRect(w*0.28,0,w*0.14,h); },
    (g,w,h)=>{ fFill(g,w,h,'#2B5DA8');
      g.fillStyle='#F5C518';
      g.fillRect(0,h*0.42,w,h*0.16);
      g.fillRect(w*0.28,0,w*0.14,h); },
    (g,w,h)=>{ fFill(g,w,h,'#2B5DA8');
      g.fillStyle='#F5C518';
      g.fillRect(0,h*0.42,w,h*0.16);
      g.fillRect(w*0.28,0,w*0.14,h); },
    (g,w,h)=>{ fFill(g,w,h,'#2B5DA8');
      g.fillStyle='#F5C518';
      g.fillRect(0,h*0.42,w,h*0.16);
      g.fillRect(w*0.28,0,w*0.14,h); }
  ],
  ot:[
    (g,w,h)=>{ fFill(g,w,h,'#1F7A46');                       // félhold zöld mezőn
      g.fillStyle='#F2F2F2';
      g.beginPath(); g.arc(w*0.42,h*0.5,h*0.28,0,TAU); g.fill();
      g.fillStyle='#1F7A46';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.24,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#1F7A46');
      g.fillStyle='#F2F2F2';
      g.beginPath(); g.arc(w*0.42,h*0.5,h*0.28,0,TAU); g.fill();
      g.fillStyle='#1F7A46';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.24,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#E03A2F');                       // vörös mező
      g.fillStyle='#F2F2F2';
      g.beginPath(); g.arc(w*0.42,h*0.5,h*0.28,0,TAU); g.fill();
      g.fillStyle='#E03A2F';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.24,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#E03A2F');
      g.fillStyle='#F2F2F2';
      g.beginPath(); g.arc(w*0.42,h*0.5,h*0.28,0,TAU); g.fill();
      g.fillStyle='#E03A2F';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.24,0,TAU); g.fill(); }
  ],
  jp:[
    (g,w,h)=>{ fFill(g,w,h,'#F2F2F2');                       // napkorong
      g.fillStyle='#BC002D';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.28,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#F2F2F2');
      g.fillStyle='#BC002D';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.28,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#F2F2F2');                       // sugaras lobogó
      g.fillStyle='#BC002D';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.24,0,TAU); g.fill();
      for(let i=0;i<8;i++){ const a=i*TAU/8;
        g.beginPath(); g.moveTo(w*0.5,h*0.5);
        g.lineTo(w*0.5+Math.cos(a-0.12)*w,h*0.5+Math.sin(a-0.12)*w);
        g.lineTo(w*0.5+Math.cos(a+0.12)*w,h*0.5+Math.sin(a+0.12)*w);
        g.closePath(); g.fill(); } },
    (g,w,h)=>{ fFill(g,w,h,'#F2F2F2');
      g.fillStyle='#BC002D';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.28,0,TAU); g.fill(); }
  ],
  cn:[
    (g,w,h)=>{ fFill(g,w,h,'#F0C93C');                       // sárkánysárga
      g.fillStyle='#8A2A24';
      g.beginPath(); g.ellipse(w*0.5,h*0.5,w*0.3,h*0.24,0,0,TAU); g.fill();
      g.fillStyle='#F0C93C';
      g.beginPath(); g.ellipse(w*0.5,h*0.5,w*0.16,h*0.12,0,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#F0C93C');
      g.fillStyle='#8A2A24';
      g.beginPath(); g.ellipse(w*0.5,h*0.5,w*0.3,h*0.24,0,0,TAU); g.fill();
      g.fillStyle='#F0C93C';
      g.beginPath(); g.ellipse(w*0.5,h*0.5,w*0.16,h*0.12,0,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#F0C93C');
      g.fillStyle='#8A2A24';
      g.fillRect(w*0.2,h*0.36,w*0.6,h*0.28); },
    (g,w,h)=>{ fFill(g,w,h,'#C8102E');                       // vörös mező
      g.fillStyle='#F0C93C';
      for(const p of [[0.2,0.3,0.16],[0.38,0.18,0.08],[0.46,0.3,0.08],[0.46,0.46,0.08],[0.38,0.58,0.08]]){
        g.beginPath(); g.arc(w*p[0],h*p[1],h*p[2],0,TAU); g.fill(); } }
  ],
  in:[
    (g,w,h)=>{ fFill(g,w,h,'#FF9933');                       // szultáni zöld-narancs
      g.fillStyle='#138808'; g.fillRect(0,h*0.5,w,h*0.5); },
    (g,w,h)=>{ fFill(g,w,h,'#138808');
      g.fillStyle='#F3C766';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.26,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#FF9933');
      g.fillStyle='#F2F2F2'; g.fillRect(0,h*0.34,w,h*0.32);
      g.fillStyle='#138808'; g.fillRect(0,h*0.66,w,h*0.34); },
    (g,w,h)=>{ fFill(g,w,h,'#FF9933');
      g.fillStyle='#F2F2F2'; g.fillRect(0,h*0.34,w,h*0.32);
      g.fillStyle='#138808'; g.fillRect(0,h*0.66,w,h*0.34);
      g.strokeStyle='#1F3D8A'; g.lineWidth=1.6;
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.12,0,TAU); g.stroke(); }
  ],
  ml:[
    (g,w,h)=>{ fFill(g,w,h,'#CE1126');                       // aranykorong vörösön
      g.fillStyle='#FCD116';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.26,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#CE1126');
      g.fillStyle='#FCD116';
      g.beginPath(); g.arc(w*0.5,h*0.5,h*0.26,0,TAU); g.fill(); },
    (g,w,h)=>{ fFill(g,w,h,'#138808');                       // szongáj zöld
      g.fillStyle='#FCD116'; g.fillRect(w*0.34,0,w*0.32,h); },
    (g,w,h)=>{ fFill(g,w,h,'#138808');
      g.fillStyle='#FCD116'; g.fillRect(w*0.34,0,w*0.32,h);
      g.fillStyle='#CE1126'; g.fillRect(w*0.66,0,w*0.34,h); }
  ]
};

// A zászlókat kis vászonra rajzoljuk, és onnan másoljuk mindenhová
const FLAGCACHE={};
// A magasságot a zászló saját aránya adja: ami a valóságban zömök
// (lengyel 1,4:1), az itt sem lesz nyújtott.
function flagAspect(nation,age){
  const im=flagImage(nation,age);
  return (im&&im.naturalWidth)?(im.naturalWidth/im.naturalHeight):1.6;
}
function flagCanvas(nation,age,w,h){
  if(h===undefined) h=Math.round(w/flagAspect(nation,age));
  const k=nation+age+'_'+w+'x'+h;
  if(FLAGCACHE[k]) return FLAGCACHE[k];
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const g=c.getContext('2d');
  const im=flagImage(nation,age);
  if(im) g.drawImage(im,0,0,w,h);                  // valódi korhű zászló
  else (FLAGS[nation]&&FLAGS[nation][age]?FLAGS[nation][age]:(gg,ww,hh)=>fFill(gg,ww,hh,'#888'))(g,w,h);
  g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=2; g.strokeRect(0,0,w,h);
  FLAGCACHE[k]=c; return c;
}
// Lobogó rajzolása: függőleges csíkokban, hullámzó eltolással
// A lobogás folytonos: sok keskeny csíkból áll, két különböző ütemű
// hullám összegéből, és az árnyék is ugyanabból a görbéből jön. A fázis
// az eltelt időhöz kötött, nem a képkockákhoz, így lassabb gépen sem
// szaggat.
/* A lobogás alapütemére rárakódik a szélmező: ugyanaz a lökés hajtja a
   zászlót, mint a füvet, ezért egyszerre hullámzik az egész táj. */
function flagWave(phase,t,szel){
  const alap=(Math.sin(phase+t*3.6)*0.62 + Math.sin(phase*1.43+t*6.1)*0.38);
  return alap*(0.72+0.5*Math.abs(szel||0)) + (szel||0)*0.22;
}
function drawWavingFlag(x,y,w,h,nation,age,phase,teamCol){
  // a szél a zászló világbeli helyén — a kamera eltolását visszaszámoljuk
  const szel=(typeof windAt==='function')
    ? windAt(x+G.cam.x, y+G.cam.y) : 0;
  const img=flagCanvas(nation,age,96), n=24, sw=w/n, sh=img.width/n;
  h=w*img.height/img.width;                    // arányos magasság, nincs torzítás
  const amp=h*0.26;
  for(let i=0;i<n;i++){
    const t=i/(n-1);
    const wv=flagWave(phase,t,szel);
    const off=wv*amp*t*t*(1.6-t*0.6);          // a rúdnál nyugodt, a végén erős
    const sc=1-Math.abs(wv)*0.07*t;            // a hullámhegy kissé rövidül
    ctx.drawImage(img,i*sh,0,sh,img.height, x+i*sw, y+off, sw+0.7, h*sc);
  }
  // Árnyék a hullámvölgyekben: nem csíkonként, hanem egyetlen összefüggő
  // alakzatként, különben függőleges sávok látszanának.
  ctx.fillStyle='rgba(0,0,0,.15)';
  let run=null;
  const flush=()=>{
    if(!run||run.length<2){ run=null; return; }
    ctx.beginPath();
    for(let k=0;k<run.length;k++) ctx[k?'lineTo':'moveTo'](run[k].x,run[k].yTop);
    for(let k=run.length-1;k>=0;k--) ctx.lineTo(run[k].x,run[k].yBot);
    ctx.closePath(); ctx.fill();
    run=null;
  };
  for(let i=0;i<n;i++){
    const t=i/(n-1), wv=flagWave(phase,t,szel);
    if(wv>=-0.12){ flush(); continue; }
    const off=wv*amp*t*t*(1.6-t*0.6), sc=1-Math.abs(wv)*0.07*t;
    (run||(run=[])).push({x:x+i*sw+sw*0.5, yTop:y+off, yBot:y+off+h*sc});
  }
  flush();
  // Keret nincs: a zászló önmagában áll, ahogy a valóságban is
}
