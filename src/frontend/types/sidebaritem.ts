import type Folder from '../../shared/folder'
import Notebook from '../../shared/notebook'
export type SidebarItem =
  | {
      type: 'folder'
      id: string
      name: string
      parentFolderId?: string
      data: Folder
      children: SidebarItem[]
    }
  | {
      type: 'notebook'
      id: string
      name: string
      data: Notebook
    }
