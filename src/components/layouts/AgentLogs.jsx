import React, { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------
function scoreColor(val, max = 10) {
    const pct = val / max;
    if (pct >= 0.8) return 'var(--oai-success)';
    if (pct >= 0.6) return 'var(--oai-warning)';
    return 'var(--oai-error)';
}

function ScoreCard({ label, value, max = 10 }) {
    const pct = Math.round((value / max) * 100);
    const color = scoreColor(value, max);
    return (
        <div className="sl-score-card">
            <div className="sl-score-label">{label}</div>
            <div className="sl-score-val" style={{ color }}>{value}<span className="sl-score-max">/{max}</span></div>
            <div className="sl-score-bar">
                <div className="sl-score-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// MetaGrid — model info + token usage side by side
// ---------------------------------------------------------------------------
function MetaGrid({ model_info, token_usage }) {
    return (
        <div className="sl-meta-grid">
            <div className="sl-meta-card">
                <div className="sl-meta-card-title">Model info</div>
                <div className="sl-meta-row">
                    <span className="sl-meta-key">Model</span>
                    <span className="sl-meta-val">{model_info?.model_id ?? '—'}</span>
                </div>
                <div className="sl-meta-row">
                    <span className="sl-meta-key">Provider</span>
                    <span className="sl-meta-val">{model_info?.model_provider ?? '—'}</span>
                </div>
            </div>
            <div className="sl-meta-card">
                <div className="sl-meta-card-title">Token usage</div>
                <div className="sl-meta-row">
                    <span className="sl-meta-key">Input</span>
                    <span className="sl-meta-val">{token_usage?.input_tokens?.toLocaleString() ?? '—'}</span>
                </div>
                <div className="sl-meta-row">
                    <span className="sl-meta-key">Output</span>
                    <span className="sl-meta-val">{token_usage?.output_tokens?.toLocaleString() ?? '—'}</span>
                </div>
                <div className="sl-meta-row">
                    <span className="sl-meta-key">Total</span>
                    <span className="sl-meta-val">{token_usage?.total_tokens?.toLocaleString() ?? '—'}</span>
                </div>
                {token_usage?.input_token_details && (
                    <div className="sl-meta-row">
                        <span className="sl-meta-key">Cache read</span>
                        <span className="sl-meta-val">{token_usage.input_token_details.cache_read?.toLocaleString() ?? 0}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// EvalSection — evaluation scores + assessment + badges
// ---------------------------------------------------------------------------
function EvalSection({ evaluation_data }) {
    if (!evaluation_data) return null;
    const ev = evaluation_data;

    const primaryScores = [
        ['Quality',      ev.quality_score],
        ['Accuracy',     ev.accuracy_score],
        ['Relevance',    ev.relevance_score],
        ['Clarity',      ev.clarity_score],
        ['Coherence',    ev.coherence_score],
        ['Empathy',      ev.empathy_score],
        ['Completeness', ev.completeness_score],
        ['Satisfaction', ev.satisfaction_score],
    ].filter(([, v]) => v !== undefined && v !== null);

    return (
        <div className="sl-eval-section">
            <div className="sl-eval-title">Evaluation</div>

            {primaryScores.length > 0 && (
                <div className="sl-eval-scores">
                    {primaryScores.map(([label, val]) => (
                        <ScoreCard key={label} label={label} value={val} max={10} />
                    ))}
                </div>
            )}

            {ev.overall_assessment && (
                <div className="sl-eval-assessment">{ev.overall_assessment}</div>
            )}

            <div className="sl-badge-row">
                {ev.detected_intent && (
                    <span className="sl-badge sl-badge-info">
                        Intent: {ev.detected_intent.length > 40
                            ? ev.detected_intent.slice(0, 40) + '…'
                            : ev.detected_intent}
                    </span>
                )}
                {ev.complexity_level && (
                    <span className="sl-badge sl-badge-info">Complexity: {ev.complexity_level}</span>
                )}
                {ev.bleu_score !== undefined && (
                    <span className="sl-badge sl-badge-neutral">
                        BLEU {ev.bleu_score} · ROUGE {ev.rouge_score}
                    </span>
                )}
                <span className={`sl-badge ${ev.hallucination_detected ? 'sl-badge-warn' : 'sl-badge-ok'}`}>
                    {ev.hallucination_detected ? 'Hallucination detected' : 'No hallucination'}
                </span>
                <span className={`sl-badge ${ev.is_low_quality ? 'sl-badge-warn' : 'sl-badge-ok'}`}>
                    {ev.is_low_quality ? 'Low quality' : 'Good quality'}
                </span>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// LogEntry — single collapsible row
// ---------------------------------------------------------------------------
function LogEntry({ log }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        input_message,
        output_response,
        timestamp,
        status,
        response_time_ms,
        model_info,
        token_usage,
        evaluation_data,
    } = log;

    const ts = new Date(timestamp);
    const tsStr = ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        + ' ' + ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dur = (response_time_ms / 1000).toFixed(2) + 's';

    return (
        <div className={`sl-log-item ${isExpanded ? 'sl-log-expanded' : ''}`}>
            <div className="sl-log-header" onClick={() => setIsExpanded(!isExpanded)}>
                <span className="sl-log-timestamp">{tsStr}</span>
                <span className="sl-log-input">{input_message}</span>
                <span className={`sl-log-status sl-status-${status}`}>{status}</span>
                <span className="sl-log-dur-wrap">
                    <span className="sl-log-duration">{dur}</span>
                    <span className={`sl-log-chevron ${isExpanded ? 'sl-chevron-open' : ''}`}>▼</span>
                </span>
            </div>

            {isExpanded && (
                <div className="sl-log-body">
                    {/* Conversation */}
                    <div className="sl-convo-section">
                        <div className="sl-bubble sl-bubble-user">
                            <div className="sl-bubble-label">You</div>
                            {input_message}
                        </div>
                        <div className="sl-bubble sl-bubble-agent">
                            <div className="sl-bubble-label">Agent</div>
                            {output_response}
                        </div>
                    </div>

                    {/* Model + tokens */}
                    <MetaGrid model_info={model_info} token_usage={token_usage} />

                    {/* Evaluation */}
                    <EvalSection evaluation_data={evaluation_data} />
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// AgentLogs — main export
// ---------------------------------------------------------------------------
export function AgentLogs({ selectedAgent, authToken }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);

    const fetchLogs = useCallback(async () => {
        if (!selectedAgent?.endpoint) return;
        setLoading(true);
        setError(null);
        try {
            const baseUrl = selectedAgent.endpoint.replace(/\/a2a\/?$/, '');
            const url = `${baseUrl}/logs?limit=100&offset=0`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setLogs(data.logs ?? []);
            setTotal(data.total ?? data.logs?.length ?? 0);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [selectedAgent, authToken]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    if (loading) {
        return (
            <div className="sl-logs-state">
                <div className="sl-logs-spinner" />
                Loading logs…
            </div>
        );
    }

    if (error) {
        return (
            <div className="sl-logs-state sl-logs-error-state">
                <span className="sl-logs-error-icon">⚠</span>
                Error fetching logs: {error}
            </div>
        );
    }

    return (
        <div className="sl-logs">
            {/* Header */}
            <div className="sl-logs-header">
                <div className="sl-logs-header-left">
                    <h3 className="sl-logs-title">Interaction logs</h3>
                    <span className="sl-logs-count">{total} total</span>
                </div>
                <button onClick={fetchLogs} className="sl-logs-refresh-btn" disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {/* List */}
            <div className="sl-logs-list">
                {logs.length === 0 ? (
                    <div className="sl-logs-empty">No logs found for this agent.</div>
                ) : (
                    logs.map((log) => <LogEntry key={log.id} log={log} />)
                )}
            </div>
        </div>
    );
}
