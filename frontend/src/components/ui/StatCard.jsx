import { Link } from 'react-router-dom';

/**
 * Premium stat card — gradient icon badge, soft decorative blur, big number.
 * `gradient` is a tailwind "from-x to-y" string so each stat can have its
 * own accent while staying visually consistent.
 */
export default function StatCard({ icon: Icon, label, value, gradient = 'from-[#1a3a5c] to-[#2563a8]', to }) {
  const Wrapper = to ? Link : 'div';
  const wrapperProps = to ? { to } : {};
  return (
    <Wrapper {...wrapperProps} className="card card-hover relative overflow-hidden p-5 block">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm relative z-10`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-3xl font-bold text-gray-800 relative z-10">{value ?? '—'}</p>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-1 relative z-10">{label}</p>
    </Wrapper>
  );
}
