/* =======================================================================
   17/D. ZENE

   Két útvonalon próbáljuk lejátszani, mert a böngészők eltérően
   viselkednek:

   1. HANGELEM (Audio + Blob). Ez a takarékos: a böngésző folyamatosan
      olvassa be a hangot, nem foglal sok memóriát.
   2. WEB AUDIO (decodeAudioData). Ha az első másfél másodperc alatt nem
      indul el a zene, magától átvált erre. Ez ugyanaz az útvonal, amin a
      hangeffektek szólnak — ha azokat hallod, ennek is mennie kell.

   Az állapot mindig látszik a ☰ menüben, és nincs néma helyettesítés:
   ha valami elakad, azt kiírjuk.
   ===================================================================== */
/* Korszakonként külön zene. A MUSIC_B64 az összeállításkor kap értéket:
   {'village-consort':'...', 'marines':'...'}. A TRACKS mondja meg, melyik
   korszakhoz melyik sáv tartozik; ha valamelyik hiányzik, a rendszer a
   legközelebbi meglévőt használja. */
const MUSIC_B64='';                 // ide kerül a hang az összeállításkor
/* A zenemappa címe. Az összeállításkor kap értéket; üres marad, ha a
   zene bele van sütve a HTML-be. */
const MUSIC_URL='';
/* Korszakonként TÖBB sáv is lehet. A lista bővíthető: ami fájlnév
   bekerül a zene/ mappába, azt a build.js beépíti, és ha itt is
   szerepel, a játék használni fogja.

   Miért lista? Mert egy húszperces játszma alatt ugyanaz a két perc
   negyvenszer szólna le. Több sávnál minden játszma más zenével indul,
   és korszakváltáskor is új darab jön.

   A választás VÉLETLEN, és ez nem baj: a zene csak a te gépeden szól,
   a szimulációt nem érinti. (Ezért használ Math.random-ot, nem a
   szimulációs magot — az utóbbi szétcsúszást okozna.) */
const TRACKS=[
  ['village-consort'],                 // 15. sz. — középkori lantos, hárfa
  ['cercles-nouvelles'],               // 17. sz. — barokk udvari tánc
  ['power-of-nature'],                 // 19. sz. — romantikus zenekar
  ['marines']                          // 20. sz. — katonai induló
];
const TRACKS_KALOZ=['kalozok'];        // a kalózvilág saját sávjai
const TRACKS_MENU=['menu'];            // a főmenü, ha van hozzá külön

/* A FÁJLNÉV SZERINT besorolt sávok. Az összeállítás tölti ki abból, amit
   a zene/ mappában talál (15-*, 17-*, 19-*, 20-*, kaloz-*, menu-*).
   Így új zenét betenni annyi, hogy bemásolod a fájlt — a kódhoz nem kell
   hozzányúlni. A fentebbi, kézzel írt listák megmaradnak mellette. */
const TRACKS_FAJLNEV=null;

/* A két forrás összefésülése: előbb a fájlnév szerintiek, aztán a kézzel
   beírtak. Ismétlés nélkül. */
function savLista(index){
  const ki=[];
  const hozza=(t)=>{ for(const x of (t||[])) if(ki.indexOf(x)<0) ki.push(x); };
  if(TRACKS_FAJLNEV){
    if(index==='kaloz') hozza(TRACKS_FAJLNEV.kaloz);
    else if(index==='menu') hozza(TRACKS_FAJLNEV.menu);
    else hozza(TRACKS_FAJLNEV.kor&&TRACKS_FAJLNEV.kor[index]);
  }
  if(index==='kaloz') hozza(TRACKS_KALOZ);
  else if(index==='menu') hozza(TRACKS_MENU);
  else hozza(TRACKS[index]);
  return ki;
}

/* Egy adott listából a MEGLÉVŐ sávokat adja vissza. */
function meglevoSavok(lista){
  const m=MUSIC_B64;
  if(!m||typeof m!=='object'||!lista) return [];
  return lista.filter(k=>m[k]);
}
function trackFor(age){
  const m=MUSIC_B64;
  if(!m||typeof m!=='object') return null;
  const kulcsok=Object.keys(m);
  if(!kulcsok.length) return null;

  // A kalózhadjáratnak saját zenéje van, korszaktól függetlenül
  if(typeof G!=='undefined'&&G.pirate){
    const k=meglevoSavok(savLista('kaloz'));
    if(k.length) return k[Math.floor(Math.random()*k.length)];
  }
  // a korszak saját sávjai közül egy
  const sajat=meglevoSavok(savLista(age));
  if(sajat.length) return sajat[Math.floor(Math.random()*sajat.length)];
  // különben visszafelé keresünk egy meglévőt
  for(let a=age;a>=0;a--){
    const s=meglevoSavok(savLista(a));
    if(s.length) return s[Math.floor(Math.random()*s.length)];
  }
  return kulcsok[0];
}
let MUSIC_VOL=0.45;

const MUSIC={
  on:true, started:false, mode:'-', status:'nem indult',
  audio:null, url:null, node:null, gain:null, buffer:null,

  setVol(v){
    MUSIC_VOL=v;
    if(this.audio) this.audio.volume=this.on?v:0;
    if(this.gain) this.gain.gain.value=this.on?v:0;
  },
  track:null,

  /* --- A ZENE KÜLÖN FÁJLBÓL ---

     A zene sokáig BELE volt sütve az index.html-be base64-ként: 21 MB a
     26-ból. Ez addig nem zavart, amíg a fájlt kézzel küldözgettük — de
     ha a játék frissíteni akarja magát, minden apró javításnál újra
     letöltené ugyanazt a huszonegy megabájtot, pedig a zene sosem
     változik.

     Mostantól a zene KÜLÖN fájlokban él (`zene/<sáv>.mp3`), és a játék
     akkor kéri le, amikor először szüksége van rá. A letöltött sávot
     megjegyezzük, tehát egy játszmán belül csak egyszer jön át.

     A régi út megmarad: ha a MUSIC_B64-ben van adat (mert valaki
     `--embed` kapcsolóval állította össze), azt használjuk. Így a
     böngészőben megnyitható, önmagában futó egyfájlos változat
     változatlanul működik. */
  puffer:{},                            // a már letöltött sávok
  bytes(){
    const b64=(typeof MUSIC_B64==='object')?(MUSIC_B64[this.track]||''):MUSIC_B64;
    if(!b64) return null;               // nincs beépítve: külön fájlból jön
    const bin=atob(b64), n=bin.length, out=new Uint8Array(n);
    for(let i=0;i<n;i++) out[i]=bin.charCodeAt(i);
    return out;
  },
  /* A sáv hangadata — akárhonnan jön. Igéretet ad vissza, mert a
     hálózati letöltés nem azonnali. */
  hangKer(){
    const t=this.track;
    if(!t) return Promise.resolve(null);
    const beepitett=this.bytes();
    if(beepitett&&beepitett.length) return Promise.resolve(beepitett);
    if(this.puffer[t]) return Promise.resolve(this.puffer[t]);
    /* A MUSIC_URL az összeállításkor kap értéket: a mappa, ahonnan a
       sávok letölthetők. Ha üres, nincs mit betölteni — a játék néma
       marad, de fut tovább. */
    if(typeof MUSIC_URL!=='string'||!MUSIC_URL) return Promise.resolve(null);
    return fetch(MUSIC_URL+t+'.mp3')
      .then(v=>v.ok?v.arrayBuffer():null)
      .then(b=>{
        if(!b) return null;
        const u=new Uint8Array(b);
        this.puffer[t]=u;
        return u;
      })
      .catch(()=>null);
  },
  // Korszakváltáskor átúszunk a következő sávra
  setEra(age){
    const t=trackFor(age);
    if(!t||t===this.track) return;
    this.track=t;
    if(!this.started) return;
    this.fadeTo(()=>{ this.restart(); });
  },
  fadeTo(after){
    const cel=this.on?MUSIC_VOL:0;
    let v=cel;
    const lep=()=>{
      v-=cel/12;
      if(v<=0){ after(); this.rampUp(cel); return; }
      if(this.audio) this.audio.volume=Math.max(0,v);
      if(this.gain) this.gain.gain.value=Math.max(0,v);
      setTimeout(lep,60);
    };
    lep();
  },
  rampUp(cel){
    let v=0;
    const lep=()=>{
      v+=cel/12;
      if(this.audio) this.audio.volume=Math.min(cel,v);
      if(this.gain) this.gain.gain.value=Math.min(cel,v);
      if(v<cel) setTimeout(lep,60);
    };
    lep();
  },
  restart(){
    if(this.audio){ try{ this.audio.pause(); }catch(e){} this.audio=null; }
    if(this.node){ try{ this.node.stop(); }catch(e){} this.node=null; }
    if(this.url){ try{ URL.revokeObjectURL(this.url); }catch(e){} this.url=null; }
    this.started=false; this.mode='-'; this.buffer=null;
    this.start();
  },
  say(s){
    this.status=s;
    const el=(typeof $==='function')?$('musState'):null;
    if(el) el.textContent=s;
  },

  start(){
    if(!this.track) this.track=trackFor((typeof G!=='undefined'&&G.age)||0);
    if(this.started||!this.track) return;
    this.started=true;
    this.say('betölt…');
    /* A hangadat MOST már érkezhet hálózatról is, ezért a lejátszás
       ígéretre vár. A `start()` maga nem lesz aszinkron — csak a
       belseje csúszik el a letöltés idejével. */
    this.hangKer().then(adat=>{
      if(!adat||!adat.length){ this.say('nincs zenei fájl'); this.started=false; return; }
      this.indit(adat);
    });
  },
  indit(adat){
    try{
      const blob=new Blob([adat],{type:'audio/mpeg'});
      this.url=URL.createObjectURL(blob);
      const a=new Audio(this.url);
      a.loop=true; a.preload='auto';
      a.volume=this.on?MUSIC_VOL:0;
      a.onplaying=()=>{ if(this.mode==='elem') this.say('szól'); };
      a.onerror=()=>{ this.say('hangelem hibázott'); this.viaWebAudio(); };
      const p=a.play();
      if(p&&p.catch) p.catch(()=>{
        this.say('a böngésző blokkolta — koppints');
        const off=()=>{ removeEventListener('pointerdown',retry);
                        removeEventListener('keydown',retry); };
        const retry=()=>{ const q=a.play(); if(q&&q.catch) q.catch(()=>{}); off(); };
        addEventListener('pointerdown',retry);
        addEventListener('keydown',retry);
      });
      this.audio=a;
      this.mode='elem';
      // Ha másfél másodperc alatt nem indult meg, jöhet a másik útvonal
      setTimeout(()=>{
        if(this.mode!=='elem') return;
        if(!this.audio||this.audio.paused||this.audio.currentTime<0.05) this.viaWebAudio();
        else this.say('szól');
      },1500);
    }catch(e){
      this.say('hangelem nem jött létre');
      this.viaWebAudio();
    }
  },

  // Második útvonal: ugyanaz, amin a hangeffektek mennek
  viaWebAudio(){
    if(this.mode==='webaudio') return;
    this.mode='webaudio';
    this.say('másik útvonal…');
    if(this.audio){ try{ this.audio.pause(); }catch(e){} this.audio=null; }
    SFX.init();
    const ac=SFX.ac;
    if(!ac){ this.say('nincs hangkimenet'); return; }
    this.hangKer().then(adat=>{
      if(!adat||!adat.length){ this.say('a hang nem olvasható'); return; }
      this.webAudioIndit(ac, adat.buffer);
    });
  },
  webAudioIndit(ac, buf){
    const ok=(b)=>{
      this.buffer=b;
      this.gain=ac.createGain();
      this.gain.gain.value=this.on?MUSIC_VOL:0;
      this.gain.connect(ac.destination);
      this.playBuffer();
      this.say('szól');
    };
    const bad=()=>this.say('a hang dekódolása nem sikerült');
    try{
      const r=ac.decodeAudioData(buf,ok,bad);
      if(r&&r.then) r.then(ok).catch(bad);       // újabb böngészők ígéretet adnak
    }catch(e){ bad(); }
  },
  playBuffer(){
    const ac=SFX.ac;
    if(!ac||!this.buffer) return;
    if(this.node){ try{ this.node.stop(); }catch(e){} }
    const s=ac.createBufferSource();
    s.buffer=this.buffer; s.loop=true;
    s.connect(this.gain);
    s.start(0);
    this.node=s;
  },

  toggle(){
    this.on=!this.on;
    if(this.mode==='webaudio'&&this.gain){
      const t=SFX.ac.currentTime;
      this.gain.gain.cancelScheduledValues(t);
      this.gain.gain.setValueAtTime(this.gain.gain.value,t);
      this.gain.gain.linearRampToValueAtTime(this.on?MUSIC_VOL:0,t+0.3);
      this.say(this.on?'szól':'némítva');
      return this.on;
    }
    if(this.audio){
      this.audio.volume=this.on?MUSIC_VOL:0;
      if(this.on){ const p=this.audio.play(); if(p&&p.catch) p.catch(()=>{}); }
      else this.audio.pause();
      this.say(this.on?'szól':'némítva');
      return this.on;
    }
    if(this.on){ this.started=false; this.mode='-'; this.start(); }  // újrapróbálkozás
    return this.on;
  }
};
