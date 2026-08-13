/* =======================================================================
   0/E. TÁROLÓ

   A játék három dolgot őriz meg a játszmák között: a mentett állást, a
   beállításokat (gyorsbillentyűk, nyelv, szerver címe) és a
   teljesítményeket. Eddig ezek mind a böngésző `localStorage`-ában
   ültek.

   Ez böngészőben rendben van, ASZTALI ALKALMAZÁSBAN viszont zavaró:

     · a mentés a böngészőmotor adatai közt van, nem fájlként
     · takarításkor vagy újratelepítéskor eltűnhet
     · nem lehet átmásolni másik gépre, és nem lehet biztonsági másolat

   Innentől ha az asztali burok jelen van (`window.birodalom.tarolo`),
   minden VALÓDI FÁJLBA kerül a felhasználói mappába. Böngészőben marad a
   localStorage — ott nincs is más lehetőség.

   A felület azonos a localStorage-éval, hogy a hívó kódot ne kelljen
   átírni: tarolIr / tarolOlvas / tarolTorol.
   ===================================================================== */

function taroloHid(){
  return (typeof window !== 'undefined' && window.birodalom && window.birodalom.tarolo)
    ? window.birodalom.tarolo : null;
}
/* Fájlba mentünk-e? A beállításokban és a naplóban is ezt írjuk ki. */
function taroloFajlba(){ return !!taroloHid(); }

function tarolIr(kulcs, ertek){
  const h = taroloHid();
  if(h){ try{ return !!h.ir(kulcs, ertek); }catch(e){} return false; }
  try{ localStorage.setItem(kulcs, ertek); return true; }catch(e){ return false; }
}
function tarolOlvas(kulcs){
  const h = taroloHid();
  if(h){ try{ return h.olvas(kulcs); }catch(e){ return null; } }
  try{ return localStorage.getItem(kulcs); }catch(e){ return null; }
}
function tarolTorol(kulcs){
  const h = taroloHid();
  if(h){ try{ h.torol(kulcs); return true; }catch(e){ return false; } }
  try{ localStorage.removeItem(kulcs); return true; }catch(e){ return false; }
}
/* A mentésmappa megnyitása a fájlkezelőben. Böngészőben nincs mit
   megnyitni, ilyenkor false-szal térünk vissza. */
function taroloMappaNyit(){
  const h = taroloHid();
  if(!h || !h.mappa) return false;
  try{ h.mappa(); return true; }catch(e){ return false; }
}

/* --- ÁTKÖLTÖZTETÉS ---
   Aki eddig böngészőből játszott, majd áttért az asztali alkalmazásra, ne
   veszítse el a mentését. Az első asztali indításnál átemeljük, amit a
   localStorage-ban találunk — de csak akkor, ha a fájl még nem létezik,
   nehogy egy régi böngészős állás felülírja a frisset. */
const TAROLO_KULCSOK = ['birodalom_save','birodalom_ach','birodalom_seen',
                        'birodalom_bill','birodalom_lang','birodalom_netcim'];
function taroloAtkoltoztet(){
  if(!taroloFajlba()) return 0;
  let db = 0;
  for(const k of TAROLO_KULCSOK){
    let regi = null;
    try{ regi = localStorage.getItem(k); }catch(e){}
    if(regi === null || regi === undefined) continue;
    if(tarolOlvas(k) !== null) continue;        // a fájl erősebb
    if(tarolIr(k, regi)) db++;
  }
  return db;
}
if(typeof window !== 'undefined') {
  try{ taroloAtkoltoztet(); }catch(e){}
}
