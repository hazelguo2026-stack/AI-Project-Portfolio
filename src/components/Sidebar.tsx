import { useState } from 'react'
import {
  FileText, FolderPlus, Search, Sun, Moon, ChevronRight,
  ChevronDown, Hash, Star, Clock, Trash2, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { useNotesStore } from '../store/notesStore'

export default function Sidebar() {
  const {
    folders, notes, activeFolderId, theme,
    setActiveFolder, toggleTheme, createFolder,
    deleteFolder, renameFolder, toggleSidebar, sidebarCollapsed,
    createNote,
  } = useNotesStore()

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['folder-1', 'folder-2', 'folder-3']))
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const rootFolders = folders.filter((f) => f.parentId === null).sort((a, b) => a.order - b.order)

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleRenameSubmit = (id: string) => {
    if (editingName.trim()) renameFolder(id, editingName.trim())
    setEditingFolderId(null)
  }

  const handleNewFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim())
      setNewFolderName('')
    }
    setShowNewFolder(false)
  }

  const noteCount = (folderId: string) => notes.filter((n) => n.folderId === folderId).length

  if (sidebarCollapsed) {
    return (
      <aside className="w-13 flex flex-col items-center py-3 gap-3 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <button onClick={toggleSidebar} className="icon-btn" title="展开侧边栏">
          <PanelLeft size={18} />
        </button>
        <button onClick={() => { toggleSidebar(); setActiveFolder(null) }} className="icon-btn" title="所有笔记">
          <FileText size={18} />
        </button>
        <button onClick={toggleTheme} className="icon-btn mt-auto" title="切换主题">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-60 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <span className="font-semibold text-brand-600 dark:text-brand-400 text-sm tracking-wide">智枢笔记</span>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="icon-btn" title="切换主题">
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button onClick={toggleSidebar} className="icon-btn" title="收起侧边栏">
            <PanelLeftClose size={15} />
          </button>
        </div>
      </div>

      {/* New note button */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={() => createNote()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          <FileText size={14} />
          新建笔记
        </button>
      </div>

      {/* Nav items */}
      <nav className="px-2 space-y-0.5">
        <NavItem
          icon={<FileText size={15} />}
          label="所有笔记"
          count={notes.length}
          active={activeFolderId === null}
          onClick={() => setActiveFolder(null)}
        />
        <NavItem
          icon={<Clock size={15} />}
          label="最近编辑"
          active={activeFolderId === '__recent__'}
          onClick={() => setActiveFolder('__recent__')}
        />
        <NavItem
          icon={<Star size={15} />}
          label="收藏夹"
          count={notes.filter((n) => n.isPinned).length}
          active={activeFolderId === '__pinned__'}
          onClick={() => setActiveFolder('__pinned__')}
        />
        <NavItem
          icon={<Trash2 size={15} />}
          label="废纸篓"
          active={false}
          onClick={() => {}}
        />
      </nav>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-gray-200 dark:border-gray-700" />

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">文件夹</span>
          <button
            onClick={() => setShowNewFolder(true)}
            className="icon-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="新建文件夹"
          >
            <FolderPlus size={13} />
          </button>
        </div>

        {showNewFolder && (
          <div className="flex items-center gap-1 px-2 py-1 mb-1">
            <span className="text-base">📁</span>
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNewFolder()
                if (e.key === 'Escape') setShowNewFolder(false)
              }}
              onBlur={handleNewFolder}
              placeholder="文件夹名称"
              className="flex-1 text-sm bg-transparent border-b border-brand-500 outline-none py-0.5 dark:text-white"
            />
          </div>
        )}

        {rootFolders.map((folder) => (
          <div key={folder.id}>
            <div
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                activeFolderId === folder.id
                  ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveFolder(folder.id)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id) }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
              >
                {expandedFolders.has(folder.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <span className="text-base leading-none shrink-0">{folder.icon}</span>
              {editingFolderId === folder.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(folder.id)
                    if (e.key === 'Escape') setEditingFolderId(null)
                  }}
                  onBlur={() => handleRenameSubmit(folder.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent border-b border-brand-500 outline-none text-sm dark:text-white min-w-0"
                />
              ) : (
                <span className="flex-1 truncate">{folder.name}</span>
              )}
              <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{noteCount(folder.id)}</span>
              <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); setEditingName(folder.name) }}
                  className="icon-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 p-0.5"
                  title="重命名"
                >
                  <Search size={11} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm(`删除文件夹「${folder.name}」？`)) deleteFolder(folder.id) }}
                  className="icon-btn text-gray-400 hover:text-red-500 p-0.5"
                  title="删除"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tags section */}
      <div className="px-2 pb-3 border-t border-gray-200 dark:border-gray-800 pt-2">
        <div className="px-2 mb-1">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">标签</span>
        </div>
        <div className="flex flex-wrap gap-1 px-2">
          {Array.from(new Set(notes.flatMap((n) => n.tags))).slice(0, 8).map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
            >
              <Hash size={9} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}

function NavItem({
  icon, label, count, active, onClick,
}: { icon: React.ReactNode; label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-medium'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span className="text-[11px] text-gray-400 dark:text-gray-500">{count}</span>
      )}
    </button>
  )
}
