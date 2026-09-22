import { AlumnosAdmin } from "@/components/admin/AlumnosAdmin";
import { ALUMNAS } from "@/lib/data/admin";

export const metadata = { title: "Alumnos · Administración Graan Studio" };

export default function AdminAlumnos() {
  return <AlumnosAdmin alumnas={ALUMNAS} />;
}
