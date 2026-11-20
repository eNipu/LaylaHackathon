import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Layla | Build something people use",
    short_name: "Layla",
    description: "Turn an idea into a first-user launch plan. No signup required.",
    start_url: "/", scope: "/", display: "standalone",
    background_color: "#fafaf6", theme_color: "#1b211b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
