"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "@/lib/auth/actions";
import { AuthShell } from "./AuthShell";
import { Campo } from "./Campo";

export function CambiarContrasenaForm({ obligatorio }: { obligatorio: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const actual = String(f.get("actual") ?? "");
    const nueva = String(f.get("nueva") ?? "");
    const confirmar = String(f.get("confirmar") ?? "");

    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    iniciar(async () => {
      const resultado = await changePasswordAction(actual, nueva);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.push(resultado.redirectTo);
      router.refresh();
    });
  };

  return (
    <AuthShell
      eyebrow="Tu cuenta"
      titulo={
        <>
          Cambiar <span className="italic text-sage-deep">contraseña</span>
        </>
      }
      descripcion={
        obligatorio
          ? "Por seguridad, tenés que elegir una contraseña nueva antes de continuar."
          : "Elegí una nueva contraseña para tu cuenta."
      }
      pie={<></>}
    >
      <form className="space-y-5" onSubmit={enviar}>
        <Campo label="Contraseña actual" name="actual" type="password" autoComplete="current-password" required />
        <Campo
          label="Contraseña nueva"
          name="nueva"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
        />
        <Campo label="Confirmar contraseña nueva" name="confirmar" type="password" autoComplete="new-password" required />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={pendiente} className="btn btn-primary w-full py-4 disabled:opacity-60">
          {pendiente ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </AuthShell>
  );
}
