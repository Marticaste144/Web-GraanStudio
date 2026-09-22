"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth/actions";
import { AuthShell } from "./AuthShell";
import { Campo } from "./Campo";

export function AdminLoginForm({ destino }: { destino: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "");
    const password = String(f.get("password") ?? "");

    iniciar(async () => {
      const resultado = await loginAction("admin", email, password);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.push(resultado.redirectTo === "/admin" ? destino : resultado.redirectTo);
      router.refresh();
    });
  };

  return (
    <AuthShell
      eyebrow="Administración"
      titulo={
        <>
          Panel de <span className="italic text-sage-deep">administración</span>
        </>
      }
      descripcion="Acceso exclusivo para el equipo de Graan Studio."
      pie={
        <Link href="/" className="font-medium text-taupe-dark underline underline-offset-4">
          Volver al sitio
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={enviar}>
        <Campo label="Email" name="email" type="email" autoComplete="email" required />
        <Campo label="Contraseña" name="password" type="password" autoComplete="current-password" required />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="text-right">
          <Link href="/recuperar" className="text-xs text-ink-soft underline underline-offset-4 hover:text-taupe-dark">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <button type="submit" disabled={pendiente} className="btn btn-primary w-full py-4 disabled:opacity-60">
          {pendiente ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </AuthShell>
  );
}
