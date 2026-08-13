/* =======================================================================
   BIRODALOM — LAUNCHER

   Ez egy ÖNÁLLÓ program: saját telepítője van (exe Windowson, dmg
   macOS-en), és a játéktól függetlenül fut. Az a dolga, hogy naprakészen
   tartsa a játékot, és elindítsa — ahogy a nagy játékoknál megszokott.

   MIT FRISSÍT?
   A játékot: az `index.html`-t és a zenét. Ezek a `zene` kivételével
   hetente változhatnak, és összesen 4 MB — egy frissítés másodpercek
   kérdése. A játék KERETÉT (az Electront) nem frissíti: ahhoz új
   telepítő kell, de arra ritkán van szükség.

   HOVA TÖLTI?
   Egy KÖZÖS mappába, amit a játék is ismer:

     Windows:  %APPDATA%\Birodalom\jatek
     macOS:    ~/Library/Application Support/Birodalom/jatek

   Ez azért kell külön kimondva, mert a launcher és a játék két külön
   alkalmazás: mindkettőnek MÁS a saját `userData` mappája. Ha a
   megszokott helyre tenné, a játék sosem találná meg.

   HOGYAN INDÍTJA A JÁTÉKOT?
   Megkeresi a telepített játékot, és elindítja. Ha nem találja, saját
   ablakban nyitja meg a letöltött játékot — így a launcher önmagában is
   használható.
   ===================================================================== */
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

let ablak = null;
let jatekAblak = null;

function ikonUt() {
  for (const n of ['icon.png', 'icon.ico']) {
    const p = path.join(__dirname, 'assets', n);
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

/* A KÖZÖS mappa — ezt ismeri a játék is. */
function jatekMappa(id) {
  /* Játékonként KÜLÖN mappa. Enélkül a második játék felülírná az elsőt:
     mindkettő `index.html` néven érkezik.

     A Birodalom marad a régi helyén (`jatek`), hogy a már letöltött
     változat ne vesszen el, és hogy a játék burka is megtalálja. */
  const alap = path.join(app.getPath('appData'), 'Birodalom');
  const d = (!id || id === 'birodalom')
    ? path.join(alap, 'jatek')
    : path.join(alap, 'jatek-' + String(id).replace(/[^a-z0-9_-]/gi, ''));
  try { fs.mkdirSync(d, { recursive: true }); } catch (e) {}
  return d;
}

/* A frissítés címe külön fájlban, hogy újrafordítás nélkül átírható
   legyen. */
function beallitas() {
  for (const p of [path.join(process.resourcesPath || '', 'frissites.json'),
                   path.join(__dirname, 'frissites.json')]) {
    try { if (p && fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch (e) {}
  }
  return {};
}

/* ÉP-E A LETÖLTÖTT JÁTÉK?
   Egy félbeszakadt letöltés is létrejön a lemezen, tehát a puszta
   létezés semmit nem bizonyít. Megnézzük, elég nagy-e, és megvan-e a
   vége. Enélkül egy csonka fájl fehér képernyőt adna. */
function epJatekFajl(p) {
  try {
    const st = fs.statSync(p);
    /* Alsó határ: ennél kisebb már nem lehet játék. Szándékosan alacsony
       — egy kis játék elfér 30 kB-ban is; a Birodalom 4 MB, de nem
       mindenki akkora. */
    if (st.size < 8 * 1024) return false;

    /* A VÉGE a fontos: ha a letöltés félbeszakadt, a lezáró jel hiányzik.
       Az utolsó 400 bájtban keressük — a záró jel mögött néha van még
       újsor vagy szóköz. */
    const fd = fs.openSync(p, 'r');
    const veg = Buffer.alloc(Math.min(400, st.size));
    fs.readSync(fd, veg, 0, veg.length, Math.max(0, st.size - veg.length));

    /* Az ELEJE megmondja, hogy egyáltalán HTML-t kaptunk-e. Egy JSON
       hibaüzenet vagy egy szöveges 404 nem az. */
    const eleje = Buffer.alloc(Math.min(1024, st.size));
    fs.readSync(fd, eleje, 0, eleje.length, 0);
    fs.closeSync(fd);

    const v = veg.toString('utf8').toLowerCase();
    const e = eleje.toString('utf8').toLowerCase();
    if (v.indexOf('</html>') < 0) return false;      // csonka
    if (e.indexOf('<html') < 0 && e.indexOf('<!doctype') < 0) return false;
    return true;
  } catch (e) { return false; }
}


function helyiVerzio(id) {
  try {
    const m = jatekMappa(id);
    const v = fs.readFileSync(path.join(m, 'verzio.txt'), 'utf8').trim();
    if (v && epJatekFajl(path.join(m, 'index.html'))) return v;
  } catch (e) {}
  return null;                      // ez a játék még nincs letöltve
}

/* A JEGYZÉK ÉRTELMEZÉSE.

   Kétféle alakot fogadunk el:

     RÉGI — egyetlen játék, a mezők a legfelső szinten:
       { "verzio": "2.1", "jatek": "https://…/index.html" }

     ÚJ — több játék listában:
       { "jatekok": [ { "id": "birodalom", "nev": "Birodalom", … }, … ] }

   A régi alakot azért tartjuk meg, hogy a már kitett jegyzékfájlok ne
   romoljanak el egyik napról a másikra. */
function jatekokBont(j) {
  if (!j) return [];
  const lista = Array.isArray(j.jatekok) ? j.jatekok
              : (j.verzio && j.jatek ? [Object.assign({ id: 'birodalom', nev: 'Birodalom' }, j)] : []);
  const ki = [];
  for (const e of lista) {
    if (!e || !e.jatek || !e.verzio) continue;         // hiányos bejegyzés: kihagyjuk
    const id = String(e.id || 'birodalom').replace(/[^a-z0-9_-]/gi, '') || 'birodalom';
    ki.push({
      id,
      nev: String(e.nev || id),
      alcim: String(e.alcim || ''),
      verzio: String(e.verzio),
      jatek: String(e.jatek),
      kep: e.kep ? String(e.kep) : null,
      exe: e.exe ? String(e.exe) : (id === 'birodalom' ? 'Birodalom' : null),
      zeneUrl: e.zeneUrl ? String(e.zeneUrl) : null,
      zene: Array.isArray(e.zene) ? e.zene : []
    });
  }
  return ki;
}

/* --- LETÖLTÉS --- */
function letoltSzoveg(url, kesz, melyseg) {
  melyseg = melyseg || 0;
  if (melyseg > 6) { kesz('Túl sok átirányítás.'); return; }
  const mod = url.startsWith('http:') ? http : https;
  const kero = mod.get(url, { headers: { 'User-Agent': 'Birodalom-Launcher' }, timeout: 12000 }, (v) => {
    if (v.statusCode >= 300 && v.statusCode < 400 && v.headers.location) {
      v.resume(); letoltSzoveg(v.headers.location, kesz, melyseg + 1); return;
    }
    if (v.statusCode !== 200) { v.resume(); kesz('A szerver ' + v.statusCode + ' hibát adott.'); return; }
    let d = '';
    v.setEncoding('utf8');
    v.on('data', (c) => { d += c; if (d.length > 256 * 1024) { v.destroy(); kesz('A jegyzék túl nagy.'); } });
    v.on('end', () => kesz(null, d));
  });
  kero.on('timeout', () => { kero.destroy(); kesz('Időtúllépés.'); });
  kero.on('error', (e) => kesz(e.message));
}

/* ATOMIKUS letöltés: előbb `.reszleges` néven, és csak a végén nevezzük
   át. Ha megszakad, nem marad csonka fájl a helyén — ugyanaz az elv,
   mint a játék mentéseinél. */
function letoltFajl(url, celUt, cimke, kesz, melyseg) {
  melyseg = melyseg || 0;
  if (melyseg > 6) { kesz('Túl sok átirányítás.'); return; }
  const mod = url.startsWith('http:') ? http : https;
  const kero = mod.get(url, { headers: { 'User-Agent': 'Birodalom-Launcher' }, timeout: 25000 }, (v) => {
    if (v.statusCode >= 300 && v.statusCode < 400 && v.headers.location) {
      v.resume(); letoltFajl(v.headers.location, celUt, cimke, kesz, melyseg + 1); return;
    }
    if (v.statusCode !== 200) { v.resume(); kesz('A szerver ' + v.statusCode + ' hibát adott.'); return; }

    const ideig = celUt + '.reszleges';
    const ki = fs.createWriteStream(ideig);
    const ossz = parseInt(v.headers['content-length'] || '0', 10);
    let eddig = 0, utolso = 0;
    v.on('data', (d) => {
      eddig += d.length;
      const most = Date.now();
      if (most - utolso > 120) {
        utolso = most;
        if (ablak && !ablak.isDestroyed())
          ablak.webContents.send('halad', { eddig, ossz, cimke });
      }
    });
    v.pipe(ki);
    ki.on('finish', () => ki.close(() => {
      try { fs.renameSync(ideig, celUt); kesz(null, eddig); }
      catch (e) { kesz('Nem sikerült a helyére tenni: ' + e.message); }
    }));
    ki.on('error', (e) => { try { fs.unlinkSync(ideig); } catch (x) {} kesz(e.message); });
  });
  kero.on('timeout', () => { kero.destroy(); kesz('Időtúllépés.'); });
  kero.on('error', (e) => kesz(e.message));
}

let jegyzek = null;

ipcMain.handle('ellenoriz', async () => {
  const be = beallitas();
  if (!be.jegyzek) {
    /* Nincs beállítva cím: nincs mit keresni. A Birodalom akkor is
       játszható, ha telepítve van vagy korábban letöltötted. */
    return { nincsCim: true, jatekok: [{
      id: 'birodalom', nev: 'Birodalom',
      alcim: 'négy évszázad · tizenkét nemzet',
      helyi: helyiVerzio('birodalom'), tavoli: null, ujVan: false
    }] };
  }
  const v = await new Promise(r => letoltSzoveg(be.jegyzek, (hiba, sz) => r({ hiba, sz })));
  if (v.hiba) {
    return { hiba: v.hiba, jatekok: [{
      id: 'birodalom', nev: 'Birodalom',
      alcim: 'négy évszázad · tizenkét nemzet',
      helyi: helyiVerzio('birodalom'), tavoli: null, ujVan: false
    }] };
  }
  let j;
  try { j = JSON.parse(v.sz); } catch (e) { return { hiba: 'A jegyzék olvashatatlan.' }; }
  const lista = jatekokBont(j);
  if (!lista.length) return { hiba: 'A jegyzék egyetlen játékot sem ír le.' };

  jegyzek = {};
  const ki = [];
  for (const e of lista) {
    jegyzek[e.id] = e;                      // a letöltéshez félretesszük
    const helyi = helyiVerzio(e.id);
    ki.push({
      id: e.id, nev: e.nev, alcim: e.alcim, kep: e.kep,
      helyi, tavoli: e.verzio, ujVan: e.verzio !== helyi,
      megjegyzes: j.megjegyzes || ''
    });
  }
  return { jatekok: ki };
});

ipcMain.handle('letolt', async (e, id) => {
  const be = jegyzek && jegyzek[id];
  if (!be) return { hiba: 'Nincs mit letölteni.' };
  const mappa = jatekMappa(id);

  /* 1. A JÁTÉK — ideiglenes néven, és csak akkor kerül a helyére, ha
        épnek bizonyul. */
  const uj = path.join(mappa, 'index.uj');
  const r = await new Promise(k => letoltFajl(be.jatek, uj, 'A játék letöltése…',
    (hiba) => k({ hiba })));
  if (r.hiba) return { hiba: r.hiba };
  if (!epJatekFajl(uj)) {
    try { fs.unlinkSync(uj); } catch (x) {}
    return { hiba: 'A letöltött fájl sérült.' };
  }

  /* 2. A ZENE — csak ami hiányzik. Ez a lényege: a zene EGYSZER jön át. */
  if (be.zene && be.zene.length) {
    const zm = path.join(mappa, 'zene');
    try { fs.mkdirSync(zm, { recursive: true }); } catch (x) {}
    const alap = be.zeneUrl || be.jatek.replace(/[^/]*$/, '') + 'zene/';
    for (const f of be.zene) {
      /* Csak fájlnév lehet: az útvonal-elválasztó kiszűrése
         megakadályozza, hogy egy elrontott jegyzék a mappán KÍVÜLRE
         írasson velünk. */
      if (typeof f !== 'string' || /[\\/]|\.\./.test(f)) continue;
      const cel = path.join(zm, f);
      if (fs.existsSync(cel)) continue;
      await new Promise(k => letoltFajl(alap + encodeURIComponent(f), cel, 'Zene: ' + f, () => k()));
    }
  }

  /* 3. CSERE — csak most, amikor minden megvan és ép. */
  try {
    fs.renameSync(uj, path.join(mappa, 'index.html'));
    fs.writeFileSync(path.join(mappa, 'verzio.txt'), be.verzio, 'utf8');
  } catch (x) { return { hiba: 'A csere nem sikerült: ' + x.message }; }
  return { verzio: be.verzio };
});

/* --- A JÁTÉK INDÍTÁSA ---
   Először a TELEPÍTETT játékot keressük: az a rendes út. Ha nincs,
   saját ablakban nyitjuk meg a letöltöttet — így a launcher önmagában
   is használható, telepített játék nélkül. */
function telepitettJatek(mappaNev) {
  const nev = mappaNev || 'Birodalom';
  const p = process.platform;
  const jeloltek = [];
  if (p === 'win32') {
    for (const k of ['LOCALAPPDATA', 'PROGRAMFILES', 'ProgramFiles(x86)']) {
      if (process.env[k]) {
        jeloltek.push(path.join(process.env[k], 'Programs', nev, nev + '.exe'));
        jeloltek.push(path.join(process.env[k], nev, nev + '.exe'));
      }
    }
  } else if (p === 'darwin') {
    jeloltek.push('/Applications/' + nev + '.app/Contents/MacOS/' + nev);
    jeloltek.push(path.join(app.getPath('home'), 'Applications', nev + '.app', 'Contents', 'MacOS', nev));
  }
  for (const j of jeloltek) {
    try {
      if (!fs.existsSync(j)) continue;
      /* BIZTOSÍTÉK: soha ne indítsuk el ÖNMAGUNKAT.

         A launcher és a játék korábban ugyanazzal a névvel települt
         volna (`Programs\Birodalom`), és a launcher épp ezt az
         útvonalat keresi játékként. Ütközés esetén saját magát
         indította volna el — újra és újra, végtelen körben.

         A nevet szétválasztottuk, de a biztosíték maradjon: egy
         későbbi átnevezés vagy egy régi telepítés újra összehozhatná
         őket. */
      if (path.resolve(j) === path.resolve(process.execPath)) continue;
      return j;
    } catch (e) {}
  }
  return null;
}

ipcMain.handle('indit', async (e, id, exeNev) => {
  const exe = exeNev ? telepitettJatek(exeNev) : null;
  if (exe) {
    try {
      /* `detached`: a játék a launchertől függetlenül él tovább, tehát a
         launcher bezárható anélkül, hogy a játék is meghalna. */
      spawn(exe, [], { detached: true, stdio: 'ignore' }).unref();
      setTimeout(() => app.quit(), 900);
      return { mod: 'telepitett' };
    } catch (x) { /* ha nem indul, jöhet a saját ablak */ }
  }
  /* Nincs telepített játék: magunk nyitjuk meg a letöltöttet. */
  const ut = path.join(jatekMappa(id), 'index.html');
  if (!fs.existsSync(ut) || !epJatekFajl(ut)) return { hiba: 'Nincs letöltött játék.' };
  jatekAblak = new BrowserWindow({
    width: 1280, height: 800, minWidth: 800, minHeight: 520,
    backgroundColor: '#0c0a08', title: 'Birodalom', icon: ikonUt(), show: false,
    webPreferences: {
      contextIsolation: true, nodeIntegration: false, backgroundThrottling: false,
      /* A HÍD: enélkül a saját ablakban futó játék nem tud szervert
         indítani, és a többjátékos mód használhatatlan. */
      preload: path.join(__dirname, 'preload-jatek.js')
    }
  });
  jatekAblak.webContents.setWindowOpenHandler(({ url }) => {
    try { if (/^https?:/.test(url)) shell.openExternal(url); } catch (x) {}
    return { action: 'deny' };
  });
  jatekAblak.webContents.on('will-navigate', (ev, url) => {
    if (!url.startsWith('file://')) ev.preventDefault();
  });
  jatekAblak.loadFile(ut);
  jatekAblak.once('ready-to-show', () => {
    jatekAblak.show();
    if (ablak && !ablak.isDestroyed()) ablak.close();
    ablak = null;
  });
  jatekAblak.on('closed', () => { jatekAblak = null; app.quit(); });
  return { mod: 'sajat' };
});

/* =======================================================================
   JÁTÉKSZERVER A LAUNCHERBŐL

   Ha a launcher SAJÁT ablakában futtatja a játékot (mert a telepített
   játékot nem találja), akkor a többjátékos módhoz neki kell elindítania
   a szervert. Enélkül a „Szoba nyitása" nem talál semmit — pontosan ez
   volt a hiba.

   A `szerver.js` a launcher mellett utazik, tehát nem függ attól, hogy a
   játék telepítve van-e.
   ===================================================================== */
let jatekSzerver = null;
let jatekSzerverKapu = 0;
let jatekAlagut = null;
let jatekAlagutCim = null;

function helyiCimek() {
  const ki = [];
  try {
    const halo = require('os').networkInterfaces();
    for (const nev in halo)
      for (const c of halo[nev] || [])
        if (c.family === 'IPv4' && !c.internal) ki.push(c.address);
  } catch (e) {}
  return ki;
}

/* ALAGÚT — cloudflared automatikus beszerzése és indítása.
   Ha nincs meg a gépen, letöltjük a Cloudflare GitHub-kiadásából.
   A launcher ugyanazt a logikát használja, mint az asztali játék. */
const CF_CIM = 'https://github.com/cloudflare/cloudflared/releases/latest/download/';
function cfFajlNev() {
  const p = process.platform, a = process.arch;
  if (p === 'win32') return a === 'ia32' ? 'cloudflared-windows-386.exe' : 'cloudflared-windows-amd64.exe';
  if (p === 'darwin') return a === 'arm64' ? 'cloudflared-darwin-arm64.tgz' : 'cloudflared-darwin-amd64.tgz';
  if (p === 'linux') return a === 'arm64' ? 'cloudflared-linux-arm64' : 'cloudflared-linux-amd64';
  return null;
}
function cfMappa() {
  const d = path.join(app.getPath('appData'), 'Birodalom', 'eszkoz');
  try { fs.mkdirSync(d, { recursive: true }); } catch (e) {}
  return d;
}
function cfHelyiUt() {
  return path.join(cfMappa(), process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');
}
function cfMegvan() {
  const sajat = cfHelyiUt();
  if (fs.existsSync(sajat)) return sajat;
  try {
    const { execFileSync } = require('child_process');
    execFileSync('cloudflared', ['--version'], { stdio: 'ignore', timeout: 4000 });
    return 'cloudflared';
  } catch (e) {}
  return null;
}
function cfLetolt(url, celUt, kesz, melyseg) {
  melyseg = melyseg || 0;
  if (melyseg > 6) { kesz('Túl sok átirányítás.'); return; }
  const https = require('https');
  https.get(url, { headers: { 'User-Agent': 'Birodalom-Launcher' } }, (v) => {
    if (v.statusCode >= 300 && v.statusCode < 400 && v.headers.location) {
      v.resume(); cfLetolt(v.headers.location, celUt, kesz, melyseg + 1); return;
    }
    if (v.statusCode !== 200) { v.resume(); kesz('Letöltés sikertelen (' + v.statusCode + ').'); return; }
    const ideig = celUt + '.reszleges';
    const ki = fs.createWriteStream(ideig);
    const ossz = parseInt(v.headers['content-length'] || '0', 10);
    let eddig = 0, utolso = 0;
    v.on('data', (d) => {
      eddig += d.length;
      const most = Date.now();
      if (ossz && most - utolso > 400) {
        utolso = most;
        const szazalek = Math.round(eddig / ossz * 100);
        if (ablak && !ablak.isDestroyed())
          ablak.webContents.send('cf-letoltes', szazalek);
      }
    });
    v.pipe(ki);
    ki.on('finish', () => ki.close(() => {
      try {
        fs.renameSync(ideig, celUt);
        if (process.platform !== 'win32') fs.chmodSync(celUt, 0o755);
        kesz(null);
      } catch (e) { kesz('Nem sikerült a helyére tenni: ' + e.message); }
    }));
    ki.on('error', (e) => { try { fs.unlinkSync(ideig); } catch (x) {} kesz(e.message); });
  }).on('error', (e) => kesz(e.message));
}
function cfBeszerez(kesz) {
  const meglevo = cfMegvan();
  if (meglevo) { kesz(null, meglevo); return; }
  const nev = cfFajlNev();
  if (!nev) { kesz('Ehhez a rendszerhez nincs cloudflared.'); return; }
  const cel = cfHelyiUt();
  const tgz = nev.endsWith('.tgz');
  const letoltesCel = tgz ? path.join(cfMappa(), nev) : cel;
  cfLetolt(CF_CIM + nev, letoltesCel, (hiba) => {
    if (hiba) { kesz(hiba); return; }
    if (!tgz) { kesz(null, cel); return; }
    try {
      require('child_process').execFileSync('tar', ['-xzf', letoltesCel, '-C', cfMappa()]);
      fs.chmodSync(cel, 0o755);
      try { fs.unlinkSync(letoltesCel); } catch (e) {}
      kesz(null, cel);
    } catch (e) { kesz('A kibontás nem sikerült: ' + e.message); }
  });
}

function jatekAlagutIndit(kapu, kesz) {
  /* cfBeszerez: ha nincs meg a cloudflared, először letölti (~30 MB),
     aztán elindítja. Első szobanyitáskor ez néhány másodpercet vesz
     igénybe — a felületen látható százalék megnyugtat. */
  cfBeszerez((hiba, ut) => {
    if (hiba || !ut) { kesz(null); return; }
    let kesz2 = false;
    try {
      jatekAlagut = spawn(ut, ['tunnel', '--url', 'http://127.0.0.1:' + kapu, '--no-autoupdate'],
        { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) { kesz(null); return; }
    const olvas = (d) => {
      const m = String(d).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (m && !kesz2) { kesz2 = true; jatekAlagutCim = m[0].replace(/^https:/i, 'wss:'); kesz(jatekAlagutCim); }
    };
    jatekAlagut.stdout.on('data', olvas);
    jatekAlagut.stderr.on('data', olvas);
    jatekAlagut.on('error', () => { if (!kesz2) { kesz2 = true; kesz(null); } });
    setTimeout(() => { if (!kesz2) { kesz2 = true; kesz(null); } }, 20000);
  });
}

ipcMain.handle('jatek-szerver-indit', async (e, kapu) => {
  kapu = parseInt(kapu, 10) || 8787;
  if (jatekSzerver) {
    return { fut: true, kapu: jatekSzerverKapu, helyi: helyiCimek(), alagut: jatekAlagutCim };
  }
  const ut = path.join(__dirname, 'szerver.js');
  if (!fs.existsSync(ut)) return { hiba: 'A szerver.js nem található a launcher mellett.' };
  try {
    /* Az Electron a saját Node-ját használja: az ELECTRON_RUN_AS_NODE
       változóval egyszerű Node-folyamatként indítjuk. */
    jatekSzerver = spawn(process.execPath, [ut, String(kapu)], {
      env: Object.assign({}, process.env, { ELECTRON_RUN_AS_NODE: '1' }),
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (err) { jatekSzerver = null; return { hiba: 'A szerver nem indult el: ' + err.message }; }
  jatekSzerverKapu = kapu;
  jatekSzerver.on('exit', () => { jatekSzerver = null; jatekSzerverKapu = 0; });
  jatekSzerver.stderr.on('data', d => console.error('[szerver]', String(d).trim()));

  /* Megvárjuk, hogy tényleg figyeljen — enélkül a játék a saját
     szerverére próbálna csatlakozni, mielőtt az felállna. */
  await new Promise(r => setTimeout(r, 700));
  const alagut = await new Promise(r => jatekAlagutIndit(kapu, r));
  return { fut: true, kapu, helyi: helyiCimek(), alagut };
});

ipcMain.on('jatek-szerver-leallit', (e) => {
  try { if (jatekAlagut) jatekAlagut.kill(); } catch (x) {}
  try { if (jatekSzerver) jatekSzerver.kill(); } catch (x) {}
  jatekAlagut = null; jatekSzerver = null; jatekAlagutCim = null; jatekSzerverKapu = 0;
  e.returnValue = true;
});
ipcMain.on('jatek-szerver-allapot', (e) => {
  e.returnValue = { fut: !!jatekSzerver, kapu: jatekSzerverKapu,
                    helyi: helyiCimek(), alagut: jatekAlagutCim };
});
/* Kilépéskor mindent leállítunk — különben a háttérben maradna. */
app.on('before-quit', () => {
  try { if (jatekAlagut) jatekAlagut.kill(); } catch (e) {}
  try { if (jatekSzerver) jatekSzerver.kill(); } catch (e) {}
});

ipcMain.on('kilep', () => app.quit());
ipcMain.on('kicsinyit', () => { if (ablak && !ablak.isDestroyed()) ablak.minimize(); });
ipcMain.on('mappa-nyit', (e, id) => { try { shell.openPath(jatekMappa(id)); } catch (x) {} });

function keszit() {
  ablak = new BrowserWindow({
    /* Nagyobb ablak: bal oldalt a játéklista, középen a kép — ehhez
       kell a hely. Átméretezhető, mert a kép jól bírja. */
    width: 940, height: 580, minWidth: 820, minHeight: 520, frame: false,
    backgroundColor: '#0c0a08', title: 'Birodalom', icon: ikonUt(), show: false,
    webPreferences: {
      contextIsolation: true, nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  Menu.setApplicationMenu(null);
  ablak.loadFile(path.join(__dirname, 'launcher.html'));
  ablak.once('ready-to-show', () => ablak.show());
  /* A launcher sem tölthet be idegen tartalmat. */
  ablak.webContents.setWindowOpenHandler(({ url }) => {
    try { if (/^https?:/.test(url)) shell.openExternal(url); } catch (e) {}
    return { action: 'deny' };
  });
  ablak.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault();
  });
  ablak.on('closed', () => { ablak = null; if (!jatekAblak) app.quit(); });
}

if (process.platform === 'win32') app.setAppUserModelId('hu.parthenon2.birodalom.launcher');
app.whenReady().then(() => {
  keszit();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) keszit(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
