/* =======================================================================
   23. KEZDŐMENÜ
   ===================================================================== */
let chosen=null, mode='free', chosenMission=-1;
function renderEras(){
  const box=$('eras'); if(!box) return;
  box.innerHTML='';
  AGES.forEach((a,i)=>{
    const b=document.createElement('button');
    b.textContent=(typeof korszakNev==='function')?korszakNev(i):a.name;
    if(i===G.startAge) b.classList.add('on');
    b.onclick=()=>{ G.startAge=i; renderEras(); SFX.init(); SFX.play('click'); };
    box.appendChild(b);
  });
  const a=AGES[G.startAge];
  $('eraPick').textContent=((typeof korszakAlcim==='function')?korszakAlcim(G.startAge):a.sub)
    +(G.startAge?T('nagyobbKeszlet'):'');
}
function renderMaps(){
  // A Karib-tenger nem választható: az a kalózvilág rögzített térképe
  const box=$('maps'); if(!box) return;
  box.innerHTML='';
  // A Karib-tenger rejtett: az a kalózvilág rögzített térképe
  const items=[{key:'random',name:(typeof tajNev==='function')?tajNev('random','Véletlen'):'Véletlen',
    desc:(typeof tajLeiras==='function')?tajLeiras('random','Minden játszmában más táj fogad.'):'Minden játszmában más táj fogad.'}]
    .concat(MAPS.filter(m=>!m.hidden));
  for(const m of items){
    const b=document.createElement('button');
    b.textContent=(typeof tajNev==='function')?tajNev(m.key,m.name):m.name;
    if(m.key===G.mapPick) b.classList.add('on');
    b.onclick=()=>{ G.mapPick=m.key; renderMaps(); $('mapDesc').textContent=tajLeiras(m.key,m.desc);
                    SFX.init(); SFX.play('click'); };
    box.appendChild(b);
  }
  const cur=items.filter(m=>m.key===G.mapPick)[0]||items[0];
  $('mapDesc').textContent=(typeof tajLeiras==='function')?tajLeiras(cur.key,cur.desc):cur.desc;
}
function renderDiffs(){
  const box=$('diffs'); if(!box) return;
  box.innerHTML='';
  DIFF.forEach((d,i)=>{
    const b=document.createElement('button');
    b.textContent=(typeof nehezNev==='function')?nehezNev(i,d.name):d.name;
    if(i===G.diff) b.classList.add('on');
    b.onclick=()=>{ G.diff=i; renderDiffs(); $('diffDesc').textContent=nehezLeiras(i,d.desc);
                    SFX.init(); SFX.play('click'); };
    box.appendChild(b);
  });
  $('diffDesc').textContent=(typeof nehezLeiras==='function')?nehezLeiras(G.diff,DIFF[G.diff].desc):DIFF[G.diff].desc;
}
function renderMissions(){
  const wrap=$('missions'); wrap.innerHTML='';
  setCampaign(chosen||'hu');
  G.campNation=chosen||'hu';
  CAMPAIGN.forEach((m,i)=>{
    const locked=(i>0&&!campDone(i-1,chosen));
    const el=document.createElement('div');
    el.className='mis'+(locked?' lock':'')+(chosenMission===i?' sel':'');
    el.innerHTML='<div class="num">'+(i+1)+'</div><div><div class="mn">'+kuldNev(m.name)+'</div>'
      +'<div class="mb">'+kuldBrief(m.brief)+'</div>'
      +(campDone(i,chosen)?'<div class="done">'+T('kuldTeljesitve')+'</div>':'')+'</div>';
    if(!locked) el.onclick=()=>{
      chosenMission=i; SFX.init(); SFX.play('select');
      renderMissions(); updateStart();
    };
    wrap.appendChild(el);
  });
}
function updateStart(){
  const b=$('startBtn');
  const ok=chosen&&(mode==='free'||chosenMission>=0);
  b.disabled=!ok;
  if(!chosen) b.textContent='Válassz nemzetet';
  else if(mode==='camp'&&chosenMission<0) b.textContent='Válassz küldetést';
  else if(mode==='camp') b.textContent=(chosenMission+1)+'. küldetés — '+NATIONS[chosen].name;
  else b.textContent='Indulás — '+NATIONS[chosen].name;
}
function setMode(m){
  mode=m;
  $('modeFree').classList.toggle('on',m==='free');
  $('modeCamp').classList.toggle('on',m==='camp');
  const mp=$('modePirate');
  if(mp&&mp.classList) mp.classList.toggle('on',m==='pirate');
  $('missions').style.display=(m==='camp'||m==='pirate')?'flex':'none';
  // A kalózmódban csak a három frakció közül lehet választani, a többi
  // nemzetből egyet sem — és fordítva.
  chosen=null; chosenMission=-1;
  renderNations();
  if(m==='camp'||m==='pirate') renderMissions();
  updateStart(); SFX.init(); SFX.play('click');
}
/* ---------- Főmenü: lapok közötti váltás ---------- */
/* A nyelvválasztó rögzített helyen áll, ezért magától nem tűnne el a
   menüvel — játék közben ott lógna a képernyő sarkában. Ezért a menü
   megjelenítésével együtt kapcsoljuk. */
function langBoxShow(v){
  const e=$('langBox');
  if(e&&e.classList&&e.classList.toggle) e.classList.toggle('on',!!v);
  if(!v){ const l=$('langList'); if(l&&l.classList) l.classList.remove('on'); }
}
function menuPage(p){
  const mm=$('mainMenu'), np=$('newPanel'), sp=$('setPanel'), hp=$('help');
  if(!mm||!np||!np.classList||!np.classList.toggle) return;
  mm.style.display=(p==='main')?'flex':'none';
  np.classList.toggle('on',p==='new');
  sp.classList.toggle('on',p==='set');
  const ap=$('achPanel');
  if(ap&&ap.classList) ap.classList.toggle('on',p==='ach');
  const netLap=$('netPanel');
  if(netLap&&netLap.classList&&netLap.classList.toggle) netLap.classList.toggle('on',p==='net');
  const egyLap=$('egyPanel');
  if(egyLap&&egyLap.classList&&egyLap.classList.toggle){
    egyLap.classList.toggle('on',p==='egy');
    if(p==='egy'&&typeof frissitFolytatas==='function') frissitFolytatas();
  }
  const szLap=$('szobaPanel');
  if(szLap&&szLap.classList&&szLap.classList.toggle){
    szLap.classList.toggle('on',p==='szoba');
    if(p==='szoba'&&typeof szobaNyit==='function') szobaNyit();
  }
  if(hp) hp.style.display=(p==='main')?'block':'none';
  SFX.init(); SFX.play('click');
}
// Kilépés: böngészőben csak akkor záródik be a lap, ha a játék nyitotta meg.
// Ha nem sikerül, legalább megmondjuk, mi történik.
let quitArmed=false;
function quitGame(){
  if(!quitArmed){
    quitArmed=true;
    $('mQuit').textContent=T('kilepesBiztos');
    $('menuNote').textContent=T('mentetlenElvesz');
    return;
  }
  quitArmed=false;
  $('mQuit').textContent=T('kilepes');
  try{ window.close(); }catch(e){}
  setTimeout(()=>{
    $('menuNote').textContent=T('nemZarhatoBe');
  },250);
}
/* ---------- Többjátékos, visszajátszás, kegyelemlevél ----------

   FONTOS: ez a blokk korábban a quitGame() belsejébe csúszott, a „biztos
   kilépsz?” ágba. Ott a bekötések csak akkor futottak le, ha a játékos
   egyszer rákattintott a Kilépés gombra — addig a Többjátékos, a
   Visszajátszás megnyitása, a Visszajátszás mentése és a Kegyelemlevél
   gomb néma volt. Most a menü felépítésekor kötjük be, ahogy a többit. */
function initMenuExtra(){
  /* Visszajátszás megnyitása. Eddig csak MENTENI lehetett — a lejátszás
     kódja készen állt, de nem vezetett hozzá út a felületről. */
  if($('mReplayLoad')) $('mReplayLoad').onclick=()=>{
    SFX.init(); SFX.play('click');
    const f=$('replayFile'); if(f&&f.click) f.click();
  };
  if($('replayFile')) $('replayFile').onchange=(e)=>{
    const f=e.target.files&&e.target.files[0];
    if(!f) return;
    const o=new FileReader();
    o.onload=()=>{
      let r; try{ r=JSON.parse(o.result); }catch(err){ toast(T('uzSerultFajl')); return; }
      if(typeof replayIndit==='function'&&replayIndit(r)){
        $('menu').style.display='none';
        if(typeof langBoxShow==='function') langBoxShow(false);
      }else toast(T('uzSerultFajl'));
    };
    o.readAsText(f);
    e.target.value='';
  };

  /* TÖBBJÁTÉKOS.
     A szerver a saját géped: néhány száz bájt megy át másodpercenként,
     mert csak a parancsok utaznak. A gomb a kapcsolódás lapjára visz;
     onnan, ha létrejött a szoba, a szobaképernyő veszi át. */
  if($('mNet')) $('mNet').onclick=()=>{
    setTimeout(()=>{ if(typeof netListaLekerdez==='function') netListaLekerdez(false); },120); menuPage('net'); SFX.init(); SFX.play('click'); };

  /* A szerver címét megjegyezzük. Interneten át ez egy hosszú név vagy
     cím — kár lenne minden alkalommal újra begépelni. */
  const NET_CIM_TAR='birodalom_netcim';
  const NET_NEV_TAR='birodalom_nev';
  /* A név ugyanúgy megjegyződik, mint a szerver címe: minden
     csatlakozásnál újra begépelni fölösleges bosszúság. */
  try{
    const mentettNev=tarolOlvas(NET_NEV_TAR);
    if(mentettNev&&$('netNev')) $('netNev').value=mentettNev;
  }catch(e){}
  /* Egy helyen dől el, mi a neved — és hogy egyáltalán megadtad-e.
     Üres névvel nem engedünk csatlakozni: a „Vendég 2” senkinek nem mond
     semmit egy hat fős szobában. */
  const sajatNev=()=>{
    const m=$('netNev');
    const n=((m&&m.value)||'').trim().replace(/[<>&"']/g,'').slice(0,24);
    if(!n){
      netAll(T('netNevKell'));
      if(m&&m.focus) m.focus();
      SFX.play('deny');
      return null;
    }
    try{ tarolIr(NET_NEV_TAR, n); }catch(e){}
    return n;
  };
  try{
    const mentett=tarolOlvas(NET_CIM_TAR);
    if(mentett&&$('netCim')) $('netCim').value=mentett;
  }catch(e){}
  const netCimMent=(cim)=>{ try{ tarolIr(NET_CIM_TAR,cim); }catch(e){} };
  /* A szobaképernyőnek is kell a cím a meghívóhoz — ezért kivezetjük. */
  window.netCimOlvas=()=>{
    const e=$('netCim');
    if(e&&e.value) return e.value.trim();
    try{ return tarolOlvas(NET_CIM_TAR)||''; }catch(err){ return ''; }
  };

  /* --- NYITOTT SZOBÁK ---
     A szerver megmondja, mely szobák várnak még játékosra. A listából egy
     kattintással be lehet lépni — kódot gépelni csak akkor kell, ha
     valaki külön megadta. */
  /* A lista NÉGY állapotot vehet fel, és mindegyiket ki kell írni,
     különben a gomb megnyomása után csak annyit látni, hogy „nem történt
     semmi”:

       keresés  — a kérés elment, várunk a válaszra
       üres     — a szerver válaszolt, de nincs nyitott szoba
       lista    — a szobák, belépőgombbal
       hiba     — nem sikerült elérni a szervert                        */
  const netListaAllapot=(osztaly,szoveg)=>{
    const doboz=$('netSzobak');
    if(!doboz||!doboz.appendChild) return;
    doboz.innerHTML='';
    const p=document.createElement('div');
    p.className=osztaly; p.textContent=szoveg;
    doboz.appendChild(p);
  };
  window.netListaKeres=()=>netListaAllapot('netKeres',T('netListaKer'));
  window.netListaHiba =()=>{
    netListaAllapot('netHiba', T('netListaHiba'));
    /* Az állapotsor NEM ismétli meg a hibát — csak visszaáll az
       alaphelyzetbe. A részletes üzenet közvetlenül a gomb alatt áll,
       ott a helye; kétszer kiírva viszont csak zaj.

       (Először ide is beírtam, és a képernyőn egymás alatt kétszer
       szerepelt ugyanaz a mondat.) */
    netAll(T('nincsKapcsolat'),'rossz');
  };

  window.netSzobaLista=function netSzobaLista(lista){
    const doboz=$('netSzobak');
    if(!doboz||!doboz.appendChild) return;
    doboz.innerHTML='';
    if(!lista||!lista.length){
      netListaAllapot('netUres',T('netNincsSzoba'));
      /* A szerver VÁLASZOLT, csak épp üres — ez nem hiba, tehát a pötty
         se legyen piros. Kifejezetten megmondjuk, mert a lekérdező
         kapcsolat addigra már lezárult, és az állapotból nem derülne ki,
         hogy sikeres volt-e. */
      netAll(T('nincsKapcsolat'),'ki');
      return;
    }
    netAll(T('netKeszSzobak'),'ki');
    /* Fejléc, hogy a számok magyarázat nélkül is érthetők legyenek. */
    const fej=document.createElement('div');
    fej.className='netSzobaFej';
    fej.textContent=lista.length+' '+T('netNyitottSzoba');
    doboz.appendChild(fej);
    for(const sz of lista){
      const sor=document.createElement('div');
      sor.className='netSzobaSor';
      /* A sor DOM-ból épül, nem összefűzött HTML-ből. A házigazda NEVÉT
         egy másik kliens adja meg — ha innerHTML-be tennénk, egy
         módosított kliens tetszőleges HTML-t (és szkriptet) juttathatna a
         te ablakodba pusztán azzal, hogy így nevezi el magát. Az asztali
         alkalmazásban ez a mentéseidhez is hozzáférne a hídon át.

         A textContent nem értelmez semmit: ami név, az név marad. */
      const bal=document.createElement('span');
      const kod=document.createElement('b');
      kod.textContent=sz.kod;
      const nev=document.createTextNode(' — '+(sz.nev||''));
      const letszam=document.createElement('i');
      letszam.textContent=' '+sz.fo+'/'+sz.max+' '+T('netSzobaFo');
      bal.appendChild(kod); bal.appendChild(nev); bal.appendChild(letszam);
      const gomb=document.createElement('button');
      gomb.className='mbtn'; gomb.textContent=T('netBelep');
      gomb.onclick=()=>{
        const nev=sajatNev(); if(!nev) return;
        const cim=($('netCim').value||'').trim();
        netCimMent(cim);
        $('netKod').value=sz.kod;
        netAll(T('netKapcsolodas'));
        SFX.init(); SFX.play('click');
        if(typeof netCsatlakoz==='function') netCsatlakoz(cim,'csatlakoz',sz.kod,netVisszajelzes,nev);
      };
      sor.appendChild(bal); sor.appendChild(gomb);
      doboz.appendChild(sor);
    }
  };
  /* Az állapotsor és a mellette lévő pötty EGYÜTT mozog. A pötty
     színe a hálózati állapotból jön, nem a szövegből: így akkor is
     helyes, ha az üzenet más nyelven más hosszú. */
  const netAll=(sz,jelzes)=>{
    const e=$('netAllapot'); if(e) e.textContent=sz;
    const p=$('netPont'); if(!p) return;
    p.className='netPont';
    const n=(typeof netAllapot==='function')?netAllapot():null;
    const a=jelzes||(n&&n.allapot);
    if(a==='kapcsolodik'||a==='keres') p.classList.add('keres');
    else if(a==='varakozik'||a==='jatek') p.classList.add('jo');
    else if(a==='hiba'||a==='rossz') p.classList.add('rossz');
  };
  const netVisszajelzes=(mi,adat)=>{
    if(mi==='nyilt') netAll(T('netSzobaNyitva')+': '+adat);
    else if(mi==='csatlakozott') netAll(T('netCsatlakoztal'));
    else if(mi==='tars') netAll(T('netTarsMegjott')+': '+adat);
    /* Amint létrejött a kapcsolat, a SZOBA veszi át: ott dől el a
       felállás. A kapcsolódás lapja csak a címért és a kódért kellett. */
    if(mi==='nyilt'||mi==='csatlakozott') menuPage('szoba');
  };
  if($('netNyit')) $('netNyit').onclick=()=>{
    const nev=sajatNev(); if(!nev) return;
    SFX.init(); SFX.play('click');

    /* --- BEÉPÍTETT SZERVER ---
       Az asztali alkalmazásban a HÁZIGAZDA gépén indul a szerver,
       automatikusan. Így nem kell külön futtatni semmit, és nem kell,
       hogy bárki más gépe be legyen kapcsolva.

       Ha van cloudflared a gépen, azt is elindítjuk: akkor interneten át
       is elérhető. Ha nincs, marad a helyi hálózat — ezt meg is mondjuk,
       hogy a játékos tudja, mire számítson.

       Böngészőben ez nem elérhető (nincs mit elindítani), ott marad a
       kézzel megadott cím. */
    /* --- PEERJS P2P (elsődleges) → BEÉPÍTETT SZERVER (visszaesés) ---

       A PeerJS Cloud ingyenes signaling-jával közvetlen kapcsolat jön
       létre a két böngésző között — nincs szükség szervergépre.
       Ha a PeerJS nem elérhető (erős NAT, tűzfal), automatikusan
       visszavált a cloudflared-es beépített szerverre. */
    const wsNyit=(cim)=>{
      $('netCim').value=cim;
      netCimMent(cim);
      netAll(T('netKapcsolodas'),'kapcsolodik');
      if(typeof netCsatlakoz==='function') netCsatlakoz(cim,'nyit','',netVisszajelzes,nev);
    };

    if(typeof peerHalozat!=='undefined'&&peerHalozat.nyit){
      netAll('Kapcsolódás P2P…','keres');
      peerHalozat.nyit(nev,(esemeny,adat)=>{
        if(esemeny==='nyilt'){
          /* A szoba-kód megvan; a meghívóban CSAK a kód kell, nincs IP */
          G.netMeghivoCim='peer';
          netVisszajelzes(esemeny,adat);
        }else if(esemeny==='hiba'){
          /* P2P nem sikerült: visszaesés beépített szerverre */
          toast('P2P nem sikerült, szerveres módra váltás…');
          const hid=(typeof window!=='undefined'&&window.birodalom&&window.birodalom.szerver)
            ? window.birodalom.szerver : null;
          if(hid){
            netAll(T('netSajatSzerver'),'keres');
            if(hid.letoltesFigyel) hid.letoltesFigyel((sz)=>{
              netAll(T('netEszkozLetoltes')+'  '+sz+'%','keres');
            });
            hid.indit(8787).then((r)=>{
              if(!r||r.hiba){ wsNyit(($('netCim').value||'').trim()); return; }
              const kifele=r.alagut?r.alagut
                :((r.helyi&&r.helyi[0])?('ws://'+r.helyi[0]+':'+r.kapu):('ws://127.0.0.1:'+r.kapu));
              G.netMeghivoCim=kifele;
              if(r.alagut) toast(T('netAlagutKesz'));
              else toast(T('netCsakHelyi'));
              const n=netAllapot(); n.mod2='ws';
              wsNyit('ws://127.0.0.1:'+r.kapu);
            }).catch(()=>wsNyit(($('netCim').value||'').trim()));
          }else{
            const n=netAllapot(); n.mod2='ws';
            wsNyit(($('netCim').value||'').trim());
          }
        }else{
          netVisszajelzes(esemeny,adat);
        }
      });
      return;
    }
    /* PeerJS modul nem töltődött be: sima szerveres mód */
    const hid2=(typeof window!=='undefined'&&window.birodalom&&window.birodalom.szerver)
      ? window.birodalom.szerver : null;
    if(!hid2){ wsNyit(($('netCim').value||'').trim()); return; }
    netAll(T('netSajatSzerver'),'keres');
    if(hid2.letoltesFigyel) hid2.letoltesFigyel((sz)=>{
      netAll(T('netEszkozLetoltes')+'  '+sz+'%','keres');
    });
    hid2.indit(8787).then((r)=>{
      if(!r||r.hiba){ wsNyit(($('netCim').value||'').trim()); return; }
      const kifele=r.alagut?r.alagut
        :((r.helyi&&r.helyi[0])?('ws://'+r.helyi[0]+':'+r.kapu):('ws://127.0.0.1:'+r.kapu));
      G.netMeghivoCim=kifele;
      if(r.alagut) toast(T('netAlagutKesz'));
      else if(r.cfHiba) toast(T('netCsakHelyi')+' — '+r.cfHiba);
      else toast(T('netCsakHelyi'));
      const n=netAllapot(); n.mod2='ws';
      wsNyit('ws://127.0.0.1:'+r.kapu);
    }).catch(()=>{ wsNyit(($('netCim').value||'').trim()); });
    return;
  };
  if($('netCsatl')) $('netCsatl').onclick=()=>{
    const nev=sajatNev(); if(!nev) return;
    /* A mezőbe a TELJES meghívó is beilleszthető — ilyenkor a szervercím
       is onnan jön, és felülírja a fölötte állót. Így a vendégnek
       egyetlen dolgot kell beillesztenie, nem kettőt. */
    const bont=(typeof meghivoBont==='function')
      ? meghivoBont($('netKod').value, ($('netCim').value||'').trim())
      : {cim:($('netCim').value||'').trim(), kod:($('netKod').value||'').trim().toUpperCase()};
    let cim=bont.cim, kod=bont.kod;
    if(kod.length<4){ netAll(T('netKodKell')); return; }
    $('netKod').value=kod;
    SFX.init(); SFX.play('click');

    /* PeerJS: csak a 4 betűs kód kell, nincs szervercím */
    if(typeof peerHalozat!=='undefined'&&peerHalozat.csatlakoz&&(!cim||cim==='peer')){
      netAll(T('netKapcsolodas'),'kapcsolodik');
      peerHalozat.csatlakoz(kod,nev,(esemeny,adat)=>{
        if(esemeny==='hiba'){
          /* Visszaesés: WS szerver */
          if(cim&&cim!=='peer'){
            netAll(T('netKapcsolodas'));
            if(typeof netCsatlakoz==='function') netCsatlakoz(cim,'csatlakoz',kod,netVisszajelzes,nev);
          }else{
            netAll(adat||T('netNemSikerult'));
          }
        }else{
          netVisszajelzes(esemeny,adat);
        }
      });
      return;
    }
    /* Hagyományos WS mód */
    if(!cim){ netAll(T('netCimKell')); return; }
    $('netCim').value=cim;
    netCimMent(cim);
    netAll(T('netKapcsolodas'));
    if(typeof netCsatlakoz==='function') netCsatlakoz(cim,'csatlakoz',kod,netVisszajelzes,nev);
  };
  /* A szobalista gombja IDE tartozik, nem a menü felépítésébe: a
     netCimMent, a netAll és a netVisszajelzes ennek a függvénynek a helyi
     változói. Máshonnan hivatkozva „nincs ilyen név” hibát dobott, és a
     gomb néma maradt. Ugyanaz a fajta tévedés, mint korábban a Csata
     gombjánál — érdemes minden bekötésnél megnézni, hol élnek a segédek. */
  if($('netLista')) $('netLista').onclick=()=>{ netListaLekerdez(true); };
  /* A lekérdezés külön függvény, mert a panel megnyitásakor magától is
     lefut: enélkül a játékosnak előbb rá kell jönnie, hogy van gomb. */
  window.netListaLekerdez=(kattintas, szerverKesz)=>{
    /* HA MÁR VAN KAPCSOLAT, nem kérdezünk. A lekérdezés új kapcsolatot
       nyit, és ezzel elvágná a meglévőt — aki épp egy szobában ül vagy
       játszik, kiesne a játszmából pusztán attól, hogy megnyitotta a
       többjátékos lapot. */
    const n=(typeof netAllapot==='function')?netAllapot():null;
    if(n&&(n.allapot==='varakozik'||n.allapot==='jatek')){
      if(kattintas) netAll(T('netMarKapcsolodva'));
      return;
    }

    /* A BEÉPÍTETT SZERVER indítása, ha van ilyen.

       Eddig csak a „Szoba nyitása" indította el. Aki viszont előbb a
       „Nyitott szobák lekérdezése" gombot nyomta meg — ami a lap tetején
       van, tehát természetes első lépés —, az azt látta, hogy „a szerver
       nem érhető el ezen a címen". Pedig a saját gépén ott a szerver,
       csak épp nem futott.

       A `szerverKesz` jelzi, hogy ezt a kört már megjártuk: enélkül
       végtelen körbe futnánk. */
    const listaHid=(typeof window!=='undefined'&&window.birodalom&&window.birodalom.szerver)
      ? window.birodalom.szerver : null;
    if(listaHid && kattintas && !szerverKesz){
      netAll(T('netSajatSzerver'),'keres');
      netListaKeres();
      listaHid.indit(8787).then((r)=>{
        if(r && !r.hiba){
          /* A MEGHÍVÓBA a kifelé használható cím kerül; magunkhoz a
             helyi hurokcímen kapcsolódunk. */
          G.netMeghivoCim = r.alagut
            ? r.alagut
            : ((r.helyi&&r.helyi[0]) ? ('ws://'+r.helyi[0]+':'+r.kapu) : ('ws://127.0.0.1:'+r.kapu));
          $('netCim').value = 'ws://127.0.0.1:'+r.kapu;
        }
        netListaLekerdez(kattintas, true);
      }).catch(()=>netListaLekerdez(kattintas, true));
      return;
    }

    /* A BEÉPÍTETT SZERVER indítása, ha van ilyen.

       Eddig csak a „Szoba nyitása" indította el. Aki viszont előbb a
       „Nyitott szobák lekérdezése" gombot nyomta meg — ami a lap tetején
       van, tehát természetes első lépés —, az azt látta, hogy „a szerver
       nem érhető el ezen a címen". Pedig a saját gépén ott a szerver,
       csak épp nem futott.

       A `szerverKesz` jelzi, hogy ezt a kört már megjártuk: enélkül
       végtelen körbe futnánk. */
    const hid=(typeof window!=='undefined'&&window.birodalom&&window.birodalom.szerver)
      ? window.birodalom.szerver : null;
    if(hid && kattintas && !szerverKesz){
      netAll(T('netSajatSzerver'),'keres');
      netListaKeres();
      hid.indit(8787).then((r)=>{
        if(r && !r.hiba){
          G.netMeghivoCim = r.alagut
            ? r.alagut
            : ((r.helyi&&r.helyi[0]) ? ('ws://'+r.helyi[0]+':'+r.kapu) : ('ws://127.0.0.1:'+r.kapu));
          $('netCim').value = 'ws://127.0.0.1:'+r.kapu;
        }
        netListaLekerdez(kattintas, true);
      }).catch(()=>netListaLekerdez(kattintas, true));
      return;
    }

    const cim=($('netCim').value||'').trim();
    if(!cim){ netListaHiba(); return; }
    netCimMent(cim);
    netAll(T('netListaKer'),'keres');
    netListaKeres();
    if(kattintas){ SFX.init(); SFX.play('click'); }
    if(typeof netCsatlakoz!=='function'){ netListaHiba(); return; }
    netCsatlakoz(cim,'lista','',netVisszajelzes);
    /* Ha nyolc másodperc alatt nem jött válasz, az a szerver hiánya —
       a lista ne maradjon örökre „keresés" állapotban. */
    const kezdet=Date.now();
    setTimeout(()=>{
      const d=$('netSzobak');
      if(d&&d.querySelector('.netKeres')&&Date.now()-kezdet>=7500) netListaHiba();
    },8000);
  };
  if($('miReplay')) $('miReplay').onclick=()=>{
    if(typeof replayMent!=='function'||!G.on) return;
    const r=replayMent();
    const blob=new Blob([JSON.stringify(r)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='birodalom-visszajatszas-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();
    toast(T('uzVisszajatszasMentve')+': '+r.naplo.length+' '+T('uzParancsDb'));
    SFX.play('click');
  };
  if($('fmPardon')) $('fmPardon').onclick=()=>{ if(typeof kegyelemKer==='function') kegyelemKer(); };

}
/* ---------- Beállítások ---------- */
function segSet(id,val,fn){
  const box=$(id);
  if(!box||!box.querySelectorAll) return;
  for(const b of box.querySelectorAll('button')){
    b.onclick=()=>{
      for(const o of box.querySelectorAll('button')) o.classList.remove('on');
      b.classList.add('on');
      SFX.init(); SFX.play('click');
      fn(b.dataset.v);
    };
    if(String(b.dataset.v)===String(val)) b.classList.add('on');
  }
}
function initSettings(){
  segSet('segUi',G.uiMode,v=>{ G.uiMode=v; G.zoomUser=false; resize(); centerOnBase&&G.on&&centerOnBase(); });
  /* --- A beállítások fülei ---
     Három fejezet: Grafika, Hangok, Irányítás. A megnyitott fül a
     panelen belül marad, tehát nem kell újra megkeresni, ha visszatérsz. */
  {
    const tabok=$('setTabs');
    if(tabok&&tabok.querySelectorAll){
      const valt=(mit)=>{
        for(const b of tabok.querySelectorAll('button')) b.classList.toggle('on', b.dataset.tab===mit);
        for(const p of document.querySelectorAll('#setPanel .setTab'))
          p.classList.toggle('on', p.id==='tab'+mit.charAt(0).toUpperCase()+mit.slice(1));
      };
      for(const b of tabok.querySelectorAll('button'))
        b.onclick=()=>{ valt(b.dataset.tab); SFX.init(); SFX.play('click'); };
      valt('graf');
    }
  }
  /* Gyorsbillentyűk: a lista és az alaphelyzet gombja. */
  if(typeof billBetolt==='function') billBetolt();
  if(typeof billLista==='function') billLista();
  if($('billReset')&&typeof billAlaphelyzet==='function')
    $('billReset').onclick=()=>{ billAlaphelyzet(); SFX.init(); SFX.play('click'); };
  if(typeof initFullScreen==='function') initFullScreen();
  segSet('segFull',teljesKepernyoAllapot()?'1':'0',v=>teljesKepernyoAllit(v==='1'));
  if(typeof initResSelect==='function') initResSelect();
  segSet('segPost',G.postFx!==false?'1':'0',v=>{ G.postFx=(v==='1'); });
  segSet('segWeather',G.weatherOn?'1':'0',v=>{ G.weatherOn=(v==='1'); });
  segSet('segDay',G.dayNight?'1':'0',v=>{ G.dayNight=(v==='1'); });
  segSet('segScroll',G.scrollMode,v=>{ G.scrollMode=v; });
  segSet('segCam',G.camSpeed,v=>{ G.camSpeed=+v; });
  segSet('segEdge',G.edgeScroll?1:0,v=>{ G.edgeScroll=(v==='1'); });
  segSet('segKb',G.kb.on?1:0,v=>{ G.kb.on=(v==='1'); });
  segSet('segCb',G.cb?1:0,v=>{ if((v==='1')!==G.cb) toggleColorblind(); });
  segSet('segFx',G.fxMode,v=>{ G.fxMode=v; });
  segSet('segSfx',SFX.on?1:0,v=>{ SFX.on=(v==='1'); });
  segSet('segMus',MUSIC.on?1:0,v=>{ if((v==='1')!==MUSIC.on) MUSIC.toggle(); });
  $('volSfx').oninput=e=>{ SFX.init(); SFX.setVol(e.target.value/100); };
  $('volMus').oninput=e=>{ MUSIC.setVol(e.target.value/100); };
  $('setKeys').onclick=()=>toggleHelp(true);
}
// Natív burokban (Capacitor) elrejtjük az állapotsávot és eltüntetjük az
// indítóképet — így semmi nem árulkodik arról, hogy belül weblap van.
(function nativeSetup(){
  try{
    const C=window.Capacitor;
    if(!C||!C.isNativePlatform||!C.isNativePlatform()) return;
    document.body.classList.add('native');
    const SB=C.Plugins&&C.Plugins.StatusBar;
    if(SB&&SB.hide) SB.hide();
    const SS=C.Plugins&&C.Plugins.SplashScreen;
    if(SS&&SS.hide) setTimeout(()=>SS.hide(),400);
  }catch(e){}
})();
/* A nemzetrács tartalma a módtól függ: kalózhadjáratban csak a három
   frakció, egyébként a nyolc játszható nemzet. Ezért külön függvény —
   módváltáskor újra kell rajzolni. */
function renderNations(){
  const wrap=$('nations');
  if(!wrap) return;
  wrap.innerHTML='';
  $('bonusInfo').innerHTML='';
  for(const key in NATIONS){
    const kaloz=!!NATIONS[key].pirate;
    // Kalózmódban CSAK a frakciók; máskor a rejtettek (szigetlakók, kalózok) nem
    if(mode==='pirate'){ if(!kaloz) continue; }
    /* A rejtettek (kalózfrakciók) és a KÉSZÜLŐK is kimaradnak a
       nemzetválasztóból. */
    else if(NATIONS[key].hidden||NATIONS[key].keszul) continue;
    const n=NATIONS[key];
    const el=document.createElement('div');
    el.className='nat';
    // A menüben is a korhű zászlókép szerepel, ha van; egyébként a rajzolt
    const src=FLAG_IMG[key+'-0'] || (()=>{
      const fc=document.createElement('canvas'); fc.width=144; fc.height=72;
      FLAGS[key][0](fc.getContext('2d'),144,72);
      return fc.toDataURL();
    })();
    el.innerHTML='<img class="flag" alt="" src="'+src+'">'
      +'<div class="nm">'+((typeof nationName==='function')?nationName(key):n.name)+'</div>'
      +'<div class="rl">'+allamForma(key,0)+'<br>'+uralkodoNev(key,0)+'</div>'
      +'<div class="bn">'+bonusCim(key,BONUS[key].title)+'</div>';
    el.onclick=()=>{
      chosen=key; SFX.init(); SFX.play('select');
      $('bonusInfo').innerHTML='<b>'+bonusCim(key,BONUS[key].title)+'</b> — '+bonusSzoveg(key,BONUS[key].text);
      [...wrap.children].forEach(c=>c.classList.remove('sel'));
      el.classList.add('sel');
      applyAgeStyle(key);          // a felület azonnal felveszi a nemzet színeit
      // Minden nemzetnek saját hadjárata van: a küldetéslistát újra kell
      // rajzolni, különben az előző nemzeté maradna a képernyőn.
      chosenMission=-1;
      renderMissions();
      updateStart();
    };
    wrap.appendChild(el);
  }
}
(function initMenu(){
  /* Nyelvválasztó a jobb felső sarokban: a gomb a mostani nyelv zászlaját
     mutatja, rákattintva legördül a négy nyelv. */
  if(typeof loadLang==='function'){ loadLang(); applyLang(); }
  {
    const gomb=$('langBtn'), lista=$('langList'), nev=$('langName');
    if(gomb&&lista&&lista.appendChild){
      const frissit=()=>{
        const ny=NYELVEK.filter(x=>x.k===LANG)[0]||NYELVEK[0];
        const ikon=gomb.querySelector&&gomb.querySelector('i');
        if(ikon) ikon.className='fl-'+ny.k;
        if(nev) nev.textContent=ny.nev;
        const gy=lista.children;
        for(let i=0;i<gy.length;i++)
          if(gy[i].classList&&gy[i].getAttribute)
            gy[i].classList.toggle('on', gy[i].getAttribute('data-k')===LANG);
      };
      lista.innerHTML='';
      for(const ny of NYELVEK){
        const b=document.createElement('button');
        if(b.setAttribute) b.setAttribute('data-k',ny.k);
        b.innerHTML='<i class="fl-'+ny.k+'"></i>'+ny.nev;
        b.onclick=(e)=>{
          e.stopPropagation();
          setLang(ny.k);
          frissit();
          lista.classList.remove('on');
          SFX.init(); SFX.play('click');
          /* MINDEN panelt újrarajzolunk: a nemzetek, a korszakok, a tájak
             és a nehézségek nevei is fordulnak. Enélkül a nemzetválasztó
             fele magyar maradt, és úgy tűnt, a nyelvváltás nem működik. */
          /* A panelek újrarajzolását az applyLang() intézi — lásd 00c-lang.js. */
        };
        lista.appendChild(b);
      }
      gomb.onclick=(e)=>{ e.stopPropagation(); lista.classList.toggle('on'); };
      if(document.addEventListener)
        document.addEventListener('click',()=>lista.classList.remove('on'));
      frissit();
    }
  }
  langBoxShow(true);          // a menü indul, tehát a választó is látszik
  renderNations();
  $('modeFree').onclick=()=>setMode('free');
  $('modeCamp').onclick=()=>setMode('camp');
  if($('modePirate')) $('modePirate').onclick=()=>setMode('pirate');
  $('mNew').onclick=()=>{ menuPage('new'); renderDiffs(); renderEras(); renderMaps(); updateStart(); };
  $('mSet').onclick=()=>{ menuPage('set'); initSettings(); };
  /* --- Szoba ---
     A bekötés a MENÜ felépítésekor fut, nem a beállításokéban: az
     initSettings() csak a Beállítások gombra hívódik meg, tehát aki
     egyenesen a Csata gombra kattintott, annak semmi nem történt. */
  if($('mSzoba')) $('mSzoba').onclick=()=>{ menuPage('szoba'); SFX.init(); SFX.play('click'); };
  if($('szobaBot')&&typeof szobaBotAd==='function') $('szobaBot').onclick=szobaBotAd;
  if($('szobaStart')&&typeof szobaIndit==='function') $('szobaStart').onclick=szobaIndit;
  /* Oktatómód: könnyű szabad játszma magyar nemzettel, vezetett lépésekkel.
     Az ellenség lassabban indul, hogy legyen idő tanulni. */
  if($('mTutor')) $('mTutor').onclick=()=>{
    SFX.init(); SFX.play('click');
    chosen='hu'; mode='free'; G.pirate=false;
    /* A G.diff a DIFF tömb SORSZÁMA, nem a kulcsa. Amíg 'easy' string
       állt itt, a DIFF[G.diff] undefined lett, és a newGame a
       DIFF[G.diff].wave sorban elszállt — az Oktatómód gomb egyszerűen
       nem indított semmit. */
    if(typeof netTisztaLap==='function') netTisztaLap();
    G.diff=0; G.startAge=0; G.mapPick='mezo';
    $('menu').style.display='none'; if(typeof langBoxShow==='function') langBoxShow(false);
    newGame('hu',-1);
    if(typeof tutorStart==='function') tutorStart();
  };
  // Változatszám a sarokban
  const vt=$('verTag');
  if(vt) vt.textContent='v'+GAME_VERSION;
  $('mAch').onclick=()=>{ menuPage('ach'); renderAch(); };
  /* A Folytatás KIZÁRÓLAG a játékban tárolt mentést tölti vissza — nem nyit
     fájlválasztót. A fájlból betöltés külön menüpont. */
  /* A FOLYTATÁS a böngészőbe mentett állást tölti vissza; a KORÁBBI
     BETÖLTÉSE fájlból. Régen egyetlen gomb volt rá a főmenüben, és a
     fájlból töltés máshonnan indult — így senki nem találta meg. */
  if($('mFolyt')) $('mFolyt').onclick=()=>{
    SFX.init(); SFX.play('click');
    const q=(typeof storedSave==='function')?storedSave():null;
    if(!q){ toast(T('uzNincsMentes')); SFX.play('deny'); return; }
    loadState(q);
  };
  if($('mLoad')) $('mLoad').onclick=()=>{
    SFX.init(); SFX.play('click');
    const f=$('loadFile'); if(f) f.click();
  };
  if($('mEgy')) $('mEgy').onclick=()=>{ menuPage('egy'); SFX.init(); SFX.play('click'); };
  /* A mentésmappa gombja csak az asztali alkalmazásban látszik: böngészőben
     nincs mit megnyitni, ott a böngésző tárolójában ülnek az állások. */
  if($('mMappa')){
    if(typeof taroloFajlba==='function'&&taroloFajlba()){
      $('mMappa').style.display='';
      $('mMappa').onclick=()=>{ SFX.init(); SFX.play('click'); taroloMappaNyit(); };
    }
    const jegy=$('egyNote');
    if(jegy&&typeof taroloFajlba==='function'&&taroloFajlba())
      jegy.textContent=T('mentesFajlba');
  }
  /* A Betöltés fájlból gomb kikerült a főmenüből (v2.7). A bekötése viszont
     itt maradt, és mivel az elem már nem létezik, az egész menüfelépítés
     elhasalt ezen a soron — utána egyetlen gomb sem kapott eseménykezelőt.
     Innentől minden bekötés ellenőrzi, hogy létezik-e az elem. */
  if($('mImport'))
    $('mImport').onclick=()=>{ SFX.init(); SFX.play('click'); $('loadFile').click(); };
  window.frissitFolytatas=function frissitFolytatas(){
    const b=$('mFolyt');
    if(!b||!b.style) return;
    const i=(typeof storedSaveInfo==='function')?storedSaveInfo():null;
    if(i){
      b.textContent=T('mFolytatas')+' — '+i.nemzet+', '+i.korszak+' ('+i.perc+':'+
        String(i.mp).padStart(2,'0')+')';
      b.disabled=false; b.style.opacity='';
    }else{
      b.textContent=T('mFolytatas')+' — '+T('uzNincsMentes').replace(/\.$/,'');
      b.disabled=true; b.style.opacity='.45';
    }
  };
  frissitFolytatas();
  $('mQuit').onclick=quitGame;
  if(document.querySelectorAll)
    /* Mindkét jelölésre figyelünk. A többjátékos panel Vissza gombján
       csak a `back` osztály volt rajta, a data-back jelölő nem — a gomb
       ezért néma maradt, és a panelból nem lehetett visszajönni.
       Így egy új panelnél sem fordulhat elő ugyanez. */
    for(const b of document.querySelectorAll('[data-back], .back'))
      b.onclick=()=>menuPage('main');
  initMenuExtra();
  menuPage('main');
  $('startBtn').onclick=()=>{
    if(!chosen||(mode==='camp'&&chosenMission<0)) return;
    /* Egyszemélyes játszma: minden hálózati maradványt eldobunk. Enélkül
       egy korábbi többjátékos menet után a szimuláció továbbra is a
       társakra várt volna, és a világ a régi felállással jött volna
       létre. */
    if(typeof netTisztaLap==='function') netTisztaLap();
    SFX.init(); SFX.play('age'); MUSIC.start();
    $('menu').style.display='none'; if(typeof langBoxShow==='function') langBoxShow(false);
    G.pirate=(mode==='pirate');
    newGame(chosen, (mode==='camp'||mode==='pirate')?chosenMission:-1);
    // Előbb bemutatkozik az uralkodó, csak utána jön az ideológiaválasztás
    // A mobilböngésző címsora az indítás pillanatában még mozoghat, ezért
    // a méretet és a kamerát az első képkockák után újra beállítjuk.
    requestAnimationFrame(()=>{ resize(); centerOnBase(); });
    setTimeout(()=>{ resize(); centerOnBase(); },300);
    // Sorrend: előbb bemutatkozik az uralkodó, utána jön az eligazítás
    // (hadjáratnál) vagy egyből az ideológiaválasztás.
    const tovabb=()=>{
      if(mode==='camp'||mode==='pirate') showBriefing(chosenMission);
      else { openDoctrine(G.age); cv.focus&&cv.focus({preventScroll:true}); }
    };
    // A bemutatkozás alatt a játék áll, de a SZÜNET felirat nem jelenik meg.
    // Ha bármi hiba csúszna a bemutatkozásba, a játék akkor is elindul.
    if(typeof showIntro==='function'){
      let ment=false;
      const folytat=()=>{ if(ment) return; ment=true; G.introOn=false; tovabb(); };
      try{
        G.introOn=true;
        showIntro(chosen, G.age, folytat);
      }catch(e){ folytat(); }
    }else tovabb();
  };
})();

  /* A FRISSÍTÉSFIGYELŐ a menü felépítése után jön elő: az ablak a menü
     fölé kerül, tehát amíg be nem zárod, nem tudsz új játékot kezdeni. */
  setTimeout(()=>{ if(typeof patchIndul==='function') patchIndul(); }, 250);
})();
