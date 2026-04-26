"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  alreadyOwned: boolean;
  ownedBookId?: string;
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

export default function AddSharedBook({ alreadyOwned, ownedBookId, book }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (alreadyOwned) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
          <BookCheck className="w-4 h-4 shrink-0" />
          Ya tienes este libro en tu biblioteca
        </div>
        {ownedBookId && (
          <Link
            href={`/book/${ownedBookId}`}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium text-center hover:opacity-90 transition-opacity"
          >
            Ver libro
          </Link>
        )}
      </div>
    );
  }

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookData: book, format: "physical" }),
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
    <div className="pt-2">
      <Button onClick={handleAdd} disabled={loading}>
        <Plus className="w-4 h-4 mr-1" />
        {loading ? "Añadiendo..." : "Añadir a mi biblioteca"}
      </Button>
    </div>
  );
}
