import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SideBarElement from './sidebarelement'

interface Props {
  id: string
  name: string
  isExpanded?: boolean
  onToggleExpanded?: () => void
  onRename: (value: string) => void
}

const SortableSidebarElement = ({
  id,
  name,
  isExpanded = false,
  onToggleExpanded,
  onRename,
}: Props) => {
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
        <button
          onClick={onToggleExpanded}
          className='px-1 py-1 text-white transition-opacity hover:opacity-70'
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <div className='flex-1'>
          <SideBarElement
            label={name}
            onLabelChange={onRename}
            onClick={() => console.log('open', id)}
            className={`${isDragging ? 'opacity-0' : 'opacity-100'}`}
            dragListeners={listeners}
            isDragging={isDragging}
          />
        </div>
      </div>
    </div>
  )
}

export default SortableSidebarElement
