import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Voos", href: "/#busca" },
  { label: "Hotéis", href: "/hoteis" },
  { label: "Milhas", href: "/#milhas" },
];

// Cabecalho simples para as paginas internas (hoteis). A pagina inicial usa
// a LandingNavbar, que tambem cuida de login e notificacoes.
export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 w-full z-40 glass-nav bg-white/90 backdrop-blur border-b border-brand-gray-300/30">
      <nav className="flex justify-between items-center gap-4 px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center shrink-0" aria-label="Voofacil, página inicial">
          <Image
            src="/logo-voofacil.png"
            alt="Voofacil"
            width={704}
            height={192}
            priority
            className="object-contain h-9 sm:h-11 w-auto"
          />
        </Link>
        <div className="flex items-center gap-4 sm:gap-8">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
              className={`text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold transition-colors ${
                active === item.href
                  ? "text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5"
                  : "text-brand-gray-600 hover:text-brand-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
