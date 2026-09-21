import { ChevronDown } from "lucide-react";

const ETIQUETA = "mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.15em] text-ink-soft";
const CONTROL =
  "w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-taupe focus:ring-2 focus:ring-taupe/15";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Campo({ label, id, className = "", ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className={ETIQUETA}>
        {label}
      </label>
      <input id={inputId} {...props} className={`${CONTROL} ${className}`} />
    </div>
  );
}

interface SelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

/** Lista desplegable con el mismo estilo que Campo. */
export function Selector({ label, id, className = "", children, ...props }: SelectorProps) {
  const selectId = id ?? props.name;
  return (
    <div>
      <label htmlFor={selectId} className={ETIQUETA}>
        {label}
      </label>
      <div className="relative">
        <select id={selectId} {...props} className={`${CONTROL} appearance-none pr-11 ${className}`}>
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-taupe" aria-hidden />
      </div>
    </div>
  );
}
