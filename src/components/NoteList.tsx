import { useMemo, useState } from 'react'
import { Search, Plus, Pin, MoreHorizontal, Trash2, Star } from 'lucide-react'
import { useNotesStore } from '../store/notesStore'
import type { Note } from '../types'

export default function NoteList() {
  const {
    notes, folders, activeFolderId, activeNoteId,
    searchQuery, setSearchQuery, setActiveNote,
    createNote, deleteNote, pinNote,
  } = useNotesStore()

  const [contextMenu, setContextMenu] = useState<{ noteId: string; x: number; y: number } | null>(null)

  const filtered = useMemo(() => {
    let list = notes

    if (activeFolderId === '__pinned__') {
      list = list.filter((n) => n.isPinned)
    } else if (activeFolderId === '__recent__') {
      const cutoff = Date.now() - 7 * 86400000
      list = list.filter((n) => n.updatedAt >= cutoff)
    } else if (activeFolderId) {
      list = list.filter((n) => n.folderId === activeFolderId)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })
  }, [notes, activeFolderId, searchQuery])

  const currentFolder = folders.find((f) => f.id === activeFolderId)
  const panelTitle =
    activeFolderId === '__pinned__'
      ? '收藏夹'
      : activeFolderId === '__recent__'
        ? '最近编辑'
        : currentFolder?.name ?? '所有笔记'

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault()
    setContextMenu({ noteId, x: e.clientX, y: e.clientY })
  }

  return (
    <div
      className="w-72 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0"
      onClick={() => setContextMenu(null)}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
            {currentFolder && <span className="mr-1">{currentFolder.icon}</span>}
            {panelTitle}
            <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500 font-normal">
              {filtered.length}
            </span>
          </h2>
          <button
            onClick={() => createNote(activeFolderId)}
            className="icon-btn text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30"
            title="新建笔记"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索笔记..."
            className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-brand-400 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600">
            <p className="text-sm">{searchQuery ? '没有匹配结果' : '暂无笔记'}</p>
            {!searchQuery && (
              <button
                onClick={() => createNote(activeFolderId)}
                className="mt-2 text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                创建第一篇笔记
              </button>
            )}
          </div>
        )}

        {filtered.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            active={note.id === activeNoteId}
            onClick={() => setActiveNote(note.id)}
            onContextMenu={(e) => handleContextMenu(e, note.id)}
          />
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-36"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <ContextMenuItem
            icon={<Star size={13} />}
            label={notes.find((n) => n.id === contextMenu.noteId)?.isPinned ? '取消收藏' : '加入收藏'}
            onClick={() => { pinNote(contextMenu.noteId); setContextMenu(null) }}
          />
          <ContextMenuItem
            icon={<Trash2 size={13} />}
            label="删除笔记"
            danger
            onClick={() => {
              if (confirm('确认删除此笔记？')) deleteNote(contextMenu.noteId)
              setContextMenu(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

function NoteCard({
  note, active, onClick, onContextMenu,
}: {
  note: Note
  active: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
}) {
  const preview = note.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
  const date = new Date(note.updatedAt)
  const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`group px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5 ${
        active
          ? 'bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {note.isPinned && <Pin size={11} className="text-accent shrink-0" />}
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {note.title || '无标题笔记'}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">{dateStr}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
        {preview || '空笔记'}
      </p>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ContextMenuItem({
  icon, label, danger, onClick,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
