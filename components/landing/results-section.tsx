'use client';

import { PriceCurrencyNotice } from "@/components/price-currency-notice";
import { motion } from 'motion/react';
import {
  Plane,
  ExternalLink,
  Sparkles,
  Loader2,
  Bell,
  Heart,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Ban,
} from 'lucide-react';
import type { Flight, SearchParams, ProviderHealth } from '@/lib/types';
import { FlightDetailsModal } from '@/components/flight-details-modal';
import { FlexDates } from '@/components/flex-dates';
import { PriceCalendar } from '@/components/price-calendar';
import { AIRecommend } from '@/components/ai-recommend';

interface ResultsSectionProps {
  flights: Flight[];
  filteredFlights: Flight[];
  searchParams: SearchParams;
  providers?: Record<string, ProviderHealth>;
  warnings?: string[];
  loading: boolean;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  airlines: string[];
  selectedAirline: string | null;
  setSelectedAirline: (a: string | null) => void;
  showBaggage: boolean;
  setShowBaggage: (v: boolean) => void;
  selectedFlight: Flight | null;
  setSelectedFlight: (f: Flight | null) => void;
  showAI: boolean;
  setShowAI: (v: boolean) => void;
  onReSearch: (params: SearchParams) => Promise<void>;
  onFavorites: () => void;
  onCreateAlert: () => void;
}

export function LandingResultsSection({
  flights,
  filteredFlights,
  searchParams,
  providers,
  warnings,
  loading,
  activeFilter,
  setActiveFilter,
  airlines,
  selectedAirline,
  setSelectedAirline,
  showBaggage,
  setShowBaggage,
  selectedFlight,
  setSelectedFlight,
  showAI,
  setShowAI,
  onReSearch,
  onFavorites,
  onCreateAlert,
}: ResultsSectionProps) {
  if (loading) {
    return (
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-charcoal mx-auto mb-4" />
        <p className="text-brand-gray-600">Buscando as melhores ofertas para você…</p>
      </section>
    );
  }

  if (flights.length === 0) return null;

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return d;
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const lowestPrice = Math.min(...flights.map((f) => parseFloat(f.price.total) || Infinity));

  const providerLabels: Record<string, string> = {
    googleFlights: 'Google Flights',
    travelpayouts: 'Travelpayouts',
    airScraper: 'Air Scraper',
  };

  const providerStatusStyle = {
    ok: 'bg-green-50 text-green-800 border-green-200',
    empty: 'bg-brand-surface text-brand-gray-600 border-brand-gray-300',
    error: 'bg-red-50 text-red-700 border-red-200',
    disabled: 'bg-amber-50 text-amber-700 border-amber-200',
  } as const;

  const providerStatusIcon = {
    ok: <CheckCircle2 className="w-3 h-3" />,
    empty: <Clock3 className="w-3 h-3" />,
    error: <AlertTriangle className="w-3 h-3" />,
    disabled: <Ban className="w-3 h-3" />,
  } as const;

  return (
    <section id="results" className="py-16 px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <span className="text-[10px] font-bold text-brand-gray-600 uppercase tracking-[0.3em]">
              {searchParams.origin} → {searchParams.destination}
            </span>
            <div className="flex items-baseline gap-4 mt-2">
              <h2 className="text-3xl md:text-5xl font-bold text-brand-charcoal">
                {flights.length} voos encontrados
              </h2>
              <span className="text-brand-gray-500 text-sm">
                {formatDate(searchParams.departureDate)}
                {searchParams.returnDate && ` — ${formatDate(searchParams.returnDate)}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onFavorites}
              className="px-4 py-2.5 border border-brand-gray-300 text-brand-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:border-brand-charcoal hover:text-brand-charcoal transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4" /> Salvar
            </button>
            <button
              onClick={onCreateAlert}
              className="px-4 py-2.5 border border-brand-gray-300 text-brand-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:border-brand-charcoal hover:text-brand-charcoal transition-all flex items-center gap-2"
            >
              <Bell className="w-4 h-4" /> Alerta
            </button>
            <button
              onClick={() => setShowAI(true)}
              className="px-5 py-2.5 bg-brand-charcoal text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> IA Analisar
            </button>
          </div>
        </div>

        {/* Aviasales notice */}
        <p className="text-xs text-brand-gray-500 mb-4">
          ⓘ Temos parceria com <strong>AVIASALES</strong>. Preços já incluem taxa de embarque e
          impostos. Valor final no checkout via parceiro.
        </p>

        {/* Avisos técnicos só para admin/dev */}
        <div className="mb-4">
</div>

        <div className="mb-4">
          <PriceCurrencyNotice />
        </div>

        {process.env.NEXT_PUBLIC_PROVIDER_DEBUG === "true" && warnings && warnings.length > 0 && (
          <div className="mb-4 space-y-2">
{warnings.map((warning) => (
              <div
                key={warning}
                className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status dos provedores só para admin/dev */}
        {process.env.NEXT_PUBLIC_PROVIDER_DEBUG === "true" && providers && Object.keys(providers).length > 0 && (
          <div className="mb-4 rounded-xl border border-brand-gray-300/50 bg-white p-3">
            <p className="text-[10px] font-bold text-brand-gray-600 uppercase tracking-[0.2em] mb-2">
              Status dos provedores
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(providers).map(([key, info]) => (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${providerStatusStyle[info.status]}`}
                  title={info.message || ''}
                >
                  {providerStatusIcon[info.status]}
                  {providerLabels[key] || key}: {info.count}
                  {typeof info.responseMs === 'number' ? ` · ${info.responseMs}ms` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Baggage toggle */}
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={showBaggage}
                onChange={(e) => setShowBaggage(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-brand-gray-300 rounded-full peer-checked:bg-brand-charcoal transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow" />
            </div>
            <span className="text-xs text-brand-gray-600 font-medium">
              {showBaggage ? 'Com bagagem' : 'Sem bagagem'}
            </span>
          </label>
        </div>

        {/* Filters */}
        <div className="p-4 bg-white border border-brand-gray-300/50 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-brand-gray-600" />
            <h4 className="text-xs font-bold text-brand-gray-600 uppercase tracking-widest">
              Filtrar por
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: `Todos (${flights.length})` },
              { key: 'direct', label: `Diretos (${flights.filter((f) => (f.stops ?? 0) === 0).length})` },
              { key: '1-stop', label: `1 Parada (${flights.filter((f) => (f.stops ?? 0) === 1).length})` },
              { key: '2-stops', label: `2+ Paradas (${flights.filter((f) => (f.stops ?? 0) >= 2).length})` },
              { key: 'cheapest', label: '💰 Mais Barato' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${
                  activeFilter === key
                    ? 'bg-brand-charcoal text-white'
                    : 'border border-brand-gray-300 text-brand-gray-600 hover:border-brand-charcoal hover:text-brand-charcoal'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {airlines.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAirline(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  !selectedAirline
                    ? 'bg-brand-charcoal text-white'
                    : 'border border-brand-gray-300 text-brand-gray-600 hover:border-brand-charcoal'
                }`}
              >
                Todas
              </button>
              {airlines.map((airline) => (
                <button
                  key={airline}
                  onClick={() => setSelectedAirline(selectedAirline === airline ? null : airline)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedAirline === airline
                      ? 'bg-brand-charcoal text-white'
                      : 'border border-brand-gray-300 text-brand-gray-600 hover:border-brand-charcoal'
                  }`}
                >
                  {airline}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flex dates + price calendar */}
      <FlexDates
        origin={searchParams.origin}
        destination={searchParams.destination}
        departureDate={searchParams.departureDate}
        onSelectDate={(date) => onReSearch({ ...searchParams, departureDate: date })}
      />
      <PriceCalendar
        origin={searchParams.origin}
        destination={searchParams.destination}
        departureDate={searchParams.departureDate}
        onSelectDate={(date: string) => onReSearch({ ...searchParams, departureDate: date })}
      />

      {/* Flight cards */}
      <div className="space-y-3 mt-4">
{filteredFlights.map((flight, index) => {
          const price = parseFloat(flight.price.total) || 0;
          const displayPrice = showBaggage ? price + (flight.oneWay ? 100 : 200) : price;
          const isBest = price === lowestPrice;
          const seg0 = flight.itineraries?.[0]?.segments?.[0];
          const lastSeg0 = flight.itineraries?.[0]?.segments?.at(-1);
          const seg1 = flight.itineraries?.[1]?.segments?.[0];
          const hasReturn = !!seg1;

          return (
            <motion.div
              key={flight.id || index}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className={`border rounded-2xl p-5 md:p-6 transition-all hover:shadow-lg ${
                isBest
                  ? 'border-brand-charcoal bg-brand-surface shadow-md'
                  : 'border-brand-gray-300/50 bg-white'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Route + Airline */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {isBest && (
                      <span className="text-[10px] font-bold bg-brand-charcoal text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Melhor
                      </span>
                    )}
                    <span className="text-xs text-brand-gray-600 font-medium">
                      {flight.airline || 'Companhia Aérea'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        (flight.stops ?? 0) === 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {(flight.stops ?? 0) === 0
                        ? 'Direto'
                        : `${flight.stops} escala${(flight.stops ?? 0) > 1 ? 's' : ''}`}
                    </span>
                    {hasReturn && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-surface text-brand-charcoal font-medium">
                        Ida e Volta
                      </span>
                    )}
                    {showBaggage && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                        +bagagem
                      </span>
                    )}
                  </div>

                  {/* Times */}
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    {seg0 && (
                      <>
                        <div>
                          <span className="font-bold text-brand-charcoal">
                            {formatTime(seg0.departure.at)}
                          </span>
                          <span className="text-brand-gray-500 ml-1">
                            {seg0.departure.iataCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-brand-gray-400">
                          <div className="w-8 md:w-12 h-[1px] bg-brand-gray-300" />
                          {(flight.stops ?? 0) === 0 ? (
                            <Plane className="w-3 h-3" />
                          ) : (
                            <span className="text-[9px]">{flight.stops} escala</span>
                          )}
                          <div className="w-8 md:w-12 h-[1px] bg-brand-gray-300" />
                        </div>
                        <div>
                          <span className="font-bold text-brand-charcoal">
                            {formatTime(lastSeg0?.arrival.at || seg0.arrival.at)}
                          </span>
                          <span className="text-brand-gray-500 ml-1">
                            {lastSeg0?.arrival.iataCode || seg0.arrival.iataCode}
                          </span>
                        </div>
                      </>
                    )}
                    {hasReturn && seg1 && (
                      <>
                        <span className="text-brand-gray-300 mx-1">|</span>
                        <div>
                          <span className="font-bold text-brand-charcoal">
                            {formatTime(seg1.departure.at)}
                          </span>
                          <span className="text-brand-gray-500 ml-1">
                            {seg1.departure.iataCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-brand-gray-400">
                          <div className="w-8 h-[1px] bg-brand-gray-300" />
                          <Plane className="w-3 h-3 rotate-180" />
                          <div className="w-8 h-[1px] bg-brand-gray-300" />
                        </div>
                        <div>
                          <span className="font-bold text-brand-charcoal">
                            {formatTime(
                              flight.itineraries[1].segments.at(-1)?.arrival.at || seg1.arrival.at
                            )}
                          </span>
                          <span className="text-brand-gray-500 ml-1">
                            {flight.itineraries[1].segments.at(-1)?.arrival.iataCode ||
                              seg1.arrival.iataCode}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Price + Actions */}
                <div className="flex items-center gap-3 md:flex-col md:items-end flex-shrink-0">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-brand-charcoal">
                      R${Math.round(displayPrice)}
                    </span>
                    {hasReturn && (
                      <p className="text-[10px] text-brand-gray-500">ida e volta</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedFlight(flight)}
                      className="px-4 py-2.5 border border-brand-charcoal text-brand-charcoal text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-charcoal hover:text-white transition-all"
                    >
                      Detalhes
                    </button>
                    {flight.purchaseUrl && (
                      <a
                        href={flight.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-brand-charcoal text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary transition-all flex items-center gap-1.5"
                      >
                        Comprar <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredFlights.length === 0 && (
        <p className="text-center text-brand-gray-500 py-8">
          Nenhum voo encontrado com este filtro.
        </p>
      )}

      {/* Flight Details Modal */}
      {selectedFlight && (
        <FlightDetailsModal
          flight={selectedFlight}
          searchParams={searchParams}
          onClose={() => setSelectedFlight(null)}
        />
      )}

      {/* AI Recommend Modal */}
      {flights.length > 0 && (
        <AIRecommend
          isOpen={showAI}
          onClose={() => setShowAI(false)}
          flights={flights}
          searchParams={searchParams}
        />
      )}
    </section>
  );
}






