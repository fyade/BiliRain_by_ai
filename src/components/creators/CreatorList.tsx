'use client';

import { useMemo, useState } from 'react';
import { useCreatorContext } from '@/hooks/CreatorContext';
import CreatorCard from './CreatorCard';

interface CreatorListProps {
  activeGroup: string | null;
  onAddCreator: () => void;
}

export default function CreatorList({ activeGroup, onAddCreator }: CreatorListProps) {
  const { state, selectAll, deselectAll } = useCreatorContext();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = state.creators;

    if (activeGroup) {
      list = list.filter((c) => c.groups.includes(activeGroup));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          String(c.uid).includes(q)
      );
    }

    return list;
  }, [state.creators, activeGroup, search]);

  const handleSelectAll = () => {
    // if filtering by group, select only that group's creators
    if (activeGroup || search.trim()) {
      selectAll(filtered.map((c) => c.uid));
    } else {
      selectAll();
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        加载中...
      </div>
    );
  }

  if (state.creators.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        <p>还没有添加博主</p>
        <p className="mt-1">
          <button onClick={onAddCreator} className="text-blue-500 hover:text-blue-700">
            点击添加
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Fixed head: title + actions */}
      <div className="flex-shrink-0 flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500 font-medium">
          我的关注 ({filtered.length}{activeGroup ? ` / ${state.creators.length}` : ''})
        </span>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleSelectAll}
            className="text-blue-500 hover:text-blue-700"
          >
            全选
          </button>
          <button
            onClick={deselectAll}
            className="text-gray-400 hover:text-gray-600"
          >
            取消
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={onAddCreator}
            className="text-blue-500 hover:text-blue-700"
          >
            + 添加
          </button>
        </div>
      </div>

      {/* Fixed search */}
      <div className="flex-shrink-0 mb-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索..."
          className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 ring-blue-200 transition-colors"
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-0.5">
        {filtered.map((c) => (
          <div key={c.uid} className="relative">
            <CreatorCard
              creator={c}
              isSelected={state.selectedCreatorIds.includes(c.uid)}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-4">
            {search.trim() ? '无匹配结果' : '该分组下暂无博主'}
          </p>
        )}
      </div>
    </div>
  );
}
