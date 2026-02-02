import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SideBarElement from './sidebarelement'

interface Props {
  id: string
  name: string
  onRename: (value: string) => void
}

const SortableSidebarElement = ({ id, name, onRename }: Props) => {
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
      <SideBarElement
        label={name}
        onLabelChange={onRename}
        onClick={() => console.log('open', id)}
        className={`${isDragging ? 'opacity-0' : 'opacity-100'}`}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  )
}

export default SortableSidebarElement
