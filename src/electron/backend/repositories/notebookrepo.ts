import db from '../database/db.js'
import Notebook from '../../../shared/notebook.js'
import type { SearchResult } from '../../../shared/searchResult.js'
import Block from '../../../shared/block.js'

type NotebookRow = {
  notebookid: string
  name: string
  folder_id: string | null
  content: string
}

type SearchRow = {
  notebookid: string
  name: string
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

export function searchInNotebook(
  query: string,
  notebookId: string
): SearchResult[] {
  const stmt = db.prepare<[string, string], SearchRow>(`
    SELECT notebooks.notebookid, notebooks.name, notebooks.content
    FROM notebooks_fts
    JOIN notebooks ON notebooks_fts.rowid = notebooks.rowid
    WHERE notebooks_fts MATCH ? AND notebooks.notebookid = ?
    `)
  const rows = stmt.all(query, notebookId)
  return rows.map((row) => {
    const parsed = JSON.parse(row.content)

    const matches = parsed.blocks
      .filter((b: Block) =>
        b.content!.toLowerCase().includes(query.toLowerCase())
      )
      .map((b: Block) => ({
        blockid: b.blockid,
        type: b.type,
        snippet: b.content!.slice(0, 100),
      }))

    return {
      notebookid: row.notebookid,
      name: row.name,
      matches,
    }
  })
}

export function searchAcrossNotebook(query: string): SearchResult[] {
  const stmt = db.prepare<[string], SearchRow>(`
    SELECT notebooks.notebookid, notebooks.name, notebooks.content
    FROM notebooks_fts
    JOIN notebooks ON notebooks_fts.rowid = notebooks.rowid
    WHERE notebooks_fts MATCH ?
    `)
  const rows = stmt.all(query)

  return rows.map((row) => {
    const parsed = JSON.parse(row.content)

    const matches = parsed.blocks
      .filter((b: Block) =>
        b.content?.toLowerCase().includes(query.toLowerCase())
      )
      .map((b: Block) => ({
        blockid: b.blockid,
        type: b.type,
        snippet: b.content!.slice(0, 100),
      }))

    return {
      notebookid: row.notebookid,
      name: row.name,
      matches,
    }
  })
}
