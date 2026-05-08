'use client';

import { useCreatorContext } from '@/hooks/CreatorContext';

interface GroupManagerProps {
  activeGroup: string | null;
  onSelectGroup: (group: string | null) => void;
  onManageGroups: () => void;
}

export default function GroupManager({ activeGroup, onSelectGroup, onManageGroups }: GroupManagerProps) {
  const { state } = useCreatorContext();

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500 font-medium">分组筛选</span>
        <button
          onClick={onManageGroups}
          className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
        >
          管理
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onSelectGroup(null)}
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
            activeGroup === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {state.groups.map((g) => (
          <button
            key={g}
            onClick={() => onSelectGroup(g)}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
              activeGroup === g
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
