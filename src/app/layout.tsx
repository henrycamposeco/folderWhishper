import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "FolderWhisper — Local RAG in Your Browser",
  description:
    "Talk to your documents 100% locally. No APIs, no servers, complete privacy. Embeddings with all-MiniLM-L6-v2, local LLM via WebLLM (Phi-3, SmolLM2, Llama), persistence in IndexedDB.",
  keywords: [
    "RAG",
    "local AI",
    "LLM",
    "embeddings",
    "Transformers.js",
    "WebLLM",
    "IndexedDB",
    "private AI",
    "chat documents",
    "offline AI",
  ],
  authors: [{ name: "FolderWhisper" }],
  openGraph: {
    title: "FolderWhisper — Local RAG",
    description: "Talk to your documents. No servers, no cloud, total privacy.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
