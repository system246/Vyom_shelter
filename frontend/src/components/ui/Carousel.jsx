import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({ items, renderItem, mode = 'single', autoPlayMs = 5000, showControls = true, className = '' }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (mode !== 'single' || !autoPlayMs) return;
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % items.length), autoPlayMs);
    return () => clearInterval(timerRef.current);
  }, [items.length, autoPlayMs, mode]);

  if (mode === 'scroll') {
    return (
      <div ref={scrollRef} className={`flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory ${className}`}>
        {items.map((item, i) => (
          <div key={i} className="snap-start flex-shrink-0">{renderItem(item, i)}</div>
        ))}
      </div>
    );
  }

  const prev = () => { setCurrent(c => (c - 1 + items.length) % items.length); clearInterval(timerRef.current); };
  const next = () => { setCurrent(c => (c + 1) % items.length); clearInterval(timerRef.current); };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item, i) => (
          <div key={i} className="w-full flex-shrink-0">{renderItem(item, i)}</div>
        ))}
      </div>
      {showControls && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"><ChevronLeft size={18} /></button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"><ChevronRight size={18} /></button>
        </>
      )}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {items.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}
