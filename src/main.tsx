import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useNotesStore } from './store/notesStore'

const root = document.getElementById('root')!

// Apply saved theme before first render
const saved = localStorage.getItem('zhishu-notes-storage')
if (saved) {
  try {
    const { state } = JSON.parse(saved)
    if (state?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch {}
}

// Expose store init
void useNotesStore.getState()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
