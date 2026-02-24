"use client";

import React, { useRef, useState } from "react";
import {
    Folder,
    FileText,
    Trash2,
    X,
    ChevronDown,
    Database,
    Zap,
    Cpu,
    Download,
    CheckCircle,
    AlertCircle,
    ChevronUp,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { ProcessedFile, MAX_FILE_SIZE, LOCAL_MODELS } from "@/types";
import { IndexingState } from "@/hooks/useIndexing";
import { LLMState } from "@/hooks/useLocalLLM";
import { useT } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface SidebarProps {
    indexState: IndexingState;
    llmState: LLMState;
    onFilesSelected: (files: FileList) => void;
    onRemoveFile: (name: string) => void;
    onClearIndex: () => void;
    onLoadModel: (modelId: string) => void;
    onUnloadModel: () => void;
}

function FileIcon({ type }: { type: string }) {
    const icons: Record<string, string> = {
        ".pdf": "📄",
        ".txt": "📝",
        ".md": "📌",
        ".docx": "📃",
    };
    const classes: Record<string, string> = {
        ".pdf": "pdf",
        ".txt": "txt",
        ".md": "md",
        ".docx": "docx",
    };
    return (
        <div className={`file-icon ${classes[type] || "txt"}`}>
            <span style={{ fontSize: "13px" }}>{icons[type] || "📄"}</span>
        </div>
    );
}

export function Sidebar({
    indexState,
    llmState,
    onFilesSelected,
    onRemoveFile,
    onClearIndex,
    onLoadModel,
    onUnloadModel,
}: SidebarProps) {
    const { t } = useT();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [showFiles, setShowFiles] = useState(true);
    const [showModelPanel, setShowModelPanel] = useState(true);
    const [selectedModelId, setSelectedModelId] = useState(LOCAL_MODELS[0].id);

    const storagePercent = Math.min(
        (indexState.storageStats.estimatedBytes / MAX_FILE_SIZE) * 100,
        100
    );
    const barClass =
        storagePercent > 80 ? "danger" : storagePercent > 60 ? "warning" : "";

    const indexStatusBadge = {
        idle: { label: t.status.noData, cls: "idle" },
        loading_model: { label: t.status.loadingEmbeddings, cls: "processing" },
        processing: { label: t.status.indexing, cls: "processing" },
        ready: { label: t.status.indexReady, cls: "ready" },
        error: { label: t.status.error, cls: "error" },
    }[indexState.status];

    const selectedModelInfo = LOCAL_MODELS.find((m) => m.id === selectedModelId);

    const llmStatusInfo = {
        idle: { label: t.status.unloaded, cls: "idle", icon: null },
        downloading: {
            label: `${t.status.downloading} ${llmState.downloadProgress}%`,
            cls: "processing",
            icon: <Download size={9} />,
        },
        loading: {
            label: t.status.loadingGPU,
            cls: "processing",
            icon: <span className="spinner" style={{ width: "8px", height: "8px" }} />,
        },
        ready: { label: t.status.ready, cls: "ready", icon: <CheckCircle size={9} /> },
        inferring: {
            label: t.status.inferring,
            cls: "processing",
            icon: <span className="spinner" style={{ width: "8px", height: "8px" }} />,
        },
        error: { label: t.status.error, cls: "error", icon: <AlertCircle size={9} /> },
    }[llmState.status];

    const isIndexBusy =
        indexState.status === "processing" || indexState.status === "loading_model";
    const isLLMBusy =
        llmState.status === "downloading" ||
        llmState.status === "loading" ||
        llmState.status === "inferring";

    return (
        <aside className="sidebar">
            {/* ─── Logo + language switcher ─── */}
            <div className="sidebar-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div
                        style={{
                            width: "38px",
                            height: "38px",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            borderRadius: "11px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
                            flexShrink: 0,
                        }}
                    >
                        🪄
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
                            {t.app.name}
                        </h1>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>
                            {t.app.tagline}
                        </p>
                    </div>
                    <span className={`badge ${indexStatusBadge.cls}`}>
                        {indexStatusBadge.cls === "processing" && (
                            <span className="spinner" style={{ width: "7px", height: "7px" }} />
                        )}
                        {indexStatusBadge.label}
                    </span>
                </div>

                {/* Language switcher row */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                    <LanguageSwitcher />
                </div>

                {/* Upload buttons */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,.docx"
                    style={{ display: "none" }}
                    onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                />
                <input
                    ref={folderInputRef}
                    type="file"
                    // @ts-expect-error webkitdirectory is non-standard
                    webkitdirectory="true"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                />

                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                    <button
                        className="btn-primary"
                        onClick={() => folderInputRef.current?.click()}
                        disabled={isIndexBusy}
                        id="select-folder-btn"
                    >
                        <Folder size={14} />
                        {t.sidebar.addFolder}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isIndexBusy}
                        style={{ padding: "8px 12px", flexShrink: 0 }}
                        id="select-files-btn"
                        title={t.sidebar.addFilesTitle}
                    >
                        <FileText size={14} />
                    </button>
                </div>

                {/* Storage bar */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Database size={10} />
                            {t.sidebar.storage}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            {formatBytes(indexState.storageStats.estimatedBytes)} / 200MB
                        </span>
                    </div>
                    <div className="storage-bar">
                        <div className={`storage-bar-fill ${barClass}`} style={{ width: `${storagePercent}%` }} />
                    </div>
                </div>

                {/* Quick stats */}
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <div className="stat-pill">
                        <FileText size={10} />
                        <span>
                            <strong>{indexState.storageStats.fileCount}</strong> {t.sidebar.files}
                        </span>
                    </div>
                    <div className="stat-pill">
                        <Zap size={10} />
                        <span>
                            <strong>{indexState.storageStats.totalChunks}</strong> {t.sidebar.fragments}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── Local LLM Panel ─── */}
            <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div
                    onClick={() => setShowModelPanel(!showModelPanel)}
                    style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Cpu size={12} color="var(--accent-primary)" />
                        <span className="section-title" style={{ marginBottom: 0 }}>
                            {t.llm.panelTitle}
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className={`badge ${llmStatusInfo.cls}`} style={{ gap: "4px" }}>
                            {llmStatusInfo.icon}
                            {llmStatusInfo.label}
                        </span>
                        {showModelPanel ? (
                            <ChevronUp size={13} color="var(--text-muted)" />
                        ) : (
                            <ChevronDown size={13} color="var(--text-muted)" />
                        )}
                    </div>
                </div>

                {showModelPanel && (
                    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>

                        {/* WebGPU badge */}
                        {llmState.hasWebGPU !== null && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "11px",
                                    color: llmState.hasWebGPU ? "var(--accent-success)" : "var(--accent-warning)",
                                    background: llmState.hasWebGPU ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                                    border: `1px solid ${llmState.hasWebGPU ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
                                    borderRadius: "var(--radius-sm)",
                                    padding: "5px 8px",
                                }}
                            >
                                {llmState.hasWebGPU ? (
                                    <><CheckCircle size={11} />{t.llm.webgpuAvailable}</>
                                ) : (
                                    <><AlertCircle size={11} />{t.llm.webgpuUnavailable}</>
                                )}
                            </div>
                        )}

                        {/* Model selector */}
                        <div>
                            <p style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "600" }}>
                                {t.llm.selectModel}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                {LOCAL_MODELS.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModelId(model.id)}
                                        disabled={isLLMBusy}
                                        style={{
                                            background: selectedModelId === model.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                                            border: `1px solid ${selectedModelId === model.id ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                                            borderRadius: "var(--radius-md)",
                                            padding: "8px 10px",
                                            cursor: isLLMBusy ? "not-allowed" : "pointer",
                                            textAlign: "left",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "8px",
                                            transition: "all 0.15s ease",
                                            opacity: isLLMBusy ? 0.6 : 1,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isLLMBusy && selectedModelId !== model.id)
                                                e.currentTarget.style.background = "rgba(99,102,241,0.07)";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedModelId !== model.id)
                                                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                        }}
                                    >
                                        <span style={{ fontSize: "16px", lineHeight: 1 }}>{model.icon}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>
                                                    {model.label}
                                                </span>
                                                <span style={{ fontSize: "10px", color: "var(--accent-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {model.sizeLabel}
                                                </span>
                                            </div>
                                            {/* ← Description translated via t.models[descriptionKey] */}
                                            <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.4 }}>
                                                {t.models[model.descriptionKey]}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Download progress */}
                        {(llmState.status === "downloading" || llmState.status === "loading") && (
                            <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "var(--radius-md)", padding: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                    <span style={{ fontSize: "11px", color: "var(--accent-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
                                        {llmState.downloadText}
                                    </span>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        {llmState.downloadProgress}%
                                    </span>
                                </div>
                                <div className="storage-bar">
                                    <div className="storage-bar-fill" style={{ width: `${llmState.downloadProgress}%`, transition: "width 0.5s ease" }} />
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {llmState.status === "error" && llmState.error && (
                            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", padding: "8px 10px", fontSize: "11px", color: "var(--accent-danger)", lineHeight: 1.5 }}>
                                {t.llm.errorPrefix} {llmState.error}
                            </div>
                        )}

                        {/* Action button */}
                        {llmState.status === "idle" || llmState.status === "error" ? (
                            <button className="btn-primary" onClick={() => onLoadModel(selectedModelId)} id="load-model-btn">
                                <Download size={14} />
                                {t.llm.loadModel} {selectedModelInfo?.label}
                            </button>
                        ) : llmState.status === "ready" ? (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "var(--radius-md)", padding: "7px 10px", fontSize: "12px", color: "var(--accent-success)" }}>
                                    <CheckCircle size={13} />
                                    {LOCAL_MODELS.find((m) => m.id === llmState.modelId)?.label || "Model"} {t.llm.modelReady}
                                </div>
                                <button className="btn-danger" onClick={onUnloadModel} title={t.llm.unloadModel} style={{ padding: "7px 10px", flexShrink: 0 }}>
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--accent-tertiary)", padding: "4px 0" }}>
                                <span className="spinner" />
                                {llmState.status === "inferring" ? t.llm.generating : t.llm.preparing}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── File List ─── */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div
                    onClick={() => setShowFiles(!showFiles)}
                    style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
                >
                    <span className="section-title" style={{ marginBottom: 0 }}>
                        {t.sidebar.indexedFiles}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {indexState.files.length > 0 && (
                            <button
                                className="btn-danger"
                                onClick={(e) => { e.stopPropagation(); onClearIndex(); }}
                                style={{ padding: "2px 8px", fontSize: "11px" }}
                                id="clear-index-btn"
                            >
                                <Trash2 size={10} />
                                {t.sidebar.clearIndex}
                            </button>
                        )}
                        {showFiles ? (
                            <ChevronUp size={13} color="var(--text-muted)" />
                        ) : (
                            <ChevronDown size={13} color="var(--text-muted)" />
                        )}
                    </div>
                </div>

                {showFiles && (
                    <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
                        {indexState.files.length === 0 ? (
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "24px 16px", lineHeight: "1.7" }}>
                                {t.sidebar.noFilesHint}
                            </p>
                        ) : (
                            indexState.files.map((file) => (
                                <FileItem key={file.name} file={file} onRemove={onRemoveFile} />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* ─── Indexing progress bar ─── */}
            {indexState.progress && (
                <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", background: "rgba(99,102,241,0.05)", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "10px", color: "var(--accent-tertiary)", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {indexState.progress.stage}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            {indexState.progress.fileIndex + 1}/{indexState.progress.totalFiles}
                        </span>
                    </div>
                    <div className="storage-bar">
                        <div className="storage-bar-fill" style={{ width: `${indexState.progress.percent}%`, transition: "width 0.3s ease" }} />
                    </div>
                </div>
            )}
        </aside>
    );
}

// ─── File item ────────────────────────────────────────────────────────────────
function FileItem({ file, onRemove }: { file: ProcessedFile; onRemove: (name: string) => void }) {
    const { t } = useT();
    const statusIcon = {
        pending: "⏳",
        processing: "⚡",
        done: "✅",
        error: "❌",
    }[file.status];

    return (
        <div className="file-item" style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                <FileIcon type={file.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {file.name}
                    </p>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        {formatBytes(file.size)}
                        {file.chunks > 0 && ` · ${file.chunks} ${t.sidebar.fragments}`}
                    </p>
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <span style={{ fontSize: "12px" }}>{statusIcon}</span>
                {file.status === "done" && (
                    <button
                        onClick={() => onRemove(file.name)}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-danger)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
        </div>
    );
}
