# Birodalom — Launcher

Önálló indító- és frissítőprogram. Saját telepítője van (`.exe`
Windowson, `.dmg` macOS-en), és a játéktól függetlenül fut.

## Az elrendezés

```
  bal oldalt  — a játékok listája (Birodalom, és ami később jön)
  középen     — a játék képe és neve
  jobb alul   — a nagy gomb
```

A gomb **két szerepet visz**: ha van új változat, `FRISSÍTÉS` felirattal
és zöldes kerettel jelenik meg; ha nincs, `JÁTÉK`. Két külön gomb helyett
egy, mert egyszerre mindig csak az egyik értelmes.

A bal oldali sorban a verzió is látszik — `v1.5 → v1.6`, ha frissítés
vár.

## Mit csinál

1. Elindul, és megnézi, van-e újabb változat.
2. Ha van, a gomb FRISSÍTÉS-re vált; egy kattintás letölti.
3. A **JÁTÉK** gombra elindítja a játékot.

Ha nincs internet, vagy a frissítés nem sikerül, **akkor is lehet
játszani** a meglévő változattal. Egy launcher, ami hálózati hiba miatt
nem enged játszani, rosszabb, mint amelyik nem frissít.

## Beállítás — ezt kell egyszer megcsinálnod

A `frissites.json`-ban add meg, hol lesz a jegyzékfájl:

```json
{ "jegyzek": "https://pelda.hu/birodalom/jegyzek.json" }
```

A jegyzékfájlt te teszed ki egy tárhelyre. Bármi megfelel, ami HTTPS-en
kiszolgál egy fájlt: **GitHub Pages, GitHub Releases**, egy webtárhely.

## Több játék egy launcherben

A bal oldali sáv A JEGYZÉKBŐL épül fel — új játékot úgy adsz hozzá, hogy
beírsz egy bejegyzést. **A launchert nem kell újraépíteni**, és a
játékosoknál a következő indításnál megjelenik.

```json
{
  "jatekok": [
    {
      "id": "birodalom",
      "nev": "Birodalom",
      "alcim": "négy évszázad · tizenkét nemzet",
      "verzio": "2.1",
      "jatek": "https://pelda.hu/birodalom/index.html",
      "exe": "Birodalom",
      "zeneUrl": "https://pelda.hu/birodalom/zene/",
      "zene": ["kalozok.mp3", "marines.mp3"]
    },
    {
      "id": "sakk",
      "nev": "Sakk",
      "alcim": "a királyok játéka",
      "verzio": "1.0",
      "jatek": "https://pelda.hu/sakk/index.html",
      "kep": "https://pelda.hu/sakk/hatter.png"
    }
  ]
}
```

| mező | kell? | mire jó |
|---|---|---|
| `id` | igen | rövid azonosító (betű, szám, `-`, `_`) |
| `nev` | igen | ez látszik a listában |
| `verzio` | igen | ha átírod, a launcher frissítést ajánl |
| `jatek` | igen | az `index.html` közvetlen címe |
| `alcim` | nem | a kép alatt jelenik meg |
| `kep` | nem | saját háttérkép; enélkül a beépített |
| `exe` | nem | a TELEPÍTETT játék mappaneve, ha van ilyen |
| `zene` | nem | fájlnevek; ami már megvan, azt nem tölti le újra |

**Minden játék külön mappába kerül**, tehát nem írják felül egymást. A
hiányos bejegyzéseket (nincs `jatek` vagy `verzio`) a launcher átugorja —
egy elgépelés nem dönti el az egész listát.

A régi, egyjátékos alak (`{ "verzio": …, "jatek": … }`) továbbra is
működik, tehát a már kitett jegyzékfájlok nem romlanak el.

## Frissítés — a hétköznapi menet

1. `node build.js` (a játék 4 MB lesz)
2. Felteszed az `index.html`-t a tárhelyre
3. A jegyzékben átírod a `verzio` mezőt

Ennyi. A játékosoknál a következő indításnál megjelenik.

**A `zene` listát nyugodtan hagyd benne teljesen:** ami már megvan a
gépen, azt a launcher nem tölti le újra. Ezért lesz egy frissítés 4 MB
és nem 21.

## Hova tölt

Egy KÖZÖS mappába, amit a játék is ismer:

```
Windows:  %APPDATA%\Birodalom\jatek
macOS:    ~/Library/Application Support/Birodalom/jatek
```

Ez azért van külön kimondva, mert a launcher és a játék **két külön
alkalmazás**: mindkettőnek más a saját adatmappája. A verziószám melletti
feliratra kattintva megnyílik ez a mappa.

## Telepítő készítése — parancssor nélkül

**Kattints duplán erre a fájlra:**

| rendszer | fájl |
|---|---|
| Windows | `TELEPITO-KESZITES.bat` |
| macOS | `TELEPITO-KESZITES.command` |

Mindent maga intéz: megnézi, megvan-e a Node.js, letölti a szükséges
részeket, összeállítja a telepítőt, és a végén megnyitja a mappát, ahol
megtalálod.

Elsőre pár percig tart, mert le kell töltenie az Electront (~100 MB).
Utána sokkal gyorsabb.

Ha nincs Node.js a gépen, szól, és megnyitja a letöltési oldalt. Egyszer
kell telepíteni, az „LTS" jelölésű változatot, végig alapértelmezetten.

**macOS-en** első alkalommal jobb gomb a `.command` fájlon → Megnyitás
(a rendszer így engedi futni).

### A kész telepítő

```
kimenet/Birodalom-Launcher-1.0.0-telepito.exe    (Windows)
kimenet/Birodalom-Launcher-1.0.0.dmg             (macOS)
```

Erre kattintva települ a launcher. **Ezt küldheted a barátaidnak** — nekik
már semmiféle parancssor vagy Node.js nem kell, csak a telepítőt
indítják, mint bármely más programot.

### Ha az összeállítás megakad

**„Cannot create symbolic link" / „nincs meg a szükséges joga"**

Az `electron-builder` letölt egy aláíró csomagot, amiben macOS-es
szimbolikus hivatkozások vannak — azokat a Windows csak emelt joggal
tudja kicsomagolni.

Ez a csomag nekünk NEM kell (nincs tanúsítványunk, nem írunk alá
semmit), ezért a `.bat` mostantól kikapcsolja a keresését. Ha mégis
előjönne:

1. Töröld ezt a mappát — `Win+R`, majd beilleszted:
   `%LOCALAPPDATA%\electron-builder\Cache`
2. Jobb gomb a `.bat` fájlon → **Futtatás rendszergazdaként**

**Bármilyen más hiba** esetén is érdemes először a `Cache` mappát
törölni, és újra megpróbálni.

### Az „ismeretlen kiadó" figyelmeztetés

Első indításkor a rendszer figyelmeztet. Ez nálunk normális: nincs
megvásárolt kódaláíró tanúsítványunk.

- **Windows:** További információ → Futtatás mindenképp
- **macOS:** jobb gomb az alkalmazáson → Megnyitás → Megnyitás

Ha ez zavaró, tanúsítványt lehet venni (évi díj) — Windowson kb. 200–400
dollár évente, macOS-en 99 dollár. Baráti körben nem éri meg.

### Ha parancssorból csinálnád

```
cd launcher
npm install
npm run win     # vagy: npm run mac
```

**A telepítőt azon a rendszeren kell építeni, amelyikre szól.** A
Windows-telepítőhöz Windows kell, a `.dmg`-hez macOS.

## Mit NEM frissít

A játék **keretét** (az Electront). Ahhoz új telepítő kell — de arra
ritkán van szükség, mert a keret alig változik. Ami hetente változik, az
a játék maga, és azt a launcher intézi.

## Ha nincs telepített játék

A launcher önmagában is használható: ilyenkor **saját ablakban** nyitja
meg a letöltött játékot. Így elég csak a launchert telepíteni, és a
játék a hálózatról érkezik.
