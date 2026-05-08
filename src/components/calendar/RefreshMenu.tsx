'use client';

import { useState, useRef, useEffect } from 'react';
import { useCalendarContext } from '@/hooks/CalendarContext';

interface RefreshMenuProps {
  allUids: number[];
  selectedUids: number[];
  onRefresh: (uids: number[], force: boolean, clearCache: boolean, navigateToday: boolean) => void;
}

const rows = [
  { label: '刷新今日',   force: true,  clearCache: false, navigateToday: true },
  { label: '刷新近3日',  force: true,  clearCache: false, navigateToday: false },
  { label: '刷新近7日',  force: true,  clearCache: false, navigateToday: false },
  { label: '刷新本月',   force: false, clearCache: true,  navigateToday: false },
];

export default function RefreshMenu({
  allUids,
  selectedUids,
  onRefresh,
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

  const handleClick = (uids: number[], force: boolean, clearCache: boolean, navigateToday: boolean) => {
    onRefresh(uids, force, clearCache, navigateToday);
    setOpen(false);
  };

  const busy = state.refreshing || state.loading;
  const hasSelected = selectedUids.length > 0;

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
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-2.5 text-[11px] font-medium text-gray-500 border-b border-gray-100">
            刷新选项
          </div>

          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700 w-[72px] shrink-0">{row.label}</span>
              <button
                onClick={() => handleClick(allUids, row.force, row.clearCache, row.navigateToday)}
                className="px-2.5 py-1 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                全部博主
              </button>
              <button
                disabled={!hasSelected}
                onClick={() => handleClick(selectedUids, row.force, row.clearCache, row.navigateToday)}
                className="px-2.5 py-1 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                选定博主
              </button>
            </div>
          ))}

          <div className="border-t border-gray-100" />

          <button
            onClick={() => handleClick(allUids, true, false, false)}
            className="w-full text-left px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
          >
            全量强制刷新
            <span className="text-orange-400 ml-1 text-xs">（全部历史数据，忽略缓存）</span>
          </button>
        </div>
      )}
    </div>
  );
}
