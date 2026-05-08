'use client';

import { CalendarDay } from '@/types';
import DayCell from './DayCell';

interface CalendarGridProps {
  weeks: CalendarDay[][];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function CalendarGrid({ weeks, selectedDate, onSelectDate }: CalendarGridProps) {
  const handleClick = (date: string) => {
    onSelectDate(selectedDate === date ? null : date);
  };

  return (
    <div className="border-l border-t border-gray-200 rounded-lg overflow-hidden">
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day) => (
            <DayCell
              key={day.fullDate}
              day={day}
              isSelected={selectedDate === day.fullDate}
              onClick={handleClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
