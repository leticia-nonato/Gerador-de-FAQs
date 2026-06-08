"use client";

import { useState } from "react";
import type { FAQ } from "./FaqList";

interface InternalLink {
  url: string;
  label: string;
}

interface InternalLinksProps {
  faqs: FAQ[];
  onFaqsUpdated: (faqs: FAQ[]) => void;
}

export default function InternalLinks({ faqs, onFaqsUpdated }: InternalLinksProps) {
  const [links, setLinks] = useState<InternalLink[]>([{ url: "", label: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const hasFaqs = faqs.length > 0;

  function addLink() {
    setLinks([...links, { url: "", label: "" }]);
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: "url" | "label", value: string) {
    const updated = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    setLinks(updated);
  }

  async function handleInsertLinks() {
    const validLinks = links.filter(
      (l) => l.url.trim() && l.label.trim()
    );

    if (validLinks.length === 0) {
      setError("Adicione pelo menos um link com URL e rótulo preenchidos.");
      return;
    }

    if (!hasFaqs) {
      setError("Gere as FAQs primeiro.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/add-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs, internalLinks: validLinks }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao inserir links");
      }

      onFaqsUpdated(data.faqs);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                placeholder="Rótulo (ex: Planos e Preços)"
                className="rounded-lg px-3 py-2 text-sm outline-none transition"
                style={{
                  border: "1.5px solid #C3BFB8",
                  backgroundColor: "#FFFFFF",
                  color: "#0D0D0D",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
                onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://exemplo.com/planos"
                className="rounded-lg px-3 py-2 text-sm outline-none transition"
                style={{
                  border: "1.5px solid #C3BFB8",
                  backgroundColor: "#FFFFFF",
                  color: "#0D0D0D",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
                onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
              />
            </div>
            {links.length > 1 && (
              <button
                onClick={() => removeLink(i)}
                className="mt-0.5 rounded p-2 transition"
                style={{ color: "#C3BFB8" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "#DC2626";
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "#C3BFB8";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                title="Remover link"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addLink}
        className="inline-flex items-center gap-1 text-sm font-medium transition"
        style={{ color: "#FF4000" }}
        onMouseOver={(e) => (e.currentTarget.style.color = "#e03800")}
        onMouseOut={(e) => (e.currentTarget.style.color = "#FF4000")}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Adicionar link
      </button>

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm text-white font-medium"
          style={{ backgroundColor: "#DC2626" }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2"
          style={{ backgroundColor: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Links inseridos com sucesso nas respostas!
        </div>
      )}

      <button
        onClick={handleInsertLinks}
        disabled={!hasFaqs || loading}
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#FF4000" }}
        onMouseOver={(e) => { if (hasFaqs && !loading) e.currentTarget.style.backgroundColor = "#e03800"; }}
        onMouseOut={(e) => { if (hasFaqs && !loading) e.currentTarget.style.backgroundColor = "#FF4000"; }}
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Inserindo links...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Inserir links nas respostas
          </>
        )}
      </button>

      {!hasFaqs && (
        <p className="text-xs" style={{ color: "#D97706" }}>
          Gere as FAQs no passo anterior antes de inserir links.
        </p>
      )}
    </div>
  );
}
