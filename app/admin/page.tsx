import Link from "next/link";
import { AdminHeader, Barra, EstadoBadge, Metrica, Tarjeta } from "@/components/admin/AdminUI";
import { Importe } from "@/components/ui/Importe";
import { getActividad } from "@/lib/data/actividades";
import {
  ALUMNAS_ACTIVAS,
  INGRESOS_DEL_MES,
  OCUPACION_POR_ACTIVIDAD,
  OCUPACION_PROMEDIO,
  PAGOS_PENDIENTES,
  PAGOS_RECIENTES,
  PENDIENTE_DE_COBRO,
} from "@/lib/data/admin";
import { formatoPeso } from "@/lib/data/alumna";
import { CAPACIDAD, ocupadasDe } from "@/lib/data/cupos";
import { clasesDelDia } from "@/lib/data/horarios";
import { fechaCortaEnDias, resolverDia } from "@/lib/fechas";

export const dynamic = "force-dynamic";

export default async function AdminInicio({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia } = await searchParams;
  const hoy = resolverDia(dia);
  const clasesHoy = clasesDelDia(hoy.dia);

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader
        titulo={
          <>
            Buen día, <span className="italic text-sage-deep">Graziella</span>
          </>
        }
        subtitulo={`Resumen de ${hoy.etiqueta.toLowerCase()}.`}
        accion={
          <Link href="/" className="btn btn-outline hidden sm:inline-flex">
            Ver sitio
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        <Metrica etiqueta="Alumnas activas" valor={String(ALUMNAS_ACTIVAS)} nota="con al menos una clase semanal" />
        <Metrica etiqueta="Ingresos del mes" valor={formatoPeso(INGRESOS_DEL_MES)} nota="cuotas aprobadas" tono="oscura" />
        <Metrica etiqueta="Ocupación promedio" valor={`${OCUPACION_PROMEDIO}%`} nota="de todos los horarios de la semana" tono="sage" />
        <Metrica etiqueta="Clases hoy" valor={String(clasesHoy.length)} nota="programadas para hoy" />
      </div>

      <div className="mt-5 grid gap-5 lg:mt-6 lg:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Tarjeta titulo="Agenda de hoy" enlace={{ href: "/admin/clases", texto: "Ver todas las clases" }}>
          <ul className="divide-y divide-line">
            {clasesHoy.map((c) => {
              const ocupadas = ocupadasDe(c);
              const completa = ocupadas >= CAPACIDAD;
              return (
                <li key={c.hora} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="w-16 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{c.hora}</span>
                    <span className="text-sm">{getActividad(c.actividad).nombre}</span>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium tabular-nums ${
                      completa ? "bg-amber-soft text-amber-ink" : "bg-cream-alt text-ink-soft"
                    }`}
                  >
                    {ocupadas}/{CAPACIDAD} anotadas
                  </span>
                </li>
              );
            })}
          </ul>
        </Tarjeta>

        <div className="grid min-w-0 content-start gap-5 lg:gap-6">
          <Tarjeta
            titulo="Ocupación por clase"
            subtitulo="Promedio semanal"
            tono="sage"
            enlace={{ href: "/admin/metricas", texto: "Ver métricas" }}
          >
            <ul className="space-y-4">
              {OCUPACION_POR_ACTIVIDAD.map((a) => (
                <li key={a.id}>
                  <Barra etiqueta={a.nombre} valor={`${a.porcentaje}%`} porcentaje={a.porcentaje} />
                </li>
              ))}
            </ul>
          </Tarjeta>

          {/* Resumen (no lista de personas): el detalle de cada pago ya está en "Pagos recientes" y en Pagos. */}
          <Tarjeta titulo="Pagos por aprobar" enlace={{ href: "/admin/pagos", texto: "Ir a pagos" }}>
            <dl className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <dd className="font-serif text-4xl leading-none text-taupe-dark">{PAGOS_PENDIENTES.length}</dd>
                <dt className="mt-2 text-xs text-ink-soft">comprobantes por revisar</dt>
              </div>
              <div className="min-w-0">
                <dd className="whitespace-nowrap font-serif text-4xl leading-none text-taupe-dark">
                  <Importe valor={formatoPeso(PENDIENTE_DE_COBRO)} />
                </dd>
                <dt className="mt-2 text-xs text-ink-soft">pendiente de cobro</dt>
              </div>
            </dl>
          </Tarjeta>
        </div>
      </div>

      <Tarjeta
        titulo="Pagos recientes"
        className="mt-5 lg:mt-6"
        enlace={{ href: "/admin/pagos", texto: "Ver todos los pagos" }}
      >
        {/* Celular: una fila por pago */}
        <ul className="divide-y divide-line md:hidden">
          {PAGOS_RECIENTES.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-medium text-taupe-dark">
                  {p.nombre} {p.apellido}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {p.plan} · {p.medio}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-sm tabular-nums">{formatoPeso(p.monto)}</span>
                <EstadoBadge estado={p.estado} />
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
              <th className="pb-3 font-medium">Fecha</th>
              <th className="pb-3 text-right font-medium">Monto</th>
              <th className="pb-3 pl-6 font-medium">Medio de pago</th>
              <th className="pb-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {PAGOS_RECIENTES.map((p) => (
              <tr key={p.id}>
                <td className="py-3.5 pr-4 font-medium text-taupe-dark">
                  {p.nombre} {p.apellido}
                </td>
                <td className="py-3.5 pr-4 text-ink-soft">{p.plan}</td>
                <td className="whitespace-nowrap py-3.5 pr-4 text-ink-soft">{fechaCortaEnDias(-p.hace)}</td>
                <td className="whitespace-nowrap py-3.5 text-right tabular-nums">{formatoPeso(p.monto)}</td>
                <td className="py-3.5 pl-6 text-ink-soft">{p.medio}</td>
                <td className="py-3.5">
                  <EstadoBadge estado={p.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>
    </main>
  );
}
