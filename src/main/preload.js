const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectMockupFile: () => ipcRenderer.invoke('select-mockup-file'),
  selectSampleDesignFile: () => ipcRenderer.invoke('select-sample-design-file'),
  getDroppedFilePath: (path) => ipcRenderer.invoke('get-dropped-file-path', path),
  scanFolder: (path) => ipcRenderer.invoke('scan-folder', path),
  scanLibrary: () => ipcRenderer.invoke('scan-library'),
  saveToLibrary: (data) => ipcRenderer.invoke('save-to-library', data),
  selectInputFolder: () => ipcRenderer.invoke('select-input-folder'),
  selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),
  loadDesignFile: (filePath) => ipcRenderer.invoke('load-design-file', filePath),
  saveRenderedImage: (data) => ipcRenderer.invoke('save-rendered-image', data),
  createLibraryCategory: (name) => ipcRenderer.invoke('create-library-category', name),
  addLibraryMockup: (data) => ipcRenderer.invoke('add-library-mockup', data),
  deleteLibraryCategory: (name) => ipcRenderer.invoke('delete-library-category', name),
  openPathFolder: (path) => ipcRenderer.invoke('open-path-folder', path),

  // Auto-Updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  startDownload: () => ipcRenderer.invoke('start-download'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, data) => callback(data)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data))
});
