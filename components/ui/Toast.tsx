"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Check } from "lucide-react";

// Aviso temporal. Es lo que "simula" el éxito de las acciones del demo.
const ToastContext = createContext<(mensaje: string) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mensaje, setMensaje] = useState<{ id: number; texto: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const mostrar = useCallback((texto: string) => {
    clearTimeout(timer.current);
    setMensaje({ id: Date.now(), texto });
    timer.current = setTimeout(() => setMensaje(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
      >
        {mensaje && (
          <div
            key={mensaje.id}
            className="toast-in flex w-full max-w-sm items-center gap-3 rounded-2xl bg-taupe-dark px-5 py-3.5 text-sm text-cream shadow-lg"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage-dark">
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="leading-snug">{mensaje.texto}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
