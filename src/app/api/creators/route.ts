import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Creator, CreatorsData, AppConfig } from '@/types';
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

export async function GET() {
  const data = await readCreators();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { identifier, groups }: { identifier: string; groups?: string[] } =
    await request.json();

  const uid = parseUid(identifier);
  if (!uid) {
    return NextResponse.json({ error: '无效的UID或URL' }, { status: 400 });
  }

  const data = await readCreators();
  if (data.creators.some((c) => c.uid === uid)) {
    return NextResponse.json({ error: '该创作者已存在' }, { status: 409 });
  }

  const config = await readConfig();

  let name: string;
  let avatar: string;
  try {
    const info = await fetchBiliUserInfo(uid, config.cookie);
    name = info.name;
    avatar = info.avatar;
  } catch {
    return NextResponse.json({ error: '获取用户信息失败，请检查UID或Cookie' }, { status: 502 });
  }

  const newCreator: Creator = {
    uid,
    name,
    avatar,
    groups: groups?.length ? groups : ['默认'],
    addedAt: new Date().toISOString(),
  };

  data.creators.push(newCreator);

  // track group names
  for (const g of newCreator.groups) {
    if (!data.groups.includes(g)) {
      data.groups.push(g);
    }
  }

  await writeCreators(data);
  return NextResponse.json(newCreator, { status: 201 });
}
