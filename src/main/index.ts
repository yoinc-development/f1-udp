import {join} from 'node:path'
import {app, BrowserWindow, ipcMain, shell} from 'electron'
import type {Settings} from '@shared/settings'
import {loadSettings, saveSettings} from './settings'

function createWindow(): void {
    const window = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    })

    window.once('ready-to-show', () => window.show())

    window.webContents.setWindowOpenHandler(({url}) => {
        void shell.openExternal(url)
        return {action: 'deny'}
    })

    const devUrl = process.env['ELECTRON_RENDERER_URL']
    if (!app.isPackaged && devUrl) {
        void window.loadURL(devUrl)
    } else {
        void window.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

app.whenReady().then(() => {
    const settingsDirectory = app.getPath('userData')

    ipcMain.handle('settings:get', () => loadSettings(settingsDirectory))
    ipcMain.handle('settings:set', (_event, partial: Partial<Settings>) =>
        saveSettings(settingsDirectory, partial)
    )

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
