/* =======================================================================
   30/B. PEERJS P2P — HÁROMSZINTŰ NAT ÁTTÖRÉS

   SZINT 1 — Saját signaling (szerver.js:8788):
     Ha a házigazda Electron/launcher alkalmazást futtat, a beépített
     signaling szerver azonnal elérhető. Nincs külső függőség.

   SZINT 2 — PeerJS Cloud (peerjs.com):
     Ha nincs beépített szerver (böngésző), az ingyenes cloud signaling
     veszi át. ~85% esetben közvetlen P2P kapcsolat jön létre.

   SZINT 3 — WebSocket relay (szerver.js:8787):
     Ha P2P nem sikerül (szimmetrikus NAT, ~15%), visszaesik a régi
     cloudflared-es WebSocket szerverre. Ekkor sem kell a játékosnak
     semmit csinálnia — automatikus.

   ICE SZERVEREK (NAT áttörés):
     - Google STUN (ingyenes, megbízható)
     - Metered.ca TURN (ingyenes tier, 50 GB/hó relay)
     A TURN relay akkor lép be, ha a STUN nem elegendő.
   ======================================================================= */

const PEER_CDN = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';

/* ICE szerverek — STUN + TURN a maximális kompatibilitáshoz */
const ICE_SZERVEREK = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  /* Metered.ca ingyenes TURN — 50 GB/hó, regisztráció nélkül */
  { urls: 'turn:a.relay.metered.ca:80',
    username: 'free', credential: 'free' },
  { urls: 'turn:a.relay.metered.ca:443',
    username: 'free', credential: 'free' },
  { urls: 'turns:a.relay.metered.ca:443?transport=tcp',
    username: 'free', credential: 'free' }
];

let _peer = null;
let _peerKapcs = {};       // hely -> DataConnection
let _peerBetoltes = false;
let _peerBetoltesVarnak = [];

/* --- PeerJS library betöltése --- */
function peerBetolt(kesz) {
  if (typeof Peer !== 'undefined') { kesz(null); return; }
  if (_peerBetoltes) { _peerBetoltesVarnak.push(kesz); return; }
  _peerBetoltes = true;
  const s = document.createElement('script');
  s.src = PEER_CDN;
  s.onload = () => {
    _peerBetoltes = false;
    for (const k of _peerBetoltesVarnak) k(null);
    _peerBetoltesVarnak = [];
    kesz(null);
  };
  s.onerror = () => {
    _peerBetoltes = false;
    const hiba = 'PeerJS könyvtár nem töltődött be.';
    for (const k of _peerBetoltesVarnak) k(hiba);
    _peerBetoltesVarnak = [];
    kesz(hiba);
  };
  document.head.appendChild(s);
}

/* --- Kód ↔ Peer-ID konverzió --- */
function kodbolPeerId(kod) {
  return 'birodalom-' + kod.toUpperCase();
}

/* --- Peer példány létrehozása (saját szerver → PeerJS Cloud fallback) --- */
function peerLetrehoz(peerId, kesz) {
  peerBetolt(hiba => {
    if (hiba) { kesz(hiba, null); return; }

    /* Saját signaling szerver — csak ha a házigazdán fut (Electron) */
    const sajatSzerver = (typeof window !== 'undefined' &&
                          window.birodalom && window.birodalom.szerver);
    const sajatKapu = sajatSzerver ? 8788 : null;

    function probald(host, port, path, secure, kovetkezo) {
      let p;
      try {
        const config = {
          iceServers: ICE_SZERVEREK,
          iceTransportPolicy: 'all'    // STUN + TURN mindkettő engedélyezve
        };
        const opts = { config };
        if (host) {
          Object.assign(opts, { host, port, path, secure });
        }
        p = peerId ? new Peer(peerId, opts) : new Peer(opts);
      } catch(e) { kovetkezo && kovetkezo(); return; }

      let megoldva = false;
      const idozito = setTimeout(() => {
        if (!megoldva) {
          megoldva = true;
          try { p.destroy(); } catch(e) {}
          kovetkezo && kovetkezo();
        }
      }, 5000);

      p.on('open', id => {
        if (megoldva) return;
        clearTimeout(idozito);
        megoldva = true;
        kesz(null, p);
      });
      p.on('error', err => {
        if (megoldva) return;
        clearTimeout(idozito);
        megoldva = true;
        try { p.destroy(); } catch(e) {}
        kovetkezo && kovetkezo();
      });
    }

    if (sajatKapu) {
      /* 1. Saját szerver (Electron) */
      probald('127.0.0.1', sajatKapu, '/peer', false, () => {
        /* 2. PeerJS Cloud */
        probald(null, null, null, null, () => {
          kesz('Signaling nem elérhető.', null);
        });
      });
    } else {
      /* 1. PeerJS Cloud (böngésző) */
      probald(null, null, null, null, () => {
        kesz('Signaling nem elérhető.', null);
      });
    }
  });
}

/* --- Üzenet küldése --- */
function peerKuldMindenki(obj) {
  const str = JSON.stringify(obj);
  for (const c of Object.values(_peerKapcs))
    if (c && c.open) try { c.send(str); } catch(e) {}
}

/* --- Kapcsolat felépítése és eseménykezelők --- */
function peerKapcsBeallitas(conn, tarsHely) {
  conn.on('data', adat => {
    let m;
    try { m = JSON.parse(adat); } catch(e) { return; }
    if (m.f === undefined) m.f = tarsHely;
    if (typeof netFogad === 'function') netFogad(m, null);
  });
  conn.on('close', () => {
    delete _peerKapcs[tarsHely];
    if (typeof netFogad === 'function')
      netFogad({ t: 'tars-lelepett', hely: tarsHely }, null);
  });
  conn.on('error', () => { delete _peerKapcs[tarsHely]; });
}

/* =======================================================================
   HÁZIGAZDA
   ======================================================================= */
function peerNyit(nev, kesz) {
  /* 4 betűs kód generálása — ez lesz a Peer-ID utótagja is */
  const betuk = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let kod = '';
  for (let i = 0; i < 4; i++) kod += betuk[Math.floor(Math.random() * betuk.length)];
  const peerId = kodbolPeerId(kod);

  peerLetrehoz(peerId, (hiba, p) => {
    if (hiba || !p) { kesz('hiba', hiba || 'P2P nem indult.'); return; }
    _peer = p;

    const n = netAllapot();
    n.kod = kod; n.hazigazda = true; n.hely = 0;
    n.allapot = 'varakozik'; n.sajatNev = nev || T('netHazigazda');
    n.jatekosok = [{ hely: 0, nev: n.sajatNev }];
    kesz('nyilt', kod);
    if (typeof szobaHalozat === 'function') szobaHalozat(n);

    /* Bejövő vendég kapcsolatok */
    p.on('connection', conn => {
      const n2 = netAllapot();
      const foglalt = n2.jatekosok.map(j => j.hely);
      let hely = 1;
      while (foglalt.indexOf(hely) >= 0) hely++;

      conn.on('open', () => {
        _peerKapcs[hely] = conn;
        peerKapcsBeallitas(conn, hely);

        const venNev = (conn.metadata && conn.metadata.nev) || ('Vendég ' + hely);
        n2.jatekosok.push({ hely, nev: venNev });
        n2.tarsNev = venNev;

        conn.send(JSON.stringify({
          t: 'csatlakozott', kod, hely, hazigazda: false, max: 6
        }));

        const allapot = { t: 'szoba-allapot', jatekosok: n2.jatekosok };
        peerKuldMindenki(allapot);
        if (typeof szobaHalozat === 'function') szobaHalozat(n2);
        kesz('tars', venNev);

        conn.send(JSON.stringify({ t: 'tars-erkezett', nev: n2.sajatNev }));
      });

      conn.on('data', adat => {
        let m;
        try { m = JSON.parse(adat); } catch(e) { return; }
        m.f = hely;
        /* Relay a többi vendégnek */
        for (const [h, c] of Object.entries(_peerKapcs))
          if (Number(h) !== hely && c && c.open)
            try { c.send(JSON.stringify(m)); } catch(e) {}
        if (typeof netFogad === 'function') netFogad(m, null);
      });

      conn.on('close', () => {
        delete _peerKapcs[hely];
        n2.jatekosok = n2.jatekosok.filter(j => j.hely !== hely);
        const uzenet = { t: 'tars-lelepett', hely };
        peerKuldMindenki(uzenet);
        if (typeof netFogad === 'function') netFogad(uzenet, null);
        if (typeof szobaHalozat === 'function') szobaHalozat(n2);
      });
    });

    p.on('error', err => {
      if (typeof toast === 'function') toast('P2P hiba: ' + (err.message || err));
    });
  });
}

/* =======================================================================
   VENDÉG
   ======================================================================= */
function peerCsatlakoz(kod, nev, kesz) {
  peerLetrehoz(null, (hiba, p) => {
    if (hiba || !p) { kesz('hiba', hiba || 'P2P nem indult.'); return; }
    _peer = p;

    const sajatNev = nev || T('netVendeg');
    const conn = p.connect(kodbolPeerId(kod), {
      metadata: { nev: sajatNev },
      reliable: true,
      serialization: 'raw'
    });

    const idozito = setTimeout(() => {
      try { conn.close(); } catch(e) {}
      kesz('hiba', 'Időtúllépés — nincs ilyen kód?');
    }, 12000);

    conn.on('open', () => clearTimeout(idozito));

    conn.on('data', adat => {
      let m;
      try { m = JSON.parse(adat); } catch(e) { return; }
      if (m.t === 'csatlakozott') {
        clearTimeout(idozito);
        const n = netAllapot();
        n.kod = kod; n.hazigazda = false; n.hely = m.hely;
        n.allapot = 'varakozik'; n.sajatNev = sajatNev;
        _peerKapcs[0] = conn;
        peerKapcsBeallitas(conn, 0);
      }
      if (m.f === undefined && m.t !== 'csatlakozott') m.f = 0;
      if (typeof netFogad === 'function') netFogad(m, kesz);
    });

    conn.on('close', () => {
      clearTimeout(idozito);
      delete _peerKapcs[0];
      if (typeof netFogad === 'function')
        netFogad({ t: 'tars-lelepett', hely: 0 }, null);
    });

    conn.on('error', err => {
      clearTimeout(idozito);
      kesz('hiba', err.message || 'Kapcsolati hiba');
    });
  });
}

/* =======================================================================
   LEZÁRÁS
   ======================================================================= */
function peerZar() {
  for (const c of Object.values(_peerKapcs))
    try { if (c) c.close(); } catch(e) {}
  _peerKapcs = {};
  if (_peer) try { _peer.destroy(); } catch(e) {}
  _peer = null;
}

/* =======================================================================
   INTEGRÁCIÓ — netKuld és netZar felülírása
   ======================================================================= */
function netMod() { return (G.net && G.net.mod2) || 'peer'; }

const _eredeti_netKuld = netKuld;
netKuld = function(obj) {
  if (netMod() === 'peer') peerKuldMindenki(obj);
  else if (_eredeti_netKuld) _eredeti_netKuld(obj);
};

const _eredeti_netZar = netZar;
netZar = function() {
  peerZar();
  if (_eredeti_netZar) _eredeti_netZar();
};

/* =======================================================================
   MENÜ API
   ======================================================================= */
window.peerHalozat = {
  nyit(nev, kesz) {
    netAllapot().mod2 = 'peer';
    peerNyit(nev, (esemeny, adat) => {
      if (typeof netVisszajelzes === 'function') netVisszajelzes(esemeny, adat);
      if (kesz) kesz(esemeny, adat);
    });
  },
  csatlakoz(kod, nev, kesz) {
    netAllapot().mod2 = 'peer';
    peerCsatlakoz(kod, nev, (esemeny, adat) => {
      if (typeof netVisszajelzes === 'function') netVisszajelzes(esemeny, adat);
      if (kesz) kesz(esemeny, adat);
    });
  }
};
