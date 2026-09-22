import { AdminHeader, Barra, Metrica, Tarjeta } from "@/components/admin/AdminUI";
import { MetricaAlumnasActivas } from "@/components/admin/AlumnasWidgets";
import { MetricaOcupacion, OcupacionPorActividad, OcupacionPorDia, OcupacionPorFranja } from "@/components/admin/ClasesWidgets";
import {
  ALUMNAS_ACTIVAS,
  DISTRIBUCION_MEDIOS,
  DISTRIBUCION_PLANES,
  INGRESOS_DEL_MES,
  INGRESOS_MESES_ANTERIORES,
  PENDIENTE_DE_COBRO,
} from "@/lib/data/admin";
import { formatoPeso } from "@/lib/data/alumna";
import { ultimosMeses } from "@/lib/fechas";
import { requireRole } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export default async function AdminMetricas() {
  // Información financiera/global del negocio: exclusiva de OWNER (ver app/admin/layout.tsx
  // para la protección general de /admin, que ya exige OWNER o ADMIN).
  await requireRole("admin:financials", { unauthenticatedRedirect: "/admin/login", unauthorizedRedirect: "/admin" });

  const meses = ultimosMeses(INGRESOS_MESES_ANTERIORES.length + 1);
  const maximo = Math.max(...INGRESOS_MESES_ANTERIORES, INGRESOS_DEL_MES);

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader titulo="Métricas" subtitulo="Cómo viene el estudio: ingresos, ocupación y alumnas." />

      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        <Metrica etiqueta="Ingresos del mes" valor={formatoPeso(INGRESOS_DEL_MES)} nota="cuotas aprobadas" tono="oscura" />
        <Metrica etiqueta="Pendiente de cobro" valor={formatoPeso(PENDIENTE_DE_COBRO)} nota="comprobantes por revisar" tono="sage" />
        <MetricaAlumnasActivas />
        <MetricaOcupacion nota="de todos los horarios" />
      </div>

      <div className="mt-5 grid items-start gap-5 lg:mt-6 lg:gap-6 xl:grid-cols-2">
        {/* Meses anteriores: el mes en curso ya está arriba, en "Ingresos del mes". */}
        <Tarjeta titulo="Ingresos de meses anteriores" subtitulo="Comparativo, sin el mes en curso">
          <ul className="space-y-4">
            {INGRESOS_MESES_ANTERIORES.map((v, i) => (
              <li key={i}>
                <Barra etiqueta={meses[i]} valor={formatoPeso(v)} porcentaje={(v / maximo) * 100} color="taupe" />
              </li>
            ))}
          </ul>
        </Tarjeta>

        <OcupacionPorActividad />

        <OcupacionPorDia />

        <OcupacionPorFranja />

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
