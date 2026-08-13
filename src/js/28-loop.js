/* =======================================================================
   22. FŐCIKLUS
   ===================================================================== */
function updateCamera(dt){
  const s=760*dt*G.camSpeed/G.zoom, k=G.keys;
  const arrows=!G.kb.on;                    // kurzoros módban a nyilak a kurzort mozgatják
  if(k['a']&&!k['control']||(arrows&&k['arrowleft'])) G.cam.x-=s;
  if(k['d']||(arrows&&k['arrowright'])) G.cam.x+=s;
  if(k['w']||(arrows&&k['arrowup'])) G.cam.y-=s;
  if(k['s']||(arrows&&k['arrowdown'])) G.cam.y+=s;
  // Képernyőszéli görgetés (érintésnél nincs)
  // Csak akkor görgetünk a képernyő szélén, ha tényleg volt egérmozgás.
  // Az érintésre küldött hamis egéresemények így nem indítják el.
  if(!G.isTouch&&G.edgeScroll&&G.mouseSeen){
    const m=22;
    if(G.mouse.x<m) G.cam.x-=s; if(G.mouse.x>G.view.w-m) G.cam.x+=s;
    if(G.mouse.y<m) G.cam.y-=s; if(G.mouse.y>G.view.h-m) G.cam.y+=s;
  }
  clampCam();
}
// Egy fél akkor bír még hadat viselni, ha van főhadiszállása vagy kaszárnyája
function hasCore(owner){
  return G.builds.some(b=>!b.dead&&b.owner===owner&&(b.type==='hq'||b.type==='barracks'));
}
// Amikor az ellenség már csak morzsákból áll, felfedjük a maradékot —
// különben a ködben kellene vaktában levadászni az utolsó majorságot.
function revealRemnants(){
  if(G.revealed) return;
  const rest=G.builds.filter(b=>!b.dead&&b.owner===1);
  if(rest.length>3||!rest.length) return;
  G.revealed=true;
  for(const b of rest){
    const cx=Math.floor(b.x/FOG_CELL), cy=Math.floor(b.y/FOG_CELL);
    for(let ry=Math.max(0,cy-3);ry<=Math.min(FH-1,cy+3);ry++)
      for(let rx=Math.max(0,cx-3);rx<=Math.min(FW-1,cx+3);rx++)
        if(!G.fog[ry*FW+rx]) G.fog[ry*FW+rx]=1;
  }
  G.fogT=0;
  toast(T('felderitve'));
}
// A küldetés célja. Hadjáraton kívül a cél mindig az ellenség megtörése.
/* --- KÖZÖS GYŐZELEM ---
   Ha a talpon maradt felek MIND szövetségesek, nincs kivel harcolni: a
   háborúnak vége. Enélkül a menet közbeni diplomácia lyukat nyitna — ha
   mindenki mindenkivel szövetkezik, a játszma örökké futna, és a
   játékosok csak ülnének egymással szemben.

   Két félnél ez nem kérdés (ott a szövetség amúgy sem választható), és a
   hadjáratban sem: ott a küldetés célja dönt. */
function mindSzovetseges(){
  if(G.missionIdx>=0) return false;
  const elok=(G.oldalak||[]).filter(o=>!o.kiesett);
  if(elok.length<2) return false;
  for(let i=0;i<elok.length;i++)
    for(let j=i+1;j<elok.length;j++)
      if(!szovetseges(elok[i].i,elok[j].i)) return false;
  return true;
}
function objectiveDone(){
  const o=G.mission&&G.mission.obj;
  if(mindSzovetseges()) return true;           // a maradék felek mind szövetségesek
  if(!hasCore(1)) return true;                 // az ellenség megtörése mindig győzelem
  if(!o) return false;
  if(o.type==='survive') return G.t>=o.sec;
  if(o.type==='age')     return G.age>=o.age;
  if(o.type==='kill')    return (G.kills||0)>=o.n;
  if(o.type==='gather')  return (G.earned[o.res]||0)>=o.amount;
  if(o.type==='build')
    // a 'any' bármelyik kész épületet elfogadja
    return G.builds.filter(b=>!b.dead&&b.owner===helyiFel()&&b.done
             &&(o.b==='any'||b.type===o.b)).length>=o.n;
  return false;
}
function objectiveText(){
  const o=G.mission&&G.mission.obj;
  if(!o) return T('celMegtores');
  if(o.type==='survive'){
    const left=Math.max(0,Math.ceil(o.sec-G.t));
    return T('celKitartas')+' '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
  }
  if(o.type==='age')    return T('cel')+': '+korszakNev(o.age)+' — '+T('celEleres');
  if(o.type==='kill')   return T('cel')+': '+o.n+' '+T('celMegsemmisites')+' ('+(G.kills||0)+')';
  if(o.type==='gather')
    return T('cel')+': '+o.amount+' '+resName(o.res)+' — '+T('celKitermeles')+' ('+Math.floor(G.earned[o.res]||0)+')';
  if(o.type==='build'){
    const n=G.builds.filter(b=>!b.dead&&b.owner===helyiFel()&&b.done&&(o.b==='any'||b.type===o.b)).length;
    return T('cel')+': '+o.n+' '+((o.b==='any')?T('celEpulet'):buildName(o.b,G.age))+' ('+n+')';
  }
  return T('celMegtores');
}
function checkEnd(){
  if(G.over) return;
  revealRemnants();
  /* A vereséget a HELYI játékos állapotából ítéljük meg, nem a 0. félééből.
     Hálózaton te lehetsz a 2. fél is — korábban a házigazda bukása
     mindenkinek vereséget jelentett volna. */
  const en=(typeof helyiFel==='function')?helyiFel():0;
  const pWorkers=G.units.some(u=>!u.dead&&u.owner===en&&u.role==='worker');
  if(objectiveDone()) endGame(true);
  else if(!hasCore(en)&&!pWorkers) endGame(false); // se termelő épület, se munkás: nincs visszaút
}
function endGame(win){
  G.over=true;
  /* Hálózaton a motor tovább jár: lásd a hurok magyarázatát. */
  if(!(G.net&&G.net.allapot==='jatek')) G.on=false;
  if(win&&typeof achGet==='function'){
    achGet('victor');
    if(G.diff>=2) achGet('hardWin');
  }
  if(win&&G.missionIdx>=0) CAMP_DONE[campKey(G.campNation,G.missionIdx)]=true;
  $('overTitle').textContent=win?T('gyozelem'):T('vereseg');
  /* Több fél esetén a csapatgyőzelemnek saját mondata van — a
     kiesésfigyelő tette ide. */
  if(win&&G.gyozelemSzoveg){
    const sz=G.gyozelemSzoveg; G.gyozelemSzoveg=null;
    $('overText').textContent=sz+' '+T('jatekido')+': '+Math.floor(G.t)+' mp.';
    $('over').style.display='flex';
    return;
  }
  $('overText').textContent=win
    ? (G.mission
        ? '„'+kuldNev(G.mission.name)+'" '+T('kuldTeljesitveMsg')+' '+(G.missionIdx+1<CAMPAIGN.length
            ? T('kovKuldetes')+': „'+kuldNev(CAMPAIGN[G.missionIdx+1].name)+'".'
            : T('hadjaratVege'))+' '+T('jatekido')+': '+Math.floor(G.t)+' mp.'
        : uralkodoNev(G.nation,G.age)+' '+T('gyozelemSzoveg')+' '+T('jatekido')+': '+Math.floor(G.t)+' mp.')
    : T('veresegSzoveg')+' '+T('tulelt')+': '+Math.floor(G.t)+' mp.';
  $('over').style.display='flex';
  SFX.play(win?'win':'lose');
}
let uiT=0, last=performance.now();
// Ha a gép nem bírja, a díszítő rétegek (vízcsillogás, füst) maguktól
// kimaradnak. Enélkül gyengébb eszközön az egész játék akadozna — így
// csak a hab tűnik el a tortáról.
let frameAvg=16;
/* Ugyanaz a védőháló, mint a rajzrétegeknél, csak a szimulációra. */
const TICK_HIBA={};
function safeTick(nev,fn,dt){
  if(typeof fn!=='function'||TICK_HIBA[nev]) return;
  try{ fn(dt); }
  catch(e){
    TICK_HIBA[nev]=true;
    if(typeof console!=='undefined'&&console.warn) console.warn('rendszer hibája:',nev,e);
    if(typeof toast==='function') toast('Egy rendszer kikapcsolt: '+nev+' ('+e.message+')');
  }
}
function loop(now){
  const raw=(now-last)/1000;
  const dt=Math.min(raw,0.05); last=now;
  frameAvg=frameAvg*0.92+Math.min(raw*1000,120)*0.08;
  /* A mellékrendszerek óraütése külön-külön védve.

     Egy uncaught hiba a hurokban NEM ütemezi újra a következő képkockát:
     a játék némán megáll, a felület viszont látszik — pontosan ez adta a
     fekete képernyőt. Innentől egy elromlott rendszer csak magát kapcsolja
     ki, és megnevezi magát. */
  /* Ami a KÉPKOCKA ütemében mehet, mert nem érinti a világ állapotát:
     teljesítmények, élővilág, jószág, ösvények, maradványok, felületi
     sávok. A szimulációs óraütések a simStep()-ben futnak, rögzített
     ütemben. */
  safeTick('teljesítmények', achTick, dt);
  safeTick('élővilág', typeof wildTick==='function'?wildTick:null, dt);
  safeTick('jószág', typeof livestockTick==='function'?livestockTick:null, dt);
  safeTick('ösvények', typeof wearTick==='function'?wearTick:null, dt);
  safeTick('flottasáv', typeof fleetTick==='function'?fleetTick:null, dt);
  safeTick('hírnévsáv', typeof hirnevUI==='function'?hirnevUI:null, dt);
  safeTick('oktatómód', typeof tutorTick==='function'?tutorTick:null, dt);
  safeTick('maradványok', updateRemains, dt);
  safeTick('süllyedő hajók', typeof updateSinks==='function'?updateSinks:null, dt);
  if(G.fxMode==='auto'){                    // magától igazodik a gép erejéhez
    if(!G.lowFx&&frameAvg>30) G.lowFx=true;
    else if(G.lowFx&&frameAvg<19) G.lowFx=false;
  }else G.lowFx=(G.fxMode==='low');
  requestAnimationFrame(loop);
  /* --- MIÉRT NEM ÁLL MEG A HÁLÓZATI JÁTSZMA? ---
     A lépészár minden résztvevő csomagját megvárja. Ha a te gépeden
     megáll a szimuláció — mert szünetet nyomtál, vagy mert vesztettél —,
     akkor te nem küldesz több csomagot, és ettől MINDENKI MÁS is megáll.
     Egyetlen vesztes befagyasztaná az egész társaságot.

     Hálózaton ezért a szimuláció akkor is fut tovább, ha a te játszmád
     véget ért: a végképernyő megjelenik, de a birodalmad sorsát a többiek
     tovább írják, és a csomagjaid is mennek. */
  const haloJatek=!!(G.net&&G.net.allapot==='jatek');
  if(G.on&&(haloJatek||(!G.over&&!G.paused))&&!G.introOn){
    /* RÖGZÍTETT ÜTEM. A szimuláció mindig pontosan 0,05 másodperces
       lépésekben halad, akárhány képkockát rajzol közben a gép. Enélkül
       két gép más ütemben számolna, és a világok szétcsúsznának —
       hiába magvas a véletlen.

       Ha a gép lemarad, legfeljebb hat lépést pótolunk egyszerre: inkább
       lassuljon a játék, mint hogy egy akadás után percekig pótoljon. */
    G.acc=(G.acc||0)+raw;
    let n=0;
    while(G.acc>=SIM_LEPES&&n<SIM_MAX_UTOL){
      /* Hálózati játékban minden lépéshez kell a társ üzenete — enélkül
         VÁRUNK. Inkább akadjon a játék, mint hogy szétcsússzanak a világok. */
      if(typeof netLephet==='function'&&!netLephet()) break;
      simStep(SIM_LEPES);
      G.acc-=SIM_LEPES; n++;
    }
    if(G.acc>SIM_LEPES*SIM_MAX_UTOL) G.acc=0;   // nagy akadás után nem pótolunk
    // A KÉPET érintő dolgok a képkocka ütemében mennek
    updateCamera(dt); kbMove(dt);
    for(const f of G.fx) f.t+=dt;
    G.fx=G.fx.filter(f=>f.t<f.life);
    uiT-=dt; if(uiT<=0){uiT=0.2;syncUI();drawMini();}
    if(toastT>0){toastT-=dt; if(toastT<=0)$('toast').classList.remove('show');}
  }
  render();
}
/* Védőháló a látványrétegekhez.

   A rétegek (kopás, hab, időjárás, éjszaka, élővilág) mind díszek: ha
   valamelyik hibára fut, attól még a világot látni kell. Ezért mindegyiket
   külön burkoljuk, a hibát pedig EGYSZER kiírjuk — nem képkockánként.

   Enélkül egyetlen elgépelés fekete képernyőt adhat, miközben a játék
   a háttérben rendben fut. */
const RAJZ_HIBA={};
/* ÚJ JÁTÉKNÁL TISZTA LAP.

   A hibás réteg eddig VÉGLEGESEN kikapcsolt — a játszma végéig, sőt a
   következő játszmákra is. Ez a legrosszabb fajta hiba: egyetlen
   pillanatnyi baklövés (mondjuk egy fél másodpercre hiányzó adat) után
   a talajréteg kimaradt, és a következő meccs FEKETE KÉPERNYŐVEL indult.

   A védőburok arra való, hogy egy elszálló réteg ne vigye magával az
   egész képet — nem arra, hogy örökre elvegye. Új játszmánál tehát
   mindent visszakapcsolunk. */
function rajzHibaReset(){ for(const k in RAJZ_HIBA) delete RAJZ_HIBA[k]; }
function safeDraw(nev,fn){
  if(typeof fn!=='function'||RAJZ_HIBA[nev]) return;
  try{ fn(); }
  catch(e){
    RAJZ_HIBA[nev]=true;
    if(typeof console!=='undefined'&&console.warn) console.warn('rajzréteg hibája:',nev,e);
    if(typeof toast==='function') toast(T('uzRetegKi')+': '+nev+' ('+e.message+')');
  }
}
let RENDER_HIBA=null;
function render(){
  if(RENDER_HIBA) return;                       // egyszer jelezzük, nem képkockánként
  try{ renderVilag(); }
  catch(e){
    RENDER_HIBA=e;
    if(typeof console!=='undefined'&&console.error) console.error('rajzolási hiba:',e);
    if(typeof toast==='function') toast(T('uzRajzHiba')+': '+e.message);
  }
}
function renderVilag(){
  if(!G.on&&!G.over){ctx.fillStyle='#0c0a08';ctx.fillRect(0,0,G.view.w,G.view.h);return;}
  ctx.save();
  if(G.shake>0.01){                          // becsapódásnál megrázkódik a kép
    ctx.translate(rnd(-1,1)*G.shake*7, rnd(-1,1)*G.shake*7);
    G.shake*=0.92;
  }
  ctx.scale(G.zoom,G.zoom);                  // nagyítás: a világ minden eleme ezen belül
  // Kicsinyítéskor simítunk (különben csipkés lenne), 1:1 körül viszont
  // kikapcsoljuk: élesebb is, és a sprite-másolás így lényegesen olcsóbb.
  ctx.imageSmoothingEnabled=(G.zoom<0.85);
  /* Erősen kicsinyítve a kalózpályán egyetlen előre elkészített képet
     nagyítunk ki a részletes terep helyett — különben képkockánként
     tízezer cellát kellene festeni. */
  const stratKep=(typeof stratMode==='function'&&stratMode());
  if(stratKep){
    safeDraw('stratégiai térkép', typeof drawStratMap==='function'?drawStratMap:null);
  }else{
    drawGround();
    drawWater();
    safeDraw('hullámzás', typeof drawWaterMotion==='function'?drawWaterMotion:null);
    drawRocks();
    safeDraw('időjárás a talajon', typeof drawGroundWeather==='function'?drawGroundWeather:null);
    safeDraw('ösvények', typeof drawWear==='function'?drawWear:null);
    /* A csatanyomok az ösvények UTÁN, de az egységek ELŐTT: a földön
       vannak, nem a katonán. A safeDraw azért kell, mert ha bármelyik
       rajzoló elszáll, csak ez a réteg kapcsoljon ki, ne az egész kép. */
    safeDraw('csatanyomok', typeof drawNyomok==='function'?drawNyomok:null);
    safeDraw('hullámverés', typeof drawFoam==='function'?drawFoam:null);
  }
  drawScorch();
  safeDraw('süllyedő hajók', typeof drawSinks==='function'?drawSinks:null);
  if(G.corpses) for(const c of G.corpses) drawCorpse(c);
  safeDraw('élővilág', typeof drawWild==='function'?drawWild:null);
  safeDraw('jószág', typeof drawLivestock==='function'?drawLivestock:null);
  // Y szerint rendezve rajzolunk, hogy helyes legyen a takarás — a fák
  // és a sziklák is beleszámítanak, különben az előttük álló katona
  // eltűnne a lombkorona mögött.
  // A repülőket kihagyjuk a földi sorból: ők a ködréteg fölé kerülnek,
  // különben a felderítetlen terület fölött elrepülve eltűnnének.
  /* STRATÉGIAI NÉZET (kalózvilág)
     Itt nem a szigetek mikrovilágát látod, hanem a tengert és a városokat.
     Ezért a szárazföldi részletek — épületek, emberek, fák, díszek —
     kimaradnak; csak a hajók maradnak a képen, mert a játék róluk szól. */
  /* A stratégiai nézetben CSAK A HAJÓK látszanak.

     A várost nem a matrózok építik, hanem maga a város: nem kell látni,
     mi épül és ki építi — elég a név és az épületszám a táblán. Ezért
     kimaradnak az épületek, a katonák, a fák, a díszek és a jobbágyok is. */
  const strat=!!G.pirate;
  const ents=strat
    ? [...G.units.filter(u=>!u.air&&u.naval)].sort((a,b)=>a.y-b.y)
    : [...G.builds,...G.units.filter(u=>!u.air),...G.nodes,...(G.deco||[])].sort((a,b)=>a.y-b.y);
  // Röntgen: ha egy egység épület vagy fa mögé kerül, az takaró elem
  // félig áttetszővé válik, hogy lásd, ki áll mögötte. A már kirajzolt
  // egységeket egy csúszóablakban tartjuk, így nem kell mindenkit
  // mindenkivel összevetni.
  const mogotte=[];
  for(const e of ents){
    if(e.kind==='unit'||e.role){ drawUnit(e); if(!e.dead) mogotte.push(e); continue; }
    while(mogotte.length&&mogotte[0].y<e.y-170) mogotte.shift();
    let takar=false;
    if(mogotte.length){
      const w=e.kindDeco?20:((e.w||e.r*2)*0.6+10);
      const hUp=(e.kind==='build')?(e.h+bhOf(e.type,e.age)+16):(e.kindDeco?34:(e.r*2+52));
      for(const u of mogotte){
        if(Math.abs(u.x-e.x)<w && u.y>e.y-hUp && u.y<e.y-2){ takar=true; break; }
      }
    }
    if(takar) ctx.globalAlpha=0.5;
    if(e.kind==='build') drawBuild(e);
    else if(e.kindDeco) drawDeco(e);
    else drawNode(e);
    ctx.globalAlpha=1;
  }
  for(const p of G.projs) drawProj(p);
  for(const f of G.fx) drawFx(f);
  drawFog();
  // Pestis: zöldes, lüktető folt a bázis körül
  if(G.plague&&!REDUCED){
    const p=G.plague, k=p.t/p.hossz;
    const x=p.x-G.cam.x, y=p.y-G.cam.y;
    const lut=0.5+0.5*Math.sin(G.t*2.2);
    ctx.save();
    ctx.fillStyle='rgba(110,150,70,'+(0.12*(1-k)*(0.6+0.4*lut))+')';
    ctx.beginPath(); ctx.ellipse(x,y,p.r,p.r*0.55,0,0,TAU); ctx.fill();
    ctx.strokeStyle='rgba(150,190,90,'+(0.3*(1-k))+')'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(x,y,p.r,p.r*0.55,0,0,TAU); ctx.stroke();
    ctx.restore();
  }
  if(G.wrecks) for(const w of G.wrecks) drawWreck(w);
  safeDraw('csapadék', typeof drawWeather==='function'?drawWeather:null);
  safeDraw('tengeri vihar', typeof drawSeaWeather==='function'?drawSeaWeather:null);
  safeDraw('fényirány', typeof drawLightDir==='function'?drawLightDir:null);
  safeDraw('napszak színe', typeof drawTint==='function'?drawTint:null);
  safeDraw('éjszaka', typeof drawNight==='function'?drawNight:null);
  safeDraw('madarak', typeof drawBirds==='function'?drawBirds:null);
  safeDraw('lőtávgyűrű', typeof drawTowerRange==='function'?drawTowerRange:null);
  safeDraw('kikötők', typeof drawPorts==='function'?drawPorts:null);
  safeDraw('utómunka', typeof drawPost==='function'?drawPost:null);
  // a nyitott kikötőmenü együtt mozog a kamerával
  if(G.port&&typeof portPlace==='function') portPlace();
  // Gépek a köd fölött, hátulról előre rendezve
  const air=G.units.filter(u=>u.air&&!u.dead).sort((a,b)=>a.y-b.y);
  for(const u of air) drawUnit(u);
  drawPlaceGhost();
  drawKbCursor();
  ctx.restore();
  drawSelBox();                              // a kijelölő keret képernyő-koordinátás
}
requestAnimationFrame(loop);
