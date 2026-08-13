/* =======================================================================
   13. RAJZOLÁS — terep
   ===================================================================== */
// Az atomcsapás helyén kiégett folt marad
function drawScorch(){
  if(!G.scorch||!G.scorch.length) return;
  for(const s of G.scorch){
    const x=s.x-G.cam.x, y=s.y-G.cam.y;
    if(x<-s.r*2||y<-s.r*2||x>G.vw+s.r*2||y>G.vh+s.r*2) continue;
    const g=ctx.createRadialGradient(x,y,s.r*0.2,x,y,s.r*1.15);
    g.addColorStop(0,'rgba(28,24,20,.88)');
    g.addColorStop(0.6,'rgba(62,52,40,.7)');
    g.addColorStop(1,'rgba(80,70,50,0)');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.ellipse(x,y,s.r*1.15,s.r*0.62,0,0,TAU); ctx.fill();
  }
}
/* -----------------------------------------------------------------------
   TALAJSZÖVET

   A talaj korábban egyszínű volt néhány folttal — ránézésre unalmas. Most
   nagyobb, 384 pixeles csempét kap, amibe HÁROM lépték kerül bele:

     1. nagy, lágy színfoltok (rétek, kopottabb sávok, földes részek)
     2. közepes csomók és taposott foltok
     3. finom fűszálak, kavicsok, mohapöttyök, apró virágok

   Ráadásul tájtípusonként más a jellege: a Sivatag homokfodros, a
   Hegyvidék köves, a Rengeteg mohás és leveles.

   A csempe egyszer készül el, utána egyetlen kitöltés az egész képernyő.
   ----------------------------------------------------------------------- */
const GRASS_TILE=384;
let grassKey='', grassPat=null, grassLowFx=false;
function grassPattern(base,alt){
  const M=(typeof curMap==='function')?curMap():null;
  const mk=M?M.key:'mezo';
  const key=base+'|'+alt+'|'+mk;
  if(key===grassKey&&grassPat) return grassPat;
  const c=document.createElement('canvas');
  c.width=c.height=GRASS_TILE;
  const g=c.getContext('2d');
  if(!g) return null;
  const T=GRASS_TILE, R=seedRand('talaj'+key);
  /* NAGYLÉPTÉKŰ VÁLTOZATOSSÁG.

     A fű eddig egyetlen zöld volt: a nagy üres területeken nem volt mit
     nézni. A világosabb és sötétebb rétfoltokat MAGÁBA A CSEMPÉBE festjük,
     nem külön rétegként — így képkockánként semmibe nem kerül. (Először
     teljes képernyős keveréssel csináltam: 230 ezredmásodpercet vitt el.)

     A foltok a csempe szélén körbeérnek, ezért az ismétlődés nem látszik
     éles határként. */
  {
    const RN=seedRand('ret'+key), P=5;
    const pont=[];
    for(let y=0;y<=P;y++){ pont[y]=[]; for(let x=0;x<=P;x++) pont[y][x]=RN(); }
    for(let y=0;y<=P;y++) pont[y][P]=pont[y][0];
    for(let x=0;x<=P;x++) pont[P][x]=pont[0][x];
    const lagy=t=>t*t*(3-2*t), lep=T/P;
    const vilagos=mix(base,'#d6e08a',0.5), sotet=mix(base,'#22381c',0.45);
    for(let cy=0;cy<P;cy++) for(let cx=0;cx<P;cx++){
      // minden rácsmezőt kis négyzetekkel töltünk ki, lágyan interpolálva
      for(let sy=0;sy<6;sy++) for(let sx=0;sx<6;sx++){
        const fx=lagy((sx+0.5)/6), fy=lagy((sy+0.5)/6);
        const a=pont[cy][cx], b=pont[cy][cx+1];
        const c2=pont[cy+1][cx], d2=pont[cy+1][cx+1];
        const v=(a+(b-a)*fx)*(1-fy)+(c2+(d2-c2)*fx)*fy;
        const e=(v-0.5)*2;                         // -1 .. 1
        g.globalAlpha=Math.min(0.5,Math.abs(e)*0.42);
        g.fillStyle=e>0?vilagos:sotet;
        g.fillRect(cx*lep+sx*lep/6-0.5, cy*lep+sy*lep/6-0.5, lep/6+1, lep/6+1);
      }
    }
    g.globalAlpha=1;
  }
  const fold=mix(base,'#8a6f42',0.5);            // földes tónus
  const sotet=shade(base,-0.16), vilag=mix(base,alt,0.8);

  g.fillStyle=base; g.fillRect(0,0,T,T);

  // 1. nagy foltok — ezek adják a nagy léptékű változatosságot
  for(let i=0;i<26;i++){
    const x=R()*T, y=R()*T, r=T*(0.09+R()*0.16);
    const t=R();
    g.fillStyle=t<0.4?vilag:(t<0.72?sotet:fold);
    g.globalAlpha=0.1+R()*0.14;
    g.beginPath();
    g.ellipse(x,y,r,r*(0.5+R()*0.5),R()*TAU,0,TAU); g.fill();
    // a csempe szélén átnyúló másolat, hogy ne legyen látható varrat
    if(x<r) { g.beginPath(); g.ellipse(x+T,y,r,r*0.7,0,0,TAU); g.fill(); }
    if(y<r) { g.beginPath(); g.ellipse(x,y+T,r,r*0.7,0,0,TAU); g.fill(); }
  }
  g.globalAlpha=1;

  // 2. közepes csomók és taposott foltok
  for(let i=0;i<70;i++){
    const x=R()*T, y=R()*T, r=8+R()*26;
    g.fillStyle=R()<0.5?mix(base,alt,0.6+R()*0.4):shade(base,-0.08-R()*0.08);
    g.globalAlpha=0.14+R()*0.16;
    g.beginPath(); g.ellipse(x,y,r,r*(0.45+R()*0.35),R()*TAU,0,TAU); g.fill();
  }
  g.globalAlpha=1;

  // 3/a. tájtípus jellege
  if(mk==='sivatag'||mk==='puszta'){             // homokfodrok
    g.strokeStyle='rgba(190,168,120,.20)';
    for(let i=0;i<34;i++){
      const y=R()*T, x=R()*T, w=40+R()*90;
      g.lineWidth=1.4+R()*1.6;
      g.beginPath();
      g.moveTo(x,y);
      g.quadraticCurveTo(x+w*0.5,y-6-R()*8,x+w,y);
      g.stroke();
    }
  }else if(mk==='hegy'||mk==='kopar'){           // több kavics, kopott sávok
    for(let i=0;i<70;i++){
      const x=R()*T, y=R()*T, r=1.4+R()*3.4;
      g.fillStyle='rgba(146,142,128,'+(0.24+R()*0.3)+')';
      g.beginPath(); g.ellipse(x,y,r,r*0.7,R()*TAU,0,TAU); g.fill();
      g.fillStyle='rgba(255,255,255,.16)';
      g.beginPath(); g.ellipse(x-r*0.3,y-r*0.3,r*0.4,r*0.3,0,0,TAU); g.fill();
    }
  }else if(mk==='erdo'||mk==='tavak'){           // moha és lehullott levelek
    for(let i=0;i<60;i++){
      const x=R()*T, y=R()*T, r=4+R()*11;
      g.fillStyle='rgba(74,110,50,'+(0.14+R()*0.18)+')';
      g.beginPath(); g.ellipse(x,y,r,r*0.65,R()*TAU,0,TAU); g.fill();
    }
    for(let i=0;i<26;i++){
      const x=R()*T, y=R()*T, a=R()*TAU;
      g.save(); g.translate(x,y); g.rotate(a);
      g.fillStyle=['rgba(150,110,52,.30)','rgba(122,92,44,.28)','rgba(168,132,60,.26)'][(R()*3)|0];
      g.beginPath(); g.ellipse(0,0,4.4,2.2,0,0,TAU); g.fill();
      g.restore();
    }
  }

  // 3/b. fűszálak — sűrűn, három rétegben
  const dark=shade(base,-0.3), light=shade(alt,0.2), koz=mix(base,alt,0.5);
  const szalak=(mk==='sivatag')?420:(mk==='puszta'?700:1400);
  for(let i=0;i<szalak;i++){
    const x=R()*T, y=R()*T, h=3+R()*9, lean=(R()-0.5)*4.4;
    const t=R();
    g.strokeStyle=t<0.4?dark:(t<0.75?koz:light);
    g.globalAlpha=0.32+R()*0.34;
    g.lineWidth=0.8+R()*0.7;
    g.beginPath();
    g.moveTo(x,y); g.quadraticCurveTo(x+lean*0.5,y-h*0.6,x+lean,y-h);
    g.stroke();
  }
  g.globalAlpha=1;

  // 3/c. kavicsok és apró virágok
  for(let i=0;i<58;i++){
    const x=R()*T, y=R()*T, r=0.8+R()*1.8;
    g.fillStyle='rgba(150,146,132,'+(0.2+R()*0.28)+')';
    g.beginPath(); g.ellipse(x,y,r,r*0.7,0,0,TAU); g.fill();
  }
  if(mk!=='sivatag'&&mk!=='puszta'){
    const szirmok=['#d8d0a8','#c9a8c4','#d8b45c','#e0e0d0','#c86868'];
    for(let i=0;i<44;i++){
      const x=R()*T, y=R()*T;
      g.fillStyle=szirmok[(R()*szirmok.length)|0];
      g.globalAlpha=0.5+R()*0.4;
      g.beginPath(); g.arc(x,y,1+R()*1.3,0,TAU); g.fill();
    }
    g.globalAlpha=1;
  }
  grassPat=ctx.createPattern(c,'repeat');
  grassKey=key;
  return grassPat;
}
function drawGround(){
  const st=AGES[G.age].style;
  const M=(typeof curMap==='function')?curMap():null;
  const g1=(M&&M.ground)?mix(st.ground,M.ground,0.62):st.ground;
  const g2=(M&&M.ground)?mix(st.ground2,M.ground,0.5):st.ground2;
  ctx.fillStyle=g1;
  ctx.fillRect(0,0,G.vw,G.vh);
  // Fűszövet: egyszer megrajzolt, ismétlődő csempe. Fűszálak, apró
  // kavicsok és színárnyalatok — egyetlen kitöltéssel kerül a képre.
  // Takarékos módban a fűszövet kimarad: az egyszínű talaj olcsóbb, és a
  // növényzet (bokrok, fűcsomók) így is megadja a táj karakterét.
  /* G.lowFx a képkocka-sebesség szerint ingadozhat (28-loop.js), ezért
     csak akkor vesszük figyelembe, ha MEGVÁLTOZOTT az előző képkockához
     képest — így a fűszövet nem villódzik a teljesítmény-hullámokkal. */
  if(G.lowFx!==grassLowFx){ grassLowFx=G.lowFx; grassKey=''; grassPat=null; }
  const pat=grassLowFx?null:grassPattern(g1,g2);
  if(pat){
    ctx.save();
    /* MATEMATIKAI maradék: a `%` negatív számnál negatívat ad, és a
       kamera a pálya széle mögött negatív. Enélkül a szövet átugrik. */
    const mod=(a,b)=>((a%b)+b)%b;
    ctx.translate(-mod(G.cam.x,GRASS_TILE), -mod(G.cam.y,GRASS_TILE));
    ctx.fillStyle=pat;
    ctx.fillRect(0,0,G.vw+GRASS_TILE,G.vh+GRASS_TILE);
    ctx.restore();
  }
  // Nagy, lágy foltok a szövet fölé: így nem lesz gépies az ismétlődés
  const S=160, x0=Math.floor(G.cam.x/S)*S, y0=Math.floor(G.cam.y/S)*S;
  ctx.fillStyle=g2; ctx.globalAlpha=0.5;
  for(let x=x0;x<G.cam.x+G.vw+S;x+=S){
    for(let y=y0;y<G.cam.y+G.vh+S;y+=S){
      const h=((x*73856093)^(y*19349663))>>>0;
      const px=x+(h%90), py=y+((h>>7)%90), r=26+((h>>13)%22);
      ctx.beginPath(); ctx.ellipse(px-G.cam.x,py-G.cam.y,r,r*0.62,0,0,TAU); ctx.fill();
    }
  }
  ctx.globalAlpha=1;

  /* --- A TEREP LÁTSZÓDJÉK ---
     A magasság és a mocsár beleszól a játékba, tehát LÁTNI kell, különben
     a játékos csak annyit érzékel, hogy „valamiért lassabb vagyok”.

     Nem rajzolunk domborzatot: elég a fény. A magasabb cella világosabb,
     a mély fekvés sötétebb — ahogy a napfény éri a lankát. A mocsár
     hidegebb, kékesebb foltot kap.

     Cellánként egy téglalap, csak a képernyőn látható tartományban.
     Takarékos módban kimarad. */
  /* A `G.lowFx` MAGÁTÓL kapcsolgat a képfrissítés szerint (28-loop.js):
     ha esik a sebesség, bekapcsol, ha javul, kikapcsol. Ha a terep
     megjelenése ettől függne, a pálya VILLÓDZNA — hol sötétebb, hol
     világosabb zöld, ahogy a réteg jön-megy.

     Márpedig a terep nem díszítés: a magaslat és a mocsár a játékmenetet
     érinti, tehát MINDIG látszania kell. Cserébe olcsóvá tesszük:
     takarékos módban a mocsarat és az erdőt egyben rajzoljuk, árnyalatok
     nélkül. (A `REDUCED` a valódi takarékos mód — az beállítás, nem
     ingadozik.) */
  if(typeof REDUCED!=='undefined'&&!REDUCED&&G.magas&&typeof FOG_CELL!=='undefined'){
    const c0x=Math.max(0,Math.floor(G.cam.x/FOG_CELL));
    const c0y=Math.max(0,Math.floor(G.cam.y/FOG_CELL));
    const c1x=Math.min(FW-1,Math.ceil((G.cam.x+G.vw)/FOG_CELL));
    const c1y=Math.min(FH-1,Math.ceil((G.cam.y+G.vh)/FOG_CELL));
    for(let cy=c0y;cy<=c1y;cy++){
      for(let cx=c0x;cx<=c1x;cx++){
        const i=cy*FW+cx;
        if(G.water&&G.water[i]) continue;
        const px=cx*FOG_CELL-G.cam.x, py=cy*FOG_CELL-G.cam.y;
        const t=G.terep?G.terep[i]:0;
        if(t===1){                                  // mocsár
          ctx.fillStyle='rgba(74,96,86,.34)';
          ctx.fillRect(px,py,FOG_CELL+1,FOG_CELL+1);
        }else if(t===2){                            // sűrű erdő: mélyzöld árnyék
          ctx.fillStyle='rgba(28,46,26,.22)';
          ctx.fillRect(px,py,FOG_CELL+1,FOG_CELL+1);
        }
        const m=G.magas[i];
        if(m>=2){                                   // magaslat: napfény
          ctx.fillStyle=(m>=3)?'rgba(255,246,208,.13)':'rgba(255,246,208,.07)';
          ctx.fillRect(px,py,FOG_CELL+1,FOG_CELL+1);
        }else if(m===0&&t!==1){                     // mélyföld: enyhe árnyék
          ctx.fillStyle='rgba(0,0,0,.05)';
          ctx.fillRect(px,py,FOG_CELL+1,FOG_CELL+1);
        }
      }
    }
  }

  // Térképhatár
  ctx.strokeStyle='rgba(0,0,0,.45)'; ctx.lineWidth=6;
  ctx.strokeRect(-G.cam.x,-G.cam.y,WORLD.w,WORLD.h);
}
/* =======================================================================
   LELŐHELYEK — fa, kő, arany

   A fákat és a köveket egyszer rajzoljuk meg egy-egy rejtett vászonra,
   utána már csak képként másoljuk. Enélkül a több száz lelőhely
   részletes megrajzolása minden képkockán megfeküdné a gépet.

   Minden típusból négy változat készül, és mindegyik három állapotban:
   érintetlen, félig kitermelt, kimerülőben. A készlet fogyását tehát
   látni is lehet a térképen, nem csak a számokból.
   ===================================================================== */
const NODESPR={};
const NSPR={ wood:{w:70,h:100,ox:35,oy:82},
             stone:{w:60,h:46,ox:30,oy:34},
             gold:{w:60,h:46,ox:30,oy:34},
             coal:{w:60,h:46,ox:30,oy:34} };

// --- lombkorona egy csomója ---
function leafClump(cx,cy,r,base,rand){
  GX.fillStyle=shade(base,-0.28);
  GX.beginPath(); GX.arc(cx,cy+r*0.18,r,0,TAU); GX.fill();
  GX.fillStyle=base;
  GX.beginPath(); GX.arc(cx-r*0.08,cy,r*0.92,0,TAU); GX.fill();
  GX.fillStyle=shade(base,0.16);
  GX.beginPath(); GX.arc(cx-r*0.3,cy-r*0.3,r*0.55,0,TAU); GX.fill();
  GX.fillStyle=shade(base,0.24);
  GX.beginPath(); GX.arc(cx-r*0.44,cy-r*0.44,r*0.19,0,TAU); GX.fill();
  // apró levélfoltok a peremen
  for(let i=0;i<7;i++){
    const a=rand()*TAU, d=r*(0.6+rand()*0.45);
    GX.fillStyle=shade(base,(rand()-0.4)*0.34);
    GX.beginPath(); GX.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*0.9,r*0.13+rand()*r*0.1,0,TAU); GX.fill();
  }
}
function paintTree(rand,stage){
  /* --- A LOMB ÉVSZAKA ---
     A talajszínt korszakonként évszakosra állítottuk; a fák ettől nem
     maradhatnak el, különben nyári zöld korona állna az őszi tarlón.

       tavasz — friss, világoszöld
       nyár   — mély, telt zöld (ez volt az eredeti)
       ősz    — sárga, rozsda, vörös
       tél    — csupasz, szürkésbarna ág, kevés örökzölddel

     Az évszakot a korszak stílusa mondja meg (AGES[..].style.evszak). */
  const EVSZAK_LOMB={
    tavasz:['#5b9a3e','#4f8c36','#6aa848','#468030'],
    nyar:  ['#3f7a32','#356b2a','#48853a','#2f6127'],
    osz:   ['#b5762a','#c9913a','#9a5a24','#7d4a2c'],
    tel:   ['#6b6355','#5a5449','#7a7364','#3f5a3a']
  };
  const evsz=(typeof AGES!=='undefined'&&AGES[G.age]&&AGES[G.age].style)
    ? AGES[G.age].style.evszak : 'nyar';
  const greens=EVSZAK_LOMB[evsz]||EVSZAK_LOMB.nyar;
  const base=greens[Math.floor(rand()*greens.length)];
  const bark='#4a3220', barkL='#66492c';
  GX.fillStyle='rgba(12,20,10,.3)';
  GX.beginPath(); GX.ellipse(3,3,15,6,0,0,TAU); GX.fill();
  if(stage>=2){                                  // kimerülőben: tuskó és ledöntött rönk
    GX.fillStyle=bark;
    GX.beginPath();
    GX.moveTo(-6.5,2); GX.lineTo(-5,-11); GX.lineTo(5,-11); GX.lineTo(6.5,2); GX.closePath(); GX.fill();
    GX.fillStyle=barkL; GX.fillRect(-6,-11,2.4,13);
    GX.fillStyle='#c2a173';                      // frissen vágott lap évgyűrűkkel
    GX.beginPath(); GX.ellipse(0,-11,5.4,2.4,0,0,TAU); GX.fill();
    GX.strokeStyle='rgba(90,66,40,.7)'; GX.lineWidth=0.8;
    for(let i=1;i<4;i++){ GX.beginPath(); GX.ellipse(0,-9,i*1.7,i*0.75,0,0,TAU); GX.stroke(); }
    GX.fillStyle=bark;                           // ledöntött rönk mellette
    GX.save(); GX.translate(12,-2); GX.rotate(0.5);
    GX.fillRect(-9,-2.6,18,5.2);
    GX.fillStyle='#8a6a45'; GX.beginPath(); GX.ellipse(9,0,1.8,2.6,0,0,TAU); GX.fill();
    GX.restore();
    return;
  }
  // törzs: karcsú, alul kiszélesedő gyökérrel
  const th=stage?26:34;
  GX.fillStyle=bark;
  GX.beginPath();
  GX.moveTo(-4.2,2); GX.quadraticCurveTo(-2.2,-th*0.45,-1.7,-th);
  GX.lineTo(1.7,-th); GX.quadraticCurveTo(2.2,-th*0.45,4.2,2);
  GX.closePath(); GX.fill();
  GX.fillStyle=barkL;                            // megvilágított oldal
  GX.beginPath();
  GX.moveTo(-4.2,2); GX.quadraticCurveTo(-2.2,-th*0.45,-1.7,-th);
  GX.lineTo(-0.5,-th); GX.quadraticCurveTo(-0.9,-th*0.45,-1.8,2);
  GX.closePath(); GX.fill();
  GX.fillStyle=shade(bark,-0.3);                 // gyökértalp
  GX.beginPath(); GX.ellipse(0,2,5.2,2,0,0,TAU); GX.fill();
  GX.strokeStyle='rgba(30,20,10,.4)'; GX.lineWidth=0.6;
  for(let i=0;i<3;i++){
    const x=-2.2+i*1.9;
    GX.beginPath(); GX.moveTo(x,0); GX.quadraticCurveTo(x+0.6,-th*0.5,x*0.45,-th+3); GX.stroke();
  }
  // ágak a lomb alá
  GX.strokeStyle=bark; GX.lineWidth=1.9; GX.lineCap='round';
  GX.beginPath();
  GX.moveTo(-1,-th*0.68); GX.lineTo(-9,-th*0.9);
  GX.moveTo(1,-th*0.58);  GX.lineTo(9,-th*0.8);
  GX.moveTo(0,-th*0.85);  GX.lineTo(-5,-th*1.02);
  GX.stroke(); GX.lineCap='butt';
  // lombkorona: egymásra lapoló csomók, felfelé kisebbedve
  const n=stage?4:6, spread=stage?11:15, top=-th-(stage?8:12);
  const pos=[[0,top-2,13.5],[-spread,top+6,11.5],[spread,top+5,11],
             [-spread*0.5,top-9,10.5],[spread*0.55,top-8,10],[0,top-15,8.5]];
  for(let i=0;i<n;i++){
    const p=pos[i];
    leafClump(p[0],p[1],p[2]*(stage?0.86:1),base,rand);
  }
  // néhány lehullott levél a tövénél
  for(let i=0;i<4;i++){
    GX.fillStyle=shade(base,-0.35);
    GX.beginPath(); GX.ellipse(rand()*22-11,rand()*5,1.8,1,rand()*3,0,TAU); GX.fill();
  }
}
// --- egy kőtömb ---
function rockLump(cx,cy,r,base,rand,gold,coal){
  GX.fillStyle=shade(base,-0.34);                // vetett árnyék a kupacban
  GX.beginPath(); GX.ellipse(cx+r*0.12,cy+r*0.3,r,r*0.72,0,0,TAU); GX.fill();
  GX.fillStyle=shade(base,(rand()-0.45)*0.18);   // a kő teste
  GX.beginPath(); GX.ellipse(cx,cy,r,r*0.78,rand()*0.5-0.25,0,TAU); GX.fill();
  GX.fillStyle=shade(base,0.2);                  // felső csillanás
  GX.beginPath(); GX.ellipse(cx-r*0.26,cy-r*0.28,r*0.56,r*0.38,-0.4,0,TAU); GX.fill();
  GX.fillStyle=shade(base,0.4);
  GX.beginPath(); GX.ellipse(cx-r*0.36,cy-r*0.4,r*0.26,r*0.16,-0.4,0,TAU); GX.fill();
  GX.strokeStyle='rgba(30,30,34,.34)'; GX.lineWidth=0.7;   // repedés
  GX.beginPath();
  GX.moveTo(cx-r*0.5,cy+r*0.1);
  GX.lineTo(cx-r*0.1,cy-r*0.05);
  GX.lineTo(cx+r*0.3,cy+r*0.28);
  GX.stroke();
  if(coal){                                      // szén: fényes, szilánkos törésfelület
    GX.fillStyle='rgba(255,255,255,.16)';
    GX.beginPath();
    GX.moveTo(cx-r*0.4,cy-r*0.2); GX.lineTo(cx-r*0.05,cy-r*0.42);
    GX.lineTo(cx+r*0.18,cy-r*0.05); GX.closePath(); GX.fill();
    GX.fillStyle='rgba(120,140,160,.22)';
    GX.beginPath();
    GX.moveTo(cx+r*0.1,cy+r*0.3); GX.lineTo(cx+r*0.44,cy+r*0.02);
    GX.lineTo(cx+r*0.2,cy+r*0.44); GX.closePath(); GX.fill();
  }
  if(gold){                                      // aranyerek és csillanás
    GX.strokeStyle='rgba(226,178,52,.9)'; GX.lineWidth=1.2;
    GX.beginPath();
    GX.moveTo(cx-r*0.45,cy-r*0.1);
    GX.quadraticCurveTo(cx,cy+r*0.12,cx+r*0.45,cy-r*0.18);
    GX.stroke();
    GX.fillStyle='#ffe9a0';
    GX.beginPath(); GX.arc(cx+r*0.2,cy-r*0.3,r*0.13,0,TAU); GX.fill();
    GX.beginPath(); GX.arc(cx-r*0.3,cy+r*0.25,r*0.09,0,TAU); GX.fill();
  }
}
function paintRocks(rand,stage,kind){
  const gold=(kind==='gold'), coal=(kind==='coal');
  const base=gold?'#b98f3e':(coal?'#3b3a3c':'#9aa0a6');
  GX.fillStyle='rgba(12,20,10,.28)';
  GX.beginPath(); GX.ellipse(3,4,21,8,0,0,TAU); GX.fill();
  const counts=[13,8,4], n=counts[stage];
  // kupac: alul szélesebb, fölfelé keskenyedő sorok
  const rows=[
    {y:2,   spread:19, r:6.2, k:5},
    {y:-4,  spread:14, r:6.0, k:4},
    {y:-10, spread:9,  r:5.4, k:3},
    {y:-15, spread:4,  r:4.6, k:1}
  ];
  let left=n;
  for(const row of rows){
    const k=Math.min(row.k,left); left-=k;
    for(let i=0;i<k;i++){
      const t=(k===1)?0:(i/(k-1)-0.5)*2;
      const x=t*row.spread+ (rand()-0.5)*3;
      const y=row.y+(rand()-0.5)*2.4;
      rockLump(x,y,row.r*(0.82+rand()*0.36),base,rand,gold,coal);
    }
    if(left<=0) break;
  }
  // néhány elgurult darab a kupac tövénél
  for(let i=0;i<(stage===2?4:2);i++){
    rockLump(-24+rand()*48,4+rand()*5,2.4+rand()*1.6,base,rand,gold,coal);
  }
}
function nodeSprite(type,variant,stage){
  const key=type+variant+stage;
  if(NODESPR[key]) return NODESPR[key];
  const m=NSPR[type];
  const c=document.createElement('canvas');
  c.width=Math.ceil(m.w*SPR_DPR); c.height=Math.ceil(m.h*SPR_DPR);
  const g=c.getContext('2d');
  g.setTransform(SPR_DPR,0,0,SPR_DPR,0,0);
  g.translate(m.ox,m.oy);
  const prev=GX; GX=g;
  const rand=seedRand('node'+key);
  if(type==='wood') paintTree(rand,stage);
  else paintRocks(rand,stage,type);
  GX=prev;
  NODESPR[key]=c;
  return c;
}
function drawNode(n){
  if(fogAt(n.x,n.y)===0) return;
  const x=n.x-G.cam.x, y=n.y-G.cam.y;
  if(x<-60||y<-70||x>G.vw+60||y>G.vh+60) return;
  if(n.type==='fish'){                            // halraj: hullámgyűrű és halak
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle='rgba(255,255,255,.16)';
    ctx.beginPath(); ctx.ellipse(0,0,n.r+3,(n.r+3)*0.55,0,0,TAU); ctx.fill();
    const ph=G.t*1.4+n.seed;
    for(let i=0;i<4;i++){
      const a=n.seed+i*1.6+ph*0.35, rr=n.r*0.55;
      const fx=Math.cos(a)*rr, fy=Math.sin(a)*rr*0.5;
      ctx.save(); ctx.translate(fx,fy); ctx.rotate(a+1.6);
      ctx.fillStyle=i%2?'#5b7f96':'#7fa3b6';
      ctx.beginPath(); ctx.ellipse(0,0,4.2,2,0,0,TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-4,0); ctx.lineTo(-7,-2.2); ctx.lineTo(-7,2.2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.ellipse(0,0,n.r*(0.6+0.4*((ph%2)/2)),n.r*0.35,0,0,TAU); ctx.stroke();
    ctx.restore(); return;
  }
  // A kitermeltség három fokozatban látszik is
  const f=n.amount/(n.max||1);
  const stage=f>0.62?0:(f>0.26?1:2);
  const sp=nodeSprite(n.type,(n.id||0)%4,stage), m=NSPR[n.type];
  ctx.drawImage(sp,x-m.ox,y-m.oy,m.w,m.h);
}
