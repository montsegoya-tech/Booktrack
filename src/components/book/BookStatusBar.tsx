"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Check, X, Library, Share2, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { translateGenre } from "@/lib/genres";
import type { BookSelect } from "@/lib/db/schema";
import type { ReadStatus } from "@/types";

const ALL_GENRES = [
  "Fiction", "Nonfiction", "Fantasy", "Science Fiction", "Mystery", "Thriller",
  "Horror", "Romance", "Drama", "Comedy", "Adventure", "Poetry", "Short Stories",
  "Graphic Novel", "Young Adult", "Historical Fiction",
  "Classic Literature", "Spanish Literature", "Catalan Literature", "Latin American Literature",
  "English Literature",
  "History", "Biography", "Autobiography", "Memoir", "Philosophy", "Psychology",
  "Science", "Technology", "Politics", "Economics", "Business", "Self-help",
  "Health", "Mental Health", "Sex", "Travel", "Cooking", "Art", "Music", "Sports", "Religion", "Suspense",
  "Feminism", "Social Issues", "Coming of Age", "Family", "Love", "War", "Relationships",
];

type Language = "es" | "ca" | "en";

const LANGUAGE_LABEL: Record<Language, string> = {
  es: "Castellano",
  ca: "Catalán",
  en: "Inglés",
};

export default function BookStatusBar({ book }: { book: BookSelect }) {
  const router = useRouter();
  const [status, setStatus] = useState<ReadStatus>(book.status as ReadStatus);
const [language, setLanguage] = useState<Language | null>((book.language as Language) ?? null);
  const [rating, setRating] = useState<number | null>(book.rating);
  const [notes, setNotes] = useState(book.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [refetching, setRefetching] = useState(false);

  const now = new Date();
  const existingReadAt = book.readAt ? new Date(book.readAt) : null;
  const [readAt, setReadAt] = useState<Date | null>(existingReadAt);
  const [showReadDateDialog, setShowReadDateDialog] = useState(false);
  const [readMonth, setReadMonth] = useState(existingReadAt ? existingReadAt.getMonth() + 1 : now.getMonth() + 1);
  const [readYear, setReadYear] = useState(existingReadAt ? existingReadAt.getFullYear() : now.getFullYear());
  const [genres, setGenres] = useState<string[]>(book.genres ?? []);
  const [showGenreSelect, setShowGenreSelect] = useState(false);

// Synopsis editing
  const [editingSynopsis, setEditingSynopsis] = useState(false);
  const [synopsisDraft, setSynopsisDraft] = useState(book.synopsis ?? "");
  const cancelSynopsisRef = useRef(false);

  async function patch(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      toast.success("Guardado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleRating(r: number | null) {
    setRating(r);
    await patch({ rating: r });
  }

  async function handleSaveNotes() {
    await patch({ notes });
  }

  function handleShare() {
    const url = `${window.location.origin}/share/${book.id}`;
    const text = `Te recomiendo "${book.title}" de ${book.author} — ábrelo en Booktrack: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function handleRefetch() {
    setRefetching(true);
    try {
      const res = await fetch(`/api/books/${book.id}/refetch`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { updated: boolean; message?: string };
      if (data.updated) {
        toast.success("Datos completados desde Open Library");
        router.refresh();
      } else {
        toast.info(data.message ?? "No hay datos nuevos disponibles");
      }
    } catch {
      toast.error("Error al buscar datos");
    } finally {
      setRefetching(false);
    }
  }

  async function handleAddGenre(genre: string) {
    if (genres.includes(genre)) return;
    const updated = [...genres, genre];
    setGenres(updated);
    setShowGenreSelect(false);
    await patch({ genres: updated });
  }

  async function handleRemoveGenre(genre: string) {
    const updated = genres.filter((g) => g !== genre);
    setGenres(updated);
    await patch({ genres: updated });
  }

async function handleSaveSynopsis() {
    await patch({ synopsis: synopsisDraft.trim() || null });
    setEditingSynopsis(false);
  }

  function handleCancelSynopsis() {
    cancelSynopsisRef.current = true;
    setSynopsisDraft(book.synopsis ?? "");
    setEditingSynopsis(false);
  }

  async function handleSynopsisBlur() {
    if (cancelSynopsisRef.current) {
      cancelSynopsisRef.current = false;
      return;
    }
    await patch({ synopsis: synopsisDraft.trim() || null });
    setEditingSynopsis(false);
  }

  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  async function handleConfirmReadDate() {
    const date = new Date(readYear, readMonth - 1, 1);
    setStatus("read");
    setReadAt(date);
    setShowReadDateDialog(false);
    await patch({ status: "read", readAt: date.toISOString() });
  }

  return (
    <>
    <Dialog open={showReadDateDialog} onOpenChange={setShowReadDateDialog}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">¿Cuándo terminaste este libro?</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <Select value={String(readMonth)} onValueChange={(v) => setReadMonth(Number(v))}>
            <SelectTrigger className="flex-1 bg-white border-border">
              <SelectValue>{MONTHS[readMonth - 1]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(readYear)} onValueChange={(v) => setReadYear(Number(v))}>
            <SelectTrigger className="w-28 bg-white border-border">
              <SelectValue>{readYear}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleConfirmReadDate} disabled={saving} className="flex-1 bg-primary text-white hover:opacity-90">
            Confirmar
          </Button>
          <Button variant="outline" onClick={() => setShowReadDateDialog(false)} className="flex-1">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    <div className="space-y-6">
{/* Synopsis */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider bg-[#f2c8c8]/70 px-2 py-1 rounded-md w-fit mb-[10px]">Sinopsis</label>
        {editingSynopsis ? (
          <div className="space-y-2">
            <Textarea
              value={synopsisDraft}
              onChange={(e) => setSynopsisDraft(e.target.value)}
              onBlur={handleSynopsisBlur}
              className="bg-white border-border text-sm leading-relaxed min-h-[120px]"
              placeholder="Escribe una sinopsis..."
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveSynopsis} disabled={saving} className="text-success hover:opacity-80">
                <Check className="w-4 h-4" />
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleCancelSynopsis(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : synopsisDraft ? (
          <button
            onClick={() => setEditingSynopsis(true)}
            className="flex items-start gap-2 text-sm group text-left w-full"
          >
            <span className="text-[#0f172a] leading-relaxed text-justify">{synopsisDraft}</span>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity mt-0.5" />
          </button>
        ) : (
          <button
            onClick={() => setEditingSynopsis(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir sinopsis
          </button>
        )}
      </div>

      {/* Status + Format + Language */}
      <div className="flex flex-wrap gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider bg-[#f2c8c8]/70 px-2 py-1 rounded-md w-fit mb-[10px]">Estado</label>
          <Select
            value={status}
            onValueChange={(v) => {
              if (v === "read") {
                setShowReadDateDialog(true);
              } else {
                setStatus(v as ReadStatus);
                patch({ status: v });
              }
            }}
          >
            <SelectTrigger className="w-40 bg-white border-border">
              <SelectValue>
                {status === "to_read" ? "Por leer" : status === "reading" ? "Leyendo" : "Leído"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="to_read">Por leer</SelectItem>
              <SelectItem value="reading">Leyendo</SelectItem>
              <SelectItem value="read">Leído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {status === "read" && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider bg-[#f2c8c8]/70 px-2 py-1 rounded-md w-fit mb-[10px]">Fecha de lectura</label>
            <button
              onClick={() => {
                if (readAt) {
                  setReadMonth(readAt.getMonth() + 1);
                  setReadYear(readAt.getFullYear());
                }
                setShowReadDateDialog(true);
              }}
              className="flex items-center gap-2 w-auto h-9 px-3 rounded-md border border-border bg-white text-sm hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className={`whitespace-nowrap ${readAt ? "text-foreground" : "text-muted-foreground"}`}>
                {readAt ? `${MONTHS[readAt.getMonth()]} ${readAt.getFullYear()}` : "Sin fecha"}
              </span>
            </button>
          </div>
        )}

<div className="space-y-2">
          <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider bg-[#f2c8c8]/70 px-2 py-1 rounded-md w-fit mb-[10px]">Idioma</label>
          <Select
            value={language ?? ""}
            onValueChange={(v) => {
              setLanguage(v as Language);
              patch({ language: v });
            }}
          >
            <SelectTrigger className="w-40 bg-white border-border">
              <SelectValue placeholder="Sin especificar">
                {language ? LANGUAGE_LABEL[language] : "Sin especificar"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Castellano</SelectItem>
              <SelectItem value="ca">Catalán</SelectItem>
              <SelectItem value="en">Inglés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider bg-[#f2c8c8]/70 px-2 py-1 rounded-md w-fit mb-[10px]">Géneros</label>
        <div className="flex flex-wrap gap-1.5 items-center">
          {genres.map((g) => (
            <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#079bab] text-white border border-[#079bab]">
              {translateGenre(g)}
              <button onClick={() => handleRemoveGenre(g)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {showGenreSelect ? (
            <Select onValueChange={(v) => { if (v) handleAddGenre(v as string); }} open onOpenChange={(o) => !o && setShowGenreSelect(false)}>
              <SelectTrigger className="w-52 h-7 text-xs bg-white border-border">
                <SelectValue placeholder="Elegir género..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_GENRES.filter((g) => !genres.includes(g)).map((g) => (
                  <SelectItem key={g} value={g}>{translateGenre(g)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <button
              onClick={() => setShowGenreSelect(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#079bab]/40 border border-dashed border-[#079bab]/60 text-[#0f172a] hover:bg-[#079bab]/60 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Añadir
            </button>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider bg-[#f2c8c8]/70 px-2 py-1 rounded-md w-fit mb-[10px]">Rating</label>
        <StarRating value={rating} bookId={book.id} onUpdate={handleRating} />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#1F2937] uppercase tracking-wider bg-[#f2c8c8]/70 px-2 py-1 rounded-md w-fit mb-[10px]">Notas personales</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Añade tus impresiones..."
          className="bg-white border-border min-h-24 resize-none"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSaveNotes}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#079bab] text-white border border-[#068a99] shadow-md active:shadow-none active:translate-y-px transition-all hover:brightness-95 disabled:opacity-50"
          >
            Guardar notas
          </button>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#079bab] text-white border border-[#068a99] shadow-md active:shadow-none active:translate-y-px transition-all hover:brightness-95"
          >
            <Library className="w-3.5 h-3.5" />
            Volver a mi biblioteca
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#079bab] text-white border border-[#068a99] shadow-md active:shadow-none active:translate-y-px transition-all hover:brightness-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartir
          </button>
          <button
            onClick={handleRefetch}
            disabled={refetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#079bab] text-white border border-[#068a99] shadow-md active:shadow-none active:translate-y-px transition-all hover:brightness-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refetching ? "animate-spin" : ""}`} />
            {refetching ? "Buscando..." : "Completar datos"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
