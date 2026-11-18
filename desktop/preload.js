// Lets the game know it runs in the desktop app (optional for the page to use).
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('meridianDesktop', { platform: process.platform, version: '1.0.0' });
