"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPass.length < 6) { toast.error("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (newPass !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      if (res.status === 401) { toast.error("Contraseña actual incorrecta"); return; }
      if (!res.ok) throw new Error();
      toast.success("Contraseña actualizada");
      setCurrent(""); setNewPass(""); setConfirm("");
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 bg-white border-b border-border flex items-center gap-3 px-6 py-5">
        <div className="w-9 h-9 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <KeyRound className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold leading-tight">Ajustes</h1>
          <p className="text-xs text-muted-foreground">Gestión de cuenta</p>
        </div>
      </header>

      <div className="p-6 max-w-lg space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Cambiar contraseña
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Contraseña actual</label>
              <Input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Nueva contraseña (mín. 6 caracteres)</label>
              <Input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Confirmar nueva contraseña</label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••"
                className="bg-background border-border"
              />
            </div>
            <Button type="submit" disabled={saving || !current || !newPass || !confirm}>
              {saving ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
