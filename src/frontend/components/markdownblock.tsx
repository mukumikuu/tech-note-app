import { useState } from 'react'
import AddBlockMenu from './addblockmenu'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragButton from './dragbutton'
import Button from './button'
import { Copy, Trash } from 'lucide-react'
import { useCopyToClipboard } from '../hooks/usecopytoclipboard'

type MarkdownBlockProps = {
  id: string
  onAdd: (type: 'markdown' | 'code') => void
  onRemove: () => void
}
const MarkdownBlock = ({ id, onAdd, onRemove }: MarkdownBlockProps) => {
  const [text, setText] = useState('Write something...')
  const [focused, setFocused] = useState<boolean>(false)
  const { copy, copied } = useCopyToClipboard()

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

  const handleCopy = async () => {
    await copy(text)
    if (!copied) console.log('copy failed')
  }

  const handleRemove = () => {
    onRemove()
    console.log(`${id} is removed`)
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
        <div className='relative flex w-full flex-col gap-2'>
          {focused && (
            <div className='absolute top-0 right-0.5 flex flex-row items-center'>
              <Button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCopy}
                icon={Copy}
                iconSize={14}
                variant='icon'
              />
              <Button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleRemove}
                icon={Trash}
                iconSize={14}
                variant='icon'
              />
            </div>
          )}
          <textarea
            className='block field-sizing-content h-auto w-full font-mono text-white'
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </div>
    </div>
  )
}

export default MarkdownBlock
