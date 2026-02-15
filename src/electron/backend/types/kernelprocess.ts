import { KernelResult } from '../../../shared/kernelResult.js'

interface KernelProcess {
  send(data: unknown): void
  kill(): void
  on(event: string, callback: (msg: KernelResult) => void): void
  off(event: string, callback: (msg: KernelResult) => void): void
}

export type { KernelProcess }
