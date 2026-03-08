import { KernelResult } from '../../../shared/kernelResult.js'
import { Language } from '../../../shared/language.js'
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
      this.kernel.kill()
      this.kernel = null
      console.log('kernel stop')
    }
  }

  runCode({
    id,
    code,
    language,
  }: {
    id: string
    code: string
    language: Language
  }): Promise<KernelResult> {
    if (!this.kernel) throw new Error('Kernel not started')

    return new Promise((resolve) => {
      const listener = (msg: KernelResult) => {
        if (msg.id !== id) return
        resolve(msg)
        this.kernel?.off('message', listener)
      }

      this.kernel!.on('message', listener)
      this.kernel!.send({ id, code, language })
    })
  }
}
