// lib/travelpayouts.ts
"use server";

const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || "716705";
const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN;

// Programa de voos conectado na conta Travelpayouts: Kiwi.com (promo_id 3791).
// Formato oficial do link de afiliado:
// https://support.travelpayouts.com/hc/en-us/articles/360010109719-Kiwi-com-affiliate-links
const KIWI_PROMO_ID = "3791";
const KIWI_CLICK_URL = "https://c111.travelpayouts.com/click";

function buildKiwiLink(
  params: { origin: string; destination: string; departureDate?: string; returnDate?: string },
  subId: string,
): string {
  const deep = new URLSearchParams({
    from: params.origin.toUpperCase(),
    to: params.destination.toUpperCase(),
  });
  if (params.departureDate) deep.set("departure", params.departureDate.slice(0, 10));
  if (params.returnDate) deep.set("return", params.returnDate.slice(0, 10));

  const click = new URLSearchParams({
    shmarker: `${TRAVELPAYOUTS_MARKER}.${subId}`,
    promo_id: KIWI_PROMO_ID,
    source_type: "customlink",
    type: "click",
    custom_url: `https://www.kiwi.com/deep?${deep.toString()}`,
  });
  return `${KIWI_CLICK_URL}?${click.toString()}`;
}

/**
 * Gera o link de afiliado (Kiwi.com via Travelpayouts) para a mesma rota e datas.
 * O subId aparece nas estatisticas do Travelpayouts e identifica a origem do clique.
 */
export async function getTravelpayoutsLink(
  params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers?: number;
  },
  subId = "busca",
): Promise<string> {
  return buildKiwiLink(params, subId);
}

/**
 * Busca preços via Travelpayouts API
 * Retorna ofertas com links de afiliado
 */
export async function searchTravelpayoutsFlights(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers?: number;
  currency?: string;
}) {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.log('[Travelpayouts] No API token found');
    return [];
  }

  const { origin, destination, departureDate, returnDate, currency = 'BRL' } = params;

  const fetchPrices = async (orig: string, dest: string, targetDate: string) => {
    const u = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
    u.searchParams.append('origin', orig);
    u.searchParams.append('destination', dest);
    u.searchParams.append('currency', currency);
    u.searchParams.append('token', TRAVELPAYOUTS_TOKEN);
    u.searchParams.append('limit', '200');
    u.searchParams.append('sorting', 'price');

    try {
      const res = await fetch(u.toString(), { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return [];
      const json = await res.json();
      if (!json.success || !json.data) return [];
      
      const target = new Date(targetDate).getTime();
      const filtered = json.data
        .filter((f: any) => {
          if (!f.departure_at) return true;
          const diff = Math.abs(new Date(f.departure_at).getTime() - target);
          return diff < 7 * 24 * 60 * 60 * 1000;
        })
        .sort((a: any, b: any) => (a.price || 0) - (b.price || 0));

      return filtered.length > 0 ? filtered : json.data
        .sort((a: any, b: any) => (a.price || 0) - (b.price || 0))
        .slice(0, 3);
    } catch {
      return [];
    }
  };

  try {
    const outbound = await fetchPrices(origin, destination, departureDate);
    const returnFlights = returnDate ? await fetchPrices(destination, origin, returnDate) : [];

    if (outbound.length === 0) {
      console.log('[Travelpayouts] No outbound flights found');
      return [];
    }

    const cheapestReturn = returnFlights[0];
    const hasReturn = !!cheapestReturn;
    const limit = hasReturn ? 15 : 25;

    const results = outbound.slice(0, limit).map((flight: any, idx: number) => {
      const price = flight.price || 0;
      const returnPrice = cheapestReturn?.price || 0;
      const totalPrice = hasReturn ? price + returnPrice : price;

      const purchaseUrl = buildKiwiLink(
        { origin, destination, departureDate: params.departureDate, returnDate: params.returnDate },
        "estimativa",
      );

      const itineraries = [];
      const depTime = flight.departure_at || departureDate;
      const durOut = flight.duration_to || flight.duration || 60;
      
      itineraries.push({
        duration: `PT${durOut}M`,
        segments: [{
          departure: { iataCode: flight.origin_airport || origin, at: depTime },
          arrival: { iataCode: flight.destination_airport || destination, at: new Date(new Date(depTime).getTime() + durOut * 60000).toISOString() },
          carrierCode: flight.airline || 'UNKNOWN',
          number: flight.flight_number?.toString() || '0000',
        }],
      });

      if (hasReturn) {
        const retDur = cheapestReturn?.duration_to || cheapestReturn?.duration || 60;
        const retTime = cheapestReturn?.departure_at || `${returnDate}T12:00:00`;
        itineraries.push({
          duration: `PT${retDur}M`,
          segments: [{
            departure: { iataCode: cheapestReturn?.origin_airport || destination, at: retTime },
            arrival: { iataCode: cheapestReturn?.destination_airport || origin, at: new Date(new Date(retTime).getTime() + retDur * 60000).toISOString() },
            carrierCode: cheapestReturn?.airline || flight.airline || 'UNKNOWN',
            number: (cheapestReturn?.flight_number || flight.flight_number || '0000').toString(),
          }],
        });
      }
      
      return {
        id: `travelpayouts-${idx}-${totalPrice}`,
        price: {
          total: totalPrice > 0 ? totalPrice.toString() : "Consultar",
          currency,
          grandTotal: totalPrice > 0 ? (totalPrice * (params.passengers || 1)).toString() : "Consultar",
        },
        itineraries,
        oneWay: !hasReturn,
        airline: flight.airline || 'UNKNOWN',
        airlineLogo: '',
        flightNumber: flight.flight_number?.toString() || '',
        amenities: [],
        stops: flight.transfers || flight.number_of_changes || 0,
        purchaseUrl,
      };
    });

    return results;
  } catch (error) {
    console.error('[Travelpayouts] Error:', error);
    return [];
  }
}

export async function getPriceMonthMatrix(params: {
  origin: string;
  destination: string;
  month: string;
  currency?: string;
}) {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.log('[Travelpayouts] No API token found for month matrix');
    return null;
  }

  const { origin, destination, month, currency = 'BRL' } = params;

  try {
    const url = new URL('https://api.travelpayouts.com/v2/prices/month-matrix');
    url.searchParams.append('origin', origin);
    url.searchParams.append('destination', destination);
    url.searchParams.append('month', month);
    url.searchParams.append('currency', currency);
    url.searchParams.append('token', TRAVELPAYOUTS_TOKEN);
    url.searchParams.append('show_to_affiliates', 'true');

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`[Travelpayouts] Month matrix error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      console.log('[Travelpayouts] No month matrix data');
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('[Travelpayouts] Month matrix error:', error);
    return null;
  }
}

export async function getTravelpayoutsCalendarLink(params: {
  origin: string;
  destination: string;
  departureDate?: string;
}) {
  const { origin, destination } = params;
  return buildKiwiLink({ origin, destination, departureDate: params.departureDate }, "calendario");
}


