'use client';

import { useCalendarContext } from '@/hooks/CalendarContext';
import { useCreatorContext } from '@/hooks/CreatorContext';
import UpdateFeed from '@/components/feed/UpdateFeed';
import { getTodayKey } from '@/utils/date';

export default function RightPanel() {
  const { selectDate } = useCalendarContext();
  const { state: calState } = useCalendarContext();
  const { state: creatorState } = useCreatorContext();

  // Show hint when no date selected
  const showPlaceholder = !calState.selectedDate;

  const handleViewToday = () => {
    selectDate(getTodayKey());
  };

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">动态列表</h2>
        {showPlaceholder && (
          <button
            onClick={handleViewToday}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            查看今天
          </button>
        )}
      </div>

      {/* Content */}
      {showPlaceholder ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">点击日历中的日期</p>
            <p className="text-xs text-gray-300 mt-1">查看当天的博主动态</p>
          </div>
        </div>
      ) : (
        <UpdateFeed />
      )}
    </div>
  );
}
