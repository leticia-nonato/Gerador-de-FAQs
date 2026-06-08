"use client";

import { useState } from "react";
import FaqList, { type FAQ } from "@/components/FaqList";
import ExportPanel from "@/components/ExportPanel";
import UrlInput from "@/components/UrlInput";

type Step = 1 | 2 | 3 | 4;

export default function Home() {
  const [activeStep, setActiveStep] = useState<Step>(1);
  const [content, setContent] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [internalLinks, setInternalLinks] = useState<{ url: string; label: string }[]>([{ url: "", label: "" }]);
  const [customQuestions, setCustomQuestions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const steps = [
    { id: 1, label: "URL do site" },
    { id: 2, label: "Palavras-chave" },
    { id: 3, label: "Links internos" },
    { id: 4, label: "Gerar FAQ" },
  ];

  // ── Keywords ──────────────────────────────────────────────
  function addKeyword() {
    const kw = keywordInput.trim();
    if (!kw || keywords.includes(kw)) return;
    setKeywords([...keywords, kw]);
    setKeywordInput("");
  }
  function removeKeyword(kw: string) {
    setKeywords(keywords.filter((k) => k !== kw));
  }
  function handleKeywordKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addKeyword(); }
  }

  // ── Internal links ────────────────────────────────────────
  function addLink() {
    setInternalLinks([...internalLinks, { url: "", label: "" }]);
  }
  function removeLink(i: number) {
    setInternalLinks(internalLinks.filter((_, idx) => idx !== i));
  }
  function updateLink(i: number, field: "url" | "label", value: string) {
    setInternalLinks(internalLinks.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  // ── Generate FAQs ─────────────────────────────────────────
  async function handleGenerate() {
    if (!content) { setError("Extraia o conteúdo de uma URL primeiro."); return; }
    setGenerating(true);
    setError("");

    try {
      const validLinks = internalLinks.filter(l => l.url.trim() && l.label.trim());
      const questions = customQuestions.split("\n").map(q => q.trim()).filter(Boolean).slice(0, 10);

      let generatedFaqs: FAQ[] = [];

      if (questions.length > 0) {
        // Gera respostas para perguntas personalizadas
        const res = await fetch("/api/answer-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, questions, keywords }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao gerar respostas");
        generatedFaqs = data.faqs;
      } else {
        // Gera FAQs automaticamente
        const res = await fetch("/api/generate-faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, keywords }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao gerar FAQs");
        generatedFaqs = data.faqs;
      }

      // Insere links automaticamente se houver
      setDebugInfo(`Links válidos: ${validLinks.length} | FAQs geradas: ${generatedFaqs.length} | Links: ${JSON.stringify(validLinks)}`);
      if (validLinks.length > 0 && generatedFaqs.length > 0) {
        const resLinks = await fetch("/api/add-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ faqs: generatedFaqs, internalLinks: validLinks }),
        });
        const dataLinks = await resLinks.json();
        if (!resLinks.ok) throw new Error(dataLinks.error || "Erro ao inserir links internos");
        if (dataLinks.faqs) generatedFaqs = dataLinks.faqs;
      }

      setFaqs(prev => [...prev, ...generatedFaqs]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao gerar FAQs");
    } finally {
      setGenerating(false);
    }
  }

  function handleContentExtracted(c: string) {
    setContent(c);
    setActiveStep(2);
  }

  function goTo(step: Step) {
    setActiveStep(step);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3EF" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#0D0D0D" }} className="sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight" style={{ color: "#FFFFFF" }}>hotmart</span>
          <span className="text-sm font-medium" style={{ color: "#C3BFB8" }}>Gerador de FAQs</span>
        </div>
        <div style={{ height: "3px", backgroundColor: "#FF4000" }} />
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        {/* Stepper */}
        <nav>
          <ol className="flex items-center">
            {steps.map((step, idx) => (
              <li key={step.id} className="flex items-center flex-1">
                <button onClick={() => goTo(step.id as Step)} className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: activeStep === step.id ? "#FF4000" : step.id < activeStep ? "#FF4000" : "#C3BFB8",
                      color: "#FFFFFF",
                    }}
                  >
                    {step.id < activeStep ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.id}
                  </span>
                  <span className="text-sm font-semibold hidden sm:block" style={{ color: activeStep === step.id ? "#FF4000" : step.id < activeStep ? "#FF4000" : "#C3BFB8" }}>
                    {step.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-3 rounded" style={{ backgroundColor: step.id < activeStep ? "#FF4000" : "#C3BFB8" }} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* ── Passo 1: URL ───────────────────────────────── */}
            <section className="rounded-xl bg-white p-6 shadow-sm" style={{ border: activeStep === 1 ? "1.5px solid #FF4000" : "1.5px solid #E5E2DC" }}>
              <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => goTo(1)}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: activeStep === 1 ? "#FF4000" : "#C3BFB8", color: "#fff" }}>1</span>
                <h2 className="text-base font-semibold" style={{ color: "#0D0D0D" }}>URL do site</h2>
                {content && <span className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#ECFDF5", color: "#065F46" }}>Extraído ✓</span>}
              </div>
              {activeStep === 1 && <UrlInput onContentExtracted={handleContentExtracted} />}
              {activeStep !== 1 && content && (
                <p className="text-sm" style={{ color: "#555" }}>
                  Conteúdo extraído.{" "}
                  <button onClick={() => goTo(1)} className="font-medium hover:underline" style={{ color: "#FF4000" }}>Alterar URL</button>
                </p>
              )}
            </section>

            {/* ── Passo 2: Palavras-chave ─────────────────────── */}
            <section className="rounded-xl bg-white p-6 shadow-sm" style={{ border: activeStep === 2 ? "1.5px solid #FF4000" : "1.5px solid #E5E2DC" }}>
              <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => goTo(2)}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: activeStep === 2 ? "#FF4000" : "#C3BFB8", color: "#fff" }}>2</span>
                <h2 className="text-base font-semibold" style={{ color: "#0D0D0D" }}>Palavras-chave</h2>
                {keywords.length > 0 && (
                  <span className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#FFF0EB", color: "#FF4000" }}>
                    {keywords.length} {keywords.length === 1 ? "palavra" : "palavras"}
                  </span>
                )}
              </div>
              {activeStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: "#555" }}>
                    Adicione palavras-chave que devem aparecer pelo menos <strong>1x</strong> nas respostas. Pressione{" "}
                    <kbd className="rounded px-1 py-0.5 text-xs font-mono" style={{ backgroundColor: "#F0EDE8" }}>Enter</kbd> ou{" "}
                    <kbd className="rounded px-1 py-0.5 text-xs font-mono" style={{ backgroundColor: "#F0EDE8" }}>,</kbd> para adicionar.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKey}
                      placeholder="Ex: Hotmart, curso online, produtor digital..."
                      className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition"
                      style={{ border: "1.5px solid #C3BFB8", backgroundColor: "#FFFFFF", color: "#0D0D0D" }}
                      onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
                      onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
                    />
                    <button
                      onClick={addKeyword}
                      disabled={!keywordInput.trim()}
                      className="rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:opacity-40"
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
                        <span key={kw} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "#FF4000", color: "#FFFFFF" }}>
                          {kw}
                          <button onClick={() => removeKeyword(kw)} className="ml-1 hover:opacity-70 transition">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "#C3BFB8" }}>Nenhuma palavra-chave adicionada. Este campo é opcional.</p>
                  )}
                </div>
              )}
              {activeStep !== 2 && keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span key={kw} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: "#FF4000", color: "#FFFFFF" }}>{kw}</span>
                  ))}
                </div>
              )}
              {activeStep !== 2 && keywords.length === 0 && (
                <p className="text-sm" style={{ color: "#C3BFB8" }}>Nenhuma palavra-chave. <button onClick={() => goTo(2)} className="hover:underline" style={{ color: "#FF4000" }}>Adicionar</button></p>
              )}
            </section>

            {/* ── Passo 3: Links internos ─────────────────────── */}
            <section className="rounded-xl bg-white p-6 shadow-sm" style={{ border: activeStep === 3 ? "1.5px solid #FF4000" : "1.5px solid #E5E2DC" }}>
              <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => goTo(3)}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: activeStep === 3 ? "#FF4000" : "#C3BFB8", color: "#fff" }}>3</span>
                <h2 className="text-base font-semibold" style={{ color: "#0D0D0D" }}>Links internos</h2>
                {internalLinks.some(l => l.url.trim() && l.label.trim()) && (
                  <span className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#FFF0EB", color: "#FF4000" }}>
                    {internalLinks.filter(l => l.url.trim() && l.label.trim()).length} {internalLinks.filter(l => l.url && l.label).length === 1 ? "link" : "links"}
                  </span>
                )}
              </div>
              {activeStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: "#555" }}>
                    Adicione links internos que serão inseridos automaticamente nas respostas onde fizerem sentido.
                  </p>
                  <div className="space-y-3">
                    {internalLinks.map((link, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => updateLink(i, "label", e.target.value)}
                            placeholder="Rótulo (ex: Planos e Preços)"
                            className="rounded-lg px-3 py-2 text-sm outline-none transition"
                            style={{ border: "1.5px solid #C3BFB8", backgroundColor: "#FFFFFF", color: "#0D0D0D" }}
                            onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
                            onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(i, "url", e.target.value)}
                            placeholder="https://exemplo.com/planos"
                            className="rounded-lg px-3 py-2 text-sm outline-none transition"
                            style={{ border: "1.5px solid #C3BFB8", backgroundColor: "#FFFFFF", color: "#0D0D0D" }}
                            onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
                            onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
                          />
                        </div>
                        {internalLinks.length > 1 && (
                          <button onClick={() => removeLink(i)} className="mt-1 rounded p-1.5 transition" style={{ color: "#C3BFB8" }}
                            onMouseOver={(e) => { e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = "#C3BFB8"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={addLink} className="inline-flex items-center gap-1 text-sm font-medium transition" style={{ color: "#FF4000" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#e03800")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "#FF4000")}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar link
                  </button>
                </div>
              )}
              {activeStep !== 3 && internalLinks.some(l => l.url.trim() && l.label.trim()) && (
                <p className="text-sm" style={{ color: "#555" }}>
                  {internalLinks.filter(l => l.url.trim() && l.label.trim()).length} link(s) configurado(s).{" "}
                  <button onClick={() => goTo(3)} className="hover:underline font-medium" style={{ color: "#FF4000" }}>Editar</button>
                </p>
              )}
              {activeStep !== 3 && !internalLinks.some(l => l.url.trim() && l.label.trim()) && (
                <p className="text-sm" style={{ color: "#C3BFB8" }}>Nenhum link. <button onClick={() => goTo(3)} className="hover:underline" style={{ color: "#FF4000" }}>Adicionar</button></p>
              )}
            </section>

            {/* ── Passo 4: Gerar FAQ ─────────────────────────── */}
            <section className="rounded-xl bg-white p-6 shadow-sm" style={{ border: activeStep === 4 ? "1.5px solid #FF4000" : "1.5px solid #E5E2DC" }}>
              <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => goTo(4)}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: activeStep === 4 ? "#FF4000" : "#C3BFB8", color: "#fff" }}>4</span>
                <h2 className="text-base font-semibold" style={{ color: "#0D0D0D" }}>Gerar FAQ</h2>
                {faqs.length > 0 && (
                  <span className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#FFF0EB", color: "#FF4000" }}>
                    {faqs.length} {faqs.length === 1 ? "FAQ" : "FAQs"}
                  </span>
                )}
              </div>
              {activeStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#0D0D0D" }}>
                      Perguntas personalizadas
                      <span className="ml-1 text-xs font-normal" style={{ color: "#C3BFB8" }}>(opcional — uma por linha)</span>
                    </label>
                    <textarea
                      value={customQuestions}
                      onChange={(e) => setCustomQuestions(e.target.value)}
                      placeholder={"Deixe em branco para gerar automaticamente, ou escreva suas perguntas:\n\nComo funciona o processo de contratação?\nQuais são as formas de pagamento?"}
                      rows={5}
                      className="w-full rounded-lg px-4 py-3 text-sm outline-none transition resize-none"
                      style={{ border: "1.5px solid #C3BFB8", backgroundColor: "#FFFFFF", color: "#0D0D0D" }}
                      onFocus={(e) => (e.target.style.borderColor = "#FF4000")}
                      onBlur={(e) => (e.target.style.borderColor = "#C3BFB8")}
                    />
                    <p className="mt-1 text-xs" style={{ color: "#888" }}>
                      Se deixar em branco, o gerador criará as perguntas automaticamente. Máximo de <strong>10 perguntas</strong>.
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-lg px-4 py-3 text-sm text-white font-medium" style={{ backgroundColor: "#DC2626" }}>
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={!content || generating}
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#FF4000" }}
                    onMouseOver={(e) => { if (content && !generating) e.currentTarget.style.backgroundColor = "#e03800"; }}
                    onMouseOut={(e) => { if (content && !generating) e.currentTarget.style.backgroundColor = "#FF4000"; }}
                  >
                    {generating ? (
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
                        Gerar FAQs
                      </>
                    )}
                  </button>

                  {!content && (
                    <p className="text-xs" style={{ color: "#D97706" }}>
                      ⚠️ Extraia o conteúdo de uma URL no passo 1 primeiro.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              {activeStep > 1 ? (
                <button
                  onClick={() => goTo((activeStep - 1) as Step)}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition shadow-sm"
                  style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #C3BFB8", color: "#0D0D0D" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
              ) : <div />}
              {activeStep < 4 && (
                <button
                  onClick={() => goTo((activeStep + 1) as Step)}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white shadow transition"
                  style={{ backgroundColor: "#FF4000" }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e03800")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FF4000")}
                >
                  Próximo
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="rounded-xl bg-white p-5 shadow-sm sticky top-24" style={{ border: "1.5px solid #E5E2DC" }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#0D0D0D" }}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#FF4000" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                FAQs Geradas
              </h3>
              <FaqList faqs={faqs} onUpdate={setFaqs} />
            </div>
          </div>
        </div>

        {faqs.length > 0 && <ExportPanel faqs={faqs} />}
      </main>

      <footer className="mt-16 py-6 text-center text-sm font-medium" style={{ backgroundColor: "#0D0D0D", color: "#FFFFFF" }}>
        Hotmart. Aqui acontece.
      </footer>
    </div>
  );
}
