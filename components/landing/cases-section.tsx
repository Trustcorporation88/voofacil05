'use client';

import { motion } from 'motion/react';
import { Zap, Shield, Star, Clock, Globe2, Award, Users, Lock } from 'lucide-react';

const CASES = [
  {
    icon: Zap,
    stat: '4h',
    label: 'Disponibilidade',
    desc: 'Tempo médio para iniciar uma busca e comparar opções disponíveis.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: Globe2,
    stat: '5.000+',
    label: 'Aeroportos',
    desc: 'Acesso a 10x mais destinos que companhias comerciais. Chegue mais perto.',
    color: 'bg-sky-50 text-sky-700',
  },
  {
    icon: Shield,
    stat: '99,8%',
    label: 'Pontualidade',
    desc: 'Índice de despacho referenciado pela Bombardier Global Express Series.',
    color: 'bg-green-50 text-green-700',
  },
  {
    icon: Lock,
    stat: '100%',
    label: 'Privacidade',
    desc: 'Links de satélite criptografados e isolamento acústico em todas as cabines.',
    color: 'bg-purple-50 text-purple-700',
  },
  {
    icon: Award,
    stat: '5★',
    label: 'Padrão',
    desc: 'Culinária premium, interiores personalizados e concierge 24/7 dedicado.',
    color: 'bg-rose-50 text-rose-700',
  },
  {
    icon: Clock,
    stat: '15min',
    label: 'Embarque',
    desc: 'Sem filas, sem check-in. Chegue 15 minutos antes e decole imediatamente.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    icon: Users,
    stat: '1–19',
    label: 'Passageiros',
    desc: 'Cobertura de rotas nacionais e internacionais, conforme disponibilidade dos provedores.',
    color: 'bg-indigo-50 text-indigo-700',
  },
  {
    icon: Star,
    stat: 'VistaJet',
    label: 'Referência',
    desc: 'Modelo operacional inspirado nos melhores operadores mundiais como VistaJet e NetJets.',
    color: 'bg-orange-50 text-orange-700',
  },
];

export function CasesSection() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="inline-block text-[10px] font-bold text-brand-gray-600 uppercase tracking-[0.3em] mb-4">
          POR QUE VOOFACIL
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-brand-charcoal tracking-tight">
          Benchmarks da Indústria
        </h2>
        <p className="text-brand-gray-600 mt-4 max-w-xl mx-auto text-base">
          Indicadores internos usados para acompanhar qualidade, velocidade e clareza da experiência.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CASES.map(({ icon: Icon, stat, label, desc, color }, i) => (
          <motion.div
            key={label}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="bg-white border border-brand-gray-300/50 rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-brand-charcoal tracking-tight mb-1">
              {stat}
            </div>
            <div className="text-[10px] font-bold text-brand-gray-600 uppercase tracking-widest mb-2">
              {label}
            </div>
            <p className="text-xs text-brand-gray-600 leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}



