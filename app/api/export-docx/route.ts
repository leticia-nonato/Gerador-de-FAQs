import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";

interface FAQ {
  question: string;
  answer: string;
}

// Remove HTML tags from answer
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export async function POST(request: NextRequest) {
  try {
    const { faqs, title } = await request.json();

    if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
      return NextResponse.json({ error: "FAQs são obrigatórias" }, { status: 400 });
    }

    const docTitle = title || "FAQs Geradas";

    const children: Paragraph[] = [];

    // Título principal
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: docTitle,
            bold: true,
            color: "FF4000",
            size: 40,
            font: "Arial",
          }),
        ],
        spacing: { after: 400 },
      })
    );

    // Linha separadora
    children.push(
      new Paragraph({
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "FF4000", space: 1 },
        },
        spacing: { after: 400 },
        children: [],
      })
    );

    // FAQs
    faqs.forEach((faq: FAQ, index: number) => {
      // Pergunta
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${faq.question}`,
              bold: true,
              color: "0D0D0D",
              size: 26,
              font: "Arial",
            }),
          ],
          shading: { type: ShadingType.CLEAR, fill: "FFF3EF" },
          spacing: { before: 300, after: 120 },
        })
      );

      // Resposta
      const answerText = stripHtml(faq.answer);
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: answerText,
              size: 22,
              font: "Arial",
              color: "333333",
            }),
          ],
          indent: { left: 360 },
          spacing: { after: 300 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: "FF4000", space: 8 },
          },
        })
      );
    });

    // Rodapé
    children.push(
      new Paragraph({
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "FF4000", space: 1 },
        },
        spacing: { before: 600 },
        children: [],
      })
    );
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Hotmart. Aqui acontece.",
            bold: true,
            color: "FF4000",
            size: 20,
            font: "Arial",
          }),
        ],
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="faqs-hotmart.docx"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao gerar DOCX";
    console.error("Erro export-docx:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
