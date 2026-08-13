/* A launcher hídja. Szándékosan szűk: hat dolgot enged, semmi többet.
   Így ha valaha idegen tartalom kerülne az ablakba, nem fér hozzá a
   fájlrendszerhez. */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcher', {
  ellenoriz: () => ipcRenderer.invoke('ellenoriz'),
  letolt:    (id) => ipcRenderer.invoke('letolt', id),
  indit:     (id, exe) => ipcRenderer.invoke('indit', id, exe),
  halad:     (fv) => ipcRenderer.on('halad', (_e, a) => { try { fv(a); } catch (err) {} }),
  mappaNyit: (id) => ipcRenderer.send('mappa-nyit', id),
  kicsinyit: () => ipcRenderer.send('kicsinyit'),
  kilep:     () => ipcRenderer.send('kilep')
});
