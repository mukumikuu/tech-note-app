import { useState } from 'react'
import Button from './button'
import dragger from '../ui/assets/picture/dragger.svg'
import AddBlockMenu from './addblockmenu'

type MarkdownBlockProps = {
  onAdd: (type: 'markdown' | 'code') => void
}
const MarkdownBlock = ({ onAdd }: MarkdownBlockProps) => {
  const [text, setText] = useState('Write something...')

  const handleDrag = () => {
    //TODO in allow reordtext block/markdown
  }

  return (
    <div className='flex w-full items-center gap-2'>
      <div className='flex flex-col'>
        <div className='flex flex-row items-center'>
          <AddBlockMenu onSelect={(type) => onAdd(type)}></AddBlockMenu>
          <Button variant='icon' onClick={handleDrag} className='px-0'>
            <img src={dragger} alt='||' className='h-8 w-8' />
          </Button>
        </div>
      </div>
      <div className='w-full'>
        <textarea
          className='block field-sizing-content h-auto w-full font-mono'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </div>
  )
}

export default MarkdownBlock
