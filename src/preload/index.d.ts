import { ElectronAPI } from '@electron-toolkit/preload'

interface CustomElectronAPI extends ElectronAPI {
  quitApp: () => void;
}

declare global {
  interface Window {
    electron: CustomElectronAPI;
  }
}