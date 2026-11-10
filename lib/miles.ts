// lib/miles.ts
// Compara pagar uma passagem em dinheiro com emitir a mesma passagem em milhas.

export interface MilesInput {
  cashPrice: number; // preco em dinheiro (R$)
  miles: number; // milhas pedidas pelo programa
  fees: number; // taxas pagas em dinheiro na emissao com milhas (R$)
  costPerThousand: number; // quanto custa (ou vale) 1.000 milhas para o usuario (R$)
}

export interface MilesResult {
  milesCost: number; // custo total da emissao em milhas, em R$
  savings: number; // positivo = milhas saem mais baratas
  valuePerThousand: number; // R$ obtidos por 1.000 milhas neste resgate
  better: "miles" | "cash" | "equal";
}

export function compareMilesVsCash(input: MilesInput): MilesResult | null {
  const { cashPrice, miles, fees, costPerThousand } = input;
  const valid = [cashPrice, miles, fees, costPerThousand].every(
    (n) => Number.isFinite(n) && n >= 0,
  );
  if (!valid || cashPrice <= 0 || miles <= 0) return null;

  const thousands = miles / 1000;
  const milesCost = thousands * costPerThousand + fees;
  const savings = cashPrice - milesCost;
  const valuePerThousand = (cashPrice - fees) / thousands;

  // Diferencas menores que R$ 1 sao tratadas como empate.
  const better = Math.abs(savings) < 1 ? "equal" : savings > 0 ? "miles" : "cash";

  return { milesCost, savings, valuePerThousand, better };
}
