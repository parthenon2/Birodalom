#!/usr/bin/env node
/* =======================================================================
   BIRODALOM — összeállító szkript

   A játék forrása modulokra van bontva a src/ mappában, de a kimenet
   továbbra is EGYETLEN, önmagában futtatható index.html. Ez azért fontos,
   mert a böngésző file:// protokollon nem enged ES-modult betölteni, és
   így a fájl duplakattintásra és telefonon is ugyanúgy elindul.

   Használat:  node build.js
   ===================================================================== */
const fs = require('fs');

/* --- ZENE: BELESÜTVE VAGY KÜLÖN FÁJLBAN? ---

   Alapból KÜLÖN: az index.html apró marad (~5 MB), a zene a `zene/`
   mappából töltődik le futás közben, és csak egyszer. Így egy
   frissítés másodpercek kérdése, nem huszonegy megabájté.

   `node build.js --embed` esetén minden a HTML-be kerül: egyetlen,
   önmagában futtatható fájl, ami e-mailben is elküldhető. Ez a régi
   működés — cserébe a fájl 26 MB.

   (A kapcsoló eddig csak a megjegyzésben létezett: a kód sosem
   olvasta be. Most valóban működik.) */
const BEEPIT = process.argv.indexOf('--embed') >= 0;

const path = require('path');

/* A nyitó és záró elemek egyensúlya a felület jelölőjében.

   Egyetlen árva </div> idő előtt lezárja a menüt, és a képernyő üresen
   marad — pontosan ez történt a v3.5.1-ben, amikor a nyelvválasztót
   kiemeltem a menüből. Azóta a fordítás megáll, ha nem stimmel. */
function ellenorizHtml(html){
  const ny=(html.match(/<div\b/g)||[]).length;
  const za=(html.match(/<\/div>/g)||[]).length;
  if(ny!==za){
    console.error('  ✘ HTML EGYENSÚLY: '+ny+' nyitó <div>, '+za+' záró — a felület eltörne!');
    process.exit(1);
  }
  console.log('  html egyensúly: '+ny+' nyitó / '+za+' záró ✔');
  /* A body.html a nyitott <style> elem KÖZEPÉN kezdődik: a head.html a
     <style> nyitótaggal ér véget, a stíluslap utána jön, és a lezáró
     </style> már ebben a fájlban áll. Ezért ami itt a </style> ELÉ kerül,
     azt a böngésző CSS-nek olvassa, nem jelölésnek — az ilyen elem soha
     nem kerül be a DOM-ba. Pontosan ez történt a nyelvválasztóval: a
     gomb és a lista a stíluslap szövegébe esett, így a $('langBtn') üresen
     tért vissza, és a nyelvváltás némán elmaradt. */
  const fej = html.slice(0, html.indexOf('</style>'));
  if(/<(div|button|span|canvas|input|img)\b/i.test(fej)){
    console.error('  ✘ JELÖLÉS A STÍLUSLAPBAN: a body.html elején álló elem a </style> elé esik,');
    console.error('    így a böngésző CSS-ként olvassa, és nem kerül be a DOM-ba.');
    process.exit(1);
  }
  console.log('  jelölés a </style> után ✔');

  /* --- Kattinthatatlan gombok ---
     A #hud réteg átereszti az egeret a vászonhoz (pointer-events:none), és
     csak a .panel osztályú dobozok fogják el. Ha egy gomb olyan dobozba
     kerül, ami egyiket sem kapja meg, LÁTSZIK, de a kattintás átmegy
     rajta a térképre — némán nem történik semmi. Pontosan ez volt a
     fotómód két gombjával. Ez a fajta hiba a programozott kattintással
     dolgozó próbákon átcsúszik, ezért itt fogjuk meg. */
  const css = read('style.css');
  const body = html;
  const peAuto = { id:new Set(), cls:new Set() };
  for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!m[2].replace(/\s/g, '').includes('pointer-events:auto')) continue;
    for (const v of m[1].split(',')) {
      const targy = v.trim().split(/\s+/).pop() || '';        // csak a szabály tárgya
      for (const x of targy.matchAll(/#([\w-]+)/g)) peAuto.id.add(x[1]);
      for (const x of targy.matchAll(/\.([\w-]+)/g)) peAuto.cls.add(x[1]);
    }
  }
  const hudTol = body.indexOf('<div id="hud">');
  if (hudTol >= 0) {
    const verem = [];
    const bajok = [];
    const re = /<(\/?)(\w+)([^>]*)>/g;
    re.lastIndex = hudTol;
    let t;
    while ((t = re.exec(body))) {
      const zaro = t[1] === '/', tag = t[2].toLowerCase(), attr = t[3];
      if (zaro) {
        for (let i = verem.length - 1; i >= 0; i--)
          if (verem[i].tag === tag) { verem.length = i; break; }
        if (!verem.length) break;                       // a #hud lezárult
        continue;
      }
      if (/\/>$/.test(t[0]) || ['br','img','input','hr','meta'].includes(tag)) {
        if (tag !== 'input') continue;
      }
      const azon = (attr.match(/id="([^"]+)"/) || [])[1] || '';
      const oszt = ((attr.match(/class="([^"]+)"/) || [])[1] || '').split(/\s+/);
      const elem = { tag, azon, oszt };
      if (['button','select'].includes(tag) || (tag === 'input' && !/type="(hidden|file)"/.test(attr))) {
        const lanc = verem.concat([elem]);
        const fogja = lanc.some(e =>
          e.oszt.includes('panel') || peAuto.id.has(e.azon) || e.oszt.some(c => peAuto.cls.has(c)));
        if (!fogja) bajok.push(azon || oszt.join('.') || tag);
      }
      if (tag !== 'input') verem.push(elem);
    }
    if (bajok.length) {
      console.error('  ✘ KATTINTHATATLAN GOMB a HUD-ban: ' + bajok.join(', '));
      console.error('    A #hud pointer-events:none — adj a doboznak .panel osztályt');
      console.error('    vagy saját pointer-events:auto szabályt.');
      process.exit(1);
    }
    console.log('  minden HUD-gomb kattintható ✔');
  }
  return html;
}


const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'index.html');

const read = p => fs.readFileSync(path.join(SRC, p), 'utf8');
const order = JSON.parse(read('js/_order.json'));

let js = order.map(f => read('js/' + f)).join('\n');

/* A zenét base64-ként tesszük a kimenetbe. A lejátszó futásidőben Blobbá
   alakítja — így nincs adat-URI méretkorlát, és a fájl önmagában szól. */
/* Uralkodói portrék: ha van kép a kepek/ mappában, azt beépítjük.
   Amelyikhez nincs, ott marad a rajzolt portré. */
/* A nemzetek listáját magából a játékkódból olvassuk ki, hogy új nemzet
   felvételekor ne maradjon le a képe. Korábban itt egy rögzített hetes
   lista állt, és a spanyol arcképek csendben kimaradtak. */
const NEMZETEK = (() => {
  const forras = fs.readFileSync(path.join(__dirname, 'src', 'js', '02-data-nations.js'), 'utf8');
  const resz = forras.slice(forras.indexOf('const NATIONS='));
  const kulcsok = [...resz.matchAll(/^  ([a-z]{2}):\{name:/gm)].map(m => m[1]);
  return kulcsok.length ? kulcsok : ['hu','at','pl','de','fr','gb','ru'];
})();
const IMGDIR = path.join(__dirname, 'kepek');
if (fs.existsSync(IMGDIR)) {
  const map = {};
  let n = 0, bytes = 0;
  for (const nat of NEMZETEK)
    for (let age = 0; age < 4; age++)
      for (const ext of ['png','jpg','jpeg','webp']) {
        const p = path.join(IMGDIR, nat + '-' + age + '.' + ext);
        if (!fs.existsSync(p)) continue;
        const mime = ext === 'png' ? 'image/png'
                   : (ext === 'webp' ? 'image/webp' : 'image/jpeg');
        const b = fs.readFileSync(p);
        map[nat + '-' + age] = 'data:' + mime + ';base64,' + b.toString('base64');
        n++; bytes += b.length;
        break;
      }
  if (n) {
    js = js.replace(/^const RULER_IMG=\{\};/m, 'const RULER_IMG=' + JSON.stringify(map) + ';');
    console.log('  uralkodói kép beépítve:', n, '/', NEMZETEK.length * 4, '—', (bytes / 1048576).toFixed(1), 'MB');
  } else {
    console.log('  uralkodói kép: egy sincs a kepek/ mappában, marad a rajzolt portré');
  }
}

/* Korhű zászlók a zaszlok/ mappából. Amelyikhez nincs kép, ott a
   rajzolt zászló marad. */
const FLAGDIR = path.join(__dirname, 'zaszlok');
if (fs.existsSync(FLAGDIR)) {
  const map = {};
  let n = 0, bytes = 0;
  for (const nat of NEMZETEK)
    for (let age = 0; age < 4; age++) {
      const p = path.join(FLAGDIR, nat + '-' + age + '.png');
      if (!fs.existsSync(p)) continue;
      const b = fs.readFileSync(p);
      map[nat + '-' + age] = 'data:image/png;base64,' + b.toString('base64');
      n++; bytes += b.length;
    }
  if (n) {
    js = js.replace(/^const FLAG_IMG=\{\};/m, 'const FLAG_IMG=' + JSON.stringify(map) + ';');
    console.log('  zászló beépítve:', n, '/', NEMZETEK.length * 4, '—', (bytes / 1024).toFixed(0), 'KB');
  }
}

/* Rövid hangminták (halál, becsapódás) — ugyanúgy beépítve, mint a zene. */
{
  const dir = path.join(__dirname, 'hangok');
  const map = {};
  let bytes = 0, n = 0;
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).sort()) {
      if (!/\.mp3$/i.test(f)) continue;
      const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
      map[f.replace(/\.mp3$/i, '')] = b64;
      bytes += b64.length; n++;
    }
  }
  if (n) {
    js = js.replace(/^const SFX_B64='';/m, 'const SFX_B64=' + JSON.stringify(map) + ';');
    console.log('  hangminta beépítve:', n, 'db —', Math.round(bytes / 1024), 'KB base64');
  }
}

/* --- ZENE ---
   Elég bemásolni egy mp3-at a zene/ mappába: a FÁJLNÉV eleje mondja meg,
   hova tartozik, és a besorolás magától bekerül a játékba.

     15-*.mp3     15. század
     17-*.mp3     17. század
     19-*.mp3     19. század
     20-*.mp3     20. század
     kaloz-*.mp3  kalózvilág
     menu-*.mp3   főmenü

   Egy korszakhoz több fájl is tartozhat — a játék véletlenül választ
   közülük, így egy hosszú játszmában nem ugyanaz szól végig.

   Az előtag nélküli fájlok (a régiek) továbbra is működnek: azokat a
   21b-music.js beírt listája sorolja be. Így a meglévő öt sáv nem esik ki
   attól, hogy bevezettük ezt.

   A licenc a te felelősséged: lásd ZENE.md. Az összeállítás figyelmeztet,
   ha egy fájl nem szerepel a zene/FORRAS.txt nyilvántartóban. */
{
  const dir = path.join(__dirname, 'zene');
  const map = {};
  const eloTag = { '15': 0, '17': 1, '19': 2, '20': 3 };
  const korSav = [[], [], [], []];
  const kalozSav = [], menuSav = [];
  let bytes = 0, n = 0, jelolt = 0;

  /* A nyilvántartó: melyik fájlhoz van feljegyezve forrás. */
  let forras = '';
  const forrasUt = path.join(dir, 'FORRAS.txt');
  if (fs.existsSync(forrasUt)) forras = fs.readFileSync(forrasUt, 'utf8');
  const hianyzoForras = [];

  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).sort()) {
      if (!/\.mp3$/i.test(f)) continue;
      const kulcs = f.replace(/\.mp3$/i, '');
      const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
      map[kulcs] = b64;
      bytes += b64.length; n++;

      const m = kulcs.match(/^(15|17|19|20|kaloz|menu)-/i);
      if (m) {
        jelolt++;
        const t = m[1].toLowerCase();
        if (t === 'kaloz') kalozSav.push(kulcs);
        else if (t === 'menu') menuSav.push(kulcs);
        else korSav[eloTag[t]].push(kulcs);
      }
      if (forras.indexOf(f) < 0) hianyzoForras.push(f);
    }
  }

  if (n) {
    /* --- A ZENE KÜLÖN FÁJLBA ---

       A zene sokáig BELE volt sütve az index.html-be base64-ként:
       21 MB a 26-ból. Amíg a fájlt kézzel küldözgettük, ez nem zavart —
       de ha a játék frissíteni akarja magát, minden apró javításnál
       újra letöltené ugyanazt, pedig a zene sosem változik.

       Alapból tehát a zene KIMARAD a HTML-ből, és a `zene/` mappából
       töltődik le futás közben. Az `--embed` kapcsolóval visszakérhető
       a régi működés: egyetlen, önmagában futtatható fájl. */
    if (BEEPIT) {
      js = js.replace(/^const MUSIC_B64='';/m, 'const MUSIC_B64=' + JSON.stringify(map) + ';');
    } else {
      /* Nem a HTML-be sütjük: csak megmondjuk, HOL keresse. A relatív
         cím azért jó, mert az asztali alkalmazásban és a webszerveren is
         ugyanúgy működik. */
      js = js.replace(/^const MUSIC_URL='';/m, "const MUSIC_URL='zene/';");
    }
    /* A fájlnév szerint besorolt sávokat hozzáfűzzük a beírt listákhoz. */
    if (jelolt) {
      js = js.replace(/^const TRACKS_FAJLNEV=null;/m,
        'const TRACKS_FAJLNEV=' + JSON.stringify({ kor: korSav, kaloz: kalozSav, menu: menuSav }) + ';');
    }
    console.log('  zene beépítve:', n, 'sáv —', (bytes / 1048576).toFixed(1), 'MB base64'
      + (jelolt ? '  (' + jelolt + ' fájlnév szerint besorolva)' : ''));
    if (hianyzoForras.length)
      console.log('  ! nincs feljegyezve a forrása:', hianyzoForras.join(', '),
                  '\n    (írd be a zene/FORRAS.txt fájlba — lásd ZENE.md)');
  } else {
    console.log('  ! nincs zene a zene/ mappában — a játék néma marad');
  }
}

/* A --embed kapcsolóval a zenefájlok adat-URI-ként kerülnek a kimenetbe.
   Így egyetlen, önmagában futtatható HTML jön létre — cserébe a base64
   nagyjából egyharmaddal növeli a méretet. Kapcsoló nélkül a játék a
   lemezen lévő fájlokra hivatkozik, és az index.html apró marad. */

const html =
  read('head.html') +
  read('style.css') +
  ellenorizHtml(read('body.html')) +
  '<script>' + js + read('tail.html');

fs.writeFileSync(OUT, html);

/* KÖNNYŰ VÁLTOZAT próbához.
   A teljes fájl 13 MB, aminek a nagy része zene. Beágyazott előnézetben
   ez már nem tölt be, és fekete képernyőt ad. Ezért kiírunk egy zene
   nélküli változatot is: ugyanaz a játék, csak néma. */
{
  const konnyu = html.replace(/const MUSIC_B64=\{[\s\S]*?\};/, 'const MUSIC_B64={};');
  fs.writeFileSync(path.join(__dirname, 'index-konnyu.html'), konnyu);
  console.log('index-konnyu.html (zene nélkül, próbához) —',
    Math.round(konnyu.length / 1024), 'KB');
}

const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
const lines = html.split('\n').length;
console.log(`index.html kész — ${order.length} modul, ${lines} sor, ${kb} KB`);
