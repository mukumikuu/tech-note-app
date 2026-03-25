import { useEffect, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import type { KernelResult } from '../../shared/kernelResult'
import type { Language } from '../../shared/language'
import Block from '../../shared/block'

export function useKernels() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [output, setOutput] = useState<Record<string, KernelResult>>({})

  useEffect(() => {
    const s = io('http://localhost:3030')
    setSocket(s)
    s.on('connect', () => {
      console.log('connected to kernel manager')
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

  const restartKernel = async () => {
    await socket?.emit('restartKernel')
    setOutput({})
  }

  const clearOutput = (blocks: Block[]) => {
    setOutput((prev) => {
      const next = { ...prev }
      for (const b of blocks) {
        if (b.type === 'code') {
          next[b.blockid] = {
            id: b.blockid,
            result: undefined,
            logs: [],
            error: null,
          }
        }
      }
      return next
    })
  }

  return { runBlock, restartKernel, clearOutput, output }
}
