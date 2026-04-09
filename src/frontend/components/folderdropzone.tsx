import { useDroppable } from '@dnd-kit/core'
const FolderDropZone = ({
  folderId,
  isDragging,
}: {
  folderId: string
  isDragging: boolean
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `folder-drop:${folderId}` })
  return (
    <div
      ref={setNodeRef}
      className={`w-full rounded transition-all duration-150 ${
        isDragging ? 'h-1' : 'h-0'
      } ${isOver ? 'bg-white/30' : ''}`}
    />
  )
}

export default FolderDropZone
