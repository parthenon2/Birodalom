/* =======================================================================
   21/C. HANGMINTÁK

   A többi hangot a játék szintetizálja, de a halál és a becsapódás
   felvételről szól. A minták base64-ként vannak beépítve; első
   megszólaláskor dekódoljuk őket, utána már készen állnak.
   ===================================================================== */
const SFX_B64='';                    // ide kerülnek az összeállításkor
const SAMPLES={};                    // dekódolt hangpufferek
let samplesReady=false;

function samplesInit(){
  if(samplesReady||!SFX_B64||typeof SFX_B64!=='object') return;
  if(!SFX.ac) return;               // csak felhasználói koppintás után van hangkontextus
  samplesReady=true;
  for(const kulcs in SFX_B64){
    try{
      const bin=atob(SFX_B64[kulcs]), n=bin.length, arr=new Uint8Array(n);
      for(let i=0;i<n;i++) arr[i]=bin.charCodeAt(i);
      SFX.ac.decodeAudioData(arr.buffer,
        buf=>{ SAMPLES[kulcs]=buf; },
        ()=>{});
    }catch(e){}
  }
}
// Minta lejátszása a világ egy pontján: a távolival halkabban szól
function playSample(kulcs,x,y,ero){
  if(!SFX.on) return;
  samplesInit();
  const buf=SAMPLES[kulcs];
  if(!buf||!SFX.ac) return;
  let v=(ero===undefined?1:ero)*SFX.vol;
  if(x!==undefined){
    const dx=x-(G.cam.x+G.vw/2), dy=y-(G.cam.y+G.vh/2);
    const d=Math.hypot(dx,dy);
    v*=clamp(1-d/900,0,1);
    if(v<=0.02) return;
  }
  try{
    const src=SFX.ac.createBufferSource();
    src.buffer=buf;
    src.playbackRate.value=0.92+Math.random()*0.16;   // apró változatosság
    const g=SFX.ac.createGain();
    g.gain.value=v;
    src.connect(g); g.connect(SFX.master||SFX.ac.destination);
    src.start();
  }catch(e){}
}
// Egységhalál: három felvétel közül váltogatva
let halalIdx=0;
function playDeath(x,y){
  halalIdx=(halalIdx+1)%3;
  playSample('halal'+(halalIdx+1),x,y,0.7);
}
