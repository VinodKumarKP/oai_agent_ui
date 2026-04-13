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
import React from 'react';
import {
    StatusDot,
    ChatMessages,
    ChatInput,
    TraceLogSidebar,
    EmptyState,
} from '../shared/SharedComponents.js';

// ---------------------------------------------------------------------------
// Avatar color palette — cycles per agent index
// ---------------------------------------------------------------------------
const AVATAR_COLORS = [
    { bg: '#EEEDFE', color: '#3C3489' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#FAECE7', color: '#993C1D' },
    { bg: '#FBEAF0', color: '#72243E' },
    { bg: '#FAEEDA', color: '#633806' },
];

function avatarStyle(index) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function agentInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

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
    } = props;

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
                        filteredAgents.map((agent, i) => (
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
                        </div>

                        <ChatMessages
                            messages={currentMessages}
                            isLoading={isLoading}
                            agentName={selectedAgent.name}
                            chatEndRef={chatEndRef}
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
                ) : (
                    <EmptyState agents={agents} onSelectAgent={handleSelectAgent} />
                )}
            </div>

            {/* ── Right Trace Sidebar ── */}
            {showTrace && (
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