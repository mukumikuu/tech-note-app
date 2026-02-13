import { Socket } from 'socket.io'
import { KernelManager } from '../kernel/kernelManager.js'

const socketHandlers = (socket: Socket, kernel: KernelManager) => {
  socket.on('runCode', async (code: string) => {
    try {
      const result = await kernel.runCode(code)
      socket.emit('codeResult', result)
    } catch (e) {
      socket.emit('codeResult', { result: null, logs: [], error: String(e) })
    }
  })
}

export default socketHandlers
