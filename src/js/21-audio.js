/* =======================================================================
   17/C. HANGOK

   Nincs külső hangfájl: minden effekt a Web Audio API-val, oszcillátorból
   és szűrt zajból készül. A hangok a kamerához képest szólalnak meg —
   ami a képernyőn kívül történik, azt nem halljuk, a bal-jobb irány
   pedig a sztereó képben is megjelenik.
   ===================================================================== */
const SFX={
  vol:1,
  setVol(v){                                 // 0 és 1 közötti hangerő
    this.vol=v;
    if(this.master) this.master.gain.value=0.34*v;
  },
  ac:null, master:null, noise:null, on:true, last:{},
  init(){
    if(this.ac) return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return;
    try{ this.ac=new AC(); }catch(e){ return; }
    this.master=this.ac.createGain(); this.master.gain.value=0.34*(this.vol===undefined?1:this.vol);
    const comp=this.ac.createDynamicsCompressor();
    this.master.connect(comp); comp.connect(this.ac.destination);
    const len=Math.floor(this.ac.sampleRate*0.7);
    const b=this.ac.createBuffer(1,len,this.ac.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    this.noise=b;
  },
  out(pan){
    const g=this.ac.createGain(); g.gain.value=1;
    if(this.ac.createStereoPanner){
      const p=this.ac.createStereoPanner(); p.pan.value=clamp(pan||0,-1,1);
      g.connect(p); p.connect(this.master);
    }else g.connect(this.master);
    return g;
  },
  tone(f0,f1,dur,type,vol,pan,delay){
    const t=this.ac.currentTime+(delay||0), v=Math.max(0.002,vol);
    const o=this.ac.createOscillator(); o.type=type||'square';
    o.frequency.setValueAtTime(f0,t);
    if(f1&&f1!==f0) o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    const g=this.out(pan);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.linearRampToValueAtTime(v,t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
    o.connect(g); o.start(t); o.stop(t+dur+0.03);
  },
  noiseHit(dur,vol,f0,f1,q,pan,delay,type){
    const t=this.ac.currentTime+(delay||0), v=Math.max(0.002,vol);
    const s=this.ac.createBufferSource(); s.buffer=this.noise; s.loop=true;
    const bp=this.ac.createBiquadFilter(); bp.type=type||'bandpass';
    bp.frequency.setValueAtTime(f0,t);
    if(f1) bp.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);
    bp.Q.value=q||1;
    const g=this.out(pan);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.linearRampToValueAtTime(v,t+0.005);
    g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
    s.connect(bp); bp.connect(g); s.start(t); s.stop(t+dur+0.03);
  },
  play(name,vol,pan){
    if(!this.on||!this.ac) return;
    /* A társak parancsainak hangja sem a te dolgod: enélkül a másik
       játékos minden kattintása kattanna és csilingelne nálad is. */
    if(typeof G!=='undefined'&&G.parancsFut&&typeof helyiFel==='function'
       &&G.enId!==helyiFel()) return;
    const now=performance.now(), cd=SFX_CD[name]||70;
    if(this.last[name]&&now-this.last[name]<cd) return;
    this.last[name]=now;
    const f=SFX_LIB[name]; if(!f) return;
    if(this.ac.state==='suspended'){ try{this.ac.resume();}catch(e){} }
    try{ f(this,clamp(vol===undefined?1:vol,0.02,1.4),pan||0); }catch(e){}
  },
  // térbeli lejátszás világkoordináta alapján
  at(name,wx,wy,vol){
    if(!this.on||!this.ac) return;
    const cx=G.cam.x+G.vw/2, cy=G.cam.y+G.vh/2;
    const dx=(wx-cx)/(G.vw*0.62), dy=(wy-cy)/(G.vh*0.62);
    const d=Math.hypot(dx,dy);
    if(d>1.4) return;
    this.play(name,(vol||1)*(1-d*0.55),clamp(dx,-1,1));
  }
};
const SFX_CD={arrow:55,musket:75,rifle:65,mg:110,cannon:130,clang:75,die:120,hit:80,hoof:420,
              select:55,move:55,click:40,train:110,ready:200,place:120,destroy:180};
/* =======================================================================
   HELYHEZ KÖTÖTT HANG

   A csatatéren mindig több tucat dolog történik egyszerre. Ha mind
   ugyanolyan hangosan szólna, az zaj lenne, nem hangkép. Két szabály
   szerint halkítunk:

     · ami a KÉPERNYŐN KÍVÜL van, az halkabb; ami messze, az néma
     · a bal-jobb elhelyezés a képernyő közepéhez képest dől el

   Így a szemeddel követett csata szól hangosan, a térkép túlsó
   sarkában folyó pedig nem zavar. */
function helyHang(nev, x, y, ero){
  if(typeof SFX==='undefined'||!SFX.on) return;
  if(typeof G==='undefined'||!G.cam) return;
  const z=G.zoom||1;
  const kx=(x-G.cam.x)*z, ky=(y-G.cam.y)*z;
  const w=(typeof cv!=='undefined'&&cv)?cv.width:1280;
  const h=(typeof cv!=='undefined'&&cv)?cv.height:720;
  /* Mennyire van kívül? 0 = a képernyőn, 1 = épp a szélén túl. */
  const kiX=Math.max(0,Math.abs(kx-w/2)-w/2)/(w*0.9);
  const kiY=Math.max(0,Math.abs(ky-h/2)-h/2)/(h*0.9);
  const ki=Math.max(kiX,kiY);
  if(ki>1) return;                       // túl messze: meg sem szólal
  const halk=1-ki*0.85;
  const pan=Math.max(-1,Math.min(1,(kx-w/2)/(w/2)))*0.6;
  SFX.play(nev,(ero||1)*halk,pan);
}

/* Melyik hang jár ennek a támadásnak? */
function harcHang(a,cel,spd){
  if(!a) return;
  const kor=a.age|0;
  let nev;
  if(spd){
    /* Lövedék: a korszak dönti el, mit hallasz. */
    if(a.guns||a.kind==='build'&&a.type==='tower'&&kor>=2) nev='cannon';
    else if(a.role==='siege') nev='cannon';
    else if(kor===0) nev='arrow';
    else if(kor===1) nev='musket';
    else if(kor===2) nev='rifle';
    else nev=(a.role==='ranged')?'mg':'rifle';
  }else{
    /* Közelharc: penge a pengén. A munkás nem karddal üt, az tompább. */
    nev=(a.role==='worker')?'hit':'clang';
  }
  helyHang(nev,a.x,a.y,spd?0.75:0.85);
}

const SFX_LIB={
  click:  (S,v,p)=>{S.tone(430,300,0.05,'square',0.13*v,p);},
  select: (S,v,p)=>{S.tone(680,900,0.07,'triangle',0.18*v,p);},
  move:   (S,v,p)=>{S.tone(300,430,0.09,'triangle',0.15*v,p);},
  deny:   (S,v,p)=>{S.tone(180,120,0.16,'sawtooth',0.16*v,p);},
  place:  (S,v,p)=>{S.noiseHit(0.2,0.24*v,700,220,1,p); S.tone(150,80,0.18,'square',0.14*v,p);},
  ready:  (S,v,p)=>{S.tone(523,523,0.11,'triangle',0.18*v,p); S.tone(784,784,0.16,'triangle',0.16*v,p,0.1);},
  train:  (S,v,p)=>{S.tone(392,523,0.13,'square',0.13*v,p);},
  arrow:  (S,v,p)=>{S.noiseHit(0.13,0.24*v,2800,850,7,p);},
  musket: (S,v,p)=>{S.noiseHit(0.24,0.46*v,1300,170,0.8,p); S.tone(95,38,0.2,'square',0.2*v,p);},
  rifle:  (S,v,p)=>{S.noiseHit(0.15,0.42*v,2300,320,1.3,p); S.tone(140,55,0.12,'square',0.15*v,p);},
  mg:     (S,v,p)=>{for(let i=0;i<4;i++) S.noiseHit(0.06,0.26*v,1900,700,1.6,p,i*0.05);},
  cannon: (S,v,p)=>{S.noiseHit(0.5,0.55*v,620,60,0.6,p); S.tone(72,28,0.45,'sine',0.38*v,p);},
  /* PATADOBOGÁS. Négy tompa dobbanás, gyorsuló ütemben — ez a vágta
     jellegzetes ritmusa (a ló nem egyenletesen lép, hanem hármas-négyes
     csoportokban). Mély zajimpulzus, nem hangmagasság: a pata a földön
     nem cseng, hanem puffan. */
  hoof:   (S,v,p)=>{
    const ido=[0,0.085,0.155,0.205];
    for(let i=0;i<ido.length;i++){
      setTimeout(()=>{
        S.noiseHit(0.055,(0.16-i*0.018)*v,260,90,0.8,p);
        S.tone(88-i*4,52,0.05,'sine',0.05*v,p);
      }, ido[i]*1000);
    }
  },
  clang:  (S,v,p)=>{S.noiseHit(0.1,0.28*v,3400,1700,9,p); S.tone(1150,720,0.1,'triangle',0.11*v,p);},
  hit:    (S,v,p)=>{S.noiseHit(0.08,0.2*v,900,300,1,p);},
  die:    (S,v,p)=>{S.tone(230,85,0.26,'sawtooth',0.15*v,p); S.noiseHit(0.22,0.13*v,520,150,0.7,p);},
  destroy:(S,v,p)=>{S.noiseHit(0.75,0.5*v,900,65,0.5,p); S.tone(92,30,0.6,'square',0.24*v,p);},
  alert:  (S,v,p)=>{S.tone(740,740,0.16,'square',0.2,0); S.tone(587,587,0.26,'square',0.2,0,0.19);},
  age:    (S)=>{[523,659,784,1047].forEach((f,i)=>S.tone(f,f,0.32,'triangle',0.2,0,i*0.13));},
  win:    (S)=>{[523,659,784,1047,1319].forEach((f,i)=>S.tone(f,f,0.42,'triangle',0.22,0,i*0.15));},
  lose:   (S)=>{[392,330,262,196].forEach((f,i)=>S.tone(f,f*0.97,0.55,'sawtooth',0.18,0,i*0.22));}
};
// A fegyverhang a korszakból és a szerepből adódik
function weaponSound(role,age){
  if(role==='spear')  return age===3?'cannon':'clang';
  if(role==='ranged') return ['arrow','musket','rifle','mg'][age];
  if(role==='melee')  return age===3?'cannon':'clang';
  return 'clang';
}
