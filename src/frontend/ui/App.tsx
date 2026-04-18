import Notebook from '../components/notebook'
import Sidebar from '../components/sidebar'
import NewFileFolderModal from '../components/newfilefoldermodal'
import NameModal from '../components/namemodal'
import { useState } from 'react'
import { useFolders } from '../hooks/usefolder'
import { useNotebook } from '../hooks/usenotebook'
import type NotebookClass from '../../shared/notebook'
import { useEffect } from 'react'
import type Folder from '../../shared/folder'

function App() {
  const [startModalOpen, setStartModalOpen] = useState(false)
  const [fileNameOpen, setFileNameOpen] = useState(false)
  const [folderNameOpen, setFolderNameOpen] = useState(false)
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(
    null
  )
  const {
    folders,
    fLoaded,
    addFolder,
    removeFolder,
    updateFolder,
    reorderFolders,
    reparentFolder,
    listAllFolder,
  } = useFolders()
  const {
    notebook,
    notebooks,
    nbLoaded,
    getNotebook,
    updateNotebook,
    createNotebook,
    deleteNotebook,
    reorderNotebooks,
    listAllNotebooks,
  } = useNotebook(selectedNotebookId || undefined)

  useEffect(() => {
    listAllFolder()
    listAllNotebooks()
  }, [])

  useEffect(() => {
    if (fLoaded && nbLoaded) {
      const hasNoContent = folders.length === 0 && notebooks.length === 0
      const isNamingFlowOpen = fileNameOpen || folderNameOpen
      setStartModalOpen(hasNoContent && !isNamingFlowOpen)
    }
  }, [fLoaded, nbLoaded, folders, notebooks, fileNameOpen, folderNameOpen])

  const handleNotebookSelect = (notebookId: string) => {
    setSelectedNotebookId(notebookId)
    getNotebook(notebookId)
    // setOpen(false)
    setStartModalOpen(false)
    setFileNameOpen(false)
    setFolderNameOpen(false)
  }

  const handleNotebookUpdate = (updatedNotebook: NotebookClass) => {
    updateNotebook(updatedNotebook)
  }

  const handleFolderUpdate = (updatedFolder: Folder) => {
    updateFolder(updatedFolder)
  }

  const openFileNameModal = () => {
    setStartModalOpen(false)
    setFolderNameOpen(false)
    setFileNameOpen(true)
  }

  const openFolderNameModal = () => {
    setStartModalOpen(false)
    setFileNameOpen(false)
    setFolderNameOpen(true)
  }

  const handleCreateNotebook = (name: string) => {
    createNotebook(name, folders[0]?.folderid)
    setFileNameOpen(false)
  }

  const handleCreateFolder = (name: string) => {
    addFolder(name)
    setFolderNameOpen(false)
  }

  return (
    <div className='flex w-full flex-row'>
      <Sidebar
        folders={folders}
        notebooks={notebooks}
        addNotebook={createNotebook}
        addFolder={addFolder}
        removeFolder={removeFolder}
        onFolderUpdate={handleFolderUpdate}
        reorderFolders={reorderFolders}
        reparentFolder={reparentFolder}
        onNotebookSelect={handleNotebookSelect}
        removeNotebook={deleteNotebook}
        onNotebookUpdate={handleNotebookUpdate}
        reorderNotebooks={reorderNotebooks}
      />
      <div className='flex min-w-0 flex-1 flex-col px-4 pt-6'>
        <>
          <NewFileFolderModal
            isOpen={startModalOpen}
            onClose={() => setStartModalOpen(false)}
            onNewFile={openFileNameModal}
            onNewFolder={openFolderNameModal}
          />

          <NameModal
            isOpen={fileNameOpen}
            onClose={() => setFileNameOpen(false)}
            onSubmit={handleCreateNotebook}
            topic='Create New Notebook 📔'
            placeholder='Enter notebook name ...'
          />

          <NameModal
            isOpen={folderNameOpen}
            onClose={() => setFolderNameOpen(false)}
            onSubmit={handleCreateFolder}
            topic='Create New Folder 📁'
            placeholder='Enter folder name ...'
          />
          {!startModalOpen && !fileNameOpen && !folderNameOpen && notebook && (
            <Notebook
              key={notebook.notebookid}
              notebook={notebook}
              onNotebookUpdate={handleNotebookUpdate}
            />
          )}
        </>
      </div>
    </div>
  )
}
export default App
