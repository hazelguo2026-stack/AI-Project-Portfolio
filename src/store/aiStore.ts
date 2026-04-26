import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProviderKey } from '../services/providers'
import { PROVIDERS } from '../services/providers'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

interface AIState {
  // Settings
  provider: ProviderKey
  apiKeys: Record<ProviderKey, string>
  models: Record<ProviderKey, string>
  customBaseURL: string

  // UI
  panelOpen: boolean
  showKeyModal: boolean
  chatHistory: ChatMessage[]

  // Computed helpers
  currentApiKey: () => string
  currentModel: () => string

  // Actions
  setProvider: (p: ProviderKey) => void
  setApiKey: (provider: ProviderKey, key: string) => void
  setModel: (provider: ProviderKey, model: string) => void
  setCustomBaseURL: (url: string) => void
  togglePanel: () => void
  setShowKeyModal: (v: boolean) => void

  // Chat
  addMessage: (msg: ChatMessage) => void
  updateLastAssistant: (chunk: string) => void
  finalizeLastAssistant: () => void
  clearHistory: () => void
}

const defaultModels = (): Record<ProviderKey, string> => ({
  anthropic: 'claude-haiku-4-5-20251001',
  deepseek:  'deepseek-chat',
  openai:    'gpt-4o-mini',
  custom:    'custom-model',
})

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      provider: 'deepseek',
      apiKeys: { anthropic: '', deepseek: '', openai: '', custom: '' },
      models: defaultModels(),
      customBaseURL: '',
      panelOpen: false,
      showKeyModal: false,
      chatHistory: [],

      currentApiKey: () => get().apiKeys[get().provider],
      currentModel:  () => get().models[get().provider],

      setProvider: (p) => set({ provider: p }),
      setApiKey: (provider, key) =>
        set((s) => ({ apiKeys: { ...s.apiKeys, [provider]: key } })),
      setModel: (provider, model) =>
        set((s) => ({ models: { ...s.models, [provider]: model } })),
      setCustomBaseURL: (url) => set({ customBaseURL: url }),

      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
      setShowKeyModal: (v) => set({ showKeyModal: v }),

      addMessage: (msg) =>
        set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      updateLastAssistant: (chunk) =>
        set((s) => {
          const history = [...s.chatHistory]
          const last = history[history.length - 1]
          if (last?.role === 'assistant')
            history[history.length - 1] = { ...last, content: last.content + chunk, loading: true }
          return { chatHistory: history }
        }),
      finalizeLastAssistant: () =>
        set((s) => {
          const history = [...s.chatHistory]
          const last = history[history.length - 1]
          if (last?.role === 'assistant')
            history[history.length - 1] = { ...last, loading: false }
          return { chatHistory: history }
        }),
      clearHistory: () => set({ chatHistory: [] }),
    }),
    {
      name: 'zhishu-ai-storage',
      partialize: (s) => ({
        provider: s.provider,
        apiKeys: s.apiKeys,
        models: s.models,
        customBaseURL: s.customBaseURL,
      }),
    },
  ),
)

// Expose provider list for UI
export { PROVIDERS }
