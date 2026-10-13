import {join} from 'node:path'
import {mkdirSync} from 'node:fs'
import {basename} from 'node:path'
import {
    app,
    BrowserWindow,
    dialog,
    globalShortcut,
    ipcMain,
    Menu,
    shell,
    type OpenDialogOptions
} from 'electron'
import {DEFAULT_SETTINGS, type GameVersion, type Settings} from '@shared/settings'
import {REPLAY_SPEEDS, type ReceiverStatus, type ReplaySpeed, type UdpSnapshot} from '@shared/udp'
import {DirectorSession} from './director/session'
import {decode} from './protocol/decoder'
import {readStruct, type StructValue} from './protocol/reader'
import {VERSIONS} from './protocol/versions'
import {Player, openFileSource} from './replay/player'
import {Recorder, RECORDING_EXTENSION} from './replay/recorder'
import {loadSettings, saveSettings} from './settings'
import {WorldState} from './state/world'
import {UdpReceiver} from './udp/receiver'
import {LatestPackets} from './udp/latest'
import {RecentPackets} from './udp/recent'
import {PacketStatistics} from './udp/stats'
import {checkFormat} from './udp/version-guard'

const SNAPSHOT_INTERVAL_MS = 500
const TITLE_BAR_HEIGHT = 32
const WINDOW_BACKGROUND = '#0f0f15'
const TITLE_BAR_SYMBOLS = '#9b9ba6'

const receiver = new UdpReceiver()
const statistics = new PacketStatistics()
const recent = new RecentPackets()
const latest = new LatestPackets()
const world = new WorldState()
const recorder = new Recorder()
const player = new Player()
let activeVersion: GameVersion = DEFAULT_SETTINGS.gameVersion
let snapshotTimer: NodeJS.Timeout | null = null

function recordingsDirectory(): string {
    return join(app.getPath('userData'), 'recordings')
}

function resetPipeline(gameVersion: GameVersion): void {
    activeVersion = gameVersion
    statistics.reset()
    recent.reset()
    latest.reset()
    world.reset()
}

async function startReceiver(port: number, gameVersion: GameVersion): Promise<ReceiverStatus> {
    player.stop()
    resetPipeline(gameVersion)
    return receiver.start(port)
}

async function startReplay(path: string, speed: ReplaySpeed): Promise<void> {
    session.stop()
    receiver.stop()
    await recorder.stop()
    try {
        const gameVersion = await player.open(await openFileSource(path), basename(path))
        resetPipeline(gameVersion)
        player.play(handlePacket, speed)
    } catch (error) {
        if (player.status.state !== 'error') {
            player.fail(error instanceof Error ? error.message : String(error))
        }
    }
}

const session = new DirectorSession({
    startReceiver,
    stopReceiver: () => receiver.stop(),
    registerShortcut: (accelerator, callback) => {
        try {
            return globalShortcut.register(accelerator, callback)
        } catch {
            return false
        }
    },
    unregisterShortcut: (accelerator) => globalShortcut.unregister(accelerator),
    minimizeWindow: () => BrowserWindow.getAllWindows()[0]?.minimize(),
    restoreWindow: () => {
        const window = BrowserWindow.getAllWindows()[0]
        if (!window) return
        if (window.isMinimized()) window.restore()
        window.show()
        window.focus()
    },
    onChange: () => broadcastSnapshot()
})

function snapshot(): UdpSnapshot {
    return {
        status: receiver.status,
        totalPackets: statistics.totalPackets,
        packets: statistics.snapshot(Date.now()),
        recent: recent.snapshot(),
        decodedIds: latest.ids(),
        director: session.state,
        world: world.snapshot(activeVersion),
        recording: recorder.status,
        replay: player.status
    }
}

function broadcastSnapshot(): void {
    session.sync(receiver.status.state)
    if (receiver.status.state !== 'listening') void recorder.stop()
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
        const reason = `Received packet format ${check.actual}, expected ${version.packetFormat} (${version.label})`
        if (player.active) player.fail(reason)
        else receiver.stop(reason)
        broadcastSnapshot()
        return
    }
    const now = Date.now()
    const {header, data, error} = decodePacket(buffer)
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
    if (packetId !== null) latest.record({receivedAt: now, packetId, header, data, error})
    if (header && data && packetId !== null) world.apply(activeVersion, header, packetId, data)
}

interface DecodeOutcome {
    header: StructValue | null
    data: StructValue | null
    error: string | null
}

function decodePacket(buffer: Buffer): DecodeOutcome {
    try {
        const {header, data} = decode(buffer, activeVersion)
        return {header, data, error: null}
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        try {
            const header = readStruct(VERSIONS[activeVersion].header, buffer).value
            return {header, data: null, error: message}
        } catch {
            return {header: null, data: null, error: message}
        }
    }
}

function createWindow(): void {
    const window = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 960,
        minHeight: 600,
        title: 'f1-udp',
        backgroundColor: WINDOW_BACKGROUND,
        show: false,
        ...(process.platform === 'win32' && {
            titleBarStyle: 'hidden' as const,
            titleBarOverlay: {
                color: WINDOW_BACKGROUND,
                symbolColor: TITLE_BAR_SYMBOLS,
                height: TITLE_BAR_HEIGHT
            }
        }),
        ...(process.platform === 'darwin' && {titleBarStyle: 'hiddenInset' as const}),
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

    if (process.platform !== 'darwin') Menu.setApplicationMenu(null)

    ipcMain.handle('settings:get', () => loadSettings(settingsDirectory))
    ipcMain.handle('settings:set', (_event, partial: Partial<Settings>) =>
        saveSettings(settingsDirectory, partial)
    )
    ipcMain.handle('udp:snapshot', () => snapshot())
    ipcMain.handle('udp:start', async (_event, udpPort: number, gameVersion: GameVersion) => {
        const next = saveSettings(settingsDirectory, {udpPort, gameVersion})
        await startReceiver(next.udpPort, next.gameVersion)
        broadcastSnapshot()
        return next
    })
    ipcMain.handle('udp:decoded', (_event, packetId: number) => latest.get(packetId))
    ipcMain.handle('udp:stop', () => {
        receiver.stop()
        broadcastSnapshot()
    })
    ipcMain.handle('director:start', async (_event, udpPort: number, gameVersion: GameVersion) => {
        const next = saveSettings(settingsDirectory, {udpPort, gameVersion})
        const result = await session.start({
            port: next.udpPort,
            gameVersion: next.gameVersion,
            hotkey: next.stopHotkey
        })
        broadcastSnapshot()
        return {settings: next, ...result}
    })
    ipcMain.handle('director:stop', () => {
        session.stop()
        broadcastSnapshot()
    })

    ipcMain.handle('recording:start', () => {
        if (receiver.status.state !== 'listening' || recorder.status.active) return
        try {
            recorder.start(
                recordingsDirectory(),
                {gameVersion: activeVersion, port: receiver.status.port},
                Date.now()
            )
        } catch (error) {
            recorder.fail(error instanceof Error ? error.message : String(error))
        }
        broadcastSnapshot()
    })
    ipcMain.handle('recording:stop', async () => {
        await recorder.stop()
        broadcastSnapshot()
    })
    ipcMain.handle('recording:openFolder', async () => {
        mkdirSync(recordingsDirectory(), {recursive: true})
        await shell.openPath(recordingsDirectory())
    })
    ipcMain.handle('replay:open', async (event, speed: ReplaySpeed) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        const options: OpenDialogOptions = {
            defaultPath: recordingsDirectory(),
            filters: [{name: 'f1-udp recording', extensions: [RECORDING_EXTENSION]}],
            properties: ['openFile']
        }
        const result = window
            ? await dialog.showOpenDialog(window, options)
            : await dialog.showOpenDialog(options)
        const path = result.filePaths[0]
        if (result.canceled || !path) return
        await startReplay(path, REPLAY_SPEEDS.includes(speed) ? speed : 1)
        broadcastSnapshot()
    })
    ipcMain.handle('replay:pause', () => {
        player.pause()
        broadcastSnapshot()
    })
    ipcMain.handle('replay:resume', () => {
        player.resume()
        broadcastSnapshot()
    })
    ipcMain.handle('replay:speed', (_event, speed: ReplaySpeed) => {
        if (REPLAY_SPEEDS.includes(speed)) player.setSpeed(speed)
        broadcastSnapshot()
    })
    ipcMain.handle('replay:stop', () => {
        player.stop()
        broadcastSnapshot()
    })

    receiver.onPacket((buffer) => {
        recorder.write(buffer, Date.now())
        handlePacket(buffer)
    })

    snapshotTimer = setInterval(broadcastSnapshot, SNAPSHOT_INTERVAL_MS)

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('before-quit', () => {
    if (snapshotTimer) clearInterval(snapshotTimer)
    session.stop()
    receiver.stop()
    player.stop()
    void recorder.stop()
    globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
