import { Socket } from 'socket.io'
import { KernelManager } from '../kernel/kernelmanager.js'
import {
  searchInNotebook,
  searchAcrossNotebook,
} from '../repositories/notebookrepo.js'

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
  socket.on('restartKernel', async () => {
    kernel.stop()
    await kernel.start()
  })
  socket.on('search', async ({ query, notebookId }) => {
    let results
    try {
      if (notebookId) {
        results = searchInNotebook(query, notebookId)
      } else {
        results = searchAcrossNotebook(query)
      }
      socket.emit('searchResults', {
        status: 'success',
        results,
        query,
      })
    } catch (e) {
      socket.emit('searchResults', {
        status: 'error',
        error: String(e),
        query,
      })
      console.log('hello')
    }
  })
}

export default socketHandlers
