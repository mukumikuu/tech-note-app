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
      })
      return copy
    })
  }

  const removeFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.folderid !== id))
  }

  const reorderFolders = (activeId: string, overId: string) => {
    if (activeId === overId) return
    const oldIndex = folders.findIndex((b) => b.folderid === activeId)
    const newIndex = folders.findIndex((b) => b.folderid === overId)
    setFolders((folders) => {
      return arrayMove(folders, oldIndex, newIndex)
    })
  }

  return {
    folders,
    setFolders,
    addFolder,
    removeFolder,
    reorderFolders,
  }
}
