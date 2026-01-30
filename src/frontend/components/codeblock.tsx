import ExecuteCellButton from './executecellbutton'
import { useState, useEffect } from 'react'
import Button from './button'
import { Copy, Ellipsis } from 'lucide-react'
import dragger from '../ui/assets/picture/dragger.svg'
import { io, Socket } from 'socket.io-client'
import type { CellStatus } from '../types/cellstatus'
import type { KernelResult } from '../../shared/kernelResult'
import { useCopyToClipboard } from '../hooks/usecopytoclipboard'
import AddBlockMenu from './addblockmenu'

type CodeBlockProps = {
  blockIndex: number
  onAdd: (type: 'markdown' | 'code') => void
}

const CodeBlock = ({ blockIndex, onAdd }: CodeBlockProps) => {
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

  const handleEllipsis = () => {
    //TODO show modal menu for deletion is blocked by modal
  }

  const handleDrag = () => {
    //TODO in allow reorder code block/markdown
  }

  return (
    <div className='flex w-full items-center gap-2'>
      <div className='flex flex-col items-end'>
        <ExecuteCellButton
          status={status}
          iconColor='#3E74EA'
          iconSize={16}
          onExecute={runCell}
        />
        <div className='font-poppins text-[12px]'>{`[${blockIndex}]`}</div>
        <div className='flex flex-row items-center'>
          <AddBlockMenu onSelect={(type) => onAdd(type)}></AddBlockMenu>
          <Button variant='icon' onClick={handleDrag}>
            <img src={dragger} alt='||' className='h-8 w-8' />
          </Button>
        </div>
      </div>
      <div className='w-full'>
        <div className='flex flex-row items-center gap-4 bg-[#191E30]'>
          <div className='pl-6'>JavaScript</div>
          <Button
            onClick={handleCopy}
            icon={Copy}
            variant='icon'
            className='px-0'
          />
          <Button onClick={handleEllipsis} icon={Ellipsis} variant='icon' />
        </div>
        <textarea
          className='block field-sizing-content h-auto w-full bg-[#2C3142] pl-6 font-mono'
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className='bg-[#2C3142] pt-2 pl-6 font-mono text-sm'>
          {output?.error && (
            <div className='text-[#FF0000]'>{output.error}</div>
          )}
          {output && !output.error && (
            <div className='text-[#FFFFFF]'>{output.logs.join('')}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeBlock
