import Link from "next/link";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/alumno/PageHeader";
import { ALUMNA, CUOTA } from "@/lib/data/alumna";

const DATOS = [
  { label: "Email", valor: ALUMNA.email },
  { label: "Teléfono", valor: ALUMNA.telefono },
  { label: "Plan", valor: CUOTA.plan.nombre },
  { label: "Alumna desde", valor: ALUMNA.desde },
];

export default function PerfilPage() {
  return (
    <main>
      <PageHeader titulo="Perfil" />
      <div className="px-5 pt-4">
        <div className="flex items-center gap-5">
          <span
            className="grid h-20 w-20 place-items-center rounded-full bg-sage-soft font-serif text-4xl text-sage-dark"
            aria-hidden
          >
            {ALUMNA.nombre[0]}
          </span>
          <div>
            <p className="font-serif text-3xl leading-none text-taupe-dark">
              {ALUMNA.nombre} {ALUMNA.apellido}
            </p>
            <p className="mt-1.5 text-sm text-ink-soft">Alumna</p>
          </div>
        </div>

        <dl className="mt-8 divide-y divide-line border-y border-line">
          {DATOS.map((d) => (
            <div key={d.label} className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-xs uppercase tracking-[0.15em] text-ink-soft">{d.label}</dt>
              <dd className="text-right text-sm text-ink">{d.valor}</dd>
            </div>
          ))}
        </dl>

        <Link href="/" className="btn btn-outline mt-8 w-full">
          <LogOut size={16} />
          Cerrar sesión
        </Link>
      </div>
    </main>
  );
}
