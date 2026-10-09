import {join} from 'node:path'
import {app, BrowserWindow, ipcMain, shell} from 'electron'
import {DEFAULT_SETTINGS, type GameVersion, type Settings} from '@shared/settings'
import type {UdpSnapshot} from '@shared/udp'
import {decode} from './protocol/decoder'
import type {StructValue} from './protocol/reader'
import {VERSIONS} from './protocol/versions'
import {loadSettings, saveSettings} from './settings'
import {UdpReceiver} from './udp/receiver'
import {RecentPackets} from './udp/recent'
import {PacketStatistics} from './udp/stats'
import {checkFormat} from './udp/version-guard'

const SNAPSHOT_INTERVAL_MS = 500

const receiver = new UdpReceiver()
const statistics = new PacketStatistics()
const recent = new RecentPackets()
let activeVersion: GameVersion = DEFAULT_SETTINGS.gameVersion
let snapshotTimer: NodeJS.Timeout | null = null

function snapshot(): UdpSnapshot {
    return {
        status: receiver.status,
        totalPackets: statistics.totalPackets,
        packets: statistics.snapshot(Date.now()),
        recent: recent.snapshot()
    }
}

function broadcastSnapshot(): void {
    const current = snapshot()
    for (const window of BrowserWindow.getAllWindows()) {
        window.webContents.send('udp:snapshot', current)
    }
}

function handlePacket(buffer: Buffer): void {
    const version = VERSIONS[activeVersion]
    const check = checkFormat(buffer, version.packetFormat)
    if (check.result === 'ignored') return
    if (check.result === 'mismatch') {
        receiver.stop(
            `Received packet format ${check.actual}, expected ${version.packetFormat} (${version.label})`
        )
        broadcastSnapshot()
        return
    }
    const now = Date.now()
    const header = readHeader(buffer)
    const packetId = header ? Number(header.packetId) : null
    statistics.record(buffer, now, packetId)
    recent.record({
        receivedAt: now,
        packetFormat: version.packetFormat,
        packetId,
        size: buffer.length,
        sessionTime: header ? Number(header.sessionTime) : null,
        frameIdentifier: header ? Number(header.frameIdentifier) : null
    })
}

function readHeader(buffer: Buffer): StructValue | null {
    try {
        return decode(buffer, activeVersion).header
    } catch {
        return null
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
    ipcMain.handle('settings:set', (_event, partial: Partial<Settings>) =>
        saveSettings(settingsDirectory, partial)
    )
    ipcMain.handle('udp:snapshot', () => snapshot())
    ipcMain.handle('udp:start', async (_event, udpPort: number, gameVersion: GameVersion) => {
        const next = saveSettings(settingsDirectory, {udpPort, gameVersion})
        activeVersion = next.gameVersion
        statistics.reset()
        recent.reset()
        await receiver.start(next.udpPort)
        broadcastSnapshot()
        return next
    })
    ipcMain.handle('udp:stop', () => {
        receiver.stop()
        broadcastSnapshot()
    })

    receiver.onPacket(handlePacket)

    snapshotTimer = setInterval(broadcastSnapshot, SNAPSHOT_INTERVAL_MS)

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
