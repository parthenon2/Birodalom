/* =======================================================================
   11. BOTOK (AI)

   Minden bot SAJÁT fejjel gondolkodik. A függvények nem a G.ai-t
   olvassák, hanem a kapott `ai` bejegyzést az oldalak táblájából, és a
   sorszámát (`ai.i`) használják tulajdonosként.

   Korábban minden „1” be volt égetve: `b.owner===1`, `doctSet(1)`,
   `fogAt(x,y,1)`. Két félnél ez helyes volt, négy botnál viszont
   mindegyik ugyanazt a birodalmat építette volna.

   Ellenség: nem a 0. fél, hanem mindenki, aki nincs velünk egy csapatban
   — így a szövetségek is működnek.
   ===================================================================== */
// A bot emlékezete a látott ellenséges hadrendről. Az értékek lassan
// fakulnak, tehát a régi információ magától elavul.
function aiRemember(dt,ai){
  const m=ai.seen;
  const decay=dpow(0.5,dt/25);
  m.melee*=decay; m.ranged*=decay; m.spear*=decay; m.cav=(m.cav||0)*decay;
  for(const u of G.units){
    if(u.dead||u.role==='worker') continue;
    if(!ellenseg(ai.i,u.owner)) continue;       // a szövetségest nem méri fel
    if(fogAt(u.x,u.y,ai.i)!==2) continue;       // csak amit épp lát
    if(m[u.role]!==undefined) m[u.role]+=dt*0.9;
  }
}
// Mit érdemes most kiképezni? Ellenszer a leggyakoribb ellenséges típusra.
function aiPickRole(ai){
  // A szigetlakók nem ismerik a fémet: lándzsával és íjjal harcolnak,
  // lovasságot vagy gépesített egységet nem állítanak ki.
  if(ai.noAge) return schance(0.55)?'spear':'ranged';
  /* A négyes háromszög: a könnyűlovas a lövészre való, a pika minden
     lovasra. A bot ugyanazt a logikát követi, mint a játékos:
     megnézi, miből lát legtöbbet, és annak az ellenszerét képzi. */
  const m=ai.seen, tot=m.melee+m.ranged+m.spear+(m.cav||0);
  if(tot>2.5&&schance(0.65)){
    let dom='melee', db=m.melee;
    if(m.ranged>db){ dom='ranged'; db=m.ranged; }
    if(m.spear>db){ dom='spear'; db=m.spear; }
    if((m.cav||0)>db){ dom='cav'; db=m.cav; }
    /* Lovas ellen pika; lövész ellen lovas (gyorsabb, mint a nehézlovas);
       pika ellen lövész; nehézlovas ellen pika. */
    return {melee:'spear', ranged:'cav', spear:'ranged', cav:'spear'}[dom];
  }
  const rr=srnd();
  /* Alaphelyzetben is kerül lovas a seregbe — enélkül a bot sosem
     használná, és a játékos sem találkozna vele. */
  return rr<0.28?'melee':(rr<0.56?'ranged':(rr<0.82?'spear':'cav'));
}
function nearestOwnBuilding(u){
  let best=null,bd=1e9;
  for(const b of G.builds){
    if(b.dead||b.owner!==u.owner||!b.done||!isHealBuilding(b)) continue;
    const d=dist(u.x,u.y,b.x,b.y); if(d<bd){bd=d;best=b;}
  }
  return best;
}
function aiHQ(i){
  const o=(i===undefined)?1:i;
  return G.builds.find(b=>b.owner===o&&b.type==='hq'&&!b.dead);
}
function nearAnyBuilding(x,y,r){
  for(const b of G.builds) if(!b.dead&&Math.hypot(b.x-x,b.y-y)<r+Math.max(b.w,b.h)*0.5) return true;
  return false;
}
// A kitermelt erdő lassan visszanő, különben hosszú játékban a térkép kimerül
function regrow(dt){
  regrowFish(dt); regrowCoal(dt);
  G.regrowT-=dt;
  if(G.regrowT<=0){
    G.regrowT=13;
    const woods=G.nodes.filter(n=>n.type==='wood');
    if(woods.length<170){
      const seed=woods.length?woods[srangeInt(0,woods.length-1)]:null;
      for(let i=0;i<24;i++){
        const a=srange(0,TAU), d=srange(30,110);
        const x=seed?clamp(seed.x+dcos(a)*d,60,WORLD.w-60):srange(200,WORLD.w-200);
        const y=seed?clamp(seed.y+dsin(a)*d,60,WORLD.h-60):srange(200,WORLD.h-200);
        if(freeSpot(x,y,26,26,4)&&!nearAnyBuilding(x,y,130)){ G.nodes.push(makeNode('wood',x,y)); break; }
      }
    }
  }
  G.regrowT2-=dt;
  if(G.regrowT2<=0){                        // új kő- és aranylelőhelyek is felbukkannak
    G.regrowT2=46;
    for(const type of ['stone','gold']){
      const cnt=G.nodes.filter(n=>n.type===type).length;
      if(cnt>=(type==='stone'?34:22)) continue;
      for(let i=0;i<30;i++){
        const x=srange(160,WORLD.w-160), y=srange(160,WORLD.h-160);
        if(freeSpot(x,y,30,30,6)&&!nearAnyBuilding(x,y,150)){ G.nodes.push(makeNode(type,x,y)); break; }
      }
    }
  }
}
/* Minden bot külön kap szót, mindig ugyanabban a sorrendben — a
   hálózati játszmában ez elengedhetetlen, mert a sorrend a sorsolás
   sorrendjét is meghatározza. */
function updateAI(dt){
  const botok=(typeof botOldalak==='function')?botOldalak():(G.ai?[G.ai]:[]);
  for(const b of botok) if(b) botLep(dt,b);
}
function botLep(dt,ai){
  if(!ai||!ai.res) return;
  const r=ai.res, BOTID=ai.i;
  // Passzív bevétel: az AI nem gyűjt kézzel, hanem növekvő ütemben kap nyersanyagot.
  aiRemember(dt,ai);
  const m=Math.min(2.1,1+ai.age*0.30+G.t/860)*(ai.rate||1);  // küldetésenként hangolható
  const inc=m*PACE.aiIncome*DIFF[G.diff].income;
  r.wood+=1.9*inc*dt; r.stone+=1.1*inc*dt; r.gold+=1.3*inc*dt; r.food+=2.1*inc*dt;
  if(ai.age>=COAL_AGE) r.coal=(r.coal||0)+1.5*inc*dt;

  // Korszakváltás időzítve
  ai.ageT-=dt;
  if(ai.ageT<=0&&ai.age<3){
    ai.age++; ai.ageT=250;
    if(doctSet(BOTID)[ai.age]) ai.doct[ai.age]=doctSet(BOTID)[ai.age][srangeInt(0,2)].key;
    for(const b of G.builds) if(b.owner===BOTID&&!b.dead) upgradeEnt(b,ai.age);
    for(const u of G.units) if(u.owner===BOTID&&!u.dead) upgradeEnt(u,ai.age);
    warmSprites(ai.age,BOTID); pruneSprites();
    /* Csak akkor szólunk, ha a bot ELLENSÉGES a helyi játékosra nézve —
       szövetséges korszakváltásáról nem kell értesíteni. Kettőnél több
       félnél a nemzet nevét is kiírjuk, különben négy bot négy azonos
       üzenetet küldene, és nem derülne ki, melyik lépett. */
    if(ellenseg(G.enId||0,BOTID)){
      const ki=(oldalDb()>2&&NATIONS[nationOf(BOTID)])?(NATIONS[nationOf(BOTID)].name+': '):'';
      toast(ki+T('uzEllenfelKor')+': '+korszakNev(ai.age));
    }
  }

  // Építkezés
  ai.buildT-=dt;
  if(ai.buildT<=0){
    ai.buildT=26;
    const hq=aiHQ(BOTID);
    if(hq){
      const bar=G.builds.filter(b=>b.owner===BOTID&&b.type==='barracks'&&!b.dead).length;
      const aca=G.builds.filter(b=>b.owner===BOTID&&b.type==='academy'&&!b.dead).length;
      const tmp=G.builds.filter(b=>b.owner===BOTID&&b.type==='temple'&&!b.dead).length;
      const tow=G.builds.filter(b=>b.owner===BOTID&&b.type==='tower'&&!b.dead).length;
      const farm=G.builds.filter(b=>b.owner===BOTID&&b.type==='farm'&&!b.dead).length;
      const ist=G.builds.filter(b=>b.owner===BOTID&&b.type==='stable'&&!b.dead).length;
      // Gazdasági sorrend: előbb élelem, aztán kaszárnya, végül védelem.
      // Ha fogytán az élelem, mindent félretesz és majorságot húz fel.
      let type=null;
      if(farm<2) type='farm';
      else if(bar<1) type='barracks';
      else if(r.food<260&&farm<7) type='farm';
      else if(ai.age>=3&&!G.builds.some(b=>b.owner===BOTID&&b.type==='airfield'&&!b.dead))
        type='airfield';                       // a 20. században ez elsőbbséget élvez
      /* Az istálló a második kaszárnya UTÁN jön: előbb a gyalogság áll
         fel, csak azután a lovasság. A kalózvilágban nincs értelme —
         ott szigetek vannak, nem síkság. */
      else if(ist<1&&!G.pirate&&ai.age<3) type='stable';
      else if(aca<1&&ai.age>0) type='academy';
      else if(tmp<1&&ai.age>0) type='temple';
      else if(bar<2+ai.age) type='barracks';
      else if(tow<2+ai.age) type='tower';
      else if(farm<4+ai.age) type='farm';
      if(type){
        const c=buildCost(type,ai.age,BOTID);
        if(canPay(c,r)){
          // A repülőtér nagy: messzebb és több próbálkozással keres helyet
          const big=(BUILDS[type].w>90), tries=big?60:24;
          for(let i=0;i<tries;i++){
            const a=srange(0,TAU), d=srange(big?150:120, big?430:290);
            const x=hq.x+dcos(a)*d, y=hq.y+dsin(a)*d;
            if(freeSpot(x,y,BUILDS[type].w,BUILDS[type].h,14)){
              pay(c,r); G.builds.push(makeBuild(type,BOTID,x,y,ai.age,true)); G.navVer++; break;
            }
          }
        }
      }
    }
  }

  // Kiképzés
  ai.trainT-=dt;
  if(ai.trainT<=0){
    ai.trainT=8;
    const pop=popOf(BOTID);
    const army=G.units.filter(u=>u.owner===BOTID&&u.role!=='worker'&&!u.dead).length;
    // A bot serege csak a rohamok számával együtt nő, így nem húz el az elején
    if(pop<62&&army<8+ai.wave*3){
      // Hittérítők: kevés kell belőlük, de sokat érnek
      const priests=G.units.filter(u=>u.owner===BOTID&&!u.dead&&u.role==='priest').length;
      for(const tb of G.builds){
        if(tb.dead||tb.owner!==BOTID||tb.type!=='temple'||!tb.done||tb.queue.length) continue;
        if(priests>=1+ai.age) break;
        const pc=unitCost('priest',ai.age,BOTID);
        if(canPay(pc,r)){ pay(pc,r); tb.queue.push({role:'priest',t:UNITS.priest.time}); }
        break;
      }
      // Repülőtérről vadászt tart, hogy legyen mit a gépek ellen küldeni
      const af=G.builds.filter(b=>b.owner===BOTID&&b.type==='airfield'&&!b.dead&&b.done);
      if(af.length){
        const planes=G.units.filter(u=>u.owner===BOTID&&!u.dead&&u.air).length;
        if(planes<2+DIFF[G.diff].size){
          const c=unitCost('fighter',ai.age,BOTID);
          if(canPay(c,r)&&af[0].queue.length<2){
            pay(c,r); af[0].queue.push({role:'fighter',t:UNITS.fighter.time*PACE.train});
          }
        }
      }
      // A 20. században félretesz a repülőtérre: amíg nincs, nem költi el
      // az utolsó aranyait katonákra.
      const needAf=(ai.age>=3&&!af.length);
      if(needAf&&r.gold<buildCost('airfield',ai.age,BOTID).gold+60) return;
      /* A LOVAS ISTÁLLÓBAN készül, a gyalogság kaszárnyában. Mivel a
         szerepet épületenként választjuk, előbb az épületet nézzük meg,
         és csak azután kérdezzük, mit érdemes ott képezni: az istállóban
         úgyis csak lovas lehet, a kaszárnyában pedig minden más. */
      const muhelyek=G.builds.filter(b=>b.owner===BOTID&&!b.dead&&b.done
        &&(b.type==='barracks'||b.type==='stable'));
      for(const b of muhelyek){
        if(b.queue.length>1) continue;
        let role;
        if(b.type==='stable'){
          role='cav';
          /* Az istállót nem tömjük tele: a lovas drága és két helyet
             foglal. Ha a sereg nagy része már lovas, kihagyjuk a kört. */
          const sajat=G.units.filter(u=>!u.dead&&u.owner===BOTID&&u.role!=='worker');
          const lovas=sajat.filter(u=>u.role==='cav').length;
          if(sajat.length>6&&lovas>sajat.length*0.34) continue;
        }else{
          role=aiPickRole(ai);                       // ellenfogás a látott hadrendre
          if(role==='cav') role='melee';             // kaszárnyában nincs lovas
        }
        const c=unitCost(role,ai.age,BOTID);
        if(canPay(c,r)){pay(c,r);b.queue.push({role,t:UNITS[role].time*0.8});}
      }
    }
  }

  // Védelem: ha ellenség járkál a bázis körül, a sereg hazafordul
  ai.defT-=dt;
  if(ai.defT<=0){
    ai.defT=3;
    const hq=aiHQ(BOTID);
    if(hq){
      let threat=null,bd=560*560;
      for(const u of G.units){
        if(u.dead||u.role==='worker'||!ellenseg(BOTID,u.owner)) continue;
        const d=(u.x-hq.x)**2+(u.y-hq.y)**2;
        if(d<bd){bd=d;threat=u;}
      }
      if(threat){
        for(const u of G.units){
          if(u.dead||u.owner!==BOTID||u.role==='worker'||u.retreat) continue;
          if(dist(u.x,u.y,hq.x,hq.y)>1100) continue;      // a távoli rohamot nem hívja vissza
          if(!u.target) u.order={type:'amove',x:threat.x,y:threat.y};
        }
      }
    }
  }

  // Fejlesztés: a bot is költ kutatásra, ha futja
  ai.upgT-=dt;
  if(ai.upgT<=0){
    ai.upgT=50;
    if(!DIFF[G.diff].upg) return;
    if(!G.builds.some(b=>b.owner===BOTID&&!b.dead&&b.done&&b.type==='academy')) return;
    for(const k of UPG_KEYS){
      if((ai.upg[k]||0)>=UPGRADES[k].max) continue;
      const c=upgCost(k,BOTID);
      if(canPay(c,r)){
        pay(c,r); ai.upg[k]=(ai.upg[k]||0)+1;
        for(const u of G.units) if(!u.dead&&u.owner===BOTID) recomputeUnit(u);
        break;
      }
    }
  }

  // Felderítés: időnként egyetlen katona indul ismeretlen terület felé
  ai.scoutT-=dt;
  if(ai.scoutT<=0){
    ai.scoutT=22;
    const idle=G.units.filter(u=>u.owner===BOTID&&!u.dead&&u.role!=='worker'&&!u.order);
    if(idle.length){
      const p=unexploredPoint(BOTID);
      idle[srangeInt(0,idle.length-1)].order={type:'amove',x:p.x,y:p.y};
    }
  }

  // Roham
  ai.waveT-=dt;
  if(ai.waveT<=0){
    // A gyógyulni hazaküldött katonák nem tartoznak a rohamerőhöz —
    // különben a hullám papíron nagyobb volna, mint a valóságban.
    const army=G.units.filter(u=>u.owner===BOTID&&u.role!=='worker'&&!u.dead&&!u.retreat);
    const need=Math.max(2,4+ai.wave*2+DIFF[G.diff].size);
    if(army.length>=need){
      ai.wave++; ai.waveT=Math.max(38,72-ai.wave*3)*DIFF[G.diff].wave;
      // A legközelebbi játékos-épület felé indulnak
      const hq=aiHQ(BOTID)||{x:WORLD.w/2,y:WORLD.h/2};
      let tgt=null,bd=1e9;
      for(const b of G.builds){ if(b.dead||!ellenseg(BOTID,b.owner)) continue;
        if(fogAt(b.x,b.y,BOTID)===0) continue;              // amit nem derített fel, azt nem ismeri
        const d=dist(hq.x,hq.y,b.x,b.y); if(d<bd){bd=d;tgt=b;} }
      if(tgt){
        for(const u of army){u.order={type:'amove',x:tgt.x+srange(-70,70),y:tgt.y+srange(-70,70)};u.target=null;}
        /* Riasztás csak akkor, ha a roham RÁD (vagy a szövetségesedre)
           indul. Két bot egymás elleni hadjáratáról nem kapsz üzenetet. */
        if(!ellenseg(G.enId||0,tgt.owner)){
          const ki=(oldalDb()>2&&NATIONS[nationOf(BOTID)])?(NATIONS[nationOf(BOTID)].name+' — '):'';
          toast(ki+T('uzRoham')+' ('+army.length+' '+T('uzEgysegDb')+')');
          SFX.play('alert');
        }
      }else{
        // Nem tudja, hol vagy: a sereg felderítő menetbe kezd. Ilyenkor
        // nincs riasztás — a játékos sem tudhatja, hogy elindultak.
        const p=unexploredPoint(BOTID);
        for(const u of army){u.order={type:'amove',x:p.x,y:p.y};u.target=null;}
      }
    }else ai.waveT=12;
  }
}
