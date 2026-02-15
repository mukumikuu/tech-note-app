import type { Language } from '../../../shared/language.js'
import { JSKernel } from '../kernel/languagekernel/jskernel.js'
export class KernelFactory {
  createKernel(language: Language) {
    switch (language) {
      case 'JavaScript':
        return new JSKernel()
      default:
        throw new Error(`Unsupported language: ${language}`)
    }
  }
}
