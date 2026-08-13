/* =======================================================================
   2/D. NEMZETNEVEK, ÁLLAMFORMÁK ÉS URALKODÓNEVEK

   A `NATIONS` tábla három szöveges mezője magyarul íródott:

     name   — a nemzet neve („Magyarország”)
     eras   — korszakonkénti államforma („Magyar Királyság”)
     rulers — korszakonkénti uralkodó („Hunyadi Mátyás”)

   Az életrajzok (22d) már fordulnak, ezek viszont nem — így a bemutatkozó
   kártyán keveredtek a nyelvek: német leírás magyar névvel.

   A NEVEK fordítása nem szó szerinti átültetés. Az uralkodók a legtöbb
   nyelvben saját, meghonosodott alakban élnek: Hunyadi Mátyás angolul
   Matthias Corvinus, németül Matthias Corvinus, kínaiul 马加什一世. Ahol
   nincs meghonosodott alak (Charles de Gaulle, Winston Churchill), ott az
   eredeti marad — a magyar szöveg is így hozza.

   A magyar sorrend (vezetéknév elöl) a másik három nyelvben megfordul:
   „Kossuth Lajos” → „Lajos Kossuth”, „Bismarck Ottó” → „Otto von
   Bismarck”. Ez nem stílus kérdése, hanem a névhasználaté.
   ===================================================================== */

const NEMZET_FORD = {

 hu:{ en:{name:'Hungary',
          eras:['Kingdom of Hungary','Kingdom of Hungary','Hungary','Hungary'],
          rulers:['Matthias Corvinus','Francis II Rákóczi','Lajos Kossuth','Miklós Horthy']},
      de:{name:'Ungarn',
          eras:['Königreich Ungarn','Königreich Ungarn','Ungarn','Ungarn'],
          rulers:['Matthias Corvinus','Franz II. Rákóczi','Lajos Kossuth','Miklós Horthy']},
      zh:{name:'匈牙利',
          eras:['匈牙利王国','匈牙利王国','匈牙利','匈牙利'],
          rulers:['马加什一世','拉科齐·费伦茨二世','科苏特·拉约什','霍尔蒂·米克洛什']}},

 ns:{ en:{name:'Nassau',
          eras:['The Pirate Republic','The Pirate Republic','The Pirate Republic','The Pirate Republic'],
          rulers:['Benjamin Hornigold','Charles Vane','Jack Rackham','Anne Bonny']},
      de:{name:'Nassau',
          eras:['Die Piratenrepublik','Die Piratenrepublik','Die Piratenrepublik','Die Piratenrepublik'],
          rulers:['Benjamin Hornigold','Charles Vane','Jack Rackham','Anne Bonny']},
      zh:{name:'拿骚',
          eras:['海盗共和国','海盗共和国','海盗共和国','海盗共和国'],
          rulers:['本杰明·霍尼戈尔德','查尔斯·韦恩','杰克·拉克姆','安妮·邦尼']}},

 bb:{ en:{name:'Blackbeard',
          eras:['Queen Anne\u2019s Revenge','Queen Anne\u2019s Revenge','Queen Anne\u2019s Revenge','Queen Anne\u2019s Revenge'],
          rulers:['Edward Teach','Edward Teach','Edward Teach','Edward Teach']},
      de:{name:'Blackbeard',
          eras:['Queen Anne\u2019s Revenge','Queen Anne\u2019s Revenge','Queen Anne\u2019s Revenge','Queen Anne\u2019s Revenge'],
          rulers:['Edward Teach','Edward Teach','Edward Teach','Edward Teach']},
      zh:{name:'黑胡子',
          eras:['安妮女王复仇号','安妮女王复仇号','安妮女王复仇号','安妮女王复仇号'],
          rulers:['爱德华·蒂奇','爱德华·蒂奇','爱德华·蒂奇','爱德华·蒂奇']}},

 sb:{ en:{name:'Stede Bonnet',
          eras:['The Gentleman Pirate','The Gentleman Pirate','The Gentleman Pirate','The Gentleman Pirate'],
          rulers:['Stede Bonnet','Stede Bonnet','Stede Bonnet','Stede Bonnet']},
      de:{name:'Stede Bonnet',
          eras:['Der Gentleman-Pirat','Der Gentleman-Pirat','Der Gentleman-Pirat','Der Gentleman-Pirat'],
          rulers:['Stede Bonnet','Stede Bonnet','Stede Bonnet','Stede Bonnet']},
      zh:{name:'斯蒂德·邦尼特',
          eras:['绅士海盗','绅士海盗','绅士海盗','绅士海盗'],
          rulers:['斯蒂德·邦尼特','斯蒂德·邦尼特','斯蒂德·邦尼特','斯蒂德·邦尼特']}},

 nat:{en:{name:'Islanders',
          eras:['Taíno peoples','Taíno peoples','Taíno peoples','Taíno peoples'],
          rulers:['Guacanagarí','Hatuey','Anacaona','Caonabo']},
      de:{name:'Inselbewohner',
          eras:['Taíno-Stämme','Taíno-Stämme','Taíno-Stämme','Taíno-Stämme'],
          rulers:['Guacanagarí','Hatuey','Anacaona','Caonabo']},
      zh:{name:'岛民',
          eras:['泰诺部族','泰诺部族','泰诺部族','泰诺部族'],
          rulers:['瓜卡纳加里','阿图埃','阿纳卡奥娜','卡奥纳沃']}},

 es:{ en:{name:'Spain',
          eras:['Castile and Aragon','Spanish Empire','Kingdom of Spain','Spain'],
          rulers:['Ferdinand of Aragon','Philip II','Charles III','Francisco Franco']},
      de:{name:'Spanien',
          eras:['Kastilien und Aragón','Spanisches Weltreich','Königreich Spanien','Spanien'],
          rulers:['Ferdinand von Aragón','Philipp II.','Karl III.','Francisco Franco']},
      zh:{name:'西班牙',
          eras:['卡斯蒂利亚与阿拉贡','西班牙帝国','西班牙王国','西班牙'],
          rulers:['阿拉贡的费迪南德','腓力二世','卡洛斯三世','弗朗西斯科·佛朗哥']}},

 at:{ en:{name:'Austria',
          eras:['Duchy of Austria','Habsburg Empire','Austria-Hungary','Austria'],
          rulers:['Frederick III','Leopold I','Franz Joseph I','Charles I']},
      de:{name:'Österreich',
          eras:['Herzogtum Österreich','Habsburgerreich','Österreich-Ungarn','Österreich'],
          rulers:['Friedrich III.','Leopold I.','Franz Joseph I.','Karl I.']},
      zh:{name:'奥地利',
          eras:['奥地利公国','哈布斯堡帝国','奥匈帝国','奥地利'],
          rulers:['腓特烈三世','利奥波德一世','弗朗茨·约瑟夫一世','卡尔一世']}},

 pl:{ en:{name:'Poland',
          eras:['Kingdom of Poland','Polish-Lithuanian Union','Poland','Republic of Poland'],
          rulers:['Casimir IV','John III Sobieski','Tadeusz Kościuszko','Józef Piłsudski']},
      de:{name:'Polen',
          eras:['Königreich Polen','Polnisch-Litauische Union','Polen','Republik Polen'],
          rulers:['Kasimir IV.','Johann III. Sobieski','Tadeusz Kościuszko','Józef Piłsudski']},
      zh:{name:'波兰',
          eras:['波兰王国','波兰立陶宛联合','波兰','波兰共和国'],
          rulers:['卡齐米日四世','扬三世·索别斯基','塔德乌什·科希丘什科','约瑟夫·毕苏斯基']}},

 de:{ en:{name:'Germany',
          eras:['Holy Roman Empire','Brandenburg-Prussia','German Empire','Germany'],
          rulers:['Maximilian I','Frederick William','Otto von Bismarck','Paul von Hindenburg']},
      de:{name:'Deutschland',
          eras:['Heiliges Römisches Reich','Brandenburg-Preußen','Deutsches Kaiserreich','Deutschland'],
          rulers:['Maximilian I.','Friedrich Wilhelm','Otto von Bismarck','Paul von Hindenburg']},
      zh:{name:'德国',
          eras:['神圣罗马帝国','勃兰登堡—普鲁士','德意志帝国','德国'],
          rulers:['马克西米利安一世','腓特烈·威廉','奥托·冯·俾斯麦','保罗·冯·兴登堡']}},

 fr:{ en:{name:'France',
          eras:['Kingdom of France','Kingdom of France','French Empire','French Republic'],
          rulers:['Louis XI','Louis XIV','Napoleon Bonaparte','Charles de Gaulle']},
      de:{name:'Frankreich',
          eras:['Königreich Frankreich','Königreich Frankreich','Französisches Kaiserreich','Französische Republik'],
          rulers:['Ludwig XI.','Ludwig XIV.','Napoleon Bonaparte','Charles de Gaulle']},
      zh:{name:'法国',
          eras:['法兰西王国','法兰西王国','法兰西帝国','法兰西共和国'],
          rulers:['路易十一','路易十四','拿破仑·波拿巴','夏尔·戴高乐']}},

 gb:{ en:{name:'Great Britain',
          eras:['England','England','Great Britain','Great Britain'],
          rulers:['Henry VII','Oliver Cromwell','Queen Victoria','Winston Churchill']},
      de:{name:'Großbritannien',
          eras:['England','England','Großbritannien','Großbritannien'],
          rulers:['Heinrich VII.','Oliver Cromwell','Königin Victoria','Winston Churchill']},
      zh:{name:'大不列颠',
          eras:['英格兰','英格兰','大不列颠','大不列颠'],
          rulers:['亨利七世','奥利弗·克伦威尔','维多利亚女王','温斯顿·丘吉尔']}},

 ru:{ en:{name:'Russia',
          eras:['Grand Duchy of Moscow','Tsardom of Russia','Russian Empire','Russian Empire'],
          rulers:['Ivan III','Peter the Great','Alexander I','Nicholas II']},
      de:{name:'Russland',
          eras:['Großfürstentum Moskau','Zarentum Russland','Russisches Kaiserreich','Russisches Kaiserreich'],
          rulers:['Iwan III.','Peter der Große','Alexander I.','Nikolaus II.']},
      zh:{name:'俄罗斯',
          eras:['莫斯科大公国','俄罗斯沙皇国','俄罗斯帝国','俄罗斯帝国'],
          rulers:['伊凡三世','彼得大帝','亚历山大一世','尼古拉二世']}}
,

 /* --- KÉSZÜLŐ NEMZETEK ---
    Ugyanaz az elv, mint a többinél: az uralkodók meghonosodott alakban
    állnak, a magyar névsorrend a másik három nyelvben megfordul. */
 se:{ en:{name:'Sweden',
          eras:['Kalmar Union','Swedish Empire','Sweden-Norway','Sweden'],
          rulers:['Gustav Vasa','Gustavus Adolphus','Charles XIV John','Dag Hammarskjöld']},
      de:{name:'Schweden',
          eras:['Kalmarer Union','Schwedisches Reich','Schweden-Norwegen','Schweden'],
          rulers:['Gustav Wasa','Gustav II. Adolf','Karl XIV. Johann','Dag Hammarskjöld']},
      zh:{name:'瑞典',
          eras:['卡尔马联合','瑞典帝国','瑞典—挪威联合','瑞典'],
          rulers:['古斯塔夫·瓦萨','古斯塔夫二世·阿道夫','卡尔十四世·约翰','达格·哈马舍尔德']}},

 ot:{ en:{name:'Ottoman Empire',
          eras:['Ottoman Sultanate','Ottoman Empire','Ottoman Empire','Republic of Turkey'],
          rulers:['Mehmed II','Suleiman the Magnificent','Mahmud II','Mustafa Kemal Atatürk']},
      de:{name:'Osmanisches Reich',
          eras:['Osmanisches Sultanat','Osmanisches Reich','Osmanisches Reich','Republik Türkei'],
          rulers:['Mehmed II.','Süleyman der Prächtige','Mahmud II.','Mustafa Kemal Atatürk']},
      zh:{name:'奥斯曼帝国',
          eras:['奥斯曼苏丹国','奥斯曼帝国','奥斯曼帝国','土耳其共和国'],
          rulers:['穆罕默德二世','苏莱曼大帝','马哈茂德二世','穆斯塔法·凯末尔·阿塔图尔克']}},

 jp:{ en:{name:'Japan',
          eras:['Muromachi Shogunate','Tokugawa Shogunate','Empire of Japan','Empire of Japan'],
          rulers:['Ashikaga Yoshimasa','Tokugawa Ieyasu','Emperor Meiji','Emperor Hirohito']},
      de:{name:'Japan',
          eras:['Muromachi-Shogunat','Tokugawa-Shogunat','Kaiserreich Japan','Kaiserreich Japan'],
          rulers:['Ashikaga Yoshimasa','Tokugawa Ieyasu','Kaiser Meiji','Kaiser Hirohito']},
      zh:{name:'日本',
          eras:['室町幕府','德川幕府','大日本帝国','大日本帝国'],
          rulers:['足利义政','德川家康','明治天皇','裕仁天皇']}},

 cn:{ en:{name:'China',
          eras:['Ming Dynasty','Qing Dynasty','Qing Dynasty','Republic of China'],
          rulers:['Yongle Emperor','Kangxi Emperor','Empress Dowager Cixi','Sun Yat-sen']},
      de:{name:'China',
          eras:['Ming-Dynastie','Qing-Dynastie','Qing-Dynastie','Republik China'],
          rulers:['Yongle-Kaiser','Kangxi-Kaiser','Kaiserinwitwe Cixi','Sun Yat-sen']},
      zh:{name:'中国',
          eras:['明朝','清朝','清朝','中华民国'],
          rulers:['永乐帝','康熙帝','慈禧太后','孙中山']}},

 in:{ en:{name:'India',
          eras:['Delhi Sultanate','Mughal Empire','British India','India'],
          rulers:['Akbar the Great','Aurangzeb','Rani Lakshmibai','Mahatma Gandhi']},
      de:{name:'Indien',
          eras:['Sultanat von Delhi','Mogulreich','Britisch-Indien','Indien'],
          rulers:['Akbar der Große','Aurangzeb','Rani Lakshmibai','Mahatma Gandhi']},
      zh:{name:'印度',
          eras:['德里苏丹国','莫卧儿帝国','英属印度','印度'],
          rulers:['阿克巴大帝','奥朗则布','拉克希米·芭伊','圣雄甘地']}},

 ml:{ en:{name:'Mali Empire',
          eras:['Mali Empire','Mali Empire','Songhai Empire','Songhai Empire'],
          rulers:['Mansa Musa I','Mansa Suleyman','Sonni Ali','Askia Muhammad']},
      de:{name:'Mali-Reich',
          eras:['Mali-Reich','Mali-Reich','Songhai-Reich','Songhai-Reich'],
          rulers:['Mansa Musa I.','Mansa Suleyman','Sonni Ali','Askia Muhammad']},
      zh:{name:'马里帝国',
          eras:['马里帝国','马里帝国','桑海帝国','桑海帝国'],
          rulers:['曼萨·穆萨一世','曼萨·苏莱曼','桑尼·阿里','阿斯基亚·穆罕默德']}}
};

/* A három lekérdező. Mindegyik a magyarra esik vissza, ha az adott
   nyelvhez nincs bejegyzés — így egy hiányzó fordítás sosem hagy üres
   feliratot a kártyán. */
function nemzetNev(kulcs){
  const n = NATIONS[kulcs];
  if(!n) return kulcs;
  const f = NEMZET_FORD[kulcs];
  const ny = (typeof LANG === 'string') ? LANG : 'hu';
  return (ny !== 'hu' && f && f[ny] && f[ny].name) || n.name;
}
function allamForma(kulcs, kor){
  const n = NATIONS[kulcs];
  if(!n || !n.eras) return '';
  const f = NEMZET_FORD[kulcs];
  const ny = (typeof LANG === 'string') ? LANG : 'hu';
  const t = (ny !== 'hu' && f && f[ny] && f[ny].eras) || n.eras;
  return t[kor] || n.eras[kor] || '';
}
function uralkodoNev(kulcs, kor){
  const n = NATIONS[kulcs];
  if(!n || !n.rulers) return '';
  const f = NEMZET_FORD[kulcs];
  const ny = (typeof LANG === 'string') ? LANG : 'hu';
  const t = (ny !== 'hu' && f && f[ny] && f[ny].rulers) || n.rulers;
  return t[kor] || n.rulers[kor] || '';
}
