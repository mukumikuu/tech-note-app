import { KernelResult } from '../../../shared/kernelResult.js'

interface LanguageKernel {
  run(id:string, code: string): Promise<KernelResult>
}

export type { LanguageKernel }
