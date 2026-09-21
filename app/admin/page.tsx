import Link from "next/link";
import { getActividad } from "@/lib/data/actividades";
import {
  ALUMNAS_ACTIVAS,
  INGRESOS_DEL_MES,
  OCUPACION_POR_ACTIVIDAD,
  OCUPACION_PROMEDIO,
  PAGOS_RECIENTES,
  type EstadoPago,
} from "@/lib/data/admin";
import { formatoPeso } from "@/lib/data/alumna";
import { CAPACIDAD, ocupadasDe } from "@/lib/data/cupos";
import { clasesDelDia } from "@/lib/data/horarios";
import { resolverDia } from "@/lib/fechas";

export const dynamic = "force-dynamic";

function Tarjeta({
  titulo,
  subtitulo,
  children,
  className = "",
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-line bg-paper p-6 sm:p-8 ${className}`}>
      <h2 className="text-2xl text-taupe-dark sm:text-3xl">{titulo}</h2>
      {subtitulo && <p className="mt-1 text-sm text-ink-soft">{subtitulo}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Estado({ estado }: { estado: EstadoPago }) {
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
    { label: "Alumnas activas", valor: String(ALUMNAS_ACTIVAS), nota: "con al menos una clase semanal", destacada: false },
    { label: "Ingresos del mes", valor: formatoPeso(INGRESOS_DEL_MES), nota: "cuotas aprobadas", destacada: true },
    { label: "Ocupación promedio", valor: `${OCUPACION_PROMEDIO}%`, nota: "de todos los horarios de la semana", destacada: false },
    { label: "Clases hoy", valor: String(clasesHoy.length), nota: hoy.etiqueta, destacada: false },
  ];

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1 className="mt-3 text-[2.4rem] leading-[1.05] text-taupe-dark md:text-5xl lg:text-[3.4rem]">
            Buen día, <span className="italic text-sage-dark">Graan</span>
          </h1>
          <p className="mt-3 text-sm text-ink-soft md:text-base">Resumen de {hoy.etiqueta.toLowerCase()}.</p>
        </div>
        <Link href="/" className="btn btn-outline hidden sm:inline-flex">
          Ver sitio
        </Link>
      </header>

      <div className="mt-9 grid gap-4 min-[560px]:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        {metricas.map((m) => (
          <div
            key={m.label}
            className={`min-w-0 rounded-3xl p-6 sm:p-7 ${
              m.destacada ? "bg-taupe-dark text-cream" : "border border-line bg-paper"
            }`}
          >
            <p className={`eyebrow ${m.destacada ? "!text-sage" : ""}`}>{m.label}</p>
            <p
              className={`mt-5 truncate font-serif text-4xl leading-none ${
                m.destacada ? "text-cream" : "text-taupe-dark"
              }`}
            >
              {m.valor}
            </p>
            <p className={`mt-3 text-xs ${m.destacada ? "text-cream/70" : "text-ink-soft"}`}>{m.nota}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:mt-6 lg:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Tarjeta titulo="Agenda de hoy" subtitulo={hoy.etiqueta}>
          <ul className="divide-y divide-line">
            {clasesHoy.map((c) => {
              const ocupadas = ocupadasDe(c);
              const completa = ocupadas >= CAPACIDAD;
              return (
                <li key={c.hora} className="flex items-center gap-4 py-3">
                  <span className="w-16 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{c.hora}</span>
                  <span className="min-w-0 flex-1 text-sm">{getActividad(c.actividad).nombre}</span>
                  <span
                    className={`shrink-0 text-right text-sm tabular-nums ${
                      completa ? "font-medium text-amber-ink" : "text-ink-soft"
                    }`}
                  >
                    {ocupadas}/{CAPACIDAD}
                    <span className="hidden sm:inline"> anotadas</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Ocupación por clase" subtitulo="Promedio de todos los horarios de la semana">
          <ul className="space-y-5">
            {OCUPACION_POR_ACTIVIDAD.map((a) => (
              <li key={a.id}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
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

      <Tarjeta titulo="Pagos recientes" className="mt-5 lg:mt-6">
        {/* Celular: una tarjeta por pago */}
        <ul className="divide-y divide-line md:hidden">
          {PAGOS_RECIENTES.map((p) => (
            <li key={p.alumna} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-medium text-taupe-dark">{p.alumna}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {p.plan} · {p.medio}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-sm tabular-nums">{formatoPeso(p.monto)}</span>
                <Estado estado={p.estado} />
              </div>
            </li>
          ))}
        </ul>

        {/* Tablet y escritorio: tabla */}
        <table className="hidden w-full text-left text-sm md:table">
          <thead>
            <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
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
      </Tarjeta>
    </main>
  );
}
