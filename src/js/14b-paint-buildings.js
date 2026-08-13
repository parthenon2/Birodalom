/* -----------------------------------------------------------------------
   OROSZ ÉPÍTÉSZET

   Egyetlen hagymakupola kevés: az orosz templomépítészet lényege a
   kupolacsoport — középen sátortető, körülötte eltérő színű és mintájú
   hagymakupolák, alattuk kokosnyik-ívek sora. A Boldog Vazul-székesegyház
   ezt a formanyelvet viszi a végletekig.
   ----------------------------------------------------------------------- */
// Egy hagymakupola dobbal, mintával és kereszttel
function onionDome(cx,baseY,r,hgt,c1,c2,pat,cross){
  // dob (henger a kupola alatt)
  const dh=hgt*0.34;
  GX.fillStyle=shade(c1,-0.5);
  GX.fillRect(cx-r*0.72,baseY-dh,r*1.44,dh+1);
  GX.fillStyle='rgba(255,250,230,.18)';
  GX.fillRect(cx-r*0.72,baseY-dh,r*0.5,dh+1);
  GX.fillStyle='rgba(20,16,10,.55)';                 // dobablakok
  for(let i=-1;i<=1;i++) GX.fillRect(cx+i*r*0.42-1,baseY-dh+2,2,dh-3);
  // hagymatest
  const top=baseY-dh-hgt;
  const bulb=()=>{
    GX.beginPath();
    GX.moveTo(cx-r*0.86,baseY-dh);
    GX.bezierCurveTo(cx-r*1.18,baseY-dh-hgt*0.34, cx-r*0.78,baseY-dh-hgt*0.7, cx,top);
    GX.bezierCurveTo(cx+r*0.78,baseY-dh-hgt*0.7, cx+r*1.18,baseY-dh-hgt*0.34, cx+r*0.86,baseY-dh);
    GX.closePath();
  };
  bulb(); GX.fillStyle=c1; GX.fill();
  GX.save(); bulb(); GX.clip();
  if(pat==='spiral'){                                // csavart sávok
    GX.strokeStyle=c2; GX.lineWidth=r*0.34;
    for(let i=-3;i<=4;i++){
      GX.beginPath();
      GX.moveTo(cx-r*1.6+i*r*0.8, baseY-dh+2);
      GX.lineTo(cx-r*0.4+i*r*0.8, top-2);
      GX.stroke();
    }
  }else if(pat==='chev'){                            // cikkcakk öv
    GX.fillStyle=c2;
    for(let k=0;k<2;k++){
      const y=baseY-dh-hgt*(0.28+k*0.3);
      GX.beginPath();
      for(let i=-4;i<=4;i++){
        const x=cx+i*r*0.32;
        GX[i===-4?'moveTo':'lineTo'](x, y+((i%2)?r*0.2:-r*0.2));
      }
      GX.lineTo(cx+r*1.4,y+r*0.5); GX.lineTo(cx-r*1.4,y+r*0.5);
      GX.closePath(); GX.fill();
    }
  }else if(pat==='facet'){                           // függőleges bordák
    GX.strokeStyle=shade(c1,-0.28); GX.lineWidth=1.1;
    for(let i=-3;i<=3;i++){
      GX.beginPath();
      GX.moveTo(cx+i*r*0.3,baseY-dh);
      GX.quadraticCurveTo(cx+i*r*0.42,baseY-dh-hgt*0.6, cx,top);
      GX.stroke();
    }
  }
  GX.fillStyle='rgba(255,252,235,.3)';               // fénycsillanás
  GX.beginPath(); GX.ellipse(cx-r*0.34,baseY-dh-hgt*0.55,r*0.3,hgt*0.26,0.2,0,TAU); GX.fill();
  GX.restore();
  bulb(); GX.strokeStyle='rgba(30,22,12,.4)'; GX.lineWidth=1; GX.stroke();
  if(cross!==false){                                 // ortodox kereszt
    GX.strokeStyle='#d8a83a'; GX.lineWidth=1.4;
    GX.beginPath();
    GX.moveTo(cx,top); GX.lineTo(cx,top-hgt*0.42);
    GX.moveTo(cx-r*0.34,top-hgt*0.3); GX.lineTo(cx+r*0.34,top-hgt*0.3);
    GX.moveTo(cx-r*0.22,top-hgt*0.12); GX.lineTo(cx+r*0.22,top-hgt*0.18);
    GX.stroke();
  }
}
// Kokosnyik-ívsor: egymás fölé tornyozott félköríves oromzatok
function kokoshnik(x0,y0,ww,n,fill,line){
  for(let k=0;k<2;k++){
    const y=y0-k*5.5, w2=ww*(1-k*0.16), s=w2/n;
    for(let i=0;i<n;i++){
      GX.fillStyle=fill;
      GX.beginPath();
      GX.moveTo(x0+(ww-w2)/2+i*s, y);
      GX.arc(x0+(ww-w2)/2+i*s+s/2, y, s/2, Math.PI, 0);
      GX.closePath(); GX.fill();
      GX.strokeStyle=line; GX.lineWidth=0.9; GX.stroke();
    }
  }
}
function ruOverlay(type,w,h,H,age,st,col,acc,rand){
  const RY=-h/2-H, FY=h/2-H;
  const P=[['#b0303a','#f2ece0','spiral'],          // vörös-fehér csavart
           ['#2f7a52','#d8a83a','chev'],            // zöld-arany cikkcakk
           ['#2a5aa8','#f2ece0','spiral'],          // kék-fehér
           ['#d8a83a','#b8860b','facet'],           // arany bordás
           ['#7a3f96','#f2ece0','chev']];           // lila-fehér
  const ridge=RY+h*0.34;                            // a kupolák a tetőgerincen ülnek
  if(type==='temple'||type==='hq'){
    // középen magas sátortető, tetején kis kupolával
    // középen magas sátortető (sátor), a csúcsán aranykupolával
    const tw=w*0.2, ty=ridge-2, th=42;
    GX.fillStyle=shade(st.roof,-0.12);
    GX.beginPath(); GX.moveTo(0,ty-th); GX.lineTo(tw,ty); GX.lineTo(-tw,ty); GX.closePath(); GX.fill();
    GX.strokeStyle='rgba(0,0,0,.24)'; GX.lineWidth=0.9;
    for(let i=1;i<6;i++){ const t=i/6;
      GX.beginPath(); GX.moveTo(-tw*t,ty-th+th*t); GX.lineTo(tw*t,ty-th+th*t); GX.stroke(); }
    GX.fillStyle='rgba(255,250,228,.18)';
    GX.beginPath(); GX.moveTo(0,ty-th); GX.lineTo(-tw*0.4,ty); GX.lineTo(-tw,ty); GX.closePath(); GX.fill();
    onionDome(0,ty-th+3,5.6,17,P[3][0],P[3][1],P[3][2]);
    // négy nagyobb kupola körülötte, mind más színnel és mintával
    const spots=[[-w*0.37,ridge+6,8.4,0],[w*0.37,ridge+6,8.4,1],
                 [-w*0.2,ridge-2,6.8,2],[w*0.2,ridge-2,6.8,4]];
    for(const sp of spots){
      const p=P[sp[3]];
      onionDome(sp[0],sp[1],sp[2],sp[2]*3.2,p[0],p[1],p[2]);
    }
    kokoshnik(-w*0.46,FY-1,w*0.92,5,shade(st.wall,0.2),'rgba(90,60,30,.4)');
  }else{
    // kisebb épületeken egyetlen kupola és ívsor
    const p=P[(type.length)%P.length];
    onionDome(w*0.2,ridge+4,7.2,23,p[0],p[1],p[2]);
    kokoshnik(-w*0.4,FY-1,w*0.8,4,shade(st.wall,0.2),'rgba(90,60,30,.4)');
  }
  // faragott ablakkeretek (nalicsnyik)
  GX.strokeStyle=st.trim||'#d3a83c'; GX.lineWidth=1.3;
  for(const dx of [-w*0.3,w*0.3]){
    GX.strokeRect(dx-6.5,FY+H*0.3,13,H*0.38);
    GX.beginPath();
    GX.moveTo(dx-8.5,FY+H*0.3); GX.lineTo(dx,FY+H*0.3-5.5); GX.lineTo(dx+8.5,FY+H*0.3);
    GX.stroke();
  }
}
/* =======================================================================
   NEMZETI ÉPÍTÉSZETI RÉTEG

   A színek önmagukban kevesek voltak: az épületek formáját is meg kell
   különböztetni. Ez a réteg a kész épületre kerül rá, és minden nemzetnek
   más karaktert ad — magyar árkádsor, osztrák barokk oromzat, lengyel
   lépcsős oromfal, német favázas homlokzat, francia manzárdtető
   tetőablakokkal, brit pártázat és téglakémény, orosz hagymakupola.

   A 20. századi beton- és acélépületeken ezek az elemek anakronizmusok
   volnának, ezért ott csak halvány jelzés marad.
   ======================================================================= */
function natOverlay(type,w,h,H,age,owner,rand){
  if(type==='wall'||type==='farm'||type==='tower'||type==='gate'||type==='airfield') return;
  const nk=(typeof nationOf==='function')?nationOf(owner):(owner?(G.ai&&G.ai.nation||'de'):G.nation);
  const st=stFor(age,owner), acc=ownerAccent(owner), col=ownerColor(owner);
  /* A toronysisak formája az ÉPÜLET tulajdonosának nemzetéből jön, nem a
     helyi játékoséból — enélkül a hódított városok is a te tetőidet
     viselnék. A rajzolás végén visszaállítjuk. */
  if(typeof toronySisakNemzet==='function') toronySisakNemzet(nk);
  const RY=-h/2-H, FY=h/2-H;                        // tetőgerinc és homlokzat teteje
  const A=(age===3)?0.34:1;                         // modern korban visszafogva
  GX.save();
  GX.globalAlpha=A;

  if(nk==='hu'){                                    /* --- árkádsor és tetőgerinc-dísz --- */
    const n=4, aw=w*0.74/n;
    for(let i=0;i<n;i++){
      const x=-w*0.37+i*aw+aw/2, r=aw*0.33, top=FY+H*0.34, bot=FY+H*0.68;
      GX.fillStyle='rgba(40,28,16,.32)';            // mélyített árkádív
      GX.beginPath();
      GX.moveTo(x-r,bot); GX.lineTo(x-r,top);
      GX.arc(x,top,r,Math.PI,0); GX.lineTo(x+r,bot);
      GX.closePath(); GX.fill();
      GX.strokeStyle=shade(st.wall,0.34); GX.lineWidth=1.8;   // vakolt ívkeret
      GX.stroke();
      GX.fillStyle=shade(st.wall,0.2);              // pillérek
      GX.fillRect(x-r-1.6,top,3.2,bot-top);
      GX.fillRect(x+r-1.6,top,3.2,bot-top);
    }

    GX.fillStyle=st.trim||'#c9a227';                // gerincdísz
    for(let x=-w/2+4;x<w/2-4;x+=9){
      GX.beginPath(); GX.moveTo(x,RY-1); GX.lineTo(x+4,RY-6); GX.lineTo(x+8,RY-1); GX.closePath(); GX.fill();
    }
  }
  else if(nk==='at'){                               /* --- barokk oromzat --- */
    const pw=w*0.44, py=FY-2;
    GX.fillStyle=shade(st.wall,0.22);
    GX.beginPath();
    GX.moveTo(-pw/2,py); GX.quadraticCurveTo(-pw*0.2,py-13,0,py-13);
    GX.quadraticCurveTo(pw*0.2,py-13,pw/2,py); GX.closePath(); GX.fill();
    GX.strokeStyle=st.trim||'#dcb84e'; GX.lineWidth=1.4; GX.stroke();
    GX.fillStyle=st.trim||'#dcb84e';
    GX.beginPath(); GX.arc(0,py-7,3.2,0,TAU); GX.fill();
    GX.fillStyle=shade(st.wall,0.3);                // pilaszterek
    for(const dx of [-w*0.4,w*0.4]) GX.fillRect(dx-2.4,FY+2,4.8,H-4);
  }
  else if(nk==='pl'){                               /* --- lépcsős oromfal --- */
    const bw=7, step=6;
    for(let i=0;i<4;i++){
      const yTop=RY+2-i*4, hh=(4-i)*4+7;
      GX.fillStyle=st.wall;
      GX.fillRect(-w/2-2+i*step, yTop, bw, hh);              // bal oromlépcső
      GX.fillRect( w/2+2-bw-i*step, yTop, bw, hh);           // jobb, tükrözve
      GX.fillStyle=shade(st.wall,0.22);                      // felső kőlap
      GX.fillRect(-w/2-2+i*step, yTop, bw, 2);
      GX.fillRect( w/2+2-bw-i*step, yTop, bw, 2);
    }
    GX.fillStyle=shade(st.wall,-0.3);
    GX.fillRect(-w/2-2,RY+2,w+4,2);
    GX.fillStyle=st.trim||'#d8cfc0';
    GX.fillRect(-w/2-2,FY-3,w+4,2.4);
  }
  else if(nk==='de'){                               /* --- favázas homlokzat --- */
    GX.strokeStyle='rgba(58,40,24,.75)'; GX.lineWidth=2.2;
    GX.strokeRect(-w/2+2,FY+2,w-4,H-4);
    const n=3, cw=(w-4)/n;
    for(let i=1;i<n;i++){
      const x=-w/2+2+i*cw;
      GX.beginPath(); GX.moveTo(x,FY+2); GX.lineTo(x,FY+H-2); GX.stroke();
    }
    GX.lineWidth=1.8;
    for(let i=0;i<n;i++){
      const x0=-w/2+2+i*cw;
      GX.beginPath();
      GX.moveTo(x0+1,FY+H-3); GX.lineTo(x0+cw-1,FY+3);
      GX.moveTo(x0+1,FY+3);   GX.lineTo(x0+cw-1,FY+H-3);
      GX.stroke();
    }
    GX.strokeStyle='rgba(58,40,24,.6)'; GX.lineWidth=2;
    GX.beginPath(); GX.moveTo(-w/2+2,FY+H*0.52); GX.lineTo(w/2-2,FY+H*0.52); GX.stroke();
  }
  else if(nk==='fr'){                               /* --- manzárdtető tetőablakokkal --- */
    GX.fillStyle=shade(st.roof,-0.22);
    GX.beginPath();
    GX.moveTo(-w/2-5,RY+h*0.42); GX.lineTo(-w/2+1,RY-6);
    GX.lineTo(w/2-1,RY-6); GX.lineTo(w/2+5,RY+h*0.42);
    GX.closePath(); GX.fill();
    GX.fillStyle=shade(st.roof,0.14); GX.fillRect(-w/2+1,RY-8,w-2,3);
    for(const dx of [-w*0.26,0,w*0.26]){            // tetőablakok
      GX.fillStyle=shade(st.wall,0.18); GX.fillRect(dx-4.6,RY+h*0.06,9.2,9);
      GX.fillStyle='#8aa9bd'; GX.fillRect(dx-3,RY+h*0.06+2,6,5.4);
      GX.fillStyle=shade(st.roof,-0.34);
      GX.beginPath(); GX.moveTo(dx-6,RY+h*0.06); GX.lineTo(dx,RY+h*0.06-5);
      GX.lineTo(dx+6,RY+h*0.06); GX.closePath(); GX.fill();
    }
    GX.fillStyle=st.trim||'#c9b06a';                // övpárkány
    GX.fillRect(-w/2,FY+H*0.5,w,1.8);
  }
  else if(nk==='gb'){                               /* --- pártázat és téglakémény --- */
    GX.fillStyle=shade(st.wall,-0.12);
    for(let x=-w/2;x<w/2-3;x+=11){
      GX.fillRect(x,RY-7,6.5,9);
      GX.fillStyle=shade(st.wall,0.16); GX.fillRect(x,RY-7,6.5,2);
      GX.fillStyle=shade(st.wall,-0.12);
    }
    GX.fillStyle=shade(st.wall,-0.28); GX.fillRect(-w/2,RY+1,w,2.6);
    const chx=w*0.3;                                // téglakémény
    GX.fillStyle=shade(st.roof,-0.1); GX.fillRect(chx,RY-19,9,20);
    GX.fillStyle=shade(st.roof,0.16); GX.fillRect(chx,RY-19,3,20);
    GX.fillStyle='#3a3128'; GX.fillRect(chx-1.4,RY-21,11.8,2.6);
    GX.fillStyle='rgba(255,255,255,.5)';            // fehér ablakkeretek
    for(const dx of [-w*0.28,w*0.28]) GX.strokeRect(dx-6,FY+H*0.24,12,H*0.42);
  }
  else if(nk==='ru'){                               /* --- orosz kupolás építészet --- */
    ruOverlay(type,w,h,H,age,st,col,acc,rand);
  }
  else if(nk==='es'){                               /* --- andalúz meszelt fal --- */
    /* Fehérre meszelt vakolat, cserépszínű lábazat és félköríves,
       kovácsoltvas-rácsos ablakok. A déli építészet jellegzetessége,
       hogy a fal maga a dísz: sima, világos felület, kevés nyílással —
       a hőség ellen. */
    texPlaster(-w/2+1,FY+1,w-2,H-2,'#efe6d6',rand);
    GX.fillStyle=shade(st.roof,-0.12);                       // cserép lábazat
    GX.fillRect(-w/2+1,FY+H-6,w-2,5);
    for(const dx of [-w*0.26,w*0.26]){
      const ay=FY+H*0.32, ar=5.4;
      GX.fillStyle='rgba(38,30,22,.62)';                     // mélyített nyílás
      GX.beginPath();
      GX.moveTo(dx-ar,ay+9); GX.lineTo(dx-ar,ay);
      GX.arc(dx,ay,ar,Math.PI,0); GX.lineTo(dx+ar,ay+9);
      GX.closePath(); GX.fill();
      GX.strokeStyle='rgba(60,52,44,.8)'; GX.lineWidth=0.9;  // kovácsoltvas rács
      for(let i=1;i<3;i++){
        GX.beginPath(); GX.moveTo(dx-ar+i*ar*0.66,ay+1); GX.lineTo(dx-ar+i*ar*0.66,ay+9); GX.stroke();
      }
      GX.beginPath(); GX.moveTo(dx-ar,ay+5); GX.lineTo(dx+ar,ay+5); GX.stroke();
      GX.fillStyle=shade(st.wall,0.5);                       // meszelt keret
      GX.fillRect(dx-ar-1.4,ay+9,ar*2+2.8,1.6);
    }
  }
  else if(nk==='ot'){                               /* --- oszmán: csúcsíves nyílások --- */
    /* Meszelt fal, alul kőlábazat, és HEGYES ívű ablakok — ez a
       legjellegzetesebb: a félkörív mediterrán, a csúcsív keleti. */
    texPlaster(-w/2+1,FY+1,w-2,H-2,shade(st.wall,0.24),rand);
    GX.fillStyle=shade(st.wall,-0.3);
    GX.fillRect(-w/2+1,FY+H-7,w-2,6);                        // kőlábazat
    for(const dx of [-w*0.27,w*0.27]){
      const ay=FY+H*0.3, ar=5;
      GX.fillStyle='rgba(34,28,20,.6)';
      GX.beginPath();
      GX.moveTo(dx-ar,ay+10);
      GX.lineTo(dx-ar,ay+1);
      GX.quadraticCurveTo(dx-ar*0.5,ay-5.5,dx,ay-7.5);       // csúcsív bal fele
      GX.quadraticCurveTo(dx+ar*0.5,ay-5.5,dx+ar,ay+1);
      GX.lineTo(dx+ar,ay+10);
      GX.closePath(); GX.fill();
      GX.strokeStyle=st.trim||'#d8b13c'; GX.lineWidth=1;
      GX.stroke();
    }
    GX.fillStyle=st.trim||'#d8b13c';                          // csempesáv a nyílások fölött
    GX.fillRect(-w/2+3,FY+H*0.14,w-6,2.2);
  }
  else if(nk==='jp'||nk==='cn'){                    /* --- fagerendás, papírfalas homlokzat --- */
    /* Világos falmezők, sötét gerendaváz. A japán és a kínai
       építészet itt közös: a szerkezet MUTATJA magát, nem elrejti.
       A kínainál a gerendák vörösek, a japánnál barnák. */
    const gerenda = (nk==='cn') ? '#8a2a24' : '#4a3a2c';
    GX.fillStyle=(nk==='cn')?shade(st.wall,0.2):'#e8e2d4';
    GX.fillRect(-w/2+2,FY+2,w-4,H-4);
    GX.strokeStyle=gerenda; GX.lineWidth=2.4;
    GX.strokeRect(-w/2+2,FY+2,w-4,H-4);                       // keret
    GX.lineWidth=1.8;
    for(let i=1;i<4;i++){                                     // függőleges oszlopok
      const x=-w/2+2+(w-4)*i/4;
      GX.beginPath(); GX.moveTo(x,FY+2); GX.lineTo(x,FY+H-2); GX.stroke();
    }
    GX.beginPath();                                           // vízszintes gerenda
    GX.moveTo(-w/2+2,FY+H*0.42); GX.lineTo(w/2-2,FY+H*0.42); GX.stroke();
    if(nk==='cn'){
      GX.fillStyle=st.trim||'#f0c93c';                        // aranyozott konzolok (tou-kung)
      for(let x=-w*0.34;x<=w*0.34;x+=w*0.17){
        GX.fillRect(x-2,FY+1,4,3.4);
      }
    }else{
      GX.fillStyle='rgba(60,48,36,.35)';                      // sodzsi rácsozat
      for(let x=-w*0.3;x<=w*0.3;x+=5) GX.fillRect(x,FY+H*0.5,0.8,H*0.34);
    }
  }
  else if(nk==='in'){                               /* --- mogul: faragott ívsor --- */
    texPlaster(-w/2+1,FY+1,w-2,H-2,shade(st.wall,0.3),rand);
    const n=3, aw=(w-8)/n;
    for(let i=0;i<n;i++){
      const x=-w/2+4+i*aw+aw/2, ar=aw*0.3;
      const top=FY+H*0.3, bot=FY+H*0.72;
      GX.fillStyle='rgba(40,26,14,.5)';                        // többkaréjos ív
      GX.beginPath();
      GX.moveTo(x-ar,bot); GX.lineTo(x-ar,top+2);
      GX.quadraticCurveTo(x-ar*0.6,top-3,x-ar*0.2,top);
      GX.quadraticCurveTo(x,top-4,x+ar*0.2,top);
      GX.quadraticCurveTo(x+ar*0.6,top-3,x+ar,top+2);
      GX.lineTo(x+ar,bot);
      GX.closePath(); GX.fill();
      GX.strokeStyle=st.trim||'#d86a2a'; GX.lineWidth=1; GX.stroke();
    }
    GX.fillStyle=st.trim||'#d86a2a';                           // párkány
    GX.fillRect(-w/2+2,FY+H*0.16,w-4,2);
  }
  else if(nk==='ml'){                               /* --- szaheli vályogfal --- */
    /* Vastag, lekerekített vályogfal, kiálló pálmagerendákkal. A
       gerendavégek nem díszek: azokon állva vakolják újra a falat
       minden esős évszak után. */
    GX.fillStyle=shade(st.wall,-0.04);
    GX.beginPath();
    GX.moveTo(-w/2+3,FY+H);
    GX.quadraticCurveTo(-w/2+1,FY+2,-w/2+7,FY+2);
    GX.lineTo(w/2-7,FY+2);
    GX.quadraticCurveTo(w/2-1,FY+2,w/2-3,FY+H);
    GX.closePath(); GX.fill();
    GX.fillStyle='rgba(120,84,44,.25)';                        // vályogfoltok
    for(let i=0;i<7;i++){
      const px=-w*0.4+rand()*w*0.8, py=FY+6+rand()*(H-12);
      GX.beginPath(); GX.ellipse(px,py,4+rand()*4,3+rand()*3,0,0,TAU); GX.fill();
    }
    GX.strokeStyle='rgba(66,44,22,.8)'; GX.lineWidth=1.8;      // kiálló gerendavégek
    for(let sor=0;sor<2;sor++){
      const y=FY+H*0.34+sor*H*0.3;
      for(let x=-w*0.34;x<=w*0.34;x+=w*0.17){
        GX.beginPath(); GX.moveTo(x,y); GX.lineTo(x+4.5,y-1.2); GX.stroke();
      }
    }
    GX.fillStyle='rgba(30,20,10,.55)';                         // keskeny ajtó
    GX.fillRect(-3,FY+H-13,6,13);
  }
  else if(nk==='se'){                               /* --- svéd: vörösre festett faház --- */
    /* Falu-vörös deszkaborítás, fehér sarokléccel és ablakkerettel. Ez
       a skandináv faépítészet legismertebb jegye. */
    GX.fillStyle='#8a3f2e';
    GX.fillRect(-w/2+2,FY+2,w-4,H-4);
    GX.strokeStyle='rgba(50,24,16,.5)'; GX.lineWidth=0.9;      // vízszintes deszkák
    for(let y=FY+5;y<FY+H-2;y+=4){
      GX.beginPath(); GX.moveTo(-w/2+2,y); GX.lineTo(w/2-2,y); GX.stroke();
    }
    GX.fillStyle='#efe7d8';                                    // fehér sarokléc
    GX.fillRect(-w/2+2,FY+2,4,H-4);
    GX.fillRect(w/2-6,FY+2,4,H-4);
    for(const dx of [-w*0.22,w*0.22]){                         // fehér keretes ablak
      GX.fillStyle='#efe7d8';
      GX.fillRect(dx-6,FY+H*0.3,12,11);
      rectWindow(dx-4.4,FY+H*0.3+1.4,8.8,8.2,'#8fb0c4','#efe7d8');
    }
  }
  else if(nk==='nat'){                              /* --- pálmalevél és fonott fal --- */
    GX.fillStyle='rgba(122,96,58,.55)';
    GX.fillRect(-w/2+2,FY+2,w-4,H-4);
    GX.strokeStyle='rgba(70,52,30,.5)'; GX.lineWidth=1;      // fonás: rácsos szövet
    for(let x=-w/2+4;x<w/2-2;x+=5){
      GX.beginPath(); GX.moveTo(x,FY+2); GX.lineTo(x,FY+H-2); GX.stroke();
    }
    for(let y=FY+5;y<FY+H-2;y+=5){
      GX.beginPath(); GX.moveTo(-w/2+2,y); GX.lineTo(w/2-2,y); GX.stroke();
    }
    GX.strokeStyle='rgba(50,38,22,.7)'; GX.lineWidth=2.4;    // kötözött sarokoszlopok
    GX.beginPath();
    GX.moveTo(-w/2+3,FY+1); GX.lineTo(-w/2+3,FY+H-1);
    GX.moveTo(w/2-3,FY+1);  GX.lineTo(w/2-3,FY+H-1);
    GX.stroke();
  }
  GX.restore();
}
/* =======================================================================
   Az egyes épületek megrajzolása (sprite-vászonra)
   ===================================================================== */
const PAINT={};

/* ------------------------------ FŐHADISZÁLLÁS ------------------------ */
PAINT.hq=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);

  if(age===0){                    /* --- Kővár saroktornyokkal --- */
    roundTower(-w/2,-h/2+6,H+26,15,st,rand,st.roof,'cone');
    roundTower( w/2,-h/2+6,H+26,15,st,rand,st.roof,'cone');
    // tetőterasz és belső udvar
    texAshlar(-w/2,RY,w,h,shade(st.wall,0.10),rand,16,12);
    roofShade(-w/2,RY,w,h);
    GX.fillStyle='rgba(0,0,0,.22)'; GX.fillRect(-w/2+13,RY+13,w-26,h-26);
    texAshlar(-w/2+16,RY+16,w-32,h-32,shade(st.path,0),rand,9,9);
    battlements(-w/2,RY,w,h,st.wall,rand,7,8);
    // déli homlokzat
    texAshlar(-w/2,FY,w,H,st.wall,rand,15,10);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=shade(st.wall,-0.34); GX.fillRect(-w/2,h/2-8,w,8);   // lábazat
    arrowSlit(-w*0.3,FY+12,13); arrowSlit(w*0.3,FY+12,13);
    arrowSlit(-w*0.3,FY+H*0.6,11); arrowSlit(w*0.3,FY+H*0.6,11);
    woodGate(0,h/2-2,26,H*0.78,st,rand,true);
    GX.strokeStyle='rgba(30,26,20,.55)'; GX.lineWidth=1.2;            // csapórács
    for(let i=-10;i<=10;i+=5){GX.beginPath();GX.moveTo(i,h/2-2);GX.lineTo(i,h/2-2-H*0.6);GX.stroke();}
    roundTower(-w/2,h/2-2,H+26,15,st,rand,st.roof,'cone');
    roundTower( w/2,h/2-2,H+26,15,st,rand,st.roof,'cone');
  }
  else if(age===1){               /* --- Barokk rezidencia manzárdtetővel --- */
    // manzárdtető
    texTiles(-w/2-5,RY-6,w+10,h+8,'#6a5546',rand,7);
    roofShade(-w/2-5,RY-6,w+10,h+8);
    GX.fillStyle='rgba(240,232,210,.28)'; GX.fillRect(-w/2-5,RY+h*0.42,w+10,3);  // gerinc
    GX.strokeStyle='rgba(245,238,215,.24)'; GX.lineWidth=2.2;                    // kontyélek
    GX.beginPath();
    GX.moveTo(-w/2-5,RY-6); GX.lineTo(-w/2+20,RY+h*0.42);
    GX.moveTo(w/2+5,RY-6);  GX.lineTo(w/2-20,RY+h*0.42);
    GX.moveTo(-w/2-5,RY+h+2); GX.lineTo(-w/2+20,RY+h*0.42);
    GX.moveTo(w/2+5,RY+h+2);  GX.lineTo(w/2-20,RY+h*0.42);
    GX.stroke();
    for(const dx of [-w*0.28,0,w*0.28]){                                     // manzárdablakok
      GX.fillStyle=shade(st.roof,-0.3); GX.fillRect(dx-8,RY+2,16,14);
      rectWindow(dx-5,RY+4,10,9,'#8fb0c4','#e8e0cc');
      GX.fillStyle=shade(st.roof,0.2);
      GX.beginPath(); GX.moveTo(dx-10,RY+2); GX.lineTo(dx,RY-5); GX.lineTo(dx+10,RY+2); GX.closePath(); GX.fill();
    }
    for(const dx of [-w*0.42,w*0.42]){                                       // kémények
      GX.fillStyle=shade(st.wall,-0.2); GX.fillRect(dx-5,RY-16,10,20);
      GX.fillStyle=shade(st.wall,0.15); GX.fillRect(dx-6.5,RY-18,13,4);
    }
    // homlokzat
    texPlaster(-w/2,FY,w,H,shade(st.wall,0.3),rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=shade(st.wall,0.42);                                        // armírozott sarkok
    for(let i=0;i<H/9;i++){
      GX.fillRect(-w/2,FY+i*9,7,7.4); GX.fillRect(w/2-7,FY+i*9,7,7.4);
    }
    GX.fillStyle='#efe6cf'; GX.fillRect(-w/2,FY-4,w,5.5);                    // kőpárkány
    GX.fillStyle='rgba(0,0,0,.25)'; GX.fillRect(-w/2,FY+1.5,w,1.6);
    for(let r=0;r<2;r++)                                                     // ablaksorok
      for(const dx of [-w*0.33,-w*0.11,w*0.11,w*0.33])
        archWindow(dx,FY+9+r*(H*0.42),11,H*0.3,'#8aa9bd','#efe6cf');
    // középrizalit oszlopokkal
    GX.fillStyle=shade(st.wall,0.44); GX.fillRect(-19,FY+2,38,H-2);
    GX.fillStyle='rgba(0,0,0,.16)'; GX.fillRect(-19,FY+2,3,H-2);
    for(const cx2 of [-13,-4.5,4.5,13]){
      GX.fillStyle='#efe7d2'; GX.fillRect(cx2-2,h/2-H*0.6,4,H*0.6-6);
      GX.fillStyle='rgba(0,0,0,.22)'; GX.fillRect(cx2+1.2,h/2-H*0.6,1,H*0.6-6);
      GX.fillStyle='#fff8e6'; GX.fillRect(cx2-3,h/2-H*0.62,6,3);
    }
    GX.fillStyle=shade(st.wall,0.5);                                          // oromzat
    GX.beginPath(); GX.moveTo(-21,FY+3); GX.lineTo(0,FY-9); GX.lineTo(21,FY+3); GX.closePath(); GX.fill();
    GX.fillStyle=acc; GX.beginPath(); GX.arc(0,FY-2,4,0,TAU); GX.fill();
    woodGate(0,h/2-3,17,H*0.5,st,rand,true);
    GX.fillStyle='#d8d0bb';                                                   // lépcső
    for(let i=0;i<3;i++) GX.fillRect(-16-i*2,h/2-3+i*2,32+i*4,2.4);
  }
  else if(age===2){               /* --- Ipari kori kormányzati palota --- */
    texTiles(-w/2-4,RY-5,w+8,h+7,st.roof,rand,6);
    roofShade(-w/2-4,RY-5,w+8,h+7);
    GX.fillStyle=shade(st.roof,0.3); GX.fillRect(-w/2-4,RY+h*0.4,w+8,3);
    GX.strokeStyle='rgba(240,236,225,.22)'; GX.lineWidth=2;
    GX.beginPath();
    GX.moveTo(-w/2-4,RY-4); GX.lineTo(-w/2+18,RY+h*0.4);
    GX.moveTo(w/2+4,RY-4); GX.lineTo(w/2-18,RY+h*0.4);
    GX.moveTo(-w/2-4,RY+h+2); GX.lineTo(-w/2+18,RY+h*0.4);
    GX.moveTo(w/2+4,RY+h+2); GX.lineTo(w/2-18,RY+h*0.4);
    GX.stroke();
    for(const dx of [-w*0.36,w*0.36]){                                        // gyárkémények
      GX.fillStyle=shade(st.wall,-0.15); GX.fillRect(dx-6,RY-26,12,30);
      texBrick(dx-6,RY-26,12,30,st.wall,rand);
      GX.fillStyle='rgba(0,0,0,.35)'; GX.fillRect(dx-7,RY-28,14,4);
      GX.fillStyle='rgba(20,18,16,.8)'; GX.fillRect(dx-4,RY-27,8,2);
    }
    GX.fillStyle='#5d6b74';                                                   // üvegtető szakasz
    GX.fillRect(-w*0.2,RY+6,w*0.4,h*0.3);
    GX.fillStyle='rgba(150,190,210,.55)';
    for(let i=0;i<5;i++) GX.fillRect(-w*0.2+2+i*(w*0.4-4)/5,RY+8,(w*0.4-8)/5,h*0.3-4);
    // homlokzat
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='#cfc7b4'; GX.fillRect(-w/2,FY-4,w,5);                       // kőpárkány
    GX.fillStyle='rgba(0,0,0,.22)'; GX.fillRect(-w/2,FY+1,w,1.6);
    GX.fillStyle='#b9b1a0'; GX.fillRect(-w/2,h/2-9,w,9);                      // kőlábazat
    GX.fillStyle='rgba(0,0,0,.2)'; GX.fillRect(-w/2,h/2-9,w,1.5);
    for(let r=0;r<2;r++)
      for(const dx of [-w*0.35,-w*0.2,w*0.2,w*0.35])
        archWindow(dx,FY+8+r*(H*0.4),10,H*0.28,'#7f9fb5','#d8d0bd');
    // középső óratorony
    GX.fillStyle=shade(st.wall,0.1); GX.fillRect(-17,FY-16,34,H+16-9);
    texBrick(-17,FY-16,34,H+7,st.wall,rand);
    GX.fillStyle='#cfc7b4';
    GX.beginPath(); GX.moveTo(-20,FY-16); GX.lineTo(0,FY-28); GX.lineTo(20,FY-16); GX.closePath(); GX.fill();
    GX.fillStyle='#f2ecdc'; GX.beginPath(); GX.arc(0,FY-2,7.5,0,TAU); GX.fill();
    GX.strokeStyle='#2c2a26'; GX.lineWidth=1.3;
    GX.beginPath(); GX.arc(0,FY-2,7.5,0,TAU); GX.stroke();
    GX.beginPath(); GX.moveTo(0,FY-2); GX.lineTo(0,FY-7); GX.moveTo(0,FY-2); GX.lineTo(4,FY-1); GX.stroke();
    GX.fillStyle=col; GX.fillRect(-17,FY-19,34,3.4);
    rectWindow(-6,FY+11,12,H*0.34,'#7f9fb5','#d8d0bd');
    woodGate(0,h/2-4,18,H*0.42,st,rand,false);
    GX.fillStyle='#c9c1b0'; for(let i=0;i<3;i++) GX.fillRect(-15-i*2,h/2-4+i*1.8,30+i*4,2.2);
    GX.fillStyle='#3a4048';                                                   // gázlámpák
    for(const dx of [-w*0.44,w*0.44]){ GX.fillRect(dx-1,h/2-16,2,16);
      GX.fillStyle='#e8dfa8'; GX.beginPath(); GX.arc(dx,h/2-18,3,0,TAU); GX.fill(); GX.fillStyle='#3a4048'; }
  }
  else{                           /* --- Betonerődített főparancsnokság --- */
    texConcrete(-w/2,RY,w,h,shade(st.wall,-0.24),rand);
    roofShade(-w/2,RY,w,h);
    camoBlotches(-w/2,RY,w,h,rand,['#4e5a3e','#3a3f33','#5f5b42']);
    GX.strokeStyle='rgba(18,20,16,.4)'; GX.lineWidth=3;                       // dilatációs hézagok
    GX.beginPath(); GX.moveTo(-w/2,RY+h*0.5); GX.lineTo(w/2,RY+h*0.5);
    GX.moveTo(0,RY); GX.lineTo(0,RY+h); GX.stroke();
    // körbefutó betonmellvéd, alatta vetett árnyék
    GX.fillStyle=shade(st.wall,-0.06);
    GX.fillRect(-w/2,RY,w,8); GX.fillRect(-w/2,RY+h-8,w,8);
    GX.fillRect(-w/2,RY,8,h); GX.fillRect(w/2-8,RY,8,h);
    GX.fillStyle='rgba(255,250,235,.14)'; GX.fillRect(-w/2,RY,w,2);
    GX.fillStyle='rgba(0,0,0,.30)';
    GX.fillRect(-w/2+8,RY+8,w-16,3); GX.fillRect(-w/2+8,RY+8,3,h-16);
    GX.fillStyle='#3f4438';                                                   // szellőzők
    for(const p of [[-w*0.3,RY+20],[w*0.26,RY+h-22]]){
      GX.fillRect(p[0]-6,p[1]-6,12,12);
      GX.fillStyle='#2b2f28'; for(let i=0;i<3;i++) GX.fillRect(p[0]-5,p[1]-4+i*3,10,1.5);
      GX.fillStyle='#3f4438';
    }
    GX.fillStyle='#4a4f42';                                                   // lőszerládák
    for(const q of [[-w*0.06,RY+h*0.34],[w*0.06,RY+h*0.5],[-w*0.14,RY+h*0.52]]){
      GX.fillRect(q[0]-7,q[1]-5,14,10);
      GX.fillStyle='#5a6152'; GX.fillRect(q[0]-6,q[1]-4,12,4);
      GX.fillStyle='rgba(0,0,0,.3)'; GX.fillRect(q[0]-7,q[1]+4,14,2);
      GX.fillStyle='#4a4f42';
    }
    GX.fillStyle='#6d7364';                                                   // fényszóró
    GX.beginPath(); GX.arc(-w*0.28,RY+h*0.62,7,0,TAU); GX.fill();
    GX.fillStyle='#e8e4c8'; GX.beginPath(); GX.arc(-w*0.28,RY+h*0.62,4.6,0,TAU); GX.fill();
    GX.fillStyle='rgba(255,255,255,.35)'; GX.beginPath(); GX.arc(-w*0.29,RY+h*0.61,2,0,TAU); GX.fill();
    GX.fillStyle='#3d4238'; GX.fillRect(-w*0.28-2,RY+h*0.62+6,4,5);
    // rádióárboc
    GX.strokeStyle='#6a6f60'; GX.lineWidth=2;
    GX.beginPath(); GX.moveTo(w*0.34,RY+10); GX.lineTo(w*0.34,RY-34); GX.stroke();
    GX.lineWidth=1;
    GX.beginPath(); GX.moveTo(w*0.34,RY-30); GX.lineTo(w*0.2,RY+8);
    GX.moveTo(w*0.34,RY-30); GX.lineTo(w*0.46,RY+8); GX.stroke();
    GX.fillStyle='#c0392b'; GX.beginPath(); GX.arc(w*0.34,RY-34,2.4,0,TAU); GX.fill();
    // homlokzat
    texConcrete(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    camoBlotches(-w/2,FY,w,H,rand,['#5d6b4a','#474c3d','#6d684c']);
    GX.fillStyle='#1b1e19';                                                   // lőrések acélkerettel
    GX.fillRect(-w*0.36,FY+H*0.26,w*0.28,9); GX.fillRect(w*0.08,FY+H*0.26,w*0.28,9);
    GX.fillStyle='#6a7060';
    GX.fillRect(-w*0.36,FY+H*0.26-2.5,w*0.28,2.5); GX.fillRect(w*0.08,FY+H*0.26-2.5,w*0.28,2.5);
    GX.fillStyle='rgba(255,255,255,.10)';
    GX.fillRect(-w*0.36,FY+H*0.26+9,w*0.28,1.5); GX.fillRect(w*0.08,FY+H*0.26+9,w*0.28,1.5);
    GX.fillStyle=shade(st.wall,-0.3); GX.fillRect(-17,h/2-H*0.72,34,5);       // betonelőtető
    GX.fillStyle='rgba(0,0,0,.35)'; GX.fillRect(-15,h/2-H*0.67,30,4);
    GX.fillStyle='#4a4f45'; GX.fillRect(-11,h/2-H*0.62,22,H*0.62-2);          // acélajtó
    GX.fillStyle='#5c6156'; GX.fillRect(-9,h/2-H*0.6,18,H*0.6-5);
    GX.fillStyle='#33372f'; GX.beginPath(); GX.arc(6,h/2-H*0.3,2,0,TAU); GX.fill();
    GX.fillStyle='rgba(0,0,0,.3)'; GX.fillRect(-w/2,h/2-6,w,6);
    sandbagRing(w,h,H,rand);
  }

  // Nemzeti sáv a lábazaton — minden korszakban
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w/2,h/2-3.5,w,3.5); GX.globalAlpha=1;
};

/* ------------------------------ KASZÁRNYA ---------------------------- */
PAINT.barracks=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);

  if(age===0){                    /* fachwerk csarnok zsúptetővel */
    texThatch(-w/2-6,RY-6,w+12,h+10,'#9a8248',rand);
    roofShade(-w/2-6,RY-6,w+12,h+10);
    GX.fillStyle='#6d5c33'; GX.fillRect(-w/2-6,RY+h*0.42,w+12,4);
    texPlaster(-w/2,FY,w,H,'#d8cba8',rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=st.wood;                                          // favázas szerkezet
    GX.fillRect(-w/2,FY,w,4); GX.fillRect(-w/2,h/2-4,w,4);
    for(const dx of [-w/2,-w*0.18,w*0.18,w/2-4]) GX.fillRect(dx,FY,4,H);
    GX.save(); GX.beginPath(); GX.rect(-w/2,FY,w,H); GX.clip();
    GX.strokeStyle=st.wood; GX.lineWidth=3.4;
    GX.beginPath();
    GX.moveTo(-w*0.44,h/2); GX.lineTo(-w*0.2,FY); GX.moveTo(w*0.2,FY); GX.lineTo(w*0.44,h/2);
    GX.stroke(); GX.restore();
    woodGate(0,h/2-1,18,H*0.7,st,rand,true);
    GX.fillStyle=shade(st.wall,-0.2); GX.fillRect(-w/2,h/2-5,w,5);  // kőlábazat
    texAshlar(-w/2,h/2-5,w,5,st.wall,rand,8,5);
    GX.strokeStyle=st.wood; GX.lineWidth=2;                          // fegyverállvány
    GX.beginPath(); GX.moveTo(w*0.3,h/2+7); GX.lineTo(w*0.3,h/2-2); GX.stroke();
    GX.strokeStyle='#b9bcc0'; GX.lineWidth=1.4;
    for(let i=-2;i<=2;i++){GX.beginPath();GX.moveTo(w*0.3+i*3,h/2+7);GX.lineTo(w*0.3+i*1.5,h/2-4);GX.stroke();}
  }
  else if(age===1){               /* barokk laktanya árkádokkal */
    texTiles(-w/2-4,RY-4,w+8,h+6,st.roof,rand,6);
    roofShade(-w/2-4,RY-4,w+8,h+6);
    GX.fillStyle=shade(st.roof,0.26); GX.fillRect(-w/2-4,RY+h*0.4,w+8,3);
    texPlaster(-w/2,FY,w,H,shade(st.wall,0.28),rand);
    faceShade(-w/2,FY,w,H);
    for(let i=0;i<4;i++) archWindow(-w*0.34+i*(w*0.226),FY+7,10,H*0.5,'#8aa9bd','#efe6cf');
    woodGate(0,h/2-2,16,H*0.46,st,rand,true);
    GX.fillStyle=shade(st.wall,0.1); GX.fillRect(-w/2,h/2-5,w,5);
    GX.fillStyle='#3a3128'; GX.fillRect(-w*0.42,h/2+2,3,-14);        // dobok, zászlórúd talp
    GX.fillStyle='#c9b27a'; GX.beginPath(); GX.ellipse(w*0.36,h/2+4,7,4,0,0,TAU); GX.fill();
    GX.fillStyle=col; GX.fillRect(w*0.36-7,h/2+2,14,3);
  }
  else if(age===2){               /* téglakaszárnya cseréptetővel */
    texTiles(-w/2-4,RY-4,w+8,h+6,st.roof,rand,6);
    roofShade(-w/2-4,RY-4,w+8,h+6);
    GX.fillStyle=shade(st.roof,0.3); GX.fillRect(-w/2-4,RY+h*0.4,w+8,3);
    GX.strokeStyle='rgba(240,236,225,.22)'; GX.lineWidth=2;
    GX.beginPath();
    GX.moveTo(-w/2-4,RY-4); GX.lineTo(-w/2+16,RY+h*0.4);
    GX.moveTo(w/2+4,RY-4); GX.lineTo(w/2-16,RY+h*0.4);
    GX.stroke();
    GX.fillStyle=shade(st.wall,-0.1); GX.fillRect(w*0.3,RY-16,10,22);
    texBrick(w*0.3,RY-16,10,22,st.wall,rand);
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='#cfc7b4'; GX.fillRect(-w/2,FY-3.5,w,4.5);
    GX.fillStyle='#b9b1a0'; GX.fillRect(-w/2,h/2-7,w,7);
    for(let i=0;i<4;i++) rectWindow(-w*0.38+i*(w*0.24),FY+8,11,H*0.42,'#7f9fb5','#d8d0bd');
    woodGate(0,h/2-3,16,H*0.44,st,rand,false);
    GX.fillStyle=col; GX.fillRect(-w*0.5,FY-8,w,4);                  // felirat sáv
  }
  else{                           /* hadigyár hullámlemez csarnokkal */
    const metal='#5d635a';
    GX.fillStyle=metal; GX.fillRect(-w/2-5,RY-5,w+10,h+9);
    clipBox(-w/2-5,RY-5,w+10,h+9,()=>{
      for(let x=-w/2-5,i=0;x<w/2+5;x+=5,i++){                       // trapézlemez bordák
        GX.fillStyle=shade(metal,i%2?0.22:-0.22);
        GX.fillRect(x,RY-5,3.2,h+9);
      }
      GX.fillStyle='rgba(140,190,205,.6)';                          // tetővilágító sáv
      GX.fillRect(-w*0.34,RY+h*0.22,w*0.68,10);
      GX.fillStyle='rgba(255,255,255,.28)'; GX.fillRect(-w*0.34,RY+h*0.22,w*0.68,3);
      GX.fillStyle='rgba(0,0,0,.3)'; GX.fillRect(-w*0.34,RY+h*0.22+10,w*0.68,2.5);
      for(let i=0;i<6;i++){                                         // rozsdafoltok
        GX.fillStyle='rgba(90,60,35,.22)';
        GX.beginPath(); GX.ellipse(-w/2+rand()*w,RY+rand()*h,5+rand()*9,3+rand()*5,0,0,TAU); GX.fill();
      }
    });
    roofShade(-w/2-5,RY-5,w+10,h+9);
    GX.fillStyle=shade(metal,-0.36); GX.fillRect(-w/2-5,RY+h+2,w+10,2.5);   // ereszcsatorna
    GX.fillStyle='#4a4f46'; GX.fillRect(-w*0.4,RY-24,14,27);                // kémény
    GX.fillStyle='#33372f'; GX.fillRect(-w*0.4-2,RY-26,18,4);
    texConcrete(-w/2,FY,w,H,shade(st.wall,-0.14),rand);
    faceShade(-w/2,FY,w,H);
    camoBlotches(-w/2,FY,w,H,rand,['#5d6b4a','#474c3d']);
    GX.fillStyle='#6a7060'; GX.fillRect(-w*0.38,h/2-H*0.9,w*0.76,3.5);      // felső sín
    GX.fillStyle='#23271f'; GX.fillRect(-w*0.36,h/2-H*0.86,w*0.72,H*0.86-3);// tolóajtó
    GX.fillStyle='#3d423a';
    for(let i=0;i<6;i++) GX.fillRect(-w*0.34+i*(w*0.72/6),h/2-H*0.82,w*0.72/6-2.5,H*0.82-6);
    GX.fillStyle='#c9a227';                                                 // figyelmeztető csík
    clipBox(-w*0.36,h/2-9,w*0.72,7,()=>{
      for(let i=0;i<10;i++){GX.save();GX.translate(-w*0.4+i*(w*0.8/10),h/2-5);GX.rotate(-0.6);GX.fillRect(0,-6,4,14);GX.restore();}
    });
    GX.fillStyle='#2f332c';                                                 // olajoshordók
    for(const p of [[w*0.42,h/2+4],[w*0.46,h/2-6]]){
      GX.beginPath(); GX.ellipse(p[0],p[1],5,4,0,0,TAU); GX.fill();
      GX.fillStyle='#8a5a2a'; GX.beginPath(); GX.ellipse(p[0],p[1]-1.5,4.4,3.4,0,0,TAU); GX.fill();
      GX.fillStyle='#2f332c';
    }
  }
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w/2,h/2-3,w,3); GX.globalAlpha=1;
};

/* ------------------------------ KIKÖTŐ ------------------------------- */
PAINT.harbor=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);
  // stég a víz felé (a kép alsó irányába)
  GX.fillStyle='rgba(0,0,0,.22)'; GX.fillRect(-w*0.3,h/2,w*0.6,26);
  texPlank(-w*0.3,h/2,w*0.6,24,st.wood,rand,false);
  GX.fillStyle=shade(st.wood,-0.4);
  for(let x=-w*0.3;x<w*0.3;x+=13) GX.fillRect(x,h/2+22,3.4,7);   // cölöpök
  if(age===0){                     /* Halászkikötő: fabódé, hálószárító */
    texPlank(-w/2,FY,w,H,st.wood,rand,true);
    faceShade(-w/2,FY,w,H);
    texThatch(-w/2-5,RY-5,w+10,h+8,'#9a8248',rand);
    roofShade(-w/2-5,RY-5,w+10,h+8);
    GX.fillStyle=st.wood; GX.fillRect(-w*0.12,h/2-H*0.7,20,H*0.7);
    GX.strokeStyle='#cfc0a0'; GX.lineWidth=1;                      // szárítóháló
    for(let i=0;i<5;i++){
      GX.beginPath(); GX.moveTo(w*0.2,FY+4+i*5); GX.lineTo(w*0.46,FY+9+i*5); GX.stroke();
    }
    GX.fillStyle='#7a5230'; GX.fillRect(w*0.18,FY+2,2.6,H*0.8);
    GX.fillRect(w*0.46,FY+2,2.6,H*0.8);
  }
  else if(age===1){                /* Kikötő: kőrakpart, darugém */
    texAshlar(-w/2,FY,w,H,st.wall,rand,13,9);
    faceShade(-w/2,FY,w,H);
    texTiles(-w/2-4,RY-4,w+8,h+6,st.roof,rand,6);
    roofShade(-w/2-4,RY-4,w+8,h+6);
    GX.strokeStyle='#6b4a2c'; GX.lineWidth=3.4;                    // fadaru
    GX.beginPath(); GX.moveTo(w*0.3,h/2-4); GX.lineTo(w*0.3,RY-14); GX.stroke();
    GX.lineWidth=3;
    GX.beginPath(); GX.moveTo(w*0.3,RY-14); GX.lineTo(w*0.02,RY-24); GX.stroke();
    GX.strokeStyle='#b79a5e'; GX.lineWidth=1.2;
    GX.beginPath(); GX.moveTo(w*0.02,RY-24); GX.lineTo(w*0.02,RY-6); GX.stroke();
    GX.fillStyle='#7a5230'; GX.fillRect(w*0.02-4,RY-6,8,6);
    woodGate(-w*0.14,h/2-3,16,H*0.55,st,rand,true);
  }
  else if(age===2){                /* Kereskedőkikötő: tégla raktár, gőzdaru */
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    texTiles(-w/2-4,RY-4,w+8,h+6,st.roof,rand,6);
    roofShade(-w/2-4,RY-4,w+8,h+6);
    GX.fillStyle='#cfc7b4'; GX.fillRect(-w/2,FY-4,w,5);
    GX.fillStyle='#8fb6c9';
    for(let i=0;i<3;i++) GX.fillRect(-w*0.36+i*(w*0.28),FY+8,w*0.18,H*0.4);
    GX.fillStyle='#4b4b50'; GX.fillRect(w*0.3,RY-18,10,22);        // kémény
    GX.strokeStyle='#5a5f66'; GX.lineWidth=3.6;                    // acéldaru
    GX.beginPath(); GX.moveTo(-w*0.3,h/2-4); GX.lineTo(-w*0.3,RY-20); GX.stroke();
    GX.lineWidth=3;
    GX.beginPath(); GX.moveTo(-w*0.3,RY-20); GX.lineTo(w*0.02,RY-30); GX.stroke();
    GX.strokeStyle='#3a3f46'; GX.lineWidth=1.2;
    GX.beginPath(); GX.moveTo(w*0.02,RY-30); GX.lineTo(w*0.02,RY-8); GX.stroke();
    GX.fillStyle='#6d7268'; GX.fillRect(w*0.02-5,RY-8,10,7);
  }
  else{                            /* Hadikikötő: beton, daruállvány, hajójelzés */
    texConcrete(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    texConcrete(-w/2,RY,w,h,shade(st.wall,-0.12),rand);
    roofShade(-w/2,RY,w,h);
    camoBlotches(-w/2,RY,w,h,rand,['#4e5a3e','#3a3f33']);
    GX.fillStyle=shade(st.wall,-0.04);
    GX.fillRect(-w/2,RY,w,6); GX.fillRect(-w/2,RY+h-6,w,6);
    GX.strokeStyle='#5a6155'; GX.lineWidth=3;                      // darupálya
    GX.beginPath(); GX.moveTo(-w*0.34,h/2-4); GX.lineTo(-w*0.34,RY-24);
    GX.moveTo(w*0.34,h/2-4); GX.lineTo(w*0.34,RY-24);
    GX.moveTo(-w*0.34,RY-24); GX.lineTo(w*0.34,RY-24); GX.stroke();
    GX.fillStyle='#6d7268'; GX.fillRect(-6,RY-30,12,8);
    GX.fillStyle='#1c1f1b'; GX.fillRect(-w*0.3,FY+7,w*0.6,7);
    GX.fillStyle=col; GX.fillRect(-w*0.3,FY-9,w*0.6,4);
  }
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w/2,h/2-3,w,3); GX.globalAlpha=1;
};

/* ------------------------------ TEMPLOM ------------------------------ */
PAINT.temple=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);
  if(age===0){                     /* Kolostor: kőkápolna haranglábbal */
    texTiles(-w/2-4,RY-4,w+8,h+6,st.roof,rand,6);
    roofShade(-w/2-4,RY-4,w+8,h+6);
    GX.fillStyle=shade(st.roof,0.26); GX.fillRect(-w/2-4,RY+h*0.42,w+8,3);
    GX.fillStyle=shade(st.wall,0.08); GX.fillRect(-w*0.12,RY-26,14,30);
    GX.fillStyle=st.roof;
    GX.beginPath(); GX.moveTo(-w*0.12+7,RY-40); GX.lineTo(-w*0.12+15,RY-24);
    GX.lineTo(-w*0.12-1,RY-24); GX.closePath(); GX.fill();
    GX.fillStyle='#c9b27a';
    GX.fillRect(-w*0.12+5.6,RY-50,2.8,11); GX.fillRect(-w*0.12+2.6,RY-46,8.8,2.6);
    GX.fillStyle='#2a2620'; GX.beginPath(); GX.arc(-w*0.12+7,RY-17,3.4,0,TAU); GX.fill();
    texAshlar(-w/2,FY,w,H,st.wall,rand,13,9);
    faceShade(-w/2,FY,w,H);
    for(const dx of [-w*0.3,w*0.3]) archWindow(dx,FY+9,10,H*0.45,'#8aa9bd','#d8cfb4');
    woodGate(0,h/2-2,19,H*0.55,st,rand,true);
    GX.fillStyle=shade(st.wall,-0.3); GX.fillRect(-w/2,h/2-6,w,6);
  }
  else if(age===1){                /* Templom: barokk hagymatorony */
    texTiles(-w/2-5,RY-5,w+10,h+8,'#6a5546',rand,6);
    roofShade(-w/2-5,RY-5,w+10,h+8);
    GX.fillStyle=shade(st.wall,0.28); GX.fillRect(-8,RY-34,16,38);
    GX.fillStyle='#8e9aa4';
    GX.beginPath();
    GX.moveTo(-9,RY-34); GX.quadraticCurveTo(-13,RY-48,0,RY-56);
    GX.quadraticCurveTo(13,RY-48,9,RY-34); GX.closePath(); GX.fill();
    GX.fillStyle='rgba(255,255,255,.22)';
    GX.beginPath(); GX.ellipse(-3.5,RY-45,3.5,6,0.2,0,TAU); GX.fill();
    GX.fillStyle='#c9b27a';
    GX.fillRect(-1.4,RY-70,2.8,13); GX.fillRect(-4.6,RY-66,9.2,2.6);
    GX.fillStyle='#2a2620'; GX.fillRect(-4,RY-28,8,9);
    texPlaster(-w/2,FY,w,H,shade(st.wall,0.32),rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='#efe6cf'; GX.fillRect(-w/2,FY-4,w,5.5);
    for(const dx of [-w*0.3,w*0.3]) archWindow(dx,FY+9,10,H*0.44,'#8aa9bd','#efe6cf');
    woodGate(0,h/2-3,17,H*0.5,st,rand,true);
  }
  else if(age===2){                /* Sajtóház: tégla, nagy ablakok, kémény */
    texTiles(-w/2-4,RY-4,w+8,h+6,st.roof,rand,6);
    roofShade(-w/2-4,RY-4,w+8,h+6);
    GX.fillStyle=shade(st.wall,-0.1); GX.fillRect(-w*0.34,RY-20,11,24);
    texBrick(-w*0.34,RY-20,11,24,st.wall,rand);
    GX.fillStyle='rgba(0,0,0,.35)'; GX.fillRect(-w*0.34-1.5,RY-22,14,4);
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='#cfc7b4'; GX.fillRect(-w/2,FY-4,w,5);
    GX.fillStyle='#b9b1a0'; GX.fillRect(-w/2,h/2-8,w,8);
    GX.fillStyle='#8fb6c9';
    for(let i=0;i<3;i++) GX.fillRect(-w*0.34+i*(w*0.3),FY+9,w*0.2,H*0.4);
    GX.fillStyle=col; GX.fillRect(-w*0.4,FY-11,w*0.8,6);
    GX.fillStyle='#efe6cf';
    for(let i=0;i<5;i++) GX.fillRect(-w*0.36+i*(w*0.14),FY-9.5,w*0.09,3);
    woodGate(0,h/2-4,16,H*0.4,st,rand,false);
  }
  else{                            /* Propagandairoda: beton, transzparens, hangszórók */
    texConcrete(-w/2,RY,w,h,shade(st.wall,-0.14),rand);
    roofShade(-w/2,RY,w,h);
    GX.fillStyle=shade(st.wall,-0.04);
    GX.fillRect(-w/2,RY,w,7); GX.fillRect(-w/2,RY+h-7,w,7);
    GX.fillStyle='#4a4f45'; GX.fillRect(w*0.2-1.5,RY-30,3,34);
    for(const d of [-1,1]){
      GX.fillStyle='#6d7268';
      GX.beginPath();
      GX.moveTo(w*0.2+d*2,RY-26); GX.lineTo(w*0.2+d*13,RY-31);
      GX.lineTo(w*0.2+d*13,RY-19); GX.lineTo(w*0.2+d*2,RY-22); GX.closePath(); GX.fill();
    }
    texConcrete(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=col; GX.fillRect(-w*0.44,FY+6,w*0.88,H*0.36);
    GX.fillStyle='rgba(255,255,255,.85)';
    for(let i=0;i<6;i++) GX.fillRect(-w*0.4+i*(w*0.14),FY+6+H*0.14,w*0.09,3.2);
    GX.fillStyle='rgba(0,0,0,.25)'; GX.fillRect(-w*0.44,FY+6+H*0.36,w*0.88,3);
    GX.fillStyle='#4a4f45'; GX.fillRect(-11,h/2-H*0.44,22,H*0.44-2);
    GX.fillStyle='#5c6156'; GX.fillRect(-9,h/2-H*0.42,18,H*0.42-5);
  }
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w/2,h/2-3,w,3); GX.globalAlpha=1;
};

/* ------------------------------ AKADÉMIA ----------------------------- */
PAINT.academy=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);
  if(age===0){                     /* Akadémia: kolostorszerű, zsindelytetővel */
    texTiles(-w/2-5,RY-5,w+10,h+8,st.roof,rand,6);
    roofShade(-w/2-5,RY-5,w+10,h+8);
    GX.fillStyle=shade(st.roof,0.26); GX.fillRect(-w/2-5,RY+h*0.4,w+10,3);
    GX.fillStyle=shade(st.wall,0.1); GX.fillRect(w*0.28,RY-18,12,22);   // harangtorony
    GX.fillStyle=st.roof;
    GX.beginPath(); GX.moveTo(w*0.34,RY-30); GX.lineTo(w*0.28+13,RY-16); GX.lineTo(w*0.28-1,RY-16); GX.closePath(); GX.fill();
    GX.fillStyle='#c9a227'; GX.beginPath(); GX.arc(w*0.34,RY-20,3,0,TAU); GX.fill();
    texAshlar(-w/2,FY,w,H,st.wall,rand,13,9);
    faceShade(-w/2,FY,w,H);
    for(let i=0;i<4;i++) archWindow(-w*0.33+i*(w*0.22),FY+8,9,H*0.5,'#8aa9bd','#d8cfb4');
    woodGate(0,h/2-2,18,H*0.5,st,rand,true);
    GX.fillStyle=shade(st.wall,-0.3); GX.fillRect(-w/2,h/2-6,w,6);
  }
  else if(age===1){                /* Akadémia: barokk homlokzat kupolával */
    texTiles(-w/2-5,RY-5,w+10,h+8,'#6a5546',rand,6);
    roofShade(-w/2-5,RY-5,w+10,h+8);
    GX.fillStyle='#8e9aa4';                                            // kupola
    GX.beginPath(); GX.ellipse(0,RY+h*0.34,17,15,0,Math.PI,TAU); GX.fill();
    GX.fillStyle='rgba(255,255,255,.22)';
    GX.beginPath(); GX.ellipse(-5,RY+h*0.3,8,7,0,Math.PI,TAU); GX.fill();
    GX.fillStyle='#c9a227'; GX.fillRect(-1.5,RY+h*0.34-24,3,10);
    GX.beginPath(); GX.arc(0,RY+h*0.34-25,3,0,TAU); GX.fill();
    texPlaster(-w/2,FY,w,H,shade(st.wall,0.3),rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='#efe6cf'; GX.fillRect(-w/2,FY-4,w,5.5);
    for(let i=0;i<4;i++) archWindow(-w*0.33+i*(w*0.22),FY+9,10,H*0.46,'#8aa9bd','#efe6cf');
    for(const cx2 of [-11,11]){                                         // oszlopok
      GX.fillStyle='#efe7d2'; GX.fillRect(cx2-2.4,h/2-H*0.55,4.8,H*0.55-5);
      GX.fillStyle='#fff8e6'; GX.fillRect(cx2-3.4,h/2-H*0.57,6.8,3);
    }
    woodGate(0,h/2-3,15,H*0.45,st,rand,true);
  }
  else if(age===2){                /* Politechnikum: tégla, csillagvizsgáló kupola */
    texTiles(-w/2-4,RY-4,w+8,h+6,st.roof,rand,6);
    roofShade(-w/2-4,RY-4,w+8,h+6);
    GX.fillStyle='#7d848c';
    GX.beginPath(); GX.ellipse(w*0.24,RY+h*0.3,14,12,0,Math.PI,TAU); GX.fill();
    GX.fillStyle='#2b2f33'; GX.fillRect(w*0.24-2,RY+h*0.3-13,4,13);     // távcsőrés
    GX.fillStyle='rgba(255,255,255,.18)';
    GX.beginPath(); GX.ellipse(w*0.19,RY+h*0.27,6,5,0,Math.PI,TAU); GX.fill();
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='#cfc7b4'; GX.fillRect(-w/2,FY-4,w,5);
    GX.fillStyle='#b9b1a0'; GX.fillRect(-w/2,h/2-8,w,8);
    for(let i=0;i<4;i++) archWindow(-w*0.33+i*(w*0.22),FY+9,10,H*0.46,'#7f9fb5','#d8d0bd');
    woodGate(0,h/2-4,16,H*0.42,st,rand,false);
    GX.fillStyle=col; GX.fillRect(-w*0.5,FY-9,w,4);
  }
  else{                            /* Kutatóintézet: beton, parabolaantenna */
    texConcrete(-w/2,RY,w,h,shade(st.wall,-0.12),rand);
    roofShade(-w/2,RY,w,h);
    GX.fillStyle=shade(st.wall,-0.04);
    GX.fillRect(-w/2,RY,w,7); GX.fillRect(-w/2,RY+h-7,w,7);
    GX.fillRect(-w/2,RY,7,h); GX.fillRect(w/2-7,RY,7,h);
    GX.fillStyle='#c8ccd2';                                             // parabolaantenna
    GX.beginPath(); GX.ellipse(w*0.2,RY+h*0.42,15,11,-0.35,0,TAU); GX.fill();
    GX.fillStyle='#9aa1a8';
    GX.beginPath(); GX.ellipse(w*0.2,RY+h*0.42,10,7,-0.35,0,TAU); GX.fill();
    GX.strokeStyle='#5a6058'; GX.lineWidth=2;
    GX.beginPath(); GX.moveTo(w*0.2,RY+h*0.42); GX.lineTo(w*0.1,RY+h*0.7); GX.stroke();
    GX.fillStyle='#3f4438'; GX.fillRect(-w*0.32,RY+h*0.55,14,11);       // gépház
    texConcrete(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='#7f9fb5';                                             // üvegsáv
    GX.fillRect(-w*0.38,FY+7,w*0.76,H*0.34);
    GX.fillStyle='rgba(255,255,255,.22)'; GX.fillRect(-w*0.38,FY+7,w*0.76,3);
    GX.fillStyle='#2b2f28';
    for(let i=1;i<5;i++) GX.fillRect(-w*0.38+i*(w*0.76/5),FY+7,2,H*0.34);
    GX.fillStyle='#4a4f45'; GX.fillRect(-11,h/2-H*0.5,22,H*0.5-2);
    GX.fillStyle='#5c6156'; GX.fillRect(-9,h/2-H*0.48,18,H*0.48-5);
  }
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w/2,h/2-3,w,3); GX.globalAlpha=1;
};

/* ------------------------------ MAJORSÁG ----------------------------- */
PAINT.farm=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner);
  groundShadow(w,h,6);
  // szántott tábla
  const soil=age<2?'#6b5533':'#71603c';
  GX.fillStyle=soil; GX.fillRect(-w/2,-h/2,w,h);
  clipBox(-w/2,-h/2,w,h,()=>{
    for(let y=-h/2+2;y<h/2;y+=5){
      GX.fillStyle=shade(soil,-0.2); GX.fillRect(-w/2,y,w,2.4);
      GX.fillStyle=shade(soil,0.14); GX.fillRect(-w/2,y+2.4,w,1.2);
    }
    const crop=age<2?'#a8933f':(age===2?'#b7a24a':'#c2b055');
    for(let y=-h/2+3;y<h/2-2;y+=5){
      for(let x=-w/2+2;x<w/2-2;x+=3.4){
        GX.fillStyle=shade(crop,(rand()-0.5)*0.3);
        GX.fillRect(x,y-1.5+rand()*1.2,2.2,3.2);
      }
    }
    GX.fillStyle='rgba(0,0,0,.12)';
    GX.fillRect(-w/2,-h/2,w,3); GX.fillRect(-w/2,-h/2,3,h);
  });
  // kerítés
  GX.strokeStyle='#6b5533'; GX.lineWidth=1.4;
  GX.strokeRect(-w/2+1,-h/2+1,w-2,h-2);
  GX.fillStyle='#7a6339';
  for(let x=-w/2;x<=w/2;x+=9){GX.fillRect(x-1,-h/2-1.5,2,4);GX.fillRect(x-1,h/2-2.5,2,4);}

  // pajta a sarokban
  const bx=w/2-16, by=-h/2+2, bw=24, bh=18;
  GX.fillStyle='rgba(12,20,10,.3)'; GX.fillRect(bx-bw/2+5,by+bh/2-3,bw,7);
  if(age===0){
    texPlaster(bx-bw/2,by,bw,bh*0.8,'#d8cba8',rand);
    GX.fillStyle=st.wood; GX.fillRect(bx-bw/2,by,bw,3);
    texThatch(bx-bw/2-3,by-14,bw+6,16,'#9a8248',rand);
  }else if(age===1){
    texPlank(bx-bw/2,by,bw,bh*0.8,st.wood,rand,true);
    texTiles(bx-bw/2-3,by-14,bw+6,16,st.roof,rand,5);
  }else if(age===2){
    texBrick(bx-bw/2,by,bw,bh*0.8,st.wall,rand);
    texTiles(bx-bw/2-3,by-13,bw+6,15,st.roof,rand,5);
    GX.fillStyle='#4b4b50'; GX.fillRect(bx+6,by-24,6,12);     // gőzcséplő kéménye
  }else{
    GX.fillStyle='#8d9187'; GX.fillRect(bx-bw/2,by,bw,bh*0.8);
    texConcrete(bx-bw/2,by,bw,bh*0.8,'#8d9187',rand);
    GX.fillStyle='#6d7268'; GX.fillRect(bx-bw/2-3,by-12,bw+6,13);
    GX.fillStyle='#9aa0a6';                                    // siló
    GX.beginPath(); GX.ellipse(bx-bw/2-9,by+4,6,10,0,0,TAU); GX.fill();
    GX.fillStyle='#b6bcc2'; GX.beginPath(); GX.ellipse(bx-bw/2-9,by-6,6,3,0,0,TAU); GX.fill();
  }
  GX.fillStyle=shade('#2b2620',0.1); GX.fillRect(bx-5,by+bh*0.4,9,bh*0.4);

  // szénaboglya vagy traktor
  if(age<2){
    GX.fillStyle='#c2a94e';
    GX.beginPath(); GX.ellipse(-w/2+13,h/2-11,9,7,0,0,TAU); GX.fill();
    GX.fillStyle='#a8913c';
    GX.beginPath(); GX.ellipse(-w/2+13,h/2-9,9,4,0,0,TAU); GX.fill();
  }else{
    const tx=-w/2+14, ty=h/2-11;
    GX.fillStyle='#7a2d2d'; GX.fillRect(tx-8,ty-5,16,8);
    GX.fillStyle='#5f2323'; GX.fillRect(tx-2,ty-9,8,5);
    GX.fillStyle='#2b2b2b';
    GX.beginPath(); GX.arc(tx-5,ty+3,4,0,TAU); GX.arc(tx+6,ty+3,5.5,0,TAU); GX.fill();
    GX.fillStyle='#6d6d6d';
    GX.beginPath(); GX.arc(tx-5,ty+3,1.6,0,TAU); GX.arc(tx+6,ty+3,2.2,0,TAU); GX.fill();
  }
  GX.fillStyle=col; GX.globalAlpha=.85; GX.fillRect(-w/2,h/2-2.5,w,2.5); GX.globalAlpha=1;
};

/* ------------------------------ TORONY / ERŐD ------------------------ */
PAINT.tower=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  groundShadow(w,h,H);
  if(age===0){                    /* --- Nyolcszögű őrtorony a felküldött rajz nyomán ---
       Magas kőtest saroknapokkal, kiugró faerkély zsindelytetővel, csúcsíves
       ablakok, gyámköves párkány, fölötte meredek zsindelykúp szélkakassal.
       A tövében sziklás halom, ahogy az illusztráción. */
    const R=w*0.30;                       // a torony sugara
    const base=h/2-6, top=base-H;         // talp és a kőtest teteje
    // --- sziklás halom a torony körül ---
    GX.fillStyle='rgba(70,84,46,.5)';
    GX.beginPath(); GX.ellipse(0,base+3,w*0.62,h*0.34,0,0,TAU); GX.fill();
    GX.fillStyle=shade(st.wall,-0.34);
    for(let i=0;i<7;i++){
      const a2=rand()*TAU, d=w*(0.3+rand()*0.3);
      GX.beginPath();
      GX.ellipse(Math.cos(a2)*d,base+2+Math.sin(a2)*h*0.16,3+rand()*4,2+rand()*2.6,rand(),0,TAU);
      GX.fill();
    }
    GX.fillStyle='rgba(96,120,58,.75)';   // fűcsomók
    for(let i=0;i<9;i++){
      const x=-w*0.55+rand()*w*1.1, y=base+1+rand()*6;
      GX.beginPath(); GX.moveTo(x,y); GX.lineTo(x+1.4,y-5-rand()*3); GX.lineTo(x+3,y);
      GX.closePath(); GX.fill();
    }
    // --- kőtest: nyolcszögű, ezért oldalanként más árnyalat ---
    texAshlar(-R,top,R*2,base-top,st.wall,rand,11,8);
    GX.fillStyle='rgba(255,250,228,.16)'; GX.fillRect(-R,top,R*0.7,base-top);
    GX.fillStyle='rgba(0,0,0,.24)';       GX.fillRect(R*0.32,top,R*0.68,base-top);
    GX.strokeStyle='rgba(0,0,0,.3)'; GX.lineWidth=1;
    GX.beginPath(); GX.moveTo(-R*0.34,top); GX.lineTo(-R*0.34,base);
    GX.moveTo(R*0.34,top); GX.lineTo(R*0.34,base); GX.stroke();
    // saroknapok (armírozás)
    GX.fillStyle=shade(st.wall,0.2);
    for(let y=top+4;y<base-3;y+=9){
      GX.fillRect(-R-1.5,y,4.5,6); GX.fillRect(R-3,y+4,4.5,6);
    }
    // --- csúcsíves ablakok két szinten ---
    const goth=(x,y,ww,hh)=>{
      GX.fillStyle='rgba(20,24,30,.85)';
      GX.beginPath();
      GX.moveTo(x-ww/2,y+hh); GX.lineTo(x-ww/2,y+ww*0.5);
      GX.lineTo(x,y); GX.lineTo(x+ww/2,y+ww*0.5); GX.lineTo(x+ww/2,y+hh);
      GX.closePath(); GX.fill();
      GX.strokeStyle=shade(st.wall,0.26); GX.lineWidth=1.4; GX.stroke();
      GX.fillStyle='rgba(150,180,205,.5)';
      GX.fillRect(x-ww*0.2,y+ww*0.6,ww*0.4,hh*0.4);
    };
    goth(-R*0.4,top+9,7,11);
    goth( R*0.42,top+24,6.5,10);
    goth(-R*0.36,top+30,6.5,10);
    // --- kiugró faerkély a jobb oldalon, saját kis tetővel ---
    const by=top+16;
    GX.fillStyle=shade(st.wood,-0.35);                 // konzolgerendák
    for(let i=0;i<3;i++) GX.fillRect(R-1,by+7+i*2.4,7,2);
    texPlank(R-2,by+2,13,7,st.wood,rand,true);         // padló
    GX.strokeStyle=shade(st.wood,-0.2); GX.lineWidth=1.3;
    for(let i=0;i<4;i++){                              // korlátoszlopok
      GX.beginPath(); GX.moveTo(R-1+i*3.6,by+2); GX.lineTo(R-1+i*3.6,by-4); GX.stroke();
    }
    GX.fillStyle=shade(st.roof,-0.1);                  // erkélytető
    GX.beginPath(); GX.moveTo(R-4,by-4); GX.lineTo(R+12,by-4); GX.lineTo(R+9,by-9);
    GX.lineTo(R-2,by-9); GX.closePath(); GX.fill();
    // --- gyámköves párkány a kőtest tetején ---
    GX.fillStyle=shade(st.wall,-0.22);
    for(let x=-R-2;x<R+1;x+=5) GX.fillRect(x,top-4,4,4);
    GX.fillStyle=shade(st.wall,0.14); GX.fillRect(-R-3.5,top-7,R*2+7,4);
    GX.fillStyle='rgba(0,0,0,.25)';    GX.fillRect(-R-3.5,top-3.6,R*2+7,1.6);
    // --- meredek zsindelykúp ---
    const apex=top-9-H*0.62, rb=R+4.5, rt=top-7;
    GX.fillStyle=shade(st.roof,-0.06);
    GX.beginPath(); GX.moveTo(0,apex); GX.lineTo(rb,rt); GX.lineTo(-rb,rt); GX.closePath(); GX.fill();
    GX.save();                                          // zsindelysorok
    GX.beginPath(); GX.moveTo(0,apex); GX.lineTo(rb,rt); GX.lineTo(-rb,rt); GX.closePath(); GX.clip();
    GX.strokeStyle='rgba(0,0,0,.26)'; GX.lineWidth=1;
    for(let y=rt;y>apex;y-=4.5){
      GX.beginPath(); GX.moveTo(-rb,y); GX.lineTo(rb,y); GX.stroke();
    }
    GX.fillStyle='rgba(255,250,228,.17)';
    GX.beginPath(); GX.moveTo(0,apex); GX.lineTo(-rb*0.42,rt); GX.lineTo(-rb,rt); GX.closePath(); GX.fill();
    GX.restore();
    GX.strokeStyle='rgba(0,0,0,.3)'; GX.lineWidth=1.2;  // gerincélek
    GX.beginPath(); GX.moveTo(0,apex); GX.lineTo(-rb*0.42,rt);
    GX.moveTo(0,apex); GX.lineTo(rb*0.42,rt); GX.stroke();
    // --- szélkakas a csúcson ---
    GX.strokeStyle='#5a5f55'; GX.lineWidth=1.4;
    GX.beginPath(); GX.moveTo(0,apex); GX.lineTo(0,apex-11); GX.stroke();
    GX.beginPath(); GX.moveTo(-4,apex-8); GX.lineTo(4,apex-8);
    GX.moveTo(0,apex-4); GX.lineTo(0,apex-12); GX.stroke();
    GX.fillStyle='#5a5f55';
    GX.beginPath(); GX.moveTo(0.5,apex-13.5); GX.lineTo(6,apex-11.5); GX.lineTo(0.5,apex-9.5);
    GX.closePath(); GX.fill();
    // --- boltíves kapu vasalt ajtóval ---
    const dw=10, dy=base-15;
    GX.fillStyle=shade(st.wall,0.22);
    GX.beginPath();
    GX.moveTo(-dw/2-2,base); GX.lineTo(-dw/2-2,dy+3);
    GX.lineTo(0,dy-3); GX.lineTo(dw/2+2,dy+3); GX.lineTo(dw/2+2,base);
    GX.closePath(); GX.fill();
    GX.fillStyle=shade(st.wood,-0.15);
    GX.beginPath();
    GX.moveTo(-dw/2,base); GX.lineTo(-dw/2,dy+4);
    GX.lineTo(0,dy-1); GX.lineTo(dw/2,dy+4); GX.lineTo(dw/2,base);
    GX.closePath(); GX.fill();
    GX.strokeStyle='rgba(0,0,0,.32)'; GX.lineWidth=0.8;
    for(let x=-dw/2+2.5;x<dw/2;x+=2.5){
      GX.beginPath(); GX.moveTo(x,dy+3); GX.lineTo(x,base); GX.stroke();
    }
    GX.fillStyle='#3a332a'; GX.beginPath(); GX.arc(dw*0.22,base-7,1.3,0,TAU); GX.fill();
  }
  else if(age===1){
    /* --- Csillagbástya (17. sz.) — térhatással ---
       Alacsony, vaskos földbástya kőburkolattal: rézsűs elülső fal,
       ágyúlőrésekkel, fölötte nyitott ágyúállás mellvéddel. Az elülső lap
       és a felső járófelület is látszik, ezért nem lapos felülnézet. */
    const base=h/2-4, top=base-H;
    const W=w*0.46, Wt=w*0.34;
    GX.fillStyle=mix(st.wall,'#7a6a4a',0.5);
    GX.beginPath();
    GX.moveTo(-W,base); GX.lineTo(-Wt,top); GX.lineTo(Wt,top); GX.lineTo(W,base);
    GX.closePath(); GX.fill();
    GX.save();
    GX.beginPath();
    GX.moveTo(-W,base); GX.lineTo(-Wt,top); GX.lineTo(Wt,top); GX.lineTo(W,base);
    GX.closePath(); GX.clip();
    texAshlar(-W,top,W*2,base-top,st.wall,rand,12,8);
    GX.restore();
    faceShade(-W,top,W*2,base-top);
    GX.fillStyle=shade(st.wall,-0.2);
    GX.fillRect(-W*0.92,top+(base-top)*0.52,W*1.84,2.6);
    for(let i=-1;i<=1;i++){                       // ágyúlőrések
      const x=i*W*0.5, y=top+(base-top)*0.3;
      GX.fillStyle='#2a2419';
      GX.beginPath();
      GX.moveTo(x-5,y+7); GX.lineTo(x-3,y); GX.lineTo(x+3,y); GX.lineTo(x+5,y+7);
      GX.closePath(); GX.fill();
      GX.fillStyle=shade(st.wall,-0.32);
      GX.fillRect(x-1.4,y+2,3,7);
    }
    GX.fillStyle=shade(st.wall,0.16);             // felső járófelület
    GX.beginPath();
    GX.moveTo(-Wt,top); GX.lineTo(-Wt*0.72,top-9);
    GX.lineTo(Wt*0.72,top-9); GX.lineTo(Wt,top);
    GX.closePath(); GX.fill();
    GX.fillStyle='rgba(0,0,0,.14)'; GX.fillRect(-Wt,top-1,Wt*2,2);
    GX.fillStyle=shade(st.wall,0.06);             // mellvéd fogazata
    for(let x=-Wt*0.72;x<Wt*0.7;x+=9) GX.fillRect(x,top-14,6,6);
    GX.fillStyle='#4a4a44';                       // ágyú a platformon
    GX.beginPath(); GX.ellipse(0,top-11,7,3.4,0,0,TAU); GX.fill();
    GX.fillStyle='#3a3a34'; GX.fillRect(2,top-14,13,3.2);
    GX.fillStyle='#5a4a34';
    GX.beginPath(); GX.arc(-3,top-9,3.4,0,TAU); GX.fill();
    GX.strokeStyle='#4a3a24'; GX.lineWidth=1.6;   // zászlórúd
    GX.beginPath(); GX.moveTo(-Wt*0.6,top-14); GX.lineTo(-Wt*0.6,top-32); GX.stroke();
    GX.fillStyle=col; GX.fillRect(-Wt*0.6,top-32,11,6);
    GX.fillStyle=acc; GX.fillRect(-Wt*0.6,top-29,11,2);
  }
  else if(age===2){
    /* --- Erődtorony (19. sz.) — magas téglatorony ---
       Kőlábazat, három sor keskeny lőrésablak, kiugró vaskorlátos
       figyelőerkély, lapos párkányos tető ágyúval. */
    const base=h/2-4, top=base-H;
    const W=w*0.30;
    texAshlar(-W*1.12,base-H*0.18,W*2.24,H*0.18,mix(st.wall,'#8a8478',0.5),rand,10,6);
    texBrick(-W,top,W*2,base-top-H*0.16,st.wall,rand);
    faceShade(-W,top,W*2,base-top);
    GX.fillStyle=shade(st.wall,0.22);
    for(let y=top+14;y<base-H*0.2;y+=26) GX.fillRect(-W,y,W*2,3);
    for(let sor=0;sor<3;sor++){
      const y=top+16+sor*26;
      for(let i=-1;i<=1;i++){
        const x=i*W*0.52;
        GX.fillStyle='#241f18'; GX.fillRect(x-2,y,4,11);
        GX.fillStyle='rgba(255,240,200,.18)'; GX.fillRect(x-2,y,1.4,11);
      }
    }
    const ey=top+10;                              // figyelőerkély
    GX.fillStyle=shade(st.wall,-0.18); GX.fillRect(-W*1.24,ey,W*2.48,4.4);
    GX.fillStyle=shade(st.wall,0.1);   GX.fillRect(-W*1.24,ey,W*2.48,1.6);
    GX.strokeStyle='#4a4a48'; GX.lineWidth=1.2;
    GX.beginPath(); GX.moveTo(-W*1.2,ey); GX.lineTo(-W*1.2,ey-9); GX.stroke();
    GX.beginPath(); GX.moveTo(W*1.2,ey); GX.lineTo(W*1.2,ey-9); GX.stroke();
    GX.beginPath(); GX.moveTo(-W*1.2,ey-8); GX.lineTo(W*1.2,ey-8); GX.stroke();
    for(let x=-W*1.1;x<W*1.1;x+=8){
      GX.beginPath(); GX.moveTo(x,ey); GX.lineTo(x,ey-8); GX.stroke();
    }
    GX.fillStyle=shade(st.wall,0.2);  GX.fillRect(-W*1.1,top-6,W*2.2,7);
    GX.fillStyle=shade(st.wall,-0.24);GX.fillRect(-W*1.1,top-6,W*2.2,2);
    GX.fillStyle='#3f4348'; GX.fillRect(-5,top-13,10,7);
    GX.fillStyle='#2f3338'; GX.fillRect(4,top-12,15,3.4);
    GX.strokeStyle='#4a4a48'; GX.lineWidth=1.5;
    GX.beginPath(); GX.moveTo(-W*0.9,top-6); GX.lineTo(-W*0.9,top-28); GX.stroke();
    GX.fillStyle=col; GX.fillRect(-W*0.9,top-28,11,6);
    GX.fillStyle=acc; GX.fillRect(-W*0.9,top-25,11,2);
  }
  else{
    /* --- Páncéltörő állás (20. sz.) — betonbunker ---
       Rézsűs elülső fal lőréssel, homokzsákok, felül alacsony forgótorony
       a löveggel. A fedlap is látszik, így van mélysége. */
    const base=h/2-4, top=base-H;
    const W=w*0.40;
    GX.fillStyle='#a89a76';                       // homokzsákok
    for(let x=-W*1.05;x<W*1.05;x+=11){
      GX.beginPath(); GX.ellipse(x+5,base-3,6,4,0,0,TAU); GX.fill();
      GX.fillStyle='rgba(0,0,0,.12)';
      GX.beginPath(); GX.ellipse(x+5,base-1,6,2.4,0,0,TAU); GX.fill();
      GX.fillStyle='#a89a76';
    }
    GX.fillStyle=st.wall;
    GX.beginPath();
    GX.moveTo(-W,base-4); GX.lineTo(-W*0.78,top); GX.lineTo(W*0.78,top); GX.lineTo(W,base-4);
    GX.closePath(); GX.fill();
    GX.save();
    GX.beginPath();
    GX.moveTo(-W,base-4); GX.lineTo(-W*0.78,top); GX.lineTo(W*0.78,top); GX.lineTo(W,base-4);
    GX.closePath(); GX.clip();
    texConcrete(-W,top,W*2,base-top,st.wall,rand);
    GX.restore();
    faceShade(-W,top,W*2,base-top);
    GX.fillStyle='rgba(0,0,0,.12)';
    for(let y=top+7;y<base-6;y+=8) GX.fillRect(-W*0.95,y,W*1.9,1.4);
    GX.fillStyle='#1c1a16';                       // lőrés
    GX.fillRect(-W*0.52,top+(base-top)*0.34,W*1.04,7);
    GX.fillStyle=shade(st.wall,-0.3);
    GX.fillRect(-W*0.52,top+(base-top)*0.34,W*1.04,1.6);
    GX.fillStyle=shade(st.wall,0.18);             // fedlap
    GX.beginPath();
    GX.moveTo(-W*0.78,top); GX.lineTo(-W*0.6,top-8);
    GX.lineTo(W*0.6,top-8); GX.lineTo(W*0.78,top);
    GX.closePath(); GX.fill();
    GX.fillStyle=shade(st.wall,-0.08);            // forgótorony
    GX.beginPath(); GX.ellipse(0,top-10,W*0.4,6,0,0,TAU); GX.fill();
    GX.fillStyle=shade(st.wall,0.12);
    GX.beginPath(); GX.ellipse(-1.5,top-12,W*0.3,4,0,0,TAU); GX.fill();
    GX.fillStyle='#3a3e40'; GX.fillRect(2,top-13,20,3.6);
    GX.fillStyle='#2a2e30'; GX.fillRect(20,top-14,4,5.4);
    GX.fillStyle='rgba(92,110,70,.4)';            // álcaháló foltok
    for(let i=0;i<6;i++){
      const x=-W*0.8+rand()*W*1.6, y=top-6+rand()*(base-top)*0.5;
      GX.beginPath(); GX.ellipse(x,y,5+rand()*5,3+rand()*3,rand()*TAU,0,TAU); GX.fill();
    }
  }
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};

/* ------------------------------ FAL / BUNKER ------------------------- */
/* --------------------------- FAVÁGÓTELEP ---------------------------
   Fűrészállvány, rönkhalom és deszkarakás. A tető alatt fűrészpor.
   ------------------------------------------------------------------ */
PAINT.lumber=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner);
  const FY=h/2-H;
  groundShadow(w,h,H);
  // nyitott fészer
  GX.fillStyle=shade(st.wood,-0.12);
  for(const x of [-w*0.34,-w*0.02,w*0.3]) GX.fillRect(x,FY+H*0.3,3.4,H*0.7);
  GX.fillStyle=st.roof;
  GX.beginPath();
  GX.moveTo(-w*0.44,FY+H*0.32); GX.lineTo(0,FY-H*0.1); GX.lineTo(w*0.44,FY+H*0.32);
  GX.closePath(); GX.fill();
  GX.save();
  GX.beginPath();
  GX.moveTo(-w*0.44,FY+H*0.32); GX.lineTo(0,FY-H*0.1); GX.lineTo(w*0.44,FY+H*0.32);
  GX.closePath(); GX.clip();
  texTiles(-w*0.44,FY-H*0.1,w*0.88,H*0.44,st.roof,rand,4);
  GX.restore();
  // rönkhalom bal oldalt
  for(let sor=0;sor<2;sor++)
    for(let i=0;i<3-sor;i++){
      const x=-w*0.42+i*8+sor*4, y=h/2-6-sor*7;
      GX.fillStyle='#7a5a34';
      GX.beginPath(); GX.ellipse(x,y,4.2,3.6,0,0,TAU); GX.fill();
      GX.fillStyle='#c8a870';
      GX.beginPath(); GX.ellipse(x-0.6,y-0.6,2.4,2,0,0,TAU); GX.fill();
    }
  // fűrészállvány
  GX.strokeStyle=shade(st.wood,-0.25); GX.lineWidth=2;
  GX.beginPath(); GX.moveTo(w*0.02,h/2-4); GX.lineTo(w*0.14,h/2-16); GX.stroke();
  GX.beginPath(); GX.moveTo(w*0.2,h/2-4); GX.lineTo(w*0.08,h/2-16); GX.stroke();
  GX.strokeStyle='#b9bcc0'; GX.lineWidth=1.4;
  GX.beginPath(); GX.moveTo(w*0.0,h/2-13); GX.lineTo(w*0.24,h/2-10); GX.stroke();
  // deszkarakás
  GX.fillStyle='#c8a870';
  for(let i=0;i<4;i++) GX.fillRect(w*0.26,h/2-6-i*2.6,15,2.2);
  // fűrészpor a földön
  GX.fillStyle='rgba(214,188,132,.45)';
  GX.beginPath(); GX.ellipse(w*0.1,h/2-2,12,4.4,0,0,TAU); GX.fill();
  GX.fillStyle=col; GX.globalAlpha=.9;
  GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};

/* ---------------------- ARANYBÁNYA ÉS CUKORNÁD ----------------------
   Két kalózvárosi termelő. A bánya tárnabejárat állványzattal és
   érckupaccal; az ültetvény nádtáblák sorai présházzal.
   ------------------------------------------------------------------ */
PAINT.goldmine=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  const FY=h/2-H;
  groundShadow(w,h,H);
  // meddőhányó
  GX.fillStyle='#6a5d4a';
  GX.beginPath(); GX.ellipse(-w*0.32,h/2-6,w*0.24,h*0.16,0,0,TAU); GX.fill();
  GX.fillStyle='#7a6c56';
  GX.beginPath(); GX.ellipse(-w*0.34,h/2-9,w*0.17,h*0.11,0,0,TAU); GX.fill();
  // sziklafal a tárna körül
  texAshlar(-w*0.18,FY,w*0.66,H,mix(st.wall,'#8a8278',0.5),rand,11,7);
  faceShade(-w*0.18,FY,w*0.66,H);
  // tárnabejárat
  GX.fillStyle='#1a150f';
  GX.beginPath();
  GX.moveTo(w*0.02,h/2-2); GX.lineTo(w*0.02,FY+H*0.42);
  GX.quadraticCurveTo(w*0.15,FY+H*0.22,w*0.28,FY+H*0.42);
  GX.lineTo(w*0.28,h/2-2); GX.closePath(); GX.fill();
  // ácsolat a bejáratnál
  GX.fillStyle=shade(st.wood,-0.1);
  GX.fillRect(w*0.005,FY+H*0.4,3.4,H*0.6);
  GX.fillRect(w*0.27,FY+H*0.4,3.4,H*0.6);
  GX.fillRect(w*0.0,FY+H*0.36,w*0.3,3.6);
  // csille sín és csille
  GX.strokeStyle='rgba(80,70,55,.8)'; GX.lineWidth=1.4;
  GX.beginPath(); GX.moveTo(w*0.15,h/2-2); GX.lineTo(-w*0.3,h/2+4); GX.stroke();
  GX.fillStyle='#5a4a34';
  GX.fillRect(-w*0.26,h/2-6,11,6);
  GX.fillStyle=acc;                       // aranyérc a csillében
  for(let i=0;i<4;i++){
    GX.beginPath(); GX.arc(-w*0.24+i*2.6,h/2-6.5,1.5,0,TAU); GX.fill();
  }
  GX.fillStyle=col; GX.globalAlpha=.9;
  GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};
PAINT.sugar=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner);
  const FY=h/2-H;
  groundShadow(w,h,H);
  // nádtáblák: rendezett sorok
  for(let sor=0;sor<3;sor++){
    const y=h/2-6-sor*7;
    GX.fillStyle=['#8fa63e','#9ab446','#84993a'][sor];
    GX.fillRect(-w*0.46,y-5,w*0.92,5.4);
    GX.strokeStyle='rgba(60,74,28,.5)'; GX.lineWidth=0.8;
    for(let x=-w*0.44;x<w*0.44;x+=5){
      GX.beginPath(); GX.moveTo(x,y-5); GX.lineTo(x+1.4,y+0.4); GX.stroke();
    }
  }
  // présház a tábla mögött
  texPlaster(-w*0.2,FY,w*0.4,H*0.8,shade(st.wall,0.1),rand);
  faceShade(-w*0.2,FY,w*0.4,H*0.8);
  GX.fillStyle=st.roof;
  GX.beginPath();
  GX.moveTo(-w*0.24,FY+1); GX.lineTo(0,FY-H*0.28); GX.lineTo(w*0.24,FY+1);
  GX.closePath(); GX.fill();
  // hordók a présház mellett
  for(let i=0;i<2;i++){
    const x=w*0.28+i*11;
    GX.fillStyle='#7a5a34';
    GX.beginPath(); GX.ellipse(x,h/2-9,4.2,5.4,0,0,TAU); GX.fill();
    GX.strokeStyle='#5a4028'; GX.lineWidth=0.9;
    GX.beginPath(); GX.moveTo(x-4.2,h/2-9); GX.lineTo(x+4.2,h/2-9); GX.stroke();
  }
  GX.fillStyle=col; GX.globalAlpha=.9;
  GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};

/* ------------------------------- PIAC -------------------------------
   Nyitott árusítóhely: ponyvatető, pult, ládák és zsákok. Korszakonként
   egyre polgáribb: vásári sátorból csarnok, majd tőzsdeépület lesz.
   ------------------------------------------------------------------ */
PAINT.market=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);

  if(age===0){                                   // vásári ponyva
    // oszlopok
    GX.fillStyle=shade(st.wood,-0.15);
    for(const x of [-w*0.4,-w*0.13,w*0.13,w*0.4]) GX.fillRect(x-1.6,FY+4,3.2,H-2);
    // csíkos ponyva
    const cs=['#c9563c','#e8dcc0'];
    for(let i=0;i<7;i++){
      GX.fillStyle=cs[i%2];
      GX.beginPath();
      const x0=-w*0.5+i*(w/7), x1=x0+(w/7);
      GX.moveTo(x0,FY+6); GX.lineTo(x0+(w/14),RY+2);
      GX.lineTo(x1+(w/14),RY+2); GX.lineTo(x1,FY+6);
      GX.closePath(); GX.fill();
    }
    GX.fillStyle='rgba(0,0,0,.16)'; GX.fillRect(-w*0.5,FY+4,w,2.4);
    // hullámos ponyvaszegély
    GX.fillStyle='#b8492f';
    for(let x=-w*0.5;x<w*0.5;x+=7){
      GX.beginPath(); GX.arc(x+3.5,FY+6,3.5,0,Math.PI); GX.fill();
    }
  }else if(age===1){                             // fedett vásárcsarnok
    texPlaster(-w/2,FY,w,H*0.72,shade(st.wall,0.18),rand);
    faceShade(-w/2,FY,w,H*0.72);
    GX.fillStyle=st.roof;
    GX.beginPath();
    GX.moveTo(-w/2-6,FY+1); GX.lineTo(0,RY-6); GX.lineTo(w/2+6,FY+1);
    GX.closePath(); GX.fill();
    GX.save();
    GX.beginPath();
    GX.moveTo(-w/2-6,FY+1); GX.lineTo(0,RY-6); GX.lineTo(w/2+6,FY+1);
    GX.closePath(); GX.clip();
    texTiles(-w/2-6,RY-6,w+12,FY+1-(RY-6),st.roof,rand,5);
    GX.restore();
    // árkádív a homlokzaton
    GX.fillStyle='#3a3025';
    for(let i=-1;i<=1;i++){
      const x=i*w*0.27;
      GX.beginPath();
      GX.moveTo(x-8,FY+H*0.72); GX.lineTo(x-8,FY+H*0.34);
      GX.quadraticCurveTo(x,FY+H*0.16,x+8,FY+H*0.34);
      GX.lineTo(x+8,FY+H*0.72); GX.closePath(); GX.fill();
    }
  }else if(age===2){                             // tőzsdeépület oszlopokkal
    texAshlar(-w/2,FY,w,H,shade(st.wall,0.1),rand,12,8);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=shade(st.wall,0.24);            // oromzat
    GX.beginPath();
    GX.moveTo(-w*0.46,FY+H*0.3); GX.lineTo(0,FY+H*0.06); GX.lineTo(w*0.46,FY+H*0.3);
    GX.closePath(); GX.fill();
    GX.fillStyle=shade(st.wall,0.3);             // oszlopok
    for(let i=-2;i<=2;i++) GX.fillRect(i*w*0.18-2.4,FY+H*0.3,4.8,H*0.62);
    GX.fillStyle=shade(st.wall,-0.2);
    GX.fillRect(-w*0.46,FY+H*0.3,w*0.92,2.6);
  }else{                                         // modern kereskedőház
    texConcrete(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='rgba(150,190,210,.5)';         // üvegportál
    GX.fillRect(-w*0.4,FY+H*0.28,w*0.8,H*0.44);
    GX.strokeStyle=shade(st.wall,-0.25); GX.lineWidth=1;
    for(let i=-2;i<=2;i++){
      GX.beginPath(); GX.moveTo(i*w*0.16,FY+H*0.28); GX.lineTo(i*w*0.16,FY+H*0.72); GX.stroke();
    }
    GX.fillStyle=shade(st.wall,0.16); GX.fillRect(-w/2-3,RY-3,w+6,h+5);
  }

  // pult, ládák, zsákok — minden korban ott állnak
  GX.fillStyle=shade(st.wood,0.05);
  GX.fillRect(-w*0.34,h/2-9,w*0.4,4.4);
  GX.fillStyle=shade(st.wood,-0.2);
  GX.fillRect(-w*0.34,h/2-5,w*0.4,2.4);
  GX.fillStyle='#8a6a42';                        // ládák
  GX.fillRect(w*0.14,h/2-11,10,8);
  GX.fillStyle=shade('#8a6a42',0.2); GX.fillRect(w*0.14,h/2-11,10,2);
  GX.strokeStyle=shade('#8a6a42',-0.35); GX.lineWidth=0.9;
  GX.beginPath(); GX.moveTo(w*0.14,h/2-7.4); GX.lineTo(w*0.14+10,h/2-7.4); GX.stroke();
  GX.fillStyle='#c8b487';                        // zsákok
  for(let i=0;i<3;i++){
    GX.beginPath();
    GX.ellipse(w*0.3+i*7,h/2-5,4.2,5.2,0.1,0,TAU); GX.fill();
  }
  // mérleg a pult fölött
  GX.strokeStyle=acc; GX.lineWidth=1.2;
  GX.beginPath(); GX.moveTo(-w*0.14,h/2-9); GX.lineTo(-w*0.14,h/2-19); GX.stroke();
  GX.beginPath(); GX.moveTo(-w*0.24,h/2-18); GX.lineTo(-w*0.04,h/2-18); GX.stroke();
  GX.fillStyle=acc;
  GX.beginPath(); GX.ellipse(-w*0.24,h/2-16.4,2.6,1.3,0,0,TAU); GX.fill();
  GX.beginPath(); GX.ellipse(-w*0.04,h/2-16,2.6,1.3,0,0,TAU); GX.fill();

  GX.fillStyle=col; GX.globalAlpha=.9;
  GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};

/* ------------------------------ KÓRHÁZ ------------------------------
   Korszakonként más: kolostori ispotály kereszttel, barokk kórház,
   téglás klinika nagy ablakokkal, végül sátortetős tábori kórház
   vöröskereszttel. A bejárat fölött mindig ott a gyógyítás jele.
   ------------------------------------------------------------------ */
PAINT.hospital=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);

  if(age===0){                                    // kolostori ispotály
    texAshlar(-w/2,FY,w,H,st.wall,rand,10,7);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=st.roof;
    GX.beginPath();
    GX.moveTo(-w/2-6,FY+1); GX.lineTo(0,RY-8); GX.lineTo(w/2+6,FY+1);
    GX.closePath(); GX.fill();
    GX.save();
    GX.beginPath();
    GX.moveTo(-w/2-6,FY+1); GX.lineTo(0,RY-8); GX.lineTo(w/2+6,FY+1);
    GX.closePath(); GX.clip();
    texTiles(-w/2-6,RY-8,w+12,FY+1-(RY-8),st.roof,rand,5);
    GX.restore();
    // csúcsíves ablakok
    for(let i=-1;i<=1;i++){
      const x=i*w*0.26;
      GX.fillStyle='#2f2a20';
      GX.beginPath();
      GX.moveTo(x-4,FY+H*0.55); GX.lineTo(x-4,FY+H*0.3);
      GX.quadraticCurveTo(x,FY+H*0.14,x+4,FY+H*0.3);
      GX.lineTo(x+4,FY+H*0.55); GX.closePath(); GX.fill();
    }
  }else if(age===1){                              // barokk kórház
    texPlaster(-w/2,FY,w,H,shade(st.wall,0.2),rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=st.roof; GX.fillRect(-w/2-4,RY-4,w+8,h+6);
    GX.fillStyle=shade(st.roof,0.18); GX.fillRect(-w/2-4,RY-4,w+8,2.6);
    GX.fillStyle=shade(st.wall,-0.16);            // párkány
    GX.fillRect(-w/2,FY+H*0.42,w,2.4);
  }else if(age===2){                              // téglás klinika
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=st.roof; GX.fillRect(-w/2-3,RY-3,w+6,h+5);
  }else{                                          // tábori kórház, sátortető
    texConcrete(-w/2,FY,w,H*0.62,st.wall,rand);
    faceShade(-w/2,FY,w,H*0.62);
    GX.fillStyle='#d8d2c4';                       // vászonsátor
    GX.beginPath();
    GX.moveTo(-w/2-5,FY+H*0.62); GX.quadraticCurveTo(0,RY-6,w/2+5,FY+H*0.62);
    GX.closePath(); GX.fill();
    GX.strokeStyle='rgba(120,114,100,.4)'; GX.lineWidth=1;
    for(let i=1;i<5;i++){
      const x=-w/2+i*(w/5);
      GX.beginPath(); GX.moveTo(x,FY+H*0.62);
      GX.quadraticCurveTo(x*0.5,RY+8,x*0.2,RY+2); GX.stroke();
    }
  }

  // ablakok az emeleten (a sátoros változat kivételével)
  if(age>0&&age<3){
    for(let i=-1;i<=1;i++){
      const x=i*w*0.28;
      GX.fillStyle=(rand()<0.5)?'#e8dca8':'#3a4550';
      GX.fillRect(x-6,FY+H*0.22,12,10);
      GX.strokeStyle=shade(st.wall,-0.3); GX.lineWidth=0.9;
      GX.strokeRect(x-6,FY+H*0.22,12,10);
    }
  }
  // bejárat
  GX.fillStyle=shade(st.wood,-0.1);
  GX.fillRect(-8,h/2-H*0.34,16,H*0.34);
  GX.fillStyle='rgba(255,240,200,.35)';
  GX.fillRect(-6,h/2-H*0.3,12,3);

  // a gyógyítás jele: korszaktól függően kereszt színe
  const jel=(age<2)?'#e8e0cc':'#c0392b';
  const jx=0, jy=FY+H*0.06;
  GX.fillStyle='#f2efe6';
  GX.beginPath(); GX.arc(jx,jy,9,0,TAU); GX.fill();
  GX.fillStyle=jel;
  GX.fillRect(jx-6.5,jy-2.2,13,4.4);
  GX.fillRect(jx-2.2,jy-6.5,4.4,13);

  GX.fillStyle=col; GX.globalAlpha=.9;
  GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};

/* ---------------------------- KOVÁCSMŰHELY ----------------------------
   Itt élesítik a kardot és kalapálják a páncélt. Korszakonként más:
   nyitott műhely üllővel, fedett fegyvertár, gőzgépes gyártelep, végül
   fémvázas hadiüzem. A kohó fénye kiszűrődik, a kéményből füst száll.
   ------------------------------------------------------------------ */
PAINT.smith=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);

  if(age===0){                                    // nyitott műhely
    texPlank(-w/2,FY,w,H,st.wood,rand,false);
    faceShade(-w/2,FY,w,H);
    GX.save();                                    // zsúptető
    GX.beginPath();
    GX.moveTo(-w/2-7,FY+2); GX.lineTo(0,RY-10); GX.lineTo(w/2+7,FY+2);
    GX.closePath(); GX.clip();
    texThatch(-w/2-7,RY-10,w+14,FY+2-(RY-10),'#a8904e',rand);
    GX.restore();
  }else if(age===1){                              // kőfalú fegyvertár
    texAshlar(-w/2,FY,w,H,st.wall,rand,11,8);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=st.roof;
    GX.beginPath();
    GX.moveTo(-w/2-5,FY+1); GX.lineTo(0,RY-6); GX.lineTo(w/2+5,FY+1);
    GX.closePath(); GX.fill();
    GX.save();
    GX.beginPath();
    GX.moveTo(-w/2-5,FY+1); GX.lineTo(0,RY-6); GX.lineTo(w/2+5,FY+1);
    GX.closePath(); GX.clip();
    texTiles(-w/2-5,RY-6,w+10,FY+1-(RY-6),st.roof,rand,5);
    GX.restore();
  }else if(age===2){                              // gőzgépes gyártelep
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=shade(st.roof,-0.1);             // fűrészfogas tető
    for(let i=0;i<3;i++){
      const x=-w/2+i*(w/3);
      GX.beginPath();
      GX.moveTo(x,FY+1); GX.lineTo(x,RY+4); GX.lineTo(x+w/3,FY+1);
      GX.closePath(); GX.fill();
      GX.fillStyle='rgba(150,190,210,.45)';       // üvegezett oldal
      GX.beginPath();
      GX.moveTo(x+1.5,FY); GX.lineTo(x+1.5,RY+6); GX.lineTo(x+w/9,FY);
      GX.closePath(); GX.fill();
      GX.fillStyle=shade(st.roof,-0.1);
    }
  }else{                                          // fémvázas hadiüzem
    texConcrete(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.strokeStyle=shade(st.wall,-0.3); GX.lineWidth=1.6;
    for(let x=-w/2+8;x<w/2;x+=12){                // acélvázak
      GX.beginPath(); GX.moveTo(x,FY+2); GX.lineTo(x,FY+H-3); GX.stroke();
    }
    GX.fillStyle=shade(st.wall,0.14);             // lapos tető
    GX.fillRect(-w/2-3,RY-3,w+6,h+4);
  }

  // Kohó: izzó nyílás, előtte üllő és kalapács
  const kx=-w*0.24, ky=h/2-H*0.34;
  GX.fillStyle='#2a1e14';
  GX.beginPath();
  GX.moveTo(kx-9,ky+10); GX.lineTo(kx-9,ky-4);
  GX.quadraticCurveTo(kx,ky-14,kx+9,ky-4);
  GX.lineTo(kx+9,ky+10); GX.closePath(); GX.fill();
  const izzas=GX.createRadialGradient(kx,ky+2,1,kx,ky+2,11);
  izzas.addColorStop(0,'rgba(255,196,90,.95)');
  izzas.addColorStop(0.5,'rgba(224,120,40,.7)');
  izzas.addColorStop(1,'rgba(180,60,20,0)');
  GX.fillStyle=izzas;
  GX.beginPath(); GX.arc(kx,ky+2,11,0,TAU); GX.fill();
  // üllő
  const ax=w*0.2, ay=h/2-6;
  GX.fillStyle='#54585c';
  GX.fillRect(ax-8,ay-7,16,4);
  GX.beginPath(); GX.moveTo(ax-8,ay-3); GX.lineTo(ax+8,ay-3);
  GX.lineTo(ax+4,ay+2); GX.lineTo(ax-4,ay+2); GX.closePath(); GX.fill();
  GX.fillStyle='#3c4044'; GX.fillRect(ax-5,ay+2,10,5);
  GX.fillStyle='rgba(255,255,255,.22)'; GX.fillRect(ax-8,ay-7,16,1.4);
  // szikrák az üllő fölött
  GX.fillStyle='rgba(255,210,110,.7)';
  for(let i=0;i<4;i++){
    const a=-2.6+rand()*1.6, d=4+rand()*9;
    GX.beginPath();
    GX.arc(ax+Math.cos(a)*d, ay-8+Math.sin(a)*d, 0.9+rand()*0.8, 0, TAU);
    GX.fill();
  }
  // kéménye a kohó fölött
  GX.fillStyle=shade(st.wall,-0.22); GX.fillRect(kx-5,RY-12,10,14);
  GX.fillStyle=shade(st.wall,0.14);  GX.fillRect(kx-5,RY-12,3,14);
  chimneySmoke(kx,RY-13,age*5+2,1);
  GX.fillStyle=col; GX.globalAlpha=.9;
  GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};

/* ------------------------------ LAKÓHÁZ ------------------------------ */
// Korszakonként más: gerendaház zsúptetővel, kőházas polgárház, emeletes
// bérház, végül panelszerű lakótelep. Kéményéből füst száll.
PAINT.house=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);
  if(age===0){                                    // gerendaház zsúptetővel
    texPlank(-w/2,FY,w,H,st.wood,rand,false);
    faceShade(-w/2,FY,w,H);
    GX.save();                                    // zsúptető
    GX.beginPath();
    GX.moveTo(-w/2-6,FY+2); GX.lineTo(0,RY-8); GX.lineTo(w/2+6,FY+2);
    GX.closePath(); GX.clip();
    texThatch(-w/2-6,RY-8,w+12,FY+2-(RY-8),'#b9a05e',rand);
    GX.restore();
    GX.fillStyle='rgba(255,250,228,.16)';
    GX.beginPath(); GX.moveTo(-w/2-6,FY+2); GX.lineTo(0,RY-8); GX.lineTo(-w*0.1,RY-8);
    GX.lineTo(-w/2-1,FY+2); GX.closePath(); GX.fill();
  }else if(age===1){                              // kőalapos polgárház
    texAshlar(-w/2,FY+H*0.42,w,H*0.6,st.wall,rand,10,7);
    texPlaster(-w/2,FY,w,H*0.5,shade(st.wall,0.28),rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=st.roof;
    GX.beginPath();
    GX.moveTo(-w/2-5,FY+1); GX.lineTo(0,RY-4); GX.lineTo(w/2+5,FY+1);
    GX.closePath(); GX.fill();
    GX.save();
    GX.beginPath();
    GX.moveTo(-w/2-5,FY+1); GX.lineTo(0,RY-4); GX.lineTo(w/2+5,FY+1);
    GX.closePath(); GX.clip();
    texTiles(-w/2-5,RY-4,w+10,FY+1-(RY-4),st.roof,rand,5);
    GX.restore();
  }else if(age===2){                              // emeletes bérház
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=shade(st.wall,0.3); GX.fillRect(-w/2,FY+H*0.46,w,2.4);
    GX.fillStyle=st.roof; GX.fillRect(-w/2-3,RY-2,w+6,h+4);
    GX.fillStyle=shade(st.roof,0.2); GX.fillRect(-w/2-3,RY-2,w+6,2.6);
  }else{                                          // lakótelep
    texConcrete(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=shade(st.wall,-0.18);
    for(let y=FY+5;y<FY+H-4;y+=9) GX.fillRect(-w/2,y,w,1.6);
    GX.fillStyle=shade(st.wall,0.12); GX.fillRect(-w/2-2,RY-2,w+4,h+3);
  }
  // ablakok: esténként világítanak
  const rows=(age===0)?1:(age===3?3:2), cols=(age===3)?4:3;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const x=-w*0.34+c*(w*0.68/(cols-1)), y=FY+H*0.26+r*(H*0.46/Math.max(1,rows-1||1));
    GX.fillStyle=(rand()<0.45)?'#e8c86a':'#3a4550';
    GX.fillRect(x-3.4,y-3,6.8,6.4);
    GX.strokeStyle=shade(st.wall,-0.3); GX.lineWidth=0.9;
    GX.strokeRect(x-3.4,y-3,6.8,6.4);
  }
  // ajtó
  GX.fillStyle=shade(st.wood,-0.12);
  GX.fillRect(-4,h/2-H*0.36,8,H*0.36);
  GX.fillStyle='#c9a227';
  GX.beginPath(); GX.arc(2,h/2-H*0.18,0.9,0,TAU); GX.fill();
  // kémény és füst
  const cx=w*0.28;
  GX.fillStyle=shade(st.wall,-0.2); GX.fillRect(cx,RY-9,7,11);
  GX.fillStyle=shade(st.wall,0.18); GX.fillRect(cx,RY-9,2.4,11);
  chimneySmoke(cx+3.5,RY-10,age*7+3,0.8);
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};

/* ------------------------------ REPÜLŐTÉR ------------------------------ */
// Betonkifutó, hangár félköríves tetővel, szélzsák és irányítótorony.
PAINT.airfield=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner), acc=ownerAccent(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);
  // kifutópálya a talajon
  GX.fillStyle='#6b6b66';
  GX.fillRect(-w/2-6,h/2-20,w+12,22);
  GX.fillStyle='#7d7d77'; GX.fillRect(-w/2-6,h/2-20,w+12,3);
  GX.fillStyle='rgba(240,238,228,.7)';                 // felezővonal
  for(let x=-w/2;x<w/2;x+=14) GX.fillRect(x,h/2-10,8,2);
  GX.fillStyle='rgba(30,26,20,.25)';                   // kerékcsíkok
  for(let x=-w/2;x<w/2;x+=9) GX.fillRect(x,h/2-17,3,14);
  // hangár: félköríves hullámlemez tető
  const hw=w*0.52, hx=-w/2+4;
  texConcrete(hx,FY,hw,H,st.wall,rand);
  faceShade(hx,FY,hw,H);
  GX.fillStyle=shade('#8e9096',0.05);
  GX.beginPath();
  GX.moveTo(hx-3,FY+2); GX.quadraticCurveTo(hx+hw/2,RY-8,hx+hw+3,FY+2);
  GX.lineTo(hx+hw+3,FY+5); GX.lineTo(hx-3,FY+5); GX.closePath(); GX.fill();
  GX.save();                                           // hullámlemez bordák
  GX.beginPath();
  GX.moveTo(hx-3,FY+5); GX.quadraticCurveTo(hx+hw/2,RY-8,hx+hw+3,FY+5); GX.closePath();
  GX.clip();
  GX.strokeStyle='rgba(0,0,0,.2)'; GX.lineWidth=1.1;
  for(let i=1;i<10;i++){
    const xx=hx-3+(hw+6)*(i/10);
    GX.beginPath(); GX.moveTo(xx,RY-12); GX.lineTo(xx,FY+6); GX.stroke();
  }
  GX.restore();
  GX.fillStyle='rgba(255,250,228,.14)';
  GX.beginPath();
  GX.moveTo(hx-3,FY+2); GX.quadraticCurveTo(hx+hw*0.3,RY-4,hx+hw*0.42,FY+2);
  GX.closePath(); GX.fill();
  GX.fillStyle='#2b2f33';                              // nyitott hangárkapu
  GX.fillRect(hx+hw*0.22,FY+H*0.3,hw*0.56,H*0.7);
  GX.fillStyle='rgba(120,140,160,.2)';
  GX.fillRect(hx+hw*0.26,FY+H*0.36,hw*0.2,H*0.5);
  // irányítótorony
  const tx=w/2-22;
  texConcrete(tx,FY-16,17,H+16,shade(st.wall,0.08),rand);
  faceShade(tx,FY-16,17,H+16);
  GX.fillStyle='#9fc4d6'; GX.fillRect(tx+2,FY-13,13,8);
  GX.fillStyle='rgba(0,0,0,.3)'; GX.fillRect(tx+2,FY-13,13,2);
  GX.fillStyle=shade(st.wall,0.2); GX.fillRect(tx-2,FY-19,21,4);
  GX.strokeStyle='#9aa1a8'; GX.lineWidth=1;            // antenna
  GX.beginPath(); GX.moveTo(tx+8,FY-19); GX.lineTo(tx+8,FY-31); GX.stroke();
  GX.fillStyle='#c0392b'; GX.beginPath(); GX.arc(tx+8,FY-32,1.8,0,TAU); GX.fill();
  // szélzsák
  const sx=w/2-4, sy=FY+2;
  GX.strokeStyle='#6a6a66'; GX.lineWidth=1.4;
  GX.beginPath(); GX.moveTo(sx,sy+H*0.5); GX.lineTo(sx,sy-14); GX.stroke();
  const wag=Math.sin(G.t*1.4)*2;
  GX.fillStyle='#e07a2a';
  GX.beginPath();
  GX.moveTo(sx,sy-14); GX.lineTo(sx+13,sy-11+wag); GX.lineTo(sx+13,sy-6+wag); GX.lineTo(sx,sy-7);
  GX.closePath(); GX.fill();
  GX.fillStyle='rgba(255,255,255,.6)'; GX.fillRect(sx+5,sy-12.5+wag*0.6,3,6);
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w*0.3,h/2-2.5,w*0.6,3); GX.globalAlpha=1;
};

/* -------------------------------- KAPU -------------------------------- */
// A falszakaszból nyitott kapu: csúcsíves átjáró rostéllyal és vasalt
// ajtószárnyakkal, két oldalán vaskosabb kőpillérrel.
PAINT.gate=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner), col=ownerColor(owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);
  const stone=(age<2)?mix(st.wall,'#c9a45e',0.7):st.wall;
  // oldalsó pillérek
  const pw=w*0.2;
  for(const sx of [-w/2, w/2-pw]){
    if(age<2) texAshlar(sx,FY-4,pw,H+4,stone,rand,11,8);
    else if(age===2) texBrick(sx,FY-4,pw,H+4,stone,rand);
    else texConcrete(sx,FY-4,pw,H+4,stone,rand);
    GX.fillStyle='rgba(255,250,225,.14)'; GX.fillRect(sx,FY-4,pw*0.4,H+4);
    GX.fillStyle=shade(stone,0.2); GX.fillRect(sx-1,FY-7,pw+2,4);
  }
  // átjáró boltíve
  const aw=w-pw*2, ax=-aw/2;
  GX.fillStyle=shade(stone,-0.1);
  GX.fillRect(ax,FY-4,aw,H*0.34);
  GX.fillStyle='rgba(18,14,10,.9)';                    // sötét kapualj
  GX.beginPath();
  GX.moveTo(ax+2,h/2); GX.lineTo(ax+2,FY+H*0.42);
  if(age<2){ GX.lineTo(0,FY+H*0.2); GX.lineTo(ax+aw-2,FY+H*0.42); }
  else { GX.lineTo(ax+2,FY+H*0.3); GX.lineTo(ax+aw-2,FY+H*0.3);
         GX.lineTo(ax+aw-2,FY+H*0.42); }
  GX.lineTo(ax+aw-2,h/2); GX.closePath(); GX.fill();
  // rostély
  GX.strokeStyle='#6a6a70'; GX.lineWidth=1.3;
  for(let x=ax+5;x<ax+aw-3;x+=4.5){
    GX.beginPath(); GX.moveTo(x,FY+H*0.36); GX.lineTo(x,FY+H*0.72); GX.stroke();
  }
  for(let y=FY+H*0.4;y<FY+H*0.72;y+=5){
    GX.beginPath(); GX.moveTo(ax+4,y); GX.lineTo(ax+aw-4,y); GX.stroke();
  }
  // vasalt ajtószárnyak félig nyitva
  GX.fillStyle=shade(st.wood,-0.12);
  GX.fillRect(ax+3,FY+H*0.62,aw*0.3,h/2-(FY+H*0.62));
  GX.fillRect(ax+aw-3-aw*0.3,FY+H*0.62,aw*0.3,h/2-(FY+H*0.62));
  GX.strokeStyle='rgba(0,0,0,.34)'; GX.lineWidth=0.8;
  for(let x=ax+5;x<ax+3+aw*0.3;x+=3){
    GX.beginPath(); GX.moveTo(x,FY+H*0.62); GX.lineTo(x,h/2); GX.stroke();
  }
  GX.fillStyle='#4a4038';
  GX.fillRect(ax+3,FY+H*0.66,aw*0.3,1.6);
  GX.fillRect(ax+aw-3-aw*0.3,FY+H*0.66,aw*0.3,1.6);
  // korona és pártázat a kapu fölött
  if(age<2){
    texAshlar(-w/2,RY,w,h,shade(stone,0.12),rand,10,10);
    roofShade(-w/2,RY,w,h);
    GX.fillStyle=shade(stone,0.24);
    for(let i=0;i<w;i+=10) GX.fillRect(-w/2+i,RY-5,6,7);
    GX.fillStyle=shade(stone,-0.34);
    for(let i=0;i<w;i+=10) GX.fillRect(-w/2+i+6,RY-1,4,3);
    GX.fillStyle=shade(st.wood,-0.3);                  // szemöldökgerenda
    GX.fillRect(ax-2,FY-9,aw+4,4);
  }else{
    texConcrete(-w/2,RY,w,h,shade(stone,0.1),rand);
    roofShade(-w/2,RY,w,h);
    GX.fillStyle=shade(stone,0.2); GX.fillRect(-w/2-2,RY-4,w+4,5);
  }
  GX.fillStyle=col; GX.globalAlpha=.9; GX.fillRect(-w*0.34,h/2-2.5,w*0.68,3); GX.globalAlpha=1;
};

PAINT.wall=function(w,h,H,age,owner,rand){
  const st=stFor(age,owner);
  const RY=-h/2-H, FY=h/2-H;
  groundShadow(w,h,H);
  if(age===0){
    /* --- Középkori várfal a felküldött rajz nyomán ---
       Rézsűs lábazat, durva kváderfal lőréssel, gyámkövekre ültetett
       pártázat, és fölötte fedett fa gyilokjáró zsindelytetővel.
       A kő nem szürke, hanem meleg mészkő: kövenként más árnyalat,
       moha a tövében, rozsdás csíkok a falon. */
    const stone=mix(st.wall,'#c9a45e',0.82);         // meleg mészkő alaptónus
    // rézsűs lábazat: alul szélesebb
    GX.fillStyle=shade(stone,-0.26);
    GX.beginPath();
    GX.moveTo(-w/2-4,h/2); GX.lineTo(w/2+4,h/2);
    GX.lineTo(w/2,FY+H*0.68); GX.lineTo(-w/2,FY+H*0.68);
    GX.closePath(); GX.fill();
    GX.fillStyle='rgba(255,250,225,.12)';
    GX.beginPath();
    GX.moveTo(-w/2-4,h/2); GX.lineTo(-w/2,FY+H*0.68);
    GX.lineTo(-w/2+3,FY+H*0.68); GX.lineTo(-w/2-1,h/2); GX.closePath(); GX.fill();
    // fő falsík durva kváderekből, kövenként eltérő árnyalattal
    texAshlar(-w/2,FY,w,H*0.72,stone,rand,13,9);
    faceShade(-w/2,FY,w,H*0.72);                             // előbb a fény, utána a szín
    GX.save();
    GX.beginPath(); GX.rect(-w/2,FY,w,H*0.72); GX.clip();
    for(let y=FY;y<FY+H*0.72;y+=9){                          // kövenként más árnyalat
      for(let x=-w/2;x<w/2;x+=13){
        const t=rand();
        if(t<0.2) continue;
        GX.fillStyle=t<0.42?'rgba(198,146,66,.46)'           // mézsárga
                   :(t<0.58?'rgba(142,124,92,.42)'           // szürkés
                   :(t<0.76?'rgba(224,188,120,.44)'          // világos
                   :'rgba(166,120,60,.40)'));                // sötét okker
        GX.fillRect(x+1,y+1,11,7);
      }
    }
    GX.strokeStyle='rgba(92,70,38,.34)'; GX.lineWidth=1;     // habarcsvonalak
    for(let y=FY+9;y<FY+H*0.72;y+=9){
      GX.beginPath(); GX.moveTo(-w/2,y); GX.lineTo(w/2,y); GX.stroke();
    }
    GX.fillStyle='rgba(120,96,48,.20)';                      // rozsdás csorgások
    for(let i=0;i<4;i++){
      const x=-w/2+rand()*w;
      GX.fillRect(x,FY+2,1.6+rand()*2,H*0.6*(0.4+rand()*0.6));
    }
    GX.fillStyle='rgba(94,122,58,.26)';                      // moha a fal tövében
    for(let i=0;i<7;i++){
      GX.beginPath();
      GX.ellipse(-w/2+rand()*w,FY+H*0.62+rand()*H*0.12,3+rand()*5,1.6+rand()*2,0,0,TAU);
      GX.fill();
    }
    GX.restore();
    // lőrés
    GX.fillStyle='rgba(24,20,14,.85)';
    GX.fillRect(-1.4,FY+H*0.2,2.8,H*0.32);
    GX.fillStyle=shade(stone,0.26);
    GX.fillRect(-3.4,FY+H*0.18,6.8,1.6);
    // gyámkősor a pártázat alatt
    GX.fillStyle=shade(stone,-0.18);
    for(let x=-w/2;x<w/2-1;x+=6.4){
      GX.beginPath();
      GX.moveTo(x,FY+1); GX.lineTo(x+5.4,FY+1);
      GX.arc(x+2.7,FY+1,2.7,0,Math.PI);
      GX.closePath(); GX.fill();
    }
    GX.fillStyle=shade(stone,0.16); GX.fillRect(-w/2-2,FY-3,w+4,4);
    // korona és pártázat
    texAshlar(-w/2,RY,w,h,shade(stone,0.12),rand,10,10);
    roofShade(-w/2,RY,w,h);
    GX.save();                                               // a koronán is színváltozás
    GX.beginPath(); GX.rect(-w/2,RY,w,h); GX.clip();
    for(let y=RY;y<RY+h;y+=10) for(let x=-w/2;x<w/2;x+=10){
      const t=rand(); if(t<0.4) continue;
      GX.fillStyle=t<0.7?'rgba(198,152,80,.32)':'rgba(150,132,100,.28)';
      GX.fillRect(x+1,y+1,8,8);
    }
    GX.restore();
    GX.fillStyle=shade(stone,0.22);
    for(let i=0;i<w;i+=11) GX.fillRect(-w/2+i,RY-4,7,6);
    GX.fillStyle=shade(stone,-0.34);
    for(let i=0;i<w;i+=11) GX.fillRect(-w/2+i+7,RY-1,4,3);
    // fedett fa gyilokjáró a fal fölött
    const gy=RY-4;
    GX.fillStyle=shade(st.wood,-0.4);                        // kilógó gerendavégek
    for(let x=-w/2+2;x<w/2-2;x+=7) GX.fillRect(x,gy+1,3,4);
    texPlank(-w/2-3,gy-7,w+6,8,st.wood,rand,true);           // deszkafal
    GX.fillStyle='rgba(20,14,8,.6)';                         // lőrések a deszkán
    for(let x=-w/2+3;x<w/2-4;x+=8) GX.fillRect(x,gy-5,2.2,4);
    GX.fillStyle=shade(st.roof,-0.08);                       // zsindelytető
    GX.beginPath();
    GX.moveTo(-w/2-6,gy-7); GX.lineTo(w/2+6,gy-7);
    GX.lineTo(w/2+2,gy-15); GX.lineTo(-w/2-2,gy-15);
    GX.closePath(); GX.fill();
    GX.strokeStyle='rgba(0,0,0,.24)'; GX.lineWidth=0.9;
    for(let i=1;i<3;i++){
      const t=i/3, y=gy-7-8*t;
      GX.beginPath(); GX.moveTo(-w/2-6+4*t,y); GX.lineTo(w/2+6-4*t,y); GX.stroke();
    }
    GX.fillStyle='rgba(255,250,228,.16)';
    GX.beginPath();
    GX.moveTo(-w/2-6,gy-7); GX.lineTo(-w/2-2,gy-15);
    GX.lineTo(-w/2+4,gy-15); GX.lineTo(-w/2-1,gy-7); GX.closePath(); GX.fill();
    GX.fillStyle=shade(st.wood,-0.3); GX.fillRect(-w/2-6,gy-16,w+12,1.8);
  }else if(age===1){
    /* Bástyafal: vastag kőfal földtámasszal a háta mögött */
    texAshlar(-w/2,FY,w,H,st.wall,rand,11,8);                 // homlokfelület
    faceShade(-w/2,FY,w,H);
    GX.fillStyle=shade(st.wall,-0.32); GX.fillRect(-w/2,h/2-5,w,5);
    texAshlar(-w/2,RY,w,h,shade(st.wall,0.12),rand,10,10);    // gyilokjáró
    roofShade(-w/2,RY,w,h);
    GX.fillStyle=shade(st.wall,0.2);                          // pártázat
    for(let i=0;i<w;i+=11) GX.fillRect(-w/2+i,RY-3,7,5);
    GX.fillStyle=shade(st.wall,-0.4);
    for(let i=0;i<w;i+=11) GX.fillRect(-w/2+i+7,RY-1,4,3);
    GX.fillStyle='rgba(0,0,0,.2)'; GX.fillRect(-w/2,RY+h-3,w,3);
    GX.fillStyle='#5e7a44'; GX.fillRect(-w/2,RY+h-2,w,5);     // földtámasz
    GX.fillStyle='#4c6738'; GX.fillRect(-w/2,RY+h+2,w,2);
  }else if(age===2){
    texBrick(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    GX.fillStyle='#b9b1a0'; GX.fillRect(-w/2,h/2-4,w,4);
    texBrick(-w/2,RY,w,h,shade(st.wall,0.1),rand);
    roofShade(-w/2,RY,w,h);
    GX.fillStyle='#cfc7b4'; GX.fillRect(-w/2-2,RY-3,w+4,5);   // fedkő
    GX.fillStyle='rgba(0,0,0,.18)'; GX.fillRect(-w/2-2,RY+2,w+4,1.5);
  }else{
    texConcrete(-w/2,FY,w,H,st.wall,rand);
    faceShade(-w/2,FY,w,H);
    camoBlotches(-w/2,FY,w,H,rand,['#5d6b4a','#474c3d']);
    texConcrete(-w/2,RY,w,h,shade(st.wall,0.1),rand);
    roofShade(-w/2,RY,w,h);
    for(let i=0;i<w;i+=11){                                   // homokzsáksor a tetején
      GX.fillStyle=shade('#a89464',(rand()-0.5)*0.3);
      GX.beginPath(); GX.ellipse(-w/2+i+5,RY-1,6,4,0,0,TAU); GX.fill();
    }
    GX.strokeStyle='#6a6f60'; GX.lineWidth=1;                 // szögesdrót
    GX.beginPath();
    for(let i=0;i<w;i+=4){GX.moveTo(-w/2+i,RY-7);GX.lineTo(-w/2+i+4,RY-4);GX.moveTo(-w/2+i+4,RY-7);GX.lineTo(-w/2+i,RY-4);}
    GX.stroke();
  }
};

/* ------------------------------ KÓRHÁZ ------------------------------
   Korszakonként más: kolostori ispotály kereszttel, barokk kórház,
   téglás klinika nagy ablakokkal, végül sátortetős tábori kórház
   vöröskereszttel. A bejárat fölött mindig ott a gyógyítás jele.
   ------------------------------------------------------------------ */
