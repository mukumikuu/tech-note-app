import ExecuteCellButton from './executecellbutton'
import { useState, useEffect } from 'react'
import Button from './button'
import { Copy, Trash } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import type { CellStatus } from '../types/cellstatus'
import type { KernelResult } from '../../shared/kernelResult'
import { useCopyToClipboard } from '../hooks/usecopytoclipboard'
import AddBlockMenu from './addblockmenu'
import '../ui/index.css'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragButton from './dragbutton'

type CodeBlockProps = {
  id: string
  blockIndex: number
  onAdd: (type: 'markdown' | 'code') => void
  onRemove: () => void
}

const CodeBlock = ({ id, blockIndex, onAdd, onRemove }: CodeBlockProps) => {
  const [status, setStatus] = useState<CellStatus>('idle')
  const [code, setCode] = useState('Write something')
  const [output, setOutput] = useState<KernelResult | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const { copy, copied } = useCopyToClipboard()

  useEffect(() => {
    const s = io('http://localhost:3030')
    setSocket(s)
    s.on('connect', () => console.log('Connected to kernel'))
    s.on('codeResult', (data: KernelResult) => setOutput(data))
    return () => {
      s.disconnect()
    }
  }, [])
  const runCell = () => {
    if (!socket || !socket.connected) {
      console.error('Socket not connected')
      setStatus('error')
      return
    }

    try {
      setStatus('running')
      socket.emit('runCode', code)
      setTimeout(() => setStatus('idle'), 300)
    } catch {
      setStatus('error')
    }
  }

  const handleCopy = async () => {
    await copy(code)
    if (!copied) console.log('copy failed')
  }

  const handleRemove = () => {
    onRemove()
    console.log(`${id} is removed`)
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex w-full gap-2 ${
        isDragging ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className='flex w-full items-center gap-2'>
        <div className='flex flex-col items-end gap-y-1'>
          <ExecuteCellButton
            status={status}
            iconColor='var(--color-light-blue)'
            iconSize={16}
            onExecute={runCell}
          />
          <div className='font-poppins text-[12px] text-white'>{`[${blockIndex}]`}</div>
          <div className='flex flex-row items-center'>
            <AddBlockMenu onSelect={(type) => onAdd(type)}></AddBlockMenu>
            <DragButton
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
            ></DragButton>
          </div>
        </div>
        <div className='w-full'>
          <div
            className='flex flex-row items-center gap-4 bg-[#191E30]'
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
          >
            <div className='font-poppins pl-6 text-white'>JavaScript</div>
            <Button onClick={handleCopy} icon={Copy} variant='icon' />
            <Button onClick={handleRemove} icon={Trash} variant='icon' />
          </div>
          <textarea
            className='bg-blue block field-sizing-content h-auto w-full pl-6 font-mono text-white'
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className='bg-blue pt-2 pl-6 font-mono text-sm text-white'>
            {output?.error && <div className='text-red'>{output.error}</div>}
            {output && !output.error && (
              <div className='text-white'>{output.logs.join('')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeBlock
