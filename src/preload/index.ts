import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { LibraryApi } from '../shared/library'

const library: LibraryApi = {
  getState: () => ipcRenderer.invoke('library:getState'),
  openFolder: () => ipcRenderer.invoke('library:openFolder'),
  list: () => ipcRenderer.invoke('library:list'),
  read: (path) => ipcRenderer.invoke('library:read', path),
  write: (path, content) => ipcRenderer.invoke('library:write', path, content),
  create: (baseName, content) => ipcRenderer.invoke('library:create', baseName, content),
  rename: (path, newName) => ipcRenderer.invoke('library:rename', path, newName),
  remove: (path, strings) => ipcRenderer.invoke('library:remove', path, strings),
  setLastNote: (path) => ipcRenderer.invoke('library:setLastNote', path)
}

const api = { library }

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
