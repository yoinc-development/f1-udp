import {contextBridge, ipcRenderer, type IpcRendererEvent} from 'electron'
import type {Api} from '@shared/api'
import type {GameVersion, Settings} from '@shared/settings'
import type {ReplaySpeed, UdpSnapshot} from '@shared/udp'

const api: Api = {
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        set: (partial: Partial<Settings>) => ipcRenderer.invoke('settings:set', partial)
    },
    udp: {
        snapshot: () => ipcRenderer.invoke('udp:snapshot'),
        start: (port: number, gameVersion: GameVersion) =>
            ipcRenderer.invoke('udp:start', port, gameVersion),
        stop: () => ipcRenderer.invoke('udp:stop'),
        decoded: (packetId: number) => ipcRenderer.invoke('udp:decoded', packetId),
        onSnapshot: (callback) => {
            const listener = (_event: IpcRendererEvent, snapshot: UdpSnapshot): void =>
                callback(snapshot)
            ipcRenderer.on('udp:snapshot', listener)
            return () => {
                ipcRenderer.removeListener('udp:snapshot', listener)
            }
        }
    },
    director: {
        start: (port: number, gameVersion: GameVersion) =>
            ipcRenderer.invoke('director:start', port, gameVersion),
        stop: () => ipcRenderer.invoke('director:stop')
    },
    recording: {
        start: () => ipcRenderer.invoke('recording:start'),
        stop: () => ipcRenderer.invoke('recording:stop'),
        openFolder: () => ipcRenderer.invoke('recording:openFolder')
    },
    analysis: {
        decisions: () => ipcRenderer.invoke('analysis:decisions')
    },
    replay: {
        open: (speed: ReplaySpeed) => ipcRenderer.invoke('replay:open', speed),
        pause: () => ipcRenderer.invoke('replay:pause'),
        resume: () => ipcRenderer.invoke('replay:resume'),
        speed: (speed: ReplaySpeed) => ipcRenderer.invoke('replay:speed', speed),
        stop: () => ipcRenderer.invoke('replay:stop')
    }
}

contextBridge.exposeInMainWorld('api', api)
