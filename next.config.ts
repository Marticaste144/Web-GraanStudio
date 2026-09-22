import type { NextConfig } from "next";

// Cabeceras de seguridad razonables para este stack (sin scripts/estilos externos más allá de
// Google Fonts, que ya usa next/font). No endurecer de más acá sin revisar next/font e íconos.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' en script-src: el App Router de Next inyecta scripts inline para
      // hidratación/streaming (sin nonce configurado). Igual bloquea cargar scripts de
      // terceros (ningún dominio externo está permitido). Endurecer con nonce queda
      // pendiente para una revisión de seguridad dedicada.
      // 'unsafe-eval' solo en desarrollo: React lo usa para reconstruir stack traces en dev
      // (nunca en producción, ver next dev). En build de producción no se incluye.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde el celular (misma red WiFi).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
