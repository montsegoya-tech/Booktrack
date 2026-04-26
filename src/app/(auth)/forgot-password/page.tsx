import Link from "next/link";
import { BookOpen, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-8 text-center">
      <div className="space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="font-heading text-3xl font-bold">Contraseña olvidada</h1>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 space-y-3 text-left">
        <div className="flex items-center gap-2 text-primary">
          <Mail className="w-4 h-4" />
          <span className="font-medium text-sm">¿Cómo recuperar tu contraseña?</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Contacta con el administrador de la app para que restablezca tu contraseña desde{" "}
          <span className="text-foreground font-medium">Ajustes → Usuarios</span>.
        </p>
        <p className="text-sm text-muted-foreground">
          Email de contacto:{" "}
          <a href="mailto:montsegoya@gmail.com" className="text-primary hover:underline">
            montsegoya@gmail.com
          </a>
        </p>
      </div>

      <Link href="/login" className="block text-sm text-primary hover:underline">
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
