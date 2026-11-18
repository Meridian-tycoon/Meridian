// Lets the game know it runs in the desktop app, and start Google sign-in in the normal browser.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('meridianDesktop', {
  platform: process.platform,
  version: '1.0.1',
  googleSignIn: () => ipcRenderer.send('google-signin'),
});
