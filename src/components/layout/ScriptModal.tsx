'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface ScriptModalProps {
  open: boolean;
  onClose: () => void;
}

const SCRIPT = `// BiliRain 关注列表提取脚本
// 1. 打开 B站关注页面: https://space.bilibili.com/你的UID/fans/follow
// 2. 按 F12 打开控制台，切换到 Console 标签
// 3. 粘贴此脚本，回车运行
// 4. 等待自动滚动完成，UID 将打印在控制台

(async () => {
  const uids = new Set();
  const scrollDelay = 1500;
  let lastHeight = 0;

  while (true) {
    document.querySelectorAll('a[href*="space.bilibili.com/"]').forEach(a => {
      const m = a.href.match(/space\\.bilibili\\.com\\/(\\d+)/);
      if (m && m[1] !== location.pathname.split('/')[1]) uids.add(m[1]);
    });

    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, scrollDelay));

    const h = document.body.scrollHeight;
    if (h === lastHeight) break;
    lastHeight = h;
  }

  console.log('=== 复制以下UID到 BiliRain 批量添加 ===');
  console.log([...uids].join('\\n'));
  console.log(\`共 \${uids.size} 位关注\`);
})();`;

export default function ScriptModal({ open, onClose }: ScriptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title="快捷脚本">
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          在 B站关注页面运行此脚本，自动提取所有关注的 UID，方便批量导入。
        </p>

        <div className="relative">
          <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-auto max-h-80 select-all whitespace-pre-wrap break-all font-mono leading-relaxed">
            {SCRIPT}
          </pre>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">
            打开关注页 → F12 控制台 → 粘贴运行 → 复制输出的UID
          </p>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制脚本
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
