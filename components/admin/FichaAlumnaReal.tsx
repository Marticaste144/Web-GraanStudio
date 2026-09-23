"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, UserCheck, UserX } from "lucide-react";
import { Campo, Selector } from "@/components/auth/Campo";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  cambiarEstadoAlumnaAction,
  crearCompraPackAction,
  editarAlumnaAction,
  type DatosAlumna,
  type DatosCompraPack,
} from "@/lib/alumnas/actions";
import { AdminHeader, Tarjeta } from "./AdminUI";

const formatoPeso = (n: number) => "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
const formatoFecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }) : "—");

interface AlumnaFicha {
  id: string; nombre: string; apellido: string; telefono: string | null; dni: string | null; email: string | null;
  disciplinas: string | null; diasHorarios: string | null; activa: boolean;
}
interface CompraPackFicha {
  id: string; clasesContratadas: number; precioAplicado: number; fechaInicio: string; fechaFin: string | null;
  clasesTomadas: number; clasesRestantes: number; estado: string; planNombre: string | null;
}
interface PagoFicha {
  id: string; monto: number; medio: string | null; estado: string; fechaPago: string | null; compraPackResumen: string | null;
}
interface PlanPackOpcion { id: string; clases: number; precio: number }

function EstadoBadgeActiva({ activa }: { activa: boolean }) {
  return activa ? (
    <span className="inline-block whitespace-nowrap rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-deep">Activa</span>
  ) : (
    <span className="inline-block whitespace-nowrap rounded-full bg-cream-alt px-3 py-1 text-xs font-medium text-ink-soft">Inactiva</span>
  );
}

export function FichaAlumnaReal({
  alumna, comprasPack, pagos, planPacks,
}: {
  alumna: AlumnaFicha; comprasPack: CompraPackFicha[]; pagos: PagoFicha[]; planPacks: PlanPackOpcion[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [, iniciarTransicion] = useTransition();
  const [panel, setPanel] = useState<"editar" | "estado" | "pack" | null>(null);
  const packActual = comprasPack[0];

  const refrescar = () => iniciarTransicion(() => router.refresh());

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader
        titulo={<>{alumna.nombre} <span className="italic text-sage-deep">{alumna.apellido}</span></>}
        subtitulo="Ficha de alumna"
        accion={
          <div className="flex flex-wrap items-center gap-2.5">
            <EstadoBadgeActiva activa={alumna.activa} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel("editar")}>
              <Pencil size={14} />
              Editar datos
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPanel("estado")}>
              {alumna.activa ? <UserX size={14} /> : <UserCheck size={14} />}
              {alumna.activa ? "Dar de baja" : "Reactivar"}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setPanel("pack")}>
              <Plus size={14} />
              Nuevo pack
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
            <dl className="divide-y divide-line/60">
              {[
                ["Clases contratadas", `${packActual.clasesContratadas}${packActual.planNombre ? ` (${packActual.planNombre})` : ""}`],
                ["Precio aplicado", formatoPeso(packActual.precioAplicado)],
                ["Inicio", formatoFecha(packActual.fechaInicio)],
                ["Fin", formatoFecha(packActual.fechaFin)],
                ["Tomadas / restantes", `${packActual.clasesTomadas} / ${packActual.clasesRestantes}`],
                ["Estado", packActual.estado],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                  <dt className="shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">{k}</dt>
                  <dd className="min-w-0 break-words text-sm text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="py-6 text-center text-sm text-ink-soft">Todavía no tiene ningún pack cargado.</p>
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
                  <th className="pb-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {comprasPack.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4">{c.clasesContratadas}</td>
                    <td className="py-3 pr-4">{formatoPeso(c.precioAplicado)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{formatoFecha(c.fechaInicio)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{formatoFecha(c.fechaFin)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{c.clasesTomadas} / {c.clasesRestantes}</td>
                    <td className="py-3 text-ink-soft">{c.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Tarjeta>
      </div>

      <div className="mt-5 lg:mt-6">
        <Tarjeta titulo="Pagos">
          {pagos.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">Sin pagos registrados.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Monto</th>
                  <th className="pb-3 font-medium">Método</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Pack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {pagos.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 text-ink-soft">{formatoFecha(p.fechaPago)}</td>
                    <td className="py-3 pr-4">{formatoPeso(p.monto)}</td>
                    <td className="py-3 pr-4 text-ink-soft">{p.medio ?? "sin especificar"}</td>
                    <td className="py-3 pr-4 text-ink-soft">{p.estado}</td>
                    <td className="py-3 text-ink-soft">{p.compraPackResumen ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Tarjeta>
      </div>

      {panel === "editar" && (
        <Modal titulo="Editar datos" onCerrar={() => setPanel(null)}>
          <EditarAlumnaForm
            alumna={alumna}
            onCancelar={() => setPanel(null)}
            onGuardado={() => { setPanel(null); toast("Datos actualizados."); refrescar(); }}
          />
        </Modal>
      )}

      {panel === "estado" && (
        <Modal titulo={alumna.activa ? "Dar de baja" : "Reactivar alumna"} onCerrar={() => setPanel(null)}>
          <CambiarEstadoConfirm
            alumna={alumna}
            onCancelar={() => setPanel(null)}
            onConfirmado={() => { setPanel(null); toast(alumna.activa ? "Alumna dada de baja." : "Alumna reactivada."); refrescar(); }}
          />
        </Modal>
      )}

      {panel === "pack" && (
        <Modal titulo="Nuevo pack" onCerrar={() => setPanel(null)}>
          <NuevoPackForm
            alumnaId={alumna.id}
            planPacks={planPacks}
            onCancelar={() => setPanel(null)}
            onCreado={() => { setPanel(null); toast("Pack creado."); refrescar(); }}
          />
        </Modal>
      )}
    </main>
  );
}

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
          type="button"
          disabled={enviando}
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

function NuevoPackForm({ alumnaId, planPacks, onCancelar, onCreado }: { alumnaId: string; planPacks: PlanPackOpcion[]; onCancelar: () => void; onCreado: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [planElegido, setPlanElegido] = useState("");

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
        };
        const resultado = await crearCompraPackAction(alumnaId, datos);
        setEnviando(false);
        if (!resultado.ok) { setError(resultado.error); return; }
        onCreado();
      }}
    >
      <p className="text-sm leading-relaxed text-ink-soft">
        Elegí un plan vigente para autocompletar clases y precio, o cargá un pack personalizado (excepción, descuento, etc.).
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
            <option key={p.id} value={p.id}>{p.clases} clases — ${p.precio.toLocaleString("es-AR")}</option>
          ))}
        </Selector>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Cantidad de clases" name="clasesContratadas" type="number" min={1} step={1} required />
          <Campo label="Precio a aplicar" name="precioAplicado" type="number" min={0} step={1} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Fecha de inicio" name="fechaInicio" type="date" required />
          <Campo label="Fecha de fin (opcional)" name="fechaFin" type="date" />
        </div>
      </div>

      {error && <p role="alert" className="mt-5 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={enviando} className="btn btn-sage btn-sm disabled:opacity-60">{enviando ? "Creando…" : "Crear pack"}</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  );
}
