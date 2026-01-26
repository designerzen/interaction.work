import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
	getAppVersion: () => ipcRenderer.invoke('get-app-version'),
	openFile: () => ipcRenderer.invoke('open-file'),
})

declare global {
	interface Window {
		electron: {
			getAppVersion: () => Promise<string>
			openFile: () => Promise<string | null>
		}
	}
}
