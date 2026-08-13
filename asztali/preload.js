/* Híd a játék és az asztali burok között. Csak azt engedjük át, amire
   szükség van: az ablak méretét és a teljes képernyőt. A játék böngészőben
   is fut, ezért mindenhol meg kell nézni, létezik-e a window.birodalom. */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('birodalom', {
  asztali: true,
  ablakMeret: (w, h) => ipcRenderer.send('ablak-meret', w, h),
  /* Érték nélkül vált, true/false-szal célzottan állít. */
  teljesKepernyo: (ertek) => ipcRenderer.send('teljes-kepernyo', ertek),
  teljesKepernyoLekerdez: () => ipcRenderer.invoke('teljes-kepernyo-lekerdez'),
  /* A burok szól, ha F11-gyel vagy az ablakkezelőből változott az állapot. */
  teljesKepernyoFigyel: (fv) => ipcRenderer.on('teljes-kepernyo-allapot',
    (_e, allapot) => { try { fv(allapot); } catch (err) {} }),

  /* TÁROLÓ. Szinkron hívások, hogy a játék meglévő mentőkódja
     változtatás nélkül működjön. Kis JSON-oknál ez nem érezhető. */
  /* BEÉPÍTETT SZERVER. Az indítás aszinkron (meg kell várni az alagút
     címét), a leállítás és az állapot szinkron. */
  szerver: {
    indit:   (kapu) => ipcRenderer.invoke('szerver-indit', kapu),
    leallit: ()     => ipcRenderer.sendSync('szerver-leallit'),
    allapot: ()     => ipcRenderer.sendSync('szerver-allapot'),
    /* A cloudflared letöltésének haladása. Csak az ELSŐ szobanyitáskor
       fut le; ötven megabájt, tehát lassú kapcsolaton érdemes látni. */
    letoltesFigyel: (fv) => ipcRenderer.on('cf-letoltes',
      (_e, szazalek) => { try { fv(szazalek); } catch (err) {} })
  },

  tarolo: {
    ir:     (kulcs, ertek) => ipcRenderer.sendSync('tarolo-ir', kulcs, ertek),
    olvas:  (kulcs)        => ipcRenderer.sendSync('tarolo-olvas', kulcs),
    torol:  (kulcs)        => ipcRenderer.sendSync('tarolo-torol', kulcs),
    lista:  ()             => ipcRenderer.sendSync('tarolo-lista'),
    mappa:  ()             => ipcRenderer.sendSync('tarolo-mappa')
  }
});
