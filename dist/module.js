import "./module.css";
import {jsx as $5OpyM$jsx, jsxs as $5OpyM$jsxs, Fragment as $5OpyM$Fragment} from "react/jsx-runtime";
import $5OpyM$react, {useState as $5OpyM$useState, useRef as $5OpyM$useRef, useCallback as $5OpyM$useCallback, useEffect as $5OpyM$useEffect, useMemo as $5OpyM$useMemo} from "react";
import {ClientFactoryOptions as $5OpyM$ClientFactoryOptions, DefaultAgentCardResolver as $5OpyM$DefaultAgentCardResolver, ClientFactory as $5OpyM$ClientFactory} from "@a2a-js/sdk/client";
import $5OpyM$reactmarkdown from "react-markdown";
import $5OpyM$remarkgfm from "remark-gfm";
import {ResponsiveContainer as $5OpyM$ResponsiveContainer, AreaChart as $5OpyM$AreaChart, CartesianGrid as $5OpyM$CartesianGrid, XAxis as $5OpyM$XAxis, YAxis as $5OpyM$YAxis, Tooltip as $5OpyM$Tooltip, ReferenceLine as $5OpyM$ReferenceLine, Area as $5OpyM$Area, PieChart as $5OpyM$PieChart, Pie as $5OpyM$Pie, Cell as $5OpyM$Cell, Legend as $5OpyM$Legend, BarChart as $5OpyM$BarChart, Bar as $5OpyM$Bar, RadarChart as $5OpyM$RadarChart, PolarGrid as $5OpyM$PolarGrid, PolarAngleAxis as $5OpyM$PolarAngleAxis, PolarRadiusAxis as $5OpyM$PolarRadiusAxis, Radar as $5OpyM$Radar, LineChart as $5OpyM$LineChart, Line as $5OpyM$Line} from "recharts";





// ---------------------------------------------------------------------------
// Auth helpers (unchanged from original AgentUI.js)
// ---------------------------------------------------------------------------
function $afd0fea0e112cfe9$var$resolveToken(tokenMap, ...lookupKeys) {
    for (const key of lookupKeys){
        if (key && tokenMap.has(key)) return tokenMap.get(key);
    }
    return tokenMap.get('default') ?? null;
}
class $afd0fea0e112cfe9$var$PerAgentAuthInterceptor {
    /** @param {Map<string, string>} tokenMap */ constructor(tokenMap){
        this.tokenMap = tokenMap;
    }
    before(args) {
        if (args.agentCard) {
            const token = $afd0fea0e112cfe9$var$resolveToken(this.tokenMap, args.agentCard.id, args.agentCard.url);
            if (token) args.options = {
                ...args.options || {},
                serviceParameters: {
                    ...args.options?.serviceParameters || {},
                    Authorization: `Bearer ${token}`
                }
            };
        }
        return Promise.resolve();
    }
    after() {
        return Promise.resolve();
    }
}
function $afd0fea0e112cfe9$var$buildClientFactoryOptions(authToken, agentTokenMap, customInterceptors, agentBaseUrl) {
    if (authToken) {
        const authenticatedCardFetch = async (url, init = {})=>fetch(url, {
                ...init,
                headers: {
                    ...init.headers || {},
                    Authorization: `Bearer ${authToken}`
                }
            });
        return (0, $5OpyM$ClientFactoryOptions).createFrom((0, $5OpyM$ClientFactoryOptions).default, {
            cardResolver: new (0, $5OpyM$DefaultAgentCardResolver)({
                fetchImpl: authenticatedCardFetch
            }),
            clientConfig: {
                interceptors: [
                    {
                        before (args) {
                            args.options = {
                                ...args.options || {},
                                serviceParameters: {
                                    ...args.options?.serviceParameters || {},
                                    Authorization: `Bearer ${authToken}`
                                }
                            };
                            return Promise.resolve();
                        },
                        after () {
                            return Promise.resolve();
                        }
                    }
                ]
            }
        });
    }
    if (agentTokenMap) {
        const authenticatedCardFetch = async (url, init = {})=>{
            const token = $afd0fea0e112cfe9$var$resolveToken(agentTokenMap, agentBaseUrl);
            return fetch(url, {
                ...init,
                headers: {
                    ...init.headers || {},
                    ...token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                }
            });
        };
        return (0, $5OpyM$ClientFactoryOptions).createFrom((0, $5OpyM$ClientFactoryOptions).default, {
            cardResolver: new (0, $5OpyM$DefaultAgentCardResolver)({
                fetchImpl: authenticatedCardFetch
            }),
            clientConfig: {
                interceptors: [
                    new $afd0fea0e112cfe9$var$PerAgentAuthInterceptor(agentTokenMap)
                ]
            }
        });
    }
    return (0, $5OpyM$ClientFactoryOptions).createFrom((0, $5OpyM$ClientFactoryOptions).default, {
        clientConfig: {
            interceptors: customInterceptors ?? []
        }
    });
}
function $afd0fea0e112cfe9$export$ff5f6a678ca1774c({ agents: initialAgents = [], agentRegistryUrl: agentRegistryUrl = null, interceptors: customInterceptors = [], agentTokenMap: agentTokenMap = null, authToken: authToken = 'dummy-token' }) {
    const [agents, setAgents] = (0, $5OpyM$useState)([]);
    const [selectedAgentId, setSelectedAgentId] = (0, $5OpyM$useState)(null);
    const [openAgentIds, setOpenAgentIds] = (0, $5OpyM$useState)([]);
    const [message, setMessage] = (0, $5OpyM$useState)('');
    const [searchQuery, setSearchQuery] = (0, $5OpyM$useState)('');
    const [attachedFiles, setAttachedFiles] = (0, $5OpyM$useState)([]);
    const [chatHistory, setChatHistory] = (0, $5OpyM$useState)({});
    const [traceLogs, setTraceLogs] = (0, $5OpyM$useState)({});
    const [agentContexts, setAgentContexts] = (0, $5OpyM$useState)({});
    const [showTrace, setShowTrace] = (0, $5OpyM$useState)(false);
    const [isLoading, setIsLoading] = (0, $5OpyM$useState)(false);
    const [unreadCounts, setUnreadCounts] = (0, $5OpyM$useState)({});
    const [registryError, setRegistryError] = (0, $5OpyM$useState)(null);
    const [evaluations, setEvaluations] = (0, $5OpyM$useState)({});
    const [expandedEvaluations, setExpandedEvaluations] = (0, $5OpyM$useState)(new Set());
    const abortControllerRef = (0, $5OpyM$useRef)(null);
    const chatEndRef = (0, $5OpyM$useRef)(null);
    const traceEndRef = (0, $5OpyM$useRef)(null);
    const textareaRef = (0, $5OpyM$useRef)(null);
    const fileInputRef = (0, $5OpyM$useRef)(null);
    const initialAgentsRef = (0, $5OpyM$useRef)(initialAgents);
    // ── Fetch agents from registry ──────────────────────────────────────────
    const fetchAgents = (0, $5OpyM$useCallback)(async ()=>{
        let loadedAgents = [];
        const options = {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${authToken}`
            }
        };
        let registryUrl = agentRegistryUrl?.toString() ?? '';
        if (registryUrl) {
            if (!registryUrl.endsWith('/info')) registryUrl = registryUrl.endsWith('/') ? `${registryUrl}info` : `${registryUrl}/info`;
            try {
                const response = await fetch(registryUrl, options);
                if (response.ok) {
                    const data = await response.json();
                    if (data.agents) loadedAgents = Object.entries(data.agents).map(([id, info])=>{
                        let endpoint = info.endpoint;
                        if (!endpoint.startsWith('http')) endpoint = `http://${endpoint}`;
                        if (!endpoint.endsWith('/a2a') && !endpoint.endsWith('/a2a/')) endpoint = endpoint.endsWith('/') ? `${endpoint}a2a` : `${endpoint}/a2a`;
                        return {
                            id: id,
                            endpoint: endpoint,
                            name: id.replace(/_/g, ' ').replace(/\b\w/g, (l)=>l.toUpperCase()),
                            description: info.description,
                            status: info.status
                        };
                    });
                    else if (data.agent_name) {
                        let endpoint = data.endpoint;
                        if (endpoint && !endpoint.startsWith('http')) endpoint = `http://${endpoint}`;
                        if (endpoint && !endpoint.endsWith('/a2a') && !endpoint.endsWith('/a2a/')) endpoint = endpoint.endsWith('/') ? `${endpoint}a2a` : `${endpoint}/a2a`;
                        loadedAgents = [
                            {
                                id: data.agent_name,
                                endpoint: endpoint,
                                name: data.agent_name.replace(/_/g, ' ').replace(/\b\w/g, (l)=>l.toUpperCase()),
                                description: data.description,
                                status: data.initialized ? 'active' : 'inactive'
                            }
                        ];
                    }
                    setRegistryError(null);
                } else {
                    console.error('Failed to fetch from agent registry:', response.status);
                    setRegistryError(`Failed to fetch agents from the registry (HTTP ${response.status}). Please check the registry URL and your network connection.`);
                }
            } catch (e) {
                // console.error('Error fetching agent registry:', e);
                setRegistryError(`An unexpected error occurred while fetching agents. Please check the console for more details.`);
            }
        }
        if (loadedAgents.length === 0 && initialAgentsRef.current?.length > 0) loadedAgents = initialAgentsRef.current;
        setAgents(loadedAgents.map((a)=>({
                ...a,
                status: a.status || 'unknown'
            })));
    }, [
        agentRegistryUrl,
        authToken
    ]);
    (0, $5OpyM$useEffect)(()=>{
        fetchAgents();
    }, [
        fetchAgents
    ]);
    // ── Auto-scroll ──────────────────────────────────────────────────────────
    (0, $5OpyM$useEffect)(()=>{
        chatEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [
        chatHistory,
        selectedAgentId,
        isLoading
    ]);
    (0, $5OpyM$useEffect)(()=>{
        if (showTrace) traceEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [
        traceLogs,
        selectedAgentId,
        showTrace
    ]);
    // ── Textarea resize ──────────────────────────────────────────────────────
    const handleMessageChange = (e)=>{
        setMessage(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };
    const resetTextarea = ()=>{
        setMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };
    // ── Agent selection (opens tab) ──────────────────────────────────────────
    const handleSelectAgent = (0, $5OpyM$useCallback)((agentId)=>{
        setSelectedAgentId(agentId);
        if (agentId) {
            setOpenAgentIds((prev)=>prev.includes(agentId) ? prev : [
                    ...prev,
                    agentId
                ]);
            setUnreadCounts((prev)=>({
                    ...prev,
                    [agentId]: 0
                }));
        }
    }, []);
    // ── Close tab ────────────────────────────────────────────────────────────
    const handleCloseTab = (0, $5OpyM$useCallback)((agentId, e)=>{
        e?.stopPropagation();
        setOpenAgentIds((prev)=>{
            const next = prev.filter((id)=>id !== agentId);
            if (agentId === selectedAgentId) {
                const idx = prev.indexOf(agentId);
                const nextSelected = next[idx] ?? next[idx - 1] ?? next[0] ?? null;
                setSelectedAgentId(nextSelected);
            }
            return next;
        });
    }, [
        selectedAgentId
    ]);
    // ── Clear session ────────────────────────────────────────────────────────
    const handleClearSession = (0, $5OpyM$useCallback)(()=>{
        if (!selectedAgentId) return;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
        setChatHistory((prev)=>{
            const s = {
                ...prev
            };
            delete s[selectedAgentId];
            return s;
        });
        setTraceLogs((prev)=>{
            const s = {
                ...prev
            };
            delete s[selectedAgentId];
            return s;
        });
        setAgentContexts((prev)=>{
            const s = {
                ...prev
            };
            delete s[selectedAgentId];
            return s;
        });
        setAttachedFiles([]);
    }, [
        selectedAgentId
    ]);
    // ── File handling ────────────────────────────────────────────────────────
    const handleFileSelect = (e)=>{
        Array.from(e.target.files).forEach((file)=>{
            const reader = new FileReader();
            reader.onload = (ev)=>{
                const base64Data = ev.target.result.split(',')[1];
                setAttachedFiles((prev)=>[
                        ...prev,
                        {
                            name: file.name,
                            mimeType: file.type || 'application/octet-stream',
                            bytes: base64Data
                        }
                    ]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = null;
    };
    const removeAttachment = (index)=>setAttachedFiles((prev)=>prev.filter((_, i)=>i !== index));
    // ── Stop generation ──────────────────────────────────────────────────────
    const handleStopGeneration = ()=>{
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };
    // ── Send message ─────────────────────────────────────────────────────────
    const handleSendMessage = async ()=>{
        if (!message.trim() && attachedFiles.length === 0 || !selectedAgentId || isLoading) return;
        const selectedAgent = agents.find((a)=>a.id === selectedAgentId);
        if (!selectedAgent) {
            console.error('Selected agent not found in the list of agents.');
            setChatHistory((prev)=>({
                    ...prev,
                    [selectedAgentId]: [
                        ...prev[selectedAgentId] || [],
                        {
                            sender: 'System',
                            text: `Error: The selected agent could not be found. Please refresh the page or try selecting the agent again.`
                        }
                    ]
                }));
            return;
        }
        const currentMessageText = message;
        const currentAttachments = [
            ...attachedFiles
        ];
        setChatHistory((prev)=>({
                ...prev,
                [selectedAgentId]: [
                    ...prev[selectedAgentId] || [],
                    {
                        sender: 'You',
                        text: currentMessageText,
                        attachments: currentAttachments.map((f)=>f.name)
                    }
                ]
            }));
        resetTextarea();
        setAttachedFiles([]);
        setIsLoading(true);
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        try {
            let baseUrl = selectedAgent.endpoint;
            if (!baseUrl.endsWith('/')) baseUrl += '/';
            const factoryOptions = $afd0fea0e112cfe9$var$buildClientFactoryOptions(authToken, agentTokenMap, customInterceptors, baseUrl);
            const factory = new (0, $5OpyM$ClientFactory)(factoryOptions);
            const client = await factory.createFromUrl(baseUrl);
            const msgId = crypto?.randomUUID?.() ?? `msg-${Date.now()}-${Math.random()}`;
            const currentContextId = agentContexts[selectedAgentId];
            const parts = [];
            if (currentMessageText.trim()) parts.push({
                kind: 'text',
                text: currentMessageText
            });
            currentAttachments.forEach((f)=>parts.push({
                    kind: 'file',
                    file: {
                        name: f.name,
                        mimeType: f.mimeType,
                        bytes: f.bytes
                    }
                }));
            const stream = client.sendMessageStream({
                message: {
                    messageId: msgId,
                    role: 'user',
                    parts: parts,
                    kind: 'message',
                    ...currentContextId && {
                        contextId: currentContextId
                    }
                }
            });
            let currentTaskId = null;
            for await (const event of stream){
                if (signal.aborted) throw new Error('User aborted the request.');
                if (event.contextId) setAgentContexts((prev)=>({
                        ...prev,
                        [selectedAgentId]: event.contextId
                    }));
                const timestamp = new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                });
                // Capture task_id from task events
                if (event.kind === 'task') currentTaskId = event.id;
                // Trace logging
                setTraceLogs((prev)=>{
                    const currentLogs = prev[selectedAgentId] || [];
                    let traceType = 'Unknown Event', summary = '', details = '';
                    if (event.kind === 'task') {
                        traceType = 'Task Init';
                        summary = `[${event.status?.state?.toUpperCase() || 'UNKNOWN'}] ID: ${event.id}`;
                    } else if (event.kind === 'status-update') {
                        traceType = 'Status Update';
                        summary = `[${event.status?.state?.toUpperCase() || 'UNKNOWN'}] ID: ${event.taskId}`;
                        if (event.final) summary += ' (FINAL)';
                    } else if (event.kind === 'artifact-update') {
                        traceType = 'Artifact';
                        summary = `${event.artifact?.name || 'Unnamed'} | Appended: ${event.append ? 'Y' : 'N'} | Last: ${event.lastChunk ? 'Y' : 'N'}`;
                        const textContent = event.artifact?.parts?.find((p)=>p.kind === 'text')?.text;
                        if (textContent) details = textContent;
                    } else if (event.kind === 'message') {
                        traceType = 'Message';
                        summary = `Role: ${event.role}`;
                    } else traceType = `${event.kind}`;
                    return {
                        ...prev,
                        [selectedAgentId]: [
                            ...currentLogs,
                            {
                                timestamp: timestamp,
                                kind: event.kind,
                                traceType: traceType,
                                summary: summary,
                                details: details,
                                raw: event
                            }
                        ]
                    };
                });
                // Main chat window
                let responseText = '';
                if (event.kind === 'status-update') {
                    const textPart = event.status?.message?.parts?.find((p)=>p.kind === 'text');
                    if (textPart) responseText = textPart.text;
                } else if (event.kind === 'message') {
                    const textPart = event.parts?.find((p)=>p.kind === 'text');
                    if (textPart) responseText = textPart.text;
                }
                if (responseText) {
                    const responseMessage = {
                        sender: selectedAgent.name,
                        text: responseText,
                        taskId: currentTaskId
                    };
                    setChatHistory((prev)=>{
                        const currentHistory = prev[selectedAgentId] || [];
                        const lastMessage = currentHistory[currentHistory.length - 1];
                        if (lastMessage?.sender === selectedAgent.name) return {
                            ...prev,
                            [selectedAgentId]: [
                                ...currentHistory.slice(0, -1),
                                responseMessage
                            ]
                        };
                        return {
                            ...prev,
                            [selectedAgentId]: [
                                ...currentHistory,
                                responseMessage
                            ]
                        };
                    });
                }
            }
            // Fetch evaluation after stream completes
            if (currentTaskId) fetchEvaluation(currentTaskId, baseUrl);
        } catch (e) {
            // Error is already handled by adding a system message to chat history
            if (e.message !== 'User aborted the request.') {
                const errDetails = e instanceof Error ? e.message : String(e);
                setChatHistory((prev)=>({
                        ...prev,
                        [selectedAgentId]: [
                            ...prev[selectedAgentId] || [],
                            {
                                sender: 'System',
                                text: `Error communicating with ${agents.find((a)=>a.id === selectedAgentId)?.name || 'Agent'}. Details: ${errDetails}`
                            }
                        ]
                    }));
            }
        } finally{
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };
    // ── Fetch evaluation ─────────────────────────────────────────────────────
    const fetchEvaluation = (0, $5OpyM$useCallback)(async (taskId, agentEndpoint, retryCount = 0)=>{
        if (!taskId || !agentEndpoint) return;
        const maxRetries = 3;
        const retryDelay = 15000; // 15 seconds
        try {
            const evaluationUrl = `${agentEndpoint.replace(/\/$/, '')}/evaluations/${taskId}`;
            const response = await fetch(evaluationUrl, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                const evaluationData = await response.json();
                setEvaluations((prev)=>({
                        ...prev,
                        [taskId]: evaluationData
                    }));
            } else if (response.status === 404 && retryCount < maxRetries) // Evaluation not ready yet, retry after delay
            setTimeout(()=>fetchEvaluation(taskId, agentEndpoint, retryCount + 1), retryDelay);
            else console.warn(`Failed to fetch evaluation for task ${taskId}: ${response.status}`);
        } catch (error) {
            if (retryCount < maxRetries) // Network error, retry after delay
            setTimeout(()=>fetchEvaluation(taskId, agentEndpoint, retryCount + 1), retryDelay);
            else console.warn(`Error fetching evaluation for task ${taskId} after ${maxRetries} retries:`, error);
        }
    }, [
        authToken
    ]);
    // ── Toggle evaluation display ─────────────────────────────────────────────
    const toggleEvaluation = (0, $5OpyM$useCallback)((taskId)=>{
        setExpandedEvaluations((prev)=>{
            const newSet = new Set(prev);
            if (newSet.has(taskId)) newSet.delete(taskId);
            else newSet.add(taskId);
            return newSet;
        });
    }, []);
    // ── Derived values ───────────────────────────────────────────────────────
    const filteredAgents = (0, $5OpyM$useMemo)(()=>{
        if (!searchQuery.trim()) return agents;
        const q = searchQuery.toLowerCase();
        return agents.filter((a)=>a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
    }, [
        agents,
        searchQuery
    ]);
    const selectedAgent = agents.find((a)=>a.id === selectedAgentId) ?? null;
    const currentMessages = chatHistory[selectedAgentId] || [];
    const currentTraceLogs = traceLogs[selectedAgentId] || [];
    const openAgents = openAgentIds.map((id)=>agents.find((a)=>a.id === id)).filter(Boolean);
    return {
        agents: // State
        agents,
        filteredAgents: filteredAgents,
        openAgents: openAgents,
        selectedAgent: selectedAgent,
        selectedAgentId: selectedAgentId,
        message: message,
        searchQuery: searchQuery,
        attachedFiles: attachedFiles,
        currentMessages: currentMessages,
        currentTraceLogs: currentTraceLogs,
        showTrace: showTrace,
        isLoading: isLoading,
        unreadCounts: unreadCounts,
        registryError: registryError,
        evaluations: evaluations,
        expandedEvaluations: expandedEvaluations,
        chatEndRef: // Refs
        chatEndRef,
        traceEndRef: traceEndRef,
        textareaRef: textareaRef,
        fileInputRef: fileInputRef,
        fetchAgents: // Handlers
        fetchAgents,
        handleSelectAgent: handleSelectAgent,
        handleCloseTab: handleCloseTab,
        handleClearSession: handleClearSession,
        handleMessageChange: handleMessageChange,
        resetTextarea: resetTextarea,
        handleFileSelect: handleFileSelect,
        removeAttachment: removeAttachment,
        handleStopGeneration: handleStopGeneration,
        handleSendMessage: handleSendMessage,
        setSearchQuery: setSearchQuery,
        setShowTrace: setShowTrace,
        fetchEvaluation: fetchEvaluation,
        toggleEvaluation: toggleEvaluation,
        authToken: authToken
    };
}


/**
 * SidebarLayout — three-panel layout with a polished dark sidebar.
 *
 * ┌──────────────┬──────────────────────────────┬──────────────┐
 * │  Agent list  │         Chat window          │  Trace log   │
 * │  (sidebar)   │                              │  (optional)  │
 * └──────────────┴──────────────────────────────┴──────────────┘
 *
 * Receives all props from useAgentCore() via AgentUI.js.
 */ 





function $66ee384eb96aa146$export$eaa9dcd62e0d5ec6({ status: status, size: size = 8 }) {
    return /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
        className: `status-dot ${status || 'unknown'}`,
        title: `Status: ${status || 'unknown'}`,
        style: {
            width: size,
            height: size
        }
    });
}
function $66ee384eb96aa146$export$148ad0a1a7d03440({ messages: messages, isLoading: isLoading, agentName: agentName, chatEndRef: chatEndRef, evaluations: evaluations, expandedEvaluations: expandedEvaluations, onToggleEvaluation: onToggleEvaluation }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "chat-messages",
        children: [
            messages.map((msg, index)=>{
                const isYou = msg.sender === 'You';
                const isSystem = msg.sender === 'System';
                const cls = isSystem ? 'system' : isYou ? 'you' : 'agent';
                return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                    className: `message ${cls}`,
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "sender",
                            children: msg.sender
                        }),
                        msg.text && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "text",
                            children: isSystem ? msg.text : /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$reactmarkdown), {
                                remarkPlugins: [
                                    (0, $5OpyM$remarkgfm)
                                ],
                                className: "markdown-body",
                                children: msg.text
                            })
                        }),
                        msg.attachments?.length > 0 && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "message-attachments",
                            children: msg.attachments.map((name, idx)=>/*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "message-attachment",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                            className: "attachment-icon",
                                            children: "\uD83D\uDCCE"
                                        }),
                                        " ",
                                        name
                                    ]
                                }, idx))
                        }),
                        !isYou && !isSystem && msg.taskId && evaluations && evaluations[msg.taskId] && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "evaluation-toggle",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                    className: "evaluation-toggle-btn",
                                    onClick: ()=>onToggleEvaluation(msg.taskId),
                                    title: "Toggle evaluation metrics",
                                    children: expandedEvaluations.has(msg.taskId) ? "\uD83D\uDCCA Hide Metrics" : "\uD83D\uDCCA Show Metrics"
                                }),
                                expandedEvaluations.has(msg.taskId) && /*#__PURE__*/ (0, $5OpyM$jsx)($66ee384eb96aa146$export$7b296a6d2fce609e, {
                                    evaluation: evaluations[msg.taskId]
                                })
                            ]
                        })
                    ]
                }, index);
            }),
            isLoading && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "message loading",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "sender",
                        children: agentName
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "text",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                className: "spinner"
                            }),
                            "Agent is working..."
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                ref: chatEndRef
            })
        ]
    });
}
function $66ee384eb96aa146$export$19b903fd083c557c({ message: message, isLoading: isLoading, attachedFiles: attachedFiles, textareaRef: textareaRef, fileInputRef: fileInputRef, onMessageChange: onMessageChange, onSend: onSend, onStop: onStop, onFileSelect: onFileSelect, onRemoveAttachment: onRemoveAttachment }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "chat-input-wrapper",
        children: [
            attachedFiles.length > 0 && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "attachments-preview",
                children: attachedFiles.map((file, index)=>/*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "attachment-preview-item",
                        children: [
                            "\uD83D\uDCCE ",
                            file.name,
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: "remove-btn",
                                onClick: ()=>onRemoveAttachment(index),
                                disabled: isLoading,
                                children: "\xd7"
                            })
                        ]
                    }, index))
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "chat-input",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("input", {
                        type: "file",
                        multiple: true,
                        ref: fileInputRef,
                        style: {
                            display: 'none'
                        },
                        onChange: onFileSelect,
                        disabled: isLoading
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "attach-btn",
                        onClick: ()=>fileInputRef.current.click(),
                        title: "Attach files",
                        disabled: isLoading,
                        children: "\uD83D\uDCCE"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("textarea", {
                        ref: textareaRef,
                        value: message,
                        onChange: onMessageChange,
                        placeholder: "Type a message or attach a file...",
                        onKeyPress: (e)=>{
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        },
                        rows: 1,
                        disabled: isLoading
                    }),
                    isLoading ? /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "send-btn stop-btn",
                        onClick: onStop,
                        children: "Stop"
                    }) : /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "send-btn",
                        onClick: onSend,
                        disabled: !message.trim() && attachedFiles.length === 0,
                        children: "Send"
                    })
                ]
            })
        ]
    });
}
function $66ee384eb96aa146$export$8020b1ff210ef23b({ logs: logs, selectedAgent: selectedAgent, traceEndRef: traceEndRef, onClose: onClose }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "trace-sidebar",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "trace-sidebar-header",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("h2", {
                        children: "Trace Log"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "close-trace-btn",
                        onClick: onClose,
                        children: "\xd7"
                    })
                ]
            }),
            selectedAgent ? /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "trace-log-content",
                children: [
                    logs.length === 0 ? /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                        className: "trace-empty",
                        children: "Waiting for events..."
                    }) : logs.map((log, index)=>/*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: `trace-log-item event-${log.kind}`,
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "trace-header",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                            className: "trace-type",
                                            children: log.traceType
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                            className: "trace-timestamp",
                                            children: log.timestamp
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                    className: "trace-summary",
                                    children: log.summary
                                }),
                                log.details && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                    className: "trace-details",
                                    children: log.details
                                })
                            ]
                        }, index)),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        ref: traceEndRef
                    })
                ]
            }) : /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                className: "trace-empty",
                children: "Select an agent to view logs."
            })
        ]
    });
}
function $66ee384eb96aa146$export$fddf379e22a74b00({ agents: agents, onSelectAgent: onSelectAgent }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "empty-state",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "empty-state-icon",
                children: "\uD83E\uDD16"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                children: "Select an Agent"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                children: "Choose an agent from the list to start a conversation."
            }),
            agents.length > 0 && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "empty-state-agents",
                children: agents.slice(0, 4).map((agent)=>/*#__PURE__*/ (0, $5OpyM$jsxs)("button", {
                        className: "empty-state-agent-btn",
                        onClick: ()=>onSelectAgent(agent.id),
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)($66ee384eb96aa146$export$eaa9dcd62e0d5ec6, {
                                status: agent.status
                            }),
                            agent.name
                        ]
                    }, agent.id))
            })
        ]
    });
}
function $66ee384eb96aa146$export$7b296a6d2fce609e({ evaluation: evaluation }) {
    const getScoreColor = (score, maxScore = 10)=>{
        const percentage = score / maxScore * 100;
        if (percentage >= 80) return '#10b981'; // green
        if (percentage >= 60) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };
    const formatScore = (score)=>{
        if (typeof score === 'number') return score % 1 === 0 ? score.toString() : score.toFixed(1);
        return score;
    };
    const renderMetric = (label, value, maxScore = 10)=>{
        if (value === null || value === undefined) return null;
        return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
            className: "evaluation-metric",
            children: [
                /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                    className: "evaluation-label",
                    children: [
                        label,
                        ":"
                    ]
                }),
                /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                    className: "evaluation-value",
                    style: {
                        color: getScoreColor(value, maxScore)
                    },
                    children: [
                        formatScore(value),
                        maxScore === 10 ? '/10' : ''
                    ]
                })
            ]
        });
    };
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "evaluation-display",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "evaluation-header",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "evaluation-icon",
                        children: "\uD83D\uDCCA"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "evaluation-title",
                        children: "Response Quality"
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "evaluation-metrics",
                children: [
                    renderMetric('BLEU Score', evaluation.bleu_score),
                    renderMetric('ROUGE Score', evaluation.rouge_score),
                    renderMetric('Recall', evaluation.recall_score),
                    renderMetric('Clarity', evaluation.clarity_score),
                    renderMetric('Empathy', evaluation.empathy_score),
                    renderMetric('Quality', evaluation.quality_score),
                    renderMetric('Accuracy', evaluation.accuracy_score),
                    renderMetric('Context Recall', evaluation.context_recall),
                    renderMetric('Precision', evaluation.precision_score),
                    renderMetric('Relevance', evaluation.relevance_score),
                    renderMetric('Sentiment', evaluation.sentiment_score),
                    renderMetric('Formality', evaluation.formality_score),
                    renderMetric('Readability', evaluation.readability_score),
                    renderMetric('Completeness', evaluation.completeness_score),
                    renderMetric('Coherence', evaluation.coherence_score),
                    renderMetric('Context Adherence', evaluation.context_adherence),
                    renderMetric('Context Precision', evaluation.context_precision),
                    renderMetric('Context Relevance', evaluation.context_relevance),
                    renderMetric('Intent Confidence', evaluation.intent_confidence),
                    renderMetric('Satisfaction', evaluation.satisfaction_score),
                    renderMetric('Perplexity', evaluation.perplexity_score, 100),
                    renderMetric('Hallucination', evaluation.hallucination_score),
                    renderMetric('Toxicity', evaluation.toxicity_score),
                    evaluation.overall_assessment && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "evaluation-assessment",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("strong", {
                                children: "Assessment:"
                            }),
                            " ",
                            evaluation.overall_assessment
                        ]
                    }),
                    evaluation.detected_intent && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "evaluation-intent",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("strong", {
                                children: "Intent:"
                            }),
                            " ",
                            evaluation.detected_intent
                        ]
                    }),
                    evaluation.complexity_level && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "evaluation-complexity",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("strong", {
                                children: "Complexity:"
                            }),
                            " ",
                            evaluation.complexity_level
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "evaluation-flags",
                        children: [
                            evaluation.is_low_quality !== undefined && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: `evaluation-flag ${evaluation.is_low_quality ? 'low-quality' : 'good-quality'}`,
                                children: evaluation.is_low_quality ? "\u26A0\uFE0F Low Quality" : "\u2705 Good Quality"
                            }),
                            evaluation.has_code_example !== undefined && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "evaluation-flag",
                                children: evaluation.has_code_example ? "\uD83D\uDCBB Has Code" : "\uD83D\uDCDD No Code"
                            }),
                            evaluation.has_structured_format !== undefined && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "evaluation-flag",
                                children: evaluation.has_structured_format ? "\uD83D\uDCCB Structured" : "\uD83D\uDCC4 Unstructured"
                            }),
                            evaluation.hallucination_detected !== undefined && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: `evaluation-flag ${evaluation.hallucination_detected ? 'hallucination' : 'no-hallucination'}`,
                                children: evaluation.hallucination_detected ? "\uD83E\uDD16 Hallucination" : "\uD83C\uDFAF No Hallucination"
                            })
                        ]
                    })
                ]
            })
        ]
    });
}





// ─── Helpers ──────────────────────────────────────────────────────────────────
const $7dced7559e9c1dad$var$avg = (arr, key)=>arr.length ? arr.reduce((s, e)=>s + (e?.[key] ?? 0), 0) / arr.length : 0;
const $7dced7559e9c1dad$var$evalAvg = (evals, key)=>evals.length ? evals.reduce((s, e)=>s + (e.evaluation_data?.[key] ?? 0), 0) / evals.length : 0;
const $7dced7559e9c1dad$var$scoreColor = (v, max = 10)=>{
    const pct = v / max;
    if (pct >= 0.85) return 'var(--oai-success, #10b981)';
    if (pct >= 0.65) return 'var(--oai-warning, #f59e0b)';
    return 'var(--oai-error, #ef4444)';
};
const $7dced7559e9c1dad$var$fmt2 = (n)=>typeof n === 'number' ? n.toFixed(2) : "\u2013";
const $7dced7559e9c1dad$var$fmtPct = (n, tot)=>tot ? `${(n / tot * 100).toFixed(1)}%` : '0%';
const $7dced7559e9c1dad$var$fmtK = (n)=>{
    if (typeof n !== 'number') return "\u2013";
    if (n < 1000) return n.toString();
    return `${(n / 1000).toFixed(1)}k`;
};
// ─── Sub-components ───────────────────────────────────────────────────────────
function $7dced7559e9c1dad$var$StatCard({ label: label, value: value, sub: sub, accent: accent }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "metric-item",
        style: {
            borderLeft: `3px solid ${accent || 'var(--oai-primary)'}`
        },
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "metric-label",
                        children: label
                    }),
                    sub && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        style: {
                            fontSize: 11,
                            color: 'var(--oai-text-disabled)',
                            marginTop: 4,
                            display: 'block'
                        },
                        children: sub
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                className: "metric-value",
                style: {
                    color: accent || 'var(--oai-primary)',
                    fontSize: 22
                },
                children: value
            })
        ]
    });
}
function $7dced7559e9c1dad$var$SectionTitle({ children: children, badge: badge }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 14,
            marginTop: 28
        },
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                style: {
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--oai-text-muted)'
                },
                children: children
            }),
            badge && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                style: {
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'var(--oai-primary-dim, rgba(56,190,255,0.1))',
                    color: 'var(--oai-primary)'
                },
                children: badge
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                style: {
                    flex: 1,
                    height: 1,
                    background: 'var(--oai-border)'
                }
            })
        ]
    });
}
// Mini score pill with bar
function $7dced7559e9c1dad$var$ScoreBar({ label: label, value: value, max: max = 10 }) {
    const pct = Math.round(value / max * 100);
    const color = $7dced7559e9c1dad$var$scoreColor(value, max);
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 0'
        },
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                style: {
                    width: 130,
                    fontSize: 12,
                    color: 'var(--oai-text-muted)',
                    flexShrink: 0
                },
                children: label
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                style: {
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--oai-border)',
                    overflow: 'hidden'
                },
                children: /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                    style: {
                        width: `${pct}%`,
                        height: '100%',
                        background: color,
                        borderRadius: 3,
                        transition: 'width 0.6s ease'
                    }
                })
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                style: {
                    width: 36,
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    color: color,
                    textAlign: 'right',
                    fontWeight: 600
                },
                children: $7dced7559e9c1dad$var$fmt2(value)
            })
        ]
    });
}
// Custom tooltip for charts
const $7dced7559e9c1dad$var$DarkTooltip = ({ active: active, payload: payload, label: label })=>{
    if (!active || !payload?.length) return null;
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        style: {
            background: 'var(--oai-surface)',
            border: '1px solid var(--oai-border)',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        },
        children: [
            label && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                style: {
                    color: 'var(--oai-text-muted)',
                    marginBottom: 4
                },
                children: label
            }),
            payload.map((p, i)=>/*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                    style: {
                        color: p.color,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600
                    },
                    children: [
                        p.name,
                        ": ",
                        typeof p.value === 'number' ? p.value.toFixed(2) : p.value
                    ]
                }, i))
        ]
    });
};
// ─── Tabs ─────────────────────────────────────────────────────────────────────
const $7dced7559e9c1dad$var$TABS = [
    'Overview',
    'Performance',
    'Quality',
    'ML Scores',
    'Recent'
];
function $7dced7559e9c1dad$export$bfaab4c9bb3364f({ agentEndpoint: agentEndpoint, authToken: authToken = 'dummy-token' }) {
    const [activeTab, setActiveTab] = (0, $5OpyM$useState)('Overview');
    const [agentFilter, setAgentFilter] = (0, $5OpyM$useState)('all');
    const [loading, setLoading] = (0, $5OpyM$useState)(true);
    const [data, setData] = (0, $5OpyM$useState)([]);
    const [stats, setStats] = (0, $5OpyM$useState)({});
    const [error, setError] = (0, $5OpyM$useState)(null);
    const [lastRefreshed, setLastRefreshed] = (0, $5OpyM$useState)(null);
    const fetchData = (0, $5OpyM$useCallback)(async ()=>{
        if (!agentEndpoint) return;
        setLoading(true);
        setError(null);
        try {
            const baseUrl = agentEndpoint.replace(/\/a2a\/?$/, '');
            const evalsUrl = `${baseUrl}/evaluations/agent`;
            const statsUrl = `${baseUrl}/logs/stats`;
            const [evalsRes, statsRes] = await Promise.all([
                fetch(evalsUrl, {
                    cache: 'no-cache',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json'
                    }
                }),
                fetch(statsUrl, {
                    cache: 'no-cache',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json'
                    }
                })
            ]);
            if (!evalsRes.ok) throw new Error(`Evaluations: ${evalsRes.status} ${evalsRes.statusText}`);
            const evalsJson = await evalsRes.json();
            setData(Array.isArray(evalsJson) ? evalsJson : []);
            if (statsRes.ok) {
                const statsJson = await statsRes.json();
                setStats(statsJson.statistics);
            } else console.warn(`Could not load agent stats: ${statsRes.status}`);
            setLastRefreshed(new Date());
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    }, [
        agentEndpoint,
        authToken
    ]);
    (0, $5OpyM$useEffect)(()=>{
        fetchData();
    }, [
        fetchData
    ]);
    // Unique agents
    const agents = (0, $5OpyM$useMemo)(()=>[
            'all',
            ...new Set(data.map((e)=>e.agent_name).filter(Boolean))
        ], [
        data
    ]);
    // Filtered evals
    const evals = (0, $5OpyM$useMemo)(()=>agentFilter === 'all' ? data : data.filter((e)=>e.agent_name === agentFilter), [
        data,
        agentFilter
    ]);
    const sorted = (0, $5OpyM$useMemo)(()=>[
            ...evals
        ].sort((a, b)=>new Date(a.timestamp) - new Date(b.timestamp)), [
        evals
    ]);
    // ── Aggregate KPIs ──────────────────────────────────────────────────────
    const total = evals.length;
    const avgQuality = $7dced7559e9c1dad$var$avg(evals, 'quality_score');
    const halluCount = evals.filter((e)=>e.hallucination_detected).length;
    const halluRate = $7dced7559e9c1dad$var$fmtPct(halluCount, total);
    const lowQuality = evals.filter((e)=>e.evaluation_data?.is_low_quality).length;
    const avgSatisfaction = $7dced7559e9c1dad$var$evalAvg(evals, 'satisfaction_score');
    const avgCoherence = $7dced7559e9c1dad$var$evalAvg(evals, 'coherence_score');
    const avgAccuracy = $7dced7559e9c1dad$var$evalAvg(evals, 'accuracy_score');
    const avgToxicity = $7dced7559e9c1dad$var$evalAvg(evals, 'toxicity_score');
    const avgBLEU = $7dced7559e9c1dad$var$evalAvg(evals, 'bleu_score');
    const avgROUGE = $7dced7559e9c1dad$var$evalAvg(evals, 'rouge_score');
    const avgPerplexity = $7dced7559e9c1dad$var$evalAvg(evals, 'perplexity_score');
    // ── Chart Data ──────────────────────────────────────────────────────────
    // Quality over time
    const timelineData = sorted.map((e, i)=>({
            name: `#${i + 1}`,
            quality: e.quality_score,
            satisfaction: e.evaluation_data?.satisfaction_score ?? 0,
            accuracy: e.evaluation_data?.accuracy_score ?? 0,
            coherence: e.evaluation_data?.coherence_score ?? 0,
            ts: new Date(e.timestamp).toLocaleDateString()
        }));
    // Radar: performance profile
    const radarKeys = [
        'clarity_score',
        'accuracy_score',
        'relevance_score',
        'empathy_score',
        'coherence_score',
        'completeness_score',
        'formality_score'
    ];
    const radarData = radarKeys.map((k)=>({
            subject: k.replace('_score', '').replace(/\b\w/g, (l)=>l.toUpperCase()),
            value: parseFloat($7dced7559e9c1dad$var$evalAvg(evals, k).toFixed(2)),
            fullMark: 10
        }));
    // Score distribution histogram (0-10)
    const distBuckets = Array.from({
        length: 11
    }, (_, i)=>({
            score: i,
            count: 0
        }));
    evals.forEach((e)=>{
        const s = Math.round(e.quality_score ?? 0);
        if (distBuckets[s]) distBuckets[s].count++;
    });
    // ML scores bar
    const mlData = [
        {
            name: 'BLEU',
            value: parseFloat((avgBLEU * 10).toFixed(2))
        },
        {
            name: 'ROUGE',
            value: parseFloat((avgROUGE * 10).toFixed(2))
        },
        {
            name: 'Recall',
            value: parseFloat($7dced7559e9c1dad$var$evalAvg(evals, 'recall_score').toFixed(2))
        },
        {
            name: 'Precision',
            value: parseFloat($7dced7559e9c1dad$var$evalAvg(evals, 'precision_score').toFixed(2))
        },
        {
            name: 'Context\nRecall',
            value: parseFloat($7dced7559e9c1dad$var$evalAvg(evals, 'context_recall').toFixed(2))
        },
        {
            name: 'Ctx\nPrecision',
            value: parseFloat($7dced7559e9c1dad$var$evalAvg(evals, 'context_precision').toFixed(2))
        },
        {
            name: 'Ctx\nAdherence',
            value: parseFloat($7dced7559e9c1dad$var$evalAvg(evals, 'context_adherence').toFixed(2))
        }
    ];
    // Hallucination pie
    const pieData = [
        {
            name: 'Clean',
            value: total - halluCount
        },
        {
            name: 'Hallucination',
            value: halluCount
        }
    ];
    const PIE_COLORS = [
        'var(--oai-success,#10b981)',
        'var(--oai-error,#ef4444)'
    ];
    // Complexity breakdown
    const complexityMap = evals.reduce((acc, e)=>{
        const c = e.evaluation_data?.complexity_level || 'unknown';
        acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {});
    const complexityData = Object.entries(complexityMap).map(([name, value])=>({
            name: name,
            value: value
        }));
    const COMPLEXITY_COLORS = [
        '#38beff',
        '#8b5cf6',
        '#f59e0b',
        '#10b981'
    ];
    // Agent comparison (if multiple agents)
    const agentComparison = (0, $5OpyM$useMemo)(()=>{
        const agentNames = [
            ...new Set(data.map((e)=>e.agent_name).filter(Boolean))
        ];
        return agentNames.map((name)=>{
            const ag = data.filter((e)=>e.agent_name === name);
            return {
                name: name,
                quality: parseFloat($7dced7559e9c1dad$var$avg(ag, 'quality_score').toFixed(2)),
                satisfaction: parseFloat($7dced7559e9c1dad$var$evalAvg(ag, 'satisfaction_score').toFixed(2)),
                accuracy: parseFloat($7dced7559e9c1dad$var$evalAvg(ag, 'accuracy_score').toFixed(2)),
                hallucinations: ag.filter((e)=>e.hallucination_detected).length,
                count: ag.length
            };
        });
    }, [
        data
    ]);
    // Recent evals table
    const recent = [
        ...sorted
    ].reverse().slice(0, 10);
    if (loading) return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "metrics-empty",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                style: {
                    fontSize: 32
                },
                children: "\uD83D\uDCCA"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                children: "Loading metrics..."
            })
        ]
    });
    if (error) return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "metrics-empty",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                style: {
                    fontSize: 32
                },
                children: "\uD83D\uDCCA"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                children: `Failed to load: ${error}`
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                onClick: fetchData,
                style: {
                    marginTop: 12
                },
                children: "Retry"
            })
        ]
    });
    if (data.length === 0 && Object.keys(stats).length === 0) return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "metrics-empty",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                style: {
                    fontSize: 32
                },
                children: "\uD83D\uDCCA"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                children: "No evaluation data available."
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                onClick: fetchData,
                style: {
                    marginTop: 12
                },
                children: "Refresh"
            })
        ]
    });
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        style: {
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        },
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                style: {
                    flexShrink: 0,
                    background: 'var(--oai-bg)',
                    borderBottom: '1px solid var(--oai-border)',
                    padding: '16px 20px 0',
                    zIndex: 10
                },
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 14,
                            gap: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                style: {
                                    minWidth: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("h2", {
                                        style: {
                                            margin: 0,
                                            fontSize: 16,
                                            fontWeight: 700,
                                            color: 'var(--oai-text-main)',
                                            whiteSpace: 'nowrap'
                                        },
                                        children: "Agent Evaluation Dashboard"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                                        style: {
                                            fontSize: 11,
                                            color: 'var(--oai-text-disabled)'
                                        },
                                        children: [
                                            total,
                                            " evaluations \xb7 ",
                                            agents.length - 1,
                                            " agent",
                                            agents.length > 2 ? 's' : '',
                                            lastRefreshed && ` \xb7 updated ${lastRefreshed.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}`
                                        ]
                                    })
                                ]
                            }),
                            agents.length > 2 && /*#__PURE__*/ (0, $5OpyM$jsx)("select", {
                                value: agentFilter,
                                onChange: (e)=>setAgentFilter(e.target.value),
                                style: {
                                    background: 'var(--oai-input-bg)',
                                    border: '1px solid var(--oai-input-border)',
                                    borderRadius: 6,
                                    color: 'var(--oai-text)',
                                    fontSize: 12,
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    flexShrink: 0
                                },
                                children: agents.map((a)=>/*#__PURE__*/ (0, $5OpyM$jsx)("option", {
                                        value: a,
                                        children: a === 'all' ? 'All Agents' : a
                                    }, a))
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("button", {
                                onClick: fetchData,
                                disabled: loading || !agentEndpoint,
                                title: "Refresh metrics",
                                style: {
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '5px 12px',
                                    borderRadius: 6,
                                    border: '1px solid var(--oai-input-border)',
                                    background: loading ? 'var(--oai-primary-dim, rgba(56,190,255,0.1))' : 'var(--oai-input-bg)',
                                    color: loading ? 'var(--oai-primary)' : 'var(--oai-text-muted)',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    fontFamily: 'var(--font-sans)',
                                    cursor: loading || !agentEndpoint ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.18s ease',
                                    letterSpacing: '0.01em'
                                },
                                onMouseEnter: (e)=>{
                                    if (!loading && agentEndpoint) {
                                        e.currentTarget.style.borderColor = 'var(--oai-primary)';
                                        e.currentTarget.style.color = 'var(--oai-primary)';
                                    }
                                },
                                onMouseLeave: (e)=>{
                                    if (!loading && agentEndpoint) {
                                        e.currentTarget.style.borderColor = 'var(--oai-input-border)';
                                        e.currentTarget.style.color = 'var(--oai-text-muted)';
                                    }
                                },
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("svg", {
                                        width: "13",
                                        height: "13",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2.2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        style: {
                                            flexShrink: 0,
                                            animation: loading ? 'metricsRefreshSpin 0.7s linear infinite' : 'none'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("polyline", {
                                                points: "23 4 23 10 17 10"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("polyline", {
                                                points: "1 20 1 14 7 14"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("path", {
                                                d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                                            })
                                        ]
                                    }),
                                    loading ? "Refreshing\u2026" : 'Refresh',
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("style", {
                                        children: `@keyframes metricsRefreshSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        style: {
                            display: 'flex',
                            gap: 2,
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        },
                        children: $7dced7559e9c1dad$var$TABS.map((t)=>/*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                onClick: ()=>setActiveTab(t),
                                style: {
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                    padding: '8px 16px',
                                    borderRadius: '6px 6px 0 0',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    border: 'none',
                                    borderBottom: activeTab === t ? '2px solid var(--oai-primary)' : '2px solid transparent',
                                    background: activeTab === t ? 'var(--oai-primary-dim, rgba(56,190,255,0.1))' : 'transparent',
                                    color: activeTab === t ? 'var(--oai-primary)' : 'var(--oai-text-muted)',
                                    transition: 'all 0.15s ease',
                                    letterSpacing: '0.02em',
                                    marginBottom: -1
                                },
                                children: t
                            }, t))
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "metrics-panel",
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    fontFamily: 'var(--font-sans)'
                },
                children: [
                    activeTab === 'Overview' && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                className: "metrics-grid",
                                style: {
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'
                                },
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$StatCard, {
                                        label: "Total Interactions",
                                        value: stats.total_interactions ?? "\u2013",
                                        sub: "across all sessions"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$StatCard, {
                                        label: "Unique Sessions",
                                        value: stats.unique_sessions ?? "\u2013"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$StatCard, {
                                        label: "Avg Response Time",
                                        value: `${(stats.avg_response_time_ms / 1000).toFixed(2)}s` ?? "\u2013"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$StatCard, {
                                        label: "Total Tokens",
                                        value: $7dced7559e9c1dad$var$fmtK(stats.total_tokens_sum),
                                        sub: "consumed"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$StatCard, {
                                        label: "Avg Quality Score",
                                        value: `${avgQuality.toFixed(1)}/10`,
                                        accent: $7dced7559e9c1dad$var$scoreColor(avgQuality),
                                        sub: avgQuality >= 8 ? 'Excellent' : avgQuality >= 6 ? 'Good' : 'Needs Work'
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$StatCard, {
                                        label: "Hallucination Rate",
                                        value: halluRate,
                                        accent: halluCount === 0 ? '#10b981' : halluCount / total > 0.1 ? '#ef4444' : '#f59e0b',
                                        sub: `${halluCount} detected`
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$StatCard, {
                                        label: "Avg Satisfaction",
                                        value: `${avgSatisfaction.toFixed(1)}/10`,
                                        accent: $7dced7559e9c1dad$var$scoreColor(avgSatisfaction)
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                badge: `${total} evals`,
                                children: "Trend Overview"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr',
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                style: {
                                                    margin: '0 0 12px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--oai-text)'
                                                },
                                                children: "Quality Score Over Time"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                                width: "100%",
                                                height: 240,
                                                children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$AreaChart), {
                                                    data: timelineData,
                                                    margin: {
                                                        top: 4,
                                                        right: 12,
                                                        left: -10,
                                                        bottom: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)("defs", {
                                                            children: /*#__PURE__*/ (0, $5OpyM$jsxs)("linearGradient", {
                                                                id: "qualGrad",
                                                                x1: "0",
                                                                y1: "0",
                                                                x2: "0",
                                                                y2: "1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("stop", {
                                                                        offset: "5%",
                                                                        stopColor: "#38beff",
                                                                        stopOpacity: 0.3
                                                                    }),
                                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("stop", {
                                                                        offset: "95%",
                                                                        stopColor: "#38beff",
                                                                        stopOpacity: 0
                                                                    })
                                                                ]
                                                            })
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$CartesianGrid), {
                                                            strokeDasharray: "3 3",
                                                            stroke: "var(--oai-border)"
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$XAxis), {
                                                            dataKey: "name",
                                                            tick: {
                                                                fontSize: 10,
                                                                fill: 'var(--oai-text-disabled)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$YAxis), {
                                                            domain: [
                                                                0,
                                                                10
                                                            ],
                                                            tick: {
                                                                fontSize: 10,
                                                                fill: 'var(--oai-text-disabled)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                            content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ReferenceLine), {
                                                            y: avgQuality,
                                                            stroke: "#38beff",
                                                            strokeDasharray: "4 2",
                                                            strokeOpacity: 0.5,
                                                            label: {
                                                                value: 'avg',
                                                                position: 'insideTopRight',
                                                                fontSize: 10,
                                                                fill: '#38beff'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Area), {
                                                            type: "monotone",
                                                            dataKey: "quality",
                                                            name: "Quality",
                                                            stroke: "#38beff",
                                                            fill: "url(#qualGrad)",
                                                            strokeWidth: 2,
                                                            dot: false,
                                                            activeDot: {
                                                                r: 5
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Area), {
                                                            type: "monotone",
                                                            dataKey: "satisfaction",
                                                            name: "Satisfaction",
                                                            stroke: "#8b5cf6",
                                                            fill: "none",
                                                            strokeWidth: 1.5,
                                                            strokeDasharray: "4 2",
                                                            dot: false
                                                        })
                                                    ]
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                className: "chart-card",
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                        style: {
                                                            margin: '0 0 12px',
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: 'var(--oai-text)'
                                                        },
                                                        children: "Hallucination"
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                                        width: "100%",
                                                        height: 140,
                                                        children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$PieChart), {
                                                            children: [
                                                                /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Pie), {
                                                                    data: pieData,
                                                                    cx: "50%",
                                                                    cy: "50%",
                                                                    innerRadius: 40,
                                                                    outerRadius: 60,
                                                                    dataKey: "value",
                                                                    paddingAngle: 3,
                                                                    children: pieData.map((_, i)=>/*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Cell), {
                                                                            fill: PIE_COLORS[i]
                                                                        }, i))
                                                                }),
                                                                /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                                    content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                                }),
                                                                /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Legend), {
                                                                    iconSize: 8,
                                                                    wrapperStyle: {
                                                                        fontSize: 11
                                                                    }
                                                                })
                                                            ]
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                className: "chart-card",
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                        style: {
                                                            margin: '0 0 12px',
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: 'var(--oai-text)'
                                                        },
                                                        children: "Complexity Mix"
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                                        width: "100%",
                                                        height: 120,
                                                        children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$PieChart), {
                                                            children: [
                                                                /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Pie), {
                                                                    data: complexityData,
                                                                    cx: "50%",
                                                                    cy: "50%",
                                                                    outerRadius: 50,
                                                                    dataKey: "value",
                                                                    children: complexityData.map((_, i)=>/*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Cell), {
                                                                            fill: COMPLEXITY_COLORS[i % COMPLEXITY_COLORS.length]
                                                                        }, i))
                                                                }),
                                                                /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                                    content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                                }),
                                                                /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Legend), {
                                                                    iconSize: 8,
                                                                    wrapperStyle: {
                                                                        fontSize: 11
                                                                    }
                                                                })
                                                            ]
                                                        })
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            agentComparison.length > 1 && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                        children: "Agent Comparison"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "chart-card",
                                        children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                            width: "100%",
                                            height: 220,
                                            children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$BarChart), {
                                                data: agentComparison,
                                                margin: {
                                                    top: 4,
                                                    right: 12,
                                                    left: -10,
                                                    bottom: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$CartesianGrid), {
                                                        strokeDasharray: "3 3",
                                                        stroke: "var(--oai-border)"
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$XAxis), {
                                                        dataKey: "name",
                                                        tick: {
                                                            fontSize: 11,
                                                            fill: 'var(--oai-text-muted)'
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$YAxis), {
                                                        domain: [
                                                            0,
                                                            10
                                                        ],
                                                        tick: {
                                                            fontSize: 10,
                                                            fill: 'var(--oai-text-disabled)'
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                        content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Legend), {
                                                        wrapperStyle: {
                                                            fontSize: 11
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Bar), {
                                                        dataKey: "quality",
                                                        name: "Quality",
                                                        fill: "#38beff",
                                                        radius: [
                                                            3,
                                                            3,
                                                            0,
                                                            0
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Bar), {
                                                        dataKey: "accuracy",
                                                        name: "Accuracy",
                                                        fill: "#8b5cf6",
                                                        radius: [
                                                            3,
                                                            3,
                                                            0,
                                                            0
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Bar), {
                                                        dataKey: "satisfaction",
                                                        name: "Satisfaction",
                                                        fill: "#10b981",
                                                        radius: [
                                                            3,
                                                            3,
                                                            0,
                                                            0
                                                        ]
                                                    })
                                                ]
                                            })
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    activeTab === 'Performance' && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                children: "Performance Profile (Radar)"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                style: {
                                                    margin: '0 0 12px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--oai-text)'
                                                },
                                                children: "Avg Score by Dimension"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                                width: "100%",
                                                height: 300,
                                                children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$RadarChart), {
                                                    data: radarData,
                                                    cx: "50%",
                                                    cy: "50%",
                                                    outerRadius: "75%",
                                                    children: [
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$PolarGrid), {
                                                            stroke: "var(--oai-border)"
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$PolarAngleAxis), {
                                                            dataKey: "subject",
                                                            tick: {
                                                                fontSize: 11,
                                                                fill: 'var(--oai-text-muted)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$PolarRadiusAxis), {
                                                            angle: 30,
                                                            domain: [
                                                                0,
                                                                10
                                                            ],
                                                            tick: {
                                                                fontSize: 9,
                                                                fill: 'var(--oai-text-disabled)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Radar), {
                                                            name: "Avg Score",
                                                            dataKey: "value",
                                                            stroke: "#38beff",
                                                            fill: "#38beff",
                                                            fillOpacity: 0.25,
                                                            strokeWidth: 2
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                            content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                        })
                                                    ]
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                style: {
                                                    margin: '0 0 16px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--oai-text)'
                                                },
                                                children: "Score Breakdown"
                                            }),
                                            [
                                                [
                                                    'Clarity',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'clarity_score')
                                                ],
                                                [
                                                    'Accuracy',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'accuracy_score')
                                                ],
                                                [
                                                    'Relevance',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'relevance_score')
                                                ],
                                                [
                                                    'Empathy',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'empathy_score')
                                                ],
                                                [
                                                    'Coherence',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'coherence_score')
                                                ],
                                                [
                                                    'Completeness',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'completeness_score')
                                                ],
                                                [
                                                    'Formality',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'formality_score')
                                                ],
                                                [
                                                    'Readability',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'readability_score')
                                                ],
                                                [
                                                    'Satisfaction',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'satisfaction_score')
                                                ],
                                                [
                                                    'Sentiment',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'sentiment_score')
                                                ]
                                            ].map(([label, value])=>/*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$ScoreBar, {
                                                    label: label,
                                                    value: value
                                                }, label))
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                children: "Multi-Metric Trend"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                className: "chart-card",
                                children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                    width: "100%",
                                    height: 260,
                                    children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$LineChart), {
                                        data: timelineData,
                                        margin: {
                                            top: 4,
                                            right: 12,
                                            left: -10,
                                            bottom: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$CartesianGrid), {
                                                strokeDasharray: "3 3",
                                                stroke: "var(--oai-border)"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$XAxis), {
                                                dataKey: "name",
                                                tick: {
                                                    fontSize: 10,
                                                    fill: 'var(--oai-text-disabled)'
                                                }
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$YAxis), {
                                                domain: [
                                                    0,
                                                    10
                                                ],
                                                tick: {
                                                    fontSize: 10,
                                                    fill: 'var(--oai-text-disabled)'
                                                }
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Legend), {
                                                wrapperStyle: {
                                                    fontSize: 11
                                                }
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Line), {
                                                type: "monotone",
                                                dataKey: "quality",
                                                name: "Quality",
                                                stroke: "#38beff",
                                                strokeWidth: 2,
                                                dot: false
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Line), {
                                                type: "monotone",
                                                dataKey: "satisfaction",
                                                name: "Satisfaction",
                                                stroke: "#8b5cf6",
                                                strokeWidth: 1.5,
                                                dot: false,
                                                strokeDasharray: "4 2"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Line), {
                                                type: "monotone",
                                                dataKey: "accuracy",
                                                name: "Accuracy",
                                                stroke: "#10b981",
                                                strokeWidth: 1.5,
                                                dot: false,
                                                strokeDasharray: "2 2"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Line), {
                                                type: "monotone",
                                                dataKey: "coherence",
                                                name: "Coherence",
                                                stroke: "#f59e0b",
                                                strokeWidth: 1.5,
                                                dot: false,
                                                strokeDasharray: "6 2"
                                            })
                                        ]
                                    })
                                })
                            })
                        ]
                    }),
                    activeTab === 'Quality' && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                children: "Quality Score Distribution"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                style: {
                                                    margin: '0 0 12px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--oai-text)'
                                                },
                                                children: "Histogram (0\u201310)"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                                width: "100%",
                                                height: 240,
                                                children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$BarChart), {
                                                    data: distBuckets,
                                                    margin: {
                                                        top: 4,
                                                        right: 12,
                                                        left: -10,
                                                        bottom: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$CartesianGrid), {
                                                            strokeDasharray: "3 3",
                                                            stroke: "var(--oai-border)"
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$XAxis), {
                                                            dataKey: "score",
                                                            tick: {
                                                                fontSize: 11,
                                                                fill: 'var(--oai-text-muted)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$YAxis), {
                                                            allowDecimals: false,
                                                            tick: {
                                                                fontSize: 10,
                                                                fill: 'var(--oai-text-disabled)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                            content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Bar), {
                                                            dataKey: "count",
                                                            name: "Count",
                                                            radius: [
                                                                3,
                                                                3,
                                                                0,
                                                                0
                                                            ],
                                                            children: distBuckets.map((entry, i)=>/*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Cell), {
                                                                    fill: $7dced7559e9c1dad$var$scoreColor(entry.score)
                                                                }, i))
                                                        })
                                                    ]
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                style: {
                                                    margin: '0 0 16px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--oai-text)'
                                                },
                                                children: "Quality Health"
                                            }),
                                            [
                                                {
                                                    label: "High Quality (\u22658)",
                                                    count: evals.filter((e)=>e.quality_score >= 8).length,
                                                    color: '#10b981'
                                                },
                                                {
                                                    label: "Medium Quality (5\u20137)",
                                                    count: evals.filter((e)=>e.quality_score >= 5 && e.quality_score < 8).length,
                                                    color: '#f59e0b'
                                                },
                                                {
                                                    label: 'Low Quality (<5)',
                                                    count: evals.filter((e)=>e.quality_score < 5).length,
                                                    color: '#ef4444'
                                                },
                                                {
                                                    label: 'Hallucinations',
                                                    count: halluCount,
                                                    color: '#f59e0b'
                                                },
                                                {
                                                    label: 'Has Structured Format',
                                                    count: evals.filter((e)=>e.evaluation_data?.has_structured_format).length,
                                                    color: '#8b5cf6'
                                                },
                                                {
                                                    label: 'Has Code Example',
                                                    count: evals.filter((e)=>e.evaluation_data?.has_code_example).length,
                                                    color: '#38beff'
                                                }
                                            ].map(({ label: label, count: count, color: color })=>/*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '8px 0',
                                                        borderBottom: '1px solid var(--oai-border)'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                            style: {
                                                                fontSize: 12,
                                                                color: 'var(--oai-text-muted)'
                                                            },
                                                            children: label
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 8
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                    style: {
                                                                        fontSize: 12,
                                                                        color: 'var(--oai-text-disabled)'
                                                                    },
                                                                    children: $7dced7559e9c1dad$var$fmtPct(count, total)
                                                                }),
                                                                /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                    style: {
                                                                        fontFamily: 'var(--font-mono)',
                                                                        fontWeight: 700,
                                                                        fontSize: 14,
                                                                        color: color,
                                                                        minWidth: 28,
                                                                        textAlign: 'right'
                                                                    },
                                                                    children: count
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, label))
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                children: "Perplexity Score (lower = better)"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                className: "chart-card",
                                children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                    width: "100%",
                                    height: 200,
                                    children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$AreaChart), {
                                        data: sorted.map((e, i)=>({
                                                name: `#${i + 1}`,
                                                perplexity: e.evaluation_data?.perplexity_score ?? 0
                                            })),
                                        margin: {
                                            top: 4,
                                            right: 12,
                                            left: -10,
                                            bottom: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("defs", {
                                                children: /*#__PURE__*/ (0, $5OpyM$jsxs)("linearGradient", {
                                                    id: "perpGrad",
                                                    x1: "0",
                                                    y1: "0",
                                                    x2: "0",
                                                    y2: "1",
                                                    children: [
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)("stop", {
                                                            offset: "5%",
                                                            stopColor: "#f59e0b",
                                                            stopOpacity: 0.3
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)("stop", {
                                                            offset: "95%",
                                                            stopColor: "#f59e0b",
                                                            stopOpacity: 0
                                                        })
                                                    ]
                                                })
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$CartesianGrid), {
                                                strokeDasharray: "3 3",
                                                stroke: "var(--oai-border)"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$XAxis), {
                                                dataKey: "name",
                                                tick: {
                                                    fontSize: 10,
                                                    fill: 'var(--oai-text-disabled)'
                                                }
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$YAxis), {
                                                tick: {
                                                    fontSize: 10,
                                                    fill: 'var(--oai-text-disabled)'
                                                }
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Area), {
                                                type: "monotone",
                                                dataKey: "perplexity",
                                                name: "Perplexity",
                                                stroke: "#f59e0b",
                                                fill: "url(#perpGrad)",
                                                strokeWidth: 2,
                                                dot: false
                                            })
                                        ]
                                    })
                                })
                            })
                        ]
                    }),
                    activeTab === 'ML Scores' && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                badge: "NLP metrics",
                                children: "ML Performance Metrics"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                style: {
                                                    margin: '0 0 12px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--oai-text)'
                                                },
                                                children: "Avg NLP Scores (normalised /10)"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                                width: "100%",
                                                height: 260,
                                                children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$BarChart), {
                                                    data: mlData,
                                                    layout: "vertical",
                                                    margin: {
                                                        top: 4,
                                                        right: 20,
                                                        left: 30,
                                                        bottom: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$CartesianGrid), {
                                                            strokeDasharray: "3 3",
                                                            stroke: "var(--oai-border)"
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$XAxis), {
                                                            type: "number",
                                                            domain: [
                                                                0,
                                                                10
                                                            ],
                                                            tick: {
                                                                fontSize: 10,
                                                                fill: 'var(--oai-text-disabled)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$YAxis), {
                                                            type: "category",
                                                            dataKey: "name",
                                                            tick: {
                                                                fontSize: 11,
                                                                fill: 'var(--oai-text-muted)'
                                                            },
                                                            width: 70
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                            content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Bar), {
                                                            dataKey: "value",
                                                            name: "Score",
                                                            radius: [
                                                                0,
                                                                3,
                                                                3,
                                                                0
                                                            ],
                                                            children: mlData.map((entry, i)=>/*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Cell), {
                                                                    fill: $7dced7559e9c1dad$var$scoreColor(entry.value)
                                                                }, i))
                                                        })
                                                    ]
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                style: {
                                                    margin: '0 0 16px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--oai-text)'
                                                },
                                                children: "Context Monitoring"
                                            }),
                                            [
                                                [
                                                    'Context Recall',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'context_recall')
                                                ],
                                                [
                                                    'Context Precision',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'context_precision')
                                                ],
                                                [
                                                    'Context Adherence',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'context_adherence')
                                                ],
                                                [
                                                    'Context Relevance',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'context_relevance')
                                                ],
                                                [
                                                    'Intent Confidence',
                                                    $7dced7559e9c1dad$var$evalAvg(evals, 'intent_confidence')
                                                ]
                                            ].map(([label, value])=>/*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$ScoreBar, {
                                                    label: label,
                                                    value: value
                                                }, label)),
                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                style: {
                                                    marginTop: 20
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                        style: {
                                                            margin: '0 0 16px',
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: 'var(--oai-text)'
                                                        },
                                                        children: "Text Quality"
                                                    }),
                                                    [
                                                        [
                                                            'BLEU Score',
                                                            avgBLEU * 10
                                                        ],
                                                        [
                                                            'ROUGE Score',
                                                            avgROUGE * 10
                                                        ],
                                                        [
                                                            'Avg Perplexity',
                                                            avgPerplexity,
                                                            20
                                                        ]
                                                    ].map(([label, value, max])=>/*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$ScoreBar, {
                                                            label: label,
                                                            value: value,
                                                            max: max ?? 10
                                                        }, label))
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                children: "Hallucination Score Trend"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "chart-card",
                                        children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                            width: "100%",
                                            height: 200,
                                            children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$LineChart), {
                                                data: sorted.map((e, i)=>({
                                                        name: `#${i + 1}`,
                                                        score: e.evaluation_data?.hallucination_score ?? 0
                                                    })),
                                                margin: {
                                                    top: 4,
                                                    right: 12,
                                                    left: -10,
                                                    bottom: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$CartesianGrid), {
                                                        strokeDasharray: "3 3",
                                                        stroke: "var(--oai-border)"
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$XAxis), {
                                                        dataKey: "name",
                                                        tick: {
                                                            fontSize: 10,
                                                            fill: 'var(--oai-text-disabled)'
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$YAxis), {
                                                        domain: [
                                                            0,
                                                            1
                                                        ],
                                                        tick: {
                                                            fontSize: 10,
                                                            fill: 'var(--oai-text-disabled)'
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                        content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ReferenceLine), {
                                                        y: 0.5,
                                                        stroke: "#ef4444",
                                                        strokeDasharray: "4 2",
                                                        strokeOpacity: 0.5
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Line), {
                                                        type: "monotone",
                                                        dataKey: "score",
                                                        name: "Hallucination Score",
                                                        stroke: "#ef4444",
                                                        strokeWidth: 2,
                                                        dot: false,
                                                        activeDot: {
                                                            r: 5
                                                        }
                                                    })
                                                ]
                                            })
                                        })
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                                style: {
                                                    margin: '0 0 12px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--oai-text)'
                                                },
                                                children: "Total Tokens Consumed"
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$ResponsiveContainer), {
                                                width: "100%",
                                                height: 200,
                                                children: /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$BarChart), {
                                                    data: [
                                                        {
                                                            name: 'Tokens',
                                                            value: stats.total_tokens_sum
                                                        }
                                                    ],
                                                    margin: {
                                                        top: 4,
                                                        right: 12,
                                                        left: -10,
                                                        bottom: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$CartesianGrid), {
                                                            strokeDasharray: "3 3",
                                                            stroke: "var(--oai-border)"
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$XAxis), {
                                                            dataKey: "name",
                                                            tick: {
                                                                fontSize: 11,
                                                                fill: 'var(--oai-text-muted)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$YAxis), {
                                                            tick: {
                                                                fontSize: 10,
                                                                fill: 'var(--oai-text-disabled)'
                                                            }
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Tooltip), {
                                                            content: /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$DarkTooltip, {})
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)((0, $5OpyM$Bar), {
                                                            dataKey: "value",
                                                            name: "Tokens",
                                                            fill: "#8b5cf6",
                                                            radius: [
                                                                3,
                                                                3,
                                                                0,
                                                                0
                                                            ]
                                                        })
                                                    ]
                                                })
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    activeTab === 'Recent' && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7dced7559e9c1dad$var$SectionTitle, {
                                badge: "last 10",
                                children: "Recent Evaluations"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8
                                },
                                children: recent.map((e, i)=>{
                                    const ed = e.evaluation_data || {};
                                    const ts = new Date(e.timestamp);
                                    const hasSub = i === 0;
                                    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "chart-card",
                                        style: {
                                            borderLeft: `3px solid ${$7dced7559e9c1dad$var$scoreColor(e.quality_score)}`,
                                            display: 'grid',
                                            gridTemplateColumns: '1fr auto',
                                            gap: 12,
                                            alignItems: 'start'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            marginBottom: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                                                                style: {
                                                                    fontFamily: 'var(--font-mono)',
                                                                    fontSize: 11,
                                                                    color: 'var(--oai-text-disabled)'
                                                                },
                                                                children: [
                                                                    "#",
                                                                    e.id
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: 'var(--oai-text-muted)'
                                                                },
                                                                children: e.agent_name
                                                            }),
                                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                                                                style: {
                                                                    fontSize: 10,
                                                                    color: 'var(--oai-text-disabled)',
                                                                    marginLeft: 'auto'
                                                                },
                                                                children: [
                                                                    ts.toLocaleDateString(),
                                                                    " ",
                                                                    ts.toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    ed.overall_assessment && /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                                                        style: {
                                                            margin: '0 0 8px',
                                                            fontSize: 12,
                                                            color: 'var(--oai-text)',
                                                            lineHeight: 1.5
                                                        },
                                                        children: ed.overall_assessment
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: 6
                                                        },
                                                        children: [
                                                            e.hallucination_detected && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                className: "evaluation-flag hallucination",
                                                                children: "\u26A0 Hallucination"
                                                            }),
                                                            ed.is_low_quality && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                className: "evaluation-flag low-quality",
                                                                children: "Low Quality"
                                                            }),
                                                            !ed.is_low_quality && !e.hallucination_detected && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                className: "evaluation-flag good-quality",
                                                                children: "\u2713 Clean"
                                                            }),
                                                            ed.has_structured_format && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                style: {
                                                                    padding: '2px 6px',
                                                                    borderRadius: 4,
                                                                    fontSize: 10,
                                                                    fontWeight: 500,
                                                                    background: 'rgba(139,92,246,0.1)',
                                                                    color: '#8b5cf6'
                                                                },
                                                                children: "Structured"
                                                            }),
                                                            ed.complexity_level && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                style: {
                                                                    padding: '2px 6px',
                                                                    borderRadius: 4,
                                                                    fontSize: 10,
                                                                    fontWeight: 500,
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    color: 'var(--oai-text-muted)'
                                                                },
                                                                children: ed.complexity_level
                                                            }),
                                                            ed.detected_intent && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                style: {
                                                                    padding: '2px 6px',
                                                                    borderRadius: 4,
                                                                    fontSize: 10,
                                                                    fontWeight: 400,
                                                                    background: 'rgba(255,255,255,0.03)',
                                                                    color: 'var(--oai-text-disabled)',
                                                                    fontStyle: 'italic',
                                                                    maxWidth: 300,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                },
                                                                children: ed.detected_intent
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-end',
                                                    gap: 6,
                                                    minWidth: 80
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                        style: {
                                                            fontSize: 28,
                                                            fontFamily: 'var(--font-mono)',
                                                            fontWeight: 800,
                                                            color: $7dced7559e9c1dad$var$scoreColor(e.quality_score),
                                                            lineHeight: 1
                                                        },
                                                        children: e.quality_score
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                        style: {
                                                            fontSize: 10,
                                                            color: 'var(--oai-text-disabled)',
                                                            textAlign: 'right'
                                                        },
                                                        children: "quality"
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 2,
                                                            marginTop: 4
                                                        },
                                                        children: [
                                                            [
                                                                'Acc',
                                                                ed.accuracy_score
                                                            ],
                                                            [
                                                                'Coh',
                                                                ed.coherence_score
                                                            ],
                                                            [
                                                                'Rel',
                                                                ed.relevance_score
                                                            ]
                                                        ].map(([lbl, val])=>/*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    gap: 6,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-end'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                        style: {
                                                                            fontSize: 10,
                                                                            color: 'var(--oai-text-disabled)'
                                                                        },
                                                                        children: lbl
                                                                    }),
                                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                        style: {
                                                                            fontFamily: 'var(--font-mono)',
                                                                            fontSize: 11,
                                                                            fontWeight: 600,
                                                                            color: $7dced7559e9c1dad$var$scoreColor(val ?? 0)
                                                                        },
                                                                        children: val ?? "\u2013"
                                                                    })
                                                                ]
                                                            }, lbl))
                                                    })
                                                ]
                                            })
                                        ]
                                    }, e.id);
                                })
                            })
                        ]
                    })
                ]
            }),
            " "
        ]
    });
}




const $8970fb668f57fa15$var$PAGE_SIZE_OPTIONS = [
    25,
    50,
    100
];
const $8970fb668f57fa15$var$DEFAULT_PAGE_SIZE = 25;
// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------
function $8970fb668f57fa15$var$scoreColor(val, max = 10) {
    const pct = val / max;
    if (pct >= 0.8) return 'var(--oai-success)';
    if (pct >= 0.6) return 'var(--oai-warning)';
    return 'var(--oai-error)';
}
function $8970fb668f57fa15$var$ScoreCard({ label: label, value: value, max: max = 10 }) {
    const pct = Math.round(value / max * 100);
    const color = $8970fb668f57fa15$var$scoreColor(value, max);
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "sl-score-card",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "sl-score-label",
                children: label
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-score-val",
                style: {
                    color: color
                },
                children: [
                    value,
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                        className: "sl-score-max",
                        children: [
                            "/",
                            max
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "sl-score-bar",
                children: /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                    className: "sl-score-fill",
                    style: {
                        width: `${pct}%`,
                        background: color
                    }
                })
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// MetaGrid — model info + token usage side by side
// ---------------------------------------------------------------------------
function $8970fb668f57fa15$var$MetaGrid({ model_info: model_info, token_usage: token_usage }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "sl-meta-grid",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-meta-card",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "sl-meta-card-title",
                        children: "Model info"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-meta-row",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-key",
                                children: "Model"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-val",
                                children: model_info?.model_id ?? "\u2014"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-meta-row",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-key",
                                children: "Provider"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-val",
                                children: model_info?.model_provider ?? "\u2014"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-meta-card",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "sl-meta-card-title",
                        children: "Token usage"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-meta-row",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-key",
                                children: "Input"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-val",
                                children: token_usage?.input_tokens?.toLocaleString() ?? "\u2014"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-meta-row",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-key",
                                children: "Output"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-val",
                                children: token_usage?.output_tokens?.toLocaleString() ?? "\u2014"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-meta-row",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-key",
                                children: "Total"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-val",
                                children: token_usage?.total_tokens?.toLocaleString() ?? "\u2014"
                            })
                        ]
                    }),
                    token_usage?.input_token_details && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-meta-row",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-key",
                                children: "Cache read"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-meta-val",
                                children: token_usage.input_token_details.cache_read?.toLocaleString() ?? 0
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// EvalSection — evaluation scores + assessment + badges
// ---------------------------------------------------------------------------
function $8970fb668f57fa15$var$EvalSection({ evaluation_data: evaluation_data }) {
    if (!evaluation_data) return null;
    const ev = evaluation_data;
    const primaryScores = [
        [
            'Quality',
            ev.quality_score
        ],
        [
            'Accuracy',
            ev.accuracy_score
        ],
        [
            'Relevance',
            ev.relevance_score
        ],
        [
            'Clarity',
            ev.clarity_score
        ],
        [
            'Coherence',
            ev.coherence_score
        ],
        [
            'Empathy',
            ev.empathy_score
        ],
        [
            'Completeness',
            ev.completeness_score
        ],
        [
            'Satisfaction',
            ev.satisfaction_score
        ]
    ].filter(([, v])=>v !== undefined && v !== null);
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "sl-eval-section",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "sl-eval-title",
                children: "Evaluation"
            }),
            primaryScores.length > 0 && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "sl-eval-scores",
                children: primaryScores.map(([label, val])=>/*#__PURE__*/ (0, $5OpyM$jsx)($8970fb668f57fa15$var$ScoreCard, {
                        label: label,
                        value: val,
                        max: 10
                    }, label))
            }),
            ev.overall_assessment && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "sl-eval-assessment",
                children: ev.overall_assessment
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-badge-row",
                children: [
                    ev.detected_intent && /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                        className: "sl-badge sl-badge-info",
                        children: [
                            "Intent: ",
                            ev.detected_intent.length > 40 ? ev.detected_intent.slice(0, 40) + "\u2026" : ev.detected_intent
                        ]
                    }),
                    ev.complexity_level && /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                        className: "sl-badge sl-badge-info",
                        children: [
                            "Complexity: ",
                            ev.complexity_level
                        ]
                    }),
                    ev.bleu_score !== undefined && /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                        className: "sl-badge sl-badge-neutral",
                        children: [
                            "BLEU ",
                            ev.bleu_score,
                            " \xb7 ROUGE ",
                            ev.rouge_score
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: `sl-badge ${ev.hallucination_detected ? 'sl-badge-warn' : 'sl-badge-ok'}`,
                        children: ev.hallucination_detected ? 'Hallucination detected' : 'No hallucination'
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: `sl-badge ${ev.is_low_quality ? 'sl-badge-warn' : 'sl-badge-ok'}`,
                        children: ev.is_low_quality ? 'Low quality' : 'Good quality'
                    })
                ]
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// LogEntry — single collapsible row
// ---------------------------------------------------------------------------
function $8970fb668f57fa15$var$LogEntry({ log: log }) {
    const [isExpanded, setIsExpanded] = (0, $5OpyM$useState)(false);
    const { input_message: input_message, output_response: output_response, timestamp: timestamp, status: status, response_time_ms: response_time_ms, model_info: model_info, token_usage: token_usage, evaluation_data: evaluation_data } = log;
    const ts = new Date(timestamp);
    const tsStr = ts.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    }) + ' ' + ts.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dur = (response_time_ms / 1000).toFixed(2) + 's';
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: `sl-log-item ${isExpanded ? 'sl-log-expanded' : ''}`,
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-log-header",
                onClick: ()=>setIsExpanded(!isExpanded),
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "sl-log-timestamp",
                        children: tsStr
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "sl-log-input",
                        children: input_message
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: `sl-log-status sl-status-${status}`,
                        children: status
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                        className: "sl-log-dur-wrap",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "sl-log-duration",
                                children: dur
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: `sl-log-chevron ${isExpanded ? 'sl-chevron-open' : ''}`,
                                children: "\u25BC"
                            })
                        ]
                    })
                ]
            }),
            isExpanded && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-log-body",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-convo-section",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                className: "sl-bubble sl-bubble-user",
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "sl-bubble-label",
                                        children: "You"
                                    }),
                                    input_message
                                ]
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                className: "sl-bubble sl-bubble-agent",
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "sl-bubble-label",
                                        children: "Agent"
                                    }),
                                    output_response
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)($8970fb668f57fa15$var$MetaGrid, {
                        model_info: model_info,
                        token_usage: token_usage
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)($8970fb668f57fa15$var$EvalSection, {
                        evaluation_data: evaluation_data
                    })
                ]
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// PaginationBar
// ---------------------------------------------------------------------------
function $8970fb668f57fa15$var$PaginationBar({ currentPage: currentPage, totalPages: totalPages, pageSize: pageSize, total: total, onPageChange: onPageChange, onPageSizeChange: onPageSizeChange, loading: loading }) {
    const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, total);
    const buildPages = ()=>{
        const pages = [];
        const delta = 1;
        const rangeStart = Math.max(2, currentPage - delta);
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
        pages.push(1);
        if (rangeStart > 2) pages.push('ellipsis-left');
        for(let i = rangeStart; i <= rangeEnd; i++)pages.push(i);
        if (rangeEnd < totalPages - 1) pages.push('ellipsis-right');
        if (totalPages > 1) pages.push(totalPages);
        return pages;
    };
    const pages = totalPages > 1 ? buildPages() : [
        1
    ];
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "sl-pagination",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                className: "sl-pagination-info",
                children: total === 0 ? 'No results' : `${from}\u{2013}${to} of ${total}`
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-pagination-controls",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "sl-page-btn",
                        onClick: ()=>onPageChange(currentPage - 1),
                        disabled: currentPage === 1 || loading,
                        "aria-label": "Previous page",
                        children: "\u2039"
                    }),
                    pages.map((p)=>typeof p === 'string' ? /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                            className: "sl-page-ellipsis",
                            children: "\u2026"
                        }, p) : /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                            className: `sl-page-btn ${p === currentPage ? 'sl-page-active' : ''}`,
                            onClick: ()=>onPageChange(p),
                            disabled: loading,
                            children: p
                        }, p)),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "sl-page-btn",
                        onClick: ()=>onPageChange(currentPage + 1),
                        disabled: currentPage === totalPages || loading || totalPages === 0,
                        "aria-label": "Next page",
                        children: "\u203A"
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-page-size-wrap",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "sl-page-size-label",
                        children: "Rows"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("select", {
                        className: "sl-page-size-select",
                        value: pageSize,
                        onChange: (e)=>onPageSizeChange(Number(e.target.value)),
                        disabled: loading,
                        children: $8970fb668f57fa15$var$PAGE_SIZE_OPTIONS.map((n)=>/*#__PURE__*/ (0, $5OpyM$jsx)("option", {
                                value: n,
                                children: n
                            }, n))
                    })
                ]
            })
        ]
    });
}
function $8970fb668f57fa15$export$3c32ca1728ea32f2({ selectedAgent: selectedAgent, authToken: authToken }) {
    const [logs, setLogs] = (0, $5OpyM$useState)([]);
    const [loading, setLoading] = (0, $5OpyM$useState)(true);
    const [error, setError] = (0, $5OpyM$useState)(null);
    const [total, setTotal] = (0, $5OpyM$useState)(0);
    const [currentPage, setCurrentPage] = (0, $5OpyM$useState)(1);
    const [pageSize, setPageSize] = (0, $5OpyM$useState)($8970fb668f57fa15$var$DEFAULT_PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const fetchLogs = (0, $5OpyM$useCallback)(async (page, size)=>{
        if (!selectedAgent?.endpoint) return;
        setLoading(true);
        setError(null);
        const reqHeaders = {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
        };
        const baseUrl = selectedAgent.endpoint.replace(/\/a2a\/?$/, '');
        try {
            // 1. Get authoritative total from /logs/stats
            const statsRes = await fetch(`${baseUrl}/logs/stats`, {
                headers: reqHeaders
            });
            if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);
            const statsData = await statsRes.json();
            const knownTotal = statsData?.statistics?.total_interactions ?? 0;
            setTotal(knownTotal);
            // 2. Fetch the requested page of logs
            const offset = (page - 1) * size;
            const logsRes = await fetch(`${baseUrl}/logs?limit=${size}&offset=${offset}`, {
                headers: reqHeaders
            });
            if (!logsRes.ok) throw new Error(`Logs fetch failed: ${logsRes.status}`);
            const logsData = await logsRes.json();
            setLogs(logsData.logs ?? []);
        } catch (e) {
            setError(e.message);
        } finally{
            setLoading(false);
        }
    }, [
        selectedAgent,
        authToken
    ]);
    // Reset when agent switches
    (0, $5OpyM$useEffect)(()=>{
        setCurrentPage(1);
        setPageSize($8970fb668f57fa15$var$DEFAULT_PAGE_SIZE);
        setLogs([]);
        setTotal(0);
    }, [
        selectedAgent?.endpoint
    ]);
    // Fetch on page / size / agent change
    (0, $5OpyM$useEffect)(()=>{
        fetchLogs(currentPage, pageSize);
    }, [
        currentPage,
        pageSize,
        selectedAgent?.endpoint
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    const handlePageChange = (page)=>{
        if (page < 1 || page > totalPages || loading) return;
        setCurrentPage(page);
        document.querySelector('.sl-logs-list')?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    const handlePageSizeChange = (size)=>{
        setPageSize(size);
        setCurrentPage(1);
    };
    if (error) return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "sl-logs-state sl-logs-error-state",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                className: "sl-logs-error-icon",
                children: "\u26A0"
            }),
            "Error fetching logs: ",
            error
        ]
    });
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "sl-logs",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-logs-header",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-logs-header-left",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                                className: "sl-logs-title",
                                children: "Interaction logs"
                            }),
                            !loading && /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                                className: "sl-logs-count",
                                children: [
                                    total,
                                    " total"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        onClick: ()=>fetchLogs(currentPage, pageSize),
                        className: "sl-logs-refresh-btn",
                        disabled: loading,
                        children: loading ? "Loading\u2026" : 'Refresh'
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: `sl-logs-list ${loading ? 'sl-logs-list-loading' : ''}`,
                children: loading ? /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                    className: "sl-logs-state",
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "sl-logs-spinner"
                        }),
                        "Loading logs\u2026"
                    ]
                }) : logs.length === 0 ? /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                    className: "sl-logs-empty",
                    children: "No logs found for this agent."
                }) : logs.map((log)=>/*#__PURE__*/ (0, $5OpyM$jsx)($8970fb668f57fa15$var$LogEntry, {
                        log: log
                    }, log.id))
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)($8970fb668f57fa15$var$PaginationBar, {
                currentPage: currentPage,
                totalPages: totalPages,
                pageSize: pageSize,
                total: total,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange,
                loading: loading
            })
        ]
    });
}




const $1d01d57b5074c4b5$var$styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  .tm-root {
    --bg: #0d0f14;
    --bg-card: #13161d;
    --bg-elevated: #1a1e28;
    --bg-hover: #1f2430;
    --border: #252a38;
    --border-active: #3a4155;
    --accent: #4f8ef7;
    --accent-dim: rgba(79, 142, 247, 0.12);
    --accent-glow: rgba(79, 142, 247, 0.25);
    --success: #3ecf8e;
    --success-dim: rgba(62, 207, 142, 0.12);
    --danger: #f76f6f;
    --danger-dim: rgba(247, 111, 111, 0.1);
    --text-primary: #e8eaf0;
    --text-secondary: #8892a4;
    --text-muted: #4f5668;
    --font-sans: 'IBM Plex Sans', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    --radius: 8px;
    --radius-sm: 5px;
    --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);

    font-family: var(--font-sans);
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 48px 24px;
    box-sizing: border-box;
  }

  .tm-panel {
    width: 100%;
    max-width: 720px;
  }

  /* Header */
  .tm-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .tm-title-block {}
  .tm-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 6px;
  }
  .tm-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.01em;
  }
  .tm-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 4px 0 0;
    font-weight: 400;
  }

  .tm-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 100px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    white-space: nowrap;
  }
  .tm-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
  }
  .tm-badge-dot.active {
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
  }

  /* Controls bar */
  .tm-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 16px;
  }

  .tm-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .tm-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
  }
  .tm-select {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    padding: 7px 28px 7px 10px;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238892a4' d='M6 8L1.5 3.5h9z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color var(--transition);
  }
  .tm-select:focus {
    border-color: var(--accent);
  }

  .tm-divider {
    width: 1px;
    height: 32px;
    background: var(--border);
    margin: 0 4px;
  }

  .tm-quota {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .tm-quota-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
  }
  .tm-quota-track {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tm-quota-pips {
    display: flex;
    gap: 4px;
  }
  .tm-pip {
    width: 16px;
    height: 4px;
    border-radius: 2px;
    background: var(--bg-hover);
    transition: background var(--transition);
  }
  .tm-pip.filled {
    background: var(--accent);
  }
  .tm-quota-text {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
  }

  .tm-generate-btn {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity var(--transition), transform var(--transition), box-shadow var(--transition);
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 0 var(--accent-glow);
  }
  .tm-generate-btn:hover:not(:disabled) {
    opacity: 0.9;
    box-shadow: 0 2px 12px var(--accent-glow);
    transform: translateY(-1px);
  }
  .tm-generate-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .tm-generate-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .tm-generate-btn .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Error */
  .tm-error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: var(--danger-dim);
    border: 1px solid rgba(247, 111, 111, 0.2);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--danger);
    margin-bottom: 16px;
    animation: fadeIn 0.2s ease;
  }
  .tm-error-icon {
    font-size: 14px;
    flex-shrink: 0;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

  /* Token list */
  .tm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 56px 24px;
    background: var(--bg-card);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    text-align: center;
  }
  .tm-empty-icon {
    width: 40px;
    height: 40px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 18px;
  }
  .tm-empty-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 4px;
  }
  .tm-empty-sub {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }

  .tm-token-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: border-color var(--transition), background var(--transition);
    animation: slideIn 0.2s ease;
  }
  @keyframes slideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .tm-token-card:hover {
    border-color: var(--border-active);
    background: var(--bg-elevated);
  }

  .tm-token-index {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--accent-dim);
    border: 1px solid rgba(79,142,247,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--accent);
    flex-shrink: 0;
  }

  .tm-token-body {
    flex: 1;
    min-width: 0;
  }
  .tm-token-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .tm-token-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .tm-token-value {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-primary);
    word-break: break-all;
    line-height: 1.5;
  }
  .tm-token-meta {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .tm-meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }
  .tm-meta-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--success);
  }
  .tm-meta-dot.expired {
    background: var(--danger);
  }

  .tm-copy-btn {
    flex-shrink: 0;
    padding: 7px 14px;
    border-radius: var(--radius-sm);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
    white-space: nowrap;
  }
  .tm-copy-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
  }
  .tm-copy-btn.copied {
    border-color: var(--success);
    color: var(--success);
    background: var(--success-dim);
  }
`;
function $1d01d57b5074c4b5$export$aa9349e63a87bac1({ agentEndpoint: agentEndpoint, authToken: authToken }) {
    const [tokens, setTokens] = (0, $5OpyM$useState)([]);
    const [isLoading, setIsLoading] = (0, $5OpyM$useState)(false);
    const [error, setError] = (0, $5OpyM$useState)(null);
    const [ttl, setTtl] = (0, $5OpyM$useState)(3600);
    const [copiedToken, setCopiedToken] = (0, $5OpyM$useState)(null);
    const generateToken = (0, $5OpyM$useCallback)(async ()=>{
        if (!agentEndpoint) {
            setError("Agent endpoint is not configured.");
            return;
        }
        if (tokens.length >= 5) {
            setError("Maximum of 5 tokens reached. Remove an existing token to generate a new one.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const baseUrl = agentEndpoint.replace(/\/a2a\/?$/, '');
            let url = `${baseUrl}/token/custom`;
            if (ttl > 0) url += `?ttl_seconds=${ttl}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            const data = await response.json();
            setTokens((prev)=>[
                    ...prev,
                    data
                ]);
        } catch (e) {
            setError(e.message);
        } finally{
            setIsLoading(false);
        }
    }, [
        agentEndpoint,
        authToken,
        tokens,
        ttl
    ]);
    const copyToClipboard = (token, index)=>{
        navigator.clipboard.writeText(token);
        setCopiedToken(index);
        setTimeout(()=>setCopiedToken(null), 2000);
    };
    const ttlLabel = (seconds)=>{
        if (seconds === -1 || !seconds) return 'No Expiration';
        if (seconds < 3600) return `${seconds / 60}m`;
        if (seconds < 86400) return `${seconds / 3600}h`;
        return `${seconds / 86400}d`;
    };
    return /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("style", {
                children: $1d01d57b5074c4b5$var$styles
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "tm-root",
                children: /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                    className: "tm-panel",
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "tm-header",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "tm-title-block",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                                            className: "tm-eyebrow",
                                            children: "API Access"
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("h2", {
                                            className: "tm-title",
                                            children: "Token Manager"
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                                            className: "tm-subtitle",
                                            children: "Generate and manage scoped authentication tokens"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "tm-badge",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                            className: `tm-badge-dot ${agentEndpoint ? 'active' : ''}`
                                        }),
                                        agentEndpoint ? 'Endpoint connected' : 'No endpoint'
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "tm-controls",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "tm-field",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                            className: "tm-label",
                                            children: "Expiry"
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsxs)("select", {
                                            id: "ttl",
                                            value: ttl,
                                            onChange: (e)=>setTtl(Number(e.target.value)),
                                            className: "tm-select",
                                            children: [
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("option", {
                                                    value: 3600,
                                                    children: "1 Hour"
                                                }),
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("option", {
                                                    value: 86400,
                                                    children: "1 Day"
                                                }),
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("option", {
                                                    value: 604800,
                                                    children: "7 Days"
                                                }),
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("option", {
                                                    value: 2592000,
                                                    children: "30 Days"
                                                }),
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("option", {
                                                    value: -1,
                                                    children: "No Expiration"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                    className: "tm-divider"
                                }),
                                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "tm-quota",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                            className: "tm-quota-label",
                                            children: "Quota"
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                            className: "tm-quota-track",
                                            children: [
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                    className: "tm-quota-pips",
                                                    children: Array.from({
                                                        length: 5
                                                    }).map((_, i)=>/*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                            className: `tm-pip ${i < tokens.length ? 'filled' : ''}`
                                                        }, i))
                                                }),
                                                /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                                                    className: "tm-quota-text",
                                                    children: [
                                                        tokens.length,
                                                        "/5"
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                    onClick: generateToken,
                                    className: "tm-generate-btn",
                                    disabled: isLoading || tokens.length >= 5,
                                    children: isLoading ? /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                className: "spinner"
                                            }),
                                            "Generating\u2026"
                                        ]
                                    }) : /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("svg", {
                                                width: "13",
                                                height: "13",
                                                viewBox: "0 0 13 13",
                                                fill: "none",
                                                children: /*#__PURE__*/ (0, $5OpyM$jsx)("path", {
                                                    d: "M6.5 1v11M1 6.5h11",
                                                    stroke: "currentColor",
                                                    strokeWidth: "1.8",
                                                    strokeLinecap: "round"
                                                })
                                            }),
                                            "Generate Token"
                                        ]
                                    })
                                })
                            ]
                        }),
                        error && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "tm-error",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                    className: "tm-error-icon",
                                    children: "\u26A0"
                                }),
                                error
                            ]
                        }),
                        /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "tm-list",
                            children: tokens.length === 0 ? /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                className: "tm-empty",
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "tm-empty-icon",
                                        children: "\uD83D\uDD11"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                                        className: "tm-empty-title",
                                        children: "No tokens yet"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                                        className: "tm-empty-sub",
                                        children: "Generate a token above to get started"
                                    })
                                ]
                            }) : tokens.map((tokenData, index)=>/*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "tm-token-card",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                            className: "tm-token-index",
                                            children: String(index + 1).padStart(2, '0')
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                            className: "tm-token-body",
                                            children: [
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                    className: "tm-token-row",
                                                    children: /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                        className: "tm-token-label",
                                                        children: "Token"
                                                    })
                                                }),
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                    className: "tm-token-value",
                                                    children: tokenData.token
                                                }),
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                    className: "tm-token-meta",
                                                    style: {
                                                        marginTop: 10
                                                    },
                                                    children: /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
                                                        className: "tm-meta-chip",
                                                        children: [
                                                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                className: `tm-meta-dot ${tokenData.ttl_seconds === -1 ? 'expired' : ''}`
                                                            }),
                                                            ttlLabel(tokenData.ttl_seconds)
                                                        ]
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                            onClick: ()=>copyToClipboard(tokenData.token, index),
                                            className: `tm-copy-btn ${copiedToken === index ? 'copied' : ''}`,
                                            children: copiedToken === index ? "\u2713 Copied" : 'Copy'
                                        })
                                    ]
                                }, index))
                        })
                    ]
                })
            })
        ]
    });
}




function $2ac663ffd8618082$var$RegisterTab() {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        style: {
            padding: '20px'
        },
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                style: {
                    marginTop: 0
                },
                children: "Register New Agent"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                children: "This is a placeholder for the agent registration form."
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    maxWidth: '400px'
                },
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("input", {
                        type: "text",
                        placeholder: "Agent Name",
                        className: "sl-search"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("textarea", {
                        placeholder: "Description",
                        className: "chat-input textarea",
                        style: {
                            height: '80px'
                        }
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("input", {
                        type: "text",
                        placeholder: "Endpoint URL",
                        className: "sl-search"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "sl-logs-refresh-btn",
                        style: {
                            alignSelf: 'flex-start'
                        },
                        children: "Register Agent"
                    })
                ]
            })
        ]
    });
}
function $2ac663ffd8618082$var$TokenTab() {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        style: {
            padding: '20px'
        },
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("h3", {
                style: {
                    marginTop: 0
                },
                children: "Manage Tokens"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                children: "This is a placeholder for the token management interface."
            })
        ]
    });
}
function $2ac663ffd8618082$export$8f6dcfe950367406({ onBack: onBack }) {
    const [activeTab, setActiveTab] = (0, $5OpyM$useState)('register');
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "ccl-registry",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "ccl-registry-header",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "ccl-header-top",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "ccl-header-title",
                                        children: "Settings"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "ccl-header-sub",
                                        children: "Manage agent registry and tokens"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: "ccl-back-btn",
                                onClick: onBack,
                                children: "\u2190 Back to Registry"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "ccl-tabs",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: `ccl-tab-btn ${activeTab === 'register' ? 'ccl-tab-active' : ''}`,
                                onClick: ()=>setActiveTab('register'),
                                children: "Register"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: `ccl-tab-btn ${activeTab === 'token' ? 'ccl-tab-active' : ''}`,
                                onClick: ()=>setActiveTab('token'),
                                children: "Token"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "ccl-grid-wrap",
                style: {
                    background: 'var(--oai-surface)'
                },
                children: [
                    activeTab === 'register' && /*#__PURE__*/ (0, $5OpyM$jsx)($2ac663ffd8618082$var$RegisterTab, {}),
                    activeTab === 'token' && /*#__PURE__*/ (0, $5OpyM$jsx)($2ac663ffd8618082$var$TokenTab, {})
                ]
            })
        ]
    });
}


const $52cf8225d0cc4dd9$var$AVATAR_COLORS = [
    {
        bg: '#EEEDFE',
        color: '#3C3489'
    },
    {
        bg: '#E1F5EE',
        color: '#085041'
    },
    {
        bg: '#E6F1FB',
        color: '#0C447C'
    },
    {
        bg: '#FAECE7',
        color: '#993C1D'
    },
    {
        bg: '#FBEAF0',
        color: '#72243E'
    },
    {
        bg: '#FAEEDA',
        color: '#633806'
    }
];
function $52cf8225d0cc4dd9$export$b1592956d14148e9(index) {
    return $52cf8225d0cc4dd9$var$AVATAR_COLORS[index % $52cf8225d0cc4dd9$var$AVATAR_COLORS.length];
}
function $52cf8225d0cc4dd9$export$7d6e6cc5a7a4d165(name) {
    if (!name) return '';
    return name.split(' ').map((w)=>w[0]).join('').slice(0, 2).toUpperCase();
}


// ---------------------------------------------------------------------------
// StatusPill — compact badge for the chat header
// ---------------------------------------------------------------------------
function $91ca74acd8eeb46c$var$StatusPill({ status: status }) {
    const map = {
        active: {
            label: 'Online',
            cls: 'sl-pill-online'
        },
        inactive: {
            label: 'Offline',
            cls: 'sl-pill-offline'
        },
        busy: {
            label: 'Busy',
            cls: 'sl-pill-busy'
        },
        unknown: {
            label: 'Unknown',
            cls: 'sl-pill-offline'
        }
    };
    const { label: label, cls: cls } = map[status] || map.unknown;
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
        className: `sl-status-pill ${cls}`,
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                className: `sl-dot ${cls}`
            }),
            label
        ]
    });
}
// ---------------------------------------------------------------------------
// SubTabBar
// ---------------------------------------------------------------------------
function $91ca74acd8eeb46c$var$SubTabBar({ currentView: currentView, setCurrentView: setCurrentView }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "sl-sub-tab-bar",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `sl-sub-tab ${currentView === 'chat' ? 'sl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('chat'),
                children: "Chat"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `sl-sub-tab ${currentView === 'metrics' ? 'sl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('metrics'),
                children: "Metrics"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `sl-sub-tab ${currentView === 'logs' ? 'sl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('logs'),
                children: "Logs"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `sl-sub-tab ${currentView === 'tokens' ? 'sl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('tokens'),
                children: "Tokens"
            })
        ]
    });
}
function $91ca74acd8eeb46c$export$8295a33ab8a36876(props) {
    const { agents: agents, filteredAgents: filteredAgents, selectedAgent: selectedAgent, selectedAgentId: selectedAgentId, message: message, searchQuery: searchQuery, attachedFiles: attachedFiles, currentMessages: currentMessages, currentTraceLogs: currentTraceLogs, showTrace: showTrace, isLoading: isLoading, chatEndRef: chatEndRef, traceEndRef: traceEndRef, textareaRef: textareaRef, fileInputRef: fileInputRef, fetchAgents: fetchAgents, handleSelectAgent: handleSelectAgent, handleClearSession: handleClearSession, handleMessageChange: handleMessageChange, handleFileSelect: handleFileSelect, removeAttachment: removeAttachment, handleStopGeneration: handleStopGeneration, handleSendMessage: handleSendMessage, setSearchQuery: setSearchQuery, setShowTrace: setShowTrace, evaluations: evaluations, expandedEvaluations: expandedEvaluations, toggleEvaluation: toggleEvaluation, agentEvals: agentEvals, authToken: authToken } = props;
    const [currentView, setCurrentView] = (0, $5OpyM$useState)('chat');
    const [showSettings, setShowSettings] = (0, $5OpyM$useState)(false);
    const [agentPage, setAgentPage] = (0, $5OpyM$useState)(1);
    const agentsPerPage = 15;
    const selectedIndex = agents.findIndex((a)=>a.id === selectedAgentId);
    const { bg: bg, color: color } = selectedAgent ? (0, $52cf8225d0cc4dd9$export$b1592956d14148e9)(selectedIndex >= 0 ? selectedIndex : 0) : {};
    const initials = selectedAgent ? (0, $52cf8225d0cc4dd9$export$7d6e6cc5a7a4d165)(selectedAgent.name) : '';
    // Paginate the filtered agents
    const totalAgentPages = Math.ceil(filteredAgents.length / agentsPerPage);
    const paginatedAgents = (0, $5OpyM$useMemo)(()=>{
        const start = (agentPage - 1) * agentsPerPage;
        return filteredAgents.slice(start, start + agentsPerPage);
    }, [
        filteredAgents,
        agentPage,
        agentsPerPage
    ]);
    // Reset to page 1 when search changes
    const prevFilterLen = (0, $5OpyM$react).useRef(filteredAgents.length);
    if (filteredAgents.length !== prevFilterLen.current) {
        prevFilterLen.current = filteredAgents.length;
        if (agentPage !== 1) setAgentPage(1);
    }
    if (showSettings) return /*#__PURE__*/ (0, $5OpyM$jsx)((0, $2ac663ffd8618082$export$8f6dcfe950367406), {
        onBack: ()=>setShowSettings(false)
    });
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "sl-container",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "sl-sidebar",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-sidebar-top",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                className: "sl-sidebar-brand",
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                        className: "sl-brand-name",
                                        children: "Agents"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                        className: "sl-refresh-btn",
                                        onClick: ()=>setShowSettings(true),
                                        title: "Settings",
                                        children: "Settings"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                className: "sl-search-wrap",
                                children: /*#__PURE__*/ (0, $5OpyM$jsx)("input", {
                                    className: "sl-search",
                                    type: "text",
                                    placeholder: "Search agents\u2026",
                                    value: searchQuery,
                                    onChange: (e)=>setSearchQuery(e.target.value)
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("ul", {
                        className: "sl-agent-list",
                        children: paginatedAgents.length === 0 ? /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "sl-no-agents",
                            children: "No agents found."
                        }) : paginatedAgents.map((agent)=>/*#__PURE__*/ (0, $5OpyM$jsxs)("li", {
                                className: `sl-agent-item ${selectedAgentId === agent.id ? 'sl-selected' : ''}`,
                                onClick: ()=>handleSelectAgent(agent.id),
                                title: agent.description,
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "sl-item-row",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$eaa9dcd62e0d5ec6), {
                                                status: agent.status
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                className: "sl-agent-name",
                                                children: agent.name
                                            })
                                        ]
                                    }),
                                    agent.description && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                        className: "sl-agent-desc",
                                        children: agent.description
                                    })
                                ]
                            }, agent.id))
                    }),
                    totalAgentPages > 1 && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "sl-pagination",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: "sl-pagination-btn",
                                onClick: ()=>setAgentPage((p)=>Math.max(1, p - 1)),
                                disabled: agentPage === 1,
                                title: "Previous page",
                                children: "\u2039"
                            }),
                            Array.from({
                                length: totalAgentPages
                            }, (_, i)=>i + 1).map((page)=>/*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                    className: `sl-pagination-btn ${agentPage === page ? 'sl-pagination-active' : ''}`,
                                    onClick: ()=>setAgentPage(page),
                                    children: page
                                }, page)),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: "sl-pagination-btn",
                                onClick: ()=>setAgentPage((p)=>Math.min(totalAgentPages, p + 1)),
                                disabled: agentPage === totalAgentPages,
                                title: "Next page",
                                children: "\u203A"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "sl-chat-container",
                children: selectedAgent ? /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "sl-chat-header",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "sl-chat-header-left",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                            className: "sl-chat-avatar",
                                            style: {
                                                background: bg,
                                                color: color
                                            },
                                            children: initials
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                    className: "sl-chat-agent-name",
                                                    children: selectedAgent.name
                                                }),
                                                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                    className: "sl-chat-agent-meta",
                                                    children: [
                                                        selectedAgent.description && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                            className: "sl-chat-agent-desc",
                                                            children: selectedAgent.description
                                                        }),
                                                        /*#__PURE__*/ (0, $5OpyM$jsx)($91ca74acd8eeb46c$var$StatusPill, {
                                                            status: selectedAgent.status
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    className: "sl-header-actions",
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                            className: "sl-trace-btn",
                                            onClick: ()=>setShowTrace(!showTrace),
                                            children: showTrace ? 'Hide trace' : 'Show trace'
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                            className: "sl-clear-btn",
                                            onClick: handleClearSession,
                                            children: "Clear"
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $5OpyM$jsx)($91ca74acd8eeb46c$var$SubTabBar, {
                            currentView: currentView,
                            setCurrentView: setCurrentView
                        }),
                        currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$148ad0a1a7d03440), {
                                    messages: currentMessages,
                                    isLoading: isLoading,
                                    agentName: selectedAgent.name,
                                    chatEndRef: chatEndRef,
                                    evaluations: evaluations,
                                    expandedEvaluations: expandedEvaluations,
                                    onToggleEvaluation: toggleEvaluation
                                }),
                                /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$19b903fd083c557c), {
                                    message: message,
                                    isLoading: isLoading,
                                    attachedFiles: attachedFiles,
                                    textareaRef: textareaRef,
                                    fileInputRef: fileInputRef,
                                    onMessageChange: handleMessageChange,
                                    onSend: handleSendMessage,
                                    onStop: handleStopGeneration,
                                    onFileSelect: handleFileSelect,
                                    onRemoveAttachment: removeAttachment
                                })
                            ]
                        }),
                        currentView === 'metrics' && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "sl-metrics",
                            children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $7dced7559e9c1dad$export$bfaab4c9bb3364f), {
                                agentEndpoint: selectedAgent.endpoint,
                                authToken: authToken
                            })
                        }),
                        currentView === 'logs' && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "logs",
                            children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $8970fb668f57fa15$export$3c32ca1728ea32f2), {
                                selectedAgent: selectedAgent,
                                authToken: authToken
                            })
                        }),
                        currentView === 'tokens' && /*#__PURE__*/ (0, $5OpyM$jsx)((0, $1d01d57b5074c4b5$export$aa9349e63a87bac1), {
                            agentEndpoint: selectedAgent.endpoint,
                            authToken: authToken
                        })
                    ]
                }) : /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$fddf379e22a74b00), {
                    agents: agents,
                    onSelectAgent: handleSelectAgent
                })
            }),
            showTrace && currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$8020b1ff210ef23b), {
                logs: currentTraceLogs,
                selectedAgent: selectedAgent,
                traceEndRef: traceEndRef,
                onClose: ()=>setShowTrace(false)
            })
        ]
    });
}


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







// ---------------------------------------------------------------------------
// StatusPill
// ---------------------------------------------------------------------------
function $38b317e169159a61$var$StatusPill({ status: status }) {
    const map = {
        active: {
            label: 'Online',
            cls: 'tcl-pill-online'
        },
        inactive: {
            label: 'Offline',
            cls: 'tcl-pill-offline'
        },
        busy: {
            label: 'Busy',
            cls: 'tcl-pill-busy'
        },
        unknown: {
            label: 'Unknown',
            cls: 'tcl-pill-offline'
        }
    };
    const { label: label, cls: cls } = map[status] || map.unknown;
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("span", {
        className: `tcl-status-pill ${cls}`,
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                className: `tcl-dot ${cls}`
            }),
            label
        ]
    });
}
// ---------------------------------------------------------------------------
// AgentCard — used in the card-grid launcher
// ---------------------------------------------------------------------------
function $38b317e169159a61$var$AgentCard({ agent: agent, index: index, onOpen: onOpen }) {
    const { bg: bg, color: color } = (0, $52cf8225d0cc4dd9$export$b1592956d14148e9)(index);
    const initials = (0, $52cf8225d0cc4dd9$export$7d6e6cc5a7a4d165)(agent.name);
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "tcl-agent-card",
        onClick: ()=>onOpen(agent.id),
        role: "button",
        tabIndex: 0,
        onKeyDown: (e)=>e.key === 'Enter' && onOpen(agent.id),
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "tcl-card-top",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "tcl-card-avatar",
                        style: {
                            background: bg,
                            color: color
                        },
                        children: initials
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "tcl-card-meta",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                className: "tcl-card-name",
                                children: agent.name
                            }),
                            agent.description && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                className: "tcl-card-type",
                                children: agent.description
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)($38b317e169159a61$var$StatusPill, {
                        status: agent.status
                    })
                ]
            }),
            agent.description && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "tcl-card-desc",
                children: agent.description
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "tcl-card-footer",
                children: /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                    className: "tcl-open-btn",
                    onClick: (e)=>{
                        e.stopPropagation();
                        onOpen(agent.id);
                    },
                    children: "Open \u2197"
                })
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// TabBar
// ---------------------------------------------------------------------------
function $38b317e169159a61$var$TabBar({ openAgents: openAgents, selectedAgentId: selectedAgentId, allAgents: allAgents, unreadCounts: unreadCounts, onSelect: onSelect, onClose: onClose }) {
    return /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
        className: "tcl-tab-bar",
        children: openAgents.map((agent)=>{
            const isActive = agent.id === selectedAgentId;
            const unread = unreadCounts?.[agent.id] || 0;
            const agentIdx = allAgents.findIndex((a)=>a.id === agent.id);
            const { bg: bg, color: color } = (0, $52cf8225d0cc4dd9$export$b1592956d14148e9)(agentIdx >= 0 ? agentIdx : 0);
            return /*#__PURE__*/ (0, $5OpyM$jsxs)("button", {
                className: `tcl-tab ${isActive ? 'tcl-tab-active' : ''}`,
                onClick: ()=>onSelect(agent.id),
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "tcl-tab-avatar",
                        style: {
                            background: bg,
                            color: color
                        },
                        children: (0, $52cf8225d0cc4dd9$export$7d6e6cc5a7a4d165)(agent.name)
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "tcl-tab-name",
                        children: agent.name
                    }),
                    unread > 0 && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "tcl-tab-badge",
                        children: unread
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "tcl-tab-close",
                        onClick: (e)=>onClose(agent.id, e),
                        title: "Close tab",
                        children: "\xd7"
                    })
                ]
            }, agent.id);
        })
    });
}
// ---------------------------------------------------------------------------
// SubTabBar
// ---------------------------------------------------------------------------
function $38b317e169159a61$var$SubTabBar({ currentView: currentView, setCurrentView: setCurrentView }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "tcl-sub-tab-bar",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `tcl-sub-tab ${currentView === 'chat' ? 'tcl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('chat'),
                children: "Chat"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `tcl-sub-tab ${currentView === 'metrics' ? 'tcl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('metrics'),
                children: "Metrics"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `tcl-sub-tab ${currentView === 'logs' ? 'tcl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('logs'),
                children: "Logs"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `tcl-sub-tab ${currentView === 'tokens' ? 'tcl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('tokens'),
                children: "Tokens"
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// BrowsePanel
// ---------------------------------------------------------------------------
function $38b317e169159a61$var$BrowsePanel({ filteredAgents: filteredAgents, selectedAgentId: selectedAgentId, allAgents: allAgents, searchQuery: searchQuery, setSearchQuery: setSearchQuery, onOpen: onOpen, fetchAgents: fetchAgents, isCollapsed: isCollapsed, onToggle: onToggle, onShowSettings: onShowSettings }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: `tcl-browse ${isCollapsed ? 'tcl-browse-collapsed' : ''}`,
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "tcl-browse-hdr",
                children: [
                    !isCollapsed && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                        className: "tcl-browse-title",
                        children: "All agents"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "tcl-browse-toggle",
                        onClick: onToggle,
                        title: isCollapsed ? 'Expand panel' : 'Collapse panel',
                        children: isCollapsed ? "\u203A" : "\u2039"
                    })
                ]
            }),
            !isCollapsed && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "tcl-browse-search-wrap",
                        children: /*#__PURE__*/ (0, $5OpyM$jsx)("input", {
                            className: "tcl-browse-search",
                            type: "text",
                            placeholder: "Search agents\u2026",
                            value: searchQuery,
                            onChange: (e)=>setSearchQuery(e.target.value)
                        })
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("ul", {
                        className: "tcl-browse-list",
                        children: filteredAgents.length === 0 ? /*#__PURE__*/ (0, $5OpyM$jsx)("li", {
                            className: "tcl-browse-empty",
                            children: "No agents found."
                        }) : filteredAgents.map((agent)=>{
                            const idx = allAgents.findIndex((a)=>a.id === agent.id);
                            const { bg: bg, color: color } = (0, $52cf8225d0cc4dd9$export$b1592956d14148e9)(idx >= 0 ? idx : 0);
                            return /*#__PURE__*/ (0, $5OpyM$jsxs)("li", {
                                className: `tcl-browse-item ${selectedAgentId === agent.id ? 'tcl-browse-selected' : ''}`,
                                onClick: ()=>onOpen(agent.id),
                                title: agent.description,
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "tcl-browse-avatar",
                                        style: {
                                            background: bg,
                                            color: color
                                        },
                                        children: (0, $52cf8225d0cc4dd9$export$7d6e6cc5a7a4d165)(agent.name)
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                        className: "tcl-browse-name",
                                        children: agent.name
                                    })
                                ]
                            }, agent.id);
                        })
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "tcl-browse-refresh",
                        onClick: fetchAgents,
                        children: "\u21BB Refresh"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                        className: "tcl-browse-refresh",
                        onClick: onShowSettings,
                        children: "Settings"
                    })
                ]
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// CardGridLauncher — shown in center when no tabs are open
// ---------------------------------------------------------------------------
function $38b317e169159a61$var$CardGridLauncher({ agents: agents, searchQuery: searchQuery, setSearchQuery: setSearchQuery, onOpen: onOpen }) {
    const filtered = searchQuery.trim() ? agents.filter((a)=>a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.description?.toLowerCase().includes(searchQuery.toLowerCase())) : agents;
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "tcl-launcher",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "tcl-launcher-header",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "tcl-launcher-title",
                        children: "Choose an agent"
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "tcl-launcher-sub",
                        children: "Select an agent below to start a conversation."
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "tcl-launcher-search-wrap",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "tcl-launcher-search-icon",
                                children: "\u2315"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("input", {
                                className: "tcl-launcher-search",
                                type: "text",
                                placeholder: "Search agents\u2026",
                                value: searchQuery,
                                onChange: (e)=>setSearchQuery(e.target.value)
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "tcl-launcher-grid",
                children: filtered.length === 0 ? /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                    className: "tcl-launcher-empty",
                    children: "No agents match your search."
                }) : filtered.map((agent, i)=>/*#__PURE__*/ (0, $5OpyM$jsx)($38b317e169159a61$var$AgentCard, {
                        agent: agent,
                        index: i,
                        onOpen: onOpen
                    }, agent.id))
            })
        ]
    });
}
function $38b317e169159a61$export$1806ed9300cedcd4(props) {
    const { agents: agents, filteredAgents: filteredAgents, openAgents: openAgents, selectedAgent: selectedAgent, selectedAgentId: selectedAgentId, message: message, searchQuery: searchQuery, attachedFiles: attachedFiles, currentMessages: currentMessages, currentTraceLogs: currentTraceLogs, showTrace: showTrace, isLoading: isLoading, unreadCounts: unreadCounts, chatEndRef: chatEndRef, traceEndRef: traceEndRef, textareaRef: textareaRef, fileInputRef: fileInputRef, fetchAgents: fetchAgents, handleSelectAgent: handleSelectAgent, handleCloseTab: handleCloseTab, handleClearSession: handleClearSession, handleMessageChange: handleMessageChange, handleFileSelect: handleFileSelect, removeAttachment: removeAttachment, handleStopGeneration: handleStopGeneration, handleSendMessage: handleSendMessage, setSearchQuery: setSearchQuery, setShowTrace: setShowTrace, evaluations: evaluations, expandedEvaluations: expandedEvaluations, toggleEvaluation: toggleEvaluation, agentEvals: agentEvals, authToken: authToken } = props;
    const [panelCollapsed, setPanelCollapsed] = (0, $5OpyM$useState)(false);
    const [currentView, setCurrentView] = (0, $5OpyM$useState)('chat');
    const [showSettings, setShowSettings] = (0, $5OpyM$useState)(false);
    const hasOpenTabs = openAgents.length > 0;
    const selectedIndex = agents.findIndex((a)=>a.id === selectedAgentId);
    const { bg: bg, color: color } = selectedAgent ? (0, $52cf8225d0cc4dd9$export$b1592956d14148e9)(selectedIndex >= 0 ? selectedIndex : 0) : {};
    const initials = selectedAgent ? (0, $52cf8225d0cc4dd9$export$7d6e6cc5a7a4d165)(selectedAgent.name) : '';
    if (showSettings) return /*#__PURE__*/ (0, $5OpyM$jsx)((0, $2ac663ffd8618082$export$8f6dcfe950367406), {
        onBack: ()=>setShowSettings(false)
    });
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "tcl-container",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)($38b317e169159a61$var$BrowsePanel, {
                filteredAgents: filteredAgents,
                selectedAgentId: selectedAgentId,
                allAgents: agents,
                searchQuery: searchQuery,
                setSearchQuery: setSearchQuery,
                onOpen: handleSelectAgent,
                fetchAgents: fetchAgents,
                isCollapsed: panelCollapsed,
                onToggle: ()=>setPanelCollapsed((p)=>!p),
                onShowSettings: ()=>setShowSettings(true)
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "tcl-main",
                children: hasOpenTabs ? /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsx)($38b317e169159a61$var$TabBar, {
                            openAgents: openAgents,
                            selectedAgentId: selectedAgentId,
                            allAgents: agents,
                            unreadCounts: unreadCounts,
                            onSelect: handleSelectAgent,
                            onClose: handleCloseTab
                        }),
                        /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: "tcl-chat-area",
                            children: selectedAgent ? /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                        className: "tcl-chat-header",
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                className: "tcl-chat-header-left",
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                        className: "tcl-chat-avatar",
                                                        style: {
                                                            background: bg,
                                                            color: color
                                                        },
                                                        children: initials
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                                                className: "tcl-chat-agent-name",
                                                                children: selectedAgent.name
                                                            }),
                                                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                                className: "tcl-chat-agent-meta",
                                                                children: [
                                                                    selectedAgent.description && /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                                                        className: "tcl-chat-agent-desc",
                                                                        children: selectedAgent.description
                                                                    }),
                                                                    /*#__PURE__*/ (0, $5OpyM$jsx)($38b317e169159a61$var$StatusPill, {
                                                                        status: selectedAgent.status
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                                className: "tcl-header-actions",
                                                children: [
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                                        className: "tcl-trace-btn",
                                                        onClick: ()=>setShowTrace(!showTrace),
                                                        children: showTrace ? 'Hide trace' : 'Show trace'
                                                    }),
                                                    /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                                        className: "tcl-clear-btn",
                                                        onClick: handleClearSession,
                                                        children: "Clear"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)($38b317e169159a61$var$SubTabBar, {
                                        currentView: currentView,
                                        setCurrentView: setCurrentView
                                    }),
                                    currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                                        children: [
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$148ad0a1a7d03440), {
                                                messages: currentMessages,
                                                isLoading: isLoading,
                                                agentName: selectedAgent.name,
                                                chatEndRef: chatEndRef,
                                                evaluations: evaluations,
                                                expandedEvaluations: expandedEvaluations,
                                                onToggleEvaluation: toggleEvaluation
                                            }),
                                            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$19b903fd083c557c), {
                                                message: message,
                                                isLoading: isLoading,
                                                attachedFiles: attachedFiles,
                                                textareaRef: textareaRef,
                                                fileInputRef: fileInputRef,
                                                onMessageChange: handleMessageChange,
                                                onSend: handleSendMessage,
                                                onStop: handleStopGeneration,
                                                onFileSelect: handleFileSelect,
                                                onRemoveAttachment: removeAttachment
                                            })
                                        ]
                                    }),
                                    currentView === 'metrics' && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "metrics",
                                        children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $7dced7559e9c1dad$export$bfaab4c9bb3364f), {
                                            agentEndpoint: selectedAgent.endpoint,
                                            authToken: authToken
                                        })
                                    }),
                                    currentView === 'logs' && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "logs",
                                        children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $8970fb668f57fa15$export$3c32ca1728ea32f2), {
                                            selectedAgent: selectedAgent,
                                            authToken: authToken
                                        })
                                    }),
                                    currentView === 'tokens' && /*#__PURE__*/ (0, $5OpyM$jsx)((0, $1d01d57b5074c4b5$export$aa9349e63a87bac1), {
                                        agentEndpoint: selectedAgent.endpoint,
                                        authToken: authToken
                                    })
                                ]
                            }) : /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                className: "tcl-empty-state",
                                children: /*#__PURE__*/ (0, $5OpyM$jsx)("p", {
                                    children: "Select a tab above to continue a conversation."
                                })
                            })
                        })
                    ]
                }) : /*#__PURE__*/ (0, $5OpyM$jsx)($38b317e169159a61$var$CardGridLauncher, {
                    agents: agents,
                    searchQuery: searchQuery,
                    setSearchQuery: setSearchQuery,
                    onOpen: handleSelectAgent
                })
            }),
            showTrace && currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$8020b1ff210ef23b), {
                logs: currentTraceLogs,
                selectedAgent: selectedAgent,
                traceEndRef: traceEndRef,
                onClose: ()=>setShowTrace(false)
            })
        ]
    });
}







function $c172382c35acfe07$export$8020b1ff210ef23b(props) {
    return /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$8020b1ff210ef23b), {
        ...props
    });
}





function $e246cd7cadbde14d$export$880f9f4aae674e9a({ messages: messages, agentName: agentName, agentAvatarBg: agentAvatarBg, agentAvatarColor: agentAvatarColor, chatEndRef: chatEndRef, message: message, isLoading: isLoading, attachedFiles: attachedFiles, textareaRef: textareaRef, fileInputRef: fileInputRef, onMessageChange: onMessageChange, onSend: onSend, onStop: onStop, onFileSelect: onFileSelect, onRemoveAttachment: onRemoveAttachment, onClear: onClear, onShowTrace: onShowTrace, onBack: onBack, evaluations: evaluations, expandedEvaluations: expandedEvaluations, onToggleEvaluation: onToggleEvaluation }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden'
        },
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$148ad0a1a7d03440), {
                messages: messages,
                isLoading: isLoading,
                agentName: agentName,
                chatEndRef: chatEndRef,
                evaluations: evaluations,
                expandedEvaluations: expandedEvaluations,
                onToggleEvaluation: onToggleEvaluation
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $66ee384eb96aa146$export$19b903fd083c557c), {
                message: message,
                isLoading: isLoading,
                attachedFiles: attachedFiles,
                textareaRef: textareaRef,
                fileInputRef: fileInputRef,
                onMessageChange: onMessageChange,
                onSend: onSend,
                onStop: onStop,
                onFileSelect: onFileSelect,
                onRemoveAttachment: onRemoveAttachment
            })
        ]
    });
}







// ---------------------------------------------------------------------------
// Helpers / Sub-components
// ---------------------------------------------------------------------------
function $7e86f0dc501a5e94$var$StatusDot({ status: status }) {
    let color = 'var(--oai-text-disabled)';
    if (status === 'active') color = '#4CAF50';
    if (status === 'inactive') color = '#F44336';
    return /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
        className: "ccl-status-dot",
        style: {
            backgroundColor: color
        },
        title: `Status: ${status}`
    });
}
function $7e86f0dc501a5e94$var$AgentCard({ agent: agent, index: index, onOpen: onOpen, isListView: isListView }) {
    const { bg: bg, color: color } = (0, $52cf8225d0cc4dd9$export$b1592956d14148e9)(index);
    const initials = (0, $52cf8225d0cc4dd9$export$7d6e6cc5a7a4d165)(agent.name);
    if (isListView) return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "ccl-agent-list-item",
        onClick: ()=>onOpen(agent.id),
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "ccl-list-avatar",
                style: {
                    backgroundColor: bg,
                    color: color
                },
                children: initials
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "ccl-list-info",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "ccl-list-name",
                        children: [
                            agent.name,
                            " ",
                            /*#__PURE__*/ (0, $5OpyM$jsx)($7e86f0dc501a5e94$var$StatusDot, {
                                status: agent.status
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "ccl-list-desc",
                        children: agent.description || 'No description available.'
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: "ccl-open-btn ccl-list-open",
                children: "Open"
            })
        ]
    });
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "ccl-agent-card",
        onClick: ()=>onOpen(agent.id),
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "ccl-card-header",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "ccl-card-avatar",
                        style: {
                            backgroundColor: bg,
                            color: color
                        },
                        children: initials
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)($7e86f0dc501a5e94$var$StatusDot, {
                        status: agent.status
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "ccl-card-body",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "ccl-card-name",
                        title: agent.name,
                        children: agent.name
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "ccl-card-desc",
                        title: agent.description,
                        children: agent.description || 'No description provided for this agent.'
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: "ccl-card-footer",
                children: /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                    className: "ccl-open-btn",
                    onClick: (e)=>{
                        e.stopPropagation();
                        onOpen(agent.id);
                    },
                    children: "Open \u2197"
                })
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// SubTabBar
// ---------------------------------------------------------------------------
function $7e86f0dc501a5e94$var$SubTabBar({ currentView: currentView, setCurrentView: setCurrentView }) {
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "ccl-sub-tab-bar",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `ccl-sub-tab ${currentView === 'chat' ? 'ccl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('chat'),
                children: "Chat"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `ccl-sub-tab ${currentView === 'metrics' ? 'ccl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('metrics'),
                children: "Metrics"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `ccl-sub-tab ${currentView === 'logs' ? 'ccl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('logs'),
                children: "Logs"
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                className: `ccl-sub-tab ${currentView === 'tokens' ? 'ccl-sub-tab-active' : ''}`,
                onClick: ()=>setCurrentView('tokens'),
                children: "Tokens"
            })
        ]
    });
}
// ---------------------------------------------------------------------------
// AgentRegistry — the main launcher / registry view
// ---------------------------------------------------------------------------
function $7e86f0dc501a5e94$var$AgentRegistry({ agents: agents, searchQuery: searchQuery, setSearchQuery: setSearchQuery, onOpen: onOpen, registryError: registryError, onShowSettings: onShowSettings }) {
    const [activeTab, setActiveTab] = (0, $5OpyM$useState)('all');
    const [isListView, setIsListView] = (0, $5OpyM$useState)(false);
    const [currentPage, setCurrentPage] = (0, $5OpyM$useState)(1);
    const agentsPerPage = 10; // Display 15 agents per page
    const filtered = (0, $5OpyM$useMemo)(()=>{
        let list = agents;
        if (activeTab === 'online') list = list.filter((a)=>a.status === 'active');
        if (activeTab === 'offline') list = list.filter((a)=>a.status === 'inactive' || a.status === 'unknown');
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((a)=>a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
        }
        setCurrentPage(1); // Reset to first page on filter/tab change
        return list;
    }, [
        agents,
        activeTab,
        searchQuery
    ]);
    // Pagination logic
    const totalPages = Math.ceil(filtered.length / agentsPerPage);
    const paginatedAgents = (0, $5OpyM$useMemo)(()=>{
        const startIndex = (currentPage - 1) * agentsPerPage;
        const endIndex = startIndex + agentsPerPage;
        return filtered.slice(startIndex, endIndex);
    }, [
        filtered,
        currentPage,
        agentsPerPage
    ]);
    const handlePageChange = (pageNumber)=>{
        setCurrentPage(pageNumber);
    };
    const tabs = [
        {
            id: 'all',
            label: 'All Agents'
        },
        {
            id: 'online',
            label: 'Online'
        },
        {
            id: 'offline',
            label: 'Offline'
        }
    ];
    return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
        className: "ccl-registry",
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "ccl-registry-header",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "ccl-header-top",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "ccl-header-title",
                                        children: "Agent registry"
                                    }),
                                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                        className: "ccl-header-sub",
                                        children: "Browse, search, and launch your agents"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: "ccl-settings-btn",
                                onClick: onShowSettings,
                                children: "Settings"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                        className: "ccl-tabs",
                        children: tabs.map((t)=>/*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: `ccl-tab-btn ${activeTab === t.id ? 'ccl-tab-active' : ''}`,
                                onClick: ()=>setActiveTab(t.id),
                                children: t.label
                            }, t.id))
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                className: "ccl-toolbar",
                children: [
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "ccl-search-wrap",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("span", {
                                className: "ccl-search-icon",
                                children: "\u2315"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("input", {
                                className: "ccl-search-input",
                                placeholder: "Search agents\u2026",
                                value: searchQuery,
                                onChange: (e)=>setSearchQuery(e.target.value)
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                        className: "ccl-view-toggles",
                        children: [
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: `ccl-view-btn ${!isListView ? 'ccl-view-active' : ''}`,
                                onClick: ()=>setIsListView(false),
                                title: "Grid View",
                                children: "\u229E"
                            }),
                            /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                className: `ccl-view-btn ${isListView ? 'ccl-view-active' : ''}`,
                                onClick: ()=>setIsListView(true),
                                title: "List View",
                                children: "\u2630"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                className: `ccl-grid-wrap ${isListView ? 'ccl-list-wrap' : ''}`,
                children: registryError ? /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                    className: "ccl-error-msg",
                    style: {
                        padding: '24px',
                        color: '#d32f2f',
                        backgroundColor: '#ffebee',
                        borderRadius: '8px',
                        border: '1px solid #ef9a9a',
                        margin: '16px 0'
                    },
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsx)("strong", {
                            children: "Error loading agents:"
                        }),
                        " ",
                        registryError
                    ]
                }) : /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                            className: `ccl-agent-grid ${isListView ? 'ccl-agent-list' : ''}`,
                            children: paginatedAgents.length === 0 ? /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                className: "ccl-empty-msg",
                                children: "No agents match your search."
                            }) : paginatedAgents.map((agent, i)=>/*#__PURE__*/ (0, $5OpyM$jsx)($7e86f0dc501a5e94$var$AgentCard, {
                                    agent: agent,
                                    index: i,
                                    onOpen: onOpen,
                                    isListView: isListView
                                }, agent.id))
                        }),
                        totalPages > 1 && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "ccl-pagination",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                    onClick: ()=>handlePageChange(currentPage - 1),
                                    disabled: currentPage === 1,
                                    className: "ccl-pagination-btn",
                                    children: "Previous"
                                }),
                                Array.from({
                                    length: totalPages
                                }, (_, i)=>i + 1).map((page)=>/*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                        onClick: ()=>handlePageChange(page),
                                        className: `ccl-pagination-btn ${currentPage === page ? 'ccl-pagination-active' : ''}`,
                                        children: page
                                    }, page)),
                                /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                    onClick: ()=>handlePageChange(currentPage + 1),
                                    disabled: currentPage === totalPages,
                                    className: "ccl-pagination-btn",
                                    children: "Next"
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
}
function $7e86f0dc501a5e94$export$f1bb7d87e7dd8c29(props) {
    const { agents: agents, selectedAgent: selectedAgent, selectedAgentId: selectedAgentId, message: message, searchQuery: searchQuery, attachedFiles: attachedFiles, currentMessages: currentMessages, currentTraceLogs: currentTraceLogs, showTrace: showTrace, isLoading: isLoading, registryError: registryError, chatEndRef: chatEndRef, traceEndRef: traceEndRef, textareaRef: textareaRef, fileInputRef: fileInputRef, handleSelectAgent: handleSelectAgent, handleClearSession: handleClearSession, handleMessageChange: handleMessageChange, handleFileSelect: handleFileSelect, removeAttachment: removeAttachment, handleStopGeneration: handleStopGeneration, handleSendMessage: handleSendMessage, setSearchQuery: setSearchQuery, setShowTrace: setShowTrace, evaluations: evaluations, expandedEvaluations: expandedEvaluations, toggleEvaluation: toggleEvaluation, authToken: authToken } = props;
    const [currentView, setCurrentView] = (0, $5OpyM$useState)('chat');
    const [showSettings, setShowSettings] = (0, $5OpyM$useState)(false);
    // If an agent is selected, show the chat view
    if (selectedAgent) {
        const agentIndex = agents.findIndex((a)=>a.id === selectedAgentId);
        const { bg: bg, color: color } = (0, $52cf8225d0cc4dd9$export$b1592956d14148e9)(agentIndex >= 0 ? agentIndex : 0);
        const initials = (0, $52cf8225d0cc4dd9$export$7d6e6cc5a7a4d165)(selectedAgent.name);
        return /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
            className: "ccl-chat-layout",
            children: [
                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                    className: "ccl-chat-header",
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                            className: "ccl-back-btn",
                            onClick: ()=>handleSelectAgent(null),
                            children: "\u2190 Registry"
                        }),
                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "ccl-chat-agent-info",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                    className: "ccl-chat-avatar",
                                    style: {
                                        backgroundColor: bg,
                                        color: color
                                    },
                                    children: initials
                                }),
                                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                                            className: "ccl-chat-name",
                                            children: [
                                                selectedAgent.name,
                                                " ",
                                                /*#__PURE__*/ (0, $5OpyM$jsx)($7e86f0dc501a5e94$var$StatusDot, {
                                                    status: selectedAgent.status
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                            className: "ccl-chat-desc",
                                            title: selectedAgent.description,
                                            children: selectedAgent.endpoint
                                        })
                                    ]
                                })
                            ]
                        }),
                        currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "ccl-header-actions",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                    className: "ccl-toggle-trace-btn",
                                    onClick: ()=>setShowTrace(!showTrace),
                                    children: showTrace ? 'Hide trace' : 'Show trace'
                                }),
                                /*#__PURE__*/ (0, $5OpyM$jsx)("button", {
                                    className: "ccl-clear-btn",
                                    onClick: handleClearSession,
                                    children: "Clear"
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                    className: "ccl-chat-main",
                    children: [
                        /*#__PURE__*/ (0, $5OpyM$jsxs)("div", {
                            className: "ccl-chat-body",
                            children: [
                                /*#__PURE__*/ (0, $5OpyM$jsx)($7e86f0dc501a5e94$var$SubTabBar, {
                                    currentView: currentView,
                                    setCurrentView: setCurrentView
                                }),
                                currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsx)((0, $e246cd7cadbde14d$export$880f9f4aae674e9a), {
                                    messages: currentMessages,
                                    agentName: selectedAgent.name,
                                    agentAvatarBg: bg,
                                    agentAvatarColor: color,
                                    chatEndRef: chatEndRef,
                                    message: message,
                                    isLoading: isLoading,
                                    attachedFiles: attachedFiles,
                                    textareaRef: textareaRef,
                                    fileInputRef: fileInputRef,
                                    onMessageChange: handleMessageChange,
                                    onSend: handleSendMessage,
                                    onStop: handleStopGeneration,
                                    onFileSelect: handleFileSelect,
                                    onRemoveAttachment: removeAttachment,
                                    onClear: handleClearSession,
                                    onShowTrace: setShowTrace,
                                    onBack: ()=>handleSelectAgent(null),
                                    evaluations: evaluations,
                                    expandedEvaluations: expandedEvaluations,
                                    onToggleEvaluation: toggleEvaluation
                                }),
                                currentView === 'metrics' && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                    className: "metrics",
                                    children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $7dced7559e9c1dad$export$bfaab4c9bb3364f), {
                                        agentEndpoint: selectedAgent.endpoint,
                                        authToken: authToken
                                    })
                                }),
                                currentView === 'logs' && /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                                    className: "logs",
                                    children: /*#__PURE__*/ (0, $5OpyM$jsx)((0, $8970fb668f57fa15$export$3c32ca1728ea32f2), {
                                        selectedAgent: selectedAgent,
                                        authToken: authToken
                                    })
                                }),
                                currentView === 'tokens' && /*#__PURE__*/ (0, $5OpyM$jsx)((0, $1d01d57b5074c4b5$export$aa9349e63a87bac1), {
                                    agentEndpoint: selectedAgent.endpoint,
                                    authToken: authToken
                                })
                            ]
                        }),
                        showTrace && currentView === 'chat' && /*#__PURE__*/ (0, $5OpyM$jsx)((0, $c172382c35acfe07$export$8020b1ff210ef23b), {
                            logs: currentTraceLogs,
                            selectedAgent: selectedAgent,
                            traceEndRef: traceEndRef,
                            onClose: ()=>setShowTrace(false)
                        })
                    ]
                })
            ]
        });
    }
    if (showSettings) return /*#__PURE__*/ (0, $5OpyM$jsx)((0, $2ac663ffd8618082$export$8f6dcfe950367406), {
        onBack: ()=>setShowSettings(false)
    });
    return /*#__PURE__*/ (0, $5OpyM$jsx)($7e86f0dc501a5e94$var$AgentRegistry, {
        agents: agents,
        searchQuery: searchQuery,
        setSearchQuery: setSearchQuery,
        onOpen: handleSelectAgent,
        registryError: registryError,
        onShowSettings: ()=>setShowSettings(true)
    });
}






const $4ebd090c76686cbe$var$LAYOUTS = {
    sidebar: (0, $91ca74acd8eeb46c$export$8295a33ab8a36876),
    tabcard: (0, $38b317e169159a61$export$1806ed9300cedcd4),
    cardchat: (0, $7e86f0dc501a5e94$export$f1bb7d87e7dd8c29)
};
function $4ebd090c76686cbe$export$cc0bceab6c5bea82({ agents: agents = [], agentRegistryUrl: agentRegistryUrl = null, interceptors: interceptors = [], agentTokenMap: agentTokenMap = null, authToken: authToken = 'dummy-token', layout: layout = 'sidebar' }) {
    const coreProps = (0, $afd0fea0e112cfe9$export$ff5f6a678ca1774c)({
        agents: agents,
        agentRegistryUrl: agentRegistryUrl,
        interceptors: interceptors,
        agentTokenMap: agentTokenMap,
        authToken: authToken
    });
    const LayoutComponent = $4ebd090c76686cbe$var$LAYOUTS[layout] ?? (0, $91ca74acd8eeb46c$export$8295a33ab8a36876);
    return /*#__PURE__*/ (0, $5OpyM$jsx)(LayoutComponent, {
        ...coreProps
    });
}




const $bb5cfbf4a77d797f$var$LAYOUTS = [
    {
        id: 'sidebar',
        label: 'Sidebar',
        icon: /*#__PURE__*/ (0, $5OpyM$jsxs)("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "1",
                    y: "1",
                    width: "4",
                    height: "14",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".9"
                }),
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "7",
                    y: "1",
                    width: "8",
                    height: "14",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".35"
                })
            ]
        })
    },
    {
        id: 'tabcard',
        label: 'Tabs',
        icon: /*#__PURE__*/ (0, $5OpyM$jsxs)("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "1",
                    y: "1",
                    width: "4",
                    height: "14",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".35"
                }),
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "7",
                    y: "1",
                    width: "3",
                    height: "4",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".9"
                }),
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "11",
                    y: "1",
                    width: "4",
                    height: "4",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".9"
                }),
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "7",
                    y: "7",
                    width: "8",
                    height: "8",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".35"
                })
            ]
        })
    },
    {
        id: 'cardchat',
        label: 'Cards',
        icon: /*#__PURE__*/ (0, $5OpyM$jsxs)("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "1",
                    y: "1",
                    width: "6",
                    height: "6",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".9"
                }),
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "9",
                    y: "1",
                    width: "6",
                    height: "6",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".9"
                }),
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "1",
                    y: "9",
                    width: "6",
                    height: "6",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".35"
                }),
                /*#__PURE__*/ (0, $5OpyM$jsx)("rect", {
                    x: "9",
                    y: "9",
                    width: "6",
                    height: "6",
                    rx: "1",
                    fill: "currentColor",
                    opacity: ".35"
                })
            ]
        })
    }
];
const $bb5cfbf4a77d797f$var$switcherStyles = `
.layout-switcher {
    position: fixed;
    z-index: 9999;
    display: flex;
    align-items: center;
    background: #0f172a;
    border: 0.5px solid #1e293b;
    border-radius: 12px;
    padding: 4px;
    gap: 2px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    cursor: grab;
}
.layout-switcher:active {
    cursor: grabbing;
}
.layout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 8px;
    border: none;
    background: none;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
}
.layout-btn:hover { color: #94a3b8; background: #1e293b; }
.layout-btn.active { background: #6366f1; color: #fff; }
`;
function $bb5cfbf4a77d797f$export$f6f197065d2a5277({ layout: layout, setLayout: setLayout }) {
    const switcherRef = (0, $5OpyM$useRef)(null);
    const [isDragging, setIsDragging] = (0, $5OpyM$useState)(false);
    const [position, setPosition] = (0, $5OpyM$useState)({
        x: window.innerWidth - 250,
        y: window.innerHeight - 70
    });
    const [offset, setOffset] = (0, $5OpyM$useState)({
        x: 0,
        y: 0
    });
    (0, $5OpyM$useEffect)(()=>{
        const handleMouseMove = (e)=>{
            if (isDragging) setPosition({
                x: e.clientX - offset.x,
                y: e.clientY - offset.y
            });
        };
        const handleMouseUp = ()=>{
            setIsDragging(false);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return ()=>{
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [
        isDragging,
        offset
    ]);
    const handleMouseDown = (e)=>{
        // Prevent dragging when clicking on a button
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        setIsDragging(true);
        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };
    return /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)("style", {
                children: $bb5cfbf4a77d797f$var$switcherStyles
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)("div", {
                ref: switcherRef,
                className: "layout-switcher",
                style: {
                    top: `${position.y}px`,
                    left: `${position.x}px`
                },
                onMouseDown: handleMouseDown,
                role: "toolbar",
                "aria-label": "Switch layout",
                children: $bb5cfbf4a77d797f$var$LAYOUTS.map((l)=>/*#__PURE__*/ (0, $5OpyM$jsxs)("button", {
                        className: `layout-btn ${layout === l.id ? 'active' : ''}`,
                        onClick: ()=>setLayout(l.id),
                        title: l.label,
                        children: [
                            l.icon,
                            l.label
                        ]
                    }, l.id))
            })
        ]
    });
}





function $71a1888b84a3795a$export$877ecfc5db27b7cf({ agentRegistryUrl: agentRegistryUrl, authToken: authToken }) {
    const [layout, setLayout] = (0, $5OpyM$useState)('sidebar');
    return /*#__PURE__*/ (0, $5OpyM$jsxs)((0, $5OpyM$Fragment), {
        children: [
            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $4ebd090c76686cbe$export$cc0bceab6c5bea82), {
                agentRegistryUrl: agentRegistryUrl,
                authToken: authToken,
                layout: layout
            }),
            /*#__PURE__*/ (0, $5OpyM$jsx)((0, $bb5cfbf4a77d797f$export$f6f197065d2a5277), {
                layout: layout,
                setLayout: setLayout
            })
        ]
    });
}




export {$4ebd090c76686cbe$export$cc0bceab6c5bea82 as AgentUI, $bb5cfbf4a77d797f$export$f6f197065d2a5277 as LayoutSwitcher, $71a1888b84a3795a$export$877ecfc5db27b7cf as AgentRegistryApp};
//# sourceMappingURL=module.js.map
