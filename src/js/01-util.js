/* --- Hálózatra küldhető parancsok táblája ---
   Itt, a legelején áll, mert bármelyik későbbi modul regisztrálhat bele.
   A tényleges végrehajtást a 28c-tick.js logApply-ja végzi. */
const PARANCS_TABLA={};
function parancsRegiszter(nev, fn){ PARANCS_TABLA[nev]=fn; }

/* =======================================================================
   1. SEGÉDFÜGGVÉNYEK
   ===================================================================== */
const rnd=(a,b)=>a+Math.random()*(b-a);
const rndInt=(a,b)=>Math.floor(rnd(a,b+1));
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const TAU=Math.PI*2;
// A statisztikák lehetnek korszakonkénti tömbök vagy fix számok:
const val=(v,age)=>Array.isArray(v)?v[age]:v;

/* -----------------------------------------------------------------------
   JÁTÉKTEMPÓ ÉS NEHÉZSÉG

   A tempó egyetlen helyen szabályozható: a kisebb szám lassabb,
   megfontoltabb játékot jelent, ahol a nyersanyag valódi korlát.
   A nehézségi fokozat a bot bevételét és rohamait szabja meg — a "nehéz"
   az eddigi játék, a másik kettő ehhez képest ad levegőt.
   ----------------------------------------------------------------------- */
// A szén a 17. századtól kell: a puska, a géppuska és a harckocsi lövése
// fogyasztja. Szén nélkül a lőfegyver néma marad.
/* -----------------------------------------------------------------------
   PÁLYATÍPUSOK

   Minden játszma elején sorsolunk egyet. A típus a növényzet, az érc és a
   víz mennyiségét szabja meg, és a talaj színét is árnyalja — így a
   Sivatag már ránézésre más, mint a Rengeteg.
   ----------------------------------------------------------------------- */
const MAPS=[
 {key:'mezo',   name:'Alföld',        desc:'Kiegyensúlyozott táj: elég fa, elég érc, néhány tó.',
  tree:1,    stone:1,   gold:1,   coal:1,   lakes:2, rivers:1, sea:1, mountains:0, ground:null},
 {key:'erdo',   name:'Rengeteg',      desc:'Sűrű erdőség. Fából bőven van, kőből alig.',
  tree:2.2,  stone:0.55,gold:0.8, coal:0.9, lakes:2, rivers:1, sea:1, mountains:0, ground:'#3d6b2c'},
 {key:'kopar',  name:'Kopár vidék',   desc:'Alig egy-két liget, viszont ércben gazdag.',
  tree:0.35, stone:1.8, gold:1.5, coal:1.7, lakes:1, rivers:1, sea:1, mountains:2, ground:'#7d8a4a'},
 {key:'sivatag',name:'Sivatag',       desc:'Homok és szikla. Kevés víz, dús aranytelérek.',
  tree:0.22, stone:1.3, gold:2,   coal:1.3, lakes:0, rivers:0, sea:0, mountains:2, ground:'#c0a468'},
 {key:'folyok', name:'Folyóköz',      desc:'Több folyó szeli át a tájat — a hidak helyét jól válaszd meg.',
  tree:1.1,  stone:0.9, gold:1,   coal:1,   lakes:1, rivers:4, sea:1, mountains:0, ground:null},
 {key:'tavak',  name:'Tóvidék',       desc:'Rengeteg tó, halban gazdag vizekkel.',
  tree:1,    stone:0.85,gold:0.9, coal:0.9, lakes:8, rivers:1, sea:1, mountains:0, ground:'#4f7d3a'},
 {key:'hegy',   name:'Hegyvidék',     desc:'Sziklás, ércben gazdag, fában szegény vidék.',
  tree:0.6,  stone:2.3, gold:1.4, coal:1.9, lakes:1, rivers:2, sea:1, mountains:6, ground:'#6e7a48'},
 {key:'puszta', name:'Szikes puszta', desc:'Alig van víz a térképen. A majorságokra kell hagyatkozni.',
  tree:0.45, stone:1.1, gold:1.1, coal:1.1, lakes:0, rivers:0, sea:0, mountains:1, ground:'#93924e'},
 {key:'karib',   name:'Karib-tenger',  desc:'Rögzített térkép: Kuba, a Bahamák, Jamaica, Hispaniola és Tortuga.',
  tree:1.5, stone:0.6, gold:0.5, coal:0.4, lakes:0, rivers:0, sea:0, ground:'#4a7a34', mountains:0, hidden:true},
 {key:'szigetek',name:'Szigetvilág',   desc:'Sűrű erdős szigetek, rengeteg víz, alig arany — az Újvilág tájai.',
  tree:1.9,  stone:0.7, gold:0.3, coal:0.6, lakes:16, rivers:0, sea:2.4, ground:'#41762f', mountains:0}
];
function curMap(){ return MAPS.filter(m=>m.key===G.mapType)[0]||MAPS[0]; }

const COAL_AGE=1;                       // ettől a korszaktól él a lőszerigény
const COAL_COST={ranged:0.34, warship:0.9, tower:0.22, melee:1.4};
const PACE={
  gather:2.2,      // gyűjtési ütem (korábban 6)
  farm:0.55,       // majorságok élelemtermelése
  speed:0.82,      // egységek mozgása
  build:1.55,      // építkezés hossza
  train:1.45,      // kiképzés hossza
  aiIncome:0.42    // a bot passzív bevétele
};
const DIFF=[
  /* A számok jelentése:
       income — mennyi nyersanyagot kap a bot (1 = mint a játékos)
       wave   — a rohamok közti idő SZORZÓJA (nagyobb = ritkább)
       size   — mennyivel több vagy kevesebb egység egy hullámban
       upg    — fejleszt-e egyáltalán

     A v2.3-ban mindhárom szint visszavett a nyomásból: a közepes
     korábban 0,72-es jövedelemmel és 1,4-es hullámszorzóval a nehéz
     kistestvére volt, nem pedig kiegyensúlyozott ellenfél. */
  {key:'easy', name:'Könnyű', income:0.34, wave:2.6, size:-3, upg:false,
   desc:'A szomszéd lassan épül, ritkán és kis erővel támad. Kényelmes tanulásra.'},
  {key:'med', name:'Közepes', income:0.55, wave:1.9, size:-2, upg:true,
   desc:'Kiegyensúlyozott ellenfél: ad tennivalót, de hagy építkezni.'},
  {key:'hard', name:'Nehéz', income:0.82, wave:1.25, size:-1, upg:true,
   desc:'Kemény ellenfél, gyakori rohamokkal. Aki már ismeri a játékot.'}
];
