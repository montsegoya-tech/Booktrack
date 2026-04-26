"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";

export default function LibrarySearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const q = searchParams.get("q") ?? "";

  function update(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set("q", value);
    else p.delete("q");
    p.delete("page");
    router.push(`/library?${p.toString()}`);
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        ref={ref}
        defaultValue={q}
        onChange={(e) => update(e.target.value)}
        placeholder="Buscar en mi biblioteca..."
        className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {q && (
        <button
          onClick={() => { update(""); if (ref.current) ref.current.value = ""; }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
