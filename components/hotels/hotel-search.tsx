"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BedDouble, ExternalLink, MapPin, Search, Star } from "lucide-react";
import type { Hotel, HotelSearchResult } from "@/lib/hotels";
import { HOTEL_DESTINATIONS } from "@/lib/hotel-destinations";

interface HotelSearchProps {
  initialQuery?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
}

type SortType = "recomendados" | "preco" | "avaliacao";

interface ApiResponse extends HotelSearchResult {
  nights?: number;
  message?: string;
  error?: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const labelClass = "block text-[10px] font-bold text-brand-gray-600 uppercase tracking-widest mb-2";
const inputClass =
  "w-full px-4 py-3 bg-brand-surface border border-brand-gray-300 rounded-xl text-sm focus:outline-none focus:border-brand-charcoal transition-colors";
const chipClass = (on: boolean) =>
  `px-3.5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${
    on
      ? "bg-brand-charcoal text-white"
      : "border border-brand-gray-300 text-brand-gray-600 hover:border-brand-charcoal hover:text-brand-charcoal"
  }`;

function HotelCard({ hotel, nights }: { hotel: Hotel; nights: number }) {
  return (
    <article className="bg-white border border-brand-gray-300/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col sm:flex-row">
      <div className="sm:w-56 md:w-64 shrink-0 bg-brand-surface">
        {hotel.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.images[0]}
            alt={`Foto de ${hotel.name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-44 sm:h-full object-cover"
          />
        ) : (
          <div className="w-full h-44 sm:h-full flex items-center justify-center text-brand-gray-300">
            <BedDouble className="w-10 h-10" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 p-5 flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500">{hotel.type}</span>
            {hotel.stars && (
              <span className="text-[11px] text-amber-500" aria-label={`${hotel.stars} estrelas`}>
                {"★".repeat(Math.min(5, Math.round(hotel.stars)))}
              </span>
            )}
            {hotel.deal && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                {hotel.deal}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-brand-charcoal leading-snug">{hotel.name}</h3>

          {hotel.rating && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-brand-gray-600">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <strong className="text-brand-charcoal">{hotel.rating.toFixed(1).replace(".", ",")}</strong>
              {hotel.reviews && <span>({hotel.reviews.toLocaleString("pt-BR")} avaliações)</span>}
            </p>
          )}

          {hotel.nearby && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-brand-gray-500">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Perto de {hotel.nearby}</span>
            </p>
          )}

          {hotel.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {hotel.amenities.map((a) => (
                <span key={a} className="px-2 py-1 rounded-md bg-brand-surface text-[11px] text-brand-gray-600">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="md:w-44 shrink-0 flex md:flex-col items-end justify-between md:justify-start gap-3 md:text-right">
          <div>
            {hotel.pricePerNight ? (
              <>
                <p className="text-2xl font-bold text-brand-charcoal leading-none">{brl(hotel.pricePerNight)}</p>
                <p className="text-[11px] text-brand-gray-500 mt-1">por noite</p>
                {hotel.totalPrice && nights > 1 && (
                  <p className="text-xs text-brand-gray-600 mt-1">
                    {brl(hotel.totalPrice)} por {nights} noites
                  </p>
                )}
                {hotel.priceSource && (
                  <p className="text-[10px] text-brand-gray-500 mt-1">via {hotel.priceSource}</p>
                )}
              </>
            ) : (
              <p className="text-sm font-semibold text-brand-gray-600">Preço sob consulta</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-40 md:w-full">
            <a
              href={hotel.bookingUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="px-4 py-2.5 bg-brand-charcoal text-white text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary transition-all flex items-center justify-center gap-1.5"
            >
              Ver no Booking <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={hotel.website || hotel.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-brand-gray-300 text-brand-gray-600 text-[11px] font-bold uppercase tracking-wider rounded-xl hover:border-brand-charcoal hover:text-brand-charcoal transition-all flex items-center justify-center gap-1.5"
            >
              {hotel.website ? "Site do hotel" : "Ver no Google"} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export function HotelSearch({ initialQuery, initialCheckIn, initialCheckOut, initialAdults }: HotelSearchProps) {
  const [q, setQ] = useState(initialQuery || "");
  const [checkIn, setCheckIn] = useState(initialCheckIn && DATE.test(initialCheckIn) ? initialCheckIn : "");
  const [checkOut, setCheckOut] = useState(initialCheckOut && DATE.test(initialCheckOut) ? initialCheckOut : "");
  const [adults, setAdults] = useState(Math.min(Math.max(initialAdults || 2, 1), 8));
  const [children, setChildren] = useState(0);
  const [today, setToday] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searched, setSearched] = useState<{ q: string; nights: number } | null>(null);

  const [sort, setSort] = useState<SortType>("recomendados");
  const [minStars, setMinStars] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Datas padrao calculadas no navegador (evita diferenca entre servidor e cliente).
  useEffect(() => {
    const now = new Date();
    const t = addDays(now, 0);
    setToday(t);
    setCheckIn((v) => (v && v >= t ? v : addDays(now, 14)));
    setCheckOut((v) => (v && v > t ? v : addDays(now, 16)));
  }, []);

  const runSearch = async (pageToken?: string) => {
    const query = q.trim();
    if (query.length < 2 || !checkIn || !checkOut) {
      setError("Informe o destino e as datas de entrada e de saída.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("A saída precisa ser depois da entrada.");
      return;
    }

    setError("");
    if (pageToken) setLoadingMore(true);
    else {
      setLoading(true);
      setHotels([]);
      setResult(null);
    }

    try {
      const res = await fetch("/api/search-hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, checkIn, checkOut, adults, children, pageToken }),
      });
      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível concluir a busca. Tente novamente.");
        return;
      }

      setResult(data);
      setSearched({ q: query, nights: data.nights || 1 });
      setHotels((prev) => {
        if (!pageToken) return data.hotels || [];
        const ids = new Set(prev.map((h) => h.id));
        return [...prev, ...(data.hotels || []).filter((h) => !ids.has(h.id))];
      });

      if (!pageToken) {
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } catch {
      setError("Não foi possível concluir a busca agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const visible = useMemo(() => {
    let list = hotels.filter(
      (h) => (minStars ? (h.stars || 0) >= minStars : true) && (minRating ? (h.rating || 0) >= minRating : true),
    );
    if (sort === "preco") {
      list = [...list].sort((a, b) => (a.pricePerNight || Infinity) - (b.pricePerNight || Infinity));
    } else if (sort === "avaliacao") {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
    }
    return list;
  }, [hotels, sort, minStars, minRating]);

  const nights = searched?.nights || 1;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="bg-white border border-brand-gray-300/50 rounded-3xl p-5 md:p-8 shadow-xl"
      >
        <div className="mb-4">
          <label htmlFor="hotel-destino" className={labelClass}>
            Destino ou nome do hotel
          </label>
          <input
            id="hotel-destino"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex.: Rio de Janeiro, Gramado, Lisboa"
            list="hotel-destinos"
            maxLength={80}
            required
            autoComplete="off"
            className={inputClass}
          />
          <datalist id="hotel-destinos">
            {HOTEL_DESTINATIONS.map((d) => (
              <option key={d.slug} value={d.query} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="hotel-entrada" className={labelClass}>
              Entrada
            </label>
            <input
              id="hotel-entrada"
              type="date"
              value={checkIn}
              min={today || undefined}
              onChange={(e) => {
                const v = e.target.value;
                setCheckIn(v);
                if (v && checkOut && checkOut <= v) setCheckOut(addDays(new Date(`${v}T12:00:00`), 1));
              }}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="hotel-saida" className={labelClass}>
              Saída
            </label>
            <input
              id="hotel-saida"
              type="date"
              value={checkOut}
              min={checkIn || today || undefined}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="hotel-adultos" className={labelClass}>
              Adultos
            </label>
            <select
              id="hotel-adultos"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value, 10))}
              className={inputClass}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "adulto" : "adultos"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hotel-criancas" className={labelClass}>
              Crianças
            </label>
            <select
              id="hotel-criancas"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value, 10))}
              className={inputClass}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Nenhuma" : `${n} ${n === 1 ? "criança" : "crianças"}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-charcoal text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-primary transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {loading ? "Buscando hotéis..." : "Buscar hotéis"}
        </button>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        <div className="mt-6">
          <p className={labelClass}>Destinos populares</p>
          <div className="flex flex-wrap gap-2">
            {HOTEL_DESTINATIONS.slice(0, 14).map((d) => (
              <button key={d.slug} type="button" onClick={() => setQ(d.query)} className={chipClass(q === d.query)}>
                {d.city}
              </button>
            ))}
          </div>
        </div>
      </form>

      <div ref={resultsRef} id="resultados-hoteis" className="scroll-mt-24">
        {loading && (
          <div className="mt-10 space-y-4" aria-live="polite" aria-busy="true">
            <p className="text-sm text-brand-gray-600 text-center">Consultando preços de hospedagem...</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white border border-brand-gray-300/50 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && result && searched && (
          <div className="mt-10">
            {hotels.length > 0 ? (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl md:text-3xl font-bold text-brand-charcoal tracking-tight">
                    Hospedagens em {searched.q}
                  </h2>
                  <p className="text-sm text-brand-gray-600 mt-1">
                    {visible.length} de {hotels.length} opções, {nights} {nights === 1 ? "noite" : "noites"}, preços em
                    reais.
                  </p>
                </div>

                <div className="mb-6 flex flex-col gap-3 p-4 bg-white border border-brand-gray-300/50 rounded-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500 w-20">
                      Ordenar
                    </span>
                    {(
                      [
                        ["recomendados", "Recomendados"],
                        ["preco", "Menor preço"],
                        ["avaliacao", "Melhor avaliação"],
                      ] as [SortType, string][]
                    ).map(([id, label]) => (
                      <button key={id} type="button" onClick={() => setSort(id)} className={chipClass(sort === id)}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500 w-20">
                      Estrelas
                    </span>
                    {[0, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setMinStars(n)} className={chipClass(minStars === n)}>
                        {n === 0 ? "Todas" : n === 5 ? "5" : `${n}+`}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500 w-20">
                      Nota
                    </span>
                    {[0, 4, 4.5].map((n) => (
                      <button key={n} type="button" onClick={() => setMinRating(n)} className={chipClass(minRating === n)}>
                        {n === 0 ? "Todas" : `${String(n).replace(".", ",")}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {visible.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} nights={nights} />
                  ))}
                </div>

                {visible.length === 0 && (
                  <p className="text-center text-brand-gray-500 py-8">Nenhuma hospedagem com estes filtros.</p>
                )}

                {result.nextPageToken && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => runSearch(result.nextPageToken)}
                      disabled={loadingMore}
                      className="px-8 py-3 border border-brand-charcoal text-brand-charcoal text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-charcoal hover:text-white transition-all disabled:opacity-50"
                    >
                      {loadingMore ? "Carregando..." : "Ver mais hospedagens"}
                    </button>
                  </div>
                )}

                <p className="mt-6 text-[11px] text-brand-gray-500 text-center leading-relaxed">
                  Preços consultados no Google Hotels no momento da busca. O valor final, com impostos e taxas, é
                  confirmado no site do parceiro antes do pagamento. O Voofacil não vende hospedagem.
                </p>
              </>
            ) : (
              <div className="p-6 md:p-8 bg-white border border-brand-gray-300/50 rounded-2xl text-center">
                <h2 className="text-xl font-bold text-brand-charcoal">
                  {result.unavailable ? "Preços indisponíveis no momento" : "Nenhuma hospedagem encontrada"}
                </h2>
                <p className="text-sm text-brand-gray-600 mt-2 max-w-xl mx-auto">{result.message}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <a
                    href={result.fallbackLinks.booking}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="px-5 py-3 bg-brand-charcoal text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary transition-all flex items-center gap-1.5"
                  >
                    Buscar no Booking <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={result.fallbackLinks.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 border border-brand-charcoal text-brand-charcoal text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-charcoal hover:text-white transition-all flex items-center gap-1.5"
                  >
                    Buscar no Google Hotels <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
