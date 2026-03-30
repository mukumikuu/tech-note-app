import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import NotebookElement from './notebookelement'
interface Props {
  id: string
  name: string
  onClick: () => void
  onRename: (value: string) => void
}

const SortableNotebookElement = ({ id, name, onClick, onRename }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className='gap-y-2'>
      <div className='flex items-center gap-1'>
        <NotebookElement
          label={name}
          onLabelChange={onRename}
          onClick={onClick}
          className={`${isDragging ? 'opacity-0' : 'opacity-100'}`}
          dragListeners={listeners}
          isDragging={isDragging}
        />
      </div>
    </div>
  )
}

export default SortableNotebookElement
