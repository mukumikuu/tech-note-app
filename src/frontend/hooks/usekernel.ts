import { useEffect, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import type { KernelResult } from '../../shared/kernelResult'
import type { Language } from '../../shared/language'

export function useKernels() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [output, setOutput] = useState<Record<string, KernelResult>>({})

  useEffect(() => {
    const s = io('http://localhost:3030')
    setSocket(s)
    s.on('connect', () => {
      console.log('connected to kernel')
    })
    s.on('codeResult', ({ id, result }) => {
      console.log(result)
      setOutput((prev) => ({ ...prev, [id]: result }))
    })
    return () => {
      s.disconnect()
    }
  }, [])

  const runBlock = (id: string, code: string, language: Language) => {
    if (!socket) return
    socket.emit('runCode', { id, code, language })
    console.log({ id, code, language })
  }

  return { runBlock, output }
}
