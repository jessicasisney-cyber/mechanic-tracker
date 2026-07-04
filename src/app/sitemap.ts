import type { MetadataRoute } from "next";

const baseUrl = "https://mechanic-tracker.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/services", "/testimonials", "/about", "/contact"];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
