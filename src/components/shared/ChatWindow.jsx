import React from 'react';
import { ChatMessages, ChatInput } from './SharedComponents.jsx';

export function ChatWindow({
    messages,
    agentName,
    agentAvatarBg,
    agentAvatarColor,
    chatEndRef,
    message,
    isLoading,
    attachedFiles,
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
    evaluations,
    expandedEvaluations,
    onToggleEvaluation,
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <ChatMessages
                messages={messages}
                isLoading={isLoading}
                agentName={agentName}
                chatEndRef={chatEndRef}
                evaluations={evaluations}
                expandedEvaluations={expandedEvaluations}
                onToggleEvaluation={onToggleEvaluation}
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
    );
}
