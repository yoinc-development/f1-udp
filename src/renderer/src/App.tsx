import {useEffect, useState} from 'react'
import type {Settings} from '@shared/settings'

export default function App() {
    const [settings, setSettings] = useState<Settings | null>(null)

    useEffect(() => {
        void window.api.settings.get().then(setSettings)
    }, [])

    return (
        <main style={{fontFamily: 'system-ui, sans-serif', padding: '2rem'}}>
            <h1>f1-udp</h1>
            <p>This is just an empty page. Look at these settings: </p>
            <pre>{settings ? JSON.stringify(settings, null, 2) : 'loading...'}</pre>
        </main>
    )
}
