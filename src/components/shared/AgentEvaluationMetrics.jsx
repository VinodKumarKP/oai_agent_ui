import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    PieChart, Pie, Cell,
    LineChart, Line, ReferenceLine,
    AreaChart, Area,
    ScatterChart, Scatter, ZAxis,
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const avg = (arr, key) =>
    arr.length ? (arr.reduce((s, e) => s + (e?.[key] ?? 0), 0) / arr.length) : 0;

const evalAvg = (evals, key) =>
    evals.length ? (evals.reduce((s, e) => s + (e.evaluation_data?.[key] ?? 0), 0) / evals.length) : 0;

const scoreColor = (v, max = 10) => {
    const pct = v / max;
    if (pct >= 0.85) return 'var(--oai-success, #10b981)';
    if (pct >= 0.65) return 'var(--oai-warning, #f59e0b)';
    return 'var(--oai-error, #ef4444)';
};

const fmt2 = (n) => (typeof n === 'number' ? n.toFixed(2) : '–');
const fmtPct = (n, tot) => tot ? `${((n / tot) * 100).toFixed(1)}%` : '0%';
const fmtK = (n) => {
    if (typeof n !== 'number') return '–';
    if (n < 1000) return n.toString();
    return `${(n / 1000).toFixed(1)}k`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {
    return (
        <div className="metric-item" style={{ borderLeft: `3px solid ${accent || 'var(--oai-primary)'}` }}>
            <div>
                <span className="metric-label">{label}</span>
                {sub && <span style={{ fontSize: 11, color: 'var(--oai-text-disabled)', marginTop: 4, display: 'block' }}>{sub}</span>}
            </div>
            <span className="metric-value" style={{ color: accent || 'var(--oai-primary)', fontSize: 22 }}>{value}</span>
        </div>
    );
}

function SectionTitle({ children, badge }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 28 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--oai-text-muted)' }}>
                {children}
            </h3>
            {badge && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--oai-primary-dim, rgba(56,190,255,0.1))', color: 'var(--oai-primary)' }}>
                    {badge}
                </span>
            )}
            <div style={{ flex: 1, height: 1, background: 'var(--oai-border)' }} />
        </div>
    );
}

// Mini score pill with bar
function ScoreBar({ label, value, max = 10 }) {
    const pct = Math.round((value / max) * 100);
    const color = scoreColor(value, max);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
            <span style={{ width: 130, fontSize: 12, color: 'var(--oai-text-muted)', flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--oai-border)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ width: 36, fontSize: 12, fontFamily: 'var(--font-mono)', color, textAlign: 'right', fontWeight: 600 }}>
                {fmt2(value)}
            </span>
        </div>
    );
}

// Custom tooltip for charts
const DarkTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--oai-surface)',
            border: '1px solid var(--oai-border)',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
            {label && <div style={{ color: 'var(--oai-text-muted)', marginBottom: 4 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
                </div>
            ))}
        </div>
    );
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Performance', 'Quality', 'ML Scores', 'Recent'];

// ─── Main Component ───────────────────────────────────────────────────────────

export function AgentEvaluationMetrics({ agentEndpoint, authToken = 'dummy-token' }) {
    const [activeTab, setActiveTab] = useState('Overview');
    const [agentFilter, setAgentFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({});
    const [error, setError] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const fetchData = useCallback(async () => {
        if (!agentEndpoint) return;
        setLoading(true);
        setError(null);
        try {
            const baseUrl = agentEndpoint.replace(/\/a2a\/?$/, '');
            const evalsUrl = `${baseUrl}/evaluations/agent`;
            const statsUrl = `${baseUrl}/logs/stats`;

            const [evalsRes, statsRes] = await Promise.all([
                fetch(evalsUrl, {
                    cache: 'no-cache',
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' }
                }),
                fetch(statsUrl, {
                    cache: 'no-cache',
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' }
                })
            ]);

            if (!evalsRes.ok) throw new Error(`Evaluations: ${evalsRes.status} ${evalsRes.statusText}`);
            const evalsJson = await evalsRes.json();
            setData(Array.isArray(evalsJson) ? evalsJson : []);

            if (statsRes.ok) {
                const statsJson = await statsRes.json();
                setStats(statsJson.statistics);
            } else {
                console.warn(`Could not load agent stats: ${statsRes.status}`);
            }

            setLastRefreshed(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [agentEndpoint, authToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Unique agents
    const agents = useMemo(() => ['all', ...new Set(data.map(e => e.agent_name).filter(Boolean))], [data]);

    // Filtered evals
    const evals = useMemo(
        () => agentFilter === 'all' ? data : data.filter(e => e.agent_name === agentFilter),
        [data, agentFilter]
    );

    const sorted = useMemo(() => [...evals].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)), [evals]);

    // ── Aggregate KPIs ──────────────────────────────────────────────────────
    const total = evals.length;
    const avgQuality = avg(evals, 'quality_score');
    const halluCount = evals.filter(e => e.hallucination_detected).length;
    const halluRate = fmtPct(halluCount, total);
    const lowQuality = evals.filter(e => e.evaluation_data?.is_low_quality).length;
    const avgSatisfaction = evalAvg(evals, 'satisfaction_score');
    const avgCoherence = evalAvg(evals, 'coherence_score');
    const avgAccuracy = evalAvg(evals, 'accuracy_score');
    const avgToxicity = evalAvg(evals, 'toxicity_score');
    const avgBLEU = evalAvg(evals, 'bleu_score');
    const avgROUGE = evalAvg(evals, 'rouge_score');
    const avgPerplexity = evalAvg(evals, 'perplexity_score');

    // ── Chart Data ──────────────────────────────────────────────────────────

    // Quality over time
    const timelineData = sorted.map((e, i) => ({
        name: `#${i + 1}`,
        quality: e.quality_score,
        satisfaction: e.evaluation_data?.satisfaction_score ?? 0,
        accuracy: e.evaluation_data?.accuracy_score ?? 0,
        coherence: e.evaluation_data?.coherence_score ?? 0,
        ts: new Date(e.timestamp).toLocaleDateString(),
    }));

    // Radar: performance profile
    const radarKeys = ['clarity_score', 'accuracy_score', 'relevance_score', 'empathy_score', 'coherence_score', 'completeness_score', 'formality_score'];
    const radarData = radarKeys.map(k => ({
        subject: k.replace('_score', '').replace(/\b\w/g, l => l.toUpperCase()),
        value: parseFloat(evalAvg(evals, k).toFixed(2)),
        fullMark: 10,
    }));

    // Score distribution histogram (0-10)
    const distBuckets = Array.from({ length: 11 }, (_, i) => ({ score: i, count: 0 }));
    evals.forEach(e => {
        const s = Math.round(e.quality_score ?? 0);
        if (distBuckets[s]) distBuckets[s].count++;
    });

    // ML scores bar
    const mlData = [
        { name: 'BLEU', value: parseFloat((avgBLEU * 10).toFixed(2)) },
        { name: 'ROUGE', value: parseFloat((avgROUGE * 10).toFixed(2)) },
        { name: 'Recall', value: parseFloat(evalAvg(evals, 'recall_score').toFixed(2)) },
        { name: 'Precision', value: parseFloat(evalAvg(evals, 'precision_score').toFixed(2)) },
        { name: 'Context\nRecall', value: parseFloat(evalAvg(evals, 'context_recall').toFixed(2)) },
        { name: 'Ctx\nPrecision', value: parseFloat(evalAvg(evals, 'context_precision').toFixed(2)) },
        { name: 'Ctx\nAdherence', value: parseFloat(evalAvg(evals, 'context_adherence').toFixed(2)) },
    ];

    // Hallucination pie
    const pieData = [
        { name: 'Clean', value: total - halluCount },
        { name: 'Hallucination', value: halluCount },
    ];
    const PIE_COLORS = ['var(--oai-success,#10b981)', 'var(--oai-error,#ef4444)'];

    // Complexity breakdown
    const complexityMap = evals.reduce((acc, e) => {
        const c = e.evaluation_data?.complexity_level || 'unknown';
        acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {});
    const complexityData = Object.entries(complexityMap).map(([name, value]) => ({ name, value }));
    const COMPLEXITY_COLORS = ['#38beff', '#8b5cf6', '#f59e0b', '#10b981'];

    // Agent comparison (if multiple agents)
    const agentComparison = useMemo(() => {
        const agentNames = [...new Set(data.map(e => e.agent_name).filter(Boolean))];
        return agentNames.map(name => {
            const ag = data.filter(e => e.agent_name === name);
            return {
                name,
                quality: parseFloat(avg(ag, 'quality_score').toFixed(2)),
                satisfaction: parseFloat(evalAvg(ag, 'satisfaction_score').toFixed(2)),
                accuracy: parseFloat(evalAvg(ag, 'accuracy_score').toFixed(2)),
                hallucinations: ag.filter(e => e.hallucination_detected).length,
                count: ag.length,
            };
        });
    }, [data]);

    // Recent evals table
    const recent = [...sorted].reverse().slice(0, 10);

    if (loading) {
        return (
            <div className="metrics-empty">
                <span style={{ fontSize: 32 }}>📊</span>
                <span>Loading metrics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="metrics-empty">
                <span style={{ fontSize: 32 }}>📊</span>
                <span>{`Failed to load: ${error}`}</span>
                <button onClick={fetchData} style={{ marginTop: 12 }}>Retry</button>
            </div>
        );
    }

    if (data.length === 0 && Object.keys(stats).length === 0) {
        return (
            <div className="metrics-empty">
                <span style={{ fontSize: 32 }}>📊</span>
                <span>No evaluation data available.</span>
                <button onClick={fetchData} style={{ marginTop: 12 }}>Refresh</button>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* ── Sticky header + tabs ── */}
            <div style={{
                flexShrink: 0,
                background: 'var(--oai-bg)',
                borderBottom: '1px solid var(--oai-border)',
                padding: '16px 20px 0',
                zIndex: 10,
            }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--oai-text-main)', whiteSpace: 'nowrap' }}>Agent Evaluation Dashboard</h2>
                        <span style={{ fontSize: 11, color: 'var(--oai-text-disabled)' }}>
                            {total} evaluations · {agents.length - 1} agent{agents.length > 2 ? 's' : ''}
                            {lastRefreshed && ` · updated ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                    </div>

                    {agents.length > 2 && (
                        <select
                            value={agentFilter}
                            onChange={e => setAgentFilter(e.target.value)}
                            style={{
                                background: 'var(--oai-input-bg)',
                                border: '1px solid var(--oai-input-border)',
                                borderRadius: 6,
                                color: 'var(--oai-text)',
                                fontSize: 12,
                                padding: '5px 10px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-sans)',
                                flexShrink: 0,
                            }}
                        >
                            {agents.map(a => <option key={a} value={a}>{a === 'all' ? 'All Agents' : a}</option>)}
                        </select>
                    )}

                    <button
                        onClick={fetchData}
                        disabled={loading || !agentEndpoint}
                        title="Refresh metrics"
                        style={{
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--oai-input-border)',
                            background: loading ? 'var(--oai-primary-dim, rgba(56,190,255,0.1))' : 'var(--oai-input-bg)',
                            color: loading ? 'var(--oai-primary)' : 'var(--oai-text-muted)',
                            fontSize: 12,
                            fontWeight: 500,
                            fontFamily: 'var(--font-sans)',
                            cursor: (loading || !agentEndpoint) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.18s ease',
                            letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => { if (!loading && agentEndpoint) { e.currentTarget.style.borderColor = 'var(--oai-primary)'; e.currentTarget.style.color = 'var(--oai-primary)'; }}}
                        onMouseLeave={e => { if (!loading && agentEndpoint) { e.currentTarget.style.borderColor = 'var(--oai-input-border)'; e.currentTarget.style.color = 'var(--oai-text-muted)'; }}}
                    >
                        <svg
                            width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ flexShrink: 0, animation: loading ? 'metricsRefreshSpin 0.7s linear infinite' : 'none' }}
                        >
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        {loading ? 'Refreshing…' : 'Refresh'}
                        <style>{`@keyframes metricsRefreshSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </button>
                </div>

                {/* Tab bar — scrollable, never wraps, never shrinks */}
                <div style={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}>
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            style={{
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                padding: '8px 16px',
                                borderRadius: '6px 6px 0 0',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: 'none',
                                borderBottom: activeTab === t ? '2px solid var(--oai-primary)' : '2px solid transparent',
                                background: activeTab === t ? 'var(--oai-primary-dim, rgba(56,190,255,0.1))' : 'transparent',
                                color: activeTab === t ? 'var(--oai-primary)' : 'var(--oai-text-muted)',
                                transition: 'all 0.15s ease',
                                letterSpacing: '0.02em',
                                marginBottom: -1,
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="metrics-panel" style={{ flex: 1, overflowY: 'auto', padding: '20px', fontFamily: 'var(--font-sans)' }}>

            {/* ═══════════════════════ OVERVIEW TAB ═══════════════════════ */}
            {activeTab === 'Overview' && (
                <>
                    {/* KPI Cards */}
                    <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                        <StatCard label="Total Interactions" value={stats.total_interactions ?? '–'} sub="across all sessions" />
                        <StatCard label="Unique Sessions" value={stats.unique_sessions ?? '–'} />
                        <StatCard label="Avg Response Time" value={`${(stats.avg_response_time_ms / 1000).toFixed(2)}s` ?? '–'} />
                        <StatCard label="Total Tokens" value={fmtK(stats.total_tokens_sum)} sub="consumed" />
                        <StatCard
                            label="Avg Quality Score"
                            value={`${avgQuality.toFixed(1)}/10`}
                            accent={scoreColor(avgQuality)}
                            sub={avgQuality >= 8 ? 'Excellent' : avgQuality >= 6 ? 'Good' : 'Needs Work'}
                        />
                        <StatCard
                            label="Hallucination Rate"
                            value={halluRate}
                            accent={halluCount === 0 ? '#10b981' : halluCount / total > 0.1 ? '#ef4444' : '#f59e0b'}
                            sub={`${halluCount} detected`}
                        />
                        <StatCard
                            label="Avg Satisfaction"
                            value={`${avgSatisfaction.toFixed(1)}/10`}
                            accent={scoreColor(avgSatisfaction)}
                        />
                    </div>

                    {/* Quality over time + Hallucination pie */}
                    <SectionTitle badge={`${total} evals`}>Trend Overview</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                        <div className="chart-card">
                            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Quality Score Over Time</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={timelineData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#38beff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#38beff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--oai-border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                    <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <ReferenceLine y={avgQuality} stroke="#38beff" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: 'avg', position: 'insideTopRight', fontSize: 10, fill: '#38beff' }} />
                                    <Area type="monotone" dataKey="quality" name="Quality" stroke="#38beff" fill="url(#qualGrad)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                                    <Area type="monotone" dataKey="satisfaction" name="Satisfaction" stroke="#8b5cf6" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="chart-card">
                                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Hallucination</h3>
                                <ResponsiveContainer width="100%" height={140}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip content={<DarkTooltip />} />
                                        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-card">
                                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Complexity Mix</h3>
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Pie data={complexityData} cx="50%" cy="50%" outerRadius={50} dataKey="value">
                                            {complexityData.map((_, i) => <Cell key={i} fill={COMPLEXITY_COLORS[i % COMPLEXITY_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<DarkTooltip />} />
                                        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Agent Comparison (only when multiple agents visible) */}
                    {agentComparison.length > 1 && (
                        <>
                            <SectionTitle>Agent Comparison</SectionTitle>
                            <div className="chart-card">
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={agentComparison} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--oai-border)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--oai-text-muted)' }} />
                                        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                        <Tooltip content={<DarkTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Bar dataKey="quality" name="Quality" fill="#38beff" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="accuracy" name="Accuracy" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="satisfaction" name="Satisfaction" fill="#10b981" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ═══════════════════════ PERFORMANCE TAB ════════════════════ */}
            {activeTab === 'Performance' && (
                <>
                    <SectionTitle>Performance Profile (Radar)</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="chart-card">
                            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Avg Score by Dimension</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                                    <PolarGrid stroke="var(--oai-border)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--oai-text-muted)' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9, fill: 'var(--oai-text-disabled)' }} />
                                    <Radar name="Avg Score" dataKey="value" stroke="#38beff" fill="#38beff" fillOpacity={0.25} strokeWidth={2} />
                                    <Tooltip content={<DarkTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Score Breakdown</h3>
                            {[
                                ['Clarity', evalAvg(evals, 'clarity_score')],
                                ['Accuracy', evalAvg(evals, 'accuracy_score')],
                                ['Relevance', evalAvg(evals, 'relevance_score')],
                                ['Empathy', evalAvg(evals, 'empathy_score')],
                                ['Coherence', evalAvg(evals, 'coherence_score')],
                                ['Completeness', evalAvg(evals, 'completeness_score')],
                                ['Formality', evalAvg(evals, 'formality_score')],
                                ['Readability', evalAvg(evals, 'readability_score')],
                                ['Satisfaction', evalAvg(evals, 'satisfaction_score')],
                                ['Sentiment', evalAvg(evals, 'sentiment_score')],
                            ].map(([label, value]) => <ScoreBar key={label} label={label} value={value} />)}
                        </div>
                    </div>

                    {/* Multi-metric timeline */}
                    <SectionTitle>Multi-Metric Trend</SectionTitle>
                    <div className="chart-card">
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={timelineData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--oai-border)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="quality" name="Quality" stroke="#38beff" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="satisfaction" name="Satisfaction" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                                <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
                                <Line type="monotone" dataKey="coherence" name="Coherence" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="6 2" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {/* ═══════════════════════ QUALITY TAB ════════════════════════ */}
            {activeTab === 'Quality' && (
                <>
                    <SectionTitle>Quality Score Distribution</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="chart-card">
                            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Histogram (0–10)</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={distBuckets} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--oai-border)" />
                                    <XAxis dataKey="score" tick={{ fontSize: 11, fill: 'var(--oai-text-muted)' }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="count" name="Count" radius={[3, 3, 0, 0]}>
                                        {distBuckets.map((entry, i) => (
                                            <Cell key={i} fill={scoreColor(entry.score)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Quality Health</h3>
                            {[
                                { label: 'High Quality (≥8)', count: evals.filter(e => e.quality_score >= 8).length, color: '#10b981' },
                                { label: 'Medium Quality (5–7)', count: evals.filter(e => e.quality_score >= 5 && e.quality_score < 8).length, color: '#f59e0b' },
                                { label: 'Low Quality (<5)', count: evals.filter(e => e.quality_score < 5).length, color: '#ef4444' },
                                { label: 'Hallucinations', count: halluCount, color: '#f59e0b' },
                                { label: 'Has Structured Format', count: evals.filter(e => e.evaluation_data?.has_structured_format).length, color: '#8b5cf6' },
                                { label: 'Has Code Example', count: evals.filter(e => e.evaluation_data?.has_code_example).length, color: '#38beff' },
                            ].map(({ label, count, color }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--oai-border)' }}>
                                    <span style={{ fontSize: 12, color: 'var(--oai-text-muted)' }}>{label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 12, color: 'var(--oai-text-disabled)' }}>{fmtPct(count, total)}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color, minWidth: 28, textAlign: 'right' }}>{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Perplexity over time */}
                    <SectionTitle>Perplexity Score (lower = better)</SectionTitle>
                    <div className="chart-card">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={sorted.map((e, i) => ({ name: `#${i + 1}`, perplexity: e.evaluation_data?.perplexity_score ?? 0 }))} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="perpGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--oai-border)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Area type="monotone" dataKey="perplexity" name="Perplexity" stroke="#f59e0b" fill="url(#perpGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {/* ═══════════════════════ ML SCORES TAB ══════════════════════ */}
            {activeTab === 'ML Scores' && (
                <>
                    <SectionTitle badge="NLP metrics">ML Performance Metrics</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="chart-card">
                            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Avg NLP Scores (normalised /10)</h3>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={mlData} layout="vertical" margin={{ top: 4, right: 20, left: 30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--oai-border)" />
                                    <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--oai-text-muted)' }} width={70} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Score" radius={[0, 3, 3, 0]}>
                                        {mlData.map((entry, i) => <Cell key={i} fill={scoreColor(entry.value)} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Context Monitoring</h3>
                            {[
                                ['Context Recall', evalAvg(evals, 'context_recall')],
                                ['Context Precision', evalAvg(evals, 'context_precision')],
                                ['Context Adherence', evalAvg(evals, 'context_adherence')],
                                ['Context Relevance', evalAvg(evals, 'context_relevance')],
                                ['Intent Confidence', evalAvg(evals, 'intent_confidence')],
                            ].map(([label, value]) => <ScoreBar key={label} label={label} value={value} />)}

                            <div style={{ marginTop: 20 }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Text Quality</h3>
                                {[
                                    ['BLEU Score', avgBLEU * 10],
                                    ['ROUGE Score', avgROUGE * 10],
                                    ['Avg Perplexity', avgPerplexity, 20],
                                ].map(([label, value, max]) => <ScoreBar key={label} label={label} value={value} max={max ?? 10} />)}
                            </div>
                        </div>
                    </div>

                    {/* Hallucination score trend */}
                    <SectionTitle>Hallucination Score Trend</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="chart-card">
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={sorted.map((e, i) => ({ name: `#${i + 1}`, score: e.evaluation_data?.hallucination_score ?? 0 }))} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--oai-border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                    <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
                                    <Line type="monotone" dataKey="score" name="Hallucination Score" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--oai-text)' }}>Total Tokens Consumed</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={[{ name: 'Tokens', value: stats.total_tokens_sum }]} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--oai-border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--oai-text-muted)' }} />
                                    <YAxis tick={{ fontSize: 10, fill: 'var(--oai-text-disabled)' }} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Tokens" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════ RECENT TAB ══════════════════════════ */}
            {activeTab === 'Recent' && (
                <>
                    <SectionTitle badge="last 10">Recent Evaluations</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {recent.map((e, i) => {
                            const ed = e.evaluation_data || {};
                            const ts = new Date(e.timestamp);
                            const hasSub = i === 0;
                            return (
                                <div key={e.id} className="chart-card" style={{
                                    borderLeft: `3px solid ${scoreColor(e.quality_score)}`,
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: 12,
                                    alignItems: 'start',
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--oai-text-disabled)' }}>#{e.id}</span>
                                            <span style={{ fontSize: 11, color: 'var(--oai-text-muted)' }}>{e.agent_name}</span>
                                            <span style={{ fontSize: 10, color: 'var(--oai-text-disabled)', marginLeft: 'auto' }}>
                                                {ts.toLocaleDateString()} {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {ed.overall_assessment && (
                                            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--oai-text)', lineHeight: 1.5 }}>
                                                {ed.overall_assessment}
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {e.hallucination_detected && (
                                                <span className="evaluation-flag hallucination">⚠ Hallucination</span>
                                            )}
                                            {ed.is_low_quality && (
                                                <span className="evaluation-flag low-quality">Low Quality</span>
                                            )}
                                            {!ed.is_low_quality && !e.hallucination_detected && (
                                                <span className="evaluation-flag good-quality">✓ Clean</span>
                                            )}
                                            {ed.has_structured_format && (
                                                <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>Structured</span>
                                            )}
                                            {ed.complexity_level && (
                                                <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: 'rgba(255,255,255,0.05)', color: 'var(--oai-text-muted)' }}>{ed.complexity_level}</span>
                                            )}
                                            {ed.detected_intent && (
                                                <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 400, background: 'rgba(255,255,255,0.03)', color: 'var(--oai-text-disabled)', fontStyle: 'italic', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {ed.detected_intent}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 80 }}>
                                        <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 800, color: scoreColor(e.quality_score), lineHeight: 1 }}>
                                            {e.quality_score}
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--oai-text-disabled)', textAlign: 'right' }}>quality</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                                            {[
                                                ['Acc', ed.accuracy_score],
                                                ['Coh', ed.coherence_score],
                                                ['Rel', ed.relevance_score],
                                            ].map(([lbl, val]) => (
                                                <div key={lbl} style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                                                    <span style={{ fontSize: 10, color: 'var(--oai-text-disabled)' }}>{lbl}</span>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: scoreColor(val ?? 0) }}>{val ?? '–'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
            </div> {/* end scrollable content */}
        </div>
    );
}
