import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
import { generateText } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { content, questions, keywords } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Perguntas são obrigatórias" },
        { status: 400 }
      );
    }

    const questionsText = questions
      .map((q: string, i: number) => `${i + 1}. ${q}`)
      .join("\n");

    const keywordsInstruction = keywords && keywords.length > 0
      ? `\nPALAVRAS-CHAVE OBRIGATÓRIAS: ${keywords.join(", ")}
REGRA IMPORTANTE: Cada uma dessas palavras-chave deve aparecer pelo menos 1 vez no conjunto completo das respostas. Distribua-as naturalmente, sem forçar.\n`
      : "";

    const prompt = `Você é um especialista em atendimento ao cliente e SEO. Responda perguntas baseando-se exclusivamente no conteúdo fornecido, em português do Brasil. Retorne APENAS um JSON válido, sem texto adicional.
${keywordsInstruction}
REGRA OBRIGATÓRIA: O número máximo de respostas geradas é 10. Se houver mais de 10 perguntas, responda apenas as 10 primeiras.

Com base no conteúdo abaixo, responda as seguintes perguntas em português do Brasil. As respostas devem ser claras, completas e baseadas exclusivamente no conteúdo fornecido. Se não houver informação suficiente para responder, diga isso de forma educada.

CONTEÚDO:
${content}

PERGUNTAS:
${questionsText}

Retorne APENAS um array JSON válido no formato:
[
  {
    "question": "Pergunta exatamente como foi fornecida",
    "answer": "Resposta baseada no conteúdo."
  }
]`;

    const rawText = (await generateText(prompt)).trim();

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }

    const faqs = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(faqs)) {
      throw new Error("Resposta não é um array");
    }

    return NextResponse.json({ faqs });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao responder perguntas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
