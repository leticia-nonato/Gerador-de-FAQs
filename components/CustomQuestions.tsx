"use client";

import { useState } from "react";
import type { FAQ } from "./FaqList";

interface CustomQuestionsProps {
  content: string;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onFaqsGenerated: (faqs: FAQ[]) => void;
  onAutoGenerate: () => void;
  autoGenerating: boolean;
}

export default function CustomQuestions({
  content,
  keywords,
  onKeywordsChange,
  onFaqsGenerated,
  onAutoGenerate,
  autoGenerating,
}: CustomQuestionsProps) {
  const [questionsText, setQuestionsText] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasContent = content.trim().length > 0;

  function addKeyword() {
    const kw = keywordInput.trim();
    if (!kw) return;
    if (!keywords.includes(kw)) {
      onKeywordsChange([...keywords, kw]);
    }
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    onKeywordsChange(keywords.filter((k) => k !== kw));
  }

  function handleKeywordKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  }

  async function handleAnswerQuestions() {
    if (!questionsText.trim()) {
      setError("Por favor, insira pelo menos uma pergunta.");
      return;
    }
    if (!hasContent) {
      setError("Extraia o conteúdo de uma URL primeiro.");
      return;
    }

    const questions = questionsText
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (questions.length === 0) {
      setError("Nenhuma pergunta válida encontrada.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/answer-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, questions, keywords }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao responder perguntas");

      onFaqsGenerated(data.faqs);
      setQuestionsText("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* Campo de palavras-chave */}
      <div
        className="rounded-lg p-4 space-y-3"
        style={{ backgroundColor: "#FFF8F6", border: "1.5px solid #FFD0C2" }}
      >
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: "#0D0D0D" }}>
            Palavras-chave obrigatórias
          </label>
          <p className="text-xs" style={{ color: "#888" }}>
            Cada palavra-chave aparecerá pelo menos 1x nas respostas. Pressione{" "}
            <kbd className="rounded px-1 py-0.5 text-xs font-mono" style={{ backgroundColor: "#F0EDE8" }}>Enter</kbd>{" "}
            ou{" "}
            <kbd className="rounded px-1 py-0.5 text-xs font-mono" style={{ backgroundColor: "#F0EDE8" }}>,</kbd>{" "}
            para adicionar.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            placeholder="Ex: Hotmart, curso online, produtor digital..."
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition"
            style={{
              border: "1.5px solid #C3BFB8",
              backgroundColor: "#FFFFFF",
              color: "#0D0D0D",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
            onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
          />
          <button
            onClick={addKeyword}
            disabled={!keywordInput.trim()}
            className="rounded-lg px-3 py-2 text-sm font-bold text-white transition disabled:opacity-40"
            style={{ backgroundColor: "#FF4000" }}
            onMouseOver={(e) => { if (keywordInput.trim()) e.currentTarget.style.backgroundColor = "#e03800"; }}
            onMouseOut={(e) => { if (keywordInput.trim()) e.currentTarget.style.backgroundColor = "#FF4000"; }}
          >
            Adicionar
          </button>
        </div>

        {keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: "#FF4000", color: "#FFFFFF" }}
              >
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className="ml-1 rounded-full transition hover:opacity-70"
                  title="Remover"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "#C3BFB8" }}>
            Nenhuma palavra-chave adicionada ainda.
          </p>
        )}
      </div>

      {/* Botão gerar automático */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAutoGenerate}
          disabled={!hasContent || autoGenerating}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#FF4000" }}
          onMouseOver={(e) => { if (hasContent && !autoGenerating) e.currentTarget.style.backgroundColor = "#e03800"; }}
          onMouseOut={(e) => { if (hasContent && !autoGenerating) e.currentTarget.style.backgroundColor = "#FF4000"; }}
        >
          {autoGenerating ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Gerando FAQs...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Gerar FAQs Automaticamente
            </>
          )}
        </button>
        {!hasContent && (
          <p className="text-xs self-center" style={{ color: "#D97706" }}>
            Extraia o conteúdo de uma URL primeiro
          </p>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: "#E5E2DC" }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 font-medium" style={{ backgroundColor: "#FFFFFF", color: "#C3BFB8" }}>
            ou adicione perguntas personalizadas
          </span>
        </div>
      </div>

      {/* Perguntas personalizadas */}
      <div>
        <label htmlFor="custom-questions" className="block text-sm font-medium mb-1" style={{ color: "#0D0D0D" }}>
          Perguntas personalizadas
          <span className="ml-1 text-xs font-normal" style={{ color: "#C3BFB8" }}>(uma por linha)</span>
        </label>
        <textarea
          id="custom-questions"
          value={questionsText}
          onChange={(e) => setQuestionsText(e.target.value)}
          placeholder={"Como funciona o processo de contratação?\nQuais são as formas de pagamento?\nVocês oferecem garantia?"}
          rows={5}
          className="w-full rounded-lg px-4 py-3 text-sm outline-none transition resize-none"
          style={{ border: "1.5px solid #C3BFB8", backgroundColor: "#FFFFFF", color: "#0D0D0D" }}
          onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
          onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
        />
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm text-white font-medium" style={{ backgroundColor: "#DC2626" }}>
          {error}
        </div>
      )}

      <button
        onClick={handleAnswerQuestions}
        disabled={!hasContent || loading || !questionsText.trim()}
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#FF4000" }}
        onMouseOver={(e) => { if (hasContent && !loading && questionsText.trim()) e.currentTarget.style.backgroundColor = "#e03800"; }}
        onMouseOut={(e) => { if (hasContent && !loading && questionsText.trim()) e.currentTarget.style.backgroundColor = "#FF4000"; }}
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Gerando respostas...
          </>
        ) : (
          "Gerar respostas"
        )}
      </button>
    </div>
  );
}
