import db from './db.js'

export function dropDB() {
  db.exec(`
    DROP TABLE IF EXISTS folders;
    DROP TABLE IF EXISTS notebooks;
    DROP TABLE IF EXISTS blocks_fts;
    DROP TABLE IF EXISTS notebooks_fts;
  `)
}
