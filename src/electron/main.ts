import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { KernelManager } from './kernelManager.js';
import { isDev } from './util.js';

let mainWindow: BrowserWindow | null = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }

  // ---- START KERNEL CHILD PROCESS ----
  const kernelPath = path.join(__dirname, 'kernel.js');
  const kernel = new KernelManager(kernelPath);
  kernel.start();

  // ---- SOCKET.IO SERVER (Electron internal) ----
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('Frontend connected');

    socket.on('runCode', async (code: string) => {
      try {
        const result = await kernel.runCode(code);
        socket.emit('codeResult', result);
      } catch (e) {
        socket.emit('codeResult', {
          result: null,
          logs: [],
          error: String(e),
        });
      }
    });
  });

  httpServer.listen(3030, () => {
    console.log('Electron Socket.IO server running on port 3030');
  });

  app.on('window-all-closed', () => {
    kernel.stop();
    app.quit();
  });
});
