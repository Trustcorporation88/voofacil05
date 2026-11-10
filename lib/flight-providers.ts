// lib/flight-providers.ts
"use server";

import { SearchParams, Flight } from "@/lib/types";
import { getTravelpayoutsLink } from "@/lib/travelpayouts";

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// If Skyscanner returns 403 (subscription issue), skip it temporarily to reduce latency.
let skyscannerDisabledUntil = 0;

export async function getSkyscannerProviderStatus() {
  const remainingMs = Math.max(0, skyscannerDisabledUntil - Date.now());
  return {
    temporarilyDisabled: remainingMs > 0,
    retryInSeconds: Math.ceil(remainingMs / 1000),
  };
}

// ============ SERP API (Google Flights) ============
export async function searchWithSerpAPI(
  params: SearchParams,
): Promise<Flight[]> {
  console.log("[SerpAPI] Starting search...");
  
  if (!SERPAPI_KEY) {
    console.log("[SerpAPI] No API key found");
    return [];
  }

  try {
    const serpApiUrl = new URL("https://serpapi.com/search");
    serpApiUrl.searchParams.append("engine", "google_flights");
    serpApiUrl.searchParams.append("departure_id", params.origin);
    serpApiUrl.searchParams.append("arrival_id", params.destination);
    serpApiUrl.searchParams.append("outbound_date", params.departureDate);
    if (params.returnDate) {
      serpApiUrl.searchParams.append("return_date", params.returnDate);
    }
    serpApiUrl.searchParams.append("adults", params.passengers.toString());
    serpApiUrl.searchParams.append("currency", "BRL");
    serpApiUrl.searchParams.append("api_key", SERPAPI_KEY);

    const res = await fetch(serpApiUrl.toString(), {
      signal: AbortSignal.timeout(10000),
    });

    console.log(`[SerpAPI] Response status: ${res.status}`);
    const data = await res.json();
    
    console.log(`[SerpAPI] Response data:`, {
      best_flights: data.best_flights?.length || 0,
      other_flights: data.other_flights?.length || 0,
      error: data.error,
      search_metadata: data.search_metadata
    });

    if (res.ok) {
      const allFlights = [
        ...(data.best_flights || []),
        ...(data.other_flights || []),
      ].filter((f: any) => f.price && f.price > 0)
       .sort((a: any, b: any) => (a.price || 999999) - (b.price || 999999));

      console.log(`[SerpAPI] Found ${allFlights.length} flights`);

      return allFlights.slice(0, 20).map((flight: any, idx: number) => {
        const priceValue = typeof flight.price === 'number' ? flight.price : parseFloat(flight.price) || 0;

        const allSegments = flight.flights || [];
        const isRoundTrip = !!(params.returnDate);

        const itineraries = [];
        
        const outboundSegs = isRoundTrip ? allSegments.slice(0, Math.ceil(allSegments.length / 2)) : allSegments;
        const returnSegs = isRoundTrip ? allSegments.slice(Math.ceil(allSegments.length / 2)) : [];

        itineraries.push({
          duration: `PT${flight.total_duration || 120}M`,
          segments: outboundSegs.map((seg: any) => ({
            departure: {
              iataCode: seg.departure_airport?.id || params.origin,
              at: new Date((seg.departure_airport?.time || params.departureDate).replace(" ", "T")).toISOString(),
            },
            arrival: {
              iataCode: seg.arrival_airport?.id || params.destination,
              at: new Date((seg.arrival_airport?.time || params.departureDate).replace(" ", "T")).toISOString(),
            },
            carrierCode: seg.airline || "UNKNOWN",
            number: seg.flight_number || "0000",
          })),
        });

        if (returnSegs.length > 0) {
          itineraries.push({
            duration: `PT${flight.total_duration || 120}M`,
            segments: returnSegs.map((seg: any) => ({
              departure: {
                iataCode: seg.departure_airport?.id || params.destination,
                at: new Date((seg.departure_airport?.time || params.returnDate || '').replace(" ", "T")).toISOString(),
              },
              arrival: {
                iataCode: seg.arrival_airport?.id || params.origin,
                at: new Date((seg.arrival_airport?.time || params.returnDate || '').replace(" ", "T")).toISOString(),
              },
              carrierCode: seg.airline || "UNKNOWN",
              number: seg.flight_number || "0000",
            })),
          });
        }

        const fmt = (date: string) => {
          const d = new Date(date);
          return `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}`;
        };
        const dep = fmt(params.departureDate);
        const ret = params.returnDate ? fmt(params.returnDate) : '';
        const url = `https://www.aviasales.com/search/${params.origin}${dep}${params.destination}${ret}${params.passengers || 1}?marker=${process.env.TRAVELPAYOUTS_MARKER || '716705'}`;

        return {
          id: `serp-${idx}-${priceValue}`,
          price: {
            total: priceValue > 0 ? priceValue.toString() : "Consultar",
            currency: "BRL",
            grandTotal: priceValue > 0 ? (priceValue * params.passengers).toString() : "Consultar",
          },
          itineraries,
          oneWay: !isRoundTrip,
          airline: allSegments[0]?.airline || "UNKNOWN",
          airlineLogo: allSegments[0]?.airline_logo || "",
          flightNumber: allSegments[0]?.flight_number || "0000",
          amenities: [],
          stops: outboundSegs.length - 1,
          purchaseUrl: url,
        };
      });
    }
  } catch (error) {
    console.error("[SerpAPI] Error:", error);
  }

  return [];
}

// ============ SKYSCANNER (via RapidAPI) ============
export async function searchWithSkyscanner(params: SearchParams): Promise<Flight[]> {
  console.log("[Skyscanner] Starting search...");

  const skyStatus = await getSkyscannerProviderStatus();
  if (skyStatus.temporarilyDisabled) {
    console.log(`[Skyscanner] Temporarily disabled (${skyStatus.retryInSeconds}s left)`);
    return [];
  }
  
  if (!RAPIDAPI_KEY) {
    console.log("[Skyscanner] No RapidAPI key found");
    return [];
  }

  try {
    // Skyscanner via Sky Scrapper API
    const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights`;
    
    const queryParams = new URLSearchParams({
      originSkyId: params.origin,
      destinationSkyId: params.destination,
      originEntityId: params.origin,
      destinationEntityId: params.destination,
      date: params.departureDate,
      adults: params.passengers.toString(),
      currency: "BRL",
      market: "BR",
      locale: "pt-BR"
    });

    if (params.returnDate) {
      queryParams.append("returnDate", params.returnDate);
    }

    const res = await fetch(`${url}?${queryParams}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com"
      },
      signal: AbortSignal.timeout(15000),
    });

    console.log(`[Skyscanner] Response status: ${res.status}`);
    
    if (!res.ok) {
      const errorData = await res.text();
      console.log(`[Skyscanner] Error response:`, errorData);

      if (res.status === 403) {
        skyscannerDisabledUntil = Date.now() + 30 * 60 * 1000;
        console.log("[Skyscanner] Disabled for 30 minutes due to 403 subscription error");
      }
      return [];
    }
    
    const data = await res.json();
    console.log(`[Skyscanner] Response data:`, {
      status: data.status,
      itineraries_length: data.data?.itineraries?.length || 0,
    });

    const itineraries = data.data?.itineraries || [];
    console.log(`[Skyscanner] Found ${itineraries.length} flights`);

    // Gerar link de afiliado uma vez
    const affiliateUrl = await getTravelpayoutsLink(params);

    return itineraries.slice(0, 50).map((itin: any, idx: number) => {
      const priceValue = parseFloat(itin.price?.raw || itin.price?.formatted || 0);
      const legs = itin.legs || [];
      const firstLeg = legs[0] || {};

      // DEBUG: Log para ver estrutura do preço
      if (idx === 0) {
        console.log('[Skyscanner] Sample price data:', {
          price_raw: itin.price?.raw,
          price_formatted: itin.price?.formatted,
          price_object: itin.price,
          calculated_priceValue: priceValue
        });
      }

      return {
        id: `skyscanner-${idx}-${priceValue}`,
        price: {
          total: priceValue > 0 ? priceValue.toFixed(2) : "Consultar",
          currency: "BRL",
          grandTotal: priceValue > 0 ? (priceValue * params.passengers).toFixed(2) : "Consultar",
        },
        itineraries: legs.map((leg: any) => ({
          duration: `PT${leg.durationInMinutes || 120}M`,
          segments: (leg.segments || []).map((seg: any) => ({
            departure: {
              iataCode: seg.origin?.displayCode || params.origin,
              at: seg.departure || new Date().toISOString(),
            },
            arrival: {
              iataCode: seg.destination?.displayCode || params.destination,
              at: seg.arrival || new Date().toISOString(),
            },
            carrierCode: seg.marketingCarrier?.alternateId || "UNKNOWN",
            number: seg.flightNumber || "0000",
          })),
        })),
        oneWay: !params.returnDate,
        airline: firstLeg.carriers?.marketing?.[0]?.name || "UNKNOWN",
        airlineLogo: firstLeg.carriers?.marketing?.[0]?.imageUrl || "",
        flightNumber: firstLeg.segments?.[0]?.flightNumber || "",
        amenities: [],
        stops: firstLeg.stopCount || 0,
        purchaseUrl: affiliateUrl, // Link de afiliado com cashback!
      };
    });
  } catch (error) {
    console.error("[Skyscanner] Error:", error);
  }

  return [];
}

// ============ AIR SCRAPER (RapidAPI) ============
export async function searchWithAirScraper(
  params: SearchParams,
): Promise<Flight[]> {
  console.log("[AirScraper] Starting search...");
  
  if (!RAPIDAPI_KEY) {
    console.log("[AirScraper] No RapidAPI key found");
    return [];
  }

  try {
    const affiliateUrl = await getTravelpayoutsLink(params);

    const url = new URL("https://sky-scrapper.p.rapidapi.com/api/v1/searchFlights");
    url.searchParams.append("fromEntityId", params.origin);
    url.searchParams.append("toEntityId", params.destination);
    url.searchParams.append("departDate", params.departureDate);
    if (params.returnDate) {
      url.searchParams.append("returnDate", params.returnDate);
    }
    url.searchParams.append("adults", params.passengers.toString());
    url.searchParams.append("sortBy", "best");
    url.searchParams.append("limit", "50");

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
      },
      signal: AbortSignal.timeout(10000),
    });

    console.log(`[AirScraper] Response status: ${res.status}`);

    if (!res.ok) {
      console.log(`[AirScraper] Error: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    console.log(`[AirScraper] Response data:`, {
      data_length: data.data?.length || 0,
      status: data.status,
    });

    const flights = data.data || [];
    console.log(`[AirScraper] Found ${flights.length} flights`);

    return flights.slice(0, 50).map((flight: any, idx: number) => {
      const priceValue = parseFloat(flight.price?.raw || flight.price?.formatted || 0);
      const legs = flight.legs || [];

      if (idx === 0) {
        console.log("[AirScraper] Sample flight:", {
          price: flight.price,
          legs_count: legs.length,
        });
      }

      return {
        id: `airscraper-${idx}-${priceValue}`,
        price: {
          total: priceValue > 0 ? priceValue.toFixed(2) : "Consultar",
          currency: "BRL",
          grandTotal: priceValue > 0 ? (priceValue * params.passengers).toFixed(2) : "Consultar",
        },
        itineraries: legs.map((leg: any) => ({
          duration: `PT${leg.durationInMinutes || 120}M`,
          segments: (leg.segments || []).map((seg: any) => ({
            departure: {
              iataCode: seg.origin?.displayCode || params.origin,
              at: seg.departure || new Date().toISOString(),
            },
            arrival: {
              iataCode: seg.destination?.displayCode || params.destination,
              at: seg.arrival || new Date().toISOString(),
            },
            carrierCode: seg.marketingCarrier?.code || "UNKNOWN",
            number: seg.flightNumber || "0000",
          })),
        })),
        oneWay: !params.returnDate,
        airline: legs[0]?.carriers?.marketing?.[0]?.name || "UNKNOWN",
        airlineLogo: legs[0]?.carriers?.marketing?.[0]?.logoUrl || "",
        flightNumber: legs[0]?.segments?.[0]?.flightNumber || "",
        amenities: [],
        stops: legs[0]?.stopCount || 0,
        purchaseUrl: affiliateUrl,
      };
    });
  } catch (error) {
    console.error("[AirScraper] Error:", error);
  }

  return [];
}



