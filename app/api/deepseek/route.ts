import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Faça login para usar a recomendação por IA.", loginRequired: true },
      { status: 401 }
    );
  }

  // A chamada de IA e paga: limita por usuario e o tamanho do pedido.
  const limit = checkRateLimit(`ia:${session.user.email}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Muitos pedidos em pouco tempo. Aguarde alguns minutos." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const { messages } = await request.json();
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 12 ||
      JSON.stringify(messages).length > 40000
    ) {
      return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
    }
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erro ao chamar IA" }, { status: 500 });
  }
}


