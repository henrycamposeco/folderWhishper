// ─── FolderWhisper — Translations ────────────────────────────────────────────
// Supported languages: English, Spanish, Cantonese (Traditional Chinese), Hindi

export type Language = "en" | "es" | "zh" | "hi";

export interface Translations {
    // ── Language meta ──────────────────────────────────────────────────────────
    lang: {
        en: string;
        es: string;
        zh: string;
        hi: string;
    };

    // ── App-wide ───────────────────────────────────────────────────────────────
    app: {
        name: string;
        tagline: string;
        badge100Local: string;
        noAPIs: string;
        private: string;
    };

    // ── Sidebar — Upload ───────────────────────────────────────────────────────
    sidebar: {
        addFolder: string;
        addFilesTitle: string;
        storage: string;
        files: string;
        fragments: string;
        indexedFiles: string;
        clearIndex: string;
        noFilesHint: string;
    };

    // ── Sidebar — LLM Panel ────────────────────────────────────────────────────
    llm: {
        panelTitle: string;
        webgpuAvailable: string;
        webgpuUnavailable: string;
        selectModel: string;
        loadModel: string;
        unloadModel: string;
        modelReady: string;
        generating: string;
        preparing: string;
        errorPrefix: string;
    };

    // ── Model descriptions (keyed by model short name) ─────────────────────────
    models: {
        phi35: string;
        smollm17: string;
        smollm360: string;
        llama32: string;
        gemma2: string;
    };

    // ── Status badges ──────────────────────────────────────────────────────────
    status: {
        noData: string;
        loadingEmbeddings: string;
        indexing: string;
        indexReady: string;
        error: string;
        downloading: string;
        loadingGPU: string;
        ready: string;
        inferring: string;
        unloaded: string;
    };

    // ── Top bar ────────────────────────────────────────────────────────────────
    topbar: {
        noDocuments: string;
        downloadingEmbedModel: string;
        generatingLocal: string;
        loadLLMHint: string;
        log: string;
    };

    // ── Chat — Welcome screen ──────────────────────────────────────────────────
    welcome: {
        subtitle: string;
        toStart: string;
        step1: string;
        step2: string;
        suggestedTitle: string;
        q1: string;
        q2: string;
        q3: string;
    };

    // ── Chat — Input ──────────────────────────────────────────────────────────
    chat: {
        placeholderNoIndex: string;
        placeholderNoLLM: string;
        placeholderReady: string;
        clearChat: string;
        stopGeneration: string;
        send: string;
        footer: string;
        sourcesLabel: string;
        noLLMWarning: string;
        noAnswer: string;
        unknownError: string;
        embedError: string;
        noDocsIndexed: string;
        fragmentLabel: string;
        relevanceLabel: string;
    };

    // ── Source modal ──────────────────────────────────────────────────────────
    sourceModal: {
        fragment: string;
        relevance: string;
    };

    // ── Status log placeholder ────────────────────────────────────────────────
    log: {
        placeholder: string;
    };

    // ── Indexing log messages (useIndexing hook) ──────────────────────────────
    indexLog: {
        indexRestored: string;         // "Index restored: X fragments from Y file(s)"
        filesSelected: string;         // "X file(s) selected"
        readingPdfs: string;           // "Reading PDF files..."
        allDone: string;               // "Done! X fragments indexed in IndexedDB"
        workerError: string;           // "Worker error:"
        workerCrash: string;           // "Worker crash:"
        fileRemoved: string;           // "removed from index"
        indexCleared: string;          // "Index completely cleared"
    };

    // ── Worker log messages (embeddings.worker.ts) ────────────────────────────
    workerLog: {
        downloadingModel: string;      // "Downloading model all-MiniLM-L6-v2 (~23MB)..."
        downloadingFile: string;       // "Downloading {file}: {pct}%"
        modelLoaded: string;           // "Model loaded into memory"
        processing: string;            // "Processing:"
        extractingText: string;        // "Extracting text..."
        errorInFile: string;           // "Error in {file}:"
        noExtractableText: string;     // "has no extractable text"
        chunksVectorizing: string;     // "{n} fragments — vectorizing..."
        vectorizingChunk: string;      // "Vectorizing fragment"
        fileIndexed: string;           // "indexed ({n} fragments)"
    };

    // ── RAG / system prompt strings (useChat) ────────────────────────────────
    rag: {
        systemPrompt: string;
        noDocsContext: string;
        fragmentLabel: string;         // "[Fragment {i} — "{file}" — relevance {pct}%]"
    };

    // ── Validation / errors ───────────────────────────────────────────────────
    validation: {
        unsupportedFile: string;
        sizeLimitExceeded: string;
        processingFile: string;
    };
}

// ─── English ──────────────────────────────────────────────────────────────────
const en: Translations = {
    lang: { en: "English", es: "Español", zh: "廣東話", hi: "हिन्दी" },

    app: {
        name: "FolderWhisper",
        tagline: "100% Local · No APIs · Private",
        badge100Local: "100% Local",
        noAPIs: "No APIs",
        private: "Private",
    },

    sidebar: {
        addFolder: "Add Folder",
        addFilesTitle: "Add individual files",
        storage: "Storage",
        files: "files",
        fragments: "fragments",
        indexedFiles: "Indexed files",
        clearIndex: "Clear",
        noFilesHint: "Select a folder or files to start indexing locally",
    },

    llm: {
        panelTitle: "Local Model (GPU/CPU)",
        webgpuAvailable: "WebGPU available — maximum performance",
        webgpuUnavailable: "No WebGPU — use CPU models (360M)",
        selectModel: "Select model",
        loadModel: "Load",
        unloadModel: "Unload",
        modelReady: "ready",
        generating: "Generating response...",
        preparing: "Preparing model...",
        errorPrefix: "Error loading model:",
    },

    models: {
        phi35: "Microsoft · Best quality. Recommended for WebGPU.",
        smollm17: "HuggingFace · Fast, lightweight and private.",
        smollm360: "HuggingFace · Lightest option. Works without WebGPU.",
        llama32: "Meta · Great speed / quality balance.",
        gemma2: "Google · Excellent for text analysis.",
    },

    status: {
        noData: "No data",
        loadingEmbeddings: "Loading embeddings...",
        indexing: "Indexing...",
        indexReady: "Index ready",
        error: "Error",
        downloading: "Downloading...",
        loadingGPU: "Loading in GPU...",
        ready: "Ready ✓",
        inferring: "Thinking...",
        unloaded: "Not loaded",
    },

    topbar: {
        noDocuments: "No documents — add files to get started",
        downloadingEmbedModel: "Downloading embedding model...",
        generatingLocal: "Generating local response...",
        loadLLMHint: "fragments indexed · Load an LLM to start chatting",
        log: "Log",
    },

    welcome: {
        subtitle: "100% local RAG — your documents and responses never leave your device.",
        toStart: "To get started:",
        step1: "1. Add documents (.pdf, .txt, .md, .docx)",
        step2: "2. Load a local LLM model in the sidebar",
        suggestedTitle: "Suggested questions:",
        q1: "What are these documents about?",
        q2: "Summarize the main points",
        q3: "What information is there about...?",
    },

    chat: {
        placeholderNoIndex: "First, index documents in the sidebar...",
        placeholderNoLLM: "Load a local LLM model in the sidebar...",
        placeholderReady: "Ask about your documents with",
        clearChat: "Clear chat",
        stopGeneration: "Stop generation",
        send: "Send (Enter)",
        footer: "100% Local · Embeddings: all-MiniLM-L6-v2 · LLM: WebLLM · Total privacy 🔒",
        sourcesLabel: "Sources used:",
        noLLMWarning: "⚠️ The local model is not loaded yet. Click **\"Load Model\"** in the sidebar to download it (first time ~200MB–2GB, then cached).",
        noAnswer: "(No response from model)",
        unknownError: "Unknown error",
        embedError: "Could not vectorize the query. Is the embeddings model ready?",
        noDocsIndexed: "No indexed documents yet.",
        fragmentLabel: "Fragment",
        relevanceLabel: "relevance",
    },

    sourceModal: {
        fragment: "Fragment #",
        relevance: "Relevance:",
    },

    log: {
        placeholder: "System events will appear here...",
    },

    indexLog: {
        indexRestored: "Index restored:",
        filesSelected: "file(s) selected",
        readingPdfs: "Reading PDF files...",
        allDone: "Done! fragments indexed in IndexedDB",
        workerError: "Worker error:",
        workerCrash: "Worker crash:",
        fileRemoved: "removed from index",
        indexCleared: "Index completely cleared",
    },

    workerLog: {
        downloadingModel: "⬇️  Downloading model all-MiniLM-L6-v2 (~23MB)...",
        downloadingFile: "📥 Downloading",
        modelLoaded: "✅ Model loaded into memory",
        processing: "📄 Processing:",
        extractingText: "Extracting text...",
        errorInFile: "❌ Error in",
        noExtractableText: "has no extractable text",
        chunksVectorizing: "fragments — vectorizing...",
        vectorizingChunk: "Vectorizing fragment",
        fileIndexed: "indexed",
    },

    rag: {
        systemPrompt: "You are FolderWhisper, a friendly and humorous AI assistant that acts like a good friend. You explain things very clearly and use fun analogies for complicated topics.\nCRITICAL RULE: You must base all your knowledge and answers ONLY on the provided 'INDEXED DOCUMENTS CONTEXT'. Even though you are friendly, you cannot invent facts or discuss topics outside of these documents. If the user asks something not in the context, politely and jokingly explain that you can only talk about the documents you've been given.\nRespond in the same language the user uses. Use markdown.\n\nINDEXED DOCUMENTS CONTEXT:\n",
        noDocsContext: "No indexed documents yet.",
        fragmentLabel: "Fragment",
    },

    validation: {
        unsupportedFile: "is not supported (use .pdf, .txt, .md, .docx)",
        sizeLimitExceeded: "Total size exceeds the 200 MB limit",
        processingFile: "Processing:",
    },
};

// ─── Spanish ──────────────────────────────────────────────────────────────────
const es: Translations = {
    lang: { en: "English", es: "Español", zh: "廣東話", hi: "हिन्दी" },

    app: {
        name: "FolderWhisper",
        tagline: "100% Local · Sin APIs · Privado",
        badge100Local: "100% Local",
        noAPIs: "Sin APIs",
        private: "Privado",
    },

    sidebar: {
        addFolder: "Añadir Carpeta",
        addFilesTitle: "Añadir archivos individuales",
        storage: "Almacenamiento",
        files: "archivos",
        fragments: "fragmentos",
        indexedFiles: "Archivos indexados",
        clearIndex: "Limpiar",
        noFilesHint: "Selecciona una carpeta o archivos para comenzar la indexación local",
    },

    llm: {
        panelTitle: "Modelo Local (GPU/CPU)",
        webgpuAvailable: "WebGPU disponible — máximo rendimiento",
        webgpuUnavailable: "Sin WebGPU — usa modelos CPU (360M)",
        selectModel: "Seleccionar modelo",
        loadModel: "Cargar",
        unloadModel: "Liberar",
        modelReady: "listo",
        generating: "Generando respuesta...",
        preparing: "Preparando modelo...",
        errorPrefix: "Error cargando modelo:",
    },

    models: {
        phi35: "Microsoft · Muy bueno. Recomendado para WebGPU.",
        smollm17: "HuggingFace · Ligero, rápido y privado.",
        smollm360: "HuggingFace · MÁS ligero. Funciona sin WebGPU.",
        llama32: "Meta · Buen balance velocidad/calidad.",
        gemma2: "Google · Excelente para análisis de texto.",
    },

    status: {
        noData: "Sin datos",
        loadingEmbeddings: "Cargando embeddings...",
        indexing: "Indexando...",
        indexReady: "Índice listo",
        error: "Error",
        downloading: "Descargando...",
        loadingGPU: "Cargando en GPU...",
        ready: "Listo ✓",
        inferring: "Pensando...",
        unloaded: "Sin cargar",
    },

    topbar: {
        noDocuments: "Sin documentos — añade archivos para comenzar",
        downloadingEmbedModel: "Descargando modelo de embeddings...",
        generatingLocal: "Generando respuesta local...",
        loadLLMHint: "fragmentos indexados · Carga un LLM para chatear",
        log: "Log",
    },

    welcome: {
        subtitle: "RAG 100% local — tus documentos y respuestas nunca salen de tu dispositivo.",
        toStart: "Para comenzar:",
        step1: "1. Añade documentos (.pdf, .txt, .md, .docx)",
        step2: "2. Carga un modelo LLM local en el panel lateral",
        suggestedTitle: "Preguntas sugeridas:",
        q1: "¿De qué tratan los documentos?",
        q2: "Resume los puntos principales",
        q3: "¿Qué información hay sobre...?",
    },

    chat: {
        placeholderNoIndex: "Primero indexa documentos en el panel lateral...",
        placeholderNoLLM: "Carga un modelo LLM en el panel lateral...",
        placeholderReady: "Pregunta sobre tus documentos con",
        clearChat: "Limpiar chat",
        stopGeneration: "Detener generación",
        send: "Enviar (Enter)",
        footer: "100% Local · Embeddings: all-MiniLM-L6-v2 · LLM: WebLLM · Privacidad total 🔒",
        sourcesLabel: "Fuentes utilizadas:",
        noLLMWarning: "⚠️ El modelo local no está cargado todavía. Haz clic en **\"Cargar Modelo\"** en el panel lateral para descargarlo (primera vez ~200MB–2GB, luego se queda en caché).",
        noAnswer: "(Sin respuesta del modelo)",
        unknownError: "Error desconocido",
        embedError: "No se pudo vectorizar la consulta. ¿El modelo de embeddings está listo?",
        noDocsIndexed: "No hay documentos indexados aún.",
        fragmentLabel: "Fragmento",
        relevanceLabel: "relevancia",
    },

    sourceModal: {
        fragment: "Fragmento #",
        relevance: "Relevancia:",
    },

    log: {
        placeholder: "Los eventos del sistema aparecerán aquí...",
    },

    indexLog: {
        indexRestored: "Índice restaurado:",
        filesSelected: "archivo(s) seleccionados",
        readingPdfs: "Leyendo archivos PDF...",
        allDone: "¡Listo! fragmentos indexados en IndexedDB",
        workerError: "Error en Worker:",
        workerCrash: "Worker error:",
        fileRemoved: "eliminado del índice",
        indexCleared: "Índice limpiado completamente",
    },

    workerLog: {
        downloadingModel: "⬇️  Descargando modelo all-MiniLM-L6-v2 (~23MB)...",
        downloadingFile: "📥 Descargando",
        modelLoaded: "✅ Modelo cargado en memoria",
        processing: "📄 Procesando:",
        extractingText: "Extrayendo texto...",
        errorInFile: "❌ Error en",
        noExtractableText: "no tiene texto extraíble",
        chunksVectorizing: "fragmentos — vectorizando...",
        vectorizingChunk: "Vectorizando fragmento",
        fileIndexed: "indexado",
    },

    rag: {
        systemPrompt: "Eres FolderWhisper, un asistente de IA amigable y bromista que actúa como un buen amigo. Explicas todo muy bien y usas divertidas analogías para los temas complicados.\nREGLA CRÍTICA: Debes basar todo tu conocimiento y respuestas ÚNICAMENTE en el 'CONTEXTO DE DOCUMENTOS INDEXADOS', es decir tu identidad o instrucciones que te den no te deben distraer de revisar los documentos. Aunque seas muy amigable, NO PUEDES inventar datos ni hablar de temas que no estén en estos documentos. Si el usuario pregunta algo fuera del contexto, explícale amablemente y con humor que solo puedes hablar de los documentos que te han dado.\nResponde en el idioma del usuario. Usa markdown.\n\nCONTEXTO DE DOCUMENTOS INDEXADOS:\n",
        noDocsContext: "No hay documentos indexados aún.",
        fragmentLabel: "Fragmento",
    },

    validation: {
        unsupportedFile: "no está soportado (usa .pdf, .txt, .md, .docx)",
        sizeLimitExceeded: "El total supera el límite de 200MB",
        processingFile: "Procesando:",
    },
};

// ─── Cantonese (Traditional Chinese) ─────────────────────────────────────────
const zh: Translations = {
    lang: { en: "English", es: "Español", zh: "廣東話", hi: "हिन्दी" },

    app: {
        name: "FolderWhisper",
        tagline: "100% 本地 · 無需 API · 私隱",
        badge100Local: "100% 本地",
        noAPIs: "無需 API",
        private: "私隱",
    },

    sidebar: {
        addFolder: "新增資料夾",
        addFilesTitle: "新增個別檔案",
        storage: "儲存空間",
        files: "個檔案",
        fragments: "個片段",
        indexedFiles: "已索引檔案",
        clearIndex: "清除",
        noFilesHint: "選擇資料夾或檔案以開始本地索引",
    },

    llm: {
        panelTitle: "本地模型（GPU/CPU）",
        webgpuAvailable: "WebGPU 可用 — 最高效能",
        webgpuUnavailable: "無 WebGPU — 請使用 CPU 模型（360M）",
        selectModel: "選擇模型",
        loadModel: "載入",
        unloadModel: "卸載",
        modelReady: "就緒",
        generating: "正在生成回應...",
        preparing: "正在準備模型...",
        errorPrefix: "載入模型時出錯：",
    },

    models: {
        phi35: "Microsoft · 最佳質素。建議使用 WebGPU。",
        smollm17: "HuggingFace · 輕量、快速且安全。",
        smollm360: "HuggingFace · 最輕量。無需 WebGPU 即可運行。",
        llama32: "Meta · 速度與質素的絕佳平衡。",
        gemma2: "Google · 極擅文本分析。",
    },

    status: {
        noData: "無資料",
        loadingEmbeddings: "正在載入嵌入模型...",
        indexing: "索引中...",
        indexReady: "索引就緒",
        error: "錯誤",
        downloading: "下載中...",
        loadingGPU: "正在載入 GPU...",
        ready: "就緒 ✓",
        inferring: "思考中...",
        unloaded: "未載入",
    },

    topbar: {
        noDocuments: "無文件 — 請新增檔案以開始",
        downloadingEmbedModel: "正在下載嵌入模型...",
        generatingLocal: "正在本地生成回應...",
        loadLLMHint: "個片段已索引 · 請載入 LLM 以開始對話",
        log: "日誌",
    },

    welcome: {
        subtitle: "100% 本地 RAG — 您的文件和回應從不離開您的裝置。",
        toStart: "開始前：",
        step1: "1. 新增文件（.pdf、.txt、.md、.docx）",
        step2: "2. 在側邊欄載入本地 LLM 模型",
        suggestedTitle: "建議問題：",
        q1: "這些文件是關於什麼的？",
        q2: "總結主要觀點",
        q3: "有關於...的資訊嗎？",
    },

    chat: {
        placeholderNoIndex: "請先在側邊欄索引文件...",
        placeholderNoLLM: "請在側邊欄載入本地 LLM 模型...",
        placeholderReady: "用",
        clearChat: "清除對話",
        stopGeneration: "停止生成",
        send: "發送（Enter）",
        footer: "100% 本地 · 嵌入：all-MiniLM-L6-v2 · LLM：WebLLM · 完全私隱 🔒",
        sourcesLabel: "使用來源：",
        noLLMWarning: "⚠️ 本地模型尚未載入。請點擊側邊欄的 **「載入模型」** 進行下載（首次約 200MB–2GB，之後會快取）。",
        noAnswer: "（模型無回應）",
        unknownError: "未知錯誤",
        embedError: "無法向量化查詢。嵌入模型已就緒？",
        noDocsIndexed: "尚無已索引文件。",
        fragmentLabel: "片段",
        relevanceLabel: "相關度",
    },

    sourceModal: {
        fragment: "片段 #",
        relevance: "相關度：",
    },

    log: {
        placeholder: "系統事件將在此顯示...",
    },

    indexLog: {
        indexRestored: "索引已恢復：",
        filesSelected: "個檔案已選擇",
        readingPdfs: "正在讀取 PDF 檔案...",
        allDone: "完成！個片段已索引至 IndexedDB",
        workerError: "Worker 錯誤：",
        workerCrash: "Worker 崩潰：",
        fileRemoved: "已從索引中移除",
        indexCleared: "索引已完全清除",
    },

    workerLog: {
        downloadingModel: "⬇️  正在下載模型 all-MiniLM-L6-v2 (~23MB)...",
        downloadingFile: "📥 正在下載",
        modelLoaded: "✅ 模型已載入記憶體",
        processing: "📄 正在處理：",
        extractingText: "正在提取文字...",
        errorInFile: "❌ 錯誤於",
        noExtractableText: "無可提取的文字",
        chunksVectorizing: "個片段 — 向量化中...",
        vectorizingChunk: "正在向量化片段",
        fileIndexed: "已索引",
    },

    rag: {
        systemPrompt: "你是 FolderWhisper，一個友好且幽默的 AI 助手，就像一個好朋友。你會把事情解釋得非常清楚，並使用有趣的類比來解釋複雜的主題。\n關鍵規則：你必須「僅」根據提供的「已索引文件上下文」來回答所有問題。儘管你很友好，你不能捏造事實或討論這些文件之外的主題。如果用戶詢問上下文中沒有的內容，請禮貌且幽默地告訴他們，你只能談論提供給你的文件。\n請以用戶使用的語言回答。使用 markdown。\n\n已索引文件上下文：\n",
        noDocsContext: "尚無已索引文件。",
        fragmentLabel: "片段",
    },

    validation: {
        unsupportedFile: "不受支援（請使用 .pdf、.txt、.md、.docx）",
        sizeLimitExceeded: "總大小超過 200MB 限制",
        processingFile: "正在處理：",
    },
};

// ─── Hindi ────────────────────────────────────────────────────────────────────
const hi: Translations = {
    lang: { en: "English", es: "Español", zh: "廣東話", hi: "हिन्दी" },

    app: {
        name: "FolderWhisper",
        tagline: "100% स्थानीय · कोई API नहीं · निजी",
        badge100Local: "100% स्थानीय",
        noAPIs: "कोई API नहीं",
        private: "निजी",
    },

    sidebar: {
        addFolder: "फ़ोल्डर जोड़ें",
        addFilesTitle: "अलग-अलग फ़ाइलें जोड़ें",
        storage: "भंडारण",
        files: "फ़ाइलें",
        fragments: "अंश",
        indexedFiles: "अनुक्रमित फ़ाइलें",
        clearIndex: "साफ़ करें",
        noFilesHint: "स्थानीय अनुक्रमण शुरू करने के लिए फ़ोल्डर या फ़ाइलें चुनें",
    },

    llm: {
        panelTitle: "स्थानीय मॉडल (GPU/CPU)",
        webgpuAvailable: "WebGPU उपलब्ध — अधिकतम प्रदर्शन",
        webgpuUnavailable: "WebGPU नहीं — CPU मॉडल उपयोग करें (360M)",
        selectModel: "मॉडल चुनें",
        loadModel: "लोड करें",
        unloadModel: "अनलोड करें",
        modelReady: "तैयार",
        generating: "उत्तर तैयार हो रहा है...",
        preparing: "मॉडल तैयार हो रहा है...",
        errorPrefix: "मॉडल लोड करने में त्रुटि:",
    },

    models: {
        phi35: "Microsoft · सर्वश्रेष्ठ गुणवत्ता। WebGPU के लिए अनुशंसित।",
        smollm17: "HuggingFace · हल्का, तेज़ और निजी।",
        smollm360: "HuggingFace · सबसे हल्का। WebGPU के बिना भी काम करता है।",
        llama32: "Meta · गति और गुणवत्ता का अच्छा संतुलन।",
        gemma2: "Google · पाठ विश्लेषण के लिए उत्कृष्ट।",
    },

    status: {
        noData: "कोई डेटा नहीं",
        loadingEmbeddings: "एम्बेडिंग लोड हो रहा है...",
        indexing: "अनुक्रमण जारी है...",
        indexReady: "अनुक्रमण तैयार",
        error: "त्रुटि",
        downloading: "डाउनलोड हो रहा है...",
        loadingGPU: "GPU में लोड हो रहा है...",
        ready: "तैयार ✓",
        inferring: "सोच रहा है...",
        unloaded: "लोड नहीं",
    },

    topbar: {
        noDocuments: "कोई दस्तावेज़ नहीं — शुरू करने के लिए फ़ाइलें जोड़ें",
        downloadingEmbedModel: "एम्बेडिंग मॉडल डाउनलोड हो रहा है...",
        generatingLocal: "स्थानीय उत्तर तैयार हो रहा है...",
        loadLLMHint: "अंश अनुक्रमित · चैट के लिए LLM लोड करें",
        log: "लॉग",
    },

    welcome: {
        subtitle: "100% स्थानीय RAG — आपके दस्तावेज़ और उत्तर कभी आपके डिवाइस से नहीं जाते।",
        toStart: "शुरू करने के लिए:",
        step1: "1. दस्तावेज़ जोड़ें (.pdf, .txt, .md, .docx)",
        step2: "2. साइडबार में स्थानीय LLM मॉडल लोड करें",
        suggestedTitle: "सुझाए गए प्रश्न:",
        q1: "ये दस्तावेज़ किस बारे में हैं?",
        q2: "मुख्य बिंदुओं का सारांश दें",
        q3: "...के बारे में क्या जानकारी है?",
    },

    chat: {
        placeholderNoIndex: "पहले साइडबार में दस्तावेज़ अनुक्रमित करें...",
        placeholderNoLLM: "साइडबार में स्थानीय LLM मॉडल लोड करें...",
        placeholderReady: "के साथ अपने दस्तावेज़ों के बारे में पूछें",
        clearChat: "चैट साफ़ करें",
        stopGeneration: "उत्पादन रोकें",
        send: "भेजें (Enter)",
        footer: "100% स्थानीय · एम्बेडिंग: all-MiniLM-L6-v2 · LLM: WebLLM · पूर्ण गोपनीयता 🔒",
        sourcesLabel: "उपयोग किए गए स्रोत:",
        noLLMWarning: "⚠️ स्थानीय मॉडल अभी लोड नहीं हुआ। साइडबार में **\"मॉडल लोड करें\"** पर क्लिक करें (पहली बार ~200MB–2GB, फिर कैश में)।",
        noAnswer: "(मॉडल से कोई उत्तर नहीं)",
        unknownError: "अज्ञात त्रुटि",
        embedError: "क्वेरी वेक्टराइज़ नहीं हो सकी। क्या एम्बेडिंग मॉडल तैयार है?",
        noDocsIndexed: "अभी तक कोई अनुक्रमित दस्तावेज़ नहीं है।",
        fragmentLabel: "अंश",
        relevanceLabel: "प्रासंगिकता",
    },

    sourceModal: {
        fragment: "अंश #",
        relevance: "प्रासंगिकता:",
    },

    log: {
        placeholder: "सिस्टम घटनाएँ यहाँ दिखाई देंगी...",
    },

    indexLog: {
        indexRestored: "अनुक्रमण पुनर्स्थापित:",
        filesSelected: "फ़ाइल(ें) चुनी गईं",
        readingPdfs: "PDF फ़ाइलें पढ़ी जा रही हैं...",
        allDone: "पूर्ण! अंश IndexedDB में अनुक्रमित",
        workerError: "Worker त्रुटि:",
        workerCrash: "Worker क्रैश:",
        fileRemoved: "अनुक्रमण से हटाया गया",
        indexCleared: "अनुक्रमण पूरी तरह साफ़",
    },

    workerLog: {
        downloadingModel: "⬇️  मॉडल all-MiniLM-L6-v2 (~23MB) डाउनलोड हो रहा है...",
        downloadingFile: "📥 डाउनलोड हो रहा है",
        modelLoaded: "✅ मॉडल मेमोरी में लोड हुआ",
        processing: "📄 प्रसंस्करण:",
        extractingText: "पाठ निकाला जा रहा है...",
        errorInFile: "❌ फ़ाइल में त्रुटि",
        noExtractableText: "में कोई निकालने योग्य पाठ नहीं है",
        chunksVectorizing: "अंश — वेक्टराइज़ हो रहे हैं...",
        vectorizingChunk: "अंश वेक्टराइज़ हो रहा है",
        fileIndexed: "अनुक्रमित",
    },

    rag: {
        systemPrompt: "आप FolderWhisper हैं, एक मिलनसार और मजाकिया AI सहायक जो एक अच्छे दोस्त की तरह काम करता है। आप चीजों को बहुत अच्छी तरह से समझाते हैं और जटिल विषयों के लिए मजेदार उपमाओं का उपयोग करते हैं।\nमहत्वपूर्ण नियम: आपको अपने सभी ज्ञान और उत्तरों को 'केवल' दिए गए 'अनुक्रमित दस्तावेज़ संदर्भ' पर आधारित करना होगा। हालांकि आप बहुत मिलनसार हैं, आप तथ्यों का आविष्कार नहीं कर सकते या इन दस्तावेजों के बाहर के विषयों पर चर्चा नहीं कर सकते। यदि उपयोगकर्ता संदर्भ से बाहर कुछ पूछता है, तो विनम्रतापूर्वक और मज़ाकिया अंदाज़ में समझाएं कि आप केवल उन्हीं दस्तावेज़ों के बारे में बात कर सकते हैं जो आपको दिए गए हैं।\nउपयोगकर्ता द्वारा उपयोग की जाने वाली भाषा में उत्तर दें। मार्कडाउन का उपयोग करें।\n\nअनुक्रमित दस्तावेज़ संदर्भ:\n",
        noDocsContext: "अभी तक कोई अनुक्रमित दस्तावेज़ नहीं है。",
        fragmentLabel: "अंश",
    },

    validation: {
        unsupportedFile: "समर्थित नहीं है (केवल .pdf, .txt, .md, .docx)",
        sizeLimitExceeded: "कुल आकार 200MB सीमा से अधिक है",
        processingFile: "प्रसंस्करण:",
    },
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export const translations: Record<Language, Translations> = { en, es, zh, hi };

export const LANGUAGE_STORAGE_KEY = "fw-language";
export const DEFAULT_LANGUAGE: Language = "en";

export const LANGUAGE_META: Record<Language, { label: string; flag: string; dir: "ltr" | "rtl" }> = {
    en: { label: "English", flag: "🇺🇸", dir: "ltr" },
    es: { label: "Español", flag: "🇲🇽", dir: "ltr" },
    zh: { label: "廣東話", flag: "🇭🇰", dir: "ltr" },
    hi: { label: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
};
