import { useEffect, useCallback, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Code2, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Quote,
  Table as TableIcon, Highlighter, Minus,
  Undo, Redo, Link as LinkIcon,
  Maximize2, Minimize2, Sparkles,
} from 'lucide-react'
import { useNotesStore } from '../store/notesStore'
import { useAIStore } from '../store/aiStore'
import { SlashCommandExtension } from '../extensions/SlashCommand'
import AIFloatingBar from './AIFloatingBar'

const lowlight = createLowlight(common)

interface EditorProps {
  noteId: string
}

export default function Editor({ noteId }: EditorProps) {
  const { notes, updateNote } = useNotesStore()
  const { panelOpen, togglePanel, currentApiKey, setShowKeyModal } = useAIStore()
  const apiKey = currentApiKey()
  const note = notes.find((n) => n.id === noteId)
  const [zenMode, setZenMode] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: true, HTMLAttributes: { class: 'cursor-pointer' } }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: '开始写作…或输入 / 唤出命令面板' }),
      CodeBlockLowlight.configure({ lowlight }),
      SlashCommandExtension,
    ],
    content: note?.content ?? '',
    editorProps: {
      attributes: { class: 'tiptap-editor focus:outline-none' },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        updateNote(noteId, { content: html })
      }, 800)
    },
  })

  useEffect(() => {
    if (!editor || !note) return
    const current = editor.getHTML()
    if (current !== note.content) {
      editor.commands.setContent(note.content, false)
    }
  }, [noteId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNote(noteId, { title: e.target.value })
    },
    [noteId, updateNote],
  )

  if (!note) return null

  return (
    <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950 ${zenMode ? 'fixed inset-0 z-40' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex-wrap">
        <ToolGroup>
          <ToolBtn title="撤销" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}>
            <Undo size={14} />
          </ToolBtn>
          <ToolBtn title="重做" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}>
            <Redo size={14} />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolBtn title="标题1" active={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 size={14} />
          </ToolBtn>
          <ToolBtn title="标题2" active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={14} />
          </ToolBtn>
          <ToolBtn title="标题3" active={editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={14} />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolBtn title="加粗" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold size={14} />
          </ToolBtn>
          <ToolBtn title="斜体" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic size={14} />
          </ToolBtn>
          <ToolBtn title="下划线" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={14} />
          </ToolBtn>
          <ToolBtn title="删除线" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}>
            <Strikethrough size={14} />
          </ToolBtn>
          <ToolBtn title="行内代码" active={editor?.isActive('code')} onClick={() => editor?.chain().focus().toggleCode().run()}>
            <Code size={14} />
          </ToolBtn>
          <ToolBtn title="高亮" active={editor?.isActive('highlight')} onClick={() => editor?.chain().focus().toggleHighlight().run()}>
            <Highlighter size={14} />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolBtn title="无序列表" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List size={14} />
          </ToolBtn>
          <ToolBtn title="有序列表" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={14} />
          </ToolBtn>
          <ToolBtn title="任务清单" active={editor?.isActive('taskList')} onClick={() => editor?.chain().focus().toggleTaskList().run()}>
            <CheckSquare size={14} />
          </ToolBtn>
          <ToolBtn title="引用" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
            <Quote size={14} />
          </ToolBtn>
          <ToolBtn title="代码块" active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
            <Code2 size={14} />
          </ToolBtn>
          <ToolBtn title="插入表格" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableIcon size={14} />
          </ToolBtn>
          <ToolBtn title="分割线" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
            <Minus size={14} />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        <ToolBtn
          title="添加链接"
          active={editor?.isActive('link')}
          onClick={() => {
            const url = prompt('输入链接地址：')
            if (url) editor?.chain().focus().setLink({ href: url }).run()
          }}
        >
          <LinkIcon size={14} />
        </ToolBtn>

        <div className="ml-auto flex items-center gap-1">
          {/* AI Panel toggle */}
          <button
            title={panelOpen ? '关闭 AI 助手' : '打开 AI 助手'}
            onClick={() => apiKey ? togglePanel() : setShowKeyModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              panelOpen
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <Sparkles size={13} />
            AI 助手
          </button>
          <ToolBtn title={zenMode ? '退出专注模式' : '专注模式'} onClick={() => setZenMode((z) => !z)}>
            {zenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </ToolBtn>
        </div>
      </div>

      {/* Editor area — position:relative for floating bar */}
      <div className="flex-1 overflow-y-auto relative editor-scroll">
        {editor && <AIFloatingBar editor={editor} />}
        <div className={`mx-auto px-8 py-8 ${zenMode ? 'max-w-2xl' : 'max-w-3xl'}`}>
          <input
            value={note.title}
            onChange={handleTitleChange}
            placeholder="无标题笔记"
            className="w-full text-3xl font-bold bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 mb-6 border-none"
          />
          <div className="flex items-center gap-3 mb-6 text-xs text-gray-400 dark:text-gray-600">
            <span>{editor?.storage?.characterCount?.words?.() ?? 0} 字</span>
            <span>•</span>
            <span>
              {new Date(note.updatedAt).toLocaleString('zh-CN', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })} 已保存
            </span>
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

function ToolBtn({ children, title, active, disabled, onClick }: {
  children: React.ReactNode; title?: string; active?: boolean; disabled?: boolean; onClick?: () => void
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors text-sm ${
        active
          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
          : disabled
            ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function Divider() {
  return <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
}
