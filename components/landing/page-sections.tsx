"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  Clock,
  Filter,
  Globe2,
  PlaneTakeoff,
  Search,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";

function SectionTitle({
  eyebrow,
  title,
  desc,
  light = false,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  light?: boolean;
}) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      <span
        className={`inline-block text-[10px] font-bold uppercase tracking-[0.3em] mb-4 ${
          light ? "text-white/60" : "text-brand-gray-600"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`text-4xl md:text-5xl font-bold tracking-tight ${
          light ? "text-white" : "text-brand-charcoal"
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-5 text-base md:text-lg max-w-3xl mx-auto leading-relaxed ${
            light ? "text-white/70" : "text-brand-gray-600"
          }`}
        >
          {desc}
        </p>
      )}
    </motion.div>
  );
}

const BENEFICIOS = [
  {
    icon: PlaneTakeoff,
    title: "Busca rápida de voos",
    desc: "Pesquise origem, destino, datas e passageiros em uma interface simples, otimizada para celular e desktop.",
  },
  {
    icon: TrendingUp,
    title: "Alertas de preço",
    desc: "Acompanhe rotas de interesse e receba avisos quando houver movimentações relevantes de preço.",
  },
  {
    icon: Filter,
    title: "Filtros úteis",
    desc: "Compare opções por preço, horário, duração, escalas e características da tarifa.",
  },
  {
    icon: Globe2,
    title: "Rotas nacionais e internacionais",
    desc: "Organize buscas para destinos no Brasil e no exterior, conforme disponibilidade dos parceiros e provedores.",
  },
  {
    icon: Clock,
    title: "Menos tempo pesquisando",
    desc: "Centralize informações importantes para decidir com mais rapidez e evitar buscas repetidas.",
  },
  {
    icon: Smartphone,
    title: "Experiência mobile",
    desc: "Acesse pelo navegador ou instale como aplicativo PWA/TWA para uma experiência mais fluida no smartphone.",
  },
];

export function BeneficiosSection() {
  return (
    <section id="beneficios" className="py-24 px-6 max-w-6xl mx-auto scroll-mt-28">
      <SectionTitle
        eyebrow="BENEFÍCIOS"
        title="Tudo para facilitar sua próxima viagem"
        desc="Compare, acompanhe e organize suas buscas de voo com recursos pensados para economia, praticidade e clareza."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BENEFICIOS.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-brand-gray-300/50 rounded-3xl p-7 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-charcoal text-white flex items-center justify-center mb-5">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-charcoal mb-3">{title}</h3>
            <p className="text-sm text-brand-gray-600 leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  "Informe origem, destino, datas e quantidade de passageiros.",
  "Compare as opções disponíveis por preço, horário, duração e conexões.",
  "Use filtros, favoritos e alertas para acompanhar oportunidades.",
  "Confira as condições finais antes de avançar para a reserva.",
];

export function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="py-24 px-6 bg-brand-charcoal text-white scroll-mt-28">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <motion.div
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -20 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mb-4">
            COMO FUNCIONA
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Uma busca simples, com informações mais organizadas
          </h2>
          <p className="mt-5 text-base md:text-lg text-white/70 leading-relaxed">
            O Voofacil ajuda você a sair da dúvida mais rápido, reunindo os dados que realmente importam para escolher um voo.
          </p>
        </motion.div>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/8 border border-white/10 rounded-2xl p-5 flex gap-4"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-white text-brand-charcoal flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                {step}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const VALORES = [
  {
    icon: Search,
    title: "Comparação clara",
    desc: "Veja informações essenciais para comparar voos com mais segurança: preço, duração, horários, conexões e condições disponíveis.",
    bg: "bg-brand-charcoal",
    fg: "text-white",
  },
  {
    icon: Wallet,
    title: "Economia inteligente",
    desc: "Acompanhe rotas, datas e variações de preço para encontrar oportunidades melhores antes de emitir sua passagem.",
    bg: "bg-[#e9edff]",
    fg: "text-brand-charcoal",
  },
  {
    icon: ShieldCheck,
    title: "Transparência primeiro",
    desc: "O Voofacil não é uma companhia aérea. Somos uma plataforma para busca, comparação e organização de informações de voos.",
    bg: "bg-white border border-brand-gray-300/50",
    fg: "text-brand-charcoal",
  },
];

export function ValoresSection() {
  return (
    <section id="valores" className="py-24 px-6 bg-brand-surface scroll-mt-28">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          eyebrow="POR QUE USAR"
          title="Menos confusão. Mais controle na busca."
          desc="Nosso foco é simplificar a etapa mais cansativa da viagem: encontrar uma boa opção de voo sem abrir dezenas de abas."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {VALORES.map(({ icon: Icon, title, desc, bg, fg }, i) => (
            <motion.div
              key={title}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`${bg} ${fg} rounded-3xl p-8 min-h-[280px] flex flex-col justify-between hover:-translate-y-1 transition-transform`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-sm leading-relaxed opacity-80">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TRUST_ITEMS = [
  "Não somos uma companhia aérea.",
  "As tarifas podem variar conforme disponibilidade e regras de cada fornecedor.",
  "Taxas, bagagem, remarcação e cancelamento dependem da companhia, rota e tipo de tarifa.",
  "Antes da compra, confira sempre as condições finais no ambiente de reserva.",
];

export function TransparenciaSection() {
  return (
    <section id="transparencia" className="py-20 px-6 max-w-6xl mx-auto scroll-mt-28">
      <div className="bg-white border border-brand-gray-300/50 rounded-[2rem] p-8 md:p-12">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
          <div>
            <span className="inline-block text-[10px] font-bold text-brand-gray-600 uppercase tracking-[0.3em] mb-4">
              TRANSPARÊNCIA
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-charcoal tracking-tight">
              Informação clara antes de decidir
            </h2>
            <p className="mt-4 text-sm md:text-base text-brand-gray-600 leading-relaxed">
              Nosso papel é facilitar a comparação. A emissão, as regras da tarifa e as condições finais podem depender de companhias, agências ou provedores parceiros.
            </p>
          </div>

          <div className="space-y-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-brand-charcoal text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-sm text-brand-gray-600 leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "O Voofacil vende passagens diretamente?",
    a: "O Voofacil funciona como uma plataforma de busca, comparação e organização de informações de voos. Dependendo da integração disponível, a finalização pode acontecer em ambiente parceiro, companhia aérea ou fluxo indicado na própria plataforma.",
  },
  {
    q: "Os preços exibidos são garantidos?",
    a: "Tarifas aéreas mudam com frequência e dependem de disponibilidade, rota, data, moeda, taxas e regras do fornecedor. Por isso, o preço final deve sempre ser conferido antes da confirmação da compra.",
  },
  {
    q: "O preço inclui bagagem?",
    a: "As regras de bagagem variam conforme companhia, rota e tipo de tarifa. Quando disponível, exibimos informações sobre bagagem e condições da tarifa, mas a confirmação final deve ser feita antes da emissão.",
  },
  {
    q: "Posso cancelar ou remarcar um voo?",
    a: "Cancelamento, remarcação, reembolso e crédito dependem das regras da companhia aérea, da tarifa escolhida e do canal de emissão. Antes de comprar, confira as condições da tarifa.",
  },
  {
    q: "Como funcionam os alertas de preço?",
    a: "Você pode acompanhar uma rota ou busca específica. Quando houver mudança relevante ou oportunidade dentro dos critérios definidos, a plataforma pode enviar uma notificação, conforme suas permissões e configurações.",
  },
  {
    q: "O Voofacil também busca hotéis?",
    a: "Sim. Na página Hotéis você compara preços de hospedagem no Brasil e no mundo, com valor por noite em reais, avaliações e comodidades. A reserva e o pagamento são feitos no site do parceiro.",
  },
  {
    q: "Como comparo o preço em dinheiro com milhas?",
    a: "Depois de buscar um voo, a seção Milhas abre a mesma rota e data em buscadores de passagens com milhas. Com a quantidade de milhas em mãos, a calculadora mostra se compensa pagar em reais ou em milhas.",
  },
  {
    q: "O Voofacil é uma companhia aérea?",
    a: "Não. O Voofacil não opera aeronaves, não possui frota própria e não presta serviço de transporte aéreo. A plataforma ajuda usuários a buscar, comparar e acompanhar opções de voos.",
  },
];

// Dados estruturados para o Google exibir as perguntas no resultado da busca.
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 max-w-4xl mx-auto scroll-mt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <SectionTitle
        eyebrow="DÚVIDAS FREQUENTES"
        title="O que você precisa saber"
      />

      <div className="space-y-4">
        {FAQS.map(({ q, a }, i) => {
          const isOpen = open === i;

          return (
            <motion.div
              key={q}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 12 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border border-brand-gray-300/50 rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm md:text-base font-bold text-brand-charcoal">
                  {q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-brand-gray-600 shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-brand-gray-600 leading-relaxed">
                    {a}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function PageSections() {
  return (
    <>
      <BeneficiosSection />
      <ComoFuncionaSection />
      <ValoresSection />
      <TransparenciaSection />
      <FaqSection />
    </>
  );
}

export default PageSections;


