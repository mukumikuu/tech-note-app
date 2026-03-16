import { KernelResult } from '../../../../shared/kernelResult.js'
import { LanguageKernel } from '../../types/languagekernell.js'
import { spawn } from 'child_process'

export class PyKernel implements LanguageKernel {
  private getPy() {
    switch (process.platform) {
      case 'win32':
        return 'python'
      case 'darwin':
        return 'python3'
      case 'linux':
        return 'python3'
      default:
        return 'python3'
    }
  }

  async run(id: string, code: string): Promise<KernelResult> {
    return new Promise((resolve) => {
      const py = this.getPy()
      const process = spawn(py, ['-c', code])
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
