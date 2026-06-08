"use client";

import { useState } from "react";

interface UrlInputProps {
  onContentExtracted: (content: string) => void;
}

export default function UrlInput({ onContentExtracted }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  async function handleExtract() {
    if (!url.trim()) {
      setError("Por favor, insira uma URL válida.");
      return;
    }

    setLoading(true);
    setError("");
    setPreview("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao extrair conteúdo");
      }

      setPreview(data.content.slice(0, 500));
      onContentExtracted(data.content);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="url-input"
          className="block text-sm font-medium mb-1"
          style={{ color: "#0D0D0D" }}
        >
          URL do site
        </label>
        <div className="flex gap-2">
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExtract()}
            placeholder="https://exemplo.com.br/sobre"
            className="flex-1 rounded-lg px-4 py-2 text-sm outline-none transition"
            style={{
              border: "1.5px solid #C3BFB8",
              backgroundColor: "#FFFFFF",
              color: "#0D0D0D",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
            onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
          />
          <button
            onClick={handleExtract}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#FF4000" }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#e03800"; }}
            onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#FF4000"; }}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Extraindo...
              </>
            ) : (
              "Extrair conteúdo"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm text-white font-medium"
          style={{ backgroundColor: "#DC2626" }}
        >
          {error}
        </div>
      )}

      {preview && (
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: "#FAF9F7", border: "1.5px solid #C3BFB8" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: "#C3BFB8" }}
          >
            Prévia do conteúdo extraído
          </p>
          <p className="text-sm leading-relaxed line-clamp-4" style={{ color: "#555" }}>
            {preview}
            {preview.length >= 500 && (
              <span style={{ color: "#FF4000" }}> …(continua)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
