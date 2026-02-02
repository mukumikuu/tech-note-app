import { useState } from 'react'
import Button from './button'
import { Play, RotateCcwIcon, Trash2 } from 'lucide-react'
interface FileHeaderProps {
  label: string
  onLabelChange?: (value: string) => void
  onRunAll?: () => void
  onRestart?: () => void
  onClearOutput?: () => void
}
const FileHeader = ({ label, onLabelChange }: FileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(label)

  const handleBlur = () => {
    setIsEditing(false)
    onLabelChange?.(text)
  }
  const handleOnClick = () => {
    //TODO in sprint 3 code execution
  }

  return (
    <div className='flex flex-col gap-y-1'>
      <div className='font-poppins text-2xl font-bold text-white'>
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
      </div>
      <div className='flex w-3/4 flex-row gap-2 pb-2 text-xs'>
        <Button icon={Play} onClick={handleOnClick}>
          Run All
        </Button>
        <Button icon={RotateCcwIcon} onClick={handleOnClick}>
          Restart
        </Button>
        <Button icon={Trash2} onClick={handleOnClick}>
          Clear Output
        </Button>
      </div>
    </div>
  )
}

export default FileHeader
