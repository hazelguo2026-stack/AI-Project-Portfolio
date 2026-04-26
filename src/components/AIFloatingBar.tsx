import { useEffect, useRef, useState, useCallback } from 'react'
import { type Editor } from '@tiptap/react'
import { Sparkles, RefreshCw, AlignLeft, ZoomIn, FileText, Languages, Check, X, RotateCcw, Key } from 'lucide-react'
import { streamAI, type AIAction } from '../services/aiService'
import { useAIStore } from '../store/aiStore'
import { PROVIDERS } from '../services/providers'

interface AIFloatingBarProps {
  editor: Editor
}

interface ActionResult {
  original: string
  generated: string
  loading: boolean
  error: string
}

const ACTIONS: { action: AIAction; label: string; icon: React.ReactNode }[] = [
  { action: 'polish',    label: '润色', icon: <Sparkles size={13} /> },
  { action: 'rewrite',   label: '改写', icon: <RefreshCw size={13} /> },
  { action: 'summarize', label: '摘要', icon: <AlignLeft size={13} /> },
  { action: 'expand',    label: '扩写', icon: <ZoomIn size={13} /> },
  { action: 'continue',  label: '续写', icon: <FileText size={13} /> },
  { action: 'translate', label: '翻译', icon: <Languages size={13} /> },
]

export default function AIFloatingBar({ editor }: AIFloatingBarProps) {
  const { currentApiKey, setShowKeyModal } = useAIStore()
  const apiKey = currentApiKey()
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [result, setResult] = useState<ActionResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // Track selection and compute bar position
  useEffect(() => {
    const update = () => {
      const { from, to, empty } = editor.state.selection
      if (empty || from === to) {
        setPos(null)
        setResult(null)
        return
      }
      const coords = editor.view.coordsAtPos(from)
      const editorEl = editor.view.dom.closest('.editor-scroll') as HTMLElement
      const scrollTop = editorEl?.scrollTop ?? 0
      const rect = editorEl?.getBoundingClientRect() ?? { top: 0, left: 0 }
      setPos({
        top: coords.top - rect.top + scrollTop - 42,
        left: Math.max(0, coords.left - rect.left),
      })
    }
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

  const runAction = useCallback(
    (action: AIAction) => {
      if (!apiKey) { setShowKeyModal(true); return }
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to, ' ')
      if (!selectedText.trim()) return

      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl

      setResult({ original: selectedText, generated: '', loading: true, error: '' })

      streamAI({
        provider: useAIStore.getState().provider,
        apiKey,
        model: useAIStore.getState().currentModel(),
        customBaseURL: useAIStore.getState().customBaseURL,
        action,
        text: selectedText,
        signal: ctrl.signal,
        onChunk: (chunk) =>
          setResult((r) => r ? { ...r, generated: r.generated + chunk } : r),
        onDone: () =>
          setResult((r) => r ? { ...r, loading: false } : r),
        onError: (err) =>
          setResult((r) => r ? { ...r, loading: false, error: err } : r),
      })
    },
    [apiKey, editor, setShowKeyModal],
  )

  const handleAccept = () => {
    if (!result?.generated) return
    const { from, to } = editor.state.selection
    editor.chain().focus().deleteRange({ from, to }).insertContent(result.generated).run()
    setResult(null)
    setPos(null)
  }

  const handleDiscard = () => {
    abortRef.current?.abort()
    setResult(null)
  }

  if (!pos) return null

  return (
    <div
      ref={barRef}
      className="ai-float-wrap"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Action buttons bar */}
      <div className="ai-float-bar">
        <span className="ai-float-label">
          <Sparkles size={11} className="text-amber-500" />
          AI
        </span>
        <div className="ai-float-divider" />
        {ACTIONS.map(({ action, label, icon }) => (
          <button
            key={action}
            className="ai-float-btn"
            onClick={() => runAction(action)}
            title={label}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
        {!apiKey && (
          <button
            className="ai-float-btn text-amber-500"
            onClick={() => setShowKeyModal(true)}
            title="配置 API Key"
          >
            <Key size={13} />
            <span>配置</span>
          </button>
        )}
      </div>

      {/* Result popup */}
      {result && (
        <div className="ai-result-box">
          {result.error ? (
            <p className="text-xs text-red-500 px-3 py-2">{result.error}</p>
          ) : (
            <div className="ai-result-text">
              {result.generated || (
                <span className="ai-result-loading">
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                </span>
              )}
            </div>
          )}
          <div className="ai-result-actions">
            {!result.error && (
              <button
                className="ai-result-btn ai-result-btn--accept"
                onClick={handleAccept}
                disabled={result.loading || !result.generated}
              >
                <Check size={12} /> 替换
              </button>
            )}
            <button
              className="ai-result-btn"
              onClick={handleDiscard}
            >
              <X size={12} /> 丢弃
            </button>
            {result.error && (
              <button className="ai-result-btn" onClick={() => setResult(null)}>
                <RotateCcw size={12} /> 重试
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
