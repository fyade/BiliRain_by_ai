'use client';

import MonthHeader from '@/components/calendar/MonthHeader';
import WeekdayHeader from '@/components/calendar/WeekdayHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import RefreshMenu from '@/components/calendar/RefreshMenu';
import { useCalendarContext } from '@/hooks/CalendarContext';
import { useCreatorContext } from '@/hooks/CreatorContext';
import { useCalendarData } from '@/hooks/useCalendarData';

export default function CalendarPanel() {
  const { state: calState, selectDate } = useCalendarContext();
  const { state: creatorState } = useCreatorContext();
  const { weeks, refreshMonth, refreshAllForce, refreshSelected, refreshToday } =
    useCalendarData();

  const noCreatorsSelected =
    creatorState.selectedCreatorIds.length === 0 && creatorState.creators.length > 0;

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <MonthHeader />
      <WeekdayHeader />

      <div className="flex-1 overflow-y-auto relative">
        {noCreatorsSelected ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-center">
              <p className="text-gray-400 text-sm">请选择至少一位博主</p>
              <p className="text-gray-300 text-xs mt-1">在左侧列表勾选要查看的博主</p>
            </div>
          </div>
        ) : (
          <CalendarGrid
            weeks={weeks}
            selectedDate={calState.selectedDate}
            onSelectDate={selectDate}
          />
        )}

        {calState.loading && creatorState.selectedCreatorIds.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-100 overflow-hidden">
            <div className="h-full bg-blue-400 w-1/3 animate-pulse rounded" />
          </div>
        )}

        <RefreshMenu
          onRefreshMonth={refreshMonth}
          onRefreshAll={refreshAllForce}
          onRefreshSelected={refreshSelected}
          onRefreshToday={refreshToday}
        />
      </div>
    </div>
  );
}
