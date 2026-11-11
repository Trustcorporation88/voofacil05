"use client";

import { useMemo, useState, useCallback } from "react";
import { motion } from "motion/react";
import { BedDouble, Plane, Search } from "lucide-react";
import type { SearchParams } from "@/lib/types";
import { AirportSelect } from "@/components/ui/airport-select";
import { REGIONS, getDefaultPassengersForRegion } from "@/lib/regions-config";

interface SearchSectionProps {
  onSearch: (params: SearchParams) => Promise<void>;
  loading: boolean;
  initialParams?: SearchParams | null;
}

export function LandingSearchSection({
  onSearch,
  loading,
  initialParams,
}: SearchSectionProps) {
  const initialRegion = initialParams?.region || "brasil";
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [form, setForm] = useState<SearchParams>({
    origin: initialParams?.origin || "",
    destination: initialParams?.destination || "",
    departureDate: initialParams?.departureDate || "",
    returnDate: initialParams?.returnDate || "",
    passengers:
      initialParams?.passengers || getDefaultPassengersForRegion(initialRegion),
    tripType: initialParams?.tripType || "roundTrip",
    region: initialRegion,
  });

  const [formError, setFormError] = useState("");

  const handleRegionChange = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    setForm((prev) => ({
      ...prev,
      region: regionId,
      passengers: getDefaultPassengersForRegion(regionId),
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.origin || !form.destination) {
      setFormError("Escolha a origem e o destino na lista de aeroportos.");
      return;
    }
    if (form.origin === form.destination) {
      setFormError("A origem e o destino precisam ser diferentes.");
      return;
    }
    if (!form.departureDate) {
      setFormError("Informe a data de ida.");
      return;
    }
    if (form.returnDate && form.returnDate < form.departureDate) {
      setFormError("A volta precisa ser na mesma data da ida ou depois.");
      return;
    }
    setFormError("");

    await onSearch({
      ...form,
      tripType: form.returnDate ? "roundTrip" : "oneWay",
    });

    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <section id="busca" className="py-20 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-28">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 24 }}
        viewport={{ once: true }}
        className="text-center mb-10 md:mb-14"
      >
        <span className="inline-block text-[10px] sm:text-xs font-bold text-brand-gray-600 uppercase tracking-[0.3em] mb-4">
          BUSCA DE PASSAGENS
        </span>
        <h2 className="text-4xl md:text-6xl font-bold text-brand-charcoal tracking-tight">
          Para onde vamos?
        </h2>
        <p className="mt-4 text-sm md:text-base text-brand-gray-600 max-w-2xl mx-auto">
          Informe origem, destino e data para comparar opções disponíveis.
        </p>
      </motion.div>

      <div className="flex justify-center gap-2 mb-5">
        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-charcoal text-white text-xs font-bold uppercase tracking-widest">
          <Plane className="w-4 h-4" /> Voos
        </span>
        <a
          href="/hoteis"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-gray-300 text-brand-gray-600 text-xs font-bold uppercase tracking-widest hover:border-brand-charcoal hover:text-brand-charcoal transition-all"
        >
          <BedDouble className="w-4 h-4" /> Hotéis
        </a>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 18 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-brand-gray-300/50 rounded-3xl p-5 md:p-8 shadow-xl"
      >
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-brand-gray-600 uppercase tracking-widest mb-2">
            Região
          </label>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRegionChange(r.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
                  selectedRegion === r.id
                    ? "bg-brand-charcoal text-white"
                    : "border border-brand-gray-300 text-brand-gray-600 hover:border-brand-charcoal hover:text-brand-charcoal"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-brand-gray-600 uppercase tracking-widest mb-2">
              Origem
            </label>
            <div className="airport-select-premium">
              <AirportSelect
                value={form.origin}
                onChange={(iata) => setForm({ ...form, origin: iata })}
                placeholder="Cidade ou código IATA"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-brand-gray-600 uppercase tracking-widest mb-2">
              Destino
            </label>
            <div className="airport-select-premium">
              <AirportSelect
                value={form.destination}
                onChange={(iata) => setForm({ ...form, destination: iata })}
                placeholder="Cidade ou código IATA"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          <div>
            <label className="block text-[10px] font-bold text-brand-gray-600 uppercase tracking-widest mb-2">
              Ida
            </label>
            <input
              type="date"
              value={form.departureDate}
              min={today}
              onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
              required
              className="w-full px-4 py-3 bg-brand-surface border border-brand-gray-300 rounded-xl text-sm focus:outline-none focus:border-brand-charcoal transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-brand-gray-600 uppercase tracking-widest mb-2">
              Volta
            </label>
            <input
              type="date"
              value={form.returnDate || ""}
              min={form.departureDate || today}
              onChange={(e) =>
                setForm({ ...form, returnDate: e.target.value || undefined })
              }
              className="w-full px-4 py-3 bg-brand-surface border border-brand-gray-300 rounded-xl text-sm focus:outline-none focus:border-brand-charcoal transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-brand-gray-600 uppercase tracking-widest mb-2">
              Passageiros
            </label>
            <select
              value={form.passengers}
              onChange={(e) =>
                setForm({ ...form, passengers: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-brand-surface border border-brand-gray-300 rounded-xl text-sm focus:outline-none focus:border-brand-charcoal transition-colors"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "passageiro" : "passageiros"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-charcoal text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-primary transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {loading ? "Buscando voos..." : "Buscar voos"}
        </button>

        {formError && (
          <p role="alert" className="mt-4 text-sm text-red-600 text-center">
            {formError}
          </p>
        )}

        <p className="mt-4 text-[11px] text-brand-gray-500 text-center leading-relaxed">
          Os preços e condições podem mudar conforme disponibilidade, fornecedor, companhia aérea e regras da tarifa.
        </p>
      </motion.form>
    </section>
  );
}


