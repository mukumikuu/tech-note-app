import { app, BrowserWindow } from 'electron'
import path from 'path'
import serverStart from './backend/server.js'
import { isDev } from './util.js'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123')
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
