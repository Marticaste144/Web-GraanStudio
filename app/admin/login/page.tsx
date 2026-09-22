import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export const metadata = { title: "Administración · Graan Studio" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Solo se permite volver a rutas del panel de administración (evita open redirects).
  const destino = next && /^\/admin(\/[a-z-]+)?$/.test(next) ? next : "/admin";
  return <AdminLoginForm destino={destino} />;
}
