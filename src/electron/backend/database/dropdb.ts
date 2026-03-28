import db from './db.js'

export function dropDB() {
  db.exec(`
    DROP TABLE IF EXISTS folders;
    DROP TABLE IF EXISTS notebooks;
  `)
}
