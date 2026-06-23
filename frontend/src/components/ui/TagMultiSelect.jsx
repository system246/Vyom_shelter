import DynamicIcon from './DynamicIcon';

/**
 * Generic icon-tag multi-select grid. Reused for Facilities (and anywhere
 * else a "pick several from a list of icon+label options" UI is needed).
 */
export default function TagMultiSelect({ options, selected = [], onChange }) {
  const toggle = (value) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 ${
              active
                ? 'bg-[#1a3a5c] border-[#1a3a5c] text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-[#1a3a5c]/40 hover:bg-[#1a3a5c]/5'
            }`}
          >
            <DynamicIcon name={opt.icon} size={15} className={active ? 'text-white' : 'text-[#1a3a5c]'} />
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
