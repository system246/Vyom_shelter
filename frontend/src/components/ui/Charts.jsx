/**
 * Lightweight, no-dependency donut chart (pure SVG) with a legend.
 * Replaces recharts' PieChart — smaller, no library overhead, easy to
 * restyle from one place.
 */
export function DonutChart({ data, size = 160, thickness = 22 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0;
    const dash = fraction * circumference;
    const seg = { ...d, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={size} height={size} className="flex-shrink-0 -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        {total === 0 ? null : segments.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
        <circle cx={cx} cy={cy} r={r - thickness / 2 - 6} fill="white" />
        <text x={cx} y={cy} transform={`rotate(90 ${cx} ${cy})`} textAnchor="middle" dominantBaseline="central" className="fill-gray-800" style={{ fontSize: 22, fontWeight: 700 }}>
          {total}
        </text>
      </svg>
      <div className="space-y-2.5 flex-1 min-w-[140px]">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-xs text-gray-500 flex-1">{d.name}</span>
            <span className="text-xs font-semibold text-gray-800">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Horizontal bar list — replaces recharts' BarChart for simple "count per
 * category" comparisons. Bars are width-proportional to the max value.
 */
export function StatusBarList({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{d.name}</span>
            <span className="text-xs font-semibold text-gray-800">{d.value}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
