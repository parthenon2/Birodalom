/* =======================================================================
   3. JÁTÉKÁLLAPOT
   ===================================================================== */
/* =======================================================================
   HADJÁRAT
   Öt küldetés, növekvő nehézséggel. A nemzetet a játékos választja, a
   küldetés csak a kiindulási helyzetet, a bot erejét és a győzelmi
   feltételt szabja meg. A haladás a mentésfájlba is bekerül.
   ===================================================================== */
/* -----------------------------------------------------------------------
   HADJÁRATOK NEMZETENKÉNT

   Minden nemzet a saját történelmét játssza végig: a magyar a végvári
   harcoktól a Rákóczi-szabadságharcon át a modern korig, a lengyel a
   szárnyas huszároktól Varsó felszabadításáig, és így tovább.

   Hat küldetés nemzetenként. A célok típusai közösek (építés, kitartás,
   öldöklés, gyűjtés, korszakváltás), a nevek, az eligazítások és a
   nehézség viszont mind saját.
   ----------------------------------------------------------------------- */
const KAMPANYOK={

 /* --- KALÓZHADJÁRAT ---
    Mindhárom frakció ugyanezt az ívet járja be: kikötőt szerzel, hajót
    építesz, zsákmányolsz, végül szembeszállsz a haditengerészettel.
    Csak ebben a módban lehet ellenséges hajóra átszállni és elfoglalni. */
 /* HÁROM KALÓZHADJÁRAT.

   Mindegyik frakciónak SAJÁT története van, a történelmi alakjuk sorsát
   követve:

     ns — Nassau: a kalózköztársaság felépítése és bukása
     bb — Fekete Szakáll: a rettegés hadjárata a partok mentén
     sb — Stede Bonnet: az úri kalóz esetlen, tragikus pályája
   ===================================================================== */
 kaloz_ns:[
  {name:'A Testvériség kódexe',
   brief:'A háború véget ért, a matrózok munka nélkül maradtak. Nassau kikötőjében kódexet írtunk: közös zsákmány, választott kapitány. Építs hat majorságot — a szabadságot etetni kell.',
   age:1, res:{wood:520,stone:340,gold:260,food:400}, aiAge:1, aiRate:0.5, aiWave:80,
   map:'karib', enemy:'gb', obj:{type:'build',b:'farm',n:6}},
  {name:'A köztársaság kikötője',
   brief:'Egy szabad kikötő csak akkor él meg, ha van mit eladnia. Építs kikötőt és piacot, és gyűjts hatszáz aranyat.',
   age:1, res:{wood:700,stone:420,gold:120,food:520}, aiAge:1, aiRate:0.7, aiWave:95,
   map:'karib', enemy:'es', obj:{type:'gather',res:'gold',amount:600}},
  {name:'A kegyelemlevél',
   brief:'Woodes Rogers megérkezett a király kegyelmével. Aki elfogadja, szabad ember lesz — aki nem, azt felakasztják. Verd vissza a blokádot: húsz ellenséges egység.',
   age:1, res:{wood:800,stone:560,gold:420,food:640}, aiAge:1, aiRate:1.0, aiWave:80,
   map:'karib', enemy:'gb', obj:{type:'kill',n:20}},
  {name:'Az égő hajó',
   brief:'Vane felgyújtott egy zsákmányolt francia hajót, és nekiengedte a blokádnak. A zűrzavarban ki kell törni: építs nyolc épületet a szabad kikötőben.',
   age:1, res:{wood:900,stone:620,gold:480,food:700}, aiAge:1, aiRate:1.1, aiWave:75,
   map:'karib', enemy:'gb', obj:{type:'buildAny',n:8}},
  {name:'A leszavazott kapitány',
   brief:'A kódex ellened fordult: a legénység gyávasággal vádol. Bizonyíts — semmisíts meg harmincöt ellenséges egységet.',
   age:1, res:{wood:1000,stone:700,gold:560,food:820}, aiAge:1, aiRate:1.2, aiWave:70,
   map:'karib', enemy:'es', obj:{type:'kill',n:35}},
  {name:'A vasketrec',
   brief:'Port Royal kikötőjében vasketrec vár mindenkire, aki a kódexhez hű maradt. Ha ez a vég, legyen méltó: döntsd meg az ellenség hatalmát.',
   age:1, res:{wood:1200,stone:900,gold:720,food:1000}, aiAge:1, aiRate:1.35, aiWave:62,
   map:'karib', enemy:'gb', obj:{type:'destroy'}}
 ],
 kaloz_bb:[
  {name:'A Queen Anne bosszúja',
   brief:'Egy zsákmányolt francia rabszolgahajóból lett a legfélelmetesebb fregatt a Karib-tengeren. Építsd ki a támaszpontot: hat majorság kell a legénységnek.',
   age:1, res:{wood:560,stone:380,gold:300,food:430}, aiAge:1, aiRate:0.6, aiWave:78,
   map:'karib', enemy:'es', obj:{type:'build',b:'farm',n:6}},
  {name:'A rettegés fegyver',
   brief:'Égő kanócokat font a szakállába, hogy füstben és lángban lépjen a fedélzetre. A hír megelőzi a hajót: törj meg húsz ellenséges egységet.',
   age:1, res:{wood:720,stone:460,gold:380,food:560}, aiAge:1, aiRate:0.9, aiWave:86,
   map:'karib', enemy:'es', obj:{type:'kill',n:20}},
  {name:'Charleston blokádja',
   brief:'Egy hétig zárta el a kikötőt, és váltságdíj helyett gyógyszerládát követelt. Szerezz nyolcszáz aranyat a városból.',
   age:1, res:{wood:820,stone:540,gold:220,food:640}, aiAge:1, aiRate:1.0, aiWave:82,
   map:'karib', enemy:'gb', obj:{type:'gather',res:'gold',amount:800}},
  {name:'A zátonyra futott zsákmány',
   brief:'A Queen Anne bosszúja zátonyra futott — sokak szerint szándékosan, hogy a kapitány megszabaduljon a túl nagy legénységtől. Építsd újjá a flottát: tíz épület.',
   age:1, res:{wood:940,stone:640,gold:500,food:720}, aiAge:1, aiRate:1.1, aiWave:76,
   map:'karib', enemy:'es', obj:{type:'buildAny',n:10}},
  {name:'Ocracoke szigete',
   brief:'A sekély öbölbe csak az fut be, aki ismeri a járást. Itt gyülekezik a legénység — és ide tart a virginiai kormányzó hajóhada. Negyven ellenséget kell megtörni.',
   age:1, res:{wood:1050,stone:760,gold:600,food:860}, aiAge:1, aiRate:1.25, aiWave:66,
   map:'karib', enemy:'gb', obj:{type:'kill',n:40}},
  {name:'Maynard hadnagy',
   brief:'Öt lövés és húsz vágás kellett hozzá, hogy elessen — a fejét az árbocra kötötték. Ha ez az utolsó csata, ne maradjon állva semmi az ellenségből.',
   age:1, res:{wood:1250,stone:950,gold:780,food:1050}, aiAge:1, aiRate:1.4, aiWave:60,
   map:'karib', enemy:'gb', obj:{type:'destroy'}}
 ],
 kaloz_sb:[
  {name:'A barbadosi ültetvényes',
   brief:'Bonnet gazdag földbirtokos volt, aki unalmában hajót VÁSÁROLT, nem zsákmányolt — és fizetett bért a legénységnek. Kezdd a birtokkal: hat majorság.',
   age:1, res:{wood:620,stone:420,gold:420,food:460}, aiAge:1, aiRate:0.5, aiWave:88,
   map:'karib', enemy:'es', obj:{type:'build',b:'farm',n:6}},
  {name:'A Bosszú',
   brief:'Tíz ágyú, hetven ember, és egy kapitány, aki nem tudott hajót vezetni. A legénység a szemébe nevetett. Építs nyolc épületet, hogy legyen tekintélyed.',
   age:1, res:{wood:760,stone:500,gold:380,food:580}, aiAge:1, aiRate:0.8, aiWave:90,
   map:'karib', enemy:'gb', obj:{type:'buildAny',n:8}},
  {name:'A társ, aki elvette a hajót',
   brief:'Fekete Szakáll a vendégeként érkezett, és a végén a saját embereit ültette a Bosszú fedélzetére. Bonnet a kabinjában olvasott. Szerezz hatszáz aranyat a magad erejéből.',
   age:1, res:{wood:840,stone:560,gold:180,food:620}, aiAge:1, aiRate:0.95, aiWave:84,
   map:'karib', enemy:'es', obj:{type:'gather',res:'gold',amount:600}},
  {name:'Kegyelem és köpönyeg',
   brief:'Kegyelmet kapott, majd „Thomas úr" néven visszatért a kalózkodáshoz — a hajót átkeresztelte Királyi Jakabra. Húsz ellenséges egységet kell megtörni.',
   age:1, res:{wood:960,stone:660,gold:520,food:740}, aiAge:1, aiRate:1.1, aiWave:78,
   map:'karib', enemy:'gb', obj:{type:'kill',n:20}},
  {name:'A Cape Fear folyó',
   brief:'A folyó torkolatában javította a hajót, amikor Rhett ezredes rátalált. Öt óra tűzharc a homokpadok között — harminc ellenséget kell kiállni.',
   age:1, res:{wood:1080,stone:780,gold:620,food:880}, aiAge:1, aiRate:1.2, aiWave:70,
   map:'karib', enemy:'gb', obj:{type:'kill',n:30}},
  {name:'A charlestoni akasztófa',
   brief:'Az úri kalóz kegyelemért könyörgött, és virágcsokrot tartott a kezében az akasztófa alatt. A történet vége meg van írva — te viszont másképp is befejezheted.',
   age:1, res:{wood:1300,stone:980,gold:820,food:1080}, aiAge:1, aiRate:1.35, aiWave:64,
   map:'karib', enemy:'gb', obj:{type:'destroy'}}
 ],

 // A szigetlakók nem játszhatók: hadjáratuk a spanyolokéval közös
 nat:[],

 /* --- SPANYOLORSZÁG: a Paradicsom felfedezése ---
    A félszigetről indulva az Újvilágba: letelepedés, kolónia, majd
    kitartás az őslakók támadásaival szemben. A negyediktől szigetvilágon. */
 es:[
  {name:'A Katolikus Királyok',
   brief:'Ferdinánd és Izabella egyesítette a koronákat. Előbb a föld: építs hat majorságot a granadai hadjárat ellátására.',
   age:0, res:{wood:470,stone:350,gold:250,food:380}, aiAge:0, aiRate:0.5, aiWave:72,
   map:'mezo', obj:{type:'build',b:'farm',n:6}},
  {name:'Granada visszavétele',
   brief:'A félsziget utolsó mór erőssége. Törd meg a védőket, és zárul a nyolcszáz éves reconquista.',
   age:0, res:{wood:680,stone:540,gold:420,food:600}, aiAge:0, aiRate:0.85, aiWave:92,
   map:'mezo', obj:{type:'kill',n:14}},
  {name:'Palos kikötője',
   brief:'A nyugati út hajót kíván. Építs kikötőt, és gyűjts hatszáz aranyat a három karavella felszereléséhez.',
   age:0, res:{wood:760,stone:560,gold:180,food:640}, aiAge:0, aiRate:0.7, aiWave:110,
   map:'tavak', obj:{type:'gather',res:'gold',amount:600}},
  {name:'A Paradicsom felfedezése',
   brief:'Harminchárom nap a nyílt vízen, aztán a partjelző madarak. Sűrű erdős szigetek, alig arany. Verd fel az első tábort: tizenkét épület.',
   age:0, res:{wood:520,stone:300,gold:140,food:420}, aiAge:0, aiRate:0.8, aiWave:80,
   map:'szigetek', enemy:'nat', obj:{type:'build',b:'any',n:12}},
  {name:'Az első kolónia',
   brief:'La Navidad palánkja áll, de az őslakók egyre sűrűbben törnek ránk. Tarts ki öt percen át.',
   age:0, res:{wood:640,stone:420,gold:200,food:520}, aiAge:0, aiRate:1.05, aiWave:58,
   map:'szigetek', enemy:'nat', obj:{type:'survive',sec:300}},
  {name:'Az Újvilág ura',
   brief:'A sziget a miénk lesz, vagy a tengerbe szorulunk. Törd meg az őslakók ellenállását.',
   age:1, res:{wood:820,stone:600,gold:420,food:760}, aiAge:0, aiRate:1.1, aiWave:64,
   map:'szigetek', enemy:'nat', obj:{type:'kill',n:22}}
 ],

 hu:[
  {name:'Nándorfehérvár',
   brief:'A déli végek kapuja. Építs hat majorságot: ostrom idején az élelem többet ér a kardnál.',
   age:0, res:{wood:460,stone:340,gold:240,food:360}, aiAge:0, aiRate:0.5, aiWave:70,
   obj:{type:'build',b:'farm',n:6}},
  {name:'A hosszú tél',
   brief:'A török portyák nem szűnnek. Tartsd a várat négy percen át — aki kitart, az győz.',
   age:0, res:{wood:640,stone:480,gold:320,food:520}, aiAge:0, aiRate:0.85, aiWave:70,
   obj:{type:'survive',sec:240}},
  {name:'A fekete sereg',
   brief:'Mátyás zsoldosait nem kaszárnya adja, hanem a királyi kincstár. A főhadiszállásról toborzol.',
   age:0, res:{wood:700,stone:520,gold:560,food:640}, aiAge:0, aiRate:0.8, aiWave:100,
   ban:['barracks','stable'], hqTrains:['worker','melee','ranged','spear'],
   obj:{type:'kill',n:14}},
  {name:'Rákóczi szabadságharca',
   brief:'„Cum Deo pro Patria et Libertate." A kurucok fegyvert fognak. Verd szét a császári erőket.',
   age:1, res:{wood:820,stone:620,gold:600,food:760}, aiAge:1, aiRate:0.95, aiWave:95,
   obj:{type:'kill',n:20}},
  {name:'Negyvennyolc tavasza',
   brief:'A honvédsereg felszerelést kíván. Termelj ki hétszáz aranyat a hadikassza feltöltésére.',
   age:2, res:{wood:900,stone:700,gold:300,food:820}, aiAge:2, aiRate:0.9, aiWave:110,
   obj:{type:'gather',res:'gold',amount:700}},
  {name:'A gépek kora',
   brief:'A világ átalakult: acél, olaj és repülő. Vezesd birodalmadat a huszadik századba.',
   age:2, res:{wood:1100,stone:850,gold:800,food:1000}, aiAge:2, aiRate:1, aiWave:100,
   obj:{type:'age',age:3}}
 ],

 pl:[
  {name:'A Jagellók földje',
   brief:'Krakkó körül gazdag a föld. Építs hat majorságot, hogy legyen mit enni a hosszú télen.',
   age:0, res:{wood:480,stone:360,gold:260,food:380}, aiAge:0, aiRate:0.5, aiWave:70,
   obj:{type:'build',b:'farm',n:6}},
  {name:'A német lovagrend',
   brief:'Északról páncélos ék közeledik. Tartsd a vonalat négy percen át.',
   age:0, res:{wood:660,stone:520,gold:340,food:540}, aiAge:0, aiRate:0.9, aiWave:66,
   obj:{type:'survive',sec:240}},
  {name:'Szárnyas huszárok',
   brief:'A világ legfélelmetesebb lovassága a tiéd. Sodord el az ellenséget egyetlen rohammal.',
   age:1, res:{wood:760,stone:560,gold:640,food:700}, aiAge:1, aiRate:0.85, aiWave:100,
   obj:{type:'kill',n:18}},
  {name:'Bécs felmentése',
   brief:'Sobieski a Kahlenbergről ereszkedik alá. A keresztény Európa téged néz — tarts ki öt percig.',
   age:1, res:{wood:880,stone:700,gold:660,food:820}, aiAge:1, aiRate:1.05, aiWave:80,
   obj:{type:'survive',sec:300}},
  {name:'Kościuszko felkelése',
   brief:'Kaszás parasztok állnak a nemesek mellé. Kaszárnya nélkül, a birtokról toborzol.',
   age:2, res:{wood:940,stone:760,gold:700,food:880}, aiAge:2, aiRate:0.95, aiWave:105,
   ban:['barracks','stable'], hqTrains:['worker','spear','ranged'],
   obj:{type:'kill',n:20}},
  {name:'Varsó felszabadítása',
   brief:'A főváros romokban, de nem néma. Építsd újjá az országot a huszadik század küszöbén.',
   age:2, res:{wood:1150,stone:900,gold:820,food:1000}, aiAge:2, aiRate:1.05, aiWave:95,
   obj:{type:'age',age:3}}
 ],

 at:[
  {name:'A Habsburg örökség',
   brief:'Amit más háborúval szerez, azt te frigyekkel. Előbb azonban élelem kell: hat majorság.',
   age:0, res:{wood:470,stone:350,gold:280,food:370}, aiAge:0, aiRate:0.5, aiWave:72,
   obj:{type:'build',b:'farm',n:6}},
  {name:'Bécs ostroma',
   brief:'A falak alatt a szultán serege. Tarts ki öt percen át, míg a felmentő had megérkezik.',
   age:0, res:{wood:700,stone:560,gold:360,food:560}, aiAge:0, aiRate:0.95, aiWave:64,
   obj:{type:'survive',sec:300}},
  {name:'A törökellenes liga',
   brief:'Savoyai Jenő vezeti a császári hadat. Törd meg az ellenség erejét a Duna mentén.',
   age:1, res:{wood:800,stone:620,gold:600,food:740}, aiAge:1, aiRate:0.9, aiWave:100,
   obj:{type:'kill',n:18}},
  {name:'Az örökösödési háború',
   brief:'Mária Terézia trónja inog. A hadviselés pénzbe kerül: nyolcszáz arany a hadikasszába.',
   age:1, res:{wood:880,stone:700,gold:300,food:800}, aiAge:1, aiRate:0.9, aiWave:110,
   obj:{type:'gather',res:'gold',amount:800}},
  {name:'A kiegyezés',
   brief:'A birodalom kettős lett. Építs húsz épületet — a rend a kőben is látszik.',
   age:2, res:{wood:1000,stone:820,gold:760,food:900}, aiAge:2, aiRate:0.95, aiWave:105,
   obj:{type:'build',b:'any',n:20}},
  {name:'A nagy háború',
   brief:'A régi világ utolsó nyara. Vezesd a monarchiát a huszadik századba.',
   age:2, res:{wood:1120,stone:880,gold:840,food:1020}, aiAge:2, aiRate:1.05, aiWave:95,
   obj:{type:'age',age:3}}
 ],

 de:[
  {name:'A birodalmi rend',
   brief:'Széttagolt fejedelemségek. Kezdd az alapoknál: hat majorság a mindennapi kenyérért.',
   age:0, res:{wood:470,stone:360,gold:250,food:370}, aiAge:0, aiRate:0.55, aiWave:70,
   obj:{type:'build',b:'farm',n:6}},
  {name:'A Landsknecht ezredek',
   brief:'A zsoldosok drágák, de rendíthetetlenek. Verd szét a szomszéd seregét.',
   age:0, res:{wood:680,stone:520,gold:520,food:600}, aiAge:0, aiRate:0.8, aiWave:95,
   obj:{type:'kill',n:14}},
  {name:'A harmincéves háború',
   brief:'Fél Európa lángol. Tarts ki öt percen át — ez a háború nem a gyorsakról szól.',
   age:1, res:{wood:800,stone:640,gold:560,food:760}, aiAge:1, aiRate:1, aiWave:70,
   obj:{type:'survive',sec:300}},
  {name:'Porosz fegyelem',
   brief:'A Nagy Választófejedelem állandó hadsereget épít. Húsz épület, katonás rendben.',
   age:1, res:{wood:880,stone:720,gold:620,food:820}, aiAge:1, aiRate:0.9, aiWave:105,
   obj:{type:'build',b:'any',n:20}},
  {name:'Vas és vér',
   brief:'Bismarck szava: a kor nagy kérdéseit nem beszédek döntik el. Törd meg az ellenállást.',
   age:2, res:{wood:980,stone:800,gold:740,food:900}, aiAge:2, aiRate:1, aiWave:100,
   obj:{type:'kill',n:24}},
  {name:'Az egyesült birodalom',
   brief:'A fejedelemségekből nemzet lett. Lépj be a huszadik századba.',
   age:2, res:{wood:1120,stone:900,gold:840,food:1020}, aiAge:2, aiRate:1.05, aiWave:95,
   obj:{type:'age',age:3}}
 ],

 fr:[
  {name:'A királyi birtok',
   brief:'XI. Lajos a pókháló türelmével sző. Kezdd a földdel: hat majorság.',
   age:0, res:{wood:480,stone:350,gold:270,food:380}, aiAge:0, aiRate:0.5, aiWave:72,
   obj:{type:'build',b:'farm',n:6}},
  {name:'A százéves háború vége',
   brief:'Az angolok kiszorulnak a kontinensről. Szórd szét a maradék seregüket.',
   age:0, res:{wood:660,stone:500,gold:480,food:600}, aiAge:0, aiRate:0.8, aiWave:95,
   obj:{type:'kill',n:14}},
  {name:'Versailles',
   brief:'A Napkirály udvara aranyat kíván. Termelj ki nyolcszáz aranyat.',
   age:1, res:{wood:820,stone:640,gold:280,food:780}, aiAge:1, aiRate:0.85, aiWave:110,
   obj:{type:'gather',res:'gold',amount:800}},
  {name:'Vauban erődjei',
   brief:'A határt kővel védjük, nem vérrel. Építs húsz épületet a védelmi vonal mentén.',
   age:1, res:{wood:900,stone:760,gold:640,food:820}, aiAge:1, aiRate:0.9, aiWave:100,
   obj:{type:'build',b:'any',n:20}},
  {name:'A Grande Armée',
   brief:'Napóleon serege menetel. A császár nem ismeri a szót: elég.',
   age:2, res:{wood:1000,stone:800,gold:780,food:920}, aiAge:2, aiRate:1, aiWave:95,
   obj:{type:'kill',n:24}},
  {name:'A köztársaság',
   brief:'Császárok jöttek és mentek, a nemzet maradt. Lépj a huszadik századba.',
   age:2, res:{wood:1120,stone:880,gold:840,food:1020}, aiAge:2, aiRate:1.05, aiWave:95,
   obj:{type:'age',age:3}}
 ],

 gb:[
  {name:'A rózsák után',
   brief:'A polgárháború véget ért, az ország kimerült. Hat majorság, hogy legyen mit enni.',
   age:0, res:{wood:470,stone:350,gold:260,food:370}, aiAge:0, aiRate:0.5, aiWave:70,
   obj:{type:'build',b:'farm',n:6}},
  {name:'Az íjászok kora',
   brief:'A hosszúíj még mindig a legfélelmetesebb fegyver. Bizonyítsd be a csatatéren.',
   age:0, res:{wood:660,stone:500,gold:460,food:600}, aiAge:0, aiRate:0.8, aiWave:95,
   obj:{type:'kill',n:14}},
  {name:'Az Armada',
   brief:'A tengerről érkezik a fenyegetés. Tarts ki öt percen át, a vihar a szövetségesed.',
   age:1, res:{wood:800,stone:640,gold:560,food:760}, aiAge:1, aiRate:1, aiWave:70,
   obj:{type:'survive',sec:300}},
  {name:'Az új mintájú hadsereg',
   brief:'Cromwell fegyelmezett ezredei nem ismerik a menekülést. Törd meg a királypártiakat.',
   age:1, res:{wood:860,stone:700,gold:620,food:820}, aiAge:1, aiRate:0.95, aiWave:100,
   obj:{type:'kill',n:20}},
  {name:'A birodalom kereskedelme',
   brief:'Ahol a hajó jár, ott az arany is. Termelj ki nyolcszáz aranyat.',
   age:2, res:{wood:980,stone:800,gold:300,food:900}, aiAge:2, aiRate:0.95, aiWave:110,
   obj:{type:'gather',res:'gold',amount:800}},
  {name:'A leghosszabb nap',
   brief:'A sziget kitartott. Most vezesd birodalmadat a huszadik századba.',
   age:2, res:{wood:1120,stone:880,gold:840,food:1020}, aiAge:2, aiRate:1.05, aiWave:95,
   obj:{type:'age',age:3}}
 ],

 ru:[
  {name:'Moszkva felemelkedése',
   brief:'A tatár iga véget ért. Építs hat majorságot a fagyos föld termésére.',
   age:0, res:{wood:500,stone:380,gold:250,food:400}, aiAge:0, aiRate:0.5, aiWave:72,
   obj:{type:'build',b:'farm',n:6}},
  {name:'A Kreml falai',
   brief:'Kő kövön: húsz épület álljon, mire a tél beköszönt.',
   age:0, res:{wood:700,stone:600,gold:300,food:560}, aiAge:0, aiRate:0.7, aiWave:90,
   obj:{type:'build',b:'any',n:20}},
  {name:'A zavaros idők',
   brief:'Trónkövetelők és idegen seregek. Tarts ki öt percen át, amíg a rend visszatér.',
   age:1, res:{wood:820,stone:680,gold:540,food:780}, aiAge:1, aiRate:1, aiWave:70,
   obj:{type:'survive',sec:300}},
  {name:'Nagy Péter reformja',
   brief:'Ablakot vágunk Európára. A flottához és a városhoz arany kell: nyolcszáz.',
   age:1, res:{wood:900,stone:740,gold:280,food:840}, aiAge:1, aiRate:0.9, aiWave:110,
   obj:{type:'gather',res:'gold',amount:800}},
  {name:'Felperzselt föld',
   brief:'Az ellenség mélyen benyomult. A tél és a távolság a mi oldalunkon áll.',
   age:2, res:{wood:1000,stone:820,gold:760,food:920}, aiAge:2, aiRate:1.05, aiWave:90,
   obj:{type:'kill',n:24}},
  {name:'Ipari nagyhatalom',
   brief:'A birodalom gyárakat épít. Lépj be a huszadik századba.',
   age:2, res:{wood:1150,stone:900,gold:860,food:1040}, aiAge:2, aiRate:1.05, aiWave:95,
   obj:{type:'age',age:3}}
 ]
};
// A hadjárat mindig a választott nemzeté. A CAMPAIGN azért maradt változó,
// mert több modul hivatkozik rá; a nemzet váltásakor cseréljük a tartalmát.
let CAMPAIGN=KAMPANYOK.hu;
function setCampaign(nation){
  // A kalózfrakciók közös hadjáratot játszanak
  /* Minden kalózfrakciónak SAJÁT hadjárata van, a történelmi alakja
     sorsát követve. Ha valamelyikhez nem lenne, a Nassau-hadjárat az
     alapértelmezett. */
  if(NATIONS[nation]&&NATIONS[nation].pirate)
    CAMPAIGN=KAMPANYOK['kaloz_'+nation]||KAMPANYOK.kaloz_ns;
  else CAMPAIGN=KAMPANYOK[nation]||KAMPANYOK.hu;
  return CAMPAIGN;
}
/* Teljesített küldetések. A kulcs a nemzet és a sorszám együtt, mert
   minden nemzetnek saját hadjárata van. */
const CAMP_DONE={};
function campKey(nation,i){ return (nation||'hu')+':'+i; }
function campDone(i,nation){ return !!CAMP_DONE[campKey(nation||G.campNation||G.nation,i)]; }

/* A pálya mérete játszmánként változhat: a kalózvilág háromszor akkora,
   mert ott a tenger a játéktér. A ködrács (FW×FH) ebből számolódik újra,
   ezért a méretet MINDIG a setWorldSize()-zal állítjuk, sosem kézzel. */
const WORLD_ALAP={w:3400,h:2400};
const WORLD={w:WORLD_ALAP.w, h:WORLD_ALAP.h};
const G={
  on:false, over:false, t:0,
  nation:'hu', age:0,
  res:{wood:500,stone:380,gold:300,food:420},
  earned:{wood:0,stone:0,gold:0,food:0,coal:0},  // a játszma során összesen megtermelt
  kills:0,
  units:[], builds:[], nodes:[], projs:[], fx:[],
  sel:[], selBuild:null,
  cam:{x:0,y:0}, view:{w:0,h:0}, vw:0, vh:0, zoom:1, isTouch:false, mouseSeen:false,
  mouse:{x:0,y:0,wx:0,wy:0,down:false,dragging:false,sx:0,sy:0},
  cb:false, paused:false, lowFx:false, diff:1, mapType:'mezo', mapPick:'random',
  atomAim:null, atomUsed:false, scorch:[], shake:0, rock:null, deco:[], decoSeed:1, introOn:false,
  corpses:[], wrecks:[],
  campNation:'hu', pirate:false, eventT:undefined, offer:null, plague:null,
  prices:{wood:1,stone:1,food:1,coal:1}, dayNight:true, starving:false, tradeT:undefined,
  formation:'line', photo:false, tutor:null, postFx:true, port:null, simMag:0, rng:undefined, rngHivas:0, homeCity:'nassau', aiCity:'havanna', toltet:'golyo', hirnev:0, kegyelem:0, wear:null, wearT:0,
  weatherOn:true, weather:null, puddles:[], snowDepth:0, stock:null, civil:null,
  startAge:0, uiMode:'auto',
  // Beállítások: irányítás, grafika, hang
  camSpeed:1, edgeScroll:true, fxMode:'auto', scrollMode:'auto', viewSize:'auto', nextId:0, quick:null, mission:null, missionIdx:-1, groups:{}, lastGrp:{n:0,t:-9},
  upg:{weapon:0,armor:0,supply:0}, doct:{}, kb:{on:false,x:0,y:0,grp:-1,bi:-1,wi:-1},
  place:null, wallDrag:null, noDropWarn:-99, regrowT:14, regrowT2:40, navVer:0, navLen:-1, warmQ:[], flowBudget:2, revealed:false, btnSig:'',
  keys:{},
  ai:null
};
