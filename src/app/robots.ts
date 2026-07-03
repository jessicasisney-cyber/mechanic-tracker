import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/api", "/track", "/login"],
      },
    ],
    sitemap: "https://mechanic-tracker.vercel.app/sitemap.xml",
  };
}
