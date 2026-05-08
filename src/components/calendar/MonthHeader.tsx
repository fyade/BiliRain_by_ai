'use client';

import { useCalendarContext } from '@/hooks/CalendarContext';
import { formatMonthLabel } from '@/utils/date';

export default function MonthHeader() {
  const { state, goToToday, nextMonth, prevMonth } = useCalendarContext();

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <button
          onClick={prevMonth}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="上个月"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800 select-none">
          {formatMonthLabel(state.currentYear, state.currentMonth)}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="下个月"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {state.loadingProgress && (
          <span className="text-xs text-blue-500 animate-pulse">
            正在获取 ({state.loadingProgress.done}/{state.loadingProgress.total})...
          </span>
        )}
        {state.loading && !state.loadingProgress && (
          <span className="text-xs text-blue-500 animate-pulse">加载中...</span>
        )}
        <button
          onClick={goToToday}
          className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          今天
        </button>
      </div>
    </div>
  );
}
