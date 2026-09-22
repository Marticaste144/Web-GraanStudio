import { CambiarContrasenaForm } from "@/components/auth/CambiarContrasenaForm";
import { requireAnyUser } from "@/lib/auth/guard";

export const metadata = { title: "Cambiar contraseña · Graan Studio" };

export default async function CambiarContrasenaPage() {
  const user = await requireAnyUser("/login");
  return <CambiarContrasenaForm obligatorio={user.mustChangePassword} />;
}
