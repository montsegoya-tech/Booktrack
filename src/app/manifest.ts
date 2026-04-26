import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Booktrack",
    short_name: "Booktrack",
    description: "Tu lista de lectura personal",
    start_url: "/library",
    display: "standalone",
    background_color: "#0A0A0F",
    theme_color: "#0A0A0F",
    icons: [
      {
        src: "/png/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/png/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/png/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
