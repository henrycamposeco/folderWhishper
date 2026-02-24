// ─── Web Worker: Embedding Engine ────────────────────────────────────────────
// Runs in a separate thread. PDF text must be pre-extracted on the main thread
// (pdfjs-dist v5 crashes here with "Object.defineProperty on non-object").
// Receives the current language from the main thread and uses translations
// directly (no React context needed — pure TS import).

import { pipeline, env, FeatureExtractionPipeline } from "@xenova/transformers";
import { chunkText, getFileExtension } from "@/lib/utils";
import { translations, Language } from "@/i18n/translations";

// Configure transformers.js
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

type ProgressCallback = (data: { status: string; progress?: number; file?: string }) => void;

let embedder: FeatureExtractionPipeline | null = null;
let wl = translations["en"].workerLog; // default; overwritten per message

async function getEmbedder(progressCb: ProgressCallback): Promise<FeatureExtractionPipeline> {
    if (embedder) return embedder;

    postMessage({ type: "LOG", payload: { message: wl.downloadingModel, level: "loading" } });

    embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        {
            progress_callback: (p: { status: string; progress?: number; file?: string }) => {
                progressCb(p);
                if (p.status === "downloading") {
                    postMessage({
                        type: "LOG",
                        payload: {
                            message: `${wl.downloadingFile} ${p.file || "model"}: ${Math.round(p.progress || 0)}%`,
                            level: "loading",
                        },
                    });
                }
            },
        }
    ) as FeatureExtractionPipeline;

    postMessage({ type: "LOG", payload: { message: wl.modelLoaded, level: "success" } });
    return embedder;
}

/** Extract text for non-PDF files (.txt, .md, .docx). PDFs are pre-extracted. */
async function extractTextFromFile(file: File): Promise<string> {
    const ext = getFileExtension(file.name);

    if (ext === ".txt" || ext === ".md") {
        return await file.text();
    }

    if (ext === ".docx") {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }

    throw new Error(`Unsupported file type in worker: ${ext}`);
}

async function embedText(text: string, model: FeatureExtractionPipeline): Promise<number[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output = await (model as any)(text, { pooling: "mean", normalize: true });
    return Array.from(output.data as Float32Array);
}

// ─── Message Handler ──────────────────────────────────────────────────────────
export interface WorkerFilePayload {
    file: File;
    preExtractedText: string | null;
}

self.onmessage = async (event: MessageEvent) => {
    const { type, payload } = event.data;

    if (type === "PROCESS_FILES") {
        const { files, lang } = payload as { files: WorkerFilePayload[]; lang?: Language };

        // Set translated log strings for this run
        wl = translations[lang && lang in translations ? lang : "en"].workerLog;

        try {
            const model = await getEmbedder(() => { });
            const allChunks: {
                id: string;
                content: string;
                metadata: {
                    fileName: string;
                    fileType: string;
                    chunkIndex: number;
                    totalChunks: number;
                    fileSize: number;
                };
                embedding: number[];
            }[] = [];

            for (let fi = 0; fi < files.length; fi++) {
                const { file, preExtractedText } = files[fi];

                postMessage({
                    type: "LOG",
                    payload: { message: `${wl.processing} ${file.name}`, level: "info" },
                });

                postMessage({
                    type: "PROGRESS",
                    payload: {
                        fileName: file.name,
                        progress: 0,
                        stage: wl.extractingText,
                        fileIndex: fi,
                        totalFiles: files.length,
                    },
                });

                let text: string;

                if (preExtractedText !== null) {
                    // Check for extraction error signalled by main thread
                    if (preExtractedText.startsWith("__EXTRACT_ERROR__:")) {
                        postMessage({
                            type: "LOG",
                            payload: {
                                message: `${wl.errorInFile} ${file.name}: ${preExtractedText.replace("__EXTRACT_ERROR__:", "")}`,
                                level: "error",
                            },
                        });
                        continue;
                    }
                    text = preExtractedText;
                } else {
                    try {
                        text = await extractTextFromFile(file);
                    } catch (err) {
                        postMessage({
                            type: "LOG",
                            payload: {
                                message: `${wl.errorInFile} ${file.name}: ${(err as Error).message}`,
                                level: "error",
                            },
                        });
                        continue;
                    }
                }

                if (!text.trim()) {
                    postMessage({
                        type: "LOG",
                        payload: {
                            message: `⚠️  ${file.name} ${wl.noExtractableText}`,
                            level: "warning",
                        },
                    });
                    continue;
                }

                const ext = getFileExtension(file.name);
                const chunks = chunkText(text, file.name, ext, file.size);

                postMessage({
                    type: "LOG",
                    payload: {
                        message: `🔀 ${file.name}: ${chunks.length} ${wl.chunksVectorizing}`,
                        level: "info",
                    },
                });

                for (let ci = 0; ci < chunks.length; ci++) {
                    const chunk = chunks[ci];
                    const embedding = await embedText(chunk.content, model);
                    allChunks.push({ ...chunk, embedding });

                    postMessage({
                        type: "PROGRESS",
                        payload: {
                            fileName: file.name,
                            progress: Math.round(((ci + 1) / chunks.length) * 100),
                            stage: `${wl.vectorizingChunk} ${ci + 1}/${chunks.length}`,
                            fileIndex: fi,
                            totalFiles: files.length,
                        },
                    });
                }

                postMessage({
                    type: "LOG",
                    payload: {
                        message: `✅ ${file.name} ${wl.fileIndexed} (${chunks.length} ${wl.chunksVectorizing.split(" ")[0]})`,
                        level: "success",
                    },
                });
            }

            postMessage({
                type: "COMPLETE",
                payload: { chunks: allChunks },
            });
        } catch (err) {
            postMessage({
                type: "ERROR",
                payload: { message: (err as Error).message },
            });
        }
    }

    if (type === "EMBED_QUERY") {
        const { text } = payload as { text: string };
        try {
            const model = await getEmbedder(() => { });
            const embedding = await embedText(text, model);
            postMessage({ type: "QUERY_EMBEDDING", payload: { embedding } });
        } catch (err) {
            postMessage({ type: "ERROR", payload: { message: (err as Error).message } });
        }
    }
};
