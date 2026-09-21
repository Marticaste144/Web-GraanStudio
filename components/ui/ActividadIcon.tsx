import {
  Baby,
  Circle,
  Dumbbell,
  Flower2,
  MoveHorizontal,
  Waves,
  Wind,
  type LucideProps,
} from "lucide-react";
import type { IconoActividad } from "@/lib/data/actividades";

const ICONOS: Record<IconoActividad, React.ComponentType<LucideProps>> = {
  reformer: Waves,
  yoga: Flower2,
  barre: MoveHorizontal,
  stretching: Wind,
  esfera: Circle,
  fullbody: Dumbbell,
  mama: Baby,
};

export function ActividadIcon({ icono, ...props }: { icono: IconoActividad } & LucideProps) {
  const Icon = ICONOS[icono];
  return <Icon strokeWidth={1.4} {...props} />;
}
