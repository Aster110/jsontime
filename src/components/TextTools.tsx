import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import CopyButton from './CopyButton';

type TextOperation = 
  | 'trim' 
  | 'uppercase' 
  | 'lowercase' 
  | 'capitalize' 
  | 'reverse' 
  | 'countChars' 
  | 'countWords' 
  | 'countLines'
  | 'removeSpaces'
  | 'removeEmptyLines'
  | 'removeExtraSpaces'
  | 'sortLines';

interface OperationInfo {
  name: string;
  description: string;
  operation: (text: string) => string;
  isAnalysis?: boolean;
}

export default function TextTools() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  // 定义文本操作
  const operations: Record<TextOperation, OperationInfo> = {
    trim: {
      name: '去除首尾空格',
      description: '移除文本开头和结尾的空白字符',
      operation: (text) => text.trim()
    },
    uppercase: {
      name: '转大写',
      description: '将所有字母转为大写',
      operation: (text) => text.toUpperCase()
    },
    lowercase: {
      name: '转小写',
      description: '将所有字母转为小写',
      operation: (text) => text.toLowerCase()
    },
    capitalize: {
      name: '首字母大写',
      description: '将每个单词的首字母转为大写',
      operation: (text) => {
        return text.replace(/\b\w/g, (char) => char.toUpperCase());
      }
    },
    reverse: {
      name: '反转文本',
      description: '将文本内容反向排列',
      operation: (text) => text.split('').reverse().join('')
    },
    countChars: {
      name: '字符统计',
      description: '统计文本中的字符数量',
      operation: (text) => `字符总数（含空格）: ${text.length}\n字符总数（不含空格）: ${text.replace(/\s/g, '').length}`,
      isAnalysis: true
    },
    countWords: {
      name: '单词统计',
      description: '统计文本中的单词数量',
      operation: (text) => {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        return `单词总数: ${words.length}`;
      },
      isAnalysis: true
    },
    countLines: {
      name: '行数统计',
      description: '统计文本中的行数',
      operation: (text) => {
        const lines = text.split(/\r\n|\r|\n/).filter(line => line.length > 0);
        return `行数: ${lines.length}`;
      },
      isAnalysis: true
    },
    removeSpaces: {
      name: '移除所有空格',
      description: '删除文本中的所有空白字符',
      operation: (text) => text.replace(/\s/g, '')
    },
    removeEmptyLines: {
      name: '移除空行',
      description: '删除文本中的空白行',
      operation: (text) => text.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0).join('\n')
    },
    removeExtraSpaces: {
      name: '移除多余空格',
      description: '将连续多个空格替换为单个空格',
      operation: (text) => text.replace(/\s+/g, ' ')
    },
    sortLines: {
      name: '行排序',
      description: '对文本行按字母顺序排序',
      operation: (text) => text.split(/\r\n|\r|\n/).sort().join('\n')
    }
  };

  // 处理文本操作
  const handleOperation = (op: TextOperation) => {
    try {
      if (!input.trim()) {
        setError('请输入要处理的文本');
        return;
      }

      const result = operations[op].operation(input);
      setOutput(result);
      setError('');
    } catch (err) {
      setError('处理失败');
      setOutput('');
    }
  };

  // 清空输入
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
            <span>T</span> 文本工具箱
          </div>
          <div className="text-muted-foreground text-sm">
            多种文本处理工具，满足各种文本编辑需求
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 输入区 */}
        <div>
          <div className="font-medium mb-1">输入文本:</div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[150px] font-mono text-sm resize-none"
            placeholder="输入要处理的文本..."
          />
        </div>

        {/* 操作按钮区 - 分组显示 */}
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-2">基础操作:</div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleOperation('trim')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                去除首尾空格
              </Button>
              <Button onClick={() => handleOperation('uppercase')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                转大写
              </Button>
              <Button onClick={() => handleOperation('lowercase')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                转小写
              </Button>
              <Button onClick={() => handleOperation('capitalize')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                首字母大写
              </Button>
              <Button onClick={() => handleOperation('reverse')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                反转文本
              </Button>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">空白处理:</div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleOperation('removeSpaces')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                移除所有空格
              </Button>
              <Button onClick={() => handleOperation('removeEmptyLines')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                移除空行
              </Button>
              <Button onClick={() => handleOperation('removeExtraSpaces')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                移除多余空格
              </Button>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">高级操作:</div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleOperation('sortLines')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                行排序
              </Button>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">统计分析:</div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleOperation('countChars')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                字符统计
              </Button>
              <Button onClick={() => handleOperation('countWords')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                单词统计
              </Button>
              <Button onClick={() => handleOperation('countLines')} variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                行数统计
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2 border-t">
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
        </div>

        {/* 输出区 */}
        <div>
          <div className="font-medium mb-1">处理结果:</div>
          <div className="relative">
            <Textarea
              value={output}
              readOnly
              className="w-full h-[150px] font-mono text-sm resize-none bg-muted/50"
              placeholder="处理结果将显示在这里..."
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
            <div>文本工具使用说明：</div>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>输入文本后点击相应的功能按钮进行处理</li>
              <li>处理结果会显示在下方文本框中</li>
              <li>可以直接复制输入或输出内容</li>
              <li>统计功能会分析文本的字符数、单词数或行数</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 