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
import React, { useState, useMemo } from 'react';
import {
    StatusDot,
    ChatMessages,
    ChatInput,
    TraceLogSidebar,
    EmptyState,
} from '../shared/SharedComponents.jsx';
import { AgentEvaluationMetrics } from '../shared/AgentEvaluationMetrics.jsx';
import { AgentLogs } from '../shared/AgentLogs.jsx';
import { TokenManager } from '../shared/TokenManager.jsx';
import { SettingsPage } from '../settings/SettingsPage.jsx';
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
                Logs
            </button>
            <button
                className={`sl-sub-tab ${currentView === 'tokens' ? 'sl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('tokens')}
            >
                Tokens
            </button>
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
        agentEvals,
        authToken
    } = props;

    const [currentView, setCurrentView] = useState('chat');
    const [showSettings, setShowSettings] = useState(false);
    const [agentPage, setAgentPage] = useState(1);
    const agentsPerPage = 15;

    const selectedIndex = agents.findIndex(a => a.id === selectedAgentId);
    const { bg, color } = selectedAgent ? avatarStyle(selectedIndex >= 0 ? selectedIndex : 0) : {};
    const initials = selectedAgent ? agentInitials(selectedAgent.name) : '';

    // Paginate the filtered agents
    const totalAgentPages = Math.ceil(filteredAgents.length / agentsPerPage);
    const paginatedAgents = useMemo(() => {
        const start = (agentPage - 1) * agentsPerPage;
        return filteredAgents.slice(start, start + agentsPerPage);
    }, [filteredAgents, agentPage, agentsPerPage]);

    // Reset to page 1 when search changes
    const prevFilterLen = React.useRef(filteredAgents.length);
    if (filteredAgents.length !== prevFilterLen.current) {
        prevFilterLen.current = filteredAgents.length;
        if (agentPage !== 1) setAgentPage(1);
    }

    if (showSettings) {
        return <SettingsPage onBack={() => setShowSettings(false)} />;
    }

    return (
        <div className="sl-container">

            {/* ── Left Sidebar ── */}
            <div className="sl-sidebar">
                <div className="sl-sidebar-top">
                    <div className="sl-sidebar-brand">
                        <span className="sl-brand-name">Agents</span>
                        <button className="sl-refresh-btn" onClick={() => setShowSettings(true)} title="Settings">
                            Settings
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
                    {paginatedAgents.length === 0 ? (
                        <div className="sl-no-agents">No agents found.</div>
                    ) : (
                        paginatedAgents.map((agent) => (
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

                {/* Pagination */}
                {totalAgentPages > 1 && (
                    <div className="sl-pagination">
                        <button
                            className="sl-pagination-btn"
                            onClick={() => setAgentPage(p => Math.max(1, p - 1))}
                            disabled={agentPage === 1}
                            title="Previous page"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalAgentPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`sl-pagination-btn ${agentPage === page ? 'sl-pagination-active' : ''}`}
                                onClick={() => setAgentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="sl-pagination-btn"
                            onClick={() => setAgentPage(p => Math.min(totalAgentPages, p + 1))}
                            disabled={agentPage === totalAgentPages}
                            title="Next page"
                        >
                            ›
                        </button>
                    </div>
                )}
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
                            <div className="sl-metrics">
                                <AgentEvaluationMetrics
                                    agentEndpoint={selectedAgent.endpoint}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {currentView === 'logs' && (
                            <div className="logs">
                                <AgentLogs selectedAgent={selectedAgent} authToken={authToken} />
                            </div>
                        )}

                        {currentView === 'tokens' && (
                            <TokenManager
                                agentEndpoint={selectedAgent.endpoint}
                                authToken={authToken}
                            />
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