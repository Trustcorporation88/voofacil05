// lib/ignav.ts
// Provedor Ignav: precos de voo reais e links de compra para o voo exato.
// Documentacao: https://ignav.com/docs

import type { Flight, SearchParams, Itinerary } from "@/lib/types";

const IGNAV_BASE_URL = "https://ignav.com/api";
const MARKET = "BR"; // precos em BRL
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_RESULTS = 40;

interface IgnavPrice {
  amount: number;
  currency: string;
  status?: "verified" | "unverified";
}

interface IgnavSegment {
  marketing_carrier_code: string | null;
  flight_number: string | null;
  departure_airport: string;
  departure_time_local: string;
  arrival_airport: string;
  arrival_time_local: string;
  duration_minutes: number;
}

interface IgnavLeg {
  carrier?: string;
  duration_minutes?: number;
  segments: IgnavSegment[];
}

export interface IgnavItinerary {
  price: IgnavPrice;
  outbound: IgnavLeg;
  inbound?: IgnavLeg;
  ignav_id: string;
}

export interface IgnavBookingLink {
  provider_name: string;
  provider_type?: string;
  specificity?: "exact_flight" | "search_results";
  price?: IgnavPrice;
  url: string;
}

export interface IgnavBookingOption {
  legs?: string[];
  links: IgnavBookingLink[];
}

const cache = new Map<string, { at: number; flights: Flight[] }>();

export function ignavConfigured(): boolean {
  return Boolean(process.env.IGNAV_API_KEY);
}

export async function ignavPost<T>(
  path: string,
  body: unknown,
  timeoutMs = 20000,
): Promise<{ status: number; data: T | null }> {
  const res = await fetch(`${IGNAV_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "X-Api-Key": process.env.IGNAV_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as T | null;
  return { status: res.status, data };
}

const toItinerary = (leg: IgnavLeg): Itinerary => {
  const total =
    leg.duration_minutes ??
    leg.segments.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  return {
    duration: `PT${total}M`,
    segments: leg.segments.map((s) => ({
      // Horario local do aeroporto, sem fuso: e o que o passageiro ve no bilhete.
      departure: { iataCode: s.departure_airport, at: s.departure_time_local },
      arrival: { iataCode: s.arrival_airport, at: s.arrival_time_local },
      carrierCode: s.marketing_carrier_code || "UNKNOWN",
      number: s.flight_number || "",
      duration: `PT${s.duration_minutes}M`,
    })),
  };
};

/** Link interno que resolve o link de compra do voo exato so quando o usuario clica. */
export function buildBookingRedirect(ignavId: string, params: SearchParams): string {
  const q = new URLSearchParams({
    id: ignavId,
    o: params.origin,
    d: params.destination,
    dep: params.departureDate,
    pax: String(params.passengers || 1),
  });
  if (params.returnDate) q.set("ret", params.returnDate);
  return `/api/booking-link?${q.toString()}`;
}

export function mapIgnavItinerary(
  it: IgnavItinerary,
  params: SearchParams,
  idx: number,
): Flight | null {
  const amount = Number(it.price?.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (it.price.currency !== "BRL") return null;
  if (!it.outbound?.segments?.length) return null;

  const passengers = Math.max(1, params.passengers || 1);
  // A Ignav devolve o preco total do grupo; o site exibe o valor por pessoa.
  const perPerson = amount / passengers;
  const first = it.outbound.segments[0];
  const itineraries = [toItinerary(it.outbound)];
  if (it.inbound?.segments?.length) itineraries.push(toItinerary(it.inbound));

  return {
    id: `ignav-${idx}-${it.ignav_id}`,
    price: {
      total: perPerson.toFixed(2),
      currency: "BRL",
      grandTotal: amount.toFixed(2),
    },
    itineraries,
    oneWay: !it.inbound,
    airline: it.outbound.carrier || first.marketing_carrier_code || "UNKNOWN",
    airlineLogo: "",
    flightNumber: `${first.marketing_carrier_code || ""}${first.flight_number || ""}`,
    amenities: [],
    stops: it.outbound.segments.length - 1,
    purchaseUrl: buildBookingRedirect(it.ignav_id, params),
  };
}

export async function searchWithIgnav(params: SearchParams): Promise<Flight[]> {
  if (!ignavConfigured()) {
    console.log("[Ignav] No API key found");
    return [];
  }

  const passengers = Math.max(1, params.passengers || 1);
  const key = [params.origin, params.destination, params.departureDate, params.returnDate || "", passengers].join("|");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.flights;

  const body: Record<string, unknown> = {
    origin: params.origin.toUpperCase(),
    destination: params.destination.toUpperCase(),
    departure_date: params.departureDate,
    adults: passengers,
    market: MARKET,
  };
  if (params.returnDate) body.return_date = params.returnDate;

  // 424 e 503 sao falhas temporarias do lado da Ignav e nao sao cobradas:
  // no teste de 20 rotas, todas as que falharam responderam na tentativa seguinte.
  type SearchBody = { itineraries?: IgnavItinerary[]; error?: { code?: string } };
  const path = params.returnDate ? "/fares/round-trip" : "/fares/one-way";
  let { status, data } = await ignavPost<SearchBody>(path, body);
  for (let attempt = 0; attempt < 2 && (status === 424 || status === 503); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    ({ status, data } = await ignavPost<SearchBody>(path, body));
  }

  if (status !== 200 || !data) {
    console.log(`[Ignav] Search failed: ${status} ${data?.error?.code || ""}`);
    throw new Error(`Ignav ${status} ${data?.error?.code || ""}`.trim());
  }

  const flights = (data.itineraries || [])
    .map((it, idx) => mapIgnavItinerary(it, params, idx))
    .filter((f): f is Flight => f !== null)
    .sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total))
    .slice(0, MAX_RESULTS);

  console.log(`[Ignav] Found ${flights.length} flights`);
  if (cache.size > 200) cache.clear();
  cache.set(key, { at: Date.now(), flights });
  return flights;
}

/**
 * Escolhe um unico link que cobre a viagem inteira. Devolve null quando a
 * compra exige duas reservas separadas (ida e volta), caso em que um
 * redirecionamento unico deixaria o usuario com metade da viagem.
 */
export function pickBookingLink(options: IgnavBookingOption[] | undefined): IgnavBookingLink | null {
  if (!options || options.length !== 1) return null;
  const links = (options[0].links || []).filter((l) => typeof l.url === "string" && l.url.length > 0);
  if (links.length === 0) return null;

  const rank = (l: IgnavBookingLink) => {
    const exact = l.specificity === "exact_flight" ? 0 : 1;
    const price = Number.isFinite(l.price?.amount) && (l.price?.amount ?? 0) > 0 ? (l.price!.amount as number) : Number.MAX_SAFE_INTEGER;
    const airline = l.provider_type === "airline" ? 0 : 1;
    return [exact, price, airline];
  };

  return [...links].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    return ra[0] - rb[0] || ra[1] - rb[1] || ra[2] - rb[2];
  })[0];
}

/** Garante esquema http(s); a Ignav pode devolver a URL sem "https://". */
export function normalizeExternalUrl(raw: string): string | null {
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
