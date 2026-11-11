import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelsPage } from "@/components/hotels/hotels-page";
import { HOTEL_DESTINATIONS, getHotelDestination } from "@/lib/hotel-destinations";

const baseUrl = "https://www.voofacil.online";

interface Props {
  params: { cidade: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return HOTEL_DESTINATIONS.map((d) => ({ cidade: d.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const destination = getHotelDestination(params.cidade);
  if (!destination) return { title: "Destino não encontrado", robots: { index: false, follow: false } };

  const title = `Hotéis em ${destination.city}: compare preços`;
  const description = `Compare preços de hotéis e pousadas em ${destination.city}, ${destination.country}. Veja o valor por noite em reais, avaliações e comodidades.`;
  const url = `${baseUrl}/hoteis/${destination.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | Voofacil`, description, url, siteName: "Voofacil", locale: "pt_BR", type: "website" },
  };
}

export default function HoteisCidadePage({ params }: Props) {
  const destination = getHotelDestination(params.cidade);
  if (!destination) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Hotéis em ${destination.city}`,
    description: `Comparação de preços de hospedagem em ${destination.city}, ${destination.country}.`,
    url: `${baseUrl}/hoteis/${destination.slug}`,
    publisher: { "@type": "Organization", name: "Voofacil", url: baseUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HotelsPage destination={destination} />
    </>
  );
}
