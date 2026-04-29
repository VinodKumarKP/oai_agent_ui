import React, { useState } from 'react';
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
    const [active, setActive]           = useState(true);
    const [isLoading, setIsLoading]     = useState(false);
    const [error, setError]             = useState('');
    const [success, setSuccess]         = useState('');

    // Derived validation state (shown only when field has been touched)
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
                    source_url: sourceUrl.trim(),
                    active,
                    registered_via: 'dynamic',
                }),
            });

            if (response.ok) {
                setSuccess('Agent registered successfully.');
                setName(''); setDescription(''); setSourceUrl(''); setActive(true);
                setNameTouched(false); setDescTouched(false); setUrlTouched(false);
            } else {
                const err = await response.json().catch(() => ({}));
                setError(err.message || err.detail || `Registration failed (${response.status})`);
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

            <div className="cfg-section-label">Agent details</div>

            <div className="cfg-card">
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
                            <span className="cfg-submit-icon">+</span>
                            Register Agent
                        </>
                    )}
                </button>
            </div>
        </>
    );
}

/* ── Token Tab ───────────────────────────────────────────────────────────── */
function TokenTab() {
    return (
        <div className="cfg-card">
            <div className="cfg-token-placeholder">
                <div className="cfg-token-icon">🔑</div>
                <div className="cfg-token-title">Token Management</div>
                <div className="cfg-token-desc">
                    Issue, rotate, and revoke authentication tokens for the agent registry. Coming soon.
                </div>
            </div>
        </div>
    );
}

/* ── Main export ─────────────────────────────────────────────────────────── */
export function SettingsPage({ onBack, agentRegistryUrl, authToken }) {
    const [activeTab, setActiveTab] = useState('register');

    const tabs = [
        { id: 'register', label: 'Register Agent', icon: '⊕' },
        { id: 'token',    label: 'Tokens',          icon: '🔑' },
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
                {activeTab === 'token' && <TokenTab />}
            </div>
        </div>
    );
}