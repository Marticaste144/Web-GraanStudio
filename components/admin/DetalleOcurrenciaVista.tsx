"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, RotateCcw, UserCog } from "lucide-react";
import Link from "next/link";
import { Selector } from "@/components/auth/Campo";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  cambiarProfesoraRealAction,
  cancelarOcurrenciaAction,
  reprogramarOcurrenciaAction,
  tomarAsistenciaAction,
  type DatosAsistencia,
} from "@/lib/grilla/actions";
import { AdminHeader, Tarjeta } from "./AdminUI";

const formatoFecha = (iso: string) => new Date(iso).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

interface LugarVista {
  alumnaId: string;
  nombre: string;
  apellido: string;
  tipoReserva: "HABITUAL" | "RECUPERACION";
  horarioHabitualId: string | null;
  asistenciaId: string | null;
  estado: "PENDIENTE" | "PRESENTE" | "AUSENTE_CON_AVISO" | "AUSENTE_SIN_AVISO";
  avisoFecha: string | null;
  avisoValido: boolean | null;
}
interface OcurrenciaVista {
  id: string;
  fecha: string;
  dia: string;
  hora: string;
  disciplinaNombre: string;
  profesoraProgramadaNombre: string;
  profesoraRealNombre: string | null;
  profesoraProgramadaId: string;
  profesoraRealId: string | null;
  estado: string;
  cupoMaximo: number;
  lugares: LugarVista[];
  disponibilidad: {
    cupoMaximo: number; habituales: number; ausentesConfirmadas: number; recuperacionesAsignadas: number;
    lugaresNormales: number; lugaresLiberados: number; ocupacionEfectiva: number; disponibilidadTotal: number;
  };
}
interface Profesora { id: string; nombre: string }

const ESTILO_ESTADO: Record<string, string> = {
  PENDIENTE: "bg-cream-alt text-ink-soft",
  PRESENTE: "bg-sage-soft text-sage-deep",
  AUSENTE_CON_AVISO: "bg-sage-mist text-sage-deep",
  AUSENTE_SIN_AVISO: "bg-amber-soft text-amber-ink",
};

function textoEstado(l: LugarVista): string {
  if (l.estado === "AUSENTE_CON_AVISO") return l.avisoValido ? "Ausente con aviso" : "Ausente con aviso (fuera de término)";
  return { PENDIENTE: "Pendiente", PRESENTE: "Presente", AUSENTE_SIN_AVISO: "Ausente sin aviso" }[l.estado] ?? l.estado;
}

function EstadoBadgeAsistencia({ l }: { l: LugarVista }) {
  const estilo = l.estado === "AUSENTE_CON_AVISO" && l.avisoValido === false ? ESTILO_ESTADO.AUSENTE_SIN_AVISO : ESTILO_ESTADO[l.estado];
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${estilo ?? ""}`}>{textoEstado(l)}</span>;
}

type Panel = { tipo: "asistencia"; lugar: LugarVista } | { tipo: "profesora" | "cancelar" } | null;

export function DetalleOcurrenciaVista({ ocurrencia, profesoras }: { ocurrencia: OcurrenciaVista; profesoras: Profesora[] }) {
  const router = useRouter();
  const toast = useToast();
  const [, iniciarTransicion] = useTransition();
  const [panel, setPanel] = useState<Panel>(null);
  const cerrar = () => setPanel(null);
  const refrescar = () => iniciarTransicion(() => router.refresh());

  const cancelada = ocurrencia.estado === "CANCELADA";
  const d = ocurrencia.disponibilidad;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-8 lg:pt-12">
      <Link href="/admin/grillas" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-taupe-dark">
        <ArrowLeft size={15} /> Volver a la grilla
      </Link>

      <AdminHeader
        eyebrow={formatoFecha(ocurrencia.fecha)}
        titulo={`${ocurrencia.disciplinaNombre} · ${ocurrencia.hora}`}
        subtitulo={cancelada ? "Esta clase está cancelada. No se puede tomar asistencia." : undefined}
      />

      <div className="mt-8">
        <Tarjeta titulo="Datos de la clase">
          <dl className="divide-y divide-line/60">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5">
              <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">Profesora programada</dt>
              <dd className="text-sm text-ink">{ocurrencia.profesoraProgramadaNombre}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5">
              <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">Profesora real</dt>
              <dd className="text-sm text-ink">{ocurrencia.profesoraRealNombre ?? "— (se asume la programada)"}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5">
              <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">Estado</dt>
              <dd className="text-sm text-ink">{cancelada ? "Cancelada" : "Programada"}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5">
              <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">Cupo</dt>
              <dd className="text-sm text-ink">
                {d.ocupacionEfectiva}/{d.cupoMaximo} ocupado
                {d.lugaresLiberados > 0 && ` · ${d.lugaresLiberados} lugar${d.lugaresLiberados > 1 ? "es" : ""} liberado${d.lugaresLiberados > 1 ? "s" : ""} por ausencia`}
                {d.lugaresNormales > 0 && ` · ${d.lugaresNormales} lugar${d.lugaresNormales > 1 ? "es" : ""} libre${d.lugaresNormales > 1 ? "s" : ""}`}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel({ tipo: "profesora" })} disabled={cancelada}>
              <UserCog size={14} /> Cambiar profesora real
            </button>
            {cancelada ? (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={async () => {
                  const r = await reprogramarOcurrenciaAction(ocurrencia.id);
                  if (r.ok) { toast("Clase vuelta a programada."); refrescar(); } else toast(r.error);
                }}
              >
                <RotateCcw size={14} /> Volver a programada
              </button>
            ) : (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel({ tipo: "cancelar" })}>
                <Ban size={14} /> Cancelar clase
              </button>
            )}
          </div>
        </Tarjeta>
      </div>

      <div className="mt-5 lg:mt-6">
        <Tarjeta titulo="Alumnas" subtitulo="Tocá una alumna para tomar o corregir su asistencia">
          {ocurrencia.lugares.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">Todavía no hay alumnas con lugar reservado en esta clase.</p>
          ) : (
            <ul className="divide-y divide-line/70">
              {ocurrencia.lugares.map((l) => (
                <li key={l.alumnaId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {l.nombre} {l.apellido}
                      {l.tipoReserva === "RECUPERACION" && <span className="ml-2 text-xs text-sage-deep">(recuperación)</span>}
                    </p>
                    <div className="mt-1"><EstadoBadgeAsistencia l={l} /></div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={cancelada}
                    onClick={() => setPanel({ tipo: "asistencia", lugar: l })}
                  >
                    {l.estado === "PENDIENTE" ? "Tomar asistencia" : "Corregir"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      {panel?.tipo === "asistencia" && (
        <Modal titulo={`Asistencia: ${panel.lugar.nombre} ${panel.lugar.apellido}`} onCerrar={cerrar}>
          <AsistenciaForm
            alumnaId={panel.lugar.alumnaId}
            ocurrenciaId={ocurrencia.id}
            estadoActual={panel.lugar.estado}
            onCancelar={cerrar}
            onGuardado={() => { cerrar(); toast("Asistencia guardada."); refrescar(); }}
          />
        </Modal>
      )}

      {panel?.tipo === "profesora" && (
        <Modal titulo="Cambiar profesora real" onCerrar={cerrar}>
          <ProfesoraRealForm
            ocurrenciaId={ocurrencia.id}
            profesoras={profesoras}
            actualId={ocurrencia.profesoraRealId}
            onCancelar={cerrar}
            onGuardado={() => { cerrar(); toast("Profesora real actualizada."); refrescar(); }}
          />
        </Modal>
      )}

      {panel?.tipo === "cancelar" && (
        <Modal titulo="Cancelar clase" onCerrar={cerrar}>
          <div role="alertdialog">
            <p className="text-sm leading-relaxed text-ink-soft">
              ¿Cancelar esta clase? Ninguna alumna consumirá una clase de su pack, ninguna quedará como ausente y no se generan
              recuperaciones. La clase queda registrada como cancelada, no se borra.
            </p>
            <CancelarForm
              ocurrenciaId={ocurrencia.id}
              onCancelar={cerrar}
              onConfirmado={() => { cerrar(); toast("Clase cancelada."); refrescar(); }}
            />
          </div>
        </Modal>
      )}
    </main>
  );
}

function AsistenciaForm({
  alumnaId, ocurrenciaId, estadoActual, onCancelar, onGuardado,
}: {
  alumnaId: string; ocurrenciaId: string; estadoActual: string; onCancelar: () => void; onGuardado: () => void;
}) {
  const [estado, setEstado] = useState(estadoActual);
  const [avisoFechaLocal, setAvisoFechaLocal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true); setError(null);
        const datos: DatosAsistencia = { estado: estado as DatosAsistencia["estado"] };
        if (estado === "AUSENTE_CON_AVISO") datos.avisoFechaLocal = avisoFechaLocal;
        const r = await tomarAsistenciaAction(alumnaId, ocurrenciaId, datos);
        setEnviando(false);
        if (!r.ok) { setError(r.error); return; }
        onGuardado();
      }}
    >
      <Selector label="Estado" name="estado" value={estado} onChange={(e) => setEstado(e.target.value)} required>
        <option value="PENDIENTE">Pendiente</option>
        <option value="PRESENTE">Presente</option>
        <option value="AUSENTE_CON_AVISO">Ausente con aviso</option>
        <option value="AUSENTE_SIN_AVISO">Ausente sin aviso</option>
      </Selector>

      {estado === "AUSENTE_CON_AVISO" && (
        <div className="mt-4">
          <label htmlFor="avisoFechaLocal" className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
            Fecha y hora en que avisó
          </label>
          <input
            id="avisoFechaLocal"
            type="datetime-local"
            required
            value={avisoFechaLocal}
            onChange={(e) => setAvisoFechaLocal(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-sm text-ink outline-none transition-colors focus:border-taupe focus:ring-2 focus:ring-taupe/15"
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            Necesita al menos 3 horas de anticipación respecto de la hora de la clase para generar el derecho a recuperar. Si avisó
            fuera de término, la clase se descuenta igual y no se genera recuperación.
          </p>
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">
          {enviando ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  );
}

function ProfesoraRealForm({
  ocurrenciaId, profesoras, actualId, onCancelar, onGuardado,
}: {
  ocurrenciaId: string; profesoras: Profesora[]; actualId: string | null; onCancelar: () => void; onGuardado: () => void;
}) {
  const [profesoraId, setProfesoraId] = useState(actualId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true); setError(null);
        const r = await cambiarProfesoraRealAction(ocurrenciaId, profesoraId || null);
        setEnviando(false);
        if (!r.ok) { setError(r.error); return; }
        onGuardado();
      }}
    >
      <Selector label="Profesora que efectivamente dicta la clase" name="profesoraId" value={profesoraId} onChange={(e) => setProfesoraId(e.target.value)}>
        <option value="">— Se asume la programada —</option>
        {profesoras.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </Selector>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">Esto no modifica la clase recurrente ni sus próximas ocurrencias: solo registra un reemplazo para esta fecha puntual.</p>

      {error && <p role="alert" className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">{enviando ? "Guardando…" : "Guardar"}</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  );
}

function CancelarForm({ ocurrenciaId, onCancelar, onConfirmado }: { ocurrenciaId: string; onCancelar: () => void; onConfirmado: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button" disabled={enviando}
          className="btn btn-sm bg-amber-ink text-white hover:bg-taupe-dark disabled:opacity-60"
          onClick={async () => {
            setEnviando(true); setError(null);
            const r = await cancelarOcurrenciaAction(ocurrenciaId);
            setEnviando(false);
            if (!r.ok) { setError(r.error); return; }
            onConfirmado();
          }}
        >
          {enviando ? "Guardando…" : "Sí, cancelar"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>No, volver</button>
      </div>
    </>
  );
}
