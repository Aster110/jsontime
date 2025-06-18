import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import CopyButton from './CopyButton';

export default function Base64Converter() {
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
  );
} 