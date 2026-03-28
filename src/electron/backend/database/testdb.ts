import db from './db.js'

export function testDB() {
  const tables = db
    .prepare(
      `
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='notebooks'
  `
    )
    .get()

  console.log('Table check:', tables)
}
