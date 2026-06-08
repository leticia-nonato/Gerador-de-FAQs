import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FAQ Generator | Hotmart",
  description:
    "Gere FAQs profissionais para qualquer site usando inteligência artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "'DM Sans', sans-serif" }}>{children}</body>
    </html>
  );
}
