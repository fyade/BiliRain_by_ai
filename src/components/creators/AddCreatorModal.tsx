'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useCreatorContext } from '@/hooks/CreatorContext';
import { BatchAddResponse } from '@/types';

interface AddCreatorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddCreatorModal({ open, onClose }: AddCreatorModalProps) {
  const { addCreator, addCreatorBatch, state } = useCreatorContext();
  const [input, setInput] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['默认']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [batchResult, setBatchResult] = useState<BatchAddResponse | null>(null);

  const lines = input
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const isBatch = lines.length > 1;

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setBatchResult(null);

    try {
      if (isBatch) {
        const result = await addCreatorBatch(lines, selectedGroups);
        setBatchResult(result);
        if (result.summary.added > 0) {
          setInput('');
          setSelectedGroups(['默认']);
        }
      } else {
        await addCreator(lines[0], selectedGroups);
        setInput('');
        setSelectedGroups(['默认']);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInput('');
    setSelectedGroups(['默认']);
    setError('');
    setBatchResult(null);
    onClose();
  };

  const toggleGroup = (g: string) => {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title="添加博主">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            B站 UID 或主页链接
            <span className="text-gray-400 font-normal ml-1">（每行一个，支持批量粘贴）</span>
          </label>
          <textarea
            autoFocus
            rows={Math.max(3, Math.min(lines.length + 1, 10))}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
              setBatchResult(null);
            }}
            placeholder={'例如: 5970160\nhttps://space.bilibili.com/12345\n67890'}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 ring-blue-200 resize-none"
          />
          {lines.length > 1 && (
            <p className="text-xs text-blue-500 mt-1">检测到 {lines.length} 个UID，将批量添加</p>
          )}
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

        {batchResult && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">
              批量添加完成：
              {batchResult.summary.added > 0 && (
                <span className="text-green-600 ml-1">成功 {batchResult.summary.added} 位</span>
              )}
              {batchResult.summary.skipped > 0 && (
                <span className="text-gray-500 ml-1">跳过 {batchResult.summary.skipped} 位</span>
              )}
              {batchResult.summary.failed > 0 && (
                <span className="text-red-500 ml-1">失败 {batchResult.summary.failed} 位</span>
              )}
            </p>
            {batchResult.results.filter((r) => r.status !== 'added').length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {batchResult.results
                  .filter((r) => r.status !== 'added')
                  .map((r, i) => (
                    <p key={i} className="text-xs text-gray-500">
                      <span className="font-mono">{r.identifier}</span>
                      <span className="ml-1">
                        {r.status === 'skipped' ? '— 已存在' : `— ${r.reason}`}
                      </span>
                    </p>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {batchResult ? '完成' : '取消'}
          </button>
          {!batchResult && (
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? '获取中...' : isBatch ? `批量添加 (${lines.length})` : '添加'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
