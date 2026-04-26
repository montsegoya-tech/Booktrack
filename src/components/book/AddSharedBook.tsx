"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookFormat } from "@/types";

interface Props {
  book: {
    olWorkId: string;
    title: string;
    author: string;
    year?: number | null;
    pages?: number | null;
    coverUrl?: string | null;
    isbn?: string | null;
    genres?: string[];
    synopsis?: string | null;
  };
}

export default function AddSharedBook({ book }: Props) {
  const router = useRouter();
  const [format, setFormat] = useState<BookFormat>("physical");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookData: book, format }),
      });
      if (res.status === 409) {
        toast.info("Este libro ya está en tu biblioteca");
        router.push("/library");
        return;
      }
      if (!res.ok) throw new Error();
      const created = await res.json();
      toast.success("Libro añadido a tu biblioteca");
      router.push(`/book/${created.id}`);
    } catch {
      toast.error("Error al añadir el libro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 pt-2">
      <Select value={format} onValueChange={(v) => setFormat(v as BookFormat)}>
        <SelectTrigger className="w-40 bg-surface-raised border-border">
          <SelectValue>
            {format === "physical" ? "📚 Físico" : format === "ebook" ? "📱 Ebook" : "🎧 Audiolibro"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="physical">📚 Físico</SelectItem>
          <SelectItem value="ebook">📱 Ebook</SelectItem>
          <SelectItem value="audiobook">🎧 Audiolibro</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleAdd} disabled={loading}>
        <Plus className="w-4 h-4 mr-1" />
        {loading ? "Añadiendo..." : "Añadir a mi biblioteca"}
      </Button>
    </div>
  );
}
