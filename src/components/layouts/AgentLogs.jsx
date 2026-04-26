import React from 'react';

export function AgentLogs({ selectedAgent }) {
    // Placeholder logs
    const logs = [
        { id: 1, timestamp: '2023-10-01 10:00:00', message: 'Conversation started' },
        { id: 2, timestamp: '2023-10-01 10:05:00', message: 'User asked about weather' },
        { id: 3, timestamp: '2023-10-01 10:10:00', message: 'Agent responded with forecast' },
        // Add more as needed
    ];

    return (
        <div className="sl-logs">
            <h3>Older Logs for {selectedAgent.name}</h3>
            <div className="sl-logs-list">
                {logs.map((log) => (
                    <div key={log.id} className="sl-log-item">
                        <span className="sl-log-timestamp">{log.timestamp}</span>
                        <span className="sl-log-message">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}