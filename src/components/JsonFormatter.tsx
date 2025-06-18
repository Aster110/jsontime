import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Check } from "lucide-react";
import CopyButton from './CopyButton';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [removeEscape, setRemoveEscape] = useState(false);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorColumn, setErrorColumn] = useState<number | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [lineCount, setLineCount] = useState(1);

  // 防抖处理实时校验
  const debounceValidation = useRef<NodeJS.Timeout>();

  // 修复后的 validateJsonRealtime 函数
  const validateJsonRealtime = (text: string) => {
    if (!text.trim()) {
      setError('');
      setErrorLine(null);
      setErrorColumn(null);
      setIsValid(null);
      setSuccessMessage('');
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
      setIsValid(true);
      setSuccessMessage('JSON 格式正确');
    } catch (err) {
      const errorMsg = (err as Error).message;
      setIsValid(false);
      setSuccessMessage('');
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

  // 更新行号显示
  const updateLineNumbers = (text: string) => {
    const lines = text.split('\n');
    setLineCount(lines.length);
  };

  // 处理输入变化 - 添加防抖
  const handleInputChange = (value: string) => {
    setInput(value);
    // 根据实际内容更新行号
    const lines = value.split('\n');
    setLineCount(lines.length);

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
      // 格式化后更新行号
      const lines = formatted.split('\n');
      setLineCount(lines.length);
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
      // 压缩后设置为单行
      setLineCount(1);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
        updateLineNumbers(content);
        validateJsonRealtime(content);
      };
      reader.readAsText(file);
    }
  };

  // 新增：清空输入
  const clearInput = () => {
    setInput("");
    setError("");
    setIsValid(null);
    setErrorLine(null);
    setErrorColumn(null);
    setLineCount(1);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span>{'<>'}</span> JSON 格式化工具
          </div>
          <div className="text-muted-foreground text-sm">
            美化、压缩、校验 JSON 数据，支持转义处理，实时错误检测
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 输入区标签 */}
        <div className="font-medium mb-1">输入 JSON:</div>
        <div className="relative">
          <div
            ref={lineNumbersRef}
            className="absolute left-0 top-0 bottom-0 w-12 bg-muted border-r text-right pr-2 font-mono text-sm text-muted-foreground overflow-hidden select-none pt-3"
            aria-hidden="true"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className={`h-6 leading-6 ${errorLine === i ? 'text-destructive' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onScroll={handleScroll}
            className="w-full h-[220px] pl-14 font-mono text-sm pt-3 resize-none"
            placeholder={'{"name": "example", "value": 123}'}
          />
        </div>
        {/* 处理时去除转义字符 */}
        <div className="flex items-center gap-2">
          <input
            id="remove-escape"
            type="checkbox"
            checked={removeEscape}
            onChange={() => setRemoveEscape(!removeEscape)}
            className="accent-blue-600"
          />
          <label htmlFor="remove-escape" className="text-sm text-muted-foreground select-none">
            处理时去除转义字符
          </label>
        </div>
        {/* 操作按钮区 */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button onClick={formatJSON} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
            格式化
          </Button>
          <Button onClick={compressJSON} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
            压缩一行
          </Button>
          <Button onClick={() => validateJsonRealtime(input)} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
            校验格式
          </Button>
          <Button onClick={addEscape} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            添加转义
          </Button>
          <Button onClick={removeEscapeChars} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            去除转义
          </Button>
          <CopyButton text={input} className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" />
          <Button onClick={clearInput} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            清空
          </Button>
        </div>
        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {/* 成功提示 */}
        {successMessage && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-center gap-2">
            <Check className="h-4 w-4" />
            {successMessage}
          </div>
        )}
        {/* JSON 格式提示区 */}
        <div className="mt-4 p-4 bg-muted/60 rounded-lg text-sm flex gap-2 items-start">
          <span className="mt-0.5 text-yellow-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
          <div>
            <div>JSON 格式提示：</div>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>字符串必须用双引号包围</li>
              <li>对象的 key 也必须用双引号</li>
              <li>最外层只能有一个根对象或数组</li>
              <li>支持的数据类型：字符串、布尔值、null、对象、数组、数值</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 