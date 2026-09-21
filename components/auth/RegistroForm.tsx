"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAlumno } from "@/components/alumno/AlumnoProvider";
import { AuthShell } from "./AuthShell";
import { Campo } from "./Campo";

/** Creación de cuenta simulada: no se guarda nada, arranca un portal vacío en memoria. */
export function RegistroForm() {
  const router = useRouter();
  const toast = useToast();
  const { crearCuenta } = useAlumno();

  return (
    <AuthShell
      eyebrow="Sumate a Graan Studio"
      titulo={
        <>
          Crear <span className="italic text-sage-dark">cuenta</span>
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
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const dato = (k: string) => String(f.get(k) ?? "").trim();
          crearCuenta({
            nombre: dato("nombre"),
            apellido: dato("apellido"),
            email: dato("email"),
            telefono: dato("telefono"),
          });
          toast(`¡Bienvenida, ${dato("nombre")}! Tu cuenta está creada.`);
          router.push("/alumno");
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo label="Nombre" name="nombre" autoComplete="given-name" required placeholder="Tu nombre" />
          <Campo label="Apellido" name="apellido" autoComplete="family-name" required placeholder="Tu apellido" />
        </div>
        <Campo label="Email" name="email" type="email" autoComplete="email" required placeholder="tu@email.com" />
        <Campo label="Teléfono" name="telefono" type="tel" autoComplete="tel" placeholder="+54 9 11 …" />
        <Campo label="Contraseña" name="password" type="password" autoComplete="new-password" required placeholder="Mínimo 8 caracteres" />
        <button type="submit" className="btn btn-primary w-full py-4">
          Crear cuenta
        </button>
      </form>
    </AuthShell>
  );
}
