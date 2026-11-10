export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { searchWithSerpAPI, searchWithAirScraper } from '@/lib/flight-providers';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { searchTravelpayoutsFlights } from '@/lib/travelpayouts';
import { searchWithIgnav } from '@/lib/ignav';
import { SearchParams, Flight, ProviderHealth, SearchResponse } from '@/lib/types';
import { getRegionAirports } from '@/lib/regions-config';
const isDomesticBR = (origin: string, destination: string) => {
  const brAirports = getRegionAirports('brasil');
  return brAirports.includes(origin.toUpperCase()) && brAirports.includes(destination.toUpperCase());
};

type ProviderRun = {
  key: string;
  flights: Flight[];
  status: ProviderHealth['status'];
  message?: string;
  responseMs: number;
};

const runProvider = async (
  key: string,
  runner: () => Promise<Flight[]>,
): Promise<ProviderRun> => {
  const startedAt = Date.now();
  try {
    const flights = await runner();
    return {
      key,
      flights,
      status: flights.length > 0 ? 'ok' : 'empty',
      responseMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      key,
      flights: [],
      status: 'error',
      message: String(error),
      responseMs: Date.now() - startedAt,
    };
  }
};

const buildProviderMap = (runs: ProviderRun[]): Record<string, ProviderHealth> => {
  return runs.reduce<Record<string, ProviderHealth>>((acc, run) => {
    acc[run.key] = {
      status: run.status,
      count: run.flights.length,
      responseMs: run.responseMs,
      message: run.message,
    };
    return acc;
  }, {});
};

// Resultados dos provedores de reserva (precos em cache ou raspados): remove
// duplicados e descarta valores muito acima do menor preco.
const dedupeAndFilterFlights = (flights: Flight[]) => {
  const unique = flights.filter((f, i, arr) =>
    arr.findIndex((x) => x.purchaseUrl === f.purchaseUrl && x.price.total === f.price.total) === i,
  ).filter((f) => {
    const airline = (f.airline || '').toUpperCase();
    return airline !== 'AV' && airline !== 'AVIANCA' && !airline.includes('AVIANCA');
  });

  const prices = unique.map((f) => parseFloat(f.price.total) || Infinity);
  const minPrice = Math.min(...prices);
  const realistic = unique.filter((f) => {
    const p = parseFloat(f.price.total) || Infinity;
    return p <= minPrice * 2;
  });

  return { realistic, minPrice };
};

const buildWarnings = (providers: Record<string, ProviderHealth>, flightsCount: number): string[] => {
  const warnings: string[] = [];
  const anyResponded = Object.values(providers).some((p) => p.status === 'ok');

  if (flightsCount === 0 && anyResponded) {
    warnings.push('Provedores responderam, mas sem ofertas para os parametros informados.');
  }

  return warnings;
};

const MAX_RESULTS = 20;
const MAX_LIVE_RESULTS = 40;

// Ordenacao deterministica: menor preco primeiro, menos escalas como desempate.
const rankFlights = (flights: Flight[], max = MAX_RESULTS): Flight[] => {
  const price = (f: Flight) => parseFloat(f.price.total) || Infinity;
  return [...flights]
    .sort((a, b) => price(a) - price(b) || (a.stops || 0) - (b.stops || 0))
    .slice(0, max);
};

export async function POST(request: NextRequest) {
  // Busca aberta (sem login), com limite por IP para proteger a cota dos provedores.
  const limit = checkRateLimit(`search:${getClientIp(request)}`, 15, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Muitas buscas em pouco tempo. Aguarde alguns minutos e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const params: SearchParams = body;

    console.log('[API] Flight search request:', params);

    if (!params.origin || !params.destination || !params.departureDate) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    const domestic = isDomesticBR(params.origin, params.destination);

    console.log(domestic
      ? '[API] Rota nacional Brasil - buscando todos provedores'
      : '[API] Rota internacional - buscando todos provedores');

    // 1) Preco ao vivo (Ignav). Quando responde, e a unica fonte exibida:
    //    misturar precos em cache de outras datas com precos reais engana o usuario.
    const ignavRun = await runProvider('ignav', () => searchWithIgnav(params));
    let providers: ProviderRun[] = [ignavRun];
    let topFlights: Flight[];

    if (ignavRun.flights.length > 0) {
      topFlights = rankFlights(ignavRun.flights, MAX_LIVE_RESULTS);
      console.log(`[API] Ignav: ${ignavRun.flights.length} voos ao vivo`);
    } else {
      // 2) Reserva: so quando a Ignav falha ou nao tem oferta para a rota.
      const fallback = await Promise.all([
        runProvider('googleFlights', () => searchWithSerpAPI(params)),
        runProvider('travelpayouts', () => searchTravelpayoutsFlights(params)),
        runProvider('airScraper', () => searchWithAirScraper(params)),
      ]);
      providers = [ignavRun, ...fallback];
      const allFlights = fallback.flatMap((p) => p.flights);
      const { realistic, minPrice } = dedupeAndFilterFlights(allFlights);
      console.log(`[API] Reserva: ${allFlights.length} voos, ${realistic.length} realistas (min: R$${minPrice})`);
      topFlights = rankFlights(realistic);
    }

    const providerMap = buildProviderMap(providers);
    const warnings = buildWarnings(providerMap, topFlights.length);
    if (ignavRun.flights.length === 0 && topFlights.length > 0) {
      warnings.push('Precos ao vivo indisponiveis nesta busca. Os valores exibidos sao estimativas e podem mudar no site do parceiro.');
    }

    const payload: SearchResponse = {
      flights: topFlights,
      provider: topFlights.length > 0 ? (ignavRun.flights.length > 0 ? 'Ignav' : 'Multi Provedores') : 'none',
      count: topFlights.length,
      providers: providerMap,
      warnings,
      message:
        topFlights.length > 0
          ? undefined
          : 'Nenhum voo encontrado. Tente outras datas ou aeroportos.',
    };

    return NextResponse.json(payload);

  } catch (error) {
    console.error('[API] Error searching flights:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar voos. Tente novamente.', details: String(error) },
      { status: 500 }
    );
  }
}




