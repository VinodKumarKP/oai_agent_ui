import React from 'react';
import { useAgentCore } from './useAgentCore.js';
import { SidebarLayout } from './layouts/SidebarLayout.jsx';
import { TabCardLayout } from './layouts/TabCardLayout.jsx';
import { CardChatLayout } from './layouts/CardChatLayout.jsx';

import './styles/styles.css';
import './styles/styles-tabcard.css';
import './styles/styles-cardchat.css';
import './styles/oai-theme.css';

const LAYOUTS = {
    sidebar: SidebarLayout,
    tabcard: TabCardLayout,
    cardchat: CardChatLayout,
};

export function AgentUI({
    agents = [],
    agentRegistryUrl = null,
    interceptors = [],
    agentTokenMap = null,
    authToken = 'dummy-token',
    layout = 'sidebar',
}) {
    const coreProps = useAgentCore({
        agents,
        agentRegistryUrl,
        interceptors,
        agentTokenMap,
        authToken,
    });

    const LayoutComponent = LAYOUTS[layout] ?? SidebarLayout;

    return <LayoutComponent {...coreProps} />;
}
