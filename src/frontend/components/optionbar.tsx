import { useState } from 'react'
import Button from './button'
import { SearchIcon, Ellipsis } from 'lucide-react'

interface OptionBarProps {
  onAddFolder: (type: 'folder') => void
  onAddNotebook: (type: 'notebook') => void
  onToggleSearch: () => void
}

const OptionBar = ({
  onAddFolder,
  onAddNotebook,
  onToggleSearch,
}: OptionBarProps) => {
  const [opened, setOpened] = useState(false)
  const handleEllipsis = () => {
    setOpened((prev) => !prev)
  }
  return (
    <div data-testid='optionbar'>
      <div className='flex flex-row justify-end gap-2'>
        <Button
          data-testid='searchbutton'
          onClick={onToggleSearch}
          variant='icon'
          icon={SearchIcon}
          iconSize={12}
        ></Button>
        <Button
          data-testid='ellipsis'
          onClick={handleEllipsis}
          variant='icon'
          icon={Ellipsis}
          iconSize={12}
        ></Button>
        {opened && (
          <div className='absolute top-6'>
            <Button
              data-testid='folderbutton'
              onClick={() => {
                onAddFolder('folder')
                setOpened((prev) => !prev)
              }}
              variant='default'
              rounded='lg'
              iconSize={14}
              className='font-poppins px-2 text-[10px] text-white'
            >
              Create New Folder
            </Button>
            <Button
              data-testid='notebookbutton'
              onClick={() => {
                onAddNotebook('notebook')
                setOpened((prev) => !prev)
              }}
              variant='default'
              rounded='lg'
              iconSize={14}
              className='font-poppins px-2 text-[10px] text-white'
            >
              Create New Notebook
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OptionBar
