import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { PwaBootstrap } from "@/components/pwa-bootstrap";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = "https://www.voofacil.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Voofacil | Compare Passagens Aéreas em Segundos",
    template: "%s | Voofacil",
  },
  description:
    "Compare passagens aéreas e hotéis, acompanhe alertas de preço e encontre opções de voos nacionais e internacionais com mais rapidez e clareza.",
  manifest: "/manifest.webmanifest",
  applicationName: "Voofacil",
  keywords: [
    "passagem aérea",
    "passagens aéreas baratas",
    "voos baratos",
    "comparar voos",
    "alerta de preço",
    "Voofacil",
    "voos nacionais",
    "voos internacionais",
    "hotéis",
    "comparar hotéis",
    "passagens com milhas",
  ],
  authors: [{ name: "Voofacil" }],
  creator: "Voofacil",
  publisher: "Voofacil",
  openGraph: {
    title: "Voofacil | Compare Passagens Aéreas em Segundos",
    description:
      "Busque, compare e acompanhe preços de passagens aéreas com uma experiência simples e otimizada para celular.",
    url: siteUrl,
    siteName: "Voofacil",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
    ],
    apple: "/apple-icon.png",
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Voofacil",
      url: siteUrl,
      logo: `${siteUrl}/logo-voofacil.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Voofacil",
      url: siteUrl,
      inLanguage: "pt-BR",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <PwaBootstrap />
        <SessionProvider>{children}</SessionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </body>
    </html>
  );
}


