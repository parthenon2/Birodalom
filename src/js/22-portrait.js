/* =======================================================================
   18. URALKODÓI PORTRÉ (kör alakú, korszak- és nemzetfüggő)
   ===================================================================== */
const pc=document.getElementById('portrait'), pctx=pc.getContext('2d');
/* A sarokban lévő arckép mindig a beépített festmény. A korábbi rajzolt
   portré kikerült: mind a 32 uralkodóhoz van kép, és amíg egy éppen
   töltődik, semleges korszakszínű háttér áll a helyén — nem egy másik,
   odaillőnek szánt rajz. */
/* Az arckép melletti szöveg: ki vagy, mi a címed, melyik korban, és mit
   tud a néped. Ezt eddig senki nem töltötte fel — a kezdő gondolatjelek
   maradtak a helyükön minden játszmában. */
function fillRulerText(){
  const n=NATIONS[G.nation];
  if(!n) return;
  const age=Math.min(3,G.age||0);
  const be=(id,szoveg)=>{ const e=$(id); if(e) e.textContent=szoveg; };
  be('rulerName',  uralkodoNev(G.nation,age)||nemzetNev(G.nation));
  be('rulerTitle', (n.titles&&n.titles[age])||'');
  be('rulerNation',allamForma(G.nation,age)||nemzetNev(G.nation));
  be('rulerBonus', (BONUS[G.nation]&&BONUS[G.nation].title)||'');
}
function drawPortrait(){
  fillRulerText();
  const S=176, n=NATIONS[G.nation], age=G.age;
  pctx.setTransform(1,0,0,1,0,0);
  pctx.clearRect(0,0,S,S);
  pctx.save();
  pctx.beginPath(); pctx.arc(S/2,S/2,S/2,0,TAU); pctx.clip();

  const im=(typeof rulerImage==='function')?rulerImage(G.nation,age):null;
  if(im){
    const w=im.naturalWidth, h=im.naturalHeight, k=Math.max(S/w,S/h);
    pctx.drawImage(im,(S-w*k)/2,(S-h*k)/2,w*k,h*k);
    pctx.fillStyle='rgba(0,0,0,.18)';                 // enyhe alsó árnyék
    pctx.fillRect(0,S*0.78,S,S*0.22);
  }else{
    // Töltés alatt: sötét, korszakhoz illő háttér a nemzet színével
    const bg=[['#4a3f2c','#1d1811'],['#3a3a4c','#161520'],
              ['#3d3a34','#171614'],['#3a4038','#141613']][age]||['#3a3a3a','#151515'];
    const g=pctx.createRadialGradient(S/2,S*0.36,10,S/2,S/2,S*0.75);
    g.addColorStop(0,bg[0]); g.addColorStop(1,bg[1]);
    pctx.fillStyle=g; pctx.fillRect(0,0,S,S);
    pctx.globalAlpha=.18; pctx.fillStyle=n.color;
    pctx.beginPath(); pctx.arc(S/2,S*0.44,S*0.32,0,TAU); pctx.fill();
    pctx.globalAlpha=1;
  }
  pctx.restore();
}

