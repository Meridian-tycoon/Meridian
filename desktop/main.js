// Meridian desktop shell. Online only: it loads the live game site and keeps
// no local copy of the game or the world. If there is no connection it shows
// a "you're offline" page with a Retry button.
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

const GAME_URL = 'https://meridian-tycoon.github.io/Meridian/';
const GAME_ORIGIN = new URL(GAME_URL).origin;
// Sign-in popups (Firebase / Google) must stay inside the app.
const AUTH_HOSTS = ['accounts.google.com', 'meridian-world-players.firebaseapp.com'];

let win;

function isGame(url) {
  try { const u = new URL(url); return u.origin === GAME_ORIGIN && u.pathname.startsWith('/Meridian'); }
  catch { return false; }
}
function isAuth(url) {
  try { const h = new URL(url).hostname; return AUTH_HOSTS.some(a => h === a || h.endsWith('.' + a)); }
  catch { return false; }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1024, minHeight: 640,
    title: 'Meridian', backgroundColor: '#0b1020', show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
  });
  win.once('ready-to-show', () => win.show());

  // Always fetch the newest game: no HTTP cache between launches.
  win.webContents.session.clearCache();
  win.loadURL(GAME_URL, { extraHeaders: 'pragma: no-cache\n' });

  win.webContents.on('did-fail-load', (_e, code, _desc, url, isMain) => {
    if (isMain && code !== -3) win.loadFile(path.join(__dirname, 'offline.html'));
  });

  // Links outside the game open in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAuth(url) || isGame(url)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('file:') || isGame(url) || isAuth(url)) return;
    e.preventDefault();
    shell.openExternal(url);
  });
}

const menu = [
  ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
  { label: 'Game', submenu: [
    { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => win && win.loadURL(GAME_URL) },
    { role: 'togglefullscreen' },
    { type: 'separator' },
    process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
  ]},
  { role: 'editMenu' },
  { label: 'View', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'toggleDevTools' }] },
];

// Google refuses sign-in from browsers that say "Electron" in their user agent
// ("This browser or app may not be secure"). Present as plain Chrome instead.
app.userAgentFallback = app.userAgentFallback
  .replace(/\sElectron\/\S+/, '')
  .replace(/\smeridian-desktop\/\S+/i, '')
  .replace(/\sMeridian\/\S+/, '');

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
