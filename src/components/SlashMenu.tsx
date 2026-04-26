import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export interface SlashCommand {
  title: string
  description: string
  icon: string
  keywords: string[]
  command: (props: { editor: unknown; range: unknown }) => void
}

interface SlashMenuProps {
  items: SlashCommand[]
  command: (item: SlashCommand) => void
}

export interface SlashMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}

const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(({ items, command }, ref) => {
  const [selected, setSelected] = useState(0)

  useEffect(() => setSelected(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowUp') {
        setSelected((s) => (s - 1 + items.length) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelected((s) => (s + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        const item = items[selected]
        if (item) command(item)
        return true
      }
      return false
    },
  }))

  if (items.length === 0) return null

  return (
    <div className="slash-menu">
      {items.map((item, i) => (
        <button
          key={item.title}
          className={`slash-menu-item${i === selected ? ' slash-menu-item--active' : ''}`}
          onMouseEnter={() => setSelected(i)}
          onClick={() => command(item)}
        >
          <span className="slash-menu-icon">{item.icon}</span>
          <div className="slash-menu-text">
            <div className="slash-menu-title">{item.title}</div>
            <div className="slash-menu-desc">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  )
})

SlashMenu.displayName = 'SlashMenu'
export default SlashMenu
