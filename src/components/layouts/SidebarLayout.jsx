/**
 * SidebarLayout — three-panel layout with a polished dark sidebar.
 *
 * ┌──────────────┬──────────────────────────────┬──────────────┐
 * │  Agent list  │         Chat window          │  Trace log   │
 * │  (sidebar)   │                              │  (optional)  │
 * └──────────────┴──────────────────────────────┴──────────────┘
 *
 * Receives all props from useAgentCore() via AgentUI.js.
 */
import React, { useState } from 'react';
import {
    StatusDot,
    ChatMessages,
    ChatInput,
    TraceLogSidebar,
    EmptyState,
} from '../shared/SharedComponents.jsx';
import { agentInitials, avatarStyle } from '../shared/utils.js';


// ---------------------------------------------------------------------------
// StatusPill — compact badge for the chat header
// ---------------------------------------------------------------------------
function StatusPill({ status }) {
    const map = {
        active:   { label: 'Online',  cls: 'sl-pill-online'  },
        inactive: { label: 'Offline', cls: 'sl-pill-offline' },
        busy:     { label: 'Busy',    cls: 'sl-pill-busy'    },
        unknown:  { label: 'Unknown', cls: 'sl-pill-offline' },
    };
    const { label, cls } = map[status] || map.unknown;
    return (
        <span className={`sl-status-pill ${cls}`}>
            <span className={`sl-dot ${cls}`} />
            {label}
        </span>
    );
}

// ---------------------------------------------------------------------------
// SubTabBar
// ---------------------------------------------------------------------------
function SubTabBar({ currentView, setCurrentView }) {
    return (
        <div className="sl-sub-tab-bar">
            <button
                className={`sl-sub-tab ${currentView === 'chat' ? 'sl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('chat')}
            >
                Chat
            </button>
            <button
                className={`sl-sub-tab ${currentView === 'metrics' ? 'sl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('metrics')}
            >
                Metrics
            </button>
            <button
                className={`sl-sub-tab ${currentView === 'logs' ? 'sl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('logs')}
            >
                Older Logs
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// AgentMetrics — placeholder for agent metrics
// ---------------------------------------------------------------------------
function AgentMetrics({ selectedAgent }) {
    // Placeholder data
    const metrics = {
        totalMessages: 150,
        averageResponseTime: '2.5s',
        uptime: '99.9%',
        lastActive: '2023-10-01 12:00:00',
    };

    return (
        <div className="sl-metrics">
            <h3>Metrics for {selectedAgent.name}</h3>
            <div className="sl-metrics-grid">
                <div className="sl-metric-item">
                    <span className="sl-metric-label">Total Messages:</span>
                    <span className="sl-metric-value">{metrics.totalMessages}</span>
                </div>
                <div className="sl-metric-item">
                    <span className="sl-metric-label">Avg Response Time:</span>
                    <span className="sl-metric-value">{metrics.averageResponseTime}</span>
                </div>
                <div className="sl-metric-item">
                    <span className="sl-metric-label">Uptime:</span>
                    <span className="sl-metric-value">{metrics.uptime}</span>
                </div>
                <div className="sl-metric-item">
                    <span className="sl-metric-label">Last Active:</span>
                    <span className="sl-metric-value">{metrics.lastActive}</span>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// AgentLogs — placeholder for older logs
// ---------------------------------------------------------------------------
function AgentLogs({ selectedAgent }) {
    // Placeholder logs
    const logs = [
        { id: 1, timestamp: '2023-10-01 10:00:00', message: 'Conversation started' },
        { id: 2, timestamp: '2023-10-01 10:05:00', message: 'User asked about weather' },
        { id: 3, timestamp: '2023-10-01 10:10:00', message: 'Agent responded with forecast' },
        // Add more as needed
    ];

    return (
        <div className="sl-logs">
            <h3>Older Logs for {selectedAgent.name}</h3>
            <div className="sl-logs-list">
                {logs.map((log) => (
                    <div key={log.id} className="sl-log-item">
                        <span className="sl-log-timestamp">{log.timestamp}</span>
                        <span className="sl-log-message">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// SidebarLayout — main export
// ---------------------------------------------------------------------------
export function SidebarLayout(props) {
    const {
        agents, filteredAgents,
        selectedAgent, selectedAgentId,
        message, searchQuery, attachedFiles,
        currentMessages, currentTraceLogs,
        showTrace, isLoading,
        chatEndRef, traceEndRef, textareaRef, fileInputRef,
        fetchAgents,
        handleSelectAgent,
        handleClearSession,
        handleMessageChange,
        handleFileSelect, removeAttachment,
        handleStopGeneration, handleSendMessage,
        setSearchQuery, setShowTrace,
        evaluations, expandedEvaluations, toggleEvaluation,
    } = props;

    const [currentView, setCurrentView] = useState('chat');
    const selectedIndex = agents.findIndex(a => a.id === selectedAgentId);
    const { bg, color } = selectedAgent ? avatarStyle(selectedIndex >= 0 ? selectedIndex : 0) : {};
    const initials = selectedAgent ? agentInitials(selectedAgent.name) : '';

    return (
        <div className="sl-container">

            {/* ── Left Sidebar ── */}
            <div className="sl-sidebar">
                <div className="sl-sidebar-top">
                    <div className="sl-sidebar-brand">
                        <span className="sl-brand-name">Agents</span>
                        <button className="sl-refresh-btn" onClick={fetchAgents} title="Refresh agent list">
                            Refresh
                        </button>
                    </div>
                    <div className="sl-search-wrap">
                        <input
                            className="sl-search"
                            type="text"
                            placeholder="Search agents…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ul className="sl-agent-list">
                    {filteredAgents.length === 0 ? (
                        <div className="sl-no-agents">No agents found.</div>
                    ) : (
                        filteredAgents.map((agent) => (
                            <li
                                key={agent.id}
                                className={`sl-agent-item ${selectedAgentId === agent.id ? 'sl-selected' : ''}`}
                                onClick={() => handleSelectAgent(agent.id)}
                                title={agent.description}
                            >
                                <div className="sl-item-row">
                                    <StatusDot status={agent.status} />
                                    <span className="sl-agent-name">{agent.name}</span>
                                </div>
                                {agent.description && (
                                    <span className="sl-agent-desc">{agent.description}</span>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* ── Main Chat Window ── */}
            <div className="sl-chat-container">
                {selectedAgent ? (
                    <>
                        <div className="sl-chat-header">
                            <div className="sl-chat-header-left">
                                <div className="sl-chat-avatar" style={{ background: bg, color }}>
                                    {initials}
                                </div>
                                <div>
                                    <div className="sl-chat-agent-name">{selectedAgent.name}</div>
                                    <div className="sl-chat-agent-meta">
                                        {selectedAgent.description && (
                                            <span className="sl-chat-agent-desc">{selectedAgent.description}</span>
                                        )}
                                        <StatusPill status={selectedAgent.status} />
                                    </div>
                                </div>
                            </div>
                            {currentView === 'chat' && (
                                <div className="sl-header-actions">
                                    <button
                                        className="sl-trace-btn"
                                        onClick={() => setShowTrace(!showTrace)}
                                    >
                                        {showTrace ? 'Hide trace' : 'Show trace'}
                                    </button>
                                    <button className="sl-clear-btn" onClick={handleClearSession}>
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        <SubTabBar currentView={currentView} setCurrentView={setCurrentView} />

                        {currentView === 'chat' && (
                            <>
                                <ChatMessages
                                    messages={currentMessages}
                                    isLoading={isLoading}
                                    agentName={selectedAgent.name}
                                    chatEndRef={chatEndRef}
                                    evaluations={evaluations}
                                    expandedEvaluations={expandedEvaluations}
                                    onToggleEvaluation={toggleEvaluation}
                                />

                                <ChatInput
                                    message={message}
                                    isLoading={isLoading}
                                    attachedFiles={attachedFiles}
                                    textareaRef={textareaRef}
                                    fileInputRef={fileInputRef}
                                    onMessageChange={handleMessageChange}
                                    onSend={handleSendMessage}
                                    onStop={handleStopGeneration}
                                    onFileSelect={handleFileSelect}
                                    onRemoveAttachment={removeAttachment}
                                />
                            </>
                        )}

                        {currentView === 'metrics' && (
                            <AgentMetrics selectedAgent={selectedAgent} />
                        )}

                        {currentView === 'logs' && (
                            <AgentLogs selectedAgent={selectedAgent} />
                        )}
                    </>
                ) : (
                    <EmptyState agents={agents} onSelectAgent={handleSelectAgent} />
                )}
            </div>

            {/* ── Right Trace Sidebar ── */}
            {showTrace && currentView === 'chat' && (
                <TraceLogSidebar
                    logs={currentTraceLogs}
                    selectedAgent={selectedAgent}
                    traceEndRef={traceEndRef}
                    onClose={() => setShowTrace(false)}
                />
            )}
        </div>
    );
}