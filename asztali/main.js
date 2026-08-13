/* =======================================================================
   Birodalom — asztali burok (Electron)

   Ugyanaz a játék, saját ablakban: nincs böngészősáv, nincs URL, és
   internet nélkül is fut. Windowson .exe telepítő készülhet belőle,
   Macen .app, Linuxon AppImage.
   ===================================================================== */
const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

/* Az ablak és a tálca ikonja. Windowson .ico kell, több mérettel — a PNG
   ott gyakran nem érvényesül, és marad az Electron alap atomikonja. */
function ikonUt() {
  const jeloltek = process.platform === 'win32'
    ? ['assets/icon.ico', 'www/icon-512.png']
    : ['www/icon-512.png', 'assets/icon.png'];
  for (const j of jeloltek) {
    const p = path.join(__dirname, '..', j);
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

/* A teljes képernyő állapota két indítás között is megmarad. A beállítást
   az Electron saját adatmappájába írjuk, hogy a telepített játék se
   veszítse el frissítéskor. */
function beallitasUt() {
  return path.join(app.getPath('userData'), 'ablak.json');
}
function beallitasOlvas() {
  try { return JSON.parse(fs.readFileSync(beallitasUt(), 'utf8')); }
  catch (e) { return {}; }
}
function beallitasIr(o) {
  try { fs.writeFileSync(beallitasUt(), JSON.stringify(o)); } catch (e) {}
}

function keszitJatekAblak() {
  const mentett = beallitasOlvas();
  const win = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 800, minHeight: 520,
    backgroundColor: '#0c0a08',
    title: 'Birodalom',
    icon: ikonUt(),
    show: false,                       // csak akkor mutatjuk, ha kész
    fullscreen: !!mentett.teljes,      // ugyanúgy indul, ahogy kiléptél
    webPreferences: {
      contextIsolation: true, nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false      // háttérben se lassuljon a játék
    }
  });
  Menu.setApplicationMenu(null);          // nincs menüsor: teljes a játéktér
  /* --- KIJÁRAT LEZÁRÁSA ---
     A játék csak a saját fájljait mutathatja. Ha valami mégis külső
     címre próbálna navigálni vagy új ablakot nyitni — akár egy hibás
     hivatkozás, akár egy beszivárgott szkript miatt —, azt elutasítjuk,
     és a rendszer alapértelmezett böngészőjében nyitjuk meg helyette.
     Így a játékablak sosem tölt be idegen tartalmat. */
  win.webContents.setWindowOpenHandler(({ url }) => {
    try { if (/^https?:/.test(url)) require('electron').shell.openExternal(url); } catch (e) {}
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault();
  });

  /* A LETÖLTÖTT játék, ha van és ép; különben a beépített. A
     `jatekUt()` dönti el — ott van a visszaesési út is. */
  win.loadFile(jatekUt());

  /* Villanás nélküli indulás: a sötét háttér előbb áll be, mint a tartalom. */
  win.once('ready-to-show', () => win.show());

  /* A játék felülete követni tudja az állapotot, hogy a beállítások
     kapcsolója és az F11 ugyanazt mutassa. */
  const jelez = () => {
    if (win.isDestroyed()) return;
    win.webContents.send('teljes-kepernyo-allapot', win.isFullScreen());
    beallitasIr({ teljes: win.isFullScreen() });
  };
  win.on('enter-full-screen', jelez);
  win.on('leave-full-screen', jelez);
  win.webContents.on('did-finish-load', jelez);

  /* F11: teljes képernyő, F12: fejlesztői eszközök. Az Esc szándékosan
     nincs elkapva: a játékban is dolga van (menü, kijelölés törlése). */
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === 'F12') win.webContents.toggleDevTools();
  });
}

/* A játék beállításaiból kérheti az ablak méretét. A kért méret a
   képernyőnél nem lehet nagyobb; ilyenkor a legnagyobb elférőre állunk.
   Teljes képernyőn a rögzített méret értelmetlen, ezért előbb kilépünk. */
/* =======================================================================
   TÁROLÓ — valódi fájlok a lemezen

   A játék eredetileg a böngésző localStorage-ába mentett. Az asztali
   alkalmazásban ez több okból rossz:

     · a mentés a böngészőmotor adatai közt ül, nem fájlként
     · takarításkor vagy újratelepítéskor eltűnhet
     · nem lehet átmásolni másik gépre, és nem lehet róla másolatot
       csinálni

   Innentől minden állás, beállítás és teljesítmény külön JSON-fájlba
   kerül a felhasználói mappába:

     Windows : %APPDATA%\Birodalom\tarolo\
     macOS   : ~/Library/Application Support/Birodalom/tarolo/
     Linux   : ~/.config/Birodalom/tarolo/

   A hívások SZINKRONOK (sendSync). Kis JSON-oknál ez ezredmásodperc
   nagyságrendű, cserébe a játék meglévő, szinkron mentőkódját nem
   kellett átírni.

   A kulcsokból fájlnevet képezünk; mindent kiszűrünk, ami a fájlrendszert
   megzavarhatná — így a játék nem tud kilépni a saját mappájából. */
function taroloMappa() {
  const d = path.join(app.getPath('userData'), 'tarolo');
  try { fs.mkdirSync(d, { recursive: true }); } catch (e) {}
  return d;
}
/* Windows fenntartott eszköznevei: CON, PRN, AUX, NUL, COM1-9, LPT1-9.
   Ezekkel kiterjesztéssel együtt sem lehet fájlt nyitni — a művelet vagy
   hibázik, vagy a konzolra ír. Elé teszünk egy aláhúzást. */
const TILTOTT_NEV = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
function taroloUt(kulcs) {
  let tiszta = String(kulcs || '').replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 80);
  if (!tiszta) return null;
  if (TILTOTT_NEV.test(tiszta)) tiszta = '_' + tiszta;
  return path.join(taroloMappa(), tiszta + '.json');
}
ipcMain.on('tarolo-ir', (e, kulcs, ertek) => {
  const ut = taroloUt(kulcs);
  if (!ut) { e.returnValue = false; return; }
  /* ATOMIKUS ÍRÁS: előbb ideiglenes fájlba, aztán átnevezés.

     Ha az áramszünet vagy egy összeomlás a közepén éri az írást, a régi
     mentés érintetlen marad — a fél fájl az ideiglenesben pusztul. Enélkül
     egy rosszkor jött leállás pont a mentést tehette volna tönkre, vagyis
     azt, amiért az egész készült. */
  const ideig = ut + '.uj';
  try {
    fs.writeFileSync(ideig, String(ertek), 'utf8');
    fs.renameSync(ideig, ut);
    e.returnValue = true;
  } catch (err) {
    try { if (fs.existsSync(ideig)) fs.unlinkSync(ideig); } catch (e2) {}
    console.error('mentés sikertelen:', err.message);
    e.returnValue = false;
  }
});
ipcMain.on('tarolo-olvas', (e, kulcs) => {
  const ut = taroloUt(kulcs);
  try { e.returnValue = (ut && fs.existsSync(ut)) ? fs.readFileSync(ut, 'utf8') : null; }
  catch (err) { e.returnValue = null; }
});
ipcMain.on('tarolo-torol', (e, kulcs) => {
  const ut = taroloUt(kulcs);
  try { if (ut && fs.existsSync(ut)) fs.unlinkSync(ut); e.returnValue = true; }
  catch (err) { e.returnValue = false; }
});
ipcMain.on('tarolo-lista', (e) => {
  try {
    e.returnValue = fs.readdirSync(taroloMappa())
      .filter(f => f.endsWith('.json'))
      .map(f => f.slice(0, -5));
  } catch (err) { e.returnValue = []; }
});
/* A mentésmappa megnyitása a fájlkezelőben — hogy a játékos meg tudja
   találni és el tudja tenni a mentéseit. */
ipcMain.on('tarolo-mappa', (e) => {
  try { require('electron').shell.openPath(taroloMappa()); } catch (err) {}
  e.returnValue = taroloMappa();
});

/* =======================================================================
   HONNAN INDUL A JÁTÉK?

   A frissítést egy KÜLÖN program (a launcher) intézi, és a letöltött
   játékot egy KÖZÖS mappába teszi. A két alkalmazás külön `userData`
   mappát kap, ezért a közös helyet kézzel kell megadni — különben a
   játék sosem találná meg azt, amit a launcher letöltött.
   ===================================================================== */
function kozosMappa() {
  const d = path.join(app.getPath('appData'), 'Birodalom', 'jatek');
  try { fs.mkdirSync(d, { recursive: true }); } catch (e) {}
  return d;
}
/* ÉP-E A FÁJL? Egy félbeszakadt letöltés is létrejön a lemezen, tehát a
   puszta létezés semmit nem bizonyít: megnézzük a méretét és a végét. */
function epJatekFajl(p) {
  try {
    const st = fs.statSync(p);
    /* Alsó határ: ennél kisebb már nem lehet játék. Szándékosan alacsony
       — a Birodalom 4 MB, de az ellenőrzés nem róla szól, hanem arról,
       hogy TELJES fájlt kaptunk-e. */
    if (st.size < 8 * 1024) return false;
    const fd = fs.openSync(p, 'r');
    const veg = Buffer.alloc(Math.min(400, st.size));
    fs.readSync(fd, veg, 0, veg.length, Math.max(0, st.size - veg.length));
    fs.closeSync(fd);
    return veg.toString('utf8').toLowerCase().indexOf('</html>') >= 0;
  } catch (e) { return false; }
}

/* A LETÖLTÖTT játék, ha van és ép; különben a beépített. Ez a
   visszaesési út: ha a frissítés bármiért hibás, a játék akkor is indul. */
function jatekUt() {
  const letoltott = path.join(kozosMappa(), 'index.html');
  if (fs.existsSync(letoltott) && epJatekFajl(letoltott)) return letoltott;
  return path.join(__dirname, '..', 'www', 'index.html');
}

/* =======================================================================
   BEÉPÍTETT JÁTÉKSZERVER

   Eddig a többjátékos módhoz külön kellett futtatni a `szerver.js`-t egy
   gépen, és annak a gépnek végig bekapcsolva kellett maradnia. Ez a
   legnagyobb akadály volt: ha a „szervergazda" nem ért rá, senki nem
   játszhatott.

   Mostantól a HÁZIGAZDA gépén indul a szerver, automatikusan, amikor
   szobát nyit. Aki hostol, az egyben a postás is.

   MIÉRT MŰKÖDIK EZ? Mert a szerver nem számol semmit: csak továbbítja az
   üzeneteket és ráírja a feladó helyszámát. A szimuláció minden gépen
   fut. A házigazda gépe így egyszerre játékos és elosztó — a terhelés
   elhanyagolható.

   AMIT CSERÉBE ELVESZTÜNK: ha a házigazda kilép, a szerver is megáll, és
   a meccsnek vége. A külön futó szerver ezt túlélte. Ez a csere ára, és
   ezért marad meg a kézi indítás lehetősége is.

   AZ ALAGÚT. Otthoni internet mögött általában nincs saját nyilvános
   cím, ezért a helyi szerver csak azonos wifin érhető el. Ha a gépen van
   `cloudflared`, azt is elindítjuk, és az általa adott nyilvános címet
   adjuk vissza — így interneten át is megy. Ha nincs, marad a helyi cím,
   és ezt meg is mondjuk.
   ===================================================================== */
const { spawn } = require('child_process');
let szerverFolyamat = null;
let alagutFolyamat = null;
let szerverKapu = 0;
let alagutCim = null;

function helyiCimek() {
  const ki = [];
  try {
    const halo = require('os').networkInterfaces();
    for (const nev in halo) {
      for (const c of halo[nev] || []) {
        if (c.family === 'IPv4' && !c.internal) ki.push(c.address);
      }
    }
  } catch (e) {}
  return ki;
}

/* --- A CLOUDFLARED BESZERZÉSE ---

   Nem a telepítőbe csomagoljuk, hanem SZÜKSÉG ESETÉN letöltjük. Miért?

     · A telepítő nem hízik ötven megabájttal olyasmivel, amit sokan
       sosem használnak (aki csak egy gépen játszik, annak nem kell).
     · Aki csatlakozik, annak sem kell — csak a házigazdának.
     · A letöltött változat mindig friss: a Cloudflare a régi kiadásokat
       egy év után elejti.

   A fájl a felhasználói mappába kerül, tehát nem kell rendszergazdai
   jog, és a program eltávolításakor sem marad szemét a rendszerben.

   Ha a gépen már van cloudflared (útvonalon vagy korábbi letöltésből),
   nem töltünk le semmit.                                              */
const CF_CIM = 'https://github.com/cloudflare/cloudflared/releases/latest/download/';
function cfFajlNev() {
  const p = process.platform, a = process.arch;
  if (p === 'win32') return a === 'ia32' ? 'cloudflared-windows-386.exe' : 'cloudflared-windows-amd64.exe';
  if (p === 'darwin') return a === 'arm64' ? 'cloudflared-darwin-arm64.tgz' : 'cloudflared-darwin-amd64.tgz';
  if (p === 'linux') return a === 'arm64' ? 'cloudflared-linux-arm64' : 'cloudflared-linux-amd64';
  return null;
}
function cfMappa() {
  const d = path.join(app.getPath('userData'), 'eszkoz');
  try { fs.mkdirSync(d, { recursive: true }); } catch (e) {}
  return d;
}
function cfHelyiUt() {
  return path.join(cfMappa(), process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');
}
/* Van-e már? Előbb a saját mappánkban, aztán az útvonalon. */
function cfMegvan() {
  const sajat = cfHelyiUt();
  if (fs.existsSync(sajat)) return sajat;
  try {
    const { execFileSync } = require('child_process');
    execFileSync('cloudflared', ['--version'], { stdio: 'ignore', timeout: 4000 });
    return 'cloudflared';                       // az útvonalon van
  } catch (e) {}
  return null;
}

/* Letöltés átirányítás-követéssel. A GitHub egy aláírt tárolócímre
   irányít, ezért a Location fejlécet követni kell. */
function cfLetolt(url, celUt, kesz, melyseg) {
  melyseg = melyseg || 0;
  if (melyseg > 6) { kesz('Túl sok átirányítás.'); return; }
  const https = require('https');
  https.get(url, { headers: { 'User-Agent': 'Birodalom' } }, (v) => {
    if (v.statusCode >= 300 && v.statusCode < 400 && v.headers.location) {
      v.resume();
      cfLetolt(v.headers.location, celUt, kesz, melyseg + 1);
      return;
    }
    if (v.statusCode !== 200) { v.resume(); kesz('A letöltés nem sikerült (' + v.statusCode + ').'); return; }

    /* ATOMIKUS ÍRÁS: előbb ideiglenes fájlba, aztán átnevezés. Ha a
       letöltés félbeszakad, nem marad csonka futtatható a helyén —
       ugyanaz az elv, mint a mentéseknél. */
    const ideig = celUt + '.reszleges';
    const ki = fs.createWriteStream(ideig);
    const ossz = parseInt(v.headers['content-length'] || '0', 10);
    let eddig = 0, utolsoJelzes = 0;
    v.on('data', (d) => {
      eddig += d.length;
      const most = Date.now();
      if (ossz && most - utolsoJelzes > 400) {
        utolsoJelzes = most;
        const szazalek = Math.round(eddig / ossz * 100);
        for (const a of BrowserWindow.getAllWindows())
          a.webContents.send('cf-letoltes', szazalek);
      }
    });
    v.pipe(ki);
    ki.on('finish', () => {
      ki.close(() => {
        try {
          fs.renameSync(ideig, celUt);
          if (process.platform !== 'win32') fs.chmodSync(celUt, 0o755);
          kesz(null);
        } catch (e) { kesz('Nem sikerült a helyére tenni: ' + e.message); }
      });
    });
    ki.on('error', (e) => { try { fs.unlinkSync(ideig); } catch (x) {} kesz(e.message); });
  }).on('error', (e) => kesz(e.message));
}

/* A teljes beszerzés: megvan-e, ha nem, letöltjük (és macOS-en
   kicsomagoljuk a tgz-t). */
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
    /* macOS: a tgz-t kibontjuk. A tar minden macOS-en ott van. */
    try {
      require('child_process').execFileSync('tar', ['-xzf', letoltesCel, '-C', cfMappa()]);
      fs.chmodSync(cel, 0o755);
      try { fs.unlinkSync(letoltesCel); } catch (e) {}
      kesz(null, cel);
    } catch (e) { kesz('A kibontás nem sikerült: ' + e.message); }
  });
}

/* A cloudflared kimenetéből kiolvassuk a kapott címet. A program a
   szabványos hibakimenetre ír, és a cím egy trycloudflare.com végű URL. */
function alagutIndit(kapu, kesz) {
  let elindult = false;
  const ut = cfMegvan();
  if (!ut) { kesz(null); return; }            // nincs mivel: marad a helyi cím
  try {
    alagutFolyamat = spawn(ut,
      ['tunnel', '--url', 'http://127.0.0.1:' + kapu, '--no-autoupdate'],
      { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) { kesz(null); return; }

  const olvas = (adat) => {
    const sz = String(adat);
    const m = sz.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    if (m && !elindult) {
      elindult = true;
      /* A játék WebSocketet nyit: a https-t wss-re cseréljük. */
      alagutCim = m[0].replace(/^https:/i, 'wss:');
      kesz(alagutCim);
    }
  };
  alagutFolyamat.stdout.on('data', olvas);
  alagutFolyamat.stderr.on('data', olvas);
  alagutFolyamat.on('error', () => { if (!elindult) { elindult = true; kesz(null); } });
  /* Húsz másodperc után feladjuk: a helyi cím akkor is használható. */
  setTimeout(() => { if (!elindult) { elindult = true; kesz(null); } }, 20000);
}

ipcMain.handle('szerver-indit', async (e, kapu) => {
  kapu = parseInt(kapu, 10) || 8787;
  if (szerverFolyamat) {
    return { fut: true, kapu: szerverKapu, helyi: helyiCimek(), alagut: alagutCim };
  }
  const ut = path.join(__dirname, '..', 'szerver.js');
  if (!fs.existsSync(ut)) return { hiba: 'A szerver.js nem található az alkalmazás mellett.' };

  try {
    /* Az Electron a saját Node-ját használja: az ELECTRON_RUN_AS_NODE
       környezeti változóval egyszerű Node-folyamatként indítjuk. Így nem
       kell külön telepített Node a gépre. */
    szerverFolyamat = spawn(process.execPath, [ut, String(kapu)], {
      env: Object.assign({}, process.env, { ELECTRON_RUN_AS_NODE: '1' }),
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (err) {
    szerverFolyamat = null;
    return { hiba: 'A szerver nem indult el: ' + err.message };
  }
  szerverKapu = kapu;
  szerverFolyamat.on('exit', () => { szerverFolyamat = null; szerverKapu = 0; });
  szerverFolyamat.stderr.on('data', d => console.error('[szerver]', String(d).trim()));

  /* Megvárjuk, hogy tényleg figyeljen — enélkül a játék a saját
     szerverére próbálna csatlakozni, mielőtt az felállna. */
  await new Promise(r => setTimeout(r, 700));

  /* Az alagút eszköze: ha nincs, letöltjük. A letöltés csak az ELSŐ
     szobanyitáskor fut le, utána a fájl a felhasználói mappában marad. */
  const beszerzes = await new Promise(r => cfBeszerez((hiba, ut) => r({ hiba, ut })));
  const alagut = beszerzes.ut ? await new Promise(r => alagutIndit(kapu, r)) : null;
  return { fut: true, kapu, helyi: helyiCimek(), alagut,
           cfHiba: beszerzes.hiba || null };
});

ipcMain.on('szerver-leallit', (e) => {
  try { if (alagutFolyamat) alagutFolyamat.kill(); } catch (err) {}
  try { if (szerverFolyamat) szerverFolyamat.kill(); } catch (err) {}
  alagutFolyamat = null; szerverFolyamat = null; alagutCim = null; szerverKapu = 0;
  e.returnValue = true;
});
ipcMain.on('szerver-allapot', (e) => {
  e.returnValue = { fut: !!szerverFolyamat, kapu: szerverKapu,
                    helyi: helyiCimek(), alagut: alagutCim };
});
/* Kilépéskor mindig leállítjuk — különben a folyamat a háttérben maradna. */
app.on('before-quit', () => {
  try { if (alagutFolyamat) alagutFolyamat.kill(); } catch (e) {}
  try { if (szerverFolyamat) szerverFolyamat.kill(); } catch (e) {}
});

ipcMain.on('ablak-meret', (e, w, h) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (!win) return;
  const munka = screen.getDisplayMatching(win.getBounds()).workAreaSize;
  const sw = Math.min(w, munka.width), sh = Math.min(h, munka.height);
  if (win.isFullScreen()) win.setFullScreen(false);
  win.setSize(Math.round(sw), Math.round(sh));
  win.center();
});

/* Teljes képernyő: kapcsolás, illetve célzott be- vagy kikapcsolás.
   A második alak azért kell, hogy a beállítások gombja ne csak
   váltogasson, hanem a megnyomott gombnak megfelelő állapotba álljon. */
ipcMain.on('teljes-kepernyo', (e, ertek) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (!win) return;
  win.setFullScreen(typeof ertek === 'boolean' ? ertek : !win.isFullScreen());
});
ipcMain.handle('teljes-kepernyo-lekerdez', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  return win ? win.isFullScreen() : false;
});

/* Windowson ez mondja meg a tálcának, melyik alkalmazáshoz tartozik az
   ablak — enélkül a fejlesztés közben futtatott játék az Electron
   ikonjával jelenik meg. */
if (process.platform === 'win32') app.setAppUserModelId('hu.parthenon2.birodalom');

app.whenReady().then(() => {
  keszitJatekAblak();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) keszitJatekAblak();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
