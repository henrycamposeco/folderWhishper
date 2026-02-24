"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, SourceDocument, TOP_K_RESULTS } from "@/types";
import { cosineSimilarity } from "@/lib/utils";
import { StoredChunk } from "@/lib/db";
import { useT } from "@/context/LanguageContext";

interface UseChatOptions {
    chunksRef: React.MutableRefObject<StoredChunk[]>;
    generate: (
        systemPrompt: string,
        userMessage: string,
        onToken: (token: string) => void
    ) => Promise<string>;
    isLLMReady: boolean;
}

export function useChat({ chunksRef, generate, isLLMReady }: UseChatOptions) {
    const { t } = useT();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const stopRef = useRef(false);

    // ─── Embed query via worker ───────────────────────────────────────────────
    const embedQuery = useCallback(async (query: string): Promise<number[]> => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(
                new URL("../workers/embeddings.worker.ts", import.meta.url)
            );

            worker.postMessage({ type: "EMBED_QUERY", payload: { text: query } });

            worker.onmessage = (e) => {
                if (e.data.type === "QUERY_EMBEDDING") {
                    resolve(e.data.payload.embedding);
                    worker.terminate();
                }
            };

            worker.onerror = (err) => {
                reject(new Error(err.message));
                worker.terminate();
            };

            setTimeout(() => {
                reject(new Error(t.chat.embedError));
                worker.terminate();
            }, 60000);
        });
    }, [t]);

    // ─── Cosine similarity search ─────────────────────────────────────────────
    const searchSimilarChunks = useCallback(
        async (queryEmbedding: number[]): Promise<SourceDocument[]> => {
            const chunks = chunksRef.current;
            if (!chunks.length) return [];

            const scored = chunks
                .map((chunk) => ({
                    chunk,
                    score: cosineSimilarity(queryEmbedding, chunk.embedding),
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, TOP_K_RESULTS);

            return scored.map(({ chunk, score }) => ({
                fileName: chunk.metadata.fileName,
                content: chunk.content,
                score,
                chunkIndex: chunk.metadata.chunkIndex,
            }));
        },
        [chunksRef]
    );

    // ─── Send message ─────────────────────────────────────────────────────────
    const sendMessage = useCallback(
        async (userInput: string) => {
            if (!userInput.trim() || isLoading) return;

            if (!isLLMReady) {
                const warnMsg: ChatMessage = {
                    id: Math.random().toString(36).slice(2),
                    role: "assistant",
                    content: t.chat.noLLMWarning,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, warnMsg]);
                return;
            }

            stopRef.current = false;

            const userMsg: ChatMessage = {
                id: Math.random().toString(36).slice(2),
                role: "user",
                content: userInput,
                timestamp: new Date(),
            };

            const loadingId = "loading-" + Date.now();
            const loadingMsg: ChatMessage = {
                id: loadingId,
                role: "assistant",
                content: "",
                timestamp: new Date(),
                isLoading: true,
            };

            setMessages((prev) => [...prev, userMsg, loadingMsg]);
            setIsLoading(true);

            try {
                // 1. Embed the query locally
                let queryEmbedding: number[];
                try {
                    queryEmbedding = await embedQuery(userInput);
                } catch {
                    throw new Error(t.chat.embedError);
                }

                // 2. Retrieve similar chunks
                const sources = await searchSimilarChunks(queryEmbedding);

                // 3. Build RAG context
                const context =
                    sources.length > 0
                        ? sources
                            .map(
                                (s, i) =>
                                    `[${t.rag.fragmentLabel} ${i + 1} — "${s.fileName}" — ${t.chat.relevanceLabel} ${(s.score * 100).toFixed(1)}%]\n${s.content}`
                            )
                            .join("\n\n---\n\n")
                        : t.rag.noDocsContext;

                const systemPrompt = t.rag.systemPrompt + context;

                // 4. Stream response from local LLM
                let accumulated = "";

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === loadingId ? { ...m, isLoading: false, content: "" } : m
                    )
                );

                await generate(systemPrompt, userInput, (token) => {
                    if (stopRef.current) return;
                    accumulated += token;
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === loadingId ? { ...m, content: accumulated } : m
                        )
                    );
                });

                // 5. Attach sources
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === loadingId
                            ? {
                                ...m,
                                content: accumulated || t.chat.noAnswer,
                                isLoading: false,
                                sources: sources.filter((s) => s.score > 0.25),
                            }
                            : m
                    )
                );
            } catch (err) {
                const msg = err instanceof Error ? err.message : t.chat.unknownError;
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === loadingId
                            ? { ...m, content: `❌ ${msg}`, isLoading: false }
                            : m
                    )
                );
            } finally {
                setIsLoading(false);
                stopRef.current = false;
            }
        },
        [isLoading, isLLMReady, embedQuery, searchSimilarChunks, generate, t]
    );

    const stopGeneration = useCallback(() => {
        stopRef.current = true;
        setIsLoading(false);
        setMessages((prev) =>
            prev.map((m) => (m.isLoading ? { ...m, isLoading: false } : m))
        );
    }, []);

    const clearChat = useCallback(() => {
        setMessages([]);
    }, []);

    return { messages, isLoading, sendMessage, stopGeneration, clearChat };
}
