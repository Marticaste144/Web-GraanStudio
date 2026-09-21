// Datos generales del estudio. Editá acá y se actualiza en todo el sitio.

export const ESTUDIO = {
  nombre: "Graan Studio",
  subtitulo: "Pilates & Yoga",
  direccion: {
    lugar: "Polo Design, Edificio Bertoia Tower",
    detalle: "Piso 4 Of. 403",
    zona: "Guillermo E. Hudson, Buenos Aires",
  },
  // Placeholders: reemplazar por los datos reales de la clienta.
  contacto: {
    telefono: "[Teléfono]",
    instagram: "[@usuario]",
    email: "[email@graanstudio.com]",
  },
} as const;

export const direccionCompleta = () =>
  `${ESTUDIO.direccion.lugar}, ${ESTUDIO.direccion.detalle}, ${ESTUDIO.direccion.zona}`;

export const BENEFICIOS = [
  {
    icono: "certificado",
    titulo: "Profesoras certificadas",
    texto: "Formación profesional y acompañamiento atento en cada clase.",
  },
  {
    icono: "equipamiento",
    titulo: "Equipamiento premium",
    texto: "Reformers y materiales de primera línea, siempre en perfecto estado.",
  },
  {
    icono: "grupos",
    titulo: "Grupos reducidos",
    texto: "Máximo 8 alumnas por clase para una atención realmente personalizada.",
  },
  {
    icono: "ambiente",
    titulo: "Ambiente boutique",
    texto: "Un espacio cálido y tranquilo, pensado para desconectar.",
  },
] as const;

export const PROFESORAS = [
  { nombre: "[Nombre profesora]", especialidad: "Pilates Reformer" },
  { nombre: "[Nombre profesora]", especialidad: "Yoga y Yoga Mamá" },
  { nombre: "[Nombre profesora]", especialidad: "Método Barre y Full Body" },
] as const;

export const GALERIA = [
  { etiqueta: "[FOTO DEL ESTUDIO]", tono: "arena", icono: "estudio" },
  { etiqueta: "[FOTO DE CLASE]", tono: "salvia", icono: "clase" },
  { etiqueta: "[FOTO DE EQUIPAMIENTO]", tono: "topo", icono: "equipamiento" },
  { etiqueta: "[FOTO DE DETALLE]", tono: "arena", icono: "detalle" },
] as const;
