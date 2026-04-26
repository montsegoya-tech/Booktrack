"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

export default function RecommendationsModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function fetchRecommendations() {
    setOpen(true);
    if (text) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recommendations");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al obtener recomendaciones");
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

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={fetchRecommendations}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#079bab] text-white border border-[#068a99] shadow-md hover:brightness-95 active:shadow-none active:translate-y-px transition-all shrink-0"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Recomendaciones IA
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#079bab]" />
                <h2 className="font-semibold text-[#1C1008]">Recomendaciones para ti</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {loading && !text && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <Sparkles className="w-6 h-6 animate-pulse text-[#079bab]" />
                  <p className="text-sm">Analizando tus lecturas...</p>
                </div>
              )}
              {error && (
                <p className="text-sm text-red-500 text-center py-8">{error}</p>
              )}
              {text && (
                <div className="text-sm text-[#1C1008] leading-relaxed whitespace-pre-wrap">
                  {text}
                  {loading && <span className="inline-block w-1.5 h-4 bg-[#079bab] ml-0.5 animate-pulse align-middle" />}
                </div>
              )}
            </div>

            {!loading && text && (
              <div className="px-6 py-4 border-t border-border shrink-0">
                <button
                  onClick={() => { setText(""); setOpen(false); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Actualizar recomendaciones
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
