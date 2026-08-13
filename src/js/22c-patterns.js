/* =======================================================================
   18/C. NEMZETI MINTÁK

   A kezelőfelület paneljei halvány, ismétlődő mintát kapnak a választott
   nemzet szerint: magyar szőlőinda fürttel, osztrák barokk voluta,
   lengyel népi rozetta, német gótikus négykaréj, francia liliom, brit
   Tudor-rózsa, orosz hímzett rombuszsor.

   A minta egyszer készül el egy rejtett vászonra, és adat-URI-ként kerül
   a CSS-be háttérképként. Nagyon halvány: nem olvasni akarjuk, hanem
   érezni, hogy melyik ország panelje előtt ülünk.
   ===================================================================== */
const PAT_CACHE={};

function patMotif(g,nk,S,col){
  g.strokeStyle=col; g.fillStyle=col;
  g.lineCap='round'; g.lineJoin='round';
  const c=S/2;
  if(nk==='hu'){                                   /* szőlőinda és fürt */
    g.lineWidth=2;
    g.beginPath();                                  // kanyargó vessző
    g.moveTo(-S*0.1,c+S*0.24);
    g.bezierCurveTo(S*0.18,c+S*0.02, S*0.3,c+S*0.46, S*0.56,c+S*0.2);
    g.bezierCurveTo(S*0.74,c+S*0.02, S*0.9,c+S*0.3, S*1.1,c+S*0.12);
    g.stroke();
    g.lineWidth=1.4;                                // kacs
    g.beginPath();
    g.arc(S*0.3,c+S*0.06,S*0.05,0.6,4.4); g.stroke();
    // szőlőfürt
    const bx=S*0.6, by=c-S*0.16;
    for(const p of [[0,0],[-6,4],[6,4],[-3,9],[3,9],[0,14],[-9,9],[9,9]]){
      g.beginPath(); g.arc(bx+p[0],by+p[1],3.6,0,TAU); g.fill();
    }
    g.lineWidth=1.6;                                // levél
    g.beginPath();
    g.moveTo(S*0.22,c-S*0.06);
    g.quadraticCurveTo(S*0.1,c-S*0.24, S*0.26,c-S*0.28);
    g.quadraticCurveTo(S*0.4,c-S*0.24, S*0.34,c-S*0.04);
    g.closePath(); g.stroke();
  }
  else if(nk==='at'){                              /* barokk voluta */
    g.lineWidth=2.2;
    for(const s of [1,-1]){
      g.beginPath();
      g.moveTo(c,c+s*S*0.3);
      g.bezierCurveTo(c+s*S*0.3,c+s*S*0.24, c+s*S*0.3,c-s*S*0.06, c+s*S*0.06,c);
      g.stroke();
      g.beginPath(); g.arc(c+s*S*0.12,c-s*S*0.02,S*0.055,0,TAU); g.stroke();
    }
    g.lineWidth=1.4;
    g.beginPath(); g.ellipse(c,c,S*0.06,S*0.16,0,0,TAU); g.stroke();
  }
  else if(nk==='pl'){                              /* népi rozetta */
    g.lineWidth=1.8;
    for(let i=0;i<8;i++){
      const a=i/8*TAU;
      g.beginPath();
      g.moveTo(c+Math.cos(a)*S*0.08,c+Math.sin(a)*S*0.08);
      g.lineTo(c+Math.cos(a)*S*0.3,c+Math.sin(a)*S*0.3);
      g.stroke();
      g.beginPath();
      g.ellipse(c+Math.cos(a)*S*0.22,c+Math.sin(a)*S*0.22,S*0.055,S*0.1,a,0,TAU);
      g.stroke();
    }
    g.beginPath(); g.arc(c,c,S*0.06,0,TAU); g.fill();
  }
  else if(nk==='de'){                              /* gótikus négykaréj */
    g.lineWidth=2;
    for(let i=0;i<4;i++){
      const a=i/4*TAU+Math.PI/4;
      g.beginPath();
      g.arc(c+Math.cos(a)*S*0.13,c+Math.sin(a)*S*0.13,S*0.13,0,TAU);
      g.stroke();
    }
    g.lineWidth=1.3;
    g.beginPath(); g.arc(c,c,S*0.3,0,TAU); g.stroke();
  }
  else if(nk==='fr'){                              /* liliom */
    g.lineWidth=2;
    g.beginPath();
    g.moveTo(c,c-S*0.26);
    g.bezierCurveTo(c+S*0.07,c-S*0.1, c+S*0.05,c+S*0.04, c,c+S*0.12);
    g.bezierCurveTo(c-S*0.05,c+S*0.04, c-S*0.07,c-S*0.1, c,c-S*0.26);
    g.stroke();
    for(const s of [1,-1]){
      g.beginPath();
      g.moveTo(c,c-S*0.02);
      g.bezierCurveTo(c+s*S*0.16,c-S*0.16, c+s*S*0.22,c+S*0.02, c+s*S*0.08,c+S*0.12);
      g.stroke();
    }
    g.lineWidth=2.4;
    g.beginPath(); g.moveTo(c-S*0.13,c+S*0.13); g.lineTo(c+S*0.13,c+S*0.13); g.stroke();
  }
  else if(nk==='gb'){                              /* Tudor-rózsa */
    g.lineWidth=1.8;
    for(let i=0;i<5;i++){
      const a=i/5*TAU-Math.PI/2;
      g.beginPath();
      g.ellipse(c+Math.cos(a)*S*0.15,c+Math.sin(a)*S*0.15,S*0.1,S*0.13,a+Math.PI/2,0,TAU);
      g.stroke();
    }
    for(let i=0;i<5;i++){
      const a=i/5*TAU-Math.PI/2+TAU/10;
      g.beginPath();
      g.ellipse(c+Math.cos(a)*S*0.08,c+Math.sin(a)*S*0.08,S*0.055,S*0.075,a+Math.PI/2,0,TAU);
      g.stroke();
    }
  }
  else{                                            /* orosz hímzett rombusz */
    g.lineWidth=2;
    const d=S*0.22;
    g.beginPath();
    g.moveTo(c,c-d); g.lineTo(c+d,c); g.lineTo(c,c+d); g.lineTo(c-d,c);
    g.closePath(); g.stroke();
    g.lineWidth=1.5;
    for(const s of [[1,1],[1,-1],[-1,1],[-1,-1]]){   // horgok a sarkokon
      g.beginPath();
      g.moveTo(c+s[0]*d,c);
      g.lineTo(c+s[0]*(d+S*0.09),c+s[1]*S*0.09);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(c,c-S*0.09); g.lineTo(c+S*0.09,c); g.lineTo(c,c+S*0.09);
    g.lineTo(c-S*0.09,c); g.closePath(); g.stroke();
  }
}
function natPattern(nk){
  if(PAT_CACHE[nk]) return PAT_CACHE[nk];
  const n=NATIONS[nk];
  if(!n||typeof document==='undefined'||!document.createElement) return 'none';
  const S=128, c=document.createElement('canvas');
  c.width=c.height=S;
  const g=c.getContext('2d');
  if(!g||!c.toDataURL){ PAT_CACHE[nk]='none'; return 'none'; }
  const col=(n.ui&&n.ui.gold)||'#c9a227';
  g.globalAlpha=0.13;                              // épp csak sejlik
  patMotif(g,nk,S,col);
  // a szomszédos csempékbe átlógó ismétlés, hogy ne legyen üres a rács
  g.globalAlpha=0.09;
  for(const d of [[-S/2,-S/2],[S/2,-S/2],[-S/2,S/2],[S/2,S/2]]){
    g.save(); g.translate(d[0],d[1]); patMotif(g,nk,S,col); g.restore();
  }
  let url='none';
  try{ url='url("'+c.toDataURL('image/png')+'")'; }catch(e){}
  PAT_CACHE[nk]=url;
  return url;
}
