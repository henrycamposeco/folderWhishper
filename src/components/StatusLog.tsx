"use client";

import React, { useRef, useEffect } from "react";
import { LogEntry } from "@/hooks/useIndexing";

interface StatusLogProps {
    logs: LogEntry[];
}

const levelIcons: Record<LogEntry["level"], string> = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    loading: "⏳",
};

export function StatusLog({ logs }: StatusLogProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    if (logs.length === 0) {
        return (
            <div className="log-container" style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 12px" }}>
                Los eventos del sistema aparecerán aquí...
            </div>
        );
    }

    return (
        <div className="log-container" id="status-log">
            {logs.map((entry) => (
                <div key={entry.id} className={`log-entry ${entry.level}`}>
                    <span className="log-icon">{levelIcons[entry.level]}</span>
                    <span className="log-text">{entry.message}</span>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
