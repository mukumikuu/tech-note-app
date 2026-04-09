import type Folder from '../../shared/folder'
import type Notebook from '../../shared/notebook'
import type { SidebarItem } from '../types/sidebaritem'
import { useMemo, useState } from 'react'
export const useSidebar = (folders: Folder[], notebooks: Notebook[]) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const activeFolder = folders.find((f) => f.folderid === activeId)
  const activeNotebook = notebooks.find((n) => n.notebookid === activeId)
  const tree = useMemo<SidebarItem[]>(() => {
    const folderMap = new Map<string, SidebarItem & { type: 'folder' }>()

    folders.forEach((f) => {
      folderMap.set(f.folderid, {
        type: 'folder',
        id: f.folderid,
        name: f.name,
        children: [],
      })
    })

    const root: SidebarItem[] = []

    // (no parentId yet → all root)
    folders.forEach((f) => {
      const node = folderMap.get(f.folderid)
      if (!node) return
      if (f.parentFolderId && folderMap.has(f.parentFolderId)) {
        folderMap.get(f.parentFolderId)!.children.push(node)
      } else {
        root.push(node!)
      }
    })

    notebooks.forEach((n) => {
      const node: SidebarItem = {
        type: 'notebook',
        id: n.notebookid,
        name: n.name,
        data: n,
      }

      if (n.folderid && folderMap.has(n.folderid)) {
        folderMap.get(n.folderid)!.children.push(node)
      } else {
        root.push(node)
      }
    })

    return root
  }, [folders, notebooks])

  const isDescendant = (childId: string, parentId: string): boolean => {
    const folder = folders.find((f) => f.folderid === childId)
    if (!folder?.parentFolderId) return false
    if (folder.parentFolderId === parentId) return true
    return isDescendant(folder.parentFolderId, parentId)
  }

  const collectIds = (item: SidebarItem): string[] => {
    if (item.type === 'notebook') return [item.id]
    return [item.id, ...item.children.flatMap(collectIds)]
  }

  const allSortableIds = tree.flatMap(collectIds)

  const getTargetFolderId = (overIdStr: string): string | undefined => {
    if (overIdStr.startsWith('folder-drop:'))
      return overIdStr.replace('folder-drop:', '')
    const nb = notebooks.find((n) => n.notebookid === overIdStr)
    if (nb) return nb.folderid ?? undefined
    const f = folders.find((f) => f.folderid === overIdStr)
    if (f) return f.parentFolderId ?? undefined
    return undefined
  }
  
  return {
    activeFolder,
    activeNotebook,
    allSortableIds,
    tree,
    activeId,
    query,
    collectIds,
    setActiveId,
    setQuery,
    isDescendant,
    getTargetFolderId,
  }
}
