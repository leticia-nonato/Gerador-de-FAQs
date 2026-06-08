import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
import { generateText } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { content, keywords } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      );
    }

    const keywordsInstruction = keywords && keywords.length > 0
      ? `\n\nPALAVRAS-CHAVE OBRIGATÓRIAS: ${keywords.join(", ")}
REGRA IMPORTANTE: Cada uma dessas palavras-chave deve aparecer pelo menos 1 vez no conjunto completo das respostas geradas. Distribua-as naturalmente nas respostas, sem forçar.\n`
      : "";

    const prompt = `Você é um especialista em SEO e UX. Analise o conteúdo fornecido e gere FAQs relevantes em português. Retorne APENAS um JSON válido, sem texto adicional, no formato: [{"question": "...", "answer": "..."}]

Analise o seguinte conteúdo e gere entre 5 e 10 perguntas frequentes (FAQs) relevantes com suas respectivas respostas em português do Brasil. As perguntas devem ser naturais, como um usuário real faria. As respostas devem ser claras, completas e baseadas exclusivamente no conteúdo fornecido.

REGRA OBRIGATÓRIA: O número máximo de FAQs geradas é 10. Nunca gere mais de 10 perguntas.
${keywordsInstruction}
CONTEÚDO:
${content}

Retorne APENAS um array JSON válido no formato:
[
  {
    "question": "Pergunta aqui?",
    "answer": "Resposta aqui."
  }
]`;

    const rawText = (await generateText(prompt)).trim();

    // Remove markdown code blocks if present
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Resposta bruta:", rawText);
      throw new Error("Formato de resposta inválido");
    }

    const faqs = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(faqs)) {
      throw new Error("Resposta não é um array");
    }

    return NextResponse.json({ faqs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    const details = error instanceof Error ? error.stack : String(error);
    console.error("=== ERRO generate-faqs ===");
    console.error("Mensagem:", message);
    console.error("Detalhes:", details);
    console.error("=========================");
    // Salva erro em arquivo para debug
    const fs = require('fs');
    fs.writeFileSync('C:/Users/leticia.nonato_hotma/OneDrive/faq-generator/error.log', `${new Date().toISOString()}\nMensagem: ${message}\nDetalhes: ${details}\n`);
    return NextResponse.json({ error: message, details }, { status: 500 });
  }
}
