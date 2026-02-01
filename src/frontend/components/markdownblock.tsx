import { useState } from 'react'
import AddBlockMenu from './addblockmenu'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragButton from './dragbutton'

type MarkdownBlockProps = {
  id: string
  onAdd: (type: 'markdown' | 'code') => void
}
const MarkdownBlock = ({ id, onAdd }: MarkdownBlockProps) => {
  const [text, setText] = useState('Write something...')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex w-full gap-2 ${
        isDragging ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className='flex w-full items-center gap-2'>
        <div className='flex flex-col'>
          <div className='flex flex-row items-center'>
            <AddBlockMenu onSelect={(type) => onAdd(type)}></AddBlockMenu>
            <DragButton
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
            ></DragButton>
          </div>
        </div>
        <div className='w-full'>
          <textarea
            className='block field-sizing-content h-auto w-full font-mono text-white'
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default MarkdownBlock
