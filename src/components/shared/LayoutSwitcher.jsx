import React, { useState, useRef, useEffect } from 'react';

const LAYOUTS = [
    {
        id: 'sidebar',
        label: 'Sidebar',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="4" height="14" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="7" y="1" width="8" height="14" rx="1" fill="currentColor" opacity=".35"/>
            </svg>
        ),
    },
    {
        id: 'tabcard',
        label: 'Tabs',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="4" height="14" rx="1" fill="currentColor" opacity=".35"/>
                <rect x="7" y="1" width="3" height="4" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="11" y="1" width="4" height="4" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="7" y="7" width="8" height="8" rx="1" fill="currentColor" opacity=".35"/>
            </svg>
        ),
    },
    {
        id: 'cardchat',
        label: 'Cards',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity=".9"/>
                <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".35"/>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity=".35"/>
            </svg>
        ),
    },
];

const switcherStyles = `
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

export function LayoutSwitcher({ layout, setLayout }) {
    const switcherRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 250, y: window.innerHeight - 70 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - offset.x,
                    y: e.clientY - offset.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, offset]);

    const handleMouseDown = (e) => {
        // Prevent dragging when clicking on a button
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        setIsDragging(true);
        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    return (
        <>
            <style>{switcherStyles}</style>
            <div
                ref={switcherRef}
                className="layout-switcher"
                style={{ top: `${position.y}px`, left: `${position.x}px` }}
                onMouseDown={handleMouseDown}
                role="toolbar"
                aria-label="Switch layout"
            >
                {LAYOUTS.map(l => (
                    <button
                        key={l.id}
                        className={`layout-btn ${layout === l.id ? 'active' : ''}`}
                        onClick={() => setLayout(l.id)}
                        title={l.label}
                    >
                        {l.icon}
                        {l.label}
                    </button>
                ))}
            </div>
        </>
    );
}
