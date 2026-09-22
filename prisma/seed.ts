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

async function main() {
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

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
