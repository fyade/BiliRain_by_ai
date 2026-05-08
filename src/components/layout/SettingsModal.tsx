'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useConfig } from '@/hooks/useConfig';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { config, updateConfig } = useConfig();
  const [cookie, setCookie] = useState('');
  const [interval, setInterval] = useState(30);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config && open) {
      setCookie(config.cookie || '');
      setInterval(config.refreshIntervalMin || 30);
    }
  }, [config, open]);

  const handleSave = async () => {
    await updateConfig({ cookie, refreshIntervalMin: interval });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title="设置">
      <div className="space-y-4">
        {/* Cookie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bilibili Cookie
          </label>
          <textarea
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            placeholder="粘贴完整的 B站 Cookie..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 ring-blue-200 resize-none font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">
            从浏览器中复制 B站请求的 Cookie 字符串（含 SESSDATA 等），用于获取动态数据。
          </p>
        </div>

        {/* Refresh Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            缓存刷新间隔（分钟）
          </label>
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            min={5}
            max={120}
            className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 ring-blue-200"
          />
          <p className="text-xs text-gray-400 mt-1">建议 15-60 分钟，避免请求过于频繁。</p>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            保存
          </button>
          {saved && <span className="text-sm text-green-600">已保存</span>}
        </div>

        <div className="text-xs text-gray-400 p-3 bg-gray-50 rounded-lg">
          提示：Cookie 仅保存在本地文件中，所有 B站 API 请求通过本项目的服务端转发，不会泄露到其他地方。
        </div>
      </div>
    </Modal>
  );
}
