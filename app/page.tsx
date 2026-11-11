"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { SearchParams, Flight, SearchResponse, ProviderHealth } from "@/lib/types";
import { useSession } from "next-auth/react";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingSearchSection } from "@/components/landing/search-section";
import { LandingResultsSection } from "@/components/landing/results-section";
import { LandingFooter } from "@/components/landing/footer";
import { MilhasSection } from "@/components/landing/miles-section";
import {
  BeneficiosSection,
  ComoFuncionaSection,
  FaqSection,
  TransparenciaSection,
  ValoresSection,
} from "@/components/landing/page-sections";
import FavoritesModal from "@/components/favorites-modal";
import HistoryModal from "@/components/history-modal";
import AlertsModal from "@/components/alerts-modal";
import NotificationsModal from "@/components/notifications-modal";
import { CreateAlertModal } from "@/components/create-alert-modal";
import DisclaimerModal from "@/components/disclaimer-modal";
import LoginModal from "@/components/auth/login-modal";
import RegisterModal from "@/components/auth/register-modal";

type FilterType = "all" | "direct" | "1-stop" | "2-stops" | "cheapest";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showBaggage, setShowBaggage] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [providerHealth, setProviderHealth] = useState<Record<string, ProviderHealth>>({});
  const [searchWarnings, setSearchWarnings] = useState<string[]>([]);
  const [prefill, setPrefill] = useState<SearchParams | null>(null);

  const { data: session } = useSession();

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [session, fetchUnread]);

  // Links das paginas de rota (/voos/gru-gig) chegam como /?origem=GRU&destino=GIG.
  // Preenche o formulario, sem buscar sozinho, para nao gastar a cota dos provedores.
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const origin = (qs.get("origem") || "").toUpperCase();
    const destination = (qs.get("destino") || "").toUpperCase();
    const date = qs.get("data") || "";
    const iata = /^[A-Z]{3}$/;
    if (!iata.test(origin) || !iata.test(destination)) return;
    const today = new Date().toISOString().split("T")[0];
    setPrefill({
      origin,
      destination,
      departureDate: /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today ? date : "",
      passengers: 1,
    });
  }, []);

  const handleSearch = async (params: SearchParams) => {
    setSearchParams(params);
    setLoading(true);
    setFlights([]);
    setProviderHealth({});
    setSearchWarnings([]);
    setActiveFilter("all");

    try {
      const response = await fetch("/api/search-flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data: SearchResponse = await response.json();

      setFlights(data.flights || []);
      setProviderHealth(data.providers || {});
      setSearchWarnings(data.warnings || []);

      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate || null,
          passengers: params.passengers,
        }),
      }).catch(() => {});
    } catch (err) {
      console.error("Search error:", err);
      setSearchWarnings(["Não foi possível concluir a busca agora. Tente novamente em instantes."]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFlights = useMemo(() => {
    let filtered = [...flights];

    if (activeFilter === "direct") {
      filtered = filtered.filter((f) => (f.stops ?? 0) === 0);
    } else if (activeFilter === "1-stop") {
      filtered = filtered.filter((f) => (f.stops ?? 0) === 1);
    } else if (activeFilter === "2-stops") {
      filtered = filtered.filter((f) => (f.stops ?? 0) >= 2);
    } else if (activeFilter === "cheapest") {
      filtered = filtered.sort(
        (a, b) =>
          (parseFloat(a.price.total) || Infinity) -
          (parseFloat(b.price.total) || Infinity)
      );
    }

    if (selectedAirline) {
      filtered = filtered.filter((f) => (f.airline || "") === selectedAirline);
    }

    return filtered;
  }, [flights, activeFilter, selectedAirline]);

  const airlines = useMemo(
    () => Array.from(new Set(flights.map((f) => f.airline || "Outros"))),
    [flights]
  );

  return (
    <div className="min-h-screen bg-brand-surface selection:bg-brand-charcoal selection:text-white">
      <DisclaimerModal />

      <LandingNavbar
        unreadCount={unreadCount}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        onNotifications={() => setShowNotifications(true)}
        onFavorites={() => setShowFavoritesModal(true)}
        onHistory={() => setShowHistoryModal(true)}
        onAlerts={() => setShowAlertsModal(true)}
        onLogin={() => setShowLoginModal(true)}
        onRegister={() => setShowRegisterModal(true)}
      />

      <LandingHero
        onDiscover={() =>
          document.getElementById("busca")?.scrollIntoView({ behavior: "smooth" })
        }
        onBook={() => (session ? setShowAlertsModal(true) : setShowLoginModal(true))}
      />

      <LandingSearchSection
        key={prefill ? `${prefill.origin}-${prefill.destination}` : "busca"}
        onSearch={handleSearch}
        loading={loading}
        initialParams={searchParams || prefill}
      />

      {(flights.length > 0 || loading) && searchParams && (
        <LandingResultsSection
          flights={flights}
          filteredFlights={filteredFlights}
          searchParams={searchParams}
          providers={providerHealth}
          warnings={searchWarnings}
          loading={loading}
          activeFilter={activeFilter}
          setActiveFilter={(f) => setActiveFilter(f as FilterType)}
          airlines={airlines}
          selectedAirline={selectedAirline}
          setSelectedAirline={setSelectedAirline}
          showBaggage={showBaggage}
          setShowBaggage={setShowBaggage}
          selectedFlight={selectedFlight}
          setSelectedFlight={setSelectedFlight}
          showAI={showAI}
          setShowAI={setShowAI}
          onReSearch={handleSearch}
          onFavorites={() => setShowFavoritesModal(true)}
          onCreateAlert={() => setShowCreateAlert(true)}
        />
      )}

      <div className="horizon-line" />
      <MilhasSection
        search={searchParams}
        cashPrice={(() => {
          const prices = flights.map((f) => parseFloat(f.price.total)).filter((p) => Number.isFinite(p) && p > 0);
          return prices.length > 0 ? Math.min(...prices) : undefined;
        })()}
      />
      <div className="horizon-line" />
      <BeneficiosSection />
      <div className="horizon-line" />
      <ComoFuncionaSection />
      <div className="horizon-line" />
      <ValoresSection />
      <div className="horizon-line" />
      <TransparenciaSection />
      <div className="horizon-line" />
      <FaqSection />
      <div className="horizon-line" />

      <LandingFooter />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSearch={(params: any) =>
          handleSearch({ ...params, region: searchParams?.region || "brasil" } as any)
        }
        currentSearch={
          searchParams
            ? {
                origin: searchParams.origin,
                destination: searchParams.destination,
                departureDate: searchParams.departureDate,
                returnDate: searchParams.returnDate,
                passengers: searchParams.passengers,
              }
            : null
        }
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSearch={(params: any) =>
          handleSearch({ ...params, region: searchParams?.region || "brasil" } as any)
        }
      />

      <AlertsModal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
      />

      {searchParams && (
        <CreateAlertModal
          isOpen={showCreateAlert}
          onClose={() => setShowCreateAlert(false)}
          origin={searchParams.origin}
          destination={searchParams.destination}
          departureDate={searchParams.departureDate}
          returnDate={searchParams.returnDate}
          passengers={searchParams.passengers}
          currentPrice={flights.length > 0 ? flights[0].price.total : undefined}
        />
      )}

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onRead={() => fetchUnread()}
      />
    </div>
  );
}


