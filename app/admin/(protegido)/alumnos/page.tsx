import { AlumnasRealesAdmin } from "@/components/admin/AlumnasRealesAdmin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Alumnos · Administración Graan Studio" };
export const dynamic = "force-dynamic";

// Orden alfabético por nombre (A→Z), sin distinguir mayúsculas/minúsculas ni tildes.
// Se hace acá (en el servidor, sobre el resultado ya traído de Supabase) con Intl.Collator en vez
// de un COLLATE de Postgres: Collator es estándar de Node/V8, no depende de que la base tenga
// instalada una collation ICU específica (algo que sí podría faltar y romper la consulta).
const collator = new Intl.Collator("es", { sensitivity: "base" });

export default async function AdminAlumnos() {
  const alumnasDb = await prisma.alumna.findMany({
    include: { comprasPack: { orderBy: { fechaInicio: "desc" }, take: 1 } },
  });

  const alumnas = alumnasDb
    .map((a) => {
      const packActual = a.comprasPack[0];
      return {
        id: a.id, nombre: a.nombre, apellido: a.apellido, telefono: a.telefono, dni: a.dni, email: a.email,
        activa: a.activa,
        packResumen: packActual ? `${packActual.clasesContratadas} clases` : null,
      };
    })
    .sort((a, b) => collator.compare(a.nombre, b.nombre) || collator.compare(a.apellido, b.apellido));

  return <AlumnasRealesAdmin alumnas={alumnas} activas={alumnas.filter((a) => a.activa).length} inactivas={alumnas.filter((a) => !a.activa).length} />;
}
