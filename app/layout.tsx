import type { Metadata } from "next";
import "./globals.css";
import "timepicker-ui/main.css";
import { LanguageProvider } from "@/components/language";
export const metadata: Metadata = {
  title: {
    default: "Somos Cardoso · Nossa família, reunida",
    template: "%s · Somos Cardoso",
  },
  description:
    "Mais perto, onde quer que estejamos. O espaço da nossa família para compartilhar momentos e organizar o amigo secreto.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
