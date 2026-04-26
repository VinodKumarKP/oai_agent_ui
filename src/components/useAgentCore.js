import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// Bypassing Parcel's module resolution issue with exports map by importing the exact file
import { ClientFactory, ClientFactoryOptions, DefaultAgentCardResolver } from '@a2a-js/sdk/dist/client/index.js';

// ---------------------------------------------------------------------------
// Auth helpers (unchanged from original AgentUI.js)
// ---------------------------------------------------------------------------

function resolveToken(tokenMap, ...lookupKeys) {
    for (const key of lookupKeys) {
        if (key && tokenMap.has(key)) return tokenMap.get(key);
    }
    return tokenMap.get('default') ?? null;
}

class PerAgentAuthInterceptor {
    /** @param {Map<string, string>} tokenMap */
    constructor(tokenMap) { this.tokenMap = tokenMap; }

    before(args) {
        if (args.agentCard) {
            const token = resolveToken(this.tokenMap, args.agentCard.id, args.agentCard.url);
            if (token) {
                args.options = {
                    ...(args.options || {}),
                    serviceParameters: {
                        ...(args.options?.serviceParameters || {}),
                        Authorization: `Bearer ${token}`,
                    },
                };
            }
        }
        return Promise.resolve();
    }

    after() { return Promise.resolve(); }
}

function buildClientFactoryOptions(authToken, agentTokenMap, customInterceptors, agentBaseUrl) {
    if (authToken) {
        const authenticatedCardFetch = async (url, init = {}) =>
            fetch(url, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${authToken}` } });

        const globalTokenInterceptor = {
            before(args) {
                args.options = {
                    ...(args.options || {}),
                    serviceParameters: {
                        ...(args.options?.serviceParameters || {}),
                        Authorization: `Bearer ${authToken}`,
                    },
                };
                return Promise.resolve();
            },
            after() { return Promise.resolve(); },
        };

        return ClientFactoryOptions.createFrom(ClientFactoryOptions.default, {
            cardResolver: new DefaultAgentCardResolver({ fetchImpl: authenticatedCardFetch }),
            clientConfig: { interceptors: [globalTokenInterceptor] },
        });
    }

    if (agentTokenMap) {
        const authenticatedCardFetch = async (url, init = {}) => {
            const token = resolveToken(agentTokenMap, agentBaseUrl);
            return fetch(url, {
                ...init,
                headers: { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
        };

        return ClientFactoryOptions.createFrom(ClientFactoryOptions.default, {
            cardResolver: new DefaultAgentCardResolver({ fetchImpl: authenticatedCardFetch }),
            clientConfig: { interceptors: [new PerAgentAuthInterceptor(agentTokenMap)] },
        });
    }

    return ClientFactoryOptions.createFrom(ClientFactoryOptions.default, {
        clientConfig: { interceptors: customInterceptors ?? [] },
    });
}

// ---------------------------------------------------------------------------
// useAgentCore — all shared state & handlers, layout-agnostic
// ---------------------------------------------------------------------------

export function useAgentCore({
    agents: initialAgents = [],
    agentRegistryUrl = null,
    interceptors: customInterceptors = [],
    agentTokenMap = null,
    authToken = 'dummy-token',
}) {
    const [agents, setAgents]                   = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [openAgentIds, setOpenAgentIds]       = useState([]);
    const [message, setMessage]                 = useState('');
    const [searchQuery, setSearchQuery]         = useState('');
    const [attachedFiles, setAttachedFiles]     = useState([]);
    const [chatHistory, setChatHistory]         = useState({});
    const [traceLogs, setTraceLogs]             = useState({});
    const [agentContexts, setAgentContexts]     = useState({});
    const [showTrace, setShowTrace]             = useState(false);
    const [isLoading, setIsLoading]             = useState(false);
    const [unreadCounts, setUnreadCounts]       = useState({});
    const [registryError, setRegistryError]     = useState(null);
    const [evaluations, setEvaluations]         = useState({});
    const [expandedEvaluations, setExpandedEvaluations] = useState(new Set());

    const abortControllerRef = useRef(null);
    const chatEndRef         = useRef(null);
    const traceEndRef        = useRef(null);
    const textareaRef        = useRef(null);
    const fileInputRef       = useRef(null);
    const initialAgentsRef   = useRef(initialAgents);

    // ── Fetch agents from registry ──────────────────────────────────────────
    const fetchAgents = useCallback(async () => {
        let loadedAgents = [];
        const options = {
            headers: { Accept: 'application/json', Authorization: `Bearer ${authToken}` },
        };

        let registryUrl = agentRegistryUrl?.toString() ?? '';
        if (registryUrl) {
            if (!registryUrl.endsWith('/info')) {
                registryUrl = registryUrl.endsWith('/')
                    ? `${registryUrl}info`
                    : `${registryUrl}/info`;
            }
            try {
                const response = await fetch(registryUrl, options);
                if (response.ok) {
                    const data = await response.json();
                    if (data.agents) {
                        loadedAgents = Object.entries(data.agents).map(([id, info]) => {
                            let endpoint = info.endpoint;
                            if (!endpoint.startsWith('http')) endpoint = `http://${endpoint}`;
                            if (!endpoint.endsWith('/a2a') && !endpoint.endsWith('/a2a/'))
                                endpoint = endpoint.endsWith('/') ? `${endpoint}a2a` : `${endpoint}/a2a`;
                            return {
                                id,
                                endpoint,
                                name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                description: info.description,
                                status: info.status,
                            };
                        });
                    } else if (data.agent_name) {
                        let endpoint = data.endpoint;
                        if (endpoint && !endpoint.startsWith('http')) endpoint = `http://${endpoint}`;
                        if (endpoint && !endpoint.endsWith('/a2a') && !endpoint.endsWith('/a2a/'))
                            endpoint = endpoint.endsWith('/') ? `${endpoint}a2a` : `${endpoint}/a2a`;
                        loadedAgents = [{
                            id: data.agent_name,
                            endpoint,
                            name: data.agent_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            description: data.description,
                            status: data.initialized ? 'active' : 'inactive',
                        }];
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

        if (loadedAgents.length === 0 && initialAgentsRef.current?.length > 0)
            loadedAgents = initialAgentsRef.current;

        setAgents(loadedAgents.map(a => ({ ...a, status: a.status || 'unknown' })));
    }, [agentRegistryUrl, authToken]);

    useEffect(() => { fetchAgents(); }, [fetchAgents]);

    // ── Auto-scroll ──────────────────────────────────────────────────────────
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, selectedAgentId, isLoading]);

    useEffect(() => {
        if (showTrace) traceEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [traceLogs, selectedAgentId, showTrace]);

    // ── Textarea resize ──────────────────────────────────────────────────────
    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    const resetTextarea = () => {
        setMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    // ── Agent selection (opens tab) ──────────────────────────────────────────
    const handleSelectAgent = useCallback((agentId) => {
        setSelectedAgentId(agentId);
        if (agentId) {
            setOpenAgentIds(prev => prev.includes(agentId) ? prev : [...prev, agentId]);
            setUnreadCounts(prev => ({ ...prev, [agentId]: 0 }));
        }
    }, []);

    // ── Close tab ────────────────────────────────────────────────────────────
    const handleCloseTab = useCallback((agentId, e) => {
        e?.stopPropagation();
        setOpenAgentIds(prev => {
            const next = prev.filter(id => id !== agentId);
            if (agentId === selectedAgentId) {
                const idx = prev.indexOf(agentId);
                const nextSelected = next[idx] ?? next[idx - 1] ?? next[0] ?? null;
                setSelectedAgentId(nextSelected);
            }
            return next;
        });
    }, [selectedAgentId]);

    // ── Clear session ────────────────────────────────────────────────────────
    const handleClearSession = useCallback(() => {
        if (!selectedAgentId) return;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
        setChatHistory(prev  => { const s = { ...prev  }; delete s[selectedAgentId]; return s; });
        setTraceLogs(prev    => { const s = { ...prev  }; delete s[selectedAgentId]; return s; });
        setAgentContexts(prev => { const s = { ...prev }; delete s[selectedAgentId]; return s; });
        setAttachedFiles([]);
    }, [selectedAgentId]);

    // ── File handling ────────────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64Data = ev.target.result.split(',')[1];
                setAttachedFiles(prev => [...prev, {
                    name: file.name,
                    mimeType: file.type || 'application/octet-stream',
                    bytes: base64Data,
                }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = null;
    };

    const removeAttachment = (index) => setAttachedFiles(prev => prev.filter((_, i) => i !== index));

    // ── Stop generation ──────────────────────────────────────────────────────
    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    // ── Send message ─────────────────────────────────────────────────────────
    const handleSendMessage = async () => {
        if ((!message.trim() && attachedFiles.length === 0) || !selectedAgentId || isLoading) return;

        const selectedAgent       = agents.find(a => a.id === selectedAgentId);
        
        if (!selectedAgent) {
            console.error('Selected agent not found in the list of agents.');
            setChatHistory(prev => ({
                ...prev,
                [selectedAgentId]: [...(prev[selectedAgentId] || []), {
                    sender: 'System',
                    text: `Error: The selected agent could not be found. Please refresh the page or try selecting the agent again.`,
                }],
            }));
            return;
        }

        const currentMessageText  = message;
        const currentAttachments  = [...attachedFiles];

        setChatHistory(prev => ({
            ...prev,
            [selectedAgentId]: [...(prev[selectedAgentId] || []), {
                sender: 'You',
                text: currentMessageText,
                attachments: currentAttachments.map(f => f.name),
            }],
        }));

        resetTextarea();
        setAttachedFiles([]);
        setIsLoading(true);
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            let baseUrl = selectedAgent.endpoint;
            if (!baseUrl.endsWith('/')) baseUrl += '/';

            const factoryOptions = buildClientFactoryOptions(authToken, agentTokenMap, customInterceptors, baseUrl);
            const factory        = new ClientFactory(factoryOptions);
            const client         = await factory.createFromUrl(baseUrl);
            const msgId          = crypto?.randomUUID?.() ?? `msg-${Date.now()}-${Math.random()}`;
            const currentContextId = agentContexts[selectedAgentId];

            const parts = [];
            if (currentMessageText.trim()) parts.push({ kind: 'text', text: currentMessageText });
            currentAttachments.forEach(f => parts.push({
                kind: 'file',
                file: { name: f.name, mimeType: f.mimeType, bytes: f.bytes },
            }));

            const stream = client.sendMessageStream({
                message: {
                    messageId: msgId,
                    role: 'user',
                    parts,
                    kind: 'message',
                    ...(currentContextId && { contextId: currentContextId }),
                },
            });

            let currentTaskId = null;

            for await (const event of stream) {
                if (signal.aborted) throw new Error('User aborted the request.');

                if (event.contextId) {
                    setAgentContexts(prev => ({ ...prev, [selectedAgentId]: event.contextId }));
                }

                const timestamp = new Date().toLocaleTimeString('en-US', {
                    hour12: false, hour: '2-digit', minute: '2-digit',
                    second: '2-digit', fractionalSecondDigits: 3,
                });

                // Capture task_id from task events
                if (event.kind === 'task') {
                    currentTaskId = event.id;
                }

                // Trace logging
                setTraceLogs(prev => {
                    const currentLogs = prev[selectedAgentId] || [];
                    let traceType = 'Unknown Event', summary = '', details = '';

                    if (event.kind === 'task') {
                        traceType = 'Task Init';
                        summary   = `[${event.status?.state?.toUpperCase() || 'UNKNOWN'}] ID: ${event.id}`;
                    } else if (event.kind === 'status-update') {
                        traceType = 'Status Update';
                        summary   = `[${event.status?.state?.toUpperCase() || 'UNKNOWN'}] ID: ${event.taskId}`;
                        if (event.final) summary += ' (FINAL)';
                    } else if (event.kind === 'artifact-update') {
                        traceType = 'Artifact';
                        summary   = `${event.artifact?.name || 'Unnamed'} | Appended: ${event.append ? 'Y' : 'N'} | Last: ${event.lastChunk ? 'Y' : 'N'}`;
                        const textContent = event.artifact?.parts?.find(p => p.kind === 'text')?.text;
                        if (textContent) details = textContent;
                    } else if (event.kind === 'message') {
                        traceType = 'Message';
                        summary   = `Role: ${event.role}`;
                    } else {
                        traceType = `${event.kind}`;
                    }

                    return {
                        ...prev,
                        [selectedAgentId]: [...currentLogs, { timestamp, kind: event.kind, traceType, summary, details, raw: event }],
                    };
                });

                // Main chat window
                let responseText = '';
                if (event.kind === 'status-update') {
                    const textPart = event.status?.message?.parts?.find(p => p.kind === 'text');
                    if (textPart) responseText = textPart.text;
                } else if (event.kind === 'message') {
                    const textPart = event.parts?.find(p => p.kind === 'text');
                    if (textPart) responseText = textPart.text;
                }

                if (responseText) {
                    const responseMessage = {
                        sender: selectedAgent.name,
                        text: responseText,
                        taskId: currentTaskId
                    };
                    setChatHistory(prev => {
                        const currentHistory = prev[selectedAgentId] || [];
                        const lastMessage    = currentHistory[currentHistory.length - 1];
                        if (lastMessage?.sender === selectedAgent.name) {
                            return { ...prev, [selectedAgentId]: [...currentHistory.slice(0, -1), responseMessage] };
                        }
                        return { ...prev, [selectedAgentId]: [...currentHistory, responseMessage] };
                    });
                }
            }

            // Fetch evaluation after stream completes
            if (currentTaskId) {
                fetchEvaluation(currentTaskId, baseUrl);
            }
        } catch (e) {
            // Error is already handled by adding a system message to chat history
            if (e.message !== 'User aborted the request.') {
                const errDetails = e instanceof Error ? e.message : String(e);
                setChatHistory(prev => ({
                    ...prev,
                    [selectedAgentId]: [...(prev[selectedAgentId] || []), {
                        sender: 'System',
                        text: `Error communicating with ${agents.find(a => a.id === selectedAgentId)?.name || 'Agent'}. Details: ${errDetails}`,
                    }],
                }));
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    // ── Fetch evaluation ─────────────────────────────────────────────────────
    const fetchEvaluation = useCallback(async (taskId, agentEndpoint, retryCount = 0) => {
        if (!taskId || !agentEndpoint) return;

        const maxRetries = 3;
        const retryDelay = 15000; // 15 seconds

        try {
            const evaluationUrl = `${agentEndpoint.replace(/\/$/, '')}/evaluations/${taskId}`;
            const response = await fetch(evaluationUrl, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const evaluationData = await response.json();
                setEvaluations(prev => ({ ...prev, [taskId]: evaluationData }));
            } else if (response.status === 404 && retryCount < maxRetries) {
                // Evaluation not ready yet, retry after delay
                setTimeout(() => fetchEvaluation(taskId, agentEndpoint, retryCount + 1), retryDelay);
            } else {
                console.warn(`Failed to fetch evaluation for task ${taskId}: ${response.status}`);
            }
        } catch (error) {
            if (retryCount < maxRetries) {
                // Network error, retry after delay
                setTimeout(() => fetchEvaluation(taskId, agentEndpoint, retryCount + 1), retryDelay);
            } else {
                console.warn(`Error fetching evaluation for task ${taskId} after ${maxRetries} retries:`, error);
            }
        }
    }, [authToken]);

    // ── Toggle evaluation display ─────────────────────────────────────────────
    const toggleEvaluation = useCallback((taskId) => {
        setExpandedEvaluations(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    }, []);

    // ── Derived values ───────────────────────────────────────────────────────
    const filteredAgents = useMemo(() => {
        if (!searchQuery.trim()) return agents;
        const q = searchQuery.toLowerCase();
        return agents.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.description?.toLowerCase().includes(q)
        );
    }, [agents, searchQuery]);

    const selectedAgent    = agents.find(a => a.id === selectedAgentId) ?? null;
    const currentMessages  = chatHistory[selectedAgentId]  || [];
    const currentTraceLogs = traceLogs[selectedAgentId]    || [];
    const openAgents       = openAgentIds.map(id => agents.find(a => a.id === id)).filter(Boolean);

    return {
        // State
        agents, filteredAgents, openAgents,
        selectedAgent, selectedAgentId,
        message, searchQuery,
        attachedFiles,
        currentMessages, currentTraceLogs,
        showTrace, isLoading, unreadCounts,
        registryError, evaluations, expandedEvaluations,
        // Refs
        chatEndRef, traceEndRef, textareaRef, fileInputRef,
        // Handlers
        fetchAgents,
        handleSelectAgent, handleCloseTab,
        handleClearSession,
        handleMessageChange, resetTextarea,
        handleFileSelect, removeAttachment,
        handleStopGeneration, handleSendMessage,
        setSearchQuery, setShowTrace,
        fetchEvaluation, toggleEvaluation,
    };
}