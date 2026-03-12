import Button from './button'
import { FolderPlus } from 'lucide-react'

interface CreateFolderButtonProps {
  className?: string
  onClick: () => void
}

const CreateFolderButton = ({
  className,
  onClick,
}: CreateFolderButtonProps) => {
  return (
    <Button
      variant='default'
      icon={FolderPlus}
      rounded='lg'
      iconSize={16}
      className={className}
      onClick={onClick} // edit this later to open a modal for folder name input
    >
      Create Folder
    </Button>
  )
}

export default CreateFolderButton
