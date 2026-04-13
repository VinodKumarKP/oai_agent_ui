/**
 * CardChatLayout — grid of agent cards that open a chat window.
 *
 * ┌──────────────────────────────────────────────────┐
 * │  [Search Bar]                                    │
 * ├──────────────────────────────────────────────────┤
 * │  ┌───────────┐   ┌───────────┐   ┌───────────┐   │
 * │  │ Agent A   │   │ Agent B   │   │ Agent C   │   │
 * │  └───────────┘   └───────────┘   └───────────┘   │
 * │  ┌───────────┐   ┌───────────┐                   │
 * │  │ Agent D   │   │ Agent E   │                   │
 * │  └───────────┘   └───────────┘                   │
 * │                                                  │
 * └──────────────────────────────────────────────────┘
 *
 * Clicking a card transitions to a full-window chat view.
 * Receives all props from useAgentCore() via AgentUI.js.
 */
import React from 'react';
import {
    StatusDot,
    ChatMessages,
    ChatInput,
    TraceLogSidebar,
} from '../shared/SharedComponents.js';

// Re-using AgentCard from TabCardLayout for consistency
function AgentCard({ agent, onOpen }) {
    const statusLabel = { active: 'Online', inactive: 'Offline', unknown: 'Unknown' };
    return (
        <button className="agent-card" onClick={() => onOpen(agent.id)}>
            <div className="agent-card-avatar">
                {agent.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="agent-card-info">
                <div className="agent-card-name">{agent.name}</div>
                {agent.description && (
                    <div className="agent-card-description">{agent.description}</div>
                )}
                <div className={`agent-card-status status-${agent.status || 'unknown'}`}>
                    <StatusDot status={agent.status} size={7} />
                    {statusLabel[agent.status] || 'Unknown'}
                </div>
            </div>
            <div className="agent-card-arrow">→</div>
        </button>
    );
}

// Grid of agent cards
function AgentGrid({ agents, searchQuery, setSearchQuery, onOpen }) {
    const filtered = searchQuery.trim()
        ? agents.filter(a =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : agents;

    return (
        <div className="card-grid-launcher">
            <div className="card-grid-header">
                <h2 className="card-grid-title">Choose an Agent</h2>
                <p className="card-grid-subtitle">
                    Select an agent below to start a conversation.
                </p>
                <div className="card-grid-search">
                    <input
                        type="text"
                        placeholder="Search agents…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="agent-card-grid">
                {filtered.length === 0 ? (
                    <p className="card-grid-empty">No agents match your search.</p>
                ) : (
                    filtered.map(agent => (
                        <AgentCard key={agent.id} agent={agent} onOpen={onOpen} />
                    ))
                )}
            </div>
        </div>
    );
}

// The main chat view for a single agent
function ChatView({
    agent,
    messages,
    isLoading,
    message,
    attachedFiles,
    showTrace,
    currentTraceLogs,
    chatEndRef,
    traceEndRef,
    textareaRef,
    fileInputRef,
    onMessageChange,
    onSend,
    onStop,
    onFileSelect,
    onRemoveAttachment,
    onClear,
    onShowTrace,
    onBack,
}) {
    return (
        <div className="ccl-chat-view">
            <div className="tcl-chat-header">
                <div className="tcl-chat-header-left">
                    <button className="ccl-back-btn" onClick={onBack} title="Back to agent list">
                        ‹
                    </button>
                    <div className="tcl-agent-avatar">
                        {agent.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="tcl-agent-name">{agent.name}</div>
                        {agent.description && (
                            <div className="tcl-agent-desc">{agent.description}</div>
                        )}
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="toggle-trace-btn"
                        onClick={() => onShowTrace(!showTrace)}
                    >
                        {showTrace ? 'Hide Trace' : 'Show Trace'}
                    </button>
                    <button className="clear-session-btn" onClick={onClear}>
                        Clear
                    </button>
                </div>
            </div>

            <div className="ccl-main-content">
                <div className="ccl-chat-area">
                    <ChatMessages
                        messages={messages}
                        isLoading={isLoading}
                        agentName={agent.name}
                        chatEndRef={chatEndRef}
                    />

                    <ChatInput
                        message={message}
                        isLoading={isLoading}
                        attachedFiles={attachedFiles}
                        textareaRef={textareaRef}
                        fileInputRef={fileInputRef}
                        onMessageChange={onMessageChange}
                        onSend={onSend}
                        onStop={onStop}
                        onFileSelect={onFileSelect}
                        onRemoveAttachment={onRemoveAttachment}
                    />
                </div>
                
                {showTrace && (
                    <TraceLogSidebar
                        logs={currentTraceLogs}
                        selectedAgent={agent}
                        traceEndRef={traceEndRef}
                        onClose={() => onShowTrace(false)}
                    />
                )}
            </div>
        </div>
    );
}


export function CardChatLayout(props) {
    const {
        agents,
        selectedAgent,
        selectedAgentId,
        message,
        searchQuery,
        attachedFiles,
        currentMessages,
        currentTraceLogs,
        showTrace,
        isLoading,
        chatEndRef,
        traceEndRef,
        textareaRef,
        fileInputRef,
        handleSelectAgent,
        handleClearSession,
        handleMessageChange,
        handleFileSelect,
        removeAttachment,
        handleStopGeneration,
        handleSendMessage,
        setSearchQuery,
        setShowTrace,
    } = props;

    // If an agent is selected, show the chat view. Otherwise, show the grid.
    if (selectedAgentId && selectedAgent) {
        return (
            <ChatView
                agent={selectedAgent}
                messages={currentMessages}
                isLoading={isLoading}
                message={message}
                attachedFiles={attachedFiles}
                showTrace={showTrace}
                currentTraceLogs={currentTraceLogs}
                chatEndRef={chatEndRef}
                traceEndRef={traceEndRef}
                textareaRef={textareaRef}
                fileInputRef={fileInputRef}
                onMessageChange={handleMessageChange}
                onSend={handleSendMessage}
                onStop={handleStopGeneration}
                onFileSelect={handleFileSelect}
                onRemoveAttachment={removeAttachment}
                onClear={handleClearSession}
                onShowTrace={setShowTrace}
                onBack={() => handleSelectAgent(null)} // Go back by deselecting
            />
        );
    }

    return (
        <AgentGrid
            agents={agents}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpen={handleSelectAgent}
        />
    );
}
