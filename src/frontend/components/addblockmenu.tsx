import { useState } from 'react'
import { Plus, Code, FileText } from 'lucide-react'
import Button from './button'

const AddBlockMenu = ({
  onSelect,
}: {
  onSelect: (type: 'code' | 'markdown') => void
}) => {
  const [open, setOpen] = useState(false)

  const toggleMenu = () => {
    setOpen((prev) => !prev)
  }

  const handleSelect = (type: 'code' | 'markdown') => {
    onSelect(type)
    setOpen(false)
  }

  return (
    <div
      data-testid='addblockmenu'
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className='outlone-black border-black'
    >
      <Button icon={Plus} variant='icon' iconSize={16} onClick={toggleMenu} />
      {open && (
        <div className='absolute z-2'>
          <Button
            onClick={() => handleSelect('code')}
            variant='default'
            icon={Code}
            iconSize={14}
            className='font-poppins px-2 text-[10px] text-white'
          >
            Code Block
          </Button>
          <Button
            onClick={() => handleSelect('markdown')}
            variant='default'
            icon={FileText}
            iconSize={14}
            className='font-poppins px-2 text-[10px] text-white'
          >
            Markdown
          </Button>
        </div>
      )}
    </div>
  )
}

export default AddBlockMenu
