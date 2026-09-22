"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAlumno } from "@/components/alumno/AlumnoProvider";
import { registerAction } from "@/lib/auth/actions";
import { AuthShell } from "./AuthShell";
import { Campo } from "./Campo";

/** Crea una cuenta real (rol STUDENT). El contenido del portal sigue siendo demo por ahora. */
export function RegistroForm() {
  const router = useRouter();
  const toast = useToast();
  const { crearCuenta } = useAlumno();
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const dato = (k: string) => String(f.get(k) ?? "").trim();
    const nombre = dato("nombre");
    const apellido = dato("apellido");
    const email = dato("email");
    const telefono = dato("telefono");
    const password = dato("password");

    iniciar(async () => {
      const resultado = await registerAction({ nombre, apellido, email, password });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      crearCuenta({ nombre, apellido, email, telefono });
      toast(`¡Bienvenida, ${nombre}! Tu cuenta está creada.`);
      router.push(resultado.redirectTo);
      router.refresh();
    });
  };

  return (
    <AuthShell
      eyebrow="Sumate a Graan Studio"
      titulo={
        <>
          Crear <span className="italic text-sage-deep">cuenta</span>
        </>
      }
      descripcion="Es gratis. Con tu cuenta podés elegir tus clases y seguir tu cuota."
      pie={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-taupe-dark underline underline-offset-4">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={enviar}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo label="Nombre" name="nombre" autoComplete="given-name" required placeholder="Tu nombre" />
          <Campo label="Apellido" name="apellido" autoComplete="family-name" required placeholder="Tu apellido" />
        </div>
        <Campo label="Email" name="email" type="email" autoComplete="email" required placeholder="tu@email.com" />
        <Campo label="Teléfono" name="telefono" type="tel" autoComplete="tel" placeholder="+54 9 11 …" />
        <Campo
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={pendiente} className="btn btn-primary w-full py-4 disabled:opacity-60">
          {pendiente ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
    </AuthShell>
  );
}
