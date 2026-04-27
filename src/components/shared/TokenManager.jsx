import React, { useState, useCallback } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  .tm-root {
    --bg: #0d0f14;
    --bg-card: #13161d;
    --bg-elevated: #1a1e28;
    --bg-hover: #1f2430;
    --border: #252a38;
    --border-active: #3a4155;
    --accent: #4f8ef7;
    --accent-dim: rgba(79, 142, 247, 0.12);
    --accent-glow: rgba(79, 142, 247, 0.25);
    --success: #3ecf8e;
    --success-dim: rgba(62, 207, 142, 0.12);
    --danger: #f76f6f;
    --danger-dim: rgba(247, 111, 111, 0.1);
    --text-primary: #e8eaf0;
    --text-secondary: #8892a4;
    --text-muted: #4f5668;
    --font-sans: 'IBM Plex Sans', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    --radius: 8px;
    --radius-sm: 5px;
    --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);

    font-family: var(--font-sans);
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 48px 24px;
    box-sizing: border-box;
  }

  .tm-panel {
    width: 100%;
    max-width: 720px;
  }

  /* Header */
  .tm-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .tm-title-block {}
  .tm-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 6px;
  }
  .tm-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.01em;
  }
  .tm-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 4px 0 0;
    font-weight: 400;
  }

  .tm-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 100px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    white-space: nowrap;
  }
  .tm-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
  }
  .tm-badge-dot.active {
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
  }

  /* Controls bar */
  .tm-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 16px;
  }

  .tm-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .tm-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
  }
  .tm-select {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    padding: 7px 28px 7px 10px;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238892a4' d='M6 8L1.5 3.5h9z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color var(--transition);
  }
  .tm-select:focus {
    border-color: var(--accent);
  }

  .tm-divider {
    width: 1px;
    height: 32px;
    background: var(--border);
    margin: 0 4px;
  }

  .tm-quota {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .tm-quota-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
  }
  .tm-quota-track {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tm-quota-pips {
    display: flex;
    gap: 4px;
  }
  .tm-pip {
    width: 16px;
    height: 4px;
    border-radius: 2px;
    background: var(--bg-hover);
    transition: background var(--transition);
  }
  .tm-pip.filled {
    background: var(--accent);
  }
  .tm-quota-text {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
  }

  .tm-generate-btn {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity var(--transition), transform var(--transition), box-shadow var(--transition);
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 0 var(--accent-glow);
  }
  .tm-generate-btn:hover:not(:disabled) {
    opacity: 0.9;
    box-shadow: 0 2px 12px var(--accent-glow);
    transform: translateY(-1px);
  }
  .tm-generate-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .tm-generate-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .tm-generate-btn .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Error */
  .tm-error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: var(--danger-dim);
    border: 1px solid rgba(247, 111, 111, 0.2);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--danger);
    margin-bottom: 16px;
    animation: fadeIn 0.2s ease;
  }
  .tm-error-icon {
    font-size: 14px;
    flex-shrink: 0;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

  /* Token list */
  .tm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 56px 24px;
    background: var(--bg-card);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    text-align: center;
  }
  .tm-empty-icon {
    width: 40px;
    height: 40px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 18px;
  }
  .tm-empty-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 4px;
  }
  .tm-empty-sub {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }

  .tm-token-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: border-color var(--transition), background var(--transition);
    animation: slideIn 0.2s ease;
  }
  @keyframes slideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .tm-token-card:hover {
    border-color: var(--border-active);
    background: var(--bg-elevated);
  }

  .tm-token-index {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--accent-dim);
    border: 1px solid rgba(79,142,247,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--accent);
    flex-shrink: 0;
  }

  .tm-token-body {
    flex: 1;
    min-width: 0;
  }
  .tm-token-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .tm-token-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .tm-token-value {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-primary);
    word-break: break-all;
    line-height: 1.5;
  }
  .tm-token-meta {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .tm-meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }
  .tm-meta-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--success);
  }
  .tm-meta-dot.expired {
    background: var(--danger);
  }

  .tm-copy-btn {
    flex-shrink: 0;
    padding: 7px 14px;
    border-radius: var(--radius-sm);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
    white-space: nowrap;
  }
  .tm-copy-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
  }
  .tm-copy-btn.copied {
    border-color: var(--success);
    color: var(--success);
    background: var(--success-dim);
  }
`;

export function TokenManager({ agentEndpoint, authToken }) {
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ttl, setTtl] = useState(3600);
    const [copiedToken, setCopiedToken] = useState(null);

    const generateToken = useCallback(async () => {
        if (!agentEndpoint) {
            setError("Agent endpoint is not configured.");
            return;
        }
        if (tokens.length >= 5) {
            setError("Maximum of 5 tokens reached. Remove an existing token to generate a new one.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const baseUrl = agentEndpoint.replace(/\/a2a\/?$/, '');
            let url = `${baseUrl}/token/custom`;
            if (ttl > 0) url += `?ttl_seconds=${ttl}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            const data = await response.json();
            setTokens(prev => [...prev, data]);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [agentEndpoint, authToken, tokens, ttl]);

    const copyToClipboard = (token, index) => {
        navigator.clipboard.writeText(token);
        setCopiedToken(index);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const ttlLabel = (seconds) => {
        if (seconds === -1 || !seconds) return 'No Expiration';
        if (seconds < 3600) return `${seconds / 60}m`;
        if (seconds < 86400) return `${seconds / 3600}h`;
        return `${seconds / 86400}d`;
    };

    return (
        <>
            <style>{styles}</style>
            <div className="tm-root">
                <div className="tm-panel">

                    {/* Header */}
                    <div className="tm-header">
                        <div className="tm-title-block">
                            <p className="tm-eyebrow">API Access</p>
                            <h2 className="tm-title">Token Manager</h2>
                            <p className="tm-subtitle">Generate and manage scoped authentication tokens</p>
                        </div>
                        <div className="tm-badge">
                            <span className={`tm-badge-dot ${agentEndpoint ? 'active' : ''}`} />
                            {agentEndpoint ? 'Endpoint connected' : 'No endpoint'}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="tm-controls">
                        <div className="tm-field">
                            <span className="tm-label">Expiry</span>
                            <select
                                id="ttl"
                                value={ttl}
                                onChange={(e) => setTtl(Number(e.target.value))}
                                className="tm-select"
                            >
                                <option value={3600}>1 Hour</option>
                                <option value={86400}>1 Day</option>
                                <option value={604800}>7 Days</option>
                                <option value={2592000}>30 Days</option>
                                <option value={-1}>No Expiration</option>
                            </select>
                        </div>

                        <div className="tm-divider" />

                        <div className="tm-quota">
                            <span className="tm-quota-label">Quota</span>
                            <div className="tm-quota-track">
                                <div className="tm-quota-pips">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className={`tm-pip ${i < tokens.length ? 'filled' : ''}`} />
                                    ))}
                                </div>
                                <span className="tm-quota-text">{tokens.length}/5</span>
                            </div>
                        </div>

                        <button
                            onClick={generateToken}
                            className="tm-generate-btn"
                            disabled={isLoading || tokens.length >= 5}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner" />
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                    </svg>
                                    Generate Token
                                </>
                            )}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="tm-error">
                            <span className="tm-error-icon">⚠</span>
                            {error}
                        </div>
                    )}

                    {/* Token List */}
                    <div className="tm-list">
                        {tokens.length === 0 ? (
                            <div className="tm-empty">
                                <div className="tm-empty-icon">🔑</div>
                                <p className="tm-empty-title">No tokens yet</p>
                                <p className="tm-empty-sub">Generate a token above to get started</p>
                            </div>
                        ) : (
                            tokens.map((tokenData, index) => (
                                <div key={index} className="tm-token-card">
                                    <div className="tm-token-index">{String(index + 1).padStart(2, '0')}</div>

                                    <div className="tm-token-body">
                                        <div className="tm-token-row">
                                            <span className="tm-token-label">Token</span>
                                        </div>
                                        <div className="tm-token-value">{tokenData.token}</div>
                                        <div className="tm-token-meta" style={{ marginTop: 10 }}>
                                            <span className="tm-meta-chip">
                                                <span className={`tm-meta-dot ${tokenData.ttl_seconds === -1 ? 'expired' : ''}`} />
                                                {ttlLabel(tokenData.ttl_seconds)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => copyToClipboard(tokenData.token, index)}
                                        className={`tm-copy-btn ${copiedToken === index ? 'copied' : ''}`}
                                    >
                                        {copiedToken === index ? '✓ Copied' : 'Copy'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}