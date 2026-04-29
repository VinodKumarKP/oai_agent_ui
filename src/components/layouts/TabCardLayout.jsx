/**
 * TabCardLayout — collapsible browse panel + tab bar + card-grid launcher.
 *
 * ┌──────────┬─────────────────────────────────────────────────────┐
 * │          │  [Tab A] [Tab B ×] [Tab C ×]   [Trace] [Clear]     │
 * │  Browse  ├─────────────────────────────────────────────────────┤
 * │  panel   │                                                     │
 * │          │            Active chat window                       │
 * │  (col-   ├─────────────────────────────────────────────────────┤
 * │  laps-   │  [ input area ]                                     │
 * │  ible)   │                                                     │
 * └──────────┴─────────────────────────────────────────────────────┘
 *
 * When no agent tabs are open, the center shows the card-grid launcher.
 * Receives all props from useAgentCore() via AgentUI.js.
 */
import React, { useState, useMemo } from 'react';
import {
    ChatMessages,
    ChatInput,
    TraceLogSidebar,
} from '../shared/SharedComponents.jsx';
import { AgentEvaluationMetrics } from '../shared/AgentEvaluationMetrics.jsx';
import { AgentLogs } from '../shared/AgentLogs.jsx';
import { TokenManager } from '../shared/TokenManager.jsx';
import { SettingsPage } from '../settings/SettingsPage.jsx';
import { agentInitials, avatarStyle } from '../shared/utils.js';

// ---------------------------------------------------------------------------
// StatusPill
// ---------------------------------------------------------------------------
function StatusPill({ status }) {
    const map = {
        active:   { label: 'Online',  cls: 'tcl-pill-online'  },
        inactive: { label: 'Offline', cls: 'tcl-pill-offline' },
        busy:     { label: 'Busy',    cls: 'tcl-pill-busy'    },
        unknown:  { label: 'Unknown', cls: 'tcl-pill-offline' },
    };
    const { label, cls } = map[status] || map.unknown;
    return (
        <span className={`tcl-status-pill ${cls}`}>
            <span className={`tcl-dot ${cls}`} />
            {label}
        </span>
    );
}

// ---------------------------------------------------------------------------
// AgentCard — used in the card-grid launcher
// ---------------------------------------------------------------------------
function AgentCard({ agent, index, onOpen }) {
    const { bg, color } = avatarStyle(index);
    const initials = agentInitials(agent.name);
    return (
        <div
            className="tcl-agent-card"
            onClick={() => onOpen(agent.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(agent.id)}
        >
            <div className="tcl-card-top">
                <div className="tcl-card-avatar" style={{ background: bg, color }}>
                    {initials}
                </div>
                <div className="tcl-card-meta">
                    <div className="tcl-card-name">{agent.name}</div>
                    {agent.description && (
                        <div className="tcl-card-type">{agent.description}</div>
                    )}
                </div>
                <StatusPill status={agent.status} />
            </div>
            {agent.description && (
                <div className="tcl-card-desc">{agent.description}</div>
            )}
            <div className="tcl-card-footer">
                <button
                    className="tcl-open-btn"
                    onClick={(e) => { e.stopPropagation(); onOpen(agent.id); }}
                >
                    Open ↗
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// TabBar
// ---------------------------------------------------------------------------
function TabBar({ openAgents, selectedAgentId, allAgents, unreadCounts, onSelect, onClose }) {
    return (
        <div className="tcl-tab-bar">
            {openAgents.map((agent) => {
                const isActive = agent.id === selectedAgentId;
                const unread   = unreadCounts?.[agent.id] || 0;
                const agentIdx = allAgents.findIndex(a => a.id === agent.id);
                const { bg, color } = avatarStyle(agentIdx >= 0 ? agentIdx : 0);
                return (
                    <button
                        key={agent.id}
                        className={`tcl-tab ${isActive ? 'tcl-tab-active' : ''}`}
                        onClick={() => onSelect(agent.id)}
                    >
                        <div className="tcl-tab-avatar" style={{ background: bg, color }}>
                            {agentInitials(agent.name)}
                        </div>
                        <span className="tcl-tab-name">{agent.name}</span>
                        {unread > 0 && (
                            <span className="tcl-tab-badge">{unread}</span>
                        )}
                        <span
                            className="tcl-tab-close"
                            onClick={(e) => onClose(agent.id, e)}
                            title="Close tab"
                        >
                            ×
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// SubTabBar
// ---------------------------------------------------------------------------
function SubTabBar({ currentView, setCurrentView }) {
    return (
        <div className="tcl-sub-tab-bar">
            <button
                className={`tcl-sub-tab ${currentView === 'chat' ? 'tcl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('chat')}
            >
                Chat
            </button>
            <button
                className={`tcl-sub-tab ${currentView === 'metrics' ? 'tcl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('metrics')}
            >
                Metrics
            </button>
            <button
                className={`tcl-sub-tab ${currentView === 'logs' ? 'tcl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('logs')}
            >
                Logs
            </button>
            <button
                className={`tcl-sub-tab ${currentView === 'tokens' ? 'tcl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('tokens')}
            >
                Tokens
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// BrowsePanel
// ---------------------------------------------------------------------------
function BrowsePanel({
                         filteredAgents, selectedAgentId, allAgents,
                         searchQuery, setSearchQuery,
                         onOpen, fetchAgents,
                         isCollapsed, onToggle, onShowSettings,
                     }) {
    const [page, setPage] = useState(1);
    const itemsPerPage = 15;

    // Reset to page 1 when the filtered list length changes (search changed)
    const prevLen = React.useRef(filteredAgents.length);
    if (filteredAgents.length !== prevLen.current) {
        prevLen.current = filteredAgents.length;
        if (page !== 1) setPage(1);
    }

    const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);

    const paged = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredAgents.slice(start, start + itemsPerPage);
    }, [filteredAgents, page, itemsPerPage]);

    return (
        <div className={`tcl-browse ${isCollapsed ? 'tcl-browse-collapsed' : ''}`}>
            <div className="tcl-browse-hdr">
                {!isCollapsed && (
                    <span className="tcl-browse-title">All agents</span>
                )}
                <button
                    className="tcl-browse-toggle"
                    onClick={onToggle}
                    title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
                >
                    {isCollapsed ? '›' : '‹'}
                </button>
            </div>

            {!isCollapsed && (
                <>
                    <div className="tcl-browse-search-wrap">
                        <input
                            className="tcl-browse-search"
                            type="text"
                            placeholder="Search agents…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <ul className="tcl-browse-list">
                        {paged.length === 0 ? (
                            <li className="tcl-browse-empty">No agents found.</li>
                        ) : (
                            paged.map((agent) => {
                                const idx = allAgents.findIndex(a => a.id === agent.id);
                                const { bg, color } = avatarStyle(idx >= 0 ? idx : 0);
                                return (
                                    <li
                                        key={agent.id}
                                        className={`tcl-browse-item ${selectedAgentId === agent.id ? 'tcl-browse-selected' : ''}`}
                                        onClick={() => onOpen(agent.id)}
                                        title={agent.description}
                                    >
                                        <div className="tcl-browse-avatar" style={{ background: bg, color }}>
                                            {agentInitials(agent.name)}
                                        </div>
                                        <span className="tcl-browse-name">{agent.name}</span>
                                    </li>
                                );
                            })
                        )}
                    </ul>

                    {totalPages > 1 && (
                        <div className="tcl-browse-pagination">
                            <button
                                className="tcl-browse-page-btn"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                title="Previous"
                            >‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    className={`tcl-browse-page-btn ${page === p ? 'tcl-browse-page-active' : ''}`}
                                    onClick={() => setPage(p)}
                                >{p}</button>
                            ))}
                            <button
                                className="tcl-browse-page-btn"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                title="Next"
                            >›</button>
                        </div>
                    )}

                    <button className="tcl-browse-refresh" onClick={fetchAgents}>
                        ↻ Refresh
                    </button>
                    <button className="tcl-browse-refresh" onClick={onShowSettings}>
                        Settings
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
    const [page, setPage] = useState(1);
    const cardsPerPage = 12;

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return q
            ? agents.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.description?.toLowerCase().includes(q)
            )
            : agents;
    }, [agents, searchQuery]);

    // Reset to page 1 when search changes
    const prevLen = React.useRef(filtered.length);
    if (filtered.length !== prevLen.current) {
        prevLen.current = filtered.length;
        if (page !== 1) setPage(1);
    }

    const totalPages = Math.ceil(filtered.length / cardsPerPage);

    const paged = useMemo(() => {
        const start = (page - 1) * cardsPerPage;
        return filtered.slice(start, start + cardsPerPage);
    }, [filtered, page, cardsPerPage]);

    return (
        <div className="tcl-launcher">
            <div className="tcl-launcher-header">
                <div className="tcl-launcher-title">Choose an agent</div>
                <div className="tcl-launcher-sub">Select an agent below to start a conversation.</div>
                <div className="tcl-launcher-search-wrap">
                    <span className="tcl-launcher-search-icon">⌕</span>
                    <input
                        className="tcl-launcher-search"
                        type="text"
                        placeholder="Search agents…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="tcl-launcher-grid">
                {paged.length === 0 ? (
                    <div className="tcl-launcher-empty">No agents match your search.</div>
                ) : (
                    paged.map((agent, i) => (
                        <AgentCard key={agent.id} agent={agent} index={i} onOpen={onOpen} />
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="tcl-launcher-pagination">
                    <button
                        className="tcl-launcher-page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            className={`tcl-launcher-page-btn ${page === p ? 'tcl-launcher-page-active' : ''}`}
                            onClick={() => setPage(p)}
                        >{p}</button>
                    ))}
                    <button
                        className="tcl-launcher-page-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >Next →</button>
                </div>
            )}
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
        evaluations, expandedEvaluations, toggleEvaluation,
        authToken,
        agentRegistryUrl,
    } = props;

    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [currentView, setCurrentView] = useState('chat');
    const [showSettings, setShowSettings] = useState(false);
    const hasOpenTabs = openAgents.length > 0;

    const selectedIndex = agents.findIndex(a => a.id === selectedAgentId);
    const { bg, color } = selectedAgent ? avatarStyle(selectedIndex >= 0 ? selectedIndex : 0) : {};
    const initials = selectedAgent ? agentInitials(selectedAgent.name) : '';

    if (showSettings) {
        return <SettingsPage onBack={() => setShowSettings(false)} agentRegistryUrl={agentRegistryUrl} authToken={authToken} />;
    }

    return (
        <div className="tcl-container">

            {/* ── Browse Panel (left) ── */}
            <BrowsePanel
                filteredAgents={filteredAgents}
                selectedAgentId={selectedAgentId}
                allAgents={agents}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpen={handleSelectAgent}
                fetchAgents={fetchAgents}
                isCollapsed={panelCollapsed}
                onToggle={() => setPanelCollapsed(p => !p)}
                onShowSettings={() => setShowSettings(true)}
            />

            {/* ── Main area ── */}
            <div className="tcl-main">
                {hasOpenTabs ? (
                    <>
                        <TabBar
                            openAgents={openAgents}
                            selectedAgentId={selectedAgentId}
                            allAgents={agents}
                            unreadCounts={unreadCounts}
                            onSelect={handleSelectAgent}
                            onClose={handleCloseTab}
                        />

                        <div className="tcl-chat-area">
                            {selectedAgent ? (
                                <>
                                    <div className="tcl-chat-header">
                                        <div className="tcl-chat-header-left">
                                            <div className="tcl-chat-avatar" style={{ background: bg, color }}>
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="tcl-chat-agent-name">{selectedAgent.name}</div>
                                                <div className="tcl-chat-agent-meta">
                                                    {selectedAgent.description && (
                                                        <span className="tcl-chat-agent-desc">{selectedAgent.description}</span>
                                                    )}
                                                    <StatusPill status={selectedAgent.status} />
                                                </div>
                                            </div>
                                        </div>
                                        {currentView === 'chat' && (
                                            <div className="tcl-header-actions">
                                                <button
                                                    className="tcl-trace-btn"
                                                    onClick={() => setShowTrace(!showTrace)}
                                                >
                                                    {showTrace ? 'Hide trace' : 'Show trace'}
                                                </button>
                                                <button className="tcl-clear-btn" onClick={handleClearSession}>
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
                                        <div className="metrics">
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
                                <div className="tcl-empty-state">
                                    <p>Select a tab above to continue a conversation.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <CardGridLauncher
                        agents={agents}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onOpen={handleSelectAgent}
                    />
                )}
            </div>

            {/* ── Trace sidebar (right) ── */}
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