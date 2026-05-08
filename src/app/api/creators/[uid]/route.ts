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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  const uidNum = Number(uid);
  const body: { groups?: string[] } = await request.json();

  const data = await readCreators();
  const index = data.creators.findIndex((c) => c.uid === uidNum);
  if (index === -1) {
    return NextResponse.json({ error: '创作者不存在' }, { status: 404 });
  }

  if (body.groups !== undefined) {
    data.creators[index].groups = body.groups;
    for (const g of body.groups) {
      if (!data.groups.includes(g)) {
        data.groups.push(g);
      }
    }
  }

  await writeCreators(data);
  return NextResponse.json(data.creators[index]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  const uidNum = Number(uid);

  const data = await readCreators();
  data.creators = data.creators.filter((c) => c.uid !== uidNum);
  await writeCreators(data);

  // Clean up cached updates
  try {
    await fs.unlink(path.join(DATA_DIR, 'updates', `${uidNum}.json`));
  } catch {
    // file doesn't exist, ignore
  }

  return NextResponse.json({ success: true });
}
