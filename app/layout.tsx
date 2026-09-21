import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { AlumnoProvider } from "@/components/alumno/AlumnoProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

// Tipografías de la marca. Serif editorial de alto contraste para títulos y frases destacadas,
// sans limpia para textos, navegación, botones y formularios. Para cambiarlas, tocar solo este bloque.
const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-display",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Graan Studio · Pilates & Yoga",
  description: "Pilates y Yoga en un solo lugar. Clases en grupos reducidos en Guillermo E. Hudson.",
};

export const viewport: Viewport = {
  themeColor: "#F7F3EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh antialiased">
        <ToastProvider>
          <AlumnoProvider>{children}</AlumnoProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
