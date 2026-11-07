import { ElectronAPI } from '@electron-toolkit/preload'
import type { LibraryApi } from '../shared/library'

declare global {
  interface Window {
    electron: ElectronAPI
    api: { library: LibraryApi }
  }
}
