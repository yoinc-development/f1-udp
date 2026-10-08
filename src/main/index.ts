import {join} from 'node:path'
import {app, BrowserWindow, ipcMain, shell} from 'electron'
import type {Settings} from '@shared/settings'
import type {UdpSnapshot} from '@shared/udp'
import {loadSettings, saveSettings} from './settings'
import {UdpReceiver} from './udp/receiver'
import {PacketStatistics} from './udp/stats'

const SNAPSHOT_INTERVAL_MS = 500

const receiver = new UdpReceiver()
const statistics = new PacketStatistics()
let snapshotTimer: NodeJS.Timeout | null = null

function snapshot(): UdpSnapshot {
    return {
        status: receiver.status,
        totalPackets: statistics.totalPackets,
        packets: statistics.snapshot(Date.now())
    }
}

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
    ipcMain.handle('settings:set', async (_event, partial: Partial<Settings>) => {
        const previous = loadSettings(settingsDirectory)
        const next = saveSettings(settingsDirectory, partial)
        if (next.udpPort !== previous.udpPort) {
            statistics.reset()
            await receiver.start(next.udpPort)
        }
        return next
    })
    ipcMain.handle('udp:snapshot', () => snapshot())

    receiver.onPacket((buffer) => statistics.record(buffer, Date.now()))
    void receiver.start(loadSettings(settingsDirectory).udpPort)

    snapshotTimer = setInterval(() => {
        const current = snapshot()
        for (const window of BrowserWindow.getAllWindows()) {
            window.webContents.send('udp:snapshot', current)
        }
    }, SNAPSHOT_INTERVAL_MS)

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('before-quit', () => {
    if (snapshotTimer) clearInterval(snapshotTimer)
    receiver.stop()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
