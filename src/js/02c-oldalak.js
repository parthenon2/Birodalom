/* =======================================================================
   2/C. OLDALAK — több fél egy térképen

   A játék eddig két felet ismert: te (0) és a gép (1). A készleted a
   `G.res`-ben állt, a gépé a `G.ai.res`-ben — két külön alakú doboz
   ugyanarra a dologra.

   Innentől EGYETLEN tábla van, a `G.oldalak`, és minden fél ugyanolyan
   bejegyzés benne. A 0. a helyi játékos, utána a többi ember, majd a
   botok. Legfeljebb hat ember és négy bot, együtt tíz.

   A régi `G.res` és `G.ai` NEM tűnt el: mindkettő erre a táblára mutató
   ablak lett (lásd a fájl végén). Így a mintegy száz hivatkozás a
   kódban változatlanul működik, miközben alatta már több fél áll.

   Determinizmus: a tábla sorrendje mindkét gépen azonos, mert a
   szimuláció ezen a sorrenden megy végig. Új felet csak a játszma
   INDULÁSAKOR veszünk fel, menet közben soha.
   ===================================================================== */

const MAX_EMBER = 6;                 // ennyi ember fér egy játszmába
const MAX_BOT   = 4;                 // ennyi bot tehető melléjük
const MAX_OLDAL = MAX_EMBER + MAX_BOT;

/* Tíz csapatszín. Nem a nemzeti lobogóból jönnek — azok közül több is
   piros-fehér —, hanem egymástól a lehető legjobban elváló árnyalatok.
   Mindegyikhez tartozik egy világosabb kiemelés a szegélyekhez. */
const OLDAL_SZINEK = [
  { szin:'#2E6DB4', kiemel:'#8CC2F0', nev:'kék'      },
  { szin:'#C0392B', kiemel:'#F0A79E', nev:'vörös'    },
  { szin:'#1E8449', kiemel:'#8FE0B0', nev:'zöld'     },
  { szin:'#D68910', kiemel:'#FBD98A', nev:'sárga'    },
  { szin:'#6B4A9E', kiemel:'#C3A9E8', nev:'lila'     },
  { szin:'#17A2A2', kiemel:'#8FE6E6', nev:'türkiz'   },
  { szin:'#C2185B', kiemel:'#F5A0C0', nev:'rózsa'    },
  { szin:'#7F8C1A', kiemel:'#D6E37A', nev:'olív'     },
  { szin:'#8D6E3A', kiemel:'#DCC49A', nev:'barna'    },
  { szin:'#556270', kiemel:'#AEBAC6', nev:'palaszürke'}
];

/* Színvakbarát módban nem tíz árnyalat kell, hanem az Okabe–Ito paletta:
   ezek mind a három gyakori színtévesztésnél elkülönülnek. Nyolc szín van
   benne, a kilencedik és tizedik fél a jelalakból (folytonos vagy
   szaggatott talpgyűrű) különböztethető meg. */
const OLDAL_SZINEK_CB = [
  { szin:'#0072B2', kiemel:'#56B4E9' },
  { szin:'#E69F00', kiemel:'#F0C87A' },
  { szin:'#009E73', kiemel:'#66C2A5' },
  { szin:'#CC79A7', kiemel:'#E8B4CE' },
  { szin:'#D55E00', kiemel:'#F09B5E' },
  { szin:'#56B4E9', kiemel:'#A6D8F5' },
  { szin:'#F0E442', kiemel:'#F7EF93' },
  { szin:'#000000', kiemel:'#7A7A7A' },
  { szin:'#8C6BB1', kiemel:'#C3A9E8' },
  { szin:'#4D4D4D', kiemel:'#9E9E9E' }
];

/* Egy fél alapállapota. A botoknál ugyanez a bejegyzés hordozza az AI
   munkaadatait is (seen, wave, waveT) — így nincs külön G.ai szerkezet. */
function ujOldal(i, opt){
  opt = opt || {};
  return {
    i: i,
    tipus: opt.tipus || 'bot',          // 'ember' | 'bot' | 'ures'
    nev: opt.nev || '',
    helyi: !!opt.helyi,                 // ezt a felet ez a gép irányítja
    nemzet: opt.nemzet || 'hu',
    csapat: (opt.csapat === undefined) ? i : opt.csapat,
    age: opt.age || 0,
    res: Object.assign({ wood:500, stone:380, gold:300, food:420, coal:0 }, opt.res || {}),
    elt: true,                          // él-e még (van főhadiszállása vagy munkása)
    /* csak botoknál használt munkaadatok */
    seen: { melee:0, ranged:0, spear:0, cav:0 },   // a lovast is számon tartja
    wave: 0, waveT: 115, rate: 1, noAge: false,
    /* fejlesztések és ideológiák félenként */
    formation: 'line',                  // alakzat félenként
    upg: { weapon:0, armor:0, supply:0 },
    doct: {}
  };
}

/* ---------- lekérdezések ---------- */
function oldal(i){ return (G.oldalak && G.oldalak[i]) || null; }
function oldalDb(){ return G.oldalak ? G.oldalak.length : 0; }
function resOf(i){ const o = oldal(i); return o ? o.res : G.res; }
function korOf(i){ const o = oldal(i); return o ? o.age : G.age; }
function szinOf(i){
  const t = G.cb ? OLDAL_SZINEK_CB : OLDAL_SZINEK;
  return t[i % t.length];
}
function emberOldalak(){ return (G.oldalak||[]).filter(o => o.tipus === 'ember'); }
function botOldalak(){   return (G.oldalak||[]).filter(o => o.tipus === 'bot'); }

/* Szövetség: azonos csapatszám. Alapból mindenki külön csapat, tehát
   mindenki mindenkinek ellensége — szabad rablás. A csapatokat a
   szobában lehet majd összevonni. */
function szovetseges(a, b){
  if(a === b) return true;
  const A = oldal(a), B = oldal(b);
  if(!A || !B) return false;
  /* A MENET KÖZBENI döntés erősebb, mint a szobában kapott csapatszám.
     Ha van ilyen, az dönt; ha nincs, marad a csapat. Így a régi mentések
     és az egyszemélyes játszmák viselkedése változatlan. */
  if(typeof diplSzovetseges === 'function'){
    const d = diplSzovetseges(a, b);
    if(d !== null && d !== undefined) return d;
  }
  return A.csapat === B.csapat;
}
function ellenseg(a, b){ return !szovetseges(a, b); }

/* A HELYI játékos szemszöge. A rajzolás és a kistérkép ezt használja:
   a sajátodat és a szövetségesedét mindig látod, az ellenséget csak
   felderített területen. Korábban mindenhol a 0-s tulajdonos állt —
   hálózati játszmában viszont te lehetsz a 3. fél is. */
function enyemVagySzovetseges(o){
  return szovetseges(helyiFel(), o);
}
/* A KÉPERNYŐ gazdája: mindig az igazi helyi játékos, akkor is, ha épp egy
   társ parancsát hajtjuk végre. */
function helyiFel(){
  if(typeof G==='undefined') return 0;
  return (G.enIdHelyi!==undefined) ? G.enIdHelyi : (G.enId||0);
}
function sajatFel(){ return (typeof G!=='undefined' && G.enId) ? G.enId : 0; }
/* Rövidítés ugyanerre. A parancsok, a kijelölés és a felület sok tucat
   helyen hivatkozik rá, ezért kap saját nevet.

   Miért getter, és nem sima változó? Mert a helyi fél sorszáma a világ
   létrehozásakor dől el, a modulok viszont ennél korábban töltődnek be.
   Egy `const ENID = G.enId` az akkori — nulla — értéket rögzítené. */
Object.defineProperty(typeof globalThis!=='undefined'?globalThis:window, 'ENID', {
  configurable:true, get(){ return sajatFel(); }
});
/* Szövetséges, de nem én — ezt jelöljük külön a térképen. */
function szovetsegesFel(o){ return o!==sajatFel() && szovetseges(sajatFel(), o); }

/* Egy fél akkor esett ki, ha nincs se főhadiszállása, se kaszárnyája, se
   munkása — ugyanaz a feltétel, amit a vereség használ. */
function oldalElo(i){
  for(const b of G.builds)
    if(!b.dead && b.owner === i && (b.type === 'hq' || b.type === 'barracks')) return true;
  for(const u of G.units)
    if(!u.dead && u.owner === i && u.role === 'worker') return true;
  return false;
}

/* ---------- a tábla felépítése ---------- */
/* A leírás így néz ki:
     [{tipus:'ember', nemzet:'hu', nev:'Bence', helyi:true},
      {tipus:'bot',   nemzet:'de'}]
   A 0. mindig a helyi játékos. Ha nincs leírás, a régi 1v1 áll össze. */
function oldalakInit(leiras){
  const lista = (leiras && leiras.length) ? leiras.slice(0, MAX_OLDAL) : null;
  G.oldalak = [];
  if(!lista){
    // A megszokott állás: te és egy gép, külön csapatban.
    G.oldalak.push(ujOldal(0, { tipus:'ember', helyi:true, nemzet:G.nation, csapat:0,
                                age:G.age, res:G.resKezdo || undefined }));
    G.oldalak.push(ujOldal(1, { tipus:'bot', nemzet:'de', csapat:1 }));
  }else{
    for(let i = 0; i < lista.length; i++){
      const l = lista[i] || {};
      const o = ujOldal(i, {
        tipus: l.tipus || 'bot',
        nev: l.nev,
        helyi: !!l.helyi,
        nemzet: l.nemzet || 'hu',
        csapat: (l.csapat === undefined) ? i : l.csapat,
        age: (l.age === undefined) ? (G.startAge || 0) : l.age
      });
      /* Ha a szobában kézzel választottak nemzetet, azt tartjuk. Ha nem, a
         világ létrehozása sorsol olyat, ami elüt a többiekétől. */
      o.nemzetRogzit = !!l.nemzet;
      G.oldalak.push(o);
    }
  }
  /* A helyi fél sorszáma. Erre mutat a G.res, a G.age és a kijelölés. */
  G.enId = 0;
  for(const o of G.oldalak) if(o.helyi){ G.enId = o.i; break; }
  /* A HELYI játékos sorszáma külön is: a G.enId a parancsok végrehajtása
     alatt átmenetileg a FELADÓRA vált (lásd netTarsParancsok), és utána
     ebből áll vissza. A képernyő — kamera, köd, ponttábla — mindig ezt
     nézi, nem a pillanatnyi cselekvőt. */
  G.enIdHelyi = G.enId;
  return G.oldalak;
}

/* Hány embert és botot bír még el a mostani felállás. */
function oldalakFerHely(leiras){
  const e = (leiras||[]).filter(x => x.tipus === 'ember').length;
  const b = (leiras||[]).filter(x => x.tipus === 'bot').length;
  return { ember: Math.max(0, MAX_EMBER - e), bot: Math.max(0, MAX_BOT - b) };
}

/* -----------------------------------------------------------------------
   VISSZAFELÉ KOMPATIBILITÁS

   A `G.res` és a `G.ai` több mint kilencven helyen szerepel a kódban. Ha
   ezeket kicserélnénk, egyetlen kihagyott hely csendes hibát okozna a
   szimulációban — hálózati játékban pedig szétcsúszást. Ezért nem
   cseréljük ki őket, hanem ABLAKOT nyitunk rajtuk az új táblára:

     G.res  →  a helyi játékos készlete
     G.ai   →  az első bot bejegyzése
     G.age  →  a helyi játékos korszaka

   Ha nincs tábla (menü, betöltés közben), a régi mezők állnak helyt.
   ----------------------------------------------------------------------- */
(function oldalAblakok(){
  if(typeof G === 'undefined' || !Object.defineProperty) return;

  const tartalek = { res:G.res, age:G.age, ai:null, doct:G.doct, upg:G.upg };

  Object.defineProperty(G, 'res', {
    configurable:true, enumerable:true,
    get(){ const o = oldal(G.enId||0); return o ? o.res : tartalek.res; },
    set(v){ const o = oldal(G.enId||0); if(o) o.res = v; else tartalek.res = v; }
  });
  Object.defineProperty(G, 'age', {
    configurable:true, enumerable:true,
    get(){ const o = oldal(G.enId||0); return o ? o.age : tartalek.age; },
    set(v){ const o = oldal(G.enId||0); if(o) o.age = v; else tartalek.age = v; }
  });
  /* A G.doct és a G.upg ugyanúgy a helyi fél bejegyzésére mutat, mint a
     G.res. Enélkül a hálózati játékos ideológiái és fejlesztései a 0-s
     félhez tartoztak volna, akkor is, ha ő a 2. fél. */
  Object.defineProperty(G, 'doct', {
    configurable:true, enumerable:true,
    get(){ const o = oldal(G.enId||0); return o ? (o.doct || (o.doct={})) : (tartalek.doct || (tartalek.doct={})); },
    set(v){ const o = oldal(G.enId||0); if(o) o.doct = v || {}; else tartalek.doct = v || {}; }
  });
  Object.defineProperty(G, 'upg', {
    configurable:true, enumerable:true,
    get(){ const o = oldal(G.enId||0); return o ? (o.upg || (o.upg={})) : (tartalek.upg || (tartalek.upg={})); },
    set(v){ const o = oldal(G.enId||0); if(o) o.upg = v || {}; else tartalek.upg = v || {}; }
  });
  Object.defineProperty(G, 'ai', {
    configurable:true, enumerable:true,
    get(){ const b = botOldalak(); return b.length ? b[0] : tartalek.ai; },
    set(v){
      /* A mentés visszatöltése még a régi alakot adja vissza. Ilyenkor a
         kapott értéket az első bot bejegyzésére írjuk rá. */
      const b = botOldalak();
      if(b.length && v && typeof v === 'object') Object.assign(b[0], v);
      else tartalek.ai = v;
    }
  });
})();
