/**
 * AgentUI.js — drop-in replacement for the original component.
 *
 * New prop: `layout`
 *   "sidebar"  (default) — original three-panel layout, identical behaviour
 *   "tabcard"            — tab bar + card-grid hybrid layout
 *   "cardchat"           — card grid that opens a chat window
 *
 * All other props are unchanged from the original AgentUI.
 *
 * Usage:
 *
 *   import { AgentUI } from './components/AgentUI.js';
 *
 *   // Original layout — no change needed
 *   <AgentUI agentRegistryUrl="..." authToken="..." />
 *
 *   // New layout
 *   <AgentUI agentRegistryUrl="..." authToken="..." layout="cardchat" />
 *
 *   // Switch at runtime
 *   const [layout, setLayout] = useState('cardchat');
 *   <AgentUI layout={layout} agentRegistryUrl="..." authToken="..." />
 */
import React from 'react';
import { useAgentCore }  from './useAgentCore.js';
import { SidebarLayout } from './layouts/SidebarLayout.js';
import { TabCardLayout } from './layouts/TabCardLayout.js';
import { CardChatLayout } from './layouts/CardChatLayout.js';

import './styles.css';           // shared base styles (original, unchanged)
import './styles-tabcard.css';   // TabCardLayout-only styles
import './styles-cardchat.css';  // CardChatLayout-only styles

// Registry of available layouts — add new ones here
const LAYOUTS = {
    sidebar: SidebarLayout,
    tabcard: TabCardLayout,
    cardchat: CardChatLayout,
};

export function AgentUI({
    agents           = [],
    agentRegistryUrl = null,
    interceptors     = [],
    agentTokenMap    = null,
    authToken        = 'dummy-token',
    layout           = 'sidebar',  // ← new prop; defaults to original behaviour
}) {
    // All state and agent-communication logic lives here, independent of layout
    const coreProps = useAgentCore({
        agents,
        agentRegistryUrl,
        interceptors,
        agentTokenMap,
        authToken,
    });

    // Fall back to SidebarLayout if an unrecognised layout name is passed
    const LayoutComponent = LAYOUTS[layout] ?? SidebarLayout;

    return <LayoutComponent {...coreProps} />;
}
