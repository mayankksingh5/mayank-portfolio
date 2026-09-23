export function ProgressBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full bg-slate-900 transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
