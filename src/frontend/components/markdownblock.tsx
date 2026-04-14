import { useState } from 'react'
import AddBlockMenu from './addblockmenu'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragButton from './dragbutton'
import Button from './button'
import { Copy, Trash } from 'lucide-react'
import { useCopyToClipboard } from '../hooks/usecopytoclipboard'
import { escapeRegex } from '../utils/regexp'

type MarkdownBlockProps = {
  id: string
  content: string
  searchQuery?: string
  onContentChange: (content: string) => void
  onAdd: (type: 'markdown' | 'code') => void
  onRemove: () => void
  onRenderedRef?: (id: string, view: HTMLElement) => void
}
const MarkdownBlock = ({
  id,
  content,
  searchQuery,
  onContentChange,
  onAdd,
  onRemove,
}: MarkdownBlockProps) => {
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
    await copy(content)
    if (!copied) console.log('copy failed')
  }

  const handleRemove = () => {
    onRemove()
    console.log(`${id} is removed`)
  }

  const highlightContent = (text: string, query: string) => {
    if (!query) return text
    const safeQuery = escapeRegex(query)
    const regex = new RegExp(`(${safeQuery})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className='bg-yellow-300 text-black'>
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div
      data-testid='markdownblock'
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
                data-testid='copy'
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCopy}
                icon={Copy}
                iconSize={14}
                variant='icon'
              />
              <Button
                data-testid='remove'
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleRemove}
                icon={Trash}
                iconSize={14}
                variant='icon'
              />
            </div>
          )}
          {!focused && searchQuery ? (
            <div
              className='block field-sizing-content h-auto w-full font-mono whitespace-pre-wrap text-white'
              onClick={() => setFocused(true)}
            >
              {highlightContent(content, searchQuery)}
            </div>
          ) : (
            <textarea
              className='block field-sizing-content h-auto w-full font-mono text-white'
              style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MarkdownBlock
