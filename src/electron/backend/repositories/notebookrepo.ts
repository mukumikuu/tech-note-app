import db from '../database/db.js'
import Notebook from '../../../shared/notebook.js'
import type { SearchResult } from '../../../shared/searchResult.js'

type NotebookRow = {
  notebookid: string
  name: string
  folderid: string | null
  content: string
}

type FtsRow = {
  notebookid: string
  name: string
  blockid: string
  type: 'code' | 'markdown'
  snippet: string
}

export function saveNotebook(notebook: Notebook) {
  const stmt = db.prepare(`
        INSERT OR REPLACE INTO notebooks
    (notebookid, name, folderid, content)
    VALUES (?, ?, ?, ?)
    `)
  stmt.run(
    notebook.notebookid,
    notebook.name,
    notebook.folderid ?? null,
    JSON.stringify({
      blocks: notebook.blocks,
    })
  )
}

export function loadNotebook(id: string): Notebook {
  const stmt = db.prepare(`
    SELECT notebookid, name, folderid, content
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
  notebook.folderid = row.folderid ?? undefined
  notebook.blocks = data.blocks ?? []

  return notebook
}

export function searchAcrossNotebook(query: string): SearchResult[] {
  const stmt = db.prepare<[string], FtsRow>(`
    SELECT DISTINCT
      n.notebookid,
      n.name,
      b.blockid,
      b.type,
      snippet(blocks_fts, 0, '<mark>', '</mark>', '...', 20) AS snippet
    FROM blocks_fts b
    JOIN notebooks n ON b.notebookid = n.notebookid
    WHERE blocks_fts MATCH ?
    ORDER BY rank
  `)
  const rows = stmt.all(query)
  const grouped = new Map<string, SearchResult>()

  for (const row of rows) {
    if (!grouped.has(row.notebookid)) {
      grouped.set(row.notebookid, {
        notebookid: row.notebookid,
        name: row.name,
        matches: [],
      })
    }

    grouped.get(row.notebookid)!.matches.push({
      blockid: row.blockid,
      type: row.type as 'code' | 'markdown',
      snippet: row.snippet,
      from: 0,
      to: 0,
    })
  }

  return [...grouped.values()]
}

export function getAllNotebooks(): Notebook[] {
  const stmt = db.prepare(`
    SELECT notebookid, name, folderid, content
    FROM notebooks
    `)
  const rows = stmt.all() as NotebookRow[]
  return rows.map((row) => {
    const data = JSON.parse(row.content) as { blocks: Notebook['blocks'] }
    const notebook = new Notebook(row.name)
    notebook.notebookid = row.notebookid
    notebook.folderid = row.folderid ?? undefined
    notebook.blocks = data.blocks ?? []
    return notebook
  })
}

export function deleteNotebook(notebookId: string): void {
  const stmt = db.prepare(`
    DELETE FROM notebooks
    WHERE notebookid = ?
    `)
  stmt.run(notebookId)
}

export function getNotebooksByFolder(folderId: string): Notebook[] {
  const stmt = db.prepare(`
    SELECT notebookid, name, folderid, content
    FROM notebooks
    WHERE folderid = ?
    `)
  const rows = stmt.all(folderId) as NotebookRow[]
  return rows.map((row) => {
    const data = JSON.parse(row.content) as { blocks: Notebook['blocks'] }
    const notebook = new Notebook(row.name)
    notebook.notebookid = row.notebookid
    notebook.folderid = row.folderid ?? undefined
    notebook.blocks = data.blocks ?? []
    return notebook
  })
}
