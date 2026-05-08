'use client';

import { useMemo } from 'react';
import { useCalendarContext } from '@/hooks/CalendarContext';
import { useCreatorContext } from '@/hooks/CreatorContext';
import { formatDateLabel, formatMonthKey } from '@/utils/date';
import { BiliUpdate } from '@/types';
import UpdateCard from './UpdateCard';
import TypeFilter from './TypeFilter';

export default function UpdateFeed() {
  const { state: calState, setTypeFilters } = useCalendarContext();
  const { state: creatorState } = useCreatorContext();
  const { selectedDate, typeFilters } = calState;

  const monthKey = formatMonthKey(calState.currentYear, calState.currentMonth);
  const monthData = calState.monthUpdatesCache[monthKey] || {};

  // Gather all updates for selected date, filtered by selected creators and types
  const updates = useMemo(() => {
    if (!selectedDate) return [];

    const selectedUids = new Set(creatorState.selectedCreatorIds);
    if (selectedUids.size === 0) return [];

    const allUpdates: BiliUpdate[] = [];

    for (const [uidStr, uidUpdates] of Object.entries(monthData)) {
      const uid = Number(uidStr);
      if (!selectedUids.has(uid)) continue;

      for (const u of uidUpdates) {
        const d = new Date(u.timestamp * 1000);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (key === selectedDate) {
          allUpdates.push(u);
        }
      }
    }

    // Type filter
    let filtered = allUpdates;
    if (typeFilters.length > 0) {
      filtered = allUpdates.filter((u) => typeFilters.includes(u.type));
    }

    // Sort by time (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    return filtered;
  }, [selectedDate, monthData, creatorState.selectedCreatorIds, typeFilters]);

  // Empty state: no date selected
  if (!selectedDate) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400 text-center">
          点击日历中的日期<br />查看当天的博主动态
        </p>
      </div>
    );
  }

  // Loading state
  if (calState.loading && updates.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400 animate-pulse">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Fixed header: date + filter + count */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-800">
          {formatDateLabel(selectedDate)}
        </h3>
        <div className="mt-2">
          <TypeFilter activeFilters={typeFilters} onChange={setTypeFilters} />
        </div>
        <p className="text-xs text-gray-400 mt-2">共 {updates.length} 条动态</p>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {updates.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">该日期没有符合条件的更新</p>
            {typeFilters.length > 0 && (
              <p className="text-xs text-gray-300 mt-1">请调整上方筛选条件</p>
            )}
          </div>
        ) : (
          updates.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))
        )}
      </div>
    </div>
  );
}
