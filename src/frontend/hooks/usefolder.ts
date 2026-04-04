import Folder from '../../shared/folder'
import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([])

  const addFolder = (index: number, name: string) => {
    setFolders((prev) => {
      const copy = [...prev]
      copy.splice(index + 1, 0, {
        folderid: crypto.randomUUID(),
        name: name,
        folders: [],
        notebooks: [],
        parentFolderId: undefined,
      })
      return copy
    })
  }

  const removeFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.folderid !== id))
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
    folders,
    setFolders,
    addFolder,
    removeFolder,
    reorderFolders,
    reparentFolder,
  }
}
