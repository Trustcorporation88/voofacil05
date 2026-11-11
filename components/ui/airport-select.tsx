'use client';

import { useState, useEffect, useRef } from 'react';
import { POPULAR_AIRPORTS } from '@/lib/airports-data';

// Busca sem diferenciar acentos nem maiusculas ("sao paulo" encontra "São Paulo").
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function AirportSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (iata: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Indica se ja existe um aeroporto escolhido (lido dentro do timer do onBlur).
  const selectedRef = useRef(false);

  // Atualizar display quando o valor externo muda
  useEffect(() => {
    if (value) {
      const airport = POPULAR_AIRPORTS.find(a => a.iataCode === value);
      if (airport) {
        setSearch(`${airport.iataCode} - ${airport.cityName}`);
      }
      selectedRef.current = true;
    } else {
      selectedRef.current = false;
    }
  }, [value]);

  const term = normalizeText(search);
  const filtered = POPULAR_AIRPORTS.filter(
    (a) =>
      normalizeText(a.iataCode).includes(term) ||
      normalizeText(a.cityName).includes(term) ||
      normalizeText(a.name).includes(term)
  ).slice(0, 50); // Limitar a 50 resultados

  const handleSelect = (airport: typeof POPULAR_AIRPORTS[0]) => {
    selectedRef.current = true;
    onChange(airport.iataCode);
    setSearch(`${airport.iataCode} - ${airport.cityName}`);
    setOpen(false);
  };

  // Quem digita "GRU" ou "Recife" e sai do campo sem clicar na lista ficava
  // sem aeroporto escolhido, e a busca nao saia. Agora o campo escolhe sozinho.
  const autoSelect = () => {
    if (selectedRef.current || term.length < 3) return;
    const exact = POPULAR_AIRPORTS.find((a) => normalizeText(a.iataCode) === term);
    const match = exact || (filtered.length > 0 ? filtered[0] : undefined);
    if (match) handleSelect(match);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder || 'Digite cidade ou código IATA'}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          // Ao editar o texto, a seleção anterior deixa de valer
          selectedRef.current = false;
          if (value) {
            onChange('');
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() =>
          setTimeout(() => {
            setOpen(false);
            autoSelect();
          }, 250)
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter' && open && !value && filtered.length > 0) {
            e.preventDefault();
            handleSelect(filtered[0]);
          }
        }}
        autoComplete="off"
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {open && filtered.length > 0 && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto" 
          style={{ backgroundColor: '#ffffff' }}
        >
          {filtered.map((airport) => (
            <div
              key={airport.iataCode}
              onMouseDown={(e) => {
                e.preventDefault(); // Previne o onBlur do input
                handleSelect(airport);
              }}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{airport.iataCode}</div>
                  <div className="text-sm text-gray-600">
                    {airport.cityName}, {airport.countryCode}
                  </div>
                  <div className="text-xs text-gray-500">{airport.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && search && filtered.length === 0 && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-center text-gray-500"
          style={{ backgroundColor: '#ffffff' }}
        >
          Nenhum aeroporto encontrado
        </div>
      )}
    </div>
  );
}



