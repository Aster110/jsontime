"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Hash, Clock, FileText, Type, Sparkles, Copy, Check } from "lucide-react"

const tools = [
  {
    id: "json",
    title: "JSON 格式化",
    description: "美化、压缩、校验 JSON 数据",
    icon: Code,
  },
  {
    id: "base64",
    title: "Base64 编解码",
    description: "文本与 Base64 相互转换",
    icon: Hash,
  },
  {
    id: "timestamp",
    title: "时间戳转换",
    description: "时间戳与日期相互转换",
    icon: Clock,
  },
  {
    id: "text-tools",
    title: "文本工具",
    description: "多行压缩、格式处理",
    icon: Type,
  },
  {
    id: "diff",
    title: "文本对比",
    description: "左右双栏差异高亮对比",
    icon: FileText,
  },
]

export default function HomePage() {
  const [selectedTool, setSelectedTool] = useState("json")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                在线工具箱
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">工具列表</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{tool.title}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <Tabs value={selectedTool} onValueChange={setSelectedTool}>
              <TabsContent value="json">
                <JsonFormatter />
              </TabsContent>
              <TabsContent value="base64">
                <Base64Tool />
              </TabsContent>
              <TabsContent value="timestamp">
                <TimestampConverter />
              </TabsContent>
              <TabsContent value="text-tools">
                <TextTools />
              </TabsContent>
              <TabsContent value="diff">
                <TextDiff />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// Copy Button Component
function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className={className}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "已复制" : "复制"}
    </Button>
  )
}

// Enhanced JSON Formatter Component with line numbers and real-time validation
function JsonFormatter() {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [removeEscape, setRemoveEscape] = useState(false)
  const [errorLine, setErrorLine] = useState<number | null>(null)
  const [errorColumn, setErrorColumn] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  // 防抖处理实时校验
  const debounceValidation = useRef<NodeJS.Timeout>()

  // 修复后的 validateJsonRealtime 函数
  const validateJsonRealtime = (text: string) => {
    if (!text.trim()) {
      setError("")
      setErrorLine(null)
      setErrorColumn(null)
      return
    }

    try {
      let processedInput = text
      if (removeEscape) {
        processedInput = text.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      }
      JSON.parse(processedInput)
      setError("")
      setErrorLine(null)
      setErrorColumn(null)
    } catch (err) {
      const errorMsg = (err as Error).message
      const match = errorMsg.match(/position (\d+)/)

      if (match) {
        const position = Number.parseInt(match[1])
        
        // 修复：使用更准确的方法计算行号和列号
        let currentPosition = 0
        let lineNumber = 1
        let columnNumber = 1
        const lines = text.split('\n')
        
        // 遍历每一行，找到错误位置
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length
          
          // 检查错误位置是否在当前行
          if (position <= currentPosition + lineLength) {
            lineNumber = i + 1
            columnNumber = position - currentPosition + 1
            break
          }
          
          // 移动到下一行（+1 是换行符）
          currentPosition += lineLength + 1
        }

        // 特殊处理：如果错误在行尾，可能是缺少逗号
        if (columnNumber > lines[lineNumber - 1].length) {
          // 错误位置超出当前行长度，可能是缺少逗号
          const currentLine = lines[lineNumber - 1]
          const trimmedLine = currentLine.trim()
          
          // 检查是否是缺少逗号的情况
          if (trimmedLine && !trimmedLine.endsWith(',') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('[')) {
            columnNumber = currentLine.length + 1
          }
        }

        setErrorLine(lineNumber - 1)  // 转换为0-based用于高亮显示
        setErrorColumn(columnNumber)
        setError(`第 ${lineNumber} 行，第 ${columnNumber} 列: ${errorMsg}`)
      } else {
        setError(errorMsg)
        setErrorLine(null)
        setErrorColumn(null)
      }
    }
  }

  // 处理输入变化 - 添加防抖
  const handleInputChange = (value: string) => {
    setInput(value)

    // 清除之前的定时器
    if (debounceValidation.current) {
      clearTimeout(debounceValidation.current)
    }

    // 设置新的防抖定时器
    debounceValidation.current = setTimeout(() => {
      validateJsonRealtime(value)
    }, 300) // 300ms 防抖
  }

  // 处理滚动同步 - 添加错误行高亮的滚动更新
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      const newScrollTop = textareaRef.current.scrollTop
      lineNumbersRef.current.scrollTop = newScrollTop
      setScrollTop(newScrollTop) // 更新滚动位置状态
    }
  }

  // 修复后的格式化函数中的错误处理
  const formatJson = () => {
    try {
      let processedInput = input
      if (removeEscape) {
        processedInput = input.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      }

      const parsed = JSON.parse(processedInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setInput(formatted)
      setError("")
      setErrorLine(null)
      setErrorColumn(null)
    } catch (err) {
      // 使用相同的错误处理逻辑
      const errorMsg = (err as Error).message
      const match = errorMsg.match(/position (\d+)/)
      
      if (match) {
        const position = Number.parseInt(match[1])
        
        let currentPosition = 0
        let lineNumber = 1
        let columnNumber = 1
        const lines = input.split('\n')
        
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length
          
          if (position <= currentPosition + lineLength) {
            lineNumber = i + 1
            columnNumber = position - currentPosition + 1
            break
          }
          
          currentPosition += lineLength + 1
        }

        // 特殊处理缺少逗号的情况
        if (columnNumber > lines[lineNumber - 1].length) {
          const currentLine = lines[lineNumber - 1]
          const trimmedLine = currentLine.trim()
          
          if (trimmedLine && !trimmedLine.endsWith(',') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('[')) {
            columnNumber = currentLine.length + 1
          }
        }

        setErrorLine(lineNumber - 1)  // 0-based for highlighting
        setErrorColumn(columnNumber)
        setError(`第 ${lineNumber} 行，第 ${columnNumber} 列: ${errorMsg}`)
      } else {
        setError("JSON 格式错误: " + errorMsg)
        setErrorLine(null)
        setErrorColumn(null)
      }
    }
  }

  const minifyJson = () => {
    try {
      let processedInput = input
      if (removeEscape) {
        processedInput = input.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      }
      const parsed = JSON.parse(processedInput)
      const minified = JSON.stringify(parsed)
      setInput(minified)
      setError("")
      setErrorLine(null)
      setErrorColumn(null)
    } catch (err) {
      const errorMsg = (err as Error).message
      const match = errorMsg.match(/position (\d+)/)
      if (match) {
        const position = Number.parseInt(match[1])
        const lines = input.substring(0, position).split("\n")
        const lineNumber = lines.length
        const columnNumber = lines[lines.length - 1].length + 1
        setErrorLine(lineNumber)
        setErrorColumn(columnNumber)
        setError(`第 ${lineNumber} 行，第 ${columnNumber} 列: ${errorMsg}`)
      } else {
        setError("JSON 格式错误: " + errorMsg)
      }
    }
  }

  const validateJson = () => {
    try {
      let processedInput = input
      if (removeEscape) {
        processedInput = input.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      }

      // 先尝试格式化
      let formattedInput = processedInput.trim()
      
      // 如果不是以 { 或 [ 开头，尝试添加
      if (!formattedInput.startsWith("{") && !formattedInput.startsWith("[")) {
        formattedInput = "{" + formattedInput
      }

      // 如果不是以 } 或 ] 结尾，尝试添加
      if (!formattedInput.endsWith("}") && !formattedInput.endsWith("]")) {
        if (formattedInput.startsWith("{")) {
          formattedInput = formattedInput + "}"
        } else if (formattedInput.startsWith("[")) {
          formattedInput = formattedInput + "]"
        }
      }

      // 尝试解析并格式化
      const parsed = JSON.parse(formattedInput)
      const formatted = JSON.stringify(parsed, null, 2)
      
      // 更新输入为格式化后的内容
      setInput(formatted)
      
      setError("")
      setErrorLine(null)
      setErrorColumn(null)
      setError("✅ JSON 格式正确")
    } catch (err) {
      const errorMsg = (err as Error).message
      const match = errorMsg.match(/position (\d+)/)

      if (match) {
        const position = Number.parseInt(match[1])
        const lines = input.substring(0, position).split("\n")
        const lineNumber = lines.length - 1
        const columnNumber = lines[lines.length - 1].length + 1

        setErrorLine(lineNumber)
        setErrorColumn(columnNumber)
        setError(`第 ${lineNumber} 行，第 ${columnNumber} 列: ${errorMsg}`)
      } else {
        setError("JSON 格式错误: " + errorMsg)
      }
    }
  }

  const addEscape = () => {
    const escaped = input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    setInput(escaped)
  }

  // 新增：去除转义功能
  const removeEscapeChars = () => {
    const unescaped = input.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
    setInput(unescaped)
  }

  // 渲染带行号的文本区域 - 修复滚动同步
  const renderTextareaWithLineNumbers = () => {
    const lines = input.split("\n")
    const lineCount = Math.max(lines.length, 20)

    return (
      <div className="relative border rounded-md h-96 overflow-hidden">
        {/* 错误行高亮背景 - 放在最底层，不遮盖文字 */}
        {errorLine !== null && (
          <div
            className="absolute left-12 right-0 bg-red-100 border-l-2 border-red-400 pointer-events-none opacity-50"
            style={{
              top: `${8 + errorLine * 24 - scrollTop}px`,
              height: "24px",
              zIndex: 1,
            }}
          />
        )}

        {/* 行号区域 - 修复滚动同步 */}
        <div
          ref={lineNumbersRef}
          className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r text-xs text-gray-500 select-none overflow-hidden"
          style={{ zIndex: 2 }}
        >
          <div className="py-2">
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i + 1}
                className={`h-6 flex items-center justify-end pr-2 flex-shrink-0 ${
                  errorLine === i ? "bg-red-100 text-red-600 font-bold" : ""
                }`}
                style={{ lineHeight: "1.5rem" }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 文本输入区域 - 添加滚动事件监听 */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onScroll={handleScroll}
          placeholder='{"name": "example", "value": 123}'
          className="w-full h-full pl-14 pr-4 py-2 font-mono text-sm resize-none border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent relative"
          style={{
            lineHeight: "1.5rem",
            zIndex: 3,
          }}
        />
      </div>
    )
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceValidation.current) {
        clearTimeout(debounceValidation.current)
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          JSON 格式化工具
        </CardTitle>
        <CardDescription>美化、压缩、校验 JSON 数据，支持转义处理，实时错误检测</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">输入 JSON:</label>
          <div className="mt-2">{renderTextareaWithLineNumbers()}</div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="removeEscape"
            checked={removeEscape}
            onChange={(e) => {
              setRemoveEscape(e.target.checked)
              // 移除实时校验，避免卡顿
            }}
          />
          <label htmlFor="removeEscape" className="text-sm">
            处理时去除转义字符
          </label>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={formatJson}>格式化</Button>
          <Button variant="outline" onClick={minifyJson}>
            压缩一行
          </Button>
          <Button variant="outline" onClick={validateJson}>
            校验格式
          </Button>
          <Button variant="outline" onClick={addEscape}>
            添加转义
          </Button>
          <Button variant="outline" onClick={removeEscapeChars}>
            去除转义
          </Button>
          <CopyButton text={input} className="ml-2" />
          <Button
            variant="outline"
            onClick={() => {
              setInput("")
              setError("")
              setErrorLine(null)
              setErrorColumn(null)
            }}
          >
            清空
          </Button>
        </div>

        {/* 实时错误提示 */}
        {error && (
          <div className={`text-sm p-3 rounded border ${
            error.startsWith("✅") 
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-500"
          }`}>
            <div className="flex items-start gap-2">
              {error.startsWith("✅") ? (
                <span className="text-green-500 font-bold">✅</span>
              ) : (
                <span className="text-red-500 font-bold">❌</span>
              )}
              <div>
                <div className="font-medium">
                  {error.startsWith("✅") ? "JSON 格式正确" : "JSON 格式错误"}
                </div>
                <div className="mt-1">{error}</div>
                {errorLine !== null && errorColumn !== null && !error.startsWith("✅") && (
                  <div className="mt-2 text-xs bg-red-100 p-2 rounded">
                    <strong>错误位置:</strong> 第 {errorLine + 1} 行，第 {errorColumn} 列
                    <br />
                    <strong>提示:</strong>{" "}
                    请检查该位置附近的语法，常见问题包括：缺少逗号、多余逗号、引号不匹配、括号不匹配等
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* JSON 格式提示 */}
        {!input.trim() && (
          <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded">
            <div className="font-medium mb-2">💡 JSON 格式提示:</div>
            <ul className="space-y-1 text-xs">
              <li>• 字符串必须用双引号包围</li>
              <li>• 对象键名必须用双引号</li>
              <li>• 最后一个元素后不能有逗号</li>
              <li>• 支持数字、字符串、布尔值、null、对象、数组</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Base64 Tool Component
function Base64Tool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState("")

  const process = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
      setError("")
    } catch (err) {
      setError("处理失败，请检查输入格式")
      setOutput("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Base64 编解码工具
        </CardTitle>
        <CardDescription>文本与 Base64 格式相互转换，支持中文</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={(value) => setMode(value as "encode" | "decode")}>
          <TabsList>
            <TabsTrigger value="encode">编码</TabsTrigger>
            <TabsTrigger value="decode">解码</TabsTrigger>
          </TabsList>
        </Tabs>

        <div>
          <label className="text-sm font-medium">{mode === "encode" ? "输入文本:" : "输入 Base64:"}</label>
          <Textarea
            placeholder={mode === "encode" ? "输入要编码的文本" : "输入要解码的 Base64"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-2 h-32 font-mono"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={process}>{mode === "encode" ? "编码" : "解码"}</Button>
          <Button
            variant="outline"
            onClick={() => {
              setInput("")
              setOutput("")
              setError("")
            }}
          >
            清空
          </Button>
        </div>

        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{mode === "encode" ? "Base64 结果:" : "解码结果:"}</label>
              <CopyButton text={output} />
            </div>
            <Textarea value={output} readOnly className="h-32 font-mono" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Timestamp Converter Component
function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [error, setError] = useState("")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const timestampToDate = () => {
    try {
      const ts = Number.parseInt(timestamp)
      if (isNaN(ts)) {
        setError("请输入有效的时间戳")
        return
      }

      // 自动判断是秒还是毫秒
      const date = ts.toString().length === 10 ? new Date(ts * 1000) : new Date(ts)
      setDateTime(
        date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
      setError("")
    } catch (err) {
      setError("无效的时间戳")
    }
  }

  const dateToTimestamp = () => {
    try {
      const date = new Date(dateTime)
      if (isNaN(date.getTime())) {
        setError("请输入有效的日期格式")
        return
      }
      setTimestamp(Math.floor(date.getTime() / 1000).toString())
      setError("")
    } catch (err) {
      setError("无效的日期格式")
    }
  }

  const getCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000)
    setTimestamp(now.toString())
    setDateTime(
      new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    )
    setError("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          时间戳转换工具
        </CardTitle>
        <CardDescription>时间戳与日期时间相互转换，自动识别秒/毫秒</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">当前时间</div>
          <div className="font-mono text-lg">{currentTime.toLocaleString("zh-CN")}</div>
          <div className="font-mono text-sm text-gray-600">时间戳(秒): {Math.floor(currentTime.getTime() / 1000)}</div>
          <div className="font-mono text-sm text-gray-600">时间戳(毫秒): {currentTime.getTime()}</div>
        </div>

        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}

        <div>
          <label className="text-sm font-medium">时间戳:</label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="1640995200 或 1640995200000"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
            <Button onClick={timestampToDate}>转换为日期</Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">日期时间:</label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="2022-01-01 00:00:00 或 2022/01/01"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
            <Button onClick={dateToTimestamp}>转换为时间戳</Button>
          </div>
        </div>

        <Button variant="outline" onClick={getCurrentTimestamp}>
          获取当前时间戳
        </Button>
      </CardContent>
    </Card>
  )
}

// Text Tools Component
function TextTools() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const compressLines = () => {
    const compressed = input.replace(/\n+/g, " ").replace(/\s+/g, " ").trim()
    setOutput(compressed)
  }

  const splitLines = () => {
    const lines = input
      .split(/[.!?。！？]/)
      .filter((line) => line.trim())
      .map((line) => line.trim())
      .join("\n")
    setOutput(lines)
  }

  const removeEmptyLines = () => {
    const cleaned = input
      .split("\n")
      .filter((line) => line.trim())
      .join("\n")
    setOutput(cleaned)
  }

  const addLineNumbers = () => {
    const lines = input.split("\n")
    const numbered = lines.map((line, index) => `${(index + 1).toString().padStart(3, "0")}. ${line}`).join("\n")
    setOutput(numbered)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          文本工具
        </CardTitle>
        <CardDescription>文本格式处理和转换工具</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">输入文本:</label>
          <Textarea
            placeholder="输入要处理的文本..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-2 h-40"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={compressLines}>多行压缩为一行</Button>
          <Button variant="outline" onClick={splitLines}>
            按句分行
          </Button>
          <Button variant="outline" onClick={removeEmptyLines}>
            删除空行
          </Button>
          <Button variant="outline" onClick={addLineNumbers}>
            添加行号
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setInput("")
              setOutput("")
            }}
          >
            清空
          </Button>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">处理结果:</label>
              <CopyButton text={output} />
            </div>
            <Textarea value={output} readOnly className="h-40" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Text Diff Component with side-by-side view
function TextDiff() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")
  const [diffResult, setDiffResult] = useState<
    Array<{ line: string; type: "equal" | "delete" | "insert"; lineNum1?: number; lineNum2?: number }>
  >([])
  const leftScrollRef = useRef<HTMLDivElement>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)

  const syncScroll = (source: "left" | "right") => {
    if (source === "left" && leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop
    } else if (source === "right" && leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop
    }
  }

  const compareTexts = () => {
    const lines1 = text1.split("\n")
    const lines2 = text2.split("\n")
    const result: Array<{ line: string; type: "equal" | "delete" | "insert"; lineNum1?: number; lineNum2?: number }> =
      []

    let i = 0,
      j = 0
    let lineNum1 = 1,
      lineNum2 = 1

    while (i < lines1.length || j < lines2.length) {
      if (i >= lines1.length) {
        // 只剩下 text2 的行
        result.push({ line: lines2[j], type: "insert", lineNum2: lineNum2 })
        j++
        lineNum2++
      } else if (j >= lines2.length) {
        // 只剩下 text1 的行
        result.push({ line: lines1[i], type: "delete", lineNum1: lineNum1 })
        i++
        lineNum1++
      } else if (lines1[i] === lines2[j]) {
        // 相同的行
        result.push({ line: lines1[i], type: "equal", lineNum1: lineNum1, lineNum2: lineNum2 })
        i++
        j++
        lineNum1++
        lineNum2++
      } else {
        // 不同的行，简单处理：先删除再插入
        result.push({ line: lines1[i], type: "delete", lineNum1: lineNum1 })
        result.push({ line: lines2[j], type: "insert", lineNum2: lineNum2 })
        i++
        j++
        lineNum1++
        lineNum2++
      }
    }

    setDiffResult(result)
  }

  const getLineStyle = (type: string) => {
    switch (type) {
      case "delete":
        return "bg-red-50 border-l-4 border-red-400 text-red-800"
      case "insert":
        return "bg-green-50 border-l-4 border-green-400 text-green-800"
      default:
        return "bg-white"
    }
  }

  const getLinePrefix = (type: string) => {
    switch (type) {
      case "delete":
        return "- "
      case "insert":
        return "+ "
      default:
        return "  "
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          文本对比工具
        </CardTitle>
        <CardDescription>左右双栏对比，支持差异高亮和行号显示</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">文本 1 (原始):</label>
            <Textarea
              placeholder="输入第一段文本"
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="mt-2 h-40 font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium">文本 2 (对比):</label>
            <Textarea
              placeholder="输入第二段文本"
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="mt-2 h-40 font-mono"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={compareTexts}>开始对比</Button>
          <Button
            variant="outline"
            onClick={() => {
              setText1("")
              setText2("")
              setDiffResult([])
            }}
          >
            清空
          </Button>
        </div>

        {diffResult.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">对比结果:</label>
            <div className="grid md:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
              {/* Left Panel */}
              <div className="border-r">
                <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-red-700">原始文本 (删除的内容)</div>
                <div
                  ref={leftScrollRef}
                  className="h-80 overflow-y-auto font-mono text-sm"
                  onScroll={() => syncScroll("left")}
                >
                  {diffResult.map(
                    (item, index) =>
                      (item.type === "equal" || item.type === "delete") && (
                        <div key={`left-${index}`} className={`px-3 py-1 ${getLineStyle(item.type)} flex`}>
                          <span className="text-gray-400 w-8 text-right mr-2 select-none">{item.lineNum1 || ""}</span>
                          <span className="text-gray-500 mr-1">{getLinePrefix(item.type)}</span>
                          <span className="flex-1">{item.line || " "}</span>
                        </div>
                      ),
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div>
                <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-green-700">对比文本 (新增的内容)</div>
                <div
                  ref={rightScrollRef}
                  className="h-80 overflow-y-auto font-mono text-sm"
                  onScroll={() => syncScroll("right")}
                >
                  {diffResult.map(
                    (item, index) =>
                      (item.type === "equal" || item.type === "insert") && (
                        <div key={`right-${index}`} className={`px-3 py-1 ${getLineStyle(item.type)} flex`}>
                          <span className="text-gray-400 w-8 text-right mr-2 select-none">{item.lineNum2 || ""}</span>
                          <span className="text-gray-500 mr-1">{getLinePrefix(item.type)}</span>
                          <span className="flex-1">{item.line || " "}</span>
                        </div>
                      ),
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <div className="flex gap-4">
                <span className="text-red-600">
                  删除: {diffResult.filter((item) => item.type === "delete").length} 行
                </span>
                <span className="text-green-600">
                  新增: {diffResult.filter((item) => item.type === "insert").length} 行
                </span>
                <span className="text-gray-600">
                  相同: {diffResult.filter((item) => item.type === "equal").length} 行
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
