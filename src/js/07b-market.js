/* =======================================================================
   7/B. PIAC

   Nyersanyagcsere aranyért. Az árfolyam mozog: amiből sokat adsz el, annak
   esik az ára; amiből sokat veszel, annak nő. Az árak lassan visszatérnek
   az alapszinthez, tehát türelemmel jobb üzletet köthetsz.

   A piac nem ingyen dolgozik: eladásnál kevesebbet kapsz, mint amennyiért
   ugyanazt megvennéd. Ez a rés a haszna.
   ===================================================================== */

const TRADE_UNIT=100;            // ennyi nyersanyagot cserélünk egyszerre
const TRADE_SELL=55;             // 100 egységért ennyi arany alapáron
const TRADE_BUY=95;              // 100 egység ennyi aranyba kerül
const TRADE_STEP=0.05;           // egy üzlet ennyivel mozdítja az árat
const TRADE_MIN=0.45, TRADE_MAX=2.2;
const TRADE_RES=['wood','stone','food','coal'];
/* A piac nyersanyagnevei. Kalózvilágban a kő helyén rum áll, ezért a
   nevet mindig a resName() adja, nem rögzített szöveg. */
function tradeNev(r){ return (typeof resName==='function')?resName(r):r; }

function marketInit(){
  G.prices={wood:1,stone:1,food:1,coal:1};
}
function hasMarket(owner){
  return G.builds.some(b=>!b.dead&&b.owner===owner&&b.done&&BUILDS[b.type].market);
}
function priceOf(res){
  if(!G.prices) marketInit();
  return G.prices[res]||1;
}
function sellPrice(res){ return Math.max(1,Math.round(TRADE_SELL*priceOf(res))); }
function buyPrice(res){  return Math.max(1,Math.round(TRADE_BUY *priceOf(res))); }

function sellRes(res){
  if(!hasMarket(0)){ toast(T('uzPiacKell')); SFX.play('deny'); return; }
  if((G.res[res]||0)<TRADE_UNIT){ toast(T('uzNincsEleg')+' '+tradeNev(res).toLowerCase()+'.'); SFX.play('deny'); return; }
  const ar=sellPrice(res);
  G.res[res]-=TRADE_UNIT;
  G.res.gold+=ar;
  G.earned.gold=(G.earned.gold||0)+ar;
  G.prices[res]=Math.max(TRADE_MIN, priceOf(res)*(1-TRADE_STEP));
  toast(TRADE_UNIT+' '+tradeNev(res).toLowerCase()+' eladva '+ar+' '+T('uzAranyert')+'.');
  SFX.play('click'); syncUI();
}
function buyRes(res){
  if(!hasMarket(0)){ toast(T('uzPiacKell')); SFX.play('deny'); return; }
  const ar=buyPrice(res);
  if((G.res.gold||0)<ar){ toast(T('uzNincsAranyad')+': '+ar+' kellene.'); SFX.play('deny'); return; }
  G.res.gold-=ar;
  G.res[res]=(G.res[res]||0)+TRADE_UNIT;
  G.prices[res]=Math.min(TRADE_MAX, priceOf(res)*(1+TRADE_STEP));
  toast(TRADE_UNIT+' '+tradeNev(res).toLowerCase()+' '+T('uzMegveve')+' '+ar+' aranyért.');
  SFX.play('click'); syncUI();
}
/* Az árak lassan visszahúzódnak az alapszintre — a piac emlékezete rövid. */
function marketTick(dt){
  if(!G.on) return;
  if(!G.prices) marketInit();
  for(const r of TRADE_RES){
    const p=G.prices[r];
    G.prices[r]=p+(1-p)*0.02*dt;
  }
}
