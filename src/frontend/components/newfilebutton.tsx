import Button from './button'
import { FilePlusCorner } from 'lucide-react'

const NewFileButton = () => {
  return (
    <Button
      variant='default'
      icon={FilePlusCorner}
      rounded='lg'
      iconSize={16}
      onClick={() => console.log('New file')}
    >
      New File
    </Button>
  )
}

export default NewFileButton
