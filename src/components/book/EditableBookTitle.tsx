"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EditableBookTitle({ bookId, title }: { bookId: string; title: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draft.trim() }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      toast.success("Título actualizado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function cancel() {
    setDraft(title);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="bg-white border-border text-2xl font-bold font-heading h-auto py-1"
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          autoFocus
        />
        <button onClick={save} disabled={saving} className="text-success hover:opacity-80 shrink-0">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={cancel} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-2 group text-left"
    >
      <h2 className="font-heading text-3xl font-bold text-[#0f172a]">{draft}</h2>
      <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
    </button>
  );
}
