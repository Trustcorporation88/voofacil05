import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { PwaBootstrap } from "@/components/pwa-bootstrap";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = "https://www.vooscortex.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Voos Cortex | Compare Passagens Aéreas em Segundos",
    template: "%s | Voos Cortex",
  },
  description:
    "Compare passagens aéreas, acompanhe alertas de preço e encontre opções de voos nacionais e internacionais com mais rapidez e clareza.",
  manifest: "/manifest.webmanifest",
  applicationName: "Voos Cortex",
  keywords: [
    "passagem aérea",
    "passagens aéreas baratas",
    "voos baratos",
    "comparar voos",
    "alerta de preço",
    "Voos Cortex",
    "voos nacionais",
    "voos internacionais",
  ],
  authors: [{ name: "Voos Cortex" }],
  creator: "Voos Cortex",
  publisher: "Voos Cortex",
  openGraph: {
    title: "Voos Cortex | Compare Passagens Aéreas em Segundos",
    description:
      "Busque, compare e acompanhe preços de passagens aéreas com uma experiência simples e otimizada para celular.",
    url: siteUrl,
    siteName: "Voos Cortex",
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
    icon: "/favicon.svg",
    apple: "/icons/icon-192.png",
  },
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
        <Script
          src="https://www.travelpayouts.com/weedle/widget.js?marker=716705"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}


