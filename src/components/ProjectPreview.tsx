const WIDTH = 300
const HEIGHT = 100
const POINTS = 28

/** Deterministic upward-trending series seeded by the project title. */
function chartPoints(seed: string) {
  let hash = 2166136261
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  const random = () => {
    hash ^= hash << 13
    hash ^= hash >>> 17
    hash ^= hash << 5
    return ((hash >>> 0) % 1000) / 1000
  }

  // Random walk with an upward drift, then stretched to fill the chart height.
  let value = 0
  const values = Array.from({ length: POINTS }, () => (value += (random() - 0.32) * 10))
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  return values.map((v, index) => ({
    x: (index / (POINTS - 1)) * WIDTH,
    y: 88 - ((v - min) / range) * 72,
  }))
}

/**
 * Animated mini dashboard shown inside the featured project's browser mockup
 * until a real screenshot is uploaded. Purely decorative.
 */
export function ProjectPreview({ title }: { title: string }) {
  const points = chartPoints(title)
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`
  const last = points[points.length - 1]

  return (
    <div aria-hidden="true" className="relative flex flex-1 flex-col gap-4 overflow-hidden p-6">
      {/* Soft glow that brightens on card hover */}
      <div className="pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(6_182_212/0.18)_0%,transparent_70%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -top-20 -left-16 size-60 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.14)_0%,transparent_70%)]" />

      <div className="relative flex items-center justify-between">
        <span className="text-gradient-brand font-display text-2xl font-bold">{title}</span>
        <span className="flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 font-mono text-[0.65rem] text-success">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          LIVE
        </span>
      </div>

      <div className="relative grid grid-cols-3 gap-2">
        {[0, 1, 2].map((tile) => (
          <div key={tile} className="relative overflow-hidden rounded-lg border border-white/6 bg-white/3 p-2.5">
            <div className="h-1.5 w-10 rounded-full bg-white/10" />
            <div className={`mt-2 h-3 rounded ${tile === 1 ? 'w-12 bg-brand-alt/35' : 'w-14 bg-brand/35'}`} />
            <div className="mt-1.5 h-1.5 w-8 rounded-full bg-success/30" />
            <div className="preview-shimmer absolute inset-0" style={{ animationDelay: `${tile * 0.5}s` }} />
          </div>
        ))}
      </div>

      <div className="relative min-h-28 flex-1 rounded-lg border border-white/6 bg-white/2">
        <div className="absolute inset-3">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
          >
            <defs>
              <linearGradient id="preview-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="preview-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[25, 50, 75].map((y) => (
              <line
                key={y}
                x1="0"
                x2={WIDTH}
                y1={y}
                y2={y}
                stroke="rgb(255 255 255 / 0.06)"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={area} fill="url(#preview-fill)" className="preview-fade" />
          </svg>
          {/* Line in its own layer so it can be revealed left-to-right with clip-path */}
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="preview-line absolute inset-0 size-full overflow-visible transition-[filter] duration-500 group-hover:drop-shadow-[0_0_6px_rgb(6_182_212/0.6)]"
          >
            <path
              d={line}
              fill="none"
              stroke="url(#preview-stroke)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* End-of-line marker as HTML so it stays round when the chart stretches */}
          <span
            className="preview-fade absolute size-2.5 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(last.x / WIDTH) * 100}%`, top: `${(last.y / HEIGHT) * 100}%` }}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-alt/60" />
            <span className="absolute inset-0 rounded-full border-2 border-ink bg-brand-alt" />
          </span>
        </div>
      </div>
    </div>
  )
}
