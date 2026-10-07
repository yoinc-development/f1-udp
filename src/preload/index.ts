import {contextBridge, ipcRenderer} from 'electron'
import type {Api} from '@shared/api'
import type {Settings} from '@shared/settings'

const api: Api = {
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        set: (partial: Partial<Settings>) => ipcRenderer.invoke('settings:set', partial)
    }
}

contextBridge.exposeInMainWorld('api', api)
