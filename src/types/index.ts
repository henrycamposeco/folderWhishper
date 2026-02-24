export interface DocumentChunk {
    id: string;
    content: string;
    metadata: {
        fileName: string;
        fileType: string;
        chunkIndex: number;
        totalChunks: number;
        fileSize: number;
    };
    embedding?: number[];
}

export interface ProcessedFile {
    name: string;
    type: string;
    size: number;
    chunks: number;
    status: "pending" | "processing" | "done" | "error";
    error?: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: SourceDocument[];
    timestamp: Date;
    isLoading?: boolean;
}

export interface SourceDocument {
    fileName: string;
    content: string;
    score: number;
    chunkIndex: number;
}

export interface WorkerMessage {
    type:
    | "PROCESS_FILES"
    | "PROGRESS"
    | "COMPLETE"
    | "ERROR"
    | "LOG"
    | "EMBED_QUERY"
    | "QUERY_EMBEDDING";
    payload?: unknown;
}

// ─── Local LLM config (WebLLM — no external APIs) ────────────────────────────
export type ModelDescriptionKey = "phi35" | "smollm17" | "smollm360" | "llama32" | "gemma2";

export interface LocalLLMModel {
    id: string;
    label: string;
    descriptionKey: ModelDescriptionKey; // looked up in t.models at render time
    sizeLabel: string;
    requiresWebGPU: boolean;
    icon: string;
}

export const LOCAL_MODELS: LocalLLMModel[] = [
    {
        id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
        label: "Phi-3.5 Mini",
        descriptionKey: "phi35",
        sizeLabel: "~2.2 GB",
        requiresWebGPU: true,
        icon: "⚡",
    },
    {
        id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
        label: "SmolLM2 1.7B",
        descriptionKey: "smollm17",
        sizeLabel: "~1.0 GB",
        requiresWebGPU: true,
        icon: "🚀",
    },
    {
        id: "SmolLM2-360M-Instruct-q0f16-MLC",
        label: "SmolLM2 360M (CPU)",
        descriptionKey: "smollm360",
        sizeLabel: "~200 MB",
        requiresWebGPU: false,
        icon: "🪶",
    },
    {
        id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
        label: "Llama 3.2 1B",
        descriptionKey: "llama32",
        sizeLabel: "~800 MB",
        requiresWebGPU: true,
        icon: "🦙",
    },
    {
        id: "gemma-2-2b-it-q4f16_1-MLC",
        label: "Gemma 2 2B",
        descriptionKey: "gemma2",
        sizeLabel: "~1.5 GB",
        requiresWebGPU: true,
        icon: "💎",
    },
];

export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
export const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md", ".docx"];
export const CHUNK_SIZE = 500;
export const CHUNK_OVERLAP = 50;
export const TOP_K_RESULTS = 5;

// LLM engine status
export type LLMStatus =
    | "idle"
    | "downloading"
    | "loading"
    | "ready"
    | "inferring"
    | "error";
