"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";

const MOODS = [
  { emoji: "😂", label: "Ligero y divertido" },
  { emoji: "💕", label: "Una historia de amor" },
  { emoji: "😢", label: "Que me haga llorar" },
  { emoji: "🔪", label: "Intriga y suspense" },
  { emoji: "🌍", label: "Aventura y acción" },
  { emoji: "🧠", label: "Reflexivo y profundo" },
  { emoji: "⚡", label: "Que no pueda soltar" },
  { emoji: "🌙", label: "Para evasión total" },
  { emoji: "✨", label: "Que me inspire" },
  { emoji: "🕵️", label: "Misterio y detectives" },
  { emoji: "📖", label: "Clásico de la literatura" },
  { emoji: "🌱", label: "Algo corto" },
];

export default function NextBookModal() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function handleOpen() {
    setOpen(true);
    setSelected(null);
    setText("");
    setError("");
  }

  function handleClose() {
    setOpen(false);
    setSelected(null);
    setText("");
    setError("");
  }

  async function handleSelect(mood: string) {
    if (loading) return;
    setSelected(mood);
    setLoading(true);
    setText("");
    setError("");

    try {
      const res = await fetch("/api/next-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      if (!res.ok) {
        const data = await res.json() as { error: string };
        setError(data.error ?? "Error al obtener sugerencia");
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setText(result);
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSelected(null);
    setText("");
    setError("");
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#079bab] text-white border border-[#068a99] shadow-md hover:brightness-95 active:shadow-none active:translate-y-px transition-all shrink-0"
      >
        <BookOpen className="w-3.5 h-3.5" />
        ¿Qué leer ahora?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#079bab]" />
                <h2 className="font-semibold text-[#1C1008]">¿Qué leer ahora?</h2>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {!selected ? (
                <>
                  <p className="text-sm text-muted-foreground">¿Qué te apetece hoy?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MOODS.map(({ emoji, label }) => (
                      <button
                        key={label}
                        onClick={() => handleSelect(label)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border text-sm text-left hover:border-[#079bab] hover:bg-[#079bab]/5 transition-colors"
                      >
                        <span className="text-lg leading-none">{emoji}</span>
                        <span className="text-[#1C1008]">{label}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{MOODS.find(m => m.label === selected)?.emoji}</span>
                    <span>{selected}</span>
                  </div>

                  {loading && !text && (
                    <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground text-sm">
                      <span className="w-4 h-4 border-2 border-[#079bab]/30 border-t-[#079bab] rounded-full animate-spin" />
                      Buscando el libro perfecto...
                    </div>
                  )}

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  {text && (
                    <div className="text-sm text-[#1C1008] leading-relaxed whitespace-pre-wrap">
                      {text}
                      {loading && <span className="inline-block w-1.5 h-4 bg-[#079bab] ml-0.5 animate-pulse align-middle" />}
                    </div>
                  )}

                  {!loading && (
                    <button
                      onClick={handleReset}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Elegir otra opción
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
