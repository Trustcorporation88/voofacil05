"use client";

import { useState } from "react";
import {
  Bell,
  Heart,
  History as HistoryIcon,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

interface NavbarProps {
  unreadCount: number;
  showUserMenu: boolean;
  setShowUserMenu: (v: boolean) => void;
  onNotifications: () => void;
  onFavorites: () => void;
  onHistory: () => void;
  onAlerts: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const navItems = [
  { label: "Buscar", href: "#busca" },
  { label: "Benefícios", href: "#beneficios" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNavbar({
  unreadCount,
  showUserMenu,
  setShowUserMenu,
  onNotifications,
  onFavorites,
  onHistory,
  onAlerts,
  onLogin,
  onRegister,
}: NavbarProps) {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setShowUserMenu(false);
      setMobileOpen(false);

      const result = await signOut({
        redirect: false,
        callbackUrl: "/",
      });

      window.location.href = result?.url || "/";
    } catch (error) {
      console.error("Erro ao sair:", error);
      window.location.href = "/";
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-brand-gray-300/30">
      <nav className="flex justify-between items-center px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        <a href="/" className="flex items-center" aria-label="Voofacil, página inicial">
          <Image
            src="/logo-voofacil.png"
            alt="Voofacil"
            width={704}
            height={192}
            priority
            className="object-contain h-10 sm:h-11 md:h-12 w-auto"
          />
        </a>

        <div className="hidden lg:flex items-center gap-9">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-[0.18em] font-semibold text-brand-gray-600 hover:text-brand-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <Loader2 className="w-5 h-5 animate-spin text-brand-gray-500" />
          ) : session ? (
            <>
              <button
                type="button"
                onClick={onNotifications}
                className="relative p-2 text-brand-gray-600 hover:text-brand-charcoal transition-colors"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-brand-charcoal border border-brand-charcoal/20 px-5 py-2.5 rounded-full hover:bg-brand-charcoal hover:text-white transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[130px] truncate">
                    {session.user?.name || session.user?.email?.split("@")[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-brand-gray-300/50 py-2 z-50">
                      <button
                        onClick={() => {
                          onFavorites();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-brand-surface flex items-center gap-2 text-brand-gray-600 text-sm"
                      >
                        <Heart className="w-4 h-4" /> Favoritos
                      </button>

                      <button
                        onClick={() => {
                          onHistory();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-brand-surface flex items-center gap-2 text-brand-gray-600 text-sm"
                      >
                        <HistoryIcon className="w-4 h-4" /> Histórico
                      </button>

                      <button
                        onClick={() => {
                          onAlerts();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-brand-surface flex items-center gap-2 text-brand-gray-600 text-sm"
                      >
                        <Bell className="w-4 h-4" /> Alertas
                      </button>

                      <hr className="my-2 border-brand-gray-300/50" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm disabled:opacity-60"
                      >
                        {loggingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        {loggingOut ? "Saindo..." : "Sair"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onLogin}
                className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-brand-charcoal border border-brand-charcoal/20 px-5 py-2.5 rounded-full hover:bg-brand-charcoal hover:text-white transition-all duration-300"
              >
                <LogIn className="w-4 h-4" /> Entrar
              </button>

              <button
                type="button"
                onClick={onRegister}
                className="hidden sm:flex text-xs uppercase tracking-widest font-semibold bg-brand-charcoal text-white px-5 py-2.5 rounded-full hover:bg-brand-primary transition-all duration-300"
              >
                Cadastrar
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-brand-primary p-2"
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-brand-gray-300/50 px-6 py-5 shadow-xl">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.18em] font-semibold text-brand-gray-700"
              >
                {item.label}
              </a>
            ))}

            {session && (
              <div className="grid grid-cols-1 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onNotifications();
                  }}
                  className="rounded-full border border-brand-charcoal/20 px-4 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Notificações
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onFavorites();
                  }}
                  className="rounded-full border border-brand-charcoal/20 px-4 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Favoritos
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onHistory();
                  }}
                  className="rounded-full border border-brand-charcoal/20 px-4 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Histórico
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onAlerts();
                  }}
                  className="rounded-full border border-brand-charcoal/20 px-4 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Alertas
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full bg-red-600 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60"
                >
                  {loggingOut ? "Saindo..." : "Sair"}
                </button>
              </div>
            )}

            {!session && status !== "loading" && (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogin();
                  }}
                  className="rounded-full border border-brand-charcoal/20 px-4 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Entrar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onRegister();
                  }}
                  className="rounded-full bg-brand-charcoal text-white px-4 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  Cadastrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

