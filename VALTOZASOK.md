## 3.2 — Öt kalózmód-javítás · 2026-08-13

### Pixeles/széteső textúra a térképen

A köd közbenső vásznát `imageSmoothingQuality: 'high'` nélkül rajzoltuk
ki — a böngésző alapértelmezése `'low'`, ami a 32×32-es cellahatárokat
láthatóan meghagyta nagyítva. Mindkét helyen (köd-előkészítés és
kirajzolás) `'high'`-ra állítottuk.

### A karakterleírás a flottasáv alá kerül

A `#bio` panel és a `#fleetBar` (flottasáv: BRIGG 117 fő stb.) mindkettő
`z-index: 14` volt, és ugyanazon a bal oldalon ültek. A bio panel
`z-index`-ét 14 → 20-ra emeltük.

### Városfoglalás nem működik kalózmódban

A `varosDontesJogos()` és a `partraSzallasTick()` szárazföldi katonát
követelt meg a város közelében — de kalózvilágban csak hajók vannak. A
dialóg megnyílt, de a gombra kattintáskor néma visszatérés történt.

**Javítás:** tengeri egységek is érvényes támadók, 320 px-es hatótávval
(szárazföldi: 200 px). Mindkét ellenőrző helyen egységes a logika.

### Kard-kurzor nem jelent meg

Két hiba egyszerre:
- A `data:image/svg+xml;utf8,` encoding nem szabványos; Chrome 95+ és
  újabb Electron nem fogadja el CSS `cursor`-ban. Base64-re cseréltük.
- Az ikon csak városok felett jelent meg, ellenséges hajók felett nem.
  Kibővítettük: hajó sugara × 1.8 körön belül szintén kard látszik.
- `portOwner` `null`-t ad tulajdonos nélküli városokra — ezeket
  mostantól kihagyjuk.

### Partraszállás látványa hiányzott

A legénység csendben szállt partra. Új `partra` effekttípus:
- fehér vízfröccsenő oszlop parton (minden egységnél)
- belső gyűrű azonnal, külső gyűrű 0.18 mp késéssel
- közbülső splash a hajó és a part között

### Automatikus alagút (cloudflared) a launcherben

A launcher korábban csak kereste a cloudflared-et, de nem töltötte le.
Az asztali játék teljes `cfBeszerez()` logikája bekerült a launcherbe is:
ha nincs meg, automatikusan letölti (~30 MB, egyszer, a megfelelő
platformra), majd elindítja az alagutat. Ettől különböző hálózatokon is
működik a többjátékos, CMD-parancs és kézi IP-beírás nélkül.

---

# Birodalom — változásnapló

A játék változatszáma a menü jobb alsó sarkában látszik, a teljes napló
pedig a **Újdonságok** menüpontban.

A számozás két részből áll:

- **fő verzió** — akkor nő, ha a játék szerkezete változik (új mód, új korszak)
- **alverzió** — minden patchnél

---

## 3.1 — A frissítésfigyelő a legfelső rétegbe · 2026-08-12

Az ablak a menü tetejére csúszott, és a sötétítés nem látszott mögötte.

### Az ok

Az elemet a `#mainMenu` ELÉ tettem a szerkezetben. A menü viszont saját
rétegben ül, és a maga z-indexével a figyelmeztető doboz FÖLÉ került.

Két dolog kellett hozzá: az elem a törzs VÉGÉRE (ott már semmi nem jön
utána), és jóval magasabb réteg — 60 helyett 9999. A sötétítés is
erősebb lett, hogy egyértelmű legyen: amíg be nem zárod, ez az ablak a
soron.

---

## 3.0 — A launcher is tud szervert indítani · 2026-08-12

A többjátékos mód használhatatlan volt annak, aki CSAK a launchert
telepítette.

### Az ok

A launcher, ha nem találja a telepített játékot, a SAJÁT ablakában nyitja
meg a letöltöttet. Annak az ablaknak viszont nem adtunk hidat, és
`szerver.js` sem volt a launcher mellett.

```
launcher  →  saját ablakban megnyitja a játékot  →  nincs híd
                                                     ↓
                        „A szerver nem érhető el ezen a címen"
```

A beépített szerver a JÁTÉK telepítőjében volt, nem a launcherben — tehát
csak akkor működött, ha a játék külön fel volt telepítve.

### A javítás

A `szerver.js` mostantól a launcher mellett utazik, és a saját
játékablaka megkapja a hidat. Így **telepített játék nélkül is** megy a
többjátékos: elég csak a launchert telepíteni.

Az alagút (`cloudflared`) is működik, ha a gépen már megvan — a launcher
nem tölti le, csak használja.

### Ellenőrzés

```
a launcher szerverkezelői : mind a három megvan
szerver.js a launcher mellett : ott van
indítás                   : elindult a 8599-es kapun
tényleg figyel?           : a kapu nyitva
a játékablak hídja        : megvan és használatban
```

Külön kimértem a teljes lobbyt is valódi szerverrel: lekérdezés,
szobanyitás, csatlakozás kóddal, indítás, szinkron — mind rendben.

### Ami ebből tanulság

A hibát nem a lobby kódjában kellett keresni: az mindvégig jó volt. A
kérdés az volt, hogy **melyik ablakban fut a játék**, és van-e ott mivel
elindítani a szervert. Amikor egy funkció „nem működik", érdemes előbb
megnézni, hogy a környezete egyáltalán adott-e hozzá.

---

## 2.9 — A legénység partra szállhat · 2026-08-12

Megvolt a lánc hiányzó szeme, amiért nem lehetett várost elfoglalni.

### Csak a szlúp tudott katonát kitenni

A kirakodó parancs a `cargo` rekeszt kereste — az viszont CSAK a
szállítóhajónak van. A hadihajónak és a gályának van LEGÉNYSÉGE (120 és
340 fő), de az addig csak az átszállásnál számított.

Tehát a városfoglaláshoz kötelező volt a szlúp, és aki hadihajóval ment
oda, annak semmi nem történt. Semmi nem jelezte, hogy miért.

### Mostantól a matrózok kiszállhatnak

Hajónként legfeljebb **négy** katona, fejenként 18 fő legénységből. A
kitett matróz valódi közelharci egység: harcol és meghalhat.

```
hadihajó (120 fő)  →  4 matróz, a legénység 48-ra csökken
húsz próbálkozás   →  30 fő marad a fedélzeten (nem fogyhat el)
szlúp              →  változatlanul a cargo-t rakja ki
```

**A legénység nem fogyhat el:** húsz fő mindenképp a fedélzeten marad —
hajót vezetni is kell valakinek. A gyengülés valódi ár: kevesebb
legénységgel az átszállás is gyengébb.

A szlúpnak így is marad értelme: több egységet visz, és nem gyengül tőle
a flotta.

### A teljes lánc most már működik szlúp nélkül

```
sortűz → tornyok ledőlnek → lakosság kifogy → a város megnyílik
  → a hadihajó legénysége partra száll → legyőzi a helyőrséget
  → a döntés megnyílik → a város a tiéd
```

Kimérve, végig, egyetlen hadihajóval.

---

## 2.8 — Növényzet az épületek alól · 2026-08-12

A fűcsomók és bokrok a falakból nőttek ki: a kezdőbázis és a később
épített házak fölött ott maradtak a díszek.

### Az ok

A növényzetet a világ létrehozásakor szórjuk ki, és **soha nem néztük
meg, hova kerül majd épület**. A rajzolás y-sorrendben megy, tehát a
házzal egy magasságban álló fűcsomó a fal ELÉ került.

### A javítás

Építéskor kitakarítjuk az alapterületet. Két apróság számított benne:

**Az épületek FELFELÉ rajzolódnak** a talppontjuktól — a fal teteje jóval
a saját y koordinátája fölött van. Ezért a takarítás a magasságot is
figyelembe veszi (a `BH` táblából), nem csak az alapterületet.

**A hálózati szinkron nem sérül**, mert ez a szimuláció állapotából
következik: hol áll épület. Minden gépen ugyanaz.

### Ellenőrzés

```
új játék, erdős pálya : 308 dísz a pályán, ebből ÉPÜLETBEN: 0
később épített ház    : kitakarít maga alól
a pálya többi része   : érintetlen
determinizmus         : hat féllel azonos
hálózati szinkron     : a 920. lépésig
```

---

## 2.7 — Az elcsúszott textúra · 2026-08-12

A fűszövet a pálya szélén hirtelen átugrott, és „elcsúszottnak" látszott
— alapjátékban és kalózvilágban egyaránt.

### Az ok: a saját v2.3-as javításom

A talajmintázat úgy igazodik a világhoz, hogy a rajzolást elcsúsztatjuk a
kamera helyzetének csempén belüli maradékával. Ez addig jó, amíg a kamera
POZITÍV — a v2.3-ban viszont megengedtem, hogy kimenjen a pálya bal és
felső széle mögé.

A JavaScript `%` operátora negatív számnál negatív maradékot ad, és a
mínusz előjellel együtt **pozitívba fordult**:

```
kamera  -205  →  eltolás  -51   (a hibás érték:  +13)
kamera   -13  →  eltolás  -51   (a hibás érték:  +13)
kamera   205  →  eltolás  -13   (ez jó volt)
```

Egy pozitív eltolás egy egész csempényit ugrat a szöveten — pontosan a
pálya szélén, ahova a saját ráhagyásom engedte a kamerát.

A javítás a matematikai (mindig nem-negatív) maradék.

### Ellenőrzés

Írtam egy próbát, ami a pálya négy sarkában és középen lerajzolja a
talajt, és megnézi a szövet eltolását. Mindkét játékmódban rendben.

**Egy tanulság a próbáról:** elsőre MINDEN eltolást vizsgáltam, köztük a
kameráét is — az viszont jogosan nagy, tehát álhibát jelzett. A mérésnek
tudnia kell, mit néz.

### Ami ebből általánosítható

Amikor egy addig mindig pozitív érték negatívvá válhat, végig kell nézni,
hol számol vele a kód. A `%` és a bitműveletek másképp viselkednek
negatívval; a `Math.floor` viszont helyesen — ezért a többi csempeszámítás
nem romlott el.

---

## 2.6 — Harci állás, szélesebb sáv, kard-mutató · 2026-08-12

### A harci állás sem emelődött ki — ugyanaz a hiba

Az alakzatnál megtalált gyorsítótár-hiba a HARCI ÁLLÁST is érintette, és
az előző javításom nem fogta meg: `G.stance`-t tettem az ujjlenyomatba,
csakhogy az állás az EGYSÉGEKEN él (`u.stance`), nem a G-ben. A `G.stance`
sosem változott, tehát a gomb ugyanúgy nem emelődött ki.

Most a kijelölt egységek tényleges állását vesszük. Mérve: kattintásra az
állás beáll, a gomb kiemelődik, másikra váltva az előző elenged.

**Tanulság:** amikor egy gyorsítótár kulcsát javítom, nem elég beírni egy
hasonló nevű változót — meg kell nézni, hol él VALÓJÁBAN az állapot.

### A parancssáv duplán széles

`min(700px, 58vw)` → `min(1180px, 84vw)`. Így az összes gomb egy sorban
elfér, nem kell oldalra görgetni.

### Kard-mutató az ellenséges város fölött

Kalózvilágban a városok nem szokásos épületek: nem lehet rájuk kattintva
„megtámadni" őket, mint egy kaszárnyát. Eddig semmi nem jelezte, hogy ott
egyáltalán van tennivaló.

Mostantól, ha ellenséges város fölé viszed az egeret, a mutató **karddá**
változik.

---

## 2.5 — Négy javítás a képernyőn és a tengeren · 2026-08-12

### A parancssáv egy sorba került

A két sor még mindig sok üres helyet hagyott: a félig telt második sor
csúnyán lógott. Most **egy sor**, vízszintes görgetéssel, rögzített
gombszélességgel — így a sáv magassága ÁLLANDÓ, nem ugrál kijelölésenként.

### A menü nem lóg bele a hírnévbe

A legördülő menü és a hírnévmérő is a jobb szélen, függőlegesen középen
ült. A menü mostantól alulról nyílik, és alacsony ablakban görgethető.

### A flotta megáll a sortűz gyűrűjén

Eddig a hajó a kattintás pontjáig hajózott — ha a város mellé
kattintottál, a partig ment, és a parti ütegek szétlőtték. Márpedig a
hajó dolga a TÁVOLI sortűz; azért kapott a város nagyobb lőtávot, hogy a
közeledés kockázatos legyen.

Mostantól a célpont automatikusan kifelé tolódik a gyűrűre (280 px), ha
idegen kikötő közelébe esne. **Kivétel:** ha a város már nyitva áll
(tornyok ledőltek, lakosság elfogyott), a hajó mehet a partig — ott már
a kirakodás a feladat.

Mérve: városra kattintva 280 px-re áll meg, 600 px-ről nem nyúlunk a
célhoz, nyitott városnál és szárazföldi egységnél sem.

### A szobalista is elindítja a beépített szervert

A beépített szerver eddig csak a „Szoba nyitása" gombra indult. Aki
viszont előbb a **„Nyitott szobák lekérdezése"** gombot nyomta meg — ami
a lap tetején van, tehát természetes első lépés —, az azt látta, hogy „a
szerver nem érhető el ezen a címen". Pedig a saját gépén ott a szerver,
csak épp nem futott.

### Két tanulság a hibakeresésből

**A `src/js/*.js` fájlok TÖREDÉKEK.** A build fűzi őket egyetlen
szkriptté, egy IIFE-vel körülvéve. Ezért a `node --check` rajtuk MINDIG
hibát jelez, akkor is, ha a kód jó — húsz percet vitt el, mire ezt
felismertem. Az ellenőrzés helye a KÉSZ `index.html`.

**A bundle egyetlen hatókör.** A `const hid` nevet már használta a
„Szoba nyitása" gomb, és az én új `hid`-em ütközött vele. Külön
fájlokban lévő kód is ugyanabba a névtérbe kerül.
---

## 2.4 — A méretküszöb túl szigorú volt · 2026-08-12

A launcher „A letöltött fájl sérült" hibával utasította el a második
játékot, pedig a fájl ép volt.

### Az ok

Az ellenőrzést a Birodalomra szabtam — az 4 MB —, és **500 kB-ban**
húztam meg az alsó határt. Egy kisebb játék viszont simán elfér 100-200
kilobájtban, és a launcher sérültnek mondta.

Klasszikus eset: egy szám, ami az EGYETLEN ismert példához igazodott,
és rosszul általánosított.

### A javítás

Az ellenőrzésnek nem a méret a lényege, hanem hogy **teljes HTML-t**
kaptunk-e. Amit ki akarunk szűrni:

| | hogyan fogjuk meg |
|---|---|
| félbeszakadt letöltés | nincs meg a lezáró jel a fájl végén |
| 404-es hibaoldal | apró, és nem HTML-lel kezdődik |
| JSON hibaüzenet | nem HTML-lel kezdődik |
| üres válasz | nulla hosszú |

A méret így csak durva szűrő maradt (8 kB), a valódi próba a TARTALOM: a
fájl eleje `<html>` vagy `<!doctype`, a vége `</html>`.

### Ellenőrzés

```
kis játék, 30 kB          → elfogadja
nagy játék, 4 MB          → elfogadja
lezárás után újsor        → elfogadja
nagybetűs jelölők         → elfogadja
félbeszakadt letöltés     → elutasítja
404-es hibaoldal          → elutasítja
JSON hibaüzenet           → elutasítja
üres fájl                 → elutasítja
```

A játék burkában ugyanez az ellenőrzés futott — azt is igazítottam,
különben ugyanaz a hiba jött volna elő ott is.
---

## 2.3 — Öt javítás a játékmenetben · 2026-08-12

### A parancssáv nem takar el fél képernyőt

Régen 430 pixel széles volt, és a gombok korlátlanul tördelődtek — munkás
kijelölésekor (tíz-egynéhány épület) ez a képernyő jó részét elvette.

Most szélesebb doboz (`min(700px, 58vw)`) és kisebb gombok (52 → 44
magas), a sor pedig **legfeljebb két soros**; ami nem fér, azt görgetéssel
éred el. A szélesítés miatt gyakorlatilag minden befér.

### A kamera kimehet a pálya széléről

Eddig pontosan a határig ment, tehát a legszélső épület a képernyő
legszélére került, félig a felület alá. Most a látótér 18%-ával lehet
kimenni — mérve 205 pixel mindkét irányba. A ráhagyás a nézet méretéhez
igazodik, tehát nagy felbontáson és kicsiben is ugyanúgy érződik.

### A cukornád csak a kalózvilágban

A karibi ültetvénynek a magyar alföldön nincs keresnivalója. A `kalozCsak`
jelölés kiveszi az alapjáték listájából — és nem csak a gombot: a
`startPlacing` KÖZÖS kapujában is szűrünk, különben a `C` gyorsbillentyű
továbbra is elindította volna.

### Az alakzatok: a hatás megvolt, a felület hazudott

Ez volt a legérdekesebb. Kimérve az alakzatok mindig is működtek:

```
vonal    lövész +10% lőtáv
ék       +12% sebzés, +12% sebesség   (9,0 → 10,3 sebzés)
négyszög +2 páncél, 0,85× sebesség
```

A baj a `syncUI` gyorsítótárában volt. Az egy „ujjlenyomatot" számol az
UI állapotáról, és ha az nem változott, KILÉP — így nem építi újra a
gombokat hatvanszor másodpercenként. Csakhogy **az alakzat és a kijelölés
kimaradt az ujjlenyomatból**.

Ezért kattintásra a gomb nem emelődött ki, és a panel néha meg sem
jelent. A játékos joggal hitte, hogy nem történik semmi — pedig a katonái
már négyszögben álltak.

**A tanulság általános:** egy gyorsítótár csak akkor helyes, ha a kulcsa
lefedi az összes megjelenített állapotot.

### A botok gyengébbek

A közepes (ez az alapértelmezés) korábban 0,72-es jövedelemmel és 1,4-es
hullámszorzóval gyakorlatilag a nehéz kistestvére volt. Mindhárom szint
visszavett:

| | jövedelem | roham-szorzó | méret |
|---|---|---|---|
| Könnyű | 0,50 → **0,34** | 1,9 → **2,6** | −2 → **−3** |
| Közepes | 0,72 → **0,55** | 1,4 → **1,9** | −1 → **−2** |
| Nehéz | 1,0 → **0,82** | 1,0 → **1,25** | 0 → **−1** |

Öt perc alatt, a játékos beavatkozása nélkül a bot serege: **10 / 13 / 16**
katona. A skála most szépen lépcsőzik, és a közepes valóban hagy
építkezni.

### Egy hiba, amit magam vittem be

A kamera ráhagyását előbb írtam meg, mint ahogy deklaráltam volna a
`const`-ot — a `resize()` már az induláskor elszállt rajta, és az EGÉSZ
szkript megállt. A `const` nem „hoisztolódik" használható értékkel.
Ugyanaz a hibafajta, amit a `PARANCS_TABLA`-nál egyszer már megfogtunk: a
sorrend számít.
---

## 2.2 — Több játék a launcherben · 2026-08-12

A bal oldali sáv eddig a KÓDBÓL épült fel: egy Birodalom-sor, alatta egy
állandó „Kalózvilág — hamarosan" felirat. Új játékot csak a launcher
újraépítésével lehetett volna hozzátenni.

Mostantól **a jegyzékből épül fel**. Új játékot úgy adsz hozzá, hogy
beírsz egy bejegyzést a jegyzékfájlba — a launchert nem kell újraépíteni,
és a játékosoknál a következő indításnál megjelenik.

```json
{
  "jatekok": [
    { "id": "birodalom", "nev": "Birodalom", "verzio": "2.1",
      "jatek": "https://.../index.html", "exe": "Birodalom" },
    { "id": "sakk", "nev": "Sakk", "alcim": "a királyok játéka",
      "verzio": "1.0", "jatek": "https://.../sakk/index.html",
      "kep": "https://.../sakk/hatter.png" }
  ]
}
```

Minden játéknak lehet **saját háttérképe** (`kep`), saját alcíme, és a
gomb mindig a KIVÁLASZTOTT játékra vonatkozik.

### Amire figyeltem

**Külön mappa játékonként.** Enélkül a második játék felülírta volna az
elsőt: mindkettő `index.html` néven érkezik. A Birodalom marad a régi
helyén, hogy a már letöltött változat ne vesszen el.

**Hiányos bejegyzés nem dönti el a listát.** Aminek nincs `jatek` vagy
`verzio` mezője, azt átugorjuk — egy elgépelés miatt ne tűnjön el az
összes játék.

**Rosszindulatú azonosító.** Az `id`-ből kiszűrjük, ami nem betű, szám,
`-` vagy `_`. A próbában a `../../gonosz` azonosító nem tudott a mappán
kívülre írni.

**A régi alak is működik.** Az egyjátékos jegyzék
(`{ "verzio": …, "jatek": … }`) továbbra is érvényes, tehát a már kitett
fájlok nem romlanak el.

### Egy tanulság a próbáról

Kilenc új próba mind elbukott elsőre — „Nincs mit letölteni". Kiderült,
hogy **a próba volt hibás**: az Electron `handle` kezelőinek első
paramétere az esemény, az azonosító csak a második. Én az elsőnek adtam.

Érdemes volt ellenőrizni, mert a hibaüzenetből ugyanúgy tűnhetett volna
valódi hibának.
---

## 2.1 — Az istálló, ami feketévé tette a képernyőt · 2026-08-12

Három tünetet jelentettél, és mind egyetlen okra vezetett vissza.

### A gyökér: az istálló hiányzott a magasságtáblából

A `BH` tábla mondja meg, milyen magas egy épület — a rajzoló ebből
számolja ki, mikor kell áttetszővé tenni egy takaró épületet. Az
ISTÁLLÓ a v7.4-ben került a játékba, de **ebbe a táblába sosem került
be**.

Amint egy istálló a képre került, a `BH[e.type][e.age]` `undefined[0]`-ra
futott, és az egész világrajzolás elszállt.

### Innen jött mind a három tünet

| tünet | miért |
|---|---|
| „rajzolási hiba", majd látszik az egész világ | a rajzolás elszállt, a köd nem került a képre |
| új meccsnél fekete képernyő | a hibás réteg VÉGLEGESEN kikapcsolt — a következő játszmára is |
| a pálya villódzik, hol sötétebb, hol világosabb | ettől független, lásd lentebb |

**A végleges kikapcsolás önmagában is hiba volt.** A védőburok arra való,
hogy egy elszálló réteg ne vigye magával az egész képet — nem arra, hogy
örökre elvegye. Új játszmánál mostantól minden réteg visszakapcsol.

### A villódzás: külön ok

A `G.lowFx` MAGÁTÓL kapcsolgat a képfrissítés szerint: ha esik a
sebesség, bekapcsol, ha javul, kikapcsol. Az általam a v9.0-ban
hozzáadott terep-réteg (magaslat, mocsár) pedig csak `lowFx` nélkül
rajzolt — így a réteg jött-ment, és a pálya villódzott.

Márpedig a terep nem díszítés: a magaslat és a mocsár a JÁTÉKMENETET
érinti, tehát mindig látszania kell. Mostantól a `REDUCED`-hoz kötjük,
ami beállítás, nem ingadozik.

### Egy másik hiba, ami közben került elő

A lovas rajzolója a `fwd(pose)` eredményét SZÁMKÉNT szorozta — csakhogy
az objektumot ad vissza (`{x, y}`). Objektum × szám = NaN, tehát minden
lovas NaN-koordinátákkal rajzolódott. A vászon az ilyen parancsokat
csendben eldobja, ezért nem szállt el semmi: a ló egyszerűen hiányzott.

Ez a v7.4 óta így volt. Végigkerestem, hogy máshol is előfordul-e
ugyanez a hibafajta — nem fordul elő.

### Ami ebből tanulság

Két kézzel írt tábla (`BUILDS` és `BH`) előbb-utóbb szétcsúszik, ha az
egyik bővül. Ezért a magasságot mostantól a `bhOf()` adja: ha hiányzik a
bejegyzés, ésszerű alapértéket ad ahelyett, hogy elszállna. A táblát
persze így is ki kell egészíteni — ez csak a háló.

Írtam egy próbát is, ami szigorú vászon-utánzattal keresi a NEM VÉGES
rajzparancsokat. Ez fogta meg a lovas NaN-jait, amiket három hónapja
egyetlen mérés sem vett észre.
---

## 2.0 — Két program, két mappa · 2026-08-12

### Egy ütközés, ami végtelen kört okozott volna

A launcher és a játék **ugyanazzal a névvel** telepedett volna:
`%LOCALAPPDATA%\Programs\Birodalom`. Két baj lett volna belőle:

1. Amelyiket másodszor telepíted, felülírja az elsőt.
2. A launcher épp ezt az útvonalat keresi játékként — ütközés esetén
   **önmagát indította volna el**, újra és újra.

A launcher mostantól `Birodalom Launcher` néven, külön mappába települ.
A biztosíték is bekerült a kódba: ha az indítandó fájl azonos a saját
futtatható állományunkkal, kihagyjuk. A nevet szétválasztottuk, de egy
későbbi átnevezés vagy egy régi telepítés újra összehozhatná őket.

**Ha már telepítetted a launchert, telepítsd újra** az új névvel —
különben a régi bejegyzés ott marad a Programok listájában.

### A feltöltendő csomag

Készült egy `feltoltendo.zip`, amiben pontosan az van, ami a tárhelyre
kell:

```
index.html      4 MB     a játék
zene/          16 MB     nyolc sáv — egyszer töltődik le
jegyzek.json             a verziószám és a címek
```

A `jegyzek.json`-ban két helyen kell átírni a `IDE-JON-A-CIMED` részt a
saját címedre. Onnantól minden frissítés annyi: felteszed az új
`index.html`-t, és a jegyzékben átírod a `verzio` mezőt.
---

## 1.9 — Az aláírás kikapcsolása · 2026-08-12

A telepítő összeállítása Windowson elbukott:

```
Cannot create symbolic link : Az ügyfélnek nincs meg a szükséges joga
```

### Az ok

Az `electron-builder` letölti a `winCodeSign` csomagot, hogy
tanúsítványt keressen a gépen. Abban a csomagban **macOS-es szimbolikus
hivatkozások** vannak (`libcrypto.dylib`, `libssl.dylib`), és azokat a
Windows csak emelt joggal tudja létrehozni. Négyszer újrapróbálta, majd
feladta.

A bosszantó az, hogy **ez a csomag nekünk nem is kell**: nincs kódaláíró
tanúsítványunk, tehát nem írunk alá semmit. Csak azért töltötte le, mert
alapból megpróbál keresgélni.

### A javítás

A `CSC_IDENTITY_AUTO_DISCOVERY=false` megmondja neki, hogy ne
keresgéljen. Beállítva két helyen:

- a `TELEPITO-KESZITES.bat`-ban — így a kattintós út magától jó
- a `package.json` scriptjeiben — így a parancssoros út is

Kimérve: a beállítással **elmarad a `winCodeSign` letöltése**, tehát a
hiba fel sem merülhet.

### Ráadás

A `.bat` hibaüzenete is pontosabb lett: ha mégis szimbolikus
hivatkozásra panaszkodna valami, megmondja a két teendőt (gyorsítótár
törlése, rendszergazdai futtatás) — nem csak általánosságban a
gyorsítótárat emlegeti.

A `package.json`-ba bekerült a szerző mezője is, amit az
`electron-builder` hiányolt.
---

## 1.8 — Telepítőkészítés parancssor nélkül · 2026-08-11

Két új fájl a `launcher` mappában, amikre duplán kell kattintani:

```
Windows :  TELEPITO-KESZITES.bat
macOS   :  TELEPITO-KESZITES.command
```

Mindent maguk intéznek: megnézik, megvan-e a Node.js, letöltik a
szükséges részeket, összeállítják a telepítőt, és megnyitják a mappát,
ahol megtalálod. Ha nincs Node.js, szólnak, és megnyitják a letöltési
oldalt.

**Fontos különbség, amit érdemes kimondani:** a launcher A JÁTÉKOSOKNAK
eddig sem igényelt parancssort — az már eleve egy telepíthető exe. A
parancssor csak a telepítő ELKÉSZÍTÉSÉHEZ kellett, egyszer, neked.
Mostantól az sem.

### Amit megpróbáltam, és nem sikerült

Nekifutottam, hogy eleve kész telepítőt adjak. A csomagolás lefutott, és
egy `.exe` létre is jött — csakhogy **0,6 MB lett a várt 100 helyett**: a
tömörítési lépés csendben elbukott, mert az `app-builder` bináris nem tud
futni ebben a rendszerben.

Egy csonka telepítő rosszabb, mint a hiánya: elindulna, és félkész
programot rakna föl. Ezért töröltem, és inkább azt csináltam meg, hogy
neked egy kattintás legyen elkészíteni.

### Egy apró, de fontos részlet

A `.bat` fájl **Windows-sorvégekkel** (CRLF) készült. Unix-sorvégekkel a
parancsértelmező elszállhat a `for` és `if` blokkoknál — és ez a
legrosszabb fajta hiba, mert néha működik, néha nem. Kimérve: 102 CRLF,
egyetlen magányos sorvég sem.

### Az aláírásról

A telepítő aláírás nélkül készül, tehát első indításkor a rendszer
figyelmeztet („ismeretlen kiadó"). Tanúsítvány évi 99 dollártól
(macOS) vagy 200–400 dollártól (Windows) kapható — baráti körben nem
éri meg. A leírás megmondja, hogyan kell ilyenkor elindítani.
---

## 1.7 — A launcher elrendezése · 2026-08-11

A launcher az ismerős felépítést kapta:

```
  bal oldalt  — a játékok listája
  középen     — a játék képe és neve
  jobb alul   — a nagy gomb
```

### A gomb két szerepet visz

Ha van új változat, **FRISSÍTÉS** felirattal és zöldes kerettel jelenik
meg; ha nincs, **JÁTÉK**. Két külön gomb helyett egy, mert egyszerre
mindig csak az egyik értelmes — így nem kell választani.

A bal oldali sorban a verzió is látszik: `v1.5 → v1.6`, ha frissítés vár.

### A kép

Rajzoltam egy fő képet: alkonyati égen ellenfényben álló vár, három
zászlóval, előtte felsorakozott sereg. A nap a vár MÖGÖTT kel — ez adja a
sziluettet.

Elsőre a nap a horizont alá került, és a kép lapos maradt. A rétegek
sorrendje adja a mélységet: ég → nap → távoli hegyek → vár → föld →
sereg.

### A telepítő

A csomagolás lefutott, a `Birodalom.exe` létrejött, és minden fájl a
helyén van (`app.asar`-ban a launcher, mellette a `frissites.json`).

A TELEPÍTŐ összeállítása viszont nem futott le itt: az aláírási lépéshez
Windows-bináris kell. Ez nem hiba a beállításban — a telepítőt azon a
rendszeren kell építeni, amelyikre szól:

```
cd launcher && npm install
npm run win     # Windowson
npm run mac     # macOS-en
```

A `mac` aláírás nélkül készül, tehát első indításkor jobb gomb →
Megnyitás kell. Aláírt változathoz Apple fejlesztői tanúsítvány
szükséges.
---

## 1.6 — Önálló launcher · 2026-08-11

Külön program, saját telepítővel (`.exe` Windowson, `.dmg` macOS-en). Az
a dolga, hogy naprakészen tartsa a játékot, és elindítsa.

```
Frissítés keresése…  →  Új változat: v1.6  →  2.4 MB / 4.0 MB  →  JÁTÉK
```

### Miért lett külön program

Először a játék burkába építettem: egy launcher-ablak, ami átadja a
helyét a játéknak. Egyetlen telepítő, egyetlen Electron-motor.

A kérés viszont **valóban önálló** launcher volt — ahogy a nagy
játékoknál —, ezért átépítettem. Az ára: két Electron-alkalmazás két
motort jelent, tehát összesen nagyobb a telepítés. Cserébe a launcher
akkor is működik, ha a játék nincs telepítve: ilyenkor saját ablakban
nyitja meg a letöltött játékot.

### A közös mappa — ez a legkönnyebben elrontható pont

A launcher és a játék **két külön alkalmazás**, tehát mindkettőnek MÁS a
saját adatmappája. Ha a launcher a megszokott helyre töltene, a játék
sosem találná meg. Ezért a közös helyet kézzel adjuk meg:

```
Windows:  %APPDATA%\Birodalom\jatek
macOS:    ~/Library/Application Support/Birodalom/jatek
```

Mindkét oldalt külön kimértem: a launcher oda tölt, a játék onnan indul.

### Amire figyeltem

**Sérült letöltés.** Egy félbeszakadt fájl is létrejön a lemezen, tehát a
puszta létezés semmit nem bizonyít. A letöltés `.reszleges` néven
érkezik, és csak akkor kerül a helyére, ha elég nagy ÉS megvan a `</html>`
vége. A próbában csonka fájlt küldő szerver ellen: elutasította, és a
régi játék érintetlen maradt.

**Hálózati hiba nem tilt ki a játékból.** Ha a frissítés nem sikerül, a
launcher szól róla, de a JÁTÉK gomb továbbra is aktív. Egy launcher, ami
hálózati hiba miatt nem enged játszani, rosszabb, mint amelyik nem
frissít.

**Rosszindulatú jegyzék.** A zenefájlok nevéből kiszűrjük az
útvonal-elválasztót és a `..`-t: enélkül egy elrontott vagy szándékosan
rossz jegyzék a mappán KÍVÜLRE írathatna velünk. A próbában a
`../../gonosz.mp3` és a `/etc/rossz.mp3` kimaradt, a `rendes.mp3`
letöltődött.

**A zene egyszer jön át.** Ami már megvan, azt nem tölti le újra —
mérve: második frissítésnél nulla zenei letöltés. Ezért lesz egy
frissítés 4 MB és nem 21.

### A hétköznapi menet

1. `node build.js`
2. Felteszed az `index.html`-t a tárhelyre
3. A jegyzékben átírod a `verzio` mezőt

A játékosoknál a következő indításnál megjelenik. Részletek:
`launcher/OLVASSEL.md`.

### Ellenőrzés

Tizenhat próba a launcheren (első letöltés, ismételt, naprakész, sérült,
hálózat nélkül, rosszindulatú jegyzék) és négy a játék oldalán (megtalálja-e
a letöltöttet, visszaesik-e a beépítettre) — mind rendben.

---

## 1.5 — A zene külön fájlba · 2026-08-11

Előkészítés a frissítőhöz: a játék 26 MB volt, ebből **21 MB a beépített
zene**. Minden frissítés ekkora letöltés lenne, pedig a zene sosem
változik.

```
index.html      26,0 MB  →  4,0 MB
```

### Hogyan

A zene mostantól külön mp3-akban él, és a játék akkor kéri le, amikor
először szüksége van rá. A letöltött sávot megjegyzi: egy játszmán belül
csak egyszer jön át.

Egy új függvény (`hangKer`) intézi, és három forrásból tud dolgozni,
ebben a sorrendben:

1. a HTML-be sütött adat (ha `--embed`-del készült)
2. a már letöltött sáv a pufferből
3. a `zene/` mappa

Ha egyik sincs, a játék **néma marad, de fut tovább** — nem áll meg attól,
hogy nincs zenefájl.

### Két összeállítási mód

| parancs | index.html | mire jó |
|---|---|---|
| `node build.js` | **4,0 MB** | asztali alkalmazás, frissítés |
| `node build.js --embed` | 25,3 MB | egyetlen, önmagában futó fájl — elküldhető |

Az `--embed` kapcsoló eddig **csak a megjegyzésben létezett**: a kód
sosem olvasta be. Most valóban működik.

### Amire figyelni kellett

**A zenét oda kell tenni, ahonnan a játék keresi.** Az `ios-www.js` most
a `www/zene/` mappába is átmásolja — enélkül az asztali alkalmazás néma
maradt volna.

**A csomag mérete.** Először 39 MB lett, mert a `www` mappa a zenét
duplán vitte. A `www` kimarad a zipből (úgyis újragenerálódik), így
21 MB.

### Ellenőrzés

```
MUSIC_URL                    : "zene/"
a lekért fájl                : zene/15-old-kingdom.mp3
a letöltött sáv              : 4103 KB, pufferelve
második kérésre új letöltés  : nem
hiányzó fájl esetén          : a játék fut tovább
```

Determinizmus hat féllel, hálózati szinkron, szoba, oktatómód,
kalózváros — mind változatlan.

### Ami ezzel megnyílt

Innentől egy frissítés **4 MB**, nem 26. A frissítő megírása így már
érdemes: a játék indításkor letölthet egy új `index.html`-t, és az
másodpercek kérdése lesz.

---

## 1.4 — A spanyol zászló a menüben · 2026-08-11

### Rossz helyen kerestem

Az előző menetben átrajzoltam a spanyol zászlót a `20-flags.js`-ben — és
a képernyőképed megmutatta, hogy az egészen máshol tér el.

**A nemzetválasztó nem a rajzolt zászlót mutatja.** Van egy `FLAG_IMG`
képtár (nemzetenként négy korszakra, festett lobogóképek), és a menü azt
használja; a rajzolt zászló csak tartalék, ha a kép hiányzik. Az én
javításom tehát a játékon belüli lobogókra hatott, a menüre nem.

### A valódi eltérés

Kimérve, mennyi a kép átlátszó része:

```
at, de, fr, gb, hu, pl, ru     0%   — tömör téglalap, kitölti a keretet
es-0  34%   es-1  27%   es-2  19%   es-3  22%
```

A spanyol mind a négy korszakban **kivágott, rojtos lobogó** volt
átlátszó háttéren, rúddal és hullámzó szegéllyel. Minden más birodalom
sima, keretet kitöltő téglalap. Ezért ütött el annyira.

### A javítás — második nekifutásra

Elsőre a legnagyobb TÖMÖR téglalapot vágtam ki a lobogó belsejéből.
Rossz ötlet volt: az egy keskeny sáv a kép közepén, és felnagyítva már
csak a címer látszott — a zászló egésze elveszett.

Másodszor fordítva: megtartom a TELJES lobogót, és a hiányzó szélt
kitöltöm a hozzá legközelebbi valódi színnel. Így téglalap lesz, de a
minta megmarad.

Mind a négy korszak most 0% átlátszó, 176×99 — pontosan mint a többi.

### Tanulság

Amit egy képernyőkép megmutat, azt hét mérés sem. A saját, kódból
kirajzolt összehasonlításom szerint a zászló rendben volt — mert azt a
zászlót néztem, amit a menü nem is használ.
---

## 1.3 — Egyensúlypróba, és egy régóta lappangó hiba · 2026-08-11

### A spanyol zászló

A nemzetválasztóban a spanyol lobogó teljesen elütött a többitől. Az
okot csak akkor láttam, amikor egymás mellé raktam mind a nyolcat: a
többi nemzet első zászlaja EGY erős, összefüggő minta, a spanyol viszont
négy apró mezőre esett szét, világos krémszínű alapon.

Most a saját színeit viszi, de a többiek nyelvén: telített vörös mező,
benne egyetlen nagy kasztíliai vár, alul aragóniai sáv. A négyeltség
jelzésként marad meg, nem szerkezetként.

### A gather-bónusz sosem működött

Az egyensúlypróba egy váratlan dolgot mutatott: **négy különböző nemzet
gazdasága betűre azonos számokat adott.** Ez csak akkor lehetséges, ha a
nemzet nem számít.

Ki is derült: a `BONUS[...].gather` sehol nem szerepelt a gyűjtés
képletében. Csak a doktrínáé (`doctMul`) és a fejlesztéseké. Négy nemzet
előnye épül gyűjtésre, és mind a négyé hatástalan volt:

| nemzet | az előny, ami nem hatott |
|---|---|
| Kína | +25% élelem |
| India | +30% arany |
| Mali | +20% arany |
| **Stede Bonnet** | **+25% arany** |

Az utolsó a lényeg: ez egy **kiadott kalózfrakció**, tehát a hiba nem az
új nemzetekkel jött, hanem régóta ott volt. Aki Stede Bonnettel játszott,
az a leírt előnyének felét sem kapta meg.

Javítva: a nemzeti szorzó bekerült a képletbe.

### Az egyensúlypróba eredménye

Bot bot ellen, négy perc, három maggal, négy régi nemzet ellen — nemzetenként
tizenkét játszma. A mérőszám a SEREGERŐ: az élő katonák életereje és
sebzése együtt, a másik félhez viszonyítva.

```
Svédország   0,99
Oszmán       0,84
Kína         0,83
India        0,83
Mali         0,83
Japán        0,81

viszonyítási alap — régi nemzetek egymás ellen:
hu vs fr 1,05    fr vs gb 0,94    gb vs ru 0,73
```

**A hatból egyik sem erős.** Mind a normál szóráson belül van: a régi
nemzetek között is 0,73 és 1,05 a szélső érték.

### Amit a mérés NEM tud

Őszintén: ez a próba a nemzetek felét nem méri.

- A **kitermelést** nem sikerült mérni. A `G.earned` csak a nulladik
  félre gyűlik, és a botok ebben a felállásban nem bányásznak — fa, kő
  és arany mindenhol nulla maradt. A gazdasági előnyök (Kína, India,
  Mali) hatását tehát nem láttam számokban.
- A **bot nem használja ki** a nemzeti sajátosságokat. Japán +20%
  közelharci sebzése akkor ér valamit, ha valaki tudatosan közelharcra
  épít; a bot ugyanazt csinálja minden nemzettel.
- Négy perc **rövid**. A gazdasági előnyök később térülnek meg.

Ezért a nemzetek **továbbra sem választhatók**. Amit a mérés
kizárt: egyik sem elsöprően erős. Amit nem tudott megmutatni: hogy
emberi kézben mennyit érnek.

Ehhez élő játék kell — az a következő lépés, nem újabb szimuláció.

---

## 1.2 — Saját építészet és öltözék a készülő nemzeteknek · 2026-08-11

A hat nemzet (Svédország, Oszmán Birodalom, Japán, Kína, India, Mali)
**továbbra sem választható** — a `keszul:true` jelölés tart. Négy helyen
szűrjük őket, és a bot sem kaphatja meg: negyven játszmán mérve egyszer
sem került elő egyikük sem.

Ami elkészült: a látvány.

### Öt új tetőforma

| forma | nemzet | mi a jellegzetes |
|---|---|---|
| **minaret** | Oszmán | alacsony, széles kupola, mellette karcsú torony erkéllyel |
| **pagoda** | Japán, Kína | három egymás fölötti eresz, **felkunkorodó sarokkal** |
| **mogulkupola** | India | KÖRTE alakú kupola csúccsal, két saroktoronnyal |
| **sárépítmény** | Mali | lapos tető, csúcsos pillérek, **kiálló gerendavégek** |
| **zsindely** | Svédország | meredek, faragott oromdísszel |

Az indiai először sima hagymakupolát kapott — a többi mellett ez volt a
leggyengébb, mert semmiben nem különbözött az orosztól. A mogul kupola
nem hagyma alakú: alul beszűkül, középen kiöblösödik, és karcsú csúcsban
végződik. A saroktornyok (csatri) teszik teljessé.

A szaheli gerendavégek nem díszek: azokon állva vakolják újra a falat
minden esős évszak után.

### Öt új homlokzat

- **Oszmán** — meszelt fal, kőlábazat, és HEGYES ívű ablakok. A félkörív
  mediterrán, a csúcsív keleti; ez az egyetlen vonás elegendő.
- **Japán és Kína** — világos falmezők, sötét gerendaváz: a szerkezet
  MUTATJA magát. A kínainál vörös gerendák és aranyozott konzolok, a
  japánnál barna váz és sodzsi rácsozat.
- **India** — mogul többkaréjos ívsor, párkánnyal.
- **Mali** — vastag, lekerekített vályogfal, két sor kiálló gerendavéggel.
- **Svédország** — falu-vörös deszkaborítás, fehér sarokléccel és
  ablakkerettel.

### Nemzeti öltözék — a harmadik réteg

Eddig két nemzeti jegy volt az egységeken: a fejfedő és a fegyver. A
sziluett középső harmada — a törzs — mindenkinél ugyanaz maradt.
Márpedig távolról épp a törzs a legnagyobb felület.

| öltözék | nemzet | |
|---|---|---|
| **lamellás** | Japán | vízszintes lemezsorok, széles szögletes vállvért (szode) |
| **kabátpáncél** | Kína | kerek gallér, pikkelysorok |
| **kaftán** | Oszmán | lefelé bővülő szabás, más színű bélés, széles selyemöv |
| **övheves** | India | átlós vállszalag és övcsat |
| **bubu** | Mali | szélesen kihajló köpeny, hímzett nyakkivágással |
| **karolinus** | Svédország | sárga hajtóka, keresztbe vetett fehér szíjak |

A test UTÁN, de a fej ELŐTT fut: a gallért a fejfedő takarja, nem
fordítva. A 20. században eltűnik — ott mindenki egyenruhát hord,
ugyanaz a szabály, mint a fejfedőknél.

Csak ott van bejegyzés, ahol van mit mondani: ami hiányzik, a megszokott
egyenruhát viseli. Nem hiba, hanem szándék.

### Ami hátravan

A nemzetek bekapcsolása. Az adat és a látvány kész; ami hiányzik, az a
kipróbálás: végig kell játszani mindegyikkel, és megnézni, hogy a
nemzeti előny és az ideológiák nem billentik-e meg az egyensúlyt.

---

## 1.1 — Frissítésfigyelő és hat készülő nemzet · 2026-08-11

### Frissítésfigyelő

Amikor új változat érkezik, a játékos szembesül vele, hogy „valami
megváltozott" — de nem tudja, mi. A gombok a helyükön vannak, a mentése
betöltődik, és fogalma sincs, hogy mondjuk a városok azóta visszalőnek.

Mostantól az első indításkor felugrik egy ablak a változásokkal. Kis
X-szel vagy mellékattintva bezárható, és utána lehet új játékot kezdeni —
addig nem, mert az ablak a menü fölött áll.

**Amire figyeltem:**

- **Újoncnak nem ugrik fel.** Ha nincs eltárolt korábbi változat, csak
  feljegyezzük, hol tartunk. Aki most ismerkedik a játékkal, annak a
  változásnapló zaj.
- **Ha valaki két változatot ugrott, mindkettőt látja** — de legfeljebb
  hármat, mert annál többet senki nem olvas el.
- **Négy nyelven** szól, mint minden más.
- Ami ide kerül, azt a játékos ÉSZREVESZI: új nemzet, új egység,
  megváltozott szabály. A belső átszervezés és a szétcsúszás-javítás a
  VALTOZASOK.md dolga.

### Hat készülő nemzet

Svédország, Oszmán Birodalom, Japán, Kína, India, Mali Birodalom.

**Egyelőre NEM választhatók**: `keszul:true` jelöléssel sem a menüben,
sem a szobában nem jelennek meg, és a bot sem kaphatja meg őket. Negyven
játszmán mérve egyszer sem került elő egyikük sem.

Miért így? Mert egy nemzet nem attól kész, hogy van neve és zászlaja.
Kell hozzá saját ideológia, saját fejfedő, saját építészet és saját
egységsziluett — különben csak egy másik színben pompázó magyar.

**Ami már kész:**

| | |
|---|---|
| uralkodók, államformák, címek | négy korszakra mind |
| zászló | négy korszakra, korszakonként rajzolva |
| fordítás | angol, német, kínai — meghonosodott névalakokkal |
| nemzeti előny | egy-egy, a történelmi karakterhez illő |
| ideológiák | három-három út |
| fejfedő | turbán, fez, kabuto (szamurájsisak félhold-taréjjal), kúpos katonasapka |
| fegyver | jatagán, katana, dao, talwar |
| lószerszám, tetőforma | a meglévő formákból |

**Ami hátravan:** saját épülethomlokzat (minaret, pagoda, sárépítészet) és
saját egységsziluett. Ez a következő menet.

### Az uralkodók

```
Svédország   Vasa Gusztáv → II. Gusztáv Adolf → XIV. Károly János → Hammarskjöld Dag
Oszmán       II. Mehmed → Nagy Szulejmán → II. Mahmud → Atatürk
Japán        Asikaga Josimasza → Tokugava Iejaszu → Meidzsi → Hirohito
Kína         Jung-lo → Kang-hszi → Ce-hszi → Szun Jat-szen
India        Nagy Akbar → Aurangzeb → Laksmi Báí → Gandhi
Mali         I. Manszá Músza → Manszá Szulejmán → Szonni Ali → Aszkia Mohamed
```

A 19. századi India Laksmi Báít kapta, nem egy brit alkirályt: az ő
neve alatt a nemzet a SAJÁT történetét viszi, nem a gyarmatosítóét.

### Ellenőrzés

Írtam egy táblaellenőrzést, ami megmondja, melyik adattáblából melyik
nemzet hiányzik. Mind a kilenc tábla teljes mind a tizennyolc nemzetre.
Egy hiba így bukott ki: a fegyvertábla egy sorban állt, és a kiegészítés
nem landolt rajta.

---

## 1.0 — A számozás újraindul · 2026-08-11

**A verziószám innentől 1.0-tól számol.**

Ez nem visszalépés: a játék pontosan az, ami az előző bejegyzésben
(10.2) elkészült. Csak a számozás kezd elölről.

### Miért zavaró lenne magyarázat nélkül

A napló időrendben visszafelé olvasható, tehát ez a bejegyzés a 10.2
FÖLÖTT áll — mintha a 10.2 lenne az újabb. Nem az. Az alatta lévő
bejegyzések a régi számozás szerintiek, és az 1.0 mindet magában
foglalja.

Ha egy régi mentést vagy egy régi `.exe`-t találsz „v9.7" jelöléssel, az
ennek az 1.0-nak egy korábbi állapota, nem valami újabb.

### Mi van benne (a régi számozás szerint 1.0 – 10.2)

| terület | |
|---|---|
| **négy korszak, tizenkét nemzet** | saját uralkodókkal, egyenruhákkal, építészettel |
| **négy nyelv** | magyar, angol, német, kínai — a menütől az életrajzokig |
| **többjátékos** | lépészáras szimuláció, szoba, készenlét, menet közbeni diplomácia |
| **beépített szerver** | a házigazda gépén indul, az alagút eszközét magától letölti |
| **kalózvilág** | egyszemélyes hadjárat, helyi csata és hálózaton is |
| **terep** | magaslat, mocsár, sűrű erdő — látótávra, lőtávra, sebességre hat |
| **évszakok** | korszakonként más táj és lombszín |
| **időjárás** | eső, hó, köd, sár |
| **hang** | korszakonkénti zene, helyhez kötött harci hangok |
| **mentés** | valódi fájlokba, atomikus írással |

### A számozás rendje innentől

- **1.0, 1.1, 1.2 …** — új dolgok és javítások
- **2.0** — ha valami akkorát változik, hogy a régi mentések vagy a régi
  hálózati protokoll nem viszi tovább

---

## v10.2 — Az alagút eszköze magától megérkezik · 2026-08-11

A v10.1-ben a szerver már a házigazda gépén indul, de az alagúthoz kellett
egy kézzel telepített `cloudflared`. Aki ezt nem tette meg, csak azonos
wifin tudott játszani — anélkül, hogy értette volna, miért.

Mostantól az **első szobanyitáskor magától letöltődik**.

### Miért letöltés, és nem a telepítőbe csomagolva

- A telepítő nem hízik ötven megabájttal olyasmivel, amit sokan sosem
  használnak: aki csak egy gépen játszik, annak nem kell.
- **Aki csatlakozik, annak sem kell** — csak a házigazdának.
- A letöltött változat mindig friss. A Cloudflare a régi kiadásokat egy
  év után elejti; egy becsomagolt példány idővel elavulna.

A fájl a felhasználói mappába kerül (`eszkoz/`), tehát nem kell
rendszergazdai jog, és a program eltávolításakor sem marad szemét a
rendszerben.

### Ami történik

```
1. szobanyitás  →  „Alagút-eszköz letöltése (egyszeri)…  37%"
                →  „A szerver fut, és interneten át is elérhető."
2. szobanyitás  →  azonnal indul, nincs letöltés
```

Ha a gépen már van `cloudflared` (útvonalon vagy korábbi letöltésből),
nem tölt le semmit.

### Amire figyeltem

**Rendszerenként más fájl kell.** Windows 64/32 bit, macOS Intel/Apple,
Linux x64/arm64 — mind külön. Ismeretlen rendszernél nem próbálkozunk,
hanem megmondjuk, hogy marad a helyi hálózat.

**Atomikus írás.** Előbb `.reszleges` néven töltjük, és csak a végén
nevezzük át. Ha a letöltés félbeszakad, nem marad csonka futtatható a
helyén — ugyanaz az elv, mint a mentéseknél.

**A haladás látszik.** Ötven megabájt lassú kapcsolaton percek; százalék
nélkül a játékos csak annyit látna, hogy nem történik semmi.

**Három különböző kimenet, három különböző üzenet:** sikerült; nem
sikerült beszerezni (és miért); a rendszer nem támogatja. Ha mindháromra
ugyanazt írnánk, a játékos nem tudná, mi a teendő.

### Ellenőrzés

```
melyik fájl melyik rendszerhez   : mind a hat helyes, ismeretlennél null
első szobanyitás                 : letölt
második                          : nem tölt újra
nem támogatott rendszer          : hibát ad, nem omlik össze
a csonka fájl                    : nem kerül a végleges névre
a beépített szerver              : változatlanul működik mindhárom ágon
```

A teljes tesztsorozat átment: determinizmus hat féllel, hálózati szinkron,
szoba, oktatómód, a kapcsolat mind a 22 átmenete.

---

## v10.1 — Beépített szerver a házigazda gépén · 2026-08-11

Eddig a többjátékos módhoz külön kellett futtatni a `szerver.js`-t egy
gépen, és annak a gépnek végig bekapcsolva kellett maradnia. Ez volt a
legnagyobb akadály: ha a „szervergazda" nem ért rá, senki nem játszhatott.

Mostantól a **házigazda gépén indul a szerver, automatikusan**, amikor
szobát nyit. Aki hostol, az egyben a postás is.

### Miért működik ez

Mert a szerver nem számol semmit: csak továbbítja az üzeneteket és ráírja
a feladó helyszámát. A szimuláció minden gépen fut. A házigazda gépe így
egyszerre játékos és elosztó — a terhelés elhanyagolható.

### Az alagút is elindul

Otthoni internet mögött általában nincs saját nyilvános cím, ezért a
helyi szerver csak azonos wifin érhető el. Ha a gépen van `cloudflared`,
azt is elindítjuk, és a kapott nyilvános címet használjuk.

A **Meghívó másolása** gomb — ami a v8.5 óta megvan — mostantól a KIFELÉ
használható címet adja:

| helyzet | a meghívóba ez kerül |
|---|---|
| van cloudflared | `wss://…trycloudflare.com#KÓD` |
| nincs | `ws://192.168.x.x:8787#KÓD` (azonos wifi) |

A saját gépünkhöz mindig a `127.0.0.1` címen kapcsolódunk — az a
leggyorsabb, és mindig működik. A másik gépen viszont az semmit nem érne,
ezért választjuk szét a kettőt.

### Amit cserébe elveszítünk

Ha a házigazda kilép, **a szerver is megáll, és a meccsnek vége**. A külön
futó szerver ezt túlélte: ott a többiek folytathatták.

Ezért a beépített szerver KÜLÖN CSOMAGBAN érkezik
(`birodalom-teljes-beepitettserver.zip`), és a régi működés is megmarad
(`birodalom-teljes.zip`). Ha az új nem válik be, egy lépésben vissza
lehet állni.

### A két csomag különbsége: egyetlen fájl

Az `asztali/preload.js`. A beépítettben ott a híd a játék felé; a
simában nincs — és a híd hiánya miatt a „Szoba nyitása" a régi úton megy,
a kézzel megadott címre.

A `main.js` mindkettőben tartalmazza az indítót; az önmagában nem csinál
semmit, amíg a híd nem nyitja meg. A **játék maga (`index.html`) a
kettőben azonos** — a különbség csak az asztali burokban van, tehát a
`.exe`-t kell újraépíteni ahhoz, hogy számítson.

### Ellenőrzés

```
asztali, alagúttal    : szerver elindult, magához 127.0.0.1-en kapcsolódott,
                        a meghívóban az alagút címe
asztali, alagút nélkül: a meghívóban a helyi hálózati cím (192.168.1.7)
böngésző (nincs híd)  : a kézzel megadott címre kapcsolódott
```

A teljes tesztsorozat átment: determinizmus hat féllel, hálózati szinkron,
szoba, oktatómód, a kapcsolat mind a 22 átmenete.

---

## v10.0 — Ki mit állíthat a szobában · 2026-08-11

### A vendég eddig olyasmit is állíthatott, aminek nem volt hatása

A nehézséget, a korszakot, a tájat és a módot bárki átkattinthatta —
csakhogy ezek a HÁZIGAZDA tervében utaznak. A vendég módosítása nem
jutott el senkihez: azt hitte, nehéz pályán játszik, közben a
házigazdáé indult. Ez rosszabb, mint a tiltás, mert félrevezet.

Hálózaton mostantól csak a házigazda állítja ezeket; a vendégnél
halványan, letiltva látszanak, buboréksúgóval.

### Ami viszont tényleg a vendégé

A saját nemzete és a saját CSAPATA. Ez utóbbit eddig csak a házigazda
állíthatta — pedig épp az a szoba lényege, hogy mindenki eldöntse, kivel
szövetkezik. A csapatválasztás mostantól utazik a hálózaton, ugyanúgy,
mint a nemzeté.

### Készenlét

Minden emberi résztvevő mellett ott a jelzés, a sajátod mellett gomb:
**Kész vagyok** / **Még nem**. A házigazdáé magától kész — ő indít.

A Kezdés gombon látszik, kire várunk:

```
Várunk a többiekre  1/2     →     Kezdés
```

Amíg valaki nem nyomta meg, a játszma nem indítható. Enélkül a házigazda
elindíthatta volna úgy, hogy a többiek még nemzetet sem választottak, és
a világ a fejük fölött jött volna létre.

**A készenlét helyszáma a szerver bélyegzőjéből jön**, nem az üzenet
tartalmából: a saját üzenetében bárki bármit írhatna, de a szerver
felülírja — így senki nem jelentheti késznek a másikat.

### Egy hiba, amit a próba fogott meg

A zárolást először a beállítások függvényének ELEJÉRE tettem — csakhogy a
gombokat ugyanaz a függvény hozza létre, lentebb. A vendégnél így mind a
négy beállító nyitva maradt. A zárolás most a felépítés után fut.

### Ellenőrzés valódi szerverrel

```
a vendégnél: nehézség, korszak, táj, mód   → mind tiltva
a házigazdánál                              → engedve
a vendég saját nemzete és csapata           → szerkeszthető
a csapatválasztás átmegy a hálózaton        → megérkezett
Kezdés a készenlét előtt                    → tiltva, „Várunk a többiekre 1/2”
a vendég készenléte után                    → indítható
indítás és játszma                          → mindkettő fut, szinkronban
```

---

## v9.9 — Parancsok értelmetlen tartalommal · 2026-08-11

A múltkori menetben a parancsok JOGOSULTSÁGÁT néztem: ki mit csinálhat.
Most az ÉRTÉKEKET: mi történik, ha a parancsban értelmetlen adat érkezik.

### Ami eleve rendben volt

| próba | eredmény |
|---|---|
| mozgás `NaN` és végtelen koordinátára | egyetlen egység sem került NaN-helyzetbe |
| mozgás szöveggel és objektummal | nem történt semmi |
| kiképzés `db=999999`-cel | a sor 8-nál megállt, az arany nem ment mínuszba |
| kétszázezer elemű kijelölés | 7 ms, tíz egység jelölődött ki |
| korszakváltás tizenkétszer, fedezet nélkül | a korszak nem változott |
| fejlesztés harmincszor, fedezet nélkül | a szint nem változott |

A gazdasági ellenőrzések tehát a parancs oldalán is működnek — nem csak a
gombon.

### Két parancs kivételt dobott

`build` ismeretlen épülettípussal és `train` ismeretlen szereppel
egyaránt elszállt a `…​.cost` olvasásán.

**Ez nem okozott kárt**, és ezt fontos külön kimondani: a lépészár
`try/catch`-be csomagolja a parancsokat, tehát senki gépe nem akadt meg.
És mivel ugyanaz a parancs minden gépen ugyanott dobja el magát, a
játszma sem csúszik szét.

Mégis megjavítottam, két okból:

1. **Az elnyelt kivétel elrejti a valódi hibákat is.** Ha egyszer egy
   igazi hiba dob ott, arról soha nem szerzünk tudomást.
2. A védelem nem támaszkodhat arra, hogy a hívó oldalon van egy
   `try/catch`. Az a hálószoba, nem a korlát.

A `train` mostantól ellenőrzi a szerepnevet, a darabszámot (1–50), és
azt is, hogy az adott ÉPÜLET egyáltalán tudja-e képezni. A `build`
ellenőrzi a típusnevet és azt, hogy a koordináta valódi szám.

### Ellenőrzés

Egyetlen parancs sem dob már kivételt, a szimuláció fut, az
ellenőrzőösszeg ép. A teljes tesztsorozat átment: determinizmus hat
féllel, hálózati szinkron az 1580. lépésig, a kapcsolat mind a 22
átmenete, és a korábbi támadási próbák.

### A harmadik szabály

Az eddigi kettő mellé:

> **Ami a világ állapotát változtatja, az parancs.**
> **A parancs ellenőriz.**
> **A parancs nem dob kivételt — a hívó oldali `try/catch` nem védelem,
> csak háló.**

---

## v9.8 — A szerver és az indulás · 2026-08-11

Ezúttal a SZERVERT támadtam, protokollszinten: nem a játékkal, hanem
közvetlenül a vonalra írva. Így olyan üzenetet is lehet küldeni, amit a
rendes kliens sosem küldene.

### A szerver kitartott

| próba | eredmény |
|---|---|
| a vendég MÁS helyszámával küld parancsot | a szerver felülbélyegzi (`m.f`) |
| másik szoba üzenete átszivárog-e | nem |
| 200 kB-os üzenet | bontja a kapcsolatot |
| négyezer üzenet egyszerre | bontja a kapcsolatot |
| a szerver a támadások után | él, új szoba nyitható, a régi tagjai megvannak |

A helyszám felülbélyegzése a legfontosabb védelem, és rendben van: a
kliens hiába írja bele a saját üzenetébe, hogy ő a nulladik fél, a
szerver a valódi sorszámára cseréli.

### Egy valódi rés a KLIENSBEN

**A vendég elindíthatta a házigazda játszmáját.** Az `indulas` üzenetet
a kliens bárkitől elfogadta:

```js
else if(m.t==='indulas'){
  netJatekIndit(m.mag, m.terv, m.beall, false);
```

A támadási próbán ez sikerült: a vendég `indulas` üzenetére a házigazda
gépe azonnal világot generált és játékba lépett — **a támadó által
megválasztott felállással, nemzetekkel, nehézséggel és maggal**.

Ez nem csak kellemetlen. A szimulációs mag az egész játszmát
meghatározza; aki azt megválasztja, az a térképet is megválasztja.

Mostantól csak a nulladik féltől (a házigazdától) fogadjuk el, és a
tervnek is épkézláb tömbnek kell lennie — a régi kód üres tervvel is
nekiindult volna.

### Amit menet közben megtudtam

A szoba bezárása (`indulas` → `sz.zart=true`) továbbra is bárkitől
működik a szerveren. Ez a mostani javítás után már csak annyit tesz,
hogy nem lehet többé belépni a szobába — a játszmát nem indítja el.
Kellemetlen, de nem veszélyes; egy szobakódot úgyis csak az ismer, akit
meghívtál.

### Ellenőrzés

```
a vendég indulása          : elutasítva, a házigazda várakozik tovább
a HÁZIGAZDA indulása       : változatlanul működik, szinkron a 2420. lépésig
kapcsolat életciklusa      : mind a 22 átmenet
determinizmus hat féllel   : azonos
szerver-támadási próba     : mind a hét pont rendben
```

---

## v9.7 — A parancsok jogosultsága · 2026-08-11

Ezúttal a PARANCSOKAT támadtam. Aki átírja a saját kliensét, olyan
parancsot is küldhet, amire a felület sosem adna lehetőséget — a
végrehajtó oldalnak ezt önállóan meg kell fognia.

### Három rés, mind a friss városparancsokban

**1. Bármelyik ép várost el lehetett foglalni.** A `varosFoglal` parancs
semmit nem ellenőrzött: egy módosított kliens **egyetlen katona nélkül**
elvehetett egy tornyos, teli lakosságú várost. A próbában a tortuga
(2 torony, 336 lakos, nulla ottani katona) egy csapásra gazdát cserélt.

**2. És korlátlanul ki lehetett fosztani.** Ugyanaz a városra küldött
parancs 955 aranyat hozott, majd újra és újra: öt hívás további 1100
aranyat. Egy percnyi gépelés a teljes gazdaságot kiváltotta volna.

**3. Idegen kikötőbe is lehetett építeni**, ráadásul az épület a 0.
félhez került, a költséget pedig a HELYI játékos készletéből vonta —
hálózaton tehát a társad építkezése a te aranyadat fogyasztotta volna.

### A javítás

A parancsok végrehajtásakor most újra ellenőrizzük mindazt, amit a
felület is megkövetel:

| | |
|---|---|
| a város létezik és nem a cselekvőé | |
| nyitva áll — a tornyok ledőltek, a lakosság kifogyott | |
| nincs élő védője a cselekvővel szemben | |
| a cselekvőnek **van ott szárazföldi katonája** | |
| építeni csak a SAJÁT kikötődben lehet | |
| a költség a cselekvő fél készletéből megy | |

### Ellenőrzés

```
ép város elfoglalása jogosultság nélkül : nem sikerült
ép város kifosztása                     : nem sikerült  (300 → 300 arany)
ötszöri ismételt kifosztás              : nem sikerült
építés idegen kikötőben                 : nem sikerült  (épületek 4 → 4)
JOGOS foglalás és kifosztás             : változatlanul működik, 247 arany
```

A teljes tesztsorozat átment: determinizmus hat féllel, hálózati szinkron
az 1620. lépésig, a kapcsolat mind a 22 átmenete, és a korábbi támadási
próba (idegen egység mozgatása, ideológia átírása, házigazda kirúgása).

### A szabály, ami ebből következik

**A felületi feltétel nem védelem, csak kényelem.** Ha egy gomb csak
akkor kattintható, amikor szabad — az a jó felület. De a parancs oldalán
ugyanazt meg kell ismételni, mert a hálózatról érkező parancs sosem ment
át a gombon.

Ez a párja a v9.6 szabályának: *ami a világ állapotát változtatja, az
parancs* — most kiegészül azzal, hogy *a parancs pedig ellenőriz*.

---

## v9.6 — Rendszeres átvizsgálás: helyi állapot a szimulációban · 2026-08-11

A projekt eddigi története egyértelmű: a legveszélyesebb hibafajta itt
az, amikor a szimuláció a HELYI állapotból dolgozik. Kilenc ilyet
találtunk eddig, mind ugyanabból a gyökérből. Ezért ezt már nem
esetenként nézem, hanem **rendszeresen végigkeresem**.

### A keresés

Végigmentem a szimulációs órákon — harc, egységek, épületek, gazdaság,
bot, köd, időjárás, ostrom, diplomácia —, és kikerestem minden sort,
amely `ENID`-et, `helyiFel()`-t, `G.nation`-t, `REDUCED`-ot vagy
`G.lowFx`-et olvas. Harmincnyolc találat.

A többségük rendben volt:

- **parancsvégrehajtás** — ott az `ENID` a KÜLDŐ, nem a helyi játékos
- **rajzolás és üzenet** — a látvány és a felirat lehet helyi
- **kijelölés** — az a te képernyőd dolga

Három sort külön megnéztem, mert szimulációt érinthetett: a hajóágyú
sortüze, a talajkopás és az időjárás rajzolása. Mind a három tiszta — a
sortűz `Math.random`-ot használ, a másik kettő rajzoló.

### Amit viszont talált: a városdöntés nem ment át a hálózaton

**Az elfoglalás és a kifosztás nem volt parancs.** Csak a döntő gépen
futott le — a többiek úgy látták volna, hogy a város érintetlen, a
zsákmány pedig sehol. Ez a szimuláció állapotát érinti (lakosság,
tornyok, falak, épületek tulajdonosa), tehát azonnali szétcsúszás.

Mindkettő parancs lett, és két további hiba is kiderült közben:

**A zsákmány a helyi játékoshoz ment.** `G.res.gold += zs` — az viszont
a te készleted, akkor is, ha épp a társad fosztogat. Most a cselekvő fél
kapja (`resOf(ENID)`).

**Az elfoglalt város főhadiszállása a 0. félhez került.** `makeBuild('hq',
0, …)` — hálózaton a 0. fél nem feltétlenül az, aki bevette. Most a
cselekvőé.

### Ellenőrzés valódi szerverrel

```
a házigazda kifoszt egy várost:
  arany   A: 300 → 538    B: 300 → 538   (mindkét gépen)
  a város állapota egyezik: 2 lakos / 0 torony
  a játszma szinkronban maradt
```

A teljes tesztsorozat is átment: determinizmus hat féllel, hálózati
szinkron az 1280. lépésig, a kapcsolat mind a 22 átmenete, a korábbi
támadási próbák.

### Tanulság

Ez a kilencedik és tizedik ugyanabból a fajtából. A minta annyira
következetes, hogy érdemes szabállyá tenni: **ami a világ állapotát
változtatja, az parancs; ami csak megjelenik, az lehet helyi.** A
kettő között nincs harmadik eset.

---

## v9.5 — A város visszalő · 2026-08-11

Kiderült, hogy a kalózvárosok **egyáltalán nem lőttek vissza**: a torony
csak elnyelte a sebzést. A hajók büntetlenül darálhatták a partot
biztonságos távolból.

### Két lőtáv

```
hajó   300  — ennyiről tudja lőni a várost
város  360  — és ennyiről lő vissza a hajókra
```

Vagyis a sortűzhöz **be kell menni a város tüzébe**. Nem lehet
biztonságos távolból ledarálni a partot — aki lőni akar, az kockáztat.
Ez adja meg az ostrom tétjét.

A hatvan pixel különbség apró, de érezhető: annyi idő, amíg a parti
ütegek egyszer-kétszer beleeresztenek a közeledő hajóba.

A minimapon a város lőtávja szaggatott, tágabb körrel látszik — előre
tudod, hol kezd rád tüzelni a part.

### A visszatűz

Két és fél másodpercenként egy sortűz, a tornyok számával arányos erővel:
egy magányos üteg csipked, négy torony komolyan büntet. A célpont mindig
a **legközelebbi** ellenséges hajó — nem sorsolunk, mert minden
maghúzás egy újabb esély a szétcsúszásra.

Mérve, húsz másodperc három tornyos város mellett:

```
250 px  → a hajó 250 → 52 élet   (mindkettő lő)
320 px  → a hajó 250 → 52 élet   (csak a város lő)
340 px  → a hajó 250 → 52 élet   (csak a város lő)
400 px  → érintetlen             (senki nem ér el)
```

### Két hiba a munka közben

**1. A visszatűz rossz helyre került.** Először a bombázás ágába tettem —
így csak arra a hajóra lőtt, amelyik már lőtte a várost. A 320 pixelre
álló hajót békén hagyta, pedig a lőtáv 360. A próba fogta meg.

**2. A döntés ablaka nem nyílt ki.** Az átszervezéskor az ablaknyitást a
„döntésre vár” jelzőhöz kötöttem. Ha egy MÁSIK fél állította be a jelzőt
előbb, a helyi játékos már nem kapta meg az ablakot — a város
bevehetetlenné vált. A jelző az állapot része (minden gépen kell), az
ablak viszont attól függ, ki áll ott: most külön dől el.

---

## v9.4 — Kalózvilág többjátékosban, és hat szétcsúszás · 2026-08-11

A kalózvilág eddig csak egyszemélyes hadjáratban volt elérhető. Mostantól
a **helyi csatában** is választható: a szobában új „Mód” sor —
*Birodalmak* vagy *Kalózvilág*.

Váltáskor a nemzetek is átállnak: kalózmódban a kalózfrakciók (Nassau,
Fekete Szakáll, Stede Bonnet, szigetlakók) lépnek fel a birodalmak
helyett, és a korszakválasztó elrejtőzik — a szigetek ideje egyetlen kor.

Mérve, három féllel: mindenki 13 egységgel és 4 épülettel indul, 14 város
a térképen, a játszma hatvan másodperc után is rendben fut.

### Hat szétcsúszási ok — mind ugyanaz a fajta hiba

A kalózvilág kódja végig abból indult ki, hogy EGY játékos van, és az a
helyi. Hálózaton ez végzetes: a szimulációnak minden gépen ugyanazt kell
számolnia.

**1. A világ létre sem jött.** Az ellenfél fészkének kijelölése
`G.ai.nation`-t olvasott — többjátékosban viszont nincs bot, a második
fél is ember. Az egész világgenerálás elszállt rajta.

**2. A városok a helyi nemzetből kerültek ki.** `FESZEK[G.nation]` — az
viszont mindenkinél a SAJÁT nemzete. Minden gépen máshova került a két
kikötő, vagyis más világ jött létre. Most a felállásból dolgozik.

**3. Csak a helyi fél kapta az 1-es korszakot.** `if(G.pirate) G.age=1;`
— a `G.age` a helyi játékosé. A többi fél 0. korú maradt, tehát minden
gépen MÁS fél lett fejlettebb: nálam én, a társamnál ő. Ettől más lett a
kezdősereg. Most minden fél megkapja.

**4. A partraszállás a helyi játékossal dolgozott.** A `partraSzallasTick`
`ENID`-del számolt, és a torony lövése maghúzással jár. A feltétel
gépenként máshol teljesült: az egyiken húzott egyet, a másikon nem —
**pontosan egy húzás különbség**, és a játszma az ELSŐ lépésben
szétcsúszott. Átírva minden félre, rögzített sorrendben.

**5. A védők a helyi játékoshoz képest dőltek el.** A `varosVedok`
mindenkit védőnek vett, aki nem a helyi játékos. Most a támadó
szemszögéből számol.

Ráadásként két látványelem is a szimulációs magból húzott — az
ostromfüst és a szállítóhajó nyoma —, méghozzá csak takarékos módon
KÍVÜL. Aki takarékos módban játszik, kevesebbet húzott volna. A látvány
mostantól `Math.random`-ot használ.

És egy régi igazságtalanság: a kezdőflotta csak az első két félnek járt.
A szigetvilágban a harmadik fél hajó nélkül gyakorlatilag azonnal
vesztett. Most mindenki kap.

### A hatodik ok — a legrejtettebb

A hálózati indítás kalózmódban a **hadjárat 0. küldetését** töltötte be:

```js
newGame(enyem.nemzet||'hu', G.pirate?0:-1);
```

Régen ez kellett, mert a világgenerálás küldetés nélkül nem működött. A
küldetéslista viszont a HELYI nemzethez tartozik (`setCampaign(nationKey)`),
tehát a `CAMPAIGN[0].enemy` gépenként MÁS: a Nassaut vezetőnél angol, a
Fekete Szakállnál spanyol.

Ebből a gyarmati bot nemzete is más lett — más nemzet, más bónusz —, és a
játszma az első másodpercekben szétcsúszott.

Ez volt a legnehezebben megfogható, mert **minden látható bemenet azonos
volt**: ugyanaz a mag, ugyanaz a fél sorszáma, ugyanaz az ág. A
különbséget egy olyan érték okozta, ami nem is látszott a képletben —
ezért kellett a döntés pillanatában kiírni minden bemenetet, egyesével.

Mivel a küldetés nélküli kalózvilág azóta működik, itt is `-1` jár.

### Ellenőrzés

```
két külön példány, azonos mag : 600 lépés (60 mp) szinkronban
valódi hálózat, 2 ember + 1 bot: a 394. lépésnél azonos összeg
helyi csata 3 féllel           : mindenki 13 egység, 4 épület, 14 város
```

A kalózmód így **hálózaton is elérhető**.

**Tanulság.** Hat hibából hat ugyanaz a fajta volt: a kód abból indult
ki, hogy egy játékos van, és az a helyi. Egy egyszemélyes játékból
kinőtt kódrészt nem elég „bekapcsolni" többjátékosra — végig kell nézni
minden helyet, ahol a HELYI állapotból dolgozik.

---

## v9.2 — Támadási próba: diplomácia, terep, meghívó · 2026-08-11

A v8.0 óta bekerült a terep, az évszakok, a csatanyomok, a köd és a sár,
a hősi képesség, a diplomácia és a meghívó. Ezeket vizsgáltam át.

### Három találat

**1. Nem létező félnek is lehetett szövetséget ajánlani.**

A diplomáciai parancs a hálózatról jön, tehát bármi lehet benne. Egy
módosított kliens `diplAjanl(999)`-cel korlátlanul sok bejegyzést hozhatott
volna létre a tárban — **minden gépen**, hiszen a parancs mindenhol
lefut. Az így felduzzadt állapot memóriát eszik, és a mentést is
használhatatlanná teszi.

Mostantól a címzettnek létező, még játékban lévő félnek kell lennie.

Amit a próba ellenőrzött, és eleve rendben volt: önmagával nem
szövetkezhet, **mások szövetségét nem bonthatja fel**, és az
ajánlatözön (5000 parancs) sem növeli a tárat — mert ugyanaz a kulcs
íródik felül.

**2. A meghívó bármilyen szöveget elfogadott.**

A `javascript:alert(1)#ABCD` beillesztéséből `wss://javascript:alert(1)`
lett. Kárt nem okozott — a WebSocket úgysem nyitja meg —, de zavaros
üzenetet írt ki, és a szűrés olcsóbb, mint a bizakodás.

A cím mostantól csak abból állhat, amiből egy gépnév áll: betű, szám,
pont, kötőjel, kapuszám, útvonal. Ami ezen kívül esik, azt eldobjuk. A
szabályos címeket nem érinti — mind a kilenc értelmezési próba
változatlanul átment.

**3. Ha mindenki szövetkezett, a játszma sosem ért véget.**

Ez nem hiba volt, hanem LYUK: a menet közbeni diplomácia megnyitotta a
lehetőséget, hogy minden fél mindenkivel szövetkezzen — és onnantól
nincs kivel harcolni, de nincs győztes sem. A játékosok csak ülnek
egymással szemben.

Mostantól ha a talpon maradt felek mind szövetségesek, **közös
győzelemmel** ér véget a játszma. Hadjáratban nem: ott a küldetés célja
dönt.

### Amit megvizsgáltam, és rendben volt

| | |
|---|---|
| idegen hős képessége | a másik fél hősét nem lehet kiáltatni |
| sebzés minden párosításra | 264 kombináció, egyetlen NaN vagy végtelen sem |
| gyorsbillentyűk | nincs ütközés |
| terep mentés-betöltés után | változatlan |
| régi támadási próbák | szkriptbeszúrás, sérült mentés, idegen egység mozgatása — mind blokkolva |
| hálózati szinkron | a 2260. lépésig |
| kapcsolat életciklusa | mind a 22 átmenet |

### Egy tanulság a próbáról

A meghívó-próba nyolc ponton bukott — de nem a szigorítás miatt: a
tesztkampóból hagytam ki a függvényt. Érdemes megnézni, hogy a bukás a
JÁTÉKÉ-e vagy a mérőeszközé; ez esetben az utóbbi volt.

---

## v9.1 — Időjárás, hősi képesség, diplomácia · 2026-08-11

### Szárazföldi időjárás: köd és sár

Eddig eső és hó volt. Két új dolog:

**KÖD.** A legerősebb látásrontó: sűrűjében 0,55× a látótáv. Ez az
egyetlen időjárás, ami önmagában megfordíthat egy rajtaütést.

**SÁR.** Az eső nem áll el nyomtalanul. A föld felázik, és a menet még
sokáig nehéz marad: teljes felázásnál 0,74× a sebesség — **derült ég
alatt is**. A sár lassan gyűlik és még lassabban szárad, tehát egy zápor
a csata KÖZBEN is megváltoztatja az erőviszonyokat, nem csak amíg esik.

A hó nem sároz (az fagy, nem áztat), de olvadás után igen — ezt
egyszerűsítve harmadannyi felázással vesszük.

### A tél lassítja a termelést

Ez nem az időjáráshoz kötődik, hanem az ÉVSZAKHOZ: a 20. század tele
állandó, nem pár percre jön.

```
15. és 17. század   1,00×
19. század (ősz)    0,94×
20. század (tél)    0,82×
```

A késői korszakoknak így saját gazdasági jellege lesz: több egység, de
nehezebb ellátni őket. A gyűjtésre és a majorságra egyaránt hat.

### A hős csatakiáltása

Az aura eddig passzív volt: a hős jelenléte magától adott bátorságot.
Rendben van, de nem KÉRDEZ semmit a játékostól — nincs benne döntés.

A csatakiáltás igen: nyolc másodpercre **+35% sebzés és +25% sebesség** a
240 pixelen belüli saját egységeknek, és minden futás megáll. Utána
másfél perc várakozás. Egy csatában egyszer, legfeljebb kétszer sülhet
el — tehát számít, MIKOR nyomod meg.

A hatás a kiáltás PILLANATÁBAN közel állókra érvényes; aki később fut
oda, lemaradt róla. Így a helyezkedés is számít.

Mérve: 9,0 sebzés → 12,9 (+43%, a páncállevonás miatt több a névleges
35%-nál), a távoli egységé változatlan 9,0.

Miért ez, és nem roham vagy gyógyítás? Mert ez az, ami minden korszakban
értelmes: a vezér kiált, a sor megindul. A gyógyítás a felcseré, a roham
a lovasságé.

### Diplomácia menet közben

A szövetség eddig a szobában dőlt el, és kőbe volt vésve. Mostantól a
ponttáblán minden élő félnél ott egy gomb: **Szövetség** vagy
**Felmondás**.

Három szabály tartja egyben:

1. **A szövetség kétoldalú.** Felajánlom, a másik elfogadja. Egyoldalúan
   senki nem húzhat magához társat.
2. **A felmondás egyoldalú, de lassú.** Húsz másodperc, mire életbe lép —
   ennyi idő alatt a másik ki tudja vonni a seregét a hátországból. Az
   árulás így kockázatos, nem ingyenes: mindenki tudja, mi jön. A
   visszaszámlálás a gombon látszik.
3. **Minden állapotváltás parancs.** A szimulációt érinti (ki kire lő),
   tehát a lépészáron megy át — különben a két gépen más lenne, ki kinek
   az ellensége.

A botok is válaszolnak: elfogadják a szövetséget, ha az egységszámuk az
átlag 80%-a alá esett — vagyis ha szorongatják őket. A magabiztos bot nem
szövetkezik.

**Egy hibát a próba fogott meg**, és a saját megjegyzésem mondta ki:
„felmondás alatt: még igen" — de `false`-t adtam vissza. A húsz
másodperces türelmi idő így semmit sem ért volna, az árulás azonnal
hatott volna. Javítva.

### Ellenőrzés

Tizenkét diplomáciai próba, mind zöld: az egyoldalú ajánlat nem szövetség,
az elfogadás után igen, felmondás után 12 mp-cel MÉG szövetség, 24 mp
után már nem, és utána újra lehet szövetkezni. Determinizmus hat féllel,
hálózati szinkron a 2060. lépésig, a kapcsolat mind a 22 átmenete.

---

## v9.0 — A térkép ellenféllé válik · 2026-08-11

Öt dolog egyszerre, mind ugyanabból a gondolatból: a pálya eddig díszlet
volt, mostantól számít.

### Magasság, mocsár, sűrű erdő

Új réteg ugyanazon a 32 pixeles cellarácson, amin a víz, a szikla és a
köd is él — így a négy rendszer együtt tud dolgozni.

| | hatás |
|---|---|
| **magaslat** (0–3 szint) | szintenként +13% látótáv, +10% lőtáv, felfelé −7% sebesség |
| **mocsár** | 0,62× sebesség, 0,80× látótáv |
| **sűrű erdő** | 0,82× sebesség, 0,78× látótáv, **0,85× elszenvedett sebzés** |

A legfontosabb következmény nem a sebzés, hanem hogy a dombról **előbb
veszed észre** az ellenséget. Ez írja át a taktikát.

Az erdő nem páncélt ad, hanem takarást — ezért szorzó, nem levonás.

**Determinizmus.** A terep a szimulációt érinti, tehát a szimulációs
magból készül, és onnantól csak olvassuk. Ugyanaz a mag → ugyanaz a domb
ugyanott. Hálózaton a 2540. lépésig szinkronban.

**Egy tanulság a mérésből.** Az első kiszabásnál négy domb került a
térképre, és 92%-a sík maradt — a magaslat így csak elvi lehetőség lett
volna, a játékos sosem találkozik vele. Sűrítve:

```
sík 43%   enyhe 19%   domb 22%   magaslat 16%
```

Magasról mérve: **1,39× látótáv, 1,30× lőtáv, 0,79× felfelé menet.**

### Évszakok korszakonként

A talaj és a lomb palettája korszakonként vált:

| korszak | évszak | talaj | lomb |
|---|---|---|---|
| 15. sz. | tavasz | friss világoszöld | világoszöld |
| 17. sz. | nyár | mély, telt zöld | sötétzöld |
| 19. sz. | ősz | barnuló, sárgás | sárga, rozsda, vörös |
| 20. sz. | tél | hideg szürkéskék | csupasz szürkésbarna |

A korszakváltás így LÁTSZIK, nem csak a fejlécben áll.

### Csata utáni nyomok

A hullák eltűnnek, a föld emlékszik:

- **elhagyott fegyver** — minden második-harmadik elesett katona után
- **égett folt** — a ledőlt épület helyén, az épület méretével arányosan
- **kráter** — ostromgép és bombázó becsapódásánál

Nem tűnnek el: a talaj nem gyógyul be egy játszma alatt. A darabszám
viszont korlátos (260) — a legrégebbi esik ki, ha megtelt. Tisztán
látvány, a szimulációt nem érinti.

### Nemzeti falazat

Hétnek volt saját homlokzata, kettőnek nem. Pótolva:

- **Spanyolország** — andalúz meszelt fal, cserép lábazat, félköríves
  kovácsoltvas-rácsos ablak. A déli építészet jellegzetessége, hogy a fal
  maga a dísz: sima, világos felület, kevés nyílással — a hőség ellen.
- **Szigetlakók** — fonott pálmalevél-fal kötözött sarokoszlopokkal.

### Ellenőrzés

Determinizmus hat féllel, hálózati szinkron, oktatómód, kalózváros,
ködrács, ponttábla, szoba — mind változatlan. A csatanyomok mérve: tíz a
tíz elleni csata után 5 elhagyott fegyver, a ledőlt kaszárnya helyén
égett folt, a 600 fölé adott nyomból 260 marad.

---

## v8.0 — Támadási próba az új részekre · 2026-08-11

A v7.0 óta bekerült a lovasság, az istálló, az új többjátékos lap és a
nemzeti jegyek. Ezeket vizsgáltam át.

### Amitől leginkább tartottam — és nem volt baj

Új egységfajtánál a legveszélyesebb, ha az ellensúlytáblából hiányzik egy
párosítás: a szorzó `undefined` lesz, a sebzés `NaN`, és onnantól az
egység vagy halhatatlan, vagy egy ütéstől meghal.

Végigmértem **264 párosítást** — minden szerep minden szerep ellen, mind
a négy korszakban, plusz a torony mint támadó. Egyetlen `NaN`, végtelen
vagy nulla érték sem keletkezett: a kikeresés `||1`-re esik vissza, ha
nincs bejegyzés.

### Két valódi hiba

**1. Gyorsbillentyű-ütközés.** A lovasnak a `6`-ost adtam — az viszont
már a halászhajóé volt. A lovas mostantól **G** (mint „gyors”).

A próba egy RÉGEBBI ütközést is megtalált, ami nem az én mostani
munkámból származik: a `0` az ostromgépé ÉS a gályáé is volt. A gálya
átkerült **J**-re.

**2. A hadjárat megkerülhető volt.** Két küldetés tiltja a kaszárnyát,
hogy a játékos csak a főhadiszállásra támaszkodhasson. Az istálló viszont
nem szerepelt a tiltásban — így lovassággal meg lehetett volna kerülni a
küldetés egész lényegét. A tiltás kiterjesztve.

### Amit még ellenőriztem

| | |
|---|---|
| mentés-betöltés lovassággal | 4 lovas + 1 istálló, hiánytalanul vissza |
| RÉGI mentés (lovasság nélkül) | betöltődik, nem hasal el |
| népesség | a lovas két helyet foglal, ahogy tervezve volt |
| hálózati szinkron | a 2380. lépésig |
| kapcsolat életciklusa | mind a 22 átmenet |
| korábbi támadási próba | idegen egység mozgatása, ideológia átírása, házigazda kirúgása továbbra sem megy |

---

## v7.9 — A többjátékos lap újratervezve · 2026-08-11

Régen egyetlen hosszú oszlop volt: név, helyi csata, szervercím, szoba
nyitása, kód, lekérdezés, lista, állapot, súgó. Két baja volt.

**A lényeg leghátul állt.** A legtöbben nyitott szobát keresnek — a lista
mégis a lap alján, hét elem után következett.

**Semmi nem mondta meg, hol tartasz.** A gombok egymás alatt sorakoztak,
de nem látszott, melyik melyik úthoz tartozik: a „Szoba nyitása” és a
„Helyi csata” ugyanúgy nézett ki, pedig az egyik hálózatot kíván, a másik
nem.

### Az új felépítés

Két keretes szakasz, mindegyik saját címmel:

```
A neved  [ Bence ]

┌ HELYI JÁTÉK ────────────────────────────┐
│ Egy gépen, hálózat nélkül. Te és         │
│ legfeljebb kilenc bot ugyanazon a térképen│
│ [ Helyi csata — botok ellen ]            │
└──────────────────────────────────────────┘

┌ HÁLÓZATI JÁTÉK ─────────────────────────┐
│ Szerver címe [ wss://… ]                 │
│ ● Válassz szobát a listából.             │
│ [ Nyitott szobák lekérdezése ]  ← arany  │
│   2 NYITOTT SZOBA                        │
│   4DGM — Anna   1/6 fő      [BELÉPÉS]    │
│   TBLN — Bence  3/6 fő      [BELÉPÉS]    │
│ ─────────────────────────────────────    │
│ [ Szoba nyitása ]                        │
│ [SZOBAKÓD] [ Csatlakozás ]               │
└──────────────────────────────────────────┘
```

A keret nem díszítés: elválasztja a két utat, hogy a szem egy
pillantással lássa, melyik gomb hova tartozik.

**A szobalista előrekerült**, és a gombja arany keretet kapott — ez a fő
út. A szobanyitás és a kódos csatlakozás alatta, elválasztó vonallal és
halványabban: ezek a ritkább esetek.

### Az állapot egy pötty lett

Külön sor helyett egy színes pont a cím alatt:

| szín | mit jelent |
|---|---|
| szürke | nincs kapcsolat |
| **arany, villogó** | keresés folyik |
| **zöld** | szobában vagy játszmában |
| **piros** | nem sikerült |

A szín a hálózati ÁLLAPOTBÓL jön, nem a szövegből — így akkor is helyes,
ha az üzenet más nyelven másképp hangzik.

Egy apróságot menet közben pontosítani kellett: ha a szerver válaszolt,
de üres, a pötty ne legyen piros. Ez nem hiba, csak nincs kivel játszani.
Mivel a lekérdező kapcsolat addigra lezárul, az állapotból ez már nem
derülne ki — ezért kifejezetten megmondjuk.

### Ellenőrzés

Az életciklus-próba mind a huszonkét átmenete rendben, a listából belépés
működik, a gombok sorrendje a szándék szerinti, és a teljes tesztsorozat
átment négy nyelven.

---

## v7.8 — Az üzenet csak egyszer · 2026-08-11

„A szerver nem érhető el ezen a címen” kétszer jelent meg egymás alatt:
egyszer a gomb alatti dobozban, egyszer az állapotsorban.

Én írattam mindkét helyre. A v7.3-ban azért tettem az állapotsorba is,
mert ott ottragadt a „Szobák lekérdezése…”, és a két üzenet ellentmondott
egymásnak — de a megoldás túllőtt a célon: az ellentmondás helyett
ismétlés lett belőle.

A részletes üzenet közvetlenül a gomb alatt áll, ott a helye. Az
állapotsor mostantól csak visszaáll az alaphelyzetbe („Nincs
kapcsolat.”). Ugyanez az üres listánál is.

Ahol az állapotsor tényleg hozzátesz valamit, ott megmarad: ha van
találat, azt írja ki, hogy „Válassz szobát a listából.”

A próba mostantól figyeli is: összeveti a lista dobozának és az
állapotsornak a szövegét, és jelzi, ha ugyanaz a mondat.

```
rossz cím    → egyszer   | állapotsor: „Nincs kapcsolat.”
üres szerver → egyszer   | állapotsor: „Nincs kapcsolat.”
két szoba    → egyszer   | állapotsor: „Válassz szobát a listából.”
```

---

## v7.7 — Egységes gombszélesség · 2026-08-11

Az Egy játékos lapon minden gomb a SAJÁT szövegéhez zsugorodott: az „Új
játék” keskeny lett, a „Visszajátszás megnyitása” széles. Egymás alatt
ez csálé lépcsőnek látszott.

Az ok a lap elrendezése: `align-items:center` — a középre igazítás
egyben azt is jelenti, hogy a gyerekek nem nyúlnak ki. A főmenü azért
volt rendben, mert az teljes szélességű oszlop.

A gomblistás lapokon mostantól egységes a szélesség, **ugyanaz a 300
pixel, amit a főmenü használ** — így a két szint egymásra épül, nem
ugrál a szem.

Egy kivétel maradt szándékosan: a beviteli mező MELLETT álló gomb
(Csatlakozás a szobakód mellett) továbbra is a szövegéhez igazodik,
különben szétverné a sort.

A „Nyitott szobák lekérdezése” egy ilyen sordobozban állt egyedül —
ezért kilógott a sorból. Kivettem onnan.

---

## v7.6 — Istálló, és két hiba a képernyőn · 2026-08-11

### A lovasság istállóba került

A lovasságot nem a kaszárnyában képzik: ló kell hozzá, abrak és lovász. A
külön épület játékban is jelent valamit — aki lovasságot akar, annak be
kell fektetnie előbb, és az istálló elvesztése elvágja az utánpótlását.

| | |
|---|---|
| nevek | Istálló → Lovasistálló → Huszárlaktanya → Járműtelep |
| ár | 150 fa + 80 élelem (a széna is élelem), **követ nem kér** |
| élet | 620–1050, kisebb a kaszárnyánál |

Nem védőmű, hanem gazdasági épület. A bot a második kaszárnya után épít
egyet, kalózvilágban nem — ott szigetek vannak, nem síkság. Hétezer lépés
után a serege: `melee:7 ranged:5 spear:8 cav:9`, épületei közt `stable:1`.

A bot képzési logikáját át kellett szervezni: eddig előbb választott
egységet, aztán keresett épületet. Most fordítva — előbb az épület, és az
istállóban úgyis csak lovas lehet.

### Egy régi fordítási hiba is előkerült

Az angol, német és kínai szótárban a **Gránátos „huszár” néven** szerepelt
(`Hussar`, `Husar`, `骠骑兵`). Ez eddig is téves volt, most viszont ütközött
is volna az új lovas vonallal. Javítva: `Grenadier`, `Grenadier`, `掷弹兵`
— és a „huszár” oda került, ahová való.

### A többjátékos képernyő két hibája

**1. A súgó duplán jelent meg.** A fordító azoknál az elemeknél, amikben
gyerekelem is van, csak az ELSŐ szövegrészt írja át — hogy a gombokon a
billentyűjel megmaradjon. A súgóbekezdésben viszont `<code>` részletek
vannak, így a fordítás a régi szöveg elé került, a maradék pedig ottmaradt.

Először úgy javítottam, hogy minden gyerekes elemnél teljes cserét írtam
elő — **az viszont kitörölte a szobapanel darabszám-mutatóját**
(`2/10 · 1 ember · 1 bot`). A próba ezt azonnal megfogta. A végleges
megoldás egy `data-tfull` jelölés: csak ott cserél mindent, ahol a
fordítás tényleg a teljes tartalom.

**2. Egyszerre látszott a „keresés” és a hibaüzenet.** Az állapotsor nem
frissült a lista mellett, így a két üzenet ellentmondott egymásnak. Most
együtt mozognak, és a lista középre került a panel szélességében.

---

## v7.5 — Egy negyedik hiba ugyanott · 2026-08-11

A szobalista három egymást követő hibát szült. Ez azt jelenti, hogy a
terület törékeny — nem elég megjavítani, le is kell szögezni.

Írtam hozzá egy **állapotátmenet-próbát**, ami a kapcsolat egész életét
végigjárja, ugyanabban a példányban, ahogy egy valódi játékos tenné:
kikapcsolt állapotból, kétszer egymás után, sikertelen próbálkozás után,
szobában várakozva, játszma közben, kilépés után. Huszonkét ellenőrzés.

### És talált egy negyediket

A sikertelen lekérdezés **hibaállapotba tette az egész hálózatot** — a
`netHiba` pedig szünetre állítja a játékot. Vagyis egy elgépelt
szervercím megállította volna a futó egyszemélyes játszmát is.

Az ok a saját beszúrásom volt: a lista-jelzés egy sorba került a netHiba
hívásával, így az is lefutott.

```js
if(n.mod==='lista'&&…) netListaHiba(); netHiba(…);   // mindkettő fut!
```

Most külön blokkban van, és a lista-mód csendben zárul: se hibaállapot,
se szünet.

### A próba eredménye

```
1. kikapcsolt állapotból          ✔ ✔ ✔
2. kétszer-háromszor egymás után  ✔ ✔
3. sikertelen próbálkozás után    ✔ ✔ ✔ ✔   (a játék NEM áll szünetre)
4. szobában várakozva             ✔ ✔ ✔ ✔ ✔ ✔ ✔ ✔
5. játszma közben                 ✔ ✔ ✔ ✔ ✔
6. kilépés után                   ✔ ✔
```

Mind a huszonkettő zöld.

### Tanulság

Négyből három hibát az okozott, hogy egy ÚJ funkció a MEGLÉVŐ kapcsolat
életciklusába nyúlt bele. Az ilyen helyeken nem elég az új utat
végigpróbálni: végig kell menni azon is, amit felülír.

---

## v7.4 — Valódi lovasság · 2026-08-11

Ez már nem grafika, hanem játéktervezés: **új egységfajta**, saját
értékekkel és helyével az ellensúlyrendszerben.

### Amit menet közben megtudtam

A meglévő közelharci vonal — **Lovag → Kürasszír → Gránátos → Tank** —
az első két korszakban NEHÉZLOVASSÁG. Csak épp gyalog volt rajzolva. Nem
hiányzott tehát a lovas, hanem a KÖNNYŰ lovas hiányzott mellőle, és a
nehéz sem látszott annak, ami.

### A könnyűlovas

| | 15. sz. | 17. sz. | 19. sz. | 20. sz. |
|---|---|---|---|---|
| név | Könnyűlovas | **Huszár** | Ulánus | Felderítő páncélos |
| élet | 80 | 100 | 120 | 190 |
| sebesség | 118 | 124 | 132 | **150** |

A leggyorsabb szárazföldi egység. Ára 70 élelem + 40 arany, két
népességhely. Kaszárnyában képezhető, a **6**-os billentyűvel.

### A háromszögből négyszög

```
pika    →  ver MINDEN lovast (könnyűt 2.2×, nehezet 1.85×)
lovas   →  ver minden lövészt (1.9×) és munkást (1.8×)
lövész  →  veri a pikát (1.5×)
nehéz   →  veri a lövészt (1.7×) és a könnyű lovast (1.15×)
```

A könnyűlovas a nehéz ellen gyenge (0.75): a páncél kifogja a szablyát.
Így nem VÁLTJA KI a meglévő vonalat, hanem kiegészíti — a dolga a
portyázás, nem a csatasor.

Csataproba, nyolc a nyolc ellen, tiszta terepen:

```
lovas ⟷ lövész :  8 túlélő (86 élet)  ⟷  0
lovas ⟷ pika   :  1 túlélő (17 élet)  ⟷  8 (85 élet)
lovas ⟷ nehéz  :  0                   ⟷  7 (115 élet)
```

Pontosan a tervezett kép: a lövészt lemészárolja, a pikasoron elvérzik,
a páncélos lovag ellen esélytelen.

### A ló rajza

Három réteg: a négy láb vágtaütemre, a test-nyak-fej, és a **nemzeti
szerszám**. A lovas ugyanazokból az alkatrészekből épül, mint a gyalogos,
csak feljebb ültetve — így a nemzeti fejfedő és a fegyverjegy magától
ráöröklődik, nem kellett külön megírni.

| takaró | nemzet |
|---|---|
| **párducbőr**, foltokkal | Magyarország |
| hímzett **csótár** | Lengyelország, Oroszország, Ausztria |
| **lópáncél** | Spanyolország, Németország |
| nyeregtakaró | Franciaország, Nagy-Britannia |

A ló színe az egység azonosítójából jön: pej, fakó vagy fekete — így a
lovasság nem egyforma tömeg.

### A bot is használja

Az ellenszer-választása négyágúra bővült: lövész ellen lovast képez,
lovas ellen pikát. Alaphelyzetben is kerül lovas a seregébe, különben a
játékos sosem találkozna vele. Mérve, hétezer lépés után:
`melee:7 ranged:8 spear:11 cav:4`.

### Ellenőrzés

Determinizmus hat féllel, hálózati szinkron az 1720. lépésig, oktatómód,
kalózváros, ponttábla, szoba — mind változatlan.

---

## v7.3 — A szobalista négy állapota · 2026-08-11

A gomb megvolt, de csak az egyik végállapotot mutatta: ha jött lista,
kiírta. Ha nem, semmi sem történt a képernyőn — és a játékos nem tudta,
hogy keresés folyik-e, üres-e a szerver, vagy el sem érhető.

| állapot | mit mutat |
|---|---|
| **keresés** | „Szobák lekérdezése…”, mozgó pontokkal |
| **nincs szoba** | a szerver válaszolt, de üres |
| **lista** | fejléc a darabszámmal, alatta a szobák belépőgombbal |
| **hiba** | „A szerver nem érhető el ezen a címen.” |

### Nyolc másodperces türelem

Ha a cím rossz vagy a szerver nem fut, a kapcsolat néha nem hibázik,
csak hallgat. Ilyenkor a lista örökre „keresés” állapotban ragadt volna.
Nyolc másodperc után magától hibára vált.

### Magától lekérdez

A Többjátékos panel megnyitásakor a lekérdezés magától lefut — enélkül a
játékosnak előbb rá kell jönnie, hogy egyáltalán van gomb. A gomb marad,
frissítésre.

### Három hiba, amit a próba fogott meg

**1. Az önműködő lekérdezés elvágta a futó kapcsolatot.** A lekérdezés
új kapcsolatot nyit; aki épp egy szobában ült vagy játszott, kiesett
volna a játszmából pusztán attól, hogy megnyitotta a többjátékos lapot.
A próbapadon a 2. fél munkásai tűntek el a másik két gépről: `7 / 0 / 0`.
Mostantól futó szoba vagy játszma mellett nem kérdezünk.

**2. A védelem előbb túl szigorú lett.** Minden nem-kikapcsolt állapotot
tiltott — így egy sikertelen próbálkozás után soha többé nem lehetett
lekérdezni. Csak a szobában várakozás és a játszma tilt.

**3. A lekérdező kapcsolat lezárása belezavart a belépésbe.** A záródás
`onclose`-a felülírta az épp születő ÚJ kapcsolat állapotát: a belépés
után a helyszám nulla maradt. Most előbb leválasztjuk a kezelőket, csak
azután zárunk.

### Ellenőrzés valódi szerverrel

```
rossz cím    → azonnal „keresés”, majd „A szerver nem érhető el…”
üres szerver → „Most nincs nyitott szoba ezen a szerveren.”
két szoba    → fejléc + JUD3 (Anna) + L6CR (Bence), soronként egy Belépés
belépés      → helyszám 1, a házigazda névsorában megjelent a név
panel nyitás → magától lekérdez
```

A hálózati vizsgálat is helyreállt: `8 / 8 / 8` munkás, végig szinkronban.

---

## v7.2 — Fegyverek, zászlók, tetők · 2026-08-11

A v7.1 a fejfedőkkel kezdte; ez a három maradék réteg.

### Fegyversziluett

A fejfedő közelről mond sokat, a FEGYVER viszont messziről: a kopja
hossza, a zászlócska a hegyén, az alabárd bárdja — ezek ott bontják meg
a körvonalat, ahol a katona amúgy csak egy folt.

| nemzet | jegy |
|---|---|
| Lengyelország | hosszabb **kopja**, csapatszínű zászlócskával a hegy alatt |
| Spanyolország | **alabárd**: bárdlap és ellenoldali horog |
| Magyarország | **szablya** az oldalán, aranyozott markolattal |
| Nagy-Britannia | **szurony** a puskacsövön |
| Oroszország | **berdis**, széles öblös bárd |
| Franciaország | zászlócska a szálfegyveren |
| szigetlakók | kötözött szigony |

A meglévő fegyvert nem cseréltem le, csak kiegészítettem — így a harci
érték és a rajzolás többi része érintetlen. A 19. századtól a szálfegyver
eltűnik, ezért ott csak a szurony marad.

### Zászlóvivők

Minden katona fölé zászlót tenni zsúfolt és olvashatatlan lenne. Ezért
**csoportonként egy**: az egység azonosítója dönti el, ki viszi, így
nagyjából minden kilencedik katona zászlós, egyenletesen elosztva. A
döntés minden gépen ugyanaz, mert az azonosító a szimulációból jön.

A lobogó a fej fölött hullámzik, csapatszínnel és kiemelő sávval. A 20.
századtól elmarad: akkor már nem vitt lobogót a raj.

Mérve: a 9-es azonosítójú katona 25 rajzelemet kap, a 10-es nullát.

### Nemzeti tetőforma

Az épületeknél eddig csak a tető és a fal SZÍNE volt nemzeti. Pedig a
városok sziluettjét éppen a tető adja.

| forma | nemzet |
|---|---|
| **hagymakupola**, arany kereszttel | Oroszország |
| **meredek gótikus gúla** | Németország, Ausztria, Lengyelország |
| **lapos sátortető**, széles eresszel | Spanyolország |
| homorú **palatető** | Franciaország |
| **ormos, gerinces** tető kéménnyel | Nagy-Britannia |
| **nádfedél** | szigetlakók |
| kúp (a régi) | Magyarország, kalózok |

Csak a toronysisakot cseréltem; a falak és az ablakok változatlanok — így
a forma mindenhol megjelenik, ahol torony van, a meglévő rajzolás
sértetlen marad.

**Egy buktató, amit észrevettem:** a tetőforma az ÉPÜLET tulajdonosának
nemzetéből jön, nem a helyi játékoséból. Enélkül a hódított városok is a
te tetőidet viselnék.

### Ellenőrzés

Rögzítő vászonnal: a lengyel kopja 21 rajzelem (a leghosszabb), a spanyol
alabárd 15, a magyar szablya 11, a brit szurony 9. Hat különböző
tetőforma. A determinizmus-próba változatlan — a látvány nem szól bele a
szimulációba.

### Ami még hátravan

- **Lovasság**: nincs külön lovas egységfajta, a lovasság a `melee`
  fejlettebb korszaka. A ló takarója és a huszár párducbőre külön
  egységet kívánna, ami már a JÁTÉKMENETET is érintené.
- Nemzeti falazat és ablakforma
- Terep- és növényzetváltozatok tájanként

---

## v7.1 — Mindenki a saját nevén · 2026-08-11

Eddig a szobában „Házigazda” és „Vendég” állt. Hat fős szobában ez
használhatatlan: a `Vendég 2` senkinek nem mond semmit.

Innentől a **Többjátékos** panel legfelső mezője a neved, és név nélkül
nem lehet csatlakozni. Ezt látják a többiek:

- a szobaképernyőn, a helyek listájában
- a ponttáblán játék közben
- a kilépési és kiesési üzenetekben

A saját sorod a szobában a neveddel és `(te)` jelöléssel áll — így
mindenki UGYANAZT a névsort látja, csak más sor van kiemelve. A név
megjegyződik, mint a szerver címe: nem kell minden csatlakozásnál újra
begépelni.

### Két hibát fogott meg a próba

**A nevek első betűje eltűnt.** A szerver névszűrője így nézett ki:

```js
.replace(/[<>&"'\\\\u0000-\\\\u001f]/g,'')
```

A kétszeres visszaper miatt a karakterosztályba nem a vezérlőjelek
tartománya került, hanem a `\\`-től az `u`-ig terjedő — abba pedig a
NAGYBETŰK is beleesnek. „Bence” így „ence” lett, „Anna” pedig „nna”. A
tartomány külön sorba került, egyszeres visszaperrel.

**A ponttáblán a saját sorod „Te” maradt.** A javítás egy korábbi
átnevezés miatt nem illeszkedett a szövegre, így csendben kimaradt — a
próba mutatta meg, hogy a többiek nevét látom, a sajátomat nem.

### Ellenőrzés

```
név nélkül  : „Adj meg egy nevet — ezt látják a többiek.”, nincs csatlakozás
névvel      : névsor mindkét gépen  0:Bence, 1:Anna
szoba A-nál : Bence (te) | Anna | Bot 2
szoba B-nél : Bence | Anna (te) | Bot 2
ponttábla   : Bence | Anna | Lengyelország | Spanyolország — mindkét gépen
```

A név a kliensben és a szerveren is átesik a szűrésen: jelölőnyelvszerű
és vezérlőkarakterek nem juthatnak át, a hossz 24 karakter.

A teljes tesztsorozat — egyszemélyes és hálózati — átment.

---

## v7.1 — Nemzeti jelleg: sisak, kalpag, szárny · 2026-08-11

Eddig a nemzetek csak SZÍNBEN különböztek: az egyenruha palettája
keveredett a csapatszínnel. Ránézésre minden sereg egyforma volt —
ugyanaz a sisak, ugyanaz a sziluett.

### Miért a körvonalat bontottam meg, nem a színt

Mert a sziluett az, amit a csata zűrzavarában valóban látsz. A színt
elnyeli az éjszaka, a por és a köd; egy kalpag vagy egy szárnypár viszont
messziről is felismerhető. Egy tucat katona között a forma számít, nem az
árnyalat.

### Amit kaptak

| | 15. század | 17. század | 19. század | 20. század |
|---|---|---|---|---|
| Magyarország | prémes kalpag | kalpag | huszárcsákó zsinórral | acélsisak |
| Lengyelország | **szárnyas huszár** | szárnyas huszár | négyszögletes czapka | acélsisak |
| Nagy-Britannia | csöbörsisak | háromszögletű kalap | **medvebőr kucsma** | lapos rohamsisak |
| Spanyolország | **morion taréjos sisak** | morion | csákó | oldalsapka |
| Franciaország | csöbörsisak | háromszögletű kalap | csákó | Adrian-sisak |
| Németország | csöbörsisak | széles karimájú kalap | **tüskés sisak** | acélsisak |
| Ausztria | csöbörsisak | széles karimájú kalap | csákó | acélsisak |
| Oroszország | csúcsos prilbica | széles karimájú kalap | csákó | csillagos posztósapka |
| kalózok | fejkendő | fejkendő | fejkendő | fejkendő |
| szigetlakók | tollpánt | tollpánt | tollpánt | tollpánt |

A lengyel szárny a legfeltűnőbb: hátra szíjazott tollpár, oldalról és
hátulról teljes szélességben, szemből keskenyebben, hogy ne takarja az
arcot.

### Hogy nem lett belőle új rendszer

A jegy a fej UTÁN rajzolódik, egyetlen függvényben. Nem új egységfajta —
azzal a JÁTÉKMENET is változna —, hanem ráfestett réteg a meglévő
katonára. A szimulációt egyáltalán nem érinti: kizárólag látvány, és a
determinizmus-próba ezt meg is erősítette.

### Ellenőrzés

Mind a 40 nemzet-korszak kombináció hibátlanul rajzol. Rögzítő vászonnal
összevetve **20 különböző rajzolat** a 40-ből — a többi szándékos
egyezés: egy 19. századi csákó nagyjából mindenhol csákó volt.

Az első mérés csak 17-et adott, mert a 19–20. századra a legtöbb nemzet
ugyanarra a csákóra és sisakra futott ki — épp ott veszett el a
változatosság, ahol a legtöbb egység harcol. Ezért kapott a magyar
huszárcsákót, a lengyel rogatywkát, a spanyol oldalsapkát.

### Ami még hátravan a látványból

- **Zászlók és jelvények** az egységek fölött, csapatonként
- **Nemzeti épületstílus** — ma csak a tető- és falszín különbözik
- **Fegyverek sziluettje**: a szárnyas huszár kopjája, a konkvisztádor
  alabárdja
- **Lovasság**: a ló takarója és szerszáma nemzetenként

---

## v7.0 — Támadási próba az egész játékon · 2026-08-11

A korábbi vizsgálat csak a hálózatot nézte. Most az egészet: mentések,
fájlkezelés, asztali burok, megjelenítés. **Öt hibát találtam.**

### 1. Idegen név a szobalistában — szkriptbeszúrás

A nyitott szobák listája így épült:

```js
bal.innerHTML = '<b>'+sz.kod+'</b> — '+(sz.nev||'')+…
```

A `sz.nev` a HÁZIGAZDA neve, amit egy másik kliens ad meg. Aki átírja a
saját kliensét, tetszőleges HTML-t és szkriptet juttathatott volna a te
ablakodba pusztán azzal, hogy így nevezi el magát.

Az asztali alkalmazásban ez súlyosabb: a `contextIsolation` miatt a
Node-hoz ugyan nem ér el, de a **mentéseidhez igen**, a tárolóhídon
keresztül.

A sor mostantól DOM-ból épül, `textContent`-tel — ami név, az név marad.
A szerver is szűri a neveket, két védvonal olcsóbb, mint egy.

Próbával: `<img src=x onerror=…>` néven a lista **nulla** `<img>` elemet
hoz létre, és a szkript nem fut le.

### 2. Az asztali ablak elnavigálható volt

Ha valami mégis külső címre navigálna vagy új ablakot nyitna, az Electron
alapból megtenné. Mostantól minden nem-fájl navigáció tiltott, és a
külső hivatkozások a rendszer böngészőjében nyílnak — a játékablak sosem
tölt be idegen tartalmat.

### 3. Sérült mentés megfektethette a játékot

A betöltés csak a változatszámot és egy épület meglétét nézte. Ami
átcsúszott rajta:

| a mentésben | ami történt volna |
|---|---|
| ismeretlen nemzet | `NATIONS[…]` undefined, onnantól minden rajzolás elszáll |
| korszak 999 | `AGES[…]` undefined |
| NaN koordináta | az egység a semmibe kerül, az útkeresés megakad |
| húszezer egység | a memória elfogy |

Az új átvizsgálás nem javít, hanem **kiszűr**: ami értelmetlen, az
kimarad, így egy félig sérült mentésből is menthető a java. Mind a hét
próbafájlt elutasította, kivétel nélkül, összeomlás nélkül — a szabályos
mentés viszont változatlanul betöltődik (20 egység, 8 épület mindkét
oldalon).

### 4. Félbemaradt betöltés törött világot hagyott

Ha a betöltés a közepén hasalt el, a világ félig a régi, félig az új
adatokból állt. Abban játszani értelmetlen, és a hibák onnantól
megjósolhatatlanok. Mostantól ilyenkor visszakapod a menüt.

### 5. A mentés írása nem volt megszakításbiztos

Áramszünet vagy összeomlás pont az írás közben tönkretehette volna a
mentést — vagyis azt, amiért az egész készült. Az írás mostantól
**atomikus**: előbb ideiglenes fájlba megy, aztán átnevezés. A régi
mentés így érintetlen marad, a fél fájl az ideiglenesben pusztul.

### Amit megvizsgáltam, és rendben volt

- **Fájlnév-tisztítás**: `../../../etc/passwd` → `.._.._.._etc_passwd.json`.
  A kulcsból sosem lehet kilépni a mentésmappából. (Windows fenntartott
  eszközneveit — CON, PRN, NUL, COM1-9 — most már szintén kezeli.)
- **Electron**: `contextIsolation: true`, `nodeIntegration: false`.
- **Többjátékos**: a korábbi támadási próba újra lefutott — idegen
  egységet mozgatni, ideológiát átírni, házigazdát kirúgni továbbra sem
  lehet, az üzenetözönt a szerver bontja.

### Ami továbbra sem védhető meg

A lockstep modellben minden kliens ismeri a teljes világállapotot: egy
módosított kliens **kikapcsolhatja magának a ködöt**. Ez ellen csak
szerveroldali szimuláció védene, ami más felépítést kívánna.

A teljes tesztsorozat — egyszemélyes, hálózati, négy nyelven — átment.

---

## v6.9 — A mentések valódi fájlok · 2026-08-11

### Mit jelentett a „böngészőbe mentett állás”

A játék eddig a böngésző saját tárolójába (`localStorage`) mentett.
Böngészőben ez az egyetlen lehetőség, asztali alkalmazásban viszont
zavaró volt:

- másik böngészőből megnyitva **nem látszott** a mentés
- előzménytörléskor **eltűnt**
- nem lehetett átmásolni másik gépre, és nem lehetett róla biztonsági
  másolatot csinálni

### Innentől fájlba megy

Ha az asztali burok jelen van, minden állás, beállítás és teljesítmény
külön JSON-fájlba kerül a felhasználói mappába:

```
Windows : %APPDATA%\\Birodalom\\tarolo\\
macOS   : ~/Library/Application Support/Birodalom/tarolo/
Linux   : ~/.config/Birodalom/tarolo/
```

Az **Egy játékos** panelen új gomb nyitja meg ezt a mappát a
fájlkezelőben — így meg is találod, el is tudod tenni őket. Böngészőben
a gomb rejtve marad, mert ott nincs mit megnyitni.

### Hogy nem kellett a fél játékot átírni

Új réteg került a legaljára (`00e-tarolo.js`), a localStorage-éval azonos
alakú felülettel: `tarolIr`, `tarolOlvas`, `tarolTorol`. Ha van asztali
burok, fájlba ír, ha nincs, marad a régi út. A tizenkét hívás a
mentésben, a teljesítményekben, a nyelvben, a gyorsbillentyűkben és a
szerver címénél gépiesen cserélhető volt.

A híd hívásai **szinkronok** (`sendSync`). Kis JSON-oknál ez
ezredmásodperc, cserébe a meglévő, szinkron mentőkódot nem kellett
átalakítani.

A fájlnév a kulcsból képződik, és mindent kiszűrünk belőle, ami a
fájlrendszert megzavarhatná — a játék nem tud kilépni a saját mappájából.

### Aki eddig böngészőből játszott

Az első asztali indításnál a játék **átemeli** a localStorage-ban talált
mentést, teljesítményeket, billentyűkiosztást és szervercímet — de csak
akkor, ha a fájl még nem létezik, nehogy egy régi böngészős állás
felülírja a frisset.

### Ellenőrzés

```
böngésző : fájlba ment = false, localStorage kap értéket, mappagomb rejtve
asztali  : fájlba ment = true, a lemezre ír, localStorage ÜRES,
           mappagomb látszik és megnyitja a mappát
mentés   : birodalom_save a lemezen, visszaolvasva „Magyarország, 15. század”
átemelés : 1 kulcs átköltöztetve a böngészőből
```

A teljes tesztsorozat — egyszemélyes, hálózati, négy nyelven — átment.

### Amit őszintén tudni kell

Az asztali alkalmazás belül továbbra is böngészőmotort használ (Electron
= Chromium), ahogy a legtöbb mai asztali program. A KÜLÖNBSÉG az, ami
számít: a mentéseid mostantól rendes fájlok, amiket látsz, másolsz és
átviszel — nem a böngésző takarításakor eltűnő adatok.

---

## v6.8 — Átrendezett főmenü és a nyitott szobák listája · 2026-08-11

### A főmenü hat sorra fogyott

Kilenc sor volt benne, és a lényeg elveszett köztük: hogy egyedül vagy
másokkal akarsz-e játszani. Az Új játék, a Folytatás, a Csata és a
Visszajátszás mind egy szinten állt a Beállításokkal.

```
Egy játékos
Többjátékos
Teljesítmények
Beállítások
Oktatómód
Kilépés
```

Az **Egy játékos** alatt: Új játék, Korábbi betöltése, Folytatás,
Visszajátszás megnyitása.

A Folytatás és a Korábbi betöltése eddig egyetlen gomb volt, holott két
különböző dolog: a **Folytatás** a böngészőbe mentett állást tölti vissza
(és most is kiírja, melyik nemzet, melyik korszak, mennyi idő), a
**Korábbi betöltése** pedig fájlból. Utóbbi korábban sehonnan nem volt
elérhető a menüből.

### A Csata a Többjátékos alá került

Az is „több fél egy térképen”, csak hálózat nélkül — a főmenüben külön
sorként inkább zavart. A Többjátékos panel felül a **Helyi csata — botok
ellen** gombbal kezd, alatta jön a hálózati rész.

### Nyitott szobák listája

Eddig kódot kellett gépelni ahhoz, hogy csatlakozz — és ha senki nem
nyitott szobát, ez csak a sikertelen próbálkozásból derült ki.

A **Nyitott szobák lekérdezése** gomb megkérdezi a szervert, mely szobák
várnak még játékosra:

```
CSD6 — Házigazda   2/6 fő   [ Belépés ]
AECQ — Bence       1/6 fő   [ Belépés ]
```

Egy kattintás, és bent vagy. A listába csak az még el nem indult, nem
teli szobák kerülnek — a többibe úgysem lehetne belépni.

A lekérdezéshez a kliens „lista” módban kapcsolódik: nem lép be sehová,
csak kérdez. A szerver oldalán ez egy új üzenettípus (`szoba-lista`).

> A kód benne van a listában. Aki ugyanazon a szerveren van, amúgy is
> beléphetne — a szerver a te géped, nem nyilvános szolgáltatás. Ha
> később kellene rejtett szoba, egy jelölőmező elég hozzá.

### Egy hiba, amit másodszor követtem el

A szobalista gombjának bekötését a menü felépítésébe írtam, a
`netCimMent` és a `netAll` viszont egy másik függvény helyi változói —
„nincs ilyen név”, és a gomb néma maradt. Pontosan ugyanaz a tévedés,
mint korábban a Csata gombjánál. Áthelyezve a hálózati gombok közé.

### Ellenőrzés

Valódi szerverrel: üres szerveren „nincs nyitott szoba”, egy szoba
nyitása után megjelenik a kóddal és a létszámmal, a Belépés gombbal a
kliens megkapta az 1-es helyszámot, és a házigazda névsorában is
megjelent. A teljes tesztsorozat — egyszemélyes, hálózati, négy nyelven —
átment.

---

## v6.7 — A bemutatkozó kártya végig egynyelvű · 2026-08-10

A v6.6-ban lefordultak az életrajzok, de a kártyán maradt egy keveredés:
német leírás magyar névvel.

```
Hunyadi Mátyás · Magyar Királyság · 15. Jahrhundert
```

A `NATIONS` tábla három szöveges mezője magyar volt: a nemzet neve, a
korszakonkénti államforma és a korszakonkénti uralkodó. Mind a 96 szöveg
lefordult angolra, németre és kínaira, és külön modul lett belőlük
(`02e-nations-lang.js`).

### A nevek nem szó szerint fordulnak

Az uralkodók a legtöbb nyelvben saját, meghonosodott alakban élnek —
Hunyadi Mátyás angolul és németül **Matthias Corvinus**, kínaiul
**马加什一世**. Ahol nincs meghonosodott alak (Charles de Gaulle, Winston
Churchill), ott az eredeti marad; a magyar szöveg is így hozza.

A magyar névsorrend a másik három nyelvben megfordul: Kossuth Lajos →
**Lajos Kossuth**, Bismarck Ottó → **Otto von Bismarck**. Ez nem stílus
kérdése, hanem a névhasználaté.

### Nyolc helyen kellett átkötni

A három mezőt a kód nyolc helyen olvasta közvetlenül: a portrékártyán, a
bemutatkozó képernyőn, az életrajzon, a korszakváltás üzenetében, a
hadjárati eligazításban, a győzelmi képernyőn, a hősnél és a
nemzetválasztó listán. Mindegyik a `nemzetNev()`, `allamForma()` és
`uralkodoNev()` függvényeken keresztül dolgozik, és mindhárom a magyarra
esik vissza, ha nincs fordítás.

### Az eredmény

```
hu:  Hunyadi Mátyás — Magyar Királyság
en:  Matthias Corvinus — Kingdom of Hungary
de:  Matthias Corvinus — Königreich Ungarn
zh:  马加什一世 — 匈牙利王国
```

A portrékártya németül immár végig egynyelvű:

```
Matthias Corvinus · Königreich Ungarn · 15. Jahrhundert
König von Ungarn ab 1458 bis zu seinem Tod…
```

Két elgépelést a próba fogott meg: a portré és a nemzetválasztó
átkötésébe olyan változónevet írtam (`nk`, `k`), ami ott nem létezik.

A teljes tesztsorozat mind a négy nyelven, valamint a hálózati vizsgálat
és a determinizmus is átment.

---

## v6.6 — Az uralkodói életrajzok négy nyelven · 2026-08-10

Az utolsó nagy magyar szövegtömb is lefordult: **48 uralkodói életrajz**,
mindegyikhez egy rövid felvezetés és egy bővebb szöveg, angolul, németül
és kínaiul. Ezek a bemutatkozó kártyán és a portréra kattintva jelennek meg.

### Miért nem a nagy szótárba került

A `T('kulcs')` szótár apró feliratokra való: gombnevek, üzenetek. Ez itt
folyó szöveg, bekezdésnyi terjedelemben — ott elveszett volna a több száz
rövid kulcs között, és a magyar eredetit is nehéz lett volna mellette
olvasni.

Ezért külön modul lett belőle (`22d-rulers-lang.js`), `nemzet-korszak`
kulccsal. Amelyik nyelvhez nincs fordítás, ott a magyar marad — üres
kártya sosem keletkezik.

### Amit lefordítottam

| | |
|---|---|
| kalózvilág | Nassau köztársasága, Charles Vane, Calico Jack, Anne Bonny, Fekete Szakáll, Stede Bonnet, a taínók |
| nemzetek | Magyarország, Ausztria, Lengyelország, Spanyolország, Németország, Franciaország, Nagy-Britannia, Oroszország — korszakonként egy uralkodó |

A 20. századi alakoknál a magyar szöveg kimondja, hogy a megítélésük
vitatott; a fordítás ugyanígy tesz, nem szépít és nem dönt el. Horthy,
Franco, Hindenburg és Churchill életrajzánál ez különösen fontos volt.

A kalózfrakciók 2. és 3. korszaka a magyar szövegben is az 1. rövidített
változatát ismétli — a fordítás ugyanígy. Ezt először kihagytam, és a
teljességi próba fogta meg: hiányzó `bb-2 bb-3 sb-2 sb-3 nat-2 nat-3`.
Pótolva; most 48/48.

### Ellenőrzés

```
48 fordított bejegyzés   hiányzó: nincs
en:  King of Hungary from 1458 until his death…
de:  König von Ungarn ab 1458 bis zu seinem Tod…
zh:  1458年起在位直至去世的匈牙利国王…
```

A portré életrajza németül: név, évszám, ország, korszak és mindkét
szöveg a helyén. A teljes tesztsorozat — egyszemélyes és hálózati — újra
átment.

### Ami még magyar

Az **uralkodók nevei** és az **államformák** (Magyar Királyság, Hunyadi
Mátyás) — 96 rövid szöveg. A kártyán ezért most keverednek a nyelvek:
német leírás magyar névvel. Külön menetnek való.

---

## v6.5 — Harminckét fordítatlan üzenet · 2026-08-10

A többjátékos lezárása után átfésültem a felületet: kerestem olyan
szövegeket, amik magyarul jelennek meg akkor is, ha valaki angolra,
németre vagy kínaira váltott.

**Harminckettőt találtam.** Ezek nem menüfeliratok — azokat a v4.5-ben
mind lefordítottam —, hanem JÁTÉK KÖZBENI üzenetek, amik csak bizonyos
helyzetekben villannak fel. Épp ezért kerülték el a figyelmemet: a
menüket végignéztem, de az „Elfogyott a szén” üzenet csak akkor jön elő,
ha valaki tényleg szén nélkül marad egy 19. századi csatában.

A teljes lista, amit érintett:

| terület | üzenetek |
|---|---|
| gazdaság | nincs munkás, nincs elég nyersanyag, kapunyitás, lerombolás megerősítése, akadémia hiánya, korszakhoz kötött fokozat |
| harc | elfogyott a szén, az ellenség átállította az egységedet |
| munkások | nincs hova lerakni, továbbmennek a következő építkezésre |
| hajók | megtelt, elfoglalták, elfogyott a legénység, villám, tölcsér, partraszállás |
| felület | billentyűkurzor, jelölj ki egységeket, nincs katonád, alakzat |
| mentés | rossz fájl, sikertelen mentés, visszajátszás |
| egyéb | új korszak, járvány vége, kereskedőhajó, királyi hajóhad, rajzolási hiba |

Ráadásul az **alakzatnevek** közül a „Vonal” beégetve maradt (az „Ék” és a
„Négyszög” fordult) — és mivel ezek a betöltéskor egyszer épülnek fel,
nyelvváltáskor frissíteni is kell őket.

Ellenőrizve mind a négy nyelven:

```
en:  You have no available worker. | A gate has opened in the wall…
     alakzat: Line, Wedge, Square
de:  Du hast keinen verfügbaren Arbeiter. | Ein Tor hat sich…
     alakzat: Linie, Keil, Karree
zh:  你没有可用的农奴。| 城墙上开了一道门…
     alakzat: 横队, 楔形, 方阵
```

Az ellenőrző kereső mostantól nulla fordítatlan üzenetet talál a
`toast()` és `announce()` hívásokban.

### Ami továbbra is csak magyarul van

Az **uralkodói életrajzok** (44 bejegyzés, rövid és hosszú szöveggel).
Ezek a bemutatkozó kártyán és a portréra kattintva jelennek meg. Nagy
mennyiségű folyó szöveg — külön menetben érdemes nekiállni.

---

## v6.4 — Terheléspróba: 6 meccs, 10 fő, minden maxon · 2026-08-10

Építettem egy próbapadot, amiben valódi játékpéldányok mellett
protokollszintű résztvevők is ülnek — így hat fős szoba is felállítható
úgy, hogy csak néhány teljes játék fusson a gépen.

### Amit a terhelés kibírt

| próba | eredmény |
|---|---|
| 6 szoba × 6 ember (36 kapcsolat), 20 mp | 356 632 továbbított üzenet, **0 bontás** |
| a hetedik jelentkező a teli szobába | szabályosan elutasítva |
| szobák elkülönülése | a fogadott/küldött arány pontosan ötszörös — mindenki csak a saját szobájából kap |
| teljes felállás: 10 fél, utolsó korszak, legnehezebb | 2648 lépés, végig szinkronban, **repülőkkel** |
| 3 párhuzamos, teljes méretű meccs | mind a három végig szinkronban |

### Három valódi hibát talált

**1. Memóriakimerítés a jövőbeli csomagokkal.** A lépéscsomagokat a
jövőbeli lépésszám alatt tároljuk, és amíg a szimuláció oda nem ér, ott
ülnek a memóriában. A próbán **1388 függőben lévő csomag** gyűlt össze,
1389 lépéssel előre. Egy gyorsabb — vagy rosszindulatú — kliens így
elfogyaszthatta volna a gépedet. Mostantól 300 lépésnél távolabbi
csomagot eldobunk; a mérés 8-ra esett.

**2. Holtpont kiesésnél — ez volt a legsúlyosabb.** Ha valakinek
megszakadt a vonala, a kiesését a rendszer a JÖVŐBE ütemezte:

```
a 509. lépésnél állunk, várunk a 4. félre
a kiesését a 533. lépésre hirdetjük ki
… de az 510.-et sem tudjuk megtenni, mert épp rá várunk
```

A meccs **véglegesen befagyott**. Most a kihirdetéskor a közbeeső
lépéseket üresre töltjük — a távozó úgysem küld semmit —, így a
kihirdetett lépés elérhetővé válik. A lépésszám minden gépen ugyanaz,
tehát a kizárás determinista marad.

**3. A biztonsági kapcsoló képkockát számolt.** Amikor a szimuláció áll,
a képkockák is ritkulnak — a régi 600-as számláló csak percek múlva telt
volna be. Most 20 másodpercet mérünk, és **az összes néma felet
egyszerre** ejtjük ki, nem egyesével: három egyidejű szakadásnál a régi
megoldás húsz másodpercenként csak egyet vett ki.

Mérve, három néma résztvevővel:

```
régi (egyesével)   : 84 mp-ig araszolt, mire kitisztult
új  (egyszerre)    : 60 mp-nél mind kiesett, onnan teljes sebesség
                     2648 lépés, végig szinkronban
```

### Apróság

A szerver üzenetkorlátja 300-ról **500/másodpercre** nőtt. Egy szabályos
kliens húsz körüli csomagot küld másodpercenként, de torlódás utáni
bepótláskor a 300 szűk lehetett volna.

### Regresszió

A teljes sorozat újra lefutott: menü, oktatómód, determinizmus, ködrács,
kalózváros, ponttábla, kikötőmenü, szoba, raktárak — és hálózaton az
átfogó vizsgálat, a megállás-próba, az építés és a támadási próba is.
Mind hibátlan.

---

## v6.3 — Támadási próba: mit tud egy módosított kliens? · 2026-08-10

Eddig azt vizsgáltam, hogy a többjátékos jól működik-e, ha mindenki
tisztességesen játszik. Most az ellenkezőjét: **mit tudna elérni valaki,
aki átírja a saját kliensét.**

A protokoll bizalmi alapon működött: a kliensek egymás parancsait
futtatják, és a fogadó oldal nem nézte meg, hogy a feladó a SAJÁT
birodalmához nyúl-e. Három kihasználható rés volt.

### 1. Bárki mozgathatta bárki seregét

A `selVissza(idk)` tetszőleges egységazonosítót elfogadott:

```js
for(const id of idk) if(map[id]) G.sel.push(map[id]);
```

Egy módosított kliens beírhatta volna a TE egységeid azonosítóit a saját
parancsába, és elsétáltathatta volna a seregedet — a te gépeden is,
hiszen a parancs mindenhol lefut. Ugyanígy a kiképzés: idegen kaszárnyába
lehetett volna sorba állni.

Most minden parancs a feladó tulajdonához van kötve. A `G.enId` a
végrehajtás alatt épp azt jelenti: „ki adta ki ezt”.

### 2. Bárki átírhatta bárki ideológiáját

A `doct` parancs paraméterként vitte, kire hat. Mostantól a `fel`
paramétert eldobjuk, és mindig a feladóra alkalmazzuk.

### 3. Bárki kirúghatta a házigazdát

A `netKilepett` parancs bármelyik helyszámot elfogadta. Mostantól csak a
**kijelölt bejelentő** (a legkisebb sorszámú talpon maradt fél) ejtheti
ki a játékosokat — ezt mindenki ugyanúgy kiszámolja, tehát a hamis
parancs egyszerűen hatástalan.

### 4. A szerveren nem volt semmilyen korlát

Egyetlen kapcsolat megbéníthatta volna az egész gépet. Bevezetve:

```
üzenetméret       64 kB      felette bontjuk a kapcsolatot
feldolgozatlan puffer 256 kB  felette bontjuk
üzenet/másodperc  300        felette bontjuk
szobák száma      200
játékosnév        24 karakter
```

Ezek nem a szó szoros értelmében vett biztonsági korlátok — elszánt
támadót nem tartanak vissza —, hanem azt akadályozzák meg, hogy egy
hibás vagy rosszindulatú kliens elfogyassza a gép memóriáját.

### A támadási próba

Írtam egy „támadó” klienst, ami közvetlenül a hálózatra küld parancsokat,
megkerülve a játék felületét:

```
1. az áldozat egységeinek mozgatása → 0 egység mozdult, a hely változatlan
2. az áldozat ideológiájának átírása → változatlan
3. a házigazda kirúgása              → továbbra is ember, játszik tovább
4. 2000 üzenet elárasztásként        → a támadó kapcsolatát a szerver bontotta,
                                       az áldozat játszmája zavartalanul futott
```

Szerver naplója: `üzenetözön, bontás: 2`.

### Amit NEM old meg — és őszintén tudni kell

A lockstep P2P modellben minden kliens ismeri a teljes világállapotot.
Egy módosított kliens tehát **kikapcsolhatja magának a ködöt**, és
láthatja a te bázisodat. Ez ellen csak szerveroldali szimuláció védene,
ami teljesen más felépítést kívánna.

Ugyanígy: bárki szándékosan szétcsúszást okozhat magánál, amivel
megállítja a játszmát. Ez nem adatvesztés, csak bosszúság — de barátok
közti játékban ez elfogadható kockázat.

**Röviden: ismerőssel játszani biztonságos, idegennel nyitott szobában
nem érdemes.**

### Ellenőrzés

A szabályos játék mindenben változatlan: mozgás, építés (mindenki a
sajátját, azonos lépésnél azonos összeg), kiképzés (7 → 8 munkás
mindhárom gépen), ideológia, kilépéskezelés, oktatómód, determinizmus,
kalózváros, ponttábla, szoba, kikötőmenü.

---

## v6.2 — Az építés is szinkronban · 2026-08-10

A v6.1-ben nyitva hagyott hiba megvan. **A javításom rossz függvénybe
került.**

A szövegcserés módosítás az első egyező mintát találta el — az pedig a
FALÉPÍTÉS kódjában volt, nem a `placeBuilding`-ben. Így a fal kapott egy
`epitok` nevű változót, ami ott nem is létezik, a rendes építés pedig
maradt a régi, kijelölés-alapú soron:

```js
const crew = G.sel.filter(u => !u.dead && u.role==='worker');
```

Ez a kijelölés a KÉPERNYŐ állapota, minden gépen más. A kezdeményezőnél
két munkás indult el, a többieknél egy sem — az egységek helyzete eltért,
és a világok szétcsúsztak.

### A javítás

Közös segédfüggvény lett belőle, `epitokValaszt(fel, alap, db)`: az
alapokhoz legközelebb álló, épp nem építkező munkásokat választja ki a
VILÁGBÓL. Egyenlő távolságnál az azonosító dönt, hogy a sorrend minden
gépen ugyanaz legyen. Ugyanez szolgálja ki a falépítést is.

### Miért kerülte el három átvizsgálást

Mert a próbáim mozgás- és kiképzésparancsokat használtak, azok pedig
viszik magukkal az egységek azonosítóit. Az építés volt az egyetlen
parancs, ami a helyi kijelölésből dolgozott — és csak akkor derült ki,
amikor tényleg építettem hálózati játszmában.

Amikor végre elkaptam, a részletes eltérésjelzés (v6.1) egy sorban
megmutatta:

```
A gépén:  a 562. és 563. munkás → order = repair
C gépén:  ugyanaz a két munkás  → order = nincs
```

### A teljes ellenőrzés

| próba | eredmény |
|---|---|
| három ember épít egyszerre, hálózaton | mindenki a sajátját (5,5,5), azonos lépésnél azonos összeg ✔ |
| szétcsúszás-kereső (3 példány, más helyi játékos) | 3000 lépésen át azonos ✔ |
| mindenki a saját népét irányítja | ✔ |
| külön raktár félenként | ✔ |
| ideológiaválasztás, kiképzés | szinkronban ✔ |
| a házigazda kilép | a többiek 1439. lépésig futnak ✔ |
| szünet és vereség hálózaton | nem állítja meg a játszmát ✔ |
| három párhuzamos szoba | külön világok ✔ |
| 250 ms késleltetés | szinkron ✔ |
| oktatómód, determinizmus, kalózváros, ponttábla, szoba, kikötőmenü | ✔ |

**A többjátékos ezzel használható.**

---

## v6.1 — Harmadik átvizsgálás: megállás, hatókör, determinizmus · 2026-08-10

Öt hibacsoport javítva, egy pedig **pontosan behatárolva, de még nyitva**.
Ez utóbbit a végén külön leírom.

### 1. Három dolog, ami befagyasztotta volna az egész társaságot

A lépészár minden résztvevő csomagját megvárja. Ha a TE gépeden megáll a
szimuláció, te nem küldesz több csomagot — és ettől mindenki más is
megáll. Három ilyen volt:

| mi | mi történt |
|---|---|
| **szünet (P)** | a te szüneted mindenkit megállított |
| **saját vereség** | az `endGame` leállította a motort |
| **a vereség mércéje** | a 0. fél állapotából ítélte meg, tehát a házigazda bukása mindenkinek vereség volt |

Hálózaton innentől nincs szünet, a végképernyő nem állítja meg a motort
(a birodalmad sorsát a többiek tovább írják), és a vereséget a helyi
játékos állapota dönti el. Próbával: B veresége után mindkét gép futott
tovább, szinkronban.

### 2. Az építési hatókör a 0. fél épületeihez mért

A 2. és 3. játékos a SAJÁT bázisa mellé sem építhetett — csak „Túl messze
a birodalmadtól” üzenetet kapott. Ugyanez a minta a költségszámításban is
ott volt, húsz helyen: mindenki a 0. fél nemzeti bónuszaival számolt.

### 3. Szimulációs kódba került az „én” fogalma

Ez a korábbi javításom mellékhatása. Az `ENID` a HELYI játékost jelenti —
gépenként mást. Három helyen a szimulációba szivárgott:

- **alakzat-bónusz**: csak a helyi játékos egységeire hatott, tehát
  ugyanaz a katona más erővel harcolt a két gépen. Most félenként külön
  alakzat van.
- **események** (pestis, roncs): a helyi játékost célozták. Most a
  szimulációs magból sorsolunk felet — az minden gépen ugyanaz.
- **kereskedőhajó**: csak a helyi kikötőkből indult, és a 0. fél
  tulajdonába került. Most bármelyik fél kikötőjéből indulhat, és az övé
  is lesz.

### 4. A botok nemzete gépenként más lett

A `pickEnemyNation` a TE nemzetedhez képest választott kontrasztos
lobogót — hálózaton viszont mindenkinek más a nemzete, tehát nálad német
bot volt, nála angol. Más nemzet = más bónusz = azonnali szétcsúszás. A
viszonyítási pont mostantól a 0. fél nemzete, ami a tervből jön.

### 5. Az egész szkript elszállhatott

A `PARANCS_TABLA` `const`-tal a 68. modulban jött létre, de a 26. modul
már regisztrált bele — „Cannot access before initialization”, fehér
képernyő. A tábla az `01-util.js`-be került.

### Új eszközök a hibakereséshez

**Szétcsúszás-kereső**: három példány ugyanazzal a maggal, csak MÁS helyi
játékossal. Ha a szimuláció bárhol a helyi féltől függ, azonnal kiderül —
hálózat nélkül, gyorsan. Ez fogta meg a 3. és 4. pontot.

**Részletes eltérésjelzés**: a szétcsúszás-figyelő eddig eldobta az
eltérő értéket, így utólag nem lehetett megmondani, melyik lépésnél és
mennyivel tért el a két világ. Mostantól megőrzi, és a naplóba is kiírja.

### Ami MÉG NYITVA VAN

**Hálózati játszmában az ÉPÍTÉS szétcsúszást okoz.** Pontosan behatárolva:

```
A gépén:  a 562. és 563. munkás → order = repair
C gépén:  ugyanaz a két munkás  → order = nincs
```

Az épület mindkét gépen felépül, a készletek is egyeznek — csak az
építők nem indulnak el a nem-kezdeményező gépeken, ezért az egységek
helyzete eltér.

A kiválasztást már kivettem a kijelölésből (mostantól az alapokhoz
legközelebbi szabad munkások indulnak, azonosító szerinti holtverseny-
feloldással), és a parancs viszi is a munkások azonosítóit — a hiba
mégis megmarad, tehát a `placeBuilding` építőkiválasztása a
nem-kezdeményező gépen valamiért nem fut le.

**Amíg ez nincs meg, hálózati játszmában ne építsetek.** Minden más —
egyszemélyes játék, Csata botokkal, mozgás, kiképzés, ideológia,
korszakváltás, kilépéskezelés — ellenőrizve és rendben.

---

## v6.0 — A parancsok a feladó nevében futnak · 2026-08-10

Második átvizsgálás, és előkerült egy egész hibacsoport, ami az elsőn
átcsúszott — mert az első próbáim csak MOZGÁS-parancsokat használtak.

### A hiba

A hálózaton átküldött parancsok **nem hordozták, hogy ki adta ki őket**:

```js
parancsRegiszter('age',   ()=>{ advanceAge(); });
parancsRegiszter('upg',   (k)=>{ buyUpgrade(k); });
parancsRegiszter('build', (x,y,t)=>{ G.place=t; placeBuilding(x,y); });
parancsRegiszter('train', (id,role,db)=>{ …; train(role,db); });
```

Ezek a függvények mind a HELYI állapotból dolgoznak: a te korszakodból, a
te készletedből, a te épületeidből. A parancs viszont MINDEN gépen
lefut — tehát ha a társad korszakot lépett, az **a te korszakodat**
léptette; ha kaszárnyát épített, az **a te fádból** ment el.

A mozgás és a kijelölés azért működött, mert azok az egységek
azonosítóit viszik magukkal, nem a helyi állapotot. Ezért nem derült ki
az első körben.

### A javítás — egyetlen sor

Nem kellett minden függvényt átírni. A `G.res`, a `G.age`, a `G.doct`, a
`G.upg` és az `ENID` mind a `G.enId`-re mutató ablak, ezért elég a
parancs futása idejére átállítani, **ki a cselekvő**:

```js
G.enId = h;              // a feladó
futtat(parancsok[h]);
G.enId = G.enIdHelyi;    // vissza
```

Innentől minden érintett függvény magától a feladó birodalmán dolgozik.

### Ami ezzel járt

**A képernyő nem követheti a cselekvőt.** Bevezettem a `helyiFel()`-t: az
mindig az igazi helyi játékos, akkor is, ha épp egy társ parancsát
hajtjuk végre. A kamera, a köd, a kistérkép, a nappal-éjszaka és a
ponttábla erre néz.

**Az üzenetek és a hangok elnémítva.** A társ parancsai a te gépeden is
lefutnak, a visszajelzésük viszont nem a te dolgod. „Nincs elég
nyersanyag”, „Gyülekezőpont kijelölve” — ha ezeket az ő tetteik után is
megkapnád, percenként több tucat idegen üzenet villogna, és a sajátjaid
elvesznének köztük. Ugyanez a kattanásokra.

### A próba

Három ember, valódi szerverrel. A 2. fél (C) jobbágyot képez ki:

```
élelem előtte : 443 443 448 683 688 703
élelem utána  : 449 449 406 696 701 716
                          ↑ csak a 2. fél fizetett
mindhárom gépen ugyanaz, a 1040. lépésnél szinkronban
üzenet: C-nél a sajátja, A-nál a sajátja — nem szivárog át
```

### A teljes ellenőrzés

| próba | eredmény |
|---|---|
| mindenki a saját népét irányítja (hu / fr / ru) | ✔ |
| a parancs a FELADÓ birodalmára hat | ✔ |
| külön raktár félenként (5 fél, 150 mp favágás) | ✔ |
| ideológiaválasztás mindenkinél, szinkronban | ✔ |
| a házigazda kilép → a többiek 1370. lépésig futnak | ✔ |
| három párhuzamos szoba, külön világokkal | ✔ |
| ködrács és vászon minden létszámnál egyezik | ✔ |
| oktatómód, determinizmus, kalózváros, ponttábla, szoba, kikötőmenü | ✔ |

A fő verziószám azért lép hatosra, mert a parancsvégrehajtás alapszabálya
változott meg.

---

## v5.9 — A többjátékos átvizsgálása · 2026-08-10

Végigmentem a hálózati részen, és **hét hibát** találtam. Kettő közülük
olyan súlyos, hogy nélkülük a többjátékos használhatatlan lett volna.

### 1. A 2. és további felek nyersanyaga a botéba folyt

Ez volt a legsúlyosabb. Négy helyen ez a minta állt:

```js
const store = owner ? G.ai.res : G.res;      // „minden más = a gép”
```

Vagyis a favágód, az aranybányád, a majorságod bevétele **az első bot
készletébe** ment, ha te nem a 0. fél voltál. Nem szétcsúszás — minden
gépen egyformán rossz volt —, de a játék így értelmetlen.

Ugyanez a minta érintette a fejlesztéseket (`upgOf`), az ideológiákat
(`doctList`), az épületek korszakát és az építészeti stílust: a 2.
játékos az első bot fejlesztéseit, ideológiáit és házait kapta volna.

Célzott próba: négy ember és egy bot, mindenki fát vág, 150 másodperc.

```
induló:  0:500  1:500  2:500  3:500  4:900
utána:   0:1532 1:1712 2:1808 3:1700 4:1686
```

Öt külön raktár, ahogy kell.

### 2. Az ideológiaválasztás nem ment át a hálózaton

`G.doct[age]=key` csak a saját gépeden futott le. Az ideológia viszont a
SZIMULÁCIÓT módosítja — egységek erejét, költségeket, seregkeretet —,
tehát a világok a következő pillanattól szétcsúsztak volna.

Most rendes hálózati parancs (`doct`), minden gépen ugyanannál a
lépésnél fut le. Ráadásul a választóképernyő **hálózaton nem állítja meg
az időt**: a szünet csak a te gépeden állt volna meg, ezzel viszont
elakadt volna a lépészár, és a TÁRSAID is megálltak volna, amíg
választgatsz.

### 3. Ha a HÁZIGAZDA lépett ki, mindenki befagyott

A kiesést a házigazda hirdette ki — csakhogy ha épp ő távozik, nincs aki
megtegye, és a többiek örökre rá vártak. Most a **legkisebb sorszámú
talpon maradt** fél a bejelentő: ezt mindenki ugyanúgy kiszámolja, tehát
pontosan egy valaki küldi el, és sosem az, aki távozik.

Mellé egy biztonsági kapcsoló: ha valakitől fél percen át egyetlen csomag
sem jön, és a szerver sem szólt a kilépéséről (elszállt a gépe), a
játszma kiejti.

### 4. Hamis „szétcsúszott” riasztás kilépéskor

A távozó utolsó csomagjai még úton lehetnek, és azokat a világ még a
kiesése ELŐTTI állapotában számolta. Az eltérés ilyenkor természetes —
mégis leállította a játszmát. A kilépettek összegeit innentől eldobjuk.

### 5. Az egész szkript elszállt

Az ideológia-parancs regisztrálása a 26. modulban fut, a parancstábla
viszont `const`-tal a 68.-ban jött létre — „Cannot access before
initialization”, és ettől az EGÉSZ játék fehér képernyő lett. A tábla az
`01-util.js`-be került, ahol bárki elérheti.

### 6. Az ellenőrző összeg csak a saját készletedet nézte

Így egy olyan szétcsúszás, ami a másik fél gazdaságát érintette,
észrevétlen maradt volna, és csak percekkel később ütött volna ki a
seregek méretén. Mostantól minden fél készlete és korszaka beleszámít.

### 7. A mentés elszállt bot nélküli felállásnál

`ai:{age:G.ai.age,…}` — ha nincs egyetlen bot sem, a `G.ai` null. A
mentés most ezt is elviseli, és az oldalak táblája is belekerül.

### Amit ellenőriztem

| próba | eredmény |
|---|---|
| mindenki a saját népét kapja (hu / fr / ru) | ✔ |
| a felállás mindenkinél azonos | ✔ |
| ködrács és vászon mérete egyezik, saját bázis látszik | ✔ |
| mindenki a saját egységeit jelöli ki | ✔ |
| külön raktár félenként | ✔ |
| ideológiaválasztás mindenkinél érvényesül, szinkronban marad | ✔ |
| a házigazda kilép → a többiek 1150. lépésig futnak, hiba nélkül | ✔ |
| három párhuzamos szoba, külön világokkal | ✔ |
| 250 ms késleltetés (interkontinentális) | ✔ |
| oktatómód, determinizmus, kalózváros, ponttábla, kikötőmenü | ✔ |

A `Math.random` hívásokat is átnéztem: mind díszítés (hullák, roncsok,
egy üzenet sorsolása), egyik sem szól bele a szimulációba.

---

## v5.8 — A kikötőmenü és a hajóparancsok egymáson · 2026-08-10

Kalózvilágban a városra kattintva körben nyílnak az építési lehetőségek.
A hajóid viszont kijelölve maradnak, ezért alatta **egyszerre látszott a
töltet- és állásválasztó is**: két teljesen más dologról szóló panel,
egymás hegyén-hátán — ráadásul a kikötőmenü alsó köreit is takarta.

Innentől amíg a kikötőmenü nyitva van, a parancssáv rejtve marad. A
kijelölést NEM bontjuk meg: a menü bezárásakor a hajóid ott lesznek, ahol
hagytad őket.

### Elsőre rossz helyre tettem

A vizsgálatot a `buildButtons()`-be írtam. Az viszont **korán kilép**, ha
a kijelölés nem változott:

```js
if(sig===G.btnSig) return;
```

A kikötőmenü megnyitása épp nem változtat a kijelölésen, tehát a kód soha
nem futott le — a próbában `cmdBox.style.display` üresen maradt. Át kellett
tenni a `syncUI` elejére, ahol mindig lefut.

A `portOpen` és a `portClose` is szól a felületnek: enélkül a panel csak
a következő változásnál tűnt volna el, illetve tért volna vissza.

Próbával: hajó kijelölve → parancssáv látszik; kikötőmenü megnyitva →
parancssáv rejtve, a hajó továbbra is kijelölve; menü bezárva →
parancssáv visszatér, a kijelölés érintetlen.

---

## v5.7 — A csíkos térkép és a francia Hunyadi · 2026-08-10

### A vízszintes csíkozás — az én hibám a v4.8-ból

A ködréteg segédvászna így készült:

```js
if(!fogCv){ fogCv.width=FW; fogImg=fogCtx.createImageData(FW,FH); }
```

**Egyszer**, az első játszma rácsméretével. Amióta a térkép mérete a
felek számához igazodik (v4.8), ez elromlott: egy háromfeles játszma
nagyobb világot kap, tehát a rács is szélesebb — a régi, keskenyebb
képadatba írva viszont a sorok elcsúsznak egymáshoz képest. A képernyőn
ez vízszintes csíkozás lett: felfedett és sötét sávok, össze-vissza.

Ezért működött jól az egyik gép és rosszul a másik: amelyiken a
háromfeles játszma volt az ELSŐ, ott a méret stimmelt. Amelyiken előtte
futott egy kétfeles, ott nem.

Ugyanez érintette a kalózvilágot is (háromszoros térkép), csak ott
ritkábban került elő.

A vászon mostantól minden játszmában a mostani rácsmérethez igazodik:

```
 2 fél    világ 3400x2400   rács 107x75    vászon 107x75   ✔
 3 fél    világ 4164x2939   rács 131x92    vászon 131x92   ✔
10 fél    világ 7480x5280   rács 234x165   vászon 234x165  ✔
kalóz     világ 10200x7200  rács 319x225   vászon 319x225  ✔
```

A „néha megjelentek egymás katonái, de nagyon buggos” is ebből jött: a
látótér-vizsgálat a helyes tömbből dolgozott, a KIRAJZOLT köd viszont
elcsúszott — így hol látszott valami, hol nem.

### A francia játékos Hunyadi Mátyással

Időzítési hiba. A vendég azonnal bejelenti a nemzetét, amint belép a
szobába. A házigazdánál viszont a lista csak akkor épül fel, amikor
megnyitja a szobaképernyőt — addig a `SZOBA.helyek` az alapállás, amiben
nincs is `hely` mező. A keresés tehát nem talált semmit, és a választás
elveszett. A tervbe a hiányzó nemzet helyett magyar került.

Most a beérkezett választásokat külön is eltesszük helyszám szerint, és a
lista felépítésekor érvényesítjük. A félretett választás erősebb, mint a
korábbi listaállapot — az a játékos legutóbbi akarata.

Próbával, pontosan a hibás sorrendben: a vendég választ (`ru`), a
házigazda CSAK EZUTÁN nyitja meg a szobát — a listában ott a `ru`, és a
játszmában is orosszal indul.

---

## v5.6 — „Nincsenek emberek, nem lehet irányítani” · 2026-08-10

A képernyőképen üres füvet mutatott a telefon, a gépen sötét térképet —
de az alsó sávban ott állt: **„7× Jobbágy — harcra alkalmatlan”**. A
munkások tehát megvoltak, sőt ki is voltak jelölve. Nem hiányoztak: nem
látszottak.

### 1. A kamera nem ment a bázisodra

Az egyszemélyes indítást az Új játék gomb intézte:

```js
requestAnimationFrame(()=>{ resize(); centerOnBase(); });
```

A hálózati útból ez kimaradt. A világ felállt, a kamera viszont a térkép
alapállásában maradt — üres füvet láttál, miközben a jobbágyaid odébb
dolgoztak.

### 2. A `centerOnBase` a 0-s félre keresett

```js
for(const x of G.builds) if(x.owner===0 && x.type==='hq'){ b=x; break; }
```

Hálózaton te lehetsz az 1-es fél is. Ilyenkor nem talált semmit, és a
kamera a térkép sarkába állt. Most a HELYI fél bázisát keresi, és ha
főhadiszállás nincs, bármelyik épületét, végül bármelyik egységét.

### 3. A gyökér: „0 = én” több tucat helyen

Ez a kettő csak a tünet volt. A parancsok, a kijelölés és a felület
**103 helyen** hivatkozott a 0-s félre úgy, mintha az mindig a játékos
lenne:

```js
G.sel = G.units.filter(u => u.owner===0 && u.role!=='worker');
const hq = G.builds.find(b => b.owner===0 && b.type==='hq');
if(e.kind==='unit' && e.owner===0) G.sel.push(e);
```

Egyszemélyes játékban ez igaz. Hálózaton a 2. játékos ezért **nem tudta
kijelölni a saját egységeit, nem tudott építeni és kiképezni sem** — a
felület egy idegen birodalomra hivatkozott.

Bevezettem az **`ENID`-et**: a helyi fél sorszáma, 63 helyen kicserélve.
Getterként van definiálva, nem sima változóként — a helyi fél sorszáma a
világ létrehozásakor dől el, a modulok viszont ennél korábban töltődnek
be, tehát egy `const ENID = G.enId` az akkori nullát rögzítené.

A botok saját sorszáma `BOTID` lett, hogy ne ütközzön: ott a szám valódi
tulajdonos, nem „én”.

A szimuláció, a világgenerálás és az AI **érintetlen** — ott a 0 valódi
tulajdonos-sorszám, nem a játékos.

### 4. Szünetben indult

A hálózati játszma szünettel indulhatott, ha az előző menetből ott maradt
a jelzés. Most az indítás mindig feloldja.

### A próba

```
A: ENID=0  munkás 7 (mind a sajátja)  katona 3  kamera a bázistól 711 px
B: ENID=1  munkás 7 (mind a sajátja)  katona 3  kamera a bázistól 711 px
```

Az összes korábbi próba is lefutott: oktatómód, determinizmus, kalózváros,
ponttábla, szoba, három klienses hálózati játszma — hiba nélkül.

---

## v5.5 — Három hiba a többjátékos körül · 2026-08-10

Mindhárom ugyanabból a gyökérből nőtt: **kilépéskor nem állt vissza a
hálózati állapot.**

### 1. „Beragad a többjátékos”

Hálózati játszmából kilépve, majd az Új játék menüből indítva a
szimuláció megállt, és a felület visszadobott a szerverre. A régi
`netZar` csak a postaládákat ürítette:

```js
n.kapcs=null; n.allapot='ki'; n.bejovo={}; n.kimeno=[];
```

A névsor, a helyszám, a szobakód, a kiesettek és — a legfontosabb — a
**`G.oldalTerv`** bent maradt. Az oldalTerv a szoba felállása; ha nem
törlődik, a következő EGYSZEMÉLYES játszma is a régi felállással jön
létre.

Most a `netZar` mindent alaphelyzetbe állít, és van egy `netTisztaLap()`,
amit az Új játék, a hadjárat, az oktatómód és a helyi Csata is meghív
indítás előtt.

### 2. „Fekete a térkép”

Ugyanennek a következménye. Ha a régi terv szerint a helyi játékos az
1-es fél, de a világ már csak a 0-st hozta létre, a te ködréteged üresen
maradt — az egész térkép sötét. Újraindítás után azért tűnt el, mert
akkor a terv is elveszett.

Kapott egy biztonsági hálót is: ha a terv egyetlen helyet sem jelöl
sajátnak, az elsőre esünk vissza. Inkább rossz nemzet, mint vak játék.

### 3. „Közös nemzetet irányítunk”

Két baj találkozott.

**A párosítás sorszám szerint ment.** A terv `terv[i]` alapján osztotta
ki, kinek melyik birodalom jut, a szerver viszont **helyszámot** ad, és
az nem feltétlenül folytonos: ha valaki kilépett a szobából és más lépett
be, lehet 0 és 2. Ilyenkor a második játékos egy BOT helyére ült. A
helyszám mostantól benne utazik a tervben, és mindenki az alapján
azonosítja magát.

**A vendég nem választhatott nemzetet.** A listája tiltva volt, és a
tervbe a házigazdánál beállított — vagy hiányában magyar — nemzet
került. Így két játékos ugyanazzal a néppel indult. Mostantól mindenki a
SAJÁT nemzetét választja, a választás átmegy a hálózaton
(`szoba-valaszt`), és becsatlakozáskor magától be is jelentkezik. A
botok nemzete marad a házigazdáé, mert az ő terve utazik.

Az ember helyeket ráadásul már nem a szobalista pillanatnyi állapotából
építjük, hanem a **szerver névsorából** — az a hiteles forrás.

### A próba

Két kliens, valódi szerverrel:

```
vendég nemzetválasztója engedélyezve, választ: ru
házigazda látja: ru
játszma: A enId=0 nemzet hu · B enId=1 nemzet ru — külön birodalom
mindkettőnél saját bázis, látható köddel

B kilép → allapot 'ki', oldalTerv törölve, névsor üres
B új egyszemélyes játékot indít → 2 oldal, enId=0, bázis látható,
a szimuláció fut (282. lépés)
```

---

## v5.4 — Verziószámozás rendbetéve · 2026-08-10

A napló két számozási vonalat kevert: egy **v4.13** bejegyzés ült a
**v5.3** fölött, és nagyjából ugyanarról szólt, mint a v5.2 — a
Többjátékos gomb élesítéséről. A kódban közben a `GAME_VERSION` a
`4.13`-nál ragadt, holott a napló szerint 5.3-nál jártunk.

Két külön munkamenet számozása csúszott egymásra. Az érintett bejegyzés
**v5.2/a** néven a helyére került (a v5.2 mellé, mert ugyanaz a munka),
és a `GAME_VERSION` mostantól **5.4**.

Miért számít? A játszma indításakor a gépek **egyeztetik a
változatszámot**, és eltérésnél nem engedik el a játékot. Ha az egyik
gépen `4.13`, a másikon `5.3` áll, a többjátékos mód el sem indul —
pedig a kód azonos.

Ezért fontos, hogy **mindenki ugyanazt az `index.html`-t** futtassa.

---

## v5.3 — Alkalmazkodó késleltetés a távoli játékhoz · 2026-08-09

Ha a játékosok **nem ugyanazon a hálózaton** vannak, a lépészár másképp
viselkedik. Egy lépés ötven ezredmásodperc, a parancsokat pedig hat
lépéssel előre ütemeztük — vagyis 300 ms tartalékkal. Ugyanazon a wifin
ez bőven elég; interneten át kevés lehet, és ilyenkor a szimuláció
minden lépésnél megáll és vár.

Innentől a késleltetés **magától nő**. Ha egy másodpercnyi állás
összegyűlik, kettővel emelünk, legfeljebb 24 lépésig (1,2 s), és egyszer
szólunk is róla.

Ez azért biztonságos, mert **nem kell egyeztetni a többiekkel**: a
parancs a saját lépésszámát viszi magával, és mindenki ANNÁL a lépésnél
futtatja. Csak annyi a követelmény, hogy időben odaérjen — a nagyobb
késleltetés pedig épp ezt segíti. Csökkenteni viszont nem csökkentünk
játszma közben: az már elküldött csomagokat érvénytelenítene.

### A mérés

Írtam egy lassító közvetítőt, ami minden csomagot megadott idővel
késleltetve ad tovább, és azon keresztül futtattam a három klienses
próbát:

| egyirányú késleltetés | mire állt be | eredmény |
|---|---|---|
| 0 ms | 6 lépés | szinkronban, 20 lépés/mp |
| 120 ms | 8 lépés | szinkronban, 21 lépés/mp |
| 250 ms | 24 lépés | szinkronban, 20 lépés/mp |

Mindhárom esetben a szétcsúszás-figyelő néma maradt, és a kilépés utáni
továbbfutás is működött.

Az első mérésem 120 ms-nál elbukott — de az a TESZT hibája volt: a
kézfogásra szabott fix várakozások túl rövidek voltak, a társak még be
sem értek, amikor a házigazda indított. A várakozásokat a késleltetéshez
arányosítottam.

### Apróság

A szerver címe megjegyződik a böngésző tárolójában. Interneten át ez egy
hosszú név — kár lenne minden alkalommal újra begépelni.

### SZERVER.md

Új szakasz a más hálózaton lévő játékosokról: a CGNAT-próba, és négy út
(portátirányítás dinamikus DNS-sel, bérelt gép, cloudflared alagút,
Tailscale) azzal együtt, melyiket mikor érdemes választani.

---

## v5.2 — A többjátékos élesítve · 2026-08-09

A **Többjátékos** gomb a kapcsolódás lapjára visz, onnan pedig — amint
létrejött a szoba — a szobaképernyő veszi át.

### Egy vallomás

A „Hamarosan” buborékot a v4.6-ban tettem a gombra, ugyanabban a
patchben, amelyben a beragadt bekötéseket kimentettem a `quitGame()`-ből.
A kimentés az EREDETI sort vitte magával, nem a buborékosat — a buborék
tehát már akkor elveszett, csak nem tűnt fel senkinek, mert a gomb egy
üres panelra vezetett. A hátralévő holt kódot (CSS, szótárkulcsok, a
nyelvváltás horgonya) most kitakarítottam.

Tanulság: ha egy blokkot áthelyezek, a másolat forrását is ellenőrizni
kell, nem csak azt, hogy a cél helyre került-e.

### Új dokumentum: SZERVER.md

Végigvezet az állandóan futó szerveren:

- **Linux / Raspberry Pi** — systemd egység, `Restart=always`, saját
  felhasználó, írásjog nélkül
- **macOS** — launchd, `KeepAlive`, és az alvás kikapcsolása
- **Windows** — újraindító `.cmd` és feladatütemező
- elérhetőség: helyi hálózat, portátirányítás, dinamikus DNS, CGNAT
- `wss://` tanúsítvánnyal, ha a játékot https-en szolgálod ki
- a játszma menete lépésről lépésre, és a szokásos hibák

Ellenőrizve: a szerver állapotlapja böngészőből válaszol
(`szoba: 0 (legfeljebb 6 fő szobánként)`), és a három kliensesa próba
továbbra is szinkronban fut.

---

## v5.2/a — A többjátékos mód kipróbálható · 2026-08-09

A **Többjátékos** gombról lekerült a „Hamarosan” buborék: a lépészáras
protokoll és a szerver készen áll. A gomb a kapcsolódás lapjára visz,
onnan pedig — amint létrejött a szoba — a szobaképernyő veszi át.

Új: a **szobakód** a szoba fejlécében, nagy betűkkel. A vendégeknél a
nemzet- és csapatválasztó szürke, a Kezdés helyén *„Várakozás a
házigazdára…”* áll. Ez szándékos: a felállás a házigazda gépéről utazik,
és félrevezető lenne, ha a vendég azt hinné, számít a választása.

Mellékelve a **SZOBA-PROBA.md**: végigvezet a próbán, egyetlen gépen, két
böngészőablakkal.

### Egy hiba, amit magam ejtettem

A v4.6-ban kiemeltem a `quitGame()`-be ragadt bekötéseket egy külön
függvénybe. A kivágás rosszul sikerült: a **visszajátszás kezelői
kétszer** kerültek bele, és eközben elveszett a „Hamarosan” buborék kódja
is. A hiba csendes maradt, mert a második értékadás egyszerűen felülírja
az elsőt — a gomb működött, csak fölöslegesen kétszer kötöttük be.

Most egy tiszta `initMenuExtra()` áll a helyén.

Tanulság: a szövegvágásos módosítás akkor veszélyes, ha a kivágás
határait nem ellenőrzöm — a build és a próbák sem szólnak, ha a
duplikátum ártalmatlan.

### A próba

Két teljes játékpéldány, valódi szerverrel, a FELÜLETRŐL vezérelve:

```
A: Többjátékos → Szoba nyitása → szobakód DW5K
B: Többjátékos → kód beírása → Csatlakozás
A listája: Te | Vendég | Bot 1
B listája: Házigazda | Te | Bot 1
B-nél: Kezdés tiltva, „Várakozás a házigazdára…”, botgomb szürke
A: +2 bot, Kezdés
mindkettőnél: 5 oldal, azonos felállás, más enId (0 és 1)
a 420. lépésnél mindkettő 6571f3c5 — szinkronban
```

---

---

## v5.1 — A város sorsa: elfoglalás vagy kifosztás · 2026-08-09

Kalózvilágban eddig ez volt az ostrom vége: leverted a tornyokat, a
lakosság kétszáz alá esett, partra tettél EGYETLEN katonát — és a város
magától a tiéd lett. Se védők, se döntés.

Innentől három lépcső van.

### 1. A sortűz kiüríti a várost

A partraszállás küszöbe kétszázról **húsz lakosra** csökkent. Vagyis nem
elég megkarcolni a várost: a hajóágyúknak gyakorlatilag ki kell üríteniük.

### 2. Az utolsó helyőrség kiáll

Húsz lakos alatt a maradék férfinép fegyvert fog, és kimegy a partra:

```
TORTUGA — az utolsó helyőrség kiállt a partra!
```

Ezt le kell győzni. A védők száma a nehézségtől és a megmaradt
lakosságtól függ. Amíg él közülük akár egy is, nincs döntés.

### 3. Te döntesz

```
┌──────────────────────────────────────┐
│ TORTUGA — elesett                    │
│ Nincs több védő. Mi legyen a várossal?│
│  [ Elfoglalom — a város a tiéd lesz ]│
│  [ Kifosztom  ·  247 arany          ]│
└──────────────────────────────────────┘
```

**Elfoglalás** — a város a tiéd: a közeli épületek gazdát cserélnek, a
megmaradt nép a fennhatóságod alá kerül, a hírneved 18-cal nő.

**Kifosztás** — nem lesz a tiéd, csak elviszed, ami mozdítható: arany,
élelem és rum a megmaradt lakosság és a város mérete szerint. A hely
ellenséges marad, a hírnév 10.

### Egy kiskaput be kellett zárni

Kifosztás után a lakosság nullán maradt volna, tehát a város **végleg
nyitva áll** — percenként újra le lehetett volna aratni ugyanazt a
zsákmányt.

Ezért az idegen városok mostantól **magukhoz térnek**, ha egy ideje nem
lövik őket: tíz másodperc nyugalom után a lakosság másodpercenként 2,4
fővel szivárog vissza, és ha újra megtelt a város harmadáig, a tornyokat
is felhúzzák — hetvenöt másodpercenként egyet, az eredeti számukig. Amint
a lakosság húsz fölé ér, a helyőrség és a döntés állapota alaphelyzetbe
kerül: a következő ostrom tiszta lappal indul.

Próbával: kifosztás után 120 másodperc nyugalommal a város 264 lakosra
épült vissza, és nem volt újra kifosztható.

### A próba

Mindkét ág végigjátszva. Kifosztás: 300 → 547 arany, a város ellenséges
maradt, a lakosság nullára esett. Elfoglalás: a kikötő a tiéd lett, arany
nem járt érte. A doboz csak akkor jelenik meg, ha az utolsó védő is
elesett — amíg élnek, rejtve marad. Mind a négy nyelven.

---

## v5.0 — A felület (6. ütem), és a többjátékos kész · 2026-08-09

Hat ütem után a több fél teljes: **hat ember és négy bot** egy térképen,
helyben és hálózaton. A fő verziószám ezért ugrik ötre.

### Ponttábla

```
┌─────────────────────────────┐
│ FELEK                   [—] │
│ ■ Te                  5 · 14│
│ ■ ▲ Társ              4 · 11│
│ ■ Németország         6 · 18│
│ ■ Lengyelország       5 · 12│
│ ■ N̶a̶g̶y̶-̶B̶r̶i̶t̶a̶n̶n̶i̶a̶      kiesett│
│ Szoba: CSD6  ·  3 fő        │
└─────────────────────────────┘
```

Csapatszín, név, épület- és egységszám. A saját sorod kiemelve, a
szövetségesé ékkel, a kiesett áthúzva. Összecsukható, és **csak
kettőnél több félnél jelenik meg** — egy az egy ellen csak zavarna.

Nem rajzoljuk újra hatvanszor másodpercenként: ujjlenyomatot képzünk az
állapotból, és csak változáskor épül újra a lista.

### Szövetségesek a térképen

A tíz csapatszín megkülönbözteti a feleket, de a színből nem derül ki, ki
a barát. A szövetséges egységek és épületek fölé apró világos **ék**
kerül. Miért alak, és nem szín? A színek már foglaltak, színvakbarát
módban pedig épp a szín az, amiben nem lehet bízni — az alak minden
beállításnál olvasható.

### Egy hiba, ami csak hálózaton jött volna elő

A rajzolás mindenütt a 0-s tulajdonost tekintette „nekem”:

```js
if(u.owner!==0 && fogAt(u.x,u.y)!==2) return;   // ellenséget csak belátva
```

Hálózati játszmában viszont te lehetsz a 3. fél is — a saját egységeidet
a köd elrejtette volna előled. Öt helyen kellett javítani (egységek,
épületek, kistérkép, nappal-éjszaka, kereskedelem), és egyúttal a
szövetséges is látható lett: a csapaton belül közös a látótér.

### Kiesés és győzelem

Másodpercenként nézzük, ki maradt talpon — a mérce ugyanaz, amit a
vereség használ (nincs se főhadiszállás, se kaszárnya, se munkás). Aki
kiesik, arról üzenet szól, és a tábláján áthúzott sor marad. Ha csak a te
csapatod maradt, a játszma **csapatgyőzelemmel** ér véget.

### Szobakód menet közben

A tábla alján ott a kód és a létszám, tehát nem kell kilépni ahhoz, hogy
megmondd egy társnak, hova csatlakozzon.

### A próba

Öt fél, két csapat: a tábla megjelenik, a saját és a szövetséges sor
jelölve, a kiiktatott fél áthúzva, üzenettel. A két ellenséges csapat
kiiktatása után a végképernyő „Győzelem — a csapatod győzött”.
Kettőnél a tábla rejtve marad.

Hálózaton, három klienssel, futó szerverrel: mindkét megmaradt gépnél
hat soros tábla, `Szoba: CSD6 · 2 fő`, szinkronban, hiba nélkül.

Az oktatómód, a determinizmus és az egy az egy elleni játék változatlan.

### A hat ütem összefoglalva

| ütem | mi lett kész |
|---|---|
| 1 | oldalak táblája, csapatszínek, bázisok elosztása |
| 2 | minden bot külön fejjel, félenkénti köd |
| 3 | szoba: helyek, nemzet, csapat, bot |
| 4 | lépészár N szereplőre, helyszám szerinti sorrend |
| 5 | szerver hat géppel, kilépés menet közben |
| 6 | ponttábla, kiesés, szövetségjelölés, szobakód |

---

## v4.12 — Hálózat több emberre (4—5. ütem) · 2026-08-09

A protokoll és a szerver is két félre íródott. Innentől **hat ember fér
egy szobába**, mellettük a botok.

### A szerver

Egy szoba legfeljebb hat klienst fogad. Mindenki kap egy **helyszámot**
(0-tól, a házigazda a nulladik), és a szerver **minden továbbított
üzenetbe beleírja a feladó helyszámát**:

```js
m.f = kliens.hely;
```

Enélkül a kliens nem tudná, kinek a parancsát kapta — és azt sem, milyen
sorrendben kell végrehajtania. A helyszámot futó játszmában nem osztjuk
újra: az egyben a tulajdonos sorszáma is. Az indulás bezárja a szobát,
utána nem léphet be senki, mert a világ már a meglévő névsorból jött
létre.

### A lépészár

Eddig egyetlen társ csomagjára vártunk:

```js
if(n.bejovo[kov]===undefined) return false;
```

Most **minden résztvevőére**, a kilépetteket kivéve. A parancsok
végrehajtási sorrendje a helyszám szerint növekvő — mindenkinél
ugyanaz. (Két félnél ezt a „házigazda elöl” szabály adta; több emberrel
a helyszám a rendezőelv.)

### Kilépés játszma közben

Eddig a játszma **megállt**, ha a társ lelépett. Ez hat embernél
elfogadhatatlan. Most a többiek játszanak tovább, a kilépő birodalma
pedig magára marad.

A nehézség: a kiesésnek MINDEN gépen ugyanannál a lépésnél kell
történnie, különben a világok szétcsúsznak. Ezért nem a `tars-lelepett`
üzenet hajtja végre, hanem a **házigazda ütemez egy parancsot**, ami a
szokásos hat lépés késéssel, mindenkinél egyszerre fut le.

### A szoba a hálózaton

A házigazda rendezi a felállást (nemzet, csapat, bot), és a Kezdés az
**egész tervet** szétküldi a szimulációs maggal együtt. A terv
jelöletlenül utazik: a „ki vagyok én” mezőt mindenki a saját helyszáma
alapján állítja be.

Egy hiba is előkerült: a becsatlakozó a `helyek.length+1` csapatszámot
kapta, a botokét figyelmen kívül hagyva — így a második ember és az első
bot véletlenül szövetségesek lettek. Most a legkisebb valóban szabad
számot kapja.

### A próba — valódi szerverrel, három klienssel

Elindítottam a `szerver.js`-t, és három teljes játékpéldányt kötöttem
rá igazi WebSocket kapcsolaton:

```
szoba nyílt: helyszámok 0, 1, 2
felállás   : 3 ember + 3 bot, mindenkinél azonos
             0:hu 1:pl 2:hu 3:at 4:fr 5:es
22 mp után : mindhárom a 431. lépésnél
             a 420. lépés összege mindháromnál 4da6b3c6
szétcsúszás-jelzés: nincs, nincs, nincs
```

Utána a harmadik kliens **kilépett menet közben**:

```
A és B tovább fut, résztvevők [0,1], a 2. fél birodalma „üres”
a 700. lépésnél mindkettőnél c88abec3
```

Első méréskor eltérést mutattam ki — de az a MÉRÉS hibája volt: két
kliens két különböző lépésénél vettem összeget. Azonos lépésnél
összevetve egyeznek, és a játék saját szétcsúszás-figyelője sem szólalt
meg hétszáz lépésen át.

### Ami hátravan

6. **Felület** — ponttábla, kiesés kijelzése, szövetségesek jelölése a
   térképen, a szobakód mutatása a képernyőn.

---

## v4.11 — A szoba (3. ütem) · 2026-08-09

Új főmenüpont: **Csata — több fél**. Itt áll össze a felállás, mielőtt a
világ létrejön.

```
HELYEK 5/10 · 1 EMBER · 4 BOT
■ Te      [ Magyarország ]  [ Csapat 1 ]  ×
■ Bot 1   [ Lengyelország]  [ Csapat 1 ]  ×
■ Bot 2   [ Sorsolt nemzet] [ Csapat 3 ]  ×
■ Bot 3   [ Sorsolt nemzet] [ Csapat 4 ]  ×
■ Bot 4   [ Sorsolt nemzet] [ Csapat 5 ]  ×
        [ Bot hozzáadása ]
        [     Kezdés     ]
```

Minden hely a saját csapatszínét viseli — ugyanazt, amit a térképen kap.
Helyben egy ember és legfeljebb négy bot fér el; a keret betelésekor a
gomb kiszürkül. A képernyő szerkezete már a hálózati játékra készült,
csak a helyek forrása lesz más.

Beállítható: nemzet helyenként (a botoknál „sorsolt” is, ilyenkor a világ
választ olyat, ami elüt a többiekétől), csapatszám, nehézség, kezdő
korszak és táj.

### A csapatoknak a harcban is jelenteniük kell valamit

Ez volt a lényegi munka. A célpontkeresés így nézett ki:

```js
for(const u of G.units){ if(u.dead||u.owner===owner||...) continue;
```

Vagyis MINDEN idegen tulajdonos ellenség. Két félnél ez helyes, csapatban
viszont azt jelentette volna, hogy az őrtornyod a szövetségesedre lő. Az
`ellenseg()` most a csapatszámot nézi, és három helyen kellett bevezetni:

| hol | mit érint |
|---|---|
| `nearestEnemy` | amit az egységek és a tornyok maguktól megtámadnak |
| `08-combat.js` | a szomszéd segítségül hívása, ha rálőttek |
| `24-commands.js` | jobb klikk: szövetségesre nem támadás megy |

Próbával ellenőrizve: a főhadiszállásod mellé tett szövetséges és
ellenséges katona közül a `nearestEnemy` az ELLENSÉGET adja vissza.

### Egy hiba a bekötésben

A szoba gombja először nem csinált semmit. A bekötést az
`initSettings()`-be tettem, az viszont csak a **Beállítások** gombra fut
le — aki egyenesen a Csata gombra kattintott, annak nem történt semmi.
(Ugyanaz a fajta hiba, mint korábban a `quitGame()`-be ragadt
bekötések.) A menü felépítésébe került, a többi menüpont mellé.

### A próba

Szoba megnyitása, négy bot hozzáadása, keret betelése, nemzet- és
csapatállítás, korszak és táj választása, indítás:

```
oldalak   : 5
felállás  : 0:ember:hu:cs1  1:bot:pl:cs1  2:bot:es:cs3  3:bot:de:cs4  4:bot:fr:cs5
szövetség : 0-1 igen, 0-2 nem
bázisok   : mind az öt fél megkapta a magáét
60 mp után: mind a négy bot 6-6 épületnél tart
```

A determinizmus és az egy az egy elleni játék változatlan.

### Ami hátravan

4. **Hálózati alak** — a protokoll ma két félre íródott.
5. **Szerver** — szoba hat géppel.
6. **Felület** — ponttábla, kiesés kezelése, szövetségesek jelölése a térképen.

---

## v4.10 — Beállítások három fülön, és állítható gyorsbillentyűk · 2026-08-09

### A panel átrendezése

Eddig egyetlen hosszú lista volt, és a fejezetcímek félrevezettek: az
**Irányítás** alatt sorakoztak a fényhatások, az időjárás, a képméret és
a nézet is. Most három fül van, és mindegyik beállítás oda került, ahová
való:

| fül | mi van benne |
|---|---|
| **Grafika** | fényhatások, időjárás, nappal-éjszaka, díszítő rétegek, színvakbarát mód, teljes képernyő, képméret, nézet |
| **Hangok** | hangeffektek, hangerő, zene, zene hangereje |
| **Irányítás** | görgetés, kamera sebessége, szélgörgetés, billentyűkurzor, **gyorsbillentyűk** |

### Állítható gyorsbillentyűk

A gyorsbillentyűk eddig be voltak égetve a kezelőbe:

```js
if(k==='h') startPlacing('hq');
if(k==='k') startPlacing('barracks');
```

Magyar billentyűzeten kényelmes, máson nem: az „y” és a „z” helyet
cserél a német kiosztáson, a francia AZERTY-n pedig az egész bal kéz
máshol van. Innentől táblázat dönt, és a táblázat átírható.

**23 akció** állítható, három csoportban: építés (8 épület), harci állás
és alakzat (6), parancsok (9 — megállás, korszakváltás, álruha, fotómód,
lerombolás, tétlen munkás, billentyűkurzor, szünet, zene).

Kattints egy billentyűre, nyomd le az újat, kész. Esc: mégse. A választás
a böngésző tárolójában marad, tehát a következő indításnál is érvényes —
a billentyű a JÁTÉKOSHOZ tartozik, nem a világhoz, ezért hálózati
játékban sem küldjük át.

**Amit nem lehet elvenni,** és miért:

```
Esc, Tab, Enter, szóköz, nyilak  — a felület szerkezetéhez tartoznak
F1, F5, F9, F11, F12             — a böngésző és a rendszer is ismeri
1..9 Shift/Alt kombinációk       — a vezérlőcsoportok fix helye
```

Ha ilyet nyomsz, a felvétel nem történik meg, és megmondjuk, miért.

**Ütközést nem tiltunk,** csak jelzünk: ha ugyanaz a billentyű két
akción szerepel, mindkét gomb borostyánsárgára vált. Van, aki
szándékosan tesz kettőt egy gombra.

### Egy régi hiba, ami ettől került elő

Alapból az **F két helyen** szerepelt: a majorság és a fotómód is arra
volt kötve. A régi kezelő a fotómódot vizsgálta előbb, és `return`-nel
zárt:

```js
if(k==='f' && !G.place){ photoMode(); return; }   // ide mindig beesett
if(k==='f') startPlacing('farm');                 // ez sosem futott
```

Vagyis **F-fel soha nem lehetett majorságot lehelyezni** — pedig a súgó
(`H K M U F T V`) és az oktatómód harmadik lépése is azt kéri. Aki az
oktatómódban F-et nyomott, annak eltűnt a felülete.

A fotómód az **O** betűre került, és bekerült a billentyűlistába is. Az
F visszakapta a majorságot.

Ellenőrizve játék közben: F → majorság, O → fotómód, átállítás után J →
majorság, és az F onnantól nem csinál semmit. A felvétel, a tiltás, az
alaphelyzet gombja és a mentés is működik, mind a négy nyelven.

---

## v4.9 — Több bot egyszerre (2. ütem) · 2026-08-09

A 4.8-ban felállt az oldalak táblája, de az AI még egyetlen bot fejét
viselte. Innentől **minden bot külön gondolkodik**.

### Ami be volt égetve

Az `updateAI` mindenütt az 1-es tulajdonost írta:

```js
b.owner===1 · doctSet(1) · unitCost(role, ai.age, 1)
fogAt(x,y,1) · popOf(1) · warmSprites(ai.age,1)
```

Két félnél ez helyes volt. Négy botnál viszont mind a négy UGYANAZT a
birodalmat építette volna — egyetlen készletből, egyetlen épületsorral.

A függvény most `botLep(dt, ai)` alakban dolgozik: a bot saját
bejegyzését kapja, és a sorszámát (`ai.i`) használja tulajdonosként. Az
`updateAI` végigmegy a botokon, mindig ugyanabban a sorrendben — a
hálózati játszmában ez elengedhetetlen, mert a sorrend a sorsolás
sorrendjét is meghatározza.

Ellenség: már nem „a 0. fél", hanem mindenki, aki nincs velünk egy
csapatban — így a szövetségek is működnek.

### A köd is kettő volt

```js
G.fog   // amit a játékos lát
G.fogE  // amit „a gép" lát — MINDEN bot ugyanezt
```

Négy bottal ez azt jelentené, hogy amit az egyik felderít, azt mind a
négy látja. Most félenként külön réteg van (`G.fogs`), a `G.fog` és a
`G.fogE` pedig ablak maradt rá, hogy a mentés és a rajzolás ne
változzon.

A látótér frissítése is átépült. Eddig félenként végigment az ÖSSZES
egységen; tíz féllel ez tízszeres munka lett volna. Most egyszer járjuk
végig őket, és mindenki a saját rétegébe jelöl.

### Üzenetszűrés

Négy bot négyszer szólt volna, hogy „az ellenfél korszakot lépett".
Innentől csak akkor kapsz üzenetet, ha a bot **rád nézve ellenséges**, és
kettőnél több félnél a nemzet nevét is kiírjuk. A rohamriasztás pedig
csak akkor szól, ha a támadás **rád** (vagy a szövetségesedre) indul —
két bot egymás elleni hadjáratáról nem kapsz értesítést.

### Nemzetek ismétlődés nélkül

A `pickEnemyNation` most a már kiosztott nemzeteket is kihagyja,
különben két bot ugyanazzal a lobogóval és ugyanazokkal a bónuszokkal
harcolt volna. Ha elfogynának a szabad nemzetek, a tiltás feloldódik —
inkább ismétlődés, mint hiba.

### A próba

Két ember és négy bot, 300 másodperc teljes szimuláció:

```
0 ember hu  kor0  épület  4  egység  6  katona  3  roham 0
1 ember at  kor0  épület  4  egység 11  katona  4  roham 0
2 bot   pl  kor1  épület 10  egység 16  katona  9  roham 2
3 bot   es  kor1  épület  9  egység 12  katona  5  roham 2
4 bot   de  kor1  épület 11  egység 23  katona 16  roham 2
5 bot   ru  kor1  épület 10  egység 22  katona 15  roham 2
```

Mind a négy bot más nemzet, saját épületsor, saját sereg, saját roham.

**A legfontosabb próba a determinizmus.** Ugyanabból a magból kétszer
indítva, 150 másodpercenként ellenőrző összeggel:

```
1. futás: a8706fe8 d0433c11 aa8a4ea4 d0819fa9 420210fd 5bdcdb71
2. futás: a8706fe8 d0433c11 aa8a4ea4 d0819fa9 420210fd 5bdcdb71
```

Bitre azonos — enélkül a hálózati játszma az első percben szétcsúszna.

Az egy az egy elleni játék ellenőrizve: menü, oktatómód mind a nyolc
lépése, játék közbeni felület — változatlan.

### Ami hátravan

3. **Szoba** — helyek, nemzet, csapat, bot hozzáadása, „kész”.
4. **Hálózati alak** — a protokoll ma két félre íródott.
5. **Szerver** — szoba hat géppel.
6. **Felület** — ponttábla, kiesés, szövetségesek jelölése.

---

## v4.8.2 — A fotómód gombjai, és egy vak folt a próbákban · 2026-08-09

A **Kép mentése** és a **Kilépés** gomb látszott, de a kattintás átment
rajtuk a térképre.

A HUD réteg szándékosan átereszti az egeret a vászonhoz — különben a
képernyőt beborító réteg elnyelné a kijelölést:

```css
#hud       { pointer-events:none }   /* az egész réteg átlátszó az egérnek */
#hud .panel{ pointer-events:auto }   /* csak a dobozok fogják el */
```

A `#photoBar` viszont sem `.panel` osztályt, sem saját szabályt nem
kapott. A gombok megjelentek, a `onclick` be volt kötve — csak épp az
egér sosem ért oda. Egy sor volt a javítás:

```css
#photoBar{ … ; pointer-events:auto }
```

### Miért nem fogták meg ezt a próbák

A tesztek `dispatchEvent`-tel kattintanak, az pedig **nem törődik a
`pointer-events`-szel**: a kezelő akkor is lefut, ha valódi egérrel
elérhetetlen az elem. Ez a hibafajta tehát elvből átcsúszik rajtuk.

Ezért a `build.js` mostantól maga nézi meg. Végigjárja a `#hud` alatti
összes gombot, és megkeresi, van-e a láncban olyan elem, ami
visszakapcsolja az egeret:

```
  html egyensúly: 177 nyitó / 177 záró ✔
  jelölés a </style> után ✔
  minden HUD-gomb kattintható ✔
```

Kipróbáltam úgy is, hogy a javítást szándékosan visszarontottam — az
építés megáll, és névvel megnevezi a két gombot.

A rejtett fájlválasztókat (`loadFile`, `replayFile`) kihagyja a
vizsgálat: azokat kód indítja `.click()`-kel, ott nincs valódi egér.

---

## v4.8.1 — Az ellenfogás-tanács kimarad a kalózvilágból · 2026-08-09

A kijelölés sorában ez állt kalózmódban is:

```
2× Lándzsás · 1× Muskétás · 1× Fregatt · 1× Szlúp · 1× Halászhajó
  — erős a lovasság és a harckocsik ellen, gyenge a lövészek ellen
  — legénység 190/190 · 24 ágyú
```

A tanács a szárazföldi ellenfogás-háromszögről szól (lovasság ↔ lövész ↔
pikás), a kalózvilágban viszont **nincs lovasság és nincs harckocsi**, a
kijelölés pedig többnyire hajókból áll. A mondat így nemcsak fölösleges
volt, hanem elé is tolakodott a legénység- és ágyúadatnak, ami ott a
legfontosabb — az átszállás azon múlik.

Kalózmódban innentől kimarad, a kiképzőgombok buboréksúgójából is.
Szárazföldi játszmában változatlanul ott van.

---

## v4.8 — Több fél egy térképen (1. ütem: az alapréteg) · 2026-08-09

A cél: legfeljebb **hat ember + négy bot**, mindenki SAJÁT birodalommal.
Ez a motor legmélyebb rétegét érinti, ezért ütemekre bontottam. Ez az
első ütem — az alap áll, és a mostani egy az egy elleni játék
változatlanul fut tovább.

### A gond: két fél volt beépítve

A készleted a `G.res`-ben állt, a gépé a `G.ai.res`-ben. Két külön alakú
doboz ugyanarra a dologra, összesen közel száz hivatkozással a kódban.

### A megoldás: egy tábla, ablakokkal

Új modul, a `02c-oldalak.js`. Egyetlen tábla van, a `G.oldalak`, és
minden fél ugyanolyan bejegyzés benne — készlet, korszak, nemzet,
csapat, fejlesztések, ideológiák, és botoknál az AI munkaadatai is.

A régi mezőket NEM cseréltem ki, hanem **ablakot nyitottam** rajtuk:

```js
G.res  →  a helyi játékos készlete
G.ai   →  az első bot bejegyzése
G.age  →  a helyi játékos korszaka
```

Így a közel száz hivatkozás egy sor változtatás nélkül működik tovább,
miközben alatta már tíz fél áll. Ha egyetlen helyet is kézzel írtam
volna át, egy kihagyott sor csendes hibát okozna a szimulációban —
hálózati játékban pedig szétcsúszást.

### Ami már megvan

| | |
|---|---|
| oldalak | 10-ig, típusonként `ember` / `bot` |
| készlet, korszak, nemzet, fejlesztés, ideológia | félenként külön |
| csapatok | azonos csapatszám = szövetséges; alapból mindenki mindenki ellen |
| csapatszínek | 10 elváló árnyalat + színvakbarát paletta (Okabe–Ito) |
| bázisok | háromtól körben elosztva, mind szárazföldön |
| térképméret | a létszámhoz igazodik |

A térképméret azért kellett: tíz bázis az alapméretű világban 534
pixelre került egymástól, holott a bázis köré vágott üres folt maga 240
sugarú — a szomszédok gyakorlatilag összeértek. A gyök arányos növelés
nagyjából állandó egy főre jutó területet ad:

```
 2 fél → 3400 × 2400,  legkisebb bázistávolság ~1900 px
10 fél → 7480 × 5280,  legkisebb bázistávolság ~1175 px
```

Tíz féllel indított próbajátszmában mind a tíz birodalom felállt: saját
főhadiszállás, hét-hét jobbágy, külön készlet, elváló szín, mind
szárazföldön.

### Ami a következő ütemekre marad

1. **Több bot egyszerre.** Az `aiTick` ma egyetlen bot fejét viseli
   (`G.ai`), tehát a 2–4. bot jelenleg tétlen. Ez a következő lépés.
2. **Szoba (lobby).** Helyek, nemzetválasztás, csapatok, bot hozzáadása,
   „kész” jelzés.
3. **Hálózati alak.** A mostani protokoll két félre íródott
   (házigazda/vendég); N szereplőre kell bővíteni, a parancsok mellett a
   feladó azonosítójával.
4. **Szerver.** A `szerver.js` ma két gépet párosít; szobát kell kezelnie
   hattal, és mindenkinek továbbítania.
5. **Felület.** Ponttábla, kiesés kezelése, szövetségesek jelölése.

A megszokott játék ellenőrizve: 1v1 felállás, oktatómód mind a nyolc
lépése, menü mind a négy nyelven — futásidejű hiba nélkül.

---

## v4.7.1 — Az ikon másodszorra, és a néma Vissza gomb · 2026-08-09

### A Vissza gomb a többjátékos panelben

A panelok Vissza gombjait egyetlen sor köti be:

```js
for(const b of document.querySelectorAll('[data-back]')) b.onclick=…
```

A többjátékos panel gombján viszont csak a `back` OSZTÁLY volt rajta, a
`data-back` jelölő nem:

```html
<button class="mbtn back" data-t="vissza">Vissza</button>   <!-- hiányzik -->
<button class="back" data-back="1">Vissza</button>          <!-- a többi -->
```

Ezért abból az egy panelból nem lehetett visszajönni. Pótoltam a
jelölőt, és a kezelő mostantól **mindkettőre** figyel
(`[data-back], .back`), hogy egy új panelnél se fordulhasson elő ugyanez.

### Az ikon — miért nem elég a .ico

A v4.7-ben készített `.ico` minden bejegyzése **PNG-tömörítésű** volt:

```
 16x16  PNG      48x48  PNG     256x256 PNG
 24x24  PNG      64x64  PNG
 32x32  PNG     128x128 PNG
```

A 256-osnál ez szabványos, a kisebbeknél viszont a Windows
erőforrás-szerkesztője (`rcedit`, ezt hívja az electron-builder)
hagyományos **BMP-t** vár. Nem hibázik tőle, csak nem cseréli le az
ikont — így maradt az Electron atomikonja.

Az új fájl vegyes, ahogy a Windows várja:

```
 16x16  BMP 32 bit      64x64  BMP 32 bit
 24x24  BMP 32 bit     128x128 BMP 32 bit
 32x32  BMP 32 bit     256x256 PNG
 48x48  BMP 32 bit
```

Ezen felül az electron-builder alapból a `buildResources` mappában keresi
az `icon.ico`-t, ezért oda is került egy példány, és onnan hivatkozunk rá:

```json
"directories": { "buildResources": "build", "output": "kimenet" },
"win": { "icon": "build/icon.ico" }
```

Így nem múlik azon, melyik útvonalfeloldás lép működésbe.

---

## v4.7 — A többjátékos mód él · 2026-08-09

A lépészáras váz eddig is megvolt, de **soha nem futott két gépen**.
Írtam egy próbát (`halozat-proba.js`), ami két teljes játékklienst indít
fejnélküli böngészőben, összekapcsolja őket a saját szerveren keresztül,
és méri a szinkront. Három hiba került elő, mindhárom olyan, ami egy
gépen elvileg sem látszhatott.

### 1. A házigazda sosem indult el

```js
if(n.hazigazda) netKuld({t:'indulas', mag:..., nemzet:..., ...});
...
else if(m.t==='keszen'){
  if(n.hazigazda && n.varInditas){ … }     // n.varInditas SOHA nem kapott értéket
}
```

A házigazda kisorsolta a játszma paramétereit és elküldte, de magának nem
tette félre. Amikor megjött a vendég „keszen” üzenete, a feltétel nem
teljesült. Eredmény: a vendég egyedül elindult, a házigazda a menüben
maradt.

### 2. A házigazda eldobta a vendég első lépéseit

A két gép nem egyszerre indul: a vendég a „indulas”-ra kezd, a házigazda
csak a válaszul kapott „keszen”-re. Addigra a vendég már elküldte az
első hét üres kört — a `netJatekIndit` viszont kiürítette a bejövő
postaládát:

```js
n.bejovo={}; n.sajat={}; n.kimeno=[]; …
```

Ezek a lépések elvesztek, és a házigazda örökre a 0. lépésnél várt.
Mérve: házigazda 0. lépés, vendég 6., mindkettő állva. A takarítás
átkerült a kapcsolat felépítésébe, ahol még biztosan nem érkezett semmi.

### 3. Minden parancs kétszer futott le

Ez volt a legsúlyosabb. A `logAdd` a hálózatra tette a parancsot, **a
hívó viszont utána helyben is végrehajtotta**:

```js
function command(wx,wy){
  logAdd('cmd', selIdk(), wx, wy);   // elment a társnak…
  …                                  // …és itt MOST is lefutott
```

Vagyis nálad azonnal hatott, majd hat lépéssel később mégegyszer — a
társnál csak egyszer. Az első kattintás szétcsúsztatta volna a két
világot. A `logAdd` mostantól igaz értéket ad, ha elhalasztotta a
parancsot, és a hívó ilyenkor azonnal visszatér.

Kiderült az is, hogy **hat világot változtató művelet egyáltalán nem
került a naplóba**: harci állás, alakzat, töltetváltás, fejlesztés
vásárlása, korszakváltás és a kalózvárosi építés. Ezek eddig csak helyben
hatottak — mindegyik biztos szétcsúszás. Most mind naplózódik.

### A kijelölés helyi maradt

A parancsok azonosítókkal dolgoznak, a végrehajtás viszont átállítja a
`G.sel`-t. Ha ezt nem tennénk vissza, a társ minden kattintására kiugrana
a saját kijelölésed. A hálózati parancsok futása körül ezért elmentjük és
visszaállítjuk — mindenki a magáét látja.

### A mérés

```
két kliens · egy szerver · ~900 lépés · 8 kiadott parancs mindkét oldalról
A: lepes 857 · egys 28 · ep 9
B: lepes 857 · egys 28 · ep 9
szétcsúszás jelezve? NINCS ✔
```

Bármikor újrafuttatható: `npm run halozat-proba`.

### Amit MÉG nem tud

**Két külön birodalmat.** A 0. játékos gazdasága (`G.res`, `G.age`,
`G.upg`) egyetlen készlet, a másik oldalon a bot ül. A mód ezért **közös
birodalom**: ketten vezetitek ugyanazt a népet a gép ellen. Az egymás
elleni játékhoz játékosonkénti gazdaság kell — az `G.age` egyedül 109
helyen szerepel.

A gomb ezért él, de **PRÓBA** jelvényt visel, és a panel elöljáróban
elmondja, milyen módról van szó.

---

## v4.7 — Teljes képernyő és a Windows-ikon · 2026-08-09

### Az ikon

A telepített játékon az Electron alapértelmezett atomikonja maradt. Ok:
a `package.json` PNG-t adott meg Windows-ikonként.

```json
"win": { "icon": "assets/icon.png" }     // ← ebből gyakran nem lesz semmi
```

Az electron-builder elvileg átalakítja PNG-ből, gyakorlatban viszont
gyakran csendben átlép rajta. Most kész, **hét méretet tartalmazó
`assets/icon.ico`** van a helyén (16, 24, 32, 48, 64, 128, 256 képpont),
és a telepítő fejléce, a program- és az eltávolító ikon is ezt kapja.

A fejlesztés közben futtatott játék (`npm run desktop`) is az atomikont
mutatta a tálcán. Ehhez két dolog kellett:

```js
app.setAppUserModelId('hu.parthenon2.birodalom');   // a tálca ettől párosít
icon: ikonUt()                                      // Windowson .ico
```

### Teljes képernyő

Új sor a beállításokban, közvetlenül a Képméret fölött:

```
Teljes képernyő                              [ be ][ ki ]
az egész kijelzőt kitölti — F11
```

Kétféle burokban dolgozik ugyanaz a kapcsoló:

| hol | mi történik |
|---|---|
| asztali alkalmazás | az **ablak** megy teljes képernyőre — eltűnik a címsor és a tálca is |
| böngésző | a szabványos Fullscreen API |

Ha egyik sem érhető el, a sor **rejtve marad** — ne kínáljunk gombot,
ami nem csinál semmit.

Az **F11** mindkét helyen működik, és a menüben is, nem csak játék
közben. A kapcsoló és az F11 sosem mutathat mást: az asztali burok
visszaszól, ha az állapot megváltozott (`teljes-kepernyo-allapot`), és a
gombok ebből frissülnek — így az ablakkezelőből indított váltás is
látszik.

A választás **megmarad két indítás között**: a burok az Electron saját
adatmappájába írja (`ablak.json`), tehát a játék úgy indul, ahogy
kiléptél belőle.

Apróság, de sokat számít: az ablak `show:false`-szal jön létre, és csak a
`ready-to-show` eseményre jelenik meg — így nincs fehér villanás
indításkor. A `backgroundThrottling:false` pedig megakadályozza, hogy a
játék lelassuljon, ha másik ablakra váltasz.

---

## v4.6.1 — A „Hamarosan” buborék a gomb mellé került · 2026-08-09

A buborék a gomb FÖLÉ nyílt, és ezzel eltakarta az előtte álló
menüpontot — a főmenü gombjai ugyanis egymás alatt sorakoznak.

Mostantól a gomb **jobb oldalán** áll, függőlegesen középre igazítva,
balra mutató nyíllal:

```
│        Új játék         │
│      Többjátékos        │ ◀── ┌──────────────────────┐
│     Teljesítmények      │     │ HAMAROSAN            │
                                │ A többjátékos mód    │
                                │ még készül — a       │
                                │ következő változat-  │
                                │ ban érkezik.         │
                                └──────────────────────┘
```

A menü 300 pixel széles, a buborék 250, közte 14 pixel rés — ehhez
legalább ~830 pixelnyi ablak kell. Keskenyebb kijelzőn (900 px alatt)
ezért a gomb **alá** kerül, teljes szélességben, felfelé mutató nyíllal;
koppintás után úgyis magától eltűnik.

---

## v4.6 — „Hamarosan” a többjátékoson, és a néma gombok · 2026-08-09

### A Többjátékos gomb

A hálózati kód és a szoba-panel készen áll, de a szerver még nem
publikus. A gomb ezért **halványabb**, és nem vezet a panelra: helyette
buborék jelenik meg fölötte.

```
        ┌──────────────────────────────┐
        │         HAMAROSAN            │
        │  A többjátékos mód még       │
        │  készül — a következő        │
        │  változatban érkezik.        │
        └───────────────▼──────────────┘
        │        Többjátékos           │
```

Három módon nyílik meg, mert nem mindenki egérrel játszik:

| esemény | viselkedés |
|---|---|
| egér a gomb fölé | megjelenik, elhúzva eltűnik |
| billentyűfókusz (Tab) | megjelenik, továbblépve eltűnik |
| kattintás vagy koppintás | megjelenik, 2,6 másodperc után magától eltűnik |

A koppintás azért kell külön, mert érintőkijelzőn nincs egérmutatás — ott
a `:hover` sosem sülne el. A gomb `aria-disabled="true"` jelölést kapott,
és kattintásra elutasító hangot ad.

A buborék futásidőben épül, tehát nincs rajta `data-t` jelölő — az
`applyLang()` ezért külön frissíti, így nyelvváltáskor is fordul
(Coming soon · Demnächst · 敬请期待).

### Négy gomb, ami eddig néma volt

Egy régi elcsúszás: a **Többjátékos**, a **Visszajátszás megnyitása**, a
**Visszajátszás mentése** és a **Kegyelemlevél** bekötése beleragadt a
`quitGame()` belsejébe, a „biztos kilépsz?” ágba:

```js
function quitGame(){
  if(!quitArmed){
    quitArmed=true;
    if($('mReplayLoad')) $('mReplayLoad').onclick=…   // ide sosem kellett volna
    …
```

Így ezek a gombok csak akkor kaptak eseménykezelőt, ha a játékos előbb
rákattintott a **Kilépés** gombra. Aki nem tette, annak egyszerűen nem
történt semmi. A blokk átkerült egy külön `initMenuExtra()` függvénybe,
amit a menü felépítése hív meg — ahogy a többi bekötést is.

---

## v4.5.1 — Az oktatómód végre végigjátszható · 2026-08-09

Az előző patch javította, hogy az **Oktatómód gomb** egyáltalán elindul-e
(a `G.diff` a `DIFF` tömb sorszáma, nem a kulcsa). Most végigjátszottam
mind a nyolc lépést, és kiderült, hogy kettő közülük **magától
kipipálódott**.

A kezdőbázis összetétele (`foundBase`):

```
7 jobbágy · 3 katona (2 lovas + 1 lövész) · 2 majorság · kaszárnya · főhadiszállás
```

A 4. és 5. lépés feltétele viszont ez volt:

```js
// 4. „Több jobbágy kell”
kesz:()=>...role==='worker').length>=5      // már induláskor 7 van
// 5. „Kaszárnya és katonák”
kesz:()=>G.units.some(u=>...melee|ranged|spear)  // már induláskor 3 van
```

Vagyis amint a játékos felépítette a harmadik majorságot, a doboz
**átugrott két lépésen** — soha nem képzett ki jobbágyot, soha nem
nyúlt a kaszárnyához, mégis a harci álláson találta magát. A kezdő
jobbágyszám valamikor ötről hétre nőtt (a kódban ott is a megjegyzés:
„hét munkással indulsz, nem öttel”), de a feltételek nem követték.

A küszöb mostantól a kezdőállományhoz képest kér **egy újat**:
nyolc jobbágy, illetve négy katona.

Az 5. lépés szövege is félrevezetett: kaszárnya építését kérte, holott
a bázison már áll egy. Most így szól: *„A kaszárnyád már áll a bázison.
Jelöld ki a kaszárnyát, és képezz ki benne egy új katonát.”* — mind a
négy nyelven.

Ellenőrizve lépésről lépésre, magyarul, angolul, németül és kínaiul:
a 4. és az 5. lépés kivárja a játékost, a Kihagyom gomb bármikor kilép,
és a játék utána zavartalanul fut tovább.

---

## v4.5 — A felület mind a négy nyelven · 2026-08-09

A nyelvváltás működött, a szótár viszont csak a gombok töredékét fedte
le — minden más rögzített magyar szöveg volt a HTML-ben és a kódban.
Innentől **a teljes felület fordul**.

### A fordítómotor

Eddig egyetlen attribútum volt, a `data-t`, és az az elem teljes
szövegét cserélte. Egy beállítássor viszont két mondatból áll:

```html
<span>Időjárás<em>eső és hó, hatással a látásra</em></span>
```

A `textContent` cseréje az `<em>`-et is elnyelte volna. Ezért az
`applyLang()` mostantól hat jelölőt ismer:

| jelölő | mit cserél |
|---|---|
| `data-t` | az elem saját felirata (a `<kbd>`, `<span>` érintetlen marad) |
| `data-t2` | a benne álló `<em>` vagy `<small>` magyarázat |
| `data-t3` | a `<span>` állapotjelző |
| `data-tb` / `data-tc` | a billentyűtábla bal, illetve jobb oszlopa |
| `data-tph` | beviteli mező helyőrzője |
| `data-ttl` | buboréksúgó (`title`) |

Nyelvváltáskor ráadásul minden panel újrarajzolódik, és a Folytatás gomb
felirata is frissül.

### Ami lefordult

- **teljes menü** — főmenü, új játék, teljesítmények, többjátékos, beállítások (mind a 16 sor, alcímekkel)
- **10 táj** neve és leírása, **3 nehézség** leírása, **4 korszak** alcíme
- **12 nemzeti előny** címe és hatása
- **117 ideológia** neve és leírása — ez ugrik fel minden korszakváltásnál
- **13 fejlesztés** (kovácsműhely és akadémia) rövid és teljes neve, hatása
- **66 küldetésnév és eligazítás** — a nyolc nemzet és a három kalózfrakció hadjárata
- **oktatómód** mind a nyolc lépése
- **HUD** — nyersanyagsáv, korszakdoboz, parancssáv, alakzatok, harci állások, épületpanel, kém- és piacgombok
- **billentyűlista** mind a 21 sora
- **~120 játék közbeni üzenet**

Összesen **több mint 320 új szótárkulcs**, mind a négy nyelven.

### Két hiba is előkerült közben

**Az Oktatómód gomb nem indított semmit.** A `G.diff` a `DIFF` tömb
sorszáma, a gomb viszont a kulcsot írta bele:

```js
G.diff='easy';        // DIFF['easy'] → undefined
```

Emiatt a `newGame` a `DIFF[G.diff].wave` sornál elszállt. Most `G.diff=0`.

**A kő címkéje csupa nagybetűs volt** a nyersanyagsávban (`STONE`,
`STEIN`), mert a kalózmódot kezelő ág a `T('ko')` nagybetűs változatát
írta vissza. A sáv saját kulcsát kapta meg.

### Ami még magyarul marad

Az uralkodók életrajzai (27 KB folyó szöveg, 44 bejegyzés). A játék
ettől használható marad idegen nyelven is: az életrajz csak a
bemutatkozó kártyán és a portré alatt olvasható.

---

## v4.4.3 — Valódi zászlók a nyelvválasztóban · 2026-08-09

A választó a helyére került, de a zászlók még CSS-színátmenetek voltak —
és közelről látszott, hogy nem az igaziak:

- a **briten** két ferde fehér sáv állt kereszt helyett, vörös átló és a
  jellegzetes eltolás nélkül
- a **kínain** egyetlen `★` betűkarakter jelölte az öt csillagot
- a magyar és a német trikolór stimmelt, de raszteresen skálázódott

Mind a négy zászló mostantól **beágyazott SVG**: a mai, hivatalos állami
lobogó, mértani szerkesztéssel.

```
hu  6:3   #ce2939 · #ffffff · #477050
en 60:30  Union Jack — a vörös átlók szabályos eltolásával
de  5:3   #000000 · #dd0000 · #ffce00
zh 30:20  a nagy csillag (5,5), a négy kicsi ívben — mind a közepe felé fordul
```

A kínai zászló négy kis csillaga nem véletlenszerűen áll: mindegyik úgy
van elforgatva, hogy a felső csúcsa a nagy csillag közepére nézzen
(239,04° · 261,87° · 285,95° · 308,66°).

A brit zászló rajza a lap keretére van vágva — a ferde sávok szélessége
egyébként túllóg a sarkokon.

SVG lévén a zászlók retina kijelzőn és nagyításban is élesek, és a
`build.js` továbbra is egyetlen, önmagában futtatható fájlt ad.

---

## v4.4.2 — A nyelvválasztó visszakerült a lapra · 2026-08-09

Az előző patch a **fordításokat** javította — a hiba viszont eggyel
lejjebb volt: a nyelvválasztó gomb **be sem került az oldalba**.

A `build.js` három darabból rakja össze a fejlécet:

```
head.html   … <style>          ← itt nyílik a stíluslap
style.css   … a CSS
body.html   … </style></head><body>   ← és itt záródik
```

A nyelvválasztó jelölése a `body.html` **elején** állt, vagyis a lezáró
`</style>` ELÉ esett. A böngésző ezért nem elemnek olvasta, hanem a
stíluslap szövegének — a `#langBox`, a `#langBtn` és a `#langList`
sosem született meg a DOM-ban.

A menü kódja ezt csendben elviselte:

```js
const gomb=$('langBtn'), lista=$('langList');
if(gomb&&lista&&lista.appendChild){ … }   // sosem futott le
```

Nem dobott hibát, nem írt a naplóba — egyszerűen nem volt gomb, amire
kattintani lehetett volna. Innen a „nem működik a nyelvválasztás”.

**Javítás:** a blokk a `</style></head><body>` mögé került, továbbra is
a `body` közvetlen gyerekeként (ez az iOS-es rögzített helyzet miatt
fontos, lásd v3.5.1).

**Hogy ne fordulhasson elő újra:** a `build.js` mostantól megnézi, esik-e
`<div>`, `<button>` vagy más elem a `</style>` elé, és inkább megáll:

```
  html egyensúly: 174 nyitó / 174 záró ✔
  jelölés a </style> után ✔
```

Ellenőrizve mind a négy nyelven: gomb felirata, menüpontok, nemzetnevek,
korszakok, tájak és nehézségek egyszerre fordulnak.

---

## v4.4.1 — A nyelvváltás a nemzetválasztón is · 2026-08-08

A nyelvváltás **működött**, csak a nemzetválasztó képernyő fele magyar
maradt — és így úgy tűnt, mintha nem csinálna semmit.

Ami nem fordult: a **korszakok** (15. század…), a **tájak** (Alföld,
Sivatag, Tóvidék…) és a **nehézségek** (Könnyű, Közepes, Nehéz). Ezek
rögzített magyar szövegek voltak a menü kódjában.

Most mind a négy nyelven megvannak:

```
hu: 15. század      | Sivatag | Nehéz
en: 15th century    | Desert  | Hard
de: 15. Jahrhundert | Wüste   | Schwer
zh: 15世纪           | 沙漠     | 困难
```

Emellett nyelvváltáskor **mind a négy panel** újrarajzolódik: a nemzetek,
a korszakok, a tájak és a nehézségek.

---

## v4.4 — Teljes átvilágítás · 2026-08-08

Minden szegmens ellenőrizve. **Négy valódi hibát találtam**, mind olyat,
amit a szokásos tesztek nem mutattak ki.

### 1. A teljes utómunka nem futott le

A **fényirány, a színhangolás, a tónus, a ragyogás, a vignetta és a
szemcse** — a v3.3 óta egyik sem működött. A hívásuk kimaradt a hurokból,
amikor a rögzített időlépésre álltam át.

Ez magyarázza, miért mértem korábban „ingyennek": **nem is futott**.
Most visszakötve, és valóban látszik.

### 2. Az utómunka valódi ára — és az önvédelem

A tényleges mérés rétegenként:

| réteg | ára |
|---|---|
| színhangolás (telítettség) | 194 ms |
| tónus (hideg árnyék, meleg fény) | 210 ms |
| fényirány + vignetta | ~145 ms |
| ragyogás | 1 ms |
| filmszemcse | 2 ms |

A két színréteg viszi a költség háromnegyedét. Erős gépen a videokártya
végzi, szinte ingyen — gyengén viszont sok. Ezért **önvédelmet** kaptak:
38 kép/mp alatt kimaradnak, a többi marad.

Mérve: lassú gépen **705 → 169 ezredmásodperc**.

### 3. A visszajátszást nem lehetett megnyitni

A lejátszás kódja készen állt, de **nem vezetett hozzá út a felületről** —
menteni lehetett, betölteni nem. Új menüpont: **Visszajátszás megnyitása**.

### 4. Három épület nem volt lefordítva

Az **aranybánya, a cukornád-ültetvény és a favágótelep** magyarul maradt
angolul, németül és kínaiul is. Pótolva.

### Apróságok, amik menet közben javultak

- A tengeri idő neve (vihar, szélcsend) most megjelenik a korszakdoboznál
- Kilépéskor a hálózati kapcsolat is lezárul — eddig a társ a semmire várt
- Többjátékos játszmát nem lehet menteni (félrevezető lett volna)
- Két sosem használt segédfüggvény törölve

### A záró állapot

```
574 függvény, halott: egy sincs | duplikált: egy sincs
konstans: minden használatban   | console.log: 0 | kikommentelt kód: 0
HTML: 197 elem, duplikált azonosító nincs, CSS árva szabály nincs
sprite: 216 egység + 68 épület — hibátlan
küldetés: 66 + 18 kalóz — hibátlan
nyelv: 68 kulcs × 4 nyelv, minden név lefordítva
mentés: minden mező azonos | determinizmus: 6/6 | visszajátszás: 5/5
hálózat: a két világ azonos marad | teljesítmények: 16/16
```

---

## v4.3 — Motorfüggetlen szimuláció · 2026-08-08

**Telefon és gép is összekapcsolható — bármelyik böngészővel.**

### A gond, amit megszüntettünk

A `Math.sin`, `Math.cos` és `Math.atan2` eredménye **motoronként eltérhet**
az utolsó bitekben. A Chrome (V8) és a Safari (JavaScriptCore) más
közelítést használ — és mivel **iPhone-on minden böngésző WebKitet futtat**,
egy telefon és egy asztali gép között ez szétcsúszást okozott volna.

A szimuláció **71 helyen** használt ilyen függvényt.

### A megoldás

A négy alapművelet (+ − × ÷) az IEEE 754 szabvány szerint **bitre azonos
minden motoron**. Ezért saját közelítést írtunk, amely csak ezekből épül:

| függvény | legnagyobb eltérés a beépítettől |
|---|---|
| `dsin` | 3,8 × 10⁻⁸ |
| `dcos` | 3,8 × 10⁻⁸ |
| `datan2` | 1,9 × 10⁻⁸ |

A játékban egy képpont az egység — ez huszonötmilliószor kisebb annál.
Az abszolút pontosság amúgy sem számít: az a lényeg, hogy **minden gépen
ugyanaz** legyen.

**43 sorban** cserélve a szimulációs kód; a rajzolás maradt a beépített
függvényeknél, mert az gyorsabb és nem érinti a világot.

A csatlakozáskori motorfigyelmeztetés így okafogyottá vált — csak a
játékváltozatnak kell egyeznie.

---

## v4.2.1 — Változat- és motorellenőrzés · 2026-08-08

**Windows és Mac gond nélkül összekapcsolható** — de két dolognak egyeznie kell.

**A játékváltozat.** Eltérő változat eltérő szimulációt jelent: a két világ
az első másodpercben szétcsúszna. A csatlakozáskor most egyeztetünk, és ha
nem egyezik, a játszma el sem indul:

> Eltérő játékváltozat: nálad 4.2.1, a társnál 4.1. Ugyanazt a változatot
> kell futtatnotok.

**A böngészőmotor.** Az operációs rendszer NEM számít — a Chrome Windowson
és Macen ugyanazt számolja. A *motor* viszont igen: a Chrome és a Safari
lebegőpontos függvényei (szinusz, koszinusz) eltérhetnek egy-egy bitnyit,
és ennyi is elég a szétcsúszáshoz. Eltérő motornál figyelmeztetünk.

**A szerver kiírja a saját címeit.** Indításkor megmutatja, mit kell megadni
a másik gépen:

```
A játékban ezt add meg címként (ugyanazon a hálózaton):
    ws://192.168.1.20:8787

Ugyanezen a gépen:  ws://127.0.0.1:8787
Interneten át: a routeren nyitni kell a 8787. kaput.
```

---

## v4.2 — Többjátékos · 2026-08-08

**Működik.** Két gép, egy szerver, lépészáras parancscsere — és a két világ
végig azonos marad.

### A szerver

Egyetlen fájl a csomagban: **`szerver.js`**. Külső csomag nélkül fut,
elég hozzá a Node:

```
node szerver.js            (8787-es kapu)
node szerver.js 9000       (más kapun)
```

Szobákat tart nyilván, és továbbítja a játékosok üzeneteit. **A játékot nem
számolja** — csak parancsokat továbbít, néhány száz bájtot másodpercenként.
Ezért fut el a legkisebb gépen is.

Böngészőből megnyitva állapotlapot mutat: hány szoba, hány játékos.

### A játékban

Új menüpont: **Többjátékos**. Megadod a szerver címét
(`ws://a-géped-címe:8787`), és vagy **szobát nyitsz** — kapsz egy négybetűs
kódot —, vagy **csatlakozol** a kóddal.

### Hogyan működik

Nem a világállapot megy át, hanem a **parancsok**. Amikor parancsot adsz, az
nem azonnal hat, hanem **hat lépéssel később** (300 ezredmásodperc): ennyi
idő alatt a másik gép is megkapja, és mindkettőn ugyanabban a pillanatban
fut le.

Minden lépéshez **kell** a másik fél üzenete, akkor is, ha nem adott
parancsot. Ha nem érkezett meg, a szimuláció **vár** — inkább akadjon a
játék, mint hogy szétcsússzanak a világok.

Másodpercenként **ellenőrző összeget** cserélünk. Ha eltér, a játszma
azonnal megáll: onnantól két külön játék menne.

### A hiba, amit a próba fedett fel

**A saját parancsod sosem futott volna le.** Elküldtem a társnak, de a
saját gépemen nem ütemeztem be — nála hat lépéssel később hatott volna,
nálam soha. Az első paranccsal szétcsúsztak volna a világok.

Most a saját parancs is a jövőbe kerül, és **fix sorrendben** fut le
mindkét gépen: elöl a házigazdáé, utána a vendégé — így akkor is azonos a
sorrend, ha egyszerre adtok parancsot.

### A mérés

Két teljes játék, valódi szerveren át, sűrű parancsfolyammal mindkét
oldalról:

```
A gép ellenőrző összege: 485a4805
B gép ellenőrző összege: 485a4805
egység A/B: 34 / 34          ✔ A KÉT VILÁG AZONOS MARADT
```

Hetvenöt másodperc játék, mozgatás, kiképzés és építés mindkét oldalról.

---

## v4.1 — Rögzített ütem és visszajátszás · 2026-08-08

A determinizmus második fele, és az első kézzelfogható eredmény.

### Rögzített időlépés

A szimuláció mostantól **másodpercenként pontosan húsz lépésben** halad,
mindig 0,05 másodperccel — akárhány képkockát rajzol közben a gép. Enélkül
két gép más ütemben számolna, és hiába magvas a véletlen, a világok
szétcsúsznának.

A rajzolás ettől független: a kamera, a füst, a felület a képkocka ütemében
megy. Ha a gép lemarad, legfeljebb hat lépést pótolunk egyszerre — inkább
lassuljon a játék, mint hogy egy akadás után percekig pótoljon.

### Parancsnapló és visszajátszás

Minden beavatkozás bekerül egy naplóba a lépés sorszámával:

```
{ l: 340, p: "cmd", a: [[12,13], 1502, 880] }
```

**A mag és a napló együtt pontosan visszaadja a játszmát.** Mérve, sűrű
parancsfolyammal:

```
magyar   60 mp   ✔ PONTOS |  40 parancs | 1 986 bájt
német   120 mp   ✔ PONTOS |  78 parancs | 3 796 bájt
kalóz   120 mp   ✔ PONTOS |  78 parancs | 3 795 bájt
orosz   300 mp   ✔ PONTOS | 193 parancs | 9 278 bájt
Bonnet  300 mp   ✔ PONTOS | 193 parancs | 9 277 bájt
```

**Öt perc játék kilenc kilobájt.** Ugyanez megy majd át a hálózaton is.

A szünet menüben új gomb: **Visszajátszás mentése**.

### Három hiba, amit a visszajátszás fedett fel

1. **A parancs egy lépéssel később hatott** visszajátszáskor, mert a
   játékos két lépés KÖZÖTT ad parancsot.
2. **A parancs más játékidőben futott**: a napló feldolgozását az idő
   léptetése ELÉ kellett tenni.
3. **Az ütemezők átvándoroltak** az előző játszmából. A ködfrissítés fázisa
   eltolódott, a bot más ködképet látott, és a felderítési pont keresése
   más számú véletlenhívást fogyasztott. A világ sokáig azonosnak látszott,
   de a véletlen sodródott.

---

## v4.0 — A szimuláció determinisztikus · 2026-08-08

**A többjátékos mód alapja elkészült.** Ugyanaz a mag ugyanazt a játszmát
adja — az utolsó bitig.

```
magyar 10 perc   ✔ AZONOS | egység 32 | épület 14 | véletlenhívás 10 255
német 10 perc    ✔ AZONOS | egység 31 | épület 10 | véletlenhívás  5 634
kalóz 10 perc    ✔ AZONOS | egység 43 | épület 11 | véletlenhívás 10 374
orosz 15 perc    ✔ AZONOS | egység 37 | épület 10 | véletlenhívás 10 440
Bonnet 15 perc   ✔ AZONOS | egység 43 | épület 11 | véletlenhívás 18 495
brit 20 perc     ✔ AZONOS | egység 36 | épület 10 | véletlenhívás 21 402
```

Húsz perc játék, huszonegyezer véletlenhívás — és a két futás ellenőrző
összege karakterre egyezik.

### Az utolsó két hiba

A determinizmus akkor törik el, ha a szimuláció **szabad véletlent** használ.
A legutolsó kettő nagyon jól rejtőzött, mert csak percek múlva látszott:

1. **A bot felderítése.** A felderítetlen pontot szabad véletlenből
   kereste, ráadásul *változó számú próbálkozással* — így nem is a hívások
   száma árulta el, hanem a felderítő iránya. Húsz másodperc után csúszott el.

2. **A beszorult egység oldallépése.** Ha egy egység elakad, nyolc irányba
   próbál kilépni — és az irányt szabad véletlen adta. Ötven másodperc után
   ezen csúsztak szét a világok, mert az egyik játszmában balra, a másikban
   jobbra kerülte meg az akadályt.

Mindkettő azért volt nehéz, mert **egyjátékos módban tökéletesen működik**.
Csak akkor derül ki, ha két futást bitre összevetsz.

### A módszer, ami megtalálta

Két azonos játszma egyetlen folyamatban, és **tickenként minden mező
összevetve** — nem csak a pozíció, hanem az egységek összes tulajdonsága.
Ez pontosan megmutatta, melyik mező romlik el elsőként és mikor.

---

## v3.9 — A többjátékos alapja: magvas véletlen · 2026-08-08

Az első lépés a hálózati játék felé. A lépészáras (lockstep) hálózat —
amit az Age of Mythology is használ — csak a **parancsokat** küldi át, nem
a világállapotot. Ennek egyetlen feltétele van: a szimulációnak
**tökéletesen kiszámíthatónak** kell lennie.

### Kétféle véletlen

| | mit használ | hol |
|---|---|---|
| **Szimulációs** | `srnd()` — magból fut | harc, bot, időjárás, események, terep |
| **Látvány** | `rnd()`, `Math.random()` | füst, szikra, fűszálak |

A kettőt sosem szabad összekeverni: a két gép **különböző számú képkockát**
rajzol, ezért ha a látvány fogyasztaná a magot, azonnal szétcsúsznának a
világok.

**Több mint száz helyen** cseréltem magvasra a szimulációs véletlent:
a bot döntései, a terep, a víz, az időjárás, a tengeri vihar, az események,
az ostrom, a hírnév, az egységek ágyúszáma.

### Ellenőrző összeg

A világ állapotának rövid ujjlenyomata (`simChecksum`). Két gép ezt cseréli
majd időnként: ha eltér, a szimulációk szétcsúsztak.

### Amit a mérés kimutatott

A **világ létrehozása most bitre azonos** ugyanazzal a maggal — egység,
épület, lelőhely, vízcella, minden. Három rejtett hiba derült ki közben:

1. **A táj magját a terep létrehozása UTÁN sorsoltuk** — a terep így a
   megelőző játszma magjából készült.
2. **Az azonosító-számláló nem nullázódott** — a második játszma egységei
   360-tól kaptak számot. A világ bitre azonos volt, csak a nevek csúsztak.
3. **Az útkereső gyorsítótára átvándorolt** az előző játszmából, és a régi
   térkép szerint vezette az egységeket.

### Ami még hátravan

Futás közben húsz másodperc után **még marad egy apró elcsúszás**, ami nem
a véletlenből jön (a véletlenhívások száma azonos). Valamelyik átmeneti
tár túléli a játszmaváltást — ezt a következő körben kerítem elő.

A hálózat maga **WebRTC**-vel, kiszolgáló nélkül fog menni: a két gép
közvetlenül beszél, nincs havidíj.

---

## v3.8.1 — Saját fészek, szelídebb vihar · 2026-08-08

### Minden frakciónak saját városa

Eddig mind a három kalóz Nassauban ült. Mostantól:

| frakció | fészek |
|---|---|
| **Nassau** | Nassau, a kalózköztársaság |
| **Fekete Szakáll** | Tortuga, a francia kalózsziget |
| **Stede Bonnet** | Port Royal, ahonnan az úri kalóz indult |

Az ellenség mindig másik kikötőt kap.

**Csak a saját városodat irányíthatod.** Korábban minden városban lehetett
építeni és hajót kiállítani, ami értelmetlen volt — Nassauból nem lehet
Santiagót igazgatni. Az idegen városban most csak a BEZÁRÁS karika jelenik
meg; ott az a dolgod, hogy szétlődd a tornyokat és partra szállj.

**Az elfoglalt város irányíthatóvá válik.** Mérve: Tortugával indulva,
Havanna elfoglalása után mindkettőben építhetsz.

### A vihar szelídebb lett

| | előtte | most |
|---|---|---|
| hullámsebzés | 1,6 / mp | **0,45 / mp** |
| villámcsapás | 5–14 mp-enként | **22–52 mp-enként** |
| villám sebzése | 46–86 | **16–30** |
| tölcsér sebzése | 26 / mp | **9 / mp** |
| vihar esélye | 30% | **22%** |

Mérve: **egy perc viharban a hajó életerejének 11%-át** veszti, és két
villám csap le. Korábban ez a hajó nagy részét elvitte.

---

## v3.8 — Töltetek és hírnév · 2026-08-08

### Három töltet, egy ágyú

| töltet | test | legénység | vitorla |
|---|---|---|---|
| **Golyó** | ×1,00 | ×1,0 | — |
| **Láncos** | ×0,35 | ×0,5 | **tépi** |
| **Kartács** | ×0,25 | **×3,5** | — |

Mérve, száz találat ugyanarra a gályára:

```
golyó     test 504 →  -6    legénység 340 →  65    elsüllyedt
láncos    test 504 → 154    legénység 340 → 246    vitorla 100% → sebesség ×0,40
kartács   test 504 → 254    legénység 340 →   0    a fedélzet üres
```

Ez adja a taktikai mélységet az átszálláshoz: **láncossal megállítod**,
**kartáccsal kiüríted**, aztán átszállsz — vagy **golyóval** egyszerűen
elsüllyeszted. A megtépett vitorla félperc alatt javul magától.

A töltet a parancssávban váltható, ha ágyús hajót jelöltél ki.

### Hírnév

A jobb szélen álló mérő telik, ahogy raboltál:

| tett | hírnév |
|---|---|
| elsüllyesztett hajó | +6 |
| elfoglalt hajó | +9 |
| **elfoglalt város** | **+18** |
| lerombolt épület | +2 |

Küszöbökön üzenet figyelmeztet, és amikor **megtelik, kifut a királyi
hajóhad**: három-nyolc hadihajó tart a bázisod felé. Mérve: 100-nál négy
hajó jelent meg, a mérő 55-re csillapodott.

**Kegyelemlevél** nullázza a hírnevet — de a király elveszi a legkisebb
városodat a körülötte álló épületekkel együtt. Az **utolsó** várost nem
adhatod oda: az nem döntés lenne, hanem azonnali vereség.

Nyugton maradva a hírnév lassan magától is csillapodik.

---

## v3.7 — Tengeri viharok · 2026-08-08

### Három tengeri állapot

| állapot | mit csinál |
|---|---|
| **Szélcsend** | a vitorlák lógnak, a hajók **fele sebességgel** járnak |
| Rendes | semmi különös |
| **Vihar** | a látótáv **felére** esik, és három veszély fenyeget |

### A vihar három veszélye

- **Nagy hullám** — folyamatos sebzés minden hajónak a nyílt vízen.
  A parthoz közel gyengébb, tehát a sekély vízbe menekülni érdemes.
- **Villám** — időnként lecsap egy hajóra: nagy sebzés, és a legénység
  is fogy. **Az árbocot keresi**, ezért a gálya háromszor akkora eséllyel
  kapja, mint a szlúp.
- **Tölcsér** — vándorló vízoszlop, ami tépi és magához húzza a hajókat.
  Kanyarogva jár, és a partnak ütközve elfordul.

Mérve: viharban a hullámok sebeznek, a villám lecsap, a tölcsér járja a
vizet, szélcsendben a sebesség pontosan a fele.

### Az éjszaka és a vihar súlya

**A hajók éjjel rejtőznek.** Sötétben egy vitorlás sziluettje elvész a
tengeren: az ellenség csak **55%-os** távolságból veszi észre — viharban
még kevesebbről. Ettől lett értelme az **éjszakai rajtaütésnek**:
besurransz a városhoz, mielőtt a tornyok tüzet nyitnának.

### Flottasáv

A képernyő bal oldalán a hajóid listája: **osztály, sérülés, legénység**.
Koppintásra a kamera odaugrik és kijelöli. Csak akkor jelenik meg, ha van
hajód, és csak akkor épül újra, ha változott valami — ugyanaz a hiba, ami
a városmenüt egyszer megbénította, itt nem fordulhat elő.

### Lőtávgyűrű

Az idegen városok tornyainak hatósugara **vörös szaggatott gyűrűvel**
látszik, mielőtt beúsznál — de csak akkor, ha van a közelben hajód,
különben tele lenne a térkép.

---

## v3.6 — Pajzs a városnál · 2026-08-08

A városnév mellett **pajzs** áll, benne a tornyok száma. Egy pillantásra
megmondja, mennyi ágyúzás vár rád, mielőtt partra szállhatsz.

- Színes pajzs a város gazdájának színében, ha áll még torony
- **Halvány, üres pajzs** = védtelen város, azonnal partra szállhatsz
- A tornyok száma így kikerült a névtábla alsó sorából — ott csak a
  lakosság marad

---

## v3.5.2 — Üres menü, árak, nagyobb ikon · 2026-08-08

### A menü üres volt — az én hibám

Amikor a nyelvválasztót kiemeltem a menüből, a kivágás **egy sorral
korábban ért véget**, és egy **árva `</div>`** maradt a menü elején. Ez
idő előtt lezárta a menüt, így a cím, a gombok és minden más kívül esett
rajta — a képernyő üresen maradt.

Mostantól a fordítás ellenőrzi a nyitó és záró elemek **egyensúlyát**:
160 nyitó, 160 záró.

### Árak a városmenüben

Az építési körök **két sorban** mutatják, mit ad az épület és mibe kerül:

```
Uradalmi major       +1.1 Élelem        135 Fa
Aranybánya           +0.8 Arany         230 Fa · 110 Rum
Cukornád-ültetvény   +0.8 Rum           195 Fa · 75 Arany
Favágótelep          +0.8 Fa            145 Fa · 60 Arany
```

A körök ehhez nagyobbak lettek (92, illetve 104 képpont).

### Nagyobb városikon

A jelölő **két és félszeresére** nőtt, a névtábla pedig lejjebb csúszott
alatta. Messziről is látszik, hol vannak a városok.

---

## v3.5.1 — A nyelvválasztó a helyére, véglegesen · 2026-08-08

**Az ok, amit eddig nem találtam meg:** az `#menu` **görgethető doboz**
(`overflow-y:auto` és `-webkit-overflow-scrolling:touch`), és iOS-en az
ilyen ős **magához köti a rögzített helyzetű elemeket**. A `position:fixed`
tehát nem a képernyőhöz igazodott, hanem a menü tartalmához — ezért csúszott
a választó középre, a cím alá.

Asztali böngészőben ez nem látszik, mert ott a rögzített elem valóban a
képernyőhöz igazodik. Ezért nem tudtam reprodukálni.

**A javítás:** a nyelvválasztó kikerült a menüből, és **közvetlenül a `body`
gyereke** lett — így egyetlen konténer sem befolyásolja.

Emellett:

- a legördülő lista háttere **átlátszatlan** lett (eddig átütött rajta a cím)
- a rétegsorrend rendezve: menü (20) → **nyelvválasztó (45)** → bemutatkozó (60)

---

## v3.5 — Rét és hullámzás · 2026-08-08

**A fű nagyléptékű változatossága.** A talaj eddig egyetlen zöld volt: a
nagy üres területeken nem volt mit nézni. Most világosabb és sötétebb
rétfoltok futnak rajta.

A megvalósítás tanulságos: **először külön rétegként csináltam**, teljes
képernyős keveréssel — és 230 ezredmásodpercet vitt el képkockánként.
Most a foltok **magába a fűcsempébe** vannak festve, ami egyszer készül el
a játszma elején. Így képkockánként **semmibe nem kerül**. A foltok a
csempe szélén körbeérnek, ezért az ismétlődés nem látszik éles határként.

**A tenger hullámzik.** Két zajréteg sodródik rajta, eltérő sebességgel és
irányban, fölötte napcsillanás fut a hullámokon — ami a napszakkal
halványul, és a nap felőli oldalra húz.

A rétegeket a **lágy vízmaszk** vágja ki, amit ugyanabból a
nedvesség-mezőből építünk, mint a partvonalat. Első nekifutásra cellánként
vágtam, és a négyzetes szélek visszahozták pontosan azt a lépcsőzést,
amit az előző körben megszüntettünk.

**Három gyorsítás a hullámzáson:**

- a csempe **átlátszó közepű** (világos és sötét foltok, közöttük semmi),
  ezért elég sima rárajzolás — nincs szükség drága keverésre
- csak a **látható víz köré** dolgozunk: szárazföldi pályán egyetlen
  műveletet sem végzünk
- **önvédelem**: ha a képkockaidő tartósan 30 kép/mp alá esik, a réteg
  magától kimarad. Inkább legyen sima a tenger, mint akadozó a játék.

Kikapcsolható a **Fényhatások** beállításban.

---

## v3.4 — Sima partvonal · 2026-08-08

A képek legrégiesebb eleme a **lépcsős partvonal** volt: a víz, a homok és
a mélyvíz között 32 pixeles négyzetek látszottak.

**Nedvesség-mező.** A partvonal korábban cellánként kapott színt — víz vagy
homok, éles határral. Most minden cellához **folytonos értéket** számolunk
(0 = száraz, 1 = nyílt víz), és ezt kétszer elsimítjuk. A színt ebből
olvassuk ki, így a part lágy görbe lesz, nem lépcső.

A **játékmenet változatlan**: az `isWater()` továbbra is a nyers rácsból
dolgozik — csak a kép lett szebb. A hajók útkeresése, a partraszállás és a
halászat érintetlen.

**A varratok eltűntek.** A nyílt víz korábban átlátszó maradt a képen, és a
felnagyításkor a szél beleolvadt az átlátszóba — a lapos mélyvíz-kitöltéssel
négyzetes foltok keletkeztek. Most minden vízcella kap színt, és a képet
**egyetlen** felnagyítással rajzoljuk a látható területre: nincs több határ,
és gyorsabb is (egy `drawImage` sok helyett).

**A hab már nem rácsos.** A foltok mérete, eltolása és üteme a cella
azonosítójából sorsolódik — korábban szabályos négyzethálót rajzoltak ki.

A köztes kép felbontása 4-ről **6-szorosra** nőtt.

---

## v3.3 — Fény és utómunka · 2026-08-08

Hat réteg, ami a rajzolt képet modernebbé teszi. Mindegyik olcsó: egyetlen
teljes képernyős művelet vagy néhány gyorsítótárazott kép.

**Kontaktárnyék** — puha folt az egységek alatt, a naptól elfelé tolva.
A régi kemény ellipszis helyett ez teszi a katonát a fűre; enélkül
ráragasztottnak látszott.

**Fényirány** — a nap felőli oldal melegebb és világosabb, a túlsó hidegebb
és sötétebb. Ugyanabból a napállásból, amiből az árnyék jön, tehát a
napszakkal együtt fordul.

**Színhangolás** — a zöld visszafogása 24%-kal. A kontraszt a fényből
jöjjön, ne a színerőből.

**Tónus** — hideg, mélyebb árnyékok és meleg csúcsfények. Ez töri meg a
digitális laposságot a leginkább.

**Ragyogás** — a tűz, a torkolattűz és a robbanás túlcsordul a környezetére.

**Vignetta és filmszemcse** — a kép széle finoman sötétedik, és alig
látható szemcse fut rajta.

A **Beállításokban kikapcsolható** („Fényhatások"). A mérés szerint a
rajzolási időt nem növeli mérhetően — a réteg egyetlen teljes képernyős
művelet, a korongok és a zajlap gyorsítótárazva vannak.

---

## v3.2 — Nagytakarítás · 2026-08-08

Átvilágítottam a teljes projektet halott kód, duplikáció és felesleges
sorok után.

**Amit kivettem:**

| mi | mennyi |
|---|---|
| Halott függvény (a hajórajz újraírása után maradtak) | **8 db, 99 sor** |
| A változásnapló (`PATCHES`) a játékból | **362 sor, 20 KB** |
| Használatlan konstans | 5 db |
| Árva állapotmező (`eventMark`) | 3 fájlból |
| Árva felületi elem és stílusa (`rulerDoct`) | HTML + CSS |

A napló innentől csak ebben a fájlban él — az „Újdonságok" képernyő
kikerült a menüből, ezért húsz kilobájtnyi holt súly utazott a játékban.

**Egy valódi hibát is talált a takarítás:** a fotómód a `#objBox` elemet
próbálta elrejteni, ami nem létezik — a küldetésdoboz neve `#objective`.
A fotómódban tehát bent maradt a képen. Javítva.

**A végállapot:**

- 507 függvény, **egyetlen halott sincs**
- **egyetlen duplikált függvény sincs**
- egyetlen használatlan konstans sincs
- egyetlen ismétlődő nyolcsoros blokk sincs
- nulla kikommentelt kódsor, nulla `console.log` a kiadott játékban

---

## v3.1.2 — Legénység és ágyú a kijelölésnél · 2026-08-08

**A hajó legénysége és ágyúszáma nem jelent meg.** A szöveget korábban
írtuk ki a felületre, mint ahol a végleges kiírás **felülírta** — a
munka elkészült, aztán elveszett.

Most a kijelölés-sáv mutatja:

```
SZLÚP        legénység 70/70   ·  10 ágyú
BRIGG        legénység 120/120 ·  14 ágyú
GÁLYA        legénység 340/340 ·  52 ágyú
sérült GÁLYA legénység 136/340 ·  56 ágyú
```

Több hajó együtt kijelölve összegződik, és ha utaznak a fedélzeten,
az is kiírja: *„8 fő a fedélzeten"*.

---

## v3.1.1 — Egy, kettő, három árboc · 2026-08-08

**A három hajó egyformán nézett ki.** Az árbocszámot a **korszak** döntötte
el, nem a hajóosztály — és mivel a kalózvilág egyetlen korban játszódik,
mindhárom hajó kétárbocos briggnek látszott.

Mostantól az árbocszám a hajóosztályt mutatja:

| hajó | árboc | ágyúsor |
|---|---|---|
| **SZLÚP** | 1 | egy sor, kevés ágyú |
| **BRIGG** | 2 | egy sor |
| **GÁLYA** | 3 | **kettős** ágyúsor |

Így egy pillantásra meg lehet mondani, milyen hajó közeledik.

---

## v3.1 — Három hajó, kikötő nélkül · 2026-08-08

**A hajókat a város állítja ki.** Kalózvilágban a főhadiszállás sólyája
elég hozzá — kikötő és kaszárnya nélkül is építhető flotta. A kalózok is
a parton ácsolták a hajóikat.

**Csak a három harci hajó maradt:**

| hajó | ágyú | sebzés | lőtáv | legénység |
|---|---|---|---|---|
| **SZLÚP** | 8–12 | 14 | 140 | 70 |
| **BRIGG** | 14–20 | 24 | 200 | 120 |
| **GÁLYA** | 40–60 | 38 | 200 | 340 |

Halászbárka és külön csapatszállító nincs többé. A **szlúp valódi harci
hajó** lett — gyors, sekély vízben is jár, ágyúkkal —, és emellett a
legénységet is átviszi a partra.

**A városi építési sorból kikerült a kikötő és a kaszárnya.** Ami maradt:
a négy termelő, a lakóház, a piac, a torony, a kórház, az akadémia és a
kovácsműhely.

---

## v3.0 — Városok ostroma · 2026-08-08

### Három külön hadjárat

Mind a három kalózfrakció a **saját történetét** játssza, hat-hat küldetéssel:

- **Nassau** — a kalózköztársaság felépítése és bukása: a Testvériség
  kódexe, a kegyelemlevél, az égő hajó, a leszavazott kapitány, a vasketrec
- **Fekete Szakáll** — a rettegés hadjárata: a Queen Anne bosszúja,
  Charleston blokádja, a zátonyra futott zsákmány, Ocracoke, Maynard hadnagy
- **Stede Bonnet** — az úri kalóz tragédiája: a barbadosi ültetvényes,
  a társ, aki elvette a hajót, kegyelem és köpönyeg, a Cape Fear folyó,
  a charlestoni akasztófa

Mind a tizennyolc küldetés ellenőrizve.

**Charles Vane, Jack Rackham és Anne Bonny** életrajza megírva — eddig
mindhárman egyetlen közös, rövid szöveget kaptak.

### A városokat el lehet foglalni

Minden városnak van **lakossága** (250–900, játszmánként más), **tornya**
(legfeljebb négy) és néha **fala**. A névtábla mutatja: *„748 lakos · 3 torony"*.

Az ostrom menete:

1. **A tornyokat kell szétlőni** — amíg áll egy is, a lakosság védett, és a
   partraszállókat visszaverik. Mérve: három gálya 17 másodperc alatt bontja
   le a négy tornyot.
2. **Utána fogy a lakosság** a sortűztől. A fal feleannyira lassítja, amíg
   le nem omlik.
3. **Kétszáz fő alatt lehet partra szállni** — a kirakott legénység
   elfoglalja a várost, és a környék épületei gazdát cserélnek.

A saját városodban épített **lakóház +60 lakost** ad, a **torony** pedig
védi a partot — legfeljebb négy.

---

## v2.10 — Tizennégy kikötő · 2026-08-08

**Négy helyett tizennégy város.** A 18—19. századi Karib-tenger sűrűn tele
volt kikötővárossal:

**Nassau ★ · Tortuga ★ · Port Royal ★** — a kalózfészkek
Havanna · Santiago · Trinidad · Matanzas — Kuba
Santo Domingo · Gonaïves — Hispaniola
Eleuthera · Exuma · Crooked Island — Bahamák
Cayman Brac · Campeche

**Minden város a parton áll.** A pontokat nem kézzel helyeztük el, hanem a
kész partvonalhoz igazítjuk: a program megkeresi a legközelebbi olyan
szárazföldi cellát, aminek a szomszédjában víz van. Mérve: 14/14 a parton.

Az igazítás **kétszer** fut le — a bázisok körüli terepegyengetés eltolja a
partvonalat, ezért utána újra kell igazítani. Enélkül Nassau és Port Royal
a sziget belsejébe került.

**Kalózmódban kétszer gyorsabb az építkezés és a kiképzés**: egy majorság
6,2 másodperc alatt áll fel a 12,4 helyett.

### Javítás

- **A frissen kiállított hajó a szárazföldön jelent meg**, ha a kikötő
  rakodóhelye nem vízre esett. Most 900 pixerig keres vizet a hajónak.

---

## v2.9 — Termelés a sávban · 2026-08-08

**Favágótelep** — a harmadik termelő a kalózvárosokba: **+0,8 fa**.
Fűrészállvány, rönkhalom, deszkarakás és fűrészpor a földön.

Így a város négy nyersanyagot termelhet:

| épület | termel |
|---|---|
| Uradalmi major | +1,1 élelem |
| Aranybánya | +0,8 arany |
| Cukornád-ültetvény | +0,8 rum |
| Favágótelep | +0,8 fa |

**A nyersanyagsávban a szám alatt megjelenik a termelés.** Eddig csak az
élelemnél látszott; most a fa, a rum és az arany alatt is ott áll, mennyit
adnak az épületek másodpercenként. Mérve, ahogy sorra épülnek:

```
induláskor        fa +0.00 | rum +0.00 | arany +0.00 | élelem +1.16
+ aranybánya      fa +0.00 | rum +0.00 | arany +0.44 | élelem +1.16
+ cukornád        fa +0.00 | rum +0.44 | arany +0.44 | élelem +1.16
+ favágótelep     fa +0.44 | rum +0.44 | arany +0.44 | élelem +1.16
```

**Kalózmódban közelről indul a kamera** (1,0 a korábbi 0,55 helyett).

---

## v2.8.1 — A karikák és a süllyedés · 2026-08-08

**Az ÉPÍTÉS és TOBORZÁS karika nem reagált.** A felület rétege
(`#hud`) átengedi a kattintást — `pointer-events:none` —, és csak a
`.panel` osztályú dobozok fogják el. A karikák nem panelek, ezért az ujj
„átment" rajtuk a térképre. Most külön visszakapcsolják maguknak.

Ez magyarázza, miért látszott minden rendben: a menü megnyílt, a gombok
kirajzolódtak, csak éppen nem lehetett rájuk kattintani.

**Elsüllyedő hajó.** Eddig emberi holttest maradt a vízen, mert az elesettek
rendszere minden egységre ugyanazt csinálta. Most a hajó **megdől, lassan
elmerül**, a törött árboc még kilóg egy darabig, körülötte olajfolt terül
szét és úszó törmelék marad. Hat és fél másodperc alatt zárul össze a víz
fölötte.

Mérve: elsüllyesztés után 0 emberi holttest, 1 hajóroncs — a katonáknál
viszont továbbra is marad a holttest.

---

## v2.8 — A város termel · 2026-08-08

**Két új termelő épület a kalózvárosokba:**

| épület | termel | kinézet |
|---|---|---|
| **Aranybánya** | +0,8 arany | tárnabejárat ácsolattal, csille aranyérccel, meddőhányó |
| **Cukornád-ültetvény** | +0,8 rum | nádtáblák sorai, présház, hordók |

A városmenüben minden épület mellett ott áll, **mit ad**, mielőtt megépíted:

```
Uradalmi major       → +1.1 Élelem
Aranybánya           → +0.8 Arany
Cukornád-ültetvény   → +0.8 Rum
Kőház                → +5 keret
```

Mérve: két új épülettel a város termelése élelem +1,16 · arany +0,44 ·
rum +0,44, és tíz másodperc alatt tényleg gyűlik mindkettő.

**A kalózvilágban az ellenfél is a 18—19. században marad.** Eddig csak a
játékos kora volt rögzítve; a bot fejlődhetett volna, és a 20. századi
rombolói ellen egy fregatt semmit sem érne.

### Javítás

- A **szén sora kalózmódban is megjelent** a nyersanyagsávban. Most a
  megjelenítés is figyeli a kalózmódot, nem csak a korszakot.

---

## v2.7.2 — A menü újra él · 2026-08-08

**A menü halott volt.** Az előző körben kivettem a *Betöltés fájlból*
gombot a HTML-ből, de a bekötése a kódban maradt:

```
$('mImport').onclick = ...
```

A hiányzó elemre ez hibára futott, és mivel a menüfelépítés egyetlen
függvényben fut, **utána egyetlen gomb sem kapott eseménykezelőt**. A menü
látszott, a gombok viszont nem csináltak semmit — se új játék, se hadjárat.

**A javítás nem csak erre az egy sorra szól.** A `$()` elemkereső mostantól
**ártalmatlan bábut** ad vissza, ha az elem nincs meg. Így egyetlen törölt
gomb sem állíthatja meg többé a felület felépítését — a menüben tizenhárom
ilyen védtelen bekötés volt.

**A stratégiai nézetben csak a hajók látszanak.** A várost nem a matrózok
építik, hanem maga a város: nem kell látni, mi épül és ki építi. Kimaradnak
az épületek, a katonák, a fák és a díszek is.

**A névtábla két sora**: a város neve, alatta az épületek száma — semmi több.

---

## v2.7.1 — Átlátszó zászlók · 2026-08-08

- **A spanyol zászlók fehér háttere a nemzetválasztóban is eltűnt.**
  Előzőleg csak a képek szélét vágtam le, de a lobogó körüli fehér a kereten
  belül maradt. Most a hátteret **átlátszóvá** tesszük: a kép széleiről
  indított kitöltéssel csak azt a fehéret töröljük, ami kívülről elérhető.
- Ez azért fontos, mert a **Bourbon-zászló maga is fehér** — egy egyszerű
  „minden fehér legyen átlátszó" szabály kitörölte volna a lobogót is.

---

## v2.7 — Hat igazítás · 2026-08-08

- **Kalózmódban nincs alsó építési sáv.** Az építés a városmenüből megy:
  az ÉPÍTÉS karikára koppintva a karikák helyére az épületek neve kerül.
- **Közelebbről indul a kamera**: 0,55 a korábbi 0,20 helyett — a bázis
  szigetét látod, nem az egész tengert.
- **A Betöltés fájlból gomb kikerült** a főmenüből. (A mentés betöltése a
  szünet menüből továbbra is megy.)
- **A spanyol zászlók fehér háttere levágva.** A képek fehér lapon álltak;
  most megkeressük a lobogó tényleges határait, és arra vágunk.
- **A partra tett legénység látszik.** A stratégiai nézet eddig csak a
  hajókat mutatta, ezért a partraszállás után semmi nem történt a képernyőn
  — pedig a katonák ott álltak. Mérve: 12/12 szárazon. Az épületek, fák és
  jobbágyok továbbra is kimaradnak.
- **Kalózmódban nincs szén** a nyersanyagsávban: a vitorlás korban nincs
  mit fűteni vele.

---

## v2.6.3 — Ujjal is eltalálható · 2026-08-08

**A koppintás célpontja túl kicsi volt.** A városra kattintást
világkoordinátában mértem, 30 pixeles sugárral — ami erős kicsinyítésnél
mindössze 6 képernyő-pixel. Ujjal arra nem lehet célozni.

Most **képernyőben** mérünk, és érintésnél nagyobb sávval:

| nagyítás | egérrel | ujjal |
|---|---|---|
| 1,0 | 40 px | **80 px** |
| 0,5 | 45 px | **85 px** |
| 0,2 | 48 px | **88 px** |

A névtábla is beleszámít, mert az a jelölő alatt van.

**A parancssáv építési sora kalózmódban is megmarad.** Eddig elrejtettem,
mert a városmenü kiváltja — de ha a menü valamiért nem nyílik meg, akkor
semmilyen módon nem lehetett építeni. Egyetlen úton futó felület törékeny.

**A szorosok tovább szélesedtek.** Új menet töri át azokat az egycellás
gátakat, amelyeknek két szemközti oldalán is víz van — egy hajó sosem
férne át rajtuk.

| | eredetileg | v2.6.1 | most |
|---|---|---|---|
| 128 pixelnél keskenyebb sáv | 44% | 30% | **12%** |
| medián sávszélesség | 416 px | 1472 px | **2464 px** |

---

## v2.6.2 — A nyelvválasztó a sarokban · 2026-08-08

- A nyelvválasztó telefonon **a menü közepére csúszott**, és a legördülő
  lista rácsúszott a címre meg a gombokra. Az ok: a menü görgethető és
  középre rendezett, ezért az abszolút pozíció a tartalomhoz igazodott.
- Mostantól **rögzített helyen** áll a jobb felső sarokban, mindenek fölött
  (z-index 40).
- **A menüvel együtt jelenik meg és tűnik el** — mivel rögzített, magától
  ott lógna játék közben is. Mind a hat helyen bekötve, ahol a menü nyílik
  vagy zárul.
- Telefonon csak a zászló látszik, a nyelv neve elrejtőzik, és a cím
  lejjebb csúszik, hogy ne kerüljön alá.

---

## v2.6.1 — Hajózás és érintés · 2026-08-08

**Telefonon nem lehetett építkezni.** A városmenü csak egérrel nyílt —
koppintásra nem volt bekötve. Mivel kalózmódban a parancssáv építési sora
rejtve van, így semmilyen módon nem lehetett építeni.

**A hajók nem tudtak közlekedni.** Négy hiba egymásra rakódva:

1. **Nem volt tengeri útkeresésük**: egyenes vonalban mentek, és bármelyik
   sziget megállította őket. Most a szárazföldi rendszer mintájára áramlási
   mező vezeti őket, csak fordítva: itt a szárazföld az akadály.
2. **Az útkereső rács mérete a betöltéskor rögzült** (107×75). A háromszoros
   pályán így a bal felső sarkot fedte le, a többi hajó a „világ végének"
   ment neki.
3. **A cél a sziget belsejébe zárt vízfoltra esett**: a városnál a legközelebbi
   vizet kerestem, ami egy egycellás tócsa lett. Az áramlási mező onnan
   egyetlen cellát ért el az 59 135-ből. Most nyílt vizet keres.
4. **Az irányt rossz előjellel követtem**: a mező a cél felől terjed, ezért
   ki kell vonni. Elsőre hozzáadtam — a hajók pontosan a céltól elfelé
   indultak, és harminc másodperc alatt húsz pixert tettek meg.

Mérve: mindhárom hajó **átér a térkép túlsó felére** (4400 px), a céltól
120 pixerre állnak meg.

**A karib szorosok kiszélesedtek.** A szaggatott partvonal egycellás
nyúlványokat hagyott, amiken egy hajó nem fért át — a vízsávok 44%-a volt
128 pixelnél keskenyebb. Most 30%, a medián 416 pixelről **1472-re** nőtt.

---

## v2.6 — Rum a kő helyett · 2026-08-08

Kalózvilágban a **kő helyén rum** áll. A szigeteken nem kőbányákból élnek,
hanem a cukornádból — és a legénységet rummal fizetik.

- Más név és **borostyánszínű** jelölő a nyersanyagsávban
- Mindenhol átvált: építési árak, piac, küldetéscélok, a munkás terhe,
  a bontás visszatérítése
- Mind a négy nyelven: **Rum · Rum · Rum · 朗姆酒**
- A játékmenet változatlan — csak a neve és a színe más

| | normál | kalóz |
|---|---|---|
| Őrtorony | 60 Fa · 130 Kő | 75 Fa · 160 **Rum** |
| Piactér | 180 Fa · 70 Kő · 40 Arany | 220 Fa · 85 **Rum** · 50 Arany |

---

## v2.5 — Legördülő nyelvválasztó · 2026-08-08

- A nyelvválasztó a menü **jobb felső sarkában**: a gomb a mostani nyelv
  zászlaját és nevét mutatja, rákattintva **legördül** a négy nyelv.
  Máshova kattintva bezárul.
- **Mind a 35 teljesítmény** neve és leírása lefordítva angolra, németre
  és kínaira. Ellenőrizve: egyetlen hiányzó bejegyzés sincs.

### A fordítás állása

A játékban megjelenő magyar szöveg **56 kilobájt**, ebből eddig elkészült:

| blokk | méret | állapot |
|---|---|---|
| felület, gombok, üzenetek | — | ✔ kész |
| egység-, épület- és nemzetnevek | — | ✔ kész |
| teljesítmények (35) | 3 KB | ✔ kész |
| küldetések neve és eligazítása (54) | 14 KB | hátravan |
| ideológiák (96) | 14 KB | hátravan |
| uralkodói életrajzok (12 nemzet) | 25 KB | hátravan |

---

## v2.4 — A kalózok aranykora · 2026-08-08

**A kalózvilágban nincs korszakváltás.** A játék végig ugyanabban a korban
játszódik:

- A korszakdoboz felirata: **18—19. század · A kalózok aranykora**
- A korszakváltó doboz eltűnik, a gomb nem működik
- A játszma a **puskapor és a vitorlás korában** indul — muskéta, fregatt,
  bástya —, mert az illik a 18. századhoz, nem a középkori képek

Mérve mind a hat kalózküldetésen: mindegyik ebben a korban indul, és a
korszakváltás nem enged tovább. A normál játékban változatlanul működik.

### Javítás

- **Az induló flotta nem került vízre** a háromszoros pályán: a partot
  340 pixelnél feladtuk keresni, pedig a szigetek is háromszorosra nőttek.
  Most 1200 pixerig keres.

---

## v2.3.1 — A zászlók a helyükre · 2026-08-08

- **A nyelvválasztó zászlók soha nem jelentek meg.** A felépítésük
  tévedésből a `setMode()` függvénybe került — abba, amelyik a játékmód
  választásakor fut, nem a menü betöltésekor. A sor így üresen maradt.
  Most az `initMenu()` építi fel, ahol a helye van.
- A zászlósor a menü **jobb felső sarkába** került.

---

## v2.3 — Legénység és sortűz · 2026-08-08

**A hajóknak legénysége és ágyúja van**

| hajó | legénység | ágyú |
|---|---|---|
| SZLÚP | 70 fő | 8–12 |
| BRIGG | 120 fő | 14–20 |
| GÁLYA | 340 fő | 40–60 |

Az ágyúszám hajónként sorsolódik a megadott sávból.

**Az átszállás legénységi harc**

Egy hajót nem a teste ad meg, hanem az emberei. Az összekapaszkodás után a
két legénység egymásnak esik: mindkét oldal annyit veszít másodpercenként,
amennyien a másikon vannak — a nagyobb létszám gyorsan felőrli a kisebbet.

Ezért **előbb sortűzzel kell ritkítani a fedélzetet**: minden találat embert
is öl. Mérve:

| a gálya sérülése | legénysége | SZLÚP (70) | BRIGG (120) |
|---|---|---|---|
| 50% | ~204 | nem bír vele | nem bír vele |
| 75% | ~136 | nem bír vele | nem bír vele |
| 90% | ~95 | nem bír vele | **elviszi** |

A zsákmányra a támadó legénységének **fele** száll át, tehát az elfoglalt
hajó gyengén megszállt marad — vissza lehet venni.

**Sortűz**

A célpont felőli oldalon egyszerre villannak az ágyúk: torkolattűz, sűrű
lőporfüst, és a képernyő is megrázkódik. A dörej középről gördül kifelé.
A gálya sortüze **24 torkolattűz**, a szlúpé **6** — látszik, mekkora
hajóval van dolgod.

### Javítás

- **Az elfogyott legénység minden ütemben újratöltődött**, mert a nullát is
  „hiányzó értéknek" néztem. Emiatt egy 70 fős szlúp elvitt egy 340 fős
  gályát. A teszt mutatta ki.

---

## v2.2.4 — Spanyol zászlók · 2026-08-08

Spanyolország mind a négy korszaka **korhű zászlót** kapott, az adott
korszak uralkodójához illesztve:

| korszak | uralkodó | zászló |
|---|---|---|
| 15. sz. | Aragóniai Ferdinánd | a **Katolikus Királyok** lobogója (Szent János sasa) |
| 17. sz. | II. Fülöp | **Kasztília és León** negyedelt királyi zászlaja |
| 19. sz. | III. Károly | a **Bourbon-ház** fehér királyi zászlaja |
| 20. sz. | Francisco Franco | **vörös-sárga-vörös**, koronás címerrel |

A küldött ötödik zászló — a Második Köztársaság vörös-sárga-lila trikolórja —
kimaradt, mert a 20. századi korszak uralkodója Franco, aki éppen a
köztársaság ellen harcolt. Ha a köztársaságot szeretnéd inkább, cserélhető.

---

## v2.2.3 — Hornigold arcképe · 2026-08-08

- **Benjamin Hornigold** (Nassau) arcképe lecserélve: a hajó helyett festett
  portré áll a helyén, mind a négy korszakban.

---

## v2.2.2 — Egyszerűbb menü · 2026-08-08

- Az **Újdonságok** menüpont kikerült a főmenüből. A változásnapló ebben
  a fájlban marad, a változatszám pedig továbbra is látszik a menü sarkában
  és a szünet menüben.

---

## v2.2.1 — Zászlók a főmenüben · 2026-08-08

- A nyelvválasztó zászlók a **főmenübe** kerültek, közvetlenül az
  **Új játék** gomb fölé — nem a képernyő sarkában vannak többé.
- Nagyobbak lettek (44×30), középre rendezve, a választott aranykerettel.

---

## v2.2 — Háromszoros Karib-tenger · 2026-08-08

**A kalózpálya háromszor akkora** minden irányban: **10 200 × 7 200** a
korábbi 3 400 × 2 400 helyett — kilencszer nagyobb terület. A ködrács
8 025 celláról **71 775-re** nőtt. A többi mód mérete változatlan, hogy
a menetidők ne boruljanak fel.

**Városikon** a karika helyett: két házfedél, torony és lobogó. A színe
mutatja, kié a város — kék a tiéd, vörös az ellenségé, arany a semleges.

**Nagyítás**: 0,09-ig lehet kicsinyíteni (a normál módban 0,45 a határ),
és a kezdőnézet is tágabb.

### A teljesítmény

A nagy pálya kizoomolva **2,2 másodperces képkockákat** adott: cellánként
festettük a füvet, a vizet, a habot és a partot, ami tízezres nagyságrendű
műveletet jelentett képkockánként.

Megoldás: a pálya egyszer, játszma elején elkészül **egy képként** a
ködrács felbontásában (319×225 képpont), és onnantól csak azt nagyítjuk ki
— és abból is **csak a látható részt**.

| nagyítás | előtte | utána |
|---|---|---|
| 0,20 | 454 ms | **93 ms** |
| 0,12 | 1 268 ms | **106 ms** |
| 0,09 | 2 247 ms | **78 ms** |

---

## v2.1.1 — A városmenü javítása · 2026-08-08

- **Az ÉPÍTÉS és TOBORZÁS karika nem működött.** A menü **minden
  képkockán újraépült**, ezért az egérgomb lenyomása és felengedése között
  megsemmisült a gomb, amire kattintottál — a kattintás sosem jutott célba.
  Mostantól csak akkor épül újra, ha változik a város, a cselekvés,
  a korszak vagy a nyelv; a helyét külön követi, hogy a kamerával mozogjon.
- **Kalózvilágban a gyorssávból csak a menügomb marad.** A bázisra ugrás,
  a sereg- és a munkáskijelölés meg a parancstörlés ott értelmetlen, mert
  a szárazföldi egységek nem is látszanak.

---

## v2.1 — Zászlók a sarokban · 2026-08-08

- A nyelvválasztó a menü **bal felső sarkába** került, **négy zászlóval**:
  magyar, brit, német, kínai. A beállításokból kikerült.
- A zászlókat a **stíluslap rajzolja**, nem képfájl — minden felbontáson
  élesek, és nem növelik a fájl méretét.
- **Bővebb szótár** (69 kulcs, mind a négy nyelven teljes): a parancssáv
  címei, a városmenü, a kolóniaszöveg és a gyakori üzenetek is fordítva.
- A **városmenü teljesen fordítva**: a három karika, az épületnevek és a
  város állapota is.

| | magyar | angol | német | kínai |
|---|---|---|---|---|
| városmenü | ÉPÍTÉS · TOBORZÁS · BEZÁRÁS | BUILD · TRAIN · CLOSE | BAU · AUSBILDEN · SCHLIESSEN | 建造 · 招募 · 关闭 |
| épületek | Majorság, Faház, Piactér | Farm, Timber house, Market | Bauernhof, Holzhaus, Marktplatz | 农场, 木屋, 集市 |

---

## v2.0.1 — A városok visszatérése · 2026-08-08

- **A városjelölők eltűntek.** A világ koordinátarendszerében rajzoltam
  őket, ami nagyításkor máshova vitte a képet. Most a **képernyő**
  koordinátáiban készülnek, mint az éjszakai fényréteg — a névtábla így
  minden nagyításon a város fölött marad, olvasható méretben.
- A jelölő **takarékos és mozgáscsökkentett módban is látszik**: nem dísz,
  hanem a kalózvilág kezelőfelülete.
- **Kalózvilágban eltűnik a parancssáv építési és kiképzési sora** — a
  városmenü váltja ki, ott építesz és toborzol.

---

## v2.0 — Négy nyelv · 2026-08-08

**Nyelvválasztás** a beállításokban: **Magyar · English · Deutsch · 中文**

Lefordítva:

- a főmenü, a beállítások, a szünet menü, a nyersanyagsáv és a parancssáv
- **minden egység, épület és nemzet neve**, korszakonként külön —
  a lovagból Knight, Ritter, 骑士 lesz; a majorságból Farm, Bauernhof, 农场
- a választott nyelv megmarad a következő indításig

### Ami még magyarul marad

A küldetések eligazításai, az uralkodók életrajzai és az ideológiák
leírásai — együtt **164 kilobájtnyi folyó szöveg**. Ezek patchenként
fordulnak át, blokkonként.

A játék ettől használható marad idegen nyelven is: amit játék közben
olvasol — gombok, nevek, üzenetek — le van fordítva.

---

## v1.9.3 — A tenger és a flotta · 2026-08-08

- **Induló flotta**: kalózmódban mindkét fél kap egy hadihajót, egy szlúpot
  és egy halászbárkát. A stratégiai nézetben a szárazföldi egységek nem
  látszanak, ezért enélkül üres volt a tenger.
- **A kezdőnézet kizoomol**: az egész Karib-tenger egyszerre látszik.
- Kalózmódban **sokkal messzebbre lehet kizoomolni** — 0,16-ig a korábbi
  0,45 helyett.
- A városjelölők a nagyítástól függetlenül **olvashatók maradnak**.

### Javítás

- **A városnevek rossz helyre kerültek.** Képernyő-koordinátát számoltam ott,
  ahol a rajzolás már a világ koordinátarendszerében dolgozik — a négy
  névtábla a bal felső sarokba zsúfolódott a szigetek helyett.

---

## v1.9.2 — Kalózflotta · 2026-08-08

A kalózvárosban **csak hajót lehet toborozni** — gyalogost nem. Három
osztály, a küldött modellek szerint:

| hajó | mit tud | életerő | sebzés | lőtáv | sebesség |
|---|---|---|---|---|---|
| **SZLÚP** | gyors, legénységet visz | 150 | — | — | 54 |
| **BRIGG** | harci hajó | 190 | 16 | 150 | 58 |
| **GÁLYA** | nehéz, sok ágyú | **340** | **26** | **170** | **46** |

A **Gálya** új hajó: háromárbocos, **kettős ágyúsorral**, a legerősebb és
a leglassabb. A kikötőben is kiállítható, nem csak a városmenüben.

---

## v1.9.1 — Stratégiai nézet a kalózvilágban · 2026-08-08

A kalózvilág többé nem a szigetek mikrovilága, hanem **térkép**:

- **Nem látszanak** az épületek, emberek, fák, díszek, jószág és ösvények
- **Látszanak** a szigetek, a tenger, a köd, a városnevek és a **hajók** —
  a játék róluk szól
- A névtábla mutatja, **hány épület áll a városban és mennyit termel**

**A városmenü**

A névre kattintva három karika nyílik sugárirányban:

| karika | mit csinál |
|---|---|
| **ÉPÍTÉS** | a helyükre az építhető épületek neve kerül, mellette mit adnak |
| **TOBORZÁS** | az egységek neve |
| **BEZÁRÁS** | visszazár |

A választott épület **azonnal elindul a városban** — a legénység húzza fel,
és attól kezdve termel. Mérve: Nassau 4 épületről 5-re, +0,94 élelemről
+1,40-re egyetlen majorsággal.

---

## v1.9 — Kikötőmenü a kalózvilágban · 2026-08-08

**Városok a Karib-tengeren**

- A térképen megjelennek a városok: **Nassau, Havanna, Port Royal, Tortuga**
- A jelölő színe mutatja, kié: **kék** a tiéd, **vörös** az ellenségé, **arany** a semleges
- A névre kattintva **sugárirányban kinyílnak** a cselekvések:
  Építés · Toborzás · Flotta · Kereskedelem
- Egy karikára kattintva a többi eltűnik, és a helyükre a konkrét
  lehetőségek kerülnek — épületek a termelésükkel, egységek, hajók, árfolyam
- A ← karika visszavisz, az Esc bezár

A menü **nem külön játékmód**: gyorsítás. Ugyanazokat a parancsokat adja ki,
mint a parancssáv, és csak a kalózvilágban jelenik meg.

### Javítás

- **Az uralkodó neve, címe és korszaka soha nem jelent meg** az arckép mellett.
  A mezőket egyetlen kódsor sem töltötte fel — a kezdő gondolatjelek maradtak
  a helyükön minden játszmában, minden nemzetnél.

---

## v1.8.4 — A fekete képernyő javítása · 2026-08-08

**A hiba.** Az ellátás rendszere (`supplyTick`) a **menüben is futott**, ahol
még nincs ellenfél — `G.ai` ilyenkor `null`, én pedig ellenőrzés nélkül
olvastam belőle a készletet.

**A következménye.** Egy elkapatlan hiba a játékhurokban **nem ütemezi újra
a következő képkockát**. A hurok némán megállt már a menüben, így a játék
indítása után a világ soha nem rajzolódott ki — miközben a felület, a hang
és a menük hibátlanul működtek. Ezért látszott minden rendben, csak a kép
maradt fekete.

**A javítás.**

- Minden mellékrendszer — ellátás, piac, időjárás, élővilág, jószág,
  ösvények, kereskedelem, események, hős aurája — **csak futó játékban** dolgozik
- Mindegyik **külön-külön védve**: ha egy elromlik, csak az kapcsol ki,
  megnevezi magát egy üzenetben, és a játék megy tovább
- Ugyanez a védőháló a rajzrétegekre is (v1.8.3)

---

## v1.8.3 — Védőháló a rajzoláshoz · 2026-08-08

A látványrétegek — ösvények, hullámverés, időjárás, éjszaka, élővilág,
jószág, madarak — mind díszek. Ha bármelyik hibára fut, **csak az a réteg
kapcsol ki**, a világ látszik tovább.

- A hiba **egyszer** jelenik meg üzenetben és a naplóban, nem képkockánként
- A teljes rajzolás is védve: ha elhasal, **kiírja az okot** ahelyett, hogy
  néma fekete képernyőt adna
- Enélkül egyetlen elgépelés az egész képet elviheti, miközben a játék
  a háttérben rendben fut

---

## v1.8.2 — Javítások · 2026-08-08

- **A birkák és civilek soha nem jelentek meg.** A díszlet a bázis felépítése
  ELŐTT készült el, amikor még nem volt egyetlen majorság vagy ház sem.
  Mérve: 0 birka → 7 birka, 2 civil.
- **A díszlet többé nem akadályozhatja meg a bázis létrejöttét.** A világ
  előkészítése a bázis után fut, és hiba esetén elnyeljük — egy látványelem
  hibája nem hagyhat üres pályát.
- **Sérült vagy régi mentés nem tölthető be.** Ha a mentésben nincs
  játékos-épület, a játék hozzá sem nyúl a futó állapothoz.
- **A zenesáv a játék indulásakor mindig újraértékelődik** — kalózmódban a
  kalózzene szól, akkor is, ha a menüből érkezel.
- **A változatszám a szünet menüben is látszik**, hogy egy képernyőképről
  azonosítható legyen, melyik build fut.

---

## v1.8.1 — Gyorsítás és próbaváltozat · 2026-08-08

**Az éjszaka gyorsítása**

- A fényréteg **fél felbontáson** készül, és úgy nagyítódik vissza — a fény
  lágy, a különbség nem látszik, a keverés költsége viszont a negyedére esik
- A fénykorong **egyszer készül el**, és onnantól csak nagyítva másolódik;
  korábban minden fényforráshoz új színátmenet készült képkockánként
- **Takarékos módban** nincs fényréteg, csak egyszerű sötétítés

Mérve 60 egységgel: alap 68 ms, mindennel 99 ms, **takarékos módban 43 ms**.

**Próbaváltozat**

- Új fájl: **`index-konnyu.html`** (3,3 MB) — ugyanaz a játék zene nélkül.
  A teljes `index.html` 13 MB, aminek 9,8 a zene; beágyazott előnézetben ez
  nem tölt be, és fekete képernyőt ad.
- A build mindkettőt előállítja.

---

## v1.8 — Apró részletek · 2026-08-08

**Sérült épületek**

Az életerő arányában jelenik meg a kár: 85% alatt repedések, 65% alatt kormos
foltok, 50% alatt hiányzó tetőcserép, 40% alatt füst is száll belőle.
Minden épületnek ugyanaz a kárrajza marad — az elrendezést az azonosítójából
sorsoljuk, nem képkockánként.

**Kellékek az épületek körül**

| épület | mi áll mellette |
|---|---|
| majorság | kerítés és szénakazal |
| kaszárnya, kovácsműhely | farakás |
| lakóház, főhadiszállás | kút gémeskút-tetővel |
| kikötő | hordók a mólón |
| piac | ládák és zsákok |

**Jószág és civilek**

- **Birkák** legelnek a majorságok körül (legfeljebb 14)
- **Civilek** járkálnak a lakóházak között (legfeljebb 10)
- Egyik sem játékelem, nem lehet őket megölni

**Lengő zászlók** — a lobogók mostantól ugyanazt a szélmezőt követik, mint a
fű és a bokrok. Egy széllökés az egész tájon végigfut.

**Tétlen mozdulatok** — az álló katona lassan átveszi a súlyát, alig
észrevehető dőléssel és emelkedéssel. Nem sprite-csere, csak élő
transzformáció, ezért nem terheli a gyorsítótárat.

---

## v1.7 — Időjárás · 2026-08-08

Két-három percenként fordul az idő, és lassan úszik át — nem kapcsol egyik
pillanatról a másikra.

**Eső**

- Ferde csíkok, becsapódó cseppek a földön, tompább és hűvösebb színek
- A látótávod **12%-kal csökken** — mérve: 100% → 88%
- **Tócsák** gyűlnek a földön (legfeljebb 26), és az eső után felszáradnak

**Hó**

- Lassan hulló, oldalra sodródó pelyhek, fehéredő táj
- A menet **10%-kal lassabb** — mérve: 68 → 62 sebesség
- Havazni csak a **20. században**, hegyvidéken vagy pusztán tud

Az időjárás a napszak mellett olvasható a korszakdoboznál, és a
beállításokban kikapcsolható.

---

## v1.6 — Föld és víz · 2026-08-08

**Kitaposott ösvények**

- Ahol sokat járnak az egységek, **lekopik a fű**, és barnás ösvény alakul ki
- Mérve: 10 másodperc taposás után teljesen kitaposott, 100 másodperc alatt visszanő
- Nem játékelem: nem gyorsít, csak látszik — de attól él a táj, hogy meglátszik rajta a használat

**Porfelhő**

- A mozgó egység port ver fel száraz talajon; vízen nem
- A harckocsi másfélszer annyit, és sűrűbben — a gépesített sereg messziről látszik
- Mérve: 2 másodperc menet alatt 8 porpamacs

**Vízmélység**

- A parttól mért távolság szerint színeződik: **türkiz szegély → mély kék**
- Mérve egy tavas térképen: 439 partcella, 631 sekély, 7 mély

**Hullámverés**

- A legkülső vízcellákon fehér habszegély jár **előre-hátra**

---

## v1.5 — Fény, levegő, élet · 2026-08-08

**Mozgó árnyékok**

Az épületek vetett árnyéka a nap állását követi. Mérve:

| napszak | vízszintes irány | hossz |
|---|---|---|
| hajnal | −0,87 (nyugatra) | ×1,67 |
| délelőtt | −0,20 | ×1,06 |
| dél | +0,20 | ×1,06 |
| alkony | +1,04 (keletre) | ×1,86 |

**Színhangolás** — hajnalban hideg kék, délelőtt arany, délben semleges,
alkonyatkor borostyán. Egy áttetsző réteg az egész képre.

**Élővilág**

- **Madárcsapatok** húznak át az égen, árnyékkal a földön
- **Őzek** legelnek az erdőszélen, és szétugranak, ha katona közelít 130 pixerre
- **Sirályok** köröznek a kikötők fölött
- **Halak** ugranak ki a vízből, terjedő gyűrűt vetve

Egyik sem játékelem: nem lehet őket megölni, nem takarnak, nem lassítanak.
Mozgáscsökkentett és takarékos módban kimaradnak.

### Javítások

- Az árnyék eddig **bele volt sütve az épület képébe**, ami a gyorsítótárban ül —
  így nem tudott volna mozogni. Most minden képkockán élőben rajzolódik.
- Az élővilág a fák létrehozása előtt épült fel, ezért nem jelentek meg őzek.

---

## v1.4 — Kémek, oktatómód, fotómód · 2026-08-08

**Kém** — új egység, a piacon toborozható

- Fegyvertelen és törékeny, de gyors, és **álruhát ölthet** (Á billentyű)
- Álruhában az ellenség színeit viseli, és **nem lövik rá**
- Leleplezik, ha 60 pixeren belülre megy egy ellenséges egységhez,
  vagy 100-on belülre egy őrtoronyhoz
- **Gyújtogatás**: álruhás kémmel ellenséges épületre kattintva tüzet raksz.
  Az épület 12 másodpercig ég, közben nem javítható — de az álca leesik.

**Oktatómód** — nyolc lépéses vezetett első játszma

- A menüből indul, könnyű fokozaton, magyar nemzettel
- Kijelöléstől a korszakváltásig vezet végig, és megvárja, amíg tényleg megcsinálod
- Bármikor kihagyható

**Fotómód** — F billentyű

- A teljes felület eltűnik, a kép **PNG-ként menthető**
- Esc vagy újabb F: kilépés

### Javítások

- **A modulsorrend hibája**: a `29-menu.js` zárja a kódot burkoló függvényt,
  ezért az utána sorolt modulok kívülre kerültek, és nem látták a játékállapotot.
  A sorrend mostantól ezt a modult tartja utolsónak.
- Az oktatómód majorságlépése magától teljesült, mert a bázison induláskor
  már két majorság áll — most a harmadikat várja.

---

## v1.3 — Alakzatok és ostrom · 2026-08-08

**Alakzatok** — három gomb, `7`–`8`–`9` billentyűvel is

| alakzat | felállás | hatás |
|---|---|---|
| **Vonal** | 152 széles, 51 mély | a lövészek +10% lőtáv |
| **Ék** | 52 × 49, elöl a közelharcosok | +12% sebesség és sebzés |
| **Négyszög** | 48 × 59, tömör kocka | +2 páncél, −15% sebesség |

Mindhárom pontosan a koppintás köré rendeződik.

**Faltörő kos** — Faltörő kos, Ostromkos, Robbantóosztag

- **Ötszörös** sebzés épület ellen: egy ütés a falon 146, az ostromgépé 74, a lovagé 7
- Katona ellen **semmit sem ér** (2 sebzés a lovag 9-e mellett)
- Lassú és nagy életerejű: azért éli túl a falhoz vezető utat

**Ostromtorony** — Ostromtorony, Rohamhíd, Rohamjármű

- **Hat katonát** visz a falig, és a túloldalon rakja ki őket
- Ugyanúgy működik, mint a csapatszállító hajó: jobb klikk rá a beszálláshoz,
  majd jobb klikk a célpontra a kirakodáshoz
- Nem üt: a dolga az átjuttatás

---

## v1.2 — Ellátás és kereskedelem · 2026-08-08

**Ellátás** — a sereg eszik

- Minden egység másodpercenként fogyaszt a készletből: a munkás keveset (0,010),
  a katona többet (0,032–0,036), az ostromgép és a hős a legtöbbet (0,055 és 0,090)
- Az élelem mellett megjelenik az **egyenleg**: mennyi terem, mennyit eszik a sereg
- Mínuszban a szám vörösre vált, a nyersanyagsáv pedig lüktetni kezd
- Ha kifogy az élelem, a katonák **lassan gyengülnek** — de soha nem halnak éhen,
  csak harcképtelenné válnak
- **A munkás nem éhezik**: a gazdaságod akkor is talpon marad, és újra tudsz építkezni
- Az ellenfélre ugyanez vonatkozik: a földje felégetése immár fegyver

**Kereskedelmi útvonal** — sebezhető jövedelem

- Ha áll a kikötőd, 75 másodpercenként **kereskedőhajó indul** egy semleges kikötőbe
- Korszaktól függően 110–260 aranyat hoz vissza
- Egyszerre egy hajó van úton
- Az ellenség **elsüllyesztheti** — ilyenkor a rakomány odavész

---

## v1.1 — Piac és éjszaka · 2026-08-08

**Piac** — új épület: Piactér, Vásárcsarnok, Árutőzsde, Kereskedőház

- Nyersanyagcsere aranyra és vissza, százas tételekben
- Az árfolyam mozog: eladásra esik, vételre nő, majd lassan visszatér az alapszinthez
- A piac haszna a rés: 100 egység **55 aranyat hoz**, de **95-be kerül**
- Az ár 45% és 220% között mozoghat — nem lehet a padlóra vinni

**Nappal és éjszaka** — hat perces ciklus

- Négy perc világos, kettő sötét, közte alkony és hajnal
- Éjjel a látótávod **a felére csökken** (55%)
- A bázis, a tornyok, a kikötő és a kohó **fénykört vet**; a katonák fáklyát visznek
- Alkonykor bíborba, éjjel mélykékbe fordul a világ
- A napszak a korszakdoboz mellett olvasható
- A beállításokban kikapcsolható

---

## v1.0 — Az alapok · 2026-08-08

Az első teljes változat. Amit tartalmaz:

**Nemzetek és korszakok**
- Nyolc játszható nemzet, korszakonként hiteles uralkodókkal, festményekkel és zászlókkal
- Négy korszak: 15., 17., 19. és 20. század
- 96 ideológia (nemzetenként 12), korszakonként választható irányokkal

**Hadjáratok**
- 48 küldetés a nyolc nemzeti hadjáratban
- Kalózhadjárat három frakcióval (Nassau, Fekete Szakáll, Stede Bonnet)
- Rögzített Karib-térkép: Kuba, a Bahamák, Jamaica, Hispaniola, Tortuga
- Hajóelfoglalás átszállással, szigeti kolóniák jobbágy nélkül

**Egységek**
- Munkás, közelharcos, lövész, pikás, pap, tábori sebész, ostromgép, hős
- Halász, hadihajó, csapatszállító; felderítő, vadász, bombázó
- Veteránság: három ölés után veterán, hat után elit
- Harci állások: támadó, tartsd a vonalat, visszavonulás
- Morál: kétszeres túlerőben a sebesült megfutamodik

**Épületek**
- Főhadiszállás, kaszárnya, kikötő, kolostor, akadémia, kovácsműhely,
  kórház, lakóház, majorság, torony, fal, kapu, repülőtér
- Kovácsműhely: fegyver, páncél, ellátmány
- Akadémia: termelés, építés, kiképzés, férőhely, gyógyítás, látótáv,
  teherbírás, falak, kincstár, atomprogram

**Világ**
- Kilenc tájtípus, hegyek, folyók, tavak, tenger
- A terep hatása: erdőben +2 páncél, magaslaton +15% lőtáv, parton lassulás
- Térképi események: kereskedőhajó, partra vetett roncs, zsoldosok, pestis

**Egyéb**
- 35 teljesítmény
- Korszakonként külön zene, a kalózvilágnak saját
- Mentés a játékon belül, fájlba is exportálható
- iOS, Android, Windows, Mac és böngésző

---

## Hogyan készül egy új patch

1. A `src/js/00b-version.js` fájlban a `PATCHES` tömb **elejére** kerül az
   új bejegyzés, és a `GAME_VERSION` is frissül.
2. Az `uj` mezőbe az újdonságok, a `fix` mezőbe a javítások kerülnek.
3. Ez a fájl ugyanazt a tartalmat kapja meg olvasható formában.
4. `node build.js`, majd a szokásos tesztsor.
