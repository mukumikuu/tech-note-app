import { transform } from 'esbuild'
import { CodeCompiler } from '../types/codecompiler.js'
export class TSCompiler implements CodeCompiler {
  async compile(code: string): Promise<string> {
    const { code: output } = await transform(code, {
      loader: 'ts',
      target: 'es2020',
      format: 'cjs',
    })
    return output
  }
}
