/**
 * pdfExtractor.ts — runs on the MAIN THREAD only.
 *
 * Uses pdfjs-dist v3 (3.11.174). v5 is incompatible with Next.js/webpack.
 * In v3, setting GlobalWorkerOptions.workerSrc = "" activates "fake-worker"
 * (synchronous) mode — no separate Worker thread is spawned by pdfjs, so
 * there are zero Object.defineProperty crashes.
 *
 * This file must NOT be imported from inside a Web Worker.
 */

export interface ExtractedFile {
    name: string;
    type: string;
    size: number;
    /** Pre-extracted plain text for PDFs; null = "let the embedding worker handle it" */
    text: string | null;
    /** Original File object (txt / md / docx are handled by the embedding worker) */
    file: File;
}

export async function extractFilesText(files: File[]): Promise<ExtractedFile[]> {
    const results: ExtractedFile[] = [];

    for (const file of files) {
        const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");

        if (ext === ".pdf") {
            try {
                const text = await extractPdfText(file);
                results.push({ name: file.name, type: ext, size: file.size, text, file });
            } catch (err) {
                // Encode the error so useIndexing can surface it without crashing
                results.push({
                    name: file.name,
                    type: ext,
                    size: file.size,
                    text: `__EXTRACT_ERROR__:${(err as Error).message}`,
                    file,
                });
            }
        } else {
            // txt / md / docx — the embedding worker reads these itself
            results.push({ name: file.name, type: ext, size: file.size, text: null, file });
        }
    }

    return results;
}

let pdfjsConfigured = false;

async function extractPdfText(file: File): Promise<string> {
    // Dynamic import keeps pdfjs out of the initial bundle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf") as any;

    if (!pdfjsConfigured) {
        // Point to the worker file we copied into /public (served as a plain
        // static asset by Next.js at /pdf.worker.min.js).
        // This avoids webpack trying to bundle the worker and creating a broken URL.
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        pdfjsConfigured = true;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = (content.items as Array<{ str?: string }>)
            .map((item) => item.str ?? "")
            .join(" ");
        pageTexts.push(pageText);
    }

    return pageTexts.join("\n\n");
}
