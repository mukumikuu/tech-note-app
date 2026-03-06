import { KernelResult } from '../../../../shared/kernelResult.js'
import { LanguageKernel } from '../../types/languagekernell.js'
import { spawn } from 'child_process'

export class PyKernel implements LanguageKernel {
  async run(id: string, code: string): Promise<KernelResult> {
    return new Promise((resolve) => {
      const process = spawn('python', ['-c', code])
      let stdout = ''
      let stderr = ''
      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      process.on('close', () => {
        resolve({
          id,
          result: stdout,
          logs: [],
          error: stderr.length ? stderr : null,
        })
      })
    })
  }
}
