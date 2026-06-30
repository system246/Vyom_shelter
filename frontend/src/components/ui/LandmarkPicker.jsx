import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import DynamicIcon from './DynamicIcon';
import { LANDMARK_TYPES } from '../../utils/constants';

/**
 * Lets a seller add several "near X, Y km" entries.
 * value: [{ type: 'metro', distanceKm: 1 }, ...]
 */
export default function LandmarkPicker({ value = [], onChange }) {
  const [type, setType] = useState('');
  const [distance, setDistance] = useState('');

  const add = () => {
    if (!type || !distance) return;
    onChange([...value, { type, distanceKm: Number(distance) }]);
    setType('');
    setDistance('');
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((item, idx) => {
          const def = LANDMARK_TYPES.find((t) => t.value === item.type);
          return (
            <span key={idx} className="flex items-center gap-1.5 bg-[#e8f0fb] text-[#1a3a5c] text-xs font-medium pl-2.5 pr-1.5 py-1.5 rounded-full">
              <DynamicIcon name={def?.icon} size={13} />
              {def?.label || item.type} &middot; {item.distanceKm} km
              <button type="button" onClick={() => remove(idx)} aria-label={`Remove ${def?.label || item.type}`} className="ml-1 hover:bg-black/10 rounded-full p-0.5">
                <X size={11} />
              </button>
            </span>
          );
        })}
        {value.length === 0 && <p className="text-xs text-gray-400">No nearby landmarks added yet.</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-base sm:flex-1">
          <option value="">Select nearby place...</option>
          {LANDMARK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input
          type="number" min="0" step="0.1" placeholder="Distance (km)"
          value={distance} onChange={(e) => setDistance(e.target.value)}
          className="input-base sm:w-36"
        />
        <button type="button" onClick={add} className="btn-secondary justify-center flex-shrink-0">
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}
