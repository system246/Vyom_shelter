/**
 * Colorful gradient banner header for inner pages (admin lists, profile,
 * etc.) — replaces the old plain "text-xl font-bold" headers with something
 * that actually looks like part of a modern product, not a boring box.
 */
export default function PageHeader({ icon: Icon, title, subtitle, gradient = 'from-[#1a3a5c] via-[#1f4a73] to-[#2563a8]', action }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-white p-6 mb-6`}>
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-white" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            {subtitle && <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
