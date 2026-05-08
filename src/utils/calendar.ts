import { CalendarDay, CreatorActivity } from '@/types';

export function getMonthGrid(year: number, month: number): CalendarDay[][] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0);
  const daysInMonth = lastOfMonth.getDate();
  const startDayOfWeek = firstOfMonth.getDay(); // 0=Sun
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];

  // trailing days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    week.push(createDay(year, month - 1, daysInPrevMonth - i, false));
  }

  // current month days
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(createDay(year, month, d, true));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  // leading days from next month
  if (week.length > 0) {
    const remaining = 7 - week.length;
    for (let d = 1; d <= remaining; d++) {
      week.push(createDay(year, month + 1, d, false));
    }
    weeks.push(week);
  }

  return weeks;
}

function createDay(
  year: number,
  month: number,
  date: number,
  isCurrentMonth: boolean
): CalendarDay {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fullDate = `${year}-${pad(month)}-${pad(date)}`;
  const today = new Date();
  const isToday =
    date === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  return {
    date,
    fullDate,
    isCurrentMonth,
    isToday,
    creatorActivities: [],
    updateCount: 0,
  };
}

export function populateCalendarGrid(
  weeks: CalendarDay[][],
  updatesByUid: Record<string, import('@/types').BiliUpdate[]>,
  creatorMap: Map<number, CreatorActivity>,
  selectedUids: Set<number>
): CalendarDay[][] {
  return weeks.map((week) =>
    week.map((day) => {
      if (!day.isCurrentMonth) return day;

      const activities: CreatorActivity[] = [];
      let count = 0;

      for (const [uidStr, updates] of Object.entries(updatesByUid)) {
        const uid = Number(uidStr);
        if (!selectedUids.has(uid)) continue;

        const dayUpdates = updates.filter((u) => {
          const d = new Date(u.timestamp * 1000);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return key === day.fullDate;
        });

        if (dayUpdates.length > 0) {
          const creator = creatorMap.get(uid);
          if (creator) {
            activities.push(creator);
          }
          count += dayUpdates.length;
        }
      }

      return { ...day, creatorActivities: activities, updateCount: count };
    })
  );
}
