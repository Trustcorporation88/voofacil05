// lib/types.ts

export interface SearchParams {
  origin: string;
  originName?: string;
  destination: string;
  destinationName?: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  tripType?: "oneWay" | "roundTrip";
  region?: string;
}

export interface Flight {
  id: string;
  price: {
    total: string;
    currency: string;
    grandTotal?: string;
  };
  itineraries: Itinerary[];
  oneWay: boolean;
  airline?: string;
  validatingAirline?: string;
  airlineLogo?: string;
  flightNumber?: string;
  amenities?: string[];
  stops?: number;
  purchaseUrl?: string;
  travelerPricings?: any[];
}

export type ProviderState = "ok" | "empty" | "error" | "disabled";

export interface ProviderHealth {
  status: ProviderState;
  count: number;
  responseMs?: number;
  message?: string;
}

export interface SearchResponse {
  flights: Flight[];
  provider: string;
  count: number;
  message?: string;
  warnings?: string[];
  providers?: Record<string, ProviderHealth>;
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  carrierCode: string;
  number: string;
  flightNumber?: string;
  duration?: string;
  aircraft?: {
    code: string;
  };
}

export interface PriceAlert {
  id: string;
  userId: string;
  origin: string;
  originName?: string;
  destination: string;
  destinationName?: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  targetPrice: number;
  currency: string;
  tripType: "oneWay" | "roundTrip";
  isActive: boolean;
  lastChecked?: Date;
  lastPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AirportOption {
  iata: string;
  display: string;
  name: string;
  city: string;
}

export interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
}

export interface FilterState {
  airlines: string[];
  maxStops: number;
  priceRange: [number, number];
  departureTimeRange: [number, number];
}

export type SortOption = "price" | "duration" | "departure";

export interface SearchHistoryItem {
  id: string;
  params: SearchParams;
  timestamp: string;
  resultsCount: number;
  lowestPrice?: string;
}


