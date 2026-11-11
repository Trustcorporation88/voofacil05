// Destinos populares para a busca de hoteis e para as paginas /hoteis/[cidade].

export interface HotelDestination {
  slug: string;
  city: string;
  country: string;
  query: string;
}

export const HOTEL_DESTINATIONS: HotelDestination[] = [
  { slug: "rio-de-janeiro", city: "Rio de Janeiro", country: "Brasil", query: "Rio de Janeiro, RJ" },
  { slug: "sao-paulo", city: "São Paulo", country: "Brasil", query: "São Paulo, SP" },
  { slug: "salvador", city: "Salvador", country: "Brasil", query: "Salvador, BA" },
  { slug: "fortaleza", city: "Fortaleza", country: "Brasil", query: "Fortaleza, CE" },
  { slug: "recife", city: "Recife", country: "Brasil", query: "Recife, PE" },
  { slug: "porto-de-galinhas", city: "Porto de Galinhas", country: "Brasil", query: "Porto de Galinhas, PE" },
  { slug: "maceio", city: "Maceió", country: "Brasil", query: "Maceió, AL" },
  { slug: "natal", city: "Natal", country: "Brasil", query: "Natal, RN" },
  { slug: "florianopolis", city: "Florianópolis", country: "Brasil", query: "Florianópolis, SC" },
  { slug: "gramado", city: "Gramado", country: "Brasil", query: "Gramado, RS" },
  { slug: "foz-do-iguacu", city: "Foz do Iguaçu", country: "Brasil", query: "Foz do Iguaçu, PR" },
  { slug: "brasilia", city: "Brasília", country: "Brasil", query: "Brasília, DF" },
  { slug: "buenos-aires", city: "Buenos Aires", country: "Argentina", query: "Buenos Aires, Argentina" },
  { slug: "santiago", city: "Santiago", country: "Chile", query: "Santiago, Chile" },
  { slug: "orlando", city: "Orlando", country: "Estados Unidos", query: "Orlando, Flórida" },
  { slug: "miami", city: "Miami", country: "Estados Unidos", query: "Miami, Flórida" },
  { slug: "nova-york", city: "Nova York", country: "Estados Unidos", query: "Nova York, EUA" },
  { slug: "lisboa", city: "Lisboa", country: "Portugal", query: "Lisboa, Portugal" },
  { slug: "paris", city: "Paris", country: "França", query: "Paris, França" },
  { slug: "madri", city: "Madri", country: "Espanha", query: "Madri, Espanha" },
  { slug: "roma", city: "Roma", country: "Itália", query: "Roma, Itália" },
  { slug: "londres", city: "Londres", country: "Reino Unido", query: "Londres, Reino Unido" },
  { slug: "cancun", city: "Cancún", country: "México", query: "Cancún, México" },
  { slug: "dubai", city: "Dubai", country: "Emirados Árabes", query: "Dubai, Emirados Árabes" },
];

export function getHotelDestination(slug: string): HotelDestination | undefined {
  return HOTEL_DESTINATIONS.find((d) => d.slug === slug.toLowerCase());
}
