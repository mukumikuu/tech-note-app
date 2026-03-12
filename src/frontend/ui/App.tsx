import Notebook from '../components/notebook'
import Sidebar from '../components/sidebar'
import NewFileFolderModal from '../components/newfilefoldermodal'
import { useState } from 'react'
import { useFolders } from '../hooks/usefolder'

function App() {
  // set default state to open and keep the state of the folders in the app component so that it can be passed down to both the sidebar and the modal
  const [open, setOpen] = useState(true) // open by default
  const { folders, setFolders, addFolder, removeFolder, reorderFolders } =
    useFolders()

  return (
    // <div className='flex w-full flex-row'>
    //   <Sidebar></Sidebar>
    //   <div className='flex w-full flex-col px-4'>
    //     <Notebook></Notebook>
    //   </div>
    // </div>

    <div className='flex w-full flex-row'>
      <Sidebar
        folders={folders}
        setFolders={setFolders}
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
        {!open && <Notebook></Notebook>}
      </div>
    </div>
  )
}

export default App
