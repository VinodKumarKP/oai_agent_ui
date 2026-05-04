import React, { useState, useMemo } from 'react';
import { TraceLogSidebar } from '../shared/TraceLogSidebar.jsx';
import { ChatWindow }      from '../shared/ChatWindow.jsx';
import { AgentEvaluationMetrics } from '../shared/AgentEvaluationMetrics.jsx';
import { AgentLogs } from '../shared/AgentLogs.jsx';
import { TokenManager } from '../shared/TokenManager.jsx';
import { SettingsPage } from '../settings/SettingsPage.jsx';
import { agentInitials, avatarStyle } from '../shared/utils.js';
import {AgentInfo} from "../shared/AgentInfo";

// ---------------------------------------------------------------------------
// Helpers / Sub-components
// ---------------------------------------------------------------------------
function StatusDot({ status }) {
    let color = 'var(--oai-text-disabled)';
    if (status === 'active')   color = '#4CAF50';
    if (status === 'inactive') color = '#F44336';
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
                    onClick={(e) => { e.stopPropagation(); onOpen(agent.id); }}
                >
                    Open ↗
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// SubTabBar
// ---------------------------------------------------------------------------
function SubTabBar({ currentView, setCurrentView }) {
    return (
        <div className="ccl-sub-tab-bar">
            <button
                className={`ccl-sub-tab ${currentView === 'chat' ? 'ccl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('chat')}
            >
                Chat
            </button>
            <button
                className={`ccl-sub-tab ${currentView === 'info' ? 'ccl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('info')}
            >
                Info
            </button>
            <button
                className={`ccl-sub-tab ${currentView === 'metrics' ? 'ccl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('metrics')}
            >
                Metrics
            </button>
            <button
                className={`ccl-sub-tab ${currentView === 'logs' ? 'ccl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('logs')}
            >
                Logs
            </button>
            <button
                className={`ccl-sub-tab ${currentView === 'tokens' ? 'ccl-sub-tab-active' : ''}`}
                onClick={() => setCurrentView('tokens')}
            >
                Tokens
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// AgentRegistry — the main launcher / registry view
// ---------------------------------------------------------------------------
function AgentRegistry({ agents, searchQuery, setSearchQuery, onOpen, registryError, onShowSettings }) {
    const [activeTab, setActiveTab] = useState('all');
    const [isListView, setIsListView] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const agentsPerPage = 10; // Display 15 agents per page

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
        setCurrentPage(1); // Reset to first page on filter/tab change
        return list;
    }, [agents, activeTab, searchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / agentsPerPage);
    const paginatedAgents = useMemo(() => {
        const startIndex = (currentPage - 1) * agentsPerPage;
        const endIndex = startIndex + agentsPerPage;
        return filtered.slice(startIndex, endIndex);
    }, [filtered, currentPage, agentsPerPage]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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
                    <button className="ccl-settings-btn" onClick={onShowSettings}>
                        Settings
                    </button>
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
                    <>
                        <div className={`ccl-agent-grid ${isListView ? 'ccl-agent-list' : ''}`}>
                            {paginatedAgents.length === 0 ? (
                                <div className="ccl-empty-msg">No agents match your search.</div>
                            ) : (
                                paginatedAgents.map((agent, i) => (
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
                        {totalPages > 1 && (
                            <div className="ccl-pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="ccl-pagination-btn"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`ccl-pagination-btn ${currentPage === page ? 'ccl-pagination-active' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="ccl-pagination-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
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
        evaluations, expandedEvaluations, toggleEvaluation,
        authToken,
        agentRegistryUrl,
    } = props;

    const [currentView, setCurrentView] = useState('info');
    const [showSettings, setShowSettings] = useState(false);

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
                    {currentView === 'chat' && (
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
                    )}
                </div>

                <div className="ccl-chat-main">
                    <div className="ccl-chat-body">
                        <SubTabBar currentView={currentView} setCurrentView={setCurrentView} />

                        {currentView === 'chat' && (
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
                                evaluations={evaluations}
                                expandedEvaluations={expandedEvaluations}
                                onToggleEvaluation={toggleEvaluation}
                            />
                        )}

                        {currentView === 'info' && (
                            <div className="sl-info-view">
                                <AgentInfo
                                    agentName={selectedAgent.name}
                                    agentEndpoint={selectedAgent.endpoint}
                                    authToken={authToken}
                                    onBack={() => {}} // No back button needed here
                                />
                            </div>
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
                    </div>
                    {showTrace && currentView === 'chat' && (
                        <TraceLogSidebar
                            logs={currentTraceLogs}
                            selectedAgent={selectedAgent}
                            traceEndRef={traceEndRef}
                            onClose={() => setShowTrace(false)}
                        />
                    )}
                </div>
            </div>
        );
    }

    if (showSettings) {
        return <SettingsPage onBack={() => setShowSettings(false)} agentRegistryUrl={agentRegistryUrl} authToken={authToken} />;
    }

    return (
        <AgentRegistry
            agents={agents}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpen={handleSelectAgent}
            registryError={registryError}
            onShowSettings={() => setShowSettings(true)}
        />
    );
}