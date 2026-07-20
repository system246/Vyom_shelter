import { useEffect, useState, useCallback } from 'react';
import { X, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const INITIAL_DELAY_MS = 3000;      // wait 3s after page load before first show

/**
 * Promotional popup ad — shows the Gamri Mor plot advertisement.
 * - First appearance: 3 seconds after component mounts
 * - Reappears: every 2 minutes after last close
 * - "Don't show again" hides it for the current session only (sessionStorage)
 * - Clicking the image navigates to the properties page
 */
export default function AdPopup() {
  const [visible, setVisible]   = useState(false);
  const [closing, setClosing]   = useState(false); // for fade-out animation

  const open  = useCallback(() => {
    if (sessionStorage.getItem('ad_dismissed')) return;
    setClosing(false);
    setVisible(true);
  }, []);

  const close = (permanent = false) => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
    if (permanent) sessionStorage.setItem('ad_dismissed', '1');
  };

  useEffect(() => {
    // First show
    const initial = setTimeout(open, INITIAL_DELAY_MS);
    // Repeat every 2 minutes
    const interval = setInterval(open, INTERVAL_MS);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [open]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300
        ${closing ? 'opacity-0' : 'opacity-100'}
        bg-black/60 backdrop-blur-sm`}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className={`relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl
        transition-all duration-300 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>

        {/* Close button */}
        <button
          onClick={() => close()}
          aria-label="Close advertisement"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm
                     flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Ad image — clicking goes to properties */}
        <Link
          to="/properties?propertyType=plot&city=Agra"
          onClick={() => close()}
          className="block"
        >
          <img
            src="/promo-gamri-mor.jpg"
            alt="Residential Plots at Gamri Mor, Malpura Jagner Road, Agra — Vyom Shelter Pvt. Ltd."
            className="w-full object-cover"
          />
        </Link>

        {/* Quick action bar */}
        <div className="bg-[#1a3a5c] px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-white text-xs font-semibold">गामरी मोड़, मलपुरा जगनेर रोड, आगरा</p>
            <p className="text-blue-200 text-[10px] mt-0.5">Vyom Shelter Pvt. Ltd.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="tel:9358344037"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e85d26] rounded-lg text-white text-xs font-semibold hover:bg-orange-500 transition-colors">
              <Phone size={12} /> Call Now
            </a>
            <Link
              to="/properties?propertyType=plot&city=Agra"
              onClick={() => close()}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/15 rounded-lg text-white text-xs font-medium hover:bg-white/25 transition-colors">
              <ExternalLink size={12} /> View
            </Link>
          </div>
        </div>

        {/* Don't show again */}
        <button
          onClick={() => close(true)}
          className="w-full bg-black/70 text-gray-300 text-[10px] py-2 hover:text-white transition-colors"
        >
          Don't show this again this session
        </button>
      </div>
    </div>
  );
}
