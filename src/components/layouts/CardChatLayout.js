import React, { useState, useMemo } from 'react';
import { TraceLogSidebar } from '../shared/TraceLogSidebar.js';
import { ChatWindow }      from '../shared/ChatWindow.js';
import { agentInitials, avatarStyle } from '../shared/utils.js';

// ---------------------------------------------------------------------------
// Helpers / Sub-components
// ---------------------------------------------------------------------------
function StatusDot({ status }) {
    let color = '#ccc';
    if (status === 'active')   color = '#4CAF50'; // Green
    if (status === 'inactive') color = '#F44336'; // Red
    return (
        <span
            className="ccl-status-dot"
            style={{ backgroundColor: color }}
            title={`Status: ${status}`}
        />
    );
}

function AgentCard({ agent, index, onOpen, isListView }) {
    const { bg, color } = avatarStyle(index);
    const initials = agentInitials(agent.name);

    if (isListView) {
        return (
            <div className="ccl-agent-list-item" onClick={() => onOpen(agent.id)}>
                <div className="ccl-list-avatar" style={{ backgroundColor: bg, color }}>
                    {initials}
                </div>
                <div className="ccl-list-info">
                    <div className="ccl-list-name">
                        {agent.name} <StatusDot status={agent.status} />
                    </div>
                    <div className="ccl-list-desc">{agent.description || 'No description available.'}</div>
                </div>
                <button className="ccl-open-btn ccl-list-open">Open</button>
            </div>
        );
    }

    return (
        <div className="ccl-agent-card" onClick={() => onOpen(agent.id)}>
            <div className="ccl-card-header">
                <div className="ccl-card-avatar" style={{ backgroundColor: bg, color }}>
                    {initials}
                </div>
                <StatusDot status={agent.status} />
            </div>
            <div className="ccl-card-body">
                <div className="ccl-card-name" title={agent.name}>{agent.name}</div>
                <div className="ccl-card-desc" title={agent.description}>
                    {agent.description || 'No description provided for this agent.'}
                </div>
            </div>
            <div className="ccl-card-footer">
                <button
                    className="ccl-open-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen(agent.id);
                    }}
                >
                    Open ↗
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// AgentRegistry — the main launcher / registry view
// ---------------------------------------------------------------------------
function AgentRegistry({ agents, searchQuery, setSearchQuery, onOpen, registryError }) {
    const [activeTab, setActiveTab] = useState('all');
    const [isListView, setIsListView] = useState(false);

    const filtered = useMemo(() => {
        let list = agents;
        if (activeTab === 'online')  list = list.filter(a => a.status === 'active');
        if (activeTab === 'offline') list = list.filter(a => a.status === 'inactive' || a.status === 'unknown');
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.description?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [agents, activeTab, searchQuery]);

    const tabs = [
        { id: 'all', label: 'All Agents' },
        { id: 'online', label: 'Online' },
        { id: 'offline', label: 'Offline' },
    ];

    return (
        <div className="ccl-registry">
            {/* Header */}
            <div className="ccl-registry-header">
                <div className="ccl-header-top">
                    <div>
                        <div className="ccl-header-title">Agent registry</div>
                        <div className="ccl-header-sub">Browse, search, and launch your agents</div>
                    </div>
                    <span className="ccl-count-badge">
                        {filtered.length} agent{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="ccl-tabs">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={`ccl-tab-btn ${activeTab === t.id ? 'ccl-tab-active' : ''}`}
                            onClick={() => setActiveTab(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Toolbar */}
            <div className="ccl-toolbar">
                <div className="ccl-search-wrap">
                    <span className="ccl-search-icon">⌕</span>
                    <input
                        className="ccl-search-input"
                        placeholder="Search agents…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="ccl-view-toggles">
                    <button
                        className={`ccl-view-btn ${!isListView ? 'ccl-view-active' : ''}`}
                        onClick={() => setIsListView(false)}
                        title="Grid View"
                    >
                        ⊞
                    </button>
                    <button
                        className={`ccl-view-btn ${isListView ? 'ccl-view-active' : ''}`}
                        onClick={() => setIsListView(true)}
                        title="List View"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Grid / List */}
            <div className={`ccl-grid-wrap ${isListView ? 'ccl-list-wrap' : ''}`}>
                {registryError ? (
                    <div className="ccl-error-msg" style={{ padding: '24px', color: '#d32f2f', backgroundColor: '#ffebee', borderRadius: '8px', border: '1px solid #ef9a9a', margin: '16px 0' }}>
                        <strong>Error loading agents:</strong> {registryError}
                    </div>
                ) : (
                    <div className={`ccl-agent-grid ${isListView ? 'ccl-agent-list' : ''}`}>
                        {filtered.length === 0 ? (
                            <div className="ccl-empty-msg">No agents match your search.</div>
                        ) : (
                            filtered.map((agent, i) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    index={i}
                                    onOpen={onOpen}
                                    isListView={isListView}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// CardChatLayout — main export
// ---------------------------------------------------------------------------
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
        registryError,
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

    // If an agent is selected, show the chat view
    if (selectedAgent) {
        const agentIndex = agents.findIndex(a => a.id === selectedAgentId);
        const { bg, color } = avatarStyle(agentIndex >= 0 ? agentIndex : 0);
        const initials = agentInitials(selectedAgent.name);

        return (
            <div className="ccl-chat-layout">
                {/* Embedded Toolbar / Header inside Chat */}
                <div className="ccl-chat-header">
                    <button className="ccl-back-btn" onClick={() => handleSelectAgent(null)}>
                        ← Registry
                    </button>
                    <div className="ccl-chat-agent-info">
                        <div className="ccl-chat-avatar" style={{ backgroundColor: bg, color }}>
                            {initials}
                        </div>
                        <div>
                            <div className="ccl-chat-name">
                                {selectedAgent.name} <StatusDot status={selectedAgent.status} />
                            </div>
                            <div className="ccl-chat-desc" title={selectedAgent.description}>
                                {selectedAgent.endpoint}
                            </div>
                        </div>
                    </div>
                    <div className="ccl-header-actions">
                        <button
                            className="ccl-toggle-trace-btn"
                            onClick={() => setShowTrace(!showTrace)}
                        >
                            {showTrace ? 'Hide trace' : 'Show trace'}
                        </button>
                        <button className="ccl-clear-btn" onClick={handleClearSession}>
                            Clear
                        </button>
                    </div>
                </div>

                <div className="ccl-chat-body">
                    <ChatWindow
                        messages={currentMessages}
                        agentName={selectedAgent.name}
                        agentAvatarBg={bg}
                        agentAvatarColor={color}
                        chatEndRef={chatEndRef}
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
                        onClear={handleClearSession}
                        onShowTrace={setShowTrace}
                        onBack={() => handleSelectAgent(null)}
                    />
                </div>
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

    return (
        <AgentRegistry
            agents={agents}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpen={handleSelectAgent}
            registryError={registryError}
        />
    );
}