/* =======================================================================
   6/D. TEREP — magasság, mocsár, sűrű erdő

   A térkép eddig díszlet volt: egyenletes zöld, amin mindenki ugyanúgy
   mozgott és ugyanolyan messzire látott. Ez a réteg ellenféllé teszi.

   Három dolgot vezet be, mind ugyanazon a 32 pixeles cellarácson, amin a
   víz, a szikla és a köd is él — így a négy rendszer együtt tud dolgozni,
   és nem kell külön keresgélni.

     MAGASSÁG (0–3)
       A dombon állva messzebb LÁTSZ és messzebb LŐSZ. Ez egyetlen
       szabály, de átírja a taktikát: hirtelen számít, hol állsz. A
       felfelé menet lassabb is, tehát a magaslat megtartható.

     MOCSÁR
       Mély fekvésű, vízhez közeli cellák. Lassít, és a látótávolságot is
       rontja — a párás mélyföldön nem látni messzire.

     SŰRŰ ERDŐ
       Ahol sok a fa. Lassít, takar (kisebb látótáv), viszont
       védelmet ad: aki benne áll, nehezebben található el.

   MIÉRT DETERMINISZTIKUS?
   Mert a szimulációt érinti — a sebességet és a lőtávot. A mezők a
   világ létrehozásakor, a SZIMULÁCIÓS MAGBÓL készülnek, és onnantól
   csak olvassuk őket. Így minden gépen ugyanaz a domb ugyanott van.
   ===================================================================== */

/* A hatások mértéke. Szándékosan visszafogott: a terep befolyásolja a
   csatát, de nem dönti el helyette. */
const MAGAS_LATAS  = 0.13;   // szintenként ennyivel nő a látótáv
const MAGAS_LOTAV  = 0.10;   // szintenként ennyivel nő a lőtáv
const MAGAS_LASSU  = 0.07;   // szintenként ennyivel lassabb a felfelé menet
const MOCSAR_SEB   = 0.62;   // mocsárban ennyiszeres a sebesség
const MOCSAR_LATAS = 0.80;
const ERDO_SEB     = 0.82;
const ERDO_LATAS   = 0.78;
const ERDO_VEDELEM = 0.85;   // erdőben ennyiszeres az elszenvedett sebzés

const TEREP_SIMA = 0, TEREP_MOCSAR = 1, TEREP_ERDO = 2;

function terepIdx(x, y){
  const cx = Math.floor(x / FOG_CELL), cy = Math.floor(y / FOG_CELL);
  if(cx < 0 || cy < 0 || cx >= FW || cy >= FH) return -1;
  return cy * FW + cx;
}
function magasAt(x, y){
  if(!G.magas) return 0;
  const i = terepIdx(x, y);
  return i >= 0 ? G.magas[i] : 0;
}
function terepAt(x, y){
  if(!G.terep) return TEREP_SIMA;
  const i = terepIdx(x, y);
  return i >= 0 ? G.terep[i] : TEREP_SIMA;
}

/* --- A HATÁSOK ---
   Mindegyik egyetlen szorzót ad vissza, hogy a hívó oldalon egy
   szorzásnál többet ne kelljen érteni. */
function terepLatas(x, y){
  let m = 1 + magasAt(x, y) * MAGAS_LATAS;
  const t = terepAt(x, y);
  if(t === TEREP_MOCSAR) m *= MOCSAR_LATAS;
  else if(t === TEREP_ERDO) m *= ERDO_LATAS;
  return m;
}
function terepLotav(x, y){
  return 1 + magasAt(x, y) * MAGAS_LOTAV;
}
/* A sebesség a CÉLCELLA terepétől és az emelkedőtől függ. Lefelé menet
   nem gyorsít: a lejtőn rohanni sem könnyebb, csak veszélyesebb. */
function terepSebesseg(x, y, honnanX, honnanY){
  let m = 1;
  const t = terepAt(x, y);
  if(t === TEREP_MOCSAR) m *= MOCSAR_SEB;
  else if(t === TEREP_ERDO) m *= ERDO_SEB;
  if(honnanX !== undefined){
    const emelkedo = magasAt(x, y) - magasAt(honnanX, honnanY);
    if(emelkedo > 0) m *= Math.max(0.55, 1 - emelkedo * MAGAS_LASSU);
  }
  return m;
}
function terepVedelem(x, y){
  return terepAt(x, y) === TEREP_ERDO ? ERDO_VEDELEM : 1;
}

/* =======================================================================
   A TEREP LÉTREHOZÁSA

   A magasság két, egymásra rakott zajrétegből áll: néhány nagy, lankás
   dombhát, fölötte apróbb hullámzás. Így nem lesz se lapos, se kockás.

   A sziklák köré magasabb terepet teszünk — a hegy lába természetesen
   emelkedik —, a víz köré alacsonyabbat.
   ===================================================================== */
function genTerep(){
  const N = FW * FH;
  const mag = G.magas = new Uint8Array(N);
  const ter = G.terep = new Uint8Array(N);

  /* Néhány dombközéppont a szimulációs magból. A számuk a térkép
     méretével nő, hogy a nagy pályák se legyenek üresek. */
  /* Hány domb? Az első kimérésnél négy volt, és a térkép 92%-a sík
     maradt — a magaslat így csak elvi lehetőség lett volna, a játékos
     sosem találkozik vele. Most jóval sűrűbben és nagyobb sugárral. */
  const db = Math.max(10, Math.round((FW * FH) / 700));
  const dombok = [];
  for(let i = 0; i < db; i++){
    dombok.push({
      x: srange(0, FW), y: srange(0, FH),
      r: srange(9, 26),                       // cellában mért sugár
      h: srange(0.6, 1.1)
    });
  }

  for(let cy = 0; cy < FH; cy++){
    for(let cx = 0; cx < FW; cx++){
      const i = cy * FW + cx;
      let h = 0;
      for(const d of dombok){
        const dx = cx - d.x, dy = cy - d.y;
        const t = Math.hypot(dx, dy) / d.r;
        if(t < 1) h += d.h * (1 - t * t);     // lágy, gömbölyű lanka
      }
      /* Apró hullámzás, hogy ne legyen műanyagsima. Rácshelyzetből
         számolt álvéletlen: minden gépen ugyanaz, és nem fogyasztja a
         szimulációs magot. */
      const zaj = (((cx * 73856093) ^ (cy * 19349663)) >>> 0) % 1000 / 1000;
      h += zaj * 0.28;

      /* A küszöbök úgy vannak beállítva, hogy a térkép nagyjából fele
         legyen sík, negyede enyhe lanka, a maradék domb és magaslat. Így
         a magasság valódi tényező, de nem lesz belőle holdbéli táj. */
      let szint = h < 0.34 ? 0 : (h < 0.62 ? 1 : (h < 0.98 ? 2 : 3));

      /* A hegy lába emelkedik, a víz partja süllyed. */
      if(G.rock && G.rock[i]) szint = 3;
      if(G.water && G.water[i]) szint = 0;
      mag[i] = szint;
    }
  }

  /* MOCSÁR: mély fekvésű, vízhez közeli szárazföld. A partot magát nem
     tesszük mocsárrá — az a kikötők helye. */
  if(G.water){
    for(let cy = 1; cy < FH - 1; cy++){
      for(let cx = 1; cx < FW - 1; cx++){
        const i = cy * FW + cx;
        if(G.water[i] || (G.rock && G.rock[i])) continue;
        if(mag[i] > 0) continue;
        let viz = 0;
        for(let dy = -3; dy <= 3; dy++) for(let dx = -3; dx <= 3; dx++){
          const nx = cx + dx, ny = cy + dy;
          if(nx < 0 || ny < 0 || nx >= FW || ny >= FH) continue;
          if(G.water[ny * FW + nx]) viz++;
        }
        /* Elég víz a közelben, de ne közvetlenül a parton. */
        if(viz >= 4 && viz <= 16) ter[i] = TEREP_MOCSAR;
      }
    }
  }
  return { dombok: db };
}

/* SŰRŰ ERDŐ: a fa-lelőhelyek sűrűsége alapján, MIUTÁN a nyersanyagok
   kikerültek a térképre. Ezért külön lépés — a genTerep-ben még nem
   tudnánk, hol vannak a fák. */
function genErdoSuruseg(){
  if(!G.terep || !G.nodes) return 0;
  const szamlalo = new Uint8Array(FW * FH);
  for(const n of G.nodes){
    if(n.type !== 'wood') continue;
    const i = terepIdx(n.x, n.y);
    if(i >= 0 && szamlalo[i] < 255) szamlalo[i]++;
  }
  let db = 0;
  for(let cy = 1; cy < FH - 1; cy++){
    for(let cx = 1; cx < FW - 1; cx++){
      const i = cy * FW + cx;
      if(G.terep[i] !== TEREP_SIMA) continue;
      /* A cella és a szomszédjai együtt: így összefüggő erdőfolt lesz,
         nem szórvány. */
      let s = 0;
      for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++)
        s += szamlalo[(cy + dy) * FW + (cx + dx)];
      if(s >= 5){ G.terep[i] = TEREP_ERDO; db++; }
    }
  }
  return db;
}
