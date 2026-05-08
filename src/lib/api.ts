import { Creator, CreatorsData, AppConfig, BatchUpdateResponse } from '@/types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---- Config ----

export async function fetchConfig(): Promise<AppConfig> {
  return request<AppConfig>('/api/config');
}

export async function saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  return request<AppConfig>('/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
}

// ---- Creators ----

export async function fetchCreators(): Promise<CreatorsData> {
  return request<CreatorsData>('/api/creators');
}

export async function addCreator(identifier: string, groups?: string[]): Promise<Creator> {
  return request<Creator>('/api/creators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, groups }),
  });
}

export async function updateCreator(uid: number, data: { groups?: string[] }): Promise<Creator> {
  return request<Creator>(`/api/creators/${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteCreator(uid: number): Promise<void> {
  await fetch(`/api/creators/${uid}`, { method: 'DELETE' });
}

// ---- Groups ----

export async function addGroup(name: string): Promise<CreatorsData> {
  return request<CreatorsData>('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'add', name }),
  });
}

export async function renameGroup(oldName: string, newName: string): Promise<CreatorsData> {
  return request<CreatorsData>('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', name: oldName, newName }),
  });
}

export async function deleteGroup(name: string): Promise<CreatorsData> {
  return request<CreatorsData>('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', name }),
  });
}

// ---- Updates ----

export async function fetchBatchUpdates(
  uids: number[],
  year: number,
  month: number,
  force = false
): Promise<BatchUpdateResponse> {
  return request<BatchUpdateResponse>('/api/updates/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uids, year, month, force }),
  });
}
