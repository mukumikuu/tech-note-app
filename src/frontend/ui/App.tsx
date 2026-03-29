import Notebook from '../components/notebook'
import Sidebar from '../components/sidebar'
import NewFileFolderModal from '../components/newfilefoldermodal'
import { useState } from 'react'
import { useFolders } from '../hooks/usefolder'
import { useNotebook } from '../hooks/usenotebook'
import type NotebookClass from '../../shared/notebook'

function App() {
  // set default state to open and keep the state of the folders in the app component so that it can be passed down to both the sidebar and the modal
  const [open, setOpen] = useState(true) // open by default
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(
    null
  )
  const { folders, setFolders, addFolder, removeFolder, reorderFolders } =
    useFolders()
  const { notebook, notebooks, getNotebook, updateNotebook, createNotebook } =
    useNotebook(selectedNotebookId || undefined)

  const handleNotebookSelect = (notebookId: string) => {
    setSelectedNotebookId(notebookId)
    getNotebook(notebookId)
    setOpen(false)
  }

  const handleNotebookUpdate = (updatedNotebook: NotebookClass) => {
    updateNotebook(updatedNotebook)
  }

  return (
    <div className='flex w-full flex-row'>
      <Sidebar
        folders={folders}
        notebooks={notebooks}
        setFolders={setFolders}
        addNotebook={createNotebook}
        addFolder={addFolder}
        removeFolder={removeFolder}
        reorderFolders={reorderFolders}
      />
      <div className='flex w-full flex-col px-4'>
        <>
          <NewFileFolderModal
            isOpen={open}
            onClose={() => setOpen(!open)}
            addFolder={addFolder}
          />
        </>
        {!open && notebook && (
          <Notebook
            notebook={notebook}
            onNotebookUpdate={handleNotebookUpdate}
          />
        )}
      </div>
    </div>
  )
}

export default App
