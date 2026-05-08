'use client';

import { useMemo } from 'react';
import { BiliUpdate, DynamicType } from '@/types';
import { useCreatorContext } from '@/hooks/CreatorContext';
import { toRelativeTime } from '@/utils/date';
import { buildVideoUrl, TYPE_LABELS } from '@/utils/bilibili';
import Avatar from '@/components/ui/Avatar';

const TYPE_COLORS: Partial<Record<DynamicType, string>> = {
  video: 'bg-pink-100 text-pink-700',
  text: 'bg-green-100 text-green-700',
  image: 'bg-purple-100 text-purple-700',
  forward: 'bg-orange-100 text-orange-700',
  article: 'bg-indigo-100 text-indigo-700',
  live: 'bg-red-100 text-red-700',
  music: 'bg-yellow-100 text-yellow-700',
  others: 'bg-gray-100 text-gray-600',
};

interface UpdateCardProps {
  update: BiliUpdate;
}

export default function UpdateCard({ update }: UpdateCardProps) {
  const { state } = useCreatorContext();
  const creator = useMemo(
    () => state.creators.find((c) => c.uid === update.uid),
    [state.creators, update.uid]
  );

  const url =
    update.type === 'video' && update.videoBvid
      ? buildVideoUrl(update.videoBvid)
      : update.url;

  const title = update.title || update.content.slice(0, 80);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
    >
      <div className="flex gap-2.5">
        {/* Avatar */}
        <Avatar
          src={creator?.avatar || ''}
          alt={creator?.name || `UID:${update.uid}`}
          size={32}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-800 truncate">
              {creator?.name || `UID:${update.uid}`}
            </span>
            <span
              className={`px-1.5 py-0 rounded text-[10px] font-medium flex-shrink-0 ${
                TYPE_COLORS[update.type] || TYPE_COLORS.others
              }`}
            >
              {TYPE_LABELS[update.type]}
            </span>
          </div>

          {/* Title/Content */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-1.5 leading-relaxed">
            {title}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span>{toRelativeTime(update.timestamp)}</span>
            {update.images.length > 0 && (
              <span>📷 {update.images.length}</span>
            )}
            <span className="hover:text-blue-500">查看原文 →</span>
          </div>
        </div>
      </div>
    </a>
  );
}
