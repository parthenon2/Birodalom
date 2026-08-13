/* =======================================================================
   29/G. SZOBA — több fél egy térképen

   Itt áll össze a felállás, mielőtt a világ létrejön. Az eredmény egyetlen
   tömb, a `G.oldalTerv`, amit a newGame átad az oldalak táblájának.

   A képernyő már a hálózati játékra van szabva, csak a forrás más:

     helyben   — a 0. hely te vagy, a többi bot
     hálózaton — minden becsatlakozó egy embert foglal el (később)

   Ezért a hely bejegyzése ugyanaz mindkét esetben: típus, név, nemzet,
   csapat. A „kész” jelzés helyben mindig igaz — hálózaton majd a társak
   visszajelzése állítja.
   ===================================================================== */

/* A szoba állapota. Nem a G-ben él, mert a világhoz semmi köze: amíg a
   játszma el nem indul, ez csak egy űrlap. */
let SZOBA = null;

function szobaAlap(){
  for(const k in SZOBA_VALASZT) delete SZOBA_VALASZT[k];
  for(const k in SZOBA_CSAPAT) delete SZOBA_CSAPAT[k];
  for(const k in SZOBA_KESZ) delete SZOBA_KESZ[k];
  return {
    helyek: [
      { tipus:'ember', nev:'', nemzet:'hu', csapat:1, helyi:true, kesz:true },
      { tipus:'bot',   nev:'', nemzet:'',   csapat:2, kesz:true }
    ],
    diff: (typeof G!=='undefined' && G.diff!==undefined) ? G.diff : 1,
    era:  (typeof G!=='undefined' && G.startAge) ? G.startAge : 0,
    map:  (typeof G!=='undefined' && G.mapPick) ? G.mapPick : 'random',
    kaloz: false
  };
}

function szobaEmberDb(){ return SZOBA.helyek.filter(h=>h.tipus==='ember').length; }
function szobaBotDb(){   return SZOBA.helyek.filter(h=>h.tipus==='bot').length; }

/* Csapatba osztva? Ha mindenki külön számot visel, az a „mindenki
   mindenki ellen” — ilyenkor nincs mit jelölni a listában. */
function szobaVanCsapat(){
  const sz = {};
  for(const h of SZOBA.helyek) sz[h.csapat] = (sz[h.csapat]||0)+1;
  for(const k in sz) if(sz[k] > 1) return true;
  return false;
}

/* --- a helyek listája --- */
function szobaLista(){
  if(!SZOBA) SZOBA = szobaAlap();
  const box = $('szobaLista');
  if(!box || !box.appendChild) return;
  box.innerHTML = '';

  /* Választható nemzetek. Rendes játszmában a valódi nemzetek; KALÓZMÓDBAN
     viszont épp a fordítottja: ott a kalózfrakciók lépnek fel, a
     birodalmak nem. A kettő keverése értelmetlen lenne — a kalózvilág
     szigeteken játszódik, más gazdasággal és más egységekkel. */
  const kaloz = !!(SZOBA && SZOBA.kaloz);
  const nemzetek = kaloz
    ? Object.keys(NATIONS).filter(k => (NATIONS[k].pirate || k === 'nat') && !NATIONS[k].keszul)
    : Object.keys(NATIONS).filter(k => !NATIONS[k].hidden && !NATIONS[k].keszul);

  SZOBA.helyek.forEach((h, i) => {
    const sor = document.createElement('div');
    sor.className = 'szobaSor';

    // csapatszín — ugyanaz, amit a térképen kap
    const pont = document.createElement('i');
    pont.className = 'szobaSzin';
    pont.style.background = (typeof szinOf==='function') ? szinOf(i).szin : '#888';
    sor.appendChild(pont);

    // ki ül itt
    const nev = document.createElement('span');
    nev.className = 'szobaNev';
    /* Mindenkinél a VALÓDI neve áll — a sajátodnál is, „(te)” jelöléssel.
       Korábban a saját sorod csak annyit mondott: „Te”, a többieké pedig
       „Vendég” volt, mert a nevet nem kérdeztük meg senkitől. */
    nev.textContent = (h.tipus === 'ember')
      ? ((h.nev || T('szVarakozik')) + (h.helyi ? ' (' + T('szTeUtan') + ')' : ''))
      : (T('szBot') + ' ' + i);
    sor.appendChild(nev);

    // nemzet
    const nsel = document.createElement('select');
    nsel.className = 'szobaSel';
    const veletlen = document.createElement('option');
    veletlen.value = ''; veletlen.textContent = T('szVeletlen');
    nsel.appendChild(veletlen);
    for(const k of nemzetek){
      const o = document.createElement('option');
      o.value = k; o.textContent = NATIONS[k].name;
      if(h.nemzet === k) o.selected = true;
      nsel.appendChild(o);
    }
    /* A helyi játékos nemzete nem lehet „véletlen”: a bemutatkozó kártya,
       a hadjárat és a nemzeti előny is konkrét népet kíván. */
    if(h.helyi) nsel.removeChild(veletlen);
    nsel.onchange = () => {
      h.nemzet = nsel.value;
      /* A választást szétküldjük, hogy a házigazda terve is ezzel
         készüljön el — és hogy a többiek lássák, ki mit visz. */
      if(szobaHalozati() && h.hely !== undefined && typeof netKuld === 'function')
        netKuld({ t:'szoba-valaszt', hely:h.hely, nemzet:h.nemzet });
      szobaLista();
    };
    /* MINDENKI a SAJÁT nemzetét választja. A házigazda ezen felül a
       botokét is — az ő terve utazik, tehát nála kell eldőlnie.

       Korábban a vendégeknél az egész lista tiltva volt, és a tervbe a
       házigazdánál beállított (vagy hiányában magyar) nemzet került:
       így két játékos ugyanazzal a néppel indult. */
    const enyemE = h.helyi || (!szobaHalozati() && h.tipus === 'bot')
                   || (szobaHazigazda() && h.tipus === 'bot');
    if(!enyemE) nsel.disabled = true;
    sor.appendChild(nsel);

    // csapat
    const csel = document.createElement('select');
    csel.className = 'szobaSel szobaCsapat';
    for(let c = 1; c <= MAX_OLDAL; c++){
      const o = document.createElement('option');
      o.value = c; o.textContent = T('szCsapat') + ' ' + c;
      if(h.csapat === c) o.selected = true;
      csel.appendChild(o);
    }
    csel.onchange = () => {
      h.csapat = +csel.value;
      /* A csapatválasztás is UTAZIK. Régen csak a házigazda állíthatta,
         és a vendégek nem tudták eldönteni, kivel szövetkeznek — pedig
         épp ez a szoba lényege. */
      if(szobaHalozati() && h.hely !== undefined && typeof netKuld === 'function')
        netKuld({ t:'szoba-valaszt', hely:h.hely, nemzet:h.nemzet, csapat:h.csapat });
      szobaLista();
    };
    /* MINDENKI a SAJÁT csapatát választja; a házigazda a botokét is. */
    const csapatEnyem = h.helyi || (!szobaHalozati() && h.tipus === 'bot')
                        || (szobaHazigazda() && h.tipus === 'bot');
    if(!csapatEnyem) csel.disabled = true;
    sor.appendChild(csel);

    /* --- KÉSZENLÉT ---
       Csak emberi résztvevőnél és csak hálózaton van értelme: a botok
       mindig készen állnak, egyszemélyes csatában pedig nincs kire várni.

       A saját soromban GOMB (át tudom kapcsolni), a többiekében jelzés. */
    if(szobaHalozati() && h.tipus === 'ember'){
      const kesz = !!h.kesz;
      if(h.helyi){
        const kg = document.createElement('button');
        kg.className = 'szobaKesz' + (kesz ? ' on' : '');
        kg.textContent = kesz ? T('szKeszVagyok') : T('szMegNem');
        kg.onclick = () => {
          h.kesz = !h.kesz;
          if(typeof netKuld === 'function')
            netKuld({ t:'szoba-kesz', hely:h.hely, kesz:h.kesz });
          szobaLista(); szobaBeallitasok();
          SFX.init(); SFX.play('click');
        };
        sor.appendChild(kg);
      }else{
        const jel = document.createElement('i');
        jel.className = 'szobaKeszJel' + (kesz ? ' on' : '');
        jel.title = kesz ? T('szKeszVagyok') : T('szMegNem');
        sor.appendChild(jel);
      }
    }

    // eltávolítás — a helyi játékos helye nem szüntethető meg
    const x = document.createElement('button');
    x.className = 'szobaX';
    x.textContent = '×';
    x.title = T('szElvesz');
    if(h.helyi || SZOBA.helyek.length <= 2 || !szobaHazigazda()){ x.disabled = true; x.style.opacity = '.25'; }
    else x.onclick = () => { SZOBA.helyek.splice(i,1); szobaLista(); SFX.init(); SFX.play('click'); };
    sor.appendChild(x);

    box.appendChild(sor);
  });

  // fejléc: hány hely, és mennyi fér még
  const db = $('szobaDb');
  if(db) db.textContent = SZOBA.helyek.length + '/' + MAX_OLDAL
    + '  ·  ' + szobaEmberDb() + ' ' + T('szEmber')
    + '  ·  ' + szobaBotDb() + ' ' + T('szBotok');

  // a bot gombja kiszürkül, ha betelt a keret
  const bg = $('szobaBot');
  if(bg){
    const tele = szobaBotDb() >= MAX_BOT || SZOBA.helyek.length >= MAX_OLDAL
                 || !szobaHazigazda();
    bg.disabled = tele;
    bg.style.opacity = tele ? '.4' : '';
  }

  /* Hálózaton a szobakódot mindig lássuk: ezt kell bediktálni a
     többieknek. A Kezdés csak a házigazdáé — a vendégek nála látják, hogy
     rá várnak. */
  const kodEl = $('szobaKod');
  if(kodEl){
    if(szobaHalozati() && G.net && G.net.kod){
      kodEl.style.display = '';
      /* A kód mellé MEGHÍVÓ gomb. A hosszú alagútcímet senki nem tudja
         hibátlanul lediktálni telefonon — a vágólapról viszont bármelyik
         üzenetküldőbe beilleszthető, a másik oldalon pedig egyetlen
         mezőbe. A DOM-ból építjük, nem HTML-szövegből: a cím a
         szerverről jön, és nem akarjuk értelmeztetni. */
      kodEl.innerHTML = '';
      const cimke = document.createElement('b');
      cimke.textContent = T('szKod');
      const ertek = document.createTextNode(' ' + G.net.kod + '  ');
      kodEl.appendChild(cimke); kodEl.appendChild(ertek);

      const gomb = document.createElement('button');
      gomb.className = 'mbtn szMeghivoGomb';
      gomb.textContent = T('szMeghivo');
      gomb.onclick = () => {
        /* A MEGHÍVÓBA a kifelé használható cím kerül. PeerJS módban
           csak a 4 betűs kód kell — nincs IP, nincs hosszú URL.
           WS módban az alagút vagy a helyi hálózati cím kell. */
        const n = G.net;
        const peerMod = n && n.mod2 === 'peer';
        const cim = peerMod ? '' : (G.netMeghivoCim
          || ((typeof netCimOlvas === 'function') ? netCimOlvas() : ''));
        const sz = peerMod
          ? (G.net.kod || '')
          : ((typeof meghivoSzoveg === 'function')
              ? meghivoSzoveg(cim || (G.net && G.net.cim) || '', G.net.kod)
              : G.net.kod);
        /* Két úton próbáljuk: a mai vágólap-felület, és a régi kijelölős
           módszer annak, ahol az nem érhető el (fájlból megnyitott lap
           esetén a böngészők egy része letiltja). */
        let siker = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sz); siker = true;
          }
        } catch (e) {}
        if (!siker) {
          try {
            const t = document.createElement('textarea');
            t.value = sz; t.style.position = 'fixed'; t.style.opacity = '0';
            document.body.appendChild(t); t.select();
            siker = document.execCommand('copy');
            document.body.removeChild(t);
          } catch (e) {}
        }
        toast(siker ? T('szMeghivoKesz') : sz);   // ha nem megy, legalább mutatjuk
        SFX.play('click');
      };
      kodEl.appendChild(gomb);
    }else kodEl.style.display = 'none';
  }
  const st = $('szobaStart');
  if(st){
    /* A gombon LÁTSZIK, kire várunk. Hálózaton addig nem indítható a
       játszma, amíg valaki nem nyomta meg a készenlétet — enélkül a
       házigazda elindíthatná úgy, hogy a többiek még nemzetet sem
       választottak, és a világ az ő fejük fölött jönne létre. */
    const emberek = SZOBA.helyek.filter(h => h.tipus === 'ember');
    const keszek = emberek.filter(h => h.kesz).length;
    const mind = keszek === emberek.length;
    const halo = szobaHalozati();
    const indithat = szobaHazigazda() && (!halo || mind);
    st.disabled = !indithat;
    st.style.opacity = indithat ? '' : '.45';
    if(!szobaHazigazda()) st.textContent = T('szVarHazigazda');
    else if(halo && !mind) st.textContent = T('szVarKeszre') + '  ' + keszek + '/' + emberek.length;
    else st.textContent = T('kezdes');
  }
}

/* --- a nehézség, a korszak és a táj --- */
function szobaBeallitasok(){
  if(!SZOBA) SZOBA = szobaAlap();

  /* --- KI ÁLLÍTHAT A JÁTSZMÁN? ---
     Hálózaton CSAK A HÁZIGAZDA. A mód, a nehézség, a korszak és a táj az
     ő tervében utazik — ha a vendég átállítja magánál, az nem jut el
     senkihez, csak félreértést szül: azt hiszi, nehéz pályán játszik,
     közben a házigazdáé indul.

     A vendégnek marad, ami tényleg az övé: a saját nemzete, a saját
     csapata és a készenléte. */
  const csakNezo = szobaHalozati() && !szobaHazigazda();
  const zarol = (elem) => {
    if(!elem) return;
    for(const b of elem.querySelectorAll('button')) b.disabled = csakNezo;
    for(const sel of elem.querySelectorAll('select')) sel.disabled = csakNezo;
    elem.style.opacity = csakNezo ? '.45' : '';
    elem.title = csakNezo ? T('szCsakHazigazdaAllit') : '';
  };

  /* --- MÓDVÁLASZTÓ ---
     Két világ: a birodalmak négy korszaka, és a kalózvilág. Nem
     árnyalatnyi különbség — más a térkép, más a gazdaság, más az
     egységek. Ezért a váltás átállítja a nemzeteket is: a birodalmakat
     kalózfrakciókra, és fordítva.

     A korszakválasztó kalózmódban értelmetlen (ott nincs korszakváltás),
     ezért olyankor elrejtjük. */
  /* A kalózvilág hálózaton is választható.

     Hat szétcsúszási okot kellett megjavítani hozzá, és MIND ugyanaz a
     fajta volt: a kód abból indult ki, hogy egy játékos van, és az a
     helyi. A hatodik volt a legrejtettebb — a hálózati indítás
     kalózmódban a hadjárat 0. küldetését töltötte be, a küldetéslista
     pedig a helyi nemzethez tartozik. Részletek: VALTOZASOK.md, v9.3. */
  const mbox = $('szobaMod');
  if(mbox && mbox.appendChild){
    mbox.innerHTML = '';
    [[false,'szModBirodalom'],[true,'szModKaloz']].forEach(([ertek,kulcs]) => {
      const b = document.createElement('button');
      b.textContent = T(kulcs);
      if(!!SZOBA.kaloz === ertek) b.classList.add('on');
      b.onclick = () => {
        if(!!SZOBA.kaloz === ertek) return;
        SZOBA.kaloz = ertek;
        /* A nemzeteket át kell állítani: a régi választás a másik
           világban nem létezik. Mindenki kap egy érvényeset. */
        const jok = ertek
          ? Object.keys(NATIONS).filter(k => (NATIONS[k].pirate || k === 'nat') && !NATIONS[k].keszul)
          : Object.keys(NATIONS).filter(k => !NATIONS[k].hidden && !NATIONS[k].keszul);
        SZOBA.helyek.forEach((h, i) => {
          if(!h.nemzet || jok.indexOf(h.nemzet) < 0)
            h.nemzet = h.tipus === 'ember' ? jok[i % jok.length] : '';
        });
        szobaLista(); szobaBeallitasok();
        SFX.init(); SFX.play('click');
      };
      mbox.appendChild(b);
    });
  }
  /* Kalózvilágban nincs korszak: a szigetek ideje egyetlen kor. */
  const eraCim = document.querySelector('[data-t="szKorszak"]');
  if(eraCim && eraCim.style) eraCim.style.display = SZOBA.kaloz ? 'none' : '';

  const dbox = $('szobaDiff');
  if(dbox && dbox.appendChild){
    dbox.innerHTML = '';
    DIFF.forEach((d, i) => {
      const b = document.createElement('button');
      b.textContent = (typeof nehezNev==='function') ? nehezNev(i, d.name) : d.name;
      if(SZOBA.diff === i) b.classList.add('on');
      b.onclick = () => { SZOBA.diff = i; szobaBeallitasok(); SFX.init(); SFX.play('click'); };
      dbox.appendChild(b);
    });
  }
  const ebox = $('szobaEra');
  if(ebox && ebox.style) ebox.style.display = SZOBA.kaloz ? 'none' : '';
  if(ebox && ebox.appendChild){
    ebox.innerHTML = '';
    AGES.forEach((a, i) => {
      const b = document.createElement('button');
      b.textContent = (typeof korszakNev==='function') ? korszakNev(i) : a.name;
      if(SZOBA.era === i) b.classList.add('on');
      b.onclick = () => { SZOBA.era = i; szobaBeallitasok(); SFX.init(); SFX.play('click'); };
      ebox.appendChild(b);
    });
  }
  const msel = $('szobaMap');
  if(msel && msel.appendChild){
    msel.innerHTML = '';
    const lista = [{ key:'random', name:(typeof tajNev==='function') ? tajNev('random','Véletlen') : 'Véletlen' }]
      .concat(MAPS.filter(m => !m.hidden).map(m => ({ key:m.key, name:(typeof tajNev==='function') ? tajNev(m.key, m.name) : m.name })));
    for(const m of lista){
      const o = document.createElement('option');
      o.value = m.key; o.textContent = m.name;
      if(SZOBA.map === m.key) o.selected = true;
      msel.appendChild(o);
    }
    msel.onchange = () => { SZOBA.map = msel.value; };
  }

  /* A ZÁROLÁS a felépítés UTÁN fut: a gombokat előbb létre kell hozni,
     különben nincs mit letiltani. (Első nekifutásra a függvény elejére
     tettem, és a vendégnél mind a négy beállító nyitva maradt.) */
  zarol($('szobaMod'));
  zarol($('szobaDiff'));
  zarol($('szobaEra'));
  const mapDoboz = $('szobaMap');
  if(mapDoboz){
    mapDoboz.disabled = csakNezo;
    mapDoboz.style.opacity = csakNezo ? '.45' : '';
    mapDoboz.title = csakNezo ? T('szCsakHazigazdaAllit') : '';
  }
}

/* -----------------------------------------------------------------------
   HÁLÓZAT

   A szoba két üzemmódban dolgozik:

     helyi     — te és a botok, a Kezdés azonnal indít
     hálózati  — a szerver névsora tölti fel az ember helyeket

   Hálózaton a HÁZIGAZDA rendezi a felállást (nemzet, csapat, bot), és a
   Kezdés az egész tervet szétküldi. A vendégek csak nézik, amíg a
   házigazda össze nem rakja — így nem lehet vita arról, ki melyik helyen
   ül.
   ----------------------------------------------------------------------- */
function szobaHalozati(){ return !!(G.net&&G.net.allapot&&G.net.allapot!=='ki'); }
function szobaHazigazda(){ return !szobaHalozati() || !!(G.net&&G.net.hazigazda); }

/* A szerver névsorából felépítjük az ember helyeket. A botok a
   házigazda beállításai szerint maradnak a lista végén. */
/* Egy társ nemzetválasztása. A szerver a feladó helyszámát is beleírja,
   de a biztonság kedvéért az üzenetben küldött helyet használjuk. */
/* A beérkezett választásokat KÜLÖN is eltesszük, helyszám szerint.

   Miért? Mert az üzenet megelőzheti a szobalistát: a vendég azonnal
   bejelenti a nemzetét, a házigazdánál viszont csak akkor épül fel a
   lista, amikor megnyitja a szobaképernyőt. Addig a `SZOBA.helyek` még az
   alapállás — nincs benne `hely` mező —, tehát a keresés nem talál
   semmit, és a választás elveszik. A tervbe így a hiányzó nemzet helyett
   magyar került: a francia játékos Hunyadi Mátyással indult. */
const SZOBA_VALASZT = {};
/* A csapat- és készenlét-választás félretéve, ugyanazon okból, mint a
   nemzeté: megérkezhet MIELŐTT a névsor felépülne. */
const SZOBA_CSAPAT = {};
const SZOBA_KESZ = {};
function szobaKeszVett(hely, kesz){
  if(hely === undefined) return;
  SZOBA_KESZ[hely] = !!kesz;
  if(!SZOBA) return;
  for(const h of SZOBA.helyek) if(h.hely === hely) h.kesz = !!kesz;
  szobaLista(); szobaBeallitasok();
}

function szobaValasztVett(hely, nemzet, csapat){
  if(hely === undefined || hely === null) return;
  SZOBA_VALASZT[hely] = nemzet || '';
  if(csapat !== undefined && isFinite(csapat)) SZOBA_CSAPAT[hely] = +csapat;
  if(!SZOBA) return;                       // majd a lista felépítésekor érvényesül
  for(const h of SZOBA.helyek)
    if(h.tipus === 'ember' && h.hely === hely){
      h.nemzet = nemzet || '';
      if(csapat !== undefined && isFinite(csapat)) h.csapat = +csapat;
      break;
    }
  if(document.getElementById('szobaLista')) szobaLista();
}

function szobaHalozat(n){
  if(!SZOBA) SZOBA = szobaAlap();
  const nevsor = (n && n.jatekosok) ? n.jatekosok.slice().sort((a,b)=>a.hely-b.hely) : [];
  const botok = SZOBA.helyek.filter(h => h.tipus === 'bot');
  const ujak = [];
  for(const j of nevsor){
    /* Ha ez a hely már szerepelt, megtartjuk a nemzetét és a csapatát —
       különben minden becsatlakozáskor visszaugrana az alapértékre. */
    const regi = SZOBA.helyek.filter(h => h.tipus === 'ember' && h.hely === j.hely)[0];
    /* Az új ember a legkisebb SZABAD csapatszámot kapja — a már felvett
       botokét is beleértve. Enélkül a második becsatlakozó ugyanabba a
       csapatba került, mint az első bot, és véletlenül szövetségesek
       lettek. */
    let cs = regi ? regi.csapat : 1;
    if(!regi){
      const foglalt = ujak.map(x => x.csapat).concat(botok.map(x => x.csapat));
      while(foglalt.indexOf(cs) >= 0) cs++;
    }
    /* A félretett választás erősebb, mint a korábbi listaállapot: az a
       játékos legutóbbi akarata. */
    const bejelentett = SZOBA_VALASZT[j.hely];
    /* A félretett CSAPAT is erősebb a listaállapotnál — ugyanazért, mint
       a nemzet: az a játékos legutóbbi akarata. */
    if(SZOBA_CSAPAT[j.hely] !== undefined) cs = SZOBA_CSAPAT[j.hely];
    ujak.push({ tipus:'ember', hely:j.hely, nev:j.nev,
                nemzet: (bejelentett !== undefined) ? bejelentett : (regi ? regi.nemzet : ''),
                csapat: cs,
                helyi: (j.hely === n.hely),
                /* A HÁZIGAZDA magától kész — ő indít. A vendégek nyomják meg. */
                kesz: (SZOBA_KESZ[j.hely] !== undefined) ? SZOBA_KESZ[j.hely]
                      : (j.hely === 0 ? true : (regi ? !!regi.kesz : false)) });
  }
  /* A helyi játékos nemzete nem lehet üres. */
  for(const h of ujak) if(h.helyi && !h.nemzet) h.nemzet = G.nation || 'hu';
  SZOBA.helyek = ujak.concat(botok);
  szobaLista();
  /* A saját nemzetünket rögtön bejelentjük, hogy a házigazda terve már
     ezzel készüljön — akkor is, ha nem nyúlunk a listához. */
  const enyem = ujak.filter(h => h.helyi)[0];
  if(enyem && typeof netKuld === 'function')
    netKuld({ t:'szoba-valaszt', hely:enyem.hely, nemzet:enyem.nemzet });
}

/* --- indítás --- */
function szobaIndit(){
  if(!SZOBA) return;
  const helyi = SZOBA.helyek.filter(h => h.helyi)[0];
  if(!helyi || !helyi.nemzet){ toast(T('valasszNemzetet')); SFX.play('deny'); return; }

  /* Hálózaton a kalózvilág egyelőre nem indítható (lásd a módválasztónál). */
  const beall = { nehez:SZOBA.diff, era:SZOBA.era, map:SZOBA.map,
                  kaloz: !!SZOBA.kaloz };

  /* --- Hálózati játszma ---
     A sorrend KÖTÖTT: a helyszám adja, mert a szerver is azt írja minden
     csomagba, és a lépészár is a helyszám szerint hajtja végre a
     parancsokat. A terv jelöletlenül utazik — a `helyi` mezőt mindenki a
     SAJÁT helyszáma alapján állítja be, a netJatekIndit-ben. */
  if(szobaHalozati()){
    if(!szobaHazigazda()){ toast(T('szCsakHazigazda')); SFX.play('deny'); return; }
    /* Az ember helyeket a SZERVER névsorából vesszük, nem a lista
       pillanatnyi állapotából: az a hiteles forrás. Ha a szobaképernyő
       valamiért még nem frissült, a listából hiányzó játékos helye
       kimaradna a tervből — és ő indulás után egy BOT helyére ülne. Innen
       jött a „mindenki ugyanazt a nemzetet irányítja” és a fekete térkép.

       A helyszámot BELETESSZÜK a tervbe. Enélkül a párosítás sorszám
       szerint menne, a helyszámok viszont nem feltétlenül folytonosak:
       ha valaki kilépett a szobából és más lépett be, lehet 0 és 2 —
       ilyenkor a sorszámos párosítás mindenkit elcsúsztat. */
    const nevsor = (G.net.jatekosok || []).slice().sort((a,b) => a.hely - b.hely);
    const terv = [];
    for(const j of nevsor){
      const sor = SZOBA.helyek.filter(x => x.tipus === 'ember' && x.hely === j.hely)[0] || {};
      /* Sorrend: amit a listában látunk, aztán a bejelentett választás,
         végül a magyar mint végszükség. */
      const nemzet = sor.nemzet || SZOBA_VALASZT[j.hely] || 'hu';
      terv.push({ tipus:'ember', hely:j.hely, nev:j.nev,
                  nemzet:nemzet, csapat:sor.csapat || (j.hely + 1) });
    }
    if(!terv.length){ toast(T('szNincsJatekos')); SFX.play('deny'); return; }
    for(const h of SZOBA.helyek.filter(x => x.tipus === 'bot')){
      const be = { tipus:'bot', csapat:h.csapat };
      if(h.nemzet) be.nemzet = h.nemzet;
      terv.push(be);
    }
    const mag = (Date.now() ^ (Math.random() * 0xFFFFFFFF)) >>> 0;
    netKuld({ t:'indulas', mag, terv, beall });
    netJatekIndit(mag, terv, beall, true);
    return;
  }

  /* --- Helyi játszma ---
     A helyi játékos áll elöl, hogy a G.res és a kijelölés a megszokott
     helyre mutasson. Előtte minden hálózati maradványt eldobunk. */
  if(typeof netTisztaLap === 'function') netTisztaLap();
  const terv = [];
  terv.push({ tipus:'ember', helyi:true, nev:helyi.nev, nemzet:helyi.nemzet, csapat:helyi.csapat });
  for(const h of SZOBA.helyek){
    if(h.helyi) continue;
    /* Üres nemzet = sorsolt. Ilyenkor nem adunk át nemzetet, és a világ
       létrehozása választ olyat, ami elüt a többiekétől. */
    const be = { tipus:h.tipus, nev:h.nev, csapat:h.csapat };
    if(h.nemzet) be.nemzet = h.nemzet;
    terv.push(be);
  }
  G.oldalTerv = terv;
  G.diff = SZOBA.diff;
  G.startAge = SZOBA.era;
  G.mapPick = SZOBA.map;
  G.pirate = false;
  G.simMag = 0;                       // új mag sorsolódik

  SFX.init(); SFX.play('age'); MUSIC.start();
  $('menu').style.display = 'none';
  if(typeof langBoxShow === 'function') langBoxShow(false);
  newGame(helyi.nemzet, -1);
  /* Csatában nincs bemutatkozó kártya és nincs ideológiaválasztás: a
     felállás már itt eldőlt, ne tartsuk fel a játékost még egyszer. */
  if(typeof syncUI === 'function') syncUI();
}

/* --- megnyitás --- */
function szobaNyit(){
  if(!SZOBA) SZOBA = szobaAlap();
  /* A helyi játékos nemzete alapból az, amit legutóbb választottál az Új
     játékban — így nem kell mindig újra megkeresni. */
  const helyi = SZOBA.helyek.filter(h => h.helyi)[0];
  if(helyi && !helyi.nemzet) helyi.nemzet = G.nation || 'hu';
  szobaLista();
  szobaBeallitasok();
}

function szobaBotAd(){
  if(!SZOBA) SZOBA = szobaAlap();
  if(szobaBotDb() >= MAX_BOT || SZOBA.helyek.length >= MAX_OLDAL){
    toast(T('szBotTele')); SFX.play('deny'); return;
  }
  /* Az új bot a legkisebb szabad csapatszámot kapja, hogy alapból
     mindenki mindenki ellen álljon. */
  const foglalt = SZOBA.helyek.map(h => h.csapat);
  let cs = 1; while(foglalt.indexOf(cs) >= 0) cs++;
  SZOBA.helyek.push({ tipus:'bot', nev:'', nemzet:'', csapat:cs, kesz:true });
  szobaLista();
  SFX.init(); SFX.play('click');
}
