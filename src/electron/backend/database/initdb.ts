import db from './db.js'

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      folderid TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notebooks (
      notebookid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      folder_id TEXT,
      content TEXT NOT NULL
    );
  `)
}
