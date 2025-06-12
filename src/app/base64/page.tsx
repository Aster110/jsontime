'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, AlertCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from 'next/link';

// Copy Button Component
function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className={className}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "已复制" : "复制"}
    </Button>
  );
}

export default function Base64Page() {
  const { theme, setTheme } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleInputChange = (value: string) => {
    setInput(value);
    setError('');
    if (value.trim()) {
      try {
        if (mode === 'encode') {
          // 使用 encodeURIComponent 处理中文
          const encoded = btoa(encodeURIComponent(value));
          setOutput(encoded);
        } else {
          // 使用 decodeURIComponent 解码中文
          const decoded = decodeURIComponent(atob(value));
          setOutput(decoded);
        }
      } catch (err) {
        setError('输入格式不正确');
        setOutput('');
      }
    } else {
      setOutput('');
    }
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError('');
  };

  const clearInput = () => {
    setInput('');
    setOutput('');
    setError('');
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
      <main className="flex flex-1 w-full max-w-6xl mx-auto mt-8 gap-8">
        {/* 左侧工具栏 */}
        <aside className="w-64 min-w-[200px] bg-white dark:bg-zinc-900 rounded-xl border p-6 h-fit self-start shadow-sm">
          <div className="text-lg font-semibold mb-6 text-blue-600">工具列表</div>
          <nav className="space-y-2">
            <Link href="/json" className="block">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-gray-600 dark:text-gray-300">
                <span className="text-base">{'<>'}</span>
                <span>JSON 格式化</span>
              </div>
            </Link>
            <Link href="/base64" className="block">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                <span className="text-base">#</span>
                <span>Base64 编解码</span>
              </div>
            </Link>
            <Link href="/timestamp" className="block">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-gray-600 dark:text-gray-300">
                <span className="text-base">⏰</span>
                <span>时间戳转换</span>
              </div>
            </Link>
            <Link href="/text" className="block">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-gray-600 dark:text-gray-300">
                <span className="text-base">T</span>
                <span>文本工具</span>
              </div>
            </Link>
            <Link href="/diff" className="block">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-gray-600 dark:text-gray-300">
                <span className="text-base">📄</span>
                <span>文本对比</span>
              </div>
            </Link>
          </nav>
        </aside>
        {/* 右侧主内容区 */}
        <section className="flex-1">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <span>#</span> Base64 编解码工具
                </div>
                <div className="text-muted-foreground text-sm">
                  快速进行 Base64 编码和解码，支持中文
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 模式切换 */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleModeChange('encode')}
                  variant={mode === 'encode' ? 'default' : 'outline'}
                  className={mode === 'encode' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
                >
                  编码
                </Button>
                <Button
                  onClick={() => handleModeChange('decode')}
                  variant={mode === 'decode' ? 'default' : 'outline'}
                  className={mode === 'decode' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
                >
                  解码
                </Button>
              </div>

              {/* 输入区 */}
              <div>
                <div className="font-medium mb-1">输入文本:</div>
                <Textarea
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full h-[120px] font-mono text-sm resize-none"
                  placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64 字符串...'}
                />
              </div>

              {/* 操作按钮区 */}
              <div className="flex flex-wrap gap-2">
                <CopyButton text={input} className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" />
                <Button
                  onClick={clearInput}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  清空
                </Button>
              </div>

              {/* 输出区 */}
              <div>
                <div className="font-medium mb-1">输出结果:</div>
                <div className="relative">
                  <Textarea
                    value={output}
                    readOnly
                    className="w-full h-[120px] font-mono text-sm resize-none bg-muted/50"
                    placeholder="输出结果将显示在这里..."
                  />
                  {output && (
                    <div className="absolute top-2 right-2">
                      <CopyButton text={output} />
                    </div>
                  )}
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* 使用说明 */}
              <div className="mt-4 p-4 bg-muted/60 rounded-lg text-sm flex gap-2 items-start">
                <span className="mt-0.5 text-yellow-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
                <div>
                  <div>Base64 使用说明：</div>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>编码：将普通文本转换为 Base64 格式</li>
                    <li>解码：将 Base64 字符串转换回原始文本</li>
                    <li>支持中文编码和解码</li>
                    <li>支持复制输入和输出内容</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
} 