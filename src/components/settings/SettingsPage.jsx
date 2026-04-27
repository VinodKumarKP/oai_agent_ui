import React, { useState } from 'react';

function RegisterTab() {
    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Register New Agent</h3>
            <p>This is a placeholder for the agent registration form.</p>
            {/* Dummy form elements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <input type="text" placeholder="Agent Name" className="sl-search" />
                <textarea placeholder="Description" className="chat-input textarea" style={{ height: '80px' }}></textarea>
                <input type="text" placeholder="Endpoint URL" className="sl-search" />
                <button className="sl-logs-refresh-btn" style={{ alignSelf: 'flex-start' }}>Register Agent</button>
            </div>
        </div>
    );
}

function TokenTab() {
    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Manage Tokens</h3>
            <p>This is a placeholder for the token management interface.</p>
        </div>
    );
}

export function SettingsPage({ onBack }) {
    const [activeTab, setActiveTab] = useState('register');

    return (
        <div className="ccl-registry">
            {/* Header */}
            <div className="ccl-registry-header">
                <div className="ccl-header-top">
                    <div>
                        <div className="ccl-header-title">Settings</div>
                        <div className="ccl-header-sub">Manage agent registry and tokens</div>
                    </div>
                    <button className="ccl-back-btn" onClick={onBack}>
                        ← Back to Registry
                    </button>
                </div>
                <div className="ccl-tabs">
                    <button
                        className={`ccl-tab-btn ${activeTab === 'register' ? 'ccl-tab-active' : ''}`}
                        onClick={() => setActiveTab('register')}
                    >
                        Register
                    </button>
                    <button
                        className={`ccl-tab-btn ${activeTab === 'token' ? 'ccl-tab-active' : ''}`}
                        onClick={() => setActiveTab('token')}
                    >
                        Token
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="ccl-grid-wrap" style={{ background: 'var(--oai-surface)' }}>
                {activeTab === 'register' && <RegisterTab />}
                {activeTab === 'token' && <TokenTab />}
            </div>
        </div>
    );
}