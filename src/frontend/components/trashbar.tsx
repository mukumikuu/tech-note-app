import { LucideTrash2 } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'

const TrashDropZone = () => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'drop-zone',
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-dark-blue mt-auto flex h-12 w-full items-center justify-center rounded transition ${isOver ? 'opacity-100' : 'opacity-0'} ${isOver ? 'brightness-125' : ''}`}
    >
      <LucideTrash2 className='text-white' />
    </div>
  )
}

export default TrashDropZone
