/* =======================================================================
   26/C. BILLENTYŰKIOSZTÁS

   A gyorsbillentyűk eddig be voltak égetve a kezelőbe:

     if(k==='h') startPlacing('hq');
     if(k==='k') startPlacing('barracks');

   Ez magyar billentyűzeten kényelmes, de nem mindenkinek: az „y” és a
   „z” helyet cserél a német kiosztáson, a francia AZERTY-n pedig az
   egész bal kéz máshol van. Innentől TÁBLÁZAT dönt, a táblázat pedig a
   beállításokban átírható.

   Mi NEM állítható, és miért:
     Esc, Tab, Enter, szóköz, nyilak — a felület szerkezetéhez tartoznak
     F1, F5, F9, F11, F12       — a böngésző és a rendszer is ismeri őket
     1..9 Shift/Alt kombinációk — a vezérlőcsoportok fix helye

   A választás a böngésző tárolójában marad, tehát a következő indításnál
   is érvényes. Játszmánként nem változik: a billentyű a JÁTÉKOSHOZ
   tartozik, nem a világhoz — hálózati játékban sem küldjük át.
   ===================================================================== */

/* Az akciók sorrendje egyben a beállítások listájának sorrendje is.
   `csoport`: melyik fejezet alá kerül a listában. */
const BILL_AKCIOK = [
  { k:'epHq',      alap:'h',      csoport:'ep',  cimke:'kbEpHq'      },
  { k:'epBarracks',alap:'k',      csoport:'ep',  cimke:'kbEpBarracks'},
  { k:'epFarm',    alap:'f',      csoport:'ep',  cimke:'kbEpFarm'    },
  { k:'epTower',   alap:'t',      csoport:'ep',  cimke:'kbEpTower'   },
  { k:'epWall',    alap:'v',      csoport:'ep',  cimke:'kbEpWall'    },
  { k:'epAcademy', alap:'u',      csoport:'ep',  cimke:'kbEpAcademy' },
  { k:'epTemple',  alap:'m',      csoport:'ep',  cimke:'kbEpTemple'  },
  { k:'epHarbor',  alap:'y',      csoport:'ep',  cimke:'kbEpHarbor'  },

  { k:'allTamado', alap:'1',      csoport:'harc',cimke:'tamado'      },
  { k:'allTartsd', alap:'2',      csoport:'harc',cimke:'tartsd'      },
  { k:'allVissza', alap:'3',      csoport:'harc',cimke:'visszavonul' },
  { k:'alVonal',   alap:'7',      csoport:'harc',cimke:'vonal'       },
  { k:'alEk',      alap:'8',      csoport:'harc',cimke:'ek'          },
  { k:'alNegyszog',alap:'9',      csoport:'harc',cimke:'negyszog'    },

  { k:'megall',    alap:'s',      csoport:'par', cimke:'kbMegall'    },
  { k:'korszak',   alap:'e',      csoport:'par', cimke:'kbKorszak'   },
  { k:'alca',      alap:'á',      csoport:'par', cimke:'kbAlca'      },
  /* A fotómód alapból az F volt — csakhogy az a MAJORSÁG billentyűje is
     (a súgó és az oktatómód is így hirdeti). A régi kezelő a fotómódot
     vizsgálta előbb, és `return`-nel zárt, tehát F-fel SOHA nem lehetett
     majorságot lehelyezni: az oktatómód harmadik lépése azt kérte, hogy
     nyomj F-et, mire a felület eltűnt. A fotómód az O betűre került. */
  { k:'fotomod',   alap:'o',      csoport:'par', cimke:'kbFotomod'   },
  { k:'rombol',    alap:'delete', csoport:'par', cimke:'kbRombol'    },
  { k:'tetlen',    alap:'.',      csoport:'par', cimke:'kbTetlen'    },
  { k:'billKurzor',alap:'c',      csoport:'par', cimke:'kbKurzor'    },
  { k:'szunet',    alap:'p',      csoport:'par', cimke:'kbSzunet'    },
  { k:'zene',      alap:'n',      csoport:'par', cimke:'kbZene'      }
];

/* Az épületgombok az akciókulcsból vezetik le, mit raknak le. */
const BILL_EPULET = { epHq:'hq', epBarracks:'barracks', epFarm:'farm', epTower:'tower',
                      epWall:'wall', epAcademy:'academy', epTemple:'temple', epHarbor:'harbor' };

const BILL_TAR = 'birodalom_bill';

/* A billentyű szöveges alakja. Kisbetűsítve, hogy a Shift ne számítson.
   A hosszú neveket (Delete, ArrowUp) meghagyjuk, azok egyértelműek. */
function billKod(e){
  const k = (e.key || '').toLowerCase();
  if(k === ' ') return 'space';
  return k;
}
/* Ahogy a felületen megjelenik. A magyar ékezetes betűk nagybetűs alakja
   olvashatóbb a gombon, a hosszú neveket viszont rövidítjük. */
function billFelirat(kod){
  if(!kod) return '—';
  const rovid = { delete:'Del', backspace:'⌫', escape:'Esc', space:'␣',
                  arrowup:'↑', arrowdown:'↓', arrowleft:'←', arrowright:'→' };
  if(rovid[kod]) return rovid[kod];
  return kod.length === 1 ? kod.toUpperCase() : kod;
}

/* A tényleges kiosztás: az alapértékek a felhasználó választásaival
   felülírva. Külön függvény, hogy a betöltés sorrendje ne számítson. */
function billKiosztas(){
  if(!G.bill) G.bill = {};
  const ki = {};
  for(const a of BILL_AKCIOK) ki[a.k] = (G.bill[a.k] !== undefined) ? G.bill[a.k] : a.alap;
  return ki;
}
/* Melyik akcióhoz tartozik ez a billentyű? Több is lehet — a „harc”
   csoport számai és az épületek nem ütköznek, mert más helyzetben
   érvényesek —, ezért listát adunk vissza. */
function billAkciok(kod){
  const ki = billKiosztas(), out = [];
  for(const a of BILL_AKCIOK) if(ki[a.k] === kod) out.push(a.k);
  return out;
}
function billE(kod, akcio){
  return billKiosztas()[akcio] === kod;
}

/* --- tárolás --- */
function billBetolt(){
  try{
    const raw = tarolOlvas(BILL_TAR);
    G.bill = raw ? (JSON.parse(raw) || {}) : {};
  }catch(e){ G.bill = {}; }
}
function billMent(){
  try{ tarolIr(BILL_TAR, JSON.stringify(G.bill || {})); }catch(e){}
}
function billAlaphelyzet(){
  G.bill = {};
  billMent();
  if(typeof billLista === 'function') billLista();
  toast(T('billVisszaall'));
}

/* --- a lista a beállításokban --- */
let billVar = null;          // melyik akcióra várunk billentyűt

function billLista(){
  const box = (typeof $ === 'function') ? $('billList') : null;
  if(!box || !box.appendChild) return;
  box.innerHTML = '';
  const ki = billKiosztas();
  let elozoCsoport = null;
  for(const a of BILL_AKCIOK){
    if(a.csoport !== elozoCsoport){
      elozoCsoport = a.csoport;
      const c = document.createElement('div');
      c.className = 'billCsop';
      c.textContent = T('billCsop_' + a.csoport);
      box.appendChild(c);
    }
    const sor = document.createElement('div');
    sor.className = 'billSor';
    const nev = document.createElement('span');
    nev.textContent = T(a.cimke);
    const gomb = document.createElement('button');
    gomb.className = 'billGomb';
    gomb.textContent = (billVar === a.k) ? T('billNyomj') : billFelirat(ki[a.k]);
    if(billVar === a.k) gomb.classList.add('var');
    /* Ütközés: ugyanaz a billentyű két akción. Nem tiltjuk — van, aki
       szándékosan tesz kettőt egy gombra —, de jelezzük. */
    const utkozik = BILL_AKCIOK.filter(x => x !== a && ki[x.k] === ki[a.k]).length > 0;
    if(utkozik) gomb.classList.add('utkozik');
    gomb.onclick = () => {
      billVar = (billVar === a.k) ? null : a.k;
      billLista();
      SFX.init(); SFX.play('click');
    };
    sor.appendChild(nev); sor.appendChild(gomb);
    box.appendChild(sor);
  }
}
/* A várakozó gomb elkapja a következő leütést. Ez a kezelő a rendes
   játékbillentyűk ELŐTT fut (capture szakasz), különben a felvett
   billentyű egyúttal el is sülne. */
function billFelvevo(e){
  if(!billVar) return;
  const kod = billKod(e);
  e.preventDefault(); e.stopPropagation();
  if(kod === 'escape'){ billVar = null; billLista(); return; }   // felvétel elvetve
  /* A szerkezethez tartozó billentyűket nem engedjük elvenni. */
  const tiltott = ['tab','enter','f1','f5','f9','f11','f12','arrowup','arrowdown',
                   'arrowleft','arrowright','space'];
  if(tiltott.indexOf(kod) >= 0){
    toast(T('billFoglalt') + ': ' + billFelirat(kod));
    return;
  }
  G.bill[billVar] = kod;
  billVar = null;
  billMent();
  billLista();
  SFX.play('ready', 0.7);
}
if(typeof addEventListener === 'function')
  addEventListener('keydown', billFelvevo, true);      // capture: mindenki előtt
