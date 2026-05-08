import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Creator, CreatorsData, AppConfig, BatchAddResult, BatchAddResponse } from '@/types';
import { parseUid } from '@/utils/bilibili';

const DATA_DIR = path.join(process.cwd(), 'data');
const CREATORS_FILE = 'creators.json';
const CONFIG_FILE = 'config.json';

async function readCreators(): Promise<CreatorsData> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, CREATORS_FILE), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { creators: [], groups: ['默认'] };
  }
}

async function writeCreators(data: CreatorsData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, CREATORS_FILE),
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

async function readConfig(): Promise<AppConfig> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, CONFIG_FILE), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { cookie: '', refreshIntervalMin: 30, typeFilters: [], avatarSize: 24 };
  }
}

async function fetchBiliUserInfo(
  uid: number,
  cookie: string
): Promise<{ name: string; avatar: string }> {
  const url = `https://api.bilibili.com/x/space/acc/info?mid=${uid}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://space.bilibili.com/',
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || '获取用户信息失败');
  }

  return {
    name: json.data.name,
    avatar: json.data.face,
  };
}

export async function POST(request: NextRequest) {
  const { identifiers, groups }: { identifiers: string[]; groups?: string[] } =
    await request.json();

  if (!Array.isArray(identifiers) || identifiers.length === 0) {
    return NextResponse.json({ error: '请提供至少一个UID或链接' }, { status: 400 });
  }

  const data = await readCreators();
  const config = await readConfig();
  const existingUids = new Set(data.creators.map((c) => c.uid));

  const results: BatchAddResult[] = [];
  const seenUids = new Set<number>();

  for (const raw of identifiers) {
    const trimmed = String(raw).trim();
    if (!trimmed) continue;

    const uid = parseUid(trimmed);
    if (!uid) {
      results.push({ identifier: trimmed, status: 'failed', reason: '无效的UID或URL' });
      continue;
    }

    if (existingUids.has(uid) || seenUids.has(uid)) {
      results.push({ identifier: trimmed, uid, status: 'skipped', reason: '已存在' });
      continue;
    }
    seenUids.add(uid);

    try {
      const info = await fetchBiliUserInfo(uid, config.cookie);

      const newCreator: Creator = {
        uid,
        name: info.name,
        avatar: info.avatar,
        groups: groups?.length ? groups : ['默认'],
        addedAt: new Date().toISOString(),
      };

      data.creators.push(newCreator);
      existingUids.add(uid);

      for (const g of newCreator.groups) {
        if (!data.groups.includes(g)) {
          data.groups.push(g);
        }
      }

      results.push({
        identifier: trimmed,
        uid,
        name: info.name,
        avatar: info.avatar,
        status: 'added',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取用户信息失败';
      results.push({ identifier: trimmed, uid, status: 'failed', reason: msg });
    }
  }

  if (results.some((r) => r.status === 'added')) {
    await writeCreators(data);
  }

  const summary = {
    total: results.length,
    added: results.filter((r) => r.status === 'added').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    failed: results.filter((r) => r.status === 'failed').length,
  };

  return NextResponse.json({ results, summary } satisfies BatchAddResponse);
}
