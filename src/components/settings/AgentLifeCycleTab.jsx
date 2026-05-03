import React, { useState, useEffect, useRef } from 'react';

/* ── Agent Life Cycle Tab ────────────────────────────────────────────────── */

// Derives initials from an agent name for the avatar (e.g. "data_pipeline" → "DP").
function agentInitials(name = '') {
    return name
        .split(/[_\-\s]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');
}

// Cycles through a small set of avatar palette classes based on name hash.
const LC_AVATAR_PALETTES = ['lc-av-blue', 'lc-av-teal', 'lc-av-amber', 'lc-av-coral', 'lc-av-purple'];
function agentAvatarClass(name = '') {
    const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return LC_AVATAR_PALETTES[hash % LC_AVATAR_PALETTES.length];
}

/* ── Version Manager (sub-component of AgentLifeCycleTab) ────────────────── */
function getUpdateLabel(selected, current) {
    if (!selected || !current) return 'Update';
    const toNum = v => v.replace(/[^0-9.]/g, '').split('.').map(Number);
    const a = toNum(selected);
    const b = toNum(current);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const ai = a[i] || 0;
        const bi = b[i] || 0;
        if (ai > bi) return 'Upgrade ↑';
        if (ai < bi) return 'Downgrade ↓';
    }
    return 'Reinstall';
}

function VersionManager({ agent, selectedVer, isActing, onSelectVersion, onApply }) {
    const [customVer, setCustomVer] = useState('');
    const [useCustom, setUseCustom] = useState(false);

    const currentVer    = agent.current_version;
    const availableVers = agent.available_versions || [];
    const otherVers     = availableVers.filter(v => v !== currentVer);

    // The version that will actually be submitted
    const targetVer = useCustom ? customVer.trim() : selectedVer;
    const btnLabel  = getUpdateLabel(targetVer, currentVer);
    const isUpgrade   = btnLabel.startsWith('Upgrade');
    const isDowngrade = btnLabel.startsWith('Downgrade');

    const handleToggleCustom = () => {
        setUseCustom(prev => !prev);
        setCustomVer('');
        if (!useCustom) onSelectVersion(''); // clear dropdown selection when switching to custom
    };

    return (
        <div className="lc-version-section">
            <div className="lc-version-header">
                <span className="lc-version-title">Container Image Version</span>
                {currentVer
                    ? <span className="lc-version-current-badge">{currentVer}</span>
                    : <span className="lc-version-unknown-badge">No version info</span>
                }
                <button
                    className={`lc-version-custom-toggle ${useCustom ? 'lc-version-custom-toggle--active' : ''}`}
                    onClick={handleToggleCustom}
                    disabled={isActing}
                    title={useCustom ? 'Switch to version picker' : 'Enter a custom version tag'}
                >
                    {useCustom ? '← Pick from list' : '+ Custom version'}
                </button>
            </div>

            <div className="lc-version-controls">
                {useCustom ? (
                    <input
                        className="lc-version-custom-input"
                        type="text"
                        placeholder="e.g. v1.0.6, latest, sha-abc123"
                        value={customVer}
                        onChange={e => setCustomVer(e.target.value)}
                        disabled={isActing}
                        autoFocus
                    />
                ) : otherVers.length > 0 ? (
                    <div className="lc-version-select-wrap">
                        <select
                            className="lc-version-select"
                            value={selectedVer}
                            onChange={e => onSelectVersion(e.target.value)}
                            disabled={isActing}
                        >
                            <option value="">— Select target version —</option>
                            {otherVers.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="lc-version-no-options">
                        No other versions available — use custom version to specify one.
                    </div>
                )}

                <button
                    className={`lc-version-apply-btn ${isUpgrade ? 'lc-version-apply-btn--upgrade' : ''} ${isDowngrade ? 'lc-version-apply-btn--downgrade' : ''}`}
                    disabled={!targetVer || isActing}
                    onClick={() => onApply(targetVer)}
                >
                    {btnLabel}
                </button>
            </div>

            {availableVers.length > 0 && (
                <div className="lc-version-pills">
                    {availableVers.map(v => (
                        <span
                            key={v}
                            className={`lc-version-pill ${v === currentVer ? 'lc-version-pill--current' : ''} ${!useCustom && v === selectedVer ? 'lc-version-pill--selected' : ''}`}
                            onClick={() => {
                                if (v === currentVer || isActing) return;
                                setUseCustom(false);
                                onSelectVersion(v);
                            }}
                            title={v === currentVer ? 'Current version' : `Select ${v}`}
                        >
                            {v}
                            {v === currentVer && <span className="lc-version-pill-cur-dot" />}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export function AgentLifeCycleTab({ agentRegistryUrl, authToken }) {
    const [agents, setAgents] = useState([]);
    const [isFetching, setIsFetching] = useState(false);  // true only while GET /info is in-flight
    const [isActing, setIsActing]     = useState(false);  // true while a lifecycle action is running
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);

    // Per-agent stream state: { [agentName]: { output, isStreaming, isOpen, action } }
    const [agentStreams, setAgentStreams] = useState({});
    const outputRefs = useRef({});

    // Per-agent selected version for upgrade/downgrade: { [agentName]: versionString }
    const [selectedVersions, setSelectedVersions] = useState({});

    useEffect(() => {
        fetchAgents();
    }, []);

    // Auto-scroll each stream output as it grows
    useEffect(() => {
        Object.keys(agentStreams).forEach(name => {
            const ref = outputRefs.current[name];
            if (ref) ref.scrollTop = ref.scrollHeight;
        });
    }, [agentStreams]);

    const setAgentStream = (agentName, patch) => {
        setAgentStreams(prev => ({
            ...prev,
            [agentName]: { ...prev[agentName], ...patch },
        }));
    };

    const fetchAgents = async () => {
        setIsFetching(true);
        setError('');
        try {
            const response = await fetch(`${agentRegistryUrl}/info`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                const agentsList = Array.isArray(data)
                    ? data
                    : data.agents
                        ? Object.entries(data.agents).map(([name, details]) => ({ name, ...details }))
                        : [];
                setAgents(agentsList);
                setPage(1);
            } else {
                const err = await response.json().catch(() => ({}));
                setError(err.message || `Failed to fetch agents (${response.status})`);
            }
        } catch {
            setError('Network error. Failed to fetch agents.');
        } finally {
            setIsFetching(false);
        }
    };

    const handleAgentAction = async (agentName, action) => {
        // Open the log panel and mark as streaming
        setAgentStream(agentName, { output: '', isStreaming: true, isOpen: true, action });
        setIsActing(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${agentRegistryUrl}/lifecycle/${agentName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ action, stream_output: true }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || `Failed to ${action} agent '${agentName}' (${response.status})`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            const read = () => {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        const verb = action === 'redeploy' ? 'redeployed' : `${action}ed`;
                        setSuccess(`Agent '${agentName}' ${verb} successfully.`);
                        // Mark streaming done — panel stays open so user can read the output
                        setAgentStream(agentName, { isStreaming: false });
                        fetchAgents();
                        setIsActing(false);
                        return;
                    }
                    const chunk = decoder.decode(value, { stream: true });
                    setAgentStreams(prev => ({
                        ...prev,
                        [agentName]: {
                            ...prev[agentName],
                            output: (prev[agentName]?.output || '') + chunk,
                        },
                    }));
                    read();
                }).catch(e => {
                    setError(e.message);
                    setAgentStream(agentName, { isStreaming: false });
                    setIsActing(false);
                });
            };

            read();

        } catch (e) {
            setError(e.message);
            setAgentStream(agentName, { isStreaming: false });
            setIsActing(false);
        }
    };

    const handleVersionUpdate = async (agentName, targetVersion, currentVersion) => {
        if (!targetVersion) return;
        const action = 'update';
        setAgentStream(agentName, { output: '', isStreaming: true, isOpen: true, action: `update → ${targetVersion}` });
        setIsActing(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${agentRegistryUrl}/lifecycle/${agentName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ action, version: targetVersion, stream_output: true }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || `Failed to update agent '${agentName}' to ${targetVersion} (${response.status})`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            const read = () => {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        setSuccess(`Agent '${agentName}' updated to ${targetVersion} successfully.`);
                        setAgentStream(agentName, { isStreaming: false });
                        fetchAgents();
                        setIsActing(false);
                        return;
                    }
                    const chunk = decoder.decode(value, { stream: true });
                    setAgentStreams(prev => ({
                        ...prev,
                        [agentName]: {
                            ...prev[agentName],
                            output: (prev[agentName]?.output || '') + chunk,
                        },
                    }));
                    read();
                }).catch(e => {
                    setError(e.message);
                    setAgentStream(agentName, { isStreaming: false });
                    setIsActing(false);
                });
            };

            read();

        } catch (e) {
            setError(e.message);
            setAgentStream(agentName, { isStreaming: false });
            setIsActing(false);
        }
    };

    const toggleLogPanel = (agentName) => {
        setAgentStreams(prev => ({
            ...prev,
            [agentName]: { ...prev[agentName], isOpen: !prev[agentName]?.isOpen },
        }));
    };

    const clearLog = (agentName) => {
        setAgentStreams(prev => ({
            ...prev,
            [agentName]: { ...prev[agentName], output: '', isOpen: false },
        }));
    };

    // Search + filter state
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'stopped'
    const [expandedAgent, setExpandedAgent] = useState(null); // name of expanded row
    const [sortField, setSortField]   = useState('name');     // 'name' | 'status' | 'framework'
    const [sortDir, setSortDir]       = useState('asc');

    // Derived counts (always from full list)
    const activeCount  = agents.filter(a => (a.status || '').toLowerCase() === 'active').length;
    const stoppedCount = agents.filter(a => (a.status || '').toLowerCase() === 'stopped').length;
    const otherCount   = agents.length - activeCount - stoppedCount;

    // Filter + search + sort pipeline
    const filteredAgents = agents
        .filter(a => {
            const s = (a.status || '').toLowerCase();
            if (statusFilter === 'active')  return s === 'active';
            if (statusFilter === 'stopped') return s === 'stopped';
            if (statusFilter === 'other')   return s !== 'active' && s !== 'stopped';
            return true;
        })
        .filter(a => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                (a.name || '').toLowerCase().includes(q) ||
                (a.description || '').toLowerCase().includes(q) ||
                (a.framework || '').toLowerCase().includes(q) ||
                (a.tags || []).some(t => t.toLowerCase().includes(q))
            );
        })
        .sort((a, b) => {
            let va = (a[sortField] || '').toLowerCase();
            let vb = (b[sortField] || '').toLowerCase();
            return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        });

    // Pagination on filtered set
    const LC_PAGE_SIZE_TABLE = 15;
    const totalPages = Math.max(1, Math.ceil(filteredAgents.length / LC_PAGE_SIZE_TABLE));
    const safePage   = Math.min(page, totalPages);
    const pageAgents = filteredAgents.slice((safePage - 1) * LC_PAGE_SIZE_TABLE, safePage * LC_PAGE_SIZE_TABLE);

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const toggleExpand = (name) => setExpandedAgent(prev => prev === name ? null : name);

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="lc-th-sort lc-th-sort--inactive">↕</span>;
        return <span className="lc-th-sort">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const filterTabs = [
        { id: 'all',     label: 'All',     count: agents.length },
        { id: 'active',  label: 'Active',  count: activeCount },
        { id: 'stopped', label: 'Stopped', count: stoppedCount },
        ...(otherCount > 0 ? [{ id: 'other', label: 'Other', count: otherCount }] : []),
    ];

    return (
        <>
            {/* Summary stat bar */}
            {!isFetching && agents.length > 0 && (
                <div className="lc-summary">
                    <div className="lc-stat-card">
                        <div className="lc-stat-label">Total</div>
                        <div className="lc-stat-value">{agents.length}</div>
                    </div>
                    <div className="lc-stat-card">
                        <div className="lc-stat-label">Active</div>
                        <div className="lc-stat-value lc-stat-active">{activeCount}</div>
                    </div>
                    <div className="lc-stat-card">
                        <div className="lc-stat-label">Stopped</div>
                        <div className="lc-stat-value lc-stat-stopped">{stoppedCount}</div>
                    </div>
                    {otherCount > 0 && (
                        <div className="lc-stat-card">
                            <div className="lc-stat-label">Other</div>
                            <div className="lc-stat-value">{otherCount}</div>
                        </div>
                    )}
                </div>
            )}

            <div className="cfg-card">
                {/* Toolbar: filter tabs + search + refresh */}
                <div className="lc-toolbar">
                    <div className="lc-filter-tabs">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`lc-filter-tab ${statusFilter === tab.id ? 'lc-filter-tab--active' : ''}`}
                                onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                            >
                                {tab.label}
                                <span className="lc-filter-tab-count">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                    <div className="lc-toolbar-right">
                        <div className="lc-search-wrap">
                            <span className="lc-search-icon">⌕</span>
                            <input
                                type="text"
                                className="lc-search"
                                placeholder="Search agents…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                            {search && (
                                <button className="lc-search-clear" onClick={() => { setSearch(''); setPage(1); }}>✕</button>
                            )}
                        </div>
                        <button
                            className="cfg-button cfg-button-secondary"
                            onClick={fetchAgents}
                            disabled={isFetching}
                        >
                            {isFetching
                                ? <><div className="cfg-spinner" />Refreshing…</>
                                : <><span className="cfg-refresh-icon">↺</span>Refresh</>
                            }
                        </button>
                    </div>
                </div>

                {/* Feedback notices */}
                {(error || success) && (
                    <div className="lc-notices">
                        {error   && <div className="cfg-notice cfg-notice-error"><span className="cfg-notice-icon">✕</span>{error}</div>}
                        {success && <div className="cfg-notice cfg-notice-success"><span className="cfg-notice-icon">✓</span>{success}</div>}
                    </div>
                )}

                {/* Table */}
                <div className="lc-table-wrap">
                    {isFetching && (
                        <div className="lc-loading-row">
                            <div className="cfg-spinner" /><span>Loading agents…</span>
                        </div>
                    )}

                    {!isFetching && filteredAgents.length === 0 && (
                        <div className="lc-table-empty">
                            {search || statusFilter !== 'all'
                                ? <>No agents match your filters. <button className="lc-clear-filters" onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear filters</button></>
                                : 'No agents registered yet.'
                            }
                        </div>
                    )}

                    {pageAgents.length > 0 && (
                        <table className="lc-table">
                            <thead>
                            <tr>
                                <th className="lc-th lc-th-expand" />
                                <th className="lc-th lc-th-agent" onClick={() => handleSort('name')}>
                                    Agent <SortIcon field="name" />
                                </th>
                                <th className="lc-th lc-th-status" onClick={() => handleSort('status')}>
                                    Status <SortIcon field="status" />
                                </th>
                                <th className="lc-th lc-th-framework" onClick={() => handleSort('framework')}>
                                    Framework <SortIcon field="framework" />
                                </th>
                                <th className="lc-th lc-th-tags">Tags</th>
                                <th className="lc-th lc-th-actions">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pageAgents.map((agent, index) => {
                                const status     = (agent.status || 'unknown').toLowerCase();
                                const initials   = agentInitials(agent.name);
                                const avatarCls  = agentAvatarClass(agent.name || '');
                                const stream     = agentStreams[agent.name] || {};
                                const isStreaming = !!stream.isStreaming;
                                const isLogOpen  = !!stream.isOpen;
                                const hasLog     = !!stream.output;
                                const isExpanded = expandedAgent === agent.name;

                                return (
                                    <React.Fragment key={agent.name || index}>
                                        {/* ── Main row ── */}
                                        <tr
                                            className={`lc-tr ${isExpanded ? 'lc-tr--expanded' : ''} ${isStreaming ? 'lc-tr--streaming' : ''}`}
                                            onClick={() => toggleExpand(agent.name)}
                                        >
                                            {/* Expand chevron */}
                                            <td className="lc-td lc-td-expand">
                                                <span className={`lc-chevron ${isExpanded ? 'lc-chevron--open' : ''}`}>›</span>
                                            </td>

                                            {/* Agent name + description */}
                                            <td className="lc-td lc-td-agent">
                                                <div className="lc-row-agent">
                                                    <div className={`lc-avatar lc-avatar--sm ${avatarCls}`}>{initials}</div>
                                                    <div className="lc-row-agent-text">
                                                            <span className="lc-row-name">
                                                                <span className="lc-agent-name-prefix">/</span>{agent.name || 'Unknown'}
                                                            </span>
                                                        {agent.description && (
                                                            <span className="lc-row-desc">{agent.description}</span>
                                                        )}
                                                    </div>
                                                    {isStreaming && <span className="lc-log-pulse" title="Action in progress" />}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="lc-td lc-td-status" onClick={e => e.stopPropagation()}>
                                                <div className={`lc-status-badge lc-status-${status}`}>
                                                    <span className="lc-status-dot" />
                                                    {agent.status || 'Unknown'}
                                                </div>
                                            </td>

                                            {/* Framework */}
                                            <td className="lc-td lc-td-framework">
                                                {agent.framework
                                                    ? <span className="lc-fw-badge">{agent.framework}</span>
                                                    : <span className="lc-td-empty">—</span>
                                                }
                                            </td>

                                            {/* Tags */}
                                            <td className="lc-td lc-td-tags" onClick={e => e.stopPropagation()}>
                                                {agent.tags && agent.tags.length > 0
                                                    ? <div className="lc-agent-tags lc-agent-tags--row">
                                                        {agent.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="lc-tag">
                                                                    <span className="lc-tag-hash">#</span>{tag}
                                                                </span>
                                                        ))}
                                                        {agent.tags.length > 3 && (
                                                            <span className="lc-tag lc-tag--more">+{agent.tags.length - 3}</span>
                                                        )}
                                                    </div>
                                                    : <span className="lc-td-empty">—</span>
                                                }
                                            </td>

                                            {/* Inline action buttons */}
                                            <td className="lc-td lc-td-actions" onClick={e => e.stopPropagation()}>
                                                <div className="lc-row-actions">
                                                    <button
                                                        className="cfg-button lc-btn-stop lc-btn--xs"
                                                        onClick={() => handleAgentAction(agent.name, 'stop')}
                                                        disabled={isActing || status !== 'active'}
                                                        title="Stop"
                                                    >■</button>
                                                    <button
                                                        className="cfg-button lc-btn-start lc-btn--xs"
                                                        onClick={() => handleAgentAction(agent.name, 'start')}
                                                        disabled={isActing || status === 'active'}
                                                        title="Start"
                                                    >▶</button>
                                                    <button
                                                        className="cfg-button cfg-button-secondary lc-btn--xs"
                                                        onClick={() => handleAgentAction(agent.name, 'rebuild')}
                                                        disabled={isActing}
                                                        title="Redeploy"
                                                    >↺</button>
                                                    {(hasLog || isStreaming) && (
                                                        <button
                                                            className={`lc-log-toggle-btn lc-btn--xs ${isLogOpen ? 'lc-log-toggle-btn--open' : ''}`}
                                                            onClick={() => toggleLogPanel(agent.name)}
                                                            title={isLogOpen ? 'Hide logs' : 'Show logs'}
                                                        >≡</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ── Expanded detail row ── */}
                                        {isExpanded && (
                                            <tr className="lc-tr-detail">
                                                <td colSpan={6} className="lc-td-detail">
                                                    <div className="lc-detail-body">
                                                        {/* Meta grid */}
                                                        <div className="lc-detail-meta">
                                                            {agent.endpoint && (
                                                                <div className="lc-detail-meta-item">
                                                                    <span className="lc-detail-meta-key">Endpoint</span>
                                                                    <span className="lc-detail-meta-val">{agent.endpoint}</span>
                                                                </div>
                                                            )}
                                                            {agent.port && (
                                                                <div className="lc-detail-meta-item">
                                                                    <span className="lc-detail-meta-key">Port</span>
                                                                    <span className="lc-detail-meta-val">{agent.port}</span>
                                                                </div>
                                                            )}
                                                            {agent.framework && (
                                                                <div className="lc-detail-meta-item">
                                                                    <span className="lc-detail-meta-key">Framework</span>
                                                                    <span className="lc-detail-meta-val">{agent.framework}</span>
                                                                </div>
                                                            )}
                                                            {agent.source && (
                                                                <div className="lc-detail-meta-item">
                                                                    <span className="lc-detail-meta-key">Source</span>
                                                                    <span className="lc-detail-meta-val lc-mono">{agent.source}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* All tags */}
                                                        {agent.tags && agent.tags.length > 0 && (
                                                            <div className="lc-detail-tags">
                                                                {agent.tags.map(tag => (
                                                                    <span key={tag} className="lc-tag">
                                                                            <span className="lc-tag-hash">#</span>{tag}
                                                                        </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Version management */}
                                                        <VersionManager
                                                            agent={agent}
                                                            selectedVer={selectedVersions[agent.name] || ''}
                                                            isActing={isActing}
                                                            onSelectVersion={ver => setSelectedVersions(prev => ({ ...prev, [agent.name]: ver }))}
                                                            onApply={ver => handleVersionUpdate(agent.name, ver, agent.current_version)}
                                                        />

                                                        {/* Stream log panel */}
                                                        {(hasLog || isStreaming) && isLogOpen && (
                                                            <div className="lc-stream-panel">
                                                                <div className="lc-stream-panel-header">
                                                                        <span className="lc-stream-panel-title">
                                                                            {isStreaming
                                                                                ? <><span className="lc-stream-live-dot" />Live — {stream.action}</>
                                                                                : <>Log — {stream.action}</>
                                                                            }
                                                                        </span>
                                                                    {!isStreaming && (
                                                                        <button className="lc-stream-clear-btn" onClick={() => clearLog(agent.name)}>Clear</button>
                                                                    )}
                                                                </div>
                                                                <div className="lc-stream-output" ref={el => { outputRefs.current[agent.name] = el; }}>
                                                                        <pre className="lc-stream-pre">
                                                                            {stream.output || (isStreaming ? 'Waiting for output…' : '')}
                                                                        </pre>
                                                                    {isStreaming && <span className="lc-stream-cursor">▋</span>}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Action buttons inside detail */}
                                                        <div className="lc-detail-actions">
                                                            <button className="cfg-button lc-btn-stop" onClick={() => handleAgentAction(agent.name, 'stop')} disabled={isActing || status !== 'active'}>■ Stop</button>
                                                            <button className="cfg-button lc-btn-start" onClick={() => handleAgentAction(agent.name, 'start')} disabled={isActing || status === 'active'}>▶ Start</button>
                                                            <button className="cfg-button cfg-button-secondary" onClick={() => handleAgentAction(agent.name, 'rebuild')} disabled={isActing}>↺ Redeploy</button>
                                                            {(hasLog || isStreaming) && (
                                                                <button className={`lc-log-toggle-btn ${isLogOpen ? 'lc-log-toggle-btn--open' : ''}`} onClick={() => toggleLogPanel(agent.name)}>
                                                                    {isStreaming && <span className="lc-log-pulse" />}
                                                                    {isLogOpen ? '▲ Hide Logs' : '▼ Show Logs'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination footer */}
                {!isFetching && filteredAgents.length > 0 && (
                    <div className="lc-pagination">
                        <span className="lc-page-info">
                            {filteredAgents.length === agents.length
                                ? `${agents.length} agent${agents.length !== 1 ? 's' : ''}`
                                : `${filteredAgents.length} of ${agents.length} agents`
                            }
                        </span>
                        {totalPages > 1 && (
                            <div className="lc-page-controls">
                                <button className="lc-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>‹</button>
                                <span className="lc-page-counter">{safePage} / {totalPages}</span>
                                <button className="lc-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>›</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
