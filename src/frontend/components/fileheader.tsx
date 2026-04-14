import { useState } from 'react'
import Button from './button'
import { Play, RotateCcwIcon, Trash2 } from 'lucide-react'
import Block from '../../shared/block'
import { useEffect } from 'react'
interface FileHeaderProps {
  blocks: Block[]
  label: string
  onLabelChange?: (value: string) => void
  onRunAll: () => void
  onRestart: () => void
  onClearOutput: (blocks: Block[]) => void
}
const FileHeader = ({
  blocks,
  label,
  onLabelChange,
  onRunAll,
  onRestart,
  onClearOutput,
}: FileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(label)

  useEffect(() => {
    if (!isEditing) {
      setText(label)
    }
  }, [label])

  const handleBlur = () => {
    setIsEditing(false)
    onLabelChange?.(text)
  }

  const handleOnClear = () => {
    onClearOutput(blocks)
    console.log('clear output')
  }

  const handleRestart = () => {
    onRestart()
    console.log('restart kernel')
  }

  const handleRunAll = () => {
    onRunAll()
    console.log('run all')
  }

  return (
    <div className='flex flex-col gap-y-1' data-testid='fileheader'>
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
        <Button icon={Play} onClick={handleRunAll}>
          Run All
        </Button>
        <Button icon={RotateCcwIcon} onClick={handleRestart}>
          Restart
        </Button>
        <Button icon={Trash2} onClick={handleOnClear}>
          Clear Output
        </Button>
      </div>
    </div>
  )
}

export default FileHeader
