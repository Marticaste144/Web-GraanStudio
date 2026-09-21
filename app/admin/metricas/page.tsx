import { AdminHeader, Barra, Metrica, Tarjeta } from "@/components/admin/AdminUI";
import {
  ALUMNAS_ACTIVAS,
  DISTRIBUCION_MEDIOS,
  DISTRIBUCION_PLANES,
  INGRESOS_DEL_MES,
  INGRESOS_SERIE,
  OCUPACION_POR_ACTIVIDAD,
  OCUPACION_POR_DIA,
  OCUPACION_POR_FRANJA,
  OCUPACION_PROMEDIO,
  PENDIENTE_DE_COBRO,
} from "@/lib/data/admin";
import { formatoPeso } from "@/lib/data/alumna";
import { ultimosMeses } from "@/lib/fechas";

export const dynamic = "force-dynamic";

export default function AdminMetricas() {
  const meses = ultimosMeses(INGRESOS_SERIE.length);
  const maximo = Math.max(...INGRESOS_SERIE);

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader titulo="Métricas" subtitulo="Cómo viene el estudio: ingresos, ocupación y alumnas." />

      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        <Metrica etiqueta="Ingresos del mes" valor={formatoPeso(INGRESOS_DEL_MES)} nota="cuotas aprobadas" tono="oscura" />
        <Metrica etiqueta="Pendiente de cobro" valor={formatoPeso(PENDIENTE_DE_COBRO)} nota="comprobantes por revisar" tono="sage" />
        <Metrica etiqueta="Alumnas activas" valor={String(ALUMNAS_ACTIVAS)} nota="con al menos una clase semanal" />
        <Metrica etiqueta="Ocupación promedio" valor={`${OCUPACION_PROMEDIO}%`} nota="de todos los horarios" />
      </div>

      <div className="mt-5 grid items-start gap-5 lg:mt-6 lg:gap-6 xl:grid-cols-2">
        <Tarjeta titulo="Ingresos por mes" subtitulo="Últimos 6 meses">
          <ul className="space-y-4">
            {INGRESOS_SERIE.map((v, i) => (
              <li key={i}>
                <Barra
                  etiqueta={meses[i]}
                  valor={formatoPeso(v)}
                  porcentaje={(v / maximo) * 100}
                  color={i === INGRESOS_SERIE.length - 1 ? "sage" : "taupe"}
                />
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Ocupación por actividad" tono="sage">
          <ul className="space-y-4">
            {OCUPACION_POR_ACTIVIDAD.map((a) => (
              <li key={a.id}>
                <Barra etiqueta={a.nombre} valor={`${a.porcentaje}%`} porcentaje={a.porcentaje} />
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Ocupación por día">
          <ul className="space-y-4">
            {OCUPACION_POR_DIA.map((d) => (
              <li key={d.dia}>
                <Barra etiqueta={d.nombre} valor={`${d.porcentaje}%`} porcentaje={d.porcentaje} />
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Ocupación por franja horaria" tono="cream">
          <ul className="space-y-4">
            {OCUPACION_POR_FRANJA.map((f) => (
              <li key={f.nombre}>
                <Barra etiqueta={f.nombre} valor={`${f.porcentaje}%`} porcentaje={f.porcentaje} color="taupe" />
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Planes contratados" subtitulo="Alumnas según clases por semana">
          <ul className="space-y-4">
            {DISTRIBUCION_PLANES.map((p) => (
              <li key={p.nombre}>
                <Barra
                  etiqueta={p.nombre}
                  valor={`${p.cantidad} alumnas`}
                  porcentaje={(p.cantidad / ALUMNAS_ACTIVAS) * 100}
                  color="taupe"
                />
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Medios de pago" subtitulo="Cómo abonan las alumnas" tono="sage">
          <ul className="space-y-4">
            {DISTRIBUCION_MEDIOS.map((m) => (
              <li key={m.nombre}>
                <Barra
                  etiqueta={m.nombre}
                  valor={`${Math.round((m.cantidad / ALUMNAS_ACTIVAS) * 100)}%`}
                  porcentaje={(m.cantidad / ALUMNAS_ACTIVAS) * 100}
                />
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
    </main>
  );
}
