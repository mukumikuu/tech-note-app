import Button from './button'
import { FolderPlus } from 'lucide-react'

const CreateFolderButton = () => {
  return (
    <Button
      variant='default'
      icon={FolderPlus}
      rounded='lg'
      iconSize={16}
      onClick={() => console.log('New folder')}
    >
      Create Folder
    </Button>
  )
}

export default CreateFolderButton
