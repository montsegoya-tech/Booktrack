"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddBookDialog from "./AddBookDialog";
import type { BookSearchItem } from "@/types";

export default function SearchResultCard({ book }: { book: BookSearchItem }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface hover:bg-surface-raised transition-colors">
        <div className="w-14 h-20 rounded overflow-hidden bg-muted shrink-0">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              width={56}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="font-medium line-clamp-1">{book.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {book.year && <span>{book.year}</span>}
            {book.pages && <span>·</span>}
            {book.pages && <span>{book.pages} págs.</span>}
            {book.source === "google" && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium">Google Books</span>
            )}
            {book.source === "openlibrary" && (
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">Open Library</span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Añadir
        </Button>
      </div>

      <AddBookDialog book={book} open={open} onOpenChange={setOpen} />
    </>
  );
}
