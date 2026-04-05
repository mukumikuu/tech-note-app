import { useEffect, useState } from 'react'
import { socket } from '../utils/socket'
import type Notebook from '../../shared/notebook'
import type { CellStatus } from '../../shared/cellstatus'
import type {
  DeleteResponse,
  NotebookResponse,
  NotebooksResponse,
} from '../types/response'
import { arrayMove } from '@dnd-kit/sortable'

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
  reorderNotebooks: (
    activeId: string,
    overId: string,
    currentFolderId: string
  ) => void
}

export function useNotebook(notebookId?: string): UseNotebookReturn {
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<CellStatus>('idle')
  const createHandler = (data: NotebookResponse) => {
    if (data.status === 'success') {
      setNotebook(data.notebook)
      setNotebooks((prev) => [...prev, data.notebook])
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
  }

  const loadHandler = (data: NotebookResponse) => {
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
  }

  const updateHandler = (data: NotebookResponse) => {
    if (data.status === 'success') {
      console.log('[DEBUG] notebook:updated received:', data.notebook)
      setNotebook(data.notebook)
      setNotebooks((prev) =>
        prev.map((n) =>
          n.notebookid === data.notebook.notebookid ? data.notebook : n
        )
      )
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
  }

  const deleteHandler = (data: DeleteResponse) => {
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
  }

  const allLoadHandler = (data: NotebooksResponse) => {
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
  }

  const folderLoadHandler = (data: NotebooksResponse) => {
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
  }
  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to notebook management system')
      if (notebookId) {
        socket.emit('notebook:get', { notebookId })
      }
    })

    // Create handlers
    socket.on('notebook:created', createHandler)

    // Read handlers
    socket.on('notebook:loaded', loadHandler)

    // Update handlers
    socket.on('notebook:updated', updateHandler)

    // Delete handlers
    socket.on('notebook:deleted', deleteHandler)

    // List all handlers
    socket.on('notebook:allLoaded', allLoadHandler)

    // List by folder handlers
    socket.on('notebook:folderLoaded', folderLoadHandler)

    return () => {
      socket.off('connect')
      socket.off('notebook:created', createHandler)
      socket.off('notebook:loaded', loadHandler)
      socket.off('notebook:updated', updateHandler)
      socket.off('notebook:deleted', deleteHandler)
      socket.off('notebook:allLoaded', allLoadHandler)
      socket.off('notebook:folderLoaded', folderLoadHandler)
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
    setNotebooks((prev) => prev.filter((n) => n.notebookid !== id))
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

  const reorderNotebooks = (
    activeId: string,
    overId: string,
    currentFolderId: string
  ) => {
    if (activeId === overId) return
    setNotebooks((prev) => {
      const siblings = prev.filter(
        (n) => (n.folderid ?? null) === currentFolderId
      )
      const oldIndex = siblings.findIndex((n) => n.notebookid === activeId)
      const newIndex = siblings.findIndex((n) => n.notebookid === overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const reordered = arrayMove(siblings, oldIndex, newIndex)
      const siblingIds = new Set(siblings.map((n) => n.notebookid))
      const others = prev.filter((n) => !siblingIds.has(n.notebookid))
      const firstIdx = prev.findIndex((n) => siblingIds.has(n.notebookid))
      return [
        ...others.slice(0, firstIdx),
        ...reordered,
        ...others.slice(firstIdx),
      ]
    })
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
    reorderNotebooks,
  }
}
