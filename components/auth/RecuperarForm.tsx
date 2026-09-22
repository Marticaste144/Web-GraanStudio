"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import { AuthShell } from "./AuthShell";
import { Campo } from "./Campo";

export function RecuperarForm() {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");

    iniciar(async () => {
      const resultado = await requestPasswordResetAction(email);
      // El mensaje es siempre el mismo, exista o no la cuenta.
      setMensaje(resultado.ok ? resultado.message : resultado.error);
    });
  };

  return (
    <AuthShell
      eyebrow="Recuperar acceso"
      titulo={
        <>
          Olvidaste tu <span className="italic text-sage-deep">contraseña</span>
        </>
      }
      descripcion="Ingresá el email de tu cuenta y te mandamos instrucciones para elegir una nueva."
      pie={
        <Link href="/login" className="font-medium text-taupe-dark underline underline-offset-4">
          Volver a iniciar sesión
        </Link>
      }
    >
      {mensaje ? (
        <p className="text-sm leading-relaxed text-ink-soft">{mensaje}</p>
      ) : (
        <form className="space-y-5" onSubmit={enviar}>
          <Campo label="Email" name="email" type="email" autoComplete="email" required />
          <button type="submit" disabled={pendiente} className="btn btn-primary w-full py-4 disabled:opacity-60">
            {pendiente ? "Enviando…" : "Enviar instrucciones"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
