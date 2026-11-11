'use client';

import { useEffect, useState } from 'react';
import { Calculator, ChevronDown, ExternalLink } from 'lucide-react';
import { compareMilesVsCash } from '@/lib/miles';

const PROGRAMS = [
  'Smiles',
  'LATAM Pass',
  'Azul Fidelidade',
  'Livelo',
  'TAP Miles&Go',
  'ConnectMiles',
  'AAdvantage',
  'Avios',
  'Outro',
];

// Sites oficiais onde a pessoa consulta quantas milhas o voo custa.
const PROGRAM_LINKS: Record<string, string> = {
  Smiles: 'https://www.smiles.com.br',
  'LATAM Pass': 'https://latampass.latam.com/pt_br/',
  'Azul Fidelidade': 'https://www.voeazul.com.br',
  Livelo: 'https://www.livelo.com.br',
  'TAP Miles&Go': 'https://www.flytap.com/pt_br/passagens-milhas',
  AAdvantage: 'https://www.aa.com',
};

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Aceita "1.200,50", "30.000" e tambem "20.5".
const toNumber = (v: string) => {
  const t = v.trim();
  if (t.includes(',') || /^\d{1,3}(\.\d{3})+$/.test(t)) {
    return parseFloat(t.replace(/\./g, '').replace(',', '.'));
  }
  return parseFloat(t);
};

interface MilesCalculatorProps {
  /** Menor preco em dinheiro encontrado na busca, usado como valor inicial. */
  cashPrice?: number;
  /** Mostra a calculadora aberta desde o inicio. */
  defaultOpen?: boolean;
}

export function MilesCalculator({ cashPrice, defaultOpen = false }: MilesCalculatorProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [program, setProgram] = useState(PROGRAMS[0]);
  const [cash, setCash] = useState('');
  const [miles, setMiles] = useState('');
  const [fees, setFees] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    if (cashPrice && Number.isFinite(cashPrice)) {
      setCash(cashPrice.toFixed(2).replace('.', ','));
    }
  }, [cashPrice]);

  const result = compareMilesVsCash({
    cashPrice: toNumber(cash),
    miles: toNumber(miles),
    fees: fees.trim() === '' ? 0 : toNumber(fees),
    costPerThousand: toNumber(cost),
  });

  const inputClass =
    'w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-charcoal';
  const labelClass = 'block text-xs font-semibold text-brand-gray-600 mb-1';

  return (
    <div className="p-4 bg-white border border-brand-gray-300/50 rounded-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-brand-gray-600" />
          <span className="text-xs font-bold text-brand-gray-600 uppercase tracking-widest">
            Dinheiro ou milhas?
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-brand-gray-600 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-4">
          <p className="text-sm text-brand-gray-600 mb-4">
            Consulte no site do programa quantas milhas e taxas ele pede para este voo e
            informe abaixo. A conta mostra qual forma de pagamento sai mais barata.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className={labelClass} htmlFor="miles-program">Programa</label>
              <select
                id="miles-program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className={inputClass}
              >
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {PROGRAM_LINKS[program] && (
                <a
                  href={PROGRAM_LINKS[program]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-charcoal underline underline-offset-2"
                >
                  Ver milhas no site <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="miles-cash">Preço em dinheiro (R$)</label>
              <input id="miles-cash" inputMode="decimal" value={cash}
                onChange={(e) => setCash(e.target.value)} placeholder="1.200,00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="miles-amount">Milhas pedidas</label>
              <input id="miles-amount" inputMode="numeric" value={miles}
                onChange={(e) => setMiles(e.target.value)} placeholder="30.000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="miles-fees">Taxas em dinheiro (R$)</label>
              <input id="miles-fees" inputMode="decimal" value={fees}
                onChange={(e) => setFees(e.target.value)} placeholder="80,00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="miles-cost">Custo do seu milheiro (R$)</label>
              <input id="miles-cost" inputMode="decimal" value={cost}
                onChange={(e) => setCost(e.target.value)} placeholder="20,00" className={inputClass} />
            </div>
          </div>

          <p className="mt-2 text-xs text-brand-gray-600">
            Custo do milheiro: quanto você pagou, ou pagaria, por 1.000 milhas neste programa.
          </p>

          {result && (
            <div
              role="status"
              className={`mt-4 p-4 rounded-lg border text-sm ${
                result.better === 'miles'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : result.better === 'cash'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-brand-surface border-brand-gray-300 text-brand-gray-600'
              }`}
            >
              <p className="font-bold">
                {result.better === 'miles' &&
                  `Milhas ${program} compensam: economia de ${brl(result.savings)}.`}
                {result.better === 'cash' &&
                  `Dinheiro compensa: pagar em milhas sairia ${brl(-result.savings)} mais caro.`}
                {result.better === 'equal' && 'As duas formas custam praticamente o mesmo.'}
              </p>
              <p className="mt-1">
                Emitir em milhas custa {brl(result.milesCost)} no total. Neste resgate, cada
                1.000 milhas rendem {brl(result.valuePerThousand)}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
