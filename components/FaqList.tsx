"use client";

import { useState } from "react";

export interface FAQ {
  question: string;
  answer: string;
}

interface FaqListProps {
  faqs: FAQ[];
  onUpdate: (faqs: FAQ[]) => void;
}

export default function FaqList({ faqs, onUpdate }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) {
    return (
      <div
        className="rounded-lg py-10 text-center"
        style={{
          border: "2px dashed #C3BFB8",
          color: "#C3BFB8",
        }}
      >
        <svg
          className="mx-auto mb-2 h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: "#C3BFB8" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm">Nenhuma FAQ gerada ainda</p>
      </div>
    );
  }

  function handleDelete(index: number) {
    const updated = faqs.filter((_, i) => i !== index);
    onUpdate(updated);
    if (openIndex === index) setOpenIndex(null);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium" style={{ color: "#C3BFB8" }}>
        {faqs.length} {faqs.length === 1 ? "pergunta" : "perguntas"} geradas
      </p>
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-lg bg-white overflow-hidden shadow-sm"
          style={{
            border: "1.5px solid #E5E2DC",
            borderLeft: "4px solid #FF4000",
          }}
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition"
            style={{ backgroundColor: "transparent" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#FAF9F7")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <span className="text-sm font-medium" style={{ color: "#0D0D0D" }}>
              {faq.question}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(i);
                }}
                className="rounded p-1 transition"
                style={{ color: "#C3BFB8" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "#DC2626";
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "#C3BFB8";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                title="Remover"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <svg
                className={`h-4 w-4 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: "#C3BFB8" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {openIndex === i && (
            <div
              className="border-t px-4 py-3"
              style={{ borderColor: "#E5E2DC", backgroundColor: "#FAF9F7" }}
            >
              <p
                className="text-sm leading-relaxed faq-answer"
                style={{ color: "#555" }}
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
