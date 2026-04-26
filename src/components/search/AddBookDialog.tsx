"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BookSearchItem } from "@/types";

export default function AddBookDialog({
  book,
  open,
  onOpenChange,
}: {
  book: BookSearchItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          book.source === "openlibrary"
            ? { olWorkId: book.olWorkId }
            : { bookData: book }
        ),
      });
      if (res.status === 409) {
        toast.error("Este libro ya está en tu lista");
        onOpenChange(false);
        return;
      }
      if (!res.ok) throw new Error();
      const created = await res.json();
      toast.success("Libro añadido");
      onOpenChange(false);
      router.push(`/book/${created.id}`);
    } catch {
      toast.error("Error al añadir el libro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir a tu biblioteca</DialogTitle>
          <DialogDescription>Confirma los datos antes de guardar</DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 py-2">
          <div className="w-16 h-24 rounded overflow-hidden bg-surface border border-border shrink-0">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                width={64}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-medium leading-tight">{book.title}</p>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            {book.year && <p className="text-xs text-muted-foreground">{book.year}</p>}
            {book.pages && <p className="text-xs text-muted-foreground">{book.pages} páginas</p>}
          </div>
        </div>

<DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={loading}>
            <Plus className="w-4 h-4 mr-1" />
            {loading ? "Añadiendo..." : "Añadir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
