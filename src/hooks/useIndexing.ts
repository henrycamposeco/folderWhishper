"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    saveChunks,
    getAllChunks,
    clearAllChunks,
    deleteFileChunks,
    getStorageStats,
    StoredChunk,
} from "@/lib/db";
import { validateFiles } from "@/lib/utils";
import { ProcessedFile } from "@/types";
import { extractFilesText } from "@/lib/pdfExtractor";
import { useT } from "@/context/LanguageContext";
import { Language, translations } from "@/i18n/translations";

export interface LogEntry {
    id: string;
    message: string;
    level: "info" | "success" | "warning" | "error" | "loading";
    timestamp: Date;
}

export interface IndexingState {
    status: "idle" | "loading_model" | "processing" | "ready" | "error";
    files: ProcessedFile[];
    logs: LogEntry[];
    progress: {
        fileName: string;
        percent: number;
        stage: string;
        fileIndex: number;
        totalFiles: number;
    } | null;
    storageStats: {
        totalChunks: number;
        fileCount: number;
        estimatedBytes: number;
    };
    totalInputSize: number;
}

export function useIndexing() {
    const { t, lang } = useT();

    const [state, setState] = useState<IndexingState>({
        status: "idle",
        files: [],
        logs: [],
        progress: null,
        storageStats: { totalChunks: 0, fileCount: 0, estimatedBytes: 0 },
        totalInputSize: 0,
    });

    const workerRef = useRef<Worker | null>(null);
    const chunksRef = useRef<StoredChunk[]>([]);

    const addLog = useCallback((message: string, level: LogEntry["level"]) => {
        const entry: LogEntry = {
            id: Math.random().toString(36).slice(2),
            message,
            level,
            timestamp: new Date(),
        };
        setState((prev) => ({
            ...prev,
            logs: [...prev.logs.slice(-100), entry],
        }));
    }, []);

    // Load existing index on mount
    useEffect(() => {
        async function loadExisting() {
            try {
                const chunks = await getAllChunks();
                if (chunks.length > 0) {
                    chunksRef.current = chunks;
                    const stats = await getStorageStats();
                    const fileNames = [...new Set(chunks.map((c) => c.metadata.fileName))];

                    setState((prev) => ({
                        ...prev,
                        status: "ready",
                        storageStats: stats,
                        files: fileNames.map((name) => ({
                            name,
                            type: chunks.find((c) => c.metadata.fileName === name)?.metadata.fileType || "",
                            size: chunks.find((c) => c.metadata.fileName === name)?.metadata.fileSize || 0,
                            chunks: chunks.filter((c) => c.metadata.fileName === name).length,
                            status: "done" as const,
                        })),
                    }));

                    addLog(
                        `📂 ${t.indexLog.indexRestored} ${chunks.length} / ${fileNames.length} ${t.sidebar.files}`,
                        "success"
                    );
                }
            } catch (err) {
                console.error("Error loading index:", err);
            }
        }

        loadExisting();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addLog]); // intentionally omit t: we only want this on mount

    const processFiles = useCallback(
        async (fileList: FileList) => {
            const validation = validateFiles(fileList);

            if (!validation.valid) {
                validation.errors.forEach((e) => addLog(`❌ ${e}`, "error"));
                return;
            }

            setState((prev) => ({
                ...prev,
                status: "loading_model",
                totalInputSize: validation.totalSize,
                files: validation.files.map((f) => ({
                    name: f.name,
                    type: "." + f.name.split(".").pop()?.toLowerCase(),
                    size: f.size,
                    chunks: 0,
                    status: "pending" as const,
                })),
            }));

            addLog(`📁 ${validation.files.length} ${t.indexLog.filesSelected}`, "info");

            // Create or reuse worker
            if (!workerRef.current) {
                workerRef.current = new Worker(
                    new URL("../workers/embeddings.worker.ts", import.meta.url)
                );
            }

            const worker = workerRef.current;

            // ── Extract PDF text on the MAIN THREAD ─────────────────────────────
            // pdfjs-dist v5 crashes inside a Web Worker with
            // "Object.defineProperty called on non-object". We do it here and
            // pass the text as a plain string to the worker.
            addLog(t.indexLog.readingPdfs, "info");
            const extractedFiles = await extractFilesText(validation.files);

            // ── Register handlers BEFORE posting the message ─────────────────────
            worker.onmessage = async (event: MessageEvent) => {
                const { type, payload } = event.data;

                if (type === "LOG") {
                    addLog(payload.message, payload.level);
                    if (payload.message.includes("Downloading model") || payload.message.includes("Descargando modelo")) {
                        setState((prev) => ({ ...prev, status: "loading_model" }));
                    }
                }

                if (type === "PROGRESS") {
                    setState((prev) => {
                        const files = prev.files.map((f) =>
                            f.name === payload.fileName
                                ? { ...f, status: "processing" as const }
                                : f
                        );
                        return {
                            ...prev,
                            status: "processing",
                            files,
                            progress: {
                                fileName: payload.fileName,
                                percent: payload.progress,
                                stage: payload.stage,
                                fileIndex: payload.fileIndex,
                                totalFiles: payload.totalFiles,
                            },
                        };
                    });
                }

                if (type === "COMPLETE") {
                    const { chunks } = payload as { chunks: StoredChunk[] };

                    await saveChunks(chunks);
                    chunksRef.current = await getAllChunks();
                    const stats = await getStorageStats();

                    setState((prev) => ({
                        ...prev,
                        status: "ready",
                        progress: null,
                        storageStats: stats,
                        files: prev.files.map((f) => ({
                            ...f,
                            status: "done" as const,
                            chunks: chunks.filter((c) => c.metadata.fileName === f.name).length,
                        })),
                    }));

                    addLog(
                        `🎉 ${chunks.length} ${t.indexLog.allDone}`,
                        "success"
                    );
                }

                if (type === "ERROR") {
                    setState((prev) => ({ ...prev, status: "error", progress: null }));
                    addLog(`❌ ${t.indexLog.workerError} ${payload.message}`, "error");
                }
            };

            worker.onerror = (err) => {
                setState((prev) => ({ ...prev, status: "error" }));
                addLog(`❌ ${t.indexLog.workerCrash} ${err.message}`, "error");
            };

            // ── Send to worker (with language so worker can translate its logs) ──
            worker.postMessage({
                type: "PROCESS_FILES",
                payload: {
                    lang,
                    files: extractedFiles.map((ef) => ({
                        file: ef.file,
                        preExtractedText: ef.text,
                    })),
                },
            });
        },
        [addLog, t, lang]
    );

    const removeFile = useCallback(
        async (fileName: string) => {
            await deleteFileChunks(fileName);
            chunksRef.current = await getAllChunks();
            const stats = await getStorageStats();

            setState((prev) => ({
                ...prev,
                status: chunksRef.current.length > 0 ? "ready" : "idle",
                files: prev.files.filter((f) => f.name !== fileName),
                storageStats: stats,
            }));

            addLog(`🗑️  "${fileName}" ${t.indexLog.fileRemoved}`, "info");
        },
        [addLog, t]
    );

    const clearIndex = useCallback(async () => {
        await clearAllChunks();
        chunksRef.current = [];

        setState((prev) => ({
            ...prev,
            status: "idle",
            files: [],
            storageStats: { totalChunks: 0, fileCount: 0, estimatedBytes: 0 },
        }));

        addLog(`🗑️  ${t.indexLog.indexCleared}`, "info");
    }, [addLog, t]);

    return {
        state,
        chunks: chunksRef,
        processFiles,
        removeFile,
        clearIndex,
        addLog,
    };
}

// ─── Helper: get workerLog translation by language (for use in worker) ────────
export function getWorkerLogStrings(language: Language) {
    return translations[language].workerLog;
}
