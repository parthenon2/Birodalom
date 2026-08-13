/* =======================================================================
   0/C. NYELVEK

   Négy nyelv: magyar, angol, német, kínai. A rendszer két részből áll:

     T(kulcs)        — felületi szövegek szótárból
     NEVEK           — az egységek, épületek, korszakok és nemzetek nevei

   Ami MÉG magyarul marad: a küldetések eligazításai, az uralkodók
   életrajzai és az ideológiák leírásai. Ezek együtt 150 kilobájtnyi
   folyó szöveg; szakaszosan fordulnak át, patchenként egy-egy blokk.
   A játék ettől használható marad idegen nyelven is, mert amit játék
   közben olvasol — gombok, nevek, üzenetek — le van fordítva.
   ===================================================================== */

const NYELVEK=[
  {k:'hu', nev:'Magyar'},
  {k:'en', nev:'English'},
  {k:'de', nev:'Deutsch'},
  {k:'zh', nev:'中文'}
];
let LANG='hu';

/* --- Felületi szövegek --- */
const SZOTAR={
  // gombok, menü
  ujJatek:      {hu:'Új játék',        en:'New game',       de:'Neues Spiel',    zh:'新游戏'},
  folytatas:    {hu:'Folytatás',       en:'Continue',       de:'Fortsetzen',     zh:'继续'},
  teljesitmeny: {hu:'Teljesítmények',  en:'Achievements',   de:'Erfolge',        zh:'成就'},
  beallitasok:  {hu:'Beállítások',     en:'Settings',       de:'Einstellungen',  zh:'设置'},
  oktatomod:    {hu:'Oktatómód',       en:'Tutorial',       de:'Tutorial',       zh:'教程'},
  ujdonsagok:   {hu:'Újdonságok',      en:'What\\u2019s new', de:'Neuigkeiten',  zh:'更新内容'},
  betoltesFajl: {hu:'Betöltés fájlból',en:'Load from file', de:'Datei laden',    zh:'从文件载入'},
  vissza:       {hu:'Vissza',          en:'Back',           de:'Zurück',         zh:'返回'},
  indit:        {hu:'Indítás',         en:'Start',          de:'Starten',        zh:'开始'},
  szabadJatek:  {hu:'Szabad játék',    en:'Skirmish',       de:'Freies Spiel',   zh:'自由战斗'},
  hadjarat:     {hu:'Hadjárat',        en:'Campaign',       de:'Feldzug',        zh:'战役'},
  kalozok:      {hu:'Kalózok',         en:'Pirates',        de:'Piraten',        zh:'海盗'},
  // nyersanyagok
  fa:    {hu:'FA',     en:'WOOD',  de:'HOLZ',   zh:'木材'},
  ko:    {hu:'KŐ',     en:'STONE', de:'STEIN',  zh:'石料'},
  arany: {hu:'ARANY',  en:'GOLD',  de:'GOLD',   zh:'黄金'},
  elelem:{hu:'ÉLELEM', en:'FOOD',  de:'NAHRUNG',zh:'食物'},
  szen:  {hu:'SZÉN',   en:'COAL',  de:'KOHLE',  zh:'煤炭'},
  sereg: {hu:'SEREG',  en:'ARMY',  de:'ARMEE',  zh:'军队'},
  // szünet menü
  gyorsMentes:  {hu:'Gyors mentés',   en:'Quick save',   de:'Schnellspeichern', zh:'快速保存'},
  gyorsBetoltes:{hu:'Gyors betöltés', en:'Quick load',   de:'Schnellladen',     zh:'快速读取'},
  mentes:       {hu:'Mentés',         en:'Save',         de:'Speichern',        zh:'保存'},
  mentesFajlba: {hu:'Mentés fájlba (átvitelhez)', en:'Save to file (transfer)',
                 de:'In Datei speichern', zh:'保存到文件'},
  szunet:       {hu:'Szünet',         en:'Pause',        de:'Pause',            zh:'暂停'},
  billentyuk:   {hu:'Billentyűk',     en:'Keys',         de:'Tasten',           zh:'按键'},
  hangeffekt:   {hu:'Hangeffektek',   en:'Sound effects',de:'Soundeffekte',     zh:'音效'},
  zene:         {hu:'Zene',           en:'Music',        de:'Musik',            zh:'音乐'},
  foMenube:     {hu:'Kilépés a főmenübe', en:'Quit to main menu',
                 de:'Zurück zum Hauptmenü', zh:'退出到主菜单'},
  // parancssáv
  epites:   {hu:'ÉPÍTÉS',   en:'BUILD',   de:'BAU',       zh:'建造'},
  toborzas: {hu:'TOBORZÁS', en:'TRAIN',   de:'AUSBILDEN', zh:'招募'},
  bezaras:  {hu:'BEZÁRÁS',  en:'CLOSE',   de:'SCHLIESSEN',zh:'关闭'},
  harciAllas:{hu:'Harci állás', en:'Stance', de:'Haltung', zh:'战斗姿态'},
  alakzat:  {hu:'Alakzat',  en:'Formation',de:'Formation',zh:'阵型'},
  tamado:   {hu:'Támadó',   en:'Aggressive',de:'Angriff', zh:'进攻'},
  tartsd:   {hu:'Tartsd',   en:'Hold',     de:'Halten',   zh:'坚守'},
  visszavonul:{hu:'Visszavonul', en:'Retreat', de:'Rückzug', zh:'撤退'},
  vonal:    {hu:'Vonal',    en:'Line',     de:'Linie',    zh:'横队'},
  ek:       {hu:'Ék',       en:'Wedge',    de:'Keil',     zh:'楔形'},
  negyszog: {hu:'Négyszög', en:'Square',   de:'Karree',   zh:'方阵'},
  nincsKijeloles:{hu:'Nincs kijelölés', en:'Nothing selected',
                  de:'Nichts ausgewählt', zh:'未选择'},
  // beállítások
  nyelv:     {hu:'Nyelv',        en:'Language',   de:'Sprache',   zh:'语言'},
  kepmeret:  {hu:'Képméret',     en:'Resolution', de:'Auflösung', zh:'分辨率'},
  idojaras:  {hu:'Időjárás',     en:'Weather',    de:'Wetter',    zh:'天气'},
  nappalEjjel:{hu:'Nappal és éjszaka', en:'Day and night',
               de:'Tag und Nacht', zh:'昼夜'},
  gorgetes:  {hu:'Görgetés',     en:'Scrolling',  de:'Scrollen',  zh:'滚动'},
  be:        {hu:'be',           en:'on',         de:'an',        zh:'开'},
  ki:        {hu:'ki',           en:'off',        de:'aus',       zh:'关'},
  // korszakok
  szazad15:{hu:'15. század', en:'15th century', de:'15. Jahrhundert', zh:'15世纪'},
  szazad17:{hu:'17. század', en:'17th century', de:'17. Jahrhundert', zh:'17世纪'},
  szazad19:{hu:'19. század', en:'19th century', de:'19. Jahrhundert', zh:'19世纪'},
  szazad20:{hu:'20. század', en:'20th century', de:'20. Jahrhundert', zh:'20世纪'},
  // parancssáv címei
  cimEpites:  {hu:'Építés — munkások', en:'Build — workers', de:'Bau — Arbeiter', zh:'建造 — 工人'},
  cimKikepzes:{hu:'Kiképzés',   en:'Training',  de:'Ausbildung', zh:'训练'},
  cimPiac:    {hu:'Piac — árfolyam', en:'Market — prices', de:'Markt — Preise', zh:'市场 — 价格'},
  cimHos:     {hu:'Hős',        en:'Hero',      de:'Held',      zh:'英雄'},
  cimKem:     {hu:'Kémkedés',   en:'Espionage', de:'Spionage',  zh:'谍报'},
  cimEpulet:  {hu:'Épület',     en:'Building',  de:'Gebäude',   zh:'建筑'},
  cimFejlesztes:{hu:'Fejlesztés — akadémia', en:'Research — academy',
                 de:'Forschung — Akademie', zh:'研究 — 学院'},
  cimParancs: {hu:'Parancsok',  en:'Orders',    de:'Befehle',   zh:'命令'},
  // gyakori üzenetek
  uzKolonia:  {hu:'Kolónia — válassz épületet, és jelöld ki a helyét a szigeten. A legénység magától felhúzza.',
               en:'Colony — pick a building and mark its place on the island. The crew raises it on its own.',
               de:'Kolonie — wähle ein Gebäude und markiere den Platz auf der Insel. Die Mannschaft baut es selbst.',
               zh:'殖民地 — 选择建筑并在岛上标记位置，船员会自行建造。'},
  uzNincsAnyag:{hu:'Nincs elég nyersanyag', en:'Not enough resources',
                de:'Nicht genug Rohstoffe', zh:'资源不足'},
  uzKeret:    {hu:'Elérted a seregkeretet.', en:'Army limit reached.',
               de:'Armeegrenze erreicht.',  zh:'已达军队上限。'},
  uzEhezes:   {hu:'Kifogyott az élelem! A sereg gyengül — építs majorságot.',
               en:'Out of food! Your army weakens — build a farm.',
               de:'Keine Nahrung mehr! Deine Armee schwächt — baue einen Bauernhof.',
               zh:'食物耗尽！军队正在衰弱 — 请建造农场。'},
  // város
  varosEpulet:{hu:'épület',  en:'buildings', de:'Gebäude',  zh:'建筑'},
  varosEllen: {hu:'ellenséges', en:'enemy',  de:'feindlich',zh:'敌方'},
  varosSemleges:{hu:'semleges', en:'neutral',de:'neutral',  zh:'中立'},
  varosElelem:{hu:'élelem',  en:'food',      de:'Nahrung',  zh:'食物'},
  achElerve:{hu:'elérve', en:'unlocked', de:'erreicht', zh:'已达成'},
  rum:   {hu:'RUM',    en:'RUM',   de:'RUM',    zh:'朗姆酒'}
};
/* --- A felület további szövegei ---
   Az első kiadásban csak a gombok egy része volt a szótárban, ezért idegen
   nyelvre váltva a beállítások, a billentyűlista, a nyersanyagsáv és a
   játék közbeni üzenetek magyarul maradtak. Innentől minden felületi
   szöveg itt él. Ami MÉG magyarul marad: a küldetések eligazításai, az
   uralkodók életrajzai és az ideológiák leírásai — ezek folyó szövegek,
   külön ütemben fordulnak. */
Object.assign(SZOTAR,{
  mFolytatas:{hu:'Folytatás',en:'Continue',de:'Fortsetzen',zh:'继续'},
  tobbjatekos:{hu:'Többjátékos',en:'Multiplayer',de:'Mehrspieler',zh:'多人游戏'},
  visszajatszasNyit:{hu:'Visszajátszás megnyitása',en:'Open replay',de:'Wiederholung öffnen',zh:'打开回放'},
  kilepes:{hu:'Kilépés',en:'Quit',de:'Beenden',zh:'退出'},
  kilepesBiztos:{hu:'Biztos? Kattints újra',en:'Sure? Click again',de:'Sicher? Nochmal klicken',zh:'确定？再点一次'},
  mentetlenElvesz:{hu:'A nem mentett állás elvész.',en:'Unsaved progress will be lost.',de:'Nicht gespeicherter Fortschritt geht verloren.',zh:'未保存的进度将会丢失。'},
  nemZarhatoBe:{hu:'A böngésző nem engedi bezárni a lapot — zárd be te, vagy lépj vissza egy másik oldalra.',en:'The browser will not close the tab — close it yourself, or go back to another page.',de:'Der Browser schließt den Tab nicht — schließe ihn selbst oder gehe zurück.',zh:'浏览器不允许关闭此标签页 — 请自行关闭，或返回其他页面。'},
  fejleszto:{hu:'Fejlesztő',en:'Developer',de:'Entwickler',zh:'开发者'},
  szNehezseg:{hu:'Nehézség',en:'Difficulty',de:'Schwierigkeit',zh:'难度'},
  szKorszak:{hu:'Kezdő korszak',en:'Starting age',de:'Startzeitalter',zh:'起始时代'},
  szTaj:{hu:'Táj',en:'Terrain',de:'Landschaft',zh:'地形'},
  szJatekmod:{hu:'Játékmód',en:'Game mode',de:'Spielmodus',zh:'游戏模式'},
  szNemzet:{hu:'Nemzet',en:'Nation',de:'Nation',zh:'国家'},
  valasszNemzetet:{hu:'Válassz nemzetet',en:'Choose a nation',de:'Wähle eine Nation',zh:'选择国家'},
  valasszNemzetInfo:{hu:'Válassz nemzetet — mindegyik saját nemzeti előnnyel játszik.',en:'Choose a nation — each one plays with its own national advantage.',de:'Wähle eine Nation — jede spielt mit ihrem eigenen Vorteil.',zh:'选择国家 — 每个国家都有自己的民族优势。'},
  nagyobbKeszlet:{hu:' — nagyobb induló készlettel indulsz',en:' — you start with larger stockpiles',de:' — du startest mit größeren Vorräten',zh:'（起始资源更多）'},
  kuldTeljesitve:{hu:'teljesítve',en:'completed',de:'abgeschlossen',zh:'已完成'},
  szerverCime:{hu:'Szerver címe',en:'Server address',de:'Serveradresse',zh:'服务器地址'},
  szobaNyitasa:{hu:'Szoba nyitása',en:'Open a room',de:'Raum öffnen',zh:'创建房间'},
  csatlakozas:{hu:'Csatlakozás',en:'Join',de:'Beitreten',zh:'加入'},
  szobakod:{hu:'SZOBAKÓD',en:'ROOM CODE',de:'RAUMCODE',zh:'房间代码'},
  nincsKapcsolat:{hu:'Nincs kapcsolat.',en:'Not connected.',de:'Keine Verbindung.',zh:'未连接。'},
  netSugo:{hu:'A szerver a saját géped: node szerver.js — a címet ws:// előtaggal és a kapuval együtt kell megadni. A házigazda kap egy négybetűs kódot; ezt add meg a másik gépen.',en:'The server is your own machine: node szerver.js — give the address with the ws:// prefix and the port. The host receives a four-letter code; enter it on the other machine.',de:'Der Server ist dein eigener Rechner: node szerver.js — gib die Adresse mit ws://-Präfix und Port an. Der Gastgeber erhält einen vierstelligen Code; gib ihn am anderen Rechner ein.',zh:'服务器就是你自己的电脑：node szerver.js — 地址需带 ws:// 前缀和端口号。房主会得到一个四位代码，在另一台电脑上输入即可。'},
  netSzobaNyitva:{hu:'Szoba nyitva. A kód',en:'Room open. The code is',de:'Raum offen. Der Code lautet',zh:'房间已开启。代码为'},
  netKodKell:{hu:'Add meg a négybetűs szobakódot.',en:'Enter the four-letter room code.',de:'Gib den vierstelligen Raumcode ein.',zh:'请输入四位房间代码。'},
  netKapcsolodas:{hu:'Kapcsolódás…',en:'Connecting…',de:'Verbinde…',zh:'连接中…'},
  netCsatlakoztal:{hu:'Csatlakoztál. Várunk a házigazdára…',en:'Connected. Waiting for the host…',de:'Verbunden. Warte auf den Gastgeber…',zh:'已连接。等待房主…'},
  netTarsMegjott:{hu:'A társ megérkezett',en:'Your partner has arrived',de:'Der Mitspieler ist da',zh:'对手已加入'},
  netIndul:{hu:'Indul a játszma…',en:'The match is starting…',de:'Die Partie beginnt…',zh:'对局即将开始…'},
  setIranyitas:{hu:'Irányítás',en:'Controls',de:'Steuerung',zh:'操作'},
  setGrafika:{hu:'Grafika',en:'Graphics',de:'Grafik',zh:'图形'},
  setHang:{hu:'Hang',en:'Sound',de:'Ton',zh:'声音'},
  fenyhatasok:{hu:'Fényhatások',en:'Lighting',de:'Lichteffekte',zh:'光效'},
  fenyhatasokAl:{hu:'kontaktárnyék, fényirány, ragyogás, szemcse',en:'contact shadows, light direction, bloom, grain',de:'Kontaktschatten, Lichtrichtung, Leuchten, Korn',zh:'接触阴影、光照方向、辉光、颗粒'},
  idojarasAl:{hu:'eső és hó, hatással a látásra',en:'rain and snow, affecting visibility',de:'Regen und Schnee, beeinflusst die Sicht',zh:'雨雪，会影响视野'},
  nappalEjjelAl:{hu:'éjjel feleakkora látótáv',en:'half the vision range at night',de:'nachts halbe Sichtweite',zh:'夜间视野减半'},
  kepmeretAl:{hu:'a játéktér felbontása',en:'the resolution of the playfield',de:'Auflösung des Spielfelds',zh:'游戏画面的分辨率'},
  nezet:{hu:'Nézet',en:'Layout',de:'Ansicht',zh:'视图'},
  nezetAl:{hu:'elrendezés a kijelzőhöz',en:'layout for your display',de:'Anordnung für den Bildschirm',zh:'适配屏幕的布局'},
  gorgetesAl:{hu:'egérgörgő / trackpad',en:'mouse wheel / trackpad',de:'Mausrad / Trackpad',zh:'鼠标滚轮／触控板'},
  kameraSeb:{hu:'Kamera sebessége',en:'Camera speed',de:'Kamerageschwindigkeit',zh:'镜头速度'},
  szelGorgetes:{hu:'Görgetés a képernyő szélén',en:'Edge scrolling',de:'Bildschirmrand-Scrollen',zh:'边缘滚动'},
  szelGorgetesAl:{hu:'egérrel',en:'with the mouse',de:'mit der Maus',zh:'使用鼠标'},
  billKurzor:{hu:'Billentyűkurzor',en:'Keyboard cursor',de:'Tastaturcursor',zh:'键盘光标'},
  billKurzorAl:{hu:'egér nélküli játékhoz',en:'for playing without a mouse',de:'für das Spiel ohne Maus',zh:'用于无鼠标游玩'},
  billLista:{hu:'Billentyűk listája',en:'List of keys',de:'Tastenliste',zh:'按键列表'},
  szinvak:{hu:'Színvakbarát mód',en:'Colourblind mode',de:'Farbenblind-Modus',zh:'色盲模式'},
  szinvakAl:{hu:'kék és narancs csapatszín',en:'blue and orange team colours',de:'Blau und Orange als Teamfarben',zh:'蓝色与橙色阵营配色'},
  diszRetegek:{hu:'Díszítő rétegek',en:'Decorative layers',de:'Zierschichten',zh:'装饰图层'},
  diszRetegekAl:{hu:'füst, vízcsillogás',en:'smoke, water shimmer',de:'Rauch, Wasserglanz',zh:'烟雾、水面反光'},
  automatikus:{hu:'automatikus',en:'auto',de:'automatisch',zh:'自动'},
  szamitogep:{hu:'számítógép',en:'desktop',de:'Computer',zh:'电脑'},
  telefon:{hu:'telefon',en:'phone',de:'Telefon',zh:'手机'},
  mozgatas:{hu:'mozgatás',en:'pan',de:'Verschieben',zh:'平移'},
  nagyitas:{hu:'nagyítás',en:'zoom',de:'Zoom',zh:'缩放'},
  mindig:{hu:'mindig',en:'always',de:'immer',zh:'始终'},
  lassu:{hu:'lassú',en:'slow',de:'langsam',zh:'慢'},
  kozepes:{hu:'közepes',en:'medium',de:'mittel',zh:'中'},
  gyors:{hu:'gyors',en:'fast',de:'schnell',zh:'快'},
  hangero:{hu:'Hangerő',en:'Volume',de:'Lautstärke',zh:'音量'},
  zeneHangero:{hu:'Zene hangereje',en:'Music volume',de:'Musiklautstärke',zh:'音乐音量'},
  nemIndult:{hu:'nem indult',en:'not started',de:'nicht gestartet',zh:'未启动'},
  nyFa:{hu:'Fa',en:'Wood',de:'Holz',zh:'木材'},
  nyKo:{hu:'Kő',en:'Stone',de:'Stein',zh:'石料'},
  nyArany:{hu:'Arany',en:'Gold',de:'Gold',zh:'黄金'},
  nySzen:{hu:'Szén',en:'Coal',de:'Kohle',zh:'煤炭'},
  nyElelem:{hu:'Élelem',en:'Food',de:'Nahrung',zh:'食物'},
  nySereg:{hu:'Sereg',en:'Army',de:'Armee',zh:'军队'},
  korAlcim0:{hu:'Késő középkor',en:'Late Middle Ages',de:'Spätmittelalter',zh:'中世纪晚期'},
  korAlcim1:{hu:'Kora újkor',en:'Early modern age',de:'Frühe Neuzeit',zh:'近代早期'},
  korAlcim2:{hu:'Ipari forradalom',en:'Industrial revolution',de:'Industrielle Revolution',zh:'工业革命'},
  korAlcim3:{hu:'Világháborús kor',en:'Age of world wars',de:'Zeitalter der Weltkriege',zh:'世界大战时代'},
  korszakvaltas:{hu:'Korszakváltás',en:'Advance age',de:'Zeitalter wechseln',zh:'进入下一时代'},
  gyMenu:{hu:'Menü',en:'Menu',de:'Menü',zh:'菜单'},
  gyBazis:{hu:'Ugrás a bázisra',en:'Jump to base',de:'Zur Basis springen',zh:'跳到基地'},
  gySereg:{hu:'Sereg kijelölése',en:'Select army',de:'Armee auswählen',zh:'选择军队'},
  gyMunkas:{hu:'Munkások kijelölése',en:'Select workers',de:'Arbeiter auswählen',zh:'选择工人'},
  gyStop:{hu:'Parancsok törlése',en:'Cancel orders',de:'Befehle löschen',zh:'取消命令'},
  visszajatszasMent:{hu:'Visszajátszás mentése',en:'Save replay',de:'Wiederholung speichern',zh:'保存回放'},
  bezaras2:{hu:'Bezárás — kijelölés és építés megszakítása',en:'Close — cancel selection and building',de:'Schließen — Auswahl und Bau abbrechen',zh:'关闭 — 取消选择与建造'},
  bezar:{hu:'Bezár',en:'Close',de:'Schließen',zh:'关闭'},
  elfogadom:{hu:'Elfogadom',en:'Accept',de:'Annehmen',zh:'接受'},
  elutasitom:{hu:'Elutasítom',en:'Decline',de:'Ablehnen',zh:'拒绝'},
  kihagyom:{hu:'Kihagyom',en:'Skip',de:'Überspringen',zh:'跳过'},
  hirnev:{hu:'HÍRNÉV',en:'FAME',de:'RUHM',zh:'声望'},
  kegyelem:{hu:'Kegyelemlevél',en:'Letter of pardon',de:'Gnadenbrief',zh:'赦免令'},
  kepMentese:{hu:'Kép mentése',en:'Save image',de:'Bild speichern',zh:'保存图片'},
  toltet:{hu:'Töltet',en:'Shot',de:'Ladung',zh:'弹种'},
  alVonalAl:{hu:'lövész +10% lőtáv',en:'ranged +10% range',de:'Schützen +10% Reichweite',zh:'远程 +10% 射程'},
  alEkAl:{hu:'+12% roham',en:'+12% charge',de:'+12% Ansturm',zh:'+12% 冲锋'},
  alNegyszogAl:{hu:'+2 páncél, lassabb',en:'+2 armour, slower',de:'+2 Rüstung, langsamer',zh:'+2 护甲，移动更慢'},
  allTamadoAl:{hu:'célt fog és üldöz',en:'picks a target and chases',de:'sucht ein Ziel und verfolgt',zh:'自动选择目标并追击'},
  allTartsdAl:{hu:'nem mozdul, csak lő',en:'holds position, only fires',de:'bleibt stehen, feuert nur',zh:'原地不动，只射击'},
  allVisszaAl:{hu:'sebesülten elhátrál',en:'falls back when wounded',de:'zieht sich verwundet zurück',zh:'受伤时后撤'},
  szunetTag:{hu:'SZÜNET — P a folytatáshoz',en:'PAUSED — press P to continue',de:'PAUSE — P zum Fortsetzen',zh:'已暂停 — 按 P 继续'},
  kezdodjek:{hu:'Kezdődjék',en:'Begin',de:'Los geht’s',zh:'开始'},
  kezdes:{hu:'Kezdés',en:'Start',de:'Start',zh:'开始'},
  valasszIrany:{hu:'Válassz irányt',en:'Choose a direction',de:'Wähle eine Richtung',zh:'选择方向'},
  doktLead:{hu:'A döntés végleges, és a játszma végéig veled marad.',en:'The choice is final and stays with you until the end of the match.',de:'Die Wahl ist endgültig und bleibt bis zum Ende der Partie.',zh:'此选择不可更改，将持续整局游戏。'},
  vege:{hu:'Vége',en:'The end',de:'Ende',zh:'结束'},
  gyozelem:{hu:'Győzelem',en:'Victory',de:'Sieg',zh:'胜利'},
  vereseg:{hu:'Vereség',en:'Defeat',de:'Niederlage',zh:'失败'},
  jatekido:{hu:'Játékidő',en:'Play time',de:'Spielzeit',zh:'游戏时长'},
  tulelt:{hu:'Túlélt idő',en:'Time survived',de:'Überlebte Zeit',zh:'存活时长'},
  gyozelemSzoveg:{hu:'hadserege megtörte az ellenség ellenállását — a koalíció kapitulált.',en:'army has broken the enemy resistance — the coalition has capitulated.',de:'Heer hat den Widerstand des Feindes gebrochen — die Koalition hat kapituliert.',zh:'的军队击溃了敌军抵抗 — 联军已投降。'},
  veresegSzoveg:{hu:'Elvesztetted a főhadiszállásodat és a kaszárnyáidat, és nem maradt munkásod az újjáépítéshez.',en:'You have lost your headquarters and your barracks, and no worker remains to rebuild.',de:'Du hast dein Hauptquartier und deine Kasernen verloren, und kein Arbeiter blieb zum Wiederaufbau.',zh:'你失去了司令部和兵营，也没有工人可以重建。'},
  kuldTeljesitveMsg:{hu:'teljesítve.',en:'completed.',de:'abgeschlossen.',zh:'已完成。'},
  kovKuldetes:{hu:'A következő küldetés megnyílt',en:'The next mission has opened',de:'Die nächste Mission ist freigeschaltet',zh:'下一关已解锁'},
  hadjaratVege:{hu:'Végigvitted a hadjáratot.',en:'You have completed the campaign.',de:'Du hast den Feldzug abgeschlossen.',zh:'你已完成整场战役。'},
  ctPriest:{hu:'nem harcol: átállítja az ellenséget és gyógyítja a sajátjait',
    en:'does not fight: converts the enemy and heals your own',
    de:'kämpft nicht: bekehrt den Feind und heilt die Eigenen',
    zh:'不参战：可劝降敌军并治疗己方'},
  ctMelee:{hu:'erős a lövészek ellen, gyenge a pikások ellen',
    en:'strong against ranged, weak against spears',
    de:'stark gegen Schützen, schwach gegen Pikeniere',
    zh:'克制远程，惧怕长矛'},
  ctRanged:{hu:'erős a pikások ellen, gyenge a lovasság ellen',
    en:'strong against spears, weak against cavalry',
    de:'stark gegen Pikeniere, schwach gegen Kavallerie',
    zh:'克制长矛，惧怕骑兵'},
  ctSpear:{hu:'erős a lovasság és a harckocsik ellen, gyenge a lövészek ellen',
    en:'strong against cavalry and tanks, weak against ranged',
    de:'stark gegen Kavallerie und Panzer, schwach gegen Schützen',
    zh:'克制骑兵与坦克，惧怕远程'},
  ctWorker:{hu:'harcra alkalmatlan',en:'not fit for battle',de:'nicht kampftauglich',zh:'不适合战斗'},
  ctTobb:{hu:'Shift: 5 egyszerre, Ctrl: 10, nyomva tartva folyamatosan',
    en:'Shift: 5 at once, Ctrl: 10, hold down for continuous',
    de:'Shift: 5 auf einmal, Strg: 10, gedrückt halten für laufend',
    zh:'Shift：一次 5 个，Ctrl：10 个，长按可连续'},
  ctTerep:{hu:'terep',en:'terrain',de:'Gelände',zh:'地形'},
  ctCipel:{hu:'cipel',en:'carrying',de:'trägt',zh:'携带'},
  ctHal:{hu:'hal',en:'fish',de:'Fisch',zh:'鱼'},
  netKozosCim:{hu:'Közös birodalom',en:'Shared empire',de:'Gemeinsames Reich',zh:'共同的帝国'},
  netKozos:{hu:'Ketten ugyanazt a népet vezetitek a gép ellen: közös készlet, közös sereg. Mindenki a saját kijelölését látja.',
    en:'The two of you lead the same nation against the computer: shared stockpiles, shared army. Each of you sees your own selection.',
    de:'Ihr beide führt dasselbe Volk gegen den Computer: gemeinsame Vorräte, gemeinsame Armee. Jeder sieht seine eigene Auswahl.',
    zh:'你们两人共同带领同一个国家对抗电脑：资源与军队共享，各自看到自己的选择。'},
  netProba:{hu:'PRÓBA',en:'BETA',de:'BETA',zh:'测试版'},
  teljesKepernyo:{hu:'Teljes képernyő',en:'Full screen',de:'Vollbild',zh:'全屏'},
  teljesKepernyoAl:{hu:'az egész kijelzőt kitölti — F11',
    en:'fills the whole display — F11',
    de:'füllt den ganzen Bildschirm — F11',
    zh:'铺满整个屏幕 — F11'},
  uzTeljesBe:{hu:'Teljes képernyő. Kilépés: F11.',en:'Full screen. Press F11 to leave.',
    de:'Vollbild. Zum Beenden F11.',zh:'已进入全屏。按 F11 退出。'},
  uzEllenfelKor:{hu:'Az ellenfél belépett ebbe a korba',en:'The enemy has entered this age',
    de:'Der Gegner hat dieses Zeitalter erreicht',zh:'敌方已进入新时代'},
  uzRoham:{hu:'Ellenséges roham közeledik!',en:'An enemy assault is coming!',
    de:'Ein feindlicher Angriff naht!',zh:'敌军来袭！'},
  uzEgysegDb:{hu:'egység',en:'units',de:'Einheiten',zh:'个单位'},
  setHangok:{hu:'Hangok',en:'Sound',de:'Ton',zh:'声音'},
  billCim:{hu:'Gyorsbillentyűk',en:'Hotkeys',de:'Tastenkürzel',zh:'快捷键'},
  billSugo:{hu:'Kattints egy billentyűre, majd nyomd le az újat. Esc: mégse. A sárga jelzés azt mutatja, hogy ugyanaz a billentyű máshol is szerepel.',
    en:'Click a key, then press the new one. Esc to cancel. Amber marks a key that is used elsewhere as well.',
    de:'Klicke eine Taste an und drücke dann die neue. Esc bricht ab. Gelb heißt: dieselbe Taste kommt auch anderswo vor.',
    zh:'点击一个按键，然后按下新的按键。Esc 取消。黄色表示该按键在别处也有使用。'},
  billNyomj:{hu:'nyomd le…',en:'press a key…',de:'Taste drücken…',zh:'请按键…'},
  billVisszaallit:{hu:'Alapértelmezés visszaállítása',en:'Restore defaults',
    de:'Standard wiederherstellen',zh:'恢复默认'},
  billVisszaall:{hu:'A gyorsbillentyűk alaphelyzetbe kerültek.',en:'Hotkeys restored to defaults.',
    de:'Tastenkürzel zurückgesetzt.',zh:'快捷键已恢复默认。'},
  billFoglalt:{hu:'Ez a billentyű a felülethez tartozik, nem adható át',
    en:'This key belongs to the interface and cannot be reassigned',
    de:'Diese Taste gehört zur Oberfläche und kann nicht belegt werden',
    zh:'该按键属于界面功能，无法重新分配'},
  billCsop_ep:{hu:'Építés',en:'Building',de:'Bauen',zh:'建造'},
  billCsop_harc:{hu:'Harci állás és alakzat',en:'Stance and formation',
    de:'Haltung und Formation',zh:'姿态与阵型'},
  billCsop_par:{hu:'Parancsok',en:'Orders',de:'Befehle',zh:'命令'},
  kbEpHq:{hu:'Főhadiszállás',en:'Headquarters',de:'Hauptquartier',zh:'司令部'},
  kbEpBarracks:{hu:'Kaszárnya',en:'Barracks',de:'Kaserne',zh:'兵营'},
  kbEpFarm:{hu:'Majorság',en:'Farm',de:'Bauernhof',zh:'农场'},
  kbEpTower:{hu:'Torony',en:'Tower',de:'Turm',zh:'塔楼'},
  kbEpWall:{hu:'Fal',en:'Wall',de:'Mauer',zh:'城墙'},
  kbEpAcademy:{hu:'Akadémia',en:'Academy',de:'Akademie',zh:'学院'},
  kbEpTemple:{hu:'Templom',en:'Temple',de:'Tempel',zh:'神庙'},
  kbEpHarbor:{hu:'Kikötő',en:'Harbour',de:'Hafen',zh:'港口'},
  kbMegall:{hu:'Megállás',en:'Stop',de:'Halt',zh:'停止'},
  kbAlca:{hu:'Álruha fel/le',en:'Disguise on/off',de:'Verkleidung an/aus',zh:'伪装开／关'},
  kbFotomodSor:{hu:'fotómód — a felület eltűnik',en:'photo mode — the interface is hidden',
    de:'Fotomodus — die Oberfläche wird ausgeblendet',zh:'摄影模式 — 隐藏界面'},
  kbFotomod:{hu:'Fotómód',en:'Photo mode',de:'Fotomodus',zh:'摄影模式'},
  csata:{hu:'Csata — több fél',en:'Skirmish — many sides',de:'Gefecht — mehrere Seiten',zh:'遭遇战 — 多方混战'},
  csataSugo:{hu:'Mindenki saját várossal, saját készlettel indul. Az azonos csapatszámú felek szövetségesek; külön számmal mindenki mindenki ellen.',
    en:'Everyone starts with their own town and their own stockpile. Sides sharing a team number are allies; with separate numbers it is every side for itself.',
    de:'Jeder startet mit eigener Stadt und eigenen Vorräten. Seiten mit gleicher Teamnummer sind Verbündete; bei verschiedenen Nummern kämpft jeder für sich.',
    zh:'每一方都拥有自己的城市与资源。队伍编号相同的为盟友；编号不同则各自为战。'},
  szHelyek:{hu:'Helyek',en:'Slots',de:'Plätze',zh:'席位'},
  szTe:{hu:'Te',en:'You',de:'Du',zh:'你'},
  szBot:{hu:'Bot',en:'Bot',de:'Bot',zh:'电脑'},
  szBotok:{hu:'bot',en:'bots',de:'Bots',zh:'电脑'},
  szEmber:{hu:'ember',en:'human',de:'Mensch',zh:'玩家'},
  szVarakozik:{hu:'üres hely',en:'open slot',de:'freier Platz',zh:'空席位'},
  szVeletlen:{hu:'Sorsolt nemzet',en:'Random nation',de:'Zufällige Nation',zh:'随机国家'},
  szCsapat:{hu:'Csapat',en:'Team',de:'Team',zh:'队伍'},
  szElvesz:{hu:'Hely elvétele',en:'Remove slot',de:'Platz entfernen',zh:'移除席位'},
  szBotHozzaad:{hu:'Bot hozzáadása',en:'Add a bot',de:'Bot hinzufügen',zh:'添加电脑'},
  szBotTele:{hu:'Nem fér több bot a szobába.',en:'No room for another bot.',
    de:'Kein Platz für einen weiteren Bot.',zh:'房间中无法再加入电脑。'},
  szCsakHazigazda:{hu:'A játszmát a házigazda indítja.',en:'Only the host can start the match.',
    de:'Nur der Gastgeber startet die Partie.',zh:'只有房主可以开始对局。'},
  szVarHazigazda:{hu:'Várakozás a házigazdára…',en:'Waiting for the host…',
    de:'Warte auf den Gastgeber…',zh:'等待房主…'},
  szKod:{hu:'Szobakód',en:'Room code',de:'Raumcode',zh:'房间代码'},
  ptCim:{hu:'Felek',en:'Sides',de:'Seiten',zh:'各方'},
  ptKiesett:{hu:'kiesett',en:'eliminated',de:'ausgeschieden',zh:'已出局'},
  ptSzoba:{hu:'Szoba',en:'Room',de:'Raum',zh:'房间'},
  ptFo:{hu:'fő',en:'players',de:'Spieler',zh:'人'},
  uzKiesett:{hu:'kiesett a játszmából.',en:'has been eliminated.',
    de:'ist ausgeschieden.',zh:'已被淘汰。'},
  uzCsapatGyoz:{hu:'A csapatod győzött — nem maradt ellenfél.',
    en:'Your team has won — no opponents remain.',
    de:'Dein Team hat gewonnen — es bleibt kein Gegner.',
    zh:'你的队伍获胜 — 已无对手。'},
  vHelyorseg:{hu:'az utolsó helyőrség kiállt a partra!',
    en:'the last garrison has turned out on the shore!',
    de:'die letzte Besatzung ist ans Ufer ausgerückt!',
    zh:'最后的守军已在岸边列阵！'},
  vElesett:{hu:'elesett',en:'has fallen',de:'ist gefallen',zh:'已陷落'},
  vDontsd:{hu:'Nincs több védő. Mi legyen a várossal?',
    en:'No defenders remain. What shall become of the town?',
    de:'Keine Verteidiger mehr. Was soll aus der Stadt werden?',
    zh:'守军已尽。这座城将何去何从？'},
  vElfoglalom:{hu:'Elfoglalom — a város a tiéd lesz',
    en:'Take it — the town becomes yours',
    de:'Einnehmen — die Stadt wird dein',
    zh:'占领 — 城池归你所有'},
  vKifosztom:{hu:'Kifosztom',en:'Plunder it',de:'Plündern',zh:'洗劫'},
  vElfoglalva:{hu:'a város a tiéd!',en:'the town is yours!',de:'die Stadt gehört dir!',zh:'此城已归你所有！'},
  vKifosztva:{hu:'kifosztva',en:'plundered',de:'geplündert',zh:'已洗劫'},
  netLassu:{hu:'Lassú a kapcsolat — nagyobb késleltetéssel folytatjuk.',
    en:'Slow connection — continuing with a larger delay.',
    de:'Langsame Verbindung — es geht mit größerer Verzögerung weiter.',
    zh:'连接较慢 — 将以更大的延迟继续。'},
  netMegszakadt:{hu:'A kapcsolat megszakadt.',en:'The connection was lost.',
    de:'Die Verbindung wurde unterbrochen.',zh:'连接已中断。'},
  szNincsJatekos:{hu:'Nincs kivel indítani a játszmát.',en:'There is nobody to start the match with.',
    de:'Es ist niemand da, um die Partie zu starten.',zh:'没有可以一起开始对局的玩家。'},
  uzSzinvakBe:{hu:'Színvakbarát mód bekapcsolva.',en:'Colourblind mode on.',
    de:'Farbenblind-Modus an.',zh:'色盲模式已开启。'},
  uzSzinvakKi:{hu:'Nemzeti színek visszaállítva.',en:'National colours restored.',
    de:'Nationalfarben wiederhergestellt.',zh:'已恢复国家配色。'},
  netNemaTars:{hu:'Egy társ nem válaszol — a játszma nélküle folytatódik.',
    en:'A player is not responding — the match continues without them.',
    de:'Ein Mitspieler antwortet nicht — die Partie geht ohne ihn weiter.',
    zh:'有玩家无响应 — 对局将在没有他的情况下继续。'},
  netNincsSzunet:{hu:'Többjátékos játszmában nincs szünet.',en:'There is no pause in a multiplayer match.',
    de:'In einer Mehrspielerpartie gibt es keine Pause.',zh:'多人对局中无法暂停。'},
  uzTulMessze:{hu:'Túl messze a birodalmadtól.',en:'Too far from your empire.',
    de:'Zu weit von deinem Reich entfernt.',zh:'距离你的帝国太远。'},
  uzTulKozel:{hu:'Túl közel az ellenséghez.',en:'Too close to the enemy.',
    de:'Zu nah am Feind.',zh:'离敌人太近。'},
  /* --- Fordítatlanul maradt játékbeli üzenetek (v6.5) --- */
  uzNincsMunkas:{hu:'Nincs elérhető munkásod.',en:'You have no available worker.',
    de:'Du hast keinen verfügbaren Arbeiter.',zh:'你没有可用的农奴。'},
  uzKapuNyilt:{hu:'Kapu nyílt a falon — a sereged átjár rajta.',
    en:'A gate has opened in the wall — your army can pass through.',
    de:'Ein Tor hat sich in der Mauer geöffnet — dein Heer kann hindurch.',
    zh:'城墙上开了一道门 — 你的军队可以通行。'},
  uzBiztosRombol:{hu:'Biztos? Nyomd meg még egyszer a lerombolást.',
    en:'Are you sure? Press demolish once more.',
    de:'Sicher? Drücke noch einmal auf Abreißen.',zh:'确定吗？再按一次拆除。'},
  uzKovKorszakban:{hu:'Ez a fokozat a következő korszakban nyílik meg.',
    en:'This level unlocks in the next age.',
    de:'Diese Stufe wird im nächsten Zeitalter freigeschaltet.',zh:'该等级将在下个时代解锁。'},
  uzAkademiaKell:{hu:'A fejlesztéshez akadémia kell — előbb építs egyet.',
    en:'Upgrades need an academy — build one first.',
    de:'Für Verbesserungen brauchst du eine Akademie — baue zuerst eine.',
    zh:'升级需要学院 — 请先建造一座。'},
  uzNincsSzen:{hu:'Elfogyott a szén — a lőfegyverek nem tüzelnek. Küldj munkást széntelepre!',
    en:'Out of coal — firearms cannot shoot. Send a worker to a coal seam!',
    de:'Kohle ist aus — Feuerwaffen schießen nicht. Schicke einen Arbeiter zum Kohleflöz!',
    zh:'煤炭耗尽 — 火器无法射击。派农奴去煤矿！'},
  uzAtallitotta:{hu:'Az ellenség átállította az egyik',en:'The enemy has converted one of your',
    de:'Der Feind hat einen deiner',zh:'敌人策反了你的一个'},
  uzAtallitotta2:{hu:'egységedet!',en:'units!',de:'Einheiten bekehrt!',zh:'单位！'},
  uzNincsLerakni:{hu:'Nincs hova lerakni a nyersanyagot — építs főhadiszállást!',
    en:'Nowhere to drop the resources — build a headquarters!',
    de:'Keine Abgabestelle für Rohstoffe — baue ein Hauptquartier!',
    zh:'没有地方存放资源 — 请建造司令部！'},
  uzKovEpitkezes:{hu:'A munkások átmennek a következő építkezésre.',
    en:'The workers move on to the next building site.',
    de:'Die Arbeiter gehen zur nächsten Baustelle.',zh:'农奴们转往下一处工地。'},
  uzHajoMegtelt:{hu:'A hajó megtelt.',en:'The ship is full.',de:'Das Schiff ist voll.',zh:'船已满载。'},
  uzHajotElfoglaltak:{hu:'Az ellenség elfoglalta a hajódat!',en:'The enemy has captured your ship!',
    de:'Der Feind hat dein Schiff gekapert!',zh:'敌人夺取了你的船！'},
  uzLegenysegFogyott:{hu:'A legénységed elfogyott — az átszállás meghiúsult.',
    en:'Your crew is gone — the boarding failed.',
    de:'Deine Mannschaft ist aufgerieben — das Entern ist gescheitert.',
    zh:'你的船员已尽 — 接舷失败。'},
  uzVisszahivashoz:{hu:'A visszahíváshoz kell',en:'Recalling requires',
    de:'Für die Rückrufung nötig',zh:'召回需要'},
  uzUjKorszak:{hu:'Új korszak',en:'New age',de:'Neues Zeitalter',zh:'新时代'},
  uzVillam:{hu:'Villám csapott a hajódba!',en:'Lightning has struck your ship!',
    de:'Ein Blitz hat dein Schiff getroffen!',zh:'闪电击中了你的船！'},
  uzTolcser:{hu:'A tölcsér tépi a hajódat!',en:'The waterspout is tearing at your ship!',
    de:'Die Wasserhose zerrt an deinem Schiff!',zh:'水龙卷正在撕扯你的船！'},
  uzPartraSzall:{hu:'A legénység partra száll és felhúzza',
    en:'The crew goes ashore and raises',de:'Die Mannschaft geht an Land und errichtet',
    zh:'船员登陆并建造'},
  uzKurzorKi:{hu:'Billentyűkurzor kikapcsolva.',en:'Keyboard cursor off.',
    de:'Tastaturzeiger aus.',zh:'键盘光标已关闭。'},
  uzJeloljKi:{hu:'Előbb jelölj ki egységeket.',en:'Select some units first.',
    de:'Wähle zuerst Einheiten aus.',zh:'请先选择单位。'},
  uzNincsKatona:{hu:'Nincs kiképzett katonád.',en:'You have no trained soldiers.',
    de:'Du hast keine ausgebildeten Soldaten.',zh:'你没有训练好的士兵。'},
  uzRosszFajl:{hu:'Ez a fájl nem ehhez a játékhoz való.',en:'This file does not belong to this game.',
    de:'Diese Datei gehört nicht zu diesem Spiel.',zh:'此文件不属于本游戏。'},
  uzMentesNemSikerult:{hu:'A mentés nem sikerült.',en:'Saving failed.',
    de:'Das Speichern ist fehlgeschlagen.',zh:'保存失败。'},
  uzRetegKi:{hu:'Egy látványréteg kikapcsolt',en:'A visual layer has been switched off',
    de:'Eine Grafikebene wurde abgeschaltet',zh:'一个视觉图层已关闭'},
  uzRajzHiba:{hu:'Rajzolási hiba',en:'Drawing error',de:'Zeichenfehler',zh:'绘制错误'},
  uzKereskedoTunt:{hu:'Kereskedőhajó tűnt fel a vizeken — a rakománya',
    en:'A merchant ship has appeared — her cargo is worth',
    de:'Ein Handelsschiff ist aufgetaucht — seine Ladung ist wert',
    zh:'一艘商船出现在海面 — 货物价值'},
  uzJarvanyVege:{hu:'A járvány lecsengett.',en:'The plague has run its course.',
    de:'Die Seuche ist abgeklungen.',zh:'瘟疫已经平息。'},
  uzVisszajatszas:{hu:'Visszajátszás',en:'Replay',de:'Wiederholung',zh:'回放'},
  uzParancsDb:{hu:'parancs',en:'commands',de:'Befehle',zh:'条命令'},
  uzVisszajatszasMentve:{hu:'Visszajátszás mentve',en:'Replay saved',
    de:'Wiederholung gespeichert',zh:'回放已保存'},
  uzKiralyiHajohad:{hu:'A KIRÁLYI HAJÓHAD kifutott',en:'THE ROYAL NAVY has set sail',
    de:'DIE KÖNIGLICHE FLOTTE ist ausgelaufen',zh:'皇家海军已经出航'},
  uzAlakzat:{hu:'Alakzat',en:'Formation',de:'Formation',zh:'阵型'},
  uzLegfeljebb:{hu:'Legfeljebb',en:'At most',de:'Höchstens',zh:'最多'},
  uzLehetEgyszerre:{hu:'lehet egyszerre.',en:'may stand at once.',
    de:'gleichzeitig möglich.',zh:'座可同时存在。'},
  egyjatekos:{hu:'Egy játékos',en:'Single player',de:'Einzelspieler',zh:'单人游戏'},
  korabbiBetoltes:{hu:'Korábbi betöltése',en:'Load a saved game',
    de:'Gespeichertes Spiel laden',zh:'读取存档'},
  csataHelyi:{hu:'Helyi csata — botok ellen',en:'Local skirmish — against bots',
    de:'Lokales Gefecht — gegen Bots',zh:'本地遭遇战 — 对战电脑'},
  netVagy:{hu:'— vagy hálózaton át —',en:'— or over the network —',
    de:'— oder über das Netzwerk —',zh:'— 或通过网络 —'},
  netSzobakat:{hu:'Nyitott szobák lekérdezése',en:'List open rooms',
    de:'Offene Räume abfragen',zh:'查询开放房间'},
  netNincsSzoba:{hu:'Most nincs nyitott szoba ezen a szerveren.',
    en:'There are no open rooms on this server right now.',
    de:'Auf diesem Server gibt es derzeit keine offenen Räume.',
    zh:'该服务器目前没有开放的房间。'},
  netSzobaFo:{hu:'fő',en:'players',de:'Spieler',zh:'人'},
  netBelep:{hu:'Belépés',en:'Join',de:'Beitreten',zh:'加入'},
  netListaKer:{hu:'Szobák lekérdezése…',en:'Requesting rooms…',
    de:'Räume werden abgefragt…',zh:'正在查询房间…'},
  mentesMappa:{hu:'Mentések mappája',en:'Saved games folder',
    de:'Ordner der Spielstände',zh:'存档文件夹'},
  mentesFajlba:{hu:'A mentések fájlba kerülnek.',en:'Saved games are stored in files.',
    de:'Spielstände werden in Dateien gespeichert.',zh:'存档以文件形式保存。'},
  netNeved:{hu:'A neved',en:'Your name',de:'Dein Name',zh:'你的名字'},
  netNevedPh:{hu:'pl. Bence',en:'e.g. Alex',de:'z. B. Alex',zh:'例如：小明'},
  netNevKell:{hu:'Adj meg egy nevet — ezt látják a többiek.',
    en:'Enter a name — this is what the others will see.',
    de:'Gib einen Namen ein — den sehen die anderen.',
    zh:'请输入名字 — 其他玩家会看到它。'},
  szTeUtan:{hu:'te',en:'you',de:'du',zh:'你'},
  netListaHiba:{hu:'A szerver nem érhető el ezen a címen.',
    en:'The server cannot be reached at this address.',
    de:'Der Server ist unter dieser Adresse nicht erreichbar.',
    zh:'无法通过该地址连接服务器。'},
  netNyitottSzoba:{hu:'nyitott szoba',en:'open rooms',de:'offene Räume',zh:'个开放房间'},
  netMarKapcsolodva:{hu:'Már kapcsolódva vagy — előbb lépj ki.',
    en:'You are already connected — leave first.',
    de:'Du bist bereits verbunden — verlasse zuerst die Partie.',
    zh:'你已连接 — 请先退出。'},
  ctCav:{hu:'gyors — erős a lövészek ellen, gyenge a pikások ellen',
    en:'fast — strong against shooters, weak against pikes',
    de:'schnell — stark gegen Schützen, schwach gegen Piken',
    zh:'快速 — 克制射手，惧怕长矛'},
  netKeszSzobak:{hu:'Válassz szobát a listából.',en:'Pick a room from the list.',
    de:'Wähle einen Raum aus der Liste.',zh:'从列表中选择一个房间。'},
  netHelyiCim:{hu:'Helyi játék',en:'Local game',de:'Lokales Spiel',zh:'本地游戏'},
  netHelyiLeiras:{hu:'Egy gépen, hálózat nélkül. Te és legfeljebb kilenc bot ugyanazon a térképen.',
    en:'On one machine, no network. You and up to nine bots on the same map.',
    de:'An einem Rechner, ohne Netzwerk. Du und bis zu neun Bots auf derselben Karte.',
    zh:'在一台电脑上，无需联网。你和最多九个电脑对手同处一张地图。'},
  netHalozatCim:{hu:'Hálózati játék',en:'Network game',de:'Netzwerkspiel',zh:'联机游戏'},
  meghivoPh:{hu:'MEGHÍVÓ VAGY KÓD',en:'INVITE OR CODE',de:'EINLADUNG ODER CODE',zh:'邀请链接或代码'},
  netCimKell:{hu:'Add meg a szerver címét, vagy illeszd be a meghívót.',
    en:'Enter the server address, or paste the invite.',
    de:'Gib die Serveradresse ein oder füge die Einladung ein.',
    zh:'请输入服务器地址，或粘贴邀请。'},
  szMeghivo:{hu:'Meghívó másolása',en:'Copy invite',de:'Einladung kopieren',zh:'复制邀请'},
  szMeghivoKesz:{hu:'A meghívó a vágólapon — küldd el a többieknek.',
    en:'Invite copied — send it to the others.',
    de:'Einladung kopiert — schicke sie den anderen.',
    zh:'邀请已复制 — 发送给其他人。'},
  idoDerult:{hu:'derült',en:'clear',de:'klar',zh:'晴'},
  idoEso:{hu:'eső',en:'rain',de:'Regen',zh:'雨'},
  idoHo:{hu:'havazás',en:'snow',de:'Schnee',zh:'雪'},
  idoKod:{hu:'köd',en:'fog',de:'Nebel',zh:'雾'},
  idoSaros:{hu:'sáros',en:'muddy',de:'schlammig',zh:'泥泞'},
  idoEsoJon:{hu:'Eső közeledik.',en:'Rain is coming.',de:'Regen zieht auf.',zh:'大雨将至。'},
  idoHoJon:{hu:'Havazni kezd.',en:'It is starting to snow.',de:'Es beginnt zu schneien.',zh:'开始下雪了。'},
  idoKodJon:{hu:'Köd ereszkedik a tájra.',en:'Fog is settling over the land.',
    de:'Nebel legt sich über das Land.',zh:'大雾笼罩大地。'},
  hosKialtas:{hu:'Csatakiáltás',en:'War cry',de:'Schlachtruf',zh:'战吼'},
  hosKialtasKesz:{hu:'kész',en:'ready',de:'bereit',zh:'就绪'},
  uzKialtas:{hu:'Csatakiáltás! A sereg nekilendül.',en:'War cry! The army surges forward.',
    de:'Schlachtruf! Das Heer stürmt vor.',zh:'战吼！大军奋勇向前。'},
  uzKialtasDb:{hu:'egység hallotta',en:'units heard it',de:'Einheiten hörten ihn',zh:'个单位听到'},
  uzSzovetsegAjanlva:{hu:'Szövetséget ajánlottál',en:'Alliance offered to',
    de:'Bündnis angeboten',zh:'已提出结盟'},
  uzSzovetsegKotve:{hu:'Szövetség megkötve',en:'Alliance formed with',
    de:'Bündnis geschlossen mit',zh:'已缔结同盟'},
  uzSzovetsegFelmondva:{hu:'Felmondtad a szövetséget — húsz másodperc múlva lép életbe',
    en:'You have broken the alliance — it ends in twenty seconds',
    de:'Du hast das Bündnis aufgekündigt — es endet in zwanzig Sekunden',
    zh:'你已宣布解除同盟 — 二十秒后生效'},
  uzSzovetsegVege:{hu:'A szövetség megszűnt',en:'The alliance has ended',
    de:'Das Bündnis ist beendet',zh:'同盟已解除'},
  diplAjanl:{hu:'Szövetség',en:'Ally',de:'Bündnis',zh:'结盟'},
  diplFelmond:{hu:'Felmondás',en:'Break',de:'Aufkündigen',zh:'解除'},
  szMod:{hu:'Mód',en:'Mode',de:'Modus',zh:'模式'},
  szModBirodalom:{hu:'Birodalmak',en:'Empires',de:'Reiche',zh:'帝国'},
  szModKaloz:{hu:'Kalózvilág',en:'Pirate world',de:'Piratenwelt',zh:'海盗世界'},
  vFalakLeomlottak:{hu:'A falak leomlottak!',en:'The walls have fallen!',
    de:'Die Mauern sind gefallen!',zh:'城墙已经倒塌！'},
  szKeszVagyok:{hu:'Kész vagyok',en:'Ready',de:'Bereit',zh:'已准备'},
  szMegNem:{hu:'Még nem',en:'Not ready',de:'Noch nicht',zh:'未准备'},
  szVarKeszre:{hu:'Várunk a többiekre',en:'Waiting for players',
    de:'Warten auf Spieler',zh:'等待其他玩家'},
  szCsakHazigazdaAllit:{hu:'Ezt a házigazda állítja be.',
    en:'Only the host can change this.',de:'Das stellt nur der Gastgeber ein.',
    zh:'仅房主可以更改。'},
  netSajatSzerver:{hu:'Saját szerver indítása…',en:'Starting your own server…',
    de:'Eigener Server wird gestartet…',zh:'正在启动本机服务器…'},
  netAlagutKesz:{hu:'A szerver fut, és interneten át is elérhető.',
    en:'The server is running and reachable over the internet.',
    de:'Der Server läuft und ist über das Internet erreichbar.',
    zh:'服务器已启动，可通过互联网访问。'},
  netCsakHelyi:{hu:'A szerver fut — de csak azonos wifin érhető el (nincs cloudflared).',
    en:'The server is running — reachable on the same wifi only (no cloudflared).',
    de:'Der Server läuft — nur im selben WLAN erreichbar (kein cloudflared).',
    zh:'服务器已启动 — 仅同一无线网络可用（未安装 cloudflared）。'},
  netSzerverHiba:{hu:'A saját szerver nem indult el — add meg a címet kézzel.',
    en:'Could not start your own server — enter the address manually.',
    de:'Eigener Server konnte nicht starten — gib die Adresse manuell ein.',
    zh:'无法启动本机服务器 — 请手动输入地址。'},
  netEszkozLetoltes:{hu:'Alagút-eszköz letöltése (egyszeri)…',
    en:'Downloading tunnel tool (one time)…',
    de:'Tunnel-Werkzeug wird geladen (einmalig)…',zh:'正在下载隧道工具（仅一次）…'},
  patchCim:{hu:'Mi újság',en:'What\u2019s new',de:'Was ist neu',zh:'更新内容'},
  uzSortuzTav:{hu:'A flotta sortűz-távolságban áll meg — a parti ütegek messzebbre lőnek.',
    en:'The fleet holds at bombardment range — the shore batteries reach farther.',
    de:'Die Flotte h\u00e4lt auf Beschussdistanz — die Küstenbatterien reichen weiter.',
    zh:'舰队保持炮击距离 — 岸防炮的射程更远。'},
  uzLegenysegPartra:{hu:'matróz partra szállt a legénységből.',
    en:'sailors landed from the crew.',de:'Matrosen sind an Land gegangen.',
    zh:'名水手从船员中登陆。'},
  cel:{hu:'Cél',en:'Objective',de:'Ziel',zh:'目标'},
  celMegtores:{hu:'Cél: az ellenség megtörése',en:'Objective: break the enemy',de:'Ziel: den Feind brechen',zh:'目标：击溃敌军'},
  celKitartas:{hu:'Cél: kitartani még',en:'Objective: hold out for another',de:'Ziel: noch durchhalten',zh:'目标：再坚持'},
  celEleres:{hu:'elérése',en:'reached',de:'erreichen',zh:'达成'},
  celMegsemmisites:{hu:'ellenséges egység megsemmisítése',en:'enemy units destroyed',de:'feindliche Einheiten vernichten',zh:'消灭敌方单位'},
  celKitermeles:{hu:'kitermelése',en:'gathered',de:'fördern',zh:'采集'},
  celEpulet:{hu:'épület',en:'buildings',de:'Gebäude',zh:'建筑'},
  felderitve:{hu:'Felderítőid megtalálták az ellenség utolsó állásait.',en:'Your scouts have found the last enemy positions.',de:'Deine Späher haben die letzten Stellungen des Feindes gefunden.',zh:'你的侦察兵发现了敌军最后的阵地。'},
  kbKamera:{hu:'kamera mozgatása',en:'move the camera',de:'Kamera bewegen',zh:'移动镜头'},
  kbKurzor:{hu:'billentyűkurzor be/ki',en:'keyboard cursor on/off',de:'Tastaturcursor an/aus',zh:'键盘光标开／关'},
  kbNyilak:{hu:'kurzor (kurzoros módban), egyébként kamera',en:'cursor (in cursor mode), otherwise camera',de:'Cursor (im Cursor-Modus), sonst Kamera',zh:'光标（光标模式下），否则为镜头'},
  kbSzokoz:{hu:'kijelölés a kurzornál / építés lehelyezése',en:'select at the cursor / place a building',de:'Auswahl am Cursor / Gebäude setzen',zh:'在光标处选择／放置建筑'},
  kbEnter:{hu:'parancs a kurzornál (mozgás, támadás, gyűjtés)',en:'order at the cursor (move, attack, gather)',de:'Befehl am Cursor (Bewegen, Angriff, Sammeln)',zh:'在光标处下令（移动、攻击、采集）'},
  kbTab:{hu:'csoportváltás: sereg → munkások → tétlenek → épületek',en:'cycle groups: army → workers → idle → buildings',de:'Gruppen wechseln: Armee → Arbeiter → Untätige → Gebäude',zh:'切换编组：军队 → 工人 → 闲置 → 建筑'},
  kbTetlen:{hu:'következő tétlen munkás',en:'next idle worker',de:'nächster untätiger Arbeiter',zh:'下一个闲置工人'},
  kbEpuletek:{hu:'főhadiszállás, kaszárnya, templom, akadémia, majorság, torony, fal',en:'headquarters, barracks, temple, academy, farm, tower, wall',de:'Hauptquartier, Kaserne, Tempel, Akademie, Bauernhof, Turm, Mauer',zh:'司令部、兵营、神庙、学院、农场、塔楼、城墙'},
  kbEpitesMegj:{hu:'Építeni csak kijelölt munkással lehet — ők mennek oda felhúzni.',en:'You can only build with a selected worker — they go and raise it.',de:'Bauen geht nur mit ausgewähltem Arbeiter — sie gehen hin und errichten es.',zh:'只有选中工人才能建造 — 他们会前往施工。'},
  kbEgysegek:{hu:'munkás, lovasság, lövész, pikás, hittérítő',en:'worker, cavalry, ranged, spearman, missionary',de:'Arbeiter, Kavallerie, Schütze, Pikenier, Missionar',zh:'工人、骑兵、远程、长矛兵、传教士'},
  kbOtEgyszerre:{hu:'öt egység egyszerre (Ctrl: tíz)',en:'five units at once (Ctrl: ten)',de:'fünf Einheiten auf einmal (Strg: zehn)',zh:'一次五个单位（Ctrl：十个）'},
  kbKorszak:{hu:'korszakváltás',en:'advance age',de:'Zeitalter wechseln',zh:'进入下一时代'},
  kbTeljesSereg:{hu:'teljes sereg kijelölése',en:'select the whole army',de:'ganze Armee auswählen',zh:'选择全部军队'},
  kbCsoportLetre:{hu:'vezérlőcsoport létrehozása',en:'create a control group',de:'Kontrollgruppe erstellen',zh:'创建编队'},
  kbCsoportElo:{hu:'csoport előhívása (kétszer: odaugrás)',en:'recall a group (twice: jump to it)',de:'Gruppe aufrufen (zweimal: hinspringen)',zh:'调出编队（按两次：跳转过去）'},
  kbJavitasCim:{hu:'jobb klikk sérült vagy félkész épületre',en:'right-click a damaged or unfinished building',de:'Rechtsklick auf beschädigtes oder unfertiges Gebäude',zh:'右键点击受损或未完工的建筑'},
  kbJavitas:{hu:'munkások javítják, befejezik',en:'workers repair and finish it',de:'Arbeiter reparieren und vollenden es',zh:'工人会修复并完工'},
  kbRombol:{hu:'kijelölt épület lerombolása (kétszer)',en:'demolish the selected building (twice)',de:'ausgewähltes Gebäude abreißen (zweimal)',zh:'拆除所选建筑（按两次）'},
  kbSzunet:{hu:'szünet',en:'pause',de:'Pause',zh:'暂停'},
  kbZene:{hu:'zene be/ki',en:'music on/off',de:'Musik an/aus',zh:'音乐开／关'},
  kbSpace:{hu:'Szóköz (kurzor nélkül)',en:'Space (without cursor)',de:'Leertaste (ohne Cursor)',zh:'空格（无光标时）'},
  kbBazisra:{hu:'ugrás a főhadiszállásra',en:'jump to the headquarters',de:'zum Hauptquartier springen',zh:'跳到司令部'},
  kbNyilakSzo:{hu:'nyilak',en:'arrows',de:'Pfeile',zh:'方向键'},
  kbSzokozSzo:{hu:'szóköz',en:'space',de:'Leertaste',zh:'空格'},
  kbMentes:{hu:'gyors mentés / betöltés',en:'quick save / load',de:'Schnellspeichern / -laden',zh:'快速保存／读取'},
  kbMegse:{hu:'mégse',en:'cancel',de:'abbrechen',zh:'取消'},
  uzSzunet:{hu:'Szünet — a P billentyűvel folytathatod.',en:'Paused — press P to continue.',de:'Pause — mit P geht es weiter.',zh:'已暂停 — 按 P 继续。'},
  uzCsakMunkas:{hu:'Építeni csak munkás tud — előbb jelölj ki egyet.',en:'Only a worker can build — select one first.',de:'Nur ein Arbeiter kann bauen — wähle zuerst einen aus.',zh:'只有工人能建造 — 请先选中一个。'},
  uzNincsAnyagKettospont:{hu:'Nincs elég nyersanyag',en:'Not enough resources',de:'Nicht genug Rohstoffe',zh:'资源不足'},
  uzNemFer:{hu:'Ide nem fér el a fal.',en:'The wall does not fit here.',de:'Die Mauer passt hier nicht.',zh:'这里放不下城墙。'},
  uzFoglalt:{hu:'Ide nem építhetsz, foglalt a hely.',en:'You cannot build here, the space is taken.',de:'Hier kannst du nicht bauen, der Platz ist belegt.',zh:'此处已被占用，无法建造。'},
  uzKikotoPart:{hu:'A kikötőnek partra kell épülnie.',en:'A harbour must be built on the shore.',de:'Ein Hafen muss am Ufer gebaut werden.',zh:'港口必须建在岸边。'},
  uzEpitesMegszakitva:{hu:'Építés megszakítva.',en:'Building cancelled.',de:'Bau abgebrochen.',zh:'已取消建造。'},
  uzAlapokKijelolve:{hu:'Az alapok kijelölve — küldj oda munkást az építéshez!',en:'Foundations marked — send a worker to build it!',de:'Fundament markiert — schicke einen Arbeiter zum Bauen!',zh:'已标记地基 — 派工人前去建造！'},
  uzEpitsHq:{hu:'Építs főhadiszállást a munkásokhoz.',en:'Build a headquarters for workers.',de:'Baue ein Hauptquartier für Arbeiter.',zh:'建造司令部以训练工人。'},
  uzEpitsKaszarnya:{hu:'Építs kaszárnyát a katonákhoz.',en:'Build barracks for soldiers.',de:'Baue eine Kaserne für Soldaten.',zh:'建造兵营以训练士兵。'},
  uzKikepzesSor:{hu:'a kiképzési sorban.',en:'in the training queue.',de:'in der Ausbildungsschlange.',zh:'已加入训练队列。'},
  uzEgyHos:{hu:'Egyszerre csak egy hős vezetheti a sereget.',en:'Only one hero can lead the army at a time.',de:'Nur ein Held kann die Armee gleichzeitig führen.',zh:'同一时间只能有一位英雄统军。'},
  uzHosUton:{hu:'A hős már úton van.',en:'The hero is already on the way.',de:'Der Held ist bereits unterwegs.',zh:'英雄已在路上。'},
  uzGyulekezoMunkas:{hu:'Gyülekezőpont: a friss munkások ide járnak dolgozni.',en:'Rally point: new workers will come here to work.',de:'Sammelpunkt: neue Arbeiter kommen hierher zur Arbeit.',zh:'集结点：新工人将来此劳作。'},
  uzGyulekezoKatona:{hu:'Gyülekezőpont: a friss katonák ezt támadják.',en:'Rally point: new soldiers will attack this.',de:'Sammelpunkt: neue Soldaten greifen dies an.',zh:'集结点：新士兵将攻击此处。'},
  uzGyulekezo:{hu:'Gyülekezőpont kijelölve.',en:'Rally point set.',de:'Sammelpunkt gesetzt.',zh:'已设置集结点。'},
  uzJavitjak:{hu:'Munkások javítják',en:'Workers are repairing',de:'Arbeiter reparieren',zh:'工人正在修复'},
  uzSegitenek:{hu:'Munkások segítenek az építkezésen.',en:'Workers are helping with the construction.',de:'Arbeiter helfen beim Bau.',zh:'工人正在协助建造。'},
  uzKirakodas:{hu:'Kirakodás a parton.',en:'Unloading on the shore.',de:'Ausladen am Ufer.',zh:'正在岸边卸载。'},
  uzAtszallas:{hu:'Átszállás! Húzódj mellé.',en:'Boarding! Pull alongside.',de:'Entern! Längsseits gehen.',zh:'接舷！靠上去。'},
  uzTorjMeg:{hu:'Előbb törd meg — 40% alatt szállhatsz át.',en:'Break it first — you can board below 40%.',de:'Erst zerschlagen — entern geht unter 40%.',zh:'先打残 — 低于 40% 才能接舷。'},
  uzNincsMentes:{hu:'Nincs mentés.',en:'No save found.',de:'Kein Spielstand.',zh:'没有存档。'},
  uzMentve:{hu:'Mentve. A Folytatás gombbal bármikor visszatérhetsz.',en:'Saved. Use Continue to return at any time.',de:'Gespeichert. Mit Fortsetzen kehrst du jederzeit zurück.',zh:'已保存。随时可用“继续”返回。'},
  uzGyorsMentve:{hu:'Gyors mentés kész (F9: visszatöltés).',en:'Quick save done (F9 to load).',de:'Schnellspeichern fertig (F9 zum Laden).',zh:'快速保存完成（F9 读取）。'},
  uzVisszatoltve:{hu:'Mentés visszatöltve.',en:'Save loaded.',de:'Spielstand geladen.',zh:'存档已读取。'},
  uzMentesNemSikerult:{hu:'A mentés nem sikerült.',en:'Saving failed.',de:'Speichern fehlgeschlagen.',zh:'保存失败。'},
  uzBetoltesNemSikerult:{hu:'A mentés betöltése nem sikerült.',en:'Loading the save failed.',de:'Laden des Spielstands fehlgeschlagen.',zh:'读取存档失败。'},
  uzSerultMentes:{hu:'Sérült vagy régi mentés — nem tölthető be.',en:'Corrupt or old save — cannot be loaded.',de:'Beschädigter oder alter Spielstand — nicht ladbar.',zh:'存档损坏或版本过旧 — 无法读取。'},
  uzFajlbaMentve:{hu:'Állás elmentve fájlba.',en:'Game saved to a file.',de:'Spielstand in Datei gespeichert.',zh:'进度已保存到文件。'},
  uzSerultFajl:{hu:'Sérült mentésfájl.',en:'Corrupt save file.',de:'Beschädigte Spielstanddatei.',zh:'存档文件已损坏。'},
  uzBetoltve:{hu:'Állás betöltve',en:'Game loaded',de:'Spielstand geladen',zh:'进度已读取'},
  uzNetNemMenthet:{hu:'Többjátékos játszmát nem lehet menteni.',en:'A multiplayer match cannot be saved.',de:'Eine Mehrspielerpartie kann nicht gespeichert werden.',zh:'多人对局无法保存。'},
  uzKorszakKalozNincs:{hu:'A kalózvilágban nincs korszakváltás.',en:'There is no age advance in the pirate world.',de:'In der Piratenwelt gibt es keinen Zeitalterwechsel.',zh:'海盗世界没有时代更替。'},
  uzLegmagasabbKor:{hu:'Ez a legmagasabb elérhető korszak.',en:'This is the highest age available.',de:'Das ist das höchste verfügbare Zeitalter.',zh:'这已是最高时代。'},
  uzEpitsdKi:{hu:'Előbb építsd ki a birodalmat',en:'Build up the empire first',de:'Baue zuerst das Reich aus',zh:'先扩建你的帝国'},
  uzKeszEpulet:{hu:'kész épület kell (falak nélkül)',en:'finished buildings needed (walls excluded)',de:'fertige Gebäude nötig (ohne Mauern)',zh:'需要已完工的建筑（不含城墙）'},
  uzVezetesevel:{hu:'vezetésével.',en:'under the leadership of.',de:'unter der Führung von.',zh:'的领导下。'},
  uzPiacKell:{hu:'Piac kell hozzá.',en:'You need a market for that.',de:'Dafür brauchst du einen Markt.',zh:'这需要市场。'},
  uzNincsEleg:{hu:'Nincs elég',en:'Not enough',de:'Nicht genug',zh:'不足'},
  uzNincsAranyad:{hu:'Nincs elég aranyad',en:'You do not have enough gold',de:'Du hast nicht genug Gold',zh:'你的黄金不足'},
  uzEladva:{hu:'eladva',en:'sold for',de:'verkauft für',zh:'已售出'},
  uzMegveve:{hu:'megvéve',en:'bought for',de:'gekauft für',zh:'已购入'},
  uzAranyert:{hu:'aranyért',en:'gold',de:'Gold',zh:'黄金'},
  uzKereskedoIndult:{hu:'Kereskedőhajó indult a semleges kikötőbe',en:'A merchant ship has set out for the neutral port',de:'Ein Handelsschiff fuhr zum neutralen Hafen',zh:'商船已驶向中立港口'},
  uzKereskedoVissza:{hu:'A kereskedőhajó megfordult — hozza az aranyat.',en:'The merchant ship has turned back — the gold is coming.',de:'Das Handelsschiff kehrt um — das Gold kommt.',zh:'商船已返航 — 黄金正在运回。'},
  uzKereskedoBeert:{hu:'A kereskedőhajó beérkezett',en:'The merchant ship has arrived',de:'Das Handelsschiff ist eingetroffen',zh:'商船已抵达'},
  uzArannyalTer:{hu:'arannyal tér vissza.',en:'gold on return.',de:'Gold bei der Rückkehr.',zh:'黄金将随之返回。'},
  uzEloleptetve:{hu:'előléptetve',en:'promoted to',de:'befördert zu',zh:'晋升为'},
  uzUjonc:{hu:'újonc',en:'recruit',de:'Rekrut',zh:'新兵'},
  uzVeteran:{hu:'veterán',en:'veteran',de:'Veteran',zh:'老兵'},
  uzTamado:{hu:'Támadó',en:'Aggressive',de:'Angriff',zh:'进攻'},
  uzVisszavonulas:{hu:'Visszavonulás',en:'Retreat',de:'Rückzug',zh:'撤退'},
  uzHosEl:{hu:'A hősöd él és harcol.',en:'Your hero is alive and fighting.',de:'Dein Held lebt und kämpft.',zh:'你的英雄仍在战斗。'},
  uzKorhazKell:{hu:'Kórház kell hozzá: ott ápolják a sebesült hőst.',en:'You need a hospital: the wounded hero is nursed there.',de:'Du brauchst ein Krankenhaus: dort wird der verwundete Held gepflegt.',zh:'需要医院：受伤的英雄在那里疗养。'},
  uzHosVisszatert:{hu:'visszatért a csatatérre!',en:'has returned to the battlefield!',de:'ist auf das Schlachtfeld zurückgekehrt!',zh:'重返战场！'},
  uzAlcaFelderito:{hu:'Álcát csak felderítő ölthet.',en:'Only a scout can put on a disguise.',de:'Nur ein Späher kann sich verkleiden.',zh:'只有侦察兵可以伪装。'},
  uzAlcaFel:{hu:'felderítő álruhát öltött — ne menj túl közel hozzájuk!',en:'scouts have put on disguises — do not get too close to them!',de:'Späher haben sich verkleidet — komm ihnen nicht zu nahe!',zh:'侦察兵已换装 — 别靠得太近！'},
  uzAlcaLe:{hu:'Az álca lekerült.',en:'The disguise is off.',de:'Die Verkleidung ist weg.',zh:'伪装已解除。'},
  uzKemLelepleztek:{hu:'Felismerték a kémedet!',en:'Your spy has been recognised!',de:'Dein Spion wurde erkannt!',zh:'你的间谍被识破了！'},
  uzToronyLeleplezte:{hu:'Az őrtorony leleplezte a kémedet!',en:'The watchtower has exposed your spy!',de:'Der Wachturm hat deinen Spion enttarnt!',zh:'瞭望塔识破了你的间谍！'},
  uzGyujtogatas:{hu:'Gyújtogatás',en:'Arson',de:'Brandstiftung',zh:'纵火'},
  uzAlcaLeesik:{hu:'vigyázz, az álca leesik!',en:'careful, the disguise falls off!',de:'Vorsicht, die Verkleidung fällt!',zh:'小心，伪装会掉！'},
  uzLangraKapott:{hu:'Lángra kapott',en:'Set ablaze',de:'In Brand gesetzt',zh:'已起火'},
  uzAtomKutatas:{hu:'Előbb kutasd ki az atomprogramot az akadémián.',en:'Research the atomic programme at the academy first.',de:'Erforsche zuerst das Atomprogramm in der Akademie.',zh:'请先在学院研究原子计划。'},
  uzJelöljBombazot:{hu:'Jelölj ki egy bombázót.',en:'Select a bomber.',de:'Wähle einen Bomber aus.',zh:'请选择一架轰炸机。'},
  uzToltetElfogyott:{hu:'A töltet elfogyott — újabb atomprogramot kell kutatni.',en:'The charge is spent — research another atomic programme.',de:'Die Ladung ist verbraucht — erforsche ein neues Atomprogramm.',zh:'弹药已用尽 — 需要再研究一次原子计划。'},
  uzValasszCelpont:{hu:'Válaszd ki a célpontot a térképen.',en:'Choose the target on the map.',de:'Wähle das Ziel auf der Karte.',zh:'在地图上选择目标。'},
  uzBombazoUton:{hu:'A bombázó úton van a célpont felé.',en:'The bomber is on its way to the target.',de:'Der Bomber ist auf dem Weg zum Ziel.',zh:'轰炸机正飞向目标。'},
  uzAtomMegszakitva:{hu:'Atomcsapás megszakítva.',en:'Atomic strike cancelled.',de:'Atomschlag abgebrochen.',zh:'已取消原子打击。'},
  uzPestis:{hu:'Pestis ütött ki a bázison! A kórház gyógyítása most sokat ér.',en:'Plague has broken out at the base! Healing at the hospital counts for much now.',de:'Die Pest ist im Lager ausgebrochen! Heilung im Krankenhaus zählt jetzt viel.',zh:'基地爆发瘟疫！此时医院的治疗尤为重要。'},
  uzRoncs:{hu:'Roncs sodródott partra — arany hever a fövenyen. Küldj érte munkást!',en:'A wreck has washed ashore — gold lies on the sand. Send a worker for it!',de:'Ein Wrack wurde angespült — Gold liegt im Sand. Schick einen Arbeiter!',zh:'一艘残骸被冲上岸 — 沙滩上有黄金。派个工人去取！'},
  uzZsakmany:{hu:'Zsákmány',en:'Plunder',de:'Beute',zh:'战利品'},
  uzArany:{hu:'arany a kereskedőhajóról!',en:'gold from the merchant ship!',de:'Gold vom Handelsschiff!',zh:'来自商船的黄金！'},
  uzZsoldos:{hu:'zsoldos ajánlkozik',en:'mercenaries offer their service for',de:'Söldner bieten sich an für',zh:'名雇佣兵愿以'},
  uzElfogadod:{hu:'Elfogadod?',en:'Do you accept?',de:'Nimmst du an?',zh:'是否接受？'},
  uzVandorloZsoldos:{hu:'Vándorló zsoldosok',en:'Wandering mercenaries',de:'Wandernde Söldner',zh:'流浪雇佣兵'},
  uzAjanlkozik:{hu:'ajánlkozik',en:'offer their service for',de:'bieten sich an für',zh:'愿以'},
  uzNincsAranyad2:{hu:'Nincs elég aranyad.',en:'You do not have enough gold.',de:'Du hast nicht genug Gold.',zh:'你的黄金不足。'},
  uzKeret:{hu:'Elérted a seregkeretet.',en:'Army limit reached.',de:'Armeegrenze erreicht.',zh:'已达军队上限。'},
  uzTetlenNincs:{hu:'Nincs tétlen munkás.',en:'No idle worker.',de:'Kein untätiger Arbeiter.',zh:'没有闲置工人。'},
  uzTetlenKijelolve:{hu:'tétlen munkás kijelölve',en:'idle workers selected',de:'untätige Arbeiter ausgewählt',zh:'个闲置工人已选中'},
  uzJelöljEgysegeket:{hu:'Előbb jelölj ki egységeket.',en:'Select some units first.',de:'Wähle zuerst Einheiten aus.',zh:'请先选择单位。'},
  uzCsoportLetre:{hu:'csoport létrehozva',en:'group created',de:'Gruppe erstellt',zh:'号编队已创建'},
  uzCsoportUres:{hu:'csoport üres.',en:'group is empty.',de:'Gruppe ist leer.',zh:'号编队为空。'},
  uzCsoportKijelolve:{hu:'csoport kijelölve',en:'group selected',de:'Gruppe ausgewählt',zh:'号编队已选中'},
  uzEgyseg:{hu:'egység',en:'units',de:'Einheiten',zh:'个单位'},
  uzKatonaKijelolve:{hu:'katona kijelölve.',en:'soldiers selected.',de:'Soldaten ausgewählt.',zh:'名士兵已选中。'},
  uzNincsKatona:{hu:'Nincs kiképzett katonád.',en:'You have no trained soldiers.',de:'Du hast keine ausgebildeten Soldaten.',zh:'你还没有训练好的士兵。'},
  uzMunkasKijelolve:{hu:'munkás kijelölve.',en:'workers selected.',de:'Arbeiter ausgewählt.',zh:'名工人已选中。'},
  uzBillKurzorBe:{hu:'Billentyűkurzor bekapcsolva. Nyilak: mozgatás, szóköz: kijelölés, Enter: parancs.',en:'Keyboard cursor on. Arrows: move, space: select, Enter: order.',de:'Tastaturcursor an. Pfeile: bewegen, Leertaste: auswählen, Enter: Befehl.',zh:'键盘光标已开启。方向键：移动，空格：选择，回车：下令。'},
  uzBillKurzorKi:{hu:'Billentyűkurzor kikapcsolva.',en:'Keyboard cursor off.',de:'Tastaturcursor aus.',zh:'键盘光标已关闭。'},
  uzBillLista:{hu:'Billentyűlista megnyitva',en:'Key list opened',de:'Tastenliste geöffnet',zh:'已打开按键列表'},
  uzValasszIdeologiat:{hu:'Válassz ideológiát',en:'Choose a doctrine',de:'Wähle eine Doktrin',zh:'选择理念'},
  uzIdeologia:{hu:'Ideológia',en:'Doctrine',de:'Doktrin',zh:'理念'},
  uzKuldetes:{hu:'küldetés',en:'mission',de:'Mission',zh:'关'},
  uzRadBizza:{hu:'rád bízza a hadvezetést.',en:'entrusts the command to you.',de:'überträgt dir das Kommando.',zh:'将指挥权交给你。'},
  uzFotomod:{hu:'Fotómód — a felület eltűnt. Esc: kilépés.',en:'Photo mode — the interface is hidden. Esc: exit.',de:'Fotomodus — die Oberfläche ist ausgeblendet. Esc: beenden.',zh:'摄影模式 — 界面已隐藏。Esc：退出。'},
  uzKepMentve:{hu:'Kép elmentve',en:'Image saved',de:'Bild gespeichert',zh:'图片已保存'},
  uzKepNemSikerult:{hu:'A kép mentése nem sikerült.',en:'Saving the image failed.',de:'Speichern des Bildes fehlgeschlagen.',zh:'图片保存失败。'},
  uzTeljesitmeny:{hu:'Teljesítmény',en:'Achievement',de:'Erfolg',zh:'成就'},
  uzOktatoVege:{hu:'Az oktatómód véget ért — a játék folytatódik.',en:'The tutorial is over — the game continues.',de:'Das Tutorial ist vorbei — das Spiel geht weiter.',zh:'教程结束 — 游戏继续。'},
  pmVissza:{hu:'vissza',en:'back',de:'zurück',zh:'返回'},
  pmKereskedes:{hu:'kereskedés',en:'trade',de:'Handel',zh:'贸易'},
  pmGyogyitas:{hu:'gyógyítás',en:'healing',de:'Heilung',zh:'治疗'},
  pmKikepzes:{hu:'kiképzés',en:'training',de:'Ausbildung',zh:'训练'},
  pmVedtelen:{hu:'védtelen',en:'undefended',de:'ungeschützt',zh:'无防御'},
  pmVediPartot:{hu:'védi a partot · legfeljebb 4',en:'guards the shore · at most 4',de:'schützt die Küste · höchstens 4',zh:'守卫海岸 · 最多 4 座'},
  pmSzlup:{hu:'SZLÚP',en:'SLOOP',de:'SLUP',zh:'单桅帆船'},
  pmGalya:{hu:'GÁLYA',en:'GALLEY',de:'GALEERE',zh:'桨帆船'},
  pmSzlupAl:{hu:'gyors · 8–12 ágyú · legénységet visz',en:'fast · 8–12 guns · carries crew',de:'schnell · 8–12 Kanonen · trägt Mannschaft',zh:'快速 · 8–12 门炮 · 可载船员'},
  pmGalyaAl:{hu:'40–60 ágyú · nehéz',en:'40–60 guns · heavy',de:'40–60 Kanonen · schwer',zh:'40–60 门炮 · 重型'},
  pmNemEpithetsz:{hu:'Ebből már nem építhetsz többet.',en:'You cannot build any more of these.',de:'Davon kannst du nichts mehr bauen.',zh:'此类建筑已达上限。'},
  pmNincsHely:{hu:'Nincs szabad hely a városban.',en:'There is no free space in the town.',de:'In der Stadt ist kein Platz frei.',zh:'城中没有空位了。'},
  pmFo:{hu:'fő',en:'crew',de:'Mann',zh:'人'},
  pmLegenyseg:{hu:'legénység',en:'crew',de:'Mannschaft',zh:'船员'},
  pmAgyu:{hu:'ágyú',en:'guns',de:'Kanonen',zh:'门炮'},
  pmFedelzeten:{hu:'fő a fedélzeten',en:'aboard',de:'an Bord',zh:'人在船上'},
  tGolyo:{hu:'Golyó',en:'Round shot',de:'Vollkugel',zh:'实心弹'},
  tGolyoAl:{hu:'a testet töri',en:'breaks the hull',de:'bricht den Rumpf',zh:'破坏船体'},
  tLancos:{hu:'Láncos',en:'Chain shot',de:'Kettenkugel',zh:'链弹'},
  tLancosAl:{hu:'árbocot tép · lassít',en:'tears masts · slows',de:'reißt Masten · verlangsamt',zh:'撕裂桅杆 · 减速'},
  tKartacs:{hu:'Kartács',en:'Grapeshot',de:'Kartätsche',zh:'霰弹'},
  tKartacsAl:{hu:'a legénységet söpri',en:'sweeps the crew',de:'fegt die Mannschaft',zh:'扫荡船员'},
  hnKiralyHajohad:{hu:'A király hajóhada készül ellened!',en:'The king’s fleet is preparing against you!',de:'Die Flotte des Königs rüstet gegen dich!',zh:'国王的舰队正准备对付你！'},
  hnKormanyzo:{hu:'A neved eljutott a kormányzóhoz.',en:'Your name has reached the governor.',de:'Dein Name ist beim Gouverneur angekommen.',zh:'你的名字已传到总督耳中。'},
  hnTerjed:{hu:'Terjed a híred a szigeteken.',en:'Your fame is spreading through the islands.',de:'Dein Ruf verbreitet sich auf den Inseln.',zh:'你的名声正在群岛传开。'},
  hnHadihajo:{hu:'hadihajó tart feléd!',en:'warships are heading your way!',de:'Kriegsschiffe kommen auf dich zu!',zh:'艘战舰正朝你驶来！'},
  hnTiszta:{hu:'Nincs mit megbocsátani — a neved még tiszta.',en:'Nothing to pardon — your name is still clean.',de:'Nichts zu vergeben — dein Name ist noch rein.',zh:'无需赦免 — 你的名声尚清白。'},
  hnEgyVaros:{hu:'Csak egyetlen városod van — a király nem alkuszik kevesebbre, mint egy második.',en:'You have only one town — the king will not settle for less than a second.',de:'Du hast nur eine Stadt — der König gibt sich mit weniger als einer zweiten nicht zufrieden.',zh:'你只有一座城 — 国王的价码不低于第二座。'},
  hnNincsVaros:{hu:'Nincs városod, amit a király elvehetne.',en:'You have no town for the king to take.',de:'Du hast keine Stadt, die der König nehmen könnte.',zh:'你没有可供国王索取的城池。'},
  hnKegyelem:{hu:'Kegyelemlevél: a neved tiszta — de',en:'Letter of pardon: your name is clean — but',de:'Gnadenbrief: dein Name ist rein — aber',zh:'赦免令：你的名声已清白 — 但'},
  hnKoronae:{hu:'a koronáé lett',en:'has passed to the crown',de:'ging an die Krone',zh:'已归王室所有'},
  hnToronyLedolt:{hu:'Egy torony ledőlt — még',en:'A tower has fallen — still',de:'Ein Turm ist gefallen — noch',zh:'一座塔楼倒塌 — 还剩'},
  hnAll:{hu:'áll.',en:'standing.',de:'steht.',zh:'座屹立。'},
  netHazigazda:{hu:'Házigazda',en:'Host',de:'Gastgeber',zh:'房主'},
  netVendeg:{hu:'Vendég',en:'Guest',de:'Gast',zh:'访客'},
  netLezarult:{hu:'A kapcsolat lezárult.',en:'The connection has closed.',de:'Die Verbindung wurde beendet.',zh:'连接已断开。'},
  netNemSikerult:{hu:'Nem sikerült csatlakozni',en:'Could not connect',de:'Verbindung fehlgeschlagen',zh:'无法连接'},
  netHibasCim:{hu:'Hibás cím',en:'Invalid address',de:'Ungültige Adresse',zh:'地址无效'},
  netElteroValtozat:{hu:'Eltérő játékváltozat: nálad',en:'Different game version: yours is',de:'Abweichende Spielversion: bei dir',zh:'游戏版本不一致：你的是'},
  netTarsnal:{hu:'a társnál',en:'the partner has',de:'beim Mitspieler',zh:'对方的是'},
  netUgyanaz:{hu:'Ugyanazt a változatot kell futtatnotok.',en:'You must both run the same version.',de:'Ihr müsst dieselbe Version ausführen.',zh:'双方必须运行相同版本。'},
  netSzetcsuszott:{hu:'A két játék szétcsúszott — a játszma megáll.',en:'The two games have drifted apart — the match stops.',de:'Die beiden Spiele sind auseinandergelaufen — die Partie stoppt.',zh:'两端已不同步 — 对局中止。'},
  netTarsKilepett:{hu:'A társ kilépett.',en:'Your partner has left.',de:'Der Mitspieler hat verlassen.',zh:'对方已退出。'},
  netHiba:{hu:'Hálózati hiba',en:'Network error',de:'Netzwerkfehler',zh:'网络错误'},
  netJatszmaIndul:{hu:'Többjátékos játszma indul',en:'Multiplayer match starting',de:'Mehrspielerpartie startet',zh:'多人对局开始'},
  netTeVagyHazigazda:{hu:'te vagy a házigazda',en:'you are the host',de:'du bist der Gastgeber',zh:'你是房主'},
  epJavitas:{hu:'Javítás',en:'Repair',de:'Reparieren',zh:'修复'},
  epFolytatas:{hu:'Építés folytatása',en:'Resume building',de:'Bau fortsetzen',zh:'继续建造'},
  epMunkasokIde:{hu:'munkások ide',en:'workers here',de:'Arbeiter hierher',zh:'工人到此'},
  epKapuNyitas:{hu:'Kapu nyitása',en:'Open a gate',de:'Tor öffnen',zh:'开设城门'},
  epKapuAl:{hu:'A falszakasz kapuvá alakul — a saját egységeid átjárnak rajta',en:'The wall section becomes a gate — your own units pass through it',de:'Der Mauerabschnitt wird zum Tor — deine Einheiten gehen hindurch',zh:'该段城墙将变为城门 — 你的单位可通行'},
  epLerombolas:{hu:'Lerombolás',en:'Demolish',de:'Abreißen',zh:'拆除'},
  epAtomcsapas:{hu:'Atomcsapás',en:'Atomic strike',de:'Atomschlag',zh:'原子打击'},
  epFelhasznalva:{hu:'felhasználva',en:'used',de:'verbraucht',zh:'已使用'},
  epJeloldCelt:{hu:'jelöld ki a célt',en:'mark the target',de:'markiere das Ziel',zh:'标记目标'},
  epKesz:{hu:'kész',en:'done',de:'fertig',zh:'已完成'},
  epKovKorszak:{hu:'köv. korszakban',en:'next age',de:'nächstes Zeitalter',zh:'下个时代'},
  epEpul:{hu:'épül',en:'building',de:'im Bau',zh:'建造中'},
  epGyulekezo:{hu:'jobb klikk: gyülekezőpont',en:'right-click: rally point',de:'Rechtsklick: Sammelpunkt',zh:'右键：集结点'},
  epBelepes:{hu:'Belépés',en:'Entry',de:'Eintritt',zh:'进入'},
  epNincsTovabb:{hu:'Nincs tovább.',en:'No further.',de:'Nicht weiter.',zh:'没有更高级了。'},
  epVegsoKorszak:{hu:'Végső korszak',en:'Final age',de:'Letztes Zeitalter',zh:'最终时代'},
  piVetel:{hu:'vétel',en:'buy',de:'Kauf',zh:'买入'},
  piEladas:{hu:'eladás',en:'sell',de:'Verkauf',zh:'卖出'},
  kemVisszahivas:{hu:'visszahívása',en:'recall',de:'zurückrufen',zh:'召回'},
  kemAlcaLe:{hu:'Álca levétele',en:'Remove disguise',de:'Verkleidung ablegen',zh:'解除伪装'},
  kemAlcaFel:{hu:'Álruha felöltése',en:'Put on a disguise',de:'Verkleidung anlegen',zh:'换上伪装'},
  kemGyujtogatasAl:{hu:'jobb klikk ellenséges épületre: gyújtogatás',en:'right-click an enemy building: arson',de:'Rechtsklick auf feindliches Gebäude: Brandstiftung',zh:'右键点击敌方建筑：纵火'},
  kemNemLonek:{hu:'álruhában nem lőnek rád',en:'in disguise they will not shoot at you',de:'in Verkleidung schießt niemand auf dich',zh:'伪装时敌人不会向你开火'},
  szallitoAl:{hu:'csapatszállító — fedélzeten',en:'troop transport — aboard',de:'Truppentransporter — an Bord',zh:'运兵船 — 船上'},
  szallitoKirak:{hu:'fő. Jobb klikk a partra: kirakodás.',en:'aboard. Right-click the shore to unload.',de:'an Bord. Rechtsklick ans Ufer zum Ausladen.',zh:'人。右键点击岸边卸载。'},
  derult:{hu:'derült',en:'clear',de:'klar',zh:'晴'},
  kalozAranykora:{hu:'A kalózok aranykora',en:'The golden age of piracy',de:'Das goldene Zeitalter der Piraterie',zh:'海盗黄金时代'},
  szazad1819:{hu:'18—19. század',en:'18th–19th century',de:'18.—19. Jahrhundert',zh:'18—19世纪'},
});

function T(kulcs){
  const e=SZOTAR[kulcs];
  if(!e) return kulcs;
  return e[LANG]||e.hu;
}

/* --- Nevek: egységek, épületek, nemzetek ---
   Csak azt soroljuk fel, ami eltér a magyartól. A hiányzó bejegyzések
   magyarul maradnak, így egy félkész fordítás sem törik el. */
const NEVEK={
 en:{
  units:{worker:['Serf','Peasant','Labourer','Worker'],
    /* A magyar sorban Gránátos áll, nem huszár — a régi fordítás
       tévedett. Most, hogy külön lovas vonal van, az ütközés is
       megszűnik: a huszár oda tartozik. */
    melee:['Knight','Cuirassier','Grenadier','Tank'],
    cav:['Light horse','Hussar','Uhlan','Armoured scout'],
    ranged:['Archer','Musketeer','Rifleman','Machine gunner'],
    spear:['Pikeman','Lancer','Bayonet infantry','Anti-tank gunner'],
    priest:['Monk','Priest','Chaplain','Officer'],
    medic:['Barber','Field surgeon','Field doctor','Medic'],
    spy:['Informer','Spy','Agent','Intelligence officer'],
    siege:['Catapult','Mortar','Howitzer','Artillery'],
    ram:['Battering ram','Battering ram','Siege ram','Demolition squad'],
    siegetower:['Siege tower','Siege tower','Assault bridge','Assault vehicle'],
    hero:['Hero','Hero','Hero','Hero'],
    fisher:['Fishing boat','Fishing ship','Steam trawler','Trawler'],
    warship:['War galley','Frigate','Gunboat','Destroyer'],
    galleon:['Galleon','Galleon','Galleon','Galleon'],
    transport:['Barge','Transport ship','Troop ship','Landing ship'],
    scout:['Scout plane','Scout plane','Scout plane','Reconnaissance plane'],
    fighter:['Fighter','Fighter','Fighter','Fighter'],
    bomber:['Bomber','Bomber','Bomber','Bomber']},
  builds:{hq:['Castle','Palace','Government house','Headquarters'],
    barracks:['Barracks','Barracks','Barracks','Barracks'],
    stable:['Stable','Cavalry stable','Hussar barracks','Motor pool'],
    harbor:['Fishing harbour','Harbour','Port','Naval base'],
    temple:['Monastery','Church','Cathedral','Chapel'],
    academy:['Academy','Academy','Polytechnic','Research institute'],
    farm:['Farm','Farm','Estate','Collective farm'],
    tower:['Watchtower','Star bastion','Fort tower','Anti-tank post'],
    wall:['Stone wall','Bastion wall','Brick wall','Bunker'],
    gate:['Gate','Bastion gate','Brick gate','Bunker gate'],
    house:['Timber house','Stone house','Town house','Housing block'],
    airfield:['Airfield','Airfield','Airfield','Airfield'],
    smith:['Smithy','Armoury','Factory','War plant'],
    hospital:['Infirmary','Hospital','Clinic','Field hospital'],
    market:['Market','Market hall','Exchange','Trading house'],
    goldmine:['Gold mine','Gold mine','Gold mine','Gold mine'],
    sugar:['Sugar plantation','Sugar plantation','Sugar plantation','Sugar plantation'],
    lumber:['Lumber camp','Lumber camp','Lumber camp','Lumber camp']},
  nations:{hu:'Hungary',at:'Austria',pl:'Poland',de:'Germany',fr:'France',
    gb:'Great Britain',ru:'Russia',es:'Spain',nat:'Islanders',
    ns:'Nassau',bb:'Blackbeard',sb:'Stede Bonnet'}
 },
 de:{
  units:{worker:['Leibeigener','Bauer','Arbeiter','Arbeiter'],
    melee:['Ritter','Kürassier','Grenadier','Panzer'],
    cav:['Leichte Reiterei','Husar','Ulan','Spähpanzer'],
    ranged:['Bogenschütze','Musketier','Schütze','MG-Schütze'],
    spear:['Pikenier','Lanzenreiter','Bajonettinfanterie','Panzerjäger'],
    priest:['Mönch','Priester','Feldgeistlicher','Offizier'],
    medic:['Bader','Feldscher','Feldarzt','Sanitäter'],
    spy:['Kundschafter','Spion','Agent','Nachrichtenoffizier'],
    siege:['Katapult','Mörser','Haubitze','Artillerie'],
    ram:['Rammbock','Rammbock','Sturmbock','Sprengtrupp'],
    siegetower:['Belagerungsturm','Belagerungsturm','Sturmbrücke','Sturmfahrzeug'],
    hero:['Held','Held','Held','Held'],
    fisher:['Fischerboot','Fischerschiff','Fischdampfer','Trawler'],
    warship:['Kriegsgaleere','Fregatte','Kanonenboot','Zerstörer'],
    galleon:['Galeone','Galeone','Galeone','Galeone'],
    transport:['Prahm','Transportschiff','Truppenschiff','Landungsschiff'],
    scout:['Aufklärer','Aufklärer','Aufklärer','Aufklärungsflugzeug'],
    fighter:['Jäger','Jäger','Jäger','Jagdflugzeug'],
    bomber:['Bomber','Bomber','Bomber','Bomber']},
  builds:{hq:['Burg','Palast','Regierungshaus','Hauptquartier'],
    barracks:['Kaserne','Kaserne','Kaserne','Kaserne'],
    stable:['Stall','Reiterstall','Husarenkaserne','Fuhrpark'],
    harbor:['Fischerhafen','Hafen','Hafen','Marinestützpunkt'],
    temple:['Kloster','Kirche','Kathedrale','Kapelle'],
    academy:['Akademie','Akademie','Polytechnikum','Forschungsinstitut'],
    farm:['Bauernhof','Bauernhof','Gut','Kolchose'],
    tower:['Wachturm','Sternbastion','Festungsturm','Panzerabwehrstellung'],
    wall:['Steinmauer','Bastionsmauer','Ziegelmauer','Bunker'],
    gate:['Tor','Bastionstor','Ziegeltor','Bunkertor'],
    house:['Holzhaus','Steinhaus','Bürgerhaus','Wohnblock'],
    airfield:['Flugplatz','Flugplatz','Flugplatz','Flugplatz'],
    smith:['Schmiede','Zeughaus','Fabrik','Rüstungswerk'],
    hospital:['Spital','Krankenhaus','Klinik','Feldlazarett'],
    market:['Marktplatz','Markthalle','Börse','Handelshaus'],
    goldmine:['Goldmine','Goldmine','Goldmine','Goldmine'],
    sugar:['Zuckerrohrplantage','Zuckerrohrplantage','Zuckerrohrplantage','Zuckerrohrplantage'],
    lumber:['Holzfällerlager','Holzfällerlager','Holzfällerlager','Holzfällerlager']},
  nations:{hu:'Ungarn',at:'Österreich',pl:'Polen',de:'Deutschland',fr:'Frankreich',
    gb:'Großbritannien',ru:'Russland',es:'Spanien',nat:'Inselbewohner',
    ns:'Nassau',bb:'Blackbeard',sb:'Stede Bonnet'}
 },
 zh:{
  units:{worker:['农奴','农民','劳工','工人'],
    melee:['骑士','胸甲骑兵','掷弹兵','坦克'],
    cav:['轻骑兵','骠骑兵','枪骑兵','侦察装甲车'],
    ranged:['弓箭手','火枪手','步枪兵','机枪手'],
    spear:['长矛兵','枪骑兵','刺刀步兵','反坦克兵'],
    priest:['修士','神父','随军牧师','军官'],
    medic:['理发师','军医','战地医生','卫生兵'],
    spy:['密探','间谍','特工','情报官'],
    siege:['投石机','臼炮','榴弹炮','火炮'],
    ram:['攻城槌','攻城槌','攻城槌','爆破队'],
    siegetower:['攻城塔','攻城塔','突击桥','突击车'],
    hero:['英雄','英雄','英雄','英雄'],
    fisher:['渔船','渔船','蒸汽渔船','拖网渔船'],
    warship:['战船','护卫舰','炮舰','驱逐舰'],
    galleon:['盖伦帆船','盖伦帆船','盖伦帆船','盖伦帆船'],
    transport:['驳船','运输船','运兵船','登陆舰'],
    scout:['侦察机','侦察机','侦察机','侦察机'],
    fighter:['战斗机','战斗机','战斗机','战斗机'],
    bomber:['轰炸机','轰炸机','轰炸机','轰炸机']},
  builds:{hq:['城堡','宫殿','政府大楼','司令部'],
    barracks:['兵营','兵营','兵营','兵营'],
    stable:['马厩','骑兵马厩','骠骑兵营','车辆场'],
    harbor:['渔港','港口','港口','海军基地'],
    temple:['修道院','教堂','大教堂','礼拜堂'],
    academy:['学院','学院','理工学院','研究所'],
    farm:['农场','农场','庄园','集体农庄'],
    tower:['瞭望塔','星形棱堡','要塞塔','反坦克阵地'],
    wall:['石墙','棱堡墙','砖墙','碉堡'],
    gate:['城门','棱堡门','砖门','碉堡门'],
    house:['木屋','石屋','市民住宅','住宅楼'],
    airfield:['机场','机场','机场','机场'],
    smith:['铁匠铺','军械库','工厂','军工厂'],
    hospital:['医务所','医院','诊所','野战医院'],
    market:['集市','市场大厅','交易所','商行'],
    goldmine:['金矿','金矿','金矿','金矿'],
    sugar:['甘蔗种植园','甘蔗种植园','甘蔗种植园','甘蔗种植园'],
    lumber:['伐木场','伐木场','伐木场','伐木场']},
  nations:{hu:'匈牙利',at:'奥地利',pl:'波兰',de:'德国',fr:'法国',
    gb:'英国',ru:'俄国',es:'西班牙',nat:'岛民',
    ns:'拿骚',bb:'黑胡子',sb:'斯蒂德·邦尼特'}
 }
};

/* Egy egység neve az aktuális nyelven és korszakban. */
function unitName(role,age){
  const t=NEVEK[LANG];
  const n=t&&t.units&&t.units[role];
  if(n&&n[age]) return n[age];
  return (UNITS[role]&&UNITS[role].names[age])||role;
}
function buildName(type,age){
  const t=NEVEK[LANG];
  const n=t&&t.builds&&t.builds[type];
  if(n&&n[age]) return n[age];
  return (BUILDS[type]&&BUILDS[type].names[age])||type;
}
function nationName(key){
  const t=NEVEK[LANG];
  const n=t&&t.nations&&t.nations[key];
  return n||((NATIONS[key]&&NATIONS[key].name)||key);
}

/* A nyelv beállítása és megőrzése. */
function setLang(k){
  LANG=k;
  try{ tarolIr('birodalom_lang',k); }catch(e){}
  applyLang();
}
function loadLang(){
  try{
    const k=tarolOlvas('birodalom_lang');
    if(k&&NYELVEK.some(n=>n.k===k)) LANG=k;
  }catch(e){}
}
/* A felület feliratainak cseréje. A HTML-ben data-t attribútum jelöli,
   melyik elem melyik kulcsot használja. */
function applyLang(){
  if(typeof document==='undefined'||!document.querySelectorAll) return;
  /* data-t   — az elem saját felirata
     data-t2  — a benne álló <em> vagy <small> magyarázata
     data-t3  — a benne álló <span> állapotjelzője
     data-tc  — a második <td> a billentyűtáblában
     data-tph — beviteli mező helyőrzője
     data-ttl — az egérrel megjelenő buboréksúgó (title)
     A több attribútum azért kell, mert egy sorban két-három külön
     mondat áll: „Időjárás / eső és hó, hatással a látásra”. Ha csak a
     textContent-et cserélnénk, a magyarázat eltűnne. */
  const beallit=(e,k,valaszto)=>{
    if(!k) return;
    const cel=valaszto?e.querySelector(valaszto):e;
    if(cel) cel.textContent=T(k);
  };
  const l=document.querySelectorAll('[data-t],[data-t2],[data-t3],[data-tc],[data-tb],[data-tph],[data-ttl]');
  for(let i=0;i<l.length;i++){
    const e=l[i];
    const k=e.getAttribute('data-t');
    if(k){
      /* Ha az elemben külön <kbd>, <span> vagy <small> is van, csak az
         első szövegcsomópontot írjuk át — különben a billentyűjel vagy a
         darabszám-mutató elveszne.

         A `data-tfull` a kivétel: ott a fordítás a TELJES tartalom. Ez
         kellett a súgóbekezdéshez, amelyben <code> részletek vannak — ott
         a részleges csere miatt a fordítás a régi szöveg elé került, a
         maradék pedig ottmaradt, és a képernyőn minden duplán jelent meg.

         (Először úgy javítottam, hogy MINDEN gyerekes elemnél teljes
         cserét írtam elő — az viszont kitörölte a szobapanel
         darabszám-mutatóját. Ezért lett külön jelölés belőle.) */
      const elso=e.firstChild;
      const teljes=e.hasAttribute&&e.hasAttribute('data-tfull');
      if(!teljes&&elso&&elso.nodeType===3&&e.children.length) elso.nodeValue=T(k)+' ';
      else e.textContent=T(k);
    }
    const k2=e.getAttribute('data-t2');
    if(k2) beallit(e,k2, e.querySelector('em')?'em':'small');
    beallit(e,e.getAttribute('data-t3'),'span');
    const kc=e.getAttribute('data-tc');
    if(kc){ const td=e.querySelectorAll('td'); if(td[1]) td[1].textContent=T(kc); }
    const kb=e.getAttribute('data-tb');           // a billentyűtábla bal oszlopa
    if(kb){ const td=e.querySelectorAll('td'); if(td[0]) td[0].textContent=T(kb); }
    const kp=e.getAttribute('data-tph');
    if(kp&&'placeholder' in e) e.placeholder=T(kp);
    const kt=e.getAttribute('data-ttl');
    if(kt) e.setAttribute('title',T(kt));
  }
  /* A menü listái és a játék felülete a szótárból dolgoznak, de csak
     újrarajzoláskor — enélkül a nemzetek, tájak, korszakok magyarul
     maradnának a nyelvváltás után. */
  if(typeof renderNations==='function'&&document.getElementById('nations')) renderNations();
  if(typeof renderMaps==='function'&&document.getElementById('maps')) renderMaps();
  if(typeof renderEras==='function'&&document.getElementById('eras')) renderEras();
  if(typeof renderDiffs==='function'&&document.getElementById('diffs')) renderDiffs();
  if(typeof frissitFolytatas==='function') frissitFolytatas();
  /* A gyorsbillentyűk listája futásidőben épül, nincs rajta data-t. */
  if(typeof billLista==='function'&&document.getElementById('billList')) billLista();
  /* Az alakzatnevek és -leírások a betöltéskor egyszer épültek fel;
     nyelvváltáskor újra kell rakni őket. */
  if(typeof FORM_NEV==='object'&&FORM_NEV){
    FORM_NEV.line=T('vonal'); FORM_NEV.wedge=T('ek'); FORM_NEV.square=T('negyszog');
  }
  if(typeof FORM_LEIRAS==='object'&&FORM_LEIRAS){
    FORM_LEIRAS.line=T('alVonalAl'); FORM_LEIRAS.wedge=T('alEkAl'); FORM_LEIRAS.square=T('alNegyszogAl');
  }
  if(typeof szobaLista==='function'&&document.getElementById('szobaLista')&&SZOBA){
    szobaLista(); szobaBeallitasok();
  }
  if(typeof G!=='undefined'&&G.on&&typeof syncUI==='function'){ G.btnSig=''; syncUI(); }
  if(typeof G!=='undefined'&&G.on&&typeof updateEraLabel==='function') updateEraLabel();
}

/* --- Teljesítmények ---
   A nevek és leírások mind a négy nyelven. A hiányzó bejegyzések magyarul
   maradnak, így egy félkész fordítás sem töri el a listát. */
const ACH_FORD={
 en:{
  firstBlood:['First blood','Destroy your first enemy unit.'],
  builder:['Master builder','Have 20 finished buildings at once.'],
  town:['Town founder','Have 10 houses standing at once.'],
  goldRush:['Gold rush','Mine 1000 gold in a single game.'],
  lumber:['Master of the axe','Fell 2000 wood in a single game.'],
  age17:['Age of gunpowder','Reach the 17th century.'],
  age20:['Mechanised age','Reach the 20th century.'],
  warlord:['Warlord','Destroy 50 enemy units in a single game.'],
  sailor:['To the sea','Build your first warship.'],
  pilot:['On wings','Build your first aircraft.'],
  atomic:['Atomic age','Complete the atomic programme.'],
  gatekeeper:['Gatekeeper','Build a wall with a gate.'],
  victor:['Conqueror','Win your first game.'],
  campaign:['Lord of the empire','Complete a full campaign.'],
  mason:['Mason','Build 20 wall segments.'],
  fortress:['Fortress system','Have 6 towers standing at once.'],
  metropolis:['Metropolis','Have 20 houses standing at once.'],
  quarry:['Quarry','Mine 1500 stone in a single game.'],
  coalman:['Miner','Mine 800 coal in a single game.'],
  granary:['Granary','Gather 3000 food in a single game.'],
  age19:['Age of steam','Reach the 19th century.'],
  bloodbath:['Bloodbath','Destroy 150 enemy units in a single game.'],
  horde:['Great army','Have 60 units at once.'],
  navy:['War fleet','Have 8 warships at once.'],
  airfleet:['Air supremacy','Have 6 aircraft at once.'],
  bomberman:['Bomber commander','Destroy 10 buildings with bombers.'],
  upgMax:['Scholar','Research every upgrade to its maximum.'],
  doctAll:['Statesman','Choose a doctrine in every age.'],
  desertFox:['Desert fox','Win on a desert map.'],
  mountain:['Mountain man','Win on a mountain map.'],
  nations7:['Globetrotter','Play with every nation.'],
  maps8:['Cartographer','Play on every map type.'],
  hardWin:['Hard-won victory','Win on hard difficulty.'],
  halfCamp:['Halfway','Complete half of a campaign.'],
  speedAge:['Lightning progress','Reach the 17th century within 8 minutes.']
 },
 de:{
  firstBlood:['Erstes Blut','Vernichte die erste feindliche Einheit.'],
  builder:['Baumeister','Habe 20 fertige Gebäude gleichzeitig.'],
  town:['Stadtgründer','Habe 10 Wohnhäuser gleichzeitig.'],
  goldRush:['Goldrausch','Fördere 1000 Gold in einer Partie.'],
  lumber:['Meister der Axt','Schlage 2000 Holz in einer Partie.'],
  age17:['Zeitalter des Schießpulvers','Erreiche das 17. Jahrhundert.'],
  age20:['Maschinenzeitalter','Erreiche das 20. Jahrhundert.'],
  warlord:['Heerführer','Vernichte 50 feindliche Einheiten in einer Partie.'],
  sailor:['Auf zur See','Baue dein erstes Kriegsschiff.'],
  pilot:['Auf Schwingen','Baue dein erstes Flugzeug.'],
  atomic:['Atomzeitalter','Schließe das Atomprogramm ab.'],
  gatekeeper:['Torwächter','Baue eine Mauer mit Tor.'],
  victor:['Eroberer','Gewinne deine erste Partie.'],
  campaign:['Herr des Reiches','Schließe einen ganzen Feldzug ab.'],
  mason:['Steinmetz','Baue 20 Mauerabschnitte.'],
  fortress:['Festungssystem','Habe 6 Türme gleichzeitig.'],
  metropolis:['Großstadt','Habe 20 Wohnhäuser gleichzeitig.'],
  quarry:['Steinbruch','Fördere 1500 Stein in einer Partie.'],
  coalman:['Bergmann','Fördere 800 Kohle in einer Partie.'],
  granary:['Kornspeicher','Sammle 3000 Nahrung in einer Partie.'],
  age19:['Zeitalter des Dampfes','Erreiche das 19. Jahrhundert.'],
  bloodbath:['Blutbad','Vernichte 150 feindliche Einheiten in einer Partie.'],
  horde:['Großes Heer','Habe 60 Einheiten gleichzeitig.'],
  navy:['Kriegsflotte','Habe 8 Kriegsschiffe gleichzeitig.'],
  airfleet:['Luftherrschaft','Habe 6 Flugzeuge gleichzeitig.'],
  bomberman:['Bomberkommandeur','Zerstöre 10 Gebäude mit Bombern.'],
  upgMax:['Gelehrter','Erforsche jede Verbesserung bis zum Maximum.'],
  doctAll:['Staatsmann','Wähle in jedem Zeitalter eine Doktrin.'],
  desertFox:['Wüstenfuchs','Gewinne auf einer Wüstenkarte.'],
  mountain:['Bergmensch','Gewinne auf einer Bergkarte.'],
  nations7:['Weltenbummler','Spiele mit jeder Nation.'],
  maps8:['Kartograph','Spiele auf jedem Kartentyp.'],
  hardWin:['Schwer erkämpft','Gewinne auf schwerem Schwierigkeitsgrad.'],
  halfCamp:['Halbzeit','Schließe einen halben Feldzug ab.'],
  speedAge:['Blitzentwicklung','Erreiche das 17. Jahrhundert in 8 Minuten.']
 },
 zh:{
  firstBlood:['首战告捷','消灭第一个敌方单位。'],
  builder:['建筑大师','同时拥有20座完工的建筑。'],
  town:['城镇奠基者','同时拥有10座民居。'],
  goldRush:['淘金热','单局开采1000黄金。'],
  lumber:['伐木能手','单局砍伐2000木材。'],
  age17:['火药时代','进入17世纪。'],
  age20:['机械时代','进入20世纪。'],
  warlord:['统帅','单局消灭50个敌方单位。'],
  sailor:['扬帆出海','建造第一艘战船。'],
  pilot:['展翅高飞','建造第一架飞机。'],
  atomic:['原子时代','完成原子计划。'],
  gatekeeper:['守门人','建造带城门的城墙。'],
  victor:['征服者','赢得第一场胜利。'],
  campaign:['帝国之主','完成一整场战役。'],
  mason:['石匠','建造20段城墙。'],
  fortress:['要塞体系','同时拥有6座塔楼。'],
  metropolis:['大都市','同时拥有20座民居。'],
  quarry:['采石场','单局开采1500石料。'],
  coalman:['矿工','单局开采800煤炭。'],
  granary:['粮仓','单局收集3000食物。'],
  age19:['蒸汽时代','进入19世纪。'],
  bloodbath:['血战','单局消灭150个敌方单位。'],
  horde:['大军','同时拥有60个单位。'],
  navy:['战斗舰队','同时拥有8艘战船。'],
  airfleet:['制空权','同时拥有6架飞机。'],
  bomberman:['轰炸机指挥官','用轰炸机摧毁10座建筑。'],
  upgMax:['学者','将每项升级研究到最高级。'],
  doctAll:['政治家','在每个时代都选择一项理念。'],
  desertFox:['沙漠之狐','在沙漠地图上获胜。'],
  mountain:['山地之人','在山地地图上获胜。'],
  nations7:['环球旅行者','用每个国家都游玩一次。'],
  maps8:['制图师','在每种地图上都游玩一次。'],
  hardWin:['艰难的胜利','在困难难度下获胜。'],
  halfCamp:['过半','完成半场战役。'],
  speedAge:['闪电发展','8分钟内进入17世纪。']
 }
};
/* Egy teljesítmény neve és leírása az aktuális nyelven. */
function achName(k,alap){
  const t=ACH_FORD[LANG];
  return (t&&t[k]&&t[k][0])||alap;
}
function achDesc(k,alap){
  const t=ACH_FORD[LANG];
  return (t&&t[k]&&t[k][1])||alap;
}

/* --- Korszakok, tájak, nehézségek ---
   Ezek eddig rögzített magyar szövegek voltak a menüben, ezért idegen
   nyelvre váltva a fél nemzetválasztó képernyő magyar maradt. */
const MENU_FORD={
 en:{ korszak:['15th century','17th century','19th century','20th century'],
   terep:{random:'Random', mezo:'Lowland', erdo:'Deep forest', kopar:'Barren land',
     sivatag:'Desert', folyok:'River country', tavak:'Lake district',
     szigetek:'Islands', hegyvidek:'Highlands', karib:'Caribbean'},
   nehez:['Easy','Normal','Hard'] },
 de:{ korszak:['15. Jahrhundert','17. Jahrhundert','19. Jahrhundert','20. Jahrhundert'],
   terep:{random:'Zufall', mezo:'Tiefland', erdo:'Urwald', kopar:'Ödland',
     sivatag:'Wüste', folyok:'Flussland', tavak:'Seenland',
     szigetek:'Inseln', hegyvidek:'Hochland', karib:'Karibik'},
   nehez:['Leicht','Normal','Schwer'] },
 zh:{ korszak:['15世纪','17世纪','19世纪','20世纪'],
   terep:{random:'随机', mezo:'平原', erdo:'密林', kopar:'荒原',
     sivatag:'沙漠', folyok:'河谷', tavak:'湖区',
     szigetek:'群岛', hegyvidek:'高地', karib:'加勒比'},
   nehez:['简单','普通','困难'] }
};
function korszakNev(i){
  const t=MENU_FORD[LANG];
  return (t&&t.korszak&&t.korszak[i])||AGES[i].name;
}
function terepNev(kulcs, alap){
  const t=MENU_FORD[LANG];
  return (t&&t.terep&&t.terep[kulcs])||alap;
}
function nehezNev(i, alap){
  const t=MENU_FORD[LANG];
  return (t&&t.nehez&&t.nehez[i])||alap;
}

/* --- Adattáblák: tájak, nehézségek, korszakok alcíme, nemzeti előnyök ---
   Ezek nem gombfeliratok, hanem a játék adatai. A tábla csak azt sorolja
   fel, ami eltér a magyartól; a hiányzó bejegyzés magyarul marad, így egy
   félkész fordítás sem töri el a menüt. */
const TAJ_FORD={
 en:{mezo:['Lowland','A balanced land: enough timber, enough ore, a few lakes.'],
  erdo:['Deep forest','Dense woodland. Plenty of wood, hardly any stone.'],
  kopar:['Barren land','Barely a copse or two, but rich in ore.'],
  sivatag:['Desert','Sand and rock. Little water, rich veins of gold.'],
  folyok:['River country','Several rivers cross the land — choose your bridges well.'],
  tavak:['Lake district','Many lakes, waters rich in fish.'],
  hegy:['Highlands','Rocky country, rich in ore and poor in timber.'],
  puszta:['Salt steppe','Almost no water on the map. You must rely on farms.'],
  karib:['Caribbean','A fixed map: Cuba, the Bahamas, Jamaica, Hispaniola and Tortuga.'],
  szigetek:['Islands','Dense wooded islands, plenty of water, little gold — the New World.'],
  random:['Random','A different land in every match.']},
 de:{mezo:['Tiefland','Ausgewogenes Land: genug Holz, genug Erz, ein paar Seen.'],
  erdo:['Urwald','Dichter Wald. Holz im Überfluss, kaum Stein.'],
  kopar:['Ödland','Kaum ein Hain, dafür reich an Erz.'],
  sivatag:['Wüste','Sand und Fels. Wenig Wasser, reiche Goldadern.'],
  folyok:['Flussland','Mehrere Flüsse durchziehen das Land — wähle die Brücken gut.'],
  tavak:['Seenland','Viele Seen, fischreiche Gewässer.'],
  hegy:['Hochland','Felsiges, erzreiches und holzarmes Land.'],
  puszta:['Salzsteppe','Fast kein Wasser auf der Karte. Du musst dich auf Höfe stützen.'],
  karib:['Karibik','Feste Karte: Kuba, die Bahamas, Jamaika, Hispaniola und Tortuga.'],
  szigetek:['Inseln','Dichte Waldinseln, viel Wasser, kaum Gold — die Neue Welt.'],
  random:['Zufall','In jeder Partie eine andere Landschaft.']},
 zh:{mezo:['平原','均衡的地形：木材充足，矿产尚可，几处湖泊。'],
  erdo:['密林','茂密的森林。木材极多，石料稀少。'],
  kopar:['荒原','几乎没有树丛，但矿藏丰富。'],
  sivatag:['沙漠','沙与岩石。水源稀少，金脉丰厚。'],
  folyok:['河谷','数条河流穿过大地 — 桥的位置要选好。'],
  tavak:['湖区','湖泊众多，水中鱼产丰富。'],
  hegy:['高地','多岩，富矿，缺木。'],
  puszta:['盐碱草原','地图上几乎没有水源，只能依靠农场。'],
  karib:['加勒比','固定地图：古巴、巴哈马、牙买加、伊斯帕尼奥拉与托尔图加。'],
  szigetek:['群岛','茂密的林岛，水域广阔，黄金稀少 — 新世界的风土。'],
  random:['随机','每一局都是不同的地形。']}
};
const NEHEZ_FORD={
 en:[['Easy','The neighbour builds slowly and attacks rarely, with little force. Comfortable for learning.'],
     ['Normal','A balanced opponent: keeps up the pressure without sweeping you away.'],
     ['Hard','The bot plays at full strength, with frequent assaults.']],
 de:[['Leicht','Der Nachbar baut langsam und greift selten und schwach an. Bequem zum Lernen.'],
     ['Normal','Ein ausgewogener Gegner: hält Druck, fegt dich aber nicht weg.'],
     ['Schwer','Der Bot spielt mit voller Kraft und greift häufig an.']],
 zh:[['简单','邻国建设缓慢，很少进攻且兵力不多，适合学习。'],
     ['普通','势均力敌的对手：给你压力，但不会碾压。'],
     ['困难','电脑全力应战，频繁发起猛攻。']]
};
/* A tájat és a nehézséget kulcs, illetve sorszám alapján kérdezzük le. */
function tajNev(kulcs, alap){
  const t=TAJ_FORD[LANG];
  return (t&&t[kulcs]&&t[kulcs][0])||alap;
}
function tajLeiras(kulcs, alap){
  const t=TAJ_FORD[LANG];
  return (t&&t[kulcs]&&t[kulcs][1])||alap;
}
function nehezLeiras(i, alap){
  const t=NEHEZ_FORD[LANG];
  return (t&&t[i]&&t[i][1])||alap;
}
function korszakAlcim(i){
  const k='korAlcim'+i;
  return (SZOTAR[k]&&SZOTAR[k][LANG])||((AGES[i]&&AGES[i].sub)||'');
}
/* Nemzeti előnyök: cím és leírás. */
const BONUS_FORD={
 en:{ns:['The Code of the Brotherhood','Ships cost 20% less, crews are ready 15% faster.'],
  bb:['Dreaded reputation','Ships hit 20% harder and crews are 12% tougher.'],
  sb:['A gentleman aboard','25% more gold, but ships cost 10% more.'],
  nat:['People of the island','Warriors are 20% faster and 15% cheaper, but know no metal.'],
  es:['Conquest overseas','Ships cost 25% less and are 20% tougher, harbours cost 20% less.'],
  hu:['Light cavalry tradition','Melee units are 16% faster and 15% cheaper.'],
  at:['School of fortress building','Buildings are 22% tougher, towers shoot 12% further.'],
  pl:['Winged hussars','Melee units hit 20% harder.'],
  de:['Discipline of the war industry','Buildings cost 16% less and are finished 25% faster.'],
  fr:['Enlightened court','Ranged units shoot 12% further, advancing an age costs 20% less.'],
  gb:['Tradition of archers and gunners','Ranged units deal 20% more damage.'],
  ru:['Inexhaustible reserves','Every unit is 16% tougher, workers gather 14% faster.']},
 de:{ns:['Der Kodex der Bruderschaft','Schiffe kosten 20% weniger, Mannschaften stehen 15% schneller bereit.'],
  bb:['Gefürchteter Ruf','Schiffe schlagen 20% härter zu, Mannschaften sind 12% zäher.'],
  sb:['Ein Gentleman an Bord','25% mehr Gold, aber Schiffe kosten 10% mehr.'],
  nat:['Volk der Insel','Krieger sind 20% schneller und 15% billiger, kennen aber kein Metall.'],
  es:['Eroberung in Übersee','Schiffe kosten 25% weniger und sind 20% zäher, Häfen kosten 20% weniger.'],
  hu:['Tradition der leichten Reiterei','Nahkampfeinheiten sind 16% schneller und 15% billiger.'],
  at:['Schule des Festungsbaus','Gebäude sind 22% zäher, Türme schießen 12% weiter.'],
  pl:['Geflügelte Husaren','Nahkampfeinheiten schlagen 20% härter zu.'],
  de:['Disziplin der Rüstungsindustrie','Gebäude kosten 16% weniger und sind 25% schneller fertig.'],
  fr:['Aufgeklärter Hof','Fernkampfeinheiten schießen 12% weiter, der Zeitalterwechsel kostet 20% weniger.'],
  gb:['Bogen- und Artillerietradition','Fernkampfeinheiten verursachen 20% mehr Schaden.'],
  ru:['Unerschöpfliche Reserven','Jede Einheit ist 16% zäher, Arbeiter sammeln 14% schneller.']},
 zh:{ns:['兄弟会法典','船只便宜 20%，船员出动速度快 15%。'],
  bb:['令人生畏的名声','船只伤害提高 20%，船员坚韧度提高 12%。'],
  sb:['船上的绅士','黄金收入 +25%，但船只贵 10%。'],
  nat:['岛上的民族','战士速度 +20%、造价 −15%，但不识金属。'],
  es:['海外征服','船只便宜 25%、坚韧 +20%，港口便宜 20%。'],
  hu:['轻骑兵传统','近战单位速度 +16%、造价 −15%。'],
  at:['筑城学派','建筑坚韧 +22%，塔楼射程 +12%。'],
  pl:['翼骑兵','近战单位伤害 +20%。'],
  de:['军工纪律','建筑造价 −16%，建造速度 +25%。'],
  fr:['开明的宫廷','远程单位射程 +12%，时代升级费用 −20%。'],
  gb:['弓箭与炮兵传统','远程单位伤害 +20%。'],
  ru:['取之不尽的后备','所有单位坚韧 +16%，工人采集速度 +14%。']}
};
function bonusCim(kulcs, alap){
  const t=BONUS_FORD[LANG];
  return (t&&t[kulcs]&&t[kulcs][0])||alap;
}
function bonusSzoveg(kulcs, alap){
  const t=BONUS_FORD[LANG];
  return (t&&t[kulcs]&&t[kulcs][1])||alap;
}

/* --- Ideológiák (doktrínák) ---
   117 irány, nemzetenként és korszakonként három. A tábla kulcsa a
   doktrína saját kulcsa, értéke [név, leírás]. Ami hiányzik, magyarul
   marad, így egy félkész fordítás sem töri el a választóképernyőt. */
const DOKT_FORD={
 en:{
  kodex:['The Code','The plunder is shared fairly: 25% more gold.'],
  szavazas:['Election of captains','The crew is ready 20% faster.'],
  menedek:['Free port','Buildings are 25% tougher.'],
  rettegett:['Dreaded reputation','Ships hit 18% harder.'],
  kanoc:['Burning fuse','Every unit is 15% tougher.'],
  blokad:['Blockade','25% more gold.'],
  zsold:['Paid crew','Ships cost 20% less.'],
  uriember:['Gentleman','Farms give 30% more food.'],
  konyvtar:['Ship’s log','Gathering is 20% faster.'],
  vadaszat:['Hunting','Warriors are 14% stronger.'],
  halaszat:['Fishing','Farms give 25% more food.'],
  torzsi:['Tribal alliance','The army limit is 20 higher.'],
  reconquista:['Reconquista','Retaking the peninsula: melee units are 16% stronger.'],
  karavella:['Caravel','A new hull: ships cost 25% less and are 20% faster.'],
  katolikuskiralyok:['The Catholic Monarchs','Two crowns in one hand: the army limit is 25 higher.'],
  conquistador:['Conquistadors','The conquerors ask for little: every unit costs 18% less.'],
  ezustflotta:['Silver fleet','The treasure of the New World: 30% more gold.'],
  tercio:['Tercio','The Spanish square: spearmen and ranged units are 22% tougher.'],
  bourbonreform:['Bourbon reforms','Construction is 25% faster.'],
  gyarmatiigaz:['Colonial administration','Gathering is 20% faster.'],
  tengeriskola:['Naval academy','Warships are 25% stronger.'],
  semlegesseg:['Neutrality','Buildings are 30% tougher.'],
  iparositas_es:['Industrialisation','Every unit costs 16% less.'],
  nyitas:['Opening up','Farms give 30% more food.'],
  feketesereg:['The Black Army','Matthias’s mercenaries: soldiers cost 15% less, training is 10% faster.'],
  corvina:['The Corvinian library','Knowledge is power: every building costs 12% less, advancing an age 10% less.'],
  vegvar:['Line of border fortresses','Towers and walls are 30% tougher.'],
  kuruc:['Kuruc raid','Rákóczi’s horsemen move 12% faster.'],
  talpas:['Foot infantry','Spearmen and ranged units cost 18% less.'],
  erdely:['The Transylvanian treasury','25% more gold comes from the mines.'],
  nemzetor:['National Guard','Kossuth’s recruitment: the army limit is 25 higher.'],
  jobbagy:['Emancipation of the serfs','Free peasants gather 15% faster.'],
  honved:['Honvéd army','Every unit is 12% tougher.'],
  folyamor:['River guard','Warships are 30% tougher.'],
  iparos:['Industrialisation','Construction is 25% faster.'],
  revizio:['Army of revision','Every unit hits 12% harder.'],
  hazassag:['Marriage policy','What others win by war, you win by wedding: advancing an age costs 18% less.'],
  birgyules:['Imperial Diet','Every building costs 15% less.'],
  landsknecht:['Landsknecht pay','Infantry costs 15% less and is ready faster.'],
  barokk:['Baroque court','Farms give 28% more food.'],
  liga:['Holy League','Melee units are 18% tougher.'],
  haditanacs:['Imperial war council','Training is 22% faster.'],
  kiegyezes:['The Compromise','The frame of the dual monarchy: the army limit is 22 higher.'],
  burokracia:['Bureaucracy','Every unit and building costs 12% less.'],
  vasut:['Railway network','Gathering is 18% faster.'],
  bekepolitika:['Policy of peace','Buildings are 28% tougher.'],
  hadiipar:['War industry','Every unit costs 15% less.'],
  offenziva:['The last offensive','Every unit hits 14% harder.'],
  jagello:['The Jagiellonian union','Two peoples under one crown: the army limit is 25 higher.'],
  porosz:['Prussian homage','25% more wood and stone arrives.'],
  nemesi:['Noble levy','Cavalry costs 18% less.'],
  huszar:['Winged hussars','Sobieski’s shock cavalry: horsemen are 15% tougher and 12% stronger.'],
  kahlenberg:['The charge at Kahlenberg','Every unit is 14% faster.'],
  kincstar:['Royal treasury','25% more gold.'],
  kaszas:['Scythe-bearing peasants','Spearmen cost 25% less and are ready faster.'],
  mernok:['Fortifying engineer','Kościuszko’s earthworks: towers and walls are 32% tougher.'],
  felkeles:['Uprising','Training is 25% faster.'],
  legiok:['The Legions','Every unit is 14% tougher.'],
  varso:['The battle of Warsaw','Buildings are 25% tougher and towers shoot further.'],
  szanacio:['Sanation','Construction is 25% faster.'],
  landsknechtde:['Landsknecht regiments','Infantry costs 16% less.'],
  birreform:['Imperial reform','Every building costs 15% less.'],
  lovagi:['Knightly tradition','Cavalry is 18% tougher.'],
  allando:['Standing army','The Great Elector’s innovation: training is 25% faster.'],
  hugenotta:['Huguenot settlement','Gathering is 18% faster.'],
  fegyelem:['Prussian discipline','Every unit is 15% tougher.'],
  vasesver:['Blood and iron','Bismarck’s way: every unit hits 15% harder.'],
  vamunio:['Customs union','Every unit and building costs 13% less.'],
  tarsbizt:['Social insurance','The army limit is 25 higher.'],
  tannenberg:['Tannenberg','Buildings are 28% tougher.'],
  hadigazd:['War economy','Every unit costs 16% less.'],
  vezerkar:['General staff','Training is 28% faster.'],
  kirposta:['The royal post','Louis XI’s couriers: construction is 22% faster.'],
  zsoldszerz:['Mercenary contracts','Every unit costs 15% less.'],
  kozpontos:['Centralisation','Advancing an age costs 18% less.'],
  versailles:['Versailles','Provisioning the court: 30% more food.'],
  vauban:['Vauban’s fortresses','Every building is 30% tougher.'],
  napkiraly:['The Sun King’s army','The army limit is 25 higher.'],
  grande:['Grande Armée','Napoleon’s army hits 15% harder.'],
  tuzerseg:['Artillery','Ranged units are 20% stronger and towers shoot further.'],
  codenap:['Code Napoléon','Every unit and building costs 13% less.'],
  szabadfr:['Free France','Every unit is 15% tougher.'],
  pancelos:['Armoured doctrine','Tanks are 22% stronger and tougher.'],
  otodik:['The Fifth Republic','Construction is 26% faster.'],
  csillagkamara:['Star Chamber','The price of order: every building costs 15% less.'],
  kereskszerz:['Trade treaty','28% more gold.'],
  ijasz:['Tradition of the longbow','Ranged units are 20% stronger and 12% cheaper.'],
  ujmintaju:['New Model Army','Cromwell’s discipline: training is 22% faster, units are 12% tougher.'],
  puritan:['Puritan discipline','Every unit costs 16% less.'],
  hajozasi:['Navigation Acts','Ships are 30% tougher.'],
  ipariforr:['Industrial revolution','Construction is 28% faster.'],
  gyarmat:['Colonial empire','Gathering is 20% faster.'],
  haditenger:['The Royal Navy','Warships are 25% stronger.'],
  legicsata:['The Battle of Britain','Aircraft are 25% tougher.'],
  hadigazdgb:['War economy','Every unit costs 16% less.'],
  kitartas:['Endurance','Buildings are 30% tougher.'],
  moszkva:['The gathering of Moscow','The army limit is 25 higher.'],
  kreml:['The walls of the Kremlin','Every building is 30% tougher.'],
  tatarjarom:['The end of the Tatar yoke','Every unit costs 15% less.'],
  nyugatireform:['Western reform','Peter the Great’s school: construction is 25% faster.'],
  flotta:['Fleet building','Ships cost 20% less and are 20% tougher.'],
  szentpetervar:['Saint Petersburg','Gathering is 20% faster.'],
  felperzselt:['Scorched earth','Every unit is 18% tougher.'],
  kozak:['Cossack raiders','Every unit is 15% faster.'],
  szentszov:['The Holy Alliance','Farms give 28% more food.'],
  nagyhatalom:['Industrial great power','Gathering is 20% faster.'],
  emberfoleny:['Weight of numbers','The army limit is 30 higher and soldiers cost 12% less.'],
  erodvonal:['Line of fortifications','Towers and walls are 35% tougher.'],
  vadaszat2:['Hunting','Warriors are 14% stronger.'],
  vadaszat3:['Hunting','Warriors are 14% stronger.'],
  vadaszat4:['Hunting','Warriors are 14% stronger.'],
  halaszat2:['Fishing','Farms give 25% more food.'],
  halaszat3:['Fishing','Farms give 25% more food.'],
  halaszat4:['Fishing','Farms give 25% more food.'],
  torzsi2:['Tribal alliance','The army limit is 20 higher.'],
  torzsi3:['Tribal alliance','The army limit is 20 higher.'],
  torzsi4:['Tribal alliance','The army limit is 20 higher.'],
 },
 de:{
  kodex:['Der Kodex','Die Beute wird gerecht geteilt: 25% mehr Gold.'],
  szavazas:['Kapitänswahl','Die Mannschaft steht 20% schneller bereit.'],
  menedek:['Freihafen','Gebäude sind 25% zäher.'],
  rettegett:['Gefürchteter Ruf','Schiffe schlagen 18% härter zu.'],
  kanoc:['Brennende Lunte','Jede Einheit ist 15% zäher.'],
  blokad:['Blockade','25% mehr Gold.'],
  zsold:['Bezahlte Mannschaft','Schiffe kosten 20% weniger.'],
  uriember:['Gentleman','Bauernhöfe geben 30% mehr Nahrung.'],
  konyvtar:['Logbuch','20% schnelleres Sammeln.'],
  vadaszat:['Jagd','Krieger sind 14% stärker.'],
  halaszat:['Fischfang','Bauernhöfe geben 25% mehr Nahrung.'],
  torzsi:['Stammesbündnis','Die Armeegrenze ist um 20 höher.'],
  reconquista:['Reconquista','Rückeroberung der Halbinsel: Nahkampfeinheiten sind 16% stärker.'],
  karavella:['Karavelle','Ein neuer Rumpf: Schiffe kosten 25% weniger und sind 20% schneller.'],
  katolikuskiralyok:['Die Katholischen Könige','Zwei Kronen in einer Hand: die Armeegrenze ist um 25 höher.'],
  conquistador:['Konquistadoren','Die Eroberer verlangen wenig: jede Einheit kostet 18% weniger.'],
  ezustflotta:['Silberflotte','Der Schatz der Neuen Welt: 30% mehr Gold.'],
  tercio:['Tercio','Das spanische Karree: Pikeniere und Schützen sind 22% zäher.'],
  bourbonreform:['Bourbonische Reformen','Das Bauen ist 25% schneller.'],
  gyarmatiigaz:['Kolonialverwaltung','20% schnelleres Sammeln.'],
  tengeriskola:['Marineakademie','Kriegsschiffe sind 25% stärker.'],
  semlegesseg:['Neutralität','Gebäude sind 30% zäher.'],
  iparositas_es:['Industrialisierung','Jede Einheit kostet 16% weniger.'],
  nyitas:['Öffnung','Bauernhöfe geben 30% mehr Nahrung.'],
  feketesereg:['Das Schwarze Heer','Die Söldner des Matthias: Soldaten kosten 15% weniger, die Ausbildung ist 10% schneller.'],
  corvina:['Bibliotheca Corviniana','Wissen ist Macht: jedes Gebäude kostet 12% weniger, der Zeitalterwechsel 10%.'],
  vegvar:['Grenzfestungssystem','Türme und Mauern sind 30% zäher.'],
  kuruc:['Kurutzen-Streifzug','Rákóczis Reiter sind 12% schneller.'],
  talpas:['Fußvolk','Pikeniere und Schützen kosten 18% weniger.'],
  erdely:['Die siebenbürgische Schatzkammer','25% mehr Gold kommt aus den Minen.'],
  nemzetor:['Nationalgarde','Kossuths Aushebung: die Armeegrenze ist um 25 höher.'],
  jobbagy:['Bauernbefreiung','Freie Bauern sammeln 15% schneller.'],
  honved:['Honvéd-Armee','Jede Einheit ist 12% zäher.'],
  folyamor:['Flusswache','Kriegsschiffe sind 30% zäher.'],
  iparos:['Industrialisierung','Das Bauen ist 25% schneller.'],
  revizio:['Revisionsarmee','Jede Einheit schlägt 12% härter zu.'],
  hazassag:['Heiratspolitik','Was andere durch Krieg, gewinnst du durch Heirat: der Zeitalterwechsel kostet 18% weniger.'],
  birgyules:['Reichstag','Jedes Gebäude kostet 15% weniger.'],
  landsknecht:['Landsknechtssold','Die Infanterie kostet 15% weniger und steht schneller bereit.'],
  barokk:['Barocker Hof','Bauernhöfe geben 28% mehr Nahrung.'],
  liga:['Heilige Liga','Nahkampfeinheiten sind 18% zäher.'],
  haditanacs:['Hofkriegsrat','Die Ausbildung ist 22% schneller.'],
  kiegyezes:['Ausgleich','Der Rahmen der Doppelmonarchie: die Armeegrenze ist um 22 höher.'],
  burokracia:['Bürokratie','Jede Einheit und jedes Gebäude kostet 12% weniger.'],
  vasut:['Eisenbahnnetz','18% schnelleres Sammeln.'],
  bekepolitika:['Friedenspolitik','Gebäude sind 28% zäher.'],
  hadiipar:['Rüstungsindustrie','Jede Einheit kostet 15% weniger.'],
  offenziva:['Die letzte Offensive','Jede Einheit schlägt 14% härter zu.'],
  jagello:['Jagiellonen-Union','Zwei Völker unter einer Krone: die Armeegrenze ist um 25 höher.'],
  porosz:['Preußische Lehnshuldigung','25% mehr Holz und Stein kommen an.'],
  nemesi:['Adelsaufgebot','Kavallerie kostet 18% weniger.'],
  huszar:['Geflügelte Husaren','Sobieskis Stoßreiterei: Reiter sind 15% zäher und 12% stärker.'],
  kahlenberg:['Sturm am Kahlenberg','Jede Einheit ist 14% schneller.'],
  kincstar:['Königliche Schatzkammer','25% mehr Gold.'],
  kaszas:['Sensenschützen','Pikeniere kosten 25% weniger und stehen schneller bereit.'],
  mernok:['Festungsingenieur','Kościuszkos Schanzen: Türme und Mauern sind 32% zäher.'],
  felkeles:['Aufstand','Die Ausbildung ist 25% schneller.'],
  legiok:['Die Legionen','Jede Einheit ist 14% zäher.'],
  varso:['Die Schlacht bei Warschau','Gebäude sind 25% zäher und Türme schießen weiter.'],
  szanacio:['Sanacja','Das Bauen ist 25% schneller.'],
  landsknechtde:['Landsknechtsregimenter','Die Infanterie kostet 16% weniger.'],
  birreform:['Reichsreform','Jedes Gebäude kostet 15% weniger.'],
  lovagi:['Rittertradition','Kavallerie ist 18% zäher.'],
  allando:['Stehendes Heer','Die Neuerung des Großen Kurfürsten: die Ausbildung ist 25% schneller.'],
  hugenotta:['Hugenottenansiedlung','18% schnelleres Sammeln.'],
  fegyelem:['Preußische Disziplin','Jede Einheit ist 15% zäher.'],
  vasesver:['Blut und Eisen','Bismarcks Weg: jede Einheit schlägt 15% härter zu.'],
  vamunio:['Zollverein','Jede Einheit und jedes Gebäude kostet 13% weniger.'],
  tarsbizt:['Sozialversicherung','Die Armeegrenze ist um 25 höher.'],
  tannenberg:['Tannenberg','Gebäude sind 28% zäher.'],
  hadigazd:['Kriegswirtschaft','Jede Einheit kostet 16% weniger.'],
  vezerkar:['Generalstab','Die Ausbildung ist 28% schneller.'],
  kirposta:['Die königliche Post','Die Boten Ludwigs XI.: das Bauen ist 22% schneller.'],
  zsoldszerz:['Söldnerverträge','Jede Einheit kostet 15% weniger.'],
  kozpontos:['Zentralisierung','Der Zeitalterwechsel kostet 18% weniger.'],
  versailles:['Versailles','Versorgung des Hofes: 30% mehr Nahrung.'],
  vauban:['Vaubans Festungen','Jedes Gebäude ist 30% zäher.'],
  napkiraly:['Das Heer des Sonnenkönigs','Die Armeegrenze ist um 25 höher.'],
  grande:['Grande Armée','Napoleons Heer schlägt 15% härter zu.'],
  tuzerseg:['Artillerie','Schützen sind 20% stärker und Türme schießen weiter.'],
  codenap:['Code Napoléon','Jede Einheit und jedes Gebäude kostet 13% weniger.'],
  szabadfr:['Freies Frankreich','Jede Einheit ist 15% zäher.'],
  pancelos:['Panzerdoktrin','Panzer sind 22% stärker und zäher.'],
  otodik:['Die Fünfte Republik','Das Bauen ist 26% schneller.'],
  csillagkamara:['Sternkammer','Der Preis der Ordnung: jedes Gebäude kostet 15% weniger.'],
  kereskszerz:['Handelsvertrag','28% mehr Gold.'],
  ijasz:['Langbogentradition','Schützen sind 20% stärker und 12% billiger.'],
  ujmintaju:['New Model Army','Cromwells Disziplin: die Ausbildung ist 22% schneller, Einheiten sind 12% zäher.'],
  puritan:['Puritanische Disziplin','Jede Einheit kostet 16% weniger.'],
  hajozasi:['Navigationsakte','Schiffe sind 30% zäher.'],
  ipariforr:['Industrielle Revolution','Das Bauen ist 28% schneller.'],
  gyarmat:['Kolonialreich','20% schnelleres Sammeln.'],
  haditenger:['Die Royal Navy','Kriegsschiffe sind 25% stärker.'],
  legicsata:['Luftschlacht um England','Flugzeuge sind 25% zäher.'],
  hadigazdgb:['Kriegswirtschaft','Jede Einheit kostet 16% weniger.'],
  kitartas:['Durchhaltevermögen','Gebäude sind 30% zäher.'],
  moszkva:['Die Sammlung um Moskau','Die Armeegrenze ist um 25 höher.'],
  kreml:['Die Mauern des Kreml','Jedes Gebäude ist 30% zäher.'],
  tatarjarom:['Das Ende des Tatarenjochs','Jede Einheit kostet 15% weniger.'],
  nyugatireform:['Westliche Reform','Die Schule Peters des Großen: das Bauen ist 25% schneller.'],
  flotta:['Flottenbau','Schiffe kosten 20% weniger und sind 20% zäher.'],
  szentpetervar:['Sankt Petersburg','20% schnelleres Sammeln.'],
  felperzselt:['Verbrannte Erde','Jede Einheit ist 18% zäher.'],
  kozak:['Kosakenreiter','Jede Einheit ist 15% schneller.'],
  szentszov:['Die Heilige Allianz','Bauernhöfe geben 28% mehr Nahrung.'],
  nagyhatalom:['Industrielle Großmacht','20% schnelleres Sammeln.'],
  emberfoleny:['Übermacht an Menschen','Die Armeegrenze ist um 30 höher und Soldaten kosten 12% weniger.'],
  erodvonal:['Festungslinie','Türme und Mauern sind 35% zäher.'],
  vadaszat2:['Jagd','Krieger sind 14% stärker.'],
  vadaszat3:['Jagd','Krieger sind 14% stärker.'],
  vadaszat4:['Jagd','Krieger sind 14% stärker.'],
  halaszat2:['Fischfang','Bauernhöfe geben 25% mehr Nahrung.'],
  halaszat3:['Fischfang','Bauernhöfe geben 25% mehr Nahrung.'],
  halaszat4:['Fischfang','Bauernhöfe geben 25% mehr Nahrung.'],
  torzsi2:['Stammesbündnis','Die Armeegrenze ist um 20 höher.'],
  torzsi3:['Stammesbündnis','Die Armeegrenze ist um 20 höher.'],
  torzsi4:['Stammesbündnis','Die Armeegrenze ist um 20 höher.'],
 },
 zh:{
  kodex:['法典','战利品公平分配：黄金收入 +25%。'],
  szavazas:['船长选举','船员出动速度 +20%。'],
  menedek:['自由港','建筑坚韧 +25%。'],
  rettegett:['令人生畏的名声','船只伤害 +18%。'],
  kanoc:['燃烧的火绳','所有单位坚韧 +15%。'],
  blokad:['封锁','黄金收入 +25%。'],
  zsold:['雇佣船员','船只造价 −20%。'],
  uriember:['绅士','农场食物产出 +30%。'],
  konyvtar:['航海日志','采集速度 +20%。'],
  vadaszat:['狩猎','战士威力 +14%。'],
  halaszat:['捕鱼','农场食物产出 +25%。'],
  torzsi:['部落同盟','人口上限 +20。'],
  reconquista:['收复失地运动','光复半岛：近战单位威力 +16%。'],
  karavella:['卡拉维尔帆船','新式船型：船只造价 −25%，速度 +20%。'],
  katolikuskiralyok:['天主教双王','两顶王冠合一：人口上限 +25。'],
  conquistador:['征服者','征服者所求不多：所有单位造价 −18%。'],
  ezustflotta:['白银舰队','新世界的财富：黄金收入 +30%。'],
  tercio:['西班牙方阵','西班牙方阵：长矛兵与远程单位坚韧 +22%。'],
  bourbonreform:['波旁改革','建造速度 +25%。'],
  gyarmatiigaz:['殖民地行政','采集速度 +20%。'],
  tengeriskola:['海军学院','战船威力 +25%。'],
  semlegesseg:['中立','建筑坚韧 +30%。'],
  iparositas_es:['工业化','所有单位造价 −16%。'],
  nyitas:['开放','农场食物产出 +30%。'],
  feketesereg:['黑军','马加什的雇佣兵：士兵造价 −15%，训练速度 +10%。'],
  corvina:['科尔维纳图书馆','知识就是力量：建筑造价 −12%，时代升级费用 −10%。'],
  vegvar:['边境要塞体系','塔楼与城墙坚韧 +30%。'],
  kuruc:['库鲁茨突袭','拉科齐的骑兵行军速度 +12%。'],
  talpas:['步兵队','长矛兵与远程单位造价 −18%。'],
  erdely:['特兰西瓦尼亚金库','矿场黄金产出 +25%。'],
  nemzetor:['国民自卫军','科苏特的征募：人口上限 +25。'],
  jobbagy:['解放农奴','自由农民采集速度 +15%。'],
  honved:['国防军','所有单位坚韧 +12%。'],
  folyamor:['河防舰队','战船坚韧 +30%。'],
  iparos:['工业化','建造速度 +25%。'],
  revizio:['修约之师','所有单位伤害 +12%。'],
  hazassag:['联姻政策','他人以战争取得的，你以婚姻取得：时代升级费用 −18%。'],
  birgyules:['帝国议会','所有建筑造价 −15%。'],
  landsknecht:['雇佣步兵饷银','步兵造价 −15%，出动更快。'],
  barokk:['巴洛克宫廷','农场食物产出 +28%。'],
  liga:['神圣同盟','近战单位坚韧 +18%。'],
  haditanacs:['宫廷军事会议','训练速度 +22%。'],
  kiegyezes:['奥匈折衷','二元君主国的框架：人口上限 +22。'],
  burokracia:['官僚体系','所有单位与建筑造价 −12%。'],
  vasut:['铁路网','采集速度 +18%。'],
  bekepolitika:['和平政策','建筑坚韧 +28%。'],
  hadiipar:['军工业','所有单位造价 −15%。'],
  offenziva:['最后的攻势','所有单位伤害 +14%。'],
  jagello:['雅盖隆联盟','两个民族共戴一冠：人口上限 +25。'],
  porosz:['普鲁士效忠','木材与石料产出 +25%。'],
  nemesi:['贵族征召','骑兵造价 −18%。'],
  huszar:['翼骑兵','索别斯基的冲击骑兵：骑兵坚韧 +15%，威力 +12%。'],
  kahlenberg:['卡伦山冲锋','所有单位速度 +14%。'],
  kincstar:['王室金库','黄金收入 +25%。'],
  kaszas:['镰刀农兵','长矛兵造价 −25%，出动更快。'],
  mernok:['筑垒工程师','科希丘什科的土垒：塔楼与城墙坚韧 +32%。'],
  felkeles:['起义','训练速度 +25%。'],
  legiok:['军团','所有单位坚韧 +14%。'],
  varso:['华沙之战','建筑坚韧 +25%，塔楼射程更远。'],
  szanacio:['萨纳齐亚','建造速度 +25%。'],
  landsknechtde:['雇佣步兵团','步兵造价 −16%。'],
  birreform:['帝国改革','所有建筑造价 −15%。'],
  lovagi:['骑士传统','骑兵坚韧 +18%。'],
  allando:['常备军','大选帝侯的革新：训练速度 +25%。'],
  hugenotta:['胡格诺移民','采集速度 +18%。'],
  fegyelem:['普鲁士纪律','所有单位坚韧 +15%。'],
  vasesver:['铁与血','俾斯麦之道：所有单位伤害 +15%。'],
  vamunio:['关税同盟','所有单位与建筑造价 −13%。'],
  tarsbizt:['社会保险','人口上限 +25。'],
  tannenberg:['坦能堡','建筑坚韧 +28%。'],
  hadigazd:['战时经济','所有单位造价 −16%。'],
  vezerkar:['总参谋部','训练速度 +28%。'],
  kirposta:['王家驿站','路易十一的信使：建造速度 +22%。'],
  zsoldszerz:['雇佣契约','所有单位造价 −15%。'],
  kozpontos:['中央集权','时代升级费用 −18%。'],
  versailles:['凡尔赛','供养宫廷：食物产出 +30%。'],
  vauban:['沃邦的要塞','所有建筑坚韧 +30%。'],
  napkiraly:['太阳王的军队','人口上限 +25。'],
  grande:['大军团','拿破仑的军队伤害 +15%。'],
  tuzerseg:['炮兵','远程单位威力 +20%，塔楼射程更远。'],
  codenap:['拿破仑法典','所有单位与建筑造价 −13%。'],
  szabadfr:['自由法国','所有单位坚韧 +15%。'],
  pancelos:['装甲学说','坦克威力与坚韧 +22%。'],
  otodik:['第五共和国','建造速度 +26%。'],
  csillagkamara:['星室法庭','秩序的代价：所有建筑造价 −15%。'],
  kereskszerz:['贸易条约','黄金收入 +28%。'],
  ijasz:['长弓传统','远程单位威力 +20%，造价 −12%。'],
  ujmintaju:['新模范军','克伦威尔的纪律：训练速度 +22%，单位坚韧 +12%。'],
  puritan:['清教徒纪律','所有单位造价 −16%。'],
  hajozasi:['航海法案','船只坚韧 +30%。'],
  ipariforr:['工业革命','建造速度 +28%。'],
  gyarmat:['殖民帝国','采集速度 +20%。'],
  haditenger:['皇家海军','战船威力 +25%。'],
  legicsata:['不列颠空战','飞机坚韧 +25%。'],
  hadigazdgb:['战时经济','所有单位造价 −16%。'],
  kitartas:['坚忍','建筑坚韧 +30%。'],
  moszkva:['莫斯科的统合','人口上限 +25。'],
  kreml:['克里姆林宫墙','所有建筑坚韧 +30%。'],
  tatarjarom:['鞑靼枷锁的终结','所有单位造价 −15%。'],
  nyugatireform:['西化改革','彼得大帝的学派：建造速度 +25%。'],
  flotta:['舰队建设','船只造价 −20%，坚韧 +20%。'],
  szentpetervar:['圣彼得堡','采集速度 +20%。'],
  felperzselt:['焦土','所有单位坚韧 +18%。'],
  kozak:['哥萨克游骑','所有单位速度 +15%。'],
  szentszov:['神圣同盟','农场食物产出 +28%。'],
  nagyhatalom:['工业强国','采集速度 +20%。'],
  emberfoleny:['人数优势','人口上限 +30，士兵造价 −12%。'],
  erodvonal:['要塞防线','塔楼与城墙坚韧 +35%。'],
  vadaszat2:['狩猎','战士威力 +14%。'],
  vadaszat3:['狩猎','战士威力 +14%。'],
  vadaszat4:['狩猎','战士威力 +14%。'],
  halaszat2:['捕鱼','农场食物产出 +25%。'],
  halaszat3:['捕鱼','农场食物产出 +25%。'],
  halaszat4:['捕鱼','农场食物产出 +25%。'],
  torzsi2:['部落同盟','人口上限 +20。'],
  torzsi3:['部落同盟','人口上限 +20。'],
  torzsi4:['部落同盟','人口上限 +20。'],
 }
};
function doktNev(kulcs, alap){
  const t=DOKT_FORD[LANG];
  return (t&&t[kulcs]&&t[kulcs][0])||alap;
}
function doktLeiras(kulcs, alap){
  const t=DOKT_FORD[LANG];
  return (t&&t[kulcs]&&t[kulcs][1])||alap;
}

/* --- Fejlesztések (kovácsműhely és akadémia) ---
   [teljes név, rövid gombfelirat, hatás]. A rövid név azért külön, mert a
   parancssáv gombja szűk: ott csak egy szó fér el. */
const UPG_FORD={
 en:{
  weapon:['Weaponsmith','Weapon','+12% damage to every unit'],
  armor:['Armoury','Armour','+2 armour to every unit'],
  supply:['Supply','Supply','+12% health to every unit'],
  yield:['Husbandry','Yield','+5% on every resource gathered, per level'],
  labor:['Construction','Building','5% faster construction, per level'],
  drill:['Drill camp','Training','5% faster training, per level'],
  cargo:['Shipwright','Capacity','+5 places on transports, per level (from 10 up to 25)'],
  medicine:['Medicine chest','Healing','Hospitals and field surgeons heal 20% faster, per level'],
  optics:['Spyglass','Vision','+12% vision for every unit and building, per level'],
  storage:['Storage','Load','Workers carry 20% more per trip, per level'],
  masonry:['Masonry','Walls','Buildings are 12% tougher, per level'],
  ledger:['Accounting','Treasury','Every unit and building is 4% cheaper, per level'],
  atom:['Atomic programme','Atom','The bomber can deliver an atomic strike: everything within four farms’ area is destroyed'],
 },
 de:{
  weapon:['Waffenschmiede','Waffe','+12% Schaden für jede Einheit'],
  armor:['Rüstkammer','Rüstung','+2 Rüstung für jede Einheit'],
  supply:['Nachschub','Nachschub','+12% Lebenskraft für jede Einheit'],
  yield:['Landwirtschaft','Ertrag','+5% auf jeden Rohstoff, pro Stufe'],
  labor:['Bauwesen','Bau','5% schnelleres Bauen, pro Stufe'],
  drill:['Ausbildungslager','Ausbildung','5% schnellere Ausbildung, pro Stufe'],
  cargo:['Schiffszimmerer','Kapazität','+5 Plätze auf Transportern, pro Stufe (von 10 bis 25)'],
  medicine:['Arzneikasten','Heilung','Krankenhäuser und Feldscher heilen 20% schneller, pro Stufe'],
  optics:['Fernrohr','Sicht','+12% Sichtweite für Einheiten und Gebäude, pro Stufe'],
  storage:['Lagerhaltung','Traglast','Arbeiter tragen 20% mehr pro Gang, pro Stufe'],
  masonry:['Steinmetzkunst','Mauern','Gebäude sind 12% zäher, pro Stufe'],
  ledger:['Buchhaltung','Kasse','Jede Einheit und jedes Gebäude 4% billiger, pro Stufe'],
  atom:['Atomprogramm','Atom','Der Bomber kann einen Atomschlag führen: im Umkreis von vier Bauernhöfen wird alles vernichtet'],
 },
 zh:{
  weapon:['武器锻造','武器','所有单位伤害 +12%'],
  armor:['护甲工坊','护甲','所有单位护甲 +2'],
  supply:['补给','补给','所有单位生命 +12%'],
  yield:['农牧经营','产出','每级：所有资源采集 +5%'],
  labor:['建筑业','建造','每级：建造速度 +5%'],
  drill:['训练营','训练','每级：训练速度 +5%'],
  cargo:['船匠','载量','每级：运输船载量 +5（10 至 25）'],
  medicine:['药箱','治疗','每级：医院与军医治疗速度 +20%'],
  optics:['望远镜','视野','每级：单位与建筑视野 +12%'],
  storage:['仓储','负载','每级：工人单次搬运量 +20%'],
  masonry:['石工','城墙','每级：建筑坚韧 +12%'],
  ledger:['会计','国库','每级：所有单位与建筑造价 −4%'],
  atom:['原子计划','原子','轰炸机可实施原子打击：约四座农场范围内全毁'],
 }
};
function upgNev(k,alap){ const t=UPG_FORD[LANG]; return (t&&t[k]&&t[k][0])||alap; }
function upgRovid(k,alap){ const t=UPG_FORD[LANG]; return (t&&t[k]&&t[k][1])||alap; }
function upgLeiras(k,alap){ const t=UPG_FORD[LANG]; return (t&&t[k]&&t[k][2])||alap; }

/* --- Oktatómód ---
   Nyolc lépés: cím és magyarázat. A lépés teljesülését a 29c-tutorial.js
   figyeli, azt nem érinti a fordítás. */
const TUTOR_FORD={
 en:[
  ['Welcome to Birodalom',
   'Your goal is to build an empire from the 15th century to the 20th. Let us start at the very beginning.<br><br><b>Drag a box</b> around your serfs, or click them one by one.'],
  ['Wood for the serfs',
   'With the selected serfs, <b>right-click a tree</b>. They will fell it and carry it to the headquarters.<br><br>Wood is the most important resource: almost everything is built from it.'],
  ['Build a farm',
   'An army eats. Without food your soldiers grow weak.<br><br>Two farms already stand at your base — build <b>one more</b> beside them.<br><br>With a serf selected, press <b>F</b> (or the Farm button), then click where you want it.'],
  ['More serfs are needed',
   'The more hands at work, the faster your empire grows.<br><br>Select the <b>headquarters</b> and train a new serf.'],
  ['Barracks and soldiers',
   'The enemy will arrive sooner or later. Your barracks already stands at the base.<br><br>Select the <b>barracks</b> and train a new soldier in it.'],
  ['Stance and formation',
   'Your army does more than march: you decide how it behaves.<br><br>Select your soldiers and try the <b>Hold</b> stance (key 2), then the <b>Wedge</b> formation (key 8).'],
  ['Advancing the age',
   'With enough resources you can step into the next century: new units, new buildings, a stronger army.<br><br>Press <b>E</b>, or use the age box.'],
  ['You are ready',
   'That is the groundwork. What still awaits you:<br><br>• <b>Smithy</b> — weapons and armour<br>• <b>Academy</b> — the improvements of the empire<br>• <b>Harbour</b> — ships and trade<br>• <b>Hospital</b> — healing and recalling your hero<br><br>In the campaign the histories of eight nations await. Good luck!'],
 ],
 de:[
  ['Willkommen in Birodalom',
   'Dein Ziel ist ein Reich vom 15. bis zum 20. Jahrhundert. Fangen wir ganz vorne an.<br><br><b>Zieh einen Rahmen</b> um deine Leibeigenen oder klicke sie einzeln an.'],
  ['Holz für die Leibeigenen',
   'Mit den ausgewählten Leibeigenen <b>rechtsklicke auf einen Baum</b>. Sie fällen ihn und tragen das Holz zum Hauptquartier.<br><br>Holz ist der wichtigste Rohstoff: fast alles wird daraus gebaut.'],
  ['Baue einen Bauernhof',
   'Ein Heer isst. Ohne Nahrung werden deine Soldaten schwach.<br><br>Zwei Bauernhöfe stehen bereits in deiner Basis — baue <b>noch einen</b> dazu.<br><br>Mit ausgewähltem Leibeigenen drücke <b>F</b> (oder den Knopf Bauernhof) und klicke dann auf den Bauplatz.'],
  ['Mehr Leibeigene',
   'Je mehr Hände arbeiten, desto schneller wächst dein Reich.<br><br>Wähle das <b>Hauptquartier</b> und bilde einen neuen Leibeigenen aus.'],
  ['Kaserne und Soldaten',
   'Der Feind kommt früher oder später. Deine Kaserne steht bereits in der Basis.<br><br>Wähle die <b>Kaserne</b> und bilde darin einen neuen Soldaten aus.'],
  ['Haltung und Formation',
   'Deine Armee marschiert nicht nur: du bestimmst, wie sie sich verhält.<br><br>Wähle deine Soldaten und probiere die Haltung <b>Halten</b> (Taste 2) und dann die Formation <b>Keil</b> (Taste 8).'],
  ['Zeitalterwechsel',
   'Mit genug Rohstoffen kannst du ins nächste Jahrhundert vorrücken: neue Einheiten, neue Gebäude, ein stärkeres Heer.<br><br>Drücke <b>E</b> oder nutze das Zeitalter-Feld.'],
  ['Du bist bereit',
   'So viel zu den Grundlagen. Was noch auf dich wartet:<br><br>• <b>Schmiede</b> — Waffen und Rüstung<br>• <b>Akademie</b> — die Verbesserungen des Reiches<br>• <b>Hafen</b> — Schiffe und Handel<br>• <b>Krankenhaus</b> — Heilung und die Rückkehr deines Helden<br><br>Im Feldzug warten die Geschichten von acht Nationen. Viel Glück!'],
 ],
 zh:[
  ['欢迎来到《帝国》',
   '你的目标是建立一个从15世纪延续到20世纪的帝国。让我们从头开始。<br><br><b>拖出一个选框</b>圈住你的农奴，或逐个点击他们。'],
  ['为农奴指派伐木',
   '选中农奴后，<b>右键点击一棵树</b>。他们会砍伐并把木材运回司令部。<br><br>木材是最重要的资源：几乎所有建筑都需要它。'],
  ['建造农场',
   '军队需要进食。没有食物，士兵会衰弱。<br><br>你的基地已有两座农场 — 在旁边<b>再建一座</b>。<br><br>选中农奴后按 <b>F</b> 键（或点击“农场”按钮），然后点击想要建造的位置。'],
  ['需要更多农奴',
   '劳作的人越多，帝国就发展得越快。<br><br>选中<b>司令部</b>，训练一名新的农奴。'],
  ['兵营与士兵',
   '敌人迟早会来。你的基地上已经有一座兵营。<br><br>选中<b>兵营</b>，在其中训练一名新的士兵。'],
  ['战斗姿态与阵型',
   '你的军队不只是行军：你可以决定他们的行为方式。<br><br>选中士兵，试试<b>坚守</b>姿态（2 键），再试试<b>楔形</b>阵型（8 键）。'],
  ['进入下一时代',
   '资源足够时，你可以迈入下一个世纪：新单位、新建筑、更强的军队。<br><br>按 <b>E</b> 键，或点击时代面板。'],
  ['你已准备就绪',
   '基础到此为止。接下来还有：<br><br>• <b>铁匠铺</b> — 武器与护甲<br>• <b>学院</b> — 帝国的各项改良<br>• <b>港口</b> — 船只与贸易<br>• <b>医院</b> — 治疗与召回英雄<br><br>战役中有八个国家的故事等着你。祝你好运！'],
 ]
};
function tutorCim(i,alap){ const t=TUTOR_FORD[LANG]; return (t&&t[i]&&t[i][0])||alap; }
function tutorSzoveg(i,alap){ const t=TUTOR_FORD[LANG]; return (t&&t[i]&&t[i][1])||alap; }

/* --- Küldetések ---
   A hadjáratok küldetéseinek nincs saját azonosítójuk, viszont mind a 66
   nevük és eligazításuk egyedi — ezért maga a magyar eredeti a kulcs.
   Ami hiányzik, magyarul marad. */
const KULD_NEV={
 en:{
  'A Testvériség kódexe':'The Code of the Brotherhood',
  'A köztársaság kikötője':'The harbour of the republic',
  'A kegyelemlevél':'The letter of pardon',
  'Az égő hajó':'The burning ship',
  'A leszavazott kapitány':'The captain voted down',
  'A vasketrec':'The iron cage',
  'A Queen Anne bosszúja':'Queen Anne’s Revenge',
  'A rettegés fegyver':'Terror as a weapon',
  'Charleston blokádja':'The blockade of Charleston',
  'A zátonyra futott zsákmány':'The prize run aground',
  'Ocracoke szigete':'The island of Ocracoke',
  'Maynard hadnagy':'Lieutenant Maynard',
  'A barbadosi ültetvényes':'The planter from Barbados',
  'A Bosszú':'The Revenge',
  'A társ, aki elvette a hajót':'The partner who took the ship',
  'Kegyelem és köpönyeg':'Pardon and turncoat',
  'A Cape Fear folyó':'The Cape Fear river',
  'A charlestoni akasztófa':'The gallows at Charleston',
  'A Katolikus Királyok':'The Catholic Monarchs',
  'Granada visszavétele':'The taking of Granada',
  'Palos kikötője':'The port of Palos',
  'A Paradicsom felfedezése':'The discovery of paradise',
  'Az első kolónia':'The first colony',
  'Az Újvilág ura':'Lord of the New World',
  'Nándorfehérvár':'Belgrade',
  'A hosszú tél':'The long winter',
  'A fekete sereg':'The Black Army',
  'Rákóczi szabadságharca':'Rákóczi’s war of independence',
  'Negyvennyolc tavasza':'The spring of forty-eight',
  'A gépek kora':'The age of machines',
  'A Jagellók földje':'The land of the Jagiellons',
  'A német lovagrend':'The Teutonic Order',
  'Szárnyas huszárok':'Winged hussars',
  'Bécs felmentése':'The relief of Vienna',
  'Kościuszko felkelése':'Kościuszko’s uprising',
  'Varsó felszabadítása':'The liberation of Warsaw',
  'A Habsburg örökség':'The Habsburg inheritance',
  'Bécs ostroma':'The siege of Vienna',
  'A törökellenes liga':'The Holy League',
  'Az örökösödési háború':'The war of succession',
  'A kiegyezés':'The Compromise',
  'A nagy háború':'The Great War',
  'A birodalmi rend':'The order of the empire',
  'A Landsknecht ezredek':'The Landsknecht regiments',
  'A harmincéves háború':'The Thirty Years’ War',
  'Porosz fegyelem':'Prussian discipline',
  'Vas és vér':'Blood and iron',
  'Az egyesült birodalom':'The united empire',
  'A királyi birtok':'The royal domain',
  'A százéves háború vége':'The end of the Hundred Years’ War',
  'Versailles':'Versailles',
  'Vauban erődjei':'Vauban’s fortresses',
  'A Grande Armée':'The Grande Armée',
  'A köztársaság':'The republic',
  'A rózsák után':'After the roses',
  'Az íjászok kora':'The age of the archers',
  'Az Armada':'The Armada',
  'Az új mintájú hadsereg':'The New Model Army',
  'A birodalom kereskedelme':'The trade of the empire',
  'A leghosszabb nap':'The longest day',
  'Moszkva felemelkedése':'The rise of Moscow',
  'A Kreml falai':'The walls of the Kremlin',
  'A zavaros idők':'The Time of Troubles',
  'Nagy Péter reformja':'Peter the Great’s reform',
  'Felperzselt föld':'Scorched earth',
  'Ipari nagyhatalom':'Industrial great power',
 },
 de:{
  'A Testvériség kódexe':'Der Kodex der Bruderschaft',
  'A köztársaság kikötője':'Der Hafen der Republik',
  'A kegyelemlevél':'Der Gnadenbrief',
  'Az égő hajó':'Das brennende Schiff',
  'A leszavazott kapitány':'Der abgewählte Kapitän',
  'A vasketrec':'Der eiserne Käfig',
  'A Queen Anne bosszúja':'Queen Anne’s Revenge',
  'A rettegés fegyver':'Schrecken als Waffe',
  'Charleston blokádja':'Die Blockade von Charleston',
  'A zátonyra futott zsákmány':'Die auf Grund gelaufene Beute',
  'Ocracoke szigete':'Die Insel Ocracoke',
  'Maynard hadnagy':'Leutnant Maynard',
  'A barbadosi ültetvényes':'Der Pflanzer aus Barbados',
  'A Bosszú':'Die Revenge',
  'A társ, aki elvette a hajót':'Der Partner, der das Schiff nahm',
  'Kegyelem és köpönyeg':'Gnade und Wendemantel',
  'A Cape Fear folyó':'Der Cape-Fear-Fluss',
  'A charlestoni akasztófa':'Der Galgen von Charleston',
  'A Katolikus Királyok':'Die Katholischen Könige',
  'Granada visszavétele':'Die Einnahme von Granada',
  'Palos kikötője':'Der Hafen von Palos',
  'A Paradicsom felfedezése':'Die Entdeckung des Paradieses',
  'Az első kolónia':'Die erste Kolonie',
  'Az Újvilág ura':'Herr der Neuen Welt',
  'Nándorfehérvár':'Belgrad',
  'A hosszú tél':'Der lange Winter',
  'A fekete sereg':'Das Schwarze Heer',
  'Rákóczi szabadságharca':'Rákóczis Freiheitskampf',
  'Negyvennyolc tavasza':'Der Frühling von Achtundvierzig',
  'A gépek kora':'Das Zeitalter der Maschinen',
  'A Jagellók földje':'Das Land der Jagiellonen',
  'A német lovagrend':'Der Deutsche Orden',
  'Szárnyas huszárok':'Geflügelte Husaren',
  'Bécs felmentése':'Der Entsatz von Wien',
  'Kościuszko felkelése':'Kościuszkos Aufstand',
  'Varsó felszabadítása':'Die Befreiung Warschaus',
  'A Habsburg örökség':'Das habsburgische Erbe',
  'Bécs ostroma':'Die Belagerung Wiens',
  'A törökellenes liga':'Die Heilige Liga',
  'Az örökösödési háború':'Der Erbfolgekrieg',
  'A kiegyezés':'Der Ausgleich',
  'A nagy háború':'Der Große Krieg',
  'A birodalmi rend':'Die Reichsordnung',
  'A Landsknecht ezredek':'Die Landsknechtsregimenter',
  'A harmincéves háború':'Der Dreißigjährige Krieg',
  'Porosz fegyelem':'Preußische Disziplin',
  'Vas és vér':'Blut und Eisen',
  'Az egyesült birodalom':'Das geeinte Reich',
  'A királyi birtok':'Die königliche Domäne',
  'A százéves háború vége':'Das Ende des Hundertjährigen Krieges',
  'Versailles':'Versailles',
  'Vauban erődjei':'Vaubans Festungen',
  'A Grande Armée':'Die Grande Armée',
  'A köztársaság':'Die Republik',
  'A rózsák után':'Nach den Rosen',
  'Az íjászok kora':'Das Zeitalter der Bogenschützen',
  'Az Armada':'Die Armada',
  'Az új mintájú hadsereg':'Die New Model Army',
  'A birodalom kereskedelme':'Der Handel des Reiches',
  'A leghosszabb nap':'Der längste Tag',
  'Moszkva felemelkedése':'Der Aufstieg Moskaus',
  'A Kreml falai':'Die Mauern des Kreml',
  'A zavaros idők':'Die Zeit der Wirren',
  'Nagy Péter reformja':'Die Reform Peters des Großen',
  'Felperzselt föld':'Verbrannte Erde',
  'Ipari nagyhatalom':'Industrielle Großmacht',
 },
 zh:{
  'A Testvériség kódexe':'兄弟会法典',
  'A köztársaság kikötője':'共和国之港',
  'A kegyelemlevél':'赦免令',
  'Az égő hajó':'火船',
  'A leszavazott kapitány':'被罢免的船长',
  'A vasketrec':'铁笼',
  'A Queen Anne bosszúja':'安妮女王复仇号',
  'A rettegés fegyver':'恐惧即武器',
  'Charleston blokádja':'封锁查尔斯顿',
  'A zátonyra futott zsákmány':'搁浅的战利品',
  'Ocracoke szigete':'奥克拉科克岛',
  'Maynard hadnagy':'梅纳德中尉',
  'A barbadosi ültetvényes':'巴巴多斯的种植园主',
  'A Bosszú':'复仇号',
  'A társ, aki elvette a hajót':'夺船的“伙伴”',
  'Kegyelem és köpönyeg':'赦免与变节',
  'A Cape Fear folyó':'恐惧角河',
  'A charlestoni akasztófa':'查尔斯顿的绞架',
  'A Katolikus Királyok':'天主教双王',
  'Granada visszavétele':'收复格拉纳达',
  'Palos kikötője':'帕洛斯港',
  'A Paradicsom felfedezése':'发现乐土',
  'Az első kolónia':'第一处殖民地',
  'Az Újvilág ura':'新世界之主',
  'Nándorfehérvár':'南多尔堡',
  'A hosszú tél':'漫长的冬天',
  'A fekete sereg':'黑军',
  'Rákóczi szabadságharca':'拉科齐的独立战争',
  'Negyvennyolc tavasza':'四八年之春',
  'A gépek kora':'机器时代',
  'A Jagellók földje':'雅盖隆的土地',
  'A német lovagrend':'条顿骑士团',
  'Szárnyas huszárok':'翼骑兵',
  'Bécs felmentése':'解维也纳之围',
  'Kościuszko felkelése':'科希丘什科起义',
  'Varsó felszabadítása':'解放华沙',
  'A Habsburg örökség':'哈布斯堡的遗产',
  'Bécs ostroma':'维也纳之围',
  'A törökellenes liga':'抗土同盟',
  'Az örökösödési háború':'继承战争',
  'A kiegyezés':'奥匈折衷',
  'A nagy háború':'大战',
  'A birodalmi rend':'帝国秩序',
  'A Landsknecht ezredek':'雇佣步兵团',
  'A harmincéves háború':'三十年战争',
  'Porosz fegyelem':'普鲁士纪律',
  'Vas és vér':'铁与血',
  'Az egyesült birodalom':'统一的帝国',
  'A királyi birtok':'王室领地',
  'A százéves háború vége':'百年战争的终结',
  'Versailles':'凡尔赛',
  'Vauban erődjei':'沃邦的要塞',
  'A Grande Armée':'大军团',
  'A köztársaság':'共和国',
  'A rózsák után':'蔷薇之后',
  'Az íjászok kora':'弓箭手的时代',
  'Az Armada':'无敌舰队',
  'Az új mintájú hadsereg':'新模范军',
  'A birodalom kereskedelme':'帝国的贸易',
  'A leghosszabb nap':'最长的一日',
  'Moszkva felemelkedése':'莫斯科的崛起',
  'A Kreml falai':'克里姆林宫墙',
  'A zavaros idők':'混乱时代',
  'Nagy Péter reformja':'彼得大帝的改革',
  'Felperzselt föld':'焦土',
  'Ipari nagyhatalom':'工业强国',
 }
};
const KULD_BRIEF={
 en:{
  'A háború véget ért, a matrózok munka nélkül maradtak. Nassau kikötőjében kódexet írtunk: közös zsákmány, választott kapitány. Építs hat majorságot — a szabadságot etetni kell.':
   'The war is over and the sailors are out of work. In the harbour of Nassau we wrote a code: shared plunder, an elected captain. Build six farms — freedom has to be fed.',
  'Egy szabad kikötő csak akkor él meg, ha van mit eladnia. Építs kikötőt és piacot, és gyűjts hatszáz aranyat.':
   'A free port only survives if it has something to sell. Build a harbour and a market, and gather six hundred gold.',
  'Woodes Rogers megérkezett a király kegyelmével. Aki elfogadja, szabad ember lesz — aki nem, azt felakasztják. Verd vissza a blokádot: húsz ellenséges egység.':
   'Woodes Rogers has arrived with the king’s pardon. Whoever takes it walks free — whoever refuses hangs. Beat back the blockade: twenty enemy units.',
  'Vane felgyújtott egy zsákmányolt francia hajót, és nekiengedte a blokádnak. A zűrzavarban ki kell törni: építs nyolc épületet a szabad kikötőben.':
   'Vane set fire to a captured French ship and sent it into the blockade. Break out in the confusion: build eight buildings in the free port.',
  'A kódex ellened fordult: a legénység gyávasággal vádol. Bizonyíts — semmisíts meg harmincöt ellenséges egységet.':
   'The code has turned against you: the crew accuse you of cowardice. Prove them wrong — destroy thirty-five enemy units.',
  'Port Royal kikötőjében vasketrec vár mindenkire, aki a kódexhez hű maradt. Ha ez a vég, legyen méltó: döntsd meg az ellenség hatalmát.':
   'In the harbour of Port Royal an iron cage waits for everyone who stayed true to the code. If this is the end, make it worthy: break the enemy’s power.',
  'Egy zsákmányolt francia rabszolgahajóból lett a legfélelmetesebb fregatt a Karib-tengeren. Építsd ki a támaszpontot: hat majorság kell a legénységnek.':
   'A captured French slave ship became the most feared frigate in the Caribbean. Build up the base: the crew needs six farms.',
  'Égő kanócokat font a szakállába, hogy füstben és lángban lépjen a fedélzetre. A hír megelőzi a hajót: törj meg húsz ellenséges egységet.':
   'He wove burning fuses into his beard so as to board in smoke and flame. The rumour arrives before the ship: destroy twenty enemy units.',
  'Egy hétig zárta el a kikötőt, és váltságdíj helyett gyógyszerládát követelt. Szerezz nyolcszáz aranyat a városból.':
   'For a week he closed the harbour, and instead of ransom he demanded a chest of medicine. Take eight hundred gold from the town.',
  'A Queen Anne bosszúja zátonyra futott — sokak szerint szándékosan, hogy a kapitány megszabaduljon a túl nagy legénységtől. Építsd újjá a flottát: tíz épület.':
   'Queen Anne’s Revenge ran aground — many say on purpose, so the captain could be rid of too large a crew. Rebuild the fleet: ten buildings.',
  'A sekély öbölbe csak az fut be, aki ismeri a járást. Itt gyülekezik a legénység — és ide tart a virginiai kormányzó hajóhada. Negyven ellenséget kell megtörni.':
   'Only someone who knows the channel runs into that shallow bay. The crew gathers here — and so does the Virginia governor’s squadron. Forty enemies must be broken.',
  'Öt lövés és húsz vágás kellett hozzá, hogy elessen — a fejét az árbocra kötötték. Ha ez az utolsó csata, ne maradjon állva semmi az ellenségből.':
   'It took five shots and twenty cuts to bring him down — his head was lashed to the bowsprit. If this is the last battle, leave nothing of the enemy standing.',
  'Bonnet gazdag földbirtokos volt, aki unalmában hajót VÁSÁROLT, nem zsákmányolt — és fizetett bért a legénységnek. Kezdd a birtokkal: hat majorság.':
   'Bonnet was a wealthy landowner who out of boredom BOUGHT a ship rather than taking one — and paid his crew wages. Start with the estate: six farms.',
  'Tíz ágyú, hetven ember, és egy kapitány, aki nem tudott hajót vezetni. A legénység a szemébe nevetett. Építs nyolc épületet, hogy legyen tekintélyed.':
   'Ten guns, seventy men, and a captain who could not sail. The crew laughed in his face. Build eight buildings to earn some standing.',
  'Fekete Szakáll a vendégeként érkezett, és a végén a saját embereit ültette a Bosszú fedélzetére. Bonnet a kabinjában olvasott. Szerezz hatszáz aranyat a magad erejéből.':
   'Blackbeard came as his guest and ended up putting his own men aboard the Revenge. Bonnet stayed in his cabin, reading. Earn six hundred gold by your own hand.',
  'Kegyelmet kapott, majd „Thomas úr" néven visszatért a kalózkodáshoz — a hajót átkeresztelte Királyi Jakabra. Húsz ellenséges egységet kell megtörni.':
   'He took the pardon, then returned to piracy as “Mister Thomas” — renaming the ship the Royal James. Twenty enemy units must be broken.',
  'A folyó torkolatában javította a hajót, amikor Rhett ezredes rátalált. Öt óra tűzharc a homokpadok között — harminc ellenséget kell kiállni.':
   'He was repairing the ship in the river mouth when Colonel Rhett found him. Five hours of gunfire among the sandbars — thirty enemies must be withstood.',
  'Az úri kalóz kegyelemért könyörgött, és virágcsokrot tartott a kezében az akasztófa alatt. A történet vége meg van írva — te viszont másképp is befejezheted.':
   'The gentleman pirate begged for mercy and held a posy of flowers under the gallows. The end of the story is written — but you may finish it differently.',
  'Ferdinánd és Izabella egyesítette a koronákat. Előbb a föld: építs hat majorságot a granadai hadjárat ellátására.':
   'Ferdinand and Isabella united the crowns. The land comes first: build six farms to supply the Granada campaign.',
  'A félsziget utolsó mór erőssége. Törd meg a védőket, és zárul a nyolcszáz éves reconquista.':
   'The last Moorish stronghold on the peninsula. Break the defenders, and eight hundred years of reconquest come to a close.',
  'A nyugati út hajót kíván. Építs kikötőt, és gyűjts hatszáz aranyat a három karavella felszereléséhez.':
   'The westward route calls for ships. Build a harbour and gather six hundred gold to fit out the three caravels.',
  'Harminchárom nap a nyílt vízen, aztán a partjelző madarak. Sűrű erdős szigetek, alig arany. Verd fel az első tábort: tizenkét épület.':
   'Thirty-three days on open water, then the birds that mark the shore. Dense wooded islands, hardly any gold. Pitch the first camp: twelve buildings.',
  'La Navidad palánkja áll, de az őslakók egyre sűrűbben törnek ránk. Tarts ki öt percen át.':
   'The palisade of La Navidad stands, but the islanders press us ever harder. Hold out for five minutes.',
  'A sziget a miénk lesz, vagy a tengerbe szorulunk. Törd meg az őslakók ellenállását.':
   'Either the island is ours, or we are pushed into the sea. Break the islanders’ resistance.',
  'A déli végek kapuja. Építs hat majorságot: ostrom idején az élelem többet ér a kardnál.':
   'The gate of the southern marches. Build six farms: under siege, food is worth more than the sword.',
  'A török portyák nem szűnnek. Tartsd a várat négy percen át — aki kitart, az győz.':
   'The Turkish raids do not cease. Hold the castle for four minutes — whoever endures, wins.',
  'Mátyás zsoldosait nem kaszárnya adja, hanem a királyi kincstár. A főhadiszállásról toborzol.':
   'Matthias’s mercenaries come not from a barracks but from the royal treasury. You recruit from the headquarters.',
  '„Cum Deo pro Patria et Libertate." A kurucok fegyvert fognak. Verd szét a császári erőket.':
   '“Cum Deo pro Patria et Libertate.” The kuruc take up arms. Scatter the imperial forces.',
  'A honvédsereg felszerelést kíván. Termelj ki hétszáz aranyat a hadikassza feltöltésére.':
   'The honvéd army needs equipping. Gather seven hundred gold to fill the war chest.',
  'A világ átalakult: acél, olaj és repülő. Vezesd birodalmadat a huszadik századba.':
   'The world has changed: steel, oil and aircraft. Lead your empire into the twentieth century.',
  'Krakkó körül gazdag a föld. Építs hat majorságot, hogy legyen mit enni a hosszú télen.':
   'The land around Kraków is rich. Build six farms so there is food through the long winter.',
  'Északról páncélos ék közeledik. Tartsd a vonalat négy percen át.':
   'An armoured wedge is coming from the north. Hold the line for four minutes.',
  'A világ legfélelmetesebb lovassága a tiéd. Sodord el az ellenséget egyetlen rohammal.':
   'The most feared cavalry in the world is yours. Sweep the enemy away in a single charge.',
  'Sobieski a Kahlenbergről ereszkedik alá. A keresztény Európa téged néz — tarts ki öt percig.':
   'Sobieski comes down from the Kahlenberg. Christian Europe is watching you — hold out for five minutes.',
  'Kaszás parasztok állnak a nemesek mellé. Kaszárnya nélkül, a birtokról toborzol.':
   'Scythe-bearing peasants stand beside the nobles. You recruit from the estate, without a barracks.',
  'A főváros romokban, de nem néma. Építsd újjá az országot a huszadik század küszöbén.':
   'The capital lies in ruins, but it is not silent. Rebuild the country on the threshold of the twentieth century.',
  'Amit más háborúval szerez, azt te frigyekkel. Előbb azonban élelem kell: hat majorság.':
   'What others gain by war, you gain by marriage. But food comes first: six farms.',
  'A falak alatt a szultán serege. Tarts ki öt percen át, míg a felmentő had megérkezik.':
   'The sultan’s army stands beneath the walls. Hold out for five minutes until the relief force arrives.',
  'Savoyai Jenő vezeti a császári hadat. Törd meg az ellenség erejét a Duna mentén.':
   'Eugene of Savoy leads the imperial army. Break the enemy’s strength along the Danube.',
  'Mária Terézia trónja inog. A hadviselés pénzbe kerül: nyolcszáz arany a hadikasszába.':
   'Maria Theresa’s throne is shaking. War costs money: eight hundred gold for the war chest.',
  'A birodalom kettős lett. Építs húsz épületet — a rend a kőben is látszik.':
   'The empire has become dual. Build twenty buildings — order shows in stone as well.',
  'A régi világ utolsó nyara. Vezesd a monarchiát a huszadik századba.':
   'The last summer of the old world. Lead the monarchy into the twentieth century.',
  'Széttagolt fejedelemségek. Kezdd az alapoknál: hat majorság a mindennapi kenyérért.':
   'Scattered principalities. Start with the foundations: six farms for the daily bread.',
  'A zsoldosok drágák, de rendíthetetlenek. Verd szét a szomszéd seregét.':
   'Mercenaries are expensive but unshakeable. Scatter the neighbour’s army.',
  'Fél Európa lángol. Tarts ki öt percen át — ez a háború nem a gyorsakról szól.':
   'Half of Europe is ablaze. Hold out for five minutes — this war is not about the swift.',
  'A Nagy Választófejedelem állandó hadsereget épít. Húsz épület, katonás rendben.':
   'The Great Elector is building a standing army. Twenty buildings, in soldierly order.',
  'Bismarck szava: a kor nagy kérdéseit nem beszédek döntik el. Törd meg az ellenállást.':
   'Bismarck’s word: the great questions of the age are not settled by speeches. Break the resistance.',
  'A fejedelemségekből nemzet lett. Lépj be a huszadik századba.':
   'Out of the principalities a nation has grown. Step into the twentieth century.',
  'XI. Lajos a pókháló türelmével sző. Kezdd a földdel: hat majorság.':
   'Louis XI weaves with the patience of a spider. Start with the land: six farms.',
  'Az angolok kiszorulnak a kontinensről. Szórd szét a maradék seregüket.':
   'The English are being pushed off the continent. Scatter what is left of their army.',
  'A Napkirály udvara aranyat kíván. Termelj ki nyolcszáz aranyat.':
   'The Sun King’s court demands gold. Gather eight hundred gold.',
  'A határt kővel védjük, nem vérrel. Építs húsz épületet a védelmi vonal mentén.':
   'We defend the border with stone, not blood. Build twenty buildings along the line of defence.',
  'Napóleon serege menetel. A császár nem ismeri a szót: elég.':
   'Napoleon’s army is on the march. The emperor does not know the word “enough”.',
  'Császárok jöttek és mentek, a nemzet maradt. Lépj a huszadik századba.':
   'Emperors came and went; the nation remained. Step into the twentieth century.',
  'A polgárháború véget ért, az ország kimerült. Hat majorság, hogy legyen mit enni.':
   'The civil war is over and the country is exhausted. Six farms, so there is something to eat.',
  'A hosszúíj még mindig a legfélelmetesebb fegyver. Bizonyítsd be a csatatéren.':
   'The longbow is still the most fearsome weapon. Prove it on the battlefield.',
  'A tengerről érkezik a fenyegetés. Tarts ki öt percen át, a vihar a szövetségesed.':
   'The threat comes from the sea. Hold out for five minutes; the storm is your ally.',
  'Cromwell fegyelmezett ezredei nem ismerik a menekülést. Törd meg a királypártiakat.':
   'Cromwell’s disciplined regiments do not know flight. Break the royalists.',
  'Ahol a hajó jár, ott az arany is. Termelj ki nyolcszáz aranyat.':
   'Where the ships go, the gold goes too. Gather eight hundred gold.',
  'A sziget kitartott. Most vezesd birodalmadat a huszadik századba.':
   'The island has held. Now lead your empire into the twentieth century.',
  'A tatár iga véget ért. Építs hat majorságot a fagyos föld termésére.':
   'The Tatar yoke is over. Build six farms for the harvest of the frozen land.',
  'Kő kövön: húsz épület álljon, mire a tél beköszönt.':
   'Stone upon stone: let twenty buildings stand before winter comes.',
  'Trónkövetelők és idegen seregek. Tarts ki öt percen át, amíg a rend visszatér.':
   'Pretenders and foreign armies. Hold out for five minutes until order returns.',
  'Ablakot vágunk Európára. A flottához és a városhoz arany kell: nyolcszáz.':
   'We are cutting a window onto Europe. The fleet and the city need gold: eight hundred.',
  'Az ellenség mélyen benyomult. A tél és a távolság a mi oldalunkon áll.':
   'The enemy has driven deep. Winter and distance are on our side.',
  'A birodalom gyárakat épít. Lépj be a huszadik századba.':
   'The empire is building factories. Step into the twentieth century.',
 },
 de:{
  'A háború véget ért, a matrózok munka nélkül maradtak. Nassau kikötőjében kódexet írtunk: közös zsákmány, választott kapitány. Építs hat majorságot — a szabadságot etetni kell.':
   'Der Krieg ist vorbei, die Matrosen sind ohne Arbeit. Im Hafen von Nassau schrieben wir einen Kodex: geteilte Beute, gewählter Kapitän. Baue sechs Bauernhöfe — die Freiheit will ernährt werden.',
  'Egy szabad kikötő csak akkor él meg, ha van mit eladnia. Építs kikötőt és piacot, és gyűjts hatszáz aranyat.':
   'Ein Freihafen lebt nur, wenn er etwas zu verkaufen hat. Baue einen Hafen und einen Markt und sammle sechshundert Gold.',
  'Woodes Rogers megérkezett a király kegyelmével. Aki elfogadja, szabad ember lesz — aki nem, azt felakasztják. Verd vissza a blokádot: húsz ellenséges egység.':
   'Woodes Rogers ist mit der Begnadigung des Königs eingetroffen. Wer sie annimmt, geht frei — wer nicht, wird gehängt. Schlage die Blockade zurück: zwanzig feindliche Einheiten.',
  'Vane felgyújtott egy zsákmányolt francia hajót, és nekiengedte a blokádnak. A zűrzavarban ki kell törni: építs nyolc épületet a szabad kikötőben.':
   'Vane steckte ein erbeutetes französisches Schiff in Brand und ließ es in die Blockade laufen. Brich im Durcheinander aus: baue acht Gebäude im Freihafen.',
  'A kódex ellened fordult: a legénység gyávasággal vádol. Bizonyíts — semmisíts meg harmincöt ellenséges egységet.':
   'Der Kodex hat sich gegen dich gewandt: die Mannschaft klagt dich der Feigheit an. Beweise das Gegenteil — vernichte fünfunddreißig feindliche Einheiten.',
  'Port Royal kikötőjében vasketrec vár mindenkire, aki a kódexhez hű maradt. Ha ez a vég, legyen méltó: döntsd meg az ellenség hatalmát.':
   'Im Hafen von Port Royal wartet ein eiserner Käfig auf jeden, der dem Kodex treu blieb. Wenn das das Ende ist, dann ein würdiges: brich die Macht des Feindes.',
  'Egy zsákmányolt francia rabszolgahajóból lett a legfélelmetesebb fregatt a Karib-tengeren. Építsd ki a támaszpontot: hat majorság kell a legénységnek.':
   'Aus einem erbeuteten französischen Sklavenschiff wurde die gefürchtetste Fregatte der Karibik. Baue den Stützpunkt aus: die Mannschaft braucht sechs Bauernhöfe.',
  'Égő kanócokat font a szakállába, hogy füstben és lángban lépjen a fedélzetre. A hír megelőzi a hajót: törj meg húsz ellenséges egységet.':
   'Er flocht brennende Lunten in seinen Bart, um in Rauch und Flammen an Bord zu gehen. Der Ruf eilt dem Schiff voraus: vernichte zwanzig feindliche Einheiten.',
  'Egy hétig zárta el a kikötőt, és váltságdíj helyett gyógyszerládát követelt. Szerezz nyolcszáz aranyat a városból.':
   'Eine Woche lang sperrte er den Hafen und forderte statt Lösegeld eine Arzneikiste. Hole achthundert Gold aus der Stadt.',
  'A Queen Anne bosszúja zátonyra futott — sokak szerint szándékosan, hogy a kapitány megszabaduljon a túl nagy legénységtől. Építsd újjá a flottát: tíz épület.':
   'Die Queen Anne’s Revenge lief auf Grund — viele sagen absichtlich, damit der Kapitän die zu große Mannschaft loswurde. Baue die Flotte neu auf: zehn Gebäude.',
  'A sekély öbölbe csak az fut be, aki ismeri a járást. Itt gyülekezik a legénység — és ide tart a virginiai kormányzó hajóhada. Negyven ellenséget kell megtörni.':
   'In die flache Bucht läuft nur ein, wer die Fahrrinne kennt. Hier sammelt sich die Mannschaft — und hierher fährt das Geschwader des Gouverneurs von Virginia. Vierzig Feinde müssen fallen.',
  'Öt lövés és húsz vágás kellett hozzá, hogy elessen — a fejét az árbocra kötötték. Ha ez az utolsó csata, ne maradjon állva semmi az ellenségből.':
   'Fünf Schüsse und zwanzig Hiebe brauchte es, bis er fiel — sein Kopf wurde an den Mast gebunden. Wenn das die letzte Schlacht ist, bleibe vom Feind nichts stehen.',
  'Bonnet gazdag földbirtokos volt, aki unalmában hajót VÁSÁROLT, nem zsákmányolt — és fizetett bért a legénységnek. Kezdd a birtokkal: hat majorság.':
   'Bonnet war ein reicher Gutsbesitzer, der aus Langeweile ein Schiff KAUFTE statt es zu kapern — und seiner Mannschaft Lohn zahlte. Beginne mit dem Gut: sechs Bauernhöfe.',
  'Tíz ágyú, hetven ember, és egy kapitány, aki nem tudott hajót vezetni. A legénység a szemébe nevetett. Építs nyolc épületet, hogy legyen tekintélyed.':
   'Zehn Kanonen, siebzig Mann und ein Kapitän, der nicht segeln konnte. Die Mannschaft lachte ihm ins Gesicht. Baue acht Gebäude, um Ansehen zu gewinnen.',
  'Fekete Szakáll a vendégeként érkezett, és a végén a saját embereit ültette a Bosszú fedélzetére. Bonnet a kabinjában olvasott. Szerezz hatszáz aranyat a magad erejéből.':
   'Blackbeard kam als sein Gast und setzte am Ende die eigenen Leute auf die Revenge. Bonnet las in seiner Kajüte. Verdiene sechshundert Gold aus eigener Kraft.',
  'Kegyelmet kapott, majd „Thomas úr" néven visszatért a kalózkodáshoz — a hajót átkeresztelte Királyi Jakabra. Húsz ellenséges egységet kell megtörni.':
   'Er nahm die Begnadigung an und kehrte als „Herr Thomas“ zur Piraterie zurück — das Schiff taufte er Royal James. Zwanzig feindliche Einheiten müssen fallen.',
  'A folyó torkolatában javította a hajót, amikor Rhett ezredes rátalált. Öt óra tűzharc a homokpadok között — harminc ellenséget kell kiállni.':
   'Er reparierte das Schiff in der Flussmündung, als Oberst Rhett ihn fand. Fünf Stunden Feuergefecht zwischen den Sandbänken — dreißig Feinde sind zu überstehen.',
  'Az úri kalóz kegyelemért könyörgött, és virágcsokrot tartott a kezében az akasztófa alatt. A történet vége meg van írva — te viszont másképp is befejezheted.':
   'Der Gentleman-Pirat flehte um Gnade und hielt unter dem Galgen einen Blumenstrauß. Das Ende der Geschichte steht geschrieben — du kannst es anders schreiben.',
  'Ferdinánd és Izabella egyesítette a koronákat. Előbb a föld: építs hat majorságot a granadai hadjárat ellátására.':
   'Ferdinand und Isabella vereinten die Kronen. Zuerst das Land: baue sechs Bauernhöfe für den Feldzug gegen Granada.',
  'A félsziget utolsó mór erőssége. Törd meg a védőket, és zárul a nyolcszáz éves reconquista.':
   'Die letzte maurische Feste der Halbinsel. Brich die Verteidiger, und acht Jahrhunderte Reconquista enden.',
  'A nyugati út hajót kíván. Építs kikötőt, és gyűjts hatszáz aranyat a három karavella felszereléséhez.':
   'Der Weg nach Westen verlangt Schiffe. Baue einen Hafen und sammle sechshundert Gold für die Ausrüstung der drei Karavellen.',
  'Harminchárom nap a nyílt vízen, aztán a partjelző madarak. Sűrű erdős szigetek, alig arany. Verd fel az első tábort: tizenkét épület.':
   'Dreiunddreißig Tage auf offener See, dann die Vögel, die Land anzeigen. Dichte Waldinseln, kaum Gold. Schlage das erste Lager auf: zwölf Gebäude.',
  'La Navidad palánkja áll, de az őslakók egyre sűrűbben törnek ránk. Tarts ki öt percen át.':
   'Die Palisade von La Navidad steht, doch die Inselbewohner bedrängen uns immer heftiger. Halte fünf Minuten durch.',
  'A sziget a miénk lesz, vagy a tengerbe szorulunk. Törd meg az őslakók ellenállását.':
   'Entweder gehört uns die Insel, oder wir werden ins Meer gedrängt. Brich den Widerstand der Inselbewohner.',
  'A déli végek kapuja. Építs hat majorságot: ostrom idején az élelem többet ér a kardnál.':
   'Das Tor der südlichen Grenzmark. Baue sechs Bauernhöfe: in der Belagerung ist Nahrung mehr wert als das Schwert.',
  'A török portyák nem szűnnek. Tartsd a várat négy percen át — aki kitart, az győz.':
   'Die türkischen Streifzüge hören nicht auf. Halte die Burg vier Minuten — wer durchhält, gewinnt.',
  'Mátyás zsoldosait nem kaszárnya adja, hanem a királyi kincstár. A főhadiszállásról toborzol.':
   'Die Söldner des Matthias kommen nicht aus der Kaserne, sondern aus der königlichen Schatzkammer. Du wirbst vom Hauptquartier aus an.',
  '„Cum Deo pro Patria et Libertate." A kurucok fegyvert fognak. Verd szét a császári erőket.':
   '„Cum Deo pro Patria et Libertate.“ Die Kurutzen greifen zu den Waffen. Zerschlage die kaiserlichen Truppen.',
  'A honvédsereg felszerelést kíván. Termelj ki hétszáz aranyat a hadikassza feltöltésére.':
   'Die Honvéd-Armee braucht Ausrüstung. Fördere siebenhundert Gold für die Kriegskasse.',
  'A világ átalakult: acél, olaj és repülő. Vezesd birodalmadat a huszadik századba.':
   'Die Welt hat sich gewandelt: Stahl, Öl und Flugzeuge. Führe dein Reich ins zwanzigste Jahrhundert.',
  'Krakkó körül gazdag a föld. Építs hat majorságot, hogy legyen mit enni a hosszú télen.':
   'Das Land um Krakau ist reich. Baue sechs Bauernhöfe, damit es im langen Winter zu essen gibt.',
  'Északról páncélos ék közeledik. Tartsd a vonalat négy percen át.':
   'Aus dem Norden nähert sich ein gepanzerter Keil. Halte die Linie vier Minuten.',
  'A világ legfélelmetesebb lovassága a tiéd. Sodord el az ellenséget egyetlen rohammal.':
   'Die gefürchtetste Reiterei der Welt gehört dir. Fege den Feind in einem einzigen Ansturm hinweg.',
  'Sobieski a Kahlenbergről ereszkedik alá. A keresztény Európa téged néz — tarts ki öt percig.':
   'Sobieski steigt vom Kahlenberg herab. Das christliche Europa schaut auf dich — halte fünf Minuten durch.',
  'Kaszás parasztok állnak a nemesek mellé. Kaszárnya nélkül, a birtokról toborzol.':
   'Sensenschützen stehen an der Seite des Adels. Du wirbst vom Gut aus an, ohne Kaserne.',
  'A főváros romokban, de nem néma. Építsd újjá az országot a huszadik század küszöbén.':
   'Die Hauptstadt liegt in Trümmern, doch sie schweigt nicht. Baue das Land an der Schwelle zum zwanzigsten Jahrhundert wieder auf.',
  'Amit más háborúval szerez, azt te frigyekkel. Előbb azonban élelem kell: hat majorság.':
   'Was andere durch Krieg gewinnen, gewinnst du durch Heirat. Doch zuerst braucht es Nahrung: sechs Bauernhöfe.',
  'A falak alatt a szultán serege. Tarts ki öt percen át, míg a felmentő had megérkezik.':
   'Unter den Mauern steht das Heer des Sultans. Halte fünf Minuten durch, bis das Entsatzheer eintrifft.',
  'Savoyai Jenő vezeti a császári hadat. Törd meg az ellenség erejét a Duna mentén.':
   'Prinz Eugen von Savoyen führt das kaiserliche Heer. Brich die Kraft des Feindes entlang der Donau.',
  'Mária Terézia trónja inog. A hadviselés pénzbe kerül: nyolcszáz arany a hadikasszába.':
   'Der Thron Maria Theresias wankt. Krieg kostet Geld: achthundert Gold in die Kriegskasse.',
  'A birodalom kettős lett. Építs húsz épületet — a rend a kőben is látszik.':
   'Das Reich ist doppelt geworden. Baue zwanzig Gebäude — Ordnung zeigt sich auch im Stein.',
  'A régi világ utolsó nyara. Vezesd a monarchiát a huszadik századba.':
   'Der letzte Sommer der alten Welt. Führe die Monarchie ins zwanzigste Jahrhundert.',
  'Széttagolt fejedelemségek. Kezdd az alapoknál: hat majorság a mindennapi kenyérért.':
   'Zersplitterte Fürstentümer. Fange bei den Grundlagen an: sechs Bauernhöfe für das tägliche Brot.',
  'A zsoldosok drágák, de rendíthetetlenek. Verd szét a szomszéd seregét.':
   'Söldner sind teuer, aber unerschütterlich. Zerschlage das Heer des Nachbarn.',
  'Fél Európa lángol. Tarts ki öt percen át — ez a háború nem a gyorsakról szól.':
   'Halb Europa steht in Flammen. Halte fünf Minuten durch — dieser Krieg gehört nicht den Schnellen.',
  'A Nagy Választófejedelem állandó hadsereget épít. Húsz épület, katonás rendben.':
   'Der Große Kurfürst baut ein stehendes Heer auf. Zwanzig Gebäude, in militärischer Ordnung.',
  'Bismarck szava: a kor nagy kérdéseit nem beszédek döntik el. Törd meg az ellenállást.':
   'Bismarcks Wort: die großen Fragen der Zeit werden nicht durch Reden entschieden. Brich den Widerstand.',
  'A fejedelemségekből nemzet lett. Lépj be a huszadik századba.':
   'Aus den Fürstentümern wurde eine Nation. Tritt ins zwanzigste Jahrhundert ein.',
  'XI. Lajos a pókháló türelmével sző. Kezdd a földdel: hat majorság.':
   'Ludwig XI. webt mit der Geduld einer Spinne. Fange beim Land an: sechs Bauernhöfe.',
  'Az angolok kiszorulnak a kontinensről. Szórd szét a maradék seregüket.':
   'Die Engländer werden vom Kontinent verdrängt. Zerstreue den Rest ihres Heeres.',
  'A Napkirály udvara aranyat kíván. Termelj ki nyolcszáz aranyat.':
   'Der Hof des Sonnenkönigs verlangt Gold. Fördere achthundert Gold.',
  'A határt kővel védjük, nem vérrel. Építs húsz épületet a védelmi vonal mentén.':
   'Wir verteidigen die Grenze mit Stein, nicht mit Blut. Baue zwanzig Gebäude entlang der Verteidigungslinie.',
  'Napóleon serege menetel. A császár nem ismeri a szót: elég.':
   'Napoleons Heer marschiert. Der Kaiser kennt das Wort „genug“ nicht.',
  'Császárok jöttek és mentek, a nemzet maradt. Lépj a huszadik századba.':
   'Kaiser kamen und gingen, die Nation blieb. Tritt ins zwanzigste Jahrhundert ein.',
  'A polgárháború véget ért, az ország kimerült. Hat majorság, hogy legyen mit enni.':
   'Der Bürgerkrieg ist vorbei, das Land erschöpft. Sechs Bauernhöfe, damit es zu essen gibt.',
  'A hosszúíj még mindig a legfélelmetesebb fegyver. Bizonyítsd be a csatatéren.':
   'Der Langbogen ist noch immer die furchtbarste Waffe. Beweise es auf dem Schlachtfeld.',
  'A tengerről érkezik a fenyegetés. Tarts ki öt percen át, a vihar a szövetségesed.':
   'Die Bedrohung kommt vom Meer. Halte fünf Minuten durch, der Sturm ist dein Verbündeter.',
  'Cromwell fegyelmezett ezredei nem ismerik a menekülést. Törd meg a királypártiakat.':
   'Cromwells disziplinierte Regimenter kennen keine Flucht. Brich die Royalisten.',
  'Ahol a hajó jár, ott az arany is. Termelj ki nyolcszáz aranyat.':
   'Wohin die Schiffe fahren, dorthin geht auch das Gold. Fördere achthundert Gold.',
  'A sziget kitartott. Most vezesd birodalmadat a huszadik századba.':
   'Die Insel hat gehalten. Führe nun dein Reich ins zwanzigste Jahrhundert.',
  'A tatár iga véget ért. Építs hat majorságot a fagyos föld termésére.':
   'Das Tatarenjoch ist zu Ende. Baue sechs Bauernhöfe für die Ernte des gefrorenen Landes.',
  'Kő kövön: húsz épület álljon, mire a tél beköszönt.':
   'Stein auf Stein: zwanzig Gebäude sollen stehen, ehe der Winter kommt.',
  'Trónkövetelők és idegen seregek. Tarts ki öt percen át, amíg a rend visszatér.':
   'Thronprätendenten und fremde Heere. Halte fünf Minuten durch, bis die Ordnung zurückkehrt.',
  'Ablakot vágunk Európára. A flottához és a városhoz arany kell: nyolcszáz.':
   'Wir schlagen ein Fenster nach Europa. Flotte und Stadt brauchen Gold: achthundert.',
  'Az ellenség mélyen benyomult. A tél és a távolság a mi oldalunkon áll.':
   'Der Feind ist tief vorgedrungen. Winter und Entfernung stehen auf unserer Seite.',
  'A birodalom gyárakat épít. Lépj be a huszadik századba.':
   'Das Reich baut Fabriken. Tritt ins zwanzigste Jahrhundert ein.',
 },
 zh:{
  'A háború véget ért, a matrózok munka nélkül maradtak. Nassau kikötőjében kódexet írtunk: közös zsákmány, választott kapitány. Építs hat majorságot — a szabadságot etetni kell.':
   '战争结束了，水手们失了业。在拿骚港，我们写下法典：战利品共享，船长由推选产生。建造六座农场 — 自由也需要喂养。',
  'Egy szabad kikötő csak akkor él meg, ha van mit eladnia. Építs kikötőt és piacot, és gyűjts hatszáz aranyat.':
   '自由港唯有有货可售才能存续。建造港口与市场，并积攒六百黄金。',
  'Woodes Rogers megérkezett a király kegyelmével. Aki elfogadja, szabad ember lesz — aki nem, azt felakasztják. Verd vissza a blokádot: húsz ellenséges egység.':
   '伍兹·罗杰斯带着国王的赦免到来。接受者获自由，拒绝者上绞架。击退封锁：二十个敌方单位。',
  'Vane felgyújtott egy zsákmányolt francia hajót, és nekiengedte a blokádnak. A zűrzavarban ki kell törni: építs nyolc épületet a szabad kikötőben.':
   '韦恩点燃了一艘缴获的法国船，任其冲向封锁线。趁乱突围：在自由港建造八座建筑。',
  'A kódex ellened fordult: a legénység gyávasággal vádol. Bizonyíts — semmisíts meg harmincöt ellenséges egységet.':
   '法典反过来对准了你：船员指控你怯懦。用行动证明 — 消灭三十五个敌方单位。',
  'Port Royal kikötőjében vasketrec vár mindenkire, aki a kódexhez hű maradt. Ha ez a vég, legyen méltó: döntsd meg az ellenség hatalmát.':
   '在皇家港，铁笼等着每一个忠于法典的人。若这是终局，就让它体面：击垮敌人的势力。',
  'Egy zsákmányolt francia rabszolgahajóból lett a legfélelmetesebb fregatt a Karib-tengeren. Építsd ki a támaszpontot: hat majorság kell a legénységnek.':
   '一艘缴获的法国贩奴船，成了加勒比最令人生畏的巡防舰。扩建据点：船员需要六座农场。',
  'Égő kanócokat font a szakállába, hogy füstben és lángban lépjen a fedélzetre. A hír megelőzi a hajót: törj meg húsz ellenséges egységet.':
   '他把点燃的火绳编进胡须，在烟与火中登船。名声先于船抵达：击溃二十个敌方单位。',
  'Egy hétig zárta el a kikötőt, és váltságdíj helyett gyógyszerládát követelt. Szerezz nyolcszáz aranyat a városból.':
   '他封锁港口一周，索要的不是赎金，而是一箱药品。从城中取得八百黄金。',
  'A Queen Anne bosszúja zátonyra futott — sokak szerint szándékosan, hogy a kapitány megszabaduljon a túl nagy legénységtől. Építsd újjá a flottát: tíz épület.':
   '安妮女王复仇号搁浅了 — 许多人说是故意为之，好让船长甩掉过多的船员。重建舰队：十座建筑。',
  'A sekély öbölbe csak az fut be, aki ismeri a járást. Itt gyülekezik a legénység — és ide tart a virginiai kormányzó hajóhada. Negyven ellenséget kell megtörni.':
   '只有熟悉水道的人才敢驶入这片浅湾。船员在此集结 — 弗吉尼亚总督的舰队也正驶来。必须击溃四十个敌人。',
  'Öt lövés és húsz vágás kellett hozzá, hogy elessen — a fejét az árbocra kötötték. Ha ez az utolsó csata, ne maradjon állva semmi az ellenségből.':
   '五枪二十刀才让他倒下 — 他的头颅被系在船首斜桅上。若这是最后一战，就别给敌人留下任何东西。',
  'Bonnet gazdag földbirtokos volt, aki unalmában hajót VÁSÁROLT, nem zsákmányolt — és fizetett bért a legénységnek. Kezdd a birtokkal: hat majorság.':
   '邦尼特是个富有的地主，出于无聊，他“买”下了一艘船而非劫掠 — 还给船员发薪。先从庄园开始：六座农场。',
  'Tíz ágyú, hetven ember, és egy kapitány, aki nem tudott hajót vezetni. A legénység a szemébe nevetett. Építs nyolc épületet, hogy legyen tekintélyed.':
   '十门炮，七十个人，还有一位不会驾船的船长。船员当面嘲笑他。建造八座建筑，好挣得几分威望。',
  'Fekete Szakáll a vendégeként érkezett, és a végén a saját embereit ültette a Bosszú fedélzetére. Bonnet a kabinjában olvasott. Szerezz hatszáz aranyat a magad erejéből.':
   '黑胡子以客人的身份到来，最后却把自己的人安插上了复仇号。邦尼特则在舱里读书。靠自己挣得六百黄金。',
  'Kegyelmet kapott, majd „Thomas úr" néven visszatért a kalózkodáshoz — a hajót átkeresztelte Királyi Jakabra. Húsz ellenséges egységet kell megtörni.':
   '他接受了赦免，随后化名“托马斯先生”重操旧业 — 并将船改名为皇家詹姆斯号。必须击溃二十个敌方单位。',
  'A folyó torkolatában javította a hajót, amikor Rhett ezredes rátalált. Öt óra tűzharc a homokpadok között — harminc ellenséget kell kiállni.':
   '他正在河口修船，被瑞特上校找到。沙洲之间是五个小时的炮火 — 必须顶住三十个敌人。',
  'Az úri kalóz kegyelemért könyörgött, és virágcsokrot tartott a kezében az akasztófa alatt. A történet vége meg van írva — te viszont másképp is befejezheted.':
   '这位“绅士海盗”乞求宽恕，在绞架下手捧一束花。故事的结局早已写定 — 但你可以改写它。',
  'Ferdinánd és Izabella egyesítette a koronákat. Előbb a föld: építs hat majorságot a granadai hadjárat ellátására.':
   '费尔南多与伊莎贝拉合并了两顶王冠。先要有土地：建造六座农场，为格拉纳达之役供给。',
  'A félsziget utolsó mór erőssége. Törd meg a védőket, és zárul a nyolcszáz éves reconquista.':
   '半岛上最后一座摩尔人要塞。击溃守军，八百年的收复失地运动就此终结。',
  'A nyugati út hajót kíván. Építs kikötőt, és gyűjts hatszáz aranyat a három karavella felszereléséhez.':
   '西行之路需要船只。建造港口，并积攒六百黄金以装备三艘卡拉维尔帆船。',
  'Harminchárom nap a nyílt vízen, aztán a partjelző madarak. Sűrű erdős szigetek, alig arany. Verd fel az első tábort: tizenkét épület.':
   '在大洋上漂了三十三天，随后出现了报岸的飞鸟。林木茂密的群岛，黄金稀少。扎下第一座营地：十二座建筑。',
  'La Navidad palánkja áll, de az őslakók egyre sűrűbben törnek ránk. Tarts ki öt percen át.':
   '拉纳维达的木栅立住了，但岛民的进攻越来越密。坚守五分钟。',
  'A sziget a miénk lesz, vagy a tengerbe szorulunk. Törd meg az őslakók ellenállását.':
   '要么这座岛归我们，要么我们被逼下海。击垮岛民的抵抗。',
  'A déli végek kapuja. Építs hat majorságot: ostrom idején az élelem többet ér a kardnál.':
   '南疆的门户。建造六座农场：围城之时，粮食胜过刀剑。',
  'A török portyák nem szűnnek. Tartsd a várat négy percen át — aki kitart, az győz.':
   '土耳其人的袭扰不曾停歇。守住城堡四分钟 — 熬得住的人才是胜者。',
  'Mátyás zsoldosait nem kaszárnya adja, hanem a királyi kincstár. A főhadiszállásról toborzol.':
   '马加什的雇佣兵不出自兵营，而出自王室金库。你将从司令部征募。',
  '„Cum Deo pro Patria et Libertate." A kurucok fegyvert fognak. Verd szét a császári erőket.':
   '“与神同在，为祖国与自由。”库鲁茨人拿起了武器。击溃帝国军。',
  'A honvédsereg felszerelést kíván. Termelj ki hétszáz aranyat a hadikassza feltöltésére.':
   '国防军需要装备。开采七百黄金以充实军费。',
  'A világ átalakult: acél, olaj és repülő. Vezesd birodalmadat a huszadik századba.':
   '世界变了：钢铁、石油与飞机。带领你的帝国迈入二十世纪。',
  'Krakkó körül gazdag a föld. Építs hat majorságot, hogy legyen mit enni a hosszú télen.':
   '克拉科夫周边土地肥沃。建造六座农场，好让漫长的冬天有饭吃。',
  'Északról páncélos ék közeledik. Tartsd a vonalat négy percen át.':
   '北方有一支披甲的楔形队伍逼近。守住阵线四分钟。',
  'A világ legfélelmetesebb lovassága a tiéd. Sodord el az ellenséget egyetlen rohammal.':
   '世上最令人畏惧的骑兵归你所有。以一次冲锋荡平敌军。',
  'Sobieski a Kahlenbergről ereszkedik alá. A keresztény Európa téged néz — tarts ki öt percig.':
   '索别斯基自卡伦山而下。整个基督教欧洲都在看着你 — 坚守五分钟。',
  'Kaszás parasztok állnak a nemesek mellé. Kaszárnya nélkül, a birtokról toborzol.':
   '手持镰刀的农民与贵族并肩而立。没有兵营，你从庄园征募。',
  'A főváros romokban, de nem néma. Építsd újjá az országot a huszadik század küszöbén.':
   '首都成了废墟，却并不沉默。在二十世纪的门槛上重建国家。',
  'Amit más háborúval szerez, azt te frigyekkel. Előbb azonban élelem kell: hat majorság.':
   '他人以战争取得的，你以联姻取得。但首先需要粮食：六座农场。',
  'A falak alatt a szultán serege. Tarts ki öt percen át, míg a felmentő had megérkezik.':
   '苏丹的大军就在城墙之下。坚守五分钟，等待援军抵达。',
  'Savoyai Jenő vezeti a császári hadat. Törd meg az ellenség erejét a Duna mentén.':
   '萨伏依的欧根率领帝国军。在多瑙河沿岸击垮敌军的力量。',
  'Mária Terézia trónja inog. A hadviselés pénzbe kerül: nyolcszáz arany a hadikasszába.':
   '玛丽亚·特蕾莎的王座正在动摇。打仗要花钱：为军费筹措八百黄金。',
  'A birodalom kettős lett. Építs húsz épületet — a rend a kőben is látszik.':
   '帝国已成二元。建造二十座建筑 — 秩序也体现在石头上。',
  'A régi világ utolsó nyara. Vezesd a monarchiát a huszadik századba.':
   '旧世界的最后一个夏天。带领这个君主国迈入二十世纪。',
  'Széttagolt fejedelemségek. Kezdd az alapoknál: hat majorság a mindennapi kenyérért.':
   '分裂的诸侯国。从根基做起：六座农场，供应日用之粮。',
  'A zsoldosok drágák, de rendíthetetlenek. Verd szét a szomszéd seregét.':
   '雇佣兵昂贵，却坚不可摧。击溃邻邦的军队。',
  'Fél Európa lángol. Tarts ki öt percen át — ez a háború nem a gyorsakról szól.':
   '半个欧洲都在燃烧。坚守五分钟 — 这场战争不属于快者。',
  'A Nagy Választófejedelem állandó hadsereget épít. Húsz épület, katonás rendben.':
   '大选帝侯正在建立常备军。二十座建筑，排列如军阵。',
  'Bismarck szava: a kor nagy kérdéseit nem beszédek döntik el. Törd meg az ellenállást.':
   '俾斯麦有言：时代的大问题不是靠演说解决的。击垮抵抗。',
  'A fejedelemségekből nemzet lett. Lépj be a huszadik századba.':
   '诸侯国已凝聚成一个民族。迈入二十世纪。',
  'XI. Lajos a pókháló türelmével sző. Kezdd a földdel: hat majorság.':
   '路易十一以蛛网般的耐心编织。从土地开始：六座农场。',
  'Az angolok kiszorulnak a kontinensről. Szórd szét a maradék seregüket.':
   '英格兰人正被逐出大陆。击散他们残余的军队。',
  'A Napkirály udvara aranyat kíván. Termelj ki nyolcszáz aranyat.':
   '太阳王的宫廷需要黄金。开采八百黄金。',
  'A határt kővel védjük, nem vérrel. Építs húsz épületet a védelmi vonal mentén.':
   '我们以石头守边，而非以鲜血。沿防线建造二十座建筑。',
  'Napóleon serege menetel. A császár nem ismeri a szót: elég.':
   '拿破仑的军队正在行军。这位皇帝不认识“够了”二字。',
  'Császárok jöttek és mentek, a nemzet maradt. Lépj a huszadik századba.':
   '皇帝来了又去，民族依旧。迈入二十世纪。',
  'A polgárháború véget ért, az ország kimerült. Hat majorság, hogy legyen mit enni.':
   '内战结束了，国家精疲力竭。建六座农场，好让人有饭吃。',
  'A hosszúíj még mindig a legfélelmetesebb fegyver. Bizonyítsd be a csatatéren.':
   '长弓仍是最可怕的武器。在战场上证明这一点。',
  'A tengerről érkezik a fenyegetés. Tarts ki öt percen át, a vihar a szövetségesed.':
   '威胁来自海上。坚守五分钟 — 风暴是你的盟友。',
  'Cromwell fegyelmezett ezredei nem ismerik a menekülést. Törd meg a királypártiakat.':
   '克伦威尔纪律严明的团队不知何为逃跑。击溃保王党。',
  'Ahol a hajó jár, ott az arany is. Termelj ki nyolcszáz aranyat.':
   '船到之处，黄金亦至。开采八百黄金。',
  'A sziget kitartott. Most vezesd birodalmadat a huszadik századba.':
   '这座岛守住了。现在，带领你的帝国迈入二十世纪。',
  'A tatár iga véget ért. Építs hat majorságot a fagyos föld termésére.':
   '鞑靼的枷锁已断。为这片冻土的收成建造六座农场。',
  'Kő kövön: húsz épület álljon, mire a tél beköszönt.':
   '石上垒石：冬天来临前要立起二十座建筑。',
  'Trónkövetelők és idegen seregek. Tarts ki öt percen át, amíg a rend visszatér.':
   '僭位者与外国军队。坚守五分钟，直到秩序归来。',
  'Ablakot vágunk Európára. A flottához és a városhoz arany kell: nyolcszáz.':
   '我们要为俄国打开一扇通往欧洲的窗。舰队与城市都需要黄金：八百。',
  'Az ellenség mélyen benyomult. A tél és a távolság a mi oldalunkon áll.':
   '敌人已深入腹地。冬天与距离站在我们这边。',
  'A birodalom gyárakat épít. Lépj be a huszadik századba.':
   '帝国正在兴建工厂。迈入二十世纪。',
 }
};
function kuldNev(hu){ const t=KULD_NEV[LANG]; return (t&&t[hu])||hu; }
function kuldBrief(hu){ const t=KULD_BRIEF[LANG]; return (t&&t[hu])||hu; }
