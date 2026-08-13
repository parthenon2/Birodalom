/* =======================================================================
   15/E. LOVASSÁG

   A könnyűlovas az első egység, amely LÓHÁTON jelenik meg. A ló nem
   díszítés: a sziluett kétszer olyan széles, mint egy gyalogosé, és
   ebből messziről is látszik, mi közeledik.

   A ló rajza három rétegből áll:
     · a négy láb, vágtaütemre mozogva
     · a test, a nyak és a fej
     · a takaró és a szerszám — EZ a nemzeti réteg

   A lovas ugyanazokból az alkatrészekből épül, mint a gyalogos (törzs,
   fej, kar), csak feljebb ültetve. Így a nemzeti fejfedő és a fegyverjegy
   automatikusan ráöröklődik — nem kellett külön megírni.
   ===================================================================== */

/* Nemzeti lószerszám. A magyar huszár párducbőre a leglátványosabb;
   a lengyelnél a szárny amúgy is ott van a katonán. */
const LO_TAKARO = {
  hu: 'parducbor',
  pl: 'csotar',      // hosszú, hímzett csótár
  ru: 'csotar',
  es: 'pancel',      // spanyol lópáncél
  at: 'csotar',
  de: 'pancel',
  fr: 'nyeregtakaro',
  gb: 'nyeregtakaro',
  ns: null, bb: null, sb: null, nat: null,
  /* --- KÉSZÜLŐ NEMZETEK --- */
  se: 'nyeregtakaro', ot: 'csotar', jp: 'pancel', cn: 'csotar',
  in: 'csotar',       ml: 'csotar'
};

function paintCav(u, pose, phase, moving, fired, col, acc){
  const age = u.age | 0;
  /* A `fwd(pose)` OBJEKTUMOT ad vissza (`{x, y}`), nem számot. Itt a
     vízszintes irány kell — enélkül minden szorzás NaN-t adott, és a ló
     egyszerűen nem rajzolódott ki. */
  const f = fwd(pose).x;
  const lep = moving ? Math.sin(phase * 2.1) : 0;   // vágtaütem

  /* --- LÁBAK ---
     Vágtában az átlós lábpár együtt mozog; ettől lesz „ugró” a járás. */
  UX.strokeStyle = '#4a3626'; UX.lineWidth = 2.2;
  const labak = [[-6.4, 1], [-4.4, -1], [5.4, -1], [7.4, 1]];
  for(let i = 0; i < labak.length; i++){
    const [lx, irany] = labak[i];
    const kileng = lep * irany * 3.4;
    UX.beginPath();
    UX.moveTo(lx * f, -6.4);
    UX.lineTo(lx * f + kileng * f, 1.6);
    UX.stroke();
  }

  /* --- TEST ÉS NYAK --- */
  const loszin = (u.id % 3 === 0) ? '#4b3628' : (u.id % 3 === 1 ? '#6b5136' : '#2f2721');
  UX.fillStyle = loszin;
  UX.beginPath();
  UX.ellipse(0.6 * f, -9.4, 8.6, 4.4, 0, 0, TAU); UX.fill();
  UX.fillStyle = shade(loszin, -0.18);            // a has árnyéka
  UX.beginPath(); UX.ellipse(0.6 * f, -7.8, 8, 2.4, 0, 0, Math.PI); UX.fill();

  UX.fillStyle = loszin;                          // nyak
  UX.beginPath();
  UX.moveTo(7 * f, -11.4); UX.lineTo(11.6 * f, -17.4);
  UX.lineTo(13.4 * f, -16); UX.lineTo(8.6 * f, -8.6);
  UX.closePath(); UX.fill();
  UX.beginPath();                                  // fej
  UX.ellipse(12.6 * f, -17.6, 3, 1.9, f > 0 ? -0.5 : 0.5, 0, TAU); UX.fill();
  UX.fillStyle = '#241c15';                        // orr és fül
  UX.beginPath(); UX.arc(14.8 * f, -16.6, 0.9, 0, TAU); UX.fill();
  UX.beginPath();
  UX.moveTo(11.4 * f, -19.4); UX.lineTo(12 * f, -21.6); UX.lineTo(12.8 * f, -19.2);
  UX.closePath(); UX.fill();

  UX.strokeStyle = shade(loszin, -0.35); UX.lineWidth = 1.6;   // sörény
  UX.beginPath();
  UX.moveTo(11.2 * f, -18.4); UX.quadraticCurveTo(8.4 * f, -15.4, 6.4 * f, -12.4);
  UX.stroke();
  UX.beginPath();                                              // farok
  UX.moveTo(-8 * f, -10.4);
  UX.quadraticCurveTo(-12.4 * f, -8.4 + lep, -11.4 * f, -3.4 + lep);
  UX.stroke();

  /* --- NEMZETI TAKARÓ --- */
  const nk = (typeof nationOf === 'function') ? nationOf(u.owner) : 'hu';
  const takaro = LO_TAKARO[nk];
  if(takaro === 'parducbor'){
    /* Párducbőr a lovas háta mögött: a huszár jelképe. Foltos, a szélén
       szabálytalan. */
    UX.fillStyle = '#c9a05a';
    UX.beginPath();
    UX.moveTo(-2.4 * f, -14.4);
    UX.quadraticCurveTo(-11 * f, -13.4, -9.4 * f, -4.6);
    UX.quadraticCurveTo(-5.4 * f, -7.4, -1.4 * f, -8.4);
    UX.closePath(); UX.fill();
    UX.fillStyle = '#3a2a18';
    for(let i = 0; i < 5; i++){
      const t = i / 5;
      UX.beginPath();
      UX.arc((-3.4 - t * 5) * f, -12.4 + t * 6, 0.8, 0, TAU); UX.fill();
    }
  }else if(takaro === 'csotar'){
    UX.fillStyle = shade(col, -0.2);
    UX.beginPath();
    UX.moveTo(-6.4 * f, -11.4); UX.lineTo(4.4 * f, -11.4);
    UX.lineTo(3.4 * f, -4.2);   UX.lineTo(-7.4 * f, -4.2);
    UX.closePath(); UX.fill();
    UX.strokeStyle = acc; UX.lineWidth = 0.9;      // hímzett szegély
    UX.beginPath(); UX.moveTo(-7.4 * f, -4.6); UX.lineTo(3.4 * f, -4.6); UX.stroke();
  }else if(takaro === 'pancel'){
    UX.fillStyle = '#8b93a0';
    UX.beginPath();
    UX.ellipse(2.4 * f, -10.4, 6.4, 3.4, 0, Math.PI, TAU); UX.fill();
    UX.fillStyle = 'rgba(255,255,255,.18)';
    UX.beginPath(); UX.ellipse(0.4 * f, -11.8, 3.4, 1.2, 0, 0, TAU); UX.fill();
  }else if(takaro === 'nyeregtakaro'){
    UX.fillStyle = shade(col, -0.28);
    UX.fillRect(-5.4 * f - (f > 0 ? 0 : 4), -11.6, 9.4, 5.4);
  }

  /* --- KANTÁR --- */
  UX.strokeStyle = '#2e2116'; UX.lineWidth = 0.9;
  UX.beginPath();
  UX.moveTo(13.4 * f, -17.2); UX.quadraticCurveTo(9.4 * f, -14.4, 4.4 * f, -12.4);
  UX.stroke();

  /* --- A LOVAS ---
     Ugyanazokból az alkatrészekből, mint a gyalogos, csak feljebb ültetve.
     Ezért öröklődik rá a nemzeti fejfedő és a fegyverjegy is. */
  UX.save();
  UX.translate(0, -13.4);
  partLegs(pose, phase * 0.2, false, shade(col, -0.4), '#3a2a1c');
  partTorso(pose, age, coatOf(u.owner, age, col), acc);
  const kar = partArm(pose, fired ? -0.9 : -0.35, 7.4, coatOf(u.owner, age, col));
  /* Szablya a kézben — a lovas jellegzetes fegyvere. */
  UX.save(); UX.translate(kar.x, kar.y); UX.rotate(fired ? -0.9 : -0.35);
  UX.strokeStyle = '#cdd3da'; UX.lineWidth = 1.5;
  UX.beginPath(); UX.moveTo(7, 0); UX.quadraticCurveTo(13, -3.4, 17.4, -9.4); UX.stroke();
  UX.restore();
  partHead(pose, SKIN[u.id % 3], age);
  if(typeof rajzNemzetiJelleg === 'function'){
    rajzNemzetiJelleg(pose, u.owner, age, u.role, col, acc);
    rajzNemzetiFegyver(pose, u.owner, age, u.role, col, acc);
    rajzZaszlovivo(u, col, acc);
  }
  UX.restore();
}
