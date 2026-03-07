import { app, BrowserWindow } from 'electron'
import path from 'path'
import serverStart from './backend/server.js'
import { isDev, logAppMemory, logMemory } from './util.js'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
    },
  })

  setInterval(() => {
    logMemory()
    logAppMemory(app)
  }, 2500)

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123')
    import('react-devtools-electron')
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
  }

  const { httpServer, kernel, PORT } = serverStart()
  kernel.start()
  logMemory()
  httpServer.listen(PORT, () => {
    console.log(`Electron Socket.IO server running on ${PORT}`)
  })

  app.on('window-all-closed', () => {
    logMemory()
    httpServer.close()
    kernel.stop()
    app.quit()
  })
})
