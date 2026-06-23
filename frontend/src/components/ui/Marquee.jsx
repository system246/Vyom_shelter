/**
 * Infinite scrolling text ticker. Pass `items` (strings); they're duplicated
 * once internally so the loop is seamless.
 */
export default function Marquee({ items, className = '', speed = 'normal' }) {
  const anim = speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee';
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className={`inline-flex ${anim}`}>
        {[...items, ...items].map((text, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 text-sm font-semibold uppercase tracking-wide">
            {text}
            <span className="text-[#e85d26]">&#9670;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
