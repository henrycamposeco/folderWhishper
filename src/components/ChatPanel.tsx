"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Send, Square, Trash2, BookOpen } from "lucide-react";
import { ChatMessage, SourceDocument } from "@/types";
import { useT } from "@/context/LanguageContext";

interface ChatPanelProps {
    messages: ChatMessage[];
    isLoading: boolean;
    isIndexReady: boolean;
    isLLMReady: boolean;
    llmModelLabel?: string;
    onSend: (text: string) => void;
    onStop: () => void;
    onClear: () => void;
}

interface SourceModalProps {
    source: SourceDocument;
    onClose: () => void;
}

function SourceModal({ source, onClose }: SourceModalProps) {
    const { t } = useT();
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>
                            📄 {source.fileName}
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {t.sourceModal.fragment}{source.chunkIndex} — {t.sourceModal.relevance} {(source.score * 100).toFixed(1)}%
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            width: "28px", height: "28px",
                            borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "16px",
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Relevance bar */}
                <div style={{ marginBottom: "16px" }}>
                    <div className="storage-bar">
                        <div
                            className="storage-bar-fill"
                            style={{ width: `${source.score * 100}%` }}
                        />
                    </div>
                </div>

                <div style={{
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    fontSize: "13px",
                    lineHeight: "1.7",
                    color: "var(--text-secondary)",
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: "pre-wrap",
                    maxHeight: "300px",
                    overflowY: "auto",
                }}>
                    {source.content}
                </div>
            </div>
        </div>
    );
}

function MessageComponent({ message }: { message: ChatMessage }) {
    const { t } = useT();
    const [selectedSource, setSelectedSource] = useState<SourceDocument | null>(null);
    const isUser = message.role === "user";

    // Minimal markdown renderer
    const renderContent = (text: string) => {
        const lines = text.split("\n");
        const elements: React.ReactNode[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith("### ")) {
                elements.push(<h3 key={i} style={{ fontSize: "14px", fontWeight: "700", margin: "8px 0 4px" }}>{line.slice(4)}</h3>);
            } else if (line.startsWith("## ")) {
                elements.push(<h2 key={i} style={{ fontSize: "15px", fontWeight: "700", margin: "10px 0 4px" }}>{line.slice(3)}</h2>);
            } else if (line.startsWith("# ")) {
                elements.push(<h1 key={i} style={{ fontSize: "16px", fontWeight: "700", margin: "12px 0 6px" }}>{line.slice(2)}</h1>);
            } else if (line.startsWith("- ") || line.startsWith("* ")) {
                elements.push(
                    <div key={i} style={{ display: "flex", gap: "8px", margin: "2px 0" }}>
                        <span style={{ color: "var(--accent-primary)", flexShrink: 0, marginTop: "2px" }}>•</span>
                        <span>{renderInline(line.slice(2))}</span>
                    </div>
                );
            } else if (line.startsWith("```")) {
                // Find closing ```
                let codeLines = [];
                let j = i + 1;
                while (j < lines.length && !lines[j].startsWith("```")) {
                    codeLines.push(lines[j]);
                    j++;
                }
                elements.push(
                    <pre key={i} style={{
                        background: "rgba(0,0,0,0.3)",
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        overflowX: "auto",
                        margin: "8px 0",
                        fontFamily: "'JetBrains Mono',monospace",
                        border: "1px solid var(--border-subtle)",
                    }}>
                        {codeLines.join("\n")}
                    </pre>
                );
                i = j;
            } else if (line.trim() === "") {
                elements.push(<div key={i} style={{ height: "6px" }} />);
            } else {
                elements.push(<p key={i} style={{ margin: "2px 0", lineHeight: "1.6" }}>{renderInline(line)}</p>);
            }
        }

        return elements;
    };

    const renderInline = (text: string): React.ReactNode => {
        const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i} style={{ fontWeight: "700" }}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("`") && part.endsWith("`")) {
                return (
                    <code key={i} style={{
                        background: "rgba(99,102,241,0.15)",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: "12px",
                    }}>
                        {part.slice(1, -1)}
                    </code>
                );
            }
            if (part.startsWith("*") && part.endsWith("*")) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    return (
        <>
            {selectedSource && (
                <SourceModal source={selectedSource} onClose={() => setSelectedSource(null)} />
            )}

            <div className={`message-bubble ${message.role}`}>
                <div className={`avatar ${message.role}`}>
                    {isUser ? "👤" : "🪄"}
                </div>

                <div>
                    <div className="bubble-content">
                        {message.isLoading ? (
                            <div className="loading-dots">
                                <span /><span /><span />
                            </div>
                        ) : (
                            renderContent(message.content)
                        )}
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                        <div className="sources-section" style={{ marginTop: "6px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <BookOpen size={10} />
                                {t.chat.sourcesLabel}
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                                {message.sources.map((s, i) => (
                                    <button
                                        key={i}
                                        className="source-chip"
                                        onClick={() => setSelectedSource(s)}
                                        title={`Ver fragmento de "${s.fileName}"`}
                                    >
                                        📄 {s.fileName.length > 20 ? s.fileName.slice(0, 17) + "..." : s.fileName}
                                        <span style={{ opacity: 0.7 }}>{(s.score * 100).toFixed(0)}%</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", textAlign: isUser ? "right" : "left" }}>
                        {message.timestamp.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
            </div>
        </>
    );
}

export function ChatPanel({
    messages,
    isLoading,
    isIndexReady,
    isLLMReady,
    llmModelLabel,
    onSend,
    onStop,
    onClear,
}: ChatPanelProps) {
    const { t } = useT();
    const canChat = isIndexReady && isLLMReady;
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = useCallback(() => {
        const text = input.trim();
        if (!text || isLoading) return;
        setInput("");
        onSend(text);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    }, [input, isLoading, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const adjustHeight = () => {
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
        }
    };

    const suggestedQuestions = [
        t.welcome.q1,
        t.welcome.q2,
        t.welcome.q3,
    ];

    return (
        <div className="chat-container">
            {/* ─── Messages ─── */}
            <div className="messages-area">
                {messages.length === 0 ? (
                    <div className="welcome-screen">
                        <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXNxcjlvM3didDZ4NTlicDFwYXZtOHMwOWltdXVqcXF3c2V4N3g0YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iZXKuPtlTiCOJpeVMX/giphy.gif" alt="Logo" style={{ width: "300px", height: "300px", borderRadius: "12px", marginBottom: "16px" }} />
                        <div>
                            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
                                FolderWhisper
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "420px", lineHeight: "1.7" }}>
                                {t.welcome.subtitle}
                            </p>
                        </div>

                        {/* Setup steps */}
                        {!canChat && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "380px" }}>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>{t.welcome.toStart}</p>
                                {[
                                    { done: isIndexReady, label: t.welcome.step1 },
                                    { done: isLLMReady, label: t.welcome.step2 },
                                ].map(({ done, label }, i) => (
                                    <div key={i} style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        padding: "10px 14px",
                                        background: done ? "rgba(16,185,129,0.08)" : "rgba(99,102,241,0.06)",
                                        border: `1px solid ${done ? "rgba(16,185,129,0.25)" : "var(--border-subtle)"}`,
                                        borderRadius: "var(--radius-md)",
                                        fontSize: "13px",
                                        color: done ? "var(--accent-success)" : "var(--text-secondary)",
                                    }}>
                                        <span style={{ fontSize: "16px" }}>{done ? "✅" : "⏳"}</span>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        )}

                        {canChat && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "380px" }}>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "left" }}>{t.welcome.suggestedTitle}</p>
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onSend(q)}
                                        style={{
                                            background: "rgba(99,102,241,0.08)",
                                            border: "1px solid var(--border-default)",
                                            borderRadius: "var(--radius-md)",
                                            padding: "10px 14px",
                                            color: "var(--text-secondary)",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            fontFamily: "inherit",
                                            textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                                            e.currentTarget.style.color = "var(--text-primary)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                                            e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <MessageComponent key={msg.id} message={msg} />
                        ))}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* ─── Input ─── */}
            <div className="chat-input-area">
                {messages.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                        <button
                            className="btn-secondary"
                            onClick={onClear}
                            style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                            <Trash2 size={11} />
                            {t.chat.clearChat}
                        </button>
                    </div>
                )}

                <div className="chat-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        className="chat-input"
                        placeholder={
                            !isIndexReady
                                ? t.chat.placeholderNoIndex
                                : !isLLMReady
                                    ? t.chat.placeholderNoLLM
                                    : `${t.chat.placeholderReady} ${llmModelLabel || "LLM"}... (Enter)`
                        }
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={!canChat && messages.length === 0}
                        id="chat-input"
                    />

                    {isLoading ? (
                        <button
                            className="send-btn"
                            onClick={onStop}
                            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                            title={t.chat.stopGeneration}
                            id="stop-btn"
                        >
                            <Square size={14} />
                        </button>
                    ) : (
                        <button
                            className="send-btn"
                            onClick={handleSend}
                            disabled={!input.trim() || (!canChat && messages.length === 0)}
                            title={t.chat.send}
                            id="send-btn"
                        >
                            <Send size={14} />
                        </button>
                    )}
                </div>

                <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "8px", textAlign: "center" }}>
                    {t.chat.footer.replace("WebLLM", `WebLLM${llmModelLabel ? ` (${llmModelLabel})` : ""}`)}
                </p>
            </div>
        </div>
    );
}
