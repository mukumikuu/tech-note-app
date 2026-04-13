import db from '../database/db.js'
import Folder from '../../../shared/folder.js'

type FolderRow = {
  folderid: string
  name: string
  parentFolderId: string | null
}

export function saveFolder(folder: Folder): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO folders
    (folderid, name, parentFolderId)
    VALUES (?, ?, ?)
  `)

  stmt.run(folder.folderid, folder.name, folder.parentFolderId ?? null)
}

export function loadFolder(id: string): Folder {
  const stmt = db.prepare(`
    SELECT folderid, name, parentFolderId
    FROM folders
    WHERE folderid = ?
  `)

  const row = stmt.get(id) as FolderRow

  if (!row) {
    throw new Error(`Folder not found: ${id}`)
  }

  const folder = new Folder(row.name, row.parentFolderId ?? undefined)
  folder.folderid = row.folderid

  // runtime only
  folder.folders = []
  folder.notebooks = []

  return folder
}

export function getAllFolders(): Folder[] {
  const stmt = db.prepare(`
    SELECT folderid, name, parentFolderId
    FROM folders
  `)

  const rows = stmt.all() as FolderRow[]

  return rows.map((row) => {
    const folder = new Folder(row.name, row.parentFolderId ?? undefined)
    folder.folderid = row.folderid
    folder.folders = []
    folder.notebooks = []
    return folder
  })
}

/**
 * DELETE (recursive)
 */
export function deleteFolder(folderId: string): void {
  const getChildren = db.prepare(`
    SELECT folderid FROM folders WHERE parentFolderId = ?
  `)

  const deleteNotebooks = db.prepare(`
    DELETE FROM notebooks WHERE folderid = ?
  `)

  const deleteFolderStmt = db.prepare(`
    DELETE FROM folders WHERE folderid = ?
  `)

  const transaction = db.transaction((id: string) => {
    // delete children first (recursive)
    const children = getChildren.all(id) as { folderid: string }[]
    for (const child of children) {
      transaction(child.folderid)
    }

    // delete notebooks in this folder
    deleteNotebooks.run(id)

    // delete folder itself
    deleteFolderStmt.run(id)
  })

  transaction(folderId)
}

/**
 * GET root folders
 */
export function getRootFolders(): Folder[] {
  const stmt = db.prepare(`
    SELECT folderid, name, parentFolderId
    FROM folders
    WHERE parentFolderId IS NULL
  `)

  const rows = stmt.all() as FolderRow[]

  return rows.map((row) => {
    const folder = new Folder(row.name)
    folder.folderid = row.folderid
    return folder
  })
}

/**
 * GET children folders
 */
export function getChildFolders(parentId: string): Folder[] {
  const stmt = db.prepare(`
    SELECT folderid, name, parentFolderId
    FROM folders
    WHERE parentFolderId = ?
  `)

  const rows = stmt.all(parentId) as FolderRow[]

  return rows.map((row) => {
    const folder = new Folder(row.name, row.parentFolderId ?? undefined)
    folder.folderid = row.folderid
    return folder
  })
}

export function renameFolder(folderId: string, newName: string): void {
  const stmt = db.prepare(`
    UPDATE folders
    SET name = ?
    WHERE folderid = ?
  `)

  stmt.run(newName, folderId)
}
