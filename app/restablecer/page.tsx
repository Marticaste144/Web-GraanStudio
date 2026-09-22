import Link from "next/link";
import { RestablecerForm } from "@/components/auth/RestablecerForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Restablecer contraseña · Graan Studio" };

export default async function RestablecerPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        eyebrow="Recuperar acceso"
        titulo="Enlace inválido"
        descripcion="Este enlace de recuperación no es válido. Pedí uno nuevo."
        pie={
          <Link href="/recuperar" className="font-medium text-taupe-dark underline underline-offset-4">
            Pedir un nuevo enlace
          </Link>
        }
      >
        <div />
      </AuthShell>
    );
  }

  return <RestablecerForm token={token} />;
}
