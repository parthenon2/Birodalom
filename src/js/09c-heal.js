/* =======================================================================
   9/C. GYÓGYÍTÁS

   Kétféle van belőle:

     KÓRHÁZ   — a köré gyűlt saját egységeket lassan, egyszerre gyógyítja
                egy kis körben. Nem kell parancsot adni: aki odaáll,
                gyógyul.
     SEBÉSZ   — a fronton dolgozik: mindig a hozzá legközelebbi sebesültet
                keresi meg, odamegy, és talpra állítja. Ha ketten dolgoznak
                ugyanazon, a gyógyulás összeadódik — mindketten a saját
                ütemükkel adnak életerőt.

   A gyógyulás nem kelt életre halottat, és nem lép a maximum fölé.
   ===================================================================== */

// A gyógyítás gyorsaságát az akadémiai Gyógyszerkészlet emeli
function healMul(owner){
  return (typeof upgMul==='function') ? upgMul(owner,'medicine') : 1;
}

/* A kórház aurája: minden frissítéskor a körben lévő saját, sérült
   egységeknek ad egy keveset. */
function hospitalAura(b,dt){
  const d=BUILDS[b.type];
  if(!d||!d.heal||!b.done||b.dead) return;
  const R=d.healR||150, ero=val(d.heal,b.age)*healMul(b.owner)*dt;
  const R2=R*R;
  for(const u of G.units){
    if(u.dead||u.owner!==b.owner||u.hp>=u.maxHp) continue;
    const dx=u.x-b.x, dy=u.y-b.y;
    if(dx*dx+dy*dy>R2) continue;
    u.hp=Math.min(u.maxHp, u.hp + u.maxHp*0.01*ero);
    u.healedAt=G.t;                     // a rajzolás ebből tudja, hogy gyógyul
  }
}

/* A sebész munkája. Ha kapott parancsot, azt teljesíti; egyébként magától
   keresi a legközelebbi sebesültet. */
function updateMedic(u,dt){
  // parancsra mozgás: azt a főciklus intézi, mi csak gyógyítunk közben
  let cel=null, bd=1e9;
  const R=u.range||60, keres=R+220;
  for(const t of G.units){
    if(t.dead||t.owner!==u.owner||t===u) continue;
    if(t.hp>=t.maxHp-0.5) continue;
    const d=dist(u.x,u.y,t.x,t.y);
    if(d>keres) continue;
    // a súlyosabb sebesült előbbre való: a hiányzó életerő arányában
    const suly=d*(0.4+0.6*(t.hp/t.maxHp));
    if(suly<bd){ bd=suly; cel=t; }
  }
  u.healTarget=cel;
  if(!cel) return false;
  const d=dist(u.x,u.y,cel.x,cel.y);
  if(d>R){
    if(!u.order) navMove(u,cel.x,cel.y,dt);   // csak ha nincs saját parancsa
    return true;
  }
  u.face=Math.atan2(cel.y-u.y,cel.x-u.x);
  const ero=val(UNITS.medic.heal,u.age)*healMul(u.owner)*dt;
  cel.hp=Math.min(cel.maxHp, cel.hp+ero);
  cel.healedAt=G.t;
  u.healing=G.t;
  return true;
}
