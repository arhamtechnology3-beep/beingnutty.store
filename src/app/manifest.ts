import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Premium Dry Fruits`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6efe2",
    theme_color: "#f6efe2",
    lang: "en-IN",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/logo-square.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
