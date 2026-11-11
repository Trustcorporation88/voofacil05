// lib/hotels.ts
// Busca de hoteis no Brasil e no mundo via Google Hotels (SerpApi).
// Uma busca gasta 1 credito da SerpApi; por isso ha cache em memoria e os
// filtros e a ordenacao sao feitos no navegador, sem nova chamada.

export interface HotelSearchParams {
  q: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children?: number;
  pageToken?: string;
}

export interface Hotel {
  id: string;
  name: string;
  type: string;
  description?: string;
  stars?: number;
  rating?: number;
  reviews?: number;
  pricePerNight?: number;
  totalPrice?: number;
  priceSource?: string;
  images: string[];
  amenities: string[];
  nearby?: string;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  bookingUrl: string;
  googleUrl: string;
  deal?: string;
}

export interface HotelSearchResult {
  hotels: Hotel[];
  nextPageToken?: string;
  // true quando nao foi possivel consultar precos (sem chave, cota ou erro).
  unavailable?: boolean;
  fallbackLinks: { booking: string; google: string };
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX = 200;
const cache = new Map<string, { at: number; data: HotelSearchResult }>();

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round((b - a) / 86400000);
}

// Modelo opcional de link de afiliado, ex.:
// https://cXX.travelpayouts.com/click?shmarker=716705.hoteis&promo_id=NNNN&source_type=customlink&type=click&custom_url={url}
// Sem a variavel HOTEL_AFFILIATE_TEMPLATE, o link vai direto ao parceiro.
function withAffiliate(url: string): string {
  const template = process.env.HOTEL_AFFILIATE_TEMPLATE;
  if (!template || !template.includes("{url}")) return url;
  return template.replace("{url}", encodeURIComponent(url));
}

export function buildBookingSearchUrl(
  query: string,
  p: Pick<HotelSearchParams, "checkIn" | "checkOut" | "adults" | "children">,
): string {
  const qs = new URLSearchParams({
    ss: query,
    checkin: p.checkIn,
    checkout: p.checkOut,
    group_adults: String(p.adults),
    group_children: String(p.children || 0),
    no_rooms: "1",
    selected_currency: "BRL",
    lang: "pt-br",
  });
  return withAffiliate(`https://www.booking.com/searchresults.pt-br.html?${qs.toString()}`);
}

export function buildGoogleHotelsUrl(query: string): string {
  const qs = new URLSearchParams({ q: query, hl: "pt-BR", gl: "br", curr: "BRL" });
  return `https://www.google.com/travel/search?${qs.toString()}`;
}

// O Google devolve as comodidades em ingles mesmo com hl=pt-br.
const AMENITIES_PT: Record<string, string> = {
  "breakfast": "Café da manhã",
  "free breakfast": "Café da manhã grátis",
  "breakfast ($)": "Café da manhã (pago)",
  "wi-fi": "Wi-Fi",
  "free wi-fi": "Wi-Fi grátis",
  "wi-fi ($)": "Wi-Fi (pago)",
  "parking": "Estacionamento",
  "free parking": "Estacionamento grátis",
  "parking ($)": "Estacionamento (pago)",
  "pool": "Piscina",
  "pools": "Piscinas",
  "outdoor pool": "Piscina externa",
  "indoor pool": "Piscina coberta",
  "hot tub": "Hidromassagem",
  "air conditioning": "Ar-condicionado",
  "fitness center": "Academia",
  "fitness centre": "Academia",
  "spa": "Spa",
  "bar": "Bar",
  "restaurant": "Restaurante",
  "room service": "Serviço de quarto",
  "kitchen": "Cozinha",
  "kitchen in some rooms": "Cozinha em alguns quartos",
  "airport shuttle": "Traslado do aeroporto",
  "full-service laundry": "Lavanderia",
  "laundry service": "Lavanderia",
  "accessible": "Acessível",
  "business center": "Centro de negócios",
  "business centre": "Centro de negócios",
  "child-friendly": "Bom para crianças",
  "kid-friendly": "Bom para crianças",
  "pet-friendly": "Aceita animais",
  "beach access": "Acesso à praia",
  "smoke-free property": "Proibido fumar",
  "golf": "Golfe",
  "ev charger": "Carregador de carro elétrico",
  "crib": "Berço",
  "washer": "Máquina de lavar",
  "dryer": "Secadora",
  "balcony": "Varanda",
  "cable tv": "TV a cabo",
  "smart tv": "Smart TV",
  "heating": "Aquecimento",
  "elevator": "Elevador",
  "fireplace": "Lareira",
  "microwave": "Micro-ondas",
  "oven stove": "Fogão",
  "ironing board": "Tábua de passar",
  "outdoor grill": "Churrasqueira",
  "patio": "Pátio",
  "all-inclusive available": "All inclusive disponível",
};

const amenityPt = (a: string): string => AMENITIES_PT[a.trim().toLowerCase()] || a;

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined;

const httpsUrl = (v: unknown): string | undefined =>
  typeof v === "string" && /^https:\/\//i.test(v) ? v : undefined;

function mapProperty(raw: any, p: HotelSearchParams, index: number): Hotel | null {
  const name = typeof raw?.name === "string" ? raw.name.trim() : "";
  if (!name) return null;

  const nights = Math.max(1, nightsBetween(p.checkIn, p.checkOut));
  const perNight =
    num(raw.rate_per_night?.extracted_lowest) ?? num(raw.rate_per_night?.extracted_before_taxes_fees);
  const total =
    num(raw.total_rate?.extracted_lowest) ??
    num(raw.total_rate?.extracted_before_taxes_fees) ??
    (perNight ? perNight * nights : undefined);

  const images = (Array.isArray(raw.images) ? raw.images : [])
    .map((img: any) => httpsUrl(img?.thumbnail) || httpsUrl(img?.original_image))
    .filter(Boolean)
    .slice(0, 4) as string[];

  const nearbyPlace = Array.isArray(raw.nearby_places) ? raw.nearby_places[0] : undefined;
  const nearby = nearbyPlace?.name
    ? `${nearbyPlace.name}${nearbyPlace.transportations?.[0]?.duration ? `, ${nearbyPlace.transportations[0].duration}` : ""}`
    : undefined;

  // O nome do hotel junto com o destino buscado deixa a busca no parceiro mais precisa.
  const partnerQuery = `${name}, ${p.q}`.slice(0, 180);

  return {
    id: typeof raw.property_token === "string" ? raw.property_token : `h-${index}-${name}`,
    name,
    type: raw.type === "vacation rental" ? "Casa de temporada" : "Hotel",
    description: typeof raw.description === "string" ? raw.description.slice(0, 220) : undefined,
    stars: num(raw.extracted_hotel_class),
    rating: num(raw.overall_rating),
    reviews: num(raw.reviews),
    pricePerNight: perNight ?? (total ? total / nights : undefined),
    totalPrice: total,
    priceSource: typeof raw.prices?.[0]?.source === "string" ? raw.prices[0].source : undefined,
    images,
    amenities: (Array.isArray(raw.amenities) ? raw.amenities : [])
      .filter((a: unknown) => typeof a === "string")
      .slice(0, 6)
      .map(amenityPt),
    nearby,
    checkInTime: typeof raw.check_in_time === "string" ? raw.check_in_time : undefined,
    checkOutTime: typeof raw.check_out_time === "string" ? raw.check_out_time : undefined,
    latitude: typeof raw.gps_coordinates?.latitude === "number" ? raw.gps_coordinates.latitude : undefined,
    longitude: typeof raw.gps_coordinates?.longitude === "number" ? raw.gps_coordinates.longitude : undefined,
    website: httpsUrl(raw.link),
    bookingUrl: buildBookingSearchUrl(partnerQuery, p),
    googleUrl: buildGoogleHotelsUrl(partnerQuery),
    deal: typeof raw.deal === "string" ? raw.deal : undefined,
  };
}

export function mapHotelsResponse(data: any, p: HotelSearchParams): Hotel[] {
  // Quando o texto buscado e o nome exato de um hotel, o Google devolve os
  // dados desse hotel na raiz da resposta, sem a lista "properties".
  const list: any[] = Array.isArray(data?.properties)
    ? data.properties
    : data?.name && (data?.rate_per_night || data?.property_token)
      ? [data]
      : [];

  const seen = new Set<string>();
  const hotels: Hotel[] = [];
  list.forEach((raw, i) => {
    const hotel = mapProperty(raw, p, i);
    if (!hotel || seen.has(hotel.id)) return;
    seen.add(hotel.id);
    hotels.push(hotel);
  });
  return hotels;
}

export async function searchHotels(p: HotelSearchParams): Promise<HotelSearchResult> {
  const fallbackLinks = {
    booking: buildBookingSearchUrl(p.q, p),
    google: buildGoogleHotelsUrl(`hotéis em ${p.q}`),
  };

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.log("[Hotels] SERPAPI_KEY ausente");
    return { hotels: [], unavailable: true, fallbackLinks };
  }

  const cacheKey = [p.q.toLowerCase(), p.checkIn, p.checkOut, p.adults, p.children || 0, p.pageToken || ""].join("|");
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_hotels");
  url.searchParams.set("q", p.q);
  url.searchParams.set("check_in_date", p.checkIn);
  url.searchParams.set("check_out_date", p.checkOut);
  url.searchParams.set("adults", String(p.adults));
  if (p.children) {
    url.searchParams.set("children", String(p.children));
    // O Google exige a idade de cada crianca; usamos 8 anos como padrao.
    url.searchParams.set("children_ages", Array(p.children).fill(8).join(","));
  }
  url.searchParams.set("currency", "BRL");
  url.searchParams.set("gl", "br");
  url.searchParams.set("hl", "pt-br");
  if (p.pageToken) url.searchParams.set("next_page_token", p.pageToken);
  url.searchParams.set("api_key", apiKey);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(20000), cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.error) {
      const reason = String(data?.error || `HTTP ${res.status}`);
      console.log(`[Hotels] SerpApi sem resultado: ${reason}`);
      // "nenhum resultado" e uma resposta valida; o resto e indisponibilidade.
      const noResults = /hasn't returned any results|no results/i.test(reason);
      return { hotels: [], unavailable: !noResults, fallbackLinks };
    }

    const result: HotelSearchResult = {
      hotels: mapHotelsResponse(data, p),
      nextPageToken:
        typeof data.serpapi_pagination?.next_page_token === "string"
          ? data.serpapi_pagination.next_page_token
          : undefined,
      fallbackLinks,
    };

    if (cache.size >= CACHE_MAX) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    cache.set(cacheKey, { at: Date.now(), data: result });
    return result;
  } catch (error) {
    console.error("[Hotels] Erro na busca:", String(error));
    return { hotels: [], unavailable: true, fallbackLinks };
  }
}
