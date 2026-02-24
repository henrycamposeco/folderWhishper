import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, CHUNK_SIZE, CHUNK_OVERLAP } from "@/types";

export interface ValidationResult {
    valid: boolean;
    totalSize: number;
    files: File[];
    errors: string[];
}

export function validateFiles(fileList: FileList): ValidationResult {
    const files: File[] = [];
    const errors: string[] = [];
    let totalSize = 0;

    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = "." + file.name.split(".").pop()?.toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            errors.push(`"${file.name}" no está soportado (usa .pdf, .txt, .md, .docx)`);
            continue;
        }

        totalSize += file.size;
        files.push(file);
    }

    if (totalSize > MAX_FILE_SIZE) {
        errors.push(
            `El total (${formatBytes(totalSize)}) supera el límite de 200MB`
        );
        return { valid: false, totalSize, files: [], errors };
    }

    return {
        valid: files.length > 0 && errors.length === 0,
        totalSize,
        files,
        errors,
    };
}

export function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
    return "." + filename.split(".").pop()?.toLowerCase();
}

export function chunkText(text: string, fileName: string, fileType: string, fileSize: number) {
    const chunks: {
        id: string;
        content: string;
        metadata: {
            fileName: string;
            fileType: string;
            chunkIndex: number;
            totalChunks: number;
            fileSize: number;
        };
    }[] = [];

    // Split by paragraphs first, then by size
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = "";
    let chunkIndex = 0;

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        if (currentChunk.length + trimmed.length > CHUNK_SIZE) {
            if (currentChunk.length > 0) {
                chunks.push({
                    id: `${fileName}-${chunkIndex}`,
                    content: currentChunk.trim(),
                    metadata: {
                        fileName,
                        fileType,
                        chunkIndex,
                        totalChunks: 0, // will be updated
                        fileSize,
                    },
                });
                chunkIndex++;
                // Overlap: keep last CHUNK_OVERLAP chars
                currentChunk =
                    currentChunk.slice(-CHUNK_OVERLAP) + "\n\n" + trimmed;
            } else {
                // Paragraph is very long, split it by sentences
                const sentences = trimmed.split(/(?<=[.!?])\s+/);
                for (const sentence of sentences) {
                    if (currentChunk.length + sentence.length > CHUNK_SIZE) {
                        if (currentChunk.length > 0) {
                            chunks.push({
                                id: `${fileName}-${chunkIndex}`,
                                content: currentChunk.trim(),
                                metadata: {
                                    fileName,
                                    fileType,
                                    chunkIndex,
                                    totalChunks: 0,
                                    fileSize,
                                },
                            });
                            chunkIndex++;
                            currentChunk = currentChunk.slice(-CHUNK_OVERLAP) + " " + sentence;
                        } else {
                            currentChunk = sentence;
                        }
                    } else {
                        currentChunk += " " + sentence;
                    }
                }
            }
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push({
            id: `${fileName}-${chunkIndex}`,
            content: currentChunk.trim(),
            metadata: {
                fileName,
                fileType,
                chunkIndex,
                totalChunks: 0,
                fileSize,
            },
        });
    }

    // Update total chunks count
    const total = chunks.length;
    return chunks.map((c) => ({
        ...c,
        metadata: { ...c.metadata, totalChunks: total },
    }));
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
