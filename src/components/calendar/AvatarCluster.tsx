import { CreatorActivity } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Tooltip from '@/components/ui/Tooltip';

interface AvatarClusterProps {
  activities: CreatorActivity[];
  max?: number;
}

export default function AvatarCluster({ activities, max = 3 }: AvatarClusterProps) {
  if (activities.length === 0) return null;

  const visible = activities.slice(0, max);
  const overflow = activities.length - max;

  return (
    <div className="flex flex-wrap gap-0.5">
      {visible.map((a) => (
        <Tooltip key={a.uid} content={a.name}>
          <Avatar src={a.avatar} alt={a.name} size={24} />
        </Tooltip>
      ))}
      {overflow > 0 && (
        <Tooltip content={`还有 ${overflow} 位博主`}>
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-medium">
            +{overflow}
          </div>
        </Tooltip>
      )}
    </div>
  );
}
