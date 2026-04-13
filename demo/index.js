import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AgentUI } from '../src';

const agentRegistryUrl = process.env.AGENT_REGISTRY_URL || "http://localhost:8081/info";

const mySingleToken = 'PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIElEPSJfZTVmNTM0M2U4YzczMjUzMTdjMjkyZGQzMTRiNGQ3NWIiIElzc3VlSW5zdGFudD0iMjAyNS0wOC0yMVQwNTozNDowNi44OTJaIiBWZXJzaW9uPSIyLjAiPiA8c2FtbDpJc3N1ZXIgeG1sbnM6c2FtbD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiI+Y2FwZ2VtaW5pLmNvbTwvc2FtbDpJc3N1ZXI+IDxzYW1scDpTdGF0dXM+IDxzYW1scDpTdGF0dXNDb2RlIFZhbHVlPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6c3RhdHVzOlN1Y2Nlc3MiLz4gPC9zYW1scDpTdGF0dXM+IDxzYW1sOkFzc2VydGlvbiB4bWxuczpzYW1sPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIiBJRD0iX2E2MmMxMzY1MTVjOGI2ZDU1OTYwZjdkZDYzM2IwYTM3IiBJc3N1ZUluc3RhbnQ9IjIwMjUtMDgtMjFUMDU6MzQ6MDYuODkyWiIgVmVyc2lvbj0iMi4wIj4gPHNhbWw6SXNzdWVyPmNhcGdlbWluaS5jb208L3NhbWw6SXNzdWVyPiA8c2FtbDpTdWJqZWN0PiA8c2FtbDpOYW1lSUQgRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoxLjE6bmFtZWlkLWZvcm1hdDplbWFpbEFkZHJlc3MiPmpvZWwuY2hyaXN0b3BoZXJAY2FwZ2VtaW5pLmNvbTwvc2FtbDpOYW1lSUQ+IDxzYW1sOlN1YmplY3RDb25maXJtYXRpb24gTWV0aG9kPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6Y206YmVhcmVyIj4gPHNhbWw6U3ViamVjdENvbmZpcm1hdGlvbkRhdGEgTm90T25PckFmdGVyPSIyMDI1LTA4LTIxVDA1OjU0OjA2Ljg5MloiLz4gPC9zYW1sOlN1YmplY3RDb25maXJtYXRpb24+IDwvc2FtbDpTdWJqZWN0PiA8c2FtbDpDb25kaXRpb25zIE5vdEJlZm9yZT0iMjAyNS0wOC0yMVQwNTozNDowNi44OTJaIiBOb3RPbk9yQWZ0ZXI9IjIwMjUtMDgtMjFUMDU6NTQ6MDYuODkyWiIvPiA8c2FtbDpBdHRyaWJ1dGVTdGF0ZW1lbnQ+IDxzYW1sOkF0dHJpYnV0ZSBOYW1lPSJlbWFpbCI+IDxzYW1sOkF0dHJpYnV0ZVZhbHVlPmpvZWwuY2hyaXN0b3BoZXJAY2FwZ2VtaW5pLmNvbTwvc2FtbDpBdHRyaWJ1dGVWYWx1ZT4gPC9zYW1sOkF0dHJpYnV0ZT4gPHNhbWw6QXR0cmlidXRlIE5hbWU9InJvbGUiPiA8c2FtbDpBdHRyaWJ1dGVWYWx1ZT5hZ2VudCBleGVjdXRvcjwvc2FtbDpBdHRyaWJ1dGVWYWx1ZT4gPC9zYW1sOkF0dHJpYnV0ZT4gPC9zYW1sOkF0dHJpYnV0ZVN0YXRlbWVudD4gPC9zYW1sOkFzc2VydGlvbj4gPGRzOlNpZ25hdHVyZSB4bWxuczpkcz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnIyI+IDxkczpTaWduYXR1cmVWYWx1ZT5ISlphUFF3eHdJSitkcmF4RUhNdWlxajJVN1lub1JrZ2FwbXR5ajJNdUdxUGNZMmo0bXJDT2lRcFI5eUMyaFR0UnlFRloydHhYT3ZkOEdkMUQwVFFSMk5tYkUwMWxkWHJVWlJYbzROalo0elUxSFdEY2Jvb1Y4aUJTaU5LaWQreUUxMll0eUUrNEdTdVhVUG5Fc0FSdEFacXhkNjhsOUpvc0E4cWNraUUvbzQ5NnIrekxCL1I2OEZhaWp3aTNzU2xKeFdkdHU2VFF3a0FmK3N2Z1djRGZZQUIxRFQvTGplVTltR2VUUzdZVVpOVUs2VzFMNFRCejhESGh4OUZEb0s2YlloSU4yYkZxSlhnSWFGNlJ3MG9PaXNPWnVMbnFPN1hFaG9kL3h1a21SandvYkQySTk4VnBjOUNFOEdBUUpZdVdQVnBwWmdNQ0d0Wnk3TFF3bmJqVEE9PTwvZHM6U2lnbmF0dXJlVmFsdWU+IDwvZHM6U2lnbmF0dXJlPiA8L3NhbWxwOlJlc3BvbnNlPg==';

const LAYOUTS = [
    {
        id: 'sidebar',
        label: 'Sidebar',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="4" height="14" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="7" y="1" width="8" height="14" rx="1" fill="currentColor" opacity=".35"/>
            </svg>
        ),
    },
    {
        id: 'tabcard',
        label: 'Tabs',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="4" height="14" rx="1" fill="currentColor" opacity=".35"/>
                <rect x="7" y="1" width="3" height="4" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="11" y="1" width="4" height="4" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="7" y="7" width="8" height="8" rx="1" fill="currentColor" opacity=".35"/>
            </svg>
        ),
    },
    {
        id: 'cardchat',
        label: 'Cards',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".35"/>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".35"/>
            </svg>
        ),
    },
];

const switcherStyles = `
.layout-switcher {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    align-items: center;
    background: #0f172a;
    border: 0.5px solid #1e293b;
    border-radius: 12px;
    padding: 4px;
    gap: 2px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}
.layout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 8px;
    border: none;
    background: none;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
}
.layout-btn:hover { color: #94a3b8; background: #1e293b; }
.layout-btn.active { background: #6366f1; color: #fff; }
`;

function LayoutSwitcher({ layout, setLayout }) {
    return (
        <>
            <style>{switcherStyles}</style>
            <div className="layout-switcher" role="toolbar" aria-label="Switch layout">
                {LAYOUTS.map(l => (
                    <button
                        key={l.id}
                        className={`layout-btn ${layout === l.id ? 'active' : ''}`}
                        onClick={() => setLayout(l.id)}
                        title={l.label}
                    >
                        {l.icon}
                        {l.label}
                    </button>
                ))}
            </div>
        </>
    );
}

function App() {
    const [layout, setLayout] = useState('sidebar');

    return (
        <>
            <AgentUI
                agentRegistryUrl={agentRegistryUrl}
                authToken={mySingleToken}
                layout={layout}
            />
            <LayoutSwitcher layout={layout} setLayout={setLayout} />
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);