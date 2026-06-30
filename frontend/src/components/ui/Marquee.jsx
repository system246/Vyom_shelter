import DynamicIcon from './DynamicIcon';

/**
 * Modern scrolling ticker — icon-paired pill chips on a gradient strip,
 * with a soft glow and pause-on-hover, instead of plain text on a flat bar.
 *
 * `items` can be plain strings (legacy, still supported) or
 * { icon, text } objects for the icon-chip look.
 */
export default function Marquee({ items, className = '', speed = 'normal' }) {
  const anim = speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee';
  const normalized = items.map((it) => (typeof it === 'string' ? { text: it, icon: null } : it));

  return (
    <div className={`relative overflow-hidden whitespace-nowrap ${className}`}>
      {/* edge fade so chips don't look like they're cut off mid-scroll */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a1a2c] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a1a2c] to-transparent z-10" />

      <div className={`marquee-track inline-flex gap-3 py-1 ${anim}`}>
        {[...normalized, ...normalized].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide
                       bg-white/10 backdrop-blur-sm border border-white/15 text-white
                       shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_12px_-4px_rgba(255,182,72,0.25)]"
          >
            {item.icon
              ? <DynamicIcon name={item.icon} size={13} className="text-[#ffb648]" />
              : <span className="text-[#ffb648]">✦</span>}
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
