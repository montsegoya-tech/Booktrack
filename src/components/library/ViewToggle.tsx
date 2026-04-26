"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "grid";

  function setView(v: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("view", v);
    router.push(`/library?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
      <button
        onClick={() => setView("grid")}
        className={cn(
          "p-1.5 rounded transition-colors",
          view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => setView("list")}
        className={cn(
          "p-1.5 rounded transition-colors",
          view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
