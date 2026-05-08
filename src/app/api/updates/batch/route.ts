import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AppConfig, CachedUpdates, BiliUpdate, BatchUpdateResponse } from '@/types';
import { parseBiliDynamicItems } from '@/utils/bilibili';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPDATES_DIR = path.join(DATA_DIR, 'updates');
const CONFIG_FILE = 'config.json';

const CACHE_MINUTES = 30;
const DELAY_MS = 500;
const PAGE_SIZE = 12;

async function readConfig(): Promise<AppConfig> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, CONFIG_FILE), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { cookie: '', refreshIntervalMin: 30, typeFilters: [] };
  }
}

async function readCache(uid: number): Promise<CachedUpdates | null> {
  try {
    const raw = await fs.readFile(path.join(UPDATES_DIR, `${uid}.json`), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCache(uid: number, data: CachedUpdates): Promise<void> {
  await fs.mkdir(UPDATES_DIR, { recursive: true });
  await fs.writeFile(
    path.join(UPDATES_DIR, `${uid}.json`),
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

async function fetchDynamicsFromBili(
  uid: number,
  cookie: string
): Promise<BiliUpdate[]> {
  const allItems: unknown[] = [];
  let offset = '';

  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({
      host_mid: String(uid),
      offset,
    });

    const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?${params}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: `https://space.bilibili.com/${uid}/dynamic`,
        ...(cookie ? { Cookie: cookie } : {}),
      },
    });

    if (res.status === 412 || res.status === -412) {
      throw new Error('RATE_LIMITED');
    }

    const json = await res.json();
    if (json.code !== 0) {
      if (json.code === -101) throw new Error('AUTH_ERROR');
      if (json.code === -404) throw new Error('NOT_FOUND');
      throw new Error(json.message || `Bilibili API error: ${json.code}`);
    }

    const items = json.data?.items || [];
    if (items.length > 0) {
      // log first item keys to help debug timestamp field location
      const firstItem = items[0] as Record<string, unknown>;
      console.log(`[BiliRain] B站动态 API 返回 sample keys:`, Object.keys(firstItem));
      if (firstItem.modules) {
        const mod = firstItem.modules as Record<string, unknown>;
        console.log(`[BiliRain] modules keys:`, Object.keys(mod));
        if (mod.module_author) {
          console.log(`[BiliRain] module_author keys:`, Object.keys(mod.module_author as object));
        }
      }
    }
    allItems.push(...items);

    const hasMore = json.data?.has_more;
    if (!hasMore) break;

    offset = json.data?.offset || '';
    if (!offset) break;

    // delay between pages
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  return parseBiliDynamicItems(allItems);
}

function filterByMonth(updates: BiliUpdate[], year: number, month: number): BiliUpdate[] {
  const startTs = new Date(year, month - 1, 1).getTime() / 1000;
  const endTs = new Date(year, month, 0).getTime() / 1000 + 86400;
  return updates.filter((u) => u.timestamp >= startTs && u.timestamp < endTs);
}

export async function POST(request: NextRequest) {
  const { uids, year, month, force }:
    { uids: number[]; year: number; month: number; force?: boolean } =
    await request.json();

  const config = await readConfig();
  const refreshMs = force ? 0 : (config.refreshIntervalMin || CACHE_MINUTES) * 60 * 1000;

  const result: BatchUpdateResponse = {
    data: {},
    refreshed: {},
    errors: {},
  };

  for (const uid of uids) {
    try {
      const cached = await readCache(uid);
      const cacheAge = cached
        ? Date.now() - new Date(cached.fetchedAt).getTime()
        : Infinity;

      if (!force && cached && cacheAge < refreshMs) {
        // use cache
        result.data[String(uid)] = filterByMonth(cached.updates, year, month);
        result.refreshed[String(uid)] = false;
      } else {
        // fetch from Bilibili
        const freshUpdates = await fetchDynamicsFromBili(uid, config.cookie);

        // merge with existing cache (deduplicate by id)
        const existingMap = new Map(cached?.updates.map((u) => [u.id, u]) ?? []);
        for (const u of freshUpdates) {
          existingMap.set(u.id, u);
        }
        const merged = Array.from(existingMap.values()).sort(
          (a, b) => b.timestamp - a.timestamp
        );

        await writeCache(uid, {
          uid,
          fetchedAt: new Date().toISOString(),
          updates: merged,
        });

        result.data[String(uid)] = filterByMonth(merged, year, month);
        result.refreshed[String(uid)] = true;
      }

      // delay between creators
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      result.errors![String(uid)] = msg;

      // try to use cached data as fallback
      const cached = await readCache(uid);
      if (cached) {
        result.data[String(uid)] = filterByMonth(cached.updates, year, month);
      } else {
        result.data[String(uid)] = [];
      }
    }
  }

  return NextResponse.json(result);
}
