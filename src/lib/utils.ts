import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatYear(year: number | null): string {
  if (!year) return "Año desconocido";
  return String(year);
}

export function formatPages(pages: number | null): string {
  if (!pages) return "";
  return `${pages} páginas`;
}
