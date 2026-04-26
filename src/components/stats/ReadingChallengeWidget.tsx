"use client";

import { useState } from "react";
import { Trophy, Target, TrendingUp, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  year: number;
  initialGoal: number | null;
  booksReadThisYear: number;
}

export function ReadingChallengeWidget({ year, initialGoal, booksReadThisYear }: Props) {
  const [goal, setGoal] = useState(initialGoal);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(initialGoal ?? ""));
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const pct = goal ? Math.min(Math.round((booksReadThisYear / goal) * 100), 100) : 0;

  const now = new Date();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  const totalMs = endOfYear.getTime() - startOfYear.getTime();
  const elapsedMs = now.getTime() - startOfYear.getTime();
  const yearPct = Math.max(0, Math.min(elapsedMs / totalMs, 1));

  const expectedBooks = goal ? goal * yearPct : 0;
  const isOnTrack = booksReadThisYear >= expectedBooks;
  const isCompleted = goal !== null && booksReadThisYear >= goal;

  const monthsElapsed = yearPct * 12;
  const currentPace = monthsElapsed > 0 ? booksReadThisYear / monthsElapsed : 0;
  const monthsRemaining = 12 - monthsElapsed;
  const booksNeeded = goal ? Math.max(0, goal - booksReadThisYear) : 0;
  const neededPace = monthsRemaining > 0 && booksNeeded > 0 ? booksNeeded / monthsRemaining : 0;

  const handleSave = async () => {
    const n = parseInt(input, 10);
    if (isNaN(n) || n < 1 || n > 9999) return;
    setSaving(true);
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, goal: n }),
    });
    setGoal(n);
    setEditing(false);
    setSaving(false);
    router.refresh();
  };

  if (!goal || editing) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Reto lector {year}
        </h2>
        {!goal && (
          <p className="text-sm text-muted-foreground">
            Fija tu objetivo de libros para {year} y sigue tu progreso.
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="number"
            min="1"
            max="9999"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="¿Cuántos libros?"
            className="w-40 rounded-xl border border-border bg-[var(--surface)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary text-white px-5 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "Guardando..." : goal ? "Actualizar" : "Fijar reto"}
          </button>
          {goal && (
            <button
              onClick={() => { setEditing(false); setInput(String(goal)); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Reto lector {year}
        </h2>
        <button
          onClick={() => { setEditing(true); setInput(String(goal)); }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Editar
        </button>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-5xl font-bold font-heading">{booksReadThisYear}</span>
        <span className="text-2xl text-muted-foreground mb-1">/ {goal}</span>
        <span className="text-sm text-muted-foreground mb-2">libros</span>
      </div>

      <div className="space-y-1.5">
        <div className="relative h-3 rounded-full bg-black/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/25"
            style={{ left: `${Math.round(yearPct * 100)}%` }}
            title={`${Math.round(yearPct * 100)}% del año transcurrido`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{pct}% completado</span>
          <span>{Math.round(yearPct * 100)}% del año</span>
        </div>
      </div>

      <div
        className={`rounded-2xl px-4 py-3 text-sm flex items-center gap-2 font-medium ${
          isCompleted
            ? "bg-green-500/10 text-green-600"
            : isOnTrack
            ? "bg-primary/10 text-primary"
            : "bg-orange-500/10 text-orange-600"
        }`}
      >
        {isCompleted ? (
          <><Trophy className="w-4 h-4 shrink-0" /> ¡Reto completado! Increíble.</>
        ) : isOnTrack ? (
          <><TrendingUp className="w-4 h-4 shrink-0" /> Vas bien encaminada · llevas el {Math.round(yearPct * 100)}% del año</>
        ) : (
          <><Target className="w-4 h-4 shrink-0" /> Necesitas {neededPace.toFixed(1)} libros/mes para llegar</>
        )}
      </div>

      {!isCompleted && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--surface)] p-3.5">
            <p className="text-xs text-muted-foreground mb-0.5">Ritmo actual</p>
            <p className="text-lg font-semibold leading-tight">
              {currentPace.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground ml-1">libros/mes</span>
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--surface)] p-3.5">
            <p className="text-xs text-muted-foreground mb-0.5">Ritmo necesario</p>
            <p className="text-lg font-semibold leading-tight">
              {booksNeeded > 0 ? neededPace.toFixed(1) : "—"}
              <span className="text-xs font-normal text-muted-foreground ml-1">libros/mes</span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
