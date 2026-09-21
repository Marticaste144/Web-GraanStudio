"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Pencil } from "lucide-react";
import { Campo } from "@/components/auth/Campo";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getActividad } from "@/lib/data/actividades";
import type { Alumna, EstadoPago } from "@/lib/data/admin";
import { DIAS_HASTA_VENCIMIENTO, formatoPeso } from "@/lib/data/alumna";
import { ordenSemanal } from "@/lib/data/clasesAdmin";
import { asistenciaDe, historialDe } from "@/lib/data/ficha";
import { nombreDia, type Dia } from "@/lib/data/horarios";
import { fechaCortaEnDias, fechaEnDias, fechaEnDiasProximoMes, mesHace } from "@/lib/fechas";
import { useAdminAlumnas } from "./AdminAlumnasProvider";
import { AdminHeader, EstadoBadge, Tarjeta } from "./AdminUI";
import { useClasesAdmin } from "./ClasesProvider";
import { SelectorClases } from "./SelectorClases";

interface Props {
  id: number;
  /** La alumna de ejemplo (viene del servidor). Las dadas de alta desde el Admin se buscan en memoria. */
  alumna: Alumna | null;
  /** "Hoy" del demo, para marcar cuál es la próxima clase */
  hoyDia: Dia;
  hoyHora: number;
}

/** Fila etiqueta / valor. Si no entra en una línea, el valor baja debajo de la etiqueta. */
function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
      <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">{etiqueta}</dt>
      <dd className="min-w-0 break-words text-sm text-ink sm:text-right">{children}</dd>
    </div>
  );
}

const Activa = ({ activa }: { activa: boolean }) =>
  activa ? (
    <span className="inline-block whitespace-nowrap rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-deep">Activa</span>
  ) : (
    <span className="inline-block whitespace-nowrap rounded-full bg-cream-alt px-3 py-1 text-xs font-medium text-ink-soft">Inactiva</span>
  );

const CuotaBadge = ({ estado }: { estado: EstadoPago }) =>
  estado === "Aprobado" ? (
    <span className="inline-block whitespace-nowrap rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-deep">Al día</span>
  ) : (
    <span className="inline-block whitespace-nowrap rounded-full bg-amber-soft px-3 py-1 text-xs font-medium text-amber-ink">Pendiente</span>
  );

/** Resuelve la alumna (de ejemplo o dada de alta en esta sesión) y muestra su ficha. */
export function FichaAlumna({ id, alumna, hoyDia, hoyHora }: Props) {
  const { nuevas } = useAdminAlumnas();
  const encontrada = alumna ?? nuevas.find((a) => a.id === id);

  if (!encontrada) {
    return (
      <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
        <Link href="/admin/alumnos" className="btn btn-outline btn-sm">
          <ArrowLeft size={15} />
          Volver a alumnas
        </Link>
        <div className="mt-8 max-w-xl rounded-3xl border border-dashed border-taupe/40 bg-paper p-8 text-center sm:p-10">
          <p className="font-serif text-3xl text-taupe-dark">No encontramos a esta alumna</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Las alumnas dadas de alta en el demo no se guardan: si se recarga la página, desaparecen.
          </p>
        </div>
      </main>
    );
  }
  return <FichaContenido alumna={encontrada} hoyDia={hoyDia} hoyHora={hoyHora} />;
}

function FichaContenido({ alumna, hoyDia, hoyHora }: { alumna: Alumna; hoyDia: Dia; hoyHora: number }) {
  const toast = useToast();
  const { datos, editar, alternarEstado } = useAdminAlumnas();
  const { clases: todas, asignarAlumna } = useClasesAdmin();
  const a = datos(alumna);

  // Las clases en las que está anotada salen de la lista de clases del Admin (la misma que se gestiona en Admin > Clases).
  const propias = todas.filter((c) => c.alumnas.includes(alumna.id)).sort((x, y) => ordenSemanal(x) - ordenSemanal(y));
  const ahora = ordenSemanal({ dia: hoyDia, hora: String(hoyHora) });
  // La "próxima" es la primera desde ahora; si ya no quedan esta semana, la primera de la siguiente.
  const proxima = propias.find((c) => ordenSemanal(c) >= ahora) ?? propias[0];
  const clases = propias.map((c) => ({
    id: c.id,
    dia: nombreDia(c.dia),
    hora: c.hora,
    actividad: getActividad(c.actividad).nombre,
    esProxima: c === proxima,
  }));

  // Pagos, vencimiento y asistencia (datos de ejemplo). Las fechas dependen del día actual.
  const historial = useMemo(
    () =>
      historialDe(alumna).map((p) => ({
        mes: mesHace(p.mesesAtras),
        fecha: p.sinFecha ? "—" : fechaCortaEnDias(-p.hace),
        monto: p.monto,
        medio: p.medio,
        estado: p.estado,
      })),
    [alumna],
  );
  // Vencimiento de ejemplo: con la cuota pendiente, el mismo que ve la alumna en su portal;
  // con la cuota al día, el del mes siguiente. (La regla real de vencimientos se define más adelante.)
  const vence = alumna.estado === "Pendiente" ? fechaEnDias(DIAS_HASTA_VENCIMIENTO) : fechaEnDiasProximoMes(DIAS_HASTA_VENCIMIENTO);
  const asistencia = asistenciaDe(alumna);

  const [editando, setEditando] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [verHistorial, setVerHistorial] = useState(false);
  const historialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (verHistorial) historialRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [verHistorial]);

  const ultimoPago = historial.find((p) => p.estado === "Aprobado");
  const nombreCompleto = `${a.nombre} ${a.apellido}`.trim();
  const iniciales = `${a.nombre[0] ?? ""}${a.apellido[0] ?? ""}`.toUpperCase();

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <Link href="/admin/alumnos" className="btn btn-outline btn-sm">
        <ArrowLeft size={15} />
        Volver a alumnas
      </Link>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
          <span
            aria-hidden
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-sage-soft font-serif text-2xl text-sage-deep sm:h-20 sm:w-20 sm:text-3xl"
          >
            {iniciales}
          </span>
          <div className="min-w-0 flex-1">
            <AdminHeader eyebrow="Ficha de alumna" titulo={nombreCompleto} />
          </div>
        </div>
      </div>

      {/* Acciones de administración */}
      <div className="mt-6 grid gap-2.5 min-[480px]:grid-cols-2 sm:flex sm:flex-wrap">
        <button className="btn btn-primary btn-sm" onClick={() => setEditando(true)}>
          <Pencil size={14} />
          Editar datos
        </button>
        <Link href={`/admin/pagos?q=${encodeURIComponent(nombreCompleto)}`} className="btn btn-outline btn-sm">
          Ver pagos
        </Link>
        <button className="btn btn-outline btn-sm" onClick={() => setAsignando(true)}>
          Gestionar clases
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            alternarEstado(a.id);
            toast(a.activa ? `${nombreCompleto} quedó como inactiva.` : `${nombreCompleto} volvió a estar activa.`);
          }}
        >
          Cambiar estado
        </button>
      </div>

      {/* 1 columna en celular y escritorio chico · 2 columnas en tablet y pantallas anchas */}
      <div className="mt-6 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 lg:gap-6">
        {/* Datos personales */}
        <Tarjeta titulo="Datos personales">
          {editando ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const v = (k: string) => String(f.get(k) ?? "").trim();
                editar(a.id, { nombre: v("nombre"), apellido: v("apellido"), email: v("email"), telefono: v("telefono") });
                setEditando(false);
                toast("Datos actualizados.");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Nombre" name="nombre" defaultValue={a.nombre} required />
                <Campo label="Apellido" name="apellido" defaultValue={a.apellido} required />
              </div>
              <Campo label="Email" name="email" type="email" defaultValue={a.email} required />
              <Campo label="Teléfono" name="telefono" type="tel" defaultValue={a.telefono} />
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button type="submit" className="btn btn-sage btn-sm">
                  Guardar cambios
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditando(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <dl className="divide-y divide-line border-y border-line">
              <Dato etiqueta="Nombre y apellido">{nombreCompleto}</Dato>
              <Dato etiqueta="Email">{a.email}</Dato>
              <Dato etiqueta="Teléfono">{a.telefono || "—"}</Dato>
              <Dato etiqueta="Alumna desde">{a.desde}</Dato>
              <Dato etiqueta="Estado">
                <Activa activa={a.activa} />
              </Dato>
            </dl>
          )}
        </Tarjeta>

        {/* Plan y cuota */}
        <Tarjeta titulo="Plan y cuota" tono="sage">
          <dl className="divide-y divide-sage/40 border-y border-sage/40">
            <Dato etiqueta="Plan actual">{a.plan}</Dato>
            <Dato etiqueta="Estado de la cuota">
              <CuotaBadge estado={a.estado} />
            </Dato>
            <Dato etiqueta="Importe">{formatoPeso(a.monto)}</Dato>
            <Dato etiqueta="Próximo vencimiento">{vence}</Dato>
            <Dato etiqueta="Último pago registrado">
              {ultimoPago
                ? `${ultimoPago.fecha} · ${formatoPeso(ultimoPago.monto)} · ${ultimoPago.medio}`
                : "Todavía sin pagos"}
            </Dato>
          </dl>
          <button
            className="btn btn-outline btn-sm mt-5 w-full sm:w-auto"
            aria-expanded={verHistorial}
            aria-controls="historial-de-pagos"
            onClick={() => setVerHistorial((v) => !v)}
          >
            {verHistorial ? "Ocultar historial de pagos" : "Ver historial de pagos"}
            <ChevronDown size={15} className={`transition-transform ${verHistorial ? "rotate-180" : ""}`} />
          </button>
        </Tarjeta>

        {/* Clases */}
        <Tarjeta titulo="Clases">
          {clases.length > 0 ? (
            <ul className="divide-y divide-line border-y border-line">
              {clases.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="w-14 shrink-0 font-serif text-2xl leading-none text-taupe-dark">{c.hora}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-ink">{c.actividad}</p>
                      <p className="text-xs text-ink-soft">{c.dia}</p>
                    </div>
                  </div>
                  {c.esProxima && (
                    <span className="whitespace-nowrap rounded-full bg-sage-soft px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-sage-deep">
                      Próxima
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-taupe/40 px-4 py-6 text-center">
              <p className="text-sm text-ink-soft">Todavía no está anotada a ninguna clase.</p>
              <button className="btn btn-sage btn-sm mt-4" onClick={() => setAsignando(true)}>
                Asignar clases
              </button>
            </div>
          )}
        </Tarjeta>

        {/* Asistencia */}
        <Tarjeta titulo="Asistencia" subtitulo="Últimas 4 semanas" tono="cream">
          {asistencia.programadas === 0 ? (
            <p className="text-sm text-ink-soft">Todavía no hay asistencias registradas.</p>
          ) : (
            <>
              <p className="font-serif text-5xl leading-none text-taupe-dark">{asistencia.porcentaje}%</p>
              <div
                className="mt-4 h-2.5 overflow-hidden rounded-full bg-paper"
                role="progressbar"
                aria-valuenow={asistencia.porcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Porcentaje de asistencia"
              >
                <div className="h-full rounded-full bg-sage-deep" style={{ width: `${asistencia.porcentaje}%` }} />
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { t: "Programadas", v: asistencia.programadas },
                  { t: "Asistió", v: asistencia.asistio },
                  { t: "Ausencias", v: asistencia.ausencias },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl bg-paper px-2 py-3">
                    <dd className="font-serif text-3xl leading-none text-taupe-dark">{x.v}</dd>
                    <dt className="mt-1.5 text-[0.7rem] text-ink-soft">{x.t}</dt>
                  </div>
                ))}
              </dl>
            </>
          )}
        </Tarjeta>
      </div>

      {/* Historial de pagos (se abre desde "Plan y cuota") */}
      <div id="historial-de-pagos" ref={historialRef}>
        {verHistorial && (
          <Tarjeta titulo="Historial de pagos" className="mt-5 lg:mt-6">
            {/* Celular */}
            <ul className="divide-y divide-line md:hidden">
              {historial.map((p) => (
                <li key={p.mes} className="flex items-start justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-medium text-taupe-dark">{p.mes}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {p.fecha} · {p.medio}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-sm tabular-nums">{formatoPeso(p.monto)}</span>
                    <EstadoBadge estado={p.estado} />
                  </div>
                </li>
              ))}
            </ul>
            {/* Tablet y escritorio */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
                  <th className="pb-3 font-medium">Mes</th>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 text-right font-medium">Monto</th>
                  <th className="pb-3 pl-6 font-medium">Medio de pago</th>
                  <th className="pb-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {historial.map((p) => (
                  <tr key={p.mes}>
                    <td className="py-3.5 pr-4 font-medium text-taupe-dark">{p.mes}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-ink-soft">{p.fecha}</td>
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
        )}
      </div>

      {/* Asignar / cambiar las clases de la alumna */}
      {asignando && (
        <Modal titulo={`Clases de ${nombreCompleto}`} onCerrar={() => setAsignando(false)} ancho="max-w-xl">
          <AsignarClases
            nombre={nombreCompleto}
            max={alumna.clasesPorSemana}
            inicial={propias.map((c) => c.id)}
            onGuardar={(ids) => {
              asignarAlumna(alumna.id, ids);
              setAsignando(false);
              toast("Clases actualizadas.");
            }}
            onCancelar={() => setAsignando(false)}
          />
        </Modal>
      )}
    </main>
  );
}

function AsignarClases({
  nombre,
  max,
  inicial,
  onGuardar,
  onCancelar,
}: {
  nombre: string;
  max: number;
  inicial: string[];
  onGuardar: (ids: string[]) => void;
  onCancelar: () => void;
}) {
  const { clases } = useClasesAdmin();
  const [seleccion, setSeleccion] = useState<string[]>(inicial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar(seleccion);
      }}
    >
      <p className="eyebrow">Gestionar clases</p>
      <h2 className="mt-2 pr-10 text-[1.9rem] leading-tight text-taupe-dark sm:text-3xl">{nombre}</h2>
      <div className="mt-6">
        <SelectorClases clases={clases} seleccion={seleccion} onCambiar={setSeleccion} max={max} />
      </div>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" className="btn btn-sage btn-sm">
          Guardar clases
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
