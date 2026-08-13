/* =======================================================================
   29/C. OKTATÓMÓD

   Vezetett első játszma: lépésről lépésre elmagyarázza az alapokat, és
   megvárja, amíg tényleg megcsinálod. Nincs időnyomás, nincs ellenség
   rohama az első percekben.

   Minden lépés két dologból áll: mit mondunk, és miből látjuk, hogy kész.
   ===================================================================== */
const TUTOR=[
 {cim:'Üdvözöllek a Birodalomban',
  szoveg:'A célod egy birodalom felépítése a 15. századtól a 20.-ig. Kezdjük a legelején.<br><br>'
        +'<b>Húzz egy keretet</b> a jobbágyaid köré, vagy kattints rájuk egyenként.',
  kesz:()=>G.sel.some(u=>!u.dead&&u.role==='worker')},

 {cim:'Fát a jobbágyoknak',
  szoveg:'A kijelölt jobbágyokkal <b>kattints jobb gombbal egy fára</b>. '
        +'Kivágják, és a főhadiszállásra hordják.<br><br>'
        +'A fa a legfontosabb nyersanyag: majdnem minden ebből épül.',
  kesz:()=>G.units.some(u=>!u.dead&&u.owner===0&&u.role==='worker'
           &&u.order&&u.order.type==='gather'&&u.order.res==='wood')},

 {cim:'Építs majorságot',
  szoveg:'A sereg eszik. Élelem nélkül a katonáid legyengülnek.<br><br>'
        +'Két majorság már áll a bázisodon — építs mellé <b>még egyet</b>.<br><br>'
        +'Kijelölt jobbággyal nyomd meg az <b>F</b> billentyűt (vagy a Majorság gombot), '
        +'majd kattints oda, ahová építeni akarod.',
  /* A bázison induláskor KÉT majorság áll, ezért a harmadikat várjuk —
     különben a lépés magától teljesülne, és a játékos nem tanulna belőle. */
  kesz:()=>G.builds.filter(b=>!b.dead&&b.owner===0&&b.type==='farm').length>=3},

 /* A kezdőbázis HÉT jobbággyal és HÁROM katonával indul (foundBase).
    A régi feltételek ötnél, illetve egyetlen katonánál teljesültek, tehát
    ez a két lépés magától kipipálódott, mielőtt a játékos bármit tett
    volna — a doboz átugrott rajtuk. A küszöb ezért a kezdőállományhoz
    képest kér EGY újat. */
 {cim:'Több jobbágy kell',
  szoveg:'Minél többen dolgoznak, annál gyorsabban nő a birodalmad.<br><br>'
        +'Jelöld ki a <b>főhadiszállást</b>, és képezz ki egy új jobbágyot.',
  kesz:()=>G.units.filter(u=>!u.dead&&u.owner===0&&u.role==='worker').length>=8},

 {cim:'Kaszárnya és katonák',
  szoveg:'Az ellenség előbb-utóbb megérkezik. A kaszárnyád már áll a bázison.<br><br>'
        +'Jelöld ki a <b>kaszárnyát</b>, és képezz ki benne egy új katonát.',
  kesz:()=>G.units.filter(u=>!u.dead&&u.owner===0&&
           (u.role==='melee'||u.role==='ranged'||u.role==='spear')).length>=4},

 {cim:'Harci állás és alakzat',
  szoveg:'A sereged nem csak menetel: eldöntheted, hogyan viselkedjen.<br><br>'
        +'Jelöld ki a katonáidat, és próbáld ki a <b>Tartsd a vonalat</b> állást '
        +'(2 billentyű), majd az <b>Ék</b> alakzatot (8).',
  kesz:()=>G.units.some(u=>!u.dead&&u.owner===0&&u.stance==='hold')
        ||G.formation==='wedge'},

 {cim:'Korszakváltás',
  szoveg:'Ha elég nyersanyagod van, előreléphetsz a következő századba: '
        +'új egységek, új épületek, erősebb sereg.<br><br>'
        +'Nyomd meg az <b>E</b> billentyűt, vagy a korszakdobozt.',
  kesz:()=>G.age>=1},

 {cim:'Készen állsz',
  szoveg:'Ennyi az alap. Ami még vár rád:<br><br>'
        +'• <b>Kovácsműhely</b> — fegyver és páncél<br>'
        +'• <b>Akadémia</b> — a birodalom fejlesztései<br>'
        +'• <b>Kikötő</b> — hajók és kereskedelem<br>'
        +'• <b>Kórház</b> — gyógyítás és a hősöd visszahívása<br><br>'
        +'A hadjáratban nyolc nemzet története vár. Sok szerencsét!',
  kesz:()=>false}
];

function tutorStart(){
  G.tutor={i:0, t:0};
  tutorShow();
}
function tutorShow(){
  const box=$('tutorBox');
  if(!box||!box.classList) return;
  const t=G.tutor;
  if(!t||t.i>=TUTOR.length){ box.classList.remove('on'); return; }
  const l=TUTOR[t.i];
  box.classList.add('on');
  const c=$('tutorTitle'), s=$('tutorText'), n=$('tutorStep');
  if(c) c.textContent=tutorCim(t.i,l.cim);
  if(s) s.innerHTML=tutorSzoveg(t.i,l.szoveg);
  if(n) n.textContent=(t.i+1)+' / '+TUTOR.length;
}
function tutorNext(){
  if(!G.tutor) return;
  G.tutor.i++;
  if(G.tutor.i>=TUTOR.length){ tutorEnd(); return; }
  SFX.play('ready',0.7);
  tutorShow();
}
function tutorEnd(){
  G.tutor=null;
  const box=$('tutorBox');
  if(box&&box.classList) box.classList.remove('on');
  toast(T('uzOktatoVege'));
}
/* Másodpercenként megnézzük, teljesült-e a lépés. */
function tutorTick(dt){
  if(!G.tutor||!G.on) return;
  G.tutor.t+=dt;
  if(G.tutor.t<0.5) return;
  G.tutor.t=0;
  const l=TUTOR[G.tutor.i];
  if(!l) return;
  try{ if(l.kesz()) tutorNext(); }catch(e){}
}
