import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegistroForm } from "@/components/auth/RegistroForm";
import { REGISTRO_PUBLICO_HABILITADO } from "@/lib/auth/feature-flags";

export const metadata = { title: "Crear cuenta · Graan Studio" };

export default function RegistroPage() {
  if (!REGISTRO_PUBLICO_HABILITADO) {
    return (
      <AuthShell
        eyebrow="Sumate a Graan Studio"
        titulo="Alta de cuentas"
        descripcion="Por ahora las cuentas de alumnas se crean desde el estudio. Escribinos y te damos de alta."
        pie={
          <Link href="/login" className="font-medium text-taupe-dark underline underline-offset-4">
            Ya tengo cuenta: iniciar sesión
          </Link>
        }
      >
        <div />
      </AuthShell>
    );
  }

  return <RegistroForm />;
}
