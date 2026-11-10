"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, Plane } from "lucide-react";

interface Flight {
  id: string;
  price: { total: string };
  airline?: string;
  stops?: number;
  oneWay?: boolean;
  itineraries?: any[];
}

interface AIRecommendProps {
  flights: Flight[];
  searchParams: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AIRecommend({ flights, searchParams, isOpen, onClose }: AIRecommendProps) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const flightData = flights.map((f, i) =>
        `#${i + 1}: R$${f.price.total} | ${f.airline || "N/A"} | ${f.stops ?? 0} paradas | ${f.oneWay ? "Só ida" : "Ida+Volta"}`
      ).join("\n");

      const prompt = `Você é um assistente de viagens. Liste e analise TODAS as ${flights.length} opções de voo abaixo.

Rota: ${searchParams?.origin || "?"} → ${searchParams?.destination || "?"}
Datas: ${searchParams?.departureDate || "?"} ${searchParams?.returnDate ? `→ ${searchParams.returnDate}` : "(só ida)"}

TODOS os voos (${flights.length}):
${flightData}

Responda em português, organizado assim:

📋 TODAS AS OPÇÕES (liste cada uma com preço, cia e paradas)
🥇 TOP 3 MELHORES (melhor custo-benefício)
✈️ Destaque se houver voo direto
💰 Dica para economizar`;

      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        setAnalysis(data?.error || "Faça login para usar a recomendação por IA.");
        return;
      }
      setAnalysis(data.choices?.[0]?.message?.content || "Erro ao analisar. Tente novamente.");
    } catch {
      setAnalysis("Erro ao conectar com a IA. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-bold text-lg">IA Recomenda</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {!analysis && !loading && (
            <div className="text-center py-8">
              <Plane className="w-12 h-12 mx-auto mb-3 text-purple-400" />
              <p className="text-gray-600 mb-4">
                A IA vai analisar os {flights.length} voos e recomendar o melhor para você.
              </p>
              <button
                onClick={handleAnalyze}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                Analisar Resultados
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
              <p className="text-gray-600">DeepSeek analisando os voos...</p>
            </div>
          )}

          {analysis && (
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis}</div>
              <button
                onClick={handleAnalyze}
                className="mt-4 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                Analisar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


