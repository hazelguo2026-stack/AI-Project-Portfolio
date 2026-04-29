import { useState } from 'react'
import { Plus, Trash2, Sparkles, Clock } from 'lucide-react'
import OpenAI from 'openai'
import { useAIStore } from '../store/aiStore'
import { PROVIDERS } from '../services/providers'

interface ScheduleItem {
  time: string
  task: string
  duration: string
  tip: string
}

const COLORS = [
  '#7c3aed', '#6d28d9', '#4f46e5', '#0369a1',
  '#0891b2', '#059669', '#b45309', '#be185d',
]

export default function PlannerView() {
  const { provider, apiKeys, models, customBaseURL } = useAIStore()
  const [todos, setTodos] = useState<string[]>([''])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('22:00')
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addTodo() { setTodos(t => [...t, '']) }
  function updateTodo(i: number, val: string) { setTodos(t => t.map((v, idx) => idx === i ? val : v)) }
  function removeTodo(i: number) { setTodos(t => t.filter((_, idx) => idx !== i)) }

  async function generate() {
    const tasks = todos.filter(t => t.trim())
    if (!tasks.length) return
    const apiKey = apiKeys[provider]
    if (!apiKey) { setError('请先在 AI 设置中配置 API Key'); return }

    setLoading(true)
    setError('')
    setSchedule([])

    try {
      const cfg = PROVIDERS[provider]
      const baseURL = provider === 'custom' ? customBaseURL : (cfg.baseURL ?? undefined)
      const client = new OpenAI({ apiKey, baseURL, dangerouslyAllowBrowser: true })

      const prompt = `我今天的可用时间是 ${startTime} 到 ${endTime}，需要完成以下任务：\n${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n请帮我制定一份科学合理的时间表。要求：\n1. 合理分配时间，考虑专注力曲线，重要/难的任务安排在精力充沛时段\n2. 适当安排休息\n3. 只返回JSON数组，不要有任何其他文字：\n[{"time":"09:00","task":"任务名称","duration":"60分钟","tip":"简短建议"}]`

      const res = await client.chat.completions.create({
        model: models[provider],
        max_tokens: 1000,
        messages: [
          { role: 'system', content: '你是一个时间管理专家。只返回JSON数组，不要返回任何其他内容。' },
          { role: 'user', content: prompt },
        ],
      })

      const raw = res.choices[0]?.message?.content ?? ''
      const match = raw.match(/\[[\s\S]*\]/)
      if (!match) throw new Error('解析失败')
      setSchedule(JSON.parse(match[0]))
    } catch {
      setError('生成失败，请检查 API Key 或重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">今日规划</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">输入任务，让 AI 帮你制定科学的时间表</p>
        </div>

        {/* Time range */}
        <div className="mb-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">可用时间段</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <Clock size={14} className="text-brand-500 shrink-0" />
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none w-full" />
            </div>
            <span className="text-gray-400">—</span>
            <div className="flex items-center gap-2 flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <Clock size={14} className="text-brand-500 shrink-0" />
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none w-full" />
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="mb-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">今天要做的事</p>
          <div className="flex flex-col gap-2">
            {todos.map((todo, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-500 w-5 text-center shrink-0">{i + 1}</span>
                <input
                  value={todo}
                  onChange={e => updateTodo(i, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                  placeholder={`任务 ${i + 1}…`}
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
                {todos.length > 1 && (
                  <button onClick={() => removeTodo(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addTodo} className="mt-3 flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-sm font-medium hover:text-brand-700 transition-colors">
            <Plus size={14} /> 添加任务
          </button>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading || todos.every(t => !t.trim())}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors mb-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              AI 正在规划中…
            </>
          ) : (
            <><Sparkles size={15} /> 生成今日时间表</>
          )}
        </button>
        {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

        {/* Schedule */}
        {schedule.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">你的时间表</p>
            <div className="relative">
              <div className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-brand-400 to-brand-200 dark:from-brand-600 dark:to-brand-900" />
              <div className="flex flex-col gap-3">
                {schedule.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-11 flex flex-col items-center gap-1 pt-1">
                      <div className="w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 shadow z-10"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{item.time}</span>
                    </div>
                    <div className="flex-1 rounded-xl p-4 border mb-1"
                      style={{
                        backgroundColor: COLORS[i % COLORS.length] + '10',
                        borderColor: COLORS[i % COLORS.length] + '30',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.task}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}>
                          {item.duration}
                        </span>
                      </div>
                      {item.tip && <p className="text-xs text-gray-500 dark:text-gray-400">{item.tip}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
