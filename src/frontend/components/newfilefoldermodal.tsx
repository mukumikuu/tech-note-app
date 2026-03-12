import CreateFolderButton from './createfolderbotton'
import NewFileButton from './newfilebutton'
// import { useFolders } from '../hooks/usefolder'

interface NewFileFolderModalProps {
  isOpen: boolean
  onClose: () => void
  addFolder: (index: number, name: string) => void
  title?: string
  description?: string
}

const NewFileFolderModal = ({
  isOpen,
  onClose,
  addFolder,
}: NewFileFolderModalProps) => {
  if (!isOpen) return null

  const handleCreateFolder = () => {
    addFolder(0, 'untitled')
    onClose()
  }
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal box */}
      <div
        className='relative w-[360px] rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='mb-4 text-xl font-semibold'>Welcome to Tech Note !</h2>

        <p className='mb-6 text-sm text-zinc-400'>
          Start by creating a new folder or file.
        </p>

        <div className='flex flex-col gap-3'>
          <NewFileButton />
          <CreateFolderButton onClick={handleCreateFolder} />
        </div>
      </div>
    </div>
  )
}

export default NewFileFolderModal
