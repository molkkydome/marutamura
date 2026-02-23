// Memphis-style geometric decoration components

export function MemphisBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Large circles */}
      <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full border-[3px] border-black opacity-20" style={{ background: "var(--color-mint)" }} />
      <div className="absolute top-[120px] left-[-30px] w-20 h-20 rounded-full border-[3px] border-black opacity-25" style={{ background: "var(--color-lilac)" }} />
      <div className="absolute bottom-[200px] right-[-20px] w-24 h-24 rounded-full border-[3px] border-black opacity-20" style={{ background: "var(--color-yellow)" }} />

      {/* Triangles */}
      <svg className="absolute top-[200px] right-[20px] opacity-20" width="40" height="40" viewBox="0 0 40 40">
        <polygon points="20,2 38,38 2,38" fill="none" stroke="black" strokeWidth="3" />
      </svg>
      <svg className="absolute bottom-[300px] left-[10px] opacity-15" width="30" height="30" viewBox="0 0 30 30">
        <polygon points="15,2 28,28 2,28" fill="var(--color-coral)" stroke="black" strokeWidth="2.5" />
      </svg>

      {/* Rectangles */}
      <div className="absolute top-[350px] left-[15px] w-12 h-8 border-[3px] border-black opacity-20 rotate-12" style={{ background: "var(--color-sky)" }} />
      <div className="absolute top-[80px] right-[30px] w-8 h-8 border-[3px] border-black opacity-20 -rotate-6" style={{ background: "var(--color-yellow)" }} />

      {/* Dots grid */}
      <div className="absolute top-[160px] right-[60px] grid grid-cols-3 gap-2 opacity-30">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-black" />
        ))}
      </div>
      <div className="absolute bottom-[250px] left-[40px] grid grid-cols-3 gap-2 opacity-25">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-black" />
        ))}
      </div>

      {/* Diamond */}
      <div className="absolute top-[300px] right-[50px] w-5 h-5 bg-black opacity-20 rotate-45" />
      <div className="absolute bottom-[350px] left-[60px] w-4 h-4 border-[2.5px] border-black opacity-25 rotate-45" />

      {/* Lines */}
      <div className="absolute top-[450px] left-0 w-16 h-[3px] bg-black opacity-15" />
      <div className="absolute bottom-[180px] right-0 w-20 h-[3px] bg-black opacity-15" />

      {/* Zigzag */}
      <svg className="absolute bottom-[400px] right-[10px] opacity-15" width="30" height="20" viewBox="0 0 30 20">
        <polyline points="0,10 7.5,2 15,10 22.5,2 30,10" fill="none" stroke="black" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const config: Record<string, { label: string; color: string }> = {
    health:       { label: "🏃 健康", color: "var(--color-mint)" },
    study:        { label: "📚 勉強", color: "var(--color-sky)" },
    work:         { label: "💼 仕事", color: "var(--color-yellow)" },
    hobby:        { label: "🎨 趣味", color: "var(--color-lilac)" },
    relationship: { label: "❤️ 人間関係", color: "var(--color-coral)" },
    finance:      { label: "💰 お金", color: "var(--color-mint)" },
    other:        { label: "✨ その他", color: "var(--color-peach)" },
  };
  const c = config[category] ?? config.other;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold border-2 border-black rounded-full"
      style={{ background: c.color }}
    >
      {c.label}
    </span>
  );
}

export function MoodBadge({ mood }: { mood: string }) {
  const config: Record<string, { label: string; color: string }> = {
    great:   { label: "🌟 最高！", color: "var(--color-yellow)" },
    good:    { label: "😊 良い", color: "var(--color-mint)" },
    neutral: { label: "😐 普通", color: "var(--color-sky)" },
    bad:     { label: "😔 辛い", color: "var(--color-lilac)" },
    terrible:{ label: "😭 最悪", color: "var(--color-coral)" },
  };
  const c = config[mood] ?? config.neutral;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold border-2 border-black rounded-full"
      style={{ background: c.color }}
    >
      {c.label}
    </span>
  );
}

export function ProgressRing({ percent, size = 80 }: { percent: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(85% 0.04 55)" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--color-coral)"
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        className="rotate-90"
        style={{
          transform: `rotate(90deg) translate(0, 0)`,
          transformOrigin: `${size / 2}px ${size / 2}px`,
          fontSize: size * 0.22,
          fontWeight: 900,
          fontFamily: "'Black Han Sans', sans-serif",
          fill: "var(--foreground)",
        }}
      >
        {percent}%
      </text>
    </svg>
  );
}
