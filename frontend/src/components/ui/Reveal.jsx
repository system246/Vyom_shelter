import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, className = '', stagger = false, as: Tag = 'div' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!stagger) {
    return (
      <Tag ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'} ${className}`}>
        {children}
      </Tag>
    );
  }

  const items = Array.isArray(children) ? children : [children];
  return (
    <Tag ref={ref} className={className}>
      {items.map((child, i) => (
        <div key={i} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
          style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}>
          {child}
        </div>
      ))}
    </Tag>
  );
}
