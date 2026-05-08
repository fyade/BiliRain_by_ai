import { useRef, useState, useEffect } from 'react';
import { CreatorActivity } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Tooltip from '@/components/ui/Tooltip';

interface AvatarClusterProps {
  activities: CreatorActivity[];
  size: number;
}

const GAP = 2; // gap-0.5 = 2px

export default function AvatarCluster({ activities, size }: AvatarClusterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxFit, setMaxFit] = useState(3);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const calc = () => {
      const width = el.clientWidth;
      if (width === 0) return;
      const fit = Math.floor((width + GAP) / (size + GAP));
      setMaxFit(Math.max(1, fit));
    };

    calc();
    const observer = new ResizeObserver(calc);
    observer.observe(el);
    return () => observer.disconnect();
  }, [size]);

  if (activities.length === 0) return null;

  const hasOverflow = activities.length > maxFit;
  const visibleCount = hasOverflow ? Math.max(0, maxFit - 1) : activities.length;
  const visible = activities.slice(0, visibleCount);
  const overflow = activities.length - visibleCount;

  return (
    <div ref={containerRef} className="flex flex-wrap gap-0.5">
      {visible.map((a) => (
        <Tooltip key={a.uid} content={a.name}>
          <Avatar src={a.avatar} alt={a.name} size={size} />
        </Tooltip>
      ))}
      {overflow > 0 && (
        <Tooltip content={`还有 ${overflow} 位博主`}>
          <div
            style={{ width: size, height: size, fontSize: size <= 22 ? '10px' : '12px' }}
            className="rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium flex-shrink-0"
          >
            +{overflow}
          </div>
        </Tooltip>
      )}
    </div>
  );
}
