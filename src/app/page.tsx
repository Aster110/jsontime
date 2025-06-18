'use client';

import { useState } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import ToolSelector, { ToolType } from '@/components/ToolSelector';
import JsonFormatter from '@/components/JsonFormatter';
import Base64Converter from '@/components/Base64Converter';
import TimestampConverter from '@/components/TimestampConverter';
import TextTools from '@/components/TextTools';
import TextDiff from '@/components/TextDiff';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [activeTool, setActiveTool] = useState<ToolType>('json');

  // 根据当前选择的工具渲染对应的组件
  const renderActiveTool = () => {
    switch (activeTool) {
      case 'json':
        return <JsonFormatter />;
      case 'base64':
        return <Base64Converter />;
      case 'timestamp':
        return <TimestampConverter />;
      case 'text':
        return <TextTools />;
      case 'diff':
        return <TextDiff />;
      default:
        return <JsonFormatter />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-black dark:to-zinc-900">
      {/* 顶部主标题栏 */}
      <header className="w-full border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur px-8 py-4 flex items-center justify-between">
        <div className="w-8"></div>
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">JsonTime，你的在线工具箱</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </header>
      <main className="flex flex-1 w-full max-w-6xl mx-auto mt-8 gap-8 pb-8">
        {/* 左侧工具选择器 */}
        <ToolSelector activeTool={activeTool} onToolChange={setActiveTool} />
        
        {/* 右侧工具内容区 */}
        <section className="flex-1">
          {renderActiveTool()}
        </section>
      </main>
    </div>
  );
}
