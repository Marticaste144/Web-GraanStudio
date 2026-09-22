import "server-only";

interface Email {
  to: string;
  subject: string;
  text: string;
}

/**
 * Envío de emails abstraído detrás de una interfaz simple, para poder enchufar un proveedor
 * real (Resend, SendGrid, etc.) más adelante sin tocar quién la llama.
 *
 * Todavía no hay proveedor configurado: EMAIL_PROVIDER=console (default) solo escribe el email
 * en la terminal del servidor. Para producción falta: elegir proveedor, agregar su API key como
 * variable de entorno y reemplazar esta implementación por la llamada real a su SDK/API.
 */
export async function sendEmail(email: Email): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? "console";

  if (provider === "console") {
    console.log(
      `[email:dev] Para: ${email.to} · Asunto: ${email.subject}\n${email.text}\n` +
        `(EMAIL_PROVIDER=console: no se envió nada real. Configurar un proveedor para producción.)`,
    );
    return;
  }

  throw new Error(`EMAIL_PROVIDER="${provider}" no está implementado todavía.`);
}
