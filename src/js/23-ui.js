/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   19. KEZELŐFELÜLET FRISSÍTÉSE
   ===================================================================== */
/* Elemkereső.

   Ha a keresett elem NINCS meg, egy ártalmatlan bábut adunk vissza a null
   helyett. Enélkül egyetlen törölt gomb megállítja az egész menüfelépítést:
   a `$('mImport').onclick=...` sor hibára fut, és utána egyetlen gomb sem
   kap eseménykezelőt — a játék elindul, a felület viszont halott marad.
   Pontosan ez történt, amikor kivettem a Betöltés fájlból gombot. */
const DUMMY_EL={
  style:{}, classList:{add(){},remove(){},toggle(){},contains(){return false;}},
  dataset:{}, children:[], firstChild:null,
  appendChild(){}, removeChild(){}, querySelector(){return null;},
  querySelectorAll(){return [];}, getAttribute(){return null;}, setAttribute(){},
  addEventListener(){}, removeEventListener(){}, focus(){}, blur(){}, click(){},
  set innerHTML(v){}, get innerHTML(){return '';},
  set textContent(v){}, get textContent(){return '';},
  set onclick(v){}, get onclick(){return null;},
  set disabled(v){}, get disabled(){return false;},
  set value(v){}, get value(){return '';},
  set className(v){}, get className(){return '';},
  set title(v){}, get title(){return '';},
  __hianyzik:true
};
const $=id=>document.getElementById(id)||DUMMY_EL;
let toastT=0;
function toast(msg){
  /* A TÁRSAK parancsai a te gépeden is lefutnak — a visszajelzésük
     viszont nem a te dolgod. „Nincs elég nyersanyag”, „Gyülekezőpont
     kijelölve”, „Kaszárnya épül”: ha ezeket az ő tetteik után is
     megkapnád, percenként több tucat idegen üzenet villogna a képernyőn,
     és a sajátjaid elvesznének köztük.

     A G.parancsFut jelzi, hogy épp naplózott parancsot hajtunk végre; ha
     közben a cselekvő nem te vagy, csendben maradunk. */
  if(G.parancsFut && typeof helyiFel==='function' && G.enId!==helyiFel()) return;
  const t=$('toast'); t.textContent=msg; t.classList.add('show'); toastT=3.4;
  announce(msg);
}

function buildButtons(){
  // A gombsor másodpercenként ötször épült újra, és minden alkalommal
  // kényszerített elrendezés-számítást okozott. Most csak akkor cseréljük,
  // ha tényleg változott valami: korszak, építési mód vagy megfizethetőség.
  // Mit lehet most csinálni? A panel a kijelöléshez igazodik: munkással
  // építeni, kaszárnyával/főhadiszállással képezni, akadémiával kutatni.
  // Kalózmódban nincs jobbágy: az építési lehetőségek mindig elérhetők,
  // hogy a szigetre kattintva rögtön lásd, mit emelhetsz oda.
  const hasWorker=G.sel.some(u=>!u.dead&&u.role==='worker')||!!G.pirate;
  const sb=G.selBuild;
  const canTrain=!!(sb&&!sb.dead&&sb.owner===ENID&&sb.done&&trainsOf(sb));
  const canRes=!!(sb&&!sb.dead&&sb.owner===ENID&&sb.done&&BUILDS[sb.type].research);
  const mine=!!(sb&&!sb.dead&&sb.owner===ENID);
  const needsWork=!!(mine&&(!sb.done||sb.hp<sb.maxHp-1));
  const sig=G.age+'|'+G.place+'|'+(G.offer?Math.floor(G.t):'')+'|'+(G.prices?Math.round(G.prices.wood*40)+''+Math.round(G.prices.stone*40)+''+Math.round(G.prices.food*40)+''+Math.round(G.prices.coal*40):'')+'|'+(hasWorker?'w':'')+(canTrain?'t':'')+(canRes?'r':'')
    +'|'+(mine?sb.id+sb.type+(needsWork?'n':'')+(demoArmed===sb?'!':''):'')+'|'
    +BUILD_ORDER.map(t=>(BUILDS[t].minAge>G.age?'x':(canPay(buildCost(t,G.age,ENID))?1:0))).join('')+'|'
    +ROLES.map(r=>canPay(unitCost(r,G.age,ENID))?1:0).join('')+((typeof heroAlive==='function'&&heroAlive(ENID))?'H':'')+'|'
    +UPG_KEYS.map(k=>(upgAvailable(k,0)?'':'x')+(G.upg[k]||0)+(canPay(upgCost(k,0))?'y':'n')).join('')
    +'|'+((sb&&BUILDS[sb.type])?(BUILDS[sb.type].research||''):'')
    /* A KIJELÖLÉS és az ALAKZAT is a felületen látszik, tehát az
       ujjlenyomatba is kell. Enélkül az alakzatgomb nem emelődött ki, és
       a panel néha meg sem jelent. */
    +'|'+(G.formation||'line')
    /* A HARCI ÁLLÁS az EGYSÉGEKEN él (`u.stance`), nem a G-ben. Az előző
       kísérletem `G.stance`-t tett az ujjlenyomatba — az viszont sosem
       változik, tehát a gomb ugyanúgy nem emelődött ki, mint az
       alakzatnál. Most a kijelölt egységek tényleges állását vesszük. */
    +'|'+(G.sel.length?G.sel.map(u=>u.stance||'a').join(''):'')
    +'|'+G.sel.length+(G.sel.length?('|'+G.sel[0].id+G.sel[0].role):'')
    +'|'+(G.sel.some(u=>!u.dead&&u.role!=='worker'&&!u.naval&&!u.air)?'h':'');
  if(sig===G.btnSig) return;
  G.btnSig=sig;
  /* Kalózvilágban a városmenü VÁLTJA KI a parancssávot: ott építesz és
     toborzol, a képernyő alján lévő sorok csak zavarnának. */
  /* Kalózvilágban a gyorssávból csak a menügomb marad: a bázisra ugrás,
     a sereg- és munkáskijelölés meg a parancstörlés ott értelmetlen, mert
     a szárazföldi egységek nem is látszanak. */
  /* Kalózvilágban a városmenü a kényelmes út, de a parancssáv építési sora
     is megmarad: ha a menü valamiért nem nyílik meg (például kicsi a
     koppintási célpont), akkor is lehessen építkezni. Egyetlen úton
     futó felület törékeny. */
  const stratMod=!!G.pirate;      // kalózmódban a városmenü épít, nem az alsó sáv
  const gyorsRejt=!!G.pirate;
  for(const id of ['btnBase','btnArmy','btnWork','btnStop']){
    const b=$(id);
    if(b&&b.style) b.style.display=gyorsRejt?'none':'';
  }
  $('grpBuild').style.display=(hasWorker&&!stratMod)?'block':'none';
  $('grpTrain').style.display=(canTrain&&!stratMod)?'block':'none';
  /* TÖLTETVÁLASZTÓ: csak akkor, ha ágyús hajót jelöltél ki. Ugyanabból az
     ágyúból három félét lehet lőni, és ez dönti el az összecsapást. */
  {
    const agyus=G.sel.some(u=>!u.dead&&u.naval&&u.guns>0);
    const ga=$('grpAmmo');
    if(ga&&ga.style) ga.style.display=agyus?'block':'none';
    if(agyus&&typeof TOLTETEK!=='undefined'){
      const sor=$('ammoRow');
      const sig=(G.toltet||'golyo');
      if(sor&&sor.getAttribute&&sor.getAttribute('data-sig')!==sig){
        if(sor.setAttribute) sor.setAttribute('data-sig',sig);
        sor.innerHTML='';
        for(const t of TOLTETEK){
          const b=document.createElement('button');
          b.className='btn'+((G.toltet||'golyo')===t.k?' on':'');
          b.innerHTML=t.nev+'<small>'+t.mit+'</small>';
          b.onclick=()=>toltetValaszt(t.k);
          sor.appendChild(b);
        }
      }
    }
  }
  $('grpUpg').style.display=canRes?'block':'none';
  $('grpSel').style.display=mine?'block':'none';
  // Terep: ha a kijelölt egység előnyös helyen áll, kiírjuk
  if(G.sel.length&&!G.selBuild){
    const t=G.sel.filter(u=>u.terrain)[0];
    const si=$('selInfo');
    if(t&&si&&si.textContent&&si.textContent.indexOf('—')>0)
      si.textContent+='  ·  '+T('ctTerep')+': '+t.terrain;
  }
  // Zsoldosajánlat doboza
  const ob=$('offerBox');
  if(ob&&ob.classList&&ob.classList.toggle){
    const o=G.offer;
    ob.classList.toggle('on',!!o);
    if(o&&o.type==='mercs'){
      const nev=unitName(o.szerep,G.age);
      $('offerText').innerHTML='<b>'+T('uzVandorloZsoldos')+'</b><br>'+o.db+'× '+nev+
        ' — '+T('uzAjanlkozik')+' <b>'+o.ar+' '+T('uzAranyert')+'</b>.';
      const bar=$('offerBar');
      if(bar&&bar.firstChild&&bar.firstChild.style)
        bar.firstChild.style.width=Math.max(0,100*(1-(G.t-o.t)/o.lejar))+'%';
    }
  }
  /* Piac: a kijelölt piacnál megjelenik az árfolyamtábla. Nyersanyagonként
     egy sor: mennyiért veszed, mennyiért adod. */
  const gm=$('grpMarket');
  if(gm&&gm.style){
    const piacKijelolve=!!(sb&&!sb.dead&&sb.owner===ENID&&sb.done&&BUILDS[sb.type].market);
    gm.style.display=piacKijelolve?'block':'none';
    if(piacKijelolve){
      const mr=$('marketRow');
      if(mr&&mr.appendChild){
        mr.innerHTML='';
        for(const r of TRADE_RES){
          const sor=document.createElement('div');
          sor.className='trade';
          const el=sellPrice(r), ve=buyPrice(r);
          const vanElég=(G.res[r]||0)>=TRADE_UNIT, vanArany=(G.res.gold||0)>=ve;
          sor.innerHTML='<span class="tn">'+tradeNev(r)+'</span>'
            +'<span class="tp">'+Math.round(priceOf(r)*100)+'%</span>';
          const be=document.createElement('button');
          be.textContent=T('piVetel')+' '+ve+'';
          be.className=vanArany?'':'no';
          be.onclick=()=>buyRes(r);
          const ki=document.createElement('button');
          ki.textContent='eladás '+el;
          ki.className=vanElég?'':'no';
          ki.onclick=()=>sellRes(r);
          sor.appendChild(be); sor.appendChild(ki);
          mr.appendChild(sor);
        }
      }
    }
  }

  /* Hős: ha nincs élő hősöd, de van kórházad, felajánljuk a visszahívást.
     A gomb a kórház kijelölésekor és a sereg kijelölésekor is látszik. */
  const gh=$('grpHero');
  if(gh&&gh.style){
    const elo=(typeof heroAlive==='function')?heroAlive(ENID):null;
    const vanKorhaz=G.builds.some(b=>!b.dead&&b.owner===ENID&&b.type==='hospital'&&b.done);
    /* A csoport eddig CSAK akkor látszott, ha a hős HALOTT (visszahívás).
       Most akkor is kell, ha él — mert onnantól van aktív képessége. */
    const ujraeleszt=(!elo&&vanKorhaz);
    gh.style.display=(ujraeleszt||elo)?'block':'none';
    {
      /* CSATAKIÁLTÁS. A gombon a visszaszámlálás is látszik: enélkül a
         játékos nem tudná, mikor nyomhatja újra. */
      const kb=$('btnKialtas');
      if(kb){
        kb.style.display=elo?'':'none';
        if(elo){
          const varo=(typeof kialtasVaro==='function')?kialtasVaro(ENID):0;
          const kesz=varo<=0;
          kb.className='btn'+(kesz?'':' no');
          kb.innerHTML=T('hosKialtas')+'<small>'+
            (kesz?T('hosKialtasKesz'):(Math.ceil(varo)+' mp'))+'</small>';
        }
      }
    }
    const b2=$('btnRevive');
    if(b2&&b2.style) b2.style.display=ujraeleszt?'':'none';
    if(ujraeleszt){
      const c=unitCost('hero',G.age,ENID); scaleCost(c,0.6);
      const b=$('btnRevive');
      if(b){
        b.className='btn'+(canPay(c)?'':' no');
        b.innerHTML=heroName(0,G.age)+' — '+T('kemVisszahivas')+'<small>'+costText(c)+'</small>';
      }
    }
  }
  // Kémkedés: felderítő kijelölésekor
  const gsp=$('grpSpy');
  if(gsp&&gsp.style){
    const kemek=G.sel.filter(u=>typeof canSpy==='function'&&canSpy(u));
    gsp.style.display=kemek.length?'block':'none';
    if(kemek.length){
      const b=$('btnSpy');
      const alcaban=kemek[0].disguise;
      if(b){
        b.className='btn'+(alcaban?' on':'');
        b.innerHTML=(alcaban?T('kemAlcaLe'):T('kemAlcaFel'))
          +' <kbd>Á</kbd><small>'
          +(alcaban?T('kemGyujtogatasAl'):T('kemNemLonek'))+'</small>';
      }
    }
  }
  // Alakzat: harcos egység kijelölésekor
  const gf=$('grpForm');
  if(gf&&gf.style){
    const van=G.sel.some(u=>!u.dead&&u.role!=='worker'&&!u.naval&&!u.air);
    gf.style.display=van?'block':'none';
    if(van){
      const gomb={line:'fmLine',wedge:'fmWedge',square:'fmSquare'};
      for(const k in gomb){
        const b=$(gomb[k]);
        if(b&&b.classList&&b.classList.toggle) b.classList.toggle('on',(G.formation||'line')===k);
      }
    }
  }
  // Harci állás: csak akkor látszik, ha harcos egység van kijelölve
  const harcosok=G.sel.filter(u=>!u.dead&&u.role!=='worker');
  const gs=$('grpStance');
  if(gs&&gs.style) gs.style.display=harcosok.length?'block':'none';
  if(harcosok.length){
    const most=harcosok[0].stance||'aggro';
    const gomb={aggro:'stAggro',hold:'stHold',flee:'stFlee'};
    for(const k in gomb){
      const b=$(gomb[k]);
      if(b&&b.classList&&b.classList.toggle) b.classList.toggle('on', harcosok.every(u=>(u.stance||'aggro')===k));
    }
  }
  // Kalózmódban jelezzük, hogy jobbágy nélkül is építhetsz
  if(G.pirate&&!G.sel.length&&!G.selBuild){
    const si=$('selInfo');
    if(si) si.textContent=T('uzKolonia');
  }
  // Csapatszállító: hány fő van a fedélzeten, és mennyi fér még
  const szall=G.sel.filter(u=>u.transport&&!u.dead);
  if(szall.length){
    let van=0, fer=0;
    for(const h of szall){ van+=(h.cargo&&h.cargo.length)||0; fer+=cargoCap(h.owner); }
    const si=$('selInfo');
    if(si) si.textContent=szall.length+'× '+T('szallitoAl')+' '+van+' / '+fer+
      ' '+T('szallitoKirak');
  }
  const cc=$('cmdClose');
  const showClose=!(G.pirate&&G.port)&&
    !!(G.place||G.wallDrag||G.atomAim||G.sel.length||G.selBuild);
  if(cc&&cc.classList&&cc.classList.toggle) cc.classList.toggle('on',showClose);
  const cb=$('cmdBox');
  if(cb&&cb.classList&&cb.classList.toggle) cb.classList.toggle('hasClose',showClose);
  layoutHud();                                   // a magasság a tartalommal együtt változik
  if(mine){
    const sr=$('selRow'); sr.innerHTML='';
    if(needsWork){
      const wb=document.createElement('button');
      wb.className='btn';
      wb.innerHTML=(sb.done?T('epJavitas'):T('epFolytatas'))
        +'<small>'+T('epMunkasokIde')+(sb.done?'':' — '+Math.floor(sb.prog*100)+'%')+'</small>';
      wb.onclick=sendBuilders;
      sr.appendChild(wb);
    }
    if(sb.type==='wall'&&sb.done){                     // falból kaput nyithatsz
      const gc=buildCost('gate',sb.age,ENID);
      const gb=document.createElement('button');
      gb.className='btn'+(canPay(gc)?'':' no');
      gb.innerHTML=T('epKapuNyitas')+'<small>'+costText(gc)+'</small>';
      gb.title=T('epKapuAl');
      gb.onclick=makeGate;
      sr.appendChild(gb);
    }
    const c=buildCost(sb.type,sb.age,ENID), rate=0.5*(sb.done?1:Math.max(0.35,sb.prog));
    const back=Object.keys(c).map(k=>Math.floor(c[k]*rate)+' '+resName(k)).join(' · ');
    const db=document.createElement('button');
    db.className='btn'+(demoArmed===sb?' on':'');
    db.innerHTML=(demoArmed===sb?T('kilepesBiztos').split('?')[0]+'?':T('epLerombolas'))
      +' <kbd>Del</kbd><small>'+T('vissza')+': '+back+'</small>';
    db.onclick=demolish;
    sr.appendChild(db);
    // Atomcsapás gomb, ha ki van kutatva és bombázó van kijelölve
    if(G.upg.atom>0&&G.sel.some(u=>!u.dead&&u.bomb&&u.owner===ENID)){
      const ab=document.createElement('button');
      ab.className='btn'+(G.atomUsed?' no':'');
      ab.innerHTML='☢ '+T('epAtomcsapas')+'<small>'+(G.atomUsed?T('epFelhasznalva'):T('epJeloldCelt'))+'</small>';
      ab.onclick=armAtom;
      sr.appendChild(ab);
    }
  }
  if(!hasWorker&&G.place){ G.place=null; }
  const br=$('buildRow'); br.innerHTML='';
  for(const type of BUILD_ORDER){
    if(BUILDS[type].minAge!==undefined&&G.age<BUILDS[type].minAge) continue;  // korszakhoz kötött
    /* A kalózvilág épületei (cukornád) csak ott jelennek meg. */
    if(BUILDS[type].kalozCsak&&!G.pirate) continue;
    const d=BUILDS[type], c=buildCost(type,G.age,ENID);
    const b=document.createElement('button');
    b.className='btn'+(G.place===type?' on':'')+(canPay(c)?'':' no');
    b.innerHTML=buildName(type,G.age)+' <kbd>'+d.key+'</kbd><small>'+costText(c)+'</small>';
    b.onclick=()=>startPlacing(type);
    br.appendChild(b);
  }
  // Csak azt kínáljuk, amit a kijelölt épület valóban ki tud képezni
  const tr=$('trainRow'); tr.innerHTML='';
  for(const role of (canTrain?trainsOf(sb):[])){
    const d=UNITS[role], c=unitCost(role,G.age,ENID);
    const b=document.createElement('button');
    b.className='btn'+(canPay(c)?'':' no');
    b.innerHTML=unitName(role,G.age)+' <kbd>'+d.key+'</kbd><small>'+costText(c)+'</small>';
    b.title=(G.pirate?'':counterText(role)+' — ')+T('ctTobb');
    // Kattintás egyet, Shift ötöt, Ctrl tízet toboroz; nyomva tartva folyamatosan sorol be.
    let holdT=null, repT=null;
    const stop=()=>{ clearTimeout(holdT); clearInterval(repT); holdT=repT=null; };
    b.onclick=e=>{
      if(b._held){ b._held=false; return; }
      train(role, e.shiftKey?5:((e.ctrlKey||e.metaKey)?10:1));
    };
    b.addEventListener('pointerdown',()=>{
      b._held=false;
      holdT=setTimeout(()=>{ b._held=true; train(role,1); repT=setInterval(()=>train(role,1),200); },420);
    });
    b.addEventListener('pointerup',stop);
    b.addEventListener('pointerleave',stop);
    b.addEventListener('pointercancel',stop);
    tr.appendChild(b);
  }
  const ur=$('upgRow'); ur.innerHTML='';
  // Csak annak az épületnek a fejlesztései látszanak, amelyiket kijelölted:
  // a kovácsműhelyben a katonák, az akadémián a birodalom fejlődik.
  const hol=(sb&&BUILDS[sb.type])?BUILDS[sb.type].research:null;
  for(const key of UPG_KEYS){
    const d=UPGRADES[key];
    if(hol&&d.hol&&d.hol!==hol) continue;
    if(!upgAvailable(key,0)&&!(G.upg[key]||0)) continue;
    const lv=G.upg[key]||0, maxed=lv>=(typeof upgCap==='function'?upgCap(key,0):d.max);
    const c=maxed?null:upgCost(key,0);
    const b=document.createElement('button');
    b.className='btn'+(maxed?' on':(canPay(c)?'':' no'));
    const cap=(typeof upgCap==='function')?upgCap(key,0):d.max;
    b.innerHTML=upgRovid(key,d.short)+' <kbd>'+lv+'/'+d.max+'</kbd><small>'
      +(maxed?(lv>=d.max?T('epKesz'):T('epKovKorszak')):costText(c))+'</small>';
    b.title=upgNev(key,d.name)+' — '+upgLeiras(key,d.desc);
    b.onclick=()=>buyUpgrade(key);
    ur.appendChild(b);
  }
  layoutHud();                      // a magasságot csak tényleges csere után mérjük
}
// A parancssáv magassága a gombok számától függ, ezért méréssel adjuk át
// a CSS-nek — így a gyorsgombok és a minitérkép sosem lóghat rá.
// Ha a szöveg nem fér a helyére, apránként kisebb betűre váltunk. Kis
// kijelzőn a hosszú nevek (Paul von Hindenburg, III. Sobieski János)
// különben kilógnának a doboz mellé.
function layoutHud(){
  const st=document.documentElement.style;
  const cb=$('cmdBox');
  if(cb&&cb.offsetHeight) st.setProperty('--cmdh',cb.offsetHeight+'px');
  // A felső sáv magassága a tartalomtól függ: a szén megjelenésével hat
  // rekesz lett, és a doboz magasabb. Az alatta lévő elemek ehhez igazodnak.
  const el=$('eraLabel'), rb=$('resBar');
  const h=((el&&el.offsetHeight)||0)+((rb&&rb.offsetHeight)||0);
  if(h>20) st.setProperty('--topbar',h+'px');
}
function syncUI(){
  /* --- A KIKÖTŐMENÜ ELNYOMJA A PARANCSSÁVOT ---
     Kalózvilágban a városra kattintva körben nyílnak az építési
     lehetőségek. A hajóid viszont kijelölve maradnak, ezért alatta
     egyszerre látszott a töltet- és állásválasztó is: két teljesen más
     dologról szóló panel, egymás hegyén-hátán, ráadásul a kikötőmenü alsó
     köreit is takarta.

     Ez a vizsgálat a syncUI ELEJÉN áll, nem a buildButtons-ban: az
     ugyanis korán kilép, ha a kijelölés nem változott — márpedig a
     kikötőmenü megnyitása épp nem változtat a kijelölésen.

     A kijelölést NEM bontjuk meg: a menü bezárásakor a hajóid ott
     lesznek, ahol hagytad őket. */
  {
    const doboz=$('cmdBox');
    if(doboz&&doboz.style) doboz.style.display=(G.pirate&&G.port)?'none':'';
  }
  $('rWood').textContent=Math.floor(G.res.wood);
  $('rStone').textContent=Math.floor(G.res.stone);
  /* Kalózvilágban nincs szén: a vitorlás korban nincs mit fűteni vele. */
  {
    const sor=$('resCoal');
    if(sor&&sor.style&&G.pirate) sor.style.display='none';
  }
  /* Kalózvilágban a kő helyén RUM áll: más név, meleg borostyán pötty. */
  {
    const el=$('rStone');
    const sor=el&&el.parentNode&&el.parentNode.parentNode;
    if(sor&&sor.querySelector){
      const cim=sor.querySelector('span'), pont=sor.querySelector('.dot');
      const rum=!!G.pirate;
      /* A sáv címkéi kisbetűsek („Kő”, „Stone”), a T('ko') viszont a
         nagybetűs változat — ezért a nyersanyagsávban a saját kulcsát
         használjuk, különben egyedül a kő állna csupa nagybetűvel. */
      if(cim) cim.textContent=rum?T('rum'):T('nyKo');
      if(pont&&pont.style) pont.style.background=rum?'#b5722a':'#9aa0a6';
    }
  }
  $('rGold').textContent=Math.floor(G.res.gold);
  /* A szám alatt kiírjuk, mennyit termelnek az épületek — így egy
     pillantásra látszik, mit ér egy új aranybánya vagy cukornád. */
  if(typeof resIncome==='function'){
    for(const [res,id] of [['wood','rWoodRate'],['stone','rStoneRate'],['gold','rGoldRate']]){
      const e=$(id);
      if(!e||!e.style) continue;
      const n=resIncome(res,0);
      e.textContent=n>0.004?('+'+n.toFixed(2)+'/mp'):'';
      e.style.color='var(--dim)';
    }
  }
  // A szén csak a puskapor korától jelenik meg
  const rc=$('resCoal');
  // Kalózvilágban nincs szén: a vitorlás korban nincs mit fűteni vele
  if(rc) rc.style.display=(!G.pirate&&G.age>=COAL_AGE)?'flex':'none';
  const rcv=$('rCoal'); if(rcv) rcv.textContent=Math.floor(G.res.coal||0);
  $('rFood').textContent=Math.floor(G.res.food);
  /* Az élelem mellett kiírjuk az egyenleget: mennyi terem, mennyit eszik
     a sereg. Ha mínuszban vagy, vörösen villog — ez az éhezés előjele. */
  if(typeof upkeepOf==='function'){
    const be=foodIncome(0), ki=upkeepOf(0), egy=be-ki;
    const el=$('rFood');
    if(el&&el.parentNode){
      let jel=el.parentNode.querySelector('.bal');
      if(!jel&&document.createElement){
        jel=document.createElement('span');
        if(jel){ jel.className='bal'; el.parentNode.appendChild(jel); }
      }
      if(jel){
        jel.textContent=(egy>=0?'+':'')+egy.toFixed(2)+'/mp';
        jel.style.color=egy<0?'#e07a52':'var(--dim)';
      }
    }
    const rb=$('resBar')||$('topCenter');
    if(rb&&rb.classList&&rb.classList.toggle) rb.classList.toggle('starving',!!G.starving);
  }
  $('rPop').textContent=popOf(0)+' / '+popCap();
  // Napszak a korszakdoboz mellett
  const eb=$('eraBox');
  if(eb&&eb.querySelector&&typeof todName==='function'&&G.dayNight){
    let nap=eb.querySelector('.tod');
    if(!nap&&eb.appendChild&&document.createElement){
      nap=document.createElement('span');
      if(nap){ nap.className='tod'; eb.appendChild(nap); }
    }
    if(nap) nap.textContent=' · '+todName()
      +((typeof weatherName==='function'&&G.weatherOn&&weatherName()!=='derült')?', '+weatherName():'')
      +((typeof seaNev==='function'&&seaNev())?', '+seaNev():'');
  }
  /* KALÓZVILÁG: nincs korszakváltás. A kalózkodás aranykora a 18. század
     eleje és a 19. század eleje közé esik — ezt írjuk ki a századszám
     helyett, és a korszakváltó dobozt elrejtjük. */
  if(G.pirate){
    $('eraName').textContent=T('szazad1819');
    $('eraSub').textContent=T('kalozAranykora');
  }else{
    $('eraName').textContent=korszakNev(G.age);
    $('eraSub').textContent=korszakAlcim(G.age);
  }
  /* A korszakváltó gomb és az ára eltűnik kalózmódban — a doboz marad,
     mert a küldetés célja is ott olvasható. */
  const abtn=$('ageBtn'), acost=$('ageCost');
  if(abtn&&abtn.style) abtn.style.display=G.pirate?'none':'';
  if(acost&&acost.style) acost.style.display=G.pirate?'none':'';
  const btn=$('ageBtn');
  if(G.pirate){ btn.disabled=true; }
  else if(G.age>=3){btn.disabled=true;btn.textContent=T('epVegsoKorszak');$('ageCost').textContent=T('epNincsTovabb');}
  else{
    const c=ageCost(G.age,0), ready=ageReady();
    btn.disabled=!canPay(c)||!ready;
    btn.textContent=T('epBelepes')+': '+korszakNev(G.age+1);
    $('ageCost').textContent=ready
      ? costText(c)
      : costText(c)+' · '+ageBuildCount()+'/'+AGE_BUILDS[G.age]+' '+T('celEpulet');
  }
  // Kijelölés leírása
  let info=T('nincsKijeloles');
  if(G.selBuild){
    const b=G.selBuild, d=BUILDS[b.type];
    info=buildName(b.type,b.age)+' — '+Math.ceil(b.hp)+'/'+b.maxHp+' HP'
      +(b.done?'':' · '+T('epEpul')+' '+Math.floor(b.prog*100)+'%')
      +(b.queue.length?' · '+b.queue.length:'')
      +(d.trains?' · '+T('epGyulekezo'):'');
  }else if(G.sel.length){
    const c={};
    for(const u of G.sel) c[u.role]=(c[u.role]||0)+1;
    info=Object.keys(c).map(r=>{
      const nev=(r==='hero'&&typeof heroName==='function')?heroName(0,G.age):unitName(r,G.age);
      return c[r]+'× '+nev;
    }).join(' · ');
    const main=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];
    // Cipelt rakomány összesítve
    const load={};
    for(const u of G.sel) if(u.carry>0&&u.carryType)
      load[u.carryType]=(load[u.carryType]||0)+u.carry;
    const lk=Object.keys(load);
    if(lk.length)
      info+='  —  '+T('ctCipel')+': '+lk.map(k=>Math.floor(load[k])+' '+(k==='fish'?T('ctHal'):resName(k))).join(' · ');
    /* Az ellenfogás-háromszög (lovasság ↔ lövész ↔ pikás) a kalózvilágban
       nem mond semmit: ott nincs lovasság és nincs harckocsi, a vegyes
       kijelölés pedig többnyire hajókból áll. A tanács ilyenkor csak
       elveszi a helyet a legénység- és ágyúadat elől, ezért kimarad. */
    else if(main&&!G.pirate&&counterText(main)) info+='  —  '+counterText(main);
  }
  /* HAJÓK: a legénység és az ágyúszám a legfontosabb adat, mert az
     átszállás ezen múlik. Ezt a VÉGLEGES szöveghez fűzzük hozzá —
     korábban külön írtuk ki, és ez a sor felül is írta. */
  {
    const hajok=G.sel.filter(u=>!u.dead&&u.naval);
    if(hajok.length){
      let fo=0, foMax=0, agyu=0;
      for(const h of hajok){
        fo+=Math.round(h.crew||0); foMax+=h.crewMax||0; agyu+=h.guns||0;
      }
      const reszek=[];
      if(foMax) reszek.push(T('pmLegenyseg')+' '+fo+'/'+foMax);
      if(agyu)  reszek.push(agyu+' '+T('pmAgyu'));
      // a fedélzeten utazók külön
      let rakomany=0;
      for(const h of hajok) rakomany+=(h.cargo&&h.cargo.length)||0;
      if(rakomany) reszek.push(rakomany+' '+T('pmFedelzeten'));
      if(reszek.length) info+='  —  '+reszek.join('  ·  ');
    }
  }
  $('selInfo').textContent=info;
  const ob=$('objective');
  if(G.mission){ ob.style.display='block'; ob.textContent=objectiveText(); }
  else ob.style.display='none';
  if(typeof pontTablaFrissit==='function') pontTablaFrissit();
  buildButtons();
}
