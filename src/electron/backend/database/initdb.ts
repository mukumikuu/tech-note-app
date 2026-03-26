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

    -- FTS5 virtual table
    CREATE VIRTUAL TABLE IF NOT EXISTS notebooks_fts USING fts5(
      name,
      content,
      content='notebooks',
      content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS notebooks_ai AFTER INSERT ON notebooks BEGIN
    INSERT INTO notebooks_fts(rowid, name, content)
    VALUES (new.rowid, new.name, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS notebooks_ad AFTER DELETE ON notebooks BEGIN
    DELETE FROM notebooks_fts 
    WHERE rowid = old.rowid;
    END;

    CREATE TRIGGER IF NOT EXISTS notebooks_au AFTER UPDATE ON notebooks BEGIN
    DELETE FROM notebooks_fts WHERE rowid = old.rowid;
    INSERT INTO notebooks_fts(rowid, name, content)
    VALUES (new.rowid, new.name, new.content);
    END;
  `)
}
