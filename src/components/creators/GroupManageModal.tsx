'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useCreatorContext } from '@/hooks/CreatorContext';

interface GroupManageModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GroupManageModal({ open, onClose }: GroupManageModalProps) {
  const { state, addGroup, renameGroup, deleteGroup } = useCreatorContext();

  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');

  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');

  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAddError('');

    if (state.groups.includes(name)) {
      setAddError('分组已存在');
      return;
    }

    try {
      await addGroup(name);
      setNewName('');
    } catch {
      setAddError('添加失败');
    }
  };

  const handleRename = async () => {
    if (!editingGroup) return;
    const name = editName.trim();
    if (!name) return;
    setEditError('');

    if (name === editingGroup) {
      setEditingGroup(null);
      return;
    }

    if (state.groups.includes(name)) {
      setEditError('目标名称已存在');
      return;
    }

    try {
      await renameGroup(editingGroup, name);
      setEditingGroup(null);
    } catch {
      setEditError('重命名失败');
    }
  };

  const handleDelete = async (name: string) => {
    if (name === '默认') return;
    try {
      await deleteGroup(name);
      setDeletingGroup(null);
    } catch {
      // ignore
    }
  };

  // count creators in each group
  const groupCounts: Record<string, number> = {};
  for (const g of state.groups) {
    groupCounts[g] = state.creators.filter((c) => c.groups.includes(g)).length;
  }

  return (
    <Modal open={open} onClose={onClose} title="管理分组">
      <div className="space-y-4">
        {/* Add new group */}
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setAddError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="新分组名称..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 ring-blue-200"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex-shrink-0"
          >
            添加
          </button>
        </div>
        {addError && <p className="text-xs text-red-500">{addError}</p>}

        {/* Group list */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {state.groups.map((g) => (
            <div
              key={g}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {/* Group info */}
              <span className="flex-1 text-sm font-medium text-gray-700">{g}</span>
              <span className="text-xs text-gray-400">{groupCounts[g] || 0} 位博主</span>

              {/* Actions */}
              {editingGroup === g ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      setEditError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') setEditingGroup(null);
                    }}
                    className="w-24 px-2 py-1 text-xs border border-blue-300 rounded outline-none"
                  />
                  <button
                    onClick={handleRename}
                    className="text-xs text-blue-500 hover:text-blue-700 px-1"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setEditingGroup(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 px-1"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setEditingGroup(g);
                      setEditName(g);
                      setEditError('');
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
                    title="重命名"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {g !== '默认' && (
                    <button
                      onClick={() => setDeletingGroup(g)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="删除"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {editError && <p className="text-xs text-red-500">{editError}</p>}

        {/* Delete confirmation */}
        {deletingGroup && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 mb-2">
              确定删除分组「{deletingGroup}」？该分组下的博主将移至「默认」分组。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeletingGroup(null)}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deletingGroup)}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
