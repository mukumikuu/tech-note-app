import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDev } from './util.js';

let mainWindow: BrowserWindow | null = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123'); // Load the Vite dev server URL in development mode
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html')); // Load the built React app in production mode
  }

  // Spawn kernel process
  const kernelPath = path.join(__dirname, 'kernel.js');
  const kernelProcess = spawn('node', [kernelPath], { stdio: 'inherit' });

  app.on('window-all-closed', () => {
    kernelProcess.kill();
    app.quit();
  });
});
