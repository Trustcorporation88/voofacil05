export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { nightsBetween, searchHotels } from "@/lib/hotels";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: NextRequest) {
  // Busca aberta, com limite por IP para proteger a cota do provedor.
  const limit = checkRateLimit(`hotels:${getClientIp(request)}`, 12, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Muitas buscas em pouco tempo. Aguarde alguns minutos e tente novamente." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const q = String(body?.q || "").replace(/\s+/g, " ").trim().slice(0, 80);
  const checkIn = String(body?.checkIn || "");
  const checkOut = String(body?.checkOut || "");
  const adults = Math.min(Math.max(parseInt(body?.adults, 10) || 2, 1), 8);
  const children = Math.min(Math.max(parseInt(body?.children, 10) || 0, 0), 4);
  const pageToken =
    typeof body?.pageToken === "string" && body.pageToken.length <= 200 ? body.pageToken : undefined;

  if (q.length < 2) {
    return NextResponse.json({ error: "Informe a cidade ou o nome do hotel." }, { status: 400 });
  }
  if (!DATE.test(checkIn) || !DATE.test(checkOut)) {
    return NextResponse.json({ error: "Informe as datas de entrada e de saída." }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const nights = nightsBetween(checkIn, checkOut);
  // Um dia de tolerancia por causa do fuso horario do usuario.
  if (nightsBetween(checkIn, today) > 1) {
    return NextResponse.json({ error: "A data de entrada já passou." }, { status: 400 });
  }
  if (nights < 1) {
    return NextResponse.json({ error: "A saída precisa ser depois da entrada." }, { status: 400 });
  }
  if (nights > 30) {
    return NextResponse.json({ error: "A estadia pode ter no máximo 30 noites." }, { status: 400 });
  }

  const result = await searchHotels({ q, checkIn, checkOut, adults, children, pageToken });

  return NextResponse.json({
    ...result,
    count: result.hotels.length,
    nights,
    message:
      result.hotels.length > 0
        ? undefined
        : result.unavailable
          ? "Não foi possível consultar os preços agora. Veja as opções direto nos parceiros."
          : "Nenhuma hospedagem encontrada. Tente outro destino ou outras datas.",
  });
}
