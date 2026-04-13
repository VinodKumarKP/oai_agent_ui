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
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <ChatMessages
                messages={messages}
                isLoading={isLoading}
                agentName={agentName}
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
    );
}
