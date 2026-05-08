'use client';

import type { DynamicType } from '@/types';
import { ALL_DYNAMIC_TYPES, TYPE_LABELS } from '@/utils/bilibili';

interface TypeFilterProps {
  activeFilters: DynamicType[];
  onChange: (filters: DynamicType[]) => void;
}

export default function TypeFilter({ activeFilters, onChange }: TypeFilterProps) {
  const toggle = (type: DynamicType) => {
    if (activeFilters.includes(type)) {
      onChange(activeFilters.filter((t) => t !== type));
    } else {
      onChange([...activeFilters, type]);
    }
  };

  const setAll = () => onChange([]);
  const isAll = activeFilters.length === 0; // empty means "show all"

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={setAll}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
          isAll
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      {ALL_DYNAMIC_TYPES.filter((t) => t !== 'others').map((type) => (
        <button
          key={type}
          onClick={() => toggle(type)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilters.includes(type)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
