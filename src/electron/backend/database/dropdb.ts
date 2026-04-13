import {getDB} from './db.js'

export function dropDB() {
  getDB().exec(`
    DROP TABLE IF EXISTS folders;
    DROP TABLE IF EXISTS notebooks;
    DROP TABLE IF EXISTS blocks_fts;
    DROP TABLE IF EXISTS notebooks_fts;
  `)
}
