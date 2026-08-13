/* =======================================================================
   29/F. HÍRNÉV

   Minél többet rabolsz, annál nagyobb flottát küldenek rád. A hírnév
   lassan telik, és amikor megtelik, kifut a KIRÁLYI HAJÓHAD — annyi
   hadihajóval, amennyit kiérdemeltél.

   Mi növeli:
     elsüllyesztett ellenséges hajó   +6
     elfoglalt hajó (átszállás)       +9
     elfoglalt város                 +18
     lerombolt ellenséges épület      +2

   A KEGYELEMLEVÉL nullázza — de a király elveszi az egyik városodat.
   Ez az igazi döntés: a hírnév a hatalmad jele, de a veszted is.
   ===================================================================== */

const HIRNEV_MAX=100;
const HIRNEV_LASSU=0.35;        // ennyivel csillapodik percenként, ha nyugton vagy

function hirnevAd(mennyi, ok){
  if(!G.pirate||!G.on) return;
  const elotte=G.hirnev||0;
  G.hirnev=Math.min(HIRNEV_MAX*1.4, elotte+mennyi);
  // figyelmeztetés a küszöbök átlépésekor
  for(const kuszob of [40,70,90]){
    if(elotte<kuszob&&G.hirnev>=kuszob){
      toast(kuszob>=90?T('hnKiralyHajohad')
           :(kuszob>=70?T('hnKormanyzo')
                       :T('hnTerjed')));
    }
  }
  if(G.hirnev>=HIRNEV_MAX) kiralyiFlotta();
}
function hirnevTick(dt){
  /* A HÍRNÉV egyjátékosos szabály: a 0. fél tetteit méri, és az ő
     bázisára küldi a királyi hajóhadat. Hálózaton ez értelmetlen — több
     ember-kalóz van —, ÉS veszélyes: a hírnév minden gépen a saját
     tettekből nő, tehát máskor futna ki a flotta, és a játszma
     szétcsúszna.

     Ezért hálózati játszmában kimarad. Ha egyszer többjátékosra is
     megírjuk, félenkénti hírnév kell hozzá, parancsba tett flottával. */
  if(G.net&&G.net.allapot==='jatek') return;

  if(!G.pirate||!G.on) return;
  if(G.hirnev>0) G.hirnev=Math.max(0,G.hirnev-HIRNEV_LASSU*dt/60);
}

/* A királyi hajóhad: a hírnév nagyságához mért erő fut ki a bázisod felé. */
function kiralyiFlotta(){
  const db=Math.min(8, 3+Math.floor((G.hirnev-HIRNEV_MAX)/12)+1);
  const hq=G.builds.filter(b=>!b.dead&&b.owner===0&&b.type==='hq')[0];
  if(!hq){ G.hirnev=HIRNEV_MAX*0.6; return; }
  // a pálya szélén, nyílt vízen gyülekeznek
  let hely=null;
  for(let i=0;i<300&&!hely;i++){
    const a=srnd()*TAU, r=1400+srnd()*1800;
    const x=clamp(hq.x+dcos(a)*r,60,WORLD.w-60);
    const y=clamp(hq.y+dsin(a)*r,60,WORLD.h-60);
    if(isWater(x,y)) hely={x,y};
  }
  if(!hely){ G.hirnev=HIRNEV_MAX*0.6; return; }
  for(let i=0;i<db;i++){
    const r=(i<db*0.4)?'galleon':'warship';
    const u=makeUnit(r,1,hely.x+srange(-90,90),hely.y+srange(-90,90),G.age);
    u.order={type:'attackMove',x:hq.x,y:hq.y};
    u.royal=true;
    G.units.push(u);
  }
  G.hirnev=HIRNEV_MAX*0.55;               // a hajóhad kifutásával lecsillapodik
  toast(T('uzKiralyiHajohad')+': '+db+' '+T('hnHadihajo'));
  SFX.play('warn',1);
  G.shake=Math.min(1,(G.shake||0)+0.5);
}

/* KEGYELEMLEVÉL: a hírnév nullázódik, de elveszted a legkisebb városodat. */
function kegyelemAr(){
  // a legkevesebb épülettel bíró saját város
  let jo=null, db=1e9;
  for(const v of KIKOTOK){
    if(portOwner(v.kulcs)!==0) continue;
    const n=portBuilds(v.kulcs).length;
    if(n<db){ db=n; jo=v; }
  }
  return jo;
}
function kegyelemKer(){
  if(!G.pirate) return;
  if((G.hirnev||0)<25){ toast(T('hnTiszta')); SFX.play('deny'); return; }
  /* Az UTOLSÓ várost nem adhatod oda: az azonnali vereség lenne, nem
     döntés. Legalább kettő kell hozzá. */
  const sajat=KIKOTOK.filter(x=>portOwner(x.kulcs)===0).length;
  if(sajat<2){
    toast(T('hnEgyVaros'));
    SFX.play('deny'); return;
  }
  const v=kegyelemAr();
  if(!v){ toast(T('hnNincsVaros')); SFX.play('deny'); return; }
  // a város és a körülötte álló épületek a koronáé lesznek
  const p=portPos(v.kulcs);
  let db=0;
  for(const b of G.builds){
    if(b.dead||b.owner!==0) continue;
    if(dist(b.x,b.y,p.x,p.y)<420){ b.owner=1; db++; }
  }
  const a=(typeof varosAdat==='function')?varosAdat(v.kulcs):null;
  if(a){ a.lakos=Math.max(a.lakos,320); a.torony=Math.max(a.torony,2); }
  G.hirnev=0;
  G.kegyelem=(G.kegyelem||0)+1;
  G.navVer++;
  toast(T('hnKegyelem')+' '+v.nev+' '+T('hnKoronae')+' ('+db+' '+T('celEpulet')+').');
  SFX.play('ready',0.9);
  syncUI();
}

/* A hírnévsáv frissítése. Csak kalózvilágban látszik. */
function hirnevUI(){
  const el=$('fameBar');
  if(!el||!el.classList) return;
  if(!G.pirate||!G.on){ el.classList.remove('on'); return; }
  el.classList.add('on');
  const h=Math.min(HIRNEV_MAX,G.hirnev||0);
  const arany=h/HIRNEV_MAX;
  const f=$('fmFill');
  if(f&&f.style) f.style.height=Math.round(arany*100)+'%';
  const v=$('fmVal');
  if(v) v.textContent=Math.round(h);
  el.classList.toggle('forr',arany>0.75);
}
