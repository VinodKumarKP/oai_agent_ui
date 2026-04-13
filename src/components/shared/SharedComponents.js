import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ---------------------------------------------------------------------------
// StatusDot
// ---------------------------------------------------------------------------
export function StatusDot({ status, size = 8 }) {
    return (
        <span
            className={`status-dot ${status || 'unknown'}`}
            title={`Status: ${status || 'unknown'}`}
            style={{ width: size, height: size }}
        />
    );
}

// ---------------------------------------------------------------------------
// ChatMessages — scrollable message list, shared by both layouts
// ---------------------------------------------------------------------------
export function ChatMessages({ messages, isLoading, agentName, chatEndRef }) {
    return (
        <div className="chat-messages">
            {messages.map((msg, index) => {
                const isYou    = msg.sender === 'You';
                const isSystem = msg.sender === 'System';
                const cls      = isSystem ? 'system' : isYou ? 'you' : 'agent';
                return (
                    <div key={index} className={`message ${cls}`}>
                        <div className="sender">{msg.sender}</div>
                        {msg.text && (
                            <div className="text">
                                {isSystem ? (
                                    msg.text
                                ) : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-body">
                                        {msg.text}
                                    </ReactMarkdown>
                                )}
                            </div>
                        )}
                        {msg.attachments?.length > 0 && (
                            <div className="message-attachments">
                                {msg.attachments.map((name, idx) => (
                                    <div key={idx} className="message-attachment">
                                        <span className="attachment-icon">📎</span> {name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {isLoading && (
                <div className="message loading">
                    <div className="sender">{agentName}</div>
                    <div className="text">
                        <div className="spinner" />
                        Agent is working...
                    </div>
                </div>
            )}

            <div ref={chatEndRef} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// ChatInput — textarea + attach button + send/stop
// ---------------------------------------------------------------------------
export function ChatInput({
    message, isLoading, attachedFiles,
    textareaRef, fileInputRef,
    onMessageChange, onSend, onStop,
    onFileSelect, onRemoveAttachment,
}) {
    return (
        <div className="chat-input-wrapper">
            {attachedFiles.length > 0 && (
                <div className="attachments-preview">
                    {attachedFiles.map((file, index) => (
                        <div key={index} className="attachment-preview-item">
                            📎 {file.name}
                            <button
                                className="remove-btn"
                                onClick={() => onRemoveAttachment(index)}
                                disabled={isLoading}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="chat-input">
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={onFileSelect}
                    disabled={isLoading}
                />
                <button
                    className="attach-btn"
                    onClick={() => fileInputRef.current.click()}
                    title="Attach files"
                    disabled={isLoading}
                >
                    📎
                </button>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={onMessageChange}
                    placeholder="Type a message or attach a file..."
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                    rows={1}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <button className="send-btn stop-btn" onClick={onStop}>Stop</button>
                ) : (
                    <button
                        className="send-btn"
                        onClick={onSend}
                        disabled={!message.trim() && attachedFiles.length === 0}
                    >
                        Send
                    </button>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// TraceLogSidebar — right-hand trace panel, shared by both layouts
// ---------------------------------------------------------------------------
export function TraceLogSidebar({ logs, selectedAgent, traceEndRef, onClose }) {
    return (
        <div className="trace-sidebar">
            <div className="trace-sidebar-header">
                <h2>Trace Log</h2>
                <button className="close-trace-btn" onClick={onClose}>×</button>
            </div>
            {selectedAgent ? (
                <div className="trace-log-content">
                    {logs.length === 0 ? (
                        <p className="trace-empty">Waiting for events...</p>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className={`trace-log-item event-${log.kind}`}>
                                <div className="trace-header">
                                    <span className="trace-type">{log.traceType}</span>
                                    <span className="trace-timestamp">{log.timestamp}</span>
                                </div>
                                <div className="trace-summary">{log.summary}</div>
                                {log.details && (
                                    <div className="trace-details">{log.details}</div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={traceEndRef} />
                </div>
            ) : (
                <p className="trace-empty">Select an agent to view logs.</p>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// EmptyState — shown in SidebarLayout when no agent is selected
// ---------------------------------------------------------------------------
export function EmptyState({ agents, onSelectAgent }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <h3>Select an Agent</h3>
            <p>Choose an agent from the list to start a conversation.</p>
            {agents.length > 0 && (
                <div className="empty-state-agents">
                    {agents.slice(0, 4).map(agent => (
                        <button
                            key={agent.id}
                            className="empty-state-agent-btn"
                            onClick={() => onSelectAgent(agent.id)}
                        >
                            <StatusDot status={agent.status} />
                            {agent.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
