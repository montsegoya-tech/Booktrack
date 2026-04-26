"use client";

import { useState } from "react";

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface Props {
  dataByYear: Record<number, number[]>;
  availableYears: number[];
  defaultYear: number;
}

export function MonthlyReadingChart({ dataByYear, availableYears, defaultYear }: Props) {
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const byMonth = dataByYear[selectedYear] ?? Array(12).fill(0);
  const maxMonth = Math.max(...byMonth, 1);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Leídos por mes
        </h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-xl border border-border bg-[var(--surface)] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {byMonth.map((count, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/50"
              style={{ height: count > 0 ? `${(count / maxMonth) * 80}px` : "3px", opacity: count > 0 ? 1 : 0.15 }}
            />
            <span className="text-[10px] text-muted-foreground">{MONTH_NAMES[i]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
