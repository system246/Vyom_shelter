import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const INTERVAL_MS   = 1 * 60 * 1000; // 1 minute between each ad
const INITIAL_DELAY = 3000;
const WHATSAPP_NUMBER = '919358344037';

const ADS = [
  {
    id: 'gamri-mor',
    image: '/promo-gamri-mor.jpg',
    alt: 'Residential Plots at Gamri Mor, Malpura Jagner Road, Agra — Vyom Shelter Pvt. Ltd.',
    linkTo: '/properties?propertyType=plot&city=Agra',
    phone: '9358344037',
    whatsappMsg: 'Hello, I am interested in the residential plots at Gamri Mor, Agra. Please share more details.',
    label: 'गामरी मोड़, मलपुरा जगनेर रोड, आगरा',
    sublabel: 'Residential Plots — Vyom Shelter Pvt. Ltd.',
  },
  {
    id: 'associate-career',
    image: '/promo-associate-career.jpg',
    alt: 'Join as a Real Estate Associate — Vyom Shelter Pvt. Ltd. with KRS Buildinfra',
    linkTo: '/signup',
    phone: '9997773770',
    whatsappMsg: 'Hello, I want to join as a Real Estate Associate with Vyom Shelter. Please guide me.',
    label: 'Join as a Real Estate Associate',
    sublabel: 'Earn ₹50,000–₹2,00,000/month — Vyom Shelter × KRS Buildinfra',
  },
  // ← ADD THIS THIRD ENTRY
  {
    id: 'independence-offer',
    image: '/promo-independence-offer.jpg',
    alt: 'Independence Day & Rakshabandhan Special Offer — Free Honda Activa on Plot Purchase',
    linkTo: '/properties?propertyType=plot&city=Agra',
    phone: '9358344037',
    whatsappMsg: 'Hello, I am interested in the Independence Day plot offer at Gamari, Malpura-Jagner. Please share details.',
    label: 'स्वतंत्रता दिवस एवं रक्षाबंधन ऑफर — 31 अगस्त तक',
    sublabel: 'प्रत्येक प्लॉट की खरीद पर पाएं Honda Activa — Gamari, Malpura-Jagner Project',
  },
];

export default function AdPopup() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const indexRef = useRef(0);

  const open = useCallback(() => {
    if (sessionStorage.getItem('ad_dismissed')) return;
    const next = (indexRef.current + 1) % ADS.length;
    indexRef.current = next;
    setAdIndex(next);
    setClosing(false);
    setVisible(true);
  }, []);

  const close = (permanent = false) => {
    setClosing(true);
    setTimeout(() => { setVisible(false); setClosing(false); }, 300);
    if (permanent) sessionStorage.setItem('ad_dismissed', '1');
  };

  useEffect(() => {
    const initial  = setTimeout(open, INITIAL_DELAY);
    const interval = setInterval(open, INTERVAL_MS);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [open]);

  if (!visible) return null;

  const ad = ADS[adIndex];
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(ad.whatsappMsg)}`;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${closing ? 'opacity-0' : 'opacity-100'} bg-black/65 backdrop-blur-sm`}
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div className={`relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>

        <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
          {adIndex + 1} / {ADS.length}
        </div>

        <button onClick={() => close()} aria-label="Close advertisement"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors">
          <X size={16} />
        </button>

        <Link to={ad.linkTo} onClick={() => close()} className="block">
          <img src={ad.image} alt={ad.alt} className="w-full object-cover" />
        </Link>

        <div className="bg-[#1a3a5c] px-4 py-3">
          <p className="text-white text-xs font-semibold line-clamp-1">{ad.label}</p>
          <p className="text-blue-200 text-[10px] mt-0.5 line-clamp-1">{ad.sublabel}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-green-500 rounded-lg text-white text-xs font-semibold transition-colors">
              <MessageCircle size={13} /> WhatsApp
            </a>
            <a href={`tel:${ad.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#e85d26] hover:bg-orange-500 rounded-lg text-white text-xs font-semibold transition-colors">
              <Phone size={13} /> Call Now
            </a>
            <Link to={ad.linkTo} onClick={() => close()}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-white text-xs font-medium transition-colors">
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        <div className="bg-[#132d49] flex items-center justify-between px-4 py-2">
          <div className="flex gap-1.5">
            {ADS.map((_, i) => (
              <span key={i} className={`block h-1.5 rounded-full transition-all duration-300 ${i === adIndex ? 'w-5 bg-[#ffb648]' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
          <button onClick={() => close(true)} className="text-[10px] text-blue-400 hover:text-blue-200 transition-colors">
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
}
