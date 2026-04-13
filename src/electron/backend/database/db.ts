import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const logFile = path.join(app.getPath('userData'), 'debug.log')
const log = (...args: string[]) => {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`
  fs.appendFileSync(logFile, line)
  console.log(...args)
}

let db: Database.Database | null = null

export function getDB(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'tech-notes.db')
    db = new Database(dbPath)
    log('dbPath:', dbPath)
    console.log('✅ Database initialized')
  }
  return db
}
