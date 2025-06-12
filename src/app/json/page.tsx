'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";

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

export default function JsonPage() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [removeEscape, setRemoveEscape] = useState(false);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorColumn, setErrorColumn] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // 防抖处理实时校验
  const debounceValidation = useRef<NodeJS.Timeout>();

  // 修复后的 validateJsonRealtime 函数
  const validateJsonRealtime = (text: string) => {
    if (!text.trim()) {
      setError('');
      setErrorLine(null);
      setErrorColumn(null);
      return;
    }

    try {
      let processedInput = text;
      if (removeEscape) {
        processedInput = text.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }
      JSON.parse(processedInput);
      setError('');
      setErrorLine(null);
      setErrorColumn(null);
    } catch (err) {
      const errorMsg = (err as Error).message;
      const match = errorMsg.match(/position (\d+)/);

      if (match) {
        const position = Number.parseInt(match[1]);
        
        let currentPosition = 0;
        let lineNumber = 1;
        let columnNumber = 1;
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length;
          
          if (position <= currentPosition + lineLength) {
            lineNumber = i + 1;
            columnNumber = position - currentPosition + 1;
            break;
          }
          
          currentPosition += lineLength + 1;
        }

        if (columnNumber > lines[lineNumber - 1].length) {
          const currentLine = lines[lineNumber - 1];
          const trimmedLine = currentLine.trim();
          
          if (trimmedLine && !trimmedLine.endsWith(',') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('[')) {
            columnNumber = currentLine.length + 1;
          }
        }

        setErrorLine(lineNumber - 1);
        setErrorColumn(columnNumber);
        setError(`第 ${lineNumber} 行，第 ${columnNumber} 列: ${errorMsg}`);
      } else {
        setError(errorMsg);
        setErrorLine(null);
        setErrorColumn(null);
      }
    }
  };

  // 处理输入变化 - 添加防抖
  const handleInputChange = (value: string) => {
    setInput(value);

    if (debounceValidation.current) {
      clearTimeout(debounceValidation.current);
    }

    debounceValidation.current = setTimeout(() => {
      validateJsonRealtime(value);
    }, 300);
  };

  // 处理滚动同步
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      const newScrollTop = textareaRef.current.scrollTop;
      lineNumbersRef.current.scrollTop = newScrollTop;
      setScrollTop(newScrollTop);
    }
  };

  const formatJSON = () => {
    try {
      let processedInput = input;
      if (removeEscape) {
        processedInput = input.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }
      const formatted = JSON.stringify(JSON.parse(processedInput), null, 2);
      setInput(formatted);
      setError('');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '未知错误';
      setError(`格式化失败: ${errorMessage}`);
    }
  };

  const compressJSON = () => {
    try {
      let processedInput = input;
      if (removeEscape) {
        processedInput = input.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }
      const compressed = JSON.stringify(JSON.parse(processedInput));
      setInput(compressed);
      setError('');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '未知错误';
      setError(`压缩失败: ${errorMessage}`);
    }
  };

  const addEscape = () => {
    setInput(input.replace(/"/g, '\\"'));
  };

  const removeEscapeChars = () => {
    setInput(input.replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>JSON 格式化</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={formatJSON} variant="default">
                格式化
              </Button>
              <Button onClick={compressJSON} variant="secondary">
                压缩
              </Button>
              <Button onClick={addEscape} variant="outline">
                添加转义
              </Button>
              <Button onClick={removeEscapeChars} variant="outline">
                移除转义
              </Button>
            </div>
            <CopyButton text={input} />
          </div>

          <div className="relative">
            <div
              ref={lineNumbersRef}
              className="absolute left-0 top-0 bottom-0 w-12 bg-muted border-r text-right pr-2 font-mono text-sm text-muted-foreground overflow-hidden select-none"
              aria-hidden="true"
            />
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onScroll={handleScroll}
              className="w-full h-[500px] pl-14 font-mono text-sm"
              placeholder="在此粘贴 JSON 文本..."
            />
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 