'use client';

import { useState, useRef, useEffect } from 'react';
import { useCalendarContext } from '@/hooks/CalendarContext';

interface RefreshMenuProps {
  onRefreshMonth: () => void;
  onRefreshAll: () => void;
  onRefreshSelected: () => void;
  onRefreshToday: () => void;
}

export default function RefreshMenu({
  onRefreshMonth,
  onRefreshAll,
  onRefreshSelected,
  onRefreshToday,
}: RefreshMenuProps) {
  const { state } = useCalendarContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  const busy = state.refreshing || state.loading;

  return (
    <div ref={ref} className="absolute bottom-4 right-4 z-20">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        disabled={busy}
        className="p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
        title="刷新"
      >
        <svg
          className={`w-4 h-4 text-gray-500 ${busy ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v3m0 4v.01M12 5a7 7 0 00-7 7 7 7 0 007 7 7 7 0 007-7 7 7 0 00-7-7z"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-2 text-[10px] text-gray-400 uppercase tracking-wide">刷新选项</div>
          <button
            onClick={() => handleClick(onRefreshMonth)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            刷新本月
          </button>
          <button
            onClick={() => handleClick(onRefreshToday)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            刷新今日
          </button>
          <button
            onClick={() => handleClick(onRefreshSelected)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            刷新选中博主
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => handleClick(onRefreshAll)}
            className="w-full text-left px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            全量强制刷新
          </button>
        </div>
      )}
    </div>
  );
}
