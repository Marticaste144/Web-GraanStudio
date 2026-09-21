"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAlumno } from "@/components/alumno/AlumnoProvider";
import { ALUMNA_DEMO } from "@/lib/data/alumna";
import { AuthShell } from "./AuthShell";
import { Campo } from "./Campo";

/** Inicio de sesión simulado: no valida nada, entra como la alumna de ejemplo. */
export function LoginForm({ destino }: { destino: string }) {
  const router = useRouter();
  const toast = useToast();
  const { iniciarSesion } = useAlumno();

  return (
    <AuthShell
      eyebrow="Portal de alumnas"
      titulo={
        <>
          Iniciar <span className="italic text-sage-deep">sesión</span>
        </>
      }
      descripcion="Ingresá para ver tus clases, reservar horarios y consultar tu cuota."
      pie={
        <>
          ¿Todavía no tenés cuenta?{" "}
          <Link href="/registro" className="font-medium text-taupe-dark underline underline-offset-4">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          iniciarSesion();
          toast(`¡Hola, ${ALUMNA_DEMO.nombre}! Ya podés ver tus clases.`);
          router.push(destino);
        }}
      >
        <Campo label="Email" name="email" type="email" autoComplete="email" defaultValue={ALUMNA_DEMO.email} />
        <Campo label="Contraseña" name="password" type="password" autoComplete="current-password" defaultValue="demo1234" />
        <button type="submit" className="btn btn-primary w-full py-4">
          Ingresar
        </button>
      </form>
    </AuthShell>
  );
}
