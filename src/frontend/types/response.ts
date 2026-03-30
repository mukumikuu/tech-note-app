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
