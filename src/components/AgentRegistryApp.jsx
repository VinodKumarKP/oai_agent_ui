import React, { useState } from 'react';
import { AgentUI, LayoutSwitcher } from '../index';

export function AgentRegistryApp({ agentRegistryUrl, authToken }) {
    const [layout, setLayout] = useState('sidebar');

    return (
        <>
            <AgentUI
                agentRegistryUrl={agentRegistryUrl}
                authToken={authToken}
                layout={layout}
            />
            <LayoutSwitcher layout={layout} setLayout={setLayout} />
        </>
    );
}
