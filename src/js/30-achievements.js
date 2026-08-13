/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   30. TELJESÍTMÉNYEK

   Az elért mérföldkövek a játszmán túl is megmaradnak: a böngésző
   tárolójába mentjük őket. Ha az nem érhető el (például szigorú
   beállítás mellett), a lista a munkamenetre korlátozódik — a játék ettől
   nem áll meg.
   ===================================================================== */
const ACHS=[
  {k:'firstBlood', n:'Első vér',        d:'Semmisítsd meg az első ellenséges egységet.'},
  {k:'builder',    n:'Építőmester',     d:'Legyen egyszerre 20 kész épületed.'},
  {k:'town',       n:'Városépítő',      d:'Álljon egyszerre 10 lakóházad.'},
  {k:'goldRush',   n:'Aranyláz',        d:'Termelj ki 1000 aranyat egy játszmában.'},
  {k:'lumber',     n:'Fejsze mestere',  d:'Termelj ki 2000 fát egy játszmában.'},
  {k:'age17',      n:'Puskaporos kor',  d:'Lépj be a 17. századba.'},
  {k:'age20',      n:'Gépesített kor',  d:'Lépj be a 20. századba.'},
  {k:'warlord',    n:'Hadvezér',        d:'Semmisíts meg 50 ellenséges egységet egy játszmában.'},
  {k:'sailor',     n:'Tengerre magyar', d:'Építs kikötőt és állíts hadihajót.'},
  {k:'pilot',      n:'Szárnyakon',      d:'Építs repülőteret és állíts vadászgépet.'},
  {k:'atomic',     n:'Atomkor',         d:'Mérj atomcsapást.'},
  {k:'gatekeeper', n:'Kapuőr',          d:'Nyiss kaput a saját falad egy szakaszán.'},
  {k:'victor',     n:'Hódító',          d:'Nyerj meg egy szabad játszmát.'},
  {k:'campaign',   n:'A birodalom ura', d:'Teljesítsd mind a 11 küldetést.'},

  /* --- Építkezés --- */
  {k:'mason',      n:'Kőműves',         d:'Álljon egyszerre 10 falszakaszod.'},
  {k:'fortress',   n:'Erődrendszer',    d:'Álljon egyszerre 6 tornyod.'},
  {k:'metropolis', n:'Nagyváros',       d:'Legyen egyszerre 30 kész épületed.'},

  /* --- Gazdaság --- */
  {k:'quarry',     n:'Kőfejtő',         d:'Termelj ki 1500 követ egy játszmában.'},
  {k:'coalman',    n:'Bányász',         d:'Termelj ki 800 szenet egy játszmában.'},
  {k:'granary',    n:'Magtár',          d:'Termelj ki 3000 élelmet egy játszmában.'},

  /* --- Hadsereg --- */
  {k:'age19',      n:'Gőz kora',        d:'Lépj be a 19. századba.'},
  {k:'bloodbath',  n:'Vérfürdő',        d:'Semmisíts meg 100 ellenséges egységet egy játszmában.'},
  {k:'horde',      n:'Nagy sereg',      d:'Legyen egyszerre 60 egységed.'},
  {k:'navy',       n:'Hadiflotta',      d:'Legyen egyszerre 4 hadihajód.'},
  {k:'airfleet',   n:'Légiuralom',      d:'Legyen egyszerre 6 repülőgéped.'},
  {k:'bomberman',  n:'Bombázóparancsnok', d:'Állíts hadrendbe bombázót.'},

  /* --- Fejlesztés --- */
  {k:'upgMax',     n:'Tudós',           d:'Fejleszd maximumra a fegyvert, a páncélt és az ellátmányt.'},
  {k:'doctAll',    n:'Államférfi',      d:'Válassz ideológiát mind a négy korszakban.'},

  /* --- Táj --- */
  {k:'desertFox',  n:'Sivatagi róka',   d:'Építs 20 épületet a Sivatagban.'},
  {k:'mountain',   n:'Hegyi ember',     d:'Építs 20 épületet a Hegyvidéken.'},

  /* --- Több játszmán át --- */
  {k:'nations7',   n:'Világjáró',       d:'Játssz mindegyik nemzettel.'},
  {k:'maps8',      n:'Térképész',       d:'Játssz mind a nyolc tájtípuson.'},
  {k:'hardWin',    n:'Nehéz győzelem',  d:'Nyerj meg egy játszmát Nehéz fokozaton.'},
  {k:'halfCamp',   n:'Félúton',         d:'Teljesíts 6 küldetést.'},
  {k:'speedAge',   n:'Villámfejlődés',  d:'Érd el a 17. századot 5 percen belül.'}
];
/* Néhány teljesítmény több játszmán át gyűlik: melyik nemzettel és melyik
   tájon játszottál már. Ezt is a böngésző tárolójában őrizzük. */
const ACH_SEEN={nat:{}, map:{}};
const ACH_DONE={};

function achLoad(){
  try{
    const raw=tarolOlvas('birodalom_ach');
    if(raw) for(const k of JSON.parse(raw)) ACH_DONE[k]=true;
    const seen=tarolOlvas('birodalom_seen');
    if(seen){
      const d=JSON.parse(seen);
      Object.assign(ACH_SEEN.nat, d.nat||{});
      Object.assign(ACH_SEEN.map, d.map||{});
    }
  }catch(e){}                                   // tárolás nélkül is működik
}
function achSave(){
  try{
    tarolIr('birodalom_ach', JSON.stringify(Object.keys(ACH_DONE)));
    tarolIr('birodalom_seen', JSON.stringify(ACH_SEEN));
  }catch(e){}
}
// Játszma indulásakor jegyezzük, melyik nemzettel és tájon játszol
function achStart(){
  if(!G.on) return;
  ACH_SEEN.nat[G.nation]=1;
  ACH_SEEN.map[G.mapType]=1;
  achSave();
  /* A Világjáró csak a SZABAD JÁTÉKBAN választható nemzeteket számolja.
     A rejtettek — szigetlakók, kalózfrakciók — nem játszhatók a rendes
     nemzetválasztóban, velük együtt a teljesítmény elérhetetlen lenne. */
  const valaszthato=Object.keys(NATIONS).filter(k=>!NATIONS[k].hidden&&!NATIONS[k].keszul);
  const jatszott=valaszthato.filter(k=>ACH_SEEN.nat[k]).length;
  if(jatszott>=valaszthato.length) achGet('nations7');
  if(Object.keys(ACH_SEEN.map).length>=MAPS.length) achGet('maps8');
}
function achGet(key){
  if(ACH_DONE[key]) return;
  ACH_DONE[key]=true;
  achSave();
  const a=ACHS.filter(x=>x.k===key)[0];
  if(a){
    toast('🏆 '+T('uzTeljesitmeny')+': '+achName(a.k,a.n));
    SFX.play('age',0.8);
    announce(T('uzTeljesitmeny')+': '+achName(a.k,a.n)+'. '+achDesc(a.k,a.d));
  }
}
// Másodpercenként nézzük végig — nem drága, és minden feltételt egy helyen tart
let achT=0;
function achTick(dt){
  achT-=dt;
  if(achT>0||!G.on) return;
  achT=1;
  let done=0, houses=0, harbor=false, field=false;
  for(const b of G.builds){
    if(b.dead||b.owner!==ENID||!b.done) continue;
    done++;
    if(b.type==='house') houses++;
    if(b.type==='harbor') harbor=true;
    if(b.type==='airfield') field=true;
    if(b.type==='gate') achGet('gatekeeper');
  }
  if(done>=20) achGet('builder');
  if(houses>=10) achGet('town');
  if((G.earned.gold||0)>=1000) achGet('goldRush');
  if((G.earned.wood||0)>=2000) achGet('lumber');
  if(G.age>=1) achGet('age17');
  if(G.age>=3) achGet('age20');
  if(G.kills>=1) achGet('firstBlood');
  if(G.kills>=50) achGet('warlord');
  if(harbor&&G.units.some(u=>!u.dead&&u.owner===ENID&&u.role==='warship')) achGet('sailor');
  if(field&&G.units.some(u=>!u.dead&&u.owner===ENID&&u.role==='fighter')) achGet('pilot');
  if(CAMPAIGN.every((m,i)=>campDone(i))) achGet('campaign');

  // --- Építkezés ---
  let fal=0, torony=0;
  for(const b of G.builds){
    if(b.dead||b.owner!==ENID||!b.done) continue;
    if(b.type==='wall'||b.type==='gate') fal++;
    if(b.type==='tower') torony++;
  }
  if(fal>=10) achGet('mason');
  if(torony>=6) achGet('fortress');
  if(done>=30) achGet('metropolis');
  if(G.mapType==='sivatag'&&done>=20) achGet('desertFox');
  if(G.mapType==='hegy'&&done>=20) achGet('mountain');

  // --- Gazdaság ---
  if((G.earned.stone||0)>=1500) achGet('quarry');
  if((G.earned.coal||0)>=800) achGet('coalman');
  if((G.earned.food||0)>=3000) achGet('granary');

  // --- Korszak és hadsereg ---
  if(G.age>=2) achGet('age19');
  if(G.age>=1&&G.t<=300) achGet('speedAge');
  if(G.kills>=100) achGet('bloodbath');
  let sereg=0, hajo=0, gep=0, bombazo=false;
  for(const u of G.units){
    if(u.dead||u.owner!==ENID) continue;
    sereg++;
    if(u.role==='warship') hajo++;
    if(u.air) gep++;
    if(u.bomb) bombazo=true;
  }
  if(sereg>=60) achGet('horde');
  if(hajo>=4) achGet('navy');
  if(gep>=6) achGet('airfleet');
  if(bombazo) achGet('bomberman');

  // --- Fejlesztés ---
  if((G.upg.weapon||0)>=3&&(G.upg.armor||0)>=3&&(G.upg.supply||0)>=3) achGet('upgMax');
  if(G.age>=3&&G.doct[0]&&G.doct[1]&&G.doct[2]&&G.doct[3]) achGet('doctAll');

  // --- Hadjárat ---
  let kesz=0;
  for(const k in CAMP_DONE) if(CAMP_DONE[k]) kesz++;
  if(kesz>=6) achGet('halfCamp');
}
// A menü teljesítménylapja
function renderAch(){
  const box=$('achList');
  if(!box) return;
  box.innerHTML='';
  const got=ACHS.filter(a=>ACH_DONE[a.k]).length;
  const head=$('achCount');
  if(head) head.textContent=got+' / '+ACHS.length+' '+T('achElerve');
  for(const a of ACHS){
    const el=document.createElement('div');
    el.className='ach'+(ACH_DONE[a.k]?' on':'');
    el.innerHTML='<b>'+(ACH_DONE[a.k]?'🏆':'—')+' '+achName(a.k,a.n)+'</b><span>'+achDesc(a.k,a.d)+'</span>';
    box.appendChild(el);
  }
}
achLoad();
