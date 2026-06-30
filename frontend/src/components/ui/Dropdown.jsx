import { useState, useRef, useEffect } from 'react';

/**
 * Generic dropdown menu — click trigger to open, click outside or an item
 * to close. Used to group secondary nav links so the topbar never overflows,
 * no matter how many admin sections exist.
 */
export default function Dropdown({ trigger, children, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'}
                      min-w-[220px] bg-white rounded-2xl shadow-2xl border border-gray-100
                      py-2 z-50 animate-[fadeIn_0.15s_ease-out]`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
