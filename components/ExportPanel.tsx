"use client";

import { useState } from "react";
import type { FAQ } from "./FaqList";

interface ExportPanelProps {
  faqs: FAQ[];
}

export default function ExportPanel({ faqs }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  if (faqs.length === 0) return null;

  const jsonOutput = JSON.stringify(faqs, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = jsonOutput;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleDownloadJson() {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faqs.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadDocx() {
    setDownloadingDocx(true);
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs, title: "FAQs Geradas" }),
      });
      if (!res.ok) throw new Error("Erro ao gerar documento");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "faqs-hotmart.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao gerar o arquivo. Tente novamente.");
      console.error(err);
    } finally {
      setDownloadingDocx(false);
    }
  }

  return (
    <div
      className="rounded-xl p-6 shadow-sm"
      style={{ backgroundColor: "#FAF9F7", border: "1.5px solid #E5E2DC" }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold" style={{ color: "#0D0D0D" }}>
            Exportar FAQs
          </h3>
          <p className="text-sm" style={{ color: "#555" }}>
            {faqs.length} {faqs.length === 1 ? "pergunta" : "perguntas"} prontas para exportar
          </p>
        </div>

        {/* Botões de export */}
        <div className="flex flex-wrap gap-3">
          {/* Copiar JSON */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white shadow transition"
            style={{ backgroundColor: "#0D0D0D" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#333333")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0D0D0D")}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar JSON
              </>
            )}
          </button>

          {/* Baixar JSON */}
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white shadow transition"
            style={{ backgroundColor: "#FF4000" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e03800")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FF4000")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar .json
          </button>

          {/* Baixar Google Docs (.docx) */}
          <button
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold shadow transition"
            style={{
              backgroundColor: downloadingDocx ? "#C3BFB8" : "#1a73e8",
              color: "white",
              cursor: downloadingDocx ? "not-allowed" : "pointer",
            }}
            onMouseOver={(e) => { if (!downloadingDocx) e.currentTarget.style.backgroundColor = "#1557b0"; }}
            onMouseOut={(e) => { if (!downloadingDocx) e.currentTarget.style.backgroundColor = "#1a73e8"; }}
          >
            {downloadingDocx ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gerando...
              </>
            ) : (
              <>
                {/* Google Docs icon */}
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                </svg>
                Baixar Google Docs (.docx)
              </>
            )}
          </button>
        </div>

        {/* Dica Google Docs */}
        <div
          className="flex items-start gap-2 rounded-lg p-3 text-xs"
          style={{ backgroundColor: "#E8F0FE", color: "#1a73e8" }}
        >
          <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Para abrir no Google Docs: acesse <strong>drive.google.com</strong>, faça upload do arquivo <strong>.docx</strong> e clique em &ldquo;Abrir com Google Docs&rdquo;.
          </span>
        </div>

        {/* Preview JSON */}
        <div className="relative">
          <pre
            className="overflow-x-auto rounded-lg p-4 text-xs max-h-48 leading-relaxed"
            style={{ backgroundColor: "#0D0D0D", color: "#FF4000" }}
          >
            {jsonOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
