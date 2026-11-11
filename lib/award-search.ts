// Links para buscadores de passagens com milhas (AwardTool e Seats.aero).
// Sao apenas links: o usuario abre a busca ja preenchida no site deles,
// com a propria conta. Nao ha raspagem nem chamada automatica.

export interface AwardSearchInput {
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  passengers?: number;
}

const IATA = /^[A-Z]{3}$/;

function clean(code: string): string {
  return (code || "").trim().toUpperCase();
}

function isValid(input: AwardSearchInput): boolean {
  return (
    IATA.test(clean(input.origin)) &&
    IATA.test(clean(input.destination)) &&
    /^\d{4}-\d{2}-\d{2}$/.test(input.date || "")
  );
}

// AwardTool usa timestamp Unix (segundos) da meia-noite no horario de Brasilia (UTC-3, sem horario de verao).
function awardToolTimestamp(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d, 3, 0, 0) / 1000);
}

export function buildAwardToolUrl(input: AwardSearchInput): string {
  if (!isValid(input)) return "https://www.awardtool.com/";
  const ts = awardToolTimestamp(input.date);
  const pax = Math.min(Math.max(input.passengers || 1, 1), 9);
  const qs = [
    "flightWay=oneway",
    `pax=${pax}`,
    "children=0",
    "cabins=Economy%26Premium+Economy%26Business%26First",
    "range=true",
    "rangeV2=false",
    `from=${clean(input.origin)}`,
    `to=${clean(input.destination)}`,
    "programs=",
    "targetId=",
    `oneWayRangeStartDate=${ts}`,
    `oneWayRangeEndDate=${ts}`,
  ].join("&");
  return `https://www.awardtool.com/flight?${qs}`;
}

export function buildSeatsAeroUrl(input: AwardSearchInput): string {
  if (!isValid(input)) return "https://seats.aero/search";
  const qs = new URLSearchParams({
    origins: clean(input.origin),
    destinations: clean(input.destination),
    date: input.date,
  });
  return `https://seats.aero/search?${qs.toString()}`;
}
