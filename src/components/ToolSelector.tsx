import React from 'react';

export type ToolType = 'json' | 'base64' | 'timestamp' | 'text' | 'diff';

interface ToolSelectorProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  name: string;
  icon: string;
}

const tools: ToolItem[] = [
  { id: 'json', name: 'JSON 格式化', icon: '<>' },
  { id: 'base64', name: 'Base64 编解码', icon: '#' },
  { id: 'timestamp', name: '时间戳转换', icon: '⏰' },
  { id: 'text', name: '文本工具', icon: 'T' },
  { id: 'diff', name: '文本对比', icon: '📄' },
];

export default function ToolSelector({ activeTool, onToolChange }: ToolSelectorProps) {
  return (
    <aside className="w-64 min-w-[200px] bg-white dark:bg-zinc-900 rounded-xl border p-6 h-fit self-start shadow-sm">
      <div className="text-lg font-semibold mb-6 text-blue-600">工具列表</div>
      <nav className="space-y-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
              activeTool === tool.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <span className="text-base">{tool.icon}</span>
            <span>{tool.name}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
} 