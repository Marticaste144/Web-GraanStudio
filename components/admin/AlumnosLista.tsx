"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import type { Alumna } from "@/lib/data/admin";
import { useAdminAlumnas } from "./AdminAlumnasProvider";
import { EstadoBadge, Tarjeta } from "./AdminUI";

type Filtro = "todas" | "al-dia" | "pendiente";

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: "todas", texto: "Todas" },
  { id: "al-dia", texto: "Cuota al día" },
  { id: "pendiente", texto: "Cuota pendiente" },
];

const PAGINA = 15;

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const Etiquetas = ({ a }: { a: { activa: boolean; altaManual?: boolean } }) => (
  <>
    {a.altaManual && (
      <span className="ml-2 whitespace-nowrap rounded-full bg-sage-soft px-2 py-0.5 align-middle text-[0.65rem] font-medium uppercase tracking-wider text-sage-deep">
        Nueva
      </span>
    )}
    {!a.activa && (
      <span className="ml-2 whitespace-nowrap rounded-full bg-cream-alt px-2 py-0.5 align-middle text-[0.65rem] font-medium uppercase tracking-wider text-ink-soft">
        Inactiva
      </span>
    )}
  </>
);

export function AlumnosLista({ alumnas }: { alumnas: Alumna[] }) {
  const router = useRouter();
  const { datos, nuevas } = useAdminAlumnas();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [visibles, setVisibles] = useState(PAGINA);

  // Las recién dadas de alta van primero. Con los cambios del demo aplicados (nombre, email, estado…)
  const lista = [...nuevas, ...alumnas].map(datos);

  const filtradas = useMemo(() => {
    const q = norm(busqueda.trim());
    return lista.filter((a) => {
      if (filtro === "al-dia" && a.estado !== "Aprobado") return false;
      if (filtro === "pendiente" && a.estado !== "Pendiente") return false;
      return !q || norm(`${a.nombre} ${a.apellido} ${a.email}`).includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, busqueda, filtro]);

  const mostradas = filtradas.slice(0, visibles);
  const hayFiltro = busqueda.trim() !== "" || filtro !== "todas";
  const irA = (id: number) => router.push(`/admin/alumnos/${id}`);

  return (
    <Tarjeta titulo="Listado de alumnas" subtitulo={hayFiltro ? `${filtradas.length} ${filtradas.length === 1 ? "resultado" : "resultados"}` : undefined}>
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

      {mostradas.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-soft">No encontramos alumnas con esos datos.</p>
      ) : (
        <>
          {/* Celular: cada alumna es un enlace a su ficha */}
          <ul className="mt-4 divide-y divide-line md:hidden">
            {mostradas.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/alumnos/${a.id}`} className="flex items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-taupe-dark">
                      {a.nombre} {a.apellido}
                      <Etiquetas a={a} />
                    </p>
                    <p className="mt-1 break-all text-xs text-ink-soft">{a.email}</p>
                    <p className="mt-1 text-xs text-ink-soft">{a.plan}</p>
                  </div>
                  <EstadoBadge estado={a.estado} />
                  <ChevronRight size={18} className="shrink-0 text-taupe" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet y escritorio: la fila completa es clickeable (el nombre también es un enlace, para teclado) */}
          <table className="mt-4 hidden w-full text-left text-sm md:table">
            <thead>
              <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
                <th className="pb-3 font-medium">Alumna</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="hidden pb-3 font-medium lg:table-cell">Alumna desde</th>
                <th className="pb-3 font-medium">Cuota</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {mostradas.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => irA(a.id)}
                  className="group cursor-pointer transition-colors hover:bg-sage-mist"
                >
                  <td className="py-3.5 pl-2 pr-4">
                    <Link
                      href={`/admin/alumnos/${a.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-taupe-dark group-hover:underline group-hover:underline-offset-4"
                    >
                      {a.nombre} {a.apellido}
                    </Link>
                    <Etiquetas a={a} />
                    <p className="mt-0.5 text-xs text-ink-soft">{a.email}</p>
                  </td>
                  <td className="py-3.5 pr-4 text-ink-soft">{a.plan}</td>
                  <td className="hidden whitespace-nowrap py-3.5 pr-4 text-ink-soft lg:table-cell">{a.desde}</td>
                  <td className="py-3.5">
                    <EstadoBadge estado={a.estado} />
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <ChevronRight size={18} className="ml-auto text-taupe transition-transform group-hover:translate-x-0.5" aria-hidden />
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
