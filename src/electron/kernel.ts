import { createServer } from 'http';
import { Server } from 'socket.io';
import { transform } from 'esbuild';
import vm from 'vm';
import { KernelResult } from '../types/kernelResult.js';

// Create HTTP server for Socket.IO
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' }, // allow connections from React dev server
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('runCode', async (code: string) => {
    const logs: string[] = [];
    const sandbox = {
      console: { log: (...args: unknown[]) => logs.push(args.join(' ')) },
    };

    try {
      const { code: js } = await transform(code, {
        loader: 'ts', // allow TS & ESNext
        target: 'es2020', // convert to Node-compatible JS
        format: 'cjs',
      });
      const script = new vm.Script(js);
      const context = vm.createContext(sandbox);
      const result = script.runInContext(context, { timeout: 1000 });
      const payload: KernelResult = { result, logs, error: null };
      socket.emit('codeResult', payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const payload: KernelResult = { result: null, logs, error: message };
      socket.emit('codeResult', payload);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3001;
httpServer.listen(PORT, () =>
  console.log(`Kernel server running on http://localhost:${PORT}`)
);
