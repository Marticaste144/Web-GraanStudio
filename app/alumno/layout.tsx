import { AlumnoProvider } from "@/components/alumno/AlumnoProvider";
import { BottomNav } from "@/components/alumno/BottomNav";

// La vista de alumna está pensada como app de celular: en pantallas grandes se muestra
// centrada, con el ancho de un teléfono.
export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream-alt">
      <div className="relative mx-auto min-h-dvh max-w-[480px] bg-cream pb-24 shadow-[0_0_0_1px_var(--color-line)]">
        <AlumnoProvider>
          {children}
          <BottomNav />
        </AlumnoProvider>
      </div>
    </div>
  );
}
