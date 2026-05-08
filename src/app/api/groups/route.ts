import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { CreatorsData } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CREATORS_FILE = 'creators.json';

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

// POST - group CRUD via action field
export async function POST(request: NextRequest) {
  const body: { action: 'add' | 'rename' | 'delete'; name: string; newName?: string } =
    await request.json();

  const data = await readCreators();

  switch (body.action) {
    case 'add': {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: '分组名不能为空' }, { status: 400 });
      if (data.groups.includes(name)) {
        return NextResponse.json({ error: '分组已存在' }, { status: 409 });
      }
      data.groups.push(name);
      await writeCreators(data);
      return NextResponse.json({ groups: data.groups, creators: data.creators });
    }

    case 'rename': {
      const oldName = body.name.trim();
      const newName = (body.newName || '').trim();
      if (!oldName || !newName) {
        return NextResponse.json({ error: '分组名不能为空' }, { status: 400 });
      }
      if (!data.groups.includes(oldName)) {
        return NextResponse.json({ error: '分组不存在' }, { status: 404 });
      }
      if (data.groups.includes(newName)) {
        return NextResponse.json({ error: '目标分组名已存在' }, { status: 409 });
      }
      data.groups = data.groups.map((g) => (g === oldName ? newName : g));
      for (const c of data.creators) {
        c.groups = c.groups.map((g) => (g === oldName ? newName : g));
      }
      await writeCreators(data);
      return NextResponse.json({ groups: data.groups, creators: data.creators });
    }

    case 'delete': {
      const name = body.name.trim();
      if (!data.groups.includes(name)) {
        return NextResponse.json({ error: '分组不存在' }, { status: 404 });
      }
      data.groups = data.groups.filter((g) => g !== name);
      for (const c of data.creators) {
        c.groups = c.groups.filter((g) => g !== name);
        if (c.groups.length === 0) c.groups = ['默认'];
      }
      if (!data.groups.includes('默认')) {
        data.groups.unshift('默认');
      }
      await writeCreators(data);
      return NextResponse.json({ groups: data.groups, creators: data.creators });
    }

    default:
      return NextResponse.json({ error: '无效操作' }, { status: 400 });
  }
}
