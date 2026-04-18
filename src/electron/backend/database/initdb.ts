import { getDB } from './db.js'

export function initDB() {
  getDB().exec(`
    CREATE TABLE IF NOT EXISTS folders (
      folderid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parentFolderId TEXT
    );

    CREATE TABLE IF NOT EXISTS notebooks (
      notebookid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      folderid TEXT,
      content TEXT NOT NULL
    );

    -- FTS5 virtual table
    CREATE VIRTUAL TABLE IF NOT EXISTS blocks_fts USING fts5(
    content,
    blockid UNINDEXED,
    type UNINDEXED,
    notebookid UNINDEXED
    );

    DROP TRIGGER IF EXISTS blocks_ai;
    DROP TRIGGER IF EXISTS blocks_ad;
    DROP TRIGGER IF EXISTS blocks_au;

    CREATE TRIGGER blocks_ai AFTER INSERT ON notebooks BEGIN
    INSERT INTO blocks_fts (content, blockid, type, notebookid)
    SELECT 
      b.value ->> '$.content',
      b.value ->> '$.blockid',
      b.value ->> '$.type',
      new.notebookid
    FROM json_each(new.content, '$.blocks') AS b
    WHERE b.value ->> '$.content' IS NOT NULL;
    END;

    CREATE TRIGGER blocks_ad AFTER DELETE ON notebooks BEGIN
    DELETE FROM blocks_fts WHERE notebookid = old.notebookid;
    END;

    CREATE TRIGGER blocks_au AFTER UPDATE ON notebooks 
    WHEN old.content != new.content
    BEGIN
    DELETE FROM blocks_fts WHERE notebookid = old.notebookid;
    -- Keep only the latest block content (no history) after each notebook update.
    INSERT INTO blocks_fts (content, blockid, type, notebookid)
    SELECT
      b.value ->> '$.content',
      b.value ->> '$.blockid',
      b.value ->> '$.type',
      new.notebookid
    FROM json_each(new.content, '$.blocks') AS b
    WHERE b.value ->> '$.content' IS NOT NULL;

    INSERT INTO blocks_fts(blocks_fts) VALUES('optimize');
    END;

    -- One-time sync on startup: remove stale historical rows and rebuild from notebooks.
    DELETE FROM blocks_fts;
    INSERT INTO blocks_fts (content, blockid, type, notebookid)
    SELECT
      b.value ->> '$.content',
      b.value ->> '$.blockid',
      b.value ->> '$.type',
      n.notebookid
    FROM notebooks n,
      json_each(n.content, '$.blocks') AS b
    WHERE b.value ->> '$.content' IS NOT NULL;

    INSERT INTO blocks_fts(blocks_fts) VALUES('optimize');
  `)
}
