import React, { useState, useRef, useEffect, useCallback } from 'react';
import { parseUrl, isValidGitUrl, normalizeName, DESCRIPTION_MIN_LENGTH } from './helpers';

/* ── Log-line helpers ────────────────────────────────────────────────────── */
let _logId = 0;
function makeLogLine(raw) {
    // Try to parse JSON lines (common for structured streams)
    let level = 'info';
    let text  = raw;
    try {
        const obj = JSON.parse(raw);
        text  = obj.message ?? obj.msg ?? obj.text ?? obj.log ?? raw;
        level = (obj.level ?? obj.severity ?? 'info').toLowerCase();
    } catch { /* plain text line */ }

    if (!level || !['info','warn','warning','error','success','debug'].includes(level)) {
        // Heuristic: colour lines that look like errors/warnings
        const lower = text.toLowerCase();
        if (/\b(error|fail|exception|traceback)\b/.test(lower)) level = 'error';
        else if (/\b(warn|warning)\b/.test(lower))               level = 'warn';
        else if (/\b(success|done|complete|finished)\b/.test(lower)) level = 'success';
    }
    if (level === 'warning') level = 'warn';

    return { id: ++_logId, level, text };
}

/* ── Register Tab ────────────────────────────────────────────────────────── */
export function RegisterTab({ agentRegistryUrl, authToken }) {
    const [name, setName]               = useState('');
    const [description, setDescription] = useState('');
    const [sourceUrl, setSourceUrl]     = useState('');
    const [endpoint, setEndpoint]       = useState('');
    const [port, setPort]               = useState('');
    const [framework, setFramework]     = useState('langgraph');
    const [deploymentMode, setDeploymentMode] = useState('docker');
    const [tags, setTags]               = useState([]);
    const [tagInput, setTagInput]        = useState('');
    const [prompts, setPrompts]          = useState([]);
    const [promptInput, setPromptInput]  = useState('');
    const [active, setActive]           = useState(true);
    const [isLoading, setIsLoading]     = useState(false);
    const [error, setError]             = useState('');
    const [success, setSuccess]         = useState('');

    // Streaming log state
    const [logLines, setLogLines]       = useState([]);
    const [logOpen, setLogOpen]         = useState(false);
    const [streaming, setStreaming]     = useState(false);
    const logEndRef                     = useRef(null);
    const abortRef                      = useRef(null);

    // Auto-scroll log panel to bottom as new lines arrive
    useEffect(() => {
        if (logOpen && logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logLines, logOpen]);

    // Touched states for validation
    const [nameTouched, setNameTouched]           = useState(false);
    const [descTouched, setDescTouched]           = useState(false);
    const [urlTouched, setUrlTouched]             = useState(false);

    const parsedUrl     = parseUrl(sourceUrl);
    const gitUrlValid   = isValidGitUrl(sourceUrl);
    const descWordCount = description.trim().split(/\s+/).filter(Boolean).length;
    const descValid     = description.trim().length >= DESCRIPTION_MIN_LENGTH;

    const handleNameChange = (e) => {
        setName(normalizeName(e.target.value));
        setNameTouched(true);
    };

    const handleDescChange = (e) => {
        setDescription(e.target.value);
        setDescTouched(true);
    };

    const handleUrlChange = (e) => {
        setSourceUrl(e.target.value);
        setUrlTouched(true);
    };

    const handleFrameworkChange = (e) => {
        setFramework(e.target.value);
    };

    const handleDeploymentModeChange = (e) => {
        setDeploymentMode(e.target.value);
    };

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleAddPrompt = () => {
        const trimmed = promptInput.trim();
        if (trimmed && !prompts.includes(trimmed)) {
            setPrompts([...prompts, trimmed]);
            setPromptInput('');
        }
    };

    const handleRemovePrompt = (index) => {
        setPrompts(prompts.filter((_, i) => i !== index));
    };

    const handlePromptKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddPrompt();
        }
    };

    const validate = () => {
        if (!name.trim())        return 'Name is required.';
        if (!descValid)          return `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.`;
        if (!sourceUrl.trim())   return 'Source URL is required.';
        if (!gitUrlValid)        return 'Source URL must be a valid Git URL (HTTPS, SSH, or git://).';
        return null;
    };

    const resetForm = () => {
        setName(''); setDescription(''); setSourceUrl(''); setEndpoint(''); setPort('');
        setFramework('langgraph'); setDeploymentMode('docker'); setActive(true); setTags([]); setPrompts([]);
        setNameTouched(false); setDescTouched(false); setUrlTouched(false);
    };

    const handleRegister = useCallback(async () => {
        setNameTouched(true); setDescTouched(true); setUrlTouched(true);
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        // Abort any previous stream
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current  = controller;

        setIsLoading(true);
        setStreaming(true);
        setError('');
        setSuccess('');
        setLogLines([]);
        setLogOpen(true);

        const url = new URL(`${agentRegistryUrl}/register`);
        url.searchParams.set('stream_output', 'true');

        try {
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    source: sourceUrl.trim(),
                    endpoint: endpoint.trim() || null,
                    port: port ? parseInt(port, 10) : null,
                    framework,
                    deployment_mode: deploymentMode,
                    tags,
                    prompts,
                    active,
                    registered_via: 'registry',
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const errorMsg = err.message
                    || (typeof err.detail === 'string' ? err.detail : err.detail?.msg || JSON.stringify(err.detail))
                    || `Registration failed (${response.status})`;
                setError(errorMsg);
                setStreaming(false);
                setIsLoading(false);
                return;
            }

            // --- Read the stream line by line ---
            const reader  = response.body.getReader();
            const decoder = new TextDecoder();
            let   buffer  = '';
            let   done    = false;

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) buffer += decoder.decode(value, { stream: true });

                // Flush complete lines
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete last segment

                const newLines = lines
                    .map(l => l.trim())
                    .filter(Boolean)
                    .map(makeLogLine);

                if (newLines.length) {
                    setLogLines(prev => [...prev, ...newLines]);
                }
            }

            // Flush any remaining buffer content
            if (buffer.trim()) {
                setLogLines(prev => [...prev, makeLogLine(buffer.trim())]);
            }

            setSuccess('Agent registered successfully.');
            resetForm();
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError('Network error. Please try again.');
            }
        } finally {
            setStreaming(false);
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, description, sourceUrl, endpoint, port, framework, deploymentMode, tags, prompts, active, agentRegistryUrl, authToken]);

    const handleAbort = () => {
        if (abortRef.current) abortRef.current.abort();
        setStreaming(false);
        setIsLoading(false);
        setLogLines(prev => [...prev, { id: ++_logId, level: 'warn', text: 'Registration cancelled by user.' }]);
    };

    return (
        <>
            <p className="cfg-intro">
                Add a new agent to the registry. Once registered, it will appear in the sidebar and be available for conversations.
            </p>

            <div className="cfg-card">
                <div className="cfg-card-header">
                    <div className="cfg-card-header-text">
                        <div className="cfg-card-title">Agent Details</div>
                        <div className="cfg-card-subtitle">Configure the new agent's properties.</div>
                    </div>
                </div>
                <div className="cfg-card-body">
                    {/* Name */}
                    <div className={`cfg-field ${nameTouched && !name.trim() ? 'cfg-field--invalid' : ''}`}>
                        <div>
                            <div className="cfg-field-label">Name</div>
                            <div className="cfg-field-hint">Lowercase · spaces become underscores</div>
                        </div>
                        <div>
                            <input
                                type="text"
                                className={`cfg-input ${nameTouched && !name.trim() ? 'cfg-input--invalid' : ''}`}
                                placeholder="e.g. code_reviewer"
                                value={name}
                                onChange={handleNameChange}
                                onBlur={() => setNameTouched(true)}
                            />
                            {nameTouched && !name.trim() && (
                                <div className="cfg-field-error">Name is required.</div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className={`cfg-field ${descTouched && !descValid ? 'cfg-field--invalid' : ''}`}>
                        <div>
                            <div className="cfg-field-label">Description</div>
                            <div className="cfg-field-hint">Min {DESCRIPTION_MIN_LENGTH} characters</div>
                        </div>
                        <div>
                            <textarea
                                className={`cfg-textarea ${descTouched && !descValid ? 'cfg-input--invalid' : ''}`}
                                placeholder="Describe what this agent does, its capabilities, and intended use…"
                                value={description}
                                onChange={handleDescChange}
                                onBlur={() => setDescTouched(true)}
                            />
                            <div className="cfg-field-meta">
                                {descTouched && !descValid ? (
                                    <span className="cfg-field-error">
                                        At least {DESCRIPTION_MIN_LENGTH} characters required ({description.trim().length} so far).
                                    </span>
                                ) : (
                                    <span className="cfg-field-count">{description.trim().length} chars · {descWordCount} words</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Source URL */}
                    <div className={`cfg-field ${urlTouched && sourceUrl && !gitUrlValid ? 'cfg-field--invalid' : ''}`}>
                        <div>
                            <div className="cfg-field-label">Source URL</div>
                            <div className="cfg-field-hint">Must be a valid Git URL</div>
                        </div>
                        <div>
                            <input
                                type="text"
                                className={`cfg-input ${urlTouched && sourceUrl && !gitUrlValid ? 'cfg-input--invalid' : ''}`}
                                placeholder="https://github.com/org/repo.git"
                                value={sourceUrl}
                                onChange={handleUrlChange}
                                onBlur={() => setUrlTouched(true)}
                            />
                            {urlTouched && sourceUrl && !gitUrlValid ? (
                                <div className="cfg-field-error">
                                    Must be a valid Git URL — e.g. <code className="cfg-code">https://github.com/org/repo.git</code> or <code className="cfg-code">git@github.com:org/repo.git</code>
                                </div>
                            ) : (
                                <div className={`cfg-url-preview ${parsedUrl && gitUrlValid ? 'visible' : ''}`}>
                                    {parsedUrl && gitUrlValid && (
                                        <>
                                            <span className="cfg-url-scheme">{parsedUrl.scheme}</span>
                                            <span className="cfg-url-host">{parsedUrl.host}</span>
                                            <span className="cfg-url-path">{parsedUrl.path}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Endpoint (Optional) */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Endpoint</div>
                            <div className="cfg-field-hint">Optional · agent server address</div>
                        </div>
                        <div>
                            <input
                                type="text"
                                className="cfg-input"
                                placeholder="e.g. http://localhost:8000"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Port (Optional) */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Port</div>
                            <div className="cfg-field-hint">Optional · numeric port number</div>
                        </div>
                        <div>
                            <input
                                type="number"
                                className="cfg-input"
                                placeholder="e.g. 8000"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                min="1"
                                max="65535"
                            />
                        </div>
                    </div>

                    {/* Framework */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Framework</div>
                            <div className="cfg-field-hint">Select the agent framework</div>
                        </div>
                        <div>
                            <select
                                className="cfg-input"
                                value={framework}
                                onChange={handleFrameworkChange}
                            >
                                <option value="langgraph">LangGraph</option>
                                <option value="strands">Strands</option>
                                <option value="crewai">CrewAI</option>
                                <option value="openai">OpenAI</option>
                            </select>
                        </div>
                    </div>

                    {/* Deployment Mode */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Deployment Mode</div>
                            <div className="cfg-field-hint">Select the agent deployment mode</div>
                        </div>
                        <div>
                            <select
                                className="cfg-input"
                                value={deploymentMode}
                                onChange={handleDeploymentModeChange}
                            >
                                <option value="docker">Docker</option>
                                <option value="kubernetes">Kubernetes</option>
                                <option value="python_package">Python Package</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Tags</div>
                            <div className="cfg-field-hint">Optional · add descriptive tags</div>
                        </div>
                        <div>
                            <div className="cfg-list-input-container">
                                <input
                                    type="text"
                                    className="cfg-input"
                                    placeholder="Enter a tag and press Enter"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyPress}
                                />
                                <button
                                    type="button"
                                    className="cfg-list-add-btn"
                                    onClick={handleAddTag}
                                    disabled={!tagInput.trim()}
                                >
                                    +
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div className="cfg-list-items">
                                    {tags.map((tag, index) => (
                                        <div key={index} className="cfg-list-item">
                                            <span className="cfg-list-item-text">{tag}</span>
                                            <button
                                                type="button"
                                                className="cfg-list-item-remove"
                                                onClick={() => handleRemoveTag(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {tags.length === 0 && (
                                <div className="cfg-list-empty">No tags added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Prompts */}
                    <div className="cfg-field">
                        <div>
                            <div className="cfg-field-label">Prompts</div>
                            <div className="cfg-field-hint">Optional · add system prompts or instructions</div>
                        </div>
                        <div>
                            <div className="cfg-list-input-container">
                                <textarea
                                    className="cfg-input cfg-textarea-compact"
                                    placeholder="Enter a prompt and press Enter"
                                    value={promptInput}
                                    onChange={(e) => setPromptInput(e.target.value)}
                                    onKeyDown={handlePromptKeyPress}
                                    rows="2"
                                />
                                <button
                                    type="button"
                                    className="cfg-list-add-btn"
                                    onClick={handleAddPrompt}
                                    disabled={!promptInput.trim()}
                                >
                                    +
                                </button>
                            </div>
                            {prompts.length > 0 && (
                                <div className="cfg-list-items">
                                    {prompts.map((prompt, index) => (
                                        <div key={index} className="cfg-list-item cfg-list-item-prompt">
                                            <span className="cfg-list-item-text">{prompt}</span>
                                            <button
                                                type="button"
                                                className="cfg-list-item-remove"
                                                onClick={() => handleRemovePrompt(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {prompts.length === 0 && (
                                <div className="cfg-list-empty">No prompts added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Active toggle */}
                    <div className="cfg-field cfg-field--last">
                        <div>
                            <div className="cfg-field-label">Status</div>
                            <div className="cfg-field-hint">Enable immediately on register</div>
                        </div>
                        <div className="cfg-toggle-row">
                            <label className="cfg-toggle">
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={e => setActive(e.target.checked)}
                                />
                                <div className="cfg-toggle-track" />
                            </label>
                            <span className={`cfg-toggle-status ${active ? 'is-active' : ''}`}>
                                {active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions + feedback */}
            <div className="cfg-actions cfg-actions--card">
                <div className="cfg-actions-feedback">
                    {error && (
                        <div className="cfg-notice cfg-notice-error">
                            <span className="cfg-notice-icon">✕</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="cfg-notice cfg-notice-success">
                            <span className="cfg-notice-icon">✓</span>
                            {success}
                        </div>
                    )}
                </div>
                <div className="cfg-action-btns">
                    {streaming && (
                        <button
                            className="cfg-cancel-btn"
                            onClick={handleAbort}
                        >
                            <span>✕</span>
                            Cancel
                        </button>
                    )}
                    <button
                        className="cfg-submit-btn"
                        onClick={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="cfg-spinner" />
                                Registering…
                            </>
                        ) : (
                            <>
                                <span className="cfg-submit-icon">↑</span>
                                Register Agent
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Streaming Log Panel ───────────────────────────────────────── */}
            {logLines.length > 0 && (
                <div className="reg-log-card">
                    <button
                        className="reg-log-header"
                        onClick={() => setLogOpen(o => !o)}
                        aria-expanded={logOpen}
                    >
                        <span className="reg-log-header-left">
                            {streaming && <span className="reg-log-pulse" />}
                            <span className="reg-log-title">
                                {streaming ? 'Registering…' : 'Registration Log'}
                            </span>
                            <span className="reg-log-count">{logLines.length} lines</span>
                        </span>
                        <span className="reg-log-chevron" style={{ transform: logOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            ▾
                        </span>
                    </button>

                    {logOpen && (
                        <div className="reg-log-body">
                            <div className="reg-log-toolbar">
                                <button
                                    className="reg-log-clear-btn"
                                    onClick={() => setLogLines([])}
                                    disabled={streaming}
                                >
                                    Clear
                                </button>
                                <button
                                    className="reg-log-copy-btn"
                                    onClick={() => {
                                        const text = logLines.map(l => `[${l.level.toUpperCase()}] ${l.text}`).join('\n');
                                        navigator.clipboard.writeText(text);
                                    }}
                                >
                                    Copy all
                                </button>
                            </div>
                            <div className="reg-log-lines">
                                {logLines.map((line, i) => (
                                    <div key={line.id} className={`reg-log-line reg-log-line--${line.level}`}>
                                        <span className="reg-log-lineno">{String(i + 1).padStart(3, '0')}</span>
                                        <span className="reg-log-badge reg-log-badge--{line.level}">{line.level.toUpperCase()}</span>
                                        <span className="reg-log-text">{line.text}</span>
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}