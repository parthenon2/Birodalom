/* A LAUNCHER SAJÁT JÁTÉKABLAKÁNAK HÍDJA.

   Ha a launcher nem találja a telepített játékot, saját ablakában
   nyitja meg a letöltöttet. Annak az ablaknak eddig NEM adtunk hidat —
   ezért a többjátékos mód használhatatlan volt: a „Szoba nyitása" nem
   tudott mit elindítani.

   Ez a híd ugyanazt a felületet adja, mint a játék saját burka
   (`asztali/preload.js`), de szűkebben: csak a szervert. A mentés a
   böngésző tárolójába megy, ahogy eddig is ebben az ablakban. */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('birodalom', {
  asztali: true,
  szerver: {
    indit:         (kapu) => ipcRenderer.invoke('jatek-szerver-indit', kapu),
    leallit:       ()     => ipcRenderer.sendSync('jatek-szerver-leallit'),
    allapot:       ()     => ipcRenderer.sendSync('jatek-szerver-allapot'),
    /* A cloudflared letöltési százaléka — első szobanyitáskor látszik,
       ha a gépre még nem töltöttük le az alagúteszközt. */
    letoltesFigyel: (fv)  => ipcRenderer.on('cf-letoltes',
                               (_e, szazalek) => fv(szazalek))
  }
});
