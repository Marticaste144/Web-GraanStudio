"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "@/lib/auth/actions";
import { AuthShell } from "./AuthShell";
import { Campo } from "./Campo";

export function RestablecerForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    const confirmar = String(f.get("confirmar") ?? "");

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    iniciar(async () => {
      const resultado = await resetPasswordAction(token, password);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.push(`${resultado.redirectTo}?recuperada=1`);
    });
  };

  return (
    <AuthShell
      eyebrow="Recuperar acceso"
      titulo={
        <>
          Elegí una nueva <span className="italic text-sage-deep">contraseña</span>
        </>
      }
      pie={
        <Link href="/login" className="font-medium text-taupe-dark underline underline-offset-4">
          Volver a iniciar sesión
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={enviar}>
        <Campo
          label="Nueva contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
        />
        <Campo label="Confirmar contraseña" name="confirmar" type="password" autoComplete="new-password" required />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={pendiente} className="btn btn-primary w-full py-4 disabled:opacity-60">
          {pendiente ? "Guardando…" : "Guardar nueva contraseña"}
        </button>
      </form>
    </AuthShell>
  );
}
