import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import SlashMenu, { type SlashMenuHandle, type SlashCommand } from '../components/SlashMenu'

const COMMANDS: SlashCommand[] = [
  {
    title: '标题 1',
    description: '大号一级标题',
    icon: 'H1',
    keywords: ['h1', 'heading', '标题'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
  },
  {
    title: '标题 2',
    description: '中号二级标题',
    icon: 'H2',
    keywords: ['h2', 'heading', '标题'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
  },
  {
    title: '标题 3',
    description: '小号三级标题',
    icon: 'H3',
    keywords: ['h3', 'heading', '标题'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    },
  },
  {
    title: '无序列表',
    description: '创建带符号的项目列表',
    icon: '•',
    keywords: ['ul', 'bullet', 'list', '列表'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: '有序列表',
    description: '创建带编号的有序列表',
    icon: '1.',
    keywords: ['ol', 'ordered', 'list', '列表', '编号'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: '任务清单',
    description: '带勾选框的待办事项',
    icon: '☑',
    keywords: ['todo', 'task', 'check', '任务', '待办'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: '引用',
    description: '插入引用块',
    icon: '"',
    keywords: ['quote', 'blockquote', '引用'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).setBlockquote().run()
    },
  },
  {
    title: '代码块',
    description: '插入多行代码块',
    icon: '<>',
    keywords: ['code', 'codeblock', '代码'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).setCodeBlock().run()
    },
  },
  {
    title: '表格',
    description: '插入 3×3 表格',
    icon: '⊞',
    keywords: ['table', '表格'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
  },
  {
    title: '图片',
    description: '通过 URL 插入图片',
    icon: '🖼',
    keywords: ['image', 'img', '图片', '图像'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).run()
      const url = window.prompt('请输入图片地址：')
      if (url) {
        // @ts-expect-error dynamic editor API
        editor.chain().focus().setImage({ src: url }).run()
      }
    },
  },
  {
    title: '分割线',
    description: '插入水平分割线',
    icon: '—',
    keywords: ['hr', 'divider', 'rule', '分割'],
    command: ({ editor, range }) => {
      // @ts-expect-error dynamic editor API
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
]

function filterCommands(query: string): SlashCommand[] {
  if (!query) return COMMANDS
  const q = query.toLowerCase()
  return COMMANDS.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q)),
  )
}

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }) => {
          ;(props as SlashCommand).command({ editor, range })
        },
        items: ({ query }: { query: string }) => filterCommands(query),
        render: () => {
          let renderer: ReactRenderer<SlashMenuHandle>
          let popup: TippyInstance[]

          return {
            onStart(props: Parameters<typeof SlashMenu>[0] & { clientRect?: () => DOMRect | null }) {
              renderer = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) return

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: renderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                animation: 'shift-away',
                theme: 'slash',
              })
            },

            onUpdate(props: Parameters<typeof SlashMenu>[0] & { clientRect?: () => DOMRect | null }) {
              renderer.updateProps(props)
              if (!props.clientRect) return
              popup[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect })
            },

            onKeyDown(props: { event: KeyboardEvent }) {
              if (props.event.key === 'Escape') {
                popup[0]?.hide()
                return true
              }
              return renderer.ref?.onKeyDown(props.event) ?? false
            },

            onExit() {
              popup[0]?.destroy()
              renderer?.destroy()
            },
          }
        },
      }),
    ]
  },
})
