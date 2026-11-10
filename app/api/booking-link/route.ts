export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextRequest, NextResponse } from "next/server";
import { getTravelpayoutsLink } from "@/lib/travelpayouts";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  IgnavBookingOption,
  ignavConfigured,
  ignavPost,
  normalizeExternalUrl,
  pickBookingLink,
} from "@/lib/ignav";

const IATA = /^[A-Za-z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const IGNAV_ID = /^[A-Za-z0-9_-]{8,128}$/;

// Resolve o link de compra do voo escolhido no momento do clique e
// redireciona. Se a Ignav nao tiver um link unico para a viagem inteira,
// cai na busca do Kiwi.com (link de afiliado) para a mesma rota e datas.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const id = q.get("id") || "";
  const origin = q.get("o") || "";
  const destination = q.get("d") || "";
  const departureDate = q.get("dep") || "";
  const returnDate = q.get("ret") || undefined;
  const passengers = Math.min(9, Math.max(1, parseInt(q.get("pax") || "1", 10) || 1));

  if (!IATA.test(origin) || !IATA.test(destination) || !DATE.test(departureDate) || (returnDate && !DATE.test(returnDate))) {
    return NextResponse.json({ error: "Parametros invalidos." }, { status: 400 });
  }

  const fallback = await getTravelpayoutsLink({
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    departureDate,
    returnDate,
    passengers,
  }, "comprar-reserva");

  const limit = checkRateLimit(`booking:${getClientIp(request)}`, 30, 10 * 60 * 1000);
  if (!limit.allowed || !ignavConfigured() || !IGNAV_ID.test(id)) {
    return NextResponse.redirect(fallback, 302);
  }

  try {
    const { status, data } = await ignavPost<{ booking_options?: IgnavBookingOption[] }>(
      "/fares/booking-links",
      { ignav_id: id },
    );
    if (status === 200 && data) {
      const link = pickBookingLink(data.booking_options);
      const url = link ? normalizeExternalUrl(link.url) : null;
      if (url) return NextResponse.redirect(url, 302);
    }
    console.log(`[BookingLink] Sem link unico (status ${status}); usando fallback`);
  } catch (error) {
    console.error("[BookingLink] Error:", error);
  }

  return NextResponse.redirect(fallback, 302);
}
