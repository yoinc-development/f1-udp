import {useEffect, useState} from 'react'
import {formatDuration} from '@shared/format'
import type {AnalysisStatus, DecisionEntry, LiveDirectorStatus} from '@shared/udp'
import Panel, {Empty} from './components/Panel'
import table from './components/table.module.css'

interface Props {
    analysis: AnalysisStatus
    live: LiveDirectorStatus
}

export default function DecisionsPanel({analysis, live}: Props) {
    const [loaded, setLoaded] = useState<DecisionEntry[]>([])
    const showLive = live.decisions.length > 0
    const decisions = showLive ? live.decisions : analysis.state === 'done' ? loaded : []

    useEffect(() => {
        if (analysis.state !== 'done') return
        let current = true
        void window.api.analysis.decisions().then((entries) => {
            if (current) setLoaded(entries)
        })
        return () => {
            current = false
        }
    }, [analysis.state, analysis.file])

    const actions = (showLive || analysis.state === 'done') && (
        <span>{decisions.length} decisions</span>
    )

    return (
        <Panel title="Director decisions" actions={actions}>
            {!showLive && analysis.state === 'running' ? (
                <Empty>Analysing the recording, {Math.round(analysis.progress * 100)}%.</Empty>
            ) : !showLive && analysis.state === 'error' ? (
                <Empty>Analysis failed: {analysis.error}</Empty>
            ) : decisions.length === 0 ? (
                <Empty>The director made no decisions yet.</Empty>
            ) : (
                <div className={table.scroll}>
                    <table className={table.table}>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Lap</th>
                                <th>Target</th>
                                <th>Kind</th>
                                <th>Tier</th>
                                <th>Score</th>
                                <th>Reason</th>
                                <th>Rule</th>
                            </tr>
                        </thead>
                        <tbody>
                            {decisions.map((decision, index) => (
                                <tr key={`${decision.t}:${index}`}>
                                    <td>{formatDuration(decision.t * 1000)}</td>
                                    <td>{decision.lap}</td>
                                    <td>{decision.target.name}</td>
                                    <td>{decision.kind}</td>
                                    <td>{decision.tier}</td>
                                    <td>{decision.score}</td>
                                    <td>{decision.reason}</td>
                                    <td>{decision.rule}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Panel>
    )
}
