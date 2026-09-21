import { AlumnoShell } from "@/components/alumno/AlumnoShell";

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  return <AlumnoShell>{children}</AlumnoShell>;
}
