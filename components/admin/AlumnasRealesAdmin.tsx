"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Campo } from "@/components/auth/Campo";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { crearAlumnaAction } from "@/lib/alumnas/actions";
import { AdminHeader, Metrica, Tarjeta } from "./AdminUI";

export interface AlumnaResumen {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  dni: string | null;
  email: string | null;
  activa: boolean;
  packResumen: string | null;
}

type Filtro = "todas" | "activas" | "inactivas";
const FILTROS: { id: Filtro; texto: string }[] = [
  { id: "todas", texto: "Todas" },
  { id: "activas", texto: "Activas" },
  { id: "inactivas", texto: "Inactivas" },
];
const PAGINA = 20;

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function EstadoBadgeActiva({ activa }: { activa: boolean }) {
  return activa ? (
    <span className="inline-block whitespace-nowrap rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-deep">Activa</span>
  ) : (
    <span className="inline-block whitespace-nowrap rounded-full bg-cream-alt px-3 py-1 text-xs font-medium text-ink-soft">Inactiva</span>
  );
}

export function AlumnasRealesAdmin({ alumnas, activas, inactivas }: { alumnas: AlumnaResumen[]; activas: number; inactivas: number }) {
  const router = useRouter();
  const toast = useToast();
  const [, iniciarTransicion] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [visibles, setVisibles] = useState(PAGINA);
  const [altaAbierta, setAltaAbierta] = useState(false);

  const filtradas = useMemo(() => {
    const q = norm(busqueda.trim());
    return alumnas.filter((a) => {
      if (filtro === "activas" && !a.activa) return false;
      if (filtro === "inactivas" && a.activa) return false;
      if (!q) return true;
      const campos = norm(`${a.nombre} ${a.apellido} ${a.dni ?? ""} ${a.telefono ?? ""} ${a.email ?? ""}`);
      return campos.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumnas, busqueda, filtro]);

  const mostradas = filtradas.slice(0, visibles);
  const hayFiltro = busqueda.trim() !== "" || filtro !== "todas";
  const irA = (id: string) => router.push(`/admin/alumnos/${id}`);

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader
        titulo="Alumnos"
        subtitulo="Alumnas reales del estudio."
        accion={
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => setAltaAbierta(true)}>
            <Plus size={17} />
            Nueva alumna
          </button>
        }
      />

      <div className="mt-8 grid gap-4 min-[560px]:grid-cols-3 lg:gap-5">
        <Metrica etiqueta="Alumnas totales" valor={String(alumnas.length)} nota="activas + inactivas" />
        <Metrica etiqueta="Activas" valor={String(activas)} nota="con estado activo" tono="sage" />
        <Metrica etiqueta="Inactivas" valor={String(inactivas)} nota="baja lógica, no borradas" />
      </div>

      <div className="mt-5 lg:mt-6">
        <Tarjeta titulo="Listado de alumnas" subtitulo={hayFiltro ? `${filtradas.length} ${filtradas.length === 1 ? "resultado" : "resultados"}` : undefined}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block md:w-96">
              <span className="sr-only">Buscar alumna</span>
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setVisibles(PAGINA); }}
                placeholder="Buscar por nombre, DNI, teléfono o email"
                className="w-full rounded-full border border-line bg-cream py-3 pl-11 pr-4 text-sm outline-none placeholder:text-ink-soft/60 focus:border-taupe focus:ring-2 focus:ring-taupe/15"
              />
            </label>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  aria-pressed={filtro === f.id}
                  onClick={() => { setFiltro(f.id); setVisibles(PAGINA); }}
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
              <ul className="mt-4 divide-y divide-line md:hidden">
                {mostradas.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/alumnos/${a.id}`} className="flex items-center gap-3 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-taupe-dark">{a.nombre} {a.apellido}</p>
                        <p className="mt-1 text-xs text-ink-soft">{a.dni ?? "sin DNI"} · {a.telefono ?? "sin teléfono"}</p>
                      </div>
                      <EstadoBadgeActiva activa={a.activa} />
                      <ChevronRight size={18} className="shrink-0 text-taupe" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>

              <table className="mt-4 hidden w-full text-left text-sm md:table">
                <thead>
                  <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
                    <th className="pb-3 font-medium">Alumna</th>
                    <th className="pb-3 font-medium">DNI</th>
                    <th className="hidden pb-3 font-medium lg:table-cell">Teléfono</th>
                    <th className="pb-3 font-medium">Pack actual</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {mostradas.map((a) => (
                    <tr key={a.id} onClick={() => irA(a.id)} className="group cursor-pointer transition-colors hover:bg-sage-mist">
                      <td className="py-3.5 pl-2 pr-4">
                        <Link href={`/admin/alumnos/${a.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-taupe-dark group-hover:underline group-hover:underline-offset-4">
                          {a.nombre} {a.apellido}
                        </Link>
                        <p className="mt-0.5 break-all text-xs text-ink-soft">{a.email ?? ""}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-ink-soft">{a.dni ?? "—"}</td>
                      <td className="hidden whitespace-nowrap py-3.5 pr-4 text-ink-soft lg:table-cell">{a.telefono ?? "—"}</td>
                      <td className="py-3.5 pr-4 text-ink-soft">{a.packResumen ?? "sin pack"}</td>
                      <td className="py-3.5"><EstadoBadgeActiva activa={a.activa} /></td>
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
      </div>

      {altaAbierta && (
        <Modal titulo="Nueva alumna" onCerrar={() => setAltaAbierta(false)}>
          <AltaAlumnaForm
            onCancelar={() => setAltaAbierta(false)}
            onCreada={(id) => {
              setAltaAbierta(false);
              toast("Alumna creada.");
              iniciarTransicion(() => router.refresh());
              router.push(`/admin/alumnos/${id}`);
            }}
          />
        </Modal>
      )}
    </main>
  );
}

function AltaAlumnaForm({ onCancelar, onCreada }: { onCancelar: () => void; onCreada: (id: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true);
        setError(null);
        const f = new FormData(e.currentTarget);
        const dato = (k: string) => String(f.get(k) ?? "").trim();
        const resultado = await crearAlumnaAction({
          nombre: dato("nombre"), apellido: dato("apellido"), telefono: dato("telefono"),
          dni: dato("dni"), email: dato("email"), disciplinas: dato("disciplinas"), diasHorarios: dato("diasHorarios"),
        });
        setEnviando(false);
        if (!resultado.ok) { setError(resultado.error); return; }
        onCreada(resultado.id);
      }}
    >
      <p className="eyebrow">Alta manual</p>
      <h2 className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">Datos de la alumna</h2>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nombre" name="nombre" required autoComplete="off" />
          <Campo label="Apellido" name="apellido" autoComplete="off" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Teléfono" name="telefono" type="tel" autoComplete="off" />
          <Campo label="DNI" name="dni" inputMode="numeric" autoComplete="off" />
        </div>
        <Campo label="Email" name="email" type="email" autoComplete="off" />
        <Campo label="Disciplina/s" name="disciplinas" placeholder="ej. Pilates Reformer" autoComplete="off" />
        <Campo label="Días y horarios habituales" name="diasHorarios" placeholder="ej. Lunes y miércoles 18hs" autoComplete="off" />
      </div>

      {error && <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">
          {enviando ? "Creando…" : "Crear alumna"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
