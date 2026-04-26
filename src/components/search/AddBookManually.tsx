"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BookFormat } from "@/types";

export default function AddBookManually() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    year: "",
    pages: "",
    isbn: "",
    format: "physical" as BookFormat,
  });

  function update(field: string, value: string | BookFormat) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd() {
    if (!form.title.trim() || !form.author.trim()) return;
    setLoading(true);
    try {
      const id = `manual:${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookData: {
            olWorkId: id,
            title: form.title.trim(),
            author: form.author.trim(),
            year: form.year ? parseInt(form.year) : null,
            pages: form.pages ? parseInt(form.pages) : null,
            isbn: form.isbn.trim() || null,
            coverUrl: null,
            genres: [],
            synopsis: null,
            source: "manual",
          },
          format: form.format,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      toast.success("Libro añadido");
      setOpen(false);
      router.push(`/book/${created.id}`);
    } catch {
      toast.error("Error al añadir el libro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-[#0f172a] hover:text-foreground transition-colors group"
      >
        <PlusCircle className="w-4 h-4 text-[#ce433d] group-hover:scale-110 transition-transform" />
        ¿No encuentras el libro? Añádelo manualmente
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#ce433d]">Añadir libro manualmente</DialogTitle>
            <DialogDescription>Rellena los datos que tengas disponibles</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[#0f172a]">Título *</label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="El nombre de la rosa"
                className="bg-[#f0dcdc] border-border"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#0f172a]">Autor *</label>
              <Input
                value={form.author}
                onChange={(e) => update("author", e.target.value)}
                placeholder="Umberto Eco"
                className="bg-[#f0dcdc] border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[#0f172a]">Año</label>
                <Input
                  value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  placeholder="1980"
                  type="number"
                  className="bg-[#f0dcdc] border-border"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[#0f172a]">Páginas</label>
                <Input
                  value={form.pages}
                  onChange={(e) => update("pages", e.target.value)}
                  placeholder="502"
                  type="number"
                  className="bg-[#f0dcdc] border-border"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#0f172a]">ISBN</label>
              <Input
                value={form.isbn}
                onChange={(e) => update("isbn", e.target.value)}
                placeholder="978-..."
                className="bg-[#f0dcdc] border-border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#0f172a]">Formato</label>
              <Select value={form.format} onValueChange={(v) => update("format", v as BookFormat)}>
                <SelectTrigger className="bg-[#f0dcdc] border-border">
                  <SelectValue>
                    {form.format === "physical" ? "Físico" : form.format === "ebook" ? "Ebook" : "Audiolibro"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Físico</SelectItem>
                  <SelectItem value="ebook">Ebook</SelectItem>
                  <SelectItem value="audiobook">Audiolibro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={loading || !form.title.trim() || !form.author.trim()} className="bg-[#ce433d] hover:bg-[#b83530] text-white border-0">
              {loading ? "Añadiendo..." : "Añadir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
