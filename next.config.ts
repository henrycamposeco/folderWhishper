import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  devIndicators: false,
  webpack: (config, { isServer, webpack }) => {
    // Enable WASM + top-level await
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Fix for Transformers.js / ONNX in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
      };
    }

    // pdfjs-dist v3 has an optional `require("canvas")` for server-side rendering.
    // It doesn't exist in the browser — suppress it completely so webpack doesn't error.
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^canvas$/ })
    );

    return config;
  },


  // Required for SharedArrayBuffer (ONNX WASM threads)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      {
        // Allow the pdfjs worker (static file in /public) to be loaded under COEP
        source: "/pdf.worker.min.js",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
