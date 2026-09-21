import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      <AdminSidebar />
      <div className="lg:pl-72">{children}</div>
    </div>
  );
}
