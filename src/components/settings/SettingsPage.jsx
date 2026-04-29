import React, { useState } from 'react';
// Styles for this component live in styles.css (cfg-* classes)

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function parseUrl(raw) {
    try {
        const u = new URL(raw.trim());
        return { scheme: u.protocol + '//', host: u.host, path: u.pathname };
    } catch {
        return null;
    }
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

    const parsedUrl = parseUrl(sourceUrl);

    const handleRegister = async () => {
        if (!name.trim() || !description.trim() || !sourceUrl.trim()) {
            setError('All fields are required.');
            return;
        }
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
                <div className="cfg-field">
                    <div>
                        <div className="cfg-field-label">Name</div>
                        <div className="cfg-field-hint">Unique display name</div>
                    </div>
                    <input
                        type="text"
                        className="cfg-input"
                        placeholder="e.g. Code Reviewer"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                {/* Description */}
                <div className="cfg-field">
                    <div>
                        <div className="cfg-field-label">Description</div>
                        <div className="cfg-field-hint">Brief purpose summary</div>
                    </div>
                    <textarea
                        className="cfg-textarea"
                        placeholder="What does this agent do?"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                {/* Source URL */}
                <div className="cfg-field">
                    <div>
                        <div className="cfg-field-label">Source URL</div>
                        <div className="cfg-field-hint">Endpoint or definition URL</div>
                    </div>
                    <div>
                        <input
                            type="text"
                            className="cfg-input"
                            placeholder="https://example.com/agent"
                            value={sourceUrl}
                            onChange={e => setSourceUrl(e.target.value)}
                        />
                        <div className={`cfg-url-preview ${parsedUrl ? 'visible' : ''}`}>
                            {parsedUrl && (
                                <>
                                    <span className="cfg-url-scheme">{parsedUrl.scheme}</span>
                                    <span className="cfg-url-host">{parsedUrl.host}</span>
                                    <span className="cfg-url-path">{parsedUrl.path}</span>
                                </>
                            )}
                        </div>
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