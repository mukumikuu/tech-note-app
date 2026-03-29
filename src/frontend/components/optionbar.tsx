import { useState } from 'react'
import Button from './button'
import { FilterIcon, SearchIcon, Ellipsis } from 'lucide-react'

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
  const handleFilter = () => {
    //TODO in sprint 6
  }
  const handleEllipsis = () => {
    setOpened((prev) => !prev)
  }
  return (
    <div>
      <div className='flex flex-row justify-end gap-2'>
        <Button
          onClick={handleFilter}
          variant='icon'
          icon={FilterIcon}
          iconSize={12}
        ></Button>
        <Button
          onClick={onToggleSearch}
          variant='icon'
          icon={SearchIcon}
          iconSize={12}
        ></Button>
        <Button
          onClick={handleEllipsis}
          variant='icon'
          icon={Ellipsis}
          iconSize={12}
        ></Button>
        {opened && (
          <div className='absolute top-6'>
            <Button
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
