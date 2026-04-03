import Button from './button'
import { FilePlusCorner } from 'lucide-react'

interface NewFileButtonProps {
  className?: string
  onClick: () => void
}

const NewFileButton = ({ className, onClick }: NewFileButtonProps) => {
  return (
    <Button
      variant='default'
      icon={FilePlusCorner}
      rounded='lg'
      className={className}
      iconSize={16}
      onClick={onClick} // edit this later to open a modal for file name input
    >
      New File
    </Button>
  )
}

export default NewFileButton
