import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import CopyButton from './CopyButton';

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<'timestamp2date' | 'date2timestamp'>('timestamp2date');
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');

  // 每秒更新当前时间戳
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(unit === 'seconds' ? Math.floor(now / 1000) : now);
    }, 1000);

    // 初始化当前时间戳
    const now = Date.now();
    setCurrentTime(unit === 'seconds' ? Math.floor(now / 1000) : now);

    return () => clearInterval(timer);
  }, [unit]);

  // 获取当前本地时间字符串
  const getCurrentLocalTimeString = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  // 使用当前时间
  const useCurrentTime = () => {
    if (mode === 'timestamp2date') {
      setTimestamp(currentTime.toString());
      convertTimestampToDate(currentTime.toString());
    } else {
      const localTime = getCurrentLocalTimeString();
      setDateString(localTime);
      convertDateToTimestamp(localTime);
    }
  };

  // 时间戳转日期
  const convertTimestampToDate = (value: string) => {
    try {
      setTimestamp(value);
      if (!value.trim()) {
        setDateString('');
        setError('');
        return;
      }

      // 检查是否为有效数字
      const timestampNum = Number(value);
      if (isNaN(timestampNum)) {
        setError('请输入有效的时间戳数值');
        setDateString('');
        return;
      }

      // 根据选择的单位转换
      const date = unit === 'milliseconds'
        ? new Date(timestampNum) // 毫秒级
        : new Date(timestampNum * 1000); // 秒级
      
      if (date.toString() === 'Invalid Date') {
        setError('无效的时间戳');
        setDateString('');
        return;
      }

      // 格式化日期
      const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
      setDateString(formattedDate);
      setError('');
    } catch (err) {
      setError('转换失败');
      setDateString('');
    }
  };

  // 日期转时间戳
  const convertDateToTimestamp = (value: string) => {
    try {
      setDateString(value);
      if (!value.trim()) {
        setTimestamp('');
        setError('');
        return;
      }

      const date = new Date(value);
      if (date.toString() === 'Invalid Date') {
        setError('无效的日期格式');
        setTimestamp('');
        return;
      }

      // 根据选择的单位输出对应的时间戳
      if (unit === 'seconds') {
        setTimestamp(Math.floor(date.getTime() / 1000).toString());
      } else {
        setTimestamp(date.getTime().toString());
      }
      
      setError('');
    } catch (err) {
      setError('转换失败');
      setTimestamp('');
    }
  };

  // 处理输入变化
  const handleInputChange = (value: string) => {
    if (mode === 'timestamp2date') {
      convertTimestampToDate(value);
    } else {
      convertDateToTimestamp(value);
    }
  };

  // 切换模式
  const handleModeChange = (newMode: 'timestamp2date' | 'date2timestamp') => {
    setMode(newMode);
    setTimestamp('');
    setDateString('');
    setError('');
  };

  // 切换单位
  const handleUnitChange = (newUnit: 'seconds' | 'milliseconds') => {
    setUnit(newUnit);
    // 清空输入，避免混淆
    setTimestamp('');
    setDateString('');
    setError('');
  };

  // 清空输入
  const clearInput = () => {
    setTimestamp('');
    setDateString('');
    setError('');
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span>⏰</span> 时间戳转换工具
          </div>
          <div className="text-muted-foreground text-sm">
            在时间戳和日期之间快速转换，支持秒级和毫秒级时间戳
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 当前时间显示 */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="font-medium">当前时间戳: <span className="font-mono">{currentTime}</span></div>
          <div className="text-sm text-muted-foreground mt-1">
            当前时间: {new Date(unit === 'seconds' ? currentTime * 1000 : currentTime).toLocaleString()}
          </div>
        </div>

        {/* 模式和单位切换 */}
        <div className="space-y-2">
          {/* 模式切换 */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleModeChange('timestamp2date')}
              variant={mode === 'timestamp2date' ? 'default' : 'outline'}
              className={mode === 'timestamp2date' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
            >
              时间戳转日期
            </Button>
            <Button
              onClick={() => handleModeChange('date2timestamp')}
              variant={mode === 'date2timestamp' ? 'default' : 'outline'}
              className={mode === 'date2timestamp' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
            >
              日期转时间戳
            </Button>
            <Button
              onClick={useCurrentTime}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 ml-auto"
            >
              使用当前时间
            </Button>
          </div>
          
          {/* 单位切换 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">时间戳单位:</span>
            <Button
              onClick={() => handleUnitChange('seconds')}
              variant={unit === 'seconds' ? 'default' : 'outline'}
              size="sm"
              className={unit === 'seconds' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}
            >
              秒
            </Button>
            <Button
              onClick={() => handleUnitChange('milliseconds')}
              variant={unit === 'milliseconds' ? 'default' : 'outline'}
              size="sm"
              className={unit === 'milliseconds' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}
            >
              毫秒
            </Button>
          </div>
        </div>

        {/* 输入区 */}
        <div>
          <div className="font-medium mb-1">
            {mode === 'timestamp2date' ? `输入${unit === 'seconds' ? '秒' : '毫秒'}级时间戳:` : '输入日期时间:'}
          </div>
          <Textarea
            value={mode === 'timestamp2date' ? timestamp : dateString}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full h-[80px] font-mono text-sm resize-none"
            placeholder={mode === 'timestamp2date' 
              ? `输入${unit === 'seconds' ? '10位(秒)' : '13位(毫秒)'}时间戳...` 
              : '输入日期时间，如 2023-01-01 12:00:00...'}
          />
        </div>

        {/* 操作按钮区 */}
        <div className="flex flex-wrap gap-2">
          <CopyButton 
            text={mode === 'timestamp2date' ? timestamp : dateString} 
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
          />
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
          <div className="font-medium mb-1">
            {mode === 'timestamp2date' ? '转换后的日期时间:' : `转换后的${unit === 'seconds' ? '秒' : '毫秒'}级时间戳:`}
          </div>
          <div className="relative">
            <Textarea
              value={mode === 'timestamp2date' ? dateString : timestamp}
              readOnly
              className="w-full h-[80px] font-mono text-sm resize-none bg-muted/50"
              placeholder="转换结果将显示在这里..."
            />
            {(mode === 'timestamp2date' ? dateString : timestamp) && (
              <div className="absolute top-2 right-2">
                <CopyButton text={mode === 'timestamp2date' ? dateString : timestamp} />
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
          <span className="mt-0.5 text-yellow-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
          <div>
            <div>时间戳使用说明：</div>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>可选择秒级（10位）或毫秒级（13位）时间戳单位</li>
              <li>日期格式建议使用：YYYY-MM-DD HH:MM:SS</li>
              <li>可以点击"使用当前时间"快速获取当前时间</li>
              <li>转换结果可以直接复制使用</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 