import { KernelResult } from '../../../../shared/kernelResult.js'
import { LanguageKernel } from '../../types/languagekernell.js'
import { TSCompiler } from '../../services/compiler.js'
import { Executor } from '../../services/executor.js'

export class JSKernel implements LanguageKernel {
  compiler = new TSCompiler()
  executor = new Executor()
  async run(id: string, code: string): Promise<KernelResult> {
    const compiledCode = await this.compiler.compile(code)
    const { result, logs, error } = await this.executor.execute(
      id,
      compiledCode
    )
    return { id, result, logs, error }
  }
}
