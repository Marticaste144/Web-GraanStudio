"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  /** Nombre accesible del cuadro de diálogo */
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
}

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Cuadro de diálogo. En celular sube desde abajo como una hoja; en tablet y escritorio se centra.
 * Se cierra con Esc, con el fondo o con la X. Mantiene el foco adentro mientras está abierto.
 */
export function Modal({ titulo, onCerrar, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cerrar.current();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLES)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const primero = items[0];
      const ultimo = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === panel.current)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/45" onClick={onCerrar} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-paper shadow-2xl outline-none sm:max-h-[90dvh] sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-cream-alt hover:text-taupe-dark"
        >
          <X size={20} />
        </button>
        <div className="overflow-y-auto p-5 pr-5 pt-6 sm:p-7">{children}</div>
      </div>
    </div>
  );
}
