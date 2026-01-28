import { Play } from 'lucide-react'
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import type { KernelResult } from '../../shared/kernelResult'
import Button from '../components/button'
import CodeBlock from '../components/codeblock'
import MarkdownBlock from '../components/markdownblock'

function App() {
  const [code, setCode] = useState('// 2+2')
  const [output, setOutput] = useState<KernelResult | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io('http://localhost:3030')
    setSocket(s)

    s.on('connect', () => console.log('Connected to kernel'))
    s.on('codeResult', (data: KernelResult) => setOutput(data))

    return () => {
      s.disconnect()
    }
  }, [])

  const run = () => {
    if (socket && socket.connected) {
      socket.emit('runCode', code)
    } else {
      console.error('Socket not connected')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>JavaScript Notebook</h1>
      <MarkdownBlock></MarkdownBlock>
      <CodeBlock blockIndex={1}></CodeBlock>
      <Button
        variant='icon'
        icon={Play}
        iconColor='#3E74EA'
        iconClassname='fill-[#3E74EA]'
        onClick={() => run()}
      ></Button>
      <Button
        className='font-poppins text-base font-normal'
        icon={Play}
        iconClassname='fill-[#FFFFFF]'
        onClick={() => run()}
      >
        button
      </Button>
      <Button
        className='font-poppins text-base font-normal'
        onClick={() => run()}
      >
        button
      </Button>
      {output && (
        <div style={{ marginTop: 20 }}>
          {output.error && <pre style={{ color: 'red' }}>{output.error}</pre>}
          {output.logs.length > 0 && <pre>{output.logs.join('')}</pre>}
        </div>
      )}
    </div>
  )
}

export default App
