/* =======================================================================
   0/D. MAGVAS VÉLETLEN ÉS ELLENŐRZŐ ÖSSZEG

   A többjátékos mód alapja: a szimulációnak TÖKÉLETESEN kiszámíthatónak
   kell lennie. Ha két gép ugyanabból a magból indul és ugyanazokat a
   parancsokat kapja, a világuknak az utolsó képpontig egyeznie kell.

   Ezért KÉTFÉLE véletlen van a játékban, és a kettőt sosem szabad
   összekeverni:

     srnd()  — SZIMULÁCIÓS. Magból fut, minden gépen ugyanazt adja.
               Ezt használja minden, ami a világ állapotát érinti:
               harci szórás, bot döntései, időjárás, események, ostrom.

     rnd(), Math.random() — LÁTVÁNY. Szabadon futhat, mert semmit nem
               befolyásol: füstpamacsok helye, fűszálak dőlése, szikrák.
               Azért maradhat szabad, mert a két gép KÜLÖNBÖZŐ számú
               képkockát rajzol — ha ez a magot fogyasztaná, azonnal
               szétcsúsznának a világok.

   Az ellenőrző összeg (checksum) néhány másodpercenként összehasonlítható
   a másik géppel: ha eltér, azonnal kiderül a szétcsúszás.
   ===================================================================== */

/* Mulberry32: gyors, jó eloszlású, 32 bites állapottal. Az állapot a
   játékállásban utazik, ezért a mentés-betöltés is pontos. */
function simSeed(mag){
  G.rng=(mag>>>0)||1;
  G.rngHivas=0;
}
function srnd(){
  if(G.rng===undefined) simSeed(0x9E3779B9);
  G.rngHivas=(G.rngHivas||0)+1;
  let t=(G.rng+=0x6D2B79F5)>>>0;
  t=Math.imul(t^(t>>>15), t|1);
  t^=t+Math.imul(t^(t>>>7), t|61);
  return ((t^(t>>>14))>>>0)/4294967296;
}
/* Tartományok — a látványbeli rnd() párja, csak magvasan. */
function srange(a,b){ return a+srnd()*(b-a); }
function schance(p){ return srnd()<p; }
/* Egész tartomány, a látványbeli rndInt() magvas párja. */
function srangeInt(a,b){ return a+Math.floor(srnd()*(b-a+1)); }

/* ELLENŐRZŐ ÖSSZEG.

   A világ állapotának rövid ujjlenyomata. Két gép ezt cseréli időnként:
   ha eltér, a szimulációk szétcsúsztak, és a játékot meg kell állítani.
   Csak azt vesszük bele, ami a JÁTÉKMENETET érinti — a látvány nem. */
function simChecksum(){
  let h=0x811C9DC5;
  const be=(x)=>{ h^=(x|0); h=Math.imul(h,0x01000193)>>>0; };
  be(Math.round(G.t*10));
  be(G.rngHivas||0);
  be(G.rng||0);
  /* MINDEN fél készlete és korszaka beleszámít, nem csak a sajátod.
     Korábban a G.res-t néztük, vagyis a helyi játékosét — így egy olyan
     szétcsúszás, ami csak a másik fél gazdaságát érintette, észrevétlen
     maradt volna, és csak percekkel később, a seregek méretén ütött volna
     ki. Minél korábban derül ki a baj, annál könnyebb megtalálni. */
  if(G.oldalak&&G.oldalak.length){
    for(const o of G.oldalak){
      be(o.i); be(o.age|0);
      for(const r of ['wood','stone','gold','food','coal']) be(Math.round((o.res&&o.res[r])||0));
    }
  }else{
    for(const r of ['wood','stone','gold','food','coal']) be(Math.round(G.res[r]||0));
  }
  for(const u of G.units){
    if(u.dead) continue;
    be(u.id); be(Math.round(u.x)); be(Math.round(u.y));
    be(Math.round(u.hp)); be(u.owner); be(Math.round(u.crew||0));
  }
  for(const b of G.builds){
    if(b.dead) continue;
    be(b.id); be(Math.round(b.x)); be(Math.round(b.y));
    be(Math.round(b.hp)); be(b.owner); be(b.done?1:0);
  }
  return (h>>>0).toString(16).padStart(8,'0');
}

/* =======================================================================
   BIZTOSAN AZONOS SZÖGFÜGGVÉNYEK

   A `Math.sin`, `Math.cos`, `Math.atan2` eredménye MOTORONKÉNT eltérhet
   az utolsó bitekben. A Chrome (V8) és a Safari (JavaScriptCore) más
   közelítést használ — és mivel iPhone-on MINDEN böngésző WebKitet
   futtat, egy telefon és egy asztali gép között ez szétcsúszást okozna.

   A négy alapművelet (+ − × ÷) viszont az IEEE 754 szabvány szerint
   BITRE azonos minden motoron. Ezért itt saját közelítést használunk,
   amely csak ezekből épül.

   A pontosság körülbelül egy a milliárdhoz — a játékban ez láthatatlan,
   viszont minden gépen ugyanaz.
   ===================================================================== */

const D_PI=3.141592653589793, D_2PI=6.283185307179586, D_HPI=1.5707963267948966;

/* Szinusz: tartományszűkítés, majd hetedfokú polinom a [-π/2, π/2] szakaszon. */
function dsin(x){
  if(!isFinite(x)) return NaN;
  // a szöget a [-π, π] szakaszra hozzuk
  let k=x*(1/D_2PI);
  k=k-Math.floor(k+0.5);           // Math.floor bitre pontos
  x=k*D_2PI;
  // tükrözés a [-π/2, π/2] szakaszra
  if(x>D_HPI) x=D_PI-x;
  else if(x<-D_HPI) x=-D_PI-x;
  const x2=x*x;
  // minimax együtthatók: |hiba| < 2e-10 a teljes szakaszon
  return x*(1
    + x2*(-0.16666666664773582
    + x2*( 0.008333333138366424
    + x2*(-0.00019840760984640802
    + x2*( 2.7523971740621233e-6
    + x2*(-2.386834616554672e-8))))));
}
function dcos(x){ return dsin(x+D_HPI); }

/* Arkusz tangens: [-1,1] szakaszon polinom, azon kívül a reciprokkal. */
function datan(x){
  const jel=(x<0)?-1:1;
  const a=x*jel;
  if(a>1) return jel*(D_HPI-datanSzukitett(1/a));
  return jel*datanSzukitett(a);
}
function datanSzukitett(a){
  const a2=a*a;
  return a*(0.9999999949
    + a2*(-0.3333314528
    + a2*( 0.1999355085
    + a2*(-0.1420889944
    + a2*( 0.1065626393
    + a2*(-0.0752896400
    + a2*( 0.0429096138
    + a2*(-0.0161657367
    + a2*( 0.0028662257)))))))));
}
function datan2(y,x){
  if(x===0){ return (y>0)?D_HPI:((y<0)?-D_HPI:0); }
  const a=datan(y/x);
  if(x>0) return a;
  return (y>=0)?(a+D_PI):(a-D_PI);
}
/* Hatványozás egész kitevőre — a Math.pow motoronként eltérhet. */
function dpow(alap,kitevo){
  if(kitevo===(kitevo|0)&&kitevo>=0&&kitevo<=32){
    let e=1;
    for(let i=0;i<kitevo;i++) e*=alap;
    return e;
  }
  return Math.pow(alap,kitevo);     // törtkitevő: ritka, és nem szimulációs
}
