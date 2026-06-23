const VARIANTS = {
  navy:   'bg-[#1a3a5c] text-white',
  orange: 'bg-[#e85d26] text-white',
  green:  'bg-green-50 text-green-700 border border-green-200',
  red:    'bg-red-50 text-red-600 border border-red-200',
  gray:   'bg-gray-100 text-gray-600',
  pale:   'bg-[#e8f0fb] text-[#1a3a5c]',
};

export default function Badge({ children, variant = 'gray', icon: Icon, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${VARIANTS[variant]} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
