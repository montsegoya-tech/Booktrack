"use client";

import { useState, useRef } from "react";
import { BookOpen, Pencil, Check, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BookCover({ bookId, coverUrl, title }: { bookId: string; coverUrl: string | null; title: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(coverUrl ?? "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  async function handleSave(url: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverUrl: url.trim() || null }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      setEditing(false);
      toast.success("Portada actualizada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(coverUrl ?? "");
    setEditing(false);
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDraft(dataUrl);
      await handleSave(dataUrl);
    } catch {
      toast.error("Error al leer la imagen");
    }
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const imageFile = Array.from(e.clipboardData.items)
      .find((item) => item.type.startsWith("image/"))
      ?.getAsFile();
    if (imageFile) {
      e.preventDefault();
      await handleImageFile(imageFile);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await handleImageFile(file);
  }

  async function handleUrlBlur() {
    if (draft && draft !== coverUrl) await handleSave(draft);
    else setEditing(false);
  }

  return (
    <div className="relative w-36 shrink-0">
      {/* Cover image */}
      <div className="relative w-36 aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-border shadow-2xl group">
        {draft ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {!editing && (
          <button
            onClick={() => { setEditing(true); setTimeout(() => urlInputRef.current?.focus(), 50); }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {editing && (
        <div
          className="mt-2 space-y-2"
          onPaste={handlePaste}
        >
          {/* Paste / upload zone */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-1 py-3 rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Pega (Ctrl+V)</span>
            <span className="text-[10px] opacity-60">o haz clic para subir</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {/* URL input */}
          <input
            ref={urlInputRef}
            type="url"
            value={draft.startsWith("data:") ? "" : draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder="O pega una URL..."
            className="w-full text-xs px-2 py-1.5 rounded-md border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex gap-2">
            <button onClick={() => handleSave(draft)} disabled={saving} className="text-green-600 hover:opacity-80">
              <Check className="w-4 h-4" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); handleCancel(); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
