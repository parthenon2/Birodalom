/* =======================================================================
   29/B. KEZDŐMENÜ HÁTTERE

   Visszafogott mozgás: lassan sodródó heraldikai alakzatok — pajzsok,
   ékek, körök — nagyon halványan, a nemzet színeiben. Csak akkor fut,
   amikor a menü látszik, és mozgáscsökkentett módban meg sem indul.
   ===================================================================== */
function menuBackdrop(){
  const TAU=Math.PI*2;                          // a modul önállóan is használható
  // Böngészőn kívül (tesztkörnyezet) csendben kimarad
  if(typeof document==='undefined'||typeof requestAnimationFrame!=='function') return;
  const cv=document.getElementById('menuBg');
  if(!cv||!cv.getContext) return;
  const g=cv.getContext('2d');
  if(!g) return;

  let W=0,H=0,dpr=1;
  const ALAK=[];
  function meret(){
    dpr=Math.min((typeof devicePixelRatio!=='undefined'?devicePixelRatio:1)||1,2);
    W=cv.clientWidth||(typeof innerWidth!=='undefined'?innerWidth:1200)||1200;
    H=cv.clientHeight||(typeof innerHeight!=='undefined'?innerHeight:800)||800;
    cv.width=Math.max(1,Math.floor(W*dpr)); cv.height=Math.max(1,Math.floor(H*dpr));
    g.setTransform(dpr,0,0,dpr,0,0);
  }
  function szin(nev,tartalek){
    try{
      const v=getComputedStyle(document.documentElement).getPropertyValue(nev).trim();
      return v||tartalek;
    }catch(e){ return tartalek; }
  }
  // Egy alakzat: fajta, hely, méret, sodródás, forgás
  function ujAlak(kezdeti){
    const f=['pajzs','ek','kor','rombusz'][(Math.random()*4)|0];
    return {
      f, x:Math.random()*W,
      y:kezdeti?Math.random()*H:H+80,
      m:38+Math.random()*120,                 // méret
      v:4+Math.random()*9,                    // emelkedés másodpercenként
      old:(Math.random()-0.5)*5,              // oldalirányú sodródás
      sz:Math.random()*TAU, fs:(Math.random()-0.5)*0.14,
      a:0.03+Math.random()*0.05               // átlátszóság
    };
  }
  function rajzol(a,arany){
    g.save();
    g.translate(a.x,a.y); g.rotate(a.sz);
    g.strokeStyle=arany; g.globalAlpha=a.a; g.lineWidth=1.6;
    const m=a.m;
    if(a.f==='pajzs'){
      g.beginPath();
      g.moveTo(-m*0.42,-m*0.5);
      g.quadraticCurveTo(0,-m*0.62, m*0.42,-m*0.5);
      g.lineTo(m*0.44,m*0.02);
      g.quadraticCurveTo(m*0.4,m*0.44, 0,m*0.62);
      g.quadraticCurveTo(-m*0.4,m*0.44, -m*0.44,m*0.02);
      g.closePath(); g.stroke();
    }else if(a.f==='ek'){
      g.beginPath();
      for(let i=0;i<3;i++){
        const y=-m*0.3+i*m*0.3;
        g.moveTo(-m*0.4,y); g.lineTo(0,y+m*0.22); g.lineTo(m*0.4,y);
      }
      g.stroke();
    }else if(a.f==='kor'){
      g.beginPath(); g.arc(0,0,m*0.42,0,TAU); g.stroke();
      g.beginPath(); g.arc(0,0,m*0.26,0,TAU); g.stroke();
    }else{
      g.beginPath();
      g.moveTo(0,-m*0.5); g.lineTo(m*0.36,0); g.lineTo(0,m*0.5); g.lineTo(-m*0.36,0);
      g.closePath(); g.stroke();
    }
    g.restore();
  }

  let elozo=0, fut=false;
  function lathato(){
    const m=document.getElementById('menu');
    return m && m.style.display!=='none';
  }
  function kep(t){
    if(!lathato()){ fut=false; return; }        // menün kívül nem dolgozunk
    const dt=Math.min(0.05,(t-elozo)/1000||0); elozo=t;
    if(cv.clientWidth!==W||cv.clientHeight!==H) meret();
    g.clearRect(0,0,W,H);
    const arany=szin('--gold','#c9a227');
    for(const a of ALAK){
      a.y-=a.v*dt; a.x+=a.old*dt; a.sz+=a.fs*dt;
      if(a.y<-120){ Object.assign(a,ujAlak(false)); a.y=H+80; }
      if(a.x<-140) a.x=W+120; else if(a.x>W+140) a.x=-120;
      rajzol(a,arany);
    }
    requestAnimationFrame(kep);
  }
  function indit(){
    if(fut) return;
    if(typeof REDUCED!=='undefined'&&REDUCED) return;   // mozgáscsökkentett mód
    meret();
    if(!ALAK.length) for(let i=0;i<16;i++) ALAK.push(ujAlak(true));
    fut=true; elozo=(typeof performance!=='undefined'&&performance.now)?performance.now():0;
    requestAnimationFrame(kep);
  }
  if(typeof addEventListener==='function') addEventListener('resize',()=>{ if(fut) meret(); });
  // A menü megjelenésekor indul: a menuPage minden váltásnál meghívja
  window.menuBgStart=indit;
  indit();
}
menuBackdrop();

