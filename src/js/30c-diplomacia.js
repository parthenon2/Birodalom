/* =======================================================================
   30/C. DIPLOMÁCIA

   A szövetség eddig a szobában dőlt el, és kőbe volt vésve: aki azonos
   csapatszámot kapott, az a játszma végéig szövetséges maradt.

   Ez elveszi a többjátékos legizgalmasabb részét. Ha menet közben lehet
   szövetséget kötni ÉS felbontani, akkor minden szomszéddal viszony van,
   nem csak állapot: érdemes-e most segíteni, meddig bízhatok benne,
   mikor fordulok ellene.

   HÁROM SZABÁLY tartja egyben:

     1. A SZÖVETSÉG KÉTOLDALÚ. Felajánlom, a másik elfogadja. Egyoldalúan
        senki nem húzhat magához társat.

     2. A FELMONDÁS EGYOLDALÚ, DE LASSÚ. Aki felmond, azonnal jelzi — de
        a szövetség csak húsz másodperc múlva szűnik meg. Ennyi idő alatt
        a másik ki tudja vonni a seregét a hátországból. Így az árulás
        kockázatos, nem ingyenes: mindenki tudja, mi jön.

     3. MINDEN ÁLLAPOTVÁLTÁS PARANCS. A szimulációt érinti (ki kire lő),
        tehát ugyanúgy a lépészáron megy át, mint a mozgás — különben a
        két gépen más lenne, ki kinek az ellensége.

   A botok is válaszolnak: elfogadják a szövetséget, ha épp szorongatják
   őket, és felmondják, ha már csak ketten maradtak.
   ===================================================================== */

const DIPL_FELMONDAS_IDO = 20;      // ennyi másodperc múlva szűnik meg
const DIPL_AJANLAT_IDO   = 45;      // ennyi ideig él egy ajánlat

/* Az állapot a G-ben él, hogy a mentés is vigye. Kulcs: 'a-b' rendezve. */
function diplKulcs(a, b){ return (a < b) ? (a + '-' + b) : (b + '-' + a); }

/* --- A CÍMZETT ELLENŐRZÉSE ---
   A parancs a hálózatról jön, tehát bármi lehet benne. Egy módosított
   kliens `diplAjanl(999)`-cel korlátlanul sok bejegyzést hozhatna létre a
   tárban — minden gépen, hiszen a parancs mindenhol lefut. Az így
   felduzzadt állapot memóriát eszik, és a mentést is használhatatlanná
   teszi.

   Ezért: a címzettnek LÉTEZŐ, még játékban lévő félnek kell lennie. Ez a
   fajta hiba a támadási próbán bukott ki. */
function diplErvenyesFel(i){
  if(typeof i !== 'number' || !isFinite(i) || i !== Math.floor(i)) return false;
  if(i < 0 || i >= 32) return false;
  const o = (typeof oldal === 'function') ? oldal(i) : null;
  return !!o && !o.kiesett;
}

function diplInit(){
  G.dipl = { ajanlat: {}, felmondas: {}, szovetseg: {} };
}
/* A JÁTÉK ÁLLÁSA szerint szövetségesek-e? A csapatszám az alap, de a
   menet közbeni döntések felülírják. */
function diplSzovetseges(a, b){
  if(a === b) return true;
  if(!G.dipl) return null;                      // nincs döntés: marad a csapat
  const k = diplKulcs(a, b);
  /* FELMONDÁS ALATT A SZÖVETSÉG MÉG ÁLL. Ez a lényege: a húsz másodperc
     arra való, hogy a másik ki tudja vonni a seregét. Ha a felmondás
     azonnal hatna, az egész türelmi idő üres formalitás lenne — és pont
     az árulás kockázata veszne el belőle.

     (Első nekifutásra itt `false`-t adtam vissza, holott a megjegyzésem
     is azt mondta, hogy „még igen”. A próba fogta meg.) */
  if(G.dipl.felmondas[k] !== undefined) return true;
  if(G.dipl.szovetseg[k] === true) return true;
  if(G.dipl.szovetseg[k] === false) return false;
  return null;
}

/* --- AJÁNLAT --- */
function diplAjanl(kinek){
  if(typeof logAdd === 'function' && logAdd('diplAjanl', kinek)) return;
  diplAjanlVegrehajt(kinek);
}
function diplAjanlVegrehajt(kinek){
  const tol = ENID;
  if(tol === kinek) return;
  if(!diplErvenyesFel(kinek) || !diplErvenyesFel(tol)) return;
  if(!G.dipl) diplInit();
  const k = diplKulcs(tol, kinek);
  /* Ha a MÁSIK már ajánlott nekünk, ez az elfogadás. */
  if(G.dipl.ajanlat[k] !== undefined && G.dipl.ajanlat[k].tol === kinek){
    delete G.dipl.ajanlat[k];
    delete G.dipl.felmondas[k];
    G.dipl.szovetseg[k] = true;
    diplUzen(tol, kinek, 'uzSzovetsegKotve');
    return;
  }
  G.dipl.ajanlat[k] = { tol, t: DIPL_AJANLAT_IDO };
  diplUzen(tol, kinek, 'uzSzovetsegAjanlva');
}

/* --- FELMONDÁS --- */
function diplFelmond(kinek){
  if(typeof logAdd === 'function' && logAdd('diplFelmond', kinek)) return;
  diplFelmondVegrehajt(kinek);
}
function diplFelmondVegrehajt(kinek){
  const tol = ENID;
  if(tol === kinek) return;
  if(!diplErvenyesFel(kinek) || !diplErvenyesFel(tol)) return;
  if(!G.dipl) diplInit();
  const k = diplKulcs(tol, kinek);
  delete G.dipl.ajanlat[k];
  if(G.dipl.felmondas[k] !== undefined) return;     // már fut a visszaszámlálás
  if(!szovetseges(tol, kinek)) return;              // nem is voltunk szövetségesek
  G.dipl.felmondas[k] = DIPL_FELMONDAS_IDO;
  diplUzen(tol, kinek, 'uzSzovetsegFelmondva');
}

/* Az üzenet csak azt érinti, aki benne van — a többieknek semmi közük
   hozzá, és a képernyőjüket sem szabad teleírni vele. */
function diplUzen(a, b, kulcs){
  const en = (typeof helyiFel === 'function') ? helyiFel() : 0;
  if(a !== en && b !== en) return;
  const masik = (a === en) ? b : a;
  const nev = (typeof oldalNev === 'function') ? oldalNev(masik)
            : ((typeof nationName === 'function') ? nationName(nationOf(masik)) : ('' + masik));
  toast(T(kulcs) + ' — ' + nev);
}

/* Az idő múlása: az ajánlatok lejárnak, a felmondás beérik. */
function diplTick(dt){
  if(!G.dipl) return;
  for(const k in G.dipl.ajanlat){
    const a = G.dipl.ajanlat[k];
    a.t -= dt;
    if(a.t <= 0) delete G.dipl.ajanlat[k];
  }
  for(const k in G.dipl.felmondas){
    G.dipl.felmondas[k] -= dt;
    if(G.dipl.felmondas[k] <= 0){
      delete G.dipl.felmondas[k];
      G.dipl.szovetseg[k] = false;                 // innentől ellenség
      const r = k.split('-');
      diplUzen(+r[0], +r[1], 'uzSzovetsegVege');
    }
  }
}

if(typeof parancsRegiszter === 'function'){
  parancsRegiszter('diplAjanl',   diplAjanlVegrehajt);
  parancsRegiszter('diplFelmond', diplFelmondVegrehajt);
}

/* --- A BOTOK VÁLASZA ---
   Nem tárgyalnak hosszan: ha szorongatják őket, elfogadják a segítséget;
   ha már csak ketten maradtak, felmondják. Ennyi elég ahhoz, hogy a
   diplomácia egyszemélyes játékban se legyen üres gomb. */
function diplBotLep(dt){
  if(!G.dipl) return;
  G.diplBotT = (G.diplBotT || 0) - dt;
  if(G.diplBotT > 0) return;
  G.diplBotT = 6;

  for(const k in G.dipl.ajanlat){
    const a = G.dipl.ajanlat[k];
    const r = k.split('-');
    const masik = (+r[0] === a.tol) ? +r[1] : +r[0];
    const o = (typeof oldal === 'function') ? oldal(masik) : null;
    if(!o || o.tipus !== 'bot' || o.kiesett) continue;

    /* Elfogadja, ha kevesebb egysége van, mint az átlag — vagyis
       szorongatják. A magabiztos bot nem szövetkezik. */
    let sajat = 0, ossz = 0, felek = 0;
    for(const o2 of (G.oldalak || [])){
      if(o2.kiesett) continue;
      const n = G.units.filter(u => !u.dead && u.owner === o2.i && u.role !== 'worker').length;
      ossz += n; felek++;
      if(o2.i === masik) sajat = n;
    }
    const atlag = felek ? ossz / felek : 0;
    if(sajat < atlag * 0.8){
      const elozo = G.enId;
      G.enId = masik;                    // a bot nevében válaszolunk
      diplAjanlVegrehajt(a.tol);
      G.enId = elozo;
    }
  }
}
