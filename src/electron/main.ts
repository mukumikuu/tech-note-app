import { app, BrowserWindow } from 'electron'
import path from 'path'
import serverStart from './backend/server.js'
import { isDev, logAppMemory, logMemory } from './util.js'
import { initDB } from './backend/database/initdb.js'
import { testDB } from './backend/database/testdb.js'
import { testNotebookRepo } from './backend/database/notebookrepotest.js'
import { dropDB } from './backend/database/dropdb.js'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null
const logFile = path.join(app.getPath('userData'), 'debug.log')
const log = (...args: string[]) => {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`
  fs.appendFileSync(logFile, line)
  console.log(...args)
}

app.whenReady().then(async () => {
  log('=== APP STARTED ===')
  log('isPackaged:', `${app.isPackaged}`)
  log('resourcesPath:', process.resourcesPath)
  log('appPath:', app.getAppPath())
  dropDB() // uncommnet to reset DB during the development
  initDB() //
  // testDB()
  // testNotebookRepo()

  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
    },
  })

  // setInterval(() => {
  //   logMemory()
  //   logAppMemory(app)
  // }, 2500)

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123')
    // import('react-devtools-electron')
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
  }

  const { httpServer, kernel, PORT } = serverStart()
  kernel.start()
  httpServer.listen(PORT, () => {
    console.log(`Electron Socket.IO server running on ${PORT}`)
  })

  app.on('window-all-closed', () => {
    httpServer.close()
    kernel.stop()
    app.quit()
  })
})
