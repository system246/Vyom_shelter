import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function QuickActionCard({ to, icon: Icon, title, subtitle, gradient = 'from-[#1a3a5c] to-[#2563a8]', dashed = false }) {
  return (
    <Link
      to={to}
      className={`card card-hover relative overflow-hidden p-6 flex flex-col justify-between min-h-[140px] group ${dashed ? 'border-dashed border-2 border-gray-200' : ''}`}
    >
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-sm`}>
          <Icon size={22} className="text-white" />
        </div>
        <p className="font-semibold text-gray-800 mb-1">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <ArrowRight size={16} className="absolute right-5 bottom-5 text-gray-300 group-hover:text-[#1a3a5c] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
