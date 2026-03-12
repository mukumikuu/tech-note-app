import Button from './button'
import { FilePlusCorner } from 'lucide-react'

interface NewFileButtonProps {
  className?: string
}

const NewFileButton = ({ className }: NewFileButtonProps) => {
  return (
    <Button
      variant='default'
      icon={FilePlusCorner}
      rounded='lg'
      className={className}
      iconSize={16}
      onClick={() => {
                onAdd('folder')
                setOpened((prev) => !prev)
              }} // edit this later to open a modal for file name input
    >
      New File
    </Button>
  )
}

export default NewFileButton
