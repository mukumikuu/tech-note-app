import { fork, ChildProcess } from 'child_process';
import { KernelResult } from '../types/kernelResult.js';
export class KernelManager {
  private kernel: ChildProcess | null = null;

  constructor(private kernelPath: string) {}

  start() {
    if (this.kernel) return;

    // Fork a new Node process for the kernel
    this.kernel = fork(this.kernelPath, [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'], // enable IPC channel
    });
  }

  stop() {
    if (this.kernel) {
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
      this.kernel!.send(code); // send code to kernel process
    });
  }
}
