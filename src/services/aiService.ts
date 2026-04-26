import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { ProviderKey } from './providers'
import { PROVIDERS } from './providers'

export type AIAction = 'polish' | 'rewrite' | 'expand' | 'summarize' | 'continue' | 'translate' | 'chat'

const PROMPTS: Record<AIAction, (text: string, context?: string) => string> = {
  polish:    (t) => `请对以下文字进行润色，保留原意，让表达更流畅自然，直接输出润色后的结果，不要添加任何解释：\n\n${t}`,
  rewrite:   (t) => `请用不同的表达方式改写以下内容，保留核心语义，直接输出改写后的结果，不要添加任何解释：\n\n${t}`,
  expand:    (t) => `请将以下内容扩写得更详细丰富，补充细节和论据，直接输出扩写后的结果，不要添加任何解释：\n\n${t}`,
  summarize: (t) => `请将以下内容提炼为简洁的摘要，抓住核心观点，直接输出摘要，不要添加任何解释：\n\n${t}`,
  continue:  (t) => `请根据以下内容的风格和主题续写一段自然衔接的内容，直接输出续写部分，不要重复原文也不要添加解释：\n\n${t}`,
  translate: (t) => `请将以下内容翻译为${/[一-龥]/.test(t) ? '英文' : '中文'}，直接输出译文，不要添加任何解释：\n\n${t}`,
  chat:      (t, ctx) =>
    ctx
      ? `你是一个智能笔记助手。以下是用户当前的笔记内容（仅供参考）：\n\n---\n${ctx}\n---\n\n请回答用户的问题：${t}`
      : t,
}

export interface StreamOptions {
  provider: ProviderKey
  apiKey: string
  model: string
  customBaseURL?: string
  action: AIAction
  text: string
  context?: string
  onChunk: (chunk: string) => void
  onDone: () => void
  onError: (err: string) => void
  signal?: AbortSignal
}

export async function streamAI(opts: StreamOptions) {
  const { provider, apiKey, model, customBaseURL, action, text, context, onChunk, onDone, onError, signal } = opts
  const prompt = PROMPTS[action](text, context)

  try {
    if (provider === 'anthropic') {
      await streamAnthropic({ apiKey, model, prompt, onChunk, onDone, signal })
    } else {
      const baseURL = provider === 'custom'
        ? (customBaseURL ?? '')
        : (PROVIDERS[provider].baseURL ?? '')
      await streamOpenAICompat({ apiKey, model, baseURL, prompt, onChunk, onDone, signal })
    }
  } catch (err: unknown) {
    if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))) return
    onError(friendlyError(err))
  }
}

function friendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  // Extract HTTP status from error message or APIError
  const status =
    (err as { status?: number }).status ??
    parseInt(raw.match(/\b(4\d{2}|5\d{2})\b/)?.[0] ?? '0')

  const statusMessages: Record<number, string> = {
    400: '请求格式错误，请检查模型名称是否正确',
    401: 'API Key 无效或已过期，请在设置中重新配置',
    402: '账户余额不足，请前往对应平台充值后重试',
    403: '账户无权访问该模型，请检查订阅状态',
    429: '请求过于频繁，请稍后再试',
    500: '模型服务暂时异常，请稍后重试',
    502: '模型服务网关错误，请稍后重试',
    503: '模型服务暂时不可用，请稍后重试',
  }

  return statusMessages[status] ?? `请求失败：${raw}`
}

async function streamAnthropic({ apiKey, model, prompt, onChunk, onDone, signal }: {
  apiKey: string; model: string; prompt: string
  onChunk: (c: string) => void; onDone: () => void; signal?: AbortSignal
}) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const stream = await client.messages.stream(
    { model, max_tokens: 2048, messages: [{ role: 'user', content: prompt }] },
    { signal },
  )
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onChunk(event.delta.text)
    }
  }
  onDone()
}

async function streamOpenAICompat({ apiKey, model, baseURL, prompt, onChunk, onDone, signal }: {
  apiKey: string; model: string; baseURL: string; prompt: string
  onChunk: (c: string) => void; onDone: () => void; signal?: AbortSignal
}) {
  const client = new OpenAI({ apiKey, baseURL, dangerouslyAllowBrowser: true })
  const stream = await client.chat.completions.create(
    { model, max_tokens: 2048, stream: true, messages: [{ role: 'user', content: prompt }] },
    { signal },
  )
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) onChunk(delta)
  }
  onDone()
}
