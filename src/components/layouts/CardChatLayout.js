/**
 * CardChatLayout — professional agent registry grid that opens a chat window.
 *
 * ┌──────────────────────────────────────────────────┐
 * │  Header: title + agent count badge               │
 * │  Tabs: All | Online | Offline                    │
 * ├──────────────────────────────────────────────────┤
 * │  Toolbar: [Search] [Grid|List toggle]            │
 * ├──────────────────────────────────────────────────┤
 * │  ┌───────────┐   ┌───────────┐   ┌───────────┐   │
 * │  │ Agent A   │   │ Agent B   │   │ Agent C   │   │
 * │  └───────────┘   └───────────┘   └───────────┘   │
 * └──────────────────────────────────────────────────┘
 *
 * Clicking a card transitions to a full-window chat view.
 * Receives all props from useAgentCore() via AgentUI.js.
 */
import React, { useState, useMemo } from 'react';
import {
    StatusDot,
    ChatMessages,
    ChatInput,
    TraceLogSidebar,
} from '../shared/SharedComponents.js';

// ---------------------------------------------------------------------------
// Avatar color palette — cycles through ramps per agent index
// ---------------------------------------------------------------------------
const AVATAR_COLORS = [
    { bg: '#EEEDFE', color: '#3C3489' }, // purple
    { bg: '#E1F5EE', color: '#085041' }, // teal
    { bg: '#E6F1FB', color: '#0C447C' }, // blue
    { bg: '#FAECE7', color: '#993C1D' }, // coral
    { bg: '#FBEAF0', color: '#72243E' }, // pink
    { bg: '#FAEEDA', color: '#633806' }, // amber
];

function avatarStyle(index) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function agentInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// StatusPill — inline Online / Busy / Offline badge
// ---------------------------------------------------------------------------
function StatusPill({ status }) {
    const map = {
        active:   { label: 'Online',  cls: 'ccl-pill-online'  },
        inactive: { label: 'Offline', cls: 'ccl-pill-offline' },
        busy:     { label: 'Busy',    cls: 'ccl-pill-busy'    },
        unknown:  { label: 'Unknown', cls: 'ccl-pill-offline' },
    };
    const { label, cls } = map[status] || map.unknown;
    return (
        <span className={`ccl-status-pill ${cls}`}>
            <span className={`ccl-dot ${cls}`} />
            {label}
        </span>
    );
}

// ---------------------------------------------------------------------------
// AgentCard — one card in the grid or list view
// ---------------------------------------------------------------------------
function AgentCard({ agent, index, onOpen, isListView }) {
    const { bg, color } = avatarStyle(index);
    const initials = agentInitials(agent.name);

    return (
        <div
            className={`ccl-agent-card ${isListView ? 'ccl-list-card' : ''}`}
            onClick={() => onOpen(agent.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(agent.id)}
        >
            <div className="ccl-card-top">
                <div className="ccl-card-avatar" style={{ background: bg, color }}>
                    {initials}
                </div>
                <div className="ccl-card-meta">
                    <div className="ccl-card-name">{agent.name}</div>
                    {agent.description && (
                        <div className="ccl-card-type">{agent.description}</div>
                    )}
                </div>
                <StatusPill status={agent.status} />
            </div>
            {!isListView && agent.description && (
                <div className="ccl-card-desc">{agent.description}</div>
            )}
            <div className="ccl-card-footer">
                <button
                    className="ccl-open-btn"
                    onClick={(e) => { e.stopPropagation(); onOpen(agent.id); }}
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
function AgentRegistry({ agents, searchQuery, setSearchQuery, onOpen }) {
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
        { id: 'all',     label: 'All' },
        { id: 'online',  label: 'Online' },
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
                <div className="ccl-view-toggle">
                    <button
                        className={`ccl-vt-btn ${!isListView ? 'ccl-vt-active' : ''}`}
                        title="Grid view"
                        onClick={() => setIsListView(false)}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="0" y="0" width="6" height="6" rx="1" fill="currentColor"/>
                            <rect x="8" y="0" width="6" height="6" rx="1" fill="currentColor"/>
                            <rect x="0" y="8" width="6" height="6" rx="1" fill="currentColor"/>
                            <rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor"/>
                        </svg>
                    </button>
                    <button
                        className={`ccl-vt-btn ${isListView ? 'ccl-vt-active' : ''}`}
                        title="List view"
                        onClick={() => setIsListView(true)}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/>
                            <rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor"/>
                            <rect x="0" y="11" width="14" height="2" rx="1" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Grid / List */}
            <div className={`ccl-grid-wrap ${isListView ? 'ccl-list-wrap' : ''}`}>
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
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// ChatView — full-window chat for a selected agent
// ---------------------------------------------------------------------------
function ChatView({
                      agent,
                      agentIndex,
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
    const { bg, color } = avatarStyle(agentIndex);
    const initials = agentInitials(agent.name);

    return (
        <div className="ccl-chat-view">
            <div className="ccl-chat-header">
                <div className="ccl-chat-header-left">
                    <button className="ccl-back-btn" onClick={onBack} title="Back to registry">
                        ‹
                    </button>
                    <div className="ccl-chat-avatar" style={{ background: bg, color }}>
                        {initials}
                    </div>
                    <div>
                        <div className="ccl-chat-agent-name">{agent.name}</div>
                        {agent.description && (
                            <div className="ccl-chat-agent-desc">{agent.description}</div>
                        )}
                    </div>
                </div>
                <div className="ccl-header-actions">
                    <button
                        className="ccl-toggle-trace-btn"
                        onClick={() => onShowTrace(!showTrace)}
                    >
                        {showTrace ? 'Hide trace' : 'Show trace'}
                    </button>
                    <button className="ccl-clear-btn" onClick={onClear}>
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

    const agentIndex = agents.findIndex(a => a.id === selectedAgentId);

    if (selectedAgentId && selectedAgent) {
        return (
            <ChatView
                agent={selectedAgent}
                agentIndex={agentIndex >= 0 ? agentIndex : 0}
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
                onBack={() => handleSelectAgent(null)}
            />
        );
    }

    return (
        <AgentRegistry
            agents={agents}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpen={handleSelectAgent}
        />
    );
}