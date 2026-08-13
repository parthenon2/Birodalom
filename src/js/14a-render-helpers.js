/* =======================================================================
   14. RAJZOLÁS — ÉPÜLETEK (2,5D sprite-rendszer)

   Minden épület egyszer, indításkor kirajzolódik egy rejtett vászonra
   (sprite gyorsítótár), utána már csak képként másoljuk a képernyőre.
   Így engedhetjük meg magunknak a sok apró követ, téglát, cserepet és
   ablakot anélkül, hogy a képkockaszám leesne.

   Felépítés minden épületnél:
     vetett árnyék -> déli homlokzat (falfelület) -> tetőfelület ->
     részletek (tornyok, kémények, ablakok, homokzsákok) -> zászló.
   A fény balról felülről esik, ezért a homlokzat teteje világosabb,
   az alja és a jobb oldala sötétebb.
   ===================================================================== */
// Színvakbarát mód: az Okabe–Ito paletta kék/narancs párosa, ami mind a
// három gyakori színtévesztés-típusnál elkülönül. A csapatokat ráadásul
// alakzat is megkülönbözteti: a saját egység talpgyűrűje folytonos, az
// ellenségé szaggatott.
const CB={ me:'#0072B2', meAcc:'#56B4E9', foe:'#E69F00', foeAcc:'#D55E00' };
/* Kettőnél több fél esetén nem elég a „te / ellenség” páros: mindenki
   saját csapatszínt kap az OLDAL_SZINEK palettáról. Két félnél viszont
   marad a megszokott kép — a te nemzeti színed és a koalíció lilája —,
   hogy a meglévő játszmák látványa ne változzon. */
function tobbOldal(){ return (typeof oldalDb==='function') && oldalDb()>2; }
function ownerColor(o){
  if(tobbOldal()) return szinOf(o).szin;
  if(G.cb) return o?CB.foe:CB.me;
  return o?ENEMY.color:NATIONS[G.nation].color;
}
function ownerAccent(o){
  if(tobbOldal()) return szinOf(o).kiemel;
  if(G.cb) return o?CB.foeAcc:CB.meAcc;
  return o?ENEMY.accent:NATIONS[G.nation].accent;
}
function toggleColorblind(){
  G.cb=!G.cb;
  for(const k in SPRITES) delete SPRITES[k];     // a csapatszín bele van sütve
  for(const k in USPR) delete USPR[k];
  /* Minden fél sprite-jait újra kell melegíteni: a csapatszín bele van
     sütve a képekbe. */
  G.warmQ=[];
  if(G.oldalak&&G.oldalak.length){ for(const o of G.oldalak) warmSprites(o.age||0,o.i); }
  else { warmSprites(G.age,0); warmSprites(G.ai?G.ai.age:0,1); }
  const st=$('cbState'); if(st) st.textContent=G.cb?T('be'):T('ki');
  toast(T(G.cb?'uzSzinvakBe':'uzSzinvakKi'));
  SFX.play('click');
}

let GX=ctx;   // az aktuális rajzkontextus (sprite készítésekor átvált)

// Épületmagasságok korszakonként — ez adja a térbeliséget
// Az épületstílus a korszakból indul, és a nemzet építészeti palettája
// felé tolódik: a tető, a fal és a díszítés kap nemzeti hangsúlyt.
const ST_CACHE={};
function stFor(age,owner){
  /* Az ÉPÍTÉSZETI stílus a fél saját nemzetéből jön. A régi alak minden
     nem-nulla tulajdonost „a gép”-nek vett, ezért több félnél mindenki
     ugyanolyan házakat épített volna. */
  const nk=(typeof nationOf==='function')?nationOf(owner)
           :(owner?(G.ai&&G.ai.nation||'de'):G.nation);
  const key=age+'|'+nk;
  if(ST_CACHE[key]) return ST_CACHE[key];
  const base=AGES[age].style, a=NATIONS[nk]&&NATIONS[nk].arch;
  const st=Object.assign({},base);
  if(a){
    // A szigetlakóknál a nemzeti anyag szinte teljesen felülírja a korszakot:
    // pálmalevél tető, fatörzs fal — nem kő és nem cserép.
    const ero=(NATIONS[nk]&&NATIONS[nk].noAge)?0.92:0.58;
    st.roof=mix(base.roof,a.roof,ero);
    st.wall=mix(base.wall,a.wall,ero);
    st.wallDark=mix(base.wallDark,a.wall,0.30);
    st.wood=mix(base.wood,a.roof,0.18);
    st.trim=a.trim;
  }
  ST_CACHE[key]=st;
  return st;
}
const BH={hq:[58,52,56,38], barracks:[34,32,36,30], farm:[16,18,18,16],
          academy:[46,48,50,36], temple:[50,54,48,38], harbor:[34,38,40,32], gate:[26,26,24,18],
          airfield:[10,10,10,26], house:[30,32,34,30], smith:[32,34,36,34], hospital:[30,32,34,32], market:[26,28,30,28], goldmine:[24,26,28,26], sugar:[20,22,24,22], lumber:[22,24,26,24],
          tower:[66,44,60,26], wall:[20,22,20,15],
          /* ISTÁLLÓ — a v7.4-ben került a játékba, de ebből a táblából
             KIMARADT. A renderVilag `BH[e.type][e.age]`-t olvas, tehát
             minden képkockán `undefined[0]`-ra futott, amint egy istálló
             a képre került. A rajzolás elszállt, a köd eltűnt, és a
             következő játszma fekete képernyővel indult.

             Hosszú, földszintes épület: alacsonyabb a kaszárnyánál. */
          stable:[30,28,32,28]};

/* A MAGASSÁG BIZTONSÁGOS LEKÉRDEZÉSE.

   A tábla kézzel írt, az épületek listája pedig bővül — ez a kettő
   előbb-utóbb újra szétcsúszik. Egy hiányzó bejegyzés miatt viszont ne
   dőljön el az egész rajzolás: adjunk ésszerű alapértéket.

   A tábla kiegészítése ettől még a helyes megoldás; ez csak a háló. */
function bhOf(type, age){
  const t = BH[type];
  if(!t) return 28;                       // ismeretlen épület: közepes magasság
  const v = t[age|0];
  return (typeof v === 'number' && isFinite(v)) ? v : (t[0] || 28);
}

/* ---------- szín- és zajsegédek ---------- */
function shade(c,t){                      // t<0: sötétít, t>0: világosít
  let r,gg,b;
  if(c[0]==='#'){const n=parseInt(c.slice(1),16);r=(n>>16)&255;gg=(n>>8)&255;b=n&255;}
  else{const m=c.match(/\d+/g);r=+m[0];gg=+m[1];b=+m[2];}
  const f=t<0?0:255, k=Math.min(1,Math.abs(t));
  r=Math.round(r+(f-r)*k); gg=Math.round(gg+(f-gg)*k); b=Math.round(b+(f-b)*k);
  return 'rgb('+r+','+gg+','+b+')';
}
function seedRand(str){                   // determinisztikus zaj a textúrákhoz
  let s=0; for(let i=0;i<str.length;i++) s=(s*31+str.charCodeAt(i))>>>0;
  s=s||1;
  return ()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};
}
function clipBox(x,y,w,h,fn){GX.save();GX.beginPath();GX.rect(x,y,w,h);GX.clip();fn();GX.restore();}

/* ---------- felületi textúrák ---------- */
function texAshlar(x,y,w,h,base,rand,bw,bh){       // faragott kőkvádersor
  clipBox(x,y,w,h,()=>{
    GX.fillStyle=shade(base,-0.42); GX.fillRect(x,y,w,h);      // fuga
    for(let j=0,ry=y;ry<y+h;ry+=bh,j++){
      const off=(j%2)*bw*0.5;
      for(let rx=x-bw;rx<x+w+bw;rx+=bw){
        GX.fillStyle=shade(base,(rand()-0.5)*0.26);
        GX.fillRect(rx+off+0.9,ry+0.9,bw-1.8,bh-1.8);
        GX.fillStyle='rgba(255,252,238,.09)';
        GX.fillRect(rx+off+0.9,ry+0.9,bw-1.8,1.1);             // felső él csillanása
      }
    }
  });
}
function texBrick(x,y,w,h,base,rand){              // téglakötés
  clipBox(x,y,w,h,()=>{
    GX.fillStyle=shade(base,0.30); GX.fillRect(x,y,w,h);       // világos habarcs
    const bw=10,bh=5;
    for(let j=0,ry=y;ry<y+h;ry+=bh,j++){
      const off=(j%2)*bw*0.5;
      for(let rx=x-bw;rx<x+w+bw;rx+=bw){
        GX.fillStyle=shade(base,(rand()-0.55)*0.30);
        GX.fillRect(rx+off+0.7,ry+0.7,bw-1.4,bh-1.4);
      }
    }
  });
}
function texPlaster(x,y,w,h,base,rand){            // vakolt homlokzat
  clipBox(x,y,w,h,()=>{
    GX.fillStyle=base; GX.fillRect(x,y,w,h);
    for(let i=0;i<Math.max(8,(w*h)/220);i++){
      GX.fillStyle='rgba(0,0,0,'+(rand()*0.05)+')';
      GX.beginPath();
      GX.ellipse(x+rand()*w,y+rand()*h,3+rand()*9,2+rand()*6,rand()*3,0,TAU);
      GX.fill();
    }
  });
}
function texConcrete(x,y,w,h,base,rand){           // beton zsaluléc-nyomokkal
  clipBox(x,y,w,h,()=>{
    GX.fillStyle=base; GX.fillRect(x,y,w,h);
    for(let ry=y;ry<y+h;ry+=7){
      GX.fillStyle='rgba(0,0,0,.10)'; GX.fillRect(x,ry,w,1);
      GX.fillStyle='rgba(255,255,255,.05)'; GX.fillRect(x,ry+1,w,1);
    }
    for(let i=0;i<w*h/260;i++){
      GX.fillStyle='rgba(0,0,0,'+(rand()*0.07)+')';
      GX.beginPath(); GX.ellipse(x+rand()*w,y+rand()*h,4+rand()*10,3+rand()*6,0,0,TAU); GX.fill();
    }
  });
}
function texPlank(x,y,w,h,base,rand,vert){         // deszkázat
  clipBox(x,y,w,h,()=>{
    GX.fillStyle=base; GX.fillRect(x,y,w,h);
    const step=7;
    if(vert){ for(let rx=x;rx<x+w;rx+=step){
        GX.fillStyle=shade(base,(rand()-0.5)*0.22); GX.fillRect(rx,y,step-1,h);
        GX.fillStyle='rgba(0,0,0,.20)'; GX.fillRect(rx+step-1,y,1,h); } }
    else { for(let ry=y;ry<y+h;ry+=step){
        GX.fillStyle=shade(base,(rand()-0.5)*0.22); GX.fillRect(x,ry,w,step-1);
        GX.fillStyle='rgba(0,0,0,.20)'; GX.fillRect(x,ry+step-1,w,1); } }
  });
}
function texTiles(x,y,w,h,base,rand,rowH){         // cserép- vagy palatető
  clipBox(x,y,w,h,()=>{
    GX.fillStyle=shade(base,-0.25); GX.fillRect(x,y,w,h);
    for(let j=0,ry=y;ry<y+h+rowH;ry+=rowH,j++){
      const off=(j%2)*rowH*0.7;
      for(let rx=x-rowH;rx<x+w+rowH;rx+=rowH*1.4){
        GX.fillStyle=shade(base,(rand()-0.45)*0.24);
        GX.beginPath();
        GX.moveTo(rx+off,ry+rowH);
        GX.lineTo(rx+off,ry+rowH*0.35);
        GX.quadraticCurveTo(rx+off+rowH*0.7,ry-rowH*0.25,rx+off+rowH*1.4,ry+rowH*0.35);
        GX.lineTo(rx+off+rowH*1.4,ry+rowH);
        GX.closePath(); GX.fill();
      }
      GX.fillStyle='rgba(0,0,0,.16)'; GX.fillRect(x,ry+rowH-1,w,1.4);
    }
  });
}
function texThatch(x,y,w,h,base,rand){             // zsúptető
  clipBox(x,y,w,h,()=>{
    GX.fillStyle=base; GX.fillRect(x,y,w,h);
    for(let ry=y;ry<y+h+6;ry+=6){
      GX.fillStyle=shade(base,-0.34);
      GX.beginPath(); GX.moveTo(x,ry+5);
      for(let rx=x;rx<x+w;rx+=8) GX.quadraticCurveTo(rx+4,ry+2+rand()*2,rx+8,ry+5);
      GX.lineTo(x+w,ry+7); GX.lineTo(x,ry+7); GX.closePath(); GX.fill();
    }
    GX.fillStyle='rgba(0,0,0,.26)'; GX.fillRect(x,y+h-3.5,w,3.5);   // eresz árnyéka
    for(let i=0;i<w/3;i++){
      GX.strokeStyle='rgba(0,0,0,.12)'; GX.lineWidth=1;
      const sx0=x+rand()*w, sy0=y+rand()*h;
      GX.beginPath(); GX.moveTo(sx0,sy0); GX.lineTo(sx0+rand()*4-2,sy0+5); GX.stroke();
    }
  });
}

/* ---------- megvilágítás ---------- */
function faceShade(x,y,w,h){        // függőleges homlokzat fény-árnyék játéka
  let gr=GX.createLinearGradient(0,y,0,y+h);
  gr.addColorStop(0,'rgba(255,246,214,.17)');
  gr.addColorStop(.5,'rgba(0,0,0,0)');
  gr.addColorStop(1,'rgba(0,0,0,.34)');
  GX.fillStyle=gr; GX.fillRect(x,y,w,h);
  gr=GX.createLinearGradient(x,0,x+w,0);
  gr.addColorStop(0,'rgba(255,255,255,.07)');
  gr.addColorStop(.62,'rgba(0,0,0,0)');
  gr.addColorStop(1,'rgba(0,0,0,.24)');
  GX.fillStyle=gr; GX.fillRect(x,y,w,h);
}
function roofShade(x,y,w,h){        // vízszintes tetőfelület
  const gr=GX.createLinearGradient(x,y,x+w,y+h);
  gr.addColorStop(0,'rgba(255,248,222,.14)');
  gr.addColorStop(1,'rgba(0,0,0,.20)');
  GX.fillStyle=gr; GX.fillRect(x,y,w,h);
}
/* A vetett árnyék NEM sülhet bele az épület képébe: az kép a gyorsítótárban
   ül, az árnyék viszont a nap állásával fordul. Ezért a sprite készítésekor
   kihagyjuk, és minden képkockán élőben rajzoljuk a helyére. */
let SHADOW_BAKE=false;              // sprite-készítés közben igaz
function groundShadow(w,h,H){
  if(SHADOW_BAKE) return;           // a képbe nem rajzolunk árnyékot
  shadowShape(GX,w,h,H);
}
// Az árnyék alakja — ugyanaz a rajz, akárhonnan hívjuk
function shadowShape(g,w,h,H){
  const s=(typeof sunShadow==='function')?sunShadow():{dx:0.34,dy:0.17};
  const ox=H*s.dx, oy=H*s.dy;
  g.fillStyle='rgba(12,20,10,.30)';
  g.beginPath();
  g.moveTo(-w/2,-h/2); g.lineTo(w/2,-h/2);
  g.lineTo(w/2+ox,h/2+oy); g.lineTo(-w/2+ox,h/2+oy);
  g.closePath(); g.fill();
  g.fillStyle='rgba(12,20,10,.22)';
  g.beginPath(); g.ellipse(ox*0.4,h/2+2,w*0.56,h*0.2,0,0,TAU); g.fill();
}

/* ---------- építészeti elemek ---------- */
function battlements(x,y,w,h,base,rand,mw,t){   // pártázat a tetőperemen
  GX.fillStyle=shade(base,0.16);
  GX.fillRect(x,y,w,t); GX.fillRect(x,y+h-t,w,t);
  GX.fillRect(x,y,t,h); GX.fillRect(x+w-t,y,t,h);
  clipBox(x,y,w,h,()=>{
    for(let i=x+mw*0.7;i<x+w-mw;i+=mw*2){
      GX.fillStyle=shade(base,-0.5); GX.fillRect(i,y,mw,t*0.6);
      GX.fillStyle=shade(base,-0.34); GX.fillRect(i,y+h-t*0.6,mw,t*0.6);
    }
    for(let j=y+mw*0.7;j<y+h-mw;j+=mw*2){
      GX.fillStyle=shade(base,-0.5); GX.fillRect(x,j,t*0.6,mw);
      GX.fillStyle=shade(base,-0.34); GX.fillRect(x+w-t*0.6,j,t*0.6,mw);
    }
    GX.fillStyle='rgba(0,0,0,.10)';
    for(let i=0;i<w;i+=6) GX.fillRect(x+i,y+t,4,1);
  });
  GX.strokeStyle='rgba(0,0,0,.28)'; GX.lineWidth=1.4;
  GX.strokeRect(x+t,y+t,w-2*t,h-2*t);
}
function archWindow(cx,y,w,h,glass,frame){      // íves ablak üvegcsillanással
  GX.fillStyle=frame||'#3a3128';
  GX.beginPath();
  GX.moveTo(cx-w/2-1.5,y+h); GX.lineTo(cx-w/2-1.5,y+w/2);
  GX.arc(cx,y+w/2,w/2+1.5,Math.PI,0); GX.lineTo(cx+w/2+1.5,y+h); GX.closePath(); GX.fill();
  const gr=GX.createLinearGradient(cx-w/2,y,cx+w/2,y+h);
  gr.addColorStop(0,shade(glass,0.35)); gr.addColorStop(.5,glass); gr.addColorStop(1,shade(glass,-0.45));
  GX.fillStyle=gr;
  GX.beginPath();
  GX.moveTo(cx-w/2,y+h); GX.lineTo(cx-w/2,y+w/2);
  GX.arc(cx,y+w/2,w/2,Math.PI,0); GX.lineTo(cx+w/2,y+h); GX.closePath(); GX.fill();
  GX.fillStyle='rgba(255,255,255,.22)';
  GX.beginPath(); GX.moveTo(cx-w/2,y+h); GX.lineTo(cx,y+w*0.3); GX.lineTo(cx-w/2,y+w*0.3); GX.closePath(); GX.fill();
  GX.fillStyle='rgba(20,18,15,.55)';
  GX.fillRect(cx-0.7,y+w*0.25,1.4,h-w*0.25);
}
function rectWindow(x,y,w,h,glass,frame,bars){  // egyenes záródású ablak
  GX.fillStyle=frame||'#3a3128'; GX.fillRect(x-1.5,y-1.5,w+3,h+3);
  const gr=GX.createLinearGradient(x,y,x+w,y+h);
  gr.addColorStop(0,shade(glass,0.4)); gr.addColorStop(.55,glass); gr.addColorStop(1,shade(glass,-0.4));
  GX.fillStyle=gr; GX.fillRect(x,y,w,h);
  GX.fillStyle='rgba(255,255,255,.20)';
  GX.beginPath(); GX.moveTo(x,y+h); GX.lineTo(x+w,y); GX.lineTo(x+w,y+h*0.2); GX.lineTo(x+w*0.2,y+h); GX.closePath(); GX.fill();
  if(bars!==false){
    GX.fillStyle='rgba(25,22,18,.6)';
    GX.fillRect(x+w/2-0.6,y,1.2,h); GX.fillRect(x,y+h/2-0.6,w,1.2);
  }
}
function woodGate(cx,baseY,w,hgt,st,rand,arched){ // kapu vasalással
  GX.fillStyle=shade(st.wall,-0.5);
  GX.beginPath();
  if(arched){
    GX.moveTo(cx-w/2-3,baseY); GX.lineTo(cx-w/2-3,baseY-hgt+w/2);
    GX.arc(cx,baseY-hgt+w/2,w/2+3,Math.PI,0); GX.lineTo(cx+w/2+3,baseY);
  }else GX.rect(cx-w/2-3,baseY-hgt,w+6,hgt);
  GX.closePath(); GX.fill();
  clipBox(cx-w/2,baseY-hgt,w,hgt,()=>{
    texPlank(cx-w/2,baseY-hgt,w,hgt,st.wood,rand,true);
    GX.fillStyle='rgba(0,0,0,.35)';
    GX.fillRect(cx-w/2,baseY-hgt+hgt*0.25,w,2.2);
    GX.fillRect(cx-w/2,baseY-hgt+hgt*0.72,w,2.2);
    GX.fillStyle='rgba(255,255,255,.10)';
    GX.fillRect(cx-w/2,baseY-hgt+hgt*0.25-1,w,1);
  });
  GX.fillStyle='#2a2620';
  GX.beginPath(); GX.arc(cx+w*0.28,baseY-hgt*0.5,1.8,0,TAU); GX.fill();
  GX.fillStyle='rgba(0,0,0,.45)'; GX.fillRect(cx-w/2,baseY-3,w,3);
}
function arrowSlit(cx,cy,hgt){
  GX.fillStyle='rgba(18,16,14,.85)';
  GX.fillRect(cx-1.4,cy,2.8,hgt);
  GX.fillRect(cx-4,cy+hgt*0.42,8,2.4);
}
function sandbagRing(w,h,H,rand){                 // homokzsákkoszorú a lábazat körül
  const y=h/2-4;
  for(let i=0;i<2;i++){
    for(let x=-w/2-4;x<w/2+4;x+=11){
      GX.fillStyle=shade('#a89464',(rand()-0.5)*0.3);
      GX.beginPath(); GX.ellipse(x+(i%2)*5,y-i*6,6,4,0.05,0,TAU); GX.fill();
      GX.fillStyle='rgba(0,0,0,.18)';
      GX.beginPath(); GX.ellipse(x+(i%2)*5,y-i*6+2,6,2,0,0,TAU); GX.fill();
    }
  }
}
function camoBlotches(x,y,w,h,rand,cols){
  clipBox(x,y,w,h,()=>{
    for(let i=0;i<7;i++){
      GX.fillStyle=cols[i%cols.length];
      GX.globalAlpha=.55;
      GX.beginPath();
      GX.ellipse(x+rand()*w,y+rand()*h,7+rand()*16,5+rand()*10,rand()*3,0,TAU);
      GX.fill();
    }
    GX.globalAlpha=1;
  });
}
function roundTower(cx,cy,th,r,st,rand,roofColor,capStyle){
  // henger palástja
  clipBox(cx-r,cy-th,2*r,th+r*0.5,()=>{
    texAshlar(cx-r,cy-th,2*r,th+r*0.5,st.wall,rand,11,8);
    const gr=GX.createLinearGradient(cx-r,0,cx+r,0);
    gr.addColorStop(0,'rgba(0,0,0,.42)'); gr.addColorStop(.34,'rgba(255,250,230,.16)');
    gr.addColorStop(.72,'rgba(0,0,0,.12)'); gr.addColorStop(1,'rgba(0,0,0,.48)');
    GX.fillStyle=gr; GX.fillRect(cx-r,cy-th,2*r,th+r*0.5);
  });
  GX.fillStyle='rgba(0,0,0,.3)';
  GX.beginPath(); GX.ellipse(cx,cy,r,r*0.44,0,0,Math.PI); GX.fill();
  arrowSlit(cx,cy-th*0.55,10);
  // korona
  GX.fillStyle=shade(st.wall,0.18);
  GX.beginPath(); GX.ellipse(cx,cy-th,r,r*0.5,0,0,TAU); GX.fill();
  GX.strokeStyle='rgba(0,0,0,.3)'; GX.lineWidth=1.2; GX.stroke();
  /* --- NEMZETI TORONYSISAK ---
     A kúp mindenhol kúp volt; a nemzet csak a SZÍNÉN látszott. Pedig a
     tetőforma az, ami a várost messziről elárulja: az orosz hagymakupola,
     a meredek gótikus gúla, a lapos mediterrán sátortető.

     A `capStyle` továbbra is dönt arról, hogy VAN-E sisak (a nyitott
     lőállásnak nincs); a FORMÁT a nemzet adja hozzá. */
  const nemzetiSisak=(typeof toronySisakForma==='function')
    ? toronySisakForma() : 'kup';
  if(capStyle==='cone'&&nemzetiSisak!=='kup'){
    toronySisakRajz(nemzetiSisak,cx,cy,th,r,roofColor,st);
  }
  else if(capStyle==='cone'){                  // kúpos zsindelytető
    GX.fillStyle=shade(roofColor,-0.1);
    GX.beginPath();
    GX.moveTo(cx,cy-th-r*1.9); GX.lineTo(cx+r*1.12,cy-th+r*0.18);
    GX.lineTo(cx-r*1.12,cy-th+r*0.18); GX.closePath(); GX.fill();
    GX.strokeStyle='rgba(0,0,0,.22)'; GX.lineWidth=1;
    for(let i=1;i<5;i++){
      const t=i/5;
      GX.beginPath();
      GX.moveTo(cx-r*1.12*t,cy-th-r*1.9+(r*2.08)*t);
      GX.lineTo(cx+r*1.12*t,cy-th-r*1.9+(r*2.08)*t);
      GX.stroke();
    }
    GX.fillStyle='rgba(255,250,225,.16)';
    GX.beginPath(); GX.moveTo(cx,cy-th-r*1.9); GX.lineTo(cx-r*0.5,cy-th+r*0.1); GX.lineTo(cx-r*1.12,cy-th+r*0.18); GX.closePath(); GX.fill();
  }else{                                       // nyitott lőállás
    GX.fillStyle=shade(st.wall,-0.3);
    GX.beginPath(); GX.ellipse(cx,cy-th,r*0.7,r*0.34,0,0,TAU); GX.fill();
    for(let i=0;i<8;i++){
      const a=i/8*TAU;
      GX.fillStyle=shade(st.wall,0.2);
      GX.fillRect(cx+Math.cos(a)*r*0.86-2.6,cy-th+Math.sin(a)*r*0.44-2.4,5.2,4.8);
    }
  }
}
