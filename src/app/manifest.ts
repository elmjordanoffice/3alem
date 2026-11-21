import type { MetadataRoute } from "next";

/** PWA manifest. Icons are rendered by npm run brand:assets (scripts/brand-render.spec.ts). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aalim",
    short_name: "Aalim",
    description: "Adaptive skills assessment. Evidence, not impressions.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f2f0eb",
    theme_color: "#141414",
    icons: [
      { src: "/brand/symbol-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/symbol-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/symbol-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/brand/symbol.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
