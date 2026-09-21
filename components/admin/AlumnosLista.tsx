"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Alumna } from "@/lib/data/admin";
import { EstadoBadge, Tarjeta } from "./AdminUI";

type Filtro = "todas" | "al-dia" | "pendiente";

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: "todas", texto: "Todas" },
  { id: "al-dia", texto: "Cuota al día" },
  { id: "pendiente", texto: "Cuota pendiente" },
];

const PAGINA = 15;

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function AlumnosLista({ alumnas }: { alumnas: Alumna[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [visibles, setVisibles] = useState(PAGINA);

  const filtradas = useMemo(() => {
    const q = norm(busqueda.trim());
    return alumnas.filter((a) => {
      if (filtro === "al-dia" && a.estado !== "Aprobado") return false;
      if (filtro === "pendiente" && a.estado !== "Pendiente") return false;
      return !q || norm(`${a.nombre} ${a.apellido} ${a.email}`).includes(q);
    });
  }, [alumnas, busqueda, filtro]);

  const mostradas = filtradas.slice(0, visibles);
  const cambiarFiltro = (f: Filtro) => {
    setFiltro(f);
    setVisibles(PAGINA);
  };

  return (
    <Tarjeta titulo="Listado de alumnas" subtitulo={`${filtradas.length} de ${alumnas.length} alumnas`}>
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
            placeholder="Buscar por nombre o email"
            className="w-full rounded-full border border-line bg-cream py-3 pl-11 pr-4 text-sm outline-none placeholder:text-ink-soft/60 focus:border-taupe focus:ring-2 focus:ring-taupe/15"
          />
        </label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              aria-pressed={filtro === f.id}
              onClick={() => cambiarFiltro(f.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs tracking-wide transition-colors ${
                filtro === f.id ? "bg-sage-deep text-white" : "bg-cream-alt text-ink-soft hover:text-taupe-dark"
              }`}
            >
              {f.texto}
            </button>
          ))}
        </div>
      </div>

      {mostradas.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-soft">No encontramos alumnas con esos datos.</p>
      ) : (
        <>
          {/* Celular */}
          <ul className="mt-4 divide-y divide-line md:hidden">
            {mostradas.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-taupe-dark">
                    {a.nombre} {a.apellido}
                  </p>
                  <p className="mt-1 break-all text-xs text-ink-soft">{a.email}</p>
                  <p className="mt-1 text-xs text-ink-soft">{a.plan}</p>
                </div>
                <EstadoBadge estado={a.estado} />
              </li>
            ))}
          </ul>

          {/* Tablet y escritorio */}
          <table className="mt-4 hidden w-full text-left text-sm md:table">
            <thead>
              <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
                <th className="pb-3 font-medium">Alumna</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="hidden pb-3 font-medium lg:table-cell">Alumna desde</th>
                <th className="pb-3 font-medium">Cuota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {mostradas.map((a) => (
                <tr key={a.id}>
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-taupe-dark">
                      {a.nombre} {a.apellido}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">{a.email}</p>
                  </td>
                  <td className="py-3.5 pr-4 text-ink-soft">{a.plan}</td>
                  <td className="hidden whitespace-nowrap py-3.5 pr-4 text-ink-soft lg:table-cell">{a.desde}</td>
                  <td className="py-3.5">
                    <EstadoBadge estado={a.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtradas.length > visibles && (
            <div className="mt-6 text-center">
              <button className="btn btn-outline" onClick={() => setVisibles((v) => v + PAGINA)}>
                Mostrar más alumnas
              </button>
            </div>
          )}
        </>
      )}
    </Tarjeta>
  );
}
