// TEMPORARIO: benchmark da Ignav. Este arquivo vive so no branch bench/ignav-temp.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { ignavPost, IgnavItinerary, IgnavBookingOption, pickBookingLink } from "@/lib/ignav";

const ROUTES: [string, string][] = [
  ["CGH", "SDU"], ["GRU", "REC"], ["GRU", "SSA"], ["BSB", "CGH"], ["GRU", "POA"],
  ["CNF", "GRU"], ["GRU", "FOR"], ["VCP", "SDU"], ["GIG", "BSB"], ["GRU", "CWB"],
  ["GRU", "LIS"], ["GRU", "MIA"], ["GRU", "EZE"], ["GRU", "SCL"], ["GRU", "MCO"],
  ["GIG", "LIS"], ["GRU", "CDG"], ["GRU", "MAD"], ["GRU", "JFK"], ["GRU", "MVD"],
];
const TOKEN = "b3nch-7f2c91d04e";

async function one(o: string, d: string, date: string, adults: number, links: boolean) {
  const t0 = Date.now();
  const r = await ignavPost<any>("/fares/one-way", { origin: o, destination: d, departure_date: date, adults, market: "BR" }, 40000);
  const ms = Date.now() - t0;
  const its: IgnavItinerary[] = r.data?.itineraries || [];
  const brl = its.filter((i) => i.price?.currency === "BRL" && i.price.amount > 0).sort((a, b) => a.price.amount - b.price.amount);
  const out: any = {
    route: `${o}-${d}`, adults, status: r.status, err: r.data?.error?.code, ms, count: its.length, brl: brl.length,
    currencies: [...new Set(its.map((i) => i.price?.currency))],
    verified: its.filter((i) => i.price?.status === "verified").length,
    min: brl[0]?.price.amount, carrier: brl[0]?.outbound?.carrier, stops: brl[0] ? brl[0].outbound.segments.length - 1 : undefined,
  };
  if (links && brl[0]) {
    const t1 = Date.now();
    const b = await ignavPost<{ booking_options?: IgnavBookingOption[]; itinerary?: any }>("/fares/booking-links", { ignav_id: brl[0].ignav_id }, 40000);
    const pick = pickBookingLink(b.data?.booking_options);
    out.link = {
      status: b.status, ms: Date.now() - t1, options: b.data?.booking_options?.length ?? 0,
      links: b.data?.booking_options?.[0]?.links?.length ?? 0,
      provider: pick?.provider_name, type: pick?.provider_type, spec: pick?.specificity,
      price: pick?.price?.amount, cur: pick?.price?.currency, host: pick ? pick.url.replace(/^https?:\/\//, "").split("/")[0] : undefined,
    };
  }
  return out;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  if (q.get("t") !== TOKEN) return NextResponse.json({ error: "not found" }, { status: 404 });
  const date = q.get("date") || "2026-12-15";
  if (q.get("mode") === "pax") {
    return NextResponse.json(await Promise.all([one("GRU", "REC", date, 1, false), one("GRU", "REC", date, 2, false)]));
  }
  const batch = parseInt(q.get("batch") || "0", 10);
  const slice = ROUTES.slice(batch * 4, batch * 4 + 4);
  const results = await Promise.all(slice.map(([o, d]) => one(o, d, date, 1, true).catch((e) => ({ route: `${o}-${d}`, error: String(e) }))));
  return NextResponse.json(results);
}
