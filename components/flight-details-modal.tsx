"use client";

import { X, Plane, Clock, MapPin, Luggage } from "lucide-react";
import type { Flight, SearchParams } from "@/lib/types";
import { useState } from "react";

interface FlightDetailsModalProps {
  flight: Flight;
  searchParams: SearchParams | null;
  onClose: () => void;
}

export function FlightDetailsModal({ flight, searchParams, onClose }: FlightDetailsModalProps) {
  const [includeBaggage, setIncludeBaggage] = useState(false);

  const basePrice = parseFloat(flight.price.total) || 0;
  const baggageFee = flight.oneWay ? 100 : 200;
  const totalPrice = includeBaggage ? basePrice + baggageFee : basePrice;

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return '--';
    }
  };

  const calculateDuration = (departure: string, arrival: string) => {
    try {
      const diff = new Date(arrival).getTime() - new Date(departure).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return '--';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Detalhes do Voo</h2>
            <p className="text-blue-100 text-sm mt-1">
              {searchParams?.origin} → {searchParams?.destination}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Price Section */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Preço por pessoa (taxas inclusas)</p>
              <p className="text-4xl font-bold text-blue-600">
                R$ {totalPrice.toFixed(0)}
              </p>
              {includeBaggage && (
                <p className="text-xs text-green-600 mt-1">
                  <Luggage className="w-3 h-3 inline mr-1" />
                  Inclui bagagem despachada (estimado: +R${baggageFee})
                </p>
              )}
              {searchParams && searchParams.passengers > 1 && (
                <p className="text-sm text-gray-600 mt-2">
                  Total para {searchParams.passengers} passageiro{searchParams.passengers > 1 ? 's' : ''}: 
                  <span className="font-semibold text-gray-800 ml-1">
                    R$ {(totalPrice * searchParams.passengers).toFixed(0)}
                  </span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <p className="text-sm text-gray-600">{flight.airline || 'Companhia Aérea'}</p>
              <span className={`inline-block text-sm px-4 py-2 rounded-full font-semibold ${
                (flight.stops ?? 0) === 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {(flight.stops ?? 0) === 0 ? '✈️ Voo Direto' : `${flight.stops ?? 0} parada${(flight.stops ?? 0) > 1 ? 's' : ''}`}
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 rounded-lg border">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeBaggage}
                    onChange={(e) => setIncludeBaggage(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-4 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                </div>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Luggage className="w-3 h-3" />
                  {includeBaggage ? 'Com bagagem' : 'Sem bagagem'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Itinerary Details */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Itinerário Completo
          </h3>

          {flight.itineraries && flight.itineraries.length > 0 ? (
            <div className="space-y-6">
              {flight.itineraries.map((itinerary, itinIndex) => (
                <div key={itinIndex} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    {itinIndex === 0 ? '🛫 Ida' : '🛬 Volta'}
                  </p>
                  
                  {itinerary.segments && itinerary.segments.length > 0 ? (
                    <div className="space-y-4">
                      {itinerary.segments.map((segment, segIndex) => (
                        <div key={segIndex}>
                          <div className="flex items-start gap-4">
                            {/* Timeline */}
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              {segIndex < itinerary.segments.length - 1 && (
                                <div className="w-0.5 h-16 bg-gray-300 my-1"></div>
                              )}
                            </div>

                            {/* Segment Details */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-lg font-bold text-gray-800">
                                    {formatTime(segment.departure.at)}
                                  </p>
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {segment.departure.iataCode}
                                  </p>
                                  <p className="text-xs text-gray-500">{formatDate(segment.departure.at)}</p>
                                </div>

                                <div className="text-center px-4">
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {calculateDuration(segment.departure.at, segment.arrival.at)}
                                  </p>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {segment.carrierCode} {segment.number}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-800">
                                    {formatTime(segment.arrival.at)}
                                  </p>
                                  <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                                    <MapPin className="w-3 h-3" />
                                    {segment.arrival.iataCode}
                                  </p>
                                  <p className="text-xs text-gray-500">{formatDate(segment.arrival.at)}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Connection Time */}
                          {segIndex < itinerary.segments.length - 1 && (
                            <div className="ml-7 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                              ⏱️ Conexão em {segment.arrival.iataCode}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Detalhes não disponíveis</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Plane className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Detalhes do itinerário não disponíveis</p>
            </div>
          )}
        </div>

        {/* Footer with Purchase Button */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <p>✅ Compra no site da companhia aérea ou de um parceiro</p>
              <p className="text-xs text-gray-500 mt-1">
                Você será redirecionado para finalizar sua compra
              </p>
            </div>
            <a
              href={flight.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
            >
              🛒 Comprar Agora
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


