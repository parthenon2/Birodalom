/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   12. KORSZAKVÁLTÁS
   ===================================================================== */
function upgradeEnt(e,age){
  e.age=age;
  const bn=bonusOf(e.owner);
  if(e.kind==='build'){
    const ratio=e.hp/e.maxHp;
    e.maxHp=BUILDS[e.type].hp[age];
    if(bn.build){const t={maxHp:e.maxHp,hp:e.maxHp,type:e.type,buildTime:e.buildTime};bn.build(t);
      e.maxHp=t.maxHp; e.rangeMul=t.rangeMul||e.rangeMul;}
    e.hp=e.maxHp*ratio;
  }else{
    const d=UNITS[e.role], ratio=e.hp/e.maxHp;
    e.maxHp=d.hp[age]; e.hp=e.maxHp*ratio;
    e.dmg=val(d.dmg,age); e.range=val(d.range,age);
    e.speed=val(d.speed,age)*PACE.speed; e.atk=val(d.atk,age); e.r=val(d.r,age);
    e.armor=val(d.armor,age)||0;
    if(bn.unit) bn.unit(e);
    applyUpg(e);
  }
}
// A korszakváltáshoz nem elég a nyersanyag: a birodalomnak ki is kell
// épülnie. Fal nem számít bele — abból olcsón lehetne sokat húzni.
const AGE_BUILDS=[7,10,13];   // a kezdőbázis négy épülettel indul
function ageBuildCount(){
  return G.builds.filter(b=>!b.dead&&b.owner===ENID&&b.done&&b.type!=='wall').length;
}
function ageReady(){
  return G.age>=3 || ageBuildCount()>=AGE_BUILDS[G.age];
}
function advanceAge(){
  if(typeof logAdd==='function'&&logAdd('age')) return;
  if(pausedBlock()) return;
  /* Kalózvilágban nincs korszakváltás: a játék végig a kalózkodás
     aranykorában játszódik. */
  if(G.pirate){ toast(T('uzKorszakKalozNincs')); SFX.play('deny'); return; }
  if(G.age>=3){toast(T('uzLegmagasabbKor'));return;}
  if(!ageReady()){
    toast(T('uzEpitsdKi')+': '+AGE_BUILDS[G.age]+' '+T('uzKeszEpulet')+', '
          +'jelenleg '+ageBuildCount()+'.');
    SFX.play('deny'); return;
  }
  const c=ageCost(G.age,0);
  if(!canPay(c)){toast(T('uzNincsAnyagKettospont')+': '+costText(c));SFX.play('deny');return;}
  pay(c); G.age++;
  for(const b of G.builds) if(b.owner===ENID&&!b.dead) upgradeEnt(b,G.age);
  for(const u of G.units) if(u.owner===ENID&&!u.dead) upgradeEnt(u,G.age);
  applyAgeStyle();
  if(typeof MUSIC==='object'&&MUSIC.setEra) MUSIC.setEra(G.age); drawPortrait(); syncUI(); SFX.play('age');
  openDoctrine(G.age);                        // az új korszak új irányt kínál
  warmSprites(G.age,0);                       // az új korszak grafikái előre elkészülnek
  pruneSprites();
  const n=NATIONS[G.nation];
  toast(T('uzUjKorszak')+': '+korszakNev(G.age)+' — '+uralkodoNev(G.nation,G.age)+' '+T('uzVezetesevel'));
}
// A felület színei a korszakot ÉS a választott nemzetet is követik: a
// korszak adja az alaphangulatot, a nemzet ezt a saját színei felé húzza.
function applyAgeStyle(nation){
  const u=AGES[G.age].ui, s=document.documentElement.style;
  const nk=nation||G.nation, n=NATIONS[nk]&&NATIONS[nk].ui;
  const put=(k,base,nat,amt)=>s.setProperty(k, n?mix(base,nat,amt):base);
  // A nemzet dominál: a korszak csak árnyalja, nem nyomja el
  put('--gold',u.gold, n&&n.gold, 0.72);
  put('--panel',u.panel, n&&n.panel, 0.94);
  put('--panel2',u.panel2, n&&n.panel2, 0.94);
  put('--line',u.line, n&&n.line, 0.88);
  s.setProperty('--ink',u.ink);
  s.setProperty('--nat', n?n.gold:u.gold);
  if(typeof natPattern==='function') s.setProperty('--pat', natPattern(nk));
}
