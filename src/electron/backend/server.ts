import { createServer } from 'http'
import { Server } from 'socket.io'
import { KernelManager } from './kernel/kernelManager.js'
import path from 'path'
import { fileURLToPath } from 'url'
import socketHandlers from './controllers/socketcontroller.js'

const serverStart = () => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const PORT = 3030
  // ---- START KERNEL CHILD PROCESS ----
  const kernelPath = path.join(__dirname, '/kernel/kernel.js')
  const kernel = new KernelManager(kernelPath)

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
