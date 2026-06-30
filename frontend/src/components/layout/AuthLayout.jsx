import { Link } from 'react-router-dom';
import { ShieldCheck, BadgeCheck, Sparkles } from 'lucide-react';
import logo from '../../assets/logo.png';
import BackButton from '../ui/BackButton';

const FEATURES = [
  { icon: ShieldCheck, text: 'Verified property listings, end to end' },
  { icon: BadgeCheck,  text: 'Trusted by associates across India' },
  { icon: Sparkles,    text: 'Earn through every property deal you bring' },
];

/**
 * Shared split-screen layout for every auth page (Login/Signup/Forgot
 * Password/Verify OTP) — replaces the old flat centered white box with a
 * branded gradient panel on one side and the actual form on the other.
 */
export default function AuthLayout({ icon: Icon, iconGradient = 'from-[#1a3a5c] to-[#2563a8]', title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#0a1a2c] via-[#132d49] to-[#1f4a73] text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#e85d26]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#2563a8]/30 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center p-1.5">
            <img src={logo} alt="Vyom Shelter" className="w-full h-full object-cover" style={{ objectPosition: 'center 35%' }} />
          </div>
          <div>
            <p className="font-semibold text-sm">Vyom Shelter</p>
            <p className="text-[10px] text-blue-200">Verified Property Broker</p>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Welcome to the<br /><span className="text-[#ffb648]">Associate Network</span>
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
            Manage properties, track leads, and grow your network — all from one verified portal.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {FEATURES.map(({ icon: FIcon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-blue-100">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <FIcon size={15} className="text-[#ffb648]" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12 bg-[#f0f4fa]">
        <div className="w-full max-w-md">
          <BackButton to="/" label="Back to Home" />
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className={`w-14 h-14 bg-gradient-to-br ${iconGradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <Icon size={26} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a3a5c]">{title}</h1>
              {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
            </div>

            {children}

            {footer && <div className="text-center mt-6 space-y-2">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
