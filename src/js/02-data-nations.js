/* =======================================================================
   2. ADATOK — nemzetek, korszakok, egységek, épületek
   ===================================================================== */

// --- Választható nemzetek. A rulers/titles tömbök a 4 korszakhoz tartoznak. ---
const NATIONS={
  hu:{name:'Magyarország',
    ui:{gold:'#f3cf72',panel:'#6b3c26',panel2:'#8c5133',line:'#b87a4a'}, arch:{roof:'#93372a',wall:'#d9bc82',trim:'#c9a227'}, uni:['#7a1f27','#8d2430','#3d5a4a','#5b6b4a'], color:'#C8102E', accent:'#1E7A3C',
      flag:'linear-gradient(#C8102E 33%,#FFF 33%,#FFF 66%,#1E7A3C 66%)',
      rulers:['Hunyadi Mátyás','II. Rákóczi Ferenc','Kossuth Lajos','Horthy Miklós'],
      eras:['Magyar Királyság','Magyar Királyság','Magyarország','Magyarország'],
      titles:['király','fejedelem','kormányzó','kormányzó']},
  /* --- KALÓZFRAKCIÓK ---
     Csak a Kalózhadjáratban választhatók; a szabad játék nemzetválasztójában
     nem jelennek meg. Nem lépnek korszakot: végig a vitorlások korában
     játszanak. */
  ns:{name:'Nassau', hidden:true, noAge:true, pirate:true,
    ui:{gold:'#e8c96a',panel:'#3a2e22',panel2:'#4e3d2c',line:'#8a7048'},
    arch:{roof:'#8a6a42',wall:'#d8c9a8',trim:'#c9a227'},
    uni:['#3f3f3f','#7a2f2f','#3a5a6a','#8a6a3a'], color:'#2B2B2B', accent:'#E8E4D8',
      flag:'linear-gradient(#2B2B2B 100%)',
      rulers:['Benjamin Hornigold','Charles Vane','Jack Rackham','Anne Bonny'],
      eras:['A kalózköztársaság','A kalózköztársaság','A kalózköztársaság','A kalózköztársaság'],
      titles:['kapitány','kapitány','kapitány','kapitány']},
  bb:{name:'Fekete Szakáll', hidden:true, noAge:true, pirate:true,
    ui:{gold:'#d8b04a',panel:'#2a2420',panel2:'#3d332c',line:'#6e5c48'},
    arch:{roof:'#5a4436',wall:'#c0b49c',trim:'#a8863c'},
    uni:['#1e1e1e','#5a1f1f','#2e2e2e','#6a5030'], color:'#1A1A1A', accent:'#B01B1B',
      flag:'linear-gradient(#1A1A1A 100%)',
      rulers:['Edward Teach','Edward Teach','Edward Teach','Edward Teach'],
      eras:['A Queen Anne bosszúja','A Queen Anne bosszúja','A Queen Anne bosszúja','A Queen Anne bosszúja'],
      titles:['rettegett kapitány','rettegett kapitány','rettegett kapitány','rettegett kapitány']},
  sb:{name:'Stede Bonnet', hidden:true, noAge:true, pirate:true,
    ui:{gold:'#e0d0a0',panel:'#33384a',panel2:'#454c62',line:'#7a86a8'},
    arch:{roof:'#6a5a4a',wall:'#e0dccc',trim:'#c9b06a'},
    uni:['#2f3d5c','#6a2f3a','#8a8ea0','#5a6a4a'], color:'#2F3D5C', accent:'#C8102E',
      flag:'linear-gradient(#2F3D5C 100%)',
      rulers:['Stede Bonnet','Stede Bonnet','Stede Bonnet','Stede Bonnet'],
      eras:['Az úri kalóz','Az úri kalóz','Az úri kalóz','Az úri kalóz'],
      titles:['őrnagy','őrnagy','őrnagy','őrnagy']},

  /* A szigetek őslakói. Rejtett nemzet: a nemzetválasztóban nem jelenik
     meg, csak ellenfélként a spanyol hadjárat tengerentúli küldetéseiben.
     Nem fejlődik korszakot: végig fából és pálmalevélből építkezik. */
  nat:{name:'Szigetlakók', hidden:true, noAge:true,
    ui:{gold:'#e0c06a',panel:'#3d5230',panel2:'#4f6a3e',line:'#7d9a5c'},
    arch:{roof:'#b9a05e',wall:'#8a6a42',trim:'#c98a3c'},
    uni:['#7a5a34','#8c6a3e','#5c7a42','#a8763c'], color:'#C97A3C', accent:'#5C8A3A',
      flag:'linear-gradient(#5C8A3A 40%,#C97A3C 40%)',
      rulers:['Guacanagarí','Hatuey','Anacaona','Caonabo'],
      eras:['Taíno törzsek','Taíno törzsek','Taíno törzsek','Taíno törzsek'],
      titles:['kacika','kacika','kacika','kacika']},
  es:{name:'Spanyolország',
    ui:{gold:'#f0c04a',panel:'#6b2a1e',panel2:'#8c3a26',line:'#b8623a'}, arch:{roof:'#b8562e',wall:'#efe0c2',trim:'#d8a33c'}, uni:['#8a1f26','#9c2b2b','#c8b060','#5e6a4a'], color:'#AA151B', accent:'#F1BF00',
      flag:'linear-gradient(#AA151B 25%,#F1BF00 25%,#F1BF00 75%,#AA151B 75%)',
      rulers:['Aragóniai Ferdinánd','II. Fülöp','III. Károly','Francisco Franco'],
      eras:['Kasztília és Aragónia','Spanyol Birodalom','Spanyol Királyság','Spanyolország'],
      titles:['király','király','király','államfő']},
  at:{name:'Ausztria',
    ui:{gold:'#f7da7c',panel:'#57492f',panel2:'#736043',line:'#a08a5c'}, arch:{roof:'#5a4636',wall:'#f0e7cf',trim:'#dcb84e'}, uni:['#3a3a42','#e8e2d0','#e6e0cc','#5c6152'], color:'#E2E2E2', accent:'#B8121B',
      flag:'linear-gradient(#B8121B 33%,#FFF 33%,#FFF 66%,#B8121B 66%)',
      rulers:['III. Frigyes','I. Lipót','I. Ferenc József','I. Károly'],
      eras:['Osztrák Hercegség','Habsburg Birodalom','Osztrák–Magyar Monarchia','Ausztria'],
      titles:['császár','császár','császár','császár']},
  pl:{name:'Lengyelország',
    ui:{gold:'#f7efe0',panel:'#6b2c37',panel2:'#8c3d4a',line:'#b3596a'}, arch:{roof:'#a63a38',wall:'#ded5c4',trim:'#d8cfc0'}, uni:['#8f2230','#a02a34','#22409a','#4a5566'], color:'#E03A4E', accent:'#F2F2F2',
      flag:'linear-gradient(#FFF 50%,#DC143C 50%)',
      rulers:['IV. Kázmér','III. (Sobieski) János','Kościuszko Tádé','Piłsudski József'],
      eras:['Lengyel Királyság','Lengyel–Litván Unió','Lengyelország','Lengyel Köztársaság'],
      titles:['király','király','hadvezér','marsall']},
  de:{name:'Németország',
    ui:{gold:'#e9cb74',panel:'#374658',panel2:'#4a5d73',line:'#6d84a0'}, arch:{roof:'#474c55',wall:'#a89d86',trim:'#c6a94b'}, uni:['#2f3a4a','#243247','#1d3a5c','#4a5340'], color:'#2C2C2C', accent:'#E0B400',
      flag:'linear-gradient(#111 33%,#C8102E 33%,#C8102E 66%,#E0B400 66%)',
      rulers:['I. Miksa','Frigyes Vilmos','Bismarck Ottó','Paul von Hindenburg'],
      eras:['Német-római Birodalom','Brandenburg–Poroszország','Német Birodalom','Németország'],
      titles:['császár','választófejedelem','kancellár','elnök']},
  fr:{name:'Franciaország',
    ui:{gold:'#ead092',panel:'#2c3c6b',panel2:'#3d5290',line:'#5f79bd'}, arch:{roof:'#5d6875',wall:'#e6dcbe',trim:'#c9b06a'}, uni:['#2c3f7a','#1f3f86','#1e3f8c','#5d6b52'], color:'#2B4C9B', accent:'#EFEFEF',
      flag:'linear-gradient(90deg,#2B4C9B 33%,#FFF 33%,#FFF 66%,#C8102E 66%)',
      rulers:['XI. Lajos','XIV. Lajos','Napóleon Bonaparte','Charles de Gaulle'],
      eras:['Francia Királyság','Francia Királyság','Francia Császárság','Francia Köztársaság'],
      titles:['király','király','császár','tábornok']},
  gb:{name:'Nagy-Britannia',
    ui:{gold:'#e5c874',panel:'#2f4257',panel2:'#405872',line:'#63809e'}, arch:{roof:'#6a3d33',wall:'#a86a52',trim:'#c2a24b'}, uni:['#8a2b2b','#a02a26','#a3272a','#4c5240'], color:'#B01B2E', accent:'#0A2B5C',
      flag:'linear-gradient(transparent 40%,#C8102E 40%,#C8102E 60%,transparent 60%),linear-gradient(90deg,transparent 42%,#C8102E 42%,#C8102E 58%,transparent 58%),#0A2B5C',
      rulers:['VII. Henrik','Oliver Cromwell','Viktória királynő','Winston Churchill'],
      eras:['Anglia','Anglia','Nagy-Britannia','Nagy-Britannia'],
      titles:['király','lordprotektor','királynő','miniszterelnök']},
  ru:{name:'Oroszország',
    ui:{gold:'#f6cd5e',panel:'#6b3227',panel2:'#8c4331',line:'#b8654a'}, arch:{roof:'#39705c',wall:'#c28a5c',trim:'#d3a83c'}, uni:['#7a2a24','#2f5a3c','#2f5f3f','#4a5540'], color:'#2F5FA8', accent:'#D62828',
      flag:'linear-gradient(#FFF 33%,#2F5FA8 33%,#2F5FA8 66%,#D62828 66%)',
      rulers:['III. Iván','I. (Nagy) Péter','I. Sándor','II. Miklós'],
      eras:['Moszkvai Nagyfejedelemség','Orosz Cárság','Orosz Birodalom','Orosz Birodalom'],
      titles:['nagyfejedelem','cár','cár','cár']},

  /* =====================================================================
     KÉSZÜLŐ NEMZETEK

     A `keszul:true` jelöléssel EGYELŐRE NEM VÁLASZTHATÓK: sem a
     menüben, sem a szobában nem jelennek meg. Az adatuk viszont már
     kész, tehát bekapcsolni egyetlen sor törlése lesz.

     Miért így? Mert egy nemzet nem attól kész, hogy van neve és
     zászlaja. Kell hozzá saját ideológia, saját fejfedő, saját
     építészet és saját egységsziluett — különben csak egy másik
     színben pompázó magyar. Ezeket menet közben töltjük fel.

     ÁLLAPOT (1.0):
       adatok, uralkodók, államformák, zászló, fordítás   — kész
       nemzeti előny (BONUS)                              — kész
       ideológiák (NAT_DOCT)                              — kész
       fejfedő, fegyver, lószerszám, tetőforma            — kész
       saját épülethomlokzat, saját egységsziluett        — hátravan
     ===================================================================== */

  se:{name:'Svédország', keszul:true,
    ui:{gold:'#f2d16b',panel:'#1f3350',panel2:'#2b4468',line:'#4a6a96'}, arch:{roof:'#8a3f2e',wall:'#d8c9a8',trim:'#e0b93c'}, uni:['#2d4a72','#1f3a5c','#31527d','#4a5a66'], color:'#2B5DA8', accent:'#F5C518',
      rulers:['Vasa Gusztáv','II. Gusztáv Adolf','XIV. Károly János','Hammarskjöld Dag'],
      eras:['Kalmari unió','Svéd Nagyhatalom','Svéd–Norvég Unió','Svédország'],
      titles:['király','király','király','miniszterelnök']},

  ot:{name:'Oszmán Birodalom', keszul:true,
    ui:{gold:'#f0c95a',panel:'#2a3f2c',panel2:'#3a563c',line:'#5f8a5e'}, arch:{roof:'#4a6f5a',wall:'#e0d2ae',trim:'#d8b13c'}, uni:['#1f5a3a','#8a2a24','#7a3020','#4a5a3a'], color:'#1F7A46', accent:'#E03A2F',
      rulers:['II. Mehmed','Nagy Szulejmán','II. Mahmud','Atatürk Musztafa Kemál'],
      eras:['Oszmán Szultánság','Oszmán Birodalom','Oszmán Birodalom','Török Köztársaság'],
      titles:['szultán','szultán','szultán','elnök']},

  jp:{name:'Japán', keszul:true,
    ui:{gold:'#e8c07a',panel:'#3a2020',panel2:'#522d2d',line:'#8a5050'}, arch:{roof:'#3f3a36',wall:'#e6dfd2',trim:'#b03030'}, uni:['#3a3a44','#2f2f38','#4a4a52','#5a5f4a'], color:'#BC002D', accent:'#F2F2F2',
      rulers:['Asikaga Josimasza','Tokugava Iejaszu','Meidzsi császár','Hirohito császár'],
      eras:['Muromacsi sógunátus','Tokugava sógunátus','Japán Császárság','Japán Császárság'],
      titles:['sógun','sógun','császár','császár']},

  cn:{name:'Kína', keszul:true,
    ui:{gold:'#f5cc4d',panel:'#5a1f1f',panel2:'#7a2c2c',line:'#a85050'}, arch:{roof:'#b8863a',wall:'#c9503a',trim:'#f0c93c'}, uni:['#8a2a24','#7a2420','#9a3a2a','#5a5a44'], color:'#C8102E', accent:'#F0C93C',
      rulers:['Jung-lo császár','Kang-hszi császár','Ce-hszi anyacsászárné','Szun Jat-szen'],
      eras:['Ming-dinasztia','Csing-dinasztia','Csing-dinasztia','Kínai Köztársaság'],
      titles:['császár','császár','anyacsászárné','elnök']},

  in:{name:'India', keszul:true,
    ui:{gold:'#f3c766',panel:'#4a2f14',panel2:'#66421c',line:'#a06a30'}, arch:{roof:'#c9a227',wall:'#e8dcc0',trim:'#d86a2a'}, uni:['#c47a1e','#8a4a1a','#7a5a2a','#4a6a3a'], color:'#FF9933', accent:'#138808',
      rulers:['Nagy Akbar','Aurangzeb','Laksmi Báí','Gandhi Mahátma'],
      eras:['Delhi Szultánság','Mogul Birodalom','Brit India','India'],
      titles:['szultán','padisah','ráni','vezető']},

  ml:{name:'Mali Birodalom', keszul:true,
    ui:{gold:'#f6d15c',panel:'#4a3312',panel2:'#6a4a1c',line:'#a87a34'}, arch:{roof:'#a4713a',wall:'#d9b880',trim:'#e0b03c'}, uni:['#c9a227','#8a6a20','#7a5a2a','#5a6a3a'], color:'#CE1126', accent:'#FCD116',
      rulers:['I. Manszá Músza','Manszá Szulejmán','Szonni Ali','Aszkia Mohamed'],
      eras:['Mali Birodalom','Mali Birodalom','Szongáj Birodalom','Szongáj Birodalom'],
      titles:['manszá','manszá','szonni','aszkia']}
};
// Az ellenfél mindig ugyanabban a lila-arany színben játszik, hogy sose keveredjen
// össze a játékos nemzeti színeivel.
const ENEMY={name:'Ellenséges koalíció', color:'#6B4A9E', accent:'#D9C27A'};

// --- Korszakok. A style mező a teljes vizuális palettát váltja. ---
const AGES=[
  {name:'15. század', sub:'Késő középkor',      cost:{food:760,gold:520},
   ui:{gold:'#c9a227',panel:'#1a1410',panel2:'#241c15',line:'#4a3c2c',ink:'#e8dcc0'},
   style:{evszak:'tavasz',ground:'#5a8c3c',ground2:'#679a45',path:'#8a7550',wall:'#9a9186',wallDark:'#6d6459',roof:'#6d3f26',wood:'#7a5230',metal:'#b9bcc0'}},
  {name:'17. század', sub:'Kora újkor',         cost:{food:1250,gold:980},
   ui:{gold:'#c98b3a',panel:'#191512',panel2:'#241d17',line:'#4c3b2b',ink:'#e9dcc6'},
   style:{evszak:'nyar',ground:'#3f6b30',ground2:'#4a7a38',path:'#7d6a45',wall:'#a89e8c',wallDark:'#786e5d',roof:'#7b4b2f',wood:'#835a34',metal:'#c2c6ca'}},
  {name:'19. század', sub:'Ipari forradalom',   cost:{food:1900,gold:1550},
   ui:{gold:'#b07a52',panel:'#161513',panel2:'#211f1c',line:'#443f38',ink:'#e6e1d6'},
   style:{evszak:'osz',ground:'#7a6a34',ground2:'#8a7a3c',path:'#6f6152',wall:'#a4523f',wallDark:'#733a2c',roof:'#57575f',wood:'#6f5238',metal:'#9aa1a8'}},
  {name:'20. század', sub:'Világháborús kor',   cost:{food:0,gold:0},
   ui:{gold:'#8d9a6b',panel:'#131513',panel2:'#1c1f1b',line:'#3b4038',ink:'#dfe3d6'},
   style:{evszak:'tel',ground:'#77807e',ground2:'#848d8a',path:'#6e6a5c',wall:'#8e8e86',wallDark:'#63635c',roof:'#4a4f45',wood:'#5f5645',metal:'#8a9198'}}
];

// --- Egységek. Három szerep, korszakonként más névvel, kinézettel, statokkal. ---
/* -----------------------------------------------------------------------
   REPÜLŐGÉPEK (20. század)

   A gépek a terep fölött szállnak: víz, fal, hegy nem állítja meg őket, és
   egymásba sem ütköznek a földi egységekkel. Cserébe csak a vadász, a
   géppuskás és a légvédelmi torony ér el hozzájuk.
   - felderítő: fegyvertelen, nagyon gyors, hatalmas látótávolság
   - vadász: csak repülőt támad
   - bombázó: csak földi célt támad, és ő viszi az atomcsapást
   ----------------------------------------------------------------------- */
const UNITS={
  scout:{names:['—','—','—','Felderítő'],
    hp:[1,1,1,90], dmg:[0,0,0,0], range:0, speed:[0,0,0,150], atk:9, r:11, armor:[0,0,0,2],
    cost:{gold:60,wood:60}, time:9, air:true, sight:340, minAge:3},
  fighter:{names:['—','—','—','Vadászgép'],
    hp:[1,1,1,140], dmg:[0,0,0,26], range:[0,0,0,90], speed:[0,0,0,132], atk:0.7, r:12, armor:[0,0,0,3],
    cost:{gold:120,wood:90,coal:40}, time:14, air:true, antiAir:true, proj:[0,0,0,900], sight:250, minAge:3},
  bomber:{names:['—','—','—','Bombázó'],
    hp:[1,1,1,230], dmg:[0,0,0,64], range:[0,0,0,70], speed:[0,0,0,86], atk:2.6, r:15, armor:[0,0,0,5],
    cost:{gold:200,wood:150,coal:90}, time:22, air:true, bomb:true, proj:[0,0,0,300], sight:220, minAge:3},
  worker:{names:['Jobbágy','Napszámos','Munkás','Munkás'],
    hp:[45,50,58,66], dmg:[3,3,4,4], range:16, speed:[64,66,70,76], atk:1.3, r:8, armor:0,
    cost:{food:50}, time:6, gather:[0.85,1.0,1.25,1.6], carry:12, key:'1'},
  melee:{names:['Lovag','Kürasszír','Gránátos','Tank'],
    hp:[95,125,160,340], dmg:[11,15,20,38], range:[18,18,18,34], speed:[72,74,76,60], atk:[1.0,1.0,0.95,1.4], r:[11,11,11,15],
    cost:{food:60,gold:25}, time:9, armor:[2,3,4,14], key:'2'},
  ranged:{names:['Íjász','Muskétás','Puskás gyalogos','Géppuskás'],
    hp:[55,70,88,105], dmg:[8,14,19,7], range:[115,135,165,155], speed:[62,62,64,62], atk:[1.4,2.2,1.5,0.28], r:9,
    cost:{food:45,wood:25}, time:8, proj:[240,420,620,760], armor:[0,1,1,1], key:'3'},
  // A pikás vonal a lovasság és később a harckocsik ellenszere
  spear:{names:['Pikás','Lándzsás','Szuronyos gyalogos','Páncéltörő'],
    hp:[78,98,118,124], dmg:[9,13,17,30], range:[26,28,28,130], speed:[58,60,62,56],
    atk:[1.2,1.2,1.1,2.4], r:10, armor:[1,2,2,3],
    cost:{food:50,wood:20}, time:8, proj:[0,0,0,520], key:'4'},
  /* --- KÖNNYŰLOVASSÁG ---
     Az eddigi közelharci vonal (Lovag → Kürasszír) NEHÉZlovasság: drága,
     páncélos, lassú. Hiányzott mellőle a könnyű: gyors, olcsóbb, gyenge
     páncélú portyázó, amely a lövészeket és a munkásokat bünteti, de a
     pikasorra rárohanva elvérzik.

     Ezzel a kő-papír-olló háromszögből NÉGYSZÖG lesz:
       pika  →  ver minden lovast (nehezet és könnyűt is)
       lovas →  ver minden lövészt
       lövész → veri a pikát
       nehézlovas → veri a lövészt, de lassú és drága

     A könnyűlovas a nehéz ellen gyenge (0.75): a páncél kifogja a
     szablyát. Így nem váltja ki a meglévő vonalat, hanem KIEGÉSZÍTI.

     A sebesség a lényege: 118-tól 150-ig, ami a leggyorsabb szárazföldi
     egység. Aki nem figyel a hátországára, annak a favágóit vágja le. */
  cav:{names:['Könnyűlovas','Huszár','Ulánus','Felderítő páncélos'],
    hp:[80,100,120,190], dmg:[10,14,18,26], range:[18,18,18,30],
    speed:[118,124,132,150], atk:[1.15,1.15,1.1,1.2], r:[12,12,12,14],
    armor:[1,1,2,7],
    /* A billentyű: a 6-os a halászhajóé, ezért a lovas a G-t kapja
       (mint „gyors”). A szárazföldi és a tengeri egységek külön
       építményben készülnek, de a gyorsbillentyűk közösek — az ütközést
       a támadási próba fogta meg. */
    cost:{food:70,gold:40}, time:11, pop:2, key:'G'},
  // A hittérítő nem harcol: az ellenség egységeit átállítja, a sajátjait gyógyítja
  priest:{names:['Szerzetes','Prédikátor','Agitátor','Komisszár'],
    hp:[68,78,88,98], dmg:0, range:[95,105,115,125], speed:[60,62,64,66],
    atk:1, r:9, armor:0, cost:{food:60,gold:70}, time:11,
    convert:[8,7.5,7,6.5], heal:[2.4,2.8,3.2,3.6], key:'5'},
  // Hajók: számukra a víz a járható terep, a szárazföld az akadály
  /* KÉM. Fegyvertelen és törékeny, de álruhát ölthet: az ellenség színeit
     viseli, és nem lövik rá. Így be lehet sétálni az idegen földre, látni,
     mit épít — és felgyújtani a raktárát. A piacon toborozható: a kereskedő
     álruhája a legrégibb fedősztori. */
  spy:{names:['Hírszerző','Kém','Ügynök','Felderítő tiszt'],
    hp:[60,70,85,100], dmg:0, range:20, speed:[92,96,100,106], atk:1, r:9, armor:[0,0,1,1],
    spy:true, cost:{gold:120,food:40}, time:14, key:'M'},

  /* FALTÖRŐ KOS. Csak épületet üt, viszont ötszörösen. Lassú és nagy
     életerejű: azért éli túl a falhoz vezető utat. Katona ellen semmit sem ér. */
  ram:{names:['Faltörő kos','Faltörő kos','Ostromkos','Robbantóosztag'],
    hp:[340,420,520,620], dmg:[30,42,56,72], range:[24,24,26,26],
    speed:[26,28,32,36], atk:[2.6,2.4,2.2,2.0], r:15, armor:[3,4,5,7],
    ram:true, vsBuilding:5, cost:{wood:170,gold:60}, time:22, key:'K'},

  /* OSTROMTORONY. Nem üt, hanem ÁTJUTTAT: hat katonát visz a falig, és a
     túloldalon rakja ki őket. A messziről bontó ostromgép párja. */
  siegetower:{names:['Ostromtorony','Ostromtorony','Rohamhíd','Rohamjármű'],
    hp:[420,520,640,760], dmg:0, range:20,
    speed:[24,26,30,36], atk:1, r:16, armor:[4,5,6,8],
    tower:true, carry:6, cost:{wood:210,stone:60,gold:40}, time:26, key:'L'},

  /* HŐS. Nemzetenként egyetlen példány, a korszak uralkodójának nevében.
     Erős harcos, de az igazi értéke az aurája: a körülötte harcolók
     nagyobbat ütnek, jobban bírják, és nem futamodnak meg.
     Ha elesik, a kórházban lehet visszahívni — a nemzet nem marad fej nélkül. */
  hero:{names:['Hős','Hős','Hős','Hős'],
    hp:[420,520,640,780], dmg:[34,46,60,78], range:[26,30,34,120],
    speed:[86,88,92,96], atk:[1.1,1.2,1.1,0.9], r:12, armor:[4,5,6,8],
    hero:true, auraR:170, auraDmg:0.15, auraArmor:1,
    cost:{gold:320,food:260}, time:34, key:'H'},

  /* Ostromgép. Lassú és sebezhető, de MESSZEBBRE lő, mint bármelyik torony,
     és épület ellen háromszoros sebzést okoz. Nélküle a jól kiépített
     védelmet nem lehet megtörni; mellette viszont fedezet kell neki, mert
     közelharcban azonnal elesik. */
  siege:{names:['Katapult','Mozsár','Tarack','Tüzérség'],
    hp:[110,130,155,180], dmg:[26,38,52,68], range:[270,300,330,360],
    speed:[30,32,36,40], atk:[5.0,4.6,4.0,3.4], r:13, armor:[0,1,1,2],
    siege:true, vsBuilding:3,
    cost:{wood:140,gold:90}, time:20, proj:[150,210,260,320], key:'0'},

  /* Tábori sebész: nem harcol, de egyesével talpra állítja a sebesülteket.
     Ha többen dolgoznak ugyanazon az egységen, a gyógyulás összeadódik. */
  medic:{names:['Borbély','Felcser','Tábori orvos','Szanitéc'],
    hp:[52,62,74,88], dmg:0, range:60, speed:[68,70,74,78], atk:1, r:9, armor:[0,1,1,2],
    heal:[5,6.5,8,10], cost:{food:60,gold:40}, time:10, key:'9'},
  fisher:{names:['Halászbárka','Halászhajó','Halászgőzös','Halászhajó'],
    hp:[75,90,110,130], dmg:0, range:22, speed:[64,68,74,80], atk:1, r:11, armor:0,
    naval:true, cost:{wood:70,food:30}, time:9,
    gather:[1.2,1.4,1.7,2.1], carry:18, key:'6'},
  warship:{names:['Hadigálya','Fregatt','Ágyúnaszád','Romboló'], crew:120, guns:[14,20],
    hp:[190,250,330,430], dmg:[16,26,38,54], range:[150,180,210,245],
    speed:[58,62,68,74], atk:[2.0,2.4,2.2,1.8], r:13, armor:[2,3,5,8],
    naval:true, cost:{wood:150,gold:90}, time:17, proj:[260,420,620,780], key:'7'},
  /* GÁLYA. A kalózvilág nehéz hajója: sok ágyú, vastag oldal, de lassú és
     drága. A küldött modell nyomán háromárbocos, kettős ágyúsorral. */
  galleon:{names:['Gálya','Gálya','Gálya','Gálya'], crew:340, guns:[40,60],
    hp:[340,420,520,640], dmg:[26,38,52,68], range:[170,200,230,260],
    speed:[46,50,54,58], atk:[2.4,2.6,2.4,2.0], r:16, armor:[4,5,7,10],
    naval:true, galleon:true, cost:{wood:260,gold:180}, time:26,
    proj:[260,420,620,780], key:'J'},

  /* Csapatszállító: fegyvertelen, de a szárazföldi seregét átviszi a vízen.
     Alapból tíz fő fér rá; az akadémián fokozatonként öttel több, huszonötig. */
  /* SZLÚP. A kalózok kedvence: gyors, sekély vízben is jár, nyolc-tizenkét
     ágyúval — és a legénységet is átviszi a partra. */
  transport:{names:['Szlúp','Szlúp','Szlúp','Szlúp'], crew:70, guns:[8,12],
    hp:[150,190,240,300], dmg:[10,14,19,25], range:[120,140,160,180], speed:[54,58,64,70], atk:1, r:14, armor:[1,2,3,5],
    naval:true, transport:true, proj:[220,340,480,600],
    cost:{wood:130,gold:40}, time:14, key:'8'}
};
const ROLES=['worker','melee','ranged','spear','cav','priest','medic','spy','siege','ram','siegetower','hero','fisher','warship','galleon','transport'];

// --- Épületek. A "trains" mező mondja meg, mit lehet bennük kiképezni. ---
const BUILDS={
  hq:{names:['Várkastély','Rezidencia','Kormányzati palota','Főparancsnokság'],
    w:104,h:104, hp:[1600,1950,2400,2900], cost:{wood:350,stone:250}, time:22,
    trains:['worker'], drop:true, key:'H'},
  barracks:{names:['Kaszárnya','Muskétás laktanya','Gyalogsági laktanya','Hadigyár'],
    w:80,h:80, hp:[820,980,1180,1450], cost:{wood:170,stone:60}, time:15,
    trains:['melee','ranged','spear','hero'], key:'K'},
  /* --- ISTÁLLÓ ---
     A lovasságot nem a kaszárnyában képzik: ló kell hozzá, abrak és
     lovász. A külön épület játékban is jelent valamit — aki lovasságot
     akar, annak be kell fektetnie előbb, és az istálló elvesztése
     elvágja az utánpótlását.

     Olcsóbb a kaszárnyánál, de fát és élelmet kér (a széna is élelem),
     nem követ. Kisebb és gyengébb: nem védőmű, hanem gazdasági épület. */
  stable:{names:['Istálló','Lovasistálló','Huszárlaktanya','Járműtelep'],
    w:76,h:68, hp:[620,720,860,1050], cost:{wood:150,food:80}, time:13,
    trains:['cav'], key:'I'},
  farm:{names:['Majorság','Uradalmi major','Gőzgépes farm','Gépesített farm'],
    w:56,h:56, hp:[300,340,400,470], cost:{wood:110}, time:8, food:[0.85,1.05,1.35,1.75], key:'F'},
  tower:{names:['Őrtorony','Csillagbástya','Erődtorony','Páncéltörő állás'],
    w:50,h:50, hp:[540,680,850,1050], cost:{wood:60,stone:130}, time:13,
    dmg:[14,20,27,28], range:[155,180,205,200], atk:[1.7,1.9,1.5,1.1], proj:[300,460,660,700], key:'T'},
  // Lakóház: minden kész ház öt fővel emeli a seregkeretet. Tízet lehet
  // felhúzni belőle — utána a keretet más módon kell bővíteni.
  house:{names:['Faház','Kőház','Polgárház','Lakótelep'],
    w:56,h:44, hp:[320,420,520,700], cost:{wood:90,stone:40}, time:10,
    pop:5, maxCount:10, key:'L'},
  airfield:{names:['—','—','—','Repülőtér'],
    w:104,h:74, hp:[1,1,1,1150], cost:{wood:300,stone:240,gold:150}, time:22,
    trains:['scout','fighter','bomber'], minAge:3, key:'R'},
  harbor:{names:['Halászkikötő','Kikötő','Kereskedőkikötő','Hadikikötő'],
    w:74,h:54, hp:[540,660,800,960], cost:{wood:200,stone:70}, time:15,
    trains:['fisher','warship','galleon','transport'], navalDrop:true, shore:true, key:'Y'},
  temple:{names:['Kolostor','Templom','Sajtóház','Propagandairoda'],
    w:70,h:60, hp:[560,690,830,990], cost:{wood:180,stone:110,gold:120}, time:16,
    trains:['priest'], key:'M'},
  /* Aranybánya: a szigetek aranyát bányássza. Kalózvárosokban áll. */
  goldmine:{names:['Aranybánya','Aranybánya','Aranybánya','Aranybánya'],
    w:62,h:52, hp:[420,520,640,780], cost:{wood:190,stone:90}, time:16,
    termel:{gold:0.8}, key:'B'},

  /* Cukornád-ültetvény: ebből lesz a rum, a kalózok fizetsége. */
  /* CUKORNÁD — csak a kalózvilágban.

     A karibi ültetvény a szigetvilág gazdaságának része; a magyar
     alföldön vagy a lengyel síkon semmi keresnivalója. A `kalozCsak`
     jelölés kiveszi az alapjáték építési listájából. */
  sugar:{names:['Cukornád-ültetvény','Cukornád-ültetvény','Cukornád-ültetvény','Cukornád-ültetvény'],
    w:66,h:54, hp:[380,470,580,700], cost:{wood:160,gold:60}, time:14,
    termel:{stone:0.8}, key:'C', kalozCsak:true},

  /* Favágótelep: a szigetek keményfáját dolgozza fel. */
  lumber:{names:['Favágótelep','Favágótelep','Favágótelep','Favágótelep'],
    w:64,h:52, hp:[360,450,560,680], cost:{wood:120,gold:50}, time:13,
    termel:{wood:0.8}, key:'N'},

  /* Piac: nyersanyagcsere mozgó árfolyamon. Ha elfogy a kő, de fád van
     bőven, itt átválthatod — de a piac nem ingyen dolgozik, és amiből
     sokat adsz el, annak esik az ára. */
  market:{names:['Piactér','Vásárcsarnok','Árutőzsde','Kereskedőház'],
    w:72,h:56, hp:[480,600,740,900], cost:{wood:180,stone:70,gold:40}, time:14,
    market:true, trains:['spy'], key:'P'},

  /* Kórház: a köré gyűlt sebesülteket lassan talpra állítja. Itt lehet
     tábori sebészt is toborozni, aki a fronton gyógyít. */
  hospital:{names:['Ispotály','Kórház','Klinika','Tábori kórház'],
    w:70,h:58, hp:[520,660,820,1000], cost:{wood:160,stone:90,gold:60}, time:15,
    heal:[2.2,2.8,3.4,4.2], healR:150, trains:['medic'], key:'J'},
  // Kovácsműhely: itt erősítjük a katonákat — fegyver, páncél, ellátmány.
  smith:{names:['Kovácsműhely','Fegyvertár','Gyártelep','Hadiüzem'],
    w:66,h:56, hp:[560,700,860,1040], cost:{wood:150,stone:110,gold:60}, time:15,
    research:'smith', trains:['siege','ram','siegetower'], key:'G'},
  academy:{names:['Akadémia','Akadémia','Politechnikum','Kutatóintézet'],
    w:76,h:64, hp:[620,760,920,1100], cost:{wood:200,stone:130,gold:90}, time:17,
    research:'academy', key:'U'},
  // A kapu nem építhető közvetlenül: meglévő falszakaszból alakítod át.
  gate:{names:['Várkapu','Bástyakapu','Vaskapu','Betonkapu'],
    w:32,h:32, hp:[620,800,1040,1450], cost:{wood:40,stone:40}, time:6, gate:true},
  wall:{names:['Kőfal','Bástyafal','Téglafal','Betonbunker'],
    w:32,h:32, hp:[520,680,880,1250], cost:{stone:30}, time:4, key:'V'}
};
const BUILD_ORDER=['hq','barracks','house','harbor','airfield','temple','hospital','market','smith','academy','farm','goldmine','sugar','lumber','tower','wall'];
const RES_NAMES={wood:'fa',stone:'kő',gold:'arany',food:'élelem',coal:'szén'};
