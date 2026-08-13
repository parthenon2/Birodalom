/* =======================================================================
   13/F. CSATANYOMOK — égett folt, kráter, elhagyott fegyver

   A hullák és a roncsok eltűnnek egy idő után; a föld viszont emlékszik.
   Ez a réteg azt mutatja, hogy ott CSATA VOLT: felperzselt fű, becsapódás
   krátere, elhagyott pajzs a fűben.

   Miért fontos? Mert egy hosszú játszmában a térkép ma ugyanolyan
   érintetlen a végén, mint az elején. Ha látszik, hol dúlt a harc, a
   pálya történetet mond — és taktikailag is eligazít: az égett sáv
   megmutatja, merről jött az ellenség.

   TISZTÁN LÁTVÁNY. A nyomok nem befolyásolnak semmit: sem sebességet,
   sem látótávot. Ezért nem is kell determinisztikusnak lenniük, és
   takarékos módban nyugodtan kimaradnak.

   A nyomok NEM tűnnek el — a talaj nem gyógyul be egy játszma alatt. A
   darabszámot viszont korlátozzuk: a legrégebbi esik ki, ha megtelt.
   ===================================================================== */

const NYOM_MAX = 260;          // ennyi fér el egyszerre
const NYOM_EGES = 0, NYOM_KRATER = 1, NYOM_FEGYVER = 2;

function nyomInit(){ G.nyomok = []; }

/* Új nyom. A `fajta` dönti el, mit rajzolunk; a szórás a helyre kerül,
   hogy két azonos esemény se legyen egyforma. */
function nyomHozzaad(fajta, x, y, meret){
  if(typeof REDUCED !== 'undefined' && REDUCED) return;
  if(!G.nyomok) nyomInit();
  if(G.nyomok.length >= NYOM_MAX) G.nyomok.shift();   // a legrégebbi kiesik
  G.nyomok.push({
    f: fajta,
    x: x + (Math.random() - 0.5) * 10,
    y: y + (Math.random() - 0.5) * 10,
    r: (meret || 1) * (0.8 + Math.random() * 0.5),
    /* Az elforgatás és az árnyalat is véletlen — így nem lesz sablonos.
       Math.random azért jó itt, mert a nyom csak látvány: a szimulációt
       nem érinti, tehát nem okozhat szétcsúszást. */
    a: Math.random() * TAU,
    v: Math.random()
  });
}

/* A kirajzolás a talaj UTÁN, az egységek ELŐTT fut — a nyom a földön van,
   nem a katonán. Csak a képernyőn látható rész. */
function drawNyomok(){
  if(typeof REDUCED !== 'undefined' && REDUCED) return;
  if(G.lowFx || !G.nyomok || !G.nyomok.length) return;
  const bx = G.cam.x - 40, by = G.cam.y - 40;
  const jx = G.cam.x + G.vw + 40, jy = G.cam.y + G.vh + 40;

  for(const n of G.nyomok){
    if(n.x < bx || n.x > jx || n.y < by || n.y > jy) continue;
    const px = n.x - G.cam.x, py = n.y - G.cam.y;

    if(n.f === NYOM_EGES){
      /* ÉGETT FOLT: szabálytalan, elmosódó szélű korom. Két rétegben,
         hogy legyen mélysége — kívül halványabb, belül sűrűbb. */
      ctx.fillStyle = 'rgba(28,22,16,.30)';
      ctx.beginPath();
      ctx.ellipse(px, py, n.r * 15, n.r * 9, n.a, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(16,12,9,.34)';
      ctx.beginPath();
      ctx.ellipse(px + n.v * 3, py - n.v * 2, n.r * 8, n.r * 5, n.a, 0, TAU);
      ctx.fill();

    }else if(n.f === NYOM_KRATER){
      /* KRÁTER: a kidobott föld pereme világosabb, a gödör sötét. A
         fényt balról feltételezzük, mint mindenhol a játékban. */
      ctx.fillStyle = 'rgba(120,100,74,.42)';
      ctx.beginPath();
      ctx.ellipse(px, py, n.r * 13, n.r * 8, n.a, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(38,30,22,.46)';
      ctx.beginPath();
      ctx.ellipse(px, py + n.r, n.r * 9, n.r * 5.4, n.a, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,246,220,.10)';   // megvilágított perem
      ctx.beginPath();
      ctx.ellipse(px - n.r * 3, py - n.r * 2.4, n.r * 6, n.r * 2.6, n.a, 0, TAU);
      ctx.fill();

    }else{
      /* ELHAGYOTT FEGYVER: egy dárdanyél vagy pajzs a fűben. Apró, de
         közelről elárulja, hogy itt esett el valaki. */
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(n.a);
      if(n.v < 0.5){
        ctx.strokeStyle = 'rgba(90,64,38,.6)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.stroke();
        ctx.fillStyle = 'rgba(150,156,164,.55)';
        ctx.beginPath();
        ctx.moveTo(9, 0); ctx.lineTo(14, -1.6); ctx.lineTo(9, 1.6);
        ctx.closePath(); ctx.fill();
      }else{
        ctx.fillStyle = 'rgba(110,86,56,.5)';
        ctx.beginPath(); ctx.ellipse(0, 0, 6, 4.4, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(150,156,164,.45)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, 6, 4.4, 0, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    }
  }
}
