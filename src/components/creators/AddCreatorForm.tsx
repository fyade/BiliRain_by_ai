'use client';

import { useState } from 'react';
import { useCreatorContext } from '@/hooks/CreatorContext';

export default function AddCreatorForm() {
  const { addCreator } = useCreatorContext();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const creator = await addCreator(trimmed);
      if (creator) {
        setSuccess(`已添加: ${creator.name}`);
      }
      setInput('');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-xs text-gray-500 mb-1.5 font-medium">添加博主</div>
      <div className="flex gap-1.5">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="UID 或主页链接"
          className="w-0 flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 ring-blue-200 transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex-shrink-0"
        >
          {loading ? '...' : '添加'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {success && <p className="text-xs text-green-600 mt-1">{success}</p>}
    </div>
  );
}
