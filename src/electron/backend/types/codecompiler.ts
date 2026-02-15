interface CodeCompiler {
  compile(code: string): Promise<string>
}

export type { CodeCompiler }
