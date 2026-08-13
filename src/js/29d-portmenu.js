/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   29/D. KIKÖTŐMENÜ  (csak a kalózvilágban)

   A Karib-tengeren a városok a fogódzók: Nassau, Havanna, Port Royal,
   Tortuga, Santiago. A nevükre kattintva sugárirányban kinyílnak a
   cselekvések, ahogy a vázlaton:

       ÉPÍTÉS      — mit emelhetsz oda, és mit termel
       TOBORZÁS    — kiket állíthatsz ki
       FLOTTA      — hajók
       KERESKEDELEM— árfolyam, vétel és eladás

   Egy karikára kattintva a többi eltűnik, és a helyükre a konkrét
   lehetőségek kerülnek. Mégegyszer kattintva vissza.

   A menü nem vesz el semmit a valós idejű játékból: gyorsítás, nem külön
   játékmód. Ugyanazokat a parancsokat adja ki, mint a parancssáv.
   ===================================================================== */

/* A térképen megjelenő városok. A 18—19. századi Karib-tenger sűrűn tele
   volt kikötővárossal; a csillag a kalózfészkeket jelöli. */
const KIKOTOK=[
  {kulcs:'nassau',      nev:'NASSAU',        jel:'★'},
  {kulcs:'tortuga',     nev:'TORTUGA',       jel:'★'},
  {kulcs:'portroyal',   nev:'PORT ROYAL',    jel:'★'},
  {kulcs:'havanna',     nev:'HAVANNA',       jel:''},
  {kulcs:'santiago',    nev:'SANTIAGO',      jel:''},
  {kulcs:'trinidad',    nev:'TRINIDAD',      jel:''},
  {kulcs:'matanzas',    nev:'MATANZAS',      jel:''},
  {kulcs:'santodomingo',nev:'SANTO DOMINGO', jel:''},
  {kulcs:'gonaives',    nev:'GONAÏVES',      jel:''},
  {kulcs:'eleuthera',   nev:'ELEUTHERA',     jel:''},
  {kulcs:'exuma',       nev:'EXUMA',         jel:''},
  {kulcs:'crooked',     nev:'CROOKED ISLAND',jel:''},
  {kulcs:'caymanbrac',  nev:'CAYMAN BRAC',   jel:''},
  {kulcs:'campeche',    nev:'CAMPECHE',      jel:''}
];
/* A menü tartalma attól függ, KIÉ a város.

   A sajátodban építesz és hajót állítasz ki. Az idegenben nincs mit
   parancsolni — ott csak az látszik, mit kell szétlőnöd, mielőtt partra
   szállhatnál. Korábban minden városban lehetett építeni, ami értelmetlen
   volt: Nassauból nem lehet Santiagót igazgatni. */
function portAkciok(){
  const kulcs=G.port?G.port.kulcs:null;
  const mienk=(kulcs!==null&&portOwner(kulcs)===0);
  if(!mienk) return [ {k:'close', nev:T('bezaras'), also:'', szin:'#4a4a52'} ];
  return [
    {k:'build', nev:T('epites'),   also:'', szin:'#2f7a68'},
    {k:'train', nev:T('toborzas'), also:'', szin:'#8c2f2f'},
    {k:'close', nev:T('bezaras'),  also:'', szin:'#4a4a52'}
  ];
}

/* Egy város épületei: a hozzá legközelebb állók. A város ezekből termel. */
function portBuilds(kulcs){
  const p=portPos(kulcs);
  return G.builds.filter(b=>!b.dead&&b.owner===ENID&&dist(b.x,b.y,p.x,p.y)<420);
}
/* Mit termel a város? Ebből lesz a névtábla alatti sor. */
function portTermel(kulcs){
  let food=0, db=0;
  const egyeb={};
  for(const b of portBuilds(kulcs)){
    db++;
    if(!b.done) continue;
    const d=BUILDS[b.type];
    if(d.food) food+=val(d.food,b.age)*PACE.farm*doctMul(0,'food')*upgMul(0,'yield');
    if(d.termel) for(const r in d.termel)
      egyeb[r]=(egyeb[r]||0)+d.termel[r]*PACE.farm*upgMul(0,'yield');
  }
  return {db, food, egyeb};
}
/* A város kié? A legközelebbi főhadiszállás dönti el. */
function portOwner(kulcs){
  const p=portPos(kulcs);
  let o=null, bd=1e9;
  for(const b of G.builds){
    if(b.dead||b.type!=='hq') continue;
    const d=dist(b.x,b.y,p.x,p.y);
    if(d<bd&&d<420){ bd=d; o=b.owner; }
  }
  return o;
}

function portOpen(kulcs){
  G.port={kulcs, akcio:null};
  SFX.play('select',0.9);
  portRender();
  /* A felületnek szólnunk kell: a parancssáv a kikötőmenü alatt rejtve
     marad, és ezt a syncUI dönti el. Nélküle csak a következő
     változásnál tűnne el — addig egymáson állna a két panel. */
  if(typeof syncUI==='function') syncUI();
}
function portClose(){
  G.port=null;
  const el=$('portMenu');
  if(el&&el.classList) el.classList.remove('on');
  if(typeof syncUI==='function') syncUI();   // a parancssáv visszatér
}
function portPick(a){
  if(!G.port) return;
  if(a==='close'){ portClose(); SFX.play('click'); return; }
  G.port.akcio=(G.port.akcio===a)?null:a;
  SFX.play('click');
  portRender();
}

/* Melyik város melyik világbeli pontra esik? */
function portPos(kulcs){
  return (typeof karibPont==='function')?karibPont(kulcs):{x:0,y:0};
}
/* A városnév a képernyőn — ide rajzoljuk a jelölőt, és ide nyílik a menü. */
/* A kinyíló menü HTML-elem, tehát KÉPERNYŐ-koordináta kell neki. */
function portScreen(kulcs){
  const p=portPos(kulcs);
  return {x:(p.x-G.cam.x)*G.zoom, y:(p.y-G.cam.y)*G.zoom};
}

/* A jelölők kirajzolása a térképre.

   FONTOS: ezt a rajzolást a világ koordinátarendszerében hívjuk (a kamera
   eltolása és a nagyítás már benne van a rajzolóban). Ezért NEM számolunk
   képernyő-koordinátát — világkoordinátára rajzolunk, a szöveget pedig
   visszaskálázzuk, hogy nagyítástól függetlenül olvasható maradjon. */
/* A jelölőket a KÉPERNYŐ koordinátarendszerében rajzoljuk, mert a világé
   nagyítástól függ, és a névtáblát olvashatóan kell tartani. Ezért a hívás
   előtt alaphelyzetbe tesszük a transzformációt — ugyanúgy, ahogy az
   éjszakai fényréteg teszi.

   A városjelölő NEM dísz, hanem a kalózvilág fő kezelőfelülete: enélkül
   nincs mire kattintani, ezért takarékos módban is látszik. */
function drawPorts(){
  if(!G.pirate) return;
  const dpr=Math.min((typeof window!=='undefined'&&window.devicePixelRatio)||1,2);
  ctx.save();
  ctx.setTransform(dpr,0,0,dpr,0,0);
  for(const v of KIKOTOK){
    const p=portPos(v.kulcs);
    // a látható tartományon kívül eső városokat kihagyjuk
    if(p.x<G.cam.x-200||p.y<G.cam.y-200||
       p.x>G.cam.x+G.vw+200||p.y>G.cam.y+G.vh+200) continue;
    const kivalasztva=(G.port&&G.port.kulcs===v.kulcs);
    const mienk=portOwner(v.kulcs);
    const szin=(mienk===0)?'#4a90e2':((mienk===1)?'#e2554a':'#e0b64a');
    ctx.save();
    ctx.translate((p.x-G.cam.x)*G.zoom, (p.y-G.cam.y)*G.zoom);
    /* Városikon: apró település — két házfedél és egy torony zászlóval.
       A karika helyett ez áll a névtábla fölött, hogy egy pillantásra
       látszódjon, város van ott, és kié. */
    const m=(kivalasztva?1.18:1)*2.5;      // a jelölő jóval nagyobb, hogy messziről is látszódjon
    ctx.save();
    ctx.scale(m,m);
    // vetett árnyék a jelölő alatt
    ctx.fillStyle='rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(0,3,13,4.6,0,0,TAU); ctx.fill();
    // bal házfedél
    ctx.fillStyle=shade(szin,-0.30);
    ctx.beginPath();
    ctx.moveTo(-12,2); ctx.lineTo(-12,-4); ctx.lineTo(-7.5,-8); ctx.lineTo(-3,-4);
    ctx.lineTo(-3,2); ctx.closePath(); ctx.fill();
    // jobb házfedél
    ctx.beginPath();
    ctx.moveTo(4,2); ctx.lineTo(4,-3); ctx.lineTo(8,-6.5); ctx.lineTo(12,-3);
    ctx.lineTo(12,2); ctx.closePath(); ctx.fill();
    // középső torony
    ctx.fillStyle=szin;
    ctx.fillRect(-2.6,-11,5.2,13);
    ctx.beginPath();
    ctx.moveTo(-4.4,-11); ctx.lineTo(0,-16.5); ctx.lineTo(4.4,-11);
    ctx.closePath(); ctx.fill();
    // ablakok
    ctx.fillStyle='rgba(255,238,190,.9)';
    ctx.fillRect(-1.2,-8,2.4,2.6);
    ctx.fillRect(-9.4,-2.4,2.2,2.4);
    ctx.fillRect(7,-1.4,2.2,2.2);
    // zászlórúd a tornyon
    ctx.strokeStyle='rgba(240,236,226,.85)'; ctx.lineWidth=1.1;
    ctx.beginPath(); ctx.moveTo(0,-16.5); ctx.lineTo(0,-21); ctx.stroke();
    ctx.fillStyle=szin;
    ctx.beginPath();
    ctx.moveTo(0,-21); ctx.lineTo(6.5,-19.4); ctx.lineTo(0,-17.8); ctx.closePath(); ctx.fill();
    // talpvonal, a nemzet színében
    ctx.fillStyle=szin;
    ctx.fillRect(-12.5,1.6,25,1.8);
    ctx.restore();
    // névtábla, alatta a termelés
    const cim=v.nev+(v.jel?' '+v.jel:'');
    const t=portTermel(v.kulcs);
    /* A tábla két sora: a város neve, alatta az épületek száma. Semmi több
       — a termelést nem kell számon tartani a térképen. */
    /* A tábla második sora: a sajátodnál az épületek száma, az idegennél
       a lakosság és a tornyok — ez mondja meg, mennyi munka lesz elvenni. */
    const va=(typeof varosAdat==='function')?varosAdat(v.kulcs):null;
    let also;
    if(mienk===0){
      also=t.db+' '+T('varosEpulet');
      if(va) also+='  ·  '+Math.round(va.lakos+(va.lakosBonusz||0))+' lakos';
    }else if(va){
      also=Math.round(va.lakos)+' lakos'
        +(va.torony<=0&&va.lakos<PARTRA_LAKOS?'  ·  '+T('pmVedtelen'):'');
    }else also=(mienk===1?T('varosEllen'):T('varosSemleges'));
    ctx.font='bold 13px "Iowan Old Style", Georgia, serif';
    const w1=ctx.measureText(cim).width;
    ctx.font='10.5px "Iowan Old Style", Georgia, serif';
    const w2=ctx.measureText(also).width;
    const w=Math.max(w1,w2)+20, h=34;
    ctx.fillStyle='rgba(10,14,20,.92)';
    ctx.fillRect(-w/2, 26, w, h);
    ctx.strokeStyle=szin+'99'; ctx.lineWidth=1.4;
    ctx.strokeRect(-w/2, 26, w, h);
    ctx.textAlign='center';
    ctx.font='bold 13px "Iowan Old Style", Georgia, serif';
    ctx.fillStyle='#f2efe6';
    ctx.fillText(cim, 0, 40);
    ctx.font='10.5px "Iowan Old Style", Georgia, serif';
    ctx.fillStyle='rgba(198,206,218,.82)';
    ctx.fillText(also, 0, 54);
    /* PAJZS a névtábla mellett: benne a tornyok száma. Egy pillantásra
       megmondja, mennyi ágyúzás vár rád, mielőtt partra szállhatsz.
       Halvány, üres pajzs = védtelen város. */
    if(va){
      const db=va.torony|0;
      ctx.save();
      ctx.translate(w/2+14, 41);
      ctx.beginPath();
      ctx.moveTo(0,-12); ctx.lineTo(10,-9); ctx.lineTo(10,2);
      ctx.quadraticCurveTo(10,11,0,15);
      ctx.quadraticCurveTo(-10,11,-10,2);
      ctx.lineTo(-10,-9); ctx.closePath();
      ctx.fillStyle=db>0?'rgba(26,20,13,.96)':'rgba(24,30,26,.85)';
      ctx.fill();
      ctx.lineWidth=1.7;
      ctx.strokeStyle=db>0?szin:'rgba(150,168,150,.45)';
      ctx.stroke();
      ctx.textAlign='center';
      ctx.font='bold 13px "Iowan Old Style", Georgia, serif';
      ctx.fillStyle=db>0?'#f2efe6':'rgba(190,200,190,.55)';
      ctx.fillText(String(db), 0, 6);
      ctx.restore();
    }
    ctx.textAlign='left';
    ctx.restore();
  }
  ctx.restore();
}
/* Kattintás egy jelölőre? A parancskiadás ezt kérdezi meg először. */
/* Kattintás vagy koppintás egy városra.

   A célpontot KÉPERNYŐBEN mérjük, nem világkoordinátában: ujjal 30 pixeles
   pontra nem lehet célozni. A jelölő és a névtábla együtt nagyjából 70×50
   képpont, ezért ekkora sávban fogadjuk el a találatot — érintésnél még
   nagyobban. */
function portHit(wx,wy){
  if(!G.pirate) return null;
  const z=Math.max(0.05,G.zoom||1);
  const sugar=(G.isTouch?92:56)/z;          // világkoordinátára váltva
  let jo=null, bd=1e12;
  for(const v of KIKOTOK){
    const p=portPos(v.kulcs);
    // a névtábla a jelölő ALATT van, ezért lefelé nyújtjuk a sávot
    const dx=wx-p.x, dy=wy-p.y-(26/z);
    const d=dx*dx+dy*dy;
    if(d<sugar*sugar&&d<bd){ bd=d; jo=v.kulcs; }
  }
  return jo;
}

/* --- a kinyíló karikák ---

   FONTOS: a menüt CSAK akkor építjük újra, ha változott a város vagy a
   választott cselekvés. Korábban minden képkockán újraépült, és a
   kattintás elveszett: az egérgomb lenyomása és felengedése között
   megsemmisült a gomb, amire kattintottál. A helyzetét külön frissítjük,
   hogy a menü együtt mozogjon a kamerával. */
let portSig=null;

function portPlace(){
  const el=$('portMenu');
  if(!el||!el.style||!G.port) return;
  const s=portScreen(G.port.kulcs);
  el.style.left=Math.round(s.x)+'px';
  el.style.top=Math.round(s.y)+'px';
}
function portRender(){
  const el=$('portMenu');
  if(!el||!el.classList) return;
  if(!G.port){ el.classList.remove('on'); portSig=null; return; }
  el.classList.add('on');
  portPlace();
  // csak akkor építünk újra, ha tényleg más tartalom kell
  const sig=G.port.kulcs+'|'+(G.port.akcio||'')+'|'+G.age+'|'+LANG;
  if(sig===portSig) return;
  portSig=sig;
  el.innerHTML='';

  const karika=(x,y,cim,also,szin,fn,nagy)=>{
    const d=document.createElement('div');
    d.className='pk'+(nagy?' nagy':'');
    d.style.left=x+'px'; d.style.top=y+'px';
    d.style.borderColor=szin;
    d.style.background='radial-gradient(circle at 40% 35%, '+szin+'cc, '+szin+'55)';
    const alsoHtml=(also||'').split('\n').map(s=>'<em>'+s+'</em>').join('');
    d.innerHTML='<span class="pn">'+cim+'</span>'+alsoHtml;
    // egérgombra reagálunk, nem a kattintásra: így akkor is működik, ha
    // a gomb közben újraépülne
    d.onmousedown=(e)=>{ e.stopPropagation(); e.preventDefault(); fn(); };
    d.ontouchstart=(e)=>{ e.stopPropagation(); fn(); };
    el.appendChild(d);
    return d;
  };

  if(!G.port.akcio){
    const R=98;
    portAkciok().forEach((a,i)=>{
      const szog=-Math.PI*0.92 + i*(Math.PI*0.62);
      karika(dcos(szog)*R, dsin(szog)*R, a.nev, a.also, a.szin,
             ()=>portPick(a.k), true);
    });
  }else{
    const lista=portLista(G.port.akcio);
    const n=Math.max(1,lista.length);
    const R=(n>5)?150:126;
    lista.forEach((t,i)=>{
      const szog=-Math.PI*1.02 + i*(Math.PI*1.55/Math.max(1,n-1||1));
      karika(dcos(szog)*R, dsin(szog)*R, t.nev, t.also, t.szin, t.fn, false);
    });
    const vissza=document.createElement('div');
    vissza.className='pk vissza';
    vissza.style.left='0px'; vissza.style.top='0px';
    vissza.innerHTML='<span class="pn">←</span>';
    vissza.onmousedown=(e)=>{ e.stopPropagation(); e.preventDefault(); portPick(G.port.akcio); };
    vissza.ontouchstart=(e)=>{ e.stopPropagation(); portPick(G.port.akcio); };
    el.appendChild(vissza);
  }
}
/* Mit kínálunk az egyes cselekvésekhez? */
/* Mit kínálunk az egyes cselekvésekhez?

   ÉPÍTÉS  — a választott épület AZONNAL felépül a városban (a legénység
             húzza fel, ahogy a kolóniáknál), és attól kezdve termel.
   TOBORZÁS— az egység a városnál áll ki.
*/
function portLista(akcio){
  const ki=[];
  const kulcs=G.port?G.port.kulcs:null;
  if(!kulcs) return ki;
  if(portOwner(kulcs)!==0) return ki;      // idegen városban nincs parancs
  if(akcio==='build'){
    /* A városban a TERMELÉS a fontos, ezért más a sorrend, mint a
       parancssávban: elöl a majorság és a lakóház, utána a piac, a kikötő
       és a műhelyek. Fal és repülőtér ide nem való. */
    /* A városban nem kell kikötő és kaszárnya: a hajókat a város állítja
       ki, a katonákat nem toborzunk szárazon. Ami marad: a termelés, a
       lakosság, a kereskedés és a védelem. */
    const VAROS_SORREND=['farm','goldmine','sugar','lumber','house','market',
                         'tower','hospital','academy','smith'];
    for(const t of VAROS_SORREND){
      const d=BUILDS[t];
      if(!d||(d.minAge!==undefined&&G.age<d.minAge)) continue;
      if(t==='wall'||t==='gate'||t==='airfield') continue;
      if(ki.length>=7) break;
      const c=buildCost(t,G.age,ENID);
      /* Mit ad az épület? Elöl a termelés, mert a városban az számít. */
      let mit='—';
      if(d.food) mit='+'+val(d.food,G.age).toFixed(1)+' '+resName('food');
      else if(d.termel){
        mit=Object.keys(d.termel).map(r=>'+'+d.termel[r].toFixed(1)+' '+resName(r)).join(' · ');
      }
      else if(d.pop) mit='+'+d.pop+' '+T('nySereg');
      else if(d.market) mit=T('pmKereskedes');
      else if(d.heal) mit=T('pmGyogyitas');
      else if(d.dmg) mit=T('pmVediPartot');
      else if(d.trains) mit=T('pmKikepzes');
      /* Az ár nélkül nem lehet dönteni: a kör alsó sorába a hozam ÉS a
         költség is kikerül, két sorban. */
      ki.push({nev:buildName(t,G.age), also:mit+'\n'+costText(c), szin:'#2f7a68',
               fn:()=>portEpit(kulcs,t)});
    }
  }else if(akcio==='train'){
    /* A kalózvárosban CSAK hajót lehet toborozni — gyalogost nem.
       A három osztály a küldött modellek szerint:
         SZLÚP — kicsi, gyors, sok emberrel a fedélzeten
         BRIGG — a mindennapi harci hajó
         GÁLYA — nehéz, sok ágyúval, lassan fordul */
    /* Csak a HÁROM harci hajó. Halászbárka és külön csapatszállító nincs:
       a szlúp maga viszi a legénységet a partra. */
    const HAJOK=[
      {r:'transport', nev:T('pmSzlup'), mit:T('pmSzlupAl')},
      {r:'warship',   nev:'BRIGG', mit:'14–20 '+T('pmAgyu')},
      {r:'galleon',   nev:T('pmGalya'), mit:T('pmGalyaAl')}
    ];
    for(const h of HAJOK){
      if(!UNITS[h.r]) continue;
      const c=unitCost(h.r,G.age,ENID);
      ki.push({nev:h.nev, also:h.mit+' · '+costText(c), szin:'#8a5a2a',
               fn:()=>portToboroz(kulcs,h.r)});
    }
  }
  return ki;
}

/* Épület a városba. Helyet a város körül keresünk, a legénység húzza fel. */
function portEpit(kulcs,tipus){
  if(typeof logAdd==='function'&&logAdd('varosEpit', kulcs, tipus)) return;
  /* --- A PARANCS JOGOSSÁGA ---
     A hálózatról érkezik, tehát bármi lehet benne. A felületi feltétel
     nem védelem: itt kell megismételni.

     Az építés a SAJÁT kikötődben megengedett — idegen város partjára
     nem húzhatsz kaszárnyát. */
  const d=BUILDS[tipus];
  if(!d) return;
  if(!KIKOTOK.some(v=>v.kulcs===kulcs)) return;
  if(portOwner(kulcs)!==ENID){
    if(ENID===((typeof helyiFel==='function')?helyiFel():0)){
      toast(T('pmNemEpithetsz')); SFX.play('deny');
    }
    return;
  }
  if(d.maxCount!==undefined){
    const van=G.builds.filter(b=>!b.dead&&b.owner===ENID&&b.type===tipus).length;
    if(van>=d.maxCount){ toast(T('pmNemEpithetsz')); SFX.play('deny'); return; }
  }
  /* A KÖLTSÉG a cselekvő fél készletéből megy, nem a helyiéből. A
     `canPay`/`pay` alapból a G.res-t nézi — az viszont a te ablakod,
     akkor is, ha épp a társad épít. */
  const r=(typeof resOf==='function')?resOf(ENID):G.res;
  const c=buildCost(tipus,korOf?korOf(ENID):G.age,ENID);
  if(!canPay(c,r)){
    if(ENID===((typeof helyiFel==='function')?helyiFel():0)){
      toast(T('uzNincsAnyagKettospont')+': '+costText(c)); SFX.play('deny');
    }
    return;
  }
  const p=portPos(kulcs);
  let hely=null;
  for(let r=70;r<=320&&!hely;r+=26){
    for(let i=0;i<20;i++){
      const a=i*TAU/20;
      const x=snap(p.x+dcos(a)*r,tipus), y=snap(p.y+dsin(a)*r,tipus);
      if(!onLand(x,y)) continue;
      if(typeof canPlace==='function'&&!canPlace(tipus,x,y)) continue;
      hely={x,y}; break;
    }
  }
  if(!hely){ toast(T('pmNincsHely')); SFX.play('deny'); return; }
  pay(c,r);
  /* Az épület a CSELEKVŐ félé. Hálózaton a 0. fél nem feltétlenül az,
     aki épít — a régi sor mindig neki adta volna. */
  const b=makeBuild(tipus,ENID,hely.x,hely.y,(korOf?korOf(ENID):G.age),false);
  b.remote=true;                      // a legénység magától felhúzza
  G.builds.push(b); G.navVer++;
  toast(d.names[G.age]+' épül '+KIKOTOK.filter(v=>v.kulcs===kulcs)[0].nev+'ban.');
  SFX.play('place');
  syncUI(); portSig=null; portRender();
}
/* Egység a városnál. */
function portToboroz(kulcs,role){
  const akadaly=(typeof trainBlocked==='function')?trainBlocked(role):null;
  if(typeof train==='function'){ train(role,1); portSig=null; portRender(); return; }
}


/* =======================================================================
   FLOTTASÁV

   A kalózvilágban a hajóid a mindened, de a stratégiai nézetben aprók és
   szétszórtak. Ez a sáv mindegyiket felsorolja — osztály, legénység,
   sérülés —, és koppintásra odaviszi a kamerát.
   ===================================================================== */
let fleetSig='';

function fleetTick(){
  const el=$('fleetBar');
  if(!el||!el.classList) return;
  if(!G.pirate||!G.on){ el.classList.remove('on'); fleetSig=''; return; }
  const hajok=G.units.filter(u=>!u.dead&&u.owner===ENID&&u.naval);
  if(!hajok.length){ el.classList.remove('on'); fleetSig=''; return; }
  el.classList.add('on');
  /* Csak akkor építjük újra, ha VÁLTOZOTT valami — különben a koppintás
     elveszne a folyamatos újraépítésben, ahogy a városmenünél is történt. */
  const sig=hajok.map(u=>u.id+':'+Math.round(u.hp)+':'+Math.round(u.crew||0)).join('|');
  if(sig===fleetSig) return;
  fleetSig=sig;
  el.innerHTML='';
  for(const u of hajok){
    const nev=u.galleon?T('pmGalya'):(u.role==='warship'?'BRIGG':T('pmSzlup'));
    const hp=clamp(u.hp/u.maxHp,0,1);
    const sor=document.createElement('div');
    sor.className='fb'+(hp<0.35?' vesz':(hp<0.7?' seb':''));
    sor.innerHTML='<span class="fn">'+nev+'</span>'
      +'<span class="fh"><i style="width:'+Math.round(hp*100)+'%"></i></span>'
      +'<span class="fc">'+Math.round(u.crew||0)+' '+T('pmFo')+'</span>';
    const ugras=(e)=>{
      e.stopPropagation();
      G.sel=[u]; G.selBuild=null;
      G.cam.x=u.x-G.vw/2; G.cam.y=u.y-G.vh/2;
      clampCam(); syncUI();
      SFX.play('select',0.8);
    };
    sor.onmousedown=ugras;
    sor.ontouchstart=ugras;
    el.appendChild(sor);
  }
}

/* --- LŐTÁVGYŰRŰ ---
   Az idegen városok tornyainak hatósugara, mielőtt beúsznál. Csak akkor
   rajzoljuk, ha van hajód a közelben — különben tele lenne a térkép. */
function drawTowerRange(){
  if(!G.pirate||REDUCED||typeof varosAdat!=='function') return;
  for(const v of KIKOTOK){
    if(portOwner(v.kulcs)===0) continue;
    const a=varosAdat(v.kulcs);
    if(!a||a.torony<=0) continue;
    const p=portPos(v.kulcs);
    // van-e a közelben hajónk?
    let kozel=false;
    for(const u of G.units){
      if(u.dead||u.owner!==ENID||!u.naval) continue;
      if(dist(u.x,u.y,p.x,p.y)<OSTROM_TAV*2.1){ kozel=true; break; }
    }
    if(!kozel) continue;
    const x=p.x-G.cam.x, y=p.y-G.cam.y, R=OSTROM_TAV*G.zoom;
    /* A VÁROS lőtávja is látszik, halványabb, tágabb körrel — hogy
       előre lásd, hol kezd rád tüzelni a part. A belső kör a tiéd: onnan
       tudod lőni a várost. */
    if(typeof VAROS_TAV!=='undefined'){
      ctx.save();
      ctx.strokeStyle='rgba(210,120,90,.30)';
      ctx.setLineDash([7,7]); ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.arc(x,y,VAROS_TAV*G.zoom,0,TAU); ctx.stroke();
      ctx.restore();
    }
    if(x<-R||y<-R||x>G.vw+R||y>G.vh+R) continue;
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    const dpr=Math.min((typeof window!=='undefined'&&window.devicePixelRatio)||1,2);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const lukt=0.5+0.5*dsin(G.t*2.2);
    ctx.strokeStyle='rgba(206,74,58,'+(0.30+0.22*lukt)+')';
    ctx.lineWidth=2;
    ctx.setLineDash([9,7]);
    ctx.lineDashOffset=-G.t*14;
    ctx.beginPath(); ctx.arc(x,y,R,0,TAU); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(206,74,58,0.055)';
    ctx.beginPath(); ctx.arc(x,y,R,0,TAU); ctx.fill();
    ctx.restore();
  }
}
