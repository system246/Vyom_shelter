import { useEffect, useRef, useState } from 'react';

/**
 * Fade-up reveal on scroll into view. Self-contained (own IntersectionObserver) —
 * does NOT depend on Locomotive Scroll's automatic .is-inview class, which
 * can fail to fire depending on container setup and leave content stuck at
 * opacity:0 forever (looks like a blank gap in the page, space reserved but
 * nothing visible). Once revealed, it stays revealed.
 */
export default function Reveal({ children, className = '', stagger = false, as: Tag = 'div' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!stagger) {
    return (
      <Tag
        ref={ref}
        className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'} ${className}`}
      >
        {children}
      </Tag>
    );
  }

  // Stagger mode: children animate in sequence
  const items = Array.isArray(children) ? children : [children];
  return (
    <Tag ref={ref} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
          style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}
        >
          {child}
        </div>
      ))}
    </Tag>
  );
}
