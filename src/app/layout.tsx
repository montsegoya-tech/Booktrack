import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booktrack",
  description: "Tu lista de lectura personal",
  icons: {
    icon: [
      { url: "/png/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/png/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/png/icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/png/icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/png/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/png/icon-120.png", sizes: "120x120", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <Toaster theme="light" position="bottom-right" />
      </body>
    </html>
  );
}
