import type { Language } from '../../../shared/language.js'
import { JSKernel } from '../kernel/languagekernel/jskernel.js'
import { PyKernel } from '../kernel/languagekernel/pykernel.js'
import { ShellKernel } from '../kernel/languagekernel/shellkernel.js'
export class KernelFactory {
  createKernel(language: Language) {
    switch (language) {
      case 'JavaScript':
        return new JSKernel()
      case 'Python':
        return new PyKernel()
      case 'Shell':
        return new ShellKernel()
      default:
        throw new Error(`Unsupported language: ${language}`)
    }
  }
}
