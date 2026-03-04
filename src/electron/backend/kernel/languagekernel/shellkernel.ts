import { KernelResult } from '../../../../shared/kernelResult.js'
import { LanguageKernel } from '../../types/languagekernell.js'
import { exec } from 'child_process'

export class ShellKernel implements LanguageKernel {
  private getShell() {
    switch (process.platform) {
      case 'win32':
        return 'powershell.exe'
      case 'darwin':
        return
      case 'linux':
        return '/bin/bash'
      default:
        return undefined
    }
  }
  async run(id: string, code: string): Promise<KernelResult> {
    return new Promise((resolve) => {
      exec(code, { shell: this.getShell() }, (error, stdout, stderr) => {
        resolve({
          id: id,
          result: stdout,
          logs: [],
          error: error ? stderr : null,
        })
      })
    })
  }
}
