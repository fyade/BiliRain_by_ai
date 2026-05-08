'use client';

import { CalendarDay } from '@/types';
import AvatarCluster from './AvatarCluster';

interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  avatarSize: number;
  onClick: (date: string) => void;
}

export default function DayCell({ day, isSelected, avatarSize, onClick }: DayCellProps) {
  const handleClick = () => {
    if (day.isCurrentMonth) {
      onClick(day.fullDate);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex flex-col p-1 min-h-[90px] border-r border-b border-gray-100
        ${day.isCurrentMonth ? 'cursor-pointer hover:bg-blue-50/50' : 'bg-gray-50/50 cursor-default'}
        ${isSelected ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset' : ''}
        transition-colors
      `}
    >
      {/* Date number */}
      <div className="flex items-center justify-between mb-0.5">
        <span
          className={`
            text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
            ${day.isToday ? 'bg-blue-500 text-white' : ''}
            ${!day.isCurrentMonth ? 'text-gray-300' : day.isToday ? '' : 'text-gray-600'}
          `}
        >
          {day.date}
        </span>

        {/* Green dot for updates */}
        {day.updateCount > 0 && day.isCurrentMonth && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title={`${day.updateCount} 条更新`} />
        )}
      </div>

      {/* Avatars */}
      <div className="flex-1 overflow-hidden">
        <AvatarCluster activities={day.creatorActivities} size={avatarSize} />
      </div>

      {/* Update count text */}
      {day.updateCount > 0 && day.isCurrentMonth && day.creatorActivities.length === 0 && (
        <span className="text-[10px] text-gray-400 mt-auto">{day.updateCount} 条更新</span>
      )}
    </div>
  );
}
