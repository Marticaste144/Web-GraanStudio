"use client";

import { useRef, useState } from "react";
import { CalendarClock, Check, Copy, FileCheck2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { CUOTA, DATOS_TRANSFERENCIA, formatoPeso } from "@/lib/data/alumna";

const CAMPOS: { clave: keyof typeof DATOS_TRANSFERENCIA; label: string }[] = [
  { clave: "titular", label: "Titular" },
  { clave: "banco", label: "Banco" },
  { clave: "alias", label: "Alias" },
  { clave: "cbu", label: "CBU" },
];

export function CuotaVista({ mes, vence }: { mes: string; vence: string }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  // Solo en memoria: no se sube ni se guarda el archivo. Solo guardamos el nombre para mostrarlo.
  const [comprobante, setComprobante] = useState<string | null>(null);

  const copiar = async (label: string, valor: string) => {
    try {
      await navigator.clipboard.writeText(valor);
    } catch {
      // Sin acceso al portapapeles (ej. http en el celular): el demo igual avisa.
    }
    toast(`${label} copiado`);
  };

  return (
    <div className="space-y-8 px-5 pt-6">
      {/* Estado de la cuota */}
      <section className="rounded-3xl border border-line bg-paper p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Cuota de {mes}</p>
            <p className="mt-3 font-serif text-6xl leading-none text-taupe-dark">
              {formatoPeso(CUOTA.plan.monto)}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{CUOTA.plan.nombre}</p>
          </div>
          {comprobante ? (
            <span className="pop shrink-0 rounded-full bg-sage-soft px-3 py-1.5 text-xs font-medium text-sage-dark">
              En revisión
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-amber-soft px-3 py-1.5 text-xs font-medium text-amber-ink">
              Pendiente
            </span>
          )}
        </div>
        <p className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-sm text-ink-soft">
          <CalendarClock size={16} className="text-taupe" />
          {comprobante ? "Recibimos tu comprobante y lo estamos revisando." : `Próximo vencimiento: ${vence}`}
        </p>
      </section>

      {/* Datos de transferencia */}
      <section>
        <h2 className="text-3xl text-taupe-dark">Datos para transferir</h2>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          {CAMPOS.map(({ clave, label }) => (
            <div key={clave} className="flex items-center gap-3 py-3.5">
              <dt className="w-20 shrink-0 text-xs uppercase tracking-[0.15em] text-ink-soft">{label}</dt>
              <dd className="flex-1 break-all text-sm text-ink">{DATOS_TRANSFERENCIA[clave]}</dd>
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
      </section>

      {/* Comprobante */}
      <section>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (!archivo) return;
            setComprobante(archivo.name);
            toast("¡Comprobante recibido! Lo revisamos y te avisamos.");
            e.target.value = "";
          }}
        />

        {comprobante ? (
          <div className="pop flex items-center gap-4 rounded-2xl border border-sage/50 bg-sage-soft/60 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-dark text-white">
              <Check size={20} strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-taupe-dark">Comprobante cargado</p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-soft">
                <FileCheck2 size={13} className="shrink-0" />
                <span className="truncate">{comprobante}</span>
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
          <button onClick={() => inputRef.current?.click()} className="btn btn-primary w-full py-4">
            <Upload size={18} />
            Cargar comprobante
          </button>
        )}
      </section>
    </div>
  );
}
