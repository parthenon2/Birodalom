/* =======================================================================
   15/D. NEMZETI JELLEG

   Eddig a nemzetek csak SZÍNBEN különböztek: az egyenruha palettája
   (NATIONS[..].uni) keveredett a csapatszínnel. Ránézésre viszont minden
   sereg ugyanúgy nézett ki — ugyanaz a sisak, ugyanaz a sziluett.

   Ez a réteg a KÖRVONALAT bontja meg. Nem új egységfajtákat vezet be
   (azzal a játékmenet is változna), hanem ráfest egy nemzeti jegyet a
   meglévő katonára: sisakforma, tollforgó, köpeny, a lengyel huszár
   szárnya.

   Miért így? Mert a sziluett az, amit a játékos a csata zűrzavarában
   valóban lát. A színt elnyeli az éjszaka, a por és a köd; egy kalpag
   vagy egy szárnypár viszont messziről is felismerhető.

   A rajzolás a fej UTÁN fut, tehát mindenre ráfest, ami alatta van. A
   szimulációt nem érinti: kizárólag látvány.
   ===================================================================== */

/* Nemzetenként és korszakonként egy jegy. A korszakok:
     0 — 15. század     1 — 17. század
     2 — 19. század     3 — 20. század                                   */
const NEMZETI_JELLEG = {
  hu: ['kalpag',   'kalpag',   'huszarcsako','sisakM'],  // huszárhagyomány
  pl: ['szarny',   'szarny',   'rogatywka', 'sisakM'],   // szárnyas huszár, majd négyszögletes czapka
  gb: ['csobor',   'tricorn',  'medvebor',  'brodie'],   // vöröskabátos
  es: ['morion',   'morion',   'csako',     'oldalsapka'],// konkvisztádor, majd oldalsapka
  fr: ['csobor',   'tricorn',  'csako',     'adrian'],   // muskétás, majd Adrian-sisak
  de: ['csobor',   'szeleskarima','tuskes',  'stahl'],   // porosz tüskés sisak
  at: ['csobor',   'szeleskarima','csako',   'sisakM'],
  ru: ['prilbica', 'szeleskarima','csako',   'budjonnij'],
  ns: ['kendo',    'kendo',    'kendo',     'kendo'],    // kalózok
  bb: ['kendo',    'kendo',    'kendo',     'kendo'],
  sb: ['tricorn',  'tricorn',  'tricorn',   'tricorn'],
  nat:['toll',     'toll',     'toll',      'toll'],     // szigetlakók
  /* --- KÉSZÜLŐ NEMZETEK --- */
  se:['csobor',    'szeleskarima','csako',    'sisakM'],   // karolinus hadsereg
  ot:['turban',    'turban',    'fez',       'sisakM'],    // janicsár, majd fez
  jp:['kabuto',    'kabuto',    'csako',     'sisakM'],    // szamurájsisak
  cn:['kupak',     'kupak',     'kupak',     'sisakM'],    // kúpos katonasapka
  in:['turban',    'turban',    'turban',    'sisakM'],
  ml:['kendo',     'kendo',     'kendo',     'sisakM']
};

/* Melyik szerepnél van értelme? A munkás és a hajók kimaradnak: ott a
   fejfedő vagy nem látszik, vagy zavarna. */
const JELLEG_SZEREP = { melee:1, ranged:1, spear:1, cav:1, hero:1 };

function nemzetiJelleg(owner, age){
  const nk = (typeof nationOf === 'function') ? nationOf(owner) : 'hu';
  const t = NEMZETI_JELLEG[nk];
  return t ? t[Math.max(0, Math.min(3, age | 0))] : null;
}

/* A jegy kirajzolása. A `col` a csapatszín, az `acc` a kiemelés — ezekkel
   marad felismerhető, ki kicsoda, miközben a FORMA a nemzeté. */
function rajzNemzetiJelleg(pose, owner, age, role, col, acc){
  if(!JELLEG_SZEREP[role]) return;
  const jegy = nemzetiJelleg(owner, age);
  if(!jegy) return;
  const acel = '#8b93a0', acelS = '#5a6270';
  const fej = -15.4;                       // a fej középpontja a testhez képest

  switch(jegy){

    case 'kalpag':                          // magyar prémes kalpag, tollforgóval
      UX.fillStyle = '#3a2a20';
      UX.beginPath(); UX.ellipse(0, fej - 3.2, 4.4, 3.4, 0, 0, TAU); UX.fill();
      UX.fillStyle = shade(col, -0.15);     // csapatszínű posztó a tetején
      UX.beginPath(); UX.ellipse(0, fej - 5.2, 3.2, 2.2, 0, 0, TAU); UX.fill();
      UX.strokeStyle = acc; UX.lineWidth = 1.1;   // forgó
      UX.beginPath(); UX.moveTo(1.4, fej - 5.6); UX.lineTo(3.6, fej - 10.4); UX.stroke();
      break;

    case 'szarny': {                        // lengyel szárnyas huszár
      /* A szárny a hátra van szíjazva, ezért oldalról és hátulról a
         legfeltűnőbb — szemből keskenyebb, hogy ne takarja az arcot. */
      const sz = (pose === 'front') ? 0.55 : 1;
      UX.save();
      UX.globalAlpha = 0.92;
      for(const oldal of [-1, 1]){
        if(pose === 'side' && oldal < 0) continue;    // oldalról csak a közelebbi
        UX.fillStyle = '#efe9dc';
        UX.beginPath();
        UX.moveTo(oldal * 2.6 * sz, -11);
        UX.quadraticCurveTo(oldal * 9 * sz, -19, oldal * 5.4 * sz, -26.5);
        UX.quadraticCurveTo(oldal * 4.2 * sz, -19.5, oldal * 1.8 * sz, -11.5);
        UX.closePath(); UX.fill();
        UX.strokeStyle = 'rgba(90,80,70,.45)'; UX.lineWidth = 0.7;
        for(let i = 1; i <= 3; i++){
          const t = i / 4;
          UX.beginPath();
          UX.moveTo(oldal * (2.4 + t * 1.2) * sz, -12 - t * 5);
          UX.lineTo(oldal * (5.6 + t * 1.4) * sz, -15 - t * 6.5);
          UX.stroke();
        }
      }
      UX.restore();
      UX.fillStyle = acelS;                 // alatta egyszerű sisak
      UX.beginPath(); UX.arc(0, fej - 1.2, 4.2, Math.PI, TAU); UX.fill();
      break;
    }

    case 'morion':                          // spanyol konkvisztádor: taréjos sisak
      UX.fillStyle = acel;
      UX.beginPath();
      UX.moveTo(-5.2, fej - 1.6);
      UX.quadraticCurveTo(0, fej - 9.6, 5.2, fej - 1.6);
      UX.quadraticCurveTo(0, fej - 3.4, -5.2, fej - 1.6);
      UX.closePath(); UX.fill();
      UX.fillStyle = acelS;                 // középtaréj
      UX.fillRect(-0.6, fej - 9.2, 1.2, 6.2);
      UX.fillStyle = acc;                   // toll a taréjon
      UX.beginPath(); UX.ellipse(-3.4, fej - 7.4, 1.1, 2.6, -0.5, 0, TAU); UX.fill();
      break;

    case 'csobor':                          // középkori csöbörsisak
      UX.fillStyle = acel;
      UX.fillRect(-4.2, fej - 5.4, 8.4, 6.6);
      UX.fillStyle = '#2b2b2b';             // szemrés
      if(pose !== 'back') UX.fillRect(-3.2, fej - 2.6, 6.4, 1.1);
      UX.fillStyle = acc; UX.fillRect(-0.7, fej - 8.4, 1.4, 3.2);
      break;

    case 'tricorn':                         // háromszögletű kalap
      UX.fillStyle = '#2c2620';
      UX.beginPath(); UX.moveTo(-6.4, fej - 3.2); UX.lineTo(0, fej - 8.4);
      UX.lineTo(6.4, fej - 3.2); UX.quadraticCurveTo(0, fej - 1.2, -6.4, fej - 3.2);
      UX.closePath(); UX.fill();
      UX.fillStyle = acc;
      UX.beginPath(); UX.arc(3.6, fej - 4.4, 1.2, 0, TAU); UX.fill();   // kokárda
      break;

    case 'csako':                           // 19. századi csákó
      UX.fillStyle = shade(col, -0.35);
      UX.fillRect(-3.6, fej - 10.2, 7.2, 8);
      UX.fillStyle = '#1e1a16'; UX.fillRect(-4.4, fej - 3.2, 8.8, 1.5);  // ellenző
      UX.fillStyle = acc;                                                // rózsa
      UX.beginPath(); UX.arc(0, fej - 8.6, 1.3, 0, TAU); UX.fill();
      break;

    case 'huszarcsako': {                   // magyar huszárcsákó: zsinór és forgó
      UX.fillStyle = shade(col, -0.35);
      UX.fillRect(-3.6, fej - 10.4, 7.2, 8.2);
      UX.fillStyle = '#1e1a16'; UX.fillRect(-4.4, fej - 3.2, 8.8, 1.5);
      UX.strokeStyle = acc; UX.lineWidth = 0.8;   // keresztbe futó zsinór
      UX.beginPath();
      UX.moveTo(-3.4, fej - 9); UX.lineTo(3.4, fej - 5.4);
      UX.moveTo(3.4, fej - 9);  UX.lineTo(-3.4, fej - 5.4);
      UX.stroke();
      UX.fillStyle = acc;                          // forgó a tetején
      UX.beginPath(); UX.ellipse(0, fej - 13.4, 1.3, 3.4, 0, 0, TAU); UX.fill();
      break;
    }

    case 'rogatywka':                       // lengyel négyszögletes czapka
      UX.fillStyle = shade(col, -0.3);
      UX.beginPath();
      UX.moveTo(-5.4, fej - 8.4); UX.lineTo(5.4, fej - 8.4);
      UX.lineTo(3.8, fej - 2.2);  UX.lineTo(-3.8, fej - 2.2);
      UX.closePath(); UX.fill();
      UX.fillStyle = shade(col, -0.12);      // a négyszögletes tető
      UX.beginPath();
      UX.moveTo(-5.4, fej - 8.4); UX.lineTo(0, fej - 10.2);
      UX.lineTo(5.4, fej - 8.4);  UX.lineTo(0, fej - 7);
      UX.closePath(); UX.fill();
      UX.fillStyle = '#1e1a16'; UX.fillRect(-4.4, fej - 2.4, 8.8, 1.4);
      break;

    case 'oldalsapka':                      // lapos oldalsapka
      UX.fillStyle = shade(col, -0.3);
      UX.beginPath();
      UX.moveTo(-4.6, fej - 2.2);
      UX.quadraticCurveTo(0, fej - 8.2, 4.6, fej - 2.2);
      UX.quadraticCurveTo(0, fej - 4, -4.6, fej - 2.2);
      UX.closePath(); UX.fill();
      UX.fillStyle = acc; UX.fillRect(-3.4, fej - 4.6, 1.6, 1.2);
      break;

    case 'medvebor':                        // brit gárda medvebőr kucsma
      UX.fillStyle = '#25211d';
      UX.beginPath(); UX.ellipse(0, fej - 8.4, 4.2, 7.4, 0, 0, TAU); UX.fill();
      UX.fillStyle = 'rgba(255,255,255,.07)';
      UX.beginPath(); UX.ellipse(-1.4, fej - 9.6, 1.8, 4.4, 0.2, 0, TAU); UX.fill();
      break;

    case 'szeleskarima':                    // széles karimájú, tollas kalap
      UX.fillStyle = '#3a3028';
      UX.beginPath(); UX.ellipse(0, fej - 3.4, 7, 2.1, 0, 0, TAU); UX.fill();
      UX.beginPath(); UX.ellipse(0, fej - 6, 3.4, 3, 0, 0, TAU); UX.fill();
      UX.strokeStyle = acc; UX.lineWidth = 1.2;
      UX.beginPath(); UX.moveTo(-2, fej - 6.4);
      UX.quadraticCurveTo(-7, fej - 10, -9.5, fej - 7.5); UX.stroke();
      break;

    case 'tuskes':                          // porosz tüskés sisak
      UX.fillStyle = '#3b322a';
      UX.beginPath(); UX.arc(0, fej - 2.4, 4.4, Math.PI, TAU); UX.fill();
      UX.fillRect(-4.6, fej - 2.6, 9.2, 1.3);
      UX.fillStyle = acel;                  // tüske
      UX.beginPath(); UX.moveTo(-0.9, fej - 6.4); UX.lineTo(0, fej - 11.4);
      UX.lineTo(0.9, fej - 6.4); UX.closePath(); UX.fill();
      break;

    case 'prilbica':                        // orosz csúcsos sisak
      UX.fillStyle = acel;
      UX.beginPath(); UX.moveTo(-4.2, fej - 1.4); UX.lineTo(0, fej - 10.6);
      UX.lineTo(4.2, fej - 1.4); UX.closePath(); UX.fill();
      UX.fillStyle = acelS; UX.fillRect(-4.4, fej - 2, 8.8, 1.2);
      break;

    case 'budjonnij':                       // orosz posztósapka csillaggal
      UX.fillStyle = shade(col, -0.28);
      UX.beginPath(); UX.moveTo(-4, fej - 1.6); UX.lineTo(0, fej - 9.8);
      UX.lineTo(4, fej - 1.6); UX.closePath(); UX.fill();
      UX.fillStyle = acc;
      UX.beginPath(); UX.arc(0, fej - 4.6, 1.5, 0, TAU); UX.fill();
      break;

    case 'brodie':                          // brit lapos rohamsisak
      UX.fillStyle = '#5d6350';
      UX.beginPath(); UX.ellipse(0, fej - 4.4, 6.2, 2.4, 0, 0, TAU); UX.fill();
      UX.beginPath(); UX.arc(0, fej - 4.4, 3.8, Math.PI, TAU); UX.fill();
      break;

    case 'adrian':                          // francia Adrian-sisak, tarajjal
      UX.fillStyle = '#6b7358';
      UX.beginPath(); UX.arc(0, fej - 3.4, 4.4, Math.PI, TAU); UX.fill();
      UX.fillRect(-5, fej - 3.6, 10, 1.2);
      UX.fillStyle = shade('#6b7358', -0.25);
      UX.fillRect(-0.7, fej - 8, 1.4, 4.6);
      break;

    case 'stahl':                           // német acélsisak, széles tarkóval
      UX.fillStyle = '#4f5648';
      UX.beginPath(); UX.arc(0, fej - 3, 4.6, Math.PI, TAU); UX.fill();
      UX.beginPath(); UX.ellipse(0, fej - 2.4, 5.6, 2.2, 0, 0, Math.PI); UX.fill();
      break;

    case 'sisakM':                          // egyszerű modern sisak
      UX.fillStyle = '#585f4e';
      UX.beginPath(); UX.arc(0, fej - 2.8, 4.4, Math.PI, TAU); UX.fill();
      UX.fillRect(-4.6, fej - 3, 9.2, 1.4);
      break;

    case 'turban':                          // turbán, elöl tűzött dísszel
      UX.fillStyle = '#e8e0cf';
      UX.beginPath(); UX.ellipse(0, fej - 4.6, 5.2, 4.2, 0, 0, TAU); UX.fill();
      UX.strokeStyle = 'rgba(120,105,80,.45)'; UX.lineWidth = 0.8;
      for(let i = -1; i <= 1; i++){
        UX.beginPath();
        UX.ellipse(0, fej - 4.6 + i * 1.6, 5.2 - Math.abs(i) * 0.7, 1.4, 0, 0, Math.PI);
        UX.stroke();
      }
      UX.fillStyle = acc;
      UX.beginPath(); UX.arc(0, fej - 7.4, 1.2, 0, TAU); UX.fill();
      break;

    case 'fez':                             // fez, bojttal
      UX.fillStyle = '#b0342c';
      UX.beginPath();
      UX.moveTo(-3.4, fej - 2.4); UX.lineTo(-2.8, fej - 9.2);
      UX.lineTo(2.8, fej - 9.2);  UX.lineTo(3.4, fej - 2.4);
      UX.closePath(); UX.fill();
      UX.strokeStyle = '#2b2620'; UX.lineWidth = 0.9;
      UX.beginPath(); UX.moveTo(1.4, fej - 9.2); UX.lineTo(4.4, fej - 5.4); UX.stroke();
      break;

    case 'kabuto':                          // szamurájsisak, félhold alakú taréjjal
      UX.fillStyle = '#3f4650';
      UX.beginPath(); UX.arc(0, fej - 2.6, 4.6, Math.PI, TAU); UX.fill();
      UX.fillStyle = shade('#3f4650', -0.25);           // nyakvédő lemezek
      UX.beginPath();
      UX.moveTo(-5.6, fej - 2.4); UX.lineTo(-6.8, fej + 2.6);
      UX.lineTo(6.8, fej + 2.6);  UX.lineTo(5.6, fej - 2.4);
      UX.closePath(); UX.fill();
      UX.fillStyle = acc;                                // maedate: félhold
      UX.beginPath();
      UX.arc(0, fej - 9.4, 4.2, Math.PI * 1.08, TAU * 0.96);
      UX.arc(0, fej - 8.2, 3.2, TAU * 0.96, Math.PI * 1.08, true);
      UX.closePath(); UX.fill();
      break;

    case 'kupak':                           // kúpos katonasapka, hátrahajló karimával
      UX.fillStyle = shade(col, -0.25);
      UX.beginPath();
      UX.moveTo(-4.4, fej - 2.2); UX.lineTo(0, fej - 10.4);
      UX.lineTo(4.4, fej - 2.2); UX.closePath(); UX.fill();
      UX.fillStyle = '#2b2620';
      UX.beginPath(); UX.ellipse(0, fej - 2.2, 5.4, 1.5, 0, 0, TAU); UX.fill();
      UX.fillStyle = acc;
      UX.beginPath(); UX.arc(0, fej - 10.8, 1.1, 0, TAU); UX.fill();
      break;

    case 'kendo':                           // kalóz fejkendő
      UX.fillStyle = shade(col, -0.1);
      UX.beginPath(); UX.arc(0, fej - 1.6, 4.3, Math.PI, TAU); UX.fill();
      UX.fillRect(-4.3, fej - 1.8, 8.6, 1.6);
      UX.fillStyle = shade(col, -0.3);      // hátracsapott csücsök
      UX.beginPath(); UX.moveTo(-3.8, fej - 1.4); UX.lineTo(-8.2, fej + 2.6);
      UX.lineTo(-3.8, fej + 1.2); UX.closePath(); UX.fill();
      break;

    case 'toll':                            // szigetlakó tollpánt
      UX.strokeStyle = '#7a4a2a'; UX.lineWidth = 1.4;
      UX.beginPath(); UX.arc(0, fej - 1, 4.1, Math.PI * 1.15, TAU * 0.98); UX.stroke();
      for(let i = -1; i <= 1; i++){
        UX.fillStyle = i === 0 ? acc : '#e8e0cf';
        UX.beginPath();
        UX.ellipse(i * 2.2, fej - 6.4 - Math.abs(i) * -0.8, 0.9, 3.2, i * 0.35, 0, TAU);
        UX.fill();
      }
      break;
  }
}


/* =======================================================================
   NEMZETI FEGYVERJEGY

   A fejfedő közelről mond sokat, a FEGYVER viszont messziről: a kopja
   hossza, a zászlócska a hegyén, az alabárd bárdja — ezek a sziluettet
   bontják meg ott, ahol a katona amúgy csak egy folt.

   A meglévő fegyvert nem cseréljük le, csak KIEGÉSZÍTJÜK. Így a
   fegyverek harci értéke és a rajzolás többi része érintetlen marad.
   ===================================================================== */
const NEMZETI_FEGYVER = {
  pl: 'kopja',       // szárnyas huszár: hosszabb kopja, zászlócskával
  es: 'alabard',     // konkvisztádor: bárd a szálfegyveren
  hu: 'szablya',     // huszárszablya az oldalán
  gb: 'szurony',     // vöröskabátos: szurony a csövön
  ru: 'berdis',      // orosz bárd
  fr: 'zaszlocska',
  de: null, at: null, ns: null, bb: null, sb: null, nat: 'kotoszigony',
  /* --- KÉSZÜLŐ NEMZETEK ---
     A svéd karolinus gyalogság szuronyos puskával harcolt, ami a
     korszakában általános volt — ott nincs mit külön kiemelni. */
  se: null,
  ot: 'jatagan',     // befelé hajló oszmán penge
  jp: 'katana',      // szamurájkard az oldalon
  cn: 'dao',         // széles végű kínai szablya
  in: 'talwar',      // erősen ívelt indiai szablya
  ml: 'kopja'        // a szaheli lovasság hosszú kopjája
};

function rajzNemzetiFegyver(pose, owner, age, role, col, acc){
  const nk = (typeof nationOf === 'function') ? nationOf(owner) : 'hu';
  const jegy = NEMZETI_FEGYVER[nk];
  if(!jegy) return;
  /* Csak a korai korszakokban: a 19. századtól a szálfegyver eltűnik, és
     a puskák amúgy is egyformák. A szurony a kivétel. */
  if(age >= 2 && jegy !== 'szurony') return;

  switch(jegy){

    case 'kopja':                          // lengyel kopja: hosszabb, zászlós
      if(role !== 'spear') return;
      UX.save(); UX.translate(1.2, -10.6);
      UX.strokeStyle = '#7a5230'; UX.lineWidth = 1.6;
      UX.beginPath(); UX.moveTo(20, -1.6); UX.lineTo(31, -3.2); UX.stroke();
      UX.fillStyle = col;                  // csapatszínű zászlócska a hegy alatt
      UX.beginPath();
      UX.moveTo(26, -2.8); UX.lineTo(26, -7.4);
      UX.lineTo(20.5, -5.4); UX.closePath(); UX.fill();
      UX.fillStyle = '#d5d9de';            // hegy a meghosszabbított végen
      UX.beginPath(); UX.moveTo(31, -3.2); UX.lineTo(36, -4);
      UX.lineTo(31.4, -1.8); UX.closePath(); UX.fill();
      UX.restore();
      break;

    case 'alabard':                        // spanyol alabárd: bárd és horog
      if(role !== 'spear') return;
      UX.save(); UX.translate(1.2, -10.6);
      UX.fillStyle = '#c9ced6';
      UX.beginPath();                      // bárdlap
      UX.moveTo(19, -1.4); UX.lineTo(19, -7.6);
      UX.quadraticCurveTo(25, -6.4, 24.5, -1.6);
      UX.closePath(); UX.fill();
      UX.beginPath();                      // ellenoldali horog
      UX.moveTo(19, -0.8); UX.lineTo(15.2, 2.6); UX.lineTo(19, 1.2);
      UX.closePath(); UX.fill();
      UX.restore();
      break;

    case 'berdis':                         // orosz berdis: széles, öblös bárd
      if(role !== 'spear') return;
      UX.save(); UX.translate(1.2, -10.6);
      UX.fillStyle = '#b9c0c9';
      UX.beginPath();
      UX.moveTo(18.5, -1); UX.quadraticCurveTo(27, -8.4, 22.5, 2.4);
      UX.closePath(); UX.fill();
      UX.restore();
      break;

    case 'szablya':                        // magyar szablya az oldalon
      if(role === 'ranged') return;
      UX.save(); UX.translate(-2.6, -5.4); UX.rotate(0.42);
      UX.strokeStyle = '#cdd3da'; UX.lineWidth = 1.3;
      UX.beginPath(); UX.moveTo(0, 0); UX.quadraticCurveTo(5.4, 3.4, 9.6, 8.6); UX.stroke();
      UX.fillStyle = acc;                  // markolat
      UX.beginPath(); UX.arc(-0.6, -0.8, 1.3, 0, TAU); UX.fill();
      UX.restore();
      break;

    case 'szurony':                        // brit szurony a csövön
      if(role !== 'ranged') return;
      UX.save(); UX.translate(1.2, -10.6);
      UX.fillStyle = '#dfe4ea';
      UX.beginPath(); UX.moveTo(15.4, -1.6); UX.lineTo(22.4, -2.4);
      UX.lineTo(15.6, -0.6); UX.closePath(); UX.fill();
      UX.restore();
      break;

    case 'zaszlocska':                     // francia zászlócska a szálfegyveren
      if(role !== 'spear') return;
      UX.save(); UX.translate(1.2, -10.6);
      UX.fillStyle = col;
      UX.beginPath(); UX.moveTo(16.5, -1.2); UX.lineTo(16.5, -6);
      UX.lineTo(11.5, -4.2); UX.closePath(); UX.fill();
      UX.restore();
      break;

    case 'katana':                          // szamurájkard az oldalon, enyhe ívvel
      if(role === 'ranged') return;
      UX.save(); UX.translate(-2.4, -6.2); UX.rotate(0.3);
      UX.strokeStyle = '#dfe4ea'; UX.lineWidth = 1.4;
      UX.beginPath(); UX.moveTo(0, 0); UX.quadraticCurveTo(6.4, 2.2, 11.4, 6.4); UX.stroke();
      UX.fillStyle = '#2b2620';                          // tsuba és markolat
      UX.beginPath(); UX.arc(-0.4, -0.6, 1.4, 0, TAU); UX.fill();
      UX.restore();
      break;

    case 'jatagan':                         // jatagán: befelé hajló penge
      if(role === 'ranged') return;
      UX.save(); UX.translate(-2.6, -5.6); UX.rotate(0.36);
      UX.strokeStyle = '#d5dae1'; UX.lineWidth = 1.5;
      UX.beginPath(); UX.moveTo(0, 0); UX.quadraticCurveTo(6.8, 1.4, 10.6, 7.8); UX.stroke();
      UX.fillStyle = acc;
      UX.beginPath(); UX.arc(-0.6, -0.8, 1.3, 0, TAU); UX.fill();
      UX.restore();
      break;

    case 'dao':                             // kínai szablya, széles véggel
      if(role === 'ranged') return;
      UX.save(); UX.translate(-2.4, -5.8); UX.rotate(0.38);
      UX.fillStyle = '#d5dae1';
      UX.beginPath();
      UX.moveTo(0, -0.7); UX.quadraticCurveTo(6.4, 1.2, 10.4, 7.2);
      UX.lineTo(8.6, 8.2); UX.quadraticCurveTo(5.4, 2.4, 0, 0.7);
      UX.closePath(); UX.fill();
      UX.restore();
      break;

    case 'talwar':                          // erősen ívelt indiai szablya
      if(role === 'ranged') return;
      UX.save(); UX.translate(-2.6, -5.4); UX.rotate(0.44);
      UX.strokeStyle = '#dfe4ea'; UX.lineWidth = 1.5;
      UX.beginPath(); UX.moveTo(0, 0); UX.quadraticCurveTo(8.4, 2.8, 9.8, 9.6); UX.stroke();
      UX.fillStyle = acc;
      UX.beginPath(); UX.arc(-0.6, -0.8, 1.4, 0, TAU); UX.fill();
      UX.restore();
      break;

    case 'kotoszigony':                    // szigetlakó kötözött szigony
      if(role !== 'spear') return;
      UX.save(); UX.translate(1.2, -10.6);
      UX.strokeStyle = '#e0d6bf'; UX.lineWidth = 0.8;
      UX.beginPath(); UX.moveTo(18.4, -1.2); UX.lineTo(18.4, -4.6);
      UX.moveTo(18.4, -1.2); UX.lineTo(21.6, -4.2); UX.stroke();
      UX.strokeStyle = '#8a6a3a'; UX.lineWidth = 1;   // kötözés
      UX.beginPath(); UX.moveTo(16.4, -1.8); UX.lineTo(17.4, -0.4); UX.stroke();
      UX.restore();
      break;
  }
}

/* =======================================================================
   ZÁSZLÓVIVŐ

   Minden katona fölé zászlót tenni zsúfolt és olvashatatlan lenne. Ezért
   CSOPORTONKÉNT egy: az egység azonosítója dönti el, ki viszi — így
   nagyjából minden kilencedik katona zászlós, egyenletesen elosztva, és a
   döntés minden gépen ugyanaz (az azonosító a szimulációból jön).

   A zászló a fej fölött lobog, enyhén hullámozva. Csak a 15–19.
   században: a 20. századi gyalogság már nem vitt lobogót a rajba.
   ===================================================================== */
function rajzZaszlovivo(u, col, acc){
  if(!u || u.dead || u.age >= 3) return;
  if(!JELLEG_SZEREP[u.role] || u.role === 'hero') return;
  if((u.id % 9) !== 0) return;

  const t = (typeof G !== 'undefined' ? G.t : 0) * 2.4 + u.id;
  const leng = Math.sin(t) * 1.1;

  UX.strokeStyle = '#6b4a2a'; UX.lineWidth = 1;      // rúd
  UX.beginPath(); UX.moveTo(-3.4, -12); UX.lineTo(-4.6, -30); UX.stroke();

  UX.fillStyle = col;                                 // lobogó
  UX.beginPath();
  UX.moveTo(-4.6, -29.4);
  UX.quadraticCurveTo(1.4 + leng, -28.4, 6.4, -26.6);
  UX.lineTo(5.8, -21.4);
  UX.quadraticCurveTo(0.8 - leng, -22.6, -4.2, -22);
  UX.closePath(); UX.fill();

  UX.fillStyle = acc;                                 // sáv a lobogón
  UX.beginPath();
  UX.moveTo(-4.5, -26.6);
  UX.quadraticCurveTo(0.9 + leng, -25.6, 6.1, -24);
  UX.lineTo(6, -22.6);
  UX.quadraticCurveTo(0.8 - leng, -24.2, -4.4, -25);
  UX.closePath(); UX.fill();

  UX.fillStyle = '#c9a227';                           // gomb a rúd tetején
  UX.beginPath(); UX.arc(-4.6, -30.4, 1, 0, TAU); UX.fill();
}


/* =======================================================================
   NEMZETI ÖLTÖZÉK — a harmadik réteg

   Eddig két nemzeti jegy volt az egységeken: a FEJFEDŐ és a FEGYVER. Ez
   sokat számít, de a sziluett középső harmada — a törzs — mindenkinél
   ugyanaz maradt. Márpedig távolról épp a törzs a legnagyobb felület.

   Ez a réteg a törzsre kerül: páncélszabás, öv, köpeny, kaftán. Nem
   ruhatervezés — négy-öt vonás, ami MESSZIRŐL is elkülöníti a
   nemzeteket egymástól.

   A test UTÁN, de a fej ELŐTT fut: a gallér és a vállvért takarja a
   törzs tetejét, viszont a fejfedő takarja a gallért.

   Csak azoknál a nemzeteknél van bejegyzés, ahol van mit mondani. Ami
   hiányzik, az a megszokott egyenruhát viseli — nem hiba, hanem
   szándék: nem minden nemzetnek kell külön szabásminta.
   ===================================================================== */
const NEMZETI_OLTOZEK = {
  jp: 'lamellas',      // szamuráj lemezpáncél, széles vállvérttel
  cn: 'kabatpancel',   // kínai lemezkabát, kerek gallérral
  ot: 'kaftan',        // oszmán kaftán, széles selyemövvel
  in: 'ovheves',       // indiai öv és vállszalag
  ml: 'bubu',          // szaheli bő köpeny (boubou)
  se: 'karolinus'      // svéd kabát, keresztbe vetett szíjakkal
};

function nemzetiOltozek(owner){
  const nk = (typeof nationOf === 'function') ? nationOf(owner) : 'hu';
  return NEMZETI_OLTOZEK[nk] || null;
}

function rajzNemzetiOltozek(pose, owner, age, role, col, acc){
  if(!JELLEG_SZEREP[role]) return;
  const jegy = nemzetiOltozek(owner);
  if(!jegy) return;
  /* A 20. században mindenki egyenruhát hord: a nemzeti szabás
     eltűnik. Ugyanaz a szabály, mint a fejfedőknél. */
  if(age >= 3) return;

  switch(jegy){

    case 'lamellas':                        // szamuráj: vízszintes lemezsorok
      UX.fillStyle = shade(col, -0.3);
      for(let i = 0; i < 4; i++){
        const y = -11.4 + i * 2.5;
        UX.fillRect(-3.6, y, 7.2, 1.8);
      }
      UX.fillStyle = shade(col, 0.15);      // széles, szögletes vállvért (szode)
      UX.beginPath();
      UX.moveTo(-5.6, -12.2); UX.lineTo(-3.2, -12.8);
      UX.lineTo(-3.2, -7.6);  UX.lineTo(-6.2, -7.0);
      UX.closePath(); UX.fill();
      UX.beginPath();
      UX.moveTo(5.6, -12.2); UX.lineTo(3.2, -12.8);
      UX.lineTo(3.2, -7.6);  UX.lineTo(6.2, -7.0);
      UX.closePath(); UX.fill();
      UX.strokeStyle = acc; UX.lineWidth = 0.8;   // zsinórozás a lemezek közt
      UX.beginPath(); UX.moveTo(0, -11.4); UX.lineTo(0, -2.4); UX.stroke();
      break;

    case 'kabatpancel':                     // kínai lemezkabát, kerek gallérral
      UX.fillStyle = shade(col, -0.22);
      UX.beginPath();
      UX.moveTo(-4.2, -12); UX.lineTo(4.2, -12);
      UX.lineTo(3.4, -2.6); UX.lineTo(-3.4, -2.6);
      UX.closePath(); UX.fill();
      UX.fillStyle = acc;                   // kerek gallér
      UX.beginPath(); UX.ellipse(0, -12.4, 3.6, 1.5, 0, 0, TAU); UX.fill();
      UX.fillStyle = 'rgba(255,255,255,.16)';    // pikkelysorok jelzése
      for(let i = 0; i < 3; i++) UX.fillRect(-3.6, -10 + i * 2.6, 7.2, 0.9);
      break;

    case 'kaftan':                          // oszmán kaftán, széles övvel
      UX.fillStyle = shade(col, 0.12);
      UX.beginPath();
      UX.moveTo(-4, -12.4); UX.lineTo(4, -12.4);
      UX.lineTo(5, -1.6);   UX.lineTo(-5, -1.6);
      UX.closePath(); UX.fill();            // a kaftán lefelé bővül
      UX.fillStyle = shade(col, -0.35);     // elöl nyitott, más színű bélés
      UX.beginPath();
      UX.moveTo(-1.2, -12.4); UX.lineTo(1.2, -12.4);
      UX.lineTo(1.8, -1.6);   UX.lineTo(-1.8, -1.6);
      UX.closePath(); UX.fill();
      UX.fillStyle = acc;                   // széles selyemöv
      UX.fillRect(-4.6, -7.4, 9.2, 2.6);
      break;

    case 'ovheves':                         // indiai: vállszalag és öv
      UX.strokeStyle = acc; UX.lineWidth = 2.2;
      UX.beginPath();                       // átlós vállszalag
      UX.moveTo(-4.4, -12); UX.lineTo(4, -4.6); UX.stroke();
      UX.fillStyle = shade(col, 0.2);       // öv
      UX.fillRect(-4.2, -6.4, 8.4, 2.2);
      UX.fillStyle = acc;                   // övcsat
      UX.beginPath(); UX.arc(0, -5.3, 1.4, 0, TAU); UX.fill();
      break;

    case 'bubu':                            // szaheli bő köpeny
      UX.fillStyle = shade(col, 0.24);
      UX.beginPath();
      UX.moveTo(-3.4, -12.6); UX.lineTo(3.4, -12.6);
      UX.quadraticCurveTo(6.6, -6, 6, -1.2);    // szélesen kihajló alj
      UX.lineTo(-6, -1.2);
      UX.quadraticCurveTo(-6.6, -6, -3.4, -12.6);
      UX.closePath(); UX.fill();
      UX.strokeStyle = acc; UX.lineWidth = 0.9;  // hímzett nyakkivágás
      UX.beginPath();
      UX.moveTo(-2.2, -12.2); UX.lineTo(0, -9); UX.lineTo(2.2, -12.2); UX.stroke();
      UX.fillStyle = 'rgba(0,0,0,.14)';          // a köpeny redői
      UX.fillRect(-1.2, -9, 0.8, 7.8);
      UX.fillRect(2.4, -8.4, 0.8, 7.2);
      break;

    case 'karolinus':                       // svéd kabát, keresztbe vetett szíjakkal
      UX.fillStyle = shade(col, -0.12);
      UX.fillRect(-4, -12.4, 8, 10.4);
      UX.fillStyle = acc;                   // sárga hajtóka
      UX.fillRect(-4, -12.4, 1.6, 10.4);
      UX.strokeStyle = '#efe7d8'; UX.lineWidth = 1.5;   // két fehér szíj
      UX.beginPath();
      UX.moveTo(-4.4, -11.4); UX.lineTo(4.4, -4.4);
      UX.moveTo(4.4, -11.4);  UX.lineTo(-4.4, -4.4);
      UX.stroke();
      break;
  }
}
