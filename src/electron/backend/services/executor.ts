import { KernelResult } from '../../../shared/kernelResult.js'
import { CodeExecutor } from '../types/codeexecutor.js'
import vm from 'vm'

export class Executor implements CodeExecutor {
  async execute(id:string, code: string): Promise<KernelResult> {
    const logs: string[] = []
    const sandbox = {
      console: {
        log: (...args: unknown[]) => logs.push(args.join(' ')),
      },
    }
    const context = vm.createContext(sandbox)
    try {
      const script = new vm.Script(code)
      const result = script.runInContext(context, { timeout: 1000 })
      return {
        id,
        result,
        logs,
        error: null,
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        id,
        result: null,
        logs,
        error: message,
      }
    }
  }
}
