import React, { useState, useEffect } from 'react';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function StatusBadge({ initialized }) {
    return (
        <span className={`ai-status-badge ${initialized ? 'ai-status-badge--ok' : 'ai-status-badge--off'}`}>
            <span className="ai-status-dot" />
            {initialized ? 'Initialized' : 'Not Initialized'}
        </span>
    );
}

function BoolBadge({ value }) {
    const on = value === true || value === 'true' || value === 1;
    return (
        <span className={`ai-bool-badge ${on ? 'ai-bool-badge--on' : 'ai-bool-badge--off'}`}>
            {on ? '✓ Enabled' : '✕ Disabled'}
        </span>
    );
}

function FrameworkBadge({ value }) {
    return (
        <span className="ai-fw-badge">{value}</span>
    );
}

function MetaRow({ label, children }) {
    return (
        <div className="ai-meta-row">
            <span className="ai-meta-label">{label}</span>
            <span className="ai-meta-value">{children}</span>
        </div>
    );
}

function TagPill({ children }) {
    return <span className="ai-pill">{children}</span>;
}

function PromptCard({ text, index }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > 120;
    return (
        <div className="ai-prompt-card">
            <span className="ai-prompt-index">{String(index + 1).padStart(2, '0')}</span>
            <p className={`ai-prompt-text ${!expanded && isLong ? 'ai-prompt-text--clamp' : ''}`}>
                {text}
            </p>
            {isLong && (
                <button className="ai-prompt-expand" onClick={() => setExpanded(e => !e)}>
                    {expanded ? 'Show less ↑' : 'Show more ↓'}
                </button>
            )}
        </div>
    );
}

function SectionCard({ title, accent, children }) {
    return (
        <div className={`ai-section-card ${accent ? `ai-section-card--${accent}` : ''}`}>
            {title && <div className="ai-section-title">{title}</div>}
            {children}
        </div>
    );
}

function Stat({ label, value, mono }) {
    return (
        <div className="ai-stat">
            <span className="ai-stat-value" style={mono ? { fontFamily: 'var(--font-mono)' } : {}}>{value}</span>
            <span className="ai-stat-label">{label}</span>
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export function AgentInfo({ agentName, agentEndpoint, authToken, onBack }) {
    const [agentInfo, setAgentInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAgentInfo = async () => {
            setIsLoading(true);
            setError('');
            try {
                const baseUrl = agentEndpoint.replace(/\/a2a\/?$/, '');
                const response = await fetch(`${baseUrl}/info`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setAgentInfo(data);
                } else {
                    const err = await response.json().catch(() => ({}));
                    setError(err.message || `Failed to fetch agent info for '${agentName}' (${response.status})`);
                }
            } catch (e) {
                setError(`Network error: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        if (agentName) fetchAgentInfo();
    }, [agentName, agentEndpoint, authToken]);

    /* ── Loading ── */
    if (isLoading) {
        return (
            <div className="ai-loading">
                <div className="ai-loading-ring" />
                <span className="ai-loading-label">Loading <strong>{agentName}</strong>…</span>
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div className="ai-error-block">
                <span className="ai-error-icon">⚠</span>
                <div>
                    <div className="ai-error-title">Failed to load agent</div>
                    <div className="ai-error-msg">{error}</div>
                </div>
            </div>
        );
    }

    if (!agentInfo) {
        return <div className="cfg-list-empty">No information available for this agent.</div>;
    }

    const {
        description,
        cloud_provider,
        initialized,
        agent_config,
        auth_enabled,
        request_isolation,
        endpoint,
        framework,
    } = agentInfo;

    const tags    = agent_config?.tags    ?? [];
    const prompts = agent_config?.prompts ?? [];
    const subAgents = agent_config?.agent_list ? Object.keys(agent_config.agent_list) : [];

    return (
        <div className="ai-root">

            {/* ── Hero header ── */}
            <div className="ai-hero">
                <div className="ai-hero-avatar">
                    {(agentInfo.agent_name ?? agentName).charAt(0).toUpperCase()}
                </div>
                <div className="ai-hero-text">
                    <h1 className="ai-hero-name">{agentInfo.agent_name ?? agentName}</h1>
                    {description && <p className="ai-hero-desc">{description}</p>}
                    <div className="ai-hero-badges">
                        <StatusBadge initialized={initialized} />
                        {framework && <FrameworkBadge value={framework} />}
                        {cloud_provider && (
                            <span className="ai-cloud-badge">{cloud_provider}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Quick stats bar ── */}
            <div className="ai-stats-bar">
                <Stat label="Auth" value={auth_enabled ? 'On' : 'Off'} />
                <div className="ai-stats-divider" />
                <Stat label="Isolation" value={request_isolation ? 'On' : 'Off'} />
                <div className="ai-stats-divider" />
                <Stat label="Tags" value={tags.length} />
                <div className="ai-stats-divider" />
                <Stat label="Prompts" value={prompts.length} />
                {subAgents.length > 0 && <>
                    <div className="ai-stats-divider" />
                    <Stat label="Sub-Agents" value={subAgents.length} />
                </>}
            </div>

            {/* ── Runtime section ── */}
            <SectionCard title="Runtime">
                <MetaRow label="Endpoint">
                    <code className="ai-mono-val">{endpoint}</code>
                </MetaRow>
                <MetaRow label="Authentication"><BoolBadge value={auth_enabled} /></MetaRow>
                <MetaRow label="Request Isolation"><BoolBadge value={request_isolation} /></MetaRow>
                {cloud_provider && (
                    <MetaRow label="Cloud Provider">
                        <span className="ai-plain-val">{cloud_provider}</span>
                    </MetaRow>
                )}
            </SectionCard>

            {/* ── Agent config section ── */}
            {agent_config && (
                <SectionCard title="Configuration">
                    {agent_config.type && (
                        <MetaRow label="Type">
                            <span className="ai-plain-val">{agent_config.type}</span>
                        </MetaRow>
                    )}
                    {agent_config.source && (
                        <MetaRow label="Source">
                            <code className="ai-mono-val">{agent_config.source}</code>
                        </MetaRow>
                    )}
                    {agent_config.model && (
                        <MetaRow label="Model">
                            <span className="ai-model-chip">
                                <span className="ai-model-id">{agent_config.model.model_id}</span>
                                {agent_config.model.temperature != null && (
                                    <span className="ai-model-temp">
                                        temp {agent_config.model.temperature}
                                    </span>
                                )}
                            </span>
                        </MetaRow>
                    )}
                </SectionCard>
            )}

            {/* ── Sub-agents ── */}
            {subAgents.length > 0 && (
                <SectionCard title="Sub-Agents">
                    <div className="ai-subagent-grid">
                        {subAgents.map((sa) => (
                            <div key={sa} className="ai-subagent-chip">
                                <span className="ai-subagent-dot" />
                                {sa}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* ── Tags ── */}
            {tags.length > 0 && (
                <SectionCard title="Tags">
                    <div className="ai-pill-row">
                        {tags.map((t, i) => <TagPill key={i}>{t}</TagPill>)}
                    </div>
                </SectionCard>
            )}

            {/* ── Prompts ── */}
            {prompts.length > 0 && (
                <SectionCard title="Example Prompts">
                    <div className="ai-prompt-list">
                        {prompts.map((p, i) => (
                            <PromptCard key={i} text={p} index={i} />
                        ))}
                    </div>
                </SectionCard>
            )}
        </div>
    );
}