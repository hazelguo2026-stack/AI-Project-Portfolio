import { FileText } from 'lucide-react'
import { useNotesStore } from '../store/notesStore'

export default function EmptyState() {
  const { createNote, activeFolderId } = useNotesStore()
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
        <FileText size={28} className="text-brand-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">选择或新建笔记</h3>
      <p className="text-sm text-gray-400 dark:text-gray-600 mb-4 max-w-xs">
        从左侧选择一篇笔记开始编辑，或者创建一篇新笔记
      </p>
      <button
        onClick={() => createNote(activeFolderId)}
        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
      >
        新建笔记
      </button>
      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
        {[
          { icon: '⌘K', label: '全局搜索' },
          { icon: '⌘N', label: '新建笔记' },
          { icon: '⌘B', label: '加粗文字' },
          { icon: '/', label: '命令面板' },
        ].map((shortcut) => (
          <div key={shortcut.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{shortcut.icon}</kbd>
            <span>{shortcut.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
