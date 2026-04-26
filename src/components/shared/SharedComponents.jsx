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
export function ChatMessages({ messages, isLoading, agentName, chatEndRef, evaluations, expandedEvaluations, onToggleEvaluation }) {
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
                        {!isYou && !isSystem && msg.taskId && evaluations && evaluations[msg.taskId] && (
                            <div className="evaluation-toggle">
                                <button
                                    className="evaluation-toggle-btn"
                                    onClick={() => onToggleEvaluation(msg.taskId)}
                                    title="Toggle evaluation metrics"
                                >
                                    {expandedEvaluations.has(msg.taskId) ? '📊 Hide Metrics' : '📊 Show Metrics'}
                                </button>
                                {expandedEvaluations.has(msg.taskId) && (
                                    <EvaluationDisplay evaluation={evaluations[msg.taskId]} />
                                )}
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

// ---------------------------------------------------------------------------
// EvaluationDisplay — shows evaluation metrics for agent responses
// ---------------------------------------------------------------------------
export function EvaluationDisplay({ evaluation }) {
    const getScoreColor = (score, maxScore = 10) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return '#10b981'; // green
        if (percentage >= 60) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    const formatScore = (score) => {
        if (typeof score === 'number') {
            return score % 1 === 0 ? score.toString() : score.toFixed(1);
        }
        return score;
    };

    const renderMetric = (label, value, maxScore = 10) => {
        if (value === null || value === undefined) return null;
        return (
            <div className="evaluation-metric">
                <span className="evaluation-label">{label}:</span>
                <span
                    className="evaluation-value"
                    style={{ color: getScoreColor(value, maxScore) }}
                >
                    {formatScore(value)}{maxScore === 10 ? '/10' : ''}
                </span>
            </div>
        );
    };

    return (
        <div className="evaluation-display">
            <div className="evaluation-header">
                <span className="evaluation-icon">📊</span>
                <span className="evaluation-title">Response Quality</span>
            </div>
            <div className="evaluation-metrics">
                {renderMetric('BLEU Score', evaluation.bleu_score)}
                {renderMetric('ROUGE Score', evaluation.rouge_score)}
                {renderMetric('Recall', evaluation.recall_score)}
                {renderMetric('Clarity', evaluation.clarity_score)}
                {renderMetric('Empathy', evaluation.empathy_score)}
                {renderMetric('Quality', evaluation.quality_score)}
                {renderMetric('Accuracy', evaluation.accuracy_score)}
                {renderMetric('Context Recall', evaluation.context_recall)}
                {renderMetric('Precision', evaluation.precision_score)}
                {renderMetric('Relevance', evaluation.relevance_score)}
                {renderMetric('Sentiment', evaluation.sentiment_score)}
                {renderMetric('Formality', evaluation.formality_score)}
                {renderMetric('Readability', evaluation.readability_score)}
                {renderMetric('Completeness', evaluation.completeness_score)}
                {renderMetric('Coherence', evaluation.coherence_score)}
                {renderMetric('Context Adherence', evaluation.context_adherence)}
                {renderMetric('Context Precision', evaluation.context_precision)}
                {renderMetric('Context Relevance', evaluation.context_relevance)}
                {renderMetric('Intent Confidence', evaluation.intent_confidence)}
                {renderMetric('Satisfaction', evaluation.satisfaction_score)}
                {renderMetric('Perplexity', evaluation.perplexity_score, 100)}
                {renderMetric('Hallucination', evaluation.hallucination_score)}
                {renderMetric('Toxicity', evaluation.toxicity_score)}
                {evaluation.overall_assessment && (
                    <div className="evaluation-assessment">
                        <strong>Assessment:</strong> {evaluation.overall_assessment}
                    </div>
                )}
                {evaluation.detected_intent && (
                    <div className="evaluation-intent">
                        <strong>Intent:</strong> {evaluation.detected_intent}
                    </div>
                )}
                {evaluation.complexity_level && (
                    <div className="evaluation-complexity">
                        <strong>Complexity:</strong> {evaluation.complexity_level}
                    </div>
                )}
                <div className="evaluation-flags">
                    {evaluation.is_low_quality !== undefined && (
                        <span className={`evaluation-flag ${evaluation.is_low_quality ? 'low-quality' : 'good-quality'}`}>
                            {evaluation.is_low_quality ? '⚠️ Low Quality' : '✅ Good Quality'}
                        </span>
                    )}
                    {evaluation.has_code_example !== undefined && (
                        <span className="evaluation-flag">
                            {evaluation.has_code_example ? '💻 Has Code' : '📝 No Code'}
                        </span>
                    )}
                    {evaluation.has_structured_format !== undefined && (
                        <span className="evaluation-flag">
                            {evaluation.has_structured_format ? '📋 Structured' : '📄 Unstructured'}
                        </span>
                    )}
                    {evaluation.hallucination_detected !== undefined && (
                        <span className={`evaluation-flag ${evaluation.hallucination_detected ? 'hallucination' : 'no-hallucination'}`}>
                            {evaluation.hallucination_detected ? '🤖 Hallucination' : '🎯 No Hallucination'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
