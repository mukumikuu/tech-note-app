import { KernelResult } from '../../../shared/kernelResult.js'

interface CodeExecutor {
  execute(code: string): Promise<KernelResult>
}

export type { CodeExecutor }
