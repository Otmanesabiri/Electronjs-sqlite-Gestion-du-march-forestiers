const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = [
      'create-market', 
      'fetch-markets', 
      'modify-market', 
      'delete-market', 
      'check-market-number', 
      'fetch-prestations',
      'fetch-market-number'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = [
      'market-created', 
      'markets-data', 
      'market-modified', 
      'market-deleted', 
      'market-number-checked', 
      'prestations-data',
      'market-number-data'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
