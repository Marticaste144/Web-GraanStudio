interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Campo({ label, id, className = "", ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className={`w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-taupe focus:ring-2 focus:ring-taupe/15 ${className}`}
      />
    </div>
  );
}
