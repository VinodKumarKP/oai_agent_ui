import React, { useState, useEffect, useCallback } from 'react';

const PAGE_SIZE_OPTIONS = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

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
            <div className="sl-score-val" style={{ color }}>
                {value}<span className="sl-score-max">/{max}</span>
            </div>
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
                        <span className="sl-meta-val">
                            {token_usage.input_token_details.cache_read?.toLocaleString() ?? 0}
                        </span>
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
        input_message, output_response, timestamp,
        status, response_time_ms, model_info, token_usage, evaluation_data,
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
                    <MetaGrid model_info={model_info} token_usage={token_usage} />
                    <EvalSection evaluation_data={evaluation_data} />
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// PaginationBar
// ---------------------------------------------------------------------------
function PaginationBar({ currentPage, totalPages, pageSize, total, onPageChange, onPageSizeChange, loading }) {
    const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to   = Math.min(currentPage * pageSize, total);

    const buildPages = () => {
        const pages = [];
        const delta = 1;
        const rangeStart = Math.max(2, currentPage - delta);
        const rangeEnd   = Math.min(totalPages - 1, currentPage + delta);

        pages.push(1);
        if (rangeStart > 2)            pages.push('ellipsis-left');
        for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
        if (rangeEnd < totalPages - 1) pages.push('ellipsis-right');
        if (totalPages > 1)            pages.push(totalPages);

        return pages;
    };

    const pages = totalPages > 1 ? buildPages() : [1];

    return (
        <div className="sl-pagination">
            <span className="sl-pagination-info">
                {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
            </span>

            <div className="sl-pagination-controls">
                <button
                    className="sl-page-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    aria-label="Previous page"
                >‹</button>

                {pages.map((p) =>
                    typeof p === 'string' ? (
                        <span key={p} className="sl-page-ellipsis">…</span>
                    ) : (
                        <button
                            key={p}
                            className={`sl-page-btn ${p === currentPage ? 'sl-page-active' : ''}`}
                            onClick={() => onPageChange(p)}
                            disabled={loading}
                        >{p}</button>
                    )
                )}

                <button
                    className="sl-page-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading || totalPages === 0}
                    aria-label="Next page"
                >›</button>
            </div>

            <div className="sl-page-size-wrap">
                <span className="sl-page-size-label">Rows</span>
                <select
                    className="sl-page-size-select"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    disabled={loading}
                >
                    {PAGE_SIZE_OPTIONS.map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// AgentLogs — main export
// ---------------------------------------------------------------------------
export function AgentLogs({ selectedAgent, authToken }) {
    const [logs, setLogs]               = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [total, setTotal]             = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize]       = useState(DEFAULT_PAGE_SIZE);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const fetchLogs = useCallback(async (page, size) => {
        if (!selectedAgent?.endpoint) return;
        setLoading(true);
        setError(null);

        const reqHeaders = {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
        };
        const baseUrl = selectedAgent.endpoint.replace(/\/a2a\/?$/, '');

        try {
            // 1. Get authoritative total from /logs/stats
            const statsRes = await fetch(`${baseUrl}/logs/stats`, { headers: reqHeaders });
            if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);
            const statsData = await statsRes.json();
            const knownTotal = statsData?.statistics?.total_interactions ?? 0;
            setTotal(knownTotal);

            // 2. Fetch the requested page of logs
            const offset  = (page - 1) * size;
            const logsRes = await fetch(`${baseUrl}/logs?limit=${size}&offset=${offset}`, { headers: reqHeaders });
            if (!logsRes.ok) throw new Error(`Logs fetch failed: ${logsRes.status}`);
            const logsData = await logsRes.json();
            setLogs(logsData.logs ?? []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [selectedAgent, authToken]);

    // Reset when agent switches
    useEffect(() => {
        setCurrentPage(1);
        setPageSize(DEFAULT_PAGE_SIZE);
        setLogs([]);
        setTotal(0);
    }, [selectedAgent?.endpoint]);

    // Fetch on page / size / agent change
    useEffect(() => {
        fetchLogs(currentPage, pageSize);
    }, [currentPage, pageSize, selectedAgent?.endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || loading) return;
        setCurrentPage(page);
        document.querySelector('.sl-logs-list')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

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
                    {!loading && <span className="sl-logs-count">{total} total</span>}
                </div>
                <button
                    onClick={() => fetchLogs(currentPage, pageSize)}
                    className="sl-logs-refresh-btn"
                    disabled={loading}
                >
                    {loading ? 'Loading…' : 'Refresh'}
                </button>
            </div>

            {/* Log list */}
            <div className={`sl-logs-list ${loading ? 'sl-logs-list-loading' : ''}`}>
                {loading ? (
                    <div className="sl-logs-state">
                        <div className="sl-logs-spinner" />
                        Loading logs…
                    </div>
                ) : logs.length === 0 ? (
                    <div className="sl-logs-empty">No logs found for this agent.</div>
                ) : (
                    logs.map((log) => <LogEntry key={log.id} log={log} />)
                )}
            </div>

            {/* Pagination */}
            <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                total={total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                loading={loading}
            />
        </div>
    );
}