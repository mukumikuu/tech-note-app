import { ChevronRight, ChevronDown, FolderIcon } from 'lucide-react'
import React, { useState } from 'react'
import '../ui/index.css'
import type { DraggableSyntheticListeners } from '@dnd-kit/core'

interface ElementProps {
  label: string
  onLabelChange?: (value: string) => void
  onClick: () => void
  isExpanded?: boolean
  onToggleExpanded?: () => void
  className?: string
  dragListeners?: DraggableSyntheticListeners
  isDragging?: boolean
}

const FolderElement: React.FC<ElementProps> = ({
  label,
  onLabelChange,
  onClick,
  isExpanded = false,
  onToggleExpanded,
  className = '',
  dragListeners,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(label)

  const handleBlur = () => {
    setIsEditing(false)
    onLabelChange?.(text)
  }

  const baseClasses =
    'flex w-full bg-dark-blue rounded-sm px-2 hover:brightness-125 items-center gap-2 font-Poppins text-white text-sm cursor-pointer transition-all duration-300'

  return (
    <div data-testid='folderelement' className={`${baseClasses} ${className}`}>
      <button
        data-testid='togglebutton'
        onClick={onToggleExpanded}
        className='px-1 py-1 text-white transition-opacity hover:opacity-70'
      >
        {isExpanded ? (
          <ChevronDown data-testid='ChevronDown' size={16} />
        ) : (
          <ChevronRight data-testid='ChevronRight' size={16} />
        )}
      </button>
      <button
        onClick={() => !isEditing && onClick()}
        className='flex items-center gap-2'
      >
        <FolderIcon
          data-testid='icon'
          size={20}
          color='white'
          {...(dragListeners ?? {})}
          className='shrink-0 cursor-grab px-1'
          onClick={(e) => e.stopPropagation()}
        />
        {isEditing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBlur()
              if (e.key === 'Escape') {
                setText(label)
                setIsEditing(false)
              }
            }}
            className='w-full bg-transparent text-white outline-none'
          />
        ) : (
          <span onDoubleClick={() => setIsEditing(true)}>{text}</span>
        )}
      </button>
    </div>
  )
}

export default FolderElement
