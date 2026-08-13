/* =======================================================================
   6. VILÁG GENERÁLÁSA
   ===================================================================== */
function buildRect(b){return {x:b.x-b.w/2,y:b.y-b.h/2,w:b.w,h:b.h};}
// A falnak nincs ütközési ráhagyása, különben sosem érnének össze,
// és 16 pixeles réseken átsétálnának az egységek.
function padFor(type){ return type==='wall'?0:6; }
function gridFor(type){ return type==='wall'?BUILDS.wall.w:16; }
function snap(v,type){ return Math.round(v/gridFor(type))*gridFor(type); }

// Építeni csak a saját területünk közelében lehet, az ellenség orra elé nem
const BUILD_REACH=360, ENEMY_KEEPOUT=300;
function inBuildRange(x,y,owner,type){
  // A kikötő parti előretolt állás: messzebbre is lerakható, mert a partot
  // ritkán találjuk meg a bázis tőszomszédságában.
  const reach=(type&&BUILDS[type]&&BUILDS[type].shore)?BUILD_REACH*2.5:BUILD_REACH;
  let own=false;
  for(const b of G.builds){
    if(b.dead) continue;
    const d=Math.hypot(b.x-x,b.y-y);
    if(b.owner===owner){ if(d<reach+Math.max(b.w,b.h)*0.5) own=true; }
    // Csak a már felderített ellenséges épület tilt — különben a hibaüzenet
    // maga árulná el, hol van a bázisuk.
    /* Csak a már felderített ellenséges épület tilt. A ködöt az ÉPÍTŐ
       fél szemével nézzük, nem a 0. félével — enélkül több félnél a
       tiltás a házigazda felderítésén múlt volna. Szövetségesnél nincs
       tiltás: az ő területén építkezhetsz. */
    else if(d<ENEMY_KEEPOUT&&(typeof ellenseg!=='function'||ellenseg(owner,b.owner))
            &&fogAt(b.x,b.y,owner)>0) return {ok:false,why:T('uzTulKozel')};
  }
  const has=G.builds.some(b=>!b.dead&&b.owner===owner);
  if(!has) return {ok:true};                       // ha nincs épületed, bárhol kezdhetsz
  return own?{ok:true}:{ok:false,why:T('uzTulMessze')};
}
function freeSpot(x,y,w,h,pad){
  pad=(pad===undefined)?10:pad;
  // vízre és sziklára nem épül, és nem is terem rajta semmi
  for(const p of [[x-w/2,y-h/2],[x+w/2,y-h/2],[x-w/2,y+h/2],[x+w/2,y+h/2],[x,y]])
    if(isWater(p[0],p[1])||isRock(p[0],p[1])) return false;
  if(x-w/2<20||y-h/2<20||x+w/2>WORLD.w-20||y+h/2>WORLD.h-20) return false;
  for(const b of G.builds){
    if(Math.abs(b.x-x)<(b.w+w)/2+pad && Math.abs(b.y-y)<(b.h+h)/2+pad) return false;
  }
  for(const n of G.nodes){
    if(!n.dead && Math.abs(n.x-x)<w/2+n.r+6 && Math.abs(n.y-y)<h/2+n.r+6) return false;
  }
  return true;
}
// Széntelepek: fekete ércfoltok, hasonló eloszlásban, mint az arany.
// A 17. századtól ez a lőszer alapanyaga.
function scatterCoal(){
  let placed=0;
  const M=curMap();
  for(let tries=0;tries<3000&&placed<Math.round(16*M.coal);tries++){
    const cx=srange(120,WORLD.w-120), cy=srange(120,WORLD.h-120);
    if(!onLand(cx,cy)) continue;
    let close=false;
    for(const n of G.nodes) if(dist(n.x,n.y,cx,cy)<130){close=true;break;}
    if(close) continue;
    for(let k=0;k<2+srangeInt(0,2);k++){
      const x=clamp(cx+srange(-34,34),40,WORLD.w-40), y=clamp(cy+srange(-34,34),40,WORLD.h-40);
      if(onLand(x,y)) G.nodes.push(makeNode('coal',x,y));
    }
    placed++;
  }
}
function onLand(x,y){ return !isWater(x,y)&&!isRock(x,y); }
function scatterNodes(){
  const M=curMap();
  // Erdőfoltok
  for(let i=0;i<Math.round(26*M.tree);i++){
    const cx=srange(120,WORLD.w-120), cy=srange(120,WORLD.h-120);
    for(let j=0;j<srangeInt(5,11);j++){
      const a=srange(0,TAU), d=srange(10,80);
      const wx=clamp(cx+dcos(a)*d,40,WORLD.w-40), wy=clamp(cy+dsin(a)*d,40,WORLD.h-40);
      if(onLand(wx,wy)) G.nodes.push(makeNode('wood',wx,wy));
    }
  }
  // Kőfejtők és aranylelőhelyek
  for(let i=0;i<Math.round(16*(M.stone+M.gold)/2);i++){
    const cx=srange(140,WORLD.w-140), cy=srange(140,WORLD.h-140);
    for(let j=0;j<srangeInt(2,4);j++)
      { const sx2=clamp(cx+srange(-40,40),40,WORLD.w-40), sy2=clamp(cy+srange(-40,40),40,WORLD.h-40);
        if(onLand(sx2,sy2)) G.nodes.push(makeNode('stone',sx2,sy2)); }
  }
  for(let i=0;i<11;i++){
    const cx=srange(160,WORLD.w-160), cy=srange(160,WORLD.h-160);
    for(let j=0;j<srangeInt(2,3);j++)
      { const gx2=clamp(cx+srange(-34,34),40,WORLD.w-34), gy2=clamp(cy+srange(-34,34),40,WORLD.h-34);
        if(onLand(gx2,gy2)) G.nodes.push(makeNode('gold',gx2,gy2)); }
  }
}
function clearAround(x,y,r){ // bázis körüli terep megtisztítása
  G.nodes=G.nodes.filter(n=>dist(n.x,n.y,x,y)>r);
}
function guaranteeNodes(x,y){ // minden bázis kap a közelébe mindhárom nyersanyagból
  for(let i=0;i<9;i++){const a=srange(0,TAU),d=srange(180,300);
    const nx=clamp(x+dcos(a)*d,40,WORLD.w-40), ny=clamp(y+dsin(a)*d,40,WORLD.h-40);
    if(onLand(nx,ny)) G.nodes.push(makeNode('wood',nx,ny));}
  for(let i=0;i<4;i++){const a=srange(0,TAU),d=srange(210,300);
    const nx=clamp(x+dcos(a)*d,40,WORLD.w-40), ny=clamp(y+dsin(a)*d,40,WORLD.h-40);
    if(onLand(nx,ny)) G.nodes.push(makeNode('stone',nx,ny));}
  for(let i=0;i<3;i++){const a=srange(0,TAU),d=srange(230,320);
    const nx=clamp(x+dcos(a)*d,40,WORLD.w-40), ny=clamp(y+dsin(a)*d,40,WORLD.h-40);
    if(onLand(nx,ny)) G.nodes.push(makeNode('gold',nx,ny));}
}
/* A felek bázisainak helye. Kettőnél a két megadott sarok, háromtól
   körben elosztva. A gyűrű sugarát a térkép rövidebb oldala szabja meg,
   és minden helyet szárazföldre húzunk — vízre nem épülhet bázis. */
function bazisHelyek(px,py,ex,ey){
  const n=(G.oldalak&&G.oldalak.length)?G.oldalak.length:2;
  if(n<=2) return [{x:px,y:py},{x:ex,y:ey}];
  const kx=WORLD.w/2, ky=WORLD.h/2;
  const sugar=Math.min(WORLD.w,WORLD.h)*0.36;
  /* A kezdőszöget is a magból sorsoljuk: így nem mindig ugyanott ül a
     nulladik fél, viszont mindkét gépen ugyanott. */
  const kezdo=srange(0,TAU);
  const ki=[];
  for(let i=0;i<n;i++){
    const a=kezdo+i*TAU/n;
    let x=clamp(kx+dcos(a)*sugar, 300, WORLD.w-300);
    let y=clamp(ky+dsin(a)*sugar, 300, WORLD.h-300);
    /* Ha víz alá esne, befelé lépegetünk a közép felé, amíg partot érünk.
       Legfeljebb tizenkét lépés — utána marad, ahol van, és a köré húzott
       száraz folt (dryOut) oldja meg a többit. */
    for(let k=0;k<12&&typeof onLand==='function'&&!onLand(x,y);k++){
      x+=(kx-x)*0.16; y+=(ky-y)*0.16;
    }
    if(typeof dryOut==='function') dryOut(x,y,200);
    if(typeof clearRock==='function') clearRock(x,y,300);
    ki.push({x:x,y:y});
  }
  return ki;
}
function foundBase(owner,x,y){
  /* A korszak a fél saját bejegyzéséből jön. Korábban „owner ? gép : te”
     állt itt, ami két félnél még stimmelt, háromnál már nem. */
  const age=(typeof korOf==='function')?korOf(owner):(owner?G.ai.age:G.age);
  G.builds.push(makeBuild('hq',owner,x,y,age,true));
  // Ha a küldetés tiltja az adott épületet, a kezdőbázisban sem áll ott
  const banned=t=>owner===0&&G.mission&&G.mission.ban&&G.mission.ban.indexOf(t)>=0;
  if(!banned('barracks')) G.builds.push(makeBuild('barracks',owner,x+150,y-40,age,true));
  G.builds.push(makeBuild('farm',owner,x-140,y+60,age,true));
  G.builds.push(makeBuild('farm',owner,x-140,y-30,age,true));
  for(let i=0;i<7;i++){                      // hét munkással indulsz, nem öttel
    const a=srange(0,TAU);
    G.units.push(makeUnit('worker',owner,x+dcos(a)*90,y+dsin(a)*90,age));
  }
  // A szigetlakók kezdősereget is lándzsásból kapnak, nem lovasból
  const kezdo=(NATIONS[nationOf(owner)]&&NATIONS[nationOf(owner)].noAge)?'spear':'melee';
  for(let i=0;i<2;i++) G.units.push(makeUnit(kezdo,owner,x+srange(-70,70),y+srange(60,110),age));
  G.units.push(makeUnit('ranged',owner,x+srange(-70,70),y+srange(60,110),age));
}
// Az ellenfél nemzetét úgy választjuk, hogy a lobogója valóban elüssön a
// játékosétól. Nem a csapatszínt hasonlítjuk össze — a magyar és az osztrák
// zászló is piros-fehér, hiába más az egyenruhájuk —, hanem magukat a
// lemintázott zászlókat, mind a négy korszakban.
const FLAGSIG={};
function flagSignature(nation){
  if(FLAGSIG[nation]) return FLAGSIG[nation];
  const sig=[];
  for(let age=0;age<4;age++){
    const c=document.createElement('canvas'); c.width=12; c.height=8;
    const g=c.getContext('2d');
    FLAGS[nation][age](g,12,8);
    const d=g.getImageData(0,0,12,8).data;
    for(let i=0;i<d.length;i+=4){ sig.push(d[i],d[i+1],d[i+2]); }
  }
  FLAGSIG[nation]=sig; return sig;
}
function flagDistance(a,b){
  const x=flagSignature(a), y=flagSignature(b);
  let sum=0;
  for(let i=0;i<x.length;i++) sum+=Math.abs(x[i]-y[i]);
  return sum/x.length;
}
function pickEnemyNation(mine, foglalt){
  /* A rejtett nemzetek — szigetlakók, kalózfrakciók — csak akkor lépnek fel
     ellenfélként, ha a küldetés kifejezetten őket kéri. Sorsolásból kimaradnak.

     A `foglalt` a már kiosztott nemzetek listája: több bot esetén ezeket
     kihagyjuk, különben két bot ugyanazzal a lobogóval és ugyanazokkal a
     bónuszokkal harcolna. Ha elfogynának a szabad nemzetek (tíz fél,
     nyolc választható nemzet), a tiltás feloldódik — inkább legyen
     ismétlődés, mint hiba. */
  const tilt=foglalt||[];
  /* A KÉSZÜLŐ nemzetek a botnak sem juthatnak: adatuk kész, de a
     látványuk és az ideológiájuk még nem teljes. */
  let list=Object.keys(NATIONS).filter(k=>k!==mine&&!NATIONS[k].hidden&&!NATIONS[k].keszul&&tilt.indexOf(k)<0);
  if(!list.length) list=Object.keys(NATIONS).filter(k=>!NATIONS[k].hidden&&!NATIONS[k].keszul);
  list=list.map(k=>({k,d:flagDistance(mine,k)})).sort((x,y)=>y.d-x.d);
  return list[srangeInt(0,Math.min(2,list.length-1))].k;   // a legkontrasztosabb lobogók közül
}
function newGame(nationKey,mi){
  /* A SZIMULÁCIÓS MAG a LEGELSŐ dolog, még minden sorsolás előtt.

     Innentől minden, ami a világ állapotát érinti, ebből fut: a terep, a
     lelőhelyek, a bot nemzete, az egységek adatai. Ugyanaz a mag ugyanazt
     a játszmát adja — ez a többjátékos mód alapja.

     Tanulság: először a világ létrehozásának KÖZEPÉRE tettem, és emiatt a
     bot nemzete még szabad véletlenből dőlt el. Két azonos maggal indított
     játszmában más nemzet állt szemben, más életerővel — a világok
     azonnal szétcsúsztak. */
  G.simMag=(G.simMag||((Date.now()^(Math.random()*0xFFFFFFFF))>>>0))>>>0;
  if(typeof simSeed==='function') simSeed(G.simMag);
  G.decoSeed=(typeof srangeInt==='function')?srangeInt(1,999999):1;
  G.nextId=0;                      // az azonosítók is nulláról indulnak
  /* Az útkeresés MINDEN átmeneti mezője alaphelyzetbe. Ezek a játékállásban
     élnek, de nem a világ részei — ha átvándorolnak az előző játszmából,
     az egységek másképp indulnak el, és a világok lassan szétcsúsznak. */
  /* MINDEN ÜTEMEZŐ alaphelyzetbe.

     Ezek másodpercek töredékét számolják (mikor frissüljön a köd, mikor
     nőjön vissza az erdő). Ha átvándorolnak az előző játszmából, a
     frissítések FÁZISA eltolódik — a köd más pillanatban frissül, a bot
     más ködképet lát, és a felderítési pont keresése más számú
     véletlenhívást fogyaszt. A világ ettől még sokáig azonosnak látszik,
     de a véletlen sodródik, és előbb-utóbb szétcsúszik. */
  G.navVer=0; G.navLen=-1; G.warmQ=[]; G.flowBudget=2; G.acc=0;
  G.fogT=0; G.regrowT=14; G.regrowT2=40; G.eventT=undefined;
  if(typeof logInit==='function') logInit();   // új parancsnapló
  if(typeof navReset==='function') navReset();
  setCampaign(nationKey);
  G.campNation=nationKey;
  // Tartományon kívüli sorszám (például régi mentésből) szabad játékot
  // jelent — különben a küldetés nélküli állapotra hivatkoznánk.
  const m=(mi>=0&&mi<CAMPAIGN.length)?CAMPAIGN[mi]:null;
  if(!m) mi=-1;
  G.mission=m; G.missionIdx=m?mi:-1;
  // Szabad játékban választható, melyik korszakban kezdünk
  G.nation=nationKey; G.age=m?m.age:(G.startAge||0); G.on=true; G.over=false; G.t=0;
  // Későbbi korszakban kezdve nagyobb induló készlet kell, különben az
  // első korszakváltás ára elérhetetlen távolságban van.
  const sAge=m?m.age:(G.startAge||0);
  const startMul=[1,1.9,3.1,4.6][sAge];
  // A puskapor korától induló játszmához lőszer is kell, különben az első
  // pillanattól némák a lőfegyverek. A küldetések készlete sem tartalmazott
  // szenet — ott is pótoljuk.
  const startCoal=sAge>=COAL_AGE?Math.round(150*startMul):0;
  G.res=Object.assign({wood:0,stone:0,gold:0,food:0,coal:startCoal},
    m?m.res:{wood:Math.round(500*startMul), stone:Math.round(380*startMul),
             gold:Math.round(300*startMul), food:Math.round(420*startMul)});
  /* Az OLDALAK TÁBLÁJA mindennek az alapja: a G.res és a G.ai is erre
     mutat. Ezért a világ létrehozása előtt kell felállnia. A G.oldalTerv
     a szoba beállítása (több ember, botok); ha nincs, a megszokott
     „te és egy gép” áll össze. */
  if(typeof oldalakInit==='function') oldalakInit(G.oldalTerv);
  G.units=[];G.builds=[];G.nodes=[];G.projs=[];G.fx=[];G.sel=[];G.selBuild=null;G.revealed=false;G.btnSig='';
  G.upg={weapon:0,armor:0,supply:0}; G.groups={}; G.doct={};
  // A nemzeti stílus bele van sütve a képekbe, ezért nemzetváltáskor
  // mindent újra kell rajzolni.
  for(const k in SPRITES) delete SPRITES[k];
  for(const k in USPR) delete USPR[k];
  for(const k in ST_CACHE) delete ST_CACHE[k];
  G.earned={wood:0,stone:0,gold:0,food:0,coal:0}; G.kills=0;
  G.atomUsed=false; G.atomAim=null; G.scorch=[]; G.shake=0;   // az előző játszma nyoma törlődik
  G.corpses=[]; G.wrecks=[]; G.sinks=[];                                  // elesettek és roncsok is
  G.offer=null; G.plague=null;
  if(typeof marketInit==='function') marketInit();   // az árfolyamok alaphelyzetbe
  G.starving=false; G.tradeT=undefined;
  if(typeof eventReset==='function') eventReset();            // új eseményóra
  /* Kalózvilágban az ELLENFÉL is a kalózkorban marad — sem ő, sem te nem
     léphetsz korszakot. Enélkül a bot fejlődött volna, és a 20. századi
     rombolói ellen egy fregatt semmit sem érne. */
  /* --- A BOTOK FELÉLESZTÉSE ---
     Minden bot ugyanazokat a munkaadatokat kapja, de a SAJÁT
     bejegyzésébe. Korábban egyetlen G.ai volt; a G.ai innentől az első
     botra mutató ablak, tehát az alábbi értékadás is oda fut.

     Kalózvilágban az ellenfél is a kalózkorban marad — sem ő, sem te nem
     léphetsz korszakot. Enélkül a bot fejlődött volna, és a 20. századi
     rombolói ellen egy fregatt semmit sem érne. */
  {
    const kuldEllen=(mi>=0&&mi<CAMPAIGN.length&&CAMPAIGN[mi]&&CAMPAIGN[mi].enemy)
                    ? CAMPAIGN[mi].enemy : null;
    const botok=(typeof botOldalak==='function')?botOldalak():[];
    for(const bot of botok){
      /* A nemzet: küldetésben kötött, egyébként olyat sorsolunk, aminek a
         lobogója elüt a játékosétól ÉS a többi bot már kiosztott
         zászlajától — különben két bot ugyanazzal a színnel harcolna. */
      if(bot.nemzetRogzit){
        bot.nation = bot.nemzet;                  // a szobában választották ki
      }else{
        /* A viszonyítási pont a 0. FÉL nemzete, nem a helyi játékosé.

           A `nationKey` a saját nemzeted — hálózati játszmában viszont
           minden gépen MÁS. A pickEnemyNation ehhez képest választ
           kontrasztos lobogót, tehát a botok nemzete gépenként eltért
           volna: nálad német, nála angol. Más nemzet = más bónusz = a
           világok azonnal szétcsúsznak.

           A 0. fél nemzete mindenkinél ugyanaz, mert a tervből jön. */
        const viszony=(typeof nationOf==='function')?nationOf(0):nationKey;
        const foglalt=[viszony];
        for(const o of G.oldalak) if(o!==bot&&o.nemzet) foglalt.push(o.nemzet);
        bot.nation = kuldEllen || pickEnemyNation(viszony, foglalt);
      }
      bot.nemzet = bot.nation;
      bot.age   = G.pirate?1:(m?m.aiAge:(G.startAge||0));
      bot.res   = {wood:900,stone:700,gold:600,food:900,coal:400};
      bot.wave  = 0;
      bot.waveT = (m?m.aiWave:115)*DIFF[G.diff].wave;
      bot.rate  = m?m.aiRate:1;
      bot.upg   = {weapon:0,armor:0,supply:0};
      bot.upgT  = 60;
      bot.doct  = {};
      bot.seen  = {melee:0,ranged:0,spear:0};
      bot.defT  = 0;
      bot.buildT= 20;
      bot.trainT= 3;
      bot.ageT  = 210;
      bot.scoutT= 20;
      bot.attacking=false;
      // A szigetlakók sosem lépnek korszakot: végig fából és pálmalevélből
      // építkeznek, és nem ismerik a fémet.
      if(NATIONS[bot.nation]&&NATIONS[bot.nation].noAge){ bot.ageT=1e9; bot.noAge=true; }
      /* Kalózmódban sosem másik kalóz az ellenfél, hanem a két gyarmati
         nagyhatalom: a spanyol ezüstflotta és az angol haditengerészet. */
      if(G.pirate&&NATIONS[nationOf(0)]&&NATIONS[nationOf(0)].pirate){
        /* A gyarmati ellenfél kiválasztása NEM a szimulációs magból megy.

           Egyetlen srnd() húzás volt itt — és ha a húzások sorrendje
           bárhol elcsúszik, ez a fél nemzetet vált: az egyik gépen
           angol lesz, a másikon spanyol. Más nemzet = más bónusz = a
           világok azonnal szétcsúsznak, és a hiba a felderítésnél
           messze kerül az okától.

           A magból és a fél sorszámából számolt érték ugyanezt adja
           minden gépen, ráadásul NEM fogyaszt húzást, tehát maga sem
           tudja elcsúsztatni a sorrendet. */
        const valaszt=(((G.simMag>>>0)^((bot.i+1)*2654435761))>>>0)%2;
        bot.nation=(kuldEllen==='es'||kuldEllen==='gb')?kuldEllen:(valaszt?'gb':'es');
        bot.nemzet=bot.nation;
      }
    }
  }
  // A küldetés megszabhatja a tájat (a spanyol hadjárat szigetvilágon
  // folytatódik); szabad játékban a menü választása vagy a sorsolás dönt.
  const kuld=(mi>=0&&mi<CAMPAIGN.length)?CAMPAIGN[mi]:null;
  // Kalózvilágban a táj mindig a Karib-tenger
  G.mapType = G.pirate ? 'karib'
    : ((kuld&&kuld.map) ? kuld.map
      : ((G.mapPick&&G.mapPick!=='random') ? G.mapPick : (()=>{ const v=MAPS.filter(m=>!m.hidden); return v[srangeInt(0,v.length-1)].key; })()));
  /* A pálya mérete: a kalózvilág HÁROMSZOR akkora minden irányban, mert
     ott a tenger a játéktér. Ezt a KÖD LÉTREHOZÁSA ELŐTT kell beállítani,
     különben a ködrács a régi mérettel készül el. */
  /* A kalózvilág mindig a puskapor és a vitorlás korában játszódik: a
     játék második korszakának képei (muskéta, fregatt, bástya) illenek a
     18. századhoz. Korszakot itt nem lehet váltani. */
  /* A kalózvilág egyetlen kora. FONTOS: MINDEN félre vonatkozik, nem
     csak a helyire.

     A régi sor csak `G.age`-et állította — az viszont a helyi játékos
     kora. A többi fél a felállásból kapott kort (0), így minden gépen
     MÁS fél lett 1. korú: nálam én, a társamnál ő. Ettől más lett a
     kezdősereg és más a világ, vagyis a hálózati játszma az első
     másodpercben szétcsúszott.

     Egyszemélyes játékban ez sosem derülhetett ki, mert ott a helyi
     játékos a 0. fél, és a bot kora külön úton áll be. */
  if(G.pirate){
    G.age=1;
    for(const o of (G.oldalak||[])) o.age=1;
  }
  /* A SZIMULÁCIÓS MAG. Innentől minden, ami a világ állapotát érinti,
     ebből a magból fut — ugyanaz a mag ugyanazt a játszmát adja. Ez a
     többjátékos mód alapja: két gép ugyanabból indul. */
  /* A térkép mérete a felek számához igazodik. Tíz bázis az alapméretű
     világban 534 pixelre került egymástól — a bázisok köré vágott üres
     folt maga 240 sugarú, tehát a szomszédok gyakorlatilag összeértek
     volna. A gyök arányos növelés nagyjából állandó „egy főre jutó
     területet” ad: kettőnél 1×, tíznél 2,2×. */
  if(typeof setWorldSize==='function'){
    const felek=(G.oldalak&&G.oldalak.length)?G.oldalak.length:2;
    const szorzo=G.pirate?3:clamp(Math.sqrt(felek/2),1,2.2);
    setWorldSize(WORLD_ALAP.w*szorzo, WORLD_ALAP.h*szorzo);
  }
  initFog();
  /* Kalózvilágban rögzített Karib-térkép: Kuba, a Bahamák, Jamaica,
     Hispaniola és Tortuga a helyükön. A bázisok is nevezetes kikötőkbe
     kerülnek — a kalóz Nassauba, az ellenfél Havannába vagy Port Royalba. */
  const karib=(G.pirate&&typeof genKarib==='function');
  if(karib) genKarib(); else genWater();
  genMountains();
  /* A TEREP a hegyek UTÁN készül: a szikla köré magasabb, a víz köré
     alacsonyabb terepet teszünk, tehát ismernünk kell mindkettőt. */
  if(typeof genTerep==='function') genTerep();
  let px0=380, py0=WORLD.h-380, ex0=WORLD.w-380, ey0=380;
  if(karib){
    /* Minden kalózfrakciónak SAJÁT fészke van — nem mind Nassauban ülnek:
         Nassau        → Nassau, a kalózköztársaság
         Fekete Szakáll→ Tortuga, a francia kalózsziget
         Stede Bonnet  → Port Royal, ahonnan az úri kalóz indult
       Az ellenség mindig másik kikötőt kap. */
    const FESZEK={ns:'nassau', bb:'tortuga', sb:'portroyal'};
    /* A FELÁLLÁSBÓL dolgozunk, nem a helyi játékos nemzetéből.

       A régi sor `G.nation`-t olvasta — az viszont mindenkinél a SAJÁT
       nemzete. Hálózaton ettől minden gépen máshova került a két
       kikötő, vagyis más világ jött létre, és a játszma az első
       másodpercben szétcsúszott. Egyszemélyes játékban ez sosem
       derülhetett ki, mert ott a helyi játékos a 0. fél. */
    const elsoNemzet=(typeof nationOf==='function')?nationOf(0):G.nation;
    G.homeCity=FESZEK[elsoNemzet]||'nassau';
    const ELLEN={nassau:'havanna', tortuga:'santodomingo', portroyal:'santiago'};
    /* Az ELLENFÉL fészke. Hadjáratban a bot nemzetéből következik (a
       spanyol Havannából indul), TÖBBJÁTÉKOSBAN viszont nincs bot: a
       második fél is ember, saját kalózfrakcióval.

       A régi sor `G.ai.nation`-t olvasott, ami ilyenkor nem létezik —
       ezen szállt el az egész világgenerálás. Most a MÁSODIK FÉL
       nemzetéből dolgozunk, akárki is legyen az. */
    const masikNemzet=(typeof nationOf==='function')?nationOf(1)
                     :((G.ai&&G.ai.nation)||'es');
    G.aiCity=(masikNemzet==='es')?'havanna'
            :(FESZEK[masikNemzet]||ELLEN[G.homeCity]||'havanna');
    if(G.aiCity===G.homeCity) G.aiCity='havanna';
    const p=karibPont(G.homeCity), e=karibPont(G.aiCity);
    px0=p.x; py0=p.y; ex0=e.x; ey0=e.y;
  }
  // A bázisok környéke szárazon marad. Karib-térképen kisebb sugárral,
  // hogy a szigetek megtartsák a formájukat.
  const szarazR=karib?185:300;
  dryOut(px0,py0,szarazR); dryOut(ex0,ey0,szarazR);
  clearRock(px0,py0,320); clearRock(ex0,ey0,320); // a hegyet is elhordjuk a bázisok körül
  // Karib-térképen NINCS szárazföldi átjárás: a felek szigeteken ülnek,
  // és hajóval kell egymáshoz eljutni. Ez a mód lényege.
  if(!karib) ensureLandPath(px0,py0,ex0,ey0);
  ensureRockPath(px0,py0,ex0,ey0);               // és hágó a hegyek között
  paintRock();
  paintWater();
  paintRock();
  genDeco();                       // a magját már a játszma elején beállítottuk
  scatterNodes();
  /* A sűrű erdő a fák helyéből számolódik, tehát csak a nyersanyagok
     kiszórása UTÁN dőlhet el. */
  if(typeof genErdoSuruseg==='function') genErdoSuruseg();
  scatterFish();
  scatterCoal();
  /* A bázisok helye. Karib-térképen a nevezetes kikötőkbe kerülnek, hogy
     a kalóz Nassauban, az ellenfél Havannában vagy Port Royalban kezdjen —
     korábban itt a sarokba tett alapértékek íródtak vissza. */
  const px=px0, py=py0, ex=ex0, ey=ey0;
  /* --- A bázisok helye ---
     Két félnél marad a megszokott átlós felállás: te bal alul, az
     ellenfél jobb felül. Háromtól viszont körben osztjuk el a feleket a
     térkép közepe körüli gyűrűn, hogy senki ne szoruljon sarokba, és
     mindenkinek nagyjából ugyanannyi szomszédja legyen.

     A sorsolás a SZIMULÁCIÓS MAGBÓL megy (srange), tehát mindkét gépen
     ugyanoda kerülnek a bázisok — enélkül a hálózati játszma az első
     képkockán szétcsúszna. */
  const helyek=bazisHelyek(px,py,ex,ey);
  for(const h of helyek){ clearAround(h.x,h.y,240); guaranteeNodes(h.x,h.y); }
  /* A botok induló ideológiái. Több bot esetén mindegyik a magáét kapja. */
  for(const o of (G.oldalak||[])){
    if(o.tipus!=='bot') continue;
    for(let a=0;a<=o.age;a++) o.doct[a]=doctSet(o.i)[a][srangeInt(0,2)].key;
  }
  for(let i=0;i<helyek.length;i++) foundBase(i,helyek[i].x,helyek[i].y);
  /* A bázisok körül szárazzá tettük a terepet, ami ELTOLTA a partvonalat.
     Ezért a városokat itt igazítjuk újra a parthoz — különben Nassau és
     Port Royal a sziget belsejébe került volna. */
  if(G.pirate&&typeof karibShoreSnap==='function') karibShoreSnap();
  /* Kalózvilágban induló flotta: enélkül a stratégiai nézetben üres a
     tenger, hiszen a szárazföldi egységek nem látszanak. */
  if(G.pirate){
    /* MINDEN fél kap flottát, nem csak az első kettő. Három résztvevőnél
       a harmadik korábban hajó nélkül indult — a szigetvilágban ez
       gyakorlatilag azonnali vereség. */
    const flottaHelyek=helyek.map((h,i)=>[i,h.x,h.y]);
    for(const [own,bx,by] of flottaHelyek){
      const fajta=['warship','transport','fisher'];
      for(let i=0;i<3;i++){
        /* A háromszoros pályán a szigetek is háromszor nagyobbak, ezért a
           partot messzebbről kell keresni — korábban 340 pixelnél feladtuk,
           és a flotta ki sem futott a vízre. */
        let hely=null;
        for(let r=90;r<=1200&&!hely;r+=30){
          for(let k=0;k<24;k++){
            const a=k*TAU/24+i;
            const x=bx+dcos(a)*r, y=by+dsin(a)*r;
            if(isWater(x,y)){ hely={x,y}; break; }
          }
        }
        if(hely) G.units.push(makeUnit(fajta[i],own,hely.x,hely.y,G.age));
      }
    }
  }
  /* A díszlet CSAK a bázisok után épül fel: a birkák majorságot keresnek,
     az őzek erdőt. És try/catch alatt, mert egy látványelem hibája soha
     nem akadályozhatja meg a világ felépítését. */
  try{
    if(typeof wildInit==='function') wildInit();          // madarak, őzek, sirályok
    if(typeof wearInit==='function') wearInit();          // tiszta talaj
    if(typeof nyomInit==='function') nyomInit();          // csatanyomok nélkül
    /* A rajzrétegek tiszta lappal indulnak: ha az előző játszmában
       elszállt valamelyik, most újra megpróbálkozunk vele. */
    if(typeof rajzHibaReset==='function') rajzHibaReset();
    if(typeof diplInit==='function') diplInit();          // tiszta diplomáciai lap
    if(typeof weatherInit==='function') weatherInit();
  if(typeof seaInit==='function') seaInit();    // derült idő
    if(typeof livestockInit==='function') livestockInit(); // birkák, civilek
    if(G.pirate&&typeof varosInit==='function') varosInit();  // városok lakossága
  }catch(e){ console&&console.warn&&console.warn('díszlet:',e); }
  centerOnBase();
  G.warmQ=[]; warmSprites(0,0); warmSprites(0,1);
  applyAgeStyle(); syncUI(); drawPortrait();
  /* A sávot a játék indulásakor MINDIG újraértékeljük. Kalózmódban saját
     zene szól, és ha a menüből érkezünk, a korábbi sáv még futhat. */
  if(typeof MUSIC==='object'&&MUSIC.setEra){
    if(typeof trackFor==='function'){
      const kell=trackFor(G.age);
      if(kell&&MUSIC.track!==kell){
        MUSIC.track=kell;
        if(MUSIC.started&&MUSIC.fadeTo) MUSIC.fadeTo(()=>MUSIC.restart());
      }
    }
    MUSIC.setEra(G.age);
  }
  if(typeof achStart==='function') achStart();
  const M=curMap();
  toast(M.name+' — '+M.desc);
  if(typeof setTimeout==='function')
    setTimeout(()=>{ if(G.on) toast('A '+NATIONS[nationKey].name+' zászlaja felvonva. Küldd munkára a jobbágyokat!'); },4200);
}
