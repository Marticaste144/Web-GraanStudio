"use client";

import Link from "next/link";
import { useRef } from "react";
import { CalendarClock, Check, Copy, FileCheck2, Upload } from "lucide-react";
import { Importe } from "@/components/ui/Importe";
import { useToast } from "@/components/ui/Toast";
import { DATOS_TRANSFERENCIA, formatoPeso } from "@/lib/data/alumna";
import { useAlumno } from "./AlumnoProvider";
import { EstadoCuota } from "./CuotaResumen";
import { PageHeader } from "./PageHeader";

const CAMPOS: { clave: keyof typeof DATOS_TRANSFERENCIA; label: string }[] = [
  { clave: "titular", label: "Titular" },
  { clave: "banco", label: "Banco" },
  { clave: "alias", label: "Alias" },
  { clave: "cbu", label: "CBU" },
];

export function CuotaVista({ mes, vence }: { mes: string; vence: string }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  // Solo en memoria: no se sube ni se guarda el archivo. Solo se recuerda el nombre para mostrarlo.
  const { plan, comprobante, cargarComprobante } = useAlumno();

  const copiar = async (label: string, valor: string) => {
    try {
      await navigator.clipboard.writeText(valor);
    } catch {
      // Sin acceso al portapapeles (ej. http en el celular): el demo igual avisa.
    }
    toast(`${label} copiado`);
  };

  return (
    <main>
      <PageHeader eyebrow="Mi cuota" titulo="Tu cuota mensual" subtitulo="Estado del mes y datos para abonar por transferencia." />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2 lg:gap-5">
        {/* Estado de la cuota + comprobante */}
        <div className="space-y-4">
          <section className="rounded-3xl border border-sage/40 bg-sage-soft p-5 sm:p-7">
            {plan ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-3">
                  <div>
                    <p className="eyebrow">Cuota de {mes}</p>
                    <p className="mt-4 font-serif text-5xl leading-none text-taupe-dark sm:text-6xl">
                      <Importe valor={formatoPeso(plan.monto)} />
                    </p>
                    <p className="mt-2 text-sm text-ink-soft">{plan.nombre}</p>
                  </div>
                  <EstadoCuota enRevision={Boolean(comprobante)} />
                </div>
                <p className="mt-6 flex items-center gap-2 border-t border-sage/40 pt-4 text-sm text-ink-soft">
                  <CalendarClock size={16} className="shrink-0 text-taupe" />
                  {comprobante ? "Recibimos tu comprobante y lo estamos revisando." : `Próximo vencimiento: ${vence}`}
                </p>
              </>
            ) : (
              <div className="text-center">
                <p className="font-serif text-3xl text-taupe-dark">Todavía no tenés cuota</p>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
                  Tu cuota se arma según las clases que elijas.
                </p>
                <Link href="/alumno/ver-clases" className="btn btn-primary mt-6">
                  Ver clases disponibles
                </Link>
              </div>
            )}
          </section>

          {plan && (
            <section>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (!archivo) return;
                  cargarComprobante(archivo.name);
                  toast("¡Comprobante recibido! Lo revisamos y te avisamos.");
                  e.target.value = "";
                }}
              />
              {comprobante ? (
                <div className="pop flex items-center gap-4 rounded-2xl border border-sage-deep/40 bg-sage-mist p-4 sm:p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-deep text-white">
                    <Check size={20} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-taupe-dark">Comprobante cargado</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                      <FileCheck2 size={13} className="shrink-0" />
                      <span className="break-all">{comprobante}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="shrink-0 text-xs font-medium text-taupe-dark underline underline-offset-4"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <button onClick={() => inputRef.current?.click()} className="btn btn-sage w-full py-4">
                  <Upload size={18} />
                  Cargar comprobante
                </button>
              )}
            </section>
          )}
        </div>

        {/* Datos de transferencia */}
        <section className="rounded-3xl border border-line bg-paper p-5 sm:p-7">
          <h2 className="text-2xl text-taupe-dark sm:text-3xl">Datos para transferir</h2>
          <dl className="mt-5 divide-y divide-line border-y border-line">
            {CAMPOS.map(({ clave, label }) => (
              <div key={clave} className="flex items-center gap-3 py-4">
                <dt className="w-20 shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft">{label}</dt>
                <dd className="min-w-0 flex-1 break-words text-sm text-ink">{DATOS_TRANSFERENCIA[clave]}</dd>
                <button
                  aria-label={`Copiar ${label}`}
                  onClick={() => copiar(label, DATOS_TRANSFERENCIA[clave])}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-taupe transition-colors hover:bg-cream-alt"
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-ink-soft">
            Una vez que transferís, cargá el comprobante para que podamos acreditar tu pago.
          </p>
        </section>
      </div>
    </main>
  );
}
