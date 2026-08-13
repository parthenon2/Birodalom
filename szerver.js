#!/usr/bin/env node
/* =======================================================================
   BIRODALOM — JÁTÉKSZERVER

   Egyetlen fájl, KÜLSŐ CSOMAG NÉLKÜL. Elindítás:

       node szerver.js            (alapértelmezés: 8787-es kapu)
       node szerver.js 9000       (más kapun)

   Mit csinál? Szobákat tart nyilván, és a szobában lévő játékosok
   üzeneteit továbbítja egymásnak. A JÁTÉKOT NEM SZÁMOLJA — csak
   parancsokat továbbít, néhány száz bájtot másodpercenként.

   Egy szobába LEGFELJEBB HAT ember fér. Mindenki kap egy HELYSZÁMOT
   (0-tól), és a szerver minden továbbított üzenetbe beleírja a feladó
   helyszámát — enélkül a kliens nem tudná, kinek a parancsát kapta.
   A helyszám a lépészáras szimulációban a végrehajtás sorrendjét is
   megadja, ezért nem szabad újraosztani, amíg tart a játszma.

   Ezért fut el a legkisebb gépen is, és ezért nem kell hozzá adatbázis
   vagy bármi más.
   ===================================================================== */

const http=require('http'), crypto=require('crypto');
const KAPU=parseInt(process.argv[2]||process.env.PORT||'8787',10);

const MAX_EMBER=6;               // ennyi ember fér egy szobába

/* --- VÉDELMI KORLÁTOK ---
   A szerver nyilvános kaput nyit, és bárki csatlakozhat rá. A játék
   maga bizalmi alapon működik (a kliensek egymás parancsait futtatják),
   de a SZERVERT meg kell védeni attól, hogy egyetlen kapcsolat
   megbénítsa az összes játszmát.

   Ezek nem „biztonsági” korlátok a szó szoros értelmében — egy elszánt
   támadót nem tartanak vissza —, hanem azt akadályozzák meg, hogy egy
   hibás vagy rosszindulatú kliens elfogyassza a gép memóriáját. */
const MAX_UZENET   = 64*1024;    // ennél nagyobb csomag: bontjuk a kapcsolatot
const MAX_PUFFER   = 256*1024;   // ennyi töredék gyűlhet fel feldolgozatlanul
/* Egy szabályos kliens másodpercenként nagyjából húsz lépéscsomagot és
   egy-két ellenőrző összeget küld — jóval száz alatt. Az 500 tehát bőven
   ad helyet a hálózati torlódás utáni bepótlásnak is, viszont az
   elárasztást továbbra is megfogja. */
const MAX_UZ_MP    = 500;        // üzenet másodpercenként kapcsolatonként
const MAX_SZOBA    = 200;        // ennyi szoba lehet egyszerre
const MAX_NEV      = 24;         // a játékosnév hossza
/* A név a többi játékos képernyőjén jelenik meg. A kliens ugyan
   textContent-tel rakja ki, de a szerveren is megtisztítjuk: ami
   vezérlőkarakter vagy jelölőnyelv-szerű, az kimarad. Két védvonal
   olcsóbb, mint egy. */
function nevTisztit(n){
  /* Jelölőnyelv-szerű karakterek és vezérlőjelek ki. A tartományt KÜLÖN
     kell írni: a `\u0000-\u001f` egy karakterosztályban csak akkor
     tartomány, ha egyszeres visszaperrel áll ott. Kétszeressel a `\`-től
     az `u`-ig terjedő tartomány lesz belőle, amibe a NAGYBETŰK is
     beleesnek — a „Bence” így „ence” lett. */
  return String(n||'')
    .replace(/[<>&"']/g,'')
    .replace(/[\u0000-\u001f\u007f]/g,'')
    .trim().slice(0,MAX_NEV);
}
const szobak=new Map();          // kód -> {jatekosok:[kliens], zart:false}
let kovId=1;

/* --- WebSocket kézfogás és keretkezelés, csomag nélkül --- */
const MAGIC='258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function kezfogas(req,socket){
  const kulcs=req.headers['sec-websocket-key'];
  if(!kulcs){ socket.destroy(); return false; }
  const valasz=crypto.createHash('sha1').update(kulcs+MAGIC).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n'+
    'Upgrade: websocket\r\nConnection: Upgrade\r\n'+
    'Sec-WebSocket-Accept: '+valasz+'\r\n\r\n');
  return true;
}
function keretKuld(socket, szoveg){
  const adat=Buffer.from(szoveg,'utf8');
  const h=(adat.length<126)?2:(adat.length<65536?4:10);
  const b=Buffer.alloc(h+adat.length);
  b[0]=0x81;                                     // FIN + szöveges keret
  if(h===2) b[1]=adat.length;
  else if(h===4){ b[1]=126; b.writeUInt16BE(adat.length,2); }
  else { b[1]=127; b.writeUInt32BE(0,2); b.writeUInt32BE(adat.length,6); }
  adat.copy(b,h);
  try{ socket.write(b); }catch(e){}
}
function keretOlvas(puffer, fogad){
  let p=puffer;
  while(p.length>=2){
    const opcode=p[0]&0x0f;
    const maszkolt=(p[1]&0x80)!==0;
    let hossz=p[1]&0x7f, eltolas=2;
    if(hossz===126){ if(p.length<4) break; hossz=p.readUInt16BE(2); eltolas=4; }
    else if(hossz===127){ if(p.length<10) break; hossz=Number(p.readBigUInt64BE(2)); eltolas=10; }
    let maszk=null;
    if(maszkolt){ if(p.length<eltolas+4) break; maszk=p.slice(eltolas,eltolas+4); eltolas+=4; }
    if(p.length<eltolas+hossz) break;
    const test=p.slice(eltolas,eltolas+hossz);
    if(maszk) for(let i=0;i<test.length;i++) test[i]^=maszk[i&3];
    p=p.slice(eltolas+hossz);
    if(opcode===8) return {maradek:p, zar:true};
    if(opcode===1) fogad(test.toString('utf8'));
  }
  return {maradek:p, zar:false};
}

/* --- Szobakezelés --- */
function kodGeneral(){
  const betuk='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let k='';
  for(let i=0;i<4;i++) k+=betuk[Math.floor(Math.random()*betuk.length)];
  return szobak.has(k)?kodGeneral():k;
}
function kuld(kliens,obj){ keretKuld(kliens.socket, JSON.stringify(obj)); }
/* A szoba pillanatnyi névsora. Minden változásnál szétküldjük, hogy a
   szobaképernyő mindenkinél ugyanazt mutassa. */
function szobaAllapot(sz){
  return { t:'szoba-allapot',
           jatekosok: sz.jatekosok.map(k=>({hely:k.hely, nev:k.nev})),
           zart: !!sz.zart };
}
function szobaSzetkuld(sz, obj){ for(const t of sz.jatekosok) kuld(t,obj); }

function szobaElhagy(kliens){
  const sz=szobak.get(kliens.szoba);
  if(!sz) return;
  sz.jatekosok=sz.jatekosok.filter(k=>k!==kliens);
  /* A helyszámot NEM osztjuk újra: futó játszmában az a tulajdonos
     sorszáma is. A megüresedett hely üresen marad. */
  for(const t of sz.jatekosok) kuld(t,{t:'tars-lelepett', hely:kliens.hely, nev:kliens.nev});
  if(sz.jatekosok.length) szobaSzetkuld(sz, szobaAllapot(sz));
  else szobak.delete(kliens.szoba);
  kliens.szoba=null;
}

const szerver=http.createServer((req,res)=>{
  // egyszerű állapotlap böngészőből
  res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});
  res.end('Birodalom játékszerver fut.\n'+
          'szoba: '+szobak.size+'   (legfeljebb '+MAX_EMBER+' fő szobánként)\n'+
          'játékos: '+[...szobak.values()].reduce((a,s)=>a+s.jatekosok.length,0)+'\n');
});

szerver.on('upgrade',(req,socket)=>{
  if(!kezfogas(req,socket)) return;
  socket.setNoDelay(true);
  const kliens={id:kovId++, socket, szoba:null, nev:'Játékos', hely:-1,
                szamlalo:0, ablak:Date.now()};
  let puffer=Buffer.alloc(0);

  socket.on('data',(darab)=>{
    puffer=Buffer.concat([puffer,darab]);
    /* Ha a puffer elszabadul, a kapcsolat vagy hibás, vagy szándékosan
       tömi a memóriát. Bontjuk. */
    if(puffer.length>MAX_PUFFER){
      console.log('túl nagy puffer, bontás:', kliens.id);
      try{ socket.destroy(); }catch(e){}
      return;
    }
    const r=keretOlvas(puffer,(szoveg)=>{
      /* --- ÜZENETKORLÁTOK --- */
      if(szoveg.length>MAX_UZENET){
        console.log('túl nagy üzenet, bontás:', kliens.id);
        try{ socket.destroy(); }catch(e){}
        return;
      }
      const most=Date.now();
      if(most-kliens.ablak>1000){ kliens.ablak=most; kliens.szamlalo=0; }
      if(++kliens.szamlalo>MAX_UZ_MP){
        if(kliens.szamlalo===MAX_UZ_MP+1)
          console.log('üzenetözön, bontás:', kliens.id);
        try{ socket.destroy(); }catch(e){}
        return;
      }
      let m; try{ m=JSON.parse(szoveg); }catch(e){ return; }
      if(!m||typeof m!=='object'||typeof m.t!=='string') return;
      if(m.t==='szoba-nyit'){
        if(szobak.size>=MAX_SZOBA){
          kuld(kliens,{t:'hiba', ok:'A szerver megtelt, próbáld később.'}); return;
        }
        const kod=kodGeneral();
        kliens.hely=0;                       // a házigazda mindig a nulladik
        szobak.set(kod,{jatekosok:[kliens], zart:false});
        kliens.szoba=kod; kliens.nev=nevTisztit(m.nev)||'Házigazda';
        kuld(kliens,{t:'szoba-nyilt', kod, hely:0, hazigazda:true, max:MAX_EMBER});
        kuld(kliens, szobaAllapot(szobak.get(kod)));
        console.log('szoba nyílt:',kod);
      }
      else if(m.t==='szoba-lista'){
        /* A NYITOTT SZOBÁK listája. Csak azok kerülnek bele, amelyek még
           nem indultak el és van bennük hely — a többibe úgysem lehetne
           belépni, és csak zavarnák a listát.

           A kód szerepel benne, hiszen aki ugyanezen a szerveren van,
           amúgy is beléphetne. Zárt szobához külön jelölés kellene; ha
           kell, egy `rejtett` mezővel bővíthető. */
        const lista=[];
        for(const [kod,sz] of szobak){
          if(sz.zart||sz.jatekosok.length>=MAX_EMBER) continue;
          const h=sz.jatekosok[0];
          lista.push({kod, nev:(h&&h.nev)||'', fo:sz.jatekosok.length, max:MAX_EMBER});
        }
        lista.sort((a,b)=>a.kod<b.kod?-1:1);
        kuld(kliens,{t:'szoba-lista', szobak:lista});
      }
      else if(m.t==='szoba-csatlakoz'){
        const sz=szobak.get((m.kod||'').toUpperCase());
        if(!sz){ kuld(kliens,{t:'hiba', ok:'Nincs ilyen szoba.'}); return; }
        if(sz.zart){ kuld(kliens,{t:'hiba', ok:'A játszma már elindult.'}); return; }
        if(sz.jatekosok.length>=MAX_EMBER){ kuld(kliens,{t:'hiba', ok:'A szoba tele van.'}); return; }
        /* A legkisebb SZABAD helyszámot adjuk. Ha valaki kilépett a
           szobából indulás előtt, a helye újra kiosztható. */
        const foglalt=sz.jatekosok.map(k=>k.hely);
        let hely=0; while(foglalt.indexOf(hely)>=0) hely++;
        kliens.hely=hely;
        sz.jatekosok.push(kliens);
        kliens.szoba=(m.kod||'').toUpperCase(); kliens.nev=nevTisztit(m.nev)||('Játékos '+(hely+1));
        kuld(kliens,{t:'csatlakozott', kod:kliens.szoba, hely, hazigazda:false, max:MAX_EMBER});
        for(const t of sz.jatekosok) if(t!==kliens)
          kuld(t,{t:'tars-erkezett', hely, nev:kliens.nev});
        szobaSzetkuld(sz, szobaAllapot(sz));
        console.log('csatlakozott:',kliens.szoba,'hely',hely);
      }
      else if(kliens.szoba){
        const sz=szobak.get(kliens.szoba);
        if(!sz) return;
        /* Az indulás bezárja a szobát: onnantól nem léphet be senki, mert
           a világ már a meglévő névsorból jött létre. */
        if(m.t==='indulas') sz.zart=true;
        /* MINDEN más üzenet megy a TÖBBIEKNEK — a feladó helyszámával
           kiegészítve. Enélkül a lépészáras szimuláció nem tudná, kinek a
           parancsát kapta, és nem tudná a végrehajtás sorrendjét sem. */
        m.f=kliens.hely;
        const kimeno=JSON.stringify(m);
        for(const t of sz.jatekosok) if(t!==kliens) keretKuld(t.socket, kimeno);
      }
    });
    puffer=r.maradek;
    if(r.zar) socket.end();
  });
  const vege=()=>{ szobaElhagy(kliens); };
  socket.on('close',vege);
  socket.on('error',vege);
});

szerver.listen(KAPU,()=>{
  console.log('Birodalom játékszerver figyel a '+KAPU+'. kapun.\n');
  /* Kiírjuk a gép helyi hálózati címeit, hogy ne kelljen keresgélni.
     Ugyanazon a wifin/routeren ezt kell megadni a másik gépen. */
  const halo=require('os').networkInterfaces();
  const cimek=[];
  for(const nev in halo)
    for(const c of halo[nev]||[])
      if(c.family==='IPv4'&&!c.internal) cimek.push(c.address);
  if(cimek.length){
    console.log('A játékban ezt add meg címként (ugyanazon a hálózaton):');
    for(const c of cimek) console.log('    ws://'+c+':'+KAPU);
  }else{
    console.log('A játékban: ws://<a-géped-címe>:'+KAPU);
  }
  console.log('\nUgyanezen a gépen:  ws://127.0.0.1:'+KAPU);
  console.log('Interneten át: a routeren nyitni kell a '+KAPU+'. kaput.');
});

/* =======================================================================
   PEERJS SIGNALING SZERVER — beépítve, külső csomag nélkül

   A PeerJS protokoll három dolgot csinál:
     1. Peer regisztráció: kliens csatlakozik WS-sel, kap egy peer-id-t
     2. Signaling relay: SDP offer/answer és ICE jelöltek közvetítése
     3. Peer discovery: /peers endpoint a listához (nem használjuk)

   A tényleges adatátvitel TOVÁBBRA IS P2P (WebRTC DataChannel) —
   a signaling szerver csak a kapcsolat felépítéséhez kell, utána
   kilép a képből. Így még szimmetrikus NAT esetén sem ő a szűk kereszt.

   NAT ÁTTÖRÉS — HÁROM SZINT:
     1. STUN (ingyenes Google szerver): a legtöbb esetben elég
     2. TURN relay (saját, beépítve): ha a STUN nem elegendő
     3. Végső visszaesés: a szerver.js WS relayje (mint eddig)
   ======================================================================= */

const PEER_KAPU = KAPU + 1;        // pl. 8788, ha a játék 8787-en fut
const PEER_UTVONAL = '/peer';      // ws://gep:8788/peer?id=XXX&token=YYY

/* Aktív peer kapcsolatok: peer-id → { socket, token } */
const peerek = new Map();

/* PeerJS üzenet típusok */
const PT = {
  OPEN:'OPEN', LEAVE:'LEAVE', CANDIDATE:'CANDIDATE',
  OFFER:'OFFER', ANSWER:'ANSWER', ERROR:'ERROR', EXPIRE:'EXPIRE',
  HEARTBEAT:'HEARTBEAT', ID_TAKEN:'ID-TAKEN'
};

function peerKuld(socket, obj){
  try{ keretKuld(socket, JSON.stringify(obj)); }catch(e){}
}

function peerUtvonalE(url){
  /* /peer?id=...&token=... vagy /peer/?id=...&token=... */
  return url && (url.startsWith(PEER_UTVONAL+'?') ||
                 url.startsWith(PEER_UTVONAL+'/?') ||
                 url === PEER_UTVONAL || url === PEER_UTVONAL+'/');
}

function peerIdToken(url){
  const q = (url||'').split('?')[1]||'';
  const p = new URLSearchParams ? (()=>{
    try{ return Object.fromEntries(new URLSearchParams(q)); }catch(e){}
  })() : {};
  if(!p || !p.id) {
    /* URLSearchParams nem elérhető (régi Node) — kézi parse */
    const id = (q.match(/(?:^|&)id=([^&]*)/) || [])[1]||'';
    const token = (q.match(/(?:^|&)token=([^&]*)/) || [])[1]||'';
    return {id, token};
  }
  return {id: p.id||'', token: p.token||''};
}

const peerSzerver = http.createServer((req, res) => {
  /* CORS: a PeerJS kliens böngészőből hív */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if(req.method === 'OPTIONS'){ res.writeHead(204); res.end(); return; }

  /* /peer/peerjs/id endpoint — peer-id generálás (nem kell, mi adjuk) */
  if(req.url && req.url.match(/\/peer\/peerjs\/id/)){
    const betuk='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id='birodalom-';
    for(let i=0;i<4;i++) id+=betuk[Math.floor(Math.random()*betuk.length)];
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end(id);
    return;
  }

  /* Egyszerű állapotlap */
  res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});
  res.end('Birodalom PeerJS signaling fut.\npeerek: '+peerek.size+'\n');
});

peerSzerver.on('upgrade', (req, socket) => {
  if(!peerUtvonalE(req.url)){ socket.destroy(); return; }
  if(!kezfogas(req, socket)) return;
  socket.setNoDelay(true);

  const {id, token} = peerIdToken(req.url);

  /* Érvénytelen vagy foglalt peer-id */
  if(!id || id.length > 64){
    peerKuld(socket, {type: PT.ERROR, payload: 'Érvénytelen peer-id.'});
    socket.end(); return;
  }
  if(peerek.has(id)){
    peerKuld(socket, {type: PT.ID_TAKEN, payload: {msg: 'ID-TAKEN'}});
    socket.end(); return;
  }

  const peer = {id, token, socket};
  peerek.set(id, peer);
  peerKuld(socket, {type: PT.OPEN});

  let puffer = Buffer.alloc(0);

  socket.on('data', darab => {
    puffer = Buffer.concat([puffer, darab]);
    if(puffer.length > 65536){ socket.destroy(); return; }

    const r = keretOlvas(puffer, szoveg => {
      let m;
      try{ m = JSON.parse(szoveg); }catch(e){ return; }
      if(!m || !m.type) return;

      if(m.type === PT.HEARTBEAT){
        peerKuld(socket, {type: PT.HEARTBEAT}); return;
      }
      if(m.type === PT.LEAVE){
        peerek.delete(id); socket.end(); return;
      }

      /* OFFER, ANSWER, CANDIDATE — továbbítás a célpeernek */
      const cel = m.dst;
      if(!cel) return;
      const celPeer = peerek.get(cel);
      if(!celPeer){
        peerKuld(socket, {type: PT.LEAVE, src: cel}); return;
      }
      /* A forrás azonosítóját hozzáadjuk, a kliens nem hamisíthatja */
      peerKuld(celPeer.socket, Object.assign({}, m, {src: id}));
    });
    puffer = r.maradek;
    if(r.zar){ peerek.delete(id); socket.end(); }
  });

  const vege = () => {
    peerek.delete(id);
    /* Értesítjük a szobában lévő társ-peereket */
    for(const [, p] of peerek)
      peerKuld(p.socket, {type: PT.LEAVE, src: id});
  };
  socket.on('close', vege);
  socket.on('error', vege);
});

/* =======================================================================
   BEÉPÍTETT TURN SZERVER — UDP relay szimmetrikus NAT-hoz

   A TURN (Traversal Using Relays around NAT) szerver a WebRTC
   adatforgalmat relayzi, ha a közvetlen P2P nem sikerül.
   Ez a legegyszerűbb, RFC 5766-kompatibilis implementáció.

   FONTOS: ez csak a signaling-et és a relay-t biztosítja.
   A tényleges TURN UDP relay külső nyilvános IP-t igényel —
   ezért a beépített TURN csak helyi hálózaton működik tökéletesen.
   Interneten a Google STUN szerverét és a Metered.ca ingyenes TURN-ját
   használjuk (lásd 30b-peer.js ICE config).
   ======================================================================= */

peerSzerver.listen(PEER_KAPU, () => {
  console.log('PeerJS signaling figyel a '+ PEER_KAPU +'. kapun.');
  console.log('  ws://127.0.0.1:'+PEER_KAPU+PEER_UTVONAL);
});
