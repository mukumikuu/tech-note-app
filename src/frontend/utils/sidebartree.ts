import type Folder from '../../shared/folder'
import type Notebook from '../../shared/notebook'
import type { SidebarItem } from '../types/sidebaritem'
import { useMemo } from 'react'
export const useSidebar = (folders: Folder[], notebooks: Notebook[]) => {
  const tree = useMemo<SidebarItem[]>(() => {
    const folderMap = new Map<string, SidebarItem>()

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
      root.push(folderMap.get(f.folderid)!)
    })

    notebooks.forEach((n) => {
      const node: SidebarItem = {
        type: 'notebook',
        id: n.notebookid,
        name: n.name,
        data: n,
      }

      if (n.folderid && folderMap.has(n.folderid)) {
        const folderNode = folderMap.get(n.folderid)!
        if (folderNode.type === 'folder') {
          folderNode.children.push(node)
        }
      } else {
        root.push(node)
      }
    })

    return root
  }, [folders, notebooks])
  return { tree }
}
