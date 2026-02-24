"use client";

import React, { useState } from "react";
import { useIndexing } from "@/hooks/useIndexing";
import { useLocalLLM } from "@/hooks/useLocalLLM";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/Sidebar";
import { StatusLog } from "@/components/StatusLog";
import { ChatPanel } from "@/components/ChatPanel";
import { LOCAL_MODELS } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useT } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useT();
  const [showLog, setShowLog] = useState(true);

  // ── Indexing (embeddings + IndexedDB) ──────────────────────────────────────
  const { state: indexState, chunks, processFiles, removeFile, clearIndex } =
    useIndexing();

  // ── Local LLM (WebLLM) ────────────────────────────────────────────────────
  const {
    state: llmState,
    loadModel,
    generate,
    unload,
    isReady: isLLMReady,
  } = useLocalLLM();

  // ── Chat (RAG pipeline) ───────────────────────────────────────────────────
  const { messages, isLoading, sendMessage, stopGeneration, clearChat } =
    useChat({
      chunksRef: chunks,
      generate,
      isLLMReady,
    });

  const isIndexReady = indexState.status === "ready";

  const activeLLMLabel =
    LOCAL_MODELS.find((m) => m.id === llmState.modelId)?.label;

  // ── Status bar text ───────────────────────────────────────────────────────
  const statusText = (() => {
    if (indexState.status === "loading_model") return t.topbar.downloadingEmbedModel;
    if (indexState.status === "processing" && indexState.progress)
      return `${t.validation.processingFile} ${indexState.progress.fileName} (${indexState.progress.percent}%)`;
    if (llmState.status === "downloading")
      return `${t.status.downloading} ${llmState.downloadText}`;
    if (llmState.status === "loading") return t.status.loadingGPU;
    if (llmState.status === "inferring") return t.topbar.generatingLocal;
    if (isIndexReady && isLLMReady)
      return `${indexState.storageStats.totalChunks} · ${activeLLMLabel} · 100% Local 🔒`;
    if (isIndexReady) return `${indexState.storageStats.totalChunks} ${t.topbar.loadLLMHint}`;
    return t.topbar.noDocuments;
  })();

  const statusDotColor = (() => {
    if (isIndexReady && isLLMReady) return "var(--accent-success)";
    if (
      indexState.status === "processing" ||
      indexState.status === "loading_model" ||
      llmState.status === "downloading" ||
      llmState.status === "loading" ||
      llmState.status === "inferring"
    )
      return "var(--accent-tertiary)";
    return "var(--text-muted)";
  })();

  const statusDotGlow =
    isIndexReady && isLLMReady ? "0 0 8px var(--accent-success)" : "none";

  const isAnimated =
    indexState.status === "processing" ||
    indexState.status === "loading_model" ||
    llmState.status === "downloading" ||
    llmState.status === "loading" ||
    llmState.status === "inferring";

  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* ─── Left Sidebar ─── */}
      <Sidebar
        indexState={indexState}
        llmState={llmState}
        onFilesSelected={processFiles}
        onRemoveFile={removeFile}
        onClearIndex={clearIndex}
        onLoadModel={loadModel}
        onUnloadModel={unload}
      />

      {/* ─── Main Area ─── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            padding: "10px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: statusDotColor,
                boxShadow: statusDotGlow,
                flexShrink: 0,
                animation: isAnimated ? "pulse-dot 1.5s infinite" : "none",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {statusText}
            </span>
          </div>

          <button
            onClick={() => setShowLog(!showLog)}
            style={{
              flexShrink: 0,
              background: "rgba(99,102,241,0.1)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "4px 10px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.2)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.1)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            id="toggle-log-btn"
          >
            {showLog ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {t.topbar.log}
          </button>
        </div>

        {/* ── Status Log (collapsible) ── */}
        {showLog && indexState.logs.length > 0 && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border-subtle)",
              flexShrink: 0,
            }}
          >
            <StatusLog logs={indexState.logs} />
          </div>
        )}

        {/* ── Chat ── */}
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          isIndexReady={isIndexReady}
          isLLMReady={isLLMReady}
          llmModelLabel={activeLLMLabel}
          onSend={sendMessage}
          onStop={stopGeneration}
          onClear={clearChat}
        />
      </div>
    </main>
  );
}
