import { getActividad } from "@/lib/data/actividades";
import {
  ALUMNAS_ACTIVAS,
  INGRESOS_DEL_MES,
  OCUPACION_POR_ACTIVIDAD,
  OCUPACION_PROMEDIO,
  PAGOS_RECIENTES,
} from "@/lib/data/admin";
import { formatoPeso } from "@/lib/data/alumna";
import { CAPACIDAD, ocupadasDe } from "@/lib/data/cupos";
import { clasesDelDia } from "@/lib/data/horarios";
import { resolverDia } from "@/lib/fechas";

export const dynamic = "force-dynamic";

function Tarjeta({ titulo, children, className = "" }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-paper p-6 ${className}`}>
      <h2 className="text-2xl text-taupe-dark">{titulo}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Estado({ estado }: { estado: "Aprobado" | "Pendiente" }) {
  return estado === "Aprobado" ? (
    <span className="rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-dark">Aprobado</span>
  ) : (
    <span className="rounded-full bg-amber-soft px-3 py-1 text-xs font-medium text-amber-ink">Pendiente</span>
  );
}

export default async function AdminInicio({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia } = await searchParams;
  const hoy = resolverDia(dia);
  const clasesHoy = clasesDelDia(hoy.dia);

  const metricas = [
    { label: "Alumnas activas", valor: String(ALUMNAS_ACTIVAS), nota: "con al menos un horario fijo" },
    { label: "Ingresos del mes", valor: formatoPeso(INGRESOS_DEL_MES), nota: "cuotas aprobadas" },
    { label: "Ocupación promedio", valor: `${OCUPACION_PROMEDIO}%`, nota: "de todos los horarios de la semana" },
    { label: "Clases hoy", valor: String(clasesHoy.length), nota: hoy.etiqueta },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <header>
        <p className="eyebrow">Panel de administración</p>
        <h1 className="mt-3 text-5xl text-taupe-dark">Inicio</h1>
      </header>

      <div className="mt-9 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metricas.map((m) => (
          <div key={m.label} className="rounded-2xl border border-line bg-paper p-5 md:p-6">
            <p className="eyebrow">{m.label}</p>
            <p className="mt-4 font-serif text-4xl leading-none text-taupe-dark md:text-5xl">{m.valor}</p>
            <p className="mt-3 text-xs text-ink-soft">{m.nota}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Tarjeta titulo="Agenda de hoy">
          <p className="-mt-3 mb-4 text-sm text-ink-soft">{hoy.etiqueta}</p>
          <ul className="divide-y divide-line">
            {clasesHoy.map((c) => {
              const ocupadas = ocupadasDe(c);
              const completa = ocupadas >= CAPACIDAD;
              return (
                <li key={c.hora} className="flex items-center gap-4 py-3">
                  <span className="w-14 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{c.hora}</span>
                  <span className="flex-1 text-sm">{getActividad(c.actividad).nombre}</span>
                  <span
                    className={`text-sm tabular-nums ${completa ? "font-medium text-amber-ink" : "text-ink-soft"}`}
                  >
                    {ocupadas}/{CAPACIDAD} anotadas
                  </span>
                </li>
              );
            })}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Ocupación por clase">
          <ul className="space-y-5">
            {OCUPACION_POR_ACTIVIDAD.map((a) => (
              <li key={a.id}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{a.nombre}</span>
                  <span className="font-medium tabular-nums text-taupe-dark">{a.porcentaje}%</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-cream-alt"
                  role="progressbar"
                  aria-valuenow={a.porcentaje}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Ocupación de ${a.nombre}`}
                >
                  <div className="h-full rounded-full bg-sage-dark" style={{ width: `${a.porcentaje}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>

      <Tarjeta titulo="Pagos recientes" className="mt-6">
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-[0.15em] text-ink-soft">
                <th className="pb-3 font-medium">Alumna</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 text-right font-medium">Monto</th>
                <th className="pb-3 pl-6 font-medium">Medio de pago</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {PAGOS_RECIENTES.map((p) => (
                <tr key={p.alumna}>
                  <td className="py-3.5 pr-4 font-medium text-taupe-dark">{p.alumna}</td>
                  <td className="py-3.5 pr-4 text-ink-soft">{p.plan}</td>
                  <td className="py-3.5 text-right tabular-nums">{formatoPeso(p.monto)}</td>
                  <td className="py-3.5 pl-6 text-ink-soft">{p.medio}</td>
                  <td className="py-3.5">
                    <Estado estado={p.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </main>
  );
}
