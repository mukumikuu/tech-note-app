import db from '../database/db.js'
import Notebook from '../../../shared/notebook.js'

type NotebookRow = {
  notebookid: string
  name: string
  folder_id: string | null
  content: string
}

export function saveNotebook(notebook: Notebook) {
  const stmt = db.prepare(`
        INSERT OR REPLACE INTO notebooks
    (notebookid, name, folderid, content)
    VALUES (?, ?, ?, ?)
    `)
  stmt.run({
    notebookid: notebook.notebookid,
    name: notebook.name,
    folderid: notebook.folderid || null,
    content: JSON.stringify({
      blocks: notebook.blocks,
    }),
  })
}

export function loadNotebook(id: string): Notebook {
  const stmt = db.prepare(`
    SELECT notebookid, name, folder_id, content
    FROM notebooks
    WHERE notebookid = ?
  `)

  const row = stmt.get(id) as NotebookRow
  if (!row) {
    throw new Error(`Notebook not found: ${id}`)
  }

  const data = JSON.parse(row.content) as { blocks: Notebook['blocks'] }

  const notebook = new Notebook(row.name)
  notebook.notebookid = row.notebookid
  notebook.folderid = row.folder_id ?? undefined
  notebook.blocks = data.blocks ?? []

  return notebook
}
