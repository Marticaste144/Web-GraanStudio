import { AdminAlumnasProvider } from "@/components/admin/AdminAlumnasProvider";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ClasesProvider } from "@/components/admin/ClasesProvider";
import { requireRole } from "@/lib/auth/guard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protección real del lado servidor (además del middleware): sin sesión válida con rol
  // OWNER/ADMIN no se llega a renderizar nada de acá para abajo.
  const user = await requireRole("admin:access", {
    unauthenticatedRedirect: "/admin/login",
    unauthorizedRedirect: "/",
  });

  return (
    <AdminSessionProvider value={{ role: user.role, displayName: user.displayName }}>
      <div className="min-h-dvh bg-cream">
        <AdminSidebar />
        <div className="lg:pl-72">
          <AdminAlumnasProvider>
            <ClasesProvider>{children}</ClasesProvider>
          </AdminAlumnasProvider>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
