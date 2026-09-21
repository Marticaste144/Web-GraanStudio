import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Iniciar sesión · Graan Studio" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Solo se permite volver a rutas del portal de alumnas.
  const destino = next && /^\/alumno(\/[a-z-]+)?$/.test(next) ? next : "/alumno";
  return <LoginForm destino={destino} />;
}
