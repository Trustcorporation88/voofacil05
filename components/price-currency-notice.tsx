import { Info } from "lucide-react";

export function PriceCurrencyNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="leading-relaxed">
          Os preços exibidos no Voofacil estão em reais <strong>(BRL)</strong>.
          A compra é concluída no site da companhia aérea ou de um parceiro.
          Confira lá o valor final e a moeda antes de pagar.
        </p>
      </div>
    </div>
  );
}
