import React, { useState, useEffect } from 'react';
// Styles for this component live in styles.css (cfg-* classes)

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const DESCRIPTION_MIN_LENGTH = 20;

// Parses any URL into display segments; returns null if invalid.
function parseUrl(raw) {
    try {
        const u = new URL(raw.trim());
        return { scheme: u.protocol + '//', host: u.host, path: u.pathname };
    } catch {
        return null;
    }
}

// Returns true for valid Git remote URLs (HTTPS, SSH, and git:// protocols).
function isValidGitUrl(raw) {
    const s = raw.trim();
    // HTTPS: https://github.com/user/repo or https://github.com/user/repo.git
    if (/^https?:\/\/.+\/.+\/.+/.test(s)) return true;
    // SSH: git@github.com:user/repo.git
    if (/^git@[\w.-]+:[\w./-]+/.test(s)) return true;
    // git:// protocol
    if (/^git:\/\/.+/.test(s)) return true;
    return false;
}

// Replaces spaces with underscores and lowercases a name string.
function normalizeName(raw) {
    return raw.replace(/ /g, '_').toLowerCase();
}

/* ── Register Tab ────────────────────────────────────────────────────────── */
function RegisterTab({ agentRegistryUrl, authToken }) {
    const [name, setName]               = useState('');
    const [description, setDescription] = useState('');
    const [sourceUrl, setSourceUrl]     = useState('');
    const [endpoint, setEndpoint]       = useState('');
    const [port, setPort]               = useState('');
    const [framework, setFramework]     = useState('langgraph');
    const [tags, setTags]               = useState([]);
    const [tagInput, setTagInput]        = useState('');
    const [prompts, setPrompts]          = useState([]);
    const [promptInput, setPromptInput]  = useState('');
    const [active, setActive]           = useState(true);
    const [isLoading, setIsLoading]     = useState(false);
    const [error, setError]             = useState('');
    const [success, setSuccess]         = useState('');

    // Touched states for validation
    const [nameTouched, setNameTouched]           = useState(false);
    const [descTouched, setDescTouched]           = useState(false);
    const [urlTouched, setUrlTouched]             = useState(false);

    const parsedUrl     = parseUrl(sourceUrl);
    const gitUrlValid   = isValidGitUrl(sourceUrl);
    const descWordCount = description.trim().split(/\s+/).filter(Boolean).length;
    const descValid     = description.trim().length >= DESCRIPTION_MIN_LENGTH;

    const handleNameChange = (e) => {
        setName(normalizeName(e.target.value));
        setNameTouched(true);
    };

    const handleDescChange = (e) => {
        setDescription(e.target.value);
        setDescTouched(true);
    };

    const handleUrlChange = (e) => {
        setSourceUrl(e.target.value);
        setUrlTouched(true);
    };

    const handleFrameworkChange = (e) => {
        setFramework(e.target.value);
    };

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleAddPrompt = () => {
        const trimmed = promptInput.trim();
        if (trimmed && !prompts.includes(trimmed)) {
            setPrompts([...prompts, trimmed]);
            setPromptInput('');
        }
    };

    const handleRemovePrompt = (index) => {
        setPrompts(prompts.filter((_, i) => i !== index));
    };

    const handlePromptKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddPrompt();
        }
    };

    const validate = () => {
        if (!name.trim())        return 'Name is required.';
        if (!descValid)          return `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.`;
        if (!sourceUrl.trim())   return 'Source URL is required.';
        if (!gitUrlValid)        return 'Source URL must be a valid Git URL (HTTPS, SSH, or git://).';
        return null;
    };

    const handleRegister = async () => {
        setNameTouched(true); setDescTouched(true); setUrlTouched(true);
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${agentRegistryUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    source: sourceUrl.trim(),
                    endpoint: endpoint.trim() || null,
                    port: port ? parseInt(port, 10) : null,
                    framework,
                    tags,
                    prompts,
                    active,
                    registered_via: 'registry',
                }),
            });

            if (response.ok) {
                setSuccess('Agent registered successfully.');
                setName(''); setDescription(''); setSourceUrl(''); setEndpoint(''); setPort('');
                setFramework('langgraph'); setActive(true); setTags([]); setPrompts('');
                setNameTouched(false); setDescTouched(false); setUrlTouched(false);
            } else {
                const err = await response.json().catch(() => ({}));
                const errorMsg = err.message || (typeof err.detail === 'string' ? err.detail : err.detail?.msg || JSON.stringify(err.detail)) || `Registration failed (${response.status})`;
                setError(errorMsg);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <p className="cfg-intro">
                Add a new agent to the registry. Once registered, it will appear in the sidebar and be available for conversations.
            </p>

            <div className="cfg-card">
                <div className="cfg-card-header">
                    <div className="cfg-card-header-text">
                        <div className="cfg-card-title">Agent Details</div>
                        <div className="cfg-card-subtitle">Configure the new agent's properties.</div>
                    </div>
                </div>
                <div className="cfg-card-body">
                    {/* Name */}
                    <div className={`cfg-field ${nameTouched && !name.trim() ? 'cfg-field--invalid' : ''}`}>
                        <div>
                            <div className="cfg-field-label">Name</div>
                            <div className="cfg-field-hint">Lowercase · spaces become underscores</div>
                        </div>
                        <div>
                            <input
                                type="text"
                                className={`cfg-input ${nameTouched && !name.trim() ? 'cfg-input--invalid' : ''}`}
                                placeholder="e.g. code_reviewer"
                                value={name}
                                onChange={handleNameChange}
                                onBlur={() => setNameTouched(true)}
                            />
                            {nameTouched && !name.trim() && (
                                <div className="cfg-field-error">Name is required.</div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className={`cfg-field ${descTouched && !descValid ? 'cfg-field--invalid' : ''}`}>
                        <div>
                            <div className="cfg-field-label">Description</div>
                            <div className="cfg-field-hint">Min {DESCRIPTION_MIN_LENGTH} characters</div>
                        </div>
                        <div>
                            <textarea
                                className={`cfg-textarea ${descTouched && !descValid ? 'cfg-input--invalid' : ''}`}
                                placeholder="Describe what this agent does, its capabilities, and intended use…"
                                value={description}
                                onChange={handleDescChange}
                                onBlur={() => setDescTouched(true)}
                            />
                            <div className="cfg-field-meta">
                                {descTouched && !descValid ? (
                                    <span className="cfg-field-error">
                                        At least {DESCRIPTION_MIN_LENGTH} characters required ({description.trim().length} so far).
                                    </span>
                                ) : (
                                    <span className="cfg-field-count">{description.trim().length} chars · {descWordCount} words</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Source URL */}
                    <div className={`cfg-field ${urlTouched && sourceUrl && !gitUrlValid ? 'cfg-field--invalid' : ''}`}>
                        <div>
                            <div className="cfg-field-label">Source URL</div>
                            <div className="cfg-field-hint">Must be a valid Git URL</div>
                        </div>
                        <div>
                            <input
                                type="text"
                                className={`cfg-input ${urlTouched && sourceUrl && !gitUrlValid ? 'cfg-input--invalid' : ''}`}
                                placeholder="https://github.com/org/repo.git"
                                value={sourceUrl}
                                onChange={handleUrlChange}
                                onBlur={() => setUrlTouched(true)}
                            />
                            {urlTouched && sourceUrl && !gitUrlValid ? (
                                <div className="cfg-field-error">
                                    Must be a valid Git URL — e.g. <code className="cfg-code">https://github.com/org/repo.git</code> or <code className="cfg-code">git@github.com:org/repo.git</code>
                                </div>
                            ) : (
                                <div className={`cfg-url-preview ${parsedUrl && gitUrlValid ? 'visible' : ''}`}>
                                    {parsedUrl && gitUrlValid && (
                                        <>
                                            <span className="cfg-url-scheme">{parsedUrl.scheme}</span>
                                            <span className="cfg-url-host">{parsedUrl.host}</span>
                                            <span className="cfg-url-path">{parsedUrl.path}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Endpoint (Optional) */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Endpoint</div>
                            <div className="cfg-field-hint">Optional · agent server address</div>
                        </div>
                        <div>
                            <input
                                type="text"
                                className="cfg-input"
                                placeholder="e.g. http://localhost:8000"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Port (Optional) */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Port</div>
                            <div className="cfg-field-hint">Optional · numeric port number</div>
                        </div>
                        <div>
                            <input
                                type="number"
                                className="cfg-input"
                                placeholder="e.g. 8000"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                min="1"
                                max="65535"
                            />
                        </div>
                    </div>

                    {/* Framework */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Framework</div>
                            <div className="cfg-field-hint">Select the agent framework</div>
                        </div>
                        <div>
                            <select
                                className="cfg-input"
                                value={framework}
                                onChange={handleFrameworkChange}
                            >
                                <option value="langgraph">LangGraph</option>
                                <option value="strands">Strands</option>
                                <option value="crewai">CrewAI</option>
                                <option value="openai">OpenAI</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Tags</div>
                            <div className="cfg-field-hint">Optional · add descriptive tags</div>
                        </div>
                        <div>
                            <div className="cfg-list-input-container">
                                <input
                                    type="text"
                                    className="cfg-input"
                                    placeholder="Enter a tag and press Enter"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyPress}
                                />
                                <button
                                    type="button"
                                    className="cfg-list-add-btn"
                                    onClick={handleAddTag}
                                    disabled={!tagInput.trim()}
                                >
                                    +
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div className="cfg-list-items">
                                    {tags.map((tag, index) => (
                                        <div key={index} className="cfg-list-item">
                                            <span className="cfg-list-item-text">{tag}</span>
                                            <button
                                                type="button"
                                                className="cfg-list-item-remove"
                                                onClick={() => handleRemoveTag(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {tags.length === 0 && (
                                <div className="cfg-list-empty">No tags added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Prompts */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Prompts</div>
                            <div className="cfg-field-hint">Optional · add system prompts or instructions</div>
                        </div>
                        <div>
                            <div className="cfg-list-input-container">
                                <textarea
                                    className="cfg-input cfg-textarea-compact"
                                    placeholder="Enter a prompt and press Enter"
                                    value={promptInput}
                                    onChange={(e) => setPromptInput(e.target.value)}
                                    onKeyDown={handlePromptKeyPress}
                                    rows="2"
                                />
                                <button
                                    type="button"
                                    className="cfg-list-add-btn"
                                    onClick={handleAddPrompt}
                                    disabled={!promptInput.trim()}
                                >
                                    +
                                </button>
                            </div>
                            {prompts.length > 0 && (
                                <div className="cfg-list-items">
                                    {prompts.map((prompt, index) => (
                                        <div key={index} className="cfg-list-item cfg-list-item-prompt">
                                            <span className="cfg-list-item-text">{prompt}</span>
                                            <button
                                                type="button"
                                                className="cfg-list-item-remove"
                                                onClick={() => handleRemovePrompt(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {prompts.length === 0 && (
                                <div className="cfg-list-empty">No prompts added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Active toggle */}
                    <div className="cfg-field cfg-field--last">
                        <div>
                            <div className="cfg-field-label">Status</div>
                            <div className="cfg-field-hint">Enable immediately on register</div>
                        </div>
                        <div className="cfg-toggle-row">
                            <label className="cfg-toggle">
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={e => setActive(e.target.checked)}
                                />
                                <div className="cfg-toggle-track" />
                            </label>
                            <span className={`cfg-toggle-status ${active ? 'is-active' : ''}`}>
                                {active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions + feedback */}
            <div className="cfg-actions cfg-actions--card">
                <div className="cfg-actions-feedback">
                    {error && (
                        <div className="cfg-notice cfg-notice-error">
                            <span className="cfg-notice-icon">✕</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="cfg-notice cfg-notice-success">
                            <span className="cfg-notice-icon">✓</span>
                            {success}
                        </div>
                    )}
                </div>
                <button
                    className="cfg-submit-btn"
                    onClick={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="cfg-spinner" />
                            Registering…
                        </>
                    ) : (
                        <>
                            <span className="cfg-submit-icon">↑</span>
                            Register Agent
                        </>
                    )}
                </button>
            </div>
        </>
    );
}

/* ── Agent Life Cycle Tab ────────────────────────────────────────────────── */

const LC_PAGE_SIZE = 5;

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

function AgentLifeCycleTab({ agentRegistryUrl, authToken }) {
    const [agents, setAgents]     = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');
    const [page, setPage]         = useState(1);

    useEffect(() => { fetchAgents(); }, []);

    const fetchAgents = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const handleAgentAction = async (agentName, action) => {
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${agentRegistryUrl}/registry/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ name: agentName }),
            });
            if (response.ok) {
                const verb = action === 'refresh' ? 'redeployed' : `${action}ed`;
                setSuccess(`Agent '${agentName}' ${verb} successfully.`);
                fetchAgents();
            } else {
                const err = await response.json().catch(() => ({}));
                setError(err.message || `Failed to ${action} agent '${agentName}' (${response.status})`);
            }
        } catch {
            setError(`Network error. Failed to ${action} agent '${agentName}'.`);
        } finally {
            setIsLoading(false);
        }
    };

    // Pagination math
    const totalPages  = Math.max(1, Math.ceil(agents.length / LC_PAGE_SIZE));
    const safePage    = Math.min(page, totalPages);
    const pageAgents  = agents.slice((safePage - 1) * LC_PAGE_SIZE, safePage * LC_PAGE_SIZE);

    // Summary counts
    const activeCount  = agents.filter(a => (a.status || '').toLowerCase() === 'active').length;
    const stoppedCount = agents.filter(a => (a.status || '').toLowerCase() === 'stopped').length;

    // Pagination page numbers with ellipsis
    const buildPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = new Set([1, totalPages, safePage, safePage - 1, safePage + 1].filter(p => p >= 1 && p <= totalPages));
        const sorted = [...pages].sort((a, b) => a - b);
        const result = [];
        sorted.forEach((p, i) => {
            if (i > 0 && p - sorted[i - 1] > 1) result.push('…');
            result.push(p);
        });
        return result;
    };

    return (
        <>
            <p className="cfg-intro">
                Manage the lifecycle of registered agents: stop, restart, or redeploy them.
            </p>

            {/* Summary stats */}
            {!isLoading && agents.length > 0 && (
                <div className="lc-summary">
                    <div className="lc-stat-card">
                        <div className="lc-stat-label">Total agents</div>
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
                </div>
            )}

            <div className="cfg-card">
                <div className="cfg-card-header">
                    <div className="cfg-card-header-text">
                        <div className="cfg-card-title">Registered Agents</div>
                        <div className="cfg-card-subtitle">
                            {agents.length > 0
                                ? `Showing ${(safePage - 1) * LC_PAGE_SIZE + 1}–${Math.min(safePage * LC_PAGE_SIZE, agents.length)} of ${agents.length}`
                                : 'View and manage the lifecycle of your agents.'}
                        </div>
                    </div>
                    <div className="cfg-card-actions">
                        <button
                            className="cfg-button cfg-button-secondary"
                            onClick={fetchAgents}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <><div className="cfg-spinner" />Refreshing…</>
                            ) : (
                                <><span className="cfg-refresh-icon">↺</span>Refresh</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="cfg-card-body">
                    {isLoading && (
                        <div className="lc-loading-row">
                            <div className="cfg-spinner" />
                            <span>Loading agents…</span>
                        </div>
                    )}
                    {error && (
                        <div className="cfg-notice cfg-notice-error">
                            <span className="cfg-notice-icon">✕</span>{error}
                        </div>
                    )}
                    {success && (
                        <div className="cfg-notice cfg-notice-success">
                            <span className="cfg-notice-icon">✓</span>{success}
                        </div>
                    )}

                    {!isLoading && agents.length === 0 && !error && (
                        <div className="cfg-list-empty">No agents registered yet.</div>
                    )}

                    {!isLoading && pageAgents.length > 0 && (
                        <div className="lc-agent-list">
                            {pageAgents.map((agent, index) => {
                                const status    = (agent.status || 'unknown').toLowerCase();
                                const initials  = agentInitials(agent.name);
                                const avatarCls = agentAvatarClass(agent.name || '');

                                return (
                                    <div key={agent.name || index} className="lc-agent-card">
                                        {/* Card top: avatar + name + status */}
                                        <div className="lc-agent-top">
                                            <div className={`lc-avatar ${avatarCls}`}>{initials}</div>
                                            <div className="lc-agent-info">
                                                <div className="lc-agent-name">
                                                    <span className="lc-agent-name-prefix">/</span>
                                                    {agent.name || 'Unknown Agent'}
                                                </div>
                                                {agent.description && (
                                                    <div className="lc-agent-desc">{agent.description}</div>
                                                )}
                                            </div>
                                            <div className={`lc-status-badge lc-status-${status}`}>
                                                <span className="lc-status-dot" />
                                                {agent.status || 'Unknown'}
                                            </div>
                                        </div>

                                        {/* Meta pills */}
                                        {(agent.framework || agent.endpoint || agent.port) && (
                                            <div className="lc-agent-meta">
                                                {agent.framework && (
                                                    <span className="lc-meta-pill">
                                                        <span className="lc-meta-key">Framework</span>
                                                        {agent.framework}
                                                    </span>
                                                )}
                                                {agent.endpoint && (
                                                    <span className="lc-meta-pill">
                                                        <span className="lc-meta-key">Endpoint</span>
                                                        {agent.endpoint}
                                                    </span>
                                                )}
                                                {agent.port && (
                                                    <span className="lc-meta-pill">
                                                        <span className="lc-meta-key">Port</span>
                                                        {agent.port}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Tag chips */}
                                        {agent.tags && agent.tags.length > 0 && (
                                            <div className="lc-agent-tags">
                                                {agent.tags.map(tag => (
                                                    <span key={tag} className="lc-tag">{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="lc-card-divider" />

                                        {/* Actions */}
                                        <div className="lc-agent-actions">
                                            <button
                                                className="cfg-button lc-btn-stop"
                                                onClick={() => handleAgentAction(agent.name, 'stop')}
                                                disabled={isLoading || status !== 'active'}
                                            >
                                                Stop
                                            </button>
                                            <button
                                                className="cfg-button lc-btn-start"
                                                onClick={() => handleAgentAction(agent.name, 'start')}
                                                disabled={isLoading || status === 'active'}
                                            >
                                                Start
                                            </button>
                                            <button
                                                className="cfg-button cfg-button-secondary"
                                                onClick={() => handleAgentAction(agent.name, 'refresh')}
                                                disabled={isLoading}
                                            >
                                                Redeploy
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination footer */}
                {!isLoading && totalPages > 1 && (
                    <div className="lc-pagination">
                        <button
                            className="lc-page-btn"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            aria-label="Previous page"
                        >
                            ‹
                        </button>

                        {buildPageNumbers().map((item, i) =>
                            item === '…' ? (
                                <span key={`ellipsis-${i}`} className="lc-page-ellipsis">…</span>
                            ) : (
                                <button
                                    key={item}
                                    className={`lc-page-btn ${safePage === item ? 'lc-page-active' : ''}`}
                                    onClick={() => setPage(item)}
                                    aria-label={`Page ${item}`}
                                    aria-current={safePage === item ? 'page' : undefined}
                                >
                                    {item}
                                </button>
                            )
                        )}

                        <button
                            className="lc-page-btn"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            aria-label="Next page"
                        >
                            ›
                        </button>

                        <span className="lc-page-info">
                            {safePage} / {totalPages}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}

/* ── Token Tab ───────────────────────────────────────────────────────────── */
function TokenTab() {
    return (
        <div className="cfg-card">
            <div className="cfg-token-placeholder">
                <div className="cfg-token-icon">◈</div>
                <div className="cfg-token-title">Token Management</div>
                <div className="cfg-token-desc">
                    Issue, rotate, and revoke authentication tokens for the agent registry. Coming soon.
                </div>
                <div className="cfg-token-badge">Coming soon</div>
            </div>
        </div>
    );
}

/* ── Main export ─────────────────────────────────────────────────────────── */
export function SettingsPage({ onBack, agentRegistryUrl, authToken }) {
    const [activeTab, setActiveTab] = useState('register');

    const tabs = [
        { id: 'register',  label: 'Register Agent',   icon: '＋' },
        { id: 'lifecycle', label: 'Agent Lifecycle',   icon: '◎' },
        { id: 'token',     label: 'Tokens',            icon: '◈' },
    ];

    return (
        <div className="cfg-wrap">
            {/* Header */}
            <div className="cfg-header">
                <div className="cfg-header-top">
                    <div>
                        <div className="cfg-breadcrumb">
                            <span>Registry</span>
                            <span className="cfg-breadcrumb-sep">›</span>
                            <span className="cfg-breadcrumb-cur">Settings</span>
                        </div>
                        <div className="cfg-title">Settings</div>
                        <div className="cfg-subtitle">Manage agent registry and authentication tokens</div>
                    </div>
                    <button className="cfg-back-btn" onClick={onBack}>
                        <span className="cfg-back-arrow">←</span>
                        Back to Registry
                    </button>
                </div>

                <div className="cfg-tabs">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={`cfg-tab ${activeTab === t.id ? 'cfg-tab-active' : ''}`}
                            onClick={() => setActiveTab(t.id)}
                        >
                            <span className="cfg-tab-icon">{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="cfg-body">
                {activeTab === 'register' && (
                    <RegisterTab agentRegistryUrl={agentRegistryUrl} authToken={authToken} />
                )}
                {activeTab === 'lifecycle' && ( // Conditional rendering for the new tab
                    <AgentLifeCycleTab agentRegistryUrl={agentRegistryUrl} authToken={authToken} />
                )}
                {activeTab === 'token' && <TokenTab />}
            </div>
        </div>
    );
}