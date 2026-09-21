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
- `/alumno` · `/alumno/mis-clases` · `/alumno/ver-clases` · `/alumno/cuota` · `/alumno/perfil`
- `/admin`

Truco: `/alumno?dia=miercoles` y `/admin?dia=jueves` fuerzan el día que se toma como "hoy".

## Dónde editar

- `lib/data/horarios.ts` — grilla semanal de clases
- `lib/data/actividades.ts` — las 8 actividades y sus descripciones
- `lib/data/estudio.ts` — dirección, contacto, beneficios, profesoras, galería
- `lib/data/alumna.ts` — Sofía, sus clases, cuota y datos de transferencia
- `lib/data/cupos.ts` — cupos mock (cuáles clases están completas)
- `lib/data/admin.ts` — métricas y pagos del panel
- `components/ui/Logo.tsx` — logo provisorio; ahí se cambia por el archivo real
- `components/ui/FotoPlaceholder.tsx` — acepta `src` para reemplazar cada foto placeholder
