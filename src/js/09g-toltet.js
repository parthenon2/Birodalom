/* =======================================================================
   09/G. TÖLTETEK

   Ugyanabból az ágyúból három félét lehet lőni. A választás a hajóhad
   egészére vonatkozik, és menet közben váltható:

     GOLYÓ   — a hajótestet töri. Ezzel lehet elsüllyeszteni.
     LÁNCOS  — az árbocot és a kötélzetet tépi: a testet alig sebzi,
               viszont a megsérült vitorlázat LASSÍTJA a hajót. Ezzel
               lehet megállítani a menekülőt.
     KARTÁCS — a fedélzeten söpör végig: a testet szinte nem bántja,
               a legénységet viszont sokszorosan fogyasztja. Ezzel lehet
               előkészíteni az átszállást.

   A vitorla lassan javul magától, ha nem éri újabb találat.
   ===================================================================== */

const TOLTETEK=[
  {k:'golyo',  nev:T('tGolyo'),   mit:T('tGolyoAl'),        test:1.00, legeny:1.0, vitorla:0},
  {k:'lancos', nev:T('tLancos'),  mit:T('tLancosAl'), test:0.35, legeny:0.5, vitorla:1},
  {k:'kartacs',nev:T('tKartacs'), mit:T('tKartacsAl'),  test:0.25, legeny:3.5, vitorla:0}
];
function toltetAdat(k){
  for(const t of TOLTETEK) if(t.k===k) return t;
  return TOLTETEK[0];
}
function toltetValaszt(k){
  if(typeof logAdd==='function'&&logAdd('toltet', k)) return;
  G.toltet=k;
  const t=toltetAdat(k);
  toast(t.nev+' — '+t.mit);
  SFX.play('click');
  if(typeof syncUI==='function'){ G.btnSig=''; syncUI(); }
}
/* A lövő fél töltete. A bot mindig golyót lő. */
function toltetOf(owner){
  return (owner===0)?(G.toltet||'golyo'):'golyo';
}

/* A vitorla sérülése lassít, és lassan javul. */
function sailTick(dt){
  if(!G.on) return;
  for(const u of G.units){
    if(u.dead||!u.naval||!u.sailDmg) continue;
    u.sailDmg=Math.max(0,u.sailDmg-dt*0.035);   // kb. fél perc alatt kifut
  }
}
function sailMul(u){
  return u.sailDmg?Math.max(0.35,1-u.sailDmg*0.6):1;
}
