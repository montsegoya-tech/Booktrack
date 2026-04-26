import type { BookFormat } from "@/types";

export const FORMATS: Record<BookFormat, { label: string; iconPath: string }> = {
  physical:  { label: "Físico",     iconPath: "/icons/booktrack-fisico.svg" },
  ebook:     { label: "Ebook",      iconPath: "/icons/booktrack-ebook.svg" },
  audiobook: { label: "Audiolibro", iconPath: "/icons/booktrack-audiolibro.svg" },
};
