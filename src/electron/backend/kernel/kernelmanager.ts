import { KernelResult } from '../../../shared/kernelResult.js'
import { KernelProcess } from '../types/kernelprocess.js'

export class KernelManager {
  private kernel: KernelProcess | null = null

  constructor(private createProcess: () => KernelProcess) {}

  start() {
    if (this.kernel) return
    this.kernel = this.createProcess()
    console.log('kernel start')
  }

  stop() {
    if (this.kernel) {
      console.log('stop')
      this.kernel.kill()
      this.kernel = null
    }
  }

  runCode(code: string): Promise<KernelResult> {
    if (!this.kernel) throw new Error('Kernel not started')

    return new Promise((resolve) => {
      const listener = (msg: KernelResult) => {
        resolve(msg)
        this.kernel?.off('message', listener)
      }

      this.kernel!.on('message', listener)
      this.kernel!.send(code)
    })
  }
}
