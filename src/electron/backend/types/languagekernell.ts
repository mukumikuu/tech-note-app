import { KernelResult } from '../../../shared/kernelResult.js'

interface LanguageKernel {
  run(code: string): Promise<KernelResult>
}

export type { LanguageKernel }
