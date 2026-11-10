import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Faça login para usar a recomendação por IA.", loginRequired: true },
      { status: 401 }
    );
  }

  try {
    const { messages } = await request.json();
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Claude API key not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Converte o formato de messages do OpenAI para o formato do Claude
    const claudeMessages = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })
    );

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022", // ou claude-3-opus-20240229, claude-3-haiku-20240307
      max_tokens: 4000,
      messages: claudeMessages,
    });

    // Formata a resposta no mesmo padrão que DeepSeek retorna
    const formattedResponse = {
      choices: [
        {
          message: {
            content:
              response.content[0].type === "text" ? response.content[0].text : "",
          },
        },
      ],
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "Erro ao chamar Claude API" },
      { status: 500 }
    );
  }
}


