import type { Metadata } from "next";
import { HotelsPage } from "@/components/hotels/hotels-page";

const baseUrl = "https://www.voofacil.online";

export const metadata: Metadata = {
  title: "Hotéis no Brasil e no mundo: compare preços",
  description:
    "Compare preços de hotéis e pousadas no Brasil e no mundo. Veja o valor por noite em reais, avaliações e comodidades, e reserve no site do parceiro.",
  alternates: { canonical: `${baseUrl}/hoteis` },
  openGraph: {
    title: "Hotéis no Brasil e no mundo | Voofacil",
    description: "Compare preços de hospedagem em reais e reserve no site do parceiro.",
    url: `${baseUrl}/hoteis`,
    siteName: "Voofacil",
    locale: "pt_BR",
    type: "website",
  },
};

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function HoteisPage({ searchParams }: Props) {
  const adults = parseInt(first(searchParams.adultos) || "", 10);

  return (
    <HotelsPage
      initialQuery={first(searchParams.q)?.slice(0, 80)}
      initialCheckIn={first(searchParams.entrada)}
      initialCheckOut={first(searchParams.saida)}
      initialAdults={Number.isFinite(adults) ? adults : undefined}
    />
  );
}
