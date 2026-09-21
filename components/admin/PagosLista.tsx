"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { EstadoPago, Pago } from "@/lib/data/admin";
import { formatoPeso } from "@/lib/data/alumna";
import { EstadoBadge, Metrica, Tarjeta } from "./AdminUI";

type Filtro = "todos" | EstadoPago;
const FILTROS: { id: Filtro; texto: string }[] = [
  { id: "todos", texto: "Todos" },
  { id: "Aprobado", texto: "Aprobados" },
  { id: "Pendiente", texto: "Pendientes" },
];
const PAGINA = 15;

/** Los pagos vienen con su fecha ya formateada desde el servidor. */
export type PagoConFecha = Pago & { fecha: string };

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function PagosLista({ pagos, busquedaInicial = "" }: { pagos: PagoConFecha[]; busquedaInicial?: string }) {
  const toast = useToast();
  // Solo en memoria: aprobar un pago cambia el estado visual, no guarda nada.
  const [aprobados, setAprobados] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [visibles, setVisibles] = useState(PAGINA);

  const estadoDe = (p: PagoConFecha): EstadoPago => (aprobados.has(p.id) ? "Aprobado" : p.estado);
  const cobrado = pagos.filter((p) => estadoDe(p) === "Aprobado").reduce((a, p) => a + p.monto, 0);
  const pendiente = pagos.filter((p) => estadoDe(p) === "Pendiente").reduce((a, p) => a + p.monto, 0);
  const cantPendientes = pagos.filter((p) => estadoDe(p) === "Pendiente").length;

  const q = norm(busqueda.trim());
  const filtrados = pagos.filter(
    (p) => (filtro === "todos" || estadoDe(p) === filtro) && (!q || norm(`${p.nombre} ${p.apellido}`).includes(q)),
  );
  const hayFiltro = filtro !== "todos" || q !== "";
  const mostrados = filtrados.slice(0, visibles);

  const aprobar = (p: PagoConFecha) => {
    setAprobados((prev) => new Set(prev).add(p.id));
    toast(`Aprobaste el pago de ${p.nombre} ${p.apellido}.`);
  };

  const Accion = ({ p }: { p: PagoConFecha }) =>
    estadoDe(p) === "Pendiente" ? (
      <button className="btn btn-sage btn-sm" onClick={() => aprobar(p)}>
        <Check size={14} strokeWidth={2.5} />
        Aprobar
      </button>
    ) : null;

  return (
    <>
      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-3 lg:gap-5">
        <Metrica etiqueta="Cobrado en el mes" valor={formatoPeso(cobrado)} nota="cuotas aprobadas" tono="oscura" />
        <Metrica etiqueta="Pendiente de cobro" valor={formatoPeso(pendiente)} nota={`${cantPendientes} comprobantes por revisar`} tono="sage" />
        <Metrica etiqueta="Pagos registrados" valor={String(pagos.length)} nota="uno por alumna activa" />
      </div>

      <div className="mt-5 lg:mt-6">
        <Tarjeta titulo="Todos los pagos" subtitulo={hayFiltro ? `${filtrados.length} ${filtrados.length === 1 ? "resultado" : "resultados"}` : undefined}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block md:w-80">
              <span className="sr-only">Buscar alumna</span>
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setVisibles(PAGINA);
                }}
                placeholder="Buscar por nombre"
                className="w-full rounded-full border border-line bg-cream py-3 pl-11 pr-4 text-sm outline-none placeholder:text-ink-soft/60 focus:border-taupe focus:ring-2 focus:ring-taupe/15"
              />
            </label>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                aria-pressed={filtro === f.id}
                onClick={() => {
                  setFiltro(f.id);
                  setVisibles(PAGINA);
                }}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs tracking-wide transition-colors ${
                  filtro === f.id ? "bg-sage-deep text-white" : "bg-cream-alt text-ink-soft hover:text-taupe-dark"
                }`}
              >
                {f.texto}
              </button>
            ))}
          </div>
          </div>

          {mostrados.length === 0 && (
            <p className="py-12 text-center text-sm text-ink-soft">No encontramos pagos con esos datos.</p>
          )}

          {/* Celular */}
          <ul className="mt-4 divide-y divide-line md:hidden">
            {mostrados.map((p) => (
              <li key={p.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-taupe-dark">
                      {p.nombre} {p.apellido}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {p.fecha} · {p.medio}
                    </p>
                    <p className="text-xs text-ink-soft">{p.plan}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-sm tabular-nums">{formatoPeso(p.monto)}</span>
                    <EstadoBadge estado={estadoDe(p)} />
                  </div>
                </div>
                {estadoDe(p) === "Pendiente" && (
                  <div className="mt-3">
                    <Accion p={p} />
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Tablet y escritorio */}
          <table className="mt-4 hidden w-full text-left text-sm md:table">
            <thead>
              <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
                <th className="pb-3 font-medium">Alumna</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 text-right font-medium">Monto</th>
                <th className="pb-3 pl-6 font-medium">Medio de pago</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {mostrados.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-4 font-medium text-taupe-dark">
                    {p.nombre} {p.apellido}
                  </td>
                  <td className="py-3 pr-4 text-ink-soft">{p.plan}</td>
                  <td className="whitespace-nowrap py-3 pr-4 text-ink-soft">{p.fecha}</td>
                  <td className="whitespace-nowrap py-3 text-right tabular-nums">{formatoPeso(p.monto)}</td>
                  <td className="py-3 pl-6 text-ink-soft">{p.medio}</td>
                  <td className="py-3">
                    <EstadoBadge estado={estadoDe(p)} />
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <Accion p={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtrados.length > visibles && (
            <div className="mt-6 text-center">
              <button className="btn btn-outline" onClick={() => setVisibles((v) => v + PAGINA)}>
                Mostrar más pagos
              </button>
            </div>
          )}
        </Tarjeta>
      </div>
    </>
  );
}
