import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin-panel"],
      },
    ],
    sitemap: "https://www.voofacil.online/sitemap.xml",
    host: "https://www.voofacil.online",
  };
}
