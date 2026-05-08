'use client';

import { ConfigProvider } from '@/hooks/useConfig';
import { CreatorProvider } from '@/hooks/CreatorContext';
import { CalendarProvider } from '@/hooks/CalendarContext';
import LeftPanel from '@/components/layout/LeftPanel';
import CalendarPanel from '@/components/layout/CalendarPanel';
import RightPanel from '@/components/layout/RightPanel';

export default function Home() {
  return (
    <ConfigProvider>
      <CreatorProvider>
        <CalendarProvider>
          <div className="h-screen flex overflow-hidden">
            <LeftPanel />
            <CalendarPanel />
            <RightPanel />
          </div>
        </CalendarProvider>
      </CreatorProvider>
    </ConfigProvider>
  );
}
