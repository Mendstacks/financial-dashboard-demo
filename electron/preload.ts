import { contextBridge } from 'electron'

// Expose any APIs you want available in the renderer process here.
// For now, we expose a simple platform identifier.
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
})
