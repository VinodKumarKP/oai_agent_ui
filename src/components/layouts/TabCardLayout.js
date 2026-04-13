/**
 * TabCardLayout — sidebar for browsing + tab bar for open agents.
 *
 * ┌──────────┬──────────────────────────────────────────────────┐
 * │          │  [Tab A] [Tab B ×] [Tab C ×]   [Trace] [Clear]  │
 * │  Browse  ├──────────────────────────────────────────────────┤
 * │  panel   │                                                  │
 * │          │            Active chat window                    │
 * │  (col-   ├──────────────────────────────────────────────────┤
 * │  laps-   │  [ input area ]                                  │
 * │  ible)   │                                                  │
 * └──────────┴──────────────────────────────────────────────────┘
 *
 * When no agent tabs are open, the center shows a card-grid launcher.
 * Receives all props from useAgentCore() via AgentUI.js.
 */
import React, { useState } from 'react';
import {
    StatusDot,
    ChatMessages,
    ChatInput,
    TraceLogSidebar,
} from '../shared/SharedComponents.js';

// ---------------------------------------------------------------------------
// AgentCard — one card in the grid launcher
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// TabBar — horizontal row of open-agent tabs
// ---------------------------------------------------------------------------
function TabBar({ openAgents, selectedAgentId, unreadCounts, onSelect, onClose }) {
    return (
        <div className="tab-bar">
            <div className="tab-list">
                {openAgents.map(agent => {
                    const isActive = agent.id === selectedAgentId;
                    const unread   = unreadCounts?.[agent.id] || 0;
                    return (
                        <button
                            key={agent.id}
                            className={`tab ${isActive ? 'tab-active' : ''}`}
                            onClick={() => onSelect(agent.id)}
                        >
                            <StatusDot status={agent.status} size={7} />
                            <span className="tab-name">{agent.name}</span>
                            {unread > 0 && (
                                <span className="tab-badge">{unread}</span>
                            )}
                            <span
                                className="tab-close"
                                onClick={(e) => onClose(agent.id, e)}
                                title="Close tab"
                            >
                                ×
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// BrowsePanel — collapsible left panel for searching / listing all agents
// ---------------------------------------------------------------------------
function BrowsePanel({
                         filteredAgents, selectedAgentId,
                         searchQuery, setSearchQuery,
                         onOpen, fetchAgents,
                         isCollapsed, onToggle,
                     }) {
    return (
        <div className={`browse-panel ${isCollapsed ? 'browse-panel-collapsed' : ''}`}>
            <div className="browse-panel-header">
                {!isCollapsed && (
                    <span className="browse-panel-title">All Agents</span>
                )}
                <button
                    className="browse-toggle-btn"
                    onClick={onToggle}
                    title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
                >
                    {isCollapsed ? '›' : '‹'}
                </button>
            </div>

            {!isCollapsed && (
                <>
                    <div className="browse-search">
                        <input
                            type="text"
                            placeholder="Search agents…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <ul className="browse-agent-list">
                        {filteredAgents.length === 0 ? (
                            <li className="browse-no-agents">No agents found.</li>
                        ) : (
                            filteredAgents.map(agent => (
                                <li
                                    key={agent.id}
                                    className={`browse-agent-item ${selectedAgentId === agent.id ? 'selected' : ''}`}
                                    onClick={() => onOpen(agent.id)}
                                    title={agent.description}
                                >
                                    <StatusDot status={agent.status} size={8} />
                                    <span className="browse-agent-name">{agent.name}</span>
                                </li>
                            ))
                        )}
                    </ul>

                    <button className="browse-refresh-btn" onClick={fetchAgents}>
                        ↻ Refresh
                    </button>
                </>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// CardGridLauncher — shown in center when no tabs are open
// ---------------------------------------------------------------------------
function CardGridLauncher({ agents, searchQuery, setSearchQuery, onOpen }) {
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

// ---------------------------------------------------------------------------
// TabCardLayout — main export
// ---------------------------------------------------------------------------
export function TabCardLayout(props) {
    const {
        agents, filteredAgents, openAgents,
        selectedAgent, selectedAgentId,
        message, searchQuery, attachedFiles,
        currentMessages, currentTraceLogs,
        showTrace, isLoading, unreadCounts,
        chatEndRef, traceEndRef, textareaRef, fileInputRef,
        fetchAgents,
        handleSelectAgent, handleCloseTab,
        handleClearSession,
        handleMessageChange,
        handleFileSelect, removeAttachment,
        handleStopGeneration, handleSendMessage,
        setSearchQuery, setShowTrace,
    } = props;

    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const hasOpenTabs = openAgents.length > 0;

    return (
        <div className="tcl-container">

            {/* ── Browse Panel (left) ── */}
            <BrowsePanel
                filteredAgents={filteredAgents}
                selectedAgentId={selectedAgentId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpen={handleSelectAgent}
                fetchAgents={fetchAgents}
                isCollapsed={panelCollapsed}
                onToggle={() => setPanelCollapsed(p => !p)}
            />

            {/* ── Main area (center, between browse panel and trace sidebar) ── */}
            <div className="tcl-main">
                {hasOpenTabs ? (
                    <>
                        {/* Tab bar */}
                        <TabBar
                            openAgents={openAgents}
                            selectedAgentId={selectedAgentId}
                            unreadCounts={unreadCounts}
                            onSelect={handleSelectAgent}
                            onClose={handleCloseTab}
                        />

                        {/* Chat area */}
                        <div className="tcl-chat-area">
                            {selectedAgent ? (
                                <>
                                    {/* Richer chat header */}
                                    <div className="tcl-chat-header">
                                        <div className="tcl-chat-header-left">
                                            <div className="tcl-agent-avatar">
                                                {selectedAgent.name
                                                    .split(' ')
                                                    .map(w => w[0])
                                                    .join('')
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="tcl-agent-name">{selectedAgent.name}</div>
                                                {selectedAgent.description && (
                                                    <div className="tcl-agent-desc">{selectedAgent.description}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="header-actions">
                                            <button
                                                className="toggle-trace-btn"
                                                onClick={() => setShowTrace(!showTrace)}
                                            >
                                                {showTrace ? 'Hide Trace' : 'Show Trace'}
                                            </button>
                                            <button className="clear-session-btn" onClick={handleClearSession}>
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
                                <div className="empty-state">
                                    <p>Select a tab above to continue a conversation.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Card grid launcher — shown when no tabs are open */
                    <CardGridLauncher
                        agents={agents}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onOpen={handleSelectAgent}
                    />
                )}
            </div>

            {/* ── Trace Sidebar (right) — sibling of tcl-main so it spans full height ── */}
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