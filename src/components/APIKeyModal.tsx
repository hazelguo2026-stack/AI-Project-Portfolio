import { useState } from 'react'
import { Key, X, ExternalLink, Eye, EyeOff, Check } from 'lucide-react'
import { useAIStore, PROVIDERS } from '../store/aiStore'
import type { ProviderKey } from '../services/providers'

const PROVIDER_ICONS: Record<ProviderKey, string> = {
  anthropic: '🟠',
  deepseek:  '🔵',
  openai:    '🟢',
  custom:    '⚙️',
}

export default function APIKeyModal() {
  const {
    provider, apiKeys, models, customBaseURL,
    setProvider, setApiKey, setModel, setCustomBaseURL,
    setShowKeyModal,
  } = useAIStore()

  const [tab, setTab] = useState<ProviderKey>(provider)
  const [keyDraft, setKeyDraft] = useState<Record<ProviderKey, string>>({ ...apiKeys })
  const [urlDraft, setUrlDraft] = useState(customBaseURL)
  const [modelDraft, setModelDraft] = useState<Record<ProviderKey, string>>({ ...models })
  const [showKey, setShowKey] = useState(false)

  const cfg = PROVIDERS[tab]
  const saved = !!apiKeys[tab]

  const handleSave = () => {
    ;(Object.keys(keyDraft) as ProviderKey[]).forEach((p) => setApiKey(p, keyDraft[p]))
    ;(Object.keys(modelDraft) as ProviderKey[]).forEach((p) => setModel(p, modelDraft[p]))
    setCustomBaseURL(urlDraft)
    setProvider(tab)
    setShowKeyModal(false)
    // 保存后自动打开聊天面板
    if (keyDraft[tab]?.trim() && !useAIStore.getState().panelOpen) {
      useAIStore.getState().togglePanel()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Key size={14} className="text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">AI 模型配置</span>
          </div>
          <button onClick={() => setShowKeyModal(false)} className="icon-btn"><X size={15} /></button>
        </div>

        {/* Provider tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-0">
          {(Object.keys(PROVIDERS) as ProviderKey[]).map((p) => (
            <button
              key={p}
              onClick={() => setTab(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === p
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{PROVIDER_ICONS[p]}</span>
              {PROVIDERS[p].name}
              {apiKeys[p] && <Check size={10} className={tab === p ? 'text-white' : 'text-green-500'} />}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Custom base URL (only for custom) */}
          {tab === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                API Base URL <span className="text-red-400">*</span>
              </label>
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 dark:text-white font-mono placeholder-gray-400"
              />
              <p className="text-[11px] text-gray-400 mt-1">任何兼容 OpenAI Chat Completions 协议的端点均可使用</p>
            </div>
          )}

          {/* Model selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">模型</label>
            {tab === 'custom' ? (
              <input
                value={modelDraft[tab]}
                onChange={(e) => setModelDraft((d) => ({ ...d, [tab]: e.target.value }))}
                placeholder="输入模型名称，如 qwen-turbo"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 dark:text-white font-mono placeholder-gray-400"
              />
            ) : (
              <select
                value={modelDraft[tab]}
                onChange={(e) => setModelDraft((d) => ({ ...d, [tab]: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 dark:text-white"
              >
                {cfg.models.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              API Key <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyDraft[tab]}
                onChange={(e) => setKeyDraft((d) => ({ ...d, [tab]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder={cfg.keyPlaceholder}
                className="w-full px-3 py-2.5 pr-10 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 dark:text-white font-mono placeholder-gray-400"
              />
              <button
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {cfg.keyLink && (
              <a
                href={cfg.keyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline mt-1.5"
              >
                <ExternalLink size={10} />
                {cfg.keyLinkLabel}
              </a>
            )}
            {saved && keyDraft[tab] === apiKeys[tab] && (
              <p className="text-[11px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <Check size={10} /> 已配置
              </p>
            )}
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Key 仅保存在本地浏览器，不会上传到任何服务器。
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={() => setShowKeyModal(false)}
            className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!keyDraft[tab]?.trim() && !(tab === 'custom' && urlDraft.trim())}
            className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            保存并使用 {PROVIDERS[tab].name}
          </button>
        </div>
      </div>
    </div>
  )
}
