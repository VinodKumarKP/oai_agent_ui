import React, { useState, useCallback } from 'react';

export function TokenManager({ agentEndpoint, authToken }) {
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ttl, setTtl] = useState(3600);
    const [copiedToken, setCopiedToken] = useState(null);

    const generateToken = useCallback(async () => {
        if (!agentEndpoint) {
            setError("Agent endpoint is not available.");
            return;
        }
        if (tokens.length >= 5) {
            setError("Maximum number of tokens (5) reached.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const baseUrl = agentEndpoint.replace(/\/a2a\/?$/, '');
            let url = `${baseUrl}/token/custom`;
            if (ttl > 0) {
                url += `?ttl_seconds=${ttl}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTokens(prevTokens => [...prevTokens, data]);
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

    return (
        <div className="logs">
            <div className="sl-logs-header">
                <h3 className="sl-logs-title">Token Generation</h3>
                <div className="sl-page-size-wrap">
                    <label htmlFor="ttl" className="sl-page-size-label">Token TTL:</label>
                    <select id="ttl" value={ttl} onChange={(e) => setTtl(e.target.value)} className="sl-page-size-select">
                        <option value={3600}>1 Hour</option>
                        <option value={86400}>1 Day</option>
                        <option value={604800}>7 Days</option>
                        <option value={2592000}>30 Days</option>
                        <option value={-1}>No Expiration</option>
                    </select>
                </div>
                <button onClick={generateToken} className="sl-logs-refresh-btn" disabled={isLoading || tokens.length >= 5}>
                    {isLoading ? 'Generating...' : 'Generate New Token'}
                </button>
            </div>

            {error && <div className="sl-logs-error-state" style={{ justifyContent: 'flex-start' }}>Error: {error}</div>}

            <div className="sl-logs-list">
                {tokens.length === 0 && <div className="sl-logs-empty">No tokens generated yet.</div>}
                {tokens.map((tokenData, index) => (
                    <div key={index} className="sl-log-item">
                        <div className="sl-log-input" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                            <strong>Token:</strong> {tokenData.token}
                            <div style={{ fontSize: '11px', color: 'var(--oai-text-muted)', marginTop: '4px' }}>
                                TTL: {tokenData.ttl_seconds ? `${tokenData.ttl_seconds} seconds` : 'No Expiration'}
                            </div>
                        </div>
                        <button onClick={() => copyToClipboard(tokenData.token, index)} className="sl-page-btn" style={{ marginLeft: 'auto' }}>
                            {copiedToken === index ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}