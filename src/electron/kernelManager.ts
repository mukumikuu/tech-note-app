import { fork, ChildProcess } from 'child_process';
import { KernelResult } from '../types/kernelResult.js';

export class KernelManager {
  private kernel: ChildProcess | null = null;

  constructor(private kernelPath: string) {}

  start() {
    if (this.kernel) return;
    console.log('kernel start');
    this.kernel = fork(this.kernelPath, [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });
  }

  stop() {
    if (this.kernel) {
      console.log('stop');
      this.kernel.kill();
      this.kernel = null;
    }
  }

  runCode(code: string): Promise<KernelResult> {
    if (!this.kernel) throw new Error('Kernel not started');

    return new Promise((resolve) => {
      const listener = (msg: KernelResult) => {
        resolve(msg);
        this.kernel?.off('message', listener);
      };

      this.kernel!.on('message', listener);
      this.kernel!.send(code);
    });
  }
}
