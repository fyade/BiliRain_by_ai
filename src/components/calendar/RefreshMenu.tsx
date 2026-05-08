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
              className="flex items-center gap-1.5 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700 w-[68px] shrink-0">{row.label}</span>
              <button
                title="全部博主"
                onClick={() => handleClick(allUids, row.force, row.clearCache, row.navigateToday)}
                className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </button>
              <button
                title="选定博主"
                disabled={!hasSelected}
                onClick={() => handleClick(selectedUids, row.force, row.clearCache, row.navigateToday)}
                className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
