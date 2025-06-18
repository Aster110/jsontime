import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import CopyButton from './CopyButton';

// 简单的差异比较函数
function computeDiff(text1: string, text2: string): { html: string, diffCount: number } {
  if (!text1 && !text2) return { html: '', diffCount: 0 };
  if (!text1) return { html: `<span class="bg-green-100 dark:bg-green-900/30 px-1">${text2}</span>`, diffCount: 1 };
  if (!text2) return { html: `<span class="bg-red-100 dark:bg-red-900/30 px-1">${text1}</span>`, diffCount: 1 };

  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  let result = '';
  let diffCount = 0;

  const maxLines = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLines; i++) {
    const line1 = i < lines1.length ? lines1[i] : '';
    const line2 = i < lines2.length ? lines2[i] : '';

    if (line1 === line2) {
      // 相同行
      result += `<div class="py-1 border-b border-gray-100 dark:border-gray-800">${line1 || '&nbsp;'}</div>`;
    } else {
      // 不同行
      diffCount++;
      result += `<div class="py-1 border-b border-gray-100 dark:border-gray-800 flex">
        <div class="flex-1 bg-red-100 dark:bg-red-900/30 px-1">${line1 || '&nbsp;'}</div>
        <div class="w-4"></div>
        <div class="flex-1 bg-green-100 dark:bg-green-900/30 px-1">${line2 || '&nbsp;'}</div>
      </div>`;
    }
  }

  return { html: result, diffCount };
}

export default function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState('');
  const [diffCount, setDiffCount] = useState(0);
  const [error, setError] = useState('');

  // 计算差异
  const calculateDiff = () => {
    try {
      if (!text1.trim() && !text2.trim()) {
        setError('请输入要比较的文本');
        setDiffResult('');
        setDiffCount(0);
        return;
      }

      const { html, diffCount } = computeDiff(text1, text2);
      setDiffResult(html);
      setDiffCount(diffCount);
      setError('');
    } catch (err) {
      setError('比较失败');
      setDiffResult('');
      setDiffCount(0);
    }
  };

  // 交换文本
  const swapTexts = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
  };

  // 清空输入
  const clearInputs = () => {
    setText1('');
    setText2('');
    setDiffResult('');
    setDiffCount(0);
    setError('');
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span>📄</span> 文本比对工具
          </div>
          <div className="text-muted-foreground text-sm">
            比较两段文本的差异，逐行显示不同之处
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 左侧文本输入 */}
          <div>
            <div className="font-medium mb-1">文本 A:</div>
            <Textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="w-full h-[180px] font-mono text-sm resize-none"
              placeholder="输入第一段文本..."
            />
            <div className="mt-2 flex gap-2">
              <CopyButton text={text1} className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" />
            </div>
          </div>

          {/* 右侧文本输入 */}
          <div>
            <div className="font-medium mb-1">文本 B:</div>
            <Textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="w-full h-[180px] font-mono text-sm resize-none"
              placeholder="输入第二段文本..."
            />
            <div className="mt-2 flex gap-2">
              <CopyButton text={text2} className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" />
            </div>
          </div>
        </div>

        {/* 操作按钮区 */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={calculateDiff}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            比较差异
          </Button>
          <Button
            onClick={swapTexts}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            交换文本
          </Button>
          <Button
            onClick={clearInputs}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            清空
          </Button>
        </div>

        {/* 差异结果 */}
        {diffResult && (
          <div>
            <div className="font-medium mb-1 flex justify-between items-center">
              <span>比较结果:</span>
              <span className="text-sm text-muted-foreground">
                发现 {diffCount} 处差异
              </span>
            </div>
            <div className="border rounded-md p-4 bg-white dark:bg-zinc-900 overflow-auto max-h-[300px]">
              <div className="grid grid-cols-2 gap-4 mb-2 font-medium">
                <div>文本 A</div>
                <div>文本 B</div>
              </div>
              <div
                className="font-mono text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: diffResult }}
              />
            </div>
            <div className="mt-2 text-sm">
              <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded mr-2">红色</span>表示删除的内容
              <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded mx-2">绿色</span>表示新增的内容
            </div>
          </div>
        )}

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
            <div>文本比对使用说明：</div>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>在左右两侧输入要比较的文本</li>
              <li>点击"比较差异"按钮查看结果</li>
              <li>差异部分将用不同颜色标记</li>
              <li>可以使用"交换文本"按钮交换两侧的内容</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 