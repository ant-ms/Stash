const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveUrl: (url) => ipcRenderer.send('save-url', url),
  onError: (callback) => ipcRenderer.on('load-error', callback)
});
