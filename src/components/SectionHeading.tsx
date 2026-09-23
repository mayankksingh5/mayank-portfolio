export function SectionHeading({ id, label, title }: { id: string; label: string; title: string }) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs text-brand">// {label.toLowerCase()}</p>
      <h2
        id={id}
        className="text-gradient-strong font-display text-[clamp(1.8rem,4vw,2.5rem)] font-bold"
      >
        {title}
      </h2>
    </div>
  )
}
