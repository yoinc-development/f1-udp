import {useEffect, useState} from 'react'
import {formatDuration} from '@shared/format'
import type {AnalysisStatus, DecisionEntry} from '@shared/udp'
import Panel, {Empty} from './components/Panel'
import table from './components/table.module.css'

interface Props {
    analysis: AnalysisStatus
}

export default function DecisionsPanel({analysis}: Props) {
    const [loaded, setLoaded] = useState<DecisionEntry[]>([])
    const decisions = analysis.state === 'done' ? loaded : []

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

    const actions = analysis.state === 'done' && <span>{decisions.length} decisions</span>

    return (
        <Panel title="Director decisions" actions={actions}>
            {analysis.state === 'running' ? (
                <Empty>Analysing the recording, {Math.round(analysis.progress * 100)}%.</Empty>
            ) : analysis.state === 'error' ? (
                <Empty>Analysis failed: {analysis.error}</Empty>
            ) : decisions.length === 0 ? (
                <Empty>The director made no decisions for this recording.</Empty>
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
