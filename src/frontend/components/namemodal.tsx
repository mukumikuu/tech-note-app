import { useState } from 'react'
import Button from './button'

interface FileNameModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
  topic: string
  placeholder: string
}

const NameModal = ({
  isOpen,
  onClose,
  onSubmit,
  topic,
  placeholder,
}: FileNameModalProps) => {
  const [fileName, setFileName] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    const trimName = fileName.trim()
    if (!trimName) return
    onSubmit(trimName)
    setFileName('')
    onClose()
  }

  const handleClose = () => {
    setFileName('')
    onClose()
  }

  return (
    <div className='fixed inset-0 z-40 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={handleClose}
      ></div>
      <div
        className='relative w-[360px] rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='mb-4 text-center text-xl font-semibold'>{topic}</h2>
        <input
          autoFocus
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder={placeholder}
          className='mb-4 w-full rounded-lg border border-dashed border-white/50 bg-transparent px-4 py-2 text-center text-white outline-none placeholder:text-white/50 placeholder:text-zinc-400 focus:border-white'
        />

        <Button
          onClick={handleSubmit}
          className='mx-auto w-[180px]'
          disabled={!fileName.trim()}
        >
          Enter
        </Button>
      </div>
    </div>
  )
}
export default NameModal
