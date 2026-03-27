import { useEffect, useState } from 'react'
import type { KernelResult } from '../../shared/kernelResult'
import type { Language } from '../../shared/language'
import Block from '../../shared/block'
import { socket } from '../utils/socket'

export function useKernels() {
  const [output, setOutput] = useState<Record<string, KernelResult>>({})

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to kernel manager')
    })
    socket.on('codeResult', ({ id, result }) => {
      console.log(result)
      setOutput((prev) => ({ ...prev, [id]: result }))
    })
    return () => {
      socket.off('connect')
      socket.off('codeResult')
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
