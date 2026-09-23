"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Pencil, Plus, UserCheck, UserX } from "lucide-react";
import { Campo, Selector } from "@/components/auth/Campo";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  cambiarEstadoAlumnaAction,
  editarAlumnaAction,
  type DatosAlumna,
} from "@/lib/alumnas/actions";
import {
  activarCompraPackAction,
  aplicarSenaAction,
  cancelarCompraPackAction,
  crearCompraPackAction,
  finalizarCompraPackAction,
  registrarPagoAction,
  registrarSenaAction,
  retenerSenaAction,
  type DatosCompraPack,
  type DatosPago,
  type DatosSena,
} from "@/lib/packs/actions";
import { MEDIOS_PAGO_NUEVOS, MONTO_SENA_SUGERIDO } from "@/lib/packs/config";
import { AdminHeader, Tarjeta } from "./AdminUI";

const formatoPeso = (n: number) => "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
const formatoFecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }) : "—");
const hoyISO = () => new Date().toISOString().slice(0, 10);

interface AlumnaFicha {
  id: string; nombre: string; apellido: string; telefono: string | null; dni: string | null; email: string | null;
  disciplinas: string | null; diasHorarios: string | null; activa: boolean;
}
interface PagoFicha { id: string; monto: number; medio: string | null; fechaPago: string | null }
interface CompraPackFicha {
  id: string; clasesContratadas: number; precioAplicado: number; fechaInicio: string; fechaFin: string | null;
  clasesTomadas: number; clasesRestantes: number; estado: string; planNombre: string;
  pagos: PagoFicha[]; senaAplicada: { id: string; monto: number } | null;
  resumen: { valor: number; senaAplicada: number; otrosPagos: number; totalAbonado: number; saldoPendiente: number };
}
interface SenaFicha {
  id: string; monto: number; medio: string | null; fecha: string; estado: string;
  compraPackId: string | null; compraPackResumen: string | null;
}
interface PlanPackOpcion { id: string; clases: number; precio: number }

function EstadoBadgeActiva({ activa }: { activa: boolean }) {
  return activa ? (
    <span className="inline-block whitespace-nowrap rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-deep">Activa</span>
  ) : (
    <span className="inline-block whitespace-nowrap rounded-full bg-cream-alt px-3 py-1 text-xs font-medium text-ink-soft">Inactiva</span>
  );
}

const ESTADO_PACK_ESTILO: Record<string, string> = {
  PENDIENTE: "bg-cream-alt text-ink-soft",
  ACTIVO: "bg-sage-soft text-sage-deep",
  FINALIZADO: "bg-cream-alt text-ink-soft",
  CANCELADO: "bg-amber-soft text-amber-ink",
};
const ESTADO_PACK_TEXTO: Record<string, string> = {
  PENDIENTE: "Pendiente", ACTIVO: "Activo", FINALIZADO: "Finalizado", CANCELADO: "Cancelado",
};
function EstadoBadgePack({ estado }: { estado: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${ESTADO_PACK_ESTILO[estado] ?? ""}`}>{ESTADO_PACK_TEXTO[estado] ?? estado}</span>;
}

const ESTADO_SENA_ESTILO: Record<string, string> = {
  PENDIENTE: "bg-cream-alt text-ink-soft",
  APLICADA: "bg-sage-soft text-sage-deep",
  RETENIDA: "bg-amber-soft text-amber-ink",
};
const ESTADO_SENA_TEXTO: Record<string, string> = { PENDIENTE: "Pendiente", APLICADA: "Aplicada", RETENIDA: "Retenida" };
function EstadoBadgeSena({ estado }: { estado: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${ESTADO_SENA_ESTILO[estado] ?? ""}`}>{ESTADO_SENA_TEXTO[estado] ?? estado}</span>;
}

type Panel =
  | { tipo: "editar" | "estado" | "pack" }
  | { tipo: "pago" | "cancelarPack"; compraId: string }
  | { tipo: "sena" }
  | { tipo: "aplicarSena" | "retenerSena"; senaId: string }
  | null;

export function FichaAlumnaReal({
  alumna, comprasPack, senas, planPacks,
}: {
  alumna: AlumnaFicha; comprasPack: CompraPackFicha[]; senas: SenaFicha[]; planPacks: PlanPackOpcion[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [, iniciarTransicion] = useTransition();
  const [panel, setPanel] = useState<Panel>(null);

  // "Pack actual" = el más reciente que sigue vigente (pendiente o activo). Si no hay ninguno,
  // no se fuerza a mostrar uno finalizado/cancelado como si fuera el actual.
  const packActual = comprasPack.find((c) => c.estado === "PENDIENTE" || c.estado === "ACTIVO") ?? null;
  const packAnterior = comprasPack.find((c) => c.estado === "FINALIZADO" || c.estado === "CANCELADO") ?? comprasPack[0] ?? null;
  const senasPendientes = senas.filter((s) => s.estado === "PENDIENTE");
  const packsAplicables = comprasPack.filter((c) => c.estado === "PENDIENTE" || c.estado === "ACTIVO");

  const refrescar = () => iniciarTransicion(() => router.refresh());
  const cerrar = () => setPanel(null);

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader
        titulo={<>{alumna.nombre} <span className="italic text-sage-deep">{alumna.apellido}</span></>}
        subtitulo="Ficha de alumna"
        accion={
          <div className="flex flex-wrap items-center gap-2.5">
            <EstadoBadgeActiva activa={alumna.activa} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel({ tipo: "editar" })}>
              <Pencil size={14} />
              Editar datos
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel({ tipo: "estado" })}>
              {alumna.activa ? <UserX size={14} /> : <UserCheck size={14} />}
              {alumna.activa ? "Dar de baja" : "Reactivar"}
            </button>
          </div>
        }
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Tarjeta titulo="Datos personales">
          <dl className="divide-y divide-line">
            {[
              ["Teléfono", alumna.telefono ?? "—"],
              ["DNI", alumna.dni ?? "—"],
              ["Email", alumna.email ?? "—"],
              ["Disciplina/s", alumna.disciplinas ?? "—"],
              ["Días y horarios habituales", alumna.diasHorarios ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">{k}</dt>
                <dd className="min-w-0 break-words text-sm text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Tarjeta>

        <Tarjeta titulo="Pack actual" tono="sage">
          {packActual ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="font-serif text-xl text-taupe-dark">{packActual.planNombre}</p>
                <EstadoBadgePack estado={packActual.estado} />
              </div>
              <dl className="mt-3 divide-y divide-line/60">
                {[
                  ["Valor", formatoPeso(packActual.resumen.valor)],
                  ["Inicio", formatoFecha(packActual.fechaInicio)],
                  ["Fin", packActual.fechaFin ? formatoFecha(packActual.fechaFin) : "Pendiente de programación"],
                  ["Clases tomadas", String(packActual.clasesTomadas)],
                  ["Clases restantes", String(packActual.clasesRestantes)],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5">
                    <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">{k}</dt>
                    <dd className="min-w-0 break-words text-sm text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 rounded-2xl border border-line bg-cream px-4 py-4">
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><dt className="text-[0.65rem] uppercase tracking-wide text-ink-soft">Seña</dt><dd className="mt-1 font-medium text-taupe-dark">{formatoPeso(packActual.resumen.senaAplicada)}</dd></div>
                  <div><dt className="text-[0.65rem] uppercase tracking-wide text-ink-soft">Otros pagos</dt><dd className="mt-1 font-medium text-taupe-dark">{formatoPeso(packActual.resumen.otrosPagos)}</dd></div>
                  <div><dt className="text-[0.65rem] uppercase tracking-wide text-ink-soft">Total abonado</dt><dd className="mt-1 font-medium text-taupe-dark">{formatoPeso(packActual.resumen.totalAbonado)}</dd></div>
                  <div><dt className="text-[0.65rem] uppercase tracking-wide text-ink-soft">Saldo</dt><dd className={`mt-1 font-medium ${packActual.resumen.saldoPendiente > 0 ? "text-amber-ink" : "text-sage-deep"}`}>{formatoPeso(packActual.resumen.saldoPendiente)}</dd></div>
                </dl>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {packActual.resumen.saldoPendiente > 0 && (
                  <button type="button" className="btn btn-sage btn-sm" onClick={() => setPanel({ tipo: "pago", compraId: packActual.id })}>Registrar pago</button>
                )}
                {packActual.estado === "PENDIENTE" && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={async () => { const r = await activarCompraPackAction(packActual.id); if (r.ok) { toast("Pack activado."); refrescar(); } else toast(r.error); }}>
                    <CheckCircle2 size={14} /> Marcar como activo
                  </button>
                )}
                {packActual.estado === "ACTIVO" && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={async () => { const r = await finalizarCompraPackAction(packActual.id); if (r.ok) { toast("Pack marcado como finalizado."); refrescar(); } else toast(r.error); }}>
                    Marcar como finalizado
                  </button>
                )}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel({ tipo: "cancelarPack", compraId: packActual.id })}>
                  <Ban size={14} /> Cancelar pack
                </button>
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-ink-soft">Sin pack activo actualmente.</p>
          )}

          <div className="mt-5 border-t border-line pt-4">
            <button type="button" className="btn btn-primary btn-sm w-full sm:w-auto" onClick={() => setPanel({ tipo: "pack" })}>
              <Plus size={14} />
              {packAnterior ? "Renovar pack" : "Nuevo pack"}
            </button>
          </div>
        </Tarjeta>
      </div>

      <div className="mt-5 lg:mt-6">
        <Tarjeta titulo="Señas" subtitulo="Se aplican al pack que corresponda; si la alumna no se presenta, quedan retenidas.">
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel({ tipo: "sena" })}>
              <Plus size={14} /> Registrar seña
            </button>
          </div>
          {senas.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">Sin señas registradas.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Monto</th>
                  <th className="pb-3 font-medium">Medio</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Pack</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {senas.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 pr-4 text-ink-soft">{formatoFecha(s.fecha)}</td>
                    <td className="py-3 pr-4">{formatoPeso(s.monto)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{s.medio ?? "sin especificar"}</td>
                    <td className="py-3 pr-4"><EstadoBadgeSena estado={s.estado} /></td>
                    <td className="py-3 pr-4 text-ink-soft">{s.compraPackResumen ?? "—"}</td>
                    <td className="py-3 text-right">
                      {s.estado === "PENDIENTE" && (
                        <div className="flex justify-end gap-2">
                          {packsAplicables.length > 0 && (
                            <button type="button" className="btn btn-sage btn-sm" onClick={() => setPanel({ tipo: "aplicarSena", senaId: s.id })}>Aplicar</button>
                          )}
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel({ tipo: "retenerSena", senaId: s.id })}>Retener</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Tarjeta>
      </div>

      <div className="mt-5 lg:mt-6">
        <Tarjeta titulo="Historial de packs" subtitulo="El más reciente primero. Ningún pack anterior se modifica al crear uno nuevo.">
          {comprasPack.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">Sin packs registrados.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
                  <th className="pb-3 font-medium">Clases</th>
                  <th className="pb-3 font-medium">Precio</th>
                  <th className="pb-3 font-medium">Inicio</th>
                  <th className="pb-3 font-medium">Fin</th>
                  <th className="pb-3 font-medium">Tomadas/Restantes</th>
                  <th className="pb-3 font-medium">Abonado</th>
                  <th className="pb-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {comprasPack.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4">{c.clasesContratadas}</td>
                    <td className="py-3 pr-4">{formatoPeso(c.precioAplicado)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{formatoFecha(c.fechaInicio)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{c.fechaFin ? formatoFecha(c.fechaFin) : "—"}</td>
                    <td className="py-3 pr-4 text-ink-soft">{c.clasesTomadas} / {c.clasesRestantes}</td>
                    <td className="py-3 pr-4 text-ink-soft">{formatoPeso(c.resumen.totalAbonado)}{c.resumen.saldoPendiente > 0 ? ` (saldo ${formatoPeso(c.resumen.saldoPendiente)})` : ""}</td>
                    <td className="py-3"><EstadoBadgePack estado={c.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Tarjeta>
      </div>

      {panel?.tipo === "editar" && (
        <Modal titulo="Editar datos" onCerrar={cerrar}>
          <EditarAlumnaForm alumna={alumna} onCancelar={cerrar} onGuardado={() => { cerrar(); toast("Datos actualizados."); refrescar(); }} />
        </Modal>
      )}

      {panel?.tipo === "estado" && (
        <Modal titulo={alumna.activa ? "Dar de baja" : "Reactivar alumna"} onCerrar={cerrar}>
          <CambiarEstadoConfirm alumna={alumna} onCancelar={cerrar} onConfirmado={() => { cerrar(); toast(alumna.activa ? "Alumna dada de baja." : "Alumna reactivada."); refrescar(); }} />
        </Modal>
      )}

      {panel?.tipo === "pack" && (
        <Modal titulo={packAnterior ? "Renovar pack" : "Nuevo pack"} onCerrar={cerrar}>
          <NuevoPackForm
            alumnaId={alumna.id}
            planPacks={planPacks}
            packAnterior={packAnterior}
            esRenovacion={Boolean(packAnterior)}
            onCancelar={cerrar}
            onCreado={() => { cerrar(); toast("Pack guardado."); refrescar(); }}
          />
        </Modal>
      )}

      {panel?.tipo === "pago" && (
        <Modal titulo="Registrar pago" onCerrar={cerrar}>
          <RegistrarPagoForm
            alumnaId={alumna.id}
            compraId={panel.compraId}
            onCancelar={cerrar}
            onRegistrado={() => { cerrar(); toast("Pago registrado."); refrescar(); }}
          />
        </Modal>
      )}

      {panel?.tipo === "cancelarPack" && (
        <Modal titulo="Cancelar pack" onCerrar={cerrar}>
          <CancelarPackConfirm compraId={panel.compraId} onCancelar={cerrar} onConfirmado={() => { cerrar(); toast("Pack cancelado."); refrescar(); }} />
        </Modal>
      )}

      {panel?.tipo === "sena" && (
        <Modal titulo="Registrar seña" onCerrar={cerrar}>
          <RegistrarSenaForm alumnaId={alumna.id} onCancelar={cerrar} onRegistrada={() => { cerrar(); toast("Seña registrada."); refrescar(); }} />
        </Modal>
      )}

      {panel?.tipo === "aplicarSena" && (
        <Modal titulo="Aplicar seña a un pack" onCerrar={cerrar}>
          <AplicarSenaForm senaId={panel.senaId} packsAplicables={packsAplicables} onCancelar={cerrar} onAplicada={() => { cerrar(); toast("Seña aplicada."); refrescar(); }} />
        </Modal>
      )}

      {panel?.tipo === "retenerSena" && (
        <Modal titulo="Marcar seña como retenida" onCerrar={cerrar}>
          <RetenerSenaConfirm senaId={panel.senaId} onCancelar={cerrar} onConfirmado={() => { cerrar(); toast("Seña marcada como retenida."); refrescar(); }} />
        </Modal>
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Formularios y confirmaciones
// ---------------------------------------------------------------------------

function EditarAlumnaForm({ alumna, onCancelar, onGuardado }: { alumna: AlumnaFicha; onCancelar: () => void; onGuardado: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true); setError(null);
        const f = new FormData(e.currentTarget);
        const dato = (k: string) => String(f.get(k) ?? "").trim();
        const datos: DatosAlumna = { nombre: dato("nombre"), apellido: dato("apellido"), telefono: dato("telefono"), dni: dato("dni"), email: dato("email"), disciplinas: dato("disciplinas"), diasHorarios: dato("diasHorarios") };
        const resultado = await editarAlumnaAction(alumna.id, datos);
        setEnviando(false);
        if (!resultado.ok) { setError(resultado.error); return; }
        onGuardado();
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nombre" name="nombre" required defaultValue={alumna.nombre} />
          <Campo label="Apellido" name="apellido" defaultValue={alumna.apellido} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Teléfono" name="telefono" type="tel" defaultValue={alumna.telefono ?? ""} />
          <Campo label="DNI" name="dni" inputMode="numeric" defaultValue={alumna.dni ?? ""} />
        </div>
        <Campo label="Email" name="email" type="email" defaultValue={alumna.email ?? ""} />
        <Campo label="Disciplina/s" name="disciplinas" defaultValue={alumna.disciplinas ?? ""} />
        <Campo label="Días y horarios habituales" name="diasHorarios" defaultValue={alumna.diasHorarios ?? ""} />
      </div>
      {error && <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">{enviando ? "Guardando…" : "Guardar cambios"}</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  );
}

function CambiarEstadoConfirm({ alumna, onCancelar, onConfirmado }: { alumna: AlumnaFicha; onCancelar: () => void; onConfirmado: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activar = !alumna.activa;
  return (
    <div role="alertdialog">
      <p className="text-sm leading-relaxed text-ink-soft">
        {activar
          ? `¿Reactivar a ${alumna.nombre} ${alumna.apellido}? Vuelve a aparecer como alumna activa.`
          : `¿Dar de baja a ${alumna.nombre} ${alumna.apellido}? Es una baja lógica: no se borra ningún dato ni historial, y se puede reactivar cuando vuelva.`}
      </p>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button" disabled={enviando}
          className="btn btn-sm bg-amber-ink text-white hover:bg-taupe-dark disabled:opacity-60"
          onClick={async () => {
            setEnviando(true); setError(null);
            const r = await cambiarEstadoAlumnaAction(alumna.id, activar);
            setEnviando(false);
            if (!r.ok) { setError(r.error); return; }
            onConfirmado();
          }}
        >
          {enviando ? "Guardando…" : activar ? "Sí, reactivar" : "Sí, dar de baja"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>No, volver</button>
      </div>
    </div>
  );
}

function NuevoPackForm({
  alumnaId, planPacks, packAnterior, esRenovacion, onCancelar, onCreado,
}: {
  alumnaId: string; planPacks: PlanPackOpcion[]; packAnterior: CompraPackFicha | null; esRenovacion: boolean;
  onCancelar: () => void; onCreado: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Sugerencia: mismo número de clases del pack anterior, con el precio VIGENTE (no el histórico).
  const planSugerido = packAnterior ? planPacks.find((p) => p.clases === packAnterior.clasesContratadas) : undefined;
  const [planElegido, setPlanElegido] = useState(planSugerido?.id ?? "");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true); setError(null);
        const f = new FormData(e.currentTarget);
        const datos: DatosCompraPack = {
          planPackId: planElegido || undefined,
          clasesContratadas: Number(f.get("clasesContratadas")),
          precioAplicado: Number(f.get("precioAplicado")),
          fechaInicio: String(f.get("fechaInicio")),
          fechaFin: String(f.get("fechaFin") || "") || undefined,
          estado: String(f.get("estado")) as "PENDIENTE" | "ACTIVO",
        };
        const resultado = await crearCompraPackAction(alumnaId, datos, { esRenovacion });
        setEnviando(false);
        if (!resultado.ok) { setError(resultado.error); return; }
        onCreado();
      }}
    >
      <p className="text-sm leading-relaxed text-ink-soft">
        {esRenovacion
          ? "Elegí un plan vigente (se sugiere la misma cantidad de clases del pack anterior, con el precio de hoy) o cargá una excepción."
          : "Elegí un plan vigente para autocompletar clases y precio, o cargá un pack personalizado."}
      </p>

      <div className="mt-5 space-y-4">
        <Selector
          label="Plan vigente (opcional)"
          name="plan"
          value={planElegido}
          onChange={(e) => {
            const id = e.target.value;
            setPlanElegido(id);
            const plan = planPacks.find((p) => p.id === id);
            if (plan) {
              const form = e.target.form!;
              (form.elements.namedItem("clasesContratadas") as HTMLInputElement).value = String(plan.clases);
              (form.elements.namedItem("precioAplicado") as HTMLInputElement).value = String(plan.precio);
            }
          }}
        >
          <option value="">Pack personalizado</option>
          {planPacks.map((p) => (
            <option key={p.id} value={p.id}>{p.clases} clases — {formatoPeso(p.precio)}</option>
          ))}
        </Selector>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Cantidad de clases" name="clasesContratadas" type="number" min={1} step={1} required defaultValue={planSugerido?.clases ?? packAnterior?.clasesContratadas ?? ""} />
          <Campo label="Precio a aplicar" name="precioAplicado" type="number" min={0} step={1} required defaultValue={planSugerido?.precio ?? ""} />
        </div>
        <p className="text-xs text-ink-soft">Si necesitás aplicar una excepción autorizada, cambiá el precio: no afecta al catálogo, solo a este pack.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Fecha de inicio" name="fechaInicio" type="date" required defaultValue={hoyISO()} />
          <Campo label="Fecha de fin (opcional)" name="fechaFin" type="date" />
        </div>
        <Selector label="Estado inicial" name="estado" defaultValue="ACTIVO">
          <option value="ACTIVO">Activo (empieza ahora)</option>
          <option value="PENDIENTE">Pendiente (reservado, todavía no empieza)</option>
        </Selector>
      </div>

      {error && <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">{enviando ? "Guardando…" : esRenovacion ? "Renovar pack" : "Crear pack"}</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  );
}

function RegistrarPagoForm({ alumnaId, compraId, onCancelar, onRegistrado }: { alumnaId: string; compraId: string; onCancelar: () => void; onRegistrado: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true); setError(null);
        const f = new FormData(e.currentTarget);
        const datos: DatosPago = { monto: Number(f.get("monto")), medio: String(f.get("medio")) as DatosPago["medio"], fechaPago: String(f.get("fechaPago")) };
        const r = await registrarPagoAction(alumnaId, compraId, datos);
        setEnviando(false);
        if (!r.ok) { setError(r.error); return; }
        onRegistrado();
      }}
    >
      <div className="space-y-4">
        <Campo label="Monto" name="monto" type="number" min={1} step={1} required />
        <Selector label="Medio de pago" name="medio" required defaultValue={MEDIOS_PAGO_NUEVOS[0]}>
          {MEDIOS_PAGO_NUEVOS.map((m) => <option key={m} value={m}>{m}</option>)}
        </Selector>
        <Campo label="Fecha de pago" name="fechaPago" type="date" required defaultValue={hoyISO()} />
      </div>
      {error && <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">{enviando ? "Guardando…" : "Registrar pago"}</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  );
}

function CancelarPackConfirm({ compraId, onCancelar, onConfirmado }: { compraId: string; onCancelar: () => void; onConfirmado: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div role="alertdialog">
      <p className="text-sm leading-relaxed text-ink-soft">¿Cancelar este pack? Queda registrado en el historial como cancelado, no se borra.</p>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button" disabled={enviando}
          className="btn btn-sm bg-amber-ink text-white hover:bg-taupe-dark disabled:opacity-60"
          onClick={async () => {
            setEnviando(true); setError(null);
            const r = await cancelarCompraPackAction(compraId);
            setEnviando(false);
            if (!r.ok) { setError(r.error); return; }
            onConfirmado();
          }}
        >
          {enviando ? "Guardando…" : "Sí, cancelar"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>No, volver</button>
      </div>
    </div>
  );
}

function RegistrarSenaForm({ alumnaId, onCancelar, onRegistrada }: { alumnaId: string; onCancelar: () => void; onRegistrada: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true); setError(null);
        const f = new FormData(e.currentTarget);
        const datos: DatosSena = { monto: Number(f.get("monto")), medio: String(f.get("medio")) as DatosSena["medio"], fecha: String(f.get("fecha")) };
        const r = await registrarSenaAction(alumnaId, datos);
        setEnviando(false);
        if (!r.ok) { setError(r.error); return; }
        onRegistrada();
      }}
    >
      <div className="space-y-4">
        <Campo label="Monto" name="monto" type="number" min={1} step={1} required defaultValue={MONTO_SENA_SUGERIDO} />
        <Selector label="Medio de pago" name="medio" required defaultValue={MEDIOS_PAGO_NUEVOS[0]}>
          {MEDIOS_PAGO_NUEVOS.map((m) => <option key={m} value={m}>{m}</option>)}
        </Selector>
        <Campo label="Fecha" name="fecha" type="date" required defaultValue={hoyISO()} />
      </div>
      <p className="mt-4 text-xs text-ink-soft">Queda pendiente hasta que la apliques a un pack, o la marques como retenida si la alumna no se presenta.</p>
      {error && <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">{enviando ? "Guardando…" : "Registrar seña"}</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  );
}

function AplicarSenaForm({ senaId, packsAplicables, onCancelar, onAplicada }: { senaId: string; packsAplicables: CompraPackFicha[]; onCancelar: () => void; onAplicada: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true); setError(null);
        const f = new FormData(e.currentTarget);
        const r = await aplicarSenaAction(senaId, String(f.get("compraPackId")));
        setEnviando(false);
        if (!r.ok) { setError(r.error); return; }
        onAplicada();
      }}
    >
      <Selector label="Aplicar a" name="compraPackId" required defaultValue="">
        <option value="" disabled>Elegí un pack</option>
        {packsAplicables.map((c) => (
          <option key={c.id} value={c.id}>{c.clasesContratadas} clases — {formatoPeso(c.precioAplicado)} ({formatoFecha(c.fechaInicio)})</option>
        ))}
      </Selector>
      {error && <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">{enviando ? "Aplicando…" : "Aplicar seña"}</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  );
}

function RetenerSenaConfirm({ senaId, onCancelar, onConfirmado }: { senaId: string; onCancelar: () => void; onConfirmado: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div role="alertdialog">
      <p className="text-sm leading-relaxed text-ink-soft">
        La alumna no se presentó: la seña queda para Graan Studio, no se devuelve y no se aplica a ningún pack. Esta acción no se puede deshacer.
      </p>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button" disabled={enviando}
          className="btn btn-sm bg-amber-ink text-white hover:bg-taupe-dark disabled:opacity-60"
          onClick={async () => {
            setEnviando(true); setError(null);
            const r = await retenerSenaAction(senaId);
            setEnviando(false);
            if (!r.ok) { setError(r.error); return; }
            onConfirmado();
          }}
        >
          {enviando ? "Guardando…" : "Sí, marcar como retenida"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>No, volver</button>
      </div>
    </div>
  );
}
