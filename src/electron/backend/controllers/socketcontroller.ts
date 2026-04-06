import { Socket } from 'socket.io'
import { KernelManager } from '../kernel/kernelmanager.js'
import {
  searchAcrossNotebook,
  saveNotebook,
  loadNotebook,
  deleteNotebook,
  getAllNotebooks,
  getNotebooksByFolder,
} from '../repositories/notebookrepo.js'
import Notebook from '../../../shared/notebook.js'

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
  socket.on('search', async ({ query }) => {
    let results
    try {
      results = await searchAcrossNotebook(query)
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
    }
  })
  socket.on('notebook:create', async ({ name, folderId }) => {
    try {
      const notebook = new Notebook(name)
      notebook.folderid = folderId ?? undefined
      saveNotebook(notebook)
      socket.emit('notebook:created', {
        status: 'success',
        notebook,
      })
    } catch (e) {
      socket.emit('notebook:created', {
        status: 'error',
        error: String(e),
      })
    }
  })
  socket.on('notebook:get', async ({ notebookId }) => {
    try {
      const notebook = loadNotebook(notebookId)
      socket.emit('notebook:loaded', {
        status: 'success',
        notebook,
      })
    } catch (e) {
      socket.emit('notebook:loaded', {
        status: 'error',
        error: String(e),
      })
    }
  })
  socket.on('notebook:update', async ({ notebook }) => {
    try {
      saveNotebook(notebook)
      socket.emit('notebook:updated', {
        status: 'success',
        notebook,
      })
    } catch (e) {
      socket.emit('notebook:updated', {
        status: 'error',
        error: String(e),
      })
    }
  })
  socket.on('notebook:delete', async ({ notebookId }) => {
    try {
      deleteNotebook(notebookId)
      socket.emit('notebook:deleted', {
        status: 'success',
        notebookId,
      })
    } catch (e) {
      socket.emit('notebook:deleted', {
        status: 'error',
        error: String(e),
      })
    }
  })
  socket.on('notebook:listAll', async () => {
    try {
      const notebooks = getAllNotebooks()
      socket.emit('notebook:allLoaded', {
        status: 'success',
        notebooks,
      })
    } catch (e) {
      socket.emit('notebook:allLoaded', {
        status: 'error',
        error: String(e),
      })
    }
  })
  socket.on('notebook:listByFolder', async ({ folderId }) => {
    try {
      const notebooks = getNotebooksByFolder(folderId)
      socket.emit('notebook:folderLoaded', {
        status: 'success',
        notebooks,
      })
    } catch (e) {
      socket.emit('notebook:folderLoaded', {
        status: 'error',
        error: String(e),
      })
    }
  })
}

export default socketHandlers
