"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { actualizarPrecioPlanAction } from "@/lib/packs/actions";
import { AdminHeader, Tarjeta } from "./AdminUI";

const formatoPeso = (n: number) => "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

interface Plan { id: string; clases: number; precio: number; activo: boolean }

export function PreciosAdmin({ planes }: { planes: Plan[] }) {
  const router = useRouter();
  const toast = useToast();
  const [, iniciarTransicion] = useTransition();
  const [editando, setEditando] = useState<string | null>(null);
  const [valor, setValor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const empezarEdicion = (plan: Plan) => {
    setEditando(plan.id);
    setValor(String(plan.precio));
    setError(null);
  };

  const guardar = async (plan: Plan) => {
    const nuevoPrecio = Number(valor);
    if (!Number.isInteger(nuevoPrecio) || nuevoPrecio < 0) { setError("Ingresá un precio válido."); return; }
    setGuardando(true);
    const r = await actualizarPrecioPlanAction(plan.id, nuevoPrecio);
    setGuardando(false);
    if (!r.ok) { setError(r.error); return; }
    setEditando(null);
    toast(`Precio de ${plan.clases} clases actualizado a ${formatoPeso(nuevoPrecio)}.`);
    iniciarTransicion(() => router.refresh());
  };

  return (
    <main className="mx-auto max-w-[90rem] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-12">
      <AdminHeader titulo="Precios" subtitulo="Catálogo de planes vigentes. Cambiar un precio acá no modifica los packs ya comprados." />

      <div className="mt-8">
        <Tarjeta titulo="Planes vigentes" subtitulo="Se usan como valor sugerido al crear o renovar un pack">
          <ul className="divide-y divide-line">
            {planes.map((plan) => (
              <li key={plan.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-serif text-xl text-taupe-dark">{plan.clases} clases</p>
                  {!plan.activo && <p className="text-xs text-ink-soft">Plan descontinuado</p>}
                </div>

                {editando === plan.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-ink-soft">$</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      autoFocus
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      className="w-32 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-taupe focus:ring-2 focus:ring-taupe/15"
                    />
                    <button type="button" disabled={guardando} className="btn btn-sage btn-sm disabled:opacity-60" onClick={() => guardar(plan)}>
                      {guardando ? "Guardando…" : "Guardar"}
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" disabled={guardando} onClick={() => setEditando(null)}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-2xl text-taupe-dark">{formatoPeso(plan.precio)}</span>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => empezarEdicion(plan)}>
                      <Pencil size={14} />
                      Editar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {error && <p role="alert" className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-snug text-amber-ink">{error}</p>}
        </Tarjeta>
      </div>
    </main>
  );
}
