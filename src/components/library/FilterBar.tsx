"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { translateGenre } from "@/lib/genres";

export default function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status");
  const genre = searchParams.get("genre");
  const format = searchParams.get("format");
  const language = searchParams.get("language");

  const active = [
    status && { key: "status", label: statusLabel(status) },
    genre && { key: "genre", label: translateGenre(genre) },
    format && { key: "format", label: formatLabel(format) },
    language && { key: "language", label: languageLabel(language) },
  ].filter(Boolean) as { key: string; label: string }[];

  if (active.length === 0) return null;

  function remove(key: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    p.delete("page");
    router.push(`/library?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">Filtros:</span>
      {active.map((f) => (
        <button
          key={f.key}
          onClick={() => remove(f.key)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
        >
          {f.label}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}

function statusLabel(s: string) {
  return { to_read: "Por leer", reading: "Leyendo", read: "Leído" }[s] ?? s;
}

function formatLabel(f: string) {
  return { physical: "Físico", ebook: "Ebook", audiobook: "Audiolibro" }[f] ?? f;
}

function languageLabel(l: string) {
  return { es: "Castellano", ca: "Catalán", en: "Inglés" }[l] ?? l;
}
