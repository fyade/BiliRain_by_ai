'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Creator } from '@/types';
import { useCreatorContext } from '@/hooks/CreatorContext';

interface CreatorCardProps {
  creator: Creator;
  isSelected: boolean;
}

export default function CreatorCard({ creator, isSelected }: CreatorCardProps) {
  const { toggleCreator, deleteCreator, updateCreator, state } = useCreatorContext();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = () => toggleCreator(creator.uid);

  const handleGroupToggle = (group: string) => {
    const current = creator.groups;
    const newGroups = current.includes(group)
      ? current.filter((g) => g !== group)
      : [...current, group];
    if (newGroups.length === 0) return; // must have at least one group
    updateCreator(creator.uid, newGroups);
  };

  const handleDelete = () => {
    deleteCreator(creator.uid);
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
        isSelected
          ? 'bg-blue-50 hover:bg-blue-100'
          : 'bg-white hover:bg-gray-50 opacity-60'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isSelected
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Avatar */}
      <Avatar src={creator.avatar} alt={creator.name} size={32} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{creator.name}</div>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {creator.groups.map((g) => (
            <Badge key={g} label={g} small />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditing(!editing);
          }}
          className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
          title="编辑分组"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true);
          }}
          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          title="删除"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Edit groups dropdown */}
      {editing && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-2 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
          <div className="text-xs text-gray-400 mb-1">切换分组</div>
          {state.groups.map((g) => (
            <label key={g} className="flex items-center gap-1.5 px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={creator.groups.includes(g)}
                onChange={() => handleGroupToggle(g)}
                className="w-3.5 h-3.5"
              />
              {g}
            </label>
          ))}
          <button
            onClick={() => setEditing(false)}
            className="w-full mt-1 text-xs text-center text-gray-400 hover:text-gray-600"
          >
            完成
          </button>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-3 text-sm" onClick={(e) => e.stopPropagation()}>
          <p className="mb-2">确定删除 {creator.name}？</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">取消</button>
            <button onClick={handleDelete} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">删除</button>
          </div>
        </div>
      )}
    </div>
  );
}
