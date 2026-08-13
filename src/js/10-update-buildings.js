/* =======================================================================
   10. FRISSÍTÉS — épületek, lövedékek
   ===================================================================== */
function updateBuild(b,dt){
  // Építkezés
  if(!b.done){
    /* Kalózmódban nincs jobbágy: a kolóniát a partra tett legénység húzza
       fel, a kapitány pedig a fedélzetről nézi. Az ilyen épület magától
       halad — a sebességet az akadémiai Építőipar gyorsítja. */
    if(b.remote){
      b.started=true;
      b.prog=Math.min(1, (b.prog||0) + dt/Math.max(4,b.buildTime||12));
    }
    // Egyébként az építkezés magától nem halad: munkásoknak kell dolgozniuk
    // rajta. A haladást ők írják bele az építési parancsuk során.
    b.hp=Math.max(b.hp,b.maxHp*(0.25+0.75*Math.min(1,b.prog)));
    if(b.prog>=1){b.done=true;b.hp=b.maxHp;
      if(b.owner===0){SFX.at('ready',b.x,b.y,0.9);
        if(b.type==='hq'||b.type==='barracks'||b.type==='tower') toast(BUILDS[b.type].names[b.age]+' elkészült.');}}
    return;
  }
  // Amit húsz másodperce nem ért támadás, azt a helyőrség lassan rendbe hozza.
  // Enélkül a bázis visszafordíthatatlanul kopna, miközben az egységek gyógyulnak.
  if(b.hp<b.maxHp&&G.t-(b.hitAt||-99)>20)
    b.hp=Math.min(b.maxHp,b.hp+b.maxHp*0.004*dt);
  const d=BUILDS[b.type];
  if(b.fire&&typeof fireTick==='function') fireTick(b,dt);   // felgyújtott épület
  if(d.heal) hospitalAura(b,dt);        // a kórház körüli gyógyulás
  /* TERMELÉS.

     Az épület nem csak élelmet adhat: a kalózvárosokban aranybánya és
     cukornád-ültetvény is áll. Mindegyik ugyanúgy működik, mint a majorság
     — a termést a doktrína és az akadémiai Termelés fejlesztés szorozza. */
  if(d.food||d.termel){
    const store=(typeof resOf==='function')?resOf(b.owner):(b.owner?(G.ai&&G.ai.res):G.res);
    if(store){
      const szorzo=dt*PACE.farm*upgMul(b.owner,'yield');
      if(d.food){
        /* Télen a majorság alig ad: a fagyott föld nem terem. Ettől a
           késői korszakoknak saját gazdasági jellege lesz — több egység,
           de nehezebb ellátni őket. */
        const evszakM=(typeof evszakTermeles==='function')?evszakTermeles():1;
        const gain=val(d.food,b.age)*szorzo*doctMul(b.owner,'food')*evszakM;
        store.food+=gain;
        if(!b.owner) G.earned.food=(G.earned.food||0)+gain;
      }
      if(d.termel) for(const res in d.termel){
        const gain=d.termel[res]*szorzo;
        store[res]=(store[res]||0)+gain;
        if(!b.owner) G.earned[res]=(G.earned[res]||0)+gain;
      }
    }
  }
  /* Toronylövés.

     A torony korábban az ÉPÍTÉSKORI korszak adataival lőtt, és soha nem
     frissült. Egy 15. században emelt őrtorony a 19. században is 155
     pixerre lőtt, miközben az akkori lövészek 165-re — vagyis a saját
     tornyodat kilőtték anélkül, hogy visszalőhetett volna.
     Most a védőépületek a birodalom MOSTANI korszaka szerint harcolnak:
     a helyőrség korszerűsödik, még ha a falak régiek is. */
  if(d.dmg){
    b.cd-=dt;
    const ba=Math.max(b.age, (typeof korOf==='function')?korOf(b.owner):(b.owner?G.ai.age:G.age));
    const t=nearestEnemy(b.x,b.y,b.owner,val(d.range,ba)*(b.rangeMul||1),b);
    if(t&&b.cd<=0&&hasCoal(b)){
      G.projs.push({x:b.x,y:b.y-14,target:t,dmg:val(d.dmg,ba),spd:val(d.proj,ba),
        owner:b.owner,src:b,style:ba===0?'arrow':(ba<3?'ball':'tracer'),dead:false});
      b.cd=val(d.atk,ba);
    }
  }
  // Kiképzési sor
  if(b.queue.length){
    const q=b.queue[0];
    q.t-=dt;
    if(q.t<=0){
      b.queue.shift();
      const age=(typeof korOf==='function')?korOf(b.owner):(b.owner?G.ai.age:G.age);
      let sx2,sy2;
      if(UNITS[q.role].naval){                    // hajó: a kikötő rakodóhelyére
        const dp=dockOf(b);
        sx2=dp.x+srange(-14,14); sy2=dp.y+srange(-14,14);
        if(!isWater(sx2,sy2)){ sx2=dp.x; sy2=dp.y; }
        /* Ha a rakodóhely is szárazon van — például mert az épület nem
           kikötő, hanem egy városi épület —, akkor megkeressük a legközelebbi
           vizet. Enélkül a frissen kiállított hajó a fűben állt. */
        if(!isWater(sx2,sy2)){
          let jo=null;
          for(let r=40;r<=900&&!jo;r+=25)
            for(let k=0;k<24;k++){
              const a=k*TAU/24;
              const x=b.x+dcos(a)*r, y=b.y+dsin(a)*r;
              if(isWater(x,y)){ jo={x,y}; break; }
            }
          if(jo){ sx2=jo.x; sy2=jo.y; }
        }
      }else{
        const a=srange(0,TAU), sp=Math.max(b.w,b.h)*0.6+18;
        sx2=b.x+dcos(a)*sp; sy2=b.y+dsin(a)*sp;
      }
      const u=makeUnit(q.role,b.owner,sx2,sy2,age);
      if(b.rally){
        const r=b.rally;
        if(r.node&&!r.node.dead&&u.role==='worker') u.order={type:'gather',res:r.node.type,target:r.node};
        else if(r.foe&&!r.foe.dead&&u.role!=='worker'){ u.order={type:'attack',target:r.foe}; u.target=r.foe; }
        else u.order={type:'amove',x:r.x,y:r.y};
      }
      G.units.push(u);
      if(b.owner===0) SFX.at('train',b.x,b.y,0.8);
    }
  }
}
function updateProj(p,dt){
  if(p.bomb){                                    // zuhanó bomba
    p.fall+=dt;
    const k=Math.min(1,p.fall/p.fallT);
    p.x=p.x+(p.tx-p.x)*Math.min(1,dt*3.2);       // kissé előre csúszik
    p.y=p.y+(p.ty-p.y)*Math.min(1,dt*3.2);
    p.z=AIR_ALT*(1-k*k);                         // gyorsuló esés
    if(k>=1){
      p.dead=true;
      bombHit(p.tx,p.ty,p.dmg,p.src);
    }
    return;
  }
  const t=p.target;
  if(!t||t.dead){p.dead=true;return;}
  const d=dist(p.x,p.y,t.x,t.y), step=p.spd*dt;
  if(d<=step+2){
    damage(t,p.dmg,p.src||p,p.toltet); p.dead=true;   // a töltet a lövedékkel érkezik
    G.fx.push({x:t.x,y:t.y,t:0,life:.2,type:'hit'});
  }else{
    p.x+=(t.x-p.x)/d*step; p.y+=(t.y-p.y)/d*step;
    p.ang=datan2(t.y-p.y,t.x-p.x);
  }
}
