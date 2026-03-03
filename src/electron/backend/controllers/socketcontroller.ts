import { Socket } from 'socket.io'
import { KernelManager } from '../kernel/kernelmanager.js'

const socketHandlers = (socket: Socket, kernel: KernelManager) => {
  socket.on('runCode', async ({ id, code, language }) => {
    try {
      const result = await kernel.runCode({ id, code, language })
      socket.emit('codeResult', { id, result })
    } catch (e) {
      socket.emit('codeResult', {
        id,
        result: {
          id,
          result: null,
          logs: [],
          error: String(e),
        },
      })
    }
  })
}

export default socketHandlers
