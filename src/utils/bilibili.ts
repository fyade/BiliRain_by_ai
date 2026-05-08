import { DynamicType, BiliUpdate } from '@/types';

export function parseUid(input: string): number | null {
  const trimmed = input.trim();

  // raw number
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }

  try {
    const url = new URL(trimmed);
    // space.bilibili.com/{uid}
    const match = url.pathname.match(/^\/?(\d+)\/?$/);
    if (match) return parseInt(match[1], 10);
    // b23.tv short link - extract uid from path (we'd need to resolve, but try)
    if (url.hostname === 'b23.tv') return null; // needs resolution
  } catch {
    // not a URL
  }

  return null;
}

export function buildDynamicUrl(dynamicId: string): string {
  return `https://t.bilibili.com/${dynamicId}`;
}

export function buildVideoUrl(bvid: string): string {
  return `https://www.bilibili.com/video/${bvid}`;
}

export function buildSpaceUrl(uid: number): string {
  return `https://space.bilibili.com/${uid}`;
}

export function mapDynamicType(majorType: string | null, itemType: number): DynamicType {
  if (majorType === 'MAJOR_TYPE_ARCHIVE') return 'video';
  if (majorType === 'MAJOR_TYPE_DRAW') return 'image';
  if (majorType === 'MAJOR_TYPE_ARTICLE') return 'article';
  if (majorType === 'MAJOR_TYPE_LIVE_RCMD') return 'live';

  // fallback to item type
  const typeMap: Record<number, DynamicType> = {
    2: 'text',
    4: 'image',
    8: 'video',
    16: 'article',
    64: 'music',
    256: 'live',
  };

  return typeMap[itemType] || 'others';
}

export const TYPE_LABELS: Record<DynamicType, string> = {
  video: '视频',
  text: '文字',
  image: '图文',
  forward: '转发',
  article: '专栏',
  live: '直播',
  music: '音频',
  others: '其他',
};

export const ALL_DYNAMIC_TYPES: DynamicType[] = [
  'video', 'text', 'image', 'forward', 'article', 'live', 'music', 'others',
];

export function parseBiliDynamicItems(items: unknown[]): BiliUpdate[] {
  const results: BiliUpdate[] = [];
  for (const item of items as Array<Record<string, unknown>>) {
    try {
      const modules = item.modules as Record<string, Record<string, unknown>>;
      if (!modules) continue;

      const major = modules.module_dynamic?.major as Record<string, unknown> | undefined;
      const desc = modules.module_dynamic?.desc as Record<string, string> | undefined;
      const author = modules.module_author as Record<string, unknown>;

      const id = item.id_str as string;
      const uid = author?.mid as number;
      const type = item.type as number;
      const majorType = (major?.type as string) || null;

      const title =
        (major?.archive as Record<string, string>)?.title ||
        (major?.article as Record<string, string>)?.title ||
        '';

      const content = desc?.text || '';

      const images: string[] = [];
      const draw = major?.draw as Record<string, unknown> | undefined;
      const drawItems = draw?.items as Array<Record<string, string>> | undefined;
      if (drawItems) {
        images.push(...drawItems.map((d) => d.src));
      }
      const archive = major?.archive as Record<string, string> | undefined;
      if (archive?.cover) {
        images.push(archive.cover);
      }

      const dynamicType = mapDynamicType(majorType, type);
      const url = buildDynamicUrl(id);
      const bvid = (major?.archive as Record<string, string>)?.bvid;

      // pub_ts may be at item root or nested in modules, and may be number or string
      const tsFields = ['pub_ts', 'pub_time', 'timestamp', 'ctime', 'mtime', 'upload_time'];
      let ts: number | undefined;
      for (const field of tsFields) {
        const v = (item as Record<string, unknown>)[field];
        if (v !== undefined && v !== null) {
          ts = typeof v === 'number' ? v : Number(v);
          if (!isNaN(ts)) break;
        }
      }
      if (ts === undefined) {
        // try module_author level
        for (const field of tsFields) {
          const v = (author as Record<string, unknown>)[field];
          if (v !== undefined && v !== null) {
            ts = typeof v === 'number' ? v : Number(v);
            if (!isNaN(ts)) break;
          }
        }
      }
      const timestamp = ts && ts > 0 ? ts : Math.floor(Date.now() / 1000);

      results.push({
        id,
        uid,
        type: dynamicType,
        title,
        content,
        images,
        timestamp,
        url,
        videoBvid: bvid,
      });
    } catch {
      // skip malformed items
    }
  }
  return results;
}
