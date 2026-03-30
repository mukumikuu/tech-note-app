import type { LucideIcon } from 'lucide-react'
import React, { useState } from 'react'
import '../ui/index.css'
import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import dragger from '../ui/assets/picture/dragger.svg'

interface ElementProps {
  label: string
  onLabelChange?: (value: string) => void
  onClick: () => void
  className?: string
  icon?: LucideIcon
  iconSize?: number
  iconColor?: string
  iconClassname?: string
  dragListeners?: DraggableSyntheticListeners
  isDragging?: boolean
}

const FolderElement: React.FC<ElementProps> = ({
  label,
  onLabelChange,
  onClick,
  className = '',
  icon: Icon,
  iconSize = 18,
  iconColor = 'var(--color-white)',
  iconClassname = '',
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
    <button
      className={`${baseClasses} ${className}`}
      onClick={() => !isEditing && onClick()}
    >
      {Icon && (
        <Icon size={iconSize} color={iconColor} className={iconClassname} />
      )}
      <div
        {...(dragListeners ?? {})}
        className='shrink-0 cursor-grab px-1'
        onClick={(e) => e.stopPropagation()}
      >
        <img src={dragger} alt='||' className='h-4 w-4' />
      </div>
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

export default FolderElement
