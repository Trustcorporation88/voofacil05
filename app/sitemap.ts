import { MetadataRoute } from "next";
import { POPULAR_ROUTES, getRouteSlug } from "@/lib/popular-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.voofacil.online";
  const now = new Date();

  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#busca`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#beneficios`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/#como-funciona`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/#faq`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  const routePages = POPULAR_ROUTES.map((route) => ({
    url: `${baseUrl}/voos/${getRouteSlug(route)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...routePages];
}


