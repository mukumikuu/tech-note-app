import { useState } from 'react'
import Button from './button'
import { Plus } from 'lucide-react'
import dragger from '../ui/assets/dragger.svg'

const MarkdownBlock = () => {
  const [text, setText] = useState('Write something...')

  const handleDrag = () => {
    //TODO in allow reordtext block/markdown
  }

  const handlePlus = () => {
    //TODO in Create code block/markdown
  }

  return (
    <div className='flex w-full gap-2'>
      <div className='flex flex-col items-end'>
        <div className='flex flex-row'>
          <Button onClick={handlePlus} icon={Plus} variant='icon' />
          <Button variant='icon' onClick={handleDrag}>
            <img src={dragger} alt='||' className='h-5 w-5' />
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
