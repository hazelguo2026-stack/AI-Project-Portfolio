import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import NoteList from './components/NoteList'
import Editor from './components/Editor'
import EmptyState from './components/EmptyState'
import AIPanel from './components/AIPanel'
import APIKeyModal from './components/APIKeyModal'
import PlannerView from './components/PlannerView'
import { useNotesStore } from './store/notesStore'
import { useAIStore } from './store/aiStore'

export default function App() {
  const { activeNoteId, activeFolderId, theme } = useNotesStore()
  const { showKeyModal } = useAIStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const isPlanner = activeFolderId === '__planner__'

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      <Sidebar />
      {isPlanner ? (
        <PlannerView />
      ) : (
        <>
          <NoteList />
          {activeNoteId ? <Editor key={activeNoteId} noteId={activeNoteId} /> : <EmptyState />}
        </>
      )}
      <AIPanel />
      {showKeyModal && <APIKeyModal />}
    </div>
  )
}
