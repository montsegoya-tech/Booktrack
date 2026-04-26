"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  }

  const pages = buildPageList(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-border bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            className={`min-w-[36px] h-9 px-2 rounded-md border text-sm font-medium transition-colors ${
              p === currentPage
                ? "bg-[#079bab] text-white border-[#068a99]"
                : "border-border bg-white hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-border bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
