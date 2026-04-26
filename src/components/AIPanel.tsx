import { useRef, useState, useEffect } from 'react'
import { Send, Trash2, X, Bot, Key, Sparkles } from 'lucide-react'
import { useAIStore, PROVIDERS } from '../store/aiStore'
import { streamAI } from '../services/aiService'
import { useNotesStore } from '../store/notesStore'

export default function AIPanel() {
  const {
    provider, currentApiKey, currentModel, customBaseURL,
    panelOpen, togglePanel,
    chatHistory, addMessage, updateLastAssistant, finalizeLastAssistant, clearHistory,
    setShowKeyModal,
  } = useAIStore()
  const { notes, activeNoteId } = useNotesStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const apiKey = currentApiKey()
  const model = currentModel()
  const cfg = PROVIDERS[provider]

  const activeNote = notes.find((n) => n.id === activeNoteId)
  const noteContext = activeNote
    ? `${activeNote.title}\n\n${activeNote.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`
    : undefined

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  if (!panelOpen) return null

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    if (!apiKey) { setShowKeyModal(true); return }

    setInput('')
    setLoading(true)
    addMessage({ id: Date.now().toString(), role: 'user', content: text })
    addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: '', loading: true })

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    await streamAI({
      provider,
      apiKey,
      model,
      customBaseURL,
      action: 'chat',
      text,
      context: noteContext,
      signal: ctrl.signal,
      onChunk: (chunk) => updateLastAssistant(chunk),
      onDone: () => { finalizeLastAssistant(); setLoading(false) },
      onError: (err) => {
        updateLastAssistant(`\n\n⚠️ ${err}`)
        finalizeLastAssistant()
        setLoading(false)
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <aside className="w-80 flex flex-col border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-amber-500" />
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">AI 助手</span>
          {/* Provider badge */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors truncate max-w-28 shrink-0"
            title="切换模型"
          >
            {cfg.name} · {model}
          </button>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {chatHistory.length > 0 && (
            <button onClick={clearHistory} className="icon-btn" title="清空对话"><Trash2 size={14} /></button>
          )}
          <button onClick={() => setShowKeyModal(true)} className="icon-btn" title="模型设置"><Key size={14} /></button>
          <button onClick={togglePanel} className="icon-btn" title="关闭"><X size={14} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
              <Bot size={22} className="text-amber-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI 笔记助手</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-44">
              {activeNote ? `基于「${activeNote.title}」内容回答问题` : '向我提问，我来帮你整理思路'}
            </p>
            {!apiKey && (
              <button onClick={() => setShowKeyModal(true)} className="mt-3 text-xs text-amber-600 dark:text-amber-400 underline">
                先配置 API Key →
              </button>
            )}
            <div className="mt-4 space-y-1.5 w-full">
              {['总结这篇笔记的核心观点', '帮我列出3个改进建议', '把重点内容整理成大纲'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
              }`}
            >
              {msg.content || (
                <span className="flex gap-1 py-0.5">
                  <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-amber-400/50 focus-within:border-amber-400 px-3 py-2 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入问题… (Enter 发送)"
            rows={1}
            className="flex-1 text-sm bg-transparent outline-none resize-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500 max-h-28"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="shrink-0 w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <Send size={13} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 text-center">
          {cfg.name} · {model}
        </p>
      </div>
    </aside>
  )
}
