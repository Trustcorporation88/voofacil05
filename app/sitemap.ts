import { MetadataRoute } from "next";
import { POPULAR_ROUTES, getRouteSlug } from "@/lib/popular-routes";
import { HOTEL_DESTINATIONS } from "@/lib/hotel-destinations";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.voofacil.online";
  const now = new Date();

  // Enderecos com "#" nao sao paginas distintas para o Google, por isso ficam fora.
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/hoteis`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const routePages: MetadataRoute.Sitemap = POPULAR_ROUTES.map((route) => ({
    url: `${baseUrl}/voos/${getRouteSlug(route)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const hotelPages: MetadataRoute.Sitemap = HOTEL_DESTINATIONS.map((d) => ({
    url: `${baseUrl}/hoteis/${d.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...routePages, ...hotelPages];
}
