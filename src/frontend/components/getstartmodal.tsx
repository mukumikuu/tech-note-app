import { useState } from 'react'
import Button from './button'
import CreateFolderButton from './createfolderbotton'
import NewFileButton from './newfilebutton'

interface GetStartModalProps {
  isOpen: boolean
  onClose: () => void
}

const GetStartModal = ({ isOpen, onClose }: GetStartModalProps) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal box */}
      <div
        className='relative w-[360px] rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='mb-4 text-xl font-semibold'>Welcome !</h2>

        <p className='mb-6 text-sm text-zinc-400'>
          Start by creating a new folder or file.
        </p>

        <div className='flex flex-col gap-3'>
          <NewFileButton />
          <CreateFolderButton />
        </div>
      </div>
    </div>
  )
}

export default GetStartModal
