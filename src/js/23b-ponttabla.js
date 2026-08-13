/* =======================================================================
   23/B. PONTTÁBLA ÉS KIESÉS

   Kettőnél több félnél nem elég a „te és az ellenség” kép: tudni kell, ki
   él még, ki a szövetséges, és ki esett ki. A tábla a képernyő jobb
   felső sarkában áll, és összecsukható — csata közben ne foglaljon
   helyet.

   A kiesést NEM itt döntjük el véglegesen: az `oldalElo()` a mérce
   (nincs se főhadiszállása, se kaszárnyája, se munkása), ugyanaz, amit a
   vereség is használ. Itt csak kihirdetjük és kijelezzük.
   ===================================================================== */

let PT_ZART = false;
let ptSig = '';                    // az utoljára kirajzolt állapot ujjlenyomata

/* Egy fél megnevezése a táblán. A saját sorod „Te”, a többieké a
   játékos neve, ha van; egyébként a nemzet neve. */
function ptNev(o){
  /* A sajátodnál is a NEVED áll, ha megadtad — hálózati játszmában így
     mindenki ugyanazt a névsort látja, csak más sor van kiemelve. Név
     nélkül (helyi csatában) marad a „Te”. A nemzetnév fordítva jön. */
  if(o.i === helyiFel()) return o.nev || T('szTe');
  if(o.tipus === 'ures') return (o.nev || nemzetNev(nationOf(o.i)));
  if(o.tipus === 'ember') return o.nev || (T('szEmber') + ' ' + (o.i + 1));
  return nemzetNev(nationOf(o.i)) || (T('szBot') + ' ' + o.i);
}

function pontTablaFrissit(){
  const doboz = $('pontTabla');
  if(!doboz || !doboz.classList) return;
  /* Két félnél a régi kép marad: ott a tábla csak zavarna. */
  const kell = G.on && typeof oldalDb === 'function' && oldalDb() > 2;
  doboz.classList.toggle('on', !!kell);
  if(!kell) return;
  doboz.classList.toggle('zart', PT_ZART);

  /* Ujjlenyomat: csak akkor rajzolunk újra, ha tényleg változott valami.
     A tábla másodpercenként hatvanszor frissülne egyébként. */
  let sig = LANG + '|' + PT_ZART + '|';
  const adat = [];
  for(const o of G.oldalak){
    const ep = G.builds.filter(b => !b.dead && b.owner === o.i).length;
    const eg = G.units.filter(u => !u.dead && u.owner === o.i).length;
    adat.push({ o, ep, eg, elo: !o.kiesett });
    sig += o.i + ':' + ep + ':' + eg + ':' + (o.kiesett ? 'x' : '-')
        + ':' + (szovetseges(helyiFel(), o.i) ? 'sz' : 'e') + ';';
  }
  const n = G.net;
  if(n && n.allapot === 'jatek') sig += 'net' + n.kod + (n.jatekosok || []).length;
  /* A felmondás visszaszámlálása másodpercenként változik — ezt bele kell
     venni az ujjlenyomatba, különben a gombon állna a szám. */
  if(G.dipl && G.dipl.felmondas)
    for(const k in G.dipl.felmondas) sig += 'f' + k + Math.ceil(G.dipl.felmondas[k]);
  if(sig === ptSig) return;
  ptSig = sig;

  const sorok = $('ptSorok');
  if(sorok && sorok.appendChild){
    sorok.innerHTML = '';
    for(const a of adat){
      const sor = document.createElement('div');
      sor.className = 'ptSor'
        + (a.o.i === helyiFel() ? ' enyem' : '')
        + (szovetsegesFel(a.o.i) ? ' tars' : '')
        + (a.elo ? '' : ' kiesett');
      const szin = document.createElement('i');
      szin.className = 'ptSzin';
      szin.style.background = szinOf(a.o.i).szin;
      const nev = document.createElement('span');
      nev.className = 'ptNev';
      nev.textContent = ptNev(a.o);
      const szam = document.createElement('span');
      szam.className = 'ptSzam';
      szam.textContent = a.elo ? (a.ep + ' · ' + a.eg) : T('ptKiesett');
      sor.appendChild(szin); sor.appendChild(nev); sor.appendChild(szam);

      /* --- DIPLOMÁCIA ---
         A ponttáblán látod a többieket, tehát itt a helye a döntésnek is.
         Egyetlen apró gomb soronként: szövetséget ajánl, vagy felmond.

         Csak élő, nem saját félnél; és csak akkor, ha van kivel — egy
         kétfeles játszmában a szövetség értelmetlen (a magányos szövetség
         azonnali döntetlen lenne). */
      const en = helyiFel();
      const elok = G.oldalak.filter(o => !o.kiesett).length;
      if(a.elo && a.o.i !== en && elok > 2 && typeof diplAjanl === 'function'){
        const tars = szovetseges(en, a.o.i);
        const g = document.createElement('button');
        g.className = 'ptDipl' + (tars ? ' bont' : '');
        g.textContent = tars ? T('diplFelmond') : T('diplAjanl');
        /* A felmondás visszaszámlálása is látszik, hogy tudd, mennyi
           időd van kivonni a sereged. */
        if(G.dipl && G.dipl.felmondas){
          const k = diplKulcs(en, a.o.i);
          if(G.dipl.felmondas[k] !== undefined)
            g.textContent = Math.ceil(G.dipl.felmondas[k]) + ' mp';
        }
        g.onclick = (e) => {
          e.stopPropagation();
          if(tars) diplFelmond(a.o.i); else diplAjanl(a.o.i);
          SFX.play('click');
        };
        sor.appendChild(g);
      }
      sorok.appendChild(sor);
    }
  }
  /* Hálózati játszmában a szobakód is itt látszik — így menet közben is
     meg lehet mondani egy társnak, hova csatlakozzon. */
  const kod = $('ptKod');
  if(kod){
    if(n && n.allapot === 'jatek' && n.kod){
      const emberek = G.oldalak.filter(o => o.tipus === 'ember').length;
      kod.style.display = '';
      kod.textContent = T('ptSzoba') + ': ' + n.kod + '  ·  ' + emberek + ' ' + T('ptFo');
    }else{
      kod.style.display = 'none';
      kod.textContent = '';
    }
  }
}

/* --- Kiesés ---
   Másodpercenként egyszer nézzük meg, ki maradt talpon. Ennél sűrűbben
   fölösleges: az `oldalElo` végigjárja az egységeket és az épületeket. */
function kiesesFigyel(dt){
  if(!G.on || !G.oldalak || G.oldalak.length < 3) return;
  G.kiesesT = (G.kiesesT === undefined ? 1 : G.kiesesT) - dt;
  if(G.kiesesT > 0) return;
  G.kiesesT = 1;

  for(const o of G.oldalak){
    if(o.kiesett) continue;
    if(oldalElo(o.i)) continue;
    o.kiesett = true;
    /* A saját kiesésedről a vereségképernyő szól, azt itt nem
       ismételjük meg. */
    if(o.i !== helyiFel()) toast(ptNev(o) + ' ' + T('uzKiesett'));
  }

  /* Győzelem: ha csak a te csapatod maradt talpon. A klasszikus egy az
     egy elleni végkifejletet a régi `checkEnd` intézi, ezt csak
     kettőnél több félnél alkalmazzuk. */
  if(G.over) return;
  const elok = G.oldalak.filter(o => !o.kiesett);
  if(!elok.length) return;
  const enCsapat = oldal(helyiFel()) ? oldal(helyiFel()).csapat : 0;
  const maradtEllen = elok.some(o => o.csapat !== enCsapat);
  const enElek = elok.some(o => o.csapat === enCsapat);
  if(enElek && !maradtEllen && typeof endGame === 'function'){
    /* Az endGame egy argumentumot vár; a saját záró mondatunkat a
       G.gyozelemSzoveg-ben adjuk át, azt a végképernyő olvassa ki. */
    G.gyozelemSzoveg = T('uzCsapatGyoz');
    endGame(true);
  }
}
