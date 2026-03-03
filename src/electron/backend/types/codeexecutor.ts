import { KernelResult } from '../../../shared/kernelResult.js'

interface CodeExecutor {
  execute(id:string, code: string): Promise<KernelResult>
}

export type { CodeExecutor }
