"use client";

import { useState, useRef, useCallback } from "react";
import { LLMStatus, LOCAL_MODELS } from "@/types";

export interface LLMState {
    status: LLMStatus;
    modelId: string;
    downloadProgress: number;
    downloadText: string;
    error: string | null;
    hasWebGPU: boolean | null;
}

// Singleton engine reference — survives re-renders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalEngine: any = null;
let globalModelId: string | null = null;

export function useLocalLLM() {
    const [state, setState] = useState<LLMState>({
        status: "idle",
        modelId: LOCAL_MODELS[0].id,
        downloadProgress: 0,
        downloadText: "",
        error: null,
        hasWebGPU: null,
    });

    const engineRef = useRef<unknown>(globalEngine);

    // Detect WebGPU support
    const checkWebGPU = useCallback(async (): Promise<boolean> => {
        if (typeof navigator === "undefined") return false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gpu = (navigator as any).gpu;
        if (!gpu) return false;
        try {
            const adapter = await gpu.requestAdapter();
            return adapter !== null;
        } catch {
            return false;
        }
    }, []);

    const loadModel = useCallback(
        async (modelId: string) => {
            // If same model already loaded, skip
            if (globalEngine && globalModelId === modelId) {
                setState((prev) => ({ ...prev, status: "ready", modelId }));
                return globalEngine;
            }

            // Check WebGPU
            const hasWebGPU = await checkWebGPU();
            setState((prev) => ({ ...prev, hasWebGPU }));

            const model = LOCAL_MODELS.find((m) => m.id === modelId);
            if (model?.requiresWebGPU && !hasWebGPU) {
                setState((prev) => ({
                    ...prev,
                    status: "error",
                    error:
                        "Este modelo requiere WebGPU. Tu navegador no lo soporta. Prueba con 'SmolLM2 360M (CPU)' o usa Chrome/Edge actualizado.",
                }));
                return null;
            }

            setState((prev) => ({
                ...prev,
                status: "downloading",
                modelId,
                downloadProgress: 0,
                downloadText: "Iniciando descarga del modelo...",
                error: null,
            }));

            try {
                const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

                // Destroy old engine if switching models
                if (globalEngine) {
                    try {
                        await globalEngine.unload();
                    } catch {
                        // ignore
                    }
                    globalEngine = null;
                }

                const engine = await CreateMLCEngine(modelId, {
                    initProgressCallback: (p: { progress: number; text: string }) => {
                        const percent = Math.round((p.progress || 0) * 100);
                        setState((prev) => ({
                            ...prev,
                            status: percent < 100 ? "downloading" : "loading",
                            downloadProgress: percent,
                            downloadText: p.text || `Cargando... ${percent}%`,
                        }));
                    },
                });

                globalEngine = engine;
                globalModelId = modelId;
                engineRef.current = engine;

                setState((prev) => ({
                    ...prev,
                    status: "ready",
                    downloadProgress: 100,
                    downloadText: "✅ Modelo listo",
                }));

                return engine;
            } catch (err) {
                const msg = (err as Error).message;
                setState((prev) => ({
                    ...prev,
                    status: "error",
                    error: `Error cargando modelo: ${msg}`,
                }));
                return null;
            }
        },
        [checkWebGPU]
    );

    const generate = useCallback(
        async (
            systemPrompt: string,
            userMessage: string,
            onToken: (token: string) => void
        ): Promise<string> => {
            const engine = engineRef.current || globalEngine;
            if (!engine) throw new Error("El modelo no está cargado");

            setState((prev) => ({ ...prev, status: "inferring" }));

            let fullText = "";

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const stream = await (engine as any).chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userMessage },
                    ],
                    stream: true,
                    temperature: 0.1,
                    max_tokens: 1024,
                });

                for await (const chunk of stream) {
                    const delta = chunk.choices?.[0]?.delta?.content || "";
                    if (delta) {
                        fullText += delta;
                        onToken(delta);
                    }
                }

                setState((prev) => ({ ...prev, status: "ready" }));
                return fullText;
            } catch (err) {
                setState((prev) => ({ ...prev, status: "ready" }));
                throw err;
            }
        },
        []
    );

    const unload = useCallback(async () => {
        if (globalEngine) {
            try {
                await globalEngine.unload();
            } catch {
                // ignore
            }
            globalEngine = null;
            globalModelId = null;
            engineRef.current = null;
        }
        setState((prev) => ({
            ...prev,
            status: "idle",
            downloadProgress: 0,
            downloadText: "",
        }));
    }, []);

    const setModelId = useCallback((id: string) => {
        setState((prev) => ({ ...prev, modelId: id }));
    }, []);

    return {
        state,
        loadModel,
        generate,
        unload,
        setModelId,
        isReady: state.status === "ready",
        isLoading: state.status === "downloading" || state.status === "loading",
    };
}
