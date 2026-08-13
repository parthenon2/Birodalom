/* =======================================================================
   26/B. FOTÓMÓD

   A felület eltűnik, a kamera szabadon jár, a képet pedig el lehet menteni.
   A játék közben megáll — így nyugodtan be lehet állítani a képet.

   Belépés: F billentyű vagy a gyorssáv gombja. Kilépés: Esc vagy F.
   ===================================================================== */
function photoMode(be){
  G.photo=(be===undefined)?!G.photo:!!be;
  if(document.body&&document.body.classList&&document.body.classList.toggle)
    document.body.classList.toggle('photo',G.photo);
  const bar=$('photoBar');
  if(bar&&bar.classList&&bar.classList.toggle) bar.classList.toggle('on',G.photo);
  if(G.photo){
    G.sel=[]; G.selBuild=null; G.place=null;
    toast(T('uzFotomod'));
  }
  syncUI();
}
/* A pillanatnyi kép mentése. A vászon tartalmát adjuk le PNG-ként. */
function photoSave(){
  try{
    const nev='birodalom-'+(NATIONS[G.nation]?NATIONS[G.nation].name.toLowerCase():'kep')
      +'-'+Math.floor(G.t)+'mp.png';
    cv.toBlob(b=>{
      if(!b) return;
      const a=document.createElement('a');
      a.href=URL.createObjectURL(b);
      a.download=nev;
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),4000);
      toast(T('uzKepMentve')+': '+nev);
      SFX.play('ready',0.8);
    },'image/png');
  }catch(e){ toast(T('uzKepNemSikerult')); }
}
