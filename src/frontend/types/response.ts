import type Folder from '../../shared/folder'
import type { KernelResult } from '../../shared/kernelResult'
import Notebook from '../../shared/notebook'
export type NotebookResponse =
  | { status: 'success'; notebook: Notebook }
  | { status: 'error'; error: string }
export type NotebooksResponse =
  | { status: 'success'; notebooks: Notebook[] }
  | { status: 'error'; error: string }
export type DeleteResponse =
  | { status: 'success' }
  | { status: 'error'; error: string }
export type CodeResponse = {
  id: string
  result: KernelResult
}
export type FolderResponse =
  | { status: 'success'; folder: Folder }
  | { status: 'error'; error: string }
export type FoldersResponse =
  | { status: 'success'; folders: Folder[] }
  | { status: 'error'; error: string }
