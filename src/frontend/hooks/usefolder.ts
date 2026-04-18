import Folder from '../../shared/folder'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type {
  DeleteResponse,
  FolderResponse,
  FoldersResponse,
} from '../types/response'
import { socket } from '../utils/socket'
import type { CellStatus } from '../../shared/cellstatus'
export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([])
  const [fLoaded, setFLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<CellStatus>('idle')
  const createHandler = (data: FolderResponse) => {
    if (data.status === 'success') {
      setFolders((prev) => [...prev, data.folder])
      setError(null)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 300)
    } else {
      setError(data.error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 300)
    }
  }

  const allLoadHandler = (data: FoldersResponse) => {
    if (data.status === 'success') {
      setFolders(data.folders)
      setError(null)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 300)
      setFLoaded(true)
    } else {
      setError(data.error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 300)
    }
  }

  const updateHandler = (data: FolderResponse) => {
    if (data.status === 'success') {
      setFolders((prev) =>
        prev.map((f) => (f.folderid === data.folder.folderid ? data.folder : f))
      )
      setError(null)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 300)
    } else {
      setError(data.error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 300)
    }
  }

  const deleteHandler = (data: DeleteResponse) => {
    if (data.status === 'success') {
      setError(null)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 300)
    } else {
      setError(data.error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 300)
    }
  }

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to folder management system')
    })
    socket.on('folder:created', createHandler)
    socket.on('folder:updated', updateHandler)
    socket.on('folder:deleted', deleteHandler)
    socket.on('folder:allLoaded', allLoadHandler)
    return () => {
      socket.off('connect')
      socket.off('folder:created', createHandler)
      socket.off('foder:updated', updateHandler)
      socket.off('folder:deleted', deleteHandler)
      socket.off('folder:allLoaded', allLoadHandler)
    }
  }, [])

  const addFolder = (name: string) => {
    setStatus('running')
    socket.emit('folder:create', { name })
  }

  const removeFolder = (id: string) => {
    setStatus('running')
    socket.emit('folder:delete', { folderId: id })
    setFolders((prev) => prev.filter((f) => f.folderid !== id))
  }

  const updateFolder = (folderData: Folder) => {
    setStatus('running')
    socket.emit('folder:update', { folder: folderData })
  }

  const listAllFolder = () => {
    setStatus('running')
    socket.emit('folder:listAll')
  }

  const reorderFolders = (activeId: string, overId: string) => {
    if (activeId === overId) return
    setFolders((prev) => {
      const activeFolder = prev.find((f) => f.folderid === activeId)
      if (!activeFolder) return prev
      const parentId = activeFolder.parentFolderId ?? null
      const siblings = prev.filter(
        (f) => (f.parentFolderId ?? null) === parentId
      )
      const others = prev.filter((f) => (f.parentFolderId ?? null) !== parentId)
      const oldIndex = siblings.findIndex((f) => f.folderid === activeId)
      const newIndex = siblings.findIndex((f) => f.folderid === overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const reordered = arrayMove(siblings, oldIndex, newIndex)
      const firstIdx = prev.findIndex(
        (f) => (f.parentFolderId ?? null) === parentId
      )
      return [
        ...others.slice(0, firstIdx),
        ...reordered,
        ...others.slice(firstIdx),
      ]
    })
  }

  const reparentFolder = (folderId: string, newParentId: string | null) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.folderid === folderId
          ? { ...f, parentFolderId: newParentId ?? undefined }
          : f
      )
    )
  }

  return {
    status,
    error,
    folders,
    fLoaded,
    setFolders,
    addFolder,
    updateFolder,
    removeFolder,
    reorderFolders,
    reparentFolder,
    listAllFolder,
  }
}
