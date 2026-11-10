import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, CalendarDays, Plane, Search, ShieldCheck } from "lucide-react";
import { getRouteBySlug, POPULAR_ROUTES, getRouteSlug } from "@/lib/popular-routes";

interface Props {
  params: { rota: string };
}

const baseUrl = "https://www.voofacil.online";

export async function generateStaticParams() {
  return POPULAR_ROUTES.map((route) => ({
    rota: getRouteSlug(route),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = getRouteBySlug(params.rota);

  if (!route) {
    return {
      title: "Rota não encontrada | Voofacil",
      robots: { index: false, follow: false },
    };
  }

  const title = `Passagens de ${route.originCity} para ${route.destinationCity} | Voofacil`;
  const description = `Compare opções de voos de ${route.originCity} (${route.origin}) para ${route.destinationCity} (${route.destination}), acompanhe preços e encontre alternativas para sua próxima viagem.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/voos/${params.rota}`,
      siteName: "Voofacil",
      locale: "pt_BR",
      type: "website",
    },
    alternates: {
      canonical: `${baseUrl}/voos/${params.rota}`,
    },
  };
}

export default function RotaPage({ params }: Props) {
  const route = getRouteBySlug(params.rota);
  if (!route) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Passagens de ${route.originCity} para ${route.destinationCity}`,
    description: `Página de comparação de opções de voos de ${route.originCity} para ${route.destinationCity}.`,
    url: `${baseUrl}/voos/${params.rota}`,
    publisher: {
      "@type": "Organization",
      name: "Voofacil",
      url: baseUrl,
    },
    about: {
      "@type": "Trip",
      name: `${route.originCity} para ${route.destinationCity}`,
      departureAirport: {
        "@type": "Airport",
        iataCode: route.origin,
        name: route.originAirport,
      },
      arrivalAirport: {
        "@type": "Airport",
        iataCode: route.destination,
        name: route.destinationAirport,
      },
    },
  };

  const today = new Date().toISOString().split("T")[0];
  const searchUrl = `/?origem=${route.origin}&destino=${route.destination}&data=${today}#busca`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-brand-surface">
        <section className="bg-brand-charcoal text-white py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para busca
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 mb-5">
              <Plane className="w-4 h-4" />
              Rota popular
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Passagens de {route.originCity} para {route.destinationCity}
            </h1>

            <p className="text-white/75 text-base md:text-lg">
              {route.origin} ({route.originAirport}) → {route.destination} ({route.destinationAirport})
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-3xl shadow-md border border-brand-gray-300/50 p-6 md:p-8 mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-charcoal mb-3">
              Compare opções para esta rota
            </h2>
            <p className="text-brand-gray-600 mb-6 text-base md:text-lg">
              Busque voos de <strong>{route.originCity}</strong> para{" "}
              <strong>{route.destinationCity}</strong> e avalie preço, horários, conexões e condições disponíveis.
            </p>

            <Link
              href={searchUrl}
              className="inline-flex items-center justify-center gap-2 bg-brand-charcoal hover:bg-brand-primary text-white font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-widest transition"
            >
              <Search className="w-5 h-5" />
              Buscar passagens agora
            </Link>

            <p className="text-xs text-brand-gray-500 mt-4">
              Os preços e condições podem variar conforme disponibilidade e regras do fornecedor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-3xl border border-brand-gray-300/50 shadow-sm p-6">
              <h2 className="text-xl font-bold text-brand-charcoal mb-4">
                O que comparar nesta rota
              </h2>
              <ul className="space-y-3 text-brand-gray-600 text-sm">
                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Preço total e condições da tarifa</li>
                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Horário de saída e chegada</li>
                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Duração total da viagem</li>
                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Quantidade de conexões</li>
                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Informações disponíveis sobre bagagem</li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-brand-gray-300/50 shadow-sm p-6">
              <h2 className="text-xl font-bold text-brand-charcoal mb-4">
                Dicas para pesquisar melhor
              </h2>
              <ul className="space-y-3 text-brand-gray-600 text-sm">
                <li className="flex gap-2"><CalendarDays className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Teste datas próximas para encontrar variações de preço.</li>
                <li className="flex gap-2"><Bell className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Use alertas para acompanhar mudanças importantes.</li>
                <li className="flex gap-2"><Search className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Compare voos diretos e com conexão antes de decidir.</li>
                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-brand-charcoal" /> Confira as regras finais antes da compra.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-brand-gray-300/50 shadow-sm p-6">
            <h2 className="text-xl font-bold text-brand-charcoal mb-4">
              Outras rotas populares
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {POPULAR_ROUTES.filter(
                (r) => r.origin !== route.origin || r.destination !== route.destination
              )
                .slice(0, 9)
                .map((r) => (
                  <Link
                    key={getRouteSlug(r)}
                    href={`/voos/${getRouteSlug(r)}`}
                    className="text-brand-primary hover:text-brand-charcoal hover:bg-brand-surface p-3 rounded-xl text-sm transition"
                  >
                    {r.originCity} → {r.destinationCity}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


