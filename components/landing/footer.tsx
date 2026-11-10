"use client";

import Image from "next/image";
import { Globe, Mail, ShieldCheck } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-brand-primary text-white w-full py-16 mt-20">
      <div className="px-6 max-w-7xl mx-auto">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_0.8fr] items-start">
          <div className="flex flex-col gap-4">
            <Image
              src="/logo-voofacil-branco.png"
              alt="Voofacil"
              width={704}
              height={192}
              className="h-12 w-auto object-contain object-left"
            />
            <p className="text-sm text-brand-gray-300 leading-relaxed max-w-md">
              Plataforma para buscar, comparar e acompanhar opções de passagens aéreas com mais clareza, praticidade e transparência.
            </p>
            <p className="text-xs text-brand-gray-400 font-medium">
              © 2026 Voofacil. Todos os direitos reservados.
            </p>
          </div>

          <nav className="flex flex-wrap md:flex-col gap-4 md:gap-3">
            {[
              { label: "Buscar voos", href: "#busca" },
              { label: "Benefícios", href: "#beneficios" },
              { label: "Como funciona", href: "#como-funciona" },
              { label: "Transparência", href: "#transparencia" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-brand-gray-300 font-medium hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex md:justify-end gap-5">
            <a
              href="https://www.voofacil.online"
              aria-label="Site do Voofacil"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-white/10 transition-all"
            >
              <Globe className="w-5 h-5" />
            </a>
            <a
              href="#faq"
              aria-label="Dúvidas frequentes"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-white/10 transition-all"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href="#transparencia"
              aria-label="Transparência"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-white/10 transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-[11px] text-brand-gray-400 leading-relaxed">
            O Voofacil não é uma companhia aérea e não opera aeronaves. Tarifas, disponibilidade, bagagem, remarcação, cancelamento e demais condições dependem de companhias, agências, provedores e regras da tarifa escolhida. Confira sempre as informações finais antes da compra.
          </p>
        </div>
      </div>
    </footer>
  );
}


