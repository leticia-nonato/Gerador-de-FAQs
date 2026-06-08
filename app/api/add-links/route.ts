import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

interface FAQ {
  question: string;
  answer: string;
}

interface InternalLink {
  url: string;
  label: string;
}

export async function POST(request: NextRequest) {
  try {
    const { faqs, internalLinks } = await request.json();

    if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
      return NextResponse.json(
        { error: "FAQs são obrigatórias" },
        { status: 400 }
      );
    }

    if (
      !internalLinks ||
      !Array.isArray(internalLinks) ||
      internalLinks.length === 0
    ) {
      return NextResponse.json(
        { error: "Links internos são obrigatórios" },
        { status: 400 }
      );
    }

    const faqsText = faqs
      .map(
        (f: FAQ, i: number) =>
          `FAQ ${i + 1}:\nPergunta: ${f.question}\nResposta: ${f.answer}`
      )
      .join("\n\n");

    const linksText = internalLinks
      .map((l: InternalLink) => `- Rótulo: "${l.label}" | URL: ${l.url}`)
      .join("\n");

    const prompt = `Você é um especialista em SEO e linkagem interna. Sua tarefa é inserir TODOS os links internos fornecidos nas respostas das FAQs. Retorne APENAS um JSON válido, sem texto adicional.

REGRA OBRIGATÓRIA: Cada link da lista DEVE aparecer pelo menos 1 vez no conjunto total das respostas. Distribua os links entre as diferentes FAQs de forma natural.

LINKS INTERNOS (TODOS devem ser inseridos):
${linksText}

INSTRUÇÕES:
1. Insira cada link pelo menos 1 vez no conjunto total das respostas
2. Use a tag HTML: <a href="URL">texto âncora</a>
3. O texto âncora deve ser o rótulo do link ou uma variação natural dele
4. Distribua os links entre as FAQs de forma que fique natural
5. Não adicione atributos extras nas tags <a>
6. Mantenha o texto da resposta fluido e coeso

FAQS:
${faqsText}

Retorne APENAS um array JSON válido com TODAS as FAQs no formato:
[
  {
    "question": "Pergunta exatamente como está",
    "answer": "Resposta com <a href=\\"URL\\">texto âncora</a> inserido."
  }
]`;

    const rawText = (await generateText(prompt)).trim();

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }

    const updatedFaqs = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(updatedFaqs)) {
      throw new Error("Resposta não é um array");
    }

    return NextResponse.json({ faqs: updatedFaqs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao inserir links";
    const details = error instanceof Error ? error.stack : String(error);
    console.error("=== ERRO add-links ===\n", message, "\n", details);
    const fs = require('fs');
    fs.writeFileSync('C:/Users/leticia.nonato_hotma/OneDrive/faq-generator/error-links.log',
      `${new Date().toISOString()}\nMensagem: ${message}\nDetalhes: ${details}\n`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
