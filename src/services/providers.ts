export type ProviderKey = 'anthropic' | 'deepseek' | 'openai' | 'custom'

export interface ProviderConfig {
  name: string
  baseURL: string | null   // null = use SDK default
  models: { id: string; label: string }[]
  keyPlaceholder: string
  keyLink: string
  keyLinkLabel: string
}

export const PROVIDERS: Record<ProviderKey, ProviderConfig> = {
  anthropic: {
    name: 'Anthropic',
    baseURL: null,
    models: [
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (快速)' },
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (均衡)' },
      { id: 'claude-opus-4-7', label: 'Claude Opus 4.7 (强大)' },
    ],
    keyPlaceholder: 'sk-ant-api03-...',
    keyLink: 'https://console.anthropic.com/settings/keys',
    keyLinkLabel: '在 Anthropic Console 获取',
  },
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek V3 (均衡)' },
      { id: 'deepseek-reasoner', label: 'DeepSeek R1 (推理)' },
    ],
    keyPlaceholder: 'sk-...',
    keyLink: 'https://platform.deepseek.com/api_keys',
    keyLinkLabel: '在 DeepSeek Platform 获取',
  },
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (快速)' },
      { id: 'gpt-4o', label: 'GPT-4o (均衡)' },
      { id: 'o4-mini', label: 'o4-mini (推理)' },
    ],
    keyPlaceholder: 'sk-...',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkLabel: '在 OpenAI Platform 获取',
  },
  custom: {
    name: '自定义',
    baseURL: '',
    models: [
      { id: 'custom-model', label: '自定义模型' },
    ],
    keyPlaceholder: 'API Key',
    keyLink: '',
    keyLinkLabel: '',
  },
}
