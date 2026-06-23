import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Generic carousel. Pass `items` + a `renderItem` function.
 * mode="single"  -> one slide at a time, full width (hero banners)
 * mode="scroll"  -> horizontal snap-scroll strip showing several at once (cards)
 */
export default function Carousel({ items, renderItem, mode = 'single', autoPlayMs = 5000, showControls = true, className = '' }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const len = items.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % len), [len]);
  const prev = () => setIndex((i) => (i - 1 + len) % len);

  useEffect(() => {
    if (mode !== 'single' || !autoPlayMs || len <= 1) return;
    const t = setInterval(next, autoPlayMs);
    return () => clearInterval(t);
  }, [mode, autoPlayMs, len, next]);

  if (len === 0) return null;

  if (mode === 'single') {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <div className="relative w-full">
          {items.map((item, i) => (
            <div key={i} className={`transition-opacity duration-500 ${i === index ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'}`}>
              {renderItem(item, i)}
            </div>
          ))}
        </div>
        {len > 1 && showControls && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition-colors">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {items.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // mode === 'scroll'
  const scrollBy = (dir) => {
    trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <div className={`relative group ${className}`}>
      <div ref={trackRef} className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:hidden">
        {items.map((item, i) => (
          <div key={i} className="snap-start flex-shrink-0">{renderItem(item, i)}</div>
        ))}
      </div>
      {len > 1 && (
        <>
          <button onClick={() => scrollBy(-1)} className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 text-[#1a3a5c] opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scrollBy(1)} className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 text-[#1a3a5c] opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}
