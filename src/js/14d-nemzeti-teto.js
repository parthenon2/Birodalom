/* =======================================================================
   14/D. NEMZETI TETŐFORMA

   Az épületeknél eddig csak a tető és a fal SZÍNE volt nemzeti
   (NATIONS[..].arch). A forma mindenhol ugyanaz: kúpos zsindelytető.

   Pedig a városok sziluettjét éppen a tető adja. Egy hagymakupolás
   templomtorony egy pillantásra elárulja, hogy orosz földön járunk; a
   meredek gótikus gúla németet mond, a lapos sátortető mediterránt.

   Ez a modul csak a TORONYSISAKOT cseréli. A falak, az ablakok és a
   többi rész változatlan — így a meglévő épületrajzolás sértetlen marad,
   és az új forma bárhol megjelenik, ahol torony van.
   ===================================================================== */

const NEMZETI_TETO = {
  ru: 'hagyma',      // hagymakupola
  de: 'gotikus',     // meredek gúla
  at: 'gotikus',
  pl: 'gotikus',
  es: 'lapos',       // lapos, széles eresz
  fr: 'palaszsindely',// palás, enyhén homorú
  gb: 'ormos',       // ormos, gerinces
  hu: 'kup',         // marad a kúp
  ns: 'kup', bb: 'kup', sb: 'kup', nat: 'nadfedel',
  /* --- KÉSZÜLŐ NEMZETEK ---
     Egyelőre a meglévő formákból választunk; saját tetőt (minaret,
     pagoda, sárépítészet) a következő menetben kapnak. */
  se: 'zsindely',      // meredek zsindelytető, faragott oromdísszel
  ot: 'minaret',       // kupola mellett karcsú minaret
  jp: 'pagoda',        // többszintes, felkunkorodó eresz
  cn: 'pagoda',
  in: 'mogulkupola',   // körte alakú kupola, csúccsal és saroktornyokkal
  ml: 'sarepitmeny'    // szaheli vályogépítészet, kiálló gerendavégekkel
};

/* Melyik forma jár most? A HELYI játékos nemzete nem jó válasz — az
   épületnek saját tulajdonosa van. A hívó oldalon viszont nem érhető el
   közvetlenül, ezért a rajzolás előtt beállított aktuális nemzetet
   használjuk (ugyanazt, amiből a falszín is jön). */
let TETO_NEMZET = null;
function toronySisakNemzet(nk){ TETO_NEMZET = nk || null; }

function toronySisakForma(){
  const nk = TETO_NEMZET || ((typeof G !== 'undefined') ? G.nation : 'hu');
  return NEMZETI_TETO[nk] || 'kup';
}

function toronySisakRajz(forma, cx, cy, th, r, roofColor, st){
  const teto = cy - th;                       // a torony koronájának magassága
  const arny = 'rgba(0,0,0,.22)';

  switch(forma){

    case 'hagyma': {                          // orosz hagymakupola
      GX.fillStyle = shade(roofColor, -0.05);
      GX.beginPath();
      GX.moveTo(cx - r * 0.94, teto + r * 0.14);
      GX.bezierCurveTo(cx - r * 1.5, teto - r * 0.9,
                       cx - r * 0.66, teto - r * 1.7,
                       cx,            teto - r * 2.15);
      GX.bezierCurveTo(cx + r * 0.66, teto - r * 1.7,
                       cx + r * 1.5,  teto - r * 0.9,
                       cx + r * 0.94, teto + r * 0.14);
      GX.closePath(); GX.fill();
      GX.fillStyle = 'rgba(255,250,225,.18)';  // fénycsík a bal oldalon
      GX.beginPath();
      GX.moveTo(cx - r * 0.5, teto + r * 0.1);
      GX.bezierCurveTo(cx - r * 1.05, teto - r * 0.85,
                       cx - r * 0.42, teto - r * 1.6,
                       cx - r * 0.06, teto - r * 2.05);
      GX.lineTo(cx - r * 0.3, teto - r * 1.5);
      GX.closePath(); GX.fill();
      GX.strokeStyle = '#c9a227'; GX.lineWidth = 1.4;   // kereszt a csúcson
      GX.beginPath();
      GX.moveTo(cx, teto - r * 2.15); GX.lineTo(cx, teto - r * 2.95);
      GX.moveTo(cx - r * 0.24, teto - r * 2.66); GX.lineTo(cx + r * 0.24, teto - r * 2.66);
      GX.stroke();
      break;
    }

    case 'gotikus':                           // meredek, karcsú gúla
      GX.fillStyle = shade(roofColor, -0.14);
      GX.beginPath();
      GX.moveTo(cx, teto - r * 3.1);
      GX.lineTo(cx + r * 0.98, teto + r * 0.16);
      GX.lineTo(cx - r * 0.98, teto + r * 0.16);
      GX.closePath(); GX.fill();
      GX.strokeStyle = arny; GX.lineWidth = 0.9;
      for(let i = 1; i < 6; i++){
        const t = i / 6;
        GX.beginPath();
        GX.moveTo(cx - r * 0.98 * t, teto - r * 3.1 + (r * 3.26) * t);
        GX.lineTo(cx + r * 0.98 * t, teto - r * 3.1 + (r * 3.26) * t);
        GX.stroke();
      }
      GX.fillStyle = 'rgba(255,250,225,.14)';
      GX.beginPath(); GX.moveTo(cx, teto - r * 3.1);
      GX.lineTo(cx - r * 0.42, teto + r * 0.1);
      GX.lineTo(cx - r * 0.98, teto + r * 0.16); GX.closePath(); GX.fill();
      break;

    case 'lapos':                             // lapos sátortető, széles eresszel
      GX.fillStyle = shade(roofColor, -0.08);
      GX.beginPath();
      GX.moveTo(cx, teto - r * 0.92);
      GX.lineTo(cx + r * 1.34, teto + r * 0.3);
      GX.lineTo(cx - r * 1.34, teto + r * 0.3);
      GX.closePath(); GX.fill();
      GX.fillStyle = shade(roofColor, -0.28);  // cserépsorok
      for(let i = 1; i <= 3; i++){
        const t = i / 4;
        GX.fillRect(cx - r * 1.34 * t, teto - r * 0.92 + (r * 1.22) * t, r * 2.68 * t, 1.1);
      }
      break;

    case 'palaszsindely':                     // francia palatető, homorú ívvel
      GX.fillStyle = shade(roofColor, -0.2);
      GX.beginPath();
      GX.moveTo(cx, teto - r * 2.4);
      GX.quadraticCurveTo(cx + r * 0.72, teto - r * 0.9, cx + r * 1.06, teto + r * 0.16);
      GX.lineTo(cx - r * 1.06, teto + r * 0.16);
      GX.quadraticCurveTo(cx - r * 0.72, teto - r * 0.9, cx, teto - r * 2.4);
      GX.closePath(); GX.fill();
      GX.fillStyle = 'rgba(255,255,255,.10)';
      GX.beginPath(); GX.arc(cx, teto - r * 2.5, 1.6, 0, TAU); GX.fill();
      break;

    case 'ormos': {                           // ormos, gerinces angol tető
      GX.fillStyle = shade(roofColor, -0.12);
      GX.beginPath();
      GX.moveTo(cx - r * 1.06, teto + r * 0.16);
      GX.lineTo(cx - r * 0.34, teto - r * 1.62);
      GX.lineTo(cx + r * 0.34, teto - r * 1.62);
      GX.lineTo(cx + r * 1.06, teto + r * 0.16);
      GX.closePath(); GX.fill();
      GX.fillStyle = shade(roofColor, 0.16);   // gerinc
      GX.fillRect(cx - r * 0.36, teto - r * 1.72, r * 0.72, 2);
      GX.fillStyle = shade(st.wall, 0.1);      // kémény
      GX.fillRect(cx + r * 0.5, teto - r * 1.5, r * 0.3, r * 1.2);
      break;
    }

    case 'minaret':                           // oszmán: kupola mellett karcsú torony
      /* A kupola alacsonyabb és szélesebb, mint a hagymakupola: a
         félgömb a lényeg, nem a csúcs. Mellette áll a minaret, amitől a
         sziluett messziről is felismerhető. */
      GX.fillStyle = shade(roofColor, -0.06);
      GX.beginPath();
      GX.arc(cx, teto + r * 0.1, r * 1.12, Math.PI, TAU);
      GX.fill();
      GX.fillStyle = 'rgba(255,255,255,.12)';   // a kupola megvilágított oldala
      GX.beginPath();
      GX.arc(cx - r * 0.3, teto - r * 0.1, r * 0.62, Math.PI * 1.05, TAU * 0.98);
      GX.fill();
      GX.fillStyle = shade(roofColor, -0.3);    // dobszerkezet a kupola alatt
      GX.fillRect(cx - r * 1.12, teto + r * 0.08, r * 2.24, r * 0.22);
      {                                          // a minaret
        const mx = cx + r * 1.3;
        GX.fillStyle = shade(st ? st.wall : '#d8c9a8', 0.1);
        GX.fillRect(mx - r * 0.16, teto - r * 1.5, r * 0.32, r * 1.9);
        GX.fillStyle = shade(roofColor, -0.2);   // erkély (serefe)
        GX.fillRect(mx - r * 0.28, teto - r * 1.06, r * 0.56, r * 0.12);
        GX.fillStyle = shade(roofColor, -0.1);   // kúpos sisak
        GX.beginPath();
        GX.moveTo(mx, teto - r * 2.1);
        GX.lineTo(mx + r * 0.2, teto - r * 1.5);
        GX.lineTo(mx - r * 0.2, teto - r * 1.5);
        GX.closePath(); GX.fill();
      }
      break;

    case 'pagoda':                            // japán-kínai: többszintes, felkunkorodó eresz
      /* Két-három egymás fölötti eresz, mindegyik kisebb, és a sarkuk
         FELFELÉ hajlik. Ez az egyetlen jegy, amitől a tető azonnal
         keletinek látszik — a felkunkorodó sarok nélkül csak lapos
         sátortető lenne. */
      for(let sz = 0; sz < 3; sz++){
        const m = 1 - sz * 0.26;                 // szintenként keskenyebb
        const y = teto + r * 0.24 - sz * r * 0.66;
        const fel = r * 1.36 * m;
        GX.fillStyle = shade(roofColor, -0.08 - sz * 0.06);
        GX.beginPath();
        GX.moveTo(cx, y - r * 0.56 * m);
        /* jobb oldali eresz, felkunkorodó véggel */
        GX.quadraticCurveTo(cx + fel * 0.72, y - r * 0.1 * m, cx + fel, y - r * 0.22 * m);
        GX.lineTo(cx + fel * 0.9, y + r * 0.06 * m);
        GX.quadraticCurveTo(cx + fel * 0.5, y + r * 0.14 * m, cx, y + r * 0.16 * m);
        /* bal oldal, tükrözve */
        GX.quadraticCurveTo(cx - fel * 0.5, y + r * 0.14 * m, cx - fel * 0.9, y + r * 0.06 * m);
        GX.lineTo(cx - fel, y - r * 0.22 * m);
        GX.quadraticCurveTo(cx - fel * 0.72, y - r * 0.1 * m, cx, y - r * 0.56 * m);
        GX.closePath(); GX.fill();
        GX.fillStyle = 'rgba(0,0,0,.16)';        // az eresz alatti árnyék
        GX.fillRect(cx - fel * 0.9, y + r * 0.12 * m, fel * 1.8, 1.2);
      }
      GX.fillStyle = shade(roofColor, 0.3);      // gerincdísz a tetején
      GX.beginPath(); GX.arc(cx, teto - r * 1.6, r * 0.16, 0, TAU); GX.fill();
      break;

    case 'sarepitmeny':                       // szaheli sárépítészet (Djenné)
      /* Lapos tető, körben felnyúló pillérekkel, és a falból kiálló
         gerendavégek (toron). Ez utóbbi a legjellegzetesebb: a
         vályogfalba épített pálmagerendák, amiken a vakolók állnak. */
      GX.fillStyle = shade(roofColor, -0.12);
      GX.fillRect(cx - r * 1.24, teto - r * 0.2, r * 2.48, r * 0.5);
      GX.fillStyle = shade(roofColor, 0.06);     // csúcsos pillérek a peremen
      for(let i = -2; i <= 2; i++){
        const px = cx + i * r * 0.52;
        GX.beginPath();
        GX.moveTo(px, teto - r * 0.86);
        GX.lineTo(px + r * 0.15, teto - r * 0.2);
        GX.lineTo(px - r * 0.15, teto - r * 0.2);
        GX.closePath(); GX.fill();
      }
      GX.strokeStyle = 'rgba(70,48,26,.75)';     // kiálló gerendavégek
      GX.lineWidth = 1.6;
      for(let i = -2; i <= 2; i++){
        const px = cx + i * r * 0.5 + r * 0.25;
        GX.beginPath();
        GX.moveTo(px, teto + r * 0.05);
        GX.lineTo(px + r * 0.26, teto + r * 0.02);
        GX.stroke();
      }
      break;

    case 'zsindely':                          // svéd: meredek zsindelytető, oromdísszel
      GX.fillStyle = shade(roofColor, -0.14);
      GX.beginPath();
      GX.moveTo(cx, teto - r * 1.9);
      GX.lineTo(cx + r * 1.18, teto + r * 0.24);
      GX.lineTo(cx - r * 1.18, teto + r * 0.24);
      GX.closePath(); GX.fill();
      GX.strokeStyle = 'rgba(0,0,0,.2)'; GX.lineWidth = 0.9;
      for(let i = 1; i <= 4; i++){               // zsindelysorok
        const t = i / 5;
        GX.beginPath();
        GX.moveTo(cx - r * 1.18 * t, teto - r * 1.9 + (r * 2.14) * t);
        GX.lineTo(cx + r * 1.18 * t, teto - r * 1.9 + (r * 2.14) * t);
        GX.stroke();
      }
      GX.fillStyle = shade(roofColor, 0.34);     // faragott oromdísz
      GX.fillRect(cx - r * 0.08, teto - r * 2.3, r * 0.16, r * 0.44);
      break;

    case 'mogulkupola':                       // mogul: körte alakú kupola, csúccsal
      /* Nem hagymakupola: a mogul kupola KÖRTE alakú — alul beszűkül,
         középen kiöblösödik, és karcsú csúcsban végződik. A saroktornyok
         (csatri) teszik teljessé a sziluettet. */
      GX.fillStyle = shade(roofColor, -0.05);
      GX.beginPath();
      GX.moveTo(cx, teto - r * 2.5);
      GX.bezierCurveTo(cx + r * 1.25, teto - r * 1.5, cx + r * 1.18, teto - r * 0.1, cx + r * 0.62, teto + r * 0.2);
      GX.lineTo(cx - r * 0.62, teto + r * 0.2);
      GX.bezierCurveTo(cx - r * 1.18, teto - r * 0.1, cx - r * 1.25, teto - r * 1.5, cx, teto - r * 2.5);
      GX.closePath(); GX.fill();
      GX.fillStyle = 'rgba(255,255,255,.14)';
      GX.beginPath();
      GX.ellipse(cx - r * 0.34, teto - r * 1.16, r * 0.3, r * 0.62, -0.2, 0, TAU);
      GX.fill();
      GX.fillStyle = shade(roofColor, 0.3);      // csúcsdísz
      GX.fillRect(cx - r * 0.06, teto - r * 3.1, r * 0.12, r * 0.62);
      GX.beginPath(); GX.arc(cx, teto - r * 3.16, r * 0.13, 0, TAU); GX.fill();
      for(const sx of [-1, 1]){                  // két kis saroktorony
        const px = cx + sx * r * 1.28;
        GX.fillStyle = shade(roofColor, -0.16);
        GX.beginPath();
        GX.arc(px, teto + r * 0.1, r * 0.32, Math.PI, TAU);
        GX.fill();
        GX.fillRect(px - r * 0.32, teto + r * 0.08, r * 0.64, r * 0.16);
      }
      break;

    case 'nadfedel':                          // szigetlakó nádtető
      GX.fillStyle = '#9a7f4e';
      GX.beginPath();
      GX.moveTo(cx, teto - r * 1.5);
      GX.lineTo(cx + r * 1.3, teto + r * 0.34);
      GX.lineTo(cx - r * 1.3, teto + r * 0.34);
      GX.closePath(); GX.fill();
      GX.strokeStyle = 'rgba(70,50,25,.35)'; GX.lineWidth = 0.9;
      for(let i = 1; i <= 3; i++){
        const t = i / 4;
        GX.beginPath();
        GX.moveTo(cx - r * 1.3 * t, teto - r * 1.5 + (r * 1.84) * t);
        GX.lineTo(cx + r * 1.3 * t, teto - r * 1.5 + (r * 1.84) * t);
        GX.stroke();
      }
      break;
  }
}
