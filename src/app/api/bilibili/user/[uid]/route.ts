import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AppConfig } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = 'config.json';

async function readConfig(): Promise<AppConfig> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, CONFIG_FILE), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { cookie: '', refreshIntervalMin: 30, typeFilters: [] };
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  const config = await readConfig();

  const url = `https://api.bilibili.com/x/space/acc/info?mid=${uid}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://space.bilibili.com/',
      ...(config.cookie ? { Cookie: config.cookie } : {}),
    },
  });

  const json = await res.json();
  return NextResponse.json(json);
}
