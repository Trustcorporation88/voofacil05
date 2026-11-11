"use client";

import { MilesCalculator } from "@/components/miles-calculator";

const PROGRAMAS = ["Smiles", "LATAM Pass", "Azul Fidelidade", "Livelo", "TAP Miles&Go"];

export function MilhasSection({ cashPrice }: { cashPrice?: number }) {
  return (
    <section id="milhas" className="py-20 px-6 max-w-5xl mx-auto scroll-mt-28">
      <div className="text-center mb-10">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-brand-gray-600">
          MILHAS
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-brand-charcoal tracking-tight">
          Vale mais pagar em dinheiro ou em milhas?
        </h2>
        <p className="text-brand-gray-600 mt-4 max-w-2xl mx-auto text-base leading-relaxed">
          Busque o voo em reais aqui no Voofacil, veja no site do seu programa quantas milhas o
          mesmo voo custa e compare. A conta considera as taxas e quanto você paga pelo milheiro.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {PROGRAMAS.map((p) => (
            <span
              key={p}
              className="px-3 py-1 rounded-full border border-brand-gray-300 text-xs font-semibold text-brand-gray-600"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <MilesCalculator cashPrice={cashPrice} defaultOpen />

      <p className="mt-4 text-xs text-brand-gray-500 text-center">
        Os programas de fidelidade não oferecem consulta pública de milhas. Por isso, a quantidade
        de milhas é informada por você.
      </p>
    </section>
  );
}
