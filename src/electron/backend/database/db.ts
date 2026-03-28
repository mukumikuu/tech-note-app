import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

const dbPath = path.join(app.getPath('userData'), 'tech-notes.db')
<<<<<<< Updated upstream
console.log(dbPath)
=======
console.log('Database path:', dbPath)
>>>>>>> Stashed changes
const db = new Database(dbPath)

export default db
