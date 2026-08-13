# Birodalom — 1400–1945

Felülnézetes valós idejű stratégiai játék: vár- és birodalomépítés a késő
középkortól a világháborús korig, hét választható nemzettel, négy korszakkal,
ködfátyollal, hadjárattal és hittérítőkkel.

## Gyors indítás

Nyisd meg az `index.html` fájlt bármelyik böngészőben. Nincs telepítés,
nincs internetkapcsolat, nincs külső könyvtár.

Telefonos vagy telepíthető teszthez viszont kiszolgáló kell:

```
node serve.js        # majd http://localhost:8080
```

Ugyanazon a Wi-Fin a telefonod is eléri a géped IP-címén keresztül.

## Mappaszerkezet

```
index.html              a kész, futtatható játék — EZT generálja a build
build.js                node build.js  → összeállítja az index.html-t
serve.js                helyi kiszolgáló teszteléshez
manifest.webmanifest    telepíthető alkalmazás leírója
icon-*.png              alkalmazásikonok
src/
  head.html             a <head> a <style> nyitásáig
  style.css             a teljes stíluslap
  body.html             a HTML törzs
  tail.html             a záró rész
  js/
    _order.json         a modulok összefűzési sorrendje
    00-prologue.js      … 29-menu.js
```

## Miért összefűzés, és nem ES-modul?

A böngésző `file://` protokollon **nem enged** `import`/`export` modult
betölteni (CORS). Ha a forrás igazi ES-modulokból állna, a fájl
duplakattintásra nem indulna el, és a telefonos próbához is mindig kellene
egy kiszolgáló.

Ezért a forrás modulokra van bontva, a kimenet viszont egyetlen önálló
`index.html`. A `build.js` csak összefűz — nem alakít át semmit, így a
futásidejű viselkedés pontosan ugyanaz, mint a bontás előtt volt.

Ha később mégis igazi ES-modulokra váltanánk, az nagyobb átalakítás: a
modulok most közös hatókörön osztoznak (`G` állapot, `ctx`, segédfüggvények),
ezeket export/import kapcsolatokra kellene bontani.

## Munkamenet

1. Módosítasz egy fájlt a `src/js/` mappában
2. `node build.js`
3. Frissíted a böngészőt

Új modul hozzáadásakor vedd fel a nevét a `src/js/_order.json` listába —
a sorrend számít, mert a fájlok egyetlen hatókörbe fűződnek össze.

## iOS-alkalmazás felé

A jelenlegi állapot már **kezdőképernyőre tehető**: iPhone-on Safari →
Megosztás → Hozzáadás a kezdőképernyőhöz. Teljes képernyőn, saját ikonnal
indul, mert a `head` tartalmazza a szükséges `apple-mobile-web-app-*`
címkéket, az ikon pedig adat-URI-ként be van ágyazva.

Igazi App Store-os alkalmazáshoz a szokásos út a **Capacitor**:

```
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/ios
npx cap init Birodalom hu.birodalom.jatek --web-dir=.
npx cap add ios
npx cap sync
npx cap open ios          # Xcode, macOS szükséges
```

Amire figyelni kell iOS-en:

- **Hang:** a WKWebView csak felhasználói mozdulat után enged hangot. A játék
  ezt már kezeli: az `AudioContext` a nemzetválasztó gombra jön létre.
- **Biztonságos zóna:** a `viewport-fit=cover` és az `env(safe-area-inset-*)`
  már be van építve, tehát a bevágás és a home indicator nem takar semmit.
- **Nagyítás és gesztusok:** a vászon `touch-action: none`, a kétujjas
  nagyítás a játéké, nem a böngészőé.
- **Mentés:** fájlba ment és tölt, nem böngészőtárolóba — natív burokban a
  megosztás-lapon keresztül működik.

## Zene

A játékban a **Medieval Song — Village Consort** (No Copyright Music) szól.
A `zene/village-consort.mp3` fájlt a `build.js` base64-ként beépíti az
`index.html`-be, tehát a letöltött fájl önmagában szól.

A lejátszás **két útvonalon** próbálkozik, mert a böngészők eltérően
viselkednek:

1. **Hangelem** — `Blob` + `createObjectURL`. Takarékos: a böngésző
   folyamatosan olvassa be a hangot. (Adat-URI-t szándékosan nem
   használunk: több böngésző nem játszik le több megabájtos
   `data:audio/...` hivatkozást médiaelemből.)
2. **Web Audio** — ha másfél másodperc alatt nem indul el a zene, a játék
   magától átvált `decodeAudioData`-ra. Ez ugyanaz az útvonal, amin a
   hangeffektek szólnak, tehát ha azok hallhatók, ennek is mennie kell.
   Cserébe a dekódolt hang több memóriát foglal.

A ☰ menü **Zene** sora mindig kiírja az állapotot: `betölt…`, `szól`,
`némítva`, `a böngésző blokkolta — koppints`, `hangelem hibázott`,
`a hang dekódolása nem sikerült`. Nincs néma helyettesítés — ha valami
elakad, az látszik.

Kapcsolás: **☰ menü → Zene**, vagy az **N** billentyű.
Zene nélküli összeállításhoz elég törölni a `zene/` mappát.

## Uralkodói arcképek

A `kepek/` mappába tett képeket a `build.js` beépíti az `index.html`-be, és
a rajzolt portré helyett azok jelennek meg. Fájlnév: `nemzet-korszak`,
például `hu-0.png` (Hunyadi Mátyás). A teljes lista a `kepek/OLVASSEL.txt`
fájlban van.

Elfogadott kiterjesztés: `png`, `jpg`, `webp`. A kép négyzet alakú legyen,
256×256 pixel bőven elég — a játék kör alakúra vágja. Amelyik uralkodóhoz
nincs kép, annál marad a rajzolt portré, a kettő keverhető.

## Játéktempó és nehézség

A gazdaság üteme egyetlen helyen állítható, a `src/js/01-util.js` fájl
`PACE` objektumában:

```js
const PACE={ gather:2.2, farm:0.55, speed:0.82, build:1.55, train:1.45, aiIncome:0.42 };
```

A kisebb szám lassabb játékot jelent. Jelenleg egy munkás egy fordulója
(12 nyersanyag) nagyjából 13 másodperc.

A nehézségi fokozatokat ugyanitt a `DIFF` tömb írja le: a bot bevétele, a
rohamok gyakorisága és mérete, valamint hogy kutat-e fejlesztéseket.

## Fejlesztői kapcsolók a játékon belül## Fejlesztői kapcsolók a játékon belül## Fejlesztői kapcsolók a játékon belül

`F1` billentyűlista · `F5`/`F9` gyors mentés és betöltés · `P` szünet ·
`C` billentyűkurzor · ☰ menü a mentéshez, hanghoz, színvakbarát módhoz.

## Platformok

| | útmutató | parancs |
|---|---|---|
| iPhone, iPad | `IOS.md` + képes PDF | `bash ios-setup.sh` |
| Android | `IOS.md` vége | `bash android-setup.sh` |
| Windows asztali | `WINDOWS.md` | `npm run win` |
| Mac asztali | `MAC.md` | `npm run mac` |
| Böngésző | — | nyisd meg az `index.html`-t |
