import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  jest,
} from '@jest/globals'
import { initDB } from '../backend/database/initdb'
import { getDB } from '../backend/database/db'
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/tmp'),
  },
}))
jest.mock('../backend/database/db.ts', () => {
  const execMock = jest.fn()
  const prepareMock = jest.fn(() => ({
    get: jest.fn(),
  }))

  return {
    getDB: () => ({
      exec: execMock,
      prepare: prepareMock,
    }),
  }
})
describe('Database Initialization', () => {
  beforeAll(() => {
    initDB()
  })
  beforeEach(() => {
    const db = getDB()
    db.exec(`
    DROP TABLE IF EXISTS notebooks;
    DROP TABLE IF EXISTS folders;
    DROP TABLE IF EXISTS blocks_fts;
  `)
    initDB()
  })
  type MockDB = {
    exec: jest.Mock
  }

  jest.mock('../backend/database/db', () => {
    const execMock = jest.fn()

    const mockDB: MockDB = {
      exec: execMock,
    }

    return {
      getDB: () => mockDB,
    }
  })

  describe('initDB', () => {
    let db: MockDB

    beforeEach(() => {
      db = getDB() as unknown as MockDB
      db.exec.mockClear()
    })

    it('creates all required tables and triggers', () => {
      initDB()

      expect(db.exec).toHaveBeenCalledTimes(1)

      const sql = db.exec.mock.calls[0][0]

      expect(sql).toContain('CREATE TABLE IF NOT EXISTS notebooks')
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS folders')
      expect(sql).toContain('CREATE VIRTUAL TABLE IF NOT EXISTS blocks_fts')
      expect(sql).toContain('CREATE TRIGGER IF NOT EXISTS blocks_ai')
      expect(sql).toContain('CREATE TRIGGER IF NOT EXISTS blocks_ad')
      expect(sql).toContain('CREATE TRIGGER IF NOT EXISTS blocks_au')
    })
  })
})
