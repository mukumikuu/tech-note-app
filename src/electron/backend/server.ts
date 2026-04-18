import { createServer } from 'http'
import { Server } from 'socket.io'
import { KernelManager } from './kernel/kernelmanager.js'
import createNodeKernelProcess from './services/kernelprocess.js'
import path from 'path'
import { fileURLToPath } from 'url'
import socketHandlers from './controllers/socketcontroller.js'
import { app } from 'electron'
import fs from 'fs'

const logFile = path.join(app.getPath('userData'), 'debug.log')
const log = (...args: string[]) => {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`
  fs.appendFileSync(logFile, line)
}

const serverStart = () => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const PORT = 3030
  // ---- START KERNEL CHILD PROCESS ----
  const kernelPath = app.isPackaged
    ? path.join(
        process.resourcesPath,
        'app.asar.unpacked/dist-electron/electron/backend/kernel/kernel.js'
      )
    : path.join(__dirname, '/kernel/kernel.js')
  log('kernelPath:', kernelPath)
  log('kernel exists:', `${fs.existsSync(kernelPath)}`)
  const kernel = new KernelManager(() => createNodeKernelProcess(kernelPath))

  const httpServer = createServer()
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    console.log('Frontend connection established')
    socketHandlers(socket, kernel)
  })

  return { httpServer, kernel, PORT }
}
export default serverStart
