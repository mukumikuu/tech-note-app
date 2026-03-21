import db from '../database/db.js'
import Notebook from '../../../shared/notebook.js'

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
