/* =======================================================================
   22/D. AZ URALKODÓK ÉLETRAJZAINAK FORDÍTÁSA

   A `BIOS` tábla (22b-rulers.js) magyarul íródott: minden nemzethez négy
   korszak, korszakonként egy rövid felvezetés (`k`) és egy bővebb szöveg
   (`t`). Ezeket nem tettem be a nagy szótárba, mert ott elvesztek volna a
   sok apró felirat között — folyó szövegek, nem gombfeliratok.

   Itt a kulcs `nemzet-korszak` alakú, és minden nyelvhez ugyanaz a két
   mező tartozik. Amelyik nyelvhez nincs fordítás, ott a magyar marad —
   így egy hiányzó bejegyzés sosem hagy üres kártyát.

   A történelmi tartalom mindenhol ugyanaz; csak a nyelv más. A 20.
   századi alakoknál a megítélés gyakran vitatott, és ezt a fordítás is
   kimondja ahelyett, hogy elhallgatná vagy eldöntené.
   ===================================================================== */

const BIO_FORD = {

/* ---------------- KALÓZVILÁG ---------------- */

'ns-0':{
 en:{k:'For a few years a pirate republic took shape at Nassau, in the Bahamas: it obeyed no king, only a code the crews had agreed on together.',
     t:'After the War of the Spanish Succession thousands of seamen were left without work, and many gathered in the harbour of Nassau. They had no governor: aboard each ship the captain was chosen by vote, and a written code set out how plunder was to be divided. The wounded were owed compensation, and the crew made the decisions. In 1718 the British Crown offered a pardon and Governor Woodes Rogers restored order — the age of the Brethren was over.'},
 de:{k:'Auf den Bahamas, im Hafen von Nassau, entstand für wenige Jahre eine Piratenrepublik: Sie gehorchte keinem König, sondern einem gemeinsam beschlossenen Kodex.',
     t:'Nach dem Spanischen Erbfolgekrieg blieben Tausende Seeleute ohne Arbeit und sammelten sich im Hafen von Nassau. Einen Gouverneur hatten sie nicht: An Bord wurde der Kapitän gewählt, und ein schriftlicher Kodex regelte die Verteilung der Beute. Verwundeten stand eine Entschädigung zu, Entscheidungen traf die Mannschaft. 1718 verkündete die britische Krone eine Begnadigung, und Gouverneur Woodes Rogers schuf Ordnung — die Zeit der Bruderschaft war vorbei.'},
 zh:{k:'在巴哈马的拿骚港，曾有几年出现过一个海盗共和国：他们不服从国王，只遵守共同议定的法典。',
     t:'西班牙王位继承战争结束后，数千名水手失业，聚集在拿骚港。他们没有总督：船上的船长由投票选出，成文法典规定了战利品的分配方式。伤者可获赔偿，决定由全体船员做出。1718年，英国王室宣布赦免，总督伍兹·罗杰斯恢复了秩序 — 兄弟会的时代就此终结。'}},

'ns-1':{
 en:{k:'Charles Vane was the one who refused the king\u2019s pardon: he sent a fireship at the blockade and sailed out of Nassau.',
     t:'Vane was the most stubborn captain of the pirate republic. When Woodes Rogers arrived in 1718 with the letter of pardon and warships, the others laid down their arms one by one — Vane set fire to a captured French vessel, let it drift into the blockade, and slipped out of the harbour in the confusion. His cruelty divided even his own crew: after he avoided a French warship, the deck accused him of cowardice and voted him out of the captaincy — the code had turned against him. He carried on with a smaller ship until a storm drove him ashore. He was recognised in Jamaica and hanged at Port Royal in 1721; his body was displayed in an iron cage at the harbour mouth, as a warning to the next generation.'},
 de:{k:'Charles Vane war jener, der die königliche Begnadigung ausschlug: Er schickte ein Brandschiff gegen die Blockade und segelte aus Nassau hinaus.',
     t:'Vane war der störrischste Kapitän der Piratenrepublik. Als Woodes Rogers 1718 mit dem Gnadenbrief und Kriegsschiffen eintraf, streckten die anderen nach und nach die Waffen — Vane dagegen setzte ein erbeutetes französisches Schiff in Brand, ließ es in die Blockade treiben und entkam im Durcheinander aus dem Hafen. Seine Grausamkeit spaltete sogar die eigene Mannschaft: Nachdem er einem französischen Kriegsschiff ausgewichen war, warf ihm das Deck Feigheit vor und wählte ihn ab — der Kodex wandte sich gegen ihn. Mit einem kleineren Schiff machte er weiter, bis ihn ein Sturm an Land warf. Auf Jamaika erkannte man ihn, und 1721 wurde er in Port Royal gehängt; seinen Leichnam stellte man in einem Eisenkäfig an der Hafeneinfahrt aus — zur Warnung für die nächste Generation.'},
 zh:{k:'查尔斯·韦恩是那个拒绝接受国王赦免的人：他放火船冲向封锁线，驶出了拿骚。',
     t:'韦恩是海盗共和国最顽固的船长。1718年伍兹·罗杰斯带着赦免状和军舰抵达时，其他人陆续放下武器 — 韦恩却点燃了一艘缴获的法国船，任其漂向封锁线，并在混乱中溜出港口。他的残暴甚至分裂了自己的船员：在他避开一艘法国军舰后，全体船员指控他怯懦，投票罢免了他的船长之位 — 法典反过来对付了他。他换了更小的船继续劫掠，直到一场风暴将他抛上海岸。他在牙买加被认出，1721年在皇家港被绞死，尸体被装在铁笼中悬于港口入口处，以儆效尤。'}},

'ns-2':{
 en:{k:'Jack Rackham — \u201cCalico Jack\u201d — took his name from his brightly printed cotton clothes, and left behind the best known of all pirate flags.',
     t:'Rackham had been Vane\u2019s quartermaster, and it was he who put the captain to the vote. On his own ship he hunted small prizes along the coasts, but two women served in his crew: Anne Bonny and Mary Read. His flag — a skull above crossed cutlasses — became the emblem of piracy itself. In 1720 an English patrol vessel surprised them while most of the crew was drunk; by tradition only the two women put up a fight. Rackham was hanged at Port Royal.'},
 de:{k:'Jack Rackham — \u201eCalico Jack\u201c — verdankte seinen Namen der bunt bedruckten Baumwollkleidung und hinterließ die bekannteste aller Piratenflaggen.',
     t:'Rackham war Vanes Quartiermeister, und er war es, der den Kapitän abwählen ließ. Auf dem eigenen Schiff jagte er kleine Beute entlang der Küsten, doch zu seiner Mannschaft gehörten zwei Frauen: Anne Bonny und Mary Read. Seine Flagge — ein Totenkopf über gekreuzten Entermessern — wurde zum Sinnbild der Piraterie. 1720 überraschte sie ein englisches Wachschiff, als der Großteil der Mannschaft betrunken war; der Überlieferung nach wehrten sich nur die beiden Frauen. Rackham wurde in Port Royal gehängt.'},
 zh:{k:'杰克·拉克姆 — “花布杰克” — 因其色彩鲜艳的印花棉衣得名，并留下了最广为人知的海盗旗。',
     t:'拉克姆曾是韦恩的舵手，正是他提议投票罢免了船长。在自己的船上，他沿海岸捕获些小猎物，但他的船员中有两名女性：安妮·邦尼和玛丽·里德。他的旗帜 — 骷髅下交叉的弯刀 — 成为海盗的象征。1720年，一艘英国巡逻船在大部分船员酩酊大醉时突袭了他们；据传只有那两名女子奋起抵抗。拉克姆在皇家港被绞死。'}},

'ns-3':{
 en:{k:'Anne Bonny is one of the few pirates known by name to have been a woman; her sentence was stayed because she was pregnant, and afterwards she vanished from the record.',
     t:'Born to an Irish immigrant, Bonny came to the Bahamas and joined Rackham\u2019s crew — aboard ship she fought in men\u2019s clothes. She was taken with Mary Read in 1720 and both were condemned to death, but both were pregnant, so the sentences were postponed. Read died of a fever in prison; of Bonny\u2019s fate there is no reliable record. A South Carolina tradition holds that her father bought her freedom and that she died at eighty-five — but this was never proved.'},
 de:{k:'Anne Bonny ist eine der wenigen namentlich bekannten Piratinnen; ihr Urteil wurde wegen ihrer Schwangerschaft ausgesetzt, danach verliert sich ihre Spur.',
     t:'Als Tochter eines irischen Einwanderers kam Bonny auf die Bahamas und schloss sich Rackhams Mannschaft an — an Bord kämpfte sie in Männerkleidung. 1720 wurde sie zusammen mit Mary Read gefangen, beide wurden zum Tode verurteilt, doch beide waren schwanger, sodass die Vollstreckung aufgeschoben wurde. Read starb im Kerker am Fieber; über Bonnys Schicksal gibt es keine verlässliche Aufzeichnung. Einer Überlieferung aus South Carolina zufolge kaufte ihr Vater sie frei und sie starb mit fünfundachtzig Jahren — bewiesen wurde das nie.'},
 zh:{k:'安妮·邦尼是少数留下姓名的女海盗之一；她因怀孕而暂缓行刑，此后便从记载中消失。',
     t:'邦尼是爱尔兰移民的女儿，来到巴哈马后加入了拉克姆的船员 — 在船上她身着男装作战。1720年她与玛丽·里德一同被捕，两人均被判处死刑，但都身怀有孕，因而缓刑。里德在狱中因热病去世；关于邦尼的结局则没有可靠记载。南卡罗来纳的一则传说称她的父亲将她赎回，她活到八十五岁 — 但这从未得到证实。'}},

'bb-0':{
 en:{k:'The most notorious pirate of all. Before battle he wove burning slow-match into his beard, so as to appear in smoke and sparks — terror was his chief weapon.',
     t:'Edward Teach\u2019s ship, the Queen Anne\u2019s Revenge, carried forty guns. His method was not slaughter but fear: those who surrendered he usually let go. In the spring of 1718 he blockaded the harbour of Charleston and demanded, instead of ransom, a chest of medicines. In the same year a crew sent by the Governor of Virginia caught up with him off Ocracoke Island. He fell in the boarding fight, after barely two years of piracy.'},
 de:{k:'Der berüchtigtste Pirat überhaupt. Vor dem Kampf flocht er brennende Lunten in seinen Bart, um in Rauch und Funken zu erscheinen — der Schrecken war seine wichtigste Waffe.',
     t:'Edward Teachs Schiff, die Queen Anne\u2019s Revenge, führte vierzig Kanonen. Seine Methode war nicht das Gemetzel, sondern die Angst: Wer sich ergab, kam meist davon. Im Frühjahr 1718 blockierte er den Hafen von Charleston und forderte statt Lösegeld eine Kiste Arzneien. Im selben Jahr holte ihn eine vom Gouverneur von Virginia entsandte Mannschaft vor der Insel Ocracoke ein. Er fiel im Enterkampf, nach kaum zwei Jahren Piraterie.'},
 zh:{k:'最臭名昭著的海盗。战前他把点燃的火绳编入胡须，让自己在烟雾与火星中现身 — 恐惧才是他的主要武器。',
     t:'爱德华·蒂奇的船“安妮女王复仇号”装有四十门炮。他的手段不是屠杀，而是制造恐惧：投降者通常会被放走。1718年春，他封锁了查尔斯顿港，索要的不是赎金而是一箱药品。同年，弗吉尼亚总督派出的船员在奥克拉科克岛附近追上了他。他在接舷战中阵亡，海盗生涯不过两年。'}},

'bb-1':{
 en:{k:'The most notorious pirate of all.',
     t:'Edward Teach\u2019s ship, the Queen Anne\u2019s Revenge, carried forty guns. Terror was his chief weapon: those who surrendered he usually let go. He fell off Ocracoke Island in 1718.'},
 de:{k:'Der berüchtigtste Pirat überhaupt.',
     t:'Edward Teachs Schiff, die Queen Anne\u2019s Revenge, führte vierzig Kanonen. Der Schrecken war seine wichtigste Waffe: Wer sich ergab, kam meist davon. 1718 fiel er vor der Insel Ocracoke.'},
 zh:{k:'最臭名昭著的海盗。',
     t:'爱德华·蒂奇的船“安妮女王复仇号”装有四十门炮。恐惧是他的主要武器：投降者通常会被放走。1718年他在奥克拉科克岛附近阵亡。'}},

'sb-0':{
 en:{k:'The strangest figure in the history of piracy: a wealthy Barbados landowner who BOUGHT a ship and hired a paid crew — yet knew nothing of the trade.',
     t:'Stede Bonnet was a planter and a retired major when, at forty, he turned pirate. Against all custom he did not seize his ship but purchased it, and paid his crew wages — unheard of among pirates. He knew nothing of seamanship, and his men laughed at him. For a time he attached himself to Blackbeard, who effectively took the ship from him. He was captured in 1718 and hanged at Charleston. He is remembered as \u201cthe gentleman pirate\u201d.'},
 de:{k:'Die seltsamste Gestalt der Piratengeschichte: ein reicher Gutsbesitzer aus Barbados, der ein Schiff KAUFTE und eine bezahlte Mannschaft anheuerte — vom Handwerk aber nichts verstand.',
     t:'Stede Bonnet war Pflanzer und Major außer Dienst, als er mit vierzig Jahren Pirat wurde. Entgegen allem Brauch raubte er sein Schiff nicht, sondern kaufte es, und zahlte der Mannschaft Lohn — unter Piraten beispiellos. Von der Seefahrt verstand er nichts, seine Leute lachten über ihn. Eine Zeit lang schloss er sich Blackbeard an, der ihm das Schiff praktisch abnahm. 1718 wurde er gefangen und in Charleston gehängt. In Erinnerung blieb er als \u201eGentleman-Pirat\u201c.'},
 zh:{k:'海盗史上最古怪的人物：一位富有的巴巴多斯地主，他买下船只并雇佣付薪的船员 — 却对这一行一窍不通。',
     t:'斯蒂德·邦尼特原是种植园主和退役少校，四十岁时当了海盗。他一反常规，不是抢来船而是买下船，还给船员发薪 — 这在海盗中前所未闻。他不懂航海，手下都嘲笑他。有一段时间他投靠了黑胡子，后者实际上夺走了他的船。1718年他被捕，在查尔斯顿被绞死。人们记住他的称号是“绅士海盗”。'}},

'sb-1':{
 en:{k:'The gentleman pirate.',
     t:'A wealthy planter who turned pirate at forty: he bought a ship and paid his crew wages. He knew nothing of seamanship. He was hanged at Charleston in 1718.'},
 de:{k:'Der Gentleman-Pirat.',
     t:'Ein reicher Pflanzer, der mit vierzig Pirat wurde: Er kaufte ein Schiff und zahlte der Mannschaft Lohn. Von der Seefahrt verstand er nichts. 1718 wurde er in Charleston gehängt.'},
 zh:{k:'绅士海盗。',
     t:'一位富有的种植园主，四十岁时当了海盗：他买下船只，并给船员发薪。他不懂航海。1718年在查尔斯顿被绞死。'}},

'nat-0':{
 en:{k:'The people of the Caribbean islands, settled across the archipelago centuries before the Europeans came.',
     t:'The Taíno lived in villages, in huts raised from wood and palm leaf. They fished, grew cassava and sweet potato, and travelled from island to island by canoe. The cacique, head of the village, was judge, priest and war leader in one. Their weapons were the spear, the club and the bow; they used no metal. Within a few decades of the Europeans\u2019 arrival, disease and forced labour had all but destroyed them.'},
 de:{k:'Das Volk der karibischen Inseln, das sich Jahrhunderte vor den Europäern in der Inselwelt niederließ.',
     t:'Die Taíno lebten in Dörfern, in Hütten aus Holz und Palmblatt. Sie fischten, bauten Maniok und Süßkartoffeln an und fuhren mit Kanus von Insel zu Insel. Der Kazike, das Oberhaupt des Dorfes, war Richter, Priester und Heerführer zugleich. Ihre Waffen waren Speer, Keule und Bogen; Metall kannten sie nicht. Wenige Jahrzehnte nach der Ankunft der Europäer hatten Krankheiten und Zwangsarbeit sie fast völlig ausgelöscht.'},
 zh:{k:'加勒比群岛的居民，早在欧洲人到来的数百年前就已定居于这片岛屿世界。',
     t:'泰诺人住在村落里，房屋以木材和棕榈叶搭建。他们捕鱼，种植木薯和甘薯，乘独木舟往来于各岛之间。村长“卡西克”兼任法官、祭司与战争领袖。他们的武器是长矛、棍棒和弓；不使用金属。欧洲人到来后的数十年间，疾病与强制劳役几乎将他们灭绝。'}},

'nat-1':{
 en:{k:'The native people of the islands.',
     t:'The Taíno lived in villages, in huts raised from wood and palm leaf. They fished and farmed, and travelled from island to island by canoe. Their weapons were the spear and the bow.'},
 de:{k:'Die Ureinwohner der Inselwelt.',
     t:'Die Taíno lebten in Dörfern, in Hütten aus Holz und Palmblatt. Sie fischten und bebauten das Land und fuhren mit Kanus von Insel zu Insel. Ihre Waffen waren Speer und Bogen.'},
 zh:{k:'这片岛屿世界的原住民。',
     t:'泰诺人住在村落里，房屋以木材和棕榈叶搭建。他们捕鱼耕作，乘独木舟往来于各岛之间。他们的武器是长矛和弓。'}},

/* A kalózfrakciók 2. és 3. korszaka a magyar szövegben is az 1. korszak
   rövidített változatát ismétli — a fordítás ugyanígy tesz. Külön
   bejegyzés kell hozzájuk, különben ezeknél a magyar maradna. */
'bb-2':{
 en:{k:'The most notorious pirate of all.',
     t:'Edward Teach\u2019s ship, the Queen Anne\u2019s Revenge, carried forty guns. Terror was his chief weapon: those who surrendered he usually let go. He fell off Ocracoke Island in 1718.'},
 de:{k:'Der berüchtigtste Pirat überhaupt.',
     t:'Edward Teachs Schiff, die Queen Anne\u2019s Revenge, führte vierzig Kanonen. Der Schrecken war seine wichtigste Waffe: Wer sich ergab, kam meist davon. 1718 fiel er vor der Insel Ocracoke.'},
 zh:{k:'最臭名昭著的海盗。',
     t:'爱德华·蒂奇的船“安妮女王复仇号”装有四十门炮。恐惧是他的主要武器：投降者通常会被放走。1718年他在奥克拉科克岛附近阵亡。'}},
'bb-3':{
 en:{k:'The most notorious pirate of all.',
     t:'Edward Teach\u2019s ship, the Queen Anne\u2019s Revenge, carried forty guns. Terror was his chief weapon: those who surrendered he usually let go. He fell off Ocracoke Island in 1718.'},
 de:{k:'Der berüchtigtste Pirat überhaupt.',
     t:'Edward Teachs Schiff, die Queen Anne\u2019s Revenge, führte vierzig Kanonen. Der Schrecken war seine wichtigste Waffe: Wer sich ergab, kam meist davon. 1718 fiel er vor der Insel Ocracoke.'},
 zh:{k:'最臭名昭著的海盗。',
     t:'爱德华·蒂奇的船“安妮女王复仇号”装有四十门炮。恐惧是他的主要武器：投降者通常会被放走。1718年他在奥克拉科克岛附近阵亡。'}},
'sb-2':{
 en:{k:'The gentleman pirate.',
     t:'A wealthy planter who turned pirate at forty: he bought a ship and paid his crew wages. He knew nothing of seamanship. He was hanged at Charleston in 1718.'},
 de:{k:'Der Gentleman-Pirat.',
     t:'Ein reicher Pflanzer, der mit vierzig Pirat wurde: Er kaufte ein Schiff und zahlte der Mannschaft Lohn. Von der Seefahrt verstand er nichts. 1718 wurde er in Charleston gehängt.'},
 zh:{k:'绅士海盗。',
     t:'一位富有的种植园主，四十岁时当了海盗：他买下船只，并给船员发薪。他不懂航海。1718年在查尔斯顿被绞死。'}},
'sb-3':{
 en:{k:'The gentleman pirate.',
     t:'A wealthy planter who turned pirate at forty: he bought a ship and paid his crew wages. He knew nothing of seamanship. He was hanged at Charleston in 1718.'},
 de:{k:'Der Gentleman-Pirat.',
     t:'Ein reicher Pflanzer, der mit vierzig Pirat wurde: Er kaufte ein Schiff und zahlte der Mannschaft Lohn. Von der Seefahrt verstand er nichts. 1718 wurde er in Charleston gehängt.'},
 zh:{k:'绅士海盗。',
     t:'一位富有的种植园主，四十岁时当了海盗：他买下船只，并给船员发薪。他不懂航海。1718年在查尔斯顿被绞死。'}},
'nat-2':{
 en:{k:'The native people of the islands.',
     t:'The Taíno lived in villages, in huts raised from wood and palm leaf. They fished and farmed, and travelled from island to island by canoe. Their weapons were the spear and the bow.'},
 de:{k:'Die Ureinwohner der Inselwelt.',
     t:'Die Taíno lebten in Dörfern, in Hütten aus Holz und Palmblatt. Sie fischten und bebauten das Land und fuhren mit Kanus von Insel zu Insel. Ihre Waffen waren Speer und Bogen.'},
 zh:{k:'这片岛屿世界的原住民。',
     t:'泰诺人住在村落里，房屋以木材和棕榈叶搭建。他们捕鱼耕作，乘独木舟往来于各岛之间。他们的武器是长矛和弓。'}},
'nat-3':{
 en:{k:'The native people of the islands.',
     t:'The Taíno lived in villages, in huts raised from wood and palm leaf. They fished and farmed, and travelled from island to island by canoe. Their weapons were the spear and the bow.'},
 de:{k:'Die Ureinwohner der Inselwelt.',
     t:'Die Taíno lebten in Dörfern, in Hütten aus Holz und Palmblatt. Sie fischten und bebauten das Land und fuhren mit Kanus von Insel zu Insel. Ihre Waffen waren Speer und Bogen.'},
 zh:{k:'这片岛屿世界的原住民。',
     t:'泰诺人住在村落里，房屋以木材和棕榈叶搭建。他们捕鱼耕作，乘独木舟往来于各岛之间。他们的武器是长矛和弓。'}},

/* ---------------- MAGYARORSZÁG ---------------- */

'hu-0':{
 en:{k:'King of Hungary from 1458 until his death, one of the most celebrated rulers in Hungarian history. He raised the mercenary Black Army, defeated the forces of Frederick III, and under him Renaissance culture flourished at Buda — his library, the Bibliotheca Corviniana, was known across Europe.',
     t:'Son of János Hunyadi, he was elected king in 1458 by the nobility, partly under pressure from an army gathered on the ice of the Danube. He organised the Black Army on a mercenary footing, one of the most formidable forces of its age. He took Vienna in 1485 and held his court there for the rest of his life. His library at Buda, the Corvina, became one of the most famous collections in Renaissance Europe. After his death the Black Army fell apart for want of pay, and his realm broke up with it.'},
 de:{k:'König von Ungarn ab 1458 bis zu seinem Tod, einer der berühmtesten Herrscher der ungarischen Geschichte. Er schuf das Schwarze Heer aus Söldnern, besiegte die Truppen Friedrichs III., und unter ihm blühte in Buda die Renaissancekultur — seine Bibliothek, die Bibliotheca Corviniana, war in ganz Europa bekannt.',
     t:'Als Sohn von János Hunyadi wurde er 1458 vom Adel zum König gewählt, auch unter dem Druck eines auf dem Eis der Donau versammelten Heeres. Er stellte das Schwarze Heer auf Söldnerbasis auf, eine der schlagkräftigsten Streitmächte seiner Zeit. 1485 nahm er Wien ein und hielt dort bis zu seinem Lebensende Hof. Seine Bibliothek in Buda, die Corvina, wurde zu einer der berühmtesten Sammlungen des Renaissance-Europa. Nach seinem Tod zerfiel das Schwarze Heer mangels Sold, und mit ihm sein Reich.'},
 zh:{k:'1458年起在位直至去世的匈牙利国王，匈牙利历史上最著名的统治者之一。他建立了由雇佣兵组成的“黑军”，击败了腓特烈三世的军队；在他治下，布达的文艺复兴文化繁荣一时 — 他的图书馆“科尔维纳藏书”闻名全欧。',
     t:'他是匈雅提·亚诺什之子，1458年由贵族推举为王，部分原因是多瑙河冰面上聚集的军队施压。他以雇佣兵为基础组建了“黑军”，那是当时最具战斗力的军队之一。1485年他攻占维也纳，此后一直在那里设立宫廷。他在布达的图书馆“科尔维纳”成为文艺复兴时期欧洲最著名的藏书之一。他去世后，黑军因无饷可发而瓦解，他的帝国也随之分崩离析。'}},

'hu-1':{
 en:{k:'Prince of Transylvania and leading prince of the Hungarian war of independence against the Habsburgs (1703–1711). At the head of the kuruc rising he fought for the rights of the Hungarian estates and for the country\u2019s independence; he remains one of the great freedom heroes of Hungarian memory.',
     t:'Son of the wealthiest Hungarian magnate, he was raised at the court in Vienna and yet placed himself at the head of the rising against the Habsburgs. From 1703 he led the kuruc war of independence for eight years, and in time brought much of the country under his control. He was elected prince of Transylvania and of Hungary, but found no lasting foreign ally. At the Peace of Szatmár he refused to swear allegiance and went into exile. He spent his last years at Rodosto in Turkey, and never returned home.'},
 de:{k:'Fürst von Siebenbürgen und führender Fürst des ungarischen Freiheitskampfes gegen die Habsburger (1703–1711). An der Spitze des Kuruzenaufstands kämpfte er für die Rechte der ungarischen Stände und für die Eigenständigkeit des Landes; er gilt als einer der größten Freiheitshelden der ungarischen Erinnerung.',
     t:'Als Sohn des reichsten ungarischen Magnaten wuchs er am Wiener Hof auf und stellte sich dennoch an die Spitze des Aufstands gegen die Habsburger. Ab 1703 führte er acht Jahre lang den Kuruzenkrieg, der mit der Zeit weite Teile des Landes unter seine Kontrolle brachte. Man wählte ihn zum Fürsten Siebenbürgens und Ungarns, doch einen dauerhaften Verbündeten im Ausland fand er nicht. Beim Frieden von Sathmar weigerte er sich, den Treueid zu leisten, und ging ins Exil. Sein Leben endete im türkischen Rodosto; heimgekehrt ist er nie.'},
 zh:{k:'特兰西瓦尼亚亲王，反哈布斯堡的匈牙利独立战争（1703–1711）的领袖亲王。他率领库鲁茨起义，为匈牙利等级议会的权利和国家独立而战；在匈牙利的记忆中，他是最伟大的自由英雄之一。',
     t:'他是匈牙利最富有的大贵族之子，在维也纳宫廷长大，却站到了反哈布斯堡起义的最前列。自1703年起，他领导库鲁茨独立战争八年之久，一度控制了全国大部分地区。他被推举为特兰西瓦尼亚和匈牙利亲王，却始终未能找到持久的外国盟友。签订萨特马尔和约时，他拒绝宣誓效忠，选择流亡。他在土耳其的罗多斯托度过余生，再未回国。'}},

'hu-2':{
 en:{k:'Politician and journalist, foremost leader of the revolution and war of independence of 1848–49, and governor of a country striving to become a republic. His speeches moved multitudes; after the defeat he remained, in exile, the embodiment of an independent Hungary.',
     t:'A lawyer turned politician, he was imprisoned as early as the 1830s for his struggle for freedom of the press. In 1848, as minister of finance, he created the material foundation of the war of independence, and then became governor-president. The abolition of serfdom and the raising of the national army are bound to his name. After the surrender at Világos he emigrated and never returned to Hungary. He died in Turin; his funeral in Budapest drew hundreds of thousands.'},
 de:{k:'Politiker und Journalist, Hauptführer der Revolution und des Freiheitskampfes von 1848–49, Gouverneur eines nach der Republik strebenden Landes. Mit seinen Reden bewegte er Massen; nach der Niederlage blieb er auch im Exil die Verkörperung eines unabhängigen Ungarn.',
     t:'Vom Anwalt zum Politiker geworden, saß er bereits in den 1830er Jahren wegen seines Kampfes für die Pressefreiheit im Kerker. 1848 schuf er als Finanzminister die materielle Grundlage des Freiheitskampfes und wurde dann Gouverneurspräsident. Die gesetzliche Aufhebung der Leibeigenschaft und der Aufbau der Landwehr sind mit seinem Namen verbunden. Nach der Waffenstreckung bei Világos ging er ins Exil und kehrte nie nach Ungarn zurück. Er starb in Turin; zu seiner Beisetzung in Budapest kamen Hunderttausende.'},
 zh:{k:'政治家、报人，1848–49年革命与独立战争的首要领袖，一个力图成为共和国的国家的执政官。他的演说能动员群众；战败后流亡在外，他依然是独立匈牙利的化身。',
     t:'他由律师转为政治家，早在1830年代就因争取新闻自由而入狱。1848年他担任财政大臣，为独立战争奠定了物质基础，随后出任执政总统。农奴解放的立法和国防军的组建都与他的名字相连。维拉戈什投降后他流亡海外，再未回到匈牙利。他在都灵去世，布达佩斯的葬礼吸引了数十万人。'}},

'hu-3':{
 en:{k:'Vice-admiral, regent of Hungary between 1920 and 1944. He made his name with naval victories in the First World War; as head of state of interwar Hungary he shaped the country\u2019s politics for decades.',
     t:'He was the last commander-in-chief of the Austro-Hungarian fleet, and from 1920 stood at the head of the country as regent for twenty-four years. The consolidation after the Treaty of Trianon and the policy of territorial revision are bound to his name. The anti-Jewish laws were passed under his rule, and Hungary entered the Second World War on the side of the Axis. After the German occupation of the country in 1944 he did not prevent the deportation of the rural Jewish population, and his attempt to break with Germany failed. His judgement remains one of the most disputed in Hungarian history.'},
 de:{k:'Vizeadmiral, Reichsverweser Ungarns zwischen 1920 und 1944. Im Ersten Weltkrieg erwarb er sich durch Seesiege Ruhm; als Staatsoberhaupt des Ungarn der Zwischenkriegszeit prägte er die Politik des Landes über Jahrzehnte.',
     t:'Er war der letzte Oberbefehlshaber der österreichisch-ungarischen Flotte und stand ab 1920 vierundzwanzig Jahre lang als Reichsverweser an der Spitze des Landes. Mit seinem Namen verbunden sind die Konsolidierung nach dem Vertrag von Trianon und die Politik der Gebietsrevision. Unter seiner Herrschaft entstanden die Judengesetze, und Ungarn trat im Zweiten Weltkrieg an der Seite der Achsenmächte in den Krieg ein. Nach der deutschen Besetzung des Landes 1944 verhinderte er die Deportation der jüdischen Landbevölkerung nicht, und sein Versuch, aus dem Bündnis auszubrechen, scheiterte. Seine Beurteilung gehört bis heute zu den umstrittensten der ungarischen Geschichte.'},
 zh:{k:'海军中将，1920至1944年间的匈牙利摄政。他在第一次世界大战中以海战胜利成名；作为两次大战之间匈牙利的国家元首，他数十年间左右着国家政治。',
     t:'他是奥匈帝国舰队的最后一任总司令，自1920年起以摄政身份领导国家二十四年。《特里亚农条约》后的稳定局面与领土修正政策都与他的名字相连。他统治期间通过了反犹法律，匈牙利在第二次世界大战中加入轴心国一方参战。1944年德国占领该国后，他没有阻止对乡村犹太人的驱逐，其脱离轴心国的尝试也告失败。对他的评价至今仍是匈牙利历史上最具争议的问题之一。'}},

/* ---------------- AUSZTRIA ---------------- */

'at-0':{
 en:{k:'Holy Roman Emperor from 1452, the first emperor of the House of Habsburg. His long reign saw the beginning of the Habsburgs\u2019 rise to become Europe\u2019s leading dynasty; his motto, A.E.I.O.U., is to this day both riddle and emblem.',
     t:'He reigned for fifty-three years, the longest of any Holy Roman Emperor. His contemporaries thought him irresolute; he himself preferred to wait rather than to fight. Matthias took Vienna from him, and for much of his life he struggled for money. Yet the marriage of his son Maximilian brought Burgundy into the family and laid the foundation of the Habsburgs\u2019 rise in Europe. His motto, the letters A.E.I.O.U., has never been deciphered.'},
 de:{k:'Römisch-deutscher Kaiser ab 1452, der erste Kaiser aus dem Hause Habsburg. In seiner langen Regierung begann der Aufstieg der Habsburger zur führenden Dynastie Europas; sein Wahlspruch A.E.I.O.U. ist bis heute Rätsel und Sinnbild zugleich.',
     t:'Dreiundfünfzig Jahre regierte er und war damit der am längsten amtierende römisch-deutsche Kaiser. Zeitgenossen hielten ihn für unentschlossen; er selbst wartete lieber, als zu kämpfen. Matthias nahm ihm Wien ab, und einen großen Teil seines Lebens kämpfte er mit Geldnot. Die Heirat seines Sohnes Maximilian brachte jedoch Burgund ein und legte den Grund für den europäischen Aufstieg der Habsburger. Sein Wahlspruch, die Buchstabenfolge A.E.I.O.U., ist bis heute ungedeutet.'},
 zh:{k:'1452年起的神圣罗马皇帝，哈布斯堡王朝的第一位皇帝。在他漫长的统治中，哈布斯堡家族开始崛起为欧洲首屈一指的王朝；他的箴言 A.E.I.O.U. 至今既是谜题又是象征。',
     t:'他在位五十三年，是在位时间最长的神圣罗马皇帝。同时代人认为他优柔寡断，他自己也宁可等待而不愿开战。马加什从他手中夺走了维也纳，他一生大半时间为缺钱所困。然而他儿子马克西米利安的婚姻带来了勃艮第，为哈布斯堡家族在欧洲的崛起奠定了基础。他的箴言 A.E.I.O.U. 这几个字母至今无人破解。'}},

'at-1':{
 en:{k:'Holy Roman Emperor and king of Hungary, the great Habsburg ruler of the baroque age. The Turkish siege of Vienna in 1683 and the subsequent rolling back of Ottoman power fell in his reign; baroque Vienna took shape in his time.',
     t:'He was originally intended for the church, and became emperor only after his elder brother\u2019s early death. His reign was marked throughout by war on two fronts: Louis XIV in the west, the Ottoman Empire in the east. During the siege of Vienna in 1683 he left the city, which was saved by the Polish-German relief army. In the wars of liberation he recovered the Hungarian lands held by the Turks. The Rákóczi war of independence also broke out under his rule.'},
 de:{k:'Römisch-deutscher Kaiser und König von Ungarn, der große Habsburger des Barockzeitalters. In seine Regierung fielen die türkische Belagerung Wiens 1683 und die anschließende Zurückdrängung der osmanischen Macht; in seiner Zeit entstand das barocke Wien.',
     t:'Ursprünglich für die geistliche Laufbahn bestimmt, wurde er erst nach dem frühen Tod seines Bruders Kaiser. Seine Regierung war durchgehend von einem Zweifrontenkrieg geprägt: im Westen Ludwig XIV., im Osten das Osmanische Reich. Während der Belagerung Wiens 1683 verließ er die Stadt, die vom polnisch-deutschen Entsatzheer gerettet wurde. In den Befreiungskriegen eroberte er das von den Türken besetzte Ungarn zurück. Unter seiner Herrschaft brach auch der Rákóczi-Freiheitskampf aus.'},
 zh:{k:'神圣罗马皇帝兼匈牙利国王，巴洛克时代伟大的哈布斯堡统治者。1683年土耳其围攻维也纳以及随后奥斯曼势力的退却都发生在他治下；巴洛克式的维也纳也在他的时代成形。',
     t:'他原本被安排走教会道路，直到兄长早逝才成为皇帝。他的统治始终伴随着两线作战：西边是路易十四，东边是奥斯曼帝国。1683年维也纳被围时他离开了这座城市，最终由波兰—德意志援军解救。在解放战争中，他收复了被土耳其占领的匈牙利。拉科齐独立战争也在他统治期间爆发。'}},

'at-2':{
 en:{k:'Emperor of Austria and, after 1867, king of Hungary; he reigned for sixty-eight years from 1848. His name is bound to the age of the Austro-Hungarian Monarchy: both its zenith and its crises fell within his long reign.',
     t:'He came to the throne at eighteen, in the year of revolutions, and ruled for sixty-eight years. In his youth the crushing of the Hungarian war of independence and the reprisals are bound to his name; later, however, it was he who signed the Compromise of 1867. He lived out the decades of the Monarchy with extraordinary capacity for work and a soldierly daily routine. His family life was full of tragedy: his son took his own life and his wife was murdered. It was with his signature that the First World War began — an end he did not live to see.'},
 de:{k:'Kaiser von Österreich und ab 1867 König von Ungarn; von 1848 an regierte er achtundsechzig Jahre. Sein Name ist mit der Zeit der Österreichisch-Ungarischen Monarchie verbunden: Blütezeit wie Krisen fielen in seine lange Regierung.',
     t:'Mit achtzehn Jahren, im Revolutionsjahr, bestieg er den Thron und regierte achtundsechzig Jahre lang. In jungen Jahren sind die Niederschlagung des ungarischen Freiheitskampfes und die Vergeltung mit seinem Namen verbunden, später jedoch unterzeichnete er den Ausgleich von 1867. Die Jahrzehnte der Monarchie durchlebte er mit außerordentlicher Arbeitskraft und soldatischem Tagesablauf. Sein Familienleben war voller Tragödien: Sein Sohn nahm sich das Leben, seine Frau wurde ermordet. Mit seiner Unterschrift begann der Erste Weltkrieg, dessen Ende er nicht mehr erlebte.'},
 zh:{k:'奥地利皇帝，1867年后兼匈牙利国王，自1848年起在位六十八年。他的名字与奥匈帝国的时代紧密相连：帝国的鼎盛与危机都发生在他漫长的统治期内。',
     t:'他在革命之年以十八岁之龄登基，统治了六十八年。年轻时，镇压匈牙利独立战争和随后的报复与他的名字相连；但后来正是他签署了1867年的折衷方案。他以惊人的工作能力和军人般的作息度过了帝国的数十年。他的家庭生活充满悲剧：儿子自杀，妻子遇刺。第一次世界大战因他的签署而开始，而他没能活到战争结束。'}},

'at-3':{
 en:{k:'The last emperor of Austria-Hungary and king of Hungary (1916–1918). His attempts at peace in the First World War came to nothing; after the empire fell apart he was forced into exile.',
     t:'The last Austrian emperor and Hungarian king, he came to the throne in 1916, in the middle of the war. His reign lasted barely two years, and throughout it he sought to make peace. His secret negotiations became known, which cost him credit even with his allies. In 1918 he renounced participation in affairs of state, but never the throne itself. After two attempts to return he was exiled to Madeira, where he died of pneumonia at thirty-four.'},
 de:{k:'Der letzte Kaiser Österreich-Ungarns und König von Ungarn (1916–1918). Seine Friedensversuche im Ersten Weltkrieg blieben erfolglos; nach dem Zerfall des Reiches musste er ins Exil.',
     t:'Der letzte österreichische Kaiser und ungarische König kam 1916, mitten im Krieg, auf den Thron. Seine Regierung dauerte kaum zwei Jahre, und durchgehend versuchte er, Frieden zu schließen. Seine geheimen Verhandlungen wurden bekannt, was ihn auch bei den Verbündeten unglaubwürdig machte. 1918 verzichtete er auf die Teilnahme an den Staatsgeschäften, auf den Thron jedoch nie. Nach zwei Rückkehrversuchen verbannte man ihn nach Madeira, wo er mit vierunddreißig Jahren an einer Lungenentzündung starb.'},
 zh:{k:'奥匈帝国的末代皇帝、匈牙利末代国王（1916–1918）。他在第一次世界大战中的和平尝试未见成效；帝国解体后被迫流亡。',
     t:'这位最后的奥地利皇帝兼匈牙利国王于1916年、战争正酣之际登基。他在位不足两年，其间始终试图缔结和平。他的秘密谈判被泄露，使他在盟友面前也失去了信用。1918年他放弃参与国务，却从未放弃王位。两次复位尝试失败后，他被流放到马德拉岛，三十四岁时死于肺炎。'}},

/* ---------------- LENGYELORSZÁG ---------------- */

'pl-0':{
 en:{k:'Jagiellonian king of Poland and grand duke of Lithuania. Under him Poland became a European great power: in the Thirteen Years\u2019 War he defeated the Teutonic Order, and the Prussian lands came under the crown.',
     t:'A member of the Jagiellonian house, he became grand duke of Lithuania and then king of Poland. Under his rule the Polish-Lithuanian state grew into one of the largest powers in Europe. In the Thirteen Years\u2019 War he defeated the Teutonic Order and secured the road to the Baltic. His children came to several European thrones, among them the Hungarian and the Bohemian. He widened the rights of the nobility, which later became a source of the state\u2019s weakness as well.'},
 de:{k:'Jagiellonischer König von Polen und Großfürst von Litauen. Unter ihm wurde Polen zur europäischen Großmacht: Im Dreizehnjährigen Krieg besiegte er den Deutschen Orden, und die preußischen Gebiete kamen unter die Krone.',
     t:'Als Angehöriger des Hauses Jagiełło wurde er Großfürst von Litauen und dann König von Polen. Unter seiner Herrschaft wuchs der polnisch-litauische Staat zu einer der flächengrößten Mächte Europas. Im Dreizehnjährigen Krieg besiegte er den Deutschen Orden und sicherte den Weg zur Ostsee. Seine Kinder gelangten auf mehrere europäische Throne, darunter den ungarischen und den böhmischen. Er erweiterte die Rechte des Adels, was später auch zur Quelle der Schwäche des Staates wurde.'},
 zh:{k:'雅盖隆王朝的波兰国王兼立陶宛大公。在他治下，波兰成为欧洲强国：在十三年战争中他击败了条顿骑士团，普鲁士各地归入王室治下。',
     t:'作为雅盖隆家族成员，他先后成为立陶宛大公和波兰国王。在他统治下，波兰—立陶宛国家成为欧洲疆域最广的强国之一。十三年战争中他击败条顿骑士团，打通了通往波罗的海的道路。他的子女登上多个欧洲王位，其中包括匈牙利和波希米亚。他扩大了贵族的权利，而这后来也成为国家衰弱的根源。'}},

'pl-1':{
 en:{k:'King of Poland and an outstanding commander. In 1683 the charge of his winged hussars relieved Vienna from the Turkish siege — with that victory he wrote himself into the history of Europe.',
     t:'He rose as a soldier, and it was his fame as a commander that brought him the throne. In 1683 he led the Christian army that relieved Vienna, and decided the battle with the cavalry charge from the Kahlenberg. The message he sent after the victory — I came, I saw, God conquered — became part of European memory. At home, however, he could not break the resistance of the nobility or the system of free royal election. After his death the country began to decline.'},
 de:{k:'König von Polen und hervorragender Feldherr. 1683 entsetzte der Angriff seiner Flügelhusaren das von den Türken belagerte Wien — mit diesem Sieg schrieb er sich in die Geschichte Europas ein.',
     t:'Er stieg als Soldat auf, und sein Ruf als Feldherr brachte ihn auf den Thron. 1683 führte er das christliche Entsatzheer vor Wien und entschied die Schlacht mit dem Reiterangriff vom Kahlenberg. Seine Botschaft nach dem Sieg — ich kam, ich sah, Gott siegte — wurde Teil des europäischen Gedächtnisses. Daheim konnte er den Widerstand des Adels und das System der freien Königswahl jedoch nicht brechen. Nach seinem Tod begann der Niedergang des Landes.'},
 zh:{k:'波兰国王，杰出的统帅。1683年，他的翼骑兵冲锋解了土耳其人对维也纳的围困 — 凭这场胜利，他名垂欧洲史册。',
     t:'他以军人身份崛起，正是统帅的声望把他送上王位。1683年他率领基督教援军解维也纳之围，并以卡伦山的骑兵冲锋决定了战局。他战后送出的讯息 — 我来了，我看见了，上帝得胜了 — 成为欧洲记忆的一部分。然而在国内，他未能打破贵族的抵制和自由选王制度。他死后，国家开始衰落。'}},

'pl-2':{
 en:{k:'Polish general and national hero, leader of the rising of 1794 against the partition of Poland. Earlier he had fought in the American War of Independence; his figure is a symbol of liberty across several nations.',
     t:'He served as a military engineer in the American War of Independence, where his fortifications proved decisive. Returning home, he became leader of the 1794 rising against Russia and Prussia. He brought peasants armed with scythes into his army as well, unusual in his day. After the collapse of the rising he fell into Russian captivity, then lived in exile. In his will he left his American estate for the freeing of slaves.'},
 de:{k:'Polnischer General und Nationalheld, Anführer des Aufstands von 1794 gegen die Teilung Polens. Zuvor kämpfte er auch im amerikanischen Unabhängigkeitskrieg; seine Gestalt ist über mehrere Nationen hinweg ein Sinnbild der Freiheit.',
     t:'Als Militäringenieur diente er im amerikanischen Unabhängigkeitskrieg, wo sich seine Befestigungen als entscheidend erwiesen. Nach der Heimkehr wurde er Anführer des Aufstands von 1794 gegen Russland und Preußen. Er nahm auch mit Sensen bewaffnete Bauern in sein Heer auf, was zu seiner Zeit ungewöhnlich war. Nach dem Scheitern des Aufstands geriet er in russische Gefangenschaft und lebte danach im Exil. In seinem Testament vermachte er sein amerikanisches Vermögen der Befreiung von Sklaven.'},
 zh:{k:'波兰将军与民族英雄，1794年反对瓜分波兰起义的领袖。此前他曾参加美国独立战争；他的形象跨越数个民族，成为自由的象征。',
     t:'他作为军事工程师参加了美国独立战争，其修筑的防御工事被证明具有决定性作用。回国后，他成为1794年反抗俄国与普鲁士起义的领袖。他还把手持长柄镰刀的农民编入军中，这在当时颇不寻常。起义失败后他被俄国俘虏，此后流亡海外。他在遗嘱中把自己在美国的财产留作解放奴隶之用。'}},

'pl-3':{
 en:{k:'General and statesman, one of the founders and first head of state of the Poland reborn in 1918. In the battle of Warsaw of 1920, spoken of as a miracle, he halted the Soviet advance.',
     t:'In his youth he fought as a socialist revolutionary against tsarist rule and was imprisoned several times. In the First World War he organised legions, and in 1918 became head of state of the reborn Poland. In 1920 he stopped the Soviet advance at the battle of Warsaw. In 1926 he seized power in a military coup and ran an authoritarian system until his death. His judgement is twofold: he is remembered both as the saviour of the country and as the man who dismantled its democracy.'},
 de:{k:'General und Staatsmann, einer der Gründer und erstes Staatsoberhaupt des 1918 wiedergeborenen Polen. In der als Wunder bezeichneten Schlacht bei Warschau hielt er 1920 den sowjetischen Vormarsch auf.',
     t:'In jungen Jahren kämpfte er als sozialistischer Revolutionär gegen die Zarenherrschaft und saß mehrfach im Gefängnis. Im Ersten Weltkrieg stellte er Legionen auf und wurde 1918 Staatsoberhaupt des wiedergeborenen Polen. 1920 hielt er in der Schlacht bei Warschau den sowjetischen Vormarsch auf. 1926 übernahm er durch einen Militärputsch die Macht und führte bis zu seinem Tod ein autoritäres System. Seine Beurteilung ist zwiespältig: Man kennt ihn ebenso als Retter des Landes wie als denjenigen, der die Demokratie beseitigte.'},
 zh:{k:'将军与政治家，1918年重生的波兰的缔造者之一及首任国家元首。在1920年被称为奇迹的华沙战役中，他挡住了苏俄的推进。',
     t:'他年轻时以社会主义革命者的身份反抗沙皇统治，多次入狱。第一次世界大战期间他组建军团，1918年成为重生的波兰的国家元首。1920年他在华沙战役中挡住了苏俄的推进。1926年他通过军事政变夺取权力，直至去世都维持着威权体制。对他的评价是双重的：人们既视他为国家的拯救者，也视他为民主的终结者。'}},

/* ---------------- SPANYOLORSZÁG ---------------- */

'es-0':{
 en:{k:'King of Aragon, who through his marriage to Isabella of Castile united the Spanish crowns. Under his rule Columbus set out westward and the reconquest of the peninsula was completed.',
     t:'Ferdinand of Aragon married Isabella of Castile in 1469, and the union of the two crowns laid the foundation of modern Spain. With the capture of Granada in 1492 the centuries-long reconquista came to an end. In the same year he gave a Genoese sailor leave to seek the Indies by sailing west. The news brought back by the returning ships shook all Europe. By the end of his reign Spain had become the foremost power in Europe.'},
 de:{k:'König von Aragón, der durch seine Ehe mit Isabella von Kastilien die spanischen Kronen vereinte. Unter seiner Herrschaft brach Kolumbus nach Westen auf, und die Rückeroberung der Halbinsel wurde vollendet.',
     t:'Ferdinand von Aragón heiratete 1469 Isabella von Kastilien, und mit der Vereinigung der beiden Kronen entstand die Grundlage des modernen Spanien. Mit der Einnahme Granadas 1492 endete die jahrhundertelange Reconquista. Im selben Jahr gab er einem genuesischen Seefahrer die Erlaubnis, Indien nach Westen hin zu suchen. Die Nachricht der zurückkehrenden Schiffe erschütterte ganz Europa. Am Ende seiner Regierung war Spanien zur ersten Macht Europas geworden.'},
 zh:{k:'阿拉贡国王，通过与卡斯蒂利亚的伊莎贝拉联姻统一了西班牙各王冠。在他治下，哥伦布向西启航，伊比利亚半岛的收复也宣告完成。',
     t:'阿拉贡的费迪南德于1469年迎娶卡斯蒂利亚的伊莎贝拉，两顶王冠的合并奠定了现代西班牙的基础。1492年攻占格拉纳达，延续数百年的收复失地运动就此结束。同年，他准许一位热那亚航海家向西寻找印度。归航船队带回的消息震动了整个欧洲。到他统治末期，西班牙已成为欧洲的头号强国。'}},

'es-1':{
 en:{k:'Lord of the Spanish world empire, on which \u201cthe sun never set\u201d. His fleets reached from the Mediterranean to the New World, but the destruction of the Armada broke his mastery at sea.',
     t:'Philip II governed the largest empire the world had yet seen from his study in the Escorial. Under his rule the silver of America arrived, financing his wars but also debasing the currency. At Lepanto in 1571 he defeated the Ottoman fleet. In 1588, however, the Great Armada sent against England was lost to storm and battle. By the end of his life the empire was exhausted, though its extent remained without equal.'},
 de:{k:'Herr des spanischen Weltreichs, in dem \u201edie Sonne nie unterging\u201c. Seine Flotten reichten vom Mittelmeer bis in die Neue Welt, doch der Untergang der Armada brach seine Vorherrschaft zur See.',
     t:'Philipp II. regierte vom Arbeitszimmer des Escorial aus das bis dahin größte Reich der Welt. Unter seiner Herrschaft kam das Silber aus Amerika, das seine Kriege finanzierte, das Geld aber auch entwertete. 1571 besiegte er bei Lepanto die osmanische Flotte. 1588 jedoch ging die gegen England ausgesandte Große Armada in Sturm und Schlacht unter. Am Ende seines Lebens war das Reich erschöpft, seine Ausdehnung aber blieb ohnegleichen.'},
 zh:{k:'西班牙世界帝国的统治者，在他治下“日不落”。他的舰队从地中海一直延伸到新大陆，但无敌舰队的覆灭击碎了他的海上优势。',
     t:'腓力二世在埃斯科里亚尔的书房里统治着当时世界上最大的帝国。他统治期间，来自美洲的白银为战争提供了资金，却也使货币贬值。1571年他在勒班陀击败奥斯曼舰队。然而1588年派往英格兰的无敌舰队却葬身于风暴与战火。到他晚年，帝国已精疲力竭，但其疆域之广仍无与伦比。'}},

'es-2':{
 en:{k:'The Spanish ruler of enlightened absolutism, who had roads, canals and schools built and shaped Madrid into a European capital.',
     t:'Charles III had first been king of Naples, and brought his commitment to reform with him from there. In Madrid he had streets paved and street lighting and a sewer network built — his contemporaries mocked him as \u201cthe best mayor\u201d. He modernised the army and the colonial administration and curbed the power of the church. Revenue from the colonies reached its peak in his time. After his death the Napoleonic wars swept away the order he had built.'},
 de:{k:'Der spanische Herrscher des aufgeklärten Absolutismus, der Straßen, Kanäle und Schulen bauen ließ und Madrid zu einer europäischen Hauptstadt formte.',
     t:'Karl III. war zuvor König von Neapel und brachte von dort sein Bekenntnis zu Reformen mit. In Madrid ließ er Straßen pflastern, eine Straßenbeleuchtung und ein Kanalnetz errichten — Zeitgenossen spotteten über ihn als \u201eden besten Bürgermeister\u201c. Er modernisierte das Heer und die Kolonialverwaltung und beschnitt die Macht der Kirche. Die Einnahmen aus den Kolonien erreichten zu seiner Zeit ihren Höhepunkt. Nach seinem Tod fegten die Napoleonischen Kriege die von ihm errichtete Ordnung hinweg.'},
 zh:{k:'开明专制时代的西班牙君主，他修筑道路、运河与学校，把马德里塑造成一座欧洲首都。',
     t:'卡洛斯三世此前是那不勒斯国王，从那里带来了改革的决心。在马德里，他铺设街道，兴建路灯与下水道网络 — 同时代人讥讽他是“最好的市长”。他革新了军队和殖民地行政，削减了教会的权力。来自殖民地的收入在他任内达到顶峰。他去世后，拿破仑战争扫除了他所建立的秩序。'}},

'es-3':{
 en:{k:'Head of state of Spain from the end of the civil war until his death. He kept the country out of the Second World War, isolated it for decades, then permitted an economic opening in the 1960s.',
     t:'Francisco Franco rose as an army officer and, emerging victorious from the civil war, governed Spain for nearly four decades. In the Second World War he remained formally neutral, so the country was spared the devastation. Until the 1950s Spain lived in international isolation, after which agreements opened the door to the West. The economic upturn of the 1960s transformed Spanish society. After his death the country returned peacefully to monarchy and democracy.'},
 de:{k:'Staatsoberhaupt Spaniens vom Ende des Bürgerkriegs bis zu seinem Tod. Er hielt das Land aus dem Zweiten Weltkrieg heraus, isolierte es über Jahrzehnte und ließ in den sechziger Jahren eine wirtschaftliche Öffnung zu.',
     t:'Francisco Franco stieg als Offizier auf und regierte, aus dem Bürgerkrieg als Sieger hervorgegangen, fast vier Jahrzehnte lang Spanien. Im Zweiten Weltkrieg blieb er formal neutral, sodass das Land von der Verwüstung verschont blieb. Bis in die fünfziger Jahre lebte Spanien in internationaler Isolation, dann öffneten Abkommen das Tor nach Westen. Der wirtschaftliche Aufschwung der sechziger Jahre veränderte die spanische Gesellschaft. Nach seinem Tod kehrte das Land auf friedlichem Weg zur Monarchie und zur Demokratie zurück.'},
 zh:{k:'自内战结束直至去世的西班牙国家元首。他使国家置身第二次世界大战之外，让西班牙孤立了数十年，随后在六十年代允许经济开放。',
     t:'弗朗西斯科·佛朗哥以军官身份崛起，在内战中获胜后统治西班牙近四十年。第二次世界大战期间他保持形式上的中立，国家因而免于战火摧残。直到五十年代，西班牙一直处于国际孤立之中，此后一系列协定打开了通往西方的大门。六十年代的经济繁荣改变了西班牙社会。他去世后，国家以和平方式重回君主制与民主。'}},

/* ---------------- NÉMETORSZÁG ---------------- */

'de-0':{
 en:{k:'Holy Roman Emperor, the ruler called the last knight. With his marriage policy he laid the foundations of Habsburg world power and renewed the institutions of the empire.',
     t:'Through his Burgundian marriage he gained wealth and territory, and with them the foundation of Habsburg power. As emperor he worked to create an imperial administration and a standing army. The organising of the landsknecht infantry, which transformed the warfare of the age, is bound to his name. Through marriages he secured Spanish and Hungarian claims for his grandchildren. He was called the last knight, even as he was steering warfare towards firearms.'},
 de:{k:'Römisch-deutscher Kaiser, der als letzter Ritter bezeichnete Herrscher. Mit seiner Heiratspolitik legte er den Grund für die Weltmacht der Habsburger und erneuerte die Einrichtungen des Reiches.',
     t:'Durch seine burgundische Heirat gewann er Vermögen und Land und damit die Grundlage habsburgischer Macht. Als Kaiser arbeitete er am Aufbau einer Reichsverwaltung und eines stehenden Heeres. Mit seinem Namen verbunden ist die Aufstellung der Landsknechte, die die Kriegführung der Zeit veränderte. Für seine Enkel sicherte er durch Heiraten Ansprüche auf den spanischen und den ungarischen Thron. Man nannte ihn den letzten Ritter, während er die Kriegführung bereits zu den Feuerwaffen hin lenkte.'},
 zh:{k:'神圣罗马皇帝，被称为“最后的骑士”。他以联姻政策为哈布斯堡的世界霸权奠定基础，并革新了帝国的各项制度。',
     t:'他通过与勃艮第的联姻获得财富与领地，从而奠定了哈布斯堡的权力基础。身为皇帝，他致力于建立帝国行政机构与常备军。组建雇佣步兵“国土仆从”与他的名字相连，这支部队改变了当时的作战方式。他通过联姻为孙辈取得了西班牙与匈牙利的王位继承权。人们称他为最后的骑士，而他其实已把战争推向火器的时代。'}},

'de-1':{
 en:{k:'Elector of Brandenburg, the Great Elector. With the army he raised after the devastation of the Thirty Years\u2019 War, and with his economic policy, he created the foundations of the later kingdom of Prussia.',
     t:'Elector of Brandenburg, remembered as the Great Elector. He inherited a province plundered by war and broken into pieces, and built a standing army out of it. With his reforms of taxation and administration he laid the foundations of the Prussian state. He settled religious refugees, among them French Huguenots, which lifted the economy. Leaning on his army, his successors raised Prussia to a kingdom.'},
 de:{k:'Kurfürst von Brandenburg, der Große Kurfürst. Mit dem nach der Verwüstung des Dreißigjährigen Krieges aufgestellten Heer und seiner Wirtschaftspolitik schuf er die Grundlagen des späteren Königreichs Preußen.',
     t:'Kurfürst von Brandenburg, den man den Großen Kurfürsten nennt. Er erbte ein vom Krieg ausgeplündertes, zersplittertes Land und baute daraus ein stehendes Heer auf. Mit Steuer- und Verwaltungsreformen legte er die Grundlagen des preußischen Staates. Er siedelte Glaubensflüchtlinge an, darunter französische Hugenotten, was die Wirtschaft belebte. Gestützt auf sein Heer erhoben seine Nachfolger Preußen zum Königreich.'},
 zh:{k:'勃兰登堡选帝侯，人称“大选帝侯”。三十年战争的浩劫之后，他以所组建的军队和经济政策，为日后的普鲁士王国奠定了基础。',
     t:'他是勃兰登堡选帝侯，被称为大选帝侯。他继承的是一片被战争洗劫、支离破碎的领地，却从中建立起一支常备军。通过税收与行政改革，他奠定了普鲁士国家的基础。他安置宗教难民，其中包括法国胡格诺派，这促进了经济发展。他的继任者依靠这支军队，把普鲁士提升为王国。'}},

'de-2':{
 en:{k:'Prussian statesman, the Iron Chancellor. In 1871 he united the German states into a single empire, and as first chancellor of the new German Reich he shaped the balance of power in Europe for decades.',
     t:'As prime minister of Prussia he fought three wars in eleven years with his policy of blood and iron. In 1871 he proclaimed the German Empire at Versailles and became its first chancellor. With an intricate system of alliances he held Europe in balance and kept France lastingly isolated. At home he persecuted the social democrats, yet it was he who introduced the world\u2019s first state health insurance and pension system. The new emperor dismissed him in 1890, and without him his system came apart.'},
 de:{k:'Preußischer Staatsmann, der Eiserne Kanzler. 1871 vereinigte er die deutschen Staaten zu einem einzigen Kaiserreich und bestimmte als erster Kanzler des neuen Deutschen Reiches die Kräfteverhältnisse Europas über Jahrzehnte.',
     t:'Als preußischer Ministerpräsident führte er mit seiner Politik von Blut und Eisen binnen elf Jahren drei Kriege. 1871 rief er in Versailles das Deutsche Kaiserreich aus und wurde dessen erster Kanzler. Mit einem verschlungenen Bündnissystem hielt er Europa im Gleichgewicht und isolierte Frankreich dauerhaft. Im Innern verfolgte er die Sozialdemokraten, führte zugleich aber die weltweit erste staatliche Krankenversicherung und Rentenversicherung ein. Der neue Kaiser entließ ihn 1890, und ohne ihn geriet sein System aus den Fugen.'},
 zh:{k:'普鲁士政治家，“铁血宰相”。1871年他把德意志各邦统一为一个帝国，作为新德意志帝国的首任首相，数十年间左右着欧洲的力量格局。',
     t:'作为普鲁士首相，他以“铁与血”的政策在十一年间打了三场战争。1871年他在凡尔赛宣布德意志帝国成立，并出任首任首相。他以错综复杂的同盟体系维持欧洲均势，并使法国长期孤立。在国内他打压社会民主党人，同时却又推行了世界上第一套国家医疗保险与养老金制度。1890年新皇帝将他解职，失去了他，这套体系随即崩塌。'}},

'de-3':{
 en:{k:'German field marshal in the First World War, victor of the battle of Tannenberg, then president of the Weimar Republic from 1925 to 1934; one of the key figures of a turbulent age in German history.',
     t:'He was recalled from retirement as a general in 1914, and the victory at Tannenberg made him a national hero. In the second half of the war he ran what amounted to a military dictatorship together with Ludendorff. After the defeat it was he who spread the stab-in-the-back legend, which laid the blame on the civilian politicians. In 1925 he was elected president of the Weimar Republic, though he had little love for the republic himself. In January 1933 it was he who appointed Hitler chancellor — a decision that remains one of the gravest in its consequences of the twentieth century.'},
 de:{k:'Deutscher Generalfeldmarschall im Ersten Weltkrieg, Sieger der Schlacht bei Tannenberg, dann von 1925 bis 1934 Reichspräsident der Weimarer Republik; eine der Schlüsselfiguren einer stürmischen Epoche der deutschen Geschichte.',
     t:'1914 holte man ihn als pensionierten General zurück, und der Sieg bei Tannenberg machte ihn zum Nationalhelden. In der zweiten Kriegshälfte führte er gemeinsam mit Ludendorff faktisch eine Militärdiktatur. Nach der Niederlage verbreitete er die Dolchstoßlegende, die den zivilen Politikern die Verantwortung zuschob. 1925 wurde er zum Reichspräsidenten der Weimarer Republik gewählt, obwohl er die Republik selbst nicht schätzte. Im Januar 1933 ernannte er Hitler zum Reichskanzler — eine Entscheidung, die bis heute zu den folgenschwersten des zwanzigsten Jahrhunderts zählt.'},
 zh:{k:'第一次世界大战中的德国元帅，坦能堡战役的胜利者，后于1925至1934年任魏玛共和国总统；他是德国历史动荡年代的关键人物之一。',
     t:'1914年，已退役的他被重新召回，坦能堡的胜利使他成为民族英雄。战争后半期，他与鲁登道夫实际上实行军事独裁。战败后，正是他散布了“背后一刀”的传说，把责任推给文职政治家。1925年他当选魏玛共和国总统，尽管他本人并不喜欢共和制。1933年1月，是他任命希特勒为总理 — 这一决定至今仍是二十世纪后果最严重的抉择之一。'}},

/* ---------------- FRANCIAORSZÁG ---------------- */

'fr-0':{
 en:{k:'King of France, the spider king. With cunning diplomacy he broke the power of Burgundy and united most of the French lands — with him the modern French state begins to take shape.',
     t:'He was called the universal spider, because he worked by diplomacy and bribery rather than by battle. He defeated the duke of Burgundy and built a unified royal power out of scattered fiefs. He founded the first permanent French postal service. His suspicious nature led him to shut himself away from the world in his last years. Under his rule France moved from medieval feudalism towards a centralised state.'},
 de:{k:'König von Frankreich, die Spinne. Mit gerissener Diplomatie brach er die Macht Burgunds und einte den größten Teil der französischen Gebiete — mit ihm beginnt die Herausbildung des modernen französischen Staates.',
     t:'Man nannte ihn die allumfassende Spinne, denn er arbeitete mit Diplomatie und Bestechung, nicht mit Schlachten. Er besiegte den Herzog von Burgund und formte aus zersplitterten Lehen eine einheitliche königliche Macht. Er richtete den ersten ständigen französischen Postdienst ein. Wegen seines misstrauischen Wesens schottete er sich am Lebensende fast völlig von der Welt ab. Unter seiner Herrschaft schritt Frankreich vom mittelalterlichen Lehnswesen zum zentralisierten Staat.'},
 zh:{k:'法兰西国王，“蜘蛛王”。他以狡黠的外交手腕瓦解了勃艮第的势力，并统一了法国大部分领土 — 现代法兰西国家自他开始成形。',
     t:'人们称他为“无所不在的蜘蛛”，因为他靠外交与贿赂行事，而非靠战役。他击败了勃艮第公爵，把分散的封地整合为统一的王权。他建立了法国第一个常设邮政。由于生性多疑，他晚年几乎与世隔绝。在他治下，法国从中世纪的封建制迈向中央集权国家。'}},

'fr-1':{
 en:{k:'The Sun King, who reigned for seventy-two years — the longest in European history. He built Versailles and became the very embodiment of absolute monarchy.',
     t:'The Sun King reigned for seventy-two years, the longest reign in European history. He moved the court to Versailles and, by keeping the nobility there, stripped them of independent power. He waged four great wars, which extended the frontiers but exhausted the treasury. By revoking the Edict of Nantes he drove several hundred thousand Huguenots out of the country. He became the model of the absolute ruler for the whole of Europe.'},
 de:{k:'Der Sonnenkönig, der zweiundsiebzig Jahre regierte — die längste Regierung der europäischen Geschichte. Er baute Versailles und wurde zur Verkörperung der absoluten Monarchie.',
     t:'Der Sonnenkönig regierte zweiundsiebzig Jahre, die längste Regentschaft der europäischen Geschichte. Er verlegte den Hof nach Versailles und nahm dem Adel, indem er ihn dort festhielt, die eigenständige Macht. Er führte vier große Kriege, die die Grenzen erweiterten, die Staatskasse aber erschöpften. Mit dem Widerruf des Edikts von Nantes vertrieb er mehrere Hunderttausend Hugenotten aus dem Land. Für ganz Europa wurde er zum Vorbild des absoluten Herrschers.'},
 zh:{k:'太阳王，在位七十二年 — 欧洲史上最长的统治。他建造了凡尔赛宫，成为绝对君主制的化身。',
     t:'太阳王在位七十二年，这是欧洲历史上最长的统治。他把宫廷迁往凡尔赛，并把贵族留在那里，从而剥夺了他们的独立权力。他发动了四场大战，疆界得以扩张，国库却被耗尽。他废除《南特敕令》，把数十万胡格诺派逐出国门。他成为全欧洲绝对君主的典范。'}},

'fr-2':{
 en:{k:'A commander of his age, emperor of the French from 1804. His campaigns redrew the map of Europe, and his civil code remains the basis of modern legal systems.',
     t:'He began as an artillery officer from a minor Corsican noble family and rose to the summit in the turmoil of the revolution. In 1804 he crowned himself emperor and brought most of Europe under his control. His innovations as a commander — rapid marching and the massed use of artillery — transformed warfare. His civil code is to this day the foundation of the legal systems of many countries. After the Russian campaign and Waterloo he died on the island of Saint Helena.'},
 de:{k:'Epochaler Feldherr, ab 1804 Kaiser der Franzosen. Mit seinen Feldzügen zeichnete er die Landkarte Europas neu, und sein bürgerliches Gesetzbuch ist bis heute Grundlage moderner Rechtsordnungen.',
     t:'Aus einer korsischen Kleinadelsfamilie stammend begann er als Artillerieoffizier und stieg im Wirrwarr der Revolution an die Spitze. 1804 krönte er sich zum Kaiser und brachte weite Teile Europas unter seine Kontrolle. Seine Neuerungen als Feldherr — schnelles Marschieren und der massierte Einsatz der Artillerie — veränderten die Kriegführung. Sein bürgerliches Gesetzbuch ist bis heute Grundlage der Rechtsordnung zahlreicher Länder. Nach dem Russlandfeldzug und Waterloo starb er auf der Insel St. Helena.'},
 zh:{k:'划时代的统帅，自1804年起为法兰西皇帝。他的征战重绘了欧洲地图，他的民法典至今仍是现代法制的基础。',
     t:'他出身科西嘉小贵族家庭，以炮兵军官起步，在革命的动荡中登上顶峰。1804年他自行加冕为皇帝，把欧洲大部分地区置于掌控之下。他在统帅术上的革新 — 快速行军与炮兵的集中使用 — 改变了战争的面貌。他的民法典至今仍是许多国家法律体系的基础。俄国战役与滑铁卢之后，他死于圣赫勒拿岛。'}},

'fr-3':{
 en:{k:'General and statesman, leader of Free France in the Second World War, founder and president of the Fifth Republic; a symbol of French national independence.',
     t:'As an officer and expert on armour he argued for mechanised warfare as early as the 1930s. In 1940, after the French collapse, he called on his countrymen from London to resist. At the end of the war he led the provisional government of a liberated France, and then withdrew. He returned in 1958 during the Algerian crisis and founded the Fifth Republic. He built an independent French nuclear force and foreign policy, often going against the American allies.'},
 de:{k:'General und Staatsmann, im Zweiten Weltkrieg Führer des Freien Frankreich, Gründer und Präsident der Fünften Republik; Sinnbild der französischen nationalen Eigenständigkeit.',
     t:'Als Offizier und Panzerfachmann trat er schon in den dreißiger Jahren für die mechanisierte Kriegführung ein. 1940, nach dem französischen Zusammenbruch, rief er seine Landsleute von London aus zum Widerstand auf. Am Kriegsende führte er die vorläufige Regierung des befreiten Frankreich und zog sich dann zurück. 1958 kehrte er während der Algerienkrise zurück und begründete die Fünfte Republik. Er baute eine eigenständige französische Atomstreitmacht und Außenpolitik auf, oft gegen die amerikanischen Verbündeten.'},
 zh:{k:'将军与政治家，第二次世界大战中自由法国的领袖，第五共和国的创建者与总统；他是法兰西民族独立的象征。',
     t:'作为装甲专家出身的军官，他早在三十年代就主张机械化作战。1940年法国崩溃后，他从伦敦号召同胞抵抗。战争结束时，他领导了解放后法国的临时政府，随后隐退。1958年阿尔及利亚危机期间他复出，创建了第五共和国。他建立起独立的法国核力量与外交政策，常常与美国盟友背道而驰。'}},

/* ---------------- NAGY-BRITANNIA ---------------- */

'gb-0':{
 en:{k:'The first Tudor king of England. By ending the Wars of the Roses he brought peace and a strong royal power, laying the ground for England\u2019s rise in the sixteenth century.',
     t:'At the battle of Bosworth he defeated Richard III and so ended the Wars of the Roses. His marriage to Elizabeth of York united the two rival houses. Under his rule he put the treasury in order and did away with the private armies of the nobility. He strengthened the country with trade agreements and a cautious foreign policy. As founder of the Tudor house he left a stable state to his son.'},
 de:{k:'Der erste englische König aus dem Hause Tudor. Mit dem Ende der Rosenkriege schuf er Frieden und eine starke Königsmacht und legte den Grund für Englands Aufstieg im 16. Jahrhundert.',
     t:'In der Schlacht von Bosworth besiegte er Richard III. und beendete damit die Rosenkriege. Seine Ehe mit Elisabeth von York vereinte die beiden rivalisierenden Häuser. Während seiner Regierung brachte er die Staatskasse in Ordnung und schaffte die Privatheere des Adels ab. Mit Handelsverträgen und vorsichtiger Außenpolitik stärkte er das Land. Als Begründer des Hauses Tudor hinterließ er seinem Sohn einen stabilen Staat.'},
 zh:{k:'都铎王朝的第一位英格兰国王。他结束了玫瑰战争，带来和平与强大的王权，为英格兰在十六世纪的崛起奠定基础。',
     t:'他在博斯沃思战役中击败理查三世，就此结束了玫瑰战争。他与约克的伊丽莎白联姻，使两个对立家族合而为一。在位期间他整顿国库，废除了贵族的私人军队。他以贸易条约和谨慎的外交政策强化国家。作为都铎家族的开创者，他给儿子留下了一个稳定的国家。'}},

'gb-1':{
 en:{k:'The leading figure of the English Civil War and, after the execution of Charles I, head of the republic; his puritan severity and military talent make him a disputed figure in English history to this day.',
     t:'From a country landowner he became the most successful commander of the civil war. His New Model Army decided the struggle by its discipline and training. In 1649 he signed the death warrant of Charles I, and England briefly became a republic. As Lord Protector he governed in effect as sole ruler, dissolving parliament more than once. His campaign in Ireland remains a grave memory in Irish history.'},
 de:{k:'Die Hauptgestalt des englischen Bürgerkriegs und nach der Hinrichtung Karls I. Haupt der Republik; seine puritanische Strenge und sein militärisches Talent machen ihn bis heute zu einer umstrittenen Figur der englischen Geschichte.',
     t:'Vom Landbesitzer wurde er zum erfolgreichsten Befehlshaber des Bürgerkriegs. Seine Neue Musterarmee entschied den Kampf durch Disziplin und Ausbildung. 1649 unterzeichnete er das Todesurteil Karls I., und England wurde für kurze Zeit Republik. Als Lordprotektor regierte er faktisch als Alleinherrscher und löste das Parlament mehrfach auf. Sein Feldzug in Irland ist bis heute eine schwere Erinnerung der irischen Geschichte.'},
 zh:{k:'英国内战的领袖人物，处决查理一世后成为共和国的首脑；他的清教徒式严苛与军事才能，使他至今仍是英国史上颇具争议的人物。',
     t:'他由乡绅成为内战中最成功的指挥官。他的新模范军以纪律与训练决定了战局。1649年他签署了查理一世的死刑令，英格兰短暂地成为共和国。作为护国公，他实际上以独裁者的方式统治，多次解散议会。他在爱尔兰的征战至今仍是爱尔兰历史上沉重的记忆。'}},

'gb-2':{
 en:{k:'Queen of the United Kingdom for sixty-three years from 1837. Under her reign the British Empire became the greatest power in the world — the whole age bears her name.',
     t:'She came to the throne at eighteen and reigned for sixty-four years — the Victorian age is named after her. Under her rule the British Empire covered a quarter of the world\u2019s land. These were the decades of the industrial revolution, the railway and colonial expansion. After the death of her husband Albert she lived in mourning for decades and withdrew from public life. The age was marked at once by technical progress and by deep social inequality.'},
 de:{k:'Königin des Vereinigten Königreichs, ab 1837 dreiundsechzig Jahre lang. Unter ihrer Regierung wurde das Britische Empire zur größten Macht der Welt — die ganze Epoche trägt ihren Namen.',
     t:'Mit achtzehn Jahren bestieg sie den Thron und regierte vierundsechzig Jahre — das viktorianische Zeitalter ist nach ihr benannt. Unter ihrer Herrschaft erstreckte sich das Britische Empire über ein Viertel der Landfläche der Erde. Es waren die Jahrzehnte der industriellen Revolution, der Eisenbahn und der kolonialen Ausdehnung. Nach dem Tod ihres Mannes Albert lebte sie jahrzehntelang in Trauer und zog sich aus der Öffentlichkeit zurück. Die Epoche war zugleich von technischem Fortschritt und von tiefer sozialer Ungleichheit geprägt.'},
 zh:{k:'自1837年起在位六十三年的联合王国女王。在她治下，大英帝国成为世界最强大的力量 — 整个时代都以她的名字命名。',
     t:'她十八岁登基，在位六十四年 — 维多利亚时代因她而得名。在她统治下，大英帝国的疆域覆盖了世界陆地的四分之一。这是工业革命、铁路与殖民扩张的数十年。丈夫阿尔伯特去世后，她守丧数十年，淡出公众视野。这个时代既有技术进步，也有深重的社会不平等。'}},

'gb-3':{
 en:{k:'Prime minister during the Second World War; with his famous speeches and his refusal to yield he became the symbol of the struggle against Nazi Germany. He was also a Nobel laureate in literature.',
     t:'He worked as a soldier, a war correspondent and a politician, and his career was full of reverses. In 1940, at the most hopeless moment, he became prime minister and kept the country\u2019s spirit alive with his speeches. He refused a separate peace with Hitler and held to the alliance. After the war he described the division of Europe with the phrase iron curtain. He received the Nobel Prize in Literature, though many today criticise the views he held on colonial questions.'},
 de:{k:'Premierminister in den Jahren des Zweiten Weltkriegs; mit seinen berühmten Reden und seiner Unbeugsamkeit wurde er zum Sinnbild des Kampfes gegen das nationalsozialistische Deutschland. Zugleich war er Literaturnobelpreisträger.',
     t:'Er war Soldat, Kriegsberichterstatter und Politiker, und seine Laufbahn war voller Rückschläge. 1940, im aussichtslosesten Augenblick, wurde er Premierminister und hielt mit seinen Reden das Land aufrecht. Einen Sonderfrieden mit Hitler lehnte er ab und hielt am Bündnis fest. Nach dem Krieg beschrieb er die Zweiteilung Europas mit dem Ausdruck Eiserner Vorhang. Er erhielt den Nobelpreis für Literatur; seine Ansichten in Kolonialfragen werden heute jedoch von vielen kritisiert.'},
 zh:{k:'第二次世界大战期间的首相；凭借著名的演说与绝不屈服的姿态，他成为对抗纳粹德国的象征。他同时也是诺贝尔文学奖得主。',
     t:'他做过军人、战地记者与政治家，仕途几经跌宕。1940年，在最绝望的时刻他出任首相，用演说撑起了整个国家的士气。他拒绝与希特勒单独媾和，坚守同盟。战后他以“铁幕”一词形容欧洲的分裂。他获得了诺贝尔文学奖，但他在殖民问题上的观点如今受到许多人的批评。'}},

/* ---------------- OROSZORSZÁG ---------------- */

'ru-0':{
 en:{k:'Grand prince of Moscow, called the Great. He threw off Mongol-Tatar rule, tripled the territory of the Muscovite principality and created the foundations of a united Russian state.',
     t:'Grand prince of Moscow, who united the Russian principalities. In 1480 he put an end to Tatar rule without having to fight a battle. He married a Byzantine princess and took the double-headed eagle as his emblem. He had the walls of the Moscow Kremlin, which still stand, raised by Italian architects. He was the first to use the title sovereign of all the Russias.'},
 de:{k:'Großfürst von Moskau, der Große genannt. Er schüttelte die mongolisch-tatarische Herrschaft ab, verdreifachte das Gebiet des Moskauer Fürstentums und schuf die Grundlagen eines einheitlichen russischen Staates.',
     t:'Großfürst von Moskau, der die russischen Fürstentümer einte. 1480 beendete er die Tatarenherrschaft, ohne eine Schlacht schlagen zu müssen. Er heiratete eine byzantinische Prinzessin und übernahm den Doppeladler als Sinnbild. Von italienischen Baumeistern ließ er die bis heute stehenden Mauern des Moskauer Kreml errichten. Als Erster führte er den Titel Herrscher aller Reußen.'},
 zh:{k:'莫斯科大公，人称“大帝”。他摆脱了蒙古—鞑靼的统治，使莫斯科公国的疆域扩大两倍，奠定了统一俄罗斯国家的基础。',
     t:'他是统一了各罗斯公国的莫斯科大公。1480年，他不战而终结了鞑靼人的统治。他迎娶拜占庭公主，并采用双头鹰作为徽记。他请意大利建筑师修筑了至今仍矗立的莫斯科克里姆林宫城墙。他率先使用“全罗斯君主”的称号。'}},

'ru-1':{
 en:{k:'Tsar, and from 1721 emperor of Russia. He modernised the country on Western lines, founded a fleet and a new capital, Saint Petersburg, and made Russia a European great power.',
     t:'In his youth he travelled Western Europe in disguise, working among other things as a ship\u2019s carpenter. On returning home he remade the Russian state, the army and even dress with violent speed. He founded Saint Petersburg on a marshy estuary, at an enormous cost in human life. With his victory over the Swedes at Poltava, Russia became a great power. His reforms modernised the country, but they also deepened the burdens of serfdom.'},
 de:{k:'Zar, ab 1721 russischer Kaiser. Er modernisierte das Land nach westlichem Vorbild, gründete eine Flotte und eine neue Hauptstadt, Sankt Petersburg, und machte Russland zur europäischen Großmacht.',
     t:'In jungen Jahren bereiste er verkleidet Westeuropa und arbeitete dort unter anderem als Schiffszimmermann. Nach der Heimkehr baute er mit gewaltsamer Geschwindigkeit den russischen Staat, das Heer und selbst die Kleidung um. In einer sumpfigen Flussmündung gründete er Sankt Petersburg, um den Preis unzähliger Menschenleben. Mit dem Sieg über die Schweden bei Poltawa wurde Russland zur Großmacht. Seine Reformen modernisierten das Land, verschärften zugleich aber die Lasten der Leibeigenschaft.'},
 zh:{k:'沙皇，1721年起为俄罗斯皇帝。他按西方模式改革国家，建立舰队并兴建新都圣彼得堡，使俄国跻身欧洲强国之列。',
     t:'年轻时他化装游历西欧，甚至当过船匠。回国后，他以近乎粗暴的速度改造俄国的国家机器、军队乃至服饰。他在一片沼泽河口兴建圣彼得堡，代价是无数人的生命。凭借在波尔塔瓦对瑞典人的胜利，俄国成为强国。他的改革推动了现代化，同时也加重了农奴的负担。'}},

'ru-2':{
 en:{k:'Emperor of Russia, who in 1812 halted and defeated Napoleon. He was one of the chief architects of the post-Napoleonic European order, the Holy Alliance.',
     t:'He was brought up under his grandmother Catherine the Great, in the spirit of the Enlightenment. At the beginning of his reign he planned reforms, but carried out few of them. Against Napoleon\u2019s invasion in 1812 he chose the tactics of retreat and scorched earth. His troops entered Paris in 1814, and he himself became the founder of the Holy Alliance. Towards the end of his life he turned to a mystical religiosity, and legends still circulate about his death.'},
 de:{k:'Russischer Kaiser, der 1812 Napoleon aufhielt und besiegte. Er war einer der Hauptgestalter der europäischen Friedensordnung nach den Napoleonischen Kriegen, der Heiligen Allianz.',
     t:'Er wuchs unter der Erziehung seiner Großmutter Katharina der Großen im Geist der Aufklärung auf. Zu Beginn seiner Regierung plante er Reformen, führte die meisten davon aber nicht aus. Gegen Napoleons Einfall 1812 wählte er die Taktik des Rückzugs und der verbrannten Erde. 1814 zogen seine Truppen in Paris ein, und er selbst wurde zum Begründer der Heiligen Allianz. Am Lebensende wandte er sich einer mystischen Frömmigkeit zu; um seinen Tod ranken sich bis heute Legenden.'},
 zh:{k:'俄罗斯皇帝，1812年阻挡并击败了拿破仑。他是拿破仑战争后欧洲秩序“神圣同盟”的主要缔造者之一。',
     t:'他在祖母叶卡捷琳娜大帝的教养下成长，受启蒙思想熏陶。执政之初他计划推行改革，但多数未能落实。面对1812年拿破仑的入侵，他选择了撤退与焦土战术。1814年他的军队进入巴黎，他本人成为神圣同盟的创立者。晚年他转向神秘主义的虔信，关于他去世的传说至今流传。'}},

'ru-3':{
 en:{k:'The last Russian tsar (1894–1917). Swept along by the First World War and the revolutions, he abdicated; in 1918 he was executed together with his family — with him the three hundred years of Romanov rule came to an end.',
     t:'The last Russian tsar, who by his own admission had not been prepared to rule. The defeat in the Russo-Japanese war and Bloody Sunday shook the authority of the system. In the First World War he took personal command of the army, and so drew the blame for its failures onto himself. In 1917 he abdicated, and the three-hundred-year rule of the Romanov dynasty was over. He was executed with his family by the Bolsheviks at Yekaterinburg.'},
 de:{k:'Der letzte russische Zar (1894–1917). Im Sog des Ersten Weltkriegs und der Revolutionen dankte er ab; 1918 wurde er mit seiner Familie hingerichtet — mit ihm endete die dreihundertjährige Herrschaft der Romanows.',
     t:'Der letzte russische Zar, der nach eigenem Bekenntnis auf das Herrschen nicht vorbereitet war. Die Niederlage im Russisch-Japanischen Krieg und der Blutsonntag erschütterten das Ansehen des Systems. Im Ersten Weltkrieg übernahm er persönlich den Oberbefehl über das Heer und lud damit die Verantwortung für die Misserfolge auf sich. 1917 dankte er ab, und die dreihundertjährige Herrschaft der Dynastie Romanow war zu Ende. Zusammen mit seiner Familie wurde er von den Bolschewiki in Jekaterinburg hingerichtet.'},
 zh:{k:'末代俄国沙皇（1894–1917）。在第一次世界大战与革命的洪流中，他退位；1918年与家人一同被处决 — 罗曼诺夫王朝三百年的统治就此终结。',
     t:'这位末代沙皇按他自己的说法也从未为统治做过准备。日俄战争的失败与“流血星期日”动摇了这一体制的威信。第一次世界大战中他亲自接管军队指挥权，也因此把失利的责任揽到自己身上。1917年他退位，罗曼诺夫王朝三百年的统治宣告结束。他与家人一同在叶卡捷琳堡被布尔什维克处决。'}},

};

/* A rövid felvezetés és a bővebb szöveg lekérdezése. Ha az adott nyelvhez
   nincs fordítás, a magyar marad — üres kártya sosem keletkezik. */
function bioSzoveg(nemzet, kor){
  const alap = (typeof BIOS === 'object' && BIOS[nemzet] && BIOS[nemzet][kor]) || {};
  const nyelv = (typeof LANG === 'string') ? LANG : 'hu';
  if(nyelv === 'hu') return alap;
  const f = BIO_FORD[nemzet + '-' + kor];
  const ford = f && f[nyelv];
  if(!ford) return alap;
  return { y: alap.y, k: ford.k || alap.k, t: ford.t || alap.t };
}
