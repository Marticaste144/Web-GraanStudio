# Graan Studio — demo clickeable

Demo visual (Next.js + TypeScript + Tailwind). **No hay backend ni persistencia**: todo son datos mock
y las acciones (anotarse, cargar comprobante, etc.) solo simulan el éxito en memoria.

## Correr

    npm install
    npm run dev          # desarrollo → http://localhost:3000
    # o, más rápido y sin sorpresas para la reunión:
    npm run build && npm start

## Rutas

- `/` landing pública
- `/login` · `/registro` (simulados: entran al portal sin validar nada)
- `/alumno` · `/alumno/mis-clases` · `/alumno/ver-clases` (Reservar) · `/alumno/cuota` · `/alumno/perfil`
- `/admin` · `/admin/alumnos` · `/admin/alumnos/[id]` (ficha de alumna) · `/admin/clases` · `/admin/pagos` · `/admin/metricas` (sin login, solo para mostrar)

Flujo: Landing → Iniciar sesión / Crear cuenta → Portal de alumna → Ver clases → Reservar.
"Iniciar sesión" entra como Sofía (con 3 clases). "Crear cuenta" arranca un portal vacío con el nombre que se escriba.

Truco: `/alumno?dia=miercoles` y `/admin?dia=jueves` fuerzan el día que se toma como "hoy".

## Dónde editar

- `lib/data/horarios.ts` — grilla semanal de clases
- `lib/data/actividades.ts` — las 8 actividades y sus descripciones
- `lib/data/estudio.ts` — dirección, contacto, beneficios, profesoras, galería
- `lib/data/alumna.ts` — Sofía, sus clases, cuota y datos de transferencia
- `lib/data/cupos.ts` — cupos mock (cuáles clases están completas)
- `lib/data/ficha.ts` — clases, asistencia e historial de la ficha de alumna (datos de ejemplo, sin reglas nuevas)
- `lib/data/admin.ts` — alumnas, pagos y métricas del panel (todo se calcula desde una única lista de alumnas)
- `public/logograan.png` — logo original (no se modifica). `components/ui/Logo.tsx` lo muestra
- `app/layout.tsx` — tipografías (Playfair Display + Montserrat)
- `components/ui/FotoPlaceholder.tsx` — acepta `src` para reemplazar cada foto placeholder
