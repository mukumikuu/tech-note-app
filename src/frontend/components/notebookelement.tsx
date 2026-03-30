import { NotebookIcon } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import '../ui/index.css'
import type { DraggableSyntheticListeners } from '@dnd-kit/core'

interface ElementProps {
  label: string
  onLabelChange?: (value: string) => void
  onClick: () => void
  className?: string
  dragListeners?: DraggableSyntheticListeners
  isDragging?: boolean
}

const NotebookElement: React.FC<ElementProps> = ({
  label,
  onLabelChange,
  onClick,
  className = '',
  dragListeners,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(label)
  useEffect(() => {
    if (!isEditing) {
      setText(label)
    }
  }, [label, isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    onLabelChange?.(text)
  }

  const baseClasses =
    'flex w-full bg-dark-blue rounded-sm px-2 hover:brightness-125 items-center gap-2 font-Poppins text-white text-sm cursor-pointer transition-all duration-300'

  return (
    <button
      className={`${baseClasses} ${className}`}
      onClick={() => !isEditing && onClick()}
    >
      <NotebookIcon
        size={20}
        color='white'
        {...(dragListeners ?? {})}
        className='shrink-0 cursor-grab px-1'
        onClick={(e) => e.stopPropagation()}
      ></NotebookIcon>
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
  )
}

export default NotebookElement
