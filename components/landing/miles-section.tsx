"use client";

import { ExternalLink, Search } from "lucide-react";
import { MilesCalculator } from "@/components/miles-calculator";
import { buildAwardToolUrl, buildSeatsAeroUrl } from "@/lib/award-search";
import type { SearchParams } from "@/lib/types";

const PROGRAMAS = ["Smiles", "LATAM Pass", "Azul Fidelidade", "Livelo", "TAP Miles&Go"];

function BuscaMilhasLinks({ label, origin, destination, date, passengers }: {
  label: string;
  origin: string;
  destination: string;
  date: string;
  passengers?: number;
}) {
  const input = { origin, destination, date, passengers };
  const btn =
    "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all";
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-xs font-semibold text-brand-gray-600 sm:w-40">{label}</span>
      <div className="flex flex-wrap gap-2">
        <a
          href={buildAwardToolUrl(input)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-brand-charcoal text-white hover:bg-brand-primary`}
        >
          AwardTool <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href={buildSeatsAeroUrl(input)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white`}
        >
          Seats.aero <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export function MilhasSection({ cashPrice, search }: { cashPrice?: number; search?: SearchParams | null }) {
  const temBusca = !!search?.origin && !!search?.destination && !!search?.departureDate;
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

      <div className="mb-6 p-5 bg-white border border-brand-gray-300/50 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-brand-gray-600" />
          <h3 className="text-sm font-bold text-brand-charcoal">
            {temBusca
              ? `Quantas milhas custa ${search!.origin} → ${search!.destination}?`
              : "Busque passagens com milhas"}
          </h3>
        </div>
        <p className="text-xs text-brand-gray-500 mb-4">
          {temBusca
            ? "Abre a mesma busca já preenchida no AwardTool e no Seats.aero, com Smiles, TAP e outros programas. Basta criar uma conta grátis lá."
            : "Faça uma busca acima para abrir o AwardTool e o Seats.aero já com sua rota e data. Eles mostram Smiles, TAP e outros programas, com conta grátis."}
        </p>
        <div className="space-y-3">
          {temBusca ? (
            <>
              <BuscaMilhasLinks
                label={search!.returnDate ? "Ida" : "Seu voo"}
                origin={search!.origin}
                destination={search!.destination}
                date={search!.departureDate}
                passengers={search!.passengers}
              />
              {search!.returnDate && (
                <BuscaMilhasLinks
                  label="Volta"
                  origin={search!.destination}
                  destination={search!.origin}
                  date={search!.returnDate}
                  passengers={search!.passengers}
                />
              )}
            </>
          ) : (
            <BuscaMilhasLinks label="Sem rota ainda" origin="" destination="" date="" />
          )}
        </div>
        <p className="mt-4 text-[11px] text-brand-gray-500">
          LATAM Pass e Azul ainda não aparecem nesses buscadores. Para elas, consulte o site do programa.
        </p>
      </div>

      <MilesCalculator cashPrice={cashPrice} defaultOpen />

      <p className="mt-4 text-xs text-brand-gray-500 text-center">
        Veja as milhas no AwardTool ou no Seats.aero e digite a quantidade na calculadora para
        comparar com o preço em reais.
      </p>
    </section>
  );
}
