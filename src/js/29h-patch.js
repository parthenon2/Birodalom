/* =======================================================================
   29/H. FRISSÍTÉSFIGYELŐ

   Amikor új változat érkezik, a játékos szembesül vele, hogy „valami
   megváltozott" — de nem tudja, mi. A gombok a helyükön vannak, a
   mentése betöltődik, és fogalma sincs, hogy mondjuk a városok azóta
   visszalőnek.

   Ez az ablak az első indításkor megmutatja, mi az újdonság. Utána
   eltűnik, és csak a KÖVETKEZŐ változatnál jön elő újra.

   HOGYAN TUDJA, HOGY ÚJ?
   A legutóbb LÁTOTT változatszámot eltesszük a tárolóba. Ha az eltér a
   mostanitól, van mit mutatni. Első indításkor (nincs eltárolt szám)
   nem ugrik fel: aki most ismerkedik a játékkal, annak a változásnapló
   semmit nem mond.

   A LISTA a kódban él, nem a naplófájlban. Így nem kell külön fájlt
   szállítani, és a szöveg is fordítható.
   ===================================================================== */

const PATCH_TAR = 'birodalom_latott_valtozat';

/* Változatonként néhány mondat. A LEGFELSŐ a legfrissebb.

   Mit érdemes ide írni? Amit a játékos ÉSZREVESZ: új nemzet, új egység,
   megváltozott szabály. Amit nem: belső átszervezés, szétcsúszás-javítás
   — az a VALTOZASOK.md dolga. */
const PATCH_LISTA = [
  { v: '1.3',
    cim: { hu: 'Zászlók és egy régi hiba',
           en: 'Flags and an old bug',
           de: 'Flaggen und ein alter Fehler',
           zh: '旗帜与一个旧错误' },
    pontok: [
      { hu: 'A spanyol zászló egységesebb lett: telített vörös mező a kasztíliai várral, a többi nemzet mintájára.',
        en: 'The Spanish flag now matches the others: a solid red field with the Castilian castle.',
        de: 'Die spanische Flagge passt nun zu den anderen: rotes Feld mit kastilischer Burg.',
        zh: '西班牙旗帜现已与其他国家统一：红底配卡斯蒂利亚城堡。' },
      { hu: 'JAVÍTVA: a gyűjtésre épülő nemzeti előnyök eddig egyáltalán nem hatottak. Stede Bonnet +25% aranya mostantól tényleg működik.',
        en: 'FIXED: national bonuses based on gathering never applied. Stede Bonnet\u2019s +25% gold now actually works.',
        de: 'BEHOBEN: Nationalboni auf das Sammeln wirkten nie. Stede Bonnets +25% Gold funktioniert jetzt.',
        zh: '已修复：基于采集的文明加成此前完全无效。斯蒂德·邦内特的 +25% 黄金现已生效。' }
    ] },
  { v: '1.2',
    cim: { hu: 'Készülő nemzetek: építészet és öltözék',
           en: 'Upcoming nations: architecture and dress',
           de: 'Kommende Nationen: Architektur und Kleidung',
           zh: '开发中的文明：建筑与服饰' },
    pontok: [
      { hu: 'A hat készülő nemzet megkapta a saját építészetét: minaret, pagoda, mogul kupola, szaheli vályogfal, svéd faház.',
        en: 'The six upcoming nations now have their own architecture: minaret, pagoda, Mughal dome, Sahelian mud wall, Swedish timber house.',
        de: 'Die sechs kommenden Nationen haben eigene Architektur: Minarett, Pagode, Mogulkuppel, Lehmwand, schwedisches Holzhaus.',
        zh: '六个开发中的文明获得了各自的建筑风格：宣礼塔、宝塔、莫卧儿穹顶、萨赫勒泥墙、瑞典木屋。' },
      { hu: 'Új réteg az egységeken: a nemzeti öltözék. Szamuráj lemezpáncél, oszmán kaftán, szaheli köpeny, svéd szíjazat.',
        en: 'A new layer on units: national dress. Samurai lamellar armour, Ottoman kaftan, Sahelian robe, Swedish cross-belts.',
        de: 'Eine neue Ebene bei Einheiten: die Nationaltracht. Samurai-Lamellenpanzer, osmanischer Kaftan, Sahel-Gewand, schwedische Riemen.',
        zh: '单位新增图层：民族服饰。武士札甲、奥斯曼长袍、萨赫勒罩袍、瑞典交叉皮带。' },
      { hu: 'A nemzetek még nem választhatók — előbb ki kell próbálni, hogy az előnyeik nem billentik-e meg az egyensúlyt.',
        en: 'The nations are not selectable yet — their bonuses need balance testing first.',
        de: 'Die Nationen sind noch nicht w\u00e4hlbar — ihre Boni m\u00fcssen erst ausbalanciert werden.',
        zh: '这些文明尚不可选 — 需要先测试其加成是否平衡。' }
    ] },
  { v: '1.1',
    cim: { hu: 'Frissítésfigyelő',
           en: 'Update notice',
           de: 'Update-Hinweis',
           zh: '更新提示' },
    pontok: [
      { hu: 'Ez az ablak: frissítés után megmutatja, mi változott. Bezárás után lehet új játékot kezdeni.',
        en: 'This window: after an update it shows what changed. Close it to start a new game.',
        de: 'Dieses Fenster: nach einem Update zeigt es die Änderungen. Zum Spielen schließen.',
        zh: '这个窗口：更新后显示变更内容。关闭后即可开始新游戏。' },
      { hu: 'A háttérben hat új nemzet készül: Svédország, Oszmán Birodalom, Japán, Kína, India, Mali. Még nem választhatók.',
        en: 'Six new nations are in preparation: Sweden, the Ottoman Empire, Japan, China, India and Mali. Not yet selectable.',
        de: 'Sechs neue Nationen entstehen: Schweden, Osmanisches Reich, Japan, China, Indien, Mali. Noch nicht wählbar.',
        zh: '六个新文明正在开发中：瑞典、奥斯曼帝国、日本、中国、印度、马里。尚不可选。' }
    ] },
  { v: '1.0',
    cim: { hu: 'A számozás újraindul',
           en: 'Version numbering restarts',
           de: 'Versionsnummerierung beginnt neu',
           zh: '版本号重新开始' },
    pontok: [
      { hu: 'A verziószám 1.0-tól számol. A játék ugyanaz, csak a számozás kezd elölről.',
        en: 'Version numbers start from 1.0. The game is unchanged; only the numbering restarts.',
        de: 'Die Versionsnummern beginnen bei 1.0. Das Spiel bleibt gleich.',
        zh: '版本号从 1.0 开始计数。游戏内容不变。' },
      { hu: 'Többjátékosban a házigazda gépén magától elindul a szerver — nem kell külön futtatni semmit.',
        en: 'In multiplayer the server now starts on the host\u2019s machine automatically.',
        de: 'Im Mehrspielermodus startet der Server automatisch beim Gastgeber.',
        zh: '多人游戏中，服务器会在房主的电脑上自动启动。' },
      { hu: 'A szobában mindenki jelezheti, hogy készen áll; a beállításokat a házigazda intézi.',
        en: 'In the room everyone can mark themselves ready; the host controls the settings.',
        de: 'Im Raum kann jeder bereit melden; die Einstellungen macht der Gastgeber.',
        zh: '房间中所有人都可以标记准备就绪；设置由房主控制。' },
      { hu: 'A kalózvárosok visszalőnek a hajókra — messzebbről, mint ameddig te ellősz.',
        en: 'Pirate towns now fire back at ships — from farther than your guns reach.',
        de: 'Piratenst\u00e4dte schie\u00dfen jetzt zur\u00fcck — weiter, als deine Gesch\u00fctze reichen.',
        zh: '海盗城镇现在会向船只还击 — 射程比你更远。' }
    ] }
];

function patchSzoveg(mezo){
  const ny = (typeof LANG === 'string') ? LANG : 'hu';
  return mezo[ny] || mezo.hu;
}

/* Van-e mit mutatni? Akkor igen, ha volt már eltárolt változat, és az
   eltér a mostanitól. */
function patchVan(){
  if(typeof GAME_VERSION === 'undefined') return false;
  let latott = null;
  try{ latott = tarolOlvas(PATCH_TAR); }catch(e){}
  if(!latott){
    /* ELSŐ INDÍTÁS: nem mutatunk semmit, csak feljegyezzük, hol tartunk.
       Aki most ismerkedik a játékkal, annak a változásnapló zaj. */
    try{ tarolIr(PATCH_TAR, GAME_VERSION); }catch(e){}
    return false;
  }
  return latott !== GAME_VERSION;
}

function patchMutat(){
  const doboz = document.getElementById('patchBox');
  if(!doboz) return;
  const lap = document.getElementById('patchLap');
  if(!lap) return;
  lap.innerHTML = '';

  /* A LEGFRISSEBB változat bejegyzése — és minden, ami a legutóbb látott
     óta jött. Ha valaki két változatot ugrott, mindkettőt látja. */
  let latott = null;
  try{ latott = tarolOlvas(PATCH_TAR); }catch(e){}
  let mutatunk = 0;
  for(const be of PATCH_LISTA){
    if(latott && be.v === latott) break;      // eddig már látta
    const fej = document.createElement('div');
    fej.className = 'patchFej';
    fej.textContent = be.v + ' — ' + patchSzoveg(be.cim);
    lap.appendChild(fej);
    const ul = document.createElement('ul');
    ul.className = 'patchLista';
    for(const p of be.pontok){
      const li = document.createElement('li');
      li.textContent = patchSzoveg(p);
      ul.appendChild(li);
    }
    lap.appendChild(ul);
    mutatunk++;
    if(mutatunk >= 3) break;                  // háromnál többet nem olvas el senki
  }
  if(!mutatunk) return;

  const cim = document.getElementById('patchCim');
  if(cim) cim.textContent = T('patchCim');
  doboz.style.display = 'flex';
}

/* Bezárás: feljegyezzük, hogy ezt a változatot már látta. Innentől
   ugyanez a szám nem hozza elő újra. */
function patchZar(){
  const doboz = document.getElementById('patchBox');
  if(doboz) doboz.style.display = 'none';
  try{ tarolIr(PATCH_TAR, GAME_VERSION); }catch(e){}
  if(typeof SFX !== 'undefined'){ SFX.init(); SFX.play('click'); }
}

/* Indításkor: ha van újdonság, megmutatjuk. A menü fölött jelenik meg,
   tehát a játékos nem tud mellette új játékot kezdeni — pont ez a cél. */
function patchIndul(){
  try{ if(patchVan()) patchMutat(); }catch(e){}
}
