/**
 * SidebarLayout — the original three-panel layout.
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

    return (
        <div className="app-container">

            {/* ── Left Sidebar: Agent List ── */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-header-top">
                        <h2>Agents</h2>
                        <button className="refresh-btn" onClick={fetchAgents} title="Refresh agent list">
                            Refresh
                        </button>
                    </div>
                    <div className="sidebar-search">
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ul className="agent-list">
                    {filteredAgents.length === 0 ? (
                        <div className="no-agents-found">No agents found.</div>
                    ) : (
                        filteredAgents.map(agent => (
                            <li
                                key={agent.id}
                                className={`agent-list-item ${selectedAgentId === agent.id ? 'selected' : ''}`}
                                onClick={() => handleSelectAgent(agent.id)}
                                title={agent.description}
                            >
                                <div className="agent-item-header">
                                    <StatusDot status={agent.status} />
                                    <span className="agent-name">{agent.name}</span>
                                </div>
                                {agent.description && (
                                    <span className="agent-description">{agent.description}</span>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* ── Main Chat Window ── */}
            <div className="chat-container">
                {selectedAgent ? (
                    <>
                        <div className="chat-header">
                            <span>{selectedAgent.name} Chat</span>
                            <div className="header-actions">
                                <button
                                    className="toggle-trace-btn"
                                    onClick={() => setShowTrace(!showTrace)}
                                >
                                    {showTrace ? 'Hide Trace Log' : 'Show Trace Log'}
                                </button>
                                <button className="clear-session-btn" onClick={handleClearSession}>
                                    Clear Session
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

            {/* ── Right Sidebar: Trace Logs (collapsible) ── */}
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
