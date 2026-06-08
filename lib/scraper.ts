import * as cheerio from "cheerio";

export async function scrapeUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FAQGenerator/1.0; +https://faq-generator.app)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Falha ao acessar a URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove elementos desnecessários
  $(
    "nav, footer, header, script, style, noscript, iframe, aside, .menu, .navbar, .sidebar, .advertisement, .ads, .cookie-banner, .popup"
  ).remove();

  // Extrai o texto limpo
  const bodyText = $("body").text();

  // Limpa espaços extras e linhas em branco
  const cleanText = bodyText
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Limita a 8000 caracteres
  return cleanText.slice(0, 8000);
}
