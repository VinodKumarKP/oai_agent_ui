import React, { useState } from 'react';
import { RegisterTab } from './RegisterTab';
import { AgentLifeCycleTab } from './AgentLifeCycleTab';
import { TokenTab } from './TokenTab';
// Styles for this component live in styles.css (cfg-* classes)


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
                            <button className="cfg-back-btn" onClick={onBack}>
                                <span className="cfg-back-arrow">←</span>
                                Registry
                            </button>
                            <span className="cfg-breadcrumb-sep">›</span>
                            <span className="cfg-breadcrumb-cur">Settings</span>
                        </div>
                        <div className="cfg-title">Settings</div>
                        <div className="cfg-subtitle">Manage agent registry and authentication tokens</div>
                    </div>
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