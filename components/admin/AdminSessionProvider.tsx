"use client";

import { createContext, useContext } from "react";
import type { Role } from "@prisma/client";

export interface AdminSession {
  role: Role;
  displayName: string;
}

const Ctx = createContext<AdminSession | null>(null);

/** Datos mínimos y no sensibles de la sesión (rol + nombre a mostrar), calculados en el servidor. */
export function AdminSessionProvider({ value, children }: { value: AdminSession; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminSession debe usarse dentro de <AdminSessionProvider>");
  return ctx;
}
