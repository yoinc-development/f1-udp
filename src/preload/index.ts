import {contextBridge, ipcRenderer, type IpcRendererEvent} from 'electron'
import type {Api} from '@shared/api'
import type {Settings} from '@shared/settings'
import type {UdpSnapshot} from '@shared/udp'

const api: Api = {
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        set: (partial: Partial<Settings>) => ipcRenderer.invoke('settings:set', partial)
    },
    udp: {
        snapshot: () => ipcRenderer.invoke('udp:snapshot'),
        onSnapshot: (callback) => {
            const listener = (_event: IpcRendererEvent, snapshot: UdpSnapshot): void =>
                callback(snapshot)
            ipcRenderer.on('udp:snapshot', listener)
            return () => {
                ipcRenderer.removeListener('udp:snapshot', listener)
            }
        }
    }
}

contextBridge.exposeInMainWorld('api', api)
