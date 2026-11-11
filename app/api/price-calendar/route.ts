export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getPriceMonthMatrix } from "@/lib/travelpayouts";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
export async function POST(request: NextRequest) {
  // Aberto, como a busca: o calendario usa dados em cache do Travelpayouts.
  // Exigir login aqui fazia o aviso "Login obrigatorio" aparecer em toda busca.
  const limit = checkRateLimit(`calendar:${getClientIp(request)}`, 60, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Muitas consultas em pouco tempo. Aguarde alguns minutos." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const { origin, destination, month } = body;

    if (!origin || !destination || !month) {
      return NextResponse.json(
        { error: "origin, destination e month são obrigatórios" },
        { status: 400 }
      );
    }

    const data = await getPriceMonthMatrix({
      origin,
      destination,
      month,
      currency: "BRL",
    });

    if (!data) {
      return NextResponse.json({
        prices: [],
        message: "Nenhum dado de preço disponível para este mês",
      });
    }

    const prices = Array.isArray(data)
      ? data.map((item: any) => ({
          date: item.depart_date || item.date,
          price: item.value,
          currency: "BRL",
          airline: item.airline,
          transfers: item.number_of_changes,
          tripDuration: item.duration,
        }))
      : [];

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("[PriceCalendar] Error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar preços do mês" },
      { status: 500 }
    );
  }
}




