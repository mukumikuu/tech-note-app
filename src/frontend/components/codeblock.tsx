import ExecuteCellButton from './executecellbutton'
import { useState, useEffect } from 'react'
import Button from './button'
import { Copy, Ellipsis, Plus } from 'lucide-react'
import dragger from '../ui/assets/picture/dragger.svg'
import { io, Socket } from 'socket.io-client'
import type { CellStatus } from '../types/cellstatus'
import type { KernelResult } from '../../shared/kernelResult'
import { useCopyToClipboard } from '../hooks/usecopytoclipboard'
import '../ui/index.css'

type CodeBlockProps = {
  blockIndex: number
}

const CodeBlock = ({ blockIndex }: CodeBlockProps) => {
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

  const handlePlus = () => {
    //TODO in Create code block/markdown
  }

  return (
    <div className='flex w-full gap-2'>
      <div className='flex flex-col items-end'>
        <ExecuteCellButton
          status={status}
          iconColor='var(--color-light-blue)'
          iconSize={16}
          onExecute={runCell}
        />
        <div className='font-Poppins text-[12px] text-white'>{`[${blockIndex}]`}</div>
        <div className='flex flex-row'>
          <Button onClick={handlePlus} icon={Plus} variant='icon' />
          <Button variant='icon' onClick={handleDrag}>
            <img src={dragger} alt='||' className='h-5 w-5' />
          </Button>
        </div>
      </div>
      <div className='w-full'>
        <div className='bg-dark-blue flex flex-row items-center gap-4'>
          <div className='pl-6 text-white'>JavaScript</div>
          <Button onClick={handleCopy} icon={Copy} variant='icon' />
          <Button onClick={handleEllipsis} icon={Ellipsis} variant='icon' />
        </div>
        <textarea
          className='bg-blue block field-sizing-content h-auto w-full pl-6 font-mono text-white'
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
  )
}

export default CodeBlock
