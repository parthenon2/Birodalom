/* =======================================================================
   22/C. URALKODÓ BEMUTATÁSA

   A játszma elején nagyban megjelenik az uralkodó arcképe, mellette a
   neve, kora és rövid életrajza — hogy tudd, kinek a nevében játszol.
   ===================================================================== */
let showIntroRepaint=null;
function showIntro(nationKey,age,after){
  const el=$('intro');
  if(!el||!el.classList){ if(after) after(); return; }
  const n=NATIONS[nationKey];
  const b=(typeof bioSzoveg==='function')?bioSzoveg(nationKey,age)
          :((BIOS[nationKey]||{})[age]||{});
  $('introNation').textContent=(allamForma(nationKey,age)||nemzetNev(nationKey))+' · '+korszakNev(age);
  $('introName').textContent=uralkodoNev(nationKey,age);
  $('introTitle').textContent=n.titles[age];
  $('introMeta').textContent=(b.y?b.y+' · ':'')+(b.k||'');
  $('introBio').textContent=b.t||'';
  const bn=BONUS[nationKey];
  $('introBonus').innerHTML=bn?('<b>'+bn.title+'</b> — '+bn.text):'';
  // nagy arckép: ugyanaz a rajz, mint a sarokban, csak nagyban
  // Nagy arckép: a beépített festményt vágjuk körbe. Ha nincs, a sarokban
  // használt rajzolt portrét nagyítjuk fel.
  // A festmény betöltése aszinkron: ha még nincs kész, a kép megérkezésekor
  // újrarajzoljuk. Enélkül a régi, rajzolt portré maradna a helyén.
  const c=$('introPortrait');
  const fest=()=>{
    if(!c||!c.getContext) return;
    const g=c.getContext('2d'), S=c.width;
    g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,S,S);
    g.save(); g.beginPath(); g.arc(S/2,S/2,S/2,0,TAU); g.clip();
    const im=(typeof rulerImageRaw==='function')?rulerImageRaw(nationKey,age):null;
    if(im&&im.complete&&im.naturalWidth){
      const w=im.naturalWidth, h=im.naturalHeight, k=Math.max(S/w,S/h);
      g.drawImage(im,(S-w*k)/2,(S-h*k)/2,w*k,h*k);
    }else{
      // Amíg a festmény tölt: semleges sötét háttér, nem rajzolt portré
      const bg=g.createRadialGradient(S/2,S*0.36,10,S/2,S/2,S*0.75);
      bg.addColorStop(0,'#3a3126'); bg.addColorStop(1,'#161210');
      g.fillStyle=bg; g.fillRect(0,0,S,S);
      if(im&&im.addEventListener) im.addEventListener('load',fest,{once:true});
    }
    g.restore();
  };
  fest();
  showIntroRepaint=fest;                         // kívülről is újrarajzolható
  el.classList.add('on');
  const go=$('introGo');
  go.onclick=()=>{
    el.classList.remove('on');
    SFX.init(); SFX.play('click');
    if(after) after();
  };
  announce(uralkodoNev(nationKey,age)+', '+n.titles[age]+'. '+(b.t||''));
}
