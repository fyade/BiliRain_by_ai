import { CreatorActivity } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Tooltip from '@/components/ui/Tooltip';

interface AvatarClusterProps {
  activities: CreatorActivity[];
  size: number;
  containerWidth: number;
}

const GAP = 2;

export default function AvatarCluster({ activities, size, containerWidth }: AvatarClusterProps) {
  if (activities.length === 0) return null;

  const maxFit = containerWidth > 0
    ? Math.max(1, Math.floor((containerWidth + GAP) / (size + GAP)))
    : 3;

  const hasOverflow = activities.length > maxFit;
  const visibleCount = hasOverflow ? Math.max(0, maxFit - 1) : activities.length;
  const visible = activities.slice(0, visibleCount);
  const overflow = activities.length - visibleCount;

  return (
    <div className="flex flex-wrap gap-0.5">
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
