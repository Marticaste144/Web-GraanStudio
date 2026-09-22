import { ClasesRecurrentesAdmin } from "@/components/admin/ClasesRecurrentesAdmin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Clases · Administración Graan Studio" };
export const dynamic = "force-dynamic";

export default async function AdminClases() {
  const [clasesDb, disciplinas, profesoras] = await Promise.all([
    prisma.claseRecurrente.findMany({
      where: { activa: true },
      include: { disciplina: true, profesora: true },
      orderBy: [{ dia: "asc" }, { hora: "asc" }],
    }),
    prisma.disciplina.findMany({ orderBy: { nombre: "asc" } }),
    prisma.profesora.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
  ]);

  const clases = clasesDb.map((c) => ({
    id: c.id,
    dia: c.dia,
    hora: c.hora,
    cupo: c.cupo,
    disciplinaId: c.disciplinaId,
    disciplinaNombre: c.disciplina.nombre,
    profesoraId: c.profesoraId,
    profesoraNombre: c.profesora.nombre,
  }));

  return (
    <ClasesRecurrentesAdmin
      clasesIniciales={clases}
      disciplinas={disciplinas.map((d) => ({ id: d.id, nombre: d.nombre, aConsulta: d.aConsulta }))}
      profesoras={profesoras.map((p) => ({ id: p.id, nombre: p.nombre }))}
    />
  );
}
