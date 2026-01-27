import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron'
import path from 'path'
import isDev from 'is-electron'
import log from 'electron-log'
import { updateElectronApp } from 'update-electron-app'

log.initialize()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit()
}

updateElectronApp()

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1920,
		height: 1080,
		webPreferences: {
			preload: path.join(__dirname, '../preload/index.js'),
			contextIsolation: true,
			enableRemoteModule: false,
			nodeIntegration: false,
		},
	})

	const startUrl = isDev()
		? 'http://localhost:909'
		: `file://${path.join(__dirname, '../../dist/index.html')}`

	mainWindow.loadURL(startUrl)

	if (isDev()) {
		mainWindow.webContents.openDevTools()
	}

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

app.on('ready', () => {
	createWindow()
	createMenu()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
})

const createMenu = () => {
	const template: Electron.MenuItemConstructorOptions[] = [
		{
			label: 'File',
			submenu: [
				{
					label: 'Exit',
					accelerator: 'CmdOrCtrl+Q',
					click: () => {
						app.quit()
					},
				},
			],
		},
		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
			],
		},
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ role: 'forceReload' },
				{ role: 'toggleDevTools' },
				{ type: 'separator' },
				{ role: 'resetZoom' },
				{ role: 'zoomIn' },
				{ role: 'zoomOut' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
			],
		},
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
	return app.getVersion()
})

ipcMain.handle('open-file', async () => {
	const result = await dialog.showOpenDialog(mainWindow!, {
		properties: ['openFile'],
		filters: [
			{ name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'ogg'] },
			{ name: 'All Files', extensions: ['*'] },
		],
	})
	return result.filePaths[0] || null
})
