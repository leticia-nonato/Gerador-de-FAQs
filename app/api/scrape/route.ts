import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
    }

    // Valida a URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "A URL deve usar HTTP ou HTTPS" },
        { status: 400 }
      );
    }

    const content = await scrapeUrl(url);

    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: "Não foi possível extrair conteúdo suficiente da página" },
        { status: 422 }
      );
    }

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao extrair conteúdo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
