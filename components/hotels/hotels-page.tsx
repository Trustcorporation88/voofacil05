import Link from "next/link";
import { BedDouble, CalendarDays, Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LandingFooter } from "@/components/landing/footer";
import { HotelSearch } from "@/components/hotels/hotel-search";
import { HOTEL_DESTINATIONS, type HotelDestination } from "@/lib/hotel-destinations";

interface HotelsPageProps {
  destination?: HotelDestination;
  initialQuery?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
}

export function HotelsPage({ destination, initialQuery, initialCheckIn, initialCheckOut, initialAdults }: HotelsPageProps) {
  const others = HOTEL_DESTINATIONS.filter((d) => d.slug !== destination?.slug);

  return (
    <div className="min-h-screen bg-brand-surface selection:bg-brand-charcoal selection:text-white">
      <SiteHeader active="/hoteis" />

      <main>
        <section className="bg-brand-charcoal text-white px-4 sm:px-6 pt-12 pb-28 md:pt-16 md:pb-32">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 mb-5">
              <BedDouble className="w-4 h-4" />
              Hotéis no Brasil e no mundo
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              {destination ? `Hotéis em ${destination.city}` : "Compare preços de hotéis"}
            </h1>
            <p className="mt-4 text-white/75 text-sm md:text-lg max-w-2xl mx-auto">
              {destination
                ? `Veja hospedagens em ${destination.city}, ${destination.country}, com preço por noite em reais, avaliações e comodidades.`
                : "Busque hospedagem em qualquer cidade, veja o preço por noite em reais e siga para o site do parceiro para reservar."}
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 md:-mt-24 pb-16">
          <HotelSearch
            initialQuery={initialQuery ?? destination?.query}
            initialCheckIn={initialCheckIn}
            initialCheckOut={initialCheckOut}
            initialAdults={initialAdults}
          />

          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {[
              {
                icon: Search,
                title: "Preços em reais",
                text: "O preço por noite e o total da estadia aparecem em reais, com a fonte de cada oferta.",
              },
              {
                icon: CalendarDays,
                title: "Datas flexíveis",
                text: "Troque as datas e busque de novo para comparar. Dias de semana costumam sair mais baratos.",
              },
              {
                icon: ShieldCheck,
                title: "Reserva no parceiro",
                text: "O Voofacil não vende hospedagem. Você confere as regras e paga direto no site do parceiro.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl border border-brand-gray-300/50 p-6">
                <Icon className="w-5 h-5 text-brand-charcoal mb-3" />
                <h2 className="text-base font-bold text-brand-charcoal mb-1.5">{title}</h2>
                <p className="text-sm text-brand-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-brand-gray-300/50 shadow-sm p-6 mt-8">
            <h2 className="text-xl font-bold text-brand-charcoal mb-4">Hotéis nos destinos mais buscados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              {others.map((d) => (
                <Link
                  key={d.slug}
                  href={`/hoteis/${d.slug}`}
                  className="text-brand-primary hover:text-brand-charcoal hover:bg-brand-surface p-3 rounded-xl text-sm transition"
                >
                  Hotéis em {d.city}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-brand-gray-600">
            Ainda não comprou a passagem?{" "}
            <Link href="/#busca" className="font-bold text-brand-charcoal underline underline-offset-4">
              Compare voos no Voofacil
            </Link>
          </p>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
