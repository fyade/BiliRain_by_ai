import { NextResponse } from 'next/server';
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

async function writeConfig(config: AppConfig): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, CONFIG_FILE),
    JSON.stringify(config, null, 2),
    'utf-8'
  );
}

export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const current = await readConfig();
  const body: Partial<AppConfig> = await request.json();
  const updated = { ...current, ...body };
  await writeConfig(updated);
  return NextResponse.json(updated);
}
