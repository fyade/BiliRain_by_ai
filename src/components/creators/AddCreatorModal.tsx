'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useCreatorContext } from '@/hooks/CreatorContext';

interface AddCreatorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddCreatorModal({ open, onClose }: AddCreatorModalProps) {
  const { addCreator, state } = useCreatorContext();
  const [uid, setUid] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['默认']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = uid.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      await addCreator(trimmed, selectedGroups);
      setUid('');
      setSelectedGroups(['默认']);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (g: string) => {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="添加博主">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">B站 UID 或主页链接</label>
          <input
            autoFocus
            value={uid}
            onChange={(e) => {
              setUid(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder="例如: 5970160 或 https://space.bilibili.com/5970160"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 ring-blue-200"
          />
        </div>

        {state.groups.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">分组</label>
            <div className="flex flex-wrap gap-1.5">
              {state.groups.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGroup(g)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedGroups.includes(g)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !uid.trim()}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? '获取中...' : '添加'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
