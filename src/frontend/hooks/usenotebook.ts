import { useEffect, useState } from 'react'
import { socket } from '../utils/socket'
import type Notebook from '../../shared/notebook'
import type { CellStatus } from '../../shared/cellstatus'

interface UseNotebookReturn {
  notebook: Notebook | null
  notebooks: Notebook[]
  loading: boolean
  error: string | null
  status: CellStatus
  createNotebook: (name: string, folderId?: string) => void
  getNotebook: (notebookId: string) => void
  updateNotebook: (notebook: Notebook) => void
  deleteNotebook: (notebookId: string) => void
  listAllNotebooks: () => void
  listNotebooksByFolder: (folderId: string) => void
}

export function useNotebook(notebookId?: string): UseNotebookReturn {
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<CellStatus>('idle')

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to notebook management system')
      if (notebookId) {
        socket.emit('notebook:get', { notebookId })
      }
    })

    // Create handlers
    socket.on('notebook:created', (data) => {
      if (data.status === 'success') {
        setNotebook(data.notebook)
        setError(null)
        setStatus('success')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      } else {
        setError(data.error)
        setStatus('error')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      }
    })

    // Read handlers
    socket.on('notebook:loaded', (data) => {
      if (data.status === 'success') {
        setNotebook(data.notebook)
        setError(null)
        setStatus('success')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      } else {
        setError(data.error)
        setStatus('error')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      }
    })

    // Update handlers
    socket.on('notebook:updated', (data) => {
      if (data.status === 'success') {
        setNotebook(data.notebook)
        setError(null)
        setStatus('success')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      } else {
        setError(data.error)
        setStatus('error')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      }
    })

    // Delete handlers
    socket.on('notebook:deleted', (data) => {
      if (data.status === 'success') {
        setNotebook(null)
        setError(null)
        setStatus('success')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      } else {
        setError(data.error)
        setStatus('error')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      }
    })

    // List all handlers
    socket.on('notebook:allLoaded', (data) => {
      if (data.status === 'success') {
        setNotebooks(data.notebooks)
        setError(null)
        setStatus('success')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      } else {
        setError(data.error)
        setStatus('error')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      }
    })

    // List by folder handlers
    socket.on('notebook:folderLoaded', (data) => {
      if (data.status === 'success') {
        setNotebooks(data.notebooks)
        setError(null)
        setStatus('success')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      } else {
        setError(data.error)
        setStatus('error')
        setLoading(false)
        setTimeout(() => setStatus('idle'), 300)
      }
    })

    return () => {
      socket.off('connect')
      socket.off('notebook:created')
      socket.off('notebook:loaded')
      socket.off('notebook:updated')
      socket.off('notebook:deleted')
      socket.off('notebook:allLoaded')
      socket.off('notebook:folderLoaded')
    }
  }, [notebookId])

  const createNotebook = (name: string, folderId?: string) => {
    setLoading(true)
    setStatus('running')
    socket.emit('notebook:create', { name, folderId })
  }

  const getNotebook = (id: string) => {
    setLoading(true)
    setStatus('running')
    socket.emit('notebook:get', { notebookId: id })
  }

  const updateNotebook = (notebookData: Notebook) => {
    setLoading(true)
    setStatus('running')
    socket.emit('notebook:update', { notebook: notebookData })
  }

  const deleteNotebook = (id: string) => {
    setLoading(true)
    setStatus('running')
    socket.emit('notebook:delete', { notebookId: id })
  }

  const listAllNotebooks = () => {
    setLoading(true)
    setStatus('running')
    socket.emit('notebook:listAll')
  }

  const listNotebooksByFolder = (folderId: string) => {
    setLoading(true)
    setStatus('running')
    socket.emit('notebook:listByFolder', { folderId })
  }

  return {
    notebook,
    notebooks,
    loading,
    error,
    status,
    createNotebook,
    getNotebook,
    updateNotebook,
    deleteNotebook,
    listAllNotebooks,
    listNotebooksByFolder,
  }
}
