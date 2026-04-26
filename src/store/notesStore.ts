import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Folder, Note } from '../types'

const SAMPLE_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '欢迎使用智枢笔记',
    content: `<h1>欢迎使用智枢笔记 👋</h1><p>这是你的第一篇笔记。智枢笔记是一款为知识工作者设计的高端笔记应用。</p><h2>核心功能</h2><ul><li><p>📝 富文本编辑器，支持 Markdown 语法</p></li><li><p>📁 文件夹与标签自由组织</p></li><li><p>🤖 AI 写作辅助与智能搜索（即将推出）</p></li></ul><h2>快速开始</h2><p>试试在下方输入 <code>/</code> 唤出命令面板，或使用工具栏格式化文本。</p><blockquote><p>知识的价值在于流动与连接。</p></blockquote>`,
    folderId: 'folder-1',
    tags: ['入门', '指南'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    isPinned: true,
  },
  {
    id: 'note-2',
    title: 'React 性能优化笔记',
    content: `<h1>React 性能优化</h1><p>记录常用的 React 性能优化技巧。</p><h2>1. useMemo 与 useCallback</h2><p>避免不必要的重新计算和函数重建：</p><pre><code class="language-typescript">const memoizedValue = useMemo(() => {
  return expensiveComputation(a, b)
}, [a, b])

const handleClick = useCallback(() => {
  doSomething(id)
}, [id])</code></pre><h2>2. 虚拟列表</h2><p>对于长列表，使用虚拟化渲染只渲染可视区域内的元素。</p>`,
    folderId: 'folder-2',
    tags: ['React', '前端', '性能'],
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
    isPinned: false,
  },
  {
    id: 'note-3',
    title: '2026 年度目标',
    content: `<h1>2026 年度目标</h1><ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>完成个人知识库系统搭建</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>阅读 20 本技术书籍</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>完成一个开源项目</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>学习 Rust 编程语言</p></div></li></ul>`,
    folderId: 'folder-3',
    tags: ['目标', '个人'],
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 86400000,
    isPinned: false,
  },
  {
    id: 'note-4',
    title: '产品会议记录 - 2026/04/25',
    content: `<h1>产品会议记录</h1><p><strong>时间：</strong>2026年4月25日 14:00</p><p><strong>参与者：</strong>产品、设计、前端、后端</p><h2>讨论内容</h2><ol><li><p>Q2 功能排期确认</p></li><li><p>AI 写作助手原型评审</p></li><li><p>用户反馈处理</p></li></ol><h2>行动项</h2><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>设计团队输出 AI 面板交互稿（本周五）</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>前端完成编辑器斜杠命令（下周一）</p></div></li></ul>`,
    folderId: 'folder-1',
    tags: ['会议', '产品'],
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 1800000,
    isPinned: false,
  },
]

const SAMPLE_FOLDERS: Folder[] = [
  { id: 'folder-1', name: '工作', icon: '💼', color: '#4f6bbf', parentId: null, order: 0 },
  { id: 'folder-2', name: '技术笔记', icon: '💻', color: '#22C55E', parentId: null, order: 1 },
  { id: 'folder-3', name: '个人', icon: '🌱', color: '#F5A623', parentId: null, order: 2 },
]

interface NotesState {
  notes: Note[]
  folders: Folder[]
  activeNoteId: string | null
  activeFolderId: string | null
  searchQuery: string
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean

  setActiveNote: (id: string | null) => void
  setActiveFolder: (id: string | null) => void
  setSearchQuery: (q: string) => void
  toggleTheme: () => void
  toggleSidebar: () => void

  createNote: (folderId?: string | null) => string
  updateNote: (id: string, patch: Partial<Note>) => void
  deleteNote: (id: string) => void
  pinNote: (id: string) => void

  createFolder: (name: string, parentId?: string | null) => void
  deleteFolder: (id: string) => void
  renameFolder: (id: string, name: string) => void
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: SAMPLE_NOTES,
      folders: SAMPLE_FOLDERS,
      activeNoteId: 'note-1',
      activeFolderId: null,
      searchQuery: '',
      theme: 'light',
      sidebarCollapsed: false,

      setActiveNote: (id) => set({ activeNoteId: id }),
      setActiveFolder: (id) => set({ activeFolderId: id, activeNoteId: null }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      createNote: (folderId = null) => {
        const id = `note-${Date.now()}`
        const note: Note = {
          id,
          title: '无标题笔记',
          content: '<p></p>',
          folderId: folderId ?? get().activeFolderId,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
        }
        set((s) => ({ notes: [note, ...s.notes], activeNoteId: id }))
        return id
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
          ),
        })),

      deleteNote: (id) =>
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          activeNoteId: s.activeNoteId === id ? null : s.activeNoteId,
        })),

      pinNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
        })),

      createFolder: (name, parentId = null) => {
        const folder: Folder = {
          id: `folder-${Date.now()}`,
          name,
          icon: '📁',
          color: '#4f6bbf',
          parentId,
          order: get().folders.length,
        }
        set((s) => ({ folders: [...s.folders, folder] }))
      },

      deleteFolder: (id) =>
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
          notes: s.notes.map((n) => (n.folderId === id ? { ...n, folderId: null } : n)),
        })),

      renameFolder: (id, name) =>
        set((s) => ({
          folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
        })),
    }),
    { name: 'zhishu-notes-storage' },
  ),
)
