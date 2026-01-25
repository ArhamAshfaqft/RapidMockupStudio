const { app, BrowserWindow, ipcMain, dialog, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// --- Auto-Updater Config ---
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f5f5f7',
    show: false,
    icon: path.join(__dirname, '../../assets/icon_safe.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // --- Auto-Updater Events ---
  autoUpdater.on('checking-for-update', () => {
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'checking', message: 'Checking for updates...' });
  });

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'available', message: `Version ${info.version} available!`, version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'not-available', message: 'You are already on the latest version.' });
  });

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater Error:', err);
    // Treat network/missing-file errors as "No updates" to avoid scaring user
    if (mainWindow) mainWindow.webContents.send('update-status', {
      status: 'not-available',
      message: 'No new updates available.'
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) mainWindow.webContents.send('download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'downloaded', message: 'Update downloaded. Ready to install.' });
  });
}

app.whenReady().then(() => {
  // Register custom protocol for local files
  protocol.registerFileProtocol('safe-file', (request, callback) => {
    const url = request.url.replace('safe-file://', '');
    try {
      return callback(decodeURIComponent(url));
    } catch (error) {
      console.error(error);
      return callback(404);
    }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- IPC Handlers ---

// Auto-Updater Handlers
ipcMain.handle('check-for-updates', () => {
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { status: 'checking', message: 'Checking (Dev Mode)...' });
      setTimeout(() => {
        mainWindow.webContents.send('update-status', {
          status: 'not-available',
          message: 'Auto-Update is disabled in Development Mode. Please test in installed app.'
        });
      }, 1000);
    }
    return;
  }

  try {
    autoUpdater.checkForUpdatesAndNotify();
  } catch (err) {
    console.error("Update Check Failed:", err);
    // Treat error as "No updates" for better UX
    if (mainWindow) mainWindow.webContents.send('update-status', {
      status: 'not-available',
      message: 'No new updates available.'
    });
  }
});

ipcMain.handle('start-download', () => {
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    if (mainWindow) {
      // Simulate Download Progress
      let percent = 0;
      const interval = setInterval(() => {
        percent += 10;
        if (percent > 100) {
          clearInterval(interval);
          mainWindow.webContents.send('update-status', {
            status: 'downloaded',
            message: 'Update downloaded. Ready to install.'
          });
        } else {
          mainWindow.webContents.send('download-progress', { percent: percent });
        }
      }, 500);
    }
    return;
  }
  autoUpdater.downloadUpdate();
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

// Existing Handlers
ipcMain.handle('select-mockup-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    return {
      path: filePath,
      name: path.basename(filePath),
      data: `data:image/${mimeType};base64,${data.toString('base64')}`
    };
  }
  return null;
});

ipcMain.handle('select-sample-design-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mimeType};base64,${data.toString('base64')}`;
  }
  return null;
});

ipcMain.handle('get-dropped-file-path', async (event, filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      path: filePath,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      name: path.basename(filePath)
    };
  } catch (e) {
    return null;
  }
});

ipcMain.handle('scan-folder', async (event, folderPath) => {
  try {
    const files = fs.readdirSync(folderPath);
    const imageFiles = files
      .filter(file => /\.(png|jpe?g)$/i.test(file))
      .map(file => path.join(folderPath, file));
    return { path: folderPath, files: imageFiles };
  } catch (err) {
    console.error('Error scanning folder:', err);
    return null;
  }
});

ipcMain.handle('select-input-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    try {
      const files = fs.readdirSync(folderPath);
      const imageFiles = files
        .filter(file => /\.(png|jpe?g)$/i.test(file))
        .map(file => path.join(folderPath, file));
      return { path: folderPath, files: imageFiles };
    } catch (e) {
      console.error("Error scanning selected input folder:", e);
      return { path: folderPath, files: [] };
    }
  }
  return null;
});

ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('load-design-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mimeType};base64,${data.toString('base64')}`;
  } catch (e) {
    console.error("Error loading design file:", e);
    return null;
  }
});

ipcMain.handle('save-rendered-image', async (event, { filePath, dataBase64 }) => {
  try {
    const base64Data = dataBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Ensure dir exists
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
    console.log(`Saved: ${filePath}`);
    return true;
  } catch (e) {
    console.error("Error saving image:", e);
    return false;
  }
});

// Library Handlers
ipcMain.handle('scan-library', async () => {
  // Fix: Use path.resolve('.') for Dev mode to get absolute path (D:\...) instead of relative 'Library'
  const basePath = app.isPackaged ? path.dirname(app.getPath('exe')) : path.resolve('.');
  const libraryPath = path.join(basePath, 'Library');

  // Ensure Library exists
  if (!fs.existsSync(libraryPath)) {
    fs.mkdirSync(libraryPath);
  }

  // Ensure Universal category exists
  const universalPath = path.join(libraryPath, 'Universal');
  if (!fs.existsSync(universalPath)) {
    fs.mkdirSync(universalPath);
  }

  const structure = {};
  const categories = fs.readdirSync(libraryPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const category of categories) {
    const catPath = path.join(libraryPath, category);
    const files = fs.readdirSync(catPath)
      .filter(file => /\.(png|jpe?g)$/i.test(file))
      .map(file => ({
        name: file,
        path: path.join(catPath, file) // Send absolute path
      }));
    structure[category] = files;
  }

  return { rootPath: libraryPath, structure };
});

ipcMain.handle('save-to-library', async (event, { category, filePath }) => {
  const basePath = app.isPackaged ? path.dirname(app.getPath('exe')) : path.resolve('.');
  const libraryPath = path.join(basePath, 'Library');
  const catPath = path.join(libraryPath, category);

  if (!fs.existsSync(catPath)) {
    fs.mkdirSync(catPath);
  }

  const fileName = path.basename(filePath);
  const destPath = path.join(catPath, fileName);

  fs.copyFileSync(filePath, destPath);
  return destPath;
});

ipcMain.handle('create-library-category', async (event, name) => {
  const libraryPath = path.join(app.isPackaged ? path.dirname(app.getPath('exe')) : '.', 'Library');
  const catPath = path.join(libraryPath, name);
  if (!fs.existsSync(catPath)) {
    fs.mkdirSync(catPath);
    return true;
  }
  return false;
});

ipcMain.handle('delete-library-category', async (event, name) => {
  const libraryPath = path.join(app.isPackaged ? path.dirname(app.getPath('exe')) : '.', 'Library');
  const catPath = path.join(libraryPath, name);
  if (fs.existsSync(catPath)) {
    fs.rmdirSync(catPath, { recursive: true });
    return true;
  }
  return false;
});

ipcMain.handle('add-library-mockup', async (event, { category, filePath }) => {
  const libraryPath = path.join(app.isPackaged ? path.dirname(app.getPath('exe')) : '.', 'Library');
  const catPath = path.join(libraryPath, category);
  if (!fs.existsSync(catPath)) return false;

  const dest = path.join(catPath, path.basename(filePath));
  fs.copyFileSync(filePath, dest);
  return true;
});

ipcMain.handle('open-path-folder', async (event, folderPath) => {
  try {
    const error = await shell.openPath(folderPath);
    return error ? false : true;
  } catch (err) {
    console.error('Error opening folder:', err);
    return false;
  }
});

ipcMain.handle('path-join', (event, ...args) => {
  return path.join(...args);
});

ipcMain.handle('delete-library-mockup', async (event, filePath) => {
  try {
    // shell.trashItem allows "Moving to Recycle Bin" which is safer and less prone to EBUSY locks
    await shell.trashItem(filePath);
    return true;
  } catch (err) {
    console.error('Error deleting mockup:', err);
    // Fallback: If trash fails, try force unlink
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (err2) {
      console.error('Fallback verify failed:', err2);
    }
    return false;
  }
});
