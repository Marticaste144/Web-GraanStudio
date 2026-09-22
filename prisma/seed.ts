// Crea (o actualiza) las cuentas iniciales a partir de variables de entorno.
// No inventa credenciales: si las 3 variables de una cuenta no están seteadas, esa cuenta
// simplemente no se crea. Ver .env.example para la lista completa.
//
// Uso: npm run db:seed

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

interface CuentaSeed {
  rol: "OWNER" | "ADMIN" | "STUDENT";
  emailVar: string;
  passwordVar: string;
  displayNameVar: string;
  isSupport?: boolean;
}

const CUENTAS: CuentaSeed[] = [
  { rol: "OWNER", emailVar: "OWNER_EMAIL", passwordVar: "OWNER_TEMP_PASSWORD", displayNameVar: "OWNER_DISPLAY_NAME" },
  { rol: "ADMIN", emailVar: "ADMIN_EMAIL", passwordVar: "ADMIN_TEMP_PASSWORD", displayNameVar: "ADMIN_DISPLAY_NAME" },
  {
    // OWNER para poder probar también las secciones exclusivas de la dueña mientras se desarrolla.
    rol: "OWNER",
    emailVar: "DEV_EMAIL",
    passwordVar: "DEV_TEMP_PASSWORD",
    displayNameVar: "DEV_DISPLAY_NAME",
    isSupport: true,
  },
];

async function seedCuentas() {
  for (const cuenta of CUENTAS) {
    const email = process.env[cuenta.emailVar]?.trim().toLowerCase();
    const password = process.env[cuenta.passwordVar];
    const displayName = process.env[cuenta.displayNameVar]?.trim();

    if (!email || !password || !displayName) {
      console.log(`- Salteando ${cuenta.emailVar}: faltan variables de entorno.`);
      continue;
    }

    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashPassword(password),
        role: cuenta.rol,
        displayName,
        isSupport: cuenta.isSupport ?? false,
        mustChangePassword: true,
      },
    });
    console.log(`✔ Cuenta lista: ${email} (${cuenta.rol}${cuenta.isSupport ? ", soporte" : ""})`);
  }
}

// ---------------------------------------------------------------------------
// Bloque 2: profesoras, disciplinas y horario semanal recurrente reales.
// Cupo confirmado por la dueña: 6 alumnas por clase (editable por clase desde el Admin).
// ---------------------------------------------------------------------------

const CUPO_CONFIRMADO = 6;

const PROFESORAS_REALES = ["Graziella", "Xiomara", "Lara", "Patricia", "Verónica", "Valeria", "Julieta"];

const DISCIPLINAS_REALES: { nombre: string; aConsulta: boolean }[] = [
  { nombre: "Pilates Reformer", aConsulta: false },
  { nombre: "Yoga", aConsulta: false },
  { nombre: "Método Barre", aConsulta: false },
  { nombre: "Stretching", aConsulta: false },
  { nombre: "Full Body", aConsulta: false },
  { nombre: "Esferodinamia", aConsulta: false },
  // Sin horario todavía ("a consultar"): no se le carga ningún ClaseRecurrente.
  { nombre: "Clases para embarazadas", aConsulta: true },
];

type Dia = "lunes" | "martes" | "miercoles" | "jueves" | "viernes";

interface FilaHorario {
  dia: Dia;
  hora: string;
  profesora: string;
  disciplina: string;
}

// Horario semanal real confirmado por la dueña. No se completan los huecos (ej. no hay clase
// a las 15:00, ni miércoles/viernes a las 16:00): son horarios sin actividad, no datos faltantes.
const HORARIO_REAL: FilaHorario[] = [
  // Lunes
  { dia: "lunes", hora: "08:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "09:00", profesora: "Lara", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "10:00", profesora: "Lara", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "11:00", profesora: "Lara", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "12:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "13:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "14:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "16:00", profesora: "Graziella", disciplina: "Método Barre" },
  { dia: "lunes", hora: "17:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "18:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "lunes", hora: "19:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  // Martes
  { dia: "martes", hora: "08:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "martes", hora: "09:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "martes", hora: "10:00", profesora: "Xiomara", disciplina: "Yoga" },
  { dia: "martes", hora: "11:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "martes", hora: "12:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "martes", hora: "13:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "martes", hora: "14:00", profesora: "Verónica", disciplina: "Yoga" },
  { dia: "martes", hora: "16:00", profesora: "Valeria", disciplina: "Pilates Reformer" },
  { dia: "martes", hora: "17:00", profesora: "Valeria", disciplina: "Pilates Reformer" },
  { dia: "martes", hora: "18:00", profesora: "Valeria", disciplina: "Pilates Reformer" },
  { dia: "martes", hora: "19:00", profesora: "Valeria", disciplina: "Pilates Reformer" },
  // Miércoles
  { dia: "miercoles", hora: "08:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "miercoles", hora: "09:00", profesora: "Lara", disciplina: "Pilates Reformer" },
  { dia: "miercoles", hora: "10:00", profesora: "Lara", disciplina: "Pilates Reformer" },
  { dia: "miercoles", hora: "11:00", profesora: "Lara", disciplina: "Pilates Reformer" },
  { dia: "miercoles", hora: "12:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "miercoles", hora: "13:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "miercoles", hora: "17:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "miercoles", hora: "18:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "miercoles", hora: "19:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  // Jueves
  { dia: "jueves", hora: "08:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "jueves", hora: "09:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "jueves", hora: "10:00", profesora: "Graziella", disciplina: "Método Barre" },
  { dia: "jueves", hora: "11:00", profesora: "Patricia", disciplina: "Stretching" },
  { dia: "jueves", hora: "12:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "jueves", hora: "13:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "jueves", hora: "16:00", profesora: "Valeria", disciplina: "Pilates Reformer" },
  { dia: "jueves", hora: "17:00", profesora: "Valeria", disciplina: "Pilates Reformer" },
  { dia: "jueves", hora: "18:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "jueves", hora: "19:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  // Viernes
  { dia: "viernes", hora: "08:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "viernes", hora: "09:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "viernes", hora: "10:00", profesora: "Xiomara", disciplina: "Pilates Reformer" },
  { dia: "viernes", hora: "11:00", profesora: "Julieta", disciplina: "Full Body" },
  { dia: "viernes", hora: "12:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "viernes", hora: "13:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "viernes", hora: "14:00", profesora: "Verónica", disciplina: "Yoga" },
  { dia: "viernes", hora: "17:00", profesora: "Julieta", disciplina: "Esferodinamia" },
  { dia: "viernes", hora: "18:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
  { dia: "viernes", hora: "19:00", profesora: "Patricia", disciplina: "Pilates Reformer" },
];

async function seedClases() {
  const profesoraIdPorNombre = new Map<string, string>();
  for (const nombre of PROFESORAS_REALES) {
    const p = await prisma.profesora.upsert({ where: { nombre }, update: {}, create: { nombre } });
    profesoraIdPorNombre.set(nombre, p.id);
  }
  console.log(`✔ ${PROFESORAS_REALES.length} profesoras listas.`);

  const disciplinaIdPorNombre = new Map<string, string>();
  for (const d of DISCIPLINAS_REALES) {
    const row = await prisma.disciplina.upsert({ where: { nombre: d.nombre }, update: {}, create: d });
    disciplinaIdPorNombre.set(d.nombre, row.id);
  }
  console.log(`✔ ${DISCIPLINAS_REALES.length} disciplinas listas (incluye "Clases para embarazadas", sin horario).`);

  for (const fila of HORARIO_REAL) {
    const profesoraId = profesoraIdPorNombre.get(fila.profesora);
    const disciplinaId = disciplinaIdPorNombre.get(fila.disciplina);
    if (!profesoraId || !disciplinaId) {
      throw new Error(`Fila de horario con profesora/disciplina desconocida: ${JSON.stringify(fila)}`);
    }
    await prisma.claseRecurrente.upsert({
      where: { dia_hora: { dia: fila.dia, hora: fila.hora } },
      update: { profesoraId, disciplinaId, cupo: CUPO_CONFIRMADO, activa: true },
      create: { dia: fila.dia, hora: fila.hora, profesoraId, disciplinaId, cupo: CUPO_CONFIRMADO },
    });
  }
  console.log(`✔ ${HORARIO_REAL.length} clases recurrentes cargadas (cupo ${CUPO_CONFIRMADO} c/u).`);
}

async function main() {
  await seedCuentas();
  await seedClases();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
